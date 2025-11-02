# GA4 Configuration Guide for CCI Services

## Step 1: Mark Events as Conversions (5 mins)

### Navigate to Conversions
1. Go to **Google Analytics 4** → https://analytics.google.com
2. Select your **CCI Services** property
3. Click **Admin** (gear icon, bottom left)
4. Under **Data display**, click **Events**

### Mark These 6 Events as Conversions
Check the box next to each event to mark as conversion:

| Event Name | Description | Expected Volume |
|------------|-------------|-----------------|
| `generate_lead` | Devis form submitted | HIGH - Primary conversion |
| `conversion_event_contact` | Contact form submitted | MEDIUM |
| `email_click` | Email link clicked | HIGH |
| `whatsapp_click` | WhatsApp clicked | HIGH |
| `phone_reveal` | Phone number clicked | MEDIUM |
| `devis_calculated` | Quote calculator used | HIGH |

**How to mark:**
- Wait 24h for events to appear in the list
- Click the toggle switch next to each event name
- The switch will turn blue when active

---

## Step 2: Create Custom Dimensions (5 mins)

### Navigate to Custom Definitions
1. Still in **Admin**
2. Under **Data display**, click **Custom definitions**
3. Click **Create custom dimension**

### Create These Custom Dimensions

#### Dimension 1: Service Type
```
Dimension name: service_type
Scope: Event
Description: Type of cleaning service
Event parameter: service_type
```

#### Dimension 2: Contact Method  
```
Dimension name: contact_method
Scope: Event
Description: How user initiated contact
Event parameter: contact_method
```

#### Dimension 3: Form Name
```
Dimension name: form_name
Scope: Event
Description: Name of the form interacted with
Event parameter: form_name
```

#### Dimension 4: Section Name
```
Dimension name: section_name
Scope: Event
Description: Page section viewed
Event parameter: section_name
```

#### Dimension 5: Page Context
```
Dimension name: page_context
Scope: Event
Description: Page where event occurred
Event parameter: page_context
```

---

## Step 3: Create Conversion Funnel Report (5 mins)

### Method A: Using Explorations (Recommended)

1. Go to **Explore** in left sidebar
2. Click **Funnel exploration**
3. Name: "Devis Conversion Funnel"

#### Configure Steps:
```
Step 1: Page View (Homepage)
  - Event: page_view
  - Filter: page_location contains "cciservices.online/"

Step 2: Service Page Visit  
  - Event: service_interaction
  - Filter: action = "page_view"

Step 3: Devis Form Start
  - Event: begin_checkout
  - Filter: funnel_name = "devis_form"

Step 4: Service Selected
  - Event: begin_checkout
  - Filter: step_name = "service_selected"

Step 5: Form Submitted
  - Event: generate_lead
```

4. Click **Apply** and save to library

### Method B: Custom Report (Alternative)

1. Go to **Reports** → **Library**
2. Click **Create new report** → **Detail report**
3. Name: "Lead Generation Funnel"

Add these metrics:
- `generate_lead` (count)
- `devis_calculated` (count)  
- `form_field_focus` (count)
- `form_field_complete` (count)
- `form_abandonment` (count)

Add dimensions:
- `service_type`
- `form_name`
- Date

---

## Step 4: Create Custom Dashboards

### Dashboard 1: Conversion Overview

**Name:** "CCI Conversions Dashboard"

**Widgets to Add:**

1. **Total Conversions** (Scorecard)
   - Metric: `generate_lead` count
   - Period comparison: Last 7 days vs previous

2. **Conversion by Method** (Pie Chart)
   - Dimension: `contact_method`
   - Metric: Event count
   - Filter: Include `email_click`, `whatsapp_click`, `phone_reveal`

3. **Service Interest** (Bar Chart)
   - Dimension: `service_type`
   - Metric: `service_interaction` count
   - Sort: Descending

4. **Form Abandonment Rate** (Gauge)
   - Metric: `form_abandonment` / `begin_checkout` * 100
   - Display: Percentage

5. **Devis Timeline** (Line Chart)
   - X-axis: Date
   - Y-axis: `generate_lead` count
   - Period: Last 30 days

### Dashboard 2: Engagement Metrics

**Name:** "User Engagement Dashboard"

**Widgets to Add:**

1. **Scroll Depth** (Distribution)
   - Event: `scroll_depth`
   - Group by: `scroll_percentage`

2. **Time on Site** (Average)
   - Event: `timing_complete`
   - Metric: Average value
   - Filter: name = "time_on_page"

3. **Article Completion** (Table)
   - Dimension: `article_title`
   - Metrics: `article_complete` count, avg `time_spent`

