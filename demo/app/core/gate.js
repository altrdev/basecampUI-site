// Basecamp UI · PolyForm Noncommercial License 1.0.0 · https://polyformproject.org/licenses/noncommercial/1.0.0


import { isUnavailable } from './format.js';

export const SEEN_FRESH_MS = 10 * 60_000;

export function gateSeen(store, sensor, now = Date.now()) {
  const st = store.get(sensor);
  const checked = Date.parse(st?.attributes?.controllato_alle ?? '');
  const fresh = Number.isFinite(checked) && now - checked <= SEEN_FRESH_MS;
  const known = !isUnavailable(st) && fresh && (st.state === 'aperto' || st.state === 'chiuso');
  const state = known ? st.state : 'incerto';
  const since = known && st.attributes.ultimo_stato_certo === state ? Date.parse(st.attributes.da) : NaN;
  return { sensor, state, since: Number.isFinite(since) ? since : null, checked: fresh ? checked : null };
}

 
export function fmtSpan(ms) {
  const min = Math.floor(ms / 60_000);
  if (min < 1) return 'poco';
  if (min < 60) return `${min} min`;
  if (min < 24 * 60) return `${Math.floor(min / 60)} h`;
  return `${Math.floor(min / (24 * 60))} g`;
}

export const MOVE_MS = 60_000;
const moves = {};
const listeners = new Set();
const notify = () => listeners.forEach((fn) => fn());

export const gateMoves = {
  start(id, seen) {
    if (!seen || seen.state === 'incerto') return;
    moves[id] = { from: seen.state, base: seen.checked ?? 0, at: Date.now() };
    setTimeout(notify, MOVE_MS + 200);
    notify();
  },
  clear(id) {
    if (moves[id]) {
      delete moves[id];
      notify();
    }
  },
   
  label(id, seen) {
    const mv = moves[id];
    if (!mv) return null;
    const done = seen && seen.state !== 'incerto' && (seen.checked ?? 0) > mv.base && seen.state !== mv.from;
    if (done || Date.now() - mv.at > MOVE_MS) {
      delete moves[id];
      return null;
    }
    return { aperto: 'In chiusura…', chiuso: 'In apertura…' }[mv.from];
  },
   
  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};
