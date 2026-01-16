export interface LibraryGeneratorSchema {
  name: string;
  description?: string;
  directory?: string;
  addTests?: boolean;
  addLint?: boolean;
}
