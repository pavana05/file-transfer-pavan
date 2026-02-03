import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, ArrowLeft, Crown, Zap, Shield, Star, Sparkles, Lock, CreditCard, Gift, ChevronRight, Users, FileUp, Clock, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { RazorpayCheckout } from '@/components/payments/RazorpayCheckout';
import { PurchaseConfirmationDialog } from '@/components/payments/PurchaseConfirmationDialog';
import { PaymentSuccessDialog } from '@/components/payments/PaymentSuccessDialog';
import { ThemeToggle } from '@/components/ui/theme-toggle';
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
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary)/0.03)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/0.03)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      {/* Header */}
      <header className="relative border-b border-border/40 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <Link 
            to="/" 
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-all duration-300 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="text-sm font-medium hidden sm:inline">Back to Home</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            {user ? (
              <Badge 
                variant="secondary" 
                className="bg-gradient-to-r from-primary/10 to-accent/10 text-primary border border-primary/20 px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm"
              >
                {userPlan ? `${userPlan} Plan` : 'Free Plan'}
              </Badge>
            ) : (
              <Link to="/auth">
                <Button size="sm" className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-lg shadow-primary/25">
                  Get Started
                </Button>
              </Link>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative container mx-auto px-4 py-8 sm:py-12 md:py-16 lg:py-24">
        <motion.div 
          variants={containerVariants} 
          initial="hidden" 
          animate="visible"
          className="space-y-10 sm:space-y-12 lg:space-y-16"
        >
          {/* Hero Section */}
          <motion.div variants={itemVariants} className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 mb-6 sm:mb-8">
              <Gift className="w-4 h-4 text-primary" />
              <span className="text-xs sm:text-sm font-semibold text-primary">Special Launch Offer</span>
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black mb-4 sm:mb-6 leading-tight tracking-tight">
              <span className="text-foreground">Choose Your</span>
              <br />
              <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
                Perfect Plan
              </span>
            </h1>
            
            <p className="text-muted-foreground text-sm sm:text-base md:text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed px-4">
              Unlock powerful features for seamless file sharing.
              <span className="text-foreground font-medium"> One-time payment, lifetime access.</span>
            </p>
          </motion.div>

          {/* Stats Row */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
            {[
              { icon: Users, value: '10K+', label: 'Active Users' },
              { icon: FileUp, value: '1M+', label: 'Files Shared' },
              { icon: Shield, value: '99.9%', label: 'Uptime' },
              { icon: Clock, value: '24/7', label: 'Support' },
            ].map((stat, i) => (
              <motion.div 
                key={i} 
                whileHover={{ scale: 1.05 }}
                className="text-center p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm"
              >
                <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary mx-auto mb-1 sm:mb-2" />
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Free Plan */}
          <motion.div variants={itemVariants} className="max-w-5xl mx-auto">
            <Card className="relative border-border/50 bg-gradient-to-br from-card via-card to-muted/20 overflow-hidden group hover:shadow-xl hover:shadow-primary/5 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <CardHeader className="text-center pb-4 sm:pb-6 relative">
                <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-muted border border-border/50">
                    <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-xl sm:text-2xl text-foreground">Free Forever</CardTitle>
                </div>
                <CardDescription className="text-sm sm:text-base text-muted-foreground">Great for personal use and getting started</CardDescription>
              </CardHeader>
              
              <CardContent className="flex flex-wrap justify-center gap-2 sm:gap-3 pb-6 sm:pb-8 relative px-4">
                {[
                  { icon: Check, text: '1GB per file' },
                  { icon: Check, text: '7-day expiration' },
                  { icon: Check, text: 'Secure PIN sharing' },
                  { icon: Check, text: 'Collection uploads' }
                ].map((item, i) => (
                  <span 
                    key={i} 
                    className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-muted/50 border border-border/30 text-xs sm:text-sm text-foreground"
                  >
                    <item.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-success" />
                    {item.text}
                  </span>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Premium Plans */}
          <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => {
              const isPopular = index === 1 || plan.slug === 'business';
              
              return (
                <motion.div
                  key={plan.id}
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card 
                    className={`relative overflow-hidden transition-all duration-500 h-full ${
                      isPopular 
                        ? 'border-primary shadow-2xl shadow-primary/20' 
                        : 'border-border/50 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10'
                    } ${userPlan === plan.name ? 'ring-2 ring-success ring-offset-2 ring-offset-background' : ''}`}
                  >
                    {/* Background gradient */}
                    <div className={`absolute inset-0 transition-opacity duration-500 ${
                      isPopular 
                        ? 'bg-gradient-to-br from-primary/10 via-primary/5 to-accent/5' 
                        : 'bg-gradient-to-br from-muted/50 via-transparent to-transparent'
                    }`} />
                    
                    {/* Popular badge */}
                    {isPopular && (
                      <div className="absolute -top-px -right-px">
                        <div className="relative">
                          <div className="bg-gradient-to-r from-primary to-accent text-primary-foreground text-[10px] sm:text-xs font-bold px-3 sm:px-5 py-1.5 sm:py-2 rounded-bl-xl sm:rounded-bl-2xl rounded-tr-lg flex items-center gap-1.5 sm:gap-2 shadow-lg">
                            <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
                            Most Popular
                          </div>
                          <div className="absolute inset-0 bg-primary/50 blur-lg -z-10" />
                        </div>
                      </div>
                    )}
                    
                    <CardHeader className="text-center pb-6 sm:pb-8 relative pt-6 sm:pt-8">
                      <div className="flex items-center justify-center mb-4 sm:mb-6">
                        <div className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl transition-all duration-300 ${
                          isPopular 
                            ? 'bg-gradient-to-br from-primary/20 to-accent/10 text-primary shadow-xl shadow-primary/25' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {getPlanIcon(plan.slug)}
                        </div>
                      </div>
                      
                      <CardTitle className="text-2xl sm:text-3xl mb-2 text-foreground">{plan.name}</CardTitle>
                      
                      <div className="mt-4 sm:mt-6 space-y-2">
                        <div className="flex items-baseline justify-center gap-1">
                          <span className={`text-4xl sm:text-5xl md:text-6xl font-black tracking-tight ${
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
                      
                      <CardDescription className="mt-4 sm:mt-6 text-sm sm:text-base flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-muted-foreground">
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

                    <CardContent className="space-y-3 sm:space-y-4 pb-6 sm:pb-8 relative px-4 sm:px-6">
                      {plan.features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-2 sm:gap-3 group/item">
                          <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                            isPopular 
                              ? 'bg-success/10 text-success' 
                              : 'bg-muted text-muted-foreground group-hover/item:bg-success/10 group-hover/item:text-success'
                          }`}>
                            <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </div>
                          <span className="text-xs sm:text-sm md:text-base text-foreground">{feature}</span>
                        </div>
                      ))}
                    </CardContent>

                    <CardFooter className="pt-0 pb-6 sm:pb-8 relative px-4 sm:px-6">
                      {userPlan === plan.name ? (
                        <Button 
                          className="w-full h-12 sm:h-14 text-sm sm:text-lg font-bold bg-success/10 text-success border border-success/20 hover:bg-success/20" 
                          disabled
                        >
                          <Check className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                          Current Plan
                        </Button>
                      ) : (
                        <Button 
                          className={`w-full h-12 sm:h-14 text-sm sm:text-lg font-bold transition-all duration-300 ${
                            isPopular 
                              ? 'bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40' 
                              : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg'
                          }`}
                          onClick={() => handleSelectPlan(plan)}
                        >
                          Get {plan.name}
                          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Support Link */}
          <motion.div variants={itemVariants} className="text-center">
            <Link to="/support">
              <Button variant="ghost" size="lg" className="gap-2 text-muted-foreground hover:text-primary">
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500" />
                <span className="text-sm sm:text-base">Support FileShare Pro</span>
              </Button>
            </Link>
          </motion.div>

          {/* Trust Badges */}
          <motion.div variants={itemVariants} className="text-center">
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
                <span>Secure Payments</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                <span>SSL Encrypted</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-warning" />
                <span>Razorpay Protected</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* Dialogs */}
      {selectedPlan && showConfirmation && (
        <PurchaseConfirmationDialog
          plan={selectedPlan}
          open={showConfirmation}
          onConfirm={handleConfirmPurchase}
          onCancel={handleCancelPurchase}
        />
      )}

      {selectedPlan && showCheckout && (
        <RazorpayCheckout
          plan={selectedPlan}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
          onClose={() => { setShowCheckout(false); setSelectedPlan(null); }}
        />
      )}

      {purchasedPlan && (
        <PaymentSuccessDialog
          plan={purchasedPlan}
          open={!!purchasedPlan}
          orderId={paymentDetails.orderId}
          paymentId={paymentDetails.paymentId}
          onClose={handleSuccessDialogClose}
        />
      )}
    </div>
  );
};

export default Pricing;
