import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const news = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/news' }),
  schema: z.object({
    title: z.string(),
    category: z.string(),
    dek: z.string(),
    mins: z.number(),
    date: z.string(), // ISO
    author: z.string().default('startups.co.ke desk'),
    imageSeed: z.string(),
    featured: z.boolean().default(false),
    sources: z.array(z.object({ label: z.string(), url: z.string() })).default([]),
  }),
});

export const collections = { news };
