import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middleware/errorHandler.js';
import authRouter from './routes/authRoutes.js';

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// ── Routes ──
app.use('/api/auth', authRouter);
// MI-19 (logout, refresh, me) will extend authRoutes.js
// import authRouter from './routes/authRoutes.js';        // MI-18, MI-19 (placeholder removed)
// import itemsRouter from './routes/itemsRoutes.js';      // MI-20, MI-21
// import transactionsRouter from './routes/transRoutes.js'; // MI-22, MI-23
// import adminsRouter from './routes/adminsRoutes.js';    // MI-24
// import analyticsRouter from './routes/analyticsRoutes.js'; // MI-25
// import reportsRouter from './routes/reportsRoutes.js';  // MI-27
// import auditRouter from './routes/auditRoutes.js';      // MI-26
// import searchRouter from './routes/searchRoutes.js';    // MI-26

app.get('/api/health', (req, res) => res.json({ success: true, message: 'Mini-IMS API running' }));

app.use(errorHandler);

export default app;
