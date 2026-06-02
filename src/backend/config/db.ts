import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

let connectionString = process.env.DATABASE_URL;

if (connectionString) {
  const atIndex = connectionString.lastIndexOf('@');
  const colonIndex = connectionString.indexOf(':', connectionString.indexOf('://') + 3);
  
  if (atIndex > colonIndex && colonIndex !== -1) {
    let password = connectionString.substring(colonIndex + 1, atIndex);
    // Strip accidental brackets from Supabase dashboard copy-paste
    if (password.startsWith('[') && password.endsWith(']')) {
       password = password.slice(1, -1);
    }
    
    // encode if it contains brackets or other weird chars
    const encodedPassword = encodeURIComponent(password);
    connectionString = connectionString.substring(0, colonIndex + 1) + encodedPassword + connectionString.substring(atIndex);
  }
}

const pool = new Pool({
  connectionString,
});

export const query = (text: string, params?: any[]) => pool.query(text, params);
