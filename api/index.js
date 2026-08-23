// ==========================================
// 📺 NETFLIX PROXY - COMPLETE
// ==========================================

// ==========================================
// 🔒 HARD-CODED DEVICE DETAILS (Capture se)
// ==========================================
const HARD_CODED = {
    // 🔥 ESN - Most Important
    esn: 'NFANDROID1-PXA-P-SAMSUSM-S928B-31506-0202JA72A3JBBA23MNJ42U6INDEUFEFAPKANFOJ04A8UI04N1SJMO7JR6JMQ6QLOP60A3ICK060L3UAQ5AD2BL0M0IILPEP1TNL48D29',
    
    // 🔥 Session ID
    sessionId: '730199105',
    
    // 🔥 Profile GUID
    profileGuid: 'WZFVPUH3OFDT3OOGEQJJF7H5HY',
    
    // 🔥 Netflix ID
    netflixId: 'v%3D3%26ct%3DBgjHlOvcAxLvA1fFbbVVP2BLO1RUfJPX9VgXjSqVsl8hYsWHuYJgk8hnYYmKfCcOSfVKg-rwRR8j9fvvfbcJaONasT5Y2bWhz2vTs5a9zge3HUTTA2CAa2geeUJ9izVsxZeWvgm3wZWXOPUMsXqu84LXweGoMtDNf1zOz1TTmHEoYibyHlLvV8AcFBBhPh19SPLtBHaaEJOF3rAJg2Lvy5M5LZuDx5wK0jYmt4zP9drtl4NAUxohaJqNKU0WAZh_CTuAzRIO8dfQiOMQtMOJP9uwceQIZ1HsxDYhT-5JXk8R_wNI6sAz-OUXK2vh2PcdL-AGJ0kqdgLHhMNQloPC2Mkf30DE13lOvqEscD76rOsnPcdEuo1JCHSfXLUXeeTEEnzJTMxSTq1FhaTV98uJ8LqKvYvc8L7FpbUyCVZYVWceSl_38PUYf3quPuY0U-qiWTC4U9N7SgwZAjQGrT_Q0Esi07E2kkGPpcCBwG_ewwPtbXpF7pCv8njDArE2-IH95g8j3YHpq1DzXG_CQ-EejEQ0jV1T_eyWB0EwkfdZImwLZMKLJnaBUzJubeFQma_2EcE6IiVIvaNf7Vvo3jipYXCEz7LcMn0_Cb4-41ZqUL9TN87YLdbq3eDh-XoiQt2XN5mWcIGac7zhq0sWkdOh2JUqsWdJr3LGsRgGIg4KDDK18dLxoZ-z8m5iWQ..%26pg%3DWZFVPUH3OFDT3OOGEQJJF7H5HY%26ch%3DAQEAEAABABRUKLhTiZiZ7sXvi6EbLE_qy_k-HQHYz_M.',
    
    secureNetflixId: 'v%3D3%26mac%3DAQEAEQABABRUT3TscZcN3w4ozZ5srttAVkA8IqEvU5I.%26dt%3D1787458611964',
    
    nfvdid: 'BQFmAAEBEIxpfZGgi1LCTmydVUjRImpgznEq92nK9jNTxAbAsFGlE-dcUcUgUKmZy-RB2pTWTBhHROhKpep-dCFDDZUrAIWHAqWPfQpxSmXaqkGHK_AmL27RhB5q9SWMLIj7KKX91YYx6BtKoYy0vxbTUWBd8--D',
    
    flwssn: 'db673be0-e6a1-4346-8c01-b061caaf8bdd',
    
    // 🔥 Device Details
    device: {
        model: 'samsung_SM-S928B',
        osVersion: '36',
        appVersion: '9.22.1',
        uiFlavor: 'android',
        formFactor: 'phone',
        androidApi: '36',
        deviceMemoryLevel: 'HIGH',
        esnPrefix: 'NFANDROID1-PRV-P-',
        installerSource: 'com.google.android.packageinstaller'
    },
    
    // 🔥 Branding
    branding: '@Netflix Premium',
    
    // 🔥 IP Masking
    fakeIP: '223.188.42.214'
};

// ==========================================
// 🚫 BLOCKED ENDPOINTS - Netflix specific
// ==========================================
const BLOCKED_ENDPOINTS = [
    // Logout
    '/logout', '/signout', '/deactivate',
    '/api/logout', '/auth/logout',
    
    // Account/Profile edit
    '/account', '/profile/edit', '/updateProfile',
    '/changePassword', '/updateEmail',
    
    // Settings
    '/settings', '/preferences', '/userSettings'
];

// ==========================================
// 🚫 BLOCK TRACKING/ANALYTICS
// ==========================================
const BLOCKED_PATTERNS = [
    '/logs.netflix.com',
    '/log/android/cl',
    '/logblob',
    '/bugsnag',
    '/sessions.bugsnag',
    '/clevertap',
    '/appsflyer',
    '/branch.io',
    '/firebase',
    '/analytics'
];

