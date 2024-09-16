import preact from "@preact/preset-vite";
import { resolve } from "path";
import { defineConfig } from "vite";

const src = resolve(__dirname, "src");
const outDir = resolve(__dirname, "dist");

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@": src,
    },
  },
  plugins: [preact()],
  build: {
    outDir,
    rollupOptions: {
      input: {
        frame: resolve(src, "frame", "index.ts"),
        content: resolve(src, "content", "index.tsx"),
      },
      output: {
        entryFileNames: (chunk) => `src/${chunk.name}/index.js`,
      },
    },
  },
});
