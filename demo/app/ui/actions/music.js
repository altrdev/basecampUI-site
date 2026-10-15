// Basecamp UI · PolyForm Noncommercial License 1.0.0 · https://polyformproject.org/licenses/noncommercial/1.0.0


import { checkMassToken, saveMassToken } from '../../core/mass.js';

export async function connectMass(sheet) {
  const input = sheet.shadowRoot.querySelector('#ma-token');
  const token = input?.value.trim();
  const { mass } = sheet.ctx;
  if (!token || sheet._massBusy) return;
  sheet._massBusy = true;
  sheet._massError = null;
  sheet.update();
  try {
    await checkMassToken(sheet.model.music.server, token);
    await saveMassToken(sheet.ctx.getHass().connection, token);
    input.value = '';
    mass.start(token);
  } catch (err) {
    sheet._massError = err?.code ? err.message : `Non salvato in Home Assistant: ${err?.message ?? 'errore'}`;
  }
  sheet._massBusy = false;
  sheet.update();
}
