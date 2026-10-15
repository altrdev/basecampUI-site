// Basecamp UI · PolyForm Noncommercial License 1.0.0 · https://polyformproject.org/licenses/noncommercial/1.0.0


import { pad2 } from './format.js';
import { switchState } from './feature.js';

 
export const toHaDatetime = (d) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;

 
export function pausedUntil(store, pauseId, now = new Date()) {
  const ts = Number(store.get(pauseId)?.attributes?.timestamp);
  return Number.isFinite(ts) && ts * 1000 > now.getTime() ? new Date(ts * 1000) : null;
}

 
export function scheduleState(store, cfg, now = new Date()) {
  return { ...switchState(store, cfg.automation), until: pausedUntil(store, cfg.pause, now) };
}

 
export function upcomingRuns(cfg, { on, until }, now = new Date(), count = 7, days = 14) {
  const [h, m] = String(cfg.time ?? '13:15').split(':').map(Number);
  const out = [];
  for (let i = 0; i < days && out.length < count; i++) {
    const at = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i, h, m);
    if (at <= now) continue;
    const plan = (cfg.plans ?? []).find((p) => p.days.includes(at.getDay()));
    if (!plan) continue;
    out.push({ at, plan, skipped: !on || Boolean(until && at < until) });
  }
  return out;
}

 
export function nextRun(cfg, state, now = new Date()) {
  return upcomingRuns(cfg, state, now, 120, 120).find((r) => !r.skipped) ?? null;
}

export function pauseTarget(action, cfg, state, now = new Date(), dateValue = '') {
  if (action === 'resume') return now;
  if (action === 'skip') {
    const next = nextRun(cfg, state, now);
    return next ? new Date(next.at.getTime() + 60_000) : null;
  }
  if (action === 'tomorrow') return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  if (action === 'week') return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7);
  if (action === 'date') {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateValue);
    if (!m) return null;
    const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    return d > now ? d : null;
  }
  return null;
}

export function scheduleDrift(store, cfg) {
  const last = store.get(cfg.automation)?.attributes?.last_triggered;
  if (!last) return null;
  const at = new Date(last);
  if (Number.isNaN(at.getTime()) || at.getSeconds() > 1) return null;
  const [h, m] = String(cfg.time ?? '13:15').split(':').map(Number);
  if (at.getHours() !== h || at.getMinutes() !== m) return `L'ultima pulizia automatica è partita alle ${pad2(at.getHours())}:${pad2(at.getMinutes())}, non alle ${cfg.time}: aggiorna l'ora in config.json.`;
  if (!(cfg.plans ?? []).some((p) => p.days.includes(at.getDay()))) return 'L\'ultima pulizia automatica è partita in un giorno che l\'elenco non prevede: aggiorna config.json.';
  return null;
}
