/**
 * GitLab API Client
 * Re-exports from api/ subdirectory for backward compatibility
 *
 * This file maintains the original client.ts import path while
 * the actual implementations follow the one-function-per-module principle
 * in the api/ subdirectory.
 */

export * from './api/index.ts';
