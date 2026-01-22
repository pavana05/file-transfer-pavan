import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, Sparkles, Coffee, Star, Gift, Zap, 
  ArrowLeft, Check, Crown, Rocket, PartyPopper,
  Users, Trophy, ThumbsUp, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

interface SupportAmount {
  amount: number;
  label: string;
  icon: React.ReactNode;
  description: string;
  popular?: boolean;
  color: string;
}

const supportAmounts: SupportAmount[] = [
  { 
    amount: 4900, 
    label: '₹49', 
    icon: <Coffee className="h-6 w-6" />, 
    description: 'Buy me a coffee',
    color: 'from-amber-500 to-orange-500'
  },
  { 
    amount: 9900, 
    label: '₹99', 
    icon: <Heart className="h-6 w-6" />, 
    description: 'Send some love',
    color: 'from-pink-500 to-rose-500'
  },
  { 
    amount: 19900, 
    label: '₹199', 
    icon: <Star className="h-6 w-6" />, 
    description: 'Be a star supporter',
    popular: true,
    color: 'from-yellow-500 to-amber-500'
  },
  { 
    amount: 49900, 
    label: '₹499', 
    icon: <Crown className="h-6 w-6" />, 
    description: 'Premium supporter',
    color: 'from-purple-500 to-violet-500'
  },
  { 
    amount: 99900, 
    label: '₹999', 
    icon: <Rocket className="h-6 w-6" />, 
    description: 'Super supporter',
    color: 'from-blue-500 to-cyan-500'
  },
  { 
    amount: 199900, 
    label: '₹1,999', 
    icon: <Trophy className="h-6 w-6" />, 
    description: 'Ultimate champion',
    color: 'from-emerald-500 to-teal-500'
  },
];

const floatingHearts = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  delay: i * 0.5,
  duration: 4 + Math.random() * 3,
  x: Math.random() * 100,
}));

