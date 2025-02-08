import express from 'express';
import { registerAgent, getAgent } from '../controllers/agent.controller';

const router = express.Router();

// Register new agent
router.post('/register', registerAgent);

// Get agent by ID
router.get('/:id', getAgent);

export default router; 