/**
 * Every suburb page on the site, one per Perth suburb, at
 * /gutter-cleaning-{slug}/.
 *
 * Two kinds of entry, merged here so the rest of the site sees one list:
 *
 *  1. The 14 hand-written suburbs (suburbs.ts + suburbLocal.ts), researched
 *     one by one. Their local note and FAQs are used as written.
 *  2. Every other Perth suburb, from perth-suburbs.json, which
 *     scripts/suburbs/build.py builds from ABS boundaries, the 2021 Census and
 *     OpenStreetMap. Their local note and two FAQs are written below from
 *     those facts only: homes and housing mix, coastline, rivers, lakes,
 *     parks and bushland, and the council's fire notice where it has been
 *     read. Nothing here invents a local detail. If the data has nothing to
 *     say about a suburb, the copy falls back to its housing mix.
 *
 * Neighbours come from the boundary data for every suburb, so each page can
 * link to the pages for the suburbs around it.
 */
import data from './perth-suburbs.json';
import { suburbs as handWritten } from './suburbs';
import { suburbLocal } from './suburbLocal';
import { councils, type Council } from './councils';
import type { FaqItem } from '../lib/schema';
import { site } from '../../site.config.mjs';

interface Raw {
  slug: string;
  name: string;
  postcode: string;
  sal: string;
  council: string;
  councilName: string;
  region: Region;
  homes: number;
  housesPct: number;
  townhousesPct: number;
  flatsPct: number;
  areaKm2: number;
  coast: { onCoast: boolean; coastKm: number; kmToCoast: number };
  rivers: string[];
  lakes: { name: string; ha: number; insideHa: number }[];
  parks: { name: string; ha: number; insideHa: number; bush: boolean }[];
  neighbours: string[];
  /** Closest suburbs with a page, edge to edge, bordering or not. */
  closest: string[];
}

export type Region = 'hills' | 'north' | 'east' | 'inner' | 'western' | 'southeast' | 'south';

export const regions: { key: Region; title: string; across: string; blurb: string }[] = [
  { key: 'hills', title: 'Perth Hills', across: 'the Perth Hills',
    blurb: 'Jarrah and marri forest on the Darling Scarp, large blocks, and council fire notices that name gutters.' },
  { key: 'north', title: 'Northern Suburbs', across: "Perth's northern suburbs",
    blurb: 'From the coast at Scarborough and Hillarys out to Wanneroo, Ellenbrook-side estates and Yanchep.' },
  { key: 'east', title: 'Eastern Suburbs', across: "Perth's eastern suburbs",
    blurb: 'Along the Swan and Helena rivers, the Swan Valley and the foot of the scarp.' },
  { key: 'inner', title: 'Inner City', across: "Perth's inner suburbs",
    blurb: 'Older homes, apartments and big street trees close to the city and the river.' },
  { key: 'western', title: 'Western Suburbs', across: "Perth's western suburbs",
    blurb: 'Between the river and the ocean, with Kings Park, Bold Park and mature gardens.' },
  { key: 'southeast', title: 'South-Eastern Suburbs', across: "Perth's south-eastern suburbs",
    blurb: 'From the Canning River out to Armadale, Byford and the foot of the hills.' },
  { key: 'south', title: 'Southern Suburbs', across: "Perth's southern suburbs",
    blurb: 'Fremantle, Melville and Cockburn down the coast to Rockingham and Secret Harbour.' },
];
export const regionOf = Object.fromEntries(regions.map((r) => [r.key, r])) as Record<Region, (typeof regions)[number]>;

export interface SuburbPage {
  slug: string;
  name: string;
  postcode: string;
  council: Council;
  region: Region;
  /** Two sentences for the "what's included" intro. */
  intro: string;
  /** Two quick emoji points for the "local homes" list. */
  points: [string, string];
  /** This suburb's own two FAQs. */
  faqs: FaqItem[];
  /** Up to three nearby suburb names, for the footer line and the meta description. */
  nearby: string[];
  /** Bordering suburbs that have a page, longest shared edge first, topped up
   *  with the closest suburbs where fewer than four border it. */
  links: { slug: string; name: string }[];
}

const raw = data as Raw[];
const tiers = site.pricing.tiers;

// ── Small helpers ────────────────────────────────────────────────────────────
const about = (n: number) => {
  const r = n < 1000 ? Math.round(n / 10) * 10 : Math.round(n / 100) * 100;
  return r.toLocaleString('en-AU');
};
const km = (n: number) => (n < 1 ? `${Math.round(n * 1000 / 50) * 50} m` : `${Math.round(n * 10) / 10} km`);
const andList = (xs: string[]) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);
const the = (river: string) => `the ${river}`;
const unitsPct = (r: Raw) => r.townhousesPct + r.flatsPct;

