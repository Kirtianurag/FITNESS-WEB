const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Socket.IO
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join_personal_room', (userId) => {
    socket.join(userId);
    console.log(`User ${socket.id} joined personal room: ${userId}`);
  });

  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room: ${room}`);
  });

  socket.on('leave_room', (room) => {
    socket.leave(room);
    console.log(`User ${socket.id} left room: ${room}`);
  });

  socket.on('send_message', (data) => {
    console.log(`Message sent in room ${data.room} from ${data.senderId} to ${data.recipientId}`);
    
    // Broadcast to room and/or recipient personal room
    const targets = [];
    if (data.room) targets.push(data.room);
    if (data.recipientId) targets.push(data.recipientId);

    if (targets.length > 0) {
      // socket.to(targets) sends to everyone in data.room and recipient personal room
      // Socket.IO deduplicates automatically so user only gets it once
      socket.to(targets).emit('receive_message', data);
    }
    
    // Also trigger notification dot in recipient's personal room
    if (data.recipientId) {
      socket.to(data.recipientId).emit('new_message_notification', data);
    }
  });

  socket.on('typing', (data) => {
    if (data.room) {
      socket.to(data.room).emit('user_typing', data);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Routes
const authRoutes = require('./routes/authRoutes');
const workoutRoutes = require('./routes/workoutRoutes');
const questRoutes = require('./routes/questRoutes');
const userRoutes = require('./routes/userRoutes');
const statRoutes = require('./routes/statRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/quests', questRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stats', statRoutes);

// Routes Placeholder
app.get('/', (req, res) => {
  res.send('Fitness API is running...');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
