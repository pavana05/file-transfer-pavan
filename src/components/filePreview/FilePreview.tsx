import React, { useState, useEffect } from 'react';
import { 
  File, 
  FileText, 
  FileVideo, 
  FileAudio, 
  Archive, 
  FileSpreadsheet,
  FileImage,
  Download
} from 'lucide-react';
import { UploadService } from '@/services/uploadService';

interface FilePreviewProps {
  fileName: string;
  fileType: string;
  storagePath: string;
  fileSize: number;
}

const FilePreview: React.FC<FilePreviewProps> = ({ 
  fileName, 
  fileType, 
  storagePath, 
  fileSize 
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // Determine file category
  const getFileCategory = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('image/')) return 'image';
    if (lowerType.includes('video/')) return 'video';
    if (lowerType.includes('audio/')) return 'audio';
    if (lowerType.includes('pdf')) return 'pdf';
    if (lowerType.includes('text/') || lowerType.includes('document')) return 'document';
    if (lowerType.includes('spreadsheet') || lowerType.includes('excel')) return 'spreadsheet';
    if (lowerType.includes('zip') || lowerType.includes('rar') || lowerType.includes('archive')) return 'archive';
    return 'generic';
  };

  const fileCategory = getFileCategory(fileType);

  // Load image preview for image files
  useEffect(() => {
    if (fileCategory === 'image' && fileSize < 10 * 1024 * 1024) { // Only load images under 10MB
      setLoading(true);
      UploadService.getFileUrl(storagePath)
        .then(url => {
          setPreviewUrl(url);
          setError(false);
        })
        .catch(() => {
          setError(true);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [fileCategory, storagePath, fileSize]);

  // Get appropriate icon for file type
  const getFileIcon = (category: string) => {
    switch (category) {
      case 'image':
        return FileImage;
      case 'video':
        return FileVideo;
      case 'audio':
        return FileAudio;
      case 'pdf':
      case 'document':
        return FileText;
      case 'spreadsheet':
        return FileSpreadsheet;
      case 'archive':
        return Archive;
      default:
        return File;
    }
  };

  const IconComponent = getFileIcon(fileCategory);

  // Get file extension for display
  const getFileExtension = (name: string) => {
    const parts = name.split('.');
    return parts.length > 1 ? parts.pop()?.toUpperCase() : '';
  };

  const extension = getFileExtension(fileName);

  if (fileCategory === 'image' && previewUrl && !error) {
    return (
      <div className="relative group/preview w-full">
        <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-muted/20 shadow-xl shadow-black/10 transition-all duration-300 group-hover/preview:shadow-2xl group-hover/preview:shadow-primary/20">
          <img
            src={previewUrl}
            alt={fileName}
            className="w-full h-full object-contain transition-transform duration-500 group-hover/preview:scale-105"
            onError={() => setError(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none" />
          
          {/* Elegant corner accent */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-primary/10 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-accent/10 to-transparent pointer-events-none" />
        </div>
      </div>
    );
  }

  if (fileCategory === 'image' && loading) {
    return (
      <div className="relative w-full">
        <div className="w-full aspect-[4/3] rounded-xl bg-gradient-to-br from-muted/30 to-muted/10 flex items-center justify-center shadow-xl shadow-black/10 border border-border/50">
          <div className="text-center space-y-3">
            <FileImage className="w-16 h-16 text-muted-foreground/50 mx-auto animate-pulse" />
            <p className="text-sm text-muted-foreground font-medium">Loading preview...</p>
          </div>
        </div>
      </div>
    );
  }

  // Default icon view for non-images or failed image loads
  return (
    <div className="relative w-full">
      <div className="w-full aspect-[4/3] rounded-xl bg-gradient-to-br from-primary/10 via-muted/20 to-accent/10 flex flex-col items-center justify-center shadow-xl shadow-black/10 border border-border/50 transition-all duration-300 group-hover/preview:shadow-2xl group-hover/preview:border-primary/30">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-2xl" />
          <div className="relative bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 shadow-lg">
            <IconComponent className="w-16 h-16 text-white" />
          </div>
        </div>
        {extension && (
          <div className="mt-6 px-6 py-2.5 bg-background/80 backdrop-blur-sm rounded-full border border-border/50 shadow-lg">
            <span className="text-sm font-bold text-foreground tracking-wider">
              {extension}
            </span>
          </div>
        )}
        <p className="mt-4 text-xs text-muted-foreground font-medium max-w-[80%] text-center truncate">
          {fileName}
        </p>
      </div>
    </div>
  );
};

export default FilePreview;