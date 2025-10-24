# CCI Services Articles API Documentation

## Overview

This API allows external systems (like CRM dashboards) to manage article data for the CCI Services website. All endpoints require API key authentication and support CRUD operations on blog articles.

## Base URL
```
https://cciservices.online/api
```

## Authentication

All requests must include the API key in the `x-api-key` header:

```bash
curl -H "x-api-key: your_api_key_here" \
     -H "Content-Type: application/json" \
     https://cciservices.online/api/articles
```

## API Endpoints

### 1. GET /api/articles
**Description:** Retrieve all articles

**Request:**
```bash
curl -H "x-api-key: your_api_key" \
     https://cciservices.online/api/articles
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "slug": "guide-nettoyage-tapis-tunis-2025",
      "title": "Nettoyage de Tapis et Moquettes : Solutions Professionnelles CCI Services Tunisie",
      "metaTitle": "Nettoyage de Tapis et Moquettes Tunis - Entreprise Professionnelle | CCI Services",
      "metaDescription": "Entreprise nettoyage moquette Tunis ⭐ Shampouinage, injection-extraction, devis gratuit...",
      "excerpt": "Entreprise nettoyage moquette Tunis - Shampouinage professionnel...",
      "category": "tapis",
      "categoryLabel": "Nettoyage Tapis",
      "keywords": ["guide", "nettoyage", "tapis", "tunis", "2025"],
      "author": "CCI Services",
      "authorImage": "/logo.png",
      "publishedDate": "2025-10-08T10:00:00Z",
      "updatedDate": "2025-10-08T10:00:00Z",
      "image": "/home/nettoyagemoquetteaveclaméthodeinjectionextraction.webp",
      "imageAlt": "Nettoyage professionnel tapis avec méthode injection-extraction à Tunis",
      "readTime": "8 min",
      "featured": true,
      "content": "<div class=\"article-intro\">...</div>"
    }
  ],
  "count": 7,
  "message": "Articles retrieved successfully"
}
```

### 2. POST /api/articles
**Description:** Create a new article

**Request:**
```bash
curl -X POST \
     -H "x-api-key: your_api_key" \
     -H "Content-Type: application/json" \
     -d '{
       "title": "New Article Title",
       "content": "<p>Article content here</p>",
       "category": "tapis",
       "keywords": ["keyword1", "keyword2"],
       "metaDescription": "Article description"
     }' \
     https://cciservices.online/api/articles
```

**Required Fields:**
- `title`: Article title
- `content`: HTML content

**Optional Fields:**
- `id`: Auto-generated if not provided
- `slug`: Auto-generated from title if not provided
- `metaTitle`: Defaults to title
- `metaDescription`: SEO description
- `excerpt`: Brief summary
- `category`: Article category (default: "general")
- `categoryLabel`: Display name for category
- `keywords`: Array of keywords
- `author`: Author name (default: "CCI Services")
- `authorImage`: Author image path
- `image`: Featured image path
- `imageAlt`: Alt text for image
- `readTime`: Estimated read time
- `featured`: Boolean, featured article flag

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 8,
    "slug": "new-article-title",
    "title": "New Article Title",
    "publishedDate": "2025-10-24T12:00:00Z",
    "updatedDate": "2025-10-24T12:00:00Z"
  },
  "message": "Article created successfully",
  "deployment": "triggered",
  "totalArticles": 8
}
```

### 3. GET /api/articles/[id]
**Description:** Get a single article by ID or slug

**Request:**
```bash
# By ID
curl -H "x-api-key: your_api_key" \
     https://cciservices.online/api/articles/1

