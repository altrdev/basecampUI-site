// Basecamp UI · PolyForm Noncommercial License 1.0.0 · https://polyformproject.org/licenses/noncommercial/1.0.0


const HOLD_MS = 1000;
const DOGS = 7;
const LIFE_MS = 4200;
const WET_MS = 7000;

const COATS = [
  ['#C9A27A', '#7C5A3B', '#F6EEDF'],
  ['#EFE6D6', '#A99877', '#FFFFFF'],
  ['#6B5444', '#2F241C', '#C9B8A3'],
  ['#D9A441', '#98671A', '#F8E7C0'],
  ['#B5B4AE', '#5E5D59', '#F2F1EC'],
];

const STYLES = `
  :host { position: fixed; inset: 0; z-index: 2147483000; }
  .scrim { position: absolute; inset: 0; overflow: hidden; touch-action: none; }
  .spot { position: absolute; }
  .dog { position: absolute; inset: 0; opacity: 0; transform: rotate(var(--tilt)); animation: pop var(--life) ease-out var(--delay) both; }
  .dog svg { width: 100%; height: 100%; overflow: visible; animation: wobble 1.2s ease-in-out var(--delay) infinite alternate; }
  .tongue { transform-box: fill-box; transform-origin: 50% 0; animation: lick .6s ease-in-out var(--delay) infinite; }
  
  .wet { position: absolute; inset: 0; pointer-events: none; }
  .film { position: absolute; left: 6%; top: 46%; width: 88%; height: 54%; border-radius: 48% 52% 46% 54%; opacity: 0;
    background: radial-gradient(ellipse at 40% 35%, rgba(255, 255, 255, .34), rgba(255, 255, 255, .1) 60%, transparent 76%);
    -webkit-backdrop-filter: blur(3px); backdrop-filter: blur(3px);
    animation: film var(--wet) ease-out var(--delay) both; }
  .drip { position: absolute; left: var(--x); top: var(--y); width: var(--w); height: 0; border-radius: 999px; opacity: 0;
    background: linear-gradient(90deg, rgba(255, 255, 255, .1), rgba(255, 255, 255, .6) 35%, rgba(255, 255, 255, .14) 70%, rgba(255, 255, 255, .34));
    box-shadow: 0 0 2px rgba(255, 255, 255, .3);
    animation: drip var(--wet) cubic-bezier(.35, .1, .4, 1) var(--d) both; }
  .drip::after { content: ''; position: absolute; left: 50%; bottom: calc(var(--w) * -1.2); width: calc(var(--w) * 2.1); aspect-ratio: 1;
    transform: translateX(-50%); border-radius: 50%;
    background: radial-gradient(circle at 35% 30%, #fff 0 12%, rgba(255, 255, 255, .5) 30%, rgba(255, 255, 255, .14) 72%); }
  @keyframes pop {
    0% { opacity: 0; transform: rotate(var(--tilt)) translateY(40px) scale(.3); }
    12% { opacity: 1; transform: rotate(var(--tilt)) scale(1); }
    86% { opacity: 1; transform: rotate(var(--tilt)) scale(1); }
    100% { opacity: 0; transform: rotate(var(--tilt)) scale(1.06); }
  }
  @keyframes wobble { from { transform: rotate(-3deg) translateX(-4px); } to { transform: rotate(3deg) translateX(4px); } }
  @keyframes lick { 0%, 100% { transform: rotate(-18deg) scaleY(.74); } 50% { transform: rotate(18deg) scaleY(1.1); } }
  @keyframes film { 0% { opacity: 0; transform: scaleX(.3); } 14% { opacity: 1; transform: scaleX(1); } 70% { opacity: .75; } 100% { opacity: 0; transform: scaleX(1.06); } }
  @keyframes drip { 0% { height: 0; opacity: 0; } 6% { opacity: 1; } 72% { height: var(--h); opacity: .95; } 100% { height: calc(var(--h) * 1.18); opacity: 0; } }
  @media (prefers-reduced-motion: reduce) { .dog svg, .tongue { animation: none; } }
`;

