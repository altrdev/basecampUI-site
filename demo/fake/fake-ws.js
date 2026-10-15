// Basecamp UI · PolyForm Noncommercial License 1.0.0 · https://polyformproject.org/licenses/noncommercial/1.0.0


import { haSession, musicSession } from './protocol.js';

export function installFakeWebSocket(ha) {
  class FakeWebSocket extends EventTarget {
    static CONNECTING = 0; static OPEN = 1; static CLOSING = 2; static CLOSED = 3;
    CONNECTING = 0; OPEN = 1; CLOSING = 2; CLOSED = 3;
    readyState = 0;
    binaryType = 'blob';
    onopen = null; onmessage = null; onclose = null; onerror = null;

    constructor(url) {
      super();
      this.url = String(url);
      const music = new URL(this.url, location.href).pathname.endsWith('/ws');
      setTimeout(() => {
        if (this.readyState !== 0) return;
        this.readyState = 1;
        this.#emit('open', new Event('open'));
        const send = (obj) => setTimeout(() => this.readyState === 1 && this.#emit('message', new MessageEvent('message', { data: JSON.stringify(obj) })), 0);
        this.session = music ? musicSession(send) : haSession(ha, send);
      }, 0);
    }

    #emit(type, event) {
      this.dispatchEvent(event);
      this[`on${type}`]?.(event);
    }

    send(data) {
      if (this.readyState !== 1) throw new Error('WebSocket non aperto');
      setTimeout(() => this.session?.message(String(data)), 0);
    }

    close() {
      if (this.readyState >= 2) return;
      this.readyState = 3;
      this.session?.close();
      setTimeout(() => this.#emit('close', new CloseEvent('close', { code: 1000 })), 0);
    }
  }
  window.WebSocket = FakeWebSocket;
}
