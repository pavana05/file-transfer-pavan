import { useMemo } from 'react';
import { Progress } from '@/components/ui/progress';
import { Check, X, Shield, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordStrengthMeterProps {
  password: string;
}

interface PasswordCriteria {
  label: string;
  met: boolean;
}

const PasswordStrengthMeter = ({ password }: PasswordStrengthMeterProps) => {
  const strength = useMemo(() => {
    if (!password) return { score: 0, label: 'None', color: 'bg-muted' };

    let score = 0;
    const criteria: PasswordCriteria[] = [
      { label: 'At least 8 characters', met: password.length >= 8 },
      { label: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
      { label: 'Contains lowercase letter', met: /[a-z]/.test(password) },
      { label: 'Contains number', met: /[0-9]/.test(password) },
      { label: 'Contains special character', met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) },
    ];

    criteria.forEach(c => {
      if (c.met) score++;
    });

    if (password.length >= 12) score++;
    if (password.length >= 16) score++;

    let label = 'Weak';
    let color = 'bg-destructive';
    let progressColor = 'bg-destructive';

    if (score >= 7) {
      label = 'Very Strong';
      color = 'bg-success';
      progressColor = 'bg-success';
    } else if (score >= 5) {
      label = 'Strong';
      color = 'bg-primary';
      progressColor = 'bg-primary';
    } else if (score >= 3) {
      label = 'Medium';
      color = 'bg-warning';
      progressColor = 'bg-warning';
    }

    return { score, label, color, progressColor, criteria };
  }, [password]);

  if (!password) return null;

  const progress = (strength.score / 7) * 100;

  return (
    <div className="space-y-3 mt-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">Password Strength</span>
        <span className={cn("text-sm font-semibold", strength.color.replace('bg-', 'text-'))}>
          {strength.label}
        </span>
      </div>

      <div className="relative">
        <Progress value={progress} className="h-2" />
        <div
          className={cn(
            "absolute top-0 left-0 h-full rounded-full transition-all duration-300",
            strength.progressColor
          )}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="space-y-2 pt-2">
        {strength.criteria?.map((criterion, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            {criterion.met ? (
              <Check className="h-4 w-4 text-success flex-shrink-0" />
            ) : (
              <X className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            )}
            <span className={cn(
              criterion.met ? 'text-foreground' : 'text-muted-foreground'
            )}>
              {criterion.label}
            </span>
          </div>
        ))}
      </div>

      {strength.score >= 5 && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-success/10 border border-success/20">
          <Shield className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
          <p className="text-sm text-success">
            Great password! Your files will be well protected.
          </p>
        </div>
      )}

      {strength.score < 3 && password.length > 0 && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20">
          <AlertCircle className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
          <p className="text-sm text-warning">
            Consider using a stronger password for better security.
          </p>
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthMeter;
