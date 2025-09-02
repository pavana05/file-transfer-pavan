import React from 'react';
import { Check, Copy, Share2, KeyRound, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface UploadSuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
  sharePin?: string;
  fileName: string;
}

const UploadSuccessDialog: React.FC<UploadSuccessDialogProps> = ({
  isOpen,
  onClose,
  shareUrl,
  sharePin,
  fileName
}) => {
  const { toast } = useToast();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: `${label} copied!`,
      description: `${label} has been copied to your clipboard.`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
              <Check className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl text-left">Upload Successful!</DialogTitle>
              <DialogDescription className="text-left">
                Your file has been uploaded and is ready to share.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* File Info */}
          <Card className="p-4 bg-muted/30 border-border/30">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-xs">
                {fileName}
              </Badge>
            </div>
          </Card>

          {/* PIN Section */}
          {sharePin && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-primary" />
                <h4 className="font-semibold">4-Digit PIN</h4>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-primary/5 to-accent/5 border-2 border-primary/20 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">Share this PIN with recipients:</p>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-2xl font-bold text-primary tracking-widest">
                      {sharePin}
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(sharePin, 'PIN')}
                  className="flex-shrink-0"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Recipients can access your file at <strong>/pin</strong> using this PIN
              </p>
            </div>
          )}

          {/* Share URL Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4 text-primary" />
              <h4 className="font-semibold">Direct Share Link</h4>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/30 border border-border/30 rounded-lg">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-mono truncate">{shareUrl}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(shareUrl, 'Share link')}
                className="flex-shrink-0"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => window.open(shareUrl, '_blank')}
              className="flex-1"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open File
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open('/pin', '_blank')}
              className="flex-1"
            >
              <KeyRound className="w-4 h-4 mr-2" />
              PIN Access
            </Button>
            <Button
              onClick={onClose}
              className="flex-1"
            >
              Done
            </Button>
          </div>

          {/* Info */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Keep the PIN safe - it's the only way to access your file without the direct link
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UploadSuccessDialog;