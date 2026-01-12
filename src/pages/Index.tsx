import { FileUploadManager } from '@/components/upload/FileUploadManager';
import { Upload, Shield, Zap, Users, Smartphone, KeyRound, LogOut, User, Sparkles, Lock, Clock, ScanLine, Menu, X, Crown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { ScrollToTop } from '@/components/ui/scroll-to-top';
import { useAuth } from '@/contexts/AuthContext';
import NearbyShareDialog from '@/components/nearbyShare/NearbyShareDialog';
import TestimonialsSection from '@/components/testimonials/TestimonialsSection';
import FAQSection from '@/components/faq/FAQSection';
import TrustIndicators from '@/components/trust/TrustIndicators';
import ScrollReveal from '@/components/animations/ScrollReveal';
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useState } from 'react';
const Index = () => {
  const {
    user,
    signOut
  } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const uploadConfig = {
    maxFileSize: 1 * 1024 * 1024 * 1024,
    // 1GB file size limit
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
      {/* Enhanced Premium Background Effects */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-60"></div>
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-radial from-primary/20 via-primary/5 to-transparent blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-radial from-primary-glow/15 via-transparent to-transparent blur-3xl"></div>
      
      {/* Animated Gradient Orbs with Refined Blur */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-primary/15 to-primary-glow/10 rounded-full blur-[100px] animate-float opacity-60"></div>
      <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-gradient-to-tl from-success/10 to-primary/5 rounded-full blur-[120px] animate-float opacity-50" style={{
      animationDelay: '1.5s'
    }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-r from-primary-glow/8 to-transparent rounded-full blur-[100px] animate-pulse-glow"></div>
      
      {/* Header Navigation with Premium Design */}
      <header className="sticky top-0 z-50 w-full border-b border-border/30 bg-card/80 backdrop-blur-xl supports-[backdrop-filter]:bg-card/60 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
          <div className="flex h-16 sm:h-18 items-center justify-between gap-3">
            {/* Logo & Branding */}
            <div className="flex items-center gap-3 sm:gap-4 cursor-pointer group flex-shrink-0" onClick={() => window.location.href = '/'}>
              <div className="relative h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-gradient-primary shadow-lg flex items-center justify-center transition-all duration-300 group-hover:shadow-glow group-hover:scale-105">
                <Upload className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
              </div>
              <div className="hidden xs:block min-w-0">
                <h1 className="text-base sm:text-xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  FileShare Pro
                </h1>
                <p className="text-[11px] sm:text-xs text-muted-foreground font-medium">
                  Enterprise File Sharing
                </p>
              </div>
            </div>
            
            {/* Desktop Navigation Actions */}
            <nav className="hidden md:flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => window.location.href = '/pricing'} className="gap-2 h-10 px-4 hover:bg-primary/10 hover:text-primary transition-all">
                <Crown className="h-4 w-4" />
                <span className="text-sm font-medium">Pricing</span>
              </Button>
              
              <Button variant="ghost" size="sm" onClick={() => window.location.href = '/pin'} className="gap-2 h-10 px-4 hover:bg-primary/10 hover:text-primary transition-all">
                <KeyRound className="h-4 w-4" />
                <span className="text-sm font-medium">PIN Access</span>
              </Button>
              
              <Button variant="ghost" size="sm" onClick={() => window.location.href = '/scan'} className="gap-2 h-10 px-4 hover:bg-primary/10 hover:text-primary transition-all">
                <ScanLine className="h-4 w-4" />
                <span className="text-sm font-medium">Scan QR</span>
              </Button>
              
              <div className="h-6 w-px bg-border mx-1"></div>
              
              <ThemeToggle />
              
              {user && <>
                  <Button variant="ghost" size="sm" onClick={() => window.location.href = '/profile'} className="gap-2 h-10 px-4 hover:bg-primary/10 hover:text-primary transition-all">
                    <User className="h-4 w-4" />
                    <span className="font-medium">Profile</span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={signOut} className="gap-2 h-10 px-4">
                    <LogOut className="h-4 w-4" />
                    <span className="font-medium">Sign Out</span>
                  </Button>
                </>}
              
              {!user && <Button size="sm" onClick={() => window.location.href = '/auth'} className="gap-2 h-10 px-6 shadow-md hover:shadow-lg">
                  <User className="h-4 w-4" />
                  <span className="font-medium">Sign In</span>
                </Button>}
            </nav>

            {/* Mobile Navigation - Theme Toggle & Menu Button */}
            <div className="flex md:hidden items-center gap-2">
              <ThemeToggle />
              <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(true)} className="h-10 w-10 p-0">
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
            <Button variant="ghost" size="lg" onClick={() => {
            window.location.href = '/pricing';
            setMobileMenuOpen(false);
          }} className="justify-start gap-3 h-12 text-base">
              <Crown className="h-5 w-5" />
              Pricing
            </Button>
            
            <Button variant="ghost" size="lg" onClick={() => {
            window.location.href = '/pin';
            setMobileMenuOpen(false);
          }} className="justify-start gap-3 h-12 text-base">
              <KeyRound className="h-5 w-5" />
              PIN Access
            </Button>
            
            <Button variant="ghost" size="lg" onClick={() => {
            window.location.href = '/scan';
            setMobileMenuOpen(false);
          }} className="justify-start gap-3 h-12 text-base">
              <ScanLine className="h-5 w-5" />
              Scan QR Code
            </Button>

            {user && <>
                <div className="h-px bg-border my-2"></div>
                
                <Button variant="ghost" size="lg" onClick={() => {
              window.location.href = '/profile';
              setMobileMenuOpen(false);
            }} className="justify-start gap-3 h-12 text-base">
                  <User className="h-5 w-5" />
                  Profile
                </Button>
                
                <Button variant="ghost" size="lg" onClick={() => {
              signOut();
              setMobileMenuOpen(false);
            }} className="justify-start gap-3 h-12 text-base text-destructive hover:text-destructive">
                  <LogOut className="h-5 w-5" />
                  Sign Out
                </Button>
              </>}
            
            {!user && <>
                <div className="h-px bg-border my-2"></div>
                
                <Button size="lg" onClick={() => {
              window.location.href = '/auth';
              setMobileMenuOpen(false);
            }} className="justify-center gap-3 h-12 text-base">
                  <User className="h-5 w-5" />
                  Sign In
                </Button>
              </>}
          </nav>
        </DrawerContent>
      </Drawer>
      
      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-12 sm:py-16 md:py-24">
        {/* Premium Hero Section with Clean Modern Design */}
        <ScrollReveal direction="fade" duration={0.8}>
          <div className="text-center mb-16 sm:mb-24 md:mb-32 space-y-8 sm:space-y-12 md:space-y-16 max-w-7xl mx-auto relative z-10">
            
            {/* Premium Trust Badge */}
            <div className="inline-flex items-center gap-2 sm:gap-4 px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-card/90 backdrop-blur-xl border border-border/50 shadow-card hover:shadow-lg transition-all duration-500 hover:scale-105">
              <span className="relative flex h-2 w-2 sm:h-3 sm:w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 sm:h-3 sm:w-3 bg-success"></span>
              </span>
              <span className="text-xs sm:text-sm font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                <span className="hidden xs:inline">🔐 Bank-Level Security • ⚡ Instant Transfer • 🌐 Global CDN</span>
                <span className="xs:hidden">🔐 Secure • ⚡ Fast • 🌐 Global</span>
              </span>
            </div>
            
            {/* Premium Headline with Clean Typography */}
            <h2 className="text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black tracking-tight px-2 leading-[0.95]">
              <span className="block bg-clip-text text-transparent bg-gradient-to-br from-foreground via-foreground to-foreground/70">
                Share Files
              </span>
              <span className="block mt-2 sm:mt-3 bg-clip-text text-transparent bg-gradient-hero animate-gradient-x bg-[length:200%_auto] text-3xl xs:text-4xl sm:text-5xl md:text-6xl">
                Securely
              </span>
            </h2>
            
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-5xl mx-auto px-4 leading-relaxed font-medium">
              Enterprise-grade file sharing with{' '}
              <span className="font-extrabold text-foreground">end-to-end encryption</span>.
              <span className="block mt-2 sm:mt-3 text-sm sm:text-base md:text-lg">
                No signup • Up to <span className="text-primary font-black text-lg sm:text-xl md:text-2xl">1GB</span> • Auto-delete
              </span>
            </p>

            {/* Clean Feature Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 md:gap-4 pt-4 sm:pt-6 px-2">
              <Badge variant="secondary" className="text-xs sm:text-sm md:text-base px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 shadow-card hover:shadow-hover transition-all duration-500 hover:scale-105 border border-border/40 backdrop-blur-sm bg-card/80">
                <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 mr-1.5 sm:mr-2 text-primary" />
                <span className="hidden xs:inline">Military-Grade Encryption</span>
                <span className="xs:hidden">Encrypted</span>
              </Badge>
              <Badge variant="secondary" className="text-xs sm:text-sm md:text-base px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 shadow-card hover:shadow-hover transition-all duration-500 hover:scale-105 border border-border/40 backdrop-blur-sm bg-card/80">
                <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 mr-1.5 sm:mr-2 text-success" />
                <span className="hidden xs:inline">Lightning Fast</span>
                <span className="xs:hidden">Fast</span>
              </Badge>
              <Badge variant="secondary" className="text-xs sm:text-sm md:text-base px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 shadow-card hover:shadow-hover transition-all duration-500 hover:scale-105 border border-border/40 backdrop-blur-sm bg-card/80">
                <Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 mr-1.5 sm:mr-2 text-warning" />
                <span className="hidden xs:inline">Password Protected</span>
                <span className="xs:hidden">Protected</span>
              </Badge>
            </div>
          </div>
        </ScrollReveal>
        
        {/* Premium Upload Section with Glass Design */}
        <ScrollReveal direction="up" delay={100}>
          <div id="upload-section" className="mb-16 sm:mb-24 md:mb-36 scroll-mt-20 relative z-10 opacity-100">
            
            <Card className="relative border border-border/40 shadow-premium bg-card/95 backdrop-blur-xl overflow-hidden p-4 sm:p-8 md:p-12 lg:p-16 xl:p-20">
              <div className="relative z-10">
                <FileUploadManager config={uploadConfig} callbacks={uploadCallbacks} />
              </div>
            </Card>
          </div>
        </ScrollReveal>

        {/* Clean Statistics Section */}
        <ScrollReveal direction="up" delay={150}>
          <div className="mb-16 sm:mb-24 md:mb-36 relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
              <Card className="relative overflow-hidden border border-border/30 bg-card/95 backdrop-blur-sm">
                <div className="p-4 sm:p-6 md:p-8 text-center relative z-10">
                  <div className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-primary bg-clip-text text-transparent mb-1 sm:mb-2">10M+</div>
                  <div className="text-xs sm:text-sm text-muted-foreground font-medium">Files Shared</div>
                </div>
              </Card>
              
              <Card className="relative overflow-hidden border border-border/30 bg-card/95 backdrop-blur-sm">
                <div className="p-4 sm:p-6 md:p-8 text-center relative z-10">
                  <div className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-success bg-clip-text text-transparent mb-1 sm:mb-2">50K+</div>
                  <div className="text-xs sm:text-sm text-muted-foreground font-medium">Active Users</div>
                </div>
              </Card>
              
              <Card className="relative overflow-hidden border border-border/30 bg-card/95 backdrop-blur-sm">
                <div className="p-4 sm:p-6 md:p-8 text-center relative z-10">
                  <div className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black text-warning mb-1 sm:mb-2">50TB+</div>
                  <div className="text-xs sm:text-sm text-muted-foreground font-medium">Data Transferred</div>
                </div>
              </Card>
              
              <Card className="relative overflow-hidden border border-border/30 bg-card/95 backdrop-blur-sm">
                <div className="p-4 sm:p-6 md:p-8 text-center relative z-10">
                  <div className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black text-primary-glow mb-1 sm:mb-2">99.9%</div>
                  <div className="text-xs sm:text-sm text-muted-foreground font-medium">Uptime</div>
                </div>
              </Card>
            </div>
          </div>
        </ScrollReveal>

        {/* Testimonials Section */}
        <ScrollReveal direction="up" delay={100}>
          <TestimonialsSection />
        </ScrollReveal>

        {/* Clean Modern Features Grid */}
        <ScrollReveal direction="up" delay={100}>
          <div className="mb-28 sm:mb-36 relative z-10">
            <div className="text-center mb-16 max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 text-sm font-bold text-primary">
                <Sparkles className="h-4 w-4" />
                Premium Features
              </div>
              
              <h3 className="text-4xl sm:text-5xl mb-6 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent font-bold font-serif">
                Everything You Need
              </h3>
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
                Professional tools for secure and efficient file sharing
              </p>
            </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <Card className="relative overflow-hidden border border-border/30 bg-card/95 backdrop-blur-sm">
              <div className="p-8 relative z-10">
                <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 border border-primary/20">
                  <Shield className="h-7 w-7 text-primary" />
                </div>
                <h4 className="text-xl font-bold mb-3">
                  Military-Grade Security
                </h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  AES-256 encryption with password protection, expiration dates, and download limits for complete control.
                </p>
              </div>
            </Card>

            <Card className="relative overflow-hidden border border-border/30 bg-card/95 backdrop-blur-sm">
              <div className="p-8 relative z-10">
                <div className="h-14 w-14 rounded-xl bg-success/10 flex items-center justify-center mb-6 border border-success/20">
                  <Zap className="h-7 w-7 text-success" />
                </div>
                <h4 className="text-xl font-bold mb-3">
                  Instant Uploads
                </h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Lightning-fast uploads with resume support. Share files instantly without waiting.
                </p>
              </div>
            </Card>

            <Card className="relative overflow-hidden border border-border/30 bg-card/95 backdrop-blur-sm">
              <div className="p-8 relative z-10">
                <div className="h-14 w-14 rounded-xl bg-warning/10 flex items-center justify-center mb-6 border border-warning/20">
                  <KeyRound className="h-7 w-7 text-warning" />
                </div>
                <h4 className="text-xl font-bold mb-3">
                  PIN Protection
                </h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Share files with unique PIN codes. Track access attempts and maintain complete control.
                </p>
              </div>
            </Card>

            <Card className="relative overflow-hidden border border-border/30 bg-card/95 backdrop-blur-sm">
              <div className="p-8 relative z-10">
                <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 border border-primary/20">
                  <Users className="h-7 w-7 text-primary" />
                </div>
                <h4 className="text-xl font-bold mb-3">
                  Instant Sharing
                </h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Generate shareable links instantly. No email required. Share with anyone, anywhere.
                </p>
              </div>
            </Card>

            <Card className="relative overflow-hidden border border-border/30 bg-card/95 backdrop-blur-sm">
              <div className="p-8 relative z-10">
                <div className="h-14 w-14 rounded-xl bg-success/10 flex items-center justify-center mb-6 border border-success/20">
                  <Clock className="h-7 w-7 text-success" />
                </div>
                <h4 className="text-xl font-bold mb-3">
                  Time-Limited Access
                </h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Set custom expiration dates and download limits. Your files, your rules, your timeline.
                </p>
              </div>
            </Card>

            <Card className="relative overflow-hidden border border-border/30 bg-card/95 backdrop-blur-sm">
              <div className="p-8 relative z-10">
                <div className="h-14 w-14 rounded-xl bg-warning/10 flex items-center justify-center mb-6 border border-warning/20">
                  <Smartphone className="h-7 w-7 text-warning" />
                </div>
                <h4 className="text-xl font-bold mb-3">
                  QR Code Sharing
                </h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Generate instant QR codes for quick mobile access. Perfect for in-person sharing.
                </p>
              </div>
            </Card>
          </div>
        </div>
        </ScrollReveal>

        {/* Trust Indicators Section */}
        <ScrollReveal direction="up" delay={100}>
          <TrustIndicators />
        </ScrollReveal>

        {/* Premium P2P Sharing Section */}
        <ScrollReveal direction="up" delay={100}>
          <div className="mb-24 sm:mb-32 relative z-10">
            <Card className="border border-primary/40 overflow-hidden shadow-premium bg-gradient-to-br from-card to-card/70 backdrop-blur-2xl group hover:shadow-hover hover:border-primary/60 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary-glow/15 to-transparent opacity-50"></div>
              <div className="absolute inset-0 bg-gradient-shimmer opacity-0 group-hover:opacity-100 group-hover:animate-shimmer"></div>
              
              <div className="bg-gradient-to-br from-primary/5 via-primary/2 to-transparent p-12 sm:p-16 lg:p-20 relative z-10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-12 lg:gap-16">
                  <div className="flex-1 space-y-8">
                    <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-primary/25 border border-primary/40 text-sm font-bold text-primary shadow-lg backdrop-blur-sm">
                      <Sparkles className="h-5 w-5 animate-pulse" />
                      Revolutionary Technology
                    </div>
                    
                    <h3 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight">
                      <span className="bg-clip-text text-transparent bg-gradient-hero animate-gradient-x bg-[length:200%_auto]">Peer-to-Peer</span>
                      <br />
                      <span className="text-foreground">File Transfer</span>
                    </h3>
                    
                    <p className="text-muted-foreground text-xl sm:text-2xl leading-relaxed font-medium">
                      Connect directly with nearby devices using cutting-edge WebRTC technology. 
                      Ultra-fast, completely private, and military-grade secure.
                    </p>
                    
                    <div className="flex flex-wrap gap-4 pt-6">
                      <Badge variant="secondary" className="text-base px-5 py-3 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 border border-border/50">
                        <Zap className="h-5 w-5 mr-2 text-success" />
                        No Server Needed
                      </Badge>
                      <Badge variant="secondary" className="text-base px-5 py-3 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 border border-border/50">
                        <Shield className="h-5 w-5 mr-2 text-primary" />
                        End-to-End Encrypted
                      </Badge>
                      <Badge variant="secondary" className="text-base px-5 py-3 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 border border-border/50">
                        <Smartphone className="h-5 w-5 mr-2 text-warning" />
                        Mobile Friendly
                      </Badge>
                    </div>
                  </div>
                  <NearbyShareDialog trigger={<Button size="lg" className="gap-3 shadow-premium hover:shadow-glow transition-all duration-300 px-10 py-7 text-lg font-bold">
                        <Smartphone className="h-6 w-6" />
                        Try P2P Transfer
                      </Button>} />
                </div>
              </div>
            </Card>
          </div>
        </ScrollReveal>

        {/* FAQ Section */}
        <ScrollReveal direction="up" delay={100}>
          <FAQSection />
        </ScrollReveal>

        {/* Premium CTA Section */}
        <ScrollReveal direction="up" delay={100}>
          <div className="text-center max-w-5xl mx-auto relative z-10">
          <Card className="bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/40 overflow-hidden shadow-premium backdrop-blur-2xl group hover:shadow-hover transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-mesh opacity-40"></div>
            <div className="absolute inset-0 bg-gradient-shimmer opacity-0 group-hover:opacity-100 group-hover:animate-shimmer"></div>
            
            <div className="p-12 sm:p-20 space-y-10 relative z-10">
              <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-primary/25 border border-primary/40 text-sm font-bold text-primary shadow-lg backdrop-blur-sm mb-6">
                <Sparkles className="h-5 w-5 animate-pulse" />
                Get Started Today
              </div>
              
              <h3 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight">
                <span className="bg-clip-text text-transparent bg-gradient-hero animate-gradient-x bg-[length:200%_auto]">
                  Ready to Start Sharing?
                </span>
              </h3>
              
              <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-medium">
                Join <span className="font-extrabold text-primary text-2xl">500,000+</span> users who trust FileShare Pro for secure file sharing.
                <span className="block mt-3">No credit card required. Start for free.</span>
              </p>
              
              <div className="flex flex-col sm:flex-row gap-5 justify-center pt-8">
                {!user && <Button size="lg" onClick={() => window.location.href = '/auth'} className="gap-3 px-10 py-7 text-lg font-bold shadow-premium hover:shadow-glow transition-all duration-300 hover:scale-105">
                    <User className="h-6 w-6" />
                    Create Free Account
                  </Button>}
                {user && <Button size="lg" onClick={() => window.location.href = '/dashboard'} className="gap-3 px-10 py-7 text-lg font-bold shadow-premium hover:shadow-glow transition-all duration-300 hover:scale-105">
                    <User className="h-6 w-6" />
                    Go to Dashboard
                  </Button>}
                <Button size="lg" variant="outline" onClick={() => window.scrollTo({
                  top: 0,
                  behavior: 'smooth'
                })} className="px-10 py-7 text-lg font-bold border-2 border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all duration-300 hover:scale-105">
                  Start Uploading
                </Button>
              </div>
            </div>
          </Card>
        </div>
        </ScrollReveal>
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
              <Button variant="ghost" size="sm" onClick={() => window.location.href = '/loading-demo'} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                <Sparkles className="h-4 w-4 mr-2" />
                Made with ❤️ by PAVAN A      
              </Button>
              <p className="text-sm text-muted-foreground">
                © 2025 FileShare Pro. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      <ScrollToTop />
    </div>;
};
export default Index;