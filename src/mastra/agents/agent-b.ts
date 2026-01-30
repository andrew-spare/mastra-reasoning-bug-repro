// Agent B: 1-level deep sub-agent with approval tool
import { Agent } from "@mastra/core/agent";
import { deleteRecordTool } from "../tools/delete-record-tool";

export const agentB = new Agent({
  id: "agent-b",
  name: "Agent B (Data Cleaner)",
  instructions:
    "You clean data. Use delete-record-tool when asked to delete records.",
  model: "openai/gpt-4o-mini",
  tools: { deleteRecordTool },
});
