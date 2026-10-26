// Dữ liệu gốc: iPhone, vốn, sân vườn, xe cafe, giấy tờ, dân làng, định dạng tiền/ngày
/* ================= DỮ LIỆU ================= */
// Giá iPhone Duo là số giả định cho game — sửa ở đây nếu có giá thật.
const PHONE={n:'iPhone Duo',price:59990000,old:L("iPhone 11 cũ (màn sọc, pin 71%)"),trade:4500000};
const START=new Date(2026,10,2), KEY='cafe-len-pho-v1', WAGE=20000;
const goal=()=>S&&S.ph?S.ph.price-S.ph.trade:PHONE.price-PHONE.trade;
const CAPS=[
  {id:20e6,t:L("20 triệu"),d:L("Tiền dành dụm + đập heo đất. Rất sát nút.")},
  {id:35e6,t:L("35 triệu"),d:L("Dành dụm + ba mẹ cho thêm.")},
  {id:50e6,t:L("50 triệu"),d:L("Bán chiếc xe cũ + vay bạn bè.")}
];
// Số liệu là ước tính cho game: lượng khách, tiền thuê, mức cạnh tranh (comp 0–1).
const LOCS=[
  {id:'nha',t:L("Vườn nhà mình, cuối xóm"),d:L("Không tốn tiền thuê, nhưng hẻo lánh, khách toàn người quen."),rent:0,depM:0,fit:6e6,traffic:46,ref:15000,weekend:1.4,insp:.012,comp:.05},
  {id:'cho',t:L("Vườn bà Tư, đầu ngõ gần chợ quê"),d:L("Người đi chợ qua lại, sáng nào cũng có khách."),rent:2.5e6,depM:2,fit:9e6,traffic:70,ref:16000,weekend:1.2,insp:.02,comp:.12},
  {id:'truong',t:L("Vườn đối diện trường THPT huyện"),d:L("Học sinh đông ngày thường; hè & cuối tuần vắng, nhạy giá."),rent:3.5e6,depM:2,fit:10e6,traffic:80,ref:14000,weekend:.6,summer:.5,insp:.02,comp:.18},
  {id:'hem',city:1,t:L("Mặt bằng hẻm xe hơi, Bình Thạnh"),d:L("Khách văn phòng, sinh viên trong hẻm. Thuê vừa phải, cạnh tranh vừa phải."),rent:8e6,depM:2,fit:15e6,traffic:150,ref:23000,weekend:1.1,insp:.04,comp:.25},
  {id:'mt',city:1,t:L("Mặt tiền đường lớn, Phú Nhuận"),d:L("Người qua lại cả ngày, đối thủ san sát, phường kiểm tra thường xuyên."),rent:16e6,depM:2,fit:25e6,traffic:190,ref:28000,weekend:1.15,insp:.06,comp:.5},
  {id:'vp',city:1,t:L("Gần cao ốc văn phòng, Quận 1"),d:L("Giá bán cao nhất, nhưng cuối tuần vắng tanh và chuỗi lớn vây quanh."),rent:28e6,depM:2,fit:35e6,traffic:235,ref:34000,weekend:.45,insp:.06,comp:.6}
];
const EQS=[
  {id:'phin',t:L("Xe đẩy gỗ + phin nhôm"),d:L("Rẻ, pha chậm, vị truyền thống."),cost:6e6,q:1,cap:150,cogs:6000},
  {id:'may',t:L("Xe cafe + máy pha cũ"),d:L("Có bạc xỉu, cafe muối chuẩn vị."),cost:22e6,q:2,cap:260,cogs:7500},
  {id:'xin',t:L("Xe cafe + máy pha mới, máy xay"),d:L("Ngon, nhanh, tốn điện hơn."),cost:48e6,q:3,cap:400,cogs:8500}
];
const DOCS=[
  {id:'vneid',name:L("Kích hoạt định danh điện tử VNeID mức 2"),where:L("Công an xã"),whereP:L("Công an phường"),cost:0,days:2,req:true,note:L("Dùng để nộp hồ sơ trực tuyến trên Cổng dịch vụ công.")},
  {id:'hdt',name:L("Hợp đồng thuê vườn có chứng thực"),where:L("Chủ đất + UBND xã chứng thực"),whereP:L("Chủ nhà + UBND phường chứng thực"),cost:100000,days:1,req:true,fine:2e6,note:L("Chứng minh địa điểm kinh doanh hợp pháp.")},
  {id:'hkd',name:L("Giấy chứng nhận đăng ký hộ kinh doanh"),where:L("Bộ phận một cửa UBND xã / dịch vụ công"),whereP:L("Bộ phận một cửa UBND phường / dịch vụ công"),cost:100000,days:3,need:['vneid','hdt'],req:true,fine:5e6,note:L("Thủ tục nền — các giấy khác cần mã số hộ KD.")},
  {id:'tax',name:L("Mã số thuế + tài khoản ngân hàng, mã QR"),where:L("Thuế cơ sở / eTax Mobile + ngân hàng"),cost:0,days:2,need:['hkd'],req:true,note:L("Từ 2026 bỏ thuế khoán: tự kê khai mỗi quý, kể cả khi thuế 0đ.")},
  {id:'health',name:L("Khám sức khoẻ cho người pha chế"),where:L("Trạm y tế xã / phòng khám"),whereP:L("Trạm y tế phường / phòng khám"),cost:300000,days:1,req:true,fine:2e6,note:L("Cho chủ quán và người phụ trực tiếp pha chế.")},
  {id:'attp',name:L("Bản cam kết bảo đảm an toàn thực phẩm"),where:L("UBND xã"),whereP:L("UBND phường"),cost:0,days:5,need:['hkd'],req:true,fine:4e6,note:L("Hộ nhỏ lẻ thường chỉ cần cam kết — tuỳ địa phương, cần hỏi xã.")},
  {id:'pccc',name:L("Bình chữa cháy + nội quy PCCC"),where:L("Tự mua & treo ở xe cafe"),cost:700000,days:1,req:true,fine:3e6,note:L("Có lò than, bếp ga, dây điện thì càng cần.")},
  {id:'hdld',name:L("Hợp đồng lao động cho người phụ"),where:L("Tự soạn & ký"),cost:0,days:1,req:true,fine:4e6,note:L("Chỉ cần khi có thuê người phụ.")},
  {id:'sign',name:L("Biển hiệu ghi tên & mã số hộ KD"),where:L("Thợ kẻ biển trong làng"),whereP:L("Tiệm làm biển hiệu"),cost:800000,days:2,need:['hkd'],fine:1e6,note:L("Treo trước cổng tre.")},
  {id:'music',name:L("Giấy phép dùng nhạc có bản quyền (VCPMC)"),where:L("Trung tâm bảo vệ quyền tác giả âm nhạc"),cost:2e6,days:5,fine:5e6,note:L("Chỉ cần nếu mở loa nhạc. Phí là ước tính.")}
];
const SEASON_N=[L("Xuân"),L("Hạ"),L('Thu'),L("Đông")];

