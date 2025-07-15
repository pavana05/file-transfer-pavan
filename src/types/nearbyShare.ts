export interface NearbyDevice {
  id: string;
  name: string;
  status: 'connected' | 'connecting' | 'available' | 'unavailable';
  lastSeen: Date;
}

export interface ShareRoom {
  id: string;
  name: string;
  createdBy: string;
  participants: NearbyDevice[];
  qrCode?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface FileTransfer {
  id: string;
  fileName: string;
  fileSize: number;
  fromDevice: string;
  toDevice: string;
  status: 'pending' | 'transferring' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  startedAt: Date;
  completedAt?: Date;
}

export interface NearbyShareConfig {
  deviceName: string;
  autoAcceptFromKnownDevices: boolean;
  enableDiscovery: boolean;
  maxFileSize: number;
  allowedFileTypes: string[];
}

export interface WebRTCMessage {
  type: 'file-offer' | 'file-answer' | 'file-chunk' | 'file-complete' | 'file-error' | 'device-info' | 'room-join' | 'room-leave';
  data: {
    fileName?: string;
    fileSize?: number;
    transferId?: string;
    [key: string]: any;
  };
  timestamp: number;
  messageId: string;
}