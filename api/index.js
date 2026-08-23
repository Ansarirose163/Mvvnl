// ==========================================
// 📺 NETFLIX PROXY - COMPLETE
// ==========================================

// ==========================================
// 🔒 NETFLIX CONFIG (Captured se)
// ==========================================
const NETFLIX_CONFIG = {
    // Main domains
    ftlUrl: 'https://android.prod.ftl.netflix.com',
    cloudUrl: 'https://android.prod.cloud.netflix.com',
    logsUrl: 'https://logs.netflix.com',
    bugsnagUrl: 'https://sessions.bugsnag.com',
    occUrl: 'https://occ-0-4409-3647.1.nflxso.net',
    
    // 🔥 Device Details (Hard-coded)
    esn: 'NFANDROID1-PXA-P-SAMSUSM-S928B-31506-0202JA72A3JBBA23MNJ42U6INDEUFEFAPKANFOJ04A8UI04N1SJMO7JR6JMQ6QLOP60A3ICK060L3UAQ5AD2BL0M0IILPEP1TNL48D29',
    esnPrefix: 'NFANDROID1-PRV-P-',
    sessionId: '730199105',
    appVersion: '9.22.1',
    osVersion: '36',
    androidApi: '36',
    deviceModel: 'samsung_SM-S928B',
    deviceFormFactor: 'PHONE',
    deviceMemoryLevel: 'HIGH',
    chipset: 'pineappleqcom',
    
    // 🔥 User/Cookies
    nfvdid: 'BQFmAAEBEIxpfZGgi1LCTmydVUjRImpgznEq92nK9jNTxAbAsFGlE-dcUcUgUKmZy-RB2pTWTBhHROhKpep-dCFDDZUrAIWHAqWPfQpxSmXaqkGHK_AmL27RhB5q9SWMLIj7KKX91YYx6BtKoYy0vxbTUWBd8--D',
    flwssn: 'db673be0-e6a1-4346-8c01-b061caaf8bdd',
    netflixId: 'v%3D3%26ct%3DBgjHlOvcAxLvA1fFbbVVP2BLO1RUfJPX9VgXjSqVsl8hYsWHuYJgk8hnYYmKfCcOSfVKg-rwRR8j9fvvfbcJaONasT5Y2bWhz2vTs5a9zge3HUTTA2CAa2geeUJ9izVsxZeWvgm3wZWXOPUMsXqu84LXweGoMtDNf1zOz1TTmHEoYibyHlLvV8AcFBBhPh19SPLtBHaaEJOF3rAJg2Lvy5M5LZuDx5wK0jYmt4zP9drtl4NAUxohaJqNKU0WAZh_CTuAzRIO8dfQiOMQtMOJP9uwceQIZ1HsxDYhT-5JXk8R_wNI6sAz-OUXK2vh2PcdL-AGJ0kqdgLHhMNQloPC2Mkf30DE13lOvqEscD76rOsnPcdEuo1JCHSfXLUXeeTEEnzJTMxSTq1FhaTV98uJ8LqKvYvc8L7FpbUyCVZYVWceSl_38PUYf3quPuY0U-qiWTC4U9N7SgwZAjQGrT_Q0Esi07E2kkGPpcCBwG_ewwPtbXpF7pCv8njDArE2-IH95g8j3YHpq1DzXG_CQ-EejEQ0jV1T_eyWB0EwkfdZImwLZMKLJnaBUzJubeFQma_2EcE6IiVIvaNf7Vvo3jipYXCEz7LcMn0_Cb4-41ZqUL9TN87YLdbq3eDh-XoiQt2XN5mWcIGac7zhq0sWkdOh2JUqsWdJr3LGsRgGIg4KDDK18dLxoZ-z8m5iWQ..%26pg%3DWZFVPUH3OFDT3OOGEQJJF7H5HY%26ch%3DAQEAEAABABRUKLhTiZiZ7sXvi6EbLE_qy_k-HQHYz_M.',
    secureNetflixId: 'v%3D3%26mac%3DAQEAEQABABRUT3TscZcN3w4ozZ5srttAVkA8IqEvU5I.%26dt%3D1787458611964',
    profileGuid: 'WZFVPUH3OFDT3OOGEQJJF7H5HY',
    
    // 🔥 User Agent
    userAgent: 'com.netflix.mediaclient/62948 (Linux; U; Android 16; en_GB; SM-S928B; Build/BP4A.251205.006; Cronet/119.0.6045.31)',
    
    // 🔥 IP Masking
    fakeIP: '223.188.42.214',
    
    // 🔥 Branding
    branding: '@Netflix Premium'
};

