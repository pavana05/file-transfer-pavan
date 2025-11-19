import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Download, X, QrCode, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface QRCodeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pin: string;
  fileName?: string;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({ open, onOpenChange, pin, fileName }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    if (open && canvasRef.current && pin) {
      console.log('Generating QR code for PIN:', pin);
      generateQRCode();
    }
  }, [open, pin]);

  const generateQRCode = async () => {
    if (!canvasRef.current) {
      console.log('Canvas ref not available');
      return;
    }

    try {
      console.log('Starting QR code generation...');
      // Generate QR code with PIN and current URL
      const currentUrl = window.location.origin;
      const qrData = `${currentUrl}/pin?pin=${pin}`;
      console.log('QR data:', qrData);

      await QRCode.toCanvas(canvasRef.current, qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'H',
      });
      console.log('Canvas QR code generated successfully');

      // Also generate data URL for download
      const dataUrl = await QRCode.toDataURL(qrData, {
        width: 800,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'H',
      });
      setQrDataUrl(dataUrl);
      console.log('Data URL QR code generated successfully');
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate QR code',
        variant: 'destructive',
      });
    }
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;

    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `qr-code-${pin}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'Downloaded',
      description: 'QR code saved successfully',
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        // Convert data URL to blob
        const response = await fetch(qrDataUrl);
        const blob = await response.blob();
        const file = new File([blob], `qr-code-${pin}.png`, { type: 'image/png' });

        await navigator.share({
          title: 'File Access QR Code',
          text: `Scan this QR code to access the file${fileName ? `: ${fileName}` : ''}`,
          files: [file],
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      toast({
        title: 'Share not supported',
        description: 'Use the download button to save the QR code',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-primary" />
            QR Code Access
          </DialogTitle>
          <DialogDescription>
            Scan this QR code with any mobile device to access the file instantly
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* QR Code Display */}
          <div className="flex justify-center p-6 bg-white rounded-2xl border-2 border-border/50">
            <canvas
              ref={canvasRef}
              className="rounded-xl"
              style={{ display: 'block' }}
            />
          </div>

          {/* PIN Display */}
          <div className="text-center p-4 bg-muted/30 rounded-xl border border-border/50">
            <p className="text-sm text-muted-foreground mb-2">PIN Code</p>
            <p className="text-3xl font-bold font-mono tracking-wider text-foreground">
              {pin}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleDownload}
              className="flex-1 h-12"
              variant="outline"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            {navigator.share && (
              <Button
                onClick={handleShare}
                className="flex-1 h-12"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeModal;
