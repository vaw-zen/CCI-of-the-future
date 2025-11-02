# Google Analytics Key Events - Quick Reference

## 🎯 Already Tracking (Google Ads Conversions)

✅ **Email Clicks** - All `mailto:` links automatically track
✅ **Phone Clicks** - All `tel:` links automatically track  
✅ **WhatsApp Clicks** - All `wa.me` links automatically track

**Conversion ID:** `AW-17696563349/oZpbCJfSzrgbEJXBsPZB`

---

## 📊 Implemented Page Tracking

| Page | Scroll Depth | Time Tracking | Custom Events | Status |
|------|-------------|---------------|---------------|--------|
| Homepage | ✅ | ✅ | Hero interactions, CTA clicks | Complete |
| Devis Form | ✅ | ✅ | Full funnel, field tracking | Complete |
| Contact | ✅ | ✅ | All contact methods | Complete |
| Salon Service | ✅ | ✅ | Service views | Complete |

---

## 🔥 Key Events by Category

### CONVERSIONS (Mark these in GA4)
```
generate_lead          - Devis form submitted
conversion_event_contact - Contact form submitted
email_click           - Email clicked (+ Ads conversion)
whatsapp_click        - WhatsApp clicked (+ Ads conversion)
phone_reveal          - Phone clicked (+ Ads conversion)
devis_calculated      - Quote calculator used
```

### ENGAGEMENT
```
scroll_depth          - User scroll progress
timing_complete       - Time on page milestones
select_promotion      - CTA clicked
hero_interaction      - Hero section interaction
service_interaction   - Service page interaction
article_complete      - Article fully read
```

### VISIBILITY
```
view_section          - Section enters viewport
view_promotion        - CTA impression
view_item            - Service detail view
```

### FUNNEL TRACKING
```
begin_checkout       - Form entry
checkout_progress    - Form step complete
form_field_focus     - Field focused
form_field_complete  - Field filled
form_abandonment     - Form exit incomplete
```

---

## 🚀 Usage Examples

### Add Tracking to New Page
```javascript
'use client';
import { useScrollTracking } from '@/hooks/useScrollTracking';
import { useTimeTracking } from '@/hooks/useTimeTracking';

export default function MyPage() {
  useScrollTracking('my_page');
  useTimeTracking('my_page');
  // ... component
}
```

### Track Custom Button Click
```javascript
import { AnalyticsButton } from '@/utils/components/analytics/AnalyticsComponents';

<AnalyticsButton
  eventName="custom_click"
  eventLabel="button_name"
  onClick={handleClick}
>
  Click Me
</AnalyticsButton>
```

### Track Email/Phone Link
```javascript
import { AnalyticsLink } from '@/utils/components/analytics/AnalyticsComponents';

<AnalyticsLink 
  href="mailto:email@example.com"
  eventLabel="location_name"
>
  Email Us
</AnalyticsLink>
```

### Manual Event Tracking
```javascript
import { trackCTAClick } from '@/utils/analytics';

const handleClick = () => {
  trackCTAClick('Button Text', 'location', '/destination', 10);
  // your logic
};
```

---

## 📋 GA4 Configuration Checklist

### Events to Mark as Conversions
1. ✅ `generate_lead`
2. ✅ `conversion_event_contact`
3. ✅ `email_click`
4. ✅ `whatsapp_click`
5. ✅ `phone_reveal`
6. ✅ `devis_calculated`

### Custom Dimensions to Create
1. `service_type` - Event parameter
2. `contact_method` - Event parameter
3. `form_name` - Event parameter
4. `section_name` - Event parameter

### Reports to Set Up
1. Conversion Funnel (Homepage → Service → Devis → Submit)
2. Contact Methods (Email vs Phone vs WhatsApp)
3. Form Analytics (Start → Complete, drop-offs)
4. Content Engagement (Scroll depth, time, completion)

---

## 🧪 Testing Checklist

- [ ] Enable GA4 DebugView
- [ ] Test email link (check console + DebugView)
- [ ] Test phone link (check console + DebugView)
- [ ] Test WhatsApp link (check console + DebugView)
- [ ] Submit devis form (check funnel events)
- [ ] Scroll page (check scroll_depth events)
- [ ] Wait 60s (check timing_complete event)
- [ ] Check Real-Time reports in GA4
- [ ] Verify events in Google Ads (24h delay)

---

## 📞 Important Functions Reference

```javascript
// Contact tracking (includes Google Ads conversion)
trackEmailClick(location, email)
trackPhoneReveal(location)
trackWhatsAppClick(location, phone)

// Engagement
trackCTAClick(text, location, destination, value)
trackScrollDepth(percentage, pageName)
trackTimeOnPage(duration, pageName)
trackSectionView(name, type, context)

// Conversion funnel
trackFunnelStep(funnel, step, number, data)
trackFunnelComplete(funnel, step, number)
trackFormFieldFocus(formName, fieldName, type)
trackFormFieldComplete(formName, fieldName)
trackFormAbandonment(formName, lastField, percentage)

// Devis specific
trackDevisCalculation(serviceType, value, options)
trackDevisSubmission(serviceType, value, method)

// Services
trackServiceInteraction(serviceType, action, data)
trackServiceCardClick(name, url, position)

// Content
trackArticleReadProgress(title, percentage)
trackArticleComplete(title, timeSpent)
trackFAQInteraction(question, helpful)

// Media
trackVideoEngagement(title, action, progress)
trackGalleryInteraction(type, index, action)

// Navigation
trackNavigationClick(text, destination, location)
trackInternalSearch(term, results, location)
```

---

## 🎨 All Available Hooks

```javascript
useScrollTracking(pageName)      // Auto track scroll depth
useTimeTracking(pageName)         // Auto track time milestones
useSectionVisibility(name, type)  // Track section views
useAnalytics()                    // Core analytics hook
useEmailClick()                   // Enhanced email handling
```

---

## 💡 Pro Tips

1. **Always test in DebugView** before deploying
2. **Use descriptive event labels** for easy filtering
3. **Mark primary conversions in GA4** within 24h
4. **Set up custom reports** for your specific KPIs
5. **Monitor Real-Time** during major campaigns
6. **Export data weekly** for external analysis
7. **Set up alerts** for conversion drops
8. **Review funnel drop-offs** monthly

---

## 🐛 Common Issues

**Events not firing?**
- Check `window.gtag` exists in console
- Disable ad blockers
- Check component is client-side (`'use client'`)

**Google Ads conversions not showing?**
- Wait 24-48 hours
- Check conversion ID matches
- Verify in Google Ads conversion tracking tool

**Form tracking incomplete?**
- Ensure hooks imported correctly
- Check form uses `useDevisFormLogic` hook
- Verify field names match tracking calls

---

*Quick Reference v1.0 - Last Updated: 2025-11-02*
