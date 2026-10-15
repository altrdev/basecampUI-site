// Basecamp UI · PolyForm Noncommercial License 1.0.0 · https://polyformproject.org/licenses/noncommercial/1.0.0


import { retryMic } from '../intercom.js';

export function intercomCommand(sheet, action) {
  const c = sheet.model.intercom ?? {};
  const services = sheet.ctx.services;
  const endCall = () => {
    if (sheet.store.get(c.call)?.state === 'on') services.turnOff(c.call).catch(() => {});
  };
  if (action === 'answer') {
    services.intercomCancelCall().catch(() => {});
    endCall();
    sheet.setTalk(true);
  } else if (action === 'talk') {
    sheet.setTalk(true);
  } else if (action === 'mic-retry') {
    retryMic(sheet.shadowRoot);
  } else if (action === 'decline' || action === 'hangup') {
    sheet.setTalk(false);
    endCall();
  }
  sheet.armIntercomTimer();
  sheet.update();
}
