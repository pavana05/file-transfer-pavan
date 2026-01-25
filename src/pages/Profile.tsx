import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Crown, 
  Zap, 
  Shield, 
  User, 
  Mail, 
  Calendar, 
  CreditCard,
  CheckCircle2,
  Clock,
  HardDrive,
  LogOut,
  Receipt,
  Settings,
  Bell,
  Sparkles,
  TrendingUp,
  FileUp,
  Download,
  Heart,
  Diamond,
  Trophy,
  Star
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import PlanExpirationCountdown from '@/components/PlanExpirationCountdown';

interface UserPremiumPlan {
  plan_name: string;
  file_size_limit: number;
  expiration_days: number | null;
  features: string[];
}

interface PurchaseHistory {
  id: string;
  plan_name: string;
  amount_inr: number;
  purchased_at: string;
  status: string;
  razorpay_order_id: string;
}

interface LatestPurchase {
  purchased_at: string;
  expiration_days: number | null;
  plan_name: string;
}

const Profile = () => {
  const [premiumPlan, setPremiumPlan] = useState<UserPremiumPlan | null>(null);
  const [purchases, setPurchases] = useState<PurchaseHistory[]>([]);
  const [latestPurchase, setLatestPurchase] = useState<LatestPurchase | null>(null);
  const [loading, setLoading] = useState(true);
  const [fileStats, setFileStats] = useState({ totalFiles: 0, totalDownloads: 0 });
  const [donationStats, setDonationStats] = useState({ totalDonated: 0, donationCount: 0 });
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadUserData();
  }, [user, navigate]);

  const loadUserData = async () => {
    if (!user) return;
    
    try {
      // Get user's premium plan
      const { data: planData } = await supabase
        .rpc('get_user_premium_plan', { p_user_id: user.id });
      
      if (planData && planData.length > 0) {
        setPremiumPlan({
          ...planData[0],
          features: Array.isArray(planData[0].features) 
            ? planData[0].features 
            : JSON.parse(planData[0].features as string)
        });
      }

      // Get purchase history
      const { data: purchaseData } = await supabase
        .from('premium_purchases')
        .select(`
          id,
          amount_inr,
          purchased_at,
          status,
          razorpay_order_id,
          premium_plans (name, expiration_days)
        `)
        .eq('user_id', user.id)
        .order('purchased_at', { ascending: false });

      if (purchaseData) {
        const formattedPurchases = purchaseData.map((p: any) => ({
          id: p.id,
          plan_name: p.premium_plans?.name || 'Unknown',
          amount_inr: p.amount_inr,
          purchased_at: p.purchased_at,
          status: p.status,
          razorpay_order_id: p.razorpay_order_id
        }));
        setPurchases(formattedPurchases);

        // Get the latest completed purchase for countdown
        const latestCompleted = purchaseData.find((p: any) => p.status === 'completed');
        if (latestCompleted && latestCompleted.premium_plans?.expiration_days) {
          setLatestPurchase({
            purchased_at: latestCompleted.purchased_at,
            expiration_days: latestCompleted.premium_plans.expiration_days,
            plan_name: latestCompleted.premium_plans.name
          });
        }
      }

      // Get file stats
      const { data: filesData } = await supabase
        .from('uploaded_files')
        .select('id, download_count')
        .eq('user_id', user.id);

      if (filesData) {
        setFileStats({
          totalFiles: filesData.length,
          totalDownloads: filesData.reduce((sum, f) => sum + (f.download_count || 0), 0)
        });
      }

      // Get donation stats
      const { data: donationsData } = await supabase
        .from('donations')
        .select('amount')
        .eq('user_id', user.id)
        .eq('status', 'completed');

      if (donationsData) {
        setDonationStats({
          totalDonated: donationsData.reduce((sum, d) => sum + (d.amount || 0), 0),
          donationCount: donationsData.length
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const formatPrice = (priceInPaise: number) => {
    const priceInRupees = priceInPaise / 100;
    return `₹${priceInRupees.toLocaleString('en-IN')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatFileSize = (bytes: number) => {
    return `${Math.round(bytes / (1024 * 1024 * 1024))}GB`;
  };

  const getPlanIcon = () => {
    if (!premiumPlan) return <Shield className="w-8 h-8" />;
    if (premiumPlan.plan_name.toLowerCase().includes('business')) return <Crown className="w-8 h-8" />;
    if (premiumPlan.plan_name.toLowerCase().includes('pro')) return <Zap className="w-8 h-8" />;
    return <Shield className="w-8 h-8" />;
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
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <User className="absolute inset-0 m-auto w-6 h-6 text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Premium Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-primary/10 via-primary/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-accent/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary)/0.02)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/0.02)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      {/* Header */}
      <header className="relative border-b border-border/40 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="outline" size="sm" onClick={handleSignOut} className="gap-2">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative container mx-auto px-4 py-8 md:py-12 max-w-5xl">
        <motion.div 
          variants={containerVariants} 
          initial="hidden" 
          animate="visible"
          className="space-y-8"
        >
          {/* Profile Header */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-primary/20 shadow-xl shadow-primary/10">
                <User className="w-12 h-12 text-primary" />
              </div>
              {premiumPlan && (
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">My Profile</h1>
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="secondary" className="gap-2 px-3 py-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  {user?.email}
                </Badge>
                {premiumPlan && (
                  <Badge className="bg-gradient-to-r from-primary/10 to-accent/10 text-primary border-primary/20 gap-2 px-3 py-1.5">
                    {getPlanIcon()}
                    {premiumPlan.plan_name} Plan
                  </Badge>
                )}
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: FileUp, label: 'Files Uploaded', value: fileStats.totalFiles, color: 'primary' },
              { icon: Download, label: 'Total Downloads', value: fileStats.totalDownloads, color: 'success' },
              { icon: HardDrive, label: 'Storage Limit', value: premiumPlan ? formatFileSize(premiumPlan.file_size_limit) : '1GB', color: 'warning' },
              { icon: Calendar, label: 'Member Since', value: user?.created_at ? new Date(user.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'N/A', color: 'accent' },
            ].map((stat, i) => (
              <Card key={i} className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-${stat.color}/10 flex items-center justify-center`}>
                      <stat.icon className={`w-5 h-5 text-${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                      <p className="text-lg font-bold">{stat.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          {/* Plan Expiration Countdown */}
          {latestPurchase && premiumPlan && (
            <motion.div variants={itemVariants}>
              <PlanExpirationCountdown
                purchaseDate={latestPurchase.purchased_at}
                expirationDays={latestPurchase.expiration_days}
                planName={latestPurchase.plan_name}
              />
            </motion.div>
          )}

          {/* Supporter Badge - Premium animation for donors */}
          {donationStats.totalDonated > 0 && (
            <motion.div variants={itemVariants}>
              <Card className={`relative overflow-hidden border-pink-500/30 ${
                donationStats.totalDonated >= 49900 
                  ? 'bg-gradient-to-br from-card via-cyan-500/5 to-blue-500/10' 
                  : donationStats.totalDonated >= 14900
                    ? 'bg-gradient-to-br from-card via-purple-500/5 to-violet-500/10'
                    : donationStats.totalDonated >= 9900
                      ? 'bg-gradient-to-br from-card via-yellow-500/5 to-amber-500/10'
                      : 'bg-gradient-to-br from-card via-pink-500/5 to-rose-500/10'
              }`}>
                {/* Animated glow for high donors */}
                {donationStats.totalDonated >= 49900 && (
                  <>
                    <motion.div 
                      className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-cyan-500/20 to-transparent rounded-full blur-3xl"
                      animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />
                    <motion.div 
                      className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-500/20 to-transparent rounded-full blur-3xl"
                      animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
                      transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
                    />
                  </>
                )}
                
                <CardHeader className="relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <motion.div 
                        className={`p-4 rounded-2xl shadow-lg ${
                          donationStats.totalDonated >= 49900 
                            ? 'bg-gradient-to-br from-cyan-500 to-blue-500' 
                            : donationStats.totalDonated >= 14900
                              ? 'bg-gradient-to-br from-purple-500 to-violet-500'
                              : donationStats.totalDonated >= 9900
                                ? 'bg-gradient-to-br from-yellow-500 to-amber-500'
                                : 'bg-gradient-to-br from-pink-500 to-rose-500'
                        }`}
                        animate={donationStats.totalDonated >= 49900 ? { 
                          rotate: [0, 5, -5, 0],
                          scale: [1, 1.05, 1]
                        } : {}}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        {donationStats.totalDonated >= 49900 ? (
                          <Diamond className="w-8 h-8 text-white" />
                        ) : donationStats.totalDonated >= 14900 ? (
                          <Crown className="w-8 h-8 text-white" />
                        ) : donationStats.totalDonated >= 9900 ? (
                          <Star className="w-8 h-8 text-white fill-white" />
                        ) : (
                          <Heart className="w-8 h-8 text-white fill-white" />
                        )}
                      </motion.div>
                      <div>
                        <CardTitle className="text-2xl flex items-center gap-2">
                          {donationStats.totalDonated >= 49900 ? 'Diamond Supporter' 
                            : donationStats.totalDonated >= 14900 ? 'Premium Supporter'
                            : donationStats.totalDonated >= 9900 ? 'Star Supporter'
                            : 'Valued Supporter'}
                          {donationStats.totalDonated >= 49900 && (
                            <motion.span
                              animate={{ rotate: [0, 360] }}
                              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                            >
                              ✨
                            </motion.span>
                          )}
                        </CardTitle>
                        <CardDescription className="text-base">
                          Thank you for supporting FileShare Pro!
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={`px-4 py-2 ${
                      donationStats.totalDonated >= 49900 
                        ? 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20' 
                        : donationStats.totalDonated >= 14900
                          ? 'bg-purple-500/10 text-purple-500 border-purple-500/20'
                          : 'bg-pink-500/10 text-pink-500 border-pink-500/20'
                    }`}>
                      <Heart className="w-4 h-4 mr-2 fill-current" />
                      ₹{(donationStats.totalDonated / 100).toLocaleString()} donated
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Trophy className="w-4 h-4" />
                      {donationStats.donationCount} contribution{donationStats.donationCount !== 1 ? 's' : ''}
                    </span>
                    <Link to="/support" className="text-pink-500 hover:underline flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      Support again
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Current Plan Card */}
          <motion.div variants={itemVariants}>
            <Card className="border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-3xl" />
              <CardHeader className="relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-2xl ${premiumPlan ? 'bg-gradient-to-br from-primary/20 to-accent/10 text-primary' : 'bg-muted text-muted-foreground'} shadow-lg`}>
                      {getPlanIcon()}
                    </div>
                    <div>
                      <CardTitle className="text-2xl">
                        {premiumPlan ? premiumPlan.plan_name : 'Free'} Plan
                      </CardTitle>
                      <CardDescription className="text-base">
                        {premiumPlan ? 'Premium member with full access' : 'Basic features included'}
                      </CardDescription>
                    </div>
                  </div>
                  {premiumPlan ? (
                    <Badge className="bg-success/10 text-success border-success/20 px-4 py-2">
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Active
                    </Badge>
                  ) : (
                    <Link to="/pricing">
                      <Button className="bg-gradient-to-r from-primary to-accent hover:shadow-xl hover:shadow-primary/25 transition-all">
                        <Sparkles className="w-4 h-4 mr-2" />
                        Upgrade Now
                      </Button>
                    </Link>
                  )}
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="grid sm:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center gap-3 p-4 bg-background/50 rounded-2xl border border-border/50">
                    <HardDrive className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">File Size Limit</p>
                      <p className="font-bold">
                        {premiumPlan ? formatFileSize(premiumPlan.file_size_limit) : '1GB'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-background/50 rounded-2xl border border-border/50">
                    <Clock className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">File Expiration</p>
                      <p className="font-bold">
                        {premiumPlan 
                          ? (premiumPlan.expiration_days ? `${premiumPlan.expiration_days} days` : 'Unlimited')
                          : '7 days'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-background/50 rounded-2xl border border-border/50">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Account Status</p>
                      <p className="font-bold text-success">Active</p>
                    </div>
                  </div>
                </div>

                {premiumPlan && premiumPlan.features && premiumPlan.features.length > 0 && (
                  <>
                    <Separator className="my-6" />
                    <div>
                      <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        Premium Features
                      </h4>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {premiumPlan.features.map((feature, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 bg-success/5 rounded-xl border border-success/10">
                            <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Purchase History */}
          <motion.div variants={itemVariants}>
            <Card className="border-border/50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-muted">
                    <CreditCard className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <CardTitle>Purchase History</CardTitle>
                    <CardDescription>Your payment transactions</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {purchases.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted flex items-center justify-center">
                      <CreditCard className="w-8 h-8 opacity-50" />
                    </div>
                    <p className="mb-4">No purchases yet</p>
                    <Link to="/pricing" className="text-primary hover:underline text-sm font-medium">
                      View available plans →
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {purchases.map((purchase) => (
                      <div 
                        key={purchase.id} 
                        className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border/50 hover:border-primary/20 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl ${
                            purchase.status === 'completed' 
                              ? 'bg-success/10 text-success' 
                              : 'bg-warning/10 text-warning'
                          }`}>
                            {purchase.status === 'completed' ? (
                              <CheckCircle2 className="w-5 h-5" />
                            ) : (
                              <Clock className="w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold">{purchase.plan_name} Plan</p>
                            <p className="text-sm text-muted-foreground">
                              {purchase.purchased_at ? formatDate(purchase.purchased_at) : 'Pending'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">{formatPrice(purchase.amount_inr)}</p>
                          <Badge 
                            className={purchase.status === 'completed' ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning border-warning/20'}
                          >
                            {purchase.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants} className="grid sm:grid-cols-3 gap-4">
            <Link to="/dashboard">
              <Card className="hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all cursor-pointer h-full group">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 text-primary group-hover:scale-110 transition-transform">
                    <HardDrive className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">My Files</h3>
                    <p className="text-sm text-muted-foreground">View uploaded files</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link to="/payment-history">
              <Card className="hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all cursor-pointer h-full group">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 text-primary group-hover:scale-110 transition-transform">
                    <Receipt className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Payments</h3>
                    <p className="text-sm text-muted-foreground">View invoices</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link to="/pricing">
              <Card className="hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all cursor-pointer h-full group">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 text-primary group-hover:scale-110 transition-transform">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Upgrade</h3>
                    <p className="text-sm text-muted-foreground">Get more features</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default Profile;