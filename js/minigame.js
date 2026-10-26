// Mini-game pha chế: giờ cao điểm, canh gram, nhiệt độ nước, chọn hạt
/* ================= MINI-GAME PHA CHẾ: 4 trò xoay vòng theo tuần, đổi theo mùa ================= */
// 1–2 lần mỗi tháng (theo lịch planPeriod) khi đang xem quán chạy, lần lượt: giờ cao điểm → canh gram bột → canh nhiệt độ nước → chọn hạt cafe.
// Trò nào cũng chấm 1–3 sao → tiền boa, uy tín, khách quen. Có thể chơi tập trong Sổ sách (không tính tiền).
// Mùa: món theo mùa, độ kiên nhẫn của khách, gu đậm nhạt, độ ẩm của bột, nhiệt độ nước ban đầu, câu khách hỏi.
const SEAS=[
  {ico:'🌸',n:L("Xuân"),hot:.45,pat:1,tip:L("Xuân · Tết: khách sộp, chuộng cả đồ nóng lẫn đá.")},
  {ico:'☀️',n:L("Hạ"),hot:.1,pat:.85,tip:L("Hạ · nắng gắt: ai cũng đòi đá, mau sốt ruột.")},
  {ico:'🍂',n:L('Thu'),hot:.4,pat:1.15,tip:L("Thu · mát trời: khách thong thả hơn.")},
  {ico:'❄️',n:L("Đông"),hot:.8,pat:1,tip:L("Đông · rét: khách chuộng đồ nóng, uống đậm.")}];
const DRINKS=[
  {id:'den',n:L("Cà phê đen"),c:'#2b1a10',ice:1,w:2},{id:'sua',n:L("Cà phê sữa"),c:'#8a5a3b',ice:1,milk:1,w:3},{id:'bx',n:L("Bạc xỉu"),c:'#d8b48a',milk:2,w:2},{id:'tra',n:L("Trà đá"),c:'#c98a2a',ice:1,w:2},
  {id:'nong',n:L("Cà phê sữa nóng"),c:'#9a6a48',hot:1,milk:1,w:2},
  {id:'trung',n:L("Cà phê trứng"),c:'#5a3420',hot:1,egg:1,w:2,se:0},{id:'chanh',n:L("Chanh đá"),c:'#d6e86a',ice:1,w:3,se:1},
  {id:'cacao',n:L("Ca cao nóng"),c:'#6b3a22',hot:1,w:2,se:2},{id:'gung',n:L("Trà gừng"),c:'#d99a3a',hot:1,w:3,se:3},
  {id:'dua',n:L("Bạc xỉu cốt dừa"),c:'#efe4cf',milk:2,ice:1,w:2,need:()=>S.vil.linh&&S.vil.linh.h>=4},{id:'muoi',n:L("Cà phê muối"),c:'#a8784e',milk:1,ice:1,w:2,need:()=>isCity()}];
const drinkOf=id=>DRINKS.find(d=>d.id===id);
function cupSVG(d){ return `<svg viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true">${d.hot?'<rect x="6" y="0" width="1" height="2" fill="#ffffff" opacity=".8"/><rect x="9" y="1" width="1" height="2" fill="#ffffff" opacity=".7"/>':'<rect x="10" y="0" width="1" height="7" fill="#c4473a"/>'}<rect x="3" y="3" width="10" height="13" fill="#3b2516"/><rect x="4" y="4" width="8" height="11" fill="#eef6f4"/><rect x="4" y="7" width="8" height="8" fill="${d.c}"/>${d.milk?`<rect x="4" y="${d.milk>1?7:12}" width="8" height="3" fill="#f6efe2"/>`:''}${d.egg?'<rect x="4" y="6" width="8" height="3" fill="#f3d27a"/>':''}${d.ice?'<rect x="5" y="8" width="2" height="2" fill="#dff3ff"/><rect x="8" y="10" width="2" height="2" fill="#dff3ff"/>':''}<rect x="4" y="4" width="1" height="11" fill="#ffffff" opacity=".6"/></svg>`; }
function beanSVG(b){ return `<svg viewBox="0 0 16 16" aria-hidden="true"><ellipse cx="8" cy="8" rx="${b.round?6:5}" ry="${b.round?6:6.6}" fill="${b.c}" stroke="#2b1d16" stroke-width="1"/><path d="M8 ${b.round?3:2.5} C5.8 6,10.2 10,8 ${b.round?13:13.5}" stroke="#e0bf8f" fill="none" stroke-width="1.1"/></svg>`; }
const wpick=(a,w)=>{ let x=Math.random()*w.reduce((s,v)=>s+v,0); for(let i=0;i<a.length;i++){ x-=w[i]; if(x<=0) return a[i]; } return a[0]; };
const shuffle=a=>{ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };

const MG={
  rush:{t:L("Giờ cao điểm"),ico:'☕',how:L("Khách gọi món dồn dập. Bấm <b>đúng món</b> cho người <b>đầu hàng</b> trước khi họ hết kiên nhẫn.")},
  weigh:{t:L("Canh gram bột"),ico:'⚖️',how:L("<b>Giữ nút</b> để đổ bột vào phin, <b>thả tay</b> khi cân chạm vạch xanh. Thả rồi bột vẫn rơi thêm chút — nhớ thả sớm!")},
  temp:{t:L("Canh nhiệt độ nước"),ico:'🌡️',how:L("Ấm nước đang nóng dần, lửa lúc to lúc nhỏ. Bấm <b>Rót!</b> khi kim nằm trong <b>vùng xanh</b> của món. Để sôi trào là hỏng.")},
  bean:{t:L("Chọn hạt cafe"),ico:'🫘',how:L("Khách tả gu của mình. Chọn đúng <b>loại hạt</b>: Robusta, Arabica, Culi hay Moka — càng nhanh càng được boa.")}};
const MG_ORDER=['rush','weigh','temp','bean'];
let mg=null, mgPend=null;
const mgDue=r=>r.open&&!S.over;
function mgIntro(r,cb){
  const kind=MG_ORDER[(S.mgN=(S.mgN||0)+1)%MG_ORDER.length], m=MG[kind], se=SEAS[seasonNow()]; mgPend={kind,cups:r.cups,cb};
  win(m.t+'!',`<div class="ctag tg-tw">${m.ico} ${m.t} · ${se.ico} ${se.n}</div>
    <div class="say">${m.how}<br><span class="sm">${se.tip}</span> ${L("Làm tốt thì được <b>tiền boa</b>, uy tín và khách quen.")}</div>
    <div class="prbtns"><button class="wbtn gold" id="mgGo">${L("{0} Vào quầy!",m.ico)}</button><button class="wbtn" id="mgSkip">${L("Để người phụ lo")}</button></div>`,false);
  sfx('bell'); buzz([30,40,30]);
}
function mgStart(kind,cb,practice,cups){
  closeWin(); mgPend=null;
  mg={kind,cb,practice,cups:cups||40,se:seasonNow(),done:false,last:performance.now(),tickN:6,tips:0,combo:0,best:0,fx:[],at:0};
  $('rush').hidden=false; MGS[kind].start(); requestAnimationFrame(mgLoop);
}
function mgLoop(now){ if(!mg||mg.done) return; const G=MGS[mg.kind], dt=clamp((now-mg.last)/1000,0,.1); G.tick(dt); if(!mg||mg.done) return; mg.last=now; mg.at+=dt; if(mgFit()) G.paint(dt); requestAnimationFrame(mgLoop); }
function mgHead(){ const m=MG[mg.kind], se=SEAS[mg.se]; return `<div class="rtop"><span class="rtitle">${m.ico} ${m.t}</span><span class="chip info">${se.ico} ${se.n}</span><span class="rstat">${L("Boa")} <b id="rTips">0</b></span><span class="rcombo" id="rCombo"></span></div>`; }
function mgStat(){ $('rTips').textContent=kk(mg.tips); const c=$('rCombo'), t=mg.combo>=2?'×'+mg.combo:''; if(c.textContent!==t){ c.textContent=t; if(mg.combo>=3){ c.classList.remove('pulse'); void c.offsetWidth; c.classList.add('pulse'); } } }
function mgClock(rem,dur){ const ti=$('rTime'); ti.style.width=Math.max(0,rem/dur*100)+'%'; ti.classList.toggle('low',rem<=5); if(rem<=5&&Math.ceil(rem)<mg.tickN){ mg.tickN=Math.ceil(rem); sfx('tick'); } }
function mgFloat(txt,bad,at){ const a=at||$('rQ'); if(!a) return; const f=document.createElement('span'); f.className='rfloat'+(bad?' bad':''); f.textContent=txt; f.style.left=(a.offsetLeft+16)+'px'; f.style.top=(a.offsetTop+a.offsetHeight*.45)+'px'; $('rPanel').appendChild(f); setTimeout(()=>f.remove(),800); }
// điểm mỗi lượt 0–3 → tiền boa; chuỗi lượt tốt (≥2) cộng dồn combo
function mgScore(gr,base){ if(gr>=2){ mg.combo++; mg.best=Math.max(mg.best,mg.combo); } else mg.combo=0;
  const tip=Math.round(S.price*(base||1)*[0,.2,.45,.75][gr]*(1+Math.min(mg.combo,6)*.1)/1000)*1000; mg.tips+=tip;
  if(gr>=2) sfx('ok',0,mg.combo); else if(gr===1) sfx('click'); else { sfx('wrong'); buzz(60); } return tip; }
