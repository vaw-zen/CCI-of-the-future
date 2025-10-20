# 📧 Email Automation Workflow

## Overview
Automated email outreach system for building backlinks and establishing business partnerships. This workflow handles mass email campaigns to Tunisian directories, international business platforms, and strategic partners.

## 📁 Scripts in this Folder

### `email-automation.cjs`
**Primary email automation script for comprehensive outreach campaigns.**

- **Purpose**: Mass backlink outreach to Tunisia directories and international platforms
- **Targets**: 15+ Tunisia directories, 20+ international business platforms
- **Features**: 
  - Automated email sending with Gmail SMTP
  - Template-based content generation
  - Target audience segmentation
  - Email delivery tracking
  - Rate limiting to avoid spam detection

### `updated-email-automation.cjs`
**Enhanced version with improved targeting and generic contact emails.**

- **Purpose**: More reliable email outreach with generic contact addresses
- **Improvements**: 
  - Better target email validation
  - Multiple contact emails per platform
  - Enhanced template personalization
  - Improved success rate tracking
  - Business platform submission automation

## 🚀 Usage

### Environment Variables Required
```bash
GMAIL_USER=your-email@gmail.com
GMAIL_PASS=your-app-password
```

### Command Line Usage
```bash
# Run primary email automation
node email-automation.cjs

# Run enhanced automation for business platforms
node updated-email-automation.cjs business-platforms platformSubmission

# Run Tunisia directories campaign
node updated-email-automation.cjs tunisia-directories directorySubmission
```

### GitHub Actions Integration
These scripts are automatically triggered by:
- **Weekly Schedule**: Mondays at 9:00 AM Tunisia time
- **Manual Trigger**: Via GitHub Actions workflow_dispatch
- **Event-Based**: Push to main branch (validation only)

## 📊 Campaign Types

### 1. Tunisia Directories
- **Target**: Local Tunisian business directories
- **Frequency**: Weekly
- **Template**: Directory submission focused
- **Emails**: 15+ verified contacts

### 2. International Business Platforms
- **Target**: Global business listing platforms
- **Frequency**: Weekly rotation
- **Template**: Platform-specific submissions
- **Emails**: 20+ international contacts

### 3. Strategic Partnerships
- **Target**: Complementary service providers
- **Frequency**: Monthly
- **Template**: Partnership proposal focused
- **Emails**: Curated high-value contacts

## 🔧 Configuration

### Email Templates
Templates are embedded in the scripts and include:
- **Subject Line Variations**: Multiple options to avoid spam filters
- **Personalized Content**: Company-specific messaging
- **Call-to-Action**: Clear next steps for recipients
- **Professional Signature**: Contact information and credentials

### Target Management
- **Static Lists**: Verified email addresses in script files
- **Dynamic Updates**: Can be modified without code changes
- **Segmentation**: Grouped by platform type and region
- **Validation**: Email format and domain checking

## 📈 Reporting

### Output Files Generated
- `scripts/reports/campaign-report.md` - Weekly campaign summary
- `scripts/reports/email-delivery-log.txt` - Detailed delivery status
- GitHub Actions summary with metrics

### Key Metrics Tracked
- **Emails Sent**: Total count per campaign
- **Delivery Rate**: Successful vs failed deliveries
- **Campaign Type**: Directory vs platform vs partnership
- **Response Tracking**: Manual follow-up required

## 🛡️ Best Practices

### Rate Limiting
- **Delay Between Emails**: 2-3 seconds to avoid spam detection
- **Daily Limits**: Maximum 50 emails per day
- **Weekly Caps**: Distributed across campaign types

### Content Strategy
- **Personalization**: Company name and specific service mentions
- **Value Proposition**: Clear benefits for the recipient
- **Professional Tone**: Business-appropriate language
- **Compliance**: CAN-SPAM and GDPR considerations

### Error Handling
- **Failed Deliveries**: Logged with error reasons
- **Invalid Emails**: Automatically flagged for review
- **Rate Limiting**: Automatic backoff on provider limits
- **Retry Logic**: Failed emails retried with exponential backoff

## 🔍 Troubleshooting

### Common Issues
1. **Gmail Authentication Failures**
   - Verify app password is correct
   - Check 2FA is enabled on Gmail account
   - Ensure "Less secure app access" is not required

2. **High Bounce Rates**
   - Review and update email lists
   - Check email template spam score
   - Verify sender reputation

3. **Rate Limiting**
   - Reduce email frequency
   - Implement longer delays
   - Split campaigns across multiple days

### Debug Mode
Enable verbose logging by setting:
```bash
DEBUG=true node email-automation.cjs
```

## 🔄 Integration with Other Workflows

### SEO Automation
- Campaign success feeds into SEO reporting
- Backlink acquisition tracked in SEO metrics
- Content strategy informed by email responses

### Social Media
- Email outreach success shared on social
- Partnership announcements via social channels
- Cross-promotion opportunities identified

### Analytics
- Email metrics included in weekly analytics reports
- Campaign ROI tracking
- Performance optimization recommendations

## 📅 Maintenance Schedule

### Weekly Tasks
- Review campaign performance metrics
- Update bounce/invalid email lists
- Monitor spam folder rates

### Monthly Tasks
- Refresh target email lists
- Update email templates
- Review and optimize targeting criteria

### Quarterly Tasks
- Comprehensive performance analysis
- Strategy adjustment based on results
- Template A/B testing implementation

---

**Last Updated**: October 2025  
**Maintained By**: CCI Services Automation Team  
**Contact**: For issues or improvements, create a GitHub issue or contact the development team.