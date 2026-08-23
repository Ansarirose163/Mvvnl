// ==========================================
// 📺 NETFLIX PROXY - FIXED
// ==========================================

// ==========================================
// 🔒 NETFLIX CONFIG
// ==========================================
const NETFLIX_CONFIG = {
    baseUrls: [
        'https://android.prod.ftl.netflix.com',
        'https://android.prod.cloud.netflix.com',
        'https://logs.netflix.com',
        'https://sessions.bugsnag.com',
        'https://occ-0-4409-3647.1.nflxso.net'
    ],
    
    esn: 'NFANDROID1-PXA-P-SAMSUSM-S928B-31506-0202JA72A3JBBA23MNJ42U6INDEUFEFAPKANFOJ04A8UI04N1SJMO7JR6JMQ6QLOP60A3ICK060L3UAQ5AD2BL0M0IILPEP1TNL48D29',
    esnPrefix: 'NFANDROID1-PRV-P-',
    sessionId: '730199105',
    nrdSessionId: '730199105',
    
    deviceModel: 'samsung_SM-S928B',
    osVersion: '36',
    appVersion: '9.22.1',
    uiVersion: 'release/9.22 (3) 62948',
    androidApi: '36',
    
    profileGuid: 'WZFVPUH3OFDT3OOGEQJJF7H5HY',
    netflixId: 'v%3D3%26ct%3DBgjHlOvcAxLvA1fFbbVVP2BLO1RUfJPX9VgXjSqVsl8hYsWHuYJgk8hnYYmKfCcOSfVKg-rwRR8j9fvvfbcJaONasT5Y2bWhz2vTs5a9zge3HUTTA2CAa2geeUJ9izVsxZeWvgm3wZWXOPUMsXqu84LXweGoMtDNf1zOz1TTmHEoYibyHlLvV8AcFBBhPh19SPLtBHaaEJOF3rAJg2Lvy5M5LZuDx5wK0jYmt4zP9drtl4NAUxohaJqNKU0WAZh_CTuAzRIO8dfQiOMQtMOJP9uwceQIZ1HsxDYhT-5JXk8R_wNI6sAz-OUXK2vh2PcdL-AGJ0kqdgLHhMNQloPC2Mkf30DE13lOvqEscD76rOsnPcdEuo1JCHSfXLUXeeTEEnzJTMxSTq1FhaTV98uJ8LqKvYvc8L7FpbUyCVZYVWceSl_38PUYf3quPuY0U-qiWTC4U9N7SgwZAjQGrT_Q0Esi07E2kkGPpcCBwG_ewwPtbXpF7pCv8njDArE2-IH95g8j3YHpq1DzXG_CQ-EejEQ0jV1T_eyWB0EwkfdZImwLZMKLJnaBUzJubeFQma_2EcE6IiVIvaNf7Vvo3jipYXCEz7LcMn0_Cb4-41ZqUL9TN87YLdbq3eDh-XoiQt2XN5mWcIGac7zhq0sWkdOh2JUqsWdJr3LGsRgGIg4KDDK18dLxoZ-z8m5iWQ..%26pg%3DWZFVPUH3OFDT3OOGEQJJF7H5HY%26ch%3DAQEAEAABABRUKLhTiZiZ7sXvi6EbLE_qy_k-HQHYz_M.',
    secureNetflixId: 'v%3D3%26mac%3DAQEAEQABABRUT3TscZcN3w4ozZ5srttAVkA8IqEvU5I.%26dt%3D1787458611964',
    
    cookies: {
        nfvdid: 'BQFmAAEBEIxpfZGgi1LCTmydVUjRImpgznEq92nK9jNTxAbAsFGlE-dcUcUgUKmZy-RB2pTWTBhHROhKpep-dCFDDZUrAIWHAqWPfQpxSmXaqkGHK_AmL27RhB5q9SWMLIj7KKX91YYx6BtKoYy0vxbTUWBd8--D',
        flwssn: 'db673be0-e6a1-4346-8c01-b061caaf8bdd'
    },
    
    userAgent: 'com.netflix.mediaclient/62948 (Linux; U; Android 16; en_GB; SM-S928B; Build/BP4A.251205.006; Cronet/119.0.6045.31)',
    fakeIP: '223.188.42.214',
    branding: '@Netflix Premium'
};

