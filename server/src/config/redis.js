import { createClient } from 'redis';
import logger from '../utils/logger.js';

let redisClient = null;

const connectRedis = async () => {
  try {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });

    redisClient.on('error', (err) => {
      logger.error('Redis Client Error:', err);
    });

    await redisClient.connect();
    logger.info('Redis Connected Successfully');
    
    return redisClient;
  } catch (error) {
    logger.error('Redis Connection Error:', error.message);
    return null;
  }
};

const getRedisClient = () => redisClient;

export { connectRedis, getRedisClient };