function mgEnd(stars,rows){
  const z=mg, m=MG[z.kind]; z.done=true;
  if(!z.practice){
    S.cash+=z.tips; S.fans+=[1,3,6][stars-1]; S.rep=clamp(S.rep+[-.01,.02,.05][stars-1],.6,1.7);
    if(per){ const k=L("Tiền boa pha chế"); per.wk.lines[k]=(per.wk.lines[k]||0)+z.tips; }
    addLog(S.day,L("{0}: {1}★, boa {2}",m.t,stars,vnd(z.tips)),stars>1?'good':'bad');
    S.tot.mg=S.tot.mg||{}; S.tot.mg[z.kind]=Math.max(S.tot.mg[z.kind]||0,stars); save(); hudSlow(); }
  $('rPanel').innerHTML=`<div class="rres"><div class="rtitle">${m.ico} ${[L("Hơi đuối…"),L("Ổn áp!"),L("Tay pha thần sầu!")][stars-1]}</div>
    <div class="rstars">${'★'.repeat(stars)}<s>${'★'.repeat(3-stars)}</s></div>
    <div class="receipt" style="text-align:left">${rows.map(([a,b,c])=>`<div class="row"><span>${a}</span><b class="${c||''}">${b}</b></div>`).join('')}<hr>
      <div class="row">${L("<b>Tiền boa</b><b class=\"pos\">+{0}</b>",vnd(z.tips))}</div>
      <div class="row muted">${z.practice?`<span>${L("Chơi tập")}</span><span>${L("không tính tiền")}</span>`:`<span>${L("Uy tín · khách quen")}</span><span>${[L("giảm nhẹ"),L("tăng"),L("tăng mạnh")][stars-1]}</span>`}</div></div>
    <button class="wbtn go" id="rEnd">${z.practice?L('Xong'):L("Tiếp tục ▶")}</button></div>`;
  sfx(stars===3?'fanfare':stars===2?'cash':'bad'); buzz(stars===3?[40,30,40,30,120]:40);
}
function mgClose(){ const cb=mg&&mg.cb; mg=null; $('rush').hidden=true; cb&&cb(); }

const MGS={};
/* ---- khung cảnh vẽ cho mini-game: góc quầy pha chế nhìn từ phía người pha. Cao cố định MGH điểm, rộng co giãn theo khung ---- */
const MGH=96; let PXF=getComputedStyle(document.documentElement).getPropertyValue('--px').trim()||'monospace';
let mc=null, mgW=200, mgK=1;
const mgScene=over=>`<div class="mgsc" id="rQ"><canvas id="mgCv"></canvas>${over||''}</div>`;
function mgFit(){ const cv=$('mgCv'); if(!cv) return false; const r=cv.getBoundingClientRect(); if(r.width<4||r.height<4) return false;
  const d=Math.min(2,devicePixelRatio||1), w=Math.round(r.width*d), h=Math.round(r.height*d); if(cv.width!==w||cv.height!==h){ cv.width=w; cv.height=h; }
  mc=cv.getContext('2d'); mgK=h/MGH; mgW=w/mgK; mc.setTransform(mgK,0,0,mgK,0,0); mc.imageSmoothingEnabled=false; mc.globalAlpha=1; return true; }
// toạ độ chạm trên màn hình → toạ độ trong cảnh
function mgAt(e){ const r=$('mgCv').getBoundingClientRect(); return [(e.clientX-r.left)/r.width*mgW,(e.clientY-r.top)/r.height*MGH]; }
const mR=(a,b,w,h,c)=>{ mc.fillStyle=c; mc.fillRect(a,b,w,h); };
const mE=(a,b,rx,ry,c)=>{ mc.fillStyle=c; mc.beginPath(); mc.ellipse(a,b,Math.max(.1,rx),Math.max(.1,ry),0,0,7); mc.fill(); };
const mPoly=(pts,c)=>{ mc.fillStyle=c; mc.beginPath(); pts.forEach(([a,b],i)=>i?mc.lineTo(a,b):mc.moveTo(a,b)); mc.closePath(); mc.fill(); };
const mLine=(pts,w,c)=>{ mc.strokeStyle=c; mc.lineWidth=w; mc.lineCap=mc.lineJoin='round'; mc.beginPath(); pts.forEach(([a,b],i)=>i?mc.lineTo(a,b):mc.moveTo(a,b)); mc.stroke(); };
const mTxt=(s,a,b,sz,c,px)=>{ mc.font=`${px?700:800} ${sz}px ${px?PXF:'"Be Vietnam Pro",sans-serif'}`; mc.textAlign='center'; mc.textBaseline='middle'; mc.fillStyle=c; mc.fillText(s,a,b); };
// hạt nhỏ: bột rơi, giọt nước, hơi nước, hạt cà phê văng
const mgPuff=o=>mg.fx.push(Object.assign({t:0,vx:0,vy:0,g:0,s:1,life:1},o));
function mgFx(dt){ const L=mg.fx;
  for(let i=L.length-1;i>=0;i--){ const p=L[i]; p.t+=dt; p.vy+=p.g*dt; p.x+=p.vx*dt; p.y+=p.vy*dt;
    if(p.t>=p.life||(p.floor!=null&&p.y>=p.floor)){ L.splice(i,1); continue; } const k=p.t/p.life;
    if(p.k==='steam'){ mc.globalAlpha=(p.a||.45)*(1-k)*Math.min(1,p.t*5); const s=p.s*(1+k*1.8); mE(p.x,p.y,s,s,'#fff'); }
    else { mc.globalAlpha=p.k==='fade'?1-k:1; mR(p.x-p.s/2,p.y-p.s/2,p.s,p.s,p.c); } }
  mc.globalAlpha=1; }
// khách ghé quầy: ở quê là người trong xóm, trên phố là khách lạ
const CITY_GUEST=[L("Chị văn phòng"),L('Anh shipper'),L("Bạn sinh viên"),L("Chú bảo vệ"),L("Cô giáo"),L('Anh IT'),L("Chị bán hoa"),L("Ông cụ đi dạo")];
function mgGuest(){ if(isCity()) return {n:pick(CITY_GUEST),lk:mkLook('c')}; const v=pick(VIL); return {n:v.n,lk:VLK[v.id]}; }

