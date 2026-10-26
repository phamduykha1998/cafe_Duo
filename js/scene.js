// Vẽ cảnh: lưới vườn, người, cây, phố, nền, xe cafe, đồ trong vườn, ánh sáng, bóng, phản chiếu
/* ================= CẢNH ================= */
const W=600,H=338,cv=$('scene'); let g=cv.getContext('2d'); let VW=600,OX=0; cv.width=W; cv.height=H;
const HOUR=1.6, SLOW=0.7, GX=304;
const SH=['#e2574c','#4f86c6','#f2c14e','#6fbf73','#ece6d8','#9b6cc4','#f08a4b','#3b3b45','#5ec4c4','#e889a8','#f4f1ea','#7a9a5a'],PT=['#2f3542','#4a3b2f','#1f2a44','#6b6b6b','#7a5c3e','#3d5a80'],
      BK=['#c0392b','#2c3e50','#ecf0f1','#2980b9','#8e44ad','#16a085','#d35400','#e0b030'];
const rnd=(a,b)=>a+Math.random()*(b-a), pick=a=>a[Math.floor(Math.random()*a.length)];
const gauss=()=>{let u=0;for(let i=0;i<4;i++)u+=Math.random();return (u-2)/.58;};
const bx=(x,y,w,h,c,ctx)=>{ctx=ctx||g;ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),w,h);};
const ob=(x,y,w,h,c,ctx)=>{bx(x-1,y-1,w+2,h+2,OUT,ctx);bx(x,y,w,h,c,ctx);};
const hb=(x,y,w,h,c)=>{ g.fillStyle=c; g.fillRect(Math.round(x*2)/2,Math.round(y*2)/2,w,h); };
const hob=(x,y,w,h,c)=>{ hb(x-.5,y-.5,w+1,h+1,OUT); hb(x,y,w,h,c); };
function cfg(){ return S || {loc:setup.loc,eq:setup.eq,walk:false,music:false,open:true,staff:1,price:LOCS.find(l=>l.id===setup.loc).ref,day:0,layout:DEFAULT_LAYOUT,cart:1,weeds:DEMO_WEEDS}; }
const seasonNow=()=>seasonOf(dateOf(curDay()));

/* ---- lưới vườn ---- */
const G0X=16,G0Y=64,CS=16,GC=36,GR=14;
const CAT=[
  {id:'ghe',n:L("Bàn gỗ thấp, ghế nhựa"),w:2,h:1,cost:.3e6,beauty:0,seats:2},
  {id:'du',n:L("Bàn dù che nắng"),w:2,h:1,cost:.9e6,beauty:2,seats:2},
  {id:'tbl',n:L("Bàn tre 2 đôn"),w:2,h:1,cost:1.2e6,beauty:1,seats:2},
  {id:'vong',n:L("Võng dù"),w:2,h:1,cost:.6e6,beauty:2,seats:1},
  {id:'choi',n:L("Chòi lá"),w:3,h:2,cost:5e6,beauty:4,seats:2},
  {id:'lantern',n:L("Đèn lồng"),w:1,h:1,cost:.3e6,beauty:2},
  {id:'chau',n:L("Chậu hoa giấy"),w:1,h:1,cost:.2e6,beauty:1},
  {id:'lu',n:L("Lu nước"),w:1,h:1,cost:.4e6,beauty:1},
  {id:'herb',n:L("Luống rau thơm"),w:2,h:1,cost:.15e6,beauty:1},
  {id:'chuoi',n:L("Bụi chuối"),w:2,h:1,cost:.3e6,beauty:2,tree:'chuoi'},
  {id:'tre',n:L("Khóm tre"),w:2,h:1,cost:.8e6,beauty:3,tree:'tre',sc:.75},
  {id:'mai',n:L("Cây mai vàng"),w:2,h:1,cost:2e6,beauty:4,tree:'mai'},
  {id:'xoai',n:L("Cây xoài to"),w:3,h:2,cost:4e6,beauty:6,tree:'xoai'},
  {id:'ao',n:L("Ao sen nhỏ"),w:3,h:2,cost:3.5e6,beauty:5}
];
const catOf=id=>CAT.find(c=>c.id===id);
const DEFAULT_LAYOUT=[{id:'ghe',c:5,r:7},{id:'du',c:9,r:7},{id:'tbl',c:13,r:10},{id:'ghe',c:21,r:7},{id:'du',c:26,r:6},{id:'vong',c:9,r:12},
  {id:'chuoi',c:33,r:6},{id:'chuoi',c:22,r:12},{id:'lantern',c:16,r:8},{id:'lantern',c:19,r:8},{id:'herb',c:12,r:13,d:-6},{id:'lu',c:23,r:9},{id:'chau',c:20,r:5},{id:'chau',c:15,r:6}];
// vùng trang trí cố định trên nền: ao + cầu gỗ, luống rau có rào, góc rửa + xe máy
function decorCell(c,r){ if(S&&S.city) return cityDecor(c,r); return (c>=25&&r>=9)||(c<=7&&r>=11)||(c<=2&&r>=6&&r<=8); }
const DEMO_WEEDS=(()=>{ const out=[], s=srand(5); for(let i=0;i<20&&out.length<14;i++){ const w={c:Math.floor(s()*GC),r:6+Math.floor(s()*8),k:Math.floor(s()*5),d:-9,ox:Math.round(s()*6-3),oy:Math.round(s()*4-2)}; if(!decorCell(w.c,w.r)&&w.c!==17&&w.c!==18) out.push(w); } return out; })();
function layoutOf(){ return cfg().layout||DEFAULT_LAYOUT; }
function weedsOf(){ return cfg().weeds||[]; }
function cartC(){ const c=cfg(); return c.cart!=null?c.cart:1; }
function cartL(){ return cellX(cartC()); }
function laneSpan(cc){ const mid=cc+3; return [Math.min(mid,17),Math.max(mid,18)]; }
function blockedCell(c,r,cc){
  if(c<0||r<0||c>=GC||r>=GR) return true;
  cc=cc==null?cartC():cc;
  if(c>=cc&&c<=cc+6&&r<=3) return true;
  const [l0,l1]=laneSpan(cc); if(r>=4&&r<=5&&c>=l0&&c<=l1) return true;
  if((c===17||c===18)&&r>=4) return true;
  return decorCell(c,r);
}
function cartFits(cc){ if(cc<0||cc+6>=GC) return false; const [l0,l1]=laneSpan(cc);
  return !layoutOf().some(o=>{ const it=catOf(o.id); for(let y=o.r;y<o.r+it.h;y++) for(let x=o.c;x<o.c+it.w;x++){ if((x>=cc&&x<=cc+6&&y<=3)||(y>=4&&y<=5&&x>=l0&&x<=l1)) return true; } return false; }); }
function fits(id,c,r,ignore){
  const it=catOf(id);
  for(let y=r;y<r+it.h;y++) for(let x=c;x<c+it.w;x++){ if(blockedCell(x,y)) return false;
    if(layoutOf().some(o=>o!==ignore&&x>=o.c&&x<o.c+catOf(o.id).w&&y>=o.r&&y<o.r+catOf(o.id).h)) return false; }
  return true;
}
function itemAt(c,r){ return layoutOf().find(o=>c>=o.c&&c<o.c+catOf(o.id).w&&r>=o.r&&r<o.r+catOf(o.id).h); }
function seatCount(){ return layoutOf().reduce((s,o)=>s+(catOf(o.id).seats||0),0); }
function herbStage(o){ const d=curDay()-(o.d||0); return d>=5?3:d>=3?2:d>=1?1:0; }
function herbBeds(){ return S.layout.filter(o=>o.id==='herb'&&S.day-(o.d||0)>=5).length; }
const cellX=c=>G0X+c*CS, cellY=r=>G0Y+r*CS;
function clearWeedsUnder(o){ if(!S) return; const it=catOf(o.id); S.weeds=S.weeds.filter(w=>!(w.c>=o.c&&w.c<o.c+it.w&&w.r>=o.r&&w.r<o.r+it.h)); }
function addWeeds(n){ if(!S||S.city) return; for(let i=0;i<n;i++){ if(S.weeds.length>=45) return;
  for(let t=0;t<40;t++){ const c=Math.floor(R()*GC), r=Math.floor(R()*GR); if(blockedCell(c,r)||itemAt(c,r)||S.weeds.some(w=>w.c===c&&w.r===r)) continue;
    S.weeds.push({c,r,k:Math.floor(R()*5),d:S.day,ox:Math.round(R()*6-3),oy:Math.round(R()*4-2)}); break; } } }

/* --- Sprite người: 36x64 pixel art chi tiết (vẽ nửa kích thước = 18x32 world), cache theo look --- */
const OUT='#2b1d16', SW=36, SHH=64, SHOES=['#5a3a26','#2b2b2b','#efe8dc','#8a3030','#3b4f7a','#c98b4a'];
const SKIN=['#f7d3b0','#eebf98','#d39a6e','#a86e48'];
const HAIRS=['#2a1e1a','#3d2a1e','#5c3b22','#1b1b22','#7a4a26','#c46b2d','#e0c07a'];
const IRIS=['#3a2418','#241812','#4a3020','#2a2a3a'];
function shade(hex,f){ const n=parseInt(hex.slice(1,7),16); const ch=v=>Math.max(0,Math.min(255,Math.round(v*f))); return '#'+((1<<24)+(ch(n>>16)<<16)+(ch(n>>8&255)<<8)+ch(n&255)).toString(16).slice(1); }
function mkLook(kind,o={}){
  const style=kind==='driver'?'helmet':kind==='officer'?'officer':pick(['short','short','long','long','bun','spiky','cap','nonla','nonla','pony','pony','khan']);
  return Object.assign({kind,style,skin:pick(SKIN),hair:Math.random()<.85?pick(HAIRS.slice(0,5)):pick(HAIRS),iris:pick(IRIS),
    shirt:kind==='driver'?'#e07a2a':kind==='officer'?'#c9b37a':pick(SH),pants:kind==='officer'?'#3d4a33':pick(PT),
    shoes:pick(SHOES),cap:kind==='driver'?'#e07a2a':pick(BK),stripe:kind==='c'&&Math.random()<.28,buttons:Math.random()<.4,apron:false},o);
}
function buildSprite(lk,dir,fr,pose){
  const cv2=document.createElement('canvas'); cv2.width=SW; cv2.height=SHH; const c=cv2.getContext('2d');
  const p=(x,y,w,h,col)=>{ if(w<=0||h<=0) return; c.fillStyle=col; c.fillRect(Math.round(x),Math.round(y)+4,Math.round(w),Math.round(h)); };
  const el=(cx,cy,rx,ry,col)=>{ c.fillStyle=col; for(let y=Math.ceil(-ry);y<=Math.floor(ry);y++){ const w=rx*Math.sqrt(Math.max(0,1-(y*y)/(ry*ry))); const x0=Math.round(cx-w), x1=Math.round(cx+w); if(x1>x0) c.fillRect(x0,Math.round(cy+y)+4,x1-x0,1); } };
  const sit=pose==='sit', side=dir==='s', back=dir==='u', F=dir==='d', dy=sit?6:0;
  const sk=lk.skin, skS=shade(sk,.82), skD=shade(sk,.68), skH=shade(sk,1.07);
  const sh=lk.shirt, shS=shade(sh,.72), shD=shade(sh,.55), shH=shade(sh,1.22);
  const pt=lk.pants, ptS=shade(pt,.68), ptH=shade(pt,1.25), so=lk.shoes, soH=shade(so,1.45), soD=shade(so,.55);
  const h=lk.hair, hS=shade(h,.6), hH=shade(h,1.7);
  const lift1=fr===1, lift2=fr===2;

  if(sit){
    p(13,46,14,6,pt); p(13,50,14,2,ptS); p(14,46,10,1,ptH);
    p(23,50,6,6,pt); p(27,50,2,6,ptS);
    p(22,55,10,3,so); p(23,55,5,1,soH); p(22,57,10,1,soD);
  } else if(side){
    const a=fr===1?-3:fr===2?3:0;
    p(15+a,46,6,8,ptS); p(15+a,54,8,3,shade(so,.75)); p(15+a,56,8,1,soD);
    p(15-a,46,6,8,pt); p(15-a,46,2,8,ptH); p(15-a,54,8,3,so); p(16-a,54,4,1,soH); p(15-a,56,8,1,soD);
    p(13,41,10,6,pt); p(13,41,10,2,shade(pt,.5));
  } else {
    const lh=lift1?2:0, rh=lift2?2:0;
    p(12,46,6,8-lh,pt); p(12,46,2,8-lh,ptH); p(16,46,2,8-lh,ptS);
    p(19,46,6,8-rh,pt); p(19,46,1,8-rh,ptH); p(23,46,2,8-rh,ptS);
    p(11,54-lh,7,3,so); p(12,54-lh,3,1,soH); p(11,56-lh,7,1,soD);
    p(19,54-rh,7,3,so); p(20,54-rh,3,1,soH); p(19,56-rh,7,1,soD);
    p(11,41,14,6,pt); p(11,45,14,1,ptS); p(18,43,1,3,ptS);
    p(11,41,14,2,shade(pt,.5)); if(!back) p(17,41,3,2,'#d9b45a');
  }

  const T=29+dy;
  if(side){
    el(18,T+2,5.5,3,sh); p(13,T+1,10,12,sh); p(13,T+1,2,12,shS); p(21,T+1,2,12,shH); p(13,T+11,10,2,shS);
    if(lk.stripe){ p(13,T+4,10,1,shH); p(13,T+7,10,1,shH); p(13,T+10,10,1,shH); }
    if(lk.apron){ p(19,T+4,5,9,'#6b4329'); p(19,T+4,5,1,'#9a6a3c'); }
  } else {
    el(18,T+2,9,3.2,sh); p(10,T+1,16,12,sh);
    p(10,T+1,3,11,shH); p(23,T+1,3,12,shS); p(10,T+11,16,2,shS); p(17,T+6,1,5,shS);
    if(lk.stripe){ [T+4,T+7,T+10].forEach(y=>p(10,y,16,1,shH)); }
    if(F){
      p(15,T-2,6,3,skS); p(16,T+1,4,2,skS); p(15,T,1,2,shH); p(20,T,1,2,shH); p(14,T,1,1,shD); p(21,T,1,1,shD);
      if(lk.buttons&&!lk.apron){ p(18,T+4,1,1,shD); p(18,T+7,1,1,shD); p(18,T+10,1,1,shD); }
      if(lk.apron){ p(12,T+4,12,9,'#6b4329'); p(12,T+4,12,1,'#9a6a3c'); p(13,T-1,2,5,'#6b4329'); p(21,T-1,2,5,'#6b4329'); p(15,T+8,6,3,'#5a3720'); p(15,T+8,6,1,'#7d5030'); }
      if(lk.style==='officer'){ p(10,T+1,4,2,'#3d4a33'); p(22,T+1,4,2,'#3d4a33'); p(20,T+4,2,2,'#e8c547'); }
    } else { p(13,T,10,2,shS); }
  }

  if(side){
    if(sit){ p(17,T+5,4,5,shS); p(18,T+9,9,3,sk); p(18,T+11,9,1,skS); el(28,T+10,2.2,2,sk); }
    else { const s=fr===1?3:fr===2?-3:0;
      p(16+s*.3,T+1,4,7,shS); p(16+s*.3,T+1,1,7,shD); p(16+s*.6,T+8,4,4,sk); p(19+s*.6,T+8,1,4,skS); el(18+s,T+13,2.2,2.2,sk); }
  } else {
    const sw=sit?0:(lift1?1:lift2?-1:0);
    p(6,T+1+sw,4,7,sh); p(6,T+1+sw,1,7,shH); p(9,T+1+sw,1,7,shS); p(6,T+8+sw,4,4,sk); p(9,T+8+sw,1,4,skS); el(8,T+13+sw,2.2,2.2,sk);
    p(26,T+1-sw,4,7,sh); p(29,T+1-sw,1,7,shD); p(26,T+8-sw,4,4,skS); el(28,T+13-sw,2.2,2.2,skS);
  }

  const Y=16+dy;
  if(side){
    p(17,Y+8,4,5,skS);
    el(19,Y,9,9.5,skS); el(18.3,Y-.8,8.4,8.7,sk); el(14.5,Y-3,2.5,2,skH);
    el(27.6,Y+3,1.6,1.3,sk); p(27,Y+4,2,1,skS);
    el(14.5,Y+2,2,2.6,skS); p(14,Y+1,1,3,skD);
    if(!back){ p(22,Y+1,3,4,'#fff'); p(23,Y+1,2,4,lk.iris); p(24,Y+1,1,1,'#fff'); p(22,Y,3,1,OUT); p(22,Y-2,4,1,hS);
      p(24,Y+7,3,1,'#a8524a'); p(21,Y+5,3,1,'#f2a091'); }
  } else {
    p(16,Y+8,4,5,skS);
    el(18,Y,9.6,9.6,skS); el(17.4,Y-.8,9,9,sk); el(13.5,Y-3,2.6,2,skH);
    el(8.4,Y+2,1.6,2.6,sk); el(27.6,Y+2,1.6,2.6,skS);
    if(F){
      p(12,Y+1,4,4,'#fff'); p(13,Y+1,3,4,lk.iris); p(13,Y+1,1,1,'#fff'); p(15,Y+4,1,1,shade(lk.iris,1.6)); p(12,Y,4,1,OUT);
      p(20,Y+1,4,4,'#fff'); p(20,Y+1,3,4,lk.iris); p(22,Y+1,1,1,'#fff'); p(20,Y+4,1,1,shade(lk.iris,1.6)); p(20,Y,4,1,OUT);
      p(12,Y-2,4,1,hS); p(20,Y-2,4,1,hS);
      p(18,Y+5,1,1,skD); p(16,Y+7,4,1,'#a8524a'); p(17,Y+8,2,1,'#d97a6c');
      p(10,Y+5,3,1,'#f2a091'); p(23,Y+5,3,1,'#f2a091');
      if(lk.old){ p(11,Y+6,3,1,skS); p(22,Y+6,3,1,skS); p(15,Y-4,6,1,skS); }
    }
  }

  const st=lk.style;
  const capTop=()=>{
    if(F){ el(18,Y-6,10.6,6.4,h); p(8,Y-6,3,11,h); p(25,Y-6,3,11,h);
      [[10,3],[13,2],[16,3],[20,2],[23,3]].forEach(([x,l])=>{ p(x,Y-1,3,l,h); p(x+1,Y-1+l,1,1,h); });
      p(13,Y-11,7,1,hH); p(11,Y-10,3,1,hH); p(20,Y-11,2,1,hH);
      [12,16,21,25].forEach(x=>p(x,Y-8,1,5,hS)); p(8,Y-2,1,6,hS); p(27,Y-2,1,6,hS); }
    else if(back){ el(18,Y-1,10.6,10.6,h); p(9,Y+4,18,5,h); p(10,Y+8,16,1,hS);
      [11,14,18,22,25].forEach(x=>p(x,Y-6,1,12,hS)); p(13,Y-10,8,1,hH); p(12,Y-9,2,1,hH); }
    else { el(17,Y-6,10,6,h); p(9,Y-6,9,13,h); p(22,Y-3,6,2,h); p(25,Y-1,2,2,h); p(17,Y-2,2,5,h);
      [11,14].forEach(x=>p(x,Y-5,1,11,hS)); p(13,Y-11,7,1,hH); p(11,Y-10,3,1,hH); p(9,Y+6,8,1,hS); }
  };
  if(st==='helmet'){ const cc=lk.cap, cS=shade(cc,.7), cH=shade(cc,1.45);
    if(F){ el(18,Y-3,11,10,cc); p(9,Y-1,18,5,'#25323c'); p(11,Y,5,1,'#6c8899'); p(12,Y+1,2,1,'#6c8899'); p(13,Y-11,6,2,cH); p(26,Y-6,2,10,cS); p(9,Y+5,1,5,'#333'); p(26,Y+5,1,5,'#333'); }
    else if(back){ el(18,Y-2,11,11,cc); p(13,Y-11,6,2,cH); p(9,Y+5,18,2,cS); }
    else { el(17.5,Y-3,10.5,10,cc); p(22,Y-1,8,5,'#25323c'); p(24,Y,3,1,'#6c8899'); p(12,Y-11,6,2,cH); p(8,Y-3,2,9,cS); }
  } else if(st==='nonla'){ capTop();
    for(let i=0;i<13;i++){ const w=2+i*2.6; p(18-w/2,Y-16+i,w,1,i%3===2?'#c4ab70':'#e6d29a'); }
    p(1,Y-3,34,2,'#c4ab70'); p(3,Y-1,30,1,'#9e8650'); p(14,Y-14,2,1,'#fff6d8'); p(12,Y-12,3,1,'#fff6d8');
    if(F){ p(9,Y+1,1,10,'#c9b48a'); p(26,Y+1,1,10,'#c9b48a'); }
  } else if(st==='officer'){ capTop(); const cc='#4a5a3c';
    if(F){ el(18,Y-8,10.5,5,cc); p(8,Y-8,20,4,cc); p(8,Y-5,20,2,'#2f3a26'); p(9,Y-3,18,2,'#1f271a'); el(18,Y-8,2,2,'#e8c547'); p(12,Y-12,5,1,shade(cc,1.4)); }
    else if(back){ el(18,Y-8,10.5,5.5,cc); p(8,Y-5,20,2,'#2f3a26'); }
    else { el(17,Y-8,10,5,cc); p(8,Y-5,19,2,'#2f3a26'); p(22,Y-3,9,2,'#1f271a'); el(22,Y-9,1.6,1.6,'#e8c547'); }
  } else if(st==='army'){ capTop(); const cc='#6f7d3c', cS=shade(cc,.7), cH=shade(cc,1.3);
    if(F){ el(18,Y-7,11,7,cc); p(5,Y-3,26,2,cS); p(6,Y-4,24,1,cc); p(12,Y-12,6,1,cH); p(16,Y-9,4,4,'#e8c547'); p(17,Y-8,2,2,'#d93a2c'); }
    else if(back){ el(18,Y-7,11,7,cc); p(5,Y-3,26,2,cS); p(13,Y-12,6,1,cH); }
    else { el(17,Y-7,11,7,cc); p(4,Y-3,28,2,cS); p(12,Y-12,6,1,cH); p(24,Y-8,2,3,'#e8c547'); }
  } else {
    if(st==='long'){
      if(F){ p(6,Y-6,5,23,h); p(25,Y-6,5,23,h); p(7,Y+17,3,2,h); p(26,Y+17,3,2,h); p(8,Y-2,1,18,hS); p(27,Y-2,1,18,hS); }
      else if(back){ el(18,Y+6,11,15,h); [11,15,19,23].forEach(x=>p(x,Y,1,18,hS)); p(12,Y+20,12,1,hS); }
      else { p(7,Y-6,11,24,h); p(8,Y+18,8,2,h); [9,12,15].forEach(x=>p(x,Y,1,17,hS)); }
    }
    if(st==='pony'){
      if(F){ p(28,Y-4,4,17,h); p(29,Y+13,2,3,h); p(30,Y-2,1,13,hS); p(27,Y-5,3,2,'#c4473a'); }
      else if(back){ p(16,Y+6,5,16,h); p(17,Y+22,3,2,h); p(18,Y+8,1,12,hS); p(15,Y+5,7,2,'#c4473a'); }
      else { p(4,Y-3,6,16,h); p(5,Y+13,4,3,h); p(6,Y-1,1,13,hS); p(8,Y-4,3,2,'#c4473a'); }
    }
    capTop();
    if(st==='bun'){ if(side){ el(8,Y-6,5,5,h); p(6,Y-9,3,1,hH); p(11,Y-8,2,5,'#c4473a'); } else { el(18,Y-16,5.5,4.5,h); p(16,Y-19,4,1,hH); p(13,Y-13,10,2,lk.old?'#6b4329':'#c4473a'); p(17,Y-16,1,3,hS); } }
    if(st==='spiky'){ [9,13,17,21,25].forEach((x,i)=>{ const t=Y-14-(i%2)*2; p(x,t,3,4,h); p(x+1,t-2,1,2,h); }); }
    if(st==='cap'){ const cc=lk.cap, cS=shade(cc,.62), cH=shade(cc,1.4);
      if(F){ el(18,Y-8,10.6,5.4,cc); p(7,Y-8,22,3,cc); p(6,Y-5,24,2,cS); p(7,Y-5,22,1,shade(cc,.8)); p(12,Y-12,5,1,cH); p(17,Y-14,2,1,cS); el(18,Y-9,2,1.5,'#fff6ea'); }
      else if(back){ el(18,Y-8,10.6,5.6,cc); p(14,Y-4,8,2,cS); p(16,Y-4,4,1,'#fff6ea'); }
      else { el(17,Y-8,9.6,5.4,cc); p(8,Y-8,19,3,cc); p(22,Y-5,10,2,cS); p(12,Y-12,5,1,cH); } }
    if(st==='band'){ const cc=lk.cap;
      if(back){ p(8,Y-5,20,2,cc); p(16,Y-3,2,6,cc); p(19,Y-3,2,5,cc); } else if(side){ p(8,Y-5,19,2,cc); p(5,Y-4,4,2,cc); p(4,Y-2,3,3,cc); } else { p(8,Y-5,20,2,cc); p(8,Y-5,20,1,shade(cc,1.3)); } }
    if(st==='khan'){ const cc=lk.cap, cD=shade(cc,.7);
      if(F){ el(18,Y-7,11.5,6.5,cc); p(7,Y-7,22,5,cc); p(7,Y-3,2,9,cc); p(27,Y-3,2,9,cc); p(9,Y-3,18,1,cD); [[12,Y-9],[18,Y-10],[23,Y-8],[15,Y-6]].forEach(([a,b])=>p(a,b,1,1,'#fff6e3')); }
      else if(back){ el(18,Y-2,11,10,cc); p(14,Y+6,8,5,cc); p(16,Y+10,4,3,cD); }
      else { el(17,Y-6,11,7,cc); p(8,Y-7,20,5,cc); p(6,Y-3,5,10,cc); p(6,Y+6,4,2,cD); } }
  }
  if(lk.flower&&!back){ const fx=F?24:10, fy=Y-7; p(fx,fy,3,3,'#f07aa8'); p(fx+1,fy-1,1,1,'#f07aa8'); p(fx+1,fy+1,1,1,'#ffe27a'); }
  if(lk.glasses&&!back){
    if(F){ [11,19].forEach(gx=>{ p(gx,Y,6,1,OUT); p(gx,Y+5,6,1,OUT); p(gx,Y,1,6,OUT); p(gx+5,Y,1,6,OUT); }); p(17,Y+1,2,1,OUT); }
    else { p(21,Y,5,1,OUT); p(21,Y+5,5,1,OUT); p(21,Y,1,6,OUT); p(25,Y,1,6,OUT); p(14,Y+1,7,1,OUT); } }

  const im=c.getImageData(0,0,SW,SHH), d=im.data, o=new Uint8ClampedArray(d);
  const at=(x,y)=>(x>=0&&y>=0&&x<SW&&y<SHH&&d[(y*SW+x)*4+3]>0)?(y*SW+x)*4:-1;
  for(let y=0;y<SHH;y++) for(let x=0;x<SW;x++){ const i=(y*SW+x)*4; if(d[i+3]) continue;
    const n=[at(x,y+1),at(x-1,y),at(x+1,y),at(x,y-1)].find(k=>k>=0); if(n===undefined) continue;
    o[i]=Math.round(d[n]*.3+10); o[i+1]=Math.round(d[n+1]*.26+7); o[i+2]=Math.round(d[n+2]*.28+8); o[i+3]=255; }
  c.putImageData(new ImageData(o,SW,SHH),0,0);
  return cv2;
}
function spr(e,dir,fr,pose){ const k=dir+fr+pose; return e.spr[k]||(e.spr[k]=buildSprite(e.lk,dir,fr,pose)); }
function blit(im,x,feetY,flip){ const top=feetY-31; if(flip){ g.save(); g.translate(x,0); g.scale(-1,1); g.drawImage(im,-9,top,18,32); g.restore(); } else g.drawImage(im,x-9,top,18,32); }
const STAFF=[mkLook('c',{shirt:'#f1ebdf',apron:true,style:'nonla',stripe:false,buttons:false})];
for(let i=0;i<5;i++) STAFF.push(mkLook('c',{shirt:'#e8a63d',apron:true,stripe:false,buttons:false,style:pick(['short','long','bun','pony','spiky'])}));
const staffSpr=STAFF.map(lk=>({lk,spr:{}}));
const VLK={}, VSPR={}; VIL.forEach(v=>{ VLK[v.id]=Object.assign({kind:'c',stripe:false,buttons:false,apron:false,cap:'#c0392b'},v.lk); VSPR[v.id]={}; });
const PORT={};
function portrait(id){ if(PORT[id]) return PORT[id]; const sp=buildSprite(VLK[id],'d',0,'stand'), c=document.createElement('canvas'); c.width=32; c.height=34; const x=c.getContext('2d'); x.drawImage(sp,2,2,32,34,0,0,32,34); return PORT[id]=c.toDataURL(); }

