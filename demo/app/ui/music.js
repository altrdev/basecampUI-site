// Basecamp UI · PolyForm Noncommercial License 1.0.0 · https://polyformproject.org/licenses/noncommercial/1.0.0


import { bslider, icon } from './base.js';
import { esc } from '../core/format.js';

export const MUSIC_STYLES = `
  .ma-state { display: flex; flex-direction: column; gap: 12px; padding: 20px; border-radius: 16px; background: var(--bc-surface); }
  .ma-state > .icon { width: 32px; height: 32px; color: var(--bc-music); }
  .ma-state.warn > .icon { color: var(--bc-amber); }
  .ma-state h3 { margin: 0; font: 600 18px/1.2 var(--bc-font-display); letter-spacing: 0; text-transform: none; color: var(--bc-text); }
  .ma-state p { margin: 0; font-size: 14px; color: var(--bc-text-2); }
  .ma-state .err { color: var(--bc-red); }
  .ma-token, .ma-search input {
    width: 100%; min-height: 48px; padding: 0 14px; border-radius: 12px; border: 1px solid var(--bc-border-strong);
    background: var(--bc-card); color: var(--bc-text); font: inherit; font-size: 15px;
  }
  .ma-token:focus-visible, .ma-search input:focus-visible { outline: 2px solid var(--bc-music); outline-offset: 1px; }
  .ma-primary { min-height: 48px; padding: 0 18px; border-radius: 14px; background: var(--bc-text); color: var(--bc-bg); font-weight: 600; text-align: center; }
  .ma-primary:disabled { opacity: .5; cursor: default; }

  .ma-tabs { display: flex; border: 1px solid var(--bc-border-strong); border-radius: 12px; overflow: hidden; flex: none; }
  .ma-tabs button { flex: 1; min-height: var(--bc-touch); font-size: 14px; font-weight: 500; color: var(--bc-text-2); text-align: center; }
  .ma-tabs button + button { border-left: 1px solid var(--bc-border-strong); }
  .ma-tabs button.active { color: var(--bc-music); background: color-mix(in srgb, var(--bc-music) 14%, transparent); }

  .ma-chips { display: flex; flex-wrap: wrap; gap: 8px; }
  .ma-chip { display: inline-flex; align-items: center; gap: 8px; min-height: var(--bc-touch); padding: 0 14px; border-radius: 14px; background: var(--bc-surface); border: 1px solid transparent; font-size: 14px; font-weight: 500; }
  .ma-chip .icon { width: 18px; height: 18px; color: var(--bc-text-2); }
  
  .ma-chip.on, .ma-radio.on, .ma-pl.on { color: var(--bc-text); }
  .ma-chip.on { border-color: color-mix(in srgb, var(--bc-music) 55%, transparent); background: color-mix(in srgb, var(--bc-music) 14%, transparent); }
  .ma-chip.on .icon { color: var(--bc-music); }
  .ma-chip.dashed { background: none; border: 1px dashed var(--bc-border-strong); color: var(--bc-text-2); }
  .ma-chip.dashed.open { border-style: solid; color: var(--bc-text); }
  .ma-group { display: flex; flex-direction: column; gap: 6px; }
  .ma-group .setting { min-height: 60px; }
  .ma-group .setting.on { color: var(--bc-text); }
  .ma-group .setting.on > .icon { color: var(--bc-music); }
  .ma-group .setting.on .knob { background: var(--bc-music); }
  .ma-eq { display: inline-flex; align-items: flex-end; gap: 2px; height: 12px; }
  .ma-eq i { width: 3px; border-radius: 1px; background: var(--bc-music); height: 6px; }
  .ma-eq i:nth-child(2) { height: 12px; } .ma-eq i:nth-child(3) { height: 8px; }

  .ma-cover { --h: 320; flex: none; width: 44px; height: 44px; border-radius: 10px; object-fit: cover; background: linear-gradient(140deg, hsl(var(--h) 30% 36%), hsl(calc(var(--h) + 35) 28% 20%)); display: grid; place-items: center; color: hsl(var(--h) 40% 86%); }
  .ma-cover .icon { width: 50%; height: 50%; opacity: .8; }
  .ma-cover.round { border-radius: 50%; }

  .ma-now { background: var(--bc-surface); border-radius: 16px; padding: 16px; display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 14px 16px; align-items: center; }
  .ma-now .ma-cover { width: 132px; height: 132px; border-radius: 16px; }
  .ma-meta { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
  .ma-meta .src { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: var(--bc-text-2); }
  .ma-meta .src .icon { width: 15px; height: 15px; }
  .ma-meta .title { font: 600 24px/1.15 var(--bc-font-display); overflow-wrap: anywhere; }
  .ma-meta .artist { font-size: 14px; color: var(--bc-text-2); }
  .ma-progress { margin-top: 0; }
  .ma-meta .idle { font: 600 18px/1.2 var(--bc-font-display); color: var(--bc-text-2); }
  .ma-progress { display: flex; align-items: center; gap: 10px; margin-top: 8px; font-size: 12px; color: var(--bc-text-2); }
  
  .ma-progress .bslider-row { flex: 1; }
  .ma-progress .bslider { background: none; border: 0; border-radius: 0; overflow: visible; }
  .ma-progress .bslider::before { content: ''; position: absolute; left: 0; right: 0; top: 19px; height: 6px; border-radius: 3px; background: var(--bc-border-strong); }
  .ma-progress .bslider .fill { inset: 19px auto auto 0; height: 6px; border-radius: 3px; }
  .ma-transport { grid-column: 1 / -1; display: flex; align-items: center; justify-content: space-between; gap: 8px; }
  .ma-btn { width: 52px; height: 52px; flex: none; display: grid; place-items: center; border-radius: 14px; border: 1px solid var(--bc-border-strong); background: var(--bc-card); }
  .ma-btn .icon { width: 24px; height: 24px; }
  .ma-btn:not(:disabled):active { background: var(--bc-border); }
  .ma-btn:disabled { opacity: .35; cursor: default; }
  .ma-btn.play { width: 64px; height: 64px; border-radius: 50%; border-color: transparent; background: var(--bc-text); color: var(--bc-bg); }
  .ma-btn.play .icon { width: 30px; height: 30px; }
  .ma-btn.act { color: var(--bc-music); border-color: color-mix(in srgb, var(--bc-music) 50%, transparent); }
  .ma-btn.small { width: var(--bc-touch); height: var(--bc-touch); border-radius: 12px; background: none; }
  .ma-btn.small .icon { width: 20px; height: 20px; }
  .ma-volume { grid-column: 1 / -1; display: flex; align-items: center; gap: 12px; font-size: 13px; color: var(--bc-text-2); }
  .ma-volume .bslider-row { flex: 1; }
  .ma-volume .v { min-width: 38px; text-align: right; }

  .ma-rows { display: flex; flex-direction: column; gap: 6px; }
  .ma-row { display: flex; align-items: center; gap: 6px; min-height: 56px; padding: 6px 8px 6px 10px; border-radius: var(--bc-radius-inner); background: var(--bc-surface); }
  .ma-row .main { flex: 1; min-width: 0; display: flex; align-items: center; gap: 12px; text-align: left; min-height: var(--bc-touch); }
  .ma-row .main:disabled { cursor: default; }
  .ma-txt { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
  .ma-txt .n { font-size: 15px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .ma-txt .s { font-size: 13px; color: var(--bc-text-2); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .ma-row .dur { font-size: 13px; color: var(--bc-text-2); padding: 0 4px; }
  .ma-row.current { background: color-mix(in srgb, var(--bc-music) 14%, var(--bc-surface)); }
  .ma-row.current .n { color: var(--bc-music); }
  .ma-handle { width: 36px; height: var(--bc-touch); flex: none; display: grid; place-items: center; color: var(--bc-text-2); touch-action: none; cursor: grab; }
  .ma-row.dragging { position: relative; z-index: 2; background: var(--bc-border); box-shadow: 0 10px 24px rgb(0 0 0 / .5); }
  .ma-rows.sorting .ma-row:not(.dragging) { transition: transform .12s; }
  .ma-links { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; }
  .ma-link { display: flex; flex-direction: column; gap: 4px; padding: 12px; border-radius: var(--bc-radius-inner); background: var(--bc-surface); font-size: 13px; color: var(--bc-text-2); text-align: left; min-width: 0; }
  .ma-link:active { filter: brightness(1.2); }
  .ma-link .icon { color: var(--bc-music); }
  .ma-link b { font: 500 20px/1.1 var(--bc-font-display); color: var(--bc-text); min-height: 22px; }
  .ma-crumb { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
  .ma-crumb .ghost { display: inline-flex; align-items: center; gap: 4px; padding-left: 8px; }
  .ma-crumb .ghost .icon { width: 18px; height: 18px; }
  .ma-browse-title { margin: 0; font: 600 20px/1.2 var(--bc-font-display); }
  .ma-more { font-size: 13px; color: var(--bc-text-2); margin: 10px 0 0; }

  .ma-radio-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 8px; }
  .ma-radio { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 10px 4px 8px; border-radius: var(--bc-radius-inner); background: var(--bc-surface); border: 1px solid transparent; min-width: 0; }
  .ma-radio .ma-cover { width: 52px; height: 52px; border-radius: 50%; background-color: var(--bc-card); }
  .ma-radio .n { font-size: 12px; line-height: 1.2; text-align: center; overflow-wrap: anywhere; }
  .ma-radio.on, .ma-pl.on { border-color: color-mix(in srgb, var(--bc-music) 55%, transparent); background: color-mix(in srgb, var(--bc-music) 14%, transparent); }
  .ma-radio:active, .ma-pl:active { filter: brightness(1.2); }
  .ma-pl-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
  .ma-pl { display: flex; flex-direction: column; gap: 8px; padding: 8px; border-radius: var(--bc-radius-inner); background: var(--bc-surface); border: 1px solid transparent; min-width: 0; text-align: left; }
  .ma-pl .ma-cover { width: 100%; height: auto; aspect-ratio: 1; border-radius: 10px; }
  .ma-pl .n { font-size: 14px; font-weight: 500; padding: 0 2px 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .ma-search { display: flex; flex-direction: column; gap: 8px; }
  .ma-search input { min-height: 52px; font-size: 16px; }
  .ma-hint { margin: 0; font-size: 14px; color: var(--bc-text-2); }

  
  .ma-mini { position: sticky; bottom: -28px; margin: auto -28px -28px; padding: 10px 28px; display: flex; align-items: center; gap: 12px; border-top: 1px solid var(--bc-border); background: var(--bc-card); }
  .ma-mini .ma-btn { width: var(--bc-touch); height: var(--bc-touch); }
  @media (max-width: 600px) {
    .ma-now { grid-template-columns: minmax(0, 1fr); }
    .ma-now .ma-cover { width: 96px; height: 96px; }
    .ma-btn { width: 46px; height: 46px; } .ma-btn.play { width: 58px; height: 58px; }
    .ma-radio-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
    .ma-pl-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .ma-links { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .ma-mini { bottom: -24px; margin: auto -16px -24px; padding: 10px 16px; }
  }
`;

