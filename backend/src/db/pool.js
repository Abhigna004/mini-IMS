import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'mini_ims',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+00:00'
});

export const testConnection = async () => {
  const conn = await pool.getConnection();
  await conn.ping();
  conn.release();
  console.log(`Connected to MySQL: ${process.env.DB_NAME || 'mini_ims'}`);
};

export default pool;
