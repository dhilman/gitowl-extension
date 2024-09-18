import preact from "@preact/preset-vite";
import { resolve } from "path";
import { defineConfig } from "vite";
import packageJson from "./package.json";
import makeManifest from "./scripts/make-manifest";

const env = {
  BROWSER: process.env.BROWSER,
  NODE: process.env.NODE_ENV,
  VERSION: packageJson.version,
  VITE_BASE_URL: process.env.VITE_BASE_URL,
};
console.log("ENV", env);

const src = resolve(__dirname, "src");
const outDir = resolve(__dirname, "dist");

export default defineConfig({
  define: {
    "import.meta.env.VITE_GITOWL_VERSION": JSON.stringify(packageJson.version),
  },
  resolve: {
    alias: {
      "@": src,
    },
  },
  plugins: [makeManifest(), preact()],
  build: {
    outDir,
    rollupOptions: {
      input: {
        content: resolve(src, "content", "index.tsx"),
        frame: resolve(src, "frame", "index.html"),
        ...(process.env.NODE_ENV === "development" && {
          index: resolve(__dirname, "index.html"),
        }),
      },
      output: {
        entryFileNames: (chunk) => `src/${chunk.name}/index.js`,
      },
    },
  },
});
