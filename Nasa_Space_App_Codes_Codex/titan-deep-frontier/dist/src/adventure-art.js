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
export function componentArt(c,kind,x,y,s=1,t=0) {
  c.save();c.translate(x,y);c.scale(s,s);c.lineWidth=2;c.lineJoin='round';
  if(kind==='solar'){
    path(c,[[-57,0],[57,0]],null,'#d8c994');
    for(const side of [-1,1]){box(c,side<0?-64:14,-26,50,52,3,'#254e71','#d4c79b');for(let i=0;i<4;i++)for(let j=0;j<4;j++){box(c,(side<0?-61:17)+i*12,-23+j*12,10,10,1,(i+j)%2?'#397294':'#285d83');}path(c,[[side<0?-61:17,-23],[side<0?-14:64,23]],null,'#9cc3c333');}
    box(c,-9,-15,18,30,3,'#e0c584','#f8e1a2');
  }else if(kind==='rtg'){
    box(c,-17,-28,34,56,7,'#655f51','#d3c29c');for(let i=0;i<7;i++)box(c,-27,-25+i*8,54,4,1,'#a4aaa0','#344b48');box(c,-8,-24,16,48,2,'#bf8054');box(c,-5,-21,4,42,1,'#ecc896');ellipse(c,0,-31,12,4,'#e4d4a7');
  }else if(kind==='battery'){
    box(c,-34,-24,68,48,7,'#324f48','#e2c990');for(let i=0;i<3;i++){box(c,-28+i*20,-19,16,37,5,'#b6c6a1');box(c,-24+i*20,-25,8,6,1,'#e2c990');box(c,-26+i*20,5,12,10,2,'#638d74');}path(c,[[-3,-12],[-11,2],[-2,2],[-5,12],[10,-4],[1,-4]],'#ffe5a3');
  }else if(['light','shield','heavy'].includes(kind)){
    const wide=kind==='heavy'?52:43;box(c,-wide,-24,wide*2,50,9,kind==='shield'?'#d3ac61':'#e9dfbc','#344e49');box(c,-wide-8,21,(wide+8)*2,15,7,kind==='heavy'?'#a8b5a0':'#597969','#263f43');box(c,-29,-14,58,20,5,'#294a52');for(let i=0;i<5;i++)path(c,[[-34+i*17,10],[-29+i*17,21]],null,kind==='shield'?'#f4d98a':'#b9bea2');
  }else if(['camera','sampler','lab'].includes(kind)){
    if(kind==='camera'){path(c,[[0,30],[0,-2]],null,'#b2c1ab');box(c,-28,-25,56,35,7,'#dfc88e','#2a4547');ellipse(c,9,-8,14,14,'#294f62','#e8ddb6');ellipse(c,9,-8,8,8,'#68a7b4');ellipse(c,5,-12,3,3,'#d5f0db');box(c,-21,-18,10,6,2,'#b77453');}
    if(kind==='sampler'){path(c,[[-32,22],[-12,-21],[21,-9],[31,23]],null,'#dccb9b');for(const [a,b] of [[-32,22],[-12,-21],[21,-9]])ellipse(c,a,b,6,6,'#ce8b59','#364e49');path(c,[[18,20],[48,20],[42,35],[26,35]],'#cc8b5e','#f1d39c');}
    if(kind==='lab'){box(c,-35,-7,70,37,5,'#6d8b7c','#d5d9b0');for(let i=0;i<2;i++){box(c,-27+i*31,-31,23,51,5,'#c4d5c3','#304c4b');box(c,-24+i*31,-20,17,23,2,i?'#8caec4':'#d5ae69');box(c,-24+i*31,-35,17,7,2,'#d9c38c');}ellipse(c,24,22,3,3,'#e9d699');}
  }else if(kind==='whip'){
    box(c,-13,21,26,10,3,'#a5b9a1');path(c,[[0,23],[0,-33]],null,'#e7dbb4');ellipse(c,0,-33,4,4,'#cc8459');
  }else if(kind==='dish'||kind==='array'){
    if(kind==='array')for(const side of [-1,1]){box(c,side<0?-48:24,-9,24,35,3,'#638e8b','#e9d5a2');for(let i=0;i<3;i++)path(c,[[side<0?-45:27,i*9-3],[side<0?-27:45,i*9-3]],null,'#b9cbb0');}
    path(c,[[0,32],[0,4]],null,'#a9bba6');c.save();c.rotate(-.25+Math.sin(t)*.07);c.beginPath();c.ellipse(0,-11,28,21,0,0,Math.PI);c.fillStyle='#e9d4a2';c.fill();c.strokeStyle='#425c55';c.stroke();ellipse(c,0,-11,28,7,'#f6e5bd','#bfaa79');path(c,[[0,7],[0,-24]],null,'#557369');ellipse(c,0,-24,4,4,'#d58a5c');c.restore();
  }
  c.restore();
}
export function cloud(c,x,y,s=1,alpha=.6){
  c.save();c.translate(x,y);c.scale(s,s);c.globalAlpha*=alpha;
  const shade=c.createLinearGradient(0,-45,0,25);shade.addColorStop(0,'#fff0ce');shade.addColorStop(1,'#bfb79e');
  c.beginPath();c.moveTo(-100,14);c.bezierCurveTo(-125,-4,-100,-29,-75,-21);c.bezierCurveTo(-74,-49,-30,-58,-12,-34);c.bezierCurveTo(9,-58,50,-38,51,-17);c.bezierCurveTo(85,-31,119,-2,98,17);c.bezierCurveTo(48,34,-65,32,-100,14);c.fillStyle=shade;c.fill();
  path(c,[[-87,10],[-50,15],[-18,11]],null,'#fff3d53d');c.restore();
}
export function explorer(c,x,y,scale,t,{parts=['floats','power','radio'],loadout={body:'light',power:'rtg',science:'camera',radio:'dish'},deploy=1,moving=0,sampling=0,chute=false,face=true}={}) {
  c.save();c.translate(x,y);c.scale(scale,scale);c.rotate(Math.sin(t*2)*.018);
  if(chute){c.strokeStyle='#f0ddba';c.lineWidth=2;for(const a of[-95,-45,0,45,95])path(c,[[a,-135],[0,-30]],null,'#f1dfb5');c.beginPath();c.moveTo(-102,-135);c.bezierCurveTo(-90,-235,90,-235,102,-135);c.quadraticCurveTo(75,-151,50,-135);c.quadraticCurveTo(25,-151,0,-135);c.quadraticCurveTo(-25,-151,-50,-135);c.quadraticCurveTo(-75,-151,-102,-135);c.fillStyle='#eeb66f';c.fill();path(c,[[-50,-135],[-42,-194],[0,-210],[42,-194],[50,-135]],null,'#f8e6bd');}
  c.lineWidth=3;ellipse(c,0,23,83,10,'#162d2c35');
  if(parts.includes('power')&&loadout.power==='solar'){c.save();c.scale(Math.max(.1,deploy),1);componentArt(c,'solar',0,-15,1.7,t);c.restore();}
  if(parts.includes('floats')){const extra=loadout.body==='heavy'?17:loadout.body==='shield'?7:0;box(c,-76-extra,8,152+extra*2,26+extra*.5,13,'#263f43','#142a30');box(c,-70-extra,7,140+extra*2,13,8,'#dbb96e');box(c,-65-extra,20,130+extra*2,11,5,'#e8ddba');box(c,-41,5,9,29,3,'#ce6950');box(c,34,5,9,29,3,'#ce6950');}
  path(c,[[-42,13],[-37,-15],[37,-15],[45,13]],'#465451','#25393e');
  box(c,-42,-54,84,62,14,'#e9dfbc','#283d3c');box(c,-35,-48,70,45,11,'#f7ebc9');box(c,-28,-39,56,25,9,'#24444b');
  if(face){const blink=Math.sin(t*.77)>.995;box(c,-18,-32,9,blink?2:10,4,'#a5e7d4');box(c,9,-32,9,blink?2:10,4,'#a5e7d4');}
  if(loadout.body==='shield'){for(const side of [-1,1]){box(c,side<0?-44:32,-49,12,57,3,'#cea35b');for(let i=0;i<6;i++)path(c,[[side<0?-43:33,-44+i*8],[side<0?-33:43,-39+i*8]],null,'#f1d188');}}
  if(loadout.body==='heavy'){box(c,-48,-53,9,63,3,'#789081');box(c,39,-53,9,63,3,'#789081');}
  box(c,-10,-7,20,5,2,'#ca7051');for(let i=0;i<3;i++)ellipse(c,26+i*5,-5,1.2,1.2,'#8e967e');
  for(const xx of [-30,30])for(const yy of [-44,1])ellipse(c,xx,yy,1.6,1.6,'#738779');
  if(parts.includes('power')&&loadout.power!=='solar'){path(c,[[-40,-14],[-59,-14],[-59,0]],null,'#bb9e6b');componentArt(c,loadout.power,-65-(1-deploy)*45,-20,.67,t);}
  if(parts.includes('radio'))componentArt(c,loadout.radio,27,-80,.82,t);
  if(loadout.science==='camera'){path(c,[[-18,-54],[-18,-80]],null,'#a7b7a2');componentArt(c,'camera',-18,-82,.58,t);}
  if(loadout.science==='lab')componentArt(c,'lab',64,-23,.7,t);
  path(c,[[-22,-54],[-25,-79+Math.sin(t*3)*3]],null,'#45534a');ellipse(c,-25,-79+Math.sin(t*3)*3,4,4,'#ef9966');
  const arm=sampling?Math.sin(Math.min(sampling,1)*Math.PI/2):0;
  if(loadout.science==='sampler'||sampling){c.lineWidth=7;path(c,[[40,-21],[61,-12+arm*25],[75,3+arm*28]],null,'#344c49');c.lineWidth=3;path(c,[[40,-21],[61,-12+arm*25],[75,3+arm*28]],null,'#e0c994');ellipse(c,61,-12+arm*25,6,6,'#ddb775','#344c49');box(c,67,0+arm*28,20,13,5,'#d7c799','#344c49');}
  if(moving){ellipse(c,-76,25,12,5,'#8fc6b04d');for(let i=0;i<3;i++)path(c,[[-90-i*14,22+Math.sin(t*7+i)*4],[-100-i*14,22+Math.sin(t*7+i)*4]],null,'#d0ddbd88');}
  c.restore();
}
export function rocket(c,x,y,s,t,thrust=0){
  c.save();c.translate(x,y);c.scale(s,s);c.lineWidth=1.5;c.lineJoin='round';
  if(thrust){
    const length=60+thrust*85+Math.sin(t*31)*10;
    const glow=c.createRadialGradient(0,100,3,0,100,90);glow.addColorStop(0,'#ffc66b70');glow.addColorStop(1,'#ffb85300');ellipse(c,0,105,80,95,glow);
    for(const [cx,sz] of [[-37,.55],[37,.55],[0,1]]){c.save();c.translate(cx,80);c.scale(sz,sz);path(c,[[-14,0],[-20,29],[-10,length*.65],[0,length],[12,length*.6],[19,25],[14,0]],'#c9683c');path(c,[[-11,0],[-12,30],[0,length*.85],[12,30],[11,0]],'#ffd187');path(c,[[-7,0],[0,length*.55],[7,0]],'#fff4cc');for(let i=0;i<4;i++)ellipse(c,Math.sin(i*9+t*5)*7,((t*100+i*26)%length),3,5,'#fff7d485');c.restore();}
  }
  for(const side of [-1,1]){
    const bx=side*37;
    const metal=c.createLinearGradient(bx-11,0,bx+11,0);metal.addColorStop(0,'#9baaa1');metal.addColorStop(.35,'#f3ead1');metal.addColorStop(1,'#a5b3a8');
    box(c,bx-11,-17,22,92,7,metal,'#294548');path(c,[[bx-11,-13],[bx,-40],[bx+11,-13]],'#c87b5b','#334e4c');
    box(c,bx-12,45,24,7,2,'#38635f');path(c,[[bx-7,75],[bx-10,83],[bx+10,83],[bx+7,75]],'#425957','#263c3f');
    for(const yy of [4,34,64])path(c,[[bx-9,yy],[bx+9,yy]],null,'#6e83756b');
    path(c,[[side*43,35],[side*62,73],[side*45,66]],'#be7054','#304947');
    box(c,side<0?-31:22,12,9,7,1,'#bcae87');
  }
  const hull=c.createLinearGradient(-25,0,25,0);hull.addColorStop(0,'#a9b6a8');hull.addColorStop(.24,'#eee8cd');hull.addColorStop(.52,'#fff2d5');hull.addColorStop(1,'#b8c1b1');
  box(c,-24,-63,48,133,12,hull,'#2e4949');
  const nose=c.createLinearGradient(-23,-80,23,-80);nose.addColorStop(0,'#a95543');nose.addColorStop(.4,'#e29a72');nose.addColorStop(1,'#b96c51');
  c.beginPath();c.moveTo(-24,-58);c.bezierCurveTo(-25,-87,-10,-107,0,-118);c.bezierCurveTo(10,-107,25,-87,24,-58);c.closePath();c.fillStyle=nose;c.fill();c.stroke();
  path(c,[[-13,-69],[-8,-90],[0,-104]],null,'#f4c59a91');
  for(const yy of [-56,-44,22,53]){path(c,[[-23,yy],[23,yy]],null,'#70867a');for(const xx of [-17,-7,7,17])ellipse(c,xx,yy+4,.9,.9,'#6a8179');}
  box(c,-24,28,48,14,1,'#3d7875');box(c,-20,30,7,10,1,'#79a59a');
  ellipse(c,0,-23,15,15,'#e4ce99','#597970');ellipse(c,0,-23,11,11,'#234c60');ellipse(c,-3,-26,6,6,'#5d9eac');ellipse(c,-6,-29,2,2,'#d8efda');
  box(c,-8,1,16,10,2,'#ce7b56');path(c,[[-5,6],[5,6]],null,'#ffe5b4');
  c.fillStyle='#365b56';c.font='bold 5px sans-serif';c.textAlign='center';c.fillText('P I P  ·  0 1',0,19);
  box(c,-22,62,44,10,2,'#65796b','#314b45');for(let i=0;i<9;i++)path(c,[[-18+i*4,63],[-18+i*4,70]],null,'#d2c8a0');
  path(c,[[-12,72],[-18,84],[18,84],[12,72]],'#3f5250','#20383c');ellipse(c,0,83,17,4,thrust?'#ffdc97':'#172f35','#a99b7a');
  c.restore();
}
export function saturn(c,x,y,r){c.save();c.translate(x,y);c.rotate(-.3);c.lineWidth=r*.17;ellipse(c,0,0,r*1.9,r*.55,null,'#cbbba85c');const g=c.createLinearGradient(0,-r,0,r);g.addColorStop(0,'#f1dbab');g.addColorStop(.5,'#c3a575');g.addColorStop(1,'#86745e');ellipse(c,0,0,r,r,g);c.strokeStyle='#f1dcc38c';c.beginPath();c.ellipse(0,0,r*1.9,r*.55,0,0,Math.PI);c.stroke();c.restore();}
export function landscape(c,w,h,t,camera=0,{rain=false,still=false}={}){
  const sky=c.createLinearGradient(0,0,0,h*.65);sky.addColorStop(0,'#8b725b');sky.addColorStop(.5,'#cc9c65');sky.addColorStop(1,'#ead39d');c.fillStyle=sky;c.fillRect(0,0,w,h);
  ellipse(c,w*.72-camera*.03,h*.21,24,24,'#fff0b83b');ellipse(c,w*.72-camera*.03,h*.21,13,13,'#ffedbd8c');
  for(let i=0;i<8;i++){let x=((i*257-camera*.06+(still?0:t*2))%(w+400)+w+400)%(w+400)-200;ellipse(c,x,h*(.16+i%3*.1),120+i%3*40,10,'#f4dba51c');if(i%2===0)cloud(c,x,h*(.14+i%3*.09),.55+i%3*.14,.13);}
  const mountains=(base,height,color,shift)=>{const pts=[[-20,h]];for(let x=-20;x<=w+25;x+=25){const a=x+camera*shift;pts.push([x,base-(Math.sin(a*.007)+Math.sin(a*.017)*.45+Math.cos(a*.031)*.14)*height]);}pts.push([w+25,h]);path(c,pts,color);};
  mountains(h*.45,h*.065,'#ad8b64',.12);mountains(h*.51,h*.08,'#927953',.23);mountains(h*.57,h*.04,'#6e6650',.4);
  const lake=c.createLinearGradient(0,h*.57,0,h);lake.addColorStop(0,'#737d65');lake.addColorStop(.3,'#435c50');lake.addColorStop(1,'#203f3e');c.fillStyle=lake;c.fillRect(0,h*.575,w,h*.425);
  c.lineWidth=1;for(let i=0;i<70;i++){const y=h*.59+(i/70)**1.5*h*.42;const x=((i*157-camera*.6+(still?0:t*(i%3+1)*4))%(w+150)+w+150)%(w+150)-80;path(c,[[x,y],[x+16+i%5*13,y]],null,i%3===0?'#dbcd9166':'#9bb79824');}
  // Irregular foreground islands made of ice and organic sediment, without Earth vegetation.
  for(let i=0;i<7;i++){const x=i*460-camera*.9-80;if(x < -250 || x>w+200)continue;path(c,[[x-130,h],[x-100,h*.96],[x-20,h*.93],[x+32,h*.94],[x+73,h*.985],[x+180,h]],'#363e32');for(let j=0;j<9;j++){let rx=x+j*22-65,ry=h*.98+Math.sin(j*7)*h*.014;ellipse(c,rx,ry,8+j%3*5,5+j%4*2,j%2?'#77765b':'#9b9170');}}
  if(rain){c.lineWidth=1.5;for(let i=0;i<45;i++){const x=(i*79+(still?0:t*40))%w,y=(i*47+(still?0:t*220))%h;path(c,[[x,y],[x-5,y+14]],null,'#f2e0af35');}}
}
export function space(c,w,h,t,travel=0){const g=c.createLinearGradient(0,0,w,h);g.addColorStop(0,'#162b39');g.addColorStop(.6,'#233849');g.addColorStop(1,'#66505b');c.fillStyle=g;c.fillRect(0,0,w,h);for(let i=0;i<140;i++){const x=((i*127.37-travel*(i%3+1))%w+w)%w,y=(i*71.71)%h;ellipse(c,x,y,i%9===0?1.8:.8,i%9===0?1.8:.8,`rgba(240,234,205,${.3+(Math.sin(i+t*.4)+1)*.22})`);}saturn(c,w*.79,h*.27,Math.min(w,h)*.15);}
