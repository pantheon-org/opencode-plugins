/**
 * Type guard to check if response is a failure
 */

import type { PluginToolResponse } from '../types/response-types.js';

/**
 * Type guard to check if a response is an error
 *
 * @param response - Plugin tool response
 * @returns True if response indicates failure
 *
 * @example
 * ```typescript
 * const response = await someTool(args);
 * if (isFailure(response)) {
 *   // TypeScript knows response.error exists
 *   console.error(response.error.message);
 * }
 * ```
 */
export const isFailure = <T>(
  response: PluginToolResponse<T>,
): response is PluginToolResponse<T> & {
  success: false;
  error: NonNullable<PluginToolResponse['error']>;
} => {
  return response.success === false && response.error !== undefined;
};