// ==========================================
// 🏷️ BRANDING FUNCTION
// ==========================================
const addBranding = (obj) => {
    const tag = ` [${NETFLIX_CONFIG.branding}]`;
    const targetKeys = [
        'title', 'name', 'display_name', 'username', 'nickname',
        'text', 'label', 'heading', 'description', 'subtitle',
        'videoTitle', 'movieTitle', 'seriesTitle', 'showTitle'
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
// 🚫 BLOCKED ENDPOINTS - SAB BLOCK
// ==========================================
const BLOCKED_EXACT = [
    '/log/android/cl/2',
    '/log/android/logblob/1',
    '/sessions.bugsnag.com',
    'logs.netflix.com/log',
    'bugsnag.com'
];

const BLOCKED_PATTERNS = [
    'logs.netflix.com',
    'bugsnag',
    'session.bugsnag',
    'log/android/cl',
    'log/android/logblob'
];

// ==========================================
// 🚀 MAIN HANDLER
// ==========================================
export default async function handler(req, res) {
    let urlPath = req.headers['x-invoke-path'] || req.url;
    const cleanPath = urlPath.split('?')[0];
    const method = req.method;

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');

    if (method === 'OPTIONS') {
        return res.status(200).end();
    }

    // ==========================================
    // 🚫 COMPLETE BLOCK - SAB KUCH BLOCK
    // ==========================================
    const isBlocked = BLOCKED_EXACT.some(e => cleanPath.includes(e)) || 
                      BLOCKED_PATTERNS.some(p => cleanPath.includes(p));
    
    if (isBlocked) {
        console.log(`🚫 BLOCKED: ${cleanPath}`);
        
        // 🔥 Sirf 200 OK bhejo, kuch data nahi
        return res.status(200).send('');
    }

    // ==========================================
    // 🔄 DETERMINE TARGET URL
    // ==========================================
    let targetUrl;
    if (cleanPath.includes('occ-0-4409-3647.1.nflxso.net')) {
        targetUrl = 'https://occ-0-4409-3647.1.nflxso.net' + urlPath;
    } else if (cleanPath.includes('android.prod.cloud.netflix.com')) {
        targetUrl = 'https://android.prod.cloud.netflix.com' + urlPath;
    } else if (cleanPath.includes('ftl.netflix.com')) {
        targetUrl = 'https://android.prod.ftl.netflix.com' + urlPath;
    } else {
        targetUrl = 'https://android.prod.ftl.netflix.com' + urlPath;
    }

    // ==========================================
    // 📝 BUILD HEADERS
    // ==========================================
    const headers = {};
    
    // 🔥 Essential headers from original
    if (req.headers) {
        const keepHeaders = ['content-type', 'accept', 'x-netflix-', 'x-apollo-', 'x-netflix'];
        Object.keys(req.headers).forEach(key => {
            if (keepHeaders.some(k => key.toLowerCase().includes(k.toLowerCase()))) {
                headers[key] = req.headers[key];
            }
        });
    }
    
    // 🔥 Inject Netflix Headers
    headers['x-netflix.esn'] = NETFLIX_CONFIG.esn;
    headers['x-netflix.esnprefix'] = NETFLIX_CONFIG.esnPrefix;
    headers['x-netflix.session.id'] = NETFLIX_CONFIG.sessionId;
    headers['x-netflix.context.os-version'] = NETFLIX_CONFIG.osVersion;
    headers['x-netflix.context.app-version'] = NETFLIX_CONFIG.appVersion;
    headers['x-netflix.androidapi'] = NETFLIX_CONFIG.androidApi;
    headers['x-netflix.appver'] = NETFLIX_CONFIG.appVersion;
    headers['user-agent'] = NETFLIX_CONFIG.userAgent;
    
    // Profile headers
    if (!cleanPath.includes('login') && !cleanPath.includes('signup')) {
        headers['x-netflix.client.current-profile-guid'] = NETFLIX_CONFIG.profileGuid;
    }
    
    // IP Masking
    headers['x-forwarded-for'] = NETFLIX_CONFIG.fakeIP;
    headers['x-real-ip'] = NETFLIX_CONFIG.fakeIP;
    
    // Cookies
    headers['cookie'] = `nfvdid=${NETFLIX_CONFIG.cookies.nfvdid}; flwssn=${NETFLIX_CONFIG.cookies.flwssn}; NetflixId=${NETFLIX_CONFIG.netflixId}; SecureNetflixId=${NETFLIX_CONFIG.secureNetflixId}`;
    
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
