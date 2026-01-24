declare module 'bun:test' {
  export const describe: any;
  export const it: any;
  export const test: any;
  export const expect: any;
  export const beforeAll: any;
  export const afterAll: any;
  export const beforeEach: any;
  export const afterEach: any;
  export const vi: any;
  export const mock: any;
  export const setSystemTime: any;
  export const spyOn: any;
  export default {};
}

declare global {
  const describe: any;
  const it: any;
  const test: any;
  const expect: any;
  const beforeAll: any;
  const afterAll: any;
  const beforeEach: any;
  const afterEach: any;
}

export {};
