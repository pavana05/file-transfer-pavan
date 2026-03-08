import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PurchaseEmailRequest {
  email: string;
  name: string;
  planName: string;
  amount: string;
  purchaseDate: string;
  orderId: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate caller
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    const { email, name, planName, amount, purchaseDate, orderId }: PurchaseEmailRequest = await req.json();

    console.log("Sending purchase confirmation email to:", email);

    const emailResponse = await resend.emails.send({
      from: "FileShare <onboarding@resend.dev>",
      to: [email],
      subject: `🎉 Welcome to ${planName} - Payment Confirmed!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); border-radius: 16px 16px 0 0; padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 700;">Payment Successful! 🎉</h1>
              <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Welcome to ${planName}</p>
            </div>
            <div style="background: white; border-radius: 0 0 16px 16px; padding: 40px 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">Hi ${name || 'there'},</p>
              <p style="margin: 0 0 30px; color: #374151; font-size: 16px; line-height: 1.6;">Thank you for your purchase! Your ${planName} plan is now active.</p>
              <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 30px;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr><td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Plan</td><td style="padding: 10px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${planName}</td></tr>
                  <tr><td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Amount Paid</td><td style="padding: 10px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${amount}</td></tr>
                  <tr><td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Purchase Date</td><td style="padding: 10px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${purchaseDate}</td></tr>
                  <tr><td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Order ID</td><td style="padding: 10px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${orderId}</td></tr>
                </table>
              </div>
              <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6; text-align: center;">If you have any questions, feel free to reach out to our support team.</p>
            </div>
            <div style="text-align: center; padding: 30px 20px;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">© ${new Date().getFullYear()} FileShare. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending purchase email:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
