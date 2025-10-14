/**
 * Facebook Post Rotation System
 * Tracks last posts to avoid consecutive posts on same topic
 */

import fs from 'fs';
import path from 'path';

class PostRotationManager {
  constructor() {
    this.historyFile = path.join(process.cwd(), 'scripts', 'facebook-post-history.json');
    this.maxHistory = 10; // Keep track of last 10 posts
    
    // Service configuration with URLs and priorities
    this.serviceConfig = {
      salon: {
        keywords: ['salon', 'canapé', 'sofa', 'fauteuil', 'meubles', 'cuir', 'injection', 'extraction'],
        url: 'https://cciservices.online/salon',
        priority: 1,
        displayName: 'Nettoyage Salon'
      },
      tapis: {
        keywords: ['tapis', 'moquette', 'carpet', 'rug', 'sol textile'],
        url: 'https://cciservices.online/tapis',
        priority: 1,
        displayName: 'Nettoyage Tapis & Moquette'
      },
      marbre: {
        keywords: ['marbre', 'marble', 'polissage', 'brillance', 'cristallisation', 'pierre', 'granit'],
        url: 'https://cciservices.online/marbre',
        priority: 1,
        displayName: 'Polissage Marbre'
      },
      tapisserie: {
        keywords: ['tapisserie', 'rembourrage', 'upholstery', 'retapissage', 'restauration'],
        url: 'https://cciservices.online/tapisserie',
        priority: 2,
        displayName: 'Tapisserie & Rembourrage'
      },
      tfc: {
        keywords: ['chantier', 'construction', 'post-construction', 'bureau', 'office', 'commercial', 'tfc'],
        url: 'https://cciservices.online/tfc',
        priority: 2,
        displayName: 'Nettoyage TFC & Post-Chantier'
      }
    };
  }

