import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import complaintsRouter from './routes/complaints.js';
import aiRouter from './routes/ai.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString().slice(11, 19)}] ${req.method} ${req.url}`);
  next();
});

// Database connection state
let isDbConnected = false;
let dbConnectionError = null;

async function connectToDatabase() {
  if (!MONGODB_URI) {
    dbConnectionError = 'MONGODB_URI not configured in .env file';
    console.warn('\n⚠️  [MongoDB] MONGODB_URI is not set in .env.');
    console.warn('👉 Please set MONGODB_URI in your .env file with your MongoDB Atlas connection string:');
    console.warn('   MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/niwassetu?retryWrites=true&w=majority\n');
    return;
  }

  try {
    console.log('[MongoDB] Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    isDbConnected = true;
    dbConnectionError = null;
    console.log('✅ [MongoDB] Successfully connected to MongoDB Atlas database!');
  } catch (err) {
    isDbConnected = false;
    dbConnectionError = err.message;
    console.error('❌ [MongoDB] Connection error:', err.message);
  }
}

connectToDatabase();

// MongoDB connection event listeners
mongoose.connection.on('disconnected', () => {
  isDbConnected = false;
  console.warn('[MongoDB] Disconnected from MongoDB Atlas.');
});

mongoose.connection.on('reconnected', () => {
  isDbConnected = true;
  console.log('[MongoDB] Reconnected to MongoDB Atlas.');
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: isDbConnected ? 'connected' : 'disconnected',
    database: 'MongoDB Atlas',
    isDbConnected,
    error: dbConnectionError,
    timestamp: new Date().toISOString()
  });
});

// Mount routes
app.use('/api/complaints', complaintsRouter);
app.use('/api/ai', aiRouter);

// Root route
app.get('/', (req, res) => {
  res.json({
    service: 'NiwasSetu Operations API',
    database: 'MongoDB Atlas',
    aiModel: 'Google Gemini (gemini-2.0-flash)',
    status: isDbConnected ? 'online' : 'waiting_for_mongodb_uri',
    endpoints: {
      health: '/api/health',
      aiStatus: '/api/ai/status',
      aiTest: 'POST /api/ai/test',
      complaints: '/api/complaints',
      seed: 'POST /api/complaints/seed',
      resolveCluster: 'POST /api/complaints/resolve-cluster'
    }
  });
});

// Start Express server
app.listen(PORT, () => {
  console.log(`\n🚀 NiwasSetu Backend Server running at http://localhost:${PORT}`);
  console.log(`📡 API Endpoints available at http://localhost:${PORT}/api/complaints`);
  console.log(`🩺 Health check: http://localhost:${PORT}/api/health\n`);
});
