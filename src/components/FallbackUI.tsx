import { AlertCircle, RefreshCw, Home, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface FallbackUIProps {
  type?: 'error' | 'loading' | 'offline' | 'notFound';
  message?: string;
  description?: string;
  onRetry?: () => void;
}

export const FallbackUI = ({
  type = 'error',
  message,
  description,
  onRetry,
}: FallbackUIProps) => {
  const config = {
    error: {
      icon: AlertCircle,
      iconColor: 'text-destructive',
      bgColor: 'bg-destructive/10',
      title: message || 'Something went wrong',
      desc: description || 'An unexpected error occurred. Please try again.',
    },
    loading: {
      icon: RefreshCw,
      iconColor: 'text-primary',
      bgColor: 'bg-primary/10',
      title: message || 'Loading...',
      desc: description || 'Please wait while we load the content.',
    },
    offline: {
      icon: WifiOff,
      iconColor: 'text-warning',
      bgColor: 'bg-warning/10',
      title: message || 'No internet connection',
      desc:
        description ||
        'Please check your connection and try again.',
    },
    notFound: {
      icon: AlertCircle,
      iconColor: 'text-muted-foreground',
      bgColor: 'bg-muted/10',
      title: message || 'Page not found',
      desc: description || "The page you're looking for doesn't exist.",
    },
  };

  const { icon: Icon, iconColor, bgColor, title, desc } = config[type];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center space-y-6">
        <div className={`h-16 w-16 rounded-full ${bgColor} flex items-center justify-center mx-auto`}>
          <Icon className={`h-8 w-8 ${iconColor} ${type === 'loading' ? 'animate-spin' : ''}`} />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          <p className="text-muted-foreground">{desc}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {onRetry && (
            <Button onClick={onRetry} className="flex-1 gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          )}
          <Button
            onClick={() => (window.location.href = '/')}
            variant={onRetry ? 'outline' : 'default'}
            className="flex-1 gap-2"
          >
            <Home className="h-4 w-4" />
            Go Home
          </Button>
        </div>
      </Card>
    </div>
  );
};
