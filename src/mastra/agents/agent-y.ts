// Agent Y: 2-levels deep sub-agent with approval tool
import { Agent } from "@mastra/core/agent";
import { deployCodeTool } from "../tools/deploy-code-tool";

export const agentY = new Agent({
  id: "agent-y",
  name: "Agent Y (Deployer)",
  instructions: "You deploy code. Use deploy-code-tool when asked to deploy.",
  model: "openai/gpt-4o-mini",
  tools: { deployCodeTool },
});
