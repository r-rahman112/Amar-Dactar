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
  },
  get ENABLE_LEGACY_JWT() {
    return process.env.ENABLE_LEGACY_JWT === 'true'; // Disabled by default for Phase 2 as per constraints
  },
  get ADMIN_SEED() {
    return process.env.ADMIN_SEED === 'true';
  }
};
