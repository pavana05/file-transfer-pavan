import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, File, ArrowLeft, Lock, KeyRound, FileType, Calendar, HardDrive, Shield, CheckCircle2 } from 'lucide-react';
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
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Enhanced Professional Background System */}
      <div className="absolute inset-0">
        {/* Base gradient layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,hsl(var(--accent)/0.06),transparent_50%)]" />
        
        {/* Animated gradient orbs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-full blur-3xl animate-pulse opacity-40" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-accent/8 via-accent/4 to-transparent rounded-full blur-3xl animate-pulse opacity-30" style={{ animationDuration: '10s', animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-3xl animate-pulse opacity-20" style={{ animationDuration: '12s', animationDelay: '4s' }} />
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.05)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.05)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,hsl(var(--background))_100%)]" />
      </div>
      
      {/* Enhanced Professional Header Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/70 backdrop-blur-2xl border-b border-border/40 shadow-lg shadow-black/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost"
              onClick={() => navigate('/')}
              size="sm"
              className="text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all group -ml-2 sm:ml-0 rounded-lg"
            >
              <ArrowLeft className="w-4 h-4 mr-1 sm:mr-2 group-hover:-translate-x-1 transition-transform" />
              <span className="hidden sm:inline">Back to Upload</span>
              <span className="sm:hidden">Back</span>
            </Button>
            
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative w-8 h-8 sm:w-9 sm:h-9">
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/80 rounded-xl shadow-lg shadow-primary/25" />
                <div className="absolute inset-0.5 bg-gradient-to-tl from-white/20 to-transparent rounded-xl" />
                <div className="relative w-full h-full flex items-center justify-center">
                  <KeyRound className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white drop-shadow" />
                </div>
              </div>
              <span className="font-bold text-foreground text-sm sm:text-base tracking-tight">PIN Access</span>
            </div>
            
            <ThemeToggle />
          </div>
        </div>
      </div>
      
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-32 max-w-7xl">
        {/* Enhanced Professional Header Section */}
        <div className="mb-12 sm:mb-16 lg:mb-20 text-center animate-fade-in">
          <div className="space-y-6 sm:space-y-8 lg:space-y-10">
            {/* Premium Hero Icon */}
            <div className="relative mx-auto w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28">
              <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/70 rounded-3xl shadow-2xl shadow-primary/30 animate-pulse" style={{ animationDuration: '3s' }} />
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-transparent opacity-50 rounded-3xl blur-xl" />
              <div className="absolute inset-1 bg-gradient-to-tl from-white/30 via-white/10 to-transparent rounded-3xl" />
              <div className="relative w-full h-full flex items-center justify-center rounded-3xl backdrop-blur-sm">
                <KeyRound className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 text-white drop-shadow-lg" />
              </div>
            </div>
            
            {/* Enhanced Hero Text */}
            <div className="space-y-4 sm:space-y-5 lg:space-y-6">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight px-4">
                <span className="bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent drop-shadow-sm">
                  Secure File Access
                </span>
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4 sm:px-6 font-medium">
                Enter the 4-digit PIN code to securely access and download the shared file
              </p>
            </div>
            
            {/* Enhanced Status Indicators */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <div className="group flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-gradient-to-br from-muted/40 to-muted/20 border border-border/50 backdrop-blur-sm transition-all duration-300 hover:border-green-500/30 hover:shadow-lg hover:shadow-green-500/10 hover:scale-105">
                <div className="relative">
                  <div className="absolute inset-0 bg-green-500/20 rounded-full blur-md group-hover:blur-lg transition-all" />
                  <CheckCircle2 className="relative w-4 h-4 text-green-500" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-foreground">System Active</span>
              </div>
              
              <div className="hidden sm:block w-px h-5 bg-border/50" />
              
              <div className="group flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-gradient-to-br from-muted/40 to-muted/20 border border-border/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 hover:scale-105">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-md group-hover:blur-lg transition-all" />
                  <Shield className="relative w-4 h-4 text-primary" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-foreground">256-bit Encrypted</span>
              </div>
            </div>
          </div>
        </div>

        {!fileInfo ? (
          // Enhanced Professional PIN Entry Card
          <div className="max-w-2xl mx-auto animate-fade-in">
            <Card className="relative bg-card/30 backdrop-blur-2xl border border-border/40 shadow-2xl shadow-black/10 overflow-hidden group">
              {/* Enhanced Card Background Effects */}
              <div className="absolute inset-0 bg-gradient-to-br from-card/80 via-card/60 to-card/80" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.08),transparent_60%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,hsl(var(--accent)/0.06),transparent_60%)]" />
              <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-gradient-to-tr from-accent/8 to-transparent rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
              
              <div className="relative z-10 p-8 sm:p-12 lg:p-16">
                {/* Enhanced Card Header */}
                <div className="text-center mb-10 sm:mb-12">
                  <div className="relative mx-auto w-16 h-16 sm:w-20 sm:h-20 mb-6 sm:mb-8">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/20 to-primary/10 rounded-2xl border-2 border-primary/20 shadow-lg shadow-primary/20 animate-pulse" style={{ animationDuration: '3s' }} />
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-2xl blur-xl" />
                    <div className="absolute inset-1 bg-gradient-to-tl from-white/10 to-transparent rounded-2xl" />
                    <div className="relative w-full h-full flex items-center justify-center rounded-2xl backdrop-blur-sm">
                      <Lock className="w-8 h-8 sm:w-10 sm:h-10 text-primary drop-shadow-lg" />
                    </div>
                  </div>
                  
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground mb-4 sm:mb-5 tracking-tight">Enter PIN Code</h2>
                  <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-md mx-auto px-4 font-medium">
                    Please enter the 4-digit PIN provided by the sender to access the file
                  </p>
                </div>

                <form onSubmit={handlePinSubmit} className="space-y-8 sm:space-y-10">
                  {/* Enhanced Professional PIN Input */}
                  <div className="relative max-w-sm mx-auto">
                    <div className="relative">
                      <Input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={4}
                        value={pin}
                        onChange={handlePinChange}
                        placeholder="0000"
                        className="text-center text-3xl sm:text-4xl font-mono h-20 sm:h-24 tracking-[0.6em] pl-6 border-2 border-border/60 focus:border-primary/50 bg-gradient-to-br from-background/95 to-background/80 backdrop-blur-sm shadow-xl shadow-black/5 transition-all duration-300 focus:shadow-2xl focus:shadow-primary/20 rounded-2xl ring-offset-4 focus:ring-2 focus:ring-primary/20"
                        autoComplete="off"
                        autoFocus
                      />
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/5 via-transparent to-accent/5 pointer-events-none" />
                    </div>
                    
                    {/* Enhanced PIN Indicators */}
                    <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2">
                      <div className="flex items-center space-x-4">
                        {[0, 1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className={`relative transition-all duration-300 ${
                              i < pin.length ? 'scale-110' : 'scale-100'
                            }`}
                          >
                            <div className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
                              i < pin.length 
                                ? 'bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/40' 
                                : 'bg-muted/40 border-2 border-border/60'
                            }`} />
                            {i < pin.length && (
                              <div className="absolute inset-0 bg-primary/30 rounded-full blur-md animate-pulse" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Error Display */}
                  {error && (
                    <div className="max-w-md mx-auto animate-fade-in">
                      <div className="relative bg-gradient-to-br from-destructive/10 to-destructive/5 border-2 border-destructive/30 rounded-2xl px-6 py-4 text-center backdrop-blur-sm shadow-lg shadow-destructive/10">
                        <p className="text-destructive font-semibold text-sm sm:text-base">{error}</p>
                      </div>
                    </div>
                  )}

                  {/* Enhanced Submit Button */}
                  <div className="max-w-md mx-auto">
                    <Button 
                      type="submit"
                      disabled={loading || pin.length !== 4}
                      size="lg"
                      className="group relative w-full h-14 sm:h-16 bg-gradient-to-r from-primary via-primary to-primary/90 hover:from-primary/95 hover:via-primary hover:to-primary/95 text-white font-bold shadow-2xl shadow-primary/30 hover:shadow-3xl hover:shadow-primary/40 transition-all duration-300 disabled:opacity-40 disabled:hover:scale-100 hover:scale-[1.02] active:scale-[0.98] text-base sm:text-lg rounded-2xl overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                      {loading ? (
                        <div className="relative flex items-center gap-3">
                          <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                          <span className="font-bold">Verifying PIN...</span>
                        </div>
                      ) : (
                        <div className="relative flex items-center gap-3">
                          <KeyRound className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                          <span className="font-bold">Access File</span>
                        </div>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </Card>
          </div>
        ) : (
          // Enhanced Professional File Display Card
          <div className="max-w-6xl mx-auto animate-fade-in">
            <Card className="relative bg-card/30 backdrop-blur-2xl border border-border/40 shadow-2xl shadow-black/10 overflow-hidden">
              {/* Enhanced Card Background Effects */}
              <div className="absolute inset-0 bg-gradient-to-br from-card/80 via-card/60 to-card/80" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,hsl(var(--primary)/0.08),transparent_50%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,hsl(var(--accent)/0.06),transparent_50%)]" />
              <div className="absolute -top-32 -right-32 w-72 h-72 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl" />
              <div className="absolute -bottom-32 -left-32 w-72 h-72 bg-gradient-to-tr from-accent/8 to-transparent rounded-full blur-3xl" />
              
              <div className="relative z-10 p-6 sm:p-8 lg:p-10 xl:p-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
                  {/* Enhanced Professional File Preview - Left Side */}
                  <div className="lg:col-span-5 xl:col-span-4">
                    <div className="lg:sticky lg:top-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                      <div className="group relative overflow-hidden rounded-3xl border-2 border-border/40 bg-gradient-to-br from-muted/30 to-muted/10 p-2 transition-all duration-500 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/20 hover:scale-[1.02]">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative rounded-2xl overflow-hidden bg-background/80 backdrop-blur-sm shadow-inner">
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

                  {/* Enhanced Professional File Details - Right Side */}
                  <div className="lg:col-span-7 xl:col-span-8 space-y-8 lg:space-y-10">
                    {/* Enhanced File Header */}
                    <div className="space-y-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                      <div className="flex items-start gap-5">
                        <div className="relative flex-shrink-0 w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 animate-scale-in">
                          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/70 rounded-3xl shadow-2xl shadow-primary/40 transition-all duration-300 hover:scale-110 hover:rotate-3" />
                          <div className="absolute inset-0 bg-gradient-to-br from-primary to-transparent blur-xl opacity-50" />
                          <div className="absolute inset-1 bg-gradient-to-tl from-white/30 via-white/10 to-transparent rounded-3xl" />
                          <div className="relative w-full h-full flex items-center justify-center rounded-3xl backdrop-blur-sm">
                            <File className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 text-white drop-shadow-lg" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0 pt-1">
                          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-foreground break-words leading-tight tracking-tight mb-4">
                            {fileInfo.original_name}
                          </h2>
                          <div className="flex flex-wrap gap-3">
                            <Badge className="group px-5 py-2.5 text-xs sm:text-sm bg-gradient-to-br from-primary/20 via-primary/15 to-primary/10 border-2 border-primary/30 text-primary font-bold transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 hover:scale-105 hover:border-primary/50 rounded-xl">
                              <Download className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:scale-125 group-hover:-translate-y-0.5" />
                              {fileInfo.download_count} downloads
                            </Badge>
                            <Badge className="group px-5 py-2.5 text-xs sm:text-sm bg-gradient-to-br from-accent/20 via-accent/15 to-accent/10 border-2 border-accent/30 text-accent font-bold transition-all duration-300 hover:shadow-xl hover:shadow-accent/30 hover:scale-105 hover:border-accent/50 rounded-xl">
                              <KeyRound className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:rotate-180" />
                              PIN: {pin}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                      
                    {/* Enhanced File Metadata Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-5 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                      <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 border-2 border-border/40 transition-all duration-500 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1 hover:scale-[1.02]">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative p-5 sm:p-6 flex items-center gap-4">
                          <div className="relative flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary/15 rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
                            <div className="absolute inset-0 bg-primary/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="relative w-full h-full flex items-center justify-center rounded-xl">
                              <HardDrive className="w-6 h-6 text-primary transition-transform duration-300 group-hover:scale-110" />
                            </div>
                          </div>
                          <div className="relative min-w-0 flex-1">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1.5">File Size</p>
                            <p className="text-lg sm:text-xl font-extrabold text-foreground truncate">{formatFileSize(fileInfo.file_size)}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 border-2 border-border/40 transition-all duration-500 hover:border-accent/50 hover:shadow-2xl hover:shadow-accent/20 hover:-translate-y-1 hover:scale-[1.02]">
                        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative p-5 sm:p-6 flex items-center gap-4">
                          <div className="relative flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14">
                            <div className="absolute inset-0 bg-gradient-to-br from-accent/30 to-accent/15 rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
                            <div className="absolute inset-0 bg-accent/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="relative w-full h-full flex items-center justify-center rounded-xl">
                              <FileType className="w-6 h-6 text-accent transition-transform duration-300 group-hover:scale-110" />
                            </div>
                          </div>
                          <div className="relative min-w-0 flex-1">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1.5">File Type</p>
                            <p className="text-lg sm:text-xl font-extrabold text-foreground truncate">{fileInfo.file_type}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 border-2 border-border/40 transition-all duration-500 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1 hover:scale-[1.02]">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative p-5 sm:p-6 flex items-center gap-4">
                          <div className="relative flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary/15 rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
                            <div className="absolute inset-0 bg-primary/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="relative w-full h-full flex items-center justify-center rounded-xl">
                              <Calendar className="w-6 h-6 text-primary transition-transform duration-300 group-hover:scale-110" />
                            </div>
                          </div>
                          <div className="relative min-w-0 flex-1">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1.5">Uploaded</p>
                            <p className="text-lg sm:text-xl font-extrabold text-foreground truncate">
                              {new Date(fileInfo.upload_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Action Buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                      <Button 
                        onClick={handleDownload} 
                        disabled={downloading}
                        size="lg"
                        className="group relative h-16 sm:h-18 bg-gradient-to-r from-primary via-primary to-primary/90 hover:from-primary/95 hover:via-primary hover:to-primary/95 text-white font-extrabold shadow-2xl shadow-primary/40 hover:shadow-3xl hover:shadow-primary/50 transition-all duration-500 hover:scale-[1.03] active:scale-[0.97] text-lg sm:text-xl rounded-2xl overflow-hidden sm:col-span-2"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <Download className="relative w-6 h-6 sm:w-7 sm:h-7 mr-3 transition-transform duration-300 group-hover:scale-125 group-hover:-translate-y-1" />
                        <span className="relative drop-shadow">{downloading ? 'Downloading...' : 'Download File'}</span>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setFileInfo(null);
                          setPin('');
                          setError(null);
                        }}
                        size="lg"
                        className="group h-14 sm:h-16 border-2 border-border/60 hover:border-primary/50 hover:bg-gradient-to-br hover:from-primary/10 hover:to-primary/5 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] font-bold text-base sm:text-lg rounded-2xl sm:col-span-2 backdrop-blur-sm"
                      >
                        <KeyRound className="w-5 h-5 sm:w-6 sm:h-6 mr-3 transition-transform duration-300 group-hover:rotate-180" />
                        Try Another PIN
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Enhanced Professional Security Information */}
        <Card className="mt-16 bg-card/30 backdrop-blur-2xl border border-border/40 shadow-2xl shadow-black/10 overflow-hidden animate-fade-in">
          <div className="relative">
            {/* Enhanced Card Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-card/80 via-card/60 to-card/80" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--accent)/0.08),transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,hsl(var(--primary)/0.06),transparent_60%)]" />
            
            <div className="relative z-10 p-8 sm:p-10 lg:p-12">
              {/* Enhanced Section Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-10 sm:mb-12">
                <div className="relative w-14 h-14 sm:w-16 sm:h-16">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent via-accent to-accent/80 rounded-2xl shadow-2xl shadow-accent/30" />
                  <div className="absolute inset-0 bg-gradient-to-br from-accent to-transparent blur-xl opacity-50" />
                  <div className="absolute inset-1 bg-gradient-to-tl from-white/30 via-white/10 to-transparent rounded-2xl" />
                  <div className="relative w-full h-full flex items-center justify-center rounded-2xl backdrop-blur-sm">
                    <Lock className="w-7 h-7 sm:w-8 sm:h-8 text-white drop-shadow-lg" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight mb-2">Secure PIN System</h3>
                  <p className="text-muted-foreground text-base sm:text-lg font-medium">Enterprise-grade security for file sharing</p>
                </div>
              </div>
              
              {/* Enhanced Feature Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
                <div className="group relative">
                  <div className="relative p-6 lg:p-7 rounded-2xl bg-gradient-to-br from-muted/40 to-muted/20 border-2 border-border/40 hover:border-primary/40 transition-all duration-500 hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-1 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative w-4 h-4 rounded-full bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/30 mb-5 group-hover:scale-125 transition-transform duration-300" />
                    <h4 className="relative font-bold text-foreground mb-3 text-base lg:text-lg">Unique PIN Codes</h4>
                    <p className="relative text-sm text-muted-foreground leading-relaxed">
                      Each file receives a collision-safe 4-digit PIN for secure access
                    </p>
                  </div>
                </div>
                
                <div className="group relative">
                  <div className="relative p-6 lg:p-7 rounded-2xl bg-gradient-to-br from-muted/40 to-muted/20 border-2 border-border/40 hover:border-accent/40 transition-all duration-500 hover:shadow-xl hover:shadow-accent/20 hover:-translate-y-1 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative w-4 h-4 rounded-full bg-gradient-to-br from-accent to-accent/80 shadow-lg shadow-accent/30 mb-5 group-hover:scale-125 transition-transform duration-300" />
                    <h4 className="relative font-bold text-foreground mb-3 text-base lg:text-lg">Auto Generation</h4>
                    <p className="relative text-sm text-muted-foreground leading-relaxed">
                      PIN codes are automatically generated with collision detection
                    </p>
                  </div>
                </div>
                
                <div className="group relative">
                  <div className="relative p-6 lg:p-7 rounded-2xl bg-gradient-to-br from-muted/40 to-muted/20 border-2 border-border/40 hover:border-primary/40 transition-all duration-500 hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-1 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative w-4 h-4 rounded-full bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/30 mb-5 group-hover:scale-125 transition-transform duration-300" />
                    <h4 className="relative font-bold text-foreground mb-3 text-base lg:text-lg">Activity Tracking</h4>
                    <p className="relative text-sm text-muted-foreground leading-relaxed">
                      Download activity is monitored and tracked in real-time
                    </p>
                  </div>
                </div>
                
                <div className="group relative">
                  <div className="relative p-6 lg:p-7 rounded-2xl bg-gradient-to-br from-muted/40 to-muted/20 border-2 border-border/40 hover:border-accent/40 transition-all duration-500 hover:shadow-xl hover:shadow-accent/20 hover:-translate-y-1 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative w-4 h-4 rounded-full bg-gradient-to-br from-accent to-accent/80 shadow-lg shadow-accent/30 mb-5 group-hover:scale-125 transition-transform duration-300" />
                    <h4 className="relative font-bold text-foreground mb-3 text-base lg:text-lg">No Registration</h4>
                    <p className="relative text-sm text-muted-foreground leading-relaxed">
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