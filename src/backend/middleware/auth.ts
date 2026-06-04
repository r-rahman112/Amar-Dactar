import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { query } from "../config/db";
import { ENV } from "../config/env";
import { adminAuth } from "../config/firebase-admin";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    status: "active" | "suspended" | "banned";
    token_version?: number;
    firebase_uid?: string;
  };
}

const resolveUserFromFirebase = async (uid: string, email?: string) => {
  let dbUser = await query(
    "SELECT id, email, role, status, token_version, firebase_uid FROM users WHERE firebase_uid = $1 LIMIT 1",
    [uid],
  );

  if (dbUser.rowCount === 0 && email) {
    // Temporary fallback during migration
    const emailMatches = await query(
      "SELECT id, email, role, status, token_version, firebase_uid FROM users WHERE email = $1",
      [email],
    );

    if (emailMatches.rowCount > 1) {
      console.warn(
        `[AUTH] Migration warning: Multiple users found with email ${email}. Aborting firebase_uid mapping.`,
      );
      return null;
    }

    if (emailMatches.rowCount === 1) {
      const dbMatch = emailMatches.rows[0];
      if (!dbMatch.firebase_uid) {
        // Map account dynamically if missing (migration helper)
        console.log(
          `[AUTH] Mapping firebase_uid for user ${dbMatch.id} (${email})`,
        );
        await query(
          "UPDATE users SET firebase_uid = $1 WHERE id = $2 AND firebase_uid IS NULL",
          [uid, dbMatch.id],
        );
        dbMatch.firebase_uid = uid;
      } else if (dbMatch.firebase_uid !== uid) {
        console.warn(
          `[AUTH] Firebase UID mismatch for user ${email}. DB has ${dbMatch.firebase_uid}, Firebase provided ${uid}`,
        );
        return null;
      }
      return dbMatch;
    }
  }

  return dbUser.rowCount > 0 ? dbUser.rows[0] : null;
};

export const optionalAuthenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const token =
    req.cookies?.accessToken || req.headers["authorization"]?.split(" ")[1];

  if (!token) return next();

  try {
    const isBlacklisted = await query(
      "SELECT 1 FROM token_blacklist WHERE token = $1",
      [token],
    );
    if (isBlacklisted.rows.length > 0) return next();

    try {
      // 1. Try Firebase Auth
      const decodedFirebaseToken = await adminAuth.verifyIdToken(token);
      console.log(
        `[AUTH] Firebase token verified for UID: ${decodedFirebaseToken.uid}`,
      );
      const userRecord = await resolveUserFromFirebase(
        decodedFirebaseToken.uid,
        decodedFirebaseToken.email,
      );
      if (userRecord) {
        req.user = userRecord;
        return next();
      } else {
        console.warn(
          `[AUTH] User record not found for Firebase UID: ${decodedFirebaseToken.uid}`,
        );
      }
    } catch (firebaseErr: any) {
      // Firebase verification failed. Fallback to JWT if not explicitly requested firebase
      // Proceed to try JWT
      console.log(
        `[AUTH] Firebase verification failed (expected for legacy tokens): ${firebaseErr.message}`,
      );
    }

    if (!ENV.ENABLE_LEGACY_JWT) {
      return next();
    }

    // 2. Try Legacy JWT
    jwt.verify(token, ENV.JWT_SECRET, async (err: any, user: any) => {
      if (err) return next();

      const dbUser = await query(
        "SELECT id, email, role, status, token_version, firebase_uid FROM users WHERE id = $1",
        [user.id],
      );
      if (
        !dbUser.rows[0] ||
        dbUser.rows[0].token_version !== user.token_version
      )
        return next();

      req.user = dbUser.rows[0];
      next();
    });
  } catch (e) {
    next();
  }
};

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const token =
    req.cookies?.accessToken || req.headers["authorization"]?.split(" ")[1];

  if (!token)
    return res
      .status(401)
      .json({ error: "Access denied. You must be logged in." });

  try {
    const isBlacklisted = await query(
      "SELECT 1 FROM token_blacklist WHERE token = $1",
      [token],
    );
    if (isBlacklisted.rows.length > 0)
      return res.status(403).json({ error: "Token revoked" });

    try {
      // 1. Try Firebase Auth
      const decodedFirebaseToken = await adminAuth.verifyIdToken(token);
      console.log(
        `[AUTH] Firebase token verified for UID: ${decodedFirebaseToken.uid}`,
      );
      const userRecord = await resolveUserFromFirebase(
        decodedFirebaseToken.uid,
        decodedFirebaseToken.email,
      );

      if (userRecord) {
        if (userRecord.status === "banned") {
          console.warn(
            `[AUTH] Access denied: User ${userRecord.id} is banned.`,
          );
          return res
            .status(403)
            .json({ error: "Your account has been permanently banned." });
        }
        if (userRecord.status === "suspended") {
          console.warn(
            `[AUTH] Access denied: User ${userRecord.id} is suspended.`,
          );
          return res
            .status(403)
            .json({ error: "Your account is temporarily suspended." });
        }
        req.user = userRecord;
        return next();
      } else {
        console.warn(
          `[AUTH] User record not found for Firebase UID: ${decodedFirebaseToken.uid}`,
        );
        return res
          .status(403)
          .json({ error: "User record not found in database." });
      }
    } catch (firebaseErr: any) {
      // Fallback to legacy JWT verification
      console.log(
        `[AUTH] Firebase verification failed (expected for legacy tokens): ${firebaseErr.message}`,
      );
    }

    if (!ENV.ENABLE_LEGACY_JWT) {
      return res
        .status(403)
        .json({
          error: "Authentication required. Legacy tokens are disabled.",
        });
    }

    // 2. Try Legacy JWT
    jwt.verify(token, ENV.JWT_SECRET, async (err: any, user: any) => {
      if (err)
        return res.status(403).json({ error: "Invalid or expired token" });

      const dbUserResult = await query(
        "SELECT id, email, role, status, token_version, firebase_uid FROM users WHERE id = $1",
        [user.id],
      );
      const dbUser = dbUserResult.rows[0];

      if (!dbUser || dbUser.token_version !== user.token_version) {
        return res
          .status(403)
          .json({ error: "Session expired due to security update" });
      }

      if (dbUser.status === "banned") {
        return res
          .status(403)
          .json({ error: "Your account has been permanently banned." });
      }
      if (dbUser.status === "suspended") {
        return res
          .status(403)
          .json({ error: "Your account is temporarily suspended." });
      }

      req.user = dbUser;
      next();
    });
  } catch (e) {
    return res.status(500).json({ error: "Auth failed" });
  }
};

export const isDoctor = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  if (req.user?.role === "DOCTOR") {
    next();
  } else {
    res.status(403).json({ error: "Requires doctor privileges" });
  }
};

export const isAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  if (req.user?.role === "ADMIN") {
    next();
  } else {
    res.status(403).json({ error: "Requires admin privileges" });
  }
};