let S=null, setup={cap:35e6,loc:'cho',eq:'phin',tier:'256'}, busy=false, panel=null;
const $=id=>document.getElementById(id);
const LOC=()=>LOCS.find(x=>x.id===S.loc), EQ=()=>EQS.find(x=>x.id===S.eq);
// tiền vẫn tính bằng đồng (bối cảnh game) nhưng ghi theo thói quen từng ngôn ngữ: 1,2tr · 1.2M · 120万
const num=n=>Math.round(n).toLocaleString(LOCALE);
const vnd=n=>(n<0?'−':'')+num(Math.abs(n))+(LANG==='ja'?'ドン':LANG==='en'?'₫':'đ');
const tr=n=>(n<0?'−':'')+(LANG==='ja'?num(Math.abs(n)/1e4)+'万':(Math.abs(n)/1e6).toLocaleString(LOCALE,{maximumFractionDigits:1})+(LANG==='en'?'M':'tr'));
const kk=n=>Math.round(n/1000)+'K';
const dateOf=d=>{const x=new Date(START);x.setDate(x.getDate()+d);return x;};
const dstr=d=>dateOf(d).toLocaleDateString(LOCALE,{day:'2-digit',month:'2-digit',year:'numeric'});
const dm=dt=>LANG==='vi'?`${dt.getDate()}/${dt.getMonth()+1}`:`${dt.getMonth()+1}/${dt.getDate()}`; // ngày/tháng ngắn
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const R=Math.random;
const seasonOf=dt=>{ const m=dt.getMonth(); return m>=1&&m<=3?0:m>=4&&m<=6?1:m>=7&&m<=9?2:3; };

