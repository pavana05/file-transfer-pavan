import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Sparkles, ArrowRight, Crown, Zap, Shield, PartyPopper, Download, Receipt, Star, Gift, Rocket } from 'lucide-react';
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
  const [showFeatures, setShowFeatures] = useState(false);

  useEffect(() => {
    if (open) {
      // Enhanced confetti animation
      const duration = 4000;
      const end = Date.now() + duration;

      // Navy blue themed colors
      const colors = ['#1953A0', '#2979D0', '#34D399', '#60A5FA', '#A78BFA'];

      const frame = () => {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 70,
          origin: { x: 0, y: 0.6 },
          colors: colors,
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 70,
          origin: { x: 1, y: 0.6 },
          colors: colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      
      frame();

      // Staggered content appearance
      setTimeout(() => setShowContent(true), 200);
      setTimeout(() => setShowFeatures(true), 600);
    } else {
      setShowContent(false);
      setShowFeatures(false);
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
        return <Zap className="w-12 h-12" />;
      case 'business':
        return <Crown className="w-12 h-12" />;
      default:
        return <Shield className="w-12 h-12" />;
    }
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
      <DialogContent className="max-w-lg p-0 overflow-hidden border-0 bg-transparent shadow-none">
        <div className="relative bg-card rounded-2xl overflow-hidden shadow-2xl">
          {/* Animated Header */}
          <div className="relative bg-gradient-to-br from-primary via-primary to-primary/80 p-8 text-center text-primary-foreground overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-20 -left-20 w-60 h-60 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '3s' }} />
              <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s', animationDelay: '1s' }} />
              
              {/* Floating sparkles */}
              <Sparkles className="absolute top-6 right-6 w-6 h-6 text-white/30 animate-pulse" />
              <Star className="absolute top-12 right-16 w-4 h-4 text-white/20 animate-bounce" style={{ animationDelay: '0.5s' }} />
              <Sparkles className="absolute bottom-6 left-6 w-5 h-5 text-white/25 animate-pulse" style={{ animationDelay: '1s' }} />
              <Star className="absolute bottom-12 left-16 w-3 h-3 text-white/15 animate-bounce" style={{ animationDelay: '1.5s' }} />
            </div>

            <div
              className={`relative transition-all duration-700 ease-out ${
                showContent ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
              }`}
            >
              {/* Success icon with animated ring */}
              <div className="relative w-24 h-24 mx-auto mb-5">
                <div className="absolute inset-0 rounded-full bg-white/20 animate-ping" style={{ animationDuration: '2s' }} />
                <div className="absolute inset-2 rounded-full bg-white/30 animate-pulse" />
                <div className="relative w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <CheckCircle2 className="w-14 h-14 text-white" />
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-2 mb-3">
                <PartyPopper className="w-5 h-5 animate-bounce" />
                <span className="text-sm font-bold uppercase tracking-widest">Congratulations!</span>
                <PartyPopper className="w-5 h-5 animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
              
              <h2 className="text-3xl md:text-4xl font-black">Payment Successful!</h2>
              <p className="mt-2 text-white/80 text-sm">Your premium features are now active</p>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 bg-card">
            {/* Plan Card */}
            <div
              className={`relative transition-all duration-700 delay-300 ${
                showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <div className="relative p-5 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 overflow-hidden">
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" 
                  style={{ animation: 'shimmer 3s infinite' }} 
                />
                
                <div className="absolute -top-3 left-4">
                  <Badge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg border-0 flex items-center gap-1">
                    <Rocket className="w-3 h-3" />
                    Now Active
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 mt-3">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary shadow-lg shadow-primary/10">
                    {getPlanIcon(plan.slug)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-black text-xl">{plan.name} Plan</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                      <Gift className="w-4 h-4 text-primary" />
                      {formatFileSize(plan.file_size_limit)} files • {plan.expiration_days ? `${plan.expiration_days} days` : 'Lifetime access'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-primary">{formatPrice(plan.price_inr)}</span>
                    <p className="text-xs text-muted-foreground">One-time</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Features Grid */}
            <div
              className={`transition-all duration-700 delay-500 ${
                showFeatures ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Features Unlocked
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {plan.features.slice(0, 6).map((feature, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 p-3 rounded-xl bg-muted/50 text-sm transition-all duration-300 hover:bg-primary/10 hover:scale-[1.02] group"
                    style={{ 
                      animationDelay: `${0.6 + i * 0.1}s`,
                      opacity: showFeatures ? 1 : 0,
                      transform: showFeatures ? 'translateY(0)' : 'translateY(10px)',
                      transition: `all 0.3s ease ${0.1 * i}s`
                    }}
                  >
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                      <CheckCircle2 className="w-3 h-3 text-primary" />
                    </div>
                    <span className="truncate text-xs font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div
              className={`space-y-3 pt-2 transition-all duration-700 delay-700 ${
                showFeatures ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  className="flex-1 gap-2 h-12 border-2 hover:bg-primary/5 hover:border-primary/30 transition-all duration-300"
                  onClick={handleDownloadInvoice}
                >
                  <Download className="w-4 h-4" />
                  Download Invoice
                </Button>
                <Button
                  className="flex-1 h-12 bg-gradient-to-r from-primary via-primary to-primary/90 hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5 transition-all duration-300 gap-2 font-bold"
                  onClick={handleStartSharing}
                >
                  Start Sharing
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-muted-foreground gap-2 hover:text-primary hover:bg-primary/5 transition-all duration-300"
                onClick={handleViewPaymentHistory}
              >
                <Receipt className="w-4 h-4" />
                View Payment History
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-primary" />
              A confirmation email has been sent to your registered email address.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};