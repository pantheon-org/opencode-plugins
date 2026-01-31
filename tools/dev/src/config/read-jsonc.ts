import fs from 'node:fs';
import { applyEdits, modify as modifyJsonC, parse as parseJsonC } from 'jsonc-parser';
import type { JsoncResult, OpencodeConfig } from '../types';

export function readJsonc(file: string): JsoncResult {
  const raw = fs.readFileSync(file, 'utf8');
  const errors: { message: string }[] = [];
  const json = parseJsonC(raw, errors);
  if (errors.length) {
    throw new Error(`Failed to parse JSONC at ${file}: ${JSON.stringify(errors)}`);
  }
  return { json, raw };
}