// phông nền: tường quán (ván gỗ ở quê, gạch men ở phố), cửa sổ nhìn ra ngoài theo mùa, kệ hũ hạt, đèn thả (lamp = toạ độ x hoặc false)
function mgWall(ct,lamp){ const W=mgW, city=isCity(), se=mg.se, fr=city?'#4a4a52':'#5e3d22';
  if(city){ mR(0,0,W,ct,'#ebe3d5'); mR(0,ct-20,W,20,'#d6cdbd'); for(let y=ct-20,r=0;y<ct;y+=5,r++) for(let x=r%2?-5:0;x<W;x+=10) mR(x+.5,y+.5,9,4,'#f7f3ec'); }
  else { mR(0,0,W,ct,'#a97a4d'); for(let y=3;y<ct;y+=7){ mR(0,y,W,1,'#8d633e'); mR(0,y+1,W,.6,'#bf9064'); } for(let i=0;i<W;i+=29) mR(i+(i*7)%13,0,1,ct,'rgba(70,40,20,.22)'); }
  const wx=Math.max(5,W*.06), wy=7, ww=30, wh=26, sky=['#cfe8f4','#a8dcf6','#f3dfb8','#d4dce4'][se], far=['#9fcf7a','#7cc24e','#d9a04e','#a9b8a4'][se], near=['#6aa63e','#4f932e','#b8742c','#7f907a'][se];
  mR(wx-2,wy-2,ww+4,wh+4,fr); mc.save(); mc.beginPath(); mc.rect(wx,wy,ww,wh); mc.clip(); mR(wx,wy,ww,wh,sky);
  if(city) [[0,10,8],[7,5,9],[15,12,7],[21,7,9]].forEach(([a,h,w2])=>{ mR(wx+a,wy+h,w2,wh-h,'#9aa6b4'); for(let yy=wy+h+2;yy<wy+wh-1;yy+=3) for(let xx=wx+a+1.5;xx<wx+a+w2-1;xx+=3) mR(xx,yy,1.2,1.2,'#e8eef4'); });
  else { mE(wx+8,wy+wh,12,8,far); mE(wx+24,wy+wh+1,10,9,far); mE(wx+16,wy+wh+2,9,6,near); if(se===2) [3,11,19,26].forEach((a,i)=>mR(wx+a,wy+6+i*3,1.5,1.5,'#d9822e')); if(se===0) [5,13,22].forEach((a,i)=>mR(wx+a,wy+15+i*2,1.5,1.5,'#f6c42c')); }
  mc.restore();
  mR(wx+ww/2-.75,wy,1.5,wh,fr); mR(wx,wy+wh/2-.75,ww,1.5,fr);
  mPoly([[wx,wy],[wx+ww,wy],[wx+ww+26,ct],[wx+18,ct]],se===3?'rgba(220,230,255,.07)':'rgba(255,236,190,.12)'); // nắng xiên qua cửa sổ
  const s0=W-Math.min(70,W*.36), s1=W-6; mR(s0,22,s1-s0,2.5,city?'#8a6a4a':'#6b4329'); mR(s0,24.5,s1-s0,1,'rgba(0,0,0,.25)');
  for(let x=s0+4,i=0;x<s1-8;x+=13,i++){ if(i%3===2){ mR(x,15,8,7,'#c96a3a'); mR(x+1,13,6,2,'#a85a30'); mE(x+4,11,5,3.5,'#5f9a3a'); mE(x+2,9,3,2.5,'#7cbf4e'); continue; }
    mR(x,11,9,11,'rgba(220,235,240,.45)'); mR(x+1,14,7,8,['#4a2c18','#9a6a3a','#2e1c10','#d9b48a','#7a5230'][i%5]); mR(x,10,9,2,'#c9a24a'); mR(x+1,12,1,9,'rgba(255,255,255,.5)'); }
  if(lamp!==false){ const lx=lamp; mR(lx-.3,0,.6,6,'#3b2516'); mPoly([[lx-5,10],[lx+5,10],[lx+2.5,6],[lx-2.5,6]],'#3b4a3a');
    const gl=mc.createRadialGradient(lx,11,0,lx,11,26); gl.addColorStop(0,'rgba(255,220,150,.35)'); gl.addColorStop(1,'rgba(255,220,150,0)'); mc.fillStyle=gl; mc.fillRect(lx-26,0,52,40); mE(lx,10.5,2.4,1.3,'#ffe7a8'); }
}
// mặt quầy: gỗ ở quê, đá trắng ở phố; ct = mép trên mặt quầy
function mgCounter(ct){ const W=mgW, city=isCity();
  mR(0,ct,W,7,city?'#ece6da':'#c99a62'); mR(0,ct,W,1,city?'#fbf8f2':'#e6c08a'); mR(0,ct+6,W,1,city?'#cfc6b6':'#a97e48');
  if(city) for(let i=0;i<W;i+=9) mR(i+(i*3)%7,ct+2+(i%3),1,1,'#d6cebf'); else for(let i=0;i<W;i+=23) mR(i,ct+3,9,.6,'#b98a52');
  mR(0,ct+7,W,MGH-ct-7,city?'#5a4030':'#7a4e30'); mR(0,ct+7,W,2,'rgba(0,0,0,.3)'); for(let x=6;x<W;x+=14) mR(x,ct+9,1,MGH,city?'#4a3324':'#69422a'); }
// ly thuỷ tinh: lớp sữa đặc dưới đáy (milk = độ cao), cà phê phía trên (cof 0–1)
function mgGlass(cx,base,w,h,milk,cof,col){ const x0=cx-w/2;
  mR(x0,base-h,w,h,'rgba(215,235,240,.28)'); if(milk) mR(x0+1,base-1-milk,w-2,milk,'#f3ead6');
  if(cof>0){ const ch=(h-3-milk)*cof; mR(x0+1,base-1-milk-ch,w-2,ch,col); }
  mR(x0,base-h,1,h,'rgba(255,255,255,.55)'); mR(x0+w-1,base-h,1,h,'rgba(160,190,200,.6)'); mR(x0,base-1,w,1,'rgba(160,190,200,.7)'); mR(x0+2,base-h+2,1,h-5,'rgba(255,255,255,.4)'); }
// phin nhôm ngồi trên miệng ly (rim = mép ly); lv = mức bột so với chuẩn (1 = vừa, >1 = đầy tràn)
function mgPhin(cx,rim,lv,lid){ const ty=rim-17;
  mE(cx,rim,12,2.2,'#9aa1a9'); mE(cx,rim-.6,12,1.8,'#d3d8dd');
  mPoly([[cx-8.5,rim-1],[cx+8.5,rim-1],[cx+10.5,ty],[cx-10.5,ty]],'#c3c9d0');
  mPoly([[cx-8.5,rim-1],[cx-6,rim-1],[cx-7.5,ty],[cx-10.5,ty]],'#e9edf1'); mPoly([[cx+5.5,rim-1],[cx+8.5,rim-1],[cx+10.5,ty],[cx+7.5,ty]],'#9aa1a9');
  mE(cx,ty,10.5,3.4,'#8b9198'); mE(cx,ty+.4,9.5,2.9,'#2e3136');
  if(lv>0){ const k=Math.min(1,.3+lv*.7); mE(cx,ty+.6,9.5*k,2.9*k,'#5a3a22'); mE(cx-1,ty+.2-Math.min(lv,1)*.6,6*k,1.8*k,'#734a2c');
    if(lv>1){ const o=Math.min(1,(lv-1)/.4); mE(cx,ty-o*2.5,6+o*3,2+o*1.5,'#5a3a22'); mE(cx-1,ty-o*3,4,1.4,'#7a5232'); } }
  mc.strokeStyle='#eef1f4'; mc.lineWidth=.8; mc.beginPath(); mc.ellipse(cx,ty,10.5,3.4,0,0,Math.PI); mc.stroke();
  if(lid){ mE(cx,ty-1,9,2.6,'#aab0b7'); mE(cx,ty-1.6,9,2.3,'#dfe3e7'); mR(cx-1.5,ty-4,3,2.5,'#6b6f75'); } }
// túi giấy kraft đựng bột: (x,y) là miệng túi, a = góc nghiêng (0 = dựng đứng)
function mgBag(x,y,a){ mc.save(); mc.translate(x,y); mc.rotate(a);
  mPoly([[-7,1],[7,1],[8.5,22],[-8.5,22]],'#c9a06a'); mPoly([[4,1],[7,1],[8.5,22],[5,22]],'#a8804e'); mPoly([[-7,1],[-5,1],[-6,22],[-8.5,22]],'#dcb683');
  mR(-7.6,8,15.4,7,'#f4efe6'); mR(-7.6,9.5,15.4,1,'#8a5a3b'); mR(-7.6,12.5,15.4,1,'#8a5a3b'); mE(0,11.5,2.2,1.6,'#5a3a22');
  mR(-7,-.5,14,2,'#e3c18e'); mE(0,.6,5.5,1.3,'#3b2516'); mc.restore(); }
// đồ đựng nước nóng bên cạnh bếp; trả về toạ độ miệng để rót
function mgVessel(id,vx,base,lv){
  if(id==='den'){ mgGlass(vx,base,14,20,0,lv*.8,'#2b1a10'); mgPhin(vx,base-20,lv>0?.8:1,false); return [vx,base-37]; }
  if(id==='tra'){ mE(vx,base,11,2,'rgba(0,0,0,.2)'); mPoly([[vx-9,base-9],[vx-17,base-15],[vx-16,base-16.5],[vx-8,base-12]],'#7a3f22'); mLine([[vx+9,base-12],[vx+14,base-9],[vx+9,base-4]],1.6,'#6a3520');
    mE(vx,base-8,10,8,'#8a4a2a'); mE(vx-3,base-11,4,3,'#a8603a'); mE(vx,base-15.5,5,1.6,'#6a3520'); mE(vx,base-17,1.6,1.2,'#4a2414'); return [vx,base-16]; }
  mE(vx,base,10,2,'#cfc6b6'); mLine([[vx+7,base-11],[vx+11,base-10],[vx+11,base-5],[vx+7,base-4]],1.6,'#e8e0d0'); mR(vx-7,base-14,14,13,'#f4efe6'); mR(vx+4,base-14,3,13,'#d9d0c0'); mR(vx-7,base-14,1.2,13,'#fffdf8');
  mE(vx,base-14,7,2,'#c9bfae'); if(lv>0){ mE(vx,base-14+(1-lv)*.8,6.2,1.6,id==='cacao'?'#6b3a22':'#d99a3a'); if(id==='gung'&&lv>.6){ mE(vx-2,base-14,1.6,.8,'#f2d27a'); mE(vx+2,base-13.6,1.4,.7,'#f2d27a'); } }
  return [vx,base-15]; }
