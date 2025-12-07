declare module 'ttf2woff2' {
  interface TTF2WOFF2Options {
    metadata?: string | undefined;
  }

  function ttf2woff2(input: ArrayBuffer | Uint8Array, options?: TTF2WOFF2Options): Uint8Array;

  namespace ttf2woff2 {}

  export = ttf2woff2;
}
