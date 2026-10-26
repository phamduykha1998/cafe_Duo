// Tính tiền, khách, sức khoẻ, giấy tờ… cho một ngày bán
/* ================= MÔ PHỎNG MỘT NGÀY ================= */
function runDay(){
  if(S.dead) return null;
  const day=S.day, dt=dateOf(day), l=LOC(), e=EQ(), m=dt.getMonth(), se=seasonOf(dt);
  const T=S.today||{}; S.today=null;
  const r={day,lines:[],ev:[],cups:0,del:0,lost:0,open:S.open,price:S.price,rain:false};
  const pay=(amt,label,tag)=>{ amt=Math.round(amt); if(amt<=0) return; S.cash-=amt; r.lines.push([label,-amt,tag]); };
  const gain=(amt,label)=>{ amt=Math.round(amt); if(amt<=0) return; S.cash+=amt; r.lines.push([label,amt]); };
  const fine=(amt,label,tag)=>{ S.cash-=amt; S.tot.fines+=amt; r.lines.push([label,-amt]); r.ev.push(['bad',label+' — '+vnd(amt),tag]); addLog(day,L("{0} — phạt {1}",(label),vnd(amt)),'bad'); };

  if(dt.getFullYear()!==S.ytdYear){ S.ytdYear=dt.getFullYear(); S.ytd=0; S.taxedEx=0; addLog(day,L("Sang năm mới: doanh thu năm reset về 0.")); }
  DOCS.forEach(d=>{ const st=S.docs[d.id]; if(st.st==='pending'){ st.left--; if(st.left<=0){ st.st='done'; r.ev.push(['good',L("Đã có: {0}",docName(d))]); addLog(day,L("Nhận {0}",docName(d)),'good'); } } });
  if(day>0&&day%30===0){
    if(S.rent) pay(S.rent*(perk('batu')?.8:1),L("Tiền thuê vườn{0}",perk('batu')?L(" (Bà Tư bớt 20%)"):''));
    pay(250000,L("Internet, rác, điện chiếu sáng"));
  }
  if(day===365&&S.rent){ S.rent=Math.round(S.rent*1.1); r.ev.push(['bad',L("Chủ đất tăng tiền thuê 10%")]); addLog(day,L("Tiền thuê vườn tăng lên {0}/tháng",vnd(S.rent)),'bad'); }

  // nợ nần, hụi, vay vốn, trả góp
  S.lent=S.lent.filter(x=>{ if(day<x.due) return true;
    if(R()<x.p){ gain(x.amt,x.who+(x.ghi?L(" trả tiền ghi sổ"):L(" trả tiền mượn"))); r.ev.push(['good',L("{0} mang tiền sang trả đủ",(x.who))]); addLog(day,L("{0} trả {1}",(x.who),vnd(x.amt)),'good'); }
    else { r.ev.push(['bad',L("{0} khất nợ… chắc mất luôn",(x.who))]); addLog(day,L("{0} không trả {1}",(x.who),vnd(x.amt)),'bad'); } return false; });
  if(S.hui&&day>S.hui.start&&(day-S.hui.start)%30===0){ pay(1e6,L("Góp hụi kỳ {0}/10",S.hui.paid+1),L("Góp hụi")); S.hui.paid++;
    if(S.hui.paid===5&&R()<.12){ r.ev.push(['bad',L("Bể hụi! Bà Hai chủ hụi ôm tiền bỏ trốn")]); addLog(day,L("Bể hụi, mất 5 kỳ đã góp"),'bad'); S.hui=null; }
    else if(S.hui.paid>=10){ gain(1.05e7,L("Hốt hụi kỳ cuối")); addLog(day,L("Hốt hụi được 10,5 triệu"),'good'); S.hui=null; } }
  pay(S.city?380000:140000,L("Chi tiêu sinh hoạt (ăn ở, xăng, điện thoại)"));
  if(S.inst&&day>S.inst.from&&(day-S.inst.from)%30===0){ pay(S.inst.amt,L("Trả góp {0} kỳ {1}/12",PHONE.n,13-S.inst.left),L("Trả góp {0}",PHONE.n)); S.inst.left--;
    if(!S.inst.left){ addLog(day,L("Trả xong góp {0}!",PHONE.n),'good'); r.ev.push(['good',L("Trả xong góp {0}",PHONE.n)]); S.inst=null; } }

  // thời tiết + cỏ dại
  const rainy=m>=4&&m<=9; let rain=(rainy&&R()<.3)||(se===0&&R()<.3); r.rain=rain;
  if(!S.city){ let grow=(rain?2:1)+(R()<.5?1:0)+(se===1?1:0); if(se===3) grow=Math.max(0,grow-1); if(perk('thao')) grow=Math.floor(grow/2);
  addWeeds(grow);
  for(let i=0;i<S.staff&&S.weeds.length;i++) if(R()<.6) S.weeds.splice(Math.floor(R()*S.weeds.length),1); }

  const tet=tetInfo(dt);
  if(tet&&tet.lixi) pay(S.staff*2e5+3e5,L("Lì xì người phụ & trẻ con trong xóm"));
  const restToday=(day%7)>=7-(S.rest||0), sickToday=S.sick>0; if(sickToday) S.sick--;
  r.open=S.open&&!restToday&&!sickToday;
  if(r.open){
    S.tot.openDays++; const lfx=layoutFx();
    let f=(dt.getDay()===0||dt.getDay()===6)?l.weekend:1;
    if(l.summer&&m>=5&&m<=7){ f*=l.summer; if(dt.getDate()===1) r.ev.push(['',L("Học sinh nghỉ hè, trường vắng hoe")]); }
    if(tet){ f*=tet.f; r.ev.push([tet.cls||'',tet.msg]); }
    if(coHon(dt)){ f*=.9; if(dt.getDate()===3) r.ev.push(['',L("Tháng cô hồn — nhiều người kiêng đi chơi")]); }
    if(dt.getFullYear()===2027&&m===8&&dt.getDate()===15){ f*=1.25; r.ev.push(['good',L("Trung thu: trẻ con rước đèn, phụ huynh ghé vườn")]); }
    if(rain){ f*=rainy?(.55+.35*Math.min(1,lfx.cover/Math.max(1,lfx.seats))):.9; r.ev.push(['',rainy?L("Mưa giông chiều tối, khách giảm"):L("Mưa phùn lất phất"),'rain']); }
    if(se===3&&R()<.25){ f*=.92; r.ev.push(['',L("Gió mùa đông bắc về, khách gọi cafe nóng")]); }
    if(se===1&&!rain&&R()<.3){ f*=1.08; r.ev.push(['good',L("Nắng nóng, bạc xỉu đá bán chạy")]); }
    const outage=!rainy&&R()<.02; if(outage){ f*=.6; r.ev.push(['bad',L("Cúp điện đột xuất nửa ngày"),'outage']); }
    let staffNow=S.staff; if(S.staff>0&&R()<.025){ staffNow--; r.ev.push(['bad',L("1 người phụ xin nghỉ đột xuất (nhà có việc)")]); }
    f*=T.mul||1;
    const ref=refPrice(), pf=clamp(Math.pow(ref/S.price,1.6),.15,1.7);
    const friends=VIL.reduce((s,v)=>s+S.vil[v.id].h,0);
    let demand=(l.traffic*(1-S.comp*.45)+S.fans*.3)*boostMul()*f*S.rep*pf*(S.walk?1.2:1)*(S.ads?1.15:1)*(S.music?1.05:1)*(1+clamp(lfx.beauty*.012,-.15,.3))*(se===1||S.city?1+Math.min(.15,lfx.shade*.015):1)*(lfx.crowd>.42?.9:1)*(1+friends*.004)*(perk('mai')?1.05:1)*(perk('long')?1.08:1)*(.85+R()*.3);
    if(perk('binh')) demand+=6*f;
    if(lfx.side) demand+=lfx.side*1.2*f;
    if(lfx.crowd>.42&&R()<.15) r.ev.push(['bad',L("Bàn ghế kê chật chội, khách đi lại vướng víu")]);
    const delDem=S.del?demand*.22:0;
    const cap=Math.min(e.cap,60+staffNow*70);
    let dine=Math.round(Math.min(demand,cap)); const seatN=seatCount()*(T.half?.5:1);
    const seatLost=Math.max(0,Math.round(dine*.6-seatN*8)); dine-=seatLost; if(seatLost>8) r.ev.push(['bad',L("Hết chỗ ngồi, {0} khách bỏ về",seatLost)]);
    const dl=Math.round(Math.min(delDem,Math.max(0,cap-dine)));
    const lost=Math.max(0,Math.round(demand+delDem-dine-dl));
    r.cups=dine; r.del=dl; r.lost=lost; r.lostWhy=seatLost*2>=lost?'seat':'cap';
    if(lost>20&&dine>=cap-1) r.ev.push(['bad',L("Pha không xuể, {0} khách bỏ về — thuê thêm người phụ hoặc nâng cấp xe",lost)]);
    const rev=(dine+dl)*S.price; S.cash+=rev; r.lines.push([L("Bán {0} ly tại vườn",dine)+(dl?L(" + {0} ly ship",dl):''),rev,L("Doanh thu bán hàng")]);
    if(dl) pay(S.city?dl*S.price*.25:dl*6000,S.city?L("Hoa hồng app giao đồ (~25%)"):L("Xe ôm ship trong xóm + bao bì"));
    S.wkCups+=dine+dl; S.wkLost+=lost;
    S.energy-=Math.max(1.2,(S.city?6.4:5.2)-Math.min(staffNow,3)*1.6);
    if(S.energy<25&&R()<.25){ S.rep-=.006; r.ev.push(['bad',L("Mệt quá, pha ẩu, khách chê")]); }
    pay((dine+dl)*e.cogs*S.cogsMul,L("Cà phê, sữa đặc, đá, ly"));
    gain(Math.min(herbBeds()*25000,(dine+dl)*1500),L("Rau thơm nhà trồng (đỡ tiền mua)"));
    if(S.staff) pay(S.staff*8*(S.city?25000:WAGE)*(S.wageMul||1)*(tet&&tet.x3?3:1),L("Lương {0} người phụ",S.staff)+(tet&&tet.x3?L(" (Tết ×3)"):''));
    pay((S.city?220000:80000)+(dine+dl)*250+(e.q===3?40000:0),S.city?L("Điện nước, rác, phí phường"):L("Điện nước"));
    if(S.ads) pay(200000,L("Quảng cáo Facebook"));
    if(S.tidy){ pay(S.city?120000:50000,L("Thuê người dọn dẹp")); }
    S.clean-=(dine+dl)*(S.city?.033:.025)-1-Math.min(S.staff,3)*1.4-(S.tidy?5:0); if(!S.city&&S.weeds.length>12) S.clean-=1; S.clean=clamp(S.clean,0,100);
    if(S.clean<40&&R()<.25){ S.rep-=.008; r.ev.push(['bad',L("Bàn ghế dơ, ruồi bu — khách nhăn mặt")]); }
    S.ytd+=rev; S.qRev+=rev; S.tot.rev+=rev; S.tot.cups+=dine+dl;

    S.rep+=.003*(e.q-1)-.03*(lost/Math.max(demand+delDem,1))+(pf<.55?-.008:0)+(S.tik?.001:0)+(1-S.rep)*.02;
    if(perk('batu')&&S.loc==='nha') S.rep+=.002;
    if(S.tik&&R()<.008*(perk('huong')?2:1)){ S.rep+=.07; addBoost(1.25,2,L('clip viral')); r.ev.push(['good',L("Clip TikTok quay vườn cafe lên xu hướng!")]); addLog(day,L("Clip TikTok viral, uy tín tăng"),'good'); }
    if(R()<.008){ S.rep-=.04; r.ev.push(['bad',L("Bị chê 1 sao trên Google Maps: \"cafe nhạt\"")]); }
    if(S.weeds.length>18){ S.rep-=.012; r.ev.push(['bad',L("Vườn um tùm cỏ dại, khách than muỗi đốt")]); }
    S.rep=clamp(S.rep,.6,1.7);

    if(R()<l.insp){
      r.ev.push(['bad',S.city?L("Đoàn kiểm tra liên ngành của phường ghé quán"):L("Đoàn kiểm tra liên ngành của xã ghé vườn"),'insp']);
      const miss=DOCS.filter(d=>d.fine&&S.docs[d.id].st!=='done'&&(d.req||d.id==='sign')&&!(d.id==='hdld'&&S.staff===0));
      if(!miss.length){ r.ev.push(['good',L("Đủ giấy tờ, đoàn kiểm tra khen rồi về"),'inspR']); addLog(day,L("Đoàn kiểm tra: đầy đủ, không vi phạm"),'good'); }
      miss.forEach(d=>fine(d.fine,L("Thiếu: {0}",docName(d)),'inspR'));
      if(S.docs.hkd.st!=='done'){ S.open=false; r.ev.push(['bad',L("Bị yêu cầu tạm nghỉ bán đến khi có giấy ĐKHKD"),'inspR']); addLog(day,L("Bị yêu cầu tạm ngưng bán"),'bad'); }
    }
    if((S.walk||lfx.side)&&R()<(S.city?.07:.05)){ fine(S.city?3e6:1.5e6,S.city?L("Lấn chiếm vỉa hè"):L("Lấn chiếm hành lang đường liên thôn")); if(R()<.4) pay(4e5,L("Bị thu ghế nhựa, mua lại")); }
    if(S.music){ if(R()<.04){ S.rep-=.02; r.ev.push(['bad',L("Hàng xóm phàn nàn loa mở to giờ trưa")]); } if(S.docs.music.st!=='done'&&R()<.01) fine(5e6,L("Dùng nhạc bản quyền không phép")); }
    if(R()<.015){ pay(1.2e6*e.q*(1+R())*(perk('hai')?.5:1),L("Sửa máy{0}",perk('hai')?L(" (anh Hải sửa giúp)"):'')); r.ev.push(['bad',L("Máy móc trục trặc")]); }
    if(R()<.005){ S.cogsMul*=1.06; r.ev.push(['bad',L("Giá sữa đặc & cà phê nhân tăng 6%")]); addLog(day,L("Giá nguyên liệu tăng 6%"),'bad'); }
  } else { pay(20000,L("Điện nước (nghỉ bán)")); S.energy=Math.min(100,S.energy+(sickToday?8:16)); S.clean=Math.min(100,S.clean+3); if(restToday&&S.open) r.ev.push(['',L("Ngày nghỉ: bạn ngủ bù, về thăm nhà")]); }

  if(day>0&&day%91===0){
    if(S.docs.tax.st!=='done') fine(2e6,L("Không nộp tờ khai thuế quý"));
    else { const ex=Math.max(0,S.ytd-1e9)-S.taxedEx;
      if(ex>0){ const t=ex*.045; S.taxedEx+=ex; S.tot.tax+=t; pay(t,L("Thuế GTGT + TNCN phần vượt 1 tỷ")); addLog(day,L("Nộp tờ khai 01/CNKD, thuế {0}",vnd(t))); }
      else { r.ev.push(['good',L("Nộp tờ khai quý (mẫu 01/TKN-CNKD) — thuế 0đ")]); addLog(day,L("Nộp tờ khai quý, doanh thu dưới ngưỡng: 0đ"),'good'); } }
    S.qRev=0;
  }

  S.day++; S.tot.days++;
  const p=progress(); S.hist.push(p); if(S.hist.length>1500) S.hist.shift();
  if(!S.won&&!S.bought&&S.cash>=goal()){ S.won=true; S.goalDay=S.day; addLog(day,L("Tiền mặt đủ {0} — có thể lên đời {1}!",tr(goal()),PHONE.n),'good'); r.ev.push(['good',L("ĐỦ TIỀN LÊN ĐỜI {0}!",PHONE.n.toUpperCase())]); }
  return r;
}
