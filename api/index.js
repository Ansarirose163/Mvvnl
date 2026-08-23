// ==========================================
// 📺 NETFLIX PROXY - COMPLETE & UPDATED
// ==========================================

// ==========================================
// 🔒 NETFLIX CONFIG (Sirf captured data se)
// ==========================================
const NETFLIX_CONFIG = {
    // 🔥 Main Domains
    baseUrl: 'https://android.prod.ftl.netflix.com',
    cloudUrl: 'https://android.prod.cloud.netflix.com',
    logsUrl: 'https://logs.netflix.com',
    bugsnagUrl: 'https://sessions.bugsnag.com',
    occUrl: 'https://occ-0-4409-3647.1.nflxso.net',
    
    // 🔥 Device Details (Hard-coded)
    esn: 'NFANDROID1-PXA-P-SAMSUSM-S928B-31506-0202JA72A3JBBA23MNJ42U6INDEUFEFAPKANFOJ04A8UI04N1SJMO7JR6JMQ6QLOP60A3ICK060L3UAQ5AD2BL0M0IILPEP1TNL48D29',
    esnPrefix: 'NFANDROID1-PRV-P-',
    sessionId: '730199105',
    nfvdid: 'BQFmAAEBEIxpfZGgi1LCTmydVUjRImpgznEq92nK9jNTxAbAsFGlE-dcUcUgUKmZy-RB2pTWTBhHROhKpep-dCFDDZUrAIWHAqWPfQpxSmXaqkGHK_AmL27RhB5q9SWMLIj7KKX91YYx6BtKoYy0vxbTUWBd8--D',
    netflixId: 'v%3D3%26ct%3DBgjHlOvcAxLvA1fFbbVVP2BLO1RUfJPX9VgXjSqVsl8hYsWHuYJgk8hnYYmKfCcOSfVKg-rwRR8j9fvvfbcJaONasT5Y2bWhz2vTs5a9zge3HUTTA2CAa2geeUJ9izVsxZeWvgm3wZWXOPUMsXqu84LXweGoMtDNf1zOz1TTmHEoYibyHlLvV8AcFBBhPh19SPLtBHaaEJOF3rAJg2Lvy5M5LZuDx5wK0jYmt4zP9drtl4NAUxohaJqNKU0WAZh_CTuAzRIO8dfQiOMQtMOJP9uwceQIZ1HsxDYhT-5JXk8R_wNI6sAz-OUXK2vh2PcdL-AGJ0kqdgLHhMNQloPC2Mkf30DE13lOvqEscD76rOsnPcdEuo1JCHSfXLUXeeTEEnzJTMxSTq1FhaTV98uJ8LqKvYvc8L7FpbUyCVZYVWceSl_38PUYf3quPuY0U-qiWTC4U9N7SgwZAjQGrT_Q0Esi07E2kkGPpcCBwG_ewwPtbXpF7pCv8njDArE2-IH95g8j3YHpq1DzXG_CQ-EejEQ0jV1T_eyWB0EwkfdZImwLZMKLJnaBUzJubeFQma_2EcE6IiVIvaNf7Vvo3jipYXCEz7LcMn0_Cb4-41ZqUL9TN87YLdbq3eDh-XoiQt2XN5mWcIGac7zhq0sWkdOh2JUqsWdJr3LGsRgGIg4KDDK18dLxoZ-z8m5iWQ..%26pg%3DWZFVPUH3OFDT3OOGEQJJF7H5HY%26ch%3DAQEAEAABABRUKLhTiZiZ7sXvi6EbLE_qy_k-HQHYz_M.',
    secureNetflixId: 'v%3D3%26mac%3DAQEAEQABABRUT3TscZcN3w4ozZ5srttAVkA8IqEvU5I.%26dt%3D1787458611964',
    profileGuid: 'WZFVPUH3OFDT3OOGEQJJF7H5HY',
    
    // 🔥 App Details
    appVersion: '9.22.1',
    appVer: '9.22.1',
    androidApi: '36',
    osVersion: '36',
    deviceModel: 'samsung_SM-S928B',
    manufacturer: 'samsung',
    model: 'SM-S928B',
    
    // 🔥 User Agent
    userAgent: 'com.netflix.mediaclient/62948 (Linux; U; Android 16; en_GB; SM-S928B; Build/BP4A.251205.006; Cronet/119.0.6045.31)',
    
    // 🔥 Branding
    branding: '@Netflix Premium',
    
    // 🔥 Fake IP
    fakeIP: '122.168.2.40'
};

