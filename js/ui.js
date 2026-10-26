// HUD, cửa sổ, màn tạo quán, cách chơi, Giấy tờ, Sổ, trò chuyện với dân làng
/* ================= GIAO DIỆN ================= */
let toastT=null;
function toast(txt,cls){ const t=$('toast'); t.textContent=txt; t.className='toast plate '+(cls||'')+(popOpen?' up':''); t.hidden=false; clearTimeout(toastT); toastT=setTimeout(()=>t.hidden=true,2800); }
function missingDocs(){ return DOCS.filter(d=>d.req&&S.docs[d.id].st!=='done'&&!(d.id==='hdld'&&S.staff===0)).length; }
function hud(){
  if(!S) return;
  const day=play?play.day:S.day, dt=dateOf(day);
  const hh=Math.floor(clock), mm=Math.floor((clock-hh)*4)*15, hm=`${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}`;
  $('hClock').textContent=play?hm:L("Tháng {0}",monthNo()+1);
  if(uiHidden){ $('pkDate').textContent=`${dm(dt)}${play?' · '+hm:''}`; $('pkCash').textContent=tr(S.cash); }
  tUI();
  $('hDate').textContent=L("Ngày {0} · {1} · {2}",day+1,dt.toLocaleDateString(LOCALE),SEASON_N[seasonOf(dt)]);
  $('hShort').textContent=`${dm(dt)} · ${SEASON_N[seasonOf(dt)]}`;
  const o=$('hOpen'), miss=missingDocs(), open=isOpen();
  o.className='chip '+(open?(miss?'warn':'on'):'off'); o.textContent=open?(miss?L("Mở · thiếu {0} giấy",miss):(rain?L("Đang mở · mưa"):L("Đang mở"))):L("Nghỉ bán");
  if(S.city){ $('hWeed').textContent=L("Cạnh tranh {0}%",Math.round(S.comp*100)); $('hWeed').className='chip '+(S.comp>.5?'warn':'weed'); } else { const wn=S.weeds.length; $('hWeed').textContent=L("Cỏ dại {0}",wn); $('hWeed').className='chip '+(wn>18?'warn':'weed'); }
  const en=Math.round(S.energy); $('hSuc').textContent=L("Sức {0} · Sạch {1}",en,Math.round(S.clean)); $('hSuc').className='chip '+(en<30||S.clean<40?'tired':'ok');
  // chấm trạng thái khi thu gọn: xanh = đang bán ổn, xám = nghỉ, đỏ = có việc cần để ý (thiếu giấy, kiệt sức, bẩn, cỏ/đối thủ nhiều)
  const alarm=(open&&miss)||en<30||S.clean<40||(S.city?S.comp>.5:S.weeds.length>18);
  $('hDot').className='sdot '+(alarm?'warn':open?'on':''); $('hDot').title=alarm?L("Có việc cần để ý — bấm để xem"):open?L("Đang mở bán"):L("Nghỉ bán");
}
function hudSlow(){
  if(!S) return;
  $('hCash').textContent=tr(S.cash); $('hCash').style.color=S.cash<5e6?'var(--red)':'';
  { const en=clamp(Math.round(S.energy),0,100), b=$('hHpBar'); $('hHp').textContent=L("❤ Sức khoẻ {0}",en); b.style.width=en+'%'; b.className=en<30?'low':en<55?'mid':'';
    $('hCap').textContent=L("Vốn {0}",tr(S.start)); const fl=S.flow&&S.flow.length?S.flow.reduce((t,x)=>t+x,0)/S.flow.length*MONTH_D:null, fe=$('hFlow');
    fe.textContent=fl==null?L("Dòng tiền —"):L("{0}/tháng",((fl>=0?'▲ +':'▼ ')+tr(fl))); fe.className=fl==null?'':fl>=0?'pos':'neg'; }
  $('hRep').textContent=(S.rep*100).toFixed(0)+'%'+(debtSum()?L(" · Nợ {0}",tr(debtSum())):'')+L(" · Quen {0}",Math.round(S.fans));
  if(S.bought){ $('hGoalT').textContent=phoneName()+' ✓'; if(S.endDay){ $('hGoal').textContent=L("còn {0} ngày trụ nợ",Math.max(0,S.endDay-S.day)); $('hBar').style.width=clamp((S.day-S.boughtDay)/56*100,0,100)+'%'; } else { $('hGoal').textContent=S.inst?L("Còn góp {0} kỳ",S.inst.left):L("Trả xong"); $('hBar').style.width='100%'; } $('hGoalBox').title=L("Đã lên đời"); }
  else { $('hGoalT').textContent=phoneName(); $('hGoal').textContent=`${tr(Math.max(0,S.cash))} / ${tr(goal())}`; $('hBar').style.width=clamp(S.cash/goal()*100,0,100)+'%'; $('hGoalBox').title=L("Tiền mặt so với giá lên đời (giá máy − thu cũ). Tiền vay cũng tính, nhưng nợ sẽ bị trừ điểm cuối game."); }
  $('hInfo').textContent=L("{0}/ly · {1} phụ · nghỉ {2}",kk(S.price),S.staff,S.rest); $('cRest').textContent=S.rest; document.querySelector('[data-tg=del]').textContent=S.city?L("App giao đồ"):L('Ship Zalo');
  const miss=missingDocs(); $('docDot').hidden=!miss; $('docDot').textContent=miss;
  $('bBuy').hidden=!(!S.bought&&!S.over&&S.cash>=goal());
  $('cPrice').textContent=Math.round(S.price/1000)+'K'; $('cStaff').textContent=S.staff;
  document.querySelectorAll('[data-tg]').forEach(b=>b.classList.toggle('on',!!S[b.dataset.tg]));
  if(edit) popOpen=false;
  $('hud').hidden=!!edit||uiHidden; $('dock').hidden=!!edit||uiHidden; $('ctl').hidden=!popOpen||uiHidden; $('peek').hidden=!uiHidden||!!edit;
  $('bOps').classList.toggle('on',popOpen);
  tUI(); place();
}
// dải nút thời gian: nút đang chọn sáng lên; dải mỏng ở chế độ ngắm vườn đổi icon dừng/chạy
let tKey='';
function tUI(){
  const st=!S||S.over?'':paused?'pause':toEnd?'end':String(speed), k=st+(S&&S.over?'x':'');
  if(k===tKey) return; tKey=k;
  document.querySelectorAll('[data-t]').forEach(b=>{ b.classList.toggle('on',b.dataset.t===st); b.disabled=!S||!!S.over; });
  const pb=document.querySelector('[data-t=pause] span'); if(pb) pb.textContent=paused?L("Đang dừng"):L("Dừng");
  $('pkPause').innerHTML=icoSVG(paused?'play':'pause'); $('pkPause').title=paused?L("Chạy tiếp (phím Space)"):L("Dừng (phím Space)");
}
function render(){ hudSlow(); if(panel) openPanel(panel,true); }

