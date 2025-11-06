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
  return <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-accent/5 via-transparent to-transparent"></div>
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/3 rounded-full blur-[100px] animate-float"></div>
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-accent/3 rounded-full blur-[100px] animate-float" style={{
      animationDelay: '1s'
    }}></div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Professional Header */}
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 animate-fade-in">
          {user ? <div className="flex items-center gap-3 bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl px-5 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-all duration-300 hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => window.location.href = '/dashboard'}
                className="h-9 px-4 text-sm font-medium rounded-xl hover:bg-primary/10 transition-all duration-200"
              >
                Dashboard
              </Button>
              <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-sm">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-foreground truncate max-w-[180px]">
                {user.email}
              </span>
              <Button variant="ghost" size="sm" onClick={signOut} className="h-9 px-4 text-sm font-medium rounded-xl hover:bg-destructive/10 hover:text-destructive transition-all duration-200">
                <LogOut className="w-4 h-4 mr-1.5" />
                Sign Out
              </Button>
            </div> : <Button variant="outline" size="sm" onClick={() => window.location.href = '/auth'} className="bg-card/95 backdrop-blur-xl border border-border/50 hover:bg-primary/10 hover:border-primary/40 px-7 py-3 h-auto rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-all duration-300 font-medium">
              Sign In
            </Button>}
          <ThemeToggle />
        </div>
        {/* Hero Section - Professional Layout */}
        <div className="text-center mb-20 md:mb-24 animate-fade-in max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-6 mb-10">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-primary rounded-[2rem] blur-xl opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-[2rem] bg-gradient-primary flex items-center justify-center shadow-[0_20px_60px_-15px_rgba(59,130,246,0.5)]">
                <Upload className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
              </div>
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent leading-[1.1] tracking-tight">
              File Transfer
            </h1>
          </div>
          
          <p className="text-xl sm:text-2xl md:text-3xl text-muted-foreground/90 max-w-4xl mx-auto mb-12 leading-relaxed font-light">
            Professional file management with drag-and-drop, real-time tracking, and enterprise-grade security
          </p>
          
          {/* Professional Feature Badges */}
          <div className="flex flex-wrap justify-center gap-4 mb-14">
            <Badge variant="secondary" className="flex items-center gap-2.5 px-6 py-3 rounded-full bg-card/80 backdrop-blur-xl border border-border/50 hover:border-primary/40 hover:bg-card/90 transition-all duration-300 text-base font-medium shadow-sm">
              <Shield className="w-5 h-5 text-primary flex-shrink-0" />
              <span className="whitespace-nowrap">Secure Upload</span>
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-2.5 px-6 py-3 rounded-full bg-card/80 backdrop-blur-xl border border-border/50 hover:border-primary/40 hover:bg-card/90 transition-all duration-300 text-base font-medium shadow-sm">
              <Zap className="w-5 h-5 text-primary flex-shrink-0" />
              <span className="whitespace-nowrap">Resume Support</span>
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-2.5 px-6 py-3 rounded-full bg-card/80 backdrop-blur-xl border border-border/50 hover:border-primary/40 hover:bg-card/90 transition-all duration-300 text-base font-medium shadow-sm">
              <Users className="w-5 h-5 text-primary flex-shrink-0" />
              <span className="whitespace-nowrap">Multi-user Ready</span>
            </Badge>
          </div>

          {/* PIN Access Card */}
          <div className="max-w-lg mx-auto">
            <Card className="p-8 bg-card/60 backdrop-blur-xl border border-border/50 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)] transition-all duration-300">
              <p className="text-base text-muted-foreground mb-5 font-medium">
                Have a 4-digit PIN from someone?
              </p>
              <Button 
                variant="outline" 
                onClick={() => window.open('/pin', '_blank')} 
                className="w-full h-14 px-8 rounded-2xl border-2 border-primary/30 hover:border-primary hover:bg-primary/5 transition-all duration-300 font-semibold text-base group"
              >
                <KeyRound className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-300" />
                Access with PIN
              </Button>
            </Card>
          </div>
        </div>

        {/* Main Upload Component */}
        <div className="mb-20 md:mb-24 max-w-6xl mx-auto">
          <FileUploadManager config={uploadConfig} callbacks={uploadCallbacks} />
        </div>

        {/* Professional Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10 mb-20 md:mb-24 max-w-7xl mx-auto">
          <Card className="group p-10 text-center bg-card/60 backdrop-blur-xl border border-border/50 hover:border-primary/40 rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.15)] transition-all duration-500 hover:-translate-y-3">
            <div className="relative mb-8 mx-auto w-24 h-24">
              <div className="absolute inset-0 bg-gradient-primary rounded-[1.5rem] blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
              <div className="relative w-full h-full rounded-[1.5rem] bg-gradient-primary flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                <Upload className="w-11 h-11 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-4 text-foreground group-hover:text-primary transition-colors duration-300">
              Drag & Drop Interface
            </h3>
            <p className="text-base text-muted-foreground leading-relaxed">
              Intuitive drag-and-drop with visual feedback and hover states
            </p>
          </Card>

          <Card className="group p-10 text-center bg-card/60 backdrop-blur-xl border border-border/50 hover:border-primary/40 rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.15)] transition-all duration-500 hover:-translate-y-3">
            <div className="relative mb-8 mx-auto w-24 h-24">
              <div className="absolute inset-0 bg-gradient-secondary rounded-[1.5rem] blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
              <div className="relative w-full h-full rounded-[1.5rem] bg-gradient-secondary flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                <Zap className="w-11 h-11 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-4 text-foreground group-hover:text-primary transition-colors duration-300">
              Progress Tracking
            </h3>
            <p className="text-base text-muted-foreground leading-relaxed">
              Real-time progress bars with pause/resume functionality
            </p>
          </Card>

          <Card className="group p-10 text-center bg-card/60 backdrop-blur-xl border border-border/50 hover:border-primary/40 rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.15)] transition-all duration-500 hover:-translate-y-3 sm:col-span-2 lg:col-span-1">
            <div className="relative mb-8 mx-auto w-24 h-24">
              <div className="absolute inset-0 bg-gradient-primary rounded-[1.5rem] blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
              <div className="relative w-full h-full rounded-[1.5rem] bg-gradient-primary flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                <Shield className="w-11 h-11 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-4 text-foreground group-hover:text-primary transition-colors duration-300">
              File Validation
            </h3>
            <p className="text-base text-muted-foreground leading-relaxed">
              Type checking, size limits, and security scanning
            </p>
          </Card>
        </div>

        {/* Nearby Share Section */}
        <div className="relative mb-6 md:mb-8 mx-4">
        </div>


        {/* Professional Technical Specifications */}
        <Card className="mt-20 md:mt-24 p-10 md:p-12 lg:p-16 bg-card/60 backdrop-blur-xl border border-border/50 rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.08)] max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
              Technical Specifications
            </h3>
            <p className="text-muted-foreground text-lg">
              Enterprise-grade features built for performance and reliability
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14">
            <div className="space-y-8">
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Upload className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold mb-4 text-xl text-foreground">Upload Features</h4>
                  <ul className="space-y-3 text-base text-muted-foreground">
                    <li className="flex items-start">
                      <span className="text-primary mr-3 font-bold text-lg">•</span>
                      <span>Chunked upload for large files (&gt;100MB)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-3 font-bold text-lg">•</span>
                      <span>Resume capability for interrupted uploads</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-3 font-bold text-lg">•</span>
                      <span>Concurrent upload limiting</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-3 font-bold text-lg">•</span>
                      <span>Duplicate file detection</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-3 font-bold text-lg">•</span>
                      <span>Nearby share with WebRTC P2P transfer</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="space-y-8">
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-secondary flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold mb-4 text-xl text-foreground">Integration Ready</h4>
                  <ul className="space-y-3 text-base text-muted-foreground">
                    <li className="flex items-start">
                      <span className="text-primary mr-3 font-bold text-lg">•</span>
                      <span>Supabase storage integration</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-3 font-bold text-lg">•</span>
                      <span>QR code room joining</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-3 font-bold text-lg">•</span>
                      <span>Real-time device discovery</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-3 font-bold text-lg">•</span>
                      <span>WebRTC peer-to-peer connections</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-3 font-bold text-lg">•</span>
                      <span>TypeScript interfaces included</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Professional Footer */}
        <div className="mt-16 sm:mt-20 text-center">
          <div className="inline-flex items-center gap-3 px-8 py-4 bg-card/60 backdrop-blur-xl border border-border/50 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
            <span className="text-base text-muted-foreground">
              Crafted with excellence by
            </span>
            <a 
              href="https://pavan-05.framer.ai/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="font-bold text-lg text-primary hover:text-primary-glow transition-colors duration-300 underline decoration-primary/30 hover:decoration-primary underline-offset-4"
            >
              PAVAN
            </a>
          </div>
        </div>
      </div>
    </div>;
};
export default Index;