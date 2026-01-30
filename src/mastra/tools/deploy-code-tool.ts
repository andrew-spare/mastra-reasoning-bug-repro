// Scenario 5: 2-Levels Deep - Approval Tool (EXPECTED: BROKEN)
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const deployCodeTool = createTool({
  id: "deploy-code-tool",
  description: "Deploys code to production - requires approval",
  inputSchema: z.object({
    version: z.string().describe("Version to deploy"),
    environment: z.string().describe("Target environment"),
  }),
  outputSchema: z.object({
    deployed: z.boolean(),
    deploymentId: z.string(),
  }),
  requireApproval: true,
  execute: async ({ version, environment }) => {
    console.log(`[deploy-code-tool] Deploying ${version} to ${environment}`);
    return { deployed: true, deploymentId: `deploy-${Date.now()}` };
  },
});