/* ---- dân làng (theo bảng nhân vật) ---- */
const VIL=[
  {id:'linh',n:L('Linh'),role:L("Vui vẻ, yêu thiên nhiên, thích nấu ăn"),perk:L("Linh chỉ công thức bạc xỉu cốt dừa — khách chịu trả cao hơn 1.000đ/ly."),perkS:L("Công thức cốt dừa: +1K giá chuẩn"),
   lk:{style:'nonla',skin:'#f7d3b0',hair:'#2a1e1a',iris:'#3a2418',shirt:'#eaa6a6',pants:'#4a3b2f',shoes:'#8a3030'},
   lines:[L("Hôm nay trời đẹp nhỉ? Ngồi vườn nhà cậu mát ghê!"),L("Mình mới học làm cốt dừa, hôm nào mang qua cậu thử nha."),L("Cây xoài kia mà ra trái, chấm muối ớt thì hết sẩy!"),L("Cậu có muốn cùng mình đi hái hoa ở đồi không?")]},
  {id:'hai',n:L("Hải"),role:L("Thợ sửa chữa, thích máy móc"),perk:L("Anh Hải sửa máy giúp — tiền sửa máy giảm một nửa."),perkS:L("Sửa máy giảm 50%"),
   lk:{style:'cap',cap:'#2c5a9a',skin:'#e0ae86',hair:'#1b1b22',iris:'#241812',shirt:'#3f6fb0',pants:'#2f3542',shoes:'#2b2b2b'},
   lines:[L("Máy pha mà kêu rè rè là do gioăng cũ đó, hư thì gọi anh."),L("Dây điện kéo ra xe cafe đi hơi ẩu, mưa nhớ coi chừng."),L("Anh đang để dành mua con Wave cũ, em để dành iPhone hả?")]},
  {id:'mai',n:L('Mai'),role:L("Khéo tay, nấu ăn ngon, quan tâm mọi người"),perk:L("Chị Mai gánh bánh mì bán ké góc vườn — +5% khách."),perkS:L("Bánh mì bán ké: +5% khách"),
   lk:{style:'bun',skin:'#f2c9a4',hair:'#3d2a1e',iris:'#3a2418',shirt:'#c4473a',pants:'#3b3b45',shoes:'#5a3a26'},
   lines:[L("Sáng mai chị gánh bánh mì qua bán ké góc vườn được không em?"),L("Cafe phải pha phin mới ra vị, máy móc chi cho tốn."),L("Phiên chợ mai đông lắm, nhớ chuẩn bị nhiều đá.")]},
  {id:'nam',n:L('Nam'),role:L("Giáo viên, thích đọc sách"),perk:L("Thầy Nam hướng dẫn điền hồ sơ — mỗi thủ tục nhanh hơn 1 ngày."),perkS:L("Giấy tờ nhanh hơn 1 ngày"),
   lk:{style:'short',glasses:true,skin:'#eebf98',hair:'#1b1b22',iris:'#241812',shirt:'#dfe6ee',pants:'#4a4a52',shoes:'#2b2b2b',buttons:true},
   lines:[L("Thủ tục giờ nộp trên dịch vụ công nhanh lắm, có VNeID là được."),L("Học trò anh hay rủ nhau ra đây ôn thi đó."),L("Ly cafe này... đậm vị tuổi thơ.")]},
  {id:'huong',n:L("Hương"),role:L("Yêu nghệ thuật, thích chụp ảnh"),perk:L("Hương chụp ảnh quán siêu xinh — clip TikTok dễ viral gấp đôi."),perkS:L('TikTok viral ×2'),
   lk:{style:'long',flower:true,skin:'#f7d3b0',hair:'#3d2a1e',iris:'#4a3020',shirt:'#8e5aa8',pants:'#3b2f45',shoes:'#efe8dc'},
   lines:[L("Nắng xuyên qua tán đa giờ này chụp ảnh đẹp xỉu!"),L("Cậu treo thêm đèn lồng đi, tối lên hình lung linh lắm."),L("Mình đăng ảnh vườn lên mạng, được mấy trăm tim rồi nè.")]},
  {id:'binh',n:L("Bình"),role:L("Ngư dân, mạnh mẽ, thích chụp phá"),perk:L("Anh Bình dẫn bạn thuyền tới — thêm khách quen mỗi ngày."),perkS:L("Bạn thuyền: +6 khách/ngày"),
   lk:{style:'band',cap:'#3a5a8a',skin:'#c58a5e',hair:'#2a1e1a',iris:'#241812',shirt:'#5a6b3a',pants:'#3d4a33',shoes:'#5a3a26'},
   lines:[L("Sáng nay ghe về trễ, ghé làm ly đen nóng cho tỉnh."),L("Mấy anh em bạn thuyền khen cafe em đậm đà."),L("Mai có cá ngon anh mang qua, khỏi khách sáo.")]},
  {id:'thao',n:L("Thảo"),role:L("Dịu dàng, làm vườn, yêu động vật"),perk:L("Thảo chỉ cách phủ rơm, ủ phân — cỏ dại mọc chậm một nửa."),perkS:L("Cỏ dại mọc chậm ½"),
   lk:{style:'khan',cap:'#6fa060',skin:'#eebf98',hair:'#2a1e1a',iris:'#3a2418',shirt:'#7fae68',pants:'#4a5a3a',shoes:'#5a3a26'},
   lines:[L("Cỏ dại mà để lâu là nó lấn hết cỏ thường đó, nhổ sớm nha."),L("Con gà mái nhà cậu mới đẻ trứng ở bụi chuối kìa!"),L("Phủ rơm quanh gốc cây thì giữ ẩm, đỡ cỏ mọc.")]},
  {id:'dung',n:L("Dũng"),role:L("Kiểm lâm, bảo vệ rừng"),perk:L("Anh Dũng tặng bình chữa cháy dư ở trạm — giấy PCCC miễn phí."),perkS:L("PCCC miễn phí"),
   lk:{style:'army',skin:'#d39a6e',hair:'#1b1b22',iris:'#241812',shirt:'#5a6b3a',pants:'#4a5a33',shoes:'#2b2b2b'},
   lines:[L("Mùa khô nhớ để bình chữa cháy chỗ dễ thấy nha."),L("Rừng phòng hộ đầu xã đẹp lắm, hôm nào rủ cả xóm lên chơi."),L("Đốt rác trong vườn coi chừng bén sang lũy tre.")]},
  {id:'truc',n:L("Trúc"),role:L("Bác sĩ trạm y tế xã"),perk:L("Bác sĩ Trúc khám sức khoẻ miễn phí cho quán."),perkS:L("Khám sức khoẻ miễn phí"),
   lk:{style:'long',skin:'#f7d3b0',hair:'#2a1e1a',iris:'#3a2418',shirt:'#f4f1ea',pants:'#d8dde4',shoes:'#efe8dc'},
   lines:[L("Uống cafe vừa thôi nha, đừng quá 3 ly một ngày."),L("Người pha chế nhớ khám sức khoẻ định kỳ đó."),L("Tuần này trạm y tế tiêm phòng cho trẻ, nhắn giùm bà con nha.")]},
  {id:'long',n:L('Long'),role:L("Chủ quán cơm, vui tính, hài hước"),perk:L("Anh Long giới thiệu khách quán cơm sang — +8% khách."),perkS:L("Khách quán cơm: +8%"),
   lk:{style:'spiky',skin:'#e0ae86',hair:'#1b1b22',iris:'#241812',shirt:'#a8322a',pants:'#2f3542',shoes:'#2b2b2b'},
   lines:[L("Ăn cơm quán anh, uống cafe quán em — combo trưa chuẩn bài!"),L("Hôm qua khách hỏi cafe ngon chỗ nào, anh chỉ qua đây liền."),L("Buôn bán quan trọng là cái duyên với cái nụ cười.")]},
  {id:'batu',n:L("Bà Tư"),role:L("Hiền hậu, nhiều kinh nghiệm"),perk:L("Bà Tư thương tình bớt 20% tiền thuê vườn (vườn nhà mình thì bà khen khắp xóm: +uy tín)."),perkS:L("Bớt 20% tiền thuê"),
   lk:{style:'bun',old:true,skin:'#e6b896',hair:'#d8d4cc',iris:'#3a2418',shirt:'#5a6b4a',pants:'#3b3b45',shoes:'#5a3a26'},
   lines:[L("Hồi bà còn trẻ, ly cafe có mấy hào thôi con ạ."),L("Cây đa đầu vườn trồng từ thời ông cố con đó."),L("Làm ăn thật thà thì trời thương, con nhé.")]}
];
const VILM=Object.fromEntries(VIL.map(v=>[v.id,v]));
const TIPS=[L("Ai gọi xưng công an, cán bộ thuế bắt cài ứng dụng qua đường link là lừa đảo đó nghe."),
  L("Khách chìa ảnh \"chuyển khoản thành công\" thì mở app ngân hàng coi tiền về chưa rồi hãy đưa hàng."),
  L("Mùa mưa cỏ mọc nhanh lắm, chịu khó nhổ, kẻo muỗi."),
  L("Cây to cho bóng mát, khách ngồi lâu, vườn đẹp thì khách ghé nhiều."),
  L("Hộ kinh doanh giờ tự khai thuế, doanh thu dưới ngưỡng vẫn phải nộp tờ khai đó."),
  L("Tết con cháu làm ăn xa về quê đông lắm, chuẩn bị nhiều đá với cafe."),
  L("Trồng luống rau thơm, bạc hà, sả ngay trong vườn thì đỡ tiền mua.")];