// biểu tượng món trong bong bóng gọi món
function mgCupIco(d,x,y,s){ mc.save(); mc.translate(x,y); mc.scale(s,s);
  if(d.hot){ mE(0,4,5.5,1.3,'#d6cebf'); mLine([[4,-1],[5.6,-.5],[5.6,1.6],[4,2.2]],.9,'#d9d0c0'); mR(-4,-2,8,6,'#f4efe6'); mR(2.5,-2,1.5,6,'#e2d9c8'); mE(0,-2,4,1.1,d.c);
    if(d.egg) mE(0,-2.2,3.4,.8,'#f3d27a'); else if(d.milk) mE(-1,-2.1,1.6,.5,'#f6efe2'); mc.globalAlpha=.7; mR(-1.5,-6.5,.7,3,'#c9c2b8'); mR(1,-7,.7,3,'#c9c2b8'); mc.globalAlpha=1; }
  else { mR(-3.5,-5,7,10,'rgba(200,225,235,.7)'); mR(-3,-2,6,6.5,d.c); if(d.milk) mR(-3,d.milk>1?-2:2.5,6,d.milk>1?3:2,'#f6efe2');
    if(d.ice){ mR(-2.5,-1.5,2,2,'#e9f7ff'); mR(.3,.6,2,2,'#e9f7ff'); } mR(-3.5,-5,.7,10,'rgba(255,255,255,.9)'); mR(1.2,-8,.8,6,'#c4473a'); }
  mc.restore(); }

/* --- giờ cao điểm: bấm đúng món cho người đầu hàng --- */
MGS.rush={
  start(){ const z=mg, se=SEAS[z.se];
    z.drinks=[...DRINKS.slice(0,4),...DRINKS.filter(d=>d.se===z.se),...DRINKS.filter(d=>d.need&&d.need()),...(se.hot>=.4?[drinkOf('nong')]:[])].slice(0,6);
    z.wts=z.drinks.map(d=>d.w*(d.ice?1.3-se.hot:1)*(d.hot?.4+se.hot*1.6:1));
    Object.assign(z,{t:0,dur:25,total:clamp(Math.round(z.cups*.45),10,36),spawned:0,next:0,orders:[],gone:[],served:0,wrong:0,lost:0,nowO:undefined});
    $('rPanel').innerHTML=mgHead()+`<div class="rtime"><i id="rTime"></i></div>${mgScene()}
      <div class="rnow" id="rNow"></div>
      <div class="rd">${z.drinks.map((d,i)=>`<button class="dk" data-dk="${d.id}">${cupSVG(d)}<span>${d.n}</span><kbd>${i+1}</kbd></button>`).join('')}</div>`; },
  add(){ const z=mg, d=wpick(z.drinks,z.wts), gst=mgGuest(), pat=6.8*SEAS[z.se].pat*(1+Math.min(S.staff,3)*.1)*(S.rep>1.1?1.1:1)*Math.max(.7,1-z.t*.012);
    z.orders.push({d,pat,left:pat,lk:gst.lk,spr:{},x:mgW+14+z.orders.length*4,step:0,mv:0,shake:0}); z.spawned++; },
  drop(o,ok){ const i=mg.orders.indexOf(o); if(i>=0) mg.orders.splice(i,1); o.left=null; mg.gone.push({o,ok,t:0});
    if(!ok) for(let k=0;k<3;k++) mgPuff({k:'steam',x:o.x+rnd(-3,3),y:36,vx:rnd(-6,6),vy:rnd(-14,-8),s:1.6,life:.8,a:.6}); },
  tick(dt){ const z=mg; z.t+=dt; const open=z.t<z.dur-1.5&&z.spawned<z.total;
    z.next-=dt; if(open&&(z.next<=0||!z.orders.length)&&z.orders.length<5){ this.add(); z.next=Math.max(.75,2.1-z.t*.05)*rnd(.8,1.2); }
    z.orders.slice().forEach(o=>{ o.left-=dt; if(o.left<=0){ z.lost++; z.combo=0; this.drop(o,false); mgFloat(L("Bỏ về!"),true); sfx('bad',300); buzz(50); } });
    mgClock(z.dur-z.t,z.dur);
    if(z.t>=z.dur||(z.spawned>=z.total&&!z.orders.length)) return this.end();
    const f=z.orders[0]; if(f!==z.nowO){ z.nowO=f; $('rNow').innerHTML=f?L("Khách đầu hàng gọi: <b>{0}</b>",f.d.n):`<span class="sm">${L("Chờ khách tới…")}</span>`; }
    mgStat(); },
  serve(id){ const z=mg, o=z.orders[0]; if(!o) return;
    if(o.d.id===id){ z.served++; z.combo++; z.best=Math.max(z.best,z.combo);
      const tip=Math.round(S.price*.18*(1+.6*clamp(o.left/o.pat,0,1))*(1+Math.min(z.combo,10)*.1)/1000)*1000;
      z.tips+=tip; this.drop(o,true); mgFloat('+'+kk(tip)); sfx('ok',0,z.combo); buzz(8); mgStat(); }
    else { z.wrong++; z.combo=0; o.left=Math.max(.4,o.left-1.5); o.shake=.3; mgFloat(L("Sai món!"),true); sfx('wrong'); buzz(60); } },
  down(e){ const b=e.target.closest('[data-dk]'); if(b) this.serve(b.dataset.dk); },
  key(e,up){ if(up) return; const k=+e.key; if(k>=1&&k<=mg.drinks.length) this.serve(mg.drinks[k-1].id); },
  // khách xếp hàng bên kia quầy, bong bóng món + thanh kiên nhẫn trên đầu; pha xong ly trượt tới, khách cầm đi ra cửa bên trái
  paint(dt){ const z=mg, ct=64, cx=mgW/2, at=mg.at, feet=ct+12, slot=i=>cx-56+i*28;
    mgWall(ct,cx+4);
    const walk=(o,tx,sp)=>{ const d=tx-o.x; if(Math.abs(d)<.6){ o.x=tx; o.mv=0; return; } o.mv=Math.sign(d); o.x+=o.mv*Math.min(Math.abs(d),sp*dt); o.step+=dt*9; };
    const body=o=>{ const fr=o.mv?[1,0,2,0][Math.floor(o.step)%4]:0, dir=o.mv?'s':'d', k=dir+fr, im=o.spr[k]||(o.spr[k]=buildSprite(o.lk,dir,fr,'stand'));
      const sh=o.shake>0?Math.sin(o.shake*70)*1.3:0, tap=!o.mv&&o.left!=null&&o.left/o.pat<.3?Math.abs(Math.sin(at*14))*.8:0;
      if(o.mv<0){ mc.save(); mc.translate(o.x+sh,0); mc.scale(-1,1); mc.drawImage(im,-11.25,feet-39-tap,22.5,40); mc.restore(); } else mc.drawImage(im,o.x-11.25+sh,feet-39-tap,22.5,40); };
    z.gone.forEach(g=>{ g.t+=dt; if(g.t>(g.ok?.45:.12)) walk(g.o,-16,g.ok?40:64); body(g.o); }); z.gone=z.gone.filter(g=>g.o.x>-15);
    z.orders.forEach((o,i)=>{ walk(o,slot(i),44); if(o.shake>0) o.shake-=dt; body(o); });
    mgCounter(ct);
    z.gone.forEach(g=>{ if(!g.ok) return; const k=Math.min(1,g.t/.22), x=cx+(g.o.x+4-cx)*k, y=MGH-4+(ct+1-MGH+4)*k; if(g.t<.45) mgCupIco(g.o.d,x,y,1.1);
      else if(g.o.mv) mgCupIco(g.o.d,g.o.x-7,ct-5,.9); });
    z.orders.forEach((o,i)=>{ if(o.x>mgW+4) return; const bx=o.x, by=feet-48, f=clamp(o.left/o.pat,0,1), first=i===0, w=first?17:14, h=first?14:12;
      mR(bx-w/2-.8,by-h/2-.8,w+1.6,h+1.6,first?'#e9b23f':'#3b2516'); mR(bx-w/2,by-h/2,w,h,'#fffaf0'); mPoly([[bx-2,by+h/2],[bx+2,by+h/2],[bx,by+h/2+3]],'#fffaf0');
      mgCupIco(o.d,bx,by+1,first?1.15:1);
      mR(bx-7,by-h/2-4,14,2.2,'#3b2516'); mR(bx-6.6,by-h/2-3.6,12.8*f,1.4,f>.5?'#6fbf5a':f>.25?'#e9b23f':'#e2574c');
      if(f<.25&&Math.floor(at*4)%2) mTxt('💢',bx+8,by-11,6,'#e2574c'); });
    mgFx(dt); },
  end(){ const z=mg, stars=z.lost+z.wrong<=2&&z.served>=z.total*.75?3:z.served>=z.total*.5?2:1;
    mgEnd(stars,[[L("Pha đúng"),z.served+L(' ly')],[L("Combo dài nhất"),'×'+z.best],[L('Pha sai'),z.wrong],[L("Khách bỏ về"),z.lost,z.lost?'neg':'']]); }
};

