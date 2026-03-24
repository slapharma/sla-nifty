import http from 'http';
import { createApp } from './app';
import { env } from './config/env';

const app = createApp();
const server = http.createServer(app);

server.listen(Number(env.API_PORT), () => {
  console.log(`[API] Listening on port ${env.API_PORT} (${env.NODE_ENV})`);
});

export { server };