// ==========================================
// 🏷️ BRANDING FUNCTION (IMPROVED)
// ==========================================
const addBranding = (obj) => {
    if (!obj || typeof obj !== 'object') {
        return;
    }

    const tag = ` [${NETFLIX_CONFIG.branding}]`;
    const targetKeys = [
        'title', 'name', 'display_name', 'username', 'nickname',
        'text', 'label', 'heading', 'description', 'subtitle',
        'videoTitle', 'movieName', 'seriesName', 'showName',
        'profileName', 'fullName', 'displayText'
    ];
    
    const processObject = (o, depth = 0) => {
        // Prevent infinite loops
        if (depth > 10) return;
        
        if (!o || typeof o !== 'object') return;
        
        try {
            for (let key in o) {
                if (!o.hasOwnProperty(key)) continue;
                
                if (typeof o[key] === 'string' && targetKeys.includes(key)) {
                    if (!o[key].includes(tag.trim())) {
                        o[key] = o[key].trim() + tag;
                    }
                } else if (typeof o[key] === 'object' && o[key] !== null) {
                    processObject(o[key], depth + 1);
                }
            }
        } catch (e) {
            console.warn('⚠️ Branding iteration error:', e.message);
        }
    };
    
    processObject(obj);
};

// ==========================================
// 🚫 BLOCKED ENDPOINTS
// ==========================================
const BLOCKED_PATTERNS = [
    // Logs
    '/log/android/cl/2',
    '/log/android/logblob/1',
    'logs.netflix.com',
    
    // Analytics/Crash reporting
    'sessions.bugsnag.com',
    'bugsnag',
    
    // Tracking
    '/android/cl/2',
    
    // WebSocket
    'wss://nrdp.ws.ale.netflix.com',
    'wss://push.prod.netflix.com'
];

// ==========================================
// 📋 HELPER FUNCTIONS
// ==========================================

/**
 * Determine if content is JSON based on headers and content
 */
const isJsonContent = (contentType, text) => {
    if (contentType && contentType.includes('application/json')) {
        return true;
    }
    
    if (!text) return false;
    
    const trimmed = text.trim();
    return (trimmed.startsWith('{') || trimmed.startsWith('[')) && 
           (trimmed.endsWith('}') || trimmed.endsWith(']'));
};

/**
 * Safe JSON parse with error details
 */
const safeJsonParse = (text) => {
    try {
        return { success: true, data: JSON.parse(text) };
    } catch (error) {
        return { 
            success: false, 
            error: error.message,
            preview: text.substring(0, 100)
        };
    }
};

/**
 * Build request headers with Netflix config
 */
const buildHeaders = (req) => {
    const headers = { ...req.headers };
    
    // Remove problematic headers
    const removeHeaders = [
        'accept-encoding',
        'content-length',
        'host',
        'connection',
        'cookie'
    ];
    
    removeHeaders.forEach(h => delete headers[h]);
    
    // Set Netflix headers
    headers['x-netflix.esn'] = NETFLIX_CONFIG.esn;
    headers['x-netflix.esnprefix'] = NETFLIX_CONFIG.esnPrefix;
    headers['x-netflix.session.id'] = NETFLIX_CONFIG.sessionId;
    headers['x-netflix.androidapi'] = NETFLIX_CONFIG.androidApi;
    headers['x-netflix.appver'] = NETFLIX_CONFIG.appVer;
    headers['x-netflix.context.app-version'] = NETFLIX_CONFIG.appVersion;
    headers['x-netflix.context.os-version'] = NETFLIX_CONFIG.osVersion;
    headers['x-netflix.deviceformfactor'] = 'PHONE';
    headers['x-netflix.devicememorylevel'] = 'HIGH';
    headers['user-agent'] = NETFLIX_CONFIG.userAgent;
    headers['x-forwarded-for'] = NETFLIX_CONFIG.fakeIP;
    headers['x-real-ip'] = NETFLIX_CONFIG.fakeIP;
    
    if (NETFLIX_CONFIG.profileGuid) {
        headers['x-netflix.client.current-profile-guid'] = NETFLIX_CONFIG.profileGuid;
    }
    
    // Set cookies
    const cookies = [
        `nfvdid=${NETFLIX_CONFIG.nfvdid}`,
        `flwssn=db673be0-e6a1-4346-8c01-b061caaf8bdd`,
        `NetflixId=${NETFLIX_CONFIG.netflixId}`,
        `SecureNetflixId=${NETFLIX_CONFIG.secureNetflixId}`
    ];
    headers['cookie'] = cookies.join('; ');
    
    return headers;
};

/**
 * Determine target URL based on path
 */
const determineTargetUrl = (path) => {
    if (path.includes('occ-0-4409-3647.1.nflxso.net') || path.includes('nflxso.net')) {
        return `https://occ-0-4409-3647.1.nflxso.net${path}`;
    } else if (path.includes('android.prod.cloud.netflix.com')) {
        return `${NETFLIX_CONFIG.cloudUrl}${path}`;
    } else {
        return `${NETFLIX_CONFIG.baseUrl}${path}`;
    }
};

