let adminApp: any | null = null;
let adminAuthInstance: any | null = null;
let firebaseAdminLoadError: Error | null = null;

export const getFirebaseAdminStatus = () => ({
  initialized: Boolean(adminApp),
  error: firebaseAdminLoadError?.message ?? null,
});

export async function getAdminAuth() {
  if (adminAuthInstance) return adminAuthInstance;

  try {
    const loadFirebaseAdmin = new Function("specifier", "return import(specifier)") as (specifier: string) => Promise<any>;
    const adminModule = await loadFirebaseAdmin("firebase-admin");
    const admin = adminModule.default ?? adminModule;

    adminApp = admin.apps.length ? admin.apps[0] : admin.initializeApp();
    adminAuthInstance = admin.auth(adminApp);
    console.log("[FIREBASE ADMIN] Initialized application successfully.");
    return adminAuthInstance;
  } catch (error: any) {
    firebaseAdminLoadError = error instanceof Error ? error : new Error(String(error));
    console.error("[FIREBASE ADMIN] Initialization error", firebaseAdminLoadError);
    throw firebaseAdminLoadError;
  }
}
