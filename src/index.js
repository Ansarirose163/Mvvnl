// ==========================================
// 📺 NETFLIX PROXY - CLOUDFLARE WORKERS
// ==========================================

// ==========================================
// 🔒 HARD-CODED DEVICE DETAILS (Capture se)
// ==========================================
const HARD_CODED = {
    // 🔥 ESN (Device ID)
    esn: 'NFANDROID1-PXA-P-SAMSUSM-S928B-31506-0202JA72A3JBBA23MNJ42U6INDEUFEFAPKANFOJ04A8UI04N1SJMO7JR6JMQ6QLOP60A3ICK060L3UAQ5AD2BL0M0IILPEP1TNL48D29',
    esnPrefix: 'NFANDROID1-PRV-P-',
    
    // 🔥 Session
    sessionId: '730199105',
    nfvdid: 'BQFmAAEBEIxpfZGgi1LCTmydVUjRImpgznEq92nK9jNTxAbAsFGlE-dcUcUgUKmZy-RB2pTWTBhHROhKpep-dCFDDZUrAIWHAqWPfQpxSmXaqkGHK_AmL27RhB5q9SWMLIj7KKX91YYx6BtKoYy0vxbTUWBd8--D',
    
    // 🔥 Profile
    profileGuid: 'WZFVPUH3OFDT3OOGEQJJF7H5HY',
    
    // 🔥 Device Details
    deviceInfo: {
        model: 'samsung_SM-S928B',
        osVersion: '36',
        androidApi: '36',
        appVersion: '9.22.1',
        appBuild: '62948',
        uiFlavor: 'android',
        formFactor: 'phone',
        deviceMemoryLevel: 'HIGH',
        locale: 'en-IN'
    },
    
    // 🔥 User Agent
    userAgent: 'com.netflix.mediaclient/62948 (Linux; U; Android 16; en_GB; SM-S928B; Build/BP4A.251205.006; Cronet/119.0.6045.31)',
    
    // 🔥 Branding
    branding: '@Netflix Premium',
    
    // 🔥 IP Masking
    fakeIP: '122.168.2.40'
};

// ==========================================
// 🚫 BLOCKED ENDPOINTS
// ==========================================
const BLOCKED_PATTERNS = [
    // Logout/Delete
    '/logout', '/delete', '/deactivate', '/unregister',
    '/signout', '/sign_out', '/deactivateDevice',
    
    // Analytics/Logging (Block but return 200)
    '/logs.netflix.com',
    '/log/android/cl',
    '/log/android/logblob',
    '/sessions.bugsnag.com',
    '/bugsnag',
    '/clevertap',
    '/appsflyer',
    '/branch.io',
    '/firebase',
    '/analytics', '/track', '/log', '/heartbeat',
    '/impression', '/sync', '/event'
];

// ==========================================
// 🏷️ BRANDING FUNCTION
// ==========================================
function addBranding(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    
    const tag = ` [${HARD_CODED.branding}]`;
    const targetKeys = [
        'title', 'name', 'display_name', 'username', 'nickname',
        'text', 'label', 'heading', 'description', 'subtitle',
        'videoTitle', 'showTitle', 'movieTitle', 'seriesTitle'
    ];
    
    if (Array.isArray(obj)) {
        return obj.map(item => addBranding(item));
    }
    
    for (let key in obj) {
        if (typeof obj[key] === 'string' && targetKeys.includes(key)) {
            if (!obj[key].includes(HARD_CODED.branding)) {
                obj[key] = obj[key].trim() + tag;
            }
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            obj[key] = addBranding(obj[key]);
        }
    }
    return obj;
}

