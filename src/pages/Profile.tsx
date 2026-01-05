import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
  Receipt
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
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(priceInPaise / 100);
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
    if (!premiumPlan) return <Shield className="w-6 h-6" />;
    if (premiumPlan.plan_name.toLowerCase().includes('business')) return <Crown className="w-6 h-6" />;
    if (premiumPlan.plan_name.toLowerCase().includes('pro')) return <Zap className="w-6 h-6" />;
    return <Shield className="w-6 h-6" />;
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
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Profile Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">My Profile</h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Plan Expiration Countdown - Only show for plans with expiration */}
          {latestPurchase && premiumPlan && (
            <PlanExpirationCountdown
              purchaseDate={latestPurchase.purchased_at}
              expirationDays={latestPurchase.expiration_days}
              planName={latestPurchase.plan_name}
            />
          )}
          {/* Current Plan Card */}
          <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${premiumPlan ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {getPlanIcon()}
                  </div>
                  <div>
                    <CardTitle className="text-xl">
                      {premiumPlan ? premiumPlan.plan_name : 'Free'} Plan
                    </CardTitle>
                    <CardDescription>
                      {premiumPlan ? 'Premium member' : 'Basic features'}
                    </CardDescription>
                  </div>
                </div>
                {premiumPlan ? (
                  <Badge className="bg-primary/20 text-primary border-primary/30">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                ) : (
                  <Link to="/pricing">
                    <Button size="sm">Upgrade</Button>
                  </Link>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-4 bg-background/50 rounded-lg">
                  <HardDrive className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">File Size Limit</p>
                    <p className="font-semibold">
                      {premiumPlan ? formatFileSize(premiumPlan.file_size_limit) : '1GB'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-background/50 rounded-lg">
                  <Clock className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">File Expiration</p>
                    <p className="font-semibold">
                      {premiumPlan 
                        ? (premiumPlan.expiration_days ? `${premiumPlan.expiration_days} days` : 'Unlimited')
                        : '7 days'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-background/50 rounded-lg">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Member Since</p>
                    <p className="font-semibold">
                      {user?.created_at ? formatDate(user.created_at) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {premiumPlan && premiumPlan.features && premiumPlan.features.length > 0 && (
                <>
                  <Separator className="my-6" />
                  <div>
                    <h4 className="text-sm font-medium mb-3">Plan Features</h4>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {premiumPlan.features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Purchase History */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-muted-foreground" />
                <div>
                  <CardTitle>Purchase History</CardTitle>
                  <CardDescription>Your payment transactions</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {purchases.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No purchases yet</p>
                  <Link to="/pricing" className="text-primary hover:underline text-sm mt-2 inline-block">
                    View available plans
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {purchases.map((purchase) => (
                    <div 
                      key={purchase.id} 
                      className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${
                          purchase.status === 'completed' 
                            ? 'bg-green-500/10 text-green-500' 
                            : 'bg-yellow-500/10 text-yellow-500'
                        }`}>
                          {purchase.status === 'completed' ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : (
                            <Clock className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{purchase.plan_name} Plan</p>
                          <p className="text-sm text-muted-foreground">
                            {purchase.purchased_at ? formatDate(purchase.purchased_at) : 'Pending'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatPrice(purchase.amount_inr)}</p>
                        <Badge 
                          variant={purchase.status === 'completed' ? 'default' : 'secondary'}
                          className={purchase.status === 'completed' ? 'bg-green-500/10 text-green-600 border-green-500/20' : ''}
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

          {/* Quick Actions */}
          <div className="grid sm:grid-cols-3 gap-4">
            <Link to="/dashboard">
              <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary">
                    <HardDrive className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">My Files</h3>
                    <p className="text-sm text-muted-foreground">View your uploaded files</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link to="/payment-history">
              <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">Payment History</h3>
                    <p className="text-sm text-muted-foreground">View transactions & invoices</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link to="/pricing">
              <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">Upgrade Plan</h3>
                    <p className="text-sm text-muted-foreground">Get more storage & features</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
