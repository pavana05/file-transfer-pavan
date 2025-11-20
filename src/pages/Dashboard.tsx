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
import { FileAnalytics } from '@/components/dashboard/FileAnalytics';
import { FileListSkeleton } from '@/components/dashboard/FileListSkeleton';
import { DashboardHeaderSkeleton, DashboardStatsSkeleton } from '@/components/skeletons';
import { LoadingWrapper } from '@/components/LoadingWrapper';
import { usePageLoading } from '@/hooks/usePageLoading';

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
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-accent/5 via-transparent to-transparent"></div>
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/3 rounded-full blur-[100px] animate-float"></div>
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-accent/3 rounded-full blur-[100px] animate-float" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/40 shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-5">
          <div className="flex items-center justify-between gap-2">
            <Button 
              variant="ghost"
              onClick={() => navigate('/')}
              size="sm"
              className="text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all group rounded-xl h-9 sm:h-10 md:h-11 px-2 sm:px-3 md:px-4 flex-shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2 group-hover:-translate-x-1 transition-transform" />
              <span className="hidden xs:inline text-xs sm:text-sm">Back</span>
            </Button>
            
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-primary flex items-center justify-center shadow-lg">
                <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="font-bold text-foreground text-sm sm:text-lg truncate max-w-[120px] sm:max-w-none">My Files</span>
            </div>
            
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-20 sm:py-24 md:py-28 max-w-7xl">
        <div className="mb-6 sm:mb-8 md:mb-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3 bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">Your Shared Files</h1>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg">
            Manage and access all your uploaded files and their share links
          </p>
        </div>

        {/* Analytics Section */}
        {!loading && files.length > 0 && (
          <div className="mb-10">
            <FileAnalytics />
          </div>
        )}

        {loading ? (
          <FileListSkeleton />
        ) : files.length === 0 ? (
          <Card className="p-16 text-center bg-card/60 backdrop-blur-xl border border-border/50 rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
            <Upload className="w-20 h-20 mx-auto mb-6 text-muted-foreground" />
            <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">No files shared yet</h3>
            <p className="text-muted-foreground text-sm sm:text-base md:text-lg mb-6 sm:mb-8">Upload your first file to get started</p>
            <Button onClick={() => navigate('/')} className="bg-gradient-primary text-white h-11 sm:h-12 md:h-14 px-6 sm:px-8 rounded-xl sm:rounded-2xl text-sm sm:text-base shadow-lg hover:shadow-xl transition-all">
              <Upload className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Upload Files
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            {files.map((file) => (
              <Card 
                key={file.id} 
                className="p-4 sm:p-6 md:p-8 bg-card/60 backdrop-blur-xl border border-border/50 hover:border-primary/40 rounded-2xl sm:rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.15)] transition-all duration-300"
              >
                <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
                      <div className="relative group flex-shrink-0">
                        <div className="absolute inset-0 bg-gradient-primary rounded-xl sm:rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity"></div>
                        <div className="relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl bg-gradient-primary flex items-center justify-center shadow-lg">
                          <Upload className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base sm:text-lg md:text-xl truncate mb-1 sm:mb-2">{file.original_name}</h3>
                        <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4 text-xs sm:text-sm md:text-base text-muted-foreground">
                          <span className="flex items-center gap-1 sm:gap-2">
                            <HardDrive className="w-3 h-3 sm:w-4 sm:h-4" />
                            {formatFileSize(file.file_size)}
                          </span>
                          <span className="flex items-center gap-1 sm:gap-2">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden xs:inline">{format(new Date(file.upload_date), 'MMM d, yyyy')}</span>
                            <span className="xs:hidden">{format(new Date(file.upload_date), 'MMM d')}</span>
                          </span>
                          <span className="flex items-center gap-1 sm:gap-2">
                            <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                            {file.download_count}
                          </span>
                        </div>
                      </div>
                      {file.password_hash && (
                        <Badge variant="secondary" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 text-xs sm:text-sm flex-shrink-0">
                          <Lock className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden xs:inline">Protected</span>
                        </Badge>
                      )}
                    </div>

                    {/* Share Links */}
                    <div className="space-y-3 sm:space-y-4">
                      {/* PIN */}
                      <div className="flex items-center gap-2 sm:gap-3">
                        <Badge variant="outline" className="font-mono text-xs sm:text-sm md:text-base px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-2.5 rounded-lg sm:rounded-xl">
                          PIN: {file.share_pin}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(file.share_pin, 'PIN')}
                          className="h-9 w-9 sm:h-10 sm:w-10 md:h-11 md:w-11 rounded-lg sm:rounded-xl hover:bg-muted/80 flex-shrink-0"
                        >
                          <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </Button>
                      </div>

                      {/* Share URL */}
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="flex-1 min-w-0 bg-muted/60 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 rounded-xl sm:rounded-2xl border border-border/40">
                          <p className="text-xs sm:text-sm font-mono truncate">{getShareUrl(file.share_token)}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(getShareUrl(file.share_token), 'Link')}
                          className="h-9 w-9 sm:h-10 sm:w-10 md:h-11 md:w-11 rounded-lg sm:rounded-xl hover:bg-muted/80 flex-shrink-0"
                        >
                          <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(getShareUrl(file.share_token), '_blank')}
                          className="h-9 w-9 sm:h-10 sm:w-10 md:h-11 md:w-11 rounded-lg sm:rounded-xl hover:bg-muted/80 flex-shrink-0"
                        >
                          <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex lg:flex-col gap-2 sm:gap-3 lg:w-36">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 lg:w-full h-10 sm:h-11 md:h-12 rounded-lg sm:rounded-xl hover:bg-primary/5 hover:border-primary/40 text-xs sm:text-sm"
                      onClick={() => window.open(`/pin`, '_blank')}
                    >
                      <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      <span className="hidden xs:inline">Test PIN</span>
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
