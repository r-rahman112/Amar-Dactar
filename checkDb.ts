import { query } from './src/backend/config/db';

async function checkDB() {
  console.log("Checking DB schema...");
  try {
    const res = await query("SELECT column_name FROM information_schema.columns WHERE table_name='users'");
    const columns = res.rows.map(r => r.column_name);
    console.log("Users table columns:", columns);
    
    if (columns.includes('firebase_uid')) {
      console.log("YES: firebase_uid exists!");
    } else {
      console.log("NO: firebase_uid does not exist!");
    }
  } catch(e) {
    console.error("DB Error:", e);
  }
  process.exit(0);
}

checkDB();
