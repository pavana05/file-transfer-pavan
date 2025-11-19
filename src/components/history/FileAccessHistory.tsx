import React, { useState, useEffect } from 'react';
import { History, File, Copy, ExternalLink, Clock, Trash2, FileType } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatFileSize } from '@/lib/file-utils';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface AccessedFile {
  pin: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  accessedAt: string;
}

const FileAccessHistory: React.FC = () => {
  const [history, setHistory] = useState<AccessedFile[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const stored = localStorage.getItem('fileAccessHistory');
    if (stored) {
      const parsed = JSON.parse(stored);
      setHistory(parsed);
    }
  };

  const clearHistory = () => {
    localStorage.removeItem('fileAccessHistory');
    setHistory([]);
    toast({
      title: 'History cleared',
      description: 'All access history has been removed',
    });
  };

  const removeItem = (pin: string) => {
    const updated = history.filter(item => item.pin !== pin);
    localStorage.setItem('fileAccessHistory', JSON.stringify(updated));
    setHistory(updated);
    toast({
      title: 'Removed from history',
    });
  };

  const copyPin = (pin: string) => {
    navigator.clipboard.writeText(pin);
    toast({
      title: 'PIN copied',
      description: 'PIN has been copied to clipboard',
    });
  };

  const accessFile = (pin: string) => {
    window.location.href = `/?pin=${pin}`;
  };

  if (history.length === 0) {
    return null;
  }

  return (
    <Card className="overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm shadow-card hover:shadow-hover transition-all duration-500 animate-in fade-in-50 slide-up duration-700">
      <div className="p-6 pb-5 border-b border-border/40 bg-gradient-to-br from-muted/20 via-background to-background">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-primary shadow-glow flex items-center justify-center ring-4 ring-primary/10">
              <History className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-bold text-xl text-foreground tracking-tight">Recently Accessed</h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                {history.length} {history.length !== 1 ? 'files' : 'file'} in history
              </p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={clearHistory}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-2">
        {history.map((item, index) => (
          <div
            key={item.pin + item.accessedAt}
            className="group relative p-5 rounded-2xl bg-gradient-to-br from-card via-card to-muted/5 border border-border/60 hover:border-primary/40 hover:shadow-hover transition-all duration-300 animate-in fade-in-50 slide-in-from-left-5"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/10 via-accent/10 to-muted/20 flex items-center justify-center flex-shrink-0 border border-border/40 group-hover:border-primary/30 transition-colors">
                  <FileType className="h-6 w-6 text-primary" />
                </div>
                
                <div className="flex-1 min-w-0 pt-0.5">
                  <h4 className="font-semibold text-base text-foreground truncate mb-2 group-hover:text-primary transition-colors">
                    {item.fileName}
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                    <span className="font-medium">{formatFileSize(item.fileSize)}</span>
                    <span className="text-border">•</span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      {format(new Date(item.accessedAt), 'MMM d, h:mm a')}
                    </span>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className="text-xs font-mono px-3 py-1 bg-muted/60 hover:bg-muted transition-colors border border-border/40"
                  >
                    PIN: {item.pin}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 hover:bg-muted hover:text-primary transition-colors"
                  onClick={() => copyPin(item.pin)}
                  title="Copy PIN"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 hover:bg-muted hover:text-primary transition-colors"
                  onClick={() => accessFile(item.pin)}
                  title="Access File"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 hover:bg-destructive/10 hover:text-destructive transition-colors"
                  onClick={() => removeItem(item.pin)}
                  title="Remove from History"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default FileAccessHistory;
