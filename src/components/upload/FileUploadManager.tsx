import React, { useState, useCallback, useEffect } from 'react';
import { Search, Filter, Grid, List, FolderPlus, Trash2, Download, Upload, Share, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { FileUploadZone } from './FileUploadZone';
import { FileList } from './FileList';
import { UploadStats } from './UploadStats';
import { UploadedFile, UploadConfig, UploadCallbacks } from '@/types/upload';
import { calculateUploadStats, generateFilePreview, detectDuplicateFiles } from '@/lib/file-utils';
import { useToast } from '@/hooks/use-toast';
import { UploadService } from '@/services/uploadService';

interface FileUploadManagerProps {
  config?: UploadConfig;
  callbacks?: UploadCallbacks;
  className?: string;
}

export const FileUploadManager: React.FC<FileUploadManagerProps> = ({
  config = {},
  callbacks = {},
  className
}) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [showUploadGlow, setShowUploadGlow] = useState(false);
  const { toast } = useToast();

  // Calculate upload statistics
  const stats = calculateUploadStats(files);

  // Filter files based on search and filter criteria
  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || 
      (filterType === 'images' && file.type.startsWith('image/')) ||
      (filterType === 'documents' && (file.type.includes('document') || file.type.includes('pdf'))) ||
      (filterType === 'videos' && file.type.startsWith('video/')) ||
      (filterType === 'completed' && file.status === 'completed') ||
      (filterType === 'pending' && file.status === 'pending') ||
      (filterType === 'error' && file.status === 'error');
    
    return matchesSearch && matchesFilter;
  });

  // Handle file addition with preview generation
  const handleFilesAdded = useCallback(async (newFiles: UploadedFile[]) => {
    // Generate previews for image files
    const filesWithPreviews = await Promise.all(
      newFiles.map(async (file) => {
        if (file.type.startsWith('image/')) {
          const preview = await generateFilePreview(file.file);
          return { ...file, preview };
        }
        return file;
      })
    );

    // Check for duplicates if enabled
    if (config.enableDuplicateDetection) {
      const allFiles = [...files, ...filesWithPreviews];
      const duplicateIds = detectDuplicateFiles(allFiles);
      
      if (duplicateIds.length > 0) {
        toast({
          title: "Duplicate files detected",
          description: `${duplicateIds.length} duplicate file(s) found. They will be marked for review.`,
          variant: "destructive"
        });
      }
    }

    setFiles(prev => [...prev, ...filesWithPreviews]);
    callbacks.onFileAdd?.(filesWithPreviews);

    // Auto-scroll to show uploaded files and show upload button glow
    setTimeout(() => {
      const fileListElement = document.querySelector('[data-file-list]');
      if (fileListElement) {
        fileListElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        // Fallback: scroll to bottom of page
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }
      
      // Show glow effect on upload button
      if (!config.autoUpload) {
        setShowUploadGlow(true);
        // Remove glow after 5 seconds
        setTimeout(() => setShowUploadGlow(false), 5000);
      }
    }, 100);

    // Auto-upload if enabled
    if (config.autoUpload) {
      filesWithPreviews.forEach(file => {
        realUpload(file.id);
      });
    }
  }, [files, config, callbacks, toast]);

  // Real file upload to Supabase
  const realUpload = useCallback(async (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (!file) return;

    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, status: 'uploading' as const } : f
    ));

    callbacks.onUploadStart?.(file);

    try {
      const result = await UploadService.uploadFile(file, (progress) => {
        setFiles(prev => prev.map(f => 
          f.id === fileId ? { ...f, progress } : f
        ));
        callbacks.onUploadProgress?.(file, progress);
      });

      if (result.success) {
        setFiles(prev => prev.map(f => 
          f.id === fileId ? { 
            ...f, 
            status: 'completed' as const, 
            progress: 100,
            uploadedAt: new Date(),
            url: result.shareUrl
          } : f
        ));

        const completedFile = { ...file, url: result.shareUrl };
        callbacks.onUploadComplete?.(completedFile);

        toast({
          title: "Upload successful!",
          description: "File uploaded and share link generated.",
        });
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      setFiles(prev => prev.map(f => 
        f.id === fileId ? { 
          ...f, 
          status: 'error' as const,
          error: error instanceof Error ? error.message : 'Upload failed'
        } : f
      ));

      callbacks.onUploadError?.(file, error instanceof Error ? error.message : 'Upload failed');

      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : 'Upload failed',
        variant: "destructive"
      });
    }
  }, [files, callbacks, toast]);

  // Handle file removal
  const handleRemoveFile = useCallback((fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    setSelectedFiles(prev => prev.filter(id => id !== fileId));
    callbacks.onFileRemove?.(fileId);
  }, [callbacks]);

  // Handle pause/resume
  const handlePauseFile = useCallback((fileId: string) => {
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, status: 'paused' as const } : f
    ));
  }, []);

  const handleResumeFile = useCallback((fileId: string) => {
    realUpload(fileId);
  }, [realUpload]);

  // Handle retry
  const handleRetryFile = useCallback((fileId: string) => {
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, status: 'pending' as const, error: undefined } : f
    ));
    realUpload(fileId);
  }, [realUpload]);

  // Bulk operations
  const handleSelectAll = useCallback(() => {
    setSelectedFiles(filteredFiles.map(f => f.id));
  }, [filteredFiles]);

  const handleDeleteSelected = useCallback(() => {
    selectedFiles.forEach(fileId => {
      handleRemoveFile(fileId);
    });
    setSelectedFiles([]);
  }, [selectedFiles, handleRemoveFile]);

  const handleUploadAll = useCallback(() => {
    const pendingFiles = files.filter(f => f.status === 'pending');
    pendingFiles.forEach(file => {
      realUpload(file.id);
    });
  }, [files, realUpload]);

  // Handle collection upload
  const handleUploadAsCollection = useCallback(async () => {
    const pendingFiles = files.filter(f => f.status === 'pending');
    if (pendingFiles.length === 0) return;

    // Mark all files as uploading
    setFiles(prev => prev.map(f => 
      pendingFiles.some(pf => pf.id === f.id) 
        ? { ...f, status: 'uploading' as const } 
        : f
    ));

    try {
      const collectionName = `Collection ${new Date().toLocaleDateString()}`;
      const result = await UploadService.uploadFileCollection(
        pendingFiles, 
        collectionName,
        `Collection of ${pendingFiles.length} files`,
        (fileIndex, progress) => {
          // Update progress for current file
          if (pendingFiles[fileIndex]) {
            setFiles(prev => prev.map(f => 
              f.id === pendingFiles[fileIndex].id ? { ...f, progress } : f
            ));
          }
        }
      );

      if (result.success) {
        // Mark all files as completed
        setFiles(prev => prev.map(f => 
          pendingFiles.some(pf => pf.id === f.id) 
            ? { 
                ...f, 
                status: 'completed' as const, 
                progress: 100,
                uploadedAt: new Date(),
                url: result.shareUrl
              } 
            : f
        ));

        toast({
          title: "Collection uploaded successfully!",
          description: `${pendingFiles.length} files uploaded as a collection.`,
        });

        // Copy share link to clipboard
        if (result.shareUrl) {
          navigator.clipboard.writeText(result.shareUrl);
          toast({
            title: "Collection link copied!",
            description: "Share link copied to clipboard.",
          });
        }
      } else {
        throw new Error(result.error || 'Collection upload failed');
      }
    } catch (error) {
      // Mark files as error
      setFiles(prev => prev.map(f => 
        pendingFiles.some(pf => pf.id === f.id) 
          ? { 
              ...f, 
              status: 'error' as const,
              error: error instanceof Error ? error.message : 'Collection upload failed'
            } 
          : f
      ));

      toast({
        title: "Collection upload failed",
        description: error instanceof Error ? error.message : 'Collection upload failed',
        variant: "destructive"
      });
    }
  }, [files, toast]);

  const pendingCount = files.filter(f => f.status === 'pending').length;

  return (
    <div className={cn("w-full max-w-6xl mx-auto space-y-6", className)}>
      {/* Upload Zone */}
      <FileUploadZone
        config={config}
        onFilesAdded={handleFilesAdded}
        className="mb-6"
      />

      {/* Upload Stats */}
      {files.length > 0 && (
        <UploadStats stats={stats} />
      )}

      {/* File Management */}
      {files.length > 0 && (
        <Card className="p-6">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter */}
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter files" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Files</SelectItem>
                <SelectItem value="images">Images</SelectItem>
                <SelectItem value="documents">Documents</SelectItem>
                <SelectItem value="videos">Videos</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="error">Failed</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode */}
            <div className="flex gap-1">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Upload Buttons */}
          {!config.autoUpload && pendingCount > 0 && (
            <div className="flex items-center gap-2 p-3 bg-upload-zone rounded-lg mb-4">
              <span className="text-sm text-muted-foreground">
                {pendingCount} file(s) ready to upload
              </span>
              <div className="flex gap-2 ml-auto">
                <Button
                  onClick={handleUploadAll}
                  size="sm"
                  variant="outline"
                  className={cn(
                    "transition-all duration-300",
                    showUploadGlow && "ring-2 ring-primary ring-offset-2 bg-primary/10 shadow-glow animate-pulse"
                  )}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Individual
                </Button>
                {pendingCount > 1 && (
                  <Button
                    onClick={handleUploadAsCollection}
                    size="sm"
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Upload as Collection
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Bulk Actions */}
          {selectedFiles.length > 0 && (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg mb-4">
              <span className="text-sm text-muted-foreground">
                {selectedFiles.length} file(s) selected
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeleteSelected}
                className="ml-auto"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Selected
              </Button>
            </div>
          )}

          {/* File List */}
          <Tabs value="files" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="files">Files ({filteredFiles.length})</TabsTrigger>
              <TabsTrigger value="folders">Folders</TabsTrigger>
            </TabsList>
            
            <TabsContent value="files" className="mt-6">
              <FileList
                files={filteredFiles}
                onRemoveFile={handleRemoveFile}
                onPauseFile={handlePauseFile}
                onResumeFile={handleResumeFile}
                onRetryFile={handleRetryFile}
                showProgress={true}
              />
            </TabsContent>
            
            <TabsContent value="folders" className="mt-6">
              <div className="text-center py-12 text-muted-foreground">
                <FolderPlus className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Folder management coming soon</p>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      )}
    </div>
  );
};