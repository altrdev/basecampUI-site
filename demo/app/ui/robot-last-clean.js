// Basecamp UI · PolyForm Noncommercial License 1.0.0 · https://polyformproject.org/licenses/noncommercial/1.0.0


import { esc, fmtNumber, fmtTime, isUnavailable, stateValue } from '../core/format.js';

export const ULTIMA_STYLES = `
  .last-grid { display: grid; grid-template-columns: repeat(var(--n, 4), 1fr); gap: 6px; }
  .last-grid > div { display: flex; flex-direction: column; gap: 4px; padding: 10px 12px; border-radius: var(--bc-radius-inner); background: var(--bc-surface); min-width: 0; }
  .last-grid .k { font-size: 12px; color: var(--bc-text-2); }
  .last-grid .v { font: 600 17px/1.2 var(--bc-font-display); white-space: nowrap; }
  .last-grid .d { font-size: 12px; color: var(--bc-text-2); }
  .last-map { margin-top: 10px; display: flex; justify-content: center; padding: 10px; border-radius: var(--bc-radius-inner); background: var(--bc-surface); }
  .last-map img { display: block; max-width: 100%; max-height: 340px; object-fit: contain; }
  .last-map.wait { min-height: 120px; align-items: center; color: var(--bc-text-2); font-size: 14px; }
  @media (max-width: 480px) { .last-grid { grid-template-columns: repeat(2, 1fr); } }
`;

let shown = null; 
const cache = new Map(); 

 
async function cropped(url) {
  const img = await new Promise((resolve, reject) => {
    const i = new Image();
    i.crossOrigin = 'anonymous';
    i.onload = () => resolve(i);
    i.onerror = () => reject(new Error('mappa non caricata'));
    i.src = url;
  });
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0);
  const { data } = ctx.getImageData(0, 0, w, h);
  let x1 = w, y1 = h, x2 = -1, y2 = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (data[i + 3] < 8 || (data[i] > 250 && data[i + 1] > 250 && data[i + 2] > 250)) continue;
      if (x < x1) x1 = x;
      if (x > x2) x2 = x;
      if (y < y1) y1 = y;
      if (y > y2) y2 = y;
    }
  }
  if (x2 < 0) return url;
  const pad = 8;
  x1 = Math.max(0, x1 - pad);
  y1 = Math.max(0, y1 - pad);
  x2 = Math.min(w - 1, x2 + pad);
  y2 = Math.min(h - 1, y2 + pad);
  const out = document.createElement('canvas');
  out.width = x2 - x1 + 1;
  out.height = y2 - y1 + 1;
  out.getContext('2d').drawImage(c, x1, y1, out.width, out.height, 0, 0, out.width, out.height);
  return out.toDataURL('image/png');
}

 
const whenCell = (iso) => {
  const d = iso ? new Date(iso) : null;
  if (!d || Number.isNaN(d.getTime())) return ['—', null];
  const [time, day] = [fmtTime(d), d.toDateString() === new Date().toDateString() ? null : d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })];
  return [time, day];
};

const fmtMinutes = (min) => {
  const m = Math.round(Number(min));
  if (!Number.isFinite(m)) return '—';
  return m >= 60 ? `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')} min` : `${m} min`;
};

export const ultimaWatchedIds = (robot) => [robot.map, robot.last_start, robot.last_clean, robot.clean_duration, robot.clean_area].filter(Boolean);

 
export function ultimaSection({ store, robot, hassUrl, refresh, cleaning }) {
  const val = (id) => stateValue(store, id);
  const area = val(robot.clean_area);
  const dur = val(robot.clean_duration);
  if (!robot.map && area === null && dur === null) return '';

  
  const cells = cleaning
    ? [['Stato', 'In corso'], ['Durata', dur !== null ? fmtMinutes(dur) : '—'], ['Area', area !== null ? `${fmtNumber(area, 1)} m²` : '—']]
    : [['Iniziata', ...whenCell(val(robot.last_start))], ['Finita', ...whenCell(val(robot.last_clean))], ['Durata', dur !== null ? fmtMinutes(dur) : '—'], ['Area', area !== null ? `${fmtNumber(area, 1)} m²` : '—']];
  const grid = `<div class="last-grid" style="--n:${cells.length}">${cells.map(([k, v, day]) => `<div><span class="k">${k}</span><span class="v num">${esc(v)}</span>${day ? `<span class="d num">${esc(day)}</span>` : ''}</div>`).join('')}</div>`;

  let map = '';
  const state = robot.map ? store.get(robot.map) : null;
  const picture = state?.attributes?.entity_picture;
  if (picture && !isUnavailable(state)) {
    const key = `${picture}|${state.state}`;
    let entry = cache.get(key);
    if (!entry) {
      entry = { loading: true };
      cache.set(key, entry);
      for (const k of cache.keys()) if (k !== key && cache.size > 3) cache.delete(k);
      cropped(hassUrl(picture)).then((src) => Object.assign(entry, { loading: false, src }), () => Object.assign(entry, { loading: false, error: true })).then(() => refresh?.());
    }
    if (entry.src) shown = entry.src;
    if (shown) map = `<div class="last-map"><img src="${shown}" alt="Mappa con il percorso di Robot"></div>`;
    else if (entry.error) map = '<div class="last-map wait">Mappa non disponibile</div>';
    else map = '<div class="last-map wait">Carico la mappa…</div>';
  }
  return `<section><h3>Ultima pulizia</h3>${grid}${map}</section>`;
}
