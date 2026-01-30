/**
 * Inverse Document Frequency Calculation
 *
 * Calculate IDF using the BM25 formula to measure term importance.
 */

/**
 * Calculate inverse document frequency
 *
 * IDF(t) = ln((N - df(t) + 0.5) / (df(t) + 0.5) + 1)
 *
 * Where:
 * - N: Total number of documents
 * - df(t): Number of documents containing term t
 *
 * @param term - Term to calculate IDF for
 * @param documents - All tokenized documents
 * @param totalDocs - Total number of documents
 * @returns IDF score for the term
 */
export function inverseDocumentFrequency(term: string, documents: string[][], totalDocs: number): number {
  const docsWithTerm = documents.filter((doc) => doc.includes(term)).length;
  return Math.log((totalDocs - docsWithTerm + 0.5) / (docsWithTerm + 0.5) + 1);
}
