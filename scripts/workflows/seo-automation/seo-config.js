/**
 * SEO Automation Configuration
 * Centralized configuration for all SEO automation tools
 */

export const seoConfig = {
  // Site configuration
  site: {
    url: 'https://cciservices.online',
    name: 'CCI Services',
    description: 'Expert nettoyage professionnel en Tunisie',
    language: 'fr-TN',
    timezone: 'Africa/Tunis'
  },

  // Keyword analysis settings
  keywords: {
    csvPath: './scripts/data/seo-keywords.csv',
    maxKeywordsPerBatch: 20,
    analysisDepth: 30, // days
    priorityThreshold: {
      high: { volume: 500, competition: 'Medium' },
      medium: { volume: 100, competition: 'Low' },
      low: { volume: 50, competition: 'Low' }
    }
  },

  // Content generation settings
  content: {
    outputDir: './generated-content',
    maxContentPieces: 5, // per run
    minWordCount: 1500,
    maxWordCount: 3000,
    includeSchema: true,
    includeFAQ: true,
    autoPublish: false // set to true for automatic publishing
  },

  // Google Search Console settings
  gsc: {
    credentialsPath: './scripts/credentials/gsc-credentials.json',
    maxQueries: 50,
    dateRange: 30, // days
    minImpressions: 10,
    trackingEnabled: true
  },

  // AI content generation settings
  ai: {
    provider: 'gemini', // gemini, openai, claude
    model: 'gemini-2.0-flash',
    temperature: 0.7,
    maxTokens: 4000,
    rateLimitDelay: 2000, // ms between requests
    retryAttempts: 3
  },

  // Automation schedule
  schedule: {
    fullAnalysis: 'weekly', // weekly, monthly
    contentGeneration: 'bi-weekly',
    performanceTracking: 'daily',
    reportGeneration: 'weekly'
  },

  // Target pages and URL patterns
  pages: {
    homepage: {
      path: '/src/app/page.jsx',
      primaryKeywords: ['CCI Tunisie', 'nettoyage professionnel tunisie']
    },
    services: {
      tapis: {
        path: '/src/app/tapis/page.jsx',
        primaryKeywords: ['nettoyage tapis tunis', 'nettoyage moquette tunis']
      },
      marbre: {
        path: '/src/app/marbre/page.jsx',
        primaryKeywords: ['restauration marbre tunis', 'polissage marbre']
      },
      salon: {
        path: '/src/app/salon/page.jsx',
        primaryKeywords: ['nettoyage salon tunis', 'nettoyage canapé']
      },
      tapisserie: {
        path: '/src/app/tapisserie/page.jsx',
        primaryKeywords: ['tapisserie tunis', 'retapissage']
      },
      tfc: {
        path: '/src/app/tfc/page.jsx',
        primaryKeywords: ['nettoyage post-chantier', 'nettoyage fin de chantier']
      }
    },
    blog: {
      basePath: '/src/app/conseils',
      autoCreateSlugs: true
    }
  },

  // Geographic targeting
  locations: {
    primary: ['Tunis', 'Ariana', 'Ben Arous', 'Carthage'],
    secondary: ['La Marsa', 'Manouba', 'Nabeul', 'Sousse'],
    modifiers: ['Grand Tunis', 'région de Tunis', 'Tunisie']
  },

  // Competitor monitoring (optional)
  competitors: [
    {
      name: 'Concurrent 1',
      domain: 'example-competitor.tn',
      monitorKeywords: true
    }
  ],

  // Semantic keyword groups for clustering
  semanticGroups: {
    'carpet-cleaning': {
      core: ['tapis', 'moquette', 'carpet', 'rug'],
      modifiers: ['nettoyage', 'lavage', 'shampouinage', 'détachage'],
      techniques: ['injection-extraction', 'vapeur', 'à sec']
    },
    'marble-restoration': {
      core: ['marbre', 'marble', 'granite', 'pierre'],
      modifiers: ['restauration', 'polissage', 'ponçage', 'cristallisation'],
      techniques: ['lustrage', 'protection', 'ébauche']
    },
    'upholstery-cleaning': {
      core: ['salon', 'canapé', 'sofa', 'tapisserie', 'fauteuil'],
      modifiers: ['nettoyage', 'retapissage', 'rembourrage'],
      techniques: ['injection-extraction', 'vapeur', 'détachage']
    },
    'post-construction': {
      core: ['chantier', 'construction', 'tfc', 'travaux'],
      modifiers: ['nettoyage', 'fin de', 'post', 'après'],
      techniques: ['dépoussiérage', 'décapage', 'remise en état']
    }
  },

  // Content templates
  templates: {
    blogPost: {
      structure: ['intro', 'definition', 'benefits', 'process', 'tips', 'professional', 'faq', 'conclusion'],
      minSections: 6,
      includeCTA: true,
      includeContact: true
    },
    servicePage: {
      structure: ['hero', 'description', 'methods', 'benefits', 'coverage', 'process', 'testimonials', 'faq', 'contact'],
      includeSchema: true,
      includeLocalBusiness: true
    },
    landingPage: {
      structure: ['hero', 'benefits', 'social-proof', 'process', 'pricing', 'faq', 'cta'],
      conversionOptimized: true
    }
  },

  // Internal linking rules
  internalLinking: {
    maxLinksPerPage: 10,
    minRelevanceScore: 0.6,
    preferServicePages: true,
    anchorTextVariation: true,
    contexts: {
      'tapis': ['salon', 'moquette', 'nettoyage'],
      'marbre': ['granite', 'pierre', 'polissage'],
      'salon': ['canapé', 'tapisserie', 'nettoyage'],
      'chantier': ['tfc', 'nettoyage', 'fin de travaux']
    }
  },

  // Performance thresholds
  performance: {
    alerts: {
      positionDrop: 10, // alert if keyword drops more than X positions
      trafficDrop: 20, // alert if traffic drops more than X%
      lowCTR: 1.0, // alert if CTR below X%
      highImpressions: 1000 // alert if impressions > X but clicks < 10
    },
    targets: {
      averagePosition: 5,
      minCTR: 2.0,
      contentIndexingTime: 7 // days
    }
  },

  // Notification settings
  notifications: {
    slack: {
      enabled: true,
      webhook: process.env.SLACK_WEBHOOK_URL,
      channels: {
        reports: '#seo-reports',
        alerts: '#seo-alerts',
        content: '#content-updates'
      }
    },
    email: {
      enabled: false,
      recipients: ['seo@cciservices.online']
    }
  },

  // File paths and directories
  paths: {
    keywords: './scripts/data/seo-keywords.csv',
    credentials: './scripts/credentials/gsc-credentials.json',
    output: './seo-results',
    generatedContent: './generated-content',
    reports: './seo-reports',
    backups: './backups'
  }
};

export default seoConfig;