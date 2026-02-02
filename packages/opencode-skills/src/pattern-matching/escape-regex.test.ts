/**
 * Escape Regex Tests
 *
 * Tests for regex escaping functionality.
 */

import { describe, expect, it } from 'bun:test';
import { escapeRegex } from './escape-regex';

describe('escapeRegex', () => {
  it('should escape dots', () => {
    expect(escapeRegex('test.txt')).toBe('test\\.txt');
    expect(escapeRegex('file.name')).toBe('file\\.name');
  });

  it('should escape asterisks', () => {
    expect(escapeRegex('a*b')).toBe('a\\*b');
    expect(escapeRegex('**')).toBe('\\*\\*');
  });

  it('should escape plus signs', () => {
    expect(escapeRegex('a+b')).toBe('a\\+b');
    expect(escapeRegex('c++')).toBe('c\\+\\+');
  });

  it('should escape question marks', () => {
    expect(escapeRegex('what?')).toBe('what\\?');
    expect(escapeRegex('??')).toBe('\\?\\?');
  });

  it('should escape caret', () => {
    expect(escapeRegex('^start')).toBe('\\^start');
    expect(escapeRegex('a^2')).toBe('a\\^2');
  });

  it('should escape dollar sign', () => {
    expect(escapeRegex('$price')).toBe('\\$price');
    expect(escapeRegex('100$')).toBe('100\\$');
  });

  it('should escape braces and brackets', () => {
    expect(escapeRegex('test{1,2}')).toBe('test\\{1,2\\}');
    expect(escapeRegex('[test]')).toBe('\\[test\\]');
    expect(escapeRegex('(test)')).toBe('\\(test\\)');
  });

  it('should escape pipe', () => {
    expect(escapeRegex('a|b')).toBe('a\\|b');
    expect(escapeRegex('||')).toBe('\\|\\|');
  });

  it('should escape backslash', () => {
    expect(escapeRegex('path\\to\\file')).toBe('path\\\\to\\\\file');
  });

  it('should handle empty string', () => {
    expect(escapeRegex('')).toBe('');
  });

  it('should handle string with no special chars', () => {
    expect(escapeRegex('skill-name')).toBe('skill-name');
    expect(escapeRegex('typescript')).toBe('typescript');
    expect(escapeRegex('test123')).toBe('test123');
  });

  it('should handle complex mixed patterns', () => {
    expect(escapeRegex('(a+b)*c?')).toBe('\\(a\\+b\\)\\*c\\?');
    expect(escapeRegex('[a-z]+')).toBe('\\[a-z\\]\\+');
    expect(escapeRegex('test[1].txt')).toBe('test\\[1\\]\\.txt');
  });

  it('should handle skill names with special chars', () => {
    expect(escapeRegex('regex.utils')).toBe('regex\\.utils');
    expect(escapeRegex('file[test]')).toBe('file\\[test\\]');
    expect(escapeRegex('test+v1.0')).toBe('test\\+v1\\.0');
  });
});
