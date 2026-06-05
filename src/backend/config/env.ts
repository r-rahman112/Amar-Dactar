import crypto from "crypto";

let developmentJwtSecret: string | null = null;

export function validateEnv() {
  const missing: string[] = [];

  if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
    missing.push("JWT_SECRET");
  }

  if (process.env.ADMIN_SEED === "true") {
    if (!process.env.ADMIN_SEED_EMAIL) missing.push("ADMIN_SEED_EMAIL");
    if (!process.env.ADMIN_SEED_PASSWORD) missing.push("ADMIN_SEED_PASSWORD");
  }

  if (missing.length > 0) {
    throw new Error(`Fatal: Missing required environment variables: ${missing.join(", ")}`);
  }

  if (!process.env.JWT_SECRET) {
    console.warn(
      "[ENV] JWT_SECRET is missing. Using an ephemeral development-only secret; set JWT_SECRET in production and shared environments.",
    );
  }
}

export const ENV = {
  get JWT_SECRET() {
    const secret = process.env.JWT_SECRET;
    if (secret) return secret;
    if (process.env.NODE_ENV === "production") {
      throw new Error("Fatal: JWT_SECRET is missing");
    }
    developmentJwtSecret ??= crypto.randomBytes(32).toString("hex");
    return developmentJwtSecret;
  },
  get ENABLE_LEGACY_JWT() {
    return process.env.ENABLE_LEGACY_JWT === "true";
  },
  get ADMIN_SEED() {
    return process.env.ADMIN_SEED === "true";
  },
  get ADMIN_SEED_EMAIL() {
    return process.env.ADMIN_SEED_EMAIL;
  },
  get ADMIN_SEED_PASSWORD() {
    return process.env.ADMIN_SEED_PASSWORD;
  },
  get ADMIN_SEED_NAME() {
    return process.env.ADMIN_SEED_NAME || "Admin User";
  },
};
