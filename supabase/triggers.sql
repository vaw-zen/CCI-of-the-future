-- Database trigger to call Edge Function for email notifications
-- Execute this in your Supabase SQL editor after creating the Edge Function

-- Create a function that calls the Edge Function
CREATE OR REPLACE FUNCTION trigger_send_devis_email()
RETURNS TRIGGER AS $$
DECLARE
  request_id int;
BEGIN
  -- Call the Edge Function using pg_net (if available) or http extension
  -- This requires the http extension to be enabled in Supabase
  
  -- Alternative: Insert into a queue table and process with a background job
  -- For now, we'll use a simple approach with pg_notify for real-time processing
  
  SELECT INTO request_id
    net.http_post(
      url := concat(current_setting('supabase.url'), '/functions/v1/send-devis-email'),
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', concat('Bearer ', current_setting('supabase.service_role_key'))
      ),
      body := jsonb_build_object(
        'record', row_to_json(NEW)
      )
    );
    
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't fail the insert
  RAISE WARNING 'Failed to send email notification: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_send_devis_email ON devis_requests;
CREATE TRIGGER trigger_send_devis_email
  AFTER INSERT ON devis_requests
  FOR EACH ROW
  EXECUTE FUNCTION trigger_send_devis_email();

-- Alternative simpler approach using a notifications table
-- Create a notifications queue table
CREATE TABLE IF NOT EXISTS email_notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  recipient TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  devis_request_id UUID REFERENCES devis_requests(id),
  error_message TEXT
);

-- Function to queue email notifications
CREATE OR REPLACE FUNCTION queue_devis_email_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO email_notifications (
    recipient,
    subject,
    body,
    devis_request_id
  ) VALUES (
    current_setting('app.notification_email', true),
    concat('Nouvelle demande de devis - ', NEW.type_service),
    concat('Nouvelle demande de devis reçue de ', NEW.nom, ' ', NEW.prenom, ' pour ', NEW.type_service),
    NEW.id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for email queue
DROP TRIGGER IF EXISTS trigger_queue_devis_email ON devis_requests;
CREATE TRIGGER trigger_queue_devis_email
  AFTER INSERT ON devis_requests
  FOR EACH ROW
  EXECUTE FUNCTION queue_devis_email_notification();

-- Set the notification email (replace with your actual email)
-- This should be set as a Supabase custom setting
-- ALTER DATABASE postgres SET app.notification_email = 'your-email@example.com';