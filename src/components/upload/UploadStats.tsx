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
    <Card className={cn("p-6", className)}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Upload Progress</h3>
          <Badge variant={overallProgress === 100 ? "default" : "secondary"}>
            {completedFiles}/{totalFiles} files
          </Badge>
        </div>

        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="font-medium">{Math.round(overallProgress)}%</span>
          </div>
          <Progress 
            value={overallProgress} 
            className="h-3"
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Total Size */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Upload className="w-4 h-4" />
              <span>Total Size</span>
            </div>
            <div className="text-lg font-semibold">
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