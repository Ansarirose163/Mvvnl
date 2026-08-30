// api/[...path].js
// Pure fixed-origin relay. Use only with authorization from the upstream owner.
// Do not hard-code credentials, device IDs, or integrity tokens.

const UPSTREAM_ORIGIN = process.env.UPSTREAM_ORIGIN || 'https://mvvnlatt.com';
const REQUEST_TIMEOUT_MS = Number(process.env.REQUEST_TIMEOUT_MS || 30000);

export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
  },
};

const REQUEST_HOP_BY_HOP = new Set([
  'host',
  'connection',
  'content-length',
  'transfer-encoding',
]);

const RESPONSE_HOP_BY_HOP = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
  'content-length',
]);

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function forwardRequestHeaders(req) {
  const headers = {};
  for (const [name, value] of Object.entries(req.headers || {})) {
    if (REQUEST_HOP_BY_HOP.has(name.toLowerCase())) continue;
    headers[name] = Array.isArray(value) ? value.join(', ') : String(value);
  }
  return headers;
}

function forwardResponseHeaders(upstream, res) {
  for (const [name, value] of upstream.headers.entries()) {
    if (RESPONSE_HOP_BY_HOP.has(name.toLowerCase())) continue;
    res.setHeader(name, value);
  }
}

export default async function handler(req, res) {
  const incoming = new URL(req.url || '/', 'http://proxy.invalid');
  const upstreamUrl = new URL(incoming.pathname + incoming.search, UPSTREAM_ORIGIN);
  const body = !['GET', 'HEAD'].includes(req.method) ? await readRawBody(req) : undefined;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const upstream = await fetch(upstreamUrl, {
      method: req.method,
      headers: forwardRequestHeaders(req),
      body: body && body.length > 0 ? body : undefined,
      redirect: 'manual',
      signal: controller.signal,
    });

    const responseBody = Buffer.from(await upstream.arrayBuffer());
    forwardResponseHeaders(upstream, res);
    res.statusCode = upstream.status;
    return res.end(responseBody);
  } catch (error) {
    const timeoutError = error && error.name === 'AbortError';
    return res.status(502).json({
      error: timeoutError ? 'Upstream request timed out' : 'Upstream request failed',
    });
  } finally {
    clearTimeout(timeout);
  }
}
