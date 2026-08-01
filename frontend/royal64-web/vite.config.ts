import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Default Vite output was bundling everything — React, the
        // TON Connect UI SDK, react-chessboard/chess.js, react-query —
        // into one chunk, which is what triggered the "larger than
        // 500 kB" warning. Splitting by real usage boundaries means a
        // page like Login doesn't pay for the chessboard bundle it
        // never touches, and vice versa.
        //
        // Using the FUNCTION form here on purpose, not the object-map
        // form (`manualChunks: { name: [...] }`) — with this Vite/
        // Rollup/TS version combination, `tsc -b` only accepts the
        // ManualChunksFunction overload and rejects the object-literal
        // form outright (TS2769), even though Rollup itself supports
        // both at runtime. The function form sidesteps that entirely
        // and is checked against actual `node_modules` paths, which is
        // more robust than a package-name allowlist anyway.
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return undefined;
          }

          if (id.includes("react-chessboard") || id.includes("chess.js")) {
            return "vendor-chess";
          }

          if (id.includes("@tonconnect")) {
            return "vendor-tonconnect";
          }

          if (id.includes("@tanstack")) {
            return "vendor-query";
          }

          if (
            id.includes("/react/") ||
            id.includes("/react-dom/") ||
            id.includes("/react-router-dom/") ||
            id.includes("/react-router/") ||
            id.includes("/scheduler/")
          ) {
            return "vendor-react";
          }

          return "vendor";
        },
      },
    },
  },
});
