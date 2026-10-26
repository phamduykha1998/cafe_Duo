// Mua máy và hoạt cảnh bóc hộp lên đời
/* --- lên đời --- */
function buyWin(){
  const okCash=S.cash>=goal();
  win(L("Lên đời {0}",phoneName()),`<canvas id="phoneCv" class="phone" width="200" height="130"></canvas>
    <div class="receipt"><div class="row"><span>${phoneName()}</span><span>${vnd(S.ph.price)}</span></div><div class="row"><span>${L("Thu cũ: {0}",S.flags.soldOld?L("không còn máy cũ"):PHONE.old)}</span><span class="pos">−${vnd(S.ph.trade)}</span></div><hr><div class="row">${L("<b>Cần trả</b><b>{0}</b>",vnd(goal()))}</div>
      <div class="row"><span>${L("Tiền mặt")}</span><span class="${okCash?'pos':'neg'}">${vnd(S.cash)}</span></div>
      ${debtSum()?`<div class="row"><span>${L("⚠ Đang nợ")}</span><span class="neg">${vnd(debtSum())}</span></div><div class="row"><span>${L("Mua xong còn")}</span><span>${vnd(S.cash-goal())}</span></div>`:''}</div>
    <button class="wbtn gold" data-buy="cash" ${okCash?'':'disabled'}>${L("Trả {0}",vnd(goal()))}</button>`);
  drawPhone($('phoneCv'));
}
function buy(){
  closeWin(); unboxScene(afterBuy); // hoạt cảnh chạy trước, rồi mới trừ tiền & chuyển màn
}
function afterBuy(){
  S.cash-=goal(); addLog(S.day,L("Lên đời {0}: trả {1}.",PHONE.n,vnd(goal())),'good');
  S.bought=true; S.boughtDay=S.day; const owe=debtSum()+(S.inst?S.inst.left*S.inst.amt:0);
  if(owe<=0){ S.over='bought'; save(); render(); return showEnding(); }
  S.endDay=S.day+56; save(); render();
  win(L("Lên đời rồi… nhưng còn nợ!"),`<canvas id="phoneCv" class="phone" width="200" height="130"></canvas><div class="say">${L("Bạn cầm {0} sau <b>{1} ngày</b>. Nhưng đang nợ <b class=\"neg\">{2}</b>. Còn <b>2 tháng</b> nữa để xem quán có trụ nổi không — phá sản lúc này thì chiếc máy cũng phải bán đi.",phoneName(),S.day,tr(owe))}</div><button class="wbtn go" id="contBtn">${L("Ráng lên!")}</button>`); drawPhone($('phoneCv')); return;
}
// iPhone Duo, màu Trời Đêm: máy gập kiểu quyển sách — gập lại gần vuông (3:4), mở ra thành màn hình ngang có nếp gập giữa;
// lưng có dải camera nằm ngang 2 ống kính lớn. Cố ý không vẽ logo hay chữ trên lưng máy.
// rot: góc xoay quanh trục dọc (cos<0 là thấy lưng), open: 0 gập → 1 mở hẳn, on: 0 tắt → 1+ đã bật (hiện lời chào)
function drawDuo(x,px,py,sc,rot,open,on,t){ open=open||0; on=on||0; t=t||0;
  const rr=(a,b,w,h,r,c)=>{ x.fillStyle=c; x.beginPath(); if(x.roundRect) x.roundRect(a,b,w,h,Math.max(0,Math.min(r,w/2,h/2))); else x.rect(a,b,w,h); x.fill(); };
  const ell=(a,b,rx,ry,c)=>{ x.fillStyle=c; x.beginPath(); x.ellipse(a,b,Math.max(.1,rx),Math.max(.1,ry),0,0,7); x.fill(); };
  const c=Math.cos(rot), k=Math.max(.06,Math.abs(c)), H=40*sc, W=30*sc*(1+open*.95)*k, l=px-W/2, tp=py-H/2, R=5*sc, f=.8*sc;
  x.save(); x.shadowColor='rgba(255,210,140,.5)'; x.shadowBlur=7*sc; rr(l-f,tp-f,W+f*2,H+f*2,R+f,'#5b6678'); x.restore();
  rr(l-f,tp-f,W+f*2,H+f*2,R+f,'#8590a2'); // khung titan
  if(c<0){ // mặt lưng: kính mờ xanh than, dải camera ngang
    rr(l,tp,W,H,R,'#26324a'); const gr=x.createLinearGradient(l,tp,l+W,tp+H); gr.addColorStop(0,'rgba(255,255,255,.16)'); gr.addColorStop(.45,'rgba(255,255,255,0)'); gr.addColorStop(1,'rgba(0,0,0,.22)'); x.fillStyle=gr; x.beginPath(); if(x.roundRect) x.roundRect(l,tp,W,H,R); else x.rect(l,tp,W,H); x.fill();
    if(k>.3){ const bx0=l+2.5*sc*k, by0=tp+2.5*sc, bw=18*sc*k, bh=8.6*sc;
      rr(bx0-.4*sc,by0-.4*sc,bw+.8*sc,bh+.8*sc,4.6*sc*k,'#1c2638'); rr(bx0,by0,bw,bh,4.3*sc*k,'#34425e'); rr(bx0+sc*k,by0+.3*sc,bw-2*sc*k,.5*sc,.3*sc,'rgba(255,255,255,.25)');
      [5,13].forEach(dx=>{ const lx=bx0+dx*sc*k, ly=by0+bh/2; ell(lx,ly,3.2*sc*k,3.2*sc,'#6a768a'); ell(lx,ly,2.5*sc*k,2.5*sc,'#0b0e15'); ell(lx,ly,1.5*sc*k,1.5*sc,'#1d2c4a'); ell(lx-.7*sc*k,ly-.7*sc,.55*sc*k,.55*sc,'#9fc0ff'); });
      ell(l+23.5*sc*k,by0+2.6*sc,1.1*sc*k,1.1*sc,'#e9e2c6'); ell(l+23.5*sc*k,by0+6*sc,.4*sc*k,.4*sc,'#0b0e15'); } }
  else { // mặt trước: viền đen mỏng, màn hình
    rr(l,tp,W,H,R,'#08080c'); const s=1.1*sc, sl=l+s, st=tp+s, sw=W-s*2, sh=H-s*2; if(sw<1) return;
    x.save(); x.beginPath(); if(x.roundRect) x.roundRect(sl,st,sw,sh,R-s*.6); else x.rect(sl,st,sw,sh); x.clip();
    if(on>0){ const gr=x.createLinearGradient(0,st,0,st+sh); gr.addColorStop(0,'#3a2418'); gr.addColorStop(1,'#140c08'); x.fillStyle=gr; x.fillRect(sl,st,sw,sh);
      const a=Math.min(1,on), wide=open>.6, cx=wide?px-sw*.2:px, cy=wide?py:py-3*sc; x.globalAlpha=a;
      rr(cx-4*sc,cy-2*sc,8*sc,6*sc,1*sc,'#f4efe6'); x.fillStyle='#8a5a3b'; x.fillRect(cx-4*sc,cy-2*sc,8*sc,1.5*sc); rr(cx+3.5*sc,cy-.5*sc,2.2*sc,3*sc,1*sc,'#f4efe6');
      for(let i=0;i<2;i++){ const q=(t*.8+i*.5)%1; x.globalAlpha=a*(1-q); x.fillStyle='#ffffff'; x.fillRect(cx-1.5*sc+i*2.5*sc,cy-4*sc-q*6*sc,.8*sc,2*sc); }
      x.globalAlpha=Math.min(1,Math.max(0,on-.6)); x.fillStyle='#ffe2a0'; x.font=`800 ${Math.max(5,Math.round(2.8*sc))}px "Be Vietnam Pro",sans-serif`;
      if(wide){ x.textAlign='left'; x.fillText(L("Xin chào,"),px-sw*.02,py-.5*sc); x.fillText(L("chủ quán"),px-sw*.02,py+3.4*sc); }
      else { x.textAlign='center'; x.fillText(L("Xin chào,"),cx,cy+9*sc); x.fillText(L("chủ quán"),cx,cy+12.5*sc); }
      x.textAlign='left'; x.globalAlpha=1; }
    else { const gr=x.createLinearGradient(0,st,0,st+sh); gr.addColorStop(0,'#1a2236'); gr.addColorStop(.55,'#6a4a62'); gr.addColorStop(1,'#2a2232'); x.fillStyle=gr; x.fillRect(sl,st,sw,sh);
      x.fillStyle='#3a2a3e'; x.beginPath(); x.moveTo(sl,st+sh*.72); for(let i=0;i<=8;i++) x.lineTo(sl+sw*i/8,st+sh*(.6+.1*Math.sin(i*1.7))); x.lineTo(sl+sw,st+sh); x.lineTo(sl,st+sh); x.fill();
      x.fillStyle='#1e1824'; x.beginPath(); x.moveTo(sl,st+sh*.84); for(let i=0;i<=6;i++) x.lineTo(sl+sw*i/6,st+sh*(.78+.06*Math.cos(i*2.3))); x.lineTo(sl+sw,st+sh); x.lineTo(sl,st+sh); x.fill(); }
    if(open>.02){ // nếp gập giữa; nửa trái còn nghiêng thì tối hơn
      x.fillStyle='rgba(0,0,0,.28)'; x.fillRect(px-.35*sc,st,.7*sc,sh); x.fillStyle='rgba(255,255,255,.07)'; x.fillRect(px+.35*sc,st,.4*sc,sh);
      if(open<1){ x.fillStyle=`rgba(0,0,0,${.55*(1-open)})`; x.fillRect(sl,st,px-sl,sh); } }
    x.restore();
    if(open<.02) ell(px,st+2.2*sc,.85*sc,.85*sc,'#000'); } // camera đục lỗ ở màn ngoài
}
/* ================= HOẠT CẢNH NHẬN MÁY: bản tin khẩn → shipper thả hộp → bóc 2 miếng seal → nhấc nắp (hút chân không) → máy bay lên giữa hào quang → bật máy =================
   Cố tình làm quá: như thể cả xóm/phường dừng lại để xem. Người chơi tự tay vuốt bóc seal và giữ để nhấc nắp. */
