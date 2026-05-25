require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const authRoutes = require('./routes/auth');
const docRoutes = require('./routes/documents');
const facultyRoutes = require('./routes/faculty');
const healthRoutes = require('./routes/health');
const emailRoutes = require('./routes/emails');
const adminFacultyRoutes = require('./routes/admin/faculty');
const adminDocumentRoutes = require('./routes/admin/documents');

const app = express();
const internalRoute = require('./routes/internal');
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? 'http://localhost:3000' : '*',
    methods: ['GET', 'POST']
  }
});

// Make io accessible to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

const upload = multer({ dest: 'uploads/' });

// In development allow requests from the local frontend dev server(s).
if (process.env.NODE_ENV === 'production') {
  app.use(cors({ origin: 'http://localhost:3000' }));
} else {
  app.use(cors()); // permissive during development to avoid CORS-related "Network Error"
}
app.use(express.json());
// Disable ETag for API responses to avoid conditional 304 responses for dynamic data
app.set('etag', false);

// Ensure API responses are not cached by browsers or intermediate proxies.
// This prevents clients from receiving 304 Not Modified for JSON API endpoints.
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});
// Simple request logger to help debug routing / 404 issues in development
app.use((req, res, next) => {
  try {
    console.log(new Date().toISOString(), req.method, req.originalUrl);
  } catch (e) {
    // ignore logging failures
  }
  next();
});
app.use('/uploads', express.static('uploads'));

// Require MONGO_URI to point to Atlas (no local fallback)
const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  console.error('MONGO_URI is not set. Please set MONGO_URI in backend/.env to your Atlas connection string.');
  process.exit(1);
}

mongoose.connect(mongoUri)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Routes
app.use('/api/auth', authRoutes);
// Mount documents routes without multer here so preflight OPTIONS requests are not intercepted by multer.
app.use('/api/documents', docRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/internal', internalRoute);
app.use('/api/emails', emailRoutes);

// Admin routes
app.use('/api/admin/faculty', adminFacultyRoutes);
app.use('/api/admin/documents', adminDocumentRoutes);

// WebSocket connection handler
io.on('connection', (socket) => {
  console.log('📡 Client connected via WebSocket:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('📡 Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server on port ${PORT} with WebSocket support`));