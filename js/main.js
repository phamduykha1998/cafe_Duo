// Nút điều khiển, sửa vườn, ngắm vườn, icon, lưu game, khởi động
/* --- vòng ngày --- */
function addAgg(agg,r,multi){
  if(agg.from===null) agg.from=r.day; agg.to=r.day; agg.n++; agg.cups+=r.cups; agg.del+=r.del; agg.lost+=r.lost;
  // phần tử thứ 3 (nếu có) là tên gộp khi cộng nhiều ngày: 'Bán 52 ly…' → 'Doanh thu bán hàng', 'Góp hụi kỳ 3/10' → 'Góp hụi'
  r.lines.forEach(([k,v,grp])=>{ const key=multi&&grp?grp:k; agg.lines[key]=(agg.lines[key]||0)+v; });
  r.ev.forEach(x=>agg.ev.push([r.day,...x]));
}
const newAgg=()=>({from:null,to:null,lines:{},ev:[],cups:0,del:0,lost:0,n:0});
function setBusy(b){ busy=b; hudSlow(); }
function enterEdit(){ if(!S||S.over) return;
  if(play){ wantEdit=true; return toast(L("Đang giữa ngày bán · hết ngày sẽ mở Vườn để sắp xếp")); }
  closeWin(); thumbs(); edit={sel:null,hover:null}; clock=13; $('cat').hidden=false; hudSlow();
  $('catRow').innerHTML=CAT.map(c=>`<button class="ci" data-cat="${c.id}"><img src="${THUMBS[c.id]}" alt=""><span>${c.n}</span><em>${tr(c.cost)}${c.seats?L(" · {0} chỗ",c.seats):''}${c.beauty?' · ✿'+c.beauty:''}</em></button>`).join('');
  updCat(); toast(L("Kéo thả để dời đồ, chọn món để mua thêm")); }
function updCat(){ if(!edit) return; document.querySelectorAll('.ci').forEach(b=>b.classList.toggle('sel',edit.sel===b.dataset.cat)); $('bDel').classList.toggle('sel',edit.sel==='del');
  const fx=layoutFx(); $('catInfo').textContent=L("Tiền mặt {0} · {1} · đẹp +{2}% khách · dỡ bỏ hoàn 50%",tr(S.cash),fxText(fx),Math.round(clamp(fx.beauty*.012,-.15,.3)*100)); }
$('catRow').onclick=e=>{ const b=e.target.closest('[data-cat]'); if(!b) return; edit.sel=edit.sel===b.dataset.cat?null:b.dataset.cat; updCat(); };
$('bDel').onclick=()=>{ edit.sel=edit.sel==='del'?null:'del'; updCat(); };
$('bDone').onclick=()=>{ edit=null; $('cat').hidden=true; clock=IDLE_CLOCK; hudSlow(); if(paused) toast(L("Đang dừng · bấm ▶ để chạy tiếp")); };
$('bEdit').onclick=enterEdit;
document.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>setTime(b.dataset.t==='pause'||b.dataset.t==='end'?b.dataset.t:+b.dataset.t));
$('bBuy').onclick=buyWin;
const TGN={tidy:L("Dọn dẹp kỹ"),open:L("Mở cửa"),del:L('Ship Zalo'),walk:L("Ghế ra đường"),music:L("Loa nhạc"),ads:L("Quảng cáo FB"),tik:L('Quay TikTok')};
document.querySelectorAll('[data-tg]').forEach(b=>b.onclick=()=>{ const k=b.dataset.tg; S[k]=!S[k]; save(); hudSlow();
  toast(TGN[k]+': '+(S[k]?L("bật"):L("tắt"))+(busy?L(" · áp dụng từ ngày mai"):''),S[k]?'good':''); });
document.querySelectorAll('[data-step]').forEach(b=>b.onclick=()=>{ const k=b.dataset.step, d=+b.dataset.d;
  if(k==='price'){ S.price=clamp(S.price+d,8000,45000); toast(L("Giá {0} · dân quanh đây quen ~{1}",kk(S.price),kk(refPrice()))+(busy?L(" · từ mai"):'')); }
  else if(k==='rest'){ S.rest=clamp(S.rest+d,0,2); toast(L("Nghỉ {0} ngày/tuần · hồi sức, gần gia đình, nhưng mất doanh thu những ngày đó",S.rest)); }
  else { S.staff=clamp(S.staff+d,0,5); toast(L("{0} người phụ · {1}/ngày",S.staff,vnd(S.staff*8*(S.city?25000:WAGE)*(S.wageMul||1)))+(S.staff&&S.docs.hdld.st!=='done'?L(" · nhớ làm hợp đồng lao động"):'')+(busy?L(" · từ mai"):'')); }
  save(); hudSlow(); });
