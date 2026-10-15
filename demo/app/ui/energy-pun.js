// Basecamp UI · PolyForm Noncommercial License 1.0.0 · https://polyformproject.org/licenses/noncommercial/1.0.0


import { icon } from './base.js';
import { cap, esc, fmtNumber, stateNumber } from '../core/format.js';
import { applyAreraTariff, tariffBand, kwhPerBand, monthKey, breakeven, monthProjection, weightedPun, estimateBill } from '../core/energy-bill.js';

export const PUN_STYLES = `
  .e-tile.pun { width: 100%; text-align: left; cursor: pointer; }
  .e-tile.pun:active { background: var(--bc-border); }
  .e-tile.pun .k .chev { margin-left: auto; width: 18px; height: 18px; }
  .pun-bands { display: flex; flex-wrap: wrap; gap: 4px 14px; font-size: 12px; color: var(--bc-text-2); }
  .pun-bands span.on { color: var(--bc-text); font-weight: 600; }
  .pun-bands span.on::before { content: ''; display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: var(--bc-violet); margin-right: 5px; vertical-align: 1px; }
  .pun-bands b { color: var(--bc-text); font-weight: 500; font-variant-numeric: tabular-nums; }
  .pun-threshold { display: flex; flex-direction: column; gap: 6px; padding-top: 8px; border-top: 1px solid var(--bc-border); }
  .pun-scale { position: relative; margin: 20px 0 22px; }
  .pun-track { position: relative; display: flex; height: 22px; border-radius: 11px; overflow: hidden; }
  .pun-track span { display: block; }
  .pun-track .r { flex: 1; }
  .pun-zones { display: flex; justify-content: space-between; gap: 10px; font-size: 11px; color: var(--bc-text-2); }
  .pun-zones i { display: inline-block; width: 9px; height: 9px; border-radius: 3px; margin-right: 5px; vertical-align: -1px; }
  .pun-tick { position: absolute; top: -2px; width: 2px; height: 26px; background: var(--bc-text); opacity: .55; transform: translateX(-1px); }
  .pun-pin { position: absolute; top: 3px; width: 16px; height: 16px; border-radius: 50%; transform: translateX(-8px); background: var(--bc-text); box-shadow: 0 0 0 3px var(--bc-surface); }
  .pun-pin.ring { background: var(--bc-surface); border: 2px solid var(--bc-text); box-sizing: border-box; box-shadow: none; }
  .pun-lbl { position: absolute; font-size: 11px; line-height: 1.2; color: var(--bc-text-2); white-space: nowrap; transform: translateX(-50%); font-variant-numeric: tabular-nums; }
  .pun-lbl b { color: var(--bc-text); font-weight: 500; }
  .pun-lbl.up { bottom: 100%; margin-bottom: 7px; }
  .pun-lbl.dn { top: 100%; margin-top: 7px; }
  .zdlg.pun { width: min(640px, 100%); }
  .pun-total { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; flex-wrap: wrap; background: var(--bc-surface); border-radius: var(--bc-radius-inner); padding: 14px 16px; }
  .pun-total .v { font: 600 32px/1.1 var(--bc-font-display); font-variant-numeric: tabular-nums; }
  .pun-total .v small { font-size: 14px; font-weight: 400; color: var(--bc-text-2); }
  .pun-total .s { font-size: 13px; color: var(--bc-text-2); }
  .pun-rows { display: flex; flex-direction: column; background: var(--bc-surface); border-radius: var(--bc-radius-inner); padding: 4px 16px; }
  .pun-rows div { display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; font-size: 15px; border-top: 1px solid var(--bc-border); }
  .pun-rows div:first-child { border-top: 0; }
  .pun-rows b { font-weight: 500; font-variant-numeric: tabular-nums; }
  .pun-rows .sub { font-size: 13px; color: var(--bc-text-2); }
  .pun-cells { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6px; }
  .pun-cells span { background: var(--bc-surface); border-radius: 12px; padding: 8px 4px 10px; display: flex; flex-direction: column; align-items: center; gap: 2px; font-size: 12px; color: var(--bc-text-2); }
  .pun-cells b { font: 600 16px var(--bc-font-display); color: var(--bc-text); font-variant-numeric: tabular-nums; }
  .pun-chart { background: var(--bc-surface); border-radius: var(--bc-radius-inner); padding: 12px 14px 10px; }
  .pun-chart svg { display: block; width: 100%; height: 110px; }
  .pun-chart .mm { display: grid; grid-template-columns: repeat(12, 1fr); font-size: 10px; color: var(--bc-text-2); text-align: center; margin-top: 4px; }
  .pun-note { margin: 0; font-size: 13px; color: var(--bc-text-2); }
  .pun-note.ok { color: var(--bc-green); }
  .pun-note.warn { color: var(--bc-amber); }
  .pun-note.alert { color: var(--bc-red); }
  @media (max-width: 480px) { .pun-cells { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
`;

