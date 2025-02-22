import {
  AgentKit,
  CdpWalletProvider,
  wethActionProvider,
  walletActionProvider,
  erc20ActionProvider,
  cdpApiActionProvider,
  cdpWalletActionProvider,
  pythActionProvider,
  multisigActionProvider,
  lendingActionProvider,
} from "@coinbase/agentkit";
import { getLangChainTools } from "@coinbase/agentkit-langchain";
import { HumanMessage } from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as readline from "readline";
import express from "express";

dotenv.config();

/**
 * Validates that required environment variables are set
 *
 * @throws {Error} - If required environment variables are missing
 * @returns {void}
 */
function validateEnvironment(): void {
  const missingVars: string[] = [];

  // Check required variables
  const requiredVars = ["OPENAI_API_KEY", "CDP_API_KEY_NAME", "CDP_API_KEY_PRIVATE_KEY"];
  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });

  // Exit if any required variables are missing
  if (missingVars.length > 0) {
    console.error("Error: Required environment variables are not set");
    missingVars.forEach(varName => {
      console.error(`${varName}=your_${varName.toLowerCase()}_here`);
    });
    process.exit(1);
  }

  // Warn about optional NETWORK_ID
  if (!process.env.NETWORK_ID) {
    console.warn("Warning: NETWORK_ID not set, defaulting to base-sepolia testnet");
  }
}

// Add this right after imports and before any other code
validateEnvironment();

// Configure a file to persist the agent's CDP MPC Wallet Data
const WALLET_DATA_FILE = "wallet_data.txt";

/**
 * Initialize the agent with CDP Agentkit
 *
 * @returns Agent executor and config
 */
async function initializeAgent() {
  try {
    // Initialize LLM
    const llm = new ChatOpenAI({
      model: "gpt-4o-mini",
    });

    let walletDataStr: string | null = null;

    // Read existing wallet data if available
    if (fs.existsSync(WALLET_DATA_FILE)) {
      try {
        walletDataStr = fs.readFileSync(WALLET_DATA_FILE, "utf8");
      } catch (error) {
        console.error("Error reading wallet data:", error);
        // Continue without wallet data
      }
    }

    // Configure CDP Wallet Provider
    const config = {
      apiKeyName: process.env.CDP_API_KEY_NAME,
      apiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      cdpWalletData: walletDataStr || undefined,
      networkId: process.env.NETWORK_ID || "base-sepolia",
    };

    const walletProvider = await CdpWalletProvider.configureWithWallet(config);

    // Initialize AgentKit
    const agentkit = await AgentKit.from({
      walletProvider,
      actionProviders: [
        multisigActionProvider(),
        wethActionProvider(),
        pythActionProvider(),
        walletActionProvider(),
        erc20ActionProvider(),
        cdpApiActionProvider({
          apiKeyName: process.env.CDP_API_KEY_NAME,
          apiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        }),
        cdpWalletActionProvider({
          apiKeyName: process.env.CDP_API_KEY_NAME,
          apiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        }),
        lendingActionProvider(),
      ],
    });

    //@ts-ignore
    const tools = await getLangChainTools(agentkit);

    // Store buffered conversation history in memory
    const memory = new MemorySaver();
    const agentConfig = { configurable: { thread_id: "CDP AgentKit Chatbot Example!" } };

    // // Create React Agent using the LLM and CDP AgentKit tools
    // const agent = createReactAgent({
    //   llm,
    //   tools,
    //   checkpointSaver: memory,
    //   messageModifier: `
    //     You are a helpful agent that can interact onchain using the Coinbase Developer Platform AgentKit. You are
    //     empowered to interact onchain using your tools. If you ever need funds, you can request them from the
    //     faucet if you are on network ID 'base-sepolia'. If not, you can provide your wallet details and request
    //     funds from the user. Before executing your first action, get the wallet details to see what network
    //     you're on. If there is a 5XX (internal) HTTP error code, ask the user to try again later. If someone
    //     asks you to do something you can't do with your currently available tools, you must say so, and
    //     encourage them to implement it themselves using the CDP SDK + Agentkit, recommend they go to
    //     docs.cdp.coinbase.com for more information. Be concise and helpful with your responses. Refrain from
    //     restating your tools' descriptions unless it is explicitly requested.
    //     `,
    // });

    // Create React Agent using the LLM and CDP AgentKit tools
    const agent = createReactAgent({
      llm,
      tools,
      checkpointSaver: memory,
      messageModifier: `
        As a Chedda Finance specialist, you help users navigate and optimize their DeFi strategies within Chedda's secure ecosystem, operating through a robust multisig framework that ensures user control over fund flows.

        Security Framework:
        • All operations are secured through multisig governance
        • Transactions require user approval through the multisig framework
        • Activities are verified by an Automated Validation System (AVS)
        • Users maintain full control and oversight of their assets
        • Every action is verifiable and transparent on-chain

        Your core focus is on Chedda's specialized vaults:
        • Coinbase Assets (USDC) for conservative, institutional-grade yields
        • Base Meme (WETH) for high-growth opportunities
        • Gaming vaults (ETH/Base) for ecosystem exposure
        • ETH DeFi (USDC) for blue-chip protocol yields
        • WETH-Stables for balanced liquidity provision

        You excel at:
        • Analyzing real-time APY rates across Chedda's vaults
        • Monitoring account health and risk metrics
        • Suggesting optimal vault allocations based on user risk preference
        • Tracking portfolio performance across all Chedda positions
        • Guiding users through secure multisig operations

        Your recommendations are always:
        • Limited to Chedda Finance vaults and strategies
        • Executed through the multisig framework for security
        • Verified by AVS for additional safety
        • Based on real-time vault performance data
        • Focused on maintaining healthy collateral ratios

        Trust-minimized approach:
        • All transactions require explicit user approval
        • Every action is validated by AVS before execution
        • Full transparency of fund flows and vault interactions
        • Clear audit trail of all operations
        • User-controlled security parameters

        Every recommendation includes:
        • Current vault APY and utilization
        • Required deposit token (USDC/WETH)
        • Risk level and health factor targets
        • Multisig approval steps
        • AVS verification status

        When presenting pool information, always use the formatted values from the PoolInfo response:
        • supplyAPY -> poolInfo.formatted.supplyAPY
        • totalSupplied -> poolInfo.formatted.totalSupplied
        etc.
        
        Never output the raw PoolInfo object directly.
        Always format responses using the .formatted properties for human-readable output.
      `,
    });

    // Save wallet data
    const exportedWallet = await walletProvider.exportWallet();
    fs.writeFileSync(WALLET_DATA_FILE, JSON.stringify(exportedWallet));

    return { agent, config: agentConfig };
  } catch (error) {
    console.error("Failed to initialize agent:", error);
    throw error; // Re-throw to be handled by caller
  }
}