/* ---- cây cối (pixel art, cache theo loại + mùa) ---- */
function srand(seed){ let s0=seed%2147483647; if(s0<=0) s0+=2147483646; return ()=>((s0=s0*16807%2147483647)-1)/2147483646; }
const LEAF=[
  ['#24502a','#3f8030','#72b03a','#c4dc5a'],
  ['#1f4a24','#2f7030','#5a9e34','#b4d24a'],
  ['#2e4a20','#55782a','#93a434','#e0c048'],
  ['#21442a','#33683a','#55904a','#a4c45a']
];
function kit(x){
  const P=(a,b,w,h,c)=>{ x.fillStyle=c; x.fillRect(Math.round(a),Math.round(b),Math.max(1,Math.round(w)),Math.max(1,Math.round(h))); };
  const D=(cx,cy,rx,ry,c)=>{ x.fillStyle=c; for(let yy=Math.ceil(-ry);yy<=ry;yy++){ const w=rx*Math.sqrt(Math.max(0,1-yy*yy/(ry*ry))); const a=Math.round(cx-w), b=Math.round(cx+w); if(b>a) x.fillRect(a,Math.round(cy+yy),b-a,1); } };
  const Ln=(x0,y0,x1,y1,w0,w1,c)=>{ const n=Math.max(1,Math.ceil(Math.hypot(x1-x0,y1-y0))); for(let i=0;i<=n;i++){ const f=i/n, w=w0+(w1-w0)*f; P(x0+(x1-x0)*f-w/2,y0+(y1-y0)*f-w/2,w,w,c); } };
  return {P,D,Ln,x};
}
// dải màu tán lá theo mùa: viền, tối sâu, tối, giữa, sáng, nắng
const RAMP=[
  ['#11281a','#1c4226','#2b6030','#428236','#6eaa3e','#bcd858'],
  ['#0f2616','#183c20','#24582a','#377a30','#5c9e36','#a8cc48'],
  ['#262a12','#38461c','#526424','#76842c','#a4a238','#e2c24a'],
  ['#112a26','#1a3e30','#28583a','#3e7444','#619452','#9ebe5c']
];
const RGB={}, rgb=c=>RGB[c]||(RGB[c]=[1,3,5].map(i=>parseInt(c.slice(i,i+2),16)));
const hsh=(a,b)=>{ let h=(Math.imul(a,374761393)+Math.imul(b,668265263))|0; h=Math.imul(h^(h>>>13),1274126177); return ((h^(h>>>16))>>>0)/4294967296; };
const BAYER=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
// khối tán: mỗi chùm lá là nửa cầu mép răng cưa nằm trên mặt cầu lớn của tán; chiếu sáng trái-trên, chùm trước đổ bóng lên chùm sau,
// khe giữa các chùm tối lại, viền ngoài sẫm; chừa vài lỗ hổng để thấy cành phía sau. Trả về canvas để dán lên.
function leafMass(r,cx,cy,rx,ry,ramp,n,K,o){ o=o||{};
  const pad=10*K, x0=Math.floor(cx-rx-pad), y0=Math.floor(cy-ry-pad), w=Math.ceil(rx*2+pad*2), h=Math.ceil(ry*2+pad*2);
  const Z=new Float32Array(w*h).fill(-1e9), N=new Float32Array(w*h), Lx=-.52,Ly=-.6,Lz=.6;
  const holes=[]; for(let i=0;i<(o.holes||0);i++){ const a=Math.PI*(.1+r()*.8), d=.25+r()*.45; holes.push([cx+Math.cos(a)*rx*d*(r()<.5?-1:1),cy+Math.sin(a)*ry*d*.8,(3+r()*3)*K]); }
  for(let i=0;i<n;i++){
    const a=r()*Math.PI*2, d=Math.pow(r(),o.spread||.65)*.9, gx=Math.cos(a)*d, gy=Math.sin(a)*d, ax=cx+gx*rx, ay=cy+gy*ry;
    if(holes.some(([hx,hy,hr])=>Math.hypot(ax-hx,ay-hy)<hr)&&d<.85) continue;
    const s=((o.s0||4)+r()*(o.sv||5))*K*(1.1-d*.3), sy=s*.82, gz=Math.sqrt(Math.max(0,1-d*d))*Math.min(rx,ry)*.9, ph=r()*7, lob=5+(i%4), px=ax-x0, py=ay-y0;
    for(let yy=Math.max(0,Math.floor(py-sy*1.2));yy<Math.min(h,py+sy*1.2);yy++) for(let xx=Math.max(0,Math.floor(px-s*1.2));xx<Math.min(w,px+s*1.2);xx++){
      const dx=(xx-px)/s, dy=(yy-py)/sy, d2=dx*dx+dy*dy; if(d2>1.44) continue;
      let lim=1; if(d2>.6){ lim=1+.15*Math.sin(Math.atan2(dy,dx)*lob+ph)+.14*(hsh(xx>>1,yy>>1)-.5); if(d2>lim*lim) continue; }
      const nz=Math.sqrt(Math.max(0,1-d2/(lim*lim))), z=gz+nz*s, j=yy*w+xx; if(z<=Z[j]) continue;
      const nx=dx*.6+gx*.4, ny=dy*.6+gy*.4, nn=nz*.6+Math.sqrt(Math.max(0,1-d*d))*.4;
      Z[j]=z; N[j]=(nx*Lx+ny*Ly+nn*Lz)/Math.sqrt(nx*nx+ny*ny+nn*nn)-Math.max(0,gy)*.3; } }
  const c=document.createElement('canvas'); c.width=w; c.height=h;
  const cc=c.getContext('2d'), im=cc.createImageData(w,h), D=im.data, P=ramp.map(rgb), lo=o.dim?0:1, hi=o.dim?4:5, Kw=K*w, sh=2*K+3*Kw;
  for(let yy=0;yy<h;yy++) for(let xx=0;xx<w;xx++){ const j=yy*w+xx, z=Z[j]; if(z<-1e8) continue;
    const bx0=xx>>1, by0=yy>>1, up=yy>=K?Z[j-Kw]:-1e9, dn=yy+K<h?Z[j+Kw]:-1e9, lf=xx>=K?Z[j-K]:-1e9, rt=xx+K<w?Z[j+K]:-1e9, T=z+3.5*K; let idx;
    if(up<-1e8||dn<-1e8||lf<-1e8||rt<-1e8) idx=0; // viền ngoài
    else if(up>T||dn>T||lf>T||rt>T) idx=lo; // khe sát mép chùm phía trước
    else { let L=N[j]+(hsh(bx0*3+1,by0*7+2)-.5)*.2; if(xx>=2*K&&yy>=3*K&&Z[j-sh]>z+3*K) L-=.32;
      idx=clamp(Math.floor((L+.3)*3.6+(BAYER[(by0&3)*4+(bx0&3)]/16-.5)*.7)+lo,lo,hi); if(idx>=hi-1&&hsh(bx0+9,by0+5)<.06) idx=hi; }
    const p=P[idx]; D[j*4]=p[0]; D[j*4+1]=p[1]; D[j*4+2]=p[2]; D[j*4+3]=255; }
  cc.putImageData(im,0,0); return {c,x0,y0};
}
function canopy(k,r,cx,cy,rx,ry,se,n,K,o){ const m=leafMass(r,cx,cy,rx,ry,RAMP[Math.min(se,3)],n,K,o); k.x.drawImage(m.c,m.x0,m.y0); }
// nền tối phía sau tán để lỗ hổng lộ ra lòng cây sâu, có cành
function hollow(k,cx,cy,rx,ry,se){ k.D(cx,cy,rx,ry,RAMP[Math.min(se,3)][1]); k.D(cx+rx*.1,cy+ry*.15,rx*.8,ry*.7,RAMP[Math.min(se,3)][0]); }
const TSZ={da:[290,150],xoai:[120,124],tre:[70,124],chuoi:[56,62],cau:[44,110],mai:[64,74],sao:[76,112]};
const TREE={};
function treeImg(kind,v,se){
  const key=kind+v+'|'+se; if(TREE[key]) return TREE[key];
  const K=2,[tw,th]=TSZ[kind],c=document.createElement('canvas'); c.width=tw*K; c.height=th*K;
  const x=c.getContext('2d'), k=kit(x), r=srand(31+v*977+kind.charCodeAt(0)*131+kind.length*7), rp=RAMP[Math.min(se,3)];
  const BX=tw*K/2, BY=(th-4)*K, bark='#5b3a26', barkD='#3a2418', barkL='#86583a';
  // thân: vỏ có rãnh dọc, sáng mép trái (hướng nắng), tối mép phải, đốm rêu
  const trunk=(cx0,top,w0,w1,bend,cols)=>{ const [b0,bD,bL]=cols||[bark,barkD,barkL];
    for(let y=BY;y>top;y--){ const f=(BY-y)/(BY-top), cx=cx0+Math.sin(f*2.4)*bend, w=w0+(w1-w0)*f, l=cx-w/2;
      k.P(l,y,w,1,b0); k.P(l,y,Math.max(1,w*.2),1,bL); k.P(l+w*.2,y,Math.max(1,w*.08),1,shade(bL,1.12)); k.P(l+w*.72,y,w*.28,1,bD); k.P(l+w-1,y,1,1,OUT);
      for(let q=0;q<w*.6;q+=3.2*K){ const fx=l+w*.18+q+Math.sin(y*.11+q)*K; if(hsh(fx|0,y>>2)<.7) k.P(fx,y,Math.max(1,K*.6),1,bD); }
      if(hsh(y>>1,7)<.07) k.P(l+w*.3+hsh(y,3)*w*.4,y,K*1.5,K,'#6f8a3a'); } };
  const br=(arr,cols)=>{ const [b0,bD,bL]=cols||[bark,barkD,barkL]; arr.forEach(b=>{ const a=[BX+b[0]*K,BY+b[1]*K,BX+b[2]*K,BY+b[3]*K];
    k.Ln(a[0],a[1],a[2],a[3],b[4]*K,b[5]*K,bD); k.Ln(a[0],a[1]-K*.6,a[2],a[3]-K*.6,b[4]*K*.72,b[5]*K*.72,b0); k.Ln(a[0]-K*.4,a[1]-K,a[2]-K*.4,a[3]-K,b[4]*K*.25,b[5]*K*.25,bL); }); };
  const twigs=(sx,sy,n,len,col)=>{ for(let i=0;i<n;i++){ const a=-Math.PI*(.15+r()*.7), l=(len*.5+r()*len)*K; k.Ln(sx,sy,sx+Math.cos(a)*l,sy+Math.sin(a)*l,1.4*K,.6*K,col||barkD); } };
  if(kind==='da'){ // cây xoài cổ thụ: rễ nổi to, tán rộng, chòi chim, đèn treo
    const bk='#6b4227', bkD='#432616', bkL='#9a6a42', C3=[bk,bkD,bkL];
    k.D(BX,BY,96*K,10*K,'rgba(40,30,10,.25)');
    for(let i=0;i<9;i++){ const sd=i%2?-1:1, ex=BX+sd*(26+r()*66)*K, ey=BY+(r()*5-1)*K, sx=BX+sd*(6+r()*10)*K;
      k.Ln(sx,BY-12*K,ex,ey,9*K,2*K,bkD); k.Ln(sx,BY-13*K,ex,ey-1.5*K,6*K,1.2*K,bk); k.Ln(sx-K,BY-14*K,ex-K,ey-2*K,2*K,.6*K,bkL); }
    hollow(k,BX-88*K,BY-52*K,46*K,18*K,se); hollow(k,BX+92*K,BY-56*K,42*K,16*K,se); hollow(k,BX,BY-80*K,110*K,30*K,se);
    trunk(BX,BY-52*K,34*K,22*K,5*K,C3); trunk(BX+14*K,BY-58*K,12*K,8*K,-3*K,C3);
    for(let i=0;i<40;i++) k.P(BX+(r()-.5)*28*K,BY-(4+r()*46)*K,(2+r()*3)*K,K,r()<.5?bkD:'#7a8a3a');
    br([[0,-46,-92,-56,13,4],[4,-48,96,-60,12,4],[-4,-50,-40,-86,9,3],[10,-52,46,-90,9,3],[-50,-54,-118,-48,6,2],[52,-58,120,-52,6,2],[-20,-70,-70,-100,5,2],[24,-72,80,-104,5,2],[2,-60,6,-112,6,2]],C3);
    twigs(BX-70*K,BY-80*K,6,10,bkD); twigs(BX+66*K,BY-84*K,6,10,bkD); twigs(BX,BY-104*K,5,10,bkD);
    canopy(k,r,BX-88*K,BY-50*K,54*K,24*K,se,120,K,{holes:2,s0:5,sv:6}); canopy(k,r,BX+92*K,BY-54*K,50*K,22*K,se,110,K,{holes:2,s0:5,sv:6});
    canopy(k,r,BX,BY-82*K,124*K,40*K,se,330,K,{holes:6,s0:6,sv:7});
    for(let i=0;i<22;i++){ const vx=BX+(r()-.5)*230*K, vy=BY-(40+r()*10)*K, len=(6+r()*16)*K; for(let y=0;y<len;y+=2) k.P(vx+Math.sin(y*.2+i)*K,vy+y,1.5*K,1.5*K,y%4?rp[3]:rp[2]); k.P(vx,vy+len,1.5*K,1.5*K,rp[4]); }
    k.P(BX+16*K,BY-40*K,10*K,9*K,'#9a6a42'); k.P(BX+15*K,BY-43*K,12*K,3*K,'#6b4227'); k.P(BX+19*K,BY-37*K,4*K,4*K,'#2b1d16'); k.P(BX+16*K,BY-40*K,10*K,K,'#c48a52');
    [[-44,-50,-38],[62,-56,-42]].forEach(([dx,y0,y1])=>{ k.P(BX+dx*K,BY+y0*K,.6*K,(y0-y1)*-K,'#2b1d16'); k.P(BX+(dx-3)*K,BY+y1*K,7*K,8*K,'#3b2516'); k.P(BX+(dx-2)*K,BY+(y1+1)*K,5*K,6*K,'#ffd36b'); k.P(BX+(dx-2)*K,BY+(y1+1)*K,5*K,K,'#fff1c0'); k.P(BX+(dx-4)*K,BY+(y1-1)*K,9*K,1.5*K,'#3b2516'); });
  } else if(kind==='xoai'){
    k.D(BX,BY,50*K,7*K,'rgba(20,40,10,.24)');
    k.Ln(BX-11*K,BY,BX-3*K,BY-10*K,4*K,6*K,barkD); k.Ln(BX+11*K,BY,BX+3*K,BY-10*K,4*K,6*K,barkD);
    hollow(k,BX,BY-76*K,44*K,28*K,se);
    trunk(BX,BY-46*K,12*K,8*K,2*K);
    br([[0,-40,-30,-66,6,2],[0,-42,32,-70,6,2],[1,-44,4,-92,5,2],[-14,-54,-40,-80,3,1],[16,-56,38,-86,3,1]]);
    twigs(BX-26*K,BY-70*K,4,8); twigs(BX+28*K,BY-74*K,4,8);
    canopy(k,r,BX,BY-80*K,54*K,38*K,se,170,K,{holes:4,s0:5,sv:5});
    if(se<=1) for(let i=0;i<14;i++){ const a=r()*Math.PI*2, d=.45+r()*.55, fx=BX+Math.cos(a)*44*K*d, fy=BY-60*K+Math.abs(Math.sin(a))*16*K*d, ripe=se===1&&r()<.6;
      k.P(fx,fy-4*K,K*.6,3*K,'#5a3a26'); k.D(fx,fy,1.9*K,2.8*K,OUT); k.D(fx,fy,1.4*K,2.3*K,ripe?'#f2b43a':'#8cbc44'); k.D(fx+.5*K,fy+K,1.1*K,1.5*K,ripe?'#d88a2a':'#6a9a34'); k.P(fx-K,fy-1.5*K,K,K,ripe?'#ffe7a0':'#c8e88a'); }
  } else if(kind==='tre'){
    k.D(BX,BY,26*K,5*K,'rgba(20,40,10,.24)');
    for(let i=0;i<60;i++) k.P(BX+(r()-.5)*48*K,BY+(r()-.5)*6*K,2*K,K,['#c9b06a','#a8893f','#8a7438'][i%3]);
    const lp=se===3?['#2a4a22','#3f6a2a','#5a8a3a','#8aae4a','#c4d070']:se===2?['#3a3a1a','#5a6226','#7e8a34','#a8a844','#d8c868']:['#1e4a22','#2f6a2a','#4a8a3a','#6fae4a','#a8d070'];
    const lanc=(px,py,a,len,wd,front)=>{ const ca=Math.cos(a), sa=Math.sin(a), cL=front?lp[3]:lp[1], cD=front?lp[2]:lp[0];
      for(let s=0;s<len;s++){ const t=s/len, hw=wd*Math.pow(Math.sin(Math.PI*Math.min(1,t*1.1+.06)),.8), qx=px+ca*s, qy=py+sa*s+t*t*len*.3;
        for(let q=-hw;q<=hw;q+=.8) k.P(qx-sa*q,qy+ca*q,1.2,1.2,q<-hw*.2?cL:cD); if(front&&t<.7) k.P(qx,qy,1,1,lp[4]); } };
    const culms=[]; for(let i=0;i<13;i++){ const b0=BX+(r()-.5)*24*K; culms.push([b0,(b0-BX)/(12*K)*.5+(r()-.5)*.35,(96+r()*22)*K]); }
    const spray=(front)=>culms.forEach(([b0,lean,hgt])=>{ for(let j=0;j<(front?9:7);j++){ const t=.38+r()*.62, cx=b0+lean*t*t*60*K, cy=BY-t*hgt, sd=r()<.5?-1:1;
      for(let q=0;q<3+(r()*3|0);q++) lanc(cx,cy,(sd<0?Math.PI:0)+sd*(.35+r()*.7),(6+r()*6)*K,1.3*K,front); } });
    spray(false);
    culms.forEach(([b0,lean,hgt],i)=>{ const cc=i%3===0?'#94b44c':i%3===1?'#78a03e':'#6a9038', cd=shade(cc,.68), ch=shade(cc,1.28);
      for(let y=0;y<hgt;y++){ const t=y/hgt, cx=b0+lean*t*t*60*K, wd=(3.2-t*1.2)*K, nd=y%(11*K);
        k.P(cx-wd/2,BY-y,wd,1,cc); k.P(cx-wd/2,BY-y,K*.7,1,ch); k.P(cx+wd/2-K*.7,BY-y,K*.7,1,cd);
        if(nd===0) k.P(cx-wd/2-K*.4,BY-y,wd+K*.8,K,cd); else if(nd===K) k.P(cx-wd/2,BY-y,wd,K*.5,'#d8e0a8'); else if(nd<5*K&&t<.3) k.P(cx-wd/2,BY-y,wd*.4,1,'rgba(200,180,110,.45)'); } });
    spray(true);
  } else if(kind==='chuoi'){
    k.D(BX,BY,24*K,4*K,'rgba(20,40,10,.24)');
    const st=[[-9,26],[3,32],[12,22]];
    const leaf=(px,py,a,len,w,dry)=>{ const ca=Math.cos(a), sa=Math.sin(a), nx=-sa, ny=ca, Lc=dry?'#b89a52':'#76b84c', Dk=dry?'#8a6a34':'#3f7a30', Md=dry?'#a08040':'#5a9a3c', M=dry?'#d8c07a':'#d0e890', E=dry?'#6a4e26':'#2a5622';
      for(let s=0;s<len;s++){ const t=s/len, cx=px+ca*s, cy=py+sa*s+t*t*len*.55, hw=w*Math.pow(Math.sin(Math.PI*Math.min(1,t*1.05)),.5);
        for(let q=-hw;q<=hw;q+=1){ if(!dry&&t>.2&&(s%(5*K)<1.2)&&Math.abs(q)>hw*.4&&r()<.65) continue; const e=Math.abs(q)>hw-1.6;
          k.P(cx+nx*q,cy+ny*q,1.5,1.5,e?E:q<-hw*.45?Lc:q<0?Md:Dk); } k.P(cx,cy,1.5,1.5,M); } };
    leaf(BX-9*K,BY-20*K,2.2,14*K,4*K,true); leaf(BX+12*K,BY-17*K,1.1,11*K,3.5*K,true);
    st.forEach(([dx,hh])=>{ const sx=BX+dx*K; for(let y=0;y<hh*K;y++){ const low=y<8*K; k.P(sx-2.5*K,BY-y,5*K,1,low?'#8a6a3a':'#82a04c'); k.P(sx-2.5*K,BY-y,K,1,low?'#6a4e2a':'#5f7a34'); k.P(sx+1.2*K,BY-y,K*.8,1,low?'#a8865a':'#b0c868'); if(y%(4*K)<1) k.P(sx-2.5*K,BY-y,5*K,1,low?'#5a4024':'#6a8a3a'); } });
    st.forEach(([dx,hh],i)=>{ const px=BX+dx*K, py=BY-hh*K; [-2.7,-2.2,-1.5,-1,-.55].forEach((a,j)=>{ if((i+j)%4===3) return; leaf(px,py,a+(r()-.5)*.25,(21+r()*8)*K,5.4*K,false); }); });
    for(let i=0;i<9;i++){ const bxx=BX+3*K+(i%3-1)*2*K, byy=BY-27*K+Math.floor(i/3)*2.5*K; k.P(bxx,byy,2*K,2*K,'#7ea83a'); k.P(bxx,byy,K,K,'#b4d45a'); }
    k.D(BX+3*K,BY-17*K,2.2*K,3.4*K,'#5a1a34'); k.D(BX+2.6*K,BY-17.6*K,1.4*K,2.4*K,'#8a3a5a'); k.P(BX+2.5*K,BY-22*K,K,4*K,'#7e9a48');
  } else if(kind==='cau'){
    k.D(BX,BY,10*K,2.5*K,'rgba(20,40,10,.24)');
    const top=BY-92*K, tx=t=>BX+Math.sin(t*1.8+v)*4*K;
    for(let y=BY;y>top;y--){ const t=(BY-y)/(BY-top), cx=tx(t), wd=(3.6-t*.8)*K; k.P(cx-wd/2,y,wd,1,'#9a948a'); k.P(cx-wd/2,y,K*.8,1,'#cfc9bd'); k.P(cx+wd/2-K*.7,y,K*.7,1,'#6e6860'); if(y%(5*K)===0) k.P(cx-wd/2,y,wd,K*.6,'#78726a'); }
    const cx=tx(1), cy=top; k.P(cx-2*K,cy,4*K,9*K,'#6f9a3a'); k.P(cx-2*K,cy,K,9*K,'#9cc464'); k.P(cx+1.2*K,cy,K*.8,9*K,'#4f7a2a');
    const frond=(a,len,back)=>{ const c1=back?rp[2]:rp[4], c2=back?rp[1]:rp[3], rib=back?'#3f6a2a':'#5a9a3a';
      for(let s=0;s<len;s++){ const t=s/len, px=cx+Math.cos(a)*s, py=cy+Math.sin(a)*s+t*t*len*.6; k.P(px,py,1.5,1.5,rib);
        if(s%K===0&&t>.08){ const ll=(1-t*.7)*6*K+K; k.Ln(px,py,px+Math.cos(a+1.3)*ll*.55,py+ll*.9,K*.8,.5,c1); k.Ln(px,py,px+Math.cos(a-1.3)*ll*.55,py+ll*.9,K*.8,.5,c2); } } };
    for(let i=0;i<7;i++) frond(-Math.PI/2+(i-3)*.55+.2,(18+r()*5)*K,true);
    for(let i=0;i<10;i++) frond(-Math.PI/2+(i-4.5)*.4,(20+r()*6)*K,false);
    for(let i=0;i<12;i++){ const fx=cx+(r()-.5)*9*K, fy=cy+9*K+r()*6*K, ripe=r()<.5; k.D(fx,fy,1.5*K,1.7*K,ripe?'#d8862a':'#7aa83c'); k.P(fx-.6*K,fy-.6*K,K*.6,K*.6,ripe?'#ffc070':'#b8d870'); }
  } else if(kind==='mai'){ // mai vàng trong chậu sứ men lam: gốc xù xì uốn lượn, cành mảnh xoè hình quạt; đông lặt lá còn nụ, Tết nở kín hoa 5 cánh
    const C2=['#8a7666','#4a3a30','#b8a698'], tips=[], nodes=[];
    k.D(BX,BY,17*K,3.5*K,'rgba(20,20,10,.28)');
    // thân gốc chui lên từ chậu, uốn 2 khúc
    const tr=[[0,-6,5.2],[-3.5,-15,4.6],[1.5,-23,3.8],[-1,-30,3]];
    for(let i=0;i<tr.length-1;i++){ const [a,b,w]=tr[i], [c,d,w2]=tr[i+1];
      k.Ln(BX+a*K,BY+b*K,BX+c*K,BY+d*K,w*K,w2*K,C2[1]); k.Ln(BX+(a-.7)*K,BY+(b-.3)*K,BX+(c-.7)*K,BY+(d-.3)*K,w*.55*K,w2*.55*K,C2[0]); k.Ln(BX+(a-1.4)*K,BY+b*K,BX+(c-1.2)*K,BY+d*K,K*.7,K*.6,C2[2]); }
    for(let i=0;i<10;i++){ const t=r(), y=BY-(7+t*22)*K; k.P(BX+(Math.sin(t*5)*2-1+r()*2)*K,y,K*1.2,K*.8,r()<.5?C2[1]:'#6f7a52'); } // mắt gỗ, rêu
    // cành: mỗi cành tách đôi/ba, mảnh dần, xoè lên như cái quạt
    const grow=(x0,y0,a,len,w,d)=>{ const x1=x0+Math.cos(a)*len*K, y1=y0+Math.sin(a)*len*K;
      k.Ln(x0,y0,x1,y1,w*K,w*.7*K,C2[1]); if(w>1) k.Ln(x0-K*.35,y0-K*.35,x1-K*.35,y1-K*.35,w*.4*K,w*.28*K,C2[2]);
      for(let t=.4;t<=1;t+=.3) nodes.push([x0+(x1-x0)*t,y0+(y1-y0)*t,d]);
      if(d<=0){ tips.push([x1,y1,a]); return; }
      const n=d>=2?2:2+(r()<.45?1:0); for(let i=0;i<n;i++) grow(x1,y1,a+(i-(n-1)/2)*(.5+r()*.25)+(r()-.5)*.25,len*(.64+r()*.1),w*.66,d-1); };
    const top=[BX-1*K,BY-30*K]; [-2.45,-2.0,-1.6,-1.2,-.75].forEach((a,i)=>grow(top[0],top[1],a+(r()-.5)*.15,(i===2?12:10)+r()*3,2.6,3));
    const petal=[[0,-1.2],[1.15,-.35],[.7,1],[-.7,1],[-1.15,-.35]];
    const flower=(fx,fy,s)=>{ const lit=fx<BX+4*K&&fy<BY-36*K; petal.forEach(([dx,dy])=>k.P(fx+dx*K*s-K*.5,fy+dy*K*s-K*.5,K*1.1,K*1.1,lit?'#ffe14a':'#f6c42c')); k.P(fx-K*.5,fy-K*.5,K,K,'#e0781a'); if(lit) k.P(fx-K*.6,fy-K*1.6,K*.6,K*.6,'#fff6b8'); };
    const leaf=(lx,ly,a,col)=>{ const ex=lx+Math.cos(a)*2.4*K, ey=ly+Math.sin(a)*2.4*K; k.Ln(lx,ly,ex,ey,1.5*K,.7*K,col); };
    if(se===4){ // Tết: hoa kín đầu cành, nụ dọc cành, lộc non đỏ, bao lì xì
      nodes.forEach(([x,y],i)=>{ const u=r(); if(u<.45) flower(x+(r()-.5)*2*K,y+(r()-.5)*2*K,.9); else if(u<.7) k.P(x,y,K,K,r()<.5?'#d8b24a':'#a8b04a'); else if(u<.78) leaf(x,y,-1.2+(r()-.5),'#b0603a'); });
      tips.forEach(([x,y,a])=>{ flower(x,y,1); if(r()<.7) flower(x+Math.cos(a+1)*2.4*K,y+Math.sin(a+1)*2.4*K,.85); if(r()<.5) k.P(x+Math.cos(a)*2*K,y+Math.sin(a)*2*K,K,K,'#d8b24a'); });
      [[-12,-40],[10,-44],[2,-34]].forEach(([a,b])=>{ const hx=BX+a*K, hy=BY+b*K; k.P(hx,hy,K*.4,2.5*K,'#e9b23f'); k.P(hx-K,hy+2.5*K,3*K,4*K,'#c8281e'); k.P(hx-K,hy+2.5*K,K*.6,4*K,'#f05a48'); k.P(hx-.4*K,hy+4*K,1.8*K,K,'#ffd166'); });
      for(let i=0;i<6;i++) k.P(BX+(r()-.5)*16*K,BY-12*K+r()*1.5*K,K,K*.8,'#f6c42c'); // cánh rụng trên mặt chậu
    } else if(se===3){ // trước Tết: lặt hết lá, cành trơ đầy nụ
      nodes.forEach(([x,y])=>{ if(r()<.55) k.P(x,y,K,K,r()<.6?'#9aa84a':'#7a5a3a'); });
      tips.forEach(([x,y])=>{ k.P(x-K*.5,y-K*.5,K*1.2,K*1.2,'#b8b04a'); });
    } else { // lá nhỏ thưa mọc theo cành, xuân còn sót vài bông
      const lc=[rp[2],rp[3],rp[4]];
      nodes.forEach(([x,y,d])=>{ if(d<2&&r()<.75){ const a=-Math.PI/2+(r()-.5)*2.4; leaf(x,y,a,rp[1]); leaf(x+K*.4,y-K*.4,a+.6,lc[(r()*3)|0]); } });
      tips.forEach(([x,y,a])=>{ for(let j=0;j<3;j++) leaf(x,y,a+(j-1)*.7,lc[(r()*3)|0]); });
      if(se===0) tips.forEach(([x,y])=>{ if(r()<.3) flower(x,y,.85); });
    }
    // chậu sứ men lam, vành dày, có hoa văn
    for(let yy=0;yy<11;yy++){ const w=(18-yy*.45)*K, y=BY-(12-yy)*K; k.P(BX-w/2,y,w,K,yy%5===3?'#3a64a8':'#e6ecf0'); k.P(BX-w/2,y,w*.18,K,'#ffffff'); k.P(BX+w/2-w*.22,y,w*.22,K,yy%5===3?'#2a4a80':'#c4ced8'); }
    for(let i=0;i<5;i++){ const px=BX+(-6+i*3)*K, py=BY-8*K; k.D(px,py,1.1*K,1.1*K,'#3a64a8'); k.P(px-K*.3,py-K*.3,K*.6,K*.6,'#6a90cc'); }
    k.P(BX-11*K,BY-14*K,22*K,2.2*K,'#d8e0e8'); k.P(BX-11*K,BY-14*K,22*K,K*.6,'#ffffff'); k.P(BX-10*K,BY-12.6*K,20*K,K*.8,'#3a2a20'); k.P(BX-7*K,BY-2*K,14*K,K,'#9aa6b2');
  } else if(kind==='sao'){ // cây sao/dầu ven đường phố: thân thẳng cao, vỏ xám nâu, tán bầu dục gọn
    const C4=['#6a5e50','#3e362e','#9a8e7c'];
    k.D(BX,BY,22*K,4*K,'rgba(20,20,10,.28)');
    hollow(k,BX,BY-74*K,28*K,22*K,se);
    trunk(BX,BY-60*K,8*K,5*K,1.5*K,C4);
    br([[0,-50,-18,-76,3,1],[0,-54,16,-82,3,1],[0,-58,-2,-96,2.6,1],[-8,-62,-24,-70,1.5,.6],[8,-66,24,-74,1.5,.6]],C4);
    canopy(k,r,BX,BY-76*K,33*K,27*K,se,120,K,{holes:3,s0:4,sv:4});
  }
  TREE[key]=c; return c;
}
function drawTree(kind,x,baseY,v,se,ctx,s){ ctx=ctx||g; s=s||1; const im=treeImg(kind,v%3,se), [tw,th]=TSZ[kind]; ctx.drawImage(im,x-tw*s/2,baseY-(th-4)*s,tw*s,th*s); }
function disc(cx,cy,r,col,ctx){ ctx=ctx||g; ctx.fillStyle=col; for(let yy=Math.ceil(-r);yy<=r;yy++){ const w=Math.floor(Math.sqrt(r*r-yy*yy)); ctx.fillRect(Math.round(cx-w),Math.round(cy+yy),w*2+1,1); } }
function ellipse(cx,cy,rx,ry,col,ctx){ ctx=ctx||g; ctx.fillStyle=col; for(let yy=-Math.floor(ry);yy<=ry;yy++){ const w=Math.floor(rx*Math.sqrt(Math.max(0,1-(yy*yy)/(ry*ry)))); ctx.fillRect(Math.round(cx-w),Math.round(cy+yy),w*2+1,1); } }

