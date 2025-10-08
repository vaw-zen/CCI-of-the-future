# 🎯 How to Use Analytics Components in Your CCI Services Website

## Quick Start Guide

The analytics components are **already set up and ready to use** throughout your website. Here's how they work and how to implement them:

## 🚀 Components Available

### 1. **AnalyticsPhoneLink** - Track Phone Number Clicks
```jsx
import { AnalyticsPhoneLink } from '@/utils/components/analytics/AnalyticsComponents';

<AnalyticsPhoneLink 
  phoneNumber="+21698557766"
  displayText="📞 Appelez maintenant"
  location="header" // or "contact_page", "footer", etc.
  className="your-css-class"
/>
```

### 2. **AnalyticsButton** - Track Button Interactions
```jsx
import { AnalyticsButton } from '@/utils/components/analytics/AnalyticsComponents';

<AnalyticsButton 
  eventName="quote_request"
  eventCategory="conversion"
  eventLabel="homepage_cta"
  onClick={() => {/* your logic */}}
  className="cta-button"
>
  Demander un Devis
</AnalyticsButton>
```

### 3. **AnalyticsLink** - Track Link Clicks
```jsx
import { AnalyticsLink } from '@/utils/components/analytics/AnalyticsComponents';

// Email links
<AnalyticsLink 
  href="mailto:contact@cciservices.online"
  eventName="email_click"
  eventCategory="conversion"
  eventLabel="contact_email"
>
  📧 Nous contacter
</AnalyticsLink>

// Internal navigation
<AnalyticsLink 
  href="/services"
  eventName="navigation_click"
  eventCategory="navigation"
  eventLabel="services_page"
>
  Voir nos Services
</AnalyticsLink>
```

### 4. **AnalyticsServiceCard** - Track Service Interactions
```jsx
import { AnalyticsServiceCard } from '@/utils/components/analytics/AnalyticsComponents';
import { SERVICE_TYPES } from '@/utils/analytics';

<AnalyticsServiceCard 
  serviceType={SERVICE_TYPES.MARBRE}
  serviceName="Polissage Marbre"
  className="service-card"
>
  <h3>Polissage Marbre</h3>
  <p>Restauration professionnelle</p>
</AnalyticsServiceCard>
```

### 5. **AnalyticsForm** - Track Form Submissions
```jsx
import { AnalyticsForm } from '@/utils/components/analytics/AnalyticsComponents';

<AnalyticsForm 
  formName="contact_form"
  onSubmit={handleSubmit}
  className="contact-form"
>
  <input name="nom" type="text" placeholder="Nom" />
  <input name="email" type="email" placeholder="Email" />
  <button type="submit">Envoyer</button>
</AnalyticsForm>
```

## 🎯 Implementation Strategy

### **Phase 1: High-Impact Areas (Start Here)**

**1. Contact Links (Highest Priority)**
Replace all phone and email links:

```jsx
// Before:
<a href="tel:+21698557766">📞 +216 98-557-766</a>
<a href="mailto:contact@cciservices.online">📧 Contact</a>

// After:
<AnalyticsPhoneLink 
  phoneNumber="+21698557766" 
  location="header"
>
  📞 +216 98-557-766
</AnalyticsPhoneLink>

<AnalyticsLink 
  href="mailto:contact@cciservices.online"
  eventName="email_click"
  eventCategory="conversion"
>
  📧 Contact
</AnalyticsLink>
```

**2. Service Cards**
Track which services generate most interest:

```jsx
// In your service components
<AnalyticsServiceCard 
  serviceType={SERVICE_TYPES.MARBRE}
  serviceName="Polissage Marbre"
  onClick={() => router.push('/marbre')}
>
  {/* Your existing service card content */}
</AnalyticsServiceCard>
```

**3. Call-to-Action Buttons**
Track quote requests and conversions:

```jsx
// Replace regular buttons with:
<AnalyticsButton 
  eventName="quote_request"
  eventCategory="conversion"
  eventLabel="hero_section"
  onClick={handleQuoteRequest}
>
  Demander un Devis Gratuit
</AnalyticsButton>
```

### **Phase 2: Forms and User Interactions**

**1. Contact Forms**
```jsx
<AnalyticsForm 
  formName="contact_form"
  onSubmit={handleContactSubmit}
>
  {/* Your form fields */}
</AnalyticsForm>
```

**2. Quote Forms**
```jsx
<AnalyticsForm 
  formName="quote_form"
  onSubmit={(e) => {
    handleQuoteSubmit(e);
    trackQuoteProgress('submit', SERVICE_TYPES.TAPIS);
  }}
>
  {/* Your quote form fields */}
</AnalyticsForm>
```

### **Phase 3: Navigation and Content**

**1. Service Navigation**
```jsx
// Service page links
<AnalyticsLink 
  href="/marbre"
  eventName="service_navigation"
  eventCategory="navigation"
  eventLabel="marbre_service"
>
  Service Marbre
</AnalyticsLink>
```

