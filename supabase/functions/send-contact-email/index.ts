import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactEmailRequest {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, phone, subject, message }: ContactEmailRequest = await req.json();

    console.log("Received contact form submission:", { name, email, subject });

    // Validate required fields
    if (!name || !email || !subject || !message) {
      console.error("Missing required fields");
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Send email to the hospital admin
    const adminEmailResponse = await resend.emails.send({
      from: "HealthCare HMS <onboarding@resend.dev>",
      to: ["arshmanrasool75@gmail.com"],
      subject: `New Contact Form: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #4F46E5, #7C3AED); padding: 30px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">New Contact Form Submission</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #dee2e6;">
                  <strong style="color: #495057;">Name:</strong>
                </td>
                <td style="padding: 12px 0; border-bottom: 1px solid #dee2e6; color: #212529;">
                  ${name}
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #dee2e6;">
                  <strong style="color: #495057;">Email:</strong>
                </td>
                <td style="padding: 12px 0; border-bottom: 1px solid #dee2e6; color: #212529;">
                  <a href="mailto:${email}" style="color: #4F46E5;">${email}</a>
                </td>
              </tr>
              ${phone ? `
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #dee2e6;">
                  <strong style="color: #495057;">Phone:</strong>
                </td>
                <td style="padding: 12px 0; border-bottom: 1px solid #dee2e6; color: #212529;">
                  ${phone}
                </td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #dee2e6;">
                  <strong style="color: #495057;">Subject:</strong>
                </td>
                <td style="padding: 12px 0; border-bottom: 1px solid #dee2e6; color: #212529;">
                  ${subject}
                </td>
              </tr>
            </table>
            
            <div style="margin-top: 20px;">
              <strong style="color: #495057;">Message:</strong>
              <div style="background: white; padding: 15px; border-radius: 8px; margin-top: 10px; border: 1px solid #dee2e6; color: #212529; line-height: 1.6;">
                ${message.replace(/\n/g, '<br>')}
              </div>
            </div>
          </div>
          
          <p style="text-align: center; color: #6c757d; font-size: 12px; margin-top: 20px;">
            This email was sent from your HealthCare HMS contact form.
          </p>
        </div>
      `,
    });

    console.log("Admin email sent successfully:", adminEmailResponse);

    // Send confirmation email to the user
    const userEmailResponse = await resend.emails.send({
      from: "HealthCare HMS <onboarding@resend.dev>",
      to: [email],
      subject: "Thank you for contacting us!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #4F46E5, #7C3AED); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Thank You, ${name}!</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
            <p style="color: #212529; font-size: 16px; line-height: 1.6;">
              We have received your message and our team will get back to you within 24 hours.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #dee2e6;">
              <p style="color: #495057; margin: 0 0 10px 0;"><strong>Your message:</strong></p>
              <p style="color: #6c757d; margin: 0; font-style: italic;">"${message}"</p>
            </div>
            
            <p style="color: #212529; font-size: 16px; line-height: 1.6;">
              If you have any urgent inquiries, please don't hesitate to call us at <strong>+1 (555) 123-4567</strong>.
            </p>
            
            <p style="color: #212529; font-size: 16px; margin-top: 20px;">
              Best regards,<br>
              <strong>The HealthCare HMS Team</strong>
            </p>
          </div>
          
          <p style="text-align: center; color: #6c757d; font-size: 12px; margin-top: 20px;">
            © ${new Date().getFullYear()} HealthCare HMS. All rights reserved.
          </p>
        </div>
      `,
    });

    console.log("User confirmation email sent successfully:", userEmailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Emails sent successfully" 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
