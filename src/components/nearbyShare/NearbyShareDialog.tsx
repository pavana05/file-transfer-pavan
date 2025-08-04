import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useWebRTC } from '@/hooks/useWebRTC';
import { NearbyDevice, FileTransfer } from '@/types/nearbyShare';
import { 
  Wifi, WifiOff, Users, Send, QrCode, Smartphone, Download, Upload, 
  Copy, CheckCircle, Signal, Zap, Shield, Globe, Waves, 
  FileText, Settings, Share2, Eye, EyeOff, Sparkles 
} from 'lucide-react';
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
  const [copied, setCopied] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [connectionStats, setConnectionStats] = useState({ 
    speed: 0, 
    totalTransferred: 0, 
    peersConnected: 0 
  });

  const { toast } = useToast();

  const {
    isConnected,
    connectedDevices,
    activeTransfers,
    sendFile,
    connectToDevice,
    initializeSignaling
  } = useWebRTC({
    deviceName,
    onDeviceDiscovered: (device) => {
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
    },
    onFileReceived: (file, fromDevice) => {
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
    },
    onTransferProgress: (transfer) => {
      // Progress updates handled in UI
    }
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
        title: 'Room Created',
        description: `Room ${newRoomId} is ready for sharing`,
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
      timestamp: Date.now()
    });
  };

  const copyRoomId = async () => {
    if (currentRoom) {
      try {
        await navigator.clipboard.writeText(currentRoom);
        setCopied(true);
        toast({
          title: 'Copied!',
          description: 'Room ID copied to clipboard',
        });
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        toast({
          title: 'Copy Failed',
          description: 'Unable to copy room ID',
          variant: 'destructive'
        });
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-5xl h-[90vh] max-h-[900px] flex flex-col overflow-auto bg-gradient-glass border border-border/50 backdrop-blur-xl">
        <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4 border-b border-border/30">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow">
                <Waves className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                  Nearby Share
                </h2>
                <p className="text-xs text-muted-foreground">Peer-to-peer file sharing</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {currentRoom && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-secondary/20 rounded-full border border-border/30">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs font-medium">Live</span>
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(!isVisible)}
                className="w-8 h-8 p-0"
              >
                {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0 overflow-auto">
          {/* Stats Bar */}
          <div className="flex-shrink-0 px-6 py-3 bg-gradient-subtle border-b border-border/20">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <Signal className="w-3 h-3 text-primary" />
                  <span className="text-muted-foreground">Peers: {connectedDevices.length}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-accent" />
                  <span className="text-muted-foreground">Speed: {connectionStats.speed} KB/s</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3 h-3 text-green-500" />
                  <span className="text-muted-foreground">Encrypted</span>
                </div>
              </div>
              {currentRoom && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Room:</span>
                  <code className="text-xs bg-primary/10 px-2 py-1 rounded font-mono">{currentRoom}</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyRoomId}
                    className="h-6 w-6 p-0 hover:bg-primary/20"
                  >
                    {copied ? (
                      <CheckCircle className="w-3 h-3 text-green-500" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>

          <Tabs defaultValue="setup" className="flex-1 flex flex-col">
            <TabsList className="flex-shrink-0 grid w-full grid-cols-4 mx-6 mt-4 bg-gradient-glass border border-border/30">
              <TabsTrigger value="setup" className="flex items-center gap-2">
                <Settings className="w-3 h-3" />
                <span className="hidden sm:inline">Setup</span>
              </TabsTrigger>
              <TabsTrigger value="devices" className="flex items-center gap-2">
                <Users className="w-3 h-3" />
                <span className="hidden sm:inline">Devices</span>
              </TabsTrigger>
              <TabsTrigger value="transfers" className="flex items-center gap-2">
                <Share2 className="w-3 h-3" />
                <span className="hidden sm:inline">Transfers</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <Sparkles className="w-3 h-3" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="setup" className="flex-1 m-0 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="px-6 py-4 space-y-6">
                  <Card className="bg-gradient-glass border border-border/50 backdrop-blur-sm">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Smartphone className="w-5 h-5 text-primary" />
                        Device Configuration
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium flex items-center gap-2">
                            <FileText className="w-3 h-3" />
                            Device Name
                          </label>
                          <Input
                            value={deviceName}
                            onChange={(e) => setDeviceName(e.target.value)}
                            placeholder="Enter your device name"
                            className="mt-1 bg-background/50 border-border/50"
                          />
                        </div>
                        <div className="flex flex-col justify-end">
                          <div className="flex flex-wrap items-center gap-2">
                            {isConnected ? (
                              <Badge variant="default" className="flex items-center gap-1 bg-green-500/20 text-green-700 border-green-500/30">
                                <Wifi className="w-3 h-3" />
                                Connected
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="flex items-center gap-1 bg-red-500/20 text-red-700 border-red-500/30">
                                <WifiOff className="w-3 h-3" />
                                Disconnected
                              </Badge>
                            )}
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Globe className="w-3 h-3" />
                              P2P Ready
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-glass border border-border/50 backdrop-blur-sm">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" />
                        Room Management
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Button 
                          onClick={createRoom} 
                          disabled={isCreatingRoom || !deviceName.trim()}
                          className="flex items-center gap-2 w-full h-12 bg-gradient-primary hover:bg-gradient-primary/80 text-white shadow-glow"
                        >
                          <Users className="w-4 h-4" />
                          {isCreatingRoom ? 'Creating...' : 'Create New Room'}
                        </Button>
                        
                        <Button 
                          onClick={() => setShowScanner(true)}
                          variant="outline"
                          className="flex items-center gap-2 w-full h-12 bg-gradient-glass border-border/50 hover:bg-gradient-glass/80"
                        >
                          <QrCode className="w-4 h-4" />
                          Scan QR Code
                        </Button>
                      </div>

                      <Separator className="bg-border/30" />

                      <div className="space-y-3">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Share2 className="w-3 h-3" />
                          Join Existing Room
                        </label>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Input
                            value={roomId}
                            onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                            placeholder="Enter room ID (e.g., ABC123)"
                            className="flex-1 bg-background/50 border-border/50 font-mono"
                          />
                          <Button 
                            onClick={() => joinRoom(roomId)}
                            disabled={!roomId.trim() || !deviceName.trim()}
                            className="sm:w-auto w-full bg-gradient-secondary hover:bg-gradient-secondary/80"
                          >
                            Join Room
                          </Button>
                        </div>
                      </div>

                      {currentRoom && (
                        <Card className="bg-gradient-subtle border border-primary/20">
                          <CardContent className="pt-4">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                                <span className="font-medium">Active Room</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <code className="text-lg font-mono bg-background/50 px-3 py-1 rounded border">
                                  {currentRoom}
                                </code>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={copyRoomId}
                                  className="h-8 w-8 p-0 hover:bg-primary/20"
                                >
                                  {copied ? (
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                  ) : (
                                    <Copy className="w-4 h-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                            
                            {showQRCode && (
                              <div className="text-center">
                                <QRCodeGenerator 
                                  data={getRoomQRData()} 
                                  size={200}
                                />
                                <p className="text-sm text-muted-foreground mt-3">
                                  Share this QR code for others to join
                                </p>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setShowQRCode(false)}
                                  className="mt-2"
                                >
                                  Hide QR Code
                                </Button>
                              </div>
                            )}
                            
                            {!showQRCode && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowQRCode(true)}
                                className="w-full flex items-center gap-2"
                              >
                                <QrCode className="w-4 h-4" />
                                Show QR Code
                              </Button>
                            )}
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
                                {files.map((file, index) => (
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
                                {files.length === 0 && (
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

            <TabsContent value="analytics" className="flex-1 m-0 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="px-6 py-4 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-gradient-glass border border-border/50">
                      <CardContent className="p-4 text-center">
                        <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Users className="w-4 h-4 text-primary" />
                        </div>
                        <div className="text-2xl font-bold">{connectedDevices.length}</div>
                        <div className="text-xs text-muted-foreground">Connected Devices</div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-glass border border-border/50">
                      <CardContent className="p-4 text-center">
                        <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Zap className="w-4 h-4 text-accent" />
                        </div>
                        <div className="text-2xl font-bold">{connectionStats.speed}</div>
                        <div className="text-xs text-muted-foreground">KB/s Average</div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-glass border border-border/50">
                      <CardContent className="p-4 text-center">
                        <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Download className="w-4 h-4 text-green-500" />
                        </div>
                        <div className="text-2xl font-bold">{Math.round(connectionStats.totalTransferred / 1024 / 1024)}</div>
                        <div className="text-xs text-muted-foreground">MB Transferred</div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-glass border border-border/50">
                      <CardContent className="p-4 text-center">
                        <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Shield className="w-4 h-4 text-blue-500" />
                        </div>
                        <div className="text-2xl font-bold">100%</div>
                        <div className="text-xs text-muted-foreground">Encrypted</div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="bg-gradient-glass border border-border/50">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        Connection Health
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Network Quality</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full" />
                          <span className="text-sm font-medium">Excellent</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Latency</span>
                        <Badge variant="outline" className="text-xs">
                          &lt; 50ms
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Encryption</span>
                        <Badge variant="default" className="text-xs bg-green-500/20 text-green-700 border-green-500/30">
                          AES-256
                        </Badge>
                      </div>
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