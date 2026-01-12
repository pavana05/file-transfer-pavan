import React, { useRef, useState } from 'react';
import { Check, Copy, Share2, KeyRound, ExternalLink, Lock, FolderOpen, Sparkles, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  const [copiedPin, setCopiedPin] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const isCollection = fileName.includes('files)');

  const triggerConfetti = (buttonRef: React.RefObject<HTMLButtonElement>) => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { x, y },
        colors: ['hsl(var(--primary))', 'hsl(var(--accent))', '#10B981', '#F59E0B'],
        ticks: 150,
        gravity: 1.2,
        decay: 0.94,
        startVelocity: 25,
        scalar: 1
      });
    }
  };

  const copyToClipboard = (text: string, label: string, buttonRef: React.RefObject<HTMLButtonElement>, setCopied: (val: boolean) => void) => {
    navigator.clipboard.writeText(text);
    triggerConfetti(buttonRef);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: `${label} copied!`,
      description: `${label} has been copied to your clipboard.`
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100%-1.5rem)] max-w-md sm:max-w-lg mx-auto p-0 border-0 bg-transparent shadow-none overflow-visible">
        {/* Main Card */}
        <div className="relative bg-card/95 backdrop-blur-2xl border border-border/50 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl">
          {/* Gradient Border Effect */}
          <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-primary/20 via-transparent to-accent/20 pointer-events-none" />
          
          {/* Subtle Pattern Overlay */}
          <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(circle_at_1px_1px,_hsl(var(--foreground))_1px,_transparent_0)] bg-[size:20px_20px] pointer-events-none" />
          
          {/* Content */}
          <div className="relative p-5 sm:p-8">
            <DialogHeader className="mb-5 sm:mb-8">
              <div className="flex flex-col items-center text-center gap-4">
                {/* Success Icon */}
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl animate-pulse" />
                  <div className="relative w-14 h-14 sm:w-18 sm:h-18 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg ring-4 ring-primary/20">
                    <Check className="w-7 h-7 sm:w-9 sm:h-9 text-primary-foreground" strokeWidth={3} />
                  </div>
                  <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-primary animate-pulse" />
                </div>
                
                <div className="space-y-1.5">
                  <DialogTitle className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                    Upload Complete
                  </DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground">
                    Your {isCollection ? 'collection' : 'file'} is ready to share
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* File Info Card */}
              <div className="flex items-center gap-3 p-3 sm:p-4 bg-muted/50 rounded-xl border border-border/50">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                  {isCollection ? (
                    <FolderOpen className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  ) : (
                    <ExternalLink className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{fileName}</p>
                  <p className="text-xs text-muted-foreground">Ready for sharing</p>
                </div>
              </div>

              {/* PIN Section */}
              {sharePin && (
                <div className="relative p-4 sm:p-5 bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl border border-primary/20 overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                  
                  <div className="relative space-y-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <KeyRound className="w-4 h-4 text-primary" />
                      Quick Access PIN
                    </div>
                    
                    {/* PIN Display */}
                    <div className="flex justify-center">
                      <div className="inline-flex items-center gap-1.5 sm:gap-2">
                        {sharePin.split('').map((digit, i) => (
                          <span
                            key={i}
                            className="w-10 h-12 sm:w-12 sm:h-14 flex items-center justify-center text-xl sm:text-2xl font-bold font-mono text-primary bg-background border-2 border-primary/30 rounded-lg shadow-sm"
                          >
                            {digit}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <Button
                      ref={pinButtonRef}
                      variant="outline"
                      onClick={() => copyToClipboard(sharePin, 'PIN', pinButtonRef, setCopiedPin)}
                      className="w-full h-10 sm:h-11 bg-background/80 border-primary/30 hover:bg-primary/10 hover:border-primary/50 rounded-lg text-sm font-medium transition-all duration-200"
                    >
                      {copiedPin ? (
                        <>
                          <Check className="w-4 h-4 mr-2 text-primary" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy PIN
                        </>
                      )}
                    </Button>
                    
                    <p className="text-xs text-center text-muted-foreground">
                      Access at <span className="font-mono text-primary font-medium">/pin</span> with this code
                    </p>
                    
                    {hasPassword && (
                      <div className="flex items-center justify-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-2 rounded-lg">
                        <Lock className="w-3.5 h-3.5" />
                        Password protected
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Share Link Section */}
              <div className="p-4 sm:p-5 bg-muted/30 rounded-xl border border-border/50 space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Share2 className="w-4 h-4 text-muted-foreground" />
                  Share Link
                </div>
                
                <div className="bg-background/80 px-3 py-2.5 rounded-lg border border-border/50 overflow-hidden">
                  <p className="text-xs font-mono text-muted-foreground break-all leading-relaxed line-clamp-2">
                    {shareUrl}
                  </p>
                </div>
                
                <Button
                  ref={linkButtonRef}
                  variant="outline"
                  onClick={() => copyToClipboard(shareUrl, 'Share link', linkButtonRef, setCopiedLink)}
                  className="w-full h-10 sm:h-11 bg-background/80 border-border/60 hover:bg-primary/5 hover:border-primary/40 rounded-lg text-sm font-medium transition-all duration-200"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-4 h-4 mr-2 text-primary" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Link
                    </>
                  )}
                </Button>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => window.open(shareUrl, '_blank')}
                  className="h-10 sm:h-11 bg-muted/50 border-border/60 hover:bg-muted rounded-lg text-xs sm:text-sm font-medium"
                >
                  <ExternalLink className="w-4 h-4 mr-1.5" />
                  Preview
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open('/pin', '_blank')}
                  className="h-10 sm:h-11 bg-muted/50 border-border/60 hover:bg-muted rounded-lg text-xs sm:text-sm font-medium"
                >
                  <KeyRound className="w-4 h-4 mr-1.5" />
                  PIN Access
                </Button>
              </div>
              
              {/* Done Button */}
              <Button
                onClick={onClose}
                className="w-full h-11 sm:h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-200"
              >
                Done
              </Button>

              {/* Security Badge */}
              <div className="flex justify-center pt-1">
                <div className="inline-flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full border border-border/50">
                  <Shield className="w-3.5 h-3.5 text-primary" />
                  <span>Secure & Encrypted</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UploadSuccessDialog;