// ==========================================
// 📺 NETFLIX PROXY - COMPLETE
// ==========================================

// ==========================================
// 🔒 HARD-CODED NETFLIX CONFIG
// ==========================================
const NETFLIX_CONFIG = {
    // 🔥 Main APIs
    baseUrls: [
        'https://android.prod.ftl.netflix.com',
        'https://android.prod.cloud.netflix.com',
        'https://logs.netflix.com',
        'https://sessions.bugsnag.com',
        'https://occ-0-4409-3647.1.nflxso.net'
    ],
    
    // 🔥 Device Details (Capture se)
    esn: 'NFANDROID1-PXA-P-SAMSUSM-S928B-31506-0202JA72A3JBBA23MNJ42U6INDEUFEFAPKANFOJ04A8UI04N1SJMO7JR6JMQ6QLOP60A3ICK060L3UAQ5AD2BL0M0IILPEP1TNL48D29',
    esnPrefix: 'NFANDROID1-PRV-P-',
    sessionId: '730199105',
    nfvdid: 'BQFmAAEBEIxpfZGgi1LCTmydVUjRImpgznEq92nK9jNTxAbAsFGlE-dcUcUgUKmZy-RB2pTWTBhHROhKpep-dCFDDZUrAIWHAqWPfQpxSmXaqkGHK_AmL27RhB5q9SWMLIj7KKX91YYx6BtKoYy0vxbTUWBd8--D',
    netflixId: 'v%3D3%26ct%3DBgjHlOvcAxLvA1fFbbVVP2BLO1RUfJPX9VgXjSqVsl8hYsWHuYJgk8hnYYmKfCcOSfVKg-rwRR8j9fvvfbcJaONasT5Y2bWhz2vTs5a9zge3HUTTA2CAa2geeUJ9izVsxZeWvgm3wZWXOPUMsXqu84LXweGoMtDNf1zOz1TTmHEoYibyHlLvV8AcFBBhPh19SPLtBHaaEJOF3rAJg2Lvy5M5LZuDx5wK0jYmt4zP9drtl4NAUxohaJqNKU0WAZh_CTuAzRIO8dfQiOMQtMOJP9uwceQIZ1HsxDYhT-5JXk8R_wNI6sAz-OUXK2vh2PcdL-AGJ0kqdgLHhMNQloPC2Mkf30DE13lOvqEscD76rOsnPcdEuo1JCHSfXLUXeeTEEnzJTMxSTq1FhaTV98uJ8LqKvYvc8L7FpbUyCVZYVWceSl_38PUYf3quPuY0U-qiWTC4U9N7SgwZAjQGrT_Q0Esi07E2kkGPpcCBwG_ewwPtbXpF7pCv8njDArE2-IH95g8j3YHpq1DzXG_CQ-EejEQ0jV1T_eyWB0EwkfdZImwLZMKLJnaBUzJubeFQma_2EcE6IiVIvaNf7Vvo3jipYXCEz7LcMn0_Cb4-41ZqUL9TN87YLdbq3eDh-XoiQt2XN5mWcIGac7zhq0sWkdOh2JUqsWdJr3LGsRgGIg4KDDK18dLxoZ-z8m5iWQ..%26pg%3DWZFVPUH3OFDT3OOGEQJJF7H5HY%26ch%3DAQEAEAABABRUKLhTiZiZ7sXvi6EbLE_qy_k-HQHYz_M.',
    secureNetflixId: 'v%3D3%26mac%3DAQEAEQABABRUT3TscZcN3w4ozZ5srttAVkA8IqEvU5I.%26dt%3D1787458611964',
    profileGuid: 'WZFVPUH3OFDT3OOGEQJJF7H5HY',
    
    // 🔥 Device Info
    deviceInfo: {
        model: 'SM-S928B',
        brand: 'samsung',
        osVersion: '36',
        androidApi: '36',
        appVersion: '9.22.1',
        appBuild: '62948',
        userAgent: 'com.netflix.mediaclient/62948 (Linux; U; Android 16; en_GB; SM-S928B; Build/BP4A.251205.006; Cronet/119.0.6045.31)',
        deviceMemoryLevel: 'HIGH',
        deviceFormFactor: 'PHONE',
        uiFlavor: 'android',
        locales: 'en-IN'
    },
    
    branding: '@Netflix Premium',
    fakeIP: '122.168.2.40'
};

