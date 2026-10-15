// Basecamp UI · PolyForm Noncommercial License 1.0.0 · https://polyformproject.org/licenses/noncommercial/1.0.0


import { EntityStore } from './core/store.js';
import { loadRegistry, readCachedRegistry, saveRegistry, watchRegistry } from './core/registry.js';
import { buildModel } from './core/model.js';
import { Router } from './core/router.js';
import { createServices } from './core/services.js';
import { createMass, readMassToken } from './core/mass.js';
import { esc } from './core/format.js';
import { BASE_CSS } from './ui/base.js';
import './ui/bc-header.js';
import './ui/bc-zone-card.js';
import './ui/bc-weather.js';
import './ui/bc-energy.js';
import './ui/bc-quick.js';
import './ui/bc-security.js';
import './ui/bc-alerts.js';
import './ui/bc-sheet.js';
import './ui/bc-keyboard.js';

function vmcControls(vmc) {
  const c = vmc?.controls ?? {};
  const bypass = c.bypass ?? {};
  return [
    c.power_supply, c.speed, c.automatic, c.balance, c.profile, ...Object.values(c.boost ?? {}), c.boost_stop,
    bypass.auto, ...Object.values(bypass.open ?? {}), ...Object.values(bypass.closed ?? {}),
  ].filter(Boolean);
}

const FONTS_URL =
  'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=Sora:wght@400;500;600&display=swap';

function loadFonts() {
  if (document.querySelector(`link[href="${FONTS_URL}"]`)) return;
  const link = Object.assign(document.createElement('link'), { rel: 'stylesheet', href: FONTS_URL });
  document.head.append(link);
}

const COMPACT_HEIGHT = 680;
const MIN_FIT = 0.7;

const OFFLINE_GRACE = 60_000;

