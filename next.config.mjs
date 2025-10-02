/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['react-markdown', 'remark-gfm', '@google/generative-ai'],
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.fbcdn.net' },
      { protocol: 'https', hostname: 'lookaside.facebook.com' },
      { protocol: 'https', hostname: '**.cdninstagram.com' },
      { protocol: 'https', hostname: 'www.bouthouri.co' },
    ],
    qualities: [75, 80, 90, 100],
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
    ];
  },
  webpack: (config, { isServer }) => {
    // Optimize bundle splitting for chat widget
    if (!isServer) {
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
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
