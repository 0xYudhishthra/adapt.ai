import { createClient } from '@supabase/supabase-js';
import { ethers } from 'ethers';
import Safe, { PredictedSafeProps, SafeAccountConfig } from '@safe-global/protocol-kit'
import { createPublicClient, http } from 'viem';
import { baseSepolia, sepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';


export class WalletService {
    private supabase;
    private provider;

    constructor() {
        this.supabase = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_ANON_KEY!
        );
        this.provider = createPublicClient({
            chain: baseSepolia,
            transport: http()
          })
    }

    async createMultisig(agentId: string, userId: string, agentWalletAddress: string, userWalletAddress: string) {
        try {
            const signer = privateKeyToAccount(process.env.SIGNER_PRIVATE_KEY! as `0x${string}`);

            const safeAccountConfig: SafeAccountConfig = {
                owners: [agentWalletAddress, userWalletAddress, signer.address],
                threshold: 1
                // More optional properties
              }
              
              const predictedSafe: PredictedSafeProps = {
                safeAccountConfig
                // More optional properties
              }
              
              const protocolKit = await Safe.init({
                provider: baseSepolia.rpcUrls.default.http[0],
                signer: process.env.SIGNER_PRIVATE_KEY!,
                predictedSafe,
              })

              const safeAddress = await protocolKit.getAddress()

              console.log(safeAddress);

              const deploymentTransaction = await protocolKit.createSafeDeploymentTransaction()

              const client = await protocolKit.getSafeProvider().getExternalSigner()

              if (!client) {
                throw new Error('Client not found');
              }
            
            const transactionHash = await client.sendTransaction({
                to: deploymentTransaction.to,
                value: BigInt(0),
                data: deploymentTransaction.data as `0x${string}`,
                chain: baseSepolia
            })

            await this.provider.waitForTransactionReceipt({
                hash: transactionHash
            })

            return {
                safeAddress,
                transactionHash
            }

        } catch (error) {
            throw new Error(`Failed to create multisig wallet: ${(error as Error).message}`);
        }
    }

    async checkSafeExistsOnChain(agentAddress: string, userAddress: string) {
        const signer = privateKeyToAccount(process.env.SIGNER_PRIVATE_KEY! as `0x${string}` || '0xc23b8cf3ed10f078dba6b9432c3de1b9257051d201fc87dd0ef687805fed165e');
        const safeAccountConfig: SafeAccountConfig = {
            owners: [agentAddress, userAddress, signer.address],
            threshold: 3
            // More optional properties
          }
          
          const predictedSafe: PredictedSafeProps = {
            safeAccountConfig
            // More optional properties
          }
          
          const protocolKit = await Safe.init({
            provider: baseSepolia.rpcUrls.default.http[0],
            signer: '0xc23b8cf3ed10f078dba6b9432c3de1b9257051d201fc87dd0ef687805fed165e',
            predictedSafe,
          })

          const safeAddress = await protocolKit.getAddress()

          try {
            const deploymentTransaction = await protocolKit.createSafeDeploymentTransaction() 
            return false;
          } catch (error) {
            if (error instanceof Error && error.message.includes('Safe already exists')) {
                return true;
            }
          }  
    }
} 