function unboxScene(done){
  const city=!!S.city, area=city?L("PHƯỜNG"):L("XÓM"), days=S.day, cups=(S.tot&&S.tot.cups)||0, paid=goal();
  const ov=document.createElement('div'); ov.className='ubx';
  ov.innerHTML=`<canvas></canvas><div class="ubx-flash"></div>
    <div class="ubx-top"><span class="ubx-live">${L("● TRỰC TIẾP")}</span><span class="ubx-ch">${L("VTV-{0} · KÊNH 1",area)}</span><span class="ubx-rec">⏺ REC</span><button class="ubx-skip">${L("Bỏ qua ›")}</button></div>
    <div class="ubx-title"></div><div class="ubx-hint"></div><div class="ubx-bar"><i></i></div><div class="ubx-folk"></div>
    <button class="wbtn gold ubx-go" hidden></button>
    <div class="ubx-tick">${L("<b>TIN NÓNG</b>")}<div><span class="ubx-tk"></span></div></div>`;
  document.body.appendChild(ov);
  const q=s=>ov.querySelector(s), cvs=q('canvas'), x=cvs.getContext('2d'), title=q('.ubx-title'), hint=q('.ubx-hint'), bar=q('.ubx-bar'), barI=q('.ubx-bar i'), go=q('.ubx-go'), folk=q('.ubx-folk'), flashEl=q('.ubx-flash');
  q('.ubx-tk').textContent=[L("Sau {0} ngày và {1} ly cà phê, chủ quán chính thức đủ tiền lên đời {2}",days,num(cups),phoneName()),
    L("Uỷ ban {0} họp khẩn: đề nghị bà con giữ trật tự, không chen lấn khi bóc seal",area.toLowerCase()),L("Mèo nhà bên đã thức dậy sớm hơn thường lệ để chứng kiến sự kiện"),
    L("Giá trà đá khu vực tăng 1.000đ do lượng người hiếu kỳ đổ về"),L("Chuyên gia cảnh báo: bóc seal sai cách có thể làm giảm 30% cảm xúc"),
    L("Shipper đang trên đường, tốc độ ổn định, đã nhường đường cho hai đàn vịt"),L("Hàng xóm xin phép quay TikTok, chủ quán chưa trả lời")].join('   ✦   ');
  // khung vẽ theo tỉ lệ màn hình: ngang 320 điểm, dọc 200 điểm cho điện thoại cầm dọc
  let LW=320, LH=180, SC=2;
  const fitC=()=>{ const port=innerHeight>innerWidth; LW=port?200:320; LH=Math.round(clamp(LW*innerHeight/innerWidth,150,560)); SC=Math.max(2,Math.ceil(innerWidth/LW)); cvs.width=LW*SC; cvs.height=LH*SC; x.imageSmoothingEnabled=false; };
  fitC(); addEventListener('resize',fitC);
  // âm thanh tổng hợp (im lặng nếu đang tắt tiếng)
  const A=()=>audio();
  const snd={ drum(){ if(!A()) return; let t=0; for(let i=0;i<22;i++){ noise(t,.06,.05+i*.004,180); t+=Math.max(.045,.16-i*.006); } tone(98,t,.5,{type:'sine',vol:.14,to:60}); },
    honk(){ if(!A()) return; tone(480,0,.12,{vol:.05}); tone(480,.17,.2,{vol:.05}); },
    thud(){ if(!A()) return; tone(110,0,.4,{type:'sine',vol:.22,to:38}); noise(0,.18,.12,120); },
    peel(){ if(!A()) return; noise(0,.05,.04,2600+Math.random()*1500); }, rip(){ if(!A()) return; noise(0,.22,.08,1800); tone(900,0,.12,{type:'triangle',vol:.03,to:1600}); },
    hiss(p){ if(!A()) return; noise(0,.12,.012+p*.02,900+p*2400); tone(140+p*500,0,.12,{type:'sine',vol:.02+p*.03}); },
    beat(){ if(!A()) return; tone(70,0,.12,{type:'sine',vol:.18,to:45}); tone(66,.16,.12,{type:'sine',vol:.13,to:42}); },
    reveal(){ if(!A()) return; [523,659,784,1047,1319].forEach((f,i)=>tone(f,i*.05,1.6,{type:'sine',vol:.05})); [262,330,392].forEach(f=>tone(f,0,1.8,{type:'triangle',vol:.04})); setTimeout(()=>sfx('fanfare'),500); },
    shutter(){ if(!A()) return; noise(0,.035,.12,1200); noise(.06,.03,.08,2000); },
    unfold(){ if(!A()) return; noise(0,.5,.03,600); tone(220,0,.5,{type:'sine',vol:.05,to:520}); tone(1400,.62,.05,{type:'triangle',vol:.06}); }, boot(){ if(!A()) return; [392,523,659,784].forEach((f,i)=>tone(f,i*.12,.5,{type:'sine',vol:.06})); } };
  // trạng thái
  let st='news', t=0, alive=true, down=false, sealLock=false, lastX=0, lastY=0, shake=0, seals=[0,0], cur=0, lift=0, lidFly=null, flashA=0, rays=0, ph={y:0,rot:0,sc:1,on:0,open:0}, beatT=0, hissT=0, peelT=0, shots=0;
  const parts=[], folkShown=[];
  const setTitle=(big,small,stamp)=>{ title.innerHTML=big?`${big}${small?`<small>${small}</small>`:''}`:''; if(stamp){ title.classList.remove('ubx-pop'); void title.offsetWidth; title.classList.add('ubx-pop'); } }; // tên lớp riêng: 'stamp' và 'pop' đã dùng cho con dấu Giấy tờ và bảng Quầy
  const flash=a=>{ flashA=Math.max(flashA,a); };
  const burst=(px,py,n,kind)=>{ for(let i=0;i<n;i++){ const a=Math.random()*Math.PI*2, v=kind==='dust'?rnd(10,40):rnd(40,140);
    parts.push({x:px,y:py,vx:Math.cos(a)*v,vy:Math.sin(a)*v-(kind==='conf'?60:kind==='dust'?8:20),g:kind==='dust'?-6:kind==='conf'?90:40,life:kind==='dust'?rnd(.6,1.2):rnd(1.2,2.6),t:0,k:kind,c:pick(kind==='dust'?['#8a7a6a','#a8988a']:['#ffd166','#e2574c','#4f86c6','#6fbf73','#f08aa8','#ffffff']),rot:Math.random()*6,vr:rnd(-8,8)}); } };
  const go2=(s)=>{ st=s; t=0;
    if(s==='drop'){ snd.honk(); setTitle('','',false); hint.textContent=''; }
    else if(s==='seal'){ setTitle(L("BÓC SEAL"),L("Khoảnh khắc thiêng liêng nhất đời một chủ quán"),true); hint.textContent=L("Vuốt qua miếng seal bên trái để bóc"); }
    else if(s==='lid'){ down=false; setTitle(L("NHẤC NẮP"),L("Từ từ thôi… hộp hút chân không đấy"),true); hint.textContent=L("Giữ để nhấc nắp (thả tay là nó tụt xuống)"); bar.classList.add('on'); }
    else if(s==='reveal'){ bar.classList.remove('on'); hint.textContent=''; snd.reveal(); flash(1); shake=6; setTitle(L("LÊN ĐỜI!!!"),phoneName(),true); buzz([60,40,60,40,220]);
      burst(LW/2,LH/2,90,'conf'); burst(LW/2,LH/2+10,30,'spark');
      const lines=[L("Trời đất ơi!!!"),L("Cho bà sờ một cái"),L("Chụp trăng nét không con?"),L("Đẹp hơn trên mạng!"),L("Bao nhiêu ly mới đủ vậy?"),L("Khao cả xóm đi!"),L("Quay TikTok liền!")];
      [...VIL].sort(()=>Math.random()-.5).slice(0,innerWidth<520?3:5).forEach((v,i)=>{ const d=document.createElement('div'); d.innerHTML=`<span>${lines[(i*3+days)%lines.length]}</span><img src="${portrait(v.id)}" alt="${v.n}">`; folk.appendChild(d); folkShown.push(d); setTimeout(()=>d.classList.add('up'),350+i*180); }); }
    else if(s==='boot'){ go.hidden=true; setTitle('','',false); folk.style.opacity='0'; }
  };
  const finish=()=>{ if(!alive) return; alive=false; removeEventListener('resize',fitC); removeEventListener('keydown',kd); removeEventListener('keyup',ku); ov.classList.add('out'); setTimeout(()=>{ ov.remove(); done&&done(); },350); };
  q('.ubx-skip').onclick=finish;
  go.onclick=()=>{ sfx('click'); if(st==='reveal') go2('boot'); else finish(); };
  // điều khiển: vuốt (bóc seal), giữ (nhấc nắp); phím cách / Enter làm được cả hai
  const press=()=>{ down=true; sealLock=false; if(st==='seal'){ seals[cur]=Math.min(1,seals[cur]+.12); snd.peel(); } };
  ov.addEventListener('pointerdown',e=>{ if(e.target.closest('button')) return; press(); lastX=e.clientX; lastY=e.clientY; });
  ov.addEventListener('pointermove',e=>{ if(!down||st!=='seal'||sealLock) return; const d=Math.hypot(e.clientX-lastX,e.clientY-lastY); lastX=e.clientX; lastY=e.clientY; seals[cur]=Math.min(1,seals[cur]+d/Math.max(240,innerWidth*.4)); if(peelT<=0){ snd.peel(); peelT=.06; buzz(4); } });
  const up=()=>{ down=false; }; ov.addEventListener('pointerup',up); ov.addEventListener('pointercancel',up); ov.addEventListener('pointerleave',up);
  const kd=e=>{ if(e.key===' '||e.key==='Enter'){ e.preventDefault(); if(!down) press(); } if(e.key==='Escape') finish(); }, ku=e=>{ if(e.key===' '||e.key==='Enter') down=false; };
  addEventListener('keydown',kd); addEventListener('keyup',ku);

  // ---- vẽ ----
  const R=(a,b,w,h,c)=>{ x.fillStyle=c; x.fillRect(Math.round(a*2)/2,Math.round(b*2)/2,w,h); };
  const phone=(px,py,sc,rot,on,open)=>drawDuo(x,px,py,sc,rot,open,on,t);
  function box(cx,cy){ const bw=88, by0=cy-6, bh=34, lid=lift*46+(lidFly?0:0), ly0=cy-42-lid;
    x.fillStyle='rgba(0,0,0,.45)'; x.beginPath(); x.ellipse(cx,by0+bh+2,bw*.62,6,0,0,7); x.fill();
    // lòng hộp phát sáng khi nắp hé
    if(lift>0){ const gl=x.createRadialGradient(cx,by0,2,cx,by0,80); gl.addColorStop(0,`rgba(255,236,170,${.55*lift+.2})`); gl.addColorStop(1,'rgba(255,236,170,0)'); x.fillStyle=gl; x.fillRect(cx-90,by0-80,180,100);
      R(cx-bw/2+3,by0-2,bw-6,4,'#2a2a30'); R(cx-bw/2+6,by0-2,bw-12,2,'#fff6d8'); }
    R(cx-bw/2,by0,bw,bh,'#f2f2f4'); R(cx-bw/2,by0,4,bh,'#ffffff'); R(cx+bw/2-6,by0,6,bh,'#d6d6dc'); R(cx-bw/2,by0+bh-2,bw,2,'#bcbcc4');
    x.fillStyle='#b8b8c0'; x.font='600 5px "Be Vietnam Pro",sans-serif'; x.textAlign='center'; x.fillText(phoneName(),cx,by0+bh-8); x.textAlign='left';
    if(!lidFly){ R(cx-bw/2-2,ly0,bw+4,38,'#fbfbfd'); R(cx-bw/2-2,ly0,bw+4,2,'#ffffff'); R(cx+bw/2-4,ly0,6,38,'#e2e2e8'); R(cx-bw/2-2,ly0+36,bw+4,2,'#c8c8d0');
      phone(cx,ly0+19,.62,Math.PI,0); }
    // seal trong: dán dọc qua mép nắp ở hai đầu, bóc từ dưới lên, phần đã bóc cong ra ngoài
    [[cx-bw/2+8,-1],[cx+bw/2-10,1]].forEach(([sx,dir],i)=>{ const p=seals[i]; if(p>=1) return; const y0=cy-14, len=26, keep=len*(1-p);
      x.globalAlpha=.75; R(sx,y0,5,keep,'#eef6ff'); R(sx,y0,1,keep,'#ffffff'); x.globalAlpha=1;
      if(p>0){ x.save(); x.translate(sx+2.5,y0+keep); x.rotate(dir*(.5+p*1.2)); x.globalAlpha=.8; R(-2.5,0,5,len*p,'#e6f0ff'); R(-2.5,len*p-3,5,3,'#ff6a5a'); x.restore(); x.globalAlpha=1; }
      else { R(sx,y0+len-3,5,3,'#ff6a5a'); if(st==='seal'&&i===cur&&Math.floor(t*3)%2){ R(sx-1,y0+len+2,7,1,'#ffd166'); R(sx+1,y0+len+4,3,1,'#ffd166'); } } });
  }
  function frame(now){ if(!alive) return; requestAnimationFrame(frame);
    const dt=Math.min(.05,(now-(frame.l||now))/1000); frame.l=now; t+=dt; peelT-=dt; shake=Math.max(0,shake-dt*14); flashA=Math.max(0,flashA-dt*2.2);
    const cx=LW/2, cy=LH/2+(LW<300?0:6);
    // --- logic từng màn ---
    if(st==='news'){
      if(t<.05&&!frame.n){ frame.n=1; snd.drum(); setTitle(L("TIN NÓNG"),'',true); }
      if(t>1.1&&frame.n===1){ frame.n=2; setTitle(L("CHỦ QUÁN ĐÃ ĐỦ TIỀN!"),L("Sau <b>0</b> ngày · <b>0</b> ly cà phê"),true); shake=3; }
      if(frame.n===2){ const k=clamp((t-1.1)/1.6,0,1), e=1-Math.pow(1-k,3); title.querySelector('small').innerHTML=L("Sau <b>{0}</b> ngày · <b>{1}</b> ly cà phê · <b>{2}</b>",Math.round(days*e),num(cups*e),tr(Math.round(paid*e))); }
      if(t>3.6){ flash(.9); go2('drop'); } }
    else if(st==='drop'){ const fall=clamp((t-.5)/.45,0,1); frame.by=-80+(cy+80)*fall*fall;
      if(fall>=1&&!frame.landed){ frame.landed=1; snd.thud(); shake=8; buzz(80); burst(cx,cy+28,26,'dust'); setTitle(L("HÀNG VỀ!!!"),L("Shipper: “Anh/chị ký nhận giúp em, nhớ quay video bóc seal nha!”"),true); }
      if(t>2.6){ frame.landed=0; go2('seal'); } }
    else if(st==='seal'){ if(seals[cur]>=1){ snd.rip(); burst(cur?cx+34:cx-36,cy,14,'spark'); shake=2; if(cur===0){ cur=1; sealLock=true; hint.textContent=L("Một miếng nữa! Nhấc tay rồi vuốt miếng seal bên phải"); } else go2('lid'); } }
    else if(st==='lid'){ lift=clamp(lift+(down?dt*.42:-dt*.18),0,1); barI.style.width=Math.round(lift*100)+'%'; hissT-=dt; beatT-=dt;
      if(down&&hissT<=0){ snd.hiss(lift); hissT=.12; } if(beatT<=0){ snd.beat(); beatT=Math.max(.35,.9-lift*.55); }
      if(down) shake=Math.max(shake,lift*1.6);
      if(lift>=1){ lidFly={y:0,vy:-160,r:0}; go2('reveal'); } }
    else if(st==='reveal'){ ph.y=Math.min(1,t/1.4); ph.rot+=dt*(t<2.2?5:1.5); rays+=dt*.4;
      if(t>1.4&&shots<4&&t>1.4+shots*.45){ shots++; flash(.85); snd.shutter(); }
      if(Math.random()<dt*6) burst(rnd(20,LW-20),-5,3,'conf');
      if(t>2.6&&go.hidden){ go.hidden=false; go.textContent=L("Bật máy ⏻"); } }
    else if(st==='boot'){ const fr=((ph.rot%(Math.PI*2))+Math.PI*2)%(Math.PI*2); ph.rot-=(fr>Math.PI?fr-Math.PI*2:fr)*Math.min(1,dt*6); rays+=dt*.2;
      const scT=Math.min(LW*.82/(30*1.95),LH*.5/40); ph.sc+=(scT-ph.sc)*Math.min(1,dt*3);
      if(t>.55){ if(!frame.unf){ frame.unf=1; snd.unfold(); } ph.open=Math.min(1,ph.open+dt*1.25); }
      if(ph.open>=1){ if(frame.unf===1){ frame.unf=2; snd.boot(); shake=2; flash(.35); } ph.on=Math.min(2,ph.on+dt*.9); }
      if(t>3.2&&go.hidden){ go.hidden=false; go.textContent=L("Tiếp tục ›"); } }
    if(lidFly){ lidFly.vy+=dt*420; lidFly.y+=lidFly.vy*dt; lidFly.r+=dt*7; }
    parts.forEach(p=>{ p.t+=dt; p.vy+=p.g*dt; p.x+=p.vx*dt; p.y+=p.vy*dt; p.vx*=1-dt*1.2; p.rot+=p.vr*dt; }); for(let i=parts.length-1;i>=0;i--) if(parts[i].t>parts[i].life) parts.splice(i,1);
    // --- vẽ ---
    x.setTransform(SC,0,0,SC,0,0); x.imageSmoothingEnabled=false;
    const sx=(Math.random()-.5)*shake, sy=(Math.random()-.5)*shake; x.translate(sx,sy);
    x.fillStyle='#07060a'; x.fillRect(-10,-10,LW+20,LH+20);
    const sp=x.createRadialGradient(cx,cy+20,4,cx,cy+10,Math.max(LW,LH)*.6); sp.addColorStop(0,st==='news'?'rgba(120,30,30,.5)':'rgba(255,214,150,.28)'); sp.addColorStop(1,'rgba(0,0,0,0)'); x.fillStyle=sp; x.fillRect(0,0,LW,LH);
    if(st==='news'){ const on=Math.floor(t*6)%2; x.fillStyle=on?'rgba(220,40,40,.35)':'rgba(40,90,220,.35)'; x.fillRect(0,0,LW*.18,LH); x.fillStyle=on?'rgba(40,90,220,.35)':'rgba(220,40,40,.35)'; x.fillRect(LW*.82,0,LW*.18,LH);
      for(let i=0;i<LH;i+=3) R(0,i,LW,1,'rgba(255,255,255,.035)'); }
    if(st==='reveal'||st==='boot'||lift>.05){ x.save(); x.translate(cx,st==='lid'?cy-6:cy-14); x.rotate(rays); const n=18, a0=st==='lid'?lift*.5:1;
      for(let i=0;i<n;i++){ x.rotate(Math.PI*2/n); x.fillStyle=i%2?`rgba(255,214,120,${.14*a0})`:`rgba(255,246,200,${.22*a0})`; x.beginPath(); x.moveTo(0,0); x.lineTo(-10,-260); x.lineTo(10,-260); x.closePath(); x.fill(); } x.restore(); }
    if(st!=='news'){ const by=st==='drop'?(frame.by??-80):cy; if(st==='drop'&&t<.95){ for(let i=0;i<5;i++) R(cx-30+i*15,by-60-i*7,1,40,'rgba(255,255,255,.25)'); }
      if(!(st==='boot'&&t>.4)) box(cx,by); }
    if(lidFly&&lidFly.y>-400){ x.save(); x.translate(cx,cy-42+lidFly.y); x.rotate(lidFly.r); R(-46,-19,92,38,'#fbfbfd'); R(-46,17,92,2,'#c8c8d0'); x.restore(); }
    if(st==='reveal'||st==='boot'){ const yy=cy-6-ph.y*32+Math.sin(t*2.2)*2*(st==='reveal'?1:0); phone(cx,st==='boot'?cy-4:yy,ph.sc,ph.rot,ph.on,ph.open);
      for(let i=0;i<6;i++){ const a=t*1.6+i, rx=cx+Math.cos(a)*(22+ph.open*20)*ph.sc, ry=yy+Math.sin(a*1.3)*26; const k=(Math.sin(t*5+i)+1)/2; R(rx-1,ry,3,1,`rgba(255,246,200,${k})`); R(rx,ry-1,1,3,`rgba(255,246,200,${k})`); } }
    parts.forEach(p=>{ const a=1-p.t/p.life; x.globalAlpha=Math.max(0,a);
      if(p.k==='dust'){ x.fillStyle=p.c; x.beginPath(); x.arc(p.x,p.y,2+p.t*5,0,7); x.fill(); }
      else if(p.k==='spark'){ R(p.x-1.5,p.y,4,1,'#fff6c8'); R(p.x,p.y-1.5,1,4,'#fff6c8'); }
      else { x.save(); x.translate(p.x,p.y); x.rotate(p.rot); x.fillStyle=p.c; x.fillRect(-1.5,-.8,3,1.6*Math.abs(Math.cos(p.rot*2))+.4); x.restore(); } });
    x.globalAlpha=1;
    const vg=x.createRadialGradient(cx,cy,Math.min(LW,LH)*.35,cx,cy,Math.max(LW,LH)*.75); vg.addColorStop(0,'rgba(0,0,0,0)'); vg.addColorStop(1,'rgba(0,0,0,.6)'); x.fillStyle=vg; x.fillRect(-10,-10,LW+20,LH+20);
    flashEl.style.opacity=flashA.toFixed(2);
  }
  requestAnimationFrame(frame);
}
function drawPhone(c){ if(!c) return; const x=c.getContext('2d'); x.clearRect(0,0,200,130);
  for(let i=0;i<16;i++){ const a=i/16*Math.PI*2; x.strokeStyle=i%2?'rgba(233,178,63,.35)':'rgba(255,240,190,.5)'; x.lineWidth=3; x.beginPath(); x.moveTo(100,65); x.lineTo(100+Math.cos(a)*110,65+Math.sin(a)*110); x.stroke(); }
  drawDuo(x,52,66,2.1,Math.PI,0,0); drawDuo(x,138,66,1.2,0,1,1.6);
  [[30,20],[172,26],[24,110],[182,104],[100,8]].forEach(([a,b])=>{ x.fillStyle='#fff6c8'; x.fillRect(a-1,b,3,1); x.fillRect(a,b-1,1,3); });
}

