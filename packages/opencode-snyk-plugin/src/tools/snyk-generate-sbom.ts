/**
 * Generate SBOM (Software Bill of Materials) for a Snyk project
 * Tool: snyk-generate-sbom
 */

import type { PluginInput } from '@opencode-ai/plugin';
import { failure, measureDuration, type PluginToolResponse, success } from '@pantheon-org/opencode-core';
import { createToolLogger, logOperationTiming } from '@pantheon-org/opencode-core';
import { formatDuration, sendErrorToast, sendSuccessToast } from '@pantheon-org/opencode-core';

import { createClient, generateSBOM as generateSBOMLib } from './lib/index.ts';
import type { SBOMDocument, SBOMFormat, SBOMOptions } from './lib/index.ts';

const log = createToolLogger('snyk', 'generate-sbom');

/**
 * Tool parameters for SBOM generation
 */
export interface GenerateSBOMParams {
  organizationId: string;
  projectId: string;
  format?: SBOMFormat;
  excludeLicenses?: boolean;
  exclude?: 'licenses'[];
  token?: string;
  baseUrl?: string;
  timeout?: number;
}

/**
 * Tool result for SBOM generation
 */
interface GenerateSBOMData {
  sbom: SBOMDocument;
  format: SBOMFormat;
  organizationId: string;
  projectId: string;
}

/**
 * Generate Software Bill of Materials (SBOM) for a Snyk project
 */
export const generateSBOM = async (
  params: GenerateSBOMParams,
  toolCtx?: any,
): Promise<PluginToolResponse<GenerateSBOMData>> => {
  const ctx = toolCtx as unknown as PluginInput;

  log.info('Generating SBOM', {
    organizationId: params.organizationId,
    projectId: params.projectId,
    format: params.format || 'cyclonedx1.6+json',
  });

  try {
    const client = createClient({
      token: params.token,
      baseUrl: params.baseUrl,
      timeout: params.timeout,
    });

    const options: SBOMOptions = {
      format: params.format || 'cyclonedx1.6+json',
      exclude: params.excludeLicenses ? ['licenses'] : params.exclude,
    };

    const [sbom, duration] = await measureDuration(() =>
      generateSBOMLib(client, params.organizationId, params.projectId, options),
    );

    logOperationTiming(log, 'generate-sbom', duration);

    log.info('SBOM generated successfully', {
      format: options.format,
      duration,
    });

    // Send success toast
    await sendSuccessToast(
      ctx,
      toolCtx?.sessionID,
      'SBOM Generated',
      `Created ${options.format} SBOM in ${formatDuration(duration)}`,
    );

    return success(
      {
        sbom,
        format: options.format,
        organizationId: params.organizationId,
        projectId: params.projectId,
      },
      {
        duration,
        sessionID: toolCtx?.sessionID,
      },
    );
  } catch (error) {
    log.error('SBOM generation failed', {
      error: error instanceof Error ? error.message : String(error),
      organizationId: params.organizationId,
      projectId: params.projectId,
    });

    // Send error toast with guidance
    await sendErrorToast(
      ctx,
      toolCtx?.sessionID,
      'SBOM Generation Failed',
      'Check your SNYK_TOKEN and verify project exists. Use snyk_list_projects first.',
    );

    return failure(error instanceof Error ? error.message : 'Failed to generate SBOM', {
      code: 'SNYK_GENERATE_SBOM_ERROR',
      context: {
        organizationId: params.organizationId,
        projectId: params.projectId,
      },
    });
  }
};

export default generateSBOM;
