// Basecamp UI · PolyForm Noncommercial License 1.0.0 · https://polyformproject.org/licenses/noncommercial/1.0.0


const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ESCAPES[c]);

export const isUnavailable = (stateObj) =>
  !stateObj || stateObj.state === 'unavailable' || stateObj.state === 'unknown';

 
export const stateValue = (store, id) => {
  const s = id ? store.get(id) : null;
  return isUnavailable(s) ? null : s.state;
};

 
export const stateNumber = (store, id) => {
  const v = stateValue(store, id);
  return v === null || v === '' || !Number.isFinite(Number(v)) ? null : Number(v);
};

 
export const pad2 = (n) => String(n).padStart(2, '0');

export function fmtNumber(value, digits = 1) {
  if (value === null || value === undefined || value === '' || !Number.isFinite(Number(value))) return '—';
  return Number(value).toLocaleString('it-IT', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

export const fmtTime = (date) => date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });

export const fmtDate = (date) =>
  date.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });

 
export function fmtWhen(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  const today = new Date().toDateString() === date.toDateString();
  const day = date.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' });
  return today ? fmtTime(date) : `${day} ${fmtTime(date)}`;
}

const RUNNING_PHASES = {
  running: null, run: null, cleaning: null,
  rinsing: 'Risciacquo', spinning: 'Centrifuga', drying: 'Asciugatura', detecting: 'Pesatura carico',
  cooling: 'Raffreddamento', cool_down: 'Raffreddamento', steam_softening: 'Vapore', refreshing: 'Rinfrescatura',
  wrinkle_care: 'Antipiega', returning: 'Rientro alla base',
};

const DISH_PROGRAMS = {
  Auto1: 'Auto 35–45°', Auto2: 'Auto 45–65°', Auto3: 'Auto 65–75°', Eco50: 'Eco 50°', Quick45: 'Rapido 45°', Quick65: 'Rapido 65°',
  Intensiv70: 'Intensivo 70°', Glas40: 'Vetri 40°', PreRinse: 'Prelavaggio', NightWash: 'Notte', Kurz60: 'Breve 60°', MachineCare: 'Pulizia macchina',
};
export const programLabel = (value) => {
  const key = String(value ?? '').split('.').pop();
  return key ? DISH_PROGRAMS[key] ?? key : null;
};

export function runningPhase(stateObj) {
  if (!stateObj) return undefined;
  const value = stateObj.state.split('.').pop().toLowerCase();
  return value in RUNNING_PHASES ? RUNNING_PHASES[value] : undefined;
}

 
export function fmtRemaining(iso, now = Date.now()) {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  const min = Math.ceil((t - now) / 60_000);
  if (min <= 0) return null;
  return min < 60 ? `${min} min` : `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, '0')}`;
}

const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
export const longDay = (d) => d.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
export const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

 
export function dayLabel(d, now) {
  if (sameDay(d, now)) return 'oggi';
  if (sameDay(d, new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1))) return 'domani';
  return longDay(d);
}
