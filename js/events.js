// Thẻ quyết định, vòng thời gian (ngày/tháng), báo cáo tháng, nợ, lên phố, bất ngờ, chấm điểm kết thúc
/* ================= KỊCH TÍNH: VÒNG TUẦN, THẺ QUYẾT ĐỊNH, BẤT NGỜ, NỢ NẦN, PHÁ SẢN, LÊN PHỐ ================= */
const wkNo=()=>Math.floor(S.day/7);
const isCity=()=>!!cfg().city;
const debtSum=()=>(S&&S.debts||[]).reduce((s,d)=>s+d.owe,0);
const appDebt=()=>S.debts.filter(d=>d.k==='app').reduce((s,d)=>s+d.owe,0);
function addDebt(d){ S.debts.push(Object.assign({rate:0,pay:0,due:null},d)); addLog(S.day,L("Vay {0}: {1}",d.n,vnd(d.owe)),'bad'); }
const lv=k=>Math.min(3,(S.lessons||{})[k]||0);
function lesson(k,text){ S.lessons[k]=(S.lessons[k]||0)+1; addLog(S.day,L("Bài học: {0}",text),'good'); return `<div class="lesson">${L("Bài học: {0}",text)}</div>`; }
function seed(n,id,d){ S.seeds.push({at:wkNo()+n,id,d:d||{}}); }
const boostMul=()=>(S.boosts||[]).reduce((m,b)=>m*b.mul,1);
function addBoost(mul,w,why){ S.boosts.push({mul,w,why}); }
const repF=k=>[L("Uy tín"),(S.rep-1)*(k||.3)];
const tiredF=()=>[L("Mệt mỏi"),S.energy<40?-(40-S.energy)/200:0];

/* ---- thẻ: quyết định / bất ngờ / hệ quả / cháy túi ---- */
let cardQ=[], cardCb=null, curCard=null;
const TAGS={decision:[L("Quyết định"),'tg-dec'],twist:[L("BẤT NGỜ!"),'tg-tw'],conseq:[L("Hệ quả"),'tg-cq'],crisis:[L("CHÁY TÚI"),'tg-cr'],news:[L("Tin nóng"),'tg-nw']};
function queueCards(cards,cb){ cardQ.push(...cards.filter(Boolean)); runQ(cb); }
function runQ(cb){ if(cb) cardCb=cb; if(S.over){ cardQ=[]; showEnding(); return; } const c=cardQ.shift(); if(!c){ const f=cardCb; cardCb=null; f&&f(); return; } if(per&&per.autoOn) return autoCard(c); showCard(c); }
function chanceOf(o){ if(!o.chance) return null; const parts=o.chance(); return {p:clamp(parts.reduce((s,x)=>s+x[1],0),.05,.95),parts}; }
const costOf=o=>typeof o.cost==='function'?o.cost():(o.cost||0);
// chụp các chỉ số trước/sau một lựa chọn để hiện rõ thay đổi
function snap(){ return {cash:S.cash,rep:S.rep,fans:S.fans,energy:S.energy,fam:S.fam,clean:S.clean,debt:debtSum(),boost:boostMul(),cogs:S.cogsMul||1,ref:S.refBonus||0,weeds:S.weeds.length,items:S.layout.length,staff:S.staff,h:Object.fromEntries(Object.entries(S.vil).map(([k,v])=>[k,v.h]))}; }
function fxChips(a,b){ const out=[], add=(txt,good)=>out.push(`<span class="${good?'':'neg'}">${txt}</span>`), sg=v=>(v>0?'+':'−');
  const money=v=>Math.abs(v)>=1e6?tr(Math.abs(v)):kk(Math.abs(v)), d=k=>b[k]-a[k];
  if(Math.abs(d('cash'))>=1000) add(`💰 ${sg(d('cash'))}${money(d('cash'))}`,d('cash')>0);
  if(Math.abs(d('debt'))>=1000) add(L("📒 Nợ {0}{1}",sg(d('debt')),money(d('debt'))),d('debt')<0);
  [['rep',L("⭐ Uy tín"),100],['fans',L("🙋 Khách quen"),1],['energy',L("⚡ Sức khoẻ"),1],['fam',L("🏠 Gia đình"),1],['clean',L("🧹 Độ sạch"),1]].forEach(([k,n,m])=>{ const v=Math.round(d(k)*m); if(v) add(`${n} ${sg(v)}${Math.abs(v)}`,v>0); });
  if(Math.abs(b.boost-a.boost)>.005) add(L("📈 Lượng khách ×{0} vài tuần",(b.boost/a.boost).toFixed(2).replace('.',',')),b.boost>a.boost);
  if(Math.abs(d('cogs'))>.004) add(L("🫘 Giá vốn {0}{1}%",sg(d('cogs')),Math.round(Math.abs(d('cogs'))*100)),d('cogs')<0);
  if(d('ref')) add(L("🏷️ Khách chịu giá {0}{1}",sg(d('ref')),kk(Math.abs(d('ref')))),d('ref')>0);
  if(d('weeds')) add(L("🌿 Cỏ dại {0}{1}",sg(d('weeds')),Math.abs(d('weeds'))),d('weeds')<0);
  if(d('items')) add(L("🪑 Đồ trong vườn {0}{1}",sg(d('items')),Math.abs(d('items'))),d('items')>0);
  if(d('staff')) add(L("🧑‍🍳 Người phụ {0}{1}",sg(d('staff')),Math.abs(d('staff'))),true);
  Object.keys(b.h).forEach(k=>{ const v=Math.round((b.h[k]-(a.h[k]||0))*10)/10; if(v) add(`♥ ${VILM[k].n} ${sg(v)}${String(Math.abs(v)).replace('.',',')}`,v>0); });
  return out.length?`<div class="fxc">${out.join('')}</div>`:`<div class="fxc"><span class="nil">${L("Không có gì thay đổi")}</span></div>`; }
function showCard(c){
  sfx(c.tag==='twist'||c.tag==='crisis'?'twist':c.tag==='news'?'bell':'card'); if(c.tag==='twist'||c.tag==='crisis') buzz([60,40,140]);
  curCard=c; const [tl,tc]=TAGS[c.tag||'decision'];
  if(!c.ch){ const b0=snap(), txt=c.fx?c.fx():''; save(); hudSlow(); win(c.t,`<div class="ctag ${tc}">${tl}</div><div class="say">${c.who?`<span class="who">${c.who}:</span> `:''}${c.txt||''}${txt?'<br><br>'+txt:''}</div>${fxChips(b0,snap())}<button class="wbtn go" id="ccGo">${L("Tiếp tục ▶")}</button>`,false); shake(c); return; }
  const opts=c.ch.map((o,i)=>{ const cost=costOf(o), rq=o.req?o.req():true, ch=chanceOf(o), poor=cost>0&&cost>S.cash&&!o.allowDebt, dis=rq!==true||poor;
    const sub=[cost>0?`−${tr(cost)}`:'',o.gain?`+${tr(o.gain())}`:'',ch?L("khả năng {0}%",Math.round(ch.p*100)):'',typeof rq==='string'?rq:'',poor?L("không đủ tiền"):'',o.note||''].filter(Boolean).join(' · ');
    const fac=ch?ch.parts.slice(1).filter(x=>Math.abs(x[1])>=.01).map(x=>`<i class="${x[1]>0?'pos':'neg'}">${x[0]} ${x[1]>0?'+':'−'}${Math.round(Math.abs(x[1])*100)}%</i>`).join(''):'';
    return `<button class="wbtn cch" data-cc="${i}" ${dis?'disabled':''}><b>${o.t}</b>${sub?`<small>${sub}</small>`:''}${fac?`<span class="fac">${fac}</span>`:''}</button>`; }).join('');
  win(c.t,`<div class="ctag ${tc}">${tl}</div><div class="say">${c.who?`<span class="who">${c.who}:</span> `:''}${c.txt}</div><div class="chs">${opts}</div>`,false); shake(c);
}
function shake(c){ if(c.tag==='twist'||c.tag==='crisis'){ const f=$('frame'); f.classList.remove('shake'); void f.offsetWidth; f.classList.add('shake'); } }
// áp dụng một lựa chọn: trừ phí, tung xác suất, chạy hệ quả, ghi nhật ký
function applyChoice(c,o){
  const cost=costOf(o); if(cost) S.cash-=cost;
  const ch=chanceOf(o), ok=ch?R()<ch.p:true; let res=o.fx(ok); if(res==null||typeof res==='string') res={txt:res||''};
  addLog(S.day,`${c.t}: ${o.t}${ch?(ok?L(" — thành công"):L(" — thất bại")):''}`,ch?(ok?'good':'bad'):'');
  S.rep=clamp(S.rep,.6,1.7); S.fam=clamp(S.fam,0,100); S.energy=clamp(S.energy,-20,100); S.clean=clamp(S.clean,0,100); S.fans=Math.max(0,S.fans);
  if(res.next) cardQ.unshift(res.next);
  return {ch,ok,res};
}
// "Hết tháng" khi bật "để người phụ quyết": bốc ngẫu nhiên một lựa chọn hợp lệ (không bao giờ chọn bỏ cuộc/bán quán; lời mời lên phố thì từ chối, lần sau còn quay lại)
function autoCard(c){ const b0=snap(); let pickT='', ok=true, ch=null;
  if(!c.ch){ if(c.fx) c.fx(); }
  else { const can=c.ch.filter(o=>{ const cost=costOf(o), rq=o.req?o.req():true; return rq===true&&!(cost>0&&cost>S.cash&&!o.allowDebt); }), safe=can.filter(o=>!o.end);
    const o=can.find(o=>o.autoPick)||pick(safe.length?safe:can.length?can:c.ch);
    pickT=o.t; ({ch,ok}=applyChoice(c,o)); }
  per.auto.push({day:S.day,t:c.t,tag:c.tag||'decision',pick:pickT,ch:!!ch,ok,fx:fxChips(b0,snap())});
  toast(`⚡ ${c.t}${pickT?' → '+pickT:''}${ch?(ok?' ✓':' ✗'):''}`,ch?(ok?'good':'bad'):'');
  save(); hudSlow(); setTimeout(()=>runQ(),0); }
function pickCard(i){
  const c=curCard, o=c&&c.ch&&c.ch[i]; if(!o) return; curCard=null; const b0=snap();
  const {ch,ok,res}=applyChoice(c,o);
  if(ch){ if(ok) sfx('ok',0,4); else { sfx('bad'); buzz(80); } }
  save(); hudSlow();
  if(S.over){ cardQ=[]; showEnding(); return; }
  win(c.t,`${ch?`<div class="ctag ${ok?'tg-ok':'tg-fail'}">${ok?L("Thành công"):L("Thất bại")} · ${Math.round(ch.p*100)}%</div>`:''}<div class="say">${res.txt}</div>${fxChips(b0,snap())}<button class="wbtn go" id="ccGo">${L("Tiếp tục ▶")}</button>`,false);
}

