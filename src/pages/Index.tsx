import { FileUploadManager } from '@/components/upload/FileUploadManager';
import { Upload, Shield, Zap, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';

const Index = () => {
  const uploadConfig = {
    maxFileSize: 500 * 1024 * 1024, // 500MB for large files and folders
    maxFiles: 50, // Allow multiple files
    acceptedTypes: [
      // Images
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp', 'image/tiff',
      
      // Documents
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
      'text/plain', // .txt
      'text/csv',
      'application/rtf',
      
      // Code files
      'text/html', 'text/css', 'text/javascript', 'application/javascript',
      'application/json', 'text/xml', 'application/xml',
      'text/markdown', 'application/x-python-code', 'text/x-python',
      'text/x-java-source', 'text/x-c', 'text/x-c++src',
      'text/x-csharp', 'text/x-php', 'text/x-ruby',
      'text/x-go', 'text/x-rust', 'text/x-swift',
      'application/typescript', 'text/typescript',
      'application/x-yaml', 'text/yaml',
      
      // Media
      'video/mp4', 'video/webm', 'video/mov', 'video/avi',
      'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac',
      
      // Archives
      'application/zip', 'application/x-rar-compressed', 'application/x-tar',
      'application/gzip', 'application/x-7z-compressed'
    ],
    allowedExtensions: [
      // Documents
      'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf', 'csv',
      
      // Code files
      'html', 'htm', 'css', 'js', 'ts', 'jsx', 'tsx', 'json', 'xml',
      'py', 'java', 'c', 'cpp', 'cc', 'cxx', 'h', 'hpp',
      'cs', 'php', 'rb', 'go', 'rs', 'swift', 'kt', 'scala',
      'sql', 'md', 'yaml', 'yml', 'ini', 'cfg', 'conf',
      'sh', 'bat', 'ps1', 'r', 'dart', 'lua', 'perl', 'pl',
      
      // Images
      'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff', 'ico',
      
      // Media
      'mp4', 'webm', 'mov', 'avi', 'mkv', 'mp3', 'wav', 'ogg', 'aac', 'm4a',
      
      // Archives
      'zip', 'rar', 'tar', 'gz', '7z', 'bz2'
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
    <div className="min-h-screen bg-gradient-mesh relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background/90"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Theme Toggle */}
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <Upload className="w-8 h-8 text-white drop-shadow-lg" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
              Enterprise File Upload
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
            Advanced file management with drag-and-drop, progress tracking, and enterprise-grade security features
          </p>
          
          {/* Feature Badges */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-glass border border-border/50 backdrop-blur-sm">
              <Shield className="w-4 h-4" />
              <span className="font-medium">Secure Upload</span>
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-glass border border-border/50 backdrop-blur-sm">
              <Zap className="w-4 h-4" />
              <span className="font-medium">Resume Support</span>
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-glass border border-border/50 backdrop-blur-sm">
              <Users className="w-4 h-4" />
              <span className="font-medium">Multi-user Ready</span>
            </Badge>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="p-8 text-center hover:shadow-glass transition-all duration-500 bg-gradient-glass border border-border/50 backdrop-blur-sm rounded-2xl group hover:scale-105">
            <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-6 shadow-glow group-hover:animate-float">
              <Upload className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-foreground">Drag & Drop Interface</h3>
            <p className="text-muted-foreground leading-relaxed">
              Intuitive drag-and-drop with visual feedback and hover states
            </p>
          </Card>

          <Card className="p-8 text-center hover:shadow-glass transition-all duration-500 bg-gradient-glass border border-border/50 backdrop-blur-sm rounded-2xl group hover:scale-105">
            <div className="w-16 h-16 rounded-2xl bg-gradient-secondary flex items-center justify-center mx-auto mb-6 shadow-glow group-hover:animate-float">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-foreground">Progress Tracking</h3>
            <p className="text-muted-foreground leading-relaxed">
              Real-time progress bars with pause/resume functionality
            </p>
          </Card>

          <Card className="p-8 text-center hover:shadow-glass transition-all duration-500 bg-gradient-glass border border-border/50 backdrop-blur-sm rounded-2xl group hover:scale-105">
            <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-6 shadow-glow group-hover:animate-float">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-foreground">File Validation</h3>
            <p className="text-muted-foreground leading-relaxed">
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
        <Card className="mt-16 p-8 bg-gradient-glass border border-border/50 backdrop-blur-sm rounded-2xl shadow-glass">
          <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">Technical Specifications</h3>
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
