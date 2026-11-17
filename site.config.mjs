/**
 * Single source of truth for everything about the business.
 *
 * Imported by astro.config.mjs, every page, and the Worker — change a value
 * here and it changes everywhere. Anything marked TODO is a real business
 * detail that has not been supplied yet: leave it empty rather than guess.
 * Empty values are simply not rendered (no phone link, no ABN line, no review
 * section), so the site is safe to ship before they are filled in.
 */
export const site = {
  name: "Gary's Gutter Cleaning",
  shortName: "Gary's",

  // TODO: confirm the registered domain. Used for canonicals, the sitemap,
  // robots.txt and every schema URL — nothing else hard-codes it.
  url: 'https://garysguttercleaning.com.au',

  city: 'Perth',
  state: 'WA',
  stateName: 'Western Australia',

  // WA does not observe daylight saving: Perth is UTC+8 all year. Every time
  // shown to a customer or the operator is formatted in this zone, never the
  // viewer's own, so quoting from the eastern states stays unambiguous.
  timeZone: 'Australia/Perth',

  // TODO: confirm the hours quotes are actually answered (Perth time, 24h).
  // Only used to tell an after-hours visitor their price will land in the morning.
  quoteHours: { open: 7, close: 18 },

  phone: '',      // TODO: mobile for the Call/Text buttons, e.g. '0400 000 000' — they stay hidden while this is empty
  email: '',      // TODO: public contact email — leave empty to show none
  abn: '',        // TODO
  legalName: '',  // TODO: the entity behind the trading name, for the privacy page

  // Same tiers and "From" prices as the Melbourne site, by the owner's
  // decision (November 2026). Every price on the site — cards, tables,
  // badges, titles, FAQ answers and schema — is built from this list.
  pricing: {
    tiers: [
      { icon: '🏡', label: 'Single Storey Unit', short: 'Units', from: 199, note: 'Unit or small townhouse, one level.' },
      { icon: '🏠', label: 'Single Storey House', short: 'Houses', from: 249, note: 'Standard single storey home. Full clean, downpipe check & flush.', featured: true },
      { icon: '🏘️', label: 'Double Storey Townhouse', short: 'Double storey townhouses', from: 299, note: 'Two-level townhouse. All gutters and downpipes cleared.' },
      { icon: '🏢', label: 'Full Double Storey', short: 'Double storey', from: 349, note: 'Full two-storey home. Same complete service top to bottom.' },
    ],
    // Downpipe clearing on its own (it is checked as part of every gutter clean).
    downpipeFrom: 89,
  },

  // Real reviews only. Leave empty and the reviews section does not render.
  // { name: 'First name', suburb: 'Kalamunda', text: '…', date: '2026-11' }
  reviews: [],

  gaMeasurementId: '', // TODO: GA4 id, e.g. 'G-XXXXXXXXXX'
};

/**
 * Page titles: keyword first, brand only when it still fits in 60 characters
 * (Google cuts longer titles off; the brand shows separately as the site name).
 */
export const seoTitle = (main) => {
  const full = `${main} | ${site.name}`;
  return full.length <= 60 ? full : main;
};

const tiers = site.pricing.tiers;
const byLabel = (l) => tiers.find((t) => t.label === l).from;

/** The lowest price on the site: "From $199". */
export const fromPrice = Math.min(...tiers.map((t) => t.from));
export const priceRange = `From $${fromPrice}`;
/** For schema.org's priceRange field. */
export const schemaPriceRange = `$${fromPrice}–$${Math.max(...tiers.map((t) => t.from))}+`;

/** The Melbourne-format hero badge: "🏠 Units from $199 · Houses from $249 · Double storey from $349". */
export const priceBadge =
  `🏠 Units from $${byLabel('Single Storey Unit')} · Houses from $${byLabel('Single Storey House')} · Double storey from $${byLabel('Full Double Storey')}`;

/** For prose: "from $199 for a single storey unit, $249 for a single storey house, …". */
export const priceSentence =
  'from ' +
  tiers
    .map((t, i) => `${i === tiers.length - 1 ? 'and ' : ''}$${t.from} for a ${t.label.toLowerCase()}${t.label === 'Full Double Storey' ? ' home' : ''}`)
    .join(', ')
    .replace(', and', ' and');
