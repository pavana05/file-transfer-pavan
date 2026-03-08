import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Shield, Users, Zap, X } from 'lucide-react';

const notifications = [
  { icon: Upload, text: 'Someone just shared a 250MB file', color: 'text-primary', time: '2s ago' },
  { icon: Shield, text: 'Password-protected file accessed', color: 'text-success', time: '15s ago' },
  { icon: Users, text: 'New user joined from India', color: 'text-warning', time: '30s ago' },
  { icon: Zap, text: 'P2P transfer completed — 1.2GB', color: 'text-primary', time: '1m ago' },
];

export const LiveActivityFeed = () => {
  const [current, setCurrent] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const showTimer = setTimeout(() => setVisible(true), 5000);
    return () => clearTimeout(showTimer);
  }, []);

  useEffect(() => {
    if (dismissed || !visible) return;
    const interval = setInterval(() => {
      setCurrent(prev => (prev + 1) % notifications.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [dismissed, visible]);

  if (dismissed || !visible) return null;

  const notif = notifications[current];
  const Icon = notif.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: -100, y: 20 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        exit={{ opacity: 0, x: -100 }}
        className="fixed bottom-6 left-6 z-50 max-w-xs"
      >
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-card/95 backdrop-blur-xl border border-border/40 shadow-[var(--shadow-lg)] group">
          <div className="flex-shrink-0 p-2 rounded-xl bg-primary/10">
            <Icon className={`w-4 h-4 ${notif.color}`} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground truncate">{notif.text}</p>
            <p className="text-xs text-muted-foreground">{notif.time}</p>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="flex-shrink-0 p-1 rounded-lg hover:bg-muted/60 transition-colors opacity-0 group-hover:opacity-100"
          >
            <X className="w-3 h-3 text-muted-foreground" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
