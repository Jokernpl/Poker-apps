/**
 * =====================================================
 * GAME SOCKET.IO EVENTS
 * =====================================================
 * Real-time game logic via WebSocket
 * MVP: Basic connection + room management
 */

import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_change_me';

interface AuthenticatedSocket extends Socket {
  user?: {
    id: string;
    email: string;
    username: string;
  };
}

/**
 * Setup Socket.io handlers
 */
export function setupGameSocket(io: SocketIOServer): void {
  // =====================================================
  // MIDDLEWARE: JWT Authentication
  // =====================================================
  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication token required'));
    }

    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  // =====================================================
  // CONNECTION
  // =====================================================
  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`👤 User connected: ${socket.user?.username} (${socket.id})`);

    // =====================================================
    // LOBBY EVENTS
    // =====================================================

    /**
     * CLIENT -> SERVER: Join lobby
     */
    socket.on('lobby:join', () => {
      socket.join('lobby');
      console.log(`📍 ${socket.user?.username} joined lobby`);

      // Emit event to all in lobby
      io.to('lobby').emit('lobby:user-joined', {
        username: socket.user?.username,
        timestamp: new Date(),
      });
    });

    /**
     * CLIENT -> SERVER: Leave lobby
     */
    socket.on('lobby:leave', () => {
      socket.leave('lobby');
      console.log(`📍 ${socket.user?.username} left lobby`);

      io.to('lobby').emit('lobby:user-left', {
        username: socket.user?.username,
        timestamp: new Date(),
      });
    });

    // =====================================================
    // TABLE EVENTS
    // =====================================================

    /**
     * CLIENT -> SERVER: Join table
     * Payload: { tableId }
     */
    socket.on('table:join', (data: { tableId: string }) => {
      const { tableId } = data;
      const roomName = `table:${tableId}`;

      socket.join(roomName);
      console.log(`🎰 ${socket.user?.username} joined table ${tableId}`);

      // Notify all in table
      io.to(roomName).emit('table:player-joined', {
        username: socket.user?.username,
        userId: socket.user?.id,
        timestamp: new Date(),
      });
    });

    /**
     * CLIENT -> SERVER: Leave table
     * Payload: { tableId }
     */
    socket.on('table:leave', (data: { tableId: string }) => {
      const { tableId } = data;
      const roomName = `table:${tableId}`;

      socket.leave(roomName);
      console.log(`🎰 ${socket.user?.username} left table ${tableId}`);

      io.to(roomName).emit('table:player-left', {
        username: socket.user?.username,
        userId: socket.user?.id,
        timestamp: new Date(),
      });
    });

    // =====================================================
    // GAME EVENTS (Placeholder)
    // =====================================================

    /**
     * CLIENT -> SERVER: Player action (fold, call, raise, etc)
     * Payload: { tableId, action, amount? }
     */
    socket.on('game:player-action', (data: any) => {
      const { tableId, action, amount } = data;
      const roomName = `table:${tableId}`;

      console.log(`🎲 Action from ${socket.user?.username}: ${action}`);

      // TODO: Implement game logic
      // - Validate action
      // - Update pot
      // - Check if hand is complete
      // - Determine winner
      // - Broadcast to all players

      io.to(roomName).emit('game:action-received', {
        username: socket.user?.username,
        action,
        amount,
        timestamp: new Date(),
      });
    });

    /**
     * CLIENT -> SERVER: Chat message
     * Payload: { tableId, message }
     */
    socket.on('table:chat', (data: { tableId: string; message: string }) => {
      const { tableId, message } = data;
      const roomName = `table:${tableId}`;

      // Sanitize message
      const sanitized = message.substring(0, 500);

      console.log(`💬 ${socket.user?.username} at table ${tableId}: ${sanitized}`);

      io.to(roomName).emit('table:chat-message', {
        username: socket.user?.username,
        userId: socket.user?.id,
        message: sanitized,
        timestamp: new Date(),
      });
    });

    // =====================================================
    // DISCONNECTION
    // =====================================================
    socket.on('disconnect', () => {
      console.log(`👤 User disconnected: ${socket.user?.username} (${socket.id})`);

      // Notify all rooms the user was in
      socket.rooms.forEach((room) => {
        if (room !== socket.id) {
          io.to(room).emit('user:disconnected', {
            username: socket.user?.username,
            userId: socket.user?.id,
            timestamp: new Date(),
          });
        }
      });
    });

    // =====================================================
    // ERROR HANDLING
    // =====================================================
    socket.on('error', (error) => {
      console.error(`❌ Socket error for ${socket.user?.username}:`, error);
    });
  });
}

export default setupGameSocket;
