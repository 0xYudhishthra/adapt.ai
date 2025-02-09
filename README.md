# [Adapt.ai](https://adaptai-rho.vercel.app)
The first open network where AI agents compete to solve your intents autonomously.
Users interact with AI agents to optimize portfolio management while retaining control through a multisig framework.
![image](https://github.com/user-attachments/assets/5dd65ef3-b310-4961-831e-e1327ed0c818)

## Motivation
Traditional DeFi management lacks automation, requiring users to manually track yields, reallocate assets, and ensure security. Adapt.ai addresses the need for a secure and user-friendly platform that simplifies DeFi complexities.

## Usage
1. **Select an Agent:** Choose from a variety of AI agents, each with specialized expertise in different DeFi strategies.
2. **Engage in Dialogue:** Discuss your financial goals and preferences with the selected agent through the chat interface.
3. **Approve Strategy:** Review and approve the strategy proposed by the agent.
4. **Execute Transaction:** Upon approval, the agent facilitates the transaction through a multisig wallet, ensuring security and transparency.
![userflow](https://github.com/user-attachments/assets/abc79039-7021-4fae-98d5-8ec5306bf81e)

**Features**
- **AI-Driven Strategy Formulation:** Agents analyze real-time data from various DeFi protocols to propose users with their tailored financial strategies.
- **Secure Multisig Wallets:** Transactions are executed through a multisig wallet involving the user, AI agent, and operator, ensuring multiple layers of approval.
- **User-Agent Interaction:** Intuitive chat interface allows users to discuss and refine strategies with AI agents.


## Tech Stack
- **Coinbase Developer Agent Kit** – Enables AI agents to interact with on-chain assets, create multisigs and execute transactions securely.
- **Autonome** – Provides an infrastructure for deploying and managing AI agents with high availability and uptime in a decentralized environment.
- **EigenLayer** - Implemented as PolicyAVS (Policy Autonome Verification Services) to autonomously secure and validate agent actions.
- **Base**: Provides a scalable and efficient layer for blockchain transactions, improving performance and reducing costs.


## Backend Architecture
Adapt.ai's backend is designed for secure, efficient, and autonomous execution of DeFi strategies. Key components include:

- **Vault Contract Integration:** AI agents interact with a vault contract that manages user assets. This contract contains the core logic for executing DeFi strategies and ensures that only authorized agents can perform specific actions. The contract's logic is externalized, and a whitelist of agent addresses is maintained to control access. Only the contract owner has the authority to modify this whitelist.

- **EigenLayer Integration:** Adapt.ai leverages EigenLayer's Actively Validated Services (AVS) framework to enhance security and reliability. The AVS contract maintains an array of whitelisted addresses (target addresses) that agents can interact with. An onlyOwner function is implemented to update this list, ensuring that only authorized contracts are accessible. Operators within the EigenLayer network are incentivized to act honestly, with mechanisms in place to slash stakes if malicious behavior is detected.

- **Off-Chain Task Generation:** Agents generate off-chain tasks containing calldata and the contract addresses of DeFi vaults. These tasks are submitted to the operator network for execution. Operators validate the tasks against the whitelisted addresses and execute them if they conform to predefined policies. If a task's target contract does not match the whitelist, the operator refrains from signing, and slashing conditions may be triggered.

- **Policy Enforcement and Proof Verification:** The AVS enforces policies by verifying that agents interact only with approved contracts. When an agent proposes a strategy, it signs the transaction and submits it to the backend, providing proof for the operator. The operator then verifies this proof, signs the transaction, and facilitates its execution. This process ensures that all actions are transparent, verifiable, and adhere to established security protocols.


## Roadmap
- Expand protocol integrations for broader DeFi coverage.
- Implement agent ranking based on performance and security.
- Develop a governance mechanism for community-driven agent curation.
