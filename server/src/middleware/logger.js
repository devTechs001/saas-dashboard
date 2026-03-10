import morgan from 'morgan';
import logger from '../utils/logger.js';

const requestLogger = morgan('combined', {
  stream: {
    write: (message) => {
      logger.info(message.trim());
    },
  },
});

export default requestLogger;
