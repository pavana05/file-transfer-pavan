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
import { UploadHistory } from './UploadHistory';
import { UploadedFile, UploadConfig, UploadCallbacks } from '@/types/upload';
import { calculateUploadStats, generateFilePreview, detectDuplicateFiles } from '@/lib/file-utils';
import { useToast } from '@/hooks/use-toast';
import { useUploadHistory } from '@/hooks/useUploadHistory';
import { UploadService } from '@/services/uploadService';
import NearbyShareDialog from '@/components/nearbyShare/NearbyShareDialog';
import UploadSuccessDialog from './UploadSuccessDialog';
import PasswordProtectionDialog from './PasswordProtectionDialog';
import { SecurityUtils } from '@/lib/security-utils';
import { SecurityAlerts, useSecurityAlerts } from '@/components/SecurityAlerts';
import { useAuth } from '@/contexts/AuthContext';
import confetti from 'canvas-confetti';
import { haptics } from '@/lib/haptic-feedback';

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
  const { user } = useAuth();
  const { addAlert, alerts } = useSecurityAlerts();
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
  const [uploadSuccess, setUploadSuccess] = useState<{
    isOpen: boolean;
    shareUrl: string;
    sharePin?: string;
    fileName: string;
    hasPassword?: boolean;
  }>({
    isOpen: false,
    shareUrl: '',
    sharePin: '',
    fileName: '',
    hasPassword: false
  });
  const [passwordDialog, setPasswordDialog] = useState<{
    isOpen: boolean;
    fileId: string;
    fileName: string;
  }>({
    isOpen: false,
    fileId: '',
    fileName: ''
  });
  const { toast } = useToast();
  const { history, addToHistory, removeFromHistory, clearHistory } = useUploadHistory();

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

  // Handle file addition with preview generation and security validation
  const handleFilesAdded = useCallback(async (newFiles: UploadedFile[]) => {
    // Validate files with security checks
    const validatedFiles: UploadedFile[] = [];
    const rejectedFiles: { file: UploadedFile; errors: string[] }[] = [];

    for (const file of newFiles) {
      const validation = SecurityUtils.validateFile(file.file);
      
      if (!validation.isValid) {
        rejectedFiles.push({ file, errors: validation.errors });
        addAlert({
          type: 'file-security',
          severity: 'high',
          message: `File "${SecurityUtils.sanitizeForDisplay(file.name)}" rejected`,
          details: validation.errors.join(', ')
        });
      } else {
        validatedFiles.push(file);
      }
    }

    // Show rejection summary if any files were rejected
    if (rejectedFiles.length > 0) {
      toast({
        title: "Some files were rejected",
        description: `${rejectedFiles.length} file(s) failed security validation. Check the security alerts for details.`,
        variant: "destructive"
      });
    }

    if (validatedFiles.length === 0) {
      return; // No valid files to process
    }

    // Rate limiting check for authenticated users
    if (user && !SecurityUtils.checkClientRateLimit(`upload_${user.id}`, 10, 60000)) {
      addAlert({
        type: 'rate-limit',
        severity: 'medium',
        message: 'Upload rate limit exceeded',
        details: 'Please wait before uploading more files (max 10 files per minute)'
      });
      
      toast({
        title: "Rate limit exceeded",
        description: "Please wait before uploading more files.",
        variant: "destructive"
      });
      return;
    }

    // Generate previews for image files
    const filesWithPreviews = await Promise.all(
      validatedFiles.map(async (file) => {
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
        addAlert({
          type: 'validation',
          severity: 'low',
          message: 'Duplicate files detected',
          details: `${duplicateIds.length} duplicate file(s) found and marked for review`
        });
        
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

    // Auto-upload if enabled (without password for auto-uploads)
    if (config.autoUpload) {
      filesWithPreviews.forEach(file => {
        realUpload(file.id, undefined);
      });
    }
  }, [files, config, callbacks, toast]);

  // Real file upload to Supabase
  const realUpload = useCallback(async (fileId: string, password?: string) => {
    const file = files.find(f => f.id === fileId);
    if (!file) return;

    const startTime = Date.now();
    
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, status: 'uploading' as const, startTime } : f
    ));

    callbacks.onUploadStart?.(file);

    try {
      const result = await UploadService.uploadFile(
        file, 
        (progress, uploadSpeed, estimatedTime, uploadedBytes) => {
          setFiles(prev => prev.map(f => 
            f.id === fileId ? { 
              ...f, 
              progress,
              uploadSpeed,
              estimatedTimeRemaining: estimatedTime,
              uploadedBytes
            } : f
          ));
          callbacks.onUploadProgress?.(file, progress);
        }, 
        password
      );

      if (result.success) {
        setFiles(prev => prev.map(f => 
          f.id === fileId ? { 
            ...f, 
            status: 'completed' as const, 
            progress: 100,
            uploadedAt: new Date(),
            url: result.shareUrl,
            uploadSpeed: undefined,
            estimatedTimeRemaining: undefined,
            uploadedBytes: f.size
          } : f
        ));

        const completedFile = { ...file, url: result.shareUrl };
        callbacks.onUploadComplete?.(completedFile);

        // Trigger haptic success feedback
        haptics.success();

        // Trigger confetti celebration animation
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

        const randomInRange = (min: number, max: number) => {
          return Math.random() * (max - min) + min;
        };

        const interval = setInterval(() => {
          const timeLeft = animationEnd - Date.now();

          if (timeLeft <= 0) {
            return clearInterval(interval);
          }

          const particleCount = 50 * (timeLeft / duration);

          // Launch confetti from multiple angles
          confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
          });
          confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
          });
        }, 250);

        // Add to upload history for anonymous users
        addToHistory({
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          shareUrl: result.shareUrl || '',
          sharePin: result.sharePin,
          hasPassword: !!password,
        });

        // Show success dialog with PIN
        setUploadSuccess({
          isOpen: true,
          shareUrl: result.shareUrl || '',
          sharePin: result.sharePin || '',
          fileName: file.name,
          hasPassword: !!password
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

  // Handle password confirmation and start upload
  const handlePasswordConfirm = useCallback((fileId: string, password?: string) => {
    setPasswordDialog({ isOpen: false, fileId: '', fileName: '' });
    realUpload(fileId, password);
  }, [realUpload]);

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
    const file = files.find(f => f.id === fileId);
    if (!file) return;

    setPasswordDialog({
      isOpen: true,
      fileId,
      fileName: file.name
    });
  }, [files]);

  // Handle retry
  const handleRetryFile = useCallback((fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (!file) return;

    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, status: 'pending' as const, error: undefined } : f
    ));

    setPasswordDialog({
      isOpen: true,
      fileId,
      fileName: file.name
    });
  }, [files]);

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

        // Add collection to upload history
        const totalSize = pendingFiles.reduce((sum, f) => sum + f.size, 0);
        addToHistory({
          fileName: `${collectionName} (${pendingFiles.length} files)`,
          fileSize: totalSize,
          fileType: 'collection',
          shareUrl: result.shareUrl || '',
          sharePin: result.sharePin,
        });

        // Show success dialog with PIN prominently displayed
        setUploadSuccess({
          isOpen: true,
          shareUrl: result.shareUrl || '',
          sharePin: result.sharePin || '',
          fileName: `${collectionName} (${pendingFiles.length} files)`,
          hasPassword: false
        });

        // Copy share link to clipboard
        if (result.shareUrl) {
          navigator.clipboard.writeText(result.shareUrl);
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
      {/* Security Alerts */}
      {alerts.length > 0 && (
        <SecurityAlerts alerts={alerts} className="mb-4" />
      )}

      {/* Quick Actions - Always visible */}
      <div className="flex justify-end">
        <UploadHistory 
          history={history}
          onRemove={removeFromHistory}
          onClear={clearHistory}
        />
      </div>

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

      {/* File Management - Enhanced Professional Design */}
      {files.length > 0 && (
        <Card className="overflow-hidden relative bg-gradient-to-br from-card via-card/95 to-card/80 shadow-2xl shadow-primary/5 border-border/40 backdrop-blur-xl" data-file-management>
          {/* Decorative background elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-radial from-primary/10 via-transparent to-transparent blur-3xl pointer-events-none"></div>
          
          {/* Header with enhanced gradient background */}
          <div className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 border-b border-border/40 p-8">
            <div className="flex items-center gap-4">
              <div className="relative p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 shadow-lg shadow-primary/20">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-2xl blur-md"></div>
                <Folder className="relative w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground tracking-tight">File Management</h2>
                <p className="text-sm text-muted-foreground font-medium mt-1">Organize and manage your uploaded files with ease</p>
              </div>
            </div>
          </div>

          <div className="relative p-8 space-y-8">
            {/* Enhanced Controls Bar */}
            <div className="space-y-6">
              {/* Search with modern styling */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 via-accent/20 to-primary/30 rounded-2xl opacity-0 group-focus-within:opacity-100 blur-xl transition-all duration-500"></div>
                <div className="relative">
                  <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-all duration-200" />
                  <Input
                    placeholder="Search files by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-14 pr-6 h-14 bg-background/60 border-2 border-border/50 focus:border-primary/60 focus:ring-4 focus:ring-primary/10 text-base font-medium placeholder:text-muted-foreground/60 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200"
                  />
                </div>
              </div>

              {/* Filter and View Mode - Enhanced styling */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 min-w-0">
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="h-14 bg-background/60 border-2 border-border/50 hover:border-primary/40 focus:border-primary/60 focus:ring-4 focus:ring-primary/10 text-base font-semibold rounded-2xl shadow-sm hover:shadow-md transition-all duration-200">
                      <div className="flex items-center">
                        <Filter className="w-5 h-5 mr-3 text-primary" />
                        <SelectValue placeholder="Filter files" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-popover/98 backdrop-blur-xl border-2 border-border/50 rounded-2xl shadow-xl">
                      <SelectItem value="all" className="font-semibold text-base h-11">All Files</SelectItem>
                      <SelectItem value="images" className="text-base h-11">📷 Images</SelectItem>
                      <SelectItem value="documents" className="text-base h-11">📄 Documents</SelectItem>
                      <SelectItem value="videos" className="text-base h-11">🎬 Videos</SelectItem>
                      <SelectItem value="completed" className="text-success text-base h-11">✓ Completed</SelectItem>
                      <SelectItem value="pending" className="text-warning text-base h-11">⏳ Pending</SelectItem>
                      <SelectItem value="error" className="text-destructive text-base h-11">✗ Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Enhanced View Mode Buttons */}
                <div className="flex gap-2 p-1.5 bg-muted/60 rounded-2xl border-2 border-border/40 shadow-sm">
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="default"
                    onClick={() => setViewMode('list')}
                    className={cn(
                      "h-11 px-6 font-semibold rounded-xl transition-all duration-200",
                      viewMode === 'list' 
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                        : "hover:bg-background/80 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <List className="w-5 h-5 mr-2" />
                    <span className="hidden sm:inline">List</span>
                  </Button>
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="default"
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      "h-11 px-6 font-semibold rounded-xl transition-all duration-200",
                      viewMode === 'grid' 
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                        : "hover:bg-background/80 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Grid className="w-5 h-5 mr-2" />
                    <span className="hidden sm:inline">Grid</span>
                  </Button>
                </div>
              </div>

              {/* Select All Button */}
              {filteredFiles.length > 0 && (
                <div className="flex justify-start">
                  <Button
                    variant="outline"
                    size="default"
                    onClick={handleSelectAll}
                    className="h-12 px-8 font-semibold border-2 border-border/50 hover:border-primary/50 hover:bg-primary/10 hover:shadow-md transition-all duration-200 rounded-2xl"
                  >
                    Select All ({filteredFiles.length})
                  </Button>
                </div>
              )}
            </div>

            {/* Enhanced Upload Buttons Section */}
            {!config.autoUpload && pendingCount > 0 && (
              <div className="relative group">
                {/* Animated gradient background */}
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 via-accent/20 to-primary/30 rounded-3xl opacity-75 blur-2xl group-hover:opacity-100 transition-all duration-500"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 rounded-3xl"></div>
                
                <div className="relative p-8 bg-background/60 border-2 border-primary/30 rounded-3xl backdrop-blur-xl shadow-xl">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative p-3 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/20 border-2 border-primary/40 shadow-lg">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-2xl blur-md animate-pulse"></div>
                      <Upload className="relative w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <span className="text-xl font-bold text-foreground tracking-tight">
                        {pendingCount} file{pendingCount !== 1 ? 's' : ''} ready to upload
                      </span>
                      <p className="text-sm text-muted-foreground font-medium mt-1">Choose your preferred upload method</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      onClick={handleUploadAll}
                      size="default"
                      variant="outline"
                      className={cn(
                        "h-14 flex-1 font-semibold text-base border-2 border-primary/40 hover:border-primary/60 hover:bg-primary/10 hover:scale-105 active:scale-95 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300",
                        showUploadGlow && "ring-4 ring-primary/40 ring-offset-2 bg-primary/15 shadow-2xl animate-pulse border-primary/60"
                      )}
                    >
                      <Upload className="w-5 h-5 mr-2" />
                      Upload Individual Files
                    </Button>
                    
                    {pendingCount > 1 && (
                      <Button
                        onClick={handleUploadAsCollection}
                        size="default"
                        className="h-14 flex-1 font-semibold text-base bg-gradient-to-r from-primary via-primary/90 to-primary/80 hover:from-primary/90 hover:via-primary/80 hover:to-primary/70 hover:scale-105 active:scale-95 rounded-2xl shadow-xl hover:shadow-2xl shadow-primary/20 hover:shadow-primary/30 transition-all duration-300"
                      >
                        <Package className="w-5 h-5 mr-2" />
                        Upload as Collection
                      </Button>
                    )}
                    
                    <NearbyShareDialog
                      trigger={
                        <Button 
                          size="default" 
                          variant="outline" 
                          className="h-14 flex-1 sm:flex-none font-semibold text-base border-2 border-border/60 hover:border-primary/40 hover:bg-primary/10 hover:scale-105 active:scale-95 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          <Smartphone className="w-5 h-5 mr-2" />
                          Nearby Share
                        </Button>
                      }
                      files={files.filter(f => f.status === 'pending').map(f => f.file)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Bulk Actions */}
            {selectedFiles.length > 0 && (
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-accent/30 via-accent/20 to-accent/30 rounded-2xl blur-xl"></div>
                <div className="relative p-6 bg-gradient-to-r from-accent/20 via-accent/15 to-accent/20 border-2 border-accent/50 rounded-2xl backdrop-blur-sm shadow-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-primary animate-pulse shadow-lg shadow-primary/50"></div>
                      <span className="text-lg font-bold text-foreground">
                        {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="default"
                      onClick={handleDeleteSelected}
                      className="w-full sm:w-auto sm:ml-auto h-12 px-6 font-semibold text-base border-2 border-destructive/40 text-destructive hover:bg-destructive/10 hover:border-destructive/60 hover:scale-105 active:scale-95 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      <Trash2 className="w-5 h-5 mr-2" />
                      Delete Selected
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced File List Tabs */}
            <Tabs value="files" className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-14 p-1.5 bg-muted/60 border-2 border-border/40 rounded-2xl shadow-sm">
                <TabsTrigger 
                  value="files" 
                  className="h-11 font-semibold text-base data-[state=active]:bg-background data-[state=active]:shadow-lg data-[state=active]:shadow-primary/10 data-[state=active]:border-2 data-[state=active]:border-primary/30 rounded-xl transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-md shadow-primary/50"></div>
                    Files ({filteredFiles.length})
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="folders" 
                  className="h-11 font-semibold text-base data-[state=active]:bg-background data-[state=active]:shadow-lg data-[state=active]:shadow-primary/10 data-[state=active]:border-2 data-[state=active]:border-primary/30 rounded-xl transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <Folder className="w-5 h-5" />
                    Folders
                  </div>
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
          </div>
        </Card>
      )}
      
      {/* Password Protection Dialog */}
      <PasswordProtectionDialog
        isOpen={passwordDialog.isOpen}
        onClose={() => setPasswordDialog({ isOpen: false, fileId: '', fileName: '' })}
        onConfirm={(password) => handlePasswordConfirm(passwordDialog.fileId, password)}
        fileName={passwordDialog.fileName}
      />

      {/* Upload Success Dialog */}
      <UploadSuccessDialog
        isOpen={uploadSuccess.isOpen}
        onClose={() => setUploadSuccess(prev => ({ ...prev, isOpen: false }))}
        shareUrl={uploadSuccess.shareUrl}
        sharePin={uploadSuccess.sharePin}
        fileName={uploadSuccess.fileName}
        hasPassword={uploadSuccess.hasPassword}
      />
    </div>
  );
};
