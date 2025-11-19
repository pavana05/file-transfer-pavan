import { useEffect, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowAlert(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showAlert && isOnline) return null;

  return (
    <div className="fixed top-20 right-4 z-50 animate-fade-in">
      <Alert
        variant={isOnline ? 'default' : 'destructive'}
        className={`${
          isOnline 
            ? 'bg-success/10 border-success/50 text-success' 
            : 'bg-destructive/10 border-destructive/50'
        } backdrop-blur-sm shadow-lg`}
      >
        {isOnline ? (
          <Wifi className="h-4 w-4" />
        ) : (
          <WifiOff className="h-4 w-4" />
        )}
        <AlertDescription>
          {isOnline 
            ? 'Back online! All features available.' 
            : 'You are offline. Some features may be limited.'}
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default OfflineIndicator;
