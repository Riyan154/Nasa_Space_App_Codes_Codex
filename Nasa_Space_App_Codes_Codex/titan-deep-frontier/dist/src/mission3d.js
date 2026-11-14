export const worlds = {
  Titan: { sky: '#c29568', ground: '#386064', sun: 1, source: 'https://science.nasa.gov/saturn/moons/titan/facts/', facts: [
    ['A lake without water', 'Liquid methane and ethane fill lakes on Titan.'],
    ['Ice as hard as rock', 'The surface is about −179 °C. Water stays frozen here.'],
    ['Alien rain', 'Methane forms clouds and falls as rain.'],
    ['A blanket of air', 'Titan has a thick atmosphere made mostly of nitrogen.'],
    ['A giant moon', 'Titan is larger than the planet Mercury.']] },
  Mars: { sky: '#ca967c', ground: '#a85e40', sun: 8, source: 'https://science.nasa.gov/mars/facts/', facts: [
    ['Rusty dust', 'Oxidized iron gives Martian dust its red color.'], ['A towering volcano', 'Olympus Mons is the largest volcano in our solar system.'],
    ['An enormous canyon', 'Valles Marineris stretches more than 4,000 km.'], ['Ancient rivers', 'Old channels and lakebeds preserve evidence of flowing water.'],
    ['Thin air', 'The Martian atmosphere is mostly carbon dioxide.']] },
  Moon: { sky: '#323e61', ground: '#787b89', sun: 20, source: 'https://science.nasa.gov/moon/facts/', facts: [
    ['Footsteps in dust', 'There is no wind or rain to quickly erase footprints.'], ['Clinging dust', 'Sharp lunar dust sticks to boots and equipment.'],
    ['Ice in the shadows', 'Some permanently shadowed polar regions contain water ice.'], ['Moonquakes', 'Apollo instruments recorded quakes on the Moon.'],
    ['A familiar face', 'The Moon turns once per orbit and keeps nearly the same face toward Earth.']] }
};
const part = (id, name, mass, cost, extra) => ({id, name, mass, cost, ...extra});
export const equipment = {
  Rocket: [part('atlas','Atlas Explorer',0,20000,{lift:1500}),part('titan','Titan Heavy',0,30000,{lift:2500}),part('deep','DeepSpace XL',0,42000,{lift:3500}),part('horizon','Horizon Ultra',0,55000,{lift:5000})],
  Power: [part('solar','Solar wings',160,7000,{watts:18,wh:500}),part('rtg','Radioisotope core',130,22000,{watts:110,wh:550}),part('mmrtg','MMRTG core',190,28000,{watts:145,wh:850}),part('reactor','Micro-reactor',250,38000,{watts:200,wh:1200})],
  Science: [part('spectrometer','Methane detective',55,7000,{draw:35,data:65}),part('atmosphere','Weather station',30,4000,{draw:15,data:30}),part('camera','Panorama camera',70,6000,{draw:25,data:90}),part('radar','Ground radar',120,11000,{draw:50,data:120})],
  Radio: [part('antenna','Explorer antenna',45,6000,{draw:12,rate:35}),part('dish','High-gain dish',90,9500,{draw:25,rate:80}),part('array','Deep-space array',150,14000,{draw:40,rate:150}),part('laser','Laser terminal',110,18000,{draw:55,rate:250})]
};
export const sites = [[-4,5],[6,12],[-7,20],[4,26],[0,34]];
export const budgets = [112000,100000,91000];
const atmospheres={Titan:[1.35,5.3,20000,180000,3600],Mars:[3.71,.02,11100,40000,550],Moon:[1.62,0,1,1200,35]};
export function landingReport(m,chute,retro){
  const [gravity,density,scale,start,arrival]=atmospheres[m.world];
  const mass=totals(m).mass,dt=.1,thrust=m.world==='Mars'?14:8;
  let altitude=start,speed=arrival,fuel=95,heat=0,open=false;
  for(let step=0;altitude>0&&step<240000;step++){
    const rho=density*Math.exp(-altitude/scale),pressure=.5*rho*speed*speed;
    if(chute&&density&&altitude<15000&&pressure<=800)open=true;
    let acceleration=gravity-pressure*1.5*(open?220:12)/mass;
    if(retro&&fuel>0&&speed>2.5&&altitude<=speed*speed/(2*(thrust-gravity))+30){acceleration-=thrust;fuel=Math.max(0,fuel-.9*dt);}
    speed=Math.max(.5,speed+acceleration*dt);altitude-=speed*dt;
    heat+=1.2e-4*Math.sqrt(rho/1.4)*speed**3*dt;
  }
  return {safe:altitude<=0&&speed<=4.5,speed,fuel,heat};
}
export function mission(advanced=false) {
  return {stage:'destination', world:'Titan', difficulty:0, advanced, design:{Rocket:'atlas',Power:'rtg',Science:['camera'],Radio:'antenna'},rings:0,found:[],x:0,z:0,energy:0,data:0,hours:0};
}
export function totals(m) {
  const selected = Object.entries(equipment).flatMap(([category,parts])=>parts.filter(p=>category==='Science'?m.design.Science.includes(p.id):p.id===m.design[category]));
  const power=selected.find(p=>p.wh), radio=selected.find(p=>p.rate);
  return {mass:selected.reduce((s,p)=>s+p.mass,m.world==='Titan'?820:760),cost:selected.reduce((s,p)=>s+p.cost,23000),budget:budgets[m.difficulty],
    lift:selected.find(p=>p.lift).lift,supply:power.watts*(power.id==='solar'?worlds[m.world].sun:1),capacity:power.wh,
    draw:selected.reduce((s,p)=>s+(p.draw||0),40),essential:40+radio.draw,rate:radio.rate*(radio.id==='laser'&&m.world==='Titan'?.2:1)};
}
export function problem(m) {
  const r=totals(m);
  if(!m.design.Science.length)return 'Pack a science tool so Pip can collect discoveries.';
  if(r.cost>r.budget)return 'Choose a less expensive part to fit the budget.';
  if(r.mass>r.lift)return 'Choose a larger rocket or remove a tool.';
  if(r.supply<r.essential)return 'The sunlight here is too weak. Try a radioisotope core.';
  return '';
}
export function collect(m,index) {
  if(m.stage!=='explore'||!sites[index]||m.found.includes(index)||Math.hypot(m.x-sites[index][0],m.z-sites[index][1])>2)return false;
  const tool=equipment.Science.find(p=>p.id===m.design.Science[index%m.design.Science.length]);
  if(!tool)return false;
  const r=totals(m), next=m.energy+(r.supply-r.essential-tool.draw)*.25;
  if(m.advanced&&next<0)return false;
  if(m.advanced){m.hours+=.25;m.energy=Math.min(r.capacity,next);}
  m.data+=tool.data;m.found.push(index);return true;
}
