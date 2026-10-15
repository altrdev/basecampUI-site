// Basecamp UI · PolyForm Noncommercial License 1.0.0 · https://polyformproject.org/licenses/noncommercial/1.0.0


import { compress, forecast } from './ha-fake.js';
import { musicHandle } from './music.js';

const VERSION = '2026.10.0';

export function haSession(ha, send) {
  const unsubs = [];
  send({ type: 'auth_required', ha_version: VERSION });
  return {
    message(raw) {
      const msg = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (msg.type === 'auth') return send({ type: 'auth_ok', ha_version: VERSION });
      const { id, type } = msg;
      if (type === 'subscribe_entities') {
        send({ id, type: 'result', success: true, result: null });
        send({ id, type: 'event', event: { a: Object.fromEntries(Object.entries(ha.states).map(([k, v]) => [k, compress(v)])) } });
        unsubs.push(ha.onChange((event) => send({ id, type: 'event', event })));
        return;
      }
      if (type === 'weather/subscribe_forecast') {
        send({ id, type: 'result', success: true, result: null });
        return send({ id, type: 'event', event: { type: msg.forecast_type, forecast: forecast(msg.forecast_type) } });
      }
      const fn = ha.handlers[type];
      if (!fn) return send({ id, type: 'result', success: false, error: { code: 'unknown_command', message: `demo: ${type}` } });
      try {
        send({ id, type: 'result', success: true, result: fn(msg) });
      } catch (err) {
        send({ id, type: 'result', success: false, error: { code: 'demo', message: err.message } });
      }
    },
    close: () => unsubs.forEach((u) => u()),
  };
}

export function musicSession(send) {
  send({ server_version: '2.5.0', schema_version: 28, base_url: 'demo' });
  return {
    message(raw) {
      const { message_id, command, args } = typeof raw === 'string' ? JSON.parse(raw) : raw;
      send({ message_id, result: musicHandle(command, args, (event) => send(event)) });
    },
    close() {},
  };
}
