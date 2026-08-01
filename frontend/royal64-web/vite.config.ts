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
        // never touches, and vice versa. Revisit these groupings as
        // real page weight becomes visible (build --report), don't
        // just raise the size limit to silence the warning.
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-tonconnect": ["@tonconnect/ui-react"],
          "vendor-chess": ["react-chessboard", "chess.js"],
          "vendor-query": ["@tanstack/react-query"],
        },
      },
    },
  },
});
