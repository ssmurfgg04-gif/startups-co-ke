import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE } from '@/config/site';

export async function GET(context: { site: URL }) {
  const posts = (await getCollection('news')).sort((a, b) => b.data.date.localeCompare(a.data.date));
  return rss({
    title: 'The Wire — startups.co.ke',
    description: 'Analysis on Kenya\u2019s startup ecosystem: funding, venture mechanics, talent and climate capital. (Sample publication)',
    site: context.site ?? SITE.url,
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.dek,
      pubDate: new Date(p.data.date),
      link: `/news/${p.slug}/`,
      categories: [p.data.category],
      author: p.data.author,
    })),
    customData: '<language>en-ke</language>',
  });
}
