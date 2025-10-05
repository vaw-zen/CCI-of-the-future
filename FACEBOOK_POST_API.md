# Facebook Posting API Documentation

## Overview
This API route allows your Next.js website to automatically post content to your company's Facebook Page using the Meta Graph API.

## Endpoint
```
POST /api/post-to-facebook
GET /api/post-to-facebook (health check)
```

## ⚠️ **IMPORTANT: Facebook Permission Requirements**

### Current Status
The API is properly implemented, but **Facebook requires the `pages_manage_posts` permission** which needs App Review for production use.

### Permission Status Check
Your current token has these permissions:
- ✅ `pages_read_engagement` 
- ✅ `pages_show_list`
- ❌ `pages_manage_posts` (Required for posting)

### Solutions

#### Option 1: Development Mode (Immediate)
If your Facebook app is in **Development Mode**:
1. Go to [Facebook Developers](https://developers.facebook.com/apps/)
2. Select your app
3. Go to "App Review" → "Permissions and Features"
4. Find `pages_manage_posts` and request it
5. For development apps, this might be granted automatically

#### Option 2: App Review (Production)
For production use:
1. Submit your app for Facebook App Review
2. Provide use case justification for `pages_manage_posts`
3. Wait for approval (can take days/weeks)

#### Option 3: Manual Posting (Workaround)
Use existing tools:
- Facebook Creator Studio
- Meta Business Suite
- Direct Facebook posting

#### Option 4: Test with Personal Page
Create a test Facebook page where you have full admin rights and the app is in development mode.

## Environment Variables Required
Make sure these environment variables are set in your `.env.local` file:

```env
FB_PAGE_ID=your_facebook_page_id
FB_PAGE_ACCESS_TOKEN=your_page_access_token
FB_API_VERSION=v17.0  # Optional, defaults to v17.0
```

## Usage Examples

### 1. Basic POST Request (with default caption)
```javascript
const response = await fetch('/api/post-to-facebook', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
});
const result = await response.json();
```

### 2. Custom Caption
```javascript
const response = await fetch('/api/post-to-facebook', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    caption: '🧽 Professional cleaning tip: Always test products on a small area first!'
  })
});
```

### 3. Caption with Image
```javascript
const response = await fetch('/api/post-to-facebook', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    caption: '✨ Before and after: See the magic of professional cleaning! 🛋️',
    imageUrl: 'https://yourwebsite.com/images/before-after.jpg'
  })
});
```

### 4. Health Check
```javascript
const response = await fetch('/api/post-to-facebook', {
  method: 'GET'
});
const status = await response.json();
// Returns configuration status and environment variables check
```

## Request Body Schema
```typescript
{
  caption?: string;    // Optional: Post caption (uses default if not provided)
  imageUrl?: string;   // Optional: URL to image to post
}
```

## Response Schema

### Success Response
```json
{
  "success": true,
  "facebook_response": {
    "id": "facebook_post_id",
    "post_id": "page_id_post_id"
  },
  "posted_caption": "The caption that was posted",
  "posted_image": "URL of image posted or null"
}
```

### Error Response
```json
{
  "error": "Error message",
  "success": false,
  "details": "Additional error details from Facebook API"
}
```

## Integration Examples

### With Cron Jobs (Automated Daily Posts)
```javascript
// pages/api/cron/daily-facebook-post.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const dailyTips = [
    "✨ Daily tip: Regular sofa cleaning keeps your home fresh and allergy-free!",
    "🧽 Pro tip: Vacuum your carpets before deep cleaning for better results!",
    "🛋️ Did you know? Professional cleaning extends furniture life by up to 5 years!"
  ];

  const randomTip = dailyTips[Math.floor(Math.random() * dailyTips.length)];

  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/post-to-facebook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ caption: randomTip })
    });

    const result = await response.json();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

### With Vercel Cron (vercel.json)
```json
{
  "crons": [{
    "path": "/api/cron/daily-facebook-post",
    "schedule": "0 9 * * *"
  }]
}
```

### From React Components
```jsx
import { useState } from 'react';

function AdminPostButton() {
  const [posting, setPosting] = useState(false);

  const handlePost = async () => {
    setPosting(true);
    try {
      const response = await fetch('/api/post-to-facebook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caption: '🏠 Weekly cleaning tip from CCI Services!',
          imageUrl: '/images/cleaning-tip.jpg'
        })
      });
      
      const result = await response.json();
      if (result.success) {
        alert('Posted to Facebook successfully!');
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      alert('Network error: ' + error.message);
    } finally {
      setPosting(false);
    }
  };

  return (
    <button onClick={handlePost} disabled={posting}>
      {posting ? 'Posting...' : 'Post to Facebook'}
    </button>
  );
}
```

## Error Handling
The API handles various error scenarios:

- **Missing environment variables**: Returns 500 with configuration error
- **Facebook API errors**: Returns the specific Facebook error code and message
- **Network errors**: Returns 500 with generic error message
- **Invalid JSON**: Gracefully handles malformed request bodies

## Security Notes
- The `FB_PAGE_ACCESS_TOKEN` should be a Page Access Token, not a User Access Token
- Keep your access token secure and never expose it in client-side code
- Consider implementing rate limiting for production use
- Add authentication/authorization if this will be accessible from admin panels

## Testing
Run the included test script:
```bash
node test-facebook-post.js
```

Or test manually with curl:
```bash
# Health check
curl -X GET http://localhost:3000/api/post-to-facebook

