import { describe, expect, it } from 'vitest';
import { site } from '../src/data/site';
import { labProjects, researchProjects } from '../src/data/projects';

const isExternalUrl = (value: string) => /^https:\/\//.test(value);

describe('homepage content', () => {
  it('contains the approved identity and contact data', () => {
    expect(site.name).toBe('Shuoyu Chen');
    expect(site.affiliation).toContain('Sun Yat-sen University');
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

  it('keeps the approved lab order and slugs', () => {
    expect(labProjects.map((project) => project.name)).toEqual([
      'DeepSneak',
      'TruthForge',
      'PolyGo',
      'AfterGlow',
      'NeuralBlock',
    ]);
    expect(labProjects.map((project) => project.slug)).toEqual([
      'deep-sneak',
      'truth-forge',
      'polygo',
      'afterglow',
      'neuralblock',
    ]);
  });

  it('has complete project records and external links', () => {
    const allProjects = [...researchProjects, ...labProjects];
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
