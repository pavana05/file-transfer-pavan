import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, ArrowLeft, Crown, Zap, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { RazorpayCheckout } from '@/components/payments/RazorpayCheckout';
import { PurchaseConfirmationDialog } from '@/components/payments/PurchaseConfirmationDialog';
import { PaymentSuccessDialog } from '@/components/payments/PaymentSuccessDialog';

interface PremiumPlan {
  id: string;
  name: string;
  slug: string;
  price_inr: number;
  file_size_limit: number;
  expiration_days: number | null;
  features: string[];
  is_active: boolean;
}

const Pricing = () => {
  const [plans, setPlans] = useState<PremiumPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [userPlan, setUserPlan] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PremiumPlan | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [purchasedPlan, setPurchasedPlan] = useState<PremiumPlan | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<{ orderId?: string; paymentId?: string }>({});
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadPlans();
    if (user) {
      checkUserPlan();
    }
  }, [user]);

  const loadPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('premium_plans')
        .select('*')
        .eq('is_active', true)
        .order('price_inr', { ascending: true });

      if (error) throw error;
      
      // Parse features JSON
      const parsedPlans = (data || []).map(plan => ({
        ...plan,
        features: Array.isArray(plan.features) ? plan.features : JSON.parse(plan.features as string)
      }));
      
      setPlans(parsedPlans);
    } catch (error) {
      console.error('Error loading plans:', error);
      toast({
        title: "Error",
        description: "Failed to load pricing plans",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const checkUserPlan = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .rpc('get_user_premium_plan', { p_user_id: user.id });
      
      if (data && data.length > 0) {
        setUserPlan(data[0].plan_name);
      }
    } catch (error) {
      console.error('Error checking user plan:', error);
    }
  };

  const handleSelectPlan = (plan: PremiumPlan) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to purchase a premium plan",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }
    setSelectedPlan(plan);
    setShowConfirmation(true);
  };

  const handleConfirmPurchase = () => {
    setShowConfirmation(false);
    setShowCheckout(true);
  };

  const handleCancelPurchase = () => {
    setShowConfirmation(false);
    setSelectedPlan(null);
  };

  const handlePaymentSuccess = (orderId?: string, paymentId?: string) => {
    setShowCheckout(false);
    setPurchasedPlan(selectedPlan);
    setPaymentDetails({ orderId, paymentId });
    setSelectedPlan(null);
    checkUserPlan();
  };

  const handlePaymentError = (error: string) => {
    setShowCheckout(false);
    setSelectedPlan(null);
    toast({
      title: "Payment Failed",
      description: error,
      variant: "destructive"
    });
  };

  const handleSuccessDialogClose = () => {
    setPurchasedPlan(null);
    setPaymentDetails({});
  };

  const formatPrice = (priceInPaise: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(priceInPaise / 100);
  };

  const formatFileSize = (bytes: number) => {
    return `${Math.round(bytes / (1024 * 1024 * 1024))}GB`;
  };

  const getPlanIcon = (slug: string) => {
    switch (slug) {
      case 'pro':
        return <Zap className="w-6 h-6" />;
      case 'business':
        return <Crown className="w-6 h-6" />;
      default:
        return <Shield className="w-6 h-6" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>
          {user ? (
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {userPlan ? `${userPlan} Plan` : 'Free Plan'}
            </Badge>
          ) : (
            <Link to="/auth">
              <Button variant="outline" size="sm">Login</Button>
            </Link>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 md:py-20">
        {/* Hero Section */}
        <div className="text-center mb-12 md:mb-16">
          <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary border-primary/20">
            One-time Payment
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Upgrade Your File Sharing
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Choose a plan that fits your needs. Pay once, enjoy forever. No subscriptions, no hidden fees.
          </p>
        </div>

        {/* Free Plan */}
        <div className="max-w-5xl mx-auto mb-8">
          <Card className="border-border/50 bg-card/50">
            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-muted-foreground" />
                <CardTitle className="text-xl">Free Plan</CardTitle>
              </div>
              <CardDescription>Perfect for getting started</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground pb-4">
              <span className="flex items-center gap-1"><Check className="w-4 h-4 text-primary" /> 1GB file limit</span>
              <span className="flex items-center gap-1"><Check className="w-4 h-4 text-primary" /> 7-day expiration</span>
              <span className="flex items-center gap-1"><Check className="w-4 h-4 text-primary" /> PIN sharing</span>
              <span className="flex items-center gap-1"><Check className="w-4 h-4 text-primary" /> Collection uploads</span>
            </CardContent>
          </Card>
        </div>

        {/* Premium Plans */}
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={plan.id} 
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                index === 1 
                  ? 'border-primary/50 shadow-lg shadow-primary/10' 
                  : 'border-border/50'
              } ${userPlan === plan.name ? 'ring-2 ring-primary' : ''}`}
            >
              {index === 1 && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-bl-lg">
                  Most Popular
                </div>
              )}
              
              <CardHeader className="text-center pb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className={`p-2 rounded-lg ${index === 1 ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {getPlanIcon(plan.slug)}
                  </div>
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{formatPrice(plan.price_inr)}</span>
                  <span className="text-muted-foreground ml-2">one-time</span>
                </div>
                <CardDescription className="mt-2">
                  {formatFileSize(plan.file_size_limit)} file limit • {plan.expiration_days ? `${plan.expiration_days}-day` : 'Unlimited'} expiration
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3 pb-6">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </CardContent>

              <CardFooter className="pt-0">
                {userPlan === plan.name ? (
                  <Button className="w-full" disabled>
                    Current Plan
                  </Button>
                ) : (
                  <Button 
                    className={`w-full ${index === 1 ? '' : 'variant-outline'}`}
                    variant={index === 1 ? 'default' : 'outline'}
                    onClick={() => handleSelectPlan(plan)}
                  >
                    Get {plan.name}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground mb-4">Secure payment powered by</p>
          <div className="flex items-center justify-center gap-6 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span className="text-sm font-medium">Razorpay</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5" />
              <span className="text-sm">256-bit SSL</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5" />
              <span className="text-sm">PCI Compliant</span>
            </div>
          </div>
        </div>
      </main>

      {/* Purchase Confirmation Dialog */}
      {selectedPlan && (
        <PurchaseConfirmationDialog
          plan={selectedPlan}
          open={showConfirmation}
          onConfirm={handleConfirmPurchase}
          onCancel={handleCancelPurchase}
        />
      )}

      {/* Razorpay Checkout Modal */}
      {selectedPlan && showCheckout && (
        <RazorpayCheckout
          plan={selectedPlan}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
          onClose={() => {
            setShowCheckout(false);
            setSelectedPlan(null);
          }}
        />
      )}

      {/* Payment Success Dialog */}
      {purchasedPlan && (
        <PaymentSuccessDialog
          plan={purchasedPlan}
          open={!!purchasedPlan}
          onClose={handleSuccessDialogClose}
          orderId={paymentDetails.orderId}
          paymentId={paymentDetails.paymentId}
        />
      )}
    </div>
  );
};

export default Pricing;