/* ---- thời gian tự trôi: ngày nối ngày, mỗi tháng (4 tuần) một báo cáo; dừng lại khi có tình huống ---- */
// Mỗi ngày chiếu trọn từ sáng tới tối ở quán. speed: ×1 / ×2 — đồng hồ trong ngày chạy theo speed,
// còn người đi lại gần như tốc độ thật (xem frame()). "Hết tháng" lật nhanh từng ngày tới cuối tháng, sang tháng mới tự về ×1.
// DAY_K: nhịp đồng hồ trong ngày so với nhịp đi bộ — đủ chậm để khách kịp vào ngồi; FF_MS: mỗi ngày khi bấm "Hết tháng"
const MONTH_D=28, MAX_DAYS=MONTH_D*24, DAY_K=.8, FF_MS=320;
let per=null, pend=null, paused=false, toEnd=false, wantEdit=false;
const monthNo=()=>Math.floor(S.day/MONTH_D);
// đồng hồ tự dừng khi người chơi bấm dừng, đang mở cửa sổ / mini-game / sửa vườn / hoạt cảnh lên đời, hoặc chuyển sang tab khác
const held=()=>paused||!S||!$('veil').hidden||!$('rush').hidden||!!edit||document.hidden||!!document.querySelector('.ubx');
// hẹn bước kế tiếp: chỉ đếm giờ khi thời gian đang chạy (xem frame())
function later(fn,ms){ pend={fn,t:ms||0}; }
// Lịch mỗi tháng: 3–4 ngày có tình huống, 1–2 ngày mini-game. Tình huống hi hữu chạm vào cảnh chỉ có thể xảy ra
// vào những ngày đó (và ngày đầu tháng) để giữ khoảng một lần mỗi tháng.
function planPeriod(from,len){
  const sit=new Set(), mg=new Set();
  for(let a=from;a<from+len;a+=MONTH_D){ const n=Math.min(MONTH_D,from+len-a), k=R()<.5?3:4, seg=n/k;
    for(let i=0;i<k;i++) sit.add(a+Math.floor(seg*i+1+R()*(seg-1)));
    const m=R()<.5?1:2; for(let i=0,t=0;i<m&&t<40;t++){ const d=a+4+Math.floor(R()*(n-6)); if(!sit.has(d)&&!mg.has(d)){ mg.add(d); i++; } } }
  return {sit,mg,feat:new Set([from,...sit,...mg])};
}
// mở tháng mới (hoặc phần còn lại của tháng khi mở lại bản lưu): luôn về tốc độ thường ×1 và chạy tiếp
function startMonth(){
  const left=MONTH_D-S.day%MONTH_D;
  per={left,months:1,agg:newAgg(),wk:newAgg(),anim:true,auto:[],autoOn:false,f0:S.fans,c0:S.cash,d0:debtSum(),wait:0,...planPeriod(S.day,left)};
  toEnd=false; speed=1; paused=false; setBusy(true); later(nextDay,0);
}
// điều khiển thời gian: 'pause' bật/tắt dừng, 1 / 2 tốc độ, 'end' chạy nhanh tới cuối tháng
function setTime(m){
  if(!S||S.over) return;
  if(m==='pause') paused=!paused;
  else if(m==='end'){ paused=false;
    if(per&&!toEnd){ toEnd=true; per.anim=false; per.autoOn=!!S.autoPick; if(play) finish();
      toast(per.autoOn?L("Tới cuối tháng: người phụ tự quyết các tình huống"):L("Tới cuối tháng: vẫn dừng ở mỗi tình huống cho bạn chọn")); } }
  else { paused=false; speed=m; if(toEnd&&per){ toEnd=false; per.anim=true; per.autoOn=false; } }
  if(m==='pause'&&!S.open&&!paused) toast(L("Quán đang nghỉ — bật \"Mở cửa\" ở ô Quầy"),'bad');
  tUI();
}
function nextDay(){
  if(!per) return;
  if(S.endDay&&S.day>=S.endDay&&!S.over) S.over='bought';
  if(S.over){ per=null; setBusy(false); return showEnding(); }
  if(per.left<=0||S.day>=MAX_DAYS) return endPeriod();
  if(wantEdit){ wantEdit=false; enterEdit(); return later(nextDay,0); }
  const pre=[]; if(per.sit.has(S.day)){ const d=pickDecision(true); if(d) pre.push(d); }
  if(pre.length) queueCards(pre,simDay); else simDay();
}
function simDay(){
  closeWin(); if(S.over) return nextDay();
  const d0=S.day, r=runDay(), feat=per.feat.has(d0); addAgg(per.wk,r,true); per.left--; S.flow=(S.flow||[]).concat(r.lines.reduce((t,x)=>t+x[1],0)).slice(-MONTH_D);
  per.wait=per.anim?0:FF_MS;
  const done=()=>{ let post=[]; if(S.day%7===0){ post=weekEnd(per.wk); mergeAgg(per.agg,per.wk); per.wk=newAgg(); } queueCards(post,dayChecks); };
  if(per.mg.has(d0)&&!r.open&&S.open&&per.left>0){ per.mg.add(d0+1); per.feat.add(d0+1); } // quán nghỉ hôm đó thì dời mini-game sang hôm sau
  if(!per.anim){ flipDay(r); return done(); } // đang "Hết tháng": lật nhanh
  // người chơi có thể bấm "Hết tháng" trong lúc đang mờ chuyển cảnh: khi đó bỏ qua phần chiếu
  const show=()=>{ if(per&&!per.anim){ idle(); flipDay(r); return done(); } startPlay(r,done,true,feat); };
  if(feat&&r.open&&per.mg.has(d0)&&mgDue(r)) return mgIntro(r,()=>fadeSwap(show));
  fadeSwap(show);
}
// hiện lãi/lỗ trong ngày bay lên trên xe cafe
function flipDay(r){ const net=r.lines.reduce((t,x)=>t+x[1],0);
  if(r.open){ floats.push({x:cartL()+34,y:70,txt:(net>=0?'+':'−')+kk(Math.abs(net)),t:1.4,col:net>=0?'rgba(255,214,102,A)':'rgba(255,140,120,A)'}); if(net>0) sfx('coin',300); } }
function dayChecks(){
  closeWin();
  if(S.over) return nextDay();
  if(debtSum()>200e6){ bankrupt(L("Nợ vượt 200 triệu. Chủ nợ kéo đến siết sạch đồ đạc.")); return nextDay(); }
  if(S.cash<0) return queueCards([crisisCard()],dayChecks);
  save(); hudSlow(); later(nextDay,per?per.wait:0);
}
function mergeAgg(a,b){ if(a.from===null) a.from=b.from; if(b.to!=null) a.to=b.to; a.n+=b.n; a.cups+=b.cups; a.del+=b.del; a.lost+=b.lost; for(const k in b.lines) a.lines[k]=(a.lines[k]||0)+b.lines[k]; a.ev.push(...b.ev); }
function endPeriod(){
  const p=per; per=null; if(p.wk.n) mergeAgg(p.agg,p.wk); idle(); render(); save();
  if(S.endDay&&S.day>=S.endDay&&!S.over) S.over='bought';
  if(S.over) return showEnding();
  if(S.day>=MAX_DAYS&&!S.bought){ S.over='timeout'; save(); return showEnding(); }
  startMonth(); periodReport(p); // bảng báo cáo đang mở thì thời gian tự dừng, đóng là chạy tiếp
}
function etaText(net){ const need=goal()-S.cash; if(need<=0) return L("đủ tiền rồi!"); if(net<=0) return L("chưa thấy ngày về đích"); return L("~{0} tháng nữa nếu giữ nhịp này",Math.ceil(need/net)); }
function periodReport(p){
  { const n=Object.values(p.agg.lines).reduce((s,x)=>s+x,0); sfx(n>=0?'cash':'bad'); if(n<0) buzz(60); }
  const a=p.agg, net=Object.values(a.lines).reduce((s,x)=>s+x,0), perMonth=net/p.months, fx=layoutFx();
  const evs=a.ev.filter(e=>e[1]==='bad'||e[1]==='good').slice(-12);
  win(L("Báo cáo tháng {0}",monthNo()),`<div class="receipt">
    <div class="row muted"><span>${dstr(a.from)} → ${dstr(a.to)}</span><span>${LOC().t}</span></div><hr>
    <div class="row"><span>${L("Ly bán")}</span><span>${a.cups+a.del}</span></div><div class="row"><span>${L("Khách bỏ về")}</span><span>${a.lost}</span></div><hr>
    ${Object.entries(a.lines).sort((x,y)=>y[1]-x[1]).map(([k,v])=>`<div class="row"><span>${k}</span><span class="${v<0?'neg':'pos'}">${vnd(v)}</span></div>`).join('')}
    <hr><div class="row">${L("<b>Lãi/lỗ tháng này</b><b class=\"{0}\">{1}</b>",net<0?'neg':'pos',vnd(net))}</div>
    <div class="row"><span>${L("Tiền mặt")}</span><b class="${S.cash<0?'neg':''}">${vnd(S.cash)}</b></div>
    ${debtSum()?`<div class="row"><span>${L("Tổng nợ")}</span><span class="neg">${vnd(debtSum())}</span></div>`:''}
    <hr><div class="row"><span>${L("Lượng khách quen")}</span><span>${Math.round(p.f0)} → ${Math.round(S.fans)}</span></div>
    <div class="row"><span>${L("Sức khoẻ · Gia đình · Độ sạch")}</span><span>${Math.round(S.energy)} · ${Math.round(S.fam)} · ${Math.round(S.clean)}</span></div>
    <div class="row"><span>${L("Bố cục vườn")}</span><span>${fxText(fx)}</span></div>
    <hr><div class="row"><b>${phoneName()}</b><b>${tr(Math.max(0,S.cash))} / ${tr(goal())}</b></div><div class="row muted"><span>${L("Dự kiến")}</span><span>${etaText(perMonth)}</span></div>
    ${evs.length?`<hr>${evs.map(([d,c,t])=>`<div class="ev ${c==='bad'?'neg':'pos'}">${dm(dateOf(d))} · ${t}</div>`).join('')}`:''}
  </div>
  ${p.auto&&p.auto.length?`<div class="autolog"><h3>${L("⚡ Tình huống người phụ đã tự quyết ({0})",p.auto.length)}</h3>${p.auto.map(a=>`<div class="al"><div class="alh"><span class="muted">${dm(dateOf(a.day))}</span><b>${a.t}</b>${a.ch?`<span class="tag ${a.ok?'ok':'bad'}">${a.ok?L("Thành công"):L("Thất bại")}</span>`:''}</div>${a.pick?`<div class="sm">→ ${a.pick}</div>`:''}${a.fx}</div>`).join('')}</div>`:''}
  <div class="prbtns">${S.cash>=goal()&&!S.bought?`<button class="wbtn gold" id="prBuy">${L("Lên đời ngay!")}</button>`:''}<button class="wbtn go" id="prNext">${L("▶ Sang tháng mới")}</button><button class="wbtn" id="prEdit">${L("Sắp xếp vườn")}</button></div>`,false);
}

/* ---- bố cục vườn ảnh hưởng khách ---- */
function layoutFx(){
  const L=layoutOf(); let beauty=0,seats=0,shade=isCity()?1:4,cover=0,side=0,used=0,free=0;
  L.forEach(o=>{ const it=catOf(o.id); beauty+=it.beauty; seats+=it.seats||0; used+=it.w*it.h;
    if(it.tree) shade+=it.tree==='xoai'?3:it.tree==='tre'?2:1; if(o.id==='du'){ shade+=1.5; cover+=2; } if(o.id==='choi'){ shade+=2; cover+=2; }
    if(isCity()&&o.r>=10&&it.seats) side+=it.seats; });
  beauty-=(isCity()?0:weedsOf().length*.5);
  for(let r=0;r<GR;r++) for(let c=0;c<GC;c++) if(!blockedCell(c,r)) free++;
  return {beauty,seats,shade,cover,side,crowd:used/Math.max(1,free+used)};
}
function fxText(fx){ return L("✿{0} · {1} chỗ · che mưa {2} · bóng mát {3}{4}{5}",fx.beauty.toFixed(0),fx.seats,fx.cover,fx.shade.toFixed(0),fx.crowd>.42?L(" · CHẬT"):'',fx.side?L(" · {0} chỗ vỉa hè",fx.side):''); }

/* ---- phiên bản máy ---- */
const TIERS=[{id:'256',t:'256GB',price:64999000},{id:'512',t:'512GB',price:71499000},{id:'1tb',t:'1TB',price:84499000},{id:'2tb',t:'2TB',price:103999000}];
const phoneName=()=>PHONE.n+' '+(S&&S.ph&&S.ph.tier?S.ph.tier:(TIERS.find(t=>t.id===setup.tier)||TIERS[0]).t);
function tiktokRes(ok){ if(ok){ addBoost(1.6,3,L('TikTok khen')); S.fans+=40; S.rep+=.08; return L("Clip \"quán ruột mới phát hiện\" đạt 1 triệu lượt xem. Khách kéo nhau tới!"); }
  addBoost(.7,3,L("TikTok chê")); S.rep-=.15; seed(1,'fixreview'); return L("Clip chê \"ly bẩn, cafe nhạt, quán bừa bộn\" lan nhanh. Khách vắng hẳn."); }

