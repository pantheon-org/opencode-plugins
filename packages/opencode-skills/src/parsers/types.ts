/**
 * Markdown Parser Type Definitions
 *
 * Type definitions for skill markdown parsing.
 */

import type { SkillMetadata } from '../types';

/**
 * Parsed skill structure with frontmatter and sections separated
 */
export interface ParsedSkill {
  frontmatter: SkillFrontmatter;
  sections: SkillSections;
}

/**
 * Skill YAML frontmatter
 */
export interface SkillFrontmatter {
  name: string;
  description: string;
  license?: string;
  compatibility?: string;
  metadata?: SkillMetadata;
}

/**
 * Skill markdown sections
 */
export interface SkillSections {
  whatIDo: string;
  whenToUseMe: string;
  instructions: string;
  checklist: string[];
}
