export interface PackageGeneratorSchema {
  name: string;
  description?: string;
  directory?: string;
  addTests?: boolean;
  addLint?: boolean;
  mirrorRepo: string;
}
