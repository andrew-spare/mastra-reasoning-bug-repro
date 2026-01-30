// Scenario 1: Top-Level Approval Tool (EXPECTED: WORKS)
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const createUserTool = createTool({
  id: "create-user-tool",
  description:
    "Creates a new user in the system - requires approval before execution",
  inputSchema: z.object({
    username: z.string().describe("The username to create"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    userId: z.string(),
  }),
  requireApproval: true,
  execute: async ({ username }) => {
    console.log(`[create-user-tool] Creating user: ${username}`);
    return { success: true, userId: `user-${Date.now()}` };
  },
});
