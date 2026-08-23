// ==========================================
// 📺 NETFLIX PROXY - WITH BINARY SUPPORT
// ==========================================

// ==========================================
// 🔒 NETFLIX CONFIG
// ==========================================
const NETFLIX_CONFIG = {
    baseUrl: 'https://android.prod.ftl.netflix.com',
    cloudUrl: 'https://android.prod.cloud.netflix.com',
    logsUrl: 'https://logs.netflix.com',
    bugsnagUrl: 'https://sessions.bugsnag.com',
    occUrl: 'https://occ-0-4409-3647.1.nflxso.net',
    
    // 🔥 Device Details
    esn: 'NFANDROID1-PXA-P-SAMSUSM-S928B-31506-0202JA72A3JBBA23MNJ42U6INDEUFEFAPKANFOJ04A8UI04N1SJMO7JR6JMQ6QLOP60A3ICK060L3UAQ5AD2BL0M0IILPEP1TNL48D29',
    esnPrefix: 'NFANDROID1-PRV-P-L3-',
    sessionId: '730199105',
    profileGuid: 'WZFVPUH3OFDT3OOGEQJJF7H5HY',
    
    appVersion: '9.22.1',
    androidApi: '36',
    osVersion: '36',
    userAgent: 'com.netflix.mediaclient/62948 (Linux; U; Android 16; en_GB; SM-S928B; Build/BP4A.251205.006; Cronet/119.0.6045.31)',
    
    branding: '@Netflix Premium',
    fakeIP: '122.168.2.40'
};

// ==========================================
// 🏷️ BRANDING FUNCTION
// ==========================================
const addBranding = (obj) => {
    const tag = ` [${NETFLIX_CONFIG.branding}]`;
    const targetKeys = [
        'title', 'name', 'display_name', 'username', 'nickname',
        'text', 'label', 'heading', 'description', 'subtitle',
        'videoTitle', 'movieName', 'seriesName', 'showName',
        'profileName', 'fullName', 'displayText'
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
    'logs.netflix.com',
    'sessions.bugsnag.com',
    'bugsnag',
    '/log/android/cl/2',
    '/log/android/logblob/1',
    'wss://nrdp.ws.ale.netflix.com',
    'wss://push.prod.netflix.com'
];

// ==========================================
// 🚀 MAIN HANDLER
// ==========================================

    // ==========================================
// 🚀 MAIN HANDLER (FIXED)
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
    // 🚫 BLOCK LOGS/ANALYTICS/WEBSOCKET
    // ==========================================
    if (BLOCKED_PATTERNS.some(p => cleanPath.includes(p))) {
        return res.status(200).json({ 
            status: true,
            data: {} 
        });
    }

    // ==========================================
    // 🔄 DETERMINE TARGET URL
    // ==========================================
    let targetUrl;
    if (cleanPath.includes('occ-0-4409-3647.1.nflxso.net') || 
        cleanPath.includes('nflxso.net')) {
        targetUrl = 'https://occ-0-4409-3647.1.nflxso.net' + urlPath;
    } else if (cleanPath.includes('android.prod.cloud.netflix.com')) {
        targetUrl = NETFLIX_CONFIG.cloudUrl + urlPath;
    } else if (cleanPath.includes('logs.netflix.com')) {
        return res.status(200).json({ status: true });
    } else if (cleanPath.includes('sessions.bugsnag.com')) {
        return res.status(200).json({ status: 'accepted' });
    } else {
        targetUrl = NETFLIX_CONFIG.baseUrl + urlPath;
    }

    // ==========================================
    // 📝 BUILD HEADERS
    // ==========================================
    const headers = { ...req.headers };
    
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
    
    const cookies = [
        `nfvdid=${NETFLIX_CONFIG.nfvdid}`,
        `flwssn=db673be0-e6a1-4346-8c01-b061caaf8bdd`,
        `NetflixId=${NETFLIX_CONFIG.netflixId}`,
        `SecureNetflixId=${NETFLIX_CONFIG.secureNetflixId}`
    ];
    headers['cookie'] = cookies.join('; ');
    
    delete headers['accept-encoding'];
    delete headers['content-length'];
    delete headers['host'];
    delete headers['connection'];

    // ==========================================
    // 🚀 FORWARD REQUEST (FIXED)
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
        
        // ✅ FIX: Handle empty responses
        if (response.status === 204 || response.status === 304) {
            return res.status(response.status).end();
        }

        const responseText = await response.text();

        // ✅ FIX: Check if response is empty
        if (!responseText || responseText.trim() === '') {
            return res.status(response.status).json({ 
                status: true,
                data: {} 
            });
        }

        // ✅ FIX: Check content-type BEFORE parsing
        const isJsonResponse = contentType.includes('application/json') || 
                               responseText.trim().startsWith('{') || 
                               responseText.trim().startsWith('[');

        if (isJsonResponse) {
            try {
                let data = JSON.parse(responseText);
                
                // ✅ FIX: Safely add branding with error handling
                try {
                    if (data && typeof data === 'object') {
                        addBranding(data);
                    }
                } catch (brandingError) {
                    console.warn('⚠️ Branding error:', brandingError.message);
                    // Continue anyway, don't fail
                }
                
                return res.status(response.status).json(data);
            } catch (parseError) {
                console.error('❌ JSON Parse Error:', parseError, 'Text:', responseText.substring(0, 200));
                return res.status(response.status).send(responseText);
            }
        } else {
            // Non-JSON response (video, image, etc.)
            response.headers.forEach((value, key) => {
                if (!['content-encoding', 'content-length', 'transfer-encoding'].includes(key)) {
                    res.setHeader(key, value);
                }
            });
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
