import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from './logger.js';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGO_URI);
    logger.info(
      `MongoDB Connected successfully to host: ${conn.connection.host}`
    );
  } catch (error) {
    logger.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
