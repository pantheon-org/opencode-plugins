import { readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import type { ExecutorContext } from '@nx/devkit';
import { glob } from 'glob';
import ts from 'typescript';
import type { ValidateJsdocExecutorSchema } from './schema';

interface ValidationError {
  file: string;
  line: number;
  column: number;
  name: string;
  kind: 'function' | 'class' | 'method';
  message: string;
}

/**
 * Validates JSDoc comments on exported functions and classes
 */
export const validateJsdocExecutor = async (
  options: ValidateJsdocExecutorSchema,
  context: ExecutorContext,
): Promise<{ success: boolean; errors?: ValidationError[] }> => {
  const projectRoot = context.projectGraph?.nodes[context.projectName!]?.data.root;
  if (!projectRoot) {
    return {
      success: false,
      errors: [
        {
          file: 'unknown',
          line: 0,
          column: 0,
          name: '',
          kind: 'function',
          message: 'Project root not found',
        },
      ],
    };
  }

  const workspaceRoot = context.root;
  const absoluteProjectRoot = join(workspaceRoot, projectRoot);

  const includePatterns = options.include || ['**/*.ts'];
  const excludePatterns = options.exclude || ['**/*.test.ts', '**/*.spec.ts', '**/*.d.ts'];

  const files = await glob(includePatterns, {
    cwd: absoluteProjectRoot,
    ignore: excludePatterns,
    absolute: true,
  });

  const errors: ValidationError[] = [];

  for (const filePath of files) {
    const content = await readFile(filePath, 'utf-8');
    const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);

    const fileErrors = validateSourceFile(sourceFile, filePath, options);
    errors.push(...fileErrors);
  }

  if (errors.length > 0) {
    console.error('\n❌ JSDoc validation failed:\n');

    const groupedByFile = errors.reduce(
      (acc, err) => {
        const relPath = relative(workspaceRoot, err.file);
        if (!acc[relPath]) acc[relPath] = [];
        acc[relPath].push(err);
        return acc;
      },
      {} as Record<string, ValidationError[]>,
    );

    for (const [file, fileErrors] of Object.entries(groupedByFile)) {
      console.error(`\n📄 ${file}:`);
      for (const err of fileErrors) {
        console.error(`  ${err.line}:${err.column} - ${err.message}`);
      }
    }

    console.error(`\n❌ Total errors: ${errors.length}\n`);
    return { success: false, errors };
  }
  return { success: true };
};

/**
 * Validates a single source file for JSDoc comments
 */
const validateSourceFile = (
  sourceFile: ts.SourceFile,
  filePath: string,
  options: ValidateJsdocExecutorSchema,
): ValidationError[] => {
  const errors: ValidationError[] = [];

  const visit = (node: ts.Node) => {
    if (options.publicOnly && !isExported(node)) {
      ts.forEachChild(node, visit);
      return;
    }

    if (ts.isFunctionDeclaration(node) || ts.isClassDeclaration(node)) {
      const jsDoc = ts.getJSDocCommentsAndTags(node);

      if (jsDoc.length === 0) {
        const name = node.name?.getText(sourceFile) || 'anonymous';
        const pos = sourceFile.getLineAndCharacterOfPosition(node.pos);

        errors.push({
          file: filePath,
          line: pos.line + 1,
          column: pos.character + 1,
          name,
          kind: ts.isFunctionDeclaration(node) ? 'function' : 'class',
          message: `Missing JSDoc comment for exported ${ts.isFunctionDeclaration(node) ? 'function' : 'class'} '${name}'`,
        });
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return errors;
};

/**
 * Checks if a node is exported
 */
const isExported = (node: ts.Node): boolean => {
  if (!ts.canHaveModifiers(node)) return false;
  const modifiers = ts.getModifiers(node);
  if (!modifiers) return false;
  return modifiers.some((mod) => mod.kind === ts.SyntaxKind.ExportKeyword);
};

export default validateJsdocExecutor;
