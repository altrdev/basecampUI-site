// Basecamp UI · PolyForm Noncommercial License 1.0.0 · https://polyformproject.org/licenses/noncommercial/1.0.0


import { icon } from './base.js';
import { esc } from '../core/format.js';

export const ROBOT_ZONE_STYLES = `
  
  .zdlg-overlay { position: fixed; inset: 0; z-index: 30; display: flex; align-items: center; justify-content: center; padding: 12px; overscroll-behavior: contain; }
  .zdlg-backdrop { position: absolute; inset: 0; background: rgb(8 8 10 / .7); touch-action: none; }
  .zdlg {
    position: relative; display: flex; flex-direction: column; gap: 14px; width: min(900px, 100%); max-height: 100%; overflow-y: auto; overscroll-behavior: contain;
    padding: 20px 22px 18px; background: var(--bc-sheet); border: 1px solid var(--bc-border); border-radius: 24px;
    box-shadow: 0 24px 64px rgb(0 0 0 / .5);
  }
  .zdlg-head { display: flex; align-items: flex-start; gap: 12px; }
  .zdlg-head .t { flex: 1; min-width: 0; }
  .zdlg-head h3 { margin: 0; font: 600 22px/1.2 var(--bc-font-display); letter-spacing: 0; text-transform: none; color: var(--bc-text); }
  .zdlg-head p { margin: 4px 0 0; font-size: 14px; color: var(--bc-text-2); }
  .zdlg-head .zclose { width: 48px; height: 48px; flex: none; display: grid; place-items: center; border-radius: 14px; border: 1px solid var(--bc-border-strong); background: var(--bc-surface); }
  .zmap { flex: none; display: flex; align-items: center; justify-content: center; background: var(--bc-surface); border-radius: var(--bc-radius-inner); overflow: hidden; }
  .zmap canvas { display: block; touch-action: none; cursor: crosshair; }
  .zmsg { margin: 0; display: flex; align-items: center; justify-content: center; height: min(64vh, 560px); padding: 0 24px; text-align: center; font-size: 15px; color: var(--bc-text-2); background: var(--bc-surface); border-radius: var(--bc-radius-inner); }
  .zmsg.alert { color: var(--bc-red); }
  
  .zmodes .segmented button.active { background: var(--bc-green); }
  .zmodes .segmented button.active.washes { background: var(--bc-amber); }
  .zmodes .segmented button { font-size: 13px; padding: 0 2px; }
  .zrest { margin: 8px 0 0; font-size: 13px; color: var(--bc-text-2); }
  .zdlg-foot { display: flex; align-items: center; gap: 10px; }
  .zdlg-foot .zinfo { flex: 1; font-size: 14px; color: var(--bc-text-2); }
  @media (max-width: 480px) { .zdlg-foot { flex-wrap: wrap; } .zdlg-foot .zinfo { flex: 1 0 100%; } .zdlg-foot button { flex: 1; } }
  .zdlg-foot button { min-height: 52px; padding: 0 22px; border-radius: var(--bc-radius-inner); background: var(--bc-surface); font-size: 15px; font-weight: 500; }
  .zdlg-foot button:not(:disabled):active { background: var(--bc-border); }
  .zdlg-foot button:disabled { color: var(--bc-text-2); opacity: .5; cursor: default; }
  .zdlg-foot button.zgo:not(:disabled) { background: var(--bc-green); color: var(--bc-bg); }
  
  .rooms button.zone-open { display: inline-flex; align-items: center; gap: 8px; border: 1px dashed var(--bc-border-strong); background: transparent; color: var(--bc-text); }
  .rooms button.zone-open .icon { width: 20px; height: 20px; }
  .rooms button.zone-open:not(:disabled):active { background: var(--bc-border); }
  .rooms button.zone-open:disabled { opacity: .5; }
`;

const MM_PER_PX = 12.5;
const MIN_SIDE_MM = 300;
const PAD = 24;
const BG = [35, 37, 43];

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('mappa non caricata'));
    img.src = src;
  });

const fmtMeters = (mm) => (mm / 1000).toFixed(1).replace('.', ',');

export class RobotZone {
  status = null; 
  error = '';
  rect = null; 

  constructor({ services, store, robot, hassUrl, onChange }) {
    Object.assign(this, { services, store, robot, hassUrl, onChange });
  }

  get scale() {
    return this.robot.zone?.mm_per_px ?? MM_PER_PX;
  }

