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

  const CHUNK_SIZE = 16384; // 16KB chunks

  // Initialize WebRTC peer connection
  const createPeerConnection = useCallback((deviceId: string) => {
    const configuration: RTCConfiguration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };

    const peerConnection = new RTCPeerConnection(configuration);
    
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && signalingWs.current) {
        signalingWs.current.send(JSON.stringify({
          type: 'ice-candidate',
          candidate: event.candidate,
          targetDevice: deviceId
        }));
      }
    };

    peerConnection.onconnectionstatechange = () => {
      const state = peerConnection.connectionState;
      setConnectedDevices(prev => {
        const newMap = new Map(prev);
        const device = newMap.get(deviceId);
        if (device) {
          device.status = state === 'connected' ? 'connected' : 
                         state === 'connecting' ? 'connecting' : 'unavailable';
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
              if (fileBuffer.length > 0) {
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
          
          const progress = Math.round((receivedSize / expectedSize) * 100);
          
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
        await new Promise(resolve => setTimeout(resolve, 1));
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
        ordered: true
      });
      setupDataChannel(dataChannel, deviceId);

      // Create offer
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      // Send offer through signaling server
      if (signalingWs.current) {
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
    // This would connect to a signaling server (could be a Supabase edge function)
    const wsUrl = `wss://zbvwodqcvotrfokadwyo.functions.supabase.co/functions/v1/nearby-share-signaling?room=${roomId}&device=${deviceName}`;
    
    signalingWs.current = new WebSocket(wsUrl);

    signalingWs.current.onopen = () => {
      setIsConnected(true);
      console.log('Connected to signaling server');
    };

    signalingWs.current.onclose = () => {
      setIsConnected(false);
      console.log('Disconnected from signaling server');
    };

    signalingWs.current.onmessage = async (event) => {
      try {
        const message = JSON.parse(event.data);
        
        switch (message.type) {
          case 'device-discovered':
            const device: NearbyDevice = {
              id: message.deviceId,
              name: message.deviceName,
              status: 'available',
              lastSeen: new Date()
            };
            setConnectedDevices(prev => new Map(prev.set(device.id, device)));
            onDeviceDiscovered(device);
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
        }
      } catch (error) {
        console.error('Error handling signaling message:', error);
      }
    };
  }, [deviceName, onDeviceDiscovered]);

  const handleOffer = async (offer: RTCSessionDescriptionInit, fromDevice: string) => {
    const peerConnection = createPeerConnection(fromDevice);
    peerConnections.current.set(fromDevice, peerConnection);

    await peerConnection.setRemoteDescription(offer);
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    if (signalingWs.current) {
      signalingWs.current.send(JSON.stringify({
        type: 'answer',
        answer,
        targetDevice: fromDevice
      }));
    }
  };

  const handleAnswer = async (answer: RTCSessionDescriptionInit, fromDevice: string) => {
    const peerConnection = peerConnections.current.get(fromDevice);
    if (peerConnection) {
      await peerConnection.setRemoteDescription(answer);
    }
  };

  const handleIceCandidate = async (candidate: RTCIceCandidateInit, fromDevice: string) => {
    const peerConnection = peerConnections.current.get(fromDevice);
    if (peerConnection) {
      await peerConnection.addIceCandidate(candidate);
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