/* ---- cảnh phố: mặt bằng thuê, gạch bông, vỉa hè, cột điện, xe bánh mì, đường đông xe ---- */
const CITY_LAYOUT=[{id:'ghe',c:4,r:7},{id:'ghe',c:9,r:6},{id:'tbl',c:13,r:7},{id:'ghe',c:21,r:6},{id:'ghe',c:26,r:7},{id:'ghe',c:30,r:6},
  {id:'chau',c:15,r:6},{id:'chau',c:20,r:5},{id:'lantern',c:16,r:8},{id:'lantern',c:19,r:8},{id:'ghe',c:9,r:11},{id:'du',c:20,r:11},{id:'ghe',c:13,r:12}];
function cityDecor(c,r){ return (c<=1&&r>=10)||(c>=3&&c<=6&&r>=11)||(c>=23&&c<=31&&r>=12)||(c>=33&&r>=8); }
// quán phố kiểu tối giản ấm: tường vữa kem + ốp gỗ óc chó, đèn thả, sàn gỗ sồi, vỉa hè đá xám, ít màu, ít chi tiết vụn
function buildCityBG(x,o,hp,rr,R2){
  const f=(a,b,w,h,c)=>{ x.fillStyle=c; x.fillRect(o+a,b,w,h); }, txt=(t,a,b,font,c)=>{ x.font=font; x.fillStyle=c; x.fillText(t,o+a,b); };
  const grad=(x0,y0,x1,y1,stops)=>{ const gr=x.createLinearGradient(x0,y0,x1,y1); stops.forEach(([p,c])=>gr.addColorStop(p,c)); return gr; };
  const pool=(cx,cy,r,a)=>{ const gr=x.createRadialGradient(o+cx,cy,0,o+cx,cy,r); gr.addColorStop(0,`rgba(255,226,170,${a})`); gr.addColorStop(1,'rgba(255,226,170,0)'); x.fillStyle=gr; x.fillRect(o+cx-r,cy-r,r*2,r*2); };
  // tường: vữa kem mịn, dầm gỗ trần, đèn hắt tường
  bx(0,0,VW,64,'#ebe1cd',x); for(let i=0;i<VW*.5;i++) hp(R2(0,VW),R2(4,40),R2(3,9),R2(1,3),rr()<.5?'rgba(190,170,130,.08)':'rgba(255,255,255,.12)');
  bx(0,0,VW,4,'#3e2c20',x); bx(0,4,VW,1,'#6b4e38',x); bx(0,5,VW,2,'rgba(40,25,15,.18)',x);
  [180,440].forEach(cx=>pool(cx,26,46,.35));
  // ốp gỗ óc chó nửa dưới, nẹp đồng
  bx(0,38,VW,26,'#5a3d2a',x); for(let i=0;i<VW;i+=24){ hp(i,41,22,18,'#664632'); hp(i,41,22,.5,'#7a5640'); hp(i,58.5,22,.5,'#3e2a1c'); hp(i+21.5,41,.5,18,'#3e2a1c'); }
  bx(0,37,VW,2,'#3e2a1c',x); bx(0,37,VW,.5,'#d4b06a',x); bx(0,61,VW,3,'#2e2018',x);
  // tranh khung gỗ: đồi chè lúc chiều (trên quầy xe)
  f(62,10,30,22,'#2e2018'); f(63.5,11.5,27,19,'#f2e8d6'); f(66,14,22,13,'#e8c48a'); f(66,20,22,7,'#9aa86a'); f(66,23,22,4,'#6f8a4e'); x.fillStyle='#f6dca0'; x.beginPath(); x.arc(o+82,18,2.5,0,7); x.fill();
  f(98,14,20,18,'#2e2018'); f(99.5,15.5,17,15,'#f2e8d6'); f(102,18,12,10,'#3e5a4a'); f(104,22,8,6,'#c9a46a');
  // đèn thả chụp đen
  [180,440].forEach(cx=>{ f(cx,0,.5,13,'#2b2b2b'); f(cx-5,13,10,4,'#1f1f22'); f(cx-6,16.5,12,1,'#2b2b2b'); f(cx-4,13,3,1,'#4a4a50'); f(cx-2,17.5,4,1.5,'#ffe2a0'); });
  // bảng menu đen viền đồng
  f(228,6,100,30,'#c9a45a'); f(229,7,98,28,'#1c1f1e'); f(229,7,98,1,'#2c302e');
  txt('MENU',266,15,'bold 6px "Be Vietnam Pro",sans-serif','#e8c98a'); f(250,17,56,.5,'rgba(232,201,138,.5)');
  [['Cà phê đen','25'],['Cà phê sữa','28'],['Bạc xỉu','30'],['Trà đào','32']].forEach(([t,p],i)=>{ txt(t,238,22+i*3.6,'600 3px "Be Vietnam Pro",sans-serif','#efe8da'); txt(p,310,22+i*3.6,'600 3px "Be Vietnam Pro",sans-serif','#e8c98a'); });
  // bảng hiệu gỗ, chữ đồng sáng ấm
  f(344,9,88,22,'#2a1d14'); f(345,10,86,20,'#3a2a1e'); f(345,10,86,.5,'#5a4230');
  x.save(); x.shadowColor='rgba(255,200,120,.75)'; x.shadowBlur=6; txt('CÀ PHÊ',357,24,'800 11px "Be Vietnam Pro",sans-serif','#f3d08a'); x.restore();
  txt('PHA PHIN · RANG MỘC',363,28.6,'600 2.6px "Be Vietnam Pro",sans-serif','#c9a46a');
  // kệ gỗ nổi: ly trắng, hũ hạt hổ phách, chậu trầu bà rủ
  [16,32].forEach(y=>{ f(450,y,114,2.5,'#5a3d2a'); f(450,y,114,.5,'#8a6448'); f(452,y+2.5,110,1,'rgba(40,25,15,.25)'); });
  for(let i=0;i<9;i++){ const cx=456+i*11; f(cx,9,6,7,'#f4efe6'); f(cx,9,6,1,'#ffffff'); f(cx+4.5,10,.8,6,'#d8d0c2'); f(cx+6,11,1.5,3,'#e8e2d6'); }
  for(let i=0;i<6;i++){ const cx=456+i*17; f(cx,23,8,9,'rgba(200,140,70,.85)'); f(cx,23,8,2,'#3e2a1c'); f(cx+1,26,6,5,'#6b3e22'); f(cx+1,25,1.5,6,'rgba(255,240,210,.45)'); }
  disc(o+556,27,4,'#3f7a3c',x); disc(o+555,26,2.5,'#5a9a4a',x); f(553,29,7,3,'#e8e2d6'); for(let i=0;i<5;i++){ const vx=551+i*2.5; for(let y=0;y<6+i%3*4;y++) f(vx+Math.sin(y*.5+i)*.8,32+y,1.2,1.2,y%3?'#4a8a40':'#6aaa50'); }
  // cây lá to trong chậu gốm hai góc
  const potPlant=(cx,base,h,seed)=>{ const r=srand(seed); ellipse(o+cx,base,9,1.5,'rgba(40,25,15,.3)',x); f(cx-6,base-10,12,10,'#d8cfc0'); f(cx-6,base-10,12,1,'#f0e8da'); f(cx+3,base-10,3,10,'#b8ae9e'); f(cx-6.5,base-11,13,1.5,'#c8bfae');
    for(let i=0;i<9;i++){ const a=-Math.PI/2+(r()-.5)*2.2, l=h*(.55+r()*.45), ex=cx+Math.cos(a)*l*.7, ey=base-10+Math.sin(a)*l;
      x.strokeStyle='#3e6a34'; x.lineWidth=.6; x.beginPath(); x.moveTo(o+cx,base-10); x.lineTo(o+ex,ey); x.stroke();
      ellipse(o+ex,ey,4.2,2.8,'#24502a',x); ellipse(o+ex-.6,ey-.6,3.4,2.1,i%2?'#3f7a34':'#4a8a3c',x); hp(o+ex-1.6,ey-1.4,1.5,.5,'#8ac060'); } };
  potPlant(20,64,30,7); potPlant(580,64,34,9);
  // trụ vữa hai bên
  f(-6,0,16,228,'#ddd2bc'); f(-6,0,3,228,'#c4b89e'); f(8,0,2,228,'#efe6d4'); f(594,0,16,228,'#ddd2bc'); f(594,0,2,228,'#efe6d4'); f(607,0,3,228,'#c4b89e');
  // sàn gỗ sồi lát ngang, mạch so le
  const OAK=['#c99d6c','#c49768','#cea372','#bf9262','#c79a6a'];
  for(let ty=64,row=0;ty<223;ty+=6,row++){ let tx=-((row*23)%41)-8; while(tx<VW){ const L=34+((row*7+tx*3)&31), c=OAK[(row*3+((tx/7)|0))%5];
      hp(tx,ty,L,6,c); hp(tx,ty,L,.5,'rgba(255,240,215,.22)'); hp(tx,ty+5.5,L,.5,'rgba(90,55,25,.35)'); hp(tx+L-.5,ty,.5,6,'rgba(90,55,25,.4)');
      for(let gi=0;gi<2;gi++){ const gy=ty+1.5+gi*2+R2(-.5,.5); hp(tx+R2(2,L*.4),gy,R2(6,L*.5),.5,'rgba(120,80,40,.16)'); }
      tx+=L; } }
  x.fillStyle=grad(0,64,0,82,[[0,'rgba(50,30,15,.32)'],[1,'rgba(50,30,15,0)']]); x.fillRect(0,64,VW,18);
  x.fillStyle=grad(0,177,0,223,[[0,'rgba(255,244,220,0)'],[1,'rgba(255,244,220,.16)']]); x.fillRect(0,177,VW,46);
  // ngạch cửa thép đen + ray cửa kính
  bx(0,223,VW,5,'#2a2826',x); bx(0,223,VW,.5,'#6a6660',x); bx(0,225.5,VW,.5,'#46423e',x);
  // vỉa hè đá xám ấm, tấm lớn so le
  bx(0,228,VW,60,'#d3cdc2',x);
  for(let ty=228,row=0;ty<288;ty+=11,row++) for(let tx=-(row%2)*12;tx<VW;tx+=24){ const v=hsh(tx+500,row)*.06-.03, c=shade('#d3cdc2',1+v);
    hp(tx,ty,24,11,c); hp(tx,ty,24,.5,'rgba(255,255,255,.28)'); hp(tx,ty+10.5,24,.5,'rgba(110,100,88,.35)'); hp(tx+23.5,ty,.5,11,'rgba(110,100,88,.35)'); }
  for(let i=0;i<VW*.25;i++) hp(R2(0,VW),R2(229,287),.5,.5,rr()<.5?'rgba(90,80,70,.18)':'rgba(255,255,255,.3)');
  x.fillStyle=grad(0,228,0,242,[[0,'rgba(40,30,20,.22)'],[1,'rgba(40,30,20,0)']]); x.fillRect(0,228,VW,14);
  // bóng tán cây sao loang trên vỉa hè (cây vẽ đè lên ở lớp trước)
  for(let i=0;i<26;i++) ellipse(o+R2(530,610),R2(250,286),R2(6,14),R2(2,4),'rgba(30,40,25,.13)',x);
  f(554,274,28,10,'#5a5650'); f(555,275,26,8,'#3a3834'); for(let i=0;i<26;i+=3) f(555.5+i,275,1,8,'#6a6660'); // ô lưới gốc cây
  // cột đèn đường gang đen, chóa lồng kính
  ellipse(o+31,288,8,1.5,'rgba(0,0,0,.25)',x); f(26,280,10,8,'#1f1f22'); f(27,280,2,8,'#3a3a40'); f(29,240,4,40,'#1f1f22'); f(29.5,240,1,40,'#4a4a52');
  f(27,234,8,2,'#1f1f22'); f(26,225,10,9,'#1f1f22'); f(27.5,226.5,7,6,'#ffe4a8'); f(27.5,226.5,7,1,'#fff6d8'); f(30.5,226.5,1,6,'#1f1f22'); f(25,223.5,12,2,'#1f1f22'); f(30,221,2,3,'#1f1f22');
  // xe bánh mì: thân kem, kính, mái sọc
  ellipse(o+96,286,30,3,'rgba(0,0,0,.22)',x); f(70,256,52,24,'#efe8dc'); f(70,256,52,.5,'#ffffff'); f(70,278,52,2,'#c8bfae');
  f(73,259,46,12,'#cfe0e0'); f(73,259,46,1,'#f0f8f8'); for(let i=0;i<5;i++){ f(76+i*9,265,7,4,'#d4964e'); f(76+i*9,265,7,1,'#e8b46a'); }
  for(let i=0;i<52;i+=6.5) f(70+i,246,3.25,7,'#b8423a'); for(let i=3.25;i<52;i+=6.5) f(70+i,246,3.25,7,'#f4ece0'); f(68,253,56,1.5,'#8a2e28');
  f(71,241,50,5,'#2e2018'); txt('BÁNH MÌ',83,245.2,'800 4px "Be Vietnam Pro",sans-serif','#f3d08a');
  disc(o+80,282,4,'#2b2b2b',x); disc(o+80,282,1.5,'#8a8f96',x); disc(o+112,282,4,'#2b2b2b',x); disc(o+112,282,1.5,'#8a8f96',x);
  // ba xe tay ga dựng thẳng hàng, màu trầm
  ['#e9e1d0','#8fa898','#4a5a6a'].forEach((c,i)=>{ const b0=392+i*21; ellipse(o+b0+7,285,10,1.8,'rgba(0,0,0,.22)',x);
    disc(o+b0,281,3.4,'#262626',x); disc(o+b0+14,281,3.4,'#262626',x); disc(o+b0,281,1.2,'#9aa0a6',x); disc(o+b0+14,281,1.2,'#9aa0a6',x);
    f(b0-2,272,12,6,c); f(b0-2,272,12,.8,shade(c,1.15)); f(b0+9,276,6,2,shade(c,.8)); f(b0,269,8,3,'#2b2522'); f(b0+12,264,2.5,10,c); f(b0+10,262.5,7,1.6,'#2b2b2b'); f(b0+16,264,1.6,1.6,'#fff2c0'); });
  // bồn cây gỗ: bụi xanh, hoa trắng
  ellipse(o+492,287,36,2,'rgba(0,0,0,.2)',x); f(460,270,64,16,'#6b4a32'); f(460,270,64,1,'#8a6448'); for(let i=0;i<64;i+=8) f(460+i,271,.5,15,'#4e3424'); f(460,285,64,1,'#3e2a1c');
  const sh=leafMass(srand(77),(o+492)*2,262*2,30*2,9*2,RAMP[1],34,2,{s0:3,sv:3}); x.drawImage(sh.c,sh.x0/2,sh.y0/2,sh.c.width/2,sh.c.height/2);
  for(let i=0;i<16;i++){ const fx=o+466+hsh(i,3)*52, fy=256+hsh(i,9)*12; hp(fx,fy,1.2,1.2,'#f8f4ea'); hp(fx+.4,fy+.4,.5,.5,'#f2c84a'); }
  // mép vỉa hè đá granite, rãnh thoát nước, đường nhựa
  bx(0,288,VW,3,'#c4beb2',x); bx(0,288,VW,.5,'#e6e0d4',x); bx(0,291,VW,1.5,'#8a857c',x); bx(0,292.5,VW,3,'#6e6a64',x);
  bx(0,295.5,VW,42.5,'#4a4a50',x); for(let i=0;i<VW*1.2;i++) hp(R2(0,VW),R2(296,338),.5,.5,rr()<.5?'rgba(255,255,255,.05)':'rgba(0,0,0,.08)');
  for(let xx=6;xx<VW;xx+=36) bx(xx,316,18,1.2,'rgba(236,228,200,.75)',x);
  // cửa hàng hai bên (màn hình rộng): tiệm hoa xanh rêu, tiệm bánh kem
  if(o>=24){ const Lw=o-6, Rx=o+610, Rw=VW-o-610; // chỉ vẽ khi đủ rộng, tránh khung cửa sổ tràn vào quán
    bx(0,0,Lw,228,'#3e5446',x); bx(0,0,Lw,4,'#2a3a30',x); bx(0,10,Lw,13,'#22302a',x); bx(0,22.5,Lw,.5,'#c9a45a',x);
    x.font='800 7px "Be Vietnam Pro",sans-serif'; x.fillStyle='#e8d4a0'; x.fillText('TIỆM HOA',Math.max(4,Lw-48),19.5);
    bx(Math.max(4,Lw-84),34,78,120,'#22302a',x); bx(Math.max(6,Lw-82),36,74,116,'#f0d8a8',x); x.fillStyle=grad(0,36,0,152,[[0,'rgba(255,236,200,.4)'],[1,'rgba(160,110,60,.35)']]); x.fillRect(Math.max(6,Lw-82),36,74,116); bx(Math.max(6,Lw-82),110,74,1.5,'#22302a',x);
    for(let i=0;i<6;i++){ const cx=Math.max(10,Lw-78)+i*12; if(cx>Lw-8) break; bx(cx,100,8,10,'#8a8f96',x); disc(cx+4,96,5,['#e8a0b0','#f4f0e6','#f2c84a','#d86a5a','#c8a0d8','#f4f0e6'][i],x); disc(cx+3,95,2,'#ffffff',x); }
    bx(Rx,0,Rw,228,'#ece2d0',x); bx(Rx,0,Rw,4,'#c8bca6',x); for(let i=0;i<Rw;i+=8){ bx(Rx+i,22,4,10,'#b8604a',x); bx(Rx+i+4,22,4,10,'#f4ece0',x); } bx(Rx,31,Rw,1.5,'#8a3e30',x);
    x.font='800 7px "Be Vietnam Pro",sans-serif'; x.fillStyle='#6b3e22'; x.fillText('BÁNH NGỌT',Rx+8,16);
    bx(Rx+6,42,Math.min(80,Rw-12),110,'#5a3d2a',x); bx(Rx+8,44,Math.min(76,Rw-16),106,'#f6e4c0',x); bx(Rx+8,96,Math.min(76,Rw-16),1.5,'#5a3d2a',x);
    for(let i=0;i<5;i++){ const cx=Rx+12+i*14; if(cx>VW-12) break; ellipse(cx+5,92,6,3,'#d89a52',x); ellipse(cx+5,91,5,2,'#e8b46a',x); ellipse(cx+5,124,5,4,'#f4f0e6',x); hp(cx+4,119,2,2,'#c84a3a'); } }
}
/* ---- nền: cây xoài cổ thụ, nhà mái tôn, giếng, rào gỗ, đất đỏ cam, ao có cầu gỗ, luống rau, đường đất ---- */
const bg=document.createElement('canvas'); const bgc=bg.getContext('2d'); let bgKey='';
const POND={cx:522,cy:254,rx:100,ry:34};
function inPond(x,y,m){ m=m||0; const e=((x-POND.cx)/(POND.rx-m))**2+((y-POND.cy)/(POND.ry-m))**2; return e<=1||(x>POND.cx&&y>222+m&&y<286-m); }
function tinRoof(x,x0,y0,w,h,seed){ // mái tôn: sóng dọc, rỉ sét loang
  const f=(a,b,ww,hh,c)=>{ x.fillStyle=c; x.fillRect(a,b,ww,hh); }, r=srand(seed);
  for(let i=0;i<w;i+=3){ f(x0+i,y0,2,h,'#a9adb0'); f(x0+i+2,y0,1,h,'#7d8287'); f(x0+i,y0,1,h,'#c8ccce'); }
  for(let i=0;i<w*h/90;i++){ const a=x0+r()*w, b=y0+r()*h, ww=3+r()*10, hh=2+r()*5; f(a,b,ww,hh,r()<.5?'rgba(176,86,40,.55)':'rgba(140,64,30,.5)'); }
  for(let i=0;i<w/14;i++){ const a=x0+r()*w; f(a,y0,r()*6+2,h,'rgba(196,106,50,.35)'); }
  f(x0,y0,w,1,'#d8dcde'); f(x0,y0+h-1,w,1,'#5a5e62'); for(let i=0;i<w;i+=12) f(x0+i+1,y0+2,1,1,'#3b3f44');
}
function house(x,hx,tet){
  const f=(a,b,w,h,c)=>{ x.fillStyle=c; x.fillRect(a,b,w,h); };
  // vách ván gỗ
  f(hx,22,190,34,'#7a4e2c'); for(let i=0;i<190;i+=6){ f(hx+i,22,1,34,'#5e3a20'); f(hx+i+1,22,1,34,'#8f5f36'); } for(let i=0;i<30;i++) f(hx+((i*53)%186),24+((i*17)%30),3,1,'#6a4224');
  // cửa mở, ánh đèn vàng bên trong
  f(hx+40,28,26,28,'#3b2516'); f(hx+42,30,22,26,'#e8b45a'); f(hx+42,30,22,4,'#f6d48a'); f(hx+44,40,8,10,'#a87038'); f(hx+56,36,6,14,'#c88a48'); f(hx+66,28,9,28,'#8a5a3b'); f(hx+67,30,7,24,'#9b6a42');
  // cửa sổ có kệ ly, tủ lạnh trên hiên
  f(hx+92,30,34,18,'#3b2516'); f(hx+94,32,30,14,'#d89a4a'); f(hx+94,38,30,1,'#6b4329'); [96,101,106,111,116,120].forEach((d,i)=>{ f(hx+d,34,3,4,['#e8f4f7','#c4473a','#5a9a4f','#e8f4f7','#e9b23f','#e8f4f7'][i]); f(hx+d,40,3,5,['#f4efe6','#6b4329','#e8f4f7'][i%3]); });
  f(hx+134,26,20,30,'#5a6066'); f(hx+135,27,18,28,'#e8ecee'); f(hx+135,40,18,1,'#b8bec4'); f(hx+150,30,1,6,'#9aa0a6'); f(hx+150,43,1,6,'#9aa0a6'); f(hx+138,29,4,3,'#e2574c');
  f(hx+160,30,22,20,'#3b2516'); f(hx+162,32,18,16,'#c88a48'); f(hx+170,32,1,16,'#6b4329');
  // hiên gỗ + bậc thềm
  f(hx-4,54,198,8,'#9a6a3c'); for(let i=0;i<198;i+=7) f(hx-4+i,54,1,8,'#6b4329'); f(hx-4,54,198,1,'#c48a52'); f(hx-4,61,198,1,'#5a3a20');
  f(hx+46,62,30,4,'#9a958a'); f(hx+46,62,30,1,'#c9c2b4');
  // mái tôn + cột hiên
  tinRoof(x,hx-10,0,212,22,41); f(hx-10,21,212,2,'#4a4e52'); f(hx-8,23,208,2,'rgba(30,20,10,.35)');
  [hx-4,hx+86,hx+190].forEach(px=>{ f(px,23,4,32,'#6b4329'); f(px,23,1,32,'#9a6a42'); });
  // đèn hiên
  [hx+30,hx+128].forEach(cx=>{ f(cx,23,1,4,'#2b1d16'); f(cx-2,27,5,6,'#3b2516'); f(cx-1,28,3,4,'#ffd36b'); });
  // chậu hoa trên hiên, chổi, thùng đá đỏ, bình nước lọc
  [[hx+4,'#e889a8'],[hx+18,'#ffffff'],[hx+82,'#f2c14e'],[hx+178,'#e2574c']].forEach(([px,fl])=>{ f(px,46,8,8,'#a85a34'); f(px,46,8,1,'#c87a4a'); disc(px+4,42,5,'#3f7a30',x); disc(px+3,40,3,'#5a9e34',x); f(px+2,39,2,2,fl); f(px+5,41,2,2,fl); });
  f(hx+186,34,1,20,'#c9a46a'); for(let i=0;i<5;i++) f(hx+184+i,50,1,5,'#d8b878');
  f(hx-26,46,14,10,'#c4473a'); f(hx-26,46,14,3,'#f4efe6'); f(hx-22,42,6,4,'#c9ced4'); f(hx-21,38,4,4,'#8fb8d0');
  // mèo trên mái
  f(hx+150,-4,8,5,'#e8a04a'); f(hx+156,-6,4,4,'#e8a04a'); f(hx+156,-7,1,1,'#c8742e'); f(hx+159,-7,1,1,'#c8742e'); f(hx+151,-3,6,1,'#f4d0a0');
  if(tet){ [hx+36,hx+70].forEach(cx=>{ f(cx,32,3,18,'#d9473b'); for(let k2=0;k2<4;k2++) f(cx+1,34+k2*4,1,2,'#ffd166'); }); }
}
function well(x,wx){ const f=(a,b,w,h,c)=>{ x.fillStyle=c; x.fillRect(a,b,w,h); };
  ellipse(wx,60,14,3,'rgba(0,0,0,.2)',x);
  f(wx-11,46,22,13,'#8a8478'); for(let r=0;r<4;r++) for(let k2=0;k2<6;k2++) f(wx-11+k2*4+(r%2)*2,46+r*3,3.5,2.5,r%2?'#9a958a':'#7a7468');
  ellipse(wx,46,11,3.5,'#b8b2a4',x); ellipse(wx,46,8.5,2.2,'#1f2c33',x); for(let i=0;i<6;i++) f(wx-10+i*4,52+(i%2)*3,2,2,'#6f8a3a');
  f(wx-13,28,2,20,'#6b4329'); f(wx+11,28,2,20,'#6b4329'); f(wx-14,27,28,2,'#5a3a26');
  f(wx-.5,29,1,10,'#c9b48a'); f(wx-3,39,6,4,'#5a6e8a'); f(wx-3,39,6,1,'#8aa0b8');
}
function buildBG(){
  const se=seasonNow(), tn=tetNear(curDay()), k=VW+'|'+se+'|'+tn+'|'+cartC()+'|'+(cfg().city?cfg().loc:''); if(k===bgKey) return; bgKey=k;
  bg.width=VW*2; bg.height=H*2; const x=bgc, o=OX; x.setTransform(2,0,0,2,0,0); x.imageSmoothingEnabled=false; x.clearRect(0,0,VW,H);
  const rr=srand(11), R2=(a,b)=>a+rr()*(b-a), hp=(px,py,w,h,c)=>{ x.fillStyle=c; x.fillRect(Math.round(px*2)/2,Math.round(py*2)/2,w,h); };
  if(cfg().city){ buildCityBG(x,o,hp,rr,R2); return; }
  const pal=LEAF[se], blade=[pal[1],pal[2],'#8ab83e',pal[3],'#4f8a2c','#a6c44a'];
  const EARTH=['#bc7c48','#c68752','#ae6e40','#cf955e','#a4683c','#d6a06a'];
  // tán cây rậm phía xa (không thấy trời)
  bx(0,0,VW,60,'#1e3a20',x);
  // hàng tán cây chồng lớp: lớp sau tối hơn, lớp trước sáng hơn
  const farR=RAMP[se].map(c=>shade(c,.55)), nearR=RAMP[se].map(c=>shade(c,.7));
  [[farR,-20,14,34,16,.4],[nearR,10,32,40,18,.6]].forEach(([rp,sx,cy,rx,ry,dn],L)=>{ for(let cx=sx;cx<VW+rx;cx+=rx*1.3){
    const m=leafMass(srand(91+L*57+cx|0),cx,cy+R2(-4,4),rx*R2(.85,1.1),ry,rp,Math.round(rx*dn*2),1,{dim:1,s0:3,sv:4,holes:1}); x.drawImage(m.c,m.x0,m.y0); } }); // cảnh xa: dựng ở 1x cho nhẹ
  // đất đỏ cam toàn sân
  bx(0,60,VW,232,EARTH[0],x);
  for(let i=0;i<VW*1.6;i++) ellipse(R2(0,VW),R2(64,290),R2(3,12),R2(1.5,5),EARTH[i%6],x);
  for(let i=0;i<VW*14;i++) hp(R2(0,VW),R2(60,290),.5,.5,EARTH[Math.floor(rr()*6)]);
  for(let i=0;i<VW*.5;i++){ const px=R2(0,VW), py=R2(66,288); hp(px,py,1,.5,'#9a5a2c'); hp(px+.5,py+.5,1,.5,'#e8b070'); }
  // rào gỗ cũ phía sau, dây leo
  for(let i=0;i<VW;i+=9){ hp(i,36+(i*7%4),3,30,'#7a5a3a'); hp(i,36+(i*7%4),1,30,'#9a7a52'); hp(i+2.5,38,.5,28,'#5a3e26'); }
  hp(0,44,VW,2,'#8a6a44'); hp(0,56,VW,2,'#8a6a44'); hp(0,44,VW,.5,'#a8865a');
  for(let i=0;i<VW*.35;i++){ const vx=R2(0,VW), vy=R2(34,62); hp(vx,vy,1.5,1.5,rr()<.5?pal[1]:pal[2]); if(rr()<.1) hp(vx,vy,1,1,'#e889a8'); }
  drawTree('chuoi',o+6,66,0,se,x,1.1); drawTree('cau',o+272,62,0,se,x,1); drawTree('chuoi',o+340,64,1,se,x,.9);
  well(x,o+310); drawTree('cau',o+386,60,1,se,x,.95);
  house(x,o+404,tn);
  // lối mòn sáng màu: cổng → xe cafe → hiên nhà, rẽ ra cầu ao
  const worn=(pts,w)=>{ for(let s=0;s<pts.length-1;s++){ const [a,b]=pts[s],[c,d]=pts[s+1], n=Math.hypot(c-a,d-b); for(let t=0;t<n;t+=1.5){ const px=a+(c-a)*t/n, py=b+(d-b)*t/n; ellipse(o+px+R2(-2,2),py+R2(-1,1),w+R2(-2,2),w*.45,rr()<.5?'#d29a66':'#cc955e',x); } } };
  worn([[304,292],[304,200],[300,152],[360,120],[440,90],[470,66]],10); worn([[304,210],[380,212],[436,224]],7); worn([[300,150],[200,150],[120,140]],12);
  for(let i=0;i<60;i++){ const fx=o+R2(296,312), fy=R2(170,286); hp(fx,fy,1,1.5,'#9a5a2c'); hp(fx+1.5,fy-.5,1,1,'#9a5a2c'); } // dấu chân
  drawTree('da',o+150,72,0,se,x,1.15);
  // bóng tán xoài + đốm nắng
  for(let i=0;i<70;i++) ellipse(o+R2(20,300),R2(64,124),R2(6,18),R2(2,5),'rgba(60,30,10,.08)',x);
  for(let i=0;i<40;i++) ellipse(o+R2(20,300),R2(70,124),R2(2,4),R2(1,1.8),'rgba(255,214,130,.28)',x);
  // cỏ rậm ven rào, góc vườn
  const grass=(cx,cy,rx,ry,n)=>{ for(let i=0;i<n;i++){ const a=rr()*Math.PI*2, d=Math.sqrt(rr()), gx=cx+Math.cos(a)*rx*d, gy=cy+Math.sin(a)*ry*d; ellipse(gx,gy,R2(2,6),R2(1,2.5),rr()<.5?pal[1]:'#5a9a34',x); }
    for(let i=0;i<n*5;i++){ const a=rr()*Math.PI*2, d=Math.sqrt(rr()), gx=cx+Math.cos(a)*rx*1.08*d, gy=cy+Math.sin(a)*ry*1.1*d, h=R2(1.5,4); hp(gx,gy-h,.5,h,blade[Math.floor(rr()*6)]); }
    for(let i=0;i<n*.6;i++){ const gx=cx+R2(-rx,rx)*.8, gy=cy+R2(-ry,ry)*.7; hp(gx,gy,1,1,['#ffffff','#f5d43a','#e889a8','#9b7fd4'][Math.floor(rr()*4)]); } };
  for(let i=0;i<VW;i+=22) grass(i+R2(-6,6),68,R2(14,22),R2(4,7),40);
  for(let i=0;i<VW;i+=20) grass(i+R2(-6,6),282,R2(12,20),R2(5,9),36);
  grass(o+8,130,14,60,120); grass(o+220,220,40,14,90); grass(o+380,180,26,12,60); grass(o+170,190,18,8,40); grass(o+560,120,40,30,140); grass(o+250,110,22,8,40);
  grass(o+480,150,46,20,150); grass(o+60,236,34,10,70); grass(o+240,268,44,12,90); grass(o+372,266,30,12,60); grass(o+130,186,22,8,40); grass(o+575,196,26,12,60); grass(o+400,236,14,10,30); grass(o+200,96,30,8,50);
  for(let i=0;i<VW*.6;i++){ const px=R2(0,VW), py=R2(70,286); for(let k2=0;k2<4;k2++) hp(px+k2*.7-1,py-R2(1,3),.5,R2(1,3),blade[k2]); }
  // đá lót lối đi (đá xám rêu, hình dạng bất kỳ)
  const stone=(cx,cy,s)=>{ ellipse(cx+.5,cy+1,s*1.15,s*.7,'#5f5a52',x); ellipse(cx,cy,s,s*.6,'#9a958a',x); ellipse(cx-s*.25,cy-s*.15,s*.6,s*.32,'#bdb7aa',x); hp(cx+s*.3,cy+s*.1,1.5,1,'#6f8f3a'); hp(cx-s*.7,cy,1,.5,'#7fa04a'); };
  for(let yy=168;yy<286;yy+=13) stone(o+300+(Math.floor(yy/13)%2)*8,yy,R2(4.5,6));
  [[330,140],[352,128],[376,116],[400,104],[424,92],[448,80],[466,70]].forEach(([a,b])=>stone(o+a+R2(-2,2),b,R2(4,5.5)));
  [[330,212],[352,214],[376,215],[400,218]].forEach(([a,b])=>stone(o+a,b,R2(4,5)));
  for(let i=0;i<14;i++) stone(o+R2(20,600),R2(80,280),R2(2,3.5));
  // trước xe cafe: nền đất nện
  const [l0,l1]=laneSpan(cartC()); for(let i=0;i<220;i++) hp(o+cellX(l0)+R2(0,(l1-l0+1)*CS),R2(130,160),1,.5,rr()<.5?'#b06a36':'#e0a868');
  // góc rửa + xe máy dựng dưới gốc xoài (ô c0–2, r6–8)
  const f=(a,b,w,h,c)=>{ x.fillStyle=c; x.fillRect(o+a,b,w,h); };
  f(18,168,20,3,'#8a5a3b'); f(19,171,2,16,'#6b4329'); f(35,171,2,16,'#6b4329'); f(20,164,16,5,'#c9ced4'); f(21,165,14,2,'#7fa8c0'); f(27,158,1,6,'#9aa0a6'); f(26,158,4,1,'#9aa0a6');
  f(40,176,6,10,'#d8d0c0'); f(40,174,6,2,'#c4473a'); f(41,178,4,1,'#c4473a'); // phích nước
  f(20,190,10,6,'#c9a46a'); for(let i=0;i<10;i+=2) f(20+i,190,1,6,'#a8843e'); // rổ
  f(48,200,3,1,'#c4473a'); f(52,200,3,1,'#3f6fb0'); // dép
  // xe máy (Cub) đứng nghiêng
  disc(o+26,204,5,OUT,x); disc(o+26,204,3.5,'#3a3a3a',x); disc(o+54,204,5,OUT,x); disc(o+54,204,3.5,'#3a3a3a',x); f(25,203,2,2,'#999'); f(53,203,2,2,'#999');
  f(28,194,26,5,'#8a2a2a'); f(30,192,12,3,'#2b2b2b'); f(44,191,10,7,'#b8bcc0'); f(52,184,2,10,'#6a6a6a'); f(48,183,10,2,'#2b2b2b'); f(56,185,2,2,'#ffe9b0'); f(30,199,20,2,'#5a5a5a'); f(26,196,6,3,'#c9a46a');
  // luống rau có rào gỗ (ô c0–7, r11–13)
  f(18,244,124,42,'#6a3a20'); for(let r=0;r<5;r++){ f(20,248+r*8,120,3,'#5a3018'); f(20,251+r*8,120,1,'#8a5030'); }
  for(let r=0;r<5;r++) for(let i=0;i<12;i++){ const px=o+24+i*10, py=249+r*8; if(r%2===0){ disc(px,py,2.6,'#3f8a2c',x); disc(px-.5,py-.8,1.6,'#7fc04a',x); } else if(r===1){ disc(px,py,2.4,'#6a3a6a',x); hp(px-1,py-1,1.5,1,'#9a5a9a'); } else { hp(px,py-4,.5,5,'#c9a46a'); disc(px,py-1,2,'#4f8a2c',x); if(i%2) hp(px+1,py-2,1.2,1.2,'#e2574c'); } }
  for(let i=0;i<=7;i++){ f(16+i*18,238,3,50,'#7a5a3a'); f(16+i*18,238,1,50,'#a8865a'); f(16+i*18,237,3,1,'#5a3e26'); }
  f(16,246,130,2,'#8a6a44'); f(16,262,130,2,'#8a6a44'); f(16,246,130,.5,'#b8966a'); f(144,238,3,50,'#7a5a3a');
  // ao nước có cầu gỗ, thuyền
  for(let yy=200;yy<290;yy+=.5) for(let xx=410;xx<VW-o+2;xx+=.5){ if(!inPond(xx,yy,-5)) continue; if(inPond(xx,yy,0)){ const deep=inPond(xx,yy,12); hp(o+xx,yy,.5,.5,deep?'#2f9aa6':'#46b8b4'); } else hp(o+xx,yy,.5,.5,((xx*7+yy*3)|0)%5?'#7a5a3a':'#5f8a3a'); }
  for(let i=0;i<120;i++){ const a=rr()*Math.PI*2, px=POND.cx+Math.cos(a)*(POND.rx+2), py=POND.cy+Math.sin(a)*(POND.ry+2); if(py<290) { ellipse(o+px,py,R2(1.5,3),R2(1,2),rr()<.5?'#8a847a':'#a8a294',x); } }
  for(let i=0;i<140;i++){ const a=Math.PI*(1+rr()), px=POND.cx+Math.cos(a)*(POND.rx+4), py=POND.cy+Math.sin(a)*(POND.ry+4)+R2(-2,2), h=R2(3,8); if(py<286) hp(o+px,py-h,.5,h,rr()<.3?'#c9b06a':blade[Math.floor(rr()*6)]); }
  for(let i=0;i<60;i++){ const px=R2(440,VW-o-4), py=R2(226,284); if(!inPond(px,py,6)) continue; hp(o+px,py,R2(3,8),.5,'#8fdcd4'); }
  for(let i=0;i<16;i++){ const px=R2(450,VW-o-6), py=R2(234,282); if(!inPond(px,py,6)) continue; disc(o+px,py,2.6,'#3f8a3a',x); disc(o+px-.5,py-.5,1.8,'#5aa64c',x); hp(o+px,py-.5,1.5,.5,'#2f6a2c'); if(se!==3&&i%3===0){ hp(o+px-1,py-3,2.5,2,'#f2a0c0'); hp(o+px-.5,py-2.5,1,1,'#ffe27a'); } }
  f(430,222,58,12,'#8a5a32'); for(let i=0;i<58;i+=5){ f(430+i,222,1,12,'#5a3a20'); f(431+i,222,3,1,'#b8864e'); } f(430,233,58,2,'#4a2e18');
  [432,452,472,486].forEach(px=>{ f(px,234,3,10,'#5a3a20'); f(px,242,3,2,'rgba(30,60,70,.5)'); }); f(468,218,3,6,'#6b4329'); f(469,214,2,4,'#9aa0a6');
  // thuyền gỗ neo cạnh cầu
  ellipse(o+512,246,22,6,'#4a2e18',x); ellipse(o+512,244,21,5,'#8a5a32',x); ellipse(o+512,244,17,3.2,'#5a3a20',x); for(let i=-12;i<=12;i+=6) hp(o+512+i,241.5,1,5,'#b8864e'); hp(o+490,244,2,1,'#c9a46a'); hp(o+478,240,12,.5,'#c9b48a');
  // rào gỗ phía trước, cổng để trống
  for(let i=0;i<VW;i+=16){ const gx=i-o; if(gx>=282&&gx<326) continue; hp(i,282+((i*3)%4),3,22,'#7a5a3a'); hp(i,282+((i*3)%4),1,22,'#a8865a'); hp(i+2.5,284,.5,20,'#4a3220'); }
  [[0,o+283],[o+325,VW]].forEach(([a,b])=>{ hp(a,290,b-a,2,'#8a6a44'); hp(a,298,b-a,2,'#8a6a44'); hp(a,290,b-a,.5,'#b8966a'); hp(a,298,b-a,.5,'#b8966a'); });
  for(let i=0;i<VW*.4;i++){ const vx=R2(0,VW), vy=R2(284,302); if(vx-o>=282&&vx-o<326) continue; hp(vx,vy,1.5,1,rr()<.5?pal[1]:pal[2]); }
  for(let i=0;i<VW;i+=2.5){ const h=R2(2,6); hp(i+R2(0,2),304-h,.5,h,blade[Math.floor(rr()*6)]); }
  // đường đất làng có vệt bánh xe
  bx(0,304,VW,34,'#b8733e',x); for(let i=0;i<VW*6;i++) hp(R2(0,VW),R2(304,338),.5,.5,EARTH[Math.floor(rr()*6)]);
  for(let i=0;i<VW;i+=1){ hp(i,316+Math.sin(i*.05)*.6,1,1.5,'#9a5a2c'); hp(i,330+Math.sin(i*.04)*.6,1,1.5,'#9a5a2c'); if(rr()<.5) hp(i,322+R2(0,3),.5,R2(1,2.5),blade[Math.floor(rr()*6)]); }
  for(let i=0;i<VW;i+=1.5){ if(rr()<.7) hp(i,304,.5,R2(1,3),blade[Math.floor(rr()*6)]); }
}
/* ---- xe cafe ---- */
const CART_BULBS=[12,20,68,78];
const RUST=(()=>{ const s=srand(23), out=[]; for(let i=0;i<14;i++) out.push([s()*90,s()*10,3+s()*9,2+s()*4,s()<.5?'rgba(176,86,40,.6)':'rgba(140,64,30,.55)']); return out; })();
function cartBack(){ const L=cartL(); ellipse(L+44,130,48,4.5,'rgba(40,20,5,.28)');
  ob(L+4,58,2.5,46,'#6b4329'); hb(L+4,58,.8,46,'#9a6a42'); ob(L+82,58,2.5,46,'#6b4329'); hb(L+82,58,.8,46,'#9a6a42');
  // kệ gỗ phía sau quầy: hũ thủy tinh, chai lọ
  hob(L+8,70,72,26,'#5a3a20'); hb(L+8,70,72,1,'#7a5232'); [79,88].forEach(y=>{ hb(L+8,y,72,1.5,'#8a5a32'); hb(L+8,y+1.5,72,.5,'#3b2516'); });
  const jars=['#c98b4a','#6b4329','#e9b23f','#8fbf5a','#f4efe6','#c4473a','#6b4329','#e9b23f'];
  for(let i=0;i<8;i++){ const jx=L+10+i*8.6; hb(jx,73,5,6,'#e9f4f7'); hb(jx+.5,75,4,4,jars[i]); hb(jx+.5,72,4,1,'#9aa0a6'); }
  for(let i=0;i<7;i++){ const jx=L+12+i*9.6; hb(jx,82,3,6,i%2?'#3f6a3a':'#8a5a2a'); hb(jx+.8,80.5,1.5,1.5,'#c9ced4'); }
}
function cartFront(){
  const L=cartL(), q=EQS.find(e=>e.id===cfg().eq).q;
  const W1='#b8804a',W2='#a8743f',W3='#8a5a32',W4='#5a3a20';
  // thân quầy ván gỗ + khung sắt
  ob(L+4,100,80,18,W2);
  for(let i=0;i<10;i++){ const x0=L+4+i*8; hb(x0,100,8,18,i%2?W2:W1); hb(x0,100,.5,18,W4); hb(x0+2+(i*3%4),104+(i%3)*4,3,.5,W3); }
  hb(L+4,100,80,1,'#d8a46a'); hb(L+4,116,80,2,W4);
  hb(L+2,118,84,2.5,'#5a5e62'); hb(L+2,118,84,.5,'#9aa0a6');
  ob(L+34,104,20,9,'#efe2c0'); hb(L+34,104,20,1,'#fff8e6'); hb(L+39,106.5,7,5,'#f4efe6'); hb(L+39,106.5,7,1.5,'#6b4329'); hb(L+46,107.5,1.5,3,'#f4efe6'); hb(L+38,111.5,9,.8,'#c9a46a'); hb(L+41,104.5,.6,1.5,'#c9b8a0'); hb(L+43,104,.6,2,'#c9b8a0');
  // mặt quầy gỗ dày
  ob(L,96,88,4,'#c98b4a'); hb(L,96,88,1,'#e8b678'); hb(L,99,88,1,'#9a6232');
  // bánh xe cao su + càng kéo
  [[L+14,123],[L+74,123]].forEach(([wx,wy])=>{ disc(wx,wy,5.5,OUT); disc(wx,wy,4.8,'#2b2b2b'); disc(wx,wy,2.2,'#8a8f96'); hb(wx-.5,wy-.5,1,1,'#c8ccce'); });
  ob(L+84,112,9,1.5,'#5a5e62'); ob(L+92,110,1.5,7,'#5a5e62');
  // đồ trên quầy
  for(let i=0;i<3;i++){ const px=L+8+i*7;
    if(q===1){ hb(px,91,5,5,'rgba(225,238,245,.9)'); hb(px+.5,93,4,3,'#3b2516'); hb(px,87,5,4,'#c9ced4'); hb(px,87,5,.5,'#eef0f2'); hb(px+1.5,86,2,1,'#9aa0a8'); }
    else { hb(px,91,5,5,'rgba(225,238,245,.9)'); hb(px+.5,92.5,4,3.5,i===1?'#d8a46a':'#5a3220'); hb(px+.5,92.5,4,1,'#f4efe6'); } }
  if(q===2){ ob(L+30,84,14,12,'#c9ced4'); hb(L+30,84,14,2,'#8a8f96'); hb(L+34,90,6,2,'#3b3b45'); hb(L+41,86,1.5,1.5,'#c4473a'); }
  if(q===3){ ob(L+28,83,20,13,'#c9ced4'); hb(L+28,83,20,2,'#8a8f96'); hb(L+31,89,5,2,'#3b3b45'); hb(L+40,89,5,2,'#3b3b45'); hb(L+37,85,2,1.5,'#c4473a'); ob(L+20,85,5,11,'#3b3b45'); hb(L+20.5,85,4,3,'#6b4329'); }
  ob(L+52,89,4,7,'#f4f1ea'); hb(L+52,91,4,2,'#c4473a'); ob(L+57,90,4,6,'#f4f1ea'); hb(L+57,92,4,1.5,'#3f6fb0');
  ob(L+63,88,6,8,'#e9f4f7'); hb(L+63,91,6,5,'#6b4329'); hb(L+63,88,6,1,'#c9ced4');
  ob(L+71,89,8,7,'#b87333'); hb(L+71,89,8,1.5,'#d99a5a'); hb(L+73,87.5,4,1.5,'#8a5524'); hb(L+79,91,2.5,1,'#b87333');
  if(isOpen()) for(let i=0;i<3;i++){ const t=(tt*1.2+i*.33)%1; hb(L+80+Math.sin((t+i)*6)*1.2,89-t*12,1.2,1.2,`rgba(255,255,255,${.55*(1-t)})`); }
  // thùng đá đỏ + phích nước cạnh xe
  ob(L+86,110,12,11,'#c4473a'); hb(L+86,110,12,3,'#f4efe6'); hb(L+86,113,12,.5,'#8a2a20'); hb(L+90,111,4,1,'#c9ced4');
  ob(L+90,101,4,9,'#3f8a6a'); hb(L+90,101,4,1.5,'#c9ced4'); hb(L+90,105,4,.5,'#2f6a52');
}
function awning(){ const L=cartL();
  // mái tôn sóng, rỉ sét
  for(let i=0;i<96;i+=3){ hb(L-4+i,48,2,12,'#a9adb0'); hb(L-4+i,48,.5,12,'#c8ccce'); hb(L-2+i,48,1,12,'#7d8287'); }
  RUST.forEach(([a,b,w,h,c])=>hb(L-4+a,48+b,w,Math.min(h,12-b),c));
  hb(L-4,48,96,.5,'#e0e4e6'); hb(L-5,59.5,98,1.5,'#4a4e52'); hb(L-4,61,96,1,'rgba(30,20,10,.35)');
  hb(L-2,61,92,2,'#6b4329'); hb(L-2,61,92,.5,'#9a6a42');
  // bảng hiệu gỗ "CÀ PHÊ" treo dưới mái
  hb(L+31,63,.6,3,'#3b2516'); hb(L+57,63,.6,3,'#3b2516'); ob(L+27,66,34,9,'#d8a868'); hb(L+27,66,34,1,'#f0c88a'); hb(L+28,74,32,.5,'#8a5a32');
  g.fillStyle='#4a2a14'; g.font='bold 6px "Be Vietnam Pro",sans-serif'; g.fillText('CÀ PHÊ',L+33.5,73.2);
  // biển mở cửa nhỏ + bóng đèn dây tóc
  const on=isOpen(); hb(L+86,63,.6,4,'#3b2516'); ob(L+81,67,11,5,on?'#3f7a3c':'#8a3a2c'); g.fillStyle='#fff1d6'; g.font='bold 3px "Be Vietnam Pro",sans-serif'; g.fillText(on?'MỞ':'NGHỈ',L+(on?83.5:82.3),70.9);
  const lit=on&&!outage; CART_BULBS.forEach(b0=>{ hb(L+b0+.7,63,.5,4,'#3b2516'); hb(L+b0,67,2,2.6,lit?'#ffd36b':'#7a6a55'); if(lit) hb(L+b0+.5,67.5,1,1,'#fff6d0'); });
}
function homeSlot(i){ const L=cartL(); return [L+[44,30,58,18,70,8][i]||L+44,104]; }
function staffDraw(){
  const n=Math.min(cfg().staff+1,6);
  for(let i=n-1;i>=0;i--){ if(i>0&&crew[i-1]&&!crew[i-1].home) continue;
    const [x,y]=homeSlot(i), b=serveFx>0&&i===0; blit(spr(staffSpr[i],'d',b?1:0,'stand'),x,y+(b?-1:0),false); }
}
function easel(){ const x=cartL()+110,y=128; ellipse(x,y,11,1.5,'rgba(40,20,5,.28)');
  bx(x-8,y-24,1,24,'#6b4329'); bx(x+7,y-24,1,24,'#6b4329'); ob(x-10,y-34,20,26,'#2a3a32'); hb(x-10.5,y-34.5,21,1,'#8a5a3b'); hb(x-10.5,y-8.5,21,1,'#8a5a3b');
  g.fillStyle='#f1ead8'; g.font='bold 3px "Be Vietnam Pro",sans-serif'; ['CÀ PHÊ','CF SỮA','BẠC XỈU','TRÀ TẮC'].forEach((t,i)=>g.fillText(t,x-8.5,y-29.5+i*4.2));
  g.fillStyle='#ffd166'; g.font='bold 4.5px "Pixelify Sans",monospace'; g.fillText(Math.round(cfg().price/1000)+'K',x-4,y-10.5);
  hb(x+4,y-15,3,2,'#f1ead8'); hb(x+7,y-14.5,1,1,'#f1ead8'); }

