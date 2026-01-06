import { FileUploadManager } from '@/components/upload/FileUploadManager';
import { Upload, Shield, Zap, Users, Smartphone, KeyRound, LogOut, User, Lock, Clock, ScanLine, Menu, X, Crown, ArrowRight, CheckCircle2, Globe, Fingerprint } from 'lucide-react';
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
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const uploadConfig = {
    maxFileSize: 1 * 1024 * 1024 * 1024,
    maxFiles: 50,
    acceptedTypes: [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp', 'image/tiff',
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain', 'text/csv', 'application/rtf',
      'text/html', 'text/css', 'text/javascript', 'application/javascript', 'application/json', 'text/xml', 'application/xml', 'text/markdown',
      'video/mp4', 'video/webm', 'video/mov', 'video/avi', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac',
      'application/zip', 'application/x-rar-compressed', 'application/x-tar', 'application/gzip', 'application/x-7z-compressed'
    ],
    allowedExtensions: [
      'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf', 'csv',
      'html', 'htm', 'css', 'js', 'ts', 'jsx', 'tsx', 'json', 'xml', 'py', 'java', 'c', 'cpp', 'md', 'yaml', 'yml',
      'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff', 'ico',
      'mp4', 'webm', 'mov', 'avi', 'mkv', 'mp3', 'wav', 'ogg', 'aac', 'm4a',
      'zip', 'rar', 'tar', 'gz', '7z', 'bz2'
    ],
    enableChunkedUpload: true,
    enableResume: true,
    enablePreview: true,
    autoUpload: false,
    enableDuplicateDetection: true
  };

  const uploadCallbacks = {
    onFileAdd: (files: any[]) => console.log('Files added:', files),
    onUploadComplete: (file: any) => console.log('Upload completed:', file),
    onUploadError: (file: any, error: string) => console.error('Upload error:', file, error)
  };

  const features = [
    {
      icon: Shield,
      title: "End-to-End Encryption",
      description: "Military-grade AES-256 encryption protects your files from upload to download.",
      color: "text-primary"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Global CDN ensures instant uploads and downloads from anywhere in the world.",
      color: "text-success"
    },
    {
      icon: Lock,
      title: "Password Protection",
      description: "Add an extra layer of security with password-protected file sharing.",
      color: "text-warning"
    },
    {
      icon: Clock,
      title: "Auto Expiration",
      description: "Set custom expiration dates. Files automatically delete for added privacy.",
      color: "text-primary"
    },
    {
      icon: Fingerprint,
      title: "PIN Access",
      description: "Share files with unique 6-digit PINs for quick and secure access.",
      color: "text-success"
    },
    {
      icon: Globe,
      title: "No Account Required",
      description: "Start sharing immediately. No signup, no email, no hassle.",
      color: "text-warning"
    }
  ];

  const stats = [
    { value: "10M+", label: "Files Shared" },
    { value: "500K+", label: "Happy Users" },
    { value: "99.9%", label: "Uptime" },
    { value: "256-bit", label: "Encryption" }
  ];

  return (
    <div className="min-h-screen bg-background relative">
      {/* Subtle background gradient */}
      <div className="fixed inset-0 bg-gradient-mesh pointer-events-none" />
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-gradient-radial from-primary/5 via-transparent to-transparent blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-gradient-radial from-success/5 via-transparent to-transparent blur-3xl pointer-events-none" />

      {/* Clean Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.location.href = '/'}>
              <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
                <Upload className="h-4.5 w-4.5 text-primary-foreground" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-foreground">FileShare Pro</h1>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={() => window.location.href = '/pricing'} className="h-9 px-3 text-sm font-medium text-muted-foreground hover:text-foreground">
                Pricing
              </Button>
              <Button variant="ghost" size="sm" onClick={() => window.location.href = '/pin'} className="h-9 px-3 text-sm font-medium text-muted-foreground hover:text-foreground">
                PIN Access
              </Button>
              <Button variant="ghost" size="sm" onClick={() => window.location.href = '/scan'} className="h-9 px-3 text-sm font-medium text-muted-foreground hover:text-foreground">
                Scan QR
              </Button>
              
              <div className="h-4 w-px bg-border mx-2" />
              
              <ThemeToggle />

              {user ? (
                <>
                  <Button variant="ghost" size="sm" onClick={() => window.location.href = '/profile'} className="h-9 px-3">
                    <User className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={signOut} className="h-9 px-3 text-muted-foreground hover:text-foreground">
                    <LogOut className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <Button size="sm" onClick={() => window.location.href = '/auth'} className="h-9 px-4 font-medium">
                  Sign In
                </Button>
              )}
            </nav>

            {/* Mobile Navigation */}
            <div className="flex md:hidden items-center gap-2">
              <ThemeToggle />
              <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(true)} className="h-9 w-9 p-0">
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <Drawer open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="border-b border-border">
            <div className="flex items-center justify-between">
              <DrawerTitle className="flex items-center gap-2.5">
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

          <nav className="flex flex-col p-4 gap-1">
            {[
              { icon: Crown, label: 'Pricing', href: '/pricing' },
              { icon: KeyRound, label: 'PIN Access', href: '/pin' },
              { icon: ScanLine, label: 'Scan QR', href: '/scan' }
            ].map((item) => (
              <Button
                key={item.label}
                variant="ghost"
                size="lg"
                onClick={() => { window.location.href = item.href; setMobileMenuOpen(false); }}
                className="justify-start gap-3 h-12 text-base font-medium"
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Button>
            ))}

            {user && (
              <>
                <div className="h-px bg-border my-2" />
                <Button variant="ghost" size="lg" onClick={() => { window.location.href = '/profile'; setMobileMenuOpen(false); }} className="justify-start gap-3 h-12">
                  <User className="h-5 w-5" />
                  Profile
                </Button>
                <Button variant="ghost" size="lg" onClick={() => { signOut(); setMobileMenuOpen(false); }} className="justify-start gap-3 h-12 text-destructive hover:text-destructive">
                  <LogOut className="h-5 w-5" />
                  Sign Out
                </Button>
              </>
            )}

            {!user && (
              <>
                <div className="h-px bg-border my-2" />
                <Button size="lg" onClick={() => { window.location.href = '/auth'; setMobileMenuOpen(false); }} className="h-12 font-medium">
                  <User className="h-5 w-5 mr-2" />
                  Sign In
                </Button>
              </>
            )}
          </nav>
        </DrawerContent>
      </Drawer>

      {/* Main Content */}
      <main className="relative z-10">
        {/* Hero Section - Clean and Minimal */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 md:pt-28 pb-16 sm:pb-20">
          <ScrollReveal direction="fade" duration={0.6}>
            <div className="max-w-4xl mx-auto text-center space-y-8">
              {/* Status Badge */}
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-success/10 border border-success/20 text-success text-sm font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                </span>
                Trusted by 500,000+ users worldwide
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]">
                <span className="text-foreground">Share files</span>
                <br />
                <span className="bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent">securely & instantly</span>
              </h1>

              {/* Description */}
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Enterprise-grade file sharing with end-to-end encryption. 
                No signup required. Files up to 1GB. Auto-delete after download.
              </p>

              {/* Trust Pills */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                {[
                  { icon: Shield, label: "256-bit Encryption" },
                  { icon: Zap, label: "Instant Transfer" },
                  { icon: Lock, label: "Password Protected" }
                ].map((pill) => (
                  <div key={pill.label} className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/50 text-sm font-medium text-muted-foreground">
                    <pill.icon className="h-4 w-4 text-primary" />
                    {pill.label}
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* Upload Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-20 sm:pb-28">
          <ScrollReveal direction="up" delay={100}>
            <div className="max-w-5xl mx-auto">
              <Card className="border border-border/50 shadow-xl bg-card/95 backdrop-blur-sm overflow-hidden p-4 sm:p-6 md:p-8 lg:p-10">
                <FileUploadManager config={uploadConfig} callbacks={uploadCallbacks} />
              </Card>
            </div>
          </ScrollReveal>
        </section>

        {/* Stats Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-20 sm:pb-28">
          <ScrollReveal direction="up" delay={100}>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <Card key={index} className="p-6 sm:p-8 text-center border border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card transition-colors duration-200">
                  <div className="text-3xl sm:text-4xl font-bold text-foreground mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                </Card>
              ))}
            </div>
          </ScrollReveal>
        </section>

        {/* Testimonials */}
        <ScrollReveal direction="up" delay={100}>
          <TestimonialsSection />
        </ScrollReveal>

        {/* Features Grid */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <ScrollReveal direction="up" delay={100}>
            <div className="max-w-6xl mx-auto">
              {/* Section Header */}
              <div className="text-center mb-12 sm:mb-16">
                <Badge variant="secondary" className="mb-4 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                  Features
                </Badge>
                <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                  Everything you need for secure sharing
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Professional-grade tools designed for privacy and simplicity
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {features.map((feature, index) => (
                  <Card key={index} className="p-6 sm:p-8 border border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card hover:shadow-lg transition-all duration-300 group">
                    <div className={`h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-200`}>
                      <feature.icon className={`h-6 w-6 ${feature.color}`} />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                  </Card>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* Trust Indicators */}
        <ScrollReveal direction="up" delay={100}>
          <TrustIndicators />
        </ScrollReveal>

        {/* P2P Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <ScrollReveal direction="up" delay={100}>
            <Card className="max-w-5xl mx-auto overflow-hidden border border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-transparent">
              <div className="p-8 sm:p-12 lg:p-16">
                <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
                  <div className="flex-1 space-y-6">
                    <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/15">
                      <Smartphone className="h-3.5 w-3.5 mr-1.5" />
                      P2P Transfer
                    </Badge>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                      Direct device-to-device sharing
                    </h2>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      Connect directly with nearby devices using WebRTC technology. 
                      Ultra-fast, completely private, no server in between.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {["No Server", "Encrypted", "Instant"].map((tag) => (
                        <div key={tag} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 text-success" />
                          {tag}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <NearbyShareDialog
                      trigger={
                        <Button size="lg" className="h-14 px-8 text-base font-semibold gap-2 shadow-lg hover:shadow-xl transition-all duration-200">
                          <Smartphone className="h-5 w-5" />
                          Try P2P Transfer
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      }
                    />
                  </div>
                </div>
              </div>
            </Card>
          </ScrollReveal>
        </section>

        {/* FAQ Section */}
        <ScrollReveal direction="up" delay={100}>
          <FAQSection />
        </ScrollReveal>

        {/* CTA Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <ScrollReveal direction="up" delay={100}>
            <Card className="max-w-4xl mx-auto text-center p-8 sm:p-12 lg:p-16 border border-border/50 bg-gradient-to-br from-muted/30 via-transparent to-transparent">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                Ready to start sharing?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
                Join 500,000+ users who trust FileShare Pro for secure file sharing. 
                No credit card required.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {!user ? (
                  <Button size="lg" onClick={() => window.location.href = '/auth'} className="h-12 px-8 text-base font-semibold gap-2">
                    <User className="h-5 w-5" />
                    Create Free Account
                  </Button>
                ) : (
                  <Button size="lg" onClick={() => window.location.href = '/dashboard'} className="h-12 px-8 text-base font-semibold gap-2">
                    Go to Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
                <Button size="lg" variant="outline" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="h-12 px-8 text-base font-medium">
                  Start Uploading
                </Button>
              </div>
            </Card>
          </ScrollReveal>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Upload className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">FileShare Pro</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 FileShare Pro. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      <ScrollToTop />
    </div>
  );
};

export default Index;
