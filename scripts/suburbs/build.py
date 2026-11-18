#!/usr/bin/env python3
"""
Builds src/data/perth-suburbs.json: one record per Perth suburb that gets a
page, with the facts the page is written from.

    pip install shapely
    python scripts/suburbs/build.py

Every number comes from a public source, fetched fresh (and cached in
scripts/suburbs/.cache/, which is gitignored):

  * Suburb, council and postcode boundaries: ABS ASGS 2021 (SAL, LGA, POA),
    from geo.abs.gov.au. A suburb's council and postcode are the ones its
    area overlaps most.
  * Homes and housing mix: ABS 2021 Census, table G36 Dwelling structure, by
    SAL, from the ABS Data API.
  * Coastline, rivers, lakes, parks and reserves: OpenStreetMap (Overpass API).

Which suburbs: every ABS suburb and locality whose area is mostly inside one of
the 30 councils of the Perth metropolitan region and that had at least 100
private dwellings in 2021. That drops airports, industrial estates, national
parks and empty rural localities, which nobody needs a gutter page for. The
locality called "Perth" (the CBD) is left out too: the homepage is the page for
"gutter cleaning Perth" and a second one would compete with it.

Neighbours are suburbs whose boundaries touch for at least 150 m, plus suburbs
facing each other across a river, ordered by how long the shared edge is.
"""
import csv, io, json, math, os, re, sys, urllib.parse, urllib.request
from collections import defaultdict

from shapely import transform as _t  # noqa: F401  (import check)
from shapely.geometry import LineString, Polygon, shape
from shapely.ops import polygonize, unary_union
from shapely.strtree import STRtree

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
CACHE = os.path.join(HERE, '.cache')
OUT = os.path.join(ROOT, 'src', 'data', 'perth-suburbs.json')
os.makedirs(CACHE, exist_ok=True)

BBOX = (115.4, -32.65, 116.45, -31.35)  # lon/lat envelope around the metro region
MIN_HOMES = 100
SKIP = {'Perth', 'Rottnest Island'}

# Council → region shown on the page ("Perth Hills · Kalamunda WA 6076").
METRO = {
    'Joondalup': 'north', 'Wanneroo': 'north', 'Stirling': 'north',
    'Bassendean': 'east', 'Bayswater': 'east', 'Belmont': 'east', 'Swan': 'east',
    'Kalamunda': 'east', 'Mundaring': 'hills',
    'Perth': 'inner', 'Vincent': 'inner', 'Subiaco': 'inner', 'South Perth': 'inner', 'Victoria Park': 'inner',
    'Cambridge': 'western', 'Claremont': 'western', 'Cottesloe': 'western', 'Mosman Park': 'western',
    'Nedlands': 'western', 'Peppermint Grove': 'western',
    'Canning': 'southeast', 'Gosnells': 'southeast', 'Armadale': 'southeast', 'Serpentine-Jarrahdale': 'southeast',
    'Melville': 'south', 'Fremantle': 'south', 'East Fremantle': 'south', 'Cockburn': 'south',
    'Kwinana': 'south', 'Rockingham': 'south',
}
# Suburbs on the Darling Scarp and plateau, whatever their council.
HILLS = {
    'Bickley', 'Carmel', 'Gooseberry Hill', 'Kalamunda', 'Lesmurdie', 'Pickering Brook', 'Walliston',
    'Gidgegannup', 'Roleystone', 'Bedfordale', 'Karragullen', 'Mount Nasura', 'Mount Richon',
    'Martin', 'Jarrahdale',
}

LAT0 = math.radians(-31.95)


def P(lon, lat):
    """Lon/lat to metres on a flat local grid around Perth (good to <1% here)."""
    return (lon * 111320 * math.cos(LAT0), lat * 110540)


def fetch(name, url, data=None):
    path = os.path.join(CACHE, name)
    if not os.path.exists(path):
        print('fetching', name, file=sys.stderr)
        req = urllib.request.Request(url, data=data, headers={'User-Agent': 'suburb-page-builder'})
        with urllib.request.urlopen(req, timeout=600) as r, open(path, 'wb') as f:
            f.write(r.read())
    return path


def abs_layer(layer):
    q = urllib.parse.urlencode({
        'where': '1=1', 'outFields': '*', 'geometry': ','.join(map(str, BBOX)),
        'geometryType': 'esriGeometryEnvelope', 'inSR': 4326, 'spatialRel': 'esriSpatialRelIntersects',
        'outSR': 4326, 'maxAllowableOffset': 0.00015, 'returnGeometry': 'true', 'f': 'geojson',
    })
    path = fetch(f'{layer}.geojson', f'https://geo.abs.gov.au/arcgis/rest/services/ASGS2021/{layer}/MapServer/0/query?{q}')
    out = []
    for f in json.load(open(path, encoding='utf-8'))['features']:
        g = shape(f['geometry'])
        g = g if g.is_valid else g.buffer(0)
        out.append((f['properties'], _proj(g)))
    return out


