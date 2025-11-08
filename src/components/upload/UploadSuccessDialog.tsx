import React from 'react';
import { Check, Copy, Share2, KeyRound, ExternalLink, Lock } from 'lucide-react';
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

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: `${label} copied!`,
      description: `${label} has been copied to your clipboard.`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-screen h-screen max-w-none max-h-none m-0 p-8 border-0 backdrop-blur-xl overflow-y-auto">
        {/* Professional Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/98 to-background/95"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent"></div>
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] animate-float"></div>
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] animate-float" style={{ animationDelay: '1.5s' }}></div>
        
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col justify-center min-h-screen py-8">
          <DialogHeader>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-primary rounded-3xl blur-2xl opacity-60 group-hover:opacity-80 transition-opacity"></div>
                <div className="relative w-20 h-20 sm:w-16 sm:h-16 rounded-3xl bg-gradient-primary flex items-center justify-center shadow-glow animate-scale-in flex-shrink-0">
                  <Check className="w-10 h-10 sm:w-8 sm:h-8 text-white drop-shadow-lg" strokeWidth={2.5} />
                </div>
              </div>
              <div className="text-center sm:text-left">
                <DialogTitle className="text-4xl sm:text-3xl font-bold bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent mb-3 animate-fade-in">
                  Upload Successful!
                </DialogTitle>
                <DialogDescription className="text-lg sm:text-base text-muted-foreground leading-relaxed max-w-md">
                  Your file has been securely uploaded and is ready to share with the world.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* File Info */}
            <Card className="p-6 sm:p-8 bg-card/60 backdrop-blur-xl border border-border/50 hover:border-border/80 shadow-[0_8px_32px_rgba(0,0,0,0.08)] rounded-2xl transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-secondary rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity"></div>
                  <div className="relative w-14 h-14 rounded-2xl bg-gradient-secondary flex items-center justify-center shadow-lg">
                    <ExternalLink className="w-7 h-7 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-lg text-foreground mb-2">File Ready to Share</h4>
                  <Badge variant="secondary" className="text-sm font-mono bg-primary/10 text-primary border-primary/30 px-4 py-1.5 rounded-xl">
                    {fileName}
                  </Badge>
                </div>
              </div>
            </Card>

            {/* PIN Section */}
            {sharePin && (
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-lg">
                    <KeyRound className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="font-bold text-xl">4-Digit PIN Access</h4>
                </div>
                <Card className="p-8 bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 border-2 border-primary/40 rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.15)] hover:shadow-[0_25px_70px_rgba(0,0,0,0.2)] transition-all duration-300">
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="flex-1 text-center sm:text-left">
                      <p className="text-base text-muted-foreground mb-4 font-medium">Share this PIN with recipients:</p>
                      <div className="flex items-center justify-center sm:justify-start gap-4">
                        <span className="font-mono text-4xl sm:text-5xl font-bold text-primary tracking-[0.35em] bg-background/70 px-6 py-4 rounded-2xl border-2 border-primary/30 shadow-inner">
                          {sharePin}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => copyToClipboard(sharePin, 'PIN')}
                      className="h-14 px-8 bg-background/90 border-2 border-primary/40 hover:bg-primary/10 hover:border-primary/60 transition-all duration-200 rounded-2xl text-base font-semibold"
                    >
                      <Copy className="w-5 h-5 mr-2" />
                      Copy PIN
                    </Button>
                  </div>
                  <div className="mt-6 text-center sm:text-left space-y-3">
                    <p className="text-sm text-muted-foreground bg-background/50 px-5 py-3 rounded-xl border border-border/40 leading-relaxed">
                      💡 Recipients can access your file at <span className="font-mono text-primary font-semibold">/pin</span> using this PIN
                    </p>
                    {hasPassword && (
                      <p className="text-sm text-amber-600 dark:text-amber-400 bg-amber-500/10 px-5 py-3 rounded-xl border-2 border-amber-500/40 flex items-center gap-3 font-medium">
                        <Lock className="w-4 h-4" />
                        Password protection enabled for extra security
                      </p>
                    )}
                  </div>
                </Card>
              </div>
            )}

            {/* Share URL Section */}
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-secondary flex items-center justify-center shadow-lg">
                  <Share2 className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-bold text-xl">Direct Share Link</h4>
              </div>
              <Card className="p-6 sm:p-8 bg-card/60 backdrop-blur-xl border border-border/50 hover:border-border/80 rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.15)] transition-all duration-300">
                <div className="flex flex-col sm:flex-row items-stretch gap-4">
                  <div className="flex-1 min-w-0 bg-muted/60 px-6 py-4 rounded-2xl border border-border/40">
                    <p className="text-base font-mono truncate text-foreground">{shareUrl}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => copyToClipboard(shareUrl, 'Share link')}
                    className="h-14 px-8 bg-background/90 border-2 border-border/60 hover:bg-primary/10 hover:border-primary/40 transition-all duration-200 flex-shrink-0 rounded-2xl text-base font-semibold"
                  >
                    <Copy className="w-5 h-5 mr-2" />
                    Copy Link
                  </Button>
                </div>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
              <Button
                variant="outline"
                onClick={() => window.open(shareUrl, '_blank')}
                className="h-14 bg-card/60 backdrop-blur-md border-2 border-border/60 hover:bg-primary/10 hover:border-primary/40 transition-all duration-200 rounded-2xl text-base font-semibold"
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                Preview File
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open('/pin', '_blank')}
                className="h-14 bg-card/60 backdrop-blur-md border-2 border-border/60 hover:bg-accent/10 hover:border-accent/40 transition-all duration-200 rounded-2xl text-base font-semibold"
              >
                <KeyRound className="w-5 h-5 mr-2" />
                PIN Access
              </Button>
              <Button
                onClick={onClose}
                className="h-14 bg-gradient-primary hover:shadow-glow hover:scale-[1.02] transition-all duration-200 text-white font-bold rounded-2xl text-base"
              >
                All Done ✨
              </Button>
            </div>

            {/* Security Info */}
            <div className="text-center pt-4">
              <div className="inline-flex items-center gap-3 bg-success/10 backdrop-blur-md px-6 py-3 rounded-full border-2 border-success/30">
                <div className="w-2.5 h-2.5 bg-success rounded-full animate-pulse shadow-glow"></div>
                <p className="text-sm text-success-foreground font-medium">
                  🔐 Secure upload complete • Keep PIN safe for access control
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