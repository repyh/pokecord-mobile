import postgres from 'postgres';

export const SCHEMA_VERSION = '001_baseline.sql';

export function connectDatabase(url: string) {
  return postgres(url, { max: 5, connect_timeout: 5, idle_timeout: 20 });
}

export async function checkDatabase(sql: postgres.Sql) {
  const rows = await sql<{ version: string }[]>`
    SELECT version FROM public.schema_migrations
    WHERE version = ${SCHEMA_VERSION}
  `;
  if (rows.length !== 1)
    throw new Error('Required database migration is missing');
  return SCHEMA_VERSION;
}
