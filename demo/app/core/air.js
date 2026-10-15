// Basecamp UI · PolyForm Noncommercial License 1.0.0 · https://polyformproject.org/licenses/noncommercial/1.0.0


export const EAQI_PM25 = [
  [5, 'buona', '#8CC79A'], [15, 'discreta', '#C9D26A'], [50, 'moderata', '#E8C23D'],
  [90, 'scadente', '#E8A33D'], [140, 'molto scadente', '#EF8A6F'], [Infinity, 'pessima', '#B57AD6'],
];

const VOC_LABELS = [['meglio del solito', '#8CC79A'], ['nella norma', '#C9D26A'], ['peggio del solito', '#E8A33D'], ['molto peggio del solito', '#EF8A6F']];
const vocScaleFrom = (limits) => VOC_LABELS.map(([label, color], i) => [limits[i] ?? Infinity, label, color]);
export const VOC_INDEX = Object.assign(vocScaleFrom([79, 150, 250]), { badge: 300 });

const VOC_DAYS = 7, VOC_MIN_HOURS = 48, VOC_TTL = 6 * 3600_000;
const vocUsual = new Map(); 

 
export const vocScale = (id) => vocUsual.get(id)?.scale;

 
export function ensureVocUsual(conn, id, onChange) {
  if (!conn || !id) return;
  const c = vocUsual.get(id);
  if (c?.waiting) return void (c.waiting.includes(onChange) || c.waiting.push(onChange));
  if (c && Date.now() - c.at < VOC_TTL) return;
  const entry = { at: Date.now(), scale: c?.scale, waiting: [onChange] };
  vocUsual.set(id, entry);
  conn
    .sendMessagePromise({
      type: 'recorder/statistics_during_period',
      start_time: new Date(Date.now() - VOC_DAYS * 86_400_000).toISOString(),
      statistic_ids: [id],
      period: 'hour',
      types: ['mean'],
    })
    .then((res) => {
      const m = (res[id] ?? []).map((p) => p.mean).filter(Number.isFinite).sort((x, y) => x - y);
      if (m.length < VOC_MIN_HOURS) return void (entry.scale = VOC_INDEX);
      const q = (p) => m[Math.min(m.length - 1, Math.floor(p * m.length))];
      entry.scale = Object.assign(vocScaleFrom([q(0.25), q(0.75), q(0.95)]), { badge: 1.25 * q(0.95), typical: [q(0.25), q(0.75)] });
    })
    .catch(() => {
      entry.scale ??= VOC_INDEX;
    })
    .finally(() => {
      const waiting = entry.waiting;
      entry.waiting = null;
      waiting.forEach((fn) => fn());
    });
}

 
export const airBand = (scale, v) => (v === null || v === undefined || !Number.isFinite(v) ? null : scale.find(([max]) => v <= max));

 
export function airBandPos(scale, v, top) {
  const band = airBand(scale, v);
  if (!band) return null;
  const i = scale.indexOf(band);
  const lo = i ? scale[i - 1][0] : 0, hi = band[0] === Infinity ? Math.max(v, top) : band[0];
  return Math.min(99, ((i + Math.min(1, Math.max(0, (v - lo) / (hi - lo)))) / scale.length) * 100);
}

 
export function airValue(store, id) {
  const st = id ? store.get(id) : null;
  const v = st && !['unavailable', 'unknown', ''].includes(st.state) ? Number(st.state) : NaN;
  return Number.isFinite(v) ? v : null;
}

export function airBadge(store, air) {
  if (!air) return null;
  const pm = airValue(store, air.pm25), voc = airValue(store, air.voc);
  if (pm !== null && pm > 50) return [pm > 90 ? 'red' : 'amber', 'mdi:air-filter', 'Polveri alte'];
  const limit = vocScale(air.voc)?.badge;
  if (voc !== null && limit && voc > limit) return [voc > 1.25 * limit ? 'red' : 'amber', 'mdi:air-filter', 'Aria viziata'];
  return null;
}
