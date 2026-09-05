// ==========================================
// 📡 ALRIGHT TV PROXY — PREMIUM TOKEN INJECTOR (FINAL WORKING)
// ==========================================

const BASE_URL = "https://alright-prod-b4argqfwfdfpezfc.centralindia-01.azurewebsites.net";

// 🔥 TERA PREMIUM TOKEN (JO CAPTURE MEIN MILA)
const PREMIUM_TOKEN = "Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjI0N2Y4MDYwMDM5YjVmNDBkOTQ5NjkzOGJiMTg5NzA2ZWY4ODkzM2QiLCJ0eXAiOiJKV1QifQ.eyJsb2dpblR5cGUiOjAsInVzZXJJZCI6IjZhNzMxMGNkNzJhNDhlZjkxYmJmOWE3NSIsInBob25lVmVyaWZpZWQiOnRydWUsInBob25lX251bWJlciI6Iis5MTkyMDUyMzEwNDIiLCJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vYWxyaWdodC0zYWRmZCIsImF1ZCI6ImFscmlnaHQtM2FkZmQiLCJhdXRoX3RpbWUiOjE3ODg1OTUwMDEsInVzZXJfaWQiOiJNTy0zNTU2NDNmYTc3YWU0ZDVlYWI2NDdjYWMzYjRkZjAxNCIsInN1YiI6Ik1PLTM1NTY0M2ZhNzdhZTRkNWVhYjY0N2NhYzNiNGRmMDE0IiwiaWF0IjoxNzg4NTk1MDAxLCJleHAiOjE3ODg1OTg2MDEsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnt9LCJzaWduX2luX3Byb3ZpZGVyIjoiY3VzdG9tIn19.NTogk3P0OAnfoZ4w9PyadnbeyuitdMXgddgJEcB1a4vhhUQly5iAQzKcrPndNHoVG2Zd12JFrM8WldOAgNMHW4TV4NqV2agkXH-QqlVppJHFQvVCcvE6n73i51ow0zmjYhOz3KCba2UWNdGmhERgxjOJRCRWmTawYs7Ys3kHTxSjpHOxCk4gEoNeeHe3Ix2sQUwXRSa69O1hJNtBpjKKagB8181ZOo05yNfnhgW77b3CxT6KXVwLhAky91QycWhluZXQenfAMI9bSEzaxJudsPN6h7n5Hq95dvDe8VSIOXpLq7fGK18SwsElg1LB6vl6IuRhOd85KsfnnFiwAFruIA";

// 🔥 PREMIUM USER ID
const PREMIUM_USER_ID = "6a7310cd72a48ef91bbf9a75";

// 🔥 PREMIUM PHONE NUMBER
const PREMIUM_PHONE = "+919205231042";

// 🔥 HAR REQUEST MEIN INJECT HONE WALE HEADERS
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

// 🚫 BLOCK TRACKING/ANALYTICS
const BLOCKED_PATTERNS = [
    'sentry.io',
    'firebaselogging',
    'posthog',
    'moengage',
    'otpless',
    'clevertap',
    'appsflyer',
    'analytics',
    'events.otpless',
    'firebaseinstallations',
    'securetoken.googleapis.com',
    'identitytoolkit',
    'user-auth.otpless.app',
    'firebaseremoteconfig',
    'firebaselogging',
    'androidcheck',
    'safetynet',
    'firebaseappcheck'
];

// 🔥 LOGIN ENDPOINTS — YAHAN TOKEN REPLACE KARNA HAI
const LOGIN_ENDPOINTS = [
    '/user/phone-otp/verify',
    '/user/otpless-login',
    '/user/firebase-login',
    '/user/login',
    '/v1/auth/login'
];

