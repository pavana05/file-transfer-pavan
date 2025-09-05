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
      <DialogContent className="w-screen h-screen max-w-none max-h-none m-0 p-8 bg-gradient-mesh border-0 backdrop-blur-xl overflow-y-auto">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background/90"></div>
        <div className="absolute -top-4 -right-4 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-accent/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col justify-center min-h-screen py-8">
          <DialogHeader>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6">
              <div className="w-16 h-16 sm:w-14 sm:h-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow animate-scale-in flex-shrink-0">
                <Check className="w-8 h-8 sm:w-7 sm:h-7 text-white drop-shadow-lg" />
              </div>
              <div className="text-center sm:text-left">
                <DialogTitle className="text-2xl sm:text-xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent mb-2">
                  Upload Successful!
                </DialogTitle>
                <DialogDescription className="text-base sm:text-sm text-muted-foreground leading-relaxed">
                  Your file has been uploaded and is ready to share with the world.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* File Info */}
            <Card className="p-4 sm:p-6 bg-gradient-glass border border-border/50 backdrop-blur-sm shadow-glass rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-secondary flex items-center justify-center">
                    <ExternalLink className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">File Ready</h4>
                    <Badge variant="secondary" className="text-xs font-mono bg-primary/10 text-primary border-primary/20">
                      {fileName}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>

            {/* PIN Section */}
            {sharePin && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                    <KeyRound className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="font-bold text-lg">4-Digit PIN Access</h4>
                </div>
                <Card className="p-6 bg-gradient-to-br from-primary/5 via-primary/10 to-accent/5 border-2 border-primary/30 rounded-xl shadow-glow">
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="flex-1 text-center sm:text-left">
                      <p className="text-sm text-muted-foreground mb-3">Share this PIN with recipients:</p>
                      <div className="flex items-center justify-center sm:justify-start gap-3">
                        <span className="font-mono text-3xl sm:text-4xl font-bold text-primary tracking-[0.3em] bg-background/50 px-4 py-2 rounded-lg border border-primary/20">
                          {sharePin}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => copyToClipboard(sharePin, 'PIN')}
                      className="bg-background/80 border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all duration-200"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy PIN
                    </Button>
                  </div>
                  <div className="mt-4 text-center sm:text-left">
                    <p className="text-xs text-muted-foreground bg-background/30 px-3 py-2 rounded-lg border border-border/30">
                      💡 Recipients can access your file at <span className="font-mono text-primary">/pin</span> using this PIN
                    </p>
                  </div>
                </Card>
              </div>
            )}

            {/* Share URL Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-secondary flex items-center justify-center">
                  <Share2 className="w-4 h-4 text-white" />
                </div>
                <h4 className="font-bold text-lg">Direct Share Link</h4>
              </div>
              <Card className="p-4 sm:p-6 bg-gradient-glass border border-border/50 backdrop-blur-sm rounded-xl">
                <div className="flex flex-col sm:flex-row items-stretch gap-3">
                  <div className="flex-1 min-w-0 bg-background/50 px-4 py-3 rounded-lg border border-border/30">
                    <p className="text-sm font-mono truncate text-foreground">{shareUrl}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => copyToClipboard(shareUrl, 'Share link')}
                    className="bg-background/80 border-border/50 hover:bg-primary/10 hover:border-primary/30 transition-all duration-200 flex-shrink-0"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Link
                  </Button>
                </div>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => window.open(shareUrl, '_blank')}
                className="h-12 bg-gradient-glass border-border/50 hover:bg-primary/10 hover:border-primary/30 transition-all duration-200"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Preview File
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open('/pin', '_blank')}
                className="h-12 bg-gradient-glass border-border/50 hover:bg-accent/10 hover:border-accent/30 transition-all duration-200"
              >
                <KeyRound className="w-4 h-4 mr-2" />
                PIN Access
              </Button>
              <Button
                onClick={onClose}
                className="h-12 bg-gradient-primary hover:opacity-90 transition-all duration-200 text-white font-semibold"
              >
                All Done ✨
              </Button>
            </div>

            {/* Security Info */}
            <div className="text-center pt-2">
              <div className="inline-flex items-center gap-2 bg-background/50 px-4 py-2 rounded-full border border-border/30">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <p className="text-xs text-muted-foreground">
                  🔐 Secure upload • Keep PIN safe for access control
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UploadSuccessDialog;