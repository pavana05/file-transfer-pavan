import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { UploadStats as IUploadStats } from '@/types/upload';
import { formatFileSize, formatDuration } from '@/lib/file-utils';
import { cn } from '@/lib/utils';

interface UploadStatsProps {
  stats: IUploadStats;
  className?: string;
}

export const UploadStats: React.FC<UploadStatsProps> = ({ stats, className }) => {
  const {
    totalFiles,
    completedFiles,
    totalSize,
    uploadedSize,
    overallProgress,
    uploadSpeed,
    estimatedTimeRemaining,
    errors
  } = stats;

  return (
    <Card className={cn("p-8 bg-gradient-glass border border-border/50 backdrop-blur-sm rounded-2xl shadow-glass", className)}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">Upload Progress</h3>
          <Badge 
            variant={overallProgress === 100 ? "default" : "secondary"}
            className={cn(
              "px-3 py-1 rounded-full font-medium",
              overallProgress === 100 && "bg-gradient-success text-white shadow-glow"
            )}
          >
            {completedFiles}/{totalFiles} files
          </Badge>
        </div>

        {/* Overall Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground font-medium">Overall Progress</span>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">{Math.round(overallProgress)}%</span>
          </div>
          <div className="relative">
            <Progress 
              value={overallProgress} 
              className="h-4 bg-muted/50 rounded-full shadow-inner"
            />
            <div className="absolute top-0 left-0 h-4 bg-gradient-primary rounded-full shadow-glow opacity-20 animate-pulse" 
                 style={{ width: `${overallProgress}%` }}
            ></div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-6">
          {/* Total Size */}
          <div className="space-y-2 p-4 rounded-xl bg-upload-zone/30 border border-border/30">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center">
                <Upload className="w-3 h-3 text-primary" />
              </div>
              <span className="font-medium">Total Size</span>
            </div>
            <div className="text-lg font-bold text-foreground">
              {formatFileSize(uploadedSize)} / {formatFileSize(totalSize)}
            </div>
          </div>

          {/* Upload Speed */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Upload className="w-4 h-4" />
              <span>Speed</span>
            </div>
            <div className="text-lg font-semibold">
              {uploadSpeed > 0 ? `${formatFileSize(uploadSpeed)}/s` : '--'}
            </div>
          </div>

          {/* Completed Files */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="w-4 h-4" />
              <span>Completed</span>
            </div>
            <div className="text-lg font-semibold text-success">
              {completedFiles}
            </div>
          </div>

          {/* Time Remaining */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Time Left</span>
            </div>
            <div className="text-lg font-semibold">
              {estimatedTimeRemaining > 0 && overallProgress < 100
                ? formatDuration(estimatedTimeRemaining)
                : '--'
              }
            </div>
          </div>
        </div>

        {/* Error Count */}
        {errors > 0 && (
          <div className="flex items-center gap-2 p-3 bg-destructive/5 rounded-lg">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <span className="text-sm text-destructive font-medium">
              {errors} file{errors !== 1 ? 's' : ''} failed to upload
            </span>
          </div>
        )}

        {/* Completion Status */}
        {overallProgress === 100 && errors === 0 && (
          <div className="flex items-center gap-2 p-3 bg-success/5 rounded-lg">
            <CheckCircle className="w-5 h-5 text-success" />
            <span className="text-sm text-success font-medium">
              All files uploaded successfully!
            </span>
          </div>
        )}
      </div>
    </Card>
  );
};