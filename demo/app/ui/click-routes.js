// Basecamp UI · PolyForm Noncommercial License 1.0.0 · https://polyformproject.org/licenses/noncommercial/1.0.0


import { pauseAction } from './actions/pause.js';
import { heatingAction, setOperatingMode } from './actions/climate.js';
import { endAction } from './actions/settings.js';
import { cleanDrawnZone, cleanRooms, robotZone, toggleRoom } from './actions/robot.js';
import { applyPreset, bumpTemperature, moveCovers, pickLightColor, runLightAction, turnOffAll } from './actions/zone.js';
import { intercomCommand } from './actions/intercom.js';
import { connectMass } from './actions/music.js';

export const NEXT = Symbol('next');

const open = (sel, key, initial) => ({ sel, run: (el, sheet) => { sheet[key] = initial(el); return sheet.update(); } });
const close = (sel, key, closed = null) => ({ sel, run: (el, sheet) => { sheet[key] = closed; return sheet.update(); } });
const toggle = (sel, key, valueOf) => ({ sel, run: (el, sheet) => { sheet[key] = valueOf(el, sheet); return sheet.update(); } });

export const CLICK_ROUTES = [
  open('[data-schedule-open]', '_schedule', () => ({ picking: false })),
  close('[data-schedule-close]', '_schedule'),
  {
    sel: '[data-measure-open]',
    run: (el, sheet) => {
      sheet._measure = { id: el.dataset.measureOpen, entity: el.dataset.entity ?? null, period: '24h', metric: null, data: null };
      sheet.reloadMeasure();
      return sheet.update();
    },
  },
  close('[data-measure-close]', '_measure'),
  {
    sel: '[data-measure-period], [data-measure-metric]',
    run: (el, sheet, ev) => {
      if (!sheet._measure) return NEXT;
      const period = ev.target.closest('[data-measure-period]');
      const metric = ev.target.closest('[data-measure-metric]');
      sheet._measure = { ...sheet._measure, period: period?.dataset.measurePeriod ?? sheet._measure.period, metric: metric?.dataset.measureMetric ?? sheet._measure.metric, data: null };
      sheet.reloadMeasure();
      return sheet.update();
    },
  },
  open('[data-pun-open]', '_pun', () => true),
  close('[data-pun-close]', '_pun', false),
  { ...open('[data-call-open]', '_ch', (el) => ({ i: Number(el.dataset.callOpen) })), enabled: true },
  close('[data-call-close]', '_ch'),
  open('[data-auto-air-open]', '_autoAir', () => ({ picking: false })),
  close('[data-auto-air-close]', '_autoAir'),
  { sel: '[data-end]', enabled: true, run: (el, sheet) => endAction(sheet, el.dataset.end) },
  open('[data-heating-open]', '_heating', () => ({})),
  close('[data-heating-close]', '_heating'),
  { sel: '[data-heating]', enabled: true, run: (el, sheet) => heatingAction(sheet, el.dataset.heating) },
  open('[data-cover-auto-open]', '_coverAuto', () => ({ id: null, picking: false })),
  close('[data-cover-auto-close]', '_coverAuto'),
  {
    
    sel: '[data-cover-auto]',
    enabled: true,
    run: (el, sheet) => {
      const { id } = el.dataset;
      if (el.dataset.coverAuto === 'pick') {
        sheet._coverAuto = { id, picking: !(sheet._coverAuto?.picking && sheet._coverAuto.id === id) };
        return sheet.update();
      }
      sheet._coverAuto = { ...sheet._coverAuto, id };
      return pauseAction(sheet, 'coverAuto', el.dataset.coverAuto);
    },
  },
  { sel: '[data-auto-air]', enabled: true, run: (el, sheet) => pauseAction(sheet, 'autoAir', el.dataset.autoAir) },
  { sel: '[data-schedule]', enabled: true, run: (el, sheet) => pauseAction(sheet, 'schedule', el.dataset.schedule) },
  { sel: '[data-zone-open]', run: (el, sheet) => robotZone(sheet).open() },
  { sel: '[data-zone-close]', run: (el, sheet) => sheet._zone?.close() },
  { sel: '[data-zone-clear]', run: (el, sheet) => { sheet._zone?.clear(); return sheet.update(); } },
  { sel: '[data-zone-go]', enabled: true, run: (el, sheet) => cleanDrawnZone(sheet) },
  toggle('[data-rack-tab]', '_rackTab', (el) => el.dataset.rackTab),
  { sel: '[data-st-area]', run: (el, sheet) => { sheet._history.area = el.dataset.stArea || null; return sheet.update(); } },
  {
    sel: '[data-st-period]',
    run: (el, sheet) => {
      sheet._history.period = el.dataset.stPeriod;
      sheet._historyPending = true;
      sheet.stopHistory();
      return sheet.update();
    },
  },
  {
    
    sel: '[data-seen]',
    run: (el, sheet) => {
      const flag = sheet.store.get(el.dataset.seen);
      sheet._missedSince = flag?.state === 'on' ? new Date(flag.last_changed) : null;
      sheet.ctx.services.turnOff(el.dataset.seen).catch(() => {});
      return NEXT;
    },
  },
  
  toggle('[data-pick]', '_pick', (el, sheet) => (el.dataset.pick === sheet._pick ? null : el.dataset.pick || null)),
  { sel: '[data-room]', run: (el, sheet) => toggleRoom(sheet, el.dataset.room) },
  { sel: '[data-clean-rooms]', enabled: true, run: (el, sheet) => cleanRooms(sheet, el) },
  {
    
    sel: '[data-number-set]',
    enabled: true,
    run: (el, sheet) => {
      const [entity, value] = [el.dataset.numberSet, Number(el.dataset.value)];
      sheet._pick = null;
      sheet.update();
      return sheet.ctx.services.setNumber(entity, value).catch(() => {});
    },
  },
  
  { sel: '[data-mode-set]', enabled: true, run: (el, sheet) => setOperatingMode(sheet, el.dataset.modeSet) },
  close('[data-clear-pick]', '_pick'),
  { sel: '[data-temp]', enabled: true, run: (el, sheet) => bumpTemperature(sheet, el.dataset.temp, Number(el.dataset.delta)) },
  { sel: '[data-preset]', enabled: true, run: (el, sheet) => applyPreset(sheet, el) },
  { sel: '[data-cover], [data-covers]', enabled: true, run: (el, sheet) => moveCovers(sheet, el) },
  { sel: '[data-light-action]', enabled: true, run: (el, sheet) => runLightAction(sheet, el.dataset.lightAction, Number(el.dataset.index)) },
  { sel: '[data-ma-connect]', run: (el, sheet) => connectMass(sheet) },
  toggle('[data-printer-cam]', '_printerCam', (el, sheet) => !sheet._printerCam),
  { sel: '[data-intercom]', run: (el, sheet) => intercomCommand(sheet, el.dataset.intercom) },
  toggle('[data-cam-zoom]', '_bigCam', (el) => Number(el.dataset.camZoom)),
  toggle('[data-palette]', '_palette', (el, sheet) => (sheet._palette === el.dataset.palette ? null : el.dataset.palette)),
  { sel: '[data-light-color]', enabled: true, run: (el, sheet) => pickLightColor(sheet, el) },
  { sel: '[data-off-all]', enabled: true, run: (el, sheet) => turnOffAll(sheet, el) },
];

 
export function handleSheetClick(ev, sheet) {
  for (const route of CLICK_ROUTES) {
    const el = ev.target.closest(route.sel);
    if (!el || (route.enabled && el.disabled)) continue;
    if (route.run(el, sheet, ev) !== NEXT) return;
  }
}
