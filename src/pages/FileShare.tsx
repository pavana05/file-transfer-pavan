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

const FileShareSkeleton = () => (
  <div className="min-h-screen bg-background">
    <div className="container mx-auto px-4 py-8 sm:py-12 max-w-3xl">
      <Skeleton className="h-4 w-28 mb-6" />
      <Skeleton className="h-10 w-48 mx-auto mb-2" />
      <Skeleton className="h-5 w-72 mx-auto mb-8" />
      <Card className="p-6 border-border/50">
        <div className="flex flex-col lg:flex-row gap-6">
          <Skeleton className="w-full lg:w-2/5 aspect-[4/3] rounded-xl" />
          <div className="flex-1 space-y-4">
            <Skeleton className="h-7 w-full" />
            <div className="grid grid-cols-3 gap-2">
              <Skeleton className="h-14 rounded-lg" />
              <Skeleton className="h-14 rounded-lg" />
              <Skeleton className="h-14 rounded-lg" />
            </div>
            <Skeleton className="h-6 w-28" />
            <div className="flex gap-3">
              <Skeleton className="flex-1 h-11 rounded-xl" />
              <Skeleton className="flex-1 h-11 rounded-xl" />
            </div>
          </div>
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
    if (!token) { setError('Invalid share link'); setLoading(false); return; }
    loadFileInfo();
  }, [token]);

  const loadFileInfo = async () => {
    try {
      const normalizedToken = decodeURIComponent(token!).trim();
      const info = await UploadService.getFileInfo(normalizedToken);
      setFileInfo(info);
    } catch (err) {
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
      if (!response.ok) throw new Error('Failed to fetch file');
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
      toast({ title: "Download completed", description: "File downloaded successfully." });
    } catch (err) {
      toast({ title: "Download failed", description: "Unable to download the file. Please try again.", variant: "destructive" });
    } finally {
      setDownloading(false);
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Link copied!", description: "Share link copied to clipboard." });
  };

  if (loading) return <FileShareSkeleton />;

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-8 sm:p-10 text-center max-w-md border-border/50">
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-destructive/10 flex items-center justify-center">
              <File className="w-8 h-8 text-destructive" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-2">File Not Found</h1>
            <p className="text-muted-foreground mb-6 text-sm">{error}</p>
            <Link to="/">
              <Button size="lg" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Upload
              </Button>
            </Link>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/3 rounded-full blur-3xl" />
      </div>
      
      <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50">
        <ThemeToggle />
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-8 sm:py-12 max-w-3xl">
        {/* Header */}
        <motion.div className="mb-8 text-center" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-5 group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Upload
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Shared File</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Securely download the file shared with you</p>
        </motion.div>

        {/* Main Card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-5 sm:p-6 bg-card/90 backdrop-blur-sm border-border/50">
            <div className="flex flex-col lg:flex-row gap-6 items-start">
              {/* Preview */}
              <div className="w-full lg:w-2/5">
                {fileInfo && (
                  <FilePreview
                    fileName={fileInfo.original_name}
                    fileType={fileInfo.file_type}
                    storagePath={fileInfo.storage_path}
                    fileSize={fileInfo.file_size}
                  />
                )}
              </div>

              {/* Details */}
              <div className="w-full lg:flex-1 space-y-4">
                <h2 className="text-lg sm:text-xl font-bold text-foreground break-words leading-tight">
                  {fileInfo?.original_name}
                </h2>
                
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex flex-col items-center p-2.5 rounded-lg bg-muted/40 border border-border/30">
                    <span className="text-[10px] text-muted-foreground mb-0.5">Size</span>
                    <span className="text-xs font-semibold text-foreground">{formatFileSize(fileInfo?.file_size || 0)}</span>
                  </div>
                  <div className="flex flex-col items-center p-2.5 rounded-lg bg-muted/40 border border-border/30">
                    <span className="text-[10px] text-muted-foreground mb-0.5">Type</span>
                    <span className="text-xs font-semibold text-foreground truncate max-w-full">{fileInfo?.file_type?.split('/')[1] || 'Unknown'}</span>
                  </div>
                  <div className="flex flex-col items-center p-2.5 rounded-lg bg-muted/40 border border-border/30">
                    <span className="text-[10px] text-muted-foreground mb-0.5">Date</span>
                    <span className="text-xs font-semibold text-foreground">
                      {new Date(fileInfo?.upload_date || '').toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <Badge variant="secondary" className="px-3 py-1.5 bg-primary/8 border-primary/15 text-primary text-xs">
                  <Eye className="w-3 h-3 mr-1.5" />
                  {fileInfo?.download_count} downloads
                </Badge>

                <div className="flex flex-col xs:flex-row gap-2.5">
                  <Button 
                    onClick={handleDownload} 
                    disabled={downloading}
                    className="flex-1 h-11 gap-2 shadow-sm"
                  >
                    {downloading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        Download File
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={copyShareLink} className="flex-1 h-11 gap-2">
                    <Share2 className="w-4 h-4" />
                    Copy Link
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Collaboration */}
        {fileInfo && (
          <motion.div className="mt-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <RealtimeCollaboration fileId={fileInfo.id} fileName={fileInfo.original_name} />
          </motion.div>
        )}

        {/* Security Info */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <Card className="mt-5 p-5 border-border/50">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="w-4 h-4 text-primary" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">Secure File Sharing</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { icon: Shield, text: 'Enterprise-grade encryption' },
                { icon: CheckCircle, text: 'Unique secure sharing links' },
                { icon: Eye, text: 'Download activity monitoring' },
                { icon: Clock, text: 'Automated security scanning' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2.5 p-3 rounded-lg bg-muted/30 border border-border/30">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                  <p className="text-xs text-muted-foreground">{item.text}</p>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default FileShare;
