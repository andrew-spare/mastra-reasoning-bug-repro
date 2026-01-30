import { Mastra } from "@mastra/core/mastra";
import { LibSQLStore } from "@mastra/libsql";

import { agentA } from "./agents/agent-a";

export const mastra = new Mastra({
  agents: {
    agentA,
  },
  storage: new LibSQLStore({
    id: "mastra-storage",
    url: ":memory:",
  }),
});
