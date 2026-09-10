// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://tuhr.es',
  integrations: [
    sitemap({
      lastmod: new Date(),
      priority: 0.7,
      changefreq: 'weekly',
      filter: (page) => {
        if (page.includes('/404')) return false;
        if (page.includes('/api/')) return false;
        return true;
      },
      serialize: (item) => {
        if (item.url === 'https://tuhr.es/') {
          item.priority = 1.0;
          item.changefreq = 'daily';
        }
        else if (item.url.includes('/calculadoras/')) {
          item.priority = 0.9;
          item.changefreq = 'monthly';
        }
        else if (item.url.includes('/plantillas/')) {
          item.priority = 0.8;
          item.changefreq = 'monthly';
        }
        else if (item.url.includes('/guias/')) {
          item.priority = 0.8;
          item.changefreq = 'monthly';
        }
        return item;
      }
    })
  ]
});
