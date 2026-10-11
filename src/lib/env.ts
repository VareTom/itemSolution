import 'server-only'
import { z } from 'zod'

const envSchema = z.object({
  SESSION_SECRET: z.base64().refine((value) => Buffer.from(value, 'base64').length === 32, {
    message: 'SESSION_SECRET must be 32 bytes encoded in base64 (openssl rand -base64 32)',
  }),
  UPSTREAM_BASE_URL: z.url().default('https://be.itemsolution.com'),
})

export const env = envSchema.parse(process.env)