/* ---- đồ đặt trong vườn ---- */
function drawItem(o,ghost,part){
  const it=catOf(o.id), X=cellX(o.c), Y=cellY(o.r), se=seasonNow();
  const shadow=(cx,cy,rx,ry)=>ellipse(cx,cy,rx,ry,'rgba(0,0,0,.18)');
  const cups=(cy)=>{ if(ghost) return; seats.forEach(s=>{ if(s.o===o&&s.who&&(s.who.st==='sit'||s.who.st==='idle')){ const cx=(X+it.w*8)+(s.x<X+it.w*8?-3.5:2); hob(cx,cy,1.5,1.5,'#f4efe6'); hb(cx,cy,1.5,.5,'#8a5a3b');
      if(se===3||se===0||clock<9){ const k=(tt*.9+cx*.13)%1; g.fillStyle=`rgba(255,255,255,${.55*(1-k)})`; g.fillRect(cx+.5+Math.sin(tt*3+cx)*.6,cy-1.5-k*5,.6,1.2); g.fillRect(cx+1+Math.sin(tt*3.4+cx)*.6,cy-2.5-((k+.5)%1)*5,.5,1); } } }); };
  if(it.tree){ drawTree(it.tree,X+it.w*8,Y+it.h*16-2,o.c*7+o.r,it.tree==='mai'&&tetNear(curDay())?4:se,g,(THUMB?.38:1)*(it.sc||1)); return; }
  if(o.id==='ghe'||o.id==='du'){ const x=X+16,y=Y+14; shadow(x,y,o.id==='du'?18:14,o.id==='du'?3:1.5);
    const stool=(s,c,cl,cd)=>{ hob(s-2.5,y-4,5,1.5,c); hb(s-2.5,y-4,5,.5,cl); hb(s-2.5,y-2.5,.7,2.5,cd); hb(s+1.8,y-2.5,.7,2.5,cd); hb(s-1,y-2.5,2,.6,cd); };
    stool(x-10,'#d8382c','#f07060','#a8281e'); stool(x+10,'#3f7fd1','#7fb0ee','#2f5fa8');
    hob(x-6,y-8,12,2.5,'#9a6a3c'); hb(x-6,y-8,12,.5,'#c48a52'); hb(x-5.5,y-5.5,1,5.5,'#6b4329'); hb(x+4.5,y-5.5,1,5.5,'#6b4329');
    if(!seats.some(s=>s.o===o&&s.who)){ hb(x-3,y-11,2,3,'rgba(225,238,245,.9)'); hb(x-3,y-10,2,2,'#c98b4a'); hb(x+1.5,y-12.5,1.5,4.5,'#6a8a9a'); hb(x+1.8,y-13.5,1,1,'#c9ced4'); }
    cups(y-9.5);
    if(o.id==='du'){ hb(x-.5,y-31,1,23,'#d8d0c0'); hb(x-.5,y-31,.5,23,'#ffffff');
      for(let i=0;i<10;i++){ const w=4+i*3.4; hb(x-w/2,y-37+i,w,1,i%2?'#efe6d0':'#e2d6b8'); }
      for(let k=-3;k<=3;k++) for(let i=1;i<10;i++) hb(x+k*i*.5,y-37+i,.5,1,'#c8bc9e');
      for(let k=0;k<7;k++) hb(x-17+k*5,y-27,3,1,'#d8ccb0'); hb(x-17.5,y-28,35,.5,'#b8ac8e'); hb(x-.5,y-38.5,1,1.5,'#8a5a3b'); } }
  else if(o.id==='tbl'){ const x=X+16,y=Y+14; shadow(x,y,14,1.5);
    [x-12,x+12].forEach(s=>{ hob(s-2.5,y-4,5,1.5,'#d8c07a'); hb(s-2,y-2.5,1,2.5,'#a8904a'); hb(s+1,y-2.5,1,2.5,'#a8904a'); });
    hob(x-6,y-9,12,3,'#d8c07a'); for(let i=0;i<6;i++) hb(x-6+i*2,y-9,.5,3,'#b89a52'); hb(x-6,y-9,12,.5,'#f0dc9a'); hb(x-5,y-6,1,6,'#a8904a'); hb(x+4,y-6,1,6,'#a8904a'); cups(y-10.5); }
  else if(o.id==='vong'){ const x0=X+2,x1=X+30,y=Y+14; shadow(X+16,y,14,1.5);
    ob(x0-1,y-15,2,15,'#8a5a3b'); ob(x1-1,y-15,2,15,'#8a5a3b');
    for(let i=0;i<=26;i++){ const t=i/26, xx=x0+1+t*(x1-x0-2), yy=y-12+Math.sin(t*Math.PI)*6+(ghost?0:Math.sin(tt*1.5)*.6*Math.sin(t*Math.PI)); hb(xx,yy,1,2.5,(i>>1)%2?'#3f7fd1':'#e2574c'); } }
  else if(o.id==='choi'){
    if(part!=='roof'){ shadow(X+24,Y+28,24,4);
      [X+5,X+42].forEach(px=>{ ob(px,Y,2,28,'#a8904a'); hb(px,Y,.5,28,'#d8c07a'); });
      hob(X+18,Y+15,12,3,'#d8c07a'); for(let i=0;i<6;i++) hb(X+18+i*2,Y+15,.5,3,'#b89a52'); hb(X+19,Y+18,1,6,'#a8904a'); hb(X+28,Y+18,1,6,'#a8904a'); cups(Y+13.5); }
    if(part!=='back'){
      for(let yy=0;yy<16;yy++){ const t=yy/16, l=X+8-t*9, r=X+40+t*9; hb(l,Y-16+yy,r-l,1,yy%3===0?'#a8803a':'#c9a24a'); for(let xx=Math.ceil(l);xx<r;xx+=2) if((xx*7+yy*3)%5===0) hb(xx,Y-16+yy,.5,1,'#8a6a2c'); }
      hb(X+6,Y-17,36,1.5,'#7a5a2a'); for(let xx=X-1;xx<X+49;xx+=1.5) hb(xx,Y,1,1+((xx*3)%3),'#b8923a'); }
  }
  else if(o.id==='lantern'){ const x=X+8,y=Y+14; shadow(x,y,4,1);
    ob(x-.5,y-30,1.5,30,'#c9b06a'); hb(x-.5,y-30,1.5,.5,'#e6d29a'); hb(x,y-30,5,1,'#8f7438'); hb(x+4,y-29,.5,2,'#3b2516');
    hb(x+1,y-27,7,1,'#e9b23f'); ellipse(x+4.5,y-23,4,3.5,'#d9473b'); hb(x+1,y-24,7,.5,'#ffd166'); hb(x+1,y-22,7,.5,'#b8382c'); hb(x+2.5,y-26,1,6,'rgba(255,220,150,.35)'); hb(x+1,y-19.5,7,1,'#e9b23f'); hb(x+4,y-18.5,1,3,'#e9b23f'); }
  else if(o.id==='chau'){ const x=X+8,y=Y+14; shadow(x,y,6,1.5);
    // chậu sứ men trắng hoa lam: miệng loe, thân thon dần, có bóng sáng; trên là bụi hoa giấy rủ xuống
    for(let i=0;i<8;i++){ const w=9-i*.55; hb(x-w/2-.5,y-8+i,w+1,1,OUT); hb(x-w/2,y-8+i,w,1,i===0?'#ffffff':i<5?'#eef3f7':'#dfe7ee'); }
    hb(x-5.5,y-9.5,11,2,OUT); hb(x-5,y-9,10,1,'#f8fbfd'); hb(x-4.5,y-9.5,9,.6,'#5a3a26');
    hb(x-4.2,y-6.6,8.4,.7,'#2f5fa8'); hb(x-3.4,y-1.6,6.8,.6,'#2f5fa8');
    [[-3,-5],[-.6,-4.6],[1.8,-5]].forEach(([a,b])=>{ hb(x+a,y+b,1.2,1.2,'#3f6fb0'); hb(x+a+.3,y+b+1.4,.6,.8,'#6f9ad0'); });
    hb(x-3.6,y-7.5,.8,5.5,'rgba(255,255,255,.9)'); hb(x+2.8,y-7,.8,5,'rgba(110,130,150,.35)');
    hb(x-.3,y-13,.8,4,'#6b4329'); hb(x-3,y-12,3,.6,'#6b4329');
    [[-3.5,-12.5,3.2,'#3f7a3c'],[3,-13,3.2,'#4f8a42'],[0,-16,3,'#5a9a4c'],[-5.5,-10,2,'#3f7a3c'],[5.5,-10.5,2,'#4f8a42']].forEach(([a,b,r,c])=>disc(x+a,y+b,r,c));
    [[-4,-14],[-1.5,-17],[2,-16],[4.5,-13],[-5.5,-11],[6,-10],[0,-13],[-2.5,-12],[3,-11.5],[6.5,-8],[-6.5,-8]].forEach(([a,b],i)=>{ hb(x+a,y+b,1.6,1.6,i%3?'#e0408f':'#f06aa8'); if(i%4===0) hb(x+a+.5,y+b+.5,.6,.6,'#fff0a0'); }); }
  else if(o.id==='lu'){ const x=X+8,y=Y+14; shadow(x,y,6,1.5);
    ellipse(x,y-6,6,6,OUT); ellipse(x,y-6,5.5,5.5,'#5a3220'); ellipse(x-1,y-7,4,4.5,'#6e3e26'); hb(x-4,y-10,1,5,'#a0603a');
    ellipse(x,y-12,4.5,1.5,'#3b2516'); ellipse(x,y-12,3.5,1,'#2c4a5a'); hb(x+1,y-14,4,1,'#8a5a3b'); hb(x+4,y-15,2,2,'#6b4329'); }
  else if(o.id==='herb'){ const x=X+1,y=Y+4; hob(x,y,30,10,'#6b4a32'); hb(x,y,30,1,'#8a6444'); hb(x+1,y+3,28,.5,'#523726'); hb(x+1,y+7,28,.5,'#523726');
    const st=herbStage(o);
    for(let j=0;j<2;j++) for(let i=0;i<6;i++){ const px=x+3+i*5, py=y+3+j*4;
      if(st===0) hb(px,py,1,.5,'#3b2516');
      else if(st===1){ hb(px,py-1,.5,1.5,'#7fc060'); hb(px+.5,py-1.5,1,.5,'#9fd070'); }
      else if(st===2){ disc(px,py-1,1.3,'#5fae52'); hb(px-.5,py-2,1,.5,'#9fd070'); }
      else if(j===0){ disc(px,py-1.5,2.2,'#3f9a4a'); hb(px-1,py-3,1,1,'#7fd070'); hb(px+1,py-2,1,.5,'#2f7a3a'); }
      else { hb(px-1,py-5,.5,5,'#9ac060'); hb(px,py-6,.5,6,'#7fae50'); hb(px+1,py-5,.5,5,'#b0d070'); } }
    if(st===3&&!ghost&&Math.floor(tt*2+o.c)%5===0) hb(x+26,y-3,1,1,'#fff6c8'); }
  else if(o.id==='ao'){ const x=X+24,y=Y+18;
    ellipse(x,y+1,23,11,'#6f6a60'); ellipse(x,y,22,10,'#8f8678'); ellipse(x,y,20,8.5,'#3f7f8f'); ellipse(x-3,y-2,13,4,'#5f9fae');
    const a=tt*.7; [[0,'#f08a4b'],[Math.PI,'#ffffff']].forEach(([ph,c])=>{ const kx=x+Math.cos(a+ph)*12, ky=y+Math.sin(a+ph)*4; hb(kx,ky,3,1.5,c); hb(kx-1,ky,1,1,'#e2574c'); });
    [[-12,-2],[6,3],[12,-3],[-4,4],[1,-4],[-15,3]].forEach(([dx,dy])=>{ disc(x+dx,y+dy,3,'#3f8a42'); disc(x+dx-.5,y+dy-.5,2,'#5aa64c'); hb(x+dx,y+dy-1,1.5,.5,'#2f6a34'); });
    if(se!==3) [[-10,-5],[8,0],[13,-6]].forEach(([dx,dy],i)=>{ hb(x+dx-1.5,y+dy-2,3,2.5,i===2?'#7aae55':'#f2a0c0'); hb(x+dx-1,y+dy-3,2,1,i===2?'#8fc060':'#f8c4d6'); if(i!==2) hb(x+dx-.5,y+dy-1,1,1,'#ffe27a'); }); }
}

