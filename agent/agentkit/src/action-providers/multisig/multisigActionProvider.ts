import { z } from "zod";
import { ActionProvider } from "../actionProvider";
import { Network } from "../../network";
import { CreateAction } from "../actionDecorator";
import { EvmWalletProvider } from "../../wallet-providers";
import { CreateMultisigSchema, GetMultisigDetailsSchema } from "./schemas";

interface CreateMultisigResponse {
    success: boolean;
    data: {
        safeAddress: string;
        transactionHash: string;
    }
}

/** 
 * MutlisigActionProvider is an action provider for creating multisig wallets.
 */
export class MultisigActionProvider extends ActionProvider<EvmWalletProvider> {
  /**
   * Constructor for the MultisigActionProvider.
   */
  constructor() {
    super("multisig", []);
  }

  @CreateAction({
    name: "get_multisig_details",
    description: `
    This tool will return the details of the multisig wallet including:
    - Multisig address
    - ERC20 balances inside the multisig wallet
    `,
    schema: z.object({
      agentId: z.string().describe("The ID of the agent"),
      multisigAddress: z.string().describe("The address of the multisig wallet"),
      agentAddress: z.string().describe("The address of the agent's wallet"),
      userAddress: z.string().describe("The address of the user's wallet"),
    }),
  })
  async getMultisigDetails(wallet: EvmWalletProvider, args: z.infer<typeof GetMultisigDetailsSchema>): Promise<string>{
    try {
        console.log(args);
        return `Multisig details for agent ${args.agentId} and multisig address ${args.multisigAddress} by agent address ${args.agentAddress} and user address ${args.userAddress}`;
    } catch (error) {
        return `Error getting multisig details: ${error}`;
    }
  }
  
  @CreateAction({
    name: "create_multisig",
    description: `
    This tool will create a multisig wallet for the agent and the user once a plan is made with the user which includes: 
    - Multisig address
    - ERC20 balances inside the multisig wallet
    `,
    schema: z.object({
      agentId: z.string().describe("The ID of the agent"),
      agentAddress: z.string().describe("The address of the agent's wallet"),
      userAddress: z.string().describe("The address of the user's wallet"),
    }),
  })
  async createMultisig(walletProvider: EvmWalletProvider, args: z.infer<typeof CreateMultisigSchema>): Promise<string> {
    try {
        console.log(args);
        // it will create a multisig wallet for the agent and the user
        const result = await fetch(`${process.env.BACKEND_URL}/api/wallet/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Add any authentication headers if needed
                // 'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                agentId: args.agentId,
                agentAddress: walletProvider.getAddress(),
                userAddress: args.userAddress,
            }),
        });

        if (!result.ok) {
            throw new Error(`Failed to create multisig: ${result.statusText}`);
        }

        const data = await result.json() as CreateMultisigResponse;
        return `Multisig created for agent ${data.data.safeAddress} and the Hash: ${data.data.transactionHash}`;

    }catch(error) {
        return `Error creating multisig: ${error}`;
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

export const multisigActionProvider = () => new MultisigActionProvider();
