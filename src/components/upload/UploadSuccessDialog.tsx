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
      <DialogContent className="w-full max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl h-auto max-h-[95vh] sm:max-h-[90vh] m-4 sm:m-0 p-4 sm:p-6 md:p-8 border border-border/40 backdrop-blur-xl overflow-y-auto rounded-2xl">
        {/* Professional Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/98 to-background/95 rounded-2xl"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent rounded-2xl"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent rounded-2xl"></div>
        <div className="absolute top-1/4 right-1/4 w-48 sm:w-96 h-48 sm:h-96 bg-primary/5 rounded-full blur-[80px] sm:blur-[120px] animate-float"></div>
        <div className="absolute bottom-1/4 left-1/4 w-40 sm:w-80 h-40 sm:h-80 bg-accent/5 rounded-full blur-[60px] sm:blur-[100px] animate-float" style={{ animationDelay: '1.5s' }}></div>
        
        <div className="relative z-10">
          <DialogHeader className="mb-6 sm:mb-8">
            <div className="flex flex-col items-center text-center gap-4 sm:gap-6">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-primary rounded-2xl sm:rounded-3xl blur-xl sm:blur-2xl opacity-60 group-hover:opacity-80 transition-opacity"></div>
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-primary flex items-center justify-center shadow-glow animate-scale-in">
                  <Check className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow-lg" strokeWidth={2.5} />
                </div>
              </div>
              <div>
                <DialogTitle className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent mb-2 sm:mb-3">
                  Upload Successful!
                </DialogTitle>
                <DialogDescription className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed max-w-md mx-auto px-4 sm:px-0">
                  Your file has been securely uploaded and is ready to share with the world.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="space-y-4 sm:space-y-6">
            {/* File Info */}
            <Card className="p-4 sm:p-6 md:p-8 bg-card/60 backdrop-blur-xl border border-border/50 hover:border-border/80 shadow-card rounded-xl sm:rounded-2xl transition-all duration-300">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-secondary rounded-xl sm:rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity"></div>
                  <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-secondary flex items-center justify-center shadow-lg">
                    <ExternalLink className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0 w-full">
                  <h4 className="font-bold text-base sm:text-lg text-foreground mb-2">File Ready to Share</h4>
                  <Badge variant="secondary" className="text-xs sm:text-sm font-mono bg-primary/10 text-primary border-primary/30 px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg sm:rounded-xl break-all">
                    {fileName}
                  </Badge>
                </div>
              </div>
            </Card>

            {/* PIN Section */}
            {sharePin && (
              <div className="space-y-3 sm:space-y-5">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-primary flex items-center justify-center shadow-lg">
                    <KeyRound className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <h4 className="font-bold text-lg sm:text-xl">4-Digit PIN Access</h4>
                </div>
                <Card className="p-4 sm:p-6 md:p-8 bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 border-2 border-primary/40 rounded-xl sm:rounded-[2rem] shadow-card hover:shadow-hover transition-all duration-300">
                  <div className="flex flex-col gap-4 sm:gap-6">
                    <div className="flex-1 text-center">
                      <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4 font-medium">Share this PIN with recipients:</p>
                      <div className="flex items-center justify-center mb-4">
                        <span className="font-mono text-3xl sm:text-4xl md:text-5xl font-bold text-primary tracking-[0.25em] sm:tracking-[0.35em] bg-background/70 px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl border-2 border-primary/30 shadow-inner">
                          {sharePin}
                        </span>
                      </div>
                      <Button
                        ref={pinButtonRef}
                        variant="outline"
                        size="lg"
                        onClick={() => copyToClipboard(sharePin, 'PIN', pinButtonRef)}
                        className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 bg-background/90 border-2 border-primary/40 hover:bg-primary/10 hover:border-primary/60 hover:scale-105 transition-all duration-200 rounded-xl sm:rounded-2xl text-sm sm:text-base font-semibold active:scale-95"
                      >
                        <Copy className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        Copy PIN
                      </Button>
                    </div>
                  </div>
                  <div className="mt-4 sm:mt-6 text-center space-y-2 sm:space-y-3">
                    <p className="text-xs sm:text-sm text-muted-foreground bg-background/50 px-3 sm:px-5 py-2 sm:py-3 rounded-lg sm:rounded-xl border border-border/40 leading-relaxed">
                      💡 Recipients can access your file at <span className="font-mono text-primary font-semibold">/pin</span> using this PIN
                    </p>
                    {hasPassword && (
                      <p className="text-xs sm:text-sm text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 sm:px-5 py-2 sm:py-3 rounded-lg sm:rounded-xl border-2 border-amber-500/40 flex items-center justify-center gap-2 sm:gap-3 font-medium">
                        <Lock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span>Password protection enabled for extra security</span>
                      </p>
                    )}
                  </div>
                </Card>
              </div>
            )}

            {/* Share URL Section */}
            <div className="space-y-3 sm:space-y-5">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-secondary flex items-center justify-center shadow-lg">
                  <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <h4 className="font-bold text-lg sm:text-xl">Direct Share Link</h4>
              </div>
              <Card className="p-4 sm:p-6 md:p-8 bg-card/60 backdrop-blur-xl border border-border/50 hover:border-border/80 rounded-xl sm:rounded-[2rem] shadow-card hover:shadow-hover transition-all duration-300">
                <div className="flex flex-col gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0 bg-muted/60 px-3 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl border border-border/40 overflow-hidden">
                    <p className="text-xs sm:text-base font-mono break-all text-foreground">{shareUrl}</p>
                  </div>
                  <Button
                    ref={linkButtonRef}
                    variant="outline"
                    size="lg"
                    onClick={() => copyToClipboard(shareUrl, 'Share link', linkButtonRef)}
                    className="w-full h-12 sm:h-14 px-6 sm:px-8 bg-background/90 border-2 border-border/60 hover:bg-primary/10 hover:border-primary/40 hover:scale-105 transition-all duration-200 rounded-xl sm:rounded-2xl text-sm sm:text-base font-semibold active:scale-95"
                  >
                    <Copy className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Copy Link
                  </Button>
                </div>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className={`grid grid-cols-1 ${isCollection ? 'sm:grid-cols-4' : 'sm:grid-cols-3'} gap-3 sm:gap-4 pt-4 sm:pt-6`}>
              {isCollection ? (
                <Button
                  variant="outline"
                  onClick={() => window.open(shareUrl, '_blank')}
                  className="h-12 sm:h-14 bg-gradient-to-r from-primary/10 to-accent/10 backdrop-blur-md border-2 border-primary/40 hover:bg-primary/20 hover:border-primary/60 transition-all duration-200 rounded-xl sm:rounded-2xl text-sm sm:text-base font-semibold"
                >
                  <FolderOpen className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  View Collection
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => window.open(shareUrl, '_blank')}
                  className="h-12 sm:h-14 bg-card/60 backdrop-blur-md border-2 border-border/60 hover:bg-primary/10 hover:border-primary/40 transition-all duration-200 rounded-xl sm:rounded-2xl text-sm sm:text-base font-semibold"
                >
                  <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Preview File
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => window.open('/pin', '_blank')}
                className="h-12 sm:h-14 bg-card/60 backdrop-blur-md border-2 border-border/60 hover:bg-accent/10 hover:border-accent/40 transition-all duration-200 rounded-xl sm:rounded-2xl text-sm sm:text-base font-semibold"
              >
                <KeyRound className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                PIN Access
              </Button>
              <Button
                onClick={onClose}
                className="h-12 sm:h-14 bg-gradient-primary hover:shadow-glow hover:scale-[1.02] transition-all duration-200 text-white font-bold rounded-xl sm:rounded-2xl text-sm sm:text-base"
              >
                All Done ✨
              </Button>
            </div>

            {/* Security Info */}
            <div className="text-center pt-3 sm:pt-4">
              <div className="inline-flex items-center gap-2 sm:gap-3 bg-success/10 backdrop-blur-md px-4 sm:px-6 py-2 sm:py-3 rounded-full border-2 border-success/30">
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-success rounded-full animate-pulse shadow-glow"></div>
                <span className="text-xs sm:text-sm font-semibold text-success-foreground">
                  🔐 Secure upload complete • Keep PIN safe for access control
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