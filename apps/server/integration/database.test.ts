import { expect, test } from 'bun:test';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createApp } from '../src/app';
import { checkDatabase, connectDatabase } from '../src/database';
import { migrate } from '../src/migrate';

const url = process.env.TEST_DATABASE_URL;
if (!url)
  throw new Error(
    'TEST_DATABASE_URL is required; use a disposable test database.',
  );
const databaseName = new URL(url).pathname.slice(1);
if (!databaseName.endsWith('_test'))
  throw new Error('Integration database name must end with _test.');

test('migrations are idempotent, detect edits, roll back failures and support readiness', async () => {
  const sql = connectDatabase(url);
  const folder = await mkdtemp(join(tmpdir(), 'pokecord-migrations-'));
  const directory = pathToFileURL(`${folder}/`);
  const app = createApp({ checkDatabase: () => checkDatabase(sql) });
  try {
    await sql`DROP SCHEMA IF EXISTS pokecord CASCADE`;
    await sql`DROP TABLE IF EXISTS public.schema_migrations`;
    expect((await app.inject('/ready')).statusCode).toBe(503);
    await Promise.all([migrate(url), migrate(url)]);
    await migrate(url);
    expect((await app.inject('/ready')).statusCode).toBe(200);
    const rows = await sql`SELECT version FROM public.schema_migrations`;
    expect(rows).toHaveLength(1);

    const baseline = await readFile(
      new URL('../migrations/001_baseline.sql', import.meta.url),
      'utf8',
    );
    await writeFile(
      join(folder, '001_baseline.sql'),
      `${baseline}\n-- changed`,
    );
    await expect(migrate(url, directory)).rejects.toThrow(
      'Applied migration changed',
    );
    await writeFile(join(folder, '001_baseline.sql'), baseline);
    await writeFile(
      join(folder, '002_failure.sql'),
      'CREATE TABLE pokecord.rollback_probe (id int); SELECT nonexistent_function();',
    );
    await expect(migrate(url, directory)).rejects.toThrow();
    const probe =
      await sql`SELECT to_regclass('pokecord.rollback_probe') AS name`;
    expect(probe[0]?.name).toBeNull();
    expect(
      await sql`SELECT version FROM public.schema_migrations`,
    ).toHaveLength(1);
  } finally {
    await app.close();
    await sql.end({ timeout: 5 });
    // folder is the explicit directory returned by mkdtemp for this test only.
    await rm(folder, { recursive: true, force: true });
  }
}, 30_000);
