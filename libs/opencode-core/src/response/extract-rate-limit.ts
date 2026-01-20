/**
 * Extract rate limit information from response headers
 */

/**
 * Helper to extract rate limit info from response headers
 * Common pattern across many APIs (GitHub, Snyk, GitLab, etc.)
 *
 * @param headers - Response headers object
 * @param prefix - Header prefix (default: 'x-ratelimit')
 * @returns Rate limit object or undefined
 *
 * @example
 * ```typescript
 * const rateLimit = extractRateLimit(response.headers);
 * return success(data, { rateLimit });
 * ```
 */
export const extractRateLimit = (
  headers: Headers,
  prefix = 'x-ratelimit',
): { limit: number; remaining: number; reset: number } | undefined => {
  const limitHeader = headers.get(`${prefix}-limit`);
  const remainingHeader = headers.get(`${prefix}-remaining`);
  const resetHeader = headers.get(`${prefix}-reset`);

  if (limitHeader && remainingHeader && resetHeader) {
    return {
      limit: parseInt(limitHeader, 10),
      remaining: parseInt(remainingHeader, 10),
      reset: parseInt(resetHeader, 10),
    };
  }

  return undefined;
};