const TABS = [['ascolto', 'In ascolto'], ['libreria', 'Libreria'], ['cerca', 'Cerca']];
const PLAYER_KEY = 'basecamp:musica:player';
const QUEUE_SHOWN = 8;
const PLAYLISTS_SHOWN = 6;

const RESULT_GROUPS = [
  ['artists', 'Artisti', 'mdi:account-music', true],
  ['albums', 'Album', 'mdi:album', false],
  ['tracks', 'Brani', 'mdi:music-note', false],
  ['playlists', 'Playlist', 'mdi:playlist-music', false],
  ['radio', 'Radio', 'mdi:radio', true],
];
const REPEAT_NEXT = { off: 'all', all: 'one', one: 'off' };

const BROWSE = {
  artists: ['Artisti', 'mdi:account-music', 'music/artists/library_items', true],
  albums: ['Album', 'mdi:album', 'music/albums/library_items', false],
  tracks: ['Brani', 'mdi:music-note', 'music/tracks/library_items', false],
  podcasts: ['Podcast', 'mdi:podcast', 'music/podcasts/library_items', false],
};

const DRILL = {
  artists: ['albums', 'music/artists/artist_albums'],
  albums: ['tracks', 'music/albums/album_tracks'],
  podcasts: ['episodes', 'music/podcasts/podcast_episodes'],
};

 
export function massPlayers(mass) {
  return [...mass.state.players.values()]
    .filter((p) => p.enabled !== false && !p.hide_in_ui)
    .sort((a, b) => Number(b.available) - Number(a.available) || a.name.localeCompare(b.name, 'it'));
}

