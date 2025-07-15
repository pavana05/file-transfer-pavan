import { useState, useRef, useCallback, useEffect } from 'react';
import { NearbyDevice, FileTransfer, WebRTCMessage } from '@/types/nearbyShare';

interface UseWebRTCProps {
  deviceName: string;
  onDeviceDiscovered: (device: NearbyDevice) => void;
  onFileReceived: (file: File, fromDevice: string) => void;
  onTransferProgress: (transfer: FileTransfer) => void;
}

export const useWebRTC = ({
  deviceName,
  onDeviceDiscovered,
  onFileReceived,
  onTransferProgress
}: UseWebRTCProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectedDevices, setConnectedDevices] = useState<Map<string, NearbyDevice>>(new Map());
  const [activeTransfers, setActiveTransfers] = useState<Map<string, FileTransfer>>(new Map());
  
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const dataChannels = useRef<Map<string, RTCDataChannel>>(new Map());
  const signalingWs = useRef<WebSocket | null>(null);
  const currentRoom = useRef<string | null>(null);

  const CHUNK_SIZE = 16384; // 16KB chunks

  // Initialize WebRTC peer connection
  const createPeerConnection = useCallback((deviceId: string) => {
    const configuration: RTCConfiguration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' }
      ]
    };

    const peerConnection = new RTCPeerConnection(configuration);
    
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && signalingWs.current?.readyState === WebSocket.OPEN) {
        signalingWs.current.send(JSON.stringify({
          type: 'ice-candidate',
          candidate: event.candidate,
          targetDevice: deviceId
        }));
      }
    };

    peerConnection.onconnectionstatechange = () => {
      const state = peerConnection.connectionState;
      console.log(`Connection state with ${deviceId}:`, state);
      
      setConnectedDevices(prev => {
        const newMap = new Map(prev);
        const device = newMap.get(deviceId);
        if (device) {
          device.status = state === 'connected' ? 'connected' : 
                         state === 'connecting' ? 'connecting' : 'unavailable';
          device.lastSeen = new Date();
          newMap.set(deviceId, device);
        }
        return newMap;
      });
    };

    peerConnection.ondatachannel = (event) => {
      const channel = event.channel;
      setupDataChannel(channel, deviceId);
    };

    return peerConnection;
  }, []);

  // Setup data channel for file transfers
  const setupDataChannel = useCallback((channel: RTCDataChannel, deviceId: string) => {
    dataChannels.current.set(deviceId, channel);

    let fileBuffer: ArrayBuffer[] = [];
    let receivedSize = 0;
    let expectedSize = 0;
    let fileName = '';
    let transferId = '';

    channel.onopen = () => {
      console.log(`Data channel opened with ${deviceId}`);
    };

    channel.onmessage = (event) => {
      try {
        if (typeof event.data === 'string') {
          const message: WebRTCMessage = JSON.parse(event.data);
          
          switch (message.type) {
            case 'file-offer':
              fileName = message.data.fileName;
              expectedSize = message.data.fileSize;
              transferId = message.data.transferId;
              fileBuffer = [];
              receivedSize = 0;
              
              // Create transfer record
              const transfer: FileTransfer = {
                id: transferId,
                fileName,
                fileSize: expectedSize,
                fromDevice: deviceId,
                toDevice: deviceName,
                status: 'transferring',
                progress: 0,
                startedAt: new Date()
              };
              setActiveTransfers(prev => new Map(prev.set(transferId, transfer)));
              break;

            case 'file-complete':
              if (fileBuffer.length > 0 && expectedSize > 0) {
                const completeBuffer = new Uint8Array(expectedSize);
                let offset = 0;
                fileBuffer.forEach(chunk => {
                  completeBuffer.set(new Uint8Array(chunk), offset);
                  offset += chunk.byteLength;
                });
                
                const file = new File([completeBuffer], fileName);
                onFileReceived(file, deviceId);
                
                // Update transfer status
                setActiveTransfers(prev => {
                  const newMap = new Map(prev);
                  const transfer = newMap.get(transferId);
                  if (transfer) {
                    transfer.status = 'completed';
                    transfer.progress = 100;
                    transfer.completedAt = new Date();
                    newMap.set(transferId, transfer);
                    onTransferProgress(transfer);
                  }
                  return newMap;
                });
              }
              break;
          }
        } else {
          // Binary data (file chunk)
          fileBuffer.push(event.data);
          receivedSize += event.data.byteLength;
          
          const progress = expectedSize > 0 ? Math.round((receivedSize / expectedSize) * 100) : 0;
          
          // Update transfer progress
          setActiveTransfers(prev => {
            const newMap = new Map(prev);
            const transfer = newMap.get(transferId);
            if (transfer) {
              transfer.progress = progress;
              newMap.set(transferId, transfer);
              onTransferProgress(transfer);
            }
            return newMap;
          });
        }
      } catch (error) {
        console.error('Error handling data channel message:', error);
      }
    };

    channel.onerror = (error) => {
      console.error('Data channel error:', error);
    };

    channel.onclose = () => {
      console.log(`Data channel closed with ${deviceId}`);
    };
  }, [deviceName, onFileReceived, onTransferProgress]);

  // Send file to connected device
  const sendFile = useCallback(async (file: File, deviceId: string) => {
    const channel = dataChannels.current.get(deviceId);
    if (!channel || channel.readyState !== 'open') {
      throw new Error('No active data channel with device');
    }

    const transferId = crypto.randomUUID();
    const transfer: FileTransfer = {
      id: transferId,
      fileName: file.name,
      fileSize: file.size,
      fromDevice: deviceName,
      toDevice: deviceId,
      status: 'transferring',
      progress: 0,
      startedAt: new Date()
    };

    setActiveTransfers(prev => new Map(prev.set(transferId, transfer)));

    try {
      // Send file offer
      const offer: WebRTCMessage = {
        type: 'file-offer',
        data: {
          fileName: file.name,
          fileSize: file.size,
          transferId
        },
        timestamp: Date.now(),
        messageId: crypto.randomUUID()
      };

      channel.send(JSON.stringify(offer));

      // Send file in chunks
      const buffer = await file.arrayBuffer();
      const totalChunks = Math.ceil(buffer.byteLength / CHUNK_SIZE);
      
      for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, buffer.byteLength);
        const chunk = buffer.slice(start, end);
        
        // Wait for channel to be ready if needed
        while (channel.bufferedAmount > CHUNK_SIZE * 10) {
          await new Promise(resolve => setTimeout(resolve, 10));
        }
        
        channel.send(chunk);
        
        const progress = Math.round(((i + 1) / totalChunks) * 100);
        
        // Update progress
        setActiveTransfers(prev => {
          const newMap = new Map(prev);
          const currentTransfer = newMap.get(transferId);
          if (currentTransfer) {
            currentTransfer.progress = progress;
            newMap.set(transferId, currentTransfer);
            onTransferProgress(currentTransfer);
          }
          return newMap;
        });

        // Small delay to prevent overwhelming the channel
        if (i % 100 === 0) {
          await new Promise(resolve => setTimeout(resolve, 1));
        }
      }

      // Send completion message
      const complete: WebRTCMessage = {
        type: 'file-complete',
        data: { transferId },
        timestamp: Date.now(),
        messageId: crypto.randomUUID()
      };

      channel.send(JSON.stringify(complete));

      // Update final status
      setActiveTransfers(prev => {
        const newMap = new Map(prev);
        const currentTransfer = newMap.get(transferId);
        if (currentTransfer) {
          currentTransfer.status = 'completed';
          currentTransfer.completedAt = new Date();
          newMap.set(transferId, currentTransfer);
          onTransferProgress(currentTransfer);
        }
        return newMap;
      });

    } catch (error) {
      console.error('Error sending file:', error);
      setActiveTransfers(prev => {
        const newMap = new Map(prev);
        const currentTransfer = newMap.get(transferId);
        if (currentTransfer) {
          currentTransfer.status = 'failed';
          newMap.set(transferId, currentTransfer);
          onTransferProgress(currentTransfer);
        }
        return newMap;
      });
      throw error;
    }
  }, [deviceName, onTransferProgress]);

  // Connect to another device
  const connectToDevice = useCallback(async (deviceId: string) => {
    try {
      const peerConnection = createPeerConnection(deviceId);
      peerConnections.current.set(deviceId, peerConnection);

      // Create data channel
      const dataChannel = peerConnection.createDataChannel('fileTransfer', {
        ordered: true,
        maxRetransmits: 3
      });
      setupDataChannel(dataChannel, deviceId);

      // Create offer
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      // Send offer through signaling server
      if (signalingWs.current?.readyState === WebSocket.OPEN) {
        signalingWs.current.send(JSON.stringify({
          type: 'offer',
          offer,
          targetDevice: deviceId
        }));
      }
    } catch (error) {
      console.error('Error connecting to device:', error);
      throw error;
    }
  }, [createPeerConnection, setupDataChannel]);

  // Initialize signaling connection
  const initializeSignaling = useCallback((roomId: string) => {
    return new Promise<void>((resolve, reject) => {
      // Close existing connection
      if (signalingWs.current) {
        signalingWs.current.close();
      }

      // Use the full URL to the Supabase edge function
      const wsUrl = `wss://zbvwodqcvotrfokadwyo.supabase.co/functions/v1/nearby-share-signaling?room=${roomId}&device=${encodeURIComponent(deviceName)}`;
      
      signalingWs.current = new WebSocket(wsUrl);
      currentRoom.current = roomId;

      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, 10000);

      signalingWs.current.onopen = () => {
        clearTimeout(timeout);
        setIsConnected(true);
        console.log('Connected to signaling server');
        resolve();
      };

      signalingWs.current.onclose = () => {
        setIsConnected(false);
        setConnectedDevices(new Map());
        console.log('Disconnected from signaling server');
      };

      signalingWs.current.onerror = (error) => {
        clearTimeout(timeout);
        console.error('WebSocket error:', error);
        reject(new Error('Failed to connect to signaling server'));
      };

      signalingWs.current.onmessage = async (event) => {
        try {
          const message = JSON.parse(event.data);
          
          switch (message.type) {
            case 'connected':
              console.log('Successfully joined room:', message.roomId);
              break;

            case 'device-discovered':
              const device: NearbyDevice = {
                id: message.deviceId,
                name: message.deviceName,
                status: 'available',
                lastSeen: new Date()
              };
              setConnectedDevices(prev => new Map(prev.set(device.id, device)));
              onDeviceDiscovered(device);
              
              // Automatically try to connect to new devices
              setTimeout(() => {
                connectToDevice(message.deviceId);
              }, 1000);
              break;

            case 'device-disconnected':
              setConnectedDevices(prev => {
                const newMap = new Map(prev);
                newMap.delete(message.deviceId);
                return newMap;
              });
              
              // Clean up peer connection
              const peerConnection = peerConnections.current.get(message.deviceId);
              if (peerConnection) {
                peerConnection.close();
                peerConnections.current.delete(message.deviceId);
              }
              dataChannels.current.delete(message.deviceId);
              break;

            case 'offer':
              await handleOffer(message.offer, message.fromDevice);
              break;

            case 'answer':
              await handleAnswer(message.answer, message.fromDevice);
              break;

            case 'ice-candidate':
              await handleIceCandidate(message.candidate, message.fromDevice);
              break;

            case 'error':
              console.error('Signaling error:', message.message);
              break;
          }
        } catch (error) {
          console.error('Error handling signaling message:', error);
        }
      };
    });
  }, [deviceName, onDeviceDiscovered, connectToDevice]);

  const handleOffer = async (offer: RTCSessionDescriptionInit, fromDevice: string) => {
    try {
      const peerConnection = createPeerConnection(fromDevice);
      peerConnections.current.set(fromDevice, peerConnection);

      await peerConnection.setRemoteDescription(offer);
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      if (signalingWs.current?.readyState === WebSocket.OPEN) {
        signalingWs.current.send(JSON.stringify({
          type: 'answer',
          answer,
          targetDevice: fromDevice
        }));
      }
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  };

  const handleAnswer = async (answer: RTCSessionDescriptionInit, fromDevice: string) => {
    try {
      const peerConnection = peerConnections.current.get(fromDevice);
      if (peerConnection) {
        await peerConnection.setRemoteDescription(answer);
      }
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  };

  const handleIceCandidate = async (candidate: RTCIceCandidateInit, fromDevice: string) => {
    try {
      const peerConnection = peerConnections.current.get(fromDevice);
      if (peerConnection && peerConnection.remoteDescription) {
        await peerConnection.addIceCandidate(candidate);
      }
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      peerConnections.current.forEach(pc => pc.close());
      dataChannels.current.clear();
      if (signalingWs.current) {
        signalingWs.current.close();
      }
    };
  }, []);

  return {
    isConnected,
    connectedDevices: Array.from(connectedDevices.values()),
    activeTransfers: Array.from(activeTransfers.values()),
    sendFile,
    connectToDevice,
    initializeSignaling
  };
};