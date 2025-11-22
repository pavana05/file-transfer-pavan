import React from 'react';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface UploadProgressIndicatorProps {
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error' | 'paused';
  uploadSpeed?: number;
  estimatedTimeRemaining?: number;
  uploadedBytes?: number;
  totalBytes: number;
  fileName: string;
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
};

const formatSpeed = (bytesPerSecond: number): string => {
  return `${formatBytes(bytesPerSecond)}/s`;
};

const formatTime = (seconds: number): string => {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  return `${minutes}m ${remainingSeconds}s`;
};

export const UploadProgressIndicator: React.FC<UploadProgressIndicatorProps> = ({
  progress,
  status,
  uploadSpeed,
  estimatedTimeRemaining,
  uploadedBytes,
  totalBytes,
  fileName,
}) => {
  const isCompleted = status === 'completed';
  const isError = status === 'error';
  const isUploading = status === 'uploading';
  const isPaused = status === 'paused';

  return (
    <div className="space-y-3">
      {/* Progress Bar with Animation */}
      <div className="relative">
        <Progress 
          value={progress} 
          className={cn(
            "h-2 transition-all duration-300",
            isCompleted && "bg-primary/20",
            isError && "bg-destructive/20"
          )}
        />
        
        {/* Animated shimmer effect during upload */}
        {isUploading && (
          <div 
            className="absolute inset-0 overflow-hidden rounded-full"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite]" 
              style={{
                backgroundSize: '200% 100%',
                animation: 'shimmer 2s infinite'
              }}
            />
          </div>
        )}
      </div>

      {/* Status Info */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          {isCompleted && (
            <CheckCircle2 className="w-4 h-4 text-primary animate-scale-in" />
          )}
          {isUploading && (
            <Loader2 className="w-4 h-4 text-primary animate-spin" />
          )}
          {isError && (
            <AlertCircle className="w-4 h-4 text-destructive animate-scale-in" />
          )}
          {isPaused && (
            <div className="w-4 h-4 rounded-full border-2 border-muted-foreground" />
          )}
          
          <span className={cn(
            "font-medium transition-colors duration-300",
            isCompleted && "text-primary",
            isError && "text-destructive",
            isUploading && "text-foreground",
            isPaused && "text-muted-foreground"
          )}>
            {isCompleted && "Completed"}
            {isUploading && `${progress}%`}
            {isError && "Failed"}
            {isPaused && "Paused"}
            {status === 'pending' && "Pending"}
          </span>
        </div>

        {/* Upload Details */}
        <div className="flex items-center gap-3 text-muted-foreground text-xs">
          {isUploading && uploadedBytes !== undefined && (
            <span className="animate-fade-in">
              {formatBytes(uploadedBytes)} / {formatBytes(totalBytes)}
            </span>
          )}
          
          {isUploading && uploadSpeed !== undefined && (
            <span className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              {formatSpeed(uploadSpeed)}
            </span>
          )}
          
          {isUploading && estimatedTimeRemaining !== undefined && estimatedTimeRemaining > 0 && (
            <span className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              ~{formatTime(estimatedTimeRemaining)} left
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
