import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { 
  ArrowLeft, 
  Upload, 
  Copy, 
  ExternalLink, 
  Download, 
  Calendar,
  HardDrive,
  Eye,
  Lock,
  Unlock
} from 'lucide-react';
import { formatFileSize } from '@/lib/file-utils';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface SharedFile {
  id: string;
  original_name: string;
  file_size: number;
  file_type: string;
  upload_date: string;
  download_count: number;
  share_token: string;
  share_pin: string;
  password_hash: string | null;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [files, setFiles] = useState<SharedFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      navigate('/auth');
      return;
    }
    
    loadFiles();
  }, [user, authLoading, navigate]);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('uploaded_files')
        .select('*')
        .eq('user_id', user?.id)
        .order('upload_date', { ascending: false });

      if (error) throw error;
      setFiles(data || []);
    } catch (error) {
      toast({
        title: 'Error loading files',
        description: 'Failed to load your shared files',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: `${label} copied!`,
      description: `${label} has been copied to your clipboard.`,
    });
  };

  const getShareUrl = (token: string) => 
    `${window.location.origin}/share/${encodeURIComponent(token)}`;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background" />
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/2 rounded-full blur-[80px] animate-float"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent/2 rounded-full blur-[80px] animate-float" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/70 backdrop-blur-2xl border-b border-border/40 shadow-lg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost"
              onClick={() => navigate('/')}
              size="sm"
              className="text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all group rounded-lg"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Upload
            </Button>
            
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-md">
                <Upload className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="font-bold text-foreground text-base">My Shared Files</span>
            </div>
            
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-24 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Your Shared Files</h1>
          <p className="text-muted-foreground">
            Manage and access all your uploaded files and their share links
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : files.length === 0 ? (
          <Card className="p-12 text-center bg-card/40 backdrop-blur-md border border-border/60">
            <Upload className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No files shared yet</h3>
            <p className="text-muted-foreground mb-6">Upload your first file to get started</p>
            <Button onClick={() => navigate('/')} className="bg-gradient-primary text-white">
              <Upload className="w-4 h-4 mr-2" />
              Upload Files
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {files.map((file) => (
              <Card 
                key={file.id} 
                className="p-6 bg-card/40 backdrop-blur-md border border-border/60 hover:border-primary/50 transition-all duration-300"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center flex-shrink-0 shadow-md">
                        <Upload className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate mb-1">{file.original_name}</h3>
                        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <HardDrive className="w-3.5 h-3.5" />
                            {formatFileSize(file.file_size)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {format(new Date(file.upload_date), 'MMM d, yyyy')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Download className="w-3.5 h-3.5" />
                            {file.download_count} downloads
                          </span>
                        </div>
                      </div>
                      {file.password_hash && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          Protected
                        </Badge>
                      )}
                    </div>

                    {/* Share Links */}
                    <div className="space-y-3">
                      {/* PIN */}
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono text-sm px-3 py-1">
                          PIN: {file.share_pin}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(file.share_pin, 'PIN')}
                          className="h-8"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </Button>
                      </div>

                      {/* Share URL */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 min-w-0 bg-muted/50 px-3 py-2 rounded-lg border border-border/30">
                          <p className="text-sm font-mono truncate">{getShareUrl(file.share_token)}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(getShareUrl(file.share_token), 'Link')}
                          className="h-9"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(getShareUrl(file.share_token), '_blank')}
                          className="h-9"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex lg:flex-col gap-2 lg:w-32">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 lg:w-full"
                      onClick={() => window.open(`/pin`, '_blank')}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Test PIN
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
