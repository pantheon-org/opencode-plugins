import { tool } from '@opencode-ai/plugin';

/**
 * Load Snyk Security Skill
 *
 * Loads the comprehensive Snyk security skill that teaches agents how to
 * effectively use all Snyk tools for security analysis, dependency management,
 * and SBOM generation.
 *
 * This skill includes:
 * - Detailed documentation for all 6 Snyk tools
 * - Complete workflow examples
 * - Best practices and common patterns
 * - Troubleshooting guides
 * - Integration patterns for CI/CD
 */
export default tool({
  description:
    'Load comprehensive Snyk security skill with tool usage guides, workflows, best practices, and integration patterns for security analysis and SBOM generation',
  args: {},
  execute: async () => {
    const loadSkill = async (): Promise<string> => {
      // Read the SKILL.md file using Bun API
      const skillPath = new URL('../skills/snyk-security/SKILL.md', import.meta.url);
      const content = await Bun.file(skillPath).text();
      return content;
    };

    try {
      const content = await loadSkill();
      return `Snyk Security Skill loaded successfully.\n\n${content}`;
    } catch (error) {
      return `Error loading skill: ${error instanceof Error ? error.message : String(error)}`;
    }
  },
});
