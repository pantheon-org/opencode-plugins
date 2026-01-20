/**
 * Extract response metadata from headers
 */

import type { ResponseMetadata } from './types.ts';

export const extractMetadata = (response: Response): ResponseMetadata => {
  const metadata: ResponseMetadata = {};

  const deprecation = response.headers.get('deprecation');
  if (deprecation) {
    metadata.deprecation = deprecation;
  }

  const sunset = response.headers.get('sunset');
  if (sunset) {
    metadata.sunset = sunset;
  }

  const requestId = response.headers.get('x-request-id');
  if (requestId) {
    metadata.requestId = requestId;
  }

  const rateLimitLimit = response.headers.get('x-ratelimit-limit');
  const rateLimitRemaining = response.headers.get('x-ratelimit-remaining');
  const rateLimitReset = response.headers.get('x-ratelimit-reset');

  if (rateLimitLimit && rateLimitRemaining && rateLimitReset) {
    metadata.rateLimit = {
      limit: parseInt(rateLimitLimit, 10),
      remaining: parseInt(rateLimitRemaining, 10),
      reset: parseInt(rateLimitReset, 10),
    };
  }

  return metadata;
};
