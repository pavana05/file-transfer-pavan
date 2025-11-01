import { FileUploadManager } from '@/components/upload/FileUploadManager';
import { Upload, Shield, Zap, Users, Smartphone, KeyRound, LogOut, User } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useAuth } from '@/contexts/AuthContext';
import NearbyShareDialog from '@/components/nearbyShare/NearbyShareDialog';
const Index = () => {
  const {
    user,
    signOut
  } = useAuth();
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
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background"></div>
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] animate-float"></div>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] animate-float" style={{
      animationDelay: '1s'
    }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-glow/3 rounded-full blur-[120px]"></div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Professional Header */}
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 animate-fade-in">
          {user ? <div className="flex items-center gap-3 bg-card/95 backdrop-blur-md border border-border/60 rounded-xl px-4 py-2.5 shadow-glass hover:shadow-glow transition-all duration-300">
              <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-card-foreground truncate max-w-[180px]">
                {user.email}
              </span>
              <Button variant="ghost" size="sm" onClick={signOut} className="h-8 px-3 text-xs rounded-lg hover:bg-destructive/10 hover:text-destructive transition-all duration-200">
                <LogOut className="w-3.5 h-3.5 mr-1.5" />
                Sign Out
              </Button>
            </div> : <Button variant="outline" size="sm" onClick={() => window.location.href = '/auth'} className="bg-card/95 backdrop-blur-md border border-border/60 hover:bg-primary/10 hover:border-primary/50 px-6 py-2.5 h-auto rounded-xl shadow-glass hover:shadow-glow transition-all duration-300">
              Sign In
            </Button>}
          <ThemeToggle />
        </div>
        {/* Hero Section - Professional Layout */}
        <div className="text-center mb-16 md:mb-20 animate-fade-in max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5 mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-primary rounded-3xl blur-xl opacity-40 animate-pulse-glow"></div>
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-primary flex items-center justify-center shadow-glow">
                <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow-2xl" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent leading-tight tracking-tight">
              File Transfer Online
            </h1>
          </div>
          
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed font-light">
            Advanced file management with drag-and-drop, progress tracking, and enterprise-grade security features
          </p>
          
          {/* Professional Feature Badges */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            <Badge variant="secondary" className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-card/60 backdrop-blur-md border border-border/60 hover:border-primary/50 hover:shadow-glow transition-all duration-300 text-sm font-medium">
              <Shield className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="whitespace-nowrap">Secure Upload</span>
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-card/60 backdrop-blur-md border border-border/60 hover:border-primary/50 hover:shadow-glow transition-all duration-300 text-sm font-medium">
              <Zap className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="whitespace-nowrap">Resume Support</span>
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-card/60 backdrop-blur-md border border-border/60 hover:border-primary/50 hover:shadow-glow transition-all duration-300 text-sm font-medium">
              <Users className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="whitespace-nowrap">Multi-user Ready</span>
            </Badge>
          </div>

          {/* PIN Access Card */}
          <div className="max-w-md mx-auto">
            <Card className="p-6 bg-card/40 backdrop-blur-md border border-border/60 rounded-2xl shadow-glass hover:shadow-glow transition-all duration-300">
              <p className="text-sm text-muted-foreground mb-4 font-medium">
                Have a 4-digit PIN from someone?
              </p>
              <Button 
                variant="outline" 
                onClick={() => window.open('/pin', '_blank')} 
                className="w-full h-12 px-6 rounded-xl border-2 border-primary/40 hover:border-primary hover:bg-primary/5 transition-all duration-300 font-semibold group"
              >
                <KeyRound className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-300" />
                Access with PIN
              </Button>
            </Card>
          </div>
        </div>

        {/* Main Upload Component */}
        <div className="mb-16 md:mb-20 max-w-5xl mx-auto">
          <FileUploadManager config={uploadConfig} callbacks={uploadCallbacks} />
        </div>

        {/* Professional Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-16 md:mb-20 max-w-6xl mx-auto">
          <Card className="group p-8 text-center bg-card/40 backdrop-blur-md border border-border/60 hover:border-primary/50 rounded-3xl hover:shadow-glow transition-all duration-500 hover:-translate-y-2">
            <div className="relative mb-6 mx-auto w-20 h-20">
              <div className="absolute inset-0 bg-gradient-primary rounded-2xl blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500"></div>
              <div className="relative w-full h-full rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform duration-500">
                <Upload className="w-9 h-9 text-white drop-shadow-lg" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-3 text-card-foreground group-hover:text-primary transition-colors duration-300">
              Drag & Drop Interface
            </h3>
            <p className="text-base text-muted-foreground leading-relaxed">
              Intuitive drag-and-drop with visual feedback and hover states
            </p>
          </Card>

          <Card className="group p-8 text-center bg-card/40 backdrop-blur-md border border-border/60 hover:border-primary/50 rounded-3xl hover:shadow-glow transition-all duration-500 hover:-translate-y-2">
            <div className="relative mb-6 mx-auto w-20 h-20">
              <div className="absolute inset-0 bg-gradient-secondary rounded-2xl blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500"></div>
              <div className="relative w-full h-full rounded-2xl bg-gradient-secondary flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform duration-500">
                <Zap className="w-9 h-9 text-white drop-shadow-lg" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-3 text-card-foreground group-hover:text-primary transition-colors duration-300">
              Progress Tracking
            </h3>
            <p className="text-base text-muted-foreground leading-relaxed">
              Real-time progress bars with pause/resume functionality
            </p>
          </Card>

          <Card className="group p-8 text-center bg-card/40 backdrop-blur-md border border-border/60 hover:border-primary/50 rounded-3xl hover:shadow-glow transition-all duration-500 hover:-translate-y-2 sm:col-span-2 lg:col-span-1">
            <div className="relative mb-6 mx-auto w-20 h-20">
              <div className="absolute inset-0 bg-gradient-primary rounded-2xl blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500"></div>
              <div className="relative w-full h-full rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform duration-500">
                <Shield className="w-9 h-9 text-white drop-shadow-lg" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-3 text-card-foreground group-hover:text-primary transition-colors duration-300">
              File Validation
            </h3>
            <p className="text-base text-muted-foreground leading-relaxed">
              Type checking, size limits, and security scanning
            </p>
          </Card>
        </div>

        {/* Nearby Share Section */}
        <div className="relative mb-6 md:mb-8 mx-4">
          {/* Background Glow Effects */}
          <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 via-primary-glow/30 to-secondary/20 rounded-3xl blur-xl opacity-50"></div>
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-3xl blur-lg opacity-30"></div>
          
          
        </div>


        {/* Professional Technical Specifications */}
        <Card className="mt-16 md:mt-20 p-8 md:p-10 lg:p-12 bg-card/40 backdrop-blur-md border border-border/60 rounded-3xl shadow-glass max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h3 className="text-2xl sm:text-3xl font-bold mb-3 bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
              Technical Specifications
            </h3>
            <p className="text-muted-foreground text-base">
              Enterprise-grade features built for performance and reliability
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center flex-shrink-0 shadow-glow">
                  <Upload className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-3 text-lg text-card-foreground">Upload Features</h4>
                  <ul className="space-y-2.5 text-sm text-muted-foreground">
                    <li className="flex items-start">
                      <span className="text-primary mr-2 font-bold">•</span>
                      <span>Chunked upload for large files (&gt;100MB)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2 font-bold">•</span>
                      <span>Resume capability for interrupted uploads</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2 font-bold">•</span>
                      <span>Concurrent upload limiting</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2 font-bold">•</span>
                      <span>Duplicate file detection</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2 font-bold">•</span>
                      <span>Nearby share with WebRTC P2P transfer</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-secondary flex items-center justify-center flex-shrink-0 shadow-glow">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-3 text-lg text-card-foreground">Integration Ready</h4>
                  <ul className="space-y-2.5 text-sm text-muted-foreground">
                    <li className="flex items-start">
                      <span className="text-primary mr-2 font-bold">•</span>
                      <span>Supabase storage integration</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2 font-bold">•</span>
                      <span>QR code room joining</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2 font-bold">•</span>
                      <span>Real-time device discovery</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2 font-bold">•</span>
                      <span>WebRTC peer-to-peer connections</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2 font-bold">•</span>
                      <span>TypeScript interfaces included</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Professional Footer */}
        <div className="mt-12 sm:mt-16 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-card/40 backdrop-blur-md border border-border/60 rounded-full">
            <span className="text-sm text-muted-foreground">
              Crafted with excellence by
            </span>
            <a 
              href="https://pavan-05.framer.ai/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="font-bold text-primary hover:text-primary-glow transition-colors duration-300 underline decoration-primary/30 hover:decoration-primary underline-offset-4"
            >
              PAVAN
            </a>
          </div>
        </div>
      </div>
    </div>;
};
export default Index;