/* --- canh gram bột: giữ để đổ, thả đúng lúc; bột còn rơi thêm sau khi thả (mùa Hạ bột ẩm rơi nhiều hơn) --- */
const WEIGH=[{d:'den',g:20},{d:'sua',g:24},{d:'bx',g:12},{d:'nong',g:22},{d:'trung',g:18,se:0}];
const fmtG=g=>g.toFixed(1).replace('.',',')+'g';
MGS.weigh={
  start(){ const z=mg, pool=WEIGH.filter(w=>w.se==null||w.se===z.se), strong=z.se===3?2:0;
    z.rounds=Array.from({length:5},()=>{ const w=pick(pool); return {d:drinkOf(w.d),g:w.g+strong}; });
    Object.assign(z,{i:0,res:[],lag:z.se===1?[.6,1.7]:[.2,.9],ang:.75});
    $('rPanel').innerHTML=mgHead()+`<div class="mgsub"><b id="wRound"></b><span class="sm" id="wNote"></span></div>
      ${mgScene('<div class="mgread" id="wG"></div>')}
      <div class="gauge"><i class="zy" id="wZy"></i><i class="zg" id="wZg"></i><i class="fill" id="wFill"></i><i class="mk" id="wMk"></i></div>
      <div class="fb" id="wFb"></div>
      <button class="wbtn go hold" id="mgHold">${L("Giữ để đổ bột")}</button>`;
    this.round(); },
  round(){ const z=mg, r=z.rounds[z.i], pct=v=>clamp(v/z.max*100,0,100); z.g=0; z.held=0; z.tail=0; z.state='ready'; z.max=r.g*1.7; z.cof=0; z.drip=0;
    $('wRound').textContent=L("Ly {0}/{1} · {2}",z.i+1,z.rounds.length,r.d.n);
    $('wNote').textContent=z.se===1?L("Trời nồm, bột ẩm rơi lốp cốp"):z.se===3?L("Trời lạnh, khách thích đậm hơn"):''; $('wFb').textContent='';
    Object.assign($('wZy').style,{left:pct(r.g-2.5)+'%',width:(pct(r.g+2.5)-pct(r.g-2.5))+'%'});
    Object.assign($('wZg').style,{left:pct(r.g-1)+'%',width:(pct(r.g+1)-pct(r.g-1))+'%'}); this.draw(); },
  draw(){ const z=mg, p=clamp(z.g/z.max*100,0,100); $('wG').innerHTML=`${fmtG(z.g)}<small>${L("cần {0}g",z.rounds[z.i].g)}</small>`; $('wMk').style.left=p+'%'; $('wFill').style.width=p+'%'; mgStat(); },
  press(){ const z=mg; if(z.state!=='ready') return; z.state='pour'; $('mgHold').classList.add('on'); },
  release(){ const z=mg; if(!z||z.state!=='pour') return; z.state='settle'; $('mgHold').classList.remove('on'); z.tail=rnd(...z.lag)*(1+z.held*.12); z.st=.45; },
  down(e){ if(e.target.closest('#mgHold')) this.press(); },
  up(){ this.release(); },
  key(e,up){ if(e.code==='Space'){ e.preventDefault(); if(up) this.release(); else if(!e.repeat) this.press(); } },
  tick(dt){ const z=mg;
    if(z.state==='pour'){ z.held+=dt; z.g+=(4+z.held*5)*dt; sfx('pour',75); if(z.g>=z.max) this.release(); }
    else if(z.state==='settle'){ const a=Math.min(z.tail,dt*2.5); z.g+=a; z.tail-=a; if(a>0) sfx('pour',150); z.st-=dt; if(z.st<=0&&z.tail<=0) this.judge(); }
    else if(z.state==='show'){ z.st-=dt; if(z.st<=0){ z.i++; if(z.i>=z.rounds.length) return this.end(); this.round(); } }
    this.draw(); },
  judge(){ const z=mg, r=z.rounds[z.i], err=z.g-r.g, a=Math.abs(err), gr=a<=.7?3:a<=1.5?2:a<=3?1:0; z.res.push({gr,a});
    const tip=mgScore(gr); z.cofC=err>1.5?'#1c1008':err<-1.5?'#8a6446':'#3b2516';
    $('wFb').innerHTML=[err>0?`<span class="neg">${L("Đậm quá, đắng nghét!")}</span>`:`<span class="neg">${L("Nhạt thếch!")}</span>`,`<span>${L("Hơi lệch, tạm được")}</span>`,L('<span class="pos">Ngon!</span>'),`<span class="pos">${L("Chuẩn từng gram!")}</span>`][gr]+(tip?` <b class="pos">+${kk(tip)}</b>`:'');
    z.state='show'; z.st=1.6; },
  // túi kraft nghiêng đổ bột vào phin đặt trên ly, ly đặt trên cân điện tử; chấm xong thì đậy nắp, cà phê nhỏ giọt xuống ly
  paint(dt){ const z=mg, r=z.rounds[z.i], ct=74, cx=mgW/2+4, rim=ct-28, ty=rim-17;
    mgWall(ct,false); mgCounter(ct);
    mR(cx-22,ct-2,44,8,'#3a3f46'); mR(cx-22,ct-2,44,1,'#5a6068'); mR(cx-21,ct+5,42,1,'#24282d');
    const last=z.res[z.res.length-1], lcd=z.state==='show'&&last?['#e8a598','#f2d27a','#a8dc8a','#8fe07a'][last.gr]:'#b9d8a8';
    mR(cx-10,ct-.5,20,5,lcd); mTxt(z.g.toFixed(1).replace('.',','),cx,ct+2.1,4.4,'#24321e',true);
    mR(cx-19,ct-5,38,3,'#cfd4d9'); mR(cx-19,ct-5,38,.8,'#f1f3f5'); mR(cx-19,ct-2.4,38,.6,'#8f959c');
    const milk=r.d.milk?(r.d.milk>1?8:4):0; mgGlass(cx,ct-5,16,23,milk,z.cof,z.cofC||'#3b2516');
    mgPhin(cx,rim,z.g/r.g,z.state==='show');
    const pouring=z.state==='pour'||(z.state==='settle'&&z.tail>.02), want=z.state==='pour'?2.2:pouring?1.95:.75;
    z.ang+=(want-z.ang)*Math.min(1,dt*8); const f=clamp((z.ang-.75)/1.45,0,1), bx=cx-16+f*16, by=10+f*9;
    if(pouring&&f>.55) for(let i=0,n=z.state==='pour'?3:1;i<n;i++) mgPuff({x:bx+rnd(-1,1),y:by+1,vx:(cx-bx)*rnd(1.2,2.4)+rnd(-4,4),vy:rnd(5,15),g:320,s:rnd(.8,1.4),c:pick(['#4a2c18','#5a3a22','#6b4329']),life:1,floor:ty+.5});
    if(z.state==='show'){ z.cof=Math.min(1,z.cof+dt*.6); z.drip-=dt; if(z.drip<=0){ z.drip=.15; mgPuff({x:cx+rnd(-1.5,1.5),y:rim+1,vy:10,g:200,s:1,c:'#3b2516',life:1,floor:ct-7-milk-z.cof*14}); } }
    mgFx(dt); mgBag(bx,by,z.ang); },
  end(){ const z=mg, s=z.res.reduce((a,b)=>a+b.gr,0), stars=s>=12?3:s>=7?2:1, avg=z.res.reduce((a,b)=>a+b.a,0)/z.res.length;
    mgEnd(stars,[[L("Ly chuẩn (lệch ≤ 0,7g)"),z.res.filter(x=>x.gr===3).length+'/'+z.res.length],[L("Lệch trung bình"),fmtG(avg)],[L("Chuỗi ngon dài nhất"),'×'+z.best]]); }
};

