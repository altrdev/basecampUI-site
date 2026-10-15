// Basecamp UI · PolyForm Noncommercial License 1.0.0 · https://polyformproject.org/licenses/noncommercial/1.0.0


import { BcElement, icon } from './base.js';
import { esc } from '../core/format.js';
import { gateMoves } from '../core/gate.js';
import { VMC_STYLES, renderVmc, vmcWatchedIds } from './vmc.js';
import { SETTINGS_STYLES, settingsWatchedIds, renderSettings } from './settings.js';
import { APPLIANCES_STYLES, appliancesWatchedIds, renderAppliances } from './appliances.js';
import { CLIMATE_STYLES, climateWatchedIds, renderClimate } from './climate.js';
import { ensureVocUsual } from '../core/air.js';
import { ZONE_STYLES, renderZone, zoneSubtitle, zoneWatchedIds } from './zone.js';
import { renderCovers, coversSubtitle } from './covers.js';
import { COVER_AUTO_STYLES, coverAutoWatchedIds, renderCoverAutoDialog } from './cover-automations.js';
import { pauseAction } from './actions/pause.js';
import { INTERCOM_STYLES, intercomAction, intercomWatchedIds, mountIntercom, renderCallDialog, renderIntercom } from './intercom.js';
import { ALERT_ROW_STYLES, MISSED_CALL_STYLES, alertRow, renderMissedCall } from './bc-alerts.js';
import { alertsWatchedIds, computeAlerts } from '../core/alerts.js';
import { SECURITY_STYLES, mountCameras, stopPlayer, renderSecurity, securityWatchedIds } from './security.js';
import { WEATHER_STYLES, loadWeather, weatherWatchedIds, renderWeather, scrubWeather } from './weather.js';
import { ENERGY_STYLES, energyWatchedIds, loadEnergy, renderEnergy, scrubEnergy } from './energy.js';
import { PUN_STYLES, renderPunDialog } from './energy-pun.js';
import { MEASURES_STYLES, loadMeasure, renderMeasureDialog, scrubMeasure } from './weather-readings.js';
import { LAB_STYLES, labWatchedIds, mountPrinterCamera, renderLab } from './lab.js';
import { RACK_STYLES, rackWatchedIds, renderRack } from './rack.js';
import { ROBOT_STYLES, renderRobot, robotWatchedIds, robotZoneControls } from './robot.js';
import { ROBOT_ZONE_STYLES, renderZoneDialog } from './robot-zone.js';
import { ROBOT_SCHEDULES_STYLES, renderScheduleDialog } from './robot-schedules.js';
import { renderAutoAirDialog } from './climate-auto-air.js';
import { HEATING_STYLES, renderHeatingDialog } from './climate-heating.js';
import { FEATURE_DIALOG_STYLES } from './feature-dialog.js';
import { handleSheetClick } from './click-routes.js';
import { MUSIC_STYLES, MusicView, musicSubtitle, renderMusic } from './music.js';
import { HISTORY_STYLES, isNumericEntity, loadHistory, renderHistory, scrubChart, historyWatchedIds } from './history.js';
import { MENU_STYLES, MENU_TITLES, menuWatchedIds, loadCarHistory, renderMenu, renderCar, renderPlants, renderWifi } from './menu.js';

const INTERCOM_IDLE_MS = 2 * 60_000;
const INTERCOM_TALK_IDLE_MS = 5 * 60_000;

const ESCAPE_CLOSES = [['_measure', null], ['_pun', false], ['_heating', null], ['_ch', null], ['_autoAir', null], ['_coverAuto', null], ['_schedule', null]];

