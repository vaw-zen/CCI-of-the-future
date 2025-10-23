# 🔧 Shared Workflow Utilities

## Overview
Common utilities, helper functions, and shared resources used across all workflow scripts. This folder contains reusable components that promote code consistency, reduce duplication, and maintain centralized configuration.

## 📁 Planned Utilities

> **Note**: This folder is currently empty but designed to house shared utilities as the automation system grows.

### Planned Utility Files

#### `config.cjs` (Planned)
**Centralized configuration management.**

```javascript
// Shared configuration for all workflows
module.exports = {
  email: {
    smtp: {
      service: 'gmail',
      rateLimitDelay: 2000, // 2 seconds between emails
      maxRetries: 3
    },
    templates: {
      signature: 'CCI Services Team\ncci.services.tn@gmail.com',
      companyInfo: 'CCI Services - Professional Cleaning & Maintenance'
    }
  },
  seo: {
    keywords: {
      csvPath: '../data/seo-keywords.csv',
      minPriority: 70,
      maxKeywordsPerContent: 5
    },
    google: {
      apiBaseUrl: 'https://www.googleapis.com/webmasters/v3',
      maxUrlsPerSubmission: 200
    }
  },
  social: {
    facebook: {
      apiVersion: 'v23.0',
      postingTime: '10:00',
      timezone: 'Africa/Tunis'
    }
  },
  general: {
    siteDomain: 'cciservices.online',
    businessName: 'CCI Services',
    targetMarket: 'Tunisia',
    languages: ['fr', 'ar']
  }
};
```

#### `logger.cjs` (Planned)
**Unified logging system for all workflows.**

```javascript
// Centralized logging with GitHub Actions compatibility
class WorkflowLogger {
  constructor(workflowName) {
    this.workflow = workflowName;
    this.isGitHubActions = process.env.GITHUB_ACTIONS === 'true';
  }

  info(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${this.workflow}] INFO: ${message}`;
    console.log(logMessage);
    
    if (this.isGitHubActions) {
      console.log(`::notice title=${this.workflow}::${message}`);
    }
  }

  error(message, error = null) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${this.workflow}] ERROR: ${message}`;
    console.error(logMessage);
    
    if (error) {
      console.error(error.stack);
    }
    
    if (this.isGitHubActions) {
      console.log(`::error title=${this.workflow}::${message}`);
    }
  }

  success(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${this.workflow}] SUCCESS: ${message}`;
    console.log(logMessage);
    
    if (this.isGitHubActions) {
      console.log(`::notice title=${this.workflow} Success::${message}`);
    }
  }
}

module.exports = WorkflowLogger;
```

#### `email-helpers.cjs` (Planned)
**Reusable email functions and templates.**

```javascript
// Shared email utilities
const nodemailer = require('nodemailer');
const WorkflowLogger = require('./logger.cjs');

class EmailHelpers {
  constructor() {
    this.logger = new WorkflowLogger('EmailHelpers');
    this.transporter = this.createTransporter();
  }

  createTransporter() {
    return nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    });
  }

  async sendTemplatedEmail(to, template, data) {
    // Send email with template substitution
  }

  validateEmailList(emails) {
    // Email validation logic
  }

  generateCampaignReport(results) {
    // Campaign reporting logic
  }
}

module.exports = EmailHelpers;
```

#### `file-helpers.cjs` (Planned)
**File system operations and CSV handling.**

```javascript
// Shared file system utilities
const fs = require('fs').promises;
const csv = require('csv-parser');
const { createObjectCsvWriter } = require('csv-writer');

class FileHelpers {
  static async readCSV(filePath) {
    // Read and parse CSV files
  }

  static async writeCSV(filePath, data, headers) {
    // Write data to CSV files
  }

  static async ensureDirectoryExists(dirPath) {
    // Create directories if they don't exist
  }

  static async generateReport(templatePath, data, outputPath) {
    // Generate markdown reports from templates
  }
}

module.exports = FileHelpers;
```

#### `api-helpers.cjs` (Planned)
**Shared API interaction utilities.**

```javascript
// Centralized API helpers
class APIHelpers {
  static async makeAuthenticatedRequest(url, options, credentials) {
    // Handle authenticated API requests with retry logic
  }

  static async googleSearchConsoleRequest(endpoint, data) {
    // GSC-specific API requests
  }

  static async facebookAPIRequest(endpoint, data) {
    // Facebook Graph API requests
  }

  static async geminiAPIRequest(prompt, options) {
    // Gemini AI API requests with prompt optimization
  }
}