const fmtTime = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const artistsOf = (item) => (item?.artists ?? []).map((a) => a.name).join(', ');
const playerIcon = (p) => (p.icon === 'mac' ? 'mdi:laptop' : /\btv\b/i.test(p.name) ? 'mdi:television' : 'mdi:speaker');

 
const queueOf = (mass, p) => mass.state.queues.get(p?.active_source) ?? mass.state.queues.get(p?.player_id) ?? null;

 
export function nowPlaying(mass, p) {
  if (!p) return null;
  const q = queueOf(mass, p);
  const item = q?.current_item;
  const m = p.current_media;
  const title = m?.title ?? item?.media_item?.name ?? item?.name;
  if (!title) return null;
  const playing = p.playback_state === 'playing';
  const since = playing && q?.elapsed_time_last_updated ? Date.now() / 1000 - q.elapsed_time_last_updated : 0;
  const duration = item?.duration ?? m?.duration ?? 0;
  const elapsed = Math.max(0, Math.min(duration || Infinity, (q?.elapsed_time ?? m?.elapsed_time ?? 0) + since));
  return {
    title,
    artist: m?.artist ?? artistsOf(item?.media_item),
    album: m?.album ?? item?.media_item?.album?.name ?? '',
    image: item?.image ?? item?.media_item?.metadata?.images?.[0] ?? null,
    imageUrl: m?.image_url ?? null,
    uri: item?.media_item?.uri ?? m?.uri ?? null,
    radio: (item?.media_item?.media_type ?? m?.media_type) === 'radio',
    duration,
    elapsed,
    playing,
  };
}

 
const isLeader = (p) => (p?.group_members ?? []).filter((id) => id !== p.player_id).length > 0;

const playingPlayer = (mass) => massPlayers(mass).find((p) => p.available && p.playback_state === 'playing') ?? null;

 
export function musicSummary(mass) {
  const { status } = mass.state;
  if (status === 'no-token') return ['Da collegare', ''];
  if (status === 'bad-token') return ['Token scaduto', 'warn'];
  if (status === 'connecting') return ['Collegamento…', ''];
  if (status !== 'ready') return ['Non raggiungibile', ''];
  const p = playingPlayer(mass);
  const now = nowPlaying(mass, p);
  return p ? [[p.name, now?.artist || now?.title].filter(Boolean).join(' · '), 'ok'] : ['Niente in riproduzione', ''];
}

 
export function musicPillData(mass) {
  
  if (!['ready', 'connecting', 'offline'].includes(mass?.state.status)) return null;
  const p = playingPlayer(mass);
  const now = nowPlaying(mass, p);
  if (!p || !now) return null;
  
  const cover = now.image?.proxy_id
    ? `${mass.server.replace(/\/$/, '')}/imageproxy/${encodeURIComponent(now.image.proxy_id)}?size=80`
    : /^https:/.test(now.imageUrl ?? '') ? now.imageUrl : null;
  return { name: p.name, info: [now.title, now.artist].filter(Boolean).join(' · '), cover };
}

export function musicSubtitle(mass) {
  if (mass.state.status !== 'ready') return '';
  const p = playingPlayer(mass);
  return p ? `${p.name} · in riproduzione` : 'Niente in riproduzione';
}

