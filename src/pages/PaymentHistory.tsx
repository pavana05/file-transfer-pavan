import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ArrowLeft,
  Download,
  Receipt,
  CheckCircle2,
  Clock,
  XCircle,
  CreditCard,
  FileText,
  Crown,
  Zap,
  Shield,
} from 'lucide-react';
import { downloadInvoice } from '@/lib/invoice-generator';
import { format } from 'date-fns';

interface Purchase {
  id: string;
  plan_id: string;
  amount_inr: number;
  status: string;
  razorpay_order_id: string;
  razorpay_payment_id: string | null;
  purchased_at: string | null;
  created_at: string;
  plan?: {
    name: string;
    slug: string;
  };
}

const PaymentHistory = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadPurchases();
    }
  }, [user]);

  const loadPurchases = async () => {
    try {
      // First get purchases
      const { data: purchaseData, error: purchaseError } = await supabase
        .from('premium_purchases')
        .select('*')
        .order('created_at', { ascending: false });

      if (purchaseError) throw purchaseError;

      // Then get plan details for each purchase
      if (purchaseData && purchaseData.length > 0) {
        const planIds = [...new Set(purchaseData.map(p => p.plan_id))];
        const { data: planData } = await supabase
          .from('premium_plans')
          .select('id, name, slug')
          .in('id', planIds);

        const planMap = new Map(planData?.map(p => [p.id, p]) || []);
        
        const enrichedPurchases = purchaseData.map(purchase => ({
          ...purchase,
          plan: planMap.get(purchase.plan_id),
        }));

        setPurchases(enrichedPurchases);
      } else {
        setPurchases([]);
      }
    } catch (error) {
      console.error('Error loading purchases:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (priceInPaise: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(priceInPaise / 100);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-green-500/10 text-green-500 border-green-500/20 gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Completed
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 gap-1">
            <Clock className="w-3 h-3" />
            Pending
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-red-500/10 text-red-500 border-red-500/20 gap-1">
            <XCircle className="w-3 h-3" />
            Failed
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPlanIcon = (slug?: string) => {
    switch (slug) {
      case 'pro':
        return <Zap className="w-4 h-4" />;
      case 'business':
        return <Crown className="w-4 h-4" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  const handleDownloadInvoice = (purchase: Purchase) => {
    if (!user) return;

    const invoiceNumber = purchase.razorpay_order_id.replace('order_', '').slice(0, 8).toUpperCase();
    const purchaseDate = purchase.purchased_at || purchase.created_at;

    downloadInvoice({
      invoiceNumber,
      purchaseDate: format(new Date(purchaseDate), 'MMMM dd, yyyy'),
      planName: purchase.plan?.name || 'Premium',
      amount: purchase.amount_inr,
      userName: user.user_metadata?.full_name || user.user_metadata?.name || 'Customer',
      userEmail: user.email || '',
      paymentId: purchase.razorpay_payment_id || 'N/A',
      orderId: purchase.razorpay_order_id,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            to="/profile"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Profile</span>
          </Link>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Receipt className="w-4 h-4" />
            <span className="text-sm font-medium">Payment History</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Payment History</h1>
              <p className="text-muted-foreground text-sm">
                View all your past transactions and download invoices
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="border-border/50 bg-card/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="text-2xl font-bold">
                    {formatPrice(
                      purchases
                        .filter((p) => p.status === 'completed')
                        .reduce((sum, p) => sum + p.amount_inr, 0)
                    )}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Transactions</p>
                  <p className="text-2xl font-bold">{purchases.length}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Receipt className="w-5 h-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Successful</p>
                  <p className="text-2xl font-bold">
                    {purchases.filter((p) => p.status === 'completed').length}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transactions Table */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
            <CardDescription>
              A list of all your payment transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                ))}
              </div>
            ) : purchases.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                  <Receipt className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">No transactions yet</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Your payment history will appear here once you make a purchase
                </p>
                <Link to="/pricing">
                  <Button>View Plans</Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Plan</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Invoice</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchases.map((purchase) => (
                      <TableRow key={purchase.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                              {getPlanIcon(purchase.plan?.slug)}
                            </div>
                            <div>
                              <p className="font-medium">
                                {purchase.plan?.name || 'Premium'} Plan
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {purchase.razorpay_order_id.slice(0, 16)}...
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {format(
                                new Date(purchase.purchased_at || purchase.created_at),
                                'MMM dd, yyyy'
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(
                                new Date(purchase.purchased_at || purchase.created_at),
                                'hh:mm a'
                              )}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold">
                            {formatPrice(purchase.amount_inr)}
                          </span>
                        </TableCell>
                        <TableCell>{getStatusBadge(purchase.status)}</TableCell>
                        <TableCell className="text-right">
                          {purchase.status === 'completed' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-2"
                              onClick={() => handleDownloadInvoice(purchase)}
                            >
                              <Download className="w-4 h-4" />
                              Download
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Help Section */}
        <div className="mt-8 p-6 rounded-xl bg-muted/30 border border-border/50 text-center">
          <h3 className="font-semibold mb-2">Need help with a payment?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            If you have any questions about your transactions, please contact our support
            team.
          </p>
          <Button variant="outline" size="sm">
            Contact Support
          </Button>
        </div>
      </main>
    </div>
  );
};

export default PaymentHistory;
