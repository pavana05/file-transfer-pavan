import { UploadedFile } from '@/types/upload';

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const remainingMinutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${remainingMinutes}m`;
  }
};

export const getFileTypeColor = (type: string): string => {
  if (type.startsWith('image/')) {
    return 'bg-blue-50 text-blue-600';
  } else if (type.startsWith('video/')) {
    return 'bg-purple-50 text-purple-600';
  } else if (type.startsWith('audio/')) {
    return 'bg-green-50 text-green-600';
  } else if (type.includes('pdf')) {
    return 'bg-red-50 text-red-600';
  } else if (type.includes('document') || type.includes('word')) {
    return 'bg-blue-50 text-blue-600';
  } else if (type.includes('spreadsheet') || type.includes('excel')) {
    return 'bg-green-50 text-green-600';
  } else if (type.includes('presentation') || type.includes('powerpoint')) {
    return 'bg-orange-50 text-orange-600';
  } else if (type.includes('zip') || type.includes('rar') || type.includes('tar')) {
    return 'bg-yellow-50 text-yellow-600';
  }
  return 'bg-muted text-muted-foreground';
};

export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || '';
};

export const isImageFile = (type: string): boolean => {
  return type.startsWith('image/');
};

export const isVideoFile = (type: string): boolean => {
  return type.startsWith('video/');
};

export const isAudioFile = (type: string): boolean => {
  return type.startsWith('audio/');
};

export const generateFilePreview = async (file: File): Promise<string | null> => {
  if (!isImageFile(file.type)) {
    return null;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target?.result as string);
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
};

export const calculateUploadStats = (files: UploadedFile[]) => {
  const totalFiles = files.length;
  const completedFiles = files.filter(f => f.status === 'completed').length;
  const totalSize = files.reduce((sum, f) => sum + f.size, 0);
  const uploadedSize = files.reduce((sum, f) => {
    if (f.status === 'completed') return sum + f.size;
    if (f.status === 'uploading') return sum + (f.size * f.progress / 100);
    return sum;
  }, 0);
  
  const overallProgress = totalSize > 0 ? (uploadedSize / totalSize) * 100 : 0;
  const errors = files.filter(f => f.status === 'error').length;

  return {
    totalFiles,
    completedFiles,
    totalSize,
    uploadedSize,
    overallProgress,
    uploadSpeed: 0, // To be calculated with time tracking
    estimatedTimeRemaining: 0, // To be calculated
    errors
  };
};

export const detectDuplicateFiles = (files: UploadedFile[]): string[] => {
  const duplicates: string[] = [];
  const seen = new Map<string, UploadedFile>();

  files.forEach(file => {
    const key = `${file.name}-${file.size}`;
    if (seen.has(key)) {
      duplicates.push(file.id);
    } else {
      seen.set(key, file);
    }
  });

  return duplicates;
};

export const generateThumbnail = async (
  file: File, 
  maxWidth: number = 150, 
  maxHeight: number = 150
): Promise<string | null> => {
  if (!isImageFile(file.type)) {
    return null;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          resolve(null);
          return;
        }

        // Calculate new dimensions
        let { width, height } = img;
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL());
      };
      img.onerror = () => resolve(null);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
};