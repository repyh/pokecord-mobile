import cors from '@fastify/cors';
import { API_VERSION } from '@pokecord/contracts';
import Fastify from 'fastify';

export function createApp(options: {
  checkDatabase: () => Promise<string>;
  logger?: boolean;
  browserOrigins?: string[];
}) {
  const app = Fastify({
    logger: options.logger ?? false,
    bodyLimit: 32 * 1024,
    requestTimeout: 10_000,
    logController: new Fastify.LogController({ disableRequestLogging: true }),
  });

  app.register(cors, {
    origin: options.browserOrigins ?? [],
    methods: ['GET'],
    credentials: false,
  });

  app.get('/health', async () => ({ status: 'ok', apiVersion: API_VERSION }));
  app.get('/ready', async (_request, reply) => {
    try {
      const schemaVersion = await options.checkDatabase();
      return {
        status: 'ready',
        apiVersion: API_VERSION,
        database: 'connected',
        schemaVersion,
      };
    } catch {
      // Do not expose database connection details or credentials in responses/logs.
      return reply
        .code(503)
        .send({ status: 'unavailable', apiVersion: API_VERSION });
    }
  });

  return app;
}
