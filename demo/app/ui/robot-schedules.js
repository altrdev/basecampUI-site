// Basecamp UI · PolyForm Noncommercial License 1.0.0 · https://polyformproject.org/licenses/noncommercial/1.0.0


import { cap, dayLabel, esc, longDay } from '../core/format.js';
import { featureConfig } from '../core/feature.js';
import { nextRun, scheduleDrift, scheduleState, upcomingRuns } from '../core/schedules.js';
import { featureDialog, infoCard, minDateAhead, openerRow, pauseActions, stateSection, suspendSection } from './feature-dialog.js';

export const ROBOT_SCHEDULES_STYLES = `
  .schedule-week { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 6px; }
  .schedule-day { background: var(--bc-surface); border-radius: 12px; padding: 8px 2px 10px; display: flex; flex-direction: column; align-items: center; gap: 3px; min-width: 0; text-align: center; }
  .schedule-day .d { font-size: 12px; color: var(--bc-text-2); text-transform: uppercase; }
  .schedule-day .n { font: 600 16px var(--bc-font-display); }
  .schedule-day .m { font-size: 11px; line-height: 1.15; color: var(--bc-text-2); min-height: 26px; }
  .schedule-day.skip { opacity: .4; }
  .schedule-day.skip .n { text-decoration: line-through; }
  .schedule-day.skip .schedule-dot { background: var(--bc-text-2); }
  .schedule-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--bc-green); display: inline-block; flex: none; }
  .schedule-dot.w { background: var(--bc-blue); }
  .schedule-open .schedule-dot { margin-left: 8px; vertical-align: 1px; }
  .schedule-legend { display: flex; flex-wrap: wrap; gap: 14px; font-size: 12px; color: var(--bc-text-2); }
  .schedule-legend span { display: inline-flex; align-items: center; gap: 6px; }
  .schedule-drift { margin: 0; padding: 10px 14px; border-radius: var(--bc-radius-inner); font-size: 13px; color: var(--bc-amber); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--bc-amber) 55%, transparent); }
  .schedule-rows { display: flex; flex-direction: column; gap: 6px; }
  .schedule-rows.off { opacity: .5; }
  .schedule-row { background: var(--bc-surface); border-radius: var(--bc-radius-inner); padding: 12px 14px; display: flex; flex-direction: column; gap: 8px; }
  .schedule-row .top { display: flex; align-items: baseline; gap: 14px; }
  .schedule-row .time { font: 600 18px var(--bc-font-display); flex: none; }
  .schedule-row .what { min-width: 0; display: flex; flex-direction: column; gap: 2px; }
  .schedule-row .what b { font-size: 15px; font-weight: 500; }
  .schedule-row .what span { font-size: 13px; color: var(--bc-text-2); }
  .schedule-row .what .schedule-dot { margin-right: 6px; vertical-align: 1px; }
  .schedule-chips { display: flex; flex-wrap: wrap; gap: 4px; }
  .schedule-chips span { font-size: 12px; padding: 3px 8px; border-radius: 999px; color: var(--bc-text-2); border: 1px solid var(--bc-border-strong); }
  .schedule-chips span.on { background: var(--bc-text); border-color: var(--bc-text); color: var(--bc-bg); font-weight: 600; }
  .schedule-row.w .schedule-chips span.on { background: var(--bc-blue); border-color: var(--bc-blue); }
`;

const DOW = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
const ORDER = [1, 2, 3, 4, 5, 6, 0];

 
export function scheduleWatchedIds(robot) {
  return [robot?.schedules?.automation, robot?.schedules?.pause].filter(Boolean);
}

