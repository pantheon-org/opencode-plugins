import { tool } from '@opencode-ai/plugin';

/**
 * Load GitLab Integration Skill
 *
 * Loads the comprehensive GitLab integration skill that teaches agents how to
 * effectively use all GitLab tools for repository management, merge request
 * handling, and TODO management.
 *
 * This skill includes:
 * - Detailed documentation for all 6 GitLab tools
 * - Complete workflow examples
 * - Best practices and common patterns
 * - Troubleshooting guides
 * - Integration patterns for team workflows
 */
export default tool({
  description:
    'Load comprehensive GitLab integration skill with tool usage guides, workflows, best practices, and integration patterns for repository, merge request, and TODO management',
  args: {},
  execute: async () => {
    const loadSkill = async (): Promise<string> => {
      // Read the SKILL.md file using Bun API
      const skillPath = new URL('../skills/gitlab-integration/SKILL.md', import.meta.url);
      const content = await Bun.file(skillPath).text();
      return content;
    };

    try {
      const content = await loadSkill();
      return `GitLab Integration Skill loaded successfully.\n\n${content}`;
    } catch (error) {
      return `Error loading skill: ${error instanceof Error ? error.message : String(error)}`;
    }
  },
});
