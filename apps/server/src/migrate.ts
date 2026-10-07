import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import postgres from 'postgres';
import { readConfig } from './config';

export async function migrate(
  url: string,
  directory = new URL('../migrations/', import.meta.url),
) {
  // One connection keeps the transaction/advisory lock on the same session.
  const sql = postgres(url, { max: 1, connect_timeout: 5 });
  try {
    const files = (await readdir(directory))
      .filter((name) => /^\d{3}_[a-z0-9_]+\.sql$/.test(name))
      .sort();
    if (files.length === 0) throw new Error('No database migrations found');
    await sql.begin(async (tx) => {
      await tx`SELECT pg_advisory_xact_lock(73624101)`;
      await tx`CREATE TABLE IF NOT EXISTS public.schema_migrations (
        version text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now()
      )`;
      const applied = await tx<
        { version: string; checksum: string }[]
      >`SELECT version, checksum FROM public.schema_migrations`;
      for (const row of applied) {
        if (!files.includes(row.version))
          throw new Error(
            `Applied migration missing from source: ${row.version}`,
          );
      }
      for (const file of files) {
        const source = await readFile(new URL(file, directory), 'utf8');
        const checksum = createHash('sha256').update(source).digest('hex');
        const previous = applied.find((row) => row.version === file);
        if (previous) {
          if (previous.checksum !== checksum)
            throw new Error(`Applied migration changed: ${file}`);
          continue;
        }
        await tx.unsafe(source);
        await tx`INSERT INTO public.schema_migrations (version, checksum) VALUES (${file}, ${checksum})`;
      }
    });
  } finally {
    await sql.end({ timeout: 5 });
  }
}

if (import.meta.main) {
  try {
    await migrate(readConfig().DATABASE_URL);
    console.info('Database migrations applied.');
  } catch {
    console.error(
      'Database migration failed. Check connectivity, permissions and migration integrity.',
    );
    process.exitCode = 1;
  }
}
