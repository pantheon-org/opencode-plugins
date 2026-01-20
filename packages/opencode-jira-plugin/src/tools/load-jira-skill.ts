/**
 * Load JIRA Integration Skill
 * Provides the agent with knowledge about how to use JIRA tools effectively
 */

import { tool } from '@opencode-ai/plugin';
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Load the JIRA integration skill documentation
 */
export const loadJiraSkill = tool({
  description: `Load comprehensive JIRA integration skill documentation that teaches how to effectively use JIRA tools.
  
This skill provides:
- JQL query patterns and examples
- Workflow guidance for common JIRA tasks
- Tool selection and usage best practices
- Authentication and error handling
- Response formatting guidelines

Use this when the user asks about JIRA operations or you need guidance on using JIRA tools.`,
  args: {},
  async execute() {
    try {
      const skillPath = join(__dirname, '../skills/jira-integration/SKILL.md');
      const content = await readFile(skillPath, 'utf-8');
      return content;
    } catch (error) {
      return `Error loading JIRA skill: ${error instanceof Error ? error.message : String(error)}`;
    }
  },
});

export default loadJiraSkill;
