// ==========================================
// 📺 NETFLIX PROXY - MSL AWARE
// ==========================================

// ==========================================
// 🔒 HARD-CODED NETFLIX CREDENTIALS
// ==========================================
const NETFLIX_CONFIG = {
    // 🔥 ESN - Device Identity (MSL Client Identity)
    esn: 'NFANDROID1-PXA-P-SAMSUSM-S928B-31506-0202JA72A3JBBA23MNJ42U6INDEUFEFAPKANFOJ04A8UI04N1SJMO7JR6JMQ6QLOP60A3ICK060L3UAQ5AD2BL0M0IILPEP1TNL48D29',
    esnPrefix: 'NFANDROID1-PRV-P-',
    
    // 🔥 Session
    sessionId: '730199105',
    profileGuid: 'WZFVPUH3OFDT3OOGEQJJF7H5HY',
    
    // 🔥 MSL Tokens
    netflixId: 'v%3D3%26ct%3DBgjHlOvcAxLvA1fFbbVVP2BLO1RUfJPX9VgXjSqVsl8hYsWHuYJgk8hnYYmKfCcOSfVKg-rwRR8j9fvvfbcJaONasT5Y2bWhz2vTs5a9zge3HUTTA2CAa2geeUJ9izVsxZeWvgm3wZWXOPUMsXqu84LXweGoMtDNf1zOz1TTmHEoYibyHlLvV8AcFBBhPh19SPLtBHaaEJOF3rAJg2Lvy5M5LZuDx5wK0jYmt4zP9drtl4NAUxohaJqNKU0WAZh_CTuAzRIO8dfQiOMQtMOJP9uwceQIZ1HsxDYhT-5JXk8R_wNI6sAz-OUXK2vh2PcdL-AGJ0kqdgLHhMNQloPC2Mkf30DE13lOvqEscD76rOsnPcdEuo1JCHSfXLUXeeTEEnzJTMxSTq1FhaTV98uJ8LqKvYvc8L7FpbUyCVZYVWceSl_38PUYf3quPuY0U-qiWTC4U9N7SgwZAjQGrT_Q0Esi07E2kkGPpcCBwG_ewwPtbXpF7pCv8njDArE2-IH95g8j3YHpq1DzXG_CQ-EejEQ0jV1T_eyWB0EwkfdZImwLZMKLJnaBUzJubeFQma_2EcE6IiVIvaNf7Vvo3jipYXCEz7LcMn0_Cb4-41ZqUL9TN87YLdbq3eDh-XoiQt2XN5mWcIGac7zhq0sWkdOh2JUqsWdJr3LGsRgGIg4KDDK18dLxoZ-z8m5iWQ..%26pg%3DWZFVPUH3OFDT3OOGEQJJF7H5HY%26ch%3DAQEAEAABABRUKLhTiZiZ7sXvi6EbLE_qy_k-HQHYz_M.',
    secureNetflixId: 'v%3D3%26mac%3DAQEAEQABABRUT3TscZcN3w4ozZ5srttAVkA8IqEvU5I.%26dt%3D1787458611964',
    nfvdid: 'BQFmAAEBEIxpfZGgi1LCTmydVUjRImpgznEq92nK9jNTxAbAsFGlE-dcUcUgUKmZy-RB2pTWTBhHROhKpep-dCFDDZUrAIWHAqWPfQpxSmXaqkGHK_AmL27RhB5q9SWMLIj7KKX91YYx6BtKoYy0vxbTUWBd8--D',
    
    // 🔥 App Details
    appVersion: '9.22.1',
    androidApi: '36',
    osVersion: '36',
    userAgent: 'com.netflix.mediaclient/62948 (Linux; U; Android 16; en_GB; SM-S928B; Build/BP4A.251205.006; Cronet/119.0.6045.31)',
    
    // 🔥 MSL specific
    mslHeaderFriendly: 'true',
    clientType: 'samurai',
    deviceFormFactor: 'PHONE',
    deviceMemoryLevel: 'HIGH',
    
    // Branding
    branding: '@Netflix Premium',
    fakeIP: '122.168.2.40'
};

// ==========================================
// 🏷️ BRANDING - SIRF JSON RESPONSES KE LIYE
// ==========================================
const addBranding = (obj) => {
    const tag = ` [${NETFLIX_CONFIG.branding}]`;
    const targetKeys = [
        'title', 'name', 'display_name', 'username', 'nickname',
        'text', 'label', 'heading', 'description', 'subtitle',
        'videoTitle', 'movieName', 'seriesName', 'showName'
    ];
    
    if (typeof obj === 'object' && obj !== null) {
        for (let key in obj) {
            if (typeof obj[key] === 'string' && targetKeys.includes(key)) {
                if (!obj[key].includes(NETFLIX_CONFIG.branding)) {
                    obj[key] = obj[key].trim() + tag;
                }
            } else if (typeof obj[key] === 'object') {
                addBranding(obj[key]);
            }
        }
    }
};

