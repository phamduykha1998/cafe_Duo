// Tình huống hi hữu chạm trực tiếp vào cảnh (gà, trộm, diều, lửa, rắn)
/* ---- tình huống hi hữu: xảy ra ngay trên màn hình, người chơi chạm trực tiếp vào cảnh để xử lý ---- */
// Thỉnh thoảng (khoảng 1 lần mỗi tháng) trong một ngày được chiếu trọn. Đồng hồ trong ngày chậm lại khi đang xử lý.
let sev=null, sevTap=false;
const SEVS={
  ga:{t:L("Gà xổng chuồng!"),how:L("Chạm vào từng con gà để lùa ra khỏi quầy"),dur:9,cond:()=>!isCity(),
    init(z){ const cx=cartL()+70; z.tg=Array.from({length:4},()=>({k:'ga',x:cx+rnd(-30,50),y:rnd(140,180),f:1,col:pick(['#c8742e','#f2ece0','#8a5a2b']),peck:0,hp:1,r:10,vx:0,vy:0,t:0})); },
    move(o,dt){ if(o.hp<=0){ o.x+=o.vx*dt; o.y+=o.vy*dt; return; } o.t-=dt; if(o.t<=0){ o.vx=rnd(-28,28); o.vy=rnd(-12,12); o.t=rnd(.4,1); o.peck=Math.random()<.3?.4:0; }
      o.x=clamp(o.x+o.vx*dt,cartL()+10,cartL()+200); o.y=clamp(o.y+o.vy*dt,134,196); if(Math.abs(o.vx)>1) o.f=o.vx<0?-1:1; if(o.peck>0) o.peck-=dt; },
    draw(o){ chicken(o); }, cy:o=>o.y-5,
    hit(o){ o.hp=0; o.vx=(o.x<GX?-1:1)*rnd(90,130); o.vy=rnd(30,60); o.f=o.vx<0?-1:1; floats.push({x:o.x-4,y:o.y-14,txt:L("Cục tác!"),t:.9}); },
    ok(){ S.rep+=.02; heart('thao',.5); return L("Lùa gà ra vườn gọn gàng, khách cười nghiêng ngả."); },
    fail(){ S.clean-=10; S.cash-=1.5e5; return L("Gà nhảy lên quầy làm đổ ly, vãi đường khắp nơi."); } },
  trom:{t:L("Cướp giật điện thoại!"),how:L("Chạm liên tục vào tên trộm trước khi hắn chạy ra cổng"),dur:8,
    init(z){ const e=mk('c'); e.lk=Object.assign(mkLook('c'),{shirt:'#2b2b33',pants:'#1f1f24',style:'helmet'}); e.spr={};
      const v=ents.find(x=>x.st==='sit'&&x.seat)||null, sx=v?v.x+8:GX-70, sy=v?v.y+4:200; e.x=sx; e.y=sy; e.spd=46; e.pace=1; e.path=[...route(sx,sy,GX,282),[GX,300],[GX+(Math.random()<.5?-1:1)*260,312]];
      if(v){ v.bub=0; floats.push({x:v.x-14,y:v.y-36,txt:L("Cướp! Cướp!"),t:1.6,col:'rgba(255,140,120,A)'}); }
      z.tg=[{k:'trom',e,hp:4,r:13}]; },
    move(o,dt){ const e=o.e; if(o.hp<=0) return; step(e,dt); o.x=e.x; o.y=e.y; if(e.y>296) sevEnd(false); },
    draw(o){ person(o.e); }, cy:o=>o.y-15,
    hit(o){ o.e.x+=rnd(-1.5,1.5); floats.push({x:o.x-3,y:o.y-34,txt:'!',t:.5}); if(o.hp<=0){ o.e.path=[]; o.e.st='mad'; } },
    ok(){ S.rep+=.05; S.fans+=6; heart('dung',1); return L("Bạn tóm được tên trộm, trả điện thoại cho khách. Cả xóm khen quán an toàn."); },
    fail(){ S.rep-=.04; S.fans-=4; return L("Tên trộm phóng xe mất hút. Khách mất điện thoại, quán mang tiếng."); } },
  dieu:{t:L("Diều đứt dây!"),how:L("Chạm vào con diều trước khi nó bay khỏi vườn"),dur:7,
    init(z){ const l=Math.random()<.5; z.tg=[{k:'dieu',x:l?-OX-10:W+OX+10,y:70,vx:(l?1:-1)*rnd(52,66),hp:1,r:14,ph:0}]; },
    move(o,dt){ o.ph+=dt; if(o.hp<=0){ o.y+=40*dt; return; } o.x+=o.vx*dt; o.y=74+Math.sin(o.ph*1.7)*16+o.ph*7; if(o.x<-OX-30||o.x>W+OX+30) sevEnd(false); },
    draw(o){ const x=o.x,y=o.y,w=Math.sin(tt*6)*1.5; g.strokeStyle='rgba(255,255,255,.7)'; g.lineWidth=.5; g.beginPath(); g.moveTo(x,y+7); g.quadraticCurveTo(x-6+w,y+16,x-2,y+26); g.stroke();
      g.fillStyle='#e2574c'; g.beginPath(); g.moveTo(x,y-7); g.lineTo(x+6,y); g.lineTo(x,y+7); g.lineTo(x-6,y); g.closePath(); g.fill();
      g.fillStyle='#ffd166'; g.beginPath(); g.moveTo(x,y-7); g.lineTo(x+6,y); g.lineTo(x,y); g.closePath(); g.fill(); hb(x-.5,y-7,1,14,'#6b4329'); [[-3,20],[1,23],[-2,26]].forEach(([a,b],i)=>hb(x+a+w,y+b-10,2,1,i%2?'#4f86c6':'#ffd166')); },
    cy:o=>o.y, hit(o){ floats.push({x:o.x-8,y:o.y-10,txt:L("Bắt được!"),t:1}); },
    ok(){ const v=pick(VIL); heart(v.id,1); S.fans+=2; return L("Bạn chụp được con diều, trả cho thằng cu nhà {0}. Nó cười toe, cả nhà cảm ơn.",v.n); },
    fail(){ return L("Con diều bay mất hút sau rặng tre. Thằng nhỏ mếu máo."); } },
  chay:{t:L("Bếp than bén lửa!"),how:L("Chạm thật nhanh vào đám lửa để dập"),dur:6,
    init(z){ z.tg=[{k:'chay',x:cartL()+18,y:134,hp:S.docs.pccc&&S.docs.pccc.st==='done'?5:8,r:16,grow:0}]; },
    move(o,dt){ if(o.hp>0) o.grow=Math.min(1,o.grow+dt*.12); },
    draw(o){ if(o.hp<=0){ for(let i=0;i<4;i++){ const k=(tt*.8+i*.25)%1; g.fillStyle=`rgba(200,200,200,${.5*(1-k)})`; g.fillRect(o.x-3+i*2+Math.sin(tt*2+i)*2,o.y-6-k*20,2,2); } return; }
      const n=6+o.hp*2+o.grow*8; for(let i=0;i<n;i++){ const a=(i*2.39+tt*9)%6.28, h=6+((i*37)%9)+o.grow*8, fx=o.x+Math.cos(a)*(3+o.grow*5), fy=o.y-((tt*20+i*7)%h);
        hb(fx,fy,1.5,1.5,i%3===0?'#ffe27a':i%3===1?'#ff9a3a':'#e2463a'); }
      g.globalCompositeOperation='lighter'; glow(o.x,o.y-6,14+o.grow*10,.35); g.globalCompositeOperation='source-over'; },
    cy:o=>o.y-6, hit(o){ for(let i=0;i<6;i++) bits.push({x:o.x,y:o.y-6,vx:rnd(-25,25),vy:rnd(-30,-10),t:rnd(.3,.6),c:'#e8f4ff'}); },
    ok(){ S.rep+=.02; S.clean-=2; return S.docs.pccc&&S.docs.pccc.st==='done'?L("Nhờ bình chữa cháy treo sẵn, lửa tắt trong tích tắc. Khách vỗ tay."):L("Dập được lửa, hú hồn. Mai phải mua bình chữa cháy thôi."); },
    fail(){ S.cash-=1.2e6; S.rep-=.03; S.clean-=10; return L("Lửa cháy xém mái tôn xe cafe, khách tán loạn. Sửa hết 1,2 triệu."); } },
  ran:{t:L("Rắn bò vào vườn!"),how:L("Chạm 2 lần vào con rắn để đuổi đi"),dur:8,cond:()=>!isCity(),
    init(z){ const s=ents.find(x=>x.st==='sit')||{x:GX-80,y:200}; z.tg=[{k:'ran',x:520,y:236,tx:s.x,ty:s.y+6,hp:2,r:12,f:-1}]; },
    move(o,dt){ if(o.hp<=0){ o.x+=o.f*-60*dt; return; } const dx=o.tx-o.x, dy=o.ty-o.y, d=Math.hypot(dx,dy); if(d<4){ sevEnd(false); return; } o.x+=dx/d*16*dt; o.y+=dy/d*16*dt; o.f=dx<0?-1:1; },
    draw(o){ for(let i=0;i<10;i++){ hb(o.x-o.f*i*1.6,o.y+Math.sin(tt*8-i*.9)*1.6,1.8,1.6,i%2?'#3f7a3c':'#6fae4a'); } hb(o.x+o.f*1.5,o.y-.5,2,2,'#3f7a3c'); hb(o.x+o.f*2.5,o.y,.6,.6,'#ffe27a'); if(Math.floor(tt*6)%2) hb(o.x+o.f*4,o.y+.5,1.5,.4,'#e2463a'); },
    cy:o=>o.y, hit(o){ o.f=-o.f; floats.push({x:o.x-6,y:o.y-10,txt:L("Xì!"),t:.7}); },
    ok(){ S.rep+=.02; heart('thao',1); return L("Con rắn nước lủi vô bụi chuối. Chị Thảo bảo: \"Rắn nước hiền thôi, đừng đánh nó.\""); },
    fail(){ S.fans-=4; S.rep-=.02; return L("Khách hét toáng, bỏ dở ly cà phê chạy ra cổng."); } }
};
function pickSev(){ const pool=Object.keys(SEVS).filter(k=>!SEVS[k].cond||SEVS[k].cond()), fresh=pool.filter(k=>k!==(S.lastSev||'')); return pick(fresh.length?fresh:pool); }
function sevStart(kind){
  if(sev||!play||!S) return; const E=SEVS[kind]; sev={kind,t:0,dur:E.dur,b0:snap()}; E.init(sev); S.lastSev=kind;
  $('sevT').textContent='⚠ '+E.t; $('sevH').textContent=E.how; $('sevR').innerHTML=''; $('sevBar').hidden=false; $('sevBar').classList.remove('done');
  if(TALL&&!zoomAll){ camX=sev.tg[0].x; place(); }
  sfx('twist'); buzz([60,40,120]);
}
function sevTick(dt){ const z=sev, E=SEVS[z.kind]; if(z.end!=null){ z.end-=dt; if(z.end<=0){ sev=null; $('sevBar').hidden=true; } return; }
  z.t+=dt; z.tg.forEach(o=>E.move(o,dt)); if(!sev||sev.end!=null) return;
  $('sevTime').style.width=Math.max(0,(1-z.t/z.dur)*100)+'%';
  if(z.tg.every(o=>o.hp<=0)) sevEnd(true); else if(z.t>=z.dur) sevEnd(false); }
function sevEnd(ok){ const z=sev; if(!z||z.end!=null) return; const E=SEVS[z.kind], txt=ok?E.ok():E.fail();
  S.rep=clamp(S.rep,.6,1.7); S.clean=clamp(S.clean,0,100); S.fans=Math.max(0,S.fans);
  addLog(S.day,`${E.t.replace('!','')}: ${ok?L("xử lý kịp"):L("không kịp")}`,ok?'good':'bad');
  $('sevT').textContent=ok?L("✓ Xử lý kịp!"):L("✗ Không kịp rồi…"); $('sevH').textContent=txt; $('sevR').innerHTML=fxChips(z.b0,snap()); $('sevBar').classList.add('done');
  if(ok){ sfx('cash'); buzz([30,30,60]); } else { sfx('bad'); buzz(120); }
  if(z.kind==='trom'){ const e=z.tg[0].e; if(ok){ e.st='out'; e.spd=26; e.path=exitPath(e); ents.push(e); } }
  z.end=3.2; save(); hudSlow(); }
function sevDraw(){ if(!sev) return; sev.tg.forEach(o=>SEVS[sev.kind].draw(o)); }
function sevRings(){ if(!sev||sev.end!=null) return; const E=SEVS[sev.kind];
  sev.tg.forEach(o=>{ if(o.hp<=0) return; const r=o.r+Math.sin(tt*8)*1.5; g.strokeStyle='rgba(255,236,120,.95)'; g.lineWidth=.8; g.setLineDash([2,2]); g.beginPath(); g.arc(o.x,E.cy(o),r,0,7); g.stroke(); g.setLineDash([]);
    if(o.hp>1){ g.font='bold 6px "Pixelify Sans",monospace'; g.fillStyle='#fff6c8'; g.fillText('×'+o.hp,o.x+r-2,E.cy(o)-r+2); } }); }
function sevHit(wx,wy){ if(!sev||sev.end!=null) return false; const E=SEVS[sev.kind];
  const o=sev.tg.find(o=>o.hp>0&&Math.hypot(wx-o.x,wy-E.cy(o))<=o.r+(COARSE?6:2)); if(!o) return false;
  o.hp--; E.hit(o); sfx('pop'); buzz(15); return true; }
