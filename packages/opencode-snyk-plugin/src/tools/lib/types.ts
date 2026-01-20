/**
 * Snyk API type definitions for OpenCode tools
 * Based on Snyk REST API v3 (2023-06-22)
 */

/**
 * Pagination options for list requests
 */
export interface PaginationOptions {
  /** Maximum number of results to return */
  limit?: number;
  /** Cursor for getting results after a specific item */
  starting_after?: string;
  /** Cursor for getting results before a specific item */
  ending_before?: string;
}

/**
 * Pagination links returned in API responses
 */
export interface PaginationLinks {
  self?: string;
  first?: string;
  last?: string;
  next?: string;
  prev?: string;
}

/**
 * Pagination metadata returned in API responses
 */
export interface PaginationMeta {
  count?: number;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  links?: PaginationLinks;
  meta?: PaginationMeta;
}

/**
 * Snyk organization
 */
export interface SnykOrganization {
  id: string;
  name: string;
  slug: string;
}

/**
 * Snyk project
 */
export interface SnykProject {
  id: string;
  name: string;
  type: string;
  created: string;
  environment: readonly string[];
  tags: ReadonlyArray<{ key: string; value: string }>;
}

/**
 * Severity levels for vulnerabilities
 */
export type SeverityLevel = 'info' | 'low' | 'medium' | 'high' | 'critical';

/**
 * Issue types in Snyk
 */
export type IssueType = 'vuln' | 'license' | 'config' | 'code';

/**
 * Snyk issue/vulnerability
 */
export interface SnykIssue {
  id: string;
  title: string;
  type: IssueType;
  severity: SeverityLevel;
  url: string;
  description: string;
  introduced_date: string;
  disclosure_time?: string;
  exploit?: string;
  patch?: {
    id: string;
    modification_time: string;
    urls: string[];
    version: string;
  };
  identifiers?: {
    CVE?: string[];
    CWE?: string[];
  };
  credit?: string[];
  cvss_score?: number;
  language?: string;
  package_name?: string;
  package_manager?: string;
  is_ignored?: boolean;
  is_patched?: boolean;
  is_pinnable?: boolean;
  is_patchable?: boolean;
  is_upgradeable?: boolean;
  ignored_reasons?: Array<{
    reason: string;
    expires?: string;
  }>;
}

/**
 * Filter options for querying issues
 */
export interface FilterOptions {
  organizationId?: string;
  projectId?: string;
  severity?: SeverityLevel[];
  issueType?: IssueType[];
  isIgnored?: boolean;
  isPatched?: boolean;
  fromDate?: string;
  toDate?: string;
}

/**
 * Enhanced vulnerability with additional metadata
 */
export interface SnykVulnerability extends SnykIssue {
  key: string;
  effectiveSeverityLevel: SeverityLevel;
  status: 'open' | 'resolved';
  ignored: boolean;
  tool: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * JSON:API resource format
 */
export interface JsonApiResource<T = Record<string, unknown>> {
  id: string;
  type: string;
  attributes: T;
  relationships?: Record<
    string,
    {
      data?: { type: string; id: string } | Array<{ type: string; id: string }>;
      links?: {
        self?: string;
        related?: string;
      };
    }
  >;
  links?: {
    self?: string;
  };
  meta?: Record<string, unknown>;
}

/**
 * JSON:API response format
 */
export interface JsonApiResponse<T = Record<string, unknown>> {
  data: JsonApiResource<T> | JsonApiResource<T>[];
  included?: JsonApiResource[];
  links?: PaginationLinks;
  meta?: PaginationMeta & Record<string, unknown>;
  jsonapi?: {
    version: string;
  };
}

/**
 * Response metadata from API calls
 */
export interface ResponseMetadata {
  deprecation?: string;
  sunset?: string;
  requestId?: string;
  rateLimit?: {
    limit: number;
    remaining: number;
    reset: number;
  };
}

/**
 * Package URL (PURL) - a standardized way to identify software packages
 * Format: pkg:type/namespace/name\@version?qualifiers#subpath
 *
 * @example
 * - npm: pkg:npm/lodash\@4.17.21
 * - maven: pkg:maven/org.apache.commons/commons-lang3\@3.12.0
 * - pypi: pkg:pypi/django\@3.2.13
 */
export interface PackageURL {
  purl: string;
}

/**
 * Package issue with PURL identifier
 */
export interface PackageIssueWithPurl extends SnykVulnerability {
  /** The Package URL that caused this issue */
  purl: string;
}

/**
 * Options for dependency analysis
 */
export interface DependencyAnalysisOptions {
  /** Include transitive dependencies in the analysis */
  includeTransitive?: boolean;
  /** Maximum number of results to return per package */
  limit?: number;
  /** Number of results to skip for pagination */
  offset?: number;
  /** Filter by specific vulnerability types */
  vulnerabilityTypes?: ('vuln' | 'license')[];
  /** Minimum severity level to include in results */
  minSeverity?: SeverityLevel;
}

/**
 * Dependency analysis summary by severity
 */
export interface DependencyAnalysisSummary {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
}

/**
 * SBOM (Software Bill of Materials) format types
 */
export type SBOMFormat =
  | 'cyclonedx1.6+json'
  | 'cyclonedx1.6+xml'
  | 'cyclonedx1.5+json'
  | 'cyclonedx1.5+xml'
  | 'cyclonedx1.4+json'
  | 'cyclonedx1.4+xml'
  | 'spdx2.3+json';

/**
 * Options for SBOM generation
 */
export interface SBOMOptions {
  /** SBOM format to generate */
  format: SBOMFormat;
  /** Fields to exclude from the SBOM */
  exclude?: 'licenses'[];
}

/**
 * SBOM document (format-specific structure)
 */
export interface SBOMDocument {
  [key: string]: unknown;
}

/**
 * SBOM test job for async SBOM generation
 */
export interface SBOMTestJob {
  id: string;
  type: string;
  attributes: {
    status: 'running' | 'completed' | 'failed';
    createdAt: string;
    updatedAt?: string;
    completedAt?: string;
  };
}

/**
 * SBOM test result containing the generated SBOM
 */
export interface SBOMTestResult {
  id: string;
  type: string;
  attributes: {
    result: SBOMDocument;
    format: SBOMFormat;
    createdAt: string;
  };
}
