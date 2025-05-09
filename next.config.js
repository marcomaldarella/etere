/** @type {import('next').NextConfig} */

const nextConfig = {
    reactStrictMode: false,
    productionBrowserSourceMaps: true,
    images: {
        domains: ['picsum.photos'],
    },
    experimental: {
        optimizeCss: true,
    },
    compiler: {
        reactRemoveProperties: process.env.NODE_ENV === 'production',
    },
    webpack: (config, { isServer }) => {
        // ✅ SUPPORTO SVG COME COMPONENTE
        config.module.rules.push({
            test: /\.svg$/,
            issuer: /\.[jt]sx?$/,
            use: ['@svgr/webpack'],
        });

        // GSAP chunking
        if (!isServer) {
            config.optimization.splitChunks.cacheGroups = {
                ...config.optimization.splitChunks.cacheGroups,
                gsap: {
                    test: /[\\/]node_modules[\\/](gsap|@studio-freight)[\\/]/,
                    name: 'gsap-vendors',
                    priority: 10,
                    chunks: 'all',
                },
            };
        }

        return config;
    },
};

module.exports = nextConfig;
