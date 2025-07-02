import React from 'react';
import { X, Pause, Play, RotateCcw, Check, AlertCircle, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { UploadedFile } from '@/types/upload';
import { formatFileSize, formatDuration, getFileTypeColor } from '@/lib/file-utils';

interface FileListProps {
  files: UploadedFile[];
  onRemoveFile: (fileId: string) => void;
  onPauseFile?: (fileId: string) => void;
  onResumeFile?: (fileId: string) => void;
  onRetryFile?: (fileId: string) => void;
  showProgress?: boolean;
  className?: string;
}

export const FileList: React.FC<FileListProps> = ({
  files,
  onRemoveFile,
  onPauseFile,
  onResumeFile,
  onRetryFile,
  showProgress = true,
  className
}) => {
  const getStatusIcon = (file: UploadedFile) => {
    switch (file.status) {
      case 'completed':
        return <Check className="w-4 h-4 text-success" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      case 'uploading':
        return (
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        );
      case 'paused':
        return <Pause className="w-4 h-4 text-warning" />;
      default:
        return <File className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: UploadedFile['status']) => {
    const variants = {
      pending: 'secondary',
      uploading: 'default',
      completed: 'default',
      error: 'destructive',
      paused: 'outline'
    } as const;

    const labels = {
      pending: 'Pending',
      uploading: 'Uploading',
      completed: 'Completed',
      error: 'Error',
      paused: 'Paused'
    };

    return (
      <Badge 
        variant={variants[status]}
        className={cn(
          "text-xs",
          status === 'completed' && "bg-success text-success-foreground",
          status === 'uploading' && "bg-primary text-primary-foreground"
        )}
      >
        {labels[status]}
      </Badge>
    );
  };

  if (files.length === 0) {
    return (
      <Card className={cn("p-8 text-center text-muted-foreground", className)}>
        <File className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>No files uploaded yet</p>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {files.map((file) => (
        <Card 
          key={file.id} 
          className="p-4 animate-fade-in transition-all duration-200 hover:shadow-hover"
        >
          <div className="flex items-center gap-3">
            {/* File Icon & Preview */}
            <div className="flex-shrink-0">
              {file.preview ? (
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
                  <img 
                    src={file.preview} 
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className={cn(
                  "w-12 h-12 rounded-lg flex items-center justify-center",
                  getFileTypeColor(file.type)
                )}>
                  {getStatusIcon(file)}
                </div>
              )}
            </div>

            {/* File Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-sm text-foreground truncate">
                  {file.name}
                </h4>
                {getStatusBadge(file.status)}
              </div>
              
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>{formatFileSize(file.size)}</span>
                {file.metadata?.dimensions && (
                  <span>
                    {file.metadata.dimensions.width} × {file.metadata.dimensions.height}
                  </span>
                )}
                {file.uploadedAt && (
                  <span>
                    {file.uploadedAt.toLocaleDateString()}
                  </span>
                )}
              </div>

              {/* Progress Bar */}
              {showProgress && (file.status === 'uploading' || file.status === 'paused') && (
                <div className="mt-2">
                  <Progress 
                    value={file.progress} 
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{file.progress}%</span>
                    {file.status === 'uploading' && (
                      <span>Uploading...</span>
                    )}
                  </div>
                </div>
              )}

              {/* Error Message */}
              {file.status === 'error' && file.error && (
                <div className="mt-2 text-xs text-destructive bg-destructive/5 p-2 rounded">
                  {file.error}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1">
              {file.status === 'uploading' && onPauseFile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onPauseFile(file.id)}
                  className="h-8 w-8 p-0"
                >
                  <Pause className="w-4 h-4" />
                </Button>
              )}
              
              {file.status === 'paused' && onResumeFile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onResumeFile(file.id)}
                  className="h-8 w-8 p-0"
                >
                  <Play className="w-4 h-4" />
                </Button>
              )}
              
              {file.status === 'error' && onRetryFile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRetryFile(file.id)}
                  className="h-8 w-8 p-0"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveFile(file.id)}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};