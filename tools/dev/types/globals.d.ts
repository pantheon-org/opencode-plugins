// Minimal process env shape used in some tools
// biome-ignore lint/style/noNamespace: true
declare namespace NodeJS {
  interface ProcessEnv {
    [key: string]: string | undefined;
  }
}

export {};