/* --- canh nhiệt độ nước: lửa to nhỏ thất thường, bấm Rót khi kim vào vùng xanh của món --- */
const TEMPS=[{n:L("Phin cà phê"),d:'den',lo:90,hi:96,why:L("Nước 90–96°C chiết vừa đủ vị đậm, không khét.")},
  {n:L("Trà (pha trà đá)"),d:'tra',lo:80,hi:88,why:L("Nước sôi già làm trà chát, mất thơm.")},
  {n:L("Ca cao nóng"),d:'cacao',lo:70,hi:80,why:L("Ca cao, sữa mà quá nóng dễ vón, mất béo.")},
  {n:L("Trà gừng"),d:'gung',lo:95,hi:100,why:L("Gừng cần nước thật sôi mới dậy mùi cay ấm.")}];
const T0=20, T1=105, tpct=t=>clamp((t-T0)/(T1-T0)*100,0,100);
MGS.temp={
  start(){ const z=mg, w=[[3,2,1,2],[3,3,1,0],[3,2,3,1],[3,1,2,3]][z.se];
    z.rounds=Array.from({length:5},()=>wpick(TEMPS,w)); Object.assign(z,{i:0,res:[],amb:[24,32,26,15][z.se],over:0});
    $('rPanel').innerHTML=mgHead()+`<div class="mgsub"><b id="tRound"></b><span class="sm" id="tZone"></span></div>
      ${mgScene('<div class="mgread" id="tT"></div>')}
      <div class="gauge"><i class="zy" id="tZy"></i><i class="zg" id="tZg"></i><i class="fill hot" id="tFill"></i><i class="mk" id="tMk"></i><i class="boil" style="left:${tpct(100)}%"></i></div>
      <div class="fb" id="tFb"></div>
      <button class="wbtn gold hold" id="mgPour">${L("Rót!")}</button>`;
    this.round(); },
  round(){ const z=mg, r=z.rounds[z.i]; z.T=z.amb+rnd(-3,3); z.v=rnd(7,9.5)+z.i*1.4; z.ph=rnd(0,6); z.boil=0; z.state='heat'; z.surge=1; z.pourT=0; z.fillV=0; z.tilt=0;
    $('tRound').textContent=L("Ấm {0}/{1} · {2}",z.i+1,z.rounds.length,r.n); $('tZone').textContent=L("vùng xanh {0}–{1}°C",r.lo,r.hi); $('tFb').textContent='';
    Object.assign($('tZy').style,{left:tpct(r.lo-4)+'%',width:(tpct(r.hi+4)-tpct(r.lo-4))+'%'});
    Object.assign($('tZg').style,{left:tpct(r.lo)+'%',width:(tpct(r.hi)-tpct(r.lo))+'%'}); this.draw(); },
  draw(){ const z=mg, p=tpct(z.T), r=z.rounds[z.i]; $('tT').innerHTML=`${Math.floor(z.T)}°C<small>${L("xanh {0}–{1}°C",r.lo,r.hi)}</small>`; $('tMk').style.left=p+'%'; $('tFill').style.width=p+'%'; mgStat(); },
  pour(){ if(mg.state==='heat') this.judge(false); },
  down(e){ if(e.target.closest('#mgPour')) this.pour(); },
  key(e,up){ if(!up&&(e.code==='Space'||e.key==='Enter')){ e.preventDefault(); this.pour(); } },
  tick(dt){ const z=mg, r=z.rounds[z.i];
    if(z.state==='heat'){ z.ph+=dt; const surge=Math.max(.3,1+.55*Math.sin(z.ph*1.7)+.25*Math.sin(z.ph*4.3)); z.surge=surge;
      z.T=Math.min(100,z.T+z.v*surge*dt*(z.T>85?1.25:1));
      if(z.T>=100){ z.boil+=dt; sfx('bubble',110); if(z.boil>(r.hi>=100?1.4:.5)) this.judge(true); } else if(z.T>80) sfx('bubble',240); }
    else if(z.state==='show'){ z.st-=dt; if(z.st<=0){ z.i++; if(z.i>=z.rounds.length) return this.end(); this.round(); } }
    this.draw(); },
  judge(over){ const z=mg, r=z.rounds[z.i], T=z.T; let gr;
    if(over&&r.hi<100) gr=0; else if(T>=r.lo&&T<=r.hi) gr=Math.abs(T-(r.lo+r.hi)/2)<=(r.hi-r.lo)/4?3:2; else gr=T>=r.lo-4&&T<=r.hi+4?1:0;
    if(over&&gr===0) z.over++; z.res.push(gr); const tip=mgScore(gr);
    const head=gr===0?(over?L("Sôi trào, bỏng tay!"):T<r.lo?L("Nước nguội, nhạt vị!"):L("Quá nóng, khét đắng!")):['',L("Hơi lệch, tạm được"),L('Ngon!'),L("Chuẩn nhiệt!")][gr];
    $('tFb').innerHTML=`<span class="${gr>=2?'pos':gr?'':'neg'}">${head}</span>${tip?` <b class="pos">+${kk(tip)}</b>`:''}<small>${r.why}</small>`;
    z.state='show'; z.st=1.9; z.pourT=0; },
  // đồng hồ nhiệt kim (vạch vàng/xanh theo món), bếp ga mini lửa phập phồng, ấm nhôm bốc hơi, nắp rung khi gần sôi; bấm Rót thì nghiêng ấm rót sang phin / ấm trà / cốc
  paint(dt){ const z=mg, r=z.rounds[z.i], ct=74, kx=mgW/2-2, kb=ct-13, at=mg.at, T=z.T;
    mgWall(ct,false); mgCounter(ct);
    const dx=kx-46, dy=ct-38, R2=16, A=t=>Math.PI*(.75+1.5*clamp((t-T0)/(T1-T0),0,1));
    mR(dx-1,dy+R2,2,ct+3-dy-R2,'#6b6f75'); mE(dx,ct+3,6,1.6,'#4a4f55');
    mE(dx,dy,R2+2.2,R2+2.2,'#8f959c'); mE(dx,dy,R2+1.2,R2+1.2,'#d6dade'); mE(dx,dy,R2,R2,'#f7f3ea');
    const arc=(a,b,c)=>{ mc.strokeStyle=c; mc.lineWidth=3; mc.lineCap='butt'; mc.beginPath(); mc.arc(dx,dy,R2-3,A(a),A(b)); mc.stroke(); };
    arc(r.lo-4,r.hi+4,'#f2d27a'); arc(r.lo,r.hi,'#6fbf5a'); arc(100,T1,'#e2574c');
    for(let t=20;t<=100;t+=10){ const a=A(t), c=Math.cos(a), s=Math.sin(a), l=t%50===0?4:2.2; mLine([[dx+c*(R2-1),dy+s*(R2-1)],[dx+c*(R2-1-l),dy+s*(R2-1-l)]],.6,'#3b2516'); }
    mTxt('°C',dx,dy+8,4,'#6b5a4a');
    const na=A(T); mLine([[dx-Math.cos(na)*3,dy-Math.sin(na)*3],[dx+Math.cos(na)*(R2-3),dy+Math.sin(na)*(R2-3)]],1.1,'#c4473a'); mE(dx,dy,1.8,1.8,'#3b2516');
    if(z.state==='show'){ z.pourT+=dt; const p=z.pourT; z.tilt=p<.35?p/.35*.55:p<1.15?.55:Math.max(0,.55-(p-1.15)/.35*.55); if(p>.35&&p<1.15) z.fillV=Math.min(1,z.fillV+dt*1.4); } else z.tilt=0;
    const mouth=mgVessel(r.d,kx+46,ct+3,z.fillV);
    mR(kx-20,ct-8,40,12,'#3a3f46'); mR(kx-20,ct-8,40,1.2,'#5a6068'); mR(kx-18,ct-5,26,6,'#4a5058'); mE(kx+13,ct-2,3,3,'#22262b'); mE(kx+13,ct-2,2,2,'#c4473a'); mR(kx+12.6,ct-4,.8,2,'#f4efe6');
    const sg=z.state==='heat'?z.surge:.35;
    for(let i=-5;i<=5;i++){ const fx=kx+i*2.3, h=(2.2+sg*3.4)*(.72+.28*Math.sin(at*23+i*1.7)); mPoly([[fx-1.2,ct-8],[fx+1.2,ct-8],[fx,ct-8-h]],'#3d7bff'); mPoly([[fx-.6,ct-8],[fx+.6,ct-8],[fx,ct-8-h*.55]],'#bfe2ff'); if(sg>1.3) mR(fx-.3,ct-8.6-h,.6,.8,'#ffb347'); }
    mR(kx-17,kb,34,1.6,'#22262b'); [-14,-5,5,14].forEach(o=>mR(kx+o-.6,kb,1.2,5,'#22262b'));
    const rat=z.state==='heat'&&T>90?Math.abs(Math.sin(at*38))*(T-90)/10*1.2:0, px0=kx+15, cs=Math.cos(z.tilt), sn=Math.sin(z.tilt);
    mc.save(); mc.translate(px0,kb); mc.rotate(z.tilt); mc.translate(-px0,-kb);
    mLine([[kx-9,kb-17],[kx-8,kb-28],[kx+8,kb-28],[kx+9,kb-17]],1.8,'#3b2516');
    mPoly([[kx+10,kb-6],[kx+12,kb-13],[kx+25,kb-23],[kx+26.5,kb-21.5]],'#a9b0b8');
    mPoly([[kx-15,kb],[kx+15,kb],[kx+12,kb-15],[kx-12,kb-15]],'#c3c9d0'); mE(kx,kb-15,12,4.5,'#cfd4da');
    mPoly([[kx-15,kb],[kx-10,kb],[kx-8,kb-15],[kx-12,kb-15]],'#eef1f4'); mPoly([[kx+9,kb],[kx+15,kb],[kx+12,kb-15],[kx+7.5,kb-15]],'#9aa1a9'); mR(kx-15,kb-2,30,2,'#5a5f66');
    mE(kx,kb-17-rat,6,2,'#aab0b7'); mE(kx,kb-17.6-rat,6,1.6,'#e3e7eb'); mE(kx,kb-19.5-rat,1.8,1.3,'#22262b');
    mc.restore();
    const ox=11, oy=-22.5, tip=[px0+ox*cs-oy*sn,kb+ox*sn+oy*cs];
    if(z.tilt>.4&&z.pourT<1.2){ mc.strokeStyle='rgba(210,235,255,.9)'; mc.lineWidth=1.5; mc.lineCap='round'; mc.beginPath(); mc.moveTo(tip[0],tip[1]); mc.quadraticCurveTo(tip[0]+(mouth[0]-tip[0])*.75,tip[1]-1,mouth[0],mouth[1]); mc.stroke();
      if(Math.random()<dt*30) mgPuff({x:mouth[0]+rnd(-2,2),y:mouth[1],vx:rnd(-12,12),vy:rnd(-14,-6),g:150,s:.9,c:'#dff3ff',life:.4}); }
    const hot=clamp((T-50)/50,0,1);
    if(Math.random()<hot*dt*26) mgPuff({k:'steam',x:tip[0]+rnd(-1,1),y:tip[1]-1,vx:rnd(2,8),vy:rnd(-14,-8),s:rnd(1,2),life:rnd(.8,1.4),a:.25+hot*.4});
    if(z.state==='heat'&&T>=99.5){ if(Math.random()<dt*22) mgPuff({x:kx+rnd(-6,6),y:kb-18,vx:rnd(-14,14),vy:rnd(-30,-15),g:120,s:1,c:'#dff3ff',life:.6}); if(Math.random()<dt*18) mgPuff({k:'steam',x:kx+rnd(-5,5),y:kb-19,vx:rnd(-3,3),vy:-16,s:2,life:1.2,a:.5}); }
    if(z.fillV>.5&&Math.random()<dt*6) mgPuff({k:'steam',x:mouth[0]+rnd(-3,3),y:mouth[1]-2,vx:rnd(-2,2),vy:-9,s:1.4,life:1.2,a:.3});
    mgFx(dt); },
  end(){ const z=mg, s=z.res.reduce((a,b)=>a+b,0), stars=s>=12?3:s>=7?2:1;
    mgEnd(stars,[[L("Ấm chuẩn nhiệt"),z.res.filter(x=>x===3).length+'/'+z.res.length],[L("Rót trong vùng xanh"),z.res.filter(x=>x>=2).length+'/'+z.res.length],[L("Sôi trào"),z.over,z.over?'neg':''],[L("Chuỗi ngon dài nhất"),'×'+z.best]]); }
};

