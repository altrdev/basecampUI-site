// Basecamp UI · PolyForm Noncommercial License 1.0.0 · https://polyformproject.org/licenses/noncommercial/1.0.0


import { initialStates, registry } from './fixture.js';

const romeParts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Rome', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' });
export const hourOf = (ms) => { const [h, m] = romeParts.format(ms).split(':').map(Number); return h + m / 60; };
const bell = (h, peak, from = 7, to = 18) => (h <= from || h >= to ? 0 : peak * Math.sin(((h - from) / (to - from)) * Math.PI) ** 1.4);

function value(states, id, ms) {
  const cur = Number(states[id]?.state ?? NaN);
  const h = hourOf(ms);
  const wobble = Math.sin(ms / 2.1e6) * 0.04 + 1;
  if (/solar_power|production/.test(id)) return bell(h, 4200) * wobble;
  if (/home_power|consumption/.test(id)) return 380 + 260 * Math.sin((h - 6) / 24 * 2 * Math.PI) ** 2 + (h > 18 && h < 22 ? 700 : 0) + (h > 11.5 && h < 13.5 ? 500 : 0);
  if (/outdoor_temperature/.test(id)) return 9 + 9 * Math.max(0, Math.sin(((h - 7) / 16) * Math.PI)) + (wobble - 1) * 5;
  if (/pressure/.test(id)) return 1014 + 3 * Math.sin(ms / 8e6);
  if (/_temperature$/.test(id) && Number.isFinite(cur)) return cur + 0.8 * Math.sin(((h - 9) / 24) * 2 * Math.PI) + (wobble - 1) * 4;
  return Number.isFinite(cur) ? cur * wobble : 0;
}

function statistics(states, { start_time, statistic_ids, period }) {
  const step = period === 'day' ? 86_400_000 : period === 'week' ? 7 * 86_400_000 : period === 'month' ? 30 * 86_400_000 : period === '5minute' ? 300_000 : 3_600_000;
  const out = {};
  const from = Math.floor(new Date(start_time).getTime() / step) * step;
  for (const id of statistic_ids ?? []) {
    const total = /yield|import|export|energy/.test(id);
    let sum = 0;
    out[id] = [];
    for (let t = from; t < Date.now(); t += step) {
      const v = total
        ? (period === 'hour' && /grid_import_total/.test(id) ? 0.12 + 0.34 * Math.max(0, Math.sin(((hourOf(t) - 15) / 9) * Math.PI)) + (hourOf(t) < 6 ? 0.1 : 0)
          : period === 'hour' ? Math.max(0, value(states, 'solar_power', t) / 1000)
          : id.includes('yield') ? 12 + Math.sin(t / 3e8) * 5 : id.includes('export') ? 6 + Math.sin(t / 2e8) * 3 : 3 + Math.sin(t / 2.5e8) * 1.5)
        : value(states, id, t);
      sum += total ? v : 0;
      out[id].push({ start: t, end: t + step, mean: total ? null : v, min: total ? null : v * 0.96, max: total ? null : v * 1.05, change: total ? v : null, sum: total ? sum : null, state: total ? sum : null });
    }
  }
  return out;
}

function history(states, { start_time, entity_ids }) {
  const out = {};
  const from = new Date(start_time).getTime();
  for (const id of entity_ids ?? []) {
    out[id] = [];
    for (let t = from; t < Date.now(); t += 600_000) out[id].push({ s: String(Math.round(value(states, id, t) * 10) / 10), a: {}, lu: t / 1000 });
  }
  return out;
}

export function forecast(type) {
  const hourly = type === 'hourly';
  const conds = ['partlycloudy', 'sunny', 'sunny', 'cloudy', 'partlycloudy', 'rainy', 'cloudy'];
  return Array.from({ length: hourly ? 24 : 7 }, (_, i) => {
    const t = Date.now() + (hourly ? i * 3_600_000 : i * 86_400_000);
    const h = hourOf(t);
    return {
      datetime: new Date(t).toISOString(), condition: hourly ? (h < 6 || h > 19 ? 'clear-night' : conds[Math.floor(i / 4) % 5]) : conds[i],
      temperature: hourly ? Math.round(10 + 8 * Math.max(0, Math.sin(((h - 7) / 16) * Math.PI))) : 19 - i, templow: hourly ? undefined : 10 - i * 0.5,
      precipitation: hourly ? 0 : i === 5 ? 6 : 0, precipitation_probability: hourly ? 5 : i === 5 ? 80 : 10, wind_speed: 8 + (i % 4) * 2, wind_bearing: 220,
    };
  });
}