class BcSheet extends BcElement {
  static styles = `
    
    .overlay { position: fixed; inset: 0; z-index: 10; display: flex; overscroll-behavior: contain; }
    .overlay.side { justify-content: flex-end; }
    .overlay.modal { align-items: center; justify-content: center; padding: 16px; }
    .backdrop { position: absolute; inset: 0; background: rgb(8 8 10 / .62); touch-action: none; }
    .panel {
      position: relative; display: flex; flex-direction: column; background: var(--bc-sheet);
      width: min(var(--w), 100vw);
    }
    .side .panel {
      height: 100%; border-left: 1px solid var(--bc-border); box-shadow: -24px 0 48px rgb(0 0 0 / .45);
    }
    .modal .panel {
      max-height: calc(100vh - 32px); border: 1px solid var(--bc-border); border-radius: 24px;
      box-shadow: 0 24px 64px rgb(0 0 0 / .5);
    }
    .head { display: flex; align-items: flex-start; gap: 12px; padding: 28px 28px 14px; touch-action: none; }
    .titles { flex: 1; display: flex; flex-direction: column; gap: 4px; min-width: 0; }
    .eyebrow { font-size: 13px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: var(--bc-text-2); }
    .titles h2 { margin: 0; font: 600 30px/1.15 var(--bc-font-display); }
    .modal .titles h2 { font-size: 26px; }
    .modal.small .titles { align-items: center; }
    .modal.small .titles h2 { font-size: 24px; }
    .titles .sub { font-size: 15px; color: var(--bc-text-2); }
    .close, .round {
      width: 48px; height: 48px; flex: none; display: grid; place-items: center; border-radius: 14px;
      border: 1px solid var(--bc-border-strong); background: var(--bc-surface);
    }
    .body { flex: 1; overflow-y: auto; overscroll-behavior: contain; padding: 8px 28px calc(28px + var(--bc-kbd-h, 0px)); display: flex; flex-direction: column; gap: 22px; }
    h3 { margin: 0 0 12px; font-size: 13px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: var(--bc-text-2); }
    ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
    li {
      display: flex; align-items: center; gap: 12px; min-height: var(--bc-touch); padding: 8px 12px;
      border-radius: var(--bc-radius-inner); background: var(--bc-surface); font-size: 14px;
    }
    li .name { flex: 1; }
    li.action { padding: 0; }
    li.action button {
      display: flex; align-items: center; gap: 12px; width: 100%; min-height: var(--bc-touch);
      padding: 8px 12px; border-radius: var(--bc-radius-inner);
    }
    li.action button:not(:disabled):active { background: var(--bc-border); }
    li.action button:disabled { cursor: default; }
    .on { color: var(--bc-amber); }
    .alert { color: var(--bc-red); }
    .ok { color: var(--bc-green); }
    @media (max-width: 600px) {
      .head { padding: 20px 16px 12px; }
      .body { padding: 4px 16px 24px; }
      .modal { padding: 12px; }
    }
    ${MENU_STYLES}
    ${VMC_STYLES}
    ${SETTINGS_STYLES}
    ${APPLIANCES_STYLES}
    ${CLIMATE_STYLES}
    ${HEATING_STYLES}
    ${ROBOT_STYLES}
    ${ROBOT_ZONE_STYLES}
    ${FEATURE_DIALOG_STYLES}
    ${COVER_AUTO_STYLES}
    ${ROBOT_SCHEDULES_STYLES}
    ${MUSIC_STYLES}
    ${HISTORY_STYLES}
    ${LAB_STYLES}
    ${RACK_STYLES}
    ${WEATHER_STYLES}
    ${ENERGY_STYLES}
    ${PUN_STYLES}
    ${MEASURES_STYLES}
    ${SECURITY_STYLES}
    ${ALERT_ROW_STYLES}
    .alerts-all { display: flex; flex-direction: column; gap: 8px; }
    .alerts-all .alert-row { min-height: 56px; padding: 8px 14px; border-radius: var(--bc-radius-inner); background: var(--bc-surface); }
    .alerts-all .alert-row .t, .alerts-all .alert-row .d { white-space: normal; }
    .alerts-ok { display: flex; align-items: center; gap: 10px; font-size: 16px; color: var(--bc-green); }
    ${INTERCOM_STYLES}
    ${MISSED_CALL_STYLES}
    ${ZONE_STYLES}
  `;

