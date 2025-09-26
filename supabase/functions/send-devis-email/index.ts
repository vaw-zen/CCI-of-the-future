// ⚠️ IMPORTANT: This Edge Function is NOT used in our Next.js implementation
// 
// This file exists for reference only. Our Next.js app uses a different approach:
// - Email notifications are handled by: src/app/api/send-devis-notification/route.js
// - This Next.js API route uses the existing Gmail SMTP credentials
// - No TypeScript is used since this is a JavaScript-only Next.js project
//
// If you want to use Supabase Edge Functions instead, you would need to:
// 1. Enable the http extension in Supabase
// 2. Deploy this function to Supabase
// 3. Update the database trigger to call this function
// 4. Configure SMTP settings in Supabase
//
// For now, the Next.js API route approach is simpler and uses existing infrastructure.

console.log('This Supabase Edge Function is not implemented.')
console.log('Email notifications are handled by Next.js API route: /api/send-devis-notification')