module.exports = APIHelpers;
```

#### `validation.cjs` (Planned)
**Input validation and sanitization.**

```javascript
// Shared validation utilities
class ValidationHelpers {
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validateURL(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  static sanitizeInput(input) {
    // Remove potentially harmful characters
    return input.replace(/[<>\"']/g, '');
  }

  static validateEnvironmentVariables(required) {
    const missing = required.filter(env => !process.env[env]);
    if (missing.length > 0) {
      throw new Error(`Missing environment variables: ${missing.join(', ')}`);
    }
  }
}

module.exports = ValidationHelpers;
```

## 🎯 Design Principles

### Code Reusability
- **DRY Principle**: Don't Repeat Yourself across workflows
- **Modular Design**: Small, focused utility functions
- **Consistent Interfaces**: Standardized function signatures
- **Error Handling**: Centralized error management
- **Configuration**: Shared settings and constants

### Maintainability
- **Clear Documentation**: Comprehensive function documentation
- **Type Safety**: JSDoc annotations for better IDE support
- **Testing**: Unit tests for all utility functions
- **Versioning**: Semantic versioning for utility updates
- **Deprecation**: Graceful handling of deprecated functions

### Performance
- **Caching**: Intelligent caching of frequently used data
- **Resource Management**: Proper cleanup of resources
- **Async Operations**: Non-blocking operations where possible
- **Memory Efficiency**: Optimized data structures
- **Rate Limiting**: Built-in rate limiting for API calls

## 🔧 Integration Patterns

### Workflow Script Integration
```javascript
// Example usage in workflow scripts
const { EmailHelpers, FileHelpers, Logger } = require('../shared');
const config = require('../shared/config.cjs');

class EmailAutomation {
  constructor() {
    this.logger = new Logger('EmailAutomation');
    this.emailHelper = new EmailHelpers();
    this.config = config.email;
  }

  async run() {
    this.logger.info('Starting email automation');
    // Use shared utilities
  }
}
```

### Error Handling Pattern
```javascript
// Standardized error handling across all workflows
try {
  await WorkflowHelpers.executeWithRetry(async () => {
    // Workflow logic here
  });
} catch (error) {
  logger.error('Workflow failed', error);
  await NotificationHelpers.sendAlert(error);
  process.exit(1);
}
```

### Configuration Management
```javascript
// Environment-aware configuration loading
const config = require('../shared/config.cjs');
const environment = process.env.NODE_ENV || 'production';
const workflowConfig = config.getEnvironmentConfig(environment);
```

## 📊 Utility Categories

### 1. Core Infrastructure
- **Logging**: Standardized logging across all workflows
- **Configuration**: Centralized settings management
- **Error Handling**: Consistent error processing
- **Environment Detection**: GitHub Actions vs local execution

### 2. External Integrations
- **Email Services**: Gmail SMTP and template handling
- **Google APIs**: Search Console, Analytics integration
- **Social Media APIs**: Facebook, Instagram connectivity
- **AI Services**: Gemini AI prompt optimization

### 3. Data Processing
- **File Operations**: CSV, JSON, markdown processing
- **Data Validation**: Input sanitization and validation
- **Report Generation**: Automated report creation
- **Data Transformation**: Format conversion utilities

### 4. Business Logic
- **SEO Utilities**: Keyword processing, content optimization
- **Marketing Tools**: Campaign management, analytics
- **Customer Data**: Contact management, segmentation
- **Performance Metrics**: KPI calculation and tracking

## 🛡️ Security Considerations

### Credential Management
- **Environment Variables**: Secure credential storage
- **Key Rotation**: Automated credential refresh
- **Access Control**: Principle of least privilege
- **Audit Logging**: Security event tracking

### Data Protection
- **Input Sanitization**: XSS and injection prevention
- **Data Encryption**: Sensitive data protection
- **Privacy Compliance**: GDPR and local regulation adherence
- **Secure Communications**: HTTPS and encrypted connections

## 📅 Development Roadmap

### Phase 1: Foundation (Q4 2025)
- [ ] Basic configuration management
- [ ] Standardized logging system
- [ ] Core file system utilities
- [ ] Essential validation functions

### Phase 2: Integration (Q1 2026)
- [ ] API helper functions
- [ ] Email template system
- [ ] Report generation utilities
- [ ] Performance monitoring tools

### Phase 3: Advanced Features (Q2 2026)
- [ ] Caching mechanisms
- [ ] Advanced error recovery
- [ ] Performance optimization
- [ ] Comprehensive testing suite

### Phase 4: Enhancement (Q3 2026)
- [ ] AI-powered optimization
- [ ] Predictive analytics
- [ ] Advanced automation features
- [ ] Cross-platform compatibility

## 🔄 Benefits for Workflow Development

### Developer Experience
- **Faster Development**: Pre-built utilities reduce coding time
- **Consistency**: Standardized patterns across all workflows
- **Debugging**: Centralized logging simplifies troubleshooting
- **Testing**: Shared test utilities improve quality assurance

### System Reliability
- **Error Recovery**: Robust error handling and retry mechanisms
- **Monitoring**: Comprehensive logging and alerting
- **Performance**: Optimized shared functions
- **Scalability**: Modular design supports system growth

### Maintenance Efficiency
- **Single Source of Truth**: Centralized configuration and utilities
- **Easy Updates**: Changes propagate to all workflows
- **Documentation**: Comprehensive utility documentation
- **Version Control**: Tracked changes and backwards compatibility

---

**Status**: 📋 **PLANNED** - Ready for implementation as workflows mature  
**Priority**: High - Essential for maintainable automation system  
**Dependencies**: Node.js ecosystem, workflow script requirements

**Last Updated**: October 2025  
**Maintained By**: CCI Services Development Team  
**Contact**: For utility requests or architectural questions, create a GitHub issue or contact the development team.