function win(title,html,closable=true){ $('wTitle').textContent=title; $('wBody').innerHTML=html; $('wClose').hidden=!closable; $('veil').hidden=false; }
function closeWin(){ $('veil').hidden=true; panel=null; }
$('wClose').onclick=closeWin;
$('veil').addEventListener('click',e=>{ if(e.target===$('veil')&&!$('wClose').hidden) closeWin(); });

// chọn ngôn ngữ: đổi xong thì lưu và tải lại trang (chữ trong dữ liệu được dịch lúc nạp)
const langPick=()=>`<div class="langs"><span class="lbl">🌐 ${L("Ngôn ngữ")}</span>${LANGS.map(([k,n])=>`<button class="cbtab ${k===LANG?'on':''}" data-lang="${k}" aria-pressed="${k===LANG}">${n}</button>`).join('')}</div>`;
function setupHTML(){
  const l=LOCS.find(x=>x.id===setup.loc), e=EQS.find(x=>x.id===setup.eq);
  const items=[[L("Cọc tiền thuê vườn ({0} tháng)",l.depM),l.rent*l.depM],[L("Tiền thuê tháng đầu"),l.rent],[L("Dọn vườn, bàn ghế, đèn, dây điện"),l.fit],[L("Xe cafe & dụng cụ"),e.cost],[L("Cà phê, sữa, đá ban đầu"),3e6]];
  const tot=items.reduce((s,i)=>s+i[1],0), left=setup.cap-tot;
  const grp=(lbl,list,key,ex)=>`<div style="display:grid;gap:6px"><span class="lbl">${lbl}</span><div class="opts">${list.map(o=>`<button class="opt" aria-pressed="${setup[key]===o.id}" data-k="${key}" data-v="${o.id}"><b>${o.t}</b>${o.d?`<span>${o.d}</span>`:''}${ex?`<em>${ex(o)}</em>`:''}</button>`).join('')}</div></div>`;
  return langPick()+`<p class="muted" style="margin:0">${L("Mất <b>bao lâu</b> để lên đời iPhone Duo? Ngày tháng tự trôi, giữa chừng có tình huống để bạn chọn, cuối tháng có báo cáo. Ở quê an toàn nhưng lời ít; lên phố lời nhiều nhưng dễ <b>phá sản</b>. Máy cũ thu được {0}.",tr(PHONE.trade))}</p>`+
    grp(L("Mục tiêu: lên đời iPhone Duo bản"),TIERS,'tier',o=>vnd(o.price))+grp(L("Vốn ban đầu"),CAPS,'cap')+grp(L("Sân vườn ở quê"),LOCS.filter(l=>!l.city),'loc',o=>o.rent?L("Thuê {0}/th · ~{1} khách",tr(o.rent),o.traffic):L("Miễn phí · ~{0} khách",o.traffic))+grp(L('Xe cafe'),EQS,'eq',o=>L("{0} · {1} ly/ngày",tr(o.cost),o.cap))+
    `<div class="receipt">${items.map(i=>`<div class="row"><span>${i[0]}</span><span>${vnd(i[1])}</span></div>`).join('')}<hr><div class="row">${L("<b>Còn để vận hành</b><b class=\"{0}\">{1}</b>",left<8e6?'neg':'pos',vnd(left))}</div></div>`+
    `<button class="wbtn go" id="startBtn" ${left<0?'disabled':''}>${left<0?L("Không đủ vốn"):L("Dọn vườn &amp; đẩy xe cafe ra")}</button>`;
}
function showSetup(){ panel='setup'; win(L("Mở xe cafe sân vườn"),setupHTML(),false); }
function showHelp(){ win(L("Cách chơi"),`<ol class="steps-help">
  <li>${L("<b>Thời gian tự trôi</b>: mỗi ngày chạy trọn từ sáng tới tối ở quán. Bấm <b>×2</b> để nhanh hơn, <b>Hết tháng</b> để lướt nhanh tới cuối tháng (sang tháng mới tự về ×1). Cuối tháng có <b>báo cáo</b>. Phím Space để dừng; mở bảng nào thì thời gian tự dừng.")}</li>
  <li>${L("<b>Mục tiêu:</b> lên đời iPhone Duo (bản bạn chọn) <b>càng sớm càng tốt</b>. Đủ tiền mặt là mua được (kể cả tiền vay), nhưng nợ sẽ bị trừ điểm.")}</li>
  <li>${L("<b>Bố cục vườn có tác dụng:</b> đồ đẹp kéo khách, đủ chỗ ngồi thì không mất khách, dù/chòi lá giữ khách khi mưa, bóng mát giúp mùa nóng, kê quá chật thì khách khó chịu. Bấm <b>Vườn</b> để sắp xếp.")}</li>
  <li>${L("<b>Độ sạch</b> giảm theo lượng khách. Người phụ và \"Dọn dẹp kỹ\" giữ quán sạch. Quán bẩn dễ dính gián, bị TikToker chê.")}</li>
  <li>${L("<b>Chi tiêu sinh hoạt</b> trừ mỗi ngày dù quán đông hay vắng. Tiền mặt âm là <b>cháy túi</b>: phải vay, bán đồ, hoặc phá sản.")}</li>
  <li>${L("<b>Sức khoẻ</b> giảm mỗi ngày bán. Thêm người phụ hoặc ngày nghỉ (ô Quầy). Về 0 là gục ngã, quán đóng cửa.")}</li>
  <li>${L("<b>Thẻ quyết định</b> hiện % thành công và yếu tố ảnh hưởng. Thất bại cho bạn <b>bài học</b>, lần sau dễ hơn. Có lựa chọn để lại hệ quả vài tuần sau.")}</li>
  <li>${L("<b>Lên phố</b>: anh Long sẽ rủ vào khoảng tháng 2, 4, 6, 8, 11. Vốn thiếu thì vay ngân hàng, hùn vốn, mượn nhà, hoặc vay app (rất nguy hiểm).")}</li>
  <li>${L("Khi lên đời (hoặc phá sản, bán quán, hết 2 năm) sẽ <b>chấm điểm 1–20</b>: tốc độ lên đời, tài chính, sức khoẻ, gia đình, uy tín, bài học.")}</li>
  <li>${L("<b>Giấy tờ:</b> làm VNeID mức 2 + hợp đồng thuê vườn → đăng ký hộ kinh doanh ở UBND xã → mã số thuế, ATTP, khám sức khoẻ, PCCC.")}</li>
  <li>${L("<b>Nhổ cỏ dại:</b> bấm vào từng bụi cỏ trong vườn. Cỏ nhiều thì vườn xấu, khách chê muỗi.")}</li>
  <li>${L("<b>Dân làng</b> có dấu ◆ vàng trên đầu: bấm vào để trò chuyện, mời cafe. Thân đến 4 ♥ họ sẽ giúp bạn.")}</li>
  <li>${L("<b>Chuyện trong xóm</b> xảy ra bất chợt: mượn tiền, hụi, đám cưới, cuộc gọi lừa đảo… chọn cho khôn!")}</li>
  <li>${L("Nút <b>Sổ</b> gồm 3 trang: <b>Dân làng</b>, <b>Sổ sách</b> (thống kê, tập pha chế) và <b>Sổ tay cà phê</b> (các món, loại hạt, vùng trồng, cách pha).")}</li>
  <li>${L("<b>Ngắm vườn</b>: bấm hình con mắt gạch chéo ở góc trên (phím H) để ẩn bảng và nút. Chạm vào cảnh để hiện lại.")}</li>
  <li>${L("<b>Mini-game pha chế</b> 1–2 lần mỗi tháng, xoay vòng: giờ cao điểm, canh gram bột, canh nhiệt độ nước, chọn hạt cafe. Mỗi mùa Xuân · Hạ · Thu · Đông có món, gu khách và thử thách riêng. Tập trước trong <b>Sổ › Sổ sách</b>.")}</li>
  <li>${L("<b>Thiết kế vườn:</b> kéo thả bàn ghế, trồng cây xoài, khóm tre, luống rau thơm, chòi lá, võng…")}</li>
  <li>${L("Đủ lãi <b>{0}</b> thì nút <b>Lên đời iPhone!</b> sẽ hiện ra.",tr(goal()))}</li></ol>
  <button class="wbtn go" id="contBtn">${L("Bắt đầu thôi!")}</button>`); }
