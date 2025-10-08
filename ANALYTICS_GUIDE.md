# Enhanced Google Analytics Implementation for CCI Services

## Overview
This enhanced Google Analytics implementation provides comprehensive tracking for your cleaning services website, ensuring you capture detailed user behavior data across all pages and interactions.

## Features Implemented

### 1. **Enhanced Core Tracking** (`layout.js`)
- ✅ Automatic page view tracking for all routes
- ✅ Single Page Application (SPA) navigation tracking
- ✅ Scroll depth monitoring (25%, 50%, 75%, 100%)
- ✅ Time on page tracking
- ✅ External link click tracking
- ✅ Performance metrics (page load time)
- ✅ Device and browser information tracking
- ✅ Cross-domain tracking support
- ✅ Enhanced cookie settings for privacy compliance

### 2. **Custom Analytics Hook** (`src/hooks/useAnalytics.js`)
Provides easy-to-use functions for manual event tracking:
```javascript
const { trackEvent, trackFormSubmission, trackServiceView } = useAnalytics();

// Track custom events
trackEvent('button_click', { button_name: 'Get Quote' });

// Track service page visits
trackServiceView('marbre', 'restoration');

// Track form submissions
trackFormSubmission('contact_form', { service_type: 'tapis' });
```

### 3. **Business-Specific Tracking** (`src/utils/analytics.js`)
Specialized functions for your cleaning services business:
```javascript
import { trackServiceInteraction, trackQuoteProgress, trackPhoneReveal } from '@/utils/analytics';

// Track service interactions
trackServiceInteraction('marbre', 'service_page_view');

// Track quote form progress
trackQuoteProgress('contact_info', 'tapis', { location: 'Tunis' });

// Track phone number clicks
trackPhoneReveal('header');
```

### 4. **Analytics-Aware Components** (`src/components/AnalyticsComponents.js`)
Pre-built React components with built-in analytics:
```javascript
import { AnalyticsButton, AnalyticsPhoneLink, AnalyticsServiceCard } from '@/components/AnalyticsComponents';

<AnalyticsButton 
  eventName="quote_request"
  eventLabel="marbre_service"
>
  Demander un Devis
</AnalyticsButton>

<AnalyticsPhoneLink 
  phoneNumber="+216-98-557-766"
  location="header"
/>

<AnalyticsServiceCard 
  serviceType="marbre"
  serviceName="Polissage Marbre"
>
  Service content...
</AnalyticsServiceCard>
```

## Service Types Tracked
- `marbre` - Marble restoration and polishing
- `tapis` - Carpet cleaning
- `moquette` - Carpet/rug cleaning
- `salon` - Furniture/salon cleaning
- `tapisserie` - Upholstery services
- `travaux_fin_chantier` - Post-construction cleaning
- `conseil` - Consultation services

## Key Events Tracked

### **Conversion Events**
- Form submissions (contact, quote requests)
- Phone number clicks
- Email clicks
- Service package interest
- Consultation bookings

### **Engagement Events**
- Scroll depth (25%, 50%, 75%, 100%)
- Time on page
- Gallery image views
- File downloads
- Video interactions
- Service page views

### **Navigation Events**
- Page views (automatic)
- Internal link clicks
- External link clicks
- Service card interactions

### **Technical Events**
- Page load performance
- JavaScript errors
- Form validation errors
- Browser/device information

## Implementation Examples

### Basic Page Tracking (Automatic)
All pages automatically track views, scroll depth, and time on page.

### Manual Service Tracking
```javascript
// In your service pages
import { trackServiceView } from '@/hooks/useAnalytics';

useEffect(() => {
  trackServiceView('marbre', 'polissage');
}, []);
```

### Quote Form Tracking
```javascript
import { trackQuoteProgress } from '@/utils/analytics';

const handleFormStep = (step) => {
  trackQuoteProgress(step, 'tapis', formData);
};
```

### Contact Interactions
```javascript
import { trackPhoneClick, trackEmailClick } from '@/utils/analytics';

// Phone button
<button onClick={trackPhoneClick}>
  Appeler: +216-98-557-766
</button>

// Email link
<a href="mailto:contact@cciservices.online" onClick={trackEmailClick}>
  Nous contacter
</a>
```

## Data You'll See in Google Analytics

### **Enhanced Ecommerce**
- Service package views
- Quote request funnels
- Lead generation tracking

### **Custom Dimensions**
- Service types
- User engagement levels
- Form completion rates
- Contact methods used

### **Goals & Conversions**
- Quote requests
- Phone calls
- Email contacts
- Service page engagement

## Privacy & Compliance
- SameSite cookie settings
- Respects user privacy preferences
- GDPR-friendly implementation
- No personally identifiable information (PII) tracked

## Monitoring & Optimization

### Real-Time Monitoring
Check Google Analytics Real-Time reports to verify:
1. Page views are being tracked
2. Events are firing correctly
3. User interactions are captured

### Key Metrics to Monitor
1. **Service page engagement** - Which services are most viewed
2. **Quote conversion rates** - Form completion rates
3. **Contact method preferences** - Phone vs. email vs. form
4. **Geographic data** - Where your customers are located
5. **Device usage** - Mobile vs. desktop behavior

## Troubleshooting

### If events aren't showing up:
1. Check browser console for JavaScript errors
2. Verify Google Analytics property ID: `G-0RDH6DH7TS`
3. Test in incognito mode to avoid ad blockers
4. Check Real-Time reports in GA4

### For debugging:
```javascript
// Enable debug mode (add to layout.js temporarily)
gtag('config', 'G-0RDH6DH7TS', {
  debug_mode: true
});
```

## Next Steps
1. Set up Goals in Google Analytics for key conversions
2. Create custom audiences based on service interests
3. Set up Google Ads conversion tracking
4. Monitor and optimize based on user behavior data

This implementation ensures comprehensive tracking of your cleaning services business while providing actionable insights for growth and optimization.