// Load .env for scripts run with tsx. Next.js loads it on its own.
try {
  process.loadEnvFile(".env");
} catch {
  // No .env file: rely on the environment (CI sets variables directly).
}

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set. Copy .env.example to .env and fill it in.`);
  return value;
}
