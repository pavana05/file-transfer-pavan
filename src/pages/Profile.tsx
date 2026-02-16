import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
  ArrowLeft, Crown, Zap, Shield, User, Mail, Calendar, CreditCard,
  CheckCircle2, Clock, HardDrive, LogOut, Receipt, Sparkles, TrendingUp,
  FileUp, Download, Heart, Diamond, Trophy, Star, Camera, Pencil, Save, X
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import PlanExpirationCountdown from '@/components/PlanExpirationCountdown';
import { ProfileFullSkeleton } from '@/components/skeletons/ProfileSkeleton';

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
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
      const [planRes, purchaseRes, filesRes, donationsRes, profileRes] = await Promise.all([
        supabase.rpc('get_user_premium_plan', { p_user_id: user.id }),
        supabase.from('premium_purchases').select(`id, amount_inr, purchased_at, status, razorpay_order_id, premium_plans (name, expiration_days)`).eq('user_id', user.id).order('purchased_at', { ascending: false }),
        supabase.from('uploaded_files').select('id, download_count').eq('user_id', user.id),
        supabase.from('donations').select('amount').eq('user_id', user.id).eq('status', 'completed'),
        supabase.from('profiles').select('display_name, avatar_url').eq('user_id', user.id).maybeSingle()
      ]);

      if (planRes.data && planRes.data.length > 0) {
        setPremiumPlan({
          ...planRes.data[0],
          features: Array.isArray(planRes.data[0].features) ? planRes.data[0].features : JSON.parse(planRes.data[0].features as string)
        });
      }

      if (purchaseRes.data) {
        const formattedPurchases = purchaseRes.data.map((p: any) => ({
          id: p.id, plan_name: p.premium_plans?.name || 'Unknown',
          amount_inr: p.amount_inr, purchased_at: p.purchased_at,
          status: p.status, razorpay_order_id: p.razorpay_order_id
        }));
        setPurchases(formattedPurchases);

        const latestCompleted = purchaseRes.data.find((p: any) => p.status === 'completed');
        if (latestCompleted && latestCompleted.premium_plans?.expiration_days) {
          setLatestPurchase({
            purchased_at: latestCompleted.purchased_at,
            expiration_days: latestCompleted.premium_plans.expiration_days,
            plan_name: latestCompleted.premium_plans.name
          });
        }
      }

      if (filesRes.data) {
        setFileStats({
          totalFiles: filesRes.data.length,
          totalDownloads: filesRes.data.reduce((sum, f) => sum + (f.download_count || 0), 0)
        });
      }

      if (donationsRes.data) {
        setDonationStats({
          totalDonated: donationsRes.data.reduce((sum, d) => sum + (d.amount || 0), 0),
          donationCount: donationsRes.data.length
        });
      }

      if (profileRes.data) {
        setDisplayName(profileRes.data.display_name || '');
        setAvatarUrl(profileRes.data.avatar_url || null);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a valid image (JPEG, PNG, WebP, or GIF)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const urlWithCacheBust = `${publicUrl}?t=${Date.now()}`;

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({ user_id: user.id, avatar_url: urlWithCacheBust, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });

      if (profileError) throw profileError;

      setAvatarUrl(urlWithCacheBust);
      toast.success('Profile photo updated!');
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      toast.error('Failed to upload photo. Please try again.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveDisplayName = async () => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({ user_id: user.id, display_name: editNameValue.trim() || null, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
      if (error) throw error;
      setDisplayName(editNameValue.trim());
      setIsEditingName(false);
      toast.success('Display name updated!');
    } catch (error) {
      toast.error('Failed to update name');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const formatPrice = (priceInPaise: number) => `₹${(priceInPaise / 100).toLocaleString('en-IN')}`;
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
  const formatFileSize = (bytes: number) => `${Math.round(bytes / (1024 * 1024 * 1024))}GB`;

  const getPlanIcon = () => {
    if (!premiumPlan) return <Shield className="w-7 h-7" />;
    if (premiumPlan.plan_name.toLowerCase().includes('business')) return <Crown className="w-7 h-7" />;
    if (premiumPlan.plan_name.toLowerCase().includes('pro')) return <Zap className="w-7 h-7" />;
    return <Shield className="w-7 h-7" />;
  };

  const getPlanGradient = () => {
    if (!premiumPlan) return 'from-slate-500 to-slate-600';
    const name = premiumPlan.plan_name.toLowerCase();
    if (name.includes('business')) return 'from-amber-500 to-orange-500';
    if (name.includes('pro')) return 'from-violet-500 to-purple-600';
    return 'from-blue-500 to-indigo-500';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  if (loading) return <ProfileFullSkeleton />;

  const userName = displayName || user?.email?.split('@')[0] || 'User';

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />

      {/* Premium Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-primary/8 via-primary/4 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-accent/8 to-transparent rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary)/0.03)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/0.03)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
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
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">

          {/* ── Profile Hero Card ── */}
          <motion.div variants={itemVariants}>
            <Card className="overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
              {/* Banner gradient */}
              <div className={`h-32 sm:h-40 bg-gradient-to-r ${getPlanGradient()} relative`}>
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.1)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.1)_50%,rgba(255,255,255,0.1)_75%,transparent_75%)] bg-[length:20px_20px]" />
                {premiumPlan && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-3 py-1.5 text-sm font-semibold">
                      {getPlanIcon()}
                      <span className="ml-2">{premiumPlan.plan_name} Plan</span>
                    </Badge>
                  </div>
                )}
              </div>

              <div className="px-6 pb-6">
                {/* Avatar + Name row */}
                <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-16 sm:-mt-14">
                  {/* Avatar */}
                  <div className="relative group">
                    <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl border-4 border-background shadow-xl overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-14 h-14 text-primary/60" />
                      )}
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingAvatar}
                      className="absolute inset-0 rounded-2xl bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer"
                    >
                      {uploadingAvatar ? (
                        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Camera className="w-7 h-7 text-white drop-shadow-lg" />
                      )}
                    </button>
                    {premiumPlan && (
                      <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg border-2 border-background">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Name & Email */}
                  <div className="flex-1 text-center sm:text-left pb-1">
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      {isEditingName ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={editNameValue}
                            onChange={(e) => setEditNameValue(e.target.value)}
                            placeholder="Enter display name"
                            className="h-9 w-48 text-lg font-bold"
                            autoFocus
                            onKeyDown={(e) => { if (e.key === 'Enter') handleSaveDisplayName(); if (e.key === 'Escape') setIsEditingName(false); }}
                          />
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleSaveDisplayName}>
                            <Save className="w-4 h-4 text-green-500" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setIsEditingName(false)}>
                            <X className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">{userName}</div>
                          <button
                            onClick={() => { setEditNameValue(displayName); setIsEditingName(true); }}
                            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                          >
                            <Pencil className="w-4 h-4 text-muted-foreground" />
                          </button>
                        </>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-2 justify-center sm:justify-start">
                      <Badge variant="secondary" className="gap-1.5 px-3 py-1 text-xs font-medium">
                        <Mail className="w-3 h-3" />
                        <span className="text-foreground/80">{user?.email}</span>
                      </Badge>
                      <Badge variant="secondary" className="gap-1.5 px-3 py-1 text-xs font-medium">
                        <Calendar className="w-3 h-3" />
                        <span className="text-foreground/80">
                          Joined {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'N/A'}
                        </span>
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* ── Stats Grid ── */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: FileUp, label: 'Files Uploaded', value: fileStats.totalFiles, gradient: 'from-blue-500/10 to-indigo-500/10', iconColor: 'text-blue-500' },
              { icon: Download, label: 'Total Downloads', value: fileStats.totalDownloads, gradient: 'from-emerald-500/10 to-green-500/10', iconColor: 'text-emerald-500' },
              { icon: HardDrive, label: 'Storage Limit', value: premiumPlan ? formatFileSize(premiumPlan.file_size_limit) : '10GB', gradient: 'from-amber-500/10 to-orange-500/10', iconColor: 'text-amber-500' },
              { icon: Trophy, label: 'Donations', value: donationStats.donationCount, gradient: 'from-pink-500/10 to-rose-500/10', iconColor: 'text-pink-500' },
            ].map((stat, i) => (
              <Card key={i} className="border-border/50 bg-card/60 backdrop-blur-sm hover:border-primary/30 transition-all group">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                      <p className="text-xl font-bold text-foreground">{stat.value}</p>
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

          {/* ── Supporter Badge ── */}
          {donationStats.totalDonated > 0 && (
            <motion.div variants={itemVariants}>
              <Card className={`relative overflow-hidden border-pink-500/20 ${
                donationStats.totalDonated >= 49900 
                  ? 'bg-gradient-to-br from-card via-cyan-500/5 to-blue-500/8' 
                  : donationStats.totalDonated >= 14900
                    ? 'bg-gradient-to-br from-card via-purple-500/5 to-violet-500/8'
                    : donationStats.totalDonated >= 9900
                      ? 'bg-gradient-to-br from-card via-yellow-500/5 to-amber-500/8'
                      : 'bg-gradient-to-br from-card via-pink-500/5 to-rose-500/8'
              }`}>
                {donationStats.totalDonated >= 49900 && (
                  <motion.div 
                    className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-cyan-500/15 to-transparent rounded-full blur-3xl"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                )}
                <CardHeader>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <motion.div 
                        className={`p-3.5 rounded-2xl shadow-lg ${
                          donationStats.totalDonated >= 49900 ? 'bg-gradient-to-br from-cyan-500 to-blue-500' 
                          : donationStats.totalDonated >= 14900 ? 'bg-gradient-to-br from-purple-500 to-violet-500'
                          : donationStats.totalDonated >= 9900 ? 'bg-gradient-to-br from-yellow-500 to-amber-500'
                          : 'bg-gradient-to-br from-pink-500 to-rose-500'
                        }`}
                        animate={donationStats.totalDonated >= 49900 ? { rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] } : {}}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        {donationStats.totalDonated >= 49900 ? <Diamond className="w-7 h-7 text-white" />
                        : donationStats.totalDonated >= 14900 ? <Crown className="w-7 h-7 text-white" />
                        : donationStats.totalDonated >= 9900 ? <Star className="w-7 h-7 text-white fill-white" />
                        : <Heart className="w-7 h-7 text-white fill-white" />}
                      </motion.div>
                      <div>
                        <CardTitle className="text-xl text-foreground">
                          {donationStats.totalDonated >= 49900 ? 'Diamond Supporter' 
                            : donationStats.totalDonated >= 14900 ? 'Premium Supporter'
                            : donationStats.totalDonated >= 9900 ? 'Star Supporter'
                            : 'Valued Supporter'}
                        </CardTitle>
                        <CardDescription className="text-sm text-muted-foreground">
                          Thank you for supporting FileShare Pro!
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className="bg-pink-500/10 text-pink-400 border-pink-500/20 px-3 py-1.5">
                      <Heart className="w-3.5 h-3.5 mr-1.5 fill-current" />
                      ₹{(donationStats.totalDonated / 100).toLocaleString()} donated
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Trophy className="w-4 h-4" />
                      {donationStats.donationCount} contribution{donationStats.donationCount !== 1 ? 's' : ''}
                    </span>
                    <Link to="/support" className="text-pink-400 hover:text-pink-300 hover:underline flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      Support again
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* ── Current Plan Card ── */}
          <motion.div variants={itemVariants}>
            <Card className="border-primary/20 bg-card/80 backdrop-blur-sm overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/8 to-transparent rounded-full blur-3xl pointer-events-none" />
              <CardHeader className="relative">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-3.5 rounded-2xl ${premiumPlan ? 'bg-gradient-to-br from-primary/20 to-accent/10 text-primary' : 'bg-muted text-muted-foreground'} shadow-lg`}>
                      {getPlanIcon()}
                    </div>
                    <div>
                      <CardTitle className="text-2xl text-foreground">
                        {premiumPlan ? premiumPlan.plan_name : 'Free'} Plan
                      </CardTitle>
                      <CardDescription className="text-sm text-muted-foreground">
                        {premiumPlan ? 'Premium member with full access' : 'Basic features included'}
                      </CardDescription>
                    </div>
                  </div>
                  {premiumPlan ? (
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-4 py-2">
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
                  {[
                    { icon: HardDrive, label: 'File Size Limit', value: premiumPlan ? formatFileSize(premiumPlan.file_size_limit) : '10GB' },
                    { icon: Clock, label: 'File Expiration', value: premiumPlan ? (premiumPlan.expiration_days ? `${premiumPlan.expiration_days} days` : 'Unlimited') : '7 days' },
                    { icon: TrendingUp, label: 'Account Status', value: 'Active', isActive: true }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 bg-background/60 rounded-2xl border border-border/50">
                      <item.icon className="w-5 h-5 text-primary flex-shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">{item.label}</p>
                        <p className={`font-bold text-foreground ${item.isActive ? 'text-emerald-400' : ''}`}>{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {premiumPlan && premiumPlan.features && premiumPlan.features.length > 0 && (
                  <>
                    <Separator className="my-6" />
                    <div>
                      <div className="text-sm font-semibold mb-4 flex items-center gap-2 text-foreground">
                        <Sparkles className="w-4 h-4 text-primary" />
                        Premium Features
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {premiumPlan.features.map((feature, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                            <span className="text-sm text-foreground">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* ── Purchase History ── */}
          <motion.div variants={itemVariants}>
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-muted">
                    <CreditCard className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-foreground">Purchase History</CardTitle>
                    <CardDescription className="text-muted-foreground">Your payment transactions</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {purchases.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted flex items-center justify-center">
                      <CreditCard className="w-8 h-8 text-muted-foreground/50" />
                    </div>
                    <p className="mb-4 text-muted-foreground">No purchases yet</p>
                    <Link to="/pricing" className="text-primary hover:underline text-sm font-medium">
                      View available plans →
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {purchases.map((purchase) => (
                      <div key={purchase.id} className="flex items-center justify-between p-4 bg-muted/20 rounded-2xl border border-border/50 hover:border-primary/20 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl ${purchase.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                            {purchase.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{purchase.plan_name} Plan</p>
                            <p className="text-sm text-muted-foreground">{purchase.purchased_at ? formatDate(purchase.purchased_at) : 'Pending'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-foreground">{formatPrice(purchase.amount_inr)}</p>
                          <Badge className={purchase.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}>
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

          {/* ── Quick Actions ── */}
          <motion.div variants={itemVariants} className="grid sm:grid-cols-3 gap-4">
            {[
              { to: '/dashboard', icon: HardDrive, title: 'My Files', desc: 'View uploaded files' },
              { to: '/payment-history', icon: Receipt, title: 'Payments', desc: 'View invoices' },
              { to: '/pricing', icon: Zap, title: 'Upgrade', desc: 'Get more features' },
            ].map((action) => (
              <Link key={action.to} to={action.to}>
                <Card className="hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all cursor-pointer h-full group bg-card/60">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 text-primary group-hover:scale-110 transition-transform">
                      <action.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-base font-semibold text-foreground leading-tight">{action.title}</div>
                      <p className="text-sm text-muted-foreground">{action.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default Profile;
