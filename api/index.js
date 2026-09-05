// ==========================================
// 📡 ALRIGHT TV PROXY — OTP LOGIN + PREMIUM TOKEN INJECT
// ==========================================

const BASE_URL = "https://alright-prod-b4argqfwfdfpezfc.centralindia-01.azurewebsites.net";

// 🔥 TERA PREMIUM TOKEN (jo capture mein mila)
const PREMIUM_TOKEN = "Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjI0N2Y4MDYwMDM5YjVmNDBkOTQ5NjkzOGJiMTg5NzA2ZWY4ODkzM2QiLCJ0eXAiOiJKV1QifQ.eyJsb2dpblR5cGUiOjAsInVzZXJJZCI6IjZhNzMxMGNkNzJhNDhlZjkxYmJmOWE3NSIsInBob25lVmVyaWZpZWQiOnRydWUsInBob25lX251bWJlciI6Iis5MTkyMDUyMzEwNDIiLCJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vYWxyaWdodC0zYWRmZCIsImF1ZCI6ImFscmlnaHQtM2FkZmQiLCJhdXRoX3RpbWUiOjE3ODg1OTUwMDEsInVzZXJfaWQiOiJNTy0zNTU2NDNmYTc3YWU0ZDVlYWI2NDdjYWMzYjRkZjAxNCIsInN1YiI6Ik1PLTM1NTY0M2ZhNzdhZTRkNWVhYjY0N2NhYzNiNGRmMDE0IiwiaWF0IjoxNzg4NTk1MDAxLCJleHAiOjE3ODg1OTg2MDEsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnt9LCJzaWduX2luX3Byb3ZpZGVyIjoiY3VzdG9tIn19.NTogk3P0OAnfoZ4w9PyadnbeyuitdMXgddgJEcB1a4vhhUQly5iAQzKcrPndNHoVG2Zd12JFrM8WldOAgNMHW4TV4NqV2agkXH-QqlVppJHFQvVCcvE6n73i51ow0zmjYhOz3KCba2UWNdGmhERgxjOJRCRWmTawYs7Ys3kHTxSjpHOxCk4gEoNeeHe3Ix2sQUwXRSa69O1hJNtBpjKKagB8181ZOo05yNfnhgW77b3CxT6KXVwLhAky91QycWhluZXQenfAMI9bSEzaxJudsPN6h7n5Hq95dvDe8VSIOXpLq7fGK18SwsElg1LB6vl6IuRhOd85KsfnnFiwAFruIA";

// 🔥 Premium User ID (jo token mein hai)
const PREMIUM_USER_ID = "6a7310cd72a48ef91bbf9a75";

// 🔥 Premium Phone Number (jo token mein hai)
const PREMIUM_PHONE = "+919205231042";

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

// 🚫 Block Tracking
const BLOCKED_PATTERNS = [
    'sentry.io', 'firebaselogging', 'posthog', 'moengage',
    'otpless', 'clevertap', 'appsflyer', 'analytics',
    'events.otpless', 'firebaseinstallations',
    'securetoken.googleapis.com', 'identitytoolkit'
];

// 🔥 Login Endpoints — yahan token replace karna hai
const LOGIN_ENDPOINTS = [
    '/user/phone-otp/verify',
    '/user/otpless-login',
    '/user/firebase-login',
    '/user/login'
];

