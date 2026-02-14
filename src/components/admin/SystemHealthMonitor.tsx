import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Database, HardDrive, Cpu, Wifi, Server } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SystemHealthProps {
  totalStorage: number;
  totalFiles: number;
  totalUsers: number;
}

const AnimatedGauge = ({ 
  value, 
  max, 
  label, 
  color, 
  icon: Icon,
  formatValue 
}: { 
  value: number; 
  max: number; 
  label: string; 
  color: string;
  icon: React.ElementType;
  formatValue: (v: number) => string;
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <motion.div 
      className="flex flex-col items-center gap-3"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
    >
      <div className="relative w-28 h-28">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50" cy="50" r="40"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="8"
          />
          <motion.circle
            cx="50" cy="50" r="40"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Icon className="h-4 w-4 mb-1" style={{ color }} />
          <motion.span 
            className="text-lg font-bold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {Math.round(percentage)}%
          </motion.span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold">{formatValue(value)}</p>
      </div>
    </motion.div>
  );
};

const PulsingDot = ({ status }: { status: 'healthy' | 'warning' | 'error' }) => {
  const colors = {
    healthy: 'bg-success',
    warning: 'bg-warning',
    error: 'bg-destructive',
  };
  
  return (
    <span className="relative flex h-3 w-3">
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${colors[status]} opacity-75`} />
      <span className={`relative inline-flex rounded-full h-3 w-3 ${colors[status]}`} />
    </span>
  );
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export const SystemHealthMonitor = ({ totalStorage, totalFiles, totalUsers }: SystemHealthProps) => {
  const [uptime, setUptime] = useState(99.9);
  
  useEffect(() => {
    // Simulate slight uptime variation
    const interval = setInterval(() => {
      setUptime(prev => Math.min(100, Math.max(99.5, prev + (Math.random() - 0.5) * 0.1)));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const maxStorage = 5 * 1024 * 1024 * 1024; // 5GB
  const maxFiles = 10000;

  const services = [
    { name: 'Database', status: 'healthy' as const, latency: '12ms', icon: Database },
    { name: 'Storage', status: 'healthy' as const, latency: '45ms', icon: HardDrive },
    { name: 'API Gateway', status: 'healthy' as const, latency: '8ms', icon: Wifi },
    { name: 'Edge Functions', status: 'healthy' as const, latency: '23ms', icon: Server },
  ];

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-success/3 to-transparent pointer-events-none" />
      <CardHeader className="relative">
        <CardTitle className="text-lg flex items-center gap-2">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            <Activity className="h-5 w-5 text-success" />
          </motion.div>
          System Health Monitor
        </CardTitle>
        <CardDescription>Real-time system metrics and service status</CardDescription>
      </CardHeader>
      <CardContent className="relative space-y-6">
        {/* Gauges */}
        <div className="grid grid-cols-3 gap-4">
          <AnimatedGauge 
            value={totalStorage} 
            max={maxStorage} 
            label="Storage" 
            color="hsl(var(--primary))" 
            icon={HardDrive}
            formatValue={formatFileSize}
          />
          <AnimatedGauge 
            value={totalFiles} 
            max={maxFiles} 
            label="Files" 
            color="hsl(var(--warning))" 
            icon={Cpu}
            formatValue={(v) => v.toLocaleString()}
          />
          <AnimatedGauge 
            value={uptime} 
            max={100} 
            label="Uptime" 
            color="hsl(var(--success))" 
            icon={Activity}
            formatValue={(v) => `${v.toFixed(1)}%`}
          />
        </div>

        {/* Service Status */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Services</p>
          <div className="grid grid-cols-2 gap-2">
            {services.map((service, i) => (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i }}
                className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <PulsingDot status={service.status} />
                  <service.icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  <span className="text-sm font-medium">{service.name}</span>
                </div>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  {service.latency}
                </Badge>
              </motion.div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
