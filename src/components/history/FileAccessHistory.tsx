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
    <Card className="p-6 bg-gradient-to-br from-background via-background to-muted/20 border-2 shadow-xl animate-in fade-in-50 duration-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent flex items-center justify-center">
            <History className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Recently Accessed</h3>
            <p className="text-sm text-muted-foreground">
              {history.length} file{history.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={clearHistory}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Clear
        </Button>
      </div>

      <div className="space-y-3">
        {history.map((item, index) => (
          <div
            key={item.pin + item.accessedAt}
            className="group p-4 rounded-xl bg-background/60 hover:bg-background border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 animate-in fade-in-50 slide-in-from-left-5"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-muted/50 to-muted/20 flex items-center justify-center flex-shrink-0">
                  <FileType className="h-5 w-5 text-muted-foreground" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm truncate mb-1">
                    {item.fileName}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <span>{formatFileSize(item.fileSize)}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(new Date(item.accessedAt), 'MMM d, h:mm a')}
                    </span>
                  </div>
                  <Badge variant="secondary" className="text-xs font-mono">
                    PIN: {item.pin}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => copyPin(item.pin)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => accessFile(item.pin)}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:text-destructive"
                  onClick={() => removeItem(item.pin)}
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
