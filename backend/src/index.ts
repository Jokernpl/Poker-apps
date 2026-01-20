/**
 * =====================================================
 * POKER APP - MAIN SERVER
 * =====================================================
 * Entry point per Express + Socket.io server
 * Autore: Tasklet
 * Data: 2026
 */

import express, { Express, Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './database/connection';
import { authenticateToken } from './middleware/auth';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import gameRoutes from './routes/game.routes';
import adminRoutes from './routes/admin.routes';
import { setupGameSocket } from './sockets/game.socket';

// Carica variabili d'ambiente
dotenv.config();

// =====================================================
// CONFIGURAZIONE
// =====================================================
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || 'localhost';
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';
const NODE_ENV = process.env.NODE_ENV || 'development';

// =====================================================
// INIZIALIZZAZIONE EXPRESS
// =====================================================
const app: Express = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  path: '/socket.io',
});

// =====================================================
// MIDDLEWARE
// =====================================================

// CORS
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true,
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware (development only)
if (NODE_ENV === 'development') {
  app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// =====================================================
// ROUTES
// =====================================================

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API v1
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[ERROR]', err);
  res.status(500).json({
    error: NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

// =====================================================
// SOCKET.IO SETUP
// =====================================================
setupGameSocket(io);

// =====================================================
// SERVER START
// =====================================================
const startServer = async () => {
  try {
    console.log('🔍 Connessione al database...');
    await initializeDatabase();
    console.log('✅ Database connesso');

    httpServer.listen(PORT, () => {
      console.log(`\n🎰 POKER APP SERVER\n`);
      console.log(`📍 Running on: ${HOST}:${PORT}`);
      console.log(`🌍 Environment: ${NODE_ENV}`);
      console.log(`🔗 CORS Origin: ${CORS_ORIGIN}`);
      console.log(`\n✅ Server ready!\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export { app, httpServer, io };
