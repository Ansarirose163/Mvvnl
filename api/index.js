// ==========================================
// 📺 NETFLIX PROXY - JAVASCRIPT (VERCEL)
// ==========================================

// ==========================================
// 🔒 HARD-CODED CONFIG (Capture se)
// ==========================================
const CONFIG = {
    // 🔥 Base URLs
    baseUrls: {
        'logs.netflix.com': 'https://logs.netflix.com',
        'android.prod.ftl.netflix.com': 'https://android.prod.ftl.netflix.com',
        'android.prod.cloud.netflix.com': 'https://android.prod.cloud.netflix.com',
        'occ-0-4409-3647.1.nflxso.net': 'https://occ-0-4409-3647.1.nflxso.net',
        'sessions.bugsnag.com': 'https://sessions.bugsnag.com'
    },
    
    // 🔥 Device Details
    device: {
        esn: 'NFANDROID1-PXA-P-SAMSUSM-S928B-31506-0202JA72A3JBBA23MNJ42U6INDEUFEFAPKANFOJ04A8UI04N1SJMO7JR6JMQ6QLOP60A3ICK060L3UAQ5AD2BL0M0IILPEP1TNL48D29',
        esnPrefix: 'NFANDROID1-PRV-P-',
        sessionId: '730199105',
        model: 'SM-S928B',
        osVersion: '36',
        appVersion: '9.22.1',
        androidApi: '36',
        deviceFormFactor: 'PHONE',
        deviceMemoryLevel: 'HIGH',
        profileGuid: 'WZFVPUH3OFDT3OOGEQJJF7H5HY',
        userAgent: 'com.netflix.mediaclient/62948 (Linux; U; Android 16; en_GB; SM-S928B; Build/BP4A.251205.006; Cronet/119.0.6045.31)',
        locale: 'en-IN',
        timezone: 'Asia/Calcutta',
        installerSource: 'com.google.android.packageinstaller'
    },
    
    // 🔥 Cookies
    cookies: {
        nfvdid: 'BQFmAAEBEIxpfZGgi1LCTmydVUjRImpgznEq92nK9jNTxAbAsFGlE-dcUcUgUKmZy-RB2pTWTBhHROhKpep-dCFDDZUrAIWHAqWPfQpxSmXaqkGHK_AmL27RhB5q9SWMLIj7KKX91YYx6BtKoYy0vxbTUWBd8--D',
        flwssn: 'db673be0-e6a1-4346-8c01-b061caaf8bdd',
        NetflixId: 'v%3D3%26ct%3DBgjHlOvcAxLvA1fFbbVVP2BLO1RUfJPX9VgXjSqVsl8hYsWHuYJgk8hnYYmKfCcOSfVKg-rwRR8j9fvvfbcJaONasT5Y2bWhz2vTs5a9zge3HUTTA2CAa2geeUJ9izVsxZeWvgm3wZWXOPUMsXqu84LXweGoMtDNf1zOz1TTmHEoYibyHlLvV8AcFBBhPh19SPLtBHaaEJOF3rAJg2Lvy5M5LZuDx5wK0jYmt4zP9drtl4NAUxohaJqNKU0WAZh_CTuAzRIO8dfQiOMQtMOJP9uwceQIZ1HsxDYhT-5JXk8R_wNI6sAz-OUXK2vh2PcdL-AGJ0kqdgLHhMNQloPC2Mkf30DE13lOvqEscD76rOsnPcdEuo1JCHSfXLUXeeTEEnzJTMxSTq1FhaTV98uJ8LqKvYvc8L7FpbUyCVZYVWceSl_38PUYf3quPuY0U-qiWTC4U9N7SgwZAjQGrT_Q0Esi07E2kkGPpcCBwG_ewwPtbXpF7pCv8njDArE2-IH95g8j3YHpq1DzXG_CQ-EejEQ0jV1T_eyWB0EwkfdZImwLZMKLJnaBUzJubeFQma_2EcE6IiVIvaNf7Vvo3jipYXCEz7LcMn0_Cb4-41ZqUL9TN87YLdbq3eDh-XoiQt2XN5mWcIGac7zhq0sWkdOh2JUqsWdJr3LGsRgGIg4KDDK18dLxoZ-z8m5iWQ..%26pg%3DWZFVPUH3OFDT3OOGEQJJF7H5HY%26ch%3DAQEAEAABABRUKLhTiZiZ7sXvi6EbLE_qy_k-HQHYz_M.',
        SecureNetflixId: 'v%3D3%26mac%3DAQEAEQABABRUT3TscZcN3w4ozZ5srttAVkA8IqEvU5I.%26dt%3D1787458611964'
    },
    
    // 🔥 Branding
    branding: '@Netflix Premium',
    
    // 🔥 IP Masking
    fakeIP: '122.168.2.40'
};

