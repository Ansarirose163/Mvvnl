/*
 * Agristack transparent relay
 *
 * Authorized-use only. This relay forwards the genuine client flow to the
 * Agristack API. It does not generate, extract, cache, decode, or modify
 * credentials, request data, entitlement data, or response bodies.
 *
 * Expected deployment variables:
 *   AGRISTACK_API_URL=https://updcs.agristack.gov.in
 *   CORS_ORIGIN=https://your-authorized-frontend.example
 */

const ORIGINAL_BASE_URL = 'https://updcs.agristack.gov.in';

const CONFIG = Object.freeze({
  apiUrl: process.env.AGRISTACK_API_URL || ORIGINAL_BASE_URL,
  allowedOrigins: (process.env.CORS_ORIGIN || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean),
});

const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
  'host',
  'content-length',
  // Node fetch may transparently decompress responses. Do not forward a
  // stale compression header alongside decompressed response bytes.
  'content-encoding',
]);

const INTERNAL_HEADERS = new Set([
  'x-invoke-path',
  'x-invoke-host',
  'x-forwarded-host',
  'x-forwarded-proto',
  'x-forwarded-for',
  'x-real-ip',
]);

const AGRISTACK_PATH_PREFIX =
  '/dcsag_up/crop-survey-api-beta/agristack/';

function getHeader(req, name) {
  const value = req?.headers?.[name.toLowerCase()];
  return Array.isArray(value) ? value[0] : value;
}

function getPathAndQuery(req) {
  const parsedUrl = new URL(req.url || '/', 'http://relay.invalid');
  const queryPath = req.query?.path;

  // Vercel catch-all route: /api/[[...path]].js. The catch-all path is the
  // original Agristack path without the /api wrapper.
  if (Array.isArray(queryPath) && queryPath.length > 0) {
    const pathname = '/' + queryPath.map((part) =>
      encodeURIComponent(String(part))
    ).join('/');
    return pathname + parsedUrl.search;
  }

  if (typeof queryPath === 'string' && queryPath.length > 0) {
    const pathname = '/' + queryPath.split('/').map((part) =>
      encodeURIComponent(part)
    ).join('/');
    return pathname + parsedUrl.search;
  }

  const invokePath = getHeader(req, 'x-invoke-path');
  if (invokePath) {
    const invokeUrl = new URL(invokePath, 'http://relay.invalid');
    if (invokeUrl.origin !== 'http://relay.invalid') {
      throw new Error('Only relative paths are allowed');
    }
    return `${invokeUrl.pathname}${invokeUrl.search}`;
  }

  // Also support direct calls such as /api/dcsag_up/... and
  // /dcsag_up/... when no catch-all query is supplied.
  let pathname = parsedUrl.pathname;
  if (pathname === '/api' || pathname === '/api/') pathname = '/';
  else if (pathname.startsWith('/api/')) pathname = pathname.slice(4);
  return pathname + parsedUrl.search;
}

function isAllowedAgristackPath(pathname) {
  return pathname.startsWith(AGRISTACK_PATH_PREFIX);
}

function buildRequestHeaders(req) {
  const headers = {};

  for (const [name, value] of Object.entries(req.headers || {})) {
    const lower = name.toLowerCase();
    if (HOP_BY_HOP_HEADERS.has(lower)) continue;
    if (INTERNAL_HEADERS.has(lower)) continue;
    if (value === undefined) continue;

    // Preserve the genuine caller headers, including Cookie,
    // Authorization, Content-Type, Accept and User-Agent.
    headers[lower] = Array.isArray(value)
      ? value.join(', ')
      : String(value);
  }

  return headers;
}

function encodeParsedBody(body) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(body || {})) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      for (const item of value) params.append(key, String(item));
    } else if (typeof value === 'object') {
      params.append(key, JSON.stringify(value));
    } else {
      params.append(key, String(value));
    }
  }

  return params.toString();
}

function getBody(req, contentType) {
  if (req.method === 'GET' || req.method === 'HEAD') return undefined;

  // Prefer raw bytes when the hosting framework exposes them. This avoids
  // changing signed/encrypted/plaintext request bodies.
  if (req.rawBody !== undefined && req.rawBody !== null) {
    return Buffer.isBuffer(req.rawBody)
      ? req.rawBody
      : Buffer.from(String(req.rawBody));
  }

  const body = req.body;
  if (body === undefined || body === null || body === '') return undefined;
  if (Buffer.isBuffer(body)) return body;
  if (typeof body === 'string') return body;

  const mime = contentType.toLowerCase().split(';', 1)[0].trim();
  if (mime === 'application/x-www-form-urlencoded') {
    return encodeParsedBody(body);
  }
  if (mime === 'application/json') {
    return JSON.stringify(body);
  }

  return JSON.stringify(body);
}

function setCors(req, res) {
  const origin = getHeader(req, 'origin');
  if (!origin || !CONFIG.allowedOrigins.includes(origin)) return;

  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods',
    'GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers',
    'Content-Type, Authorization, Cookie, X-Requested-With');
  res.setHeader('Vary', 'Origin');
}

function copyResponseHeaders(upstream, res) {
  for (const [name, value] of upstream.headers.entries()) {
    const lower = name.toLowerCase();
    if (HOP_BY_HOP_HEADERS.has(lower)) continue;
    if (lower.startsWith('access-control-')) continue;
    if (lower === 'set-cookie' &&
        typeof upstream.headers.getSetCookie === 'function') {
      continue;
    }
    res.setHeader(name, value);
  }

  if (typeof upstream.headers.getSetCookie === 'function') {
    const cookies = upstream.headers.getSetCookie();
    if (cookies.length > 0) res.setHeader('set-cookie', cookies);
  }
}

export default async function handler(req, res) {
  setCors(req, res);

  if (req.method === 'OPTIONS') return res.status(204).end();

  let pathAndQuery;
  try {
    pathAndQuery = getPathAndQuery(req);
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }

  const parsed = new URL(pathAndQuery, 'http://relay.invalid');
  if (parsed.pathname === '/' || parsed.pathname === '') {
    return res.status(200).json({
      ok: true,
      relay: 'transparent',
      base_url: ORIGINAL_BASE_URL,
    });
  }

  if (!isAllowedAgristackPath(parsed.pathname)) {
    return res.status(404).json({ success: false, error: 'Route not allowed' });
  }

  const target = new URL(pathAndQuery, CONFIG.apiUrl);
  const headers = buildRequestHeaders(req);
  const body = getBody(req, headers['content-type'] || '');

  const fetchOptions = {
    method: req.method,
    headers,
    redirect: 'manual',
  };
  if (body !== undefined) fetchOptions.body = body;

  try {
    const upstream = await fetch(target, fetchOptions);
    const payload = Buffer.from(await upstream.arrayBuffer());

    // Preserve the upstream status, response headers and response bytes.
    // Never parse or rewrite JSON, tokens, cookies, or application fields.
    copyResponseHeaders(upstream, res);
    return res.status(upstream.status).send(payload);
  } catch (error) {
    // Do not log request bodies, cookies or authorization headers.
    console.error('Agristack relay upstream failure:', error.message);
    return res.status(502).json({
      success: false,
      error: 'Upstream request failed',
    });
  }
}