$('wBody').addEventListener('click',e=>{
  const o=e.target.closest('.opt'); if(o){ setup[o.dataset.k]=o.dataset.k==='cap'?+o.dataset.v:o.dataset.v; showSetup(); return; }
  const t=e.target.closest('button'); if(!t) return;
  if(t.id==='startBtn') startGame();
  if(t.dataset.doc) fileDoc(t.dataset.doc);
  if(t.dataset.cc!=null) return pickCard(+t.dataset.cc);
  if(t.id==='ccGo'){ closeWin(); return runQ(); }
  if(t.id==='mgGo'){ const p=mgPend; return mgStart(p.kind,p.cb,false,p.cups); }
  if(t.id==='mgSkip'){ closeWin(); const cb=mgPend&&mgPend.cb; mgPend=null; return cb&&cb(); }
  if(t.dataset.cb){ cbTab=t.dataset.cb; return openPanel('coffee'); }
  if(t.dataset.mg) return mgStart(t.dataset.mg,()=>openPanel('book'),true);
  if(t.id==='prNext'){ closeWin(); return setTime(1); }
  if(t.id==='prEdit'){ closeWin(); return enterEdit(); }
  if(t.dataset.so) return openPanel(t.dataset.so);
  if(t.dataset.lang){ if(t.dataset.lang!==LANG) setLang(t.dataset.lang); return; }
  if(t.id==='autoPick'){ S.autoPick=!S.autoPick; save(); return openPanel('book'); }
  if(t.id==='prBuy'){ return buyWin(); }
  if(t.dataset.act) talkAct(t.dataset.act);
  if(t.dataset.vil) talk(t.dataset.vil);
  if(t.dataset.buy) buy(t.dataset.buy);
  if(t.id==='contBtn') closeWin();
  if(t.id==='helpBtn') showHelp();
  if(t.id==='lawBtn') openPanel('law');
  if(t.id==='restartBtn') reset();
  if(t.id==='resetBtn'){ $('resetAsk').hidden=false; }
  if(t.id==='resetYes') reset();
});

