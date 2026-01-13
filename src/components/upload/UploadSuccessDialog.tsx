import React, { useRef, useState, useEffect } from 'react';
import { Check, Copy, Share2, KeyRound, ExternalLink, Lock, FolderOpen, Sparkles, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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

  // Auto-trigger celebration confetti when dialog opens
  useEffect(() => {
    if (isOpen) {
      // Initial burst
      const duration = 2000;
      const animationEnd = Date.now() + duration;
      const colors = ['#4F46E5', '#7C3AED', '#EC4899', '#10B981', '#F59E0B', '#06B6D4'];
      
      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) {
          clearInterval(interval);
          return;
        }

        const particleCount = 50 * (timeLeft / duration);

        // Left side burst
        confetti({
          particleCount: Math.floor(particleCount / 2),
          startVelocity: 30,
          spread: 60,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors,
          ticks: 200,
          gravity: 1,
          decay: 0.94,
          scalar: randomInRange(0.8, 1.2)
        });

        // Right side burst
        confetti({
          particleCount: Math.floor(particleCount / 2),
          startVelocity: 30,
          spread: 60,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors,
          ticks: 200,
          gravity: 1,
          decay: 0.94,
          scalar: randomInRange(0.8, 1.2)
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const triggerConfetti = (buttonRef: React.RefObject<HTMLButtonElement>) => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { x, y },
        colors: ['#4F46E5', '#7C3AED', '#10B981', '#F59E0B'],
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

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { 
        type: "spring" as const,
        duration: 0.5,
        bounce: 0.3,
        staggerChildren: 0.07
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95, 
      y: 10,
      transition: { duration: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring" as const, duration: 0.4, bounce: 0.25 }
    }
  };

  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: { 
      scale: 1, 
      rotate: 0,
      transition: { 
        type: "spring" as const,
        duration: 0.6,
        bounce: 0.5,
        delay: 0.1
      }
    }
  };

  const pinDigitVariants = {
    hidden: { opacity: 0, scale: 0.5, y: 10 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        duration: 0.4,
        bounce: 0.4,
        delay: 0.3 + i * 0.08
      }
    })
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100%-1.5rem)] max-w-md sm:max-w-lg mx-auto p-0 border-0 bg-transparent shadow-none max-h-[90vh] overflow-hidden">
        <AnimatePresence mode="wait">
          {isOpen && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative bg-card/95 backdrop-blur-2xl border border-border/50 rounded-2xl sm:rounded-3xl shadow-2xl max-h-[85vh] overflow-hidden flex flex-col"
            >
              {/* Gradient Border Effect */}
              <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-primary/20 via-transparent to-accent/20 pointer-events-none" />
              
              {/* Animated Glow Effect */}
              <motion.div 
                className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div 
                className="absolute -bottom-20 -left-20 w-40 h-40 bg-accent/20 rounded-full blur-3xl"
                animate={{ 
                  scale: [1.2, 1, 1.2],
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1.5
                }}
              />
              
              {/* Subtle Pattern Overlay */}
              <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(circle_at_1px_1px,_hsl(var(--foreground))_1px,_transparent_0)] bg-[size:20px_20px] pointer-events-none" />
              
              {/* Content */}
              <div className="relative p-5 sm:p-8 overflow-y-auto max-h-[80vh] scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                <DialogHeader className="mb-5 sm:mb-8 flex-shrink-0">
                  <motion.div variants={itemVariants} className="flex flex-col items-center text-center gap-4">
                    {/* Success Icon */}
                    <motion.div variants={iconVariants} className="relative">
                      <motion.div 
                        className="absolute inset-0 bg-primary/30 rounded-full blur-xl"
                        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg ring-4 ring-primary/20">
                        <Check className="w-8 h-8 sm:w-10 sm:h-10 text-primary-foreground" strokeWidth={3} />
                      </div>
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.3 }}
                      >
                        <Sparkles className="absolute -top-1 -right-1 w-6 h-6 text-primary" />
                      </motion.div>
                    </motion.div>
                    
                    <motion.div variants={itemVariants} className="space-y-1.5">
                      <DialogTitle className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                        Upload Complete!
                      </DialogTitle>
                      <DialogDescription className="text-sm text-muted-foreground">
                        Your {isCollection ? 'collection' : 'file'} is ready to share
                      </DialogDescription>
                    </motion.div>
                  </motion.div>
                </DialogHeader>
                
                <div className="space-y-4">
                  {/* File Info Card */}
                  <motion.div 
                    variants={itemVariants}
                    className="flex items-center gap-3 p-3 sm:p-4 bg-muted/50 rounded-xl border border-border/50"
                  >
                    <motion.div 
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0"
                      whileHover={{ scale: 1.05, rotate: 5 }}
                    >
                      {isCollection ? (
                        <FolderOpen className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                      ) : (
                        <ExternalLink className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                      )}
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{fileName}</p>
                      <p className="text-xs text-muted-foreground">Ready for sharing</p>
                    </div>
                  </motion.div>

                  {/* PIN Section */}
                  {sharePin && (
                    <motion.div 
                      variants={itemVariants}
                      className="relative p-4 sm:p-5 bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl border border-primary/20 overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                      
                      <div className="relative space-y-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                          <KeyRound className="w-4 h-4 text-primary" />
                          Quick Access PIN
                        </div>
                        
                        {/* PIN Display with staggered animation */}
                        <div className="flex justify-center">
                          <div className="inline-flex items-center gap-1.5 sm:gap-2">
                            {sharePin.split('').map((digit, i) => (
                              <motion.span
                                key={i}
                                custom={i}
                                variants={pinDigitVariants}
                                className="w-10 h-12 sm:w-12 sm:h-14 flex items-center justify-center text-xl sm:text-2xl font-bold font-mono text-primary bg-background border-2 border-primary/30 rounded-lg shadow-sm"
                                whileHover={{ scale: 1.1, y: -2 }}
                              >
                                {digit}
                              </motion.span>
                            ))}
                          </div>
                        </div>
                        
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
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
                        </motion.div>
                        
                        <p className="text-xs text-center text-muted-foreground">
                          Access at <span className="font-mono text-primary font-medium">/pin</span> with this code
                        </p>
                        
                        {hasPassword && (
                          <motion.div 
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="flex items-center justify-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-2 rounded-lg"
                          >
                            <Lock className="w-3.5 h-3.5" />
                            Password protected
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Share Link Section */}
                  <motion.div 
                    variants={itemVariants}
                    className="p-4 sm:p-5 bg-muted/30 rounded-xl border border-border/50 space-y-3"
                  >
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Share2 className="w-4 h-4 text-muted-foreground" />
                      Share Link
                    </div>
                    
                    <div className="bg-background/80 px-3 py-2.5 rounded-lg border border-border/50 overflow-hidden">
                      <p className="text-xs font-mono text-muted-foreground break-all leading-relaxed line-clamp-2">
                        {shareUrl}
                      </p>
                    </div>
                    
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
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
                    </motion.div>
                  </motion.div>

                  {/* Action Buttons */}
                  <motion.div variants={itemVariants} className="grid grid-cols-2 gap-2 sm:gap-3 pt-2">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        variant="outline"
                        onClick={() => window.open(shareUrl, '_blank')}
                        className="w-full h-10 sm:h-11 bg-muted/50 border-border/60 hover:bg-muted rounded-lg text-xs sm:text-sm font-medium"
                      >
                        <ExternalLink className="w-4 h-4 mr-1.5" />
                        Preview
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        variant="outline"
                        onClick={() => window.open('/pin', '_blank')}
                        className="w-full h-10 sm:h-11 bg-muted/50 border-border/60 hover:bg-muted rounded-lg text-xs sm:text-sm font-medium"
                      >
                        <KeyRound className="w-4 h-4 mr-1.5" />
                        PIN Access
                      </Button>
                    </motion.div>
                  </motion.div>
                  
                  {/* Done Button */}
                  <motion.div 
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }} 
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={onClose}
                      className="w-full h-11 sm:h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-200"
                    >
                      Done
                    </Button>
                  </motion.div>

                  {/* Security Badge */}
                  <motion.div 
                    variants={itemVariants}
                    className="flex justify-center pt-1"
                  >
                    <motion.div 
                      className="inline-flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full border border-border/50"
                      whileHover={{ scale: 1.05 }}
                    >
                      <Shield className="w-3.5 h-3.5 text-primary" />
                      <span>Secure & Encrypted</span>
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default UploadSuccessDialog;