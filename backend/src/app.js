import express from 'express';
import cors from 'cors';
import db from './config/db.js';

import exposantRoutes from './routes/exposantRoutes.js';
import masterclassRoutes from './routes/masterclassRoutes.js';
import visiteurRoutes from './routes/visiteurRoutes.js';
import donationRoutes from './routes/donationRoutes.js';
import emailRoutes from './routes/emailRoutes.js';

const app = express();

app.use(cors(
  {
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
  }
));
app.use(express.json());

// Simple healthcheck
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'ficcon-backend' });
});

app.use('/api/masterclasses', masterclassRoutes);
app.use('/api/exhibitors', exposantRoutes);
app.use('/api/visitors', visiteurRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/emails', emailRoutes);
// 404 API
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Route API introuvable.' });
});

export default app;
