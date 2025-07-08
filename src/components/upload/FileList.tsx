import React from 'react';
import { X, Pause, Play, RotateCcw, Check, AlertCircle, File, Share, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { UploadedFile } from '@/types/upload';
import { formatFileSize, formatDuration, getFileTypeColor } from '@/lib/file-utils';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

  const copyShareLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "Link copied!",
      description: "Share link copied to clipboard.",
    });
  };
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
    <div className={cn("space-y-4", className)}>
      {files.map((file) => (
        <Card 
          key={file.id} 
          className="p-6 animate-fade-in transition-all duration-300 hover:shadow-glass border border-border/50 bg-background/80 backdrop-blur-sm rounded-xl group"
        >
          <div className="flex items-center gap-3">
            {/* File Icon & Preview */}
            <div className="flex-shrink-0">
              {file.preview ? (
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted shadow-inner ring-2 ring-border/20">
                  <img 
                    src={file.preview} 
                    alt={file.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ) : (
                <div className={cn(
                  "w-16 h-16 rounded-xl flex items-center justify-center shadow-inner relative",
                  getFileTypeColor(file.type),
                  "group-hover:scale-105 transition-transform duration-300"
                )}>
                  <div className="absolute inset-0 rounded-xl bg-gradient-glass opacity-50"></div>
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
                <div className="mt-3 p-3 rounded-lg bg-upload-zone/50 border border-border/30">
                  <Progress 
                    value={file.progress} 
                    className="h-3 bg-muted/50"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span className="font-medium">{file.progress}%</span>
                    {file.status === 'uploading' && (
                      <span className="animate-pulse">Uploading...</span>
                    )}
                  </div>
                </div>
              )}

              {/* Share Link */}
              {file.status === 'completed' && file.url && (
                <div className="mt-3 flex items-center gap-3 p-4 bg-muted/50 rounded-xl border border-border/50">
                  <div className="w-8 h-8 rounded-lg bg-success/20 flex items-center justify-center">
                    <Share className="w-4 h-4 text-success" />
                  </div>
                  <div className="flex-1">
                    <span className="text-foreground font-semibold text-sm block mb-1">Ready to share!</span>
                    <input 
                      type="text" 
                      value={file.url} 
                      readOnly 
                      className="w-full bg-transparent border-none outline-none text-foreground text-xs font-mono"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="default"
                    onClick={() => copyShareLink(file.url!)}
                    className="h-10 px-4 hover:bg-accent"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
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