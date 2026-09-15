import { Injectable } from '@nestjs/common';
import { db } from '../prisma/db';

function xmlEscape(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function siteOrigin() {
  return (process.env.FRONTEND_ORIGIN ?? 'https://grozzapchasti.ru').replace(
    /\/$/,
    '',
  );
}

function absoluteUrl(origin: string, path: string) {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return `${origin}${path.startsWith('/') ? path : `/${path}`}`;
}

function lastmod(value: string | Date | null | undefined) {
  if (!value) {
    return undefined;
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }
  return date.toISOString().slice(0, 10);
}

function urlEntry(options: {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
  images?: string[];
}) {
  const images = (options.images ?? [])
    .map(
      (src) =>
        `    <image:image>\n      <image:loc>${xmlEscape(src)}</image:loc>\n    </image:image>`,
    )
    .join('\n');
  const lastmodTag = options.lastmod
    ? `\n    <lastmod>${options.lastmod}</lastmod>`
    : '';
  const changefreqTag = options.changefreq
    ? `\n    <changefreq>${options.changefreq}</changefreq>`
    : '';
  const priorityTag = options.priority
    ? `\n    <priority>${options.priority}</priority>`
    : '';
  const imagesBlock = images ? `\n${images}` : '';
  return `  <url>\n    <loc>${xmlEscape(options.loc)}</loc>${lastmodTag}${changefreqTag}${priorityTag}${imagesBlock}\n  </url>`;
}

@Injectable()
export class SeoService {
  async buildSitemap() {
    const origin = siteOrigin();
    const parts = await db.orm.public.SparePart.orderBy((part) =>
      part.name.asc(),
    ).all();

    const urls = [
      urlEntry({
        loc: `${origin}/`,
        changefreq: 'weekly',
        priority: '1.0',
      }),
      urlEntry({
        loc: `${origin}/contacts`,
        changefreq: 'monthly',
        priority: '0.6',
      }),
      ...parts.map((part) =>
        urlEntry({
          loc: `${origin}/parts/${part.id}`,
          lastmod: lastmod(part.updatedAt),
          changefreq: 'weekly',
          priority: '0.8',
          images: part.images.map((image) => absoluteUrl(origin, image)),
        }),
      ),
    ];

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.join('\n')}
</urlset>
`;
  }
}
