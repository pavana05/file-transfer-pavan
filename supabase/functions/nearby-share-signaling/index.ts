import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

interface ConnectedDevice {
  id: string;
  name: string;
  socket: WebSocket;
  roomId: string;
  joinedAt: Date;
}

const rooms = new Map<string, Set<ConnectedDevice>>();
const devices = new Map<string, ConnectedDevice>();

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }

  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { 
      status: 400,
      headers: corsHeaders 
    });
  }

  const url = new URL(req.url);
  const roomId = url.searchParams.get("room");
  const deviceName = url.searchParams.get("device");

  if (!roomId || !deviceName) {
    return new Response("Missing room or device parameter", { 
      status: 400,
      headers: corsHeaders 
    });
  }

  const { socket, response } = Deno.upgradeWebSocket(req, {
    headers: corsHeaders
  });
  
  const deviceId = crypto.randomUUID();

  const device: ConnectedDevice = {
    id: deviceId,
    name: deviceName,
    socket,
    roomId,
    joinedAt: new Date()
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
    try {
      socket.send(JSON.stringify({
        type: 'connected',
        deviceId,
        roomId,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Error sending welcome message:', error);
    }

    // Notify other devices in the room and send existing device info to new device
    const roomDevices = rooms.get(roomId)!;
    roomDevices.forEach(otherDevice => {
      if (otherDevice.id !== deviceId) {
        try {
          // Notify existing device about new device
          if (otherDevice.socket.readyState === WebSocket.OPEN) {
            otherDevice.socket.send(JSON.stringify({
              type: 'device-discovered',
              deviceId,
              deviceName,
              timestamp: Date.now()
            }));
          }
          
          // Send existing device info to new device
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({
              type: 'device-discovered',
              deviceId: otherDevice.id,
              deviceName: otherDevice.name,
              timestamp: Date.now()
            }));
          }
        } catch (error) {
          console.error('Error notifying devices:', error);
        }
      }
    });
  };

  socket.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      console.log(`Message from ${deviceId} (${deviceName}):`, message.type);

      // Validate message structure
      if (!message.type) {
        socket.send(JSON.stringify({
          type: 'error',
          message: 'Invalid message format: missing type',
          timestamp: Date.now()
        }));
        return;
      }

      // Forward WebRTC signaling messages
      if (message.targetDevice && devices.has(message.targetDevice)) {
        const targetDevice = devices.get(message.targetDevice)!;
        
        if (targetDevice.socket.readyState === WebSocket.OPEN) {
          // Add sender info to message
          const forwardedMessage = {
            ...message,
            fromDevice: deviceId,
            fromDeviceName: deviceName,
            timestamp: Date.now()
          };
          
          try {
            targetDevice.socket.send(JSON.stringify(forwardedMessage));
            console.log(`Forwarded ${message.type} from ${deviceId} to ${message.targetDevice}`);
          } catch (error) {
            console.error('Error forwarding message:', error);
          }
        } else {
          // Target device is not available
          socket.send(JSON.stringify({
            type: 'error',
            message: 'Target device is not available',
            targetDevice: message.targetDevice,
            timestamp: Date.now()
          }));
        }
      } else if (message.targetDevice) {
        // Target device not found
        socket.send(JSON.stringify({
          type: 'error',
          message: 'Target device not found',
          targetDevice: message.targetDevice,
          timestamp: Date.now()
        }));
      }
    } catch (error) {
      console.error('Error handling message:', error);
      try {
        socket.send(JSON.stringify({
          type: 'error',
          message: 'Invalid message format',
          timestamp: Date.now()
        }));
      } catch (sendError) {
        console.error('Error sending error message:', sendError);
      }
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
          try {
            otherDevice.socket.send(JSON.stringify({
              type: 'device-disconnected',
              deviceId,
              deviceName,
              timestamp: Date.now()
            }));
          } catch (error) {
            console.error('Error notifying device disconnection:', error);
          }
        }
      });

      // Clean up empty rooms
      if (roomDevices.size === 0) {
        rooms.delete(roomId);
        console.log(`Room ${roomId} cleaned up`);
      }
    }
    
    devices.delete(deviceId);
  };

  socket.onerror = (error) => {
    console.error(`WebSocket error for device ${deviceId}:`, error);
  };

  return response;
});

// Cleanup inactive connections periodically
setInterval(() => {
  const now = new Date();
  const maxAge = 30 * 60 * 1000; // 30 minutes

  devices.forEach((device, deviceId) => {
    if (now.getTime() - device.joinedAt.getTime() > maxAge) {
      try {
        if (device.socket.readyState === WebSocket.OPEN) {
          device.socket.close();
        }
      } catch (error) {
        console.error('Error closing inactive socket:', error);
      }
      
      const roomDevices = rooms.get(device.roomId);
      if (roomDevices) {
        roomDevices.delete(device);
        if (roomDevices.size === 0) {
          rooms.delete(device.roomId);
        }
      }
      
      devices.delete(deviceId);
      console.log(`Cleaned up inactive device ${deviceId}`);
    }
  });
}, 5 * 60 * 1000); // Run every 5 minutes

// Health check endpoint
console.log("Nearby Share Signaling Server started");
console.log("Rooms:", rooms.size);
console.log("Connected devices:", devices.size);