export const compress = (st) => ({ s: st.state, a: st.attributes, c: { id: '0', parent_id: null, user_id: null }, lc: Date.now() / 1000, lu: Date.now() / 1000 });
const asList = (v) => (Array.isArray(v) ? v : typeof v === 'string' ? v.split(',').map((x) => x.trim()) : []).filter(Boolean);

export function createHA() {
  const states = initialStates;
  const listeners = new Set(); 

  function patch(id, state, attrs = {}) {
    const st = states[id];
    if (!st) return;
    if (state !== undefined) st.state = String(state);
    Object.assign(st.attributes, attrs);
    const change = { '+': { s: st.state, a: attrs, lu: Date.now() / 1000 } };
    for (const fn of listeners) fn({ c: { [id]: change } });
  }

  
  function callService(domain, service, data = {}, target = {}) {
    const ids = [...asList(data.entity_id), ...asList(target?.entity_id)];
    const unavailable = () => { throw new Error('Demo: questo comando è disattivato'); };
    if (!ids.length) return unavailable();
    for (const id of ids) {
      const st = states[id];
      if (!st) return unavailable();
      const on = st.state === 'on';
      if (domain === 'light' && ['turn_on', 'turn_off', 'toggle'].includes(service)) {
        const next = service === 'toggle' ? !on : service === 'turn_on';
        const bright = data.brightness ?? (data.brightness_pct != null ? Math.round(data.brightness_pct * 2.55) : null);
        patch(id, next ? 'on' : 'off', next ? { brightness: bright ?? st.attributes.brightness ?? 180, color_mode: 'brightness' } : { brightness: null, color_mode: null });
      } else if (domain === 'cover' && ['open_cover', 'close_cover', 'set_cover_position', 'stop_cover'].includes(service)) {
        if (service === 'stop_cover') continue;
        const pos = service === 'open_cover' ? 100 : service === 'close_cover' ? 0 : Number(data.position ?? 0);
        patch(id, pos > 0 ? 'open' : 'closed', { current_position: pos });
      } else if (domain === 'climate' && service === 'set_temperature') {
        const t = Number(data.temperature);
        const cur = Number(st.attributes.current_temperature);
        patch(id, undefined, { temperature: t, hvac_action: st.state === 'off' ? 'off' : t > cur ? 'heating' : 'idle' });
      } else if (['switch', 'input_boolean'].includes(domain) && ['turn_on', 'turn_off', 'toggle'].includes(service)) {
        patch(id, (service === 'toggle' ? !on : service === 'turn_on') ? 'on' : 'off');
      } else return unavailable();
    }
    return { context: { id: '0' } };
  }

  const handlers = {
    ping: () => ({ type: 'pong' }),
    supported_features: () => ({}),
    get_config: () => ({ latitude: 45.5, longitude: 9.2, elevation: 120, unit_system: { length: 'km', temperature: '°C' }, location_name: 'Casa Aurora', time_zone: 'Europe/Rome', version: '2026.10.0', language: 'it', components: [] }),
    'auth/current_user': () => ({ id: 'demo', name: 'Anna', is_owner: true, is_admin: true }),
    get_states: () => Object.values(states),
    'config/area_registry/list': () => registry.areas,
    'config/device_registry/list': () => registry.devices,
    'config/entity_registry/list': () => registry.entities,
    'config/label_registry/list': () => registry.labels,
    'config/entity_registry/get': (m) => ({ ...(registry.entities.find((e) => e.entity_id === m.entity_id) ?? {}), options: m.entity_id === 'vacuum.robot' ? { vacuum: { area_mapping: { living: [1], bath: [2], master: [3], kids: [4], office: [5] } } } : {} }),
    'recorder/statistics_during_period': (m) => statistics(states, m),
    'history/history_during_period': (m) => history(states, m),
    'frontend/get_system_data': (m) => ({ value: m.key === 'basecamp' ? { ma_token: 'demo' } : null }),
    'frontend/set_system_data': () => null,
    'energy/get_prefs': () => ({ energy_sources: [], device_consumption: [] }),
    'energy/solar_forecast': () => ({}),
    call_service: (m) => callService(m.domain, m.service, m.service_data, m.target),
    subscribe_events: () => null,
    unsubscribe_events: () => null,
  };

  return { states, registry, handlers, callService, patch, onChange: (fn) => (listeners.add(fn), () => listeners.delete(fn)) };
}
