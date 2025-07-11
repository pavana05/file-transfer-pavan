import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  const url = new URL(req.url);
  const roomId = url.searchParams.get("room");
  const deviceName = url.searchParams.get("device");

  if (!roomId || !deviceName) {
    return new Response("Missing room or device parameter", { status: 400 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
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
      const message = JSON.parse(event.data);
      console.log(`Message from ${deviceId}:`, message.type);

      // Forward WebRTC signaling messages
      if (message.targetDevice && devices.has(message.targetDevice)) {
        const targetDevice = devices.get(message.targetDevice)!;
        
        if (targetDevice.socket.readyState === WebSocket.OPEN) {
          // Add sender info to message
          const forwardedMessage = {
            ...message,
            fromDevice: deviceId,
            fromDeviceName: deviceName
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

// Cleanup inactive connections periodically
setInterval(() => {
  const now = new Date();
  const maxAge = 30 * 60 * 1000; // 30 minutes

  devices.forEach((device, deviceId) => {
    if (now.getTime() - device.joinedAt.getTime() > maxAge) {
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
      console.log(`Cleaned up inactive device ${deviceId}`);
    }
  });
}, 5 * 60 * 1000); // Run every 5 minutes