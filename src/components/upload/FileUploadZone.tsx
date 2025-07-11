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

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  config = {},
  onFilesAdded,
  disabled = false,
  className
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): FileValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check file size
    if (config.maxFileSize && file.size > config.maxFileSize) {
      errors.push(`File size exceeds ${(config.maxFileSize / 1024 / 1024).toFixed(1)}MB limit`);
    }

    // Check file type
    if (config.acceptedTypes && !config.acceptedTypes.includes(file.type)) {
      errors.push(`File type ${file.type} is not supported`);
    }

    // Check file extension
    if (config.allowedExtensions) {
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (extension && !config.allowedExtensions.includes(extension)) {
        errors.push(`File extension .${extension} is not allowed`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }, [config]);

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
    multiple: config.maxFiles !== 1,
    maxFiles: config.maxFiles,
    accept: config.acceptedTypes ? 
      config.acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}) : 
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
    if (type.includes('zip') || type.includes('rar') || type.includes('tar')) return Archive;
    return FileText;
  };

  const getSupportedFormats = () => {
    if (config.acceptedTypes) {
      return config.acceptedTypes.map(type => type.split('/')[1]).join(', ').toUpperCase();
    }
    return 'All file types';
  };

  return (
    <div className={cn("w-full", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-500",
          "bg-gradient-upload backdrop-blur-sm",
          "border-border/60 hover:border-primary/70 dark:border-border/40 dark:hover:border-primary/80",
          "shadow-card hover:shadow-upload dark:shadow-glass dark:hover:shadow-glow",
          "before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-mesh before:opacity-50 dark:before:opacity-70",
          "after:absolute after:inset-0 after:rounded-2xl after:bg-gradient-to-br after:from-background/10 after:to-transparent dark:after:from-background/20",
          "group overflow-hidden",
          !disabled && "cursor-pointer hover:scale-[1.02]",
          isDragActive && !isDragReject && "border-primary/80 bg-primary/5 animate-pulse-glow scale-[1.02] dark:bg-primary/10 dark:border-primary",
          isDragReject && "border-destructive bg-destructive/5 dark:bg-destructive/10",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <input {...getInputProps()} ref={fileInputRef} />
        
        {/* Upload Icon */}
        <div className={cn(
          "relative w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center transition-all duration-500",
          "bg-gradient-primary shadow-glow dark:shadow-glow",
          "ring-2 ring-primary/20 dark:ring-primary/40",
          "group-hover:animate-float",
          isDragActive && !isDragReject && "scale-110 animate-pulse-glow"
        )}>
          <div className="absolute inset-0 rounded-2xl bg-gradient-primary opacity-20 animate-glow dark:opacity-30"></div>
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent dark:from-white/10"></div>
          {isDragActive && !isDragReject ? (
            <FileCheck className="relative w-10 h-10 text-white animate-scale-in drop-shadow-lg" />
          ) : (
            <Upload className="relative w-10 h-10 text-white drop-shadow-lg" />
          )}
        </div>

        {/* Main Text */}
        <div className="relative z-10 space-y-4">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            {isDragActive && !isDragReject
              ? "Drop your files here"
              : "Upload your files"
            }
          </h3>

          {/* Description */}
          <p className="text-muted-foreground text-lg leading-relaxed">
            {isDragActive && !isDragReject
              ? "Release to upload your files"
              : "Drag and drop files here, or click to browse"
            }
          </p>
        </div>

        {/* Upload Buttons */}
        <div className="relative z-10 mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={handleBrowseClick}
            disabled={disabled}
            className="relative px-8 py-3 rounded-full border-primary/30 bg-background/80 backdrop-blur hover:bg-primary/10 hover:border-primary hover:shadow-glow transition-all duration-300 group"
          >
            <span className="relative z-10 font-medium">Browse Files</span>
            <div className="absolute inset-0 rounded-full bg-gradient-primary opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
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
              className="relative px-8 py-3 rounded-full bg-background/80 backdrop-blur hover:bg-secondary/80 transition-all duration-300"
            >
              <span className="font-medium">Upload Folder</span>
            </Button>
          </div>
        </div>

        {/* File Format Info */}
        <div className="relative z-10 mt-6 p-4 rounded-xl bg-background/50 dark:bg-background/70 backdrop-blur border border-border/50 dark:border-border/30">
          <div className="text-sm text-muted-foreground space-y-2">
            
            {config.maxFileSize && (
              <p>Maximum file size: <span className="text-foreground font-medium">{(config.maxFileSize / 1024 / 1024).toFixed(1)}MB</span></p>
            )}
            {config.maxFiles && config.maxFiles > 1 && (
              <p>Maximum files: <span className="text-foreground font-medium">{config.maxFiles}</span></p>
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
              <p className="text-destructive/70 text-sm mt-1">Please upload a supported file format</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};