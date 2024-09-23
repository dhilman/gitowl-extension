import preact from "@preact/preset-vite";
import { resolve } from "path";
import { defineConfig, loadEnv, UserConfig } from "vite";
import packageJson from "./package.json";
import makeManifest from "./scripts/make-manifest";

const src = resolve(__dirname, "src");
const outDir = resolve(__dirname, "dist");

const userConfig: UserConfig = {
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
        worker: resolve(src, "worker", "index.ts"),
        ...(process.env.NODE_ENV === "development" && {
          index: resolve(__dirname, "index.html"),
        }),
      },
      output: {
        entryFileNames: (chunk) => `src/${chunk.name}/index.js`,
      },
    },
  },
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, "");
  console.log("ENV", {
    MODE: mode,
    NODE_ENV: env.NODE_ENV,
    BROWSER: env.BROWSER,
    VERSION: packageJson.version,
    VITE_BASE_URL: env.VITE_BASE_URL,
  });
  return userConfig;
});
