export const VAULTS = {
  "base-sepolia": {
    "base-meme": {
      address: "0x81df92DE8FD8bEa04A84E4c5Bad94A3daeEB2Fc1",
      depositToken: "WETH"
    },
    "eth-gaming": {
      address: "0xBA2E65D461d3F6066E88A34988EAae9Fb7143396",
      depositToken: "WETH"
    },
    "base-gaming": {
      address: "0xc097580d41176d56f1c42ad20d11Bc2247A8d2Be",
      depositToken: "USDC"
    },
    "eth-defi": {
      address: "0x7e41fF84f262a182C2928D4817220F47eb89aeCc",
      depositToken: "USDC"
    },
    "cb-assets": {
      address: "0x461fb6906dD46e4ED8fA354b3e4E5e7cB102171F",
      depositToken: "USDC"
    },
    "weth-stables": {
      address: "0x2a9dc7463EA224dDCa477296051D95694b0bb05C",
      depositToken: "WETH"
    }
  }
} as const;

export const LENDING_POOL_ABI = [
  {
    inputs: [
      { name: "amount", type: "uint256" },
      { name: "receiver", type: "address" },
      { name: "useAsCollateral", type: "bool" }
    ],
    name: "supply",
    outputs: [{ type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { name: "assetAmount", type: "uint256" },
      { name: "receiver", type: "address" },
      { name: "owner", type: "address" }
    ],
    name: "withdraw",
    outputs: [{ type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ name: "amount", type: "uint256" }],
    name: "take",
    outputs: [{ type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ name: "amount", type: "uint256" }],
    name: "putAmount",
    outputs: [{ type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function"
  }
] as const; 