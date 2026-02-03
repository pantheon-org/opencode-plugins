/**
 * Extract Sections Tests
 *
 * Tests for parsing markdown content and extracting structured sections.
 */

import { describe, expect, it } from 'bun:test';
import { extractSections } from './extract-sections';

describe('extractSections', () => {
  it('should extract all standard sections', () => {
    const markdown = `## What I do
I help with TypeScript development

## When to use me
Use when building TypeScript projects

## Instructions
Follow these steps carefully

## Checklist
- [ ] Step 1
- [ ] Step 2
- [ ] Step 3`;

    const sections = extractSections(markdown);

    expect(sections.whatIDo).toBe('I help with TypeScript development');
    expect(sections.whenToUseMe).toBe('Use when building TypeScript projects');
    expect(sections.instructions).toBe('Follow these steps carefully');
    expect(sections.checklist).toEqual(['Step 1', 'Step 2', 'Step 3']);
  });

  it('should handle markdown with only some sections', () => {
    const markdown = `## What I do
Core capabilities description

## Checklist
- [ ] Item A
- [ ] Item B`;

    const sections = extractSections(markdown);

    expect(sections.whatIDo).toBe('Core capabilities description');
    expect(sections.whenToUseMe).toBe('');
    expect(sections.instructions).toBe('');
    expect(sections.checklist).toEqual(['Item A', 'Item B']);
  });

  it('should handle empty content', () => {
    const sections = extractSections('');

    expect(sections.whatIDo).toBe('');
    expect(sections.whenToUseMe).toBe('');
    expect(sections.instructions).toBe('');
    expect(sections.checklist).toEqual([]);
  });

  it('should handle content without any recognized sections', () => {
    const markdown = `## Some Other Section
This is not a standard section

## Another Section
More content here`;

    const sections = extractSections(markdown);

    expect(sections.whatIDo).toBe('');
    expect(sections.whenToUseMe).toBe('');
    expect(sections.instructions).toBe('');
    expect(sections.checklist).toEqual([]);
  });

  it('should handle multiline content in sections', () => {
    const markdown = `## What I do
First line
Second line
Third line

## When to use me
Single line`;

    const sections = extractSections(markdown);

    expect(sections.whatIDo).toBe('First line\nSecond line\nThird line');
    expect(sections.whenToUseMe).toBe('Single line');
  });

  it('should handle checklist with various item formats', () => {
    const markdown = `## Checklist
- [ ] Unchecked item
- [x] Checked item
- [ ] Item with - special * characters
- [ ]   Item with extra spaces  `;

    const sections = extractSections(markdown);

    expect(sections.checklist).toEqual([
      'Unchecked item',
      'Checked item',
      'Item with - special * characters',
      'Item with extra spaces',
    ]);
  });

  it('should ignore content before first heading', () => {
    const markdown = `Some preamble text that should be ignored

## What I do
This is the actual content

## Instructions
Follow these steps`;

    const sections = extractSections(markdown);

    expect(sections.whatIDo).toBe('This is the actual content');
    expect(sections.instructions).toBe('Follow these steps');
  });
});