/* ---- vòng tuần ---- */
function weekEnd(agg){
  const w=wkNo(), out=[], e=EQ();
  const net=Object.values(agg.lines).reduce((s,x)=>s+x,0);
  if(S.partner&&net>0){ const sh=net*S.partner; S.cash-=sh; agg.lines[L("Chia lãi cho người hùn vốn")]=-sh; }
  const fair=S.price<=refPrice()*1.1?1:.75, q=(.75+.12*e.q)*(S.energy<30?.75:1)*fair*(S.rep>1?1.1:1);
  const cap=LOC().traffic*(S.city?1.3:1.1); S.fans=Math.max(0,S.fans*.93+S.wkCups*.016*q*Math.max(0,1-S.fans/cap)-S.wkLost*.012);
  if(S.city) S.comp=clamp(S.comp+.008,0,.85);
  S.boosts.forEach(b=>b.w--); S.boosts=S.boosts.filter(b=>b.w>0);
  S.fam=clamp(S.fam+(S.rest>0?1.2*S.rest:-1.2)-(S.city?1.5:0),0,100);
  S.eSum+=S.energy; S.eN++;
  if(!S.bought) S.ph.trade=Math.max(S.flags.soldOld?0:1e6,S.ph.trade-120000);
  let interest=0, paid=0;
  S.debts.forEach(d=>{ if(d.rate){ const it=d.owe*d.rate; d.owe+=it; interest+=it; } if(d.pay&&d.owe>0){ const p=Math.min(d.owe,d.pay); S.cash-=p; d.owe-=p; paid+=p; } });
  if(paid) agg.lines[L("Trả góp nợ vay")]=-paid;
  if(interest) agg.ev.push([S.day-1,'bad',L("Lãi vay cộng thêm vào nợ: {0}",tr(interest))]);
  S.tot.interest=(S.tot.interest||0)+interest;
  S.debts=S.debts.filter(d=>d.owe>1000);
  S.debts.filter(d=>d.due!=null&&d.due<=w).forEach(d=>{ const c=dueCard(d); if(c) out.push(c); });
  const due=S.seeds.filter(s=>s.at<=w); S.seeds=S.seeds.filter(s=>s.at>w);
  due.forEach(s=>{ const c=SEEDS[s.id]&&SEEDS[s.id](s.d); if(c) out.push(c); });
  if(S.energy<=0) out.push(collapseCard()); else if(S.energy<25) agg.ev.push([S.day-1,'bad',L("Bạn kiệt sức: pha ẩu, hay cáu với khách. Thêm ngày nghỉ hoặc người phụ đi!")]);
  const nw=newsCard(w); if(nw) out.push(nw);
  if(!S.city&&[8,16,24,32,44].includes(w)) out.push(cityOfferCard());
  if(w>=2){ S.pity++; if(R()<(S.city?.12+S.pity*.09:.07+S.pity*.06)){ const t=pickTwist(); if(t){ out.push(t); S.pity=0; } } }
  return out;
}
function bankrupt(why){ S.over='bankrupt'; S.overWhy=why; S.open=false; addLog(S.day,L("PHÁ SẢN: {0}",why),'bad'); save(); }

/* ---- cháy túi, nợ đến hạn, gục ngã ---- */
function crisisCard(){
  return {tag:'crisis',t:L("Cháy túi!"),txt:L("Tiền mặt đang âm <b>{0}</b>. Chủ nhà, đại lý, người phụ đều chờ tiền. Phải xoay ngay, không thì dẹp quán.",tr(-S.cash)),ch:[
    {t:L("Vay app online 15 triệu"),note:L("lãi ~5%/tuần, 4 tuần đến hạn"),req:()=>appDebt()<45e6||L("Các app đã từ chối vì bạn vay quá nhiều"),fx:()=>{ S.cash+=15e6; addDebt({k:'app',n:L('App vay nhanh'),owe:15e6,rate:.05,due:wkNo()+4}); seed(2,'appcall'); return L("Tiền về sau 5 phút. Bạn bấm \"đồng ý\" cho app đọc danh bạ mà không kịp nghĩ."); }},
    {t:L("Gọi về nhà mượn 10 triệu"),req:()=>!S.flags.famLoan||L("Đã hỏi nhà một lần rồi"),chance:()=>[[L("Cơ bản"),.25],[L("Gia đình"),S.fam/140]],fx:ok=>{ S.flags.famLoan=1; if(ok){ S.cash+=10e6; S.fam-=10; addDebt({k:'fam',n:L("Mượn tiền nhà"),owe:10e6,due:wkNo()+10}); return L("Mẹ chuyển khoản, nhắn: \"Ráng lên con, đừng để nợ người ngoài.\""); } S.fam-=6; return L("Ba nói nhà cũng đang kẹt. Cuộc gọi kết thúc trong im lặng."); }},
    {t:L("Bán xe máy"),gain:()=>9e6,req:()=>!S.flags.soldBike||L("Xe đã bán rồi"),fx:()=>{ S.flags.soldBike=1; S.cash+=9e6; S.energy-=8; return L("Bạn bán chiếc xe gắn bó. Từ nay đi nhập hàng bằng xe buýt, mệt hơn hẳn."); }},
    {t:L("Bán luôn iPhone 11 cũ"),gain:()=>S.ph.trade*.8,req:()=>(S.ph.trade>0&&!S.flags.soldOld&&!S.bought)||L("Không còn máy cũ để bán"),fx:()=>{ S.flags.soldOld=1; S.cash+=S.ph.trade*.8; S.ph.trade=0; return L("Máy cũ đổi lấy tiền xoay. Muốn lên đời giờ phải trả đủ giá, không còn máy thu cũ."); }},
    {t:L("Dẹp quán, chịu phá sản"),end:1,fx:()=>{ bankrupt(L("Tiền mặt âm, không xoay được nữa.")); return ''; }}]};
}
function dueCard(d){
  if(d.k==='app') return {tag:'crisis',t:L("App vay đến hạn"),txt:L("Khoản vay app đã phình lên <b>{0}</b> (gốc + lãi). Nhân viên thu hồi nợ gọi từ 6 giờ sáng.",tr(d.owe)),ch:[
    {t:L("Trả hết {0}",tr(d.owe)),req:()=>S.cash>=d.owe||L("Không đủ tiền"),fx:()=>{ S.cash-=d.owe; d.owe=0; return L("Bạn tất toán, xoá app khỏi điện thoại.{0}",lesson('debt',L("vay nóng thì nhanh, trả thì đau."))); }},
    {t:L("Xin gia hạn 4 tuần"),note:L("phí gia hạn 15%"),fx:()=>{ d.owe*=1.15; d.due=wkNo()+4; seed(1,'appcall'); return L("Họ đồng ý, kèm phí gia hạn. Khoản nợ phình thêm."); }},
    {t:L("Lờ đi, chặn số"),fx:()=>{ d.owe*=1.1; d.due=wkNo()+2; S.rep-=.1; S.fam-=12; seed(1,'apptroll'); return L("Hôm sau, cả danh bạ của bạn nhận tin nhắn bôi nhọ. Có người tạt sơn trước cửa quán."); }}]};
  if(d.k==='fam') return {tag:'conseq',t:L("Tiền mượn nhà"),txt:L("Đến hẹn trả {0} cho nhà. Em gái sắp đóng học phí.",tr(d.owe)),ch:[
    {t:L("Trả đủ {0}",tr(d.owe)),req:()=>S.cash>=d.owe||L("Không đủ tiền"),fx:()=>{ S.cash-=d.owe; d.owe=0; S.fam+=8; return L("Mẹ nhận tiền, dúi lại cho bạn bịch khô cá."); }},
    {t:L("Khất thêm 6 tuần"),fx:()=>{ d.due=wkNo()+6; S.fam-=15; return L("Mẹ không nói gì. Em gái phải đi vay bạn đóng học phí."); }}]};
  d.due=null; return null;
}
function collapseCard(){ S.tot.sickN=(S.tot.sickN||0)+1;
  return {tag:'twist',t:L("Bạn gục ngay tại quầy"),txt:L("Làm liên tục không nghỉ, bạn choáng váng rồi ngã quỵ giữa giờ đông khách. Người ta chở bạn lên trạm y tế."),ch:[
    {t:L("Nghe bác sĩ, nghỉ hẳn 1 tuần"),cost:1.5e6,allowDebt:1,fx:()=>{ S.sick=7; S.energy=85; S.fam+=5; return L("Một tuần nằm nhà, mẹ nấu cháo. Quán đóng cửa, nhưng bạn hồi sức.{0}",lesson('health',L("sức mình là vốn lớn nhất của quán."))); }},
    {t:L("Truyền nước rồi về bán tiếp"),cost:8e5,allowDebt:1,chance:()=>[[L("Cơ bản"),.45],[L("Bài học"),lv('health')*.1]],fx:ok=>{ S.sick=2; S.energy=ok?45:22; if(!ok) seed(2,'relapse'); return ok?L("Bạn gắng gượng qua được."):L("Người vẫn lâng lâng. Bác sĩ dặn mà bạn không nghe."); }}]}; }