function housing(r: Raw) {
  const n = `${about(r.homes)} or so homes`;
  if (r.housesPct >= 90) return `Nearly all of its ${n} are separate houses.`;
  if (r.flatsPct >= 40) return `Of its ${n}, ${r.flatsPct}% are flats and apartments.`;
  if (unitsPct(r) >= 30) return `Its ${n} are a mix of houses (${r.housesPct}%), townhouses and villas (${r.townhousesPct}%) and apartments (${r.flatsPct}%).`;
  return `Of its ${n}, ${r.housesPct}% are separate houses.`;
}

/** The suburb's strongest natural feature, for the opening sentence. */
function feature(r: Raw): { opener: string; kind: 'coast' | 'river' | 'lake' | 'bush' | 'park' | 'nearcoast' | 'none' } {
  const n = r.name;
  if (r.coast.onCoast) {
    return { kind: 'coast', opener: r.coast.coastKm >= 0.5 ? `${n} has about ${km(r.coast.coastKm)} of coastline` : `${n} runs down to the ocean` };
  }
  if (r.rivers.length) return { kind: 'river', opener: `${n} runs along ${andList(r.rivers.map(the))}` };
  const lake = r.lakes[0];
  const park = r.parks[0];
  if (lake && lake.ha >= 20) {
    return { kind: 'lake', opener: lake.insideHa >= lake.ha * 0.5 ? `${n} has ${lake.name} inside its boundary` : `${n} sits beside ${lake.name}` };
  }
  if (park) {
    const opener = park.insideHa >= park.ha * 0.6
      ? `${n} has ${park.name}, about ${park.ha} hectares, inside its boundary`
      : park.insideHa >= 5
        ? `${n} takes in about ${park.insideHa} hectares of ${park.name}`
        : `${n} borders ${park.name}`;
    return { kind: park.bush ? 'bush' : 'park', opener };
  }
  if (r.coast.kmToCoast <= 3) return { kind: 'nearcoast', opener: `${n} is about ${km(r.coast.kmToCoast)} from the ocean, in the ${councilFull(r)}` };
  return { kind: 'none', opener: r.coast.kmToCoast > 12 ? `${n} is about ${Math.round(r.coast.kmToCoast)} km inland, in the ${councilFull(r)}` : `${n} is in the ${councilFull(r)}` };
}

const councilFull = (r: Raw) => councils[r.council]?.name ?? r.councilName;

function second(r: Raw, kind: string) {
  if (kind === 'coast') return 'Salt air and wind-blown sand end up in the gutters here along with the leaf.';
  if (kind === 'nearcoast') return 'Sea breezes carry salt and fine sand this far in, and it collects in gutters with the leaf.';
  if (r.region === 'hills') return 'Up on the scarp, gum leaf, bark and nuts fill gutters faster than on the plain.';
  if (kind === 'river') return 'If your roof sits under the big trees near the river, expect more leaf in the gutters than streets further back.';
  if (kind === 'bush' || kind === 'lake') return 'Homes nearest the bush and wetland get the most leaf and bark in their gutters.';
  if (r.flatsPct >= 40 || unitsPct(r) >= 35) return `Units and townhouses start from $${tiers[0].from}, and every downpipe is checked on the same visit.`;
  return 'How fast your gutters fill comes down mostly to the trees over and around your roof.';
}

function points(r: Raw): [string, string] {
  const out: string[] = [];
  const c = r.coast;
  if (c.onCoast && c.coastKm >= 0.5) out.push(`🌊 About ${km(c.coastKm)} of coastline, so salt and sand settle in gutters`);
  else if (c.onCoast) out.push('🌊 Right on the coast, so salt and sand settle in gutters');
  else if (c.kmToCoast <= 3) out.push(`🌬️ About ${km(c.kmToCoast)} from the ocean, close enough for salt air`);
  if (r.rivers.length) out.push(`🏞️ Runs along ${andList(r.rivers.map(the))}`);
  for (const l of r.lakes.slice(0, 1)) {
    out.push(`💧 ${l.name} (${l.ha} ha) ${l.insideHa >= l.ha * 0.5 ? 'inside the suburb' : 'on the edge of the suburb'}`);
  }
  const lakeNames = r.lakes.slice(0, 1).map((l) => l.name);
  for (const p of r.parks.filter((p) => !lakeNames.some((l) => p.name.startsWith(l))).slice(0, 2)) {
    const where = p.insideHa >= p.ha * 0.6 ? `(${p.ha} ha) inside the suburb`
      : p.insideHa >= 5 ? `, about ${p.insideHa} ha of it inside the suburb`
      : `(${p.ha} ha) right next door`;
    out.push(`🌳 ${p.name}${where.startsWith(',') ? where : ' ' + where}`);
  }
  if (r.flatsPct >= 30) out.push(`🏢 ${r.flatsPct}% of homes are flats and apartments`);
  else if (r.townhousesPct >= 20) out.push(`🏘️ ${r.townhousesPct}% of homes are townhouses and villas, from $${tiers[0].from}`);
  out.push(`🏠 About ${about(r.homes)} homes, ${r.housesPct}% separate houses`);
  if (r.coast.kmToCoast > 12) out.push(`📍 About ${Math.round(r.coast.kmToCoast)} km inland, in the ${councilFull(r)}`);
  const uniq = [...new Set(out)];
  return [uniq[0], uniq[1]];
}

