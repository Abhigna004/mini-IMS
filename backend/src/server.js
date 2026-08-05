import 'dotenv/config';
import app from './app.js';
import { testConnection } from './db/pool.js';

const PORT = process.env.PORT || 5000;

testConnection()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Mini-IMS API running → http://localhost:${PORT}`);
      console.log(`Health check → http://localhost:${PORT}/api/health`);
    });
  })
  .catch((err) => {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  });