const DAY = 86_400_000;
const eur = (v, d = 0) => (v === null || v === undefined || !Number.isFinite(v) ? '—' : `${fmtNumber(v, d)} €`);
const kwhFmt = (v) => fmtNumber(v, 0);
const price = (v) => fmtNumber(v, 3);

export const punWatchedIds = (e) => Object.values(e?.pun ?? {}).filter((id) => typeof id === 'string');

export function loadPunStats(conn, model, onData, now = new Date()) {
  const e = model.energy ?? {};
  const b = e.bill;
  if (!b || !e.pun || !e.imported_total) return;
  const last = b.history?.at(-1)?.month;
  const [y, m] = last ? last.split('-').map(Number) : [now.getFullYear(), now.getMonth()];
  const start = new Date(Math.min(new Date(y, m, 1).getTime(), now.getTime() - 15 * DAY));
  const stats = (ids, period, types) =>
    conn.sendMessagePromise({ type: 'recorder/statistics_during_period', start_time: start.toISOString(), statistic_ids: ids, period, types, units: { energy: 'kWh' } });
  const punIds = [e.pun.f1, e.pun.f2, e.pun.f3];
  Promise.all([stats([e.imported_total], 'hour', ['change']), stats(punIds, 'day', ['mean'])])
    .then(([imp, pun]) => {
      const k = b.meter_calibration ?? 1;
      const rows = imp[e.imported_total] ?? [];
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
      const actual = kwhPerBand(rows, { k, from: monthStart }).total;
      const recent = kwhPerBand(rows, { k, from: now.getTime() - 14 * DAY }).total;
      const covered = rows.length ? Math.min(14, (now.getTime() - Math.max(rows[0].start, now.getTime() - 14 * DAY)) / DAY) : 0;
      const dailyAverage = covered >= 1 ? recent.map((x) => x / covered) : null;
      
      const kwhMonths = kwhPerBand(rows, { k, to: monthStart }).byMonth;
      const months = [];
      for (const [key, kwh] of Object.entries(kwhMonths)) {
        if (last && key <= last) continue;
        const pm = punIds.map((id) => [...(pun[id] ?? [])].filter((p) => monthKey(p.start) === key && p.mean > 0).sort((a, c) => a.start - c.start).at(-1)?.mean);
        if (pm.every((x) => x > 0)) months.push({ month: key, kwh, pun: pm });
      }
      onData({ actual, dailyAverage, months });
    })
    .catch(() => {});
}

 
function punModel({ store, model, ui, now = new Date() }) {
  const e = model.energy ?? {};
  const base = e.bill;
  if (!base || !e.pun) return null;
  
  const { cfg: b, data: areraData } = applyAreraTariff(base, store.get(e.arera_tariff)?.attributes);
  const read = (id) => stateNumber(store, id);
  const pun = [read(e.pun.f1), read(e.pun.f2), read(e.pun.f3)];
  const mono = read(e.pun.mono);
  const have = pun.every((x) => x !== null);
  
  const fc = e.pun.current ? String(store.get(e.pun.current)?.state ?? '') : '';
  const currentBand = /^F[123]$/.test(fc) ? Number(fc[1]) - 1 : tariffBand(now.getTime());
  const key = monthKey(now.getTime());
  
  const extra = ui.energy?.pun?.months ?? [];
  const all = new Map();
  for (const m of [...(b.history ?? []), ...extra]) if (m.month < key) all.set(m.month, m);
  const months = [...all.values()].sort((a, c) => (a.month < c.month ? -1 : 1)).slice(-12);
  const media12 = weightedPun(months);
  const tot = [0, 1, 2].map((i) => months.reduce((s, m) => s + (m.kwh?.[i] ?? 0), 0));
  const kwh12 = tot.reduce((s, x) => s + x, 0);
  const weights = kwh12 > 0 ? tot.map((x) => x / kwh12) : [1 / 3, 1 / 3, 1 / 3];
  const currentMonth = have ? pun.reduce((s, x, i) => s + x * weights[i], 0) : null;
  const threshold = b.alternative ? breakeven(b.tariff, b.alternative, months) : null;
  return { e, b, base, areraData, historyMonths: new Set((base.history ?? []).map((x) => x.month)), pun, mono, have, currentBand, months, media12, weights, currentMonth, threshold, key, st: ui.energy?.pun ?? null };
}

 
function estimateMonth(m, now, t = m.b.tariff, delta = 0) {
  if (!m.have || !m.st?.actual) return null;
  const media = m.st.dailyAverage;
  const forecast = media ? monthProjection(m.st.actual, media, now) : m.st.actual;
  const pun = m.pun.map((x) => x * (1 + delta));
  return { actual: m.st.actual, forecast, month: estimateBill(m.b, t, forecast, pun), soFar: estimateBill(m.b, t, m.st.actual, pun) };
}

 
export function punCard(args) {
  const now = args.now ?? new Date();
  const m = punModel({ ...args, now });
  if (!m) return '';
  const { b, threshold, media12, currentMonth } = m;
  const name = cap(now.toLocaleDateString('it-IT', { month: 'long' }));
  if (!m.have) {
    return `<div class="e-tile wide"><span class="k">${icon('mdi:chart-line')}PUN · ${esc(name)}</span><div class="s">Prezzi del GME non disponibili</div></div>`;
  }
  const alt = b.alternative;
  let line = '';
  if (threshold !== null && media12 !== null && alt) {
    const margin = media12 - threshold;
    const near = Math.abs(margin) < threshold * 0.1;
    let tone, text;
    if (alt.active) {
      [tone, text] = margin < 0 ? ['alert', `Sotto la soglia: ${b.tariff.name} sarebbe costato meno`] : near ? ['warn', 'Vicino alla soglia'] : ['ok', `${alt.name} sta rendendo`];
    } else {
      [tone, text] = margin <= 0 ? ['ok', `${b.tariff.name} costa meno di ${alt.name}`] : near ? ['warn', `Vicino alla soglia di ${alt.name}`] : ['warn', `${alt.name} costerebbe meno`];
    }
    
    const lo = threshold * 0.5, hi = threshold * 2.1;
    const at = (v) => Math.min(100, Math.max(0, ((v - lo) / (hi - lo)) * 100));
    const lbl = (v) => Math.min(86, Math.max(14, at(v)));
    const left = alt.active ? 'var(--bc-red)' : 'var(--bc-green)';
    const right = alt.active ? 'var(--bc-green)' : 'var(--bc-amber)';
    line = `<div class="pun-threshold">
      <div class="pun-scale" aria-hidden="true">
        <div class="pun-track">
          <span style="width:${at(threshold).toFixed(1)}%;background:color-mix(in srgb, ${left} 26%, transparent)"></span>
          <span class="r" style="background:color-mix(in srgb, ${right} 26%, transparent)"></span>
        </div>
        <i class="pun-tick" style="left:${at(threshold).toFixed(1)}%"></i>
        ${currentMonth === null ? '' : `<i class="pun-pin ring" style="left:${at(currentMonth).toFixed(1)}%"></i>`}
        <i class="pun-pin" style="left:${at(media12).toFixed(1)}%"></i>
        <span class="pun-lbl up" style="left:${lbl(media12).toFixed(1)}%">ultimi 12 mesi <b>${price(media12)}</b></span>
        <span class="pun-lbl dn" style="left:${lbl(threshold).toFixed(1)}%">pareggio <b>${price(threshold)}</b></span>
        ${currentMonth === null ? '' : `<span class="pun-lbl dn" style="left:${Math.min(86, Math.max(lbl(currentMonth), at(threshold) + 24)).toFixed(1)}%">oggi <b>${price(currentMonth)}</b></span>`}
      </div>
      <div class="pun-zones"><span><i style="background:${left}"></i>${esc(b.tariff.name.split(' ').pop())} costa meno</span><span><i style="background:${right}"></i>Il fisso costa meno</span></div>
      <span class="s ${tone}">${esc(text)}</span></div>`;
  }
  return `<button class="e-tile wide pun" data-pun-open aria-label="PUN di ${esc(name)} e stima della bolletta">
    <span class="k">${icon('mdi:chart-line')}PUN · ${esc(name)}${icon('mdi:chevron-right', 'icon chev')}</span>
    <div class="e-fc"><span class="v">${price(currentMonth)} <small>€/kWh sui tuoi consumi</small></span></div>
    <div class="pun-bands">${[0, 1, 2].map((i) => `<span${i === m.currentBand ? ' class="on" title="Fascia in corso"' : ''}>F${i + 1} <b>${price(m.pun[i])}</b></span>`).join('')}</div>
    ${line}
  </button>`;
}

 
export function renderPunDialog(open, args) {
  if (!open) return '';
  const now = args.now ?? new Date();
  const m = punModel({ ...args, now });
  if (!m) return '';
  const { b, threshold } = m;
  const name = now.toLocaleDateString('it-IT', { month: 'long' });
  
  const raiOf = (month) => (b.rai_fee?.months?.includes(month) ? b.rai_fee.month ?? 0 : 0);
  const rai = raiOf(now.getMonth() + 1);
  const est = estimateMonth(m, now);
  const alt = b.alternative && est ? estimateMonth(m, now, b.alternative) : null;
  const lo = est ? estimateMonth(m, now, b.tariff, -0.1) : null;
  const hi = est ? estimateMonth(m, now, b.tariff, 0.1) : null;

  let top;
  if (!m.have) top = '<p class="pun-note">Prezzi del GME non disponibili.</p>';
  else if (!est) top = '<p class="pun-note">Calcolo dei consumi del mese…</p>';
  else {
    const s = est.month;
    top = `<div class="pun-total"><span class="v">${eur(s.total + rai)} <small>stima di ${esc(name)}</small></span>
        <span class="s">${kwhFmt(est.actual.reduce((a, c) => a + c, 0))} kWh finora · ${kwhFmt(s.kwh)} previsti</span></div>
      <div class="pun-rows">
        <div><span>Energia</span><b>${eur(s.energy, 2)}</b></div>
        <div><span>Quote fisse</span><b>${eur(s.fixedFees, 2)}</b></div>
        <div><span>Rete e potenza</span><b>${eur(s.network, 2)}</b></div>
        <div><span>Oneri di sistema</span><b>${eur(s.charges, 2)}</b></div>
        <div><span>Accise</span><b>${eur(s.excise, 2)}</b></div>
        <div><span>IVA ${fmtNumber((b.vat ?? 0.1) * 100, 0)}%</span><b>${eur(s.vat, 2)}</b></div>
        <div><span>${rai ? 'Totale bolletta' : '<b>Totale</b>'}</span><b>${eur(s.total, 2)}</b></div>
        ${rai ? `<div><span>Canone RAI <span class="sub">fuori da IVA</span></span><b>${eur(rai, 2)}</b></div><div><span><b>Totale da pagare</b></span><b>${eur(s.total + rai, 2)}</b></div>` : ''}
      </div>
      <p class="pun-note">Se il PUN finisse il mese 10% più basso o più alto: da <b>${eur(lo.month.total + rai)}</b> a <b>${eur(hi.month.total + rai)}</b>.${alt ? ` Con ${esc(b.alternative.name)} sarebbe <b>${eur(alt.month.total + rai)}</b> (${alt.month.total <= s.total ? '−' : '+'}${eur(Math.abs(s.total - alt.month.total))}).` : ''}</p>`;
  }

  
  const prevKey = monthKey(new Date(now.getFullYear(), now.getMonth() - 1, 15).getTime());
  const prev = m.months.find((x) => x.month === prevKey);
  let prevBlock = '';
  if (prev) {
    
    const pc = m.historyMonths.has(prevKey) ? m.base : b;
    const sp = estimateBill(pc, pc.tariff, prev.kwh, prev.pun);
    const sa = pc.alternative ? estimateBill(pc, pc.alternative, prev.kwh, prev.pun) : null;
    const prevRai = raiOf(Number(prevKey.slice(5)));
    const prevName = cap(new Date(`${prevKey}-15`).toLocaleDateString('it-IT', { month: 'long' }));
    prevBlock = `<div class="schedule-sec"><h4>Mese scorso</h4><div class="pun-rows">
        <div><span>${esc(prevName)} <span class="sub">${kwhFmt(sp.kwh)} kWh · ${esc(b.tariff.name)}</span></span><b>${eur(sp.total + prevRai, 2)}</b></div>
        ${sa ? `<div><span class="sub">Con ${esc(b.alternative.name)}</span><b>${eur(sa.total + prevRai, 2)}</b></div>` : ''}
      </div><p class="pun-note">Stima con i dati del mese chiuso, da confrontare con il totale da pagare in bolletta${prevRai ? ` (compreso il canone RAI di ${eur(prevRai, 2)})` : ''}.</p></div>`;
  }

  const cells = m.have
    ? `<div class="pun-cells"><span>F1<b>${price(m.pun[0])}</b></span><span>F2<b>${price(m.pun[1])}</b></span><span>F3<b>${price(m.pun[2])}</b></span><span>Monorario<b>${price(m.mono)}</b></span></div>
       <p class="pun-note">€/kWh, media del mese finora (si assesta a fine mese). Sui tuoi consumi: <b>${price(m.currentMonth)}</b>.</p>`
    : '';

  
  let trend = '';
  if (m.months.length && threshold !== null) {
    const vals = m.months.map((x) => weightedPun([x]));
    const max = Math.max(...vals, threshold) * 1.1;
    const W = 480, H = 110, step = W / 12;
    const Y = (v) => H - 4 - (v / max) * (H - 10);
    const bars = vals.map((v, i) => `<rect x="${(i * step + step * 0.18).toFixed(1)}" y="${Y(v).toFixed(1)}" width="${(step * 0.64).toFixed(1)}" height="${(H - 4 - Y(v)).toFixed(1)}" rx="3" fill="${v < threshold ? 'var(--bc-green)' : 'var(--bc-blue)'}" opacity=".75"/>`).join('');
    const lbl = m.months.map((x) => `<span>${esc(new Date(`${x.month}-15`).toLocaleDateString('it-IT', { month: 'short' }).replace('.', '').slice(0, 3))}</span>`).join('');
    
    const cost = (tariffKey) => m.months.reduce((s, x) => { const pc = m.historyMonths.has(x.month) ? m.base : b; return s + estimateBill(pc, pc[tariffKey], x.kwh, x.pun).total; }, 0);
    const cf = cost('tariff'), ca = b.alternative ? cost('alternative') : null;
    const diff = ca === null ? null : cf - ca;
    trend = `<div class="pun-chart"><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">
        ${bars}<line x1="0" x2="${W}" y1="${Y(threshold).toFixed(1)}" y2="${Y(threshold).toFixed(1)}" stroke="var(--bc-amber)" stroke-width="1.5" stroke-dasharray="5 4" vector-effect="non-scaling-stroke"/>
      </svg><div class="mm" style="grid-template-columns:repeat(${m.months.length},1fr)">${lbl}</div></div>
      <p class="pun-note">PUN medio mese per mese sui tuoi consumi (azzurro; verde = sotto il pareggio <b>${price(threshold)}</b>, linea ambra). Media degli ultimi ${m.months.length} mesi: <b>${price(m.media12)}</b> €/kWh.</p>
      ${diff === null ? '' : `<p class="pun-note ${diff > 0 ? 'warn' : 'ok'}">Con gli stessi consumi, in questi mesi ${esc(b.tariff.name)} sarebbe costato <b>${eur(cf)}</b> e ${esc(b.alternative.name)} <b>${eur(ca)}</b>: ${diff > 0 ? `il fisso fa risparmiare ${eur(diff)}` : `${esc(b.tariff.name)} fa risparmiare ${eur(-diff)}`} (IVA e accise comprese; il canone RAI è uguale con entrambe).</p>`}`;
  }

  return `
    <div class="zdlg-overlay">
      <div class="zdlg-backdrop" data-pun-close></div>
      <div class="zdlg schedule pun" role="dialog" aria-modal="true" aria-label="PUN e bolletta">
        <div class="zdlg-head">
          <div class="t"><h3>Bolletta di ${esc(name)}</h3><p>Stima con la tariffa ${esc(b.tariff.name)} e il PUN del mese.</p></div>
          <button class="zclose" data-pun-close aria-label="Chiudi">${icon('mdi:close')}</button>
        </div>
        <div class="schedule-sec">${top}</div>
        ${prevBlock}
        <div class="schedule-sec"><h4>PUN del mese</h4>${cells}</div>
        ${trend ? `<div class="schedule-sec"><h4>Soglia di pareggio</h4>${trend}</div>` : ''}
        <p class="pun-note">PUN: GME (integrazione pun_sensor). Consumi: contatore dell'inverter con correzione ${fmtNumber(b.meter_calibration ?? 1, 2)}. Rete, oneri e accise: ${m.areraData ? `ARERA (Portale Offerte, file del ${esc(new Date(m.areraData).toLocaleDateString('it-IT'))})` : 'bolletta di settembre 2026, da aggiornare ogni trimestre'}.</p>
      </div>
    </div>`;
}
