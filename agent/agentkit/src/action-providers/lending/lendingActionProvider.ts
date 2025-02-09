import { z } from "zod";
import { ActionProvider } from "../actionProvider";
import { CreateAction } from "../actionDecorator";
import { Network } from "../../network";
import { CdpWalletProvider, EvmWalletProvider } from "../../wallet-providers";
import {
  SupplySchema,
  WithdrawSchema,
  BorrowSchema,
  RepaySchema,
  GetPoolInfoSchema,
  GetAccountInfoSchema,
} from "./schemas";
import {
  generateSupplyCalldata,
  generateWithdrawCalldata,
  generateBorrowCalldata,
  generateRepayCalldata,
} from "./callData";
import { VAULTS, LENDING_POOL_ABI, LENDING_POOL_VIEW_ABI } from "./constants";
import { Hex } from "viem";
import { createPublicClient, http, PublicClient } from "viem";
import { baseSepolia } from "viem/chains";
import SafeApiKit from "@safe-global/api-kit";
import Safe from "@safe-global/protocol-kit";
import { MetaTransactionData, OperationType } from "@safe-global/types-kit";
import fs from "fs";

interface CallDataResponse {
  to: Hex;
  data: Hex;
  description: string;
}

interface PoolInfo {
  supplyAPY: bigint;
  borrowAPY: bigint;
  totalSupplied: bigint;
  totalBorrowed: bigint;
  supplyCap: bigint;
  utilizationRate: string;
  depositToken: string;
  formatted: {
    supplyAPY: string;
    borrowAPY: string;
    totalSupplied: string;
    totalBorrowed: string;
    supplyCap: string;
  };
}

interface AccountInfo {
  healthFactor: bigint;
  supplied: bigint;
  borrowed: bigint;
  depositToken: string;
}

export class LendingActionProvider extends ActionProvider<EvmWalletProvider> {
  constructor() {
    super("lending", []);
  }

