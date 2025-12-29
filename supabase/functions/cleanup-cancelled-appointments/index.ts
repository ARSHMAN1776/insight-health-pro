import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting cancelled appointments cleanup job...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Calculate the cutoff time (1 hour ago)
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
    const cutoffTime = oneHourAgo.toISOString();
    
    console.log(`Looking for cancelled appointments updated before: ${cutoffTime}`);
    
    // Find cancelled appointments that were cancelled more than 1 hour ago
    // and haven't been soft-deleted yet
    const { data: appointmentsToDelete, error: fetchError } = await supabase
      .from('appointments')
      .select('id, patient_id, appointment_date, appointment_time, status, updated_at')
      .eq('status', 'cancelled')
      .is('deleted_at', null)
      .lt('updated_at', cutoffTime);
    
    if (fetchError) {
      console.error('Error fetching appointments:', fetchError);
      throw fetchError;
    }
    
    console.log(`Found ${appointmentsToDelete?.length || 0} cancelled appointments to soft-delete`);
    
    if (appointmentsToDelete && appointmentsToDelete.length > 0) {
      // Soft delete the appointments by setting deleted_at
      const appointmentIds = appointmentsToDelete.map(a => a.id);
      
      const { error: updateError } = await supabase
        .from('appointments')
        .update({ deleted_at: new Date().toISOString() })
        .in('id', appointmentIds);
      
      if (updateError) {
        console.error('Error soft-deleting appointments:', updateError);
        throw updateError;
      }
      
      console.log(`Successfully soft-deleted ${appointmentIds.length} cancelled appointments`);
      
      // Log details of deleted appointments
      appointmentsToDelete.forEach(apt => {
        console.log(`Soft-deleted appointment: ${apt.id} (Patient: ${apt.patient_id}, Date: ${apt.appointment_date})`);
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
    console.error('Cleanup job failed:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
