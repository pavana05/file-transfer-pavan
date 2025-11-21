import { FileUploadManager } from '@/components/upload/FileUploadManager';
import { Upload, Shield, Zap, Users, Smartphone, KeyRound, LogOut, User, Sparkles, Lock, Clock, ScanLine, Menu, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { ScrollToTop } from '@/components/ui/scroll-to-top';
import { useAuth } from '@/contexts/AuthContext';
import NearbyShareDialog from '@/components/nearbyShare/NearbyShareDialog';
import TestimonialsSection from '@/components/testimonials/TestimonialsSection';
import FAQSection from '@/components/faq/FAQSection';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useState } from 'react';

const Index = () => {
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
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
      {/* Enhanced Background Effects with Mesh Gradient */}
      <div className="absolute inset-0 bg-gradient-mesh"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-primary-glow/8 via-transparent to-transparent"></div>
      
      {/* Animated Background Orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-glow/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
      
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex h-14 sm:h-16 items-center justify-between gap-2">
            {/* Logo & Branding */}
            <div className="flex items-center gap-2 sm:gap-3 cursor-pointer group flex-shrink-0" onClick={() => window.location.href = '/'}>
              <div className="relative h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-primary shadow-sm flex items-center justify-center transition-all duration-200 group-hover:shadow-md group-hover:scale-105">
                <Upload className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
              </div>
              <div className="hidden xs:block min-w-0">
                <h1 className="text-sm sm:text-lg font-semibold tracking-tight text-foreground truncate">
                  FileShare Pro
                </h1>
                <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">
                  Secure File Sharing
                </p>
              </div>
            </div>
            
            {/* Desktop Navigation Actions */}
            <nav className="hidden md:flex items-center gap-1 sm:gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = '/pin'}
                className="gap-1 sm:gap-2 h-8 sm:h-9 px-2 sm:px-3"
              >
                <KeyRound className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">PIN</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = '/scan'}
                className="gap-1 sm:gap-2 h-8 sm:h-9 px-2 sm:px-3"
              >
                <ScanLine className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">Scan</span>
              </Button>
              
              <div className="h-4 sm:h-6 w-px bg-border/60"></div>
              
              <ThemeToggle />
              
              {user && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.location.href = '/dashboard'}
                    className="flex items-center gap-2 h-9"
                  >
                    <User className="h-4 w-4" />
                    Dashboard
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={signOut}
                    className="gap-2 h-9"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                </>
              )}
              
              {!user && (
                <Button
                  size="sm"
                  onClick={() => window.location.href = '/auth'}
                  className="gap-2 h-9"
                >
                  <User className="h-4 w-4" />
                  Sign In
                </Button>
              )}
            </nav>

            {/* Mobile Navigation - Theme Toggle & Menu Button */}
            <div className="flex md:hidden items-center gap-2">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(true)}
                className="h-9 w-9 p-0"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <Drawer open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <DrawerContent className="max-h-[80vh]">
          <DrawerHeader className="border-b">
            <div className="flex items-center justify-between">
              <DrawerTitle className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <Upload className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-semibold">FileShare Pro</span>
              </DrawerTitle>
              <DrawerClose asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <X className="h-5 w-5" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>
          
          <nav className="flex flex-col p-6 gap-3">
            <Button
              variant="ghost"
              size="lg"
              onClick={() => {
                window.location.href = '/pin';
                setMobileMenuOpen(false);
              }}
              className="justify-start gap-3 h-12 text-base"
            >
              <KeyRound className="h-5 w-5" />
              PIN Access
            </Button>
            
            <Button
              variant="ghost"
              size="lg"
              onClick={() => {
                window.location.href = '/scan';
                setMobileMenuOpen(false);
              }}
              className="justify-start gap-3 h-12 text-base"
            >
              <ScanLine className="h-5 w-5" />
              Scan QR Code
            </Button>

            {user && (
              <>
                <div className="h-px bg-border my-2"></div>
                
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => {
                    window.location.href = '/dashboard';
                    setMobileMenuOpen(false);
                  }}
                  className="justify-start gap-3 h-12 text-base"
                >
                  <User className="h-5 w-5" />
                  Dashboard
                </Button>
                
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  className="justify-start gap-3 h-12 text-base text-destructive hover:text-destructive"
                >
                  <LogOut className="h-5 w-5" />
                  Sign Out
                </Button>
              </>
            )}
            
            {!user && (
              <>
                <div className="h-px bg-border my-2"></div>
                
                <Button
                  size="lg"
                  onClick={() => {
                    window.location.href = '/auth';
                    setMobileMenuOpen(false);
                  }}
                  className="justify-center gap-3 h-12 text-base"
                >
                  <User className="h-5 w-5" />
                  Sign In
                </Button>
              </>
            )}
          </nav>
        </DrawerContent>
      </Drawer>
      
      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-12 md:py-20">
        {/* Hero Section */}
        <div className="text-center mb-16 sm:mb-20 space-y-6 sm:space-y-8 max-w-5xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 shadow-glow text-xs font-medium text-primary animate-fade-in backdrop-blur-sm">
            <Sparkles className="h-4 w-4 animate-glow" />
            <span className="font-semibold">Fast, Secure & Simple File Sharing</span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight px-2 animate-slide-up">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-foreground">
              Share Files
            </span>
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary-glow to-primary">
              Instantly & Securely
            </span>
          </h2>
          
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-4 leading-relaxed">
            Upload, share, and manage your files with enterprise-grade security.{' '}
            <span className="font-semibold text-foreground">No signup required</span> for quick shares. 
            <span className="block mt-2">Up to <span className="text-primary font-bold">10GB</span> per file with blazing fast speeds.</span>
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4 px-2">
            <Badge variant="secondary" className="text-xs sm:text-sm px-4 py-2 shadow-sm hover:shadow-md transition-shadow">
              <Shield className="h-4 w-4 mr-2 text-primary" />
              Bank-Grade Encryption
            </Badge>
            <Badge variant="secondary" className="text-xs sm:text-sm px-4 py-2 shadow-sm hover:shadow-md transition-shadow">
              <Zap className="h-4 w-4 mr-2 text-success" />
              Lightning Fast
            </Badge>
            <Badge variant="secondary" className="text-xs sm:text-sm px-4 py-2 shadow-sm hover:shadow-md transition-shadow">
              <Lock className="h-4 w-4 mr-2 text-warning" />
              Password Protected
            </Badge>
          </div>
        </div>
        
        {/* Upload Section */}
        <div id="upload-section" className="mb-20 sm:mb-24 scroll-mt-20 relative z-10">
          <Card className="border-2 border-border/50 shadow-2xl bg-card/80 backdrop-blur-xl overflow-hidden group hover:shadow-hover transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary-glow/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="p-6 sm:p-8 md:p-10 lg:p-12 relative z-10">
              <FileUploadManager
                config={uploadConfig}
                callbacks={uploadCallbacks}
              />
            </div>
          </Card>
        </div>

        {/* Statistics Section */}
        <div className="mb-20 sm:mb-24 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="p-6 sm:p-8 text-center relative z-10">
                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mb-2 animate-pulse-glow">10M+</div>
                <div className="text-xs sm:text-sm text-muted-foreground font-medium">Files Shared</div>
              </div>
            </Card>
            
            <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-success/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="p-6 sm:p-8 text-center relative z-10">
                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-success mb-2">500K+</div>
                <div className="text-xs sm:text-sm text-muted-foreground font-medium">Active Users</div>
              </div>
            </Card>
            
            <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-warning/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="p-6 sm:p-8 text-center relative z-10">
                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-warning mb-2">50TB+</div>
                <div className="text-xs sm:text-sm text-muted-foreground font-medium">Data Transferred</div>
              </div>
            </Card>
            
            <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-glow/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="p-6 sm:p-8 text-center relative z-10">
                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-glow mb-2">99.9%</div>
                <div className="text-xs sm:text-sm text-muted-foreground font-medium">Uptime</div>
              </div>
            </Card>
          </div>
        </div>

        {/* Testimonials Section */}
        <TestimonialsSection />

        {/* Features Grid */}
        <div className="mb-20 sm:mb-24 relative z-10">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 text-xs font-semibold text-primary shadow-sm backdrop-blur-sm">
              <Sparkles className="h-4 w-4 animate-glow" />
              Premium Features
            </div>
            
            <h3 className="text-4xl sm:text-5xl font-bold mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary-glow to-primary">Powerful Features</span>
            </h3>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
              Everything you need for secure and efficient file sharing, all in one place
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <Card className="group relative overflow-hidden hover:shadow-2xl transition-all duration-500 hover:scale-[1.03] hover:-translate-y-1 border-border/50 bg-card/80 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="p-8 relative z-10">
                <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300 shadow-md">
                  <Shield className="h-7 w-7 text-primary" />
                </div>
                <h4 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                  Bank-Grade Encryption
                </h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Your files are protected with military-grade AES-256 encryption. Add passwords, expiration dates, and download limits for extra security layers.
                </p>
              </div>
            </Card>

            <Card className="group relative overflow-hidden hover:shadow-2xl transition-all duration-500 hover:scale-[1.03] hover:-translate-y-1 border-border/50 bg-card/80 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-success/10 via-success/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-success/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="p-8 relative z-10">
                <div className="h-14 w-14 rounded-xl bg-success/10 flex items-center justify-center mb-6 group-hover:bg-success/20 group-hover:scale-110 transition-all duration-300 shadow-md">
                  <Zap className="h-7 w-7 text-success" />
                </div>
                <h4 className="text-xl font-bold mb-3 group-hover:text-success transition-colors">
                  Lightning Fast Uploads
                </h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Chunked uploads with intelligent resume capability. Transfer up to 10GB files with blazing speed and automatic optimization.
                </p>
              </div>
            </Card>

            <Card className="group relative overflow-hidden hover:shadow-2xl transition-all duration-500 hover:scale-[1.03] hover:-translate-y-1 border-border/50 bg-card/80 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-warning/10 via-warning/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-warning/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="p-8 relative z-10">
                <div className="h-14 w-14 rounded-xl bg-warning/10 flex items-center justify-center mb-6 group-hover:bg-warning/20 group-hover:scale-110 transition-all duration-300 shadow-md">
                  <KeyRound className="h-7 w-7 text-warning" />
                </div>
                <h4 className="text-xl font-bold mb-3 group-hover:text-warning transition-colors">
                  PIN Protection
                </h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Share files with unique PIN codes. Track access attempts, monitor activity logs, and maintain complete control over your shares.
                </p>
              </div>
            </Card>

            <Card className="group relative overflow-hidden hover:shadow-2xl transition-all duration-500 hover:scale-[1.03] hover:-translate-y-1 border-border/50 bg-card/80 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="p-8 relative z-10">
                <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300 shadow-md">
                  <Users className="h-7 w-7 text-primary" />
                </div>
                <h4 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                  Instant Sharing
                </h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Generate shareable links instantly with one click. No email required. Share with anyone, anywhere in the world.
                </p>
              </div>
            </Card>

            <Card className="group relative overflow-hidden hover:shadow-2xl transition-all duration-500 hover:scale-[1.03] hover:-translate-y-1 border-border/50 bg-card/80 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-success/10 via-success/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-success/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="p-8 relative z-10">
                <div className="h-14 w-14 rounded-xl bg-success/10 flex items-center justify-center mb-6 group-hover:bg-success/20 group-hover:scale-110 transition-all duration-300 shadow-md">
                  <Clock className="h-7 w-7 text-success" />
                </div>
                <h4 className="text-xl font-bold mb-3 group-hover:text-success transition-colors">
                  Time-Limited Access
                </h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Set custom expiration dates and download limits. Your files, your rules, your timeline. Automatic cleanup included.
                </p>
              </div>
            </Card>

            <Card className="group relative overflow-hidden hover:shadow-2xl transition-all duration-500 hover:scale-[1.03] hover:-translate-y-1 border-border/50 bg-card/80 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-warning/10 via-warning/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-warning/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="p-8 relative z-10">
                <div className="h-14 w-14 rounded-xl bg-warning/10 flex items-center justify-center mb-6 group-hover:bg-warning/20 group-hover:scale-110 transition-all duration-300 shadow-md">
                  <Smartphone className="h-7 w-7 text-warning" />
                </div>
                <h4 className="text-xl font-bold mb-3 group-hover:text-warning transition-colors">
                  QR Code Sharing
                </h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Generate instant QR codes for quick mobile access. Perfect for in-person sharing and presentations.
                </p>
              </div>
            </Card>
          </div>
        </div>

        {/* P2P Sharing Section */}
        <div className="mb-20 sm:mb-24 relative z-10">
          <Card className="border-2 border-primary/30 overflow-hidden shadow-2xl bg-card/80 backdrop-blur-xl group hover:shadow-hover transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-primary-glow/10 to-transparent"></div>
            <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-10 sm:p-14 relative z-10">
              <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                <div className="flex-1 space-y-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 text-xs font-semibold text-primary shadow-sm backdrop-blur-sm animate-pulse-glow">
                    <Sparkles className="h-4 w-4 animate-glow" />
                    New Feature
                  </div>
                  <h3 className="text-4xl sm:text-5xl font-bold leading-tight">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary-glow to-primary">Peer-to-Peer</span>
                    <br />
                    <span className="text-foreground">File Transfer</span>
                  </h3>
                  <p className="text-muted-foreground text-lg sm:text-xl leading-relaxed">
                    Connect directly with nearby devices using cutting-edge WebRTC technology. 
                    Ultra-fast, completely private, and military-grade secure.
                  </p>
                  <div className="flex flex-wrap gap-3 pt-4">
                    <Badge variant="secondary" className="text-sm px-4 py-2 shadow-sm hover:shadow-md transition-shadow">
                      <Zap className="h-4 w-4 mr-2 text-success" />
                      No Server Needed
                    </Badge>
                    <Badge variant="secondary" className="text-sm px-4 py-2 shadow-sm hover:shadow-md transition-shadow">
                      <Shield className="h-4 w-4 mr-2 text-primary" />
                      End-to-End Encrypted
                    </Badge>
                    <Badge variant="secondary" className="text-sm px-4 py-2 shadow-sm hover:shadow-md transition-shadow">
                      <Smartphone className="h-4 w-4 mr-2 text-warning" />
                      Mobile Friendly
                    </Badge>
                  </div>
                </div>
                <NearbyShareDialog 
                  trigger={
                    <Button size="lg" className="gap-2 shadow-xl hover:shadow-2xl transition-all duration-300 px-8 py-6 text-base font-semibold">
                      <Smartphone className="h-6 w-6" />
                      Try P2P Transfer
                    </Button>
                  } 
                />
              </div>
            </div>
          </Card>
        </div>

        {/* FAQ Section */}
        <FAQSection />

        {/* CTA Section */}
        <div className="text-center max-w-4xl mx-auto relative z-10">
          <Card className="bg-gradient-to-br from-primary/15 via-primary/8 to-transparent border-2 border-primary/30 overflow-hidden shadow-2xl backdrop-blur-xl group hover:shadow-hover transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-mesh opacity-50"></div>
            <div className="p-10 sm:p-16 space-y-8 relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 text-xs font-semibold text-primary shadow-sm backdrop-blur-sm mb-4">
                <Sparkles className="h-4 w-4 animate-glow" />
                Get Started Today
              </div>
              
              <h3 className="text-4xl sm:text-5xl font-bold leading-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80">
                  Ready to Start Sharing?
                </span>
              </h3>
              
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Join <span className="font-bold text-primary">500,000+</span> users who trust FileShare Pro for their secure file sharing needs. 
                <span className="block mt-2">No credit card required. Start for free.</span>
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                {!user && (
                  <Button size="lg" onClick={() => window.location.href = '/auth'} className="gap-2 px-8 py-6 text-base font-semibold shadow-xl hover:shadow-2xl transition-all duration-300">
                    <User className="h-5 w-5" />
                    Create Free Account
                  </Button>
                )}
                {user && (
                  <Button size="lg" onClick={() => window.location.href = '/dashboard'} className="gap-2 px-8 py-6 text-base font-semibold shadow-xl hover:shadow-2xl transition-all duration-300">
                    <User className="h-5 w-5" />
                    Go to Dashboard
                  </Button>
                )}
                <Button size="lg" variant="outline" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="px-8 py-6 text-base font-semibold border-2 hover:bg-primary/10 transition-all duration-300">
                  Start Uploading
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-background/95 backdrop-blur mt-20 sm:mt-24 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-gradient-primary shadow-lg flex items-center justify-center">
                <Upload className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-base font-bold">FileShare Pro</p>
                <p className="text-sm text-muted-foreground">Secure File Sharing Platform</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => window.location.href = '/loading-demo'}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                View Loading States
              </Button>
              <p className="text-sm text-muted-foreground">
                © 2024 FileShare Pro. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      <ScrollToTop />
    </div>
  );
};

export default Index;
