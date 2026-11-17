/**
 * Suburb pages. One entry here = one page at /gutter-cleaning-{slug}/.
 *
 * RULES FOR ADDING A SUBURB
 * 1. It must be an official WA locality. Every suburb below was checked against
 *    its ABS 2021 Census Suburbs and Localities (SAL) code, recorded in `sal`.
 *    No SAL code, no page. (A competitor's Perth site has pages for Mildura and
 *    Maitland, which are in Victoria and New South Wales.)
 * 2. Every statement must be true of THIS suburb and traceable to a source:
 *    ABS, the council, Heritage Council records, DBCA park pages, the Keelty
 *    report. If something could be pasted onto the next suburb's page without
 *    anyone noticing, it does not belong here.
 * 3. Do not write about roof materials, gutter profiles, water tanks or
 *    "what we usually find" unless there is a source. Research in November
 *    2026 could only confirm roof materials for Guildford.
 * 4. No first-person experience claims ("we've cleaned hundreds of homes in…").
 * 5. If a suburb cannot support about 400 honest words, leave it out.
 */
import type { FaqItem } from '../lib/schema';

export interface Suburb {
  slug: string;
  name: string;
  postcode: string;
  /** ABS 2021 SAL code — the proof this is a real WA locality. */
  sal: string;
  council: 'kalamunda' | 'mundaring' | 'armadale' | 'swan' | 'joondalup';
  group: 'hills' | 'east' | 'north';
  description: string;
  lead: string;
  facts: { label: string; value: string }[];
  sections: { h: string; p: string[] }[];
  /** A sentence on bush fire prone mapping, where relevant. The template adds
   *  a link to the official address-level map after it. */
  bfp?: string;
  faqs: FaqItem[];
  /** Three suburbs that share a boundary with this one, checked against
   *  Landgate's official WA localities layer (LGATE-234). Shown as plain
   *  text in the footer: "Operating in X and nearby A, B and C". */
  neighbours: [string, string, string];
  sources: string;
}

const abs = (name: string, extra = '') =>
  `Population, dwelling and housing figures: ABS 2021 Census QuickStats for ${name}. ${extra}Checked November 2026.`;

