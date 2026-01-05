import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Shield, Zap, CreditCard, Lock, Sparkles, ArrowRight, Gift } from 'lucide-react';

interface PremiumPlan {
  id: string;
  name: string;
  slug: string;
  price_inr: number;
  file_size_limit: number;
  expiration_days: number | null;
  features: string[];
}

interface PurchaseConfirmationDialogProps {
  plan: PremiumPlan;
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const PurchaseConfirmationDialog = ({
  plan,
  open,
  onConfirm,
  onCancel,
}: PurchaseConfirmationDialogProps) => {
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

  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <AlertDialogContent className="max-w-md p-0 overflow-hidden border-0 bg-card">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 border-b border-border/50">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
            <Sparkles className="absolute top-4 right-4 w-5 h-5 text-primary/30 animate-pulse" />
          </div>
          
          <AlertDialogHeader className="space-y-4 relative">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4 text-primary shadow-lg shadow-primary/10 animate-scale-in">
                {getPlanIcon(plan.slug)}
              </div>
              <AlertDialogTitle className="text-2xl font-black">
                Confirm Your Purchase
              </AlertDialogTitle>
              <AlertDialogDescription className="text-base mt-2">
                You're about to unlock the <span className="text-primary font-semibold">{plan.name}</span> plan
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>
        </div>

        {/* Plan Details */}
        <div className="p-6 space-y-5">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-muted/80 via-muted/50 to-transparent border border-border/50">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  {plan.name} Plan
                  <Gift className="w-4 h-4 text-primary" />
                </h3>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(plan.file_size_limit)} • {plan.expiration_days ? `${plan.expiration_days} days` : 'Lifetime'}
                </p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-black text-primary">{formatPrice(plan.price_inr)}</span>
                <Badge variant="secondary" className="block mt-1 bg-primary/10 text-primary text-xs border-0">
                  One-time
                </Badge>
              </div>
            </div>

            <div className="space-y-2.5 pt-4 border-t border-border/50">
              {plan.features.slice(0, 4).map((feature, i) => (
                <div 
                  key={i} 
                  className="flex items-center gap-3 text-sm group"
                >
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span>{feature}</span>
                </div>
              ))}
              {plan.features.length > 4 && (
                <p className="text-xs text-muted-foreground pl-8 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  +{plan.features.length - 4} more premium features
                </p>
              )}
            </div>
          </div>

          {/* Security badges */}
          <div className="flex items-center justify-center gap-4 py-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Lock className="w-3.5 h-3.5 text-primary" />
              <span>Secure</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-border" />
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CreditCard className="w-3.5 h-3.5 text-primary" />
              <span>Razorpay</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-border" />
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Shield className="w-3.5 h-3.5 text-primary" />
              <span>PCI Compliant</span>
            </div>
          </div>
        </div>

        <AlertDialogFooter className="p-6 pt-0 flex-col gap-3">
          <AlertDialogAction
            onClick={onConfirm}
            className="w-full h-12 bg-gradient-to-r from-primary via-primary to-primary/90 hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5 transition-all duration-300 font-bold text-base flex items-center justify-center gap-2"
          >
            Proceed to Payment
            <ArrowRight className="w-4 h-4" />
          </AlertDialogAction>
          <AlertDialogCancel 
            onClick={onCancel} 
            className="w-full h-11 border-2 hover:bg-muted/50 transition-all duration-300"
          >
            Cancel
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};