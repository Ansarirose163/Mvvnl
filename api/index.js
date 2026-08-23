export default {
    async fetch(request) {
        const url = new URL(request.url);
        const path = url.pathname;
        const method = request.method;

        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': '*'
        };

        if (method === 'OPTIONS') {
            return new Response(null, { status: 204, headers: corsHeaders });
        }

        // 🔥 Netflix Config
        const CONFIG = {
            esn: 'NFANDROID1-PXA-P-SAMSUSM-S928B-31506-0202JA72A3JBBA23MNJ42U6INDEUFEFAPKANFOJ04A8UI04N1SJMO7JR6JMQ6QLOP60A3ICK060L3UAQ5AD2BL0M0IILPEP1TNL48D29',
            sessionId: '730199105',
            appVersion: '9.22.1',
            osVersion: '36',
            androidApi: '36',
            profileGuid: 'WZFVPUH3OFDT3OOGEQJJF7H5HY',
            userAgent: 'com.netflix.mediaclient/62948 (Linux; U; Android 16; en_GB; SM-S928B; Build/BP4A.251205.006; Cronet/119.0.6045.31)',
            fakeIP: '223.188.42.214'
        };

        const COOKIES = {
            nfvdid: 'BQFmAAEBEIxpfZGgi1LCTmydVUjRImpgznEq92nK9jNTxAbAsFGlE-dcUcUgUKmZy-RB2pTWTBhHROhKpep-dCFDDZUrAIWHAqWPfQpxSmXaqkGHK_AmL27RhB5q9SWMLIj7KKX91YYx6BtKoYy0vxbTUWBd8--D',
            flwssn: 'db673be0-e6a1-4346-8c01-b061caaf8bdd',
            netflixId: 'v%3D3%26ct%3DBgjHlOvcAxLvA1fFbbVVP2BLO1RUfJPX9VgXjSqVsl8hYsWHuYJgk8hnYYmKfCcOSfVKg-rwRR8j9fvvfbcJaONasT5Y2bWhz2vTs5a9zge3HUTTA2CAa2geeUJ9izVsxZeWvgm3wZWXOPUMsXqu84LXweGoMtDNf1zOz1TTmHEoYibyHlLvV8AcFBBhPh19SPLtBHaaEJOF3rAJg2Lvy5M5LZuDx5wK0jYmt4zP9drtl4NAUxohaJqNKU0WAZh_CTuAzRIO8dfQiOMQtMOJP9uwceQIZ1HsxDYhT-5JXk8R_wNI6sAz-OUXK2vh2PcdL-AGJ0kqdgLHhMNQloPC2Mkf30DE13lOvqEscD76rOsnPcdEuo1JCHSfXLUXeeTEEnzJTMxSTq1FhaTV98uJ8LqKvYvc8L7FpbUyCVZYVWceSl_38PUYf3quPuY0U-qiWTC4U9N7SgwZAjQGrT_Q0Esi07E2kkGPpcCBwG_ewwPtbXpF7pCv8njDArE2-IH95g8j3YHpq1DzXG_CQ-EejEQ0jV1T_eyWB0EwkfdZImwLZMKLJnaBUzJubeFQma_2EcE6IiVIvaNf7Vvo3jipYXCEz7LcMn0_Cb4-41ZqUL9TN87YLdbq3eDh-XoiQt2XN5mWcIGac7zhq0sWkdOh2JUqsWdJr3LGsRgGIg4KDDK18dLxoZ-z8m5iWQ..%26pg%3DWZFVPUH3OFDT3OOGEQJJF7H5HY%26ch%3DAQEAEAABABRUKLhTiZiZ7sXvi6EbLE_qy_k-HQHYz_M.',
            secureNetflixId: 'v%3D3%26mac%3DAQEAEQABABRUT3TscZcN3w4ozZ5srttAVkA8IqEvU5I.%26dt%3D1787458611964'
        };

        // 🚫 BLOCK LOGOUT
        if (path.includes('/logout') || path.includes('/signout')) {
            return new Response(JSON.stringify({
                status: 'success',
                data: { message: "Logout disabled" }
            }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        // 🚫 BLOCK LOGS
        if (path.includes('logs.netflix.com') || path.includes('/log/android/')) {
            return new Response('', { status: 200, headers: corsHeaders });
        }
        if (path.includes('bugsnag') || path.includes('sessions.bugsnag')) {
            return new Response(JSON.stringify({ status: 'accepted' }), {
                status: 202,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // 🔄 TARGET URL
        let targetUrl;
        if (path.includes('/nq/') || path.includes('/android/') || path.includes('/api')) {
            targetUrl = `https://android.prod.ftl.netflix.com${path}`;
        } else if (path.includes('/graphql')) {
            targetUrl = `https://android.prod.cloud.netflix.com${path}`;
        } else if (path.includes('nflxso.net')) {
            targetUrl = `https://occ-0-4409-3647.1.nflxso.net${path}`;
        } else {
            targetUrl = `https://android.prod.ftl.netflix.com${path}`;
        }
        if (url.search) targetUrl += url.search;

        // 📝 BUILD HEADERS
        const headers = new Headers();
        const origHeaders = request.headers;
        const exclude = ['host', 'connection', 'content-length', 'accept-encoding'];
        for (const [key, value] of origHeaders) {
            if (!exclude.includes(key.toLowerCase())) {
                headers.set(key, value);
            }
        }

        headers.set('x-netflix.clienttype', 'samurai');
        headers.set('x-netflix.context.os-version', CONFIG.osVersion);
        headers.set('x-netflix.devicememorylevel', 'HIGH');
        headers.set('x-netflix.session.id', CONFIG.sessionId);
        headers.set('x-netflix.zuul.brotli.allowed', 'true');
        headers.set('x-netflix.context.app-version', CONFIG.appVersion);
        headers.set('x-netflix.context.locales', 'en-IN');
        headers.set('x-netflix.context.ui-flavor', 'android');
        headers.set('x-netflix.appver', CONFIG.appVersion);
        headers.set('x-netflix.esnprefix', 'NFANDROID1-PRV-P-');
        headers.set('x-netflix.androidapi', CONFIG.androidApi);
        headers.set('x-netflix.deviceformfactor', 'PHONE');
        headers.set('x-netflix.esn', CONFIG.esn);
        headers.set('x-netflix.request.attempt', '1');
        headers.set('x-netflix.client.current-profile-guid', CONFIG.profileGuid);
        headers.set('user-agent', CONFIG.userAgent);
        headers.set('x-forwarded-for', CONFIG.fakeIP);
        headers.set('x-real-ip', CONFIG.fakeIP);
        headers.set('cookie', `nfvdid=${COOKIES.nfvdid}; flwssn=${COOKIES.flwssn}; NetflixId=${COOKIES.netflixId}; SecureNetflixId=${COOKIES.secureNetflixId}`);

        // 🚀 FORWARD
        try {
            const fetchOptions = { method, headers };
            if (method !== 'GET' && method !== 'HEAD') {
                const body = await request.arrayBuffer();
                if (body && body.byteLength > 0) {
                    fetchOptions.body = body;
                }
            }

            const response = await fetch(targetUrl, fetchOptions);
            const responseBody = await response.arrayBuffer();

            const respHeaders = new Headers();
            response.headers.forEach((value, key) => {
                if (!['content-encoding', 'content-length', 'transfer-encoding'].includes(key)) {
                    respHeaders.set(key, value);
                }
            });
            for (const [key, value] of Object.entries(corsHeaders)) {
                respHeaders.set(key, value);
            }

            return new Response(responseBody, {
                status: response.status,
                headers: respHeaders
            });

        } catch (error) {
            return new Response(JSON.stringify({
                status: false,
                error: "Proxy Error: " + error.message
            }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }
    }
};
