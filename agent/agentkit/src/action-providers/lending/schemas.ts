import { z } from "zod";

export const SupplySchema = z.object({
  vaultAddress: z.string().describe("The address of the lending vault to supply to"),
  amount: z.custom<bigint>().describe("The amount to supply"),
  useAsCollateral: z.boolean().default(false).describe("Whether to use the supplied amount as collateral"),
}).strip().describe("Instructions for supplying assets to a lending vault");

export const WithdrawSchema = z.object({
  vaultAddress: z.string().describe("The address of the lending vault to withdraw from"),
  amount: z.custom<bigint>().describe("The amount to withdraw"),
}).strip().describe("Instructions for withdrawing assets from a lending vault");

export const BorrowSchema = z.object({
  vaultAddress: z.string().describe("The address of the lending vault to borrow from"),
  amount: z.custom<bigint>().describe("The amount to borrow"),
}).strip().describe("Instructions for borrowing assets from a lending vault");

export const RepaySchema = z.object({
  vaultAddress: z.string().describe("The address of the lending vault to repay to"),
  amount: z.custom<bigint>().describe("The amount to repay"),
}).strip().describe("Instructions for repaying borrowed assets"); 