function addLog(day,msg,cls=''){ S.log.unshift({day,msg,cls}); if(S.log.length>300) S.log.pop(); }
function progress(){ return S.cash + S.deposit - S.start - debtSum(); }
function perk(id){ return !!(S&&S.vil&&S.vil[id]&&S.vil[id].h>=4); }
function curDay(){ return play?play.day:cfg().day; }
function refPrice(){ return LOC().ref*(.85+.15*EQ().q)+(perk('linh')?1000:0)+(S.refBonus||0); }
function docName(d){ if(d.id==='hdt'&&S&&S.city) return L("Hợp đồng thuê mặt bằng có công chứng"); return d.id==='hdt'&&S&&S.loc==='nha'?L("Giấy tờ nhà đất (vườn nhà mình)"):d.name; }
const docWhere=d=>S&&S.city&&d.whereP||d.where;
function docCost(d){ if(d.id==='hdt'&&S.loc==='nha') return 0; if(d.id==='health'&&perk('truc')) return 0; if(d.id==='pccc'&&perk('dung')) return 0; return d.cost; }
function docDays(d){ return Math.max(1,d.days-(perk('nam')?1:0)); }
function heart(id,d){ if(d>0) sfx('heart',300); const st=S.vil[id], was=st.h; st.h=clamp(st.h+d,0,10); if(was<4&&st.h>=4){ addLog(curDay(),L("Thân với {0}: {1}",VILM[id].n,VILM[id].perk),'good'); toast(`♥ ${VILM[id].n}: ${VILM[id].perkS}`,'good'); } }

/* Tết Nguyên đán (mùng 1): 06/02/2027, 26/01/2028 */
const TETS=[new Date(2027,1,6),new Date(2028,0,26)];
function tetInfo(dt){ for(const t of TETS){ const d=Math.round((dt-t)/864e5);
  if(d>=-3&&d<0) return {f:.75,msg:L("Cận Tết, nhà nào cũng lo sắm sửa, dọn nhà")};
  if(d===0) return {f:.3,msg:L("Mùng 1 Tết — đi chúc Tết, ít ai ra quán"),x3:true,lixi:true};
  if(d>=1&&d<=5) return {f:1.6,msg:L("Con cháu làm ăn xa về quê ăn Tết, vườn đông nghịt!"),x3:d<=2,cls:'good'}; } return null; }
function tetNear(day){ const dt=dateOf(day||0); return TETS.some(t=>{ const d=(dt-t)/864e5; return d>=-18&&d<=10; }); }
function coHon(dt){ return dt>=new Date(2027,7,3)&&dt<new Date(2027,8,1); }
