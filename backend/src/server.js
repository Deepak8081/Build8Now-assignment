import app from './app.js';
import { env } from './config/env.config.js';
import prisma from './common/database/prisma.js';

const PORT = env.PORT || 4000;

const startServer = async () => {
  try {
    // Verify DB connectivity
    await prisma.$connect();
    console.log('[Database] Connected to database successfully.');

    app.listen(PORT, () => {
      console.log(`[Server] Build8Now Backend running in ${env.NODE_ENV} mode.`);
      console.log(`[Server] Listening on http://localhost:${PORT}`);
      console.log(`[Swagger] Docs available at http://localhost:${PORT}/api-docs`);
      console.log(`[Health] Health check at http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('[Server Error] Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