function tokenForm(ui, admin, text) {
  if (!admin) return `<p>${esc(text)} Lo collega un amministratore di Home Assistant, una volta per tutti i dispositivi.</p>`;
  return `
    <p>${esc(text)} Incolla il token a lunga durata creato nel profilo di Music Assistant: si salva in Home Assistant e vale per tutti i dispositivi.</p>
    <input class="ma-token" id="ma-token" type="password" autocomplete="off" spellcheck="false" placeholder="Token di Music Assistant" aria-label="Token di Music Assistant">
    ${ui.massError ? `<p class="err">${esc(ui.massError)}</p>` : ''}
    <button class="ma-primary" data-ma-connect ${ui.massBusy ? 'disabled' : ''}>${ui.massBusy ? 'Verifica…' : 'Collega'}</button>`;
}

 
export class MusicView {
  constructor({ mass, server, update, notify, kbd = false }) {
    Object.assign(this, { mass, server, update, notify, kbd });
    this.tab = 'ascolto';
    this.playerId = null;
    this.lib = null;
    this.items = [];
    this.itemsKey = null;
    this.allPlaylists = false;
    this.grouping = false;
    
    this.path = [];
    this.drag = null;
    this.query = '';
    this.results = null;
    this.searching = false;
    try {
      this.playerId = localStorage.getItem(PLAYER_KEY);
    } catch {
      
    }
    
    this.unlisten = mass.listen((event, id) => {
      if (event === 'queue_items_updated' && id === this.queue?.queue_id) this.loadItems(true);
    });
    
    this.tick = setInterval(() => this.tab === 'ascolto' && this.player?.playback_state === 'playing' && this.update(), 1000);
  }

  close() {
    this.unlisten?.();
    clearInterval(this.tick);
    clearTimeout(this.searchTimer);
  }

   
  get player() {
    const list = massPlayers(this.mass).filter((p) => p.available);
    return list.find((p) => p.player_id === this.playerId) ?? playingPlayer(this.mass) ?? list[0] ?? null;
  }

  get queue() {
    return queueOf(this.mass, this.player);
  }

  img(image, size = 160) {
    return image?.proxy_id ? `${this.server.replace(/\/$/, '')}/imageproxy/${encodeURIComponent(image.proxy_id)}?size=${size}` : null;
  }

  
  cover(image, fallback, { size = 160, round = false, url = null } = {}) {
    const src = this.img(image, size) ?? (url && /^https:/.test(url) ? url : null);
    const cls = `ma-cover ${round ? 'round' : ''}`;
    return src ? `<img class="${cls}" src="${esc(src)}" alt="" loading="lazy">` : `<span class="${cls}">${icon(fallback)}</span>`;
  }

  async loadLibrary() {
    if (this.lib || this.loadingLib) return;
    this.loadingLib = true;
    try {
      const [radios, playlists] = await Promise.all([
        this.mass.command('music/radios/library_items', { limit: 60, order_by: 'name' }),
        this.mass.command('music/playlists/library_items', { limit: 200, order_by: 'name' }),
      ]);
      
      const fav = (list) => [...list].sort((a, b) => Number(b.favorite) - Number(a.favorite));
      this.lib = { radios: fav(radios), playlists: fav(playlists), lists: {} };
      
      for (const [kind, [, , command]] of Object.entries(BROWSE)) {
        this.mass.command(command, { limit: 200, order_by: 'sort_name' }).then((items) => {
          this.lib.lists[kind] = (items ?? []).filter((x) => x?.uri);
          this.update();
        }, () => {});
      }
    } catch {
      this.lib = { radios: [], playlists: [], failed: true };
    }
    this.loadingLib = false;
    this.update();
  }

  async loadItems(force = false) {
    const q = this.queue;
    const key = q ? `${q.queue_id}:${q.current_index}:${q.items}` : null;
    if (!force && key === this.itemsKey) return;
    this.itemsKey = key;
    if (!q?.items) {
      this.items = [];
      return;
    }
    try {
      const offset = Math.max(0, (q.current_index ?? -1) + 1);
      this.items = await this.mass.command('player_queues/items', { queue_id: q.queue_id, limit: QUEUE_SHOWN, offset });
    } catch {
      this.items = [];
    }
    this.update();
  }

  run(command, args, el) {
    el?.classList.add('pending');
    const clear = () => el?.classList.remove('pending');
    this.mass.command(command, args).then(clear, (err) => {
      clear();
      this.notify(`Musica: ${err?.message ?? 'comando non riuscito'}`);
    });
  }

