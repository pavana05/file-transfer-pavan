import React, { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import QrScanner from 'qr-scanner';
import { Camera, CameraOff } from 'lucide-react';

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

  useEffect(() => {
    if (isOpen && videoRef.current) {
      initializeScanner();
    }

    return () => {
      if (scanner) {
        scanner.destroy();
      }
    };
  }, [isOpen]);

  const initializeScanner = async () => {
    if (!videoRef.current) return;

    try {
      // Check if QR Scanner is supported
      const hasCamera = await QrScanner.hasCamera();
      if (!hasCamera) {
        setError('No camera found on this device');
        setHasPermission(false);
        return;
      }

      const qrScanner = new QrScanner(
        videoRef.current,
        (result) => {
          onScan(result.data);
          onClose();
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: 'environment' // Use back camera if available
        }
      );

      setScanner(qrScanner);
      await qrScanner.start();
      setHasPermission(true);
      setError('');
    } catch (err) {
      console.error('Error starting QR scanner:', err);
      setError('Failed to access camera. Please check permissions.');
      setHasPermission(false);
    }
  };

  const handleClose = () => {
    if (scanner) {
      scanner.destroy();
      setScanner(null);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Scan QR Code
          </DialogTitle>
        </DialogHeader>

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
            
            {hasPermission === null && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="text-white text-center">
                  <Camera className="w-8 h-8 mx-auto mb-2" />
                  <p>Initializing camera...</p>
                </div>
              </div>
            )}

            {hasPermission === false && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="text-white text-center">
                  <CameraOff className="w-8 h-8 mx-auto mb-2" />
                  <p>Camera access denied</p>
                </div>
              </div>
            )}
          </div>

          <div className="text-center text-sm text-muted-foreground">
            Position the QR code within the camera view to scan
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={initializeScanner} 
              disabled={hasPermission === false}
              className="flex-1"
            >
              Retry
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeScanner;