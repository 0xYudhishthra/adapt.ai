import { z } from "zod";

// Define the investment categories
export const InvestmentCategory = z.enum([
  "base-meme",
  "eth-gaming",
  "base-gaming",
  "eth-defi",
  "cb-assets",
  "weth-stables",
]).describe(`
Choose a Chedda Finance investment strategy:
- base-meme: Earn yield on Base meme tokens ecosystem
  • Supply WETH to earn yield from meme token trading fees
  • Participate in Base's growing meme economy
  • Higher risk-reward profile for meme token exposure

- eth-gaming: Ethereum Gaming Yield Strategy
  • Supply WETH to earn yield from gaming token activities
  • Exposure to ETH gaming ecosystem growth
  • Benefit from gaming token trading volumes

- base-gaming: Base Gaming Yield Strategy
  • Supply USDC to earn yield from Base gaming projects
  • Participate in Base's gaming ecosystem
  • Stable yields from gaming platform revenues

- eth-defi: Ethereum DeFi Yield Strategy
  • Supply USDC to earn yield from ETH DeFi protocols
  • Blue-chip DeFi exposure with stable returns
  • Benefit from ETH DeFi trading volumes

- cb-assets: Coinbase Assets Yield Strategy
  • Supply USDC to earn yield from Coinbase-backed assets
  • Lower risk profile with institutional backing
  • Stable yields from regulated asset trading

- weth-stables: WETH-Stablecoin Liquidity Strategy
  • Supply WETH to earn yield from stablecoin pairs
  • Balanced risk-reward from liquidity provision
  • Earn fees from WETH-Stablecoin trading
`);

export const SupplySchema = z
  .object({
    category: InvestmentCategory.describe("The investment category you want to invest in"),
    amount: z.string().describe("The amount to supply"),
    agentId: z.string().describe("The agent ID"),
    useAsCollateral: z
      .boolean()
      .default(false)
      .describe("Whether to use the supplied amount as collateral"),
    account: z
      .string()
      .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address format")
      .optional()
      .describe(
        "The wallet address to supply from. If not provided, please ask the user for their wallet address.",
      ),
  })
  .strip()
  .describe("Instructions for supplying assets to a lending vault");

export const WithdrawSchema = z
  .object({
    category: InvestmentCategory.describe("The investment category to withdraw from"),
    amount: z.string().describe("The amount to withdraw"),
    agentId: z.string().describe("The agent ID"),
    account: z
      .string()
      .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address format")
      .optional()
      .describe(
        "The wallet address to withdraw to. If not provided, please ask the user for their wallet address.",
      ),
  })
  .strip()
  .describe("Instructions for withdrawing assets from a lending vault");

export const BorrowSchema = z
  .object({
    category: InvestmentCategory.describe("The investment category to borrow from"),
    amount: z.string().describe("The amount to borrow"),
    agentId: z.string().describe("The agent ID"),
    account: z
      .string()
      .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address format")
      .optional()
      .describe(
        "The wallet address to borrow to. If not provided, please ask the user for their wallet address.",
      ),
  })
  .strip()
  .describe("Instructions for borrowing assets from a lending vault");

export const RepaySchema = z
  .object({
    category: InvestmentCategory.describe("The investment category to repay to"),
    amount: z.string().describe("The amount to repay"),
    agentId: z.string().describe("The agent ID"),
    account: z
      .string()
      .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address format")
      .optional()
      .describe(
        "The wallet address to repay from. If not provided, please ask the user for their wallet address.",
      ),
  })
  .strip()
  .describe("Instructions for repaying borrowed assets");

export const GetPoolInfoSchema = z
  .object({
    category: InvestmentCategory.describe("The investment category to get information about"),
  })
  .strip()
  .describe("Get detailed information about a lending pool");

// Add a wallet address validation helper
const walletAddressSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address format")
  .describe("The wallet address in the format 0x...");

// Update GetAccountInfoSchema to make account optional
export const GetAccountInfoSchema = z
  .object({
    category: InvestmentCategory.describe(
      "The investment category to get account information from",
    ),
    account: walletAddressSchema
      .optional()
      .describe(
        "The account address to get information about. If not provided, please ask the user for their wallet address.",
      ),
  })
  .strip()
  .describe("Get detailed account information for a lending pool");
