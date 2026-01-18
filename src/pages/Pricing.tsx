import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, ArrowLeft, Crown, Zap, Shield, Star, Sparkles, Lock, CreditCard, Gift, ChevronRight, Users, FileUp, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { RazorpayCheckout } from '@/components/payments/RazorpayCheckout';
import { PurchaseConfirmationDialog } from '@/components/payments/PurchaseConfirmationDialog';
import { PaymentSuccessDialog } from '@/components/payments/PaymentSuccessDialog';
import { motion } from 'framer-motion';

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
    // Convert paise to rupees (divide by 100)
    const priceInRupees = priceInPaise / 100;
    return `₹${priceInRupees.toLocaleString('en-IN')}`;
  };

  const formatFileSize = (bytes: number) => {
    return `${Math.round(bytes / (1024 * 1024 * 1024))}GB`;
  };

  const getPlanIcon = (slug: string) => {
    switch (slug) {
      case 'pro':
        return <Zap className="w-7 h-7" />;
      case 'business':
        return <Crown className="w-7 h-7" />;
      default:
        return <Shield className="w-7 h-7" />;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Premium Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-tl from-accent/10 via-primary/5 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-gradient-to-r from-primary/5 to-transparent rounded-full blur-3xl" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary)/0.03)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/0.03)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
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
              className="bg-gradient-to-r from-primary/10 to-accent/10 text-primary border border-primary/20 px-4 py-1.5"
            >
              {userPlan ? `${userPlan} Plan` : 'Free Plan'}
            </Badge>
          ) : (
            <Link to="/auth">
              <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-lg shadow-primary/25">
                Get Started
              </Button>
            </Link>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="relative container mx-auto px-4 py-16 md:py-24">
        <motion.div 
          variants={containerVariants} 
          initial="hidden" 
          animate="visible"
          className="space-y-16"
        >
          {/* Hero Section */}
          <motion.div variants={itemVariants} className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 mb-8">
              <Gift className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Special Launch Offer</span>
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight tracking-tight">
              <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                Choose Your
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
                Perfect Plan
              </span>
            </h1>
            
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Unlock powerful features for seamless file sharing.
              <span className="text-foreground font-medium"> One-time payment, lifetime access.</span>
            </p>
          </motion.div>

          {/* Stats Row */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { icon: Users, value: '10K+', label: 'Active Users' },
              { icon: FileUp, value: '1M+', label: 'Files Shared' },
              { icon: Shield, value: '99.9%', label: 'Uptime' },
              { icon: Clock, value: '24/7', label: 'Support' },
            ].map((stat, i) => (
              <div key={i} className="text-center p-4 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm">
                <stat.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </motion.div>

          {/* Free Plan */}
          <motion.div variants={itemVariants} className="max-w-5xl mx-auto">
            <Card className="relative border-border/50 bg-gradient-to-br from-card via-card to-muted/20 overflow-hidden group hover:shadow-xl hover:shadow-primary/5 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <CardHeader className="text-center pb-6 relative">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="p-3 rounded-2xl bg-muted border border-border/50">
                    <Shield className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-2xl">Free Forever</CardTitle>
                </div>
                <CardDescription className="text-base">Great for personal use and getting started</CardDescription>
              </CardHeader>
              
              <CardContent className="flex flex-wrap justify-center gap-3 pb-8 relative">
                {[
                  { icon: Check, text: '1GB per file' },
                  { icon: Check, text: '7-day expiration' },
                  { icon: Check, text: 'Secure PIN sharing' },
                  { icon: Check, text: 'Collection uploads' }
                ].map((item, i) => (
                  <span 
                    key={i} 
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted/50 border border-border/30 text-sm text-foreground"
                  >
                    <item.icon className="w-4 h-4 text-success" />
                    {item.text}
                  </span>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Premium Plans */}
          <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => {
              const isPopular = index === 1 || plan.slug === 'business';
              
              return (
                <Card 
                  key={plan.id} 
                  className={`relative overflow-hidden transition-all duration-500 group ${
                    isPopular 
                      ? 'border-primary shadow-2xl shadow-primary/20 scale-[1.02] md:scale-105' 
                      : 'border-border/50 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10'
                  } ${userPlan === plan.name ? 'ring-2 ring-success ring-offset-2 ring-offset-background' : ''}`}
                >
                  {/* Background gradient */}
                  <div className={`absolute inset-0 transition-opacity duration-500 ${
                    isPopular 
                      ? 'bg-gradient-to-br from-primary/10 via-primary/5 to-accent/5' 
                      : 'bg-gradient-to-br from-muted/50 via-transparent to-transparent opacity-0 group-hover:opacity-100'
                  }`} />
                  
                  {/* Popular badge */}
                  {isPopular && (
                    <div className="absolute -top-px -right-px">
                      <div className="relative">
                        <div className="bg-gradient-to-r from-primary to-accent text-primary-foreground text-xs font-bold px-5 py-2 rounded-bl-2xl rounded-tr-lg flex items-center gap-2 shadow-lg">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          Most Popular
                        </div>
                        <div className="absolute inset-0 bg-primary/50 blur-lg -z-10" />
                      </div>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-8 relative pt-8">
                    <div className="flex items-center justify-center mb-6">
                      <div className={`p-5 rounded-3xl transition-all duration-300 group-hover:scale-110 ${
                        isPopular 
                          ? 'bg-gradient-to-br from-primary/20 to-accent/10 text-primary shadow-xl shadow-primary/25' 
                          : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                      }`}>
                        {getPlanIcon(plan.slug)}
                      </div>
                    </div>
                    
                    <CardTitle className="text-3xl mb-2">{plan.name}</CardTitle>
                    
                    <div className="mt-6 space-y-2">
                      <div className="flex items-baseline justify-center gap-1">
                        <span className={`text-5xl md:text-6xl font-black tracking-tight ${
                          isPopular ? 'bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent' : 'text-foreground'
                        }`}>
                          {formatPrice(plan.price_inr)}
                        </span>
                      </div>
                      <Badge 
                        className={`${
                          isPopular 
                            ? 'bg-gradient-to-r from-primary/10 to-accent/10 text-primary border-primary/20' 
                            : 'bg-muted text-muted-foreground border-border/50'
                        }`}
                      >
                        One-time payment
                      </Badge>
                    </div>
                    
                    <CardDescription className="mt-6 text-base flex items-center justify-center gap-4">
                      <span className="flex items-center gap-1.5">
                        <FileUp className="w-4 h-4 text-primary" />
                        {formatFileSize(plan.file_size_limit)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-primary" />
                        {plan.expiration_days ? `${plan.expiration_days} days` : 'Unlimited'}
                      </span>
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4 pb-8 relative">
                    {plan.features.map((feature, i) => (
                      <div 
                        key={i} 
                        className="flex items-center gap-3 group/item"
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                          isPopular 
                            ? 'bg-success/10 text-success' 
                            : 'bg-muted text-muted-foreground group-hover/item:bg-success/10 group-hover/item:text-success'
                        }`}>
                          <Check className="w-4 h-4" />
                        </div>
                        <span className="text-sm md:text-base text-foreground">{feature}</span>
                      </div>
                    ))}
                  </CardContent>

                  <CardFooter className="pt-0 pb-8 relative">
                    {userPlan === plan.name ? (
                      <Button 
                        className="w-full h-14 text-lg font-bold bg-success/10 text-success border border-success/20 hover:bg-success/20" 
                        disabled
                      >
                        <Check className="w-5 h-5 mr-2" />
                        Current Plan
                      </Button>
                    ) : (
                      <Button 
                        className={`w-full h-14 text-lg font-bold transition-all duration-300 ${
                          isPopular 
                            ? 'bg-gradient-to-r from-primary via-primary to-accent hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-1' 
                            : 'border-2 border-primary/50 bg-transparent text-primary hover:bg-primary hover:text-primary-foreground'
                        }`}
                        variant={isPopular ? 'default' : 'outline'}
                        onClick={() => handleSelectPlan(plan)}
                      >
                        Get {plan.name}
                        <ChevronRight className="w-5 h-5 ml-2" />
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </motion.div>

          {/* Trust Indicators */}
          <motion.div variants={itemVariants} className="text-center">
            <p className="text-sm text-muted-foreground mb-8 font-medium">Secure payment powered by</p>
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
              {[
                { icon: Shield, text: 'Razorpay', primary: true },
                { icon: Lock, text: '256-bit SSL' },
                { icon: CreditCard, text: 'PCI Compliant' },
                { icon: Check, text: '100% Secure' }
              ].map((item, i) => (
                <div 
                  key={i}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 ${
                    item.primary 
                      ? 'bg-gradient-to-r from-primary/10 to-accent/10 text-primary border border-primary/20' 
                      : 'bg-muted/50 text-muted-foreground border border-border/50 hover:border-primary/20 hover:text-foreground'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* FAQ Teaser */}
          <motion.div variants={itemVariants} className="text-center pb-8">
            <Card className="max-w-xl mx-auto p-6 bg-gradient-to-br from-muted/50 to-transparent border-border/50">
              <p className="text-muted-foreground">
                Have questions? <Link to="/#faq" className="text-primary hover:underline font-semibold">Check our FAQ</Link>
              </p>
            </Card>
          </motion.div>
        </motion.div>
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