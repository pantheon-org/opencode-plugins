declare module 'astro:content' {
  // Minimal, permissive typings to satisfy Astro's content API
  // This mirrors defineCollection and zod helpers used by @astrojs/starlight

  // Schema builder context (kept permissive)
  export type SchemaContext = any;

  // A zod-like schema type placeholder
  export type ZodType<T = any> =
    | {
        parse: (input: unknown) => T;
      }
    | any;

  // Export a `z` helper compatible with common zod patterns
  export const z: {
    string: () => ZodType<string>;
    number: () => ZodType<number>;
    object: (shape: Record<string, any>) => ZodType<Record<string, any>>;
    array: (item: ZodType) => ZodType<any[]>;
    optional: (t: ZodType) => ZodType<any>;
    any: () => ZodType<any>;
    // allow other z.* usages
    [key: string]: any;
  };

  // defineCollection accepts either a config with `schema` (ZodType) or a function returning a schema
  export function defineCollection<T = any>(def: {
    schema?: ZodType<T> | (() => ZodType<T> | Promise<ZodType<T>>);
    type?: string;
    [key: string]: any;
  }): {
    type: string;
    schema?: ZodType<T>;
  };

  // Helper to infer schema types (permissive)
  export type InferSchemaType<T> = any;
}
