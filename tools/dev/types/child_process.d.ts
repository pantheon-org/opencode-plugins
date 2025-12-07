// Additional child_process typings used in this package
export function spawn(command: string, args?: string[], options?: any): any;
export interface ChildProcess {
  pid?: number;
  kill(signal?: any): void;
  on(event: string, listener: (...args: any[]) => void): this;
}
