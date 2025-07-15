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
    <Card className={cn("p-10 bg-gradient-glass border border-border/50 backdrop-blur-sm rounded-3xl shadow-hover relative overflow-hidden", className)}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-50"></div>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <Upload className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">Upload Progress</h3>
          </div>
          <Badge 
            variant={overallProgress === 100 ? "default" : "secondary"}
            className={cn(
              "px-4 py-2 rounded-full font-semibold text-base shadow-lg",
              overallProgress === 100 && "bg-gradient-success text-white shadow-glow animate-pulse"
            )}
          >
            {completedFiles}/{totalFiles} files
          </Badge>
        </div>

        {/* Overall Progress */}
        <div className="space-y-4 relative">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground font-semibold text-lg">Overall Progress</span>
            <span className="text-3xl font-bold bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">{Math.round(overallProgress)}%</span>
          </div>
          <div className="relative">
            <Progress 
              value={overallProgress} 
              className="h-6 bg-muted/60 rounded-full shadow-inner"
            />
            <div className="absolute top-0 left-0 h-6 bg-gradient-primary rounded-full shadow-glow opacity-30 animate-pulse" 
                 style={{ width: `${overallProgress}%` }}
            ></div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-8 relative">
          {/* Total Size */}
          <div className="space-y-3 p-6 rounded-2xl bg-upload-zone/40 border border-border/40 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center gap-3 text-base text-muted-foreground">
              <div className="w-8 h-8 rounded-xl bg-primary/30 flex items-center justify-center shadow-inner">
                <Upload className="w-4 h-4 text-primary" />
              </div>
              <span className="font-semibold">Total Size</span>
            </div>
            <div className="text-xl font-bold text-foreground">
              {formatFileSize(uploadedSize)} / {formatFileSize(totalSize)}
            </div>
          </div>

          {/* Upload Speed */}
          <div className="space-y-3 p-6 rounded-2xl bg-accent/10 border border-border/40 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center gap-3 text-base text-muted-foreground">
              <div className="w-8 h-8 rounded-xl bg-accent/30 flex items-center justify-center shadow-inner">
                <Zap className="w-4 h-4 text-accent" />
              </div>
              <span className="font-semibold">Speed</span>
            </div>
            <div className="text-xl font-bold text-foreground">
              {uploadSpeed > 0 ? `${formatFileSize(uploadSpeed)}/s` : '--'}
            </div>
          </div>

          {/* Completed Files */}
          <div className="space-y-3 p-6 rounded-2xl bg-success/10 border border-border/40 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center gap-3 text-base text-muted-foreground">
              <div className="w-8 h-8 rounded-xl bg-success/30 flex items-center justify-center shadow-inner">
                <CheckCircle className="w-4 h-4 text-success" />
              </div>
              <span className="font-semibold">Completed</span>
            </div>
            <div className="text-xl font-bold text-success">
              {completedFiles}
            </div>
          </div>

          {/* Time Remaining */}
          <div className="space-y-3 p-6 rounded-2xl bg-warning/10 border border-border/40 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center gap-3 text-base text-muted-foreground">
              <div className="w-8 h-8 rounded-xl bg-warning/30 flex items-center justify-center shadow-inner">
                <Clock className="w-4 h-4 text-warning" />
              </div>
              <span className="font-semibold">Time Left</span>
            </div>
            <div className="text-xl font-bold text-foreground">
              {estimatedTimeRemaining > 0 && overallProgress < 100
                ? formatDuration(estimatedTimeRemaining)
                : '--'
              }
            </div>
          </div>
        </div>

        {/* Error Count */}
        {errors > 0 && (
          <div className="flex items-center gap-3 p-4 bg-destructive/10 rounded-xl border border-destructive/30 shadow-lg">
            <div className="w-8 h-8 rounded-xl bg-destructive/30 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-destructive" />
            </div>
            <span className="text-base text-destructive font-semibold">
              {errors} file{errors !== 1 ? 's' : ''} failed to upload
            </span>
          </div>
        )}

        {/* Completion Status */}
        {overallProgress === 100 && errors === 0 && (
          <div className="flex items-center gap-3 p-4 bg-success/10 rounded-xl border border-success/30 shadow-lg animate-fade-in">
            <div className="w-8 h-8 rounded-xl bg-success/30 flex items-center justify-center animate-pulse">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <span className="text-base text-success font-semibold">
              All files uploaded successfully!
            </span>
          </div>
        )}
      </div>
    </Card>
  );
};