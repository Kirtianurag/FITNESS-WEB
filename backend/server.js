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
    if (!userId) return;
    const uid = String(userId);
    socket.join(uid);
    console.log(`User ${socket.id} joined personal room: ${uid}`);
  });

  socket.on('join_room', (room) => {
    if (!room) return;
    const r = String(room);
    socket.join(r);
    console.log(`User ${socket.id} joined room: ${r}`);
  });

  socket.on('leave_room', (room) => {
    if (!room) return;
    const r = String(room);
    socket.leave(r);
    console.log(`User ${socket.id} left room: ${r}`);
  });

  socket.on('send_message', (data) => {
    console.log(`Message sent in room ${data.room} from ${data.senderId} to ${data.recipientId}`);
    
    const room = data.room ? String(data.room) : '';
    const recipientId = data.recipientId ? String(data.recipientId) : '';

    // Broadcast to the chat room
    if (room) {
      io.to(room).emit('receive_message', data);
    }
    
    // Also deliver to recipient's personal room
    if (recipientId && recipientId !== room) {
      io.to(recipientId).emit('receive_message', data);
      io.to(recipientId).emit('new_message_notification', data);
    }
  });

  socket.on('typing', (data) => {
    if (data.room) {
      socket.to(String(data.room)).emit('user_typing', data);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
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