  async open() {
    this.status = 'loading';
    this.rect = null;
    this.onChange();
    const token = (this.token = {});
    try {
      const picture = this.store.get(this.robot.map)?.attributes?.entity_picture;
      if (!picture) throw new Error('Mappa non disponibile.');
      const [pos, img] = await Promise.all([this.services.vacuumPosition(this.robot.vacuum), loadImage(this.hassUrl(picture))]);
      if (this.token !== token) return;
      this.#prepare(img, pos);
      this.status = 'ready';
    } catch (err) {
      if (this.token !== token) return;
      this.status = 'error';
      this.error = err?.message ?? String(err);
    }
    this.onChange();
  }

  close() {
    this.token = null;
    this.status = null;
    this.canvas = null;
    this.base = null;
    this.rect = null;
    this.onChange();
  }

  
  #prepare(img, pos) {
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    const full = document.createElement('canvas');
    full.width = w;
    full.height = h;
    const g = full.getContext('2d', { willReadFrequently: true });
    g.drawImage(img, 0, 0);
    const { data } = g.getImageData(0, 0, w, h);
    let [minX, minY, maxX, maxY] = [w, h, 0, 0];
    let [rMinX, rMinY, rMaxX, rMaxY, dark] = [w, h, 0, 0, 0];
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const k = (y * w + x) * 4;
        const [r, gr, b, a] = [data[k], data[k + 1], data[k + 2], data[k + 3]];
        if (a < 10 || (r > 245 && gr > 245 && b > 245)) continue;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
        
