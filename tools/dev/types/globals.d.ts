// Minimal process env shape used in some tools

declare namespace NodeJS {
  interface ProcessEnv {
    [key: string]: string | undefined;
  }
}

export {};