  @CreateAction({
    name: "supply_to_vault",
    description: `
Chedda Finance Yield Strategies - Choose from specialized vaults:

1. Coinbase Assets (USDC)
   • Conservative yield from stablecoin trading
   • Institutional-grade security, stable returns
   • Best for: Low-risk yield seekers

2. Base Meme (WETH)
   • High yield from meme token ecosystem
   • Higher risk-reward, active trading
   • Best for: Growth-focused investors

3. Gaming Vaults
   • ETH Gaming (WETH): Established gaming tokens
   • Base Gaming (USDC): Emerging gaming projects
   • Best for: Gaming ecosystem exposure

4. ETH DeFi (USDC)
   • Blue-chip DeFi protocol yields
   • Deep liquidity, established returns
   • Best for: DeFi yield farmers

5. WETH-Stables (WETH)
   • Balanced stablecoin pair yields
   • Consistent trading fees
   • Best for: Moderate risk-reward

Features: Auto-compound, no lock-up, real-time APY
Check get_pool_info for current rates
Use correct token (USDC/WETH) per strategy
`,
    schema: SupplySchema,
  })
  async supply(wallet: EvmWalletProvider, args: z.infer<typeof SupplySchema>): Promise<string> {
    try {
      if (!args.account) {
        return "Please provide your wallet address to supply assets. The address should be in the format 0x... (42 characters long)";
      }

      let multisig: string | null = null;

      console.log("Addresses:", await wallet.getAddress(), args.account);

      // First check if a multisig exists
      const checkMultisigResponse = await fetch("http://localhost:3000/api/wallet/get/multisig", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agentAddress: await wallet.getAddress(), // await the promise
          userAddress: args.account,
        }),
      });

      let res = (await checkMultisigResponse.json()) as any;
      console.log("Check multisig response:", res);

      if (res.success == true) {
        // Use strict comparison and correct value
        multisig = res.multisig_address;
      } else {
        // Create a multisig
        const createMultisigResponse = await fetch("http://localhost:3000/api/wallet/create/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            agentId: args.agentId,
            agentAddress: await wallet.getAddress(), // await the promise
            userAddress: args.account,
          }),
        });

        res = await createMultisigResponse.json();
        console.log("Create multisig response:", res);

        if (!res.multisig_address) {
          throw new Error("Failed to create multisig: No safe address returned");
        }

        multisig = res.multisig_address;
      }

      if (!multisig) {
        throw new Error("Failed to get or create multisig wallet");
      }

      const vault = VAULTS["base-sepolia"][args.category];
      const data = generateSupplyCalldata(
        BigInt(args.amount),
        multisig as `0x${string}`,
        args.useAsCollateral,
      );

      const walletData =
        '{"walletId":"28262c4d-ffbb-459c-8d58-d5f10ce188dd","seed":"0xe3598d59150b1bedcffee60613127a3e05fc9fed362358485ac420507ff82c3e","networkId":"base-sepolia"}';

      const walletDataJson = JSON.parse(walletData);

      //get the signer from the wallet data

      const protocolKitOwner1 = await Safe.init({
        provider: baseSepolia.rpcUrls.default.http[0],
        signer: walletDataJson.seed,
        safeAddress: multisig,
      });

      const safeTransactionData: MetaTransactionData = {
        to: vault.address as `0x${string}`,
        value: "0", // 1 wei
        data: data,
        operation: OperationType.Call,
      };

      const safeTransaction = await protocolKitOwner1.createTransaction({
        transactions: [safeTransactionData],
      });

      const apiKit = new SafeApiKit({
        chainId: BigInt(baseSepolia.id),
      });

      // Deterministic hash based on transaction parameters
      const safeTxHash = await protocolKitOwner1.getTransactionHash(safeTransaction);

      // Sign transaction to verify that the transaction is coming from owner 1
      const senderSignature = await protocolKitOwner1.signHash(safeTxHash);

      await apiKit.proposeTransaction({
        safeAddress: multisig,
        safeTransactionData: safeTransaction.data,
        safeTxHash,
        senderAddress: await wallet.getAddress(),
        senderSignature: senderSignature.data,
      });

      return `Supply ${args.amount} ${vault.depositToken} to ${args.category} vault from ${args.account}. You should sign the transaction with your wallet too at multisig address ${multisig}`;
    } catch (error) {
      if (error instanceof Error && error.message.includes("invalid address")) {
        return "The provided wallet address is invalid. Please provide a valid Ethereum address in the format 0x... (42 characters long)";
      }
      throw error;
    }
  }

  @CreateAction({
    name: "withdraw_from_vault",
    description: "Withdraws assets from a lending vault",
    schema: WithdrawSchema,
  })
  async withdraw(
    wallet: EvmWalletProvider,
    args: z.infer<typeof WithdrawSchema>,
  ): Promise<CallDataResponse | string> {
    try {
      if (!args.account) {
        return "Please provide your wallet address to withdraw assets. The address should be in the format 0x... (42 characters long)";
      }

      const vault = VAULTS["base-sepolia"][args.category];
      const data = generateWithdrawCalldata(
        BigInt(args.amount),
        args.account as `0x${string}`,
        args.account as `0x${string}`,
      );

      return {
        to: vault.address as Hex,
        data,
        description: `Withdraw ${args.amount} ${vault.depositToken} from ${args.category} vault to ${args.account}`,
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes("invalid address")) {
        return "The provided wallet address is invalid. Please provide a valid Ethereum address in the format 0x... (42 characters long)";
      }
      throw error;
    }
  }

  @CreateAction({
    name: "borrow_from_vault",
    description: "Borrows assets from a lending vault",
    schema: BorrowSchema,
  })
  async borrow(
    wallet: EvmWalletProvider,
    args: z.infer<typeof BorrowSchema>,
  ): Promise<CallDataResponse> {
    const vault = VAULTS["base-sepolia"][args.category];
    const data = generateBorrowCalldata(BigInt(args.amount));

    return {
      to: vault.address as Hex,
      data,
      description: `Borrow ${args.amount} ${vault.depositToken} from ${args.category} vault`,
    };
  }

  @CreateAction({
    name: "repay_to_vault",
    description: "Repays borrowed assets to a lending vault",
    schema: RepaySchema,
  })
  async repay(
    wallet: EvmWalletProvider,
    args: z.infer<typeof RepaySchema>,
  ): Promise<CallDataResponse> {
    const vault = VAULTS["base-sepolia"][args.category];
    const data = generateRepayCalldata(BigInt(args.amount));

    return {
      to: vault.address as Hex,
      data,
      description: `Repay ${args.amount} ${vault.depositToken} to ${args.category} vault`,
    };
  }

  @CreateAction({
    name: "get_pool_info",
    description:
      "Get detailed information about a Chedda Finance lending pool including APY, total supply, utilization, etc.",
    schema: GetPoolInfoSchema,
  })
  async getPoolInfo(
    wallet: EvmWalletProvider,
    args: z.infer<typeof GetPoolInfoSchema>,
  ): Promise<string> {
    const vault = VAULTS["base-sepolia"][args.category];
    const [supplyAPY, borrowAPY, totalSupplied, totalBorrowed, supplyCap] = await Promise.all([
      wallet.readContract({
        address: vault.address as `0x${string}`,
        abi: LENDING_POOL_VIEW_ABI,
        functionName: "baseSupplyAPY",
      }),
      wallet.readContract({
        address: vault.address as `0x${string}`,
        abi: LENDING_POOL_VIEW_ABI,
        functionName: "baseBorrowAPY",
      }),
      wallet.readContract({
        address: vault.address as `0x${string}`,
        abi: LENDING_POOL_VIEW_ABI,
        functionName: "supplied",
      }),
      wallet.readContract({
        address: vault.address as `0x${string}`,
        abi: LENDING_POOL_VIEW_ABI,
        functionName: "borrowed",
      }),
      wallet.readContract({
        address: vault.address as `0x${string}`,
        abi: LENDING_POOL_VIEW_ABI,
        functionName: "supplyCap",
      }),
    ]);

    const utilizationRate =
      totalSupplied === BigInt(0)
        ? "0%"
        : `${((Number(totalBorrowed) * 100) / Number(totalSupplied)).toFixed(2)}%`;

    const formatBigNumber = (value: BigInt) => {
      const num = Number(value);
      if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
      if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
      return num.toString();
    };

    const formatAPY = (value: BigInt) => {
      const num = Number(value);
      if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
      if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
      return num.toString();
    };

    let convertedTotalSupplied = formatBigNumber(BigInt(totalSupplied as any));
    let convertedTotalBorrowed = Number(BigInt(totalBorrowed as any)).toString();
    let convertedSupplyCap = Number(BigInt(supplyCap as any)).toString();
    let convertedSupplyAPY = formatAPY(BigInt(supplyAPY as any));
    let convertedBorrowAPY = formatAPY(BigInt(borrowAPY as any));

    const payload = {
      supplyAPY: convertedSupplyAPY,
      borrowAPY: convertedBorrowAPY,
      totalSupplied: convertedTotalSupplied,
      totalBorrowed: convertedTotalBorrowed,
      supplyCap: convertedSupplyCap,
      utilizationRate,
      depositToken: vault.depositToken,
      formatted: {
        supplyAPY: convertedSupplyAPY,
        borrowAPY: convertedBorrowAPY,
        totalSupplied: convertedTotalSupplied,
      },
    };

    return JSON.stringify(payload);
  }

  @CreateAction({
    name: "get_account_info",
    description: "Get detailed account information for a lending pool",
    schema: GetAccountInfoSchema,
  })
  async getAccountInfo(
    wallet: EvmWalletProvider,
    args: z.infer<typeof GetAccountInfoSchema>,
  ): Promise<AccountInfo | string> {
    try {
      if (!args.account) {
        return "Please provide your wallet address to check account information. The address should be in the format 0x... (42 characters long)";
      }

      const vault = VAULTS["base-sepolia"][args.category];
      const [healthFactor, supplied, borrowed] = await Promise.all([
        wallet.readContract({
          address: vault.address as `0x${string}`,
          abi: LENDING_POOL_VIEW_ABI,
          functionName: "accountHealth",
          args: [args.account as `0x${string}`],
        }),
        wallet.readContract({
          address: vault.address as `0x${string}`,
          abi: LENDING_POOL_VIEW_ABI,
          functionName: "assetBalance",
          args: [args.account as `0x${string}`],
        }),
        wallet.readContract({
          address: vault.address as `0x${string}`,
          abi: LENDING_POOL_VIEW_ABI,
          functionName: "accountAssetsBorrowed",
          args: [args.account as `0x${string}`],
        }),
      ]);

      return {
        healthFactor: healthFactor as bigint,
        supplied: supplied as bigint,
        borrowed: borrowed as bigint,
        depositToken: vault.depositToken,
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes("invalid address")) {
        return "The provided wallet address is invalid. Please provide a valid Ethereum address in the format 0x... (42 characters long)";
      }
      throw error;
    }
  }

  supportsNetwork(network: Network): boolean {
    return network.networkId === "base-sepolia";
  }
}

export const lendingActionProvider = () => new LendingActionProvider();
