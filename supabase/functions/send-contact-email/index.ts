import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

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

    // Initialize Supabase client with service role key for DB access
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Save contact submission to database
    const { data: submissionData, error: dbError } = await supabase
      .from('contact_submissions')
      .insert({
        name,
        email,
        subject: subject || null,
        category: category || 'general',
        message,
        status: 'new'
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      // Continue with email sending even if DB fails
    } else {
      console.log("Contact submission saved to database:", submissionData?.id);
    }

    const categoryLabel = getCategoryLabel(category);

    // Check if Resend API key is available
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    if (resendApiKey) {
      try {
        // Dynamic import for Resend
        const { Resend } = await import("npm:resend@2.0.0");
        const resend = new Resend(resendApiKey);

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
                      While you wait, you might find answers in our FAQ section.
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
      } catch (emailError) {
        console.error("Email sending failed (continuing without email):", emailError);
      }
    } else {
      console.log("RESEND_API_KEY not configured - skipping email sending");
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Contact form submitted successfully",
        submissionId: submissionData?.id
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
