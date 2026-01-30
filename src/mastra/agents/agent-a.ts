// Agent A: Main entry point with tool + sub-agents
import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";
import { createUserTool } from "../tools/create-user-tool";
import { agentB } from "./agent-b";
import { agentX } from "./agent-x";

// In-memory SQLite storage for memory
const storage = new LibSQLStore({
  id: "agent-a-memory",
  url: ":memory:",
});

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
  memory: new Memory({
    storage,
    options: {
      lastMessages: 20,
    },
  }),
});
