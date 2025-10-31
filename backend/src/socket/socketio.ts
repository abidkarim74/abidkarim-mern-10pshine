import { Server } from 'socket.io';
import http from 'http';
import express from 'express';
import { Socket } from 'dgram';


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

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  const userId = socket.handshake.query.userId as string;

  if (userId) {
    userSocketMap[userId] = socket.id;
    console.log(`User ${userId} mapped to socket ${socket.id}`);
  }

  io.emit('getOnlineUsers', Object.keys(userSocketMap));

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);

    if (userId && userSocketMap[userId]) {
      delete userSocketMap[userId];

      console.log(`Removed user ${userId} from socket mapping!`);
    }

    io.emit('getOnlineUsers', Object.keys(userSocketMap));
  });
});

export { app, io, mainServer, getReceivedSocketId};