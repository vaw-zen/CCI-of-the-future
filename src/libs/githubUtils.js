/**
 * GitHub API utilities for managing articles in serverless environment
 * Since Vercel has read-only filesystem, we use GitHub API to commit changes
 */

/**
 * Update articles.js file via GitHub API
 * @param {Array} articles - Array of article objects
 * @param {string} commitMessage - Commit message
 * @returns {boolean} Success status
 */
export async function updateArticlesViaGitHub(articles, commitMessage = 'Update articles via API') {
  try {
    const githubToken = process.env.GITHUB_TOKEN;
    const repoOwner = 'vaw-zen';
    const repoName = 'CCI-of-the-future';
    const filePath = 'src/app/conseils/data/articles.js';
    
    console.log('🔍 GitHub API Debug Info:');
    console.log('- Token exists:', !!githubToken);
    console.log('- Token length:', githubToken ? githubToken.length : 0);
    console.log('- Token prefix:', githubToken ? githubToken.substring(0, 8) + '...' : 'None');
    console.log('- Articles count:', articles.length);
    console.log('- Environment:', process.env.VERCEL ? 'Production' : 'Development');
    console.log('- Node version:', process.version);
    
    if (!githubToken) {
      console.error('❌ GitHub token not configured, cannot update articles.js');
      return false;
    }
    
    // Generate the new file content
    const fileContent = generateArticlesFileContent(articles);
    const encodedContent = Buffer.from(fileContent).toString('base64');
    
    console.log('📝 Generated file content length:', fileContent.length);
    console.log('📝 Encoded content length:', encodedContent.length);
    
    // Get current file SHA
    console.log('📄 Getting current file SHA from GitHub...');
    const getCurrentFile = await fetch(
      `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`,
      {
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'CCI-API'
        }
      }
    );
    
    console.log('📄 Get current file response status:', getCurrentFile.status);
    
    if (!getCurrentFile.ok) {
      const errorText = await getCurrentFile.text();
      console.error('❌ Failed to get current file:', errorText);
      throw new Error(`Failed to get current file: ${getCurrentFile.status} - ${errorText}`);
    }
    
    const currentFileData = await getCurrentFile.json();
    console.log('📄 Current file SHA:', currentFileData.sha.substring(0, 8) + '...');
    console.log('📄 Current file size:', currentFileData.size);
    
    // Update the file
    console.log('📤 Updating file via GitHub API...');
    const updateResponse = await fetch(
      `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'CCI-API'
        },
        body: JSON.stringify({
          message: commitMessage,
          content: encodedContent,
          sha: currentFileData.sha,
          branch: 'main'
        })
      }
    );
    
    console.log('📤 Update file response status:', updateResponse.status);
    
    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error('❌ GitHub API update failed:', errorText);
      throw new Error(`GitHub API error: ${updateResponse.status} - ${errorText}`);
    }
    
    const updateData = await updateResponse.json();
    console.log(`✅ Successfully updated articles.js via GitHub API`);
    console.log(`📄 New commit SHA: ${updateData.commit.sha.substring(0, 8)}...`);
    console.log(`🔗 Commit URL: ${updateData.commit.html_url}`);
    
    return true;
  } catch (error) {
    console.error('❌ Error updating articles via GitHub:', error);
    console.error('❌ Error stack:', error.stack);
    return false;
  }
}

/**
 * Generate the complete file content for articles.js (maintaining existing format)
 * @param {Array} articles - Array of article objects
 * @returns {string} File content
 */
function generateArticlesFileContent(articles) {
  const header = `// Base de données des articles de blog SEO
`;

  const articlesJson = JSON.stringify(articles, null, 2);
  const exportStatement = `export const articles = ${articlesJson};`;

  return header + exportStatement;
}

/**
 * Temporary in-memory storage for articles (for development/testing)
 * This is a fallback when file system and GitHub API are not available
 */
let temporaryArticles = null;

export function setTemporaryArticles(articles) {
  temporaryArticles = [...articles];
  console.log(`Stored ${articles.length} articles in temporary memory`);
}

export function getTemporaryArticles() {
  return temporaryArticles ? [...temporaryArticles] : null;
}