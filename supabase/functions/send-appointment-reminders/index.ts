import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AppointmentReminder {
  id: string;
  patient_name: string;
  patient_email: string;
  doctor_name: string;
  appointment_date: string;
  appointment_time: string;
  type: string;
  department_name?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const now = new Date();
    
    // Get request body for optional parameters
    let hoursAhead = 24; // Default 24 hours
    let testMode = false;
    
    if (req.method === "POST") {
      try {
        const body = await req.json();
        hoursAhead = body.hours_ahead || 24;
        testMode = body.test_mode || false;
      } catch {
        // Use defaults
      }
    }

    // Calculate the time window for reminders
    const reminderStart = new Date(now.getTime() + (hoursAhead - 1) * 60 * 60 * 1000);
    const reminderEnd = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000);
    
    console.log(`Checking for appointments between ${reminderStart.toISOString()} and ${reminderEnd.toISOString()}`);

    // Fetch upcoming appointments that need reminders
    const targetDate = reminderStart.toISOString().split('T')[0];
    const targetTimeStart = reminderStart.toTimeString().slice(0, 8);
    const targetTimeEnd = reminderEnd.toTimeString().slice(0, 8);

    const { data: appointments, error: fetchError } = await supabase
      .from('appointments')
      .select(`
        id,
        appointment_date,
        appointment_time,
        type,
        status,
        patient:patients!inner(
          id,
          first_name,
          last_name,
          email,
          user_id
        ),
        doctor:doctors!inner(
          first_name,
          last_name
        ),
        department:departments(
          department_name
        )
      `)
      .eq('appointment_date', targetDate)
      .gte('appointment_time', targetTimeStart)
      .lt('appointment_time', targetTimeEnd)
      .in('status', ['scheduled', 'confirmed'])
      .is('deleted_at', null);

    if (fetchError) {
      console.error('Error fetching appointments:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${appointments?.length || 0} appointments to send reminders for`);

    if (!appointments || appointments.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No appointments requiring reminders',
          count: 0 
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const results: { success: boolean; appointment_id: string; error?: string }[] = [];

    for (const apt of appointments) {
      const patient = apt.patient as any;
      const doctor = apt.doctor as any;
      const department = apt.department as any;

      if (!patient?.email) {
        console.log(`Skipping appointment ${apt.id} - no patient email`);
        results.push({ success: false, appointment_id: apt.id, error: 'No patient email' });
        continue;
      }

      const patientName = `${patient.first_name} ${patient.last_name}`;
      const doctorName = `Dr. ${doctor.first_name} ${doctor.last_name}`;
      const departmentName = department?.department_name || '';

      // Format date and time nicely
      const appointmentDate = new Date(apt.appointment_date + 'T' + apt.appointment_time);
      const formattedDate = appointmentDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      const formattedTime = apt.appointment_time.slice(0, 5);

      try {
        if (!testMode) {
          // Send email
          const { error: emailError } = await resend.emails.send({
            from: "Hospital <onboarding@resend.dev>",
            to: [patient.email],
            subject: `Appointment Reminder - ${formattedDate}`,
            html: `
              <!DOCTYPE html>
              <html>
              <head>
                <style>
                  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { background: linear-gradient(135deg, #0891b2, #0e7490); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                  .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
                  .appointment-box { background: white; border-left: 4px solid #0891b2; padding: 20px; margin: 20px 0; border-radius: 4px; }
                  .detail-row { margin: 10px 0; }
                  .label { color: #64748b; font-size: 14px; }
                  .value { font-weight: bold; font-size: 16px; }
                  .footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 12px; }
                  .button { display: inline-block; background: #0891b2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 15px; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1>🏥 Appointment Reminder</h1>
                  </div>
                  <div class="content">
                    <p>Dear <strong>${patientName}</strong>,</p>
                    <p>This is a friendly reminder of your upcoming appointment:</p>
                    
                    <div class="appointment-box">
                      <div class="detail-row">
                        <div class="label">📅 Date</div>
                        <div class="value">${formattedDate}</div>
                      </div>
                      <div class="detail-row">
                        <div class="label">⏰ Time</div>
                        <div class="value">${formattedTime}</div>
                      </div>
                      <div class="detail-row">
                        <div class="label">👨‍⚕️ Doctor</div>
                        <div class="value">${doctorName}</div>
                      </div>
                      ${departmentName ? `
                      <div class="detail-row">
                        <div class="label">🏢 Department</div>
                        <div class="value">${departmentName}</div>
                      </div>
                      ` : ''}
                      <div class="detail-row">
                        <div class="label">📋 Type</div>
                        <div class="value">${apt.type || 'General Consultation'}</div>
                      </div>
                    </div>
                    
                    <p><strong>Please remember to:</strong></p>
                    <ul>
                      <li>Arrive 15 minutes before your scheduled time</li>
                      <li>Bring your ID and insurance card</li>
                      <li>Bring any relevant medical records or test results</li>
                    </ul>
                    
                    <p>If you need to cancel or reschedule, please do so at least 24 hours in advance.</p>
                    
                    <div class="footer">
                      <p>This is an automated reminder from the Hospital Management System.</p>
                      <p>Please do not reply to this email.</p>
                    </div>
                  </div>
                </div>
              </body>
              </html>
            `,
          });

          if (emailError) {
            console.error(`Error sending email for appointment ${apt.id}:`, emailError);
            results.push({ success: false, appointment_id: apt.id, error: emailError.message });
            continue;
          }

          // Create in-app notification
          if (patient.user_id) {
            await supabase.from('notifications').insert({
              user_id: patient.user_id,
              title: 'Appointment Reminder',
              message: `You have an appointment with ${doctorName} on ${formattedDate} at ${formattedTime}.`,
              type: 'appointment_reminder',
              priority: 'high',
              action_url: '/dashboard',
              metadata: {
                appointment_id: apt.id,
                doctor_name: doctorName,
                appointment_date: apt.appointment_date,
                appointment_time: apt.appointment_time,
              },
            });
          }
        }

        console.log(`Reminder sent successfully for appointment ${apt.id}`);
        results.push({ success: true, appointment_id: apt.id });

      } catch (error: any) {
        console.error(`Error processing appointment ${apt.id}:`, error);
        results.push({ success: false, appointment_id: apt.id, error: error.message });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Sent ${successCount} reminders, ${failCount} failed`,
        results,
        test_mode: testMode
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in send-appointment-reminders:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
