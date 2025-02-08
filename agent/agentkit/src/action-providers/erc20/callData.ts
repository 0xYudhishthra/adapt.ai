import { abi } from "./constants";
import { encodeFunctionData, Hex } from "viem";

/**
 * Generates calldata for an ERC20 transfer transaction.
 *
 * @param contractAddress - The ERC20 token contract address.
 * @param recipient - The recipient wallet address.
 * @param amount - The amount to transfer.
 * @returns Encoded calldata string.
 */
export function generateTransferCalldata(
  contractAddress: string,
  recipient: string,
  amount: bigint,
): Hex {
  return encodeFunctionData({
    abi,
    functionName: "transfer",
    args: [recipient as Hex, amount],
  });
}

/**
 * Generates calldata for an ERC20 swap transaction (Assuming Uniswap-style swapExactTokensForTokens).
 *
 * @param routerAddress - The DEX router contract address (e.g., Uniswap, Sushiswap).
 * @param amountIn - The amount of input token.
 * @param amountOutMin - The minimum amount of output token expected.
 * @param path - The token swap path (array of token addresses).
 * @param recipient - The address receiving swapped tokens.
 * @param deadline - Unix timestamp after which the swap expires.
 * @returns Encoded calldata string.
 */
export function generateSwapCalldata(
  routerAddress: string,
  amountIn: bigint,
  amountOutMin: bigint,
  path: string[],
  recipient: string,
  deadline: bigint,
): Hex {
  const swapABI = [
    {
      type: "function",
      name: "swapExactTokensForTokens",
      stateMutability: "nonpayable",
      inputs: [
        { name: "amountIn", type: "uint256" },
        { name: "amountOutMin", type: "uint256" },
        { name: "path", type: "address[]" },
        { name: "recipient", type: "address" },
        { name: "deadline", type: "uint256" },
      ],
      outputs: [{ type: "uint256[]" }],
    },
  ];

  return encodeFunctionData({
    abi: swapABI,
    functionName: "swapExactTokensForTokens",
    args: [amountIn, amountOutMin, path, recipient, deadline],
  });
}
