// Basecamp UI · PolyForm Noncommercial License 1.0.0 · https://polyformproject.org/licenses/noncommercial/1.0.0


const SCENES = {
  front: { sky: ['#9bb8d4', '#e8d9bd'], ground: '#5b6b4a', label: 'Fronte' },
  entrance: { sky: ['#b9c6cf', '#d9d4c6'], ground: '#8a8478', label: 'Ingresso' },
  back: { sky: ['#8fb2cf', '#dfe8d2'], ground: '#4f7a45', label: 'Retro' },
  intercom: { sky: ['#a7bccd', '#d6d2c4'], ground: '#7b776c', label: 'Citofono' },
};

class FakeCam extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = '<style>:host{display:block;position:relative;overflow:hidden;background:#101114}canvas{width:100%;height:100%;display:block;object-fit:cover}</style><canvas width="640" height="360"></canvas>';
  }
  setConfig(cfg) { this.cfg = cfg; this.draw(); }
  set hass(_) {}
  connectedCallback() { this.draw(); this.timer = setInterval(() => this.draw(), 1000); }
  disconnectedCallback() { clearInterval(this.timer); }
  draw() {
    const c = this.shadowRoot.querySelector('canvas');
    const g = c.getContext('2d', { willReadFrequently: true });
    const sc = SCENES[this.cfg?.url] ?? SCENES.front;
    const W = c.width, H = c.height, horizon = H * 0.58;
    const sky = g.createLinearGradient(0, 0, 0, horizon);
    sky.addColorStop(0, sc.sky[0]); sky.addColorStop(1, sc.sky[1]);
    g.fillStyle = sky; g.fillRect(0, 0, W, horizon);
    g.fillStyle = sc.ground; g.fillRect(0, horizon, W, H - horizon);
    
    g.fillStyle = '#d8cfbd'; g.fillRect(W * 0.08, horizon - 110, 230, 110);
    g.fillStyle = '#7a4f3a'; g.beginPath(); g.moveTo(W * 0.08 - 12, horizon - 110); g.lineTo(W * 0.08 + 115, horizon - 160); g.lineTo(W * 0.08 + 242, horizon - 110); g.fill();
    g.fillStyle = '#4a5560'; g.fillRect(W * 0.08 + 30, horizon - 70, 36, 44); g.fillRect(W * 0.08 + 150, horizon - 70, 36, 44);
    g.fillStyle = '#3a3d42'; g.fillRect(W * 0.62, horizon - 70, 190, 70);
    for (let x = W * 0.62; x < W * 0.62 + 190; x += 14) { g.fillStyle = '#25272b'; g.fillRect(x, horizon - 70, 5, 70); }
    
    for (const [x, r] of [[W * 0.52, 46], [W * 0.93, 58], [W * 0.03, 40]]) { g.fillStyle = '#3d5a37'; g.beginPath(); g.arc(x, horizon - r * 0.7, r, 0, 7); g.fill(); g.fillStyle = '#4b3a2a'; g.fillRect(x - 4, horizon - r * 0.4, 8, r * 0.5); }
    
    g.fillStyle = 'rgba(190,184,170,.85)'; g.beginPath(); g.moveTo(W * 0.4, H); g.lineTo(W * 0.6, H); g.lineTo(W * 0.53, horizon); g.lineTo(W * 0.47, horizon); g.fill();
    
    const id = g.getImageData(0, 0, W, H), d = id.data;
    for (let i = 0; i < d.length; i += 16) { const n = (Math.random() - 0.5) * 14; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
    g.putImageData(id, 0, 0);
    
    const t = new Date();
    g.font = '600 15px monospace'; g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(W - 112, H - 36, 102, 26);
    g.fillStyle = '#fff'; g.fillText(t.toLocaleTimeString('it-IT'), W - 102, H - 18);
  }
}
if (!customElements.get('webrtc-camera')) customElements.define('webrtc-camera', FakeCam);
