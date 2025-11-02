# Testing Guide - Google Analytics Implementation

## 🧪 Complete Testing Checklist

Follow this step-by-step guide to verify all analytics tracking is working correctly.

---

## Pre-Testing Setup (5 mins)

### 1. Enable GA4 DebugView

**Chrome (Recommended):**
1. Install **Google Analytics Debugger** extension
   - URL: https://chrome.google.com/webstore
   - Search: "Google Analytics Debugger"
   - Click **Add to Chrome**

2. **Enable the extension:**
   - Click extension icon in toolbar
   - Should show: "Debug mode is ON"
   - Icon turns blue when active

**Alternative Method (Any Browser):**
```javascript
// Open browser console (F12)
// Paste and run:
gtag('config', 'G-0RDH6DH7TS', {
  'debug_mode': true
});
```

### 2. Open GA4 DebugView
1. Go to: https://analytics.google.com
2. Select: **CCI Services** property
3. Click: **Configure** → **DebugView**
4. Should see: Your device/browser listed

### 3. Open Browser Console
- Press `F12` or right-click → **Inspect**
- Click **Console** tab
- Look for analytics logs (blue 📊 icons)

---

## Test 1: Email Click Tracking ✉️

### Steps:
1. Navigate to homepage: https://cciservices.online
2. Scroll to hero section
3. Click email link: **contact@cciservices.online**

### Expected Console Output:
```
🔍 useAnalytics.trackEvent called: { 
  eventName: "email_click",
  parameters: { is_mailto: true, ... }
}
✅ Calling window.gtag with: email_click {...}
📈 Event sent to Google Analytics
```

### Expected in DebugView:
- Event: `email_click`
- Parameters:
  - `event_category`: "lead_generation"
  - `email_address`: "contact@cciservices.online"
  - `event_label`: "hero_email"
  - `value`: 5

### Google Ads Conversion:
- Should also trigger conversion event
- Wait 24-48h to see in Google Ads reports

### ✅ Pass Criteria:
- [ ] Console shows analytics event
- [ ] DebugView shows `email_click`
- [ ] Email client opens (or prompts)

---

## Test 2: Phone Click Tracking 📞

### Steps:
1. Stay on homepage
2. Click phone number: **+216 98 557 766**

### Expected Console Output:
```
📞 Phone tracking triggered
Event: phone_reveal
Location: hero_section
```

### Expected in DebugView:
- Event: `phone_reveal`
- Parameters:
  - `event_category`: "lead_generation"
  - `event_label`: "hero_whatsapp"
  - `value`: 5

### ✅ Pass Criteria:
- [ ] Console shows event
- [ ] DebugView shows `phone_reveal`
- [ ] Phone dialer opens (mobile) or shows confirmation (desktop)

---

## Test 3: WhatsApp Click Tracking 💬

### Steps:
1. Click WhatsApp icon or link
2. URL should contain: `wa.me/21698557766`

### Expected Console Output:
```
💬 WhatsApp tracking triggered
Phone extracted: 21698557766
```

### Expected in DebugView:
- Event: `whatsapp_click`
- Parameters:
  - `event_category`: "lead_generation"
  - `phone_number`: "21698557766"
  - `event_label`: "hero_social_whatsapp"
  - `value`: 5

### ✅ Pass Criteria:
- [ ] Console shows event
- [ ] DebugView shows `whatsapp_click`
- [ ] WhatsApp Web/App opens

---

## Test 4: Scroll Depth Tracking 📜

### Steps:
1. Refresh homepage
2. Slowly scroll down to 25% of page
3. Continue to 50%
4. Continue to 75%
5. Scroll to bottom (100%)

### Expected Console Output:
```
Scroll milestone reached: 25%
Event: scroll_depth
```

### Expected in DebugView (5 events):
- Event: `scroll_depth` (x5)
- Parameters for each:
  - `event_label`: "25%", "50%", "75%", "90%", "100%"
  - `page_name`: "homepage"
  - `scroll_percentage`: 25, 50, 75, 90, 100

### ✅ Pass Criteria:
- [ ] See 5 separate scroll_depth events
- [ ] Each milestone logged only once
- [ ] All percentages appear in DebugView

---

## Test 5: Time on Page Tracking ⏱️

### Steps:
1. Stay on page for 30 seconds
2. Wait until 60 seconds
3. (Optional) Wait for 120 seconds