// ==========================================
// 🚫 BLOCKED ENDPOINTS
// ==========================================
const BLOCKED_ENDPOINTS = [
    // 🔥 Logout
    '/logout',
    '/signout',
    '/sign_out',
    '/deactivate',
    '/delete_account',
    '/cancel_membership',
    
    // 🔥 Account/Profile Edit
    '/edit_profile',
    '/update_profile',
    '/change_password',
    '/update_password',
    '/account/edit',
    '/profile/edit',
    '/account/update',
    
    // 🔥 Payment/Subscription (Block to keep free)
    '/subscribe',
    '/upgrade',
    '/payment',
    '/billing',
    '/subscription',
    '/add_payment',
    '/update_payment'
];

// ==========================================
// 🚫 BLOCK LOGGING/ANALYTICS
// ==========================================
const BLOCKED_PATTERNS = [
    '/log/android/cl',
    '/log/android/logblob',
    '/sessions.bugsnag.com',
    '/clevertap',
    '/firebase',
    '/analytics',
    '/track',
    '/bugsnag'
];

// ==========================================
// 🏷️ BRANDING FUNCTION
// ==========================================
const addBranding = (obj) => {
    const tag = ` [${NETFLIX_CONFIG.branding}]`;
    const targetKeys = [
        'title', 'name', 'displayName', 'username', 'nickname',
        'description', 'subtitle', 'heading', 'label',
        'videoTitle', 'movieTitle', 'showTitle', 'seriesTitle'
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
// 🎯 VIP SPOOF - Premium features unlock
// ==========================================
const spoofVIP = (data) => {
    if (!data || typeof data !== 'object') return data;
    
    // Account/User info mein subscription add
    if (data.data && typeof data.data === 'object') {
        // Account Query response
        if (data.data.account || data.data.currentUser) {
            const account = data.data.account || data.data.currentUser;
            account.isSubscribed = true;
            account.subscriptionStatus = 'active';
            account.planType = 'Premium';
            account.planName = 'Netflix Premium 4K+HDR';
            account.isTrial = false;
            account.isExpired = false;
            account.expiryDate = '2099-12-31';
            account.maxProfiles = 10;
            account.has4K = true;
            account.hasHDR = true;
            account.hasDolbyAtmos = true;
        }
        
        // Profile data
        if (data.data.profile || data.data.profiles) {
            const profiles = data.data.profile || data.data.profiles;
            if (Array.isArray(profiles)) {
                profiles.forEach(p => {
                    p.canEdit = false;
                    p.canDelete = false;
                    p.isActive = true;
                });
            }
        }
    }
    
    return data;
};

// ==========================================
// 🛡️ BUILD HEADERS
// ==========================================
function buildHeaders(req, targetUrl) {
    const headers = {};
    
    // 🔥 Copy essential headers
    if (req.headers) {
        const allowHeaders = [
            'content-type', 'accept', 'accept-encoding',
            'x-netflix-', 'x-apollo-', 'x-requested-with',
            'user-agent', 'cookie', 'debugRequest',
            'upgrade', 'connection', 'sec-'
        ];
        
        Object.keys(req.headers).forEach(key => {
            const lowerKey = key.toLowerCase();
            if (allowHeaders.some(h => lowerKey.includes(h) || lowerKey.startsWith('x-netflix'))) {
                headers[key] = req.headers[key];
            }
        });
    }
    
    // 🔥 Hard-coded Netflix headers
    headers['x-netflix.esn'] = NETFLIX_CONFIG.esn;
    headers['x-netflix.esnprefix'] = NETFLIX_CONFIG.esnPrefix;
    headers['x-netflix.session.id'] = NETFLIX_CONFIG.sessionId;
    headers['x-netflix.context.os-version'] = NETFLIX_CONFIG.deviceInfo.osVersion;
    headers['x-netflix.context.app-version'] = NETFLIX_CONFIG.deviceInfo.appVersion;
    headers['x-netflix.context.ui-flavor'] = NETFLIX_CONFIG.deviceInfo.uiFlavor;
    headers['x-netflix.context.locales'] = NETFLIX_CONFIG.deviceInfo.locales;
    headers['x-netflix.devicememorylevel'] = NETFLIX_CONFIG.deviceInfo.deviceMemoryLevel;
    headers['x-netflix.deviceformfactor'] = NETFLIX_CONFIG.deviceInfo.deviceFormFactor;
    headers['x-netflix.androidapi'] = NETFLIX_CONFIG.deviceInfo.androidApi;
    headers['x-netflix.appver'] = NETFLIX_CONFIG.deviceInfo.appVersion;
    headers['x-netflix.clienttype'] = 'samurai';
    headers['x-netflix.client.current-profile-guid'] = NETFLIX_CONFIG.profileGuid;
    
    // 🔥 Cookie headers
    if (!headers['cookie']) {
        headers['cookie'] = `nfvdid=${NETFLIX_CONFIG.nfvdid}; flwssn=${NETFLIX_CONFIG.sessionId}; NetflixId=${NETFLIX_CONFIG.netflixId}; SecureNetflixId=${NETFLIX_CONFIG.secureNetflixId}`;
    }
    
    // 🔥 User Agent
    if (!headers['user-agent']) {
        headers['user-agent'] = NETFLIX_CONFIG.deviceInfo.userAgent;
    }
    
    // 🔥 IP Masking
    headers['x-forwarded-for'] = NETFLIX_CONFIG.fakeIP;
    headers['x-real-ip'] = NETFLIX_CONFIG.fakeIP;
    headers['x-client-ip'] = NETFLIX_CONFIG.fakeIP;
    
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
    // 🚫 BLOCK LOGOUT/ACCOUNT/PROFILE
    // ==========================================
    const isBlocked = BLOCKED_ENDPOINTS.some(endpoint => 
        cleanPath.includes(endpoint)
    );
    
    if (isBlocked) {
        console.log(`🚫 Blocked: ${cleanPath}`);
        
        // Logout block
        if (cleanPath.includes('/logout') || cleanPath.includes('/signout')) {
            return res.status(200).json({
                status: true,
                message: "Logout is disabled. You are permanently logged in."
            });
        }
        
        // Account/Profile block
        return res.status(200).json({
            status: true,
            message: "Account management is disabled.",
            data: {
                isSubscribed: true,
                subscriptionStatus: 'active',
                planType: 'Premium',
                planName: 'Netflix Premium 4K+HDR'
            }
        });
    }

    // ==========================================
    // 🚫 BLOCK LOGS/ANALYTICS
    // ==========================================
    if (BLOCKED_PATTERNS.some(p => cleanPath.includes(p))) {
        console.log(`📊 Blocked Analytics: ${cleanPath}`);
        return res.status(200).json({ 
            status: true,
            message: "SUCCESS"
        });
    }

    // ==========================================
    // 🔄 DETERMINE TARGET URL
    // ==========================================
    let targetUrl;
    
    if (cleanPath.includes('android.prod.ftl.netflix.com')) {
        targetUrl = 'https://android.prod.ftl.netflix.com' + urlPath;
    } else if (cleanPath.includes('android.prod.cloud.netflix.com')) {
        targetUrl = 'https://android.prod.cloud.netflix.com' + urlPath;
    } else if (cleanPath.includes('logs.netflix.com')) {
        targetUrl = 'https://logs.netflix.com' + urlPath;
    } else if (cleanPath.includes('sessions.bugsnag.com')) {
        targetUrl = 'https://sessions.bugsnag.com' + urlPath;
    } else if (cleanPath.includes('nflxso.net') || cleanPath.includes('occ-0-')) {
        targetUrl = 'https://occ-0-4409-3647.1.nflxso.net' + urlPath;
    } else if (cleanPath.includes('nrdp.ws.ale.netflix.com')) {
        // WebSocket - pass through
        return res.status(200).json({ status: true, message: "WebSocket blocked" });
    } else if (cleanPath.includes('push.prod.netflix.com')) {
        // Push WebSocket - pass through
        return res.status(200).json({ status: true, message: "Push blocked" });
    } else {
        targetUrl = 'https://android.prod.ftl.netflix.com' + urlPath;
    }

    // ==========================================
    // 📝 BUILD HEADERS
    // ==========================================
    const headers = buildHeaders(req, targetUrl);
    
    // Remove problematic
    delete headers['host'];
    delete headers['connection'];
    delete headers['content-length'];
    delete headers['accept-encoding'];

    // ==========================================
    // 🚀 FORWARD REQUEST
    // ==========================================
    try {
        const fetchOptions = {
            method: method,
            headers: headers,
            // Don't compress response
            compress: false
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
        
        // Get response as buffer for binary/MSL responses
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        // Try to parse as JSON for text responses
        let isJson = false;
        let data = null;
        
        try {
            const text = buffer.toString('utf8');
            if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
                data = JSON.parse(text);
                isJson = true;
            }
        } catch (e) {
            // Not JSON
        }

        // Set response headers
        response.headers.forEach((value, key) => {
            if (!['content-encoding', 'content-length', 'transfer-encoding'].includes(key)) {
                res.setHeader(key, value);
            }
        });

        // Process JSON response
        if (isJson && data) {
            data = spoofVIP(data);
            addBranding(data);
            return res.status(response.status).json(data);
        } else {
            // Binary response - forward as is
            return res.status(response.status).send(buffer);
        }

    } catch (error) {
        console.error('❌ Proxy Error:', error);
        return res.status(500).json({
            status: false,
            error: "Proxy Error: " + error.message
        });
    }
}
