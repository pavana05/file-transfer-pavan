import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent } from './dialog';
import {
  Command,
  Home,
  Upload,
  User,
  CreditCard,
  Search,
  KeyRound,
  ScanLine,
  Heart,
  Mail,
  LayoutDashboard,
  Receipt,
  ShieldCheck,
  FileText,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface CommandItem {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  category: string;
  keywords: string[];
}

export const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const { user } = useAuth();

  const go = (path: string) => {
    navigate(path);
    setOpen(false);
    setQuery('');
  };

  const commands: CommandItem[] = useMemo(
    () => [
      // Navigation
      { id: 'home', label: 'Home', description: 'Go to landing page', icon: <Home className="w-4 h-4" />, action: () => go('/'), category: 'Navigation', keywords: ['home', 'landing', 'main'] },
      { id: 'dashboard', label: 'Dashboard', description: 'File management area', icon: <LayoutDashboard className="w-4 h-4" />, action: () => go('/dashboard'), category: 'Navigation', keywords: ['dashboard', 'files', 'manage'] },
      { id: 'profile', label: 'Profile', description: 'Your account settings', icon: <User className="w-4 h-4" />, action: () => go('/profile'), category: 'Navigation', keywords: ['profile', 'account', 'settings', 'avatar'] },
      { id: 'pricing', label: 'Pricing', description: 'View premium plans', icon: <CreditCard className="w-4 h-4" />, action: () => go('/pricing'), category: 'Navigation', keywords: ['pricing', 'plans', 'premium', 'upgrade', 'pro', 'business'] },
      { id: 'support', label: 'Support Us', description: 'Donate to support the project', icon: <Heart className="w-4 h-4" />, action: () => go('/support'), category: 'Navigation', keywords: ['support', 'donate', 'help', 'heart'] },
      { id: 'contact', label: 'Contact', description: 'Get in touch with us', icon: <Mail className="w-4 h-4" />, action: () => go('/contact'), category: 'Navigation', keywords: ['contact', 'email', 'message', 'feedback'] },
      { id: 'payments', label: 'Payment History', description: 'View past transactions', icon: <Receipt className="w-4 h-4" />, action: () => go('/payment-history'), category: 'Navigation', keywords: ['payment', 'history', 'transactions', 'invoice'] },

      // Features
      { id: 'upload', label: 'Upload Files', description: 'Start uploading files now', icon: <Upload className="w-4 h-4" />, action: () => { go('/'); setTimeout(() => document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' }), 300); }, category: 'Features', keywords: ['upload', 'file', 'share', 'send'] },
      { id: 'pin', label: 'PIN Access', description: 'Access files via PIN code', icon: <KeyRound className="w-4 h-4" />, action: () => go('/pin'), category: 'Features', keywords: ['pin', 'code', 'access', 'retrieve'] },
      { id: 'scan', label: 'Scan QR Code', description: 'Scan a QR code to access files', icon: <ScanLine className="w-4 h-4" />, action: () => go('/scan'), category: 'Features', keywords: ['scan', 'qr', 'code', 'camera'] },

      // Auth
      ...(user
        ? [{ id: 'signout', label: 'Sign Out', description: 'Log out of your account', icon: <ShieldCheck className="w-4 h-4" />, action: () => go('/auth'), category: 'Account', keywords: ['sign out', 'logout', 'exit'] }]
        : [{ id: 'signin', label: 'Sign In', description: 'Log into your account', icon: <User className="w-4 h-4" />, action: () => go('/auth'), category: 'Account', keywords: ['sign in', 'login', 'register', 'signup'] }]),
    ],
    [user]
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(q) ||
        cmd.description.toLowerCase().includes(q) ||
        cmd.keywords.some((k) => k.includes(q))
    );
  }, [query, commands]);

  const grouped = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    filtered.forEach((cmd) => {
      if (!groups[cmd.category]) groups[cmd.category] = [];
      groups[cmd.category].push(cmd);
    });
    return groups;
  }, [filtered]);

  const flatList = useMemo(() => filtered, [filtered]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
        setQuery('');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, flatList.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && flatList[selectedIndex]) {
      e.preventDefault();
      flatList[selectedIndex].action();
    }
  };

  let itemIndex = -1;

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setQuery(''); }}>
      <DialogContent className="sm:max-w-lg p-0 rounded-2xl border-border/30 bg-card/98 backdrop-blur-2xl overflow-hidden shadow-[var(--shadow-2xl)] gap-0">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 border-b border-border/20">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search..."
            className="flex-1 h-14 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
          />
          <kbd className="hidden sm:inline-flex px-2 py-1 text-[10px] font-mono font-medium bg-muted/60 text-muted-foreground rounded-md border border-border/40">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[360px] overflow-y-auto py-2">
          {flatList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <FileText className="w-8 h-8 mb-3 opacity-40" />
              <p className="text-sm font-medium">No results found</p>
              <p className="text-xs mt-1">Try a different search term</p>
            </div>
          ) : (
            Object.entries(grouped).map(([category, items]) => (
              <div key={category}>
                <div className="px-4 py-2">
                  <p className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider">
                    {category}
                  </p>
                </div>
                {items.map((cmd) => {
                  itemIndex++;
                  const idx = itemIndex;
                  const isSelected = idx === selectedIndex;
                  return (
                    <button
                      key={cmd.id}
                      onClick={cmd.action}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                        isSelected
                          ? 'bg-primary/8 text-primary'
                          : 'text-foreground hover:bg-muted/40'
                      }`}
                    >
                      <span
                        className={`flex-shrink-0 p-1.5 rounded-lg transition-colors ${
                          isSelected ? 'bg-primary/15 text-primary' : 'bg-muted/50 text-muted-foreground'
                        }`}
                      >
                        {cmd.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{cmd.label}</p>
                        <p className="text-xs text-muted-foreground truncate">{cmd.description}</p>
                      </div>
                      {isSelected && (
                        <ArrowRight className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border/20 px-4 py-2.5 flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 font-mono bg-muted/60 rounded border border-border/40">↑↓</kbd>
              navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 font-mono bg-muted/60 rounded border border-border/40">↵</kbd>
              select
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Sparkles className="w-3 h-3 text-primary" />
            Command Palette
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
