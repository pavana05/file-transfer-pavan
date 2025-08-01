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
import { Wifi, WifiOff, Users, Send, QrCode, Smartphone, Download, Upload, FileIcon, FolderOpen } from 'lucide-react';
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
      deviceName: deviceName
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
      <DialogContent className="w-[95vw] max-w-4xl h-[90vh] max-h-[900px] flex flex-col overflow-auto">
        <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Nearby Share
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <Tabs defaultValue="setup" className="flex-1 flex flex-col">
            <TabsList className="flex-shrink-0 grid w-full grid-cols-3 mx-6 mt-4">
              <TabsTrigger value="setup">Setup</TabsTrigger>
              <TabsTrigger value="devices">Devices</TabsTrigger>
              <TabsTrigger value="transfers">Transfers</TabsTrigger>
            </TabsList>

            <TabsContent value="setup" className="flex-1 m-0 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="px-6 py-4 space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Device Setup</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Device Name</label>
                        <Input
                          value={deviceName}
                          onChange={(e) => setDeviceName(e.target.value)}
                          placeholder="Enter your device name"
                          className="mt-1"
                        />
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {isConnected ? (
                          <Badge variant="default" className="flex items-center gap-1">
                            <Wifi className="w-3 h-3" />
                            Connected to signaling server
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <WifiOff className="w-3 h-3" />
                            Disconnected
                          </Badge>
                        )}
                        {currentRoom && (
                          <Badge variant="outline">Room: {currentRoom}</Badge>
                        )}
                        <Badge variant="outline">{connectedDevices.length} device{connectedDevices.length !== 1 ? 's' : ''}</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Join or Create Room</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Button 
                          onClick={createRoom} 
                          disabled={isCreatingRoom || !deviceName.trim()}
                          className="flex items-center gap-2 w-full"
                        >
                          <Users className="w-4 h-4" />
                          {isCreatingRoom ? 'Creating...' : 'Create Room'}
                        </Button>
                        
                        <Button 
                          onClick={() => setShowScanner(true)}
                          variant="outline"
                          className="flex items-center gap-2 w-full"
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
                          className="flex-1"
                        />
                        <Button 
                          onClick={() => joinRoom(roomId)}
                          disabled={!roomId.trim() || !deviceName.trim()}
                          className="sm:w-auto w-full"
                        >
                          Join
                        </Button>
                      </div>

                      {showQRCode && currentRoom && (
                        <Card>
                          <CardContent className="pt-6 text-center">
                            <QRCodeGenerator 
                              data={getRoomQRData()} 
                              size={200}
                            />
                            <p className="text-sm text-muted-foreground mt-2">
                              Scan this QR code to join room {currentRoom}
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