// ==========================================
// 🚫 BLOCKED ENDPOINTS
// ==========================================
const BLOCKED_ENDPOINTS = [
    '/logout', '/signout', '/delete', '/deactivate',
    '/unregister', '/revoke', '/terminate',
    '/auth/logout', '/auth/delete'
];

const BLOCKED_PATTERNS = [
    '/bugsnag',
    '/sessions.bugsnag',
    '/clevertap',
    '/appsflyer',
    '/branch.io'
];

// ==========================================
// 🏷️ BRANDING FUNCTION
// ==========================================
function addBranding(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    
    const tag = ` [${CONFIG.branding}]`;
    const targetKeys = [
        'title', 'name', 'display_name', 'username', 'nickname',
        'drama_name', 'show_name', 'text', 'label', 'heading',
        'description', 'subtitle', 'channel_name', 'program_name',
        'content_name', 'movie_name', 'series_name', 'video_title',
        'profile_name', 'full_name', 'displayText'
    ];
    
    if (Array.isArray(obj)) {
        return obj.map(item => addBranding(item));
    }
    
    const result = { ...obj };
    for (const key of Object.keys(result)) {
        if (typeof result[key] === 'string' && targetKeys.includes(key)) {
            if (!result[key].includes(CONFIG.branding)) {
                result[key] = result[key].trim() + tag;
            }
        } else if (typeof result[key] === 'object' && result[key] !== null) {
            result[key] = addBranding(result[key]);
        }
    }
    return result;
}

// ==========================================
// 🛡️ BUILD HEADERS
// ==========================================
function buildHeaders(req) {
    const headers = {};
    
    // Original essential headers
    const essential = ['content-type', 'accept', 'accept-charset', 'content-encoding'];
    for (const key of essential) {
        if (req.headers[key]) {
            headers[key] = req.headers[key];
        }
    }
    
    // 🔥 Hard-coded Netflix headers
    headers['Host'] = 'android.prod.ftl.netflix.com';
    headers['x-netflix.clienttype'] = 'samurai';
    headers['x-netflix.devicememorylevel'] = CONFIG.device.deviceMemoryLevel;
    headers['x-netflix.context.os-version'] = CONFIG.device.osVersion;
    headers['x-netflix.session.id'] = CONFIG.device.sessionId;
    headers['x-netflix.zuul.brotli.allowed'] = 'true';
    headers['x-netflix.context.app-version'] = CONFIG.device.appVersion;
    headers['x-netflix.context.locales'] = CONFIG.device.locale;
    headers['x-netflix.context.ui-flavor'] = 'android';
    headers['x-netflix.appver'] = CONFIG.device.appVersion;
    headers['x-netflix.esnprefix'] = CONFIG.device.esnPrefix;
    headers['x-netflix.androidapi'] = CONFIG.device.androidApi;
    headers['x-netflix.deviceformfactor'] = CONFIG.device.deviceFormFactor;
    headers['x-netflix.esn'] = CONFIG.device.esn;
    headers['x-netflix.request.attempt'] = '1';
    headers['x-netflix.client.current-profile-guid'] = CONFIG.device.profileGuid;
    headers['x-netflix.context.android.installer-source'] = CONFIG.device.installerSource;
    headers['x-netflix.request.client.timezoneid'] = CONFIG.device.timezone;
    headers['x-netflix.request.client.context'] = '{"appState":"foreground"}';
    headers['x-netflix.context.form-factor'] = 'phone';
    headers['x-netflix.request.client.supportskidstop10'] = 'true';
    headers['x-netflix.request.client.languages'] = CONFIG.device.locale;
    headers['User-Agent'] = CONFIG.device.userAgent;
    headers['Accept-Encoding'] = 'gzip, deflate, br';
    headers['x-forwarded-for'] = CONFIG.fakeIP;
    headers['x-real-ip'] = CONFIG.fakeIP;
    headers['x-client-ip'] = CONFIG.fakeIP;
    
    // Cookies
    const cookieParts = [];
    for (const [key, value] of Object.entries(CONFIG.cookies)) {
        cookieParts.push(`${key}=${value}`);
    }
    headers['Cookie'] = cookieParts.join('; ');
    
    // Default content-type
    if (!headers['content-type']) {
        headers['content-type'] = 'application/json; charset=utf-8';
    }
    if (!headers['accept']) {
        headers['accept'] = 'application/json';
    }
    
    return headers;
}

