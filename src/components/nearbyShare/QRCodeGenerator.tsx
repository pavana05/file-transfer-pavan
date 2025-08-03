import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { QrCode, Sparkles } from 'lucide-react';

interface QRCodeGeneratorProps {
  data: string;
  size?: number;
  className?: string;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ 
  data, 
  size = 256, 
  className = '' 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && data) {
      QRCode.toCanvas(canvasRef.current, data, {
        width: size,
        margin: 3,
        color: {
          dark: '#1f2937', // Dark gray for better contrast
          light: '#ffffff'
        },
        errorCorrectionLevel: 'M'
      }).catch(console.error);
    }
  }, [data, size]);

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative">
        {/* Decorative background */}
        <div className="absolute -inset-4 bg-gradient-primary rounded-2xl opacity-20 blur-xl" />
        <div className="absolute -inset-2 bg-gradient-glass rounded-xl border border-border/30 backdrop-blur-sm" />
        
        {/* QR Code container */}
        <div className="relative bg-white rounded-xl p-4 shadow-glow border border-border/20">
          <canvas 
            ref={canvasRef}
            className="rounded-lg"
          />
          
          {/* Center logo overlay */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-primary/20">
              <QrCode className="w-4 h-4 text-primary" />
            </div>
          </div>
        </div>
        
        {/* Sparkle effects */}
        <div className="absolute -top-2 -right-2">
          <Sparkles className="w-4 h-4 text-primary animate-pulse" />
        </div>
        <div className="absolute -bottom-2 -left-2">
          <Sparkles className="w-3 h-3 text-accent animate-pulse" style={{ animationDelay: '0.5s' }} />
        </div>
      </div>
      
      <p className="text-xs text-muted-foreground mt-3 text-center max-w-xs">
        Scan with any device to join the room instantly
      </p>
    </div>
  );
};

export default QRCodeGenerator;