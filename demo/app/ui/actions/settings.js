// Basecamp UI · PolyForm Noncommercial License 1.0.0 · https://polyformproject.org/licenses/noncommercial/1.0.0


import { toHaDatetime } from '../../core/schedules.js';

export function endAction(sheet, action) {
  const cfg = (sheet.model.settings ?? []).find((s) => s.end);
  if (!cfg) return;
  if (action === 'pick') {
    sheet._vacationEnd = { picking: !sheet._vacationEnd?.picking };
    return sheet.update();
  }
  let when;
  if (action === 'clear') when = new Date(2000, 0, 1);
  else {
    when = new Date(sheet.shadowRoot.querySelector('#end-dt')?.value);
    if (Number.isNaN(when.getTime()) || when.getTime() <= Date.now()) return;
  }
  sheet._vacationEnd = { picking: false };
  sheet.ctx.services.setDatetime(cfg.end, toHaDatetime(when)).catch(() => {});
  sheet.update();
}