// ==========================================
// 🎯 VIP SPOOF
// ==========================================
function spoofVIP(data) {
    if (!data || typeof data !== 'object') return data;
    
    // Account query response mein subscription add
    if (data.data?.currentUser?.account) {
        const account = data.data.currentUser.account;
        account.subscriptionStatus = 'active';
        account.planType = 'PREMIUM';
        account.planName = 'Netflix Premium 4K+HDR';
        account.validity = 'Lifetime Unlimited';
        account.isTrial = false;
        account.canEdit = false;
        account.canDelete = false;
    }
    
    // Profiles mein sirf ek rakhna hai
    if (data.data?.currentUser?.account?.profiles) {
        const profiles = data.data.currentUser.account.profiles;
        if (Array.isArray(profiles) && profiles.length > 1) {
            data.data.currentUser.account.profiles = profiles.filter(p => 
                p.guid === HARD_CODED.profileGuid
            );
        }
    }
    
    return data;
}

// ==========================================
// 🛡️ BUILD HEADERS
// ==========================================
function buildHeaders(request) {
    const headers = new Headers();
    
    // 🔥 Original headers copy (sirf zaroori)
    const essentialOriginal = ['content-type', 'accept', 'accept-encoding'];
    for (const key of essentialOriginal) {
        const value = request.headers.get(key);
        if (value) {
            headers.set(key, value);
        }
    }
    
    // 🔥 HARD-CODED HEADERS
    headers.set('x-netflix.esn', HARD_CODED.esn);
    headers.set('x-netflix.esnprefix', HARD_CODED.esnPrefix);
    headers.set('x-netflix.session.id', HARD_CODED.sessionId);
    headers.set('x-netflix.client.current-profile-guid', HARD_CODED.profileGuid);
    headers.set('x-netflix.context.os-version', HARD_CODED.deviceInfo.osVersion);
    headers.set('x-netflix.androidapi', HARD_CODED.deviceInfo.androidApi);
    headers.set('x-netflix.context.app-version', HARD_CODED.deviceInfo.appVersion);
    headers.set('x-netflix.appver', HARD_CODED.deviceInfo.appVersion);
    headers.set('x-netflix.context.ui-flavor', HARD_CODED.deviceInfo.uiFlavor);
    headers.set('x-netflix.context.form-factor', HARD_CODED.deviceInfo.formFactor);
    headers.set('x-netflix.devicememorylevel', HARD_CODED.deviceInfo.deviceMemoryLevel);
    headers.set('x-netflix.context.locales', HARD_CODED.deviceInfo.locale);
    headers.set('x-netflix.clienttype', 'samurai');
    headers.set('x-netflix.zuul.brotli.allowed', 'true');
    headers.set('user-agent', HARD_CODED.userAgent);
    
    // 🔥 Cookies
    const cookies = [
        `nfvdid=${HARD_CODED.nfvdid}`,
        `flwssn=db673be0-e6a1-4346-8c01-b061caaf8bdd`,
        `NetflixId=v%3D3%26ct%3DBgjHlOvcAxLvA1fFbbVVP2BLO1RUfJPX9VgXjSqVsl8hYsWHuYJgk8hnYYmKfCcOSfVKg-rwRR8j9fvvfbcJaONasT5Y2bWhz2vTs5a9zge3HUTTA2CAa2geeUJ9izVsxZeWvgm3wZWXOPUMsXqu84LXweGoMtDNf1zOz1TTmHEoYibyHlLvV8AcFBBhPh19SPLtBHaaEJOF3rAJg2Lvy5M5LZuDx5wK0jYmt4zP9drtl4NAUxohaJqNKU0WAZh_CTuAzRIO8dfQiOMQtMOJP9uwceQIZ1HsxDYhT-5JXk8R_wNI6sAz-OUXK2vh2PcdL-AGJ0kqdgLHhMNQloPC2Mkf30DE13lOvqEscD76rOsnPcdEuo1JCHSfXLUXeeTEEnzJTMxSTq1FhaTV98uJ8LqKvYvc8L7FpbUyCVZYVWceSl_38PUYf3quPuY0U-qiWTC4U9N7SgwZAjQGrT_Q0Esi07E2kkGPpcCBwG_ewwPtbXpF7pCv8njDArE2-IH95g8j3YHpq1DzXG_CQ-EejEQ0jV1T_eyWB0EwkfdZImwLZMKLJnaBUzJubeFQma_2EcE6IiVIvaNf7Vvo3jipYXCEz7LcMn0_Cb4-41ZqUL9TN87YLdbq3eDh-XoiQt2XN5mWcIGac7zhq0sWkdOh2JUqsWdJr3LGsRgGIg4KDDK18dLxoZ-z8m5iWQ..%26pg%3DWZFVPUH3OFDT3OOGEQJJF7H5HY%26ch%3DAQEAEAABABRUKLhTiZiZ7sXvi6EbLE_qy_k-HQHYz_M.`,
        `SecureNetflixId=v%3D3%26mac%3DAQEAEQABABRUT3TscZcN3w4ozZ5srttAVkA8IqEvU5I.%26dt%3D1787458611964`
    ];
    headers.set('cookie', cookies.join('; '));
    
    // 🔥 IP Masking
    headers.set('x-forwarded-for', HARD_CODED.fakeIP);
    headers.set('x-real-ip', HARD_CODED.fakeIP);
    
    return headers;
}

