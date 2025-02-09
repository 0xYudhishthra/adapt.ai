import { encodeFunctionData, Hex } from "viem";
import { LENDING_POOL_ABI } from "./constants";

export function generateSupplyCalldata(
  amount: bigint,
  receiver: string,
  useAsCollateral: boolean
): Hex {
  return encodeFunctionData({
    abi: LENDING_POOL_ABI,
    functionName: "supply",
    args: [amount, receiver, useAsCollateral],
  });
}

export function generateWithdrawCalldata(
  amount: bigint,
  receiver: string,
  owner: string
): Hex {
  return encodeFunctionData({
    abi: LENDING_POOL_ABI,
    functionName: "withdraw",
    args: [amount, receiver, owner],
  });
}

export function generateBorrowCalldata(
  amount: bigint
): Hex {
  return encodeFunctionData({
    abi: LENDING_POOL_ABI,
    functionName: "take",
    args: [amount],
  });
}

export function generateRepayCalldata(
  amount: bigint
): Hex {
  return encodeFunctionData({
    abi: LENDING_POOL_ABI,
    functionName: "putAmount",
    args: [amount],
  });
} 