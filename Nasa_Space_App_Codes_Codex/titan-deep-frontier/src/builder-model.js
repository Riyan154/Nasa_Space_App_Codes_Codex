// Illustrative game engineering values, not specifications or prices of NASA hardware.
export const BUILDER_LIMITS = { mass: 240, budget: 300 };
export const DEFAULT_LOADOUT = { body: 'light', power: 'rtg', science: 'camera', radio: 'dish' };
export const COMPONENTS = {
  body: [
    { id:'light', name:'Light explorer', tag:'LIGHT & NIMBLE', mass:25, cost:35, draw:0, detail:'A small aluminium body with slim floating feet. More room in your mass budget.' },
    { id:'shield', name:'Insulated explorer', tag:'WRAPPED UP WARM', mass:50, cost:60, draw:0, detail:'A gold thermal blanket and wider floats. Insulation helps slow heat loss.' },
    { id:'heavy', name:'Cargo explorer', tag:'BIG SCIENCE BUDDY', mass:80, cost:80, draw:0, detail:'A reinforced body and two chunky pontoons carry your equipment.' },
  ],
  power: [
    { id:'solar', name:'Solar wings', tag:'SUNLIGHT → ELECTRICITY', mass:28, cost:45, draw:0, supply:8, detail:'Blue cells turn sunlight into electricity. Titan is far from the Sun and very hazy: these small wings cannot run this mission.' },
    { id:'rtg', name:'Radioisotope generator', tag:'HEAT → ELECTRICITY', mass:45, cost:110, draw:0, supply:110, detail:'A sealed generator turns heat from radioactive decay into electricity. Its fins release extra heat. It works without sunlight.' },
    { id:'battery', name:'Battery pack', tag:'STORED ENERGY', mass:32, cost:55, draw:0, supply:80, energy:600, detail:'Stores electricity for a short trip. It runs out unless recharged. This pretend pack holds 600 Wh.' },
  ],
  science: [
    { id:'camera', name:'Panorama camera', tag:'LOOK CLOSELY', mass:12, cost:30, draw:8, detail:'A blue lens and rotating camera mast photograph the alien shore.' },
    { id:'sampler', name:'Sample scoop', tag:'REACH & DISCOVER', mass:28, cost:55, draw:18, detail:'An articulated arm dips a copper scoop into the methane sea.' },
    { id:'lab', name:'Mini science lab', tag:'A LITTLE OF EVERYTHING', mass:48, cost:85, draw:35, detail:'Twin sample canisters and extra sensors make a tiny floating laboratory.' },
  ],
  radio: [
    { id:'whip', name:'Little antenna', tag:'SMALL & SIMPLE', mass:7, cost:20, draw:5, detail:'A slender antenna saves mass. In real missions, antenna design affects how much data can be sent.' },
    { id:'dish', name:'Space dish', tag:'POINT TOWARD HOME', mass:15, cost:35, draw:12, detail:'A curved dish focuses radio signals. Watch it gently track across the sky.' },
    { id:'array', name:'Twin antenna', tag:'DOUBLE THE DETAIL', mass:26, cost:65, draw:22, detail:'Two antenna panels with a small tracking dish make a detailed communications module.' },
  ],
};
export function validLoadout(value) {
  return !!value && typeof value==='object' && Object.entries(COMPONENTS).every(([group,items])=>items.some(item=>item.id===value[group]));
}
export function missionTotals(loadout) {
  const safe=validLoadout(loadout)?loadout:DEFAULT_LOADOUT;
  const items=Object.entries(COMPONENTS).map(([group,options])=>({group,...options.find(item=>item.id===safe[group])}));
  const mass=65+items.reduce((sum,item)=>sum+item.mass,0);
  const cost=50+items.reduce((sum,item)=>sum+item.cost,0);
  const demand=15+items.reduce((sum,item)=>sum+item.draw,0);
  const power=items.find(item=>item.group==='power');
  const issues=[];
  if(mass>BUILDER_LIMITS.mass)issues.push('Too heavy! Try a lighter body or science kit.');
  if(cost>BUILDER_LIMITS.budget)issues.push('Over budget! Swap a part to save mission coins.');
  if(power.supply<demand)issues.push('Too little sunlight on Titan. Try the generator or battery pack.');
  return {items,mass,cost,demand,supply:power.supply,margin:power.supply-demand,hours:power.energy?power.energy/demand:null,issues,ready:issues.length===0};
}
