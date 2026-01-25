import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Heart, Sparkles, Coffee, Star, Gift, Zap, ArrowLeft, Check, Crown, Rocket, PartyPopper, Users, Trophy, ThumbsUp, Loader2, MessageCircle, Shield, Globe, Flame, Diamond, Award, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  gradient: string;
}
const supportAmounts: SupportAmount[] = [{
  amount: 2500,
  label: '₹25',
  icon: <Coffee className="h-6 w-6" />,
  description: 'Buy me a coffee',
  color: 'from-amber-500 to-orange-500',
  gradient: 'bg-gradient-to-br from-amber-500/20 to-orange-500/20'
}, {
  amount: 4900,
  label: '₹49',
  icon: <Heart className="h-6 w-6" />,
  description: 'Send some love',
  color: 'from-pink-500 to-rose-500',
  gradient: 'bg-gradient-to-br from-pink-500/20 to-rose-500/20'
}, {
  amount: 9900,
  label: '₹99',
  icon: <Star className="h-6 w-6" />,
  description: 'Be a star supporter',
  popular: true,
  color: 'from-yellow-500 to-amber-500',
  gradient: 'bg-gradient-to-br from-yellow-500/20 to-amber-500/20'
}, {
  amount: 14900,
  label: '₹149',
  icon: <Crown className="h-6 w-6" />,
  description: 'Premium supporter',
  color: 'from-purple-500 to-violet-500',
  gradient: 'bg-gradient-to-br from-purple-500/20 to-violet-500/20'
}, {
  amount: 49900,
  label: '₹499',
  icon: <Diamond className="h-6 w-6" />,
  description: 'Diamond supporter',
  color: 'from-cyan-500 to-blue-500',
  gradient: 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20'
}, {
  amount: 99900,
  label: '₹999',
  icon: <Trophy className="h-6 w-6" />,
  description: 'Ultimate champion',
  color: 'from-emerald-500 to-teal-500',
  gradient: 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20'
}];
const floatingHearts = Array.from({
  length: 20
}, (_, i) => ({
  id: i,
  delay: i * 0.4,
  duration: 5 + Math.random() * 4,
  x: Math.random() * 100,
  size: 0.5 + Math.random() * 0.8
}));
const sparkles = Array.from({
  length: 15
}, (_, i) => ({
  id: i,
  delay: i * 0.3,
  duration: 3 + Math.random() * 2,
  x: Math.random() * 100,
  y: Math.random() * 100
}));
interface WallSupporter {
  id: string;
  name: string | null;
  amount: number;
  message: string | null;
  completed_at: string;
}
const Support = () => {
  const navigate = useNavigate();
  const {
    user,
    session
  } = useAuth();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [supporterCount] = useState(Math.floor(Math.random() * 500) + 1500);
  const [donorName, setDonorName] = useState('');
  const [donorMessage, setDonorMessage] = useState('');
  const [totalRaised] = useState(Math.floor(Math.random() * 50000) + 150000);
  const [showOnWall, setShowOnWall] = useState(false);
  const [wallSupporters, setWallSupporters] = useState<WallSupporter[]>([]);
  const [loadingWall, setLoadingWall] = useState(true);

  // Fetch wall supporters
  useEffect(() => {
    const fetchWallSupporters = async () => {
      try {
        const {
          data,
          error
        } = await supabase.from('donations').select('id, name, amount, message, completed_at').eq('show_on_wall', true).eq('status', 'completed').order('completed_at', {
          ascending: false
        }).limit(12);
        if (!error && data) {
          setWallSupporters(data);
        }
      } catch (err) {
        console.error('Error fetching wall supporters:', err);
      } finally {
        setLoadingWall(false);
      }
    };
    fetchWallSupporters();
  }, [showThankYou]);
  const triggerAmountAnimation = (amount: number) => {
    // Different confetti configurations based on amount
    const baseColors = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff', '#5f27cd'];
    if (amount >= 49900) {
      // Premium tier - diamond burst effect
      confetti({
        particleCount: 100,
        spread: 100,
        origin: {
          y: 0.6
        },
        colors: ['#00d9ff', '#0066ff', '#9933ff', '#ffffff'],
        shapes: ['star', 'circle'],
        scalar: 1.2
      });
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: {
          x: 0,
          y: 0.6
        },
        colors: ['#00d9ff', '#0066ff']
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: {
          x: 1,
          y: 0.6
        },
        colors: ['#9933ff', '#ffffff']
      });
    } else if (amount >= 14900) {
      // Mid tier - crown shower
      confetti({
        particleCount: 80,
        spread: 70,
        origin: {
          y: 0.6
        },
        colors: ['#a855f7', '#7c3aed', '#fbbf24', '#f59e0b'],
        scalar: 1.1
      });
    } else if (amount >= 9900) {
      // Star tier - star burst
      confetti({
        particleCount: 60,
        spread: 60,
        origin: {
          y: 0.6
        },
        colors: ['#fbbf24', '#f59e0b', '#eab308'],
        shapes: ['star'],
        scalar: 1.3
      });
    } else if (amount >= 4900) {
      // Heart tier - love hearts
      confetti({
        particleCount: 50,
        spread: 50,
        origin: {
          y: 0.6
        },
        colors: ['#ec4899', '#f472b6', '#db2777', '#be185d']
      });
    } else {
      // Coffee tier - warm burst
      confetti({
        particleCount: 30,
        spread: 40,
        origin: {
          y: 0.6
        },
        colors: ['#f59e0b', '#d97706', '#b45309']
      });
    }
  };
  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setIsCustom(false);
    setCustomAmount('');
    triggerAmountAnimation(amount);
  };
  const handleCustomAmountChange = (value: string) => {
    const numValue = value.replace(/[^0-9]/g, '');
    setCustomAmount(numValue);
    if (numValue) {
      setSelectedAmount(parseInt(numValue) * 100);
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
    const duration = 3 * 1000;
    const end = Date.now() + duration;
    const colors = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff', '#5f27cd'];
    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: {
          x: 0,
          y: 0.8
        },
        colors: colors
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: {
          x: 1,
          y: 0.8
        },
        colors: colors
      });
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
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
      const response = await fetch(`https://zbvwodqcvotrfokadwyo.supabase.co/functions/v1/razorpay?action=create-donation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpidndvZHFjdm90cmZva2Fkd3lvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NzcwMDgsImV4cCI6MjA2NzA1MzAwOH0.2JhIGFjWU-gT6CspuGTqYnkXuu_GJ6IhWwLN6AqdIVA'
        },
        body: JSON.stringify({
          amount: selectedAmount,
          type: 'donation',
          name: donorName || undefined,
          message: donorMessage || undefined,
          show_on_wall: showOnWall
        })
      });
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
          email: user.email || '',
          name: donorName || user.user_metadata?.full_name || ''
        },
        theme: {
          color: '#ec4899'
        },
        handler: async function (paymentResponse: any) {
          // Verify the donation payment
          try {
            const verifyResponse = await fetch(`https://zbvwodqcvotrfokadwyo.supabase.co/functions/v1/razorpay?action=verify-donation`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpidndvZHFjdm90cmZva2Fkd3lvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NzcwMDgsImV4cCI6MjA2NzA1MzAwOH0.2JhIGFjWU-gT6CspuGTqYnkXuu_GJ6IhWwLN6AqdIVA'
              },
              body: JSON.stringify({
                razorpay_order_id: orderData.order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature
              })
            });
            if (verifyResponse.ok) {
              triggerCelebration();
              setShowThankYou(true);
              toast.success('Thank you for your support! 💖 Check your email for confirmation.');
            } else {
              toast.error('Payment verification failed. Please contact support.');
            }
          } catch (error) {
            console.error('Verification error:', error);
            toast.error('Payment recorded but verification had issues. Check your email.');
          }
        },
        modal: {
          ondismiss: function () {
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
    hidden: {
      opacity: 0
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };
  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };
  if (showThankYou) {
    return <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-rose-500/10" />
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-pink-500/20 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px] animate-pulse delay-1000" />
        </div>

        <motion.div initial={{
        scale: 0.5,
        opacity: 0
      }} animate={{
        scale: 1,
        opacity: 1
      }} transition={{
        type: "spring",
        duration: 0.8
      }} className="text-center max-w-lg">
          <motion.div animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 5, -5, 0]
        }} transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse"
        }} className="inline-block mb-8">
            <div className="relative">
              <div className="h-32 w-32 rounded-full bg-gradient-to-br from-pink-500 via-rose-500 to-red-500 flex items-center justify-center mx-auto shadow-2xl shadow-pink-500/50">
                <Heart className="h-16 w-16 text-white fill-white" />
              </div>
              <motion.div animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 0, 0.5]
            }} transition={{
              duration: 2,
              repeat: Infinity
            }} className="absolute inset-0 rounded-full bg-pink-500/30 blur-xl" />
              {/* Orbiting sparkles */}
              {[...Array(6)].map((_, i) => <motion.div key={i} className="absolute" style={{
              top: '50%',
              left: '50%'
            }} animate={{
              rotate: 360
            }} transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'linear',
              delay: i * 0.5
            }}>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full shadow-lg shadow-yellow-400/50" style={{
                transform: `translateX(${80 + i * 10}px) translateY(-50%)`
              }} />
                </motion.div>)}
            </div>
          </motion.div>

          <motion.h1 initial={{
          y: 20,
          opacity: 0
        }} animate={{
          y: 0,
          opacity: 1
        }} transition={{
          delay: 0.3
        }} className="text-5xl md:text-6xl font-black text-foreground mb-6">
            You're{' '}
            <span className="bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 bg-clip-text text-transparent">
              Amazing!
            </span>{' '}
            🎉
          </motion.h1>

          <motion.p initial={{
          y: 20,
          opacity: 0
        }} animate={{
          y: 0,
          opacity: 1
        }} transition={{
          delay: 0.5
        }} className="text-lg text-muted-foreground mb-8 leading-relaxed">
            Thank you for supporting FileShare Pro! Your generosity helps us build amazing features for everyone. 
            <span className="block mt-2 text-pink-500 font-semibold">Check your email for confirmation! 💌</span>
          </motion.p>

          <motion.div initial={{
          y: 20,
          opacity: 0
        }} animate={{
          y: 0,
          opacity: 1
        }} transition={{
          delay: 0.7
        }} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => navigate('/')} size="lg" className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-8">
              <Heart className="h-5 w-5 mr-2 fill-white" />
              Back to Home
            </Button>
            <Button variant="outline" size="lg" onClick={() => {
            setShowThankYou(false);
            setSelectedAmount(null);
            setDonorName('');
            setDonorMessage('');
          }} className="px-8">
              <Gift className="h-5 w-5 mr-2" />
              Support Again
            </Button>
          </motion.div>
        </motion.div>
      </div>;
  }
  return <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Ultra Premium Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* Multi-layered gradient mesh */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-background to-purple-500/5" />
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-gradient-radial from-pink-500/15 via-transparent to-transparent blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-gradient-radial from-purple-500/15 via-transparent to-transparent blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-radial from-rose-500/8 via-transparent to-transparent blur-[100px]" />
        
        {/* Floating hearts with glow */}
        {floatingHearts.map(heart => <motion.div key={heart.id} className="absolute" initial={{
        x: `${heart.x}vw`,
        y: '110vh',
        rotate: 0,
        scale: heart.size
      }} animate={{
        y: '-10vh',
        rotate: 360
      }} transition={{
        duration: heart.duration,
        repeat: Infinity,
        delay: heart.delay,
        ease: 'linear'
      }}>
            <Heart className="h-8 w-8 text-pink-500/30 fill-pink-500/20 drop-shadow-[0_0_10px_rgba(236,72,153,0.3)]" />
          </motion.div>)}

        {/* Sparkles */}
        {sparkles.map(sparkle => <motion.div key={`sparkle-${sparkle.id}`} className="absolute" style={{
        left: `${sparkle.x}%`,
        top: `${sparkle.y}%`
      }} animate={{
        scale: [0, 1, 0],
        opacity: [0, 1, 0],
        rotate: [0, 180]
      }} transition={{
        duration: sparkle.duration,
        repeat: Infinity,
        delay: sparkle.delay
      }}>
            <Sparkles className="h-4 w-4 text-yellow-400" />
          </motion.div>)}
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary)/0.03)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/0.03)_1px,transparent_1px)] bg-[size:3rem_3rem]" />
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
                <motion.div animate={{
                scale: [1, 1.1, 1]
              }} transition={{
                duration: 2,
                repeat: Infinity
              }} className="relative">
                  <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-pink-500 via-rose-500 to-red-500 flex items-center justify-center shadow-lg shadow-pink-500/40">
                    <Heart className="h-6 w-6 text-white fill-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg shadow-yellow-400/50">
                    <Sparkles className="h-2.5 w-2.5 text-yellow-900" />
                  </div>
                </motion.div>
                <div>
                  <h1 className="text-lg font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">Show Some Love</h1>
                  <p className="text-xs text-muted-foreground">Support FileShare Pro</p>
                </div>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-5xl mx-auto">
          {/* Hero Section */}
          <motion.div variants={itemVariants} className="text-center mb-12">
            <motion.div animate={{
            rotate: [0, 5, -5, 0],
            scale: [1, 1.05, 1]
          }} transition={{
            duration: 4,
            repeat: Infinity
          }} className="inline-block mb-8">
              <div className="relative">
                {/* Main heart icon */}
                <div className="h-28 w-28 md:h-32 md:w-32 rounded-full bg-gradient-to-br from-pink-500 via-rose-500 to-red-500 flex items-center justify-center mx-auto shadow-2xl shadow-pink-500/50">
                  <Heart className="h-14 w-14 md:h-16 md:w-16 text-white fill-white" />
                </div>
                {/* Pulsing ring */}
                <motion.div animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 0, 0.5]
              }} transition={{
                duration: 2,
                repeat: Infinity
              }} className="absolute inset-0 rounded-full border-4 border-pink-500/50" />
                <motion.div animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 0, 0.3]
              }} transition={{
                duration: 2,
                repeat: Infinity,
                delay: 0.5
              }} className="absolute inset-0 rounded-full border-2 border-rose-500/30" />
                {/* Floating badges */}
                <motion.div animate={{
                y: [-5, 5, -5]
              }} transition={{
                duration: 3,
                repeat: Infinity
              }} className="absolute -top-2 -right-2">
                  <Badge className="bg-yellow-500 text-yellow-900 border-0 shadow-lg shadow-yellow-500/30">
                    <Star className="h-3 w-3 mr-1 fill-yellow-900" />
                    {supporterCount.toLocaleString()}
                  </Badge>
                </motion.div>
              </div>
            </motion.div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-foreground mb-6">
              Show Some{' '}
              <span className="bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 bg-clip-text text-transparent">
                Love
              </span>{' '}
              <motion.span animate={{
              scale: [1, 1.3, 1]
            }} transition={{
              duration: 1.5,
              repeat: Infinity
            }} className="inline-block">
                ❤️
              </motion.span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
              Your support keeps FileShare Pro running and helps us build amazing new features. 
              <span className="block mt-2 font-semibold text-foreground">Every contribution makes a difference!</span>
            </p>

            {/* Stats Row */}
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 mb-8">
              <motion.div whileHover={{
              scale: 1.05
            }} className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/80 backdrop-blur border border-border/50 shadow-lg">
                <Users className="h-5 w-5 text-pink-500" />
                <span className="text-sm"><strong className="text-foreground">{supporterCount.toLocaleString()}</strong>​500</span>
              </motion.div>
              <motion.div whileHover={{
              scale: 1.05
            }} className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/80 backdrop-blur border border-border/50 shadow-lg">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
                <span className="text-sm"><strong className="text-foreground">₹{(totalRaised / 100).toLocaleString()}</strong> raised</span>
              </motion.div>
              <motion.div whileHover={{
              scale: 1.05
            }} className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/80 backdrop-blur border border-border/50 shadow-lg">
                <Shield className="h-5 w-5 text-blue-500" />
                <span className="text-sm"><strong className="text-foreground">100%</strong> secure</span>
              </motion.div>
            </div>
          </motion.div>

          {/* Amount Selection Grid */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {supportAmounts.map((item, index) => <motion.div key={item.amount} whileHover={{
              scale: 1.03,
              y: -4
            }} whileTap={{
              scale: 0.98
            }} initial={{
              opacity: 0,
              y: 30
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              delay: index * 0.08
            }}>
                  <Card className={`relative cursor-pointer transition-all duration-300 overflow-hidden group h-full ${selectedAmount === item.amount && !isCustom ? 'ring-2 ring-pink-500 shadow-xl shadow-pink-500/25' : 'hover:shadow-xl hover:shadow-pink-500/10 border-border/50'}`} onClick={() => handleAmountSelect(item.amount)}>
                    {item.popular && <div className="absolute top-0 right-0">
                        <Badge className="rounded-none rounded-bl-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white border-0 px-4 py-1.5 text-xs font-bold">
                          <Flame className="h-3 w-3 mr-1" />
                          POPULAR
                        </Badge>
                      </div>}
                    
                    <CardContent className="p-6 text-center relative z-10">
                      <motion.div className={`inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br ${item.color} text-white mb-4 shadow-lg`} whileHover={{
                    rotate: [0, -10, 10, 0]
                  }} transition={{
                    duration: 0.5
                  }}>
                        {item.icon}
                      </motion.div>
                      
                      <div className="text-3xl md:text-4xl font-black text-foreground mb-2">
                        {item.label}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>

                      {selectedAmount === item.amount && !isCustom && <motion.div initial={{
                    scale: 0
                  }} animate={{
                    scale: 1
                  }} className="absolute top-3 left-3">
                          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg">
                            <Check className="h-4 w-4 text-white" />
                          </div>
                        </motion.div>}
                    </CardContent>

                    {/* Background gradient on hover */}
                    <div className={`absolute inset-0 ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  </Card>
                </motion.div>)}
            </div>
          </motion.div>

          {/* Custom Amount & Message Section */}
          <motion.div variants={itemVariants} className="mb-8">
            <Card className={`overflow-hidden transition-all duration-300 border-border/50 ${isCustom ? 'ring-2 ring-pink-500 shadow-xl shadow-pink-500/20' : ''}`}>
              <CardContent className="p-6 md:p-8">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Custom Amount */}
                  <div>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white shadow-lg shrink-0">
                        <Gift className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground">Custom Amount</h3>
                        <p className="text-sm text-muted-foreground">Enter any amount you'd like</p>
                      </div>
                    </div>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-muted-foreground">
                        ₹
                      </span>
                      <Input type="text" inputMode="numeric" placeholder="Enter amount" value={customAmount} onChange={e => handleCustomAmountChange(e.target.value)} className="pl-10 text-xl font-bold h-14 bg-background/50" />
                    </div>
                  </div>

                  {/* Personal Message */}
                  <div>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white shadow-lg shrink-0">
                        <MessageCircle className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground">Leave a Message</h3>
                        <p className="text-sm text-muted-foreground">Optional - share why you're supporting</p>
                      </div>
                    </div>
                    <Input type="text" placeholder="Your name (optional)" value={donorName} onChange={e => setDonorName(e.target.value)} className="mb-3 h-12 bg-background/50" />
                    <Textarea placeholder="Your message (optional)" value={donorMessage} onChange={e => setDonorMessage(e.target.value)} rows={2} className="resize-none bg-background/50 mb-4" />
                    {/* Show on wall toggle */}
                    <motion.label className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-pink-500/10 to-rose-500/10 border border-pink-500/20 cursor-pointer hover:border-pink-500/40 transition-colors" whileHover={{
                    scale: 1.01
                  }} whileTap={{
                    scale: 0.99
                  }}>
                      <input type="checkbox" checked={showOnWall} onChange={e => setShowOnWall(e.target.checked)} className="w-5 h-5 rounded accent-pink-500" />
                      <div className="flex-1">
                        <span className="font-medium text-foreground">Show on Supporters Wall</span>
                        <p className="text-xs text-muted-foreground mt-0.5">Display your name & message publicly</p>
                      </div>
                      <Users className="h-5 w-5 text-pink-500" />
                    </motion.label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Support Button */}
          <motion.div variants={itemVariants} className="text-center mb-16">
            <AnimatePresence mode="wait">
              <motion.div key={selectedAmount} initial={{
              opacity: 0,
              y: 10
            }} animate={{
              opacity: 1,
              y: 0
            }} exit={{
              opacity: 0,
              y: -10
            }}>
                <Button size="lg" onClick={handleSupport} disabled={!selectedAmount || loading} className="h-16 px-12 md:px-16 text-lg md:text-xl font-bold bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 hover:from-pink-600 hover:via-rose-600 hover:to-red-600 text-white shadow-2xl shadow-pink-500/40 hover:shadow-pink-500/50 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100">
                  {loading ? <>
                      <Loader2 className="h-6 w-6 mr-3 animate-spin" />
                      Processing...
                    </> : selectedAmount ? <>
                      <Heart className="h-6 w-6 mr-3 fill-white" />
                      Support with ₹{getSelectedAmountInRupees().toLocaleString()}
                    </> : <>
                      <Heart className="h-6 w-6 mr-3" />
                      Select an Amount
                    </>}
                </Button>
              </motion.div>
            </AnimatePresence>

            <p className="text-sm text-muted-foreground mt-6 flex items-center justify-center gap-2">
              <Shield className="h-4 w-4 text-emerald-500" />
              Secure payment powered by Razorpay
            </p>
          </motion.div>

          {/* Why Support Section */}
          <motion.div variants={itemVariants}>
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Why Your Support{' '}
              <span className="bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
                Matters
              </span>
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[{
              icon: <Rocket className="h-7 w-7" />,
              title: 'New Features',
              description: 'Help us build amazing new features and improvements',
              gradient: 'from-violet-500 to-purple-500'
            }, {
              icon: <Globe className="h-7 w-7" />,
              title: 'Free for All',
              description: 'Your support keeps FileShare free for those who need it',
              gradient: 'from-blue-500 to-cyan-500'
            }, {
              icon: <Zap className="h-7 w-7" />,
              title: 'Better Performance',
              description: 'Keep our servers fast and reliable for everyone',
              gradient: 'from-yellow-500 to-orange-500'
            }].map((item, index) => <motion.div key={item.title} initial={{
              opacity: 0,
              y: 30
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              delay: 0.6 + index * 0.1
            }} whileHover={{
              y: -8
            }}>
                  <Card className="h-full hover:shadow-xl transition-all duration-300 border-border/50 overflow-hidden group">
                    <CardContent className="p-6 md:p-8 text-center relative">
                      <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mx-auto mb-5 text-white shadow-lg group-hover:scale-110 transition-transform`}>
                        {item.icon}
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-3">{item.title}</h3>
                      <p className="text-muted-foreground">{item.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>)}
            </div>
          </motion.div>

          {/* Supporters Wall */}
          {wallSupporters.length > 0 && <motion.div variants={itemVariants} className="mt-16">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold mb-2">
                  Our Amazing{' '}
                  <span className="bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
                    Supporters
                  </span>{' '}
                  🌟
                </h2>
                <p className="text-muted-foreground">People who made FileShare Pro possible</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {wallSupporters.map((supporter, index) => <motion.div key={supporter.id} initial={{
              opacity: 0,
              scale: 0.9
            }} animate={{
              opacity: 1,
              scale: 1
            }} transition={{
              delay: index * 0.05
            }} whileHover={{
              y: -4,
              scale: 1.02
            }}>
                    <Card className="h-full overflow-hidden border-border/50 bg-gradient-to-br from-card via-card to-pink-500/5 hover:shadow-lg hover:shadow-pink-500/10 transition-all duration-300">
                      <CardContent className="p-5 relative">
                        {/* Premium badge for high donors */}
                        {supporter.amount >= 49900 && <motion.div className="absolute top-3 right-3" animate={{
                    rotate: [0, 10, -10, 0]
                  }} transition={{
                    duration: 2,
                    repeat: Infinity
                  }}>
                            <Diamond className="h-5 w-5 text-cyan-500" />
                          </motion.div>}
                        {supporter.amount >= 14900 && supporter.amount < 49900 && <Crown className="absolute top-3 right-3 h-5 w-5 text-purple-500" />}
                        
                        <div className="flex items-start gap-3">
                          <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${supporter.amount >= 49900 ? 'bg-gradient-to-br from-cyan-500 to-blue-500' : supporter.amount >= 14900 ? 'bg-gradient-to-br from-purple-500 to-violet-500' : supporter.amount >= 9900 ? 'bg-gradient-to-br from-yellow-500 to-amber-500' : 'bg-gradient-to-br from-pink-500 to-rose-500'} shadow-lg`}>
                            <Heart className="h-6 w-6 text-white fill-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-foreground truncate">
                                {supporter.name || 'Anonymous Supporter'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                ₹{(supporter.amount / 100).toLocaleString()}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(supporter.completed_at).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric'
                          })}
                              </span>
                            </div>
                            {supporter.message && <p className="text-sm text-muted-foreground mt-2 line-clamp-2 italic">
                                "{supporter.message}"
                              </p>}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>)}
              </div>
            </motion.div>}

          {/* Trust Footer */}
          <motion.div variants={itemVariants} className="mt-16 text-center">
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-500" />
                SSL Encrypted
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-blue-500" />
                Razorpay Protected
              </div>
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-pink-500" />
                Made with Love
              </div>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>;
};
export default Support;