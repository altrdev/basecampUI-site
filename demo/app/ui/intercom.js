// Basecamp UI · PolyForm Noncommercial License 1.0.0 · https://polyformproject.org/licenses/noncommercial/1.0.0


import { icon } from './base.js';
import { esc, fmtWhen, isUnavailable } from '../core/format.js';
import { fmtSpan, gateMoves, gateSeen } from '../core/gate.js';
import { createPlayer, loadPlayer, stopPlayer } from './security.js';

export const INTERCOM_STYLES = `
  .intercom { display: grid; grid-template-columns: minmax(0, 1.7fr) minmax(240px, 1fr); gap: 16px; }
  .intercom-video { position: relative; aspect-ratio: 16 / 9; border-radius: var(--bc-radius-inner); overflow: hidden; background: #000; }
  .intercom-video webrtc-camera { display: block; width: 100%; height: 100%; }
  .intercom-video .cam-msg { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 13px; color: var(--bc-text-2); }
  .intercom-status { display: flex; align-items: center; gap: 8px; margin-top: 10px; font-size: 15px; font-weight: 500; color: var(--bc-text-2); }
  .intercom-status::before { content: ''; width: 10px; height: 10px; border-radius: 50%; background: currentColor; }
  .intercom-status.ringing { color: var(--bc-red); }
  .intercom-status.ringing::before { animation: bc-ring 1s ease-in-out infinite alternate; }
  .intercom-status.talk { color: var(--bc-green); }
  .intercom-status.wait { color: var(--bc-amber); }
  .intercom-status.err { color: var(--bc-red); }
  .intercom-status.wait::before { animation: bc-ring 1s ease-in-out infinite alternate; }
  @keyframes bc-ring { from { opacity: 1; } to { opacity: .2; } }
  @keyframes intercom-spin { to { transform: rotate(360deg); } }
  .intercom-loader { position: absolute; inset: 0; z-index: 2; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 16px; background: rgba(0, 0, 0, .72); color: var(--bc-text); font-size: 15px; font-weight: 500; text-align: center; }
  .intercom-loader .spin { width: 28px; height: 28px; border-radius: 50%; border: 3px solid var(--bc-border-strong); border-top-color: var(--bc-amber); animation: intercom-spin .9s linear infinite; }
  .intercom-loader.err .spin { display: none; }
  .intercom-loader.err { color: var(--bc-red); }
  .intercom-loader .loader-btn { min-height: var(--bc-touch); padding: 0 20px; border-radius: 14px; border: 1px solid var(--bc-border-strong); background: var(--bc-surface); color: var(--bc-text); font-size: 15px; font-weight: 600; }
  .intercom-mic { position: absolute; left: 10px; top: 10px; z-index: 1; display: flex; align-items: center; gap: 8px; padding: 6px 10px; border-radius: 12px; background: rgba(0, 0, 0, .55); color: var(--bc-green); pointer-events: none; }
  .intercom-mic .icon { width: 20px; height: 20px; }
  .intercom-mic .lvl { width: 56px; height: 6px; border-radius: 3px; background: rgba(255, 255, 255, .18); overflow: hidden; }
  .intercom-mic .lvl i { display: block; height: 100%; width: calc(var(--lvl, 0) * 100%); background: currentColor; border-radius: 3px; transition: width .12s linear; }
  .intercom-side { display: flex; flex-direction: column; gap: 10px; }
  .intercom-side h3 { margin: 6px 0 0; }
  .call-btn {
    display: flex; align-items: center; justify-content: center; gap: 10px; min-height: 64px;
    border-radius: var(--bc-radius-inner); font-size: 17px; font-weight: 600; background: var(--bc-surface);
  }
  .call-btn .icon { width: 26px; height: 26px; }
  .call-btn.go { background: var(--bc-green); color: var(--bc-bg); }
  .call-btn.stop { background: var(--bc-red); color: var(--bc-bg); }
  .call-btn:active { filter: brightness(.9); }
  .door-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .door-btn {
    display: flex; flex-direction: column; justify-content: space-between; gap: 14px; min-height: 112px; padding: 14px;
    border-radius: var(--bc-radius-inner); background: var(--bc-surface); border: 1px solid var(--bc-border); text-align: left;
  }
  .door-btn .top { display: flex; align-items: center; gap: 8px; font-size: 16px; font-weight: 600; }
  .door-btn .top .icon { width: 26px; height: 26px; color: var(--bc-access); }
  .door-btn .st { font-variant-numeric: tabular-nums; display: flex; flex-direction: column; gap: 1px; font-size: 13px; line-height: 1.35; color: var(--bc-text-2); }
  .door-btn .st b { font-size: 14px; font-weight: 600; }
  .door-btn .st .ok { color: var(--bc-green); }
  .door-btn .st .bad { color: var(--bc-red); }
  .door-btn:disabled { cursor: default; opacity: .6; }
  .door-btn.closed .top .icon { color: var(--bc-green); }
  .door-btn.done { border-color: var(--bc-green); }
  .door-btn.failed { border-color: var(--bc-red); }
  .door-hint { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--bc-text-2); }
  .door-hint .icon { width: 18px; height: 18px; }
  .dnd-pill {
    display: flex; align-items: center; gap: 8px; height: 48px; padding: 0 16px; flex: none; border-radius: 14px;
    border: 1px solid var(--bc-border-strong); background: var(--bc-surface); font-size: 14px;
  }
  .dnd-pill .icon { width: 22px; height: 22px; }
  .dnd-pill.on { color: var(--bc-violet); border-color: color-mix(in srgb, var(--bc-violet) 45%, transparent); background: color-mix(in srgb, var(--bc-violet) 16%, var(--bc-surface)); }
  .hist { grid-column: 1 / -1; min-width: 0; }
  .hist h3 { margin: 0 0 8px; }
  .hist-row { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 6px; scrollbar-width: thin; }
  .hist-row.dragging { cursor: grabbing; user-select: none; }
  .hist-item {
    flex: none; width: 132px; display: flex; flex-direction: column; gap: 6px; padding: 6px; text-align: left;
    border-radius: var(--bc-radius-inner); background: var(--bc-surface); border: 1px solid var(--bc-border);
  }
  .hist-item .ph { position: relative; aspect-ratio: 16 / 9; border-radius: 10px; overflow: hidden; background: #000; }
  .hist-item img { display: block; width: 100%; height: 100%; object-fit: cover; }
  .hist-item .ph .icon { position: absolute; inset: 0; margin: auto; width: 24px; height: 24px; color: var(--bc-text-2); }
  .hist-item .when { font-size: 12px; font-variant-numeric: tabular-nums; color: var(--bc-text-2); line-height: 1.25; }
  .outcome { font-size: 12px; font-weight: 600; }
  .outcome.answered { color: var(--bc-green); }
  .outcome.missed { color: var(--bc-red); }
  .outcome.ignored { color: var(--bc-amber); }
  .outcome.other { color: var(--bc-text-2); }
  .call-photo { display: block; width: 100%; border-radius: var(--bc-radius-inner); background: #000; }
  .call-nav { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: 12px; }
  .call-nav button { width: var(--bc-touch); height: var(--bc-touch); display: grid; place-items: center; border-radius: 12px; border: 1px solid var(--bc-border-strong); background: var(--bc-card); }
  .call-nav button:disabled { opacity: .35; cursor: default; }
  @media (max-width: 800px) { .intercom { grid-template-columns: minmax(0, 1fr); } }
`;