  play(uri, option, el) {
    const q = this.queue;
    if (!q) return this.notify('Musica: nessun player disponibile');
    this.run('player_queues/play_media', { queue_id: q.queue_id, media: uri, option }, el);
  }

   
  click(ev) {
    const el = ev.target.closest('[data-ma]');
    if (!el || el.disabled) return false;
    const { ma, id, uri } = el.dataset;
    const p = this.player;
    const q = this.queue;
    if (ma === 'tab') this.tab = id;
    else if (ma === 'player') {
      this.playerId = id;
      this.itemsKey = null;
      try {
        localStorage.setItem(PLAYER_KEY, id);
      } catch {
        
      }
    } else if (ma === 'all-playlists') this.allPlaylists = !this.allPlaylists;
    else if (ma === 'grouping') this.grouping = !this.grouping;
    else if (ma === 'browse') {
      this.path.push({ kind: id, title: BROWSE[id][0], uri: null, items: this.lib?.lists[id] ?? [] });
      this.scrollTop = true;
    }
    else if (ma === 'browse-back') this.path.pop();
    else if (ma === 'open') {
      const node = this.path.at(-1);
      const item = node?.items?.[Number(id)];
      const [kind, command] = DRILL[node?.kind] ?? [];
      
      const sources = [[item.item_id, item.provider], ...(item.provider_mappings ?? []).map((m) => [m.item_id, m.provider_instance])];
      if (item && kind) this.open({ kind, title: item.name, uri: item.uri }, command, sources.map(([item_id, provider]) => ({ item_id, provider_instance_id_or_domain: provider })));
    }
    else if (ma === 'clear-search') {
      this.query = '';
      this.results = null;
      this.clearInput = true;
    } else if (!p) return true;
    else if (ma === 'play-pause') this.run('players/cmd/play_pause', { player_id: p.player_id }, el);
    else if (ma === 'next') this.run('players/cmd/next', { player_id: p.player_id }, el);
    else if (ma === 'previous') this.run('players/cmd/previous', { player_id: p.player_id }, el);
    else if (ma === 'shuffle' && q) this.run('player_queues/shuffle', { queue_id: q.queue_id, shuffle_enabled: !q.shuffle_enabled }, el);
    else if (ma === 'repeat' && q) this.run('player_queues/repeat', { queue_id: q.queue_id, repeat_mode: REPEAT_NEXT[q.repeat_mode] ?? 'off' }, el);
    else if (ma === 'queue-play' && q) this.run('player_queues/play_index', { queue_id: q.queue_id, index: id }, el);
    else if (ma === 'queue-remove' && q) this.run('player_queues/delete_item', { queue_id: q.queue_id, item_id_or_index: id }, el);
    else if (ma === 'queue-clear' && q) this.run('player_queues/clear', { queue_id: q.queue_id }, el);
    
    else if (ma === 'group') this.run('players/cmd/group', { player_id: id, target_player: p.player_id }, el);
    else if (ma === 'ungroup') this.run('players/cmd/ungroup', { player_id: id }, el);
    
    else if (ma === 'play') this.play(uri, el.dataset.option ?? 'replace', el);
    this.update();
    return true;
  }

   
  input(ev) {
    if (ev.target.id !== 'ma-q') return;
    this.query = ev.target.value.trim();
    clearTimeout(this.searchTimer);
    if (this.query.length < 2) {
      this.results = null;
      this.searching = false;
      return this.update();
    }
    this.searching = true;
    this.update();
    this.searchTimer = setTimeout(async () => {
      const asked = this.query;
      const res = await this.mass.command('music/search', { search_query: asked, limit: 5 }).catch(() => null);
      if (asked !== this.query) return;
      this.results = res ?? {};
      this.searching = false;
      this.update();
    }, 500);
  }

  volume(value) {
    const p = this.player;
    if (!p) return;
    
    if (isLeader(p)) this.run('players/cmd/group_volume', { player_id: p.player_id, volume_level: value });
    else this.run('players/cmd/volume_set', { player_id: p.player_id, volume_level: value });
  }

   
  seek(percent) {
    const q = this.queue;
    const duration = nowPlaying(this.mass, this.player)?.duration;
    if (!q || !duration) return;
    const position = Math.round((percent / 100) * duration);
    
    q.elapsed_time = position;
    q.elapsed_time_last_updated = Date.now() / 1000;
    this.run('player_queues/seek', { queue_id: q.queue_id, position });
    this.update();
  }

   
  async open(node, command, sources) {
    this.path.push(node);
    this.scrollTop = true;
    let items = [];
    
    for (const args of sources) {
      try {
        items = ((await this.mass.command(command, args)) ?? []).filter((x) => x?.uri);
      } catch {
        node.failed = true;
      }
      if (items.length) break;
    }
    node.items = items;
    if (items.length) node.failed = false;
    this.update();
  }

   
  pointer(ev) {
    if (ev.type === 'pointerdown') {
      const handle = ev.target.closest?.('[data-ma-drag]');
      if (!handle || ev.button > 0) return;
      const row = handle.closest('.ma-row');
      const rows = [...row.parentElement.children];
      const box = row.getBoundingClientRect();
      const step = rows.length > 1 ? rows[1].getBoundingClientRect().top - rows[0].getBoundingClientRect().top : box.height;
      
      const scale = row.offsetHeight ? box.height / row.offsetHeight : 1;
      this.drag = { id: handle.dataset.maDrag, pointer: ev.pointerId, row, rows, index: rows.indexOf(row), step, scale: scale || 1, y: ev.clientY, shift: 0 };
      row.classList.add('dragging');
      row.parentElement.classList.add('sorting');
      try {
        handle.setPointerCapture(ev.pointerId);
      } catch {
        
      }
      return;
    }
    const d = this.drag;
    if (!d || ev.pointerId !== d.pointer) return;
    if (ev.type === 'pointermove') {
      const dy = ev.clientY - d.y;
      d.shift = Math.max(-d.index, Math.min(d.rows.length - 1 - d.index, Math.round(dy / d.step)));
      d.row.style.transform = `translateY(${dy / d.scale}px)`;
      d.rows.forEach((r, i) => {
        if (r === d.row) return;
        const passed = d.shift > 0 ? i > d.index && i <= d.index + d.shift : i < d.index && i >= d.index + d.shift;
        r.style.transform = passed ? `translateY(${((d.shift > 0 ? -1 : 1) * d.step) / d.scale}px)` : '';
      });
      return;
    }
    this.drag = null;
    for (const r of d.rows) r.style.transform = '';
    d.row.classList.remove('dragging');
    d.row.parentElement?.classList.remove('sorting');
    const q = this.queue;
    if (ev.type === 'pointerup' && d.shift && q) {
      
      const [moved] = this.items.splice(d.index, 1);
      this.items.splice(d.index + d.shift, 0, moved);
      this.run('player_queues/move_item', { queue_id: q.queue_id, queue_item_id: d.id, pos_shift: d.shift });
    }
    this.update();
  }

   
  afterRender(root) {
    if (this.scrollTop) {
      this.scrollTop = false;
      const body = root.querySelector('.body');
      if (body) body.scrollTop = 0;
    }
    const input = root.querySelector('#ma-q');
    if (!input) return;
    if (this.clearInput) input.value = '';
    else if (!input.value && this.query) input.value = this.query;
    this.clearInput = false;
  }

  

