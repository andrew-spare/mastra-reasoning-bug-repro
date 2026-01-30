import "dotenv/config";
import { describe, it, expect } from "vitest";
import { mastra } from "./mastra";

const THREAD_ID = `test-thread-${Date.now()}`;
const RESOURCE_ID = "test-app";

// Helper to test with agent.stream()
async function testWithStream(
  prompt: string,
): Promise<{ hasApproval: boolean; text: string }> {
  const agent = mastra.getAgent("agentA");
  const stream = await agent.stream(prompt);

  let hasApproval = false;
  let text = "";

  for await (const chunk of stream.fullStream) {
    if (chunk.type === "tool-call-approval") {
      hasApproval = true;
    }
    if (chunk.type === "text-delta") {
      text += chunk.payload?.text ?? "";
    }
  }

  return { hasApproval, text };
}

// Helper to test with agent.network()
async function testWithNetwork(prompt: string): Promise<{
  hasToolApproval: boolean;
  hasAgentApproval: boolean;
  text: string;
  runId: string;
}> {
  const agent = mastra.getAgent("agentA");
  const stream = await agent.network(prompt, {
    memory: {
      thread: THREAD_ID,
      resource: RESOURCE_ID,
    },
  });

  let hasToolApproval = false;
  let hasAgentApproval = false;
  let text = "";

  for await (const chunk of stream) {
    // Top-level tool approval
    if (chunk.type === "tool-execution-approval") {
      hasToolApproval = true;
    }
    // Sub-agent tool approval
    if (chunk.type === "agent-execution-approval") {
      hasAgentApproval = true;
    }
    if (chunk.type === "network-execution-event-text-delta") {
      text += (chunk as { payload?: { text?: string } }).payload?.text ?? "";
    }
  }

  return { hasToolApproval, hasAgentApproval, text, runId: stream.runId };
}

describe("Stream Method (agent.stream())", () => {
  describe("Scenario A: Top-Level Tool (Agent A → createUserTool)", () => {
    it("should emit tool-call-approval event", async () => {
      const result = await testWithStream(
        "Create a user with username 'alice'",
      );
      expect(result.hasApproval).toBe(true);
    });
  });

  describe("Scenario B: 1-Level Deep (Agent A → Agent B → deleteRecordTool)", () => {
    it("should NOT emit approval event (BUG)", async () => {
      const result = await testWithStream(
        "Delete record REC-456 from the database",
      );
      // This is the bug - approval is swallowed
      expect(result.hasApproval).toBe(false);
    });
  });

  describe("Scenario XY: 2-Levels Deep (Agent A → Agent X → Agent Y → deployCodeTool)", () => {
    it("should NOT emit approval event (BUG)", async () => {
      const result = await testWithStream(
        "Deploy version 2.0.0 to production environment",
      );
      // This is the bug - approval is swallowed
      expect(result.hasApproval).toBe(false);
    });
  });
});

describe("Network Method (agent.network())", () => {
  describe("Scenario A: Top-Level Tool (Agent A → createUserTool)", () => {
    it("should emit tool-execution-approval event", async () => {
      const result = await testWithNetwork("Create a user with username 'bob'");
      expect(result.hasToolApproval).toBe(true);
    });
  });

  describe("Scenario B: 1-Level Deep (Agent A → Agent B → deleteRecordTool)", () => {
    it("should emit agent-execution-approval event", async () => {
      const result = await testWithNetwork(
        "Delete record REC-789 from the database",
      );
      // With network(), sub-agent approval should surface
      expect(result.hasAgentApproval).toBe(true);
    });
  });

  describe("Scenario XY: 2-Levels Deep (Agent A → Agent X → Agent Y → deployCodeTool)", () => {
    it("should NOT emit agent-execution-approval event (BUG - 2+ levels not fixed)", async () => {
      const result = await testWithNetwork(
        "Deploy version 3.0.0 to staging environment",
      );
      // 2-levels deep is still broken even with network()
      expect(result.hasAgentApproval).toBe(false);
    });
  });
});
