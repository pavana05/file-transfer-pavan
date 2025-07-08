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
      
      // Trigger direct download to system
      const link = document.createElement('a');
      link.href = url;
      link.download = fileInfo.original_name;
      link.setAttribute('download', fileInfo.original_name);
      // Force download behavior
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Update download count in UI
      setFileInfo(prev => prev ? { ...prev, download_count: prev.download_count + 1 } : null);

      toast({
        title: "Download started",
        description: "Your file download has begun.",
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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <File className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h1 className="text-xl font-semibold text-foreground mb-2">File Not Found</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Link to="/">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Upload
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Upload
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Shared File</h1>
          <p className="text-muted-foreground mt-2">Download the file shared with you</p>
        </div>

        {/* File Card */}
        <Card className="p-6">
          <div className="flex items-start gap-4">
            {/* File Icon */}
            <div className="w-16 h-16 rounded-xl bg-gradient-primary flex items-center justify-center flex-shrink-0">
              <File className="w-8 h-8 text-white" />
            </div>

            {/* File Details */}
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-foreground mb-2 break-words">
                {fileInfo?.original_name}
              </h2>
              
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-4">
                <span>{formatFileSize(fileInfo?.file_size || 0)}</span>
                <span>•</span>
                <span>{fileInfo?.file_type}</span>
                <span>•</span>
                <span>Uploaded {new Date(fileInfo?.upload_date || '').toLocaleDateString()}</span>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary">
                  {fileInfo?.download_count} downloads
                </Badge>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <Button 
                  onClick={handleDownload} 
                  disabled={downloading}
                  className="flex-1 sm:flex-none"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {downloading ? 'Downloading...' : 'Download File'}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={copyShareLink}
                  className="flex-1 sm:flex-none"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Copy Link
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Info Card */}
        <Card className="mt-6 p-6">
          <h3 className="font-semibold text-foreground mb-3">About This Service</h3>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>• Files are securely stored and can be accessed via this unique link</p>
            <p>• This link can be shared with anyone you trust</p>
            <p>• Download count is tracked for transparency</p>
            <p>• Files are scanned for security before sharing</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default FileShare;