function drawChart(){
  const c=$('chart'); if(!c) return; const x=c.getContext('2d'), w=c.width, h=c.height;
  x.clearRect(0,0,w,h); const data=S.hist.length?S.hist:[0], mn=Math.min(...data,-1e6), mx=Math.max(...data,goal()*1.05);
  const Y=v=>h-12-(v-mn)/(mx-mn)*(h-24), X=i=>46+i/Math.max(data.length-1,1)*(w-54);
  x.font='11px "Pixelify Sans",monospace';
  [mn,0,goal()].forEach(v=>{ x.strokeStyle=v===goal()?'#e9b23f':'#d9c49a'; x.setLineDash(v===goal()?[6,4]:[]); x.beginPath(); x.moveTo(46,Y(v)); x.lineTo(w,Y(v)); x.stroke(); x.setLineDash([]); x.fillStyle='#7a5a3e'; x.fillText(tr(v),4,Y(v)+4); });
  x.strokeStyle='#8a5531'; x.lineWidth=2; x.beginPath(); data.forEach((v,i)=>i?x.lineTo(X(i),Y(v)):x.moveTo(X(i),Y(v))); x.stroke(); x.lineWidth=1;
  const lv=data[data.length-1]; x.fillStyle=lv>=0?'#5a9a4f':'#c4473a'; x.beginPath(); x.arc(X(data.length-1),Y(lv),4,0,7); x.fill();
}
