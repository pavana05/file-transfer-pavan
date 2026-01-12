import React from 'react';
import { X, Pause, Play, RotateCcw, Check, AlertCircle, File, Share, Copy, Code, FileText, Image, Video, Music, Archive, Database, Braces, Globe, Clock } from 'lucide-react';
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
  const {
    toast
  } = useToast();
  const copyShareLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "Link copied!",
      description: "Share link copied to clipboard."
    });
  };
  const getStatusIcon = (file: UploadedFile) => {
    switch (file.status) {
      case 'completed':
        return <Check className="w-4 h-4 text-success" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      case 'uploading':
        return <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />;
      case 'paused':
        return <Pause className="w-4 h-4 text-warning" />;
      default:
        return <File className="w-4 h-4 text-muted-foreground" />;
    }
  };
  const getFileTypeIcon = (file: UploadedFile) => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    const type = file.type.toLowerCase();

    // HTML Files
    if (extension === 'html' || extension === 'htm' || type === 'text/html') {
      return <Globe className="w-8 h-8 text-white drop-shadow-lg" />;
    }

    // JavaScript/TypeScript
    if (['js', 'jsx', 'ts', 'tsx'].includes(extension || '') || type.includes('javascript') || type.includes('typescript')) {
      return <Braces className="w-8 h-8 text-white drop-shadow-lg" />;
    }

    // CSS
    if (extension === 'css' || type === 'text/css') {
      return <Code className="w-8 h-8 text-white drop-shadow-lg" />;
    }

    // JSON/XML
    if (['json', 'xml', 'yaml', 'yml'].includes(extension || '') || type.includes('json') || type.includes('xml') || type.includes('yaml')) {
      return <Database className="w-8 h-8 text-white drop-shadow-lg" />;
    }

    // Programming languages
    if (['py', 'java', 'c', 'cpp', 'cs', 'php', 'rb', 'go', 'rs', 'swift', 'kt', 'scala', 'sql', 'r', 'dart', 'lua', 'perl', 'pl'].includes(extension || '')) {
      return <Code className="w-8 h-8 text-white drop-shadow-lg" />;
    }

    // Images
    if (type.startsWith('image/')) {
      return <Image className="w-8 h-8 text-white drop-shadow-lg" />;
    }

    // Videos
    if (type.startsWith('video/')) {
      return <Video className="w-8 h-8 text-white drop-shadow-lg" />;
    }

    // Audio
    if (type.startsWith('audio/')) {
      return <Music className="w-8 h-8 text-white drop-shadow-lg" />;
    }

    // Archives
    if (['zip', 'rar', 'tar', 'gz', '7z', 'bz2'].includes(extension || '') || type.includes('zip') || type.includes('rar') || type.includes('tar') || type.includes('gzip')) {
      return <Archive className="w-8 h-8 text-white drop-shadow-lg" />;
    }

    // Documents
    if (['pdf', 'doc', 'docx', 'txt', 'rtf', 'md'].includes(extension || '') || type.includes('pdf') || type.includes('document') || type === 'text/plain') {
      return <FileText className="w-8 h-8 text-white drop-shadow-lg" />;
    }

    // Default
    return <File className="w-8 h-8 text-white drop-shadow-lg" />;
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
    return <Badge variant={variants[status]} className={cn("text-xs", status === 'completed' && "bg-success text-success-foreground", status === 'uploading' && "bg-primary text-primary-foreground")}>
        {labels[status]}
      </Badge>;
  };
  if (files.length === 0) {
    return <Card className={cn("p-8 text-center text-muted-foreground", className)}>
        <File className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>No files uploaded yet</p>
      </Card>;
  }
  return <div className={cn("space-y-4", className)} data-file-list>
      {files.map(file => <Card key={file.id} className="p-3 sm:p-6 animate-fade-in transition-all duration-300 hover:shadow-glass border border-border/50 bg-background/80 backdrop-blur-sm rounded-xl group">
          <div className="flex items-start sm:items-center gap-2 sm:gap-3 flex-col sm:flex-row">
            {/* Mobile Layout: Icon and Actions Row */}
            <div className="flex items-center justify-between w-full sm:w-auto">
              {/* File Icon & Preview */}
              <div className="flex-shrink-0">
                {file.preview ? <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-muted shadow-inner ring-2 ring-border/20">
                    <img src={file.preview} alt={file.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div> : <div className={cn("w-12 h-12 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center shadow-inner relative", getFileTypeColor(file.type), "group-hover:scale-105 transition-transform duration-300")}>
                    <div className="absolute inset-0 rounded-xl bg-gradient-glass opacity-50"></div>
                    {getFileTypeIcon(file)}
                  </div>}
              </div>

              {/* Action Buttons - Mobile: Top Right */}
              <div className="flex items-center gap-1 sm:hidden">
                {file.status === 'uploading' && onPauseFile && <Button variant="ghost" size="sm" onClick={() => onPauseFile(file.id)} className="h-8 w-8 p-0">
                    <Pause className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>}
                
                {file.status === 'paused' && onResumeFile && <Button variant="ghost" size="sm" onClick={() => onResumeFile(file.id)} className="h-8 w-8 p-0">
                    <Play className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>}
                
                {file.status === 'error' && onRetryFile && <Button variant="ghost" size="sm" onClick={() => onRetryFile(file.id)} className="h-8 w-8 p-0">
                    <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>}
                
                <Button variant="ghost" size="sm" onClick={() => onRemoveFile(file.id)} className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive">
                  <X className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </div>
            </div>

            {/* File Info */}
            <div className="flex-1 min-w-0 w-full sm:w-auto">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h4 className="font-medium text-sm sm:text-base text-foreground truncate">
                  {file.name}
                </h4>
                {getStatusBadge(file.status)}
              </div>
              
              <div className="flex items-center gap-2 sm:gap-4 text-xs text-muted-foreground flex-wrap">
                <span>{formatFileSize(file.size)}</span>
                {file.metadata?.dimensions && <span>
                    {file.metadata.dimensions.width} × {file.metadata.dimensions.height}
                  </span>}
                {file.uploadedAt && <span>
                    {file.uploadedAt.toLocaleDateString()}
                  </span>}
              </div>

              {/* Progress Bar */}
              {showProgress && (file.status === 'uploading' || file.status === 'paused') && <div className="mt-3 p-4 rounded-xl bg-gradient-to-br from-card via-card to-muted/5 border border-border/40 shadow-sm animate-fade-in">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
                      <span className="text-sm font-semibold text-foreground">
                        {file.status === 'uploading' ? 'Uploading' : 'Paused'}
                      </span>
                    </div>
                    <span className="text-2xl font-bold text-primary tabular-nums transition-all duration-300">
                      {file.progress}%
                    </span>
                  </div>
                  
                  <div className="relative">
                    <Progress value={file.progress} className="h-2.5 bg-muted/50 shadow-inner" />
                    {/* Animated shimmer effect during upload */}
                    {file.status === 'uploading' && <div className="absolute inset-y-0 left-0 overflow-hidden rounded-full pointer-events-none" style={{
                width: `${file.progress}%`
              }}>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                      </div>}
                  </div>
                  
                  <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-4">
                      {file.uploadSpeed && file.uploadSpeed > 0 && <div className="flex items-center gap-1.5 animate-fade-in">
                          <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse"></div>
                          <span className="font-medium tabular-nums">
                            {formatFileSize(file.uploadSpeed)}/s
                          </span>
                        </div>}
                      {file.uploadedBytes && <span className="font-medium tabular-nums animate-fade-in" style={{
                  animationDelay: '0.1s'
                }}>
                          {formatFileSize(file.uploadedBytes)} / {formatFileSize(file.size)}
                        </span>}
                    </div>
                    
                    {file.estimatedTimeRemaining !== undefined && file.estimatedTimeRemaining > 0 && <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20 animate-fade-in" style={{
                animationDelay: '0.2s'
              }}>
                        <Clock className="h-3 w-3 text-primary" />
                        <span className="font-semibold text-primary tabular-nums">
                          {formatDuration(file.estimatedTimeRemaining)}
                        </span>
                      </div>}
                  </div>
                </div>}

              {/* Share Link */}
              {file.status === 'completed' && file.url && <div className="mt-3 group/share relative overflow-hidden">
                  {/* Gradient background with subtle animation */}
                  <div className="absolute inset-0 bg-gradient-to-r from-success/5 via-success/10 to-success/5 rounded-xl opacity-80"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent rounded-xl transform -skew-x-12 translate-x-[-100%] group-hover/share:translate-x-[200%] transition-transform duration-1000"></div>
                  
                  <div className="relative flex items-center gap-3 p-4 border border-success/20 rounded-xl backdrop-blur-sm hover:border-success/40 transition-all duration-300 hover:shadow-lg hover:shadow-success/10">
                    {/* Enhanced icon with glow effect */}
                    <div className="relative">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-success to-success/80 flex items-center justify-center shadow-lg group-hover/share:shadow-success/25 transition-all duration-300 group-hover/share:scale-110">
                        <Share className="w-5 h-5 text-white drop-shadow-sm" />
                      </div>
                      <div className="absolute inset-0 rounded-xl bg-success/20 blur-sm group-hover/share:bg-success/40 transition-all duration-300"></div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-foreground font-semibold block text-base font-mono text-justify my-0 mx-0">Ready to share 🎉 </span>
                        <div className="flex-1 h-px bg-gradient-to-r from-success/30 to-transparent"></div>
                      </div>
                      <div className="relative group/input">
                        
                        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-success/5 to-transparent opacity-0 group-hover/input:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                      </div>
                    </div>
                    
                    <Button variant="outline" size="sm" onClick={() => copyShareLink(file.url!)} className="h-10 border-success/30 hover:border-success/50 hover:bg-success/10 hover:text-success transition-all duration-300 hover:scale-105 hover:shadow-md group/copy relative overflow-hidden mx-[20px] px-[20px] mt-0 ml-[35px] mr-0">
                      <div className="absolute inset-0 bg-gradient-to-r from-success/10 to-transparent opacity-0 group-hover/copy:opacity-100 transition-opacity duration-300 mx-[10px]"></div>
                      <Copy className="w-4 h-4 mr-2 relative z-10" />
                      <span className="relative z-10 font-medium">Copy Link</span>
                    </Button>
                  </div>
                </div>}

              {/* Error Message */}
              {file.status === 'error' && file.error && <div className="mt-2 text-xs text-destructive bg-destructive/5 p-2 rounded">
                  {file.error}
                </div>}
            </div>

            {/* Action Buttons - Desktop: Right Side */}
            <div className="hidden sm:flex items-center gap-1">
              {file.status === 'uploading' && onPauseFile && <Button variant="ghost" size="sm" onClick={() => onPauseFile(file.id)} className="h-8 w-8 p-0">
                  <Pause className="w-4 h-4" />
                </Button>}
              
              {file.status === 'paused' && onResumeFile && <Button variant="ghost" size="sm" onClick={() => onResumeFile(file.id)} className="h-8 w-8 p-0">
                  <Play className="w-4 h-4" />
                </Button>}
              
              {file.status === 'error' && onRetryFile && <Button variant="ghost" size="sm" onClick={() => onRetryFile(file.id)} className="h-8 w-8 p-0">
                  <RotateCcw className="w-4 h-4" />
                </Button>}
              
              <Button variant="ghost" size="sm" onClick={() => onRemoveFile(file.id)} className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>)}
    </div>;
};