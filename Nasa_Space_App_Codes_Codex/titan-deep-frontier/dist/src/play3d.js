import {mission,worlds,sites,equipment,totals,problem,collect,budgets,landingReport} from './mission3d.js';
import {makeWorld} from './world3d.js';
const css=document.createElement('link');
css.rel='stylesheet';css.href=new URL('./play3d.css',import.meta.url);document.head.append(css);
const app=document.querySelector('#app');
app.innerHTML='<main class="expedition"><canvas aria-label="Animated 3D expedition"></canvas><header><strong>TITAN <small>DEEP FRONTIER</small></strong><button id="options">Pause / settings</button></header><section id="console"></section><output id="readout" aria-live="polite"></output></main>';
const canvas=app.querySelector('canvas'), draw=makeWorld(canvas), panel=document.querySelector('#console'), readout=document.querySelector('#readout'), dialog=document.querySelector('#overlay');
const saveKey='titan.browser3d.v1';
let m=mission();m.stage='title';
let saved=null,sound=false,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const view={time:0,orbit:.52,category:'Rocket',progress:0,altitude:8,chute:false,heading:0,y:2};
let moving=false,descending=false,guide=null,previous=performance.now(),drag=null,lastSave=0;
const keys=new Set(), buttons=Object.keys(equipment);
try {
  const record=JSON.parse(localStorage.getItem(saveKey));
  if(record?.mission&&Object.hasOwn(worlds,record.mission.world)&&Array.isArray(record.mission.found)&&Number.isFinite(totals(record.mission).cost))saved=record;
  const prefs=JSON.parse(localStorage.getItem('titan.browser3d.prefs'))||{};
  sound=!!prefs.sound;reduced=prefs.reduced??reduced;
} catch {}
function save(){
  if(m.stage==='title')return;
  saved=structuredClone({mission:m,view});
  try {localStorage.setItem(saveKey,JSON.stringify(saved));}catch{}
}
function tone(){
  if(!sound)return;
  try{const audio=new AudioContext(),osc=audio.createOscillator(),gain=audio.createGain();
    osc.connect(gain);gain.connect(audio.destination);osc.frequency.value=630;gain.gain.setValueAtTime(.035,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.16);osc.start();osc.stop(audio.currentTime+.16);osc.onended=()=>audio.close();
  }catch{}
}
const btn=(id,label,extra='')=>`<button data-do="${id}" ${extra}>${label}</button>`;
function note(text){readout.textContent=text;}
function go(stage){m.stage=stage;moving=false;descending=false;guide=null;keys.clear();view.progress=0;note('');save();render();}
function popup(title,html){
  moving=false;keys.clear();
  dialog.innerHTML=`<h2 id="dialog-title">${title}</h2>${html}<form method="dialog"><button>Continue</button></form>`;
  if(!dialog.open)dialog.showModal();
}
const pad=()=>'<div class="steer" aria-label="Steer">'+[['left','←'],['up','↑'],['down','↓'],['right','→']].map(([id,label])=>btn('dir-'+id,label,`aria-label="Move ${id}"`)).join('')+'</div>';
function render(){
  app.dataset.stage=m.stage;
  let h='',copy='',controls='';
  switch(m.stage){
    case 'title':
      h='Deep Frontier';copy='Build a spacecraft with Pip. Fly it to another world.';controls=btn('start','Start exploring →')+(saved?btn('continue','Continue mission'):'')+btn('advanced','Engineering workshop')+'<a href="?classic">Classic 2D game ↗</a>';break;
    case 'destination':
      h='Pick a world';copy=worlds[m.world].facts[0][1];
      controls=Object.keys(worlds).map(w=>btn('world-'+w,w,`aria-pressed="${w===m.world}"`)).join('');
      if(m.advanced)controls+='<label>Workshop budget <select id="difficulty">'+budgets.map((b,i)=>`<option value="${i}" ${m.difficulty===i?'selected':''}>${['Pathfinder','Explorer','Architect'][i]} · ${b.toLocaleString()} MC</option>`).join('')+'</select></label>';
      controls+=btn('build','Build for '+m.world+' →');break;
    case 'build': {
      const r=totals(m);h='Pip’s workbench';copy='Drag the spacecraft to see your parts from every side.';
      const meter=(label,value,max,unit)=>`<label>${label} <b>${value.toLocaleString()} / ${max.toLocaleString()} ${unit}</b><meter min="0" max="${max}" value="${value}"></meter></label>`;
      controls='<div class="resource3">'+meter('Mass',r.mass,r.lift,'kg')+meter('Budget',r.cost,r.budget,'MC')+meter('Power use',r.draw,r.supply,'W')+'</div><div class="tabs3">'+buttons.map(c=>btn('tab-'+c,c,`aria-pressed="${c===view.category}"`)).join('')+'</div>';
      controls+='<div class="parts3">'+equipment[view.category].map(p=>{
        const selected=view.category==='Science'?m.design.Science.includes(p.id):m.design[view.category]===p.id;
        const stat=p.lift?p.lift+' kg lift':p.watts?p.watts+' W · '+p.wh+' Wh':p.rate?p.rate+' units/h':p.data+' data units';
        return btn('part-'+p.id,`${selected?'✓ ':''}${p.name}<small>${p.mass?p.mass+' kg · ':''}${p.cost.toLocaleString()} MC · ${stat}</small>`,`aria-pressed="${selected}"`);
      }).join('')+'</div>'+btn('launch','Check & launch →');break;
    }
    case 'launch':h='Lift off!';copy='Hold Space or the ignition button until Pip clears the pad.';controls=btn('hold','Hold to launch');break;
    case 'flight':h='Fly the rings';copy='Steer left or right into the gold ring. Hold Fly or Space to move forward.';controls=pad()+btn('hold','Hold to fly')+btn('align','Align with ring');break;
    case 'land':h=m.world==='Titan'?'Splash down':'Land on '+m.world;copy=m.world==='Moon'?'Fire the retro-rockets to slow Pip down.':m.world==='Mars'?'Open the chute, then arm the retro-rockets.':'Open the parachute above the methane sea.';
      controls=(m.world!=='Moon'?btn('chute',view.chute?'✓ Chute open':'Open parachute'):'')+(m.world!=='Titan'?btn('retro',m.retro?'✓ Rockets armed':'Arm retro-rockets'):'')+btn('descend','Begin descent');break;
    case 'explore':h='Explore '+m.world;copy='Drive with the arrows, or tap a beacon to guide Pip. Collect when you reach it.';
      controls=pad()+'<div class="beacons">'+sites.map((_,i)=>btn('guide-'+i,(m.found.includes(i)?'✓ ':'◇ ')+(i+1),`aria-label="Beacon ${i+1}"`)).join('')+'</div>'+btn('collect','Collect discovery')+(m.advanced?btn('charge','Recharge'):'')+(m.found.length===5?btn('send','Send discoveries →'):'');break;
    case 'transmit':h='Call Earth';copy=m.data+' data units ready to send through your '+equipment.Radio.find(r=>r.id===m.design.Radio).name+'.';controls=btn('transmit','Transmit to Earth');break;
    case 'results':h='Earth received you!';copy=`Pip returned all five ${m.world} discoveries. ${m.data} data units delivered.`;controls='<p>★ Space pilot &nbsp; ★ Explorer &nbsp; ★ Science buddy</p>'+btn('new','New expedition')+btn('refine','Refine spacecraft');break;
  }
  panel.innerHTML=`<h1>${h}</h1><p>${copy}</p><div class="actions3">${controls}</div>`;
  if(m.stage==='flight')note(`${m.rings} / 3 rings`);
  if(m.stage==='explore')note(`${m.found.length} / 5 discoveries`+(m.advanced?` · ${Math.round(m.energy)} Wh`:''));
}
function fact(i){
  const [title,text]=worlds[m.world].facts[i];
  popup(title,`<p>${text}</p><p>Real reference fact · Pip’s collection is pretend play, not a measurement.</p><a target="_blank" rel="noopener" href="${worlds[m.world].source}">NASA field notes ↗</a>`);
}
function action(id){
  tone();
  if(id==='start'||id==='advanced'||id==='new'){m=mission(id==='advanced'||(id==='new'&&m.advanced));view.category='Rocket';view.altitude=8;view.chute=false;go('destination');return;}
  if(id==='continue'&&saved){m=structuredClone(saved.mission);Object.assign(view,saved.view);render();return;}
  if(id.startsWith('world-'))m.world=id.slice(6);
  else if(id==='build'||id==='refine'){if(id==='refine')m={...mission(m.advanced),world:m.world,difficulty:m.difficulty,design:m.design};go('build');return;}
  else if(id.startsWith('tab-'))view.category=id.slice(4);
  else if(id.startsWith('part-')){
    const key=id.slice(5),old=structuredClone(m.design);
    if(view.category==='Science'){const tools=m.design.Science;m.design.Science=tools.includes(key)?tools.filter(x=>x!==key):[...tools,key];}else m.design[view.category]=key;
    if(totals(m).cost>totals(m).budget){m.design=old;note('That part exceeds the budget. Swap a less expensive part first.');return;}note('');
  }else if(id==='launch'){const error=problem(m);if(error){note(error);return;}m.energy=totals(m).capacity;go('launch');return;}
  else if(id==='align'){m.x=[-2,2,0][m.rings];}
  else if(id==='chute'){view.chute=true;}
  else if(id==='retro'){m.retro=true;}
  else if(id==='descend'){
    if((m.world!=='Moon'&&!view.chute)||(m.world!=='Titan'&&!m.retro)){note('Pip needs the landing equipment shown above.');return;}
    m.landing=landingReport(m,view.chute,m.retro);
    if(!m.landing.safe){note('Touchdown would be too fast. Adjust the landing equipment and try again.');return;}
    descending=true;note(m.advanced?'Descending · predicted touchdown '+m.landing.speed.toFixed(1)+' m/s':'Descending…');return;
  }else if(id.startsWith('guide-')){const i=Number(id.slice(6));if(m.found.includes(i)){fact(i);return;}guide=i;note('Driving to beacon '+(i+1));return;}
  else if(id==='collect'){const i=sites.findIndex(([x,z],n)=>!m.found.includes(n)&&Math.hypot(m.x-x,m.z-z)<=2);if(!collect(m,i)){note(i<0?'Move closer to a gold beacon.':'Recharge Pip’s battery first.');return;}save();render();fact(i);return;}
  else if(id==='charge'){m.energy=totals(m).capacity;m.hours++;}else if(id==='send'){go('transmit');return;}
  else if(id==='transmit'){m.hours+=m.data/totals(m).rate;go('results');return;}else return;
  save();render();
}
panel.onclick=e=>{const id=e.target.closest('button')?.dataset.do;if(id&&!id.startsWith('dir-')&&id!=='hold')action(id);};
panel.onchange=e=>{if(e.target.id==='difficulty'){m.difficulty=+e.target.value;save();}};
panel.onpointerdown=e=>{const b=e.target.closest('button');if(!b)return;const id=b.dataset.do;if(id==='hold'||id.startsWith('dir-')){b.setPointerCapture(e.pointerId);if(id==='hold')moving=true;else keys.add(id.slice(4));}};
panel.onpointerup=panel.onpointercancel=e=>{moving=false;keys.delete(e.target.closest('button')?.dataset.do?.slice(4));};
canvas.onpointerdown=e=>{drag=e.clientX;canvas.setPointerCapture(e.pointerId);};
canvas.onpointermove=e=>{if(drag!==null){view.orbit+=(e.clientX-drag)*.012;drag=e.clientX;}};
canvas.onpointerup=canvas.onpointercancel=()=>drag=null;
const keyMap={ArrowLeft:'left',a:'left',ArrowRight:'right',d:'right',ArrowUp:'up',w:'up',ArrowDown:'down',s:'down',' ':'hold'};
window.addEventListener('keydown',e=>{
  if(dialog.open||!['launch','flight','explore'].includes(m.stage))return;
  if(keyMap[e.key]){keys.add(keyMap[e.key]);e.preventDefault();}
  if(e.key.toLowerCase()==='e'&&m.stage==='explore'&&!e.repeat)action('collect');
});
window.addEventListener('keyup',e=>keys.delete(keyMap[e.key]));
function suspend(){moving=false;keys.clear();save();}
window.addEventListener('blur',suspend);window.addEventListener('pagehide',suspend);
document.querySelector('#options').onclick=()=>popup('Mission settings',`<label><input id="audio3" type="checkbox" ${sound?'checked':''}> Mission sounds</label><label><input id="motion3" type="checkbox" ${reduced?'checked':''}> Reduced motion</label><p><a href="?classic">Open classic game and NASA gallery ↗</a></p>`);
dialog.onchange=()=>{sound=dialog.querySelector('#audio3').checked;reduced=dialog.querySelector('#motion3').checked;try{localStorage.setItem('titan.browser3d.prefs',JSON.stringify({sound,reduced}));}catch{}};
function tick(now){
  const dt=Math.min(.06,(now-previous)/1000);previous=now;
  if(!dialog.open&&!document.hidden){
    if(!reduced){view.time+=dt;if(drag===null&&['title','build','results'].includes(m.stage))view.orbit+=dt*.13;}
    const forward=moving||keys.has('hold'),horizontal=Number(keys.has('right'))-Number(keys.has('left')),vertical=Number(keys.has('up'))-Number(keys.has('down'));
    if(m.stage==='launch'&&forward){view.progress+=dt*.38;if(view.progress>=1){m.x=0;go('flight');}}
    else if(m.stage==='flight'){
      m.x=Math.max(-5,Math.min(5,m.x+horizontal*dt*5));if(forward)view.progress+=dt*.44;
      if(view.progress>=1){view.progress=0;if(Math.abs(m.x-[-2,2,0][m.rings])<1.55){m.rings++;tone();if(m.rings===3){view.altitude=8;view.chute=false;m.retro=false;go('land');}else{save();render();}}else note('Try again. Steer toward the gold ring.');}
    }else if(m.stage==='land'&&descending){view.altitude=Math.max(0,view.altitude-dt*3);if(!view.altitude){m.x=m.z=0;go('explore');}}
    else if(m.stage==='explore'){
      let dx=horizontal,dz=vertical;if(dx||dz)guide=null;
      if(guide!==null){dx=sites[guide][0]-m.x;dz=sites[guide][1]-m.z;if(Math.hypot(dx,dz)<.6){guide=null;dx=dz=0;note('Beacon reached! Collect your discovery.');}}
      const length=Math.hypot(dx,dz);if(length){m.x=Math.max(-15,Math.min(15,m.x+dt*6*dx/length));m.z=Math.max(-4,Math.min(40,m.z+dt*6*dz/length));view.heading=Math.atan2(-dx,-dz);}
    }
    if(now-lastSave>2600){lastSave=now;save();}
    draw(m,view);
  }
  requestAnimationFrame(tick);
}
render();requestAnimationFrame(tick);
