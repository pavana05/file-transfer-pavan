export interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  status: 'pending' | 'uploading' | 'completed' | 'error' | 'paused';
  progress: number;
  url?: string;
  preview?: string;
  uploadedAt?: Date;
  error?: string;
  metadata?: {
    dimensions?: { width: number; height: number };
    duration?: number;
    createdAt?: Date;
    modifiedAt?: Date;
  };
}

export interface UploadConfig {
  maxFileSize?: number; // in bytes
  maxFiles?: number;
  acceptedTypes?: string[];
  allowedExtensions?: string[];
  enableChunkedUpload?: boolean;
  chunkSize?: number;
  enableResume?: boolean;
  enableCompression?: boolean;
  enablePreview?: boolean;
  autoUpload?: boolean;
  enableDuplicateDetection?: boolean;
}

export interface UploadStats {
  totalFiles: number;
  completedFiles: number;
  totalSize: number;
  uploadedSize: number;
  overallProgress: number;
  uploadSpeed: number; // bytes per second
  estimatedTimeRemaining: number; // seconds
  errors: number;
}

export interface UploadQueue {
  files: UploadedFile[];
  activeUploads: number;
  maxConcurrentUploads: number;
  isPaused: boolean;
}

export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface UploadCallbacks {
  onFileAdd?: (files: UploadedFile[]) => void;
  onFileRemove?: (fileId: string) => void;
  onUploadStart?: (file: UploadedFile) => void;
  onUploadProgress?: (file: UploadedFile, progress: number) => void;
  onUploadComplete?: (file: UploadedFile) => void;
  onUploadError?: (file: UploadedFile, error: string) => void;
  onAllUploadsComplete?: (files: UploadedFile[]) => void;
  onQueueChange?: (queue: UploadQueue) => void;
}

export interface FolderStructure {
  id: string;
  name: string;
  path: string;
  children: FolderStructure[];
  files: UploadedFile[];
  createdAt: Date;
  modifiedAt: Date;
}

export interface FileCollection {
  id: string;
  collection_name: string;
  share_token: string;
  created_date: string;
  download_count: number;
  description?: string;
  collection_size: number;
  files: DatabaseFile[];
}

export interface DatabaseFile {
  id: string;
  filename: string;
  original_name: string;
  file_size: number;
  file_type: string;
  storage_path: string;
  share_token: string;
  upload_date: string;
  download_count: number;
  collection_id?: string;
}

export interface CollectionInfo {
  id: string;
  collection_name: string;
  share_token: string;
  created_date: string;
  download_count: number;
  description?: string;
  collection_size: number;
  file_count: number;
}