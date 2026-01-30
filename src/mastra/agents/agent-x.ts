// Agent X: Middle agent that delegates to Agent Y
import { Agent } from "@mastra/core/agent";
import { agentY } from "./agent-y";

export const agentX = new Agent({
  id: "agent-x",
  name: "Agent X (DevOps)",
  instructions: "You handle DevOps. Delegate deployment tasks to agent-y.",
  model: "openai/gpt-4o-mini",
  agents: { agentY },
});
