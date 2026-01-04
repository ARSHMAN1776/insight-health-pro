import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-RateLimit-Limit': '10',
  'X-RateLimit-Remaining': '10',
}

// Simple in-memory rate limiting (resets on function cold start)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 10; // max 10 requests per minute

function checkRateLimit(identifier: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);
  
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 };
  }
  
  if (entry.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0 };
  }
  
  entry.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX - entry.count };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[Cleanup] Starting cancelled appointments cleanup job...');
    
    // ============= Authentication Check =============
    // This function should only be called via cron job or by authenticated admins
    const authHeader = req.headers.get('authorization');
    const cronSecret = req.headers.get('x-cron-secret');
    const expectedCronSecret = Deno.env.get('CRON_SECRET');
    
    // Allow if cron secret matches (for scheduled jobs)
    const isCronJob = expectedCronSecret && cronSecret === expectedCronSecret;
    
    // Or if valid admin auth token
    let isAdmin = false;
    if (!isCronJob && authHeader) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
      const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);
      
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
      
      if (!authError && user) {
        // Check if user is admin
        const { data: hasAdminRole } = await supabaseAuth.rpc('has_role', {
          _user_id: user.id,
          _role: 'admin'
        });
        isAdmin = hasAdminRole === true;
      }
    }
    
    // If neither cron nor admin, check rate limit and allow (for backward compatibility)
    // In production, you may want to require auth always
    if (!isCronJob && !isAdmin) {
      // Apply rate limiting for unauthenticated requests
      const clientIp = req.headers.get('x-forwarded-for') || 'unknown';
      const { allowed, remaining } = checkRateLimit(clientIp);
      
      if (!allowed) {
        console.log(`[Cleanup] Rate limit exceeded for: ${clientIp}`);
        return new Response(
          JSON.stringify({ success: false, error: 'Rate limit exceeded. Try again later.' }),
          { 
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json',
              'X-RateLimit-Remaining': '0',
              'Retry-After': '60'
            },
            status: 429 
          }
        );
      }
      
      corsHeaders['X-RateLimit-Remaining'] = remaining.toString();
      console.log(`[Cleanup] Unauthenticated request from ${clientIp}, rate limit remaining: ${remaining}`);
    }
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Calculate the cutoff time (1 hour ago)
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
    const cutoffTime = oneHourAgo.toISOString();
    
    console.log(`[Cleanup] Looking for cancelled appointments updated before: ${cutoffTime}`);
    
    // Find cancelled appointments that were cancelled more than 1 hour ago
    // and haven't been soft-deleted yet
    const { data: appointmentsToDelete, error: fetchError } = await supabase
      .from('appointments')
      .select('id, patient_id, appointment_date, appointment_time, status, updated_at')
      .eq('status', 'cancelled')
      .is('deleted_at', null)
      .lt('updated_at', cutoffTime);
    
    if (fetchError) {
      console.error('[Cleanup] Error fetching appointments:', fetchError);
      throw fetchError;
    }
    
    console.log(`[Cleanup] Found ${appointmentsToDelete?.length || 0} cancelled appointments to soft-delete`);
    
    if (appointmentsToDelete && appointmentsToDelete.length > 0) {
      // Soft delete the appointments by setting deleted_at
      const appointmentIds = appointmentsToDelete.map(a => a.id);
      
      const { error: updateError } = await supabase
        .from('appointments')
        .update({ deleted_at: new Date().toISOString() })
        .in('id', appointmentIds);
      
      if (updateError) {
        console.error('[Cleanup] Error soft-deleting appointments:', updateError);
        throw updateError;
      }
      
      console.log(`[Cleanup] Successfully soft-deleted ${appointmentIds.length} cancelled appointments`);
      
      // Log details of deleted appointments (without PII)
      appointmentsToDelete.forEach(apt => {
        console.log(`[Cleanup] Soft-deleted appointment: ${apt.id} (Date: ${apt.appointment_date})`);
      });
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Soft-deleted ${appointmentsToDelete?.length || 0} cancelled appointments`,
        deletedCount: appointmentsToDelete?.length || 0
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
    
  } catch (error) {
    console.error('[Cleanup] Cleanup job failed:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});