  constructor() {
    super();
    this._targets = {};
    this._rooms = [];
    this._coverTargets = {};
    this._tempTimers = {};
    this._history = { q: '', area: null, period: '24h', data: null };
    
    this.shadowRoot.addEventListener('pointerdown', () => this.armIntercomTimer());
    this.shadowRoot.addEventListener('input', (ev) => {
      this._music?.input(ev);
      if (ev.target.id === 'st-q') {
        this._history.q = ev.target.value;
        this.update();
      }
    });
    
    for (const type of ['pointerdown', 'pointermove']) {
      this.shadowRoot.addEventListener(type, (ev) => {
        if (this._route?.id !== 'storico' || !ev.target.closest?.('[data-st-plot]')) return;
        clearTimeout(this._scrubTimer);
        scrubChart(ev, this._history.data, this.store.get(this._route.entity)?.attributes.unit_of_measurement);
      });
    }
    
    
    const PLOTS = '[data-st-plot], [data-m-plot], [data-e-plot], [data-g-plot]';
    const hideScrub = (plot) => {
      clearTimeout(this._scrubTimer);
      for (const el of plot.querySelectorAll('.st-cursor, .st-dot, .st-tip, .m-cursor, .m-dot, .m-tip, .e-cursor, .e-dot, .e-tip, .g-cursor, .g-dot, .g-tip')) el.style.display = 'none';
    };
    const hideAllScrubs = () => this.shadowRoot.querySelectorAll(PLOTS).forEach(hideScrub);
    
    this.shadowRoot.addEventListener('scroll', () => this._scrubDown || hideAllScrubs(), { capture: true, passive: true });
    this.shadowRoot.addEventListener('pointerdown', (ev) => {
      this._scrubDown = Boolean(ev.target.closest?.(PLOTS));
      if (!this._scrubDown) hideAllScrubs();
    });
    for (const type of ['pointerup', 'pointercancel']) this.shadowRoot.addEventListener(type, () => (this._scrubDown = false));
    this.shadowRoot.addEventListener('pointerout', (ev) => {
      if (ev.pointerType !== 'mouse') return;
      const plot = ev.target.closest?.(PLOTS);
      if (plot && !plot.contains(ev.relatedTarget)) hideScrub(plot);
    });
    this.shadowRoot.addEventListener('pointercancel', (ev) => {
      const plot = ev.target.closest?.(PLOTS);
      if (plot) hideScrub(plot);
    });
    
    for (const type of ['pointerdown', 'pointermove']) {
      this.shadowRoot.addEventListener(type, (ev) => {
        if (this._route?.name !== 'meteo' || !ev.target.closest?.('[data-m-plot]')) return;
        clearTimeout(this._scrubTimer);
        scrubWeather(ev);
      });
    }
    
    for (const type of ['pointerdown', 'pointermove']) {
      this.shadowRoot.addEventListener(type, (ev) => {
        if (!this._measure || !ev.target.closest?.('[data-g-plot]')) return;
        clearTimeout(this._scrubTimer);
        scrubMeasure(ev);
      });
    }
    
    for (const type of ['pointerdown', 'pointermove']) {
      this.shadowRoot.addEventListener(type, (ev) => {
        if (this._route?.name !== 'energia' || !ev.target.closest?.('[data-e-plot]')) return;
        clearTimeout(this._scrubTimer);
        scrubEnergy(ev);
      });
    }
    this.shadowRoot.addEventListener('pointerup', (ev) => {
      const plot = ev.target.closest?.(PLOTS);
      if (!plot || ev.pointerType === 'mouse') return;
      
      clearTimeout(this._scrubTimer);
      this._scrubTimer = setTimeout(() => hideScrub(plot), 3000);
    });
    
    for (const type of ['pointerdown', 'pointermove', 'pointerup', 'pointercancel']) {
      this.shadowRoot.addEventListener(type, (ev) => this._music?.pointer(ev));
    }
    
    this.shadowRoot.addEventListener('bc-hold', (ev) => {
      const [id, action] = ev.detail.event.split(':');
      this._coverAuto = { ...this._coverAuto, id };
      pauseAction(this, 'coverAuto', action);
    });
    this.shadowRoot.addEventListener('click', (ev) => {
      if (ev.target.closest('.close, .backdrop, [data-close]')) return this.ctx.router.close();
      if (this._music?.click(ev)) return;
      handleSheetClick(ev, this);
    });
    this._onKey = (ev) => {
      if (ev.key !== 'Escape') return;
      
      const popup = ESCAPE_CLOSES.find(([key]) => this[key]);
      if (popup) {
        this[popup[0]] = popup[1];
        return this.update();
      }
      if (this._zone?.status) return this._zone.close();
      if (this._route) this.ctx.router.close();
    };
  }

