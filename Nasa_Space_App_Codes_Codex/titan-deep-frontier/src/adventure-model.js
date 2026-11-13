// Reference facts are distinct from the fictional navigation and sample game.
export const FACT_SOURCE = 'https://science.nasa.gov/saturn/moons/titan/facts/';
export const DISCOVERIES = [
  { id:'lake', x:520, y:.73, symbol:'drop', title:'A lake without water!', label:'Sample the lake', tool:'Dipping the sample scoop…', fact:'Titan’s lakes contain liquid methane and ethane. These are gases on a warm day on Earth.', value:'METHANE + ETHANE', color:'#75c9ba' },
  { id:'cold', x:1050, y:.86, symbol:'thermometer', title:'Brrr… a frozen world!', label:'Check the temperature', tool:'Reading the thermometer…', fact:'Titan’s surface is about −179°C. Water ice is as hard as rock here!', value:'ABOUT −179°C', color:'#9ac9df' },
  { id:'rain', x:1560, y:.64, symbol:'cloud', title:'Alien raindrops!', label:'Watch the rain', tool:'Watching the methane clouds…', fact:'Titan has clouds, rain and rivers. Its methane cycle is a little like Earth’s water cycle.', value:'METHANE RAIN', color:'#c6bedc' },
  { id:'air', x:2070, y:.82, symbol:'wind', title:'A thick blanket of air!', label:'Study the air', tool:'Lifting the weather balloon…', fact:'Titan’s air is mostly nitrogen. Surface pressure is about 60% higher than Earth’s.', value:'ABOUT 1.6 × EARTH’S PRESSURE', color:'#f3cc89' },
  { id:'shore', x:2520, y:.67, symbol:'camera', title:'A moon full of surprises!', label:'Photograph the shore', tool:'Taking a panorama…', fact:'Titan is Saturn’s largest moon. It is bigger than the planet Mercury!', value:'BIGGER THAN MERCURY', color:'#e9a58c' },
];
export const clamp = (v,min,max) => Math.max(min,Math.min(max,v));
export function freshAdventure() { return {version:2, stage:'assemble', parts:[], found:[], x:180, y:.77, rings:0, sent:false}; }
export function restoreAdventure(value) {
  if (!value || value.version!==2 || !['assemble','launch','cruise','landing','lake','done'].includes(value.stage)) return null;
  if (!Array.isArray(value.parts) || value.parts.some(p=>!['floats','power','radio'].includes(p)) || new Set(value.parts).size!==value.parts.length) return null;
  if (!Array.isArray(value.found) || value.found.some(id=>!DISCOVERIES.some(d=>d.id===id)) || new Set(value.found).size!==value.found.length) return null;
  if (!Number.isFinite(value.x)||!Number.isFinite(value.y)||!Number.isInteger(value.rings)||value.rings<0||value.rings>3||typeof value.sent!=='boolean') return null;
  if (value.stage!=='assemble' && value.parts.length!==3) return null;
  if (value.sent && value.found.length!==5) return null;
  if (value.stage==='done' && (value.found.length!==5||!value.sent)) return null;
  return {...value,x:clamp(value.x,80,2700),y:clamp(value.y,.6,.9)};
}
export function nearbyDiscovery(state) {
  return DISCOVERIES.find(d=>!state.found.includes(d.id) && Math.abs(state.x-d.x)<125 && Math.abs(state.y-d.y)<.15) || null;
}
export function moveExplorer(state, dx,dy,dt) {
  // Normalize diagonal motion. Clamp dt so returning to a backgrounded tab cannot teleport.
  const length=Math.max(1,Math.hypot(dx,dy)), delta=clamp(dt,0,.05);
  state.x=clamp(state.x+dx/length*260*delta,80,2700);
  state.y=clamp(state.y+dy/length*.3*delta,.6,.9);
}
export function collectDiscovery(state,id) {
  const near=nearbyDiscovery(state);
  if (state.stage!=='lake'||!near||near.id!==id) return false;
  state.found.push(id); return true;
}
export function finishAdventure(state) {
  if(state.stage!=='lake'||state.sent||state.found.length!==DISCOVERIES.length) return false;
  state.sent=true; state.stage='done'; return true;
}
