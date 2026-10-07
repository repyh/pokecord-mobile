import { z } from 'zod';

export const API_VERSION = 1;
export const HealthResponse = z.object({
  status: z.literal('ok'),
  apiVersion: z.literal(API_VERSION),
});
export const ReadinessResponse = z.object({
  status: z.literal('ready'),
  apiVersion: z.literal(API_VERSION),
  database: z.literal('connected'),
  schemaVersion: z.string().min(1),
});
export type Readiness = z.infer<typeof ReadinessResponse>;