export default async function handler(req, res) {
    let urlPath = req.headers['x-invoke-path'] || req.url;
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

    // 🚫 Block Tracking
    if (BLOCKED_PATTERNS.some(p => cleanPath.includes(p))) {
        console.log("🚫 Blocked:", cleanPath);
        return res.status(200).json({ status: true, message: "Blocked" });
    }

    try {
        const headers = {};

        // Original headers copy
        if (req.headers) {
            Object.keys(req.headers).forEach(key => {
                if (!['accept-encoding', 'content-length', 'host', 'connection'].includes(key.toLowerCase())) {
                    headers[key] = req.headers[key];
                }
            });
        }

        // 🔥 Inject hardcoded headers
        Object.keys(INJECT_HEADERS).forEach(key => {
            headers[key] = INJECT_HEADERS[key];
        });

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

        // ==========================================
        // 🎯 LOGIN REQUEST — TOKEN REPLACE
        // ==========================================
        const isLogin = LOGIN_ENDPOINTS.some(e => cleanPath.includes(e));

        if (isLogin) {
            console.log("🔐 Login request detected:", cleanPath);

            // 🔥 Login request forward karo
            const targetUrl = BASE_URL + urlPath;
            const response = await fetch(targetUrl, fetchOptions);
            let data = await response.text();

            // 🔥🔥🔥 RESPONSE MEIN TOKEN REPLACE
            try {
                let jsonData = JSON.parse(data);

                console.log("📦 Original response keys:", Object.keys(jsonData));

                // 🎯 Token replace karo — user ka token hatake premium token daalo
                if (jsonData.token) {
                    jsonData.token = PREMIUM_TOKEN;
                    console.log("✅ Token replaced!");
                }
                if (jsonData.idToken) {
                    jsonData.idToken = PREMIUM_TOKEN;
                    console.log("✅ idToken replaced!");
                }
                if (jsonData.accessToken) {
                    jsonData.accessToken = PREMIUM_TOKEN;
                    console.log("✅ accessToken replaced!");
                }
                if (jsonData.firebaseToken) {
                    jsonData.firebaseToken = PREMIUM_TOKEN;
                    console.log("✅ firebaseToken replaced!");
                }
                if (jsonData.authorization) {
                    jsonData.authorization = PREMIUM_TOKEN;
                }

                // 🎯 User ID replace karo — premium user ID daalo
                if (jsonData.userId) {
                    jsonData.userId = PREMIUM_USER_ID;
                    console.log("✅ userId replaced!");
                }
                if (jsonData.user && jsonData.user.id) {
                    jsonData.user.id = PREMIUM_USER_ID;
                }
                if (jsonData.user && jsonData.user.userId) {
                    jsonData.user.userId = PREMIUM_USER_ID;
                }

                // 🎯 Phone number replace karo — premium phone daalo
                if (jsonData.phoneNumber) {
                    jsonData.phoneNumber = PREMIUM_PHONE;
                }
                if (jsonData.user && jsonData.user.phoneNumber) {
                    jsonData.user.phoneNumber = PREMIUM_PHONE;
                }
                if (jsonData.user && jsonData.user.mobile) {
                    jsonData.user.mobile = PREMIUM_PHONE;
                }

                // 🎯 Premium status inject
                if (jsonData.user) {
                    jsonData.user.isSubscribed = true;
                    jsonData.user.subscriptionStatus = 'active';
                    jsonData.user.packageType = 'premium';
                    jsonData.user.validity = 'Lifetime Unlimited';
                }
                jsonData.isPremium = true;
                jsonData.isSubscribed = true;

                data = JSON.stringify(jsonData);
                console.log("✅ All replacements done!");

            } catch (e) {
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

        // 🔥 Har normal request mein premium token daalo
        headers['authorization'] = PREMIUM_TOKEN;

        const targetUrl = BASE_URL + urlPath;
        console.log("🚀 Forwarding to:", targetUrl);

        const response = await fetch(targetUrl, fetchOptions);
        let data = await response.text();

        // 🔥 Response mein bhi token replace karo agar aaye
        try {
            let jsonData = JSON.parse(data);
            let modified = false;

            if (jsonData.token) {
                jsonData.token = PREMIUM_TOKEN;
                modified = true;
            }
            if (jsonData.idToken) {
                jsonData.idToken = PREMIUM_TOKEN;
                modified = true;
            }
            if (jsonData.accessToken) {
                jsonData.accessToken = PREMIUM_TOKEN;
                modified = true;
            }
            if (jsonData.user && jsonData.user.id) {
                jsonData.user.id = PREMIUM_USER_ID;
                modified = true;
            }
            if (jsonData.user && jsonData.user.userId) {
                jsonData.user.userId = PREMIUM_USER_ID;
                modified = true;
            }
            if (jsonData.user) {
                jsonData.user.isSubscribed = true;
                jsonData.user.subscriptionStatus = 'active';
                jsonData.user.packageType = 'premium';
                jsonData.user.validity = 'Lifetime Unlimited';
                modified = true;
            }

            if (modified) {
                data = JSON.stringify(jsonData);
                console.log("✅ Response modified!");
            }
        } catch (e) {
            // Not JSON
        }

        response.headers.forEach((value, key) => {
            if (!['content-encoding', 'content-length', 'transfer-encoding'].includes(key)) {
                res.setHeader(key, value);
            }
        });

        return res.status(response.status).send(data);

    } catch (error) {
        console.error("❌ Error:", error);
        return res.status(500).json({
            status: false,
            error: "Proxy Error: " + error.message
        });
    }
}