  /**
   * Load post history from file
   */
  loadHistory() {
    try {
      if (fs.existsSync(this.historyFile)) {
        const data = fs.readFileSync(this.historyFile, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.warn('Error loading post history:', error.message);
    }
    return { posts: [] };
  }

  /**
   * Save post history to file
   */
  saveHistory(history) {
    try {
      // Ensure scripts directory exists
      const scriptsDir = path.dirname(this.historyFile);
      if (!fs.existsSync(scriptsDir)) {
        fs.mkdirSync(scriptsDir, { recursive: true });
      }
      
      fs.writeFileSync(this.historyFile, JSON.stringify(history, null, 2));
    } catch (error) {
      console.error('Error saving post history:', error.message);
    }
  }

  /**
   * Detect service from content
   */
  detectServiceFromContent(content) {
    const text = content.toLowerCase();
    let bestMatch = { service: 'general', score: 0 };

    for (const [service, config] of Object.entries(this.serviceConfig)) {
      let score = 0;
      
      config.keywords.forEach(keyword => {
        if (text.includes(keyword)) {
          score += keyword.length > 5 ? 2 : 1;
        }
      });

      if (score > bestMatch.score) {
        bestMatch = { service, score };
      }
    }

    return bestMatch.service !== 'general' ? bestMatch.service : null;
  }

  /**
   * Get next recommended service based on rotation logic
   */
  getNextRecommendedService(requestedType = 'tip') {
    const history = this.loadHistory();
    const recentPosts = history.posts.slice(-5); // Look at last 5 posts
    
    // Get recently used services
    const recentServices = recentPosts.map(post => post.service).filter(Boolean);
    
    // Get all available services sorted by priority
    const availableServices = Object.keys(this.serviceConfig)
      .sort((a, b) => this.serviceConfig[a].priority - this.serviceConfig[b].priority);
    
    // Find services not used recently
    const unusedServices = availableServices.filter(service => 
      !recentServices.includes(service)
    );
    
    // If we have unused services, prefer them
    if (unusedServices.length > 0) {
      return unusedServices[0];
    }
    
    // If all services used recently, pick the least recently used
    const serviceCounts = {};
    recentServices.forEach(service => {
      serviceCounts[service] = (serviceCounts[service] || 0) + 1;
    });
    
    // Find service with lowest count
    const leastUsed = availableServices.reduce((min, service) => {
      const count = serviceCounts[service] || 0;
      const minCount = serviceCounts[min] || 0;
      return count < minCount ? service : min;
    });
    
    return leastUsed;
  }

  /**
   * Check if a service can be posted (rotation rules)
   */
  canPostService(service) {
    const history = this.loadHistory();
    const lastPost = history.posts[history.posts.length - 1];
    
    // Never post same service twice in a row
    if (lastPost && lastPost.service === service) {
      return false;
    }
    
    // Check if service was used in last 2 posts
    const last2Posts = history.posts.slice(-2);
    const recentUse = last2Posts.filter(post => post.service === service).length;
    
    return recentUse === 0; // Allow if not used in last 2 posts
  }

  /**
   * Record a new post
   */
  recordPost(content, service, postType, imageUrl = null) {
    const history = this.loadHistory();
    
    const newPost = {
      timestamp: new Date().toISOString(),
      service: service,
      postType: postType,
      contentPreview: content.substring(0, 100),
      imageUrl: imageUrl,
      id: Date.now().toString()
    };
    
    history.posts.push(newPost);
    
    // Keep only last N posts
    if (history.posts.length > this.maxHistory) {
      history.posts = history.posts.slice(-this.maxHistory);
    }
    
    this.saveHistory(history);
    
    console.log('Post recorded:', {
      service: service,
      postType: postType,
      timestamp: newPost.timestamp
    });
    
    return newPost;
  }

  /**
   * Get service URL for call-to-action
   */
  getServiceUrl(service) {
    return this.serviceConfig[service]?.url || 'https://cciservices.online/services';
  }

  /**
   * Get service display name
   */
  getServiceDisplayName(service) {
    return this.serviceConfig[service]?.displayName || 'Services CCI';
  }

  /**
   * Generate service-specific call-to-action
   */
  generateServiceCallToAction(service) {
    const serviceUrl = this.getServiceUrl(service);
    const serviceName = this.getServiceDisplayName(service);
    
    const serviceSpecificCTAs = {
      salon: [
        `💺 Découvrez nos techniques de nettoyage salon: ${serviceUrl}`,
        `🛋️ Redonnez vie à votre salon: ${serviceUrl}`,
        `✨ Salon comme neuf avec CCI Services: ${serviceUrl}`
      ],
      tapis: [
        `🧽 Expertise nettoyage tapis & moquette: ${serviceUrl}`,
        `🌟 Tapis impeccables garantis: ${serviceUrl}`,
        `💯 Détachage professionnel: ${serviceUrl}`
      ],
      marbre: [
        `💎 Polissage marbre professionnel: ${serviceUrl}`,
        `⭐ Cristallisation et entretien marbre: ${serviceUrl}`,
        `✨ Redonnez l'éclat à votre marbre: ${serviceUrl}`
      ],
      tapisserie: [
        `🪑 Services tapisserie & rembourrage: ${serviceUrl}`,
        `🛠️ Restauration mobilier expert: ${serviceUrl}`,
        `✨ Retapissage professionnel: ${serviceUrl}`
      ],
      tfc: [
        `🏢 Nettoyage TFC & post-chantier: ${serviceUrl}`,
        `🔧 Expertise nettoyage professionnel: ${serviceUrl}`,
        `💼 Solutions entreprises: ${serviceUrl}`
      ]
    };
    
    const ctas = serviceSpecificCTAs[service] || [
      `📞 Nos services professionnels: ${serviceUrl}`
    ];
    
    return ctas[Math.floor(Math.random() * ctas.length)];
  }

  /**
   * Get rotation status for debugging
   */
  getRotationStatus() {
    const history = this.loadHistory();
    const recentPosts = history.posts.slice(-5);
    
    return {
      totalPosts: history.posts.length,
      recentPosts: recentPosts.map(post => ({
        service: post.service,
        postType: post.postType,
        timestamp: post.timestamp
      })),
      nextRecommended: this.getNextRecommendedService(),
      serviceAvailability: Object.keys(this.serviceConfig).map(service => ({
        service,
        canPost: this.canPostService(service),
        url: this.getServiceUrl(service)
      }))
    };
  }
}

export default PostRotationManager;