        if (a > 200 && r < 35 && gr < 35 && b < 35) {
          dark++;
          if (x < rMinX) rMinX = x;
          if (x > rMaxX) rMaxX = x;
          if (y < rMinY) rMinY = y;
          if (y > rMaxY) rMaxY = y;
        }
      }
    }
    if (maxX <= minX || maxY <= minY) throw new Error('La mappa è vuota.');
    const ringW = rMaxX - rMinX;
    const ringH = rMaxY - rMinY;
    if (dark < 100 || ringW < 20 || ringW > 120 || Math.abs(ringW - ringH) > 6) throw new Error('Non trovo il robot sulla mappa.');
    const [robotPxX, robotPxY] = [(rMinX + rMaxX) / 2, (rMinY + rMaxY) / 2];
    this.calib = { ox: robotPxX - pos.x / this.scale, oy: robotPxY + pos.y / this.scale };
    const cx = Math.max(0, minX - PAD);
    const cy = Math.max(0, minY - PAD);
    const cw = Math.min(w, maxX + PAD) - cx;
    const ch = Math.min(h, maxY + PAD) - cy;
    this.crop = { x: cx, y: cy, w: cw, h: ch };
    const base = document.createElement('canvas');
    base.width = cw;
    base.height = ch;
    const bg = base.getContext('2d');
    const out = bg.createImageData(cw, ch);
    for (let y = 0; y < ch; y++) {
      for (let x = 0; x < cw; x++) {
        const s = ((y + cy) * w + x + cx) * 4;
        const d = (y * cw + x) * 4;
        const empty = data[s + 3] < 10 || (data[s] > 245 && data[s + 1] > 245 && data[s + 2] > 245);
        out.data[d] = empty ? BG[0] : data[s];
        out.data[d + 1] = empty ? BG[1] : data[s + 1];
        out.data[d + 2] = empty ? BG[2] : data[s + 2];
        out.data[d + 3] = 255;
      }
    }
    bg.putImageData(out, 0, 0);
    this.base = base;
  }

   
  zone() {
    const r = this.rect;
    if (!r || !this.calib) return null;
    const k = this.crop.w / this.canvas.width;
    const toX = (px) => (this.crop.x + px * k - this.calib.ox) * this.scale;
    const toY = (py) => (this.calib.oy - (this.crop.y + py * k)) * this.scale;
    const zone = { x1: toX(r.x1), y1: toY(r.y1), x2: toX(r.x2), y2: toY(r.y2) };
    const [wmm, hmm] = [Math.abs(zone.x2 - zone.x1), Math.abs(zone.y2 - zone.y1)];
    return wmm >= MIN_SIDE_MM && hmm >= MIN_SIDE_MM ? { ...zone, wmm, hmm } : null;
  }

  info() {
    const z = this.zone();
    if (z) return `${fmtMeters(z.wmm)} × ${fmtMeters(z.hmm)} m · ${((z.wmm * z.hmm) / 1e6).toFixed(1).replace('.', ',')} m²`;
    return this.rect ? 'Zona troppo piccola' : 'Trascina sulla mappa per disegnare la zona';
  }

  clear() {
    this.rect = null;
    this.#draw();
  }

   
  mount(root) {
    const host = root.querySelector('[data-zmap]');
    if (!host || this.status !== 'ready' || !this.base) return;
    if (this.canvas?.isConnected) return;
    const canvas = document.createElement('canvas');
    
    const box = host.getBoundingClientRect();
    const fit = Math.min(box.width / this.crop.w, Math.min(window.innerHeight * 0.58, 560) / this.crop.h);
    
    canvas.width = Math.max(1, Math.floor(this.crop.w * fit));
    canvas.height = Math.max(1, Math.floor(this.crop.h * fit));
    host.append(canvas);
    this.canvas = canvas;
    let start = null;
    const at = (ev) => {
      const b = canvas.getBoundingClientRect();
      const x = ((ev.clientX - b.left) / b.width) * canvas.width;
      const y = ((ev.clientY - b.top) / b.height) * canvas.height;
      return { x: Math.min(canvas.width, Math.max(0, x)), y: Math.min(canvas.height, Math.max(0, y)) };
    };
    canvas.addEventListener('pointerdown', (ev) => {
      canvas.setPointerCapture(ev.pointerId);
      start = at(ev);
      this.rect = { x1: start.x, y1: start.y, x2: start.x, y2: start.y };
      this.#draw();
    });
    canvas.addEventListener('pointermove', (ev) => {
      if (!start) return;
      const p = at(ev);
      this.rect = { x1: start.x, y1: start.y, x2: p.x, y2: p.y };
      this.#draw();
    });
    const end = () => {
      if (!start) return;
      start = null;
      if (!this.zone()) this.rect = null;
      this.#draw();
      this.onChange();
    };
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', end);
    this.#draw();
  }

  #draw() {
    const c = this.canvas;
    if (!c || !this.base) return;
    const g = c.getContext('2d');
    g.drawImage(this.base, 0, 0, c.width, c.height);
    const r = this.rect;
    if (!r) return;
    const [x, y, w, h] = [Math.min(r.x1, r.x2), Math.min(r.y1, r.y2), Math.abs(r.x2 - r.x1), Math.abs(r.y2 - r.y1)];
    g.fillStyle = 'rgba(140, 199, 154, .28)';
    g.fillRect(x, y, w, h);
    g.strokeStyle = '#8CC79A';
    g.lineWidth = 3;
    g.strokeRect(x, y, w, h);
  }
}

 
export function zoneButton(enabled) {
  return `<button class="zone-open" ${enabled ? 'data-zone-open' : 'disabled'}>${icon('mdi:vector-rectangle')}Disegna una zona</button>`;
}

 
export function renderZoneDialog(robotZone, { canGo, controls }) {
  if (!robotZone?.status) return '';
  const ready = robotZone.status === 'ready';
  const body = ready
    ? '<div class="zmap" data-keep data-zmap></div>'
    : `<p class="zmsg ${robotZone.status === 'error' ? 'alert' : ''}">${robotZone.status === 'loading' ? 'Carico la mappa…' : esc(robotZone.error)}</p>`;
  return `
    <div class="zdlg-overlay">
      <div class="zdlg-backdrop" data-zone-close></div>
      <div class="zdlg" role="dialog" aria-modal="true" aria-label="Zona da pulire">
        <div class="zdlg-head">
          <div class="t"><h3>Zona da pulire</h3><p>Disegna un rettangolo sulla mappa: il robot pulisce solo lì, una passata.</p></div>
          <button class="zclose" data-zone-close aria-label="Chiudi">${icon('mdi:close')}</button>
        </div>
        ${body}
        ${controls?.modes ? `<div class="zmodes"><div class="segmented n4">${controls.modes}</div>${controls.rest ? `<p class="zrest">${esc(controls.rest)}</p>` : ''}</div>` : ''}
        <div class="zdlg-foot">
          <span class="zinfo num">${ready ? esc(robotZone.info()) : ''}</span>
          <button data-zone-clear ${ready && robotZone.rect ? '' : 'disabled'}>Cancella</button>
          <button class="zgo" data-zone-go ${ready && robotZone.zone() && canGo ? '' : 'disabled'}>Pulisci qui</button>
        </div>
      </div>
    </div>`;
}
