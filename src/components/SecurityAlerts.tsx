import React from 'react';
import { AlertTriangle, Shield, Lock, Clock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface SecurityAlertsProps {
  alerts: SecurityAlert[];
  className?: string;
}

export interface SecurityAlert {
  type: 'rate-limit' | 'validation' | 'authentication' | 'file-security';
  severity: 'low' | 'medium' | 'high';
  message: string;
  details?: string;
  timestamp?: Date;
}

const severityConfig = {
  low: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  medium: { color: 'bg-orange-100 text-orange-800', icon: AlertTriangle },
  high: { color: 'bg-red-100 text-red-800', icon: Shield }
};

const typeConfig = {
  'rate-limit': { icon: Clock, label: 'Rate Limit' },
  'validation': { icon: AlertTriangle, label: 'Validation' },
  'authentication': { icon: Lock, label: 'Authentication' },
  'file-security': { icon: Shield, label: 'File Security' }
};

export function SecurityAlerts({ alerts, className = '' }: SecurityAlertsProps) {
  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {alerts.map((alert, index) => {
        const SeverityIcon = severityConfig[alert.severity].icon;
        const TypeIcon = typeConfig[alert.type].icon;
        
        return (
          <Alert key={index} className="border-l-4 border-l-destructive">
            <div className="flex items-start gap-3">
              <SeverityIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge 
                    variant="secondary" 
                    className={severityConfig[alert.severity].color}
                  >
                    <TypeIcon className="h-3 w-3 mr-1" />
                    {typeConfig[alert.type].label}
                  </Badge>
                  {alert.timestamp && (
                    <span className="text-xs text-muted-foreground">
                      {alert.timestamp.toLocaleTimeString()}
                    </span>
                  )}
                </div>
                <AlertDescription className="text-sm">
                  {alert.message}
                  {alert.details && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      {alert.details}
                    </div>
                  )}
                </AlertDescription>
              </div>
            </div>
          </Alert>
        );
      })}
    </div>
  );
}

export function useSecurityAlerts() {
  const [alerts, setAlerts] = React.useState<SecurityAlert[]>([]);

  const addAlert = React.useCallback((alert: Omit<SecurityAlert, 'timestamp'>) => {
    const newAlert: SecurityAlert = {
      ...alert,
      timestamp: new Date()
    };
    
    setAlerts(prev => [...prev, newAlert]);
    
    // Auto-remove alerts after 10 seconds for low severity, 30 seconds for others
    const timeout = alert.severity === 'low' ? 10000 : 30000;
    setTimeout(() => {
      setAlerts(prev => prev.filter(a => a !== newAlert));
    }, timeout);
  }, []);

  const clearAlerts = React.useCallback(() => {
    setAlerts([]);
  }, []);

  const removeAlert = React.useCallback((index: number) => {
    setAlerts(prev => prev.filter((_, i) => i !== index));
  }, []);

  return {
    alerts,
    addAlert,
    clearAlerts,
    removeAlert
  };
}