/* ---- hệ quả trì hoãn ---- */
const SEEDS={
  appcall:()=>appDebt()>0?{tag:'conseq',t:L("Điện thoại réo liên tục"),txt:L("Số lạ gọi, nhắn \"nhắc nợ\" cho cả bạn bè, người thân trong danh bạ."),fx:()=>{ S.rep-=.03; S.fam-=4; S.energy-=6; return L("Bạn mất ngủ cả tuần."); }}:null,
  apptroll:()=>appDebt()>0?{tag:'conseq',t:L("Bị khủng bố đòi nợ"),txt:L("Ảnh bạn bị ghép vào tờ \"truy nã\" gửi khắp nhóm Zalo khu phố."),fx:()=>{ S.rep-=.08; S.fam-=8; addBoost(.8,2,L("bị bêu riếu")); seed(2,'apptroll'); return L("Khách quen nhìn bạn khác hẳn."); }}:null,
  relapse:()=>({tag:'twist',t:L("Tái phát"),txt:L("Cơn choáng quay lại, lần này nặng hơn. Bác sĩ bắt nằm viện."),fx:()=>{ S.sick=5; S.energy=60; S.cash-=3e6; return L("Viện phí 3 triệu, quán đóng 5 ngày.{0}",lesson('health',L("sức mình là vốn lớn nhất của quán."))); }}),
  trasua:d=>({tag:'conseq',t:L("Quầy trà sữa hùn vốn"),txt:L("Sáu tuần trôi qua, bạn ghé quầy trà sữa của thằng bạn."),fx:()=>{ if(d.ok){ S.cash+=24e6; return L("Quầy đông khách. Nó chia cho bạn 24 triệu, vừa vốn vừa lời!"); } S.fam-=3; return L("Quầy đóng cửa từ tuần trước. Nó không nghe máy.{0}",lesson('trust',L("hùn vốn với bạn thì phải có giấy tờ rõ ràng."))); }}),
  coin:d=>({tag:'conseq',t:L("Sàn đầu tư"),txt:L("Bạn mở app sàn đầu tư \"lãi 5% mỗi tuần\"."),fx:()=>{ if(d.ok){ S.cash+=d.amt*2.2; return L("Rút được {0}! Lần này may mắn mỉm cười.",tr(d.amt*2.2)); } S.tot.scam=(S.tot.scam||0)+d.amt; return L("App không đăng nhập được. Nhóm Telegram giải tán. Cả trăm người mất tiền.{0}",lesson('scam',L("lãi cao bất thường thì gần như chắc chắn là lừa đảo."))); }}),
  fixreview:()=>({tag:'conseq',t:L("Khắc phục tiếng xấu"),txt:L("Bài chê quán vẫn đang được chia sẻ. Bạn làm gì để lấy lại khách?"),ch:[
    {t:L("Tổng vệ sinh, thay ly mới, quay clip cầu thị"),cost:2e6,chance:()=>[[L("Cơ bản"),.5],[L("Bài học"),lv('pr')*.1],repF(.2)],fx:ok=>{ S.clean=95; if(ok){ S.rep+=.12; S.boosts=S.boosts.filter(b=>b.why!==L("TikTok chê")); return L("Clip \"quán nhận lỗi và sửa ngay\" được khen ngược. Khách quay lại."); } return L("Quán sạch hẳn, nhưng clip đáp trả ít người xem.{0}",lesson('pr',L("sửa lỗi thật trước, nói sau."))); }},
    {t:L("Giảm giá 30% một tuần mời khách quay lại"),cost:1e6,fx:()=>{ addBoost(1.25,1,L("giảm giá")); S.rep+=.04; return L("Khách quen kéo nhau quay lại ủng hộ."); }},
    {t:L("Kệ, vài tuần người ta quên"),fx:()=>L("Bạn chờ. Khách hồi lại chậm.")}]}),
  wedding:()=>({tag:'conseq',t:L("Người thương"),txt:L("Hai đứa ngồi nói chuyện nghiêm túc về tương lai."),fx:()=>{ if(S.fam>45){ S.fam+=8; return L("Người ấy nói sẽ chờ. Bạn thấy có thêm động lực."); } S.flags.breakup=1; S.fam-=10; return L("Người ấy nói mệt mỏi vì bạn chỉ biết quán với tiền. Hai người chia tay."); }}),
  // hệ quả nối tiếp của các tình huống trong xóm / trên phố
  hs_dau:()=>({tag:'conseq',t:L("Tụi nhỏ đậu đại học!"),who:L("Nhóm học sinh"),txt:L("Năm đứa học sinh hồi ngồi ôn thi ở quán quay lại, tay cầm giấy báo: cả năm đứa đều đậu!"),ch:[
    {t:L("Mời cả nhóm một chầu ăn mừng"),note:L("tốn chút, nổi tiếng \"quán may mắn\""),fx:()=>{ S.cash-=2.5e5; S.fans+=10; S.rep+=.05; addBoost(1.08,3,L("\"Quán đậu đại học\"")); return L("Tụi nhỏ đăng lên mạng: \"Ôn thi ở quán này là đậu!\" Học sinh khoá sau kéo nhau tới."); }},
    {t:L("Treo ảnh tụi nhỏ lên \"bảng vàng\" của quán"),fx:()=>{ S.fans+=6; S.rep+=.03; return L("Bảng vàng nhỏ treo cạnh quầy, phụ huynh nào đi ngang cũng dừng lại coi."); }}]}),
  cho_con:()=>S.flags.dog&&!S.city?{tag:'conseq',t:L("\"Cà Phê\" có một bầy con"),who:L("Chị Thảo"),txt:L("Hoá ra \"Cà Phê\" là chó cái! Sáng nay nó đẻ một ổ năm con dưới gầm xe cà phê. Chị Thảo mừng rỡ chạy qua coi."),ch:[
    {t:L("Tặng cho hàng xóm nuôi"),note:L("tình làng"),fx:()=>{ ['thao','batu','long'].forEach(id=>heart(id,.8)); return L("Nhà nào cũng có một chú \"Cà Phê con\". Đi đâu cũng nghe gọi tên quán."); }},
    {t:L("Giữ một con, cho bọn trẻ đặt tên"),note:L("khách thích, tốn thức ăn"),fx:()=>{ S.cash-=2e5; S.fans+=8; addBoost(1.05,4,L("Chó con")); S.clean-=3; return L("Bé \"Sữa Đá\" lon ton khắp vườn, khách chụp hình không ngớt."); }}]}:null,
  say_lai:()=>({tag:'conseq',t:L("Nhóm nhậu quay lại"),who:L("Bàn số 3"),txt:L("Mấy ông bữa trước thấy quán dễ, giờ tuần nào cũng ghé sau cuộc nhậu, nói lớn, xả rác. Vài khách quen phàn nàn."),ch:[
    {t:L("Treo bảng \"Không phục vụ người say\""),note:L("mất ít tiền, giữ khách quen"),fx:()=>{ S.fans+=4; S.rep+=.03; S.cash-=1e5; return L("Mấy ông càm ràm rồi thôi. Khách quen quay lại ngồi yên tâm.{0}",lesson('khach',L("khách quen quý hơn vài ly bán thêm."))); }},
    {t:L("Xếp riêng một góc cho họ"),note:L("có tiền, dơ"),fx:()=>{ S.cash+=3e5; S.clean-=10; S.fans-=4; return L("Góc đó ồn ào, đầy vỏ đậu phộng. Tiền vô, nhưng khách gia đình thưa dần."); }}]}),
  hoithi_bao:()=>({tag:'conseq',t:L("Báo huyện tới phỏng vấn"),who:L("Phóng viên"),txt:L("Sau giải nhất hội thi, phóng viên báo huyện xin tới quay \"ly cà phê quê đoạt giải\"."),ch:[
    {t:L("Kể chuyện thật, mời cả xóm ra quay chung"),note:L("tình làng, quảng bá"),fx:()=>{ S.fans+=12; addBoost(1.15,3,L("Lên báo huyện")); VIL.forEach(v=>heart(v.id,.2)); return L("Bài báo có ảnh cả xóm cười tươi bên ly cà phê. Người tứ xứ ghé thử."); }},
    {t:L("Sơn sửa quán cho chỉn chu trước"),note:L("tốn, quán đẹp hơn"),fx:()=>{ S.cash-=1e6; S.clean=Math.max(S.clean,90); S.rep+=.06; addBoost(1.12,4,L("Lên báo huyện")); return L("Quán sơn mới, bàn ghế lau bóng. Lên hình sáng choang."); }}]}),
  homestay:()=>!S.city?{tag:'conseq',t:L("Homestay muốn ký hợp đồng"),who:L("Chị Hương"),txt:L("Đoàn khách Tây bữa trước khen quá trời. Chủ homestay muốn đưa khách tới \"trải nghiệm pha phin\" mỗi cuối tuần."),ch:[
    {t:L("Ký luôn, mỗi tuần một đoàn"),note:L("tiền đều, mệt cuối tuần"),fx:()=>{ addBoost(1.15,8,L("Khách homestay")); S.energy-=8; heart('huong',1); return L("Cuối tuần nào cũng có tốp khách nước ngoài lóng ngóng học pha phin. Vui mà mệt."); }},
    {t:L("Chỉ nhận khi rảnh"),fx:()=>{ addBoost(1.06,4,L("Khách homestay")); return L("Thỉnh thoảng có đoàn ghé, nhẹ nhàng."); }}]}:null,
  rang_ban:()=>({tag:'conseq',t:L("Khách hỏi mua bột nhà rang"),who:L("Khách quen"),txt:L("Mẻ cà phê tự rang bữa trước được khen. Giờ khách hỏi mua bột mang về pha ở nhà."),ch:[
    {t:L("Đóng gói bán, mỗi tuần rang một mẻ"),note:L("thêm tiền, mệt"),fx:()=>{ S.cash+=8e5; S.energy-=10; S.refBonus=(S.refBonus||0)+500; return L("Túi giấy kraft dán nhãn tên quán bán hết trong hai ngày."); }},
    {t:L("Chỉ để pha tại quán"),fx:()=>{ S.fans+=3; return L("Muốn uống cà phê nhà rang thì phải ra quán. Khách quen thích vậy."); }}]}),
  trung_hu:()=>S.flags.trung?{tag:'conseq',t:L("Trứng để qua đêm"),who:'Linh',txt:L("Linh nhắc nhỏ: \"Trời nóng, trứng để ngoài qua đêm dễ hư. Làm cà phê trứng phải dùng trứng mới, đánh xong bán ngay.\""),ch:[
    {t:L("Mua tủ mát nhỏ đựng trứng"),cost:1.2e6,note:L("tốn, an toàn"),fx:()=>{ S.clean+=8; heart('linh',.5); return L("Trứng để tủ mát, ngày nào dùng hết ngày đó. Yên tâm hẳn.{0}",lesson('food',L("đồ tươi sống phải bảo quản lạnh."))); }},
    {t:L("Sáng nào cũng mua vừa đủ dùng"),note:L("mệt hơn"),fx:()=>{ S.energy-=4; return L("Sáng nào cũng chạy ra chợ mua trứng, nhưng bảo đảm tươi."); }},
    {t:L("Không sao đâu, trứng còn tốt"),chance:()=>[[L("Cơ bản"),.5]],fx:ok=>{ if(ok) return L("Lần này may mắn không sao."); S.rep-=.08; S.sick=Math.max(S.sick,1); return L("Một khách đau bụng sau ly cà phê trứng. Quán phải nghỉ một ngày.{0}",lesson('food',L("đồ tươi sống phải bảo quản lạnh."))); }}]}:null,
  banhmi_hun:()=>S.flags.banhmi&&!S.city?{tag:'conseq',t:L("Chị Mai rủ làm combo"),who:L("Chị Mai"),txt:L("\"Bánh mì bán chạy quá em ơi. Hay mình làm combo bánh mì + cà phê, chị lo bánh, em lo nước?\""),ch:[
    {t:L("Làm combo chung"),note:L("thêm khách lâu dài, mệt hơn"),fx:()=>{ addBoost(1.12,6,L("Combo bánh mì")); S.energy-=6; heart('mai',1); S.fans+=8; return L("Bảng \"COMBO SÁNG\" treo trước cổng. Người đi làm sớm ghé đông hẳn."); }},
    {t:L("Thôi, ai bán nấy cho gọn"),fx:()=>{ heart('mai',-.3); return L("Hai chị em vẫn bán chung góc vườn như cũ."); }}]}:null,
  clbsach:()=>!S.city?{tag:'conseq',t:L("Câu lạc bộ đọc sách"),who:L("Thầy Nam"),txt:L("Tủ sách góc vườn giờ chiều nào cũng có cả chục đứa nhỏ. Thầy Nam muốn lập \"CLB đọc sách cuối tuần\" ngay tại quán."),ch:[
    {t:L("Đồng ý, tặng mỗi bạn nhỏ ly sữa"),note:L("tốn ít, phụ huynh quý"),fx:()=>{ S.cash-=3e5; S.fans+=12; S.rep+=.05; addBoost(1.06,4,L("CLB đọc sách")); return L("Cuối tuần vườn rộn tiếng đọc truyện. Phụ huynh đưa con tới, tiện gọi ly cà phê."); }},
    {t:L("Chỉ sáng chủ nhật thôi"),fx:()=>{ S.fans+=5; return L("Sáng chủ nhật nào cũng có một nhóm nhỏ ngồi đọc dưới tán cây."); }}]}:null,
  sv_thi:()=>S.staff>0?{tag:'conseq',t:L("Mùa thi của cậu sinh viên"),who:L("Người phụ ca tối"),txt:L("Cậu sinh viên làm thêm sắp thi cuối kỳ, xin nghỉ hai tuần ôn bài."),ch:[
    {t:L("Cho nghỉ, giữ chỗ chờ quay lại"),note:L("mệt hai tuần"),fx:()=>{ S.energy-=8; S.rep+=.02; return L("Thi xong cậu quay lại, làm hăng hơn hẳn, còn rủ bạn bè tới uống."); }},
    {t:L("Cho nghỉ hẳn, tìm người mới"),fx:()=>{ S.staff=Math.max(0,S.staff-1); return L("Bạn đăng tin tuyển người mới lên nhóm tìm việc."); }}]}:null,
  phep_ve:()=>S.staff>0?{tag:'conseq',t:L("Người phụ quay lại"),txt:L("Người phụ chăm ba xong, từ quê lên mang theo bao gạo và chục trứng gà biếu bạn."),fx:()=>{ S.energy+=6; S.fam+=3; return L("Từ đó làm việc như người nhà, chẳng cần nhắc."); }}:null,
  nham_no:()=>({tag:'conseq',t:L("Bị đòi khoản vay lạ"),txt:L("Một app vay gọi đòi 5 triệu \"khoản vay đứng tên bạn\" kèm lãi — chính là số tiền \"chuyển nhầm\" hôm trước. Còn 5 triệu bạn chuyển đi thì mất hút."),fx:()=>{ addDebt({k:'app',n:L("Khoản vay \"chuyển nhầm\""),owe:6e6,rate:.05,due:wkNo()+3}); S.tot.scam=(S.tot.scam||0)+5e6; return L("Bạn ra công an trình báo, nhưng app vẫn đòi nợ.{0}",lesson('nham',L("tiền chuyển nhầm thì hoàn trả qua ngân hàng, không chuyển sang số lạ."))); }}),
  nham_cs:()=>({tag:'conseq',t:L("Giấy mời của công an"),txt:L("Chủ tài khoản thật trình báo. Công an mời bạn lên làm việc về khoản tiền chuyển nhầm."),fx:()=>{ S.cash-=5e6; S.rep-=.05; S.energy-=5; return L("Bạn phải hoàn trả đủ 5 triệu và ký biên bản. Cố tình giữ tiền chuyển nhầm là vi phạm pháp luật.{0}",lesson('nham',L("tiền chuyển nhầm thì hoàn trả qua ngân hàng, không chuyển sang số lạ."))); }})
};

