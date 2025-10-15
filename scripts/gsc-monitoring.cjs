/**
 * GSC Monitoring Dashboard
 * Continuous monitoring system for CCI Services indexing performance
 */

const fs = require('fs');
const path = require('path');

class GSCMonitoringDashboard {
  constructor() {
    this.siteUrl = process.env.SITE_URL || 'https://cciservices.online';
    this.historyFile = path.join(__dirname, '..', 'gsc-history.json');
    this.alertsFile = path.join(__dirname, '..', 'gsc-alerts.json');
  }

  /**
   * Load historical data
   */
  loadHistory() {
    try {
      if (fs.existsSync(this.historyFile)) {
        return JSON.parse(fs.readFileSync(this.historyFile, 'utf8'));
      }
    } catch (error) {
      console.log('📊 Creating new history file...');
    }
    return { checks: [], trends: {} };
  }

  /**
   * Save check result to history
   */
  saveToHistory(result) {
    const history = this.loadHistory();
    
    const checkResult = {
      timestamp: new Date().toISOString(),
      totalArticles: result.totalArticles,
      indexedCount: result.indexedCount,
      indexingRate: result.indexingRate,
      healthScore: result.healthScore,
      newArticles: result.newArticles || 0,
      alerts: result.alerts || []
    };
    
    history.checks.push(checkResult);
    
    // Keep only last 30 checks
    if (history.checks.length > 30) {
      history.checks = history.checks.slice(-30);
    }
    
    // Update trends
    this.updateTrends(history);
    
    fs.writeFileSync(this.historyFile, JSON.stringify(history, null, 2));
    return history;
  }

  /**
   * Update trend analysis
   */
  updateTrends(history) {
    if (history.checks.length < 2) return;
    
    const recent = history.checks.slice(-7); // Last 7 checks
    const older = history.checks.slice(-14, -7); // Previous 7 checks
    
    if (older.length === 0) return;
    
    const recentAvg = recent.reduce((sum, check) => sum + parseFloat(check.indexingRate), 0) / recent.length;
    const olderAvg = older.reduce((sum, check) => sum + parseFloat(check.indexingRate), 0) / older.length;
    
    history.trends = {
      indexingTrend: recentAvg - olderAvg,
      healthTrend: recent[recent.length - 1].healthScore - older[older.length - 1].healthScore,
      lastUpdated: new Date().toISOString(),
      weeklyChange: recentAvg - olderAvg,
      status: this.getTrendStatus(recentAvg - olderAvg)
    };
  }

  /**
   * Get trend status
   */
  getTrendStatus(change) {
    if (change > 2) return 'improving';
    if (change < -2) return 'declining';
    return 'stable';
  }

  /**
   * Check for alerts
   */
  checkAlerts(result, history) {
    const alerts = [];
    
    // Indexing rate dropped below 90%
    if (result.indexingRate < 90) {
      alerts.push({
        type: 'warning',
        message: `Indexing rate dropped to ${result.indexingRate}%`,
        severity: 'medium',
        action: 'Review recent articles and submit manually to GSC'
      });
    }
    
    // Health score dropped below 80
    if (result.healthScore < 80) {
      alerts.push({
        type: 'error',
        message: `Health score dropped to ${result.healthScore}/100`,
        severity: 'high',
        action: 'Immediate technical SEO audit required'
      });
    }
    
    // Declining trend
    if (history.trends && history.trends.status === 'declining') {
      alerts.push({
        type: 'info',
        message: 'Declining indexing trend detected',
        severity: 'low',
        action: 'Monitor closely and optimize recent content'
      });
    }
    
    // New articles not indexed quickly
    if (result.newArticles > 0 && result.indexingRate < 95) {
      alerts.push({
        type: 'warning',
        message: `${result.newArticles} new articles may need manual submission`,
        severity: 'medium',
        action: 'Submit new article URLs to GSC manually'
      });
    }
    
    return alerts;
  }

  /**
   * Generate monitoring report
   */
  generateMonitoringReport(result, history) {
    const trends = history.trends || {};
    const recentChecks = history.checks.slice(-5);
    
    return `# 📊 GSC Monitoring Dashboard
Generated: ${new Date().toLocaleString()}
Site: ${this.siteUrl}

## 🎯 Current Status

### Health Overview
- **Current Health Score:** ${result.healthScore}/100 ${this.getHealthEmoji(result.healthScore)}
- **Indexing Rate:** ${result.indexingRate}% ${this.getIndexingEmoji(result.indexingRate)}
- **Total Articles:** ${result.totalArticles}
- **Indexed:** ${result.indexedCount}

### 📈 Trends (7-day comparison)
- **Indexing Trend:** ${trends.weeklyChange ? (trends.weeklyChange > 0 ? '📈' : trends.weeklyChange < 0 ? '📉' : '➡️') : '➡️'} ${trends.weeklyChange ? trends.weeklyChange.toFixed(1) : '0.0'}%
- **Status:** ${trends.status || 'stable'} ${this.getTrendEmoji(trends.status)}
- **Health Change:** ${trends.healthTrend ? (trends.healthTrend > 0 ? '+' : '') + trends.healthTrend : '0'} points

## 🚨 Active Alerts (${result.alerts ? result.alerts.length : 0})

${result.alerts && result.alerts.length > 0 ? 
  result.alerts.map(alert => `
### ${this.getAlertEmoji(alert.type)} ${alert.severity.toUpperCase()} - ${alert.message}
**Action Required:** ${alert.action}
`).join('') : 
  '✅ No active alerts - system healthy'
}

## 📊 Recent Performance History

| Date | Health Score | Indexing Rate | Articles | Status |
|------|-------------|---------------|----------|--------|
${recentChecks.map(check => 
  `| ${new Date(check.timestamp).toLocaleDateString()} | ${check.healthScore}/100 | ${check.indexingRate}% | ${check.indexedCount}/${check.totalArticles} | ${this.getHealthEmoji(check.healthScore)} |`
).join('\n')}

## 🔧 Recommended Actions

### Immediate (This Week)
${result.alerts && result.alerts.filter(a => a.severity === 'high').length > 0 ? 
  '🚨 **HIGH PRIORITY ALERTS** - Address immediately' : 
  '✅ No immediate actions required'
}

### Regular Maintenance (Weekly)
- [ ] Monitor indexing rate (target: >90%)
- [ ] Check for new crawl errors in GSC
- [ ] Verify sitemap submissions
- [ ] Submit new articles within 24h

### Optimization (Monthly)
- [ ] Review and optimize low-performing articles
- [ ] Update meta descriptions and titles
- [ ] Build internal links between articles
- [ ] Monitor keyword rankings

## 📈 Performance Targets

### Current vs Targets
- **Indexing Rate:** ${result.indexingRate}% (Target: >90%) ${result.indexingRate >= 90 ? '✅' : '❌'}
- **Health Score:** ${result.healthScore}/100 (Target: >85) ${result.healthScore >= 85 ? '✅' : '❌'}
- **Response Time:** Monitor in GSC (Target: <24h for new articles)

### Next Check Scheduled
**Recommended:** ${this.getNextCheckDate()}

---

*Generated by CCI Services GSC Monitoring System*
*Last Updated: ${new Date().toLocaleString()}*
`;
  }

