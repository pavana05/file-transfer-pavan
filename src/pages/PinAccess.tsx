import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, File, ArrowLeft, Lock, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { formatFileSize } from '@/lib/file-utils';
import { UploadService } from '@/services/uploadService';
import { useToast } from '@/hooks/use-toast';
import FilePreview from '@/components/filePreview/FilePreview';

interface FileInfo {
  id: string;
  filename: string;
  original_name: string;
  file_size: number;
  file_type: string;
  storage_path: string;
  share_token: string;
  upload_date: string;
  download_count: number;
}

const PinAccess = () => {
  const navigate = useNavigate();
  const [pin, setPin] = useState('');
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin || pin.length !== 4) {
      setError('Please enter a 4-digit PIN');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const info = await UploadService.getFileInfoByPin(pin);
      setFileInfo(info);
    } catch (err) {
      setError('Invalid PIN or file not found');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!fileInfo) return;

    setDownloading(true);
    try {
      const url = await UploadService.getFileUrl(fileInfo.storage_path);
      
      // Increment download count
      await UploadService.incrementDownloadCount(fileInfo.share_token);
      
      // Enhanced direct download with better compatibility
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch file');
      }
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileInfo.original_name;
      link.setAttribute('download', fileInfo.original_name);
      
      // Better cross-browser support
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      // Update download count in UI
      setFileInfo(prev => prev ? { ...prev, download_count: prev.download_count + 1 } : null);

      toast({
        title: "Download completed",
        description: "File has been downloaded to your system.",
      });
    } catch (err) {
      toast({
        title: "Download failed",
        description: "Unable to download the file. Please try again.",
        variant: "destructive"
      });
    } finally {
      setDownloading(false);
    }
  };

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 4);
    setPin(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/5 relative overflow-hidden">
      {/* Professional Background System */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/5" />
        <div className="absolute inset-0 bg-gradient-to-tl from-primary/3 via-transparent to-accent/2" />
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-primary/2 to-transparent" />
        
        {/* Responsive floating orbs */}
        <div className="absolute top-1/4 right-1/4 w-48 h-48 sm:w-64 sm:h-64 lg:w-72 lg:h-72 bg-primary/8 rounded-full blur-3xl animate-float opacity-60" />
        <div className="absolute bottom-1/3 left-1/4 w-40 h-40 sm:w-56 sm:h-56 lg:w-64 lg:h-64 bg-accent/6 rounded-full blur-3xl animate-float opacity-50" style={{ animationDelay: '2s' }} />
        
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,hsl(var(--muted))_1px,transparent_0)] bg-[size:32px_32px] opacity-[0.02]" />
      </div>
      
      {/* Professional Header Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between">
          <Button 
            variant="ghost"
            onClick={() => navigate('/')}
            size="sm"
            className="text-muted-foreground hover:text-foreground transition-colors group -ml-2 sm:ml-0"
          >
            <ArrowLeft className="w-4 h-4 mr-1 sm:mr-2 group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline">Back to Upload</span>
            <span className="sm:hidden">Back</span>
          </Button>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <KeyRound className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            </div>
            <span className="font-semibold text-foreground text-sm sm:text-base">PIN Access</span>
          </div>
          
          <ThemeToggle />
        </div>
      </div>
      
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-28 max-w-7xl">
        {/* Professional Header Section */}
        <div className="mb-10 sm:mb-14 lg:mb-18 text-center">
          <div className="space-y-5 sm:space-y-6 lg:space-y-8">
            {/* Hero Icon */}
            <div className="relative mx-auto w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80 rounded-2xl shadow-lg shadow-primary/20 animate-fade-in" />
              <div className="absolute inset-0.5 bg-gradient-to-tl from-white/20 to-transparent rounded-2xl" />
              <div className="relative w-full h-full flex items-center justify-center rounded-2xl">
                <KeyRound className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white drop-shadow-sm" />
              </div>
            </div>
            
            {/* Hero Text */}
            <div className="space-y-3 sm:space-y-4 lg:space-y-6">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight px-4">
                <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent">
                  Secure File Access
                </span>
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4 sm:px-6">
                Enter the 4-digit PIN code to securely access and download the shared file
              </p>
            </div>
            
            {/* Status Indicators */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5 text-xs sm:text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>System Online</span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-border" />
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>256-bit Encryption</span>
              </div>
            </div>
          </div>
        </div>

        {!fileInfo ? (
          // Professional PIN Entry Card
          <div className="max-w-2xl mx-auto">
            <Card className="relative bg-card/50 backdrop-blur-xl border border-border/50 shadow-2xl shadow-black/5 overflow-hidden group">
              {/* Card Background Effects */}
              <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-background/95" />
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/3 via-transparent to-accent/2" />
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
              
              <div className="relative z-10 p-6 sm:p-10 lg:p-12">
                {/* Card Header */}
                <div className="text-center mb-8 sm:mb-10">
                  <div className="relative mx-auto w-14 h-14 sm:w-16 sm:h-16 mb-4 sm:mb-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl border border-primary/20" />
                    <div className="relative w-full h-full flex items-center justify-center rounded-xl">
                      <Lock className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
                    </div>
                  </div>
                  
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4 tracking-tight">Enter PIN Code</h2>
                  <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-md mx-auto px-4">
                    Please enter the 4-digit PIN provided by the sender to access the file
                  </p>
                </div>

                <form onSubmit={handlePinSubmit} className="space-y-6 sm:space-y-8">
                  {/* Professional PIN Input */}
                  <div className="relative max-w-xs mx-auto">
                    <Input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={4}
                      value={pin}
                      onChange={handlePinChange}
                      placeholder="0000"
                      className="text-center text-2xl sm:text-3xl font-mono h-16 sm:h-20 tracking-[0.5em] border-2 border-border focus:border-primary/60 bg-background/80 backdrop-blur-sm shadow-inner transition-all duration-200 focus:shadow-lg focus:shadow-primary/10 rounded-xl"
                      autoComplete="off"
                    />
                    
                    {/* PIN Indicators */}
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                      <div className="flex items-center space-x-3">
                        {[0, 1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className={`w-3 h-3 rounded-full transition-all duration-300 ${
                              i < pin.length 
                                ? 'bg-primary shadow-lg shadow-primary/30 scale-110' 
                                : 'bg-muted/50 border border-border'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Error Display */}
                  {error && (
                    <div className="max-w-md mx-auto">
                      <div className="bg-destructive/5 border border-destructive/20 rounded-xl px-4 sm:px-6 py-3 sm:py-4 text-center">
                        <p className="text-destructive font-medium text-sm sm:text-base">{error}</p>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="max-w-sm mx-auto">
                    <Button 
                      type="submit"
                      disabled={loading || pin.length !== 4}
                      size="lg"
                      className="w-full h-12 sm:h-14 bg-gradient-to-r from-primary via-primary to-primary/90 hover:from-primary hover:via-primary/90 hover:to-primary text-white font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100 hover:scale-[1.02] text-base sm:text-lg rounded-xl"
                    >
                      {loading ? (
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Verifying PIN...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <KeyRound className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span>Access File</span>
                        </div>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </Card>
          </div>
        ) : (
          // Professional File Display Card
          <div className="max-w-5xl mx-auto">
            <Card className="relative bg-card/50 backdrop-blur-xl border border-border/50 shadow-2xl shadow-black/5 overflow-hidden">
              {/* Card Background Effects */}
              <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-background/95" />
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/3 via-transparent to-accent/2" />
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
              
              <div className="relative z-10 p-4 sm:p-6 lg:p-8 xl:p-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                  {/* Professional File Preview - Left Side */}
                  <div className="lg:col-span-5 xl:col-span-4">
                    <div className="lg:sticky lg:top-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                      <div className="group relative overflow-hidden rounded-2xl border-2 border-border/50 bg-gradient-to-br from-muted/20 to-muted/5 p-1 transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                        <div className="relative rounded-xl overflow-hidden bg-background">
                          <FilePreview
                            fileName={fileInfo.original_name}
                            fileType={fileInfo.file_type}
                            storagePath={fileInfo.storage_path}
                            fileSize={fileInfo.file_size}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Professional File Details - Right Side */}
                  <div className="lg:col-span-7 xl:col-span-8 space-y-6 lg:space-y-8">
                    {/* File Header */}
                    <div className="space-y-5 lg:space-y-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                      <div className="flex items-start gap-4">
                        <div className="relative flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 animate-scale-in">
                          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/80 rounded-2xl shadow-lg shadow-primary/30 transition-transform duration-300 hover:scale-110" />
                          <div className="relative w-full h-full flex items-center justify-center rounded-2xl">
                            <File className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0 pt-1">
                          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground break-words leading-tight tracking-tight mb-2">
                            {fileInfo.original_name}
                          </h2>
                          <div className="flex flex-wrap gap-2 mt-3">
                            <Badge className="group px-4 py-2 text-xs sm:text-sm bg-gradient-to-r from-primary/15 to-primary/5 border border-primary/30 text-primary font-bold transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:scale-105">
                              <Download className="w-3.5 h-3.5 mr-1.5 transition-transform duration-300 group-hover:scale-110" />
                              {fileInfo.download_count} downloads
                            </Badge>
                            <Badge className="group px-4 py-2 text-xs sm:text-sm bg-gradient-to-r from-accent/15 to-accent/5 border border-accent/30 text-accent font-bold transition-all duration-300 hover:shadow-lg hover:shadow-accent/20 hover:scale-105">
                              <KeyRound className="w-3.5 h-3.5 mr-1.5 transition-transform duration-300 group-hover:rotate-12" />
                              PIN: {pin}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                      
                    {/* File Metadata Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                      <div className="group relative overflow-hidden flex items-center gap-4 px-5 py-5 rounded-xl bg-gradient-to-br from-muted/40 to-muted/20 border border-border/40 transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                        <div className="relative flex-shrink-0 w-11 h-11 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                          <File className="w-6 h-6 text-primary" />
                        </div>
                        <div className="relative min-w-0">
                          <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1">File Size</p>
                          <p className="text-lg font-bold text-foreground truncate">{formatFileSize(fileInfo.file_size)}</p>
                        </div>
                      </div>
                      
                      <div className="group relative overflow-hidden flex items-center gap-4 px-5 py-5 rounded-xl bg-gradient-to-br from-muted/40 to-muted/20 border border-border/40 transition-all duration-300 hover:border-accent/40 hover:shadow-lg hover:shadow-accent/10 hover:-translate-y-0.5">
                        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                        <div className="relative flex-shrink-0 w-11 h-11 bg-gradient-to-br from-accent/20 to-accent/10 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                          <div className="w-6 h-6 bg-accent rounded" />
                        </div>
                        <div className="relative min-w-0">
                          <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1">File Type</p>
                          <p className="text-lg font-bold text-foreground truncate">{fileInfo.file_type}</p>
                        </div>
                      </div>
                      
                      <div className="group relative overflow-hidden flex items-center gap-4 px-5 py-5 rounded-xl bg-gradient-to-br from-muted/40 to-muted/20 border border-border/40 transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                        <div className="relative flex-shrink-0 w-11 h-11 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                          <div className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse" />
                        </div>
                        <div className="relative min-w-0">
                          <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1">Uploaded</p>
                          <p className="text-lg font-bold text-foreground truncate">
                            {new Date(fileInfo.upload_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                      <Button 
                        onClick={handleDownload} 
                        disabled={downloading}
                        size="lg"
                        className="group relative h-16 bg-gradient-to-r from-primary via-primary to-primary/90 hover:from-primary hover:via-primary/90 hover:to-primary text-white font-bold shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] text-lg rounded-xl overflow-hidden sm:col-span-2"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                        <Download className="relative w-6 h-6 mr-3 transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-0.5" />
                        <span className="relative">{downloading ? 'Downloading...' : 'Download File'}</span>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setFileInfo(null);
                          setPin('');
                          setError(null);
                        }}
                        size="lg"
                        className="group h-14 border-2 border-border hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] font-semibold text-base rounded-xl sm:col-span-2"
                      >
                        <KeyRound className="w-5 h-5 mr-3 transition-transform duration-300 group-hover:rotate-12" />
                        Try Another PIN
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Professional Security Information */}
        <Card className="mt-12 bg-card/50 backdrop-blur-xl border border-border/50 shadow-2xl shadow-black/5 overflow-hidden">
          <div className="relative">
            {/* Card Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-background/95" />
            <div className="absolute inset-0 bg-gradient-to-tr from-accent/3 via-transparent to-primary/2" />
            
            <div className="relative z-10 p-10">
              {/* Section Header */}
              <div className="flex items-center gap-4 mb-8">
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent to-accent/80 rounded-xl shadow-lg shadow-accent/20" />
                  <div className="relative w-full h-full flex items-center justify-center rounded-xl">
                    <Lock className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground tracking-tight">Secure PIN System</h3>
                  <p className="text-muted-foreground">Enterprise-grade security for file sharing</p>
                </div>
              </div>
              
              {/* Feature Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="group">
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-muted/20 to-muted/5 border border-border/30 hover:border-primary/20 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                    <div className="w-3 h-3 rounded-full bg-primary mb-4 group-hover:scale-110 transition-transform" />
                    <h4 className="font-semibold text-foreground mb-2">Unique PIN Codes</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Each file receives a collision-safe 4-digit PIN for secure access
                    </p>
                  </div>
                </div>
                
                <div className="group">
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-muted/20 to-muted/5 border border-border/30 hover:border-accent/20 transition-all duration-300 hover:shadow-lg hover:shadow-accent/10">
                    <div className="w-3 h-3 rounded-full bg-accent mb-4 group-hover:scale-110 transition-transform" />
                    <h4 className="font-semibold text-foreground mb-2">Auto Generation</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      PIN codes are automatically generated with collision detection
                    </p>
                  </div>
                </div>
                
                <div className="group">
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-muted/20 to-muted/5 border border-border/30 hover:border-primary/20 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                    <div className="w-3 h-3 rounded-full bg-primary mb-4 group-hover:scale-110 transition-transform" />
                    <h4 className="font-semibold text-foreground mb-2">Activity Tracking</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Download activity is monitored and tracked in real-time
                    </p>
                  </div>
                </div>
                
                <div className="group">
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-muted/20 to-muted/5 border border-border/30 hover:border-accent/20 transition-all duration-300 hover:shadow-lg hover:shadow-accent/10">
                    <div className="w-3 h-3 rounded-full bg-accent mb-4 group-hover:scale-110 transition-transform" />
                    <h4 className="font-semibold text-foreground mb-2">No Registration</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Access shared files without creating accounts or signing up
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PinAccess;