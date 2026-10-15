// Basecamp UI · PolyForm Noncommercial License 1.0.0 · https://polyformproject.org/licenses/noncommercial/1.0.0


const FIXED_HOLIDAYS = ['01-01', '01-06', '04-25', '05-01', '06-02', '08-15', '11-01', '12-08', '12-25', '12-26'];
const ROME = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Rome', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23', weekday: 'short' });

 
function easterMonday(y) {
  const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31), day = ((h + l - 7 * m + 114) % 31) + 1;
  const t = new Date(Date.UTC(y, month - 1, day + 1));
  return `${String(t.getUTCMonth() + 1).padStart(2, '0')}-${String(t.getUTCDate()).padStart(2, '0')}`;
}

 
function romeParts(ts) {
  const out = {};
  for (const p of ROME.formatToParts(new Date(ts))) out[p.type] = p.value;
  return out;
}

 
export function tariffBand(ts) {
  const p = romeParts(ts);
  const md = `${p.month}-${p.day}`;
  if (p.weekday === 'Sun' || FIXED_HOLIDAYS.includes(md) || md === easterMonday(Number(p.year))) return 2;
  const h = Number(p.hour);
  if (p.weekday === 'Sat') return h >= 7 && h < 23 ? 1 : 2;
  if (h >= 8 && h < 19) return 0;
  return (h >= 7 && h < 8) || (h >= 19 && h < 23) ? 1 : 2;
}

 
export function monthKey(ts) {
  const p = romeParts(ts);
  return `${p.year}-${p.month}`;
}

const SPIKE_KWH = 15; 

export function kwhPerBand(rows, { k = 1, from = -Infinity, to = Infinity } = {}) {
  const byMonth = {};
  const total = [0, 0, 0];
  for (const r of rows ?? []) {
    const kwh = r.change;
    if (!(r.start >= from && r.start < to) || !(kwh > 0) || kwh > SPIKE_KWH) continue;
    const f = tariffBand(r.start);
    const m = (byMonth[monthKey(r.start)] ??= [0, 0, 0]);
    m[f] += kwh * k;
    total[f] += kwh * k;
  }
  return { byMonth, total };
}

const sum = (a) => a.reduce((s, x) => s + x, 0);

 
export function bandPrices(t, pun) {
  if (t.type === 'fixed') {
    const p = t.price ?? {};
    const mono = p.mono ?? p.f1;
    return [p.f1 ?? mono, p.f2 ?? mono, p.f3 ?? mono].map((x) => x + (t.cdispd ?? 0));
  }
  return pun.map((x) => x * (1 + (t.losses ?? 0)) + (t.spread ?? 0) + (t.cdispd ?? 0));
}

export function estimateBill(cfg, t, kwh, pun) {
  const tot = sum(kwh);
  const prices = bandPrices(t, pun);
  const energy = kwh.reduce((s, x, i) => s + x * prices[i], 0);
  const r = cfg.network ?? {};
  const kw = cfg.power_kw ?? 3;
  const fixedFees = (t.fixed_fee_month ?? 0) + (cfg.capd_month ?? 0);
  const network =
    tot * ((r.transport_kwh ?? 0) + (r.uc3_kwh ?? 0) + (r.uc6_kwh ?? 0)) + (r.fixed_fee_month ?? 0) + kw * ((r.power_fee_kw_month ?? 0) + (r.uc6_kw_month ?? 0));
  const charges = tot * ((cfg.charges?.asos_kwh ?? 0) + (cfg.charges?.arim_kwh ?? 0));
  const excise = tot * (cfg.excise_kwh ?? 0);
  const taxable = energy + fixedFees + network + charges + excise;
  const vat = taxable * (cfg.vat ?? 0.1);
  return { kwh: tot, energy, fixedFees, network, charges, excise, vat, total: taxable + vat, medio: tot > 0 ? (taxable + vat) / tot : null };
}

 
export function weightedPun(months) {
  let num = 0, den = 0;
  for (const m of months) {
    for (let i = 0; i < 3; i++) {
      num += (m.kwh?.[i] ?? 0) * (m.pun?.[i] ?? 0);
      den += m.kwh?.[i] ?? 0;
    }
  }
  return den > 0 ? num / den : null;
}

export function breakeven(t, alt, months) {
  const kwhYear = sum(months.flatMap((m) => m.kwh ?? []));
  const tot = [0, 0, 0];
  for (const m of months) m.kwh?.forEach((x, i) => (tot[i] += x));
  if (kwhYear <= 0) return null;
  const p = alt.price ?? {};
  const mono = p.mono ?? p.f1;
  const fixedPrice = ((p.f1 ?? mono) * tot[0] + (p.f2 ?? mono) * tot[1] + (p.f3 ?? mono) * tot[2]) / kwhYear;
  const quote = (((alt.fixed_fee_month ?? 0) - (t.fixed_fee_month ?? 0)) * 12) / kwhYear;
  return (fixedPrice + quote - (t.spread ?? 0) - ((t.cdispd ?? 0) - (alt.cdispd ?? 0))) / (1 + (t.losses ?? 0));
}

 
export function monthProjection(actual, dailyAverage, now = new Date()) {
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const days = Math.max(0, (end - now) / 86_400_000);
  return actual.map((x, i) => x + (dailyAverage[i] ?? 0) * days);
}

const ARERA_KEYS = ['asos_kwh', 'arim_kwh', 'accise_kwh', 'iva', 'perdite', 'cdispd', 'trasporto_kwh', 'uc3_kwh', 'uc6_kwh', 'quota_fissa_mese', 'quota_potenza_kw_mese', 'uc6_kw_mese'];

export function applyAreraTariff(cfg, attrs) {
  const ok = attrs && ARERA_KEYS.every((k) => attrs[k] !== null && attrs[k] !== '' && Number.isFinite(Number(attrs[k])));
  if (!cfg || !ok) return { cfg, data: null };
  const n = (k) => Number(attrs[k]);
  return {
    data: attrs.valido_al ?? null,
    cfg: {
      ...cfg,
      network: { ...cfg.network, transport_kwh: n('trasporto_kwh'), uc3_kwh: n('uc3_kwh'), uc6_kwh: n('uc6_kwh'), fixed_fee_month: n('quota_fissa_mese'), power_fee_kw_month: n('quota_potenza_kw_mese'), uc6_kw_month: n('uc6_kw_mese') },
      charges: { ...cfg.charges, asos_kwh: n('asos_kwh'), arim_kwh: n('arim_kwh') },
      excise_kwh: n('accise_kwh'),
      vat: n('iva'),
      tariff: { ...cfg.tariff, losses: n('perdite'), cdispd: n('cdispd') },
      alternative: cfg.alternative && { ...cfg.alternative, cdispd: n('cdispd') },
    },
  };
}