  set route(route) {
    
    
    
    const isMenu = (r) => r?.name === 'funzioni' && !r.id;
    const samePage = route?.name === 'funzioni' && this._route?.name === 'funzioni' && route.id === this._route.id;
    const intercomFromMenu = route?.name === 'citofono' && (isMenu(this._route) || (this._route?.name === 'citofono' && this._fromMenu));
    this._fromMenu = Boolean((route?.name === 'funzioni' && route.id && (isMenu(this._route) || (samePage && this._fromMenu))) || intercomFromMenu);
    
    if (route?.name !== this._route?.name) this.shadowRoot.querySelectorAll('webrtc-camera').forEach(stopPlayer);
    
    if (route?.name !== this._route?.name) {
      this._stopWeather?.();
      this._stopWeather = null;
      this._weather = null;
      if (route?.name === 'meteo') this._weatherPending = true;
      
      this._stopEnergy?.();
      this._stopEnergy = null;
      this._energy = null;
      if (route?.name === 'energia') this._energyPending = true;
    }
    
    const carKey = (r) => (r?.name === 'funzioni' && r.id === 'auto' ? 'auto' : null);
    if (carKey(route) !== carKey(this._route)) {
      this._stopCar?.();
      this._stopCar = null;
      this._car = null;
      if (carKey(route)) this._carPending = true;
    }
    
    
    
    const stKey = (r) => (r?.name === 'funzioni' && r.id === 'storico' ? r.entity ?? '' : null);
    if (stKey(route) !== stKey(this._route)) {
      this.stopHistory();
      if (stKey(route) === null) this._history = { q: '', area: null, period: this._history.period, data: null };
      if (stKey(route)) this._historyPending = true;
    }
    if (!(route?.name === 'funzioni' && route.id === 'musica') && this._music) {
      this._music.close();
      this._music = null;
    }
    if (!(route?.name === 'avvisi' && route.id === 'citofono')) this._missedSince = null;
    if (this._zone?.status && !(route?.name === 'funzioni' && route.id === 'robot')) this._zone.close();
    if (!(route?.name === 'funzioni' && route.id === 'robot')) this._schedule = null;
    if (!(route?.name === 'funzioni' && route.id === 'clima')) {
      this._autoAir = null;
      this._heating = null;
    }
    if (route?.name !== 'tapparelle') this._coverAuto = null;
    if (route?.name !== 'energia') this._pun = false;
    if (route?.name !== 'citofono') this._ch = null;
    if (route?.name !== 'meteo' && route?.name !== 'zona') this._measure = null;
    this._route = route;
    this._pick = null;
    this._rooms = [];
    this._palette = null;
    this._bigCam = null;
    this._printerCam = false;
    this._massError = null;
    this.setTalk(false);
    this.armIntercomTimer();
    if (this._ctx) this.ctx = this._ctx;
  }

  connectedCallback() {
    super.connectedCallback();
    this._unsubMoves = gateMoves.subscribe(() => this._route?.name === 'citofono' && this.update());
    window.addEventListener('keydown', this._onKey);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.setTalk(false);
    this._unsubMoves?.();
    window.removeEventListener('keydown', this._onKey);
    this._music?.close();
    this._music = null;
    clearTimeout(this._intercomTimer);
    this._stopWeather?.();
    this._stopEnergy?.();
    this._stopCar?.();
    this.stopHistory();
  }

   
  reloadMeasure() {
    const want = this._measure;
    const hass = this.ctx?.getHass?.();
    if (!want || !hass) return;
    const same = () => this._measure && this._measure.id === want.id && this._measure.period === want.period && this._measure.metric === want.metric;
    loadMeasure(hass.connection, this.model, want).then(
      (data) => {
        if (!same()) return;
        this._measure = { ...this._measure, data };
        this.update();
      },
      () => {
        if (!same()) return;
        this._measure = { ...this._measure, data: { error: true } };
        this.update();
      },
    );
  }

  stopHistory() {
    this._historyStop?.();
    this._historyStop = null;
    this._history.data = null;
  }

  
  
  setTalk(value) {
    const was = this._talk;
    this._talk = value;
    if (!value) this._mic = null;
    const flag = this._ctx?.model?.intercom?.in_conversation;
    if (!flag || Boolean(was) === value) return;
    const services = this._ctx?.services;
    (value ? services?.turnOn(flag) : services?.turnOff(flag))?.catch(() => {});
  }

   
  setMic(state) {
    if ((this._mic ?? null) === state) return;
    this._mic = state;
    this.update();
  }

