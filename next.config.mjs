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