function faqs(r: Raw, council: Council): FaqItem[] {
  const n = r.name;
  const all: (FaqItem | null)[] = [
    council.gutterQuote
      ? {
          q: `When do gutters need to be clear in ${n}?`,
          a: `${n} is covered by the ${council.name} ${council.noticeName}, which says: "${council.gutterQuote}" It applies to ${council.appliesTo}. Gutters need to be clear by ${council.complyBy} and kept that way until ${council.maintainUntil}.`,
        }
      : null,
    r.coast.onCoast || r.coast.kmToCoast <= 3
      ? {
          q: `Does sea air affect gutters in ${n}?`,
          a: `${r.coast.onCoast ? (r.coast.coastKm >= 0.5 ? `${n} has about ${km(r.coast.coastKm)} of coastline` : `${n} is right on the coast`) : `${n} is about ${km(r.coast.kmToCoast)} from the ocean`}. Salt spray and fine sand settle in gutters, and wet leaf holds the salt against the metal. Keeping gutters clear helps them last, and Gary points out any rust spots while he's up there.`,
        }
      : null,
    r.rivers.length
      ? {
          q: `Do homes near ${the(r.rivers[0])} need more gutter cleaning?`,
          a: `Only if there are big trees over the roof. It's the trees along the foreshore and in the gardens that fill gutters, not the river itself. Most ${n} homes need one clean a year before winter, and homes under large gums often need two.`,
        }
      : null,
    r.parks[0] || r.lakes[0]
      ? (() => {
          const p = r.parks[0] ?? { name: r.lakes[0].name, bush: true };
          return {
            q: `Does living near ${p.name} mean more leaf in my gutters?`,
            a: `Usually, if your roof is close to it. ${p.bush ? 'Leaf, bark and gumnuts blow' : 'Leaf from its trees blows'} onto the roofs nearest ${p.name}. Homes a few streets back often only need one clean a year, in autumn before the winter rain.`,
          };
        })()
      : null,
    unitsPct(r) >= 30
      ? {
          q: `Do you clean gutters on units and townhouses in ${n}?`,
          a: `Yes. About ${unitsPct(r)}% of homes in ${n} are townhouses, villas or apartments. Units start from $${tiers[0].from} and double storey townhouses from $${tiers[2].from}.`,
        }
      : null,
    {
      q: `How often should gutters be cleaned in ${n}?`,
      a: `About ${r.housesPct}% of ${n} homes are separate houses, and most need one clean a year, in April or May before the winter rain. A house under big gums or next to bushland usually needs a second clean in spring.`,
    },
  ];
  return all.filter((f): f is FaqItem => !!f).slice(0, 2);
}

// ── Merge ────────────────────────────────────────────────────────────────────
const bySlug = new Map(raw.map((r) => [r.slug, r]));
const byName = new Map(raw.map((r) => [r.name, r]));
const handBySlug = new Map(handWritten.map((s) => [s.slug, s]));
for (const s of handWritten) {
  if (!bySlug.has(s.slug)) throw new Error(`Hand-written suburb ${s.slug} is missing from perth-suburbs.json`);
}

export const suburbPages: SuburbPage[] = raw.map((r) => {
  const council = councils[r.council];
  if (!council) throw new Error(`No council entry for ${r.council} (${r.name}) in councils.ts`);
  const bordering = r.neighbours.filter((name) => byName.has(name)).slice(0, 8);
  const topUp = r.closest.filter((name) => !bordering.includes(name)).slice(0, Math.max(0, 4 - bordering.length));
  const links = [...bordering, ...topUp].map((name) => ({ slug: byName.get(name)!.slug, name }));
  const hand = handBySlug.get(r.slug);
  if (hand) {
    const local = suburbLocal[r.slug];
    return {
      slug: r.slug, name: hand.name, postcode: hand.postcode, council: councils[hand.council], region: r.region,
      intro: local.intro, points: local.points, faqs: hand.faqs, nearby: [...hand.neighbours], links,
    };
  }
  const f = feature(r);
  return {
    slug: r.slug,
    name: r.name,
    postcode: r.postcode,
    council,
    region: r.region,
    intro: `${f.opener}. ${housing(r)} ${second(r, f.kind)}`,
    points: points(r),
    faqs: faqs(r, council),
    nearby: links.map((l) => l.name).slice(0, 3),
    links,
  };
});
