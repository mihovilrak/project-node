import pino from 'pino';

const level = process.env.LOG_LEVEL || 'info';
const isDev = process.env.NODE_ENV !== 'production';
const isTest = process.env.NODE_ENV === 'test';

const logger = pino({
  level,
  ...(isDev && !isTest && {
    transport: {
      target: 'pino/file',
      options: { destination: 1 },
    },
  }),
});

export default logger;