// ==========================================
// 🚀 MAIN HANDLER (UPDATED)
// ==========================================
export default async function handler(req, res) {
    try {
        // Extract URL path
        let urlPath = req.headers['x-invoke-path'] || req.url || '/';
        const cleanPath = urlPath.split('?')[0];
        const method = req.method || 'GET';

        // ==========================================
        // 🔄 CORS HEADERS
        // ==========================================
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', '*');

        if (method === 'OPTIONS') {
            return res.status(200).end();
        }

        // ==========================================
        // 🚫 BLOCK LOGS/ANALYTICS/WEBSOCKET
        // ==========================================
        if (BLOCKED_PATTERNS.some(p => cleanPath.includes(p))) {
            console.log(`🚫 Blocked: ${method} ${cleanPath}`);
            return res.status(200).json({ 
                status: true,
                data: {} 
            });
        }

        // ==========================================
        // 🔄 DETERMINE TARGET URL
        // ==========================================
        const targetUrl = determineTargetUrl(urlPath);
        console.log(`🔄 ${method} ${targetUrl.substring(0, 80)}...`);

        // ==========================================
        // 📝 BUILD FETCH OPTIONS
        // ==========================================
        const headers = buildHeaders(req);
        
        const fetchOptions = {
            method: method,
            headers: headers,
            timeout: 30000
        };

        // Handle request body
        if (method !== 'GET' && method !== 'HEAD' && req.body) {
            if (typeof req.body === 'string') {
                fetchOptions.body = req.body;
            } else if (Buffer.isBuffer(req.body)) {
                fetchOptions.body = req.body;
            } else if (typeof req.body === 'object') {
                try {
                    fetchOptions.body = JSON.stringify(req.body);
                } catch (e) {
                    console.error('❌ Body stringify error:', e.message);
                    return res.status(400).json({
                        status: false,
                        error: 'Invalid request body'
                    });
                }
            }
        }

        // ==========================================
        // 🚀 FORWARD REQUEST
        // ==========================================
        let response;
        try {
            response = await fetch(targetUrl, fetchOptions);
        } catch (fetchError) {
            console.error('❌ Fetch error:', fetchError.message);
            return res.status(502).json({
                status: false,
                error: `Failed to reach Netflix: ${fetchError.message}`
            });
        }

        // ==========================================
        // 📥 HANDLE RESPONSE
        // ==========================================
        
        // Handle no-content responses
        if (response.status === 204 || response.status === 304) {
            console.log(`✅ ${response.status} (No Content)`);
            return res.status(response.status).end();
        }

        // Get response text
        let responseText;
        try {
            responseText = await response.text();
        } catch (readError) {
            console.error('❌ Error reading response:', readError.message);
            return res.status(502).json({
                status: false,
                error: 'Failed to read response body'
            });
        }

        // Handle empty responses
        if (!responseText || responseText.trim() === '') {
            console.log(`✅ ${response.status} (Empty Response)`);
            if (response.status >= 200 && response.status < 300) {
                return res.status(response.status).json({ status: true, data: {} });
            }
            return res.status(response.status).end();
        }

        // Get content type
        const contentType = response.headers.get('content-type') || '';

        // ==========================================
        // 🔍 DETERMINE RESPONSE TYPE
        // ==========================================
        
        if (isJsonContent(contentType, responseText)) {
            // JSON response
            const parseResult = safeJsonParse(responseText);
            
            if (!parseResult.success) {
                console.error('❌ JSON Parse Error:', parseResult.error);
                console.error('   Preview:', parseResult.preview);
                
                // Return raw if can't parse
                res.setHeader('content-type', contentType || 'text/plain');
                return res.status(response.status).send(responseText);
            }

            let data = parseResult.data;

            // ✅ Apply branding safely
            try {
                if (data && typeof data === 'object') {
                    addBranding(data);
                }
            } catch (brandingError) {
                console.warn('⚠️ Branding error (continuing anyway):', brandingError.message);
            }

            console.log(`✅ ${response.status} (JSON)`);
            return res.status(response.status).json(data);

        } else {
            // Non-JSON response (image, video, HTML, etc.)
            console.log(`✅ ${response.status} (${contentType || 'Binary'})`);
            
            // Copy relevant headers
            response.headers.forEach((value, key) => {
                const skipHeaders = [
                    'content-encoding',
                    'content-length',
                    'transfer-encoding',
                    'connection'
                ];
                
                if (!skipHeaders.includes(key.toLowerCase())) {
                    try {
                        res.setHeader(key, value);
                    } catch (e) {
                        console.warn(`⚠️ Could not set header ${key}`);
                    }
                }
            });
            
            return res.status(response.status).send(responseText);
        }

    } catch (error) {
        console.error('❌ PROXY ERROR:', error);
        return res.status(500).json({
            status: false,
            error: `Proxy Error: ${error.message}`,
            timestamp: new Date().toISOString()
        });
    }
}
