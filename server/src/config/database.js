import mongoose from 'mongoose';
import logger from '../utils/logger.js';

let dbAvailable = false;

/** True once MongoDB is connected — controllers can pick a data layer. */
export const isDbAvailable = () => dbAvailable;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    dbAvailable = true;
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // Graceful degradation: the in-memory store (src/store/memoryStore.js)
    // backs the collaboration/admin/user APIs so the server still boots and
    // serves real endpoints in DB-less environments (dev, previews, CI).
    dbAvailable = false;
    logger.error(`MongoDB Connection Error: ${error.message}`);
    logger.warn('Running in memory-store mode — MongoDB endpoints will be unavailable');
  }
};

export default connectDB;
