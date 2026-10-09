import { z } from "zod";

const serverSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
});

const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.url(),
  NEXT_PUBLIC_API_URL: z.url(),
  // WebSocket origin for live conversations (comments & chat). Optional — when
  // unset the client derives it from NEXT_PUBLIC_API_URL (http→ws, drop the
  // /api/v1 path). e.g. ws://localhost:8000
  NEXT_PUBLIC_WS_URL: z.string().optional(),
  NEXT_PUBLIC_APP_NAME: z.string().min(1),
  // Google Analytics 4 measurement id (G-XXXXXXXX). Optional — GA is disabled
  // when unset so local/dev builds don't need a property.
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),
  NEXT_PUBLIC_ENABLE_QUERY_DEVTOOLS: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
});

function parseEnv<T extends z.ZodType>(
  schema: T,
  source: Record<string, string | undefined>,
): z.infer<T> {
  const result = schema.safeParse(source);
  if (!result.success) {
    const formatted = result.error.issues
      .map((i) => `  ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid environment variables:\n${formatted}`);
  }
  return result.data;
}

export const serverEnv = parseEnv(serverSchema, {
  NODE_ENV: process.env.NODE_ENV,
});

export const clientEnv = parseEnv(clientSchema, {
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  NEXT_PUBLIC_ENABLE_QUERY_DEVTOOLS:
    process.env.NEXT_PUBLIC_ENABLE_QUERY_DEVTOOLS,
});

export const env = {
  ...serverEnv,
  ...clientEnv,
  isDev: serverEnv.NODE_ENV === "development",
  isProd: serverEnv.NODE_ENV === "production",
} as const;
