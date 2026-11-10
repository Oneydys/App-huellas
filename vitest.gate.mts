import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Config del gate de publicación (npm run verificar). Solo corre gate/*.test.ts.
// npm test usa vitest.config.mts, que solo corre lib/**/*.test.ts: el gate no entra ahí.
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL(".", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["gate/**/*.test.ts"],
  },
});