export function intercomWatchedIds(model) {
  const c = model.intercom ?? {};
  const sensors = (c.doors ?? []).map((id) => model.gateSensor(id));
  return [c.call, c.repeat_rings, c.calls, c.do_not_disturb, ...(c.doors ?? []), ...sensors].filter(Boolean);
}

 
export function callState(store, model, talk) {
  if (talk) return 'talk';
  return store.get(model.intercom?.call)?.state === 'on' ? 'ringing' : 'idle';
}

const OUTCOME_LABELS = { risposta: ['Risposta', 'answered'], persa: ['Persa', 'missed'], ignorata: ['Mentre parlavi', 'ignored'], 'in corso': ['In corso', 'other'], 'senza esito': ['Senza esito', 'other'] };

 
export function recordedCalls(store, model) {
  const list = store.get(model.intercom?.calls)?.attributes?.chiamate;
  return (Array.isArray(list) ? list : [])
    .map((c) => ({ t: new Date(c.t), foto: c.foto ?? null, esito: c.esito ?? '' }))
    .filter((c) => !Number.isNaN(c.t.getTime()));
}

function whenText(t, now = new Date()) {
  const hm = t.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  const day = new Date(t.getFullYear(), t.getMonth(), t.getDate());
  const diff = Math.round((new Date(now.getFullYear(), now.getMonth(), now.getDate()) - day) / 86_400_000);
  if (diff === 0) return `Oggi ${hm}`;
  if (diff === 1) return `Ieri ${hm}`;
  return `${t.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })} ${hm}`;
}

