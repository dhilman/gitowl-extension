/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BASE_URL: string;
  readonly VITE_GITOWL_VERSION: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
