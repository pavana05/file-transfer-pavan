
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Download, ArrowLeft, Share2, Folder, Archive, FileIcon, Clock, Eye, Shield, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Progress } from '@/components/ui/progress';
import { formatFileSize } from '@/lib/file-utils';
import { UploadService } from '@/services/uploadService';
import { FileCollection, DatabaseFile } from '@/types/upload';
import { useToast } from '@/hooks/use-toast';

const CollectionShare = () => {
  const { token } = useParams<{ token: string }>();
  const [collection, setCollection] = useState<FileCollection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (!token) {
      setError('Invalid share link');
      setLoading(false);
      return;
    }

    loadCollectionInfo();
  }, [token]);

  const loadCollectionInfo = async () => {
    try {
      const collectionData = await UploadService.getCollectionFiles(token!);
      setCollection(collectionData);
    } catch (err) {
      setError('Collection not found or link has expired');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadFile = async (file: DatabaseFile) => {
    try {
      const url = await UploadService.getFileUrl(file.storage_path);
      await UploadService.incrementDownloadCount(file.share_token);
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch file');
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = file.original_name;
      link.setAttribute('download', file.original_name);
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      toast({
        title: "Download completed",
        description: `${file.original_name} has been downloaded.`,
      });
    } catch (err) {
      toast({
        title: "Download failed",
        description: "Unable to download the file. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDownloadAll = async () => {
    if (!collection) return;

    setDownloading(true);
    setDownloadProgress(0);

    try {
      await UploadService.incrementCollectionDownloadCount(collection.share_token);
      
      const downloadPromises = collection.files.map(async (file, index) => {
        await handleDownloadFile(file);
        setDownloadProgress(((index + 1) / collection.files.length) * 100);
      });

      for (let i = 0; i < downloadPromises.length; i += 3) {
        const batch = downloadPromises.slice(i, i + 3);
        await Promise.all(batch);
      }

      setCollection(prev => prev ? { 
        ...prev, 
        download_count: prev.download_count + 1 
      } : null);

      toast({
        title: "All files downloaded",
        description: `Successfully downloaded ${collection.files.length} files.`,
      });
    } catch (err) {
      toast({
        title: "Download failed",
        description: "Unable to download all files. Please try again.",
        variant: "destructive"
      });
    } finally {
      setDownloading(false);
      setDownloadProgress(0);
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied!",
      description: "Collection share link copied to clipboard.",
    });
  };

  // Component for file preview with image thumbnails
  const FilePreview: React.FC<{ file: DatabaseFile }> = ({ file }) => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [imageError, setImageError] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      if (file.file_type.startsWith('image/')) {
        setLoading(true);
        UploadService.getFileUrl(file.storage_path)
          .then(url => {
            setImageUrl(url);
            setLoading(false);
          })
          .catch(() => {
            setImageError(true);
            setLoading(false);
          });
      }
    }, [file]);

    // Show loading state
    if (loading) {
      return (
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-muted flex items-center justify-center flex-shrink-0 ring-2 ring-primary/10 shadow-md animate-pulse">
          <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      );
    }

    if (file.file_type.startsWith('image/') && imageUrl && !imageError) {
      return (
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-muted flex-shrink-0 ring-2 ring-primary/10 shadow-md">
          <img 
            src={imageUrl} 
            alt={file.original_name}
            className="w-full h-full object-cover animate-fade-in"
            onError={() => setImageError(true)}
          />
        </div>
      );
    }

    // Fallback icon for non-images or failed loads
    return (
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center flex-shrink-0 ring-2 ring-primary/10 shadow-md">
        <span className="text-xl sm:text-2xl">
          {getFileIcon(file.file_type)}
        </span>
      </div>
    );
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType.startsWith('video/')) return '🎥';
    if (fileType.startsWith('audio/')) return '🎵';
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    if (fileType.includes('sheet') || fileType.includes('excel')) return '📊';
    if (fileType.includes('presentation') || fileType.includes('powerpoint')) return '📈';
    if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('tar')) return '📦';
    if (fileType.includes('javascript') || fileType.includes('typescript')) return '🟨';
    if (fileType.includes('html')) return '🌐';
    if (fileType.includes('css')) return '🎨';
    if (fileType.includes('json')) return '📋';
    if (fileType.includes('python')) return '🐍';
    if (fileType.includes('java')) return '☕';
    return '📄';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground animate-pulse">Loading collection...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-destructive/5 flex items-center justify-center p-4">
        <Card className="p-8 sm:p-10 text-center max-w-md w-full border-destructive/20 shadow-2xl">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-destructive/10 flex items-center justify-center">
            <Folder className="w-10 h-10 text-destructive/60" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-3">Collection Not Found</h1>
          <p className="text-muted-foreground mb-8">{error}</p>
          <Link to="/">
            <Button size="lg" className="w-full sm:w-auto gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Upload
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      
      <div className="container relative mx-auto px-4 py-8 sm:py-12 max-w-4xl">
        {/* Header */}
        <div className="mb-8 sm:mb-10">
          <Link 
            to="/" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Upload
          </Link>
          
          <div className="flex items-start gap-4">
            <div className="hidden sm:flex w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 items-center justify-center shadow-lg shadow-primary/25">
              <Folder className="w-8 h-8 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium text-primary uppercase tracking-wider">Shared Collection</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-bold text-foreground break-words leading-tight">
                {collection?.collection_name}
              </h1>
              <p className="text-muted-foreground mt-2 text-sm sm:text-base">
                {collection?.description || 'A curated collection of shared files'}
              </p>
            </div>
          </div>
        </div>

        {/* Collection Stats Card */}
        <Card className="p-5 sm:p-8 mb-6 border-primary/10 shadow-xl bg-card/80 backdrop-blur-sm">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 rounded-xl bg-primary/5 border border-primary/10">
              <div className="text-2xl sm:text-3xl font-bold text-primary">{collection?.files.length}</div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1">Files</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-secondary/50 border border-border">
              <div className="text-2xl sm:text-3xl font-bold text-foreground">{formatFileSize(collection?.collection_size || 0)}</div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1">Total Size</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-secondary/50 border border-border">
              <div className="flex items-center justify-center gap-1">
                <Download className="w-5 h-5 text-muted-foreground" />
                <span className="text-2xl sm:text-3xl font-bold text-foreground">{collection?.download_count}</span>
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1">Downloads</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-secondary/50 border border-border">
              <div className="flex items-center justify-center gap-1">
                <Clock className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1">
                {new Date(collection?.created_date || '').toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Download Progress */}
          {downloading && (
            <div className="mb-6 p-4 rounded-xl bg-primary/5 border border-primary/20">
              <div className="flex justify-between text-sm text-foreground mb-3">
                <span className="font-medium">Downloading files...</span>
                <span className="font-bold text-primary">{downloadProgress.toFixed(0)}%</span>
              </div>
              <Progress value={downloadProgress} className="h-2" />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleDownloadAll} 
              disabled={downloading || !collection?.files.length}
              size="lg"
              className="flex-1 gap-2 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
            >
              <Archive className="w-5 h-5" />
              {downloading ? 'Downloading...' : 'Download All Files'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={copyShareLink}
              size="lg"
              className="flex-1 gap-2 border-2 hover:bg-primary/5"
            >
              <Share2 className="w-5 h-5" />
              Copy Share Link
            </Button>
          </div>
        </Card>

        {/* Files List */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-foreground">Files in Collection</h3>
              <p className="text-xs text-muted-foreground">{collection?.files.length} items ready to download</p>
            </div>
          </div>

          <div className="space-y-3">
            {collection?.files.map((file, index) => (
              <Card 
                key={file.id} 
                className="p-4 sm:p-5 hover:shadow-lg hover:border-primary/20 transition-all duration-300 group bg-card/80 backdrop-blur-sm"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-4">
                  <FilePreview file={file} />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground truncate text-sm sm:text-base group-hover:text-primary transition-colors">
                      {file.original_name}
                    </h4>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2">
                      <Badge variant="secondary" className="text-xs font-medium">
                        {formatFileSize(file.file_size)}
                      </Badge>
                      <Badge variant="outline" className="text-xs hidden sm:inline-flex">
                        {file.file_type.split('/')[1]?.toUpperCase() || file.file_type}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {file.download_count} downloads
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadFile(file)}
                    className="flex-shrink-0 gap-2 border-2 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Download</span>
                  </Button>
                </div>
              </Card>
            ))}

            {!collection?.files.length && (
              <Card className="p-10 text-center border-dashed border-2">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <FileIcon className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">No files in this collection</p>
              </Card>
            )}
          </div>
        </div>

        {/* Info Card */}
        <Card className="p-5 sm:p-6 border-primary/10 bg-gradient-to-br from-primary/5 to-transparent">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-3">About This Collection</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Download individual files or the entire collection at once
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Files are securely stored and scanned for safety
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Share this link with anyone you trust
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Download counts are tracked for each file
                </li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            Powered by secure file sharing technology
          </p>
        </div>
      </div>
    </div>
  );
};

export default CollectionShare;
