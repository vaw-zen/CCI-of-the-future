/**
 * Test script for the Facebook posting API
 * 
 * This demonstrates how to use the /api/post-to-facebook endpoint
 * You can run this with: node test-facebook-post.js
 */

// Test configuration
const API_BASE_URL = 'http://localhost:3000'; // Adjust for your deployment
const API_ENDPOINT = '/api/post-to-facebook';

async function testFacebookPost() {
  console.log('🧪 Testing Facebook Post API...\n');

  try {
    // Test 1: Health check (GET request)
    console.log('1️⃣ Testing health check (GET)...');
    const healthResponse = await fetch(`${API_BASE_URL}${API_ENDPOINT}`, {
      method: 'GET'
    });
    const healthData = await healthResponse.json();
    console.log('✅ Health check result:', healthData);
    console.log('');

    // Test 2: Post with default caption (no body)
    console.log('2️⃣ Testing post with default caption...');
    const defaultResponse = await fetch(`${API_BASE_URL}${API_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const defaultData = await defaultResponse.json();
    console.log('✅ Default post result:', defaultData);
    console.log('');

    // Test 3: Post with custom caption
    console.log('3️⃣ Testing post with custom caption...');
    const customResponse = await fetch(`${API_BASE_URL}${API_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        caption: '🧽 Professional cleaning tip: Always test cleaning products on a small, hidden area first! #CCITunisie #CleaningTips'
      })
    });
    const customData = await customResponse.json();
    console.log('✅ Custom caption result:', customData);
    console.log('');

    // Test 4: Post with caption and image
    console.log('4️⃣ Testing post with caption and image...');
    const imageResponse = await fetch(`${API_BASE_URL}${API_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        caption: '✨ Before and after: See the magic of professional sofa cleaning! 🛋️ #CCITunisie #BeforeAndAfter #SofaCleaning',
        imageUrl: 'https://cciservices.online/home/marblepolishing.webp' // Example image from your site
      })
    });
    const imageData = await imageResponse.json();
    console.log('✅ Image post result:', imageData);
    console.log('');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// For browser usage (if you want to test from browser console)
if (typeof window !== 'undefined') {
  window.testFacebookPost = testFacebookPost;
  console.log('🌐 Browser mode: Run testFacebookPost() in console');
} else {
  // Node.js usage
  testFacebookPost();
}

// Example usage with cron or automation:
/*
// Daily automated post example
function createDailyPost() {
  const tips = [
    "✨ Daily tip: Regular sofa cleaning keeps your home fresh and allergy-free!",
    "🧽 Pro tip: Vacuum your carpets before deep cleaning for better results!",
    "🛋️ Did you know? Professional cleaning extends furniture life by up to 5 years!",
    "🏠 Clean tip: Rotate cushions regularly to prevent uneven wear!",
    "💎 Marble care: Use pH-neutral cleaners to preserve the natural shine!"
  ];
  
  const images = [
    "https://yoursite.com/cleaning-tip-1.jpg",
    "https://yoursite.com/cleaning-tip-2.jpg",
    // Add more images...
  ];
  
  const randomTip = tips[Math.floor(Math.random() * tips.length)];
  const randomImage = images[Math.floor(Math.random() * images.length)];
  
  return fetch('/api/post-to-facebook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      caption: randomTip,
      imageUrl: randomImage
    })
  });
}
*/