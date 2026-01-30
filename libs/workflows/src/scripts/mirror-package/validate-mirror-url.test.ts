import { afterEach, describe, expect, it } from 'bun:test';
import { existsSync } from 'node:fs';
import { unlink, writeFile } from 'node:fs/promises';

import { validateMirrorUrl } from './validate-mirror-url';

describe('validateMirrorUrl', () => {
  const testPackageJsonPath = '/tmp/test-package.json';

  afterEach(async () => {
    // Cleanup test file if it exists
    if (existsSync(testPackageJsonPath)) {
      await unlink(testPackageJsonPath);
    }
  });

  it('should extract repository URL from string format', async () => {
    const pkg = {
      name: 'test-package',
      repository: 'git+https://github.com/owner/repo.git',
    };
    await writeFile(testPackageJsonPath, JSON.stringify(pkg, null, 2));

    const result = await validateMirrorUrl(testPackageJsonPath);

    expect(result).toEqual({
      url: 'https://github.com/owner/repo',
      owner: 'owner',
      repo: 'repo',
    });
  });

  it('should extract repository URL from object format', async () => {
    const pkg = {
      name: 'test-package',
      repository: {
        type: 'git',
        url: 'git+https://github.com/pantheon-org/test-plugin.git',
      },
    };
    await writeFile(testPackageJsonPath, JSON.stringify(pkg, null, 2));

    const result = await validateMirrorUrl(testPackageJsonPath);

    expect(result).toEqual({
      url: 'https://github.com/pantheon-org/test-plugin',
      owner: 'pantheon-org',
      repo: 'test-plugin',
    });
  });

  it('should handle URL without git+ prefix', async () => {
    const pkg = {
      name: 'test-package',
      repository: {
        type: 'git',
        url: 'https://github.com/owner/repo.git',
      },
    };
    await writeFile(testPackageJsonPath, JSON.stringify(pkg, null, 2));

    const result = await validateMirrorUrl(testPackageJsonPath);

    expect(result).toEqual({
      url: 'https://github.com/owner/repo',
      owner: 'owner',
      repo: 'repo',
    });
  });

  it('should handle URL without .git suffix', async () => {
    const pkg = {
      name: 'test-package',
      repository: 'https://github.com/owner/repo',
    };
    await writeFile(testPackageJsonPath, JSON.stringify(pkg, null, 2));

    const result = await validateMirrorUrl(testPackageJsonPath);

    expect(result).toEqual({
      url: 'https://github.com/owner/repo',
      owner: 'owner',
      repo: 'repo',
    });
  });

  it('should throw error if package.json does not exist', async () => {
    await expect(validateMirrorUrl('/nonexistent/package.json')).rejects.toThrow('package.json not found');
  });

  it('should throw error if repository field is missing', async () => {
    const pkg = {
      name: 'test-package',
    };
    await writeFile(testPackageJsonPath, JSON.stringify(pkg, null, 2));

    await expect(validateMirrorUrl(testPackageJsonPath)).rejects.toThrow('No repository URL found');
  });

  it('should throw error if repository URL is empty string', async () => {
    const pkg = {
      name: 'test-package',
      repository: '',
    };
    await writeFile(testPackageJsonPath, JSON.stringify(pkg, null, 2));

    await expect(validateMirrorUrl(testPackageJsonPath)).rejects.toThrow('No repository URL found');
  });

  it('should throw error if repository object has no url', async () => {
    const pkg = {
      name: 'test-package',
      repository: {
        type: 'git',
      },
    };
    await writeFile(testPackageJsonPath, JSON.stringify(pkg, null, 2));

    await expect(validateMirrorUrl(testPackageJsonPath)).rejects.toThrow('No repository URL found');
  });

  it('should throw error for invalid GitHub URL format', async () => {
    const pkg = {
      name: 'test-package',
      repository: 'https://gitlab.com/owner/repo.git',
    };
    await writeFile(testPackageJsonPath, JSON.stringify(pkg, null, 2));

    await expect(validateMirrorUrl(testPackageJsonPath)).rejects.toThrow('Invalid GitHub repository URL');
  });

  it('should throw error for malformed GitHub URL', async () => {
    const pkg = {
      name: 'test-package',
      repository: 'https://github.com/invalid',
    };
    await writeFile(testPackageJsonPath, JSON.stringify(pkg, null, 2));

    await expect(validateMirrorUrl(testPackageJsonPath)).rejects.toThrow('Invalid GitHub repository URL');
  });
});
