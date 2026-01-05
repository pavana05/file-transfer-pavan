import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, ArrowLeft, Crown, Zap, Shield, Star, Sparkles, Lock, CreditCard, Gift } from 'lucide-react';
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
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-primary/40 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/8 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-0 w-72 h-72 bg-primary/3 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
        
        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-primary/20 rounded-full animate-bounce"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + i * 0.5}s`
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="relative border-b border-border/40 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link 
            to="/" 
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-all duration-300 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>
          {user ? (
            <Badge 
              variant="secondary" 
              className="bg-primary/10 text-primary border border-primary/20 animate-fade-in"
            >
              {userPlan ? `${userPlan} Plan` : 'Free Plan'}
            </Badge>
          ) : (
            <Link to="/auth">
              <Button variant="outline" size="sm" className="hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                Login
              </Button>
            </Link>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="relative container mx-auto px-4 py-12 md:py-20">
        {/* Hero Section */}
        <div className="text-center mb-16 md:mb-20 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 animate-scale-in">
            <Gift className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Limited Time Offer</span>
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight">
            <span className="bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
              Upgrade Your
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
              File Sharing Experience
            </span>
          </h1>
          
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Choose a plan that fits your needs. Pay once, enjoy forever. 
            <span className="text-primary font-medium"> No subscriptions, no hidden fees.</span>
          </p>
        </div>

        {/* Free Plan */}
        <div className="max-w-5xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <Card className="relative border-border/50 bg-gradient-to-br from-card via-card to-muted/30 overflow-hidden group hover:shadow-lg transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <CardHeader className="text-center pb-4 relative">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-muted">
                  <Shield className="w-5 h-5 text-muted-foreground" />
                </div>
                <CardTitle className="text-xl">Free Plan</CardTitle>
              </div>
              <CardDescription className="text-base">Perfect for getting started with basic file sharing</CardDescription>
            </CardHeader>
            
            <CardContent className="flex flex-wrap justify-center gap-4 text-sm pb-6 relative">
              {[
                { icon: Check, text: '1GB file limit' },
                { icon: Check, text: '7-day expiration' },
                { icon: Check, text: 'PIN sharing' },
                { icon: Check, text: 'Collection uploads' }
              ].map((item, i) => (
                <span 
                  key={i} 
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 text-muted-foreground"
                >
                  <item.icon className="w-4 h-4 text-primary" />
                  {item.text}
                </span>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Premium Plans */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={plan.id} 
              className={`relative overflow-hidden transition-all duration-500 group animate-fade-in ${
                index === 1 
                  ? 'border-primary/50 shadow-xl shadow-primary/10 scale-[1.02] md:scale-105' 
                  : 'border-border/50 hover:border-primary/30'
              } ${userPlan === plan.name ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}
              style={{ animationDelay: `${0.3 + index * 0.15}s` }}
            >
              {/* Background gradient */}
              <div className={`absolute inset-0 transition-opacity duration-500 ${
                index === 1 
                  ? 'bg-gradient-to-br from-primary/10 via-primary/5 to-transparent' 
                  : 'bg-gradient-to-br from-muted/50 via-transparent to-transparent opacity-0 group-hover:opacity-100'
              }`} />
              
              {/* Popular badge */}
              {index === 1 && (
                <div className="absolute -top-px -right-px">
                  <div className="relative">
                    <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-bl-xl rounded-tr-lg flex items-center gap-1.5 shadow-lg">
                      <Star className="w-3 h-3 fill-current" />
                      Most Popular
                    </div>
                    <div className="absolute inset-0 bg-primary/50 blur-md -z-10" />
                  </div>
                </div>
              )}
              
              <CardHeader className="text-center pb-8 relative">
                <div className="flex items-center justify-center mb-4">
                  <div className={`p-4 rounded-2xl transition-all duration-300 group-hover:scale-110 ${
                    index === 1 
                      ? 'bg-gradient-to-br from-primary/20 to-primary/5 text-primary shadow-lg shadow-primary/20' 
                      : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                  }`}>
                    {getPlanIcon(plan.slug)}
                  </div>
                </div>
                
                <CardTitle className="text-2xl md:text-3xl mb-2">{plan.name}</CardTitle>
                
                <div className="mt-4 space-y-1">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className={`text-5xl md:text-6xl font-black tracking-tight ${
                      index === 1 ? 'text-primary' : ''
                    }`}>
                      {formatPrice(plan.price_inr)}
                    </span>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={`${
                      index === 1 
                        ? 'bg-primary/10 text-primary border-primary/20' 
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    One-time payment
                  </Badge>
                </div>
                
                <CardDescription className="mt-4 text-base">
                  {formatFileSize(plan.file_size_limit)} file limit • {plan.expiration_days ? `${plan.expiration_days}-day` : 'Unlimited'} expiration
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 pb-8 relative">
                {plan.features.map((feature, i) => (
                  <div 
                    key={i} 
                    className="flex items-center gap-3 group/item"
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                      index === 1 
                        ? 'bg-primary/10 text-primary' 
                        : 'bg-muted text-muted-foreground group-hover/item:bg-primary/10 group-hover/item:text-primary'
                    }`}>
                      <Check className="w-4 h-4" />
                    </div>
                    <span className="text-sm md:text-base">{feature}</span>
                  </div>
                ))}
              </CardContent>

              <CardFooter className="pt-0 relative">
                {userPlan === plan.name ? (
                  <Button 
                    className="w-full h-12 text-base font-semibold" 
                    disabled
                  >
                    <Check className="w-5 h-5 mr-2" />
                    Current Plan
                  </Button>
                ) : (
                  <Button 
                    className={`w-full h-12 text-base font-semibold transition-all duration-300 ${
                      index === 1 
                        ? 'bg-gradient-to-r from-primary via-primary to-primary/90 hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5' 
                        : 'hover:bg-primary hover:text-primary-foreground'
                    }`}
                    variant={index === 1 ? 'default' : 'outline'}
                    onClick={() => handleSelectPlan(plan)}
                  >
                    Get {plan.name}
                    <Sparkles className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-20 text-center animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <p className="text-sm text-muted-foreground mb-6 font-medium">Secure payment powered by</p>
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {[
              { icon: Shield, text: 'Razorpay', highlight: true },
              { icon: Lock, text: '256-bit SSL' },
              { icon: CreditCard, text: 'PCI Compliant' },
              { icon: Check, text: 'Money-back Guarantee' }
            ].map((item, i) => (
              <div 
                key={i}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                  item.highlight 
                    ? 'bg-primary/10 text-primary border border-primary/20' 
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Teaser */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground">
            Have questions? <Link to="/#faq" className="text-primary hover:underline font-medium">Check our FAQ</Link>
          </p>
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