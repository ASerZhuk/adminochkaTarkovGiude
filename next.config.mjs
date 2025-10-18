import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {

    reactStrictMode: false,
    images: {
        domains: ['app.naznach.online', 'localhost', "assets.tarkov.dev"],
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost:8000', 
            }
        ]
    },
    
    webpack: (config) => {
        config.resolve.alias = {
            ...config.resolve.alias,
            'react-dom$': 'react-dom/profiling',
            'scheduler/tracing': 'scheduler/tracing-profiling',
        };
        return config;
    },
};

export default nextConfig;
