// Basecamp UI · PolyForm Noncommercial License 1.0.0 · https://polyformproject.org/licenses/noncommercial/1.0.0


const SYSTEM_KEY = 'basecamp';
const READ = new Set([
  'players/all', 'player_queues/all', 'player_queues/items', 'music/search', 'music/recently_played_items',
  'music/radios/library_items', 'music/playlists/library_items', 'music/artists/library_items',
  'music/albums/library_items', 'music/tracks/library_items', 'music/podcasts/library_items',
  'music/artists/artist_albums', 'music/albums/album_tracks', 'music/podcasts/podcast_episodes',
]);
const CONTROL = new Set([
  'players/cmd/play_pause', 'players/cmd/next', 'players/cmd/previous', 'players/cmd/stop',
  'players/cmd/volume_set', 'players/cmd/volume_mute', 'players/cmd/group', 'players/cmd/ungroup', 'players/cmd/group_volume',
  'player_queues/play_media', 'player_queues/shuffle', 'player_queues/repeat', 'player_queues/clear',
  'player_queues/delete_item', 'player_queues/move_item', 'player_queues/play_index', 'player_queues/seek',
]);
const CACHE_KEY = 'bc-mass-cache';
const CACHE_MAX_AGE_MS = 10 * 60_000;
const HEARTBEAT_MS = 20_000;
const RETRY_MS = [5_000, 15_000, 60_000];
const AUTH_ERRORS = /auth|token|credential/i;

 
export async function readMassToken(conn) {
  try {
    const res = await conn.sendMessagePromise({ type: 'frontend/get_system_data', key: SYSTEM_KEY });
    return res?.value?.ma_token || null;
  } catch {
    return null;
  }
}

 
export async function saveMassToken(conn, token) {
  const res = await conn.sendMessagePromise({ type: 'frontend/get_system_data', key: SYSTEM_KEY }).catch(() => null);
  const value = { ...(res?.value ?? {}) };
  if (token) value.ma_token = token;
  else delete value.ma_token;
  await conn.sendMessagePromise({ type: 'frontend/set_system_data', key: SYSTEM_KEY, value });
}

const wsUrl = (server) => `${String(server).replace(/^http/, 'ws').replace(/\/$/, '')}/ws`;

export function checkMassToken(server, token) {
  return new Promise((resolve, reject) => {
    const fail = (code, message) => reject(Object.assign(new Error(message), { code }));
    let ws;
    try {
      ws = new WebSocket(wsUrl(server));
    } catch {
      return fail('offline', 'Music Assistant non raggiungibile');
    }
    const timer = setTimeout(() => {
      ws.close();
      fail('offline', 'Music Assistant non risponde');
    }, 8000);
    const done = (fn) => {
      clearTimeout(timer);
      ws.close();
      fn();
    };
    ws.addEventListener('error', () => done(() => fail('offline', 'Music Assistant non raggiungibile')));
    ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.server_version) return ws.send(JSON.stringify({ message_id: 'auth', command: 'auth', args: { token } }));
      if (msg.message_id !== 'auth') return;
      if (msg.result?.authenticated) done(() => resolve(msg.result.user ?? {}));
      else done(() => fail('token', 'Token non valido o scaduto'));
    });
  });
}

