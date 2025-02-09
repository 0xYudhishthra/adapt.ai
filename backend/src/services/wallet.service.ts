import { createClient } from "@supabase/supabase-js";
import { ethers } from "ethers";
import Safe, {
  PredictedSafeProps,
  SafeAccountConfig,
} from "@safe-global/protocol-kit";
import { createPublicClient, http } from "viem";
import { baseSepolia, sepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import SafeApiKit from "@safe-global/api-kit";
import { MetaTransactionData, OperationType } from "@safe-global/types-kit";

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
      transport: http(),
    });
  }

  async createMultisig(
    agentId: string,
    agentWalletAddress: string,
    userWalletAddress: string
  ) {
    try {
      console.log(process.env.SIGNER_PRIVATE_KEY! as `0x${string}`);
      const signer = privateKeyToAccount(
        process.env.SIGNER_PRIVATE_KEY! as `0x${string}`
      );

      const safeAccountConfig: SafeAccountConfig = {
        owners: [agentWalletAddress, userWalletAddress, signer.address],
        threshold: 3,
        // More optional properties
      };

      const predictedSafe: PredictedSafeProps = {
        safeAccountConfig,
        // More optional properties
      };

      const protocolKit = await Safe.init({
        provider: baseSepolia.rpcUrls.default.http[0],
        signer: process.env.SIGNER_PRIVATE_KEY!,
        predictedSafe,
      });

      const safeAddress = await protocolKit.getAddress();

      console.log(safeAddress);

      const deploymentTransaction =
        await protocolKit.createSafeDeploymentTransaction();

      const client = await protocolKit.getSafeProvider().getExternalSigner();

      if (!client) {
        throw new Error("Client not found");
      }

      const transactionHash = await client.sendTransaction({
        to: deploymentTransaction.to,
        value: BigInt(0),
        data: deploymentTransaction.data as `0x${string}`,
        chain: baseSepolia,
      });

      await this.provider.waitForTransactionReceipt({
        hash: transactionHash,
      });

      const { data, error } = await this.supabase.from("multisig").insert({
        multisig_address: safeAddress,
        agent_id: agentId,
        agent_wallet_address: agentWalletAddress,
        user_wallet_address: userWalletAddress,
      });

      if (error) {
        throw new Error(error.message);
      }

      return {
        safeAddress,
        transactionHash,
      };
    } catch (error) {
      throw new Error(
        `Failed to create multisig wallet: ${(error as Error).message}`
      );
    }
  }

  async signMultisigTransaction(
    agentWalletAddress: string,
    userWalletAddress: string,
    to: string
  ) {
    //fetch the safe address from the database
    const { data, error } = await this.supabase
      .from("safes")
      .select("*")
      .eq("agent_wallet_address", agentWalletAddress)
      .eq("user_wallet_address", userWalletAddress)
      .single();
    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error("Safe not found");
    }

    const safeAddress = data.multisig_address;

    const safe = await Safe.init({
      provider: baseSepolia.rpcUrls.default.http[0],
      signer: process.env.SIGNER_PRIVATE_KEY!,
      safeAddress: safeAddress,
    });

    const apiKit = new SafeApiKit({
      chainId: BigInt(baseSepolia.id),
    });

    const pendingTransactions = (
      await apiKit.getPendingTransactions(safeAddress)
    ).results;

    const transaction = pendingTransactions[0];

    const safeTxHash = transaction.transactionHash;
    const signature = await safe.signHash(safeTxHash);

    // Confirm the Safe transaction
    const signatureResponse = await apiKit.confirmTransaction(
      safeTxHash,
      signature.data
    );

    const safeTransaction = await apiKit.getTransaction(safeTxHash);
    const executeTxResponse = await safe.executeTransaction(safeTransaction);

    return executeTxResponse;
  }

  async getMultisigWallet(agentAddress: string, userAddress: string) {
    const { data, error } = await this.supabase
      .from("multisig")
      .select("*")
      .eq("agent_wallet_address", agentAddress)
      .eq("user_wallet_address", userAddress);

    if (error) {
      throw new Error(error.message);
    }

    console.log(data);

    if (data.length === 0) {
      throw new Error("Safe not found");
    }

    return data[0].multisig_address;
  }

  async checkSafeExistsOnChain(agentAddress: string, userAddress: string) {
    const signer = privateKeyToAccount(
      (process.env.SIGNER_PRIVATE_KEY! as `0x${string}`) ||
        "0xc23b8cf3ed10f078dba6b9432c3de1b9257051d201fc87dd0ef687805fed165e"
    );
    const safeAccountConfig: SafeAccountConfig = {
      owners: [agentAddress, userAddress, signer.address],
      threshold: 3,
      // More optional properties
    };

    const predictedSafe: PredictedSafeProps = {
      safeAccountConfig,
      // More optional properties
    };

    const protocolKit = await Safe.init({
      provider: baseSepolia.rpcUrls.default.http[0],
      signer:
        "0xc23b8cf3ed10f078dba6b9432c3de1b9257051d201fc87dd0ef687805fed165e",
      predictedSafe,
    });

    const safeAddress = await protocolKit.getAddress();

    try {
      await protocolKit.createSafeDeploymentTransaction();
      return false;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("Safe already exists")
      ) {
        return true;
      }
    }
  }
}
