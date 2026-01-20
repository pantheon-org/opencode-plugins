/**
 * Tests for getSessionConfig
 */

import { getSessionConfig } from './get-session-config';

describe('getSessionConfig', () => {
  it('should return defaults when config is empty', () => {
    const config = getSessionConfig({}, 'test-plugin');

    expect(config).toEqual({
      showToasts: true,
      showProgress: true,
      suppressAll: false,
    });
  });

  it('should extract plugin-specific config', () => {
    const config = getSessionConfig(
      {
        'test-plugin': {
          notifications: {
            enabled: true,
          },
        },
      },
      'test-plugin',
    );

    expect(config.showToasts).toBe(true);
    expect(config.showProgress).toBe(true);
  });

  it('should respect disabled notifications', () => {
    const config = getSessionConfig(
      {
        'test-plugin': {
          notifications: {
            enabled: false,
          },
        },
      },
      'test-plugin',
    );

    expect(config.suppressAll).toBe(true);
    expect(config.showToasts).toBe(false);
    expect(config.showProgress).toBe(false);
  });

  it('should handle disabled success toasts', () => {
    const config = getSessionConfig(
      {
        'test-plugin': {
          notifications: {
            success: false,
          },
        },
      },
      'test-plugin',
    );

    expect(config.showToasts).toBe(false);
  });

  it('should handle disabled progress', () => {
    const config = getSessionConfig(
      {
        'test-plugin': {
          notifications: {
            progress: false,
          },
        },
      },
      'test-plugin',
    );

    expect(config.showProgress).toBe(false);
  });

  it('should handle missing plugin config', () => {
    const config = getSessionConfig(
      {
        'other-plugin': {
          notifications: { enabled: false },
        },
      },
      'test-plugin',
    );

    expect(config).toEqual({
      showToasts: true,
      showProgress: true,
      suppressAll: false,
    });
  });
});
