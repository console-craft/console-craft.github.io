import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
	loader: glob({ base: './src/content/blog', pattern: '**/*.md' }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		pubDate: z.coerce.date().optional(),
		updatedDate: z.coerce.date().optional(),
		draft: z.boolean().default(false),
		upcoming: z.boolean().default(false),
		series: z.object({
			title: z.string(),
			order: z.number().int().positive(),
		}).optional(),
	}).superRefine((article, context) => {
		if (!article.upcoming && !article.draft && !article.pubDate) {
			context.addIssue({
				code: 'custom',
				message: 'Published articles require a publication date.',
				path: ['pubDate'],
			});
		}

		if (article.upcoming && !article.series) {
			context.addIssue({
				code: 'custom',
				message: 'Upcoming articles must belong to a series.',
				path: ['series'],
			});
		}
	}),
});

export const collections = { blog };
