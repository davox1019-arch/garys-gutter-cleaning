/**
 * The short "local" blurb on each suburb page: two sentences a homeowner will
 * actually read, then two quick points. Written from the sourced facts in
 * suburbs.ts (ABS, council, DBCA, Heritage Council, BoM), cut down to what
 * matters for gutters. The council fire-notice point is added by the page
 * from councils.ts, so dates only live in one place.
 *
 * Keep each one specific to its suburb: if a line could be pasted onto the
 * next suburb's page unnoticed, rewrite it.
 */
export interface SuburbLocal {
  intro: string;
  points: [string, string];
}

export const suburbLocal: Record<string, SuburbLocal> = {
  kalamunda: {
    intro:
      'Kalamunda sits 300 metres up the Darling Scarp, ringed by jarrah and marri forest, and gets around 1,060 mm of rain a year, nearly half as much again as Perth. Gutters here fill faster and overflow sooner.',
    points: [
      '🌳 Jarrah bark strips and marri honky nuts, the wrong shape to wash down a downpipe',
      '🌧️ Over 200 mm of rain in each of June and July, so a part-blocked gutter overflows',
    ],
  },
  lesmurdie: {
    intro:
      'Lesmurdie is big blocks along the top of the scarp, mostly 1,000 to 2,000 m², under wandoo, jarrah and marri. More trees per house means more leaf in every gutter.',
    points: [
      '🌳 Wandoo, jarrah and marri over most roofs',
      '⛰️ Sloping scarp-top blocks, single and double storey',
    ],
  },
  'gooseberry-hill': {
    intro:
      'Gooseberry Hill is the edge of the scarp: about 1,350 homes on large blocks, with a national park inside the suburb. Bush is never more than a street or two away.',
    points: [
      '🌳 Gooseberry Hill National Park right inside the suburb',
      '🏠 Nearly every home a separate house on a big block',
    ],
  },
  mundaring: {
    intro:
      'Mundaring has kept more native bush than any other council area in metropolitan Perth, with 69.7% of the original vegetation still standing. The gutters show it.',
    points: [
      '🌳 Marri and jarrah over most blocks, and honky nuts block downpipes',
      '🐦 Black cockatoos feed on the marri here, so expect nut debris on the roof',
    ],
  },
  darlington: {
    intro:
      'Darlington is a village on the face of the scarp: steep blocks, granite outcrops, homes more than a century old, and bush right up to the fences.',
    points: [
      '🌳 Wandoo, marri and jarrah woodland over the roofs',
      '🏚️ Older homes on steep, rocky blocks',
    ],
  },
  'glen-forrest': {
    intro:
      'Glen Forrest started as a jarrah sawmill town on one-acre lots. The mill is long gone, but the jarrah and the big blocks are still there, with 73 hectares of Superblock bushland in the middle.',
    points: [
      '🌳 Jarrah bark strips and marri nuts up to 5 cm long',
      '🌲 Homes backing onto the Superblock fill fastest',
    ],
  },
  parkerville: {
    intro:
      "Every one of Parkerville's 866 homes is a separate house among jarrah and marri either side of Jane Brook. It's also where the 2014 Perth Hills fire started.",
    points: [
      '🌳 Jarrah and marri forest between the blocks',
      '🔥 A long dry season, and dry leaf in gutters catches embers',
    ],
  },
  greenmount: {
    intro:
      'Greenmount is where Great Eastern Highway starts to climb: suburban streets at the bottom, big blocks with views next to national park at the top.',
    points: [
      '🌳 Marri and wandoo from Greenmount National Park',
      '🗺️ About three-quarters of the suburb mapped bush fire prone',
    ],
  },
  'helena-valley': {
    intro:
      "Helena Valley looks like a newer suburb on the plain, but it's in the Shire of Mundaring, so even ordinary estate blocks are covered by a Hills fire notice.",
    points: [
      '🌳 Flooded gum, paperbark and sheoak along the Helena River',
      '🗺️ About four-fifths of the suburb mapped bush fire prone',
    ],
  },
  roleystone: {
    intro:
      'Roleystone is large bush blocks on steep ground above the Canning River. In February 2011 a fire here and in Kelmscott destroyed 71 homes in an afternoon.',
    points: [
      '🌳 Marri and jarrah on the hills, flooded gum by the river',
      '⛰️ Homes built into steep slopes',
    ],
  },
  kelmscott: {
    intro:
      'Kelmscott is mostly a 1960s and 70s suburb, with the Canning River through the middle and its eastern streets climbing into the Darling Scarp.',
    points: [
      '🌳 Flooded gum and paperbark along the river, marri on the high banks',
      '🏘️ Houses, units and villas all covered',
    ],
  },
  guildford: {
    intro:
      'Guildford was settled in 1829 where the Swan and Helena rivers meet. Its houses are among the oldest in Perth, and the sugar gums planted over them in 1896 are still dropping leaf.',
    points: [
      '🌳 Avenues of 1890s sugar gums on Victoria, James and Meadow Streets',
      '🏛️ Heritage homes with steep, old roofs',
    ],
  },
  duncraig: {
    intro:
      "Duncraig isn't the Hills. Whether your gutters fill here depends almost entirely on your street and the trees over your roof.",
    points: [
      '🏠 Mostly mid-1970s homes between Beach Road and Hepburn Avenue',
      '🌳 Street trees and garden gums, so some roofs fill and some barely do',
    ],
  },
  kingsley: {
    intro:
      'Kingsley has Lake Goollelal on one side and about 15 hectares of bushland in the middle. Homes near either one fill their gutters much faster than the rest.',
    points: [
      '🌳 Banksia, jarrah, sheoak and tuart in Shepherds Bush Reserve',
      '🏘️ Late-1970s homes, villas and townhouses',
    ],
  },
};
