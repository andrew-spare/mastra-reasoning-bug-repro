import "dotenv/config";
import { mastra } from "./mastra";

async function testScenario(
  prompt: string,
  scenarioName: string,
  expectedToWork: boolean,
) {
  console.log(`\n${"=".repeat(70)}`);
  console.log(`SCENARIO: ${scenarioName}`);
  console.log(`Agent: agentA`);
  console.log(`Prompt: "${prompt}"`);
  console.log(
    `Expected: ${expectedToWork ? "✓ SHOULD WORK" : "✗ EXPECTED BUG"}`,
  );
  console.log("=".repeat(70));

  try {
    const agent = mastra.getAgent("agentA");
    const stream = await agent.stream(prompt);

    let hasApproval = false;
    let hasSuspend = false;
    let textContent = "";
    let finishReason: string | undefined;

    for await (const chunk of stream.fullStream) {
      if (chunk.type !== "text-delta") {
        console.log(`  [chunk] type=${chunk.type}`);
      }

      if (chunk.type === "tool-call-approval") {
        hasApproval = true;
        console.log(
          `  ✓ Received tool-call-approval: ${JSON.stringify(chunk.payload)}`,
        );
      }
      if (chunk.type === "tool-call-suspended") {
        hasSuspend = true;
        console.log(
          `  ✓ Received tool-call-suspended: ${JSON.stringify(chunk.payload)}`,
        );
      }
      if (chunk.type === "text-delta") {
        textContent += chunk.payload?.text ?? "";
      }
      if (chunk.type === "finish") {
        finishReason = chunk.payload?.stepResult?.reason;
      }
    }

    console.log(`\nResults:`);
    console.log(`  - finishReason: ${finishReason}`);
    console.log(`  - hasApproval: ${hasApproval}`);
    console.log(`  - hasSuspend: ${hasSuspend}`);
    console.log(
      `  - textContent: "${textContent.slice(0, 150)}${textContent.length > 150 ? "..." : ""}"`,
    );

    if (expectedToWork) {
      if (hasApproval) {
        console.log(`\n  ✅ PASS: Got approval event`);
      } else {
        console.log(
          `\n  ❌ UNEXPECTED: Expected approval to work but didn't get it`,
        );
      }
    } else {
      if (!hasApproval) {
        console.log(
          `\n  ⚠️  BUG CONFIRMED: No approval event surfaced from sub-agent`,
        );
        if (!textContent.trim()) {
          console.log(
            `  ⚠️  BUG DETAIL: Empty response - approval was swallowed`,
          );
        } else {
          console.log(
            `  ⚠️  BUG DETAIL: Agent hallucinated response instead of surfacing approval`,
          );
        }
      } else {
        console.log(
          `\n  🎉 FIXED?: Got approval event - bug may have been fixed!`,
        );
      }
    }
  } catch (error) {
    console.log(`\n  ❌ ERROR: ${error}`);
  }
}

async function runAllTests() {
  console.log("\n" + "█".repeat(70));
  console.log("█  MASTRA SUB-AGENT TOOL APPROVAL BUG REPRODUCTION");
  console.log("█  Always messaging: Agent A");
  console.log("█".repeat(70));

  // Test 1: Top-level tool on Agent A (SHOULD WORK)
  await testScenario(
    "Create a user with username 'alice'",
    "1: Top-Level Tool (Agent A → createUserTool)",
    true,
  );

  // Test 2: 1-level deep tool on Agent B (EXPECTED BUG)
  await testScenario(
    "Delete record REC-456 from the database",
    "2: 1-Level Deep (Agent A → Agent B → deleteRecordTool)",
    false,
  );

  // Test 3: 2-levels deep tool on Agent Y (EXPECTED BUG)
  await testScenario(
    "Deploy version 2.0.0 to production environment",
    "3: 2-Levels Deep (Agent A → Agent X → Agent Y → deployCodeTool)",
    false,
  );

  console.log("\n" + "█".repeat(70));
  console.log("█  TEST SUMMARY");
  console.log("█".repeat(70));
  console.log(`
Hierarchy:
  Agent A (entry point)
  ├── createUserTool (top-level)
  ├── Agent B → deleteRecordTool (1-level deep)
  └── Agent X → Agent Y → deployCodeTool (2-levels deep)

Expected Results:
  - Test 1: SHOULD WORK (top-level tool)
  - Test 2-3: EXPECTED BUG (sub-agent tools don't surface approval)

Root Cause:
  When a parent agent calls a sub-agent, it never checks for
  finishReason === 'suspended' or tool-call-approval events.
`);
}

runAllTests().catch(console.error);
