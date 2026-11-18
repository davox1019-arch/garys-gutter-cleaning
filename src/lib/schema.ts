import { site, schemaPriceRange } from '../../site.config.mjs';
import { suburbPages } from '../data/suburbPages';

export interface Crumb {
  name: string;
  /** Site-relative path with leading and trailing slash, e.g. "/service-areas/". */
  href: string;
}

export interface FaqItem {
  q: string;
  /** Plain text. Rendered as-is on the page and copied verbatim into the schema,
   *  so the structured data can never say something the page does not show. */
  a: string;
}

export const abs = (path: string) => new URL(path, site.url).href;

export const businessId = abs('/#business');

/**
 * The business, described only with facts that are true and supplied.
 * There is deliberately no street address and no opening hours: none have been
 * given, and inventing them would be a false local-presence claim.
 */
export function businessSchema() {
  return {
    '@context': 'https://schema.org',
    // A LocalBusiness subtype for trades that work on homes.
    '@type': 'HomeAndConstructionBusiness',
    '@id': businessId,
    name: site.name,
    url: abs('/'),
    logo: abs('/logo-720.webp'),
    image: abs('/og-image.png'),
    serviceType: ['Gutter cleaning', 'Downpipe clearing', 'Gutter guard installation'],
    description:
      'Gutter cleaning, downpipe clearing and gutter guard for homes across the Perth metropolitan area, priced from satellite imagery of the property.',
    // Perth, then every suburb with a page.
    areaServed: [
      { '@type': 'City', name: 'Perth', containedInPlace: { '@type': 'State', name: site.stateName } },
      ...suburbPages.map((s) => s.name).sort().map((name) => ({
        '@type': 'Place',
        name: `${name}, ${site.state}`,
      })),
    ],
    priceRange: schemaPriceRange,
    ...(site.phone ? { telephone: '+61' + site.phone.replace(/\D/g, '').replace(/^0/, '') } : {}),
    ...(site.email ? { email: site.email } : {}),
  };
}

export function breadcrumbSchema(crumbs: Crumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: abs(c.href),
    })),
  };
}

export function faqSchema(items: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

export function serviceSchema(opts: {
  name: string;
  description: string;
  path: string;
  areaName?: string;
  postcode?: string;
  /** Add the gutter cleaning price tiers from site.config.mjs as offers. */
  offers?: boolean;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: opts.name,
    serviceType: opts.name,
    description: opts.description,
    url: abs(opts.path),
    provider: { '@id': businessId },
    areaServed: opts.areaName
      ? {
          '@type': 'Place',
          name: `${opts.areaName}, ${site.state}`,
          address: {
            '@type': 'PostalAddress',
            addressLocality: opts.areaName,
            addressRegion: site.state,
            addressCountry: 'AU',
            ...(opts.postcode ? { postalCode: opts.postcode } : {}),
          },
        }
      : { '@type': 'City', name: 'Perth' },
    ...(opts.offers
      ? {
          // Each tier is a "from" price, so it is a minimum, not a fixed price.
          offers: site.pricing.tiers.map((t) => ({
            '@type': 'Offer',
            name: `${t.label} Gutter Cleaning`,
            priceCurrency: 'AUD',
            priceSpecification: {
              '@type': 'PriceSpecification',
              minPrice: String(t.from),
              priceCurrency: 'AUD',
            },
          })),
        }
      : {}),
  };
}

/** Homepage only: tells Google the site's name for the search result. */
export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': abs('/#website'),
    name: site.name,
    url: abs('/'),
    publisher: { '@id': businessId },
    inLanguage: 'en-AU',
  };
}