function esitoHtml(esito) {
  const [txt, cls] = OUTCOME_LABELS[esito] ?? ['—', 'other'];
  return `<span class="outcome ${cls}">${txt}</span>`;
}

 
function renderCallHistory(store, model, hassUrl) {
  const list = recordedCalls(store, model);
  if (!model.intercom?.calls || !list.length) return '';
  const items = list
    .map(
      (c, i) => `<button class="hist-item" data-call-open="${i}" aria-label="Chiamata ${esc(whenText(c.t))}">
        <span class="ph">${c.foto ? `<img src="${esc(hassUrl(c.foto))}" alt="" loading="lazy">` : icon('mdi:image-off-outline')}</span>
        <span class="when">${esc(whenText(c.t))}</span>${esitoHtml(c.esito)}
      </button>`,
    )
    .join('');
  return `<div class="hist"><h3>Ultime chiamate</h3><div class="hist-row" data-hscroll>${items}</div></div>`;
}

 
export function renderCallDialog(ui, { store, model, hassUrl }) {
  if (!ui) return '';
  const list = recordedCalls(store, model);
  const c = list[ui.i];
  if (!c) return '';
  const day = c.t.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
  const hm = c.t.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  return `
    <div class="zdlg-overlay">
      <div class="zdlg-backdrop" data-call-close></div>
      <div class="zdlg" role="dialog" aria-modal="true" aria-label="Chiamata del ${esc(day)} alle ${esc(hm)}">
        <div class="zdlg-head">
          <div class="t"><h3>${esc(day.charAt(0).toUpperCase() + day.slice(1))} · ${esc(hm)}</h3><p>${esitoHtml(c.esito)}</p></div>
          <button class="zclose" data-call-close aria-label="Chiudi">${icon('mdi:close')}</button>
        </div>
        ${c.foto ? `<img class="call-photo" src="${esc(hassUrl(c.foto))}" alt="Foto di chi ha suonato">` : '<p class="placeholder">Nessuna foto per questa chiamata.</p>'}
        <div class="call-nav">
          <button data-call-open="${ui.i + 1}" ${ui.i + 1 >= list.length ? 'disabled' : ''} aria-label="Chiamata precedente">${icon('mdi:chevron-left')}</button>
          <span class="hint">${ui.i + 1} di ${list.length}</span>
          <button data-call-open="${ui.i - 1}" ${ui.i <= 0 ? 'disabled' : ''} aria-label="Chiamata successiva">${icon('mdi:chevron-right')}</button>
        </div>
      </div>
    </div>`;
}

