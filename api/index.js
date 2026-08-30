// ==========================================
// 🎯 AGRISTACK PROXY - @badboy
// (Signature Bypass + Original Flow)
// ==========================================

const APP_CONFIG = {
    // 🔥 BASE URLS
    apiBase: 'https://updcs.agristack.gov.in/dcsag_up/crop-survey-api-beta/agristack/v1/api',
    googleBase: 'https://clients4.google.com/glm/mmap',
    firebaseBase: 'https://firebaselogging-pa.googleapis.com',
    
    // 🔥 DEVICE INFO (Captured)
    deviceModel: 'M2103K19PI',
    hardware: 'mt6833',
    device: 'camellia',
    product: 'camellia_p_in',
    manufacturer: 'Xiaomi',
    osVersion: '11',
    build: 'RP1A.200720.011',
    fingerprint: 'POCO/camellia_p_in/camellia:11/RP1A.200720.011/V12.5.3.0.RKSINXM:user/release-keys',
    appVersion: '2.17.4',
    appBuild: '300015',
    packageName: 'com.amnex.agristack',
    
    // 🔥 USER INFO (Captured from login)
    userId: '1592118',
    userType: 'SURVEYOR',
    
    // 🔥 FAKE IP
    fakeIP: '192.168.1.100'
};

// ==========================================
// 🔥 DPoP SIGNATURE HANDLER - MAIN BYPASS
// ==========================================

const DPoP_CONFIG = {
    // 🔥 DPoP Public Key (From captured requests)
    publicKey: {
        kty: 'EC',
        crv: 'P-256',
        x: 'opVRUSrk-6Mcg--IHHvuOn1oY6wMHQT5tSyRdj9BkQ4',
        y: 'bYUivIg3eudTFAWImMcLTJNE7PGPKA Rtg8_V3tI7ro'
    },
    
    // 🔥 Original DPoP Token (Capture se)
    originalToken: 'eyJ0eXAiOiJkcG9wK2p3dCIsImFsZyI6IkVTMjU2IiwiandrIjp7Imt0eSI6IkVDIiwiY3J2IjoiUC0yNTYiLCJ4Ijoib3BWUlVTcmstNk1jZy0tSUhIdnVPbjFvWTZ3TUhRVDV0U3lSZGo5QmtRNCIsInkiOiJiWVVpdklnM2V1ZFRGQVdJbU1wY0xUSk5FN1BHUEtBUnRnOF9WM3RJN3JvIn19'
};

// ==========================================
// 🎯 SIGNATURE BYPASS FUNCTION
// ==========================================

function bypassSignatureCheck(reqHeaders, reqBody, urlPath, method) {
    // 🔥 Original DPoP token use karo (Server ko verify karna hai)
    // Isko change mat karo, warna server reject karega
    
    const modifiedHeaders = { ...reqHeaders };
    
    // ✅ DPoP token original rakho
    // ✅ JWT token original rakho
    // ✅ Device fingerprint original rakho
    
    // Sirf IP aur tracking headers change karo
    const ipHeaders = ['x-forwarded-for', 'x-real-ip', 'x-client-ip', 'x-original-forwarded-for', 'forwarded', 'cf-connecting-ip', 'true-client-ip', 'x-remote-ip', 'x-remote-addr', 'remote-addr', 'remote-address', 'client-ip', 'x-true-ip'];
    ipHeaders.forEach(header => {
        if (modifiedHeaders[header]) delete modifiedHeaders[header];
    });
    modifiedHeaders['x-forwarded-for'] = APP_CONFIG.fakeIP;
    modifiedHeaders['x-real-ip'] = APP_CONFIG.fakeIP;
    
    // 🔥 IMPORTANT: DPoP aur Authorization headers MAT CHANG KARO
    // Server inhi se verify karta hai signature
    
    return modifiedHeaders;
}

// ==========================================
// 🎯 RESPONSE NORMALIZER
// ==========================================