# By slug
curl -H "x-api-key: your_api_key" \
     https://cciservices.online/api/articles/guide-nettoyage-tapis-tunis-2025
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "slug": "guide-nettoyage-tapis-tunis-2025",
    "title": "Nettoyage de Tapis...",
    "content": "..."
  },
  "message": "Article retrieved successfully"
}
```

### 4. PUT /api/articles/[id]
**Description:** Update an existing article

**Request:**
```bash
curl -X PUT \
     -H "x-api-key: your_api_key" \
     -H "Content-Type: application/json" \
     -d '{
       "title": "Updated Article Title",
       "content": "<p>Updated content</p>",
       "featured": true
     }' \
     https://cciservices.online/api/articles/1
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Updated Article Title",
    "updatedDate": "2025-10-24T12:00:00Z"
  },
  "message": "Article updated successfully",
  "deployment": "triggered"
}
```

### 5. DELETE /api/articles/[id]
**Description:** Delete an article

**Request:**
```bash
curl -X DELETE \
     -H "x-api-key: your_api_key" \
     https://cciservices.online/api/articles/1
```

**Response:**
```json
{
  "success": true,
  "data": {
    "deleted": {
      "id": 1,
      "title": "Deleted Article"
    },
    "remainingCount": 6
  },
  "message": "Article deleted successfully",
  "deployment": "triggered"
}
```

### 6. POST /api/rebuild
**Description:** Trigger Vercel deployment rebuild

**Request:**
```bash
curl -X POST \
     -H "x-api-key: your_api_key" \
     -H "Content-Type: application/json" \
     -d '{"reason": "Manual content update"}' \
     https://cciservices.online/api/rebuild
```

**Response:**
```json
{
  "success": true,
  "message": "Deployment triggered successfully",
  "data": {
    "reason": "Manual content update",
    "timestamp": "2025-10-24T12:00:00Z"
  }
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error type",
  "message": "Detailed error message"
}
```

### Common Error Codes:
- `401`: Unauthorized (invalid or missing API key)
- `404`: Article not found
- `400`: Bad request (validation errors)
- `500`: Internal server error

## Environment Variables

Add these to your Vercel environment variables:

```bash
# Required
API_KEY=your_64_character_api_key_here

# Optional (for auto-deployment)
VERCEL_DEPLOY_HOOK=https://api.vercel.com/v1/integrations/deploy/prj_xxx/xxx
```

## Integration Examples

### JavaScript/Node.js
```javascript
const API_KEY = 'your_api_key_here';
const BASE_URL = 'https://cciservices.online/api';

async function createArticle(articleData) {
  const response = await fetch(`${BASE_URL}/articles`, {
    method: 'POST',
    headers: {
      'x-api-key': API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(articleData)
  });
  
  return await response.json();
}

// Usage
const newArticle = await createArticle({
  title: 'My New Article',
  content: '<p>Article content</p>',
  category: 'tapis',
  keywords: ['cleaning', 'tunis']
});
```

### Python
```python
import requests

API_KEY = 'your_api_key_here'
BASE_URL = 'https://cciservices.online/api'

def get_articles():
    headers = {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json'
    }
    
    response = requests.get(f'{BASE_URL}/articles', headers=headers)
    return response.json()

# Usage
articles = get_articles()
print(f"Found {articles['count']} articles")
```

### cURL
```bash
# Get all articles
curl -H "x-api-key: your_api_key" \
     https://cciservices.online/api/articles

# Create new article
curl -X POST \
     -H "x-api-key: your_api_key" \
     -H "Content-Type: application/json" \
     -d @article.json \
     https://cciservices.online/api/articles
```

## File Structure

The API manages the articles file at:
```
src/app/conseils/data/articles.js
```

Automatic backups are created at:
```
src/app/conseils/data/articles.backup.js
```

## Security Features

- ✅ API key authentication
- ✅ Input validation
- ✅ CORS headers
- ✅ Automatic backups
- ✅ Error handling
- ✅ Rate limiting (via Vercel)

## Deployment Integration

When articles are modified, the API can automatically:
1. Create a backup of the current file
2. Write the updated articles
3. Trigger a Vercel deployment (if configured)
4. Return deployment status

This ensures your website is automatically updated with new content.

## Support

For issues or questions about the API:
- 📧 Email: contact@cciservices.online
- 📱 Phone: +216 98-557-766
- 🌐 Website: https://cciservices.online

## Rate Limits

The API inherits Vercel's serverless function limits:
- 10 seconds maximum execution time
- 50MB maximum request size
- Built-in DDoS protection