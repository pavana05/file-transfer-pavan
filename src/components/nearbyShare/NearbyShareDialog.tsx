import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useWebRTC } from '@/hooks/useWebRTC';
import { NearbyDevice, FileTransfer } from '@/types/nearbyShare';
import { 
  Wifi, 
  WifiOff, 
  Users, 
  Send, 
  QrCode, 
  Smartphone, 
  Download, 
  Upload, 
  CheckCircle,
  AlertCircle,
  Loader2,
  Copy,
  RefreshCw
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
  const [deviceName, setDeviceName] = useState(() => {
    // Generate a more user-friendly device name
    const adjectives = ['Swift', 'Bright', 'Quick', 'Smart', 'Cool', 'Fast', 'Sharp'];
    const nouns = ['Device', 'Phone', 'Computer', 'Tablet', 'Laptop'];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${adj} ${noun}`;
  });
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [connectionError, setConnectionError] = useState<string>('');

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
      console.log('Device discovered:', device);
      toast({
        title: 'Device Found',
        description: `${device.name} joined the room`,
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
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    onTransferProgress: (transfer) => {
      // Progress updates are handled in the UI
      console.log('Transfer progress:', transfer.fileName, transfer.progress + '%');
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
    setConnectionError('');
    
    // Generate a more user-friendly room ID
    const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    
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
      console.error('Failed to create room:', error);
      setConnectionError('Failed to create room. Please try again.');
      toast({
        title: 'Error',
        description: 'Failed to create room. Please check your connection.',
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

    if (!roomToJoin.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a room ID',
        variant: 'destructive'
      });
      return;
    }

    setIsJoiningRoom(true);
    setConnectionError('');

    try {
      await initializeSignaling(roomToJoin.toUpperCase());
      setCurrentRoom(roomToJoin.toUpperCase());
      setRoomId(roomToJoin.toUpperCase());
      
      toast({
        title: 'Joined Room',
        description: `Connected to room ${roomToJoin.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Failed to join room:', error);
      setConnectionError('Failed to join room. Please check the room ID and try again.');
      toast({
        title: 'Error',
        description: 'Failed to join room. Please check the room ID.',
        variant: 'destructive'
      });
    } finally {
      setIsJoiningRoom(false);
    }
  };

  const handleSendFile = async (file: File, deviceId: string) => {
    try {
      await sendFile(file, deviceId);
      toast({
        title: 'Sending File',
        description: `Started sending ${file.name}`,
      });
    } catch (error) {
      console.error('Failed to send file:', error);
      toast({
        title: 'Error',
        description: 'Failed to send file. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleQRScan = (data: string) => {
    try {
      const qrData = JSON.parse(data);
      if (qrData.type === 'nearby-share-room' && qrData.roomId) {
        setRoomId(qrData.roomId);
        joinRoom(qrData.roomId);
        setShowScanner(false);
      } else {
        throw new Error('Invalid QR code format');
      }
    } catch (error) {
      console.error('Invalid QR code:', error);
      toast({
        title: 'Invalid QR Code',
        description: 'The scanned QR code is not a valid room code',
        variant: 'destructive'
      });
    }
  };

  const getRoomQRData = () => {
    return JSON.stringify({
      type: 'nearby-share-room',
      roomId: currentRoom,
      deviceName: deviceName
    });
  };

  const copyRoomId = () => {
    if (currentRoom) {
      navigator.clipboard.writeText(currentRoom);
      toast({
        title: 'Room ID Copied',
        description: 'Room ID copied to clipboard',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-500';
      case 'connecting': return 'bg-yellow-500';
      case 'available': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getTransferStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'transferring': return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      default: return <Upload className="w-4 h-4 text-gray-500" />;
    }
  };

  // Reset state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setShowQRCode(false);
      setConnectionError('');
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-4xl h-[90vh] max-h-[900px] flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Nearby Share
            {isConnected && currentRoom && (
              <Badge variant="outline" className="ml-2">
                Room: {currentRoom}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <Tabs defaultValue="setup" className="flex-1 flex flex-col">
            <TabsList className="flex-shrink-0 grid w-full grid-cols-3 mx-6 mt-4">
              <TabsTrigger value="setup">Setup</TabsTrigger>
              <TabsTrigger value="devices" disabled={!isConnected}>
                Devices ({connectedDevices.length})
              </TabsTrigger>
              <TabsTrigger value="transfers" disabled={activeTransfers.length === 0}>
                Transfers ({activeTransfers.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="setup" className="flex-1 m-0 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="px-6 py-4 space-y-6">
                  {/* Connection Status */}
                  {connectionError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{connectionError}</AlertDescription>
                    </Alert>
                  )}

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Smartphone className="w-5 h-5" />
                        Device Setup
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Device Name</label>
                        <Input
                          value={deviceName}
                          onChange={(e) => setDeviceName(e.target.value)}
                          placeholder="Enter your device name"
                          className="mt-1"
                          disabled={isConnected}
                        />
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {isConnected ? (
                          <Badge variant="default" className="flex items-center gap-1">
                            <Wifi className="w-3 h-3" />
                            Connected
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <WifiOff className="w-3 h-3" />
                            Disconnected
                          </Badge>
                        )}
                        {files.length > 0 && (
                          <Badge variant="outline">
                            {files.length} file{files.length !== 1 ? 's' : ''} ready
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Join or Create Room
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Button 
                          onClick={createRoom} 
                          disabled={isCreatingRoom || !deviceName.trim() || isConnected}
                          className="flex items-center gap-2 w-full"
                        >
                          {isCreatingRoom ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Users className="w-4 h-4" />
                          )}
                          {isCreatingRoom ? 'Creating...' : 'Create Room'}
                        </Button>
                        
                        <Button 
                          onClick={() => setShowScanner(true)}
                          variant="outline"
                          className="flex items-center gap-2 w-full"
                          disabled={isConnected}
                        >
                          <QrCode className="w-4 h-4" />
                          Scan QR Code
                        </Button>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <Input
                          value={roomId}
                          onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                          placeholder="Enter room ID (e.g., ABC123)"
                          className="flex-1"
                          disabled={isConnected}
                          maxLength={6}
                        />
                        <Button 
                          onClick={() => joinRoom(roomId)}
                          disabled={!roomId.trim() || !deviceName.trim() || isJoiningRoom || isConnected}
                          className="sm:w-auto w-full"
                        >
                          {isJoiningRoom ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          ) : null}
                          {isJoiningRoom ? 'Joining...' : 'Join'}
                        </Button>
                      </div>

                      {showQRCode && currentRoom && (
                        <Card>
                          <CardContent className="pt-6 text-center">
                            <QRCodeGenerator 
                              data={getRoomQRData()} 
                              size={200}
                              className="mb-4"
                            />
                            <div className="flex items-center justify-center gap-2 mb-2">
                              <span className="font-mono text-lg font-bold">{currentRoom}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={copyRoomId}
                                className="h-8 w-8 p-0"
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Share this QR code or room ID with others to join
                            </p>
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
                          <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p className="mb-2">No devices found</p>
                          <p className="text-sm">Other devices will appear here when they join the room</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {connectedDevices.map((device) => (
                            <div
                              key={device.id}
                              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-3 hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className="relative">
                                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                    <Smartphone className="w-5 h-5" />
                                  </div>
                                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${getStatusColor(device.status)}`} />
                                </div>
                                <div>
                                  <p className="font-medium">{device.name}</p>
                                  <p className="text-sm text-muted-foreground capitalize">
                                    {device.status} • Last seen {device.lastSeen.toLocaleTimeString()}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex flex-wrap gap-2">
                                {files.length === 0 ? (
                                  <Badge variant="outline">No files selected</Badge>
                                ) : (
                                  files.map((file, index) => (
                                    <Button
                                      key={index}
                                      size="sm"
                                      onClick={() => handleSendFile(file, device.id)}
                                      disabled={device.status !== 'connected'}
                                      className="flex items-center gap-1"
                                    >
                                      <Send className="w-3 h-3" />
                                      <span className="max-w-20 truncate">{file.name}</span>
                                    </Button>
                                  ))
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
                      <CardTitle className="text-lg flex items-center gap-2">
                        <RefreshCw className="w-5 h-5" />
                        File Transfers
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {activeTransfers.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Upload className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p className="mb-2">No active transfers</p>
                          <p className="text-sm">File transfers will appear here</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {activeTransfers.map((transfer) => (
                            <div key={transfer.id} className="border rounded-lg p-4 space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  {getTransferStatusIcon(transfer.status)}
                                  <div>
                                    <p className="font-medium text-sm sm:text-base truncate max-w-48">
                                      {transfer.fileName}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {transfer.fromDevice === deviceName ? 
                                        `To: ${transfer.toDevice}` : 
                                        `From: ${transfer.fromDevice}`
                                      }
                                    </p>
                                  </div>
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
                              
                              <Progress value={transfer.progress} className="h-2" />
                              
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>{transfer.progress}%</span>
                                <span>{(transfer.fileSize / 1024 / 1024).toFixed(1)} MB</span>
                              </div>

                              {transfer.completedAt && (
                                <p className="text-xs text-muted-foreground">
                                  Completed at {transfer.completedAt.toLocaleTimeString()}
                                </p>
                              )}
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