export function createMass({ server, readOnly = false, onChange: notify = () => {} }) {
  const state = { status: server ? 'no-token' : 'off', players: new Map(), queues: new Map(), user: null, version: null };
  let ws = null;
  let token = null;
  let nextId = 0;
  let attempt = 0;
  let retryTimer = null;
  let stopped = false;
  const pending = new Map();
  const listeners = new Set();

  
  
  let savedAt = 0;
  const save = () => {
    if (state.status !== 'ready' || Date.now() - savedAt < 5000) return;
    savedAt = Date.now();
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ t: savedAt, players: [...state.players], queues: [...state.queues] }));
    } catch {}
  };
  const restore = () => {
    try {
      const c = JSON.parse(localStorage.getItem(CACHE_KEY));
      if (!c || Date.now() - c.t > CACHE_MAX_AGE_MS) return;
      state.players = new Map(c.players);
      state.queues = new Map(c.queues);
    } catch {}
  };
  const onChange = () => {
    save();
    notify();
  };

  const set = (status) => {
    if (state.status === status) return;
    state.status = status;
    onChange();
  };

  const send = (command, args = {}) =>
    new Promise((resolve, reject) => {
      if (!ws || ws.readyState !== WebSocket.OPEN) return reject(new Error('Music Assistant non collegato'));
      const id = `bc-${++nextId}`;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ message_id: id, command, args }));
    });

  const close = () => {
    clearTimeout(retryTimer);
    const old = ws;
    ws = null;
    if (old) {
      old.onclose = null;
      old.close();
    }
    for (const { reject } of pending.values()) reject(new Error('collegamento chiuso'));
    pending.clear();
  };

  const retry = () => {
    clearTimeout(retryTimer);
    if (stopped || !token) return;
    retryTimer = setTimeout(open, RETRY_MS[Math.min(attempt++, RETRY_MS.length - 1)]);
  };

  async function load() {
    const [players, queues] = await Promise.all([send('players/all'), send('player_queues/all')]);
    state.players = new Map(players.map((p) => [p.player_id, p]));
    state.queues = new Map(queues.map((q) => [q.queue_id, q]));
  }

  function onEvent(msg) {
    const { event, object_id: id, data } = msg;
    for (const fn of listeners) fn(event, id, data);
    if (event === 'player_added' || event === 'player_updated') state.players.set(id, data);
    else if (event === 'player_removed') state.players.delete(id);
    else if (event === 'queue_added' || event === 'queue_updated') state.queues.set(id, data);
    else if (event === 'queue_time_updated') {
      const q = state.queues.get(id);
      if (!q) return;
      q.elapsed_time = data;
      q.elapsed_time_last_updated = Date.now() / 1000;
    } else return;
    onChange();
  }

  function open() {
    close();
    if (stopped || !server || !token) return;
    if (state.status !== 'ready') set('connecting');
    let socket;
    try {
      socket = new WebSocket(wsUrl(server));
    } catch {
      set('offline');
      return retry();
    }
    ws = socket;
    socket.onmessage = (ev) => {
      const msg = JSON.parse(ev.data);
      
      if (msg.server_version && !msg.message_id) {
        state.version = msg.server_version;
        send('auth', { token })
          .then((res) => {
            if (!res?.authenticated) throw Object.assign(new Error('login rifiutato'), { auth: true });
            state.user = res.user ?? null;
            return load();
          })
          .then(() => {
            attempt = 0;
            state.status = 'ready';
            onChange();
          })
          .catch((err) => {
            
            const bad = err?.auth || AUTH_ERRORS.test(err?.message ?? '');
            close();
            set(bad ? 'bad-token' : 'offline');
            if (!bad) retry();
          });
        return;
      }
      if (msg.message_id && pending.has(msg.message_id)) {
        const { resolve, reject } = pending.get(msg.message_id);
        pending.delete(msg.message_id);
        if ('error_code' in msg) reject(new Error(msg.details ?? `errore ${msg.error_code}`));
        else resolve(msg.result);
        return;
      }
      if (msg.event) onEvent(msg);
    };
    socket.onclose = () => {
      if (ws !== socket) return;
      close();
      set('offline');
      retry();
    };
    socket.onerror = () => {};
  }

  
  
  const wake = () => {
    if (stopped || !token || !server || document.hidden) return;
    attempt = 0;
    open();
  };
  
  const heartbeat = setInterval(() => {
    if (stopped || !token || document.hidden || state.status !== 'ready') return;
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000));
    Promise.race([send('players/all'), timeout]).catch(() => {
      if (!stopped) open();
    });
  }, HEARTBEAT_MS);
  document.addEventListener('visibilitychange', wake);
  window.addEventListener('pageshow', wake);
  window.addEventListener('online', wake);

  return {
    state,
    get server() {
      return server;
    },
    get configured() {
      return Boolean(server);
    },
     
    start(newToken) {
      token = newToken || null;
      attempt = 0;
      if (!server) return;
      if (!token) {
        close();
        state.players = new Map();
        state.queues = new Map();
        return set('no-token');
      }
      if (!state.players.size) restore();
      open();
    },
    stop() {
      stopped = true;
      clearInterval(heartbeat);
      document.removeEventListener('visibilitychange', wake);
      window.removeEventListener('pageshow', wake);
      window.removeEventListener('online', wake);
      close();
    },
     
    listen(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
     
    command(command, args) {
      if (!READ.has(command) && !CONTROL.has(command)) return Promise.reject(new Error(`comando ${command} non ammesso`));
      if (readOnly && CONTROL.has(command)) {
        console.warn('comando Music Assistant bloccato in sviluppo:', command);
        return Promise.reject(new Error('comando bloccato in sviluppo'));
      }
      return send(command, args);
    },
  };
}
