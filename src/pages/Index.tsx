import { lazy, Suspense, useState } from 'react';
import { Upload, Shield, Zap, Users, Smartphone, KeyRound, LogOut, User, Sparkles, Lock, Clock, ScanLine, Menu, X, Crown, Heart, ArrowRight, Globe, Star, HelpCircle, CheckCircle2, FileArchive } from 'lucide-react';
import heroCloud from '@/assets/hero-3d-cloud.png';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { ScrollToTop } from '@/components/ui/scroll-to-top';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { LiveActivityFeed } from '@/components/ui/live-activity-feed';
import { useAuth } from '@/contexts/AuthContext';
import ScrollReveal from '@/components/animations/ScrollReveal';
import { motion } from 'framer-motion';
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";

// Lazy load heavy below-the-fold components
const FileUploadManager = lazy(() => import('@/components/upload/FileUploadManager').then(m => ({ default: m.FileUploadManager })));
const NearbyShareDialog = lazy(() => import('@/components/nearbyShare/NearbyShareDialog'));
const TestimonialsSection = lazy(() => import('@/components/testimonials/TestimonialsSection'));
const FAQSection = lazy(() => import('@/components/faq/FAQSection'));
const TrustIndicators = lazy(() => import('@/components/trust/TrustIndicators'));
const HowItWorks = lazy(() => import('@/components/landing/HowItWorks').then(m => ({ default: m.HowItWorks })));
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
      <header className="sticky top-0 z-50 w-full border-b border-border/20 bg-background/70 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/50 shadow-[0_1px_3px_hsl(var(--foreground)/0.04)]">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
          <div className="flex h-16 sm:h-18 items-center justify-between gap-3">
            {/* Logo & Branding */}
            <div className="flex items-center gap-3 sm:gap-4 cursor-pointer group flex-shrink-0" onClick={() => window.location.href = '/'}>
              <div className="relative h-10 w-10 sm:h-11 sm:w-11 rounded-2xl bg-gradient-primary shadow-lg flex items-center justify-center transition-all duration-500 group-hover:shadow-[0_0_24px_hsl(var(--primary)/0.4)] group-hover:scale-110">
                <Upload className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground transition-transform duration-500 group-hover:rotate-[-8deg]" />
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
              <Button variant="ghost" size="sm" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })} className="gap-2 h-10 px-4 hover:bg-primary/10 hover:text-primary transition-all">
                <span className="text-sm font-medium">How It Works</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' })} className="gap-2 h-10 px-4 hover:bg-primary/10 hover:text-primary transition-all">
                <span className="text-sm font-medium">Testimonials</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' })} className="gap-2 h-10 px-4 hover:bg-primary/10 hover:text-primary transition-all">
                <span className="text-sm font-medium">FAQ</span>
              </Button>
              
              <div className="h-6 w-px bg-border mx-1"></div>
              
              <Button variant="ghost" size="sm" onClick={() => window.location.href = '/pricing'} className="gap-2 h-10 px-4 hover:bg-primary/10 hover:text-primary transition-all">
                <Crown className="h-4 w-4" />
                <span className="text-sm font-medium">Pricing</span>
              </Button>
              
              <Button variant="ghost" size="sm" onClick={() => window.location.href = '/support'} className="gap-2 h-10 px-4 hover:bg-pink-500/10 hover:text-pink-500 transition-all">
                <Heart className="h-4 w-4" />
                <span className="text-sm font-medium">Support Us</span>
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
              <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(true)} className="h-10 w-10 p-0" aria-label="Open menu">
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
            document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
            setMobileMenuOpen(false);
          }} className="justify-start gap-3 h-12 text-base">
              <ArrowRight className="h-5 w-5" />
              How It Works
            </Button>
            <Button variant="ghost" size="lg" onClick={() => {
            document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' });
            setMobileMenuOpen(false);
          }} className="justify-start gap-3 h-12 text-base">
              <Star className="h-5 w-5" />
              Testimonials
            </Button>
            <Button variant="ghost" size="lg" onClick={() => {
            document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' });
            setMobileMenuOpen(false);
          }} className="justify-start gap-3 h-12 text-base">
              <HelpCircle className="h-5 w-5" />
              FAQ
            </Button>
            
            <div className="h-px bg-border my-2"></div>
            
            <Button variant="ghost" size="lg" onClick={() => {
            window.location.href = '/pricing';
            setMobileMenuOpen(false);
          }} className="justify-start gap-3 h-12 text-base">
              <Crown className="h-5 w-5" />
              Pricing
            </Button>
            
            <Button variant="ghost" size="lg" onClick={() => {
            window.location.href = '/support';
            setMobileMenuOpen(false);
          }} className="justify-start gap-3 h-12 text-base text-pink-500 hover:text-pink-500">
              <Heart className="h-5 w-5" />
              Support Us ❤️
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
        {/* Premium Split Hero Section */}
        <section className="relative mb-16 sm:mb-24 md:mb-32 z-10">
          {/* Ambient gradient orbs */}
          <div className="pointer-events-none absolute -top-20 -left-20 w-[420px] h-[420px] rounded-full bg-primary/20 blur-[120px] opacity-70" aria-hidden />
          <div className="pointer-events-none absolute top-40 -right-24 w-[460px] h-[460px] rounded-full bg-primary-glow/20 blur-[130px] opacity-60" aria-hidden />

          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center animate-fade-in">
            {/* Left: Copy */}
            <div className="space-y-7 sm:space-y-8 text-left">
              {/* Trust badge */}
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-card/60 backdrop-blur-xl border border-border/60 shadow-card">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                </span>
                <span className="text-xs sm:text-sm font-semibold text-foreground/90 tracking-wide">
                  Trusted by 10,000+ teams worldwide
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-black tracking-tight leading-[0.95]">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary-glow to-primary bg-[length:200%_auto] animate-gradient-x">
                  Share
                </span>{' '}
                <span className="text-foreground">Files</span>
                <span className="block mt-2 text-foreground">Without Limits</span>
              </h1>

              <p className="text-lg sm:text-xl text-muted-foreground max-w-xl leading-relaxed font-medium">
                Fast, secure and effortless file sharing for individuals and teams — end-to-end encrypted, no signup required.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <Button
                  size="lg"
                  onClick={() => document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="group h-14 px-7 rounded-full bg-gradient-to-r from-primary to-primary-glow hover:shadow-lg hover:scale-[1.02] transition-all text-base font-bold"
                >
                  Start Sharing Now
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                  className="h-14 px-7 rounded-full bg-card/60 backdrop-blur-xl border-border/60 hover:bg-card/80 text-base font-bold"
                >
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              {/* Feature row */}
              <div className="grid grid-cols-3 gap-4 sm:gap-6 pt-4 max-w-lg">
                {[
                  { icon: Lock, label: 'End-to-end encrypted', color: 'text-primary', bg: 'bg-primary/10' },
                  { icon: Zap, label: 'Blazing fast transfer', color: 'text-warning', bg: 'bg-warning/10' },
                  { icon: Users, label: 'Share with anyone', color: 'text-success', bg: 'bg-success/10' },
                ].map((f, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className={`h-9 w-9 rounded-xl ${f.bg} flex items-center justify-center flex-shrink-0 border border-border/40`}>
                      <f.icon className={`h-4.5 w-4.5 ${f.color}`} />
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-foreground/85 leading-tight pt-1">{f.label}</span>
                  </div>
                ))}
              </div>

              {/* Social proof */}
              <div className="flex items-center gap-3 pt-2">
                <div className="flex -space-x-2.5">
                  {['from-primary to-primary-glow', 'from-success to-emerald-400', 'from-warning to-amber-400', 'from-pink-500 to-rose-400'].map((g, i) => (
                    <div key={i} className={`h-9 w-9 rounded-full bg-gradient-to-br ${g} border-2 border-background flex items-center justify-center text-xs font-black text-white shadow-md`}>
                      {['A','M','J','S'][i]}
                    </div>
                  ))}
                </div>
                <div className="text-xs sm:text-sm">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-warning text-warning" />
                    ))}
                  </div>
                  <span className="text-muted-foreground font-medium">Trusted by 10K+ users worldwide</span>
                </div>
              </div>
            </div>

            {/* Right: 3D visual + floating upload card */}
            <div className="relative flex items-center justify-center min-h-[420px] lg:min-h-[560px]">
              {/* Glow backdrop */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[75%] h-[75%] rounded-full bg-gradient-to-br from-primary/10 via-primary-glow/5 to-transparent blur-3xl" />
              </div>

              {/* 3D Cloud illustration */}
              <motion.img
                src={heroCloud}
                alt="Cloud file sharing illustration"
                width={1024}
                height={1024}
                className="relative z-10 w-full max-w-md lg:max-w-lg drop-shadow-[0_15px_30px_hsl(var(--primary)/0.15)]"
                animate={{ y: [0, -14, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              />

              {/* Floating upload progress card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="absolute bottom-2 sm:bottom-6 left-2 right-2 sm:left-6 sm:right-6 z-20"
              >
                <div className="rounded-2xl bg-card/85 backdrop-blur-2xl border border-border/60 shadow-premium p-4 sm:p-5">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center flex-shrink-0 shadow-glow">
                      <FileArchive className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="min-w-0">
                          <div className="text-sm sm:text-base font-bold text-foreground truncate">Project.zip</div>
                          <div className="text-[11px] sm:text-xs text-muted-foreground">2.4 GB • Uploaded</div>
                        </div>
                        <span className="text-xs sm:text-sm font-bold text-primary flex-shrink-0">100%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: '100%' }}
                          transition={{ delay: 0.6, duration: 1.4, ease: 'easeOut' }}
                          className="h-full rounded-full bg-gradient-to-r from-primary to-primary-glow"
                        />
                      </div>
                    </div>
                    <CheckCircle2 className="h-6 w-6 text-success flex-shrink-0" />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        
        {/* Upload Section */}
        <div id="upload-section" className="mb-16 sm:mb-24 md:mb-36 scroll-mt-20 relative z-10">
          <Suspense fallback={<div className="h-64 flex items-center justify-center text-muted-foreground">Loading...</div>}>
            <FileUploadManager config={uploadConfig} callbacks={uploadCallbacks} />
          </Suspense>
        </div>

        {/* Clean Statistics Section */}
        <div className="cv-auto">
        <ScrollReveal direction="up" delay={150}>
          <div className="mb-16 sm:mb-24 md:mb-36 relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
              {[
                { value: 10, suffix: 'M+', label: 'Files Shared', gradient: 'from-primary to-primary-glow' },
                { value: 50, suffix: 'K+', label: 'Active Users', gradient: 'from-success to-emerald-400' },
                { value: 50, suffix: 'TB+', label: 'Data Transferred', gradient: 'from-warning to-amber-400' },
                { value: 99.9, suffix: '%', label: 'Uptime', gradient: 'from-primary-glow to-blue-400', decimals: 1 },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -4, scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <Card className="relative overflow-hidden border border-border/30 bg-card/95 backdrop-blur-sm group hover:border-primary/30 transition-all duration-500">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="p-4 sm:p-6 md:p-8 text-center relative z-10">
                      <div className={`text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-1 sm:mb-2`}>
                        <AnimatedCounter end={stat.value} suffix={stat.suffix} duration={2.5} decimals={stat.decimals || 0} />
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground font-medium">{stat.label}</div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </ScrollReveal>
        </div>

        {/* How It Works Section */}
        <div id="how-it-works" className="cv-auto scroll-mt-20">
        <ScrollReveal direction="up" delay={100}>
          <Suspense fallback={<div className="h-32" />}>
            <HowItWorks />
          </Suspense>
        </ScrollReveal>
        </div>

        {/* Testimonials Section */}
        <div id="testimonials" className="cv-auto scroll-mt-20">
        <ScrollReveal direction="up" delay={100}>
          <Suspense fallback={<div className="h-32" />}>
            <TestimonialsSection />
          </Suspense>
        </ScrollReveal>
        </div>

        {/* Clean Modern Features Grid */}
        <div className="cv-auto">
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
            {[
              { icon: Shield, color: 'primary', title: 'Military-Grade Security', desc: 'AES-256 encryption with password protection, expiration dates, and download limits for complete control.' },
              { icon: Zap, color: 'success', title: 'Instant Uploads', desc: 'Lightning-fast uploads with resume support. Share files instantly without waiting.' },
              { icon: KeyRound, color: 'warning', title: 'PIN Protection', desc: 'Share files with unique PIN codes. Track access attempts and maintain complete control.' },
              { icon: Users, color: 'primary', title: 'Instant Sharing', desc: 'Generate shareable links instantly. No email required. Share with anyone, anywhere.' },
              { icon: Clock, color: 'success', title: 'Time-Limited Access', desc: 'Set custom expiration dates and download limits. Your files, your rules, your timeline.' },
              { icon: Smartphone, color: 'warning', title: 'QR Code Sharing', desc: 'Generate instant QR codes for quick mobile access. Perfect for in-person sharing.' },
            ].map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -6 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Card className="relative overflow-hidden border border-border/30 bg-card/95 backdrop-blur-sm group hover:border-primary/30 transition-all duration-500 h-full">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="p-8 relative z-10">
                    <div className={`h-14 w-14 rounded-2xl bg-${feature.color}/10 flex items-center justify-center mb-6 border border-${feature.color}/20 transition-all duration-500 group-hover:scale-110 group-hover:shadow-[0_0_24px_hsl(var(--${feature.color})/0.2)]`}>
                      <feature.icon className={`h-7 w-7 text-${feature.color} transition-transform duration-500 group-hover:scale-110`} />
                    </div>
                    <div className="text-xl font-bold mb-3 text-foreground">
                      {feature.title}
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
        </ScrollReveal>
        </div>

        {/* Trust Indicators Section */}
        <div className="cv-auto">
        <ScrollReveal direction="up" delay={100}>
          <Suspense fallback={<div className="h-32" />}>
            <TrustIndicators />
          </Suspense>
        </ScrollReveal>
        </div>

        {/* Premium P2P Sharing Section */}
        <div className="cv-auto">
        <ScrollReveal direction="up" delay={100}>
          <div className="mb-24 sm:mb-32 relative z-10">
            <Card className="border border-primary/40 overflow-hidden shadow-premium bg-gradient-to-br from-card to-card/70 backdrop-blur-2xl group hover:shadow-hover hover:border-primary/60 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary-glow/15 to-transparent opacity-50"></div>
              <div className="absolute inset-0 bg-gradient-shimmer opacity-0 group-hover:opacity-100 group-hover:animate-shimmer"></div>
              
              <div className="bg-gradient-to-br from-primary/5 via-primary/2 to-transparent p-12 sm:p-16 lg:p-20 relative z-10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-12 lg:gap-16">
                  <div className="flex-1 space-y-8">
                    <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-primary/25 border border-primary/40 text-sm font-bold shadow-lg backdrop-blur-sm text-secondary-foreground">
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
                  <Suspense fallback={null}>
                    <NearbyShareDialog trigger={<Button variant="premium" size="lg" className="gap-3 px-10 py-7 text-lg font-bold">
                          <Smartphone className="h-6 w-6" />
                          Try P2P Transfer
                          <ArrowRight className="h-5 w-5" />
                        </Button>} />
                  </Suspense>
                </div>
              </div>
            </Card>
          </div>
        </ScrollReveal>
        </div>

        {/* FAQ Section */}
        <div id="faq" className="cv-auto scroll-mt-20">
        <ScrollReveal direction="up" delay={100}>
          <Suspense fallback={<div className="h-32" />}>
            <FAQSection />
          </Suspense>
        </ScrollReveal>
        </div>

        {/* Premium CTA Section */}
        <div className="cv-auto">
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
                {!user && <Button variant="premium" size="lg" onClick={() => window.location.href = '/auth'} className="gap-3 px-10 py-7 text-lg font-bold">
                    <User className="h-6 w-6" />
                    Create Free Account
                    <ArrowRight className="h-5 w-5" />
                  </Button>}
                {user && <Button variant="premium" size="lg" onClick={() => window.location.href = '/dashboard'} className="gap-3 px-10 py-7 text-lg font-bold">
                    <User className="h-6 w-6" />
                    Go to Dashboard
                    <ArrowRight className="h-5 w-5" />
                  </Button>}
                <Button size="lg" variant="outline" onClick={() => window.scrollTo({
                  top: 0,
                  behavior: 'smooth'
                })} className="px-10 py-7 text-lg font-bold">
                  Start Uploading
                </Button>
              </div>
            </div>
          </Card>
        </div>
        </ScrollReveal>
        </div>
      </main>

      {/* Premium Footer */}
      <footer className="border-t border-border/20 bg-background/80 backdrop-blur-xl mt-20 sm:mt-24 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="md:col-span-1 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-gradient-primary shadow-lg flex items-center justify-center">
                  <Upload className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-base font-bold text-foreground">FileShare Pro</p>
                  <p className="text-xs text-muted-foreground">Enterprise File Sharing</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The most secure and fastest way to share files across the globe. Trusted by millions.
              </p>
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="h-4 w-4 text-warning fill-warning" />
                ))}
                <span className="text-xs text-muted-foreground ml-2">4.9/5 rating</span>
              </div>
            </div>

            {/* Product links */}
            <div className="space-y-4">
              <p className="text-sm font-semibold text-foreground">Product</p>
              <div className="flex flex-col gap-2.5">
                <Button variant="link" size="sm" className="justify-start p-0 h-auto text-muted-foreground hover:text-primary" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Upload Files</Button>
                <Button variant="link" size="sm" className="justify-start p-0 h-auto text-muted-foreground hover:text-primary" onClick={() => window.location.href = '/pin'}>PIN Access</Button>
                <Button variant="link" size="sm" className="justify-start p-0 h-auto text-muted-foreground hover:text-primary" onClick={() => window.location.href = '/scan'}>QR Scanner</Button>
                <Button variant="link" size="sm" className="justify-start p-0 h-auto text-muted-foreground hover:text-primary" onClick={() => window.location.href = '/pricing'}>Pricing</Button>
              </div>
            </div>

            {/* Company links */}
            <div className="space-y-4">
              <p className="text-sm font-semibold text-foreground">Company</p>
              <div className="flex flex-col gap-2.5">
                <Button variant="link" size="sm" className="justify-start p-0 h-auto text-muted-foreground hover:text-primary" onClick={() => window.location.href = '/contact'}>Contact</Button>
                <Button variant="link" size="sm" className="justify-start p-0 h-auto text-muted-foreground hover:text-primary" onClick={() => window.location.href = '/support'}>Support Us</Button>
                <Button variant="link" size="sm" className="justify-start p-0 h-auto text-muted-foreground hover:text-primary" onClick={() => window.location.href = '/donors'}>Donor Wall</Button>
                <Button variant="link" size="sm" className="justify-start p-0 h-auto text-muted-foreground hover:text-primary" onClick={() => window.open('https://pavan-05.framer.ai/', '_blank')}>About Developer</Button>
              </div>
            </div>

            {/* Security */}
            <div className="space-y-4">
              <p className="text-sm font-semibold text-foreground">Security</p>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4 text-success" />
                  AES-256 Encryption
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Lock className="h-4 w-4 text-success" />
                  Password Protection
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Globe className="h-4 w-4 text-success" />
                  Global CDN
                </div>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-border/20 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">© 2026 FileShare Pro. All rights reserved.</p>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => window.open('https://pavan-05.framer.ai/', '_blank')} className="text-xs text-muted-foreground hover:text-primary">
                <Sparkles className="h-3 w-3 mr-1" />
                Made with ❤️ by PAVAN A
              </Button>
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      <ScrollToTop />

      {/* Live Activity Feed */}
      <LiveActivityFeed />
    </div>;
};
export default Index;