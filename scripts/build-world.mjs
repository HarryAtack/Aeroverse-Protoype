// Builds simplified land + border paths (Natural Earth via world-atlas, public domain)
// projected to Web Mercator "world pixel" space at zoom 0 (256 × 256).
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { feature, mesh } from 'topojson-client';
const require = createRequire(import.meta.url);
const res = process.argv[2] ?? "50m";
const PR = Number(process.argv[3] ?? 20);
const land = require(`world-atlas/land-${res}.json`);
const countries = require('world-atlas/countries-110m.json');
const P = (lon, lat) => {
  const x = ((lon + 180) / 360) * 256;
  const s = Math.sin((Math.max(-85, Math.min(85, lat)) * Math.PI) / 180);
  const y = (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * 256;
  return [x, y];
};
const ringToPath = (ring) => {
  let d = '', px = null, py = null;
  ring.forEach(([lon, lat], i) => {
    const [x, y] = P(lon, lat);
    const rx = Math.round(x * PR) / PR, ry = Math.round(y * PR) / PR;
    if (i && rx === px && ry === py) return;
    d += (i === 0 ? 'M' : 'L') + rx + ' ' + ry;
    px = rx; py = ry;
  });
  return d + 'Z';
};
const lineToPath = (line) => line.map(([lon, lat], i) => { const [x, y] = P(lon, lat); return (i ? 'L' : 'M') + (Math.round(x * 100) / 100) + ' ' + (Math.round(y * 100) / 100); }).join('');
const clipRing = (pts, [x0, y0, x1, y1]) => {
  const edges = [
    (p) => p[0] >= x0, (p) => p[0] <= x1, (p) => p[1] >= y0, (p) => p[1] <= y1,
  ];
  const inter = (a, b, k) => {
    const [ax, ay] = a, [bx, by] = b;
    if (k < 2) { const x = k === 0 ? x0 : x1; const t = (x - ax) / (bx - ax); return [x, ay + t * (by - ay)]; }
    const y = k === 2 ? y0 : y1; const t = (y - ay) / (by - ay); return [ax + t * (bx - ax), y];
  };
  let out = pts;
  edges.forEach((inside, k) => {
    const input = out; out = [];
    for (let i = 0; i < input.length; i++) {
      const cur = input[i], prev = input[(i + input.length - 1) % input.length];
      if (inside(cur)) { if (!inside(prev)) out.push(inter(prev, cur, k)); out.push(cur); }
      else if (inside(prev)) out.push(inter(prev, cur, k));
    }
  });
  return out;
};
const ptsToPath = (pts) => { let d=''; let px, py; pts.forEach(([x,y],i)=>{ const rx=Math.round(x*100)/100, ry=Math.round(y*100)/100; if(i&&rx===px&&ry===py) return; d+=(i?'L':'M')+rx+' '+ry; px=rx; py=ry; }); return d+'Z'; };
const lf = feature(land, land.objects.land);
let landD = '';
for (const f of lf.features) {
  const g = f.geometry;
  const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
  for (const poly of polys) for (const ring of poly) if (ring.length > 3) landD += ringToPath(ring);
}
const borders = mesh(countries, countries.objects.countries, (a, b) => a !== b);
const bD = borders.coordinates.map(lineToPath).join('');
let detailD = '';
if (process.argv[4]) {
  const hi = require('world-atlas/land-10m.json');
  const [a0, b0] = P(-11, 59.5), [a1, b1] = P(10, 48.5);
  const box = [a0, b0, a1, b1];
  const hf = feature(hi, hi.objects.land);
  for (const f of hf.features) {
    const g = f.geometry; const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
    for (const poly of polys) for (const ring of poly) {
      const pts = ring.map(([lon, lat]) => P(lon, lat));
      // decimate: keep points at least 0.02 px apart (~ 300 m)
      const dec = []; let last;
      for (const q of pts) { if (!last || Math.hypot(q[0]-last[0], q[1]-last[1]) > 0.02) { dec.push(q); last = q; } }
      const c = clipRing(dec, box);
      if (c.length > 3) detailD += ptsToPath(c);
    }
  }
}
fs.writeFileSync('src/components/map/worldPaths.ts', `// AUTO-GENERATED from Natural Earth (public domain) via world-atlas. Web Mercator, zoom-0 pixel space.\nexport const LAND_PATH = ${JSON.stringify(landD)};\nexport const BORDER_PATH = ${JSON.stringify(bD)};\n/** Higher-detail European coastline (Natural Earth 10m, clipped). */\nexport const EUROPE_DETAIL_PATH = ${JSON.stringify(detailD)};\n`);
console.log('land', landD.length, 'borders', bD.length, 'detail', detailD.length);
