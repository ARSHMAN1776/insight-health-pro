import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Get allowed origin from environment or use default
const ALLOWED_ORIGIN = Deno.env.get("ALLOWED_ORIGIN") || "https://fdllddffiihycbtgawbr.lovableproject.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
};

interface ContactEmailRequest {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

// ============= Input Sanitization =============
function sanitizeString(input: string | undefined | null, maxLength: number = 1000): string {
  if (!input || typeof input !== 'string') return '';
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/`/g, '&#x60;')
    .replace(/\$/g, '&#x24;');
}

function sanitizeEmail(email: string): string {
  if (!email || typeof email !== 'string') return '';
  // Basic email sanitization - lowercase, trim, max length
  const sanitized = email.trim().toLowerCase().slice(0, 255);
  // Remove any potentially dangerous characters for email headers
  return sanitized.replace(/[\r\n\t]/g, '');
}

function sanitizePhone(phone: string | undefined): string {
  if (!phone) return '';
  // Only allow digits, +, -, spaces, parentheses
  return phone.replace(/[^\d\+\-\s\(\)]/g, '').slice(0, 20);
}

function validateEmail(email: string): boolean {
  // RFC 5322 simplified email regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email) && email.length <= 255;
}

function validateName(name: string): boolean {
  // Name should be 1-100 chars, letters, spaces, hyphens, apostrophes
  return /^[a-zA-Z\s\-']{1,100}$/.test(name);
}

function escapeHtml(text: string): string {
  // Additional HTML escape for template rendering
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/\n/g, '<br>');
}

// Simple rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 5; // max 5 emails per minute per IP

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);
  
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }
  
  entry.count++;
  return true;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST method
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }

  try {
    // Rate limiting
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    if (!checkRateLimit(clientIp)) {
      console.warn(`[Contact Email] Rate limit exceeded for IP: ${clientIp}`);
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        {
          status: 429,
          headers: { 
            "Content-Type": "application/json", 
            ...corsHeaders,
            "Retry-After": "60"
          },
        }
      );
    }

    const rawBody: ContactEmailRequest = await req.json();

    // Sanitize all inputs
    const name = sanitizeString(rawBody.name, 100);
    const email = sanitizeEmail(rawBody.email);
    const phone = sanitizePhone(rawBody.phone);
    const subject = sanitizeString(rawBody.subject, 200);
    const message = sanitizeString(rawBody.message, 5000);

    console.log("[Contact Email] Received contact form submission from:", email);

    // Validate required fields
    if (!name || !email || !subject || !message) {
      console.error("[Contact Email] Missing required fields");
      return new Response(
        JSON.stringify({ error: "Missing required fields: name, email, subject, message" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Validate email format
    if (!validateEmail(email)) {
      console.error("[Contact Email] Invalid email format:", email);
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Validate name format
    if (!validateName(name)) {
      console.error("[Contact Email] Invalid name format");
      return new Response(
        JSON.stringify({ error: "Invalid name format. Use only letters, spaces, hyphens, and apostrophes (1-100 characters)" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Validate message length
    if (message.length < 10) {
      return new Response(
        JSON.stringify({ error: "Message must be at least 10 characters" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Escape HTML for safe rendering in email
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safePhone = phone ? escapeHtml(phone) : '';
    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message);

    // Send email to the hospital admin
    const adminEmailResponse = await resend.emails.send({
      from: "HealthCare HMS <onboarding@resend.dev>",
      to: ["arshmanrasool75@gmail.com"],
      subject: `New Contact Form: ${safeSubject}`,
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
                  ${safeName}
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #dee2e6;">
                  <strong style="color: #495057;">Email:</strong>
                </td>
                <td style="padding: 12px 0; border-bottom: 1px solid #dee2e6; color: #212529;">
                  <a href="mailto:${safeEmail}" style="color: #4F46E5;">${safeEmail}</a>
                </td>
              </tr>
              ${safePhone ? `
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #dee2e6;">
                  <strong style="color: #495057;">Phone:</strong>
                </td>
                <td style="padding: 12px 0; border-bottom: 1px solid #dee2e6; color: #212529;">
                  ${safePhone}
                </td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #dee2e6;">
                  <strong style="color: #495057;">Subject:</strong>
                </td>
                <td style="padding: 12px 0; border-bottom: 1px solid #dee2e6; color: #212529;">
                  ${safeSubject}
                </td>
              </tr>
            </table>
            
            <div style="margin-top: 20px;">
              <strong style="color: #495057;">Message:</strong>
              <div style="background: white; padding: 15px; border-radius: 8px; margin-top: 10px; border: 1px solid #dee2e6; color: #212529; line-height: 1.6;">
                ${safeMessage}
              </div>
            </div>
          </div>
          
          <p style="text-align: center; color: #6c757d; font-size: 12px; margin-top: 20px;">
            This email was sent from your HealthCare HMS contact form.
          </p>
        </div>
      `,
    });

    console.log("[Contact Email] Admin email sent successfully:", adminEmailResponse);

    // Send confirmation email to the user
    const userEmailResponse = await resend.emails.send({
      from: "HealthCare HMS <onboarding@resend.dev>",
      to: [email], // Use original sanitized email, not HTML-escaped
      subject: "Thank you for contacting us!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #4F46E5, #7C3AED); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Thank You, ${safeName}!</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
            <p style="color: #212529; font-size: 16px; line-height: 1.6;">
              We have received your message and our team will get back to you within 24 hours.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #dee2e6;">
              <p style="color: #495057; margin: 0 0 10px 0;"><strong>Your message:</strong></p>
              <p style="color: #6c757d; margin: 0; font-style: italic;">"${safeMessage}"</p>
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

    console.log("[Contact Email] User confirmation email sent successfully:", userEmailResponse);

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
    console.error("[Contact Email] Error in send-contact-email function:", error);
    // Don't expose internal error details
    return new Response(
      JSON.stringify({ error: "Failed to send email. Please try again later." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);