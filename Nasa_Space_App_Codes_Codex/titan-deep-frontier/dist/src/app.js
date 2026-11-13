import { CATALOG, CATEGORIES, DIFFICULTIES, LAKES, getPart } from './catalog.js';
import { newMission, resources, choosePart, validate, beginFlight, advanceFlight, collectScience, transmit, recharge, finishMission, clamp } from './engine.js';
import { icon, scene, lander, rocketArt } from './art.js';
import { read, write, loadMission, saveMission, archiveMission } from './storage.js';
import { loadImages, loadDatasets } from './nasa.js';
import { adventureMarkup, mountAdventure } from './adventure.js';

const app = document.querySelector('#app');
const dialog = document.querySelector('#overlay');
let mission = loadMission();
let screen = 'arcade';
let disposeAdventure = null;
let briefing = { difficulty: 'cadet', lake: 'ligeia' };
let settings = { sound: false, reducedMotion: false, ...read('titan.settings.v1', {}) };
let countdownTimer;
let countdown = null;
let nasaImages = null;
let nasaDatasets = null;
let lastFocused = null;
const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const number = value => Math.round(value).toLocaleString('en-US');
const button = (action, label, style = 'primary', extra = '') => `<button class="${style}" data-action="${action}" ${extra}>${label}</button>`;
const arrow = icon('arrow', 19);
function sound() {
  if (!settings.sound) return;
  try { const ctx = new AudioContext(); const osc = ctx.createOscillator(); const gain = ctx.createGain(); osc.connect(gain); gain.connect(ctx.destination); osc.frequency.setValueAtTime(550, ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + .08); gain.gain.setValueAtTime(.025, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + .15); osc.start(); osc.stop(ctx.currentTime + .16); osc.onended = () => ctx.close(); } catch { /* Audio is optional. */ }
}
function notify(message) {
  const toast = document.querySelector('#toast'); toast.textContent = message; toast.classList.add('show');
  clearTimeout(notify.timer); notify.timer = setTimeout(() => toast.classList.remove('show'), 5500);
}
function persist() { if (mission && !saveMission(mission)) notify('Your browser cannot save right now. Keep this tab open to continue your mission.'); }
function go(next) { screen = next === 'home' ? 'arcade' : next; render(); window.scrollTo({ top: 0, behavior: 'instant' }); const heading = app.querySelector('h1'); heading?.focus({ preventScroll: true }); }
function header() {
  return `<header class="topbar"><button class="brand" data-action="home" aria-label="Titan home"><span class="brand-mark">T<span>✦</span></span><span>TITAN<span class="brand-sub">DEEP FRONTIER</span></span></button><nav aria-label="Game menu">${button('science', `${icon('book', 17)} <span>Science lab</span>`, 'nav-button', 'aria-label="Science lab"')}${button('archive', `${icon('archive', 17)} <span>Mission archive</span>`, 'nav-button', 'aria-label="Mission archive"')}<span class="nav-divider"></span>${button('settings', icon('settings', 20), 'icon-button', 'aria-label="Settings"')}</nav></header>`;
}
function footer() { return `<footer><span><i class="status-dot"></i> A SMALL EXPLORER. AN EXTRAORDINARY WORLD.</span><span>Original game artwork <span class="footer-dot">·</span> Inspired by NASA science</span>${button('help', 'How to play ↗', 'text-button')}</footer>`; }
function home() {
  return `<div class="home-scene">${scene()}<div class="home-shade"></div><div class="home-lander">${lander({ hull: 'catamaran', power: 'rtg', comms: 'gain', instruments: ['camera'], shield: 'light' }, 'hero')}</div><div class="landing-marker"><span></span>LIGEIA MARE <small>68° N · TITAN</small></div><main class="home-copy"><div class="eyebrow"><span class="little-line"></span> YOUR NEXT GREAT ADVENTURE</div><h1 tabindex="-1">A small step.<br>A <em>deep frontier.</em></h1><p>Beyond Saturn’s rings, a world of golden skies<br class="desktop-only"> and methane seas is waiting. Build your explorer.<br class="desktop-only"> Chart your course. See what you discover.</p><div class="home-actions">${button('new', `Start your mission ${arrow}`)}${button('continue', `${icon('rocket', 18)} Continue`, 'secondary', mission ? '' : 'disabled')}</div><div class="mission-caption"><span>01</span><div>THE TITAN LAKE EXPEDITION<small>Your ship. Your decisions. Your discoveries.</small></div></div></main><div class="destination-card"><div class="orb-icon">◌</div><div><span>DESTINATION</span><strong>Titan</strong><small>Saturn’s most curious moon</small></div><span class="destination-plus">+</span></div><div class="scene-label">ARTIST’S GAME WORLD · FICTIONAL MISSION TLE–01</div></div><div class="home-bottom"><span class="chapter-number">01 <i>/ 05</i></span><div class="chapter-track"><span class="active">BUILD</span><b></b><span>LAUNCH</span><b></b><span>TRAVEL</span><b></b><span>LAND</span><b></b><span>DISCOVER</span></div><span class="play-time">A universe of possibilities.<br><b>A 10–15 minute adventure.</b></span></div>`;
}
function briefingScreen() {
  return `<main class="briefing layout-page"><div class="section-kicker">MISSION TLE–01 <span> / THE BRIEFING</span></div><h1 tabindex="-1">Hello, mission architect.</h1><p class="lead">Your mission? Land a little laboratory on an extraordinary sea.</p><div class="brief-grid"><div class="brief-illustration">${scene('briefing')}<div class="brief-art">${lander({ hull:'skiff', power:'rtg', comms:'basic', shield:'light' }, 'brief')}</div><div class="brief-label"><span>MEET YOUR EXPLORER</span><h2>Built for another world.</h2><p>Fly safely. Float gently. Find something new.</p></div></div><div class="brief-controls"><h3>Pick your adventure</h3><div class="difficulty-options">${Object.entries(DIFFICULTIES).map(([id, value]) => `<button class="difficulty ${briefing.difficulty === id ? 'selected' : ''}" data-action="difficulty" data-id="${id}" aria-pressed="${briefing.difficulty === id}"><span>${value.name}</span><small>${number(value.budget)} credits</small></button>`).join('')}</div><p class="hint">${DIFFICULTIES[briefing.difficulty].description}</p><label for="lake-choice">Choose your landing site</label><select id="lake-choice">${Object.entries(LAKES).map(([id, lake]) => `<option value="${id}" ${briefing.lake === id ? 'selected' : ''}>${lake.name}</option>`).join('')}</select><p class="hint">${LAKES[briefing.lake].description}</p><div class="objectives"><div>${icon('shield')}<span>Build a ship that survives the journey.</span></div><div>${icon('hull')}<span>Float safely on a methane sea.</span></div><div>${icon('sample')}<span>Study the lake and air. Send discoveries home.</span></div></div><p class="hint">A 7-year journey, condensed into minutes. Aim for 24 hours of lake exploration. All spacecraft are fictional.</p>${button('start-build', `Let’s build an explorer ${arrow}`)}</div></div></main>`;
}
function resourceBar() {
  const r = resources(mission);
  const items = [
    { label: 'MASS', icon: 'mass', value: `${number(r.mass)} <small>/ ${number(r.capacity)} kg</small>`, ratio: r.capacity ? r.mass/r.capacity : 1, bad: r.mass > r.capacity, color: 'cyan' },
    { label: 'MISSION CREDITS', icon: 'money', value: `${number(r.budget-r.cost)} <small>left</small>`, ratio: r.cost/r.budget, bad: r.cost > r.budget, color: 'gold' },
    { label: 'POWER', icon: 'power', value: `${r.generation} <small>/ ${r.demand} W needed</small>`, ratio: r.generation ? r.demand/r.generation : 1, bad: r.generation < r.baseline, color: 'violet' }
  ];
  return `<div class="resources">${items.map(item => `<div class="resource ${item.color} ${item.bad ? 'bad' : item.ratio > .95 ? 'caution' : ''}"><span class="resource-symbol">${icon(item.icon)}</span><div><div class="resource-top"><span>${item.label}</span><strong>${item.value}</strong></div><div class="meter"><i style="width:${clamp(item.ratio*100,0,100)}%"></i></div></div></div>`).join('')}${button('details', 'Mission details ↗', 'text-button')}</div>`;
}
function partStats(category, part) {
  if (category === 'rocket') return `${number(part.capacity)} kg lift <span>·</span> ${number(part.cost)} MC`;
  return `${part.mass} kg <span>·</span> ${number(part.cost)} MC <span>·</span> ${part.generation ? `${part.generation} W out` : part.draw ? `${part.draw} W` : `${part.volume} m³ hull`}`;
}
function buildScreen() {
  const step = CATEGORIES[mission.buildStep], r = resources(mission);
  return `<main class="workshop layout-page"><div class="section-kicker">MISSION TLE–01 <span>/ THE WORKSHOP</span><span class="autosave"><i class="status-dot"></i> Auto-save on</span></div><div class="build-heading"><div><h1 tabindex="-1">Every great journey<br>starts with <em>a little curiosity.</em></h1><p>Make it yours. Make it mission-ready.</p></div><div class="step-counter">0${mission.buildStep+1}<span> / 07</span></div></div><div class="build-tabs" role="group" aria-label="Spacecraft categories">${CATEGORIES.map((category, i) => `<button data-action="build-step" data-index="${i}" class="${i === mission.buildStep ? 'active' : ''}" aria-pressed="${i === mission.buildStep}"><span>${String(i+1).padStart(2,'0')}</span>${category.name}</button>`).join('')}</div><div class="workshop-grid"><div class="assembly"><div class="assembly-grid"></div><div class="assembly-top"><span>YOUR LAKE EXPLORER</span><span class="mint">● LIVE ASSEMBLY</span></div><div class="assembly-craft">${mission.buildStep === 0 ? rocketArt() : lander(mission.design, 'build')}</div><div class="assembly-orbit"></div><div class="assembly-annotation">${mission.buildStep === 0 ? getPart('rocket', mission.design.rocket)?.name || 'Choose a launch vehicle' : getPart(step.id, mission.design[step.id])?.name || 'A laboratory with a view'}<small>${mission.buildStep === 0 ? 'EARTH → SATURN → TITAN' : `${LAKES[mission.lake].name.toUpperCase()} · TLE–01`}</small></div>${button('details', `${icon('book',16)} Peek under the hood`, 'assembly-detail')}</div><section class="parts-panel"><div class="part-heading"><span class="eyebrow">${String(mission.buildStep+1).padStart(2,'0')} / ${step.name.toUpperCase()}</span><h2>${step.title}</h2><p>${step.text}</p></div><div class="part-options">${CATALOG[step.id].map(part => { const selected = Array.isArray(mission.design[step.id]) ? mission.design[step.id].includes(part.id) : mission.design[step.id] === part.id; return `<button class="part-card ${selected ? 'selected' : ''}" data-action="part" data-category="${step.id}" data-id="${part.id}" aria-pressed="${selected}"><span class="part-illustration">${icon(part.icon,34)}</span><span class="part-copy"><span class="part-title">${part.name}<small>${part.tag}</small></span><span class="part-description">${part.description}</span><span class="part-stats">${partStats(step.id,part)}</span></span><span class="selection-dot">${selected ? icon('check',14) : ''}</span></button>`; }).join('')}</div></section></div>${resourceBar()}<div class="bottom-actions">${button('previous', '← Back', 'text-button')}<span class="build-tip">${r.generation < r.baseline ? 'Your essential systems need more power.' : r.mass > r.capacity ? 'A little heavy! Try lighter parts or more lift.' : 'Small choices. Extraordinary possibilities.'}</span>${button(mission.buildStep === 6 ? 'validate' : 'next', `${mission.buildStep === 6 ? 'Check my spacecraft' : 'Next: '+CATEGORIES[mission.buildStep+1].name} ${arrow}`)}</div></main>`;
}
function checkScreen() {
  const report = validate(mission);
  return `<main class="check-page layout-page"><div class="section-kicker">MISSION TLE–01 <span>/ FLIGHT READINESS</span></div><div class="check-grid"><div><div class="badge-icon ${report.ok ? '' : 'caution'}">${icon(report.ok ? 'check' : 'settings',36)}</div><h1 tabindex="-1">${report.ok ? 'Ready for the<br><em>extraordinary.</em>' : 'A few little fixes.<br><em>A big adventure ahead.</em>'}</h1><p class="lead">${report.ok ? 'Your explorer passed its engineering checks. Titan is waiting.' : 'Every good spacecraft starts with a little problem-solving.'}</p><div class="check-list">${(report.ok ? ['Your rocket can lift the spacecraft.', 'You have power for essential systems.', 'Heat shield, parachute and flotation are ready.', 'Lake and environment science tools are aboard.'] : report.errors).map(text => `<p>${icon(report.ok ? 'check' : 'settings',19)}${escape(text)}</p>`).join('')}</div>${report.warnings.map(text => `<p class="warning-note">${escape(text)}</p>`).join('')}<div class="home-actions">${button(report.ok ? 'launch' : 'return-build', report.ok ? `Let’s launch ${icon('rocket',20)}` : `Back to the workshop ${arrow}`)}${report.ok ? button('return-build','Keep tinkering','text-button') : ''}</div>${button('details', 'Full engineering report ↗', 'text-button')}</div><div class="check-art">${lander(mission.design,'check')}<span class="orbit-label">TITAN LAKE EXPLORER · TLE–01</span></div></div>${resourceBar()}</main>`;
}
const FLIGHT = [
  { name: 'The long way out', label: '01 / INTERPLANETARY CRUISE', text: 'Your star tracker spots a drift in your course. A small correction now means a calmer arrival.', choices: [{ id:'correct', name:'Correct the course', text:'Use 18 kg of fuel. Improve your aim.', recommended:true }, { id:'survey', name:'Keep surveying', text:'Keep your fuel. Use battery power and accept more uncertainty.' }] },
  { name: 'Hello, Saturn.', label: '02 / SATURN SYSTEM APPROACH', text: 'The ringed giant fills your view. Take a survey, or let your explorer rest before the big landing.', choices: [{ id:'sleep', name:'Rest and recharge', text:'Switch off science. Fill your battery for landing.', recommended:true }, { id:'survey', name:'Survey the rings', text:'Collect bonus data. Use 5 hours of high-power operation.' }] },
  { name: 'A golden world awaits.', label: '03 / TITAN APPROACH', text: 'You are almost there. Choose how your spacecraft meets Titan’s thick atmosphere.', choices: [{ id:'gentle', name:'Take a gentle approach', text:'Use 22 kg of fuel to reduce entry speed and heating.', recommended:true }, { id:'steep', name:'Take the direct route', text:'Save fuel. Arrive faster—your heat shield must handle much more.' }] },
  { name: 'Time to slow things down.', label: '04 / ATMOSPHERIC ENTRY & DESCENT', text: 'Your heat shield takes the first blast. Set your parachute to open when the air is safe.', choices: [{ id:'safe', name:'Wait for the safe window', text:'Deploy at 18 km, after the shield slows you down.', recommended:true }, { id:'early', name:'Deploy at high speed', text:'At 170 km, rushing can tear the parachute.' }, { id:'late', name:'Wait until the last moment', text:'At 2 m, there may not be enough room to slow down.' }] },
  { name: 'Make a gentle splash.', label: '05 / LAKE SPLASHDOWN', text: 'The lake is beneath you. A breeze pushes your explorer. Wide hulls and stabilizers can help you stay upright.', choices: [{ id:'stabilize', name:'Activate stabilizers', text:'Use 65 Wh of energy to stay balanced.', recommended:true }, { id:'drift', name:'Trust the hull', text:'Save energy. Your hull must handle the waves on its own.' }] }
];
function flightScreen() {
  const f = mission.flight, chapter = FLIGHT[Math.min(f.phase,4)];
  const isLaunch = screen === 'launch';
  return `<main class="flight-scene">${scene(isLaunch ? 'launch' : f.phase===4 ? 'explore' : 'flight')}<div class="flight-shade"></div><div class="flight-craft ${isLaunch ? 'launch-craft' : 'cruise-craft'} ${countdown !== null ? (countdown === 0 ? 'liftoff' : 'launching') : ''} ${!isLaunch && f.phase===3 ? 'entry-glow' : ''} ${!isLaunch && f.phase===4 ? 'descent-craft' : ''}">${!isLaunch && f.phase===4 && !f.entry?.torn ? '<svg class="parachute-art" viewBox="0 0 400 250" aria-hidden="true"><path d="M20 95Q200-90 380 95Q335 60 290 95q-45-35-90 0-45-35-90 0-45-35-90 0Z" fill="#ddb27b" stroke="#e8d5a8" stroke-width="2"/><path d="m20 95 180 155L110 95m90 155V95m0 155L290 95m-90 155L380 95" stroke="#d7cfb4" stroke-width="2" fill="none"/></svg>' : ''}${isLaunch ? rocketArt(countdown !== null) : lander(mission.design,'flight')}</div><section class="flight-copy"><div class="section-kicker">${isLaunch ? 'TLE–01 / EARTH DEPARTURE' : chapter.label}</div><h1 tabindex="-1">${isLaunch ? 'Next stop:<br><em>another world.</em>' : chapter.name}</h1><p>${isLaunch ? 'Your explorer is on the pad. One last deep breath. You built this.' : chapter.text}</p>${isLaunch ? `<div class="launch-action">${countdown !== null ? `<div class="countdown" role="status" aria-live="polite">${countdown > 0 ? countdown : 'LIFT OFF'}</div>${button('cancel-launch','Hold countdown','secondary')}` : button('ignite',`Begin countdown ${icon('rocket',21)}`)}</div>` : `<div class="flight-options">${chapter.choices.map(choice => `<button data-action="flight-choice" data-id="${choice.id}" class="flight-option"><span><strong>${choice.name}</strong><small>${choice.text}</small></span>${arrow}</button>`).join('')}</div>`}${!isLaunch && f.phase===4 ? `<div class="descent-note ${f.entry.safe ? '' : 'warning'}">${icon(f.entry.safe ? 'check' : 'shield',18)} ${f.entry.torn ? 'Parachute damaged. Splashdown is at risk.' : f.entry.heatRatio>1 ? 'Heat protection overwhelmed. Hull integrity is at risk.' : f.entry.velocity>4.5 ? 'Descent is too fast. The parachute needed more time.' : `Parachute open · ${f.entry.velocity.toFixed(1)} m/s descent`}</div>` : ''}<p class="sim-label">SIMULATED MISSION · ${isLaunch ? 'All systems ready' : 'Your choices change the outcome'}</p></section><div class="flight-status"><span><i class="status-dot"></i> ${isLaunch ? 'READY TO FLY' : f.phase < 3 ? 'EXPLORER ONLINE' : 'LANDING SEQUENCE'}</span><div><strong>${Math.round(f.energy)}<small> Wh</small></strong><label>BATTERY</label></div><div><strong>${f.fuel}<small> kg</small></strong><label>PROPELLANT</label></div><div><strong>${Math.round(f.integrity)}<small>%</small></strong><label>INTEGRITY</label></div>${button('telemetry', 'Mission telemetry ↗', 'text-button')}</div><div class="flight-progress">${['Launch','Travel','Saturn','Titan','Descent','Splashdown'].map((label,i)=>`<span class="${i <= (isLaunch?0:f.phase+1) ? 'complete' : ''}"><i></i>${label}</span>`).join('')}</div></main>`;
}
function exploreScreen() {
  const f = mission.flight, r = resources(mission), instruments = mission.design.instruments.map(id=>getPart('instruments',id));
  return `<main class="exploration">${scene('explore')}<div class="explore-shade"></div><div class="explore-craft">${lander(mission.design,'explore')}</div><div class="explore-heading"><div class="section-kicker">${LAKES[mission.lake].name.toUpperCase()} <span>/ YOU MADE IT</span></div><h1 tabindex="-1">A whole new world.<br><em>What will you discover?</em></h1><p>Study the lake and its environment. Then send your discoveries home.</p></div><div class="explore-stats"><span>${icon('power',18)} ${Math.round(f.energy)} / ${r.battery} Wh</span><span>◷ ${Math.max(0,24-f.surfaceHours).toFixed(1)} hours left</span><span>${icon('radio',18)} ${f.transmitted} data sent</span></div><div class="science-tools">${instruments.map(part=>{const record=f.records.find(x=>x.id===part.id);return `<button class="science-tool ${record ? 'done' : ''}" data-action="collect" data-id="${part.id}" ${record?'disabled':''}><span>${icon(part.icon,28)}</span><strong>${part.name}</strong><small>${record ? (record.sent ? '✓ Sent to Earth' : '✓ Ready to transmit') : '2 hours · '+part.draw+' W'}</small></button>`;}).join('')}</div><div class="explore-controls">${button('transmit',`${icon('radio',20)} Send discoveries home`)}${button('recharge','Rest & recharge','secondary')}${button('finish','Finish expedition →','secondary')}${button('telemetry','Mission details ↗','text-button')}</div><div class="objective-chips"><span class="${f.transmittedObjectives.includes('chemistry')?'done':''}">${f.transmittedObjectives.includes('chemistry')?'✓':'○'} Lake chemistry sent</span><span class="${f.transmittedObjectives.includes('environment')?'done':''}">${f.transmittedObjectives.includes('environment')?'✓':'○'} Environment data sent</span></div><div class="scene-label">FICTIONAL OBSERVATIONS · ORIGINAL GAME ARTWORK</div></main>`;
}
function resultsScreen() {
  const result = mission.result, f = mission.flight;
  return `<main class="results layout-page"><div class="section-kicker">MISSION TLE–01 <span>/ THE EXPEDITION REPORT</span></div><div class="results-grid"><section><div class="eyebrow mint">${result.success ? '✦ MISSION ACCOMPLISHED' : '✦ EVERY JOURNEY TEACHES US SOMETHING'}</div><h1 tabindex="-1">${result.success ? 'You made<br><em>an entire world closer.</em>' : 'The next adventure<br><em>starts with what you learned.</em>'}</h1><p class="lead">${escape(result.reason)}</p><div class="result-score"><strong>${result.score}<small>/100</small></strong><div>${escape(result.rank)}<span>${f.transmitted} data units returned to Earth</span></div></div><details class="score-details"><summary>See how your mission scored</summary>${Object.entries(result.breakdown).map(([key,value])=>`<div><span>${key}</span><strong>${value}</strong></div>`).join('')}</details><div class="home-actions">${button('retry',`Refine my spacecraft ${arrow}`)}${button('new','New adventure','secondary')}</div>${button('science','Unlock the real Titan: NASA gallery ↗','text-button')}</section><div class="result-art">${scene('results')}<div>${lander(mission.design,'results')}</div><span>${f.landed ? 'A LITTLE EXPLORER. A REMARKABLE JOURNEY.' : 'KEEP ASKING. KEEP EXPLORING.'}</span></div></div></main>`;
}
function render() {
  disposeAdventure?.(); disposeAdventure = null;
  document.documentElement.classList.toggle('reduce-motion',settings.reducedMotion);
  if(screen === 'arcade') {
    app.innerHTML = adventureMarkup();
    disposeAdventure = mountAdventure(app, {science:showScience, workshop:()=>go('briefing'), reducedMotion:settings.reducedMotion});
    return;
  }
  const views = { home, briefing:briefingScreen, build:buildScreen, check:checkScreen, launch:flightScreen, flight:flightScreen, explore:exploreScreen, results:resultsScreen };
  app.innerHTML = `${header()}${(views[screen] || home)()}${footer()}`;
}
function modal(title, content, wide = false) {
  lastFocused = document.activeElement;
  dialog.innerHTML = `<div class="modal-head"><div><span class="eyebrow">TITAN / FIELD NOTES</span><h2 id="dialog-title">${title}</h2></div>${button('close',icon('close'),'icon-button','aria-label="Close dialog"')}</div>${content}`;
  dialog.classList.toggle('wide',wide);
  if (!dialog.open) dialog.showModal();
}
function closeModal() { dialog.close(); lastFocused?.focus(); }
function showDetails() {
  if (!mission) return;
  const r = resources(mission), report = validate(mission);
  const center={x:110,y:110}, points=[[110,20],[22,172],[198,172]];
  const ratios=[clamp(r.mass/(r.capacity||1),0,1),clamp(r.cost/r.budget,0,1),clamp(r.generation/(r.demand||1),0,1)];
  const polygon=points.map(([x,y],i)=>`${center.x+(x-center.x)*ratios[i]},${center.y+(y-center.y)*ratios[i]}`).join(' ');
  modal('Inside your explorer',`<div class="details-grid"><div class="triangle"><svg viewBox="0 0 220 215" role="img" aria-label="Resource triangle: mass utilization, budget utilization and power adequacy"><path d="M110 20 22 172h176Z" fill="#1c3036" stroke="#527e7d"/><path d="m110 20 0 90m-88 62 88-62 88 62" stroke="#527e7d"/><polygon points="${polygon}" fill="#88d2c1" fill-opacity=".3" stroke="#a5e2cf" stroke-width="2"/><text x="110" y="12" text-anchor="middle">MASS</text><text x="22" y="195" text-anchor="middle">BUDGET</text><text x="190" y="195" text-anchor="middle">POWER</text></svg><p>Mass and budget show the share used. Power shows how much demand your generator covers.</p></div><dl><dt>Launch mass / capacity</dt><dd>${r.mass} / ${r.capacity} kg</dd><dt>Payload margin</dt><dd>${r.capacity-r.mass} kg</dd><dt>Spent / initial budget</dt><dd>${number(r.cost)} / ${number(r.budget)} MC</dd><dt>Generation / all systems</dt><dd>${r.generation} / ${r.demand} W</dd><dt>Essential systems</dt><dd>${r.baseline} W</dd><dt>All-on power margin</dt><dd>${r.margin} W</dd><dt>Battery capacity</dt><dd>${r.battery} Wh</dd><dt>Battery life at all-on deficit</dt><dd>${r.margin < 0 ? (r.battery/-r.margin).toFixed(1)+' hours' : 'Generation covers demand'}</dd><dt>Science potential</dt><dd>${r.science} points</dd><dt>Fictional launch reliability rating</dt><dd>${r.reliability}% (no random launch failure)</dd><dt>Flotation reserve</dt><dd>${Math.round(report.float.margin*100)}%</dd></dl></div><h3>Engineering notes</h3>${[...report.errors,...report.warnings].map(text=>`<p class="warning-note">${escape(text)}</p>`).join('') || '<p>All checks passed. Keep enough energy for landing and transmitting your findings.</p>'}<p class="fine-print">Power (W) is the rate of energy use. Your battery stores energy (Wh). Component values, lake liquid densities and operating limits are game assumptions, not NASA hardware specifications.</p>`,true);
}
function showTelemetry() {
  const f=mission.flight, e=f.entry;
  const samples=e?.samples || [];
  const trace=samples.filter((_,i)=>i%Math.max(1,Math.floor(samples.length/60))===0).map((s,i,arr)=>`${20+i/(arr.length-1||1)*540},${130-clamp(s.velocity/5200,0,1)*110}`).join(' ');
  modal('Mission telemetry',`<p class="warning-note">Simulated mission data. Cruise distance and travel time are narrative approximations; entry uses a simplified vertical-column model.</p><div class="telemetry-metrics"><div><strong>${f.elapsedYears}</strong><span>years traveled</span></div><div><strong>${(f.distance/1e9).toFixed(2)}B</strong><span>km traveled</span></div><div><strong>${Math.round(f.energy)}</strong><span>Wh in battery</span></div><div><strong>${Math.round(f.temperature)}</strong><span>internal temperature, K</span></div></div>${e?`<h3>Descent velocity · simulated m/s</h3><svg class="telemetry-chart" viewBox="0 0 580 150" role="img" aria-label="Velocity decreases during descent"><path d="M20 10v120h540" stroke="#5a6a71" fill="none"/><polyline points="${trace}" fill="none" stroke="#93d3c2" stroke-width="2"/></svg><p>Splashdown: ${e.velocity.toFixed(2)} m/s · Heating: ${(e.heat/1e6).toFixed(2)} MJ/m² · Peak shield surface: ${Math.round(e.peakTemperature)} K</p><p>Heat protection used: ${(e.heatRatio*100).toFixed(0)}% · Parachute: ${e.torn?'torn':'deployed'} · Descent duration: ${(e.duration/3600).toFixed(2)} simulated hours.</p>`:''}<p>Communication: ${mission.design.comms ? 'antenna available' : 'unavailable'}. Interplanetary signals take roughly an hour or more each way, depending on orbital geometry; this game compresses that delay.</p><h3>Mission log</h3><ol class="mission-log">${f.log.map(event=>`<li><small>${escape(event.kind)}</small>${escape(event.text)}</li>`).join('')}</ol>`,true);
}
async function showScience(forceRefresh = false) {
  modal('The real world behind the adventure',`<div class="science-facts"><article><span>94 K</span><h3>A beautifully cold world.</h3><p>Titan’s surface is around −179°C. Its lakes hold liquid methane and ethane, not water.</p></article><article><span>1.35 m/s²</span><h3>A lighter kind of landing.</h3><p>Low gravity and a dense atmosphere help parachutes slow a descending spacecraft.</p></article><article><span>≈ 1.5×</span><h3>A thicker atmosphere.</h3><p>Surface pressure is about 1.5 times Earth’s. Most of the atmosphere is nitrogen.</p></article></div><p>Our lake explorer is fictional. NASA’s real <a href="https://science.nasa.gov/mission/dragonfly/" target="_blank" rel="noopener">Dragonfly mission</a> is a rotorcraft. An MMRTG turns radioactive-decay heat into electricity; its rechargeable battery is a separate component.</p><div class="source-links"><a href="https://science.nasa.gov/saturn/moons/titan/facts/" target="_blank" rel="noopener">Titan facts ↗</a><a href="https://science.nasa.gov/mission/cassini/" target="_blank" rel="noopener">Cassini–Huygens ↗</a></div><details><summary>How the game models Titan</summary><p>Drag = ½ρv²CdA. Air density decreases exponentially with altitude. Entry heating uses a simplified density-and-speed relation. A hull floats when displaced liquid weighs more than the lander, with a 12% reserve. Wind and density differences between sites are fictional scenarios, not measured weather. Solar outputs already include a severe Titan-light penalty. Each observation and data unit is simulated.</p><p>The game is a vertical entry and energy-management model, not flight-qualified mission software. Saturn appears in the artwork for atmosphere; the view is artistic, not a precise surface sky reconstruction.</p></details><h3 class="gallery-title">Through NASA’s eyes</h3><p id="image-status" role="status">Connecting to NASA’s Image and Video Library…</p><div id="nasa-gallery" class="nasa-gallery"></div><h3>Explore the planetary archive</h3><p id="dataset-status" role="status">Looking for Titan records…</p><div id="nasa-datasets"></div>${button('refresh-science','Refresh NASA sources','secondary')}`,true);
  const datasetOptions = ['127.0.0.1','localhost'].includes(location.hostname) ? { endpoint: '/api/pds', forceRefresh } : { forceRefresh };
  const [images,datasets]=await Promise.all([forceRefresh ? loadImages({ forceRefresh: true }) : nasaImages || loadImages(), forceRefresh ? loadDatasets(datasetOptions) : nasaDatasets || loadDatasets(datasetOptions)]);
  nasaImages=images; nasaDatasets=datasets;
  if (!dialog.open || !dialog.querySelector('#nasa-gallery')) return;
  dialog.querySelector('#image-status').textContent=images.message;
  dialog.querySelector('#dataset-status').textContent=datasets.message;
  dialog.querySelector('#nasa-gallery').innerHTML=images.items.map(item=>`<article><a href="${escape(item.source)}" target="_blank" rel="noopener"><img src="${escape(item.url)}" alt="${escape(item.title)}" loading="lazy"><h4>${escape(item.title)}</h4></a><p>${escape(item.description)}</p><small>NASA library · ${escape(item.credit)}<br>${escape(item.kind || 'NASA image (see source for type)')}</small></article>`).join('');
  dialog.querySelectorAll('#nasa-gallery img').forEach(img=>img.addEventListener('error',()=>{img.replaceWith(Object.assign(document.createElement('p'),{textContent:'Image unavailable. Open the original NASA record above.'}));}));
  dialog.querySelector('#nasa-datasets').innerHTML=datasets.items.map(item=>`<article class="dataset"><a href="${escape(item.source)}" target="_blank" rel="noopener">${escape(item.title)} ↗</a><p>${escape(item.description)}</p><code>${escape(item.id)}</code></article>`).join('');
}
function showArchive() {
  const records=read('titan.archive.v1',[]);
  modal('Your expedition archive',Array.isArray(records)&&records.length?`<div class="archive-list">${records.map(item=>`<article><div>${icon(item.success?'star':'rocket',28)}</div><div><h3>${escape(item.rank)}</h3><p>${escape(item.lake)} · ${escape(item.difficulty)}</p><small>${escape(new Date(item.date).toLocaleDateString())}</small></div><strong>${escape(item.score)}<small> /100</small></strong></article>`).join('')}</div>`:'<div class="empty-state">'+icon('archive',44)+'<h3>Your story is still unwritten.</h3><p>Complete an expedition and its discoveries will be saved here, in this browser.</p></div>');
}
function showSettings() { modal('Make space your own',`<label class="setting-row"><span><strong>Quiet mission sounds</strong><small>Soft sounds when you make a choice.</small></span><input type="checkbox" id="sound-toggle" ${settings.sound?'checked':''}></label><label class="setting-row"><span><strong>Reduce motion</strong><small>Keep the scenery still and transitions gentle.</small></span><input type="checkbox" id="motion-toggle" ${settings.reducedMotion?'checked':''}></label><p class="fine-print">System reduced-motion preferences are also respected. Progress and settings are saved only in this browser.</p>`); }
function showHelp() { modal('A little guide to a big adventure',`<ol class="help-list"><li><strong>Build your explorer.</strong>Pick parts in seven short steps. Selected parts can be removed by clicking again. Look after mass, credits and power.</li><li><strong>Check, then launch.</strong>Fix the friendly engineering notes. A green check means your ship can begin its journey.</li><li><strong>Make the calls.</strong>Save energy, correct your course and protect your spacecraft. Your choices matter more than luck.</li><li><strong>Land and discover.</strong>Choose a safe parachute window. Balance the boat. Study both lake chemistry and the environment.</li><li><strong>Send it home.</strong>Observations only count toward success after you transmit them. Finish within 24 simulated lake hours.</li></ol><p>You can take your time with every choice. Only the launch countdown runs in real time, and you can pause it. Use Tab to move and Enter or Space to choose.</p>`); }
function startCountdown() {
  if(countdown!==null)return;
  countdown=3; render();
  countdownTimer=setInterval(()=>{countdown-=1; if(countdown<0){clearInterval(countdownTimer);countdown=null;mission.stage='flight';persist();go('flight');}else render();},1000);
}
function stopCountdown(){clearInterval(countdownTimer);countdown=null;}
function finishAndArchive(reason) { finishMission(mission,reason); archiveMission(mission); persist(); go('results'); }
app.addEventListener('click',handleClick);
dialog.addEventListener('click',handleClick);
dialog.addEventListener('click',event=>{if(event.target===dialog)closeModal();});
dialog.addEventListener('cancel',()=>{lastFocused?.focus();});
document.addEventListener('change',event=>{
  if(event.target.id==='lake-choice'){briefing.lake=event.target.value;render();}
  if(event.target.id==='sound-toggle'||event.target.id==='motion-toggle'){
    settings[event.target.id==='sound-toggle'?'sound':'reducedMotion']=event.target.checked;write('titan.settings.v1',settings);render();sound();
  }
});
function handleClick(event) {
  const target=event.target.closest('[data-action]'); if(!target||target.disabled)return;
  const action=target.dataset.action;sound();
  if(action==='close')return closeModal();
  if(action==='science')return void showScience();
  if(action==='refresh-science'){nasaImages=null;nasaDatasets=null;return void showScience(true);}
  if(action==='archive')return showArchive();
  if(action==='settings')return showSettings();
  if(action==='help')return showHelp();
  if(action==='details')return showDetails();
  if(action==='telemetry')return showTelemetry();
  if(action==='home'){stopCountdown();persist();return go('home');}
  if(action==='new'){stopCountdown();return go('briefing');}
  if(action==='continue'&&mission)return go(mission.stage);
  if(action==='difficulty'){briefing.difficulty=target.dataset.id;return render();}
  if(action==='start-build'){mission=newMission(briefing.difficulty,briefing.lake);persist();return go('build');}
  if(action==='build-step'){mission.buildStep=Number(target.dataset.index);persist();return render();}
  if(action==='part'){
    const result=choosePart(mission,target.dataset.category,target.dataset.id);
    if(!result.ok)return notify(result.message);
    persist();render();app.querySelector(`[data-action="part"][data-id="${target.dataset.id}"]`)?.focus({preventScroll:true});return;
  }
  if(action==='next'){mission.buildStep=Math.min(6,mission.buildStep+1);persist();return go('build');}
  if(action==='previous'){if(mission.buildStep===0)return go('briefing');mission.buildStep-=1;persist();return go('build');}
  if(action==='validate'){mission.stage='check';persist();return go('check');}
  if(action==='return-build'){mission.stage='build';persist();return go('build');}
  if(action==='launch'){if(beginFlight(mission)){persist();go('launch');}return;}
  if(action==='ignite')return startCountdown();
  if(action==='cancel-launch'){stopCountdown();return render();}
  if(action==='flight-choice'){
    advanceFlight(mission,target.dataset.id);
    if(mission.stage==='results')archiveMission(mission);
    persist();return go(mission.stage==='explore'?'explore':mission.stage==='results'?'results':'flight');
  }
  if(action==='collect'||action==='transmit'||action==='recharge'){
    const result=action==='collect'?collectScience(mission,target.dataset.id):action==='transmit'?transmit(mission):recharge(mission);notify(result.message);persist();render();return;
  }
  if(action==='finish'){
    const f=mission.flight;
    if(!f.transmittedObjectives.includes('chemistry')||!f.transmittedObjectives.includes('environment'))return modal('Ready to head home?',`<p>Your main science goals are not both transmitted yet. You can keep exploring, or finish with partial success.</p><div class="home-actions">${button('close','Keep exploring')}${button('finish-confirm','Finish with partial science','secondary')}</div>`);
    return finishAndArchive();
  }
  if(action==='finish-confirm'){closeModal();return finishAndArchive();}
  if(action==='retry'){
    const design=structuredClone(mission.design),difficulty=mission.difficulty,lake=mission.lake;
    mission=newMission(difficulty,lake);mission.design=design;persist();return go('build');
  }
}
render();
