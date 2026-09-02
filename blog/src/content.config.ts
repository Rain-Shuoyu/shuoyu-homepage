import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { postTypes } from './lib/post-types';

const paperSchema = z.object({
  title: z.string().trim().min(1).optional(),
  authors: z.array(z.string().trim().min(1)).optional(),
  venue: z.string().trim().min(1).optional(),
  year: z.number().int().optional(),
  url: z.string().url().optional(),
});

const linksSchema = z.object({
  paper: z.string().url().optional(),
  repo: z.string().url().optional(),
  demo: z.string().url().optional(),
});

const postSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  pubDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  type: z.enum(postTypes),
  tags: z.array(z.string().trim().min(1)).min(1),
  draft: z.boolean(),
  cover: z.string().trim().min(1).optional(),
  paper: paperSchema.optional(),
  links: linksSchema.optional(),
});

export const collections = {
  posts: defineCollection({
    loader: glob({
      pattern: '**/*.{md,mdx}',
      base: './src/content/posts',
    }),
    schema: postSchema,
  }),
};