### Expected Console Output:
```
Time milestone: 30s
Event: timing_complete
```

### Expected in DebugView:
- Event: `timing_complete`
- Parameters:
  - `name`: "time_on_page"
  - `value`: 30, 60, 120 (in seconds)
  - `event_label`: "homepage"

### ✅ Pass Criteria:
- [ ] Event fires at 30s
- [ ] Event fires at 60s
- [ ] Each milestone tracked once

---

## Test 6: CTA Button Clicks 🎯

### Steps:
1. Click **"Devis Gratuit"** button
2. Go back, click **"Nos Services"** button

### Expected Console Output:
```
CTA clicked: Devis Gratuit
Destination: /contact#devis
Value: 10
```

### Expected in DebugView:
- Event: `select_promotion`
- Parameters:
  - `promotion_name`: "Devis Gratuit"
  - `creative_slot`: "hero_section"
  - `cta_destination`: "/contact#devis"
  - `value`: 10

### ✅ Pass Criteria:
- [ ] Event fires before navigation
- [ ] Both buttons tracked
- [ ] Different values (10 vs 5)

---

## Test 7: Service Page View 🧹

### Steps:
1. Navigate to: **/salon**
2. Wait 2 seconds

### Expected Console Output:
```
Service page viewed: SALON
Page title: [Salon metadata title]
```

### Expected in DebugView:
- Event: `service_interaction`
- Parameters:
  - `service_type`: "salon"
  - `action`: "page_view"
  - `page_title`: [full title]

### Repeat for:
- [ ] /tapis
- [ ] /marbre
- [ ] /tapisserie
- [ ] /tfc

### ✅ Pass Criteria:
- [ ] Each service page tracked
- [ ] Scroll & time tracking active
- [ ] Service type correctly identified

---

## Test 8: Devis Form Funnel 📝

### Steps:
1. Navigate to: **/devis**
2. Wait 2 seconds (form entry)
3. Click **"Type de personne"** dropdown
4. Fill in **email** field
5. Select **service type** (e.g., "Salon")
6. Fill remaining required fields
7. Submit form

### Expected Console Output (sequence):
```
1. Funnel step: form_start
2. Field focus: typePersonne
3. Field complete: email
4. Funnel step: service_selected (service: salon)
5. Field complete: [each field]
6. Form submitted: devis_form
7. Time to complete: [seconds]
```

### Expected in DebugView (multiple events):
1. `begin_checkout` (form_start)
2. `form_field_focus` (each focus)
3. `form_field_complete` (each complete)
4. `begin_checkout` (service_selected)
5. `generate_lead` (submission) ⭐ CONVERSION
6. `checkout_progress` (form_completed)
7. `timing_complete` (time to complete)

### ✅ Pass Criteria:
- [ ] Form entry tracked
- [ ] Field interactions logged
- [ ] Service selection tracked
- [ ] Submission logged as `generate_lead`
- [ ] Time to complete recorded

---

## Test 9: Form Abandonment 🚪

### Steps:
1. Navigate to: **/devis**
2. Fill in 2-3 fields
3. Close tab or navigate away

### Expected Console Output:
```
Form abandonment detected
Completion rate: 30%
Last field: email
```

### Expected in DebugView:
- Event: `form_abandonment`
- Parameters:
  - `form_name`: "devis_form"
  - `last_field`: [field name]
  - `completion_rate`: [percentage]

### ✅ Pass Criteria:
- [ ] Abandonment tracked on page exit
- [ ] Completion rate calculated
- [ ] Last field recorded

---

## Test 10: Blog Article Tracking 📖

### Steps:
1. Navigate to any article: **/conseils/[slug]**
2. Wait 10 seconds
3. Scroll to 25% of article
4. Continue to 50%
5. Scroll to 90% (article completion)

### Expected Console Output:
```
Article read progress: 25%
Article read progress: 50%
Article complete: [title]
Time spent: [seconds]
```

### Expected in DebugView:
- Event: `article_read_progress` (at 25%, 50%, 75%, 90%)
- Event: `article_complete` (at 90%)
- Parameters:
  - `article_title`: [article name]
  - `read_progress`: 25, 50, 75, 90, 100
  - `time_spent`: [seconds]

### ✅ Pass Criteria:
- [ ] Progress tracked at milestones
- [ ] Completion event fires at 90%
- [ ] Time calculated correctly

---

## Test 11: Contact Form Submission 📨

