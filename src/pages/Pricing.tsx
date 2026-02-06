import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, ArrowLeft, Crown, Zap, Shield, Star, Sparkles, Lock, CreditCard, Gift, ChevronRight, Users, FileUp, Clock, Heart, Rocket, Award, TrendingUp, Infinity, ArrowUpRight, Flame, Diamond } from 'lucide-react';
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
      <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950">
        <header className="border-b border-red-500/20 bg-neutral-950/90 backdrop-blur-xl sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Skeleton className="h-8 w-32 bg-neutral-800" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-8 w-24 bg-neutral-800" />
              <Skeleton className="h-8 w-8 rounded-full bg-neutral-800" />
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <Skeleton className="h-12 w-64 mx-auto mb-4 bg-neutral-800" />
            <Skeleton className="h-6 w-96 mx-auto bg-neutral-800" />
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Skeleton className="h-[500px] rounded-3xl bg-neutral-800" />
            <Skeleton className="h-[500px] rounded-3xl bg-neutral-800" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 text-white relative overflow-hidden scroll-smooth">
      {/* Premium Red Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Glowing orbs */}
        <div className="absolute top-20 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-red-600/20 via-red-500/10 to-transparent rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-20 right-1/4 w-[500px] h-[500px] bg-gradient-to-tl from-orange-600/15 via-red-600/10 to-transparent rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute top-1/2 left-10 w-[400px] h-[400px] bg-gradient-to-r from-rose-600/10 to-transparent rounded-full blur-[80px] animate-pulse" style={{ animationDuration: '5s' }} />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(239,68,68,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(239,68,68,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        
        {/* Radial fade */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(10,10,10,0.8)_70%)]" />
        
        {/* Floating particles */}
        <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-red-500/60 rounded-full animate-float" style={{ animationDelay: '0s' }} />
        <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-orange-500/50 rounded-full animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-1/4 left-1/4 w-1 h-1 bg-rose-500/40 rounded-full animate-float" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <header className="relative border-b border-red-500/20 bg-neutral-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <motion.div whileHover={{ x: -3 }} transition={{ duration: 0.2 }}>
            <Link to="/" className="flex items-center gap-2 text-neutral-400 hover:text-white transition-all duration-300 group">
              <ArrowLeft className="w-4 h-4 group-hover:text-red-400" />
              <span className="text-sm font-medium hidden sm:inline">Back to Home</span>
            </Link>
          </motion.div>
          <div className="flex items-center gap-2 sm:gap-4">
            {user ? (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
                <Badge className="bg-gradient-to-r from-red-600/20 to-orange-600/20 text-red-400 border border-red-500/30 px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium shadow-lg shadow-red-500/10">
                  <Flame className="w-3 h-3 mr-1.5" />
                  {userPlan ? `${userPlan} Plan` : 'Free Plan'}
                </Badge>
              </motion.div>
            ) : (
              <Link to="/auth">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button size="sm" className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white shadow-lg shadow-red-500/30 font-semibold border-0">
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
              className="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-red-600/20 via-red-500/15 to-orange-600/20 border border-red-500/30 mb-8 sm:mb-10 shadow-xl shadow-red-500/10"
              whileHover={{ scale: 1.02 }}
            >
              <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
              <span className="text-xs sm:text-sm font-bold text-red-400 tracking-wide">Limited Time Offer</span>
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 animate-pulse" />
            </motion.div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 sm:mb-8 leading-[1.1] tracking-tight">
              <span className="text-white">Unlock</span>
              <br className="hidden sm:block" />
              <span className="sm:hidden"> </span>
              <span className="bg-gradient-to-r from-red-500 via-red-400 to-orange-500 bg-clip-text text-transparent">Premium Power</span>
            </h1>
            
            <p className="text-neutral-400 text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed px-4">
              Experience blazing-fast file sharing with enterprise-grade features.
              <span className="text-white font-semibold"> One payment. Lifetime access.</span>
            </p>
          </motion.div>

          {/* Stats Row */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto">
            {([
              { value: '10K+', label: 'Active Users', icon: Users },
              { value: '1M+', label: 'Files Shared', icon: FileUp },
              { value: '99.9%', label: 'Uptime', icon: Shield },
              { value: '24/7', label: 'Support', icon: TrendingUp },
            ] as const).map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div 
                  key={stat.label} 
                  whileHover={{ scale: 1.05, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative text-center p-4 sm:p-6 rounded-2xl bg-neutral-900/60 border border-red-500/20 backdrop-blur-sm shadow-xl shadow-red-500/5 hover:shadow-red-500/15 hover:border-red-500/40 transition-all duration-300 overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 mx-auto mb-2 sm:mb-3 relative z-10" />
                  <p className="text-xl sm:text-2xl md:text-3xl font-black text-white relative z-10">{stat.value}</p>
                  <p className="text-[10px] sm:text-xs text-neutral-500 font-medium mt-1 relative z-10">{stat.label}</p>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Free Plan */}
          <motion.div variants={itemVariants} className="max-w-5xl mx-auto">
            <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.3 }}>
              <Card className="relative border border-neutral-800 bg-neutral-900/80 backdrop-blur-sm overflow-hidden group hover:shadow-2xl hover:shadow-red-500/10 hover:border-neutral-700 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute top-4 right-4">
                  <Badge className="bg-neutral-800 text-neutral-300 border border-neutral-700 font-semibold">Forever Free</Badge>
                </div>
              
                <CardHeader className="text-center pb-4 sm:pb-6 relative pt-6">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <motion.div 
                      className="p-3 sm:p-4 rounded-2xl bg-neutral-800 border border-neutral-700 shadow-inner"
                      whileHover={{ rotate: [0, -5, 5, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-neutral-400" />
                    </motion.div>
                    <CardTitle className="text-2xl sm:text-3xl text-white font-black">Free Plan</CardTitle>
                  </div>
                  <CardDescription className="text-sm sm:text-base text-neutral-500">Perfect for personal use and getting started</CardDescription>
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
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-800/80 border border-neutral-700/50 text-sm text-white font-medium shadow-sm hover:border-red-500/30 transition-all duration-300"
                    >
                      <Check className="w-4 h-4 text-green-500" />
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
                      ? 'border-2 border-red-500/60 shadow-2xl shadow-red-500/20 bg-gradient-to-br from-neutral-900 via-neutral-900 to-red-950/30' 
                      : 'border border-neutral-800 hover:border-red-500/40 hover:shadow-2xl hover:shadow-red-500/10 bg-neutral-900/80'
                  } ${userPlan === plan.name ? 'ring-2 ring-green-500 ring-offset-2 ring-offset-neutral-950' : ''} backdrop-blur-sm`}>
                    
                    {/* Animated background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${
                      isPopular ? 'from-red-600/10 via-orange-600/5 to-rose-600/5' : 'from-red-600/5 via-transparent to-transparent'
                    } opacity-60 group-hover:opacity-100 transition-opacity duration-500`} />
                    
                    {/* Shimmer */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* Popular badge */}
                    {isPopular && (
                      <div className="absolute -top-px -right-px z-10">
                        <div className="bg-gradient-to-r from-red-600 via-red-500 to-orange-500 text-white text-[10px] sm:text-xs font-bold px-4 sm:px-6 py-2 sm:py-2.5 rounded-bl-2xl rounded-tr-lg flex items-center gap-2 shadow-xl shadow-red-500/40">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>Most Popular</span>
                          <Diamond className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    )}

                    {userPlan === plan.name && (
                      <div className="absolute top-4 left-4 z-10">
                        <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 font-bold shadow-lg">
                          <Check className="w-3 h-3 mr-1" />
                          Current Plan
                        </Badge>
                      </div>
                    )}
                    
                    <CardHeader className="text-center pb-6 sm:pb-8 relative pt-8 sm:pt-10">
                      <motion.div className="flex items-center justify-center mb-6" whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }} transition={{ duration: 0.4 }}>
                        <div className={`p-5 sm:p-6 rounded-3xl transition-all duration-300 shadow-xl ${
                          isPopular 
                            ? 'bg-gradient-to-br from-red-600/30 via-red-500/20 to-orange-600/15 text-red-400 shadow-red-500/30 border border-red-500/40' 
                            : 'bg-gradient-to-br from-red-600/20 to-orange-600/10 text-red-500 shadow-red-500/20 border border-red-500/20'
                        }`}>
                          {getPlanIcon(plan.slug)}
                        </div>
                      </motion.div>
                      
                      <CardTitle className="text-2xl sm:text-3xl mb-2 text-white font-black">{plan.name}</CardTitle>
                      
                      <div className="mt-6 space-y-3">
                        <motion.div className="flex items-baseline justify-center gap-1" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3 + index * 0.1 }}>
                          <span className={`text-5xl sm:text-6xl font-black tracking-tight ${
                            isPopular 
                              ? 'bg-gradient-to-r from-red-500 via-red-400 to-orange-500 bg-clip-text text-transparent' 
                              : 'bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent'
                          }`}>
                            {formatPrice(plan.price_inr)}
                          </span>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }}>
                          <Badge className={`text-xs font-bold px-4 py-1.5 ${
                            isPopular 
                              ? 'bg-gradient-to-r from-red-600/20 to-orange-600/20 text-red-400 border-red-500/40' 
                              : 'bg-gradient-to-r from-red-600/15 to-orange-600/15 text-red-400 border-red-500/25'
                          }`}>
                            <Infinity className="w-3 h-3 mr-1" />
                            Lifetime access
                          </Badge>
                        </motion.div>
                      </div>
                      
                      <CardDescription className="mt-6 text-sm sm:text-base flex flex-wrap items-center justify-center gap-4 text-neutral-400">
                        <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
                          <FileUp className="w-4 h-4" />
                          {formatFileSize(plan.file_size_limit)}
                        </span>
                        <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
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
                          <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 shadow-sm bg-red-500/15 text-red-500 group-hover/item:bg-red-500/25 border border-red-500/20">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-sm sm:text-base text-neutral-200 font-medium">{feature}</span>
                        </motion.div>
                      ))}
                    </CardContent>

                    <CardFooter className="pt-0 pb-8 relative px-5 sm:px-8">
                      {userPlan === plan.name ? (
                        <Button className="w-full h-14 text-base font-bold bg-green-500/15 text-green-400 border-2 border-green-500/30 hover:bg-green-500/20 cursor-not-allowed" disabled>
                          <Check className="w-5 h-5 mr-2" />
                          You're on this plan
                        </Button>
                      ) : (
                        <motion.div className="w-full" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button 
                            className={`w-full h-14 text-base font-bold transition-all duration-300 group/btn border-0 ${
                              isPopular 
                                ? 'bg-gradient-to-r from-red-600 via-red-500 to-orange-500 hover:from-red-500 hover:via-red-400 hover:to-orange-400 text-white shadow-xl shadow-red-500/40' 
                                : 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white shadow-xl shadow-red-500/30'
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
            <div className="relative p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-red-600/10 via-red-500/5 to-transparent border border-red-500/25 text-center shadow-xl shadow-red-500/5">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(10,10,10,0.9)_100%)] rounded-2xl" />
              <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 mb-4 border border-red-500/30">
                <Shield className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="relative text-xl sm:text-2xl font-bold text-white mb-2">100% Satisfaction Guarantee</h3>
              <p className="relative text-sm sm:text-base text-neutral-400 max-w-md mx-auto">
                Not satisfied? Contact us within 7 days for a full refund. No questions asked.
              </p>
            </div>
          </motion.div>

          {/* Support */}
          <motion.div variants={itemVariants} className="text-center pt-4">
            <Link to="/support">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button variant="ghost" size="lg" className="gap-2 text-neutral-400 hover:text-red-400 hover:bg-red-500/10 group">
                  <Heart className="w-5 h-5 text-red-500 group-hover:animate-pulse" />
                  <span className="text-base">Support FileShare Development</span>
                  <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
              </motion.div>
            </Link>
          </motion.div>

          {/* Trust Badges */}
          <motion.div variants={itemVariants} className="text-center pb-8">
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
              <motion.div className="flex items-center gap-2 text-sm text-neutral-500" whileHover={{ scale: 1.05 }}>
                <Shield className="w-5 h-5 text-red-500" />
                <span className="font-medium text-neutral-300">Secure Payments</span>
              </motion.div>
              <motion.div className="flex items-center gap-2 text-sm text-neutral-500" whileHover={{ scale: 1.05 }}>
                <Lock className="w-5 h-5 text-red-500" />
                <span className="font-medium text-neutral-300">SSL Encrypted</span>
              </motion.div>
              <motion.div className="flex items-center gap-2 text-sm text-neutral-500" whileHover={{ scale: 1.05 }}>
                <CreditCard className="w-5 h-5 text-red-500" />
                <span className="font-medium text-neutral-300">Razorpay Protected</span>
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
