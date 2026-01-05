import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Sparkles, ArrowRight, Crown, Zap, Shield, PartyPopper, Download, Receipt } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '@/contexts/AuthContext';
import { downloadInvoice } from '@/lib/invoice-generator';
import { format } from 'date-fns';

interface PremiumPlan {
  id: string;
  name: string;
  slug: string;
  price_inr: number;
  file_size_limit: number;
  expiration_days: number | null;
  features: string[];
}

interface PaymentSuccessDialogProps {
  plan: PremiumPlan;
  open: boolean;
  onClose: () => void;
  orderId?: string;
  paymentId?: string;
}

export const PaymentSuccessDialog = ({
  plan,
  open,
  onClose,
  orderId,
  paymentId,
}: PaymentSuccessDialogProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (open) {
      // Trigger confetti animation
      const duration = 3000;
      const end = Date.now() + duration;

      const colors = ['#8b5cf6', '#6366f1', '#a855f7', '#ec4899'];

      (function frame() {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors: colors,
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors: colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();

      // Delay content appearance for dramatic effect
      setTimeout(() => setShowContent(true), 300);
    } else {
      setShowContent(false);
    }
  }, [open]);

  const formatPrice = (priceInPaise: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(priceInPaise / 100);
  };

  const formatFileSize = (bytes: number) => {
    return `${Math.round(bytes / (1024 * 1024 * 1024))}GB`;
  };

  const getPlanIcon = (slug: string) => {
    switch (slug) {
      case 'pro':
        return <Zap className="w-10 h-10" />;
      case 'business':
        return <Crown className="w-10 h-10" />;
      default:
        return <Shield className="w-10 h-10" />;
    }
  };

  const handleGoToDashboard = () => {
    onClose();
    navigate('/dashboard');
  };

  const handleStartSharing = () => {
    onClose();
    navigate('/');
  };

  const handleDownloadInvoice = () => {
    if (!user) return;
    
    const invoiceNumber = (orderId || `INV${Date.now()}`).replace('order_', '').slice(0, 8).toUpperCase();
    
    downloadInvoice({
      invoiceNumber,
      purchaseDate: format(new Date(), 'MMMM dd, yyyy'),
      planName: plan.name,
      amount: plan.price_inr,
      userName: user.user_metadata?.full_name || user.user_metadata?.name || 'Customer',
      userEmail: user.email || '',
      paymentId: paymentId || 'N/A',
      orderId: orderId || 'N/A',
    });
  };

  const handleViewPaymentHistory = () => {
    onClose();
    navigate('/payment-history');
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-lg p-0 overflow-hidden border-0">
        {/* Gradient Header */}
        <div className="relative bg-gradient-to-br from-primary via-primary/90 to-primary/70 p-8 text-center text-primary-foreground">
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
            <Sparkles className="absolute top-4 right-4 w-6 h-6 text-white/40 animate-pulse" />
            <Sparkles className="absolute bottom-4 left-4 w-5 h-5 text-white/30 animate-pulse" />
          </div>

          <div
            className={`relative transition-all duration-500 ${
              showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
            
            <div className="flex items-center justify-center gap-2 mb-2">
              <PartyPopper className="w-5 h-5" />
              <span className="text-sm font-medium uppercase tracking-wider">Congratulations!</span>
              <PartyPopper className="w-5 h-5" />
            </div>
            
            <h2 className="text-2xl md:text-3xl font-bold">Payment Successful!</h2>
          </div>
        </div>

        {/* Content */}
        <div
          className={`p-6 space-y-6 bg-background transition-all duration-500 delay-200 ${
            showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          {/* Plan Card */}
          <div className="relative p-5 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20">
            <div className="absolute -top-3 left-4">
              <Badge className="bg-primary text-primary-foreground shadow-lg">
                Now Active
              </Badge>
            </div>
            
            <div className="flex items-center gap-4 mt-2">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary">
                {getPlanIcon(plan.slug)}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-xl">{plan.name} Plan</h3>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(plan.file_size_limit)} files • {plan.expiration_days ? `${plan.expiration_days} days` : 'Lifetime access'}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold text-primary">{formatPrice(plan.price_inr)}</span>
              </div>
            </div>
          </div>

          {/* What's Unlocked */}
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              What's Now Unlocked
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {plan.features.slice(0, 6).map((feature, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 text-sm"
                >
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="truncate">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={handleDownloadInvoice}
              >
                <Download className="w-4 h-4" />
                Download Invoice
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary gap-2"
                onClick={handleStartSharing}
              >
                Start Sharing
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground gap-2"
              onClick={handleViewPaymentHistory}
            >
              <Receipt className="w-4 h-4" />
              View Payment History
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            A confirmation email has been sent to your registered email address.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
