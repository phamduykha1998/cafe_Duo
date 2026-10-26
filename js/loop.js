// Khung hình (ngang/dọc), vòng lặp vẽ mỗi khung hình
// cầm dọc: khung = cả màn hình, canvas cận cảnh nằm giữa HUD và thanh nút, camX là điểm giữa khung nhìn (toạ độ thế giới)
let TALL=false, zoomAll=false, camX=200, pan=null, viewW=0;
const COARSE=matchMedia('(pointer:coarse)').matches;
function fit(){ if(!innerWidth||!innerHeight) return; const f=$('frame');
  TALL=innerHeight>innerWidth&&innerWidth<=820; document.body.classList.toggle('port',TALL);
  if(TALL){ VW=W; OX=0; cv.width=VW*2; cv.height=H*2; bgKey=''; f.style.width=innerWidth+'px'; f.style.height=innerHeight+'px'; place(); return; }
  cv.removeAttribute('style'); $('bZoom').hidden=true;
  VW=Math.round(clamp(H*innerWidth/innerHeight,W,900)); if(VW%2) VW++; OX=(VW-W)/2; cv.width=VW*2; cv.height=H*2; bgKey='';
  const s=Math.min(innerWidth/VW,innerHeight/H); f.style.width=Math.floor(VW*s)+'px'; f.style.height=Math.floor(H*s)+'px'; }
// khoảng trống quanh cảnh lấy màu của cảnh (tán cây/đường đất ở quê, tường/đường nhựa trên phố) thay vì nền đen
function paintStage(){ const c=isCity(), top=c?'#d9c49a':'#2f4824', bot=c?'#3e3e46':'#6a4528';
  $('stage').style.background=`linear-gradient(${top} 0 50%,${bot} 50% 100%)`; }
function place(){
  paintStage(); if(!TALL) return; const f=$('frame'), fw=f.clientWidth, fh=f.clientHeight, on=id=>!$(id).hidden;
  let top=8, bot=fh-8;
  ['hud','cat'].forEach(id=>{ if(on(id)){ const el=$(id); top=Math.max(top,el.offsetTop+el.offsetHeight+8); } });
  if(on('dock')) bot=Math.min(bot,$('dock').offsetTop-8);
  f.style.setProperty('--hudH',top+'px'); f.style.setProperty('--dockH',(fh-bot)+'px');
  const aw=fw; viewW=aw; const ah=Math.max(120,bot-top), s=Math.min(ah/H,zoomAll?(aw-16)/VW:aw/185), cw=VW*s, ch=H*s, half=aw/2/s;
  camX=cw<=aw?VW/2:clamp(camX,half,VW-half);
  const y=Math.round(top+(ah-ch)/2);
  Object.assign(cv.style,{left:Math.round(aw/2-camX*s)+'px',top:y+'px',width:Math.round(cw)+'px',height:Math.round(ch)+'px'});
  const z=$('bZoom'); z.hidden=!S||!!edit||uiHidden; z.style.top=(y+8)+'px'; z.textContent=zoomAll?L("Phóng to"):L("Xem cả vườn");
}
$('bZoom').onclick=()=>{ zoomAll=!zoomAll; place(); };
addEventListener('resize',fit); document.addEventListener('fullscreenchange',()=>setTimeout(fit,50)); fit();
if(window.ResizeObserver){ const ro=new ResizeObserver(()=>place()); ['hud','dock','cat'].forEach(id=>ro.observe($(id))); }
(()=>{ const b=$('fsBtn'); if(!document.fullscreenEnabled){ b.hidden=true; return; }
  b.onclick=()=>{ const p=document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen(); p&&p.catch&&p.catch(()=>{ b.hidden=true; }); }; })();

