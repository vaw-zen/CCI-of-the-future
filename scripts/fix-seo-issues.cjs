/**
 * SEO Article Fixer
 * Automatically fixes common SEO issues in articles
 */

const fs = require('fs');
const path = require('path');

class SEOArticleFixer {
  constructor() {
    this.articlesPath = path.join(__dirname, '..', 'src', 'app', 'conseils', 'data', 'articles.js');
    this.fixes = [];
  }

  /**
   * Fix an individual article's SEO issues
   */
  fixArticleSEO(article) {
    const fixes = [];
    let fixed = { ...article };

    // Fix missing keywords - extract from title and meta description
    if (!fixed.keywords || fixed.keywords.length === 0) {
      fixed.keywords = this.generateKeywords(fixed.title, fixed.metaDescription, fixed.slug);
      fixes.push('Added keywords');
    }

    // Fix meta title length (30-60 characters)
    if (fixed.metaTitle && (fixed.metaTitle.length < 30 || fixed.metaTitle.length > 60)) {
      fixed.metaTitle = this.optimizeMetaTitle(fixed.metaTitle, fixed.title);
      fixes.push('Optimized meta title length');
    }

    // Fix meta description length (120-160 characters)
    if (fixed.metaDescription && (fixed.metaDescription.length < 120 || fixed.metaDescription.length > 160)) {
      fixed.metaDescription = this.optimizeMetaDescription(fixed.metaDescription, fixed.excerpt);
      fixes.push('Optimized meta description length');
    }

    return { fixed, fixes };
  }

  /**
   * Generate relevant keywords from title and content
   */
  generateKeywords(title, description, slug) {
    const keywords = new Set();
    
    // Extract from slug
    slug.split('-').forEach(word => {
      if (word.length > 3) keywords.add(word);
    });
    
    // Common CCI Services keywords
    const commonKeywords = [
      'nettoyage professionnel',
      'CCI services',
      'nettoyage tunis',
      'entreprise nettoyage'
    ];
    
    // Service-specific keywords based on content
    if (title.toLowerCase().includes('tapis') || title.toLowerCase().includes('moquette')) {
      keywords.add('nettoyage tapis');
      keywords.add('nettoyage moquette');
      keywords.add('lavage tapis tunis');
    }
    
    if (title.toLowerCase().includes('canapé') || title.toLowerCase().includes('salon')) {
      keywords.add('nettoyage canapé');
      keywords.add('nettoyage salon');
      keywords.add('nettoyage fauteuil');
    }
    
    if (title.toLowerCase().includes('marbre')) {
      keywords.add('traitement marbre');
      keywords.add('polissage marbre');
      keywords.add('ponçage marbre');
    }
    
    if (title.toLowerCase().includes('cuir')) {
      keywords.add('nettoyage cuir');
      keywords.add('entretien cuir');
    }
    
    if (title.toLowerCase().includes('prix') || title.toLowerCase().includes('tarif')) {
      keywords.add('tarif nettoyage');
      keywords.add('prix nettoyage');
      keywords.add('devis gratuit');
    }
    
    // Add common keywords
    commonKeywords.forEach(keyword => keywords.add(keyword));
    
    return Array.from(keywords).slice(0, 5); // Limit to 5 keywords
  }

  /**
   * Optimize meta title length
   */
  optimizeMetaTitle(currentTitle, fallbackTitle) {
    let optimized = currentTitle || fallbackTitle;
    
    // If too long, truncate intelligently
    if (optimized.length > 60) {
      // Try to cut at natural break points
      const breakPoints = [' | CCI Services', ' - CCI Services', ' :', ' -', ' |'];
      
      for (const breakPoint of breakPoints) {
        if (optimized.includes(breakPoint)) {
          const beforeBreak = optimized.split(breakPoint)[0];
          if (beforeBreak.length <= 55) {
            optimized = beforeBreak + ' | CCI Services';
            break;
          }
        }
      }
      
      // If still too long, hard truncate
      if (optimized.length > 60) {
        optimized = optimized.substring(0, 55) + '...';
      }
    }
    
    // If too short, add more context
    if (optimized.length < 30) {
      if (!optimized.includes('CCI Services')) {
        optimized += ' | CCI Services';
      }
      if (!optimized.includes('Tunis') && optimized.length < 50) {
        optimized = optimized.replace(' |', ' Tunis |');
      }
    }
    
    return optimized;
  }

  /**
   * Optimize meta description length
   */
  optimizeMetaDescription(currentDesc, fallbackDesc) {
    let optimized = currentDesc || fallbackDesc;
    
    // If too long, truncate intelligently
    if (optimized.length > 160) {
      // Find last complete sentence or phrase within limit
      const sentences = optimized.split('. ');
      let result = '';
      
      for (const sentence of sentences) {
        if ((result + sentence + '. ').length <= 157) {
          result += (result ? '. ' : '') + sentence;
        } else {
          break;
        }
      }
      
      // If we got something reasonable, use it
      if (result.length >= 120) {
        optimized = result + '.';
      } else {
        // Hard truncate with ellipsis
        optimized = optimized.substring(0, 157) + '...';
      }
    }
    
    // If too short, expand with common phrases
    if (optimized.length < 120) {
      const expansions = [
        ' Contactez CCI Services au +216 98-557-766 pour un devis gratuit.',
        ' Service professionnel à domicile dans tout le Grand Tunis.',
        ' Intervention rapide et tarifs transparents.',
        ' Experts en nettoyage professionnel depuis 15 ans.'
      ];
      
      for (const expansion of expansions) {
        if ((optimized + expansion).length <= 160) {
          optimized += expansion;
          break;
        }
      }
    }
    
    return optimized;
  }

