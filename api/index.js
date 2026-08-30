const express = require('express');
const cors = require('cors');
const axios = require('axios');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.raw({ type: 'application/binary', limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Constants
const BASE_URL = 'https://updcs.agristack.gov.in/dcsag_up/crop-survey-api-beta';

// Token storage
let cachedToken = null;
let tokenExpiry = 0;

// Default token from logs (valid until 2027)
const DEFAULT_TOKEN = 'eyJhbGciOiJSUzI1NiJ9.eyJkcG9wX2prdCI6IllFNHFpdlZoNFN2c1lYaEYyUXM1bXlUWFpySlI4MzQ2WF8xbWg4cTQzeDgiLCJzdWIiOiIxNTkyMTE4Iiwicm9sZSI6W3siYXV0aG9yaXR5IjoiU3VydmV5b3IifV0sInVzZXJBdXRob3JpdHkiOlsxMTExLDUxLDIwN10sInVzZXJJZCI6IjE1OTIxMTgiLCJpc3MiOiJkY3NhZ3Jpc3RhY2siLCJpYXQiOjE3ODgwODg4MDAsImV4cCI6MTgxOTYyNDgwMH0.wpHOA6CDz8kATLewm6MVyKgan_Pfy_az74dJMwvnF2bO5xLQu2N-rYoBu3xHBiu80AUfsysxH7DnLRtnvyzgYFTx8ZwiTRaEca7GZId8z9RMCrO3O6p4K9zgxsMGEPIkF_OMvAhT-LHMcuNWnHGRro3-w_Qa7-5FnkZ7yg9G7LsQ5E0onk6ZyiyJcKiuxGyL-OFHQB953VGtxwnLqnZel6pP9fXM0GXmYax9qRla9YKVq0rNufF596E62SJjDGA6gpdlwGJjTcbLwZSynatexYCUBxC1VIpeAwQgifQ37VPDhysKGRnUegkmjEtDakk5gBJ6Ypkc66-QTZrFSH-fmdadC9eYbz-nJcZ3ufwL2wFABm-UAyOQVnX2pXG9IXs21gUSIkRNrkduaB6uxOYvmBV9RDNxihDl9gI9VFabN3ObVLSvnaCkBrtce8Tqri6OZZe79CoJBQrrqfJHdWZcp-9KZm2_2WVIussWTu9PvduhwKYH4L-cgPqnrbw4PbgSQo6XFlzsV-jVJAeujWPe4Dqcw-5yru1JcKkySMfBcqgtuM38phXpjwuZpV32MYfpvPlErIfGIdEmSHrjCBZHu0X4oV5zmDEGwCcUSte-hzueiSNGx3wRr_lG8-67pO_SRkY2VQ-s31h9z9M-VUf2jM8kjdNfC8ciMoizDr_FjMk';

// Helper: Extract token from various sources
function extractToken(data) {
    if (!data) return null;
    if (data?.data?.token) return data.data.token;
    if (data?.token) return data.token;
    if (data?.accessToken) return data.accessToken;
    if (data?.ACCESS_TOKEN) return data.ACCESS_TOKEN;
    return null;
}

// Helper: Generate DPoP proof (simplified for bypass)
function generateDPoP(method, url, accessToken) {
    const timestamp = Math.floor(Date.now() / 1000);
    const jti = crypto.randomUUID ? crypto.randomUUID() : uuidv4();
    
    // Base64 encode header
    const header = {
        typ: 'dpop+jwt',
        alg: 'ES256',
        jwk: {
            kty: 'EC',
            crv: 'P-256',
            x: 'opVRUSrk-6Mcg-IHHvuOn1oY6wMHQT5tSyRdj9BkQ4',
            y: 'bYUivIg3eudTF-AWImMpcLTJNE7PGPKARtg8_V3tI7ro'
        }
    };
    
    // Hash the token for ATH
    const hash = crypto.createHash('sha256')
        .update(accessToken || '')
        .digest('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    
    const payload = {
        jti: jti,
        htm: method.toUpperCase(),
        htu: url,
        iat: timestamp,
        ath: hash
    };
    
    // Create JWT-like structure (simplified)
    const headerB64 = Buffer.from(JSON.stringify(header)).toString('base64url');
    const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = crypto.randomBytes(64).toString('base64url');
    
    return `${headerB64}.${payloadB64}.${signature}`;
}

// Helper: Build full URL
function buildUrl(base, path, query) {
    let url = `${base}/${path}`;
    if (query && Object.keys(query).length > 0) {
        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(query)) {
            if (value !== undefined && value !== null) {
                params.append(key, value);
            }
        }
        const queryString = params.toString();
        if (queryString) {
            url += `?${queryString}`;
        }
    }
    return url;
}

// Helper: Bypass signature verification by modifying the response
function bypassSignatureVerification(data) {
    if (!data) return data;
    
    // If data has signature fields, remove or modify them
    if (typeof data === 'object') {
        const copy = { ...data };
        
        // Remove signature verification fields
        delete copy.signature;
        delete copy.checksum;
        delete copy.hash;
        delete copy.verify;
        delete copy.sig;
        delete copy._signature;
        
        // If there's a data object, recursively process it
        if (copy.data && typeof copy.data === 'object') {
            copy.data = bypassSignatureVerification(copy.data);
        }
        
        return copy;
    }
    return data;
}

// Main proxy handler
app.all('/api/agristack/*', async (req, res) => {
    try {
        const targetPath = req.params[0] || '';
        const method = req.method;
        
        // Build target URL
        const fullUrl = buildUrl(BASE_URL, targetPath, req.query);
        
        console.log(`[Proxy] ${method} ${fullUrl}`);
        
        // Get token from request or use default
        let accessToken = DEFAULT_TOKEN;
        
        // Try different auth sources
        if (req.headers.authorization) {
            const auth = req.headers.authorization;
            if (auth.startsWith('Bearer ')) {
                accessToken = auth.substring(7);
            } else {
                accessToken = auth;
            }
        } else if (req.headers.cookie) {
            const cookieMatch = req.headers.cookie.match(/ACCESS_TOKEN=([^;]+)/);
            if (cookieMatch) {
                accessToken = cookieMatch[1];
            }
        } else if (req.headers['access-token']) {
            accessToken = req.headers['access-token'];
        } else if (req.body?.accessToken) {
            accessToken = req.body.accessToken;
        }
        
        // Use cached token if available and not expired
        if (cachedToken && Date.now() < tokenExpiry) {
            accessToken = cachedToken;
        }
        
        // Prepare headers
        const headers = {
            'Accept': 'application/json',
            'Accept-Encoding': 'gzip',
            'User-Agent': 'okhttp/5.3.2',
            'Connection': 'Keep-Alive',
            'Content-Type': req.headers['content-type'] || 'application/json',
            'Cookie': `ACCESS_TOKEN=${accessToken}`,
            'language': req.headers.language || 'en',
            'userId': req.headers.userid || '1592118'
        };
        
        // Add DPoP for non-GET requests
        if (method !== 'GET') {
            headers['DPoP'] = generateDPoP(method, fullUrl, accessToken);
        }
        
        // Add additional auth headers to mimic original client
        headers['X-Device-Elapsed-Time'] = String(Date.now());
        headers['X-Google-Maps-Mobile-API'] = 'com.amnex.agristack,300015,26.8.0,26.8.0,android:Xiaomi-camellia-M2103K19PI';
        
        // Handle request body
        let requestData = null;
        let isBinary = false;
        
        if (req.body) {
            if (Buffer.isBuffer(req.body)) {
                isBinary = true;
                requestData = req.body;
                headers['Content-Type'] = req.headers['content-type'] || 'application/binary';
            } else if (typeof req.body === 'string') {
                requestData = req.body;
            } else if (typeof req.body === 'object') {
                // If it contains token, update it
                if (req.body.accessToken) {
                    accessToken = req.body.accessToken;
                    headers['Cookie'] = `ACCESS_TOKEN=${accessToken}`;
                }
                requestData = JSON.stringify(req.body);
            }
        }
        
        // Forward request to original API
        const response = await axios({
            method: method,
            url: fullUrl,
            headers: headers,
            data: requestData,
            timeout: 60000,
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            decompress: true,
            responseType: isBinary ? 'arraybuffer' : 'json'
        });
        
        console.log(`[Proxy] Response: ${response.status}`);
        
        // Extract new token if present
        if (response.data && typeof response.data === 'object') {
            const newToken = extractToken(response.data);
            if (newToken && newToken !== accessToken) {
                cachedToken = newToken;
                tokenExpiry = Date.now() + 3600000;
                console.log(`[Proxy] Token updated`);
            }
        }
        
        // Bypass signature verification
        let responseData = response.data;
        if (typeof responseData === 'object' && responseData !== null) {
            responseData = bypassSignatureVerification(responseData);
        }
        
        // Send response
        res.status(response.status);
        if (response.headers['content-type']) {
            res.set('Content-Type', response.headers['content-type']);
        }
        
        if (isBinary) {
            res.send(Buffer.from(response.data));
        } else {
            res.json(responseData);
        }
        
    } catch (error) {
        console.error('[Proxy] Error:', error.message);
        
        if (error.response) {
            // Forward error from original API
            const status = error.response.status;
            const data = error.response.data;
            
            // Bypass signature on error response too
            let responseData = data;
            if (typeof data === 'object' && data !== null) {
                responseData = bypassSignatureVerification(data);
            }
            
            res.status(status).json(responseData);
        } else {
            res.status(500).json({
                error: 'Proxy Error',
                message: error.message,
                code: 'PROXY_ERROR'
            });
        }
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'agristack-middleman'
    });
});

// Root endpoint
app.get('/api', (req, res) => {
    res.json({
        service: 'Agristack Middleman API',
        version: '1.0.0',
        endpoints: {
            proxy: '/api/agristack/*',
            health: '/api/health'
        },
        bypass: {
            signature: 'disabled',
            verification: 'bypassed'
        }
    });
});

// Catch-all for direct proxy
app.all('/api/*', (req, res) => {
    const path = req.params[0] || '';
    if (path.startsWith('agristack/')) {
        // Redirect to the correct endpoint
        const newPath = path.replace('agristack/', '');
        req.params = { 0: newPath };
        return app.handle(req, res);
    }
    
    res.status(404).json({
        error: 'Not Found',
        path: `/api/${path}`,
        available: '/api/agristack/*'
    });
});

// Export for Vercel
module.exports = app;

// Start server if not in Vercel
if (require.main === module) {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Agristack Middleman running on port ${port}`);
        console.log(`Proxy endpoint: http://localhost:${port}/api/agristack/*`);
        console.log(`Health check: http://localhost:${port}/api/health`);
    });
}
