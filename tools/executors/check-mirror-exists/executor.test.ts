import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { ExecutorContext } from '@nx/devkit';

// Import the executor
import runExecutor from './executor';

// Define mock types
interface MockData {
  name: string;
}

interface MockResponse {
  data: MockData;
}

interface MockIssue {
  number: number;
  title: string;
  state: string;
}

interface MockIssuesResponse {
  data: MockIssue[];
}

interface MockRepos {
  get: ReturnType<typeof mock>;
}

interface MockIssues {
  listForRepo: ReturnType<typeof mock>;
  create: ReturnType<typeof mock>;
  createComment: ReturnType<typeof mock>;
}

interface MockOctokit {
  rest: {
    repos: MockRepos;
    issues: MockIssues;
  };
}

// Mock Octokit
const mockOctokit: MockOctokit = {
  rest: {
    repos: {
      get: mock(() => Promise.resolve({ data: { name: 'test-repo' } } as MockResponse)),
    },
    issues: {
      listForRepo: mock(() => Promise.resolve({ data: [] } as MockIssuesResponse)),
      create: mock(() => Promise.resolve({ data: { number: 1 } })),
      createComment: mock(() => Promise.resolve({ data: { id: 1 } })),
    },
  },
};

// Store original env vars
const originalEnv = { ...process.env };

// Store original readFileSync
const originalReadFileSync = readFileSync;

// Helper to create mock context
const createMockContext = (projectName: string, projectRoot: string): ExecutorContext => ({
  root: '/workspace',
  cwd: '/workspace',
  isVerbose: false,
  projectName,
  projectsConfigurations: {
    version: 2,
    projects: {},
  },
  nxJsonConfiguration: {},
  projectGraph: {
    nodes: {
      [projectName]: {
        name: projectName,
        type: 'lib',
        data: {
          root: projectRoot,
          sourceRoot: `${projectRoot}/src`,
          targets: {},
        },
      },
    },
    dependencies: {},
  },
});

// Helper to create mock package.json content
const createPackageJson = (name: string, repository?: string | { type: string; url: string }) => {
  return JSON.stringify({
    name,
    version: '1.0.0',
    ...(repository && { repository }),
  });
};

// Helper to setup mocks for a test
const setupMocks = (mockFs: Record<string, string>) => {
  // Mock Octokit constructor
  const mockOctokitConstructor = mock(() => mockOctokit);
  mock.module('@octokit/rest', () => ({
    Octokit: mockOctokitConstructor,
  }));

  // Mock fs.readFileSync
  mock.module('node:fs', () => ({
    readFileSync: mock((path: string) => {
      const content = mockFs[path];
      if (!content) throw new Error(`ENOENT: no such file or directory, open '${path}'`);
      return content;
    }),
  }));
};

// Helper to restore original modules
const restoreMocks = () => {
  mock.module('node:fs', () => ({ readFileSync: originalReadFileSync }));
};

