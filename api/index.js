// ==========================================
// 📺 MVVNL ATTENDANCE PROXY
// ==========================================

// ==========================================
// 🔒 CONFIG
// ==========================================
const CONFIG = {
    baseUrl: 'https://mvvnlatt.com',
    branding: '@MVVNL Premium',
    brandKeys: ['Emp_FName', 'SName', 'L_Name', 'MSG', 'DATA', 'Department', 'Designation']
};

// ==========================================
// 🚫 BLOCKED PATTERNS (Analytics/Tracking)
// ==========================================
const BLOCKED_PATTERNS = [
    'firebaseinstallations',
    'firebaseremoteconfig',
    'firebaselogging',
    'clevertap',
    'appsflyer',
    'branch.io',
    'analytics',
    'track',
    'log',
    'heartbeat',
    'impression',
    'sync',
    'event'
];

// ==========================================
// 🏷️ BRANDING FUNCTION
// ==========================================
function addBranding(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    
    const tag = ` [${CONFIG.branding}]`;
    const targetKeys = CONFIG.brandKeys;
    
    if (Array.isArray(obj)) {
        return obj.map(item => addBranding(item));
    }
    
    for (const key in obj) {
        if (typeof obj[key] === 'string' && targetKeys.includes(key)) {
            if (!obj[key].includes(CONFIG.branding)) {
                obj[key] = obj[key].trim() + tag;
            }
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            addBranding(obj[key]);
        }
    }
    
    return obj;
}

// ==========================================
// 🛡️ PLAY STORE VALIDATION BYPASS
// ==========================================
function bypassPlayStoreValidation(data) {
    if (!data || typeof data !== 'object') return data;
    
    // 🔥 PlayStoreValidation endpoint ka response modify
    if (data.STATUS === 'true' || data.STATUS === true) {
        data.STATUS = 'true';
        data.DATA = '1';  // Valid device
        return data;
    }
    
    // 🔥 CheackAppVersion - Force ACTIVE
    if (data.STATUS === 'OK' || data.STATUS === 'ERROR') {
        if (data.AndroidAppStatus) {
            data.AndroidAppStatus = 'ACTIVE';
        }
        if (data.iOSAppStatus) {
            data.iOSAppStatus = 'ACTIVE';
        }
        if (data.REGALLOW) {
            data.REGALLOW = '1';
        }
        if (data.checkGeofence !== undefined) {
            data.checkGeofence = 1;
        }
        if (data.checkLiveness) {
            data.checkLiveness = '1';
        }
        if (data.isRegImgAiOn) {
            data.isRegImgAiOn = '1';
        }
        if (data.AndroidVersion) {
            data.AndroidVersion = '50';
        }
        return data;
    }
    
    // 🔥 Login Response - Device approval bypass
    if (data.API_STATUS === 'ERROR' && data.DATA) {
        if (typeof data.DATA === 'string' && data.DATA.includes('Device Approval')) {
            data.API_STATUS = 'OK';
            data.DATA = 'Login Successfully';
            data.MSG = 'Login Successfully';
            data.COUNT = 1;
            data.REGALLOW = '1';
            // Add default data if missing
            if (!data.DATA || data.DATA === 'Your Device Approval Is successfully. Please ReLogin') {
                data.DATA = [{
                    Emp_Code: '4862',
                    Emp_FName: 'DEVESH TRIPATHI',
                    Department: 'SKILLED',
                    Designation: 'SSO-Samvida-Skilled',
                    G_Late: '27.535264',
                    G_Long: '81.473459',
                    R_meter: '10',
                    geofanceid: '5302'
                }];
            }
        }
        return data;
    }
    
    // 🔥 UserLoginNew1 - Success response fix
    if (data.API_STATUS === 'OK' && data.MSG && data.MSG.includes('Login')) {
        data.REGALLOW = '1';
        data.COUNT = 1;
        return data;
    }
    
    return data;
}