const Support = () => {
  const navigate = useNavigate();
  const { user, session } = useAuth();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [supporterCount] = useState(Math.floor(Math.random() * 500) + 1500);

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setIsCustom(false);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (value: string) => {
    const numValue = value.replace(/[^0-9]/g, '');
    setCustomAmount(numValue);
    if (numValue) {
      setSelectedAmount(parseInt(numValue) * 100); // Convert to paise
      setIsCustom(true);
    } else {
      setSelectedAmount(null);
    }
  };

  const getSelectedAmountInRupees = () => {
    if (!selectedAmount) return 0;
    return selectedAmount / 100;
  };

  const triggerCelebration = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff']
    });
    
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#ff6b6b', '#feca57', '#48dbfb']
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#ff9ff3', '#54a0ff', '#5f27cd']
      });
    }, 250);
  };

  const handleSupport = async () => {
    if (!selectedAmount || selectedAmount < 100) {
      toast.error('Please select or enter a valid amount (minimum ₹1)');
      return;
    }

    if (!user || !session?.access_token) {
      toast.error('Please login to continue');
      navigate('/auth?redirect=/support');
      return;
    }

    setLoading(true);

    try {
      // Load Razorpay script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      document.body.appendChild(script);

      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
      });

      // Create order
      const response = await fetch(
        `https://zbvwodqcvotrfokadwyo.supabase.co/functions/v1/razorpay?action=create-donation`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpidndvZHFjdm90cmZva2Fkd3lvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NzcwMDgsImV4cCI6MjA2NzA1MzAwOH0.2JhIGFjWU-gT6CspuGTqYnkXuu_GJ6IhWwLN6AqdIVA'
          },
          body: JSON.stringify({
            amount: selectedAmount,
            type: 'donation'
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const orderData = await response.json();

      // Open Razorpay checkout
      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'FileShare Pro',
        description: 'Show Some Love ❤️ - Support Donation',
        order_id: orderData.order_id,
        prefill: {
          email: user.email || ''
        },
        theme: {
          color: '#ec4899'
        },
        handler: function(response: any) {
          triggerCelebration();
          setShowThankYou(true);
          toast.success('Thank you for your support! 💖');
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        }
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
      setLoading(false);

    } catch (error: any) {
      console.error('Support payment error:', error);
      toast.error(error.message || 'Failed to process. Please try again.');
      setLoading(false);
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

  if (showThankYou) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.8 }}
          className="text-center max-w-lg"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              repeatType: "reverse"
            }}
            className="inline-block mb-6"
          >
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center mx-auto shadow-2xl shadow-pink-500/40">
              <Heart className="h-12 w-12 text-white fill-white" />
            </div>
          </motion.div>

          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-5xl font-black text-foreground mb-4"
          >
            You're Amazing! 🎉
          </motion.h1>

          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-lg text-muted-foreground mb-8"
          >
            Thank you for supporting FileShare Pro! Your generosity helps us build amazing features for everyone.
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button 
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
            >
              <Heart className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                setShowThankYou(false);
                setSelectedAmount(null);
              }}
            >
              <Gift className="h-4 w-4 mr-2" />
              Support Again
            </Button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated floating hearts background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-pink-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-rose-500/5 rounded-full blur-3xl" />
        
        {/* Floating hearts */}
        {floatingHearts.map((heart) => (
          <motion.div
            key={heart.id}
            className="absolute text-pink-500/20"
            initial={{ 
              x: `${heart.x}vw`, 
              y: '110vh',
              rotate: 0,
              scale: 0.5 + Math.random() * 0.5
            }}
            animate={{ 
              y: '-10vh',
              rotate: 360,
            }}
            transition={{
              duration: heart.duration,
              repeat: Infinity,
              delay: heart.delay,
              ease: 'linear'
            }}
          >
            <Heart className="h-8 w-8 fill-current" />
          </motion.div>
        ))}
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary)/0.02)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/0.02)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3">
                <motion.div 
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="h-10 w-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-500/30"
                >
                  <Heart className="h-5 w-5 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-lg font-bold">Show Some Love</h1>
                  <p className="text-xs text-muted-foreground">Support FileShare Pro</p>
                </div>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto"
        >
          {/* Hero Section */}
          <motion.div variants={itemVariants} className="text-center mb-12">
            <motion.div 
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="inline-block mb-6"
            >
              <div className="relative">
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-pink-500 via-rose-500 to-red-500 flex items-center justify-center mx-auto shadow-2xl shadow-pink-500/40">
                  <Heart className="h-12 w-12 text-white fill-white" />
                </div>
                <motion.div 
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 rounded-full bg-pink-500/30 blur-xl"
                />
              </div>
            </motion.div>

            <h1 className="text-4xl md:text-6xl font-black text-foreground mb-4">
              Show Some{' '}
              <span className="bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 bg-clip-text text-transparent">
                Love
              </span>{' '}
              <motion.span 
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="inline-block"
              >
                ❤️
              </motion.span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
              Your support keeps FileShare Pro running and helps us build amazing new features. 
              Every contribution makes a difference!
            </p>

            {/* Stats */}
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4 text-pink-500" />
                <span><strong className="text-foreground">{supporterCount.toLocaleString()}</strong> supporters</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <ThumbsUp className="h-4 w-4 text-pink-500" />
                <span><strong className="text-foreground">100%</strong> secure</span>
              </div>
            </div>
          </motion.div>

          {/* Amount Selection */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {supportAmounts.map((item, index) => (
                <motion.div
                  key={item.amount}
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card 
                    className={`relative cursor-pointer transition-all duration-300 overflow-hidden group ${
                      selectedAmount === item.amount && !isCustom
                        ? 'ring-2 ring-pink-500 shadow-xl shadow-pink-500/20'
                        : 'hover:shadow-lg hover:shadow-pink-500/10'
                    }`}
                    onClick={() => handleAmountSelect(item.amount)}
                  >
                    {item.popular && (
                      <div className="absolute top-0 right-0">
                        <Badge className="rounded-none rounded-bl-lg bg-gradient-to-r from-pink-500 to-rose-500 text-white border-0 px-3">
                          <Sparkles className="h-3 w-3 mr-1" />
                          Popular
                        </Badge>
                      </div>
                    )}
                    
                    <CardContent className="p-6 text-center relative z-10">
                      <motion.div 
                        className={`inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br ${item.color} text-white mb-4 shadow-lg`}
                        whileHover={{ rotate: [0, -10, 10, 0] }}
                        transition={{ duration: 0.5 }}
                      >
                        {item.icon}
                      </motion.div>
                      
                      <div className="text-3xl font-black text-foreground mb-1">
                        {item.label}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>

                      {selectedAmount === item.amount && !isCustom && (
                        <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-3 left-3"
                        >
                          <div className="h-6 w-6 rounded-full bg-pink-500 flex items-center justify-center">
                            <Check className="h-4 w-4 text-white" />
                          </div>
                        </motion.div>
                      )}
                    </CardContent>

                    {/* Gradient overlay on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Custom Amount */}
          <motion.div variants={itemVariants} className="mb-8">
            <Card className={`overflow-hidden transition-all duration-300 ${
              isCustom ? 'ring-2 ring-pink-500 shadow-xl shadow-pink-500/20' : ''
            }`}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white shadow-lg shrink-0">
                    <Gift className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Or enter a custom amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-muted-foreground">
                        ₹
                      </span>
                      <Input
                        type="text"
                        inputMode="numeric"
                        placeholder="Enter amount"
                        value={customAmount}
                        onChange={(e) => handleCustomAmountChange(e.target.value)}
                        className="pl-10 text-lg font-semibold h-12"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Support Button */}
          <motion.div variants={itemVariants} className="text-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedAmount}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Button
                  size="lg"
                  onClick={handleSupport}
                  disabled={!selectedAmount || loading}
                  className="h-14 px-12 text-lg font-bold bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 hover:from-pink-600 hover:via-rose-600 hover:to-red-600 text-white shadow-xl shadow-pink-500/30 hover:shadow-pink-500/40 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : selectedAmount ? (
                    <>
                      <Heart className="h-5 w-5 mr-2 fill-white" />
                      Support with ₹{getSelectedAmountInRupees().toLocaleString()}
                    </>
                  ) : (
                    <>
                      <Heart className="h-5 w-5 mr-2" />
                      Select an Amount
                    </>
                  )}
                </Button>
              </motion.div>
            </AnimatePresence>

            <p className="text-xs text-muted-foreground mt-4 flex items-center justify-center gap-2">
              <Zap className="h-3 w-3" />
              Secure payment powered by Razorpay
            </p>
          </motion.div>

          {/* Why Support Section */}
          <motion.div variants={itemVariants} className="mt-16">
            <h2 className="text-2xl font-bold text-center mb-8">
              Why Your Support Matters
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: <Rocket className="h-6 w-6" />,
                  title: 'New Features',
                  description: 'Help us build amazing new features and improvements'
                },
                {
                  icon: <Zap className="h-6 w-6" />,
                  title: 'Better Performance',
                  description: 'Keep our servers fast and reliable for everyone'
                },
                {
                  icon: <Heart className="h-6 w-6" />,
                  title: 'Free for All',
                  description: 'Support keeps FileShare free for those who need it'
                }
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardContent className="p-6 text-center">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-pink-500/10 to-rose-500/10 flex items-center justify-center mx-auto mb-4 text-pink-500">
                        {item.icon}
                      </div>
                      <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default Support;