describe('check-mirror-exists executor', () => {
  beforeEach(() => {
    // Set required environment variables
    process.env.GITHUB_TOKEN = 'test-token';
    process.env.GITHUB_REPOSITORY_OWNER = 'test-org';
    process.env.GITHUB_REPOSITORY = 'test-org/test-repo';

    // Reset mocks
    mockOctokit.rest.repos.get.mockClear();
    mockOctokit.rest.issues.listForRepo.mockClear();
    mockOctokit.rest.issues.create.mockClear();
    mockOctokit.rest.issues.createComment.mockClear();
  });

  afterEach(() => {
    // Restore original environment
    process.env = { ...originalEnv };
    // Restore original modules
    restoreMocks();
  });

  describe('success cases', () => {
    it('should succeed when mirror repository exists', async () => {
      const context = createMockContext('test-package', 'packages/test-package');
      const packageJsonPath = join(context.root, 'packages/test-package/package.json');

      setupMocks({
        [packageJsonPath]: createPackageJson('test-package', 'https://github.com/test-org/test-package'),
      });

      mockOctokit.rest.repos.get.mockResolvedValueOnce({ data: { name: 'test-package' } } as MockResponse);

      const result = await runExecutor({}, context);

      expect(result.success).toBe(true);
      expect(result.mirrorUrl).toBe('https://github.com/test-org/test-package');
      expect(mockOctokit.rest.repos.get).toHaveBeenCalledWith({
        owner: 'test-org',
        repo: 'test-package',
      });
    });

    it('should succeed and skip check when no repository URL is specified', async () => {
      const context = createMockContext('test-package', 'packages/test-package');
      const packageJsonPath = join(context.root, 'packages/test-package/package.json');

      setupMocks({
        [packageJsonPath]: createPackageJson('test-package'),
      });

      const result = await runExecutor({}, context);

      expect(result.success).toBe(true);
      expect(mockOctokit.rest.repos.get).not.toHaveBeenCalled();
    });

    it('should handle repository as object format', async () => {
      const context = createMockContext('test-package', 'packages/test-package');
      const packageJsonPath = join(context.root, 'packages/test-package/package.json');

      setupMocks({
        [packageJsonPath]: createPackageJson('test-package', {
          type: 'git',
          url: 'git+https://github.com/test-org/test-package.git',
        }),
      });

      mockOctokit.rest.repos.get.mockResolvedValueOnce({ data: { name: 'test-package' } } as MockResponse);

      const result = await runExecutor({}, context);

      expect(result.success).toBe(true);
      expect(result.mirrorUrl).toBe('https://github.com/test-org/test-package');
    });
  });

  describe('URL parsing', () => {
    it('should parse git+https URL format', async () => {
      const context = createMockContext('test-package', 'packages/test-package');
      const packageJsonPath = join(context.root, 'packages/test-package/package.json');

      setupMocks({
        [packageJsonPath]: createPackageJson('test-package', 'git+https://github.com/test-org/test-package.git'),
      });

      mockOctokit.rest.repos.get.mockResolvedValueOnce({ data: { name: 'test-package' } } as MockResponse);

      const result = await runExecutor({}, context);

      expect(result.success).toBe(true);
      expect(mockOctokit.rest.repos.get).toHaveBeenCalledWith({
        owner: 'test-org',
        repo: 'test-package',
      });
    });

    it('should parse https URL format without .git', async () => {
      const context = createMockContext('test-package', 'packages/test-package');
      const packageJsonPath = join(context.root, 'packages/test-package/package.json');

      setupMocks({
        [packageJsonPath]: createPackageJson('test-package', 'https://github.com/test-org/test-package'),
      });

      mockOctokit.rest.repos.get.mockResolvedValueOnce({ data: { name: 'test-package' } } as MockResponse);

      const result = await runExecutor({}, context);

      expect(result.success).toBe(true);
    });

    it('should parse github: shorthand format', async () => {
      const context = createMockContext('test-package', 'packages/test-package');
      const packageJsonPath = join(context.root, 'packages/test-package/package.json');

      setupMocks({
        [packageJsonPath]: createPackageJson('test-package', 'github:test-org/test-package'),
      });

      mockOctokit.rest.repos.get.mockResolvedValueOnce({ data: { name: 'test-package' } } as MockResponse);

      const result = await runExecutor({}, context);

      expect(result.success).toBe(true);
      expect(mockOctokit.rest.repos.get).toHaveBeenCalledWith({
        owner: 'test-org',
        repo: 'test-package',
      });
    });

    it('should parse SSH URL format', async () => {
      const context = createMockContext('test-package', 'packages/test-package');
      const packageJsonPath = join(context.root, 'packages/test-package/package.json');

      setupMocks({
        [packageJsonPath]: createPackageJson('test-package', 'git@github.com:test-org/test-package.git'),
      });

      mockOctokit.rest.repos.get.mockResolvedValueOnce({ data: { name: 'test-package' } } as MockResponse);

      const result = await runExecutor({}, context);

      expect(result.success).toBe(true);
    });

    it('should handle organization names with numbers and hyphens', async () => {
      const context = createMockContext('test-package', 'packages/test-package');
      const packageJsonPath = join(context.root, 'packages/test-package/package.json');

      setupMocks({
        [packageJsonPath]: createPackageJson('test-package', 'https://github.com/test-org-123/test-package'),
      });

      mockOctokit.rest.repos.get.mockResolvedValueOnce({ data: { name: 'test-package' } } as MockResponse);

      const result = await runExecutor({}, context);

      expect(result.success).toBe(true);
      expect(mockOctokit.rest.repos.get).toHaveBeenCalledWith({
        owner: 'test-org-123',
        repo: 'test-package',
      });
    });
  });

  describe('error cases', () => {
    it('should fail when project name is missing', async () => {
      const context = createMockContext('', 'packages/test-package');
      context.projectName = undefined;

      const result = await runExecutor({}, context);

      expect(result.success).toBe(false);
      expect(result.error).toBe('No project name in context');
    });

    it('should fail when project configuration is not found', async () => {
      const context = createMockContext('test-package', 'packages/test-package');
      context.projectGraph = { nodes: {}, dependencies: {} };

      const result = await runExecutor({}, context);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Project configuration not found');
    });

    it('should fail when package.json cannot be read', async () => {
      const context = createMockContext('test-package', 'packages/test-package');

      setupMocks({});

      const result = await runExecutor({}, context);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to read package.json');
    });

    it('should fail when repository URL format is invalid', async () => {
      const context = createMockContext('test-package', 'packages/test-package');
      const packageJsonPath = join(context.root, 'packages/test-package/package.json');

      setupMocks({
        [packageJsonPath]: createPackageJson('test-package', 'not-a-valid-github-url'),
      });

      const result = await runExecutor({}, context);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid GitHub URL format');
    });

    it('should fail when GITHUB_TOKEN is not set', async () => {
      process.env.GITHUB_TOKEN = undefined;

      const context = createMockContext('test-package', 'packages/test-package');
      const packageJsonPath = join(context.root, 'packages/test-package/package.json');

      setupMocks({
        [packageJsonPath]: createPackageJson('test-package', 'https://github.com/test-org/test-package'),
      });

      const result = await runExecutor({}, context);

      expect(result.success).toBe(false);
      expect(result.error).toBe('GITHUB_TOKEN not set');
    });

    it('should fail when mirror repository does not exist', async () => {
      const context = createMockContext('test-package', 'packages/test-package');
      const packageJsonPath = join(context.root, 'packages/test-package/package.json');

      setupMocks({
        [packageJsonPath]: createPackageJson('test-package', 'https://github.com/test-org/test-package'),
      });

      // Mock 404 response
      mockOctokit.rest.repos.get.mockRejectedValueOnce({ status: 404, message: 'Not Found' });
      mockOctokit.rest.issues.listForRepo.mockResolvedValueOnce({ data: [] } as MockIssuesResponse);
      mockOctokit.rest.issues.create.mockResolvedValueOnce({ data: { number: 1 } });

      const result = await runExecutor({}, context);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Mirror repository does not exist');
      expect(result.mirrorUrl).toBe('https://github.com/test-org/test-package');

      // Should create issue
      expect(mockOctokit.rest.issues.create).toHaveBeenCalled();
    });

    it('should fail with API error when GitHub returns 403', async () => {
      const context = createMockContext('test-package', 'packages/test-package');
      const packageJsonPath = join(context.root, 'packages/test-package/package.json');

      setupMocks({
        [packageJsonPath]: createPackageJson('test-package', 'https://github.com/test-org/test-package'),
      });

      // Mock 403 response
      mockOctokit.rest.repos.get.mockRejectedValueOnce({ status: 403, message: 'Forbidden' });

      const result = await runExecutor({}, context);

      expect(result.success).toBe(false);
      expect(result.error).toContain('GitHub API error');
    });
  });

  describe('issue creation', () => {
    it('should create new issue when mirror does not exist', async () => {
      const context = createMockContext('test-package', 'packages/test-package');
      const packageJsonPath = join(context.root, 'packages/test-package/package.json');

      setupMocks({
        [packageJsonPath]: createPackageJson('test-package', 'https://github.com/test-org/test-package'),
      });

      mockOctokit.rest.repos.get.mockRejectedValueOnce({ status: 404, message: 'Not Found' });
      mockOctokit.rest.issues.listForRepo.mockResolvedValueOnce({ data: [] } as MockIssuesResponse);
      mockOctokit.rest.issues.create.mockResolvedValueOnce({ data: { number: 1 } });

      await runExecutor({}, context);

      expect(mockOctokit.rest.issues.create).toHaveBeenCalledWith({
        owner: 'test-org',
        repo: 'test-repo',
        title: 'Missing Mirror Repository: test-package',
        body: expect.stringContaining('test-package'),
        labels: ['chore', 'mirror-repository'],
      });
    });

    it('should update existing issue when mirror still does not exist', async () => {
      const context = createMockContext('test-package', 'packages/test-package');
      const packageJsonPath = join(context.root, 'packages/test-package/package.json');

      setupMocks({
        [packageJsonPath]: createPackageJson('test-package', 'https://github.com/test-org/test-package'),
      });

      mockOctokit.rest.repos.get.mockRejectedValueOnce({ status: 404, message: 'Not Found' });
      mockOctokit.rest.issues.listForRepo.mockResolvedValueOnce({
        data: [{ number: 42, title: 'Missing Mirror Repository: test-package', state: 'open' }],
      } as MockIssuesResponse);
      mockOctokit.rest.issues.createComment.mockResolvedValueOnce({ data: { id: 1 } });

      await runExecutor({}, context);

      expect(mockOctokit.rest.issues.createComment).toHaveBeenCalledWith({
        owner: 'test-org',
        repo: 'test-repo',
        issue_number: 42,
        body: expect.stringContaining('still does not exist'),
      });
      expect(mockOctokit.rest.issues.create).not.toHaveBeenCalled();
    });

    it('should handle issue creation failure gracefully', async () => {
      const context = createMockContext('test-package', 'packages/test-package');
      const packageJsonPath = join(context.root, 'packages/test-package/package.json');

      setupMocks({
        [packageJsonPath]: createPackageJson('test-package', 'https://github.com/test-org/test-package'),
      });

      mockOctokit.rest.repos.get.mockRejectedValueOnce({ status: 404, message: 'Not Found' });
      mockOctokit.rest.issues.listForRepo.mockRejectedValueOnce(new Error('API Error'));

      const result = await runExecutor({}, context);

      // Should still return failure even if issue creation fails
      expect(result.success).toBe(false);
      expect(result.error).toContain('Mirror repository does not exist');
    });
  });

  describe('custom package.json path', () => {
    it('should use custom packageJsonPath option', async () => {
      const context = createMockContext('test-package', 'packages/test-package');
      const customPath = '/custom/path/package.json';

      setupMocks({
        [customPath]: createPackageJson('test-package', 'https://github.com/test-org/test-package'),
      });

      mockOctokit.rest.repos.get.mockResolvedValueOnce({ data: { name: 'test-package' } } as MockResponse);

      const result = await runExecutor({ packageJsonPath: customPath }, context);

      expect(result.success).toBe(true);
    });
  });
});
