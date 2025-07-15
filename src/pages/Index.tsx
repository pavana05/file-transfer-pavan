import { FileUploadManager } from '@/components/upload/FileUploadManager';
import { Upload, Shield, Zap, Users, Smartphone, Sparkles, Globe, Lock } from 'lucide-react';
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
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background/90"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/15 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/15 rounded-full blur-3xl animate-float" style={{
      animationDelay: '1s'
    }}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/5 via-transparent to-transparent rounded-full blur-3xl"></div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Theme Toggle */}
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-4 mb-6">
            <div className="relative w-20 h-20 rounded-3xl bg-gradient-primary flex items-center justify-center shadow-glow ring-4 ring-primary/20 group">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/20 to-transparent"></div>
              <div className="absolute -inset-1 rounded-3xl bg-gradient-conic from-primary/50 via-primary-glow/50 to-primary/50 blur-sm opacity-70 group-hover:opacity-100 transition-opacity"></div>
              <Upload className="relative w-10 h-10 text-white drop-shadow-xl animate-pulse" />
            </div>
            <div className="text-left">
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent leading-tight">
                File Transfer
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-2xl md:text-3xl font-semibold text-muted-foreground">Online</span>
                <Sparkles className="w-6 h-6 text-primary animate-pulse" />
              </div>
            </div>
          </div>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto mb-12 leading-relaxed font-light">
            Experience seamless file sharing with advanced drag-and-drop, real-time progress tracking, and enterprise-grade security features
          </p>
          
          {/* Feature Badges */}
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            <Badge variant="secondary" className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-glass border border-border/50 backdrop-blur-sm hover:scale-105 transition-transform duration-300 shadow-lg">
              <Shield className="w-4 h-4" />
              <span className="font-medium">Secure Upload</span>
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-glass border border-border/50 backdrop-blur-sm hover:scale-105 transition-transform duration-300 shadow-lg">
              <Zap className="w-4 h-4" />
              <span className="font-medium">Resume Support</span>
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-glass border border-border/50 backdrop-blur-sm hover:scale-105 transition-transform duration-300 shadow-lg">
              <Users className="w-4 h-4" />
              <span className="font-medium">Multi-user Ready</span>
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-glass border border-border/50 backdrop-blur-sm hover:scale-105 transition-transform duration-300 shadow-lg">
              <Globe className="w-4 h-4" />
              <span className="font-medium">Cross Platform</span>
            </Badge>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <Card className="p-10 text-center hover:shadow-hover transition-all duration-700 bg-gradient-glass border border-border/50 backdrop-blur-sm rounded-3xl group hover:scale-105 hover:-translate-y-2 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <div className="relative w-20 h-20 rounded-3xl bg-gradient-primary flex items-center justify-center mx-auto mb-8 shadow-glow group-hover:animate-float ring-4 ring-primary/20 group-hover:ring-primary/40 transition-all duration-500">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/20 to-transparent"></div>
              <Upload className="w-10 h-10 text-white drop-shadow-xl" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-foreground group-hover:text-primary transition-colors duration-300">Drag & Drop Interface</h3>
            <p className="text-muted-foreground leading-relaxed text-lg">
              Intuitive drag-and-drop experience with beautiful visual feedback and smooth animations
            </p>
          </Card>

          <Card className="p-10 text-center hover:shadow-hover transition-all duration-700 bg-gradient-glass border border-border/50 backdrop-blur-sm rounded-3xl group hover:scale-105 hover:-translate-y-2 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <div className="relative w-20 h-20 rounded-3xl bg-gradient-secondary flex items-center justify-center mx-auto mb-8 shadow-glow group-hover:animate-float ring-4 ring-accent/20 group-hover:ring-accent/40 transition-all duration-500">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/20 to-transparent"></div>
              <Zap className="w-10 h-10 text-white drop-shadow-xl" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-foreground group-hover:text-accent transition-colors duration-300">Progress Tracking</h3>
            <p className="text-muted-foreground leading-relaxed text-lg">
              Real-time progress visualization with pause, resume, and retry capabilities
            </p>
          </Card>

          <Card className="p-10 text-center hover:shadow-hover transition-all duration-700 bg-gradient-glass border border-border/50 backdrop-blur-sm rounded-3xl group hover:scale-105 hover:-translate-y-2 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-success/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <div className="relative w-20 h-20 rounded-3xl bg-gradient-success flex items-center justify-center mx-auto mb-8 shadow-glow group-hover:animate-float ring-4 ring-success/20 group-hover:ring-success/40 transition-all duration-500">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/20 to-transparent"></div>
              <Shield className="w-10 h-10 text-white drop-shadow-xl" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-foreground group-hover:text-success transition-colors duration-300">Enterprise Security</h3>
            <p className="text-muted-foreground leading-relaxed text-lg">
              Advanced file validation, type checking, and comprehensive security scanning
            </p>
          </Card>
        </div>

        {/* Nearby Share Section */}
        <Card className="p-12 text-center bg-gradient-glass border border-border/50 backdrop-blur-sm rounded-3xl shadow-hover mb-12 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-50"></div>
          <div className="relative w-24 h-24 rounded-3xl bg-gradient-secondary flex items-center justify-center mx-auto mb-8 shadow-glow ring-4 ring-accent/30 group-hover:ring-accent/50 transition-all duration-500">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/20 to-transparent"></div>
            <div className="absolute -inset-1 rounded-3xl bg-gradient-conic from-accent/50 via-primary/50 to-accent/50 blur-sm opacity-70"></div>
            <Smartphone className="relative w-12 h-12 text-white drop-shadow-xl" />
          </div>
          <h3 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
            Nearby Share
          </h3>
          <p className="text-muted-foreground mb-8 max-w-3xl mx-auto text-lg leading-relaxed">
            Experience lightning-fast peer-to-peer file sharing with nearby devices. No cloud uploads required – 
            just create a room or scan a QR code to start instant, secure file transfers.
          </p>
          <NearbyShareDialog
            trigger={
              <Button size="lg" className="gap-3 px-8 py-4 text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <Smartphone className="w-5 h-5" />
                Start Nearby Share
              </Button>
            }
          />
        </Card>

        {/* Main Upload Component */}
        <FileUploadManager config={uploadConfig} callbacks={uploadCallbacks} />

        {/* Technical Specifications */}
        <Card className="mt-20 p-12 bg-gradient-glass border border-border/50 backdrop-blur-sm rounded-3xl shadow-hover relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-30"></div>
          <div className="relative">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-3xl font-bold bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
                Technical Specifications
              </h3>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-8 text-base relative">
            <div>
              <h4 className="font-bold mb-4 text-xl text-foreground">Upload Features</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  Chunked upload for large files ({'>'}100MB)
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  Resume capability for interrupted uploads
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  Concurrent upload limiting
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  Duplicate file detection
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  Nearby share with WebRTC P2P transfer
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-xl text-foreground">Integration Ready</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-accent"></div>
                  Supabase storage integration
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-accent"></div>
                  QR code room joining
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-accent"></div>
                  Real-time device discovery
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-accent"></div>
                  WebRTC peer-to-peer connections
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-accent"></div>
                  TypeScript interfaces included
                </li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Credit */}
        <div className="mt-12 text-center">
          <p className="text-base text-muted-foreground">
            Crafted with ❤️ by <a href="https://pavan-05.framer.ai/" target="_blank" rel="noopener noreferrer" className="font-bold text-primary hover:text-primary-glow transition-colors duration-300 hover:underline">PAVAN</a>
          </p>
        </div>
      </div>
    </div>;
};
export default Index;