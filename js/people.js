// Người đi lại: tìm đường, gọi món, ngồi, ra về; nhân viên; dắt khách
/* ---- hành vi ---- */
// điểm đứng ngẫu nhiên quanh (x,y) nhưng không trùng bàn ghế, cây, quầy
function openSpot(x,y,rx,ry){ const N=nav(); for(let k=0;k<12;k++){ const px=x+rnd(-rx,rx), py=y+rnd(-ry,ry), [c,r]=cellAt(px,py); if(!N[r*GC+c]) return [px,py]; } return [x,y]; }
function qpos(i){ const x0=cartL()+50, dir=x0<GX?1:-1; return [x0+dir*i*16,150]; }
// ra về: đi vòng qua bàn ghế tới cổng hoa rồi rẽ ra đường
function exitPath(e){ const side=Math.random()<.5?-14-OX:W+14+OX, y=rnd(308,316); return [...(e?route(e.x,e.y,GX,282):[[GX,150]]),[GX,296],[GX,y],[side,y]]; }
/* ---- tìm đường trên lưới vườn: tránh bàn ghế, cây, ao, xe cafe; đi chéo được; rút gọn thành vài đoạn thẳng ---- */
let navKey='', navG=null;
function nav(){ const k=tkey+'|'+cartC()+'|'+isCity(); if(k===navKey) return navG; navKey=k; navG=new Uint8Array(GC*GR); const cc=cartC();
  for(let r=0;r<GR;r++) for(let c=0;c<GC;c++) navG[r*GC+c]=(c>=cc&&c<=cc+6&&r<=3)||decorCell(c,r)?1:0;
  layoutOf().forEach(o=>{ const it=catOf(o.id); for(let y=o.r;y<o.r+it.h;y++) for(let x=o.c;x<o.c+it.w;x++) if(x>=0&&y>=0&&x<GC&&y<GR) navG[y*GC+x]=1; });
  return navG; }
const cellAt=(x,y)=>[clamp(Math.floor((x-G0X)/CS),0,GC-1),clamp(Math.floor((y-G0Y)/CS),0,GR-1)];
function route(x0,y0,x1,y1){
  const N=nav(), [c0,r0]=cellAt(x0,y0), [c1,r1]=cellAt(x1,y1), s0=r0*GC+c0, s1=r1*GC+c1;
  if(s0===s1) return [[x1,y1]];
  const free=i=>i===s0||i===s1||!N[i], prev=new Int16Array(GC*GR).fill(-1), q=[s0]; prev[s0]=s0;
  for(let h=0;h<q.length&&prev[s1]<0;h++){ const i=q[h], c=i%GC, r=(i-c)/GC;
    for(const [dc,dr] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){ const nc=c+dc, nr=r+dr; if(nc<0||nr<0||nc>=GC||nr>=GR) continue; const j=nr*GC+nc;
      if(prev[j]>=0||!free(j)) continue; if(dc&&dr&&(!free(r*GC+nc)||!free(nr*GC+c))) continue; prev[j]=i; q.push(j); } }
  if(prev[s1]<0) return [[x1,y1]];
  const cells=[]; for(let i=s1;i!==s0;i=prev[i]) cells.push(i); cells.reverse();
  const pt=i=>[G0X+(i%GC)*CS+8,G0Y+Math.floor(i/GC)*CS+8];
  const clear=(a,b)=>{ const n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/4); for(let k=1;k<n;k++){ const [c,r]=cellAt(a[0]+(b[0]-a[0])*k/n,a[1]+(b[1]-a[1])*k/n); if(!free(r*GC+c)) return false; } return true; };
  const out=[]; let from=[x0,y0];
  for(let k=0;k<cells.length-1;k++){ const nx=k+1<cells.length-1?pt(cells[k+1]):[x1,y1]; if(!clear(from,nx)){ const p=pt(cells[k]); out.push(p); from=p; } }
  out.push([x1,y1]); return out; }