export function renderIntercom({ store, model, services, ui, hassUrl }) {
  const c = model.intercom;
  if (!c) return '<p class="placeholder">Citofono non configurato in config.json.</p>';
  const state = callState(store, model, ui.talk);
  
  const pressed = Number(store.get(c.repeat_rings)?.state);
  const again = state === 'talk' && pressed > 0 ? ` · ha ripremuto ${pressed === 1 ? '1 volta' : `${pressed} volte`}` : '';
  
  const mic = state === 'talk' ? ui.mic : null;
  const status =
    state !== 'talk'
      ? { ringing: 'Sta suonando', idle: 'Citofono' }[state]
      : mic === 'connecting'
      ? 'Collegamento al microfono…'
      : mic === 'nomic'
      ? 'Microfono non disponibile'
      : mic === 'timeout'
      ? 'Collegamento non riuscito'
      : `In conversazione${mic === 'ready' ? ' · microfono attivo' : ''}${again}`;
  const statusClass = mic === 'connecting' ? 'wait' : mic === 'nomic' || mic === 'timeout' ? 'err' : state;

  const calls = {
    ringing: `
      <button class="call-btn go" data-intercom="answer">${icon('mdi:phone')}Rispondi</button>
      <button class="call-btn stop" data-intercom="decline">${icon('mdi:phone-hangup')}Rifiuta</button>`,
    talk: `<button class="call-btn stop" data-intercom="hangup">${icon('mdi:phone-hangup')}Riaggancia</button>`,
    idle: `<button class="call-btn go" data-intercom="talk">${icon('mdi:phone-outgoing')}Parla</button>`,
  }[state];

  const doors = (c.doors ?? [])
    .map((id) => {
      const st = store.get(id);
      const when = !isUnavailable(st) ? fmtWhen(st.state) : null;
      
      const enabled = st && st.state !== 'unavailable';
      const verb = model.verb(id);
      
      const sensor = model.gateSensor(id);
      const seen = sensor ? gateSeen(store, sensor) : null;
      const known = seen && seen.state !== 'incerto';
      const moving = gateMoves.label(id, seen);
      const last = when ? `Ultimo ${esc(when)}${sensor && !known ? '*' : ''}` : `Tieni premuto per ${esc(verb)}`;
      const state = moving
        ? `<b class="bad">${moving}</b>`
        : known
        ? seen.state === 'aperto'
          ? `<b class="bad">Aperto${seen.since ? ` · da ${fmtSpan(Date.now() - seen.since)}` : ''}</b>`
          : '<b class="ok">Chiuso</b>'
        : '';
      const open = !moving && known && seen.state === 'aperto';
      return `<button class="door-btn ${known && !open && !moving ? 'closed' : ''}" ${enabled && !moving ? `data-hold="${esc(id)}"${sensor ? ` data-hold-gate="${esc(sensor)}"` : ''} aria-label="${esc(model.name(id))}: tieni premuto 1 secondo per ${esc(verb)}"` : `disabled${moving ? ` aria-label="${esc(model.name(id))}: ${esc(moving)}"` : ''}`} style="--hold-color: var(--bc-access)">
        <span class="top">${icon(open ? 'mdi:gate-open' : model.icon(id) ?? 'mdi:gate')}${esc(model.name(id))}</span>
        <span class="st">${state}<span>${last}</span></span>
      </button>`;
    })
    .join('');

  return `
    <div class="intercom">
      <div>
        <div class="intercom-video" data-keep></div>
        <div class="intercom-status ${statusClass}">${esc(status)}</div>
      </div>
      <div class="intercom-side">
        ${calls}
        ${doors ? `<h3>Comandi</h3><div class="door-grid">${doors}</div><div class="door-hint">${icon('mdi:gesture-tap-hold')}Tieni premuto 1 secondo</div>` : ''}
      </div>
      ${renderCallHistory(store, model, hassUrl ?? ((p) => p))}
    </div>`;
}

 
export function intercomAction({ store, model, services }) {
  const id = model.intercom?.do_not_disturb;
  if (!id) return '';
  const on = store.get(id)?.state === 'on';
  return `<button class="dnd-pill ${on ? 'on' : ''}" ${services.canControl(id) ? `data-toggle="${esc(id)}" aria-pressed="${on}"` : 'disabled'}>${icon(on ? 'mdi:bell-off' : 'mdi:bell-outline')}Non disturbare</button>`;
}

const MIC_TIMEOUT_MS = 8000; 
const MIC_GRACE_MS = 1500; 

 
function playerStatus(el) {
  const pc = el.pc;
  const sender = pc?.getSenders().find((s) => s.track?.kind === 'audio' && s.track.readyState === 'live');
  const v = el.video;
  return { connected: pc?.connectionState === 'connected', mic: Boolean(sender), playing: Boolean(v?.srcObject && !v.paused && v.readyState >= 2) };
}

const LOADER = (msg, retry = false) =>
  `<div class="intercom-loader ${retry ? 'err' : ''}"><span class="spin"></span><span>${esc(msg)}</span>${retry ? '<button class="loader-btn" data-intercom="mic-retry">Riprova</button>' : ''}</div>`;

 
function dropPending(slot) {
  clearInterval(slot._micTimer);
  slot._micTimer = 0;
  if (slot._pending) stopPlayer(slot._pending);
  slot._pending = null;
  slot.querySelector('.intercom-loader')?.remove();
}

 
export function retryMic(root) {
  const slot = root.querySelector('.intercom-video');
  if (!slot) return;
  slot._failed = false;
  slot.querySelector('.intercom-loader')?.remove();
}