/* thanh công cụ: quầy, sổ, chế độ ngắm vườn, icon pixel */
let popOpen=false, uiHidden=false;
$('bOps').onclick=()=>{ popOpen=!popOpen; hudSlow(); };
$('popX').onclick=()=>{ popOpen=false; hudSlow(); };
$('hOpen').onclick=()=>{ if(!S) return; S.open=!S.open; save(); hudSlow(); toast((S.open?L("Mở cửa bán"):L("Nghỉ bán"))+(busy?L(" · áp dụng từ ngày mai"):''),S.open?'good':''); };
const HKEY='cafe-len-pho-hud'; let hudOpen=''; try{ hudOpen=localStorage.getItem(HKEY)||''; }catch(e){}
function hudFold(){ [['hL','hSumL','L'],['hR','hSumR','R']].forEach(([p,b,k])=>{ const on=hudOpen.includes(k); $(p).classList.toggle('open',on); $(b).setAttribute('aria-expanded',on); }); }
[['hSumL','L'],['hSumR','R']].forEach(([b,k])=>$(b).onclick=()=>{ hudOpen=hudOpen.includes(k)?hudOpen.replace(k,''):hudOpen+k; try{ localStorage.setItem(HKEY,hudOpen); }catch(e){} hudFold(); place(); });
hudFold();
$('bSo').onclick=()=>openPanel(soTab);
// ngắm vườn: ẩn bảng và nút, chỉ chừa dải mỏng (ngày · tiền · dừng); chạm bất cứ đâu trên cảnh để hiện lại
const setHidden=h=>{ uiHidden=h; if(h){ popOpen=false; toast(L("Chạm vào cảnh để hiện lại bảng và nút")); } hudSlow(); };
$('bLook').onclick=()=>setHidden(true); $('pkShow').onclick=()=>setHidden(false); $('pkPause').onclick=()=>setTime('pause');
let peekTap=false;
cv.addEventListener('pointerdown',ev=>{ if(uiHidden&&!edit&&!sev){ peekTap=true; ev.stopImmediatePropagation(); setHidden(false); } },{capture:true});
cv.addEventListener('pointerup',ev=>{ if(peekTap){ peekTap=false; ev.stopImmediatePropagation(); } },{capture:true});
addEventListener('keydown',e=>{ if(!S||e.ctrlKey||e.metaKey||e.altKey) return;
  if(e.key==='h'||e.key==='H'){ if($('veil').hidden&&!edit) setHidden(!uiHidden); }
  else if(e.key===' '){ if($('veil').hidden&&$('rush').hidden&&!edit){ e.preventDefault(); setTime('pause'); } }
  else if(e.key==='Escape'){ if(!$('veil').hidden){ if(!$('wClose').hidden) closeWin(); } else if(popOpen){ popOpen=false; hudSlow(); } else if(uiHidden) setHidden(false); } });
