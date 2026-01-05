import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle } from 'lucide-react';

interface PremiumPlan {
  id: string;
  name: string;
  slug: string;
  price_inr: number;
  file_size_limit: number;
  expiration_days: number | null;
  features: string[];
}

interface RazorpayCheckoutProps {
  plan: PremiumPlan;
  onSuccess: (orderId?: string, paymentId?: string) => void;
  onError: (error: string) => void;
  onClose: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const RazorpayCheckout = ({ plan, onSuccess, onError, onClose }: RazorpayCheckoutProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, session } = useAuth();

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => initializePayment();
    script.onerror = () => {
      setError('Failed to load payment gateway');
      setLoading(false);
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const initializePayment = async () => {
    if (!session?.access_token) {
      setError('Please login to continue');
      setLoading(false);
      return;
    }

    try {
      // Create order via edge function
      const { data, error: invokeError } = await supabase.functions.invoke('razorpay', {
        body: {
          plan_id: plan.id,
          amount: plan.price_inr
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        },
        method: 'POST'
      });

      // Manually add query param since invoke doesn't support it well
      const response = await fetch(
        `https://zbvwodqcvotrfokadwyo.supabase.co/functions/v1/razorpay?action=create-order`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpidndvZHFjdm90cmZva2Fkd3lvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NzcwMDgsImV4cCI6MjA2NzA1MzAwOH0.2JhIGFjWU-gT6CspuGTqYnkXuu_GJ6IhWwLN6AqdIVA'
          },
          body: JSON.stringify({
            plan_id: plan.id,
            amount: plan.price_inr
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create order');
      }

      const orderData = await response.json();

      // Open Razorpay checkout
      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'FileShare Premium',
        description: `${plan.name} Plan - One-time Payment`,
        order_id: orderData.order_id,
        prefill: {
          email: user?.email || ''
        },
        theme: {
          color: '#1e40af'
        },
        handler: async function(response: any) {
          // Verify payment
          try {
            const verifyResponse = await fetch(
              `https://zbvwodqcvotrfokadwyo.supabase.co/functions/v1/razorpay?action=verify-payment`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${session.access_token}`,
                  'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpidndvZHFjdm90cmZva2Fkd3lvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NzcwMDgsImV4cCI6MjA2NzA1MzAwOH0.2JhIGFjWU-gT6CspuGTqYnkXuu_GJ6IhWwLN6AqdIVA'
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature
                })
              }
            );

            if (!verifyResponse.ok) {
              const errorData = await verifyResponse.json();
              throw new Error(errorData.error || 'Payment verification failed');
            }

            onSuccess(response.razorpay_order_id, response.razorpay_payment_id);
          } catch (err: any) {
            onError(err.message || 'Payment verification failed');
          }
        },
        modal: {
          ondismiss: function() {
            onClose();
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
      setLoading(false);

    } catch (err: any) {
      console.error('Payment initialization error:', err);
      setError(err.message || 'Failed to initialize payment');
      setLoading(false);
    }
  };

  const formatPrice = (priceInPaise: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(priceInPaise / 100);
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Your Purchase</DialogTitle>
          <DialogDescription>
            {plan.name} Plan - {formatPrice(plan.price_inr)} one-time payment
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-8">
          {loading && (
            <>
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
              <p className="text-sm text-muted-foreground">Initializing payment gateway...</p>
            </>
          )}

          {error && (
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <p className="text-destructive font-medium mb-2">Payment Error</p>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
