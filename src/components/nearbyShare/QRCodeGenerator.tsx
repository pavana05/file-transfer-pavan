import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

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
      // Get computed styles to use theme colors
      const isDark = document.documentElement.classList.contains('dark');
      
      QRCode.toCanvas(canvasRef.current, data, {
        width: size,
        margin: 4,
        color: {
          dark: isDark ? '#FFFFFF' : '#000000',
          light: isDark ? '#000000' : '#FFFFFF'
        }
      }).catch(console.error);
    }
  }, [data, size]);

  return (
    <div className={`flex justify-center ${className}`}>
      <canvas 
        ref={canvasRef}
        className="border rounded-lg bg-background shadow-sm"
      />
    </div>
  );
};

export default QRCodeGenerator;