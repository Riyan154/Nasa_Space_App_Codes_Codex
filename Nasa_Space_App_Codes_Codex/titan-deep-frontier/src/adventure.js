import { DISCOVERIES, FACT_SOURCE, freshAdventure, restoreAdventure, nearbyDiscovery, moveExplorer, collectDiscovery, finishAdventure, clamp } from './adventure-model.js';
import { landscape, explorer, rocket, space, ellipse, path, box, glyph, star } from './adventure-art.js';
import { read, write } from './storage.js';

const KEY='titan.adventure.v2';
const chapters=['Build','Launch','Fly','Land','Explore'];
const stageNumber={assemble:0,launch:1,cruise:2,landing:3,lake:4,done:4};
const labels={assemble:'Build your buddy',launch:'Ready, set… space!',cruise:'Follow the golden rings',landing:'A soft landing',lake:'The lake of little wonders',done:'You did it, explorer!'};
export function adventureMarkup() {
  return `<main class="adventure" aria-label="Titan interactive game">
    <header class="game-top"><button class="game-logo" data-game="home" aria-label="Titan adventure home"><span class="logo-orbit">✦</span><span>TITAN<small>DEEP FRONTIER</small></span></button><div class="game-chapters" aria-label="Adventure chapters">${chapters.map((s,i)=>`<span data-chapter="${i}"><b>${i+1}</b>${s}</span>`).join('')}</div><nav><button data-game="journal" aria-label="Discovery journal">▤ <span>My discoveries</span><b id="journal-count">0/5</b></button><button data-game="science" aria-label="Real NASA pictures">◉ <span>NASA pictures</span></button><button data-game="pause" aria-label="Pause and settings">Ⅱ</button></nav></header>
    <div class="playfield"><canvas id="game-canvas" tabindex="0" aria-label="Game world. Use arrow keys or W A S D to move. Space does the current action. You can also tap a destination."></canvas>
      <section id="welcome" class="game-welcome"><span class="tiny-label">A LITTLE ROBOT. A VERY BIG ADVENTURE.</span><h1>Big wonders.<br><em>Little explorer.</em></h1><p>Fly to Titan. Splash into a strange sea.<br>Help Pip discover what’s out there.</p><button class="play-button" data-game="play">Let’s play <span>▶</span></button><button class="continue-game" data-game="continue" hidden>Continue my adventure →</button><span class="welcome-note">Move. Explore. Discover. <b>Ages 6+</b></span><button class="grownup-link" data-game="workshop">Advanced spacecraft workshop ↗</button></section>
      <div id="game-heading" class="game-heading" hidden><span class="tiny-label" id="chapter-label"></span><h1 id="chapter-title"></h1><p id="instruction" role="status" aria-live="polite"></p></div>
      <div id="world-label" class="world-label"><span>YOUR DESTINATION</span><b>Ligeia Mare</b><small>A methane sea on Saturn’s moon</small></div>
      <div class="pip-tag" id="pip-tag"><b>Hi! I’m Pip.</b><span>Your curious little co-pilot</span></div>
      <div id="parts-tray" class="parts-tray" hidden>${[['floats','Floaty feet'],['power','Power pack'],['radio','Space radio']].map(([id,label])=>`<button data-game="part" data-part="${id}"><canvas width="70" height="70" data-part-icon="${id}" aria-hidden="true"></canvas><span>${label}</span><b>+</b></button>`).join('')}</div>
      <div class="game-toast" id="game-toast" role="status" aria-live="polite"></div>
      <div id="flight-meter" class="flight-meter" hidden><span id="meter-label"></span><div><i id="meter-fill"></i></div></div>
      <div id="mini-map" class="mini-map" hidden><span>LAKE MAP</span><div id="map-track">${DISCOVERIES.map(d=>`<button data-game="navigate" data-id="${d.id}" style="left:${d.x/2800*100}%" aria-label="Guide Pip to ${d.label.toLowerCase()}">●</button>`).join('')}<i id="map-pip"></i></div><small id="map-caption">Tap a dot to guide Pip there</small></div>
      <div id="game-controls" class="game-controls" hidden><div class="direction-pad" aria-label="Movement controls"><button data-direction="up" aria-label="Move up">↑</button><button data-direction="left" aria-label="Move left">←</button><button data-direction="down" aria-label="Move down">↓</button><button data-direction="right" aria-label="Move right">→</button></div><div class="action-wrap"><div class="action-progress"><i id="action-fill"></i></div><button class="play-button" id="game-action" data-game="action">Launch! <span>↑</span></button><small id="control-tip">Arrow keys / WASD to move · Space to act</small></div></div>
      <div class="scene-credit">ORIGINAL 2D GAME ART · REAL TITAN FACTS</div>
    </div><footer class="game-footer"><span><i></i> Little explorer mode</span><span>Fictional adventure. Real-world wonder.</span><button data-game="help">How to play ?</button></footer>
    <dialog id="adventure-popup" class="adventure-dialog" aria-labelledby="adventure-dialog-title"></dialog>
  </main>`;
}