/* ---- cỏ dại ---- */
function weedStage(w){ return Math.min(2,Math.floor((curDay()-w.d)/3)); }
function weedPos(w){ return [cellX(w.c)+8+w.ox,cellY(w.r)+13+w.oy]; }
function drawWeed(w,hover){
  const [x,y]=weedPos(w), s=[.6,.85,1][weedStage(w)];
  if(hover){ g.fillStyle='rgba(255,246,200,.35)'; g.fillRect(x-6,y-10*s-2,12,10*s+4); }
  hb(x-3*s,y-.5,6*s,1,'rgba(40,60,20,.25)');
  if(w.k===0){ const cs=['#4f8a3a','#6fae4a','#3f7a30','#8ac25a']; for(let i=0;i<7;i++){ const h=(3+((i*5)%4))*s*1.4; hb(x-3*s+i*s,y-h,.5,h,cs[i%4]); } }
  else if(w.k===1){ for(let i=0;i<6;i++){ const a=-Math.PI/2+(i-2.5)*.42; for(let t=0;t<6*s;t+=.5) hb(x+Math.cos(a)*t,y+Math.sin(a)*t,.5,.5,i%2?'#7a9a3a':'#9ab84a'); }
    if(s===1){ for(let i=0;i<3;i++) hb(x-2+i*2,y-8,.5,3,'#b8a060'); } }
  else if(w.k===2){ disc(x,y-1.5*s,2.4*s,'#4f8a3a'); hb(x-2*s,y-2*s,1,1,'#6fae4a'); [[-1.5,-4],[1.5,-5],[0,-3]].forEach(([a,b])=>{ hb(x+a*s,y+b*s-1,.5,1.5,'#5f9a40'); hb(x+a*s-.5,y+b*s-1.5,1.5,1.5,'#f5d43a'); hb(x+a*s,y+b*s-1,.5,.5,'#e08a2a'); }); }
  else if(w.k===3){ for(let i=0;i<4;i++){ const a=-Math.PI+i*Math.PI/3+.4; for(let t=0;t<5*s;t+=1){ hb(x+Math.cos(a)*t,y-1+Math.sin(a)*t*.5,.5,.5,'#4f7a3a'); hb(x+Math.cos(a)*t,y-1.5+Math.sin(a)*t*.5,.5,.5,'#7aae55'); } }
    if(s>.8){ hb(x-1,y-4,1.5,1.5,'#f07aa8'); hb(x+2,y-3,1.5,1.5,'#f8a8c8'); } }
  else { for(let i=0;i<4;i++){ const h=(7+i%2*2)*s*1.2; hb(x-1.5+i,y-h,.5,h,i%2?'#9ab05a':'#b8c070'); } if(s===1){ hb(x-2,y-12,2,2,'#f2efe2'); hb(x,y-13,2,2,'#e6e2d2'); hb(x+1.5,y-11,1.5,1.5,'#f2efe2'); } }
}

/* ---- người, động vật, xe ---- */
let ents=[],queue=[],floats=[],bikes=[],drops=[],notes=[],leaves=[],seats=[],pets=[],bits=[],tkey='',ikey='';
let clock=17.2,play=null,speed=1,last=performance.now(),tt=0,tBike=0,tWalk=1,tAmb=2,tNote=0,rain=false,outage=false,serveFx=0;
let bugs=[], headlights=[], vign=null;
let edit=null, crew=[], tasks=[], THUMB=false, hoverE=null, hoverW=null, flies=[];
const IDLE_CLOCK=17.2; // cảnh chờ giữa các ngày: nắng chiều vàng
const isOpen=()=>play?play.open:cfg().open;
// ox/oy: mỗi người đi lệch lối một chút; pace: nhanh chậm khác nhau; wait: dừng lại giữa đường; look/side: đứng thì ngó nghiêng; chat: bong bóng tán gẫu khi ngồi
function mk(kind){ return {kind,x:0,y:0,vx:0,vy:0,path:[],spd:rnd(38,48),lk:mkLook(kind),spr:{},st:'',t:0,step:0,f:1,seat:null,mad:0,worth:0,cup:false,bub:0,
  ox:rnd(-6,6),oy:rnd(-4,4),qx:rnd(-2,2),qy:rnd(-1.5,1.5),pace:rnd(.86,1.14),wait:0,look:rnd(1.5,6),side:0,chat:0}; }
