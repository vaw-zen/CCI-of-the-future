# Google Analytics Key Events Implementation Guide
## CCI Services - Complete Analytics Tracking System

This document outlines the comprehensive analytics tracking system implemented across the CCI Services website to measure visibility, reach, engagement, and conversion.

---

## 📊 Overview

The analytics system tracks the complete user journey from initial page view through conversion, providing insights into:
- **Visibility**: Section views, scroll depth, time on page
- **Reach**: Page views, traffic sources, user demographics  
- **Engagement**: Click interactions, content consumption, video plays
- **Conversion**: Form submissions, contact clicks, quote requests

---

## 🎯 Key Events Categories

### 1. VISIBILITY & REACH TRACKING

#### Page-Level Events
- **Page View**: Automatically tracked on all pages via Google Analytics config
- **Scroll Depth**: Tracked at 25%, 50%, 75%, 90%, 100% milestones
- **Time on Page**: Tracked at 30s, 60s, 120s, 300s milestones
- **Section Views**: When key sections enter viewport (50% visibility threshold)

**Implementation:**
```javascript
// Automatic on any page
import { useScrollTracking } from '@/hooks/useScrollTracking';
import { useTimeTracking } from '@/hooks/useTimeTracking';

useScrollTracking('page_name');
useTimeTracking('page_name');
```

**Events Generated:**
- `scroll_depth` - User scroll progress
- `timing_complete` - Time milestones reached
- `view_section` - Section becomes visible

---

### 2. ENGAGEMENT TRACKING

#### Hero Section Interactions
**Tracked Actions:**
- Email link clicks
- Phone/WhatsApp clicks  
- Social media icon clicks
- CTA button clicks (Devis Gratuit, Nos Services)

**Events:**
- `hero_interaction` - Any hero section interaction
- `email_click` - Email link clicked (+ Google Ads conversion)
- `whatsapp_click` - WhatsApp link clicked (+ Google Ads conversion)
- `phone_reveal` - Phone number clicked (+ Google Ads conversion)
- `select_promotion` - CTA button clicked
- `social_interaction` - Social media link clicked

#### Service Card Interactions
**Events:**
- `select_content` - Service card clicked
- `service_interaction` - Service page viewed
- `view_item` - Service details viewed

#### Gallery & Media
**Events:**
- `gallery_interaction` - Gallery image viewed/clicked
- `video_start` - Video playback started
- `video_progress` - Video milestone reached (25%, 50%, 75%, 100%)
- `video_complete` - Video watched to completion

---

### 3. CONVERSION FUNNEL TRACKING

#### Devis/Quote Form (Complete Funnel)

**Funnel Steps:**
1. **Form Entry** (`form_start`)
2. **Service Selection** (`service_selected`) 
3. **Form Submission** (`form_submitted`)

**Field-Level Tracking:**
- `form_field_focus` - User focuses on a field
- `form_field_complete` - User fills a required field
- `form_abandonment` - User exits with incomplete form

**Conversion Events:**
- `devis_calculated` - Quote calculator used
- `generate_lead` - Devis form submitted successfully
- `timing_complete` - Time to complete form

**Key Metrics Captured:**
- Service type selected
- Estimated value/surface
- Completion percentage
- Time to submit
- Abandonment point

**Implementation Example:**
```javascript
// Automatically tracked in devisForm.func.js
- Form entry: trackFunnelStep('devis_form', 'form_start', 1)
- Field focus: trackFormFieldFocus('devis_form', fieldName)
- Field complete: trackFormFieldComplete('devis_form', fieldName)
- Submission: trackDevisSubmission(serviceType, value, 'form')
```

---

### 4. CONTACT & LEAD GENERATION

#### Contact Methods (All trigger Google Ads conversions)

**Email Clicks:**
- Event: `email_click`
- Conversion: `AW-17696563349/oZpbCJfSzrgbEJXBsPZB`
- Value: 5
- Locations tracked: hero, footer, contact page, social icons

**Phone Clicks:**
- Event: `phone_reveal` / `phone_click`
- Conversion: `AW-17696563349/oZpbCJfSzrgbEJXBsPZB`
- Value: 5
- Locations tracked: hero, header, footer, contact page

**WhatsApp Clicks:**
- Event: `whatsapp_click`
- Conversion: `AW-17696563349/oZpbCJfSzrgbEJXBsPZB`
- Value: 5
- Locations tracked: hero, contact page, service pages