  armIntercomTimer() {
    clearTimeout(this._intercomTimer);
    if (this._route?.name !== 'citofono') return;
    this._intercomTimer = setTimeout(
      () => {
        if (this._route?.name !== 'citofono') return;
        this.setTalk(false);
        this.ctx.router.close();
      },
      this._talk ? INTERCOM_TALK_IDLE_MS : INTERCOM_IDLE_MS,
    );
  }

   
  get talking() {
    return this._route?.name === 'citofono' && this._talk;
  }

  
  onSliderCommit(entity, action, value) {
    if (action === 'ma-volume') return this._music?.volume(value);
    if (action === 'ma-seek') return this._music?.seek(value);
    if (action !== 'cover-position') return;
    this._coverTargets[entity] = value;
    setTimeout(() => {
      if (this._coverTargets[entity] === value) delete this._coverTargets[entity];
      this.update();
    }, 90_000);
  }

  
  update() {
    
    for (const [entity, value] of Object.entries(this._coverTargets ?? {})) {
      const st = this.store?.get(entity);
      if (st && st.attributes.current_position === value && !['opening', 'closing'].includes(st.state)) delete this._coverTargets[entity];
    }
    
    for (const [entity, value] of Object.entries(this._targets ?? {})) {
      if (this.store?.get(entity)?.attributes.temperature === value) delete this._targets[entity];
    }
    if (this._route?.name === 'funzioni' && this._route.id === 'musica' && !this._music && this.ctx?.mass?.configured) {
      this._music = new MusicView({ kbd: this.ctx.keyboard, mass: this.ctx.mass, server: this.model.music.server, update: () => this.update(), notify: this.ctx.notify });
    }
    if (this._weatherPending && this.ctx?.getHass?.()) {
      this._weatherPending = false;
      this._stopWeather = loadWeather(this.ctx.getHass().connection, this.model, (data) => {
        this._weather = { ...data };
        this.update();
      });
    }
    if (this._carPending && this.ctx?.getHass?.()) {
      this._carPending = false;
      this._stopCar = loadCarHistory(this.ctx.getHass().connection, this.model.car, (data) => {
        this._car = data;
        this.update();
      });
    }
    if (this._historyPending && this.ctx?.getHass?.() && this._route?.entity) {
      this._historyPending = false;
      const id = this._route.entity;
      this._historyStop = loadHistory(this.ctx.getHass().connection, id, this._history.period, isNumericEntity(id, this.store.get(id)), (data) => {
        this._history.data = data;
        this.update();
      });
    }
    if (this._energyPending && this.ctx?.getHass?.()) {
      this._energyPending = false;
      this._stopEnergy = loadEnergy(this.ctx.getHass().connection, this.model, (data) => {
        this._energy = { ...data };
        this.update();
      });
    }
    super.update();
    this._zone?.mount(this.shadowRoot);
    this._music?.afterRender(this.shadowRoot);
    
    const stInput = this.shadowRoot.querySelector('#st-q');
    if (stInput && !stInput.value && this._history.q) stInput.value = this._history.q;
    if (this._route?.name === 'funzioni' && this._route.id === 'lab') mountPrinterCamera(this.shadowRoot);
    if (this._route?.name === 'citofono' && this.ctx) {
      mountIntercom(this.shadowRoot, { model: this.model, hassUrl: this.ctx.hassUrl, getHass: this.ctx.getHass, talk: this._talk, onMic: (state) => this.setMic(state) });
    }
    if (this._route?.name === 'sicurezza' && this.ctx) mountCameras(this.shadowRoot, { model: this.model, hassUrl: this.ctx.hassUrl, getHass: this.ctx.getHass });
    const key = JSON.stringify(this._route);
    if (this._renderedKey !== key) {
      this._renderedKey = key;
      const body = this.shadowRoot.querySelector('.body');
      if (body) body.scrollTop = 0;
    }
  }

  get zone() {
    return this._route?.name === 'zona' ? this.model.zones.find((z) => z.id === this._route.id) : null;
  }