/**
 * Run the agent autonomously with specified intervals
 *
 * @param agent - The agent executor
 * @param config - Agent configuration
 * @param interval - Time interval between actions in seconds
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function runAutonomousMode(agent: any, config: any, interval = 10) {
  console.log("Starting autonomous mode...");

  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const thought =
        "Be creative and do something interesting on the blockchain. " +
        "Choose an action or set of actions and execute it that highlights your abilities.";

      const stream = await agent.stream({ messages: [new HumanMessage(thought)] }, config);

      for await (const chunk of stream) {
        if ("agent" in chunk) {
          console.log(chunk.agent.messages[0].content);
        } else if ("tools" in chunk) {
          console.log(chunk.tools.messages[0].content);
        }
        console.log("-------------------");
      }

      await new Promise(resolve => setTimeout(resolve, interval * 1000));
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error:", error.message);
      }
      process.exit(1);
    }
  }
}

/**
 * Run the agent interactively based on user input
 *
 * @param agent - The agent executor
 * @param config - Agent configuration
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function runChatMode(agent: any, config: any) {
  console.log("Starting chat mode... Type 'exit' to end.");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt: string): Promise<string> =>
    new Promise(resolve => rl.question(prompt, resolve));

  try {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const userInput = await question("\nPrompt: ");

      if (userInput.toLowerCase() === "exit") {
        break;
      }

      const stream = await agent.stream({ messages: [new HumanMessage(userInput)] }, config);

      for await (const chunk of stream) {
        if ("agent" in chunk) {
          console.log(chunk.agent.messages[0].content);
        } else if ("tools" in chunk) {
          console.log(chunk.tools.messages[0].content);
        }
        console.log("-------------------");
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error:", error.message);
    }
    process.exit(1);
  } finally {
    rl.close();
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function runApiRouter(agent: any, config: any) {
  const app = express();
  app.use(express.json());

  // Add route handler using app.use()
  app.use("/chat", async (req: any, res: any) => {
    try {
      const { message } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      //Accept the following request: Request payload: {"message":"healthz"}
      if (message === "healthz") {
        return res.status(200).json({ status: "ok" });
      }

      const stream = await agent.stream({ messages: [new HumanMessage(message)] }, config);
      const responses: any[] = [];

      for await (const chunk of stream) {
        if ("agent" in chunk) {
          responses.push(chunk.agent.messages[0].content);
        } else if ("tools" in chunk) {
          responses.push(chunk.tools.messages[0].content);
        }
      }

      res.json({ responses });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  return app;
}

/**
 * Choose whether to run in autonomous, chat, or API mode based on user input
 *
 * @returns Selected mode
 */
async function chooseMode(): Promise<"chat" | "auto" | "api"> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt: string): Promise<string> =>
    new Promise(resolve => rl.question(prompt, resolve));

  while (true) {
    console.log("\nAvailable modes:");
    console.log("1. chat    - Interactive chat mode");
    console.log("2. auto    - Autonomous action mode");
    console.log("3. api     - API server mode");

    const choice = (await question("\nChoose a mode (enter number or name): "))
      .toLowerCase()
      .trim();

    if (choice === "1" || choice === "chat") {
      rl.close();
      return "chat";
    } else if (choice === "2" || choice === "auto") {
      rl.close();
      return "auto";
    } else if (choice === "3" || choice === "api") {
      rl.close();
      return "api";
    }
    console.log("Invalid choice. Please try again.");
  }
}

/**
 * Start the chatbot agent
 */
async function main() {
  try {
    const { agent, config } = await initializeAgent();
    // Check if --api flag is present
    const isApiMode = process.argv.includes("--api");

    let mode;
    if (isApiMode) {
      mode = "api";
      console.log("Starting in API mode...");
    } else {
      mode = await chooseMode();
    }

    if (mode === "chat") {
      await runChatMode(agent, config);
    } else if (mode === "auto") {
      await runAutonomousMode(agent, config);
    } else if (mode === "api") {
      const app = await runApiRouter(agent, config);
      const port = process.env.PORT || 3000;
      app.listen(port, () => {
        console.log(`Server running on port ${port}`);
      });
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error:", error.message);
    }
    process.exit(1);
  }
}

if (require.main === module) {
  console.log("Starting Agent...");
  // Log if starting in API mode
  if (process.argv.includes("--api")) {
    console.log("API mode detected, skipping mode selection...");
  }
  main().catch(error => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}
