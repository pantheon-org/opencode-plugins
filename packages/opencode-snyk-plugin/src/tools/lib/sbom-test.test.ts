/**
 * Tests for sbom-test module
 */

import { describe, expect, it, mock } from 'bun:test';

import type { SnykClientConfig } from './create-client.ts';
import { getSBOMTestResults, getSBOMTestStatus, startSBOMTest } from './sbom-test.ts';

const mockClient: SnykClientConfig = {
  token: 'test-token',
  baseUrl: 'https://api.snyk.io',
  apiVersion: '2023-06-22',
  timeout: 30000,
};

describe('startSBOMTest', () => {
  it('starts SBOM test job', async () => {
    const mockResponse = {
      data: {
        id: 'job-123',
        type: 'sbom_test',
        attributes: {
          status: 'running',
        },
      },
    };

    global.fetch = mock(() => Promise.resolve(new Response(JSON.stringify(mockResponse), { status: 200 }))) as any;

    const result = await startSBOMTest(mockClient, 'org-123', {
      sbom: { bomFormat: 'CycloneDX' },
    });

    expect(result.id).toBe('job-123');
    expect(result.attributes.status).toBe('running');
  });

  it('sends POST request with test data', async () => {
    const mockResponse = {
      data: {
        id: 'job-456',
        type: 'sbom_test',
        attributes: { status: 'running' },
      },
    };

    const fetchMock = mock(() => Promise.resolve(new Response(JSON.stringify(mockResponse), { status: 200 })));
    global.fetch = fetchMock as any;

    const testData = { sbom: { bomFormat: 'SPDX' } };
    await startSBOMTest(mockClient, 'org-123', testData);

    const [, options] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(options.method).toBe('POST');
    expect(options.body).toContain('sbom_test');
  });

  it('includes organization ID in endpoint', async () => {
    const mockResponse = {
      data: { id: 'job-789', type: 'sbom_test', attributes: {} },
    };

    const fetchMock = mock(() => Promise.resolve(new Response(JSON.stringify(mockResponse), { status: 200 })));
    global.fetch = fetchMock as any;

    await startSBOMTest(mockClient, 'org-abc', {});

    const [url] = fetchMock.mock.calls[0] as unknown as [string, RequestInit?];
    expect(url).toContain('/rest/orgs/org-abc/sbom_tests');
  });
});

describe('getSBOMTestStatus', () => {
  it('retrieves test status', async () => {
    const mockResponse = {
      data: {
        id: 'job-123',
        type: 'sbom_test',
        attributes: {
          status: 'completed',
          progress: 100,
        },
      },
    };

    global.fetch = mock(() => Promise.resolve(new Response(JSON.stringify(mockResponse), { status: 200 }))) as any;

    const result = await getSBOMTestStatus(mockClient, 'org-123', 'job-123');

    expect(result.id).toBe('job-123');
    expect(result.attributes.status).toBe('completed');
  });

  it('constructs correct endpoint with job ID', async () => {
    const mockResponse = {
      data: { id: 'job-456', type: 'sbom_test', attributes: {} },
    };

    const fetchMock = mock(() => Promise.resolve(new Response(JSON.stringify(mockResponse), { status: 200 })));
    global.fetch = fetchMock as any;

    await getSBOMTestStatus(mockClient, 'org-xyz', 'job-456');

    const [url] = fetchMock.mock.calls[0] as unknown as [string, RequestInit?];
    expect(url).toContain('/rest/orgs/org-xyz/sbom_tests/job-456');
  });
});

describe('getSBOMTestResults', () => {
  it('retrieves test results', async () => {
    const mockResponse = {
      data: {
        id: 'result-123',
        type: 'sbom_test_result',
        attributes: {
          issues: [
            {
              id: 'vuln-1',
              title: 'SQL Injection',
              severity: 'high',
            },
          ],
          summary: {
            total: 1,
            high: 1,
            medium: 0,
            low: 0,
          },
        },
      },
    };

    global.fetch = mock(() => Promise.resolve(new Response(JSON.stringify(mockResponse), { status: 200 }))) as any;

    const result = await getSBOMTestResults(mockClient, 'org-123', 'job-123');

    expect(result.id).toBe('result-123');
    expect(result.attributes).toBeDefined();
  });

  it('constructs correct results endpoint', async () => {
    const mockResponse = {
      data: { id: 'result-456', type: 'sbom_test_result', attributes: {} },
    };

    const fetchMock = mock(() => Promise.resolve(new Response(JSON.stringify(mockResponse), { status: 200 })));
    global.fetch = fetchMock as any;

    await getSBOMTestResults(mockClient, 'org-abc', 'job-789');

    const [url] = fetchMock.mock.calls[0] as unknown as [string, RequestInit?];
    expect(url).toContain('/rest/orgs/org-abc/sbom_tests/job-789/results');
  });

  it('handles error response', async () => {
    global.fetch = mock(() =>
      Promise.resolve(
        new Response('{"error":"Job not found"}', {
          status: 404,
        }),
      ),
    ) as any;

    await expect(getSBOMTestResults(mockClient, 'org-123', 'invalid-job')).rejects.toThrow('Snyk API error (404)');
  });
});
