import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { createHmac } from "https://deno.land/std@0.190.0/crypto/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID')!;
const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET')!;

interface CreateOrderRequest {
  plan_id: string;
  amount: number;
}

interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get auth user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid authorization token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    if (action === 'create-order') {
      const body: CreateOrderRequest = await req.json();
      console.log('Creating order for user:', user.id, 'plan:', body.plan_id);

      // Create Razorpay order
      const orderData = {
        amount: body.amount, // Amount in paise
        currency: 'INR',
        receipt: `order_${Date.now()}`,
        notes: {
          user_id: user.id,
          plan_id: body.plan_id
        }
      };

      const razorpayAuth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);
      const orderResponse = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${razorpayAuth}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });

      if (!orderResponse.ok) {
        const errorText = await orderResponse.text();
        console.error('Razorpay order creation failed:', errorText);
        return new Response(
          JSON.stringify({ error: 'Failed to create order' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const order = await orderResponse.json();
      console.log('Razorpay order created:', order.id);

      // Store order in database
      const { error: insertError } = await supabase
        .from('premium_purchases')
        .insert({
          user_id: user.id,
          plan_id: body.plan_id,
          razorpay_order_id: order.id,
          amount_inr: body.amount,
          status: 'pending'
        });

      if (insertError) {
        console.error('Failed to store order:', insertError);
        return new Response(
          JSON.stringify({ error: 'Failed to store order' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({
          order_id: order.id,
          amount: order.amount,
          currency: order.currency,
          key_id: RAZORPAY_KEY_ID
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'verify-payment') {
      const body: VerifyPaymentRequest = await req.json();
      console.log('Verifying payment:', body.razorpay_order_id);

      // Verify signature
      const text = `${body.razorpay_order_id}|${body.razorpay_payment_id}`;
      const encoder = new TextEncoder();
      const keyData = encoder.encode(RAZORPAY_KEY_SECRET);
      const messageData = encoder.encode(text);
      
      const key = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      
      const signature = await crypto.subtle.sign('HMAC', key, messageData);
      const generatedSignature = Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      if (generatedSignature !== body.razorpay_signature) {
        console.error('Signature verification failed');
        return new Response(
          JSON.stringify({ error: 'Invalid payment signature' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Signature verified successfully');

      // Get purchase details for email
      const { data: purchaseData } = await supabase
        .from('premium_purchases')
        .select(`
          amount_inr,
          premium_plans (name)
        `)
        .eq('razorpay_order_id', body.razorpay_order_id)
        .single();

      // Update purchase record
      const { error: updateError } = await supabase
        .from('premium_purchases')
        .update({
          razorpay_payment_id: body.razorpay_payment_id,
          razorpay_signature: body.razorpay_signature,
          status: 'completed',
          purchased_at: new Date().toISOString()
        })
        .eq('razorpay_order_id', body.razorpay_order_id)
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Failed to update purchase:', updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to update purchase record' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Payment verified and recorded for user:', user.id);

      // Send confirmation email
      try {
        const planName = (purchaseData as any)?.premium_plans?.name || 'Premium';
        const amount = new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          minimumFractionDigits: 0
        }).format(((purchaseData as any)?.amount_inr || 0) / 100);

        const emailResponse = await fetch(
          `${supabaseUrl}/functions/v1/send-purchase-email`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseServiceKey}`
            },
            body: JSON.stringify({
              email: user.email,
              name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
              planName,
              amount,
              purchaseDate: new Date().toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }),
              orderId: body.razorpay_order_id
            })
          }
        );

        if (!emailResponse.ok) {
          console.error('Failed to send confirmation email:', await emailResponse.text());
        } else {
          console.log('Confirmation email sent successfully');
        }
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError);
        // Don't fail the payment verification if email fails
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Payment verified successfully' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
