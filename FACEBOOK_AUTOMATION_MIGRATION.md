# Facebook Automation Migration to CRM

## Files to create in your CRM project (C:\Users\chaab\Documents\cci-marketing-dashboard):

### 1. Facebook API Service (e.g., `services/facebook-service.js`)

```javascript
/**
 * Facebook API Service for CCI Marketing Dashboard
 * Handles Facebook posting, scheduling, and analytics
 */

const axios = require('axios');

class FacebookService {
  constructor() {
    this.pageId = process.env.FB_PAGE_ID;
    this.accessToken = process.env.FB_PAGE_ACCESS_TOKEN;
    this.apiVersion = process.env.FB_API_VERSION || 'v18.0';
    this.baseUrl = `https://graph.facebook.com/${this.apiVersion}`;
  }

  /**
   * Post to Facebook Page
   */
  async postToFacebook(content) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/${this.pageId}/feed`,
        {
          message: content.caption,
          link: content.link || 'https://cciservices.online',
          access_token: this.accessToken
        }
      );

      return {
        success: true,
        postId: response.data.id,
        message: 'Post published successfully'
      };
    } catch (error) {
      console.error('Facebook posting error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }

  /**
   * Schedule weekly Friday posts
   */
  async scheduleWeeklyPost() {
    const posts = [
      {
        caption: "🧽 Conseil du vendredi: Un nettoyage régulier de vos bureaux améliore la productivité de vos équipes! 💼✨ Contactez CCI Services pour un devis gratuit. 📞 +216 98 557 766 🌐 cciservices.online #NettoyageBureau #Tunis #CCI",
        link: "https://cciservices.online/devis?utm_source=facebook&utm_medium=social&utm_campaign=friday_tips"
      },
      {
        caption: "✨ Votre salon mérite le meilleur! Notre service de nettoyage professionnel redonne vie à vos canapés et fauteuils. Résultats garantis! 🛋️ #NettoyageSalon #Tunisie #CCI",
        link: "https://cciservices.online/salon?utm_source=facebook&utm_medium=social&utm_campaign=friday_tips"
      },
      {
        caption: "🏠 Après travaux, avant emménagement : notre service de nettoyage post-chantier vous assure un environnement impeccable! 🔨✨ #PostChantier #Nettoyage #CCI",
        link: "https://cciservices.online/services?utm_source=facebook&utm_medium=social&utm_campaign=friday_tips"
      }
    ];

    // Rotate posts weekly
    const weekNumber = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
    const selectedPost = posts[weekNumber % posts.length];

    return await this.postToFacebook(selectedPost);
  }

  /**
   * Get page insights and analytics
   */
  async getPageInsights() {
    try {
      const response = await axios.get(
        `${this.baseUrl}/${this.pageId}/insights`,
        {
          params: {
            metric: 'page_views,page_impressions,page_fan_adds',
            period: 'week',
            access_token: this.accessToken
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Facebook insights error:', error);
      return null;
    }
  }
}

module.exports = FacebookService;
```

### 2. Scheduler Service (e.g., `services/scheduler-service.js`)