// ==========================================
// 🚫 BLOCKED ENDPOINTS
// ==========================================
const BLOCKED_ENDPOINTS = [
    '/logout', '/signout', '/deactivate', '/delete',
    '/profile/delete', '/account/delete'
];

const BLOCKED_PATTERNS = [
    '/logs.netflix.com',
    '/sessions.bugsnag.com',
    '/bugsnag',
    '/analytics', '/track', '/log',
    '/heartbeat', '/impression', '/sync'
];

// ==========================================
// 🏷️ BRANDING FUNCTION
// ==========================================
const addBranding = (obj) => {
    const tag = ` [${NETFLIX_CONFIG.branding}]`;
    const targetKeys = [
        'title', 'name', 'display_name', 'username',
        'text', 'label', 'heading', 'description',
        'subtitle', 'content_name', 'movie_name',
        'series_name', 'video_title', 'show_name'
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
// 🎯 VIP SPOOF
// ==========================================
const spoofVIP = (data) => {
    if (!data || typeof data !== 'object') return data;
    
    // Account mein subscription add
    if (data.data && data.data.account) {
        const account = data.data.account;
        account.isSubscribed = true;
        account.subscriptionStatus = 'active';
        account.packageType = 'premium';
        account.planName = 'Netflix Premium 4K';
        account.planDuration = 'Monthly';
        account.validity = 'Lifetime Unlimited';
        account.isTrial = false;
    }
    
    // User marks/add to list
    if (data.data && data.data.addToMyList) {
        data.data.addToMyList = {
            success: true,
            message: "Added to your list"
        };
    }
    
    return data;
};

// ==========================================
// 🛡️ BUILD HEADERS
// ==========================================
function buildHeaders(req, targetUrl) {
    const headers = {};
    
    // Copy essential original headers
    if (req.headers) {
        const essential = ['content-type', 'accept', 'accept-encoding', 
                          'x-netflix-zuul-brotli-allowed'];
        essential.forEach(key => {
            if (req.headers[key]) {
                headers[key] = req.headers[key];
            }
        });
    }
    
    // 🔥 Netflix Headers
    headers['x-netflix.clienttype'] = 'samurai';
    headers['x-netflix.context.os-version'] = NETFLIX_CONFIG.osVersion;
    headers['x-netflix.devicememorylevel'] = NETFLIX_CONFIG.deviceMemoryLevel;
    headers['x-netflix.session.id'] = NETFLIX_CONFIG.sessionId;
    headers['x-netflix.zuul.brotli.allowed'] = 'true';
    headers['x-netflix.context.app-version'] = NETFLIX_CONFIG.appVersion;
    headers['x-netflix.context.locales'] = 'en-IN';
    headers['x-netflix.context.ui-flavor'] = 'android';
    headers['x-netflix.request.client.supportsgames'] = 'true';
    headers['x-netflix.appver'] = NETFLIX_CONFIG.appVersion;
    headers['x-netflix.esnprefix'] = NETFLIX_CONFIG.esnPrefix;
    headers['x-netflix.androidapi'] = NETFLIX_CONFIG.androidApi;
    headers['x-netflix.deviceformfactor'] = NETFLIX_CONFIG.deviceFormFactor;
    headers['x-netflix.esn'] = NETFLIX_CONFIG.esn;
    headers['x-netflix.request.attempt'] = '1';
    headers['x-netflix.client.current-profile-guid'] = NETFLIX_CONFIG.profileGuid;
    
    // Cookie
    headers['cookie'] = `nfvdid=${NETFLIX_CONFIG.nfvdid}; flwssn=${NETFLIX_CONFIG.flwssn}; NetflixId=${NETFLIX_CONFIG.netflixId}; SecureNetflixId=${NETFLIX_CONFIG.secureNetflixId}`;
    
    // User Agent
    headers['user-agent'] = NETFLIX_CONFIG.userAgent;
    
    // IP Masking
    headers['x-forwarded-for'] = NETFLIX_CONFIG.fakeIP;
    headers['x-real-ip'] = NETFLIX_CONFIG.fakeIP;
    
    // Content
    if (!headers['content-type']) {
        headers['content-type'] = 'application/json';
    }
    
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
    // 🚫 BLOCK LOGOUT
    // ==========================================
    if (BLOCKED_ENDPOINTS.some(e => cleanPath.includes(e))) {
        return res.status(200).json({
            status: 'success',
            data: {
                message: "Logout is disabled. You are permanently logged in."
            }
        });
    }

    // ==========================================
    // 🚫 BLOCK LOGS/ANALYTICS
    // ==========================================
    if (BLOCKED_PATTERNS.some(p => cleanPath.includes(p))) {
        // Logs ko success return karo
        if (cleanPath.includes('logs.netflix.com')) {
            return res.status(200).send('');
        }
        // Bugsnag ko accepted return
        if (cleanPath.includes('bugsnag') || cleanPath.includes('sessions.bugsnag')) {
            return res.status(202).json({ status: 'accepted' });
        }
        return res.status(200).json({ status: true });
    }

    // ==========================================
    // 🔄 DETERMINE TARGET URL
    // ==========================================
    let targetUrl;
    if (cleanPath.includes('android.prod.ftl.netflix.com')) {
        targetUrl = NETFLIX_CONFIG.ftlUrl + urlPath;
    } else if (cleanPath.includes('android.prod.cloud.netflix.com')) {
        targetUrl = NETFLIX_CONFIG.cloudUrl + urlPath;
    } else if (cleanPath.includes('logs.netflix.com')) {
        targetUrl = NETFLIX_CONFIG.logsUrl + urlPath;
    } else if (cleanPath.includes('sessions.bugsnag.com')) {
        targetUrl = NETFLIX_CONFIG.bugsnagUrl + urlPath;
    } else if (cleanPath.includes('occ-0-4409-3647.1.nflxso.net')) {
        targetUrl = NETFLIX_CONFIG.occUrl + urlPath;
    } else {
        // Fallback - try all
        targetUrl = NETFLIX_CONFIG.ftlUrl + urlPath;
    }

    // ==========================================
    // 📝 BUILD HEADERS
    // ==========================================
    const headers = buildHeaders(req, targetUrl);

    // Remove problematic headers
    delete headers['host'];
    delete headers['connection'];
    delete headers['content-length'];

    // ==========================================
    // 🚀 FORWARD REQUEST
    // ==========================================
    try {
        const fetchOptions = {
            method: method,
            headers: headers,
        };

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
        
        const responseText = await response.text();
        
        let data;
        let isJson = false;
        
        try {
            data = JSON.parse(responseText);
            isJson = true;
        } catch (e) {
            // Binary/Non-JSON - pass through
            response.headers.forEach((value, key) => {
                if (!['content-encoding', 'content-length', 'transfer-encoding'].includes(key)) {
                    res.setHeader(key, value);
                }
            });
            return res.status(response.status).send(responseText);
        }

        if (isJson && data) {
            data = spoofVIP(data);
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
