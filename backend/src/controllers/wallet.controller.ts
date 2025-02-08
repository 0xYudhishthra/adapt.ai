import { WalletService } from '../services/wallet.service';

const walletService = new WalletService();

export const createMultisigWallet = async (agentId: string, agentWalletAddress: string, userWalletAddress: string) => {
    return await walletService.createMultisig(agentId, agentWalletAddress, userWalletAddress);
};

// export const signMultisig = async (walletId: string, agentId: string, userId: string, transaction: any) => {
//     return await walletService.signTransaction(walletId, agentId, userId, transaction);
// }; 