function spawnCust(opt={}){ let e; if(!opt.lost&&R()<.3){ const id=pickVil(); e=id?vilEnt(id):mk('c'); } else e=mk('c');
  e.x=clamp(GX+(Math.random()<.5?-1:1)*rnd(4,30),-10-OX,W+10+OX); e.y=rnd(304,310); e.spd=rnd(56,64); // xuất hiện ngay cổng để kịp vào ngồi trong ngày // trên phố mặt tiền mở rộng: khách bước vào từ khắp vỉa hè; ở quê thì qua cổng hoa
  const gx=isCity()?GX+rnd(-110,110):GX+rnd(-6,6);
  // khách mua: đi thẳng tới cuối hàng chờ trước xe cafe; khách bỏ về: dừng ở phía trước sân rồi quay ra
  const tail=qpos(Math.min(5,queue.length+ents.filter(o=>o.st==='in'&&!o.lost).length)), [ax,ay]=opt.lost?openSpot(GX,isCity()?212:186,70,8):openSpot(tail[0],tail[1]+6,6,4);
  e.path=[[gx,e.y],Math.random()<.2?[gx,292,rnd(.2,.5)]:[gx,296],...route(gx,284,ax,ay)]; e.st='in'; Object.assign(e,opt); ents.push(e);
  // rủ bạn đi cùng: đi sát nhau, ngồi chung bàn (chỉ để cảnh đông vui, không tính thêm doanh thu)
  if(!opt.lost&&Math.random()<.28){ const f=mk('c'); f.x=e.x+(e.x<GX?-11:11); f.y=e.y+rnd(-2,2); f.spd=e.spd; f.pace=e.pace; f.ox=e.ox+rnd(-3,3); f.oy=e.oy+5;
    f.path=e.path.map(p=>[...p]); f.st='in'; f.pal=e; e.pal=f; ents.push(f); } }
