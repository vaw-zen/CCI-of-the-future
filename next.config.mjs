/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@supabase/supabase-js'],
  experimental: {
    optimizePackageImports: ['react-markdown', 'remark-gfm', '@google/generative-ai'],
  },
  // Remove console logs in production builds
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Add preconnect hints for external domains (GTM loads later, so only preconnect when needed)
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Link',
            value: '<https://www.googletagmanager.com>; rel=preconnect; crossorigin',
          },
        ],
      },
    ];
  },
  // Suppress punycode deprecation warning
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 2,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.fbcdn.net' },
      { protocol: 'https', hostname: 'lookaside.facebook.com' },
      { protocol: 'https', hostname: '**.cdninstagram.com' },
      { protocol: 'https', hostname: 'www.bouthouri.co' },
      { protocol: 'https', hostname: 'uploads-ssl.webflow.com' },
      { protocol: 'https', hostname: 'cciservices.online' },
    ],
    formats: ['image/avif', 'image/webp'],
    qualities: [60, 70, 75, 80, 90, 100],
  },
  async redirects() {
    return [
      // Root index variants
      { source: '/index', destination: '/', permanent: true },
      { source: '/index.html', destination: '/', permanent: true },
      { source: '/index.php', destination: '/', permanent: true },

      // Subpath index variants (e.g., /services/index.html -> /services)
      { source: '/:path*/index', destination: '/:path*', permanent: true },
      { source: '/:path*/index.html', destination: '/:path*', permanent: true },
      { source: '/:path*/index.php', destination: '/:path*', permanent: true },

      // Reel URL redirects - fix singular to plural routing
      { source: '/reel/:id', destination: '/reels/:id', permanent: true },
    ];
  },
  webpack: (config, { isServer }) => {
    // Optimize bundle splitting for chat widget
    if (!isServer) {
      config.optimization.splitChunks = config.optimization.splitChunks || {};
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        supabase: {
          name: 'supabase',
          test: /[\\/]node_modules[\\/]@supabase[\\/]/,
          chunks: 'all',
          priority: 25,
        },
        chatWidget: {
          name: 'chat-widget',
          test: /[\\/]components[\\/]chatWidget[\\/]/,
          chunks: 'all',
          priority: 20,
        },
        markdown: {
          name: 'markdown',
          test: /[\\/]node_modules[\\/](react-markdown|remark-gfm)[\\/]/,
          chunks: 'all',
          priority: 15,
        },
        gemini: {
          name: 'gemini',
          test: /[\\/]node_modules[\\/]@google[\\/]generative-ai[\\/]/,
          chunks: 'all',
          priority: 10,
        },
      };
    }
    
    return config;
  },
};

export default nextConfig;
