// ==========================================
// 📺 NETFLIX PROXY - VERCEL RAW BODY)
// ==========================================

// 🔥 IMPORTANT: bodyParser: false in vercel.json

const NETFLIX_CONFIG = {
    ftlUrl: 'https://android.prod.ftl.netflix.com',
    cloudUrl: 'https://android.prod.cloud.netflix.com',
    logsUrl: 'https://logs.netflix.com',
    occUrl: 'https://occ-0-4409-3647.1.nflxso.net',
    
    // Hard-coded values (use env vars)
    esn: process.env.NETFLIX_ESN || 'NFANDROID1-PXA-P-SAMSUSM-S928B-31506-0202JA72A3JBBA23MNJ42U6INDEUFEFAPKANFOJ04A8UI04N1SJMO7JR6JMQ6QLOP60A3ICK060L3UAQ5AD2BL0M0IILPEP1TNL48D29',
    sessionId: process.env.NETFLIX_SESSION_ID || '730199105',
    appVersion: '9.22.1',
    osVersion: '36',
    androidApi: '36',
    profileGuid: process.env.NETFLIX_PROFILE_GUID || 'WZFVPUH3OFDT3OOGEQJJF7H5HY',
    userAgent: 'com.netflix.mediaclient/62948 (Linux; U; Android 16; en_GB; SM-S928B; Build/BP4A.251205.006; Cronet/119.0.6045.31)',
    fakeIP: '223.188.42.214',
    branding: '@Netflix Premium'
};

// ==========================================
// 🚀 MAIN HANDLER - WITH RAW BODY
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
    if (cleanPath.includes('/logout') || cleanPath.includes('/signout')) {
        return res.status(200).json({
            status: 'success',
            data: { message: "Logout disabled" }
        });
    }

    // ==========================================
    // 🚫 BLOCK LOGS/BUGSNAG
    // ==========================================
    if (cleanPath.includes('logs.netflix.com') || cleanPath.includes('/log/android/')) {
        return res.status(200).send('');
    }
    if (cleanPath.includes('bugsnag') || cleanPath.includes('sessions.bugsnag')) {
        return res.status(202).json({ status: 'accepted' });
    }

    // ==========================================
    // 🔄 DETERMINE TARGET URL
    // ==========================================
    let targetUrl;
    const originalHost = req.headers['host'] || '';
    
    if (originalHost.includes('android.prod.ftl.netflix.com') || 
        cleanPath.includes('/nq/') || cleanPath.includes('/android/')) {
        targetUrl = `https://android.prod.ftl.netflix.com${urlPath}`;
    } else if (originalHost.includes('android.prod.cloud.netflix.com') || cleanPath.includes('/graphql')) {
        targetUrl = `https://android.prod.cloud.netflix.com${urlPath}`;
    } else if (cleanPath.includes('nflxso.net')) {
        targetUrl = `https://occ-0-4409-3647.1.nflxso.net${urlPath}`;
    } else {
        targetUrl = `https://android.prod.ftl.netflix.com${urlPath}`;
    }

    // ==========================================
    // 📝 BUILD HEADERS
    // ==========================================
    const headers = {};
    
    // Copy original headers (except problematic)
    if (req.headers) {
        Object.keys(req.headers).forEach(key => {
            const lower = key.toLowerCase();
            if (!['host', 'connection', 'content-length', 'accept-encoding'].includes(lower)) {
                headers[key] = req.headers[key];
            }
        });
    }
    
    // Netflix headers
    headers['x-netflix.clienttype'] = 'samurai';
    headers['x-netflix.context.os-version'] = NETFLIX_CONFIG.osVersion;
    headers['x-netflix.devicememorylevel'] = 'HIGH';
    headers['x-netflix.session.id'] = NETFLIX_CONFIG.sessionId;
    headers['x-netflix.zuul.brotli.allowed'] = 'true';
    headers['x-netflix.context.app-version'] = NETFLIX_CONFIG.appVersion;
    headers['x-netflix.context.locales'] = 'en-IN';
    headers['x-netflix.context.ui-flavor'] = 'android';
    headers['x-netflix.appver'] = NETFLIX_CONFIG.appVersion;
    headers['x-netflix.esnprefix'] = 'NFANDROID1-PRV-P-';
    headers['x-netflix.androidapi'] = NETFLIX_CONFIG.androidApi;
    headers['x-netflix.deviceformfactor'] = 'PHONE';
    headers['x-netflix.esn'] = NETFLIX_CONFIG.esn;
    headers['x-netflix.request.attempt'] = '1';
    headers['x-netflix.client.current-profile-guid'] = NETFLIX_CONFIG.profileGuid;
    headers['user-agent'] = NETFLIX_CONFIG.userAgent;
    headers['x-forwarded-for'] = NETFLIX_CONFIG.fakeIP;
    headers['x-real-ip'] = NETFLIX_CONFIG.fakeIP;

    // ==========================================
    // 🚀 FORWARD REQUEST - RAW BODY
    // ==========================================
    try {
        const fetchOptions = {
            method: method,
            headers: headers,
        };

        // 🔥 RAW BODY - Vercel se direct buffer
        if (method !== 'GET' && method !== 'HEAD') {
            // Vercel raw body ko buffer me access
            const rawBody = req.body;
            
            if (rawBody !== undefined && rawBody !== null) {
                // Agar buffer hai toh direct bhejo
                if (Buffer.isBuffer(rawBody)) {
                    fetchOptions.body = rawBody;
                } 
                // Agar string hai toh as-is bhejo
                else if (typeof rawBody === 'string') {
                    fetchOptions.body = rawBody;
                }
                // Agar object hai (JSON) toh stringify
                else if (typeof rawBody === 'object') {
                    fetchOptions.body = JSON.stringify(rawBody);
                }
            }
        }

        console.log(`🔄 ${method} ${targetUrl}`);

        const response = await fetch(targetUrl, fetchOptions);
        
        // 🔥 RAW RESPONSE - buffer me lo
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Copy response headers
        response.headers.forEach((value, key) => {
            if (!['content-encoding', 'content-length', 'transfer-encoding'].includes(key)) {
                res.setHeader(key, value);
            }
        });

        // 🔥 SEND RAW RESPONSE - no JSON parsing unless needed
        const contentType = response.headers.get('content-type') || '';
        
        // Only try JSON parse for pure JSON responses
        if (contentType.includes('application/json') && !contentType.includes('msl')) {
            try {
                const text = buffer.toString('utf-8');
                let data = JSON.parse(text);
                // Add branding only for JSON responses
                const tag = ` [${NETFLIX_CONFIG.branding}]`;
                // Simple branding - only for known fields
                if (data && typeof data === 'object') {
                    // Add branding to titles
                    if (data.data && data.data.account) {
                        data.data.account.branding = NETFLIX_CONFIG.branding;
                    }
                }
                return res.status(response.status).json(data);
            } catch (e) {
                // JSON parse fail - send raw
                return res.status(response.status).send(buffer);
            }
        } else {
            // Binary response - send raw
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
