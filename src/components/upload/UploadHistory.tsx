import React from 'react';
import { History, Copy, ExternalLink, Trash2, X, Lock, FileIcon, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { UploadHistoryItem } from '@/hooks/useUploadHistory';
import { formatDistanceToNow } from 'date-fns';

interface UploadHistoryProps {
  history: UploadHistoryItem[];
  onRemove: (id: string) => void;
  onClear: () => void;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getFileTypeIcon(fileType: string): string {
  if (fileType.startsWith('image/')) return '🖼️';
  if (fileType.startsWith('video/')) return '🎬';
  if (fileType.startsWith('audio/')) return '🎵';
  if (fileType.includes('pdf')) return '📄';
  if (fileType.includes('document') || fileType.includes('word')) return '📝';
  if (fileType.includes('spreadsheet') || fileType.includes('excel')) return '📊';
  if (fileType.includes('presentation') || fileType.includes('powerpoint')) return '📽️';
  if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('tar')) return '📦';
  return '📁';
}

export const UploadHistory: React.FC<UploadHistoryProps> = ({
  history,
  onRemove,
  onClear,
}) => {
  const { toast } = useToast();

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "Link copied!",
      description: "Share link copied to clipboard.",
    });
  };

  const handleCopyPin = (pin: string) => {
    navigator.clipboard.writeText(pin);
    toast({
      title: "PIN copied!",
      description: "Access PIN copied to clipboard.",
    });
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 relative"
        >
          <History className="h-4 w-4" />
          <span className="hidden sm:inline">History</span>
          {history.length > 0 && (
            <Badge 
              variant="secondary" 
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {history.length}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader className="pb-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              Upload History
            </SheetTitle>
            {history.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                    Clear All
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear upload history?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will remove all {history.length} items from your local upload history. 
                      Your uploaded files will still be accessible via their share links.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onClear} className="bg-destructive hover:bg-destructive/90">
                      Clear History
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </SheetHeader>

        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <FileIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No upload history</h3>
            <p className="text-muted-foreground text-sm max-w-[250px]">
              Your recent uploads will appear here for quick access to share links and PINs.
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-120px)] mt-4 -mx-6 px-6">
            <div className="space-y-3 pb-4">
              {history.map((item) => (
                <Card key={item.id} className="p-4 relative group">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => onRemove(item.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>

                  <div className="flex items-start gap-3 pr-8">
                    <div className="text-2xl flex-shrink-0">
                      {getFileTypeIcon(item.fileType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate mb-1" title={item.fileName}>
                        {item.fileName}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                        <span>{formatFileSize(item.fileSize)}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(item.uploadedAt), { addSuffix: true })}
                        </span>
                        {item.hasPassword && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-warning">
                              <Lock className="h-3 w-3" />
                              Protected
                            </span>
                          </>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs gap-1.5"
                          onClick={() => handleCopyLink(item.shareUrl)}
                        >
                          <Copy className="h-3 w-3" />
                          Copy Link
                        </Button>
                        {item.sharePin && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs gap-1.5 font-mono"
                            onClick={() => handleCopyPin(item.sharePin!)}
                          >
                            PIN: {item.sharePin}
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs gap-1.5"
                          onClick={() => window.open(item.shareUrl, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3" />
                          Open
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </SheetContent>
    </Sheet>
  );
};
