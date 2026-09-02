import type { CollectionEntry, CollectionKey } from 'astro:content';
import type { BlogPost, PostData } from './post-types';

export type AstroBlogPost = CollectionEntry<Extract<'posts', CollectionKey>>;

/**
 * The smallest shape needed by the archive helpers. Keeping this structural
 * lets callers pass Astro collection entries without narrowing them to a
 * hand-written BlogPost type first.
 */
export type ContentPost = {
  id: string;
  data: Pick<PostData, 'pubDate' | 'tags' | 'draft'>;
} | AstroBlogPost;

export type TagSummary = {
  slug: string;
  label: string;
  count: number;
};

export type YearGroup<T extends ContentPost = BlogPost> = {
  year: number;
  posts: T[];
};

export const normalizeTag = (tag: string): string => tag.trim().toLowerCase();

export const publishedPosts = <T extends ContentPost>(posts: readonly T[]): T[] =>
  [...posts]
    .filter((post) => !post.data.draft)
    .sort((left, right) => {
      const dateDifference = right.data.pubDate.getTime() - left.data.pubDate.getTime();
      return dateDifference || left.id.localeCompare(right.id, 'en');
    });

export const postPath = <T extends Pick<BlogPost, 'id'>>({ id }: T): string =>
  '/posts/' + encodeURIComponent(id);

export const tagPath = (tag: string) =>
  '/tags/' + encodeURIComponent(normalizeTag(tag));

export const groupPostsByYear = <T extends ContentPost>(
  posts: readonly T[],
): YearGroup<T>[] => {
  const groups = new Map<number, T[]>();

  for (const post of publishedPosts(posts)) {
    const year = post.data.pubDate.getUTCFullYear();
    const group = groups.get(year) ?? [];
    group.push(post);
    groups.set(year, group);
  }

  return [...groups.entries()]
    .sort(([left], [right]) => right - left)
    .map(([year, groupedPosts]) => ({ year, posts: groupedPosts }));
};

export const getTagIndex = <T extends ContentPost>(posts: readonly T[]): TagSummary[] => {
  const entries = new Map<string, TagSummary>();

  for (const post of publishedPosts(posts)) {
    const seenInPost = new Set<string>();

    for (const rawTag of post.data.tags) {
      const label = rawTag.trim();
      const slug = normalizeTag(label);

      if (!slug || seenInPost.has(slug)) {
        continue;
      }

      seenInPost.add(slug);
      const existing = entries.get(slug);

      if (existing) {
        existing.count += 1;
      } else {
        entries.set(slug, { slug, label, count: 1 });
      }
    }
  }

  return [...entries.values()].sort((left, right) =>
    left.label.localeCompare(right.label, 'en'),
  );
};

export const postsForTag = <T extends ContentPost>(posts: readonly T[], tag: string): T[] => {
  const slug = normalizeTag(tag);

  if (!slug) {
    return [];
  }

  return publishedPosts(posts).filter((post) =>
    post.data.tags.some((postTag) => normalizeTag(postTag) === slug),
  );
};
