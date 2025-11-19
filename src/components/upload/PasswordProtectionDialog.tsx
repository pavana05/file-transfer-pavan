import React, { useState } from 'react';
import { Lock, RefreshCw, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import PasswordStrengthMeter from './PasswordStrengthMeter';
import { generateSecurePassword } from '@/lib/password-generator';
import { useToast } from '@/hooks/use-toast';

interface PasswordProtectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password?: string) => void;
  fileName: string;
}

const PasswordProtectionDialog: React.FC<PasswordProtectionDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  fileName
}) => {
  const [usePassword, setUsePassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleGeneratePassword = () => {
    const newPassword = generateSecurePassword(16);
    setPassword(newPassword);
    setConfirmPassword(newPassword);
    setShowPassword(true);
    toast({
      title: 'Password Generated',
      description: 'A secure password has been generated. Copy it now!',
    });
  };

  const handleCopyPassword = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: 'Copied!',
        description: 'Password copied to clipboard',
      });
    } catch (err) {
      toast({
        title: 'Failed to copy',
        description: 'Please copy the password manually',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (usePassword) {
      if (!password) {
        setError('Please enter a password');
        return;
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
    }

    onConfirm(usePassword ? password : undefined);
    setPassword('');
    setConfirmPassword('');
    setUsePassword(false);
    setShowPassword(false);
  };

  const handleCancel = () => {
    setPassword('');
    setConfirmPassword('');
    setUsePassword(false);
    setError('');
    setShowPassword(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="bg-card/95 backdrop-blur-md border border-border/60">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Lock className="w-5 h-5 text-primary" />
            Password Protection (Optional)
          </DialogTitle>
          <DialogDescription>
            Add an extra layer of security to "{fileName}"
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/40">
            <div className="flex-1">
              <Label htmlFor="password-toggle" className="text-sm font-medium">
                Enable Password Protection
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                Recipients will need both PIN and password
              </p>
            </div>
            <Switch
              id="password-toggle"
              checked={usePassword}
              onCheckedChange={setUsePassword}
            />
          </div>

          {usePassword && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGeneratePassword}
                  className="flex-1 gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Generate Secure Password
                </Button>
                {password && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleCopyPassword}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-success" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password (min 8 characters)"
                  className="mt-1.5"
                  autoFocus
                />
              </div>

              <div>
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="mt-1.5"
                />
              </div>

              <PasswordStrengthMeter password={password} />

              {error && (
                <div className="bg-destructive/10 border border-destructive/30 rounded-lg px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="flex-1 bg-gradient-primary text-white"
            >
              Continue Upload
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PasswordProtectionDialog;
