import { CATALOG, DIFFICULTIES, LAKES } from './catalog.js';
const SAVE_KEY = 'titan.mission.v1';
export function read(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } }
export function write(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; } }
export function saveMission(mission) { return write(SAVE_KEY, mission); }
export function loadMission() {
  const m = read(SAVE_KEY, null);
  if (!m || m.version !== 1 || !DIFFICULTIES[m.difficulty] || !LAKES[m.lake] || !m.design || !['build', 'check', 'launch', 'flight', 'explore', 'results'].includes(m.stage)) return null;
  for (const [category, options] of Object.entries(CATALOG)) {
    const values = category === 'instruments' ? m.design[category] : [m.design[category]];
    if (!Array.isArray(values) || values.some(id => id !== null && !options.some(part => part.id === id))) return null;
  }
  if (!Number.isInteger(m.buildStep) || m.buildStep < 0 || m.buildStep > 6) return null;
  if (['flight', 'explore', 'results', 'launch'].includes(m.stage)) {
    const f = m.flight;
    if (!f || !Array.isArray(f.records) || !Array.isArray(f.log) || !Array.isArray(f.transmittedObjectives) || !Number.isFinite(f.energy) || !Number.isInteger(f.phase) || f.phase < 0 || f.phase > 5) return null;
  }
  if (m.stage === 'results' && (!m.result || !Number.isFinite(m.result.score))) return null;
  return m;
}
export function archiveMission(mission) {
  const archive = read('titan.archive.v1', []);
  const safe = Array.isArray(archive) ? archive : [];
  if (!safe.some(item => item.id === mission.id)) safe.unshift({ id: mission.id, lake: LAKES[mission.lake].name, difficulty: DIFFICULTIES[mission.difficulty].name, ...mission.result });
  write('titan.archive.v1', safe.slice(0, 20));
}
