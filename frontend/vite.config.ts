import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwind from '@tailwindcss/vite'

const backendUrl = 'http://localhost:9000';

const redirectInterceptor = {
    target: backendUrl,
    changeOrigin: true,
    configure: (proxy: any, options: any) => {
        proxy.on('proxyRes', (proxyRes: any, req: any, res: any) => {
            if ([301, 302, 307, 308].includes(proxyRes.statusCode)) {
                let location = proxyRes.headers['location'];
                if (location && location.includes(backendUrl)) {
                    proxyRes.headers['location'] = location.replace(backendUrl, 'http://localhost:5173');
                } else if (location && location.startsWith('/')) {
                    // If the backend returns a relative redirect, we don't need to rewrite the domain,
                    // but we ensure it's tracked if necessary. The browser will handle it natively relative to 5173.
                }
            }
        });
    }
};

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), tailwind()],
    build: {
        outDir: '../src/main/resources/static',
        emptyOutDir: true,
    },
    server: {
        proxy: {
            '/api': redirectInterceptor,
            '/otp': redirectInterceptor,
            '/userinfo': redirectInterceptor,
            '/logout': redirectInterceptor,
            '/oauth2/authorize': redirectInterceptor,
            '/oauth2/token': redirectInterceptor,
            '/oauth2/jwks': redirectInterceptor,
            '/oauth2/introspect': redirectInterceptor,
            '/profile': {
                ...redirectInterceptor,
                bypass: (req: any) => {
                    if (req.method === 'GET' && req.headers.accept?.includes('text/html')) {
                        const path = req.url?.split('?')[0] || '';
                        if (path === '/profile' || path === '/profile/' || path.startsWith('/profile/')) {
                            return '/index.html';
                        }
                    }
                    return undefined;
                }
            },
            '/login': {
                ...redirectInterceptor,
                bypass: (req: any) => req.method === 'GET' ? '/index.html' : undefined
            },
            '/signup': {
                ...redirectInterceptor,
                bypass: (req: any) => req.method === 'GET' ? '/index.html' : undefined
            },
            '/forgot-password': {
                ...redirectInterceptor,
                bypass: (req: any) => req.method === 'GET' ? '/index.html' : undefined
            },
            '/verify-otp': {
                ...redirectInterceptor,
                bypass: (req: any) => req.method === 'GET' ? '/index.html' : undefined
            },
            '/user': {
                ...redirectInterceptor,
                bypass: (req: any) => {
                    if (req.method === 'GET' && req.headers.accept?.includes('text/html')) {
                        const path = req.url?.split('?')[0] || '';
                        if (path === '/user' || path === '/user/' || (path.startsWith('/user/') && !path.startsWith('/user/user-by-role'))) {
                            return '/index.html';
                        }
                    }
                    return undefined;
                }
            }
        }
    }
})