export default async function handler(req, res) {
    // 🔥 SAHI TARIKA — req.url se full path lo
    const url = new URL(req.url, `http://${req.headers.host}`);
    const fullPath = url.pathname + url.search;
    const cleanPath = url.pathname;
    const method = req.method;

    console.log("=".repeat(50));
    console.log("📥", method, cleanPath);
    console.log("📥 Full Path:", fullPath);

    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');

    if (method === 'OPTIONS') {
        return res.status(200).end();
    }

    // 🚫 BLOCK TRACKING
    if (BLOCKED_PATTERNS.some(p => cleanPath.includes(p))) {
        console.log("🚫 Blocked:", cleanPath);
        return res.status(200).json({
            status: true,
            message: "Blocked",
            data: {}
        });
    }

    try {
        // 🔥 HEADERS BUILD
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

        // 🔥 Inject hardcoded headers
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

        // 🎯 TARGET URL
        const targetUrl = BASE_URL + fullPath;
        console.log("🚀 Target:", targetUrl);

        const response = await fetch(targetUrl, fetchOptions);
        let data = await response.text();

        console.log("📦 Response Status:", response.status);
        console.log("📦 Response Length:", data.length);

        // ==========================================
        // 🔥🔥🔥 RESPONSE MODIFY — TOKEN REPLACE
        // ==========================================
        try {
            let jsonData = JSON.parse(data);
            let modified = false;

            console.log("📦 Response Keys:", Object.keys(jsonData));

            // 🎯 TOKEN REPLACE
            const tokenKeys = ['token', 'idToken', 'accessToken', 'firebaseToken', 'authorization'];
            tokenKeys.forEach(key => {
                if (jsonData[key]) {
                    jsonData[key] = PREMIUM_TOKEN;
                    modified = true;
                    console.log(`✅ ${key} replaced`);
                }
            });

            // 🎯 USER ID REPLACE
            if (jsonData.userId) {
                jsonData.userId = PREMIUM_USER_ID;
                modified = true;
                console.log("✅ userId replaced");
            }
            if (jsonData.user && jsonData.user.id) {
                jsonData.user.id = PREMIUM_USER_ID;
                modified = true;
                console.log("✅ user.id replaced");
            }
            if (jsonData.user && jsonData.user.userId) {
                jsonData.user.userId = PREMIUM_USER_ID;
                modified = true;
                console.log("✅ user.userId replaced");
            }

            // 🎯 PHONE NUMBER REPLACE
            if (jsonData.phoneNumber) {
                jsonData.phoneNumber = PREMIUM_PHONE;
                modified = true;
                console.log("✅ phoneNumber replaced");
            }
            if (jsonData.user && jsonData.user.phoneNumber) {
                jsonData.user.phoneNumber = PREMIUM_PHONE;
                modified = true;
                console.log("✅ user.phoneNumber replaced");
            }
            if (jsonData.user && jsonData.user.mobile) {
                jsonData.user.mobile = PREMIUM_PHONE;
                modified = true;
                console.log("✅ user.mobile replaced");
            }

            // 🎯 PREMIUM STATUS INJECT
            if (jsonData.user) {
                jsonData.user.isSubscribed = true;
                jsonData.user.subscriptionStatus = 'active';
                jsonData.user.packageType = 'premium';
                jsonData.user.validity = 'Lifetime Unlimited';
                jsonData.user.isTrial = false;
                jsonData.user.canEdit = false;
                jsonData.user.canDelete = false;
                modified = true;
                console.log("✅ Premium status injected in user");
            }

            // Top-level premium flags
            jsonData.isPremium = true;
            jsonData.isSubscribed = true;
            jsonData.packageType = 'premium';
            jsonData.validity = 'Lifetime Unlimited';
            modified = true;

            // 🎯 EXTRA — Agar response mein subscription object hai
            if (jsonData.subscription) {
                jsonData.subscription.isActive = true;
                jsonData.subscription.status = 'active';
                jsonData.subscription.type = 'premium';
                jsonData.subscription.validity = 'Lifetime Unlimited';
                modified = true;
                console.log("✅ Subscription status injected");
            }

            if (modified) {
                data = JSON.stringify(jsonData);
                console.log("✅✅✅ Response modified successfully!");
            } else {
                console.log("⚠️ No modifications made");
            }

        } catch (e) {
            console.log("⚠️ Response is not JSON:", e.message);
        }

        // 🔥 RESPONSE HEADERS COPY
        response.headers.forEach((value, key) => {
            if (!['content-encoding', 'content-length', 'transfer-encoding'].includes(key)) {
                res.setHeader(key, value);
            }
        });

        console.log("✅ Final Status:", response.status);
        console.log("=".repeat(50));

        return res.status(response.status).send(data);

    } catch (error) {
        console.error("❌ Error:", error);
        return res.status(500).json({
            status: false,
            error: "Proxy Error: " + error.message
        });
    }
}
