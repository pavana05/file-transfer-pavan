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

  const handleBrowseClick = useCallback(() => {
    fileInputRef.current?.click();
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
          "relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300",
          "bg-upload-zone hover:bg-upload-zone-hover",
          "border-border hover:border-primary/50",
          "shadow-card hover:shadow-hover",
          !disabled && "cursor-pointer",
          isDragActive && !isDragReject && "border-primary bg-upload-zone-active animate-pulse-glow",
          isDragReject && "border-destructive bg-destructive/5",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <input {...getInputProps()} ref={fileInputRef} />
        
        {/* Upload Icon */}
        <div className={cn(
          "w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center transition-all duration-300",
          "bg-gradient-upload",
          isDragActive && !isDragReject && "scale-110"
        )}>
          {isDragActive && !isDragReject ? (
            <FileCheck className="w-8 h-8 text-primary animate-scale-in" />
          ) : (
            <Upload className="w-8 h-8 text-primary" />
          )}
        </div>

        {/* Main Text */}
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {isDragActive && !isDragReject
            ? "Drop your files here"
            : "Upload your files"
          }
        </h3>

        {/* Description */}
        <p className="text-muted-foreground mb-4">
          {isDragActive && !isDragReject
            ? "Release to upload"
            : "Drag and drop files here, or click to browse"
          }
        </p>

        {/* Browse Button */}
        <Button
          type="button"
          variant="outline"
          onClick={handleBrowseClick}
          disabled={disabled}
          className="mb-4"
        >
          Browse Files
        </Button>

        {/* File Format Info */}
        <div className="text-sm text-muted-foreground space-y-1">
          <p>Supported formats: {getSupportedFormats()}</p>
          {config.maxFileSize && (
            <p>Maximum file size: {(config.maxFileSize / 1024 / 1024).toFixed(1)}MB</p>
          )}
          {config.maxFiles && config.maxFiles > 1 && (
            <p>Maximum files: {config.maxFiles}</p>
          )}
        </div>

        {/* Error State */}
        {isDragReject && (
          <div className="absolute inset-0 flex items-center justify-center bg-destructive/5 rounded-xl">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-destructive/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-destructive" />
              </div>
              <p className="text-destructive font-medium">Invalid file type</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};