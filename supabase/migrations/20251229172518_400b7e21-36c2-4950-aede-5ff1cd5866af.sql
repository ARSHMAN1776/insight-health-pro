-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP calls
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the cleanup job to run every hour
SELECT cron.schedule(
  'cleanup-cancelled-appointments-hourly',
  '0 * * * *', -- Run at the top of every hour
  $$
  SELECT net.http_post(
    url := 'https://fdllddffiihycbtgawbr.supabase.co/functions/v1/cleanup-cancelled-appointments',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkbGxkZGZmaWloeWNidGdhd2JyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2OTIwNzEsImV4cCI6MjA3MTI2ODA3MX0.Mvq3hlEWx-e9I6J0Xhrd4piPzVJalJf-Ppm6dgQfO7I"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);