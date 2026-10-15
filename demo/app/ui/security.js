// Basecamp UI · PolyForm Noncommercial License 1.0.0 · https://polyformproject.org/licenses/noncommercial/1.0.0


import { icon } from './base.js';
import { esc, fmtNumber, fmtWhen, isUnavailable } from '../core/format.js';

export const SECURITY_STYLES = `
  
  .cams { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
  
  .cam.big { grid-column: 1 / -1; order: -1; }
  .cam.big .cam-zoom { display: none; }
  .cam .cam-zoom {
    position: absolute; right: 6px; top: 6px; z-index: 2; width: 36px; height: 36px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center; background: rgb(0 0 0 / .55); color: #fff;
  }
  .cam { position: relative; border-radius: var(--bc-radius-inner); overflow: hidden; background: #000; aspect-ratio: 16 / 9; }
  .cam .cam-name {
    position: absolute; left: 10px; top: 8px; z-index: 1; padding: 2px 8px; border-radius: 8px;
    font-size: 12px; font-weight: 500; background: rgb(0 0 0 / .55); color: #fff; pointer-events: none;
  }
  .cam .cam-msg { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 13px; color: var(--bc-text-2); }
  .cam webrtc-camera { display: block; width: 100%; height: 100%; }
  .people { display: flex; flex-direction: column; gap: 8px; }
  .person { display: flex; align-items: center; gap: 12px; min-height: 56px; padding: 8px 12px; border-radius: var(--bc-radius-inner); background: var(--bc-surface); }
  .person .avatar {
    flex: none; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
    background: var(--bc-border); color: var(--bc-text-2); font-weight: 600; overflow: hidden; background-size: cover; background-position: center;
  }
  .person .txt { flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  .person .n { font-size: 15px; font-weight: 500; }
  .person .s { font-size: 13px; color: var(--bc-text-2); }
  .person.home .s { color: var(--bc-green); }
  .person .bat { display: flex; align-items: center; gap: 4px; font-size: 13px; color: var(--bc-text-2); }
  .openings-sum { font-size: 13px; color: var(--bc-green); }
  .openings-sum.open { color: var(--bc-amber); }
  .openings { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
  .opening { display: flex; align-items: center; gap: 10px; min-height: 52px; padding: 6px 12px; border-radius: var(--bc-radius-inner); background: var(--bc-surface); }
  .opening .icon { color: var(--bc-text-2); }
  .opening .txt { display: flex; flex-direction: column; min-width: 0; }
  .opening .n { font-size: 14px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .opening .s { font-size: 12px; color: var(--bc-text-2); }
  .opening.open { background: color-mix(in srgb, var(--bc-amber) 14%, var(--bc-surface)); }
  .opening.open .icon, .opening.open .s { color: var(--bc-amber); }
`;

function openingIcon(deviceClass, open) {
  if (deviceClass === 'garage_door') return open ? 'mdi:garage-open' : 'mdi:garage';
  if (deviceClass === 'door') return open ? 'mdi:door-open' : 'mdi:door-closed';
  return open ? 'mdi:window-open-variant' : 'mdi:window-closed-variant';
}

 
export function openingsState(store, model) {
  return (model.security?.openings ?? [])
    .map((id) => {
      const st = store.get(id);
      return {
        id,
        name: model.name(id),
        open: st?.state === 'on',
        unavailable: isUnavailable(st),
        since: st?.last_changed,
        deviceClass: st?.attributes.device_class,
      };
    })
    .sort((a, b) => b.open - a.open);
}

 
export function openingsSummary(list) {
  const open = list.filter((o) => o.open);
  if (!list.length) return null;
  if (!open.length) return { text: 'Tutto chiuso', open: false };
  return { text: open.length === 1 ? `${open[0].name} aperta` : `${open.length} aperte`, open: true };
}

export function securityWatchedIds(model) {
  const s = model.security ?? {};
  return [
    ...(s.openings ?? []),
    ...(s.people ?? []).flatMap((p) => [p.entity, p.battery]),
    model.car?.position,
    s.siren,
  ].filter(Boolean);
}

const PERSON_STATES = { home: 'A casa', not_home: 'Fuori casa' };

 
function personRow({ name, stateText, home, avatar, battery = null }) {
  return `
    <div class="person ${home ? 'home' : ''}">
      ${avatar}
      <span class="txt"><span class="n">${esc(name)}</span><span class="s">${esc(stateText)}</span></span>
      ${battery !== null ? `<span class="bat num">${icon('mdi:cellphone')}${fmtNumber(battery, 0)}%</span>` : ''}
    </div>`;
}

