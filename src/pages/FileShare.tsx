import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Download, File, ArrowLeft, Share2, Shield, Clock, Eye, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { formatFileSize } from '@/lib/file-utils';
import { UploadService } from '@/services/uploadService';
import { useToast } from '@/hooks/use-toast';
import FilePreview from '@/components/filePreview/FilePreview';
import RealtimeCollaboration from '@/components/collaboration/RealtimeCollaboration';
import { motion } from 'framer-motion';

interface FileInfo {
  id: string;
  filename: string;
  original_name: string;
  file_size: number;
  file_type: string;
  storage_path: string;
  share_token: string;
  upload_date: string;
  download_count: number;
}

// Skeleton Loading Component
const FileShareSkeleton = () => (
  <div className="min-h-screen bg-background relative overflow-hidden">
    {/* Background effects */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-primary/10 via-primary/5 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-accent/10 to-transparent rounded-full blur-3xl" />
    </div>
    
    <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50">
      <Skeleton className="h-10 w-10 rounded-xl" />
    </div>
    
    <div className="relative z-10 container mx-auto px-4 py-8 sm:py-12 max-w-3xl">
      {/* Header */}
      <div className="mb-8 sm:mb-12 text-center">
        <Skeleton className="h-4 w-32 mx-auto mb-6" />
        <Skeleton className="h-12 w-64 mx-auto mb-4" />
        <Skeleton className="h-5 w-80 mx-auto" />
      </div>

      {/* Main Card */}
      <Card className="p-6 sm:p-8 bg-card/80 backdrop-blur-xl border border-border/50">
        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
          {/* Preview Section */}
          <div className="w-full lg:w-2/5">
            <Skeleton className="aspect-square rounded-2xl" />
          </div>

          {/* Details Section */}
          <div className="flex-1 space-y-6">
            <Skeleton className="h-8 w-full" />
            
            <div className="grid grid-cols-3 gap-3">
              <Skeleton className="h-12 rounded-lg" />
              <Skeleton className="h-12 rounded-lg" />
              <Skeleton className="h-12 rounded-lg" />
            </div>
            
            <Skeleton className="h-6 w-32" />
            
            <div className="flex gap-3">
              <Skeleton className="flex-1 h-12 rounded-xl" />
              <Skeleton className="flex-1 h-12 rounded-xl" />
            </div>
          </div>
        </div>
      </Card>

      {/* Info Card */}
      <Card className="mt-6 p-6 bg-card/80 backdrop-blur-xl border border-border/50">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      </Card>
    </div>
  </div>
);

const FileShare = () => {
  const { token } = useParams<{ token: string }>();
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!token) {
      setError('Invalid share link');
      setLoading(false);
      return;
    }

    loadFileInfo();
  }, [token]);

  const loadFileInfo = async () => {
    try {
      const normalizedToken = decodeURIComponent(token!).trim();
      console.log('Attempting to load file with token:', normalizedToken);
      const info = await UploadService.getFileInfo(normalizedToken);
      console.log('File info loaded successfully:', info);
      setFileInfo(info);
    } catch (err) {
      console.error('Failed to load file info:', err);
      setError('File not found or link has expired');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!fileInfo) return;

    setDownloading(true);
    try {
      const url = await UploadService.getFileUrl(fileInfo.storage_path);
      
      await UploadService.incrementDownloadCount(fileInfo.share_token);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch file');
      }
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileInfo.original_name;
      link.setAttribute('download', fileInfo.original_name);
      
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      setFileInfo(prev => prev ? { ...prev, download_count: prev.download_count + 1 } : null);

      toast({
        title: "Download completed",
        description: "File downloaded successfully.",
      });
    } catch (err) {
      toast({
        title: "Download failed",
        description: "Unable to download the file. Please try again.",
        variant: "destructive"
      });
    } finally {
      setDownloading(false);
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied!",
      description: "Share link copied to clipboard.",
    });
  };

  if (loading) {
    return <FileShareSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-background">
        {/* Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-destructive/10 via-destructive/5 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-muted/15 to-transparent rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="p-10 sm:p-12 text-center max-w-lg bg-card/90 backdrop-blur-xl border border-border/50 shadow-2xl">
              <motion.div 
                className="w-20 h-20 mx-auto rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mb-6"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <File className="w-10 h-10 text-destructive" />
              </motion.div>

              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
                File Not Found
              </h1>
              <p className="text-muted-foreground mb-8 text-base">
                {error}
              </p>

              <Link to="/">
                <Button size="lg" className="h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/25">
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back to Upload
                </Button>
              </Link>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Premium Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-primary/10 via-primary/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-accent/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary)/0.02)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/0.02)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>
      
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="backdrop-blur-xl bg-card/80 rounded-xl border border-border/50 p-1 shadow-lg"
        >
          <ThemeToggle />
        </motion.div>
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-8 sm:py-12 max-w-3xl">
        {/* Header */}
        <motion.div 
          className="mb-8 sm:mb-12 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link 
            to="/" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors duration-200 mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
            Back to Upload
          </Link>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-3">
            Shared File
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-md mx-auto">
            Securely download the file that has been shared with you
          </p>
        </motion.div>

        {/* Main File Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="p-5 sm:p-6 md:p-8 bg-card/90 backdrop-blur-xl border border-border/50 shadow-xl hover:shadow-2xl transition-all duration-500 group">
            {/* Glow effect on hover */}
            <div className="absolute inset-0 rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.2)]" />
            
            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 items-start">
                {/* File Preview */}
                <div className="w-full lg:w-2/5">
                  {fileInfo && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <FilePreview
                        fileName={fileInfo.original_name}
                        fileType={fileInfo.file_type}
                        storagePath={fileInfo.storage_path}
                        fileSize={fileInfo.file_size}
                      />
                    </motion.div>
                  )}
                </div>

                {/* File Details */}
                <div className="w-full lg:flex-1 space-y-5">
                  <motion.h2 
                    className="text-xl sm:text-2xl font-bold text-foreground break-words leading-tight"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {fileInfo?.original_name}
                  </motion.h2>
                  
                  {/* File Stats */}
                  <motion.div 
                    className="grid grid-cols-3 gap-2 sm:gap-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="flex flex-col items-center p-3 rounded-xl bg-muted/50 border border-border/30 hover:border-primary/30 hover:bg-muted/70 transition-all duration-300">
                      <span className="text-xs text-muted-foreground mb-1">Size</span>
                      <span className="text-sm font-semibold text-foreground">{formatFileSize(fileInfo?.file_size || 0)}</span>
                    </div>
                    <div className="flex flex-col items-center p-3 rounded-xl bg-muted/50 border border-border/30 hover:border-primary/30 hover:bg-muted/70 transition-all duration-300">
                      <span className="text-xs text-muted-foreground mb-1">Type</span>
                      <span className="text-sm font-semibold text-foreground truncate max-w-full">{fileInfo?.file_type?.split('/')[1] || 'Unknown'}</span>
                    </div>
                    <div className="flex flex-col items-center p-3 rounded-xl bg-muted/50 border border-border/30 hover:border-primary/30 hover:bg-muted/70 transition-all duration-300">
                      <span className="text-xs text-muted-foreground mb-1">Date</span>
                      <span className="text-sm font-semibold text-foreground">
                        {new Date(fileInfo?.upload_date || '').toLocaleDateString()}
                      </span>
                    </div>
                  </motion.div>

                  {/* Download count */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Badge 
                      variant="secondary" 
                      className="px-4 py-2 bg-primary/10 border-primary/20 text-primary font-medium hover:bg-primary/15 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5 mr-2" />
                      {fileInfo?.download_count} downloads
                    </Badge>
                  </motion.div>

                  {/* Action Buttons */}
                  <motion.div 
                    className="flex flex-col xs:flex-row gap-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <Button 
                      onClick={handleDownload} 
                      disabled={downloading}
                      size="lg"
                      className="flex-1 h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-[1.02]"
                    >
                      {downloading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <Download className="w-5 h-5 mr-2" />
                          Download File
                        </>
                      )}
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={copyShareLink}
                      size="lg"
                      className="flex-1 h-12 border-2 border-border hover:border-primary/30 hover:bg-primary/5 font-semibold transition-all duration-300 hover:scale-[1.02]"
                    >
                      <Share2 className="w-5 h-5 mr-2" />
                      Copy Link
                    </Button>
                  </motion.div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Real-time Collaboration */}
        {fileInfo && (
          <motion.div 
            className="mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <RealtimeCollaboration 
              fileId={fileInfo.id} 
              fileName={fileInfo.original_name}
            />
          </motion.div>
        )}

        {/* Security Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="mt-6 p-5 sm:p-6 bg-card/90 backdrop-blur-xl border border-border/50 shadow-lg">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Secure File Sharing</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: Shield, text: 'Enterprise-grade encryption for all files' },
                { icon: CheckCircle, text: 'Unique secure links for trusted sharing' },
                { icon: Eye, text: 'Download activity monitoring' },
                { icon: Clock, text: 'Automated security scanning' },
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  className="flex items-start gap-3 p-4 rounded-xl bg-muted/30 border border-border/30 hover:border-primary/20 hover:bg-muted/50 transition-all duration-300"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + i * 0.1 }}
                >
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">{item.text}</p>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default FileShare;
