# 🔐 CRM API Key Configuration

## Your Secure API Key
```
f24434fd08302f04c4e7e0aa9944855cae6631070162c0eb460aceac32a533a2
```

**⚠️ Important: Keep this key secure and never commit it to version control!**

## Quick Test Examples

### 1. Test API Connection
```bash
curl -H "x-api-key: f24434fd08302f04c4e7e0aa9944855cae6631070162c0eb460aceac32a533a2" \
     https://cciservices.online/api/articles
```

### 2. Create New Article from CRM
```javascript
const API_KEY = 'f24434fd08302f04c4e7e0aa9944855cae6631070162c0eb460aceac32a533a2';

async function createArticle(articleData) {
  const response = await fetch('https://cciservices.online/api/articles', {
    method: 'POST',
    headers: {
      'x-api-key': API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(articleData)
  });
  
  return await response.json();
}

// Usage example
const newArticle = await createArticle({
  title: 'Nouveau Service de Nettoyage',
  content: '<p>Description du nouveau service...</p>',
  category: 'services',
  keywords: ['nettoyage', 'tunisie', 'professionnel'],
  metaDescription: 'Découvrez notre nouveau service de nettoyage'
});
```

### 3. Update Existing Article
```javascript
async function updateArticle(id, updates) {
  const response = await fetch(`https://cciservices.online/api/articles/${id}`, {
    method: 'PUT',
    headers: {
      'x-api-key': 'f24434fd08302f04c4e7e0aa9944855cae6631070162c0eb460aceac32a533a2',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updates)
  });
  
  return await response.json();
}
```

### 4. Python Example for CRM Integration
```python
import requests

API_KEY = 'f24434fd08302f04c4e7e0aa9944855cae6631070162c0eb460aceac32a533a2'
BASE_URL = 'https://cciservices.online/api'

def get_all_articles():
    headers = {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json'
    }
    
    response = requests.get(f'{BASE_URL}/articles', headers=headers)
    return response.json()

def create_article(article_data):
    headers = {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json'
    }
    
    response = requests.post(f'{BASE_URL}/articles', 
                           headers=headers, 
                           json=article_data)
    return response.json()
```

## Environment Setup

Add this to your CRM environment variables:
```bash
CCI_API_KEY=f24434fd08302f04c4e7e0aa9944855cae6631070162c0eb460aceac32a533a2
CCI_API_BASE_URL=https://cciservices.online/api
```

## Next Steps

1. **Deploy to Vercel:** Push the API code to production
2. **Test the endpoints:** Use the examples above
3. **Configure CRM:** Add the API key to your CRM system
4. **Get Vercel Deploy Hook:** For automatic deployments after article changes

## Security Notes

- ✅ API key is 64 characters long and cryptographically secure
- ✅ All endpoints require the key in `x-api-key` header
- ✅ CORS is properly configured
- ✅ Input validation on all endpoints
- ✅ Automatic backups before file changes
- ✅ Rate limiting via Vercel's built-in protection

---

**Support:** contact@cciservices.online | +216 98-557-766