/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false,
  transpilePackages: ['@supabase/supabase-js'],
  experimental: {
    optimizePackageImports: ['react-markdown', 'remark-gfm', '@google/generative-ai'],
    // optimizeCss causes FOUC (flash of unstyled content) - disabled
    // cssChunking: 'strict', // Disabled - causes issues with CSS loading order
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
    qualities: [40, 60, 65, 70, 75, 80, 90, 100],
  },
  async redirects() {
    return [
      // Domain canonicalization
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.cciservices.online' }],
        destination: 'https://cciservices.online/:path*',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [{ type: 'header', key: 'x-forwarded-proto', value: 'http' }],
        destination: 'https://cciservices.online/:path*',
        permanent: true,
      },

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

      // Legacy blog URLs -> conseils/service pages
      { source: '/blog/injection-extraction-guide', destination: '/conseils/injection-extraction-tapis-tunis-2025', permanent: true },
      { source: '/blog/nettoyage-vapeur-guide', destination: '/conseils/lavage-vapeur-tapis-tunis-2025', permanent: true },
      { source: '/blog/lavage-vapeur-technique', destination: '/conseils/lavage-vapeur-tapis-tunis-2025', permanent: true },
      { source: '/blog/nettoyage-sec-guide', destination: '/conseils/nettoyage-a-sec-tunis-2025', permanent: true },
      { source: '/blog/nettoyage-sec-technique', destination: '/conseils/nettoyage-a-sec-tunis-2025', permanent: true },
      { source: '/blog/detachage-moquette', destination: '/conseils/detachage-moquette-tunis-2025', permanent: true },
      { source: '/blog/prix-nettoyage-tapis', destination: '/conseils/prix-nettoyage-tapis-tunis-tarifs-2025', permanent: true },
      { source: '/blog/tarifs-nettoyage-tapis', destination: '/conseils/prix-nettoyage-tapis-tunis-tarifs-2025', permanent: true },
      { source: '/blog/cout-nettoyage-tapis', destination: '/conseils/prix-nettoyage-tapis-tunis-tarifs-2025', permanent: true },
      { source: '/blog/prix-injection-extraction', destination: '/conseils/injection-extraction-tapis-tunis-2025', permanent: true },
      { source: '/blog/guide-nettoyage-canape', destination: '/conseils/nettoyage-canape-tunis-2025', permanent: true },
      { source: '/blog/detachage-salon-guide', destination: '/conseils/detachage-salon-tunis-2025', permanent: true },
      { source: '/blog/shampooing-canape', destination: '/conseils/shampooing-canape-tunis-2025', permanent: true },
      { source: '/blog/desinfection-salon', destination: '/conseils/desinfection-salon-tunis-2025', permanent: true },
      { source: '/blog/tarif-nettoyage-salon', destination: '/conseils/tarif-nettoyage-salon-tunis-2026', permanent: true },
      { source: '/blog/nettoyage-tissus-ameublement', destination: '/conseils/nettoyage-tissus-ameublement-tunis-2026', permanent: true },
      { source: '/blog/nettoyage-microfibre', destination: '/conseils/nettoyage-canape-microfibre-tunis-2026', permanent: true },
      { source: '/blog/nettoyer-canape-cuir', destination: '/conseils/comment-nettoyer-canape-cuir-tunis-guide-complet', permanent: true },
      { source: '/blog/entretien-canape-cuir', destination: '/conseils/comment-nettoyer-canape-cuir-tunis-guide-complet', permanent: true },
      { source: '/blog/nettoyage-cuir-professionnel', destination: '/conseils/comment-nettoyer-canape-cuir-tunis-guide-complet', permanent: true },
      { source: '/blog/produits-nettoyage-cuir', destination: '/conseils/comment-nettoyer-canape-cuir-tunis-guide-complet', permanent: true },

      // Legacy URLs from earlier CCI site versions
      { source: '/home', destination: '/', permanent: true },
      { source: '/Contact', destination: '/contact', permanent: true },
      { source: '/projects', destination: '/services', permanent: true },
      { source: '/moquette', destination: '/tapis', permanent: true },
      { source: '/conseils/cci-tunisie-expert-nettoyage-commercial-tunis', destination: '/conseils/conventions-nettoyage-entreprises-tunisie-contrats-b2b', permanent: true },

      // Cleanup of older conseils slug that mixed unrelated intent
      { source: '/conseils/nettoyage-salons-voiture-tapisseries-tunis', destination: '/conseils/nettoyage-salon-canape-tunis-2026', permanent: true },
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
