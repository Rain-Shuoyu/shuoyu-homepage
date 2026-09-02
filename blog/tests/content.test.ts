import { describe, expect, it } from 'vitest';
import type { BlogPost } from '../src/lib/post-types';
import {
  getTagIndex,
  postPath,
  postsForTag,
  publishedPosts,
  tagPath,
} from '../src/lib/content';

const makePost = (
  id: string,
  date: string,
  tags: string[],
  draft = false,
  type: BlogPost['data']['type'] = 'learning',
): BlogPost => ({
  id,
  data: {
    title: id,
    description: id + ' description',
    pubDate: new Date(date),
    type,
    tags,
    draft,
  },
});

describe('blog content helpers', () => {
  const posts = [
    makePost('newest', '2026-05-02', ['Robotics', 'Learning']),
    makePost('older', '2025-12-20', ['Robotics']),
    makePost('draft-note', '2026-06-01', ['Robotics'], true),
    makePost('same-day-b', '2026-05-02', ['Learning']),
    makePost('same-day-a', '2026-05-02', ['Learning']),
  ];

  it('excludes drafts and sorts newest first with a stable tie-breaker', () => {
    expect(publishedPosts(posts).map((post) => post.id)).toEqual([
      'newest',
      'same-day-a',
      'same-day-b',
      'older',
    ]);
  });

  it('builds deterministic tag summaries and filters by normalized tag', () => {
    expect(getTagIndex(posts)).toEqual([
      { slug: 'learning', label: 'Learning', count: 3 },
      { slug: 'robotics', label: 'Robotics', count: 2 },
    ]);
    expect(postsForTag(posts, 'robotics').map((post) => post.id)).toEqual([
      'newest',
      'older',
    ]);
  });

  it('trims tag labels and counts each published post once per normalized tag', () => {
    const taggedPosts = [
      makePost('newer', '2026-06-01', ['  Robotics  ', 'ROBOTICS', ' Writing ']),
      makePost('older', '2026-05-01', [' robotics ']),
      makePost('draft', '2026-04-01', ['Writing'], true),
    ];

    expect(getTagIndex(taggedPosts)).toEqual([
      { slug: 'robotics', label: 'Robotics', count: 2 },
      { slug: 'writing', label: 'Writing', count: 1 },
    ]);
    expect(postsForTag(taggedPosts, ' ROBOTICS ').map((post) => post.id)).toEqual([
      'newer',
      'older',
    ]);
  });

  it('creates stable post and tag URLs', () => {
    const post = makePost('behavior-skill', '2026-08-29', ['Paper Notes']);
    expect(postPath({ id: post.id })).toBe('/posts/behavior-skill');
    expect(tagPath('Paper Notes')).toBe('/tags/paper%20notes');
  });
});
