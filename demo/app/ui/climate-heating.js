// Basecamp UI · PolyForm Noncommercial License 1.0.0 · https://polyformproject.org/licenses/noncommercial/1.0.0


import { cap, esc, pad2 } from '../core/format.js';
import { featureConfig, switchState } from '../core/feature.js';
import { featureDialog, featureSection, infoCard, noteSection, openerRow, stateSection } from './feature-dialog.js';

export const HEATING_STYLES = `
  .heating-times { display: flex; flex-wrap: wrap; gap: 10px; }
  .heating-times label { flex: 1; min-width: 130px; display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: var(--bc-text-2); }
  .heating-times input { min-height: var(--bc-touch); padding: 0 12px; border-radius: 12px; border: 1px solid var(--bc-border); background: var(--bc-bg); color: var(--bc-text); font: 600 18px var(--bc-font-display); font-variant-numeric: tabular-nums; }
`;

 
function secs(st) {
  const ts = Number(st?.attributes?.timestamp);
  return Number.isFinite(ts) ? ts : null;
}
const hhmm = (s) => `${pad2(Math.floor(s / 3600))}:${pad2(Math.floor((s % 3600) / 60))}`;

 
export function heatingState(store, cfg, now = new Date()) {
  const { available, on } = switchState(store, cfg.switch);
  const a = secs(store.get(cfg.start));
  const b = secs(store.get(cfg.end));
  const valid = a !== null && b !== null && a !== b;
  const t = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  const inside = valid && (a < b ? t >= a && t < b : t >= a || t < b);
  
  let next = null;
  if (valid) {
    const target = inside ? b : a;
    next = { label: inside ? 'si spegne' : 'si accende', at: hhmm(target), tomorrow: target <= t };
  }
  return { available, on, start: a === null ? null : hhmm(a), end: b === null ? null : hhmm(b), valid, inside, next };
}

export const heatingWatchedIds = (climate) => [climate?.heating?.switch, climate?.heating?.start, climate?.heating?.end, climate?.heat_pump?.mode].filter(Boolean);

const cfgOf = (climate, store) => featureConfig(store, climate?.heating, ['switch', 'start', 'end'], climate);

 
export function heatingSection({ store, climate, now = new Date() }) {
  const cfg = cfgOf(climate, store);
  if (!cfg) return '';
  const s = heatingState(store, cfg, now);
  let cls = '';
  let text;
  if (!s.available) text = 'Non disponibile';
  else if (!s.on) [cls, text] = ['off', 'Manuale'];
  else text = s.valid ? `Programmato · ${s.start}–${s.end}` : 'Programmato · orari da controllare';
  const button = openerRow({ attr: 'data-heating-open', cls, label: 'Riscaldamento programmato', text });
  return featureSection('Riscaldamento programmato', button, s.on ? 'Accende e spegne le zone negli orari scelti.' : 'Le zone le gestisci tu: gli orari non hanno effetto.');
}

 
export function renderHeatingDialog(ui, { store, climate, services, now = new Date() }) {
  const cfg = ui ? cfgOf(climate, store) : null;
  if (!cfg) return '';
  const s = heatingState(store, cfg, now);
  const can = s.available && services.canControl(cfg.switch);
  const canTimes = services.canControl(cfg.start) && services.canControl(cfg.end);

  let next;
  if (!s.available) next = infoCard('off', 'Non disponibile', 'Selettore non raggiungibile');
  else if (!s.on) next = infoCard('off', 'Manuale', 'Le zone le gestisci tu', 'Gli orari non hanno effetto finché non accendi il programma.');
  else if (!s.next) next = infoCard('pause', 'Orari da controllare', 'Partenza e fine devono essere diverse');
  else next = infoCard('', s.inside ? 'Acceso' : 'Spento', `${cap(s.next.label)} ${s.next.tomorrow ? 'domani ' : ''}alle ${esc(s.next.at)}`);

  const times = `
        <div class="schedule-sec"><h4>Orari</h4>
          <div class="heating-times">
            <label>Partenza<input type="time" id="heating-start" value="${esc(s.start ?? '06:00')}" ${canTimes ? '' : 'disabled'}></label>
            <label>Fine<input type="time" id="heating-end" value="${esc(s.end ?? '22:00')}" ${canTimes ? '' : 'disabled'}></label>
          </div>
          <div class="schedule-acts"><button class="primary" ${canTimes ? 'data-heating="save"' : 'disabled'}>Salva orari</button></div>
        </div>`;
  return featureDialog({
    closeAttr: 'data-heating-close', label: 'Riscaldamento programmato', title: 'Riscaldamento programmato',
    subtitle: 'Le zone si accendono alla partenza e si spengono alla fine.',
    body: stateSection({ attr: 'data-heating', can, on: s.on, onLabel: 'Programmato', offLabel: 'Manuale', card: next })
      + times
      + noteSection('Vale per le sei zone e non tocca le loro temperature. Accendendo «Programmato» fuori dalla fascia le zone si spengono subito. In vacanza il programma continua e le zone vanno a 19 °C: scaldano solo se la stanza scende sotto i 19 °C. Se hai impostato una data di fine, la mattina del giorno prima, alla partenza del programma, tornano le temperature normali.'),
  });
}