  watchedIds() {
    const z = this.zone;
    if (z) return zoneWatchedIds(z, this.model);
    if (this._route?.name === 'vmc') return vmcWatchedIds(this.model.vmc);
    if (this._route?.name === 'sicurezza') return securityWatchedIds(this.model);
    if (this._route?.name === 'citofono') return intercomWatchedIds(this.model);
    if (this._route?.name === 'avvisi') return alertsWatchedIds(this.model);
    if (this._route?.name === 'meteo') return weatherWatchedIds(this.model);
    if (this._route?.name === 'energia') return energyWatchedIds(this.model);
    if (this._route?.name === 'tapparelle') return [...this.model.covers, ...coverAutoWatchedIds(this.model.coverAutomations)];
    if (this._route?.name === 'funzioni' && this._route.id === 'storico') return historyWatchedIds(this._route);
    if (this._route?.name === 'funzioni' && this._route.id === 'clima') return climateWatchedIds(this.model.climate);
    if (this._route?.name === 'funzioni' && this._route.id === 'robot') return robotWatchedIds(this.model.robot);
    if (this._route?.name === 'funzioni' && this._route.id === 'lab') return labWatchedIds(this.model);
    if (this._route?.name === 'funzioni' && this._route.id === 'rack') return rackWatchedIds(this.model);
    if (this._route?.name === 'funzioni' && this._route.id === 'impostazioni') return settingsWatchedIds(this.model);
    if (this._route?.name === 'funzioni' && this._route.id === 'elettrodomestici') return appliancesWatchedIds(this.model);
    if (this._route?.name === 'funzioni') return [...menuWatchedIds(this.model, this._route.id), ...climateWatchedIds(this.model.climate)];
    return [];
  }

   
  view(route) {
    const args = { route, store: this.store, model: this.model, services: this.ctx.services, hassUrl: this.ctx.hassUrl, mass: this.ctx.mass, admin: Boolean(this.ctx.getHass()?.user?.is_admin), ui: { refresh: () => this.update(), rackTab: this._rackTab, history: this._history, kbd: this.ctx.keyboard, end: this._vacationEnd, music: this._music, massError: this._massError, massBusy: this._massBusy, pick: this._pick, printerCam: this._printerCam, weather: this._weather, energy: this._energy, car: this._car, rooms: this._rooms, sent: this._sent ?? {}, palette: this._palette, bigCam: this._bigCam, talk: this._talk, mic: this._mic, missedSince: this._missedSince, targets: this._targets, coverTargets: this._coverTargets, coverPresets: this.ctx.config.cover_presets ?? [], shadePresets: this.ctx.config.awning_presets ?? [] } };
    if (route.name === 'zona') {
      const z = this.zone;
      
      if (z?.air?.voc) ensureVocUsual(this.ctx.getHass()?.connection, z.air.voc, this._onAir ??= () => this.update());
      return {
        kind: 'side', width: 580, eyebrow: 'Basecamp', title: z?.name ?? 'Zona sconosciuta',
        subtitle: z ? zoneSubtitle(z, this.store) : '',
        body: z ? renderZone(args, z) : '<p class="placeholder">Questa zona non è in config.json.</p>',
      };
    }
    if (route.name === 'vmc') return { kind: 'side', width: 520, eyebrow: 'Comandi rapidi', title: 'VMC', body: renderVmc(args) };
    if (route.name === 'tapparelle') return { kind: 'side', width: 580, eyebrow: 'Comandi rapidi', title: 'Tende e tapparelle', subtitle: coversSubtitle(args), body: renderCovers(args) };
    if (route.name === 'sicurezza') return { kind: 'side', width: 580, eyebrow: 'Basecamp', title: 'Sicurezza', body: renderSecurity(args) };
    if (route.name === 'meteo') return { kind: 'side', width: 580, eyebrow: 'Basecamp', title: 'Meteo', body: renderWeather(args) };
    if (route.name === 'energia') return { kind: 'side', width: 580, eyebrow: 'Basecamp', title: 'Energia', body: renderEnergy(args) };
    if (route.name === 'avvisi' && route.id === 'citofono') return { kind: 'modal', width: 760, eyebrow: 'Citofono', title: 'Chiamata persa', body: renderMissedCall(args) };
    if (route.name === 'avvisi') {
      const alerts = computeAlerts(this.store, this.model, { offlineSince: this.ctx.offlineSince });
      const body = alerts.length
        ? `<div class="alerts-all">${alerts.map((a) => alertRow(a, true)).join('')}</div>`
        : `<p class="alerts-ok">${icon('mdi:check-circle-outline')}Tutto a posto: nessun avviso.</p>`;
      return { kind: 'side', width: 520, eyebrow: 'Basecamp', title: 'Avvisi', subtitle: alerts.length ? `${alerts.length} ${alerts.length === 1 ? 'avviso' : 'avvisi'}` : '', body };
    }
    if (route.name === 'citofono') return { kind: 'modal', width: 980, eyebrow: 'Funzioni', title: 'Citofono', back: this._fromMenu, action: intercomAction(args), body: renderIntercom(args) };
    if (route.id === 'wifi') return { kind: 'modal small', width: 420, title: MENU_TITLES.wifi, noClose: true, body: renderWifi(args) };
    const pages = { auto: renderCar, piante: renderPlants, clima: renderClimate, robot: renderRobot, lab: renderLab, rack: renderRack, impostazioni: renderSettings, elettrodomestici: renderAppliances, musica: renderMusic, storico: renderHistory };
    if (pages[route.id]) {
      const title =
        route.id === 'auto' ? this.model.car.name ?? MENU_TITLES.auto : route.id === 'robot' ? this.model.robot?.name ?? MENU_TITLES.robot : MENU_TITLES[route.id];
      const fromMenu = this._fromMenu;
      return { kind: 'side', width: 580, eyebrow: route.id === 'piante' ? 'Comandi rapidi' : 'Funzioni', title, subtitle: route.id === 'musica' ? musicSubtitle(this.ctx.mass) : '', back: fromMenu, body: pages[route.id](args) };
    }
    return { kind: 'modal', width: 980, eyebrow: 'Basecamp', title: 'Funzioni', body: renderMenu(args) };
  }