// ==========================================
// 🚫 BLOCKED PATTERNS
// ==========================================
const BLOCKED_PATTERNS = [
    '/log/android/cl/2',
    '/log/android/logblob/1',
    'logs.netflix.com',
    'sessions.bugsnag.com',
    'bugsnag',
    'nrdp.ws.ale.netflix.com',
    'push.prod.netflix.com'
];

// ==========================================
// 🔍 IS MSL REQUEST?
// ==========================================
const isMSLRequest = (headers) => {
    return headers['content-encoding'] === 'msl_v1' ||
           headers['x-netflix.client.android.mslrequest'] === 'true' ||
           headers['x-netflix.msl-header-friendly-client'] === 'true';
};

// ==========================================
// 🛠️ BUILD MSL HEADERS
// ==========================================
function buildHeaders(req) {
    const headers = {};
    const isMSL = isMSLRequest(req.headers);
    
    // 🔥 Essential headers from original
    const keepHeaders = [
        'content-type', 'content-encoding', 'accept', 
        'accept-encoding', 'user-agent'
    ];
    keepHeaders.forEach(key => {
        if (req.headers[key]) {
            headers[key] = req.headers[key];
        }
    });
    
    // 🔥 HARD-CODED HEADERS (Override)
    headers['x-netflix.esn'] = NETFLIX_CONFIG.esn;
    headers['x-netflix.esnprefix'] = NETFLIX_CONFIG.esnPrefix;
    headers['x-netflix.session.id'] = NETFLIX_CONFIG.sessionId;
    headers['x-netflix.androidapi'] = NETFLIX_CONFIG.androidApi;
    headers['x-netflix.appver'] = NETFLIX_CONFIG.appVersion;
    headers['x-netflix.context.app-version'] = NETFLIX_CONFIG.appVersion;
    headers['x-netflix.context.os-version'] = NETFLIX_CONFIG.osVersion;
    headers['x-netflix.deviceformfactor'] = NETFLIX_CONFIG.deviceFormFactor;
    headers['x-netflix.devicememorylevel'] = NETFLIX_CONFIG.deviceMemoryLevel;
    headers['x-netflix.zuul.brotli.allowed'] = 'true';
    headers['x-netflix.clienttype'] = NETFLIX_CONFIG.clientType;
    headers['user-agent'] = NETFLIX_CONFIG.userAgent;
    
    // 🔥 Profile GUID
    if (NETFLIX_CONFIG.profileGuid) {
        headers['x-netflix.client.current-profile-guid'] = NETFLIX_CONFIG.profileGuid;
    }
    
    // 🔥 MSL Specific Headers (if MSL request)
    if (isMSL) {
        headers['content-encoding'] = 'msl_v1';
        headers['x-netflix.msl-header-friendly-client'] = 'true';
        
        if (req.headers['x-netflix.client.request.name']) {
            headers['x-netflix.client.request.name'] = req.headers['x-netflix.client.request.name'];
        }
        if (req.headers['x-netflix.request.uuid']) {
            headers['x-netflix.request.uuid'] = req.headers['x-netflix.request.uuid'];
        }
        if (req.headers['x-netflix.client.android.mslrequest']) {
            headers['x-netflix.client.android.mslrequest'] = 'true';
        }
        if (req.headers['x-netflix.request.nqtracking']) {
            headers['x-netflix.request.nqtracking'] = req.headers['x-netflix.request.nqtracking'];
        }
        if (req.headers['x-netflix.request.routing']) {
            headers['x-netflix.request.routing'] = req.headers['x-netflix.request.routing'];
        }
        if (req.headers['x-netflix.client.request.name']) {
            headers['x-netflix.client.request.name'] = req.headers['x-netflix.client.request.name'];
        }
        // For GraphQL MSL requests
        if (req.headers['x-apollo-operation-id']) {
            headers['x-apollo-operation-id'] = req.headers['x-apollo-operation-id'];
        }
        if (req.headers['x-apollo-operation-name']) {
            headers['x-apollo-operation-name'] = req.headers['x-apollo-operation-name'];
        }
        if (req.headers['x-netflix.context.operation-name']) {
            headers['x-netflix.context.operation-name'] = req.headers['x-netflix.context.operation-name'];
        }
        if (req.headers['x-netflix.context.locales']) {
            headers['x-netflix.context.locales'] = req.headers['x-netflix.context.locales'];
        }
        if (req.headers['x-netflix.context.ui-flavor']) {
            headers['x-netflix.context.ui-flavor'] = req.headers['x-netflix.context.ui-flavor'];
        }
        if (req.headers['x-netflix-internal-volley-priority']) {
            headers['x-netflix-internal-volley-priority'] = req.headers['x-netflix-internal-volley-priority'];
        }
        if (req.headers['x-netflix.request.client.supportsgames']) {
            headers['x-netflix.request.client.supportsgames'] = 'true';
        }
        if (req.headers['x-netflix.request.client.timezoneid']) {
            headers['x-netflix.request.client.timezoneid'] = req.headers['x-netflix.request.client.timezoneid'];
        }
        if (req.headers['x-netflix.request.client.languages']) {
            headers['x-netflix.request.client.languages'] = req.headers['x-netflix.request.client.languages'];
        }
        if (req.headers['x-netflix.request.client.supportskidstop10']) {
            headers['x-netflix.request.client.supportskidstop10'] = 'true';
        }
        if (req.headers['x-netflix.request.client.context']) {
            headers['x-netflix.request.client.context'] = req.headers['x-netflix.request.client.context'];
        }
        if (req.headers['x-netflix.context.hawkins-version']) {
            headers['x-netflix.context.hawkins-version'] = req.headers['x-netflix.context.hawkins-version'];
        }
        if (req.headers['x-netflix.client.android.mslrequest']) {
            headers['x-netflix.client.android.mslrequest'] = 'true';
        }
    }
    
    // 🔥 Cookies (MSL auth ke liye)
    const cookies = [
        `nfvdid=${NETFLIX_CONFIG.nfvdid}`,
        `flwssn=db673be0-e6a1-4346-8c01-b061caaf8bdd`,
        `NetflixId=${NETFLIX_CONFIG.netflixId}`,
        `SecureNetflixId=${NETFLIX_CONFIG.secureNetflixId}`
    ];
    headers['cookie'] = cookies.join('; ');
    
    // 🔥 IP Masking
    headers['x-forwarded-for'] = NETFLIX_CONFIG.fakeIP;
    headers['x-real-ip'] = NETFLIX_CONFIG.fakeIP;
    
    // Remove problematic headers
    delete headers['host'];
    delete headers['connection'];
    delete headers['content-length'];
    
    return headers;
}

