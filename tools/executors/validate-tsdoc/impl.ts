import type { ExecutorContext } from '@nx/devkit';
import { TSDocParser, TSDocConfiguration } from '@microsoft/tsdoc';
import * as ts from 'typescript';
import * as path from 'node:path';
import type { ValidateTsdocExecutorOptions } from './schema';

export default async function validateTsdocExecutor(
  options: ValidateTsdocExecutorOptions,
  context: ExecutorContext,
): Promise<{ success: boolean }> {
  const { projectRoot, tsConfig = 'tsconfig.json', failOnWarning = false } = options;
  const configPath = path.join(context.root, projectRoot, tsConfig);

  console.log(`Validating TSDoc comments in ${projectRoot}...`);

  // Parse TypeScript project
  const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
  if (configFile.error) {
    console.error(`Error reading tsconfig: ${configFile.error.messageText}`);
    return { success: false };
  }

  const parsedConfig = ts.parseJsonConfigFileContent(configFile.config, ts.sys, path.dirname(configPath));

  const program = ts.createProgram(parsedConfig.fileNames, parsedConfig.options);
  const sourceFiles = program.getSourceFiles().filter((file) => {
    const fileName = file.fileName;
    return (
      !fileName.includes('node_modules') &&
      !fileName.endsWith('.d.ts') &&
      fileName.startsWith(path.join(context.root, projectRoot))
    );
  });

  // Initialize TSDoc parser
  const tsdocConfig = new TSDocConfiguration();
  const tsdocParser = new TSDocParser(tsdocConfig);

  let hasErrors = false;
  let hasWarnings = false;
  let filesChecked = 0;
  let commentsChecked = 0;

  for (const sourceFile of sourceFiles) {
    // Skip test files
    if (sourceFile.fileName.endsWith('.test.ts') || sourceFile.fileName.endsWith('.spec.ts')) {
      continue;
    }

    filesChecked++;

    // Find all JSDoc comments
    const comments = extractJsDocComments(sourceFile);

    for (const comment of comments) {
      commentsChecked++;
      const result = tsdocParser.parseString(comment.text);

      if (result.log.messages.length > 0) {
        result.log.messages.forEach((message) => {
          const severity = message.messageId.startsWith('tsdoc-') ? 'error' : 'warning';
          const relPath = path.relative(context.root, sourceFile.fileName);
          console.error(`${relPath}:${comment.line} - ${severity}: ${message.text}`);

          if (severity === 'error') hasErrors = true;
          if (severity === 'warning') hasWarnings = true;
        });
      }
    }
  }

  console.log(`Checked ${commentsChecked} TSDoc comments in ${filesChecked} files`);

  if (hasErrors) {
    console.error('TSDoc validation failed with errors');
  } else if (hasWarnings) {
    console.warn('TSDoc validation completed with warnings');
  } else {
    console.log('TSDoc validation passed');
  }

  const success = !hasErrors && (!failOnWarning || !hasWarnings);
  return { success };
}

function extractJsDocComments(sourceFile: ts.SourceFile): Array<{ text: string; line: number }> {
  const comments: Array<{ text: string; line: number }> = [];

  const visit = (node: ts.Node) => {
    // Get JSDoc comments attached to this node
    const jsDocComments = (ts as any).getJSDocCommentsAndTags ? (ts as any).getJSDocCommentsAndTags(node) : [];

    // Fallback for older TypeScript versions
    if (jsDocComments.length === 0) {
      const jsDocs = (node as any).jsDoc;
      if (jsDocs && Array.isArray(jsDocs)) {
        jsDocs.forEach((doc: any) => {
          if (doc.comment !== undefined) {
            const text = sourceFile.text.substring(doc.pos, doc.end);
            const pos = sourceFile.getLineAndCharacterOfPosition(doc.pos);
            comments.push({ text, line: pos.line + 1 });
          }
        });
      }
    } else {
      jsDocComments.forEach((comment: any) => {
        const text = comment.getText ? comment.getText() : sourceFile.text.substring(comment.pos, comment.end);
        const pos = sourceFile.getLineAndCharacterOfPosition(comment.getStart ? comment.getStart() : comment.pos);
        comments.push({ text, line: pos.line + 1 });
      });
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return comments;
}
