import express, { Request, Response } from 'express';
import { createMultisigWallet } from '../controllers/wallet.controller';

const router = express.Router();

// Create multisig wallet
router.post('/create', async (req: Request, res: Response) => {
    try {
        const { agentId, userId, agentWalletAddress, userWalletAddress } = req.body;
        const wallet = await createMultisigWallet(agentId, userId, agentWalletAddress, userWalletAddress);
        res.json({ success: true, data: wallet });
    } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
    }
});

// Sign multisig transaction
// router.post('/sign', async (req: Request, res: Response) => {
//     try {
//         const { walletId, agentId, userId, transaction } = req.body;
//         const signature = await signMultisig(walletId, agentId, userId, transaction);
//         res.json({ success: true, data: signature });
//     } catch (error) {
//         res.status(500).json({ success: false, error: (error as Error).message });
//     }
// });

export default router;