// ==========================================
// 🚀 MAIN HANDLER
// ==========================================
export default async function handler(req, res) {
    let urlPath = req.headers['x-invoke-path'] || req.url;
    const cleanPath = urlPath.split('?')[0];
    const method = req.method;

    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');

    if (method === 'OPTIONS') {
        return res.status(200).end();
    }

    // ==========================================
    // 🚫 BLOCK LOGS/WEBSOCKET
    // ==========================================
    if (BLOCKED_PATTERNS.some(p => cleanPath.includes(p))) {
        console.log(`🚫 Blocked: ${cleanPath}`);
        return res.status(200).json({ status: true });
    }

    // ==========================================
    // 🔄 DETERMINE TARGET URL
    // ==========================================
    let targetUrl;
    if (cleanPath.includes('nflxso.net') || cleanPath.includes('occ-0')) {
        targetUrl = 'https://occ-0-4409-3647.1.nflxso.net' + urlPath;
    } else if (cleanPath.includes('android.prod.cloud.netflix.com')) {
        targetUrl = 'https://android.prod.cloud.netflix.com' + urlPath;
    } else {
        targetUrl = 'https://android.prod.ftl.netflix.com' + urlPath;
    }

    // ==========================================
    // 📝 BUILD HEADERS
    // ==========================================
    const headers = buildHeaders(req);
    const isMSL = isMSLRequest(headers);

    console.log(`🔄 ${method} ${targetUrl}`);
    console.log(`📦 Is MSL: ${isMSL}`);
    console.log(`📦 Content-Encoding: ${headers['content-encoding'] || 'none'}`);

    // ==========================================
    // 🚀 FORWARD REQUEST
    // ==========================================
    try {
        const fetchOptions = {
            method: method,
            headers: headers,
        };

        // 🔥 Body handling
        if (method !== 'GET' && method !== 'HEAD' && req.body) {
            if (Buffer.isBuffer(req.body) || req.body instanceof Uint8Array) {
                // Binary/MSL body - preserve
                fetchOptions.body = req.body;
            } else if (typeof req.body === 'string') {
                fetchOptions.body = req.body;
            } else if (typeof req.body === 'object') {
                fetchOptions.body = JSON.stringify(req.body);
            }
        }

        const response = await fetch(targetUrl, fetchOptions);
        const contentType = response.headers.get('content-type') || '';
        const contentEncoding = response.headers.get('content-encoding') || '';
        
        // 🔥 MSL Response - binary/encrypted, pass through
        if (contentEncoding === 'msl_v1' || 
            contentType === 'application/octet-stream' ||
            (isMSL && response.body)) {
            
            const buffer = Buffer.from(await response.arrayBuffer());
            response.headers.forEach((value, key) => {
                if (!['content-encoding', 'content-length', 'transfer-encoding'].includes(key)) {
                    res.setHeader(key, value);
                }
            });
            if (contentEncoding) res.setHeader('content-encoding', contentEncoding);
            return res.status(response.status).send(buffer);
        }
        
        // 🔥 JSON Response
        const responseText = await response.text();
        let data;
        let isJson = false;
        
        try {
            data = JSON.parse(responseText);
            isJson = true;
        } catch (e) {
            // Not JSON - pass through
            response.headers.forEach((value, key) => {
                if (!['content-encoding', 'content-length', 'transfer-encoding'].includes(key)) {
                    res.setHeader(key, value);
                }
            });
            return res.status(response.status).send(responseText);
        }

        if (isJson && data) {
            addBranding(data);
            return res.status(response.status).json(data);
        } else {
            return res.status(response.status).send(responseText);
        }

    } catch (error) {
        console.error('❌ Proxy Error:', error);
        return res.status(500).json({
            status: false,
            error: "Proxy Error: " + error.message
        });
    }
}