/* --- chọn hạt cafe: đọc gu khách, chọn Robusta / Arabica / Culi / Moka --- */
const BEANS=[{id:'rob',n:'Robusta',k:L("đậm · đắng · nhiều cafein"),c:'#4a2c18'},{id:'ara',n:'Arabica',k:L("thơm · chua thanh · ít đắng"),c:'#9a6a3a'},
  {id:'culi',n:'Culi',k:L("hạt tròn · cực đậm · béo"),c:'#2e1c10',round:1},{id:'moka',n:'Moka',k:L("thơm nồng · hiếm · Cầu Đất"),c:'#7a5230'}];
// [câu khách nói, hạt đúng, giải thích, mùa (nếu chỉ hỏi vào mùa đó)]
const ASKS=[
  [L("Cho chú ly đen thật đậm, đắng mới tỉnh người."),'rob',L("Robusta nhiều cafein gần gấp đôi Arabica, vị đắng đậm — gu phin truyền thống.")],
  [L("Cà phê sữa đá kiểu Sài Gòn, đậm đà để sữa không lấn."),'rob',L("Sữa đặc cần hạt đậm như Robusta mới cân vị.")],
  [L("Bạc xỉu nhiều sữa mà vẫn phải ra vị cà phê nha."),'rob',L("Nhiều sữa thì cần hạt đậm như Robusta.")],
  [L("Em thích vị chua nhẹ, thơm mùi trái cây."),'ara',L("Arabica có vị chua thanh, hương trái cây và hoa.")],
  [L("Ít đắng thôi, uống buổi chiều cho khỏi mất ngủ."),'ara',L("Arabica ít cafein, chỉ khoảng một nửa Robusta.")],
  [L("Pha máy kiểu Ý cho anh, lớp crema thơm dịu."),'ara',L("Espresso kiểu Ý thường dùng Arabica cho hương dịu.")],
  [L("Mai thi rồi, cho ly mạnh nhất quán để thức xuyên đêm!"),'culi',L("Culi là hạt tròn (mỗi trái chỉ một hạt), đậm và nhiều cafein nhất.")],
  [L("Chị thích ly sánh đặc, béo, đậm thật đậm."),'culi',L("Culi cho nước sánh, béo, vị đậm đặc.")],
  [L("Hôm nay sinh nhật, cho ly loại thơm quý nhất nha."),'moka',L("Moka Cầu Đất (Đà Lạt) hiếm, hương thơm nồng nàn, giá cao.")],
  [L("Nghe nói Đà Lạt có hạt Moka Cầu Đất, cho anh thử."),'moka',L("Moka trồng ở Cầu Đất, Đà Lạt — loại hạt quý của Việt Nam.")],
  [L("Xuân về, pha ly thơm sang để mời khách đến chúc Tết."),'moka',L("Ngày Tết người ta chuộng hạt thơm quý như Moka."),0],
  [L("Đầu năm đi lễ chùa về, cho ly nhẹ nhàng thơm thơm."),'ara',L("Arabica nhẹ, thơm — hợp nhâm nhi ngày xuân."),0],
  [L("Trời nắng như đổ lửa, cho ly cold brew mát, thơm trái cây."),'ara',L("Cold brew Arabica ra vị trái cây mát, ít đắng."),1],
  [L("Nắng trưa mệt rã rời, cho ly sữa đá đậm cho tỉnh."),'rob',L("Sữa đá đậm đà, tỉnh táo nhờ Robusta nhiều cafein."),1],
  [L("Gió heo may rồi, cho ly nóng thơm dịu ngồi ngắm lá rơi."),'ara',L("Arabica thơm dịu hợp ly nóng nhâm nhi chiều thu."),2],
  [L("Trung thu có bánh nướng ngọt, cho ly đen đậm ăn kèm."),'rob',L("Bánh ngọt ăn với cà phê đen Robusta đậm là \"chân ái\"."),2],
  [L("Rét quá, cho ly nóng thật đậm cho ấm bụng."),'culi',L("Culi đậm, nhiều cafein — ly nóng rất \"ấm\"."),3],
  [L("Gió bấc lạnh tê, đen nóng đậm đặc kiểu Hà Nội nhé."),'rob',L("Cà phê đen nóng truyền thống dùng Robusta đậm."),3]];
