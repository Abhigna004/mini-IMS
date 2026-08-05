import 'dotenv/config';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

// Schema notes from 1410inventory.sql:
// - admin.account_status is char(1): use '1'/'0' not 1/0
// - admin.deleted is char(1): use '1'/'0' not 1/0
// - admin.mobile2 is NOT NULL: use '' for optional mobile
// - items.name has UNIQUE constraint
// - items.code has UNIQUE constraint

const run = async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  // ── Admin users ──────────────────────────────────────────────────────────
  const [[superExists]] = await conn.execute(
    "SELECT id FROM admin WHERE email = 'admin@mini-ims.local' LIMIT 1"
  );
  if (!superExists) {
    const superHash = await bcrypt.hash('Admin@123', 12);
    const staffHash = await bcrypt.hash('Staff@123', 12);
    await conn.execute(
      `INSERT INTO admin
         (first_name, last_name, email, mobile1, mobile2, password, role,
          created_on, last_login, last_seen, account_status, deleted)
       VALUES
         (?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW(), '1', '0'),
         (?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW(), '1', '0')`,
      [
        'Admin', 'User', 'admin@mini-ims.local', '08000000001', '', superHash, 'Super',
        'Staff', 'User', 'staff@mini-ims.local', '08000000002', '', staffHash, 'Staff'
      ]
    );
    console.log('✓ Seeded: 2 admin users');
    console.log('  Super → admin@mini-ims.local / Admin@123');
    console.log('  Staff → staff@mini-ims.local / Staff@123');
  } else {
    console.log('  Skipped: seed admins already exist');
  }

  // ── Inventory items ──────────────────────────────────────────────────────
  const [[{ cnt: itemCnt }]] = await conn.execute('SELECT COUNT(*) AS cnt FROM items');
  if (Number(itemCnt) === 0) {
    const items = [
      ['Widget Alpha',   'WGT001', 50,  9.99,  'Standard widget unit'],
      ['Widget Beta',    'WGT002', 30,  14.99, 'Premium widget unit'],
      ['Gadget Pro',     'GDG001', 20,  24.99, 'Professional gadget'],
      ['Gadget Lite',    'GDG002', 45,  12.49, 'Lite gadget model'],
      ['Component A',    'CMP001', 100, 2.50,  'Basic electronic component'],
      ['Component B',    'CMP002', 75,  3.75,  'Advanced component'],
      ['Device X',       'DEV001', 15,  49.99, 'Standard device'],
      ['Device Y',       'DEV002', 10,  79.99, 'Premium device'],
      ['Accessory One',  'ACC001', 200, 1.99,  'Universal accessory'],
      ['Accessory Two',  'ACC002', 150, 3.49,  'Deluxe accessory'],
      ['Tool Set Alpha', 'TLS001', 25,  19.99, 'Basic tool set'],
      ['Tool Set Beta',  'TLS002', 12,  34.99, 'Pro tool set'],
      ['Module Alpha',   'MOD001', 60,  8.99,  'Plug-in module'],
      ['Module Beta',    'MOD002', 40,  11.99, 'Extended module'],
      ['Bundle Pack',    'BND001', 5,   99.99, 'Complete product bundle'],
    ];
    for (const [name, code, quantity, unitPrice, description] of items) {
      await conn.execute(
        'INSERT INTO items (name, code, quantity, unitPrice, description, dateAdded) VALUES (?, ?, ?, ?, ?, NOW())',
        [name, code, quantity, unitPrice, description]
      );
    }
    console.log('✓ Seeded: 15 inventory items');
  } else {
    console.log('  Skipped: items table already has data');
  }

  await conn.end();
  console.log('\nSeed complete.');
};

run().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
