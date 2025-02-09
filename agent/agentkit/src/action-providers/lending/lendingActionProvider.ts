import { z } from "zod";
import { ActionProvider } from "../actionProvider";
import { CreateAction } from "../actionDecorator";
import { Network } from "../../network";
import { EvmWalletProvider } from "../../wallet-providers";
import {
  SupplySchema,
  WithdrawSchema,
  BorrowSchema,
  RepaySchema,
  GetPoolInfoSchema,
  GetAccountInfoSchema,
  GetPortfolioSchema,
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
  formatted: {
    healthFactor: string;
    supplied: string;
    borrowed: string;
    healthStatus: string;
    riskLevel: string;
  };
}

interface PortfolioInfo {
  totalSupplied: bigint;
  totalBorrowed: bigint;
  totalCollateralValue: bigint;
  overallHealth: bigint;
  positions: {
    category: string;
    supplied: bigint;
    borrowed: bigint;
    healthFactor: bigint;
    collateralValue: bigint;
  }[];
  formatted: {
    totalSupplied: string;
    totalBorrowed: string;
    totalCollateralValue: string;
    overallHealth: string;
    healthStatus: string;
    positions: {
      category: string;
      supplied: string;
      borrowed: string;
      healthFactor: string;
      collateralValue: string;
    }[];
  };
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
  async supply(
    wallet: EvmWalletProvider,
    args: z.infer<typeof SupplySchema>,
  ): Promise<CallDataResponse> {
    const vault = VAULTS["base-sepolia"][args.category];
    const data = generateSupplyCalldata(
      args.amount,
      wallet.getAddress() as `0x${string}`,
      args.useAsCollateral,
    );

    return {
      to: vault.address as Hex,
      data,
      description: `Supply ${args.amount} ${vault.depositToken} to ${args.category} vault`,
    };
  }

  @CreateAction({
    name: "withdraw_from_vault",
    description: "Withdraws assets from a lending vault",
    schema: WithdrawSchema,
  })
  async withdraw(
    wallet: EvmWalletProvider,
    args: z.infer<typeof WithdrawSchema>,
  ): Promise<CallDataResponse> {
    const vault = VAULTS["base-sepolia"][args.category];
    const data = generateWithdrawCalldata(
      args.amount,
      wallet.getAddress() as `0x${string}`,
      wallet.getAddress() as `0x${string}`,
    );

    return {
      to: vault.address as Hex,
      data,
      description: `Withdraw ${args.amount} ${vault.depositToken} from ${args.category} vault`,
    };
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
    const data = generateBorrowCalldata(args.amount);

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
    const data = generateRepayCalldata(args.amount);

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
  ): Promise<PoolInfo> {
    try {
      if (!VAULTS["base-sepolia"][args.category]) {
        throw new Error(`Invalid vault category: ${args.category}`);
      }

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

      const supplyAPYBigInt = BigInt(supplyAPY as string | number);
      const borrowAPYBigInt = BigInt(borrowAPY as string | number);
      const totalSuppliedBigInt = BigInt(totalSupplied as string | number);
      const totalBorrowedBigInt = BigInt(totalBorrowed as string | number);
      const supplyCapBigInt = BigInt(supplyCap as string | number);

      const utilizationRate =
        totalSuppliedBigInt === 0n
          ? "0%"
          : `${(Number((totalBorrowedBigInt * 10000n) / totalSuppliedBigInt) / 100).toFixed(2)}%`;

      const formatBigNumber = (value: bigint) => {
        const numStr = value.toString();
        const num = Number(numStr);
        if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
        if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
        return num.toString();
      };

      const formatAPY = (value: bigint) => `${(Number(value) / 1e16).toFixed(2)}%`;

      return {
        supplyAPY: supplyAPYBigInt,
        borrowAPY: borrowAPYBigInt,
        totalSupplied: totalSuppliedBigInt,
        totalBorrowed: totalBorrowedBigInt,
        supplyCap: supplyCapBigInt,
        utilizationRate,
        depositToken: vault.depositToken,
        formatted: {
          supplyAPY: formatAPY(supplyAPYBigInt),
          borrowAPY: formatAPY(borrowAPYBigInt),
          totalSupplied: formatBigNumber(totalSuppliedBigInt),
          totalBorrowed: formatBigNumber(totalBorrowedBigInt),
          supplyCap: formatBigNumber(supplyCapBigInt),
        },
      };
    } catch (error) {
      console.error("Error in getPoolInfo:", error);
      throw error;
    }
  }

