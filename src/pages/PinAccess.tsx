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
    <div className="min-h-screen bg-gradient-to-br from-background via-background/98 to-background relative overflow-hidden">
      {/* Professional Background System */}
      <div className="absolute inset-0">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/5" />
        
        {/* Subtle accent gradients */}
        <div className="absolute inset-0 bg-gradient-to-tl from-primary/3 via-transparent to-accent/2" />
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-primary/2 to-transparent" />
        
        {/* Floating orbs for depth */}
        <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-primary/8 rounded-full blur-3xl animate-float opacity-60" />
        <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-accent/6 rounded-full blur-3xl animate-float opacity-50" style={{ animationDelay: '2s' }} />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,hsl(var(--muted))_1px,transparent_0)] bg-[size:32px_32px] opacity-[0.02]" />
      </div>
      
      {/* Professional Header Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Button 
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-0.5 transition-transform" />
            Back to Upload
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <KeyRound className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-foreground">PIN Access</span>
          </div>
          
          <ThemeToggle />
        </div>
      </div>
      
      <div className="relative z-10 container mx-auto px-6 py-24 max-w-3xl">
        {/* Professional Header Section */}
        <div className="mb-16 text-center">
          <div className="space-y-6">
            {/* Hero Icon */}
            <div className="relative mx-auto w-24 h-24">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80 rounded-2xl shadow-lg shadow-primary/20" />
              <div className="absolute inset-0.5 bg-gradient-to-tl from-white/20 to-transparent rounded-2xl" />
              <div className="relative w-full h-full flex items-center justify-center rounded-2xl">
                <KeyRound className="w-12 h-12 text-white drop-shadow-sm" />
              </div>
            </div>
            
            {/* Hero Text */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent">
                  Secure File Access
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Enter the 4-digit PIN code to securely access and download the shared file
              </p>
            </div>
            
            {/* Status Indicators */}
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>System Online</span>
              </div>
              <div className="w-px h-4 bg-border" />
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                <span>256-bit Encryption</span>
              </div>
            </div>
          </div>
        </div>

        {!fileInfo ? (
          // Professional PIN Entry Card
          <Card className="relative bg-card/50 backdrop-blur-xl border border-border/50 shadow-2xl shadow-black/5 overflow-hidden group">
            {/* Card Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-background/95" />
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/3 via-transparent to-accent/2" />
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
            
            <div className="relative z-10 p-12">
              {/* Card Header */}
              <div className="text-center mb-10">
                <div className="relative mx-auto w-16 h-16 mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl border border-primary/20" />
                  <div className="relative w-full h-full flex items-center justify-center rounded-xl">
                    <Lock className="w-8 h-8 text-primary" />
                  </div>
                </div>
                
                <h2 className="text-3xl font-bold text-foreground mb-3 tracking-tight">Enter PIN Code</h2>
                <p className="text-muted-foreground text-lg leading-relaxed max-w-md mx-auto">
                  Please enter the 4-digit PIN provided by the sender to access the file
                </p>
              </div>

              <form onSubmit={handlePinSubmit} className="space-y-8">
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
                    className="text-center text-3xl font-mono h-20 tracking-[0.5em] border-2 border-border focus:border-primary/60 bg-background/80 backdrop-blur-sm shadow-inner transition-all duration-200 focus:shadow-lg focus:shadow-primary/10"
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
                    <div className="bg-destructive/5 border border-destructive/20 rounded-xl px-6 py-4 text-center">
                      <p className="text-destructive font-medium">{error}</p>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="max-w-sm mx-auto">
                  <Button 
                    type="submit"
                    disabled={loading || pin.length !== 4}
                    size="lg"
                    className="w-full h-14 bg-gradient-to-r from-primary via-primary to-primary/90 hover:from-primary hover:via-primary/90 hover:to-primary text-white font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100 hover:scale-[1.02] text-lg"
                  >
                    {loading ? (
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Verifying PIN...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <KeyRound className="w-5 h-5" />
                        <span>Access File</span>
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        ) : (
          // Professional File Display Card
          <Card className="relative bg-card/50 backdrop-blur-xl border border-border/50 shadow-2xl shadow-black/5 overflow-hidden">
            {/* Card Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-background/95" />
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/3 via-transparent to-accent/2" />
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
            
            <div className="relative z-10 p-10">
              <div className="grid lg:grid-cols-5 gap-8 items-start">
                {/* Professional File Preview */}
                <div className="lg:col-span-2">
                  <div className="sticky top-8">
                    <FilePreview
                      fileName={fileInfo.original_name}
                      fileType={fileInfo.file_type}
                      storagePath={fileInfo.storage_path}
                      fileSize={fileInfo.file_size}
                    />
                  </div>
                </div>

                {/* Professional File Details */}
                <div className="lg:col-span-3 space-y-8">
                  {/* File Header */}
                  <div className="space-y-4">
                    <h2 className="text-3xl font-bold text-foreground break-words leading-tight tracking-tight">
                      {fileInfo.original_name}
                    </h2>
                    
                    {/* File Metadata Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/30 border border-border/30">
                        <File className="w-4 h-4 text-primary flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Size</p>
                          <p className="text-sm font-semibold text-foreground">{formatFileSize(fileInfo.file_size)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/30 border border-border/30">
                        <div className="w-4 h-4 bg-accent rounded flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Type</p>
                          <p className="text-sm font-semibold text-foreground">{fileInfo.file_type}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/30 border border-border/30">
                        <div className="w-4 h-4 bg-primary/60 rounded flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Uploaded</p>
                          <p className="text-sm font-semibold text-foreground">
                            {new Date(fileInfo.upload_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Status Badges */}
                    <div className="flex flex-wrap gap-3">
                      <Badge className="px-4 py-2 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 text-primary font-semibold">
                        {fileInfo.download_count} downloads
                      </Badge>
                      <Badge className="px-4 py-2 bg-gradient-to-r from-accent/10 to-accent/5 border border-accent/20 text-accent font-semibold">
                        PIN: {pin}
                      </Badge>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-4">
                    <Button 
                      onClick={handleDownload} 
                      disabled={downloading}
                      size="lg"
                      className="w-full h-14 bg-gradient-to-r from-primary via-primary to-primary/90 hover:from-primary hover:via-primary/90 hover:to-primary text-white font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-[1.02] text-lg"
                    >
                      <Download className="w-5 h-5 mr-3" />
                      {downloading ? 'Downloading...' : 'Download File'}
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setFileInfo(null);
                        setPin('');
                        setError(null);
                      }}
                      size="lg"
                      className="w-full h-12 border-2 border-border hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 hover:scale-[1.02] font-semibold"
                    >
                      <KeyRound className="w-5 h-5 mr-3" />
                      Try Another PIN
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
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