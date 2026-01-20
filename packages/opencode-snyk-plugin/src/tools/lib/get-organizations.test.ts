/**
 * Tests for get-organizations module
 */

import { describe, expect, it, mock } from 'bun:test';

import type { SnykClientConfig } from './create-client.ts';
import { getOrganizations } from './get-organizations.ts';

const mockClient: SnykClientConfig = {
  token: 'test-token',
  baseUrl: 'https://api.snyk.io',
  apiVersion: '2023-06-22',
  timeout: 30000,
};

describe('getOrganizations', () => {
  it('fetches organizations with default pagination', async () => {
    const mockResponse = {
      data: [
        {
          id: 'org-1',
          type: 'organization',
          attributes: {
            name: 'Org 1',
            slug: 'org-1',
            created: '2024-01-01',
          },
        },
        {
          id: 'org-2',
          type: 'organization',
          attributes: {
            name: 'Org 2',
            slug: 'org-2',
            created: '2024-01-02',
          },
        },
      ],
      links: {
        self: 'https://api.snyk.io/rest/orgs',
      },
    };

    global.fetch = mock(() => Promise.resolve(new Response(JSON.stringify(mockResponse), { status: 200 }))) as any;

    const result = await getOrganizations(mockClient);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      id: 'org-1',
      name: 'Org 1',
      slug: 'org-1',
    });
  });

  it('applies pagination options', async () => {
    const mockResponse = {
      data: [
        {
          id: 'org-3',
          type: 'organization',
          attributes: { name: 'Org 3', slug: 'org-3' },
        },
      ],
    };

    const fetchMock = mock(() => Promise.resolve(new Response(JSON.stringify(mockResponse), { status: 200 })));
    global.fetch = fetchMock as any;

    await getOrganizations(mockClient, {
      limit: 50,
      starting_after: 'cursor123',
    });

    const [url] = fetchMock.mock.calls[0] as unknown as [string, RequestInit?];
    expect(url).toContain('limit=50');
    expect(url).toContain('starting_after=cursor123');
  });

  it('returns empty array when no organizations', async () => {
    const mockResponse = {
      data: [],
      meta: { count: 0 },
    };

    global.fetch = mock(() => Promise.resolve(new Response(JSON.stringify(mockResponse), { status: 200 }))) as any;

    const result = await getOrganizations(mockClient);

    expect(result).toEqual([]);
  });
});