function normalizeResponse(data) {
    if (!data || typeof data !== 'object') return data;
    const normalized = JSON.parse(JSON.stringify(data));
    
    const replaceMap = {
        'userId': APP_CONFIG.userId,
        'user_id': APP_CONFIG.userId,
        'deviceId': APP_CONFIG.deviceModel,
        'device_id': APP_CONFIG.deviceModel,
        'model': APP_CONFIG.deviceModel,
        'device': APP_CONFIG.device,
        'manufacturer': APP_CONFIG.manufacturer,
        'osVersion': APP_CONFIG.osVersion,
        'os_version': APP_CONFIG.osVersion,
        'appVersion': APP_CONFIG.appVersion,
        'app_version': APP_CONFIG.appVersion,
        'appBuild': APP_CONFIG.appBuild,
        'app_build': APP_CONFIG.appBuild,
        'ip': APP_CONFIG.fakeIP,
        'client_ip': APP_CONFIG.fakeIP
    };
    
    const replaceInObject = (obj) => {
        if (!obj || typeof obj !== 'object') return obj;
        if (Array.isArray(obj)) return obj.map(item => replaceInObject(item));
        Object.keys(obj).forEach(key => {
            if (typeof obj[key] === 'string') {
                if (replaceMap[key]) obj[key] = replaceMap[key];
                Object.keys(replaceMap).forEach(replaceKey => {
                    if (obj[key] && obj[key].includes(replaceKey)) {
                        obj[key] = obj[key].replace(replaceKey, replaceMap[replaceKey]);
                    }
                });
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                replaceInObject(obj[key]);
            }
        });
        return obj;
    };
    return replaceInObject(normalized);
}

// ==========================================
// 🛠 BUILD HEADERS - ORIGINAL FLOW RAKHO
// ==========================================

function buildHeaders(req) {
    const headers = {};
    
    // ✅ ALL ORIGINAL HEADERS COPY KARO
    if (req.headers) {
        Object.keys(req.headers).forEach(key => {
            // Sirf problematic headers hatao
            if (!['accept-encoding', 'content-length', 'host', 'connection'].includes(key.toLowerCase())) {
                headers[key] = req.headers[key];
            }
        });
    }
    
    // 🔥 INJECT KEWAL REQUIRED HEADERS (JO MISSING HO)
    if (!headers['language']) headers['language'] = 'en';
    if (!headers['userId']) headers['userId'] = APP_CONFIG.userId;
    if (!headers['Content-Type']) headers['Content-Type'] = 'application/json';
    if (!headers['User-Agent']) headers['User-Agent'] = 'okhttp/5.3.2';
    
    // 🔥 IMPORTANT: DPoP aur Authorization ORIGINAL RAKHO
    // Kuch change mat karo, nahi toh signature fail ho jayega
    
    return headers;
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
    // 🔄 DETERMINE TARGET URL
    // ==========================================
    let targetBaseUrl = APP_CONFIG.apiBase;
    
    if (cleanPath.includes('clients4.google.com') || cleanPath.includes('/glm/mmap')) {
        targetBaseUrl = APP_CONFIG.googleBase;
    } else if (cleanPath.includes('firebaselogging')) {
        targetBaseUrl = APP_CONFIG.firebaseBase;
    } else if (cleanPath.includes('updcs.agristack.gov.in')) {
        targetBaseUrl = APP_CONFIG.apiBase;
    }

    // ==========================================
    // 🔄 FORWARD REQUEST - ORIGINAL FLOW
    // ==========================================
    try {
        // 🔥 BUILD HEADERS - ORIGINAL RAKHO
        const headers = buildHeaders(req);
        
        // 🔥 SIGNATURE BYPASS - ONLY IP CHANGE
        const finalHeaders = bypassSignatureCheck(headers, req.body, urlPath, method);
        
        // Remove problematic headers
        delete finalHeaders['accept-encoding'];
        delete finalHeaders['content-length'];
        delete finalHeaders['host'];
        delete finalHeaders['connection'];

        const fetchOptions = {
            method: method,
            headers: finalHeaders,
            // 🔥 IMPORTANT: Don't modify body
            compress: false
        };

        // Handle body - ORIGINAL RAKHO
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

        // Build full URL
        let fullUrl = urlPath;
        if (!urlPath.startsWith('http')) {
            fullUrl = targetBaseUrl + urlPath;
        }

        console.log('🔄 Proxying:', method, fullUrl);

        const response = await fetch(fullUrl, fetchOptions);
        const contentType = response.headers.get('content-type') || '';

        // ==========================================
        // 📦 HANDLE RESPONSE - ORIGINAL RAKHO
        // ==========================================
        if (contentType.includes('application/json')) {
            let data = await response.json();
            
            // 🔥 ONLY NORMALIZE (Device info change mat karo)
            data = normalizeResponse(data);
            
            // ✅ ORIGINAL RESPONSE - NO MODIFICATION
            // Sirf device info normalize ki hai
            
            return res.status(response.status).json(data);
        } else {
            // Handle binary responses (Google Maps etc.)
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