**2. Social Media Links**
```jsx
<AnalyticsLink 
  href="https://www.facebook.com/Chaabanes.Cleaning.Intelligence/"
  eventName="social_click"
  eventCategory="social"
  eventLabel="facebook"
>
  Facebook
</AnalyticsLink>
```

## 🔄 Migration Examples

### **Example 1: Header Contact Links**
```jsx
// File: src/layout/header/components/desktopMenu/desktopMenu.jsx
// ✅ Already implemented!

// Before:
<a href={phone} className={styles.contactItem}>
  <strong>Appelez maintenant</strong>
</a>

// After (already done):
<AnalyticsPhoneLink 
  phoneNumber={contact.phone}
  location="desktop_menu"
  className={styles.contactItem}
>
  <strong>Appelez maintenant</strong>
</AnalyticsPhoneLink>
```

### **Example 2: Service Cards**
```jsx
// File: src/app/services/sections/2-services/CSR/ServiceLinkLayout.jsx
// ✅ Already implemented!

// The service cards now automatically track:
// - Which services are clicked
// - Service interaction data
// - User engagement with each service type
```

### **Example 3: Contact Page Implementation**
```jsx
// File: src/app/contact/page.jsx (example)

import { AnalyticsPhoneLink, AnalyticsLink, AnalyticsForm } from '@/utils/components/analytics/AnalyticsComponents';

export default function ContactPage() {
  return (
    <div>
      <h1>Contactez CCI Services</h1>
      
      {/* Phone contact */}
      <AnalyticsPhoneLink 
        phoneNumber="+21698557766"
        location="contact_page"
        className="contact-phone"
      >
        📞 +216 98-557-766
      </AnalyticsPhoneLink>

      {/* Email contact */}
      <AnalyticsLink 
        href="mailto:contact@cciservices.online"
        eventName="email_click"
        eventCategory="conversion"
        eventLabel="contact_page_email"
      >
        📧 contact@cciservices.online
      </AnalyticsLink>

      {/* Contact form */}
      <AnalyticsForm 
        formName="contact_page_form"
        onSubmit={handleContactSubmit}
      >
        <input name="nom" type="text" placeholder="Votre nom" />
        <input name="email" type="email" placeholder="Votre email" />
        <select name="service_type">
          <option value="marbre">Marbre</option>
          <option value="tapis">Tapis</option>
          <option value="salon">Salon</option>
        </select>
        <textarea name="message" placeholder="Message"></textarea>
        
        <AnalyticsButton 
          type="submit"
          eventName="contact_form_submit"
          eventCategory="conversion"
          eventLabel="contact_page"
        >
          Envoyer
        </AnalyticsButton>
      </AnalyticsForm>
    </div>
  );
}
```

## 📊 What Gets Tracked Automatically

### **Already Tracking:**
- ✅ **All page views** across the website
- ✅ **Scroll depth** (25%, 50%, 75%, 100%)
- ✅ **Time on page** for each visitor
- ✅ **External link clicks** (Facebook, Instagram, etc.)
- ✅ **Performance metrics** (page load time)
- ✅ **Device information** (mobile, desktop, browser)
- ✅ **Service card clicks** (which services interest users most)
- ✅ **Phone number clicks** from desktop menu
- ✅ **Email clicks** from desktop menu

### **Ready to Track (Just Use Components):**
- 📞 **Phone interactions** from any location
- 📧 **Email clicks** from any page
- 🔘 **Button interactions** and CTAs
- 📝 **Form submissions** and progress
- 🎯 **Service interest** tracking
- 🌐 **Social media engagement**
- 📱 **Navigation patterns**

## 🎯 Business Benefits You'll See

### **Lead Generation Insights:**
- Which pages generate most phone calls
- Email vs phone preference by service type
- Most effective call-to-action buttons
- Form abandonment points

### **Service Performance:**
- Most popular services (marbre, tapis, salon, etc.)
- Service page engagement rates
- Geographic interest patterns
- Seasonal service trends

### **User Behavior:**
- Navigation paths through your site
- Content engagement (articles, galleries)
- Mobile vs desktop behavior
- Time spent on different services

### **Conversion Optimization:**
- Quote request completion rates
- Contact method preferences
- High-performing content
- Drop-off points in user journey

## 🚀 Next Steps

1. **Start with high-impact areas**: Replace contact links first
2. **Add to forms**: Implement on contact and quote forms
3. **Service pages**: Add service card tracking
4. **Monitor results**: Check Google Analytics for data
5. **Optimize**: Use insights to improve conversion rates

## 🔧 Manual Tracking (Advanced)

For custom events, use the analytics utilities:

```jsx
import { trackServiceInteraction, trackQuoteProgress } from '@/utils/analytics';

// Track custom service interactions
trackServiceInteraction('marbre', 'gallery_view', {
  gallery_type: 'before_after',
  image_count: 5
});

// Track quote form progress
trackQuoteProgress('contact_info', 'tapis', {
  area: '25m2',
  location: 'Tunis'
});
```

This implementation will give you comprehensive insights into your customers' behavior and help optimize your cleaning services business for better conversions! 🎯