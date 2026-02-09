import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, File, ArrowLeft, Lock, KeyRound, FileType, Calendar, HardDrive, Shield, CheckCircle2, QrCode, Share2, Maximize2, ScanLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { formatFileSize } from '@/lib/file-utils';
import { UploadService } from '@/services/uploadService';
import { useToast } from '@/hooks/use-toast';
import FilePreview from '@/components/filePreview/FilePreview';
import DownloadProgress from '@/components/download/DownloadProgress';
import FileAccessHistory from '@/components/history/FileAccessHistory';
import QRCodeModal from '@/components/pin/QRCodeModal';
import EnhancedFilePreviewModal from '@/components/preview/EnhancedFilePreviewModal';
import SocialShareButtons from '@/components/share/SocialShareButtons';
import RealtimeCollaboration from '@/components/collaboration/RealtimeCollaboration';
import { downloadFileWithProgress, addToAccessHistory, DownloadProgress as IDownloadProgress } from '@/lib/download-utils';
import { motion } from 'framer-motion';

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
  has_password: boolean;
}

const PinAccess = () => {
  const navigate = useNavigate();
  const [pin, setPin] = useState('');
  const [password, setPassword] = useState('');
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [collectionInfo, setCollectionInfo] = useState<any | null>(null);
  const [fileUrl, setFileUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<IDownloadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const { toast } = useToast();

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin || pin.length !== 4) { setError('Please enter a 4-digit PIN'); return; }
    setLoading(true);
    setError(null);
    try {
      const fileResult = await UploadService.getFileInfoByPin(pin);
      if (fileResult) {
        if (fileResult.has_password) { setShowPasswordInput(true); setFileInfo(fileResult); setLoading(false); return; }
        setFileInfo(fileResult);
        setCollectionInfo(null);
        if (fileResult.storage_path) {
          const url = await UploadService.getFileUrl(fileResult.storage_path);
          setFileUrl(url);
        }
        addToAccessHistory(pin, fileResult.original_name, fileResult.file_size, fileResult.file_type);
      } else {
        const collectionResult = await UploadService.getCollectionInfoByPin(pin);
        if (collectionResult) {
          setCollectionInfo(collectionResult);
          setFileInfo(null);
          addToAccessHistory(pin, collectionResult.collection_name, collectionResult.collection_size, 'collection');
          navigate(`/collection/${collectionResult.share_token}`);
          return;
        }
        setError('Invalid PIN or file not found');
      }
    } catch (err) {
      setError('Invalid PIN or file not found');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) { setError('Please enter the password'); return; }
    setLoading(true);
    setError(null);
    try {
      const isValid = await UploadService.validateFilePassword(pin, password);
      if (isValid) {
        setShowPasswordInput(false);
        toast({ title: 'Access granted', description: 'Password verified successfully' });
      } else {
        setError('Incorrect password');
        setPassword('');
      }
    } catch (err) {
      setError('Failed to verify password');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!fileInfo) return;
    setDownloading(true);
    setDownloadProgress(null);
    try {
      const url = await UploadService.getFileUrl(fileInfo.storage_path);
      await UploadService.incrementDownloadCount(fileInfo.share_token);
      await downloadFileWithProgress(url, fileInfo.original_name, (progress) => setDownloadProgress(progress));
      setFileInfo(prev => prev ? { ...prev, download_count: prev.download_count + 1 } : null);
      toast({ title: "Download completed", description: "File downloaded successfully." });
    } catch (err) {
      toast({ title: "Download failed", description: "Unable to download the file. Please try again.", variant: "destructive" });
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
      {downloading && downloadProgress && (
        <DownloadProgress
          fileName={fileInfo?.original_name || ''}
          progress={downloadProgress.progress}
          downloadedBytes={downloadProgress.downloadedBytes}
          totalBytes={downloadProgress.totalBytes}
          speed={downloadProgress.speed}
          timeRemaining={downloadProgress.timeRemaining}
        />
      )}
      
      {/* Subtle background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/3 rounded-full blur-3xl" />
      </div>
      
      {/* Header Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate('/')} size="sm" className="text-muted-foreground hover:text-foreground group -ml-2">
              <ArrowLeft className="w-4 h-4 mr-1.5 group-hover:-translate-x-1 transition-transform" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <KeyRound className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground text-sm">PIN Access</span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-20 sm:py-24 max-w-3xl">
        {/* Hero */}
        <motion.div className="mb-10 text-center" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-primary/10 flex items-center justify-center">
            <KeyRound className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Secure File Access</h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto">
            Enter the 4-digit PIN code to access shared files
          </p>
          <div className="flex items-center justify-center gap-3 mt-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 border border-border/50 text-xs text-muted-foreground">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              Active
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 border border-border/50 text-xs text-muted-foreground">
              <Shield className="w-3 h-3 text-blue-500" />
              Encrypted
            </div>
          </div>
        </motion.div>

        {!fileInfo && !showPasswordInput && <div className="max-w-lg mx-auto mb-6"><FileAccessHistory /></div>}

        {showPasswordInput ? (
          <motion.div className="max-w-lg mx-auto" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-6 sm:p-8 border-border/50">
              <div className="text-center mb-6">
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Lock className="w-7 h-7 text-primary" />
                </div>
                <h2 className="text-xl font-bold mb-1">Password Required</h2>
                <p className="text-sm text-muted-foreground">Enter the password to access this file</p>
              </div>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="h-12 text-center border-border/60"
                  autoFocus
                />
                {error && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-2.5 text-center">
                    <p className="text-destructive text-sm font-medium">{error}</p>
                  </div>
                )}
                <div className="flex gap-2.5">
                  <Button type="button" variant="outline" onClick={() => { setShowPasswordInput(false); setFileInfo(null); setPin(''); setPassword(''); }} className="flex-1 h-11">
                    Back
                  </Button>
                  <Button type="submit" disabled={loading || !password} className="flex-1 h-11">
                    {loading ? 'Verifying...' : 'Verify'}
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        ) : !fileInfo ? (
          <motion.div className="max-w-lg mx-auto" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-6 sm:p-8 border-border/50 bg-card/90 backdrop-blur-sm">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-foreground mb-1">Enter PIN Code</h2>
                <p className="text-sm text-muted-foreground">4-digit PIN from the file sender</p>
              </div>

              <form onSubmit={handlePinSubmit} className="space-y-5">
                <div className="relative max-w-xs mx-auto">
                  <Input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={4}
                    value={pin}
                    onChange={handlePinChange}
                    placeholder="0000"
                    className="text-center text-3xl font-mono h-16 tracking-[0.5em] pl-4 border-border/60 rounded-xl"
                    autoComplete="off"
                    autoFocus
                  />
                  <div className="flex items-center justify-center gap-3 mt-3">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                        i < pin.length ? 'bg-primary scale-110' : 'bg-muted-foreground/20'
                      }`} />
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-2.5 text-center">
                    <p className="text-destructive text-sm font-medium">{error}</p>
                  </div>
                )}

                <div className="space-y-3 max-w-xs mx-auto">
                  <Button type="submit" disabled={loading || pin.length !== 4} size="lg" className="w-full h-12 gap-2">
                    {loading ? (
                      <><div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />Verifying...</>
                    ) : (
                      <><KeyRound className="w-4 h-4" />Access File</>
                    )}
                  </Button>
                  
                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border/50" /></div>
                    <div className="relative flex justify-center text-xs"><span className="bg-card px-3 text-muted-foreground">Or</span></div>
                  </div>

                  <Button type="button" variant="outline" size="lg" onClick={() => window.location.href = '/scan'} className="w-full h-11 gap-2">
                    <ScanLine className="h-4 w-4" />
                    Scan QR Code
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        ) : (
          /* File Display */
          <motion.div className="max-w-3xl mx-auto" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-5 sm:p-6 border-border/50 bg-card/90 backdrop-blur-sm">
              {/* File Header */}
              <div className="flex items-start gap-4 mb-5">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <File className="w-7 h-7 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg sm:text-xl font-bold text-foreground break-words leading-tight mb-2">
                    {fileInfo.original_name}
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="text-xs">
                      <Download className="w-3 h-3 mr-1" />
                      {fileInfo.download_count} downloads
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <KeyRound className="w-3 h-3 mr-1" />
                      PIN: {pin}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-3 gap-2 mb-5">
                <div className="p-3 rounded-lg bg-muted/40 border border-border/30 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase mb-0.5">Size</p>
                  <p className="text-sm font-semibold text-foreground">{formatFileSize(fileInfo.file_size)}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/40 border border-border/30 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase mb-0.5">Type</p>
                  <p className="text-sm font-semibold text-foreground truncate">{fileInfo.file_type.split('/')[1] || fileInfo.file_type}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/40 border border-border/30 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase mb-0.5">Date</p>
                  <p className="text-sm font-semibold text-foreground">{new Date(fileInfo.upload_date).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Preview */}
              <div className="mb-5 rounded-xl overflow-hidden border border-border/30">
                <FilePreview
                  fileName={fileInfo.original_name}
                  fileType={fileInfo.file_type}
                  storagePath={fileInfo.storage_path}
                  fileSize={fileInfo.file_size}
                />
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Button onClick={handleDownload} disabled={downloading} size="lg" className="w-full h-12 gap-2">
                  <Download className="w-5 h-5" />
                  {downloading ? 'Downloading...' : 'Download File'}
                </Button>
                
                <div className="grid grid-cols-3 gap-2">
                  <Button variant="outline" onClick={() => setShowPreviewModal(true)} className="h-10 gap-1.5 text-xs">
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Preview</span>
                  </Button>
                  <Button variant="outline" onClick={() => setShowQRCode(true)} className="h-10 gap-1.5 text-xs">
                    <QrCode className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">QR Code</span>
                  </Button>
                  <Button variant="outline" onClick={() => setShowShareModal(true)} className="h-10 gap-1.5 text-xs">
                    <Share2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Share</span>
                  </Button>
                </div>
                
                <Button variant="ghost" onClick={() => { setFileInfo(null); setPin(''); setError(null); }} className="w-full h-10 gap-2 text-muted-foreground">
                  <KeyRound className="w-4 h-4" />
                  Try Another PIN
                </Button>
              </div>
            </Card>
            
            {fileInfo && (
              <div className="mt-5">
                <RealtimeCollaboration fileId={fileInfo.id} fileName={fileInfo.original_name} />
              </div>
            )}
          </motion.div>
        )}

        {/* Security Info */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <Card className="mt-8 p-5 border-border/50">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="w-4 h-4 text-primary" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">Secure PIN System</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                'Unique 4-digit PIN codes',
                'Auto-generated collision-safe',
                'Real-time activity tracking',
                'No registration required',
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-2.5 p-3 rounded-lg bg-muted/30 border border-border/30">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                  <p className="text-xs text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
      
      {fileInfo && (
        <>
          <QRCodeModal open={showQRCode} onOpenChange={setShowQRCode} pin={pin} fileName={fileInfo.original_name} />
          <EnhancedFilePreviewModal open={showPreviewModal} onOpenChange={setShowPreviewModal} fileUrl={fileUrl} fileName={fileInfo.original_name} fileType={fileInfo.file_type} />
          <SocialShareButtons open={showShareModal} onOpenChange={setShowShareModal} pin={pin} fileName={fileInfo.original_name} />
        </>
      )}
    </div>
  );
};

export default PinAccess;
