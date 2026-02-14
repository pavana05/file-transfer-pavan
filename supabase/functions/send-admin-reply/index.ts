import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AdminReplyRequest {
  contactId: string;
  recipientName: string;
  recipientEmail: string;
  subject: string;
  message: string;
  templateType: 'custom' | 'acknowledgment' | 'resolution' | 'follow_up';
}

const getEmailTemplate = (
  templateType: string,
  recipientName: string,
  subject: string,
  message: string,
  originalSubject?: string
): string => {
  const year = new Date().getFullYear();
  
  const baseTemplate = (content: string, accentColor: string = '#6366f1') => `
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
          <td style="background: linear-gradient(135deg, ${accentColor} 0%, ${accentColor}dd 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">FileShare Pro</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Support Team Response</p>
          </td>
        </tr>
        
        <!-- Content -->
        <tr>
          <td style="padding: 40px 30px;">
            ${content}
          </td>
        </tr>
        
        <!-- Footer -->
        <tr>
          <td style="background-color: #f4f4f5; padding: 30px; text-align: center; border-top: 1px solid #e4e4e7;">
            <p style="color: #71717a; font-size: 13px; margin: 0 0 10px 0;">
              Best regards,<br>
              <strong style="color: #18181b;">The FileShare Pro Support Team</strong>
            </p>
            <p style="color: #a1a1aa; font-size: 12px; margin: 15px 0 0 0;">
              Need further assistance? Reply to this email or visit our support center.
            </p>
            <p style="color: #a1a1aa; font-size: 12px; margin: 10px 0 0 0;">
              © ${year} FileShare Pro. All rights reserved.
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  switch (templateType) {
    case 'acknowledgment':
      return baseTemplate(`
        <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 12px; padding: 20px; margin-bottom: 30px; text-align: center;">
          <span style="font-size: 48px;">📬</span>
          <h2 style="color: #0369a1; margin: 15px 0 5px 0; font-size: 20px;">We're Looking Into It!</h2>
        </div>
        
        <h2 style="color: #18181b; margin: 0 0 20px 0; font-size: 22px;">Hello ${recipientName}! 👋</h2>
        
        <p style="color: #52525b; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
          Thank you for reaching out to us. We wanted to let you know that your inquiry has been received and assigned to our support team.
        </p>
        
        ${originalSubject ? `
        <div style="background-color: #f4f4f5; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
          <p style="color: #71717a; font-size: 13px; margin: 0 0 8px 0;">Regarding your inquiry:</p>
          <p style="color: #18181b; font-size: 15px; font-weight: 500; margin: 0;">${originalSubject}</p>
        </div>
        ` : ''}
        
        <div style="background-color: #fefce8; border-left: 4px solid #eab308; padding: 15px 20px; margin-bottom: 25px; border-radius: 0 8px 8px 0;">
          <p style="color: #854d0e; font-size: 14px; margin: 0; line-height: 1.5;">
            ${message || "We typically respond within 24-48 hours. In the meantime, you can browse our FAQ section for quick answers to common questions."}
          </p>
        </div>
        
        <p style="color: #52525b; font-size: 14px; line-height: 1.6; margin: 0;">
          We appreciate your patience and look forward to resolving your inquiry.
        </p>
      `, '#0369a1');

    case 'resolution':
      return baseTemplate(`
        <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 12px; padding: 20px; margin-bottom: 30px; text-align: center;">
          <span style="font-size: 48px;">✅</span>
          <h2 style="color: #166534; margin: 15px 0 5px 0; font-size: 20px;">Issue Resolved!</h2>
        </div>
        
        <h2 style="color: #18181b; margin: 0 0 20px 0; font-size: 22px;">Hello ${recipientName}! 👋</h2>
        
        <p style="color: #52525b; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
          Great news! We've resolved the issue you reported. Here's a summary of what was done:
        </p>
        
        <div style="background-color: #f4f4f5; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
          <h3 style="color: #18181b; margin: 0 0 15px 0; font-size: 16px; font-weight: 600;">Resolution Details</h3>
          <p style="color: #52525b; font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${message}</p>
        </div>
        
        <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 15px 20px; margin-bottom: 25px; border-radius: 0 8px 8px 0;">
          <p style="color: #166534; font-size: 14px; margin: 0; line-height: 1.5;">
            <strong>Need more help?</strong> Feel free to reply to this email if you have any follow-up questions!
          </p>
        </div>
      `, '#16a34a');

    case 'follow_up':
      return baseTemplate(`
        <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; padding: 20px; margin-bottom: 30px; text-align: center;">
          <span style="font-size: 48px;">🔔</span>
          <h2 style="color: #92400e; margin: 15px 0 5px 0; font-size: 20px;">Quick Follow-Up</h2>
        </div>
        
        <h2 style="color: #18181b; margin: 0 0 20px 0; font-size: 22px;">Hello ${recipientName}! 👋</h2>
        
        <p style="color: #52525b; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
          We wanted to follow up on your recent inquiry with FileShare Pro. We need a bit more information to help you better.
        </p>
        
        <div style="background-color: #f4f4f5; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
          <h3 style="color: #18181b; margin: 0 0 15px 0; font-size: 16px; font-weight: 600;">Our Message</h3>
          <p style="color: #52525b; font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${message}</p>
        </div>
        
        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px 20px; margin-bottom: 25px; border-radius: 0 8px 8px 0;">
          <p style="color: #92400e; font-size: 14px; margin: 0; line-height: 1.5;">
            <strong>Please reply</strong> at your earliest convenience so we can continue assisting you.
          </p>
        </div>
      `, '#d97706');

    case 'custom':
    default:
      return baseTemplate(`
        <h2 style="color: #18181b; margin: 0 0 20px 0; font-size: 22px;">Hello ${recipientName}! 👋</h2>
        
        <div style="background-color: #f4f4f5; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
          <p style="color: #52525b; font-size: 15px; line-height: 1.7; margin: 0; white-space: pre-wrap;">${message}</p>
        </div>
        
        <p style="color: #52525b; font-size: 14px; line-height: 1.6; margin: 0;">
          If you have any questions, feel free to reply to this email.
        </p>
      `);
  }
};

const handler = async (req: Request): Promise<Response> => {
  console.log("Admin reply function invoked");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify admin authorization
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the user is an admin using the JWT token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error("Auth error:", authError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if user has admin role
    const { data: isAdmin, error: roleError } = await supabase.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin'
    });

    if (roleError || !isAdmin) {
      console.error("Role check failed:", roleError);
      return new Response(
        JSON.stringify({ error: "Forbidden - Admin access required" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { 
      contactId, 
      recipientName, 
      recipientEmail, 
      subject, 
      message, 
      templateType 
    }: AdminReplyRequest = await req.json();

    console.log(`Sending admin reply to: ${recipientName} <${recipientEmail}>`);
    console.log(`Template: ${templateType}, Subject: ${subject}`);

    // Validate required fields
    if (!recipientEmail || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: recipientEmail, message" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get original contact submission for context
    let originalSubject = '';
    if (contactId) {
      const { data: contact } = await supabase
        .from('contact_submissions')
        .select('subject')
        .eq('id', contactId)
        .single();
      originalSubject = contact?.subject || '';
    }

    // Check if Resend API key is available
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Send the email
    const { Resend } = await import("npm:resend@2.0.0");
    const resend = new Resend(resendApiKey);

    const htmlContent = getEmailTemplate(templateType, recipientName, subject, message, originalSubject);

    const emailResponse = await resend.emails.send({
      from: "FileShare Pro Support <onboarding@resend.dev>",
      to: [recipientEmail],
      subject: subject || `Re: Your FileShare Pro Inquiry`,
      html: htmlContent,
    });

    console.log("Admin reply email sent:", emailResponse);

    // Update contact submission status to 'resolved' and set replied_at
    if (contactId) {
      await supabase
        .from('contact_submissions')
        .update({ 
          status: 'resolved', 
          replied_at: new Date().toISOString() 
        })
        .eq('id', contactId);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Reply sent successfully",
        emailId: emailResponse?.data?.id
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-admin-reply function:", error);
    console.error("Error details:", error.message);
    return new Response(
      JSON.stringify({ error: "An internal error occurred" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
