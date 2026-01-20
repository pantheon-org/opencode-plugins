/**
 * Tests for transform-response module
 */

import { describe, expect, it } from 'bun:test';

import { transformJsonApiResponse } from './transform-response.ts';
import type { JsonApiResponse } from './types.ts';

describe('transformJsonApiResponse', () => {
  it('transforms single resource response', () => {
    const response: JsonApiResponse<{ name: string; slug: string }> = {
      data: {
        id: 'org-123',
        type: 'organization',
        attributes: {
          name: 'Test Org',
          slug: 'test-org',
        },
      },
      links: {
        self: 'https://api.snyk.io/rest/orgs/org-123',
      },
    };

    const result = transformJsonApiResponse(response);

    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toEqual({
      id: 'org-123',
      name: 'Test Org',
      slug: 'test-org',
    });
    expect(result.links).toEqual({
      self: 'https://api.snyk.io/rest/orgs/org-123',
    });
  });

  it('transforms array resource response', () => {
    const response: JsonApiResponse<{ name: string }> = {
      data: [
        {
          id: 'org-1',
          type: 'organization',
          attributes: { name: 'Org 1' },
        },
        {
          id: 'org-2',
          type: 'organization',
          attributes: { name: 'Org 2' },
        },
      ],
      links: {
        next: 'https://api.snyk.io/rest/orgs?cursor=abc',
      },
      meta: {
        count: 2,
      },
    };

    const result = transformJsonApiResponse(response);

    expect(result.data).toHaveLength(2);
    expect(result.data[0]).toEqual({ id: 'org-1', name: 'Org 1' });
    expect(result.data[1]).toEqual({ id: 'org-2', name: 'Org 2' });
    expect(result.links?.next).toBe('https://api.snyk.io/rest/orgs?cursor=abc');
    expect(result.meta?.count).toBe(2);
  });

  it('preserves additional attributes', () => {
    const response: JsonApiResponse<{ name: string; created: string; active: boolean }> = {
      data: {
        id: 'proj-123',
        type: 'project',
        attributes: {
          name: 'Test Project',
          created: '2024-01-01',
          active: true,
        },
      },
    };

    const result = transformJsonApiResponse(response);

    expect(result.data[0]).toEqual({
      id: 'proj-123',
      name: 'Test Project',
      created: '2024-01-01',
      active: true,
    });
  });

  it('handles empty array response', () => {
    const response: JsonApiResponse<{ name: string }> = {
      data: [],
      meta: { count: 0 },
    };

    const result = transformJsonApiResponse(response);

    expect(result.data).toEqual([]);
    expect(result.meta?.count).toBe(0);
  });

  it('handles response without links or meta', () => {
    const response: JsonApiResponse<{ title: string }> = {
      data: {
        id: 'item-1',
        type: 'item',
        attributes: { title: 'Test' },
      },
    };

    const result = transformJsonApiResponse(response);

    expect(result.data[0]).toEqual({ id: 'item-1', title: 'Test' });
    expect(result.links).toBeUndefined();
    expect(result.meta).toBeUndefined();
  });
});
