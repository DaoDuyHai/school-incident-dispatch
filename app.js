import express from 'express';
import mongoose from 'mongoose';
import userRoutes from './routes/userRoutes.js';
import incidentRoutes from './routes/incidentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { requestLogger } from './middlewares/requestLogger.js';
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from './config/swaggerSpec.js';

const app = express();

// 1. Gắn Structured Logging & Request ID (Correlation ID) cho mọi request
app.use(requestLogger);

// 2. Cấu hình CORS cho Express REST API
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Methods',
    'GET, POST, PATCH, PUT, DELETE, OPTIONS'
  );
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

// 3. Middleware từ chối nhận request mới nếu hệ thống đang thực hiện tắt (Graceful Shutdown)
app.use((req, res, next) => {
  if (app.locals.isShuttingDown) {
    res.set('Connection', 'close');
    return res.status(503).json({
      success: false,
      message: 'Server is currently shutting down. Please retry later.',
    });
  }
  next();
});

// 4. Health-check & Readiness Endpoint cho Docker / Kubernetes / Fly.io
app.get('/health', (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  const healthData = {
    status: isDbConnected ? 'UP' : 'DOWN',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
    database: {
      status: isDbConnected ? 'CONNECTED' : 'DISCONNECTED',
      readyState: mongoose.connection.readyState,
    },
    memoryUsage: {
      rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
    },
  };

  if (!isDbConnected) {
    return res.status(503).json(healthData);
  }

  return res.status(200).json(healthData);
});

// 5. Swagger OpenAPI Documentation UI (/docs & /docs.json)
app.use(
  '/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, {
    customSiteTitle: 'School Incident Dispatch API Docs 📄',
    customCss: '.swagger-ui .topbar { display: none }',
  })
);

app.get('/docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.status(200).send(swaggerDocument);
});

// 6. Root Route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'School Incident Dispatch System API is running live 🚀',
    version: '1.0.0',
    documentation: '/docs',
    openApiJson: '/docs.json',
    health: '/health',
    docs: 'Import postman/SchoolIncidentDispatch.postman_collection.json or visit /docs.',
  });
});

// 7. Định tuyến REST API
app.use('/api/users', userRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api', adminRoutes);

// 8. Bắt các route không tồn tại (404 Handler)
app.use((req, res) => {
  const requestId = req.id || req.requestId;
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    ...(requestId ? { requestId } : {}),
  });
});

// 9. Middleware xử lý lỗi tập trung
app.use(errorHandler);

export default app;
export { app };
