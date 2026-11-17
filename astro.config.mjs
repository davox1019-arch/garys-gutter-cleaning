import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { site } from './site.config.mjs';

export default defineConfig({
  output: 'static',
  site: site.url,
  trailingSlash: 'always',
  integrations: [
    // The admin page lists customer details — never in the sitemap.
    sitemap({
      filter: (page) => !/\/(quote-admin|404)\/?$/.test(page),
      lastmod: new Date(),
      serialize(item) {
        // Homepage and money pages first for crawlers.
        const path = new URL(item.url).pathname;
        item.priority = path === '/' ? 1.0 : /^\/gutter-cleaning-/.test(path) ? 0.9 : path === '/privacy/' ? 0.2 : 0.8;
        item.changefreq = path === '/privacy/' ? 'yearly' : 'monthly';
        return item;
      },
    }),
  ],
});