  chips() {
    const list = massPlayers(this.mass).filter((p) => p.available);
    const current = this.player?.player_id;
    
    const canGroup = this.mates().length > 0 || Boolean(this.player?.synced_to);
    return `<div class="ma-chips" role="group" aria-label="Player">${list
      .map(
        (p) => `<button class="ma-chip ${p.player_id === current ? 'on' : ''}" data-ma="player" data-id="${esc(p.player_id)}" aria-pressed="${p.player_id === current}">
          ${icon(playerIcon(p))}${esc(p.name)}${p.playback_state === 'playing' ? '<span class="ma-eq" aria-label="in riproduzione"><i></i><i></i><i></i></span>' : ''}</button>`,
      )
      .join('')}${canGroup ? `<button class="ma-chip dashed ${this.grouping ? 'open' : ''}" data-ma="grouping" aria-expanded="${this.grouping}">${icon('mdi:speaker-multiple')}Raggruppa</button>` : ''}</div>${canGroup && this.grouping ? this.group() : ''}`;
  }

   
  mates() {
    const p = this.player;
    if (!p) return [];
    const can = new Set(p.can_group_with ?? []);
    return massPlayers(this.mass).filter((x) => x.available && x.player_id !== p.player_id && can.has(x.player_id));
  }

  
  group() {
    const p = this.player;
    if (!p) return '';
    const row = (id, on, name, text, ic) =>
      `<button class="setting ${on ? 'on' : ''}" data-ma="${on ? 'ungroup' : 'group'}" data-id="${esc(id)}" aria-pressed="${on}">${icon(ic)}
        <span class="txt"><span class="n">${esc(name)}</span><span class="d">${esc(text)}</span></span><span class="knob"></span></button>`;
    
    const host = p.synced_to && this.mass.state.players.get(p.synced_to);
    if (host) return `<div class="ma-group">${row(p.player_id, true, p.name, `Suona insieme a ${host.name}`, playerIcon(p))}</div>`;
    const rows = this.mates().map((x) => {
      const on = x.synced_to === p.player_id || (p.group_members ?? []).includes(x.player_id);
      return row(x.player_id, on, x.name, on ? `Suona insieme a ${p.name}` : `Suona anche qui quello che c'è su ${p.name}`, playerIcon(x));
    });
    return `<div class="ma-group">${rows.join('')}</div>`;
  }

  transport(p, q, now) {
    const can = Boolean(now);
    const btn = (action, ic, label, cls = '', enabled = can) =>
      `<button class="ma-btn ${cls}" data-ma="${action}" ${enabled ? '' : 'disabled'} aria-label="${label}" title="${label}">${icon(ic)}</button>`;
    const repeat = q?.repeat_mode ?? 'off';
    return `<div class="ma-transport">
      ${btn('shuffle', 'mdi:shuffle-variant', q?.shuffle_enabled ? 'Casuale attivo' : 'Casuale', q?.shuffle_enabled ? 'act' : '', Boolean(q?.items))}
      ${btn('previous', 'mdi:skip-previous', 'Precedente', '', can && !now.radio)}
      ${btn('play-pause', now?.playing ? 'mdi:pause' : 'mdi:play', now?.playing ? 'Pausa' : 'Riproduci', 'play', can || Boolean(q?.items))}
      ${btn('next', 'mdi:skip-next', 'Successivo', '', can && !now.radio)}
      ${btn('repeat', repeat === 'one' ? 'mdi:repeat-once' : 'mdi:repeat', repeat === 'off' ? 'Ripeti' : repeat === 'one' ? 'Ripeti il brano' : 'Ripeti tutto', repeat === 'off' ? '' : 'act', Boolean(q?.items))}
    </div>`;
  }

