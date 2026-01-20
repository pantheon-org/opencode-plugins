/**
 * Type guard to check if response is successful
 */

import type { PluginToolResponse } from '../types/response-types.js';

/**
 * Type guard to check if a response is successful
 *
 * @param response - Plugin tool response
 * @returns True if response indicates success
 *
 * @example
 * ```typescript
 * const response = await someTool(args);
 * if (isSuccess(response)) {
 *   // TypeScript knows response.data exists
 *   console.log(response.data);
 * }
 * ```
 */
export const isSuccess = <T>(
  response: PluginToolResponse<T>,
): response is PluginToolResponse<T> & { success: true; data: T } => {
  return response.success === true && response.data !== undefined;
};
