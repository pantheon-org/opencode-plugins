// Minimal process env shape used in some tools
// biome-ignore lint/style/noNamespace: Required for global type declarations
declare namespace NodeJS {
  interface ProcessEnv {
    [key: string]: string | undefined;
  }
}

export {};
