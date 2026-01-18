import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { motion } from 'framer-motion';
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
  Unlock,
  FileUp,
  TrendingUp,
  BarChart3,
  Trash2,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  FolderOpen
} from 'lucide-react';
import { formatFileSize } from '@/lib/file-utils';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { FileAnalytics } from '@/components/dashboard/FileAnalytics';
import { FileListSkeleton } from '@/components/dashboard/FileListSkeleton';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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

interface FileStats {
  totalFiles: number;
  totalDownloads: number;
  totalStorage: number;
  protectedFiles: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [files, setFiles] = useState<SharedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [stats, setStats] = useState<FileStats>({
    totalFiles: 0,
    totalDownloads: 0,
    totalStorage: 0,
    protectedFiles: 0
  });

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
      
      const filesData = data || [];
      setFiles(filesData);
      
      // Calculate stats
      setStats({
        totalFiles: filesData.length,
        totalDownloads: filesData.reduce((sum, f) => sum + (f.download_count || 0), 0),
        totalStorage: filesData.reduce((sum, f) => sum + (f.file_size || 0), 0),
        protectedFiles: filesData.filter(f => f.password_hash).length
      });
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

  const handleDeleteFile = async (fileId: string, filename: string) => {
    try {
      // Delete from storage
      const file = files.find(f => f.id === fileId);
      if (file) {
        await supabase.storage.from('uploads').remove([`files/${filename}`]);
      }
      
      // Delete from database
      const { error } = await supabase
        .from('uploaded_files')
        .delete()
        .eq('id', fileId);

      if (error) throw error;

      setFiles(prev => prev.filter(f => f.id !== fileId));
      toast({
        title: 'File deleted',
        description: 'File has been successfully deleted.',
      });
    } catch (error) {
      toast({
        title: 'Error deleting file',
        description: 'Failed to delete the file',
        variant: 'destructive'
      });
    }
  };

