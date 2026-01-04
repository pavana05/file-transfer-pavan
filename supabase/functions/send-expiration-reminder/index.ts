import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Checking for expiring plans...");

    // Get all completed purchases with expiration_days that are about to expire (1 day before)
    const { data: expiringPurchases, error: fetchError } = await supabase
      .from('premium_purchases')
      .select(`
        id,
        user_id,
        purchased_at,
        amount_inr,
        status,
        premium_plans (
          name,
          expiration_days
        )
      `)
      .eq('status', 'completed')
      .not('premium_plans.expiration_days', 'is', null);

    if (fetchError) {
      console.error("Error fetching purchases:", fetchError);
      throw fetchError;
    }

    console.log(`Found ${expiringPurchases?.length || 0} purchases with expiration`);

    const emailsSent: string[] = [];

    for (const purchase of expiringPurchases || []) {
      if (!purchase.purchased_at || !purchase.premium_plans) continue;

      const purchaseDate = new Date(purchase.purchased_at);
      const expirationDays = (purchase.premium_plans as any).expiration_days;
      const planName = (purchase.premium_plans as any).name;
      
      if (!expirationDays) continue;

      const expirationDate = new Date(purchaseDate);
      expirationDate.setDate(expirationDate.getDate() + expirationDays);
      
      const now = new Date();
      const daysRemaining = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      // Send reminder when 1 day remaining or on expiration day
      if (daysRemaining <= 1 && daysRemaining >= 0) {
        // Get user email
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(purchase.user_id);
        
        if (userError || !userData?.user?.email) {
          console.error("Error fetching user:", userError);
          continue;
        }

        const userEmail = userData.user.email;
        const isExpired = daysRemaining <= 0;

        console.log(`Sending ${isExpired ? 'expiration' : 'reminder'} email to: ${userEmail}`);

        const subject = isExpired 
          ? `⚠️ Your ${planName} Plan Has Expired`
          : `⏰ Your ${planName} Plan Expires Tomorrow!`;

        const message = isExpired
          ? `Your ${planName} plan has expired. Renew now to continue enjoying premium features.`
          : `Your ${planName} plan expires in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}. Renew now to keep your premium benefits.`;

        try {
          await resend.emails.send({
            from: "FileShare <onboarding@resend.dev>",
            to: [userEmail],
            subject: subject,
            html: `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
              </head>
              <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
                <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                  <div style="background: ${isExpired ? 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)' : 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)'}; border-radius: 16px 16px 0 0; padding: 40px 30px; text-align: center;">
                    <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 700;">
                      ${isExpired ? 'Plan Expired ⚠️' : 'Plan Expiring Soon ⏰'}
                    </h1>
                    <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">${planName} Plan</p>
                  </div>
                  
                  <div style="background: white; border-radius: 0 0 16px 16px; padding: 40px 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                      Hi there,
                    </p>
                    
                    <p style="margin: 0 0 30px; color: #374151; font-size: 16px; line-height: 1.6;">
                      ${message}
                    </p>
                    
                    <div style="background: ${isExpired ? '#fef2f2' : '#fefce8'}; border: 1px solid ${isExpired ? '#fecaca' : '#fef08a'}; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
                      <p style="margin: 0; color: ${isExpired ? '#991b1b' : '#854d0e'}; font-size: 14px; line-height: 1.6;">
                        <strong>${isExpired ? 'What you\'ll lose:' : 'Don\'t lose your benefits:'}</strong><br>
                        • Larger file upload limits<br>
                        • Extended file expiration<br>
                        • Password protection for files<br>
                        • Priority support
                      </p>
                    </div>
                    
                    <div style="text-align: center; margin-bottom: 30px;">
                      <a href="https://your-app-url.com/pricing" style="display: inline-block; background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                        Renew Now
                      </a>
                    </div>
                    
                    <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6; text-align: center;">
                      If you have any questions, feel free to reach out to our support team.
                    </p>
                  </div>
                  
                  <div style="text-align: center; padding: 30px 20px;">
                    <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                      © ${new Date().getFullYear()} FileShare. All rights reserved.
                    </p>
                  </div>
                </div>
              </body>
              </html>
            `,
          });

          emailsSent.push(userEmail);
          console.log(`Email sent successfully to ${userEmail}`);
        } catch (emailError) {
          console.error(`Failed to send email to ${userEmail}:`, emailError);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailsSent: emailsSent.length,
        recipients: emailsSent 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in expiration reminder function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