// ==========================================
// 🚀 MAIN HANDLER
// ==========================================
export default async function handler(req, res) {
    const urlPath = req.headers['x-invoke-path'] || req.url;
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
    // 🚫 BLOCK LOGOUT
    // ==========================================
    for (const endpoint of BLOCKED_ENDPOINTS) {
        if (cleanPath.includes(endpoint)) {
            return res.status(200).json({
                status: false,
                response: {
                    message: 'Logout is disabled. You are permanently logged in.'
                }
            });
        }
    }

    // ==========================================
    // 🚫 BLOCK ANALYTICS
    // ==========================================
    for (const pattern of BLOCKED_PATTERNS) {
        if (cleanPath.includes(pattern)) {
            return res.status(200).json({ status: true, data: {} });
        }
    }

    // ==========================================
    // 🔄 DETERMINE TARGET URL
    // ==========================================
    let targetUrl;
    const host = req.headers.host || '';
    
    if (cleanPath.includes('logs.netflix.com')) {
        targetUrl = 'https://logs.netflix.com' + cleanPath;
    } else if (cleanPath.includes('android.prod.ftl.netflix.com')) {
        targetUrl = 'https://android.prod.ftl.netflix.com' + cleanPath;
    } else if (cleanPath.includes('android.prod.cloud.netflix.com')) {
        targetUrl = 'https://android.prod.cloud.netflix.com' + cleanPath;
    } else if (cleanPath.includes('occ-0-4409-3647.1.nflxso.net')) {
        targetUrl = 'https://occ-0-4409-3647.1.nflxso.net' + cleanPath;
    } else {
        // Default: use the original host
        const baseHost = host.replace(/^.*\/\//, '').split('/')[0];
        targetUrl = `https://${baseHost}${cleanPath}`;
    }

    // If targetUrl doesn't have a protocol, add https://
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
        targetUrl = 'https://' + targetUrl;
    }

    // ==========================================
    // 📝 BUILD HEADERS
    // ==========================================
    const headers = buildHeaders(req);

    // Remove problematic headers
    delete headers['accept-encoding'];
    delete headers['content-length'];
    delete headers['host'];
    delete headers['connection'];

    // ==========================================
    // 🚀 FORWARD REQUEST
    // ==========================================
    try {
        const fetchOptions = {
            method: method,
            headers: headers,
            redirect: 'follow'
        };

        // Handle body
        if (method !== 'GET' && method !== 'HEAD' && req.body) {
            if (typeof req.body === 'string') {
                fetchOptions.body = req.body;
            } else if (Buffer.isBuffer(req.body)) {
                fetchOptions.body = req.body;
            } else if (typeof req.body === 'object') {
                fetchOptions.body = JSON.stringify(req.body);
            }
        }

        console.log(`🔄 ${method} ${targetUrl}`);

        const response = await fetch(targetUrl, fetchOptions);
        const contentType = response.headers.get('content-type') || '';
        
        // Read response as buffer for binary data
        const responseBuffer = await response.arrayBuffer();
        const responseText = Buffer.from(responseBuffer).toString('utf-8');
        
        // Check if JSON
        let isJson = false;
        let data = null;
        
        try {
            data = JSON.parse(responseText);
            isJson = true;
        } catch (e) {
            // Not JSON
        }

        // Forward response headers
        const headersToForward = ['content-type', 'content-encoding', 'cache-control', 
                                   'expires', 'pragma', 'vary', 'server', 'x-*'];
        response.headers.forEach((value, key) => {
            if (!['content-encoding', 'content-length', 'transfer-encoding'].includes(key)) {
                res.setHeader(key, value);
            }
        });

        // If JSON, process and add branding
        if (isJson && data) {
            data = addBranding(data);
            return res.status(response.status).json(data);
        } else {
            // Return as buffer for binary data
            return res.status(response.status).send(Buffer.from(responseBuffer));
        }

    } catch (error) {
        console.error('❌ Proxy Error:', error);
        return res.status(500).json({
            status: false,
            error: 'Proxy Error: ' + error.message
        });
    }
}