/* ---- tin nóng về iPhone ---- */
function newsCard(w){
  if(S.bought) return null;
  if(w===10) return {tag:'news',t:L("iPhone Duo cháy hàng"),txt:L("Hàng về ít, các tiệm hét giá thêm 4 triệu."),fx:()=>{ S.ph.price+=4e6; return L("Cần lên đời giờ là {0}.",tr(goal())); }};
  if(w===18) return {tag:'news',t:L("Hàng về trở lại"),txt:L("Đợt hàng mới về, giá hạ bớt."),fx:()=>{ S.ph.price-=3e6; return L("Cần lên đời giờ là {0}.",tr(goal())); }};
  if(w===27) return {tag:'news',t:L("Sale giữa năm!"),txt:L("Siêu sale: giảm 5 triệu trong 2 tuần. Qua đợt này là về giá cũ."),fx:()=>{ S.ph.price-=5e6; S.flags.saleEnd=29; return L("Chỉ còn {0} — cơ hội hiếm!",tr(goal())); }};
  if(w===29&&S.flags.saleEnd){ S.ph.price+=5e6; S.flags.saleEnd=0; return {tag:'news',t:L("Hết sale"),txt:L("Đợt giảm giá đã kết thúc."),fx:()=>L("Giá về lại, cần {0}.",tr(goal()))}; }
  if(w===40) return {tag:'news',t:L("Rò rỉ: sắp có iPhone Duo 2"),txt:L("Tin đồn đời mới ra mắt đầu năm sau. Máy cũ của bạn mất giá nhanh hơn."),fx:()=>{ S.ph.trade=Math.max(0,S.ph.trade-8e5); return L("Giá thu cũ giảm thêm 800 nghìn."); }};
  return null;
}

/* ---- lên phố ---- */
const cityCost=l=>l.rent*(l.depM+1)+l.fit+2e6;
function cityOfferCard(){
  return {tag:'decision',t:L("Lên phố?"),who:L('Anh Long'),txt:L("\"Thằng em anh ở Sài Gòn đang sang lại mấy mặt bằng. Ở quê bán {0} một ly, trên đó bán 25–35K. Dám đi không?\"<br><br>Lên phố: khách đông, giá cao — nhưng tiền thuê, đối thủ, đoàn kiểm tra cũng gấp mấy lần. Giấy tờ phải làm lại ở phường mới.",kk(S.price)),
    ch:[...LOCS.filter(l=>l.city).map(l=>({t:l.t,note:L("thuê {0}/th · cần ~{1}",tr(l.rent),tr(cityCost(l))),fx:()=>({txt:L("{0}<br>Cọc {1} tháng {2} + tháng đầu {3} + sửa sang {4} + làm lại giấy tờ 2tr.",l.d,l.depM,tr(l.rent*l.depM),tr(l.rent),tr(l.fit)),next:fundCard(l)})})),
      {t:L("Chưa, ở lại quê thêm"),autoPick:1,fx:()=>L("Anh Long nhún vai: \"Lúc nào muốn thì nói anh. Cơ hội không chờ ai đâu.\"")}]};
}
function fundCard(l){
  const need=cityCost(l)+3e6, have=S.cash+S.deposit, short=need-have, ch=[];
  if(short<=0) ch.push({t:L("Dọn lên phố ngay!"),fx:()=>moveCity(l)});
  else {
    ch.push({t:L("Vay ngân hàng 60 triệu"),note:L("~1%/tháng, trả 1,6tr mỗi tuần"),req:()=>S.flags.bank?L("Đã vay rồi"):(S.docs.hkd.st==='done'&&S.docs.tax.st==='done')||L("Cần giấy ĐKHKD + mã số thuế"),
      chance:()=>[[L("Cơ bản"),.35],repF(.4),[L("Sổ sách bán hàng"),Math.min(.25,S.tot.openDays/200)],[L("Nợ đang có"),-debtSum()/150e6]],
      fx:ok=>{ S.flags.bank=1; if(ok){ S.cash+=60e6; addDebt({k:'bank',n:L("Vay ngân hàng"),owe:60e6,rate:.0025,pay:1.6e6}); return {txt:L("Hồ sơ được duyệt. 60 triệu về tài khoản."),next:fundCard(l)}; } return {txt:L("Ngân hàng từ chối: \"Doanh thu chưa đủ chứng minh khả năng trả nợ.\""),next:fundCard(l)}; }});
    ch.push({t:L("Hùn vốn với anh Long 40 triệu"),note:L("chia anh 25% lãi mỗi tuần, mãi mãi"),req:()=>!S.flags.partner||L("Đã hùn rồi"),chance:()=>[[L("Cơ bản"),.5],[L("Thân với Long"),S.vil.long.h/20]],
      fx:ok=>{ S.flags.partner=1; if(ok){ S.cash+=40e6; S.partner=.25; return {txt:L("Anh Long gật: \"Làm ăn đàng hoàng, lời chia lỗ chịu.\""),next:fundCard(l)}; } return {txt:L("Anh Long ngần ngừ rồi bảo vợ không cho."),next:fundCard(l)}; }});
    ch.push({t:L("Mượn nhà 25 triệu"),note:L("hẹn trả sau 14 tuần"),req:()=>!S.flags.famBig||L("Đã hỏi rồi"),chance:()=>[[L("Cơ bản"),.15],[L("Gia đình"),S.fam/130]],
      fx:ok=>{ S.flags.famBig=1; if(ok){ S.cash+=25e6; S.fam-=6; addDebt({k:'fam',n:L("Mượn tiền nhà"),owe:25e6,due:wkNo()+14}); return {txt:L("Ba mẹ rút sổ tiết kiệm. \"Đi thì đi cho tới nơi.\""),next:fundCard(l)}; } S.fam-=4; return {txt:L("Mẹ khóc: \"Con ở quê bán cũng được mà...\""),next:fundCard(l)}; }});
    ch.push({t:L("Vay app online 30 triệu"),note:L("lãi ~5%/tuần, 4 tuần đến hạn"),req:()=>appDebt()<45e6||L("Các app đã từ chối"),fx:()=>{ S.cash+=30e6; addDebt({k:'app',n:L('App vay nhanh'),owe:30e6,rate:.05,due:wkNo()+4}); seed(2,'appcall'); return {txt:L("Giải ngân trong 5 phút. Lãi tính từng ngày."),next:fundCard(l)}; }});
  }
  ch.push({t:L("Thôi, ở lại quê"),fx:()=>L("Bạn quyết định chưa đi. Có khi lại hay.")});
  return {tag:'decision',t:L("Gom vốn lên phố"),txt:L("<b>{0}</b><br>Cần khoảng <b>{1}</b> (kể cả 3tr vốn xoay vòng). Bạn đang có {2}, tính cả tiền cọc vườn được trả lại.<br>{3}",l.t,tr(need),tr(have),short>0?L("Còn thiếu <b class=\"neg\">{0}</b>.",tr(short)):L("<b class=\"pos\">Đủ tiền rồi!</b>")),ch};
}
function moveCity(l){
  S.cash+=S.deposit; S.cash-=cityCost(l); S.deposit=l.rent*l.depM; S.loc=l.id; S.city=1; S.rent=l.rent; S.price=l.ref; S.comp=l.comp; S.fans*=.15;
  ['hdt','hkd','attp','pccc','sign'].forEach(k=>S.docs[k]={st:'none',left:0});
  S.layout=JSON.parse(JSON.stringify(CITY_LAYOUT)); S.cart=1; S.weeds=[]; S.walk=false; S.staff=Math.max(S.staff,2); S.movedW=wkNo();
  bgKey=''; tkey=''; addLog(S.day,L("Lên phố: thuê {0}, {1}/tháng.",l.t,tr(l.rent)),'good');
  return L("Chuyến xe đêm chở theo chiếc xe cafe lên Sài Gòn. Mặt bằng mới, tiếng xe máy không ngớt.<br><br><b>Phải làm lại giấy tờ ở phường mới:</b> hợp đồng thuê, đăng ký hộ KD, ATTP, PCCC. Mở bán khi chưa đủ giấy là đánh cược với đoàn kiểm tra.");
}

