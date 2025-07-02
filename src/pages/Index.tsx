import { FileUploadManager } from '@/components/upload/FileUploadManager';
import { Upload, Shield, Zap, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Index = () => {
  const uploadConfig = {
    maxFileSize: 100 * 1024 * 1024, // 100MB
    maxFiles: 10,
    acceptedTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'video/mp4',
      'video/webm'
    ],
    enableChunkedUpload: true,
    enableResume: true,
    enablePreview: true,
    autoUpload: false,
    enableDuplicateDetection: true
  };

  const uploadCallbacks = {
    onFileAdd: (files: any[]) => {
      console.log('Files added:', files);
    },
    onUploadComplete: (file: any) => {
      console.log('Upload completed:', file);
    },
    onUploadError: (file: any, error: string) => {
      console.error('Upload error:', file, error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Upload className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              Enterprise File Upload
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Advanced file management with drag-and-drop, progress tracking, and enterprise-grade security features
          </p>
          
          {/* Feature Badges */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Secure Upload
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Resume Support
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              Multi-user Ready
            </Badge>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 text-center hover:shadow-hover transition-all duration-300">
            <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mx-auto mb-4">
              <Upload className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold mb-2">Drag & Drop Interface</h3>
            <p className="text-sm text-muted-foreground">
              Intuitive drag-and-drop with visual feedback and hover states
            </p>
          </Card>

          <Card className="p-6 text-center hover:shadow-hover transition-all duration-300">
            <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold mb-2">Progress Tracking</h3>
            <p className="text-sm text-muted-foreground">
              Real-time progress bars with pause/resume functionality
            </p>
          </Card>

          <Card className="p-6 text-center hover:shadow-hover transition-all duration-300">
            <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold mb-2">File Validation</h3>
            <p className="text-sm text-muted-foreground">
              Type checking, size limits, and security scanning
            </p>
          </Card>
        </div>

        {/* Main Upload Component */}
        <FileUploadManager
          config={uploadConfig}
          callbacks={uploadCallbacks}
        />

        {/* Technical Specifications */}
        <Card className="mt-12 p-6">
          <h3 className="text-lg font-semibold mb-4">Technical Specifications</h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-medium mb-2">Upload Features</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Chunked upload for large files (&gt;100MB)</li>
                <li>• Resume capability for interrupted uploads</li>
                <li>• Concurrent upload limiting</li>
                <li>• Duplicate file detection</li>
                <li>• File compression options</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Integration Ready</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Supabase storage integration</li>
                <li>• Authentication context support</li>
                <li>• CDN optimization planning</li>
                <li>• Backup and versioning system</li>
                <li>• TypeScript interfaces included</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Index;
