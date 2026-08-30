// ==========================================
// 🌾 AGRISTACK PROXY - @badboy (ORIGINAL FLOW)
// ==========================================

// Target base domains (multiple)
const TARGET_DOMAINS = {
    'updcs.agristack.gov.in': 'https://updcs.agristack.gov.in',
    'firebaselogging-pa.googleapis.com': 'https://firebaselogging-pa.googleapis.com',
    'clients4.google.com': 'https://clients4.google.com',
    // Add more if needed
};

// Fallback base URL
const DEFAULT_BASE = 'https://updcs.agristack.gov.in';

export default async function handler(req, res) {
    // Get the full URL from the request (either from x-invoke-path or req.url)
    let urlPath = req.headers['x-invoke-path'] || req.url;
    // Remove query string for host detection
    const cleanPath = urlPath.split('?')[0];
    const method = req.method;

    // CORS headers for browser testing (optional)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');

    if (method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Extract host from the original request's Host header or from the URL
    let host = req.headers.host || '';
    let targetBase = DEFAULT_BASE;

    // If the request already has a full URL (e.g., from proxy), extract host
    if (urlPath.startsWith('http')) {
        try {
            const urlObj = new URL(urlPath);
            host = urlObj.hostname;
            targetBase = `${urlObj.protocol}//${urlObj.host}`;
        } catch (e) {
            // fallback
        }
    } else {
        // If using relative path, use the Host header to determine target
        // We need to map the host to the base URL
        // The host will be like updcs.agristack.gov.in
        if (host && TARGET_DOMAINS[host]) {
            targetBase = TARGET_DOMAINS[host];
        } else {
            // Try to match using the path
            for (const [domain, base] of Object.entries(TARGET_DOMAINS)) {
                if (urlPath.includes(domain)) {
                    targetBase = base;
                    break;
                }
            }
        }
    }

    // Build the full target URL
    let fullUrl;
    if (urlPath.startsWith('http')) {
        fullUrl = urlPath;
    } else {
        // Remove leading slash if any to avoid double slash
        const path = urlPath.startsWith('/') ? urlPath : '/' + urlPath;
        fullUrl = targetBase + path;
    }

    // Prepare headers: copy all original headers except those we must not forward
    const headers = {};
    for (const [key, value] of Object.entries(req.headers)) {
        const lowerKey = key.toLowerCase();
        // Skip hop-by-hop headers
        if (!['host', 'connection', 'content-length', 'transfer-encoding', 'accept-encoding'].includes(lowerKey)) {
            headers[key] = value;
        }
    }
    // Ensure Content-Type if body is present
    if (req.body && !headers['content-type']) {
        headers['content-type'] = 'application/json'; // fallback
    }

    // Prepare fetch options
    const fetchOptions = {
        method: method,
        headers: headers,
        // Do not compress to avoid issues
        compress: false,
    };

    // Add body for non-GET/HEAD
    if (method !== 'GET' && method !== 'HEAD' && req.body) {
        if (typeof req.body === 'string') {
            fetchOptions.body = req.body;
        } else if (Buffer.isBuffer(req.body)) {
            fetchOptions.body = req.body;
        } else if (typeof req.body === 'object') {
            fetchOptions.body = JSON.stringify(req.body);
            if (!headers['content-type']) {
                fetchOptions.headers['content-type'] = 'application/json';
            }
        }
    }

    try {
        // Forward the request
        const response = await fetch(fullUrl, fetchOptions);

        // Get response body
        const contentType = response.headers.get('content-type') || '';

        // Handle response
        if (contentType.includes('application/json')) {
            const data = await response.json();
            // Optional: you can inject branding here if needed, but we keep original
            // data = addBranding(data); // if you want @badboy
            return res.status(response.status).json(data);
        } else {
            // Binary or other
            const buffer = Buffer.from(await response.arrayBuffer());
            // Copy response headers
            response.headers.forEach((value, key) => {
                if (!['content-encoding', 'content-length', 'transfer-encoding'].includes(key)) {
                    res.setHeader(key, value);
                }
            });
            if (contentType) res.setHeader('Content-Type', contentType);
            return res.status(response.status).send(buffer);
        }
    } catch (error) {
        console.error('Proxy Error:', error);
        return res.status(500).json({ error: 'Proxy error', message: error.message });
    }
}
