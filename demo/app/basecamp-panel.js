// Basecamp UI · PolyForm Noncommercial License 1.0.0 · https://polyformproject.org/licenses/noncommercial/1.0.0


const BOOT_CLASS = 'bc-early-boot';

const BOOT_HTML = `
  <style>
    .${BOOT_CLASS} { position: absolute; inset: 0; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 18px; background: #131417; color: #EDEBE6; font-family: Sora, system-ui, sans-serif; }
    .${BOOT_CLASS} svg { width: 56px; height: 56px; color: #E8A33D; animation: bc-early-pulse 1.6s ease-in-out infinite; }
    .${BOOT_CLASS} .name { font-size: 26px; font-weight: 600; letter-spacing: .01em; }
    .${BOOT_CLASS} .bar { position: relative; width: 160px; height: 4px; border-radius: 2px; background: #2A2C33; overflow: hidden; }
    .${BOOT_CLASS} .bar::after { content: ''; position: absolute; top: 0; bottom: 0; width: 40%; border-radius: 2px; background: #E8A33D; animation: bc-early-slide 1.1s ease-in-out infinite; }
    .${BOOT_CLASS} .msg { font-size: 13px; color: #A3A29C; min-height: 18px; }
    @keyframes bc-early-slide { from { left: -40%; } to { left: 100%; } }
    @keyframes bc-early-pulse { 50% { opacity: .55; transform: scale(.94); } }
    @media (prefers-reduced-motion: reduce) { .${BOOT_CLASS} svg, .${BOOT_CLASS} .bar::after { animation: none; } }
  </style>
  <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M14,6L10.25,11L13.1,14.8L11.5,16C9.81,13.75 7,10 7,10L1,18H23L14,6Z"/></svg>
  <span class="name">Basecamp</span><span class="bar"></span><span class="msg">Caricamento…</span>`;

 
function findPanel(root = document) {
  const direct = root.querySelector('basecamp-panel');
  if (direct) return direct;
  for (const el of root.querySelectorAll('*')) {
    if (el.shadowRoot) {
      const found = findPanel(el.shadowRoot);
      if (found) return found;
    }
  }
  return null;
}

 
function showEarlyBoot() {
  const start = performance.now();
  const tick = () => {
    if (customElements.get('basecamp-panel')) return;
    const panel = findPanel();
    if (panel && !panel.shadowRoot && !panel.querySelector(`:scope > .${BOOT_CLASS}`)) {
      const box = document.createElement('div');
      box.className = BOOT_CLASS;
      box.setAttribute('role', 'status');
      box.innerHTML = BOOT_HTML;
      panel.style.display = 'block';
      panel.style.position = 'relative';
      panel.style.height = '100%';
      panel.append(box);
      return;
    }
    if (performance.now() - start < 5000) requestAnimationFrame(tick);
  };
  tick();
}

performance.mark('bc:ingresso');
showEarlyBoot();
export const ready = import('./panel.js');
