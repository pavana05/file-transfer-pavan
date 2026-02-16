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

const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 255;
const MAX_SUBJECT_LENGTH = 200;
const MAX_MESSAGE_LENGTH = 5000;
const MAX_CATEGORY_LENGTH = 50;
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 3600000; // 1 hour

const handler = async (req: Request): Promise<Response> => {
  console.log("Contact email function invoked");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, subject, category, message }: ContactEmailRequest = await req.json();

    // Validate required fields
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: name, email, message" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate input lengths
    if (name.length > MAX_NAME_LENGTH || email.length > MAX_EMAIL_LENGTH ||
        (subject && subject.length > MAX_SUBJECT_LENGTH) ||
        message.length > MAX_MESSAGE_LENGTH ||
        (category && category.length > MAX_CATEGORY_LENGTH)) {
      return new Response(
        JSON.stringify({ error: "Input exceeds maximum allowed length" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate category against allowed values
    const allowedCategories = ['general', 'support', 'bug', 'feature'];
    const safeCategory = (category && allowedCategories.includes(category)) ? category : 'general';

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Rate limiting: max 5 submissions per email per hour
    const oneHourAgo = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
    const { count, error: countError } = await supabase
      .from('contact_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('email', email)
      .gte('created_at', oneHourAgo);

    if (!countError && count !== null && count >= RATE_LIMIT_MAX) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Save contact submission to database
    const { data: submissionData, error: dbError } = await supabase
      .from('contact_submissions')
      .insert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        subject: subject ? subject.trim() : null,
        category: safeCategory,
        message: message.trim(),
        status: 'new'
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
    } else {
      console.log("Contact submission saved:", submissionData?.id);
    }

    const categoryLabel = getCategoryLabel(safeCategory);

    // Send email if Resend is configured
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    if (resendApiKey) {
      try {
        const { Resend } = await import("npm:resend@2.0.0");
        const resend = new Resend(resendApiKey);

        // Escape HTML in user content to prevent XSS in emails
        const escapeHtml = (str: string) => str
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');

        const safeName = escapeHtml(name.trim());
        const safeSubject = escapeHtml(subject?.trim() || 'No subject');
        const safeMessage = escapeHtml(message.trim());

        await resend.emails.send({
          from: "FileShare Pro <onboarding@resend.dev>",
          to: [email.trim()],
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
                <tr>
                  <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">FileShare Pro</h1>
                    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Secure File Sharing Platform</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px 30px;">
                    <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 12px; padding: 20px; margin-bottom: 30px; text-align: center;">
                      <span style="font-size: 48px;">✅</span>
                      <h2 style="color: #166534; margin: 15px 0 5px 0; font-size: 20px;">Message Received!</h2>
                      <p style="color: #15803d; margin: 0; font-size: 14px;">We'll get back to you within 24-48 hours</p>
                    </div>
                    <h2 style="color: #18181b; margin: 0 0 20px 0; font-size: 22px;">Hello ${safeName}! 👋</h2>
                    <p style="color: #52525b; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                      Thank you for reaching out to us. We've received your message and our support team is reviewing it now.
                    </p>
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
                            <span style="color: #18181b; font-size: 15px; font-weight: 500;">${safeSubject}</span>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0;">
                            <span style="color: #71717a; font-size: 13px;">Message</span><br>
                            <span style="color: #18181b; font-size: 14px; line-height: 1.5;">${safeMessage}</span>
                          </td>
                        </tr>
                      </table>
                    </div>
                    <p style="color: #52525b; font-size: 14px; line-height: 1.6; margin: 0;">
                      While you wait, you might find answers in our FAQ section.
                    </p>
                  </td>
                </tr>
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

        console.log("User confirmation email sent");
      } catch (emailError) {
        console.error("Email sending failed:", emailError);
      }
    } else {
      console.log("RESEND_API_KEY not configured - skipping email");
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Contact form submitted successfully",
        submissionId: submissionData?.id
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred processing your request." }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
