// Basecamp UI · PolyForm Noncommercial License 1.0.0 · https://polyformproject.org/licenses/noncommercial/1.0.0


const img = (id) => ({ proxy_id: id + '.svg', provider: 'demo', type: 'thumb', path: id, remotely_accessible: false });
const uri = (kind, id) => `demo://${kind}/${id}`;
const artist = (id, name) => ({ item_id: id, name, uri: uri('artist', id), media_type: 'artist', metadata: { images: [img('artist-' + id)] } });
const ARTISTS = [['a1', 'Lumen Parade'], ['a2', 'The Quiet Orchard'], ['a3', 'Marlo Vance'], ['a4', 'Nightingale Club'], ['a5', 'Sol & Salt'], ['a6', 'Eva Brandt'], ['a7', 'Paper Lanterns'], ['a8', 'Slow Tides']].map(([i, n]) => artist(i, n));
const A = Object.fromEntries(ARTISTS.map((a) => [a.item_id, a]));
const ALBUMS = [
  ['b1', 'Golden Hour', 'a5', 2024], ['b2', 'Night Drive', 'a1', 2023], ['b3', 'Orchard Songs', 'a2', 2022], ['b4', 'Open Windows', 'a6', 2025],
  ['b5', 'Slow Motion', 'a8', 2021], ['b6', 'Lantern Light', 'a7', 2024], ['b7', 'Blue Hour', 'a4', 2023], ['b8', 'Long Way Home', 'a3', 2022],
].map(([id, name, ar, year]) => ({ item_id: id, name, year, artists: [A[ar]], uri: uri('album', id), media_type: 'album', metadata: { images: [img('album-' + id)] } }));
const TRACKS = [
  ['t1', 'Slow Sun', 'b1', 214], ['t2', 'Slow Burn', 'b2', 247], ['t3', 'Paper Boats', 'b3', 189], ['t4', 'Windows Down', 'b4', 232],
  ['t5', 'Tide Pull', 'b5', 301], ['t6', 'Lantern', 'b6', 205], ['t7', 'After Midnight', 'b7', 268], ['t8', 'Home Again', 'b8', 224],
].map(([id, name, al, duration]) => {
  const album = ALBUMS.find((a) => a.item_id === al);
  return { item_id: id, name, duration, album, artists: album.artists, uri: uri('track', id), media_type: 'track', metadata: { images: album.metadata.images } };
});
const PLAYLISTS = ['Morning Coffee', 'Cooking Together', 'Sunday Slow', 'Focus', 'Dinner Jazz', 'Weekend Road Trip'].map((name, i) => ({ item_id: 'p' + i, name, uri: uri('playlist', 'p' + i), media_type: 'playlist', favorite: i < 3, owner: 'Casa Aurora', metadata: { images: [img('playlist-' + i)] } }));
const RADIOS = ['Radio Aurora', 'Jazz Cafe FM', 'Classica Notte', 'Pop Italia'].map((name, i) => ({ item_id: 'r' + i, name, uri: uri('radio', 'r' + i), media_type: 'radio', favorite: i < 2, metadata: { images: [img('radio-' + i)] } }));

const now = Date.now() / 1000;
const queueItem = (t, i) => ({ queue_item_id: 'qi' + i, name: t.name, duration: t.duration, media_item: t, image: t.metadata.images[0] });
const QUEUE_TRACKS = [TRACKS[0], TRACKS[3], TRACKS[1], TRACKS[6], TRACKS[4]];
const queue = (id, name, active) => ({ queue_id: id, display_name: name, active, state: active ? 'playing' : 'idle', shuffle_enabled: false, repeat_mode: 'off', items: active ? QUEUE_TRACKS.length : 0, current_index: 0, elapsed_time: active ? 83 : 0, elapsed_time_last_updated: now, current_item: active ? queueItem(QUEUE_TRACKS[0], 0) : null });
const player = (id, name, playing, vol, extra = {}) => ({ player_id: id, name, available: true, powered: true, playback_state: playing ? 'playing' : 'idle', volume_level: vol, volume_muted: false, active_source: id, group_childs: [], can_group_with: [], icon: 'mdi-speaker', current_media: null, supported_features: [], ...extra });
const PLAYERS = [player('living', 'Soggiorno', true, 38, { can_group_with: ['kitchen', 'office'] }), player('kitchen', 'Cucina', false, 25, { can_group_with: ['living'] }), player('office', 'Studio', false, 30, { can_group_with: ['living'] })];
const QUEUES = [queue('living', 'Soggiorno', true), queue('kitchen', 'Cucina', false), queue('office', 'Studio', false)];

