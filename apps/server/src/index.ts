import { createApp } from './app';
import { readConfig } from './config';
import { checkDatabase, connectDatabase } from './database';

const config = readConfig();
const sql = connectDatabase(config.DATABASE_URL);
const app = createApp({
  checkDatabase: () => checkDatabase(sql),
  logger: true,
  browserOrigins: config.BROWSER_ORIGINS,
});
app.addHook('onClose', async () => {
  await sql.end({ timeout: 5 });
});

let closing = false;
async function shutdown() {
  if (closing) return;
  closing = true;
  await app.close();
}
process.once('SIGINT', () => {
  void shutdown();
});
process.once('SIGTERM', () => {
  void shutdown();
});

try {
  await app.listen({ port: config.PORT, host: config.HOST });
} catch {
  await app.close();
  console.error(
    'Server startup failed. Check port availability and configuration.',
  );
  process.exitCode = 1;
}
