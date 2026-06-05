import { getAdminAuth } from './src/backend/config/firebase-admin';

async function test() {
  const adminAuth = await getAdminAuth();
  const users = await adminAuth.listUsers();
  console.log("Found users:", users.users.map((user: { email?: string }) => user.email));
  process.exit();
}
test();
