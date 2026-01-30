// Agent A: Main entry point with tool + sub-agents
import { Agent } from "@mastra/core/agent";
import { createUserTool } from "../tools/create-user-tool";
import { agentB } from "./agent-b";
import { agentX } from "./agent-x";

export const agentA = new Agent({
  id: "agent-a",
  name: "Agent A (Main)",
  instructions: `You are the main agent. You can:
- Create users directly with create-user-tool
- Delegate data cleanup (deleting records) to agent-b
- Delegate deployment tasks to agent-x (which will use agent-y)`,
  model: "openai/gpt-4o-mini",
  tools: { createUserTool },
  agents: { agentB, agentX },
});