**Contact Form Submissions:**
- Event: `conversion_event_contact`
- Category: High-value conversion
- Tracked: Form completion, submission time

---

### 5. CONTENT ENGAGEMENT

#### Blog/Article Tracking
**Events:**
- `article_view` - Article page loaded
- `article_read_progress` - Read depth (25%, 50%, 75%, 100%)
- `article_complete` - Article fully read
- `article_interaction` - In-article CTA clicked

#### FAQ Interactions
**Events:**
- `faq_interaction` - FAQ item expanded
- Tracked: Question text, helpful/not helpful feedback

---

### 6. NAVIGATION & SEARCH

**Events:**
- `navigation_click` - Menu item clicked
- `search` - Internal search performed
- `view_promotion` - CTA/Banner impression
- `select_promotion` - CTA/Banner clicked

---

## 🔧 Implementation Files

### Core Analytics Files

1. **`src/utils/analytics.js`**
   - All tracking functions
   - ~40 different event types
   - Google Ads conversion integration

2. **Custom Hooks:**
   - `src/hooks/useScrollTracking.js` - Scroll depth monitoring
   - `src/hooks/useSectionVisibility.js` - Section visibility detection
   - `src/hooks/useTimeTracking.js` - Time on page tracking
   - `src/hooks/useAnalytics.js` - Core analytics hook
   - `src/hooks/useEmailClick.js` - Enhanced email click handling

3. **Components:**
   - `src/utils/components/analytics/AnalyticsComponents.js`
     - AnalyticsLink - Auto-tracking links
     - AnalyticsButton - Auto-tracking buttons
     - AnalyticsPhoneLink - Phone number tracking
     - AnalyticsSocialLink - Social media tracking
     - AnalyticsForm - Form tracking wrapper

### Pages with Tracking Implemented

✅ **Homepage** (`src/app/home/home.jsx`)
- Scroll depth tracking
- Time tracking
- Hero interactions

✅ **Hero Section** (`src/app/home/sections/1-hero/hero.jsx`)
- All email, phone, WhatsApp, social clicks
- CTA button tracking
- Section visibility

✅ **Devis Form** (`src/app/devis/3-form/`)
- Complete funnel tracking
- Field-level interactions
- Abandonment detection
- Submission tracking

✅ **Contact Page** (`src/app/contact/1-actions/actions.jsx`)
- WhatsApp link tracking
- Email link tracking
- Contact method conversions

✅ **Service Pages** (e.g., `src/app/salon/page.jsx`)
- Page view tracking
- Scroll & time tracking
- Service interaction tracking

---

## 📈 Google Analytics Setup

### Required Configuration

1. **Measurement ID**: `G-0RDH6DH7TS` (already configured)
2. **Google Ads Conversion ID**: `AW-17696563349`
3. **Conversion Label**: `oZpbCJfSzrgbEJXBsPZB`

### Key Events to Mark as Conversions in GA4

Navigate to **Admin → Events → Mark as conversion**:

#### Primary Conversions (High Value)
- ✅ `generate_lead` - Devis form submission
- ✅ `conversion_event_contact` - Contact form submission
- ✅ `devis_submitted` - Quote request completed

#### Secondary Conversions (Medium Value)
- ✅ `email_click` - Email contact initiated
- ✅ `whatsapp_click` - WhatsApp contact initiated
- ✅ `phone_reveal` - Phone contact initiated
- ✅ `devis_calculated` - Quote calculator used

#### Engagement Events (Track but don't convert)
- `scroll_depth` - Scroll milestones
- `timing_complete` - Time on page milestones
- `hero_interaction` - Hero section interactions
- `article_complete` - Article fully read
- `video_complete` - Video watched fully

---

## 🎨 Custom Dimensions to Configure

Recommended custom dimensions in GA4:

1. **service_type** - Which service user is interested in
2. **form_name** - Which form was interacted with
3. **section_name** - Which section was viewed
4. **contact_method** - How user preferred to contact (email/phone/whatsapp)
5. **funnel_step** - Position in conversion funnel
6. **completion_rate** - Form completion percentage

---

## 📊 Recommended GA4 Reports to Create

### 1. Conversion Funnel Report
**Path:** Explore → Funnel exploration
```
Homepage view → Service view → Devis form start → 
Service selected → Form submitted
```

### 2. Contact Method Analysis
**Segments:**
- Email clickers
- Phone clickers  
- WhatsApp clickers
- Form submitters

### 3. Content Engagement Report
**Metrics:**
- Average scroll depth by page
- Average time on page
- Article completion rate
- Video completion rate

