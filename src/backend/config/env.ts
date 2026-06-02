export function validateEnv() {
  const missing: string[] = [];

  if (!process.env.JWT_SECRET) {
    missing.push('JWT_SECRET');
  }

  if (missing.length > 0) {
    throw new Error(`Fatal: Missing required environment variables: ${missing.join(', ')}`);
  }
}

export const ENV = {
  get JWT_SECRET() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('Fatal: JWT_SECRET is missing');
    }
    return secret;
  }
};
