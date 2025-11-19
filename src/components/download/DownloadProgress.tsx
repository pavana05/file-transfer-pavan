import React from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatFileSize, formatDuration } from '@/lib/file-utils';

interface DownloadProgressProps {
  fileName: string;
  progress: number;
  downloadedBytes: number;
  totalBytes: number;
  speed: number;
  timeRemaining: number;
}

const DownloadProgress: React.FC<DownloadProgressProps> = ({
  fileName,
  progress,
  downloadedBytes,
  totalBytes,
  speed,
  timeRemaining,
}) => {
  return (
    <Card className="fixed bottom-6 right-6 p-6 w-96 shadow-2xl border-2 border-primary/20 bg-background/95 backdrop-blur-xl animate-in slide-in-from-bottom-5 duration-300 z-50">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent flex items-center justify-center flex-shrink-0 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent animate-[shimmer_2s_ease-in-out_infinite]" 
               style={{ transform: 'translateX(-100%)' }} />
          <Loader2 className="h-6 w-6 text-primary animate-spin" />
        </div>
        
        <div className="flex-1 space-y-3">
          <div>
            <h4 className="font-semibold text-foreground text-sm mb-1 line-clamp-1">
              {fileName}
            </h4>
            <p className="text-xs text-muted-foreground">
              Downloading...
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">
                {formatFileSize(downloadedBytes)} / {formatFileSize(totalBytes)}
              </span>
              <span className="font-semibold text-primary">
                {Math.round(progress)}%
              </span>
            </div>
            
            <Progress value={progress} className="h-2" />
            
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Download className="h-3 w-3" />
                {formatFileSize(speed)}/s
              </span>
              <span>
                {timeRemaining > 0 ? formatDuration(timeRemaining) + ' left' : 'Calculating...'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default DownloadProgress;