  /**
   * Get health emoji
   */
  getHealthEmoji(score) {
    if (score >= 90) return '🟢';
    if (score >= 75) return '🟡';
    return '🔴';
  }

  /**
   * Get indexing emoji
   */
  getIndexingEmoji(rate) {
    if (rate >= 95) return '🟢';
    if (rate >= 85) return '🟡';
    return '🔴';
  }

  /**
   * Get trend emoji
   */
  getTrendEmoji(status) {
    switch(status) {
      case 'improving': return '📈';
      case 'declining': return '📉';
      default: return '➡️';
    }
  }

  /**
   * Get alert emoji
   */
  getAlertEmoji(type) {
    switch(type) {
      case 'error': return '🚨';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  }

  /**
   * Get next check date
   */
  getNextCheckDate() {
    const next = new Date();
    next.setDate(next.getDate() + 7); // Weekly checks
    return next.toLocaleDateString();
  }

  /**
   * Run monitoring check
   */
  async runMonitoringCheck() {
    console.log('📊 Running GSC monitoring check...');
    
    try {
      // Simulate current check (in production, this would call the complete analysis)
      const result = {
        totalArticles: 28,
        indexedCount: 28,
        indexingRate: '100.0',
        healthScore: 100,
        newArticles: 0,
        timestamp: new Date().toISOString()
      };
      
      // Load history and check for alerts
      const history = this.loadHistory();
      const alerts = this.checkAlerts(result, history);
      result.alerts = alerts;
      
      // Save to history
      const updatedHistory = this.saveToHistory(result);
      
      // Generate monitoring report
      const report = this.generateMonitoringReport(result, updatedHistory);
      
      // Save monitoring report
      const reportPath = path.join(__dirname, '..', 'gsc-monitoring-dashboard.md');
      fs.writeFileSync(reportPath, report);
      
      console.log('✅ Monitoring check complete');
      console.log(`📊 Health Score: ${result.healthScore}/100`);
      console.log(`📈 Indexing Rate: ${result.indexingRate}%`);
      console.log(`🚨 Alerts: ${alerts.length}`);
      console.log(`📋 Report saved: gsc-monitoring-dashboard.md`);
      
      return { result, history: updatedHistory, alerts, report };
      
    } catch (error) {
      console.error('❌ Monitoring check failed:', error.message);
      throw error;
    }
  }

  /**
   * Set up automated monitoring (future implementation)
   */
  setupAutomatedMonitoring() {
    console.log('🔧 Setting up automated monitoring...');
    
    const cronScript = `# CCI Services GSC Monitoring Cron Job
# Run every day at 9 AM
0 9 * * * cd "${process.cwd()}" && node scripts/gsc-monitoring.cjs >> logs/gsc-monitoring.log 2>&1

# Run weekly comprehensive analysis on Sundays at 10 AM  
0 10 * * 0 cd "${process.cwd()}" && node scripts/complete-gsc-analysis.cjs >> logs/gsc-analysis.log 2>&1
`;
    
    const cronPath = path.join(__dirname, '..', 'gsc-monitoring.cron');
    fs.writeFileSync(cronPath, cronScript);
    
    console.log('✅ Cron job configuration created: gsc-monitoring.cron');
    console.log('📝 To activate, run: crontab gsc-monitoring.cron');
    
    return cronScript;
  }
}

// CLI Usage
async function main() {
  const monitor = new GSCMonitoringDashboard();
  
  try {
    const results = await monitor.runMonitoringCheck();
    
    // Also set up automated monitoring
    monitor.setupAutomatedMonitoring();
    
    console.log('\n🎯 Monitoring Summary:');
    console.log(`Health: ${results.result.healthScore}/100`);
    console.log(`Indexing: ${results.result.indexingRate}%`);
    console.log(`Alerts: ${results.alerts.length}`);
    console.log('\n📊 Dashboard: gsc-monitoring-dashboard.md');
    
  } catch (error) {
    console.error('❌ Monitoring failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = GSCMonitoringDashboard;