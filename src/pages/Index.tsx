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
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{
      animationDelay: '1s'
    }}></div>
      
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
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent"> File Transfer Online</h1>
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

        {/* Nearby Share Section */}
        <Card className="p-8 text-center bg-gradient-glass border border-border/50 backdrop-blur-sm rounded-2xl shadow-glass mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-secondary flex items-center justify-center mx-auto mb-6 shadow-glow">
            <Smartphone className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Nearby Share
          </h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Share files directly with nearby devices without uploading to the cloud. 
            Create a room or scan a QR code to start peer-to-peer file sharing.
          </p>
          <NearbyShareDialog
            trigger={
              <Button size="lg" className="gap-2">
                <Smartphone className="w-5 h-5" />
                Start Nearby Share
              </Button>
            }
          />
        </Card>

        {/* Main Upload Component */}
        <FileUploadManager config={uploadConfig} callbacks={uploadCallbacks} />

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
                <li>• Nearby share with WebRTC P2P transfer</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Integration Ready</h4>
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
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            This project is made by <a href="https://pavan-05.framer.ai/" target="_blank" rel="noopener noreferrer" className="font-bold text-primary hover:text-primary/80 transition-colors">PAVAN</a>
          </p>
        </div>
      </div>
    </div>;
};
export default Index;