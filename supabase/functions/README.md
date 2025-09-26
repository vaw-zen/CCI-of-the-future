# Email Notification Implementation

## ⚠️ Important Note

This directory contains a Supabase Edge Function that is **NOT used** in our Next.js implementation.

## Our Implementation Approach

Since this is a **JavaScript-only Next.js application**, we use a different approach for email notifications:

### ✅ Current Implementation
- **File**: `src/app/api/send-devis-notification/route.js`
- **Type**: Next.js API Route (JavaScript)
- **SMTP**: Uses existing Gmail credentials from `.env.local`
- **Trigger**: Called directly from the form submission service
- **Benefits**: 
  - No TypeScript required
  - Uses existing Gmail infrastructure
  - Simpler setup and maintenance
  - Direct integration with form submission

### ❌ Supabase Edge Function (Not Used)
- **File**: `supabase/functions/send-devis-email/index.ts`
- **Type**: Supabase Edge Function (TypeScript/Deno)
- **Reason not used**: 
  - This project doesn't use TypeScript
  - Requires additional Supabase setup
  - Would need separate SMTP configuration
  - More complex deployment process

## How Email Notifications Work

1. **Form Submission** → `devisService.js` submits data to Supabase
2. **Success** → Service calls `/api/send-devis-notification`
3. **Email Sent** → API route uses nodemailer + Gmail SMTP
4. **User Feedback** → Success message shown to user

## File Structure

```
✅ USED:
src/app/api/send-devis-notification/route.js  # Email API endpoint
src/services/devisService.js                  # Calls email API

❌ NOT USED:
supabase/functions/send-devis-email/index.ts  # Edge function (reference only)
```

## If You Want to Use Edge Functions Instead

If you prefer to use Supabase Edge Functions, you would need to:

1. **Convert to JavaScript**: Rewrite `index.ts` as `index.js`
2. **Deploy Function**: Use Supabase CLI to deploy the function
3. **Update Trigger**: Modify database trigger to call the Edge Function
4. **Configure SMTP**: Set up SMTP settings in Supabase
5. **Update Service**: Remove API route call from `devisService.js`

## Current Setup is Recommended

The Next.js API route approach is recommended because:
- ✅ No TypeScript required
- ✅ Uses existing Gmail setup
- ✅ Simpler deployment
- ✅ Better error handling
- ✅ Direct integration with forms