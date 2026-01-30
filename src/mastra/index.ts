import { Mastra } from "@mastra/core/mastra";
import { InMemoryStore } from "@mastra/core/storage";

import { agentA } from "./agents/agent-a";

export const mastra = new Mastra({
  agents: {
    agentA,
  },
  storage: new InMemoryStore(),
});
