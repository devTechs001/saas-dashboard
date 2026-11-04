import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js';
import { memoryStore } from '../store/memoryStore.js';

let io = null;

/**
 * Verify the JWT on the socket handshake and derive rooms:
 *  - `user:<id>`      personal room (notifications, targeted events)
 *  - `workspace:<tid>` tenant/workspace room (dashboard sync, presence)
 */
const authenticateSocket = (socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token || typeof token !== 'string') {
    // Allow anonymous connections but scope them to a guest room.
    socket.data.userId = `guest:${socket.id}`;
    socket.data.tenantId = 'guest';
    socket.data.role = 'guest';
    return next();
  }
  // Demo/preview sessions resolve against the in-memory store so realtime
  // features (presence, settings sync) work the same as JWT sessions.
  if (token.startsWith('demo-')) {
    const access = token.replace(/^demo-(refresh-)?/, '');
    let user = null;
    if (access.startsWith('user-')) user = memoryStore.findUser(access.slice('user-'.length));
    else if (access.startsWith('token-')) {
      const role = access.slice('token-'.length);
      user = memoryStore.db.users.find((u) => u.role === role) || memoryStore.db.users[0];
    }
    if (user && user.isActive !== false) {
      socket.data.userId = String(user.id);
      socket.data.tenantId = user.tenantId || 'default';
      socket.data.role = user.role;
      return next();
    }
    socket.data.userId = `guest:${socket.id}`;
    socket.data.tenantId = 'guest';
    socket.data.role = 'guest';
    return next();
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.data.userId = String(decoded.id);
    socket.data.tenantId = decoded.tenantId || 'default';
    socket.data.role = decoded.role;
    next();
  } catch (err) {
    // Do not reject — fall back to guest scope so the UI stays functional.
    logger.warn(`Socket auth failed: ${err.message}`);
    socket.data.userId = `guest:${socket.id}`;
    socket.data.tenantId = 'guest';
    socket.data.role = 'guest';
    next();
  }
};

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [process.env.FRONTEND_URL, process.env.CORS_ORIGIN, 'http://localhost:5173'].filter(Boolean),
      methods: ['GET', 'POST'],
      credentials: true,
    },
    maxHttpBufferSize: 1e5, // 100 KB — messages are events, not file uploads
  });

  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    const { userId, tenantId } = socket.data;
    logger.info(`Socket connected: ${socket.id} (user=${userId})`);

    socket.join(`user:${userId}`);
    socket.join(`workspace:${tenantId}`);

    // Presence: let the workspace know who is online.
    io.to(`workspace:${tenantId}`).emit('presence:update', { userId, status: 'online' });

    socket.on('join_room', (roomId) => {
      if (typeof roomId === 'string' && roomId.length <= 64) socket.join(roomId);
    });

    socket.on('leave_room', (roomId) => {
      if (typeof roomId === 'string') socket.leave(roomId);
    });

    // Client → workspace chat messages, relayed in real time.
    socket.on('chat:message', (msg) => {
      if (!msg || typeof msg.text !== 'string' || msg.text.length > 2000) return;
      io.to(`workspace:${tenantId}`).emit('chat:message', {
        id: `m_${Date.now()}_${socket.id}`,
        channel: typeof msg.channel === 'string' ? msg.channel.slice(0, 32) : 'general',
        text: msg.text.slice(0, 2000),
        user: msg.user || userId,
        time: new Date().toISOString(),
      });
    });

    // Settings changes relay to the user's OTHER sessions in real time.
    socket.on('settings:updated', (payload) => {
      if (!payload || typeof payload !== 'object') return;
      const safe = {
        mode: typeof payload.mode === 'string' ? payload.mode.slice(0, 12) : undefined,
        accent: typeof payload.accent === 'string' ? payload.accent.slice(0, 24) : undefined,
        soundEnabled: payload.soundEnabled === undefined ? undefined : Boolean(payload.soundEnabled),
      };
      socket.to(`user:${userId}`).emit('settings:updated', safe);
    });

    socket.on('disconnect', () => {
      io.to(`workspace:${tenantId}`).emit('presence:update', { userId, status: 'offline' });
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) logger.warn('Socket.io not initialized');
  return io;
};

/* ---------- Typed emitters used by controllers ---------- */

/** Emit a realtime event to every member of a workspace/tenant. */
export const emitToWorkspace = (tenantId, event, payload) => {
  const s = getIO();
  if (s) s.to(`workspace:${tenantId || 'default'}`).emit(event, payload);
};

/** Emit a realtime event to a single user (all their devices). */
export const emitToUser = (userId, event, payload) => {
  const s = getIO();
  if (s) s.to(`user:${userId}`).emit(event, payload);
};

export { initializeSocket, getIO };