const cfgOf = (robot, store) => featureConfig(store, robot?.schedules, ['automation', 'pause']);

 
export function scheduleRow({ store, robot, now = new Date() }) {
  const cfg = cfgOf(robot, store);
  if (!cfg) return '';
  const state = scheduleState(store, cfg, now);
  const runs = upcomingRuns(cfg, state, now);
  const first = nextRun(cfg, state, now);
  let cls = '';
  let text;
  let plan = null;
  if (!state.available) text = 'Non disponibili';
  else if (!state.on) [cls, text] = ['off', 'Spente'];
  else if (state.until) [cls, text] = ['paused', first ? `In pausa · riprendono ${dayLabel(first.at, now)}` : 'In pausa'];
  else {
    text = first ? `${cap(dayLabel(first.at, now))} ${cfg.time} · ${first.plan.short ?? first.plan.description}` : 'Nessuna in programma';
    plan = first?.plan ?? null;
  }
  return openerRow({ attr: 'data-schedule-open', cls, label: 'Programmazioni', text, trailing: plan ? `<i class="schedule-dot ${plan.wash ? 'w' : ''}"></i>` : '' });
}

 
export function renderScheduleDialog(ui, { store, robot, services, now = new Date() }) {
  const cfg = ui ? cfgOf(robot, store) : null;
  if (!cfg) return '';
  const state = scheduleState(store, cfg, now);
  const runs = upcomingRuns(cfg, state, now);
  const first = nextRun(cfg, state, now);
  const can = state.available && services.canControl(cfg.automation) && services.canControl(cfg.pause);
  const drift = scheduleDrift(store, cfg);
  const dot = (plan) => `<i class="schedule-dot ${plan.wash ? 'w' : ''}"></i>`;

  let next;
  if (!state.available) next = infoCard('off', 'Non disponibili', 'Automazione non raggiungibile');
  else if (!state.on) next = infoCard('off', 'Programmazioni spente', 'Robot non parte da solo', 'Riaccendile con l\'interruttore in alto.');
  else if (state.until) {
    next = infoCard('pause', 'In pausa', first ? `Riprende ${esc(dayLabel(first.at, now))}` : `Riprende dopo ${esc(longDay(state.until))}`, first ? `${esc(cfg.time)} · ${esc(first.plan.description)} · ${esc(first.plan.mode)}` : '');
  } else if (first) {
    next = infoCard('', 'Prossima pulizia', `${esc(cap(dayLabel(first.at, now)))} · ${esc(cfg.time)}`, `${esc(first.plan.description)} · ${esc(first.plan.mode)}`);
  } else next = infoCard('', 'Prossima pulizia', 'Nessuna in programma');

  const week = runs
    .map((r) => `<div class="schedule-day ${r.skipped ? 'skip' : ''}"><span class="d">${DOW[r.at.getDay()]}</span><span class="n num">${r.at.getDate()}</span>${dot(r.plan)}<span class="m">${esc(r.plan.short ?? '')}</span></div>`)
    .join('');

  const rows = (cfg.plans ?? [])
    .map(
      (p) => `
      <div class="schedule-row ${p.wash ? 'w' : ''}">
        <div class="top"><span class="time num">${esc(cfg.time)}</span>
          <div class="what"><b>${esc(p.description)}</b><span>${dot(p)}${esc(p.mode)}${p.details ? ` · ${esc(p.details)}` : ''}</span></div></div>
        <div class="schedule-chips">${ORDER.map((d) => `<span class="${p.days.includes(d) ? 'on' : ''}">${DOW[d]}</span>`).join('')}</div>
      </div>`,
    )
    .join('');

  const acts = pauseActions({
    attr: 'data-schedule', until: state.until, can, enabled: Boolean(can && state.on), picking: ui.picking,
    quick: { action: 'skip', label: 'Salta la prossima' }, dateId: 'schedule-date', dateLabel: 'Riprendono il', minDate: minDateAhead(now, 1),
  });
  const robotName = esc(robot.name ?? 'Robot');
  const weekAndLegend = `
          <div class="schedule-week">${week}</div>
          <div class="schedule-legend"><span>${dot({})}Aspira</span><span>${dot({ wash: true })}Aspira e lava</span><span>Barrato = saltata</span></div>`;
  const weekly = `
        <div class="schedule-sec"><h4>Ogni settimana</h4><div class="schedule-rows ${state.on ? '' : 'off'}">${rows}</div>
          ${drift ? `<p class="schedule-drift">${esc(drift)}</p>` : ''}
          <p class="hint">Giorni e modalità si cambiano in Home Assistant (automazione «Robot programmazione»); qui si accende e si sospende.</p></div>`;
  return featureDialog({
    closeAttr: 'data-schedule-close', label: `Programmazioni di ${robotName}`, title: 'Programmazioni',
    subtitle: `${robotName} parte da solo alle ${esc(cfg.time)}, se è alla base.`,
    body: stateSection({ attr: 'data-schedule', title: 'Prossimi giorni', can, on: state.on, onLabel: 'Attive', offLabel: 'Spente', card: next, after: weekAndLegend })
      + suspendSection(acts) + weekly,
  });
}
