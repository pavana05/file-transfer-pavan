import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QrScanner from 'qr-scanner';
import { Camera, ScanLine, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

const ScanQR = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scanner, setScanner] = useState<QrScanner | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string>('');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (scanner) {
        scanner.stop();
        scanner.destroy();
      }
    };
  }, [scanner]);

  const startScanner = async () => {
    if (!videoRef.current) return;

    try {
      setError('');
      setScanning(true);

      const qrScanner = new QrScanner(
        videoRef.current,
        (result) => handleScan(result.data),
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: 'environment',
          maxScansPerSecond: 5,
        }
      );

      await qrScanner.start();
      setScanner(qrScanner);
      setHasPermission(true);

      toast({
        title: 'Scanner Active',
        description: 'Point your camera at a QR code to scan',
      });
    } catch (err: any) {
      console.error('Scanner error:', err);
      setScanning(false);
      setHasPermission(false);
      
      if (err.name === 'NotAllowedError') {
        setError('Camera permission denied. Please allow camera access to scan QR codes.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found on this device.');
      } else {
        setError('Failed to start camera. Please try again.');
      }
    }
  };

  const stopScanner = () => {
    if (scanner) {
      scanner.stop();
      scanner.destroy();
      setScanner(null);
    }
    setScanning(false);
  };

  const handleScan = (data: string) => {
    try {
      console.log('Scanned data:', data);
      
      // Parse the URL to extract PIN
      const url = new URL(data);
      const pin = url.searchParams.get('pin');
      
      if (pin) {
        stopScanner();
        toast({
          title: 'QR Code Scanned!',
          description: 'Redirecting to file access...',
        });
        
        // Navigate to PIN access page with the scanned PIN
        setTimeout(() => {
          navigate(`/pin?pin=${pin}`);
        }, 500);
      } else {
        toast({
          title: 'Invalid QR Code',
          description: 'This QR code does not contain a valid file PIN.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error('Failed to parse QR code:', err);
      toast({
        title: 'Invalid QR Code',
        description: 'Unable to read this QR code. Please try another one.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-primary-glow/5 via-transparent to-transparent"></div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <h1 className="text-xl font-bold">Scan QR Code</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-32 pb-16">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Instructions */}
          <Card className="p-6 sm:p-8 bg-card/50 backdrop-blur-sm border-border/50">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/25">
                <Camera className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-2">Quick File Access</h2>
                <p className="text-muted-foreground">
                  Scan a QR code to instantly access shared files. Make sure to allow camera permissions when prompted.
                </p>
              </div>
            </div>
          </Card>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="animate-fade-in">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Scanner Card */}
          <Card className="overflow-hidden bg-card/50 backdrop-blur-sm border-2 border-border/50">
            <div className="relative aspect-square bg-black">
              {!scanning && (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-background/40 backdrop-blur-sm">
                  <div className="text-center space-y-6 p-8">
                    <div className="inline-flex h-24 w-24 rounded-full bg-gradient-to-br from-primary to-primary-glow items-center justify-center shadow-2xl shadow-primary/30">
                      <ScanLine className="h-12 w-12 text-primary-foreground animate-pulse" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-foreground">Ready to Scan</h3>
                      <p className="text-sm text-muted-foreground">
                        Click the button below to activate your camera
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                style={{ display: scanning ? 'block' : 'none' }}
              />
              
              {scanning && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-0 border-4 border-primary/30 rounded-lg m-8"></div>
                  <div className="absolute top-1/2 left-0 right-0 h-1 bg-primary/50 animate-pulse"></div>
                </div>
              )}
            </div>

            <div className="p-6 space-y-4">
              {!scanning ? (
                <Button
                  onClick={startScanner}
                  size="lg"
                  className="w-full h-14 text-base gap-2"
                >
                  <Camera className="h-5 w-5" />
                  Start Camera
                </Button>
              ) : (
                <Button
                  onClick={stopScanner}
                  size="lg"
                  variant="destructive"
                  className="w-full h-14 text-base gap-2"
                >
                  Stop Scanning
                </Button>
              )}
            </div>
          </Card>

          {/* Tips */}
          <Card className="p-6 bg-muted/30 border-border/50">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-primary" />
              Scanning Tips
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Hold your device steady and ensure good lighting</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Position the QR code within the camera frame</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>The scan will happen automatically when detected</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Make sure to allow camera permissions in your browser</span>
              </li>
            </ul>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ScanQR;
