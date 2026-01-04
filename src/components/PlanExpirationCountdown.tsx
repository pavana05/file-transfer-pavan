import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, AlertTriangle, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface PlanExpirationCountdownProps {
  purchaseDate: string;
  expirationDays: number | null;
  planName: string;
  className?: string;
}

export const PlanExpirationCountdown = ({
  purchaseDate,
  expirationDays,
  planName,
  className
}: PlanExpirationCountdownProps) => {
  const [timeRemaining, setTimeRemaining] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  } | null>(null);

  useEffect(() => {
    if (!expirationDays || !purchaseDate) {
      setTimeRemaining(null);
      return;
    }

    const calculateTimeRemaining = () => {
      const purchase = new Date(purchaseDate);
      const expiration = new Date(purchase);
      expiration.setDate(expiration.getDate() + expirationDays);

      const now = new Date();
      const diff = expiration.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true
        });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining({ days, hours, minutes, seconds, isExpired: false });
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [purchaseDate, expirationDays]);

  // If no expiration (unlimited) or no data, don't render
  if (!expirationDays || !timeRemaining) {
    return null;
  }

  const { days, hours, minutes, seconds, isExpired } = timeRemaining;
  const isUrgent = days <= 1 && !isExpired;

  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-300",
      isExpired 
        ? "border-destructive/50 bg-destructive/5" 
        : isUrgent 
          ? "border-yellow-500/50 bg-yellow-500/5 animate-pulse" 
          : "border-primary/20 bg-primary/5",
      className
    )}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          {isExpired ? (
            <AlertTriangle className="w-5 h-5 text-destructive" />
          ) : isUrgent ? (
            <Clock className="w-5 h-5 text-yellow-500 animate-bounce" />
          ) : (
            <Clock className="w-5 h-5 text-primary" />
          )}
          <span className={cn(
            "text-sm font-medium",
            isExpired ? "text-destructive" : isUrgent ? "text-yellow-600 dark:text-yellow-400" : "text-foreground"
          )}>
            {isExpired 
              ? `${planName} Plan Expired` 
              : `${planName} Plan - Time Remaining`}
          </span>
        </div>

        {isExpired ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Your plan has expired. Renew to continue using premium features.
            </p>
            <Link to="/pricing">
              <Button size="sm" className="w-full bg-gradient-to-r from-primary to-primary/80">
                <Crown className="w-4 h-4 mr-2" />
                Renew Plan
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-4 gap-2 mb-3">
              <TimeUnit value={days} label="Days" isUrgent={isUrgent} />
              <TimeUnit value={hours} label="Hours" isUrgent={isUrgent} />
              <TimeUnit value={minutes} label="Mins" isUrgent={isUrgent} />
              <TimeUnit value={seconds} label="Secs" isUrgent={isUrgent} />
            </div>
            
            {isUrgent && (
              <Link to="/pricing">
                <Button size="sm" variant="outline" className="w-full border-yellow-500/50 text-yellow-600 hover:bg-yellow-500/10">
                  <Crown className="w-4 h-4 mr-2" />
                  Renew Before Expiry
                </Button>
              </Link>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

const TimeUnit = ({ 
  value, 
  label, 
  isUrgent 
}: { 
  value: number; 
  label: string; 
  isUrgent: boolean;
}) => (
  <div className={cn(
    "text-center p-2 rounded-lg",
    isUrgent ? "bg-yellow-500/10" : "bg-background/50"
  )}>
    <div className={cn(
      "text-xl font-bold tabular-nums",
      isUrgent ? "text-yellow-600 dark:text-yellow-400" : "text-foreground"
    )}>
      {String(value).padStart(2, '0')}
    </div>
    <div className="text-xs text-muted-foreground">{label}</div>
  </div>
);

export default PlanExpirationCountdown;