function swapToMic(slot, el, existing, onMic) {
  el.style.cssText += ';position:absolute;inset:0;opacity:0';
  el.dataset.pending = '';
  slot._pending = el;
  slot.append(el);
  slot.insertAdjacentHTML('beforeend', LOADER('Collegamento al microfono…'));
  onMic?.('connecting');
  const t0 = Date.now();
  let connectedAt = 0;
  const fail = (kind) => {
    clearInterval(slot._micTimer);
    slot._micTimer = 0;
    stopPlayer(el);
    slot._pending = null;
    slot._failed = true;
    slot.querySelector('.intercom-loader')?.remove();
    slot.insertAdjacentHTML('beforeend', LOADER(kind === 'nomic' ? 'Microfono non disponibile: controlla il permesso del browser' : 'Il collegamento non è riuscito', true));
    onMic?.(kind);
  };
  slot._micTimer = setInterval(() => {
    if (!el.isConnected) return dropPending(slot);
    const st = playerStatus(el);
    if (st.connected && st.mic && st.playing) {
      clearInterval(slot._micTimer);
      slot._micTimer = 0;
      if (existing) stopPlayer(existing);
      delete el.dataset.pending;
      el.style.opacity = '';
      el.style.position = '';
      el.style.inset = '';
      slot._pending = null;
      slot.querySelector('.intercom-loader')?.remove();
      showMicLevel(slot, el);
      onMic?.('ready');
      return;
    }
    if (st.connected && !connectedAt) connectedAt = Date.now();
    if (connectedAt && !st.mic && Date.now() - connectedAt > MIC_GRACE_MS) fail('nomic');
    else if (Date.now() - t0 > MIC_TIMEOUT_MS) fail('timeout');
  }, 150);
}

 
function showMicLevel(slot, el) {
  slot.querySelector('.intercom-mic')?.remove();
  slot.insertAdjacentHTML('beforeend', `<div class="intercom-mic" aria-hidden="true">${icon('mdi:microphone')}<span class="lvl"><i></i></span></div>`);
  const bar = slot.querySelector('.intercom-mic .lvl i');
  const timer = setInterval(async () => {
    if (!el.isConnected || !el.pc || !bar.isConnected) {
      clearInterval(timer);
      slot.querySelector('.intercom-mic')?.remove();
      return;
    }
    try {
      let level = 0;
      (await el.pc.getStats()).forEach((s) => {
        if (s.type === 'media-source' && s.kind === 'audio') level = Math.max(level, Number(s.audioLevel) || 0);
      });
      bar.style.setProperty('--lvl', String(Math.min(1, level * 3)));
    } catch {
       
    }
  }, 200);
}

export function mountIntercom(root, { model, hassUrl, getHass, talk, onMic }) {
  const c = model.intercom;
  const slot = root.querySelector('.intercom-video');
  if (!c || !slot) return;
  const want = String(Boolean(talk));
  const current = slot.querySelector('webrtc-camera:not([data-pending])');
  if (current && current.dataset.mic === want) {
    
    if (!talk) {
      slot._failed = false;
      dropPending(slot);
    }
    return;
  }
  if (slot._pending?.dataset.mic === want) return;
  if (talk && slot._failed) return; 
  if (slot.querySelector('.cam-msg')) return;
  if (!talk) {
    slot._failed = false;
    slot.querySelector('.intercom-loader')?.remove();
  }
  dropPending(slot);
  loadPlayer(hassUrl, model.security?.player ?? '/webrtc/webrtc-camera.js').then(
    () => {
      if (!slot.isConnected) return;
      const existing = slot.querySelector('webrtc-camera:not([data-pending])');
      if (existing && existing.dataset.mic === want) return;
      if (slot._pending) return;
      const el = createPlayer({ server: c.server, url: c.stream }, getHass, { microphone: Boolean(talk) });
      el.dataset.mic = want;
      if (talk) return swapToMic(slot, el, existing, onMic);
      
      slot.append(el);
      slot.querySelector('.intercom-mic')?.remove();
      if (existing) stopPlayer(existing);
      onMic?.(null);
    },
    () => slot.insertAdjacentHTML('beforeend', '<span class="cam-msg">Player WebRTC non disponibile</span>'),
  );
}
