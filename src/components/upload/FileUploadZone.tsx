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
      <div {...getRootProps()} className={cn("relative border-2 border-dashed rounded-3xl p-12 sm:p-16 text-center transition-all duration-500 ease-out", "bg-gradient-to-br from-card/95 via-card/90 to-card/95 backdrop-blur-xl", "border-border/40 hover:border-primary/50 shadow-card hover:shadow-hover", "before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-mesh before:opacity-20", "after:absolute after:inset-0 after:rounded-3xl after:bg-gradient-to-br after:from-primary/5 after:via-transparent after:to-accent/5", "group overflow-hidden", !disabled && "cursor-pointer hover:scale-[1.01] active:scale-[0.99]", isDragActive && !isDragReject && "border-primary/70 bg-primary/5 scale-[1.02] shadow-glow", isDragReject && "border-destructive/60 bg-destructive/5", disabled && "opacity-50 cursor-not-allowed")}>
        <input {...getInputProps()} ref={fileInputRef} />
        
        {/* Floating Background Element */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary rounded-full blur-[120px] animate-pulse"></div>
        </div>
        
        {/* Upload Icon */}
        <div className={cn("relative w-20 h-20 mx-auto mb-8 rounded-2xl flex items-center justify-center transition-all duration-500", "bg-gradient-primary shadow-glow ring-4 ring-primary/10", "group-hover:ring-primary/25 group-hover:shadow-hover group-hover:-translate-y-2 group-hover:scale-105", isDragActive && !isDragReject && "scale-110 ring-primary/40 shadow-glow animate-pulse")}>
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/20 via-white/5 to-transparent"></div>
          {isDragActive && !isDragReject ? <FileCheck className="relative w-10 h-10 text-primary-foreground drop-shadow-lg animate-scale-in" /> : <Upload className="relative w-10 h-10 text-primary-foreground drop-shadow-lg transition-transform duration-300 group-hover:scale-110" />}
        </div>

        {/* Main Text */}
        <div className="relative z-10 space-y-4 mb-10">
          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent">
            {isDragActive && !isDragReject ? "Drop your files here" : "Upload your files"}
          </h3>

          {/* Description */}
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-lg mx-auto font-medium">
            {isDragActive && !isDragReject ? "Release to upload your files instantly" : "Drag and drop files here, including ZIP archives, or use the buttons below"}
          </p>
        </div>

        {/* Upload Buttons */}
        <div className="relative z-10 flex flex-col sm:flex-row gap-3 justify-center mb-6">
          <Button type="button" onClick={handleBrowseClick} disabled={disabled} className="relative px-8 py-6 text-base font-semibold rounded-xl shadow-md hover:shadow-hover transition-all duration-300 group">
            <span className="relative z-10">Browse Files</span>
          </Button>
          
          <div className="relative">
            <input type="file" ref={folderInputRef} onChange={handleFolderUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" {...{
            webkitdirectory: ""
          } as any} multiple disabled={disabled} />
            <Button type="button" variant="outline" onClick={handleFolderClick} disabled={disabled} className="relative px-8 py-6 text-base font-semibold rounded-xl border-2 hover:bg-muted transition-all duration-300 shadow-sm hover:shadow-md">
              <span className="relative z-10">Upload Folder</span>
            </Button>
          </div>
        </div>

        {/* File Format Info */}
        

        {/* Error State */}
        {isDragReject && <div className="absolute inset-0 flex items-center justify-center bg-destructive/10 backdrop-blur-xl rounded-3xl border-2 border-dashed border-destructive/60">
            <div className="text-center animate-scale-in p-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-destructive/15 flex items-center justify-center ring-4 ring-destructive/20">
                <FileText className="w-8 h-8 text-destructive" />
              </div>
              <p className="text-destructive font-bold text-xl mb-2">Invalid file type</p>
              <p className="text-destructive/80 text-sm font-medium">Please upload a supported file format including ZIP archives</p>
            </div>
          </div>}
      </div>
    </div>;
};