// bao bố đựng hạt đặt trên quầy, có thẻ tên; hl = màu viền sáng (đúng/sai)
function mgSack(sx,base,b,hl){ const top=base-24;
  if(hl) mE(sx,base,15,3.5,hl);
  mPoly([[sx-11,base],[sx+11,base],[sx+12.5,base-11],[sx+10.5,top+3],[sx-10.5,top+3],[sx-12.5,base-11]],'#c4a067');
  mPoly([[sx+6,base],[sx+11,base],[sx+12.5,base-11],[sx+10.5,top+3],[sx+7,top+3]],'#a9854f'); mPoly([[sx-11,base],[sx-8,base],[sx-9,top+3],[sx-10.5,top+3],[sx-12.5,base-11]],'#d6b47c');
  for(let y=top+5;y<base-1;y+=2) for(let x=sx-10+(y%4?1:0);x<sx+10;x+=2.5) mR(x,y,1,.6,'rgba(120,85,45,.3)');
  mE(sx,top+3,11.5,3.6,'#dcbd85'); mE(sx,top+3.3,10,2.9,shade(b.c,.7));
  const r=srand(b.id.charCodeAt(0)*31+b.id.length*7); for(let k=0;k<28;k++){ const a=r()*6.28, d=Math.sqrt(r()); mE(sx+Math.cos(a)*d*8.5,top+2.4+Math.sin(a)*d*2.3-(1-d)*1.4,b.round?1:1.25,b.round?1:.8,r()<.5?b.c:shade(b.c,1.3)); }
  mR(sx-.3,top+5,.6,base-11-top-5,'rgba(80,60,40,.45)'); mR(sx-9,base-11.5,18,7,'#f6f0e2'); mR(sx-9,base-11.5,18,.8,'#c9b896'); mTxt(b.n,sx,base-7.8,4.2,'#3b2516'); }
MGS.bean={
  start(){ const z=mg, sea=shuffle(ASKS.filter(a=>a[3]===z.se)), rest=shuffle(ASKS.filter(a=>a[3]==null));
    z.qs=shuffle([...sea.slice(0,2),...rest.slice(0,4)]); Object.assign(z,{i:0,ok:0,lim:9*SEAS[z.se].pat,sx:[]});
    $('rPanel').innerHTML=mgHead()+`<div class="rtime"><i id="rTime"></i></div><div class="mgsub"><b id="bRound"></b><span class="sm">${L("Chạm vào bao hạt hợp gu khách")}</span></div>
      ${mgScene()}<div class="ask"><div class="say" id="bSay"></div></div><div class="fb" id="bFb"></div>
      <div class="rd beans">${BEANS.map((b,i)=>`<button class="dk bean" data-bean="${b.id}">${beanSVG(b)}<span>${b.n}<small>${b.k}</small></span><kbd>${i+1}</kbd></button>`).join('')}</div>`;
    this.round(); },
  round(){ const z=mg, q=z.qs[z.i]; z.who=mgGuest(); z.who.im=null; z.left=z.lim; z.state='ask'; z.pick=null;
    $('bRound').textContent=L("Khách {0}/{1}",z.i+1,z.qs.length); $('bSay').innerHTML=`<span class="who">${z.who.n}:</span> “${q[0]}”`; $('bFb').textContent='';
    document.querySelectorAll('[data-bean]').forEach(b=>b.classList.remove('right','bad')); },
  answer(id){ const z=mg, q=z.qs[z.i], ok=id===q[1], gr=ok?(z.left/z.lim>.5?3:2):0; if(ok) z.ok++;
    const tip=mgScore(gr,1.1), right=BEANS.find(b=>b.id===q[1]); z.pick=id; z.burst=true;
    document.querySelector(`[data-bean="${q[1]}"]`).classList.add('right'); if(id&&!ok) document.querySelector(`[data-bean="${id}"]`).classList.add('bad');
    $('bFb').innerHTML=(ok?`<span class="pos">${L("Đúng rồi!")}</span>${tip?` <b class="pos">+${kk(tip)}</b>`:''}`:`<span class="neg">${L("{0} — phải là {1}.",id?L("Chưa đúng"):L("Hết giờ"),right.n)}</span>`)+`<small>${q[2]}</small>`;
    z.state='show'; z.st=2.3; },
  down(e){ const z=mg; if(z.state!=='ask') return; const b=e.target.closest('[data-bean]'); if(b) return this.answer(b.dataset.bean);
    if(e.target.id==='mgCv'){ const [px,py]=mgAt(e), i=z.sx.findIndex(s=>Math.abs(px-s)<13); if(i>=0&&py>38) this.answer(BEANS[i].id); } },
  key(e,up){ if(up) return; const k=+e.key; if(k>=1&&k<=BEANS.length&&mg.state==='ask') this.answer(BEANS[k-1].id); },
  tick(dt){ const z=mg;
    if(z.state==='ask'){ z.left-=dt; const ti=$('rTime'); ti.style.width=Math.max(0,z.left/z.lim*100)+'%'; ti.classList.toggle('low',z.left<3); if(z.left<=0) this.answer(null); }
    else if(z.state==='show'){ z.st-=dt; if(z.st<=0){ z.i++; if(z.i>=z.qs.length) return this.end(); this.round(); } }
    mgStat(); },
  // khách đứng bên kia quầy nói gu, bốn bao bố hạt trên quầy — chạm thẳng vào bao để chọn
  paint(dt){ const z=mg, ct=66, cx=mgW/2+6, at=mg.at, q=z.qs[z.i], px=cx-68, right=q&&q[1];
    mgWall(ct,cx-30);
    if(z.who){ const im=z.who.im||(z.who.im=buildSprite(z.who.lk,'d',0,'stand')), bob=z.state==='ask'&&z.left<3?Math.abs(Math.sin(at*12)):0; mc.drawImage(im,px-11.25,ct+12-39-bob,22.5,40); }
    mgCounter(ct);
    const by=ct-34; mR(px-8,by-5,16,10,'#fffaf0'); mPoly([[px-2,by+5],[px+2,by+5],[px-1,by+8]],'#fffaf0');
    if(z.state==='ask') [0,1,2].forEach(i=>mE(px-4+i*4,by-(Math.floor(at*3)%3===i?1:0),1.1,1.1,'#6b5a4a'));
    else mTxt(z.pick===right?'♥':'?!',px,by+.3,7,z.pick===right?'#e2574c':'#c4473a');
    z.sx=BEANS.map((b,i)=>cx-38+i*27);
    BEANS.forEach((b,i)=>{ const sx=z.sx[i], show=z.state==='show', hl=show&&b.id===right?'rgba(120,230,120,.6)':show&&b.id===z.pick?'rgba(240,90,70,.55)':null, sh=show&&b.id===z.pick&&b.id!==right&&z.st>1.9?Math.sin(at*60):0;
      mgSack(sx+sh,ct+8,b,hl);
      if(show&&b.id===right){ const yy=ct-24+Math.sin(at*8)*1.5; mPoly([[sx-3,yy-4],[sx+3,yy-4],[sx,yy]],'#3f8f2e'); }
      if(z.burst&&b.id===(z.pick||right)) for(let k=0;k<12;k++) mgPuff({x:sx+rnd(-6,6),y:ct-17,vx:rnd(-22,22),vy:rnd(-42,-20),g:170,s:1.3,c:k%2?b.c:shade(b.c,1.3),life:.9}); });
    z.burst=false; mgFx(dt); },
  end(){ const z=mg, stars=z.ok>=5?3:z.ok>=3?2:1; mgEnd(stars,[[L("Chọn đúng"),z.ok+'/'+z.qs.length],[L("Chuỗi đúng dài nhất"),'×'+z.best]]); }
};

$('rPanel').addEventListener('pointerdown',e=>{ if(!mg||mg.done) return; const G=MGS[mg.kind]; if(e.target.closest('button')) e.preventDefault(); G.down&&G.down(e); });
addEventListener('pointerup',()=>{ if(mg&&!mg.done){ const G=MGS[mg.kind]; G.up&&G.up(); } });
addEventListener('pointercancel',()=>{ if(mg&&!mg.done){ const G=MGS[mg.kind]; G.up&&G.up(); } });
$('rPanel').addEventListener('contextmenu',e=>e.preventDefault());
$('rPanel').addEventListener('click',e=>{ if(e.target.closest('#rEnd')) mgClose(); });
addEventListener('keydown',e=>{ if(mg&&!mg.done&&MGS[mg.kind].key) MGS[mg.kind].key(e,false); });
addEventListener('keyup',e=>{ if(mg&&!mg.done&&MGS[mg.kind].key) MGS[mg.kind].key(e,true); });
