// Basecamp UI · PolyForm Noncommercial License 1.0.0 · https://polyformproject.org/licenses/noncommercial/1.0.0


import { RobotZone } from '../robot-zone.js';

export function robotZone(sheet) {
  return (sheet._zone ??= new RobotZone({ services: sheet.ctx.services, store: sheet.store, robot: sheet.model.robot, hassUrl: sheet.ctx.hassUrl, onChange: () => sheet.update() }));
}

 
export function cleanDrawnZone(sheet) {
  const zone = sheet._zone?.zone();
  if (!zone) return;
  const vacuum = sheet.model.robot.vacuum;
  sheet._zone.close();
  return sheet.ctx.services.cleanZone(vacuum, zone).catch(() => {});
}

 
export function toggleRoom(sheet, id) {
  sheet._rooms = sheet._rooms.includes(id) ? sheet._rooms.filter((r) => r !== id) : [...sheet._rooms, id];
  return sheet.update();
}

export function cleanRooms(sheet, button) {
  
  const [vacuum, rooms] = [button.dataset.cleanRooms, sheet._rooms];
  sheet._rooms = [];
  sheet.update();
  return sheet.ctx.services.cleanArea(vacuum, rooms).catch(() => {});
}