  listening() {
    const p = this.player;
    if (!p) return `${this.chips()}<p class="ma-hint">Nessun player disponibile in questo momento.</p>`;
    const q = this.queue;
    const now = nowPlaying(this.mass, p);
    this.loadItems();
    const meta = now
      ? `<span class="title">${esc(now.title)}</span>
         <span class="artist">${esc([now.artist, now.album].filter(Boolean).join(' · '))}</span>
         ${now.duration ? `<div class="ma-progress num"><span>${fmtTime(now.elapsed)}</span>${bslider({ entity: esc(q?.queue_id ?? ''), action: 'ma-seek', value: (now.elapsed / now.duration) * 100, label: 'Posizione nel brano', enabled: Boolean(q), fill: 'var(--bc-music)' })}<span>${fmtTime(now.duration)}</span></div>` : ''}`
      : `<span class="idle">Niente in riproduzione</span><span class="artist">Scegli una radio o una playlist dalla Libreria.</span>`;
    const vol = isLeader(p) && Number.isFinite(p.group_volume) ? p.group_volume : p.volume_level;
    const volume = Number.isFinite(vol)
      ? `<div class="ma-volume" data-slider-scope>${icon(isLeader(p) ? 'mdi:speaker-multiple' : 'mdi:volume-high')}${bslider({ entity: esc(p.player_id), action: 'ma-volume', value: vol, label: `Volume ${isLeader(p) ? 'del gruppo' : esc(p.name)}`, fill: 'var(--bc-music)' })}<span class="v num" data-slider-value="pct">${vol}%</span></div>`
      : '';
    const rows = this.items.map(
      (i) => `<div class="ma-row">
        <button class="main" data-ma="queue-play" data-id="${esc(i.queue_item_id)}" aria-label="Riproduci ${esc(i.name)}">
          ${this.cover(i.image, 'mdi:music-note', { size: 80 })}
          <span class="ma-txt"><span class="n">${esc(i.media_item?.name ?? i.name)}</span><span class="s">${esc(artistsOf(i.media_item))}</span></span>
        </button>
        ${i.duration ? `<span class="dur num">${fmtTime(i.duration)}</span>` : ''}
        <button class="ma-btn small" data-ma="queue-remove" data-id="${esc(i.queue_item_id)}" aria-label="Togli dalla coda" title="Togli dalla coda">${icon('mdi:close')}</button>
        <span class="ma-handle" data-ma-drag="${esc(i.queue_item_id)}" title="Trascina per spostare">${icon('mdi:drag-horizontal-variant')}</span>
      </div>`,
    );
    const left = q ? Math.max(0, q.items - ((q.current_index ?? -1) + 1) - this.items.length) : 0;
    const queue = rows.length
      ? `<section>
          <div class="sec-head"><h3>Prossimi in coda</h3><button class="ghost" data-ma="queue-clear">Svuota</button></div>
          <div class="ma-rows" style="margin-top:12px">${rows.join('')}</div>
          ${left ? `<p class="ma-more">Altri ${left} ${left === 1 ? 'brano' : 'brani'}</p>` : ''}
        </section>`
      : '';
    return `${this.chips()}
      <div class="ma-now">
        ${this.cover(now?.image, 'mdi:music', { size: 256, url: now?.imageUrl })}
        <div class="ma-meta">${meta}</div>
        ${this.transport(p, q, now)}
        ${volume}
      </div>
      ${queue}`;
  }

  library() {
    this.loadLibrary();
    if (!this.lib) return '<p class="ma-hint">Carico la libreria…</p>';
    if (this.lib.failed) return '<p class="ma-hint">Libreria non disponibile in questo momento.</p>';
    if (this.path.length) return this.browse();
    const current = nowPlaying(this.mass, this.player)?.uri;
    const { radios, playlists } = this.lib;
    const shown = this.allPlaylists ? playlists : playlists.slice(0, PLAYLISTS_SHOWN);
    return `
      <section>
        <h3>Radio</h3>
        <div class="ma-radio-grid">${radios
          .map((r) => `<button class="ma-radio ${r.uri === current ? 'on' : ''}" data-ma="play" data-uri="${esc(r.uri)}" aria-label="Riproduci ${esc(r.name)}">${this.cover(r.metadata?.images?.[0], 'mdi:radio', { round: true })}<span class="n">${esc(r.name)}</span></button>`)
          .join('')}</div>
      </section>
      <section>
        <div class="sec-head"><h3>Playlist</h3>
          ${playlists.length > PLAYLISTS_SHOWN ? `<button class="ghost" data-ma="all-playlists">${this.allPlaylists ? 'Mostra meno' : `Tutte le ${playlists.length}`}</button>` : ''}
        </div>
        <div class="ma-pl-grid" style="margin-top:12px">${shown
          .map((pl) => `<button class="ma-pl" data-ma="play" data-uri="${esc(pl.uri)}" aria-label="Riproduci ${esc(pl.name)}">${this.cover(pl.metadata?.images?.[0], 'mdi:playlist-music', { size: 256 })}<span class="n">${esc(pl.name)}</span></button>`)
          .join('')}</div>
      </section>
      <section>
        <h3>Altro in libreria</h3>
        <div class="ma-links">${Object.entries(BROWSE)
          .map(([kind, [title, ic]]) => `<button class="ma-link" data-ma="browse" data-id="${kind}">${icon(ic)}<span>${title}</span><b class="num">${this.lib.lists[kind]?.length ?? ''}</b></button>`)
          .join('')}</div>
      </section>`;
  }

  
  browse() {
    const node = this.path.at(-1);
    const parent = this.path.at(-2)?.title ?? 'Libreria';
    const [, fallback, , round] = BROWSE[node.kind] ?? [null, node.kind === 'episodes' ? 'mdi:podcast' : 'mdi:music-note', null, false];
    const opens = Boolean(DRILL[node.kind]);
    const rows = (node.items ?? []).map((x, i) => {
      const sub =
        node.kind === 'tracks' ? [artistsOf(x), x.album?.name].filter(Boolean).join(' · ')
        : node.kind === 'albums' ? [artistsOf(x), x.year].filter(Boolean).join(' · ')
        : node.kind === 'episodes' && x.duration ? fmtTime(x.duration) : '';
      
      const main = opens ? `data-ma="open" data-id="${i}" aria-label="Apri ${esc(x.name)}"` : `data-ma="play" data-uri="${esc(x.uri)}" data-option="play" aria-label="Riproduci ${esc(x.name)}"`;
      return `<div class="ma-row">
        <button class="main" ${main}>
          ${this.cover(x.image ?? x.metadata?.images?.[0], fallback, { size: 80, round })}
          <span class="ma-txt"><span class="n">${esc(x.name)}</span><span class="s">${esc(sub)}</span></span>
        </button>
        ${opens ? `<button class="ma-btn small" data-ma="play" data-uri="${esc(x.uri)}" aria-label="Riproduci ${esc(x.name)}" title="Riproduci">${icon('mdi:play')}</button>` : ''}
        <button class="ma-btn small" data-ma="play" data-uri="${esc(x.uri)}" data-option="add" aria-label="Aggiungi in coda ${esc(x.name)}" title="Aggiungi in coda">${icon('mdi:playlist-plus')}</button>
      </div>`;
    });
    const body = !node.items ? '<p class="ma-hint">Carico…</p>' : node.failed ? '<p class="ma-hint">Non disponibile in questo momento.</p>' : rows.length ? `<div class="ma-rows">${rows.join('')}</div>` : '<p class="ma-hint">Niente da mostrare.</p>';
    return `
      <div class="ma-crumb">
        <button class="ghost" data-ma="browse-back">${icon('mdi:chevron-left')}${esc(parent)}</button>
        ${node.uri ? `<button class="ghost" data-ma="play" data-uri="${esc(node.uri)}">Riproduci tutto</button>` : ''}
      </div>
      <h4 class="ma-browse-title">${esc(node.title)}</h4>
      ${body}`;
  }

