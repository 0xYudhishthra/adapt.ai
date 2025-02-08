import { z } from "zod";

/**
 * Input schema for transfer action.
 */
export const TransferSchema = z
  .object({
    amount: z.custom<bigint>().describe("The amount of the asset to transfer"),
    contractAddress: z.string().describe("The contract address of the token to transfer"),
    destination: z.string().describe("The destination to transfer the funds"),
  })
  .strip()
  .describe("Instructions for transferring assets");

/**
 * Input schema for get balance action.
 */
export const GetBalanceSchema = z
  .object({
    contractAddress: z
      .string()
      .describe("The contract address of the token to get the balance for"),
  })
  .strip()
  .describe("Instructions for getting wallet balance");

/**
 * Input schema for swap action.
 */
export const SwapSchema = z
  .object({
    routerAddress: z.string().describe("The address of the swap router (e.g., Uniswap)"),
    amountIn: z.custom<bigint>().describe("The amount of input tokens"),
    amountOutMin: z.custom<bigint>().describe("The minimum amount of output tokens"),
    path: z.array(z.string()).describe("The token swap path"),
    recipient: z.string().describe("The address receiving swapped tokens"),
    deadline: z.custom<bigint>().describe("Transaction deadline"),
  })
  .strip()
  .describe("Instructions for swapping assets");

/**
 * Input schema for transfer calldata generation.
 */
export const TransferCalldataSchema = z
  .object({
    amount: z.string().describe("The amount to transfer"),
    destination: z.string().describe("The destination to transfer the funds"),
    symbol: z.string().describe("The symbol of the token to transfer"),
  })
  .strip()
  .describe("Instructions for generating ERC20 transfer calldata.");