  @CreateAction({
    name: "get_account_info",
    description:
      "Get detailed account information and health metrics for a Chedda Finance lending position",
    schema: GetAccountInfoSchema,
  })
  async getAccountInfo(
    wallet: EvmWalletProvider,
    args: z.infer<typeof GetAccountInfoSchema>,
  ): Promise<AccountInfo> {
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

    const formatBigNumber = (value: bigint) => {
      const num = Number(value);
      if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
      if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
      return num.toFixed(2);
    };

    const getHealthStatus = (health: bigint) => {
      const healthNum = Number(health) / 1e18;
      if (healthNum >= 2) return "Excellent";
      if (healthNum >= 1.5) return "Strong";
      if (healthNum >= 1.2) return "Good";
      if (healthNum >= 1.1) return "Moderate";
      if (healthNum >= 1.0) return "Caution";
      return "At Risk";
    };

    const getRiskLevel = (health: bigint) => {
      const healthNum = Number(health) / 1e18;
      if (healthNum >= 2) return "Very Low";
      if (healthNum >= 1.5) return "Low";
      if (healthNum >= 1.2) return "Moderate";
      if (healthNum >= 1.1) return "High";
      return "Very High";
    };

    return {
      healthFactor: healthFactor as bigint,
      supplied: supplied as bigint,
      borrowed: borrowed as bigint,
      depositToken: vault.depositToken,
      formatted: {
        healthFactor: `${(Number(healthFactor) / 1e18).toFixed(2)}`,
        supplied: `${formatBigNumber(supplied as bigint)} ${vault.depositToken}`,
        borrowed: `${formatBigNumber(borrowed as bigint)} ${vault.depositToken}`,
        healthStatus: getHealthStatus(healthFactor as bigint),
        riskLevel: getRiskLevel(healthFactor as bigint),
      },
    };
  }

  @CreateAction({
    name: "get_portfolio",
    description: "Get comprehensive portfolio overview across all Chedda Finance pools",
    schema: GetPortfolioSchema,
  })
  async getPortfolio(
    wallet: EvmWalletProvider,
    args: z.infer<typeof GetPortfolioSchema>,
  ): Promise<PortfolioInfo> {
    const categories = Object.keys(VAULTS["base-sepolia"]);
    const positions = await Promise.all(
      categories.map(async category => {
        const vault = VAULTS["base-sepolia"][category as keyof (typeof VAULTS)["base-sepolia"]];
        const [healthFactor, supplied, borrowed, collateralValue] = await Promise.all([
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
          wallet.readContract({
            address: vault.address as `0x${string}`,
            abi: LENDING_POOL_VIEW_ABI,
            functionName: "totalAccountCollateralValue",
            args: [args.account as `0x${string}`],
          }),
        ]);

        return {
          category,
          supplied: supplied as bigint,
          borrowed: borrowed as bigint,
          healthFactor: healthFactor as bigint,
          collateralValue: collateralValue as bigint,
        };
      }),
    );

    // Calculate totals
    const activePositions = positions.filter(p => p.supplied > 0n || p.borrowed > 0n);
    const totalSupplied = activePositions.reduce((acc, p) => acc + p.supplied, 0n);
    const totalBorrowed = activePositions.reduce((acc, p) => acc + p.borrowed, 0n);
    const totalCollateralValue = activePositions.reduce((acc, p) => acc + p.collateralValue, 0n);

    // Calculate weighted average health
    const overallHealth =
      activePositions.length > 0
        ? activePositions.reduce((acc, p) => acc + p.healthFactor, 0n) /
          BigInt(activePositions.length)
        : 0n;

    const formatBigNumber = (value: bigint) => {
      const num = Number(value);
      if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
      if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
      return num.toFixed(2);
    };

    const getHealthStatus = (health: bigint) => {
      const healthNum = Number(health) / 1e18;
      if (healthNum >= 2) return "Excellent";
      if (healthNum >= 1.5) return "Strong";
      if (healthNum >= 1.2) return "Good";
      if (healthNum >= 1.1) return "Moderate";
      if (healthNum >= 1.0) return "Caution";
      return "At Risk";
    };

    return {
      totalSupplied,
      totalBorrowed,
      totalCollateralValue,
      overallHealth,
      positions,
      formatted: {
        totalSupplied: formatBigNumber(totalSupplied),
        totalBorrowed: formatBigNumber(totalBorrowed),
        totalCollateralValue: formatBigNumber(totalCollateralValue),
        overallHealth: `${(Number(overallHealth) / 1e18).toFixed(2)}`,
        healthStatus: getHealthStatus(overallHealth),
        positions: activePositions.map(p => ({
          category: p.category,
          supplied: formatBigNumber(p.supplied),
          borrowed: formatBigNumber(p.borrowed),
          healthFactor: `${(Number(p.healthFactor) / 1e18).toFixed(2)}`,
          collateralValue: formatBigNumber(p.collateralValue),
        })),
      },
    };
  }

  supportsNetwork(network: Network): boolean {
    return network.networkId === "base-sepolia";
  }
}

export const lendingActionProvider = () => new LendingActionProvider();