const STYLES = `
  ${BASE_CSS}
  :host { display: block; position: relative; height: 100%; background: var(--bc-bg); overflow-y: auto; }
  .layout {
    display: grid; grid-template-rows: auto minmax(0, 1fr); gap: 16px;
    
    height: 100vh; min-height: 780px; padding: 12px 16px 16px;
  }
  .cols {
    display: grid; grid-template-columns: minmax(260px, 1fr) minmax(0, 2fr) minmax(260px, 1fr);
    gap: 16px; min-height: 0;
  }
  .side { display: flex; flex-direction: column; gap: 16px; min-height: 0; }
  .side > .grow { flex: 1; min-height: 0; }
  .zones { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: repeat(3, minmax(0, 1fr)); gap: 16px; }
  .toast {
    position: fixed; left: 50%; bottom: 24px; transform: translateX(-50%); z-index: 20;
    max-width: calc(100vw - 32px); padding: 12px 18px; border-radius: var(--bc-radius-inner);
    background: var(--bc-surface); border: 1px solid var(--bc-red); color: var(--bc-text); font-size: 14px;
  }
  .toast[hidden] { display: none; }
  
  .fit { transition: opacity .25s ease; }
  :host(.bc-asleep) .fit { filter: blur(10px); opacity: .65; transition: none; }
  
  .bc-wait { position: fixed; left: 50%; top: 50%; z-index: 30; transform: translate(-50%, -50%); display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 18px 28px; border-radius: 20px; background: rgba(28,29,34,.92); border: 1px solid #2A2C33; color: #EDEBE6; font-family: Sora, system-ui, sans-serif; opacity: 0; pointer-events: none; transition: opacity .2s ease; }
  :host(.bc-waiting) .bc-wait { opacity: 1; }
  .bc-wait svg { width: 40px; height: 40px; color: #E8A33D; animation: boot-pulse 1.6s ease-in-out infinite; }
  .bc-wait .bar { position: relative; width: 120px; height: 4px; border-radius: 2px; background: #2A2C33; overflow: hidden; }
  .bc-wait .bar::after { content: ''; position: absolute; top: 0; bottom: 0; width: 40%; border-radius: 2px; background: #E8A33D; animation: boot-slide 1.1s ease-in-out infinite; }
  .bc-wait .msg { font-size: 13px; color: #A3A29C; }
  
  
  :host(.bc-booting) { min-height: 100vh; overflow: visible; }
  .boot { position: absolute; inset: 0; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 18px; background: #131417; color: #EDEBE6; font-family: Sora, system-ui, sans-serif; }
  .boot .logo { width: 56px; height: 56px; color: #E8A33D; animation: boot-pulse 1.6s ease-in-out infinite; }
  .boot .name { font-size: 26px; font-weight: 600; letter-spacing: .01em; }
  .boot .bar { position: relative; width: 160px; height: 4px; border-radius: 2px; background: #2A2C33; overflow: hidden; }
  .boot .bar::after { content: ''; position: absolute; top: 0; bottom: 0; width: 40%; border-radius: 2px; background: #E8A33D; animation: boot-slide 1.1s ease-in-out infinite; }
  .boot .msg { font-size: 13px; color: #A3A29C; min-height: 18px; }
  @keyframes boot-slide { from { left: -40%; } to { left: 100%; } }
  @keyframes boot-pulse { 50% { opacity: .55; transform: scale(.94); } }
  @media (prefers-reduced-motion: reduce) { .boot .bar::after, .boot .logo { animation: none; } .boot .bar::after { left: 30%; } }
  .error { margin: 24px; padding: 16px; border-radius: var(--bc-radius); background: var(--bc-card); color: var(--bc-red); }
  @media (min-width: 1001px) and (max-height: 790px) {
    .layout, .cols, .side, .zones { gap: 10px; }
    .layout { padding: 8px 12px 10px; min-height: 0; }
    
    .cols { grid-template-columns: minmax(282px, 1fr) minmax(0, 1.6fr) minmax(282px, 1fr); }
  }
  
  @media (max-width: 1000px) {
    .layout { height: auto; min-height: 100vh; }
    .cols { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .side { display: contents; }
    bc-quick { order: 1; }
    bc-alarm { order: 2; }
    bc-access { order: 3; grid-column: 1 / -1; }
    
    bc-alerts { order: 0; grid-column: 1 / -1; }
    bc-alerts[empty] { display: none; }
    .zones { order: 4; grid-column: 1 / -1; grid-template-columns: repeat(3, minmax(0, 1fr)); grid-template-rows: none; }
    bc-weather { order: 5; }
    bc-energy { order: 6; }
  }
  @media (max-width: 600px) {
    .cols { grid-template-columns: minmax(0, 1fr); }
    .zones { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
  @media (max-width: 600px) {
    .layout, .cols, .side, .zones { gap: 12px; }
    .layout { padding: 8px 12px 16px; }
  }
`;

const PAGE_BG = '#131417';

