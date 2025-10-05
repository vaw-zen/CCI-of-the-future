const fetch = require('node-fetch');

async function testImageAccessibility() {
  console.log("🖼️ Testing CCI Services Image Accessibility\n");

  const testImages = [
    // Salon images
    "https://cciservices.online/gallery/salon/salon.jpg",
    "https://cciservices.online/gallery/salon/salon2.jpg", 
    "https://cciservices.online/home/nettoyagesolonméthodeinjectionextraction.webp",
    
    // Tapis/Moquette images
    "https://cciservices.online/home/nettoyage%20moquetteaveclaméthodeinjectionextraction.webp",
    "https://cciservices.online/gallery/moquette/moquette1.jpg",
    
    // Marbre images
    "https://cciservices.online/home/cristallisationsolenmarbre.webp",
    "https://cciservices.online/gallery/marbre/marbre.jpg",
    "https://cciservices.online/home/polishingkitchenmrblecountre.webp",
    "https://cciservices.online/gallery/marbre/marbre2.jpg",

    
    // Tapisserie images
    "https://cciservices.online/home/tapisserie1.webp",
    "https://cciservices.online/gallery/tapisserie/tapisserie1.jpg",
    
    // Nettoyage-post-chantier images
    "https://cciservices.online/gallery/tfc/marbre.jpg",
    "https://cciservices.online/gallery/tfc/tfc.webp",
    "https://cciservices.online/home/interior-cleaning-detailing.png",

    
    // General images
    "https://cciservices.online/home/marblepolishing.webp",
    "https://cciservices.online/home/interior-cleaning-detailing.png"
  ];

  const results = {
    accessible: [],
    failed: []
  };

  for (const imageUrl of testImages) {
    try {
      const response = await fetch(imageUrl, { method: 'HEAD' });
      
      if (response.ok) {
        console.log(`✅ ${imageUrl} - Status: ${response.status}`);
        results.accessible.push(imageUrl);
      } else {
        console.log(`❌ ${imageUrl} - Status: ${response.status}`);
        results.failed.push(imageUrl);
      }
      
      // Small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.log(`❌ ${imageUrl} - Error: ${error.message}`);
      results.failed.push(imageUrl);
    }
  }

  console.log(`\n📊 SUMMARY:`);
  console.log(`✅ Accessible images: ${results.accessible.length}`);
  console.log(`❌ Failed images: ${results.failed.length}`);
  
  if (results.failed.length > 0) {
    console.log(`\n🚨 Failed images to fix:`);
    results.failed.forEach(url => console.log(`   ${url}`));
  }

  return results;
}

// Test a simple post with the new image structure
async function testFacebookPostWithNewImages() {
  console.log("\n🧪 Testing Facebook Post with Updated Images\n");

  try {
    const response = await fetch('http://localhost:3000/api/auto-post-daily', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        postType: "service",
        customPrompt: "Service de nettoyage de salon professionnel",
        includeHashtags: true,
        includeImage: true
      }),
    });

    const result = await response.json();

    if (response.ok && result.success) {
      console.log("✅ POST SUCCESS!");
      console.log(`🖼️ Selected Image: ${result.selected_image}`);
      console.log(`📝 Generated Content Length: ${result.generated_content.length} chars`);
      console.log(`🔍 Detected Service: ${result.content_analysis?.detected_service}`);
      console.log(`📞 Has Complete Contact: ${result.content_analysis?.has_all_contact_info ? '✅' : '❌'}`);
    } else {
      console.log("❌ POST FAILED");
      console.log(`Error: ${result.error}`);
      console.log(`Selected Image: ${result.selected_image}`);
    }

  } catch (error) {
    console.log("❌ REQUEST FAILED");
    console.error(`Error: ${error.message}`);
  }
}

// Run tests
async function runAllTests() {
  await testImageAccessibility();
  await testFacebookPostWithNewImages();
}

runAllTests().catch(console.error);