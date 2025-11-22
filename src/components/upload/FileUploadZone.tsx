import React, { useCallback, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Image, Video, Music, Archive, FileCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { UploadConfig, UploadedFile, FileValidationResult } from '@/types/upload';
import { toast } from '@/hooks/use-toast';
interface FileUploadZoneProps {
  config?: UploadConfig;
  onFilesAdded: (files: UploadedFile[]) => void;
  disabled?: boolean;
  className?: string;
}

// Default configuration that includes ZIP formats
const defaultConfig: UploadConfig = {
  maxFileSize: 100 * 1024 * 1024,
  // 100MB
  acceptedTypes: ['image/*', 'video/*', 'audio/*', 'text/*', 'application/pdf', 'application/zip', 'application/x-zip-compressed', 'application/x-rar-compressed', 'application/x-7z-compressed', 'application/x-tar', 'application/gzip'],
  allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mp3', 'wav', 'flac', 'aac', 'ogg', 'txt', 'doc', 'docx', 'pdf', 'rtf', 'zip', 'rar', '7z', 'tar', 'gz', 'bz2'],
  enablePreview: true,
  autoUpload: false
};
export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  config = {},
  onFilesAdded,
  disabled = false,
  className
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  // Merge with default config
  const mergedConfig = {
    ...defaultConfig,
    ...config
  };
  const validateFile = useCallback((file: File): FileValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check file size
    if (mergedConfig.maxFileSize && file.size > mergedConfig.maxFileSize) {
      errors.push(`File size exceeds ${(mergedConfig.maxFileSize / 1024 / 1024).toFixed(1)}MB limit`);
    }

    // Check file type
    if (mergedConfig.acceptedTypes && mergedConfig.acceptedTypes.length > 0) {
      const isTypeAccepted = mergedConfig.acceptedTypes.some(acceptedType => {
        if (acceptedType.endsWith('/*')) {
          return file.type.startsWith(acceptedType.slice(0, -1));
        }
        return file.type === acceptedType;
      });
      if (!isTypeAccepted) {
        errors.push(`File type ${file.type} is not supported`);
      }
    }

    // Check file extension
    if (mergedConfig.allowedExtensions && mergedConfig.allowedExtensions.length > 0) {
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (extension && !mergedConfig.allowedExtensions.includes(extension)) {
        errors.push(`File extension .${extension} is not allowed`);
      }
    }
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }, [mergedConfig]);
  const createUploadedFile = useCallback((file: File): UploadedFile => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return {
      id,
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'pending',
      progress: 0,
      metadata: {
        createdAt: new Date(file.lastModified),
        modifiedAt: new Date(file.lastModified)
      }
    };
  }, []);
  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    const validFiles: UploadedFile[] = [];
    const invalidFiles: { name: string; errors: string[] }[] = [];

    acceptedFiles.forEach(file => {
      const validation = validateFile(file);
      if (validation.isValid) {
        validFiles.push(createUploadedFile(file));
      } else {
        invalidFiles.push({ name: file.name, errors: validation.errors });
      }
    });

    // Handle rejected files from dropzone
    rejectedFiles.forEach(({ file, errors }) => {
      const errorMessages = errors.map((e: any) => {
        if (e.code === 'file-too-large') {
          return `File size exceeds ${(mergedConfig.maxFileSize! / 1024 / 1024).toFixed(1)}MB limit`;
        }
        if (e.code === 'file-invalid-type') {
          return 'File type is not supported';
        }
        return e.message;
      });
      invalidFiles.push({ name: file.name, errors: errorMessages });
    });

    // Show error toasts for invalid files
    if (invalidFiles.length > 0) {
      invalidFiles.forEach(({ name, errors }) => {
        toast({
          variant: "destructive",
          title: "Upload Failed",
          description: `${name}: ${errors.join(', ')}`,
        });
      });
    }

    // Show success toast and add valid files
    if (validFiles.length > 0) {
      onFilesAdded(validFiles);
      toast({
        title: "Files Added",
        description: `${validFiles.length} file(s) added successfully`,
      });
    }
  }, [validateFile, createUploadedFile, onFilesAdded, mergedConfig.maxFileSize]);
  const {
    getRootProps,
    getInputProps,
    isDragReject
  } = useDropzone({
    onDrop,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    disabled,
    multiple: mergedConfig.maxFiles !== 1,
    maxFiles: mergedConfig.maxFiles,
    accept: mergedConfig.acceptedTypes ? mergedConfig.acceptedTypes.reduce((acc, type) => ({
      ...acc,
      [type]: []
    }), {}) : undefined
  });
  const handleFolderUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files);
      const validFiles: UploadedFile[] = [];
      fileArray.forEach(file => {
        const validation = validateFile(file);
        if (validation.isValid) {
          validFiles.push(createUploadedFile(file));
        }
      });
      if (validFiles.length > 0) {
        onFilesAdded(validFiles);
      }
    }
  }, [validateFile, createUploadedFile, onFilesAdded]);
  const handleBrowseClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);
  const handleFolderClick = useCallback(() => {
    folderInputRef.current?.click();
  }, []);
  const getFileTypeIcon = (type: string) => {
    if (type.startsWith('image/')) return Image;
    if (type.startsWith('video/')) return Video;
    if (type.startsWith('audio/')) return Music;
    if (type.includes('zip') || type.includes('rar') || type.includes('tar') || type.includes('7z') || type.includes('gzip')) return Archive;
    return FileText;
  };
  const getSupportedFormats = () => {
    if (mergedConfig.acceptedTypes && mergedConfig.acceptedTypes.length > 0) {
      const formats = mergedConfig.acceptedTypes.map(type => {
        if (type.includes('/')) {
          return type.split('/')[1];
        }
        return type;
      }).filter(format => format !== '*').join(', ').toUpperCase();
      return formats || 'All file types';
    }
    return 'All file types including ZIP archives';
  };
  return <div className={cn("w-full", className)}>
      <div {...getRootProps()} className={cn("relative border-2 border-dashed rounded-3xl p-12 sm:p-20 text-center transition-all duration-700 ease-out", "bg-gradient-to-br from-card/98 via-card/95 to-card/98 backdrop-blur-2xl", "border-border/30 hover:border-primary/60 shadow-premium hover:shadow-glow", "group overflow-hidden", !disabled && "cursor-pointer hover:scale-[1.02] active:scale-[0.98]", isDragActive && !isDragReject && "border-primary/80 bg-gradient-to-br from-primary/10 via-primary/5 to-primary/10 scale-[1.03] shadow-glow ring-4 ring-primary/20", isDragReject && "border-destructive/60 bg-destructive/5", disabled && "opacity-50 cursor-not-allowed")}>
        <input {...getInputProps()} ref={fileInputRef} />
        
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary-glow/5 to-primary/5 animate-gradient-x"></div>
        </div>

        {/* Shimmer Effect on Hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-shimmer"></div>
        </div>

        {/* Floating Orbs */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
        <div className="absolute bottom-10 left-10 w-40 h-40 bg-primary-glow/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000 delay-100"></div>
        
        {/* Upload Icon with Premium Effects */}
        <div className={cn("relative w-24 h-24 mx-auto mb-10 rounded-3xl flex items-center justify-center transition-all duration-700", "bg-gradient-primary shadow-glow ring-8 ring-primary/15", "group-hover:ring-primary/30 group-hover:shadow-premium group-hover:-translate-y-4 group-hover:scale-110 group-hover:rotate-3", isDragActive && !isDragReject && "scale-125 ring-primary/50 shadow-glow animate-bounce-slow")}>
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-white/30 via-white/10 to-transparent opacity-80"></div>
          <div className="absolute inset-0 rounded-3xl bg-gradient-shimmer opacity-0 group-hover:opacity-100 animate-shimmer"></div>
          {isDragActive && !isDragReject ? <FileCheck className="relative w-12 h-12 text-primary-foreground drop-shadow-2xl animate-scale-in" /> : <Upload className="relative w-12 h-12 text-primary-foreground drop-shadow-2xl transition-transform duration-500 group-hover:scale-125 group-hover:-rotate-6" />}
        </div>

        {/* Main Text with Gradient Animation */}
        <div className="relative z-10 space-y-5 mb-12">
          <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            <span className={cn("bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent transition-all duration-500", "bg-[length:200%_auto] group-hover:bg-[length:100%_auto] animate-gradient-x")}>
              {isDragActive && !isDragReject ? "Drop your files here" : "Upload your files"}
            </span>
          </h3>

          {/* Description */}
          <p className="text-muted-foreground text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto font-medium">
            {isDragActive && !isDragReject ? "Release to upload your files instantly" : "Drag and drop files here, or use the buttons below"}
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap gap-3 justify-center items-center pt-2">
            <span className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm font-semibold text-primary backdrop-blur-sm">
              Up to 100MB
            </span>
            <span className="px-4 py-2 bg-success/10 border border-success/20 rounded-full text-sm font-semibold text-success backdrop-blur-sm">
              All Formats
            </span>
            <span className="px-4 py-2 bg-accent/50 border border-accent-foreground/20 rounded-full text-sm font-semibold text-accent-foreground backdrop-blur-sm">
              Secure Upload
            </span>
          </div>
        </div>

        {/* Upload Buttons with Enhanced Design */}
        <div className="relative z-10 flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Button type="button" onClick={handleBrowseClick} disabled={disabled} size="lg" className="relative px-10 py-7 text-lg font-bold rounded-2xl shadow-glow hover:shadow-premium transition-all duration-500 group/btn overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-glow via-primary to-primary-dark opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></div>
            <span className="relative z-10 flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Browse Files
            </span>
          </Button>
          
          <div className="relative">
            <input type="file" ref={folderInputRef} onChange={handleFolderUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" {...{
            webkitdirectory: ""
          } as any} multiple disabled={disabled} />
            <Button type="button" variant="outline" onClick={handleFolderClick} disabled={disabled} size="lg" className="relative px-10 py-7 text-lg font-bold rounded-2xl border-2 border-border/50 hover:border-primary/50 bg-card/50 hover:bg-card transition-all duration-500 shadow-card hover:shadow-hover backdrop-blur-sm">
              <span className="relative z-10 flex items-center gap-2">
                <Archive className="w-5 h-5" />
                Upload Folder
              </span>
            </Button>
          </div>
        </div>

        {/* Premium Trust Badges */}
        <div className="relative z-10 flex flex-wrap gap-4 justify-center items-center text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success animate-glow"></div>
            <span className="font-medium">End-to-end Encrypted</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-glow"></div>
            <span className="font-medium">Lightning Fast</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-warning animate-glow"></div>
            <span className="font-medium">Auto-delete After Download</span>
          </div>
        </div>

        {/* Error State */}
        {isDragReject && <div className="absolute inset-0 flex items-center justify-center bg-destructive/10 backdrop-blur-2xl rounded-3xl border-2 border-dashed border-destructive/60">
            <div className="text-center animate-scale-in p-8">
              <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-destructive/20 flex items-center justify-center ring-8 ring-destructive/30 shadow-hover">
                <FileText className="w-10 h-10 text-destructive" />
              </div>
              <p className="text-destructive font-bold text-2xl mb-3">Invalid file type</p>
              <p className="text-destructive/80 text-base font-medium">Please upload a supported file format</p>
            </div>
          </div>}
      </div>
    </div>;
};