// ==========================================
// 📡 ALRIGHT TV PROXY — FINAL FIXED
// ==========================================

const BASE_URL = "https://alright-prod-b4argqfwfdfpezfc.centralindia-01.azurewebsites.net";

const PREMIUM_TOKEN = "Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjI0N2Y4MDYwMDM5YjVmNDBkOTQ5NjkzOGJiMTg5NzA2ZWY4ODkzM2QiLCJ0eXAiOiJKV1QifQ.eyJsb2dpblR5cGUiOjAsInVzZXJJZCI6IjZhNzMxMGNkNzJhNDhlZjkxYmJmOWE3NSIsInBob25lVmVyaWZpZWQiOnRydWUsInBob25lX251bWJlciI6Iis5MTkyMDUyMzEwNDIiLCJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vYWxyaWdodC0zYWRmZCIsImF1ZCI6ImFscmlnaHQtM2FkZmQiLCJhdXRoX3RpbWUiOjE3ODg1OTUwMDEsInVzZXJfaWQiOiJNTy0zNTU2NDNmYTc3YWU0ZDVlYWI2NDdjYWMzYjRkZjAxNCIsInN1YiI6Ik1PLTM1NTY0M2ZhNzdhZTRkNWVhYjY0N2NhYzNiNGRmMDE0IiwiaWF0IjoxNzg4NTk1MDAxLCJleHAiOjE3ODg1OTg2MDEsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnt9LCJzaWduX2luX3Byb3ZpZGVyIjoiY3VzdG9tIn19.NTogk3P0OAnfoZ4w9PyadnbeyuitdMXgddgJEcB1a4vhhUQly5iAQzKcrPndNHoVG2Zd12JFrM8WldOAgNMHW4TV4NqV2agkXH-QqlVppJHFQvVCcvE6n73i51ow0zmjYhOz3KCba2UWNdGmhERgxjOJRCRWmTawYs7Ys3kHTxSjpHOxCk4gEoNeeHe3Ix2sQUwXRSa69O1hJNtBpjKKagB8181ZOo05yNfnhgW77b3CxT6KXVwLhAky91QycWhluZXQenfAMI9bSEzaxJudsPN6h7n5Hq95dvDe8VSIOXpLq7fGK18SwsElg1LB6vl6IuRhOd85KsfnnFiwAFruIA";

const PREMIUM_USER_ID = "6a7310cd72a48ef91bbf9a75";

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

// SIRF TRACKING BLOCK
const BLOCKED_PATTERNS = [
    'sentry.io', 'posthog', 'moengage',
    'events.otpless', 'firebaseinstallations'
];

// LOGIN ENDPOINTS
const LOGIN_ENDPOINTS = [
    '/user/phone-otp/send',
    '/user/phone-otp/verify',
    '/user/firebase-login',
    '/user/otpless-login'
];

export default async function handler(req, res) {
    // 🔥 IMPORTANT: URL path sahi se extract karo
    let urlPath = req.headers['x-invoke-path'] || req.url;
    
    // 🔥 Agar URL / se start nahi hota toh / add karo
    if (!urlPath.startsWith('/')) {
        urlPath = '/' + urlPath;
    }
    
    const cleanPath = urlPath.split('?')[0];
    const method = req.method;

    console.log("📥", method, cleanPath);

    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');

    if (method === 'OPTIONS') {
        return res.status(200).end();
    }

    // TRACKING BLOCK
    if (BLOCKED_PATTERNS.some(p => cleanPath.includes(p))) {
        console.log("🚫 Blocked:", cleanPath);
        return res.status(200).json({ status: true, message: "Blocked" });
    }

    try {
        const headers = {};

        // Original headers copy
        if (req.headers) {
            Object.keys(req.headers).forEach(key => {
                const lowerKey = key.toLowerCase();
                if (!['accept-encoding', 'content-length', 'host', 'connection'].includes(lowerKey)) {
                    headers[key] = req.headers[key];
                }
            });
        }

        // Inject hardcoded headers
        Object.keys(INJECT_HEADERS).forEach(key => {
            headers[key] = INJECT_HEADERS[key];
        });

        // 🔥 HAR REQUEST MEIN PREMIUM TOKEN INJECT
        headers['authorization'] = PREMIUM_TOKEN;

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

        // 🔥🔥🔥 TARGET URL = BASE_URL + PATH
        const targetUrl = BASE_URL + urlPath;
        console.log("🚀 Forwarding to:", targetUrl);

        const response = await fetch(targetUrl, fetchOptions);
        let data = await response.text();

        // 🔥 LOGIN RESPONSE MEIN TOKEN REPLACE
        try {
            let jsonData = JSON.parse(data);
            
            // Token replace
            if (jsonData.idToken || jsonData.token || jsonData.accessToken) {
                jsonData.idToken = PREMIUM_TOKEN;
                jsonData.token = PREMIUM_TOKEN;
                jsonData.accessToken = PREMIUM_TOKEN;
                jsonData.authorization = PREMIUM_TOKEN;
                console.log("✅ Token replaced!");
            }

            // User ID replace
            if (jsonData.userId) jsonData.userId = PREMIUM_USER_ID;
            if (jsonData.uid) jsonData.uid = PREMIUM_USER_ID;
            if (jsonData.sub) jsonData.sub = PREMIUM_USER_ID;

            // User info inject
            if (jsonData.user || jsonData.userInfo || jsonData.response) {
                const user = jsonData.user || jsonData.userInfo || jsonData.response;
                if (typeof user === 'object') {
                    user.userId = PREMIUM_USER_ID;
                    user.uid = PREMIUM_USER_ID;
                    user.isSubscribed = true;
                    user.subscriptionStatus = 'active';
                    user.packageType = 'premium';
                    user.validity = 'Lifetime Unlimited';
                    console.log("✅ Premium user data injected!");
                }
            }

            data = JSON.stringify(jsonData);
            
        } catch (e) {
            console.log("⚠️ Not JSON");
        }

        response.headers.forEach((value, key) => {
            if (!['content-encoding', 'content-length', 'transfer-encoding'].includes(key)) {
                res.setHeader(key, value);
            }
        });

        console.log("✅ Status:", response.status);
        return res.status(response.status).send(data);

    } catch (error) {
        console.error("❌ Error:", error);
        return res.status(500).json({
            status: false,
            error: "Proxy Error: " + error.message
        });
    }
}
