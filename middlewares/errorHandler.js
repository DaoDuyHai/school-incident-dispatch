import { logger } from '../config/logger.js';

export const errorHandler = (error, req, res, _next) => {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal server error.';

  // 1. Xử lý lỗi Mongoose CastError (ObjectId không đúng định dạng 24 hex)
  if (error.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ID format for parameter: '${error.value}'.`;
  }

  // 2. Xử lý lỗi Mongoose ValidationError (Vi phạm ràng buộc schema)
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(error.errors)
      .map((val) => val.message)
      .join(', ');
  }

  // 3. Xử lý lỗi MongoDB Duplicate Key (E11000)
  if (error.code === 11000) {
    statusCode = 409;
    const field = Object.keys(error.keyValue || {})[0] || 'Field';
    message = `${field} already exists.`;
  }

  // 4. Xử lý lỗi cú pháp JSON từ express.json()
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    statusCode = 400;
    message = 'Malformed JSON payload in request body.';
  }

  const requestId = req.id || req.requestId;

  if (statusCode >= 500) {
    if (req.log) {
      req.log.error(
        { err: error, requestId, statusCode },
        '[SERVER ERROR] Internal Server Error'
      );
    } else {
      logger.error(
        { err: error, requestId, statusCode },
        '[SERVER ERROR] Internal Server Error'
      );
    }
  } else if (req.log) {
    req.log.warn(
      { statusCode, message, requestId },
      '[CLIENT ERROR] Client Handled Error'
    );
  }

  return res.status(statusCode).json({
    success: false,
    message,
    ...(requestId ? { requestId } : {}),
  });
};