export function renderSecurity({ store, model, hassUrl, ui }) {
  const s = model.security ?? {};
  const value = (id) => {
    const st = id ? store.get(id) : null;
    return isUnavailable(st) ? null : st.state;
  };

  const cams = (s.cameras ?? []).length
    ? `<section><div class="sec-head"><h3>Telecamere</h3></div><div class="cams" style="margin-top:12px">${s.cameras
        .map((c, i) => {
          
          const big = (ui.bigCam ?? 0) === i;
          return `<div class="cam ${big ? 'big' : ''}" data-keep data-cam="${i}"><span class="cam-name">${esc(c.name)}</span></div>`;
        })
        .join('')}</div></section>`
    : '';

  const people = (s.people ?? []).map((p) => {
    const st = store.get(p.entity);
    const state = isUnavailable(st) ? null : st.state;
    const name = model.name(p.entity);
    const picture = st?.attributes.entity_picture;
    const initials = name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
    return personRow({
      name,
      stateText: state ? PERSON_STATES[state] ?? state : 'Sconosciuto',
      home: state === 'home',
      avatar: picture
        ? `<span class="avatar" style="background-image:url('${esc(hassUrl(picture))}')"></span>`
        : `<span class="avatar">${esc(initials)}</span>`,
      battery: value(p.battery),
    });
  });
  
  if (model.car?.position) {
    const where = value(model.car.position);
    people.push(
      personRow({
        name: model.car.name ?? 'Auto',
        stateText: where ?? 'Sconosciuta',
        home: where === 'Casa',
        avatar: `<span class="avatar">${icon('mdi:car-electric')}</span>`,
      }),
    );
  }

  const list = openingsState(store, model);
  const sum = openingsSummary(list);
  const openings = list.length
    ? `<section>
        <div class="sec-head"><h3>Porte e finestre</h3>${sum ? `<span class="openings-sum ${sum.open ? 'open' : ''}">${esc(sum.text)}</span>` : ''}</div>
        <div class="openings" style="margin-top:12px">${list
          .map(
            (o) => `<div class="opening ${o.open ? 'open' : ''}">
              ${icon(openingIcon(o.deviceClass, o.open))}
              <span class="txt"><span class="n">${esc(o.name)}</span><span class="s num">${
                o.unavailable ? 'Non disponibile' : o.open ? `Aperta${o.since ? ` da ${esc(fmtWhen(o.since))}` : ''}` : 'Chiusa'
              }</span></span>
            </div>`,
          )
          .join('')}</div>
      </section>`
    : '';

  
  const siren = s.siren && value(s.siren) === 'on'
    ? `<div class="alert-banner">${icon('mdi:bullhorn-variant')}Sirena in funzione</div>`
    : '';

  return `${siren}${cams}${openings}${people.length ? `<section><h3>Presenza</h3><div class="people">${people.join('')}</div></section>` : ''}`;
}

let playerLoad = null;

 
export function loadPlayer(hassUrl, path) {
  playerLoad ??= customElements.get('webrtc-camera')
    ? Promise.resolve()
    : import(  hassUrl(path)).then(() => customElements.whenDefined('webrtc-camera'));
  return playerLoad.catch((err) => {
    playerLoad = null;
    throw err;
  });
}

 
export function createPlayer({ server, url }, getHass, { microphone = false } = {}) {
  const el = document.createElement('webrtc-camera');
  el.style.touchAction = 'pan-y';
  el.setConfig({
    server,
    url,
    mode: microphone ? 'webrtc' : 'mse',
    ...(microphone ? { media: 'video,audio,microphone' } : {}),
    muted: !microphone,
    ui: true,
    style: '.mode {display: none} .screenshot {display: none} .pictureinpicture {display: none}',
  });
  el.hass = getHass();
  return el;
}

export function stopPlayer(el) {
  clearTimeout(el.disconnectTID);
  clearTimeout(el.reconnectTID);
  el.disconnectTID = 0;
  el.reconnectTID = 0;
  el.ondisconnect?.();
  el.remove();
}

 
export function mountCameras(root, { model, hassUrl, getHass }) {
  const s = model.security ?? {};
  
  for (const slot of root.querySelectorAll('.cam[data-cam]')) {
    if (!slot.querySelector('.cam-zoom')) {
      slot.insertAdjacentHTML('beforeend', `<button class="cam-zoom" data-cam-zoom="${slot.dataset.cam}" aria-label="Ingrandisci">${icon('mdi:arrow-expand')}</button>`);
    }
  }
  const slots = [...root.querySelectorAll('.cam[data-cam]')].filter((el) => !el.querySelector('webrtc-camera, .cam-msg'));
  if (!slots.length || !s.player) return;
  loadPlayer(hassUrl, s.player).then(
    () => {
      for (const slot of slots) {
        if (!slot.isConnected || slot.querySelector('webrtc-camera')) continue;
        slot.append(createPlayer(s.cameras[Number(slot.dataset.cam)], getHass));
      }
    },
    () => {
      for (const slot of slots) {
        if (!slot.querySelector('.cam-msg')) slot.insertAdjacentHTML('beforeend', '<span class="cam-msg">Player WebRTC non disponibile</span>');
      }
    },
  );
}