# Post with default caption
curl -X POST http://localhost:3000/api/post-to-facebook \
  -H "Content-Type: application/json"

# Post with custom content
curl -X POST http://localhost:3000/api/post-to-facebook \
  -H "Content-Type: application/json" \
  -d '{"caption":"Test post from API","imageUrl":"https://example.com/image.jpg"}'
```

## Facebook Page Access Token Setup
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create an app or use existing app
3. Add "Pages" permission to your app
4. Request the following permissions for your app:
   - `pages_show_list` (to read page info)
   - `pages_manage_posts` (to publish posts) - **Requires App Review for production**
   - `pages_read_engagement` (optional, for reading post metrics)
5. Generate a Page Access Token for your Facebook Page
6. Add the token to your environment variables as `FB_PAGE_ACCESS_TOKEN`

### Important Notes about Permissions:
- **Development Mode**: You can test with limited permissions using your own page
- **Production Mode**: `pages_manage_posts` requires Facebook App Review
- **Alternative**: Use Facebook's Creator Studio or Meta Business Suite for manual posting
- **Workaround**: For testing, ensure your Facebook app is in Development mode and you're an admin of the page

## API Behavior
- **With Image**: Uses `/photos` endpoint (requires `pages_manage_posts` permission)
- **Text Only**: Uses `/feed` endpoint (requires `pages_manage_posts` permission)
- **Auto-Detection**: API automatically chooses the correct endpoint based on whether `imageUrl` is provided

## Troubleshooting
- **"Missing Facebook configuration"**: Check that `FB_PAGE_ID` and `FB_PAGE_ACCESS_TOKEN` are set
- **"OAuth error"** or **"(#200) permission not available"**: Your access token may be expired or missing required permissions
- **"(#324) Requires upload file"**: Fixed in latest version - API now uses correct endpoints for text vs photo posts
- **"Permission denied"**: Ensure your token has `pages_manage_posts` permission (requires App Review for production)
- **"Image not found"**: Make sure the `imageUrl` is publicly accessible
- **App Review Issues**: For production use, submit your app for Facebook App Review to get `pages_manage_posts` approved

### Development vs Production
- **Development**: Works with your own pages if you're an app admin
- **Production**: Requires Facebook App Review for `pages_manage_posts` permission
- **Testing**: Use Facebook's Graph API Explorer to test your token permissions