class BasecampPanel extends HTMLElement {
  #hass = null;
  #running = false;
  #online = true;
  #teardown = [];

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.#boot('Caricamento…');
    
    
    for (const prop of ['hass', 'narrow', 'route', 'panel']) {
      if (Object.hasOwn(this, prop)) {
        const value = this[prop];
        delete this[prop];
        this[prop] = value;
      }
    }
  }

  set hass(hass) {
    this.#hass = hass;
    this.#maybeStart();
    this.#syncMenu();
  }

  
  
  #syncMenu() {
    if (!this.ctx) return;
    const menu = Boolean(this._narrow || this.#hass?.dockedSidebar === 'always_hidden');
    if (this.ctx.menu !== menu) {
      this.ctx.menu = menu;
      this.header?.update();
    }
  }

  get hass() {
    return this.#hass;
  }

  
  set narrow(narrow) {
    this._narrow = Boolean(narrow);
    this.#syncMenu();
  }

  
  set route(_) {}
  set panel(_) {}

  connectedCallback() {
    
    this.querySelector(':scope > .bc-early-boot')?.remove();
    if (this.shadowRoot.querySelector('.boot')) this.classList.add('bc-booting');
    this.#darkPage(true);
    this.#maybeStart();
  }

  disconnectedCallback() {
    this.#darkPage(false);
    for (const fn of this.#teardown.splice(0)) fn();
    this.#running = false;
  }

  
  #darkPage(on) {
    for (const el of [document.documentElement, document.body]) {
      if (on) el.style.setProperty('background-color', PAGE_BG);
      else el.style.removeProperty('background-color');
    }
  }

  
  #boot(msg) {
    
    if (this.isConnected) this.classList.add('bc-booting');
    const box = this.shadowRoot.querySelector('.boot .msg');
    if (box) return void (box.textContent = msg);
    this.shadowRoot.innerHTML = `<style>${STYLES}</style>
      <div class="boot" role="status" aria-live="polite">
        <svg class="logo" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M14,6L10.25,11L13.1,14.8L11.5,16C9.81,13.75 7,10 7,10L1,18H23L14,6Z"/></svg>
        <span class="name">Basecamp</span><span class="bar"></span><span class="msg">${esc(msg)}</span>
      </div>`;
  }

  #maybeStart() {
    if (this.#running || !this.#hass || !this.isConnected) return;
    this.#running = true;
    this.#start().catch((err) => {
      console.error('Basecamp:', err);
      this.shadowRoot.innerHTML = `<style>${STYLES}</style><div class="error">Errore di avvio: ${esc(err?.message ?? err)}</div>`;
    });
  }

  async #start() {
    
    performance.mark('bc:start');
    loadFonts();
    const hass = this.#hass;
    const conn = hass.connection;
    const store = new EntityStore(conn, hass.states);
    this.#teardown.push(() => store.unsubscribe());

    
    this.#boot('Stanze e dispositivi…');
    const configP = fetch(new URL('./config.json', import.meta.url), { cache: 'no-cache' }).then((r) => {
      if (!r.ok) throw new Error(`config.json: HTTP ${r.status}`);
      performance.mark('bc:config');
      return r.json();
    });
    
    const detailed = configP.then((c) => [c.robot?.vacuum].filter(Boolean)).catch(() => []);
    
    const cached = readCachedRegistry();
    const freshP = loadRegistry(conn, detailed).then((r) => {
      performance.mark('bc:registry');
      return { registry: r, changed: saveRegistry(r) };
    });
    const [config, registry] = await Promise.all([
      configP,
      cached ? (performance.mark('bc:registro-salvato'), cached) : freshP.then((f) => f.registry),
      store.ready.then(() => performance.mark('bc:stati')),
    ]);
    if (!this.#running) return;

    const router = new Router((route) => {
      this.sheet.route = route;
    });
    this.#teardown.push(() => router.destroy());

    this.ctx = {
      store,
      router,
      config,
      
      offlineSince: null,
      homeName: config.name ?? hass.config?.location_name ?? 'Casa',
      model: buildModel(registry, config, (id) => store.get(id)),
      
      hassUrl: (path) => (this.#hass?.hassUrl ? this.#hass.hassUrl(path) : path),
      getHass: () => this.#hass,
      notify: (msg) => this.#notify(msg),
      
      keyboard: (config.keyboard?.users ?? []).includes(hass.user?.name),
      menu: Boolean(this._narrow || hass.dockedSidebar === 'always_hidden'),
      
      toggleMenu: () => this.dispatchEvent(new CustomEvent('hass-toggle-menu', { bubbles: true, composed: true })),
      
      services: createServices({
        getHass: () => this.#hass,
        notify: (msg) => this.#notify(msg),
        allowedEntities: () => [
          ...vmcControls(config.vmc),
          config.climate?.season,
          config.climate?.heat_pump?.mode,
          config.climate?.hot_water?.charge,
          config.climate?.hot_water?.disinfection,
          
          ...(config.climate?.hot_water?.settings ?? []).map((i) => i.entity),
          ...Object.values(config.entities ?? {}).flatMap((e) => (e.actions ?? []).map((x) => x.switch)),
          ...this.ctx.model.zones.flatMap((z) => [z.zoneSwitch, z.climate, ...z.covers]),
          this.ctx.model.alarm,
          config.robot?.vacuum,
          
          ...(config.robot?.dock ?? []).map((d) => d.entity),
          
          ...(config.lab?.outlets ?? []).map((p) => p.entity),
          
          config.lab?.printer?.outlet,
          config.intercom?.call,
          
          config.intercom?.in_conversation,
          
          config.alerts?.missed_call?.entity,
          config.intercom?.do_not_disturb,
          config.robot?.mode,
          config.robot?.mop,
          
          config.robot?.schedules?.automation,
          config.robot?.schedules?.pause,
          
          config.climate?.auto_air?.switch,
          config.climate?.auto_air?.pause,
          
          ...(config.cover_automations ?? []).map((a) => a.pause),
          
          config.climate?.heating?.switch,
          config.climate?.heating?.start,
          config.climate?.heating?.end,
          
          ...(config.appliances ?? []).flatMap((a) => [a.delay, ...(a.options ?? []).map((o) => o.entity)]),
          
          ...(config.settings ?? []).filter((s) => !s.read_only).map((s) => s.entity),
          
          ...(config.settings ?? []).map((s) => s.end),
          
          ...(config.car?.controls ?? []).map((c) => c.entity),
          
          ...(config.access ?? []).filter((id) => id.startsWith('cover.')),
        ].filter(Boolean),
        holdEntities: () => config.hold_to_confirm ?? [],
        intercom: () => config.intercom ?? {},
        
        longPresses: () => Object.fromEntries(Object.entries(config.entities ?? {}).filter(([, e]) => e.long_press).map(([id, e]) => [id, e.long_press])),
        appliances: () => config.appliances ?? [],
        confirmEntities: () => config.tap_to_confirm ?? [],
      }),
    };
    
    
    const mass = createMass({
      server: config.music?.server,
      readOnly: Boolean(hass.blockedCommands),
      onChange: () => {
        this.header?.update();
        const route = this.ctx.router.current;
        if (route?.name === 'funzioni' && (!route.id || route.id === 'musica')) this.sheet?.update();
      },
    });
    this.ctx.mass = mass;
    this.#teardown.push(() => mass.stop());
    if (mass.configured) readMassToken(conn).then((token) => this.#running && mass.start(token));

    performance.mark('bc:render');
    this.#render();
    performance.mark('bc:pronto');
    const resize = new ResizeObserver(() => this.#fit());
    resize.observe(this);
    const onResize = () => this.#fit();
    window.addEventListener('resize', onResize);
    this.#teardown.push(() => {
      resize.disconnect();
      window.removeEventListener('resize', onResize);
    });

    
    
    const ring = config.intercom?.call;
    const autoOpen = (config.intercom?.auto_open_for ?? []).includes(hass.user?.name);
    if (ring && autoOpen) {
      let ringing = store.get(ring)?.state === 'on';
      if (ringing) router.open('#citofono');
      this.#teardown.push(
        store.watch([ring], () => {
          const now = store.get(ring)?.state === 'on';
          if (now && !ringing && router.current?.name !== 'citofono') router.open('#citofono');
          if (!now && ringing && router.current?.name === 'citofono' && !this.sheet?.talking) router.close();
          ringing = now;
        }),
      );
    }

    const onReady = () => this.#setOnline(true);
    const onDown = () => this.#setOnline(false);
    conn.addEventListener('ready', onReady);
    conn.addEventListener('disconnected', onDown);
    conn.addEventListener('reconnect-error', onDown);
    this.#teardown.push(() => {
      conn.removeEventListener('ready', onReady);
      conn.removeEventListener('disconnected', onDown);
      conn.removeEventListener('reconnect-error', onDown);
      clearTimeout(this._offlineTimer);
    });
    this.#online = true;
    if (!conn.connected) onDown();

    
    
    
    
    let veilTimer;
    let waking = false;
    let lastInput = Date.now();
    let preVeiled = false;
    let slowTimer;
    const unveil = () => {
      clearTimeout(veilTimer);
      clearTimeout(slowTimer);
      this.classList.remove('bc-asleep', 'bc-waiting');
    };
    
    const showWait = () => {
      if (!this.shadowRoot.querySelector('.bc-wait')) {
        const box = document.createElement('div');
        box.className = 'bc-wait';
        box.setAttribute('role', 'status');
        box.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M14,6L10.25,11L13.1,14.8L11.5,16C9.81,13.75 7,10 7,10L1,18H23L14,6Z"/></svg><span class="bar"></span><span class="msg">Riconnessione…</span>`;
        this.shadowRoot.append(box);
      }
      this.classList.add('bc-waiting');
    };
    const wake = async () => {
      if (waking) return;
      waking = true;
      const version = store.version;
      let reconnected = false;
      
      clearTimeout(veilTimer);
      veilTimer = setTimeout(unveil, 5000);
      clearTimeout(slowTimer);
      slowTimer = setTimeout(showWait, 1200);
      try {
        
        if (!conn.connected) throw new Error('non connesso');
        
        
        let timer;
        const timeout = new Promise((_, reject) => (timer = setTimeout(() => reject(new Error('timeout')), 500)));
        await Promise.race([conn.ping(), timeout]).finally(() => clearTimeout(timer));
      } catch {
        
        
        reconnected = true;
        conn.reconnect(true);
        await new Promise((resolve) => {
          const done = () => (conn.removeEventListener('ready', done), resolve());
          conn.addEventListener('ready', done);
          setTimeout(done, 2500);
        });
      }
      
      
      
      await store.changed(version, reconnected ? 1000 : 150);
      waking = false;
      unveil();
    };
    const onScreen = (what) => {
      if (what === 'off') {
        preVeiled = false;
        waking = false;
        clearTimeout(veilTimer);
        clearTimeout(slowTimer);
        this.classList.remove('bc-waiting');
        this.classList.add('bc-asleep');
      } else {
        
        lastInput = Date.now();
        wake();
      }
    };
    window.__bcScreen = onScreen;
    if (window.fully?.bind) {
      window.fully.bind('screenOff', 'window.__bcScreen && window.__bcScreen("off");');
      window.fully.bind('screenOn', 'window.__bcScreen && window.__bcScreen("on");');
    }
    
    
    
    
    const off = config.screen_off;
    const touch = () => {
      lastInput = Date.now();
      if (preVeiled) {
        preVeiled = false;
        unveil();
      }
    };
    const inputs = ['pointerdown', 'touchstart', 'keydown', 'wheel'];
    for (const t of inputs) window.addEventListener(t, touch, { capture: true, passive: true });
    const idleTimer = setInterval(() => {
      const secs = Number(store.get(off?.timer)?.state);
      
      if (!off || !window.fully || !(secs > 0) || document.hidden || waking) return;
      const idle = (Date.now() - lastInput) / 1000;
      const start = secs - (off.lead_s ?? 4);
      if (!preVeiled && idle >= start && idle < secs + 10) {
        preVeiled = true;
        this.classList.add('bc-asleep');
        
        clearTimeout(veilTimer);
        veilTimer = setTimeout(touch, (off.lead_s ?? 4) * 1000 + 10_000);
      }
    }, 1000);
    
    let lastTick = Date.now();
    const gap = setInterval(() => {
      const now = Date.now();
      if (now - lastTick > 8000 && !this.classList.contains('bc-asleep')) {
        Promise.race([conn.ping(), new Promise((_, rej) => setTimeout(rej, 2500))]).catch(() => conn.reconnect(true));
      }
      lastTick = now;
    }, 2000);
    this.#teardown.push(() => {
      clearInterval(gap);
      clearInterval(idleTimer);
      for (const t of inputs) window.removeEventListener(t, touch, { capture: true });
      clearTimeout(veilTimer);
      this.classList.remove('bc-asleep');
      if (window.__bcScreen === onScreen) delete window.__bcScreen;
    });

    
    if (cached) {
      freshP
        .then(({ registry: fresh, changed }) => {
          if (!changed || !this.#running) return;
          this.ctx.model = buildModel(fresh, config, (id) => store.get(id));
          this.#render();
        })
        .catch(() => {});
    }

    
    const stopRegistry = watchRegistry(conn, async () => {
      const fresh = await loadRegistry(conn, detailed);
      saveRegistry(fresh);
      this.ctx.model = buildModel(fresh, config, (id) => store.get(id));
      this.#render();
    });
    this.#teardown.push(() => stopRegistry());
  }

  #notify(message) {
    const toast = this.shadowRoot.querySelector('.toast');
    if (!toast) return;
    toast.textContent = message;
    toast.hidden = false;
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => (toast.hidden = true), 4000);
  }

  
  
  #setOnline(online) {
    if (online === this.#online) return;
    this.#online = online;
    clearTimeout(this._offlineTimer);
    const show = (since) => {
      if (this.ctx.offlineSince === since) return;
      this.ctx.offlineSince = since;
      this.shadowRoot.querySelector('bc-alerts')?.update();
      if (this.ctx.router.current?.name === 'avvisi') this.sheet?.update();
    };
    if (online) return show(null);
    const since = new Date();
    this._offlineTimer = setTimeout(() => show(since), OFFLINE_GRACE);
  }

  
  #fit() {
    const fit = this.shadowRoot.querySelector('.fit');
    const layout = this.shadowRoot.querySelector('.layout');
    if (!fit || !layout) return;
    
    const w = this.clientWidth;
    const h = window.innerHeight - Math.max(0, this.getBoundingClientRect().top);
    const scale = w > 1000 && h < COMPACT_HEIGHT ? Math.max(MIN_FIT, h / COMPACT_HEIGHT) : 1;
    fit.style.zoom = scale === 1 ? '' : String(scale);
    
    layout.style.height = scale === 1 ? '' : `${h / scale}px`;
    layout.style.minHeight = scale === 1 ? '' : '0';
  }

  #render() {
    this.classList.remove('bc-booting');
    const { model } = this.ctx;
    this.shadowRoot.innerHTML = `
      <style>${STYLES}</style>
      <div class="fit">
      <div class="layout">
        <bc-header></bc-header>
        <div class="cols">
          <div class="side">
            <bc-weather></bc-weather>
            <bc-energy></bc-energy>
            <bc-quick class="grow"></bc-quick>
          </div>
          <div class="zones">
            ${model.zones.map((_, i) => `<bc-zone-card data-i="${i}"></bc-zone-card>`).join('')}
          </div>
          <div class="side">
            <bc-alarm></bc-alarm>
            <bc-access></bc-access>
            <bc-alerts class="grow"></bc-alerts>
          </div>
        </div>
      </div>
      <bc-sheet></bc-sheet>
      ${this.ctx.keyboard ? '<bc-keyboard></bc-keyboard>' : ''}
      <div class="toast" role="status" hidden></div>
      </div>
    `;
    this.#fit();
    const $ = (sel) => this.shadowRoot.querySelector(sel);
    this.header = $('bc-header');
    this.sheet = $('bc-sheet');
    for (const card of this.shadowRoot.querySelectorAll('bc-zone-card')) {
      card.zone = model.zones[Number(card.dataset.i)];
    }
    for (const el of this.shadowRoot.querySelectorAll('bc-header, bc-zone-card, bc-weather, bc-energy, bc-quick, bc-alarm, bc-access, bc-alerts')) {
      el.ctx = this.ctx;
    }
    this.sheet.route = this.ctx.router.current;
    this.sheet.ctx = this.ctx;
    $('bc-keyboard')?.attach(this.sheet);
  }
}

performance.mark('bc:modulo');
customElements.define('basecamp-panel', BasecampPanel);
