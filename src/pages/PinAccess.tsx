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
    <div className="min-h-screen relative overflow-hidden">
      {/* Enhanced Background with Multiple Gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background/95" />
      <div className="absolute inset-0 bg-gradient-to-tl from-primary/5 via-transparent to-accent/10" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-radial from-primary/20 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-radial from-accent/15 to-transparent rounded-full blur-3xl" />
      
      {/* Enhanced Theme Toggle */}
      <div className="fixed top-6 right-6 z-50">
        <div className="backdrop-blur-md bg-background/80 rounded-xl border border-border/50 p-1">
          <ThemeToggle />
        </div>
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-12 max-w-2xl">
        {/* Enhanced Header */}
        <div className="mb-12 text-center">
          <Button 
            variant="ghost"
            onClick={() => navigate('/')}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors duration-200 mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
            Back to Upload
          </Button>
          
          <div className="space-y-4">
            <div className="relative">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 flex items-center justify-center backdrop-blur-sm mb-6">
                <KeyRound className="w-10 h-10 text-primary" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Access with PIN
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              Enter the 4-digit PIN to access and download the shared file
            </p>
          </div>
        </div>

        {!fileInfo ? (
          // PIN Entry Card
          <Card className="relative p-8 backdrop-blur-sm bg-card/95 border-border/50 shadow-lg shadow-primary/5 overflow-hidden group hover:shadow-xl hover:shadow-primary/10 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-50" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-primary/20 to-transparent rounded-full blur-2xl" />
            
            <div className="relative z-10">
              <div className="text-center mb-8">
                <Lock className="w-12 h-12 mx-auto mb-4 text-primary/70" />
                <h2 className="text-2xl font-bold text-foreground mb-2">Enter PIN Code</h2>
                <p className="text-muted-foreground">Please enter the 4-digit PIN provided by the sender</p>
              </div>

              <form onSubmit={handlePinSubmit} className="space-y-6">
                <div className="relative">
                  <Input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={4}
                    value={pin}
                    onChange={handlePinChange}
                    placeholder="0000"
                    className="text-center text-2xl font-mono h-16 tracking-widest border-2 border-border/60 focus:border-primary/50 bg-background/50 backdrop-blur-sm"
                    autoComplete="off"
                  />
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="flex h-full items-center justify-center space-x-2">
                      {[0, 1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                            i < pin.length ? 'bg-primary' : 'bg-muted'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="text-center">
                    <p className="text-destructive text-sm bg-destructive/5 border border-destructive/20 rounded-lg px-4 py-2">
                      {error}
                    </p>
                  </div>
                )}

                <Button 
                  type="submit"
                  disabled={loading || pin.length !== 4}
                  size="lg"
                  className="w-full h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200 hover:scale-105"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Verifying...
                    </div>
                  ) : (
                    <>
                      <KeyRound className="w-5 h-5 mr-2" />
                      Access File
                    </>
                  )}
                </Button>
              </form>
            </div>
          </Card>
        ) : (
          // File Display Card
          <Card className="relative p-8 backdrop-blur-sm bg-card/95 border-border/50 shadow-lg shadow-primary/5 overflow-hidden group hover:shadow-xl hover:shadow-primary/10 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-50" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-primary/20 to-transparent rounded-full blur-2xl" />
            
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row items-start gap-6">
                {/* Enhanced File Preview */}
                <FilePreview
                  fileName={fileInfo.original_name}
                  fileType={fileInfo.file_type}
                  storagePath={fileInfo.storage_path}
                  fileSize={fileInfo.file_size}
                />

                {/* Enhanced File Details */}
                <div className="flex-1 min-w-0 space-y-6">
                  <div className="space-y-3">
                    <h2 className="text-2xl font-bold text-foreground break-words leading-tight">
                      {fileInfo.original_name}
                    </h2>
                    
                    <div className="flex flex-wrap gap-4 text-muted-foreground">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50">
                        <span className="text-sm font-medium">{formatFileSize(fileInfo.file_size)}</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50">
                        <span className="text-sm font-medium">{fileInfo.file_type}</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50">
                        <span className="text-sm font-medium">
                          {new Date(fileInfo.upload_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Badge 
                        variant="secondary" 
                        className="px-4 py-2 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20 text-foreground font-medium"
                      >
                        {fileInfo.download_count} downloads
                      </Badge>
                      <Badge 
                        variant="secondary" 
                        className="px-4 py-2 bg-gradient-to-r from-accent/10 to-primary/10 border-accent/20 text-foreground font-medium"
                      >
                        PIN: {pin}
                      </Badge>
                    </div>
                  </div>

                  {/* Enhanced Action Button */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button 
                      onClick={handleDownload} 
                      disabled={downloading}
                      size="lg"
                      className="flex-1 sm:flex-none h-12 px-8 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200 hover:scale-105"
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
                      className="flex-1 sm:flex-none h-12 px-8 border-2 border-border/60 hover:border-primary/30 hover:bg-primary/5 backdrop-blur-sm transition-all duration-200 hover:scale-105 font-semibold"
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

        {/* Enhanced Info Card */}
        <Card className="mt-8 p-8 backdrop-blur-sm bg-card/95 border-border/50 shadow-lg shadow-accent/5 hover:shadow-xl hover:shadow-accent/10 transition-all duration-300">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center">
                <Lock className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground">PIN-Based File Sharing</h3>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-muted/30 to-muted/10 border border-border/30">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <p>Each file gets a unique 4-digit PIN for secure access</p>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-muted/30 to-muted/10 border border-border/30">
                <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                <p>PIN codes are automatically generated and collision-safe</p>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-muted/30 to-muted/10 border border-border/30">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <p>Download activity is tracked and monitored</p>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-muted/30 to-muted/10 border border-border/30">
                <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                <p>No account required for accessing shared files</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PinAccess;