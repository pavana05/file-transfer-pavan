import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useWebRTC } from '@/hooks/useWebRTC';
import { NearbyDevice, FileTransfer } from '@/types/nearbyShare';
import { Wifi, WifiOff, Users, Send, QrCode, Smartphone, Download, Upload, FileIcon, FolderOpen, Copy, Share2, Zap, Shield, Globe, RefreshCw, X, CheckCircle, AlertCircle, History, Settings, Eye, EyeOff } from 'lucide-react';
import QRCodeGenerator from './QRCodeGenerator';
import QRCodeScanner from './QRCodeScanner';

interface NearbyShareDialogProps {
  trigger: React.ReactNode;
  files?: File[];
}

const NearbyShareDialog: React.FC<NearbyShareDialogProps> = ({ trigger, files = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [deviceName, setDeviceName] = useState(`Device-${Math.random().toString(36).substr(2, 4)}`);
  const [discoveredDevices, setDiscoveredDevices] = useState<NearbyDevice[]>([]);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>(files);
  const [transferHistory, setTransferHistory] = useState<FileTransfer[]>([]);
  const [isRoomIdVisible, setIsRoomIdVisible] = useState(true);
  const [roomSecurityLevel, setRoomSecurityLevel] = useState<'open' | 'protected'>('open');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();

  const handleDeviceDiscovered = useCallback((device: NearbyDevice) => {
    setDiscoveredDevices(prev => {
      const existing = prev.find(d => d.id === device.id);
      if (existing) {
        return prev.map(d => d.id === device.id ? device : d);
      }
      return [...prev, device];
    });
    toast({
      title: 'Device Discovered',
      description: `${device.name} is available for sharing`,
    });
  }, [toast]);

  const handleFileReceived = useCallback((file: File, fromDevice: string) => {
    toast({
      title: 'File Received',
      description: `Received ${file.name} from ${fromDevice}`,
    });
    
    // Create download link
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  }, [toast]);

  const handleTransferProgress = useCallback((transfer: FileTransfer) => {
    // Progress updates handled in UI
  }, []);

  const {
    isConnected,
    connectedDevices,
    activeTransfers,
    sendFile,
    connectToDevice,
    initializeSignaling
  } = useWebRTC({
    deviceName,
    onDeviceDiscovered: handleDeviceDiscovered,
    onFileReceived: handleFileReceived,
    onTransferProgress: handleTransferProgress
  });

  const createRoom = async () => {
    if (!deviceName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a device name',
        variant: 'destructive'
      });
      return;
    }

    setIsCreatingRoom(true);
    const newRoomId = crypto.randomUUID().substring(0, 8).toUpperCase();
    
    try {
      await initializeSignaling(newRoomId);
      setCurrentRoom(newRoomId);
      setRoomId(newRoomId);
      setShowQRCode(true);
      
      toast({
        title: '🎉 Room Created Successfully!',
        description: `Room ${newRoomId} is ready for secure file sharing`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create room',
        variant: 'destructive'
      });
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const joinRoom = async (roomToJoin: string) => {
    if (!deviceName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a device name',
        variant: 'destructive'
      });
      return;
    }

    try {
      await initializeSignaling(roomToJoin);
      setCurrentRoom(roomToJoin);
      setRoomId(roomToJoin);
      
      toast({
        title: 'Joined Room',
        description: `Connected to room ${roomToJoin}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to join room',
        variant: 'destructive'
      });
    }
  };

  const handleSendFile = async (file: File, deviceId: string) => {
    try {
      await sendFile(file, deviceId);
      toast({
        title: 'File Sent',
        description: `Started sending ${file.name}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send file',
        variant: 'destructive'
      });
    }
  };

  // Copy room ID to clipboard
  const copyRoomId = async () => {
    if (currentRoom) {
      try {
        await navigator.clipboard.writeText(currentRoom);
        toast({
          title: '📋 Copied!',
          description: `Room ID ${currentRoom} copied to clipboard`,
        });
      } catch (error) {
        toast({
          title: 'Copy Failed',
          description: 'Unable to copy room ID to clipboard',
          variant: 'destructive'
        });
      }
    }
  };

  // Refresh room connection
  const refreshRoom = async () => {
    if (currentRoom) {
      setIsRefreshing(true);
      try {
        await initializeSignaling(currentRoom);
        toast({
          title: '🔄 Room Refreshed',
          description: 'Connection refreshed successfully',
        });
      } catch (error) {
        toast({
          title: 'Refresh Failed',
          description: 'Unable to refresh room connection',
          variant: 'destructive'
        });
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  // Generate shareable link
  const getShareableLink = () => {
    if (currentRoom) {
      const baseUrl = window.location.origin;
      return `${baseUrl}/?nearbyShare=${currentRoom}&device=${encodeURIComponent(deviceName)}`;
    }
    return '';
  };

  // Copy shareable link
  const copyShareableLink = async () => {
    const link = getShareableLink();
    if (link) {
      try {
        await navigator.clipboard.writeText(link);
        toast({
          title: '🔗 Link Copied!',
          description: 'Shareable link copied to clipboard',
        });
      } catch (error) {
        toast({
          title: 'Copy Failed',
          description: 'Unable to copy link to clipboard',
          variant: 'destructive'
        });
      }
    }
  };

  const handleQRScan = (data: string) => {
    try {
      const qrData = JSON.parse(data);
      if (qrData.type === 'nearby-share-room' && qrData.roomId) {
        joinRoom(qrData.roomId);
        setShowScanner(false);
      }
    } catch (error) {
      toast({
        title: 'Invalid QR Code',
        description: 'The scanned QR code is not valid',
        variant: 'destructive'
      });
    }
  };

  const getRoomQRData = () => {
    return JSON.stringify({
      type: 'nearby-share-room',
      roomId: currentRoom,
      deviceName: deviceName,
      shareableLink: getShareableLink()
    });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setSelectedFiles(Array.from(files));
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  // Update selected files when props change
  useEffect(() => {
    setSelectedFiles(files);
  }, [files]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-5xl h-[90vh] max-h-[900px] flex flex-col overflow-auto bg-gradient-to-br from-background via-background/95 to-background border-2 border-primary/20 shadow-2xl">
        <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4 border-b border-gradient-border bg-gradient-glass backdrop-blur-sm">
          <DialogTitle className="flex items-center gap-3 text-xl font-bold">
            <div className="w-8 h-8 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <Share2 className="w-4 h-4 text-white" />
            </div>
            <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              Nearby Share
            </span>
            {currentRoom && (
              <Badge variant="outline" className="ml-auto bg-gradient-glass border-primary/30">
                <Globe className="w-3 h-3 mr-1" />
                Connected
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <Tabs defaultValue="setup" className="flex-1 flex flex-col">
            <TabsList className="flex-shrink-0 grid w-full grid-cols-4 mx-6 mt-4 bg-gradient-glass backdrop-blur-sm">
              <TabsTrigger value="setup" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white">
                <Settings className="w-4 h-4 mr-2" />
                Setup
              </TabsTrigger>
              <TabsTrigger value="devices" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white">
                <Users className="w-4 h-4 mr-2" />
                Devices
              </TabsTrigger>
              <TabsTrigger value="transfers" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white">
                <Zap className="w-4 h-4 mr-2" />
                Transfers
              </TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white">
                <History className="w-4 h-4 mr-2" />
                History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="setup" className="flex-1 m-0 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="px-6 py-4 space-y-6">
                  {/* Device Setup Card */}
                  <Card className="bg-gradient-glass border border-border/50 shadow-glass backdrop-blur-sm">
                    <CardHeader className="bg-gradient-to-r from-primary/5 to-primary-glow/5 rounded-t-lg">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Smartphone className="w-5 h-5 text-primary" />
                        Device Configuration
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                      <div>
                        <label className="text-sm font-medium flex items-center gap-2 mb-2">
                          <Settings className="w-4 h-4 text-primary" />
                          Device Name
                        </label>
                        <Input
                          value={deviceName}
                          onChange={(e) => setDeviceName(e.target.value)}
                          placeholder="Enter your device name"
                          className="bg-background/50 border-primary/20 focus:border-primary"
                        />
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {isConnected ? (
                          <Badge variant="default" className="flex items-center gap-1 bg-gradient-success text-white">
                            <Wifi className="w-3 h-3" />
                            Connected
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="flex items-center gap-1 bg-muted/50">
                            <WifiOff className="w-3 h-3" />
                            Disconnected
                          </Badge>
                        )}
                        {currentRoom && (
                          <Badge variant="outline" className="bg-gradient-glass border-primary/30">
                            <Shield className="w-3 h-3 mr-1" />
                            Room: {currentRoom}
                          </Badge>
                        )}
                        <Badge variant="outline" className="bg-gradient-glass border-primary/30">
                          <Users className="w-3 h-3 mr-1" />
                          {connectedDevices.length} device{connectedDevices.length !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Room Management Card */}
                  <Card className="bg-gradient-glass border border-border/50 shadow-glass backdrop-blur-sm">
                    <CardHeader className="bg-gradient-to-r from-secondary/5 to-accent/5 rounded-t-lg">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Globe className="w-5 h-5 text-secondary" />
                        Room Management
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Button 
                          onClick={createRoom} 
                          disabled={isCreatingRoom || !deviceName.trim()}
                          className="flex items-center gap-2 w-full bg-gradient-primary hover:bg-gradient-primary/90 text-white shadow-glow"
                        >
                          <Users className="w-4 h-4" />
                          {isCreatingRoom ? 'Creating...' : 'Create Room'}
                        </Button>
                        
                        <Button 
                          onClick={() => setShowScanner(true)}
                          variant="outline"
                          className="flex items-center gap-2 w-full border-primary/30 hover:bg-primary/10"
                        >
                          <QrCode className="w-4 h-4" />
                          Scan QR Code
                        </Button>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <Input
                          value={roomId}
                          onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                          placeholder="Enter room ID"
                          className="flex-1 bg-background/50 border-primary/20 focus:border-primary"
                        />
                        <Button 
                          onClick={() => joinRoom(roomId)}
                          disabled={!roomId.trim() || !deviceName.trim()}
                          className="sm:w-auto w-full bg-gradient-secondary"
                        >
                          Join Room
                        </Button>
                      </div>

                      {currentRoom && (
                        <Card className="bg-gradient-to-br from-primary/5 via-background/50 to-primary-glow/5 border border-primary/20">
                          <CardContent className="pt-6">
                            <div className="space-y-4">
                              {/* Room ID Display with Copy */}
                              <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-primary/20">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                                    <Shield className="w-4 h-4 text-white" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">Room ID</p>
                                    <p className="text-xs text-muted-foreground">Share this with others</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-lg font-bold text-primary">
                                    {isRoomIdVisible ? currentRoom : '••••••••'}
                                  </span>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setIsRoomIdVisible(!isRoomIdVisible)}
                                    className="p-1 h-8 w-8"
                                  >
                                    {isRoomIdVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={copyRoomId}
                                    className="gap-1 bg-gradient-primary text-white"
                                  >
                                    <Copy className="w-3 h-3" />
                                    Copy
                                  </Button>
                                </div>
                              </div>

                              {/* Room Actions */}
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={copyShareableLink}
                                  className="gap-1 border-primary/30"
                                >
                                  <Share2 className="w-3 h-3" />
                                  Copy Link
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={refreshRoom}
                                  disabled={isRefreshing}
                                  className="gap-1 border-primary/30"
                                >
                                  <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                                  Refresh
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setShowQRCode(!showQRCode)}
                                  className="gap-1 border-primary/30"
                                >
                                  <QrCode className="w-3 h-3" />
                                  {showQRCode ? 'Hide QR' : 'Show QR'}
                                </Button>
                              </div>

                              {/* QR Code Display */}
                              {showQRCode && (
                                <div className="text-center p-4 bg-background/50 rounded-lg border border-primary/20">
                                  <QRCodeGenerator 
                                    data={getRoomQRData()} 
                                    size={180}
                                    className="mb-3"
                                  />
                                  <p className="text-sm text-muted-foreground">
                                    Scan to join room {currentRoom}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Encrypted peer-to-peer connection
                                  </p>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="devices" className="flex-1 m-0 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="px-6 py-4 space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Available Devices ({connectedDevices.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <Button onClick={triggerFileSelect} size="sm" variant="outline" className="flex items-center gap-2">
                            <FolderOpen className="w-4 h-4" />
                            Select Files
                          </Button>
                          {selectedFiles.length > 0 && (
                            <Badge variant="secondary">{selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected</Badge>
                          )}
                        </div>
                        
                        {selectedFiles.length > 0 && (
                          <div className="space-y-1 text-sm text-muted-foreground">
                            {selectedFiles.slice(0, 3).map((file, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <FileIcon className="w-3 h-3" />
                                <span className="truncate">{file.name}</span>
                                <span>({(file.size / 1024 / 1024).toFixed(1)} MB)</span>
                              </div>
                            ))}
                            {selectedFiles.length > 3 && (
                              <div className="text-xs">...and {selectedFiles.length - 3} more files</div>
                            )}
                          </div>
                        )}
                        
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </div>
                      
                      {connectedDevices.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          No devices found. Create or join a room to start sharing.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {connectedDevices.map((device) => (
                            <div
                              key={device.id}
                              className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg gap-3"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                  <Smartphone className="w-4 h-4" />
                                </div>
                                <div>
                                  <p className="font-medium">{device.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {device.status}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex flex-wrap gap-2">
                                {selectedFiles.map((file, index) => (
                                  <Button
                                    key={index}
                                    size="sm"
                                    onClick={() => handleSendFile(file, device.id)}
                                    disabled={device.status !== 'connected'}
                                    className="flex items-center gap-1"
                                  >
                                    <Send className="w-3 h-3" />
                                    <span className="hidden sm:inline">Send</span> {file.name}
                                  </Button>
                                ))}
                                {selectedFiles.length === 0 && (
                                  <Badge variant="outline">No files selected</Badge>
                                )}
                              </div>
                            </div>
                          ))}
                         </div>
                        )}
                    </CardContent>
                   </Card>
                 </div>
               </ScrollArea>
             </TabsContent>

            <TabsContent value="transfers" className="flex-1 m-0 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="px-6 py-4 space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Active Transfers</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {activeTransfers.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          No active transfers
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {activeTransfers.map((transfer) => (
                            <div key={transfer.id} className="border rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  {transfer.fromDevice === deviceName ? (
                                    <Upload className="w-4 h-4 text-blue-500" />
                                  ) : (
                                    <Download className="w-4 h-4 text-green-500" />
                                  )}
                                  <span className="font-medium text-sm sm:text-base">{transfer.fileName}</span>
                                </div>
                                <Badge 
                                  variant={
                                    transfer.status === 'completed' ? 'default' :
                                    transfer.status === 'failed' ? 'destructive' :
                                    'secondary'
                                  }
                                >
                                  {transfer.status}
                                </Badge>
                              </div>
                              
                              <div className="text-sm text-muted-foreground mb-2">
                                {transfer.fromDevice === deviceName ? 
                                  `To: ${transfer.toDevice}` : 
                                  `From: ${transfer.fromDevice}`
                                }
                              </div>
                              
                              <Progress value={transfer.progress} className="mb-2" />
                              
                              <div className="text-xs text-muted-foreground">
                                {transfer.progress}% • {(transfer.fileSize / 1024 / 1024).toFixed(1)} MB
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>

            {/* New History Tab */}
            <TabsContent value="history" className="flex-1 m-0 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="px-6 py-4 space-y-4">
                  <Card className="bg-gradient-glass border border-border/50 shadow-glass backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <History className="w-5 h-5 text-primary" />
                        Transfer History
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {transferHistory.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p className="mb-2">No transfer history yet</p>
                          <p className="text-sm">Completed transfers will appear here</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {transferHistory.map((transfer, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border/30">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                  transfer.status === 'completed' ? 'bg-success/20' : 'bg-destructive/20'
                                }`}>
                                  {transfer.status === 'completed' ? 
                                    <CheckCircle className="w-4 h-4 text-success" /> : 
                                    <AlertCircle className="w-4 h-4 text-destructive" />
                                  }
                                </div>
                                <div>
                                  <p className="font-medium text-sm">{transfer.fileName}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {transfer.fromDevice === deviceName ? 
                                      `Sent to ${transfer.toDevice}` : 
                                      `Received from ${transfer.fromDevice}`
                                    }
                                  </p>
                                </div>
                              </div>
                              <Badge variant={transfer.status === 'completed' ? 'default' : 'destructive'}>
                                {transfer.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        {showScanner && (
          <QRCodeScanner
            isOpen={showScanner}
            onClose={() => setShowScanner(false)}
            onScan={handleQRScan}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default NearbyShareDialog;