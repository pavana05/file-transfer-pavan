import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Download, File, ArrowLeft, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { formatFileSize } from '@/lib/file-utils';
import { UploadService } from '@/services/uploadService';
import { useToast } from '@/hooks/use-toast';
import FilePreview from '@/components/filePreview/FilePreview';

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
      const info = await UploadService.getFileInfo(token!);
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
      
      // Increment download count
      await UploadService.incrementDownloadCount(fileInfo.share_token);
      
      // Enhanced direct download with better compatibility
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
      
      // Better cross-browser support
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      // Update download count in UI
      setFileInfo(prev => prev ? { ...prev, download_count: prev.download_count + 1 } : null);

      toast({
        title: "Download completed",
        description: "File has been downloaded to your system.",
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Enhanced Background with Multiple Gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background/95" />
        <div className="absolute inset-0 bg-gradient-to-tl from-destructive/5 via-transparent to-muted/10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-radial from-destructive/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-radial from-muted/15 to-transparent rounded-full blur-3xl" />
        
        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <Card className="relative p-12 text-center max-w-lg backdrop-blur-sm bg-card/95 border-border/50 shadow-2xl shadow-destructive/10 overflow-hidden group hover:shadow-3xl hover:shadow-destructive/15 transition-all duration-500">
            {/* Card Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 via-transparent to-muted/5 opacity-50" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-destructive/15 to-transparent rounded-full blur-2xl" />
            
            <div className="relative z-10 space-y-8">
              {/* Enhanced Icon */}
              <div className="relative">
                <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-destructive/10 to-muted/10 border border-destructive/20 flex items-center justify-center backdrop-blur-sm">
                  <File className="w-12 h-12 text-destructive/70" />
                </div>
                <div className="absolute inset-0 w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-destructive/5 to-transparent animate-pulse" />
              </div>

              {/* Enhanced Typography */}
              <div className="space-y-4">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  File Not Found
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-sm mx-auto">
                  {error}
                </p>
                <div className="w-16 h-0.5 bg-gradient-to-r from-destructive/50 to-transparent mx-auto" />
              </div>

              {/* Enhanced Button */}
              <Link to="/">
                <Button 
                  size="lg"
                  className="h-12 px-8 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200 hover:scale-105"
                >
                  <ArrowLeft className="w-5 h-5 mr-3" />
                  Back to Upload
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Enhanced Background with Multiple Gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background/95" />
      <div className="absolute inset-0 bg-gradient-to-tl from-primary/5 via-transparent to-accent/10" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-radial from-primary/20 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-radial from-accent/15 to-transparent rounded-full blur-3xl" />
      
      {/* Enhanced Theme Toggle */}
      <div className="fixed top-6 right-6 z-50">
        <div className="backdrop-blur-md bg-background/80 rounded-xl border border-border/50 p-1">
          <ThemeToggle />
        </div>
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-12 max-w-3xl">
        {/* Enhanced Header */}
        <div className="mb-12 text-center">
          <Link 
            to="/" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors duration-200 mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
            Back to Upload
          </Link>
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Shared File
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              Securely download the file that has been shared with you
            </p>
          </div>
        </div>

        {/* Enhanced File Card */}
        <Card className="relative p-8 backdrop-blur-sm bg-card/95 border-border/50 shadow-lg shadow-primary/5 overflow-hidden group hover:shadow-xl hover:shadow-primary/10 transition-all duration-300">
          {/* Card Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-50" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-primary/20 to-transparent rounded-full blur-2xl" />
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* Enhanced File Preview */}
              {fileInfo && (
                <FilePreview
                  fileName={fileInfo.original_name}
                  fileType={fileInfo.file_type}
                  storagePath={fileInfo.storage_path}
                  fileSize={fileInfo.file_size}
                />
              )}

              {/* Enhanced File Details */}
              <div className="flex-1 min-w-0 space-y-6">
                <div className="space-y-3">
                  <h2 className="text-2xl font-bold text-foreground break-words leading-tight">
                    {fileInfo?.original_name}
                  </h2>
                  
                  <div className="flex flex-wrap gap-4 text-muted-foreground">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50">
                      <span className="text-sm font-medium">{formatFileSize(fileInfo?.file_size || 0)}</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50">
                      <span className="text-sm font-medium">{fileInfo?.file_type}</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50">
                      <span className="text-sm font-medium">
                        {new Date(fileInfo?.upload_date || '').toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Badge 
                      variant="secondary" 
                      className="px-4 py-2 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20 text-foreground font-medium"
                    >
                      {fileInfo?.download_count} downloads
                    </Badge>
                  </div>
                </div>

                {/* Enhanced Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    onClick={handleDownload} 
                    disabled={downloading}
                    size="lg"
                    className="flex-1 sm:flex-none h-12 px-8 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200 hover:scale-105"
                  >
                    <Download className="w-5 h-5 mr-3" />
                    {downloading ? 'Downloading...' : 'Download File'}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={copyShareLink}
                    size="lg"
                    className="flex-1 sm:flex-none h-12 px-8 border-2 border-border/60 hover:border-primary/30 hover:bg-primary/5 backdrop-blur-sm transition-all duration-200 hover:scale-105 font-semibold"
                  >
                    <Share2 className="w-5 h-5 mr-3" />
                    Copy Link
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Enhanced Info Card */}
        <Card className="mt-8 p-8 backdrop-blur-sm bg-card/95 border-border/50 shadow-lg shadow-accent/5 hover:shadow-xl hover:shadow-accent/10 transition-all duration-300">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center">
                <File className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Secure File Sharing</h3>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-muted/30 to-muted/10 border border-border/30">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <p>Files are securely stored with enterprise-grade encryption</p>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-muted/30 to-muted/10 border border-border/30">
                <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                <p>Unique secure links can be shared with trusted contacts</p>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-muted/30 to-muted/10 border border-border/30">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <p>Download activity is monitored for transparency</p>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-muted/30 to-muted/10 border border-border/30">
                <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                <p>All files undergo automated security scanning</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default FileShare;