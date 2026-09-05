"use strict";

// Genuine normal-login transparent proxy for Vercel.
// This file forwards the user's own request to the authorized upstream API.
// It does not inject tokens, change identities, capture OTPs, or modify JSON.

const BASE_URL = process.env.BASE_URL ||
  "https://alright-prod-b4argqfwfdfpezfc.centralindia-01.azurewebsites.net";

// Optional for same-origin deployments. Set it only for a separate frontend origin.
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "";

const HOP_BY_HOP_HEADERS = new Set([
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

function setCorsHeaders(res) {
  if (!ALLOWED_ORIGIN) return;

  res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With, Accept"
  );
  res.setHeader("Vary", "Origin");
}

function copyRequestHeaders(input) {
  const output = {};

  for (const [name, value] of Object.entries(input || {})) {
    const lowerName = name.toLowerCase();
    if (!HOP_BY_HOP_HEADERS.has(lowerName) && value !== undefined) {
      output[lowerName] = value;
    }
  }

  return output;
}

function getRelativePath(req) {
  const rawUrl = typeof req.url === "string" && req.url.length > 0
    ? req.url
    : "/";

  // Only forward relative paths; never accept a user-supplied absolute URL.
  if (!rawUrl.startsWith("/") || rawUrl.startsWith("//")) {
    return "/";
  }

  return rawUrl;
}

function getRequestBody(req) {
  if (req.method === "GET" || req.method === "HEAD") {
    return undefined;
  }

  if (req.body === undefined || req.body === null) {
    return undefined;
  }

  if (typeof req.body === "string" || Buffer.isBuffer(req.body)) {
    return req.body;
  }

  return JSON.stringify(req.body);
}

function copyResponseHeaders(upstream, res) {
  upstream.headers.forEach((value, name) => {
    const lowerName = name.toLowerCase();

    // Set-Cookie is handled separately because it may contain multiple values.
    if (!HOP_BY_HOP_HEADERS.has(lowerName) && lowerName !== "set-cookie") {
      res.setHeader(name, value);
    }
  });

  if (typeof upstream.headers.getSetCookie === "function") {
    const cookies = upstream.headers.getSetCookie();
    if (cookies.length > 0) {
      res.setHeader("Set-Cookie", cookies);
    }
  }
}

async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (!req.method) {
    return res.status(400).json({
      status: false,
      error: "Request method is missing"
    });
  }

  let targetUrl;
  try {
    targetUrl = new URL(getRelativePath(req), BASE_URL).toString();
  } catch (error) {
    console.error("Invalid BASE_URL:", error);
    return res.status(500).json({
      status: false,
      error: "Proxy configuration is invalid"
    });
  }

  const requestOptions = {
    method: req.method,
    headers: copyRequestHeaders(req.headers),
    redirect: "manual"
  };

  const body = getRequestBody(req);
  if (body !== undefined) {
    requestOptions.body = body;
  }

  try {
    const upstream = await fetch(targetUrl, requestOptions);
    copyResponseHeaders(upstream, res);

    const responseBuffer = Buffer.from(await upstream.arrayBuffer());
    return res.status(upstream.status).send(responseBuffer);
  } catch (error) {
    console.error("Upstream proxy error:", error);
    return res.status(502).json({
      status: false,
      error: "Upstream service unavailable"
    });
  }
}