const hex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const mix = (a, b, t) => `rgb(${hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * t)).join(',')})`;

const dogSvg = ([coat, shade, patch], id) => {
  const light = mix(coat, '#FFFFFF', 0.3);
  const dark = mix(coat, shade, 0.7);
  return `
  <svg viewBox="0 0 200 230" aria-hidden="true">
    <defs>
      <radialGradient id="f${id}" cx=".38" cy=".28" r=".85"><stop offset="0" stop-color="${light}"/><stop offset=".55" stop-color="${coat}"/><stop offset="1" stop-color="${dark}"/></radialGradient>
      <linearGradient id="e${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shade}"/><stop offset="1" stop-color="${mix(shade, '#000000', 0.35)}"/></linearGradient>
      <radialGradient id="m${id}" cx=".4" cy=".3" r=".85"><stop offset="0" stop-color="${patch}"/><stop offset="1" stop-color="${mix(patch, shade, 0.28)}"/></radialGradient>
      <radialGradient id="n${id}" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="#4A4947"/><stop offset="1" stop-color="#0D0C0B"/></radialGradient>
      <linearGradient id="t${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F7A892"/><stop offset="1" stop-color="#CE5F55"/></linearGradient>
    </defs>
    <path d="M56 52C22 54 8 112 28 156C46 178 72 146 72 102Z" fill="url(#e${id})"/>
    <path d="M144 52C178 54 192 112 172 156C154 178 128 146 128 102Z" fill="url(#e${id})"/>
    <ellipse cx="100" cy="100" rx="68" ry="70" fill="url(#f${id})"/>
    <ellipse cx="100" cy="66" rx="13" ry="40" fill="url(#m${id})" opacity=".9"/>
    <ellipse cx="72" cy="90" rx="21" ry="18" fill="${shade}" opacity=".45"/>
    <ellipse cx="128" cy="90" rx="21" ry="18" fill="${shade}" opacity=".45"/>
    <ellipse cx="100" cy="140" rx="46" ry="34" fill="url(#m${id})"/>
    <g>
      <ellipse cx="72" cy="90" rx="10" ry="11" fill="#14100D"/><circle cx="72" cy="90" r="6.5" fill="#3B2416"/>
      <circle cx="68.5" cy="86" r="3.4" fill="#fff" opacity=".95"/><circle cx="75.5" cy="94" r="1.6" fill="#fff" opacity=".6"/>
      <ellipse cx="128" cy="90" rx="10" ry="11" fill="#14100D"/><circle cx="128" cy="90" r="6.5" fill="#3B2416"/>
      <circle cx="124.5" cy="86" r="3.4" fill="#fff" opacity=".95"/><circle cx="131.5" cy="94" r="1.6" fill="#fff" opacity=".6"/>
      <path d="M58 74Q72 66 86 74M114 74Q128 66 142 74" fill="none" stroke="${shade}" stroke-width="3" stroke-linecap="round" opacity=".7"/>
    </g>
    <path d="M70 154Q100 158 130 154Q126 192 100 194Q74 192 70 154Z" fill="#3A1717"/>
    <g class="tongue">
      <path d="M82 154H118V190Q118 224 100 224Q82 224 82 190Z" fill="url(#t${id})"/>
      <path d="M100 160V204" stroke="#B24A3F" stroke-width="3" stroke-linecap="round" opacity=".6"/>
      <path d="M89 162Q87 190 91 206" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".4"/>
      <ellipse cx="108" cy="212" rx="4" ry="2.4" fill="#fff" opacity=".5"/>
    </g>
    <ellipse cx="100" cy="124" rx="18" ry="12.5" fill="url(#n${id})"/>
    <ellipse cx="94" cy="119.5" rx="7.5" ry="3.6" fill="#fff" opacity=".5"/>
    <ellipse cx="93" cy="127" rx="3" ry="2" fill="#000" opacity=".7"/><ellipse cx="107" cy="127" rx="3" ry="2" fill="#000" opacity=".7"/>
    <path d="M100 135V150" stroke="#14100D" stroke-width="3.5" stroke-linecap="round"/>
    <g fill="${shade}" opacity=".45"><circle cx="78" cy="146" r="1.7"/><circle cx="72" cy="140" r="1.7"/><circle cx="82" cy="138" r="1.7"/><circle cx="122" cy="146" r="1.7"/><circle cx="128" cy="140" r="1.7"/><circle cx="118" cy="138" r="1.7"/></g>
  </svg>`;
};

