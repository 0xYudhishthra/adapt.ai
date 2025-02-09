import { z } from "zod";
import { ActionProvider } from "../actionProvider";
import { CreateAction } from "../actionDecorator";
import { Network } from "../../network";
import { EvmWalletProvider } from "../../wallet-providers";
import { SupplySchema, WithdrawSchema, BorrowSchema, RepaySchema } from "./schemas";
import { 
  generateSupplyCalldata,
  generateWithdrawCalldata,
  generateBorrowCalldata,
  generateRepayCalldata
} from "./callData";
import { VAULTS } from "./constants";

export class LendingActionProvider extends ActionProvider<EvmWalletProvider> {
  constructor() {
    super("lending", []);
  }

  @CreateAction({
    name: "supply_to_vault",
    description: `
This tool allows supplying assets to a lending vault. The following vaults are available:
- Base Meme Coins (WETH): 0x81df92DE8FD8bEa04A84E4c5Bad94A3daeEB2Fc1
- ETH Gaming (WETH): 0xBA2E65D461d3F6066E88A34988EAae9Fb7143396
- Base Gaming (USDC): 0xc097580d41176d56f1c42ad20d11Bc2247A8d2Be
- ETH DeFi (USDC): 0x7e41fF84f262a182C2928D4817220F47eb89aeCc
- CB Assets (USDC): 0x461fb6906dD46e4ED8fA354b3e4E5e7cB102171F
- WETH Stables (WETH): 0x2a9dc7463EA224dDCa477296051D95694b0bb05C

Make sure to use the correct token (USDC or WETH) for the selected vault.
    `,
    schema: SupplySchema,
  })
  async supply(
    wallet: EvmWalletProvider,
    args: z.infer<typeof SupplySchema>,
  ): Promise<string> {
    try {
      const calldata = generateSupplyCalldata(
        args.amount,
        wallet.getAddress(),
        args.useAsCollateral
      );

      const hash = await wallet.sendTransaction({
        to: args.vaultAddress as `0x${string}`,
        data: calldata,
      });

      await wallet.waitForTransactionReceipt(hash);

      return `Successfully supplied ${args.amount} to vault ${args.vaultAddress}. Transaction: ${hash}`;
    } catch (error) {
      return `Error supplying to vault: ${error}`;
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
  ): Promise<string> {
    try {
      const calldata = generateWithdrawCalldata(
        args.amount,
        wallet.getAddress(),
        wallet.getAddress()
      );

      const hash = await wallet.sendTransaction({
        to: args.vaultAddress as `0x${string}`,
        data: calldata,
      });

      await wallet.waitForTransactionReceipt(hash);

      return `Successfully withdrew ${args.amount} from vault ${args.vaultAddress}. Transaction: ${hash}`;
    } catch (error) {
      return `Error withdrawing from vault: ${error}`;
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
  ): Promise<string> {
    try {
      const calldata = generateBorrowCalldata(args.amount);

      const hash = await wallet.sendTransaction({
        to: args.vaultAddress as `0x${string}`,
        data: calldata,
      });

      await wallet.waitForTransactionReceipt(hash);

      return `Successfully borrowed ${args.amount} from vault ${args.vaultAddress}. Transaction: ${hash}`;
    } catch (error) {
      return `Error borrowing from vault: ${error}`;
    }
  }

  @CreateAction({
    name: "repay_to_vault",
    description: "Repays borrowed assets to a lending vault",
    schema: RepaySchema,
  })
  async repay(
    wallet: EvmWalletProvider,
    args: z.infer<typeof RepaySchema>,
  ): Promise<string> {
    try {
      const calldata = generateRepayCalldata(args.amount);

      const hash = await wallet.sendTransaction({
        to: args.vaultAddress as `0x${string}`,
        data: calldata,
      });

      await wallet.waitForTransactionReceipt(hash);

      return `Successfully repaid ${args.amount} to vault ${args.vaultAddress}. Transaction: ${hash}`;
    } catch (error) {
      return `Error repaying to vault: ${error}`;
    }
  }

  supportsNetwork(network: Network): boolean {
    return network.networkId === "base-sepolia";
  }
}

export const lendingActionProvider = () => new LendingActionProvider(); 