def _proj(g):
    import shapely
    return shapely.transform(g, lambda c: [P(x, y) for x, y in c])


def best(g, items, key):
    hit, area = None, 0
    for p, h in items:
        if g.intersects(h):
            a = g.intersection(h).area
            if a > area:
                hit, area = p[key], a
    return (hit.strip() if hit else hit), area


def slugify(name):
    return re.sub(r'[^a-z0-9]+', '-', name.lower().replace("'", '')).strip('-')


# ── Boundaries and census ────────────────────────────────────────────────────
sal, lga, poa = abs_layer('SAL'), abs_layer('LGA'), abs_layer('POA')

g36 = fetch('g36.csv', 'https://data.api.abs.gov.au/rest/data/C21_G36_SAL/all?startPeriod=2021&dimensionAtObservation=AllDimensions')
homes = defaultdict(dict)
with open(g36, encoding='utf-8') as f:
    for r in csv.DictReader(f):
        if r['REGION_TYPE'] == 'SAL' and r['STATE'] == '5' and r['SUM'] == 'D' and r['OBS_VALUE']:
            homes[r['REGION']][r['DWTSTRD']] = int(r['OBS_VALUE'])

rows = []
for p, g in sal:
    code = p['sal_code_2021']
    if not code.startswith('5'):
        continue
    council, area = best(g, lga, 'lga_name_2021')
    if council not in METRO or area < 0.5 * g.area:
        continue
    name = re.sub(r' \(WA\)$', '', p['sal_name_2021'])
    rows.append({'name': name, 'sal': 'SAL' + code, 'code': code, 'lga': council,
                 'postcode': best(g, poa, 'poa_code_2021')[0], 'g': g, 'd': homes.get(code, {})})

keep = [r for r in rows if r['d'].get('_T', 0) >= MIN_HOMES and r['name'] not in SKIP]

# ── Neighbours ───────────────────────────────────────────────────────────────
tree = STRtree([r['g'] for r in rows])
for r in keep:
    found = {}
    for buf, min_len in ((30, 150), (150, 300)):  # touching, then across a river
        bb = r['g'].buffer(buf)
        for i in tree.query(bb):
            o = rows[i]
            if o is r or o['name'] in found:
                continue
            shared = bb.intersection(o['g'].buffer(buf)).area / (2 * buf)
            if shared > min_len:
                found[o['name']] = shared
    r['neighbours'] = [n for n, _ in sorted(found.items(), key=lambda x: -x[1])]

# Closest other suburbs with a page, edge to edge, for pages with few
# bordering suburbs of their own (Highgate's other neighbour is the CBD).
for r in keep:
    others = sorted((o for o in keep if o is not r), key=lambda o: r['g'].distance(o['g']))
    r['closest'] = [o['name'] for o in others[:8]]

# ── Coast, rivers, lakes, parks (OpenStreetMap) ─────────────────────────────
s, w, n, e = BBOX[1], BBOX[0], BBOX[3], BBOX[2]
bb = f'({s},{w},{n},{e})'
query = f"""[out:json][timeout:300];(
way["natural"="coastline"]{bb};
way["waterway"="river"]["name"]{bb};
way["natural"="water"]["name"]{bb}; relation["natural"="water"]["name"]{bb};
way["leisure"~"^(park|nature_reserve)$"]["name"]{bb}; relation["leisure"~"^(park|nature_reserve)$"]["name"]{bb};
way["boundary"~"^(national_park|protected_area)$"]["name"]{bb}; relation["boundary"~"^(national_park|protected_area)$"]["name"]{bb};
);out geom;"""
osm = json.load(open(fetch('osm.json', 'https://overpass-api.de/api/interpreter',
                           urllib.parse.urlencode({'data': query}).encode()), encoding='utf-8'))

# Parts of the Swan and Canning that OSM names as separate water bodies.
RIVER_PARTS = {'Melville Water': 'Swan River', 'Perth Water': 'Swan River', 'Shelley Water': 'Canning River'}
SKIP_WATER = {'Administration Bay'}
LAKE_ALIAS = {'Galup': 'Lake Monger'}
# Named "parks" that are not trees: sports grounds, drains, admin areas.
NOT_GREEN = re.compile(r'Unnamed|Management Area|Rail Reserve|Playing Field|Oval|Golf|Sport|Zoo|Other|Marine|'
                       r'Cemetery|School|Racecourse|Showground|Airport|Drain|Buffer|Basin|Compensation|Skate|'
                       r'Dog |Pony|Equestrian|Velodrome|Speedway|Tennis|Bowling|Pavilion|Aquatic|Playground')
