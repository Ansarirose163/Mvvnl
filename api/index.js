// ==========================================
// 🎯 PURE ORIGINAL PROXY - AGRISTACK
// (Koi Fake Data Nahi, Sirf Forward)
// ==========================================

// ==========================================
// 📌 SIRF BASE URL DEFINE KARO
// ==========================================
const API_BASE = 'https://updcs.agristack.gov.in/dcsag_up/crop-survey-api-beta/agristack/v1/api';

// ==========================================
// 🚀 MAIN HANDLER - BINA KUCH CHANGE KIYE
// ==========================================
export default async function handler(req, res) {
    // URL path nikaalo
    let urlPath = req.headers['x-invoke-path'] || req.url;
    const method = req.method;

    // CORS headers - taaki app connect kar sake
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');

    // OPTIONS request handle karo
    if (method === 'OPTIONS') {
        return res.status(200).end();
    }

    // ==========================================
    // 🔥 ORIGINAL REQUEST FORWARD - BINA KUCH CHANGE KIYE
    // ==========================================
    try {
        // Original headers copy karo (kuch change mat karo)
        const headers = {};
        if (req.headers) {
            Object.keys(req.headers).forEach(key => {
                // Sirf ye 4 headers hatao (fetch automatically handle karega)
                if (!['accept-encoding', 'content-length', 'host', 'connection'].includes(key.toLowerCase())) {
                    headers[key] = req.headers[key];
                }
            });
        }

        // Body prepare karo (original rakho)
        const fetchOptions = {
            method: method,
            headers: headers,
            compress: false
        };

        if (method !== 'GET' && method !== 'HEAD' && req.body) {
            if (typeof req.body === 'string') {
                fetchOptions.body = req.body;
            } else if (Buffer.isBuffer(req.body)) {
                fetchOptions.body = req.body;
            } else if (typeof req.body === 'object') {
                fetchOptions.body = JSON.stringify(req.body);
                fetchOptions.headers['content-type'] = 'application/json';
            }
        }

        // Full URL banao
        let fullUrl = urlPath;
        if (!urlPath.startsWith('http')) {
            // Agar URL path hai toh base URL ke saath join karo
            fullUrl = API_BASE + urlPath;
        }

        console.log('🔄 Forwarding:', method, fullUrl);

        // 🚀 Original server pe request bhejo
        const response = await fetch(fullUrl, fetchOptions);
        const contentType = response.headers.get('content-type') || '';

        // ==========================================
        // 📦 ORIGINAL RESPONSE WAPAS BHEJO - BINA KUCH CHANGE KIYE
        // ==========================================
        if (contentType.includes('application/json')) {
            const data = await response.json();
            // ✅ BILKUL ORIGINAL RESPONSE - Kuch change nahi kiya
            return res.status(response.status).json(data);
        } else {
            // Binary data (images, files, etc.)
            const buffer = Buffer.from(await response.arrayBuffer());
            response.headers.forEach((value, key) => {
                if (!['content-encoding', 'content-length', 'transfer-encoding'].includes(key)) {
                    res.setHeader(key, value);
                }
            });
            if (contentType) res.setHeader('Content-Type', contentType);
            return res.status(response.status).send(buffer);
        }

    } catch (error) {
        console.error('❌ Proxy Error:', error);
        return res.status(500).json({
            code: 500,
            message: "Proxy Error: " + error.message
        });
    }
}
