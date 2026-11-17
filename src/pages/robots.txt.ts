import type { APIRoute } from 'astro';
import { site } from '../../site.config.mjs';

// Generated rather than a static file so the sitemap URL always follows
// site.config.mjs — a copied robots.txt pointing at another domain's sitemap
// is exactly the kind of leftover this avoids.
export const GET: APIRoute = () =>
  new Response(
    [
      'User-agent: *',
      'Allow: /',
      'Disallow: /api/',
      'Disallow: /quote-admin/',
      '',
      `Sitemap: ${new URL('/sitemap-index.xml', site.url).href}`,
      '',
    ].join('\n'),
    { headers: { 'content-type': 'text/plain; charset=utf-8' } }
  );
