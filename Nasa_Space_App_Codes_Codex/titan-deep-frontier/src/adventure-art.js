// Original procedural 2D artwork. No raster generation, stock sprite packs, or remote assets.
const TAU=Math.PI*2;
export function ellipse(c,x,y,rx,ry,fill,stroke) { c.beginPath();c.ellipse(x,y,Math.max(.01,rx),Math.max(.01,ry),0,0,TAU);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.stroke();} }
export function path(c,points,fill,stroke) {c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));if(fill){c.closePath();c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.stroke();}}
export function box(c,x,y,w,h,r,fill,stroke){c.beginPath();c.roundRect(x,y,w,h,r);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.stroke();}}
export function star(c,x,y,size,fill='#ffe6a5'){c.save();c.translate(x,y);path(c,Array.from({length:10},(_,i)=>{let a=i*Math.PI/5-Math.PI/2,r=i%2?size*.44:size;return[Math.cos(a)*r,Math.sin(a)*r];}),fill);c.restore();}
export function glyph(c,kind,x,y,size,color='#f8e8b9') {
  c.save();c.translate(x,y);c.scale(size/40,size/40);c.lineWidth=3;c.lineCap='round';c.lineJoin='round';c.strokeStyle=color;
  if(kind==='drop'){c.beginPath();c.moveTo(0,-20);c.bezierCurveTo(28,10,17,23,0,23);c.bezierCurveTo(-17,23,-28,10,0,-20);c.fillStyle=color;c.fill();path(c,[[-7,7],[-6,12],[-2,15]],null,'#fff9d8');}
  if(kind==='thermometer'){box(c,-5,-23,10,34,5,null,color);ellipse(c,0,15,10,10,color);path(c,[[0,-12],[0,15]],null,color);for(let i=0;i<3;i++)path(c,[[10,-15+i*9],[17,-15+i*9]],null,color);}
  if(kind==='cloud'){ellipse(c,-10,0,14,11,color);ellipse(c,3,-8,16,15,color);ellipse(c,18,1,11,10,color);for(let i=0;i<3;i++)path(c,[[-12+i*14,18],[-16+i*14,26]],null,color);}
  if(kind==='wind'){for(let i=0;i<3;i++){c.beginPath();c.moveTo(-22,-12+i*12);c.lineTo(12+i%2*8,-12+i*12);c.quadraticCurveTo(30,-12+i*12,22,-20+i*12);c.stroke();}}
  if(kind==='camera'){box(c,-24,-14,48,33,6,color);box(c,-13,-22,17,10,3,color);ellipse(c,0,2,12,12,'#263f43');ellipse(c,0,2,7,7,'#9dd5cf');}
  if(kind==='radio'){path(c,[[0,25],[0,-2],[-15,-18]],null,color);c.beginPath();c.arc(-14,-16,20,-.5,.9);c.stroke();c.beginPath();c.arc(-14,-16,32,-.5,.9);c.stroke();ellipse(c,0,0,5,5,color);}
  if(kind==='power'){box(c,-18,-17,36,38,7,color);box(c,-7,-23,14,7,2,color);path(c,[[3,-11],[-8,4],[1,4],[-2,16],[10,0],[2,0]],'#263f43');}
  if(kind==='floats'){box(c,-27,-12,54,13,6,color);box(c,-27,10,54,13,6,color);path(c,[[-12,-4],[-12,12],[12,12],[12,-4]],null,color);}
  c.restore();
}
export function explorer(c,x,y,scale,t,{parts=['floats','power','radio'],moving=0,sampling=0,chute=false,face=true}={}) {
  c.save();c.translate(x,y);c.scale(scale,scale);c.rotate(Math.sin(t*2)*.018);
  if(chute){c.strokeStyle='#f0ddba';c.lineWidth=2;for(const a of[-95,-45,0,45,95])path(c,[[a,-135],[0,-30]],null,'#f1dfb5');c.beginPath();c.moveTo(-102,-135);c.bezierCurveTo(-90,-235,90,-235,102,-135);c.quadraticCurveTo(75,-151,50,-135);c.quadraticCurveTo(25,-151,0,-135);c.quadraticCurveTo(-25,-151,-50,-135);c.quadraticCurveTo(-75,-151,-102,-135);c.fillStyle='#eeb66f';c.fill();path(c,[[-50,-135],[-42,-194],[0,-210],[42,-194],[50,-135]],null,'#f8e6bd');}
  c.lineWidth=3;ellipse(c,0,23,83,10,'#162d2c35');
  if(parts.includes('floats')){box(c,-76,8,152,26,13,'#263f43','#142a30');box(c,-70,7,140,13,8,'#dbb96e');box(c,-65,20,130,11,5,'#e8ddba');box(c,-41,5,9,29,3,'#ce6950');box(c,34,5,9,29,3,'#ce6950');}
  path(c,[[-42,13],[-37,-15],[37,-15],[45,13]],'#465451','#25393e');
  box(c,-42,-54,84,62,14,'#e9dfbc','#283d3c');box(c,-35,-48,70,45,11,'#f7ebc9');box(c,-28,-39,56,25,9,'#24444b');
  if(face){const blink=Math.sin(t*.77)>.995;box(c,-18,-32,9,blink?2:10,4,'#a5e7d4');box(c,9,-32,9,blink?2:10,4,'#a5e7d4');}
  box(c,-10,-7,20,5,2,'#ca7051');for(let i=0;i<3;i++)ellipse(c,26+i*5,-5,1.2,1.2,'#8e967e');
  if(parts.includes('power')){box(c,-58,-36,15,35,4,'#374b48');for(let i=0;i<5;i++)box(c,-63,-33+i*6,23,3,1,'#b8b39a');}
  if(parts.includes('radio')){path(c,[[22,-53],[30,-78]],null,'#ded7b6');c.save();c.translate(30,-78);c.rotate(-.35+Math.sin(t)*.08);c.beginPath();c.arc(0,-10,22,0,Math.PI);c.fillStyle='#f0d596';c.fill();path(c,[[0,4],[0,-16]],null,'#45534a');ellipse(c,0,-17,4,4,'#d37852');c.restore();}
  path(c,[[-22,-54],[-25,-79+Math.sin(t*3)*3]],null,'#45534a');ellipse(c,-25,-79+Math.sin(t*3)*3,4,4,'#ef9966');
  const arm=sampling?Math.sin(Math.min(sampling,1)*Math.PI/2):0;
  path(c,[[40,-21],[61,-12+arm*25],[75,3+arm*28]],null,'#344c49');ellipse(c,61,-12+arm*25,6,6,'#ddb775','#344c49');box(c,67,0+arm*28,20,13,5,'#d7c799','#344c49');
  if(moving){ellipse(c,-76,25,12,5,'#8fc6b04d');for(let i=0;i<3;i++)path(c,[[-90-i*14,22+Math.sin(t*7+i)*4],[-100-i*14,22+Math.sin(t*7+i)*4]],null,'#d0ddbd88');}
  c.restore();
}
export function rocket(c,x,y,s,t,thrust=0){c.save();c.translate(x,y);c.scale(s,s);c.lineWidth=3;if(thrust){path(c,[[-17,70],[-11,100+Math.sin(t*35)*15],[0,145+Math.sin(t*22)*25],[11,100],[17,70]],'#e98a43');path(c,[[-9,70],[0,122+Math.sin(t*30)*10],[9,70]],'#ffe4a0');}path(c,[[-27,25],[-45,66],[-22,58]],'#c46b50','#243e43');path(c,[[27,25],[45,66],[22,58]],'#c46b50','#243e43');box(c,-23,-40,46,108,12,'#eee5c6','#243e43');path(c,[[-23,-35],[0,-86],[23,-35]],'#d57b55','#243e43');box(c,-23,37,46,12,2,'#4d817c');ellipse(c,0,-13,14,14,'#31535c','#b6bba5');ellipse(c,-4,-18,5,5,'#a2d6ce');box(c,-16,66,32,9,2,'#34484a');c.restore();}
export function saturn(c,x,y,r){c.save();c.translate(x,y);c.rotate(-.3);c.lineWidth=r*.17;ellipse(c,0,0,r*1.9,r*.55,null,'#cbbba85c');const g=c.createLinearGradient(0,-r,0,r);g.addColorStop(0,'#f1dbab');g.addColorStop(.5,'#c3a575');g.addColorStop(1,'#86745e');ellipse(c,0,0,r,r,g);c.strokeStyle='#f1dcc38c';c.beginPath();c.ellipse(0,0,r*1.9,r*.55,0,0,Math.PI);c.stroke();c.restore();}
export function landscape(c,w,h,t,camera=0,{rain=false,still=false}={}){
  const sky=c.createLinearGradient(0,0,0,h*.65);sky.addColorStop(0,'#8b725b');sky.addColorStop(.5,'#cc9c65');sky.addColorStop(1,'#ead39d');c.fillStyle=sky;c.fillRect(0,0,w,h);
  ellipse(c,w*.72-camera*.03,h*.21,24,24,'#fff0b83b');ellipse(c,w*.72-camera*.03,h*.21,13,13,'#ffedbd8c');
  for(let i=0;i<8;i++){let x=((i*257-camera*.06+(still?0:t*2))%(w+400)+w+400)%(w+400)-200;ellipse(c,x,h*(.16+i%3*.1),120+i%3*40,10,'#f4dba51c');}
  const mountains=(base,height,color,shift)=>{const pts=[[-20,h]];for(let x=-20;x<=w+25;x+=25){const a=x+camera*shift;pts.push([x,base-(Math.sin(a*.007)+Math.sin(a*.017)*.45+Math.cos(a*.031)*.14)*height]);}pts.push([w+25,h]);path(c,pts,color);};
  mountains(h*.45,h*.065,'#ad8b64',.12);mountains(h*.51,h*.08,'#927953',.23);mountains(h*.57,h*.04,'#6e6650',.4);
  const lake=c.createLinearGradient(0,h*.57,0,h);lake.addColorStop(0,'#737d65');lake.addColorStop(.3,'#435c50');lake.addColorStop(1,'#203f3e');c.fillStyle=lake;c.fillRect(0,h*.575,w,h*.425);
  c.lineWidth=1;for(let i=0;i<70;i++){const y=h*.59+(i/70)**1.5*h*.42;const x=((i*157-camera*.6+(still?0:t*(i%3+1)*4))%(w+150)+w+150)%(w+150)-80;path(c,[[x,y],[x+16+i%5*13,y]],null,i%3===0?'#dbcd9166':'#9bb79824');}
  // Irregular foreground islands made of ice and organic sediment, without Earth vegetation.
  for(let i=0;i<7;i++){const x=i*460-camera*.9-80;if(x < -250 || x>w+200)continue;path(c,[[x-130,h],[x-100,h*.96],[x-20,h*.93],[x+32,h*.94],[x+73,h*.985],[x+180,h]],'#363e32');for(let j=0;j<9;j++){let rx=x+j*22-65,ry=h*.98+Math.sin(j*7)*h*.014;ellipse(c,rx,ry,8+j%3*5,5+j%4*2,j%2?'#77765b':'#9b9170');}}
  if(rain){c.lineWidth=1.5;for(let i=0;i<45;i++){const x=(i*79+(still?0:t*40))%w,y=(i*47+(still?0:t*220))%h;path(c,[[x,y],[x-5,y+14]],null,'#f2e0af35');}}
}
export function space(c,w,h,t,travel=0){const g=c.createLinearGradient(0,0,w,h);g.addColorStop(0,'#162b39');g.addColorStop(.6,'#233849');g.addColorStop(1,'#66505b');c.fillStyle=g;c.fillRect(0,0,w,h);for(let i=0;i<140;i++){const x=((i*127.37-travel*(i%3+1))%w+w)%w,y=(i*71.71)%h;ellipse(c,x,y,i%9===0?1.8:.8,i%9===0?1.8:.8,`rgba(240,234,205,${.3+(Math.sin(i+t*.4)+1)*.22})`);}saturn(c,w*.79,h*.27,Math.min(w,h)*.15);}