  render() {
    const route = this._route;
    if (!route) return '';
    const v = this.view(route);
    
    const vac = this.store.get(this.model.robot?.vacuum);
    const zoneDialog = route.name === 'funzioni' && route.id === 'robot' ? renderZoneDialog(this._zone, { canGo: !['cleaning', 'returning'].includes(vac?.state), controls: robotZoneControls({ store: this.store, robot: this.model.robot, services: this.ctx.services }) }) : '';
    return `
      <div class="overlay ${v.kind}">
        <div class="backdrop"></div>
        <div class="panel" role="dialog" aria-modal="true" aria-label="${esc(v.title)}" style="--w:${v.width}px">
          <div class="head">
            ${v.back ? `<button class="round back" data-open="#funzioni" data-replace aria-label="Torna al menu">${icon('mdi:chevron-left')}</button>` : ''}
            <div class="titles">
              ${v.eyebrow ? `<span class="eyebrow">${esc(v.eyebrow)}</span>` : ''}
              <h2>${esc(v.title)}</h2>
              ${v.subtitle ? `<span class="sub num">${esc(v.subtitle)}</span>` : ''}
            </div>
            ${v.action ?? ''}
            ${v.noClose ? '' : `<button class="close" aria-label="Chiudi">${icon('mdi:close')}</button>`}
          </div>
          <div class="body">${v.body}</div>
        </div>
      </div>${zoneDialog}${route.name === 'meteo' || route.name === 'zona' ? renderMeasureDialog(this._measure, { store: this.store, model: this.model }) : ''}${route.name === 'funzioni' && route.id === 'robot' ? renderScheduleDialog(this._schedule, { store: this.store, robot: this.model.robot, services: this.ctx.services }) : ''}${route.name === 'funzioni' && route.id === 'clima' ? renderAutoAirDialog(this._autoAir, { store: this.store, climate: this.model.climate, services: this.ctx.services }) : ''}${route.name === 'funzioni' && route.id === 'clima' ? renderHeatingDialog(this._heating, { store: this.store, climate: this.model.climate, services: this.ctx.services }) : ''}${route.name === 'citofono' ? renderCallDialog(this._ch, { store: this.store, model: this.model, hassUrl: this.ctx.hassUrl }) : ''}${route.name === 'tapparelle' ? renderCoverAutoDialog(this._coverAuto, { store: this.store, model: this.model, services: this.ctx.services }) : ''}${route.name === 'energia' ? renderPunDialog(this._pun, { store: this.store, model: this.model, ui: { energy: this._energy } }) : ''}`;
  }
}

customElements.define('bc-sheet', BcSheet);