4. **CTA Performance** (Bar Chart)
   - Event: `select_promotion`
   - Group by: `promotion_name`
   - Metric: Count + Conversion rate

---

## Step 5: Set Up Alerts

### Navigate to Admin → Alerts
1. Click **Create alert**
2. Configure these alerts:

#### Alert 1: Conversion Drop
```
Alert name: Daily Conversions Drop
Condition: generate_lead count
Threshold: < 3 (per day)
Frequency: Daily
Recipients: [your email]
```

#### Alert 2: Form Abandonment Spike
```
Alert name: High Form Abandonment
Condition: form_abandonment count
Threshold: > 10 (per day)
Frequency: Daily
Recipients: [your email]
```

#### Alert 3: Site Speed Issue
```
Alert name: Slow Page Load
Condition: timing_complete (page_load_time)
Threshold: > 5000ms average
Frequency: Daily
Recipients: [your email]
```

---

## Step 6: Link to Google Ads (Already Done)

Your Google Ads account is linked via API with conversion ID:
```
AW-17696563349/oZpbCJfSzrgbEJXBsPZB
```

### Verify Link:
1. Go to **Admin** → **Product links** → **Google Ads links**
2. Should show: **Linked** status
3. Check: Auto-tagging is **enabled**

### Import Conversions to Google Ads:
1. Open **Google Ads** → https://ads.google.com
2. Go to **Tools & Settings** → **Conversions**
3. Click **New conversion action** → **Import**
4. Select **Google Analytics 4 properties**
5. Import these events:
   - ✅ `generate_lead`
   - ✅ `conversion_event_contact`
   - ✅ Manual conversion tracking (already configured)

---

## Step 7: Configure Data Retention

1. **Admin** → **Data Settings** → **Data retention**
2. Set to: **14 months** (maximum for free tier)
3. Check: **Reset user data on new activity** = ON

---

## Step 8: Enable Enhanced Measurement

1. **Admin** → **Data streams**
2. Click your **Web** data stream
3. Click **Enhanced measurement**
4. Ensure these are ON:
   - ✅ Page views
   - ✅ Scrolls (90% depth)
   - ✅ Outbound clicks
   - ✅ Site search
   - ✅ Video engagement
   - ✅ File downloads

---

## Quick Verification Checklist

After configuration, verify everything works:

- [ ] 6 conversion events marked in GA4
- [ ] 5 custom dimensions created
- [ ] Funnel report saved in Explorations
- [ ] 2 custom dashboards created
- [ ] 3 alerts configured
- [ ] Google Ads link active
- [ ] Data retention set to 14 months
- [ ] Enhanced measurement enabled
- [ ] Real-time reports showing data
- [ ] DebugView tested (see testing guide)

---

## Expected Data Flow Timeline

| Time | What to Expect |
|------|----------------|
| Immediate | Events in DebugView (testing) |
| 30 mins | Events in Real-Time reports |
| 24 hours | Events appear in standard reports |
| 24-48 hours | Conversions in Google Ads |
| 7 days | Enough data for funnel analysis |
| 30 days | Statistically significant trends |

---

## Common Issues & Solutions

### Events not showing in reports?
- Wait 24-48 hours for processing
- Check DebugView for real-time validation
- Verify no ad blockers interfering

### Conversions not in Google Ads?
- Confirm auto-tagging enabled
- Check conversion action is "Active"
- Wait 48 hours for data sync

### Custom dimensions not populating?
- Ensure parameter names match exactly
- Wait 24h after creation
- Check events include the parameter

### Funnel showing 0% conversion?
- Verify all step events are firing
- Check date range has sufficient data
- Confirm event names are exact matches

---

## Monthly Maintenance Tasks

**Week 1:**
- Review conversion rates
- Check form abandonment points
- Analyze service popularity

**Week 2:**
- Review scroll depth & time metrics
- Optimize low-performing content
- Check article completion rates

**Week 3:**
- Analyze traffic sources
- Review Google Ads performance
- Update bid strategies based on conversions

**Week 4:**
- Export data for external analysis
- Review and adjust goals
- Plan A/B tests based on insights

---

## Support Resources

- **GA4 Help:** https://support.google.com/analytics
- **Google Ads Help:** https://support.google.com/google-ads
- **Implementation Docs:** See ANALYTICS_IMPLEMENTATION_GUIDE.md
- **Quick Reference:** See ANALYTICS_QUICK_REFERENCE.md

---

**Configuration Guide v1.0**  
*Last Updated: 2025-11-02*
*Total Setup Time: ~30 minutes*