  /**
   * Apply fixes to the articles.js file
   */
  async applyFixes() {
    console.log('🔧 Reading articles file...');
    
    try {
      let content = fs.readFileSync(this.articlesPath, 'utf8');
      let fixedCount = 0;
      
      // Find and fix each article
      const articleRegex = /{[\s\S]*?id:\s*(\d+)[\s\S]*?}/g;
      const articles = [...content.matchAll(articleRegex)];
      
      console.log(`📋 Found ${articles.length} articles to process...`);
      
      // Process articles in reverse order to avoid position shifts
      for (let i = articles.length - 1; i >= 0; i--) {
        const match = articles[i];
        const articleStr = match[0];
        
        // Extract article properties
        const extracted = this.extractArticleData(articleStr);
        if (!extracted) continue;
        
        // Check if needs fixing
        const needsKeywords = !extracted.keywords || extracted.keywords.length === 0;
        const needsTitleFix = !extracted.metaTitle || extracted.metaTitle.length < 30 || extracted.metaTitle.length > 60;
        const needsDescFix = !extracted.metaDescription || extracted.metaDescription.length < 120 || extracted.metaDescription.length > 160;
        
        if (needsKeywords || needsTitleFix || needsDescFix) {
          const { fixed, fixes } = this.fixArticleSEO(extracted);
          
          // Generate the fixed article string
          const fixedArticleStr = this.generateArticleString(articleStr, fixed);
          
          // Replace in content
          content = content.replace(articleStr, fixedArticleStr);
          
          console.log(`✅ Fixed Article #${extracted.id}: ${fixes.join(', ')}`);
          fixedCount++;
        }
      }
      
      if (fixedCount > 0) {
        // Backup original file
        const backupPath = this.articlesPath + '.backup-' + Date.now();
        fs.writeFileSync(backupPath, fs.readFileSync(this.articlesPath, 'utf8'));
        console.log(`💾 Backup created: ${backupPath}`);
        
        // Write fixed content
        fs.writeFileSync(this.articlesPath, content);
        console.log(`✅ Applied fixes to ${fixedCount} articles`);
      } else {
        console.log('ℹ️  No articles needed fixing');
      }
      
      return fixedCount;
    } catch (error) {
      console.error('❌ Error applying fixes:', error.message);
      throw error;
    }
  }

  /**
   * Extract article data from string representation
   */
  extractArticleData(articleStr) {
    try {
      const data = {};
      
      // Extract ID
      const idMatch = articleStr.match(/id:\s*(\d+)/);
      data.id = idMatch ? parseInt(idMatch[1]) : null;
      
      // Extract title
      const titleMatch = articleStr.match(/title:\s*['"`]([^'"`]+)['"`]/);
      data.title = titleMatch ? titleMatch[1] : '';
      
      // Extract metaTitle
      const metaTitleMatch = articleStr.match(/metaTitle:\s*['"`]([^'"`]+)['"`]/);
      data.metaTitle = metaTitleMatch ? metaTitleMatch[1] : '';
      
      // Extract metaDescription
      const metaDescMatch = articleStr.match(/metaDescription:\s*['"`]([^'"`]+)['"`]/);
      data.metaDescription = metaDescMatch ? metaDescMatch[1] : '';
      
      // Extract slug
      const slugMatch = articleStr.match(/slug:\s*['"`]([^'"`]+)['"`]/);
      data.slug = slugMatch ? slugMatch[1] : '';
      
      // Extract excerpt
      const excerptMatch = articleStr.match(/excerpt:\s*['"`]([^'"`]+)['"`]/);
      data.excerpt = excerptMatch ? excerptMatch[1] : '';
      
      // Extract existing keywords
      const keywordsMatch = articleStr.match(/keywords:\s*\[(.*?)\]/s);
      if (keywordsMatch) {
        const keywordsStr = keywordsMatch[1];
        data.keywords = keywordsStr.match(/"([^"]+)"/g)?.map(k => k.replace(/"/g, '')) || [];
      } else {
        data.keywords = [];
      }
      
      return data;
    } catch (error) {
      console.error('Error extracting article data:', error.message);
      return null;
    }
  }

  /**
   * Generate fixed article string
   */
  generateArticleString(originalStr, fixedData) {
    let fixed = originalStr;
    
    // Update metaTitle
    if (fixedData.metaTitle) {
      fixed = fixed.replace(
        /metaTitle:\s*['"`]([^'"`]*)['"`]/,
        `metaTitle: '${fixedData.metaTitle.replace(/'/g, "\\'")}'`
      );
    }
    
    // Update metaDescription
    if (fixedData.metaDescription) {
      fixed = fixed.replace(
        /metaDescription:\s*['"`]([^'"`]*)['"`]/,
        `metaDescription: '${fixedData.metaDescription.replace(/'/g, "\\'")}'`
      );
    }
    
    // Update keywords
    if (fixedData.keywords && fixedData.keywords.length > 0) {
      const keywordsStr = fixedData.keywords.map(k => `"${k}"`).join(',');
      fixed = fixed.replace(
        /keywords:\s*\[.*?\]/s,
        `keywords: [${keywordsStr}]`
      );
    }
    
    return fixed;
  }
}

// CLI Usage
async function main() {
  const fixer = new SEOArticleFixer();
  
  try {
    console.log('🔧 Starting SEO article fixes...\n');
    
    const fixedCount = await fixer.applyFixes();
    
    console.log(`\n✅ SEO fixes completed! Fixed ${fixedCount} articles.`);
    console.log('\n📋 Next steps:');
    console.log('1. Run verification: node scripts/verify-indexing.cjs');
    console.log('2. Test the articles in browser');
    console.log('3. Commit changes if satisfied');
    
  } catch (error) {
    console.error('❌ SEO fixing failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = SEOArticleFixer;