import { FileUploadManager } from '@/components/upload/FileUploadManager';
import { Upload, Shield, Zap, Users, Smartphone } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import NearbyShareDialog from '@/components/nearbyShare/NearbyShareDialog';
import { Button } from '@/components/ui/button';
const Index = () => {
  const uploadConfig = {
    maxFileSize: 10 * 1024 * 1024 * 1024, // 10GB for large files and folders
    // Remove file count limit for unlimited uploads
    acceptedTypes: [], // Empty array allows all file types
    allowedExtensions: [], // Empty array allows all file extensions
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
      <div className="absolute top-0 left-1/4 w-48 h-48 sm:w-96 sm:h-96 bg-primary/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-0 right-1/4 w-48 h-48 sm:w-96 sm:h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{
      animationDelay: '1s'
    }}></div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Theme Toggle */}
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        <div className="text-center mb-12 sm:mb-16 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-white drop-shadow-lg" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent leading-tight">
              File Transfer Online
            </h1>
          </div>
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8 sm:mb-10 leading-relaxed px-4">
            Advanced file management with drag-and-drop, progress tracking, and enterprise-grade security features
          </p>
          
          {/* Feature Badges */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8 sm:mb-12 px-4">
            <Badge variant="secondary" className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-gradient-glass border border-border/50 backdrop-blur-sm text-xs sm:text-sm">
              <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="font-medium">Secure Upload</span>
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-gradient-glass border border-border/50 backdrop-blur-sm text-xs sm:text-sm">
              <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="font-medium">Resume Support</span>
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-gradient-glass border border-border/50 backdrop-blur-sm text-xs sm:text-sm">
              <Users className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="font-medium">Multi-user Ready</span>
            </Badge>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
          <Card className="p-6 sm:p-8 text-center hover:shadow-glass transition-all duration-500 bg-gradient-glass border border-border/50 backdrop-blur-sm rounded-2xl group hover:scale-105">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-glow group-hover:animate-float">
              <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-foreground">Drag & Drop Interface</h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Intuitive drag-and-drop with visual feedback and hover states
            </p>
          </Card>

          <Card className="p-6 sm:p-8 text-center hover:shadow-glass transition-all duration-500 bg-gradient-glass border border-border/50 backdrop-blur-sm rounded-2xl group hover:scale-105">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-secondary flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-glow group-hover:animate-float">
              <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-foreground">Progress Tracking</h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Real-time progress bars with pause/resume functionality
            </p>
          </Card>

          <Card className="p-6 sm:p-8 text-center hover:shadow-glass transition-all duration-500 bg-gradient-glass border border-border/50 backdrop-blur-sm rounded-2xl group hover:scale-105">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-glow group-hover:animate-float">
              <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-foreground">File Validation</h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Type checking, size limits, and security scanning
            </p>
          </Card>
        </div>

        {/* Nearby Share Section */}
        <Card className="p-6 sm:p-8 text-center bg-gradient-glass border border-border/50 backdrop-blur-sm rounded-2xl shadow-glass mb-6 sm:mb-8">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-secondary flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-glow">
            <Smartphone className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Nearby Share
          </h3>
          <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 max-w-2xl mx-auto px-4">
            Share files directly with nearby devices without uploading to the cloud. 
            Create a room or scan a QR code to start peer-to-peer file sharing.
          </p>
          <NearbyShareDialog
            trigger={
              <Button size="lg" className="gap-2 w-full sm:w-auto">
                <Smartphone className="w-4 h-4 sm:w-5 sm:h-5" />
                Start Nearby Share
              </Button>
            }
          />
        </Card>

        {/* Main Upload Component */}
        <FileUploadManager config={uploadConfig} callbacks={uploadCallbacks} />

        {/* Technical Specifications */}
        <Card className="mt-12 sm:mt-16 p-6 sm:p-8 bg-gradient-glass border border-border/50 backdrop-blur-sm rounded-2xl shadow-glass">
          <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">Technical Specifications</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 text-sm">
            <div>
              <h4 className="font-medium mb-2 text-base">Upload Features</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Chunked upload for large files (&gt;100MB)</li>
                <li>• Resume capability for interrupted uploads</li>
                <li>• Concurrent upload limiting</li>
                <li>• Duplicate file detection</li>
                <li>• Nearby share with WebRTC P2P transfer</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2 text-base">Integration Ready</h4>
              <ul className="space-y-1 text-muted-foreground">
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
        <div className="mt-6 sm:mt-8 text-center">
          <p className="text-sm text-muted-foreground px-4">
            This project is made by <a href="https://pavan-05.framer.ai/" target="_blank" rel="noopener noreferrer" className="font-bold text-primary hover:text-primary/80 transition-colors">PAVAN</a>
          </p>
        </div>
      </div>
    </div>;
};
export default Index;