/* ---- quyết định trước mỗi tuần ---- */
const DECISIONS=[
  {id:'maythanhly',w:()=>EQ().q<3&&S.day>14?1.2:0,c:()=>{ const nx=EQ().q===1?'may':'xin', n=EQS.find(e=>e.id===nx);
    return {t:L("Máy pha thanh lý"),who:L("Anh Hải"),txt:L("\"Có quán trên huyện dẹp tiệm, thanh lý {0} giá 14 triệu. Máy mới tiền gấp ba đó!\" Máy tốt hơn: pha nhanh hơn ({1} ly/ngày), khách chịu giá cao hơn.",n.t.toLowerCase(),n.cap),ch:[
      {t:L("Mua liền 14 triệu"),cost:14e6,chance:()=>[[L("Cơ bản"),.6],[L("Thân với Hải"),S.vil.hai.h*.04],[L("Bài học"),lv('buy')*.1]],fx:ok=>{ if(ok){ S.eq=nx; return L("Máy chạy êm ru. Ly cafe đẹp hẳn."); } return L("Về tới nhà mới biết bo mạch cháy. Sửa không nổi.{0}",lesson('buy',L("đồ thanh lý phải thử tận tay trước khi trả tiền."))); }},
      {t:L("Mua máy mới trả góp"),note:L("góp 0,7tr/tuần trong 40 tuần"),fx:()=>{ S.eq=nx; addDebt({k:'bank',n:L("Trả góp máy pha"),owe:28e6,pay:7e5}); return L("Máy mới tinh, kèm khoản góp dài hạn."); }},
      {t:L("Thôi, xài đồ cũ"),fx:()=>L("Bạn giữ tiền lại. Máy cũ vẫn kêu rè rè.")}]}; }},
  {id:'tieccuoi',w:()=>S.day>10?1:0,c:()=>{ const n=S.city?400:250, v=n*(S.price-EQ().cogs);
    return {t:L("Đơn hàng lớn"),who:S.city?L("Công ty sự kiện"):L("Nhà chú Ba Hùng"),txt:L("Đặt {0} ly cafe giao tận nơi cho {1} cuối tuần. Làm kịp thì lời khoảng {2}; trễ hay dở là bị chửi khắp nơi.",n,S.city?L("hội nghị khách hàng"):L("tiệc cưới"),tr(v)),ch:[
      {t:L("Nhận, làm xuyên đêm"),chance:()=>[[L("Cơ bản"),.3],[L("Người phụ"),Math.min(S.staff,3)*.14],[L("Bài học"),lv('event')*.1],tiredF()],fx:ok=>{ S.energy-=15; if(ok){ S.cash+=v; S.rep+=.05; S.fans+=15; return L("Giao đúng giờ, khách khen nức nở. Lời {0}.",tr(v)); } S.cash+=v*.3-2e6; S.rep-=.1; return L("Giao trễ một tiếng, đá tan hết, cafe nhạt. Khách trừ tiền và chê trên mạng.{0}",lesson('event',L("nhận đơn lớn phải tính sức mình và người phụ."))); }},
      {t:L("Từ chối khéo"),fx:()=>L("Bạn nói quán nhỏ, không kham nổi.")}]}; }},
  {id:'trasua',w:()=>S.cash>12e6?.8:0,c:()=>({t:L("Bạn rủ hùn vốn"),who:L("Thằng Tuấn bạn cấp ba"),txt:L("\"Mở quầy trà sữa trước cổng trường, mỗi đứa 10 triệu. Sáu tuần là hoàn vốn, tao bảo đảm!\""),ch:[
    {t:L("Góp 10 triệu"),cost:10e6,fx:()=>{ seed(6,'trasua',{ok:R()<.35}); return L("Bạn chuyển khoản. Nó gửi lại cái sticker ngón cái."); }},
    {t:L("Không, đang cần vốn"),fx:()=>L("Nó hơi phật ý, nói \"để tao rủ đứa khác\".")}]})},
  {id:'coin',w:()=>S.cash>8e6&&!lv('scam')?.7:0,c:()=>({t:L("Lời mời đầu tư"),who:L("Chị Vy trong nhóm Zalo"),txt:L("\"Sàn đầu tư nước ngoài, lãi 5% mỗi tuần, rút lúc nào cũng được. Chị bỏ vào 50 triệu rồi, tuần nào cũng rút đều!\" Kèm ảnh chụp màn hình số dư."),ch:[
    {t:L("Bỏ thử 15 triệu"),cost:15e6,fx:()=>{ seed(4,'coin',{ok:R()<.12,amt:15e6}); return L("Số dư trên app tăng mỗi ngày. Bạn thấy hơi lâng lâng."); }},
    {t:L("Lịch sự từ chối"),fx:()=>L("Chị Vy chê bạn \"nhát như thỏ\".")}]})},
  {id:'nguonhang',w:()=>1,c:()=>({t:L("Nguồn hàng giá rẻ"),who:L("Đại lý mới"),txt:L("Chào bán cafe bột rẻ hơn 25%, \"rang xay nguyên chất, mẫu mã xịn\". Nhập thì lời mỗi ly tăng hẳn."),ch:[
    {t:L("Đổi sang nguồn rẻ"),chance:()=>[[L("Cơ bản"),.45],[L("Bài học"),lv('buy')*.12]],fx:ok=>{ if(ok){ S.cogsMul*=.85; return L("Hàng tốt thật, giá rẻ. Lời mỗi ly tăng."); } S.rep-=.15; addBoost(.85,2,L("bị tố")); return L("Khách quen nhấp một ngụm rồi nhăn mặt: \"Cafe gì mùi bắp rang?\" Hàng trộn đậu nành.{0}",lesson('buy',L("hàng rẻ bất thường thường có lý do."))); }},
    {t:L("Giữ đại lý cũ"),fx:()=>L("Bạn giữ mối cũ. Chậm mà chắc.")}]})},
  {id:'tangluong',w:()=>S.staff>0&&S.day>20?1:0,c:()=>({t:L("Người phụ đòi tăng lương"),who:L("Bé Nhi, người phụ quán"),txt:L("\"Quán bên kia trả cao hơn 20%. Anh/chị không tăng thì cuối tuần em nghỉ.\""),ch:[
    {t:L("Tăng lương 20%"),fx:()=>{ S.wageMul=(S.wageMul||1)*1.2; return L("Nhi cười tươi, làm hăng hơn hẳn."); }},
    {t:L("Thương lượng, hứa thưởng cuối tháng"),chance:()=>[[L("Cơ bản"),.4],repF(.5)],fx:ok=>{ if(ok) return L("Nhi đồng ý ở lại."); S.staff=Math.max(0,S.staff-1); S.energy-=8; return L("Nhi nghỉ ngang. Bạn phải gánh thêm việc."); }},
    {t:L("Cho nghỉ, tự làm"),fx:()=>{ S.staff=Math.max(0,S.staff-1); return L("Bớt một người, bớt một khoản lương. Và bớt một đôi tay."); }}]})},
  {id:'nguoiyeu',w:()=>!S.flags.loveAsk&&S.day>50?1.5:0,c:()=>{ S.flags.loveAsk=1;
    return {t:L("Người thương hỏi cưới"),who:L("Người yêu bạn"),txt:L("\"Mình quen nhau ba năm rồi. Ba mẹ em hỏi bao giờ tính chuyện cưới. Đám cưới ở quê cũng phải 30 triệu...\""),ch:[
      {t:L("Cưới trong năm nay"),cost:30e6,allowDebt:1,fx:()=>{ S.fam+=25; S.energy+=15; S.flags.married=1; return L("Đám cưới nhỏ dưới gốc xoài. Tiền mừng gỡ lại được một phần.{0}",(S.cash+=12e6,'')); }},
      {t:L("Hẹn khi quán ổn định"),fx:()=>{ seed(6,'wedding'); return L("Người ấy gật đầu, nhưng ánh mắt buồn buồn."); }},
      {t:L("\"Lên đời điện thoại trước đã\""),fx:()=>{ S.fam-=20; S.flags.breakup=1; return L("Người ấy đứng dậy bỏ về, không nói một lời."); }}]}; }},
  {id:'dalat',w:()=>S.energy<45?2:0,c:()=>({t:L("Rủ đi Đà Lạt"),who:L("Hội bạn thân"),txt:L("\"Đi Đà Lạt ba ngày đi mày, nhìn mặt mày như cái xác!\""),ch:[
    {t:L("Đi, đóng quán 3 ngày"),cost:2.5e6,fx:()=>{ S.sick=3; S.energy+=40; S.fam+=5; return L("Ba ngày ngủ nướng, săn mây. Về nhìn ly cafe thấy yêu đời lại."); }},
    {t:L("Không đi, quán cần mình"),fx:()=>{ S.energy-=5; return L("Tụi bạn gửi ảnh về. Bạn lướt xem lúc 1 giờ sáng."); }}]})},
  {id:'appgiao',w:()=>S.city&&!S.flags.appKm?1.2:0,c:()=>({t:L("App giao đồ mời khuyến mãi"),who:L("Nhân viên app"),txt:L("\"Chạy chương trình giảm 30% trên app 3 tuần, quán được đẩy lên đầu trang. Phí 3 triệu.\""),ch:[
    {t:L("Chạy khuyến mãi"),cost:3e6,fx:()=>{ S.flags.appKm=1; S.del=true; addBoost(1.3,3,L("lên top app")); S.fans+=10; return L("Đơn nổ liên tục. Lời mỗi ly mỏng đi, nhưng tên quán được biết đến."); }},
    {t:L("Không chạy"),fx:()=>L("Bạn từ chối. Quán bên cạnh nhận lời.")}]})},
  {id:'dongia',w:()=>S.city&&S.comp>.4?1.3:0,c:()=>({t:L("Quán bên cạnh đồng giá 15K"),who:L("Đối thủ"),txt:L("Quán mới khai trương ngay sát vách, treo băng rôn \"ĐỒNG GIÁ 15K\". Khách của bạn bắt đầu ngó sang."),ch:[
    {t:L("Giảm giá theo"),fx:()=>{ S.price=Math.max(15000,S.price-6000); S.comp-=.08; return L("Hai quán gồng lỗ với nhau. Xem ai trụ lâu hơn."); }},
    {t:L("Làm món độc quyền: cafe muối"),cost:1.5e6,chance:()=>[[L("Cơ bản"),.45],[L("Bài học"),lv('menu')*.12],[L("Máy pha"),(EQ().q-1)*.08]],fx:ok=>{ if(ok){ S.refBonus=(S.refBonus||0)+3000; S.fans+=20; return L("Cafe muối thành món \"phải thử\" trong khu. Khách chịu trả cao hơn."); } return L("Thử ba công thức đều mặn chát. Đổ bỏ cả xô.{0}",lesson('menu',L("món mới phải thử nhiều lần trước khi bán."))); }},
    {t:L("Giữ giá, giữ chất"),fx:()=>{ S.comp+=.08; return L("Bạn giữ nguyên. Một số khách quen vẫn ở lại."); }}]})},
  {id:'vaynong',w:()=>S.cash<4e6&&appDebt()<30e6?1.5:0,c:()=>({t:L("Tin nhắn lúc nửa đêm"),who:L("Số lạ"),txt:L("\"VAY 20 TRIỆU KHÔNG THẾ CHẤP, CHỈ CẦN CCCD, GIẢI NGÂN 5 PHÚT.\" Tiền thuê nhà sắp đến hạn."),ch:[
    {t:L("Vay 20 triệu"),note:L("lãi ~5%/tuần, 4 tuần đến hạn"),fx:()=>{ S.cash+=20e6; addDebt({k:'app',n:L('App vay nhanh'),owe:20e6,rate:.05,due:wkNo()+4}); seed(2,'appcall'); return L("Tiền về thật. Lãi cũng thật."); }},
    {t:L("Xoá tin nhắn"),fx:()=>L("Bạn xoá tin, nằm nhìn trần nhà.")}]})},
  {id:'giaytophuong',w:()=>S.city&&missingDocs()>1?1.3:0,c:()=>({t:L("Dịch vụ làm hồ sơ"),who:L("Anh \"làm giấy tờ nhanh\""),txt:L("\"Em đưa 5 triệu, anh lo trọn gói đăng ký hộ KD, ATTP, PCCC trong 3 ngày, khỏi xếp hàng.\""),ch:[
    {t:L("Đưa 5 triệu"),cost:5e6,chance:()=>[[L("Cơ bản"),.45],[L("Bài học"),lv('scam')*.15]],fx:ok=>{ if(ok){ ['hdt','hkd','attp','pccc'].forEach(k=>{ if(S.docs[k].st==='none') S.docs[k]={st:'pending',left:3}; }); return L("Dịch vụ làm thật: hồ sơ nộp đủ, 3 ngày nữa có giấy."); } S.tot.scam=(S.tot.scam||0)+5e6; return L("Anh ta cầm tiền rồi chặn số.{0}",lesson('scam',L("thủ tục thật thì tự nộp ở bộ phận một cửa hoặc dịch vụ công."))); }},
    {t:L("Tự nộp ở phường"),fx:()=>L("Bạn mở mục Giấy tờ, tự nộp từng bộ. Chậm nhưng chắc.")}]})},
  {id:'banquan',w:()=>S.city&&S.fans>110&&wkNo()>=14&&!S.flags.sellAsk?2:0,c:()=>{ S.flags.sellAsk=1; const offer=Math.round((S.deposit+S.fans*350000+30e6)/1e6)*1e6;
    return {t:L("Có người hỏi mua lại quán"),who:L("Chủ chuỗi cafe nhỏ"),txt:L("\"Quán em đông khách quen. Anh trả {0}, sang lại nguyên trạng, em cầm tiền về quê.\" Bán thì kết thúc hành trình sớm.",tr(offer)),ch:[
      {t:L("Bán quán, nhận {0}",tr(offer)),end:1,fx:()=>{ S.cash+=offer-S.deposit; S.deposit=0; S.over='sold'; S.open=false; addLog(S.day,L("Bán lại quán được {0}",tr(offer)),'good'); return ''; }},
      {t:L("Không bán, còn làm được"),autoPick:1,fx:()=>L("Bạn bắt tay từ chối. Quán là đứa con tinh thần.")}]}; }}
];
// sự kiện chỉ hợp lý khi quán đang mở bán (có khách, có doanh thu, có đối thủ giành khách)
const OPEN_ONLY=new Set(['s_bao','hocsinh','say','dulich','racthai','banchiu','chophien','nangnong','retdam','bongda','ghiso','billgia','tiktok','cupdien','truongthon',
  'tieccuoi','appgiao','dongia','viral','phot','daubung','giaitoa','vesinh','khachsop','chuoilon']);
STORY.forEach(s=>{ if(s.open) OPEN_ONLY.add(s.id); });
const fitsNow=id=>(S.open&&!(S.sick>0))||!OPEN_ONLY.has(id);
// at:'q' chỉ ở quê, at:'p' chỉ trên phố; once: cả ván chỉ gặp một lần
const placeOK=s=>!(s.at==='q'&&S.city)&&!(s.at==='p'&&!S.city);
const seenN=(k,id)=>((S[k]||{})[id])||0;
const valOf=v=>typeof v==='function'?v():v;
function pickDecision(force){
  const w=wkNo(); if(!force&&(w<1||R()>.75)) return null;
  // gặp càng nhiều lần thì càng ít ra lại; chuyện chưa gặp bao giờ được ưu tiên
  // mỗi chuyện tối đa 2 lần một ván (once: 1 lần); chỉ khi đã hết chuyện mới thì mới cho gặp lại lần thứ ba
  const rest=(id,cd)=>!(S.seenC[id]!=null&&w-S.seenC[id]<cd), wt=(id,b)=>b/(1+seenN('cntC',id)*3);
  const build=cap=>{ const p=DECISIONS.filter(d=>fitsNow(d.id)&&d.w()>0&&seenN('cntC',d.id)<cap&&rest(d.id,14)).map(d=>[d,wt(d.id,d.w())]);
    STORY.filter(s=>fitsNow(s.id)&&placeOK(s)&&seenN('cntC',s.id)<(s.once?1:cap)&&(!s.cond||s.cond())&&rest(s.id,18)).forEach(s=>p.push([{id:s.id,st:s},wt(s.id,s.w||.55)])); return p; };
  let pool=build(2); if(!pool.length) pool=build(99);
  if(!pool.length) return null;
  let x=R()*pool.reduce((s,p)=>s+p[1],0), d=pool[0][0]; for(const [p,ww] of pool){ x-=ww; if(x<=0){ d=p; break; } }
  S.seenC[d.id]=w; S.cntC=S.cntC||{}; S.cntC[d.id]=seenN('cntC',d.id)+1;
  if(d.st) return {tag:'decision',t:d.st.t,who:valOf(d.st.who),txt:valOf(d.st.txt),ch:d.st.ch.map(o=>({...o,fx:ok=>o.fx(ok)}))};
  const c=d.c(); c.tag='decision'; return c;
}

