# Supabase Devis Integration Setup Guide

This guide will help you set up the Supabase integration for the Demande de Devis feature.

## Prerequisites

- A Supabase account and project
- Node.js and npm installed
- Access to your project's environment variables

## Setup Steps

### 1. Supabase Project Setup

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project or use an existing one
   - Note down your project URL and API keys

2. **Execute Database Schema**
   - Go to your Supabase dashboard
   - Navigate to the SQL Editor
   - Copy and paste the content from `supabase/schema.sql`
   - Execute the SQL to create the `devis_requests` table and policies

3. **Set up Database Triggers** (Optional - for advanced email notifications)
   - In the SQL Editor, execute the content from `supabase/triggers.sql`
   - This sets up automatic email notifications via database triggers

### 2. Environment Variables Setup

Update your `.env.local` file with your Supabase credentials:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Email Configuration (already configured with Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=cci.services.tn@gmail.com
SMTP_PASS=your-gmail-app-password
SMTP_FROM=cci.services.tn@gmail.com
```

**Important:** Replace the placeholder values with your actual Supabase credentials:
- `NEXT_PUBLIC_SUPABASE_URL`: Your project URL from Supabase dashboard
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your anon/public key from Supabase dashboard  
- `SUPABASE_SERVICE_ROLE_KEY`: Your service role key (keep this secret!)

### 3. Row Level Security (RLS) Policies

The schema includes RLS policies that:
- Allow public insertion of devis requests (anyone can submit a form)
- Restrict reading to authenticated users (for admin access)

### 4. Test the Integration

1. **Start your development server**
   ```bash
   npm run dev
   ```

2. **Navigate to the devis form**
   - Go to `/devis` on your website
   - Fill out and submit the form

3. **Verify data insertion**
   - Check your Supabase dashboard
   - Go to Table Editor > devis_requests
   - You should see the submitted data

4. **Verify email notifications**
   - Check the email configured in `GMAIL_USER`
   - You should receive a notification email

## Database Schema

The `devis_requests` table includes these fields:

### Personal Information
- `type_personne`: 'physique' or 'morale'
- `matricule_fiscale`: Tax ID (required for companies)
- `nom`: Last name or company name
- `prenom`: First name or contact person
- `email`: Email address
- `telephone`: Phone number

### Address Information
- `adresse`: Full address
- `ville`: City
- `code_postal`: Postal code
- `type_logement`: Type of property
- `surface`: Total surface area

### Service Information
- `type_service`: Type of service requested
- `nombre_places`: Number of seats (for salon service)
- `surface_service`: Surface to be treated

### Preferences
- `date_preferee`: Preferred date
- `heure_preferee`: Preferred time slot
- `message`: Additional message
- `newsletter`: Newsletter subscription
- `conditions`: Terms acceptance

## Email Notifications

Email notifications are sent using:
1. **Immediate notification**: Via API route `/api/send-devis-notification`
2. **Gmail SMTP**: Using existing Gmail credentials
3. **Rich HTML template**: Professional email format with all form details

## Security Considerations

- **Environment Variables**: Keep your service role key secret
- **RLS Policies**: Configured to allow public inserts but restrict reads
- **Data Validation**: Server-side validation before database insertion
- **Error Handling**: Graceful error handling with user-friendly messages

## Troubleshooting

### Common Issues

1. **"Missing Supabase environment variables" error**
   - Ensure all Supabase environment variables are set in `.env.local`
   - Restart your development server after adding variables

2. **"Permission denied" errors**
   - Check that RLS policies are correctly set up
   - Verify your API keys are correct

3. **Email notifications not working**
   - Check Gmail app password is correct
   - Verify SMTP settings
   - Check server logs for email errors

4. **Form submission fails**
   - Check browser console for errors
   - Verify Supabase connection
   - Check that all required fields are filled

### Debugging

1. **Check Supabase logs**
   - Go to Supabase dashboard > Logs
   - Look for any error messages

2. **Check browser console**
   - Open developer tools
   - Look for JavaScript errors

3. **Check server logs**
   - Look for console.error messages in your terminal

## Production Deployment

1. **Set production environment variables**
   - Add all Supabase variables to your production environment
   - Ensure Gmail credentials are configured

2. **Database backups**
   - Set up regular backups in Supabase
   - Consider data retention policies

3. **Monitoring**
   - Set up error monitoring
   - Monitor email delivery rates
   - Track form submission metrics

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Supabase documentation: [supabase.com/docs](https://supabase.com/docs)
3. Check the project's GitHub issues or create a new one