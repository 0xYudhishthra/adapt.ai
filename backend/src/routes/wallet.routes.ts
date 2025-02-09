import express, { Request, Response } from 'express';
import { createMultisigWallet, getMultisigWallet, signMultisig } from '../controllers/wallet.controller';

const router = express.Router();

// Create multisig wallet
router.post('/create', async (req: Request, res: Response) => {
    try {
        console.log(req.body);
        const { agentId, agentAddress, userAddress } = req.body;
        const wallet = await createMultisigWallet(agentId, agentAddress, userAddress);
        res.json({ success: true, data: wallet });
    } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
    }
});

// Get the multisig wallet 
router.post('/get/multisig', async (req: Request, res: Response) => {
    try {
        const { agentAddress, userAddress } = req.body;
        const wallet = await getMultisigWallet(agentAddress, userAddress);
        res.json({ success: true, multisig_address: wallet.multisig_address });
    } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
    }
});

// Sign multisig transaction
router.post('/sign', async (req: Request, res: Response) => {
    try {
        const { agentAddress, userAddress, to } = req.body;
        const signature = await signMultisig(agentAddress, userAddress, to);
        res.json({ success: true, data: signature.hash });
    } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
    }
});

export default router;