/* ---- khúc ngoặt bất ngờ ---- */
const LK=()=>S.city?1:.6; // thiệt hại ở quê rẻ hơn trên phố
const TWISTS=[
  {id:'chay',w:()=>1,c:()=>({t:L("Chập điện, xe cafe bốc cháy!"),txt:L("Đêm khuya, dây điện kéo ra xe cafe chập, lửa bén vào mái. Hàng xóm la toáng lên."),ch:[
    {t:L("Lao ra dập lửa"),chance:()=>[[L("Cơ bản"),.35],[L("Có bình chữa cháy"),S.docs.pccc.st==='done'?.4:0],tiredF()],fx:ok=>{ if(ok){ S.cash-=1e6*LK(); return L("Bình chữa cháy phụt một phát, lửa tắt. Chỉ cháy sém mái."); } S.cash-=12e6*LK(); S.energy-=25; S.sick=4; return L("Lửa lớn quá. Máy móc, kệ hàng cháy rụi, bạn bị bỏng tay. Thiệt hại 12 triệu.{0}",lesson('fire',L("bình chữa cháy rẻ hơn một đám cháy."))); }},
    {t:L("Gọi 114, đứng chờ"),fx:()=>{ S.cash-=7e6*LK(); S.sick=3; return L("Xe chữa cháy tới sau 20 phút. Mất hết đồ nghề trên xe: 7 triệu."); }}]})},
  {id:'trom',w:()=>1,c:()=>({t:L("Trộm đột nhập"),txt:L("Sáng ra thấy khoá bị cắt. Két tiền và bộ phin, máy xay biến mất."),ch:[
    {t:L("Báo công an, trích camera"),chance:()=>[[L("Cơ bản"),.15],[L("Có camera"),S.flags.cam?.45:0]],fx:ok=>{ S.sick=1; if(ok){ return L("Camera ghi rõ mặt. Công an tìm ra, trả lại đồ."); } S.cash-=5e6*LK(); return L("Không có manh mối. Mất 5 triệu tiền két và đồ nghề."); }},
    {t:L("Lắp camera 2 triệu, coi như mất của"),cost:()=>2e6*LK(),fx:()=>{ S.flags.cam=1; S.cash-=5e6*LK(); return L("Mất 5 triệu. Từ nay có camera canh quán.{0}",lesson('safe',L("của nả phải giữ trước khi mất."))); }}]})},
  {id:'viral',w:()=>1,c:()=>({t:L("Clip quán lên xu hướng!"),txt:L("Một bạn trẻ quay clip \"quán cafe chill nhất vùng\" — 2 triệu lượt xem sau một đêm. Tuần tới khách sẽ đổ về."),ch:[
    {t:L("Tăng giá 5K ăn theo"),fx:()=>{ S.price+=5000; addBoost(1.7,2,'viral'); S.rep-=.04; return L("Khách đông nghẹt. Vài người chê \"nổi rồi làm giá\"."); }},
    {t:L("Thuê thêm người tạm, giữ giá"),cost:()=>1.5e6*LK(),fx:()=>{ addBoost(1.8,2,'viral'); S.fans+=40; S.rep+=.06; return L("Đông mà vẫn chu đáo. Nhiều người thành khách quen."); }},
    {t:L("Bình thường thôi"),fx:()=>{ addBoost(1.6,1,'viral'); return L("Bạn để mọi thứ tự nhiên."); }}]})},
  {id:'phot',w:()=>1,c:()=>({t:L("Bị bóc phốt trên mạng"),txt:L("Một bài đăng: \"Uống cafe ở quán này thấy con gián trong ly!!!\" kèm ảnh mờ. 3 nghìn lượt chia sẻ."),ch:[
    {t:L("Xin lỗi công khai, mời khách quay lại"),chance:()=>[[L("Cơ bản"),.5],repF(.3),[L("Có giấy ATTP"),S.docs.attp.st==='done'?.15:0]],fx:ok=>{ if(ok){ S.rep+=.03; return L("Khách nhận lời, quay video uống lại và khen. Dân mạng quay xe."); } S.rep-=.1; addBoost(.8,2,L("phốt")); return L("Lời xin lỗi bị cho là \"nhận tội\". Khách vẫn tẩy chay."); }},
    {t:L("Đăng bài phản pháo"),chance:()=>[[L("Cơ bản"),.25],[L("Có camera"),S.flags.cam?.4:0]],fx:ok=>{ if(ok){ S.rep+=.08; return L("Bạn đăng clip camera: không có con gián nào. Người bóc phốt xoá bài."); } S.rep-=.25; addBoost(.6,3,L("phốt")); return L("Càng cãi càng nóng. Quán thành \"quán thái độ\".{0}",lesson('pr',L("trên mạng, bình tĩnh quan trọng hơn đúng sai."))); }},
    {t:L("Im lặng chờ qua"),fx:()=>{ S.rep-=.1; addBoost(.75,2,L("phốt")); return L("Hai tuần vắng khách rồi mọi người cũng quên."); }}]})},
  {id:'daubung',w:()=>1,c:()=>({t:L("Khách đau bụng"),txt:L("Ba khách cùng đau bụng sau khi uống trà tắc ở quán. Người nhà báo lên {0}. Đoàn ATTP xuống kiểm tra.",S.city?L("phường"):L("xã")),ch:[
    {t:L("Đón đoàn, trình giấy tờ"),chance:()=>[[L("Cơ bản"),.25],[L("Giấy ATTP"),S.docs.attp.st==='done'?.35:0],[L("Khám sức khoẻ"),S.docs.health.st==='done'?.2:0]],fx:ok=>{ if(ok) return L("Mẫu xét nghiệm đạt. Nguyên nhân là món ăn ở chỗ khác. Bạn được minh oan."); const f=S.city?15e6:7e6; S.cash-=f; S.tot.fines+=f; S.sick=3; return L("Thiếu giấy, mẫu nước đá không đạt. Phạt {0}, đình chỉ 3 ngày.",tr(f))+lesson('food',L("vệ sinh và giấy tờ ATTP là bảo hiểm của quán.")); }},
    {t:L("Đóng cửa trốn đoàn"),fx:()=>{ S.sick=4; S.rep-=.15; return L("Quán đóng im ỉm 4 ngày. Tin đồn càng lan rộng."); }}]})},
  {id:'mevien',once:1,w:()=>1,c:()=>({t:L("Mẹ nhập viện"),txt:L("Em gái gọi lúc nửa đêm: mẹ bị tai biến nhẹ, đang nằm viện huyện. Viện phí, thuốc men, người chăm..."),ch:[
    {t:L("Đóng quán 1 tuần về chăm mẹ"),cost:()=>5e6*LK(),allowDebt:1,fx:()=>{ S.sick=7; S.fam+=18; S.energy+=5; return L("Một tuần bên giường bệnh. Mẹ nắm tay bạn suốt."); }},
    {t:L("Gửi 12 triệu, thuê người chăm"),cost:()=>12e6*LK(),allowDebt:1,fx:()=>{ S.fam+=3; return L("Mẹ được chăm chu đáo. Nhưng mẹ cứ hỏi \"sao con không về\"."); }},
    {t:L("Nhờ em lo, hứa gửi tiền sau"),fx:()=>{ S.fam-=18; addDebt({k:'fam',n:L("Nợ em gái tiền viện phí"),owe:8e6,due:wkNo()+5}); return L("Em gái nghỉ làm chăm mẹ, ứng trước 8 triệu."); }}]})},
  {id:'chunha',once:1,w:()=>S.city?1.2:0,c:()=>({t:L("Chủ nhà đòi lại mặt bằng"),txt:L("Chủ nhà bán nhà, yêu cầu bạn dọn đi trong 30 ngày. Tiền cọc \"tính sau\"."),ch:[
    {t:L("Thương lượng ở tiếp, chịu tăng giá thuê 30%"),chance:()=>[[L("Cơ bản"),.35],[L("Hợp đồng công chứng"),S.docs.hdt.st==='done'?.35:0]],fx:ok=>{ if(ok){ S.rent=Math.round(S.rent*1.3); return L("Chủ mới đồng ý cho thuê tiếp, giá {0}/tháng.",tr(S.rent)); } S.cash-=12e6*LK(); S.fans*=.5; S.sick=4; return L("Không thương lượng được. Dọn sang mặt bằng khác gần đó: mất 12 triệu và một nửa khách quen.{0}",lesson('contract',L("hợp đồng thuê phải công chứng, ghi rõ điều khoản trả cọc."))); }},
    {t:L("Dọn đi ngay, đòi cọc"),chance:()=>[[L("Cơ bản"),.3],[L("Hợp đồng công chứng"),S.docs.hdt.st==='done'?.5:0]],fx:ok=>{ S.cash-=8e6*LK(); S.fans*=.55; S.sick=3; if(!ok){ S.deposit=0; return L("Chuyển sang chỗ mới mất 8 triệu, và chủ cũ quỵt luôn tiền cọc.{0}",lesson('contract',L("hợp đồng thuê phải công chứng, ghi rõ điều khoản trả cọc."))); } return L("Lấy lại được cọc, chuyển sang chỗ mới mất 8 triệu."); }}]})},
  {id:'giaitoa',w:()=>S.city?1:0,c:()=>({t:L("Chiến dịch dẹp vỉa hè"),txt:L("Phường ra quân lập lại trật tự vỉa hè. Đội trật tự đô thị đi từng nhà."),ch:[
    {t:L("Dọn hết bàn ghế vào trong"),fx:()=>{ S.walk=false; addBoost(.8,2,L("dẹp vỉa hè")); return L("Quán chật hẳn, khách ngồi chen chúc hai tuần."); }},
    {t:L("Kệ, ra giữ đồ khi đội tới"),chance:()=>[[L("Cơ bản"),.35]],fx:ok=>{ if(ok) return L("Nhanh tay dọn kịp, không bị gì."); S.cash-=5e6*LK(); S.tot.fines+=5e6; return L("Bị lập biên bản, thu 6 bộ bàn ghế. Phạt và chuộc đồ hết 5 triệu."); }}]})},
  {id:'chuoilon',w:()=>S.city?1.2:.6,c:()=>({t:S.city?L("Chuỗi cafe lớn mở ngay đối diện"):L("Có quán cafe mới mở đầu xóm"),txt:S.city?L("Biển hiệu sáng choang, máy lạnh, wifi mạnh, khai trương giảm 50%."):L("Nhà ông Tám sửa lại sân, mở quán cafe có karaoke, bán 12K."),ch:[
    {t:L("Tặng thẻ tích điểm cho khách quen"),cost:()=>1e6*LK(),fx:()=>{ S.comp+=.12; S.fans+=12; return L("Khách quen được giữ chân phần nào."); }},
    {t:L("Không làm gì"),fx:()=>{ S.comp+=.2; return L("Lượng khách vãng lai giảm hẳn."); }}]})},
  {id:'nvbotron',w:()=>S.staff>0?1:0,c:()=>({t:L("Người phụ ôm tiền bỏ trốn"),txt:L("Người phụ mới không đi làm. Két thiếu 4 triệu, kèm điện thoại bán hàng."),ch:[
    {t:L("Báo công an"),chance:()=>[[L("Cơ bản"),.3],[L("Có camera"),S.flags.cam?.35:0],[L("Hợp đồng lao động"),S.docs.hdld.st==='done'?.15:0]],fx:ok=>{ if(ok) return L("Công an triệu tập, người đó trả lại tiền."); S.cash-=4e6*LK(); S.staff=Math.max(0,S.staff-1); return L("Không tìm ra. Mất 4 triệu và một người phụ.{0}",lesson('staff',L("thuê người phải có hợp đồng, giấy tờ tuỳ thân."))); }},
    {t:L("Đăng Facebook bóc mặt"),fx:()=>{ S.cash-=4e6*LK(); S.staff=Math.max(0,S.staff-1); S.rep-=.03; return L("Bài đăng nhiều lượt chia sẻ nhưng tiền không về."); }}]})},
  {id:'lu',w:()=>{ const m=dateOf(S.day).getMonth(); return m>=8&&m<=11?1.2:.3; },c:()=>({t:S.city?L("Triều cường, đường ngập nửa bánh xe"):L("Lũ về, nước ngập sân vườn"),txt:L("Mưa ba ngày liền. Nước tràn vào tận quầy."),ch:[
    {t:L("Kê đồ lên cao, nghỉ 3 ngày"),fx:()=>{ S.sick=3; S.cash-=1.5e6*LK(); return L("Mất 3 ngày bán và 1,5 triệu nguyên liệu ướt."); }},
    {t:L("Cố bán, ai tới thì bán"),chance:()=>[[L("Cơ bản"),.4]],fx:ok=>{ if(ok){ S.fans+=10; return L("Vài khách lội nước tới, cảm động vì quán vẫn mở."); } S.cash-=5e6*LK(); S.sick=2; return L("Nước vô máy pha, chập mạch. Sửa 5 triệu."); }}]})},
  {id:'dich',w:()=>.5,c:()=>({t:L("Dịch cúm lan nhanh"),txt:L("Cúm A bùng phát, trường học cho nghỉ, người ta ngại ra đường."),ch:[
    {t:L("Chuyển sang bán mang đi, giao tận nhà"),cost:()=>1e6*LK(),fx:()=>{ S.del=true; addBoost(.75,2,L("dịch")); return L("Doanh thu giảm nhưng vẫn trụ được."); }},
    {t:L("Bán như thường"),fx:()=>{ addBoost(.55,2,L("dịch")); S.energy-=15; return L("Quán vắng hoe, bạn còn bị lây cúm."); }}]})},
  {id:'cuop',w:()=>!S.bought&&!S.flags.soldOld&&S.ph.trade>0?.6:0,c:()=>({t:L("Cướp giật điện thoại!"),txt:L("Đang đứng nghe điện thoại trước quán, một chiếc xe máy lao tới giật phăng chiếc iPhone 11 cũ."),ch:[
    {t:L("Đuổi theo"),chance:()=>[[L("Cơ bản"),.25],tiredF()],fx:ok=>{ if(ok) return L("Bạn tóm được đuôi xe, tên cướp bỏ máy chạy mất."); S.flags.soldOld=1; S.ph.trade=0; S.energy-=20; S.sick=2; return L("Bạn té trầy cả người. Máy mất, giờ lên đời phải trả đủ tiền."); }},
    {t:L("Để nó đi, an toàn là trên hết"),fx:()=>{ S.flags.soldOld=1; S.ph.trade=0; return L("Mất máy cũ — mất luôn tiền thu cũ đổi mới."); }}]})},
  {id:'tiktok',w:()=>1.3,c:()=>{ const fx=layoutFx(), base=[[L("Vườn đẹp"),clamp(fx.beauty*.012,-.15,.25)],[L("Độ sạch"),(S.clean-60)/200],repF(.3),[L("Máy pha"),(EQ().q-1)*.06]];
    return {t:L("TikToker 500K follow ghé quán"),txt:L("Một TikToker chuyên review đồ uống vừa bước vào, dựng điện thoại quay một vòng quán. Clip sẽ lên trong tối nay — khen hay chê là tuỳ những gì bạn ấy thấy."),ch:[
      {t:L("Phục vụ bình thường"),chance:()=>[[L("Cơ bản"),.3],...base],fx:ok=>tiktokRes(ok)},
      {t:L("Mời miễn phí, kể chuyện quán"),cost:()=>3e5*LK(),chance:()=>[[L("Cơ bản"),.42],...base],fx:ok=>tiktokRes(ok)},
      {t:L("Xin bạn ấy đừng quay"),fx:()=>L("Bạn ấy hơi khó chịu, cất máy, uống xong đi về.")}]}; }},
  {id:'vesinh',w:()=>S.clean<50?2.2:.4,c:()=>({t:L("Gián bò trên quầy!"),txt:L("Giữa giờ đông khách, một con gián bò ngang quầy pha chế. Bàn bên cạnh rút điện thoại ra chụp."),ch:[
    {t:L("Xin lỗi, đổi đồ uống, miễn tiền cả bàn"),cost:()=>2e5*LK(),chance:()=>[[L("Cơ bản"),.5],repF(.3)],fx:ok=>{ if(ok){ S.rep-=.02; return L("Khách thông cảm, không đăng lên mạng."); } S.rep-=.08; seed(1,'fixreview'); return L("Khách vẫn đăng ảnh lên nhóm review của khu."); }},
    {t:L("Đóng cửa 1 ngày tổng vệ sinh, phun thuốc"),cost:()=>1.5e6*LK(),fx:()=>{ S.sick=Math.max(S.sick,1); S.clean=95; S.rep+=.02; return L("Quán sạch bong. Bạn treo bảng \"Đã phun khử trùng\" trước cửa.{0}",lesson('clean',L("sạch sẽ là thứ khách thấy đầu tiên."))); }},
    {t:L("Chối: \"Gián nhà bên bò qua\""),fx:()=>{ S.rep-=.12; seed(1,'fixreview'); return L("Câu trả lời bị quay lại, thành trò cười trên mạng."); }}]})},
  {id:'trungso',once:1,w:()=>.25,c:()=>({t:L("Trúng số!"),txt:L("Tờ vé số mua giúp bà cụ hôm trước trúng giải tư."),ch:[
    {t:L("Nhận 10 triệu"),fx:()=>{ S.cash+=10e6; return L("Cả xóm kéo tới chúc mừng. Bạn khao mỗi người một ly."); }}]})},
  {id:'khachsop',w:()=>S.rep>1.05?.8:0,c:()=>({t:L("Khách sộp đặt hàng định kỳ"),txt:L("Một văn phòng gần đó muốn đặt cafe mỗi sáng cho 30 nhân viên, thanh toán cuối tháng."),ch:[
    {t:L("Nhận, giao mỗi sáng"),chance:()=>[[L("Cơ bản"),.6],[L("Người phụ"),Math.min(S.staff,2)*.1],tiredF()],fx:ok=>{ if(ok){ addBoost(1.2,6,L("khách sỉ")); S.fans+=20; return L("Mỗi sáng 30 ly đều đặn. Dòng tiền ổn định hơn hẳn."); } S.energy-=10; return L("Giao trễ hai buổi, họ huỷ hợp đồng."); }},
    {t:L("Từ chối, sợ không kham nổi"),fx:()=>L("Họ chuyển sang đặt quán khác.")}]})},
  {id:'doidong',w:()=>S.comp>.3?.6:0,c:()=>({t:L("Đối thủ đóng cửa"),txt:L("Quán cạnh tranh mạnh nhất gần bạn treo bảng \"SANG NHƯỢNG\"."),ch:[
    {t:L("Tiếp nhận khách của họ, tặng ly đầu tiên"),cost:()=>5e5*LK(),fx:()=>{ S.comp=Math.max(0,S.comp-.2); S.fans+=15; return L("Khách bên kia chuyển dần sang bạn."); }}]})}
];
function pickTwist(){
  const w=wkNo(), pool=TWISTS.filter(t=>fitsNow(t.id)&&t.w()>0&&!(t.once&&seenN('cntT',t.id))&&!(S.seenT[t.id]!=null&&w-S.seenT[t.id]<12)); if(!pool.length) return null;
  const wt=t=>t.w()/(1+seenN('cntT',t.id)*1.2);
  let x=R()*pool.reduce((s,t)=>s+wt(t),0), t=pool[0]; for(const p of pool){ x-=wt(p); if(x<=0){ t=p; break; } }
  S.seenT[t.id]=w; S.cntT=S.cntT||{}; S.cntT[t.id]=seenN('cntT',t.id)+1; const c=t.c(); c.tag='twist'; return c;
}

