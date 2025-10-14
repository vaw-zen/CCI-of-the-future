/**
 * Test script for Facebook Auto-Post API improvements
 * Tests content quality and image matching
 */

async function testFacebookAutoPost() {
  console.log('🧪 Testing Facebook Auto-Post API improvements...\n');

  const API_URL = 'http://localhost:3000/api/auto-post-daily';
  
  const testCases = [
    {
      name: 'Test 1: Salon Cleaning Tip',
      body: {
        postType: 'tip',
        customPrompt: 'Génère UN conseil pour le nettoyage de salon/canapé avec CCI Services',
        includeImage: true,
        includeHashtags: false
      },
      expectedService: 'salon'
    },
    {
      name: 'Test 2: Marble Service',
      body: {
        postType: 'service', 
        customPrompt: 'Présente le service de polissage marbre de CCI Services',
        includeImage: true,
        includeHashtags: false
      },
      expectedService: 'marbre'
    },
    {
      name: 'Test 3: Carpet Cleaning',
      body: {
        postType: 'tip',
        customPrompt: 'Donne un conseil CCI Services pour nettoyage de tapis',
        includeImage: true,
        includeHashtags: false
      },
      expectedService: 'tapis'
    },
    {
      name: 'Test 4: General Motivation',
      body: {
        postType: 'motivation',
        includeImage: true,
        includeHashtags: false
      },
      expectedService: 'general'
    }
  ];

  for (const [index, testCase] of testCases.entries()) {
    console.log(`\n📋 ${testCase.name}`);
    console.log('─'.repeat(50));
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCase.body)
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.log(`❌ Error: ${response.status}`);
        console.log(`Response: ${errorData}`);
        continue;
      }

      const data = await response.json();
      
      // Test results analysis
      console.log(`✅ Status: ${data.success ? 'Success' : 'Failed'}`);
      console.log(`📝 Content Length: ${data.generated_content?.length || 0} chars`);
      console.log(`🖼️ Image Selected: ${data.selected_image ? 'Yes' : 'No'}`);
      
      if (data.selected_image) {
        const imageFilename = data.selected_image.split('/').pop();
        console.log(`📂 Image File: ${imageFilename}`);
      }
      
      if (data.content_analysis) {
        console.log(`🎯 Detected Service: ${data.content_analysis.detected_service}`);
        console.log(`📞 Has Contact Info: ${data.content_analysis.has_all_contact_info ? 'Yes' : 'No'}`);
        
        // Check if image matches content
        const imageService = getServiceFromImageUrl(data.selected_image);
        const contentService = data.content_analysis.detected_service;
        const isMatch = imageService === contentService || 
                       (contentService === 'general' && ['salon', 'tapis', 'marbre'].includes(imageService));
        
        console.log(`🔄 Image-Content Match: ${isMatch ? '✅ Good' : '❌ Mismatch'}`);
        
        if (!isMatch) {
          console.log(`   Expected: ${contentService}, Got: ${imageService}`);
        }
      }
      
      // Content preview
      if (data.generated_content) {
        const preview = data.generated_content.split('\n\n')[0]; // Main content only
        console.log(`📖 Content Preview: "${preview.substring(0, 100)}..."`);
        
        // Check for quality issues
        const qualityIssues = [];
        if (preview.length < 150) qualityIssues.push('Too short');
        if (preview.length > 350) qualityIssues.push('Too long');
        if (!preview.toLowerCase().includes('cci services')) qualityIssues.push('Missing CCI Services');
        if ((preview.match(/\n/g) || []).length > 2) qualityIssues.push('Multiple paragraphs');
        
        if (qualityIssues.length > 0) {
          console.log(`⚠️ Quality Issues: ${qualityIssues.join(', ')}`);
        } else {
          console.log(`✅ Quality: Good`);
        }
      }
      
      // Small delay between tests
      if (index < testCases.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
    } catch (error) {
      console.log(`❌ Test Failed: ${error.message}`);
    }
  }

  console.log('\n🎯 Test Summary');
  console.log('─'.repeat(50));
  console.log('✅ Improvements implemented:');
  console.log('   - Enhanced content analysis for better image matching');
  console.log('   - Stricter prompts to prevent multiple posts');
  console.log('   - Content quality validation and cleanup');
  console.log('   - Better service detection with weighted keywords');
  console.log('   - Fixed image filename (nettoyage-professionnel-post-chantier.webp)');
  
  console.log('\n💡 Recommendations:');
  console.log('   - Monitor image-content matching accuracy');
  console.log('   - Test with production Facebook API');
  console.log('   - Verify content quality meets standards');
  console.log('   - Ensure single post generation');
}

function getServiceFromImageUrl(imageUrl) {
  if (!imageUrl) return 'none';
  
  const url = imageUrl.toLowerCase();
  if (url.includes('salon') || url.includes('canapé')) return 'salon';
  if (url.includes('tapis') || url.includes('moquette')) return 'tapis';
  if (url.includes('marbre') || url.includes('marble')) return 'marbre';
  if (url.includes('chantier') || url.includes('construction')) return 'postChantier';
  if (url.includes('tapisserie') || url.includes('upholstery')) return 'tapisserie';
  if (url.includes('tfc') || url.includes('bureau')) return 'tfc';
  return 'general';
}

// Run tests
testFacebookAutoPost().catch(console.error);