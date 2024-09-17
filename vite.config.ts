import preact from "@preact/preset-vite";
import { resolve } from "path";
import { defineConfig } from "vite";
import cssInjectedByJs from "vite-plugin-css-injected-by-js";

const src = resolve(__dirname, "src");
const outDir = resolve(__dirname, "dist");

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@": src,
    },
  },
  plugins: [
    preact(),
    cssInjectedByJs({
      jsAssetsFilterFunction: (chunk) => {
        if (chunk.name === "content") {
          return true;
        }
        return false;
      },
    }),
  ],
  build: {
    outDir,
    rollupOptions: {
      input: {
        content: resolve(src, "content", "index.tsx"),
        frame: resolve(src, "frame", "index.html"),
      },
      output: {
        entryFileNames: (chunk) => `src/${chunk.name}/index.js`,
      },
    },
  },
});