### Steps:
1. Navigate to: **/contact**
2. Fill out contact form
3. Submit

### Expected Console Output:
```
Contact form submitted
Event: conversion_event_contact
```

### Expected in DebugView:
- Event: `conversion_event_contact` ⭐ CONVERSION
- Parameters:
  - `event_category`: "conversion"
  - Form data parameters

### ✅ Pass Criteria:
- [ ] Submission tracked
- [ ] Marked as conversion event
- [ ] Form data captured

---

## Test 12: Social Media Clicks 👥

### Steps:
1. On homepage hero section
2. Click each social icon:
   - Instagram
   - Facebook
   - LinkedIn
   - YouTube

### Expected in DebugView (for each):
- Event: `social_interaction`
- Parameters:
  - `social_platform`: "instagram", "facebook", etc.
  - `social_action`: "click"
  - `page_location`: [current URL]

### ✅ Pass Criteria:
- [ ] Each platform tracked separately
- [ ] Event names correct
- [ ] Opens in new tab

---

## Verification in GA4 Reports (24h later)

After testing, wait 24 hours and verify in GA4:

### Real-Time Report (Check Immediately)
1. Go to: **Reports** → **Realtime**
2. Should see:
   - Active users (you)
   - Recent events (all tests)
   - Event count by name

### Events Report (24h later)
1. Go to: **Reports** → **Engagement** → **Events**
2. Verify event counts:
   - `email_click`: 1+
   - `whatsapp_click`: 1+
   - `phone_reveal`: 1+
   - `scroll_depth`: 5+
   - `generate_lead`: 1+
   - `service_interaction`: 5+

### Conversions Report
1. Go to: **Reports** → **Monetization** → **Conversions**
2. Should show:
   - `generate_lead` (devis)
   - `conversion_event_contact`

---

## Troubleshooting

### Events Not Firing?

**Check 1: Console Errors**
```javascript
// Run in console:
console.log(typeof window.gtag);
// Should output: "function"

console.log(window.gtag);
// Should show: function definition
```

**Check 2: Ad Blockers**
- Disable all ad blockers
- Use incognito/private mode
- Try different browser

**Check 3: Client-Side Rendering**
- Verify component has `'use client'` directive
- Check hooks are imported correctly

### DebugView Not Showing Events?

1. Refresh DebugView page
2. Verify debug mode is ON
3. Check GA4 property ID matches
4. Clear browser cache
5. Wait 30 seconds for processing

### Google Ads Conversions Missing?

1. Wait 48 hours (processing delay)
2. Verify conversion tracking in Google Ads:
   - **Tools** → **Conversions**
   - Find `AW-17696563349/oZpbCJfSzrgbEJXBsPZB`
   - Status should be: **Recording conversions**
3. Check auto-tagging enabled

---

## Final Validation Checklist

Before marking complete, verify:

### Console
- [ ] No JavaScript errors
- [ ] All events logging to console
- [ ] `window.gtag` defined

### DebugView (Real-Time)
- [ ] Device showing in list
- [ ] Events appearing within seconds
- [ ] Parameters correctly populated

### GA4 Reports (24h)
- [ ] Events in Events report
- [ ] Conversions marked and counting
- [ ] Custom dimensions working

### Google Ads (48h)
- [ ] Conversions showing in dashboard
- [ ] Attribution working
- [ ] Conversion count > 0

---

## Testing Schedule

**Day 1 (Today):**
- ✅ Complete all 12 tests
- ✅ Verify in DebugView
- ✅ Check console logs

**Day 2:**
- ✅ Check GA4 Events report
- ✅ Verify Real-Time shows data
- ✅ Confirm custom dimensions

**Day 3:**
- ✅ Check Google Ads conversions
- ✅ Review conversion funnel
- ✅ Validate attribution

**Week 1:**
- 📊 Review first week's data
- 🎯 Optimize based on insights
- 📈 Set baseline metrics

---

## Support & Resources

**Need Help?**
- Check console for error messages
- Review: `ANALYTICS_IMPLEMENTATION_GUIDE.md`
- Reference: `ANALYTICS_QUICK_REFERENCE.md`
- GA4 Help: https://support.google.com/analytics

**Report Issues:**
- Note which test failed
- Include console output
- Screenshot DebugView
- Describe expected vs actual

---

**Testing Guide v1.0**  
*Last Updated: 2025-11-02*  
*Est. Testing Time: 30-45 minutes*