/* ---- kết thúc: chấm điểm 1–20 ---- */
function endScore(){
  const bk=S.over==='bankrupt', sold=S.over==='sold', p=progress(), owe=debtSum()+(S.inst?S.inst.left*S.inst.amt:0), days=S.bought?S.boughtDay:S.day, mo=days/30;
  const lessons=Object.values(S.lessons).reduce((s,x)=>s+x,0), eAvg=S.eN?S.eSum/S.eN:S.energy;
  const parts=[
    [L("Tốc độ lên đời"),.3,S.bought?clamp(1-(mo-3)/16,.1,1)*(S.inst?.85:1):clamp(S.cash/goal(),0,1)*.3,S.bought?L("{0} ngày (~{1} tháng){2}",days,mo.toFixed(1),S.inst?L(", trả góp"):''):L("chưa cầm được máy")],
    [L("Tài chính"),.25,bk?0:clamp((p+40e6)/110e6,0,1)*clamp(1-owe/120e6,.15,1),L("lãi ròng {0}{1}",tr(p),owe?L(", còn nợ {0}",tr(owe)):'')],
    [L("Sức khoẻ"),.15,clamp(eAvg/90-(S.tot.sickN||0)*.12,0,1),L("sức trung bình {0}, gục ngã {1} lần",Math.round(eAvg),S.tot.sickN||0)],
    [L("Gia đình"),.15,clamp(S.fam/90,0,1),L("thân thiết {0}/100{1}{2}",Math.round(S.fam),S.flags.married?L(", đã cưới"):'',S.flags.breakup?L(", đã chia tay"):'')],
    [L("Uy tín"),.1,clamp((S.rep-.6)/.8,0,1)*.5+clamp(S.fans/150,0,1)*.5,L("uy tín {0}%, {1} khách quen",Math.round(S.rep*100),Math.round(S.fans))],
    [L("Bài học"),.05,clamp(lessons*.15,0,1),L("{0} bài học",lessons)]
  ];
  let x=parts.reduce((s,q)=>s+q[1]*q[2],0); if(sold) x=Math.min(1,x+.05);
  let score=clamp(Math.round(1+19*Math.pow(x,1.25)),1,20); if(bk) score=Math.min(score,4);
  const label=bk?L("Phá sản"):score<=6?L("Lận đận"):score<=10?L("Bình bình"):score<=14?L("Làm ăn khấm khá"):score<=17?L("Giỏi giang"):L("Đổi đời");
  const q=[];
  if(bk&&S.bought) q.push(L("Cầm máy mới chưa ấm tay đã phải bán đi trả nợ."));
  if(bk) q.push(L("Quán dẹp, nợ còn đó. Nhưng người ta vẫn nói: thất bại lần đầu là học phí."));
  if(S.bought&&S.fam<35) q.push(L("Cầm iPhone mới trên tay, mà chẳng biết gọi cho ai để khoe."));
  if(S.bought&&owe>30e6) q.push(L("Máy mới bóng loáng, tin nhắn đòi nợ hiện lên cũng rõ nét hơn."));
  if(S.bought&&S.fam>=60&&owe<10e6) q.push(L("Chiếc điện thoại đầu tiên mua bằng mồ hôi của mình. Mẹ là người đầu tiên được gọi video."));
  if(S.over==='timeout') q.push(L("Hai năm trôi qua, quán vẫn sáng đèn nhưng giấc mơ lên đời còn dang dở."));
  if(sold) q.push(L("Bán quán khi đang đông khách — biết dừng đúng lúc cũng là một tài."));
  if((S.tot.sickN||0)>=2) q.push(L("Gục ngã tại quầy hơn một lần. Không ly cafe nào đáng đổi bằng sức khoẻ."));
  if(S.city) q.push(L("Từ gốc xoài ở quê lên mặt bằng giữa Sài Gòn — đã dám đi là đã khác người."));
  return {score,label,parts,q:q.slice(0,3),days};
}
function showEnding(){
  sfx(S.over==='bought'?'fanfare':'bad'); buzz(S.over==='bought'?[50,30,50,30,160]:[120,60,200]);
  closeWin(); per=null; pend=null; setBusy(false); const r=endScore(), bk=S.over==='bankrupt', bought=S.over==='bought';
  const head=bought?L("Lên đời sau {0} ngày",r.days):bk?(S.bought?L("Lên đời rồi… phá sản"):L("Phá sản")):S.over==='sold'?L("Bán quán"):L("Hết 2 năm");
  const sub=bought?L("{0} · {1} · ngày {2}",phoneName(),LOC().t,dstr(r.days)):bk?S.overWhy:L("{0} · tháng {1}",LOC().t,monthNo());
  win(head,`${bought?'<canvas id="phoneCv" class="phone" width="200" height="130"></canvas>':''}
    <div class="endhead ${bk?'bad':''}"><div class="bigwin" style="${bk?'color:var(--red)':''}">${r.score}/20</div><div><b>${r.label}</b><div class="sm">${sub}</div></div></div>
    ${r.q.map(t=>`<p class="quote">“${t}”</p>`).join('')}
    <div class="kv">${r.parts.map(([n,w,v,d])=>`<div><span class="sm">${n} · ${Math.round(w*100)}%</span><b>${Math.round(v*100)}%</b><span class="sm">${d}</span></div>`).join('')}</div>
    <div class="log">${S.log.slice(0,40).map(x=>`<div><span class="muted">${dstr(x.day)}</span><span class="${x.cls}">${x.msg}</span></div>`).join('')}</div>
    <button class="wbtn go" id="restartBtn">${L("Chơi ván mới")}</button>`,false);
  if(bought) drawPhone($('phoneCv'));
}
