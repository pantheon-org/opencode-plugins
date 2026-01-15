/**
 * Types for mirror package workflow scripts
 */

export interface PackageInfo {
  name: string;
  directory: string;
  version: string;
}

export interface MirrorUrl {
  url: string;
  owner: string;
  repo: string;
}

export interface ChangeDetection {
  hasChanges: boolean;
  previousTag?: string;
  changes?: string[];
}

export interface GitHubPagesConfig {
  owner: string;
  repo: string;
  build_type: 'workflow' | 'legacy';
  source: {
    branch: string;
    path: '/' | '/docs';
  };
}

export interface EnablePagesResult {
  success: boolean;
  status: 'created' | 'updated' | 'failed' | 'already-configured';
  message: string;
  httpCode?: number;
}
