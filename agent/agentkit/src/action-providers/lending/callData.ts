import { encodeFunctionData } from "viem";
import { LENDING_POOL_ABI } from "./constants";

const scaleAmount = (amount: bigint, decimals: number): bigint => {
  return amount * BigInt(10) ** BigInt(decimals);
};

export const generateSupplyCalldata = (
  amount: bigint,
  receiver: `0x${string}`,
  useAsCollateral: boolean,
  tokenDecimals: number = 18, // Default to 18 for WETH, should be 6 for USDC
): `0x${string}` => {
  const scaledAmount = scaleAmount(amount, tokenDecimals);
  return encodeFunctionData({
    abi: LENDING_POOL_ABI,
    functionName: "supply",
    args: [scaledAmount, receiver, useAsCollateral],
  });
};

export const generateWithdrawCalldata = (
  amount: bigint,
  owner: `0x${string}`,
  receiver: `0x${string}`,
  tokenDecimals: number = 18,
): `0x${string}` => {
  const scaledAmount = scaleAmount(amount, tokenDecimals);
  return encodeFunctionData({
    abi: LENDING_POOL_ABI,
    functionName: "withdraw",
    args: [scaledAmount, owner, receiver],
  });
};

export const generateBorrowCalldata = (
  amount: bigint,
  tokenDecimals: number = 18,
): `0x${string}` => {
  const scaledAmount = scaleAmount(amount, tokenDecimals);
  return encodeFunctionData({
    abi: LENDING_POOL_ABI,
    functionName: "take",
    args: [scaledAmount],
  });
};

export const generateRepayCalldata = (
  amount: bigint,
  tokenDecimals: number = 18,
): `0x${string}` => {
  const scaledAmount = scaleAmount(amount, tokenDecimals);
  return encodeFunctionData({
    abi: LENDING_POOL_ABI,
    functionName: "putAmount",
    args: [scaledAmount],
  });
};
