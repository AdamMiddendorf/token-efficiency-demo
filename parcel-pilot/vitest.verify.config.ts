import { defineConfig } from "vitest/config";

// Facilitator verification suite. Kept out of `npm test` so that participants
// see only the normal repository tests while they work.
export default defineConfig({
  test: {
    include: ["verify/**/*.verify.test.ts"],
    reporters: ["default"],
  },
});
