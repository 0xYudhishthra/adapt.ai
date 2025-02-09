import { WalletService } from '../services/wallet.service';

const walletService = new WalletService();

export const createMultisigWallet = async (agentId: string, agentWalletAddress: string, userWalletAddress: string) => {
    return await walletService.createMultisig(agentId, agentWalletAddress, userWalletAddress);
};

export const signMultisig = async (agentAddress: string, userAddress: string, to: string) => {
    return await walletService.signMultisigTransaction(agentAddress, userAddress, to);
}; 