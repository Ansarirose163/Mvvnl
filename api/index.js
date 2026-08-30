// ==========================================
// 🎯 AGRISTACK PROXY - FIXED VERSION
// ==========================================

const APP_CONFIG = {
    apiBase: 'https://updcs.agristack.gov.in/dcsag_up/crop-survey-api-beta/agristack/v1/api',
    googleBase: 'https://clients4.google.com/glm/mmap',
    firebaseBase: 'https://firebaselogging-pa.googleapis.com',
    userId: '1592118',
    fakeIP: '192.168.1.100'
};

// ==========================================
// 🚀 MAIN HANDLER
// ==========================================
export default async function handler(req, res) {
    // 🔥 FIX: URL SAHI SE LOAD KARO
    let urlPath = req.url;
    let cleanPath = urlPath.split('?')[0];
    const method = req.method;

    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');

    if (method === 'OPTIONS') {
        return res.status(200).end();
    }

    // ==========================================
    // 🔥 FIX: URL PATH CLEAN KARO
    // ==========================================
    // Agar path me "/agristack/v1/api" double hai toh fix karo
    let targetPath = cleanPath;
    
    // 🔥 IMPORTANT: /api prefix hatao agar double ho
    if (targetPath.startsWith('/api/')) {
        targetPath = targetPath.replace('/api/', '/');
    }
    
    // 🔥 FIX: Agar path me double "/agristack/v1/api" hai toh
    if (targetPath.includes('/agristack/v1/api/agristack/v1/api/')) {
        targetPath = targetPath.replace('/agristack/v1/api/agristack/v1/api/', '/agristack/v1/api/');
    }

    // ==========================================
    // 🔄 TARGET URL BUILD KARO
    // ==========================================
    let fullUrl = APP_CONFIG.apiBase + targetPath;
    
    // Agar Google/Firebase request hai toh
    if (targetPath.includes('clients4.google.com') || targetPath.includes('/glm/mmap')) {
        fullUrl = APP_CONFIG.googleBase + targetPath;
    } else if (targetPath.includes('firebaselogging')) {
        fullUrl = APP_CONFIG.firebaseBase + targetPath;
    }

    console.log('🔄 Proxying:', method, fullUrl);

    // ==========================================
    // 📦 BUILD HEADERS
    // ==========================================
    const headers = {};
    
    if (req.headers) {
        Object.keys(req.headers).forEach(key => {
            const lowerKey = key.toLowerCase();
            if (!['accept-encoding', 'content-length', 'host', 'connection'].includes(lowerKey)) {
                headers[key] = req.headers[key];
            }
        });
    }

    // Inject required headers
    if (!headers['language']) headers['language'] = 'en';
    if (!headers['userId']) headers['userId'] = APP_CONFIG.userId;
    if (!headers['Content-Type']) headers['Content-Type'] = 'application/json';
    if (!headers['User-Agent']) headers['User-Agent'] = 'okhttp/5.3.2';

    // IP masking
    headers['x-forwarded-for'] = APP_CONFIG.fakeIP;
    headers['x-real-ip'] = APP_CONFIG.fakeIP;

    // ==========================================
    // 📤 FORWARD REQUEST
    // ==========================================
    try {
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

        const response = await fetch(fullUrl, fetchOptions);
        const contentType = response.headers.get('content-type') || '';

        if (contentType.includes('application/json')) {
            let data = await response.json();
            
            // Normalize response
            if (data && typeof data === 'object') {
                if (data.userId) data.userId = APP_CONFIG.userId;
                if (data.user_id) data.user_id = APP_CONFIG.userId;
            }
            
            return res.status(response.status).json(data);
        } else {
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
