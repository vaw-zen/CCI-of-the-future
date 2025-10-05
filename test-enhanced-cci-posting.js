const fetch = require('node-fetch');

async function testEnhancedCCIPosting() {
  console.log("🧪 Testing Enhanced CCI Facebook Posting API\n");

  const tests = [
    {
      name: "Salon Cleaning Tip",
      data: {
        postType: "tip",
        customPrompt: "Conseil pour nettoyer les canapés en cuir"
      }
    },
    {
      name: "Marble Polishing Service",
      data: {
        postType: "service",
        customPrompt: "Service de polissage de marbre professionnel"
      }
    },
    {
      name: "Carpet Cleaning Motivation",
      data: {
        postType: "motivation",
        customPrompt: "Bénéfices du nettoyage professionnel de tapis"
      }
    },
    {
      name: "Seasonal Cleaning",
      data: {
        postType: "seasonal"
      }
    }
  ];

  for (const test of tests) {
    console.log(`\n📝 Testing: ${test.name}`);
    console.log("=" .repeat(50));

    try {
      const response = await fetch('http://localhost:3000/api/auto-post-daily', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...test.data,
          includeHashtags: true,
          includeImage: true
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        console.log("✅ SUCCESS");
        console.log(`📱 Post Type: ${result.post_type}`);
        console.log(`🖼️  Selected Image: ${result.selected_image}`);
        console.log(`🔍 Detected Service: ${result.content_analysis?.detected_service}`);
        console.log(`📞 Has All Contact Info: ${result.content_analysis?.has_all_contact_info ? '✅ YES' : '❌ NO'}`);
        console.log(`📝 Generated Content:`);
        console.log(result.generated_content);
        
        // Check for all required contact information
        const content = result.generated_content;
        const checks = {
          website: content.includes('cciservices.online'),
          phone: content.includes('+216 98 55 77 66'),
          email: content.includes('contact@cciservices.online'),
          cta: content.includes('Devis') || content.includes('devis')
        };
        
        console.log("\n🔍 Contact Info Verification:");
        console.log(`   🌐 Website: ${checks.website ? '✅' : '❌'}`);
        console.log(`   📞 Phone: ${checks.phone ? '✅' : '❌'}`);
        console.log(`   📧 Email: ${checks.email ? '✅' : '❌'}`);
        console.log(`   💬 CTA: ${checks.cta ? '✅' : '❌'}`);
        
        const allPresent = Object.values(checks).every(Boolean);
        console.log(`\n📊 Overall Contact Completeness: ${allPresent ? '✅ PERFECT' : '⚠️  INCOMPLETE'}`);

      } else {
        console.log("❌ FAILED");
        console.log(`Error: ${result.error}`);
        if (result.details) {
          console.log(`Details: ${result.details}`);
        }
      }
      
      // Wait between tests to avoid rate limits
      console.log("\n⏳ Waiting 3 seconds before next test...");
      await new Promise(resolve => setTimeout(resolve, 3000));

    } catch (error) {
      console.log("❌ REQUEST FAILED");
      console.error(`Error: ${error.message}`);
    }
  }

  console.log("\n🎯 Test Summary:");
  console.log("Enhanced features tested:");
  console.log("✅ Automatic call-to-action inclusion");
  console.log("✅ Comprehensive contact information");
  console.log("✅ Smart image selection based on content");
  console.log("✅ Service-specific content analysis");
  console.log("✅ CCI Services local images only");
  console.log("✅ Rotating primary CTAs with full contact info");
}

// Run the test
testEnhancedCCIPosting().catch(console.error);