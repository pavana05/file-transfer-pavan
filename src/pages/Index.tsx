import { FileUploadManager } from '@/components/upload/FileUploadManager';
import { Upload, Shield, Zap, Users, Smartphone, KeyRound } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import NearbyShareDialog from '@/components/nearbyShare/NearbyShareDialog';
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

          {/* PIN Access Section */}
          <div className="text-center mb-8 md:mb-10">
            <p className="text-sm text-muted-foreground mb-4">
              Have a 4-digit PIN from someone? Access their file directly:
            </p>
            <Button
              variant="outline"
              onClick={() => window.open('/pin', '_blank')}
              className="h-11 px-6 border-2 border-primary/30 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
            >
              <KeyRound className="w-4 h-4 mr-2" />
              Access with PIN
            </Button>
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
        <div className="relative mb-6 md:mb-8 mx-4">
          {/* Background Glow Effects */}
          <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 via-primary-glow/30 to-secondary/20 rounded-3xl blur-xl opacity-50"></div>
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-3xl blur-lg opacity-30"></div>
          
          <Card className="relative p-6 sm:p-8 lg:p-10 text-center bg-gradient-to-br from-background/95 via-background/90 to-background/95 border-2 border-primary/20 backdrop-blur-xl rounded-3xl shadow-2xl hover:shadow-glow transition-all duration-700 hover:scale-[1.02] group overflow-hidden">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-5 dark:opacity-10">
              <div className="absolute top-4 left-4 w-20 h-20 bg-primary/30 rounded-full blur-2xl animate-pulse"></div>
              <div className="absolute bottom-4 right-4 w-32 h-32 bg-secondary/20 rounded-full blur-3xl animate-pulse" style={{
              animationDelay: '1s'
            }}></div>
              <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-accent/25 rounded-full blur-xl animate-pulse" style={{
              animationDelay: '2s'
            }}></div>
            </div>

            {/* Enhanced Icon Container */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-3xl mx-auto mb-6 sm:mb-8 group-hover:animate-float">
              {/* Multiple gradient layers for depth */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-glow to-secondary rounded-3xl shadow-2xl"></div>
              <div className="absolute inset-0 bg-gradient-to-tl from-transparent via-white/20 to-white/10 rounded-3xl"></div>
              <div className="absolute -inset-1 bg-gradient-conic from-primary/60 via-primary-glow/60 to-secondary/60 rounded-3xl blur-sm opacity-60 group-hover:opacity-100 transition-opacity"></div>
              
              {/* Icon with enhanced styling */}
              <div className="relative w-full h-full flex items-center justify-center rounded-3xl ring-4 ring-primary/30">
                <Smartphone className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white drop-shadow-2xl group-hover:scale-110 transition-transform duration-300" />
              </div>
            </div>

            {/* Enhanced Typography */}
            <div className="relative z-10 space-y-4 sm:space-y-6 mb-6 sm:mb-8">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
                <span className="bg-gradient-to-r from-primary via-primary-glow to-secondary bg-clip-text text-transparent animate-fade-in">Quick Share</span>
              </h3>
              <div className="w-16 h-1 bg-gradient-to-r from-primary to-primary-glow rounded-full mx-auto opacity-60"></div>
              
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed px-2">
                Share files directly with nearby devices without uploading to the cloud.<br />
                <span className="text-foreground/80 font-medium">Create a room or scan a QR code to start peer-to-peer file sharing.</span>
              </p>
            </div>

            {/* Enhanced Call-to-Action */}
            <div className="relative z-10">
              <NearbyShareDialog trigger={<Button size="lg" className="relative px-8 sm:px-10 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-2xl bg-gradient-to-r from-primary via-primary-glow to-primary hover:from-primary-glow hover:via-primary hover:to-primary-glow shadow-xl hover:shadow-2xl hover:shadow-primary/25 border-2 border-primary/20 hover:border-primary/40 transition-all duration-500 transform hover:scale-105 group/btn overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-700 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000"></div>
                    <Smartphone className="w-5 h-5 sm:w-6 sm:h-6 mr-2 relative z-10" />
                    <span className="relative z-10">Start Quick Share</span>
                  </Button>} />
            </div>

            {/* Bottom accent line */}
            <div className="absolute bottom-0 left-1/4 right-1/4 h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent"></div>
          </Card>
        </div>


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