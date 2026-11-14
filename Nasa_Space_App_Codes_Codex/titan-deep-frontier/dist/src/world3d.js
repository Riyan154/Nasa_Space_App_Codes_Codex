import {worlds,sites,equipment} from './mission3d.js';

// Procedural meshes projected through a perspective camera. All scene positions use X/Y/Z.
const tau=Math.PI*2, ivory='#f4e5c5', gold='#e9a952', teal='#39a5a6', dark='#253b4c';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const palettes=new Map();
function shade(hex,brightness){
  const key=hex+Math.round(brightness*16);
  if(!palettes.has(key)){
    const n=parseInt(hex.slice(1),16);
    palettes.set(key,'rgb('+[n>>16,(n>>8)&255,n&255].map(v=>clamp(Math.round(v*brightness),0,255)).join(',')+')');
  }
  return palettes.get(key);
}
export function makeWorld(canvas){
  const ctx=canvas.getContext('2d',{alpha:false});
  let width,height,focal,camera,axes,faces,center,angle,origin;
  function vertex(x,y,z){
    const c=Math.cos(angle), s=Math.sin(angle);
    const dx=origin[0]+x*c+z*s-camera[0],dy=origin[1]+y-camera[1],dz=origin[2]+z*c-x*s-camera[2];
    const [rx,rz,up,flat]=axes;
    const ahead=dx*(-rz)+dz*rx,depth=ahead*flat+dy*up;
    if(depth<.15)return null;
    return [center+focal*(dx*rx+dz*rz)/depth,height*.52-focal*(dy*flat-ahead*up)/depth,depth];
  }
  function face(points,color){if(points.every(Boolean))faces.push([points.reduce((a,p)=>a+p[2],0)/points.length,points,color]);}
  function tube(x,y,z,r1,r2,h,color,n=12,stretch=1){
    const top=[],base=[];
    for(let i=0;i<n;i++){const a=tau*i/n;top.push(vertex(x+r2*Math.cos(a),y+h,z+r2*Math.sin(a)*stretch));base.push(vertex(x+r1*Math.cos(a),y,z+r1*Math.sin(a)*stretch));}
    for(let i=0;i<n;i++){const j=(i+1)%n;face([base[i],top[i],top[j],base[j]],shade(color,.8+.20*Math.cos(tau*(i+.5)/n+angle+2)));}
    face(top,shade(color,1.08));face(base,shade(color,.58));
  }
  function box(x,y,z,w,h,d,color){
    const corners=[[-1,-1],[1,-1],[1,1],[-1,1]];
    const ring=dy=>corners.map(([a,b])=>vertex(x+a*w/2,y+dy,z+b*d/2));
    const lo=ring(0),hi=ring(h);
    for(let i=0;i<4;i++){const j=(i+1)%4;face([lo[i],hi[i],hi[j],lo[j]],shade(color,.74+.21*Math.cos(i*Math.PI/2+angle)));}
    face(hi,shade(color,1.12));
  }
  function rocket(m,fire,t){
    const size=equipment.Rocket.findIndex(p=>p.id===m.design.Rocket);
    const h=3.9+size*.45;
    tube(0,.2,0,.64,.72,h,ivory,18);
    for(let i=0;i<3;i++)tube(0,.65+i*h/3,0,.73,.73,.12,i===1?gold:teal,18);
    tube(0,h+.2,0,.72,.08,1.3,ivory,18);
    tube(0,h+.96,0,.36,.03,.59,gold,18);
    box(0,h-.85,-.67,.41,.53,.09,dark);
    const count=2+size;
    for(let i=0;i<count;i++){const a=tau*i/count,x=.86*Math.cos(a),z=.86*Math.sin(a);
      tube(x,.25,z,.32,.33,h*.58,'#d08752');tube(x,.25+h*.58,z,.33,.03,.63,ivory);
      tube(x,0,z,.31,.19,.32,dark);
      if(fire)tube(x,-.8,z,.02,.24,.83,gold);
    }
    tube(0,-.14,0,.44,.29,.5,dark);
    if(fire){const length=1.1+.45*Math.sin(t*27);tube(0,-length,0,.01,.37,length,'#ff9f42');tube(0,-length*.62,0,.05,.25,length*.63,'#ffeaa1');}
  }
  function pip(m,t){
    box(0,.48,0,1.65,1.08,1.22,ivory);box(0,.93,-.65,1.3,.47,.12,dark);
    for(const side of [-1,1]){
      box(.34*side,1.06,-.73,.18,.14,.03,'#84f0e4');
      if(m.world==='Titan')tube(side*.85,.13,0,.36,.3,.34,gold,12,2.8);
      else for(const end of [-1,1])tube(side*.8,.1,end*.44,.29,.29,.42,dark,10);
    }
    if(m.design.Power==='solar')for(const side of [-1,1]){
      box(side*1.54,1.06,0,1.5,.12,1.12,gold);
      for(let i=0;i<4;i++)for(let j=0;j<2;j++)box(side*(1+i*.35),1.19,j*.52-.26,.31,.03,.47,'#365888');
    }else{
      const reactor=m.design.Power==='reactor', count=m.design.Power==='mmrtg'?7:5;
      tube(-.8,.65,.14,.31,.3,.86,gold);
      for(let i=0;i<count;i++)tube(-.8,.7+i*.12,.14,.42,.42,.055,reactor?teal:dark);
    }
    tube(.42,1.54,.18,.055,.055,.72,ivory);
    const radio=m.design.Radio;
    if(radio==='antenna')tube(.42,2.24,.18,.055,.02,.38,teal);
    if(radio==='dish')tube(.42,2.05,.18,.09,.49,.25,gold);
    if(radio==='laser')box(.42,2.04,.13,.48,.28,.59,'#bb9ddb');
    if(radio==='array')for(let i=-1;i<=1;i++)box(.42+i*.35,2.05,0,.3,.43,.08,teal);
    m.design.Science.forEach((id,i)=>{const x=-.54+i*.35;
      if(id==='camera'){box(x,1.55,-.31,.34,.29,.32,gold);box(x,1.62,-.52,.18,.16,.12,dark);}
      if(id==='radar')tube(x,1.6,-.3,.18,.39,.14,teal,12);
      if(id==='spectrometer')box(x,1.53,-.4,.14,.55,.21,'#d58b62');
      if(id==='atmosphere')for(let j=0;j<4;j++)tube(x,1.56+j*.1,-.3,.18,.18,.05,ivory);
    });
  }
  function hoop(x,y,z,r,color,spin=0){
    for(let i=0;i<24;i++){const a=tau*i/24+spin,b=a+tau/24;
      face([[a,r],[b,r],[b,r*.89],[a,r*.89]].map(([v,k])=>vertex(x+Math.cos(v)*k,y+Math.sin(v)*k,z)),shade(color,.9+.18*Math.sin(a)));}
  }
  return function draw(m,view){
    const ratio=Math.min(devicePixelRatio||1,1.7);
    width=Math.round(canvas.clientWidth*ratio);height=Math.round(canvas.clientHeight*ratio);
    if(!width||!height)return;
    if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}
    const t=view.time,stage=m.stage,space=stage==='flight',explore=stage==='explore',hero=stage==='title';
    focal=Math.min(height*1.13,width*.99);center=width*(hero&&width/height>1.15?.71:.5);
    const planet=worlds[m.world],sky=ctx.createLinearGradient(0,0,0,height);
    sky.addColorStop(0,'#091527');sky.addColorStop(.49,space?'#26394f':planet.sky);sky.addColorStop(1,space?'#101c2c':planet.ground);
    ctx.fillStyle=sky;ctx.fillRect(0,0,width,height);
    for(let i=0;i<95;i++){const x=((i*.61803)%1)*width,y=((i*.1375)%1)*height*(space?1:.45);ctx.fillStyle=i%7?'#dbc9aa':'#71bbbd';ctx.fillRect(x,y,ratio*(i%4===0?2:1),ratio);}
    const px=width*.83,py=height*.16,pr=Math.min(width,height)*.072;
    ctx.fillStyle=m.world==='Mars'?'#edd1a7':m.world==='Moon'?'#64aab8':'#dfa86e';ctx.beginPath();ctx.arc(px,py,pr,0,tau);ctx.fill();
    if(m.world==='Titan'){ctx.strokeStyle='#e4c095';ctx.lineWidth=pr*.17;ctx.beginPath();ctx.ellipse(px,py,pr*1.82,pr*.33,-.25,0,tau);ctx.stroke();}
    if(!space){ctx.fillStyle=planet.ground;ctx.beginPath();ctx.moveTo(0,height);
      for(let i=0;i<=80;i++){const ridge=Math.abs(Math.sin(i*.19)*Math.cos(i*.33));ctx.lineTo(width*i/80,height*(.56-.09*ridge));}
      ctx.lineTo(width,height);ctx.fill();}
    let target=[0,2,0], model=[0,0,0];angle=0;
    const orbit=view.orbit;
    camera=[Math.sin(orbit)*8,4.3,-Math.cos(orbit)*8];
    if(explore){model=[m.x,0,m.z];camera=[m.x,5,m.z-8];target=[m.x,.65,m.z+3];}
    if(space){model=[m.x,view.y,0];camera=[m.x*.5,view.y+2,-8];target=[m.x*.5,view.y+1,10];}
    if(stage==='launch'){model[1]=view.progress*12;camera[1]+=model[1];target[1]+=model[1];}
    if(stage==='land'){model[1]=view.altitude;target[1]+=model[1]*.7;camera[1]+=model[1]*.75;}
    const dx=target[0]-camera[0],dy=target[1]-camera[1],dz=target[2]-camera[2],flat=Math.hypot(dx,dz),dist=Math.hypot(flat,dy);
    axes=[dz/flat,-dx/flat,dy/dist,flat/dist];faces=[];origin=[0,0,0];
    if(!space){for(let i=0;i<50;i++){const x=Math.sin(i*32.47)*32,z=(i*7.39)%80-15;if(Math.abs(x)<3&&Math.abs(z)<4)continue;
      tube(x,0,z,.45+(i%4)*.27,.08,.25+(i%5)*.23,m.world==='Mars'?'#ad684f':'#698180',6);}
      if(!explore)tube(0,-.19,0,3.1,3.1,.19,'#526568',32);}
    if(space){const x=[-2,2,0][m.rings]??0;hoop(x,2,18-view.progress*18,2.2,gold,t*.12);}
    if(explore)sites.forEach(([x,z],i)=>{if(!m.found.includes(i)){tube(x,0,z,.52,.26,.55,gold,6);hoop(x,1.7+.12*Math.sin(t+i),z,.78,gold,t*.1);}});
    origin=model;angle=space?0:explore?view.heading:0;
    if(hero||stage==='launch'||(stage==='build'&&view.category==='Rocket'))rocket(m,stage==='launch'&&view.progress>0,t);
    else pip(m,t);
    if(stage==='land'&&view.chute){tube(0,3.2,0,1.5,.18,.81,'#e5a967');for(const s of [-1,1])box(s*.63,1.6,0,.035,1.65,.035,ivory);}
    faces.sort((a,b)=>b[0]-a[0]);
    for(const [,points,color] of faces){ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(...points[0].slice(0,2));for(const p of points.slice(1))ctx.lineTo(p[0],p[1]);ctx.closePath();ctx.fill();}
  };
}
