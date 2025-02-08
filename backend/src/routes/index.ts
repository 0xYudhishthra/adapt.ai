import express from 'express';
import agentRoutes from './agent.routes';
import walletRoutes from './wallet.routes';

const router = express.Router();

// Health check route
router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Mount routes
router.use('/agent', agentRoutes);
router.use('/wallet', walletRoutes);

export default router;
