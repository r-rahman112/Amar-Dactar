import admin from 'firebase-admin';

try {
  if (!admin.apps.length) {
    admin.initializeApp();
    console.log('[FIREBASE ADMIN] Initialized application successfully.');
  }
} catch (error) {
  console.error('[FIREBASE ADMIN] Initialization error', error);
}

export const adminAuth = admin.auth();
