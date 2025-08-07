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
      <div className="relative group/preview">
        <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-lg shadow-primary/25 group-hover/preview:scale-105 transition-transform duration-200">
          <img
            src={previewUrl}
            alt={fileName}
            className="w-full h-full object-cover"
            onError={() => setError(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent blur-md" />
      </div>
    );
  }

  if (fileCategory === 'image' && loading) {
    return (
      <div className="relative group/preview">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-muted to-muted/80 flex items-center justify-center shadow-lg shadow-primary/25 animate-pulse">
          <FileImage className="w-10 h-10 text-muted-foreground" />
        </div>
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 to-transparent blur-md" />
      </div>
    );
  }

  // Default icon view for non-images or failed image loads
  return (
    <div className="relative group/preview">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex flex-col items-center justify-center shadow-lg shadow-primary/25 group-hover/preview:scale-105 transition-transform duration-200">
        <IconComponent className="w-8 h-8 text-white mb-1" />
        {extension && (
          <span className="text-xs font-bold text-white/90 leading-none">
            {extension}
          </span>
        )}
      </div>
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 to-transparent blur-md" />
    </div>
  );
};

export default FilePreview;