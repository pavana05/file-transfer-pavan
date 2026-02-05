import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, ArrowLeft, Crown, Zap, Shield, Star, Sparkles, Lock, CreditCard, Gift, ChevronRight, Users, FileUp, Clock, Heart, Rocket, Award, TrendingUp, Infinity, ArrowUpRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { RazorpayCheckout } from '@/components/payments/RazorpayCheckout';
import { PurchaseConfirmationDialog } from '@/components/payments/PurchaseConfirmationDialog';
import { PaymentSuccessDialog } from '@/components/payments/PaymentSuccessDialog';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import type { Variants } from 'framer-motion';

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
      const { data } = await supabase
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
        return <Zap className="w-8 h-8" />;
      case 'business':
        return <Crown className="w-8 h-8" />;
      default:
        return <Shield className="w-8 h-8" />;
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.1 } }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: "easeOut" } }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border/40 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Skeleton className="h-8 w-32" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <Skeleton className="h-12 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Skeleton className="h-[500px] rounded-3xl" />
            <Skeleton className="h-[500px] rounded-3xl" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 relative overflow-hidden">
      {/* Ultra Premium Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-primary/15 via-primary/5 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-gradient-to-tl from-accent/15 via-primary/5 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute top-1/2 left-10 w-[300px] h-[300px] bg-gradient-to-r from-primary/10 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s' }} />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary)/0.02)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/0.02)_1px,transparent_1px)] bg-[size:3rem_3rem]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,hsl(var(--background))_70%)]" />
      </div>

      {/* Header */}
      <header className="relative border-b border-border/40 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <motion.div whileHover={{ x: -3 }} transition={{ duration: 0.2 }}>
            <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-all duration-300 group">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:inline">Back to Home</span>
            </Link>
          </motion.div>
          <div className="flex items-center gap-2 sm:gap-4">
            {user ? (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
                <Badge variant="secondary" className="bg-gradient-to-r from-primary/10 to-accent/10 text-primary border border-primary/20 px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium shadow-sm">
                  <Sparkles className="w-3 h-3 mr-1.5" />
                  {userPlan ? `${userPlan} Plan` : 'Free Plan'}
                </Badge>
              </motion.div>
            ) : (
              <Link to="/auth">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button size="sm" className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-lg shadow-primary/25 font-semibold">
                    Get Started
                    <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </motion.div>
              </Link>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative container mx-auto px-4 py-10 sm:py-16 md:py-20 lg:py-28">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-12 sm:space-y-16 lg:space-y-20">
          
          {/* Hero Section */}
          <motion.div variants={itemVariants} className="text-center max-w-4xl mx-auto">
            <motion.div 
              className="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-primary/15 via-primary/10 to-accent/15 border border-primary/25 mb-8 sm:mb-10 shadow-lg shadow-primary/5"
              whileHover={{ scale: 1.02 }}
            >
              <Gift className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <span className="text-xs sm:text-sm font-bold text-primary tracking-wide">Special Launch Offer</span>
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary animate-pulse" />
            </motion.div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 sm:mb-8 leading-[1.1] tracking-tight">
              <span className="text-foreground">Choose Your</span>
              <br className="hidden sm:block" />
              <span className="sm:hidden"> </span>
              <span className="bg-gradient-to-r from-primary via-primary/90 to-accent bg-clip-text text-transparent">Perfect Plan</span>
            </h1>
            
            <p className="text-muted-foreground text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed px-4">
              Unlock premium features for seamless file sharing.
              <span className="text-foreground font-semibold"> One-time payment, lifetime access.</span>
            </p>
          </motion.div>

          {/* Stats Row */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto">
            {([
              { value: '10K+', label: 'Active Users' },
              { value: '1M+', label: 'Files Shared' },
              { value: '99.9%', label: 'Uptime' },
              { value: '24/7', label: 'Support' },
            ] as const).map((stat, index) => (
              <motion.div 
                key={stat.label} 
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="relative text-center p-4 sm:p-6 rounded-2xl bg-card/60 border border-border/50 backdrop-blur-sm shadow-sm hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                {index === 0 && <Users className="w-5 h-5 sm:w-6 sm:h-6 text-primary mx-auto mb-2 sm:mb-3" />}
                {index === 1 && <FileUp className="w-5 h-5 sm:w-6 sm:h-6 text-primary mx-auto mb-2 sm:mb-3" />}
                {index === 2 && <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-primary mx-auto mb-2 sm:mb-3" />}
                {index === 3 && <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-primary mx-auto mb-2 sm:mb-3" />}
                <p className="text-xl sm:text-2xl md:text-3xl font-black text-foreground">{stat.value}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground font-medium mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Free Plan */}
          <motion.div variants={itemVariants} className="max-w-5xl mx-auto">
            <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.3 }}>
              <Card className="relative border-border/50 bg-gradient-to-br from-card via-card to-muted/30 overflow-hidden group hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute top-4 right-4">
                  <Badge className="bg-muted text-muted-foreground border-border/50 font-semibold">Forever Free</Badge>
                </div>
              
                <CardHeader className="text-center pb-4 sm:pb-6 relative pt-6">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <motion.div 
                      className="p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-muted to-muted/50 border border-border/50 shadow-inner"
                      whileHover={{ rotate: [0, -5, 5, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-muted-foreground" />
                    </motion.div>
                    <CardTitle className="text-2xl sm:text-3xl text-foreground font-black">Free Plan</CardTitle>
                  </div>
                  <CardDescription className="text-sm sm:text-base text-muted-foreground">Perfect for personal use and getting started</CardDescription>
                </CardHeader>
              
                <CardContent className="flex flex-wrap justify-center gap-2 sm:gap-3 pb-8 relative px-4 sm:px-6">
                  {[
                    { text: '1GB per file' },
                    { text: '7-day expiration' },
                    { text: 'Secure PIN sharing' },
                    { text: 'Collection uploads' }
                  ].map((item, i) => (
                    <motion.span 
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted/60 border border-border/40 text-sm text-foreground font-medium shadow-sm"
                    >
                      <Check className="w-4 h-4 text-primary" />
                      {item.text}
                    </motion.span>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Premium Plans */}
          <motion.div className="grid md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => {
              const isPopular = index === 1 || plan.slug === 'business';
              
              return (
                <motion.div key={plan.id} variants={cardVariants} whileHover={{ y: -8, scale: 1.01 }} transition={{ duration: 0.35 }}>
                  <Card className={`relative overflow-hidden transition-all duration-500 h-full group ${
                    isPopular 
                      ? 'border-2 border-amber-500/50 shadow-2xl shadow-amber-500/10' 
                      : 'border border-border/50 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/10'
                  } ${userPlan === plan.name ? 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-background' : ''}`}>
                    
                    {/* Animated background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${
                      isPopular ? 'from-amber-500/15 via-orange-500/10 to-rose-500/5' : 'from-primary/10 via-primary/5 to-accent/5'
                    } opacity-60 group-hover:opacity-100 transition-opacity duration-500`} />
                    
                    {/* Shimmer */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* Popular badge */}
                    {isPopular && (
                      <div className="absolute -top-px -right-px z-10">
                        <div>
                          <div className="bg-gradient-to-r from-primary via-primary to-accent text-primary-foreground text-[10px] sm:text-xs font-bold px-4 sm:px-6 py-2 sm:py-2.5 rounded-bl-2xl rounded-tr-lg flex items-center gap-2 shadow-xl shadow-primary/30">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <span>Most Popular</span>
                            <Award className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </div>
                    )}

                    {userPlan === plan.name && (
                      <div className="absolute top-4 left-4 z-10">
                        <Badge className="bg-primary/20 text-primary border border-primary/30 font-bold shadow-lg">
                          <Check className="w-3 h-3 mr-1" />
                          Current Plan
                        </Badge>
                      </div>
                    )}
                    
                    <CardHeader className="text-center pb-6 sm:pb-8 relative pt-8 sm:pt-10">
                      <motion.div className="flex items-center justify-center mb-6" whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }} transition={{ duration: 0.4 }}>
                        <div className={`p-5 sm:p-6 rounded-3xl transition-all duration-300 shadow-xl ${
                          isPopular 
                            ? 'bg-gradient-to-br from-primary/25 via-primary/20 to-accent/15 text-primary shadow-primary/20 border border-primary/30' 
                            : 'bg-gradient-to-br from-primary/20 to-accent/10 text-primary shadow-primary/20 border border-primary/20'
                        }`}>
                          {getPlanIcon(plan.slug)}
                        </div>
                      </motion.div>
                      
                      <CardTitle className="text-2xl sm:text-3xl mb-2 text-foreground font-black">{plan.name}</CardTitle>
                      
                      <div className="mt-6 space-y-3">
                        <motion.div className="flex items-baseline justify-center gap-1" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3 + index * 0.1 }}>
                          <span className={`text-5xl sm:text-6xl font-black tracking-tight ${
                            isPopular 
                              ? 'bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent' 
                              : 'bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent'
                          }`}>
                            {formatPrice(plan.price_inr)}
                          </span>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }}>
                          <Badge className={`text-xs font-bold px-4 py-1.5 ${
                            isPopular 
                              ? 'bg-gradient-to-r from-primary/15 to-accent/15 text-primary border-primary/30' 
                              : 'bg-gradient-to-r from-primary/10 to-accent/10 text-primary border-primary/20'
                          }`}>
                            <Infinity className="w-3 h-3 mr-1" />
                            Lifetime access
                          </Badge>
                        </motion.div>
                      </div>
                      
                      <CardDescription className="mt-6 text-sm sm:text-base flex flex-wrap items-center justify-center gap-4 text-muted-foreground">
                        <span className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                          isPopular ? 'bg-primary/10 text-primary' : 'bg-primary/10 text-primary'
                        }`}>
                          <FileUp className="w-4 h-4" />
                          {formatFileSize(plan.file_size_limit)}
                        </span>
                        <span className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                          isPopular ? 'bg-primary/10 text-primary' : 'bg-primary/10 text-primary'
                        }`}>
                          <Clock className="w-4 h-4" />
                          {plan.expiration_days ? `${plan.expiration_days} days` : 'Unlimited'}
                        </span>
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-3 pb-6 sm:pb-8 relative px-5 sm:px-8">
                      {plan.features.map((feature, i) => (
                        <motion.div 
                          key={i} 
                          className="flex items-center gap-3 group/item"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + i * 0.05 }}
                          whileHover={{ x: 4 }}
                        >
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 shadow-sm ${
                            isPopular 
                                ? 'bg-primary/15 text-primary group-hover/item:bg-primary/25' 
                                : 'bg-primary/15 text-primary group-hover/item:bg-primary/25'
                          }`}>
                            <Check className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-sm sm:text-base text-foreground font-medium">{feature}</span>
                        </motion.div>
                      ))}
                    </CardContent>

                    <CardFooter className="pt-0 pb-8 relative px-5 sm:px-8">
                      {userPlan === plan.name ? (
                        <Button className="w-full h-14 text-base font-bold bg-primary/15 text-primary border-2 border-primary/30 hover:bg-primary/20 cursor-not-allowed" disabled>
                          <Check className="w-5 h-5 mr-2" />
                          You're on this plan
                        </Button>
                      ) : (
                        <motion.div className="w-full" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button 
                            className={`w-full h-14 text-base font-bold transition-all duration-300 group/btn ${
                              isPopular 
                                ? 'bg-gradient-to-r from-primary via-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground shadow-xl shadow-primary/30' 
                                : 'bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-xl shadow-primary/25'
                            }`}
                            onClick={() => handleSelectPlan(plan)}
                          >
                            <Rocket className="w-5 h-5 mr-2 group-hover/btn:animate-bounce" />
                            Get {plan.name} Now
                            <ChevronRight className="w-5 h-5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                          </Button>
                        </motion.div>
                      )}
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Money Back Guarantee */}
          <motion.div variants={itemVariants} className="max-w-2xl mx-auto">
            <div className="relative p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 text-center">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,hsl(var(--background))_100%)]" />
              <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/15 mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="relative text-xl sm:text-2xl font-bold text-foreground mb-2">100% Satisfaction Guarantee</h3>
              <p className="relative text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
                Not satisfied? Contact us within 7 days for a full refund. No questions asked.
              </p>
            </div>
          </motion.div>

          {/* Support */}
          <motion.div variants={itemVariants} className="text-center pt-4">
            <Link to="/support">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button variant="ghost" size="lg" className="gap-2 text-muted-foreground hover:text-primary group">
                  <Heart className="w-5 h-5 text-pink-500 group-hover:animate-pulse" />
                  <span className="text-base">Support FileShare Development</span>
                  <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
              </motion.div>
            </Link>
          </motion.div>

          {/* Trust Badges */}
          <motion.div variants={itemVariants} className="text-center pb-8">
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
              <motion.div className="flex items-center gap-2 text-sm text-muted-foreground" whileHover={{ scale: 1.05 }}>
                <Shield className="w-5 h-5 text-primary" />
                <span className="font-medium">Secure Payments</span>
              </motion.div>
              <motion.div className="flex items-center gap-2 text-sm text-muted-foreground" whileHover={{ scale: 1.05 }}>
                <Lock className="w-5 h-5 text-primary" />
                <span className="font-medium">SSL Encrypted</span>
              </motion.div>
              <motion.div className="flex items-center gap-2 text-sm text-muted-foreground" whileHover={{ scale: 1.05 }}>
                <CreditCard className="w-5 h-5 text-primary" />
                <span className="font-medium">Razorpay Protected</span>
              </motion.div>
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
