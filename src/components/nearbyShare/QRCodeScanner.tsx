import React, { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import QrScanner from 'qr-scanner';
import { Camera, CameraOff, Loader2 } from 'lucide-react';

interface QRCodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (data: string) => void;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ isOpen, onClose, onScan }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scanner, setScanner] = useState<QrScanner | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string>('');
  const [isInitializing, setIsInitializing] = useState(false);

  useEffect(() => {
    if (isOpen && videoRef.current) {
      initializeScanner();
    }

    return () => {
      if (scanner) {
        scanner.destroy();
        setScanner(null);
      }
    };
  }, [isOpen]);

  const initializeScanner = async () => {
    if (!videoRef.current) return;

    setIsInitializing(true);
    setError('');

    try {
      // Check if QR Scanner is supported
      const hasCamera = await QrScanner.hasCamera();
      if (!hasCamera) {
        setError('No camera found on this device');
        setHasPermission(false);
        setIsInitializing(false);
        return;
      }

      const qrScanner = new QrScanner(
        videoRef.current,
        (result) => {
          console.log('QR Code scanned:', result.data);
          onScan(result.data);
          onClose();
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: 'environment', // Use back camera if available
          maxScansPerSecond: 5,
          returnDetailedScanResult: true
        }
      );

      setScanner(qrScanner);
      await qrScanner.start();
      setHasPermission(true);
      setError('');
    } catch (err) {
      console.error('Error starting QR scanner:', err);
      let errorMessage = 'Failed to access camera. ';
      
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          errorMessage += 'Please allow camera access and try again.';
        } else if (err.name === 'NotFoundError') {
          errorMessage += 'No camera found on this device.';
        } else if (err.name === 'NotSupportedError') {
          errorMessage += 'Camera not supported on this device.';
        } else {
          errorMessage += 'Please check permissions and try again.';
        }
      } else {
        errorMessage += 'Please check permissions and try again.';
      }
      
      setError(errorMessage);
      setHasPermission(false);
    } finally {
      setIsInitializing(false);
    }
  };

  const handleClose = () => {
    if (scanner) {
      scanner.destroy();
      setScanner(null);
    }
    setHasPermission(null);
    setError('');
    setIsInitializing(false);
    onClose();
  };

  const handleRetry = () => {
    if (scanner) {
      scanner.destroy();
      setScanner(null);
    }
    setHasPermission(null);
    setError('');
    initializeScanner();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md w-[95vw]" aria-describedby="qr-scanner-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Scan QR Code
          </DialogTitle>
        </DialogHeader>

        <div id="qr-scanner-description" className="sr-only">
          QR code scanner interface for joining nearby share rooms
        </div>

        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <CameraOff className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="relative aspect-square bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />
            
            {isInitializing && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="text-white text-center">
                  <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin" />
                  <p>Initializing camera...</p>
                </div>
              </div>
            )}

            {hasPermission === null && !isInitializing && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="text-white text-center">
                  <Camera className="w-8 h-8 mx-auto mb-2" />
                  <p>Preparing scanner...</p>
                </div>
              </div>
            )}

            {hasPermission === false && !isInitializing && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="text-white text-center">
                  <CameraOff className="w-8 h-8 mx-auto mb-2" />
                  <p>Camera access denied</p>
                </div>
              </div>
            )}

            {hasPermission === true && !error && (
              <div className="absolute inset-0 pointer-events-none">
                {/* Scanning overlay */}
                <div className="absolute inset-4 border-2 border-white/50 rounded-lg">
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-white rounded-tl-lg"></div>
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-white rounded-tr-lg"></div>
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-white rounded-bl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-white rounded-br-lg"></div>
                </div>
                <div className="absolute bottom-8 left-0 right-0 text-center">
                  <p className="text-white text-sm bg-black/50 px-3 py-1 rounded-full inline-block">
                    Position QR code within the frame
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleRetry} 
              disabled={isInitializing}
              className="flex-1"
            >
              {isInitializing ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {isInitializing ? 'Initializing...' : 'Retry'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeScanner;