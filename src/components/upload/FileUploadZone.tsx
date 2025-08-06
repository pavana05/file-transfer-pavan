import React, { useCallback, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Image, Video, Music, Archive, FileCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { UploadConfig, UploadedFile, FileValidationResult } from '@/types/upload';

interface FileUploadZoneProps {
  config?: UploadConfig;
  onFilesAdded: (files: UploadedFile[]) => void;
  disabled?: boolean;
  className?: string;
}

// Default configuration that includes ZIP formats
const defaultConfig: UploadConfig = {
  maxFileSize: 100 * 1024 * 1024, // 100MB
  acceptedTypes: [
    'image/*',
    'video/*',
    'audio/*',
    'text/*',
    'application/pdf',
    'application/zip',
    'application/x-zip-compressed',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
    'application/x-tar',
    'application/gzip'
  ],
  allowedExtensions: [
    'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg',
    'mp4', 'avi', 'mov', 'wmv', 'flv', 'webm',
    'mp3', 'wav', 'flac', 'aac', 'ogg',
    'txt', 'doc', 'docx', 'pdf', 'rtf',
    'zip', 'rar', '7z', 'tar', 'gz', 'bz2'
  ],
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
  const mergedConfig = { ...defaultConfig, ...config };

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

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles: UploadedFile[] = [];
    
    acceptedFiles.forEach(file => {
      const validation = validateFile(file);
      if (validation.isValid) {
        validFiles.push(createUploadedFile(file));
      }
    });

    if (validFiles.length > 0) {
      onFilesAdded(validFiles);
    }
  }, [validateFile, createUploadedFile, onFilesAdded]);

  const { getRootProps, getInputProps, isDragReject } = useDropzone({
    onDrop,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    disabled,
    multiple: mergedConfig.maxFiles !== 1,
    maxFiles: mergedConfig.maxFiles,
    accept: mergedConfig.acceptedTypes ? 
      mergedConfig.acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}) : 
      undefined
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
      const formats = mergedConfig.acceptedTypes
        .map(type => {
          if (type.includes('/')) {
            return type.split('/')[1];
          }
          return type;
        })
        .filter(format => format !== '*')
        .join(', ')
        .toUpperCase();
      return formats || 'All file types';
    }
    return 'All file types including ZIP archives';
  };

  return (
    <div className={cn("w-full", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "relative border-2 border-dashed rounded-3xl p-16 text-center transition-all duration-700 ease-out",
          "bg-gradient-to-br from-background/60 via-background/40 to-background/60 backdrop-blur-md",
          "border-border/30 hover:border-primary/60 dark:border-border/20 dark:hover:border-primary/70",
          "shadow-xl hover:shadow-2xl dark:shadow-2xl dark:hover:shadow-glow",
          "before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-mesh before:opacity-30 dark:before:opacity-50",
          "after:absolute after:inset-0 after:rounded-3xl after:bg-gradient-to-br after:from-white/5 after:via-transparent after:to-primary/5 dark:after:from-white/10 dark:after:to-primary/10",
          "group overflow-hidden",
          !disabled && "cursor-pointer hover:scale-[1.01] active:scale-[0.99]",
          isDragActive && !isDragReject && "border-primary/80 bg-primary/5 scale-[1.02] animate-pulse-glow dark:bg-primary/10 dark:border-primary",
          isDragReject && "border-destructive bg-destructive/5 dark:bg-destructive/10",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <input {...getInputProps()} ref={fileInputRef} />
        
        {/* Floating Background Elements */}
        <div className="absolute inset-0 opacity-10 dark:opacity-20">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-secondary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        {/* Upload Icon */}
        <div className={cn(
          "relative w-24 h-24 mx-auto mb-8 rounded-3xl flex items-center justify-center transition-all duration-700",
          "bg-gradient-to-br from-primary via-primary-glow to-primary shadow-2xl dark:shadow-glow",
          "ring-4 ring-primary/20 dark:ring-primary/30",
          "group-hover:ring-primary/40 group-hover:shadow-glow group-hover:-translate-y-1",
          isDragActive && !isDragReject && "scale-110 animate-bounce ring-primary/60"
        )}>
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary via-primary-glow to-primary opacity-80 animate-pulse"></div>
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/30 to-transparent dark:from-white/20"></div>
          <div className="absolute -inset-1 rounded-3xl bg-gradient-conic from-primary/50 via-primary-glow/50 to-primary/50 blur-sm opacity-70 group-hover:opacity-100 transition-opacity"></div>
          {isDragActive && !isDragReject ? (
            <FileCheck className="relative w-12 h-12 text-white animate-scale-in drop-shadow-xl" />
          ) : (
            <Upload className="relative w-12 h-12 text-white drop-shadow-xl group-hover:animate-bounce" />
          )}
        </div>

        {/* Main Text */}
        <div className="relative z-10 space-y-6 mb-8">
          <h3 className="text-3xl font-bold bg-gradient-to-r from-primary via-primary-glow to-secondary bg-clip-text text-transparent animate-fade-in">
            {isDragActive && !isDragReject
              ? "Drop your files here"
              : "Upload your files"
            }
          </h3>

          {/* Description */}
          <p className="text-muted-foreground text-lg leading-relaxed max-w-md mx-auto">
            {isDragActive && !isDragReject
              ? "Release to upload your files instantly"
              : "Drag and drop files here, including ZIP archives, or use the buttons below"
            }
          </p>
        </div>

        {/* Upload Buttons */}
        <div className="relative z-10 flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Button
            type="button"
            variant="outline"
            onClick={handleBrowseClick}
            disabled={disabled}
            className="relative px-10 py-4 text-lg rounded-2xl border-2 border-primary/40 bg-background/90 backdrop-blur-sm hover:bg-primary/10 hover:border-primary hover:shadow-xl hover:scale-105 transition-all duration-300 group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <span className="relative z-10 font-semibold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">Browse Files</span>
          </Button>
          
          <div className="relative">
            <input
              type="file"
              ref={folderInputRef}
              onChange={handleFolderUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              {...({ webkitdirectory: "" } as any)}
              multiple
              disabled={disabled}
            />
            <Button
              type="button"
              variant="secondary"
              onClick={handleFolderClick}
              disabled={disabled}
              className="relative px-10 py-4 text-lg rounded-2xl bg-secondary/80 backdrop-blur-sm hover:bg-secondary hover:shadow-xl hover:scale-105 transition-all duration-300 group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-secondary/0 via-secondary-foreground/10 to-secondary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <span className="relative z-10 font-semibold">Upload Folder</span>
            </Button>
          </div>
        </div>

        {/* File Format Info */}
        <div className="relative z-10 p-6 rounded-2xl bg-background/60 dark:bg-background/80 backdrop-blur-sm border border-border/30 dark:border-border/20 shadow-lg">
          <div className="text-sm text-muted-foreground space-y-3">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Archive className="w-4 h-4 text-primary" />
              <span className="font-medium text-foreground">Supports ZIP, RAR, 7Z archives</span>
            </div>
            {mergedConfig.maxFileSize && (
              <div className="flex items-center justify-center gap-2">
                <span>Max size:</span> 
                <span className="text-foreground font-semibold bg-muted/50 px-3 py-1 rounded-full">
                  {(mergedConfig.maxFileSize / 1024 / 1024).toFixed(1)}MB
                </span>
              </div>
            )}
            {mergedConfig.maxFiles && mergedConfig.maxFiles > 1 && (
              <div className="flex items-center justify-center gap-2">
                <span>Max files:</span> 
                <span className="text-foreground font-semibold bg-muted/50 px-3 py-1 rounded-full">
                  {mergedConfig.maxFiles}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Error State */}
        {isDragReject && (
          <div className="absolute inset-0 flex items-center justify-center bg-destructive/10 backdrop-blur-sm rounded-2xl border-2 border-dashed border-destructive">
            <div className="text-center animate-scale-in">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/20 flex items-center justify-center">
                <FileText className="w-8 h-8 text-destructive" />
              </div>
              <p className="text-destructive font-semibold text-lg">Invalid file type</p>
              <p className="text-destructive/70 text-sm mt-1">Please upload a supported file format including ZIP archives</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
