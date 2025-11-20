import { FileUploadManager } from '@/components/upload/FileUploadManager';
import { Upload, Shield, Zap, Users, Smartphone, KeyRound, LogOut, User, Sparkles, Lock, Clock, ScanLine, Menu, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useAuth } from '@/contexts/AuthContext';
import NearbyShareDialog from '@/components/nearbyShare/NearbyShareDialog';
import TestimonialsSection from '@/components/testimonials/TestimonialsSection';
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
    <div className="min-h-screen bg-background relative">
      {/* Subtle Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-accent/5 via-transparent to-transparent"></div>
      
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
        <div className="text-center mb-12 sm:mb-16 space-y-4 sm:space-y-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] sm:text-xs font-medium text-primary">
            <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            Fast, Secure & Simple
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight px-2">
            Share Files
            <br />
            <span className="text-primary">Instantly & Securely</span>
          </h2>
          
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Upload, share, and manage your files with enterprise-grade security.{' '}
            <span className="font-medium text-foreground">No signup required</span> for quick shares. Up to 10GB per file.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 pt-2 px-2">
            <Badge variant="secondary" className="text-[10px] sm:text-xs px-2 sm:px-3 py-1">
              <Shield className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1 sm:mr-1.5" />
              Encrypted
            </Badge>
            <Badge variant="secondary" className="text-[10px] sm:text-xs px-2 sm:px-3 py-1">
              <Zap className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1 sm:mr-1.5" />
              Fast
            </Badge>
            <Badge variant="secondary" className="text-[10px] sm:text-xs px-2 sm:px-3 py-1">
              <Lock className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1 sm:mr-1.5" />
              Protected
            </Badge>
          </div>
        </div>
        
        {/* Upload Section */}
        <div className="mb-12 sm:mb-16 md:mb-20">
          <Card className="border shadow-lg bg-card">
            <div className="p-4 sm:p-6 md:p-8 lg:p-10">
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
        <div className="mb-20">
          <div className="text-center mb-12 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Premium Features
            </div>
            
            <h3 className="text-3xl sm:text-4xl font-bold mb-4">
              <span className="text-primary">Powerful Features</span>
            </h3>
            <p className="text-lg text-muted-foreground">
              Everything you need for secure and efficient file sharing
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="group relative overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-border/50">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="p-6 relative z-10">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h4 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                  Bank-Grade Encryption
                </h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Your files are protected with AES-256 encryption. Add passwords and expiration dates for extra security.
                </p>
              </div>
            </Card>

            <Card className="group relative overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-border/50">
              <div className="absolute inset-0 bg-gradient-to-br from-success/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="p-6 relative z-10">
                <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center mb-4 group-hover:bg-success/20 transition-colors">
                  <Zap className="h-6 w-6 text-success" />
                </div>
                <h4 className="text-lg font-semibold mb-2 group-hover:text-success transition-colors">
                  Lightning Fast Uploads
                </h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Chunked uploads with resume capability. Transfer up to 10GB files with blazing speed.
                </p>
              </div>
            </Card>

            <Card className="group relative overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-border/50">
              <div className="absolute inset-0 bg-gradient-to-br from-warning/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="p-6 relative z-10">
                <div className="h-12 w-12 rounded-lg bg-warning/10 flex items-center justify-center mb-4 group-hover:bg-warning/20 transition-colors">
                  <KeyRound className="h-6 w-6 text-warning" />
                </div>
                <h4 className="text-lg font-semibold mb-2 group-hover:text-warning transition-colors">
                  PIN Protection
                </h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Share files with unique PIN codes. Track access attempts and maintain complete control.
                </p>
              </div>
            </Card>

            <Card className="group relative overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-border/50">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="p-6 relative z-10">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h4 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                  Instant Sharing
                </h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Generate shareable links instantly. No email required. Share with anyone, anywhere.
                </p>
              </div>
            </Card>

            <Card className="group relative overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-border/50">
              <div className="absolute inset-0 bg-gradient-to-br from-success/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="p-6 relative z-10">
                <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center mb-4 group-hover:bg-success/20 transition-colors">
                  <Clock className="h-6 w-6 text-success" />
                </div>
                <h4 className="text-lg font-semibold mb-2 group-hover:text-success transition-colors">
                  Time-Limited Access
                </h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Set expiration dates and download limits. Your files, your rules, your timeline.
                </p>
              </div>
            </Card>

            <Card className="group relative overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-border/50">
              <div className="absolute inset-0 bg-gradient-to-br from-warning/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="p-6 relative z-10">
                <div className="h-12 w-12 rounded-lg bg-warning/10 flex items-center justify-center mb-4 group-hover:bg-warning/20 transition-colors">
                  <Smartphone className="h-6 w-6 text-warning" />
                </div>
                <h4 className="text-lg font-semibold mb-2 group-hover:text-warning transition-colors">
                  QR Code Sharing
                </h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Generate QR codes for quick mobile access. Perfect for in-person sharing.
                </p>
              </div>
            </Card>
          </div>
        </div>

        {/* P2P Sharing Section */}
        <div className="mb-20">
          <Card className="border-2 border-primary/20 overflow-hidden">
            <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 sm:p-12">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex-1 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20 border border-primary/30 text-xs font-medium text-primary">
                    <Sparkles className="h-3.5 w-3.5" />
                    New Feature
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-bold">
                    <span className="text-primary">Peer-to-Peer</span> File Transfer
                  </h3>
                  <p className="text-muted-foreground text-lg">
                    Connect directly with nearby devices using WebRTC technology. Ultra-fast, private, and secure.
                  </p>
                  <div className="flex flex-wrap gap-3 pt-4">
                    <Badge variant="secondary" className="text-xs px-3 py-1">
                      <Zap className="h-3 w-3 mr-1.5" />
                      No Server Needed
                    </Badge>
                    <Badge variant="secondary" className="text-xs px-3 py-1">
                      <Shield className="h-3 w-3 mr-1.5" />
                      End-to-End Encrypted
                    </Badge>
                    <Badge variant="secondary" className="text-xs px-3 py-1">
                      <Smartphone className="h-3 w-3 mr-1.5" />
                      Mobile Friendly
                    </Badge>
                  </div>
                </div>
                <NearbyShareDialog 
                  trigger={
                    <Button size="lg" className="gap-2 shadow-lg">
                      <Smartphone className="h-5 w-5" />
                      Try P2P Transfer
                    </Button>
                  } 
                />
              </div>
            </div>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center max-w-3xl mx-auto">
          <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-2 border-primary/20">
            <div className="p-8 sm:p-12 space-y-6">
              <h3 className="text-3xl sm:text-4xl font-bold">
                Ready to Start Sharing?
              </h3>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                Join thousands of users who trust FileShare Pro for their secure file sharing needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                {!user && (
                  <Button size="lg" onClick={() => window.location.href = '/auth'} className="gap-2">
                    <User className="h-5 w-5" />
                    Create Free Account
                  </Button>
                )}
                {user && (
                  <Button size="lg" onClick={() => window.location.href = '/dashboard'} className="gap-2">
                    <User className="h-5 w-5" />
                    Go to Dashboard
                  </Button>
                )}
                <Button size="lg" variant="outline" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                  Start Uploading
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-background/95 backdrop-blur mt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Upload className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold">FileShare Pro</p>
                <p className="text-xs text-muted-foreground">Secure File Sharing</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => window.location.href = '/loading-demo'}
                className="text-xs text-muted-foreground hover:text-primary"
              >
                <Sparkles className="h-3 w-3 mr-1.5" />
                View Loading States
              </Button>
              <p className="text-sm text-muted-foreground">
                © 2024 FileShare Pro. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
