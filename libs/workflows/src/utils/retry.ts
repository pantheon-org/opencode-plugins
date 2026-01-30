/**
 * Retry logic with exponential backoff for handling transient API failures
 */

/**
 * Retry a function with exponential backoff
 * @param fn - Function to retry
 * @param maxRetries - Maximum number of retries (default: 3)
 * @returns Result of the function
 * @throws Last error if all retries fail or on 403 (permission denied)
 */
export const withRetry = async <T>(fn: () => Promise<T>, maxRetries: number = 3): Promise<T> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // biome-ignore lint: Error type varies by caller
    } catch (error: any) {
      // Don't retry on 403 Forbidden (permanent permission issue)
      if (i === maxRetries - 1 || error.status === 403) {
        throw error;
      }
      // Exponential backoff: 1s, 2s, 3s
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  throw new Error('Unreachable');
};
