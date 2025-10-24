require('dotenv').config({ path: '../.env.local' });
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

/**
 * Comprehensive Video Reports from Google Search Console
 * Analyzes video indexing, performance, structured data, and issues
 */
class VideoGSCReports {
  constructor() {
    this.siteUrl = process.env.GSC_SITE_URL || 'https://cciservices.online';
    this.auth = null;
    this.searchconsole = null;
    this.indexing = null;
    this.videoData = {
      sitemap: null,
      performance: null,
      indexing: null,
      structuredData: null,
      issues: []
    };
  }

  async initialize() {
    try {
      const credentials = JSON.parse(process.env.GSC_CREDENTIALS);
      
      if (credentials.private_key && credentials.private_key.includes('\\n')) {
        credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
      }

      this.auth = new google.auth.GoogleAuth({
        credentials,
        scopes: [
          'https://www.googleapis.com/auth/webmasters.readonly',
          'https://www.googleapis.com/auth/indexing'
        ]
      });

      this.searchconsole = google.searchconsole({ version: 'v1', auth: this.auth });
      this.indexing = google.indexing({ version: 'v3', auth: this.auth });
      
      console.log('✅ Google Search Console API initialized');
    } catch (error) {
      console.error('❌ Error initializing GSC API:', error.message);
      throw error;
    }
  }

  /**
   * Analyze video sitemap status and issues
   */
  async analyzeVideoSitemap() {
    try {
      console.log('\n📺 ANALYZING VIDEO SITEMAP');
      console.log('='.repeat(50));

      const sitemaps = await this.searchconsole.sitemaps.list({
        siteUrl: this.siteUrl
      });

      const videoSitemap = sitemaps.data.sitemap?.find(s => 
        s.path.includes('video-sitemap.xml')
      );

      if (!videoSitemap) {
        console.log('❌ No video sitemap found');
        this.videoData.issues.push('No video sitemap submitted to GSC');
        return null;
      }

      console.log(`📋 Video Sitemap: ${videoSitemap.path}`);
      console.log(`📅 Last Submitted: ${videoSitemap.lastSubmitted || 'Never'}`);
      console.log(`📅 Last Downloaded: ${videoSitemap.lastDownloaded || 'Never'}`);
      console.log(`📈 Pending: ${videoSitemap.isPending ? 'Yes' : 'No'}`);

      const sitemapData = {
        path: videoSitemap.path,
        lastSubmitted: videoSitemap.lastSubmitted,
        lastDownloaded: videoSitemap.lastDownloaded,
        isPending: videoSitemap.isPending,
        contents: [],
        errors: Array.isArray(videoSitemap.errors) ? videoSitemap.errors : [],
        warnings: Array.isArray(videoSitemap.warnings) ? videoSitemap.warnings : []
      };

      if (videoSitemap.contents) {
        for (const content of videoSitemap.contents) {
          const contentData = {
            type: content.type,
            submitted: content.submitted,
            indexed: content.indexed,
            indexingRate: content.submitted ? 
              ((content.indexed / content.submitted) * 100).toFixed(1) : 0
          };
          
          sitemapData.contents.push(contentData);
          
          console.log(`\n   📄 Content Type: ${content.type}`);
          console.log(`   📤 Submitted: ${content.submitted}`);
          console.log(`   ✅ Indexed: ${content.indexed}`);
          console.log(`   📊 Indexing Rate: ${contentData.indexingRate}%`);
        }
      }

      if (sitemapData.errors && sitemapData.errors.length > 0) {
        console.log(`\n   ❌ ERRORS (${sitemapData.errors.length}):`);
        sitemapData.errors.forEach(error => {
          console.log(`   • ${error.message || error}`);
          this.videoData.issues.push(`Video sitemap error: ${error.message || error}`);
        });
      }

      if (sitemapData.warnings && sitemapData.warnings.length > 0) {
        console.log(`\n   ⚠️ WARNINGS (${sitemapData.warnings.length}):`);
        sitemapData.warnings.forEach(warning => {
          console.log(`   • ${warning.message || warning}`);
        });
      }

      this.videoData.sitemap = sitemapData;
      return sitemapData;

    } catch (error) {
      console.error('❌ Error analyzing video sitemap:', error.message);
      this.videoData.issues.push(`Video sitemap analysis error: ${error.message}`);
      return null;
    }
  }

