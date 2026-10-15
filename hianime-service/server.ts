import { serve } from '@hono/node-server';
import app from './src/app';
import config from './src/config/config';

const PORT = Number(process.env.PORT) || 3030;

serve({
  fetch: app.fetch,
  port: PORT,
  hostname: '0.0.0.0',
});

console.log(`[Hianime API] Server successfully listening at http://0.0.0.0:${PORT}`);
