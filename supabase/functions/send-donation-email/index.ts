import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DonationEmailRequest {
  email: string;
  name: string;
  amount: string;
  donationDate: string;
  paymentId: string;
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

    const { email, name, amount, donationDate, paymentId }: DonationEmailRequest = await req.json();

    console.log("Sending donation thank you email to:", email);

    const emailResponse = await resend.emails.send({
      from: "FileShare Pro <onboarding@resend.dev>",
      to: [email],
      subject: `💖 Thank You for Your Generous Support! - FileShare Pro`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: linear-gradient(135deg, #ec4899 0%, #f43f5e 50%, #ef4444 100%); border-radius: 16px 16px 0 0; padding: 50px 30px; text-align: center;">
              <div style="font-size: 60px; margin-bottom: 16px;">💖</div>
              <h1 style="margin: 0; color: white; font-size: 32px; font-weight: 800;">You're Amazing!</h1>
              <p style="margin: 10px 0 0; color: rgba(255,255,255,0.95); font-size: 18px;">Thank you for your generous support</p>
            </div>
            <div style="background: white; border-radius: 0 0 16px 16px; padding: 40px 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <p style="margin: 0 0 24px; color: #374151; font-size: 18px; line-height: 1.6;">Hi ${name}! 👋</p>
              <p style="margin: 0 0 30px; color: #374151; font-size: 16px; line-height: 1.8;">Your support means the world to us!</p>
              <div style="background: linear-gradient(135deg, #fdf4ff 0%, #fce7f3 100%); border: 2px solid #f9a8d4; border-radius: 16px; padding: 30px; margin-bottom: 30px;">
                <p style="margin: 0 0 16px; color: #be185d; font-size: 12px; text-transform: uppercase; font-weight: 700; letter-spacing: 1px;">Donation Receipt</p>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr><td style="padding: 12px 0; color: #6b7280; font-size: 14px;">Amount</td><td style="padding: 12px 0; color: #111827; font-size: 20px; font-weight: 800; text-align: right;">${amount}</td></tr>
                  <tr><td style="padding: 12px 0; color: #6b7280; font-size: 14px;">Date</td><td style="padding: 12px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${donationDate}</td></tr>
                  <tr><td style="padding: 12px 0; color: #6b7280; font-size: 14px;">Transaction ID</td><td style="padding: 12px 0; color: #111827; font-size: 12px; font-weight: 500; text-align: right; font-family: monospace;">${paymentId}</td></tr>
                </table>
              </div>
              <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6; text-align: center;">With gratitude, The FileShare Pro Team</p>
            </div>
            <div style="text-align: center; padding: 30px 20px;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">© ${new Date().getFullYear()} FileShare Pro. Made with ❤️</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Donation email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, ...emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending donation email:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
