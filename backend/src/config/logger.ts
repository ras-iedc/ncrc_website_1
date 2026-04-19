import pino from 'pino';
import { env } from './env.js';
import path from 'node:path';
import fs from 'node:fs';

// On Vercel serverless, log to stdout only
const isServerless = env.IS_VERCEL;

let logDir: string | undefined;
if (!isServerless) {
  logDir = path.resolve(env.LOG_PATH);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
}

export const logger = pino({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  transport:
    isServerless || env.NODE_ENV === 'development'
      ? { target: 'pino/file', options: { destination: 1 } }
      : {
          target: 'pino-roll',
          options: {
            file: path.join(logDir!, 'app.log'),
            frequency: 'daily',
            dateFormat: 'yyyy-MM-dd',
            mkdir: true,
          },
        },
});
