
# GitHub Repository Secrets Configuration
# Go to: Settings → Secrets and variables → Actions → Repository secrets

## Required Secrets:

### GEMINI_API_KEY
# Your Gemini AI API key from Google AI Studio
# Value: AIzaSyBiEQ...

### GSC_CREDENTIALS  
# Google Search Console API credentials (JSON format)
# Value: Copy the entire content of your gsc-credentials.json file

### SITE_URL
# Your website URL for GSC tracking
# Value: https://cciservices.online

## Optional Secrets:

### SLACK_WEBHOOK_URL
# Slack webhook for notifications (optional)
# Value: https://hooks.slack.com/services/YOUR/WEBHOOK/URL

## GitHub Actions Workflow:
# The workflow runs automatically:
# - Every Monday at 9 AM UTC
# - Manual trigger for immediate content generation
# - Creates pull requests for review
# - Commits approved content automatically