BUSH = re.compile(r'National Park|Regional Park|Nature Reserve|Bushland|Bush|Conservation|Forest|Wetland|Woodland|Swamp')


def line(geom):
    return LineString([P(p['lon'], p['lat']) for p in geom]) if geom and len(geom) > 1 else None


coast, rivers, areas = [], [], []
for el in osm['elements']:
    t = el.get('tags', {})
    nm = t.get('name')
    if el['type'] == 'way':
        L = line(el.get('geometry'))
        if L is None:
            continue
        if t.get('natural') == 'coastline':
            coast.append(L)
            continue
        if t.get('waterway') == 'river':
            rivers.append((nm, L))
            continue
        if not L.is_ring:
            continue
        g = Polygon(L.coords).buffer(0)
    else:
        outer = [line(m.get('geometry')) for m in el.get('members', []) if m.get('role') == 'outer' and m['type'] == 'way']
        outer = [o for o in outer if o is not None]
        if not outer:
            continue
        g = unary_union(list(polygonize(unary_union(outer)))).buffer(0)
        if g.is_empty:
            continue
    if t.get('natural') == 'water':
        if nm in SKIP_WATER:
            continue
        kind = 'river' if (nm in RIVER_PARTS or nm.endswith(' River')) else 'lake'
    else:
        kind = 'np' if (t.get('boundary') == 'national_park' or 'National Park' in nm) else 'park'
    areas.append((kind, nm, g))

C = unary_union(coast)
atree = STRtree([a[2] for a in areas])
rtree = STRtree([r[1] for r in rivers])

for r in keep:
    g = r['g']
    gb = g.buffer(60)
    d_coast = g.distance(C)
    r['coast'] = {
        'onCoast': d_coast < 250,
        'coastKm': round(C.intersection(g.buffer(250)).length / 1000, 1) if d_coast < 250 else 0,
        'kmToCoast': round(g.centroid.distance(C) / 1000, 1),
    }
    riv = set()
    for i in rtree.query(gb):
        if rivers[i][1].intersects(gb):
            riv.add(rivers[i][0])
    lakes, parks = {}, {}
    for i in atree.query(gb):
        kind, nm, a = areas[i]
        if not a.intersects(gb):
            continue
        if kind == 'river':
            riv.add(RIVER_PARTS.get(nm, nm))
            continue
        total = a.area / 1e4
        inside = a.intersection(g).area / 1e4
        if kind == 'lake':
            nm = LAKE_ALIAS.get(nm, nm)
            if total >= 3 and (nm not in lakes or total > lakes[nm]['ha']):
                lakes[nm] = {'name': nm, 'ha': round(total), 'insideHa': round(inside)}
            continue
        if NOT_GREEN.search(nm) or total < 4:
            continue
        if inside < 2 and a.intersection(gb).area / 1e4 < 1:
            continue
        if nm not in parks or inside > parks[nm]['insideHa']:
            parks[nm] = {'name': nm, 'ha': round(total), 'insideHa': round(inside),
                         'bush': bool(BUSH.search(nm)) or kind == 'np'}
    r['rivers'] = sorted(x for x in riv if x and not re.search(r'Brook|Creek|Drain', x))
    r['lakes'] = sorted(lakes.values(), key=lambda x: -x['ha'])[:3]
    # Bushland first, then by how much of it is in the suburb.
    r['parks'] = sorted(parks.values(), key=lambda x: (not x['bush'], -max(x['insideHa'], x['ha'] / 10)))[:3]

# ── Write ────────────────────────────────────────────────────────────────────
out = []
for r in sorted(keep, key=lambda x: x['name']):
    d = r['d']
    occ = max(d.get('OCC', 0), 1)
    out.append({
        'slug': slugify(r['name']),
        'name': r['name'],
        'postcode': r['postcode'],
        'sal': r['sal'],
        'council': slugify(r['lga']),
        'councilName': r['lga'],
        'region': 'hills' if r['name'] in HILLS else METRO[r['lga']],
        'homes': d.get('_T', 0),
        'housesPct': round(100 * d.get('11', 0) / occ),
        'townhousesPct': round(100 * d.get('2', 0) / occ),
        'flatsPct': round(100 * d.get('3', 0) / occ),
        'areaKm2': round(r['g'].area / 1e6, 1),
        'coast': r['coast'],
        'rivers': r['rivers'],
        'lakes': r['lakes'],
        'parks': r['parks'],
        'neighbours': r['neighbours'],
        'closest': r['closest'],
    })

slugs = [o['slug'] for o in out]
assert len(slugs) == len(set(slugs)), 'duplicate slug'
with open(OUT, 'w', encoding='utf-8') as f:
    json.dump(out, f, ensure_ascii=False, indent=1)
print(f'wrote {len(out)} suburbs to {os.path.relpath(OUT, ROOT)}')