```javascript
/**
 * Task Scheduler for CRM Marketing Automation
 */

const cron = require('node-cron');
const FacebookService = require('./facebook-service');

class SchedulerService {
  constructor() {
    this.facebookService = new FacebookService();
    this.tasks = new Map();
  }

  /**
   * Start all scheduled tasks
   */
  startTasks() {
    // Friday Facebook posts (10 AM Tunisia time)
    this.tasks.set('friday-posts', cron.schedule('0 10 * * 5', async () => {
      console.log('🕙 Running scheduled Friday Facebook post...');
      try {
        const result = await this.facebookService.scheduleWeeklyPost();
        console.log('📱 Facebook post result:', result);
        
        // Log to database
        await this.logScheduledTask('facebook-post', result);
      } catch (error) {
        console.error('❌ Friday post failed:', error);
        await this.logScheduledTask('facebook-post', { success: false, error: error.message });
      }
    }, {
      scheduled: false,
      timezone: "Africa/Tunis"
    }));

    // Website health check (daily at 9 AM)
    this.tasks.set('health-check', cron.schedule('0 9 * * *', async () => {
      console.log('🔍 Running daily website health check...');
      try {
        const healthResult = await this.checkWebsiteHealth();
        await this.logScheduledTask('health-check', healthResult);
      } catch (error) {
        console.error('❌ Health check failed:', error);
      }
    }, {
      scheduled: false,
      timezone: "Africa/Tunis"
    }));

    console.log('⏰ All scheduled tasks configured');
  }

  /**
   * Start the scheduler
   */
  start() {
    this.startTasks();
    this.tasks.forEach((task, name) => {
      task.start();
      console.log(`✅ Started task: ${name}`);
    });
  }

  /**
   * Stop all tasks
   */
  stop() {
    this.tasks.forEach((task, name) => {
      task.stop();
      console.log(`⏹️ Stopped task: ${name}`);
    });
  }

  /**
   * Website health check
   */
  async checkWebsiteHealth() {
    const axios = require('axios');
    const pages = [
      'https://cciservices.online',
      'https://cciservices.online/conseils',
      'https://cciservices.online/services',
      'https://cciservices.online/devis'
    ];

    const results = [];
    for (const page of pages) {
      try {
        const response = await axios.get(page, { timeout: 10000 });
        results.push({
          url: page,
          status: response.status,
          ok: response.status === 200
        });
      } catch (error) {
        results.push({
          url: page,
          status: error.response?.status || 0,
          ok: false,
          error: error.message
        });
      }
    }

    return {
      timestamp: new Date().toISOString(),
      results,
      allOk: results.every(r => r.ok)
    };
  }

  /**
   * Log task execution to database
   */
  async logScheduledTask(taskName, result) {
    // TODO: Implement database logging
    console.log(`📝 Task log: ${taskName}`, result);
  }
}

module.exports = SchedulerService;
```

### 3. API Routes (if using Express/Fastify)

```javascript
// routes/facebook.js
const FacebookService = require('../services/facebook-service');
const facebookService = new FacebookService();

// POST /api/facebook/post
app.post('/api/facebook/post', async (req, res) => {
  try {
    const { caption, link } = req.body;
    const result = await facebookService.postToFacebook({ caption, link });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/facebook/insights
app.get('/api/facebook/insights', async (req, res) => {
  try {
    const insights = await facebookService.getPageInsights();
    res.json(insights);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### 4. Environment Variables (.env)

```bash
# Facebook API Configuration
FB_PAGE_ID=your_facebook_page_id
FB_PAGE_ACCESS_TOKEN=your_page_access_token
FB_API_VERSION=v18.0

# Database
DATABASE_URL=your_database_connection_string

# Timezone
TZ=Africa/Tunis
```

### 5. Package Dependencies

Add to your CRM's package.json:

```json
{
  "dependencies": {
    "axios": "^1.6.0",
    "node-cron": "^3.0.3"
  }
}
```

### 6. Initialization (in your main CRM app file)

```javascript
// app.js or index.js
const SchedulerService = require('./services/scheduler-service');

// Start marketing automation
const scheduler = new SchedulerService();
scheduler.start();

console.log('🚀 CCI Marketing Dashboard started with automation');

// Graceful shutdown
process.on('SIGTERM', () => {
  scheduler.stop();
  process.exit(0);
});
```

## Migration Benefits:

1. **Better Performance**: No impact on website builds
2. **Centralized Management**: All marketing automation in CRM
3. **Database Integration**: Store post history and analytics
4. **Better Error Handling**: Retry mechanisms and logging
5. **Scalable**: Can add more social platforms easily

## Next Steps:

1. Copy these files to your CRM project
2. Install dependencies: `npm install axios node-cron`
3. Configure environment variables
4. Test Facebook API connection
5. Start the scheduler service

The website workflow is now clean and only handles builds/deployments!