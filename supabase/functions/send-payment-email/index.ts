import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentEmailRequest {
  type: 'confirmation' | 'reminder' | 'expiring' | 'custom';
  recipientEmail: string;
  recipientName: string;
  subject?: string;
  message?: string;
  planName?: string;
  amount?: number;
  purchaseDate?: string;
  paymentId?: string;
  expiryDate?: string;
}

const getEmailTemplate = (req: PaymentEmailRequest): { subject: string; html: string } => {
  const { type, recipientName, planName, amount, purchaseDate, paymentId, expiryDate, subject, message } = req;
  const name = recipientName || 'there';
  const formattedAmount = amount ? `₹${(amount / 100).toFixed(2)}` : '';

  switch (type) {
    case 'confirmation':
      return {
        subject: `🎉 Payment Confirmed - ${planName || 'Premium Plan'}`,
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
                <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 700;">Payment Confirmed! 🎉</h1>
                <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Welcome to ${planName || 'Premium'}</p>
              </div>
              
              <div style="background: white; border-radius: 0 0 16px 16px; padding: 40px 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                  Hi ${name},
                </p>
                
                <p style="margin: 0 0 30px; color: #374151; font-size: 16px; line-height: 1.6;">
                  Thank you for your purchase! Your payment has been successfully processed.
                </p>
                
                <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 30px;">
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Plan</td>
                      <td style="padding: 10px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${planName || 'Premium'}</td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Amount Paid</td>
                      <td style="padding: 10px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${formattedAmount}</td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Purchase Date</td>
                      <td style="padding: 10px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${purchaseDate || new Date().toLocaleDateString()}</td>
                    </tr>
                    ${paymentId ? `<tr>
                      <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Payment ID</td>
                      <td style="padding: 10px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">${paymentId}</td>
                    </tr>` : ''}
                  </table>
                </div>
                
                <div style="background: #ecfdf5; border: 1px solid #10b981; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
                  <p style="margin: 0; color: #065f46; font-size: 14px; line-height: 1.6;">
                    <strong>Your premium features are now active!</strong><br>
                    Enjoy larger file uploads, extended expiration times, and all the premium benefits.
                  </p>
                </div>
                
                <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6; text-align: center;">
                  If you have any questions, feel free to reach out to our support team.
                </p>
              </div>
              
              <div style="text-align: center; padding: 30px 20px;">
                <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                  © ${new Date().getFullYear()} FileShare Pro. All rights reserved.
                </p>
              </div>
            </div>
          </body>
          </html>
        `
      };

    case 'reminder':
      return {
        subject: `⏰ Payment Reminder - Complete Your Purchase`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <div style="background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%); border-radius: 16px 16px 0 0; padding: 40px 30px; text-align: center;">
                <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 700;">Complete Your Purchase ⏰</h1>
                <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Your ${planName || 'Premium'} plan is waiting!</p>
              </div>
              
              <div style="background: white; border-radius: 0 0 16px 16px; padding: 40px 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                  Hi ${name},
                </p>
                
                <p style="margin: 0 0 30px; color: #374151; font-size: 16px; line-height: 1.6;">
                  We noticed you started a purchase but haven't completed it yet. Your ${planName || 'Premium'} plan is still available!
                </p>
                
                <div style="background: #fffbeb; border: 1px solid #f59e0b; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
                  <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                    <strong>Don't miss out on:</strong><br>
                    • Larger file uploads<br>
                    • Extended file expiration<br>
                    • Priority support<br>
                    • And much more!
                  </p>
                </div>
                
                <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6; text-align: center;">
                  Need help? Our support team is here for you.
                </p>
              </div>
              
              <div style="text-align: center; padding: 30px 20px;">
                <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                  © ${new Date().getFullYear()} FileShare Pro. All rights reserved.
                </p>
              </div>
            </div>
          </body>
          </html>
        `
      };

    case 'expiring':
      return {
        subject: `⚠️ Your ${planName || 'Premium'} Plan is Expiring Soon`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <div style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); border-radius: 16px 16px 0 0; padding: 40px 30px; text-align: center;">
                <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 700;">Plan Expiring Soon ⚠️</h1>
                <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Renew to keep your benefits</p>
              </div>
              
              <div style="background: white; border-radius: 0 0 16px 16px; padding: 40px 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                  Hi ${name},
                </p>
                
                <p style="margin: 0 0 30px; color: #374151; font-size: 16px; line-height: 1.6;">
                  Your ${planName || 'Premium'} plan will expire on <strong>${expiryDate || 'soon'}</strong>. Renew now to continue enjoying all your premium benefits.
                </p>
                
                <div style="background: #fef2f2; border: 1px solid #dc2626; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
                  <p style="margin: 0; color: #991b1b; font-size: 14px; line-height: 1.6;">
                    <strong>What you'll lose:</strong><br>
                    • Large file upload capability<br>
                    • Extended file expiration<br>
                    • Priority support access<br>
                    • All premium features
                  </p>
                </div>
                
                <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6; text-align: center;">
                  Renew today to avoid any interruption in service.
                </p>
              </div>
              
              <div style="text-align: center; padding: 30px 20px;">
                <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                  © ${new Date().getFullYear()} FileShare Pro. All rights reserved.
                </p>
              </div>
            </div>
          </body>
          </html>
        `
      };

    case 'custom':
    default:
      return {
        subject: subject || `Message from FileShare Pro`,
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
                <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 700;">FileShare Pro</h1>
              </div>
              
              <div style="background: white; border-radius: 0 0 16px 16px; padding: 40px 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                  Hi ${name},
                </p>
                
                <div style="margin: 0 0 30px; color: #374151; font-size: 16px; line-height: 1.8; white-space: pre-wrap;">
                  ${message || ''}
                </div>
                
                <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6; text-align: center;">
                  Best regards,<br>The FileShare Pro Team
                </p>
              </div>
              
              <div style="text-align: center; padding: 30px 20px;">
                <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                  © ${new Date().getFullYear()} FileShare Pro. All rights reserved.
                </p>
              </div>
            </div>
          </body>
          </html>
        `
      };
  }
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: PaymentEmailRequest = await req.json();

    console.log("Sending payment email:", requestData.type, "to:", requestData.recipientEmail);

    const template = getEmailTemplate(requestData);

    const emailResponse = await resend.emails.send({
      from: "FileShare Pro <onboarding@resend.dev>",
      to: [requestData.recipientEmail],
      subject: template.subject,
      html: template.html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, ...emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending payment email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
