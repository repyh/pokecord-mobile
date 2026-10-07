import { z } from 'zod';

const Environment = z.object({
  DATABASE_URL: z
    .string()
    .url()
    .refine((url) => /^postgres(ql)?:\/\//.test(url), 'Use a PostgreSQL URL'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  HOST: z.string().min(1).default('0.0.0.0'),
  APP_ENV: z.enum(['local', 'staging', 'production']).default('local'),
});

export function readConfig(
  env: Record<string, string | undefined> = process.env,
) {
  const result = Environment.safeParse(env);
  if (!result.success) {
    // Report field names only: connection URLs can contain credentials.
    throw new Error(
      `Invalid server configuration: ${[...new Set(result.error.issues.map((issue) => issue.path.join('.')))].join(', ')}`,
    );
  }
  return result.data;
}
