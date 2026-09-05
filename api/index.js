// Safe transparent proxy for legitimate normal login only.
// Do not hardcode passwords, access tokens, user IDs, or premium flags.

const BASE_URL = process.env.BASE_URL ||
  "https://alright-prod-b4argqfwfdfpezfc.centralindia-01.azurewebsites.net";

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN;

if (!ALLOWED_ORIGIN) {
  throw new Error("ALLOWED_ORIGIN environment variable is required");
}

const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "host",
  "content-length"
]);

function copyRequestHeaders(source) {
  const headers = {};
  for (const [name, value] of Object.entries(source || {})) {
    const lower = name.toLowerCase();
    if (!HOP_BY_HOP.has(lower)) headers[lower] = value;
  }
  return headers;
}

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
}

function getSafePath(req) {
  const candidate = String(req.headers?.["x-invoke-path"] || req.url || "/");
  // Only accept a relative path. This prevents forwarding to an arbitrary host.
  if (!candidate.startsWith("/") || candidate.startsWith("//")) return "/";
  return candidate;
}

export default async function handler(req, res) {
  setCors(res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  const path = getSafePath(req);
  const targetUrl = new URL(path, BASE_URL).toString();
  const headers = copyRequestHeaders(req.headers);

  const options = {
    method: req.method,
    headers,
    redirect: "manual"
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    if (req.body !== undefined && req.body !== null) {
      options.body = typeof req.body === "string"
        ? req.body
        : JSON.stringify(req.body);
    }
  }

  try {
    const upstream = await fetch(targetUrl, options);

    // Forward ordinary response headers. Authentication response is unchanged.
    upstream.headers.forEach((value, name) => {
      const lower = name.toLowerCase();
      if (!HOP_BY_HOP.has(lower) && lower !== "set-cookie") {
        res.setHeader(name, value);
      }
    });

    // Preserve multiple Set-Cookie headers when the runtime supports it.
    const cookies = typeof upstream.headers.getSetCookie === "function"
      ? upstream.headers.getSetCookie()
      : [];
    if (cookies.length) res.setHeader("Set-Cookie", cookies);

    const body = await upstream.arrayBuffer();
    return res.status(upstream.status).send(Buffer.from(body));
  } catch (error) {
    console.error("Proxy error:", error);
    return res.status(502).json({
      status: false,
      error: "Upstream authentication service unavailable"
    });
  }
}
