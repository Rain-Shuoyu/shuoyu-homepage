import { describe, expect, it } from 'vitest';
import { site } from '../src/data/site';
import { OTHERS_LIMIT, otherProjects, researchProjects } from '../src/data/projects';

const isExternalUrl = (value: string) => /^https:\/\//.test(value);

describe('homepage content', () => {
  it('contains the approved identity and contact data', () => {
    expect(site.name).toBe('Shuoyu Chen');
    expect(site.affiliation).toContain('Sun Yat-sen University');
    expect(site.expectedGraduation).toBe('2028');
    expect(site.github).toBe('https://github.com/Rain-Shuoyu');
    expect(site.email).toBe('shuoyu_chen@qq.com');
    expect(isExternalUrl(site.github)).toBe(true);
  });

  it('keeps the approved research order', () => {
    expect(researchProjects.map((project) => project.name)).toEqual([
      'OmniDexGrasp',
      'BiDexGrasp',
      'DynamicManip',
    ]);
  });

  it('uses Others as the public name for side projects', () => {
    expect(site.navigation.map((item) => item.label)).toEqual(['About', 'Research', 'Others']);
    expect(otherProjects.every((project) => project.section === 'others')).toBe(true);
  });

  it('keeps the approved research submission statuses', () => {
    const bySlug = Object.fromEntries(researchProjects.map((project) => [project.slug, project]));

    expect(bySlug.bidexgrasp.meta).toBe('CoRL 2026 · Under Review');
    expect(bySlug.dynamicmanip.meta).toBe('NeurIPS 2026 · Under Review');
  });

  it('includes the approved contribution summary for each research project', () => {
    const contributions = Object.fromEntries(
      researchProjects.map((project) => [project.slug, project.detail?.contribution]),
    );

    expect(contributions.omnidexgrasp).toBe(
      'I contributed to implementing parts of the tooling, evaluating model performance, and filming the project videos.',
    );
    expect(contributions.bidexgrasp).toBe(
      'I handled real-robot deployment and experimental evaluation.',
    );
    expect(contributions.dynamicmanip).toBe(
      'I worked on simulation setup, model training, and model performance evaluation.',
    );
  });

  it('keeps the approved Others order and slugs', () => {
    expect(otherProjects.map((project) => project.name)).toEqual([
      'DeepSneak',
      'TruthForge',
      'PolyGo',
    ]);
    expect(otherProjects.map((project) => project.slug)).toEqual([
      'deep-sneak',
      'truth-forge',
      'polygo',
    ]);
  });

  /* OthersList slices to a limit, so a project added beyond it would be
     silently unreachable — /others/<slug> is only generated for entries
     that have an intro, and the list only links inward for those. */
  it('renders every Others project it defines', () => {
    expect(otherProjects.length).toBeLessThanOrEqual(OTHERS_LIMIT);
  });

  it('gives every Others project a reachable page', () => {
    for (const project of otherProjects) {
      expect(project.detail?.intro?.length ?? 0).toBeGreaterThan(0);
    }
  });

  it('has complete project records and external links', () => {
    const allProjects = [...researchProjects, ...otherProjects];
    const slugs = allProjects.map((project) => project.slug);

    expect(new Set(slugs).size).toBe(slugs.length);
    for (const project of allProjects) {
      expect(project.slug.length).toBeGreaterThan(0);
      expect(project.name.length).toBeGreaterThan(0);
      expect(project.meta.length).toBeGreaterThan(0);
      expect(project.description.length).toBeGreaterThan(0);
      expect(project.tags.length).toBeGreaterThan(0);
      for (const tag of project.tags) {
        expect(tag.length).toBeGreaterThan(0);
      }
      expect(isExternalUrl(project.href)).toBe(true);
    }
  });
});
