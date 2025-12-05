export interface PluginGeneratorSchema {
  name: string;
  description?: string;
  directory?: string;
  addTests?: boolean;
  addLint?: boolean;
  regenerate?: boolean;
}
