import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Download, ArrowLeft, Share2, Folder, Archive, FileIcon, Clock, Eye, Shield, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Progress } from '@/components/ui/progress';
import { formatFileSize } from '@/lib/file-utils';
import { UploadService } from '@/services/uploadService';
import { FileCollection, DatabaseFile } from '@/types/upload';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

interface FileWithAvailability extends DatabaseFile {
  isAvailable?: boolean;
  checkingAvailability?: boolean;
}

const CollectionShareSkeleton = () => (
  <div className="min-h-screen bg-background">
    <div className="container mx-auto px-4 py-8 sm:py-12 max-w-3xl">
      <Skeleton className="h-4 w-28 mb-6" />
      <Skeleton className="h-10 w-64 mb-2" />
      <Skeleton className="h-5 w-48 mb-8" />
      <Card className="p-6 border-border/50">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
        <div className="flex gap-3">
          <Skeleton className="flex-1 h-12 rounded-xl" />
          <Skeleton className="flex-1 h-12 rounded-xl" />
        </div>
      </Card>
      <div className="mt-6 space-y-3">
        {[1,2,3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
      </div>
    </div>
  </div>
);

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
      const filesWithAvailability = await Promise.all(
        collectionData.files.map(async (file) => {
          try {
            const url = await UploadService.getFileUrl(file.storage_path);
            const response = await fetch(url, { method: 'HEAD' });
            return { ...file, isAvailable: response.ok, checkingAvailability: false };
          } catch {
            return { ...file, isAvailable: false, checkingAvailability: false };
          }
        })
      );
      setCollection({ ...collectionData, files: filesWithAvailability });
    } catch (err) {
      setError('Collection not found or link has expired');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadFile = async (file: FileWithAvailability) => {
    if (file.isAvailable === false) {
      toast({ title: "File unavailable", description: "This file is no longer available for download.", variant: "destructive" });
      return;
    }
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
      toast({ title: "Download completed", description: `${file.original_name} has been downloaded.` });
    } catch (err) {
      toast({ title: "Download failed", description: "Unable to download the file. Please try again.", variant: "destructive" });
    }
  };

  const handleDownloadAll = async () => {
    if (!collection) return;
    setDownloading(true);
    setDownloadProgress(0);
    try {
      await UploadService.incrementCollectionDownloadCount(collection.share_token);
      const availableFiles = collection.files.filter((f: FileWithAvailability) => f.isAvailable !== false);
      if (availableFiles.length === 0) {
        toast({ title: "No files available", description: "None of the files in this collection are available for download.", variant: "destructive" });
        setDownloading(false);
        return;
      }
      for (let i = 0; i < availableFiles.length; i++) {
        await handleDownloadFile(availableFiles[i]);
        setDownloadProgress(((i + 1) / availableFiles.length) * 100);
      }
      setCollection(prev => prev ? { ...prev, download_count: prev.download_count + 1 } : null);
      toast({ title: "All files downloaded", description: `Successfully downloaded ${availableFiles.length} files.` });
    } catch (err) {
      toast({ title: "Download failed", description: "Unable to download all files. Please try again.", variant: "destructive" });
    } finally {
      setDownloading(false);
      setDownloadProgress(0);
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Link copied!", description: "Collection share link copied to clipboard." });
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType.startsWith('video/')) return '🎥';
    if (fileType.startsWith('audio/')) return '🎵';
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    if (fileType.includes('sheet') || fileType.includes('excel')) return '📊';
    if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('tar')) return '📦';
    return '📄';
  };

  const FilePreviewThumb: React.FC<{ file: FileWithAvailability }> = ({ file }) => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
      if (file.file_type.startsWith('image/') && file.isAvailable !== false) {
        UploadService.getFileUrl(file.storage_path)
          .then(url => setImageUrl(url))
          .catch(() => setImageError(true));
      }
    }, [file]);

    if (file.isAvailable === false) {
      return (
        <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-5 h-5 text-destructive/60" />
        </div>
      );
    }

    if (file.file_type.startsWith('image/') && imageUrl && !imageError) {
      return (
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0 border border-border/40">
          <img src={imageUrl} alt={file.original_name} className="w-full h-full object-cover" onError={() => setImageError(true)} />
        </div>
      );
    }

    return (
      <div className="w-12 h-12 rounded-lg bg-primary/5 flex items-center justify-center flex-shrink-0 border border-border/40">
        <span className="text-lg">{getFileIcon(file.file_type)}</span>
      </div>
    );
  };

  if (loading) return <CollectionShareSkeleton />;

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-8 sm:p-10 text-center max-w-md w-full border-border/50">
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-destructive/10 flex items-center justify-center">
              <Folder className="w-8 h-8 text-destructive" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Collection Not Found</h1>
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
      {/* Subtle background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/3 rounded-full blur-3xl" />
      </div>

      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      
      <div className="container relative mx-auto px-4 py-8 sm:py-12 max-w-3xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-5 group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Upload
          </Link>
          
          <div className="flex items-start gap-3">
            <div className="hidden sm:flex w-12 h-12 rounded-xl bg-primary/10 items-center justify-center flex-shrink-0">
              <Folder className="w-6 h-6 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground break-words leading-tight">
                {collection?.collection_name}
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                {collection?.description || 'A curated collection of shared files'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats & Actions Card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-5 sm:p-6 mb-6 border-border/50 bg-card/90 backdrop-blur-sm">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              <div className="text-center p-3 rounded-xl bg-primary/5 border border-primary/10">
                <div className="text-xl sm:text-2xl font-bold text-primary">{collection?.files.length}</div>
                <div className="text-xs text-muted-foreground mt-0.5">Files</div>
              </div>
              <div className="text-center p-3 rounded-xl bg-muted/50 border border-border/50">
                <div className="text-xl sm:text-2xl font-bold text-foreground">{formatFileSize(collection?.collection_size || 0)}</div>
                <div className="text-xs text-muted-foreground mt-0.5">Total Size</div>
              </div>
              <div className="text-center p-3 rounded-xl bg-muted/50 border border-border/50">
                <div className="text-xl sm:text-2xl font-bold text-foreground">{collection?.download_count}</div>
                <div className="text-xs text-muted-foreground mt-0.5">Downloads</div>
              </div>
              <div className="text-center p-3 rounded-xl bg-muted/50 border border-border/50">
                <div className="text-xs sm:text-sm font-semibold text-foreground">
                  {new Date(collection?.created_date || '').toLocaleDateString()}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">Created</div>
              </div>
            </div>

            {downloading && (
              <div className="mb-5 p-3 rounded-xl bg-primary/5 border border-primary/10">
                <div className="flex justify-between text-sm text-foreground mb-2">
                  <span className="font-medium">Downloading...</span>
                  <span className="font-semibold text-primary">{downloadProgress.toFixed(0)}%</span>
                </div>
                <Progress value={downloadProgress} className="h-1.5" />
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={handleDownloadAll} 
                disabled={downloading || !collection?.files.length}
                size="lg"
                className="flex-1 h-11 gap-2 shadow-sm"
              >
                <Archive className="w-4 h-4" />
                {downloading ? 'Downloading...' : 'Download All'}
              </Button>
              <Button 
                variant="outline" 
                onClick={copyShareLink}
                size="lg"
                className="flex-1 h-11 gap-2"
              >
                <Share2 className="w-4 h-4" />
                Copy Link
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Files List */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="flex items-center gap-2 mb-4">
            <FileIcon className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Files ({collection?.files.length})</h3>
          </div>

          <div className="space-y-2">
            {collection?.files.map((file: FileWithAvailability, index: number) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
              >
                <Card className={`p-3 sm:p-4 transition-all duration-200 bg-card/80 border-border/40 ${
                  file.isAvailable === false ? 'opacity-50' : 'hover:border-primary/20 hover:shadow-sm'
                }`}>
                  <div className="flex items-center gap-3">
                    <FilePreviewThumb file={file} />
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-medium truncate text-sm ${
                        file.isAvailable === false ? 'text-muted-foreground line-through' : 'text-foreground'
                      }`}>
                        {file.original_name}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        {file.isAvailable === false ? (
                          <Badge variant="destructive" className="text-[10px] h-5">Unavailable</Badge>
                        ) : (
                          <>
                            <span className="text-[11px] text-muted-foreground">{formatFileSize(file.file_size)}</span>
                            <span className="text-[11px] text-muted-foreground">•</span>
                            <span className="text-[11px] text-muted-foreground">{file.file_type.split('/')[1]?.toUpperCase() || file.file_type}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadFile(file)}
                      disabled={file.isAvailable === false}
                      className="flex-shrink-0 h-9 gap-1.5 text-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Download</span>
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}

            {!collection?.files.length && (
              <Card className="p-8 text-center border-dashed border-2">
                <FileIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No files in this collection</p>
              </Card>
            )}
          </div>
        </motion.div>

        {/* Security Info */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <Card className="mt-6 p-5 border-border/50">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Shield className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm mb-2">Secure Sharing</h3>
                <ul className="text-xs text-muted-foreground space-y-1.5">
                  <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-primary" />Files are securely stored and scanned</li>
                  <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-primary" />Download counts are tracked</li>
                  <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-primary" />Share this link with trusted people</li>
                </ul>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default CollectionShare;
