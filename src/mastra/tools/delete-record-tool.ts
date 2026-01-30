// Scenario 3: 1-Level Deep - Approval Tool (EXPECTED: BROKEN)
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const deleteRecordTool = createTool({
  id: "delete-record-tool",
  description: "Deletes a database record - requires approval",
  inputSchema: z.object({
    recordId: z.string().describe("The record ID to delete"),
  }),
  outputSchema: z.object({
    deleted: z.boolean(),
  }),
  requireApproval: true,
  execute: async ({ recordId }) => {
    console.log(`[delete-record-tool] Deleting record: ${recordId}`);
    return { deleted: true };
  },
});
