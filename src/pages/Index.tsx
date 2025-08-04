import { FileUploadManager } from '@/components/upload/FileUploadManager';
import { Upload, Shield, Zap, Users, Smartphone } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import NearbyShareDialog from '@/components/nearbyShare/NearbyShareDialog';
import { Button } from '@/components/ui/button';
const Index = () => {
  const uploadConfig = {
    maxFileSize: 10 * 1024 * 1024 * 1024,
    // 10GB for large files and folders
    maxFiles: 50,
    // Allow multiple files
    acceptedTypes: [
    // Images
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp', 'image/tiff',
    // Documents
    'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    // .docx
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    // .xlsx
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    // .pptx
    'text/plain',
    // .txt
    'text/csv', 'application/rtf',
    // Code files
    'text/html', 'text/css', 'text/javascript', 'application/javascript', 'application/json', 'text/xml', 'application/xml', 'text/markdown', 'application/x-python-code', 'text/x-python', 'text/x-java-source', 'text/x-c', 'text/x-c++src', 'text/x-csharp', 'text/x-php', 'text/x-ruby', 'text/x-go', 'text/x-rust', 'text/x-swift', 'application/typescript', 'text/typescript', 'application/x-yaml', 'text/yaml',
    // Media
    'video/mp4', 'video/webm', 'video/mov', 'video/avi', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac',
    // Archives
    'application/zip', 'application/x-rar-compressed', 'application/x-tar', 'application/gzip', 'application/x-7z-compressed'],
    allowedExtensions: [
    // Documents
    'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf', 'csv',
    // Code files
    'html', 'htm', 'css', 'js', 'ts', 'jsx', 'tsx', 'json', 'xml', 'py', 'java', 'c', 'cpp', 'cc', 'cxx', 'h', 'hpp', 'cs', 'php', 'rb', 'go', 'rs', 'swift', 'kt', 'scala', 'sql', 'md', 'yaml', 'yml', 'ini', 'cfg', 'conf', 'sh', 'bat', 'ps1', 'r', 'dart', 'lua', 'perl', 'pl',
    // Images
    'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff', 'ico',
    // Media
    'mp4', 'webm', 'mov', 'avi', 'mkv', 'mp3', 'wav', 'ogg', 'aac', 'm4a',
    // Archives
    'zip', 'rar', 'tar', 'gz', '7z', 'bz2'],
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
  return <div className="min-h-screen bg-gradient-mesh relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background/90"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{
      animationDelay: '1s'
    }}></div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-2 sm:px-4 py-6 sm:py-8 lg:py-12">
        {/* Theme Toggle */}
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        <div className="text-center mb-12 md:mb-16 animate-fade-in px-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow flex-shrink-0">
              <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-white drop-shadow-lg" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent text-center sm:text-left leading-tight">
              File Transfer Online
            </h1>
          </div>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8 md:mb-10 leading-relaxed px-2">
            Advanced file management with drag-and-drop, progress tracking, and enterprise-grade security features
          </p>
          
          {/* Feature Badges */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8 md:mb-12 px-4">
            <Badge variant="secondary" className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-glass border border-border/50 backdrop-blur-sm text-xs sm:text-sm">
              <Shield className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="font-medium whitespace-nowrap">Secure Upload</span>
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-glass border border-border/50 backdrop-blur-sm text-xs sm:text-sm">
              <Zap className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="font-medium whitespace-nowrap">Resume Support</span>
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-glass border border-border/50 backdrop-blur-sm text-xs sm:text-sm">
              <Users className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="font-medium whitespace-nowrap">Multi-user Ready</span>
            </Badge>
          </div>
        </div>

        {/* Main Upload Component - Hero Section */}
        <div className="mb-12 md:mb-16 px-4">
          <FileUploadManager config={uploadConfig} callbacks={uploadCallbacks} />
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-12 md:mb-16 px-4">
          <Card className="p-4 sm:p-6 lg:p-8 text-center hover:shadow-glass transition-all duration-500 bg-gradient-glass border border-border/50 backdrop-blur-sm rounded-2xl group hover:scale-105">
            <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-glow group-hover:animate-float">
              <Upload className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-foreground">Drag & Drop Interface</h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Intuitive drag-and-drop with visual feedback and hover states
            </p>
          </Card>

          <Card className="p-4 sm:p-6 lg:p-8 text-center hover:shadow-glass transition-all duration-500 bg-gradient-glass border border-border/50 backdrop-blur-sm rounded-2xl group hover:scale-105">
            <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-2xl bg-gradient-secondary flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-glow group-hover:animate-float">
              <Zap className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-foreground">Progress Tracking</h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Real-time progress bars with pause/resume functionality
            </p>
          </Card>

          <Card className="p-4 sm:p-6 lg:p-8 text-center hover:shadow-glass transition-all duration-500 bg-gradient-glass border border-border/50 backdrop-blur-sm rounded-2xl group hover:scale-105 sm:col-span-2 lg:col-span-1">
            <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-glow group-hover:animate-float">
              <Shield className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-foreground">File Validation</h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Type checking, size limits, and security scanning
            </p>
          </Card>
        </div>

        {/* Nearby Share Section */}
        <Card className="p-4 sm:p-6 lg:p-8 text-center bg-gradient-glass border border-border/50 backdrop-blur-sm rounded-2xl shadow-glass mb-6 md:mb-8 mx-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-2xl bg-gradient-secondary flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-glow">
            <Smartphone className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Nearby Share
          </h3>
          <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 max-w-2xl mx-auto px-2">
            Share files directly with nearby devices without uploading to the cloud. 
            Create a room or scan a QR code to start peer-to-peer file sharing.
          </p>
          <NearbyShareDialog
            trigger={
              <Button size="sm" className="gap-1.5 sm:gap-2 text-sm sm:text-base h-9 sm:h-10 lg:h-11 px-4 sm:px-6">
                <Smartphone className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="whitespace-nowrap">Start Nearby Share</span>
              </Button>
            }
          />
        </Card>


        {/* Technical Specifications */}
        <Card className="mt-12 md:mt-16 p-4 sm:p-6 lg:p-8 bg-gradient-glass border border-border/50 backdrop-blur-sm rounded-2xl shadow-glass mx-4">
          <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent text-center sm:text-left">
            Technical Specifications
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 text-xs sm:text-sm">
            <div>
              <h4 className="font-medium mb-2 sm:mb-3 text-sm sm:text-base">Upload Features</h4>
              <ul className="space-y-1.5 sm:space-y-2 text-muted-foreground">
                <li>• Chunked upload for large files (&gt;100MB)</li>
                <li>• Resume capability for interrupted uploads</li>
                <li>• Concurrent upload limiting</li>
                <li>• Duplicate file detection</li>
                <li>• Nearby share with WebRTC P2P transfer</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2 sm:mb-3 text-sm sm:text-base">Integration Ready</h4>
              <ul className="space-y-1.5 sm:space-y-2 text-muted-foreground">
                <li>• Supabase storage integration</li>
                <li>• QR code room joining</li>
                <li>• Real-time device discovery</li>
                <li>• WebRTC peer-to-peer connections</li>
                <li>• TypeScript interfaces included</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Credit */}
        <div className="mt-6 sm:mt-8 text-center px-4">
          <p className="text-xs sm:text-sm text-muted-foreground">
            This project is made by <a href="https://pavan-05.framer.ai/" target="_blank" rel="noopener noreferrer" className="font-bold text-primary hover:text-primary/80 transition-colors">PAVAN</a>
          </p>
        </div>
      </div>
    </div>;
};
export default Index;