const rand = (min, max) => min + Math.random() * (max - min);

let open = null;

 
function place(taken, vw, vh, size) {
  for (let s = size; s >= 90; s *= 0.93) {
    const w = s;
    const h = s * 1.15;
    for (let n = 0; n < 60; n++) {
      const x = rand(4, Math.max(5, vw - w - 4));
      const y = rand(4, Math.max(5, vh - h - 4));
      if (taken.every((t) => x + w + 6 <= t.x || t.x + t.w + 6 <= x || y + h + 6 <= t.y || t.y + t.h + 6 <= y)) {
        taken.push({ x, y, w, h });
        return { x, y, size: s };
      }
    }
  }
  const x = rand(4, Math.max(5, vw - size - 4));
  const y = rand(4, Math.max(5, vh - size * 1.15 - 4));
  return { x, y, size };
}

 
export function dogsLickScreen() {
  if (open) return;
  const host = document.createElement('div');
  const root = host.attachShadow({ mode: 'open' });
  let lastDelay = 0;
  const taken = [];
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const spots = Array.from({ length: DOGS }, (_, i) => {
    const { x, y, size } = place(taken, vw, vh, Math.min(rand(160, 240), vw * 0.4));
    const delay = i * 0.4 + rand(0, 0.3);
    lastDelay = delay;
    const drips = Array.from({ length: 4 }, () =>
      `<span class="drip" style="--x:${rand(22, 78).toFixed(1)}%;--y:${rand(66, 76).toFixed(1)}%;--w:${rand(4, 8).toFixed(1)}px;--h:${Math.round(size * rand(0.25, 0.6))}px;--d:${(delay + rand(0.7, 2.2)).toFixed(2)}s"></span>`,
    ).join('');
    return `<div class="spot" style="width:${size}px;height:${size * 1.15}px;left:${Math.round(x)}px;top:${Math.round(y)}px;--delay:${delay}s;--life:${LIFE_MS}ms;--wet:${WET_MS}ms;--tilt:${rand(-12, 12).toFixed(1)}deg">
      <div class="wet"><span class="film"></span>${drips}</div>
      <div class="dog">${dogSvg(COATS[i % COATS.length], i)}</div></div>`;
  });
  root.innerHTML = `<style>${STYLES}</style><div class="scrim">${spots.join('')}</div>`;
  const close = () => {
    clearTimeout(timer);
    host.remove();
    open = null;
  };
  root.querySelector('.scrim').addEventListener('pointerdown', close);
  const timer = setTimeout(close, (lastDelay + 2.5) * 1000 + WET_MS);
  open = host;
  document.body.append(host);
}

 
export function onLongPress(root, selector, fn) {
  let timer = null;
  let start = null;
  const cancel = () => {
    clearTimeout(timer);
    timer = null;
  };
  root.addEventListener('pointerdown', (ev) => {
    if (!ev.target.closest(selector)) return;
    start = { x: ev.clientX, y: ev.clientY };
    cancel();
    timer = setTimeout(() => {
      timer = null;
      fn();
    }, HOLD_MS);
  });
  root.addEventListener('pointermove', (ev) => {
    if (timer && start && Math.hypot(ev.clientX - start.x, ev.clientY - start.y) > 12) cancel();
  });
  for (const type of ['pointerup', 'pointercancel', 'pointerleave']) root.addEventListener(type, cancel);
  root.addEventListener('contextmenu', (ev) => {
    if (ev.target.closest(selector)) ev.preventDefault();
  });
}