export function mountAdventure(root, callbacks={}) {
  const canvas=root.querySelector('#game-canvas'), c=canvas.getContext('2d');
  const $=s=>root.querySelector(s), abort=new AbortController(), {signal}=abort;
  const popup=$('#adventure-popup');
  let saved=restoreAdventure(read(KEY,null)), state=saved?structuredClone(saved):freshAdventure();
  let home=true, w=1200,h=700,scale=1,raf=0,last=0,time=0,elapsed=0,saveTime=0,disposed=false;
  let camera=0,playerX=.28,playerY=.56,ringX=1.1,ringY=.45,altitude=80000,chute=false;
  let progress=0,working=null,launching=false,launchTime=0,transmitting=false,target=null;
  let particles=[],assembly=[],direction=1,keys=new Set(),held=new Map(),textCache={},audio=null;
  let soundEnabled=read('titan.adventure.sound',false)===true;
  let reduced=callbacks.reducedMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const on=(node,event,fn)=>node.addEventListener(event,fn,{signal});
  function persist(){if(!write(KEY,state))toast('Saving is unavailable. Keep this tab open to keep playing.');saved=structuredClone(state);}
  function text(id,value){if(textCache[id]!==value){$(id).textContent=value;textCache[id]=value;}}
  function visible(id,show){$(id).hidden=!show;}
  function toast(message){text('#game-toast',message);$('#game-toast').classList.add('visible');elapsed=0;}
  function ping(note=660){if(!soundEnabled)return;try{audio ||= new AudioContext();audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.setValueAtTime(note,audio.currentTime);o.frequency.exponentialRampToValueAtTime(note*1.5,audio.currentTime+.15);g.gain.setValueAtTime(.055,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.3);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+.32);}catch{/* Audio never blocks play. */}}
  function burst(x,y,color='#f4d17b',amount=22){for(let i=0;i<amount;i++)particles.push({x,y,vx:Math.cos(i*2.4)*(30+i%7*17),vy:Math.sin(i*2.4)*(40+i%5*20)-50,life:1.3,color});}
  function resize(){const rect=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);w=rect.width;h=rect.height;scale=clamp(Math.min(w/1100,h/650),.65,1.2);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);c.setTransform(dpr,0,0,dpr,0,0);}
  const observer=new ResizeObserver(resize);observer.observe(canvas);resize();
  function resetRuntime(){progress=0;working=null;launching=false;launchTime=0;transmitting=false;playerX=.28;playerY=.53;ringX=1.05;ringY=[.43,.67,.48][state.rings]||.48;altitude=80000;chute=false;target=null;keys.clear();held.clear();}
  function changeStage(stage){state.stage=stage;resetRuntime();persist();sync();ping(760);}
  function start(resume){home=false;if(!resume){state=freshAdventure();}resetRuntime();persist();sync();canvas.focus({preventScroll:true});}
  function sync(){
    const stage=state.stage;
    root.classList.toggle('at-home',home);root.dataset.stage=home?'home':stage;
    visible('#welcome',home);visible('#game-heading',!home);visible('#pip-tag',home);visible('#world-label',home);
    $('[data-game="continue"]').hidden=!saved;
    visible('#parts-tray',!home&&stage==='assemble');visible('#game-controls',!home&&stage!=='assemble'&&stage!=='done');
    visible('#mini-map',!home&&stage==='lake');visible('#flight-meter',!home&&['launch','cruise','landing'].includes(stage));
    text('#chapter-title',labels[stage]);text('#chapter-label',`CHAPTER ${stageNumber[stage]+1} OF 5 · PIP’S TITAN ADVENTURE`);
    root.querySelectorAll('[data-chapter]').forEach(node=>{node.classList.toggle('active',!home&&Number(node.dataset.chapter)===stageNumber[stage]);node.classList.toggle('complete',!home&&Number(node.dataset.chapter)<stageNumber[stage]);});
    root.querySelectorAll('[data-part]').forEach(node=>{const done=state.parts.includes(node.dataset.part);node.disabled=done;node.classList.toggle('attached',done);node.querySelector('b').textContent=done?'✓':'+';});
    text('#journal-count',`${state.found.length}/5`);
    root.querySelectorAll('[data-game="navigate"]').forEach(node=>{node.classList.toggle('found',state.found.includes(node.dataset.id));});
    updateHUD();
  }
  function updateHUD(){
    if(home)return;
    let instruction='',action='',disabled=false,meter='',amount=0;
    if(state.stage==='assemble'){const missing=[['floats','floaty feet'],['power','power pack'],['radio','space radio']].find(([id])=>!state.parts.includes(id));instruction=missing?`Tap the ${missing[1]}. Let’s get Pip ready!`:'All ready! Time to launch.';}
    if(state.stage==='launch'){instruction=launching?'Up, up and away!':'Hold the big button (or Space) to lift off!';action=launching?'Lifting off…':'Hold to launch ↑';disabled=launching;meter=launching?'LIFT OFF!':`ROCKET POWER ${Math.round(progress*100)}%`;amount=progress;}
    if(state.stage==='cruise'){instruction='Steer up and down. Fly through 3 golden rings!';action='↑ Fly up';meter=`NAVIGATION RINGS ${state.rings} / 3`;amount=state.rings/3;}
    if(state.stage==='landing'){instruction=altitude>18000?'Steer toward the glowing landing spot.':!chute?'Open the parachute! Tap the big button.':'Keep Pip above the glowing landing spot.';action=chute?'Parachute open ✓':altitude>18000?'Wait for the green light…':'Open parachute!';disabled=chute||altitude>18000;meter=`${Math.max(0,Math.round(altitude/1000))} km · ${chute?'PARACHUTE OPEN':altitude>18000?'SLOWING DOWN':'SAFE TO OPEN'}`;amount=1-altitude/80000;}
    if(state.stage==='lake'){
      const near=nearbyDiscovery(state),next=DISCOVERIES.find(d=>!state.found.includes(d.id));
      instruction=state.sent?'All discoveries sent! Keep sailing or open your journal.':transmitting?'Sending your discoveries all the way to Earth…':working?DISCOVERIES.find(d=>d.id===working).tool:near?'You found a science spot! Tap the big button.':state.found.length===5?'Five discoveries! Send your science home.':`Follow the glowing marker. ${next?.label}!`;
      action=state.sent?'My discoveries ▤':transmitting?'Sending…':working?'Exploring…':state.found.length===5?'Send to Earth ↗':near?near.label:'Find a glowing marker';
      disabled=!!working||transmitting||(!near&&state.found.length<5);$('#map-pip').style.left=`${state.x/2800*100}%`;
      text('#map-caption',`${state.found.length} of 5 discoveries · Tap a dot for a helping hand`);
    }
    text('#instruction',instruction);text('#game-action',action);$('#game-action').disabled=disabled;
    $('#game-action').classList.toggle('ready',state.stage==='landing'&&altitude<=18000&&!chute);
    text('#meter-label',meter);$('#meter-fill').style.width=`${amount*100}%`;$('#action-fill').style.width=`${progress*100}%`;
    const pad=$('.direction-pad');pad.hidden=!['cruise','landing','lake'].includes(state.stage);
  }
  function showDialog(title,body){keys.clear();held.clear();target=null;popup.innerHTML=`<button class="dialog-x" data-game="close" aria-label="Close">×</button><h2 id="adventure-dialog-title">${title}</h2>${body}`;if(!popup.open)popup.showModal();}
  function closeDialog(){popup.close();if(state.stage==='done'){state.stage='lake';persist();sync();}canvas.focus({preventScroll:true});}
  function factCard(d){showDialog('New discovery!',`<div class="discovery-art" style="--discovery-color:${d.color}"><canvas id="fact-picture" width="420" height="180" aria-label="Illustration of ${d.title}"></canvas><span>✦ DISCOVERY ${state.found.length} / 5</span></div><h3>${d.title}</h3><p>${d.fact}</p><strong class="fact-value">${d.value}</strong><small class="fact-source">Real reference fact · <a href="${FACT_SOURCE}" target="_blank" rel="noopener">NASA Titan facts ↗</a><br>Pip’s sample collection is pretend play, not a measurement.</small><button class="play-button" data-game="close">${state.found.length===5?'Send my discoveries home':'Keep exploring'} →</button>`);const fc=$('#fact-picture').getContext('2d');fc.fillStyle=d.color;fc.globalAlpha=.12;fc.fillRect(0,0,420,180);fc.globalAlpha=1;for(let i=0;i<8;i++)star(fc,30+i*52,25+(i%3)*50,3,d.color);glyph(fc,d.symbol,210,83,96,d.color);ellipse(fc,210,148,69,8,'#233c3b15');}
  function journal(){showDialog('My discovery journal',`<p>Five little wonders. One extraordinary moon.</p><div class="sticker-grid">${DISCOVERIES.map(d=>`<button data-game="read-fact" data-id="${d.id}" ${state.found.includes(d.id)?'':'disabled'}><canvas width="90" height="80" data-sticker="${d.id}" aria-hidden="true"></canvas><b>${state.found.includes(d.id)?d.title:'Still a mystery'}</b></button>`).join('')}</div><button class="play-button" data-game="close">Back to Pip →</button>`);root.querySelectorAll('[data-sticker]').forEach(el=>{const d=DISCOVERIES.find(d=>d.id===el.dataset.sticker);glyph(el.getContext('2d'),d.symbol,45,38,38,state.found.includes(d.id)?d.color:'#999c8d');});}
  function pause(){showDialog(home?'Welcome, explorer!':'Take a little breather',`<p>${home?'A whole moon is waiting for you.':'Pip will wait right here. Your adventure is saved on this device.'}</p><div class="pause-options"><button data-game="sound">${soundEnabled?'♫ Sound on':'♪ Sound off'} — tap to change</button><button data-game="motion">${reduced?'Gentle animation on':'Gentle animation off'} — tap to change</button><button data-game="help">How to play</button></div><button class="play-button" data-game="close">${home?'Let’s go':'Keep playing'} ▶</button>`);}
  function action(){if(home||popup.open)return;if(state.stage==='cruise'){playerY=clamp(playerY-.12,.28,.82);ping(400);}if(state.stage==='landing'&&altitude<=18000&&!chute){chute=true;burst(playerX*w,playerY*h);ping(520);updateHUD();}if(state.stage==='lake'&&!working&&!transmitting){if(state.sent){journal();}else if(state.found.length===5){transmitting=true;progress=0;ping(800);}else{const near=nearbyDiscovery(state);if(near){working=near.id;target=null;progress=0;ping(460);}}}}
  function ending(){showDialog('You’re a Titan explorer!',`<div class="ending-medal">✦</div><h3>Five wonders. All sent home.</h3><p>You built Pip, flew through space, made a soft landing and explored a methane sea!</p><div class="earned-badges"><span>✦ Space pilot</span><span>✦ Lake explorer</span><span>✦ Science buddy</span></div><button class="play-button" data-game="freeplay">Keep sailing →</button><button class="continue-game" data-game="journal">See my discoveries</button><button class="continue-game" data-game="restart">Start a new adventure</button>`);}
  on(root,'click',event=>{
    const el=event.target.closest('[data-game]');if(!el||el.disabled)return;const a=el.dataset.game;
    if(a==='play'){if(saved){showDialog('A fresh adventure?',`<p>This starts Pip’s journey again. Your current adventure will be replaced.</p><button class="play-button" data-game="restart">Start again</button><button class="continue-game" data-game="resume">Keep my adventure</button>`);}else start(false);}
    if(a==='restart'){closeDialog();start(false);}
    if(a==='continue'||a==='resume'){if(popup.open)closeDialog();start(true);if(state.stage==='done')ending();}
    if(a==='home'){if(!home)persist();home=true;resetRuntime();sync();}
    if(a==='science'){callbacks.science?.();}
    if(a==='workshop'){callbacks.workshop?.();}
    if(a==='close')closeDialog();
    if(a==='journal')journal();
    if(a==='pause')pause();
    if(a==='sound'){soundEnabled=!soundEnabled;write('titan.adventure.sound',soundEnabled);ping();pause();}
    if(a==='motion'){reduced=!reduced;write('titan.adventure.motion',reduced);pause();}
    if(a==='help')showDialog('Let’s play!',`<ol class="simple-help"><li><b>Build:</b> Tap 3 parts to dress Pip.</li><li><b>Launch:</b> Hold the launch button or Space.</li><li><b>Fly:</b> Move up and down through 3 rings.</li><li><b>Land:</b> Open the parachute when the button turns green.</li><li><b>Explore:</b> Sail to glowing markers. Tap to discover!</li></ol><p>Use arrows, WASD, or the touch arrows. Tap the lake to sail there. Tap a map dot for help. There’s no timer or lost lives.</p><button class="play-button" data-game="close">Got it! →</button>`);
    if(a==='part'&&state.stage==='assemble'&&!home){const id=el.dataset.part;if(!state.parts.includes(id)){state.parts.push(id);assembly.push({id,life:1});ping(440+state.parts.length*150);burst(w*.5,h*.52);persist();sync();if(state.parts.length===3)toast('Pip is ready! Let’s fly!');}}
    if(a==='action')action();
    if(a==='navigate'&&state.stage==='lake'&&!working&&!transmitting){const d=DISCOVERIES.find(d=>d.id===el.dataset.id);target={x:d.x,y:d.y};toast(`Pip is sailing to: ${d.label.toLowerCase()}`);}
    if(a==='read-fact'){const d=DISCOVERIES.find(d=>d.id===el.dataset.id);if(state.found.includes(d.id))factCard(d);}
    if(a==='freeplay'){closeDialog();state.stage='lake';transmitting=false;progress=0;persist();sync();}
  });
  on(popup,'cancel',event=>{event.preventDefault();keys.clear();held.clear();closeDialog();});
  function pointerDown(e){if(home||popup.open)return;const dir=e.target.closest('[data-direction]')?.dataset.direction;
    if(dir){e.preventDefault();held.set(e.pointerId,dir);e.target.setPointerCapture(e.pointerId);target=null;}
    if(e.target.closest('#game-action')&&state.stage==='launch'){e.preventDefault();held.set(e.pointerId,'launch');e.target.setPointerCapture(e.pointerId);}
  }
  on(root,'pointerdown',pointerDown);on(root,'pointerup',e=>held.delete(e.pointerId));on(root,'pointercancel',e=>held.delete(e.pointerId));on(root,'lostpointercapture',e=>held.delete(e.pointerId));
  on(canvas,'pointerdown',e=>{if(home||popup.open)return;const r=canvas.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;if(state.stage==='lake'&&!working){target={x:clamp(camera+x/scale,80,2700),y:clamp(y/h,.6,.9)};}if(state.stage==='cruise'||state.stage==='landing'){playerY=clamp(y/h,.28,.82);playerX=clamp(x/w,.12,.88);}canvas.focus({preventScroll:true});});
  on(window,'keydown',e=>{if(home||document.querySelector('dialog[open]'))return;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d','W','A','S','D',' '].includes(e.key)){
    // Preserve native Space/Enter activation on menu and dialog buttons.
    if(e.key===' '&&e.target instanceof HTMLButtonElement&&e.target.id!=='game-action')return;
    e.preventDefault();keys.add(e.key.toLowerCase());target=null;if(e.key===' '&&!e.repeat)action();
  }if(e.key==='Escape'){e.preventDefault();pause();}});
  on(window,'keyup',e=>keys.delete(e.key.toLowerCase()));on(window,'blur',()=>{keys.clear();held.clear();});on(document,'visibilitychange',()=>{keys.clear();held.clear();last=0;if(!home)persist();});
  function input(){const dirs=new Set(held.values());return {dx:Number(keys.has('arrowright')||keys.has('d')||dirs.has('right'))-Number(keys.has('arrowleft')||keys.has('a')||dirs.has('left')),dy:Number(keys.has('arrowdown')||keys.has('s')||dirs.has('down'))-Number(keys.has('arrowup')||keys.has('w')||dirs.has('up')),launch:keys.has(' ')||dirs.has('launch')};}
  function update(dt){
    const {dx,dy,launch}=input();saveTime+=dt;elapsed+=dt;if(elapsed>4)$('#game-toast').classList.remove('visible');
    if(home)return;
    if(state.stage==='assemble'&&state.parts.length===3){launchTime+=dt;if(launchTime>1.2)changeStage('launch');}
    if(state.stage==='launch'){
      if(!launching){progress=clamp(progress+(launch?dt*.45:-dt*.22),0,1);if(progress>=1){launching=true;launchTime=0;ping(200);burst(w*.5,h*.78,'#e6c998',35);}}
      else{launchTime+=dt;if(launchTime>4.3)changeStage('cruise');}
    }
    if(state.stage==='cruise'){
      playerY=clamp(playerY+dy*dt*.45,.27,.82);playerX=clamp(playerX+dx*dt*.3,.12,.5);ringX-=dt*.12;
      if(Math.abs(ringX-playerX)*w<38*scale&&Math.abs(ringY-playerY)*h<65*scale){state.rings++;burst(playerX*w,playerY*h);ping(600+state.rings*100);persist();if(state.rings>=3){toast('Nice flying! Next stop: Titan.');changeStage('landing');}else{ringX=1.1;ringY=[.43,.67,.48][state.rings];}}
      if(ringX<-.1){ringX=1.1;toast('Try that ring again. You’ve got this!');}
    }
    if(state.stage==='landing'){
      playerX=clamp(playerX+dx*dt*.34,.12,.88);
      if(altitude>18000)altitude=Math.max(18000,altitude-dt*8000);
      else if(chute)altitude=Math.max(0,altitude-dt*2600);
      playerY=.32+(1-altitude/80000)*.37;
      if(altitude<=0){if(Math.abs(playerX-.62)<.13){state.x=180;state.y=.77;burst(playerX*w,h*.7,'#b5d7be',40);changeStage('lake');toast('Splash! Welcome to Titan. Let’s explore!');}else{altitude=100;toast('A little left or right. Aim for the glowing spot!');}}
    }
    if(state.stage==='lake'){
      if(!working&&!transmitting){if(dx||dy){moveExplorer(state,dx,dy,dt);direction=dx<0?-1:dx>0?1:direction;}else if(target){const diff=target.x-state.x,yd=(target.y-state.y)*850;if(Math.abs(diff)<7&&Math.abs(yd)<7)target=null;else{const distance=Math.hypot(diff,yd);moveExplorer(state,diff/distance,yd/distance,dt);direction=diff<0?-1:1;}}}
      if(working){progress+=dt*.37;if(progress>=1){const id=working;working=null;progress=0;if(collectDiscovery(state,id)){persist();sync();burst((state.x-camera)*scale,state.y*h);ping(900);factCard(DISCOVERIES.find(d=>d.id===id));}}}
      if(transmitting){progress+=dt*.25;if(progress>=1){if(finishAdventure(state)){persist();sync();burst(w*.5,h*.4,'#eed087',60);ending();}transmitting=false;progress=0;}}
    }
    if(saveTime>1.5){saveTime=0;persist();}
    updateHUD();
  }
  function draw(dt){
    const t=reduced?0:time;const stage=home?'home':state.stage;
    if(['home','lake','landing','done'].includes(stage)){
      if(stage==='lake'||stage==='done'){const desired=clamp(state.x-w/scale*.4,0,Math.max(0,2800-w/scale));camera+=(desired-camera)*Math.min(1,dt*5);}else camera=0;
      landscape(c,w,h,t,camera*scale,{rain:stage==='lake'&&state.x>1350&&state.x<1770,still:reduced});
      if(stage==='home'){
        const px=w<600?w*.65:w*.73,py=w<600?h*.78:h*.74;
        for(let i=0;i<4;i++){const x=px+Math.sin(i*1.8+t*.3)*150*scale,y=py+Math.cos(i*1.7+t*.3)*50*scale;ellipse(c,x,y,15,5,null,'#e2d6a332');}
        explorer(c,px,py+Math.sin(t*1.8)*5,scale*1.6,t);glyph(c,'drop',px-150*scale,py-35*scale,28,'#b6d4b3');star(c,px+143*scale,py-93*scale,12);
      }
      if(stage==='landing'){
        const zone=w*.62;c.fillStyle='#c0e6ac25';c.fillRect(zone-w*.13,h*.49,w*.26,h*.3);ellipse(c,zone,h*.76,w*.13,14,'#9ed7b233','#d2e8ab');c.fillStyle='#eff1ce';c.textAlign='center';c.font='bold 12px sans-serif';c.fillText('LAND HERE ↓',zone,h*.82);
        if(!chute){c.save();c.globalAlpha=.3;ellipse(c,playerX*w,playerY*h+15,65*scale,45*scale,'#f7aa4c');c.restore();}
        explorer(c,playerX*w,playerY*h,scale*.8,t,{chute});
      }
      if(stage==='lake'||stage==='done'){
        for(const d of DISCOVERIES){const x=(d.x-camera)*scale,y=d.y*h;if(x< -120||x>w+120)continue;const done=state.found.includes(d.id);ellipse(c,x,y+10,49*scale,11*scale,null,done?'#c7dfb13b':'#ebd28c88');
          const by=y-65*scale+Math.sin(t*2+d.x)*5;path(c,[[x,y],[x,by+20]],null,done?'#9fbc9566':'#eee0a6aa');ellipse(c,x,by,25*scale,25*scale,done?'#305b4f':'#f1d69b','#f7edc3');if(done){c.fillStyle='#cce6c5';c.font=`bold ${22*scale}px sans-serif`;c.textAlign='center';c.fillText('✓',x,by+7*scale);}else glyph(c,d.symbol,x,by,20*scale,'#3b514b');
          if(!done){c.textAlign='center';c.font=`600 ${Math.max(11,12*scale)}px sans-serif`;const tw=c.measureText(d.label).width;box(c,x-tw/2-12,by-58*scale,tw+24,25,8,'#253f38de');c.fillStyle='#ffedbb';c.fillText(d.label,x,by-40*scale);}
        }
        const px=(state.x-camera)*scale,py=state.y*h;const moving=!!(input().dx||input().dy||target);
        if(target){ellipse(c,(target.x-camera)*scale,target.y*h,18+Math.sin(t*5)*4,7,null,'#fff1bc');}
        if(moving&&!reduced){for(let i=0;i<5;i++)ellipse(c,px-direction*(70+i*12)*scale,py+24*scale,(10+i*4)*scale,2+i,'#c4d7a90c','#d2ddac33');}
        explorer(c,px,py+Math.sin(t*2)*3,scale,t,{moving,sampling:working?progress*3:0});
        if(working==='air'){path(c,[[px,py-70*scale],[px+30*scale,py-110*scale-progress*80]],null,'#e9e5bd');ellipse(c,px+30*scale,py-130*scale-progress*80,23*scale,28*scale,'#e4a574','#f0d294');}
        if(working==='cold'){glyph(c,'thermometer',px+100*scale,py-45*scale,30,'#b3dbdd');}
        if(working==='shore'&&progress>.8){c.fillStyle=`rgba(255,240,196,${Math.max(0,Math.sin(progress*60))*.3})`;c.fillRect(0,0,w,h);}
        if(transmitting){c.strokeStyle='#e4e4b6';c.lineWidth=2;for(let i=0;i<4;i++){let r=((t*90+i*40)%160)+20;c.globalAlpha=1-r/200;c.beginPath();c.arc(px+25*scale,py-70*scale,r,-2,-.6);c.stroke();}c.globalAlpha=1;}
        const next=DISCOVERIES.find(d=>!state.found.includes(d.id));if(next&&Math.abs((next.x-camera)*scale-px)>w*.35){const right=next.x>state.x;box(c,right?w-75:15,h*.53,60,36,18,'#f4dc9b');c.fillStyle='#304c43';c.font='bold 24px sans-serif';c.textAlign='center';c.fillText(right?'→':'←',right?w-45:45,h*.53+26);}
      }
    }else if(stage==='assemble'){
      const g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,'#223e44');g.addColorStop(1,'#51756b');c.fillStyle=g;c.fillRect(0,0,w,h);
      for(let i=0;i<30;i++)path(c,[[i*60,0],[i*60,h]],null,'#c1d8b60b');for(let i=0;i<20;i++)path(c,[[0,i*60],[w,i*60]],null,'#c1d8b60b');
      box(c,w*.5-180*scale,h*.42-110*scale,360*scale,270*scale,140,'#c5dfc30c','#e5dca42e');ellipse(c,w*.5,h*.65,160*scale,32*scale,'#213b3b');ellipse(c,w*.5,h*.64,160*scale,24*scale,'#6d8b76','#b1b58c');
      explorer(c,w*.5,h*.57+Math.sin(t)*4,scale*1.5,t,{parts:state.parts});
      for(let i=0;i<3;i++){const a=t*.3+i*2.1;star(c,w*.5+Math.cos(a)*200*scale,h*.47+Math.sin(a)*90*scale,5,'#e7dcaa66');}
      for(const a of assembly){glyph(c,a.id,w*.5+(1-a.life)*130*scale,h*.42-(1-a.life)*120*scale,45*a.life,'#f3d294');a.life-=dt*1.2;}assembly=assembly.filter(a=>a.life>0);
    }else if(stage==='launch'){
      const offset=launching?Math.min(1,launchTime/3):0;
      const g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,offset>.6?'#192d40':'#628e98');g.addColorStop(1,'#e1c69b');c.fillStyle=g;c.fillRect(0,0,w,h);
      for(let i=0;i<7;i++){const x=i*w/5-40,y=h*.32+i%3*60+offset*h*.9;ellipse(c,x,y,90,16,'#f4e9cb44');}
      const ground=h*.82+offset*h;path(c,[[0,ground],[w*.2,ground-30],[w*.48,ground-10],[w*.7,ground-35],[w,ground],[w,h+offset*h],[0,h+offset*h]],'#5c7961');box(c,w*.5-95,ground,190,20,3,'#3b5351');
      if(!launching){path(c,[[w*.5+70,ground],[w*.5+70,ground-200],[w*.5+25,ground-200]],null,'#56675b');}
      const ry=h*.57-offset*h*.75;
      rocket(c,w*.5+(reduced?0:Math.sin(time*40)*progress),ry,scale*1.25,t,launching?1:progress*.5);
      if(launching){for(let i=0;i<12;i++)ellipse(c,w*.5+Math.sin(i*7)*launchTime*60,ground+i%3*5,10+launchTime*14,10+launchTime*10,'#eee4c74d');}
    }else if(stage==='cruise'){
      space(c,w,h,t,reduced?0:time*20);const rx=ringX*w,ry=ringY*h;
      c.save();c.lineWidth=7;ellipse(c,rx,ry,31*scale,70*scale,null,'#d6ae65');c.lineWidth=2;ellipse(c,rx,ry,23*scale,63*scale,null,'#ffe7b0');star(c,rx,ry,10*scale);c.restore();
      c.save();c.translate(playerX*w,playerY*h);c.rotate(Math.PI/2);rocket(c,0,0,scale*.65,t,1);c.restore();
      c.fillStyle='#eee1ba';c.font='12px sans-serif';c.textAlign='right';c.fillText('SATURN · view from space',w-25,h*.5);
    }
    if(!reduced){for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=100*dt;p.life-=dt;c.globalAlpha=Math.max(0,p.life);star(c,p.x,p.y,4,p.color);}c.globalAlpha=1;particles=particles.filter(p=>p.life>0);}else particles=[];
  }
  function frame(now){if(disposed)return;const dt=last?clamp((now-last)/1000,0,.05):0;last=now;const paused=document.hidden||!!document.querySelector('dialog[open]');if(!paused){time+=dt;update(dt);}draw(paused?0:dt);raf=requestAnimationFrame(frame);}
  root.querySelectorAll('[data-part-icon]').forEach(el=>glyph(el.getContext('2d'),el.dataset.partIcon,35,35,34,'#e7d4a0'));
  reduced=read('titan.adventure.motion',reduced)===true;sync();raf=requestAnimationFrame(frame);
  return ()=>{disposed=true;cancelAnimationFrame(raf);observer.disconnect();abort.abort();audio?.close();if(!home)persist();if(popup.open)popup.close();};
}
