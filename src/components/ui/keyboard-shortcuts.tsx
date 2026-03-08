import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { Command, Home, Upload, User, CreditCard, Search, Moon, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from './badge';

interface Shortcut {
  keys: string[];
  label: string;
  action: () => void;
  icon: React.ReactNode;
}

export const KeyboardShortcuts = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const shortcuts: Shortcut[] = [
    { keys: ['⌘', 'K'], label: 'Open shortcuts', action: () => {}, icon: <Command className="w-4 h-4" /> },
    { keys: ['⌘', 'H'], label: 'Go to Home', action: () => { navigate('/'); setOpen(false); }, icon: <Home className="w-4 h-4" /> },
    { keys: ['⌘', 'U'], label: 'Go to Dashboard', action: () => { navigate('/dashboard'); setOpen(false); }, icon: <Upload className="w-4 h-4" /> },
    { keys: ['⌘', 'P'], label: 'Go to Profile', action: () => { navigate('/profile'); setOpen(false); }, icon: <User className="w-4 h-4" /> },
    { keys: ['⌘', 'B'], label: 'Go to Pricing', action: () => { navigate('/pricing'); setOpen(false); }, icon: <CreditCard className="w-4 h-4" /> },
    { keys: ['⌘', '/'], label: 'Search files', action: () => { navigate('/dashboard'); setOpen(false); }, icon: <Search className="w-4 h-4" /> },
  ];

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(prev => !prev);
      }
      if (!open) return;
      if ((e.metaKey || e.ctrlKey) && e.key === 'h') { e.preventDefault(); shortcuts[1].action(); }
      if ((e.metaKey || e.ctrlKey) && e.key === 'u') { e.preventDefault(); shortcuts[2].action(); }
      if ((e.metaKey || e.ctrlKey) && e.key === 'p') { e.preventDefault(); shortcuts[3].action(); }
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') { e.preventDefault(); shortcuts[4].action(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, navigate]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md rounded-2xl border-border/40 bg-card/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Command className="w-4 h-4 text-primary" />
            </div>
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-1 mt-2">
          {shortcuts.map((shortcut, i) => (
            <button
              key={i}
              onClick={shortcut.action}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-muted/60 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground group-hover:text-primary transition-colors">
                  {shortcut.icon}
                </span>
                <span className="text-sm font-medium text-foreground">{shortcut.label}</span>
              </div>
              <div className="flex items-center gap-1">
                {shortcut.keys.map((key, j) => (
                  <kbd
                    key={j}
                    className="px-2 py-1 text-[11px] font-mono font-medium bg-muted/80 text-muted-foreground rounded-md border border-border/50 shadow-sm"
                  >
                    {key}
                  </kbd>
                ))}
              </div>
            </button>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-border/40 flex items-center justify-center">
          <p className="text-xs text-muted-foreground">
            Press <kbd className="px-1.5 py-0.5 mx-1 text-[10px] font-mono bg-muted rounded border border-border/50">Esc</kbd> to close
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
