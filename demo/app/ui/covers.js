// Basecamp UI · PolyForm Noncommercial License 1.0.0 · https://polyformproject.org/licenses/noncommercial/1.0.0


import { isUnavailable } from '../core/format.js';
import { coverSection, isShadeClass } from './zone.js';
import { coverAutoSection } from './cover-automations.js';

export const isCoverOpen = (st) => !isUnavailable(st) && (st.attributes.current_position ?? (st.state === 'closed' ? 0 : 100)) > 0;

 
export function coversSubtitle({ store, model }) {
  const total = model.covers.length;
  if (!total) return '';
  const open = model.covers.filter((id) => isCoverOpen(store.get(id))).length;
  return open === 0 ? 'Tutte chiuse' : open === total ? 'Tutte aperte' : `${open} ${open === 1 ? 'aperta' : 'aperte'} su ${total}`;
}

export function renderCovers({ store, model, services, ui = {} }) {
  if (!model.covers.length) return '<p class="placeholder">Nessuna tapparella o tenda nelle zone.</p>';
  const s = (id) => store.get(id);
  const can = (id) => id && services.canControl(id) && !isUnavailable(s(id));
  const isShade = (id) => isShadeClass(s(id)?.attributes.device_class);
  return [
    coverSection('Tende', model.covers.filter(isShade), { s, can, model, ui, presets: ui.shadePresets }),
    coverAutoSection({ store, model }),
    coverSection('Tapparelle', model.covers.filter((id) => !isShade(id)), { s, can, model, ui, presets: ui.coverPresets }),
  ].join('');
}