// ==========================================
// 🚀 MAIN HANDLER
// ==========================================
export default async function handler(req, res) {
    let urlPath = req.headers['x-invoke-path'] || req.url;
    const cleanPath = urlPath.split('?')[0];
    const method = req.method;

    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');

    if (method === 'OPTIONS') {
        return res.status(200).end();
    }

    // ==========================================
    // 🚫 BLOCK ANALYTICS/TRACKING
    // ==========================================
    for (const pattern of BLOCKED_PATTERNS) {
        if (cleanPath.includes(pattern)) {
            return res.status(200).json({ 
                status: true,
                data: {} 
            });
        }
    }

    // ==========================================
    // 📝 BUILD TARGET URL
    // ==========================================
    let targetUrl = CONFIG.baseUrl + urlPath;

    // ==========================================
    // 📝 BUILD HEADERS
    // ==========================================
    const headers = {};

    // Copy original headers (except hop-by-hop)
    const hopByHop = ['host', 'connection', 'content-length', 'content-encoding', 'transfer-encoding'];
    for (const [name, value] of Object.entries(req.headers || {})) {
        const lower = name.toLowerCase();
        if (!hopByHop.includes(lower) && !lower.startsWith('x-')) {
            headers[name] = Array.isArray(value) ? value.join(', ') : String(value);
        }
    }

    // Keep essential headers
    headers['accept'] = 'application/json; charset=utf-8';
    headers['content-type'] = 'application/json; charset=utf-8';
    headers['user-agent'] = req.headers['user-agent'] || 'okhttp/4.12.0';

    // ==========================================
    // 📝 GET REQUEST BODY
    // ==========================================
    let body = null;
    if (method !== 'GET' && method !== 'HEAD') {
        body = req.body;
        if (body && typeof body === 'object' && !Buffer.isBuffer(body)) {
            body = JSON.stringify(body);
        }
    }

    // ==========================================
    // 🚀 FORWARD REQUEST
    // ==========================================
    try {
        const fetchOptions = {
            method: method,
            headers: headers,
            redirect: 'manual',
        };
        if (body) {
            fetchOptions.body = body;
        }

        console.log(`🔄 ${method} ${targetUrl}`);

        const response = await fetch(targetUrl, fetchOptions);
        const responseBuffer = Buffer.from(await response.arrayBuffer());
        const contentType = response.headers.get('content-type') || '';

        // 🔥 PROCESS JSON RESPONSE
        if (contentType.includes('application/json')) {
            try {
                let data = JSON.parse(responseBuffer.toString('utf8'));
                
                // 🔥 BYPASS PLAY STORE VALIDATION
                data = bypassPlayStoreValidation(data);
                
                // 🔥 ADD BRANDING
                data = addBranding(data);
                
                const processedBuffer = Buffer.from(JSON.stringify(data), 'utf8');
                
                // Copy response headers
                for (const [key, value] of response.headers.entries()) {
                    const lower = key.toLowerCase();
                    if (!['content-encoding', 'content-length', 'transfer-encoding'].includes(lower)) {
                        res.setHeader(key, value);
                    }
                }
                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                return res.status(response.status).send(processedBuffer);
                
            } catch (e) {
                console.error('JSON Parse Error:', e.message);
                // Pass through original response
                for (const [key, value] of response.headers.entries()) {
                    const lower = key.toLowerCase();
                    if (!['content-encoding', 'content-length', 'transfer-encoding'].includes(lower)) {
                        res.setHeader(key, value);
                    }
                }
                return res.status(response.status).send(responseBuffer);
            }
        }

        // 🔥 NON-JSON RESPONSE - Pass through
        for (const [key, value] of response.headers.entries()) {
            const lower = key.toLowerCase();
            if (!['content-encoding', 'content-length', 'transfer-encoding'].includes(lower)) {
                res.setHeader(key, value);
            }
        }
        return res.status(response.status).send(responseBuffer);

    } catch (error) {
        console.error('❌ Proxy Error:', error);
        return res.status(502).json({
            success: false,
            error: 'Upstream request failed: ' + error.message
        });
    }
}
