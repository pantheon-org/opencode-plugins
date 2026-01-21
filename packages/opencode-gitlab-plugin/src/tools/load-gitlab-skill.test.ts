import { describe, expect, it } from 'bun:test';

import loadGitlabSkill from './load-gitlab-skill';

describe('loadGitlabSkill', () => {
  it('should load the GitLab skill content', async () => {
    const result = await loadGitlabSkill.execute({}, {} as any);

    expect(result).toContain('GitLab Integration Skill loaded successfully');
    expect(result).toContain('## What I do');
    expect(result).toContain('## When to use me');
    expect(result).toContain('## Workflow Overview');
  });

  it('should include tool documentation', async () => {
    const result = await loadGitlabSkill.execute({}, {} as any);

    expect(result).toContain('gitlab-list-repos');
    expect(result).toContain('gitlab-list-merge-requests');
    expect(result).toContain('gitlab-list-todos');
    expect(result).toContain('gitlab-get-todo');
    expect(result).toContain('gitlab-mark-todo-done');
    expect(result).toContain('gitlab-mark-all-todos-done');
  });

  it('should include workflow patterns', async () => {
    const result = await loadGitlabSkill.execute({}, {} as any);

    expect(result).toContain('Repository Discovery');
    expect(result).toContain('Merge Request Management');
    expect(result).toContain('TODO Management');
  });

  it('should include authentication guidance', async () => {
    const result = await loadGitlabSkill.execute({}, {} as any);

    expect(result).toContain('## Authentication');
    expect(result).toContain('GITLAB_TOKEN');
    expect(result).toContain('GITLAB_API_URL');
  });

  it('should include filter documentation', async () => {
    const result = await loadGitlabSkill.execute({}, {} as any);

    expect(result).toContain('## Key Filters');
    expect(result).toContain('opened');
    expect(result).toContain('pending');
    expect(result).toContain('approval_required');
  });
});
