import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import { postTypes } from './lib/post-types';

const paperSchema = z.object({
  title: z.string().trim().min(1).optional(),
  authors: z.array(z.string().trim().min(1)).optional(),
  venue: z.string().trim().min(1).optional(),
  year: z.number().int().min(1900).max(2100).optional(),
  url: z.url().optional(),
});

const linksSchema = z.object({
  paper: z.url().optional(),
  repo: z.url().optional(),
  demo: z.url().optional(),
});

const translationSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
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
  translations: z.object({ zh: translationSchema.optional() }).optional(),
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
