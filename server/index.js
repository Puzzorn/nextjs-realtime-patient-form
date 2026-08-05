const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 4000;

// In-memory active draft state
let activeDraft = {};

io.on('connection', (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);

  // Send current draft state on client connection
  socket.emit('patient:draft_sync', activeDraft);

  // Realtime field update event
  socket.on('patient:field_update', (data) => {
    if (data && data.field) {
      activeDraft = { ...activeDraft, [data.field]: data.value };
      socket.broadcast.emit('patient:field_update', data);
    }
  });

  // Full form submit event
  socket.on('patient:submit', (data) => {
    console.log('[Socket.io] Patient Form Submitted:', data);
    activeDraft = {};
    io.emit('patient:submitted', { status: 'SUCCESS', id: Date.now().toString(), patient: data });
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`[Server] Socket.io server running on http://localhost:${PORT}`);
});