  // Filter files
  const filteredFiles = files.filter(file => {
    const matchesSearch = file.original_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || 
      (filterType === 'protected' && file.password_hash) ||
      (filterType === 'public' && !file.password_hash);
    return matchesSearch && matchesFilter;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Premium Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-primary/8 via-primary/4 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-accent/8 to-transparent rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary)/0.02)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/0.02)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      {/* Header */}
      <header className="relative border-b border-border/40 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost"
                onClick={() => navigate('/')}
                size="sm"
                className="text-muted-foreground hover:text-foreground transition-all group"
              >
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back
              </Button>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-lg shadow-primary/20">
                <FolderOpen className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="font-bold text-lg">My Files</h1>
                <p className="text-xs text-muted-foreground">Manage your shared files</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Link to="/profile">
                <Button variant="outline" size="sm">Profile</Button>
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        <motion.div 
          variants={containerVariants} 
          initial="hidden" 
          animate="visible"
          className="space-y-8"
        >
          {/* Page Header */}
          <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
                Your Shared Files
              </h1>
              <p className="text-muted-foreground">
                Manage and access all your uploaded files and their share links
              </p>
            </div>
            <Button 
              onClick={() => navigate('/')} 
              className="bg-gradient-to-r from-primary to-primary-glow hover:shadow-lg hover:shadow-primary/25 transition-all gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload New File
            </Button>
          </motion.div>

          {/* Stats Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: FileUp, label: 'Total Files', value: stats.totalFiles, color: 'primary', gradient: 'from-primary/10 to-primary/5' },
              { icon: Download, label: 'Total Downloads', value: stats.totalDownloads, color: 'success', gradient: 'from-success/10 to-success/5' },
              { icon: HardDrive, label: 'Storage Used', value: formatFileSize(stats.totalStorage), color: 'warning', gradient: 'from-warning/10 to-warning/5' },
              { icon: Lock, label: 'Protected Files', value: stats.protectedFiles, color: 'accent', gradient: 'from-accent/10 to-accent/5' },
            ].map((stat, i) => (
              <Card key={i} className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden relative group hover:border-primary/30 transition-all">
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-50`} />
                <CardContent className="p-5 relative">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl lg:text-3xl font-bold">{stat.value}</p>
                    </div>
                    <div className={`w-10 h-10 rounded-xl bg-${stat.color}/10 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <stat.icon className={`w-5 h-5 text-${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          {/* Analytics Section */}
          {!loading && files.length > 0 && (
            <motion.div variants={itemVariants}>
              <FileAnalytics />
            </motion.div>
          )}

          {/* Search and Filters */}
          {!loading && files.length > 0 && (
            <motion.div variants={itemVariants}>
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search files..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="w-full sm:w-40">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Filter" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Files</SelectItem>
                        <SelectItem value="protected">Protected</SelectItem>
                        <SelectItem value="public">Public</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Files List */}
          {loading ? (
            <FileListSkeleton />
          ) : filteredFiles.length === 0 ? (
            <motion.div variants={itemVariants}>
              <Card className="p-12 md:p-16 text-center bg-card/60 backdrop-blur-xl border border-border/50 rounded-3xl">
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-2xl" />
                  <div className="relative w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center border border-primary/20">
                    <Upload className="w-10 h-10 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3">
                  {files.length === 0 ? 'No files shared yet' : 'No files match your search'}
                </h3>
                <p className="text-muted-foreground text-sm sm:text-base mb-8 max-w-md mx-auto">
                  {files.length === 0 
                    ? 'Upload your first file to start sharing with secure links and PINs'
                    : 'Try adjusting your search or filter criteria'}
                </p>
                {files.length === 0 && (
                  <Button 
                    onClick={() => navigate('/')} 
                    className="bg-gradient-to-r from-primary to-primary-glow hover:shadow-xl hover:shadow-primary/25 transition-all h-12 px-8"
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    Upload Files
                  </Button>
                )}
              </Card>
            </motion.div>
          ) : (
            <motion.div variants={itemVariants} className="grid gap-4">
              {filteredFiles.map((file, index) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="group bg-card/60 backdrop-blur-xl border border-border/50 hover:border-primary/40 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
                        {/* File Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-4 mb-4">
                            <div className="relative flex-shrink-0">
                              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl blur-lg opacity-0 group-hover:opacity-60 transition-opacity" />
                              <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center border border-primary/10">
                                <FileUp className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-base sm:text-lg truncate mb-1">{file.original_name}</h3>
                              <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                                <span className="flex items-center gap-1.5">
                                  <HardDrive className="w-3.5 h-3.5" />
                                  {formatFileSize(file.file_size)}
                                </span>
                                <span className="flex items-center gap-1.5">
                                  <Calendar className="w-3.5 h-3.5" />
                                  {format(new Date(file.upload_date), 'MMM d, yyyy')}
                                </span>
                                <span className="flex items-center gap-1.5">
                                  <Download className="w-3.5 h-3.5" />
                                  {file.download_count} downloads
                                </span>
                              </div>
                            </div>
                            {file.password_hash ? (
                              <Badge variant="secondary" className="flex items-center gap-1.5 bg-warning/10 text-warning border-warning/20 flex-shrink-0">
                                <Lock className="w-3 h-3" />
                                <span className="hidden xs:inline">Protected</span>
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="flex items-center gap-1.5 bg-success/10 text-success border-success/20 flex-shrink-0">
                                <Unlock className="w-3 h-3" />
                                <span className="hidden xs:inline">Public</span>
                              </Badge>
                            )}
                          </div>

                          {/* Share Links */}
                          <div className="space-y-3">
                            {/* PIN */}
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="font-mono text-sm px-4 py-2 rounded-lg bg-muted/50">
                                PIN: {file.share_pin}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(file.share_pin, 'PIN')}
                                className="h-9 w-9 rounded-lg hover:bg-primary/10"
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                            </div>

                            {/* Share URL */}
                            <div className="flex items-center gap-2">
                              <div className="flex-1 min-w-0 bg-muted/50 px-4 py-2.5 rounded-xl border border-border/40">
                                <p className="text-xs sm:text-sm font-mono truncate">{getShareUrl(file.share_token)}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(getShareUrl(file.share_token), 'Link')}
                                className="h-9 w-9 rounded-lg hover:bg-primary/10 flex-shrink-0"
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(getShareUrl(file.share_token), '_blank')}
                                className="h-9 w-9 rounded-lg hover:bg-primary/10 flex-shrink-0"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex lg:flex-col gap-2 lg:w-28 flex-shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 lg:w-full h-10 rounded-lg hover:bg-primary/5 hover:border-primary/40"
                            onClick={() => window.open(`/pin`, '_blank')}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Test PIN
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 lg:w-full h-10 rounded-lg text-destructive hover:bg-destructive/10 hover:border-destructive/40"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete this file?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. The file will be permanently deleted and the share link will no longer work.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteFile(file.id, file.share_token)}
                                  className="bg-destructive hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;
