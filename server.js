import http from 'http';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import app from './app.js';
import connectDB from './config/db.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { initIncidentSocket } from './sockets/incidentSocket.js';

// 1. Kết nối cơ sở dữ liệu MongoDB
connectDB();

// 2. Khởi tạo HTTP Server bọc ngoài Express app
const httpServer = http.createServer(app);

// 3. Khởi tạo Socket.io Server kèm cấu hình CORS
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH'],
  },
});

app.set('io', io);
initIncidentSocket(io);

// 4. Graceful Shutdown Handler (SIGTERM & SIGINT)
const gracefulShutdown = (signal) => {
  if (app.locals.isShuttingDown) return;
  app.locals.isShuttingDown = true;
  logger.info(`[SHUTDOWN] Received ${signal}. Starting graceful shutdown...`);

  // Đặt timeout an toàn: Buộc ngắt process nếu các kết nối còn nghẽn quá 10 giây
  const forceTimeout = setTimeout(() => {
    logger.error(
      '[SHUTDOWN] Graceful shutdown timed out (10s). Forcing exit (1).'
    );
    process.exit(1);
  }, 10000);
  forceTimeout.unref();

  // Dừng tiếp nhận request HTTP mới, cho phép các request đang xử lý dở hoàn tất
  httpServer.close((err) => {
    if (err) {
      logger.error({ err }, '[SHUTDOWN] Error closing HTTP server');
      process.exit(1);
    }
    logger.info('[SHUTDOWN] HTTP server closed. In-flight requests completed.');

    // Đóng toàn bộ kết nối WebSocket (Socket.io)
    io.close(() => {
      logger.info('[SHUTDOWN] Socket.io connections closed.');

      // Đóng kết nối cơ sở dữ liệu MongoDB an toàn
      mongoose.connection
        .close(false)
        .then(() => {
          logger.info('[SHUTDOWN] MongoDB connection closed safely.');
          logger.info('[SHUTDOWN] Process terminated gracefully with code 0.');
          process.exit(0);
        })
        .catch((dbErr) => {
          logger.error(
            { err: dbErr },
            '[SHUTDOWN] Error closing MongoDB connection'
          );
          process.exit(1);
        });
    });
  });
};

if (process.env.NODE_ENV !== 'test') {
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

const PORT = env.PORT || 3000;
if (process.env.NODE_ENV !== 'test') {
  httpServer.listen(PORT, () => {
    logger.info(`[SERVER] Server is running on port ${PORT}`);
  });
}

export { app, httpServer, io, gracefulShutdown };
export default app;
