import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, Smartphone, CheckCircle, Share2, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Install = () => {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user's response
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
    }

    // Clear the deferred prompt
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-8 md:p-12 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-primary shadow-glow">
            <Smartphone className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
            Install FileShare Pro
          </h1>
          <p className="text-lg text-muted-foreground">
            Get instant access to secure file sharing right from your home screen
          </p>
        </div>

        {/* Installation Status */}
        {isInstalled ? (
          <div className="bg-success/10 border border-success/20 rounded-xl p-6 text-center space-y-4">
            <CheckCircle className="w-12 h-12 text-success mx-auto" />
            <div>
              <h3 className="text-xl font-bold text-success mb-2">Already Installed!</h3>
              <p className="text-muted-foreground">
                FileShare Pro is ready to use from your home screen
              </p>
            </div>
            <Button onClick={() => navigate('/')} size="lg" className="w-full">
              Go to Home
            </Button>
          </div>
        ) : isInstallable ? (
          <div className="space-y-6">
            <Button
              onClick={handleInstall}
              size="lg"
              className="w-full text-lg py-8 shadow-glow hover:shadow-premium"
            >
              <Download className="w-6 h-6 mr-3" />
              Install App Now
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* iOS Instructions */}
            {isIOS && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Share2 className="w-6 h-6" />
                  Install on iPhone/iPad
                </h3>
                <ol className="space-y-3 text-muted-foreground">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                      1
                    </span>
                    <span>Tap the <Share2 className="inline w-4 h-4" /> Share button at the bottom of Safari</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                      2
                    </span>
                    <span>Scroll and tap <Plus className="inline w-4 h-4" /> "Add to Home Screen"</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                      3
                    </span>
                    <span>Tap "Add" in the top right corner</span>
                  </li>
                </ol>
              </div>
            )}

            {/* Android Instructions */}
            {isAndroid && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Download className="w-6 h-6" />
                  Install on Android
                </h3>
                <ol className="space-y-3 text-muted-foreground">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                      1
                    </span>
                    <span>Tap the menu icon (⋮) in Chrome</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                      2
                    </span>
                    <span>Tap "Add to Home Screen" or "Install App"</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                      3
                    </span>
                    <span>Tap "Install" or "Add"</span>
                  </li>
                </ol>
              </div>
            )}

            {/* General Instructions */}
            {!isIOS && !isAndroid && (
              <div className="bg-muted/50 rounded-xl p-6 space-y-4">
                <h3 className="text-xl font-bold">Install Instructions</h3>
                <p className="text-muted-foreground">
                  Look for an "Install" button in your browser's address bar or menu.
                  This will allow you to install FileShare Pro as an app on your device.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-4 pt-6 border-t">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6 text-primary" />
            </div>
            <h4 className="font-semibold">Works Offline</h4>
            <p className="text-sm text-muted-foreground">Access your files even without internet</p>
          </div>
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
              <Download className="w-6 h-6 text-primary" />
            </div>
            <h4 className="font-semibold">Fast Loading</h4>
            <p className="text-sm text-muted-foreground">Instant access from home screen</p>
          </div>
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
              <Smartphone className="w-6 h-6 text-primary" />
            </div>
            <h4 className="font-semibold">Native Feel</h4>
            <p className="text-sm text-muted-foreground">Works like a real mobile app</p>
          </div>
        </div>

        {/* Back Button */}
        {!isInstalled && (
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="w-full"
          >
            Maybe Later
          </Button>
        )}
      </Card>
    </div>
  );
};

export default Install;
