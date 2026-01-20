/**
 * Tests for get-projects module
 */

import { describe, expect, it, mock } from 'bun:test';

import type { SnykClientConfig } from './create-client.ts';
import { getProjects } from './get-projects.ts';

const mockClient: SnykClientConfig = {
  token: 'test-token',
  baseUrl: 'https://api.snyk.io',
  apiVersion: '2023-06-22',
  timeout: 30000,
};

describe('getProjects', () => {
  it('fetches projects for organization', async () => {
    const mockResponse = {
      data: [
        {
          id: 'proj-1',
          type: 'project',
          attributes: {
            name: 'Project 1',
            type: 'npm',
            created: '2024-01-01',
          },
        },
        {
          id: 'proj-2',
          type: 'project',
          attributes: {
            name: 'Project 2',
            type: 'maven',
            created: '2024-01-02',
          },
        },
      ],
    };

    global.fetch = mock(() => Promise.resolve(new Response(JSON.stringify(mockResponse), { status: 200 }))) as any;

    const result = await getProjects(mockClient, 'org-123');

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      id: 'proj-1',
      name: 'Project 1',
      type: 'npm',
      created: '2024-01-01',
      environment: [],
      tags: [],
    });
  });

  it('includes organization ID in endpoint', async () => {
    const mockResponse = { data: [] };

    const fetchMock = mock(() => Promise.resolve(new Response(JSON.stringify(mockResponse), { status: 200 })));
    global.fetch = fetchMock as any;

    await getProjects(mockClient, 'org-456');

    const [url] = fetchMock.mock.calls[0] as unknown as [string, RequestInit?];
    expect(url).toContain('/rest/orgs/org-456/projects');
  });

  it('applies pagination options', async () => {
    const mockResponse = { data: [] };

    const fetchMock = mock(() => Promise.resolve(new Response(JSON.stringify(mockResponse), { status: 200 })));
    global.fetch = fetchMock as any;

    await getProjects(mockClient, 'org-789', {
      limit: 25,
      ending_before: 'cursor-end',
    });

    const [url] = fetchMock.mock.calls[0] as unknown as [string, RequestInit?];
    expect(url).toContain('limit=25');
    expect(url).toContain('ending_before=cursor-end');
  });
});