cv.addEventListener('pointerdown',()=>{ if(popOpen&&!edit){ popOpen=false; hudSlow(); } });
const ICP={k:'#3b2516',w:'#fff6dd',l:'#b89a6a',r:'#c4473a',g:'#3f8a42',G:'#7fc060',b:'#7a4a2b',d:'#a8743f',y:'#e6d29a',s:'#f2c9a4',p:'#c4473a',c:'#6b4329',W:'#ffffff',P:'#f08aa8',V:'#8e5aa8',B:'#4f86c6'};
const ICONS={
  tree:['...gggggg...','..gGGGGggg..','.gGGGGGGggg.','.gGGGGGgggg.','ggGGGGggggg.','.ggGGgggggg.','..gggggggg..','....kbbk....','.....bb.....','.....bb.....','..dddddddd..','.dddddddddd.'],
  paper:['.kkkkkkk....','.kwwwwwwk...','.kwllllwwk..','.kwwwwwwwwk.','.kwllllllwk.','.kwwwwwwwwk.','.kwllllllwk.','.kwwwwwrrwk.','.kwlllrrrrk.','.kwwwwrrrrk.','.kwwwwwrrwk.','.kkkkkkkkkk.'],
  folk:['.....kk.....','....kyyk....','...kyyyyk...','..kyyyyyyk..','.kkkkkkkkkk.','...kssssk...','...skssks...','...ssssss...','....kssk....','..kppppppk..','.kppppppppk.','.kppppppppk.'],
  book:['............','.kkkkk.kkkkk','.kwwwwkwwwwk','.kwllwkwllwk','.kwwwwkwwwwk','.kwllwkwllwk','.kwwwwkwwwwk','.kwllwkwllwk','.kwwwwkwwwwk','.kkkkkkkkkkk','.rrrrrrrrrrr','............'],
  cup:['...l..l.....','....l..l....','...l..l.....','............','.kkkkkkkk...','.kwwwwwwkkk.','.kccccccwk.k','.kccccccwk.k','.kccccccwkk.','..kccccwk...','kkkkkkkkkkk.','.kddddddddk.'],
  ff:['............','.k....k.....','.kk...kk....','.kck..kck...','.kcck.kcck..','.kccckkccck.','.kccckkccck.','.kcck.kcck..','.kck..kck...','.kk...kk....','.k....k.....','............'],
  play:['............','...k........','...kk.......','...kWk......','...kWWk.....','...kWWWk....','...kWWWk....','...kWWk.....','...kWk......','...kk.......','...k........','............'],
  phone:['...kkkkkk...','...kkkkkk...','...kPPPPk...','...kPPPPk...','...kPVVPk...','...kPVVPk...','...kVVVVk...','...kVVVVk...','...kVBBVk...','...kBBBBk...','...kkWWkk...','...kkkkkk...'],
  eye:['............','............','....kkkk....','..kkwwwwkk..','.kwwwkkwwwk.','kwwwkBBkwwwk','kwwwkBBkwwwk','.kwwwkkwwwk.','..kkwwwwkk..','....kkkk....','............','............']
};
ICONS.bean=['............','....kkkk....','...kddddk...','..kdddbddk..','..kddbdddk..','.kdddbddddk.','.kddbdddddk.','..kdbddddk..','..kdbdddk...','...kddddk...','....kkkk....','............'];
ICONS.dots=['............','............','............','............','.kkk.kkk.kkk','.kdk.kdk.kdk','.kkk.kkk.kkk','............','............','............','............','............'];
ICONS.pause=ICONS.play.map((r,i)=>i===0||i===11?r:i===1||i===10?'..kkk..kkk..':'..kWk..kWk..');
ICONS.end=ICONS.play.map((r,i)=>i>0&&i<11?r.slice(1,8)+'.kk..':r);
ICONS.eyeoff=ICONS.eye.map((r,i)=>[...r].map((ch,x)=>i>0&&i<11&&(x===i||x===i+1)?'r':ch).join(''));
function icoSVG(n){ let r=''; ICONS[n].forEach((row,y)=>[...row].forEach((ch,x)=>{ if(ch!=='.') r+=`<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${ICP[ch]}"/>`; })); return `<svg viewBox="0 0 12 12" shape-rendering="crispEdges" aria-hidden="true">${r}</svg>`; }
document.querySelectorAll('[data-ico]').forEach(i=>i.innerHTML=icoSVG(i.dataset.ico));
function reset(){ per=null; qd=null; pend=null; play=null; sev=null; $('sevBar').hidden=true; cardQ=[]; cardCb=null; curCard=null; setBusy(false); paused=false; toEnd=false; wantEdit=false; dawn=false;
  edit=null; uiHidden=false; popOpen=false; $('peek').hidden=true; $('cat').hidden=true; S=null; try{localStorage.removeItem(KEY)}catch(e){} $('hud').hidden=true; $('dock').hidden=true; $('ctl').hidden=true; ikey=''; showSetup(); }
function save(){ try{ if(S) localStorage.setItem(KEY,JSON.stringify(S)); }catch(e){} }
function boot(){ if(!S.layout) S.layout=JSON.parse(JSON.stringify(DEFAULT_LAYOUT)); if(S.cart==null) S.cart=1;
  // bản lưu cũ: đồ nằm đè lên ao/luống rau/góc rửa thì dỡ ra và hoàn tiền
  S.layout=S.layout.filter(o=>{ const it=catOf(o.id); if(!it) return false; for(let y=o.r;y<o.r+it.h;y++) for(let x=o.c;x<o.c+it.w;x++) if(decorCell(x,y)){ S.cash+=it.cost; return false; } return true; });
  if(S.weeds) S.weeds=S.weeds.filter(w=>!decorCell(w.c,w.r));
  ikey=''; render(); }
function start(){
  initPets(); requestAnimationFrame(frame);
  try{ const raw=localStorage.getItem(KEY); if(raw){ S=JSON.parse(raw); boot(); if(S.over) return showEnding();
    startMonth(true); hudSlow(); return toast(L("Đang dừng · bấm ▶ để chạy tiếp")); } }catch(e){}
  showSetup();
}
// đổi ngôn ngữ (js/i18n.js): vẽ lại những gì đang hiện trên màn hình
document.addEventListener('langchange',()=>{
  PXF=getComputedStyle(document.documentElement).getPropertyValue('--px').trim()||'monospace';
  tKey=''; bgKey=''; setMute(MUTE); if(S){ hudSlow(); hud(); }
  if(!$('veil').hidden){ const y=$('wBody').scrollTop; if(panel==='setup') showSetup(); else if(panel) openPanel(panel); $('wBody').scrollTop=y; }
});
// các bảng dữ liệu có chữ được dịch lúc nạp trang
i18nInit([PHONE,CAPS,LOCS,EQS,DOCS,SEASON_N,VIL,TIPS,STORY,TAGS,CAT,SEVS,SEAS,DRINKS,MG,CITY_GUEST,TEMPS,BEANS,ASKS,CB_TABS,COFFEE_BOOK,SO_TABS,TGN]);
start();