function vilEnt(id){ const e=mk('c'); e.vil=id; e.lk=VLK[id]; e.spr=VSPR[id]; return e; }
function pickVil(){ if(isCity()) return null; const here=new Set(ents.filter(e=>e.vil).map(e=>e.vil)); const pool=VIL.filter(v=>!here.has(v.id)); if(!pool.length) return null;
  const w=pool.map(v=>1+(S?S.vil[v.id].h:0)), tot=w.reduce((a,b)=>a+b,0); let x=R()*tot; for(let i=0;i<pool.length;i++){ x-=w[i]; if(x<=0) return pool[i].id; } return pool[0].id; }

function layoutKey(){ return JSON.stringify(layoutOf())+'|'+cfg().walk; }
function buildSeats(){
  const k=layoutKey(); if(k===tkey) return; tkey=k; seats=[];
  layoutOf().forEach(o=>{ const X=cellX(o.c), Y=cellY(o.r);
    if(o.id==='ghe'||o.id==='du'||o.id==='tbl'){ const cx=X+16, y=Y+14, off=o.id==='tbl'?12:10; seats.push({x:cx-off,y,o,who:null,f:1}); seats.push({x:cx+off,y,o,who:null,f:-1}); }
    else if(o.id==='choi'){ seats.push({x:X+14,y:Y+24,o,who:null,f:1}); seats.push({x:X+34,y:Y+24,o,who:null,f:-1}); }
    else if(o.id==='vong'){ seats.push({x:X+16,y:Y+12,o,who:null,f:1,ham:true}); } });
}

function chicken(p){ const x=Math.round(p.x*2)/2, y=Math.round(p.y*2)/2, f=p.f, pk=p.peck>0&&Math.floor(tt*6)%2;
  g.fillStyle='rgba(0,0,0,.2)'; g.fillRect(x-3,y-.5,6,1);
  if(p.k==='con'){ hb(x-1.5,y-3,3,3,'#f2d04a'); hb(x-1.5,y-3,3,.5,'#fff0a0'); hb(x+(f>0?1.5:-2),y-2.5+(pk?1:0),.5,.5,'#e08a2a'); hb(x+(f>0?.5:-1),y-2.5,.5,.5,'#2b1d16'); return; }
  const c=p.col, cD=shade(c,.7);
  hb(x-1,y-2,.5,2,'#d99a3a'); hb(x+.5,y-2,.5,2,'#d99a3a');
  hb(x-3,y-6,6,4,c); hb(x-3.5,y-5,7,2.5,c); hb(x-2,y-6.5,4,.5,shade(c,1.2)); hb(x-1.5,y-5,3,2,cD);
  hb(x-f*4-.5,y-8,1.5,3,cD); hb(x-f*4.5,y-9.5,1,2,p.rooster?'#2a5a3a':cD);
  const hx=x+f*3, hy=y-8+(pk?3:0); hb(hx-1,hy,2,2,c); hb(hx-.5,hy-1,1.5,1,'#d93a2c'); hb(hx+f*1.2,hy+.8,1,.5,'#e8a62a'); hb(hx+f*.3,hy+.3,.5,.5,'#2b1d16'); hb(hx-.5+f*.5,hy+1.8,.5,1,'#d93a2c');
}
function dog(d){ const x=Math.round(d.x), y=Math.round(d.y), c='#c98b4a', cD='#9a6232', cL='#e8b678', w=Math.sin(tt*(d.st==='bark'?14:5))*1.2;
  g.fillStyle='rgba(0,0,0,.22)'; g.fillRect(x-7,y-.5,15,1.5);
  if(d.st==='sleep'){ hb(x-6,y-4,12,4,c); hb(x-6,y-4,12,1,cL); hb(x+5,y-5,4,4,c); hb(x+5,y-6,2,2,cD); hb(x+8.5,y-3.5,1.5,1.5,cL); hb(x+9.5,y-3.5,.5,.5,'#2b1d16'); hb(x+6.5,y-3.5,1.5,.5,'#2b1d16'); hb(x-8,y-3+w*.4,2.5,1,c);
    if(Math.floor(tt)%4===0){ g.fillStyle='rgba(255,255,255,.8)'; g.font='bold 4px "Pixelify Sans",monospace'; g.fillText('z',x+9,y-8-(tt%1)*3); } }
  else { [-5,-3,3,5].forEach(lx=>hb(x+lx,y-4,1,4,cD)); hb(x-6,y-9,12,5,c); hb(x-6,y-9,12,1,cL); hb(x+5,y-13,5,5,c); hb(x+5,y-14,2,2,cD); hb(x+9.5,y-11,1.5,1.5,cL); hb(x+10.5,y-11,.5,.5,'#2b1d16'); hb(x+7,y-12,.5,.5,'#2b1d16'); hb(x-8,y-11+w,2,3,c); }
}
function buffalo(b){ const x=Math.round(b.x), y=Math.round(b.y), d=b.dir, lg=Math.floor(b.step)%2, c='#4a4a52', cD='#33333a', cL='#6a6a74';
  g.fillStyle='rgba(0,0,0,.25)'; g.fillRect(x-12,y-1,24,2);
  [-7,-4,4,7].forEach((lx,i)=>hb(x+lx*d,y-6,2,6-((i+lg)%2),cD));
  hb(x-10,y-15,20,9,c); hb(x-10,y-15,20,1.5,cL); hb(x-8,y-7,16,1,cD); hb(x-d*10.5,y-14,1,6,cD);
  const hx=x+d*12; hb(hx-3,y-15,6,6,c); hb(hx-2+d,y-11,4,2.5,'#8a8a90'); hb(hx-.5+d*2,y-13.5,.5,.5,'#fff');
  hb(hx-6,y-17,3,1.5,'#d8cfbd'); hb(hx-7,y-18.5,1.5,2,'#d8cfbd'); hb(hx+3,y-17,3,1.5,'#d8cfbd'); hb(hx+5.5,y-18.5,1.5,2,'#d8cfbd');
  hb(hx+d*3,y-11,d*8,.5,'#a8904a');
  if(b.lk) blit(spr(b,'s',[1,0,2,0][Math.floor(b.step)%4],'stand'),x+d*21,y+1,d<0);
}
function bike(b){
  if(b.type==='trau') return buffalo(b);
  const x=Math.round(b.x),y=Math.round(b.y),d=b.dir;
  if(b.type==='xd'){ g.fillStyle='rgba(0,0,0,.25)'; g.fillRect(x-10,y-1,20,1.5);
    [[x-7,y-4],[x+7,y-4]].forEach(([wx,wy])=>{ g.strokeStyle='#2b2b2b'; g.lineWidth=1; g.beginPath(); g.arc(wx,wy,3.5,0,7); g.stroke(); });
    g.strokeStyle=b.col; g.beginPath(); g.moveTo(x-7,y-4); g.lineTo(x-1,y-9); g.lineTo(x+7,y-4); g.moveTo(x-1,y-9); g.lineTo(x+5,y-10); g.stroke();
    if(b.rider) blit(spr(b,'s',0,'sit'),x-2*d,y-6,d<0); return; }
  g.fillStyle='rgba(0,0,0,.3)'; g.fillRect(x-13,y-1,26,2);
  ob(x-12,y-6,6,6,'#3a3a3a'); bx(x-10,y-4,2,2,'#888'); ob(x+6,y-6,6,6,'#3a3a3a'); bx(x+8,y-4,2,2,'#888');
  ob(x-9,y-11,18,6,b.col); bx(x-9,y-11,18,1,shade(b.col,1.35)); ob(x-5,y-13,9,2,'#222');
  const hx=d>0?x+8:x-10; ob(hx,y-17,2,7,'#888');
  if(b.cargo){ ob(x-d*14-4,y-16,8,7,'#c9a46a'); hb(x-d*14-4,y-13,8,.5,'#8a6a3a'); }
  if(b.rider) blit(spr(b,'s',0,'sit'),x-2*d,y-9,d<0);
  if(b.st==='wait') bx(x+(d>0?-13:12),y-9,2,2,'#ffb347');
  if(dark(clock)>.15&&b.st!=='wait'){ hb(x+d*11,y-14,1.5,1.5,'#fff6c8'); headlights.push([x+d*12,y-12,d]); }
}
function walkStools(){ if(!cfg().walk) return; [60,140,420,520].forEach(x=>{ ob(x-5,311,10,2.5,'#4a86d6'); [x-11,x+11].forEach(s=>ob(s-2.5,313,5,1.5,'#d8382c')); }); }
function gateArch(){
  const x0=GX-21, x1=GX+18;
  [x0,x1].forEach(px=>{ ob(px,262,3,42,'#c9b06a'); hb(px,262,1,42,'#e6d29a'); [270,282,294].forEach(yy=>hb(px,yy,3,.5,'#8f7438')); });
  for(let i=0;i<=24;i++){ const t=i/24, ax=x0+t*(x1-x0+3), ay=263-Math.sin(t*Math.PI)*10; hb(ax-.5,ay-.5,2.5,2.5,OUT); hb(ax,ay,1.5,1.5,'#b89a52'); }
  ARCHF.forEach(([dx,dy,c])=>hb(GX+dx,dy,c<2?2:1.5,c<2?1.5:1.5,['#3f7a3c','#5a9a4c','#d63a8a','#f06aa8','#b82a72'][c]));
}
const ARCHF=(()=>{ const s=srand(77), out=[]; for(let i=0;i<150;i++){ const t=s(); let dx,dy; if(i<100){ dx=-20+t*40; dy=263-Math.sin(t*Math.PI)*10+(s()-.5)*7; } else { dx=(s()<.5?-20:19)+(s()-.5)*5; dy=262+s()*28; } out.push([dx,dy,s()<.42?Math.floor(s()*2):2+Math.floor(s()*3)]); } return out; })();

function person(e,sil){
  const x=Math.round(e.x),y=Math.round(e.y),sit=e.st==='sit'||e.st==='idle'||e.st==='wait',moving=e.path.length>0&&!(e.wait>0)&&Math.hypot(e.vx,e.vy)>3;
  if(!sil){ g.fillStyle='rgba(0,0,0,.25)'; g.fillRect(x-5,y-1,10,2); g.fillRect(x-3,y+1,6,1); }
  let dir; if(sit) dir='s'; else if(moving) dir=Math.abs(e.vx)>=Math.abs(e.vy)*.8?'s':(e.vy<0?'u':'d'); else dir=e.side>0?'s':e.st==='q'||e.wait>0?'u':'d';
  const fr=moving?[1,0,2,0][Math.floor(e.step)%4]:0;
  const so=e.seat&&e.seat.o.id; const sy=sit?y+(so==='ghe'||so==='du'?2.5:so==='vong'?2:1):y;
  blit(spr(e,dir,fr,sit?'sit':'stand'),x-(sit?e.f*2:0),sy,dir==='s'&&e.f<0); if(sil) return;
  if(e.cup&&!sit&&dir!=='u'){ const cx=dir==='s'?x+(e.f>0?5:-8):x+5; ob(cx,y-13,3,4,'#f4efe6'); bx(cx,y-13,3,1,'#c98b5b'); }
  if(e.kind==='staff'){ const j=e.crew&&e.crew.task;
    if(j&&j.type==='serve'&&e.st==='job'){ const tx=x+(e.f>0?3:-9); ob(tx,y-16,7,1,'#c9ced4'); ob(tx+2,y-19,3,3,'#f4efe6'); bx(tx+2,y-19,3,1,'#8a5a3b'); }
    if(e.st==='act'&&j){ if(j.type==='chat') bubble(x,y-33,'dots'); else if(j.type==='water'){ const wx=x+(e.f>0?5:-11); ob(wx,y-16,6,4,'#5b8fb0'); bx(wx+(e.f>0?6:-2),y-17,2,1,'#5b8fb0'); const t=(tt*3)%1; bx(wx+(e.f>0?8:-3),y-14+t*10,1,2,'#9fd3e6'); }
      else if(j.type==='clean'){ const t=Math.floor(tt*8)%3; bx(x+(e.f>0?6:-8),y-14+t,2,2,'#ffffff'); bx(x+(e.f>0?9:-11),y-11-t,1,1,'#fff6c8'); }
      else if(j.type==='weed'){ const t=Math.floor(tt*6)%2; bx(x+(e.f>0?5:-7),y-4-t*2,2,2,'#6fae4a'); } } }
  if(e.st==='mad') bubble(x,y-33,'mad'); else if((e.st==='q'&&queue[0]===e)||e.st==='wait') bubble(x,y-33,'cup'); else if(e.bub>0) bubble(x,y-33,'heart'); else if(e.chat>0) bubble(x,y-31,'dots');
  else if(e.vil&&e!==hoverE){ const by=sy-(sit?27:33)+Math.sin(tt*3+x)*.8; hb(x-1,by,2,2,OUT); hb(x-.5,by-.5,1,1,'#ffd166'); hb(x-1.5,by+.5,3,1,'#ffd166'); hb(x-.5,by+1.5,1,1,'#ffd166'); }
}
function nameTag(e){ const v=VILM[e.vil]; if(!v) return; const sit=e.st==='sit'||e.st==='idle'||e.st==='wait', y=Math.round(e.y)-(sit?32:38), x=Math.round(e.x);
  g.font='bold 5px "Be Vietnam Pro",sans-serif'; const w=g.measureText(v.n).width+6; hob(x-w/2,y-6,w,7.5,'#3b2516'); g.fillStyle='#fff1d6'; g.fillText(v.n,x-w/2+3,y-.4);
  const h=S?Math.floor(S.vil[v.id].h):0; for(let i=0;i<Math.min(h,10);i++) hb(x-w/2+1+i*1.5,y+2,1,1,'#e2574c'); }
