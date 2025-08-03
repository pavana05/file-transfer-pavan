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
      QRCode.toCanvas(canvasRef.current, data, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }).catch(console.error);
    }
  }, [data, size]);

  return (
    <div className={`flex justify-center ${className}`}>
      <canvas 
        ref={canvasRef}
        className="border rounded-lg"
      />
    </div>
  );
};

export default QRCodeGenerator;