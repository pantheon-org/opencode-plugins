/**
 * Inverse Document Frequency Tests
 *
 * Tests for IDF calculation using BM25 formula.
 */

import { describe, expect, it } from 'bun:test';
import { inverseDocumentFrequency } from './inverse-document-frequency';

describe('inverseDocumentFrequency', () => {
  it('should calculate IDF for term appearing in all documents', () => {
    const docs = [
      ['common', 'word'],
      ['common', 'phrase'],
      ['common', 'text'],
    ];
    // When term is in all docs: log((3-3+0.5)/(3+0.5)+1) = log(0.5/3.5+1) = log(1.143)
    const idf = inverseDocumentFrequency('common', docs, 3);
    expect(idf).toBeCloseTo(Math.log(1.142857), 5);
  });

  it('should calculate IDF for term in half the documents', () => {
    const docs = [
      ['rare', 'word'],
      ['common', 'phrase'],
      ['common', 'text'],
    ];
    // When term is in 1 doc out of 3: log((3-1+0.5)/(1+0.5)+1) = log(2.5/1.5+1) = log(2.667)
    const idf = inverseDocumentFrequency('rare', docs, 3);
    expect(idf).toBeCloseTo(Math.log(2.666667), 5);
  });

  it('should calculate IDF for term in no documents', () => {
    const docs = [
      ['some', 'words'],
      ['other', 'phrase'],
      ['more', 'text'],
    ];
    // When term is in 0 docs: log((3-0+0.5)/(0+0.5)+1) = log(3.5/0.5+1) = log(8)
    const idf = inverseDocumentFrequency('missing', docs, 3);
    expect(idf).toBeCloseTo(Math.log(8), 5);
  });

  it('should return higher IDF for rarer terms', () => {
    const docs = [['common'], ['common'], ['common', 'rare']];
    const commonIdf = inverseDocumentFrequency('common', docs, 3);
    const rareIdf = inverseDocumentFrequency('rare', docs, 3);
    expect(rareIdf).toBeGreaterThan(commonIdf);
  });

  it('should handle single document corpus', () => {
    const docs = [['only', 'document']];
    // When term is in the doc: log((1-1+0.5)/(1+0.5)+1) = log(0.5/1.5+1)
    const idf = inverseDocumentFrequency('only', docs, 1);
    expect(idf).toBeCloseTo(Math.log(4 / 3), 5);
  });

  it('should handle empty documents array', () => {
    // Edge case: totalDocs=0, docsWithTerm=0
    // log((0-0+0.5)/(0+0.5)+1) = log(1+1) = log(2)
    const idf = inverseDocumentFrequency('test', [], 0);
    expect(idf).toBeCloseTo(Math.log(2), 5);
  });
});