function bubble(x,y,k){
  ob(x-6,y-9,12,9,'#fffaf0'); bx(x-1,y,3,2,'#fffaf0'); bx(x-1,y+2,1,1,OUT); bx(x+2,y,1,2,OUT);
  if(k==='cup'){ bx(x-3,y-6,5,4,'#8a5a3b'); bx(x-3,y-6,5,1,'#c98b5b'); bx(x+2,y-5,1,2,'#8a5a3b'); }
  else if(k==='heart'){ bx(x-3,y-7,2,2,'#e2574c'); bx(x+1,y-7,2,2,'#e2574c'); bx(x-3,y-5,6,2,'#e2574c'); bx(x-2,y-3,4,1,'#e2574c'); bx(x-1,y-2,2,1,'#e2574c'); }
  else if(k==='dots'){ const n=Math.floor(tt*3)%4; for(let i=0;i<3;i++) bx(x-4+i*3,y-5,2,2,i<n?'#3b2516':'#c9b590'); }
  else { bx(x-1,y-8,2,5,'#d9473b'); bx(x-1,y-2,2,1,'#d9473b'); }
}

/* ---- ánh sáng ---- */
const BCOL=['#ffd36b','#ff7a6b','#8fe08a','#7ab8ff'];
let GPTS=[];
function gold(c){ return c<14?0:c<17?(c-14)/3:c<18.6?1:c<19.6?1-(c-18.6):0; }
const SHAFTS=[[-60,26,.07],[10,14,.05],[70,34,.06],[170,18,.045],[250,30,.05]];
function pondShimmer(){ for(let i=0;i<14;i++){ const px=450+((i*53+tt*6)%140), py=232+((i*29)%50); if(!inPond(px,py,8)) continue; const a=.25+.25*Math.sin(tt*2+i); hb(px,py,3+(i%3),.5,`rgba(220,255,250,${a})`); } }
function garland(){ const x0=cartL()+91, y0=54, x1=isCity()?560:402, y1=isCity()?40:28; GPTS=[]; if(x1-x0<60) return;
  const Y=f=>y0+(y1-y0)*f+Math.sin(f*Math.PI)*14;
  g.strokeStyle='#2b1d16'; g.lineWidth=.6; g.beginPath(); for(let i=0;i<=30;i++){ const f=i/30; i?g.lineTo(x0+(x1-x0)*f,Y(f)):g.moveTo(x0,Y(0)); } g.stroke();
  const on=isOpen()&&!outage, n=Math.floor((x1-x0)/16); for(let i=1;i<n;i++){ const f=i/n, xx=x0+(x1-x0)*f, yy=Y(f); GPTS.push([xx,yy]); hb(xx-1,yy,2.5,3,on?(isCity()?'#ffe2a0':BCOL[i%4]):'#6b5f55'); hb(xx-.5,yy-.5,1,.5,OUT); } }
function glow(x,y,r,a){ const gr=g.createRadialGradient(x,y,0,x,y,r); gr.addColorStop(0,`rgba(255,196,120,${a})`); gr.addColorStop(1,'rgba(255,196,120,0)'); g.fillStyle=gr; g.fillRect(x-r,y-r,r*2,r*2); }
function dark(c){ if(c<6.5) return .5; if(c<7.5) return .5-(c-6.5)*.5; if(c<17.5) return 0; if(c<19) return (c-17.5)/1.5*.5; return .5; }
function sky(){ const c=clock; let a='#bfe3f0',b='#e6f3ea'; if(rain){a='#8a96a0';b='#a8b2b4';} else if(c<6.5||c>=19){a='#141a33';b='#2a3150';} else if(c<7.5||c>=17.5){a='#e8946e';b='#f6c89a';}
  const gr=g.createLinearGradient(0,0,0,50); gr.addColorStop(0,a); gr.addColorStop(1,b); g.fillStyle=gr; g.fillRect(0,0,VW,52); }

/* ---- hiệu ứng đêm & viền tối: đom đóm trong vườn, vệt đèn pha xe máy, viền tối nhẹ cho có chiều sâu ---- */
function nightFx(d){
  if(d>.15&&!isCity()) bugs.forEach(b=>{ b.ph+=.016*b.sp; const x=b.x+Math.sin(b.ph*1.3)*18, y=b.y+Math.sin(b.ph*.9)*10, a=.45+.45*Math.sin(tt*2.2+b.ph*3);
    if(a<.15) return; g.globalCompositeOperation='lighter'; glow(x,y,6,.35*a); g.globalCompositeOperation='source-over'; hb(x,y,1,1,'rgba(230,255,150,'+a+')'); });
  if(headlights.length){ g.globalCompositeOperation='lighter'; headlights.forEach(([x,y,dd])=>{ const gr=g.createLinearGradient(x,0,x+dd*60,0); gr.addColorStop(0,'rgba(255,236,170,.32)'); gr.addColorStop(1,'rgba(255,236,170,0)');
    g.fillStyle=gr; g.beginPath(); g.moveTo(x,y); g.lineTo(x+dd*60,y-9); g.lineTo(x+dd*60,y+9); g.closePath(); g.fill(); }); g.globalCompositeOperation='source-over'; headlights=[]; }
  if(!vign||vign.width!==VW){ vign=document.createElement('canvas'); vign.width=VW; vign.height=H; const x=vign.getContext('2d'), gr=x.createRadialGradient(VW/2,H*.55,H*.45,VW/2,H*.55,VW*.62);
    gr.addColorStop(0,'rgba(20,12,8,0)'); gr.addColorStop(1,'rgba(20,12,8,.32)'); x.fillStyle=gr; x.fillRect(0,0,VW,H); }
  g.drawImage(vign,-OX,0);
}
/* ---- nắng & bóng đổ: mọi vật đứng trên đất đổ bóng theo giờ (sáng ngả trái, trưa ngắn, chiều ngả phải, dài dần về chiều);
   trên phố nắng hắt từ ngoài đường vào nên bóng ngả vào trong quán. Vẽ hết bóng vào một lớp mặt nạ 1x rồi phủ một lần cho mềm, không chồng đậm. ---- */
const SHM=document.createElement('canvas'), shm=SHM.getContext('2d');
function sunNow(){ if(rain||clock<6.2||clock>18.3) return null;
  const up=Math.min(1,(clock-6.2)/1.2,(18.3-clock)/1.2), t=clamp((clock-12.2)/6.4,-.95,.95), city=isCity();
  return {sx:t*1.5, sy:(city?-1:1)*(.3+.35*t*t), a:(.34+.08*t*t)*up*(city?.75:1), warm:gold(clock)}; }
const sPlate=(x0,y0,x1,y1)=>{ g.fillStyle='#000'; g.fillRect(x0,y0,x1-x0,y1-y0); };
function casters(){ const out=[], se=seasonNow();
  layoutOf().forEach(o=>{ if(o.id==='ao'||o.id==='herb') return; const it=catOf(o.id); out.push([cellY(o.r+it.h)-1,()=>drawItem(o,true)]); });
  ents.forEach(e=>out.push([e.y,()=>person(e,true)]));
  pets.forEach(p=>(!isCity()||p.k==='meo')&&p.k!=='vit'&&out.push([p.y,()=>p.k==='cho'?dog(p):p.k==='meo'?cat(p):chicken(p)]));
  if(dark(clock)<.15) bikes.forEach(b=>out.push([b.y,()=>bike(b)]));
  const L=cartL(); out.push([126,()=>{ sPlate(L+2,100,L+86,120); sPlate(L+3,58,L+7,104); sPlate(L+81,58,L+85,104); sPlate(L-5,48,L+93,62); }]);
  if(isCity()){ out.push([282,()=>drawTree('sao',568,282,0,se,g,.85)]); out.push([288,()=>{ sPlate(29,232,33,288); sPlate(26,221,36,234); }]);
    out.push([282,()=>sPlate(70,241,122,280)]); out.push([285,()=>sPlate(390,262,450,284)]); out.push([286,()=>sPlate(460,254,524,286)]); }
  else { [['chuoi',6,66,0,1.1],['cau',272,62,0,1],['chuoi',340,64,1,.9],['cau',386,60,1,.95],['da',150,72,0,1.15]].forEach(([k,x,y,v,s])=>out.push([y,()=>drawTree(k,x,y,v,se,g,s)]));
    out.push([62,()=>sPlate(394,0,606,62)]); out.push([60,()=>sPlate(297,28,323,60)]); }
  return out; }
// vẽ dáng các vật (đã chiếu xuống đất theo sx, sy) vào mặt nạ rồi phủ một màu, chỉ trong dải y0..y1
function shadeMask(list,sx,sy,col,a,y0,y1){ if(!list.length||a<.01) return;
  if(SHM.width!==VW||SHM.height!==H){ SHM.width=VW; SHM.height=H; }
  shm.setTransform(1,0,0,1,0,0); shm.clearRect(0,0,VW,H); shm.fillStyle='#000';
  const old=g; g=shm; list.forEach(([fy,fn])=>{ g.setTransform(1,0,-sx,-sy,OX+sx*fy,fy*(1+sy)); fn(); }); g=old;
  shm.setTransform(1,0,0,1,0,0); shm.globalCompositeOperation='source-in'; shm.fillStyle=col; shm.fillRect(0,0,VW,H); shm.globalCompositeOperation='source-over';
  g.save(); g.beginPath(); g.rect(-OX,y0,VW,y1-y0); g.clip(); g.setTransform(1,0,0,1,0,0); g.globalAlpha=a; g.imageSmoothingEnabled=true; g.drawImage(SHM,0,0,VW*2,H*2); g.restore(); }
function sunShadows(){ const s=sunNow(), city=isCity(), all=casters();
  // trong quán (trên phố): đèn trần + ánh cửa → bóng ngắn, đậm, đổ sát chân đồ vật, có cả ban đêm
  if(city) shadeMask(all.filter(c=>c[0]<224),s?s.sx*.12:0,-.13,'#160e08',dark(clock)>.12?.5:.42,64,223);
  if(s) shadeMask(city?all.filter(c=>c[0]>=224):all,s.sx,s.sy,s.warm>.3?'#3a2448':'#1c2634',s.a,city?228:58,H); }

/* ---- phản chiếu: mặt ao soi bóng vịt, người, cầu, thuyền và màu trời; sàn gỗ trên phố có vệt đèn; trời mưa vỉa hè & mặt đường loáng nước ---- */
function mirror(list,a,k){ list.forEach(([fy,fn])=>{ g.save(); g.globalAlpha=a; g.transform(1,0,0,-k,0,fy*(1+k)); fn(); g.restore(); }); }
function streak(x,y0,y1,w,col,a){ const gr=g.createLinearGradient(0,y0,0,y1); gr.addColorStop(0,`rgba(${col},${a})`); gr.addColorStop(1,`rgba(${col},0)`); g.fillStyle=gr; g.fillRect(x-w/2,y0,w,y1-y0); }
function reflections(){
  const night=dark(clock)>.12&&isOpen()&&!outage, gf=rain?0:gold(clock);
  if(!isCity()){
    g.save(); g.beginPath(); g.ellipse(POND.cx,POND.cy,POND.rx-3,POND.ry-3,0,0,7); g.rect(POND.cx,225,VW,58); g.clip();
    // màu trời in xuống nước: trưa xanh nhạt, chiều cam, mưa xám
    g.fillStyle=rain?'rgba(150,160,170,.18)':gf>0?`rgba(255,168,90,${.22*gf})`:'rgba(210,240,250,.12)'; g.fillRect(POND.cx-POND.rx,POND.cy-POND.ry,VW,POND.ry*2+10);
    // bóng cầu gỗ, cọc, thuyền
    g.fillStyle='rgba(40,28,18,.28)'; [432,452,472,486].forEach(px=>g.fillRect(px,244,3,9)); g.fillRect(430,252,58,3);
    ellipse(512,251,19,3.5,'rgba(40,28,18,.26)');
    const near=[]; ents.forEach(e=>{ if(e.x>POND.cx-POND.rx-8&&e.y>POND.cy-POND.ry-26&&e.y<292) near.push([e.y,()=>person(e,true)]); });
    pets.forEach(p=>{ if(p.k==='vit'||(p.x>POND.cx-POND.rx-8&&p.y>POND.cy-POND.ry-20&&p.y<292)) near.push([p.y,()=>p.k==='vit'?duck(p):p.k==='cho'?dog(p):chicken(p)]); });
    mirror(near,.34,.8);
    if(night) layoutOf().forEach(o=>{ if(o.id==='lantern') streak(cellX(o.c)+12,POND.cy-POND.ry,POND.cy+POND.ry,3,'255,210,140',.18); });
    g.restore(); return; }
  // sàn gỗ trong quán: chỉ còn vệt sáng mờ của đèn thả & bảng hiệu (bỏ hình soi ngược vì trông giả)
  g.save(); g.beginPath(); g.rect(-OX,64,VW,159); g.clip();
  g.globalCompositeOperation='lighter'; [[180,.05],[440,.05],[388,.04]].forEach(([x,a])=>streak(x,64,104,12,'255,226,170',night?a*2.4:a));
  g.globalCompositeOperation='source-over'; g.restore();
  if(rain){ // mưa: vỉa hè & đường loáng nước, soi người và đèn
    g.save(); g.beginPath(); g.rect(-OX,229,VW,109); g.clip();
    g.fillStyle='rgba(40,50,70,.12)'; g.fillRect(-OX,229,VW,109);
    const out=[]; ents.forEach(e=>{ if(e.y>=228) out.push([e.y,()=>person(e,true)]); }); if(dark(clock)<.15) bikes.forEach(b=>out.push([b.y,()=>bike(b)]));
    mirror(out,.22,.75);
    g.globalCompositeOperation='lighter'; streak(31,292,336,5,'255,220,150',night?.3:.12); streak(388,292,330,22,'255,210,140',night?.12:.05);
    g.globalCompositeOperation='source-over'; g.restore(); }
}
/* ---- vẽ chính ---- */
function draw(){
  buildSeats(); buildBG();
  g.imageSmoothingEnabled=false; g.setTransform(2,0,0,2,0,0); g.clearRect(0,0,VW,H);
  sky(); g.drawImage(bg,0,0,VW,H);
  g.setTransform(2,0,0,2,2*OX,0);
  walkStools();
  if(!isCity()) weedsOf().forEach(w=>drawWeed(w,w===hoverW));
  if(!edit){ reflections(); sunShadows(); }
  if(edit) gridOverlay();
  const dragCart=edit&&edit.drag&&edit.drag.cart;
  if(!dragCart){ cartBack(); if(isOpen()) staffDraw(); cartFront(); }
  const list=dragCart?[]:[{y:127,f:easel}];
  layoutOf().forEach(o=>{ if(edit&&edit.drag&&edit.drag.o===o) return; const it=catOf(o.id), by=cellY(o.r+it.h)-1;
    if(o.id==='choi'){ list.push({y:cellY(o.r)+20,f:()=>drawItem(o,false,'back')}); list.push({y:by+12,f:()=>drawItem(o,false,'roof')}); }
    else list.push({y:by,f:()=>drawItem(o)}); });
  ents.forEach(e=>list.push({y:e.y+.1,f:()=>person(e)}));
  bikes.forEach(b=>list.push({y:b.y,f:()=>bike(b)}));
  if(isCity()) list.push({y:280,f:()=>drawTree("sao",568,282,0,seasonNow(),g,.85)});
  pets.forEach(p=>(!isCity()||p.k==='meo')&&list.push({y:p.y,f:()=>p.k==='cho'?dog(p):p.k==='vit'?duck(p):p.k==='meo'?cat(p):chicken(p)}));
  list.sort((a,b)=>a.y-b.y).forEach(o=>o.f());
  sevDraw();
  if(!dragCart) awning();
  if(!isCity()){ gateArch(); pondShimmer(); }
  leaves.forEach(p=>hb(p.x,p.y,1.5,1,p.c));
  if(!isCity()) butterflies();
  garland();
  bits.forEach(b=>hb(b.x,b.y,1,1,b.c));
  notes.forEach(n=>{ bx(n.x,n.y,1,6,'#3b2516'); bx(n.x-2,n.y+5,3,2,'#3b2516'); bx(n.x+1,n.y,2,1,'#3b2516'); });
  g.fillStyle='rgba(205,222,240,.6)'; drops.forEach(d=>g.fillRect(Math.round(d.x),Math.round(d.y),1,4));
  const gf=rain?0:gold(clock);
  if(gf>0&&!isCity()){ // nắng chiều: phủ vàng ấm + vệt nắng xiên qua tán xoài
    g.globalCompositeOperation='soft-light'; g.fillStyle=`rgba(255,160,60,${.4*gf})`; g.fillRect(-OX,0,VW,H);
    g.globalCompositeOperation='lighter';
    SHAFTS.forEach(([x0,w,a])=>{ const gr=g.createLinearGradient(0,0,0,H); gr.addColorStop(0,`rgba(255,214,140,${a*gf})`); gr.addColorStop(1,'rgba(255,214,140,0)'); g.fillStyle=gr;
      g.beginPath(); g.moveTo(x0,0); g.lineTo(x0+w,0); g.lineTo(x0+w+150,H); g.lineTo(x0+150,H); g.closePath(); g.fill(); });
    g.globalCompositeOperation='source-over'; }
  let d=dark(clock)+(rain?.14:0)+(outage?.15:0); if(!isOpen()) d=Math.max(d,.3);
  if(d>.01){ g.fillStyle=`rgba(22,20,52,${Math.min(d,.6)})`; g.fillRect(-OX,0,VW,H); }
  const la=d>.12?1:gf*.45;
  if(la>0){ g.globalCompositeOperation='lighter';
    (isCity()?[[388,19,40],[388,19,20],[180,18,26],[440,18,26],[31,229,46],[31,229,18],[96,262,24]]:[[457,42,18],[514,39,14],[434,30,10],[532,30,10],[100,33,16],[222,29,16]]).forEach(([wx,wy,r])=>glow(wx,wy,r,.22*la));
    if(isOpen()&&!outage){ GPTS.forEach(([x,y])=>glow(x,y+2,14,.15*la)); glow(cartL()+44,84,44,.12*la);
      layoutOf().forEach(o=>{ if(o.id==='lantern') glow(cellX(o.c)+12,cellY(o.r)-9,34,.26*la); }); CART_BULBS.forEach(b0=>glow(cartL()+b0+1,69,10,.18*la)); }
    g.globalCompositeOperation='source-over'; }
  nightFx(dark(clock)); sevRings();
  if(hoverE&&ents.includes(hoverE)) nameTag(hoverE);
  if(edit) ghost();
  g.font='bold 9px "Pixelify Sans",monospace';
  floats.forEach(f=>{ const a=Math.min(1,f.t); g.fillStyle=`rgba(43,29,22,${a})`; g.fillText(f.txt,f.x+1,f.y+1); g.fillStyle=f.col?f.col.replace('A',a):`rgba(255,214,102,${a})`; g.fillText(f.txt,f.x,f.y); });
  g.setTransform(1,0,0,1,0,0);
}