const byName = (list) => [...list].sort((a, b) => a.name.localeCompare(b.name));
export function musicHandle(command, args = {}, emit = () => {}) {
  const player = PLAYERS.find((p) => p.player_id === (args.player_id ?? args.queue_id));
  const q = QUEUES.find((x) => x.queue_id === (args.queue_id ?? args.player_id));
  const announce = () => {
    if (player) emit({ event: 'player_updated', object_id: player.player_id, data: player });
    if (q) emit({ event: 'queue_updated', object_id: q.queue_id, data: q });
  };
  switch (command) {
    case 'players/cmd/play_pause': if (player && q) { const playing = player.playback_state !== 'playing'; player.playback_state = playing ? 'playing' : 'paused'; q.state = player.playback_state; q.elapsed_time_last_updated = Date.now() / 1000; announce(); } return null;
    case 'players/cmd/volume_set': case 'players/cmd/group_volume': if (player) { player.volume_level = args.volume_level; player.group_volume = args.volume_level; announce(); } return null;
    case 'players/cmd/next': case 'players/cmd/previous': if (q) { const n = QUEUE_TRACKS.length; q.current_index = (q.current_index + (command.endsWith('next') ? 1 : n - 1)) % n; q.current_item = queueItem(QUEUE_TRACKS[q.current_index], q.current_index); q.elapsed_time = 0; q.elapsed_time_last_updated = Date.now() / 1000; announce(); } return null;
    case 'auth': return { authenticated: true, user: { username: 'demo', display_name: 'Demo', role: 'admin' } };
    case 'players/all': return PLAYERS;
    case 'player_queues/all': return QUEUES;
    case 'player_queues/items': return QUEUE_TRACKS.map(queueItem);
    case 'music/radios/library_items': return RADIOS;
    case 'music/playlists/library_items': return PLAYLISTS;
    case 'music/artists/library_items': return byName(ARTISTS);
    case 'music/albums/library_items': return byName(ALBUMS);
    case 'music/tracks/library_items': return byName(TRACKS);
    case 'music/podcasts/library_items': return [];
    case 'music/recently_played_items': return [...TRACKS.slice(0, 3), ...ALBUMS.slice(0, 2)];
    case 'music/artists/artist_albums': return ALBUMS.filter((a) => a.artists[0].uri === args.item_id || a.artists[0].item_id === args.item_id);
    case 'music/albums/album_tracks': return TRACKS.filter((t) => t.album.item_id === args.item_id);
    case 'music/search': {
      const q = String(args.search_query ?? '').toLowerCase();
      const f = (l) => l.filter((x) => x.name.toLowerCase().includes(q));
      return { artists: f(ARTISTS), albums: f(ALBUMS), tracks: f(TRACKS), playlists: f(PLAYLISTS), radio: f(RADIOS), podcasts: [] };
    }
    default: return null;
  }
}

 
export function artSvg(id) {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const hue = h % 360, hue2 = (hue + 40 + (h >> 8) % 60) % 360;
  const shape = (h >> 4) % 3;
  const art = shape === 0 ? '<circle cx="70" cy="62" r="34" fill="rgba(255,255,255,.22)"/>' : shape === 1 ? '<rect x="28" y="60" width="104" height="52" rx="26" fill="rgba(255,255,255,.2)"/>' : '<path d="M0 110 Q 50 60 100 105 T 160 80 V160 H0Z" fill="rgba(255,255,255,.2)"/>';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${hue} 62% 52%)"/><stop offset="1" stop-color="hsl(${hue2} 58% 28%)"/></linearGradient></defs><rect width="160" height="160" fill="url(#g)"/>${art}</svg>`;
}

 
export const ART_IDS = [...ARTISTS.map((a) => 'artist-' + a.item_id), ...ALBUMS.map((a) => 'album-' + a.item_id), ...PLAYLISTS.map((_, i) => 'playlist-' + i), ...RADIOS.map((_, i) => 'radio-' + i)];
