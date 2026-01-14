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
  subject: string;
  category: string;
  message: string;
}

const getCategoryLabel = (category: string): string => {
  const categories: Record<string, string> = {
    general: 'General Inquiry',
    support: 'Technical Support',
    bug: 'Bug Report',
    feature: 'Feature Request',
  };
  return categories[category] || 'General Inquiry';
};

const handler = async (req: Request): Promise<Response> => {
  console.log("Contact email function invoked");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, subject, category, message }: ContactEmailRequest = await req.json();

    console.log(`Processing contact form from: ${name} <${email}>`);
    console.log(`Category: ${category}, Subject: ${subject}`);

    // Validate required fields
    if (!name || !email || !message) {
      console.error("Missing required fields");
      return new Response(
        JSON.stringify({ error: "Missing required fields: name, email, message" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error("Invalid email format");
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const categoryLabel = getCategoryLabel(category);

    // Send confirmation email to the user
    const userEmailResponse = await resend.emails.send({
      from: "FileShare Pro <onboarding@resend.dev>",
      to: [email],
      subject: "We received your message!",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <!-- Header -->
            <tr>
              <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">FileShare Pro</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Secure File Sharing Platform</p>
              </td>
            </tr>
            
            <!-- Content -->
            <tr>
              <td style="padding: 40px 30px;">
                <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 12px; padding: 20px; margin-bottom: 30px; text-align: center;">
                  <span style="font-size: 48px;">✅</span>
                  <h2 style="color: #166534; margin: 15px 0 5px 0; font-size: 20px;">Message Received!</h2>
                  <p style="color: #15803d; margin: 0; font-size: 14px;">We'll get back to you within 24-48 hours</p>
                </div>
                
                <h2 style="color: #18181b; margin: 0 0 20px 0; font-size: 22px;">Hello ${name}! 👋</h2>
                
                <p style="color: #52525b; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                  Thank you for reaching out to us. We've received your message and our support team is reviewing it now.
                </p>
                
                <!-- Message Summary -->
                <div style="background-color: #f4f4f5; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
                  <h3 style="color: #18181b; margin: 0 0 15px 0; font-size: 16px; font-weight: 600;">Your Message Summary</h3>
                  
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding: 8px 0; border-bottom: 1px solid #e4e4e7;">
                        <span style="color: #71717a; font-size: 13px;">Category</span><br>
                        <span style="color: #18181b; font-size: 15px; font-weight: 500;">${categoryLabel}</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; border-bottom: 1px solid #e4e4e7;">
                        <span style="color: #71717a; font-size: 13px;">Subject</span><br>
                        <span style="color: #18181b; font-size: 15px; font-weight: 500;">${subject || 'No subject'}</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0;">
                        <span style="color: #71717a; font-size: 13px;">Message</span><br>
                        <span style="color: #18181b; font-size: 14px; line-height: 1.5;">${message}</span>
                      </td>
                    </tr>
                  </table>
                </div>
                
                <p style="color: #52525b; font-size: 14px; line-height: 1.6; margin: 0;">
                  While you wait, you might find answers in our <a href="#" style="color: #6366f1; text-decoration: none; font-weight: 500;">FAQ section</a>.
                </p>
              </td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td style="background-color: #f4f4f5; padding: 30px; text-align: center; border-top: 1px solid #e4e4e7;">
                <p style="color: #71717a; font-size: 13px; margin: 0 0 10px 0;">
                  Best regards,<br>
                  <strong style="color: #18181b;">The FileShare Pro Team</strong>
                </p>
                <p style="color: #a1a1aa; font-size: 12px; margin: 0;">
                  © ${new Date().getFullYear()} FileShare Pro. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    console.log("User confirmation email sent:", userEmailResponse);

    // Send notification to admin/support team
    const adminEmailResponse = await resend.emails.send({
      from: "FileShare Pro <onboarding@resend.dev>",
      to: ["support@fileshare.pro"], // This will go to resend's test inbox in dev mode
      subject: `[${categoryLabel}] New Contact Form: ${subject || 'No Subject'}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <!-- Header -->
            <tr>
              <td style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">📬 New Contact Form Submission</h1>
              </td>
            </tr>
            
            <!-- Content -->
            <tr>
              <td style="padding: 30px;">
                <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 8px; padding: 15px; margin-bottom: 20px;">
                  <strong style="color: #92400e;">Category:</strong>
                  <span style="color: #78350f; margin-left: 8px;">${categoryLabel}</span>
                </div>
                
                <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; border-radius: 8px; padding: 20px;">
                  <tr>
                    <td style="padding: 10px 20px; border-bottom: 1px solid #e4e4e7;">
                      <strong style="color: #71717a; font-size: 12px; text-transform: uppercase;">From</strong><br>
                      <span style="color: #18181b; font-size: 16px;">${name}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 20px; border-bottom: 1px solid #e4e4e7;">
                      <strong style="color: #71717a; font-size: 12px; text-transform: uppercase;">Email</strong><br>
                      <a href="mailto:${email}" style="color: #6366f1; font-size: 16px; text-decoration: none;">${email}</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 20px; border-bottom: 1px solid #e4e4e7;">
                      <strong style="color: #71717a; font-size: 12px; text-transform: uppercase;">Subject</strong><br>
                      <span style="color: #18181b; font-size: 16px;">${subject || 'No subject provided'}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 20px;">
                      <strong style="color: #71717a; font-size: 12px; text-transform: uppercase;">Message</strong><br>
                      <p style="color: #18181b; font-size: 15px; line-height: 1.6; margin: 10px 0 0 0; white-space: pre-wrap;">${message}</p>
                    </td>
                  </tr>
                </table>
                
                <div style="margin-top: 25px; text-align: center;">
                  <a href="mailto:${email}" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                    Reply to ${name}
                  </a>
                </div>
              </td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td style="background-color: #18181b; padding: 20px; text-align: center;">
                <p style="color: #71717a; font-size: 12px; margin: 0;">
                  Submitted at: ${new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}
                </p>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    console.log("Admin notification email sent:", adminEmailResponse);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Contact form submitted successfully",
        userEmail: userEmailResponse,
        adminEmail: adminEmailResponse
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
