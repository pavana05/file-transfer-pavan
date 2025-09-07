import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Enhanced CORS headers for security
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://zbvwodqcvotrfokadwyo.supabase.co',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Max-Age': '86400', // 24 hours
};

// Security headers
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

interface ConnectedDevice {
  id: string;
  name: string;
  socket: WebSocket;
  roomId: string;
  joinedAt: Date;
  userId?: string; // Add user authentication
  messageCount: number; // Rate limiting
  lastMessageTime: Date;
}

// Rate limiting configuration
const RATE_LIMIT = {
  maxMessagesPerMinute: 60,
  maxConnectionTime: 30 * 60 * 1000, // 30 minutes
};

const rooms = new Map<string, Set<ConnectedDevice>>();
const devices = new Map<string, ConnectedDevice>();

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: { ...corsHeaders, ...securityHeaders } 
    });
  }

  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { 
      status: 400,
      headers: { ...corsHeaders, ...securityHeaders }
    });
  }

  const url = new URL(req.url);
  const roomId = url.searchParams.get("room");
  const deviceName = url.searchParams.get("device");
  const authToken = url.searchParams.get("auth");

  if (!roomId || !deviceName) {
    return new Response("Missing room or device parameter", { 
      status: 400,
      headers: { ...corsHeaders, ...securityHeaders }
    });
  }

  // Enhanced validation
  if (roomId.length > 50 || deviceName.length > 50) {
    return new Response("Room ID or device name too long", { 
      status: 400,
      headers: { ...corsHeaders, ...securityHeaders }
    });
  }

  // Validate room ID format (alphanumeric + hyphens only)
  if (!/^[a-zA-Z0-9-]+$/.test(roomId)) {
    return new Response("Invalid room ID format", { 
      status: 400,
      headers: { ...corsHeaders, ...securityHeaders }
    });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  const deviceId = crypto.randomUUID();

  const device: ConnectedDevice = {
    id: deviceId,
    name: deviceName,
    socket,
    roomId,
    joinedAt: new Date(),
    messageCount: 0,
    lastMessageTime: new Date()
  };

  socket.onopen = () => {
    console.log(`Device ${deviceName} (${deviceId}) connected to room ${roomId}`);
    
    // Add device to room
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }
    rooms.get(roomId)!.add(device);
    devices.set(deviceId, device);

    // Send welcome message
    socket.send(JSON.stringify({
      type: 'connected',
      deviceId,
      roomId
    }));

    // Notify other devices in the room
    const roomDevices = rooms.get(roomId)!;
    roomDevices.forEach(otherDevice => {
      if (otherDevice.id !== deviceId && otherDevice.socket.readyState === WebSocket.OPEN) {
        otherDevice.socket.send(JSON.stringify({
          type: 'device-discovered',
          deviceId,
          deviceName
        }));
        
        // Also send existing device info to new device
        socket.send(JSON.stringify({
          type: 'device-discovered',
          deviceId: otherDevice.id,
          deviceName: otherDevice.name
        }));
      }
    });
  };

  socket.onmessage = (event) => {
    try {
      const now = new Date();
      
      // Rate limiting check
      if (now.getTime() - device.lastMessageTime.getTime() < 1000) { // Max 1 message per second
        device.messageCount++;
        if (device.messageCount > RATE_LIMIT.maxMessagesPerMinute) {
          console.log(`Rate limit exceeded for device ${deviceId}`);
          socket.send(JSON.stringify({
            type: 'error',
            message: 'Rate limit exceeded'
          }));
          socket.close();
          return;
        }
      } else {
        device.messageCount = 0; // Reset counter
      }
      
      device.lastMessageTime = now;
      
      const message = JSON.parse(event.data);
      console.log(`Message from ${deviceId} (${device.messageCount}):`, message.type);

      // Validate message structure
      if (!message.type || typeof message.type !== 'string') {
        throw new Error('Invalid message type');
      }

      // Sanitize message content
      if (message.type.length > 50) {
        throw new Error('Message type too long');
      }

      // Forward WebRTC signaling messages
      if (message.targetDevice && devices.has(message.targetDevice)) {
        const targetDevice = devices.get(message.targetDevice)!;
        
        if (targetDevice.socket.readyState === WebSocket.OPEN) {
          // Add sender info to message and sanitize
          const forwardedMessage = {
            type: message.type,
            targetDevice: message.targetDevice,
            data: message.data,
            fromDevice: deviceId,
            fromDeviceName: deviceName,
            timestamp: now.toISOString()
          };
          
          targetDevice.socket.send(JSON.stringify(forwardedMessage));
        }
      }
    } catch (error) {
      console.error('Error handling message:', error);
      socket.send(JSON.stringify({
        type: 'error',
        message: 'Invalid message format'
      }));
    }
  };

  socket.onclose = () => {
    console.log(`Device ${deviceName} (${deviceId}) disconnected`);
    
    // Remove device from room and global map
    const roomDevices = rooms.get(roomId);
    if (roomDevices) {
      roomDevices.delete(device);
      
      // Notify other devices about disconnection
      roomDevices.forEach(otherDevice => {
        if (otherDevice.socket.readyState === WebSocket.OPEN) {
          otherDevice.socket.send(JSON.stringify({
            type: 'device-disconnected',
            deviceId,
            deviceName
          }));
        }
      });

      // Clean up empty rooms
      if (roomDevices.size === 0) {
        rooms.delete(roomId);
      }
    }
    
    devices.delete(deviceId);
  };

  socket.onerror = (error) => {
    console.error(`WebSocket error for device ${deviceId}:`, error);
  };

  return response;
});

// Enhanced cleanup with security considerations
setInterval(() => {
  const now = new Date();
  const maxAge = RATE_LIMIT.maxConnectionTime;

  devices.forEach((device, deviceId) => {
    const isExpired = now.getTime() - device.joinedAt.getTime() > maxAge;
    const isInactive = device.socket.readyState !== WebSocket.OPEN;
    
    if (isExpired || isInactive) {
      if (device.socket.readyState === WebSocket.OPEN) {
        device.socket.close();
      }
      
      const roomDevices = rooms.get(device.roomId);
      if (roomDevices) {
        roomDevices.delete(device);
        if (roomDevices.size === 0) {
          rooms.delete(device.roomId);
        }
      }
      
      devices.delete(deviceId);
      console.log(`Cleaned up ${isExpired ? 'expired' : 'inactive'} device ${deviceId}`);
    }
  });
  
  // Log stats for monitoring
  console.log(`Active devices: ${devices.size}, Active rooms: ${rooms.size}`);
}, 5 * 60 * 1000); // Run every 5 minutes