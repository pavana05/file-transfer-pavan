import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileUp, Download, CreditCard, UserPlus, Heart, MessageSquare, Shield, Eye } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

interface ActivityItem {
  id: string;
  type: 'upload' | 'download' | 'payment' | 'signup' | 'donation' | 'contact' | 'role_change';
  description: string;
  timestamp: string;
  meta?: string;
}

interface ActivityFeedProps {
  files: Array<{ id: string; original_name: string; upload_date: string; download_count: number; file_size: number }>;
  payments: Array<{ id: string; plan_name: string; amount_inr: number; status: string; created_at: string }>;
  contacts: Array<{ id: string; name: string; category: string; created_at: string }>;
  donations: Array<{ id: string; name: string | null; amount: number; status: string; created_at: string }>;
}

const iconMap = {
  upload: { icon: FileUp, color: 'text-primary', bg: 'bg-primary/10' },
  download: { icon: Download, color: 'text-success', bg: 'bg-success/10' },
  payment: { icon: CreditCard, color: 'text-warning', bg: 'bg-warning/10' },
  signup: { icon: UserPlus, color: 'text-primary', bg: 'bg-primary/10' },
  donation: { icon: Heart, color: 'text-pink-500', bg: 'bg-pink-500/10' },
  contact: { icon: MessageSquare, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  role_change: { icon: Shield, color: 'text-destructive', bg: 'bg-destructive/10' },
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(amount / 100);
};

export const ActivityFeed = ({ files, payments, contacts, donations }: ActivityFeedProps) => {
  // Build unified activity feed from all data sources
  const activities: ActivityItem[] = [];

  files.slice(0, 8).forEach(f => {
    activities.push({
      id: `file-${f.id}`,
      type: 'upload',
      description: `File uploaded: ${f.original_name}`,
      timestamp: f.upload_date,
      meta: `${(f.file_size / 1024).toFixed(0)} KB`,
    });
  });

  payments.slice(0, 8).forEach(p => {
    activities.push({
      id: `pay-${p.id}`,
      type: 'payment',
      description: `${p.plan_name} plan purchased`,
      timestamp: p.created_at,
      meta: formatCurrency(p.amount_inr),
    });
  });

  contacts.slice(0, 5).forEach(c => {
    activities.push({
      id: `contact-${c.id}`,
      type: 'contact',
      description: `New message from ${c.name}`,
      timestamp: c.created_at,
      meta: c.category,
    });
  });

  donations.filter(d => d.status === 'completed').slice(0, 5).forEach(d => {
    activities.push({
      id: `donate-${d.id}`,
      type: 'donation',
      description: `Donation from ${d.name || 'Anonymous'}`,
      timestamp: d.created_at,
      meta: formatCurrency(d.amount),
    });
  });

  // Sort by timestamp descending
  activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const recentActivities = activities.slice(0, 12);

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/3 to-transparent pointer-events-none" />
      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Eye className="h-5 w-5 text-primary" />
              </motion.div>
              Live Activity Feed
            </CardTitle>
            <CardDescription>Real-time platform activity stream</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
            </span>
            <span className="text-xs text-muted-foreground">Live</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative">
        <div className="space-y-1 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
          <AnimatePresence>
            {recentActivities.map((activity, index) => {
              const config = iconMap[activity.type];
              const Icon = config.icon;
              
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: 'auto' }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ 
                    delay: index * 0.05,
                    type: 'spring',
                    stiffness: 300,
                    damping: 25
                  }}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/40 transition-all group cursor-default"
                >
                  <motion.div 
                    className={`h-8 w-8 rounded-lg ${config.bg} flex items-center justify-center flex-shrink-0`}
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    <Icon className={`h-4 w-4 ${config.color}`} />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                      {activity.description}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                  {activity.meta && (
                    <Badge variant="secondary" className="text-[10px] flex-shrink-0 font-mono">
                      {activity.meta}
                    </Badge>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
          {recentActivities.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Eye className="h-8 w-8 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No activity yet</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