function startGame(){
  const l=LOCS.find(x=>x.id===setup.loc), e=EQS.find(x=>x.id===setup.eq), dep=l.rent*l.depM, tot=dep+l.rent+l.fit+e.cost+3e6;
  S={rest:0,energy:80,fam:60,fans:0,comp:l.comp,debts:[],seeds:[],boosts:[],lessons:{},flags:{},seenC:{},seenT:{},pity:0,city:0,partner:0,sick:0,eSum:0,eN:0,wkCups:0,wkLost:0,over:null,clean:85,tidy:false,ph:(()=>{ const t=TIERS.find(x=>x.id===setup.tier)||TIERS[0]; return {price:t.price,trade:PHONE.trade,tier:t.t}; })(),day:0,start:setup.cap,cash:setup.cap-tot,deposit:dep,loc:setup.loc,eq:setup.eq,rent:l.rent,price:l.ref,staff:0,open:true,openFix:1,del:false,walk:false,music:false,ads:false,tik:true,
    layout:JSON.parse(JSON.stringify(DEFAULT_LAYOUT)),cart:1,rep:1,cogsMul:1,docs:{},vil:{},seen:{},lent:[],hui:null,debt:0,debtPay:0,inst:null,today:null,weeds:[],
    ytd:0,ytdYear:2026,taxedEx:0,qRev:0,log:[],hist:[],tot:{rev:0,cups:0,fines:0,tax:0,days:0,openDays:0,weeds:0,scam:0},won:false,bought:false,dead:false,goalDay:null};
  DOCS.forEach(d=>S.docs[d.id]={st:'none',left:0});
  VIL.forEach(v=>S.vil[v.id]={h:v.id==='batu'?1:0,talk:-1,gift:-1});
  addWeeds(10);
  addLog(0,L("Dọn {0}, đẩy xe cafe ra. Chi khởi nghiệp {1}. Mục tiêu: {2}.",l.t,vnd(tot),phoneName()));
  save(); boot(); startMonth(); showHelp();
  toast(L("Bước 1: mở \"Giấy tờ\" để làm VNeID & hợp đồng thuê vườn"));
}

