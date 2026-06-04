import { adminAuth } from './src/backend/config/firebase-admin';

async function test() {
  const users = await adminAuth.listUsers();
  console.log("Found users:", users.users.map(u => u.email));
  process.exit();
}
test();
