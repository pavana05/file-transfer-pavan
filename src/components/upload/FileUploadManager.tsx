import React, { useState, useCallback, useEffect } from 'react';
import { Search, Filter, Grid, List, FolderPlus, Trash2, Download, Upload, Share, Package, Folder, FileX, Edit2, Plus, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { FileUploadZone } from './FileUploadZone';
import { FileList } from './FileList';
import { UploadStats } from './UploadStats';
import { UploadedFile, UploadConfig, UploadCallbacks } from '@/types/upload';
import { calculateUploadStats, generateFilePreview, detectDuplicateFiles } from '@/lib/file-utils';
import { useToast } from '@/hooks/use-toast';
import { UploadService } from '@/services/uploadService';
import NearbyShareDialog from '@/components/nearbyShare/NearbyShareDialog';

interface FileFolder {
  id: string;
  name: string;
  createdAt: Date;
  fileCount: number;
  files: string[]; // Array of file IDs
}

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
  const [folders, setFolders] = useState<FileFolder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [showUploadGlow, setShowUploadGlow] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
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
      const fileManagementElement = document.querySelector('[data-file-management]');
      if (fileManagementElement) {
        fileManagementElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

  // Folder management functions
  const handleCreateFolder = useCallback(() => {
    if (!newFolderName.trim()) return;
    
    const newFolder: FileFolder = {
      id: `folder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: newFolderName.trim(),
      createdAt: new Date(),
      fileCount: 0,
      files: []
    };
    
    setFolders(prev => [...prev, newFolder]);
    setNewFolderName('');
    setIsCreateFolderOpen(false);
    
    toast({
      title: "Folder created",
      description: `"${newFolder.name}" folder has been created.`,
    });
  }, [newFolderName, toast]);

  const handleDeleteFolder = useCallback((folderId: string) => {
    const folder = folders.find(f => f.id === folderId);
    if (!folder) return;
    
    // Move files back to main list (remove folder association)
    setFiles(prev => prev.map(file => {
      if (folder.files.includes(file.id)) {
        return { ...file, folderId: undefined };
      }
      return file;
    }));
    
    setFolders(prev => prev.filter(f => f.id !== folderId));
    
    toast({
      title: "Folder deleted",
      description: `"${folder.name}" folder has been deleted. Files moved to main list.`,
    });
  }, [folders, toast]);

  const handleMoveFilesToFolder = useCallback((fileIds: string[], folderId: string | null) => {
    setFiles(prev => prev.map(file => {
      if (fileIds.includes(file.id)) {
        return { ...file, folderId };
      }
      return file;
    }));
    
    // Update folder file counts
    setFolders(prev => prev.map(folder => {
      const folderFiles = files.filter(f => 
        fileIds.includes(f.id) ? folderId === folder.id : f.folderId === folder.id
      );
      return {
        ...folder,
        fileCount: folderFiles.length,
        files: folderFiles.map(f => f.id)
      };
    }));
    
    setSelectedFiles([]);
    
    const targetFolder = folders.find(f => f.id === folderId);
    toast({
      title: "Files moved",
      description: `${fileIds.length} file(s) moved to ${targetFolder ? `"${targetFolder.name}"` : 'main list'}.`,
    });
  }, [files, folders, toast]);

  // Get files for current view (folder or all)
  const getCurrentFiles = useCallback(() => {
    if (selectedFolder) {
      return filteredFiles.filter(file => file.folderId === selectedFolder);
    }
    return filteredFiles.filter(file => !file.folderId);
  }, [filteredFiles, selectedFolder]);

  const currentFiles = getCurrentFiles();

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
        <Card className="p-3 sm:p-6" data-file-management>
          {/* Controls Bar */}
          <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 text-base"
              />
            </div>

            {/* Filter and View Mode */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="h-11 text-base">
                  <Filter className="w-4 h-4 mr-2 shrink-0" />
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
              <div className="flex gap-1 sm:w-auto">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="default"
                  onClick={() => setViewMode('list')}
                  className="flex-1 sm:flex-none h-11 px-4"
                >
                  <List className="w-4 h-4 mr-2 sm:mr-0" />
                  <span className="sm:hidden">List</span>
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="default"
                  onClick={() => setViewMode('grid')}
                  className="flex-1 sm:flex-none h-11 px-4"
                >
                  <Grid className="w-4 h-4 mr-2 sm:mr-0" />
                  <span className="sm:hidden">Grid</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Upload Buttons */}
          {!config.autoUpload && pendingCount > 0 && (
            <div className="p-3 sm:p-4 bg-upload-zone rounded-lg mb-4 sm:mb-6 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <span className="text-sm font-medium text-foreground">
                  {pendingCount} file(s) ready to upload
                </span>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button
                  onClick={handleUploadAll}
                  size="default"
                  variant="outline"
                  className={cn(
                    "h-11 flex-1 sm:flex-none transition-all duration-300 text-base",
                    showUploadGlow && "ring-2 ring-primary ring-offset-2 bg-primary/10 shadow-glow animate-pulse"
                  )}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Individual
                </Button>
                
                {pendingCount > 1 && (
                  <Button
                    onClick={handleUploadAsCollection}
                    size="default"
                    className="h-11 flex-1 sm:flex-none text-base"
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Upload as Collection
                  </Button>
                )}
                
                <NearbyShareDialog
                  trigger={
                    <Button size="default" variant="outline" className="h-11 flex-1 sm:flex-none gap-2 text-base">
                      <Smartphone className="w-4 h-4" />
                      Nearby Share
                    </Button>
                  }
                  files={files.filter(f => f.status === 'pending').map(f => f.file)}
                />
              </div>
            </div>
          )}

          {/* Bulk Actions */}
          {selectedFiles.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 sm:p-4 bg-muted rounded-lg mb-4 sm:mb-6">
              <span className="text-sm font-medium text-foreground">
                {selectedFiles.length} file(s) selected
              </span>
              <Button
                variant="outline"
                size="default"
                onClick={handleDeleteSelected}
                className="w-full sm:w-auto sm:ml-auto h-11 text-base"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Selected
              </Button>
            </div>
          )}

          {/* File List */}
          <Tabs value="files" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-11">
              <TabsTrigger value="files" className="text-sm sm:text-base">
                Files ({filteredFiles.length})
              </TabsTrigger>
              <TabsTrigger value="folders" className="text-sm sm:text-base">
                Folders
              </TabsTrigger>
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
              <div className="space-y-4">
                {/* Folder Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 pb-4 border-b">
                  <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
                    <DialogTrigger asChild>
                      <Button size="default" className="h-11 gap-2 text-base">
                        <Plus className="w-4 h-4" />
                        Create Folder
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Folder</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label htmlFor="folder-name">Folder Name</Label>
                          <Input
                            id="folder-name"
                            placeholder="Enter folder name..."
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleCreateFolder();
                              }
                            }}
                            className="h-11 text-base"
                          />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 pt-4">
                          <Button 
                            onClick={handleCreateFolder} 
                            disabled={!newFolderName.trim()}
                            className="h-11 text-base"
                          >
                            Create Folder
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => setIsCreateFolderOpen(false)}
                            className="h-11 text-base"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {selectedFiles.length > 0 && (
                    <Select onValueChange={(folderId) => handleMoveFilesToFolder(selectedFiles, folderId === 'main' ? null : folderId)}>
                      <SelectTrigger className="w-full sm:w-auto h-11 text-base">
                        <span className="text-sm sm:text-base">Move {selectedFiles.length} file(s) to...</span>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="main">📁 Main Files</SelectItem>
                        {folders.map(folder => (
                          <SelectItem key={folder.id} value={folder.id}>
                            📁 {folder.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Main Files (not in any folder) */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 sm:p-4 rounded-lg border border-dashed border-muted-foreground/30 hover:border-muted-foreground/50 transition-colors cursor-pointer touch-manipulation"
                       onClick={() => setSelectedFolder(null)}>
                    <Folder className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm sm:text-base truncate">📁 Main Files</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {files.filter(f => !f.folderId).length} files
                      </p>
                    </div>
                    {!selectedFolder && (
                      <div className="w-3 h-3 rounded-full bg-primary shrink-0"></div>
                    )}
                  </div>

                  {/* Custom Folders */}
                  {folders.map(folder => (
                    <div key={folder.id} className="flex items-center gap-3 p-3 sm:p-4 rounded-lg border border-dashed border-muted-foreground/30 hover:border-muted-foreground/50 transition-colors">
                      <div className="flex items-center gap-3 flex-1 cursor-pointer touch-manipulation min-w-0"
                           onClick={() => setSelectedFolder(folder.id)}>
                        <Folder className="w-6 h-6 sm:w-8 sm:h-8 text-primary shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm sm:text-base truncate">📁 {folder.name}</h3>
                          <p className="text-xs sm:text-sm text-muted-foreground truncate">
                            {files.filter(f => f.folderId === folder.id).length} files • Created {folder.createdAt.toLocaleDateString()}
                          </p>
                        </div>
                        {selectedFolder === folder.id && (
                          <div className="w-3 h-3 rounded-full bg-primary shrink-0"></div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="default"
                        onClick={() => handleDeleteFolder(folder.id)}
                        className="h-10 w-10 p-0 shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}

                  {folders.length === 0 && (
                    <div className="text-center py-6 sm:py-8 text-muted-foreground">
                      <FolderPlus className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 opacity-50" />
                      <p className="mb-2 text-sm sm:text-base">No folders created yet</p>
                      <p className="text-xs sm:text-sm">Create folders to organize your files</p>
                    </div>
                  )}
                </div>

                {/* Show files in selected folder */}
                {selectedFolder && (
                  <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4">
                      <Button
                        variant="ghost"
                        size="default"
                        onClick={() => setSelectedFolder(null)}
                        className="h-10 gap-2 justify-start sm:justify-center text-sm sm:text-base"
                      >
                        ← Back to all folders
                      </Button>
                      <span className="text-xs sm:text-sm text-muted-foreground px-2 sm:px-0">
                        Viewing: {folders.find(f => f.id === selectedFolder)?.name}
                      </span>
                    </div>
                    <FileList
                      files={currentFiles}
                      onRemoveFile={handleRemoveFile}
                      onPauseFile={handlePauseFile}
                      onResumeFile={handleResumeFile}
                      onRetryFile={handleRetryFile}
                      showProgress={true}
                    />
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      )}
    </div>
  );
};