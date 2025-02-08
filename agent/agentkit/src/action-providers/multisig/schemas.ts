import { z } from "zod";

export const CreateMultisigSchema = z.object({
  agentId: z.string().describe("The ID of the agent"),
  agentAddress: z.string().describe("The address of the agent"),
  userAddress: z.string().describe("The address of the user"),
});

export const GetMultisigDetailsSchema = z.object({
  agentId: z.string().describe("The ID of the agent"),
  multisigAddress: z.string().describe("The address of the multisig wallet"),
  agentAddress: z.string().describe("The address of the agent"),
  userAddress: z.string().describe("The address of the user"),
});