function openPanel(k){
  panel=k;
  if(k==='docs'){
    win(L("Hồ sơ hộ kinh doanh"),`<p class="muted" style="margin:0">${L("Mỗi thủ tục tốn tiền và ngày chờ. Tiền thuê vườn vẫn chạy trong lúc chờ.")}</p>`+DOCS.map(d=>{
      const st=S.docs[d.id], need=d.need||[], blocked=need.some(n=>S.docs[n].st!=='done'), nn=need.filter(n=>S.docs[n].st!=='done').map(n=>DOCS.find(x=>x.id===n)).map(x=>x.id==='hkd'?L("giấy ĐKHKD"):x.id==='vneid'?'VNeID':L("hợp đồng thuê")).join(' + ');
      const foot=st.st==='done'?`<span class="tag" style="background:#cfe6c4;color:#2f6b2a">${L("Đã hoàn tất")}</span>`:st.st==='pending'?`<span class="tag">${L("Đang xử lý · còn {0} ngày",st.left)}</span>`:`<button class="sbtn" data-doc="${d.id}" ${blocked?'disabled':''}>${blocked?L("Cần {0} trước",nn):L("Nộp hồ sơ · {0}",vnd(docCost(d)))}</button>`;
      return `<div class="doc">${st.st==='done'?`<div class="stamp">${L("ĐÃ<br>CẤP")}</div>`:''}<span class="tag ${d.req?'req':''}">${d.req?L("Bắt buộc"):L("Tuỳ chọn")}</span><h3>${docName(d)}</h3><div class="meta">${L("{0} · {1} ngày{2}",docWhere(d),docDays(d),d.fine?L(" · thiếu phạt ~{0}",tr(d.fine)):'')}</div><div class="meta">${d.note}</div>${foot}</div>`; }).join(''));
  } else if(k==='vil'){ soTab=k;
    win(L("Sổ"),soTabs()+`<p class="muted" style="margin:0">${L("Bấm vào người có dấu ◆ vàng trong vườn, hoặc chọn ở đây để ghé thăm. Mỗi ngày nói chuyện & mời cafe được một lần. Thân đến 4 ♥ sẽ được giúp.")}</p><div class="vgrid">${VIL.map(v=>{ const h=S.vil[v.id].h;
      return `<button class="vc" data-vil="${v.id}"><img src="${portrait(v.id)}" alt=""><span><b>${v.n}</b> <span class="hearts">${hearts(h)}</span><small class="muted" style="display:block">${h>=4?'✓ '+v.perkS:v.role}</small></span></button>`; }).join('')}</div>`);
  } else if(k==='book'){ soTab=k;
    const t=S.tot;
    win(L("Sổ"),soTabs()+`<div class="mgprac"><span class="lbl">${L("Tập pha chế · không tính tiền")}</span><div>${MG_ORDER.map(k=>`<button class="sbtn" data-mg="${k}">${MG[k].ico} ${MG[k].t}${t.mg&&t.mg[k]?' '+'★'.repeat(t.mg[k]):''}</button>`).join('')}</div></div>
      <canvas id="chart" width="520" height="180"></canvas>
      <div class="kv">${[[L("Ngày mở cửa"),t.openDays],[L("Ly đã bán"),num(t.cups)],[L('Doanh thu'),tr(t.rev)],[L("Tiền phạt"),tr(t.fines)],[L("Thuế đã nộp"),tr(t.tax)],[L("Bị lừa mất"),tr(t.scam||0)],[L("Cỏ đã nhổ"),t.weeds||0],[L("Nợ còn lại"),tr(S.debt||0)],[L("Đã cho mượn"),tr(S.lent.reduce((s,x)=>s+x.amt,0))],[L("Hụi"),S.hui?L("đã góp {0}/10",S.hui.paid):L("không")]].map(([a,b])=>`<div><span class="sm">${a}</span><b>${b}</b></div>`).join('')}</div>
      <div class="log">${S.log.map(x=>`<div><span class="muted">${dstr(x.day)}</span><span class="${x.cls}">${x.msg}</span></div>`).join('')}</div>
      <div class="doc"><h3>${L("Khi bấm \"Hết tháng\"")}</h3><div class="meta">${S.autoPick?L("⚠ Người phụ <b>tự chọn ngẫu nhiên</b> mọi tình huống tới cuối tháng, kể cả lựa chọn xấu. Kết quả ghi trong báo cáo tháng."):L("Game vẫn dừng ở mỗi tình huống để bạn tự chọn.")}</div>
        <button class="sbtn" id="autoPick">${S.autoPick?L("Tắt: tôi tự chọn"):L("Bật: để người phụ quyết")}</button></div>
      ${langPick()}
      <div><button class="sbtn" id="helpBtn">${L("Cách chơi")}</button> <button class="sbtn" id="lawBtn">${L("Luật &amp; nguồn")}</button> <button class="sbtn" id="resetBtn">${L("Chơi lại từ đầu")}</button> <span id="resetAsk" hidden><span class="muted">${L("Mất hết tiến độ?")}</span> <button class="sbtn" id="resetYes" style="background:var(--red)">${L("Xoá &amp; chơi lại")}</button></span></div>`);
    drawChart();
  } else if(k==='coffee'){ soTab=k;
    win(L("Sổ"),soTabs()+coffeeBook());
  } else if(k==='law'){
    win(L("Luật & nguồn"),`<div class="law"><p style="margin:0"><span class="badge ok">${L("ĐÃ KIỂM")}</span>${L("có nguồn ·")} <span class="badge est">${L("ƯỚC TÍNH")}</span>${L("số đặt cho game, nên hỏi lại UBND xã / cơ quan thuế trước khi mở quán thật.")}</p><ul style="padding-left:18px;margin:8px 0">
      <li><span class="badge ok">${L("ĐÃ KIỂM")}</span>${L("Bỏ thuế khoán & lệ phí môn bài từ 01/01/2026 (Điều 10 NQ 198/2025/QH15); hộ KD tự kê khai.")}</li>
      <li><span class="badge ok">${L("ĐÃ KIỂM")}</span>${L("Ngưỡng không chịu thuế: game dùng 1 tỷ/năm. Một số nguồn cũ ghi 500tr — thông tin chưa thống nhất.")}</li>
      <li><span class="badge ok">${L("ĐÃ KIỂM")}</span>${L("Nộp tờ khai định kỳ kể cả khi thuế 0đ; dưới ngưỡng dùng mẫu 01/TKN-CNKD.")}</li>
      <li><span class="badge ok">${L("ĐÃ KIỂM")}</span>${L("Lương tối thiểu giờ vùng I 2026: 25.500đ. Game dùng 20.000đ/giờ cho vùng nông thôn —")} <span class="badge est">${L("ƯỚC TÍNH")}</span>${L(", cần đối chiếu vùng III/IV.")}</li>
      <li><span class="badge est">${L("ƯỚC TÍNH")}</span>${L("Từ 7/2025 chính quyền 2 cấp: hộ kinh doanh đăng ký tại cấp xã.")}</li>
      <li><span class="badge est">${L("ƯỚC TÍNH")}</span>${L("{0}: tên & giá là giả định của game. Thuế phần vượt ngưỡng 4,5%; hồ sơ ATTP tuỳ địa phương; mọi mức phạt, giá thuê, giá xe cafe, lượng khách, phí VCPMC, lãi vay, ngày Tết.",PHONE.n)}</li></ul>
      ${L("<b>Nguồn</b>")}<ul style="padding-left:18px;margin:6px 0">
      <li><a href="https://vneconomy.vn/tu-2026-doanh-nghiep-ho-kinh-doanh-chinh-thuc-khong-phai-khai-va-nop-le-phi-mon-bai.htm" target="_blank" rel="noopener">${L("VnEconomy — bỏ lệ phí môn bài")}</a></li>
      <li><a href="https://www.meinvoice.vn/?p=47137" target="_blank" rel="noopener">${L("MISA meInvoice — ngưỡng 1 tỷ, mẫu tờ khai")}</a></li>
      <li><a href="https://einvoice.vn/tin-tuc/hkd-tinh-thue-khi-bo-thue-khoan" target="_blank" rel="noopener">${L("EInvoice — thuế HKD khi bỏ thuế khoán")}</a></li>
      <li><a href="https://baophapluat.vn/chinh-phu-quyet-dinh-tang-luong-toi-thieu-vung-tu-1-1-2026.html" target="_blank" rel="noopener">${L("Báo Pháp luật — lương tối thiểu vùng 2026")}</a></li></ul></div>`);
  }
}
document.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>openPanel(b.dataset.open));
// nút Sổ gộp 3 trang: dân làng, sổ sách, sổ tay cà phê; mở lại đúng trang xem lần trước
let soTab='vil';
const SO_TABS=[['vil','folk',L("Dân làng")],['book','book',L("Sổ sách")],['coffee','bean',L("Sổ tay cà phê")]];
function soTabs(){ return `<div class="sotabs">${SO_TABS.map(([k,ic,n])=>`<button class="sotab ${k===soTab?'on':''}" data-so="${k}" aria-pressed="${k===soTab}">${icoSVG(ic)}<span>${n}</span></button>`).join('')}</div>`; }
function fileDoc(id){ const d=DOCS.find(x=>x.id===id), c=docCost(d); if(S.cash<c){ toast(L("Không đủ tiền mặt"),'bad'); return; } S.cash-=c; S.docs[id]={st:'pending',left:docDays(d)}; addLog(S.day,L("Nộp hồ sơ: {0} ({1})",docName(d),vnd(c))); save(); render(); toast(L("Đã nộp: {0}",docName(d))); }

