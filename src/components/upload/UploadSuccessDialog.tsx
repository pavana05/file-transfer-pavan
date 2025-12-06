import React, { useRef } from 'react';
import { Check, Copy, Share2, KeyRound, ExternalLink, Lock, FolderOpen } from 'lucide-react';
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
import confetti from 'canvas-confetti';

interface UploadSuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
  sharePin?: string;
  fileName: string;
  hasPassword?: boolean;
}

const UploadSuccessDialog: React.FC<UploadSuccessDialogProps> = ({
  isOpen,
  onClose,
  shareUrl,
  sharePin,
  fileName,
  hasPassword = false
}) => {
  const { toast } = useToast();
  const pinButtonRef = useRef<HTMLButtonElement>(null);
  const linkButtonRef = useRef<HTMLButtonElement>(null);
  
  // Detect if this is a collection upload
  const isCollection = fileName.includes('files)');

  const triggerConfetti = (buttonRef: React.RefObject<HTMLButtonElement>) => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;

      // Main confetti burst
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { x, y },
        colors: ['#4F46E5', '#7C3AED', '#EC4899', '#F59E0B', '#10B981'],
        ticks: 200,
        gravity: 1,
        decay: 0.94,
        startVelocity: 30,
        scalar: 1.2,
      });

      // Secondary smaller burst
      setTimeout(() => {
        confetti({
          particleCount: 50,
          spread: 50,
          origin: { x, y },
          colors: ['#4F46E5', '#7C3AED', '#EC4899'],
          ticks: 150,
          gravity: 1.2,
          decay: 0.95,
          startVelocity: 20,
          scalar: 0.8,
        });
      }, 100);
    }
  };

  const copyToClipboard = (text: string, label: string, buttonRef: React.RefObject<HTMLButtonElement>) => {
    navigator.clipboard.writeText(text);
    triggerConfetti(buttonRef);
    toast({
      title: `${label} copied!`,
      description: `${label} has been copied to your clipboard.`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-lg sm:max-w-2xl md:max-w-3xl h-auto max-h-[90vh] mx-auto p-4 sm:p-6 md:p-8 border border-border/40 backdrop-blur-xl overflow-y-auto rounded-2xl">
        {/* Professional Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/98 to-background/95 rounded-2xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent rounded-2xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent rounded-2xl" />
        <div className="absolute top-1/4 right-1/4 w-32 sm:w-64 h-32 sm:h-64 bg-primary/5 rounded-full blur-[60px] sm:blur-[100px] animate-float" />
        <div className="absolute bottom-1/4 left-1/4 w-24 sm:w-48 h-24 sm:h-48 bg-accent/5 rounded-full blur-[40px] sm:blur-[80px] animate-float" style={{ animationDelay: '1.5s' }} />
        
        <div className="relative z-10">
          <DialogHeader className="mb-4 sm:mb-6">
            <div className="flex flex-col items-center text-center gap-3 sm:gap-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-primary rounded-xl sm:rounded-2xl blur-lg sm:blur-xl opacity-60 group-hover:opacity-80 transition-opacity" />
                <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow animate-scale-in">
                  <Check className="w-6 h-6 sm:w-8 sm:h-8 text-white drop-shadow-lg" strokeWidth={2.5} />
                </div>
              </div>
              <div className="space-y-1 sm:space-y-2">
                <DialogTitle className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent">
                  Upload Successful!
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed max-w-sm mx-auto">
                  Your {isCollection ? 'collection' : 'file'} is ready to share.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="space-y-3 sm:space-y-4">
            {/* File Info - Compact */}
            <Card className="p-3 sm:p-4 bg-card/60 backdrop-blur-xl border border-border/50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-secondary flex items-center justify-center shadow-lg">
                    {isCollection ? (
                      <FolderOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    ) : (
                      <ExternalLink className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm sm:text-base text-foreground truncate">
                    {isCollection ? 'Collection Ready' : 'File Ready'}
                  </h4>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">
                    {fileName}
                  </p>
                </div>
              </div>
            </Card>

            {/* PIN Section - Compact */}
            {sharePin && (
              <Card className="p-3 sm:p-5 bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 border-2 border-primary/40 rounded-xl sm:rounded-2xl">
                <div className="text-center space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-center gap-2">
                    <KeyRound className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    <h4 className="font-bold text-sm sm:text-base">Quick Access PIN</h4>
                  </div>
                  
                  <div className="flex items-center justify-center">
                    <span className="font-mono text-2xl sm:text-4xl font-bold text-primary tracking-[0.2em] sm:tracking-[0.3em] bg-background/70 px-4 sm:px-6 py-2 sm:py-3 rounded-xl border-2 border-primary/30 shadow-inner">
                      {sharePin}
                    </span>
                  </div>
                  
                  <Button
                    ref={pinButtonRef}
                    variant="outline"
                    onClick={() => copyToClipboard(sharePin, 'PIN', pinButtonRef)}
                    className="w-full h-10 sm:h-12 bg-background/90 border-2 border-primary/40 hover:bg-primary/10 hover:border-primary/60 rounded-xl text-sm font-semibold active:scale-95 transition-all"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy PIN
                  </Button>
                  
                  <p className="text-[10px] sm:text-xs text-muted-foreground bg-background/50 px-3 py-2 rounded-lg border border-border/40">
                    💡 Access at <span className="font-mono text-primary font-semibold">/pin</span> with this code
                  </p>
                  
                  {hasPassword && (
                    <p className="text-[10px] sm:text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-2 rounded-lg border border-amber-500/40 flex items-center justify-center gap-2">
                      <Lock className="w-3 h-3 flex-shrink-0" />
                      Password protected
                    </p>
                  )}
                </div>
              </Card>
            )}

            {/* Share URL Section - Compact */}
            <Card className="p-3 sm:p-4 bg-card/60 backdrop-blur-xl border border-border/50 rounded-xl">
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-muted-foreground" />
                  <h4 className="font-semibold text-sm sm:text-base">Share Link</h4>
                </div>
                <div className="bg-muted/60 px-3 py-2 rounded-lg border border-border/40 overflow-hidden">
                  <p className="text-[10px] sm:text-xs font-mono break-all text-foreground leading-relaxed">
                    {shareUrl}
                  </p>
                </div>
                <Button
                  ref={linkButtonRef}
                  variant="outline"
                  onClick={() => copyToClipboard(shareUrl, 'Share link', linkButtonRef)}
                  className="w-full h-10 sm:h-12 bg-background/90 border-2 border-border/60 hover:bg-primary/10 hover:border-primary/40 rounded-xl text-sm font-semibold active:scale-95 transition-all"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </Button>
              </div>
            </Card>

            {/* Action Buttons - Mobile optimized grid */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-2 sm:pt-4">
              <Button
                variant="outline"
                onClick={() => window.open(shareUrl, '_blank')}
                className="h-11 sm:h-12 bg-card/60 backdrop-blur-md border border-border/60 hover:bg-primary/10 hover:border-primary/40 rounded-xl text-xs sm:text-sm font-medium"
              >
                {isCollection ? (
                  <>
                    <FolderOpen className="w-4 h-4 mr-1.5" />
                    <span className="hidden xs:inline">View </span>Collection
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-4 h-4 mr-1.5" />
                    Preview
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open('/pin', '_blank')}
                className="h-11 sm:h-12 bg-card/60 backdrop-blur-md border border-border/60 hover:bg-accent/10 hover:border-accent/40 rounded-xl text-xs sm:text-sm font-medium"
              >
                <KeyRound className="w-4 h-4 mr-1.5" />
                PIN Access
              </Button>
              <Button
                onClick={onClose}
                className="col-span-2 h-11 sm:h-12 bg-gradient-primary hover:shadow-glow hover:scale-[1.01] transition-all text-white font-bold rounded-xl text-sm"
              >
                Done ✨
              </Button>
            </div>

            {/* Security Info - Compact */}
            <div className="text-center pt-1 sm:pt-2">
              <div className="inline-flex items-center gap-2 bg-success/10 backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-success/30">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-success rounded-full animate-pulse" />
                <span className="text-[10px] sm:text-xs font-medium text-success-foreground">
                  🔐 Secure • Keep PIN safe
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UploadSuccessDialog;