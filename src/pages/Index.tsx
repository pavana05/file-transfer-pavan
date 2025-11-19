import { FileUploadManager } from '@/components/upload/FileUploadManager';
import { Upload, Shield, Zap, Users, Smartphone, KeyRound, LogOut, User, Sparkles, Lock, Clock, ScanLine } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useAuth } from '@/contexts/AuthContext';
import NearbyShareDialog from '@/components/nearbyShare/NearbyShareDialog';
import TestimonialsSection from '@/components/testimonials/TestimonialsSection';

const Index = () => {
  const { user, signOut } = useAuth();
  
  const uploadConfig = {
    maxFileSize: 10 * 1024 * 1024 * 1024, // 10GB for large files and folders
    maxFiles: 50, // Allow multiple files
    acceptedTypes: [
      // Images
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp', 'image/tiff',
      // Documents
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
      'text/plain', // .txt
      'text/csv', 'application/rtf',
      // Code files
      'text/html', 'text/css', 'text/javascript', 'application/javascript', 'application/json', 'text/xml', 'application/xml', 'text/markdown', 'application/x-python-code', 'text/x-python', 'text/x-java-source', 'text/x-c', 'text/x-c++src', 'text/x-csharp', 'text/x-php', 'text/x-ruby', 'text/x-go', 'text/x-rust', 'text/x-swift', 'application/typescript', 'text/typescript', 'application/x-yaml', 'text/yaml',
      // Media
      'video/mp4', 'video/webm', 'video/mov', 'video/avi', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac',
      // Archives
      'application/zip', 'application/x-rar-compressed', 'application/x-tar', 'application/gzip', 'application/x-7z-compressed'
    ],
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
      'zip', 'rar', 'tar', 'gz', '7z', 'bz2'
    ],
    enableChunkedUpload: true,
    enableResume: true,
    enablePreview: true,
    autoUpload: false,
    enableDuplicateDetection: true,
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
    },
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Advanced Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-primary-glow/5 via-transparent to-transparent"></div>
      <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] animate-float"></div>
      <div className="absolute bottom-0 right-1/4 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[120px] animate-float" style={{ animationDelay: '2s' }}></div>
      
      {/* Header Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl bg-background/95 border-b border-border/40 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 sm:h-20">
            {/* Logo & Branding */}
            <div className="flex items-center gap-4 animate-fade-in group cursor-pointer" onClick={() => window.location.href = '/'}>
              <div className="relative h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-gradient-primary shadow-glow ring-2 ring-primary/10 flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:shadow-hover">
                <Upload className="h-6 w-6 sm:h-7 sm:w-7 text-primary-foreground transition-transform duration-300 group-hover:rotate-12" />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-primary-foreground/5 to-primary-foreground/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent transition-all duration-300 group-hover:from-primary group-hover:via-primary group-hover:to-primary-glow">
                  FileShare Pro
                </h1>
                <p className="text-xs font-medium text-muted-foreground mt-0.5 flex items-center gap-2">
                  <Shield className="h-3 w-3" />
                  Secure & Lightning Fast
                </p>
              </div>
            </div>
            
            {/* Navigation Actions */}
            <nav className="flex items-center gap-2 sm:gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = '/pin'}
                className="gap-2 hover:bg-primary/10 hover:text-primary transition-all duration-300 font-medium"
              >
                <KeyRound className="h-4 w-4" />
                <span className="hidden sm:inline">PIN Access</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = '/scan'}
                className="gap-2 hover:bg-primary/10 hover:text-primary transition-all duration-300 font-medium"
              >
                <ScanLine className="h-4 w-4" />
                <span className="hidden sm:inline">Scan QR</span>
              </Button>
              
              <div className="h-6 w-px bg-border/60 hidden sm:block"></div>
              
              <ThemeToggle />
              
              {user && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.location.href = '/dashboard'}
                    className="hidden sm:flex items-center gap-2 hover:bg-accent hover:text-accent-foreground transition-all duration-300 font-medium"
                  >
                    <User className="h-4 w-4" />
                    Dashboard
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={signOut}
                    className="gap-2 border-border/60 hover:border-destructive/40 hover:text-destructive hover:bg-destructive/5 transition-all duration-300 font-medium"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Sign Out</span>
                  </Button>
                </>
              )}
              {!user && (
                <Button
                  onClick={() => window.location.href = '/auth'}
                  size="sm"
                  className="gap-2 shadow-md hover:shadow-hover transition-all duration-300 font-medium"
                >
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign In</span>
                </Button>
              )}
            </nav>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-32 pb-16">
        {/* Hero Section */}
        <div className="text-center mb-12 sm:mb-20 space-y-6 sm:space-y-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm animate-scale-in">
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-sm font-medium text-primary">Fast, Secure & Simple</span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
              Share Files
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent">
              Instantly & Securely
            </span>
          </h2>
          
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Upload, share, and manage your files with enterprise-grade security.
            <br className="hidden sm:block" />
            <span className="font-semibold text-foreground">No signup required</span> for quick shares. Up to 10GB per file.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-4">
            <Badge variant="secondary" className="text-sm px-4 py-2">
              <Shield className="h-3.5 w-3.5 mr-2" />
              End-to-End Encrypted
            </Badge>
            <Badge variant="secondary" className="text-sm px-4 py-2">
              <Zap className="h-3.5 w-3.5 mr-2" />
              Lightning Fast
            </Badge>
            <Badge variant="secondary" className="text-sm px-4 py-2">
              <Lock className="h-3.5 w-3.5 mr-2" />
              Password Protected
            </Badge>
          </div>
        </div>
        
        {/* Upload Section */}
        <div className="mb-16 sm:mb-24 animate-slide-up">
          <Card className="border-2 border-primary/20 shadow-2xl shadow-primary/10 bg-card/50 backdrop-blur-sm overflow-hidden">
            <div className="p-6 sm:p-8 lg:p-10">
              <FileUploadManager
                config={uploadConfig}
                callbacks={uploadCallbacks}
              />
            </div>
          </Card>
        </div>

        {/* Testimonials Section */}
        <TestimonialsSection />

        {/* Features Grid */}
        <div className="mb-16 sm:mb-24 relative">
          {/* Decorative Elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/5 rounded-full blur-[120px] -z-10"></div>
          
          <div className="text-center mb-12 sm:mb-16 animate-fade-in relative">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Premium Features</span>
            </div>
            
            <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent">
                Powerful Features
              </span>
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need for secure and efficient file sharing
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <Card className="group relative overflow-hidden hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 hover:scale-[1.03] hover:-translate-y-2 border-border/50 bg-gradient-to-br from-card/80 via-card/50 to-card/80 backdrop-blur-sm animate-fade-in">
              {/* Card Glow Effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent"></div>
              </div>
              
              <div className="p-6 sm:p-8 relative z-10">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                  <div className="relative h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center mb-5 shadow-lg shadow-primary/30 group-hover:shadow-primary/50 transition-all duration-300 group-hover:scale-110">
                    <Shield className="h-7 w-7 text-primary-foreground" />
                  </div>
                </div>
                <h4 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                  Military-Grade Security
                </h4>
                <p className="text-muted-foreground leading-relaxed">
                  Your files are protected with AES-256 encryption. Add passwords and expiration dates for extra security.
                </p>
                
                {/* Decorative Line */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </Card>

            <Card className="group relative overflow-hidden hover:shadow-2xl hover:shadow-success/20 transition-all duration-500 hover:scale-[1.03] hover:-translate-y-2 border-border/50 bg-gradient-to-br from-card/80 via-card/50 to-card/80 backdrop-blur-sm animate-fade-in" style={{ animationDelay: '100ms' }}>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-success/10 via-transparent to-transparent"></div>
              </div>
              
              <div className="p-6 sm:p-8 relative z-10">
                <div className="relative">
                  <div className="absolute inset-0 bg-success/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                  <div className="relative h-14 w-14 rounded-2xl bg-gradient-to-br from-success to-success/80 flex items-center justify-center mb-5 shadow-lg shadow-success/30 group-hover:shadow-success/50 transition-all duration-300 group-hover:scale-110">
                    <Zap className="h-7 w-7 text-success-foreground" />
                  </div>
                </div>
                <h4 className="text-xl font-bold mb-3 group-hover:text-success transition-colors">
                  Lightning Fast Uploads
                </h4>
                <p className="text-muted-foreground leading-relaxed">
                  Chunked uploads with resume capability. Transfer up to 10GB files with blazing speed.
                </p>
                
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-success to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </Card>

            <Card className="group relative overflow-hidden hover:shadow-2xl hover:shadow-warning/20 transition-all duration-500 hover:scale-[1.03] hover:-translate-y-2 border-border/50 bg-gradient-to-br from-card/80 via-card/50 to-card/80 backdrop-blur-sm animate-fade-in" style={{ animationDelay: '200ms' }}>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-warning/10 via-transparent to-transparent"></div>
              </div>
              
              <div className="p-6 sm:p-8 relative z-10">
                <div className="relative">
                  <div className="absolute inset-0 bg-warning/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                  <div className="relative h-14 w-14 rounded-2xl bg-gradient-to-br from-warning to-warning/80 flex items-center justify-center mb-5 shadow-lg shadow-warning/30 group-hover:shadow-warning/50 transition-all duration-300 group-hover:scale-110">
                    <KeyRound className="h-7 w-7 text-warning-foreground" />
                  </div>
                </div>
                <h4 className="text-xl font-bold mb-3 group-hover:text-warning transition-colors">
                  PIN Protection
                </h4>
                <p className="text-muted-foreground leading-relaxed">
                  Share files with unique PIN codes. Track access attempts and maintain complete control.
                </p>
                
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-warning to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </Card>

            <Card className="group relative overflow-hidden hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 hover:scale-[1.03] hover:-translate-y-2 border-border/50 bg-gradient-to-br from-card/80 via-card/50 to-card/80 backdrop-blur-sm animate-fade-in" style={{ animationDelay: '300ms' }}>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-glow/10 via-transparent to-transparent"></div>
              </div>
              
              <div className="p-6 sm:p-8 relative z-10">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary-glow/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                  <div className="relative h-14 w-14 rounded-2xl bg-gradient-to-br from-primary-glow to-primary flex items-center justify-center mb-5 shadow-lg shadow-primary/30 group-hover:shadow-primary/50 transition-all duration-300 group-hover:scale-110">
                    <Smartphone className="h-7 w-7 text-primary-foreground" />
                  </div>
                </div>
                <h4 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                  Nearby Share
                </h4>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Peer-to-peer file sharing with WebRTC. Transfer files directly between devices without servers.
                </p>
                <NearbyShareDialog 
                  trigger={
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full font-semibold border-2 border-primary/20 bg-background/50 backdrop-blur-sm hover:border-primary hover:bg-primary/5 hover:text-primary transition-all duration-300 hover:shadow-md hover:shadow-primary/20 group-hover:scale-105"
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      Try Nearby Share
                    </Button>
                  }
                />
                
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </Card>

            <Card className="group relative overflow-hidden hover:shadow-2xl hover:shadow-accent/20 transition-all duration-500 hover:scale-[1.03] hover:-translate-y-2 border-border/50 bg-gradient-to-br from-card/80 via-card/50 to-card/80 backdrop-blur-sm animate-fade-in" style={{ animationDelay: '400ms' }}>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-transparent"></div>
              </div>
              
              <div className="p-6 sm:p-8 relative z-10">
                <div className="relative">
                  <div className="absolute inset-0 bg-accent/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                  <div className="relative h-14 w-14 rounded-2xl bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center mb-5 shadow-lg shadow-accent/30 group-hover:shadow-accent/50 transition-all duration-300 group-hover:scale-110">
                    <Users className="h-7 w-7 text-accent-foreground" />
                  </div>
                </div>
                <h4 className="text-xl font-bold mb-3 group-hover:text-accent transition-colors">
                  Team Collaboration
                </h4>
                <p className="text-muted-foreground leading-relaxed">
                  Create collections, share with teams, and track downloads. Perfect for businesses.
                </p>
                
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </Card>

            <Card className="group relative overflow-hidden hover:shadow-2xl hover:shadow-destructive/20 transition-all duration-500 hover:scale-[1.03] hover:-translate-y-2 border-border/50 bg-gradient-to-br from-card/80 via-card/50 to-card/80 backdrop-blur-sm animate-fade-in" style={{ animationDelay: '500ms' }}>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-destructive/10 via-transparent to-transparent"></div>
              </div>
              
              <div className="p-6 sm:p-8 relative z-10">
                <div className="relative">
                  <div className="absolute inset-0 bg-destructive/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                  <div className="relative h-14 w-14 rounded-2xl bg-gradient-to-br from-destructive to-destructive/80 flex items-center justify-center mb-5 shadow-lg shadow-destructive/30 group-hover:shadow-destructive/50 transition-all duration-300 group-hover:scale-110">
                    <Clock className="h-7 w-7 text-destructive-foreground" />
                  </div>
                </div>
                <h4 className="text-xl font-bold mb-3 group-hover:text-destructive transition-colors">
                  Auto-Expiration
                </h4>
                <p className="text-muted-foreground leading-relaxed">
                  Set expiration dates and download limits. Files automatically delete for your privacy.
                </p>
                
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-destructive to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center animate-fade-in relative">
          {/* Decorative Background */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-[150px]"></div>
          </div>
          
          <Card className="relative border-2 border-primary/20 shadow-2xl shadow-primary/25 bg-gradient-to-br from-card/90 via-card/80 to-primary/5 backdrop-blur-md overflow-hidden">
            {/* Animated Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary-glow/5 to-transparent opacity-50"></div>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent"></div>
            
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-glow/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
            
            <div className="p-8 sm:p-12 lg:p-16 relative z-10">
              <div className="relative z-10">
                {/* Premium Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 animate-pulse">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-primary">Start Free Today</span>
                </div>
                
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
                  <span className="bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent">
                    Ready to Get Started?
                  </span>
                </h3>
                <p className="text-lg sm:text-xl text-muted-foreground mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed">
                  Join thousands of users sharing files securely every day. No credit card required.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Button
                    size="lg"
                    onClick={() => window.location.href = '/auth'}
                    className="group relative w-full sm:w-auto text-base sm:text-lg px-10 py-7 font-semibold overflow-hidden bg-gradient-to-r from-primary via-primary-glow to-primary hover:shadow-2xl hover:shadow-primary/50 transition-all duration-300 hover:scale-105"
                  >
                    {/* Button Shine Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
                    <User className="mr-2 h-5 w-5 relative z-10" />
                    <span className="relative z-10">Create Free Account</span>
                  </Button>
                  
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => window.location.href = '/scan'}
                    className="group relative w-full sm:w-auto text-base sm:text-lg px-10 py-7 font-semibold border-2 border-primary/30 hover:border-primary bg-background/50 backdrop-blur-sm hover:bg-primary/5 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/20"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <ScanLine className="mr-2 h-5 w-5 relative z-10 group-hover:text-primary transition-colors" />
                    <span className="relative z-10 group-hover:text-primary transition-colors">Scan QR Code</span>
                  </Button>
                  
                  <Button
                    size="lg"
                    variant="ghost"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="group w-full sm:w-auto text-base sm:text-lg px-10 py-7 font-semibold hover:bg-primary/10 transition-all duration-300 hover:scale-105"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <Upload className="mr-2 h-5 w-5 relative z-10 group-hover:text-primary transition-colors" />
                    <span className="relative z-10 group-hover:text-primary transition-colors">Start Uploading</span>
                  </Button>
                </div>
                
                {/* Trust Indicators */}
                <div className="mt-10 pt-10 border-t border-border/30">
                  <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-primary" />
                      <span>256-bit Encryption</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      <span>10,000+ Active Users</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary" />
                      <span>99.9% Uptime</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 bg-card/30 backdrop-blur-sm mt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
                <Upload className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">FileShare Pro</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 FileShare Pro. All rights reserved.
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">Privacy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms</a>
              <a href="#" className="hover:text-primary transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;