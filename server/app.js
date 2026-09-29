import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import complaintsRouter from './routes/complaints.js';
import aiRouter from './routes/ai.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString().slice(11, 19)}] ${req.method} ${req.url}`);
  next();
});

// Database connection state and caching for serverless
let isDbConnected = false;
let dbConnectionError = null;
let dbConnectPromise = null;

export async function ensureDbConnected() {
  if (mongoose.connection.readyState === 1) {
    isDbConnected = true;
    dbConnectionError = null;
    return true;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    isDbConnected = false;
    dbConnectionError = 'MONGODB_URI not configured in environment variables';
    return false;
  }

  if (!dbConnectPromise) {
    dbConnectPromise = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    }).then(() => {
      isDbConnected = true;
      dbConnectionError = null;
      console.log('✅ [MongoDB] Successfully connected to MongoDB Atlas!');
      return true;
    }).catch(err => {
      isDbConnected = false;
      dbConnectionError = err.message;
      dbConnectPromise = null;
      console.error('❌ [MongoDB] Connection error:', err.message);
      return false;
    });
  }

  return dbConnectPromise;
}

// Ensure database connection attempt on each incoming request
app.use(async (req, res, next) => {
  await ensureDbConnected();
  next();
});

// MongoDB connection event listeners
mongoose.connection.on('disconnected', () => {
  isDbConnected = false;
  console.warn('[MongoDB] Disconnected from MongoDB Atlas.');
});

mongoose.connection.on('reconnected', () => {
  isDbConnected = true;
  console.log('[MongoDB] Reconnected to MongoDB Atlas.');
});

// Health check endpoint handler
const healthHandler = (req, res) => {
  res.json({
    status: isDbConnected ? 'connected' : 'disconnected',
    database: 'MongoDB Atlas',
    isDbConnected,
    error: dbConnectionError,
    timestamp: new Date().toISOString()
  });
};

app.get('/api/health', healthHandler);
app.get('/health', healthHandler);

// Mount API routes (support both /api/* and root /* for flexible Vercel rewrites)
app.use('/api/complaints', complaintsRouter);
app.use('/complaints', complaintsRouter);

app.use('/api/ai', aiRouter);
app.use('/ai', aiRouter);

// Root route
const rootHandler = (req, res) => {
  res.json({
    service: 'NiwasSetu Operations API',
    database: 'MongoDB Atlas',
    aiModel: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
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
};

app.get('/api', rootHandler);
app.get('/', rootHandler);

export default app;
