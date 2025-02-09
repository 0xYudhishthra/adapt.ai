import { WalletService } from '../services/wallet.service';

const walletService = new WalletService();

export const createMultisigWallet = async (agentId: string, agentWalletAddress: string, userWalletAddress: string) => {
    return await walletService.createMultisig(agentId, agentWalletAddress, userWalletAddress);
};

export const getMultisigWallet = async (agentAddress: string, userAddress: string) => {
    return await walletService.getMultisigWallet(agentAddress, userAddress);
};

export const signMultisig = async (agentAddress: string, userAddress: string, to: string) => {
    return await walletService.signMultisigTransaction(agentAddress, userAddress, to);
}; 