function spawnOfficers(){ for(let i=0;i<3;i++){ const e=mk('officer'); e.x=GX-60-i*16; e.y=312; e.spd=55; e.path=[[GX,312],[GX,200],[360+i*20,200+(i%2)*8]]; e.st='insp'; ents.push(e);} const d=pets.find(p=>p.k==='cho'); if(d){ d.st='bark'; d.t=3; floats.push({x:d.x+4,y:d.y-16,txt:L("Gâu!"),t:1.6}); } }
function spawnBike(delivery,worth){
  const dir=Math.random()<.5?1:-1, u=R();
  const type=delivery?'xm':u<.06?'trau':u<.3?'xd':'xm';
  const lk=mkLook(delivery?'driver':'c'); if(type==='xm'&&!delivery&&Math.random()<.75) lk.style='helmet'; if(type==='trau') Object.assign(lk,{style:'nonla',shirt:'#5a6b4a',pants:'#3b3b45'}); if(type==='xd'&&R()<.6) Object.assign(lk,{shirt:'#f4f1ea',pants:'#2f3542',style:pick(['short','pony','long'])});
  const b={type,x:dir>0?-30-OX:W+30+OX,y:dir>0?337:330,dir,spd:type==='trau'?12:type==='xd'?rnd(30,45):rnd(80,130),col:pick(BK),lk,spr:{},rider:type!=='trau',st:delivery?'arrive':'pass',worth,step:0,cargo:type==='xm'&&!delivery&&R()<.2};
  if(type==='trau') b.y=dir>0?334:328;
  if(delivery){ b.y=330; b.tx=rnd(120,500); b.spd=95; } bikes.push(b);
}
// đi theo lối có quán tính: tăng tốc từ từ, ôm cua ở điểm giữa đường, chậm lại khi tới nơi.
// Điểm giữa đường được lệch theo ox/oy của từng người; điểm cuối (ghế, hàng chờ) thì tới đúng chỗ. [x,y,giây] = dừng lại ở đó.
function step(e,dt){
  if(!e.path.length){ e.vx=e.vy=0; return true; }
  if(e.wait>0){ e.wait-=dt; e.vx=e.vy=0; return false; }
  const p=e.path[0], last=e.path.length===1, tx=p[0]+(last?0:e.ox), ty=p[1]+(last?0:e.oy);
  const dx=tx-e.x, dy=ty-e.y, d=Math.hypot(dx,dy), sp=e.spd*(e.pace||1), s=sp*dt;
  if(last?d<=Math.max(s,.6):d<=Math.max(s,p[2]?1:7)){
    if(last||p[2]){ e.x=tx; e.y=ty; }
    if(p[2]){ e.wait=p[2]; e.vx=e.vy=0; }
    e.path.shift(); return !e.path.length; }
  const k=1-Math.exp(-dt*7), want=last?clamp(d/14,.4,1)*sp:sp;
  if(last&&d<4){ e.vx=dx/d*want; e.vy=dy/d*want; }
  else { e.vx+=(dx/d*want-e.vx)*k; e.vy+=(dy/d*want-e.vy)*k; }
  const v=Math.hypot(e.vx,e.vy); if(v>sp){ e.vx*=sp/v; e.vy*=sp/v; }
  e.x+=e.vx*dt; e.y+=e.vy*dt;
  if(Math.abs(e.vx)>5) e.f=e.vx<0?-1:1;
  e.step+=dt*Math.min(v,sp)/5.5; return false;
}
// người đang đi tránh dồn đè lên nhau
function spread(dt){
  const mv=ents.filter(e=>e.path.length&&!(e.wait>0)&&e.y<300);
  for(let i=0;i<mv.length;i++) for(let j=i+1;j<mv.length;j++){ const a=mv[i], b=mv[j], dx=b.x-a.x, dy=(b.y-a.y)*1.6, d=Math.hypot(dx,dy);
    if(d>0&&d<7){ const f=(7-d)*2.2*dt/d; a.x-=dx*f; a.y-=dy*f*.4; b.x+=dx*f; b.y+=dy*f*.4; } }
}
// đứng yên thì thỉnh thoảng ngó nghiêng; ngồi chung bàn thì tán gẫu
function fidget(e,dt){
  if(e.side>0) e.side-=dt; if(e.chat>0){ e.chat-=dt; if(e.chat<=0&&e.seat) e.f=e.seat.f; }
  const seated=e.st==='sit'||e.st==='idle'; if(seated&&e.look>3) e.look=rnd(.4,2);
  e.look-=dt; if(e.look>0) return; e.look=seated?rnd(.8,2.8):rnd(2.5,7);
  if(seated){ const mate=e.seat&&ents.find(o=>o!==e&&o.seat&&(o.st==='sit'||o.st==='idle')&&(o.seat.o===e.seat.o||Math.hypot(o.x-e.x,o.y-e.y)<40));
    if(mate&&!(mate.chat>0)&&Math.random()<.6){ e.chat=rnd(1.4,2.6); if(mate.x!==e.x) e.f=mate.x>e.x?1:-1; } }
  else if(e.st!=='wait'&&e.kind!=='staff'){ e.side=rnd(.7,1.8); e.f=Math.random()<.5?-1:1; }
}
const freeSeat=e=>{ const fr=seats.filter(s=>!s.who); if(!fr.length) return null;
  const ps=e&&e.pal&&e.pal.seat, near=ps&&fr.find(s=>s.o===ps.o); if(near) return near;
  if(e&&e.pal&&!ps){ const pair=fr.find(s=>fr.some(t=>t!==s&&t.o===s.o)); if(pair) return pair; }
  return pick(fr); };
function leave(e){ const so=e.seat&&e.seat.o;
  if(e.seat) e.seat.who=null; e.seat=null; e.path=exitPath(e); e.st='out'; e.spd=Math.max(e.spd,46);
  if(so&&crew.length&&play&&Math.random()<.7) tasks.push({type:'clean',o:so}); }
function syncCrew(){ const n=Math.min(cfg().staff,5); while(crew.length<n){ const i=crew.length+1; crew.push({lk:staffSpr[i].lk,spr:staffSpr[i].spr,home:true,ent:null,task:null}); }
  while(crew.length>n){ const m=crew.pop(); if(m.ent) rm(m.ent); } }
function exitPt(){ return [cartL()+96,140]; }
function taskSpot(t){
  if(t.type==='serve'){ const s=t.cust.seat; return s?[s.x+(s.f>0?-2:2),s.y+10]:null; }
  if(t.type==='clean'||t.type==='chat'){ const o=t.o||(t.cust&&t.cust.seat&&t.cust.seat.o); if(!o) return null; const it=catOf(o.id); return [cellX(o.c)+it.w*8,cellY(o.r)+it.h*16+9]; }
  if(t.type==='water'){ const it=catOf(t.o.id); return [cellX(t.o.c)+it.w*CS+4,cellY(t.o.r)+it.h*CS-2]; }
  if(t.type==='weed'){ const [x,y]=weedPos(t.w); return [x+6,y+1]; }
  return null;
}
function dispatch(dt){
  syncCrew(); if(edit||!isOpen()) return;
  tasks=tasks.filter(t=>t.type!=='serve'||(ents.includes(t.cust)&&t.cust.st==='wait'));
  tasks.sort((a,b)=>(a.type==='serve'?0:1)-(b.type==='serve'?0:1));
  crew.forEach(m=>{ if(!m.home) return;
    let t=tasks.shift();
    if(!t&&Math.random()<dt*.09){ const sitters=ents.filter(e=>e.st==='sit'), plants=layoutOf().filter(o=>['chau','herb','chuoi','mai','xoai','tre'].includes(o.id)), ws=weedsOf();
      const u=Math.random(); if(ws.length&&u<.35) t={type:'weed',w:pick(ws)}; else if(sitters.length&&u<.65){ const c=pick(sitters); t={type:'chat',cust:c,o:c.seat&&c.seat.o}; } else if(plants.length) t={type:'water',o:pick(plants)}; }
    if(!t) return; const spot=taskSpot(t); if(!spot) return;
    const e=mk('staff'); e.lk=m.lk; e.spr=m.spr; e.crew=m; const [ex,ey]=exitPt(); e.x=ex; e.y=ey; e.spd=50; e.st='job';
    e.path=route(ex,ey,spot[0],spot[1]); m.home=false; m.task=t; m.ent=e; ents.push(e); });
}
function staffStep(e,arrived,dt){
  const m=e.crew, t=m.task;
  if(e.st==='job'&&arrived){ e.st='act'; e.t=t.type==='serve'?.5:t.type==='clean'?1.1:t.type==='chat'?2.2:1.6;
    const tgt=t.cust||null; if(tgt) e.f=tgt.x>e.x?1:-1; if(t.type==='weed') e.f=-1; }
  else if(e.st==='act'){ e.t-=dt; if(e.t<=0){
      if(t.type==='serve'&&t.cust&&t.cust.st==='wait'){ t.cust.st='sit'; t.cust.t=rnd(2.6,4.6)*HOUR; t.cust.bub=1.6; if(t.cust.worth) floats.push({x:t.cust.x-6,y:t.cust.y-36,txt:'♥',t:1}); }
      if(t.type==='chat'&&t.cust) t.cust.bub=1.4;
      if(t.type==='weed'&&S){ const i=S.weeds.indexOf(t.w); if(i>=0){ S.weeds.splice(i,1); dirtBits(...weedPos(t.w)); } }
      const [ex,ey]=exitPt(); e.st='ret'; e.path=route(e.x,e.y,ex,ey); } }
  else if(e.st==='ret'&&arrived){ rm(e); m.home=true; m.ent=null; m.task=null; }
}
const rm=e=>{ const i=ents.indexOf(e); if(i>=0) ents.splice(i,1); if(hoverE===e) hoverE=null; };
function update(dt){
  queue=queue.filter(e=>ents.includes(e));
  queue.forEach((e,i)=>{ const [qx,qy]=qpos(i); if(Math.hypot(e.x-qx-e.qx,e.y-qy-e.qy)>.6) e.path=[[qx+e.qx,qy+e.qy]]; });
  spread(dt);
  for(const e of [...ents]){
    const arrived=step(e,dt); if(e.bub>0) e.bub-=dt; if(arrived) fidget(e,dt);
    if(e.kind==='staff'){ staffStep(e,arrived,dt); continue; }
    if(e.st==='in'&&arrived){
      if(e.lost&&e.why==='seat'&&seats.some(t=>!t.who)) e.lost=false;
      if(e.lost||queue.length>=6){ const why=!e.lost?L("Hàng dài quá!"):e.why==='seat'?L("Hết chỗ ngồi!"):L("Đông quá, chờ lâu!");
        e.st='mad'; e.mad=1.8; floats.push({x:e.x-why.length*2.2,y:e.y-42,txt:why,t:1.8,col:'rgba(255,160,140,A)'}); }
      else { e.st='q'; queue.push(e); } }
    else if(e.st==='mad'){ e.mad-=dt; if(e.mad<=0){ e.path=exitPath(e); e.st='out'; e.spd=50; } }
    else if(e.st==='q'&&queue[0]===e&&arrived){
      e.t+=dt;
      if(e.t>(e.kind==='driver'?.6:.9)/(1+cfg().staff*.35)){
        queue.shift(); serveFx=.4; e.cup=true;
        if(e.worth) floats.push({x:cartL()+30,y:72,txt:'+'+kk(e.worth),t:1.3});
        if(e.worth) sfx('coin',play&&play.fast?350:120);
        if(e.kind==='driver'){ e.st='back'; e.path=[...route(e.x,e.y,GX,282),[GX,296],[GX,318],[e.bike.x,328]]; }
        else { const s=Math.random()<.9||e.vil||e.pal?freeSeat(e):null;
          if(s){ s.who=e; e.seat=s; e.st='toSeat'; e.path=route(e.x,e.y,s.x,s.y); if(crew.length){ e.cup=false; e.needServe=true; } }
          else { e.st='out'; e.path=exitPath(e); e.spd=46; } }
      }
    }
    else if(e.st==='toSeat'&&arrived){ e.f=e.seat.f; if(e.needServe){ e.st='wait'; e.t=2.6*HOUR; tasks.push({type:'serve',cust:e}); } else { e.st='sit'; e.t=rnd(2.6,4.6)*HOUR*(e.vil?1.4:1); if(Math.random()<.35) e.bub=1.6; } }
    else if(e.st==='wait'){ e.t-=dt; if(e.t<=0){ e.st='sit'; e.t=rnd(2,3.5)*HOUR; } }
    else if(e.st==='sit'||(e.st==='idle'&&!play&&!edit)){ e.t-=dt; if(e.t<=0) leave(e); }
    else if(e.st==='back'&&arrived){ rm(e); e.bike.st='go'; e.bike.rider=true; }
    else if(e.st==='insp'&&arrived){ e.st='stand'; e.t=1.8*HOUR; }
    else if(e.st==='stand'){ e.t-=dt; if(e.t<=0){ e.st='out'; e.path=exitPath(e); } }
    else if((e.st==='out'||e.st==='pass')&&arrived) rm(e);
  }
}
function upBikes(dt){
  for(const b of [...bikes]){ b.step+=dt*(b.type==='trau'?4:9);
    if(b.st==='arrive'){ const d=b.tx-b.x, s=b.spd*dt; b.dir=Math.sign(d)||b.dir;
      if(Math.abs(d)<=s){ b.x=b.tx; b.st='wait'; b.rider=false; const e=mk('driver'); e.lk=b.lk; e.spr=b.spr; e.x=b.x; e.y=318; e.bike=b; e.path=[[GX,316],[GX,296],[GX,152]]; e.st='in'; e.worth=b.worth; ents.push(e); }
      else b.x+=Math.sign(d)*s; }
    else if(b.st==='go'||b.st==='pass'){ b.x+=b.dir*b.spd*dt; if(b.x<-60-OX||b.x>W+60+OX) bikes.splice(bikes.indexOf(b),1); }
  }
}
function initPets(){ pets=[{k:'ga',x:230,y:220,col:'#c8742e',f:1,peck:0,tx:230,ty:220,spd:10},{k:'ga',x:260,y:236,col:'#f2ece0',f:-1,peck:0,tx:260,ty:236,spd:11,rooster:true},{k:'ga',x:180,y:200,col:'#8a5a2b',f:1,peck:0,tx:180,ty:200,spd:9}];
  for(let i=0;i<4;i++) pets.push({k:'con',x:230+i*4,y:226+i,f:1,peck:0,tx:230,ty:226,spd:14,mom:pets[0]});
  pets.push({k:'vit',x:540,y:262,f:-1,peck:0,tx:540,ty:262,spd:6,water:true},{k:'vit',x:570,y:250,f:1,peck:0,tx:570,ty:250,spd:5,water:true},{k:'vit',x:372,y:240,f:1,peck:0,tx:372,ty:240,spd:8});
  pets.push({k:'cho',x:GX+40,y:282,st:'sleep',t:0,f:1},{k:'meo',x:262,y:176,f:1});
  bugs=Array.from({length:16},()=>({x:rnd(20,580),y:rnd(90,280),ph:rnd(0,6),sp:rnd(.4,1)}));
  flies=[0,1,2,3].map(i=>({x:rnd(60,560),y:rnd(90,260),ph:rnd(0,6),c:['#fff6c8','#f5d43a','#ffffff','#f6a6c8'][i]})); }
function petTarget(p){ for(let t=0;t<12;t++){ const tx=p.water?rnd(440,590):clamp(p.x+rnd(-50,50),30,580), ty=p.water?rnd(232,280):clamp(p.y+rnd(-30,30),150,282);
    if(p.water?inPond(tx,ty,10):(!inPond(tx,ty,-8)&&!(tx<150&&ty>232)&&!(tx<70&&ty>150&&ty<214))){ p.tx=tx; p.ty=ty; return; } } }
function upPets(dt){
  pets.forEach(p=>{
    if(p.k==='cho'){ if(p.st==='bark'){ p.t-=dt; if(p.t<=0) p.st='sleep'; } return; }
    if(p.k==='meo') return;
    if(p.peck>0){ p.peck-=dt; return; }
    const dx=p.tx-p.x, dy=p.ty-p.y, d=Math.hypot(dx,dy);
    if(d<1){ if(p.k==='con'&&p.mom){ p.tx=p.mom.x+rnd(-8,8); p.ty=p.mom.y+rnd(2,8); if(R()<.3) p.peck=rnd(.3,.8); }
      else if(R()<.5) p.peck=rnd(.5,1.6); else petTarget(p); return; }
    const s=Math.min(d,p.spd*dt*(p.k==='con'&&d>14?2:1)); p.x+=dx/d*s; p.y+=dy/d*s; if(Math.abs(dx)>.3) p.f=dx<0?-1:1; });
  flies.forEach(b=>{ b.ph+=dt*2; b.x+=Math.cos(b.ph*.7)*14*dt+Math.sin(b.ph*2.3)*6*dt; b.y+=Math.sin(b.ph*.9)*10*dt; if(b.x<40||b.x>580) b.ph+=Math.PI; b.y=clamp(b.y,80,280); });
}
function duck(p){ const x=Math.round(p.x*2)/2, y=Math.round(p.y*2)/2, f=p.f, pk=p.peck>0&&Math.floor(tt*5)%2;
  if(p.water){ const r=(tt*.8+p.x*.01)%1; g.strokeStyle=`rgba(200,245,240,${.5*(1-r)})`; g.lineWidth=.5; g.beginPath(); g.ellipse(x,y,4+r*5,1.2+r*1.6,0,0,7); g.stroke(); }
  else { g.fillStyle='rgba(0,0,0,.2)'; g.fillRect(x-3,y-.5,6,1); hb(x-1,y-2,.5,2,'#e8901d'); hb(x+.5,y-2,.5,2,'#e8901d'); }
  const by=p.water?y+1:y; hb(x-3.5,by-5,7,3.5,'#f4f1ea'); hb(x-3,by-5.5,5,1,'#ffffff'); hb(x-1.5,by-4.5,3,1.5,'#d8d4cc'); hb(x-f*4,by-5.5,1.5,1.5,'#f4f1ea');
  const hx=x+f*2.5, hy=by-8+(pk?2:0); hb(hx-1,hy,2.5,3,'#ffffff'); hb(hx+f*1.4-(f<0?1:0),hy+1.2,1.6,1,'#f0a020'); hb(hx+f*.5,hy+.6,.5,.5,'#2b1d16');
  if(p.water) hb(x-4,by-2,8,.6,'rgba(70,184,180,.9)'); }
function cat(p){ const x=Math.round(p.x), y=Math.round(p.y), br=Math.sin(tt*2)*.3;
  g.fillStyle='rgba(0,0,0,.2)'; g.fillRect(x-6,y-.5,12,1.5);
  hb(x-5,y-4-br,9,4+br,'#e8963a'); hb(x-4,y-4.5-br,7,1,'#f4b860'); [x-3,x,x+2].forEach(s=>hb(s,y-4-br,.7,3,'#c8742e'));
  hb(x+3,y-5,4,4,'#e8963a'); hb(x+3,y-6,1,1,'#e8963a'); hb(x+6,y-6,1,1,'#e8963a'); hb(x+4,y-3.5,2,.5,'#3b2516'); hb(x+5,y-2,1.5,1,'#fff6e3');
  hb(x-7,y-2,3,1.5,'#e8963a'); hb(x-7,y-1,6,1,'#c8742e'); hb(x-4,y-1,4,1,'#f4f1ea');
  if(Math.floor(tt*.8)%3===0){ g.fillStyle='rgba(255,255,255,.85)'; g.font='bold 4px "Pixelify Sans",monospace'; g.fillText('z',x+7,y-7-(tt%1)*3); } }
function butterflies(){ if(clock<7||clock>18.6||rain) return; flies.forEach(b=>{ const o=Math.abs(Math.sin(tt*14+b.ph))>.5; hb(b.x,b.y,.5,1.5,'#3b2516'); hb(b.x-(o?1.5:1),b.y-(o?1:.3),o?1.5:1,o?1.5:1,b.c); hb(b.x+.5,b.y-(o?1:.3),o?1.5:1,o?1.5:1,b.c); }); }
function dirtBits(x,y){ for(let i=0;i<10;i++) bits.push({x,y:y-2,vx:rnd(-20,20),vy:rnd(-34,-14),t:rnd(.4,.8),c:pick(['#7a5a3e','#6fae4a','#a88a5c','#5f8f40'])}); }
function pullWeed(w){ const i=S.weeds.indexOf(w); if(i<0) return; sfx('pop'); buzz(8); S.weeds.splice(i,1); S.tot.weeds=(S.tot.weeds||0)+1; const [x,y]=weedPos(w); dirtBits(x,y);
  floats.push({x:x-4,y:y-10,txt:'✿',t:.9}); hoverW=null; save(); hudSlow(); if(S.tot.weeds===1) toast(L("Nhổ cỏ! Vườn sạch thì khách thích hơn"),'good'); }
function clearScene(){ ents=ents.filter(e=>e.kind==='walker'); queue=[]; tasks=[]; crew.forEach(m=>{ m.home=true; m.ent=null; m.task=null; }); seats.forEach(s=>s.who=null); bikes=bikes.filter(b=>b.st==='pass'); floats=[]; hoverE=null; }
function hourS(){ const u=Math.random(); let m=7.4,s=1.1; if(u>.4&&u<=.62){m=12.3;s=1.2;} else if(u>.62){m=cfg().loc==='truong'?16.5:19;s=1.6;} let h=m+gauss()*s; if(h>19.6) h=rnd(16.5,19.6); return clamp(h,6.1,19.6); } // khách cuối tới trước 19h30 cho kịp ngồi trước khi tối
function startPlay(r,done,fast){
  buildSeats(); clearScene(); clock=6; rain=false; outage=false;
  const p={open:r.open,done,phase:'day',sched:[],day:r.day,ct:0,fast};
  if(r.open){
    const vis=r.cups?Math.round(clamp(r.cups/6,4,6+seats.length*.9)):0, w=vis?r.cups*r.price/vis:0;
    for(let i=0;i<vis;i++) p.sched.push({h:hourS(),fn:()=>spawnCust({worth:w})});
    const dv=Math.min(r.del,3), dw=dv?r.del*r.price/dv:0;
    for(let i=0;i<dv;i++) p.sched.push({h:hourS(),fn:()=>spawnBike(true,dw)});
    for(let i=0;i<Math.min(r.lost,3);i++) p.sched.push({h:hourS(),fn:()=>spawnCust({lost:true,why:r.lostWhy})});
  } else if(!fast) p.sched.push({h:6.2,fn:()=>toast(L("Hôm nay quán nghỉ bán"))});
  if(r.rain) p.sched.push({h:15,fn:()=>rain=true});
  let ih=null,k=0;
  r.ev.forEach(([cls,txt,tag],i)=>{
    let h=7+i*1.6;
    if(tag==='rain') h=15;
    if(tag==='outage'){ h=12; p.sched.push({h,fn:()=>outage=true}); p.sched.push({h:16,fn:()=>outage=false}); }
    if(tag==='insp'){ ih=14; h=14; p.sched.push({h,fn:spawnOfficers}); }
    else if(ih!==null&&tag==='inspR') h=ih+1.2+(k++)*1.1;
    if(!fast||cls) p.sched.push({h:h+.01,fn:()=>toast(txt,cls)});
  });
  if(r.open&&per&&per.anim&&Math.random()<.22) p.sched.push({h:rnd(8,16.5),fn:()=>sevStart(pickSev())});
  p.sched.sort((a,b)=>a.h-b.h); play=p;
}
function closeDay(){ play.phase='close'; play.ct=play.fast&&speed>=4?.6:2.8; tasks=[];
  ents.forEach(e=>{ if(e.kind==='staff'&&e.st!=='ret'){ const [ex,ey]=exitPt(); e.st='ret'; e.path=route(e.x,e.y,ex,ey); } }); }
// hết ngày: mờ dần sang cảnh mới thay vì cắt ngang (người không "biến mất" trước mắt)
function finish(){ if(!play||play.ending) return; play.ending=true; const cb=play.done; fadeSwap(()=>{ play=null; sev=null; $('sevBar').hidden=true; idle(true); cb&&cb(); },1.3); }
function fadeSwap(fn,sl){ const el=$('fade'), ms=(sl||.38)*1000; el.style.transitionDuration=(sl||.38)+'s'; el.classList.add('on');
  setTimeout(()=>{ fn(); setTimeout(()=>{ el.classList.remove('on'); setTimeout(()=>el.style.transitionDuration='',ms); },sl?250:60); },ms); }
function idle(morning){
  tkey=''; buildSeats(); clearScene(); if(!edit) clock=morning?6.7:IDLE_CLOCK; rain=false; outage=false;
  if(cfg().open&&!morning){ const n=Math.round(seats.length*clamp(.3+(S?S.fans:0)/250,.3,.75));
    [...seats].sort(()=>Math.random()-.5).slice(0,n).forEach((s,i)=>{ let e; if(i%2===0&&S){ const id=pickVil(); e=id?vilEnt(id):mk('c'); } else e=mk('c'); e.x=s.x; e.y=s.y; e.st='idle'; e.t=rnd(1,9)*HOUR; e.seat=s; e.f=s.f; s.who=e; ents.push(e); }); }
}
function refreshScene(){ if(play) return; const c=cfg(), k=c.open+'|'+c.loc+'|'+!!S; if(k!==ikey){ ikey=k; idle(); } }
