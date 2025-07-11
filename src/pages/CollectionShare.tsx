
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Download, File, ArrowLeft, Share2, Folder, Archive, ImageIcon } from 'lucide-react';
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
      
      // Increment download count for individual file
      await UploadService.incrementDownloadCount(file.share_token);
      
      // Enhanced download with blob handling
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch file');
      }
      
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
      // Increment collection download count
      await UploadService.incrementCollectionDownloadCount(collection.share_token);
      
      // Download files in parallel for faster download (3 at a time)
      const downloadPromises = collection.files.map(async (file, index) => {
        await handleDownloadFile(file);
        setDownloadProgress(((index + 1) / collection.files.length) * 100);
      });

      // Execute downloads in batches of 3 for better performance
      for (let i = 0; i < downloadPromises.length; i += 3) {
        const batch = downloadPromises.slice(i, i + 3);
        await Promise.all(batch);
      }

      // Update download count in UI
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

    useEffect(() => {
      if (file.file_type.startsWith('image/')) {
        UploadService.getFileUrl(file.storage_path)
          .then(url => setImageUrl(url))
          .catch(() => setImageError(true));
      }
    }, [file]);

    if (file.file_type.startsWith('image/') && imageUrl && !imageError) {
      return (
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0 ring-1 ring-border">
          <img 
            src={imageUrl} 
            alt={file.original_name}
            className="w-full h-full object-cover animate-fade-in"
            onError={() => setImageError(true)}
          />
        </div>
      );
    }

    // Fallback to emoji icons for non-images or failed image loads
    return (
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 ring-1 ring-border">
        <span className="text-sm sm:text-lg">
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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
        <Card className="p-6 sm:p-8 text-center max-w-md w-full">
          <Folder className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h1 className="text-lg sm:text-xl font-semibold text-foreground mb-2">Collection Not Found</h1>
          <p className="text-sm sm:text-base text-muted-foreground mb-6">{error}</p>
          <Link to="/">
            <Button className="w-full sm:w-auto">
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
      
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-3 sm:mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Upload
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground break-words">{collection?.collection_name}</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">
            {collection?.description || 'A collection of shared files'}
          </p>
        </div>

        {/* Collection Stats */}
        <Card className="p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-primary flex items-center justify-center flex-shrink-0">
                <Folder className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-base sm:text-lg font-semibold text-foreground">Collection Details</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {collection?.files.length} files • {formatFileSize(collection?.collection_size || 0)}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-xs">
                {collection?.download_count} downloads
              </Badge>
              <Badge variant="outline" className="text-xs">
                Created {new Date(collection?.created_date || '').toLocaleDateString()}
              </Badge>
            </div>
          </div>

          {/* Download Progress */}
          {downloading && (
            <div className="mb-4">
              <div className="flex justify-between text-xs sm:text-sm text-muted-foreground mb-2">
                <span>Downloading files...</span>
                <span>{downloadProgress.toFixed(0)}%</span>
              </div>
              <Progress value={downloadProgress} className="h-2" />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button 
              onClick={handleDownloadAll} 
              disabled={downloading || !collection?.files.length}
              className="w-full sm:w-auto sm:flex-1"
            >
              <Archive className="w-4 h-4 mr-2" />
              {downloading ? 'Downloading...' : 'Download All'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={copyShareLink}
              className="w-full sm:w-auto sm:flex-1"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Copy Link
            </Button>
          </div>
        </Card>

        {/* Files List */}
        <div className="space-y-3">
          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Files in Collection</h3>
          {collection?.files.map((file) => (
            <Card key={file.id} className="p-3 sm:p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 sm:gap-4">
                <FilePreview file={file} />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground truncate text-sm sm:text-base">
                    {file.original_name}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground mt-1">
                    <span>{formatFileSize(file.file_size)}</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="truncate max-w-32 sm:max-w-none">{file.file_type}</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="whitespace-nowrap">{file.download_count} downloads</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadFile(file)}
                  className="flex-shrink-0 text-xs sm:text-sm px-2 sm:px-3"
                >
                  <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Download</span>
                  <span className="sm:hidden">Get</span>
                </Button>
              </div>
            </Card>
          ))}

          {!collection?.files.length && (
            <Card className="p-6 sm:p-8 text-center">
              <File className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-sm sm:text-base text-muted-foreground">No files in this collection</p>
            </Card>
          )}
        </div>

        {/* Info Card */}
        <Card className="mt-6 sm:mt-8 p-4 sm:p-6">
          <h3 className="font-semibold text-foreground mb-3 text-sm sm:text-base">About This Collection</h3>
          <div className="text-xs sm:text-sm text-muted-foreground space-y-2">
            <p>• Download individual files or the entire collection</p>
            <p>• Files are securely stored and scanned for safety</p>
            <p>• Share this link with anyone you trust</p>
            <p>• Download counts are tracked for each file</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CollectionShare;
