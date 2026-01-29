import { describe, expect, test, spyOn } from 'bun:test';
import { loadPluginConfig } from './loader';

describe('loader', () => {
  test('should load default config when file not found', async () => {
    const mockFile = () => ({
      exists: () => Promise.resolve(false),
    });

    spyOn(Bun, 'file').mockImplementation(mockFile as any);

    const config = await loadPluginConfig('/test');
    expect(config.autoPrompt).toBe(true); // Default value
  });

  test('should handle file read errors', async () => {
    const mockFile = () => ({
      exists: () => Promise.resolve(true),
      json: () => Promise.reject(new Error('File read error')),
    });

    spyOn(Bun, 'file').mockImplementation(mockFile as any);

    const config = await loadPluginConfig('/test');
    expect(config.autoPrompt).toBe(true); // Should fallback to default
  });
});
