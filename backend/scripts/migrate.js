import 'dotenv/config';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';

const __dirname = dirname(fileURLToPath(import.meta.url));

const MIGRATIONS = [
  '../migrations/001_create_refresh_tokens.sql',
  '../migrations/002_create_audit_log.sql',
  '../migrations/003_create_event_log.sql',
];

const run = async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true
  });

  for (const file of MIGRATIONS) {
    const sql = readFileSync(join(__dirname, file), 'utf8');
    await conn.query(sql);
    console.log(`✓ ${file.split('/').pop()}`);
  }

  await conn.end();
  console.log('Migration complete.');
};

run().catch((err) => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