### 4. Form Analytics Dashboard
**Metrics:**
- Form starts
- Form completions
- Abandonment rate
- Average completion time
- Drop-off points (field level)

---

## 🚀 Next Steps for Full Implementation

### To Add Tracking To Additional Pages:

**1. Service Pages** (tapis, marbre, tapisserie, tfc)
```javascript
'use client';
import { useScrollTracking } from '@/hooks/useScrollTracking';
import { useTimeTracking } from '@/hooks/useTimeTracking';
import { useEffect } from 'react';
import { trackServiceInteraction, SERVICE_TYPES } from '@/utils/analytics';

export default function ServicePage() {
  useScrollTracking('service_name');
  useTimeTracking('service_name');
  
  useEffect(() => {
    trackServiceInteraction(SERVICE_TYPES.TAPIS, 'page_view');
  }, []);
  
  // ... rest of component
}
```

**2. Blog/Article Pages**
```javascript
'use client';
import { useEffect, useRef } from 'react';
import { trackArticleReadProgress, trackArticleComplete } from '@/utils/analytics';

// Add scroll progress tracking
// Track 25%, 50%, 75%, 100% read depth
```

**3. Any New Forms**
```javascript
import { AnalyticsForm } from '@/utils/components/analytics/AnalyticsComponents';

<AnalyticsForm formName="contact_form" onSubmit={handleSubmit}>
  {/* form fields */}
</AnalyticsForm>
```

**4. Any New CTAs/Buttons**
```javascript
import { AnalyticsButton } from '@/utils/components/analytics/AnalyticsComponents';

<AnalyticsButton
  eventName="cta_click"
  eventLabel="get_quote"
  onClick={handleClick}
>
  Get Quote
</AnalyticsButton>
```

---

## 🔍 Testing Your Implementation

### 1. Use Google Analytics DebugView
1. Install GA Debugger Chrome extension
2. Navigate your site
3. Check DebugView in GA4 (Admin → DebugView)
4. Verify events are firing

### 2. Check Console Logs
Events log to console with emoji markers:
- 🔍 Event tracked
- ✅ Successfully sent  
- ❌ Error occurred

### 3. Google Tag Assistant
Use Google Tag Assistant Chrome extension to verify:
- GA4 measurement ID present
- Events firing correctly
- Parameters included

### 4. Real-Time Reports
Check GA4 Real-Time report while testing:
- Events section shows live events
- Conversions section shows conversion events

---

## 📞 Support & Maintenance

### Adding New Event Types

1. Add function to `src/utils/analytics.js`
2. Import in component
3. Call on user interaction
4. Test in DebugView
5. Mark as conversion in GA4 (if applicable)

### Troubleshooting

**Events not showing in GA4?**
- Check console for errors
- Verify gtag is loaded: `typeof window.gtag`
- Check adblockers are disabled  
- Wait 24-48 hours for data processing

**Google Ads conversions not tracking?**
- Verify conversion ID correct
- Check `gtag_report_conversion` function exists
- Test in Google Ads conversion tracking tool
- Conversions may take 24h to appear

---

## 📈 Expected Results

With this implementation, you can now measure:

✅ **Visibility Metrics:**
- Page views, unique visitors
- Scroll depth distribution
- Time on site distribution
- Section engagement rates

✅ **Engagement Metrics:**
- Click-through rates on CTAs
- Service page engagement
- Content completion rates
- Video/gallery interactions

✅ **Conversion Metrics:**
- Lead generation rate
- Contact method preferences
- Form completion rate
- Funnel drop-off points
- Customer acquisition cost (with Google Ads data)

✅ **Attribution:**
- Which pages drive conversions
- Which traffic sources convert best
- Which services generate most interest
- ROI per ad campaign

---

## 🎯 Success Metrics to Monitor

### Primary KPIs
1. **Conversion Rate**: Visitors → Leads (target: >3%)
2. **Form Completion Rate**: Starts → Submissions (target: >40%)
3. **Contact Rate**: Email+Phone+WhatsApp clicks (target: >5% of visitors)
4. **Engagement Rate**: Scroll >50% + Time >60s (target: >30%)

### Secondary KPIs
1. Average time on page (target: >2 minutes)
2. Pages per session (target: >2.5)
3. Return visitor rate (target: >20%)
4. Video completion rate (target: >50%)

---

*Last Updated: 2025-11-02*
*Version: 1.0*
*Contact: Analytics implementation by GitHub Copilot*