export const suburbs: Suburb[] = [
  // ───────────────────────────── City of Kalamunda ─────────────────────────────
  {
    slug: 'kalamunda',
    name: 'Kalamunda',
    postcode: '6076',
    sal: 'SAL50707',
    council: 'kalamunda',
    group: 'hills',
    description:
      'Gutter cleaning in Kalamunda 6076. About 300 m up the scarp, wetter than Perth, ringed by jarrah and marri, and covered by a council fire notice that names gutters.',
    lead:
      'Kalamunda sits about 300 metres up the Darling Scarp. It gets more rain than Perth, it is ringed by jarrah and marri forest, and its council puts gutters in writing.',
    facts: [
      { label: 'Postcode', value: '6076' },
      { label: 'Council', value: 'City of Kalamunda' },
      { label: 'Private dwellings', value: '3,102' },
      { label: 'Separate houses', value: '89.3%' },
    ],
    sections: [
      {
        h: 'More rain than the city below',
        p: [
          'The long-term average at Kalamunda is a little over 1,060 mm of rain a year. Perth averages about 727 mm. The difference shows up in exactly the months that test a gutter: Kalamunda averages roughly 144 mm in May and more than 210 mm in each of June and July, where Perth sees about 85 mm in May and 144 mm in July.',
          'So a Kalamunda gutter has to move around half as much water again as the same gutter on the coastal plain, after the same long dry summer of collecting leaf. A partial blockage that would only dribble in Bayswater overflows here.',
        ],
      },
      {
        h: 'Forest on three sides',
        p: [
          'The town is surrounded by jarrah and marri forest. Kalamunda National Park, with marri, jarrah and wandoo along Piesse Brook, is on its doorstep, and the Bibbulmun Track starts its thousand-kilometre run south from the town.',
          'Jarrah is a stringybark that sheds in long fibrous strips. Marri drops the big woody fruit locals call honky nuts, three to five centimetres long. Both end up on roofs, and both are the wrong shape to wash cleanly down a downpipe.',
        ],
      },
      {
        h: 'Two kinds of Kalamunda block',
        p: [
          'Most housing across the district dates from the post-war decades through to the 1970s. The streets around the town centre are zoned for smaller lots, some under 450 square metres, and about one home in ten is a townhouse or villa. Further out, towards Jorgensen Park on one side and the scarp on the other, blocks are larger and the forest is closer.',
          'That split matters for gutters. A unit near Haynes Street may have one street tree to contend with. A house backing onto bush can fill its gutters twice in a year.',
        ],
      },
    ],
    bfp:
      'The streets around the town centre are not mapped as bush fire prone, but the eastern and scarp-side parts of the suburb are. The council notice applies to every property either way.',
    faqs: [
      {
        q: 'When do gutters need to be clear in Kalamunda?',
        a: "The City of Kalamunda's 2026/27 notice required the work to be done by 1 November 2026 and kept that way up to and including 31 March 2027. It applies to all properties. If the gutters have filled again since spring, they need doing again to stay within the notice.",
      },
      {
        q: 'Is one clean a year enough in Kalamunda?',
        a: 'For a house with little tree cover, usually. For a house under jarrah or marri it often is not, because the notice period runs through the months when eucalypts drop the most litter, and then the winter rain arrives in May. Many homes near the forest edge need a clean before November and another in autumn.',
      },
    ],
    neighbours: ['Lesmurdie', 'Gooseberry Hill', 'Walliston'],
    sources: abs('Kalamunda (SAL50707)', 'Rainfall: Bureau of Meteorology long-term means for Kalamunda (station 009058) and Perth Metro (009225). '),
  },
  {
    slug: 'lesmurdie',
    name: 'Lesmurdie',
    postcode: '6076',
    sal: 'SAL50849',
    council: 'kalamunda',
    group: 'hills',
    description:
      'Gutter cleaning in Lesmurdie 6076: big blocks of 1,000 to 2,000 m² under wandoo, jarrah and marri, with a City of Kalamunda fire notice that requires clear gutters.',
    lead:
      'Lesmurdie is a suburb of big blocks along the top of the scarp. Bigger blocks mean more trees per house, and in Lesmurdie those trees are wandoo, jarrah and marri.',
    facts: [
      { label: 'Postcode', value: '6076' },
      { label: 'Council', value: 'City of Kalamunda' },
      { label: 'Private dwellings', value: '3,100' },
      { label: 'Separate houses', value: '95.5%' },
    ],
    sections: [
      {
        h: 'A thousand square metres and up',
        p: [
          'Lesmurdie is mostly zoned for lots of 1,000 to 2,000 square metres, well above a typical suburban block on the coastal plain. More than 95 per cent of its homes are separate houses. The suburb began in 1897 as a fruit-growing property, set up by Archibald Sanderson on land bought from the Canning Jarrah Timber Company, and it has kept the room.',
          'A block that size usually carries several mature trees, and often the neighbours\' trees reach over as well. The roof underneath collects from all of them.',
        ],
      },
      {
        h: 'What grows here',
        p: [
          'The best guide to Lesmurdie\'s trees is the bush that was never cleared. At Lesmurdie Falls, where Lesmurdie Brook drops about 50 metres over the scarp in Mundy Regional Park, the woodland is wandoo, jarrah and marri. The trail notes for the falls warn walkers about gumnuts underfoot, which tells you what is coming off the canopy.',
          'Wandoo sheds its bark in flakes. Jarrah sheds in long strips. Marri drops fruit the size of a small egg. The falls run best from winter into spring, on the same rain that finds out whether a gutter is clear.',
        ],
      },
      {
        h: 'Getting to the gutter',
        p: [
          'Lesmurdie sits at the top of the scarp, reached from the plain by Welshpool Road East, and not every block is level. A house that is single storey at the front door can be well off the ground at the back. That is a large part of why each property is priced individually rather than at a flat rate for the suburb.',
        ],
      },
    ],
    bfp: 'Much of Lesmurdie is mapped as bush fire prone.',
    faqs: [
      {
        q: 'Does the Kalamunda fire notice apply to an ordinary house block in Lesmurdie?',
        a: 'Yes. The gutter requirement sits under the heading that applies to all properties in the City of Kalamunda, not just large or rural ones. It asks for gutters, roofs and walls of all buildings to be free of flammable matter.',
      },
      {
        q: 'My block slopes steeply. Can you still quote from satellite?',
        a: 'Yes. Slope and height are two of the things we look for, and they are the main reason prices differ between houses of similar size. If the satellite view does not tell the whole story, we will say so with the quote.',
      },
    ],
    neighbours: ['Kalamunda', 'Walliston', 'Forrestfield'],
    sources: abs('Lesmurdie (SAL50849)', 'Lot sizes: Shire of Kalamunda Local Planning Strategy. '),
  },
  {
    slug: 'gooseberry-hill',
    name: 'Gooseberry Hill',
    postcode: '6076',
    sal: 'SAL50571',
    council: 'kalamunda',
    group: 'hills',
    description:
      'Gutter cleaning in Gooseberry Hill 6076: large scarp-edge blocks beside Gooseberry Hill National Park and the Zig Zag, under a council fire notice that covers gutters.',
    lead:
      'Gooseberry Hill is the edge of the scarp: about 1,350 homes on large blocks, with a national park at the end of the street and the coastal plain laid out below.',
    facts: [
      { label: 'Postcode', value: '6076' },
      { label: 'Council', value: 'City of Kalamunda' },
      { label: 'Private dwellings', value: '1,357' },
      { label: 'Separate houses', value: '96.7%' },
    ],
    sections: [
      {
        h: 'Bush inside the suburb boundary',
        p: [
          'Gooseberry Hill National Park, 33 hectares on the southern side of the mouth of the Helena Valley, is inside the suburb. The Zig Zag Scenic Drive runs down through it, one way and downhill only, on the line of the old railway that once climbed the hill. Statham\'s Quarry is in the park too.',
          'Beyond the national park, two more areas of bushland in the suburb are protected under the state\'s Bush Forever program: the Ridge Hill Road bushland and the Gooseberry Hill bushland. For a suburb of this size, that is a lot of uncleared land sitting next to houses.',
        ],
      },
      {
        h: 'Large blocks, nearly all houses',
        p: [
          'The suburb is zoned mostly for lots of 1,000 to 2,000 square metres, and 96.7 per cent of its homes are separate houses. There is no apartment or townhouse stock to speak of. Large lots on a scarp edge mean mature trees close to the house and, on some blocks, a fall across the site that puts one side of the roof much higher than the other.',
        ],
      },
      {
        h: 'Why the notice matters more here',
        p: [
          'The City of Kalamunda\'s fire notice asks every property to keep a reduced-fuel zone for 20 metres around buildings, and to keep gutters, roofs and walls free of flammable matter. In a suburb where the bush is a neighbour rather than a view, that 20 metres often takes in trees whose leaf lands directly on the roof.',
          'The notice counts leaf litter, twigs and bark as fine fuel. That is the same material that fills a gutter.',
        ],
      },
    ],
    bfp: 'Much of Gooseberry Hill is mapped as bush fire prone.',
    faqs: [
      {
        q: 'When does the Kalamunda notice apply in Gooseberry Hill?',
        a: 'For 2026/27, work had to be completed by 1 November 2026 and maintained up to and including 31 March 2027. Gutters that were clear in October and have filled since are no longer clear.',
      },
      {
        q: 'Can you clean gutters on a house built down a slope?',
        a: 'Usually, yes. Send an enquiry and we will look at the site before pricing it. Height and access are part of what we price, and we will say plainly if a house needs something more than a standard clean.',
      },
    ],
    neighbours: ['Kalamunda', 'Helena Valley', 'Maida Vale'],
    sources: abs('Gooseberry Hill (SAL50571)', 'Parks: DBCA. Zoning and Bush Forever sites: Shire of Kalamunda Local Planning Strategy. '),
  },

  // ───────────────────────────── Shire of Mundaring ─────────────────────────────
  {
    slug: 'mundaring',
    name: 'Mundaring',
    postcode: '6073',
    sal: 'SAL51055',
    council: 'mundaring',
    group: 'hills',
    description:
      'Gutter cleaning in Mundaring 6073: jarrah and marri forest, blocks of 2,000 m² and more, and a Shire fire notice requiring gutters free of fine fuels from 1 November.',
    lead:
      'Mundaring is the main town of a shire that has kept more of its native bush than any other council area in metropolitan Perth. The gutters show it.',
    facts: [
      { label: 'Postcode', value: '6073' },
      { label: 'Council', value: 'Shire of Mundaring' },
      { label: 'Private dwellings', value: '1,326' },
      { label: 'Separate houses', value: '92.2%' },
    ],
    sections: [
      {
        h: 'A town inside a forest',
        p: [
          'The Shire of Mundaring reports that 69.7 per cent of its original vegetation remains, the highest share of any metropolitan local government. The main type is jarrah and marri forest, and the Shire\'s own bushfire plan notes that it is dominant in the populated areas, not just out in the catchment.',
          'The townsite was declared in 1898 and the Mundaring Hotel went up the following year. The residential area runs from Kintore Road in the west to Darkan Street in the east, with national park, water catchment and rural land around it.',
        ],
      },
      {
        h: 'Why the blocks are big',
        p: [
          'Reticulated sewerage only serves the town centre. Everywhere else is zoned for large lots, and across the hills part of the Shire most houses are on 2,000 square metres or more. There is a pocket of townhouses near the centre, about seven per cent of homes, but the typical Mundaring property is a house on a big, treed block.',
          'A big block under jarrah and marri produces a great deal of litter. The Shire\'s bushfire plan puts unmanaged fuel loads in this forest type at up to 25 tonnes a hectare. A share of that lands on the roof every year.',
        ],
      },
      {
        h: 'Marri, cockatoos and downpipes',
        p: [
          'Mundaring sits within an area recognised as important for black cockatoos, which feed on marri fruit. Marri flowers between December and May, and its woody fruit, up to five centimetres long, can stay on the tree for a year or more before it comes down.',
          'When it does come down onto a roof, it rolls to the gutter and then to the downpipe outlet, which is where it stops. Jarrah bark, shed in long flat strips, tends to bridge across the gutter and hold everything else in place behind it.',
        ],
      },
    ],
    bfp: 'Almost all of Mundaring is mapped as bush fire prone.',
    faqs: [
      {
        q: 'Does the Shire of Mundaring notice apply to a normal house block?',
        a: 'Yes. Any land with a building on it must maintain an asset protection zone, including lots under 5,000 square metres. The gutter clause is part of that zone\'s specification.',
      },
      {
        q: 'When should gutters be cleaned in Mundaring?',
        a: 'Twice, on a heavily treed block: before 1 November to meet the notice, and again in autumn before the winter rain. On a block with less canopy, once before winter is often enough, provided the gutters are still clear of leaf when the notice period starts.',
      },
    ],
    neighbours: ['Parkerville', 'Mahogany Creek', 'Sawyers Valley'],
    sources: abs('Mundaring (SAL51055)', 'Vegetation and fuel loads: Shire of Mundaring Bushfire Risk Management Plan 2025–2030. Zoning: Shire of Mundaring Local Planning Strategy. '),
  },
  {
    slug: 'darlington',
    name: 'Darlington',
    postcode: '6070',
    sal: 'SAL50390',
    council: 'mundaring',
    group: 'hills',
    description:
      'Gutter cleaning in Darlington 6070: steep granite blocks, early-1900s timber and iron houses, wandoo, marri and jarrah overhead, and two bushfire warnings in early 2026.',
    lead:
      'Darlington is a village on the face of the scarp, 20 kilometres from Perth. It has steep blocks, granite outcrops, houses more than a century old, and bush right up to the fences.',
    facts: [
      { label: 'Postcode', value: '6070' },
      { label: 'Council', value: 'Shire of Mundaring' },
      { label: 'Private dwellings', value: '1,431' },
      { label: 'Separate houses', value: '98.1%' },
    ],
    sections: [
      {
        h: 'Old houses on difficult ground',
        p: [
          'Darlington started with a vineyard in 1883 and grew once the Eastern Railway arrived the following year. By the 1920s it was known for its guest houses; D.H. Lawrence stayed in 1922. The Dalry Road precinct, built between 1900 and 1930, is recorded by the Heritage Council as jarrah weatherboard and iron-roofed houses and stone cottages, on a road that winds around granite boulders past dry stone walls.',
          'The Shire\'s planning strategy describes the suburb as steep, with rock outcrops, and with views over the coastal plain and the Helena River valley. For gutter cleaning that means a house that may be two storeys of stone and weatherboard on the downhill side, on a block where there is not always a level spot to stand a ladder.',
        ],
      },
      {
        h: 'Wandoo, marri and jarrah',
        p: [
          'The scarp here carries open woodland of wandoo, marri and jarrah. Nyaania Creek runs through the middle of the suburb, the Helena River is its southern boundary, and Greenmount National Park is its western one. The old railway line is now the Railway Reserves Heritage Trail, which locals call the bridle trail.',
          'Almost every Darlington house is a separate house on a large lot, with no sewerage and plenty of trees. Leaf, flaked wandoo bark and marri nuts arrive on roofs all year, with the heaviest fall from summer into autumn.',
        ],
      },
      {
        h: 'Two warnings in six weeks',
        p: [
          'On 2 January 2026 a fire that started in Boya Quarry Reserve ran towards houses on Sandover Road, View Terrace and Orange Road. No homes were lost. On 6 February 2026 an emergency warning was issued for parts of Darlington and Helena Valley, and about 27 hectares burned, again with no property damage reported.',
          'Neither fire took a house. Both were close enough to make the point of the Shire\'s notice, which is that the fuel nearest the building is the fuel that matters, and that includes what is lying in the gutter.',
        ],
      },
    ],
    bfp: 'Almost all of Darlington is mapped as bush fire prone.',
    faqs: [
      {
        q: 'Can you work on an older Darlington house?',
        a: 'Yes. Age and construction are worth mentioning when we get in touch to arrange a time, particularly if the gutters are original or the roof is steep. The quote is based on what can be seen from above, so anything unusual about the house is useful to know.',
      },
      {
        q: 'What does the Shire of Mundaring notice require for gutters?',
        a: 'That gutters are free of fine fuels and other flammable or combustible materials, as part of the asset protection zone around any building. It also says no part of a tree should overhang a building. The work is due by 1 November each year and must be maintained until 31 March.',
      },
    ],
    neighbours: ['Glen Forrest', 'Greenmount', 'Helena Valley'],
    sources: abs('Darlington (SAL50390)', 'Heritage: inHerit, Heritage Council of WA. Fires: ABC News and Echo News reports, January and February 2026. '),
  },
  {
    slug: 'glen-forrest',
    name: 'Glen Forrest',
    postcode: '6071',
    sal: 'SAL50552',
    council: 'mundaring',
    group: 'hills',
    description:
      'Gutter cleaning in Glen Forrest 6071: a former jarrah mill town of large bush blocks around the 73-hectare Superblock, under the Shire of Mundaring fire notice.',
    lead:
      'Glen Forrest began as a jarrah sawmill and was first subdivided into one-acre lots. The mill is long gone. The jarrah and the large blocks are still there.',
    facts: [
      { label: 'Postcode', value: '6071' },
      { label: 'Council', value: 'Shire of Mundaring' },
      { label: 'Private dwellings', value: '1,098' },
      { label: 'Separate houses', value: '98.5%' },
    ],
    sections: [
      {
        h: 'From Smith\'s Mill to one-acre lots',
        p: [
          'The settlement grew up around a jarrah sawmill established in 1877 and was known as Smith\'s Mill until 1915. After the mill closed, 47 one-acre lots were subdivided in 1902. The Octagonal Hall on McGlew Road dates from 1897, and the Statham brickworks operated here until the late 1960s.',
          'The pattern set in 1902 has largely held. Glen Forrest has no reticulated sewerage and is zoned for large residential lots, with rural-residential land to the south and east. Of its 1,098 homes, 98.5 per cent are separate houses.',
        ],
      },
      {
        h: 'The Superblock',
        p: [
          'In the middle of the suburb is the Glen Forrest Superblock: nine reserves totalling about 73.6 hectares of jarrah and marri woodland, bounded by Sealey Road and Glen Forrest Drive on the east, Jellicoe Road on the south and Mofflin Avenue on the west, with Nyaania Creek along its edges. The Shire lists it as an environmentally significant reserve.',
          'A reserve that size inside a suburb means a long boundary of houses that back directly onto forest. Add the Railway Reserves Heritage Trail, which runs through the middle of Glen Forrest, and the Helena River along the southern edge, and there are few streets here without bush close by.',
        ],
      },
      {
        h: 'What that does to a roof',
        p: [
          'Jarrah sheds bark in long fibrous strips and marri drops woody fruit up to five centimetres long. On a one-acre block there is room for a good many of each within reach of the house. The Shire\'s planning strategy cites bushfire hazard as a reason not to expand residential zoning in Glen Forrest, which is a fair summary of how much fuel surrounds the homes already here.',
        ],
      },
    ],
    bfp: 'Almost all of Glen Forrest is mapped as bush fire prone.',
    faqs: [
      {
        q: 'My house backs onto the Superblock. How often should the gutters be done?',
        a: 'Plan on twice a year: once before 1 November so the gutters are clear when the Shire\'s notice period begins, and once in autumn before the winter rain. A house with canopy directly over the roof may need checking in between.',
      },
      {
        q: 'Do you cover the rural-residential properties south of Glen Forrest?',
        a: 'Send an enquiry with the street address and we will tell you. Larger properties often have long gutter runs and outbuildings, so they are always priced individually.',
      },
    ],
    neighbours: ['Darlington', 'Mahogany Creek', 'Hovea'],
    sources: abs('Glen Forrest (SAL50552)', 'History: Mundaring and Hills Historical Society. Zoning: Shire of Mundaring Local Planning Strategy. '),
  },
  {
    slug: 'parkerville',
    name: 'Parkerville',
    postcode: '6081',
    sal: 'SAL51205',
    council: 'mundaring',
    group: 'hills',
    description:
      'Gutter cleaning in Parkerville 6081, where every home is a separate house on a bush block and the 2014 fire that destroyed 57 homes began. Gutters are in the Shire notice.',
    lead:
      'Every one of Parkerville\'s 866 homes is a separate house, set among jarrah and marri either side of Jane Brook. It is also where the 2014 Perth Hills fire started.',
    facts: [
      { label: 'Postcode', value: '6081' },
      { label: 'Council', value: 'Shire of Mundaring' },
      { label: 'Private dwellings', value: '866' },
      { label: 'Separate houses', value: '100%' },
    ],
    sections: [
      {
        h: 'Houses along Jane Brook',
        p: [
          'Parkerville was gazetted in 1895, a year before its railway station opened. The Railway Hotel followed in 1902 and still trades as the Parkerville Tavern. The railway itself is now the Railway Reserves Heritage Trail.',
          'The residential area lies on both sides of Jane Brook and the trail, and the Shire notes that parts of it north of the brook are on steeply sloping land. There is no sewerage, lots are large, and the surrounding country is rural-residential. The census recorded no townhouses or flats at all.',
        ],
      },
      {
        h: '12 January 2014',
        p: [
          'At about 11 in the morning on 12 January 2014, a power pole fell on a property near the corner of Granite Road and Johnson Road. The fire that followed destroyed 57 houses, along with sheds and vehicles, across 386 hectares of Parkerville, Stoneville and Mount Helena.',
          'On 21 December 2023 another fire started near Granite Road, this time from a tree falling on powerlines, and ran east towards the township. Two houses were lost.',
          'Nobody in Parkerville needs the risk explained to them. What is worth saying is narrower: on a day like either of those, burning embers land well ahead of the fire, and a gutter full of dry jarrah leaf at the edge of the roof is one of the places they can land.',
        ],
      },
      {
        h: 'Jarrah, marri and a long dry season',
        p: [
          'The Shire describes this part of the hills as jarrah and marri forest interspersed with cleared rural and residential blocks. Both species drop the bulk of their litter from summer into autumn, which is the fire season and also the lead-up to winter. A Parkerville gutter cleaned in October can be carrying a fresh load by February.',
        ],
      },
    ],
    bfp: 'Almost all of Parkerville is mapped as bush fire prone.',
    faqs: [
      {
        q: 'Is a single clean before November enough in Parkerville?',
        a: 'It meets the start date in the Shire\'s notice, but the notice also requires the standard to be maintained until 31 March. If leaf builds up again over summer, which it usually does under jarrah and marri, the gutters need clearing again.',
      },
      {
        q: 'Do you clean gutters on sheds and outbuildings?',
        a: 'Yes. They show on the satellite view and we will include them in the price if you want them done. The Shire\'s notice covers all buildings within the asset protection zone, not just the house.',
      },
    ],
    neighbours: ['Mundaring', 'Stoneville', 'Hovea'],
    sources: abs('Parkerville (SAL51205)', 'Fire details: Shire of Mundaring Bushfire Risk Management Plan 2025–2030. '),
  },
  {
    slug: 'greenmount',
    name: 'Greenmount',
    postcode: '6056',
    sal: 'SAL50585',
    council: 'mundaring',
    group: 'east',
    description:
      'Gutter cleaning in Greenmount 6056: suburban streets at the foot of the hill, large view blocks at the top, and marri and wandoo national park along the edge.',
    lead:
      'Greenmount is where Great Eastern Highway starts to climb. The bottom of the suburb is ordinary suburban streets. The top is large blocks with views, next to national park.',
    facts: [
      { label: 'Postcode', value: '6056' },
      { label: 'Council', value: 'Shire of Mundaring' },
      { label: 'Private dwellings', value: '1,068' },
      { label: 'Separate houses', value: '94.6%' },
    ],
    sections: [
      {
        h: 'Two suburbs in one',
        p: [
          'The Shire of Mundaring classes Greenmount as foothills rather than hills, and its planning strategy splits it in two. The western part is sewered and zoned for conventional suburban lots, with some townhouses. The eastern, more elevated part has no sewerage, is zoned for lots of around 2,000 square metres, and in the strategy\'s words has extensive views of the coastal plain.',
          'For gutters, the two halves behave differently. On the flat, the load comes from garden and street trees and a clean before winter usually covers it. Up the hill, the blocks are bigger, the native trees are closer, and the slope adds height to one side of most houses.',
        ],
      },
      {
        h: 'National park on the boundary',
        p: [
          'Greenmount National Park covers about two square kilometres of steep, rocky scarp, and its dominant eucalypts are marri and wandoo. There is a lookout over the plain reached from Padbury Road. John Forrest National Park forms the suburb\'s eastern boundary. Jarrah forest once covered the hill itself.',
          'The southern slopes of Greenmount National Park were significantly damaged by bushfire in the early 2000s. Houses along that side of the suburb sit between the park and the plain.',
        ],
      },
      {
        h: 'The notice still applies down the hill',
        p: [
          'About three-quarters of Greenmount is mapped as bush fire prone, which leaves a meaningful part that is not. The Shire\'s notice does not make that distinction. It applies to all owners and occupiers in the Shire, and any land with a building must keep its gutters free of fine fuels from 1 November to 31 March, whether it is a view block on the scarp or a house near Blackboy Hill.',
        ],
      },
    ],
    bfp: 'About three-quarters of Greenmount is mapped as bush fire prone, mostly the elevated eastern side.',
    faqs: [
      {
        q: 'I am in the suburban part of Greenmount. Do I still need to clear gutters for the fire notice?',
        a: 'Yes. The Shire of Mundaring notice applies across the whole Shire. The gutter requirement is part of the asset protection zone that every lot with a building must maintain, regardless of whether the lot is mapped as bush fire prone.',
      },
      {
        q: 'Is Greenmount priced differently from the suburbs below it?',
        a: 'Not by suburb. Price follows the house: its size, its height and how much is in the gutters. A single-storey house on a flat Greenmount street is priced like the same house anywhere else on the plain.',
      },
    ],
    neighbours: ['Darlington', 'Boya', 'Swan View'],
    sources: abs('Greenmount (SAL50585)', 'Zoning: Shire of Mundaring Local Planning Strategy. Parks: DBCA. '),
  },
  {
    slug: 'helena-valley',
    name: 'Helena Valley',
    postcode: '6056',
    sal: 'SAL50623',
    council: 'mundaring',
    group: 'east',
    description:
      'Gutter cleaning in Helena Valley 6056: 1980s–90s estates and older rural blocks along the Helena River, where ordinary house lots fall under the Shire fire notice.',
    lead:
      'Helena Valley looks like a newer suburb on the plain, and much of it is. It is also in the Shire of Mundaring, which means its ordinary house blocks are covered by a Hills fire notice.',
    facts: [
      { label: 'Postcode', value: '6056' },
      { label: 'Council', value: 'Shire of Mundaring' },
      { label: 'Private dwellings', value: '1,635' },
      { label: 'Separate houses', value: '94.5%' },
    ],
    sections: [
      {
        h: 'Estates and orchard blocks',
        p: [
          'The valley was orchard country first: subdivision of Clayton Farm into orchard blocks began in 1906. The main period of housing development came in the 1980s and 1990s, and it has not finished. Smaller lots have been approved around Lakeside Drive and Tuckeroo Parade, and in August 2026 the council considered a further 61-lot plan on Helena Valley Road.',
          'The result is a mix. There are estate streets of family homes, and between Helena Valley Road and the river there are still small rural properties on much larger blocks.',
        ],
      },
      {
        h: 'River trees and scarp trees',
        p: [
          'Along the lower Helena River the fringe is flooded gum and swamp paperbark, with swamp sheoak. On the higher ground and the slopes it is marri, wandoo and jarrah. A state landscape study of the river noted that this woodland has mostly been cleared from the lower plains but survives on the larger semi-rural properties.',
          'So the gutter load in Helena Valley depends heavily on which kind of block you are on. A house in a 1990s estate with a young street tree is a light job. A house on an older block by the river, under mature flooded gum, is not.',
        ],
      },
      {
        h: 'The fire notice reaches the estates',
        p: [
          'Roughly four-fifths of Helena Valley is mapped as bush fire prone, including effectively all of its southern and eastern parts. On 6 February 2026, a fire burning in Darlington, Helena Valley and Boya prompted warnings for the area between Victor, Clayton and Hudman roads.',
          'The Shire\'s notice requires any lot with a building on it to maintain an asset protection zone, and that includes lots under 5,000 square metres. A standard estate block qualifies. People who have moved here from a coastal-plain council are often surprised to find a 1 November gutter deadline applies to them.',
        ],
      },
    ],
    bfp: 'Roughly four-fifths of Helena Valley is mapped as bush fire prone.',
    faqs: [
      {
        q: 'I live in a newer estate in Helena Valley. Does the Mundaring notice really apply to me?',
        a: 'Yes. Clause 1.1 of the notice covers all land up to 5,000 square metres with a building on it, and requires an asset protection zone that includes gutters free of fine fuels. It is not limited to bush or rural blocks.',
      },
      {
        q: 'What is the deadline?',
        a: 'Work must be done by 1 November each year and maintained until 31 March the following year. The penalty stated in the notice for failing to comply is a fine not exceeding $5,000.',
      },
    ],
    neighbours: ['Darlington', 'Gooseberry Hill', 'Boya'],
    sources: abs('Helena Valley (SAL50623)', 'Vegetation: Swan River Trust landscape description, Helena River precinct. '),
  },

  // ───────────────────────────── City of Armadale ─────────────────────────────
  {
    slug: 'roleystone',
    name: 'Roleystone',
    postcode: '6111',
    sal: 'SAL51308',
    council: 'armadale',
    group: 'hills',
    description:
      'Gutter cleaning in Roleystone 6111: 2,000 m² bush blocks above the Canning River, the 2011 fire that destroyed 71 homes, and an Armadale notice requiring clear gutters.',
    lead:
      'Roleystone is large bush blocks on steep ground above the Canning River. In February 2011 a fire here and in Kelmscott destroyed 71 homes in an afternoon.',
    facts: [
      { label: 'Postcode', value: '6111' },
      { label: 'Council', value: 'City of Armadale' },
      { label: 'Private dwellings', value: '2,635' },
      { label: 'Separate houses', value: '98.3%' },
    ],
    sections: [
      {
        h: 'Houses built to the slope',
        p: [
          'Roleystone was cut into farmlets in 1902, after orchards had been planted here from 1893. Today it is mostly residential blocks with a 2,000 square metre minimum, surrounded by bushland and what remains of the orchards. More than 98 per cent of its homes are separate houses.',
          'A state study of the Canning River corridor described the housing as very low density, built to suit steeply sloping land, in a wide range of styles from single-storey bungalows to houses that step down the hill. On ground like that, the gutter line on the downhill side can be a long way up.',
        ],
      },
      {
        h: 'Marri and jarrah above, flooded gum below',
        p: [
          'The hillsides are open marri and jarrah woodland. Down at the river the fringe is flooded gum and paperbark. Roley Pools Reserve has flooded gum, wandoo and marri around its granite pools, and Colquhoun Reserve on Peet Road is jarrah and marri forest with scattered sheoak. Volunteers look after about 37 bush reserves in and around the suburb.',
          'Sheoak is worth singling out. Its fine needles pass through coarse gutter mesh and mat together in the gutter, which catches out people who assumed gutter guard had solved the problem.',
        ],
      },
      {
        h: '6 February 2011',
        p: [
          'The fire started in the front yard of a property on Brookton Highway, on a day of total fire ban. It burned about 440 hectares, destroyed 71 homes and damaged another 39 across Roleystone and Kelmscott.',
          'The government review that followed found that 61 of the 71 homes destroyed had tall vegetation within 20 metres of the house, and that older homes with open eaves had let embers into the roof space. The review does not single out gutters, and we will not pretend it does. Its finding was broader: what is close to the house, and what embers can reach, decides a great deal.',
        ],
      },
    ],
    bfp: 'Much of Roleystone is mapped as bush fire prone.',
    faqs: [
      {
        q: 'What does the City of Armadale require for gutters?',
        a: 'Its 2026/27 notice says gutters, roofs and walls of all habitable buildings are to be maintained free of inflammable matter, and it defines inflammable matter to include leaf litter. The clause appears for land over 5,000 square metres and for land of 5,000 square metres or less, so it applies whatever the size of the block.',
      },
      {
        q: 'When is the Armadale deadline?',
        a: 'On or before 30 November 2026, maintained up to and including 31 March 2027. That is a month later than the Kalamunda and Mundaring notices, but the maintenance period ends on the same day.',
      },
    ],
    neighbours: ['Kelmscott', 'Bedfordale', 'Karragullen'],
    sources: abs('Roleystone (SAL51308)', 'Fire: “A Shared Responsibility”, the report of the Perth Hills Bushfire February 2011 Review. Vegetation: Swan River Trust and City of Armadale. '),
  },
  {
    slug: 'kelmscott',
    name: 'Kelmscott',
    postcode: '6111',
    sal: 'SAL50748',
    council: 'armadale',
    group: 'east',
    description:
      'Gutter cleaning in Kelmscott 6111: 1970s homes on the flat, the Canning River and its flooded gums through the middle, and Clifton Hills rising into the scarp behind.',
    lead:
      'Kelmscott is one of the oldest towns in the state, founded in 1830. The Canning River runs through the middle of it, and its eastern streets climb into the Darling Scarp.',
    facts: [
      { label: 'Postcode', value: '6111' },
      { label: 'Council', value: 'City of Armadale' },
      { label: 'Private dwellings', value: '4,692' },
      { label: 'Separate houses', value: '81.5%' },
    ],
    sections: [
      {
        h: 'Mostly a 1970s suburb',
        p: [
          'Kelmscott grew fastest in the 1960s and 1970s. The Kingsley, Westfield Park and Clifton Hills estates all date from 1970s subdivisions, and a state study of the river precinct describes the houses along Clifton and Marmion Streets as mainly 1970s in style, with some older properties among them.',
          'It is also more mixed than the suburbs up the hill. About 16 per cent of homes are townhouses or villas, and there are single-storey duplexes along the river. Strata gutters are a shared responsibility, so it helps to know who is arranging the clean before asking for a price.',
        ],
      },
      {
        h: 'The river corridor',
        p: [
          'The Canning through Kelmscott is lined with flooded gum and swamp paperbark, with marri on the higher banks. Rushton Park was the original Kelmscott Showground, and the reserve beside it has barbecues under the flooded gums. Houses near the river take leaf from very large, very old trees.',
          'East of the highway the ground rises. Jarrah and marri cover the hillsides, with wandoo on the shallow gravelly soils. Lloyd Hughes Park on Martin Street and the Clifton Hills bushland are both part of Banyowla Regional Park.',
        ],
      },
      {
        h: 'Where the 2011 fire crossed the river',
        p: [
          'The Roleystone–Kelmscott fire of 6 February 2011 destroyed 71 homes. In Kelmscott, embers carried it west from Scott Road, across the Canning River and into the streets around Roberts Road, Buckingham Road and Grade Road. Clifton Hills was among the areas hit hardest. Buckingham Bridge on Brookton Highway was destroyed and not replaced until 2013.',
          'Kelmscott is a mixed suburb on the bushfire map. The area around the station and Albany Highway is not mapped as prone; the Clifton Hills side is.',
        ],
      },
    ],
    bfp: 'Parts of Kelmscott are mapped as bush fire prone, chiefly the eastern side towards Clifton Hills.',
    faqs: [
      {
        q: 'Does the Armadale fire notice apply on the flat part of Kelmscott?',
        a: 'Yes. The notice is addressed to all owners and occupiers of land in the City of Armadale. For land of 5,000 square metres or less it requires gutters, roofs and walls of habitable buildings to be maintained free of inflammable matter, wherever in the city the land is.',
      },
      {
        q: 'Can you quote for a unit or villa in a strata complex?',
        a: 'Yes. Send an enquiry with the address of the unit. If you want the whole complex done, say so in your message, because one visit for several roofs is priced differently from one roof.',
      },
    ],
    neighbours: ['Roleystone', 'Armadale', 'Gosnells'],
    sources: abs('Kelmscott (SAL50748)', 'Fire: “A Shared Responsibility”, the report of the Perth Hills Bushfire February 2011 Review. Housing and vegetation: Swan River Trust landscape description, Canning River precinct. '),
  },

  // ───────────────────────────── City of Swan ─────────────────────────────
  {
    slug: 'guildford',
    name: 'Guildford',
    postcode: '6055',
    sal: 'SAL50594',
    council: 'swan',
    group: 'east',
    description:
      'Gutter cleaning in Guildford 6055: steep iron and tile roofs on heritage cottages, under avenues of sugar gums planted in 1896 and plane trees from the 1930s.',
    lead:
      'Guildford was established in 1829 where the Swan and Helena rivers meet. Its houses are among the oldest in Perth, and the trees over them are not much younger.',
    facts: [
      { label: 'Postcode', value: '6055' },
      { label: 'Council', value: 'City of Swan' },
      { label: 'Private dwellings', value: '797' },
      { label: 'Separate houses', value: '81.3%' },
    ],
    sections: [
      {
        h: 'The sugar gums',
        p: [
          'In 1896, 450 sugar gums were planted along Victoria, James and Meadow Streets and Terrace Road, with more avenues added the following year for Queen Victoria\'s Diamond Jubilee. Stirling Square has mature sugar gums on all sides, some dating to the 1870s. The James Street trees are on the City of Swan\'s heritage inventory, and in 1999 residents camped under them to stop their removal.',
          'They are not the only heritage plantings. There are Cape lilacs from the 1870s and London planes, brush box and flame trees from the 1930s. The planes are deciduous, so the streets they line get a concentrated leaf drop in autumn, just ahead of the winter rain. The sugar gums shed all year.',
        ],
      },
      {
        h: 'Steep roofs, old houses',
        p: [
          'Guildford Historic Town is on the State Register of Heritage Places. The Heritage Council describes housing that runs from simple colonial cottages to the grander homes of the gold boom and Federation years, largely unchanged since the inter-war period.',
          'The City of Swan\'s character statement for the heritage area records roofing as primarily galvanised iron or zincalume with some clay tile, steeply pitched, on houses that present as single storey to the street. Lots north of Swan Street are about 700 square metres. Larger houses on Helena Street step down to two or three storeys at the rear.',
          'A steep roof on an old house under a 130-year-old tree is a job to be done carefully. It is worth telling us if the gutters are original.',
        ],
      },
      {
        h: 'River flats',
        p: [
          'Flooded gum grows along the Swan, with remnant woodland at Fish Market Reserve and marri on the higher ground. The Helena River side has flooded gum and swamp paperbark. Guildford\'s recorded hazard is flood rather than fire, with major floods in 1872 and 1926, though about half the suburb, the river margins rather than the town centre, is mapped as bush fire prone.',
          'The City of Swan\'s fire hazard notice does not mention gutters. It does require that no tree crowns or branches hang over buildings within the zone around them, which in Guildford is easier said than done.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Does the City of Swan require gutters to be cleaned?',
        a: 'Not in its fire hazard reduction notice. The 2026/27 notice says nothing about gutters or roofs. Its nearest requirements are that no tree crowns or branches hang over buildings and that flammable vegetation and debris are cleared from immediately beside them. In Guildford the reason to clean gutters is water, not a council deadline.',
      },
      {
        q: 'When is the best time for a gutter clean in Guildford?',
        a: 'After the plane trees have dropped and before the winter rain sets in, which usually means late April or May. Houses under sugar gums rather than planes can be done any time in autumn, since those trees shed year-round.',
      },
    ],
    neighbours: ['Woodbridge', 'Hazelmere', 'South Guildford'],
    sources: abs('Guildford (SAL50594)', 'Heritage and trees: Heritage Council of WA assessment of Guildford Historic Town; City of Swan Guildford heritage area character statements. '),
  },

  // ───────────────────────────── City of Joondalup ─────────────────────────────
  {
    slug: 'duncraig',
    name: 'Duncraig',
    postcode: '6023',
    sal: 'SAL50438',
    council: 'joondalup',
    group: 'north',
    description:
      'Gutter cleaning in Duncraig 6023: mid-1970s brick homes on 700 m² blocks, where the gutter load depends on your street — planes on Sycamore Drive, gums on Davallia Road.',
    lead:
      'Duncraig is not the Hills, and it would be wrong to sell it as if it were. Whether your gutters fill here depends almost entirely on which street you live in.',
    facts: [
      { label: 'Postcode', value: '6023' },
      { label: 'Council', value: 'City of Joondalup' },
      { label: 'Private dwellings', value: '5,903' },
      { label: 'Separate houses', value: '91.8%' },
    ],
    sections: [
      {
        h: 'A mid-1970s suburb',
        p: [
          'The name Duncraig was approved in 1969 and most of the suburb was built in the mid-1970s, between Beach Road and Hepburn Avenue, the freeway and Marmion Avenue. It is known for dark brown and red brick houses on blocks of around 700 square metres. Many of the originals are now being renovated, or knocked down and rebuilt.',
          'That gives the suburb two generations of house. The older ones have had fifty years for the garden to grow up around them. The rebuilds are newer, and often larger on the same block.',
        ],
      },
      {
        h: 'Street by street',
        p: [
          'The City of Joondalup has identified Duncraig as a suburb with a low level of tree canopy overall, and has been planting street trees to change that. The trees that do exist are concentrated, and some are big enough to be on the City\'s Significant Tree Register.',
          'Sycamore Drive has 17 London planes, 14 to 18 metres tall, and 12 Hill\'s weeping figs. The planes drop everything in autumn. The Davallia Road median carries 50 lemon-scented gums up to 23 metres tall, which shed bark and leaf through the year. At the northern end, Lilburne Park is about five hectares of banksia, tuart and jarrah woodland, with marri recorded there too.',
          'If you live on or near one of those, your gutters fill. If you are in the middle of a block with a lawn and a lemon tree, they may go two years without trouble.',
        ],
      },
      {
        h: 'No council deadline here',
        p: [
          'The City of Joondalup\'s bushfire notice deals with long grass, firebreaks and overhanging branches. It says nothing about gutters or roofs, and only small pockets of Duncraig are mapped as bush fire prone. The reason to clean gutters in Duncraig is the winter: about 144 mm of rain in an average July, landing on roofs that have been collecting leaf since the previous spring.',
        ],
      },
    ],
    faqs: [
      {
        q: 'How often do Duncraig gutters need cleaning?',
        a: 'Under or beside large trees, once a year before winter. With no trees near the roof, every second year is often enough. The quickest check is to look at the gutters from a first-floor window or the street after a windy week in autumn.',
      },
      {
        q: 'My house is a two-storey rebuild. Is it more expensive?',
        a: 'Yes. Two-storey homes cost more wherever they are, because the work is slower at height and there is usually more gutter. Each one is priced individually, so send an enquiry rather than relying on the single-storey range.',
      },
    ],
    neighbours: ['Kingsley', 'Padbury', 'Warwick'],
    sources: abs('Duncraig (SAL50438)', 'Trees: City of Joondalup Significant Tree Register and Lilburne Park Management Plan. '),
  },
  {
    slug: 'kingsley',
    name: 'Kingsley',
    postcode: '6026',
    sal: 'SAL50764',
    council: 'joondalup',
    group: 'north',
    description:
      'Gutter cleaning in Kingsley 6026: late-1970s and 1980s homes between Lake Goollelal and Shepherds Bush Reserve, with tuart, jarrah, sheoak and flooded gum nearby.',
    lead:
      'Kingsley has a lake on one side and about fifteen hectares of bushland in the middle. Homes near either one have a very different gutter problem from homes that are not.',
    facts: [
      { label: 'Postcode', value: '6026' },
      { label: 'Council', value: 'City of Joondalup' },
      { label: 'Private dwellings', value: '5,118' },
      { label: 'Separate houses', value: '84.3%' },
    ],
    sections: [
      {
        h: 'Built on bushland, around a drive-in',
        p: [
          'Kingsley dates from the late 1970s. The Galaxy Drive-In on Goollelal Drive opened in 1972 in what was then undeveloped bush; the land around it was cleared late in that decade and houses followed in the early 1980s. Part of the drive-in\'s own car park became housing in the 1990s, and so did the old Luisini winery land beside the lake.',
          'About 84 per cent of homes are separate houses and nearly 14 per cent are townhouses or villas, a higher share than most family suburbs in the north.',
        ],
      },
      {
        h: 'Lake Goollelal',
        p: [
          'Lake Goollelal is inside Kingsley. It divides the suburb, leaving a small pocket of houses between the lake and Wanneroo Road. The lake is the southern end of Yellagonga Regional Park, a chain of wetlands running north through Lake Joondalup. The park\'s wetlands are fringed with flooded gum and paperbark, and the management plan records scattered tuarts to the north-east of Lake Goollelal.',
          'Tuart is the big tree of the northern coastal plain. A mature one over a roof sheds leaf, bark and gumnuts in quantity.',
        ],
      },
      {
        h: 'Shepherds Bush Reserve',
        p: [
          'In the middle of the suburb, bounded by Newhaven Place, Barridale Drive and Shepherds Bush Drive, is Shepherds Bush Reserve: around 15 hectares of banksia and jarrah woodland with sheoak and tuart, protected as a Bush Forever site. Houses along its edges live beside real bushland.',
          'Sheoak needles deserve a mention because they behave differently from leaves. They are fine enough to slip through coarse gutter mesh and they knit together into a mat that holds water.',
          'About a third of Kingsley is mapped as bush fire prone, mostly the lake side, though that figure includes the lake and parkland themselves. In March 2025 a fire burned about 25 hectares of Yellagonga Regional Park next door in Woodvale. The City of Joondalup\'s notice does not mention gutters.',
        ],
      },
    ],
    bfp: 'About a third of Kingsley, mostly the lake side, is mapped as bush fire prone.',
    faqs: [
      {
        q: 'Is there a council rule about gutters in Kingsley?',
        a: 'No. The City of Joondalup\'s bushfire notice covers grass height, firebreaks and overhanging vegetation, and does not mention gutters or roofs. Clearing them is still sensible for a house beside the reserve or the regional park, but it is not a stated requirement.',
      },
      {
        q: 'Do you clean gutters on villas and townhouses?',
        a: 'Yes. Send an enquiry with the address of your unit. If the strata wants every roof in the complex done in one visit, say so in your message so it can be priced as one job.',
      },
    ],
    neighbours: ['Duncraig', 'Woodvale', 'Greenwood'],
    sources: abs('Kingsley (SAL50764)', 'Parks: Yellagonga Regional Park Management Plan; inHerit record for Shepherds Bush Reserve. '),
  },
];

export const bySlug: Record<string, Suburb> = Object.fromEntries(suburbs.map((s) => [s.slug, s]));
