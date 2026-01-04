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

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get the lab test ID from request body
    const { lab_test_id, test_mode } = await req.json();
    
    if (!lab_test_id) {
      return new Response(
        JSON.stringify({ error: "lab_test_id is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Fetch the lab test with patient info
    const { data: labTest, error: fetchError } = await supabase
      .from('lab_tests')
      .select(`
        id,
        test_name,
        test_type,
        results,
        status,
        test_date,
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
        )
      `)
      .eq('id', lab_test_id)
      .single();

    if (fetchError || !labTest) {
      console.error('Error fetching lab test:', fetchError);
      return new Response(
        JSON.stringify({ error: "Lab test not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const patient = labTest.patient as any;
    const doctor = labTest.doctor as any;

    if (!patient?.email) {
      return new Response(
        JSON.stringify({ error: "Patient has no email address" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const patientName = `${patient.first_name} ${patient.last_name}`;
    const doctorName = `Dr. ${doctor.first_name} ${doctor.last_name}`;

    if (!test_mode) {
      // Send email notification
      const { error: emailError } = await resend.emails.send({
        from: "Hospital Lab <onboarding@resend.dev>",
        to: [patient.email],
        subject: `Lab Results Ready - ${labTest.test_name}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #059669, #047857); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
              .test-box { background: white; border-left: 4px solid #059669; padding: 20px; margin: 20px 0; border-radius: 4px; }
              .detail-row { margin: 10px 0; }
              .label { color: #64748b; font-size: 14px; }
              .value { font-weight: bold; font-size: 16px; }
              .footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 12px; }
              .button { display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 15px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔬 Lab Results Ready</h1>
              </div>
              <div class="content">
                <p>Dear <strong>${patientName}</strong>,</p>
                <p>Your lab test results are now available:</p>
                
                <div class="test-box">
                  <div class="detail-row">
                    <div class="label">🧪 Test Name</div>
                    <div class="value">${labTest.test_name}</div>
                  </div>
                  ${labTest.test_type ? `
                  <div class="detail-row">
                    <div class="label">📋 Test Type</div>
                    <div class="value">${labTest.test_type}</div>
                  </div>
                  ` : ''}
                  <div class="detail-row">
                    <div class="label">📅 Test Date</div>
                    <div class="value">${new Date(labTest.test_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                  </div>
                  <div class="detail-row">
                    <div class="label">👨‍⚕️ Ordered By</div>
                    <div class="value">${doctorName}</div>
                  </div>
                </div>
                
                <p>Please log in to your patient portal to view the complete results. If you have any questions about your results, please contact your healthcare provider.</p>
                
                <div class="footer">
                  <p>This is an automated notification from the Hospital Laboratory.</p>
                  <p>Please do not reply to this email.</p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `,
      });

      if (emailError) {
        console.error('Error sending email:', emailError);
        throw emailError;
      }

      // Create in-app notification
      if (patient.user_id) {
        await supabase.from('notifications').insert({
          user_id: patient.user_id,
          title: 'Lab Results Ready',
          message: `Your ${labTest.test_name} results are now available. Please check your lab tests section.`,
          type: 'lab_results',
          priority: 'high',
          action_url: '/lab-tests',
          metadata: {
            lab_test_id: labTest.id,
            test_name: labTest.test_name,
            doctor_name: doctorName,
          },
        });
      }
    }

    console.log(`Lab results notification sent for test ${lab_test_id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Lab results notification sent",
        test_mode 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in send-lab-results-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
