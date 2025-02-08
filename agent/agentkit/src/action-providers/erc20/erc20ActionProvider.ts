import { z } from "zod";
import { ActionProvider } from "../actionProvider";
import { Network } from "../../network";
import { CreateAction } from "../actionDecorator";
import { GetBalanceSchema, TransferSchema, SwapSchema, TransferCalldataSchema } from "./schemas";
import { abi, ERC20_TOKENS_BY_NETWORK, formatTokenAmount, getTokenBySymbol } from "./constants";
import { encodeFunctionData, Hex } from "viem";
import { EvmWalletProvider } from "../../wallet-providers";
import { generateTransferCalldata, generateSwapCalldata } from "./callData";

/**
 * ERC20ActionProvider is an action provider for ERC20 tokens.
 */
export class ERC20ActionProvider extends ActionProvider<EvmWalletProvider> {
  /**
   * Constructor for the ERC20ActionProvider.
   */
  constructor() {
    super("erc20", []);
  }

  /**
   * Gets the balance of an ERC20 token.
   *
   * @param walletProvider - The wallet provider to get the balance from.
   * @param args - The input arguments for the action.
   * @returns A message containing the balance.
   */
  @CreateAction({
    name: "get_balance",
    description: `
    This tool will get the balance of an ERC20 asset in the wallet. It takes the contract address as input.
    `,
    schema: GetBalanceSchema,
  })
  async getBalance(
    walletProvider: EvmWalletProvider,
    args: z.infer<typeof GetBalanceSchema>,
  ): Promise<string> {
    try {
      console.log("args", args);
      console.log("walletProvider", walletProvider.getAddress());
      const balance = await walletProvider.readContract({
        address: args.contractAddress as Hex,
        abi,
        functionName: "balanceOf",
        args: [walletProvider.getAddress()],
      });

      return `${balance}`;
    } catch (error) {
      return `Error getting balance: ${error}`;
    }
  }

  /**
   * Transfers a specified amount of an ERC20 token to a destination onchain.
   *
   * @param walletProvider - The wallet provider to transfer the asset from.
   * @param args - The input arguments for the action.
   * @returns A message containing the transfer details.
   */
  @CreateAction({
    name: "transfer",
    description: `
    This tool will transfer an ERC20 token from the wallet to another onchain address.

It takes the following inputs:
- amount: The amount to transfer
- contractAddress: The contract address of the token to transfer
- destination: Where to send the funds (can be an onchain address, ENS 'example.eth', or Basename 'example.base.eth')

Important notes:
- Ensure sufficient balance of the input asset before transferring
- When sending native assets (e.g. 'eth' on base-mainnet), ensure there is sufficient balance for the transfer itself AND the gas cost of this transfer
    `,
    schema: TransferSchema,
  })
  async transfer(
    walletProvider: EvmWalletProvider,
    args: z.infer<typeof TransferSchema>,
  ): Promise<string> {
    try {
      const hash = await walletProvider.sendTransaction({
        to: args.contractAddress as Hex,
        data: encodeFunctionData({
          abi,
          functionName: "transfer",
          args: [args.destination as Hex, BigInt(args.amount)],
        }),
      });

      await walletProvider.waitForTransactionReceipt(hash);

      return `Transferred ${args.amount} of ${args.contractAddress} to ${
        args.destination
      }.\nTransaction hash for the transfer: ${hash}`;
    } catch (error) {
      return `Error transferring the asset: ${error}`;
    }
  }

  /**
   * Generates calldata for an ERC20 token transfer without executing it.
   *
   * @param args - The input arguments for the action.
   * @returns Encoded calldata.
   */
  @CreateAction({
    name: "generate_transfer_calldata",
    description: "Generates calldata for an ERC20 token transfer without execution.",
    schema: TransferCalldataSchema,
  })
  async generateTransferCalldata(
    walletProvider: EvmWalletProvider,
    args: z.infer<typeof TransferCalldataSchema>,
  ): Promise<string> {
    try {
      const network = walletProvider.getNetwork();
      console.log("symbol", args.symbol);
      console.log("network", network.networkId);
      const token = getTokenBySymbol(args.symbol, network.networkId as string);
      console.log("token", token);

      if (!token) {
        throw new Error(`Token ${args.symbol} not found on network ${network.networkId}`);
      }

      // Use provided contract address or get it from token info
      const scaledAmount = formatTokenAmount(args.amount, token.decimals);

      const calldata = generateTransferCalldata(token.address, args.destination, scaledAmount);
      return `Generated calldata for transfer: ${calldata}`;
    } catch (error) {
      return `Error generating calldata: ${error}`;
    }
  }

  /**
   * Generates calldata for an ERC20 swap without executing it.
   *
   * @param args - The input arguments for the action.
   * @returns Encoded calldata.
   */
  @CreateAction({
    name: "generate_swap_calldata",
    description: "Generates calldata for an ERC20 token swap without execution.",
    schema: z.object({
      routerAddress: z.string().describe("The address of the swap router (e.g., Uniswap)"),
      amountIn: z.custom<bigint>().describe("The amount of input tokens"),
      amountOutMin: z.custom<bigint>().describe("The minimum amount of output tokens"),
      path: z.array(z.string()).describe("The token swap path"),
      recipient: z.string().describe("The address receiving swapped tokens"),
      deadline: z.custom<bigint>().describe("Transaction deadline"),
    }),
  })
  async generateSwapCalldata(args: z.infer<typeof SwapSchema>): Promise<string> {
    try {
      const calldata = generateSwapCalldata(
        args.routerAddress,
        BigInt(args.amountIn),
        BigInt(args.amountOutMin),
        args.path,
        args.recipient,
        BigInt(args.deadline),
      );
      return `Generated calldata for swap: ${calldata}`;
    } catch (error) {
      return `Error generating swap calldata: ${error}`;
    }
  }
  /**
   * Checks if the ERC20 action provider supports the given network.
   *
   * @param _ - The network to check.
   * @returns True if the ERC20 action provider supports the network, false otherwise.
   */
  supportsNetwork = (_: Network) => true;
}

export const erc20ActionProvider = () => new ERC20ActionProvider();