  /**
   * Check if videos appear in any search results
   */
  async checkVideoSearchPresence() {
    try {
      const videoUrls = await this.getVideoUrlsFromSitemap();
      const searchPresence = [];
      
      console.log('🔍 Checking if videos appear in any search results...');
      
      for (const url of videoUrls) {
        try {
          // Check if this URL has any search performance data at all
          const urlCheck = await this.searchconsole.searchanalytics.query({
            siteUrl: this.siteUrl,
            requestBody: {
              startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Last 90 days
              endDate: new Date().toISOString().split('T')[0],
              dimensions: ['page'],
              dimensionFilterGroups: [{
                filters: [{
                  dimension: 'page',
                  expression: url,
                  operator: 'equals'
                }]
              }],
              rowLimit: 1
            }
          });
          
          const hasSearchData = urlCheck.data.rows && urlCheck.data.rows.length > 0;
          searchPresence.push({
            url: url,
            hasSearchData: hasSearchData,
            impressions: hasSearchData ? urlCheck.data.rows[0].impressions : 0,
            clicks: hasSearchData ? urlCheck.data.rows[0].clicks : 0
          });
          
          console.log(`${hasSearchData ? '✅' : '❌'} ${url} - ${hasSearchData ? `${urlCheck.data.rows[0].impressions || 0} impressions` : 'No search presence'}`);
          
        } catch (error) {
          console.log(`⚠️ Error checking ${url}: ${error.message}`);
          searchPresence.push({
            url: url,
            error: error.message
          });
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      return searchPresence;
    } catch (error) {
      console.error('Error checking video search presence:', error.message);
      return [];
    }
  }

  /**
   * Get video search performance data
   */
  async analyzeVideoPerformance() {
    try {
      console.log('\n📊 ANALYZING VIDEO SEARCH PERFORMANCE');
      console.log('='.repeat(50));

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 28); // Last 28 days

      // First, get ALL pages to see what's available
      console.log('🔍 Searching for video pages in GSC performance data...');
      
      const allPages = await this.searchconsole.searchanalytics.query({
        siteUrl: this.siteUrl,
        requestBody: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          dimensions: ['page'],
          rowLimit: 100
        }
      });

      console.log(`📊 Total pages found in GSC: ${allPages.data.rows?.length || 0}`);
      
      // Show top performing pages for context
      if (allPages.data.rows && allPages.data.rows.length > 0) {
        console.log('\n📋 Top 10 pages currently in search results:');
        allPages.data.rows.slice(0, 10).forEach((page, i) => {
          console.log(`   ${i + 1}. ${page.keys[0]} (${page.impressions || 0} impressions)`);
        });
      }
      
      // Filter for video-related pages (try multiple patterns)
      const videoPages = allPages.data.rows?.filter(row => {
        const url = row.keys[0];
        return url.includes('/reels/') || 
               url.includes('/video') || 
               url.includes('/reel') ||
               url.match(/\/\d+$/) // URLs ending with numbers (video IDs)
      }) || [];

      console.log(`\n🎬 Video-related pages found: ${videoPages.length}`);
      if (videoPages.length > 0) {
        console.log('📋 Video pages detected:');
        videoPages.forEach((page, i) => {
          console.log(`   ${i + 1}. ${page.keys[0]} (${page.impressions || 0} impressions)`);
        });
      }

      // Now get specific performance data for video URLs
      const videoPerformance = await this.searchconsole.searchanalytics.query({
        siteUrl: this.siteUrl,
        requestBody: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          dimensions: ['page'],
          dimensionFilterGroups: [{
            filters: [{
              dimension: 'page',
              expression: '/reels/',
              operator: 'contains'
            }]
          }],
          rowLimit: 25
        }
      });

      const performanceData = {
        totalVideoPages: videoPerformance.data.rows?.length || 0,
        pages: videoPerformance.data.rows || [],
        totalClicks: 0,
        totalImpressions: 0,
        averageCTR: 0,
        averagePosition: 0
      };

      if (performanceData.pages.length > 0) {
        performanceData.totalClicks = performanceData.pages.reduce((sum, row) => sum + (row.clicks || 0), 0);
        performanceData.totalImpressions = performanceData.pages.reduce((sum, row) => sum + (row.impressions || 0), 0);
        performanceData.averageCTR = performanceData.totalImpressions > 0 ? 
          (performanceData.totalClicks / performanceData.totalImpressions * 100).toFixed(2) : 0;
        performanceData.averagePosition = performanceData.pages.reduce((sum, row) => sum + (row.position || 0), 0) / performanceData.pages.length;

        console.log(`📈 Video Pages in Search: ${performanceData.totalVideoPages}`);
        console.log(`👆 Total Clicks: ${performanceData.totalClicks}`);
        console.log(`👀 Total Impressions: ${performanceData.totalImpressions}`);
        console.log(`📊 Average CTR: ${performanceData.averageCTR}%`);
        console.log(`🎯 Average Position: ${performanceData.averagePosition.toFixed(1)}`);

        console.log('\n🔝 TOP PERFORMING VIDEO PAGES:');
        performanceData.pages.slice(0, 10).forEach((page, index) => {
          console.log(`${index + 1}. ${page.keys[0]}`);
          console.log(`   Clicks: ${page.clicks || 0}, Impressions: ${page.impressions || 0}, CTR: ${((page.ctr || 0) * 100).toFixed(2)}%`);
        });
      } else {
        console.log('⚠️ No /reels/ pages found in search performance');
        
        // Try checking specific video URLs we know exist
        const videoUrls = await this.getVideoUrlsFromSitemap();
        console.log(`\n🔍 Checking performance for specific video URLs...`);
        
        if (videoUrls.length > 0) {
          for (const url of videoUrls.slice(0, 3)) { // Check first 3 URLs
            try {
              const specificVideoPerf = await this.searchconsole.searchanalytics.query({
                siteUrl: this.siteUrl,
                requestBody: {
                  startDate: startDate.toISOString().split('T')[0],
                  endDate: endDate.toISOString().split('T')[0],
                  dimensions: ['query'],
                  dimensionFilterGroups: [{
                    filters: [{
                      dimension: 'page',
                      expression: url,
                      operator: 'equals'
                    }]
                  }],
                  rowLimit: 5
                }
              });
              
              if (specificVideoPerf.data.rows && specificVideoPerf.data.rows.length > 0) {
                console.log(`📊 Found search data for ${url}:`);
                specificVideoPerf.data.rows.forEach(row => {
                  console.log(`   Query: "${row.keys[0]}" - ${row.impressions || 0} impressions`);
                });
                performanceData.specificVideoData = performanceData.specificVideoData || [];
                performanceData.specificVideoData.push({
                  url: url,
                  queries: specificVideoPerf.data.rows
                });
              } else {
                console.log(`❌ No search data found for ${url}`);
              }
            } catch (error) {
              console.log(`⚠️ Error checking ${url}: ${error.message}`);
            }
          }
        }
        
        if (!performanceData.specificVideoData || performanceData.specificVideoData.length === 0) {
          this.videoData.issues.push('No video pages appearing in search results - videos may not be indexed yet');
        }
      }

      // Try to get video-specific queries
      try {
        const videoQueries = await this.searchconsole.searchanalytics.query({
          siteUrl: this.siteUrl,
          requestBody: {
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            dimensions: ['query'],
            dimensionFilterGroups: [{
              filters: [{
                dimension: 'query',
                expression: 'video|reel|nettoyage|cleaning',
                operator: 'contains'
              }]
            }],
            rowLimit: 10
          }
        });

        if (videoQueries.data.rows && videoQueries.data.rows.length > 0) {
          console.log('\n🔍 TOP VIDEO-RELATED SEARCH QUERIES:');
          videoQueries.data.rows.forEach((query, index) => {
            console.log(`${index + 1}. "${query.keys[0]}" - ${query.impressions || 0} impressions`);
          });
          performanceData.topQueries = videoQueries.data.rows;
        }
      } catch (error) {
        console.log('⚠️ Could not fetch video-related queries');
      }

      this.videoData.performance = performanceData;
      return performanceData;

    } catch (error) {
      console.error('❌ Error analyzing video performance:', error.message);
      this.videoData.issues.push(`Error analyzing video performance: ${error.message}`);
      return null;
    }
  }

  /**
   * Check if video URLs are accessible
   */
  async checkVideoAccessibility(url) {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return {
        accessible: response.ok,
        status: response.status,
        statusText: response.statusText
      };
    } catch (error) {
      return {
        accessible: false,
        error: error.message
      };
    }
  }

  /**
   * Check video URL indexing status
   */
  async analyzeVideoIndexing() {
    try {
      console.log('\n🔍 ANALYZING VIDEO URL INDEXING STATUS');
      console.log('='.repeat(50));

      // Get video URLs from sitemap
      const videoUrls = await this.getVideoUrlsFromSitemap();
      
      if (videoUrls.length === 0) {
        console.log('❌ No video URLs found to check');
        this.videoData.issues.push('No video URLs found in sitemap');
        return null;
      }

      const indexingData = {
        totalVideos: videoUrls.length,
        checkedUrls: [],
        indexedCount: 0,
        notIndexedCount: 0,
        errorCount: 0
      };

      console.log(`🎬 Checking indexing status for ${videoUrls.length} video URLs...`);

      for (let i = 0; i < Math.min(videoUrls.length, 10); i++) { // Limit to 10 checks
        const url = videoUrls[i];
        try {
          console.log(`\n🔍 Checking: ${url}`);
          
          // First check if URL is accessible
          const accessibility = await this.checkVideoAccessibility(url);
          console.log(`   🌐 Accessible: ${accessibility.accessible ? 'Yes' : 'No'} (${accessibility.status || accessibility.error})`);
          
          // Try URL inspection first
          let urlData = { 
            url: url,
            accessible: accessibility.accessible,
            httpStatus: accessibility.status,
            httpError: accessibility.error
          };
          
          try {
            const inspection = await this.searchconsole.urlInspection.index.inspect({
              requestBody: {
                inspectionUrl: url,
                siteUrl: this.siteUrl
              }
            });

            const result = inspection.data.inspectionResult;
            urlData = {
              url: url,
              indexStatus: result?.indexStatusResult?.verdict || 'Unknown',
              crawlStatus: result?.indexStatusResult?.coverageState || 'Unknown',
              lastCrawled: result?.indexStatusResult?.lastCrawlTime || 'Never',
              canCrawl: result?.indexStatusResult?.robotsTxtState || 'Unknown',
              indexingState: result?.indexStatusResult?.indexingState || 'Unknown',
              pageFetchState: result?.indexStatusResult?.pageFetchState || 'Unknown'
            };

            console.log(`   📊 Index Status: ${urlData.indexStatus}`);
            console.log(`   🤖 Coverage: ${urlData.crawlStatus}`);
            console.log(`   📅 Last Crawled: ${urlData.lastCrawled}`);

            if (urlData.indexStatus === 'PASS' || urlData.crawlStatus === 'VALID') {
              indexingData.indexedCount++;
            } else {
              indexingData.notIndexedCount++;
            }

          } catch (inspectionError) {
            // If URL inspection fails, try indexing API check
            console.log(`   ⚠️ URL inspection failed, trying indexing status...`);
            
            try {
              const indexingStatus = await this.indexing.urlNotifications.getMetadata({
                url: url
              });

              urlData.indexingApiStatus = indexingStatus.data.latestUpdate?.type || 'Not submitted';
              urlData.lastNotified = indexingStatus.data.latestUpdate?.notifyTime || 'Never';
              
              console.log(`   📤 Indexing API: ${urlData.indexingApiStatus}`);
              console.log(`   📅 Last Notified: ${urlData.lastNotified}`);
              
              if (urlData.indexingApiStatus === 'URL_UPDATED') {
                indexingData.indexedCount++;
              } else {
                indexingData.notIndexedCount++;
              }
              
            } catch (indexingError) {
              console.log(`   ❌ Both inspection methods failed: ${inspectionError.message}`);
              urlData.error = `Inspection: ${inspectionError.message}, Indexing: ${indexingError.message}`;
              indexingData.errorCount++;
            }
          }

          indexingData.checkedUrls.push(urlData);

        } catch (error) {
          console.log(`   ❌ Error checking ${url}: ${error.message}`);
          indexingData.errorCount++;
          indexingData.checkedUrls.push({
            url: url,
            error: error.message
          });
        }

        // Small delay to avoid rate limiting
        if (i < videoUrls.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      console.log(`\n📊 INDEXING SUMMARY:`);
      console.log(`✅ Indexed: ${indexingData.indexedCount}`);
      console.log(`❌ Not Indexed: ${indexingData.notIndexedCount}`);
      console.log(`⚠️ Errors: ${indexingData.errorCount}`);

      this.videoData.indexing = indexingData;
      return indexingData;

    } catch (error) {
      console.error('❌ Error analyzing video indexing:', error.message);
      this.videoData.issues.push(`Error analyzing video indexing: ${error.message}`);
      return null;
    }
  }

  /**
   * Get video URLs from sitemap
   */
  async getVideoUrlsFromSitemap() {
    try {
      const response = await fetch(`${this.siteUrl}/video-sitemap.xml`);
      if (!response.ok) return [];

      const sitemapText = await response.text();
      const urlMatches = sitemapText.match(/<loc>(.*?)<\/loc>/g);
      
      if (!urlMatches) return [];

      return urlMatches
        .map(match => match.replace('<loc>', '').replace('</loc>', '').trim())
        .filter(url => url.includes('/reels/'));
    } catch (error) {
      console.error('Error fetching video URLs from sitemap:', error.message);
      return [];
    }
  }

  /**
   * Generate comprehensive video report
   */
  generateVideoReport() {
    console.log('\n📊 COMPREHENSIVE VIDEO REPORT');
    console.log('='.repeat(50));

    const report = {
      timestamp: new Date().toISOString(),
      site: this.siteUrl,
      videoData: this.videoData,
      summary: {
        videoSitemapSubmitted: !!this.videoData.sitemap,
        videosInSitemap: this.videoData.sitemap?.contents?.[0]?.submitted || 0,
        videosIndexed: this.videoData.sitemap?.contents?.[0]?.indexed || 0,
        videoIndexingRate: this.videoData.sitemap?.contents?.[0] ? 
          ((this.videoData.sitemap.contents[0].indexed / this.videoData.sitemap.contents[0].submitted) * 100).toFixed(1) : 0,
        videosPagesInSearch: this.videoData.performance?.totalVideoPages || 0,
        totalVideoClicks: this.videoData.performance?.totalClicks || 0,
        totalVideoImpressions: this.videoData.performance?.totalImpressions || 0,
        averageVideoCTR: this.videoData.performance?.averageCTR || 0
      },
      recommendations: this.generateVideoRecommendations()
    };

    // Display summary
      console.log(`\n🎯 VIDEO SEO SUMMARY:`);
      console.log(`📺 Videos in sitemap: ${report.summary.videosInSitemap}`);
      console.log(`✅ Videos indexed: ${report.summary.videosIndexed}`);
      console.log(`📊 Indexing rate: ${report.summary.videoIndexingRate}%`);
      console.log(`🔍 Videos in search results: ${report.summary.videosPagesInSearch}`);
      console.log(`👆 Total video clicks: ${report.summary.totalVideoClicks}`);
      console.log(`👀 Total video impressions: ${report.summary.totalVideoImpressions}`);
      console.log(`📈 Average video CTR: ${report.summary.averageVideoCTR}%`);

    if (this.videoData.issues.length > 0) {
      console.log('\n🚨 ISSUES FOUND:');
      this.videoData.issues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue}`);
      });
    }

    console.log('\n💡 RECOMMENDATIONS:');
    report.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec.title}`);
      console.log(`   Action: ${rec.action}`);
      console.log(`   Priority: ${rec.priority}`);
    });

    return report;
  }

  /**
   * Generate video-specific recommendations
   */
  generateVideoRecommendations() {
    const recommendations = [];

    // Check indexing rate
    const indexingRate = this.videoData.sitemap?.contents?.[0] ? 
      (this.videoData.sitemap.contents[0].indexed / this.videoData.sitemap.contents[0].submitted) * 100 : 0;

    if (indexingRate < 50) {
      recommendations.push({
        title: 'Low Video Indexing Rate',
        action: 'Submit individual video URLs directly to GSC using indexing API',
        priority: 'High',
        impact: 'Improves video search visibility'
      });
    }

    // Check search presence
    if ((this.videoData.performance?.totalVideoPages || 0) === 0) {
      recommendations.push({
        title: 'No Videos in Search Results',
        action: 'Optimize video structured data and improve video content quality',
        priority: 'Critical',
        impact: 'Enable video search visibility'
      });
    }

    // Check video sitemap errors
    if (this.videoData.sitemap?.errors?.length > 0) {
      recommendations.push({
        title: 'Video Sitemap Errors',
        action: 'Fix video sitemap XML structure and resubmit',
        priority: 'High',
        impact: 'Ensures proper video indexing'
      });
    }

    // Check performance
    if ((this.videoData.performance?.totalClicks || 0) === 0 && (this.videoData.performance?.totalImpressions || 0) > 0) {
      recommendations.push({
        title: 'Low Video CTR',
        action: 'Optimize video titles, descriptions, and thumbnails',
        priority: 'Medium',
        impact: 'Increases click-through rates from search'
      });
    }

    return recommendations;
  }

  /**
   * Save video report
   */
  async saveVideoReport(report) {
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const reportPath = path.join(__dirname, '../reports', `video-gsc-report-${timestamp}.json`);
      const mdReportPath = path.join(__dirname, '../reports', `video-gsc-report-${timestamp}.md`);
      
      // Ensure reports directory exists
      const reportsDir = path.join(__dirname, '../reports');
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }

      // Save JSON report
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

      // Save Markdown report
      const mdContent = this.generateMarkdownVideoReport(report);
      fs.writeFileSync(mdReportPath, mdContent);

      console.log(`\n📋 Video reports saved:`);
      console.log(`   JSON: ${reportPath}`);
      console.log(`   Markdown: ${mdReportPath}`);
      
      return { jsonPath: reportPath, mdPath: mdReportPath };
    } catch (error) {
      console.error('❌ Error saving video report:', error.message);
    }
  }

  /**
   * Generate Markdown video report
   */
  generateMarkdownVideoReport(report) {
    return `# Video GSC Report
Generated: ${new Date().toLocaleString()}
Site: ${this.siteUrl}

## 📊 VIDEO SUMMARY
- **Videos in Sitemap:** ${report.summary.videosInSitemap}
- **Videos Indexed:** ${report.summary.videosIndexed}
- **Indexing Rate:** ${report.summary.videoIndexingRate}%
- **Videos in Search:** ${report.summary.videosPagesInSearch}
- **Total Video Clicks:** ${report.summary.totalVideoClicks}
- **Total Video Impressions:** ${report.summary.totalVideoImpressions}
- **Average Video CTR:** ${report.summary.averageVideoCTR}%

## 📺 VIDEO SITEMAP STATUS
${report.videoData.sitemap ? `
- **Path:** ${report.videoData.sitemap.path}
- **Last Submitted:** ${report.videoData.sitemap.lastSubmitted}
- **Last Downloaded:** ${report.videoData.sitemap.lastDownloaded}
- **Errors:** ${report.videoData.sitemap.errors.length}
- **Warnings:** ${report.videoData.sitemap.warnings.length}
` : 'No video sitemap found'}

## 🔍 TOP VIDEO PAGES
${report.videoData.performance?.pages ? report.videoData.performance.pages.slice(0, 5).map((page, i) => `
${i + 1}. **${page.keys[0]}**
   - Clicks: ${page.clicks || 0}
   - Impressions: ${page.impressions || 0}
   - CTR: ${((page.ctr || 0) * 100).toFixed(2)}%
`).join('') : 'No video performance data available'}

## 🚨 ISSUES FOUND
${report.videoData.issues.map((issue, i) => `${i + 1}. ${issue}`).join('\n')}

## 💡 RECOMMENDATIONS
${report.recommendations.map((rec, i) => `
### ${i + 1}. ${rec.title} (${rec.priority} Priority)
**Action:** ${rec.action}
**Impact:** ${rec.impact}
`).join('')}

---
*Report generated by Video GSC Analysis Tool*`;
  }

  /**
   * Run complete video analysis
   */
  async runVideoAnalysis() {
    try {
      console.log('🚀 STARTING COMPREHENSIVE VIDEO GSC ANALYSIS');
      console.log('='.repeat(60));

      await this.initialize();

      await this.analyzeVideoSitemap();
      
      // Check if videos have any search presence first
      const searchPresence = await this.checkVideoSearchPresence();
      this.videoData.searchPresence = searchPresence;
      
      await this.analyzeVideoPerformance();
      await this.analyzeVideoIndexing();

      const report = this.generateVideoReport();
      await this.saveVideoReport(report);

      console.log('\n✅ Video GSC analysis complete!');
      
    } catch (error) {
      console.error('❌ Video analysis failed:', error.message);
    }
  }
}

// Run the video analysis
async function main() {
  const analyzer = new VideoGSCReports();
  await analyzer.runVideoAnalysis();
}

main().catch(console.error);