function leafSpots(){ if(isCity()) return [[568,206,34]]; const out=[[150,0,120],[150,10,90],[6,30,20],[272,-10,14],[386,-10,14]]; layoutOf().forEach(o=>{ const it=catOf(o.id); if(it.tree==='xoai') out.push([cellX(o.c)+24,cellY(o.r)-64,50]); else if(it.tree==='tre') out.push([cellX(o.c)+16,cellY(o.r)-60,18]); }); return out; }
function frame(now){
  requestAnimationFrame(frame);
  const real=clamp((now-last)/1000,0,.05); last=Math.max(last,now); tt+=real;
  refreshScene();
  const sp=play||qd?speed:1, dt=real*SLOW*(sp>=2?1.3:sp<1?.85:1), cdt=real*SLOW*sp*DAY_K*(sev&&sev.end==null?.2:1), run=!held();
  if(play&&run){ const p=play;
    if(p.phase==='day'){ clock+=cdt/HOUR*(p.open?1:3); while(p.sched.length&&p.sched[0].h<=clock) p.sched.shift().fn(); if(clock>=22){ clock=22; closeDay(); } }
    else { p.ct-=real; if(p.ct<=0) finish(); } }
  if(qd&&run){ qd.t+=real*speed; clock=QD_H[0]+(QD_H[1]-QD_H[0])*Math.min(1,qd.t/QD_S);
    if(qd.t>=QD_S){ const q=qd; qd=null; flipDay(q.r); if(per) per.wait=900/speed; q.done(); } }
  if(pend&&run){ pend.t-=real*1000; if(pend.t<=0){ const f=pend.fn; pend=null; f(); } }
  if(!isCity()&&!rain&&clock>5.5&&clock<17.5&&Math.random()<real*.3) sfx('chirp');
  tBike-=dt; if(tBike<=0){ spawnBike(false); tBike=isCity()?rnd(.25,.8):rnd(1,3); }
  tWalk-=dt; if(tWalk<=0){ const e=mk('walker'), s=Math.random()<.5, x0=s?-12-OX:W+12+OX, x1=s?W+12+OX:-12-OX; e.x=x0; e.y=rnd(307,317); e.st='pass'; e.spd=rnd(22,32);
    // đi lững thững, hơi lượn; thỉnh thoảng dừng trước cổng ngó vào quán
    e.path=[.3,.55,.8].map(f=>[x0+(x1-x0)*f,clamp(e.y+rnd(-4,4),306,318)]); e.path.push([x1,e.y]); e.ox=e.oy=0;
    if(Math.random()<.3){ const i=e.path.findIndex(p=>Math.abs(p[0]-GX)<120); if(i>=0) e.path[i]=[GX+rnd(-30,30),e.path[i][1],rnd(.8,2)]; }
    ents.push(e); tWalk=rnd(2,5); }
  // khách vãng lai khi không chiếu trọn ngày: ra vào thong thả; trong ngày thường đang chạy thì đông hơn và mỗi ly có tiền bay lên
  if(!play&&!edit&&S&&cfg().open){ tAmb-=dt; if(tAmb<=0){ const live=qd&&run; tAmb=live?rnd(1.2,2.4)/speed:rnd(4.5,8); if(ents.filter(e=>e.kind==='c'&&e.st!=='out').length<Math.max(9,seats.length)) spawnCust({worth:live?S.price:0}); } }
  if(cfg().music&&isOpen()){ tNote-=real; if(tNote<=0){ notes.push({x:cartL()+60,y:80,t:2.2}); tNote=1; } }
  const se=seasonNow();
  if(Math.random()<(se===2?.45:.22)){ const sp=pick(leafSpots()); leaves.push({x:sp[0]+rnd(-sp[2],sp[2]),y:sp[1]+rnd(-6,8),vx:rnd(-6,-14),vy:rnd(8,16),t:rnd(4,8),c:pick(se===2?['#e0a03a','#c8742e','#d9be4e','#86a23c']:se===0&&tetNear(curDay())?['#ffd23f','#f8bccb','#a6d672']:LEAF[se].slice(1))}); }
  leaves.forEach(p=>{ p.t-=real; p.x+=(p.vx+Math.sin(tt*2+p.y)*6)*real; p.y+=p.vy*real; }); leaves=leaves.filter(p=>p.t>0&&p.y<300);
  bits.forEach(b=>{ b.t-=real; b.x+=b.vx*real; b.y+=b.vy*real; b.vy+=90*real; }); bits=bits.filter(b=>b.t>0);
  dispatch(dt); update(dt); upBikes(dt); upPets(real*.8); if(sev&&run) sevTick(real);
  floats.forEach(f=>{f.t-=real;f.y-=real*14;}); floats=floats.filter(f=>f.t>0);
  notes.forEach(n=>{n.t-=real;n.y-=real*9;n.x+=Math.sin(n.t*4)*.35;}); notes=notes.filter(n=>n.t>0);
  if(rain) for(let i=0;i<5;i++) drops.push({x:rnd(-OX,W+OX+80),y:rnd(-10,300),v:rnd(170,230)});
  drops.forEach(d=>{d.y+=d.v*real;d.x-=d.v*real*.3;}); drops=drops.filter(d=>d.y<H);
  serveFx=Math.max(0,serveFx-real);
  draw(); hud();
}