  search() {
    const groups = RESULT_GROUPS.map(([key, title, fallback, round]) => {
      const items = (this.results?.[key] ?? []).filter((x) => x.uri);
      if (!items.length) return '';
      const rows = items.map((x) => {
        const sub = key === 'tracks' ? [artistsOf(x), x.album?.name].filter(Boolean).join(' · ') : key === 'albums' ? [artistsOf(x), x.year].filter(Boolean).join(' · ') : key === 'playlists' ? x.owner ?? '' : '';
        
        return `<div class="ma-row">
          <button class="main" data-ma="play" data-uri="${esc(x.uri)}" data-option="${key === 'tracks' ? 'play' : 'replace'}" aria-label="Riproduci ${esc(x.name)}">
            ${this.cover(x.image ?? x.metadata?.images?.[0], fallback, { size: 80, round })}
            <span class="ma-txt"><span class="n">${esc(x.name)}</span><span class="s">${esc(sub)}</span></span>
          </button>
          ${key === 'radio' ? '' : `<button class="ma-btn small" data-ma="play" data-uri="${esc(x.uri)}" data-option="add" aria-label="Aggiungi in coda ${esc(x.name)}" title="Aggiungi in coda">${icon('mdi:playlist-plus')}</button>`}
        </div>`;
      });
      return `<section><h3>${title}</h3><div class="ma-rows">${rows.join('')}</div></section>`;
    }).join('');
    const empty = this.searching
      ? '<p class="ma-hint">Cerco…</p>'
      : this.results
        ? groups ? '' : '<p class="ma-hint">Nessun risultato.</p>'
        : '<p class="ma-hint">Cerca un artista, un album, un brano o una radio: in libreria e nei servizi collegati.</p>';
    return `
      <div class="ma-search">
        <input id="ma-q" type="search" data-keyboard inputmode="${this.kbd ? 'none' : 'search'}" enterkeyhint="search" autocomplete="off" spellcheck="false" placeholder="Cerca musica" aria-label="Cerca musica">
      </div>
      ${empty}${this.searching ? '' : groups}`;
  }

  mini() {
    const p = this.player;
    const now = nowPlaying(this.mass, p);
    if (!now) return '';
    return `<div class="ma-mini">
      ${this.cover(now.image, 'mdi:music', { size: 80, url: now.imageUrl })}
      <span class="ma-txt"><span class="n">${esc(now.title)}</span><span class="s">${esc([now.artist, p.name].filter(Boolean).join(' · '))}</span></span>
      <button class="ma-btn" data-ma="play-pause" aria-label="${now.playing ? 'Pausa' : 'Riproduci'}">${icon(now.playing ? 'mdi:pause' : 'mdi:play')}</button>
      <button class="ma-btn" data-ma="next" ${now.radio ? 'disabled' : ''} aria-label="Successivo">${icon('mdi:skip-next')}</button>
    </div>`;
  }

  render() {
    const tabs = `<div class="ma-tabs" role="tablist">${TABS.map(([id, label]) => `<button class="${id === this.tab ? 'active' : ''}" data-ma="tab" data-id="${id}" role="tab" aria-selected="${id === this.tab}">${label}</button>`).join('')}</div>`;
    const body = this.tab === 'libreria' ? this.library() : this.tab === 'cerca' ? this.search() : this.listening();
    return `${tabs}${body}${this.tab === 'ascolto' ? '' : this.mini()}`;
  }
}

 
export function renderMusic({ mass, admin, ui = {} }) {
  if (!mass?.configured) return '<p class="placeholder">Music Assistant non è in config.json (musica.server).</p>';
  const { status } = mass.state;
  if (status === 'no-token') {
    return `<div class="ma-state">${icon('mdi:key-variant')}<h3>Collega Music Assistant</h3>${tokenForm(ui, admin, 'Manca il token.')}</div>`;
  }
  if (status === 'bad-token') {
    return `<div class="ma-state warn">${icon('mdi:key-alert-outline')}<h3>Token non valido o scaduto</h3>${tokenForm(ui, admin, 'I token di Music Assistant durano un anno.')}</div>`;
  }
  if (status === 'connecting') return `<div class="ma-state">${icon('mdi:music')}<h3>Collegamento…</h3><p>Sto contattando Music Assistant.</p></div>`;
  if (status !== 'ready') {
    return `<div class="ma-state warn">${icon('mdi:home-off-outline')}<h3>Music Assistant non raggiungibile</h3><p>Risponde dalla rete di casa o tramite VPN. Riprovo da solo ogni minuto.</p></div>`;
  }
  return ui.music ? ui.music.render() : '';
}