// ==========================================
// 🏷️ BRANDING FUNCTION
// ==========================================
const addBranding = (obj) => {
    const tag = ` [${HARD_CODED.branding}]`;
    const targetKeys = [
        'title', 'name', 'displayName', 'username', 'nickname',
        'text', 'label', 'heading', 'description', 'subtitle',
        'showTitle', 'movieTitle', 'seriesTitle'
    ];
    
    if (typeof obj === 'object' && obj !== null) {
        for (let key in obj) {
            if (typeof obj[key] === 'string' && targetKeys.includes(key)) {
                if (!obj[key].includes(HARD_CODED.branding)) {
                    obj[key] = obj[key].trim() + tag;
                }
            } else if (typeof obj[key] === 'object') {
                addBranding(obj[key]);
            }
        }
    }
};

// ==========================================
// 🎯 VIP SPOOF - Netflix Premium
// ==========================================
const spoofVIP = (data) => {
    if (!data || typeof data !== 'object') return data;
    
    // Account mein premium add
    if (data.data && data.data.currentAccount) {
        const account = data.data.currentAccount;
        account.plan = 'premium';
        account.planName = 'Netflix Premium UHD';
        account.subscriptionStatus = 'active';
        account.isTrial = false;
        account.canWatch4K = true;
        account.canWatchHDR = true;
        account.screens = 4;
    }
    
    if (data.data && data.data.currentProfile) {
        const profile = data.data.currentProfile;
        profile.canEdit = false;
        profile.canDelete = false;
        profile.canSwitch = true;
    }
    
    return data;
};

// ==========================================
// 🛡️ BUILD HEADERS
// ==========================================
function buildHeaders(req) {
    const headers = {};
    
    if (req.headers) {
        Object.keys(req.headers).forEach(key => {
            if (!['accept-encoding', 'content-length', 'host', 'connection',
                  'cookie', 'x-netflix.esn', 'x-netflix.session.id',
                  'x-netflix.client.current-profile-guid'].includes(key.toLowerCase())) {
                headers[key] = req.headers[key];
            }
        });
    }
    
    // 🔥 Hard-coded Netflix Headers
    headers['x-netflix.esn'] = HARD_CODED.esn;
    headers['x-netflix.session.id'] = HARD_CODED.sessionId;
    headers['x-netflix.client.current-profile-guid'] = HARD_CODED.profileGuid;
    headers['x-netflix.context.os-version'] = HARD_CODED.device.osVersion;
    headers['x-netflix.context.app-version'] = HARD_CODED.device.appVersion;
    headers['x-netflix.context.ui-flavor'] = HARD_CODED.device.uiFlavor;
    headers['x-netflix.context.form-factor'] = HARD_CODED.device.formFactor;
    headers['x-netflix.androidapi'] = HARD_CODED.device.androidApi;
    headers['x-netflix.devicememorylevel'] = HARD_CODED.device.deviceMemoryLevel;
    headers['x-netflix.esnprefix'] = HARD_CODED.device.esnPrefix;
    headers['x-netflix.context.android.installer-source'] = HARD_CODED.device.installerSource;
    headers['x-netflix.appver'] = HARD_CODED.device.appVersion;
    
    // 🔥 Cookies
    headers['cookie'] = `nfvdid=${HARD_CODED.nfvdid}; flwssn=${HARD_CODED.flwssn}; NetflixId=${HARD_CODED.netflixId}; SecureNetflixId=${HARD_CODED.secureNetflixId}`;
    
    // 🔥 IP Masking
    headers['x-forwarded-for'] = HARD_CODED.fakeIP;
    headers['x-real-ip'] = HARD_CODED.fakeIP;
    
    // 🔥 Content
    headers['accept'] = 'application/json';
    headers['content-type'] = 'application/json';
    
    return headers;
}

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
    // 🚫 BLOCK LOGOUT + ACCOUNT + SETTINGS
    // ==========================================
    if (BLOCKED_ENDPOINTS.some(e => cleanPath.includes(e))) {
        return res.status(200).json({
            status: 'success',
            data: {
                message: 'This action is not available.'
            }
        });
    }

    // ==========================================
    // 🚫 BLOCK LOGS/ANALYTICS
    // ==========================================
    if (BLOCKED_PATTERNS.some(p => cleanPath.includes(p))) {
        return res.status(200).json({ status: 'success' });
    }

    // ==========================================
    // 🔄 DETERMINE TARGET URL
    // ==========================================
    let targetUrl;
    if (cleanPath.includes('android.prod.ftl.netflix.com')) {
        targetUrl = 'https://android.prod.ftl.netflix.com' + urlPath;
    } else if (cleanPath.includes('android.prod.cloud.netflix.com')) {
        targetUrl = 'https://android.prod.cloud.netflix.com' + urlPath;
    } else if (cleanPath.includes('nrdp.ws.ale.netflix.com')) {
        return res.status(200).json({ status: 'success' });
    } else if (cleanPath.includes('push.prod.netflix.com')) {
        return res.status(200).json({ status: 'success' });
    } else if (cleanPath.includes('occ-0-4409-3647.1.nflxso.net')) {
        targetUrl = 'https://occ-0-4409-3647.1.nflxso.net' + urlPath;
    } else if (cleanPath.includes('logs.netflix.com')) {
        return res.status(200).json({ status: 'success' });
    } else {
        targetUrl = 'https://android.prod.ftl.netflix.com' + urlPath;
    }

    // ==========================================
    // 📝 BUILD HEADERS
    // ==========================================
    const headers = buildHeaders(req);

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
