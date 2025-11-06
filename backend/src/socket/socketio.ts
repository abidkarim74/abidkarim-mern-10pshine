import { Server } from 'socket.io';
import http from 'http';
import express from 'express';

const app = express();
const mainServer = http.createServer(app);

const io = new Server(mainServer, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['POST', 'GET', 'PUT', 'DELETE']
  }
});

const userSocketMap: { [key: string]: string } = {};

const getReceivedSocketId = (receiverId: string) => {
  return userSocketMap[receiverId] || null;
};

const getOnlineUsers = () => {
  return Object.keys(userSocketMap);
};

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  const userId = socket.handshake.query.userId as string;

  if (userId && userId !== 'undefined' && userId !== 'null') {
    // Remove any existing socket for this user (handle multiple connections)
    for (const [existingUserId, existingSocketId] of Object.entries(userSocketMap)) {
      if (existingUserId === userId) {
        console.log(`Removing duplicate connection for user ${userId}`);
        delete userSocketMap[existingUserId];
        break;
      }
    }

    userSocketMap[userId] = socket.id;
    console.log(`User ${userId} mapped to socket ${socket.id}`);
  } else {
    console.log('User connected without valid userId:', userId);
    return;
  }

  console.log("Online users:", getOnlineUsers());
  
  // Emit to ALL connected clients including the newly connected one
  io.emit('getOnlineUsers', getOnlineUsers());

  // Handle manual online users request
  socket.on('requestOnlineUsers', () => {
    socket.emit('getOnlineUsers', getOnlineUsers());
  });

  // Handle like notifications from frontend
  socket.on('send_like_notification', async (data) => {
    try {
      const { recipientId, senderId, senderName, noteId, noteTitle, message } = data;
      
      console.log('Received like notification:', { recipientId, senderId, noteId });
      
      const receiverSocketId = getReceivedSocketId(recipientId);
      
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('new_like_notification', {
          _id: Date.now().toString(), // Temporary ID until saved in DB
          recipient: recipientId,
          sender: {
            _id: senderId,
            firstname: senderName.split(' ')[0],
            lastname: senderName.split(' ')[1] || '',
            username: senderName.replace(/\s+/g, '').toLowerCase()
          },
          note: {
            _id: noteId,
            title: noteTitle
          },
          message: message,
          read: false,
          createdAt: new Date().toISOString()
        });
        console.log('Like notification sent to user:', recipientId);
      } else {
        console.log('Recipient not online:', recipientId);
      }
    } catch (error) {
      console.error('Error sending like notification:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);

    // Find and remove the user by socket ID (more reliable)
    let disconnectedUserId: string | null = null;
    for (const [uid, socketId] of Object.entries(userSocketMap)) {
      if (socketId === socket.id) {
        disconnectedUserId = uid;
        delete userSocketMap[uid];
        break;
      }
    }

    if (disconnectedUserId) {
      console.log(`Removed user ${disconnectedUserId} from socket mapping!`);
    } else {
      console.log(`Socket ${socket.id} not found in user mapping`);
    }

    console.log("Remaining online users:", getOnlineUsers());
    io.emit('getOnlineUsers', getOnlineUsers());
  });

  // Handle connection errors
  socket.on('error', (error) => {
    console.error(`Socket error for user ${userId}:`, error);
  });
});

// Helper function to broadcast to all clients
const broadcastOnlineUsers = () => {
  io.emit('getOnlineUsers', getOnlineUsers());
};

export { app, io, mainServer, getReceivedSocketId, getOnlineUsers, broadcastOnlineUsers };