import { useState } from 'react';
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
import { Check, Crown, Shield, Zap, CreditCard } from 'lucide-react';

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
        return <Zap className="w-8 h-8" />;
      case 'business':
        return <Crown className="w-8 h-8" />;
      default:
        return <Shield className="w-8 h-8" />;
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader className="space-y-4">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4 text-primary">
              {getPlanIcon(plan.slug)}
            </div>
            <AlertDialogTitle className="text-2xl">
              Confirm Your Purchase
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              You're about to upgrade to the {plan.name} plan
            </AlertDialogDescription>
          </div>
        </AlertDialogHeader>

        <div className="my-6 p-4 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg">{plan.name} Plan</h3>
              <p className="text-sm text-muted-foreground">
                {formatFileSize(plan.file_size_limit)} • {plan.expiration_days ? `${plan.expiration_days} days` : 'Lifetime'}
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-primary">{formatPrice(plan.price_inr)}</span>
              <Badge variant="secondary" className="block mt-1 bg-primary/10 text-primary text-xs">
                One-time
              </Badge>
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t border-border/50">
            {plan.features.slice(0, 4).map((feature, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-primary flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
            {plan.features.length > 4 && (
              <p className="text-xs text-muted-foreground pl-6">
                +{plan.features.length - 4} more features
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center mb-4">
          <CreditCard className="w-4 h-4" />
          <span>Secure payment via Razorpay</span>
        </div>

        <AlertDialogFooter className="sm:flex-col sm:space-x-0 gap-2">
          <AlertDialogAction
            onClick={onConfirm}
            className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
          >
            Proceed to Payment
          </AlertDialogAction>
          <AlertDialogCancel onClick={onCancel} className="w-full">
            Cancel
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
