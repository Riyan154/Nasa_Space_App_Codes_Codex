import { CATALOG, DIFFICULTIES, FRAME, LAKES, getPart, starterDesign } from './catalog.js';
export const TITAN = { gravity: 1.35, temperature: 94, density: 5.3, scaleHeight: 20000 };
export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
export function newMission(difficulty = 'cadet', lake = 'ligeia') {
  return { version: 1, id: Date.now().toString(36), difficulty, lake, design: starterDesign(), stage: 'build', buildStep: 0, flight: null, result: null };
}
export function selectedParts(design) {
  return [FRAME, ...Object.entries(design).flatMap(([category, value]) => category === 'rocket' ? [] : (Array.isArray(value) ? value : [value]).map(id => getPart(category, id)).filter(Boolean))];
}
export function resources(mission) {
  const parts = selectedParts(mission.design);
  const rocket = getPart('rocket', mission.design.rocket);
  const power = getPart('power', mission.design.power);
  const mass = parts.reduce((sum, part) => sum + part.mass, 0);
  const cost = parts.reduce((sum, part) => sum + part.cost, rocket?.cost || 0);
  const baseline = parts.filter(part => !CATALOG.instruments.includes(part)).reduce((sum, part) => sum + (part.draw || 0), 0);
  const demand = parts.reduce((sum, part) => sum + (part.draw || 0), 0);
  return { mass, cost, budget: DIFFICULTIES[mission.difficulty].budget, capacity: rocket?.capacity || 0,
    generation: power?.generation || 0, battery: power?.battery || 0, baseline, demand,
    margin: (power?.generation || 0) - demand, science: parts.reduce((sum, part) => sum + (part.science || 0), 0), reliability: Math.round(100 * (rocket?.reliability || 0)) };
}
export function choosePart(mission, category, id) {
  if (!getPart(category, id)) return { ok: false, message: 'That part is not in the workshop.' };
  const candidate = structuredClone(mission);
  if (category === 'instruments') {
    candidate.design.instruments = candidate.design.instruments.includes(id) ? candidate.design.instruments.filter(value => value !== id) : [...candidate.design.instruments, id];
  } else candidate.design[category] = candidate.design[category] === id ? null : id;
  if (resources(candidate).cost > resources(candidate).budget) return { ok: false, message: 'Not enough mission credits. Try a less expensive part first.' };
  mission.design = candidate.design;
  return { ok: true };
}
export function buoyancy(mass, volume, density = 480, stability = 0.18, wind = 0.1) {
  const supportedMass = density * volume;
  const margin = supportedMass > 0 ? 1 - mass / supportedMass : -1;
  return { force: supportedMass * TITAN.gravity, weight: mass * TITAN.gravity, margin, stable: margin >= 0.12 && stability >= wind, floats: supportedMass >= mass };
}
export function validate(mission) {
  const r = resources(mission), errors = [], warnings = [];
  for (const category of ['rocket', 'power', 'comms', 'navigation', 'shield', 'hull']) {
    if (!getPart(category, mission.design[category])) errors.push(`Choose ${category === 'hull' ? 'a flotation hull and parachute' : category === 'shield' ? 'a heat shield and insulation' : `a ${category} system`} in the workshop.`);
  }
  if (r.mass > r.capacity) errors.push(`Your spacecraft is ${r.mass - r.capacity} kg too heavy. Try lighter parts or a bigger rocket.`);
  if (r.cost > r.budget) errors.push(`You need ${r.cost - r.budget} fewer credits. Swap an expensive part.`);
  if (r.generation < r.baseline) errors.push(`Essential systems need ${r.baseline - r.generation} W more power. Choose a stronger power source.`);
  if (r.margin < 0) warnings.push(`All tools together need ${-r.margin} W from the battery. Run instruments one at a time.`);
  const instruments = mission.design.instruments.map(id => getPart('instruments', id)).filter(Boolean);
  for (const [objective, text] of [['chemistry', 'a methane detective or lake laboratory'], ['environment', 'a temperature, pressure or atmosphere sensor']]) {
    if (!instruments.some(part => part.objective === objective)) errors.push(`Bring ${text} to complete the mission’s science goals.`);
  }
  const hull = getPart('hull', mission.design.hull), lake = LAKES[mission.lake];
  const float = buoyancy(r.mass, hull?.volume || 0, lake.density, hull?.stability || 0, lake.wind);
  if (!float.floats || float.margin < 0.12) errors.push('Your boat sits too low in the lake. Choose twin hulls or reduce mass. Keep at least 12% flotation reserve.');
  if (hull && hull.stability < lake.wind) errors.push('This hull is not stable enough for the chosen sea. Choose a wider hull.');
  if (r.cost > r.budget * 0.94) warnings.push('Your budget is almost full. There is little room for upgrades.');
  return { ok: errors.length === 0, errors, warnings, resources: r, float };
}
export function energyAfter(energyWh, generationW, consumptionW, hours, capacityWh) {
  return clamp(energyWh + (generationW - consumptionW) * hours, 0, capacityWh);
}
export function dragForce(density, velocity, coefficient, area) { return 0.5 * density * velocity * velocity * coefficient * area; }
export function temperatureAfter(initialK, ambientK, hours, insulation, heaterW) {
  // Lumped thermal model: conductance W/K; 140,000 J/K effective thermal capacity.
  const conductance = 0.8 * (1 - insulation) + 0.04;
  const equilibrium = ambientK + heaterW / conductance;
  return equilibrium + (initialK - equilibrium) * Math.exp(-conductance * hours * 3600 / 140000);
}
export function simulateEntry(mission, { profile = 'gentle', deployAltitude = 18000, fuelUsed = 0 } = {}) {
  const r = resources(mission), shield = getPart('shield', mission.design.shield), hull = getPart('hull', mission.design.hull);
  // Educational vertical-column approximation, not an orbit/flight qualification model.
  let altitude = 180000, velocity = profile === 'steep' ? 5200 : 3600, time = 0, heat = 0, peakTemperature = 94, deployed = false, torn = false, deployTime = Infinity;
  const mass = Math.max(100, r.mass - fuelUsed), samples = [];
  const step = 0.15;
  while (altitude > 0 && time < 15000) {
    const density = TITAN.density * Math.exp(-altitude / TITAN.scaleHeight);
    if (!deployed && altitude <= deployAltitude) {
      deployed = true;
      deployTime = time;
      // Dynamic pressure limits the fictional parachute, so early deployment can tear it.
      torn = 0.5 * density * velocity ** 2 > 800;
    }
    const area = deployed && time - deployTime >= 3 && !torn && hull ? hull.area : 12;
    const drag = dragForce(density, velocity, 1.5, area);
    velocity = Math.max(0.1, velocity + (TITAN.gravity - drag / mass) * step);
    altitude = Math.max(0, altitude - velocity * step);
    const heatFlux = 1.2e-4 * Math.sqrt(density / 1.4) * velocity ** 3;
    heat += heatFlux * step;
    const surfaceTemperature = (heatFlux / (0.85 * 5.670374419e-8) + TITAN.temperature ** 4) ** 0.25;
    peakTemperature = Math.max(peakTemperature, surfaceTemperature);
    if (samples.length === 0 || time - samples.at(-1).time > 30 || altitude === 0) samples.push({ altitude, velocity, heat, time, temperature: surfaceTemperature });
    time += step;
  }
  const heatRatio = shield ? heat / shield.heatLimit : Infinity;
  return { velocity, heat, heatRatio, peakTemperature, duration: time, samples, torn, deployed, safe: altitude === 0 && heatRatio <= 1 && velocity <= 4.5 && !torn && !!shield && !!hull, mass };
}
export function beginFlight(mission) {
  if (!validate(mission).ok) return false;
  const r = resources(mission), nav = getPart('navigation', mission.design.navigation);
  mission.stage = 'launch';
  mission.flight = { phase: 0, integrity: 100, energy: r.battery, fuel: nav.fuel, initialFuel: nav.fuel, accuracy: nav.accuracy, hours: 0, temperature: 273, distance: 0, elapsedYears: 0, records: [], transmitted: 0, transmittedObjectives: [], log: [{ text: 'Spacecraft cleared for launch.', kind: 'Engineering check' }], landed: false, profile: 'gentle', entry: null, surfaceHours: 0 };
  return true;
}
export function advanceFlight(mission, choice) {
  const f = mission.flight, r = resources(mission);
  if (!f || mission.result) return;
  const nav = getPart('navigation', mission.design.navigation);
  function log(text, kind = 'Fictional flight scenario') { f.log.push({ text, kind }); }
  if (f.phase === 0) {
    if (choice === 'correct') { f.fuel -= 18; f.accuracy = Math.min(1, f.accuracy + 0.2); log('Course corrected: 18 kg of propellant used.'); }
    else { f.accuracy -= 0.17; f.energy = energyAfter(f.energy, r.generation, r.baseline + 70, 4, r.battery); log('Survey completed. Extra data, but navigation uncertainty remains.'); f.records.push({ id: 'cruise', objective: 'cruise', data: 25, science: 5, sent: false }); }
    f.distance = 1.1e9; f.elapsedYears = 5.5;
  } else if (f.phase === 1) {
    if (choice === 'sleep') { f.energy = r.battery; log('Science slept while your battery recharged.'); }
    else { f.energy = energyAfter(f.energy, r.generation, r.baseline + 130, 5, r.battery); f.records.push({ id: 'saturn', objective: 'cruise', data: 50, science: 8, sent: false }); log('Saturn flyby survey stored. Five hours of high-power operation used.'); }
    f.distance = 1.3e9; f.elapsedYears = 7;
  } else if (f.phase === 2) {
    f.profile = choice === 'gentle' ? 'gentle' : 'steep';
    if (choice === 'gentle') { f.fuel -= 22; f.accuracy = Math.min(1, f.accuracy + 0.1); log('Gentle approach set: 22 kg of propellant used.'); }
    else log('Direct approach selected: more atmospheric heating, propellant conserved.');
    if (f.accuracy < 0.65) { f.integrity -= 22; log('Uncorrected navigation error: a rough approach damaged the craft.'); }
  } else if (f.phase === 3) {
    const deployAltitude = choice === 'early' ? 170000 : choice === 'late' ? 2 : 18000;
    f.entry = simulateEntry(mission, { profile: f.profile, deployAltitude, fuelUsed: f.initialFuel - f.fuel });
    const e = f.entry;
    f.energy = energyAfter(f.energy, r.generation, r.baseline + 35, e.duration / 3600, r.battery);
    if (e.heatRatio > 1) f.integrity -= Math.min(100, (e.heatRatio - 1) * 100 + 35);
    if (e.torn || e.velocity > 4.5) f.integrity -= 65;
    log(e.torn ? 'The parachute tore under high dynamic pressure.' : `Descent completed at ${e.velocity.toFixed(1)} m/s.`, 'Physics simulation');
  } else if (f.phase === 4) {
    const hull = getPart('hull', mission.design.hull), lake = LAKES[mission.lake];
    const wind = lake.wind + DIFFICULTIES[mission.difficulty].wind;
    if (choice === 'stabilize') { f.energy = Math.max(0, f.energy - 65); log('65 Wh used to deploy and adjust the stability system.'); }
    const float = buoyancy(f.entry.mass, hull.volume, lake.density, hull.stability + (choice === 'stabilize' ? 0.22 : 0), wind);
    if (!float.stable) { f.integrity -= 55; log('Waves overwhelmed the stability margin.', 'Physics simulation'); }
    f.landed = f.entry.safe && float.stable && f.integrity > 25 && f.energy > 0;
    f.float = float;
    if (!f.landed) {
      let reason = 'The landing did not hold. Review the descent choices, then try again.';
      if (f.entry.heatRatio > 1) reason = 'Atmospheric heating overwhelmed the heat shield. Try a gentle approach or stronger protection.';
      else if (f.entry.torn) reason = 'The parachute opened while dynamic pressure was too high and tore. Wait for the safe deployment window.';
      else if (f.entry.velocity > 4.5) reason = 'The explorer reached the lake too fast. Give the parachute more time to inflate and slow the craft.';
      else if (!float.stable) reason = 'The hull could not stay stable in the waves. Use the stabilizers or choose a wider hull.';
      else if (f.integrity <= 25) reason = 'The spacecraft reached the lake with too little structural integrity to continue.';
      else if (f.energy <= 0) reason = 'The battery ran empty during splashdown. Reserve more energy for the landing system.';
      return finishMission(mission, reason);
    }
    mission.stage = 'explore'; log('Afloat on Titan. The lake laboratory is ready.', 'Physics simulation');
  }
  if (f.energy <= 0) return finishMission(mission, 'The battery ran empty during a critical operation. Use sleep mode or a larger power pack.');
  if (f.fuel < 0) return finishMission(mission, 'There was not enough propellant for that maneuver. Bring more fuel or conserve it.');
  f.phase += 1;
  return true;
}
export function collectScience(mission, id) {
  const f = mission.flight, tool = getPart('instruments', id), r = resources(mission);
  if (mission.stage !== 'explore' || !tool || !mission.design.instruments.includes(id)) return { ok: false, message: 'This instrument is not available.' };
  if (f.records.some(record => record.id === id)) return { ok: false, message: 'You already completed this observation. Try another tool or transmit it.' };
  if (tool.objective === 'seismic') return { ok: false, message: 'This instrument needs contact with solid ground. It cannot study ground vibrations from a floating boat.' };
  const hours = 2, requiredEnergy = Math.max(0, (r.baseline + tool.draw - r.generation) * hours);
  if (f.energy <= requiredEnergy + 30) return { ok: false, message: 'Save a little power for your radio. Recharge first.' };
  if (f.surfaceHours + hours > 24) return { ok: false, message: 'The 24-hour expedition is ending. Transmit your discoveries and finish.' };
  f.energy = energyAfter(f.energy, r.generation, r.baseline + tool.draw, hours, r.battery);
  f.surfaceHours += hours;
  f.temperature = temperatureAfter(f.temperature, 94, hours, getPart('shield', mission.design.shield).insulation, 20);
  f.records.push({ id, objective: tool.objective, data: tool.data, science: tool.science, sent: false });
  f.log.push({ text: `${tool.name}: ${tool.data} data units stored.`, kind: 'Simulated scientific observation' });
  return { ok: true, message: tool.objective === 'chemistry' ? 'Hydrocarbon fingerprints recorded! Send the results back to Earth.' : tool.objective === 'environment' ? 'A new look at Titan’s environment. Your simulated observation is stored.' : 'Observation complete! Your discovery is ready to send home.' };
}
export function transmit(mission) {
  const f = mission.flight, r = resources(mission), comms = getPart('comms', mission.design.comms);
  const pending = f.records.filter(record => !record.sent), data = pending.reduce((sum, record) => sum + record.data, 0);
  if (!data) return { ok: false, message: 'Make a discovery first. Your outbox is empty.' };
  const hours = data / comms.rate;
  if (f.surfaceHours + hours > 24) return { ok: false, message: 'The radio needs more time than you have left. Finish with partial science, or bring a faster radio next time.' };
  const draw = r.baseline + comms.draw;
  if (f.energy + (r.generation - draw) * hours <= 0) return { ok: false, message: 'Not enough energy for the full transmission. Recharge first.' };
  f.energy = energyAfter(f.energy, r.generation, draw, hours, r.battery);
  f.surfaceHours += hours;
  pending.forEach(record => { record.sent = true; });
  f.transmitted += data;
  f.transmittedObjectives = [...new Set(f.records.filter(record => record.sent).map(record => record.objective))];
  f.log.push({ text: `${data} data units transmitted in ${hours.toFixed(1)} simulated hours.`, kind: 'Simplified communication model' });
  return { ok: true, message: `${data} data units sent home. Earth will hear you after a long signal delay!` };
}
export function recharge(mission) {
  const r = resources(mission), f = mission.flight;
  if (f.surfaceHours + 3 > 24) return { ok: false, message: 'No time for another charging cycle. Finish your mission.' };
  f.energy = energyAfter(f.energy, r.generation, r.baseline * 0.65, 3, r.battery);
  f.surfaceHours += 3;
  return { ok: true, message: 'Three hours of quiet time. Battery recharged; your expedition clock moved forward.' };
}
export function finishMission(mission, reason = '') {
  const f = mission.flight, r = resources(mission), goals = f.transmittedObjectives;
  const success = f.landed && goals.includes('chemistry') && goals.includes('environment');
  const breakdown = {
    'Mission completion': success ? 25 : f.landed ? 15 : Math.min(10, f.phase * 2),
    'Scientific discoveries': Math.min(20, Math.round(f.records.filter(x => x.sent).reduce((s, x) => s + x.science, 0) / 4)),
    'Engineering design': validate(mission).ok ? Math.round(15 * f.integrity / 100) : 0,
    'Resource efficiency': Math.round(15 * (clamp(1 - r.mass / r.capacity, 0, 1) * 0.35 + clamp(1 - r.cost / r.budget, 0, 1) * 0.35 + f.energy / r.battery * 0.3)),
    'Landing performance': f.landed ? Math.round(15 * f.integrity / 100) : 0,
    'Data returned': Math.min(10, Math.round(f.transmitted / 20))
  };
  const score = Object.values(breakdown).reduce((a, b) => a + b, 0);
  const rank = !f.landed ? 'Mission learning' : !success ? 'Partial success' : score >= 85 ? 'Titan exploration specialist' : score >= 70 ? 'Mission architect' : 'Successful explorer';
  mission.result = { score, rank, success, breakdown, reason: reason || (success ? 'You brought a lake explorer to another world—and sent its discoveries home.' : 'You made it to Titan! Complete and transmit both chemistry and environment observations for full mission success.'), date: new Date().toISOString() };
  mission.stage = 'results';
  return mission.result;
}
