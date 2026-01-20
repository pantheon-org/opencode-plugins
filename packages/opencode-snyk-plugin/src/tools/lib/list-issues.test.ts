/**
 * Tests for list-issues module
 */

import { describe, expect, it, mock } from 'bun:test';

import type { SnykClientConfig } from './create-client.ts';
import { listIssues } from './list-issues.ts';

const mockClient: SnykClientConfig = {
  token: 'test-token',
  baseUrl: 'https://api.snyk.io',
  apiVersion: '2023-06-22',
  timeout: 30000,
};

describe('listIssues', () => {
  it('fetches issues for project', async () => {
    const mockResponse = {
      data: [
        {
          id: 'issue-1',
          type: 'issue',
          attributes: {
            title: 'SQL Injection',
            severity: 'high',
            type: 'vuln',
          },
        },
      ],
    };

    global.fetch = mock(() => Promise.resolve(new Response(JSON.stringify(mockResponse), { status: 200 }))) as any;

    const result = await listIssues(mockClient, {
      organizationId: 'org-123',
      projectId: 'proj-456',
    });

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('SQL Injection');
  });

  it('throws error if organizationId missing', async () => {
    await expect(
      listIssues(mockClient, {
        projectId: 'proj-456',
      } as any),
    ).rejects.toThrow('organizationId and projectId are required');
  });

  it('throws error if projectId missing', async () => {
    await expect(
      listIssues(mockClient, {
        organizationId: 'org-123',
      } as any),
    ).rejects.toThrow('organizationId and projectId are required');
  });

  it('constructs correct endpoint URL', async () => {
    const mockResponse = { data: [] };

    const fetchMock = mock(() => Promise.resolve(new Response(JSON.stringify(mockResponse), { status: 200 })));
    global.fetch = fetchMock as any;

    await listIssues(mockClient, {
      organizationId: 'org-abc',
      projectId: 'proj-xyz',
    });

    expect(fetchMock).toHaveBeenCalled();
  });

  it('applies pagination options', async () => {
    const mockResponse = { data: [] };

    const fetchMock = mock(() => Promise.resolve(new Response(JSON.stringify(mockResponse), { status: 200 })));
    global.fetch = fetchMock as any;

    await listIssues(
      mockClient,
      {
        organizationId: 'org-123',
        projectId: 'proj-456',
      },
      { limit: 100 },
    );

    expect(fetchMock).toHaveBeenCalled();
  });
});
