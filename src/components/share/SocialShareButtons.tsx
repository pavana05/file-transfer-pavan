import React, { useState } from 'react';
import { Share2, Twitter, Facebook, Linkedin, Mail, Link2, MessageCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface SocialShareButtonsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pin: string;
  fileName: string;
}

const SocialShareButtons: React.FC<SocialShareButtonsProps> = ({
  open,
  onOpenChange,
  pin,
  fileName,
}) => {
  const { toast } = useToast();
  const [customMessage, setCustomMessage] = useState('');
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/?pin=${pin}`;
  const defaultMessage = `Check out this file: ${fileName}\nAccess PIN: ${pin}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: 'Link copied',
        description: 'Share link copied to clipboard',
      });
    } catch (error) {
      toast({
        title: 'Failed to copy',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  const handleShareTwitter = () => {
    const message = customMessage || defaultMessage;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=550,height=420');
  };

  const handleShareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=550,height=420');
  };

  const handleShareLinkedIn = () => {
    const message = customMessage || defaultMessage;
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&summary=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'width=550,height=420');
  };

  const handleShareEmail = () => {
    const message = customMessage || defaultMessage;
    const subject = `File Shared: ${fileName}`;
    const body = `${message}\n\nAccess the file here: ${shareUrl}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleShareWhatsApp = () => {
    const message = customMessage || defaultMessage;
    const url = `https://wa.me/?text=${encodeURIComponent(`${message}\n${shareUrl}`)}`;
    window.open(url, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `File: ${fileName}`,
          text: customMessage || defaultMessage,
          url: shareUrl,
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          toast({
            title: 'Share failed',
            description: 'Please try another method',
            variant: 'destructive',
          });
        }
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            Share File Access
          </DialogTitle>
          <DialogDescription>
            Share the file access link with others via social media or direct link
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Custom Message */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Custom Message (Optional)</label>
            <Textarea
              placeholder={defaultMessage}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Share Link */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Share Link</label>
            <div className="flex gap-2">
              <Input
                value={shareUrl}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyLink}
                className="flex-shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-success" />
                ) : (
                  <Link2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* PIN Display */}
          <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
            <p className="text-sm text-muted-foreground mb-2">Access PIN</p>
            <p className="text-2xl font-bold font-mono tracking-wider text-foreground">
              {pin}
            </p>
          </div>

          {/* Social Share Buttons */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Share via</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Button
                variant="outline"
                onClick={handleShareTwitter}
                className="h-14 flex-col gap-2"
              >
                <Twitter className="h-5 w-5" />
                <span className="text-xs">Twitter</span>
              </Button>

              <Button
                variant="outline"
                onClick={handleShareFacebook}
                className="h-14 flex-col gap-2"
              >
                <Facebook className="h-5 w-5" />
                <span className="text-xs">Facebook</span>
              </Button>

              <Button
                variant="outline"
                onClick={handleShareLinkedIn}
                className="h-14 flex-col gap-2"
              >
                <Linkedin className="h-5 w-5" />
                <span className="text-xs">LinkedIn</span>
              </Button>

              <Button
                variant="outline"
                onClick={handleShareWhatsApp}
                className="h-14 flex-col gap-2"
              >
                <MessageCircle className="h-5 w-5" />
                <span className="text-xs">WhatsApp</span>
              </Button>

              <Button
                variant="outline"
                onClick={handleShareEmail}
                className="h-14 flex-col gap-2"
              >
                <Mail className="h-5 w-5" />
                <span className="text-xs">Email</span>
              </Button>

              {navigator.share && (
                <Button
                  variant="outline"
                  onClick={handleNativeShare}
                  className="h-14 flex-col gap-2"
                >
                  <Share2 className="h-5 w-5" />
                  <span className="text-xs">More</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SocialShareButtons;
