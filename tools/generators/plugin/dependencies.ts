import * as fs from 'fs';

export interface DevDependencies {
  [packageName: string]: string;
}

export const devDependencies = (): DevDependencies => {
  const packageJson: string = fs.readFileSync('../../package.json', 'utf-8');

  return JSON.parse(packageJson).devDependencies;
};
