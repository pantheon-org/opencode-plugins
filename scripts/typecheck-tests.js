#!/usr/bin/env node
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function findFiles(dir, name, results = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === '.nx' || entry.name === '.cache')
        continue;
      findFiles(full, name, results);
    } else if (entry.isFile() && entry.name === name) {
      results.push(full);
    }
  }
  return results;
}

const repoRoot = path.resolve(__dirname, '..');
const files = findFiles(repoRoot, 'tsconfig.test.json');
if (files.length === 0) {
  console.log('No tsconfig.test.json files found.');
  process.exit(0);
}

let failed = false;
for (const f of files) {
  // Prefer relative path for nicer output
  const rel = path.relative(repoRoot, f);
  console.log(`\nTypechecking tests for: ${rel}`);
  const cmd = 'bunx';
  const args = ['tsc', '-p', f, '--noEmit'];
  const proc = spawnSync(cmd, args, { stdio: 'inherit' });
  if (proc.error) {
    console.error(`Failed to run ${cmd}:`, proc.error);
    failed = true;
    break;
  }
  if (proc.status !== 0) {
    console.error(`${cmd} exited with code ${proc.status} for ${rel}`);
    failed = true;
  }
}

process.exit(failed ? 1 : 0);