/* --- trò chuyện --- */
const hearts=h=>'♥'.repeat(Math.floor(h))+'♡'.repeat(10-Math.floor(h));
let talkId=null;
function hint(v){
  const miss=DOCS.find(d=>d.req&&S.docs[d.id].st==='none'&&!(d.id==='hdld'&&S.staff===0)&&!(d.need||[]).some(n=>S.docs[n].st!=='done'));
  const ref=refPrice();
  if(miss&&R()<.7) return L("Nghe nói \"{0}\" làm ở {1} đó. Lo sớm kẻo đoàn kiểm tra xã ghé.",docName(miss),docWhere(miss).toLowerCase());
  if(S.weeds.length>10&&R()<.7) return L("Cỏ dại mọc {0} bụi rồi kìa! Bấm vào từng bụi mà nhổ, hoặc thuê thêm người phụ.",S.weeds.length);
  if(S.price>ref*1.2) return L("Ly {0} hơi chát với dân quê mình. Ở đây quen tầm {1} thôi.",kk(S.price),kk(ref));
  if(S.price<ref*.75) return L("Bán {0} rẻ quá, coi chừng lỗ. Tầm {1} là vừa.",kk(S.price),kk(ref));
  if(!S.open) return L("Quán đang nghỉ đó. Bấm \"Mở cửa\" ở bảng gỗ góc trái rồi hãy qua ngày mới.");
  if(S.vil[v.id].h<4&&R()<.4) return L("Thân với {0} tới 4 ♥ thì: {1}",v.n,v.perk);
  return pick(TIPS);
}
function talk(id,line){
  const v=VILM[id], st=S.vil[id], today=curDay(); talkId=id; panel=null;
  win(v.n,`<div class="talk"><img class="por" src="${portrait(id)}" alt="${v.n}"><div style="display:grid;gap:6px"><div><span class="nametag">${v.n}</span> <span class="hearts">${hearts(st.h)}</span></div><div class="sm">${v.role}</div><div class="say">${line||pick(v.lines)}</div></div></div>
    <div class="acts"><button class="wbtn" data-act="chat" ${st.talk===today?'disabled':''}>${L("♥ Nói chuyện")}</button><button class="wbtn" data-act="gift" ${st.gift===today?'disabled':''}>${L("Mời ly cafe ({0})",kk(EQ().cogs))}</button><button class="wbtn" data-act="ask">${L("Hỏi thăm")}</button><button class="wbtn" data-act="bye">${L("Tạm biệt")}</button></div>
    <div class="sm">${st.h>=4?L("✓ Đang giúp bạn: {0}",v.perk):L("Đạt 4 ♥: {0}",v.perk)}</div>`);
}
function talkAct(a){
  const id=talkId, v=VILM[id], st=S.vil[id], today=curDay(); if(!v) return;
  if(a==='bye'){ closeWin(); return; }
  if(a==='chat'){ st.talk=today; heart(id,.5); save(); talk(id,pick(v.lines)); }
  else if(a==='gift'){ S.cash-=EQ().cogs; st.gift=today; heart(id,1); save(); hudSlow(); talk(id,pick([L("Ui, cafe sữa đá! Cảm ơn nha!"),L("Ly cafe này thơm quá, mai ghé tiếp."),L("Vậy là ngại quá à… mà ngon thiệt!")])); const e=ents.find(x=>x.vil===id); if(e) e.bub=1.6; }
  else if(a==='ask') talk(id,hint(v));
}