// ==========================================
// 🚀 MAIN HANDLER
// ==========================================
export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const path = url.pathname;
        const method = request.method;
        
        // ==========================================
        // 🚫 BLOCK LOGOUT/ANALYTICS
        // ==========================================
        const isBlocked = BLOCKED_PATTERNS.some(pattern => 
            path.includes(pattern) || url.hostname.includes(pattern)
        );
        
        if (isBlocked) {
            return new Response(JSON.stringify({
                status: true,
                message: "Blocked for security"
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // ==========================================
        // 🔄 DETERMINE TARGET
        // ==========================================
        let targetUrl;
        const host = url.hostname;
        
        if (host.includes('logs.netflix.com')) {
            // Logs - block kar rahe hain already
            return new Response('OK', { status: 200 });
        } else if (host.includes('android.prod.ftl.netflix.com')) {
            targetUrl = `https://android.prod.ftl.netflix.com${path}${url.search}`;
        } else if (host.includes('android.prod.cloud.netflix.com')) {
            targetUrl = `https://android.prod.cloud.netflix.com${path}${url.search}`;
        } else if (host.includes('occ-0-') || host.includes('nflxso.net')) {
            targetUrl = `https://${host}${path}${url.search}`;
        } else if (host.includes('nrdp.ws.ale.netflix.com')) {
            // WebSocket - pass through
            return fetch(request);
        } else if (host.includes('push.prod.netflix.com')) {
            // WebSocket - pass through
            return fetch(request);
        } else {
            // Default - pass through
            return fetch(request);
        }
        
        // ==========================================
        // 📝 BUILD HEADERS
        // ==========================================
        const headers = buildHeaders(request);
        
        // 🔥 Body handle
        let body = null;
        if (method !== 'GET' && method !== 'HEAD') {
            body = await request.arrayBuffer();
        }
        
        // ==========================================
        // 🚀 FORWARD REQUEST
        // ==========================================
        try {
            const response = await fetch(targetUrl, {
                method: method,
                headers: headers,
                body: body,
                redirect: 'manual'
            });
            
            const contentType = response.headers.get('content-type') || '';
            let responseData = await response.arrayBuffer();
            
            // Agar JSON hai toh process karo
            if (contentType.includes('application/json')) {
                let jsonData = JSON.parse(new TextDecoder().decode(responseData));
                
                // 🎯 VIP Spoof
                jsonData = spoofVIP(jsonData);
                
                // 🏷️ Branding Add
                jsonData = addBranding(jsonData);
                
                return new Response(JSON.stringify(jsonData), {
                    status: response.status,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                        'Access-Control-Allow-Headers': '*'
                    }
                });
            }
            
            // Non-JSON response
            const responseHeaders = new Headers(response.headers);
            responseHeaders.set('Access-Control-Allow-Origin', '*');
            responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            responseHeaders.delete('content-encoding');
            responseHeaders.delete('content-length');
            
            return new Response(responseData, {
                status: response.status,
                headers: responseHeaders
            });
            
        } catch (error) {
            return new Response(JSON.stringify({
                status: false,
                error: 'Proxy Error: ' + error.message
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }
};
