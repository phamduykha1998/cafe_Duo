// Thẻ tình huống đời thường, theo mùa, trong xóm, trên phố
/* ================= CHUYỆN TRONG XÓM ================= */
function trampled(){ S.layout.forEach(o=>{ if(o.id==='herb') o.d=S.day; }); }
const STORY=[
  // ---- tình huống đời thường: mỗi lựa chọn đụng tới chỉ số khác nhau (tiền, uy tín, khách quen, sức khoẻ, gia đình, độ sạch, tình làng) ----
  {id:'s_bao',t:L("Mây đen kéo tới"),who:L("Anh Bình"),w:.9,at:'q',cond:()=>[1,2].includes(seasonNow()),auto:0,
   txt:L("Anh Bình ngư dân chạy ngang la lớn: \"Bão rớt sắp vô đó em ơi, gió giật mạnh lắm!\" Khách đang ngồi kín vườn."),ch:[
   {t:L("Dọn bàn ghế, che chắn kỹ"),note:L("mệt, đỡ hư đồ"),fx:()=>{ S.energy-=10; S.clean+=5; return L("Cả buổi khuân vác ướt sũng, nhưng sáng mai vườn vẫn nguyên vẹn."); }},
   {t:L("Căng bạt bán tiếp cho người trú mưa"),note:L("có tiền, rất mệt, dễ dơ"),fx:()=>{ S.cash+=6e5; S.energy-=16; S.clean-=12; S.fans+=4; return L("Người trú mưa đông nghẹt, ly nóng bán chạy. Mưa tạt làm vườn lầy lội."); }},
   {t:L("Đóng cửa sớm, về với nhà"),note:L("gia đình vui, mất buổi bán"),fx:()=>{ S.cash-=2e5; S.fam+=8; S.energy+=6; return L("Cả nhà ngồi nghe mưa, nấu nồi cháo. Mất một buổi bán nhưng lòng nhẹ tênh."); }}]},
  {id:'hocsinh',t:L("Học sinh ngồi học nhờ"),who:L("Nhóm học sinh"),w:.8,auto:1,
   txt:L("Năm đứa học sinh lớp 12 xin ngồi ôn thi cả buổi, mỗi đứa gọi đúng một ly trà đá, cắm sạc điện thoại."),ch:[
   {t:L("Cho ngồi thoải mái, tặng thêm đá"),note:L("tốn chút, được lòng"),fx:()=>{ S.cash-=5e4; S.fans+=8; S.rep+=.02; seed(8,'hs_dau'); return L("Tụi nhỏ rủ thêm cả lớp ghé. \"Quán ruột mùa thi\" ra đời."); }},
   {t:L("Giới hạn 2 tiếng mỗi bàn"),note:L("giữ chỗ cho khách khác"),fx:()=>{ S.fans+=2; return L("Tụi nhỏ dạ vâng, tới giờ thì dọn đi. Ai cũng vui."); }},
   {t:L("Thu thêm 5.000đ tiền điện, wifi"),note:L("có tiền, mất cảm tình"),fx:()=>{ S.cash+=1e5; S.rep-=.03; S.fans-=3; return L("Tụi nhỏ trả, nhưng đăng lên nhóm lớp: \"Quán gì tính cả tiền sạc.\""); }}]},
  {id:'chohoang',t:L("Chú chó lạc"),who:L("Chị Thảo"),w:.7,at:'q',once:1,auto:2,
   txt:L("Một chú chó vàng gầy nhom cứ nằm trước cổng tre, ai vào cũng vẫy đuôi. Chị Thảo thương động vật nhìn bạn chờ đợi."),ch:[
   {t:L("Nhận nuôi làm \"quản lý quán\""),note:L("khách thích, tốn thức ăn"),fx:()=>{ S.cash-=3e5; S.clean-=4; S.fans+=6; addBoost(1.06,4,L("Chó quản lý")); heart('thao',1.5); S.flags.dog=1; seed(7,'cho_con'); return L("Đặt tên là \"Cà Phê\". Khách tới là xin chụp hình với nó."); }},
   {t:L("Cho ăn rồi nhờ chị Thảo tìm chủ"),note:L("tình làng"),fx:()=>{ S.cash-=5e4; heart('thao',1); S.rep+=.01; return L("Hai hôm sau chủ nó tìm tới, cảm ơn rối rít."); }},
   {t:L("Đuổi đi cho sạch sẽ"),note:L("sạch, mất lòng"),fx:()=>{ S.clean+=3; heart('thao',-1); S.rep-=.02; return L("Chú chó lủi thủi đi. Chị Thảo không nói gì, chỉ lắc đầu."); }}]},
  {id:'say',t:L("Khách say quậy"),who:L("Bàn số 3"),w:.7,auto:0,
   txt:L("Mấy ông đi nhậu đám giỗ về, ghé quán nói lớn, chửi thề, khách khác bắt đầu đứng dậy."),ch:[
   {t:L("Pha trà gừng giải rượu, nhẹ nhàng mời về"),note:L("mệt, giữ không khí"),fx:()=>{ S.energy-=6; S.cash-=3e4; S.rep+=.02; return L("Mấy ông uống xong ngà ngà, bắt tay xin lỗi rồi về. Khách khác vỗ tay."); }},
   {t:L("Nhờ anh Dũng kiểm lâm ra nói giùm"),note:L("tình làng"),req:()=>S.city?L("Anh Dũng ở quê, không ở phố"):S.vil.dung.h>=2||L("cần ♥2 với Dũng"),fx:()=>{ heart('dung',.5); S.rep+=.01; return L("Anh Dũng ra đứng một chút là êm re."); }},
   {t:L("Kệ, miễn trả tiền"),note:L("có tiền, mất khách"),fx:()=>{ S.cash+=1.2e5; S.fans-=5; S.rep-=.03; seed(3,'say_lai'); return L("Mấy ông gọi thêm mồi, nhưng hai bàn khách quen bỏ về luôn."); }}]},
  {id:'phen',t:L("Nước giếng nhiễm phèn"),who:L("Chị Trúc"),w:.7,cond:()=>!S.city&&!S.flags.loc,auto:1,
   txt:L("Nước giếng đục vàng, đá làm ra có mùi tanh. Chị Trúc y tế xã dặn: \"Pha đồ uống phải dùng nước sạch nghen em.\""),ch:[
   {t:L("Lắp bộ lọc 1,5 triệu"),note:L("tốn một lần, sạch lâu dài"),fx:()=>{ S.cash-=1.5e6; S.clean+=12; S.flags.loc=1; heart('truc',1); return L("Nước trong veo, ly trà đá ngon hẳn."); }},
   {t:L("Mua nước bình mỗi ngày"),note:L("giá vốn tăng"),fx:()=>{ S.cogsMul*=1.04; S.clean+=5; return L("Ổn, nhưng tháng nào cũng tốn thêm tiền nước."); }},
   {t:L("Lắng phèn tạm bằng vôi"),note:L("rẻ, hên xui"),chance:()=>[[L("Cơ bản"),.5],[L("Thân với Trúc"),S.vil.truc.h*.04]],fx:ok=>{ if(ok){ S.cash-=5e4; return L("Nước trong được kha khá. Tạm ổn."); } S.rep-=.05; S.clean-=10; return L("Khách chê trà có mùi lạ. Mấy người bỏ ly giữa chừng."); }}]},
  {id:'om',t:L("Bạn bị cảm sốt"),who:L("Bạn"),w:.8,at:'q',cond:()=>S.energy<70,auto:0,
   txt:L("Sáng dậy đầu nóng hầm hập, cổ họng rát. Hôm nay lại đúng phiên chợ, khách đông."),ch:[
   {t:L("Nghỉ hẳn hai ngày"),note:L("hồi sức, mất tiền bán"),fx:()=>{ S.energy+=28; S.cash-=6e5; S.fam+=3; return L("Ngủ một giấc dài, uống cháo hành. Người khoẻ ra hẳn."); }},
   {t:L("Uống thuốc rồi gắng bán"),note:L("có tiền, kiệt sức"),fx:()=>{ S.energy-=14; S.cash+=2e5; S.clean-=6; return L("Bán được, nhưng pha ẩu, quên rửa ly mấy lần."); }},
   {t:L("Nhờ chị Mai trông quán giùm"),note:L("tình làng, đỡ mệt"),fx:()=>{ S.cash-=3e5; S.energy+=14; heart('mai',1); return L("Chị Mai đứng quầy rành rọt, còn bán kèm bánh mì."); }}]},
  {id:'s_gio',t:L("Đám giỗ ông nội"),who:L("Mẹ gọi điện"),w:.8,auto:0,
   txt:L("\"Cuối tuần giỗ ông nội đó con, về sớm phụ mẹ làm cỗ. Bà con xa gần về đông lắm.\""),ch:[
   {t:L("Đóng quán một ngày, về phụ"),note:L("gia đình, mất 1 ngày bán"),fx:()=>{ S.fam+=14; S.cash-=4e5; S.energy+=4; return L("Cả họ quây quần. Bác hai khen \"thằng/cái này giờ làm chủ rồi\"."); }},
   {t:L("Gửi tiền về, xin phép vắng"),note:L("tốn tiền, gia đình hơi buồn"),fx:()=>{ S.cash-=1e6; S.fam+=3; return L("Mẹ nhận tiền, dặn \"lần sau nhớ về nghe con\"."); }},
   {t:L("Mang cà phê về đãi cả họ"),note:L("gia đình + quảng bá"),fx:()=>{ S.cash-=3e5; S.fam+=10; S.fans+=5; S.energy-=6; return L("Cả họ khen cà phê ngon, ai cũng xin địa chỉ quán."); }}]},
  {id:'nhanh',t:L("Nhà vườn bán cà phê nhân"),who:L("Bạn cũ ở Buôn Ma Thuột"),w:.8,auto:2,
   txt:L("Người quen ở Buôn Ma Thuột gửi lời: cà phê nhân Robusta vụ mới, giá vườn, mua sỉ 3 tháng thì rẻ hơn ngoài chợ."),ch:[
   {t:L("Mua sỉ 3 tháng (4 triệu)"),note:L("giá vốn giảm lâu dài"),fx:()=>{ S.cash-=4e6; S.cogsMul*=.9; return L("Bao tải cà phê thơm nức góc bếp. Mỗi ly rẻ hơn hẳn."); }},
   {t:L("Mua thử 5kg, tự rang"),note:L("mệt, khách chịu giá cao hơn"),fx:()=>{ S.cash-=8e5; S.energy-=8; S.refBonus=(S.refBonus||0)+500; seed(5,'rang_ban'); return L("Rang bơ thơm cả xóm. Khách khen \"cà phê nhà làm có khác\"."); }},
   {t:L("Thôi, mua bột ngoài chợ như cũ"),note:L("không đổi"),fx:()=>L("Giữ tiền mặt cho chắc.")}]},
  {id:'hoithi',t:L("Hội thi pha chế của xã"),who:L('Anh Nam'),w:.6,at:'q',auto:1,
   txt:L("Đoàn thanh niên xã tổ chức \"Hội thi ly cà phê quê\". Anh Nam rủ: \"Em đi thi đi, giải nhất được lên báo huyện đó!\""),ch:[
   {t:L("Đăng ký thi (200.000đ)"),cost:2e5,chance:()=>[[L("Cơ bản"),.35],[L("Máy pha tốt"),EQ().q*.08],[L("Uy tín"),(S.rep-1)*.3],[L("Thân với Linh"),S.vil.linh.h*.03]],
    fx:ok=>{ heart('nam',.5); if(ok){ S.rep+=.08; S.fans+=15; addBoost(1.15,3,L("Giải hội thi")); seed(3,'hoithi_bao'); return L("Giải nhất! Ảnh bạn cầm cúp lên trang của xã."); } S.energy-=5; return L("Không có giải, nhưng học được cách đánh kem trứng của người ta.{0}",lesson('thi',L("đi thi để học, không phải chỉ để thắng."))); }},
   {t:L("Đi cổ vũ, phát cà phê miễn phí"),note:L("quảng bá, tốn ít"),fx:()=>{ S.cash-=2.5e5; S.fans+=7; S.rep+=.02; heart('nam',1); return L("Ly nào phát ra cũng có tên quán trên nắp. Khách mới ghé liền."); }},
   {t:L("Thôi, ở nhà bán"),note:L("không đổi"),fx:()=>{ S.cash+=1e5; return L("Hôm đó cả xã đi xem thi, quán vắng hoe nhưng cũng có đồng ra đồng vào."); }}]},
  {id:'dulich',t:L("Đoàn khách homestay"),who:L("Chị Hương"),w:.7,at:'q',auto:1,
   txt:L("Chị Hương quen chủ homestay: \"Cuối tuần có đoàn 25 khách Tây muốn trải nghiệm pha phin buổi sáng, em nhận không?\""),ch:[
   {t:L("Nhận, tự làm hết"),note:L("nhiều tiền, rất mệt"),fx:()=>{ S.cash+=1.8e6; S.energy-=20; S.clean-=10; S.fans+=6; seed(6,'homestay'); return L("Khách Tây thích mê, chụp hình ly phin mỏi tay."); }},
   {t:L("Nhận, thuê thêm người phụ hôm đó"),note:L("ít tiền hơn, đỡ mệt"),fx:()=>{ S.cash+=1.1e6; S.energy-=6; S.fans+=6; heart('huong',1); seed(6,'homestay'); return L("Ổn áp. Chị Hương còn chụp ảnh đẹp cho quán."); }},
   {t:L("Từ chối, quán nhỏ lo không xuể"),note:L("không đổi"),fx:()=>{ heart('huong',-.5); return L("Chị Hương hơi tiếc: \"Thôi để dịp khác nghen.\""); }}]},
  {id:'s_trom',t:L("Mất trộm ban đêm"),who:L("Bạn"),w:.6,at:'q',cond:()=>S.layout.some(o=>o.id==='ghe'||o.id==='du'),auto:0,
   txt:L("Sáng ra vườn thấy thiếu một bộ bàn ghế, dấu bánh xe ba gác in trên đất."),ch:[
   {t:L("Lắp đèn cảm biến + khoá xích"),note:L("tốn, yên tâm"),fx:()=>{ S.cash-=7e5; S.flags.lock=1; return L("Đêm nào đèn cũng chớp sáng khi mèo đi ngang. Yên tâm hẳn."); }},
   {t:L("Báo công an xã, nhờ xóm để ý"),note:L("hên xui"),chance:()=>[[L("Cơ bản"),.3],[L("Thân với Dũng"),S.vil.dung.h*.05],[L("Thân với Long"),S.vil.long.h*.04]],fx:ok=>{ if(ok){ S.rep+=.02; return L("Anh Dũng phát hiện bộ bàn ghế bị bỏ ở bìa rừng. Mang về được!"); }
      const i=S.layout.findIndex(o=>o.id==='ghe'||o.id==='du'); if(i>=0) S.layout.splice(i,1); return L("Không tìm lại được. Vườn trống một góc."); }},
   {t:L("Thả \"Cà Phê\" ngủ ngoài vườn canh"),note:L("nhờ chú chó"),req:()=>S.flags.dog||L("Chưa nuôi chó"),fx:()=>{ S.flags.lock=1; heart('thao',.5); return L("Đêm thứ ba \"Cà Phê\" sủa ầm lên. Tên trộm bỏ chạy, để lại bộ bàn ghế ngay cổng."); }},
   {t:L("Thôi, của đi thay người"),note:L("mất đồ"),fx:()=>{ const i=S.layout.findIndex(o=>o.id==='ghe'||o.id==='du'); if(i>=0) S.layout.splice(i,1); S.energy+=3; return L("Bạn thở dài, mai mua lại sau."); }}]},
  {id:'s_trung',t:L("Linh dạy làm cà phê trứng"),who:'Linh',w:.6,at:'q',cond:()=>!S.flags.trung&&S.vil.linh.h>=2,auto:0,
   txt:L("Linh hào hứng: \"Để em chỉ chị/anh đánh kem trứng kiểu Hà Nội, sánh mịn không tanh. Khách thành phố mê lắm!\""),ch:[
   {t:L("Học liền, bán thêm món mới"),note:L("mệt, khách chịu giá cao hơn"),fx:()=>{ S.flags.trung=1; S.energy-=8; S.cash-=2e5; S.refBonus=(S.refBonus||0)+1000; heart('linh',1); seed(5,'trung_hu'); return L("Ly cà phê trứng đầu tiên vàng óng, thơm béo. Bán chạy ngay tuần đầu."); }},
   {t:L("Mời Linh ly cà phê, hẹn khi rảnh"),note:L("tình làng"),fx:()=>{ heart('linh',.5); return L("Linh cười: \"Vậy tuần sau nha!\""); }}]},
  {id:'racthai',t:L("Rác ven đường trước cổng"),who:L("Bà Tư"),w:.6,at:'q',auto:1,
   txt:L("Ai đó đổ một bao rác ngay mương trước cổng quán. Ruồi bu, khách đi ngang nhăn mặt."),ch:[
   {t:L("Tự dọn và đặt thùng rác có nắp"),note:L("mệt, sạch hẳn"),fx:()=>{ S.cash-=1.5e5; S.energy-=5; S.clean+=12; S.rep+=.02; return L("Cổng quán sạch tinh, bà Tư khen nức nở."); }},
   {t:L("Rủ cả xóm cùng dọn chủ nhật"),note:L("tình làng rộng"),fx:()=>{ S.energy-=3; S.clean+=8; ['batu','thao','nam','long'].forEach(id=>heart(id,.5)); return L("Cả xóm cùng làm, xong ngồi uống trà đá cười nói rôm rả."); }},
   {t:L("Kệ, không phải rác nhà mình"),note:L("dơ, mất uy tín"),fx:()=>{ S.clean-=12; S.rep-=.03; return L("Mấy hôm sau trời nắng, mùi bốc lên tận quầy."); }}]},
  {id:'banchiu',t:L("Khách quen xin ghi sổ"),who:L("Chú Sáu xe ôm"),w:.6,at:'q',auto:1,
   txt:L("\"Con ơi, tháng này chú kẹt, ghi sổ cho chú uống tới cuối tháng nghen, có lương xe ôm chú trả đủ.\""),ch:[
   {t:L("Ghi sổ cho chú"),note:L("giữ khách, có rủi ro"),fx:()=>{ S.lent.push({who:L("Chú Sáu"),amt:4.5e5,due:S.day+30,p:.75}); S.fans+=3; S.rep+=.01; return L("Chú Sáu cảm động, đi đâu cũng khen quán."); }},
   {t:L("Mời chú ly hôm nay, còn lại trả tiền mặt"),note:L("nhẹ nhàng"),fx:()=>{ S.cash-=1.6e4; return L("Chú cười xoà: \"Ừ, sòng phẳng vậy là phải.\""); }}]},
  {id:'chophien',t:L("Phiên chợ quê đầu tháng"),who:L("Chị Mai"),w:.7,cond:()=>!S.city,auto:1,
   txt:L("Chị Mai rủ: \"Mai phiên chợ, em đẩy xe ra góc chợ bán buổi sáng đi, người ta đi chợ sớm khát nước lắm.\""),ch:[
   {t:L("Đẩy xe ra chợ bán"),note:L("có tiền, mệt, thêm khách mới"),fx:()=>{ S.cash+=7e5; S.energy-=12; S.fans+=6; heart('mai',.5); return L("Bán hết sạch hai bình đá. Mấy cô bán rau hẹn chiều ghé quán."); }},
   {t:L("Gửi chị Mai bán ké vài chục ly"),note:L("nhẹ nhàng"),fx:()=>{ S.cash+=2.5e5; heart('mai',1); return L("Chị Mai bán giùm, còn mang về rổ rau thơm tặng."); }},
   {t:L("Ở nhà nghỉ ngơi"),note:L("hồi sức"),fx:()=>{ S.energy+=8; return L("Một buổi sáng thong thả hiếm hoi."); }}]},
  // ---- theo mùa ----
  {id:'mai_no',t:L("Mai vàng nở sớm"),who:L("Bà Tư"),w:.9,at:'q',cond:()=>seasonNow()===0,auto:0,
   txt:L("Gần Tết, gốc mai trong vườn bung nở vàng rực. Bà Tư bảo: \"Năm nay mai nở đẹp là làm ăn phát đạt đó con.\""),ch:[
   {t:L("Làm góc chụp hình Tết, treo câu đối"),note:L("tốn chút, đông khách"),fx:()=>{ S.cash-=4e5; addBoost(1.15,3,L("Góc chụp hình Tết")); S.fans+=5; return L("Thanh niên về quê ăn Tết kéo nhau ra chụp hình, gọi nước liên tục."); }},
   {t:L("Lì xì bà Tư, mời cả xóm ly trà đầu năm"),note:L("tình làng"),fx:()=>{ S.cash-=3e5; ['batu','long','mai'].forEach(id=>heart(id,.7)); S.rep+=.03; return L("\"Đầu năm mở hàng thơm tho, cả năm hên!\" — bà Tư cười móm mém."); }}]},
  {id:'nangnong',t:L("Nắng nóng 39 độ"),who:L("Bạn"),w:.9,at:'q',cond:()=>seasonNow()===1,auto:1,
   txt:L("Trời hầm hập, đá tan nhanh như chớp, khách thì đòi đá liên tục. Tủ đá nhỏ không theo kịp."),ch:[
   {t:L("Mua thùng đá xốp to + đặt đá cây"),note:L("giá vốn tăng, khách khỏi chờ"),fx:()=>{ S.cash-=6e5; S.cogsMul*=1.02; S.fans+=4; return L("Đá lúc nào cũng đầy, khách gọi là có liền."); }},
   {t:L("Bán thêm chanh đá, sâm dứa giải nhiệt"),note:L("bận hơn, có thêm tiền"),fx:()=>{ S.cash+=5e5; S.energy-=10; return L("Bình sâm dứa hết veo trước trưa."); }},
   {t:L("Nghỉ trưa 11–14h cho đỡ mệt"),note:L("đỡ mệt, mất khách trưa"),fx:()=>{ S.energy+=10; S.fans-=2; return L("Ngủ trưa trên võng dưới tán xoài. Đã gì đâu."); }}]},
  {id:'trungthu',t:L("Trung thu trong xóm"),who:L('Anh Long'),w:.9,at:'q',cond:()=>seasonNow()===2,auto:0,
   txt:L("Rằm tháng Tám, con nít trong xóm rước đèn ồn ào. Anh Long rủ góp tiền làm mâm cỗ trông trăng ngay sân quán."),ch:[
   {t:L("Góp tiền, mở cửa tới khuya"),note:L("đông vui, mệt"),fx:()=>{ S.cash-=5e5; S.fans+=8; S.rep+=.03; S.energy-=8; ['long','thao','nam'].forEach(id=>heart(id,.5)); return L("Đèn ông sao lấp lánh khắp vườn, người lớn uống trà, con nít phá cỗ."); }},
   {t:L("Bán bánh nướng kèm cà phê đen"),note:L("có tiền"),fx:()=>{ S.cash+=6e5; S.energy-=5; return L("Combo bánh nướng + đen đá bán hết veo."); }},
   {t:L("Đóng cửa sớm, rước đèn với con cháu"),note:L("gia đình"),fx:()=>{ S.fam+=10; S.cash-=1.5e5; return L("Tối đó cả nhà đi rước đèn, cười suốt."); }}]},
  {id:'retdam',t:L("Rét đậm rét hại"),who:L("Bạn"),w:.9,at:'q',cond:()=>seasonNow()===3,auto:0,
   txt:L("Gió bấc thổi buốt, 12 độ. Vườn trống trơn vì ai cũng ngại ngồi ngoài trời."),ch:[
   {t:L("Quây bạt, đốt bếp than sưởi"),note:L("tốn, giữ khách"),fx:()=>{ S.cash-=8e5; S.fans+=5; addBoost(1.1,3,L("Bếp than sưởi ấm")); S.clean-=5; return L("Khách xúm quanh bếp than, ly gừng nóng bán đắt như tôm tươi."); }},
   {t:L("Chuyển sang bán mang đi, ship Zalo"),note:L("đỡ tốn, ít khách quen"),fx:()=>{ S.cash+=3e5; S.fans-=2; return L("Đơn ship đều đều, nhưng vườn vắng lặng."); }},
   {t:L("Cho mình nghỉ đông vài hôm"),note:L("hồi sức, gia đình"),fx:()=>{ S.energy+=18; S.fam+=6; S.cash-=4e5; return L("Trùm chăn, uống trà gừng, xem phim với cả nhà."); }}]},
  {id:'muon',t:L("Hàng xóm hỏi mượn tiền"),who:L("Ông Năm"),at:'q',cond:()=>S.cash>6e6,auto:1,
   txt:L("Ông Năm đầu ngõ sang: \"Cháu ơi, cho bác mượn 2 triệu đóng học cho thằng cháu, cuối tháng bán lứa gà bác trả.\""),ch:[
   {t:L("Cho mượn 2 triệu"),fx:()=>{ S.cash-=2e6; S.lent.push({who:L("Ông Năm"),amt:2e6,due:S.day+30,p:.8}); return L("Ông Năm cảm ơn rối rít, hứa cuối tháng trả."); }},
   {t:L("Từ chối khéo"),fx:()=>{ S.rep-=.01; return L("\"Dạ tháng này cháu kẹt quá bác ạ.\" Ông Năm gật gù, hơi buồn."); }}]},
  {id:'hui',t:L("Rủ chơi hụi"),who:L("Chị Mai"),at:'q',cond:()=>!S.hui&&S.cash>5e6,auto:1,
   txt:L("Chị Mai rủ: \"Bà Hai xóm trên mở dây hụi tháng 1 triệu, 10 phần. Hốt cuối được 10 triệu rưỡi đó em!\""),ch:[
   {t:L("Tham gia (1 triệu/tháng)"),fx:()=>{ S.hui={start:S.day,paid:0}; return L("Bạn ghi tên vào dây hụi. Cuối tháng góp kỳ đầu."); }},
   {t:L("Thôi, giữ tiền làm vốn"),fx:()=>L("Chị Mai: \"Ừ, để dịp khác nghen.\"")}]},
  {id:'cuoi',t:L("Thiệp cưới"),who:L("Anh Dũng"),at:'q',once:1,auto:1,
   txt:L("Anh Dũng kiểm lâm cưới vợ, mời cả xóm ăn cỗ ngoài sân đình. Phong bì mừng bao nhiêu?"),ch:[
   {t:L("Mừng 500.000đ"),fx:()=>{ S.cash-=5e5; S.rep+=.03; heart('dung',2); return L("Anh Dũng bắt tay thật chặt. Cả xóm khen bạn chịu chơi."); }},
   {t:L("Mừng 300.000đ"),fx:()=>{ S.cash-=3e5; S.rep+=.01; heart('dung',1); return L("Ăn cỗ vui vẻ, về muộn."); }},
   {t:L("Bận bán, gửi lời chúc"),fx:()=>{ S.rep-=.02; return L("Có người xì xào \"làm ăn mà không đi đám\"."); }}]},
  {id:'veso',t:L("Vé số dạo"),who:L("Chú vé số"),auto:2,
   txt:L("Chú bán vé số dạo ghé vườn: \"Mua giùm chú vài tờ, 10 nghìn một tờ, hôm nay chắc chắn trúng!\""),ch:[
   {t:L("Mua 5 tờ (50.000đ)"),fx:()=>{ S.cash-=5e4; const x=R(); if(x<.01){ S.cash+=1e7; return L("TRÚNG 10 TRIỆU! Cả xóm kéo đến ăn mừng."); } if(x<.12){ S.cash+=1e5; return L("Trúng an ủi 100.000đ. Hên xui!"); } return L("Trật lất. Thôi coi như ủng hộ chú."); }},
   {t:L("Mua 1 tờ ủng hộ"),fx:()=>{ S.cash-=1e4; if(R()<.05){ S.cash+=1e5; return L("Trúng 100.000đ, vui cả ngày!"); } return L("Không trúng, nhưng chú cười tươi."); }},
   {t:L("Không mua"),fx:()=>L("Chú đi tiếp sang nhà bên.")}]},
  {id:'luadao',t:L("Cuộc gọi lạ"),who:L("Số lạ"),auto:0,
   txt:L("Một người gọi xưng \"cán bộ thuế\", bảo hồ sơ hộ kinh doanh của bạn sai thông tin, phải bấm đường link gửi qua Zalo để cài ứng dụng \"cập nhật\", không thì bị phạt."),ch:[
   {t:L("Cúp máy, tự đi hỏi lại cơ quan thuế"),fx:()=>{ S.rep+=.01; return L("Cán bộ thuế: \"Lừa đảo đó em! Cơ quan nhà nước không gọi bắt cài app qua link. Thủ tục thật làm trên dịch vụ công hoặc tại bộ phận một cửa.\""); }},
   {t:L("Làm theo hướng dẫn"),fx:()=>{ const l=Math.max(0,Math.min(S.cash,8e6)); S.cash-=l; S.tot.scam+=l; return L("Ứng dụng lạ chiếm quyền điện thoại, tài khoản bị rút {0}. Bạn ra công an xã trình báo, nhưng khó lấy lại.",vnd(l)); }}]},
  {id:'billgia',t:L("Ảnh chuyển khoản"),who:L("Khách lạ"),auto:0,
   txt:L("Một khách lạ mua 12 ly mang về, chìa màn hình \"chuyển khoản thành công\" rồi giục: \"Anh vội lắm em ơi, đưa nhanh giùm!\""),ch:[
   {t:L("Mở app ngân hàng kiểm tra"),fx:()=>{ if(R()<.6) return L("Tiền chưa về. Khách lạ lẩm bẩm rồi phóng xe đi mất — đó là ảnh chụp giả."); S.cash+=12*(S.price-EQ().cogs); return L("Tiền đã về đủ. Cẩn thận vẫn hơn!"); }},
   {t:L("Tin khách, đưa hàng"),fx:()=>{ if(R()<.6){ const c=12*EQ().cogs; S.cash-=c; S.tot.scam+=c; return L("Tối kiểm tra không thấy tiền. Mất {0} nguyên liệu và công pha.",vnd(c)); } S.cash+=12*(S.price-EQ().cogs); return L("May quá, tiền về thật."); }}]},
  {id:'bongda',t:L("Tối nay đá bóng"),who:L('Anh Long'),at:'q',auto:1,
   txt:L("Tối nay tuyển Việt Nam đá bán kết. Anh Long: \"Kéo màn chiếu ra vườn đi em, cả xóm qua coi!\""),ch:[
   {t:L("Thuê máy chiếu (300.000đ)"),fx:()=>{ S.cash-=3e5; S.today=Object.assign(S.today||{},{mul:((S.today&&S.today.mul)||1)*1.5}); heart('long',1); return L("Cả xóm hò reo, vườn chật kín người!"); }},
   {t:L("Thôi, bán bình thường"),fx:()=>{ S.today=Object.assign(S.today||{},{mul:((S.today&&S.today.mul)||1)*.9}); return L("Tối nay chắc vắng, ai cũng ở nhà coi tivi."); }}]},
  {id:'trau',t:L("Trâu phá vườn"),who:L("Ông Năm"),at:'q',cond:()=>S.layout.some(o=>o.id==='herb'),auto:1,
   txt:L("Trâu nhà ông Năm sổng chuồng, đi lạc vào vườn giẫm nát luống rau thơm!"),ch:[
   {t:L("Đòi đền 200.000đ"),fx:()=>{ S.cash+=2e5; S.rep-=.01; trampled(); return L("Ông Năm đền tiền, nhưng mặt không vui."); }},
   {t:L("Thôi, chỗ hàng xóm"),fx:()=>{ S.rep+=.02; trampled(); return L("Ông Năm áy náy, hôm sau mang biếu chục trứng gà."); }}]},
  {id:'xoai',t:L("Bọn nhỏ hái trộm xoài"),who:L("Bọn trẻ"),at:'q',cond:()=>seasonOf(dateOf(S.day))<=1,auto:1,
   txt:L("Mấy đứa nhỏ trong xóm trèo cây xoài hái trộm, thấy bạn thì đứng hình."),ch:[
   {t:L("La một trận"),fx:()=>{ S.rep-=.01; return L("Tụi nhỏ chạy mất dép."); }},
   {t:L("Cho tụi nhỏ, dặn đừng trèo cao"),fx:()=>{ S.rep+=.02; return L("Tụi nhỏ dạ ran. Tối về méc mẹ, mẹ tụi nó ra uống cafe ủng hộ."); }}]},
  {id:'robusta',t:L("Giá cà phê nhân tăng"),who:L("Đại lý cà phê"),auto:1,
   txt:L("Đại lý báo giá cà phê nhân Robusta lại tăng do mất mùa. Nguyên liệu đắt thêm khoảng 10%."),ch:[
   {t:L("Tăng giá bán 2.000đ"),fx:()=>{ S.cogsMul*=1.1; S.price+=2000; return L("Vài khách quen càm ràm, nhưng thông cảm."); }},
   {t:L("Giữ giá, chịu lời ít"),fx:()=>{ S.cogsMul*=1.1; S.rep+=.02; return L("Khách quý vì bạn giữ giá."); }}]},
  {id:'cupdien',t:L("Lịch cắt điện"),who:L("Điện lực"),cond:()=>{ const m=dateOf(S.day).getMonth(); return m>=3&&m<=6; },auto:0,
   txt:L("Điện lực thông báo: cắt điện từ 7h đến 17h để bảo trì đường dây."),ch:[
   {t:L("Thuê máy phát (250.000đ)"),fx:()=>{ S.cash-=2.5e5; return L("Máy phát nổ phành phạch, quán vẫn bán."); }},
   {t:L("Chỉ bán cafe phin, đá cây"),fx:()=>{ S.today=Object.assign(S.today||{},{mul:.65}); return L("Không có máy xay, máy pha… khách ít hơn."); }}]},
  {id:'phunu',t:L("Vốn vay ưu đãi"),who:L("Hội Phụ nữ xã"),at:'q',once:1,cond:()=>!S.debts.length&&S.day>10,auto:1,
   txt:L("Chị chi hội trưởng: \"Có nguồn vốn hỗ trợ hộ kinh doanh nhỏ: vay 20 triệu, góp 1,75 triệu/tháng trong 12 tháng (tổng lãi 1 triệu).\""),ch:[
   {t:L("Vay 20 triệu"),fx:()=>{ S.cash+=2e7; addDebt({k:'bank',n:L("Vay Hội Phụ nữ"),owe:2.1e7,pay:4.4e5}); return L("Nhận 20 triệu tiền mặt. Mỗi tuần trừ 440 nghìn."); }},
   {t:L("Không vay"),fx:()=>L("Chị hội trưởng dặn khi cần thì cứ báo.")}]},
  {id:'me',t:L("Mẹ gọi điện"),who:L("Mẹ"),once:1,auto:1,
   txt:L("Mẹ gọi: \"Con làm ăn được không? Nhà mình sắp đóng tiền điện, con gửi về mẹ ít nha.\""),ch:[
   {t:L("Gửi mẹ 1 triệu"),fx:()=>{ S.cash-=1e6; S.rep+=.01; return L("Mẹ mừng lắm: \"Con giữ sức khoẻ nha.\""); }},
   {t:L("Gửi 300 nghìn, hẹn tháng sau"),fx:()=>{ S.cash-=3e5; return L("Mẹ bảo: \"Ừ, con lo làm ăn trước.\""); }}]},
  {id:'truongthon',t:L("Trưởng thôn ghé"),who:L("Bác trưởng thôn"),at:'q',cond:()=>S.open&&S.docs.hkd.st!=='done',auto:0,
   txt:L("Bác trưởng thôn ghé uống cafe, nhắc khéo: \"Mở quán thì đăng ký hộ kinh doanh ở xã cho đàng hoàng nghe cháu, đợt này xã hay đi kiểm tra.\""),ch:[
   {t:L("Dạ, cháu đi làm liền"),fx:()=>L("Bác gật gù, trả tiền ly cafe đàng hoàng. (Mở \"Giấy tờ\" để nộp hồ sơ.)")}]},
  {id:'hoanghang',t:L("Họ hàng ghé chơi"),who:L("Cô Ba bên nội"),auto:0,
   txt:L("Cô Ba bên nội dẫn cả nhà ghé chơi, 8 người kêu nước."),ch:[
   {t:L("Mời hết, không lấy tiền"),fx:()=>{ S.cash-=8*EQ().cogs; S.rep+=.02; return L("Cô Ba khen cháu giỏi, đi khoe khắp họ."); }},
   {t:L("Lấy giá vốn thôi"),fx:()=>L("Cô Ba trả tiền, hơi ngượng nhưng vui vẻ.")}]},
  {id:'gio',t:L("Mừng thọ bà Sáu"),who:L("Con dâu bà Sáu"),at:'q',once:1,auto:1,
   txt:L("Nhà bên làm tiệc mừng thọ bà Sáu tròn 80 tuổi, sang hỏi mượn bàn ghế cả ngày."),ch:[
   {t:L("Cho mượn"),fx:()=>{ S.today=Object.assign(S.today||{},{half:1}); S.rep+=.03; return L("Hôm nay quán còn nửa chỗ ngồi. Tối đó nhà bà Sáu mang mâm xôi gà, đĩa bánh thọ sang biếu."); }},
   {t:L("Ngại quá, quán cần dùng"),fx:()=>{ S.rep-=.01; return L("Bà Sáu đi mượn nhà khác."); }}]},
  {id:'chuot',t:L("Chuột cắn bao cà phê"),who:L("Góc kho"),auto:0,
   txt:L("Sáng ra thấy chuột cắn thủng bao cà phê và hộp đường dưới gầm xe."),ch:[
   {t:L("Mua thùng kín, đặt bẫy (350.000đ)"),fx:()=>{ S.cash-=3.5e5; return L("Kho gọn gàng, đúng chuẩn vệ sinh."); }},
   {t:L("Thả \"Cà Phê\" canh kho ban đêm"),req:()=>(S.flags.dog&&!S.city)||L("Chưa nuôi chó"),fx:()=>{ S.clean+=3; return L("Hai đêm liền \"Cà Phê\" lùng sục gầm xe. Chuột dọn nhà đi chỗ khác."); }},
   {t:L("Lấy băng keo dán tạm"),fx:()=>{ if(R()<.35){ S.rep-=.05; return L("Có khách thấy chuột chạy qua quầy, đăng lên nhóm Zalo của xóm..."); } return L("Tạm ổn, mong là không sao."); }}]},
  // ---- chuyện trong xóm (chỉ ở quê) ----
  {id:'q_banhmi',t:L("Gánh bánh mì góc vườn"),who:L("Chị Mai"),w:.7,at:'q',open:1,cond:()=>!S.flags.banhmi,
   txt:L("\"Sáng nào chị cũng gánh bánh mì đi ngang. Cho chị đặt gánh ở góc vườn bán ké nghen, khách ăn bánh mì xong thế nào cũng khát nước.\""),ch:[
   {t:L("Cho đặt gánh, không lấy tiền"),note:L("tình làng, thêm khách, hơi bừa"),fx:()=>{ S.flags.banhmi=1; heart('mai',1.5); S.fans+=6; S.clean-=6; addBoost(1.08,4,L("Gánh bánh mì chị Mai")); seed(6,'banhmi_hun'); return L("Mùi bánh mì nướng thơm lừng. Khách ăn xong gọi thêm ly cà phê sữa đá."); }},
   {t:L("Cho đặt, xin chia 10% tiền bánh"),note:L("có tiền, chị Mai hơi chạnh lòng"),fx:()=>{ S.flags.banhmi=1; S.cash+=3e5; heart('mai',-.5); addBoost(1.05,4,L("Gánh bánh mì")); return L("Cuối tuần chị Mai dúi cho bạn ít tiền, nói nhỏ: \"Tính sòng phẳng vậy cũng phải.\""); }},
   {t:L("Từ chối, sợ vườn bừa bộn"),note:L("giữ sạch, mất lòng"),fx:()=>{ S.clean+=2; heart('mai',-1); return L("Chị Mai gánh sang đầu chợ. Gặp nhau vẫn cười, mà ít ghé hơn."); }}]},
  {id:'q_tusach',t:L("Tủ sách góc vườn"),who:L("Thầy Nam"),w:.6,at:'q',cond:()=>!S.flags.tusach,
   txt:L("\"Trường dư mấy thùng sách cũ. Anh muốn đặt một tủ sách nhỏ ở quán em cho tụi nhỏ với bà con đọc miễn phí, em thấy sao?\""),ch:[
   {t:L("Đóng kệ gỗ đặt tủ sách"),note:L("tốn chút, khách ngồi lâu"),fx:()=>{ S.flags.tusach=1; S.cash-=4e5; S.fans+=6; S.rep+=.03; heart('nam',1.5); seed(8,'clbsach'); return L("Góc vườn thêm cái kệ gỗ, mấy đứa nhỏ ngồi đọc truyện tới chiều."); }},
   {t:L("Để tạm thùng sách dưới gốc cây"),note:L("không tốn, dễ ẩm mốc"),fx:()=>{ S.flags.tusach=1; heart('nam',.5); S.clean-=3; return L("Được vài hôm thì mưa, sách hơi ẩm. Thầy Nam lặng lẽ mang về phơi."); }},
   {t:L("Quán nhỏ, sợ chật"),fx:()=>{ heart('nam',-.5); return L("Thầy Nam gật gù: \"Ừ, để anh hỏi nhà văn hoá thôn.\""); }}]},
  {id:'q_ca',t:L("Ghe về được mùa cá"),who:L("Anh Bình"),w:.6,at:'q',open:1,
   txt:L("Anh Bình xách thùng cá nục còn tươi rói: \"Ghe về được mùa, anh để em mấy ký. Tối nướng bán kèm ly trà đá đi, dân nhậu mê lắm.\""),ch:[
   {t:L("Nướng cá bán buổi tối"),note:L("có tiền, ám mùi khói, mệt"),fx:()=>{ S.cash+=6e5; S.energy-=8; S.clean-=8; heart('binh',1); return L("Khói cá nướng bay khắp xóm. Bán hết veo, nhưng tối về rửa vỉ mỏi tay."); }},
   {t:L("Nhận về nấu cho cả nhà"),note:L("gia đình"),fx:()=>{ S.fam+=6; heart('binh',1); return L("Nồi cá kho tộ thơm phức. Mẹ khen \"thằng Bình đó tốt bụng ghê\"."); }},
   {t:L("Cảm ơn, quán không bán đồ nướng"),fx:()=>{ heart('binh',-.3); return L("Anh Bình gãi đầu cười, mang cá sang quán anh Long."); }}]},
  {id:'q_batu',t:L("Bà Tư trở bệnh"),who:L("Chị Thảo"),w:.6,at:'q',once:1,
   txt:L("\"Bà Tư nằm mấy bữa nay, con cháu ở xa chưa về kịp. Không ai nấu cháo cho bà hết.\""),ch:[
   {t:L("Nấu cháo mang qua mỗi sáng"),note:L("mệt, tình làng sâu"),fx:()=>{ S.energy-=8; heart('batu',2); heart('thao',.5); S.rep+=.03; return L("Bà Tư nắm tay bạn: \"Có đứa như con là phước của bà.\""); }},
   {t:L("Nghỉ nửa buổi, chở bà lên trạm y tế"),note:L("mất buổi bán"),fx:()=>{ S.cash-=3e5; heart('batu',1.5); heart('truc',1); return L("Bác sĩ Trúc khám kỹ, cho thuốc. Hai hôm sau bà đã ra ngõ ngồi hóng mát."); }},
   {t:L("Gửi chị Thảo ít tiền mua thuốc"),note:L("gọn, ít tình"),fx:()=>{ S.cash-=2e5; heart('batu',.5); return L("Chị Thảo cầm tiền, dặn: \"Rảnh thì ghé thăm bà một chút nghe.\""); }}]},
  {id:'q_rung',t:L("Nhặt rác rừng phòng hộ"),who:L("Anh Dũng"),w:.5,at:'q',
   txt:L("\"Chủ nhật này đoàn thanh niên lên rừng phòng hộ nhặt rác. Em đi không, mang theo ít trà đá cho anh em?\""),ch:[
   {t:L("Đi, mang hai bình trà đá"),note:L("mệt, cả xóm quý"),fx:()=>{ S.energy-=8; S.cash-=1e5; ['dung','nam','thao'].forEach(id=>heart(id,.7)); S.rep+=.03; return L("Cả buổi lội rừng, nhặt mấy chục bao rác. Ảnh đoàn đăng lên trang xã có tên quán."); }},
   {t:L("Không đi, ở nhà bán"),note:L("có tiền"),fx:()=>{ S.cash+=2e5; heart('dung',-.3); return L("Thanh niên đi hết nên quán vắng, nhưng cũng có đồng ra đồng vào."); }}]},
  {id:'q_gat',t:L("Mùa gặt ngoài đồng"),who:L("Bà con trong xóm"),w:.8,at:'q',open:1,cond:()=>[1,2].includes(seasonNow()),
   txt:L("Lúa chín vàng đồng. Bà con ra ruộng từ 4 giờ sáng, trưa nắng chẳng ai ghé quán."),ch:[
   {t:L("Chở thùng trà đá ra bờ ruộng bán"),note:L("có tiền, rất mệt"),fx:()=>{ S.cash+=5e5; S.energy-=12; S.fans+=5; return L("Mấy cô chú vừa gặt vừa gọi: \"Cho hai ly đá!\" Ai cũng nhớ mặt quán."); }},
   {t:L("Mở cửa sớm 5 giờ cho người ra đồng"),note:L("mệt vừa"),fx:()=>{ S.cash+=2.5e5; S.energy-=6; return L("Sáng tinh mơ bán được kha khá ly đen nóng."); }},
   {t:L("Tranh thủ nghỉ, sửa sang vườn"),note:L("hồi sức, vườn gọn"),fx:()=>{ S.energy+=6; S.clean+=6; S.weeds.splice(0,5); return L("Bạn nhổ cỏ, sơn lại cái cổng tre. Vườn tươm tất chờ hết mùa."); }}]},
  {id:'q_dinh',t:L("Lễ cúng đình đầu năm"),who:L("Bác trưởng thôn"),w:.7,at:'q',cond:()=>seasonNow()===0,
   txt:L("Làng chuẩn bị lễ cúng đình đầu năm. Bác trưởng thôn đi vận động mỗi nhà góp một chút."),ch:[
   {t:L("Góp 500.000đ"),note:L("uy tín"),fx:()=>{ S.cash-=5e5; S.rep+=.05; ['batu','long','nam'].forEach(id=>heart(id,.4)); return L("Tên quán được đọc trên loa trong danh sách hảo tâm. Bà Tư gật gù hài lòng."); }},
   {t:L("Nấu nước phục vụ lễ miễn phí"),note:L("mệt, cả làng biết quán"),fx:()=>{ S.energy-=10; S.cash-=2e5; S.fans+=10; S.rep+=.03; return L("Cả ngày pha trà châm nước cho các cụ. Ai cũng hỏi \"quán của đứa nào mà chu đáo vậy\"."); }},
   {t:L("Góp 100.000đ cho có"),fx:()=>{ S.cash-=1e5; return L("Bác trưởng thôn ghi sổ, không nói gì."); }}]},
  {id:'q_hai',t:L("Anh Hải chế máy xay"),who:L("Anh Hải"),w:.5,at:'q',cond:()=>!S.flags.haiMay&&S.vil.hai.h>=2,
   txt:L("\"Anh ráp lại cái máy xay cũ từ đồ phế liệu, chạy ngon lành. Đổi cho em lấy cà phê uống cả tháng nghen?\""),ch:[
   {t:L("Đổi, tự xay hạt"),note:L("giá vốn giảm, hên xui"),chance:()=>[[L("Cơ bản"),.55],[L("Thân với Hải"),S.vil.hai.h*.04]],fx:ok=>{ S.flags.haiMay=1; heart('hai',1); if(ok){ S.cogsMul*=.94; return L("Máy hơi ồn nhưng bột mịn đều. Tự xay hạt, mỗi ly rẻ hơn hẳn."); } S.energy-=5; return L("Được hai tuần thì máy bốc khói. Anh Hải ngượng ngùng hứa \"để anh sửa lại\".{0}",lesson('buy',L("đồ chế lại thì phải chạy thử vài ngày."))); }},
   {t:L("Mời anh uống miễn phí, khỏi đổi"),note:L("tình làng"),fx:()=>{ S.cash-=1.5e5; heart('hai',1.5); return L("Anh Hải cảm động: \"Máy móc hư gì cứ kêu anh, khỏi tính tiền.\""); }}]},
  {id:'q_long',t:L("Phiếu cơm trưa"),who:L('Anh Long'),w:.5,at:'q',open:1,cond:()=>!S.flags.comboLong,
   txt:L("\"Khách ăn cơm quán anh hay hỏi chỗ uống cà phê. Mình làm phiếu: ăn cơm bên anh được giảm 3 nghìn ly cà phê bên em, chịu không?\""),ch:[
   {t:L("Chịu, in phiếu giảm giá"),note:L("thêm khách, lời mỗi ly mỏng hơn"),fx:()=>{ S.flags.comboLong=1; addBoost(1.12,5,L("Phiếu cơm trưa")); S.refBonus=(S.refBonus||0)-500; heart('long',1.5); return L("Trưa nào cũng có tốp khách cầm phiếu từ quán cơm qua."); }},
   {t:L("Tặng ly trà đá thay vì giảm giá"),note:L("nhẹ nhàng"),fx:()=>{ S.flags.comboLong=1; addBoost(1.06,4,L("Trà đá tặng kèm")); S.cogsMul*=1.01; heart('long',1); return L("Khách quán cơm qua uống trà đá miễn phí, nhiều người gọi thêm cà phê."); }},
   {t:L("Thôi, giữ giá cho rõ ràng"),fx:()=>{ heart('long',-.3); return L("Anh Long nhún vai: \"Ừ, tuỳ em.\""); }}]},
  {id:'q_anhcuoi',t:L("Chụp ảnh cưới ở vườn"),who:L("Hương"),w:.5,at:'q',
   txt:L("\"Có cặp đôi trên huyện muốn thuê vườn nhà cậu chụp ảnh cưới cả buổi sáng. Họ trả 800 nghìn, nhưng phải dẹp bớt bàn ghế.\""),ch:[
   {t:L("Cho thuê, nghỉ bán buổi sáng"),note:L("có tiền, quảng bá"),fx:()=>{ S.cash+=8e5; S.today=Object.assign(S.today||{},{half:1}); heart('huong',1); addBoost(1.05,3,L("Ảnh cưới lên mạng")); return L("Bộ ảnh cưới dưới tán cây lên mạng, nhiều người hỏi \"vườn này ở đâu\"."); }},
   {t:L("Cho chụp miễn phí, xin gắn tên quán"),note:L("tình làng, quảng bá nhiều hơn"),fx:()=>{ heart('huong',1.5); addBoost(1.1,3,L("Ảnh cưới lên mạng")); S.fans+=4; return L("Hương chụp thêm một bộ ảnh quán, đăng kèm tên quán to rõ."); }},
   {t:L("Từ chối, quán đang đông"),fx:()=>{ heart('huong',-.5); return L("Hương hơi tiếc: \"Ờ, để mình tìm chỗ khác.\""); }}]},
  {id:'q_tiem',t:L("Ngày tiêm chủng của xã"),who:L("Bác sĩ Trúc"),w:.5,at:'q',open:1,
   txt:L("\"Mai trạm y tế tiêm phòng cho trẻ. Em cho trạm mượn sân vườn làm chỗ chờ được không? Trong trạm chật lắm.\""),ch:[
   {t:L("Cho mượn, pha nước mời các mẹ"),note:L("tốn ít, cả xã biết quán"),fx:()=>{ S.cash-=2e5; S.energy-=5; S.fans+=8; heart('truc',1.5); return L("Sân vườn rộn tiếng trẻ con. Mấy mẹ hẹn hôm sau quay lại uống cà phê."); }},
   {t:L("Cho mượn nửa sân, vẫn bán bình thường"),note:L("có tiền, hơi lộn xộn"),fx:()=>{ S.cash+=2e5; S.clean-=6; heart('truc',.5); return L("Vừa bán vừa trông, hơi rối nhưng ổn."); }},
   {t:L("Quán đang kín khách, xin lỗi bác sĩ"),fx:()=>{ heart('truc',-.5); return L("Bác sĩ Trúc gật đầu thông cảm, mượn sân nhà văn hoá."); }}]},
  // ---- chuyện trên phố (chỉ sau khi lên phố) ----
  {id:'p_laptop',t:L("Một ly ngồi cả ngày"),who:L("Nhóm làm việc tự do"),w:.8,at:'p',open:1,
   txt:L("Ba bạn mở laptop từ 8 giờ sáng, mỗi người một ly, cắm sạc chiếm trọn bàn đẹp nhất. Giờ trưa khách tới không còn chỗ."),ch:[
   {t:L("Làm \"combo làm việc\": ly thứ hai giảm nửa giá"),note:L("thêm tiền, khách vui"),fx:()=>{ S.cash+=2e5; S.fans+=6; return L("Nhóm bạn gọi thêm ly, còn rủ cả công ty qua ngồi."); }},
   {t:L("Dán bảng: wifi 2 tiếng mỗi lượt"),note:L("giữ bàn cho khách khác"),fx:()=>{ S.fans+=2; S.rep-=.01; return L("Vài người phàn nàn trên nhóm review, nhưng giờ trưa có chỗ ngồi hẳn."); }},
   {t:L("Kệ, khách là thượng đế"),note:L("mất khách giờ trưa"),fx:()=>{ S.cash-=2e5; S.fans+=3; return L("Nhóm bạn thành khách ruột, nhưng trưa nào cũng có người quay đầu đi."); }}]},
  {id:'p_xe',t:L("Chỗ để xe trước quán"),who:L("Chú bảo vệ toà nhà bên"),w:.7,at:'p',open:1,
   txt:L("\"Xe khách quán em dựng lấn qua cửa toà nhà. Muốn để thì đóng 600 nghìn mỗi tháng, chú trông giùm. Không thì dẹp.\""),ch:[
   {t:L("Đóng tiền, nhờ chú trông"),note:L("tốn đều, khách yên tâm"),fx:()=>{ S.cash-=6e5; S.fans+=4; addBoost(1.06,4,L("Có chỗ giữ xe")); return L("Chú bảo vệ dắt xe, phát thẻ giữ xe đàng hoàng. Khách đỡ lo mất mũ."); }},
   {t:L("Kẻ vạch, tự xếp xe gọn trong phần nhà mình"),note:L("mệt, tự lo"),fx:()=>{ S.energy-=6; return L("Giờ cao điểm nào bạn cũng chạy ra xếp xe. Mỏi lưng, nhưng không tốn đồng nào."); }},
   {t:L("Nhắc khách gửi xe ở bãi đầu hẻm"),note:L("mất khách"),fx:()=>{ S.fans-=6; addBoost(.93,2,L("Khó để xe")); return L("Nhiều khách ngại đi bộ, chạy luôn qua quán khác."); }}]},
  {id:'p_on',t:L("Tổ dân phố nhắc tiếng ồn"),who:L("Cô tổ trưởng"),w:.6,at:'p',open:1,
   txt:L("\"Tối nào loa quán cũng mở tới 11 giờ, máy xay rè rè từ 6 giờ sáng. Trong hẻm có người già, có em bé, bà con phản ánh quá trời.\""),ch:[
   {t:L("Xin lỗi, tắt loa sau 9 giờ tối"),note:L("êm thấm, bớt khách tối"),fx:()=>{ S.rep+=.03; addBoost(.96,3,L("Tắt nhạc sớm")); return L("Cô tổ trưởng gật đầu. Từ đó gặp bạn là cô chào trước."); }},
   {t:L("Lót cao su chân máy, dán tấm cách âm"),cost:()=>1.2e6,note:L("tốn, ổn lâu dài"),fx:()=>{ S.rep+=.04; S.fans+=3; return L("Tiếng máy nhỏ hẳn. Nhà bên còn ghé uống thử ly cà phê."); }},
   {t:L("\"Quán làm ăn đàng hoàng mà cô\""),note:L("mất lòng, dễ bị phạt"),chance:()=>[[L("Cơ bản"),.4]],fx:ok=>{ if(ok){ S.rep-=.02; return L("Cô tổ trưởng bỏ về, rồi chuyện cũng lắng xuống."); } S.cash-=2e6; S.tot.fines+=2e6; S.rep-=.05; return L("Hàng xóm phản ánh lên phường. Đoàn xuống lập biên bản gây ồn: phạt 2 triệu."); }}]},
  {id:'p_sv',t:L("Sinh viên xin làm thêm"),who:L("Bạn sinh viên năm hai"),w:.6,at:'p',cond:()=>S.staff<4,
   txt:L("\"Em học ca sáng, chiều tối rảnh. Anh/chị cho em làm thêm theo giờ nha, em học pha chế nhanh lắm!\""),ch:[
   {t:L("Nhận làm ca tối"),note:L("thêm người phụ, đỡ mệt"),fx:()=>{ S.staff++; S.energy+=6; seed(5,'sv_thi'); return L("Cậu sinh viên lanh lẹ, khách trẻ thích nói chuyện. Nhớ làm hợp đồng lao động nha."); }},
   {t:L("Cho \"thử việc\" 1 tuần không lương"),note:L("tiết kiệm, mất lòng"),fx:()=>{ S.rep-=.03; return L("Cậu làm được ba bữa thì nghỉ, đăng bài \"quán bóc lột thử việc\".{0}",lesson('staff',L("thử việc vẫn phải trả lương, ít nhất 85% lương chính thức."))); }},
   {t:L("Chưa cần người"),fx:()=>L("Cậu sinh viên cảm ơn, xin để lại số điện thoại.")}]},
  {id:'p_review',t:L("Trang review \"xin phí\""),who:L("Admin trang ẩm thực"),w:.6,at:'p',open:1,
   txt:L("Một trang review 300 nghìn người theo dõi nhắn: \"Quán chi 3 triệu, bên em đăng bài khen. Không thì… bên em vẫn đăng, nhưng không chắc là khen.\""),ch:[
   {t:L("Chuyển 3 triệu"),cost:3e6,chance:()=>[[L("Cơ bản"),.45],[L("Bài học"),lv('scam')*.1]],fx:ok=>{ if(ok){ addBoost(1.15,2,L("Bài review")); return L("Bài khen lên đúng hẹn. Khách mới tới, nhưng nhiều người bình luận \"bài PR mà\"."); } S.tot.scam=(S.tot.scam||0)+3e6; return L("Nhận tiền xong, trang đó đổi tên rồi biến mất.{0}",lesson('scam',L("trả tiền cho lời đe doạ là mở đường cho lần sau."))); }},
   {t:L("Từ chối, đăng ảnh tin nhắn lên"),chance:()=>[[L("Cơ bản"),.55],repF(.4)],fx:ok=>{ if(ok){ S.rep+=.05; return L("Cộng đồng mạng đứng về phía quán, trang kia bị báo cáo tới sập."); } S.rep-=.06; addBoost(.88,2,L("Bài chê")); return L("Bài chê lên trước. Mất vài tuần khách mới quên."); }},
   {t:L("Lơ đi"),fx:()=>{ if(R()<.5){ S.rep-=.04; return L("Họ đăng một bài chê nhạt nhẽo, ít ai để ý."); } return L("Không thấy bài nào. Hoá ra chỉ hù doạ."); }}]},
  {id:'p_tiembanh',t:L("Tiệm bánh kế bên rủ hợp tác"),who:L("Chị chủ tiệm bánh"),w:.6,at:'p',open:1,cond:()=>!S.flags.tiembanh,
   txt:L("\"Bánh croissant bên chị ra lò lúc 7 giờ. Quán em bán kèm đi, chị chiết khấu 20%, khách đỡ phải chạy hai nơi.\""),ch:[
   {t:L("Bán kèm bánh"),note:L("khách chịu giá cao hơn"),fx:()=>{ S.flags.tiembanh=1; S.refBonus=(S.refBonus||0)+1500; S.fans+=5; return L("Combo \"sữa đá + croissant\" thành món ruột của dân văn phòng."); }},
   {t:L("Đổi lại: đặt tờ rơi quán ở tiệm bánh"),note:L("quảng bá"),fx:()=>{ S.flags.tiembanh=1; addBoost(1.08,4,L("Tờ rơi tiệm bánh")); return L("Khách mua bánh cầm tờ rơi, tiện ghé uống ly cà phê."); }},
   {t:L("Không, quán chỉ bán nước"),fx:()=>L("Chị chủ tiệm cười: \"Ừ, khi nào đổi ý thì qua chị.\"")}]},
  {id:'p_mua',t:L("Mưa chiều, kẹt xe"),who:L("Bạn"),w:.7,at:'p',open:1,cond:()=>{ const m=dateOf(S.day).getMonth(); return m>=4&&m<=10; },
   txt:L("Mưa như trút lúc 5 giờ chiều, đường ngập, kẹt xe cứng ngắc. Người đi đường tấp vô mái hiên quán trú mưa."),ch:[
   {t:L("Mời trú thoải mái, bán ly nóng giá thường"),note:L("thêm khách quen, dơ sàn"),fx:()=>{ S.cash+=4e5; S.fans+=8; S.clean-=6; return L("Mái hiên chật kín. Nhiều người lần đầu biết quán, hẹn bữa sau quay lại."); }},
   {t:L("Phụ thu 5 nghìn \"giá giờ mưa\""),note:L("có tiền, mất cảm tình"),fx:()=>{ S.cash+=6e5; S.rep-=.05; return L("Bán được, nhưng có người đăng lên nhóm khu phố \"quán chặt chém lúc mưa\"."); }},
   {t:L("Phát áo mưa giấy in tên quán"),cost:2e5,note:L("tốn ít, uy tín"),fx:()=>{ S.rep+=.05; S.fans+=5; return L("Mấy chục chiếc áo mưa in tên quán bay phấp phới khắp phố."); }}]},
  {id:'p_que',t:L("Đứa em họ lên phố"),who:L("Mẹ gọi điện"),w:.5,at:'p',once:1,
   txt:L("\"Thằng Tí em họ con lên Sài Gòn học nghề, chưa có chỗ ở. Con cho nó ở nhờ một thời gian, phụ quán luôn nghe.\""),ch:[
   {t:L("Cho ở, dạy nó pha chế"),note:L("gia đình, thêm người phụ"),fx:()=>{ S.fam+=10; S.staff++; S.energy-=4; return L("Thằng Tí lóng ngóng tuần đầu, tuần sau đã đánh bọt sữa ngon lành."); }},
   {t:L("Phụ tiền thuê phòng trọ gần quán"),note:L("tốn tiền, gia đình vui"),fx:()=>{ S.cash-=2e6; S.fam+=6; return L("Tí ở trọ đầu hẻm, chiều nào cũng ghé ăn ké cơm."); }},
   {t:L("Từ chối, quán chật lắm"),fx:()=>{ S.fam-=10; return L("Mẹ im lặng một lúc lâu: \"Ừ, để mẹ hỏi chỗ khác.\""); }}]},
  {id:'p_nuoc',t:L("Ống nước vỡ giữa giờ đông"),who:L("Bạn"),w:.5,at:'p',open:1,
   txt:L("Ống nước dưới quầy bể, nước xịt tung toé, lênh láng ra tới vỉa hè. Khách đang ngồi kín bàn."),ch:[
   {t:L("Khoá van, gọi thợ tới ngay"),cost:8e5,note:L("nhanh gọn"),fx:()=>{ S.clean+=2; return L("Thợ tới sau 30 phút, thay ống mới. Khách ngồi chờ được tặng ly trà đá."); }},
   {t:L("Tự quấn băng keo, mai sửa"),note:L("mệt, hên xui"),chance:()=>[[L("Cơ bản"),.5],[L("Thân với Hải"),S.vil.hai.h*.03]],fx:ok=>{ S.energy-=6; if(ok) return L("Nhớ cách anh Hải chỉ hồi ở quê, bạn quấn tạm được. Hôm sau thay ống đàng hoàng."); S.cash-=1.5e6; S.sick=Math.max(S.sick,1); return L("Đêm đó ống bung lần nữa, ngập luôn máy xay. Sửa hết 1,5 triệu, nghỉ một ngày."); }}]},
  {id:'p_bongda',t:L("Tối nay đá chung kết"),who:L("Khách quen"),w:.7,at:'p',open:1,
   txt:L("Tuyển Việt Nam đá chung kết lúc 7 giờ tối. Cả phố treo cờ, quán nào cũng kéo tivi ra."),ch:[
   {t:L("Thuê tivi lớn, bày thêm ghế"),cost:6e5,note:L("đông, ồn, dơ"),fx:()=>{ S.today=Object.assign(S.today||{},{mul:((S.today&&S.today.mul)||1)*1.6}); S.clean-=8; return L("Bàn thắng phút 89, cả quán ôm nhau hò hét. Hết sạch đá."); }},
   {t:L("Bán bình thường, mở laptop trên quầy"),fx:()=>{ S.today=Object.assign(S.today||{},{mul:((S.today&&S.today.mul)||1)*1.1}); return L("Vài khách chụm đầu quanh cái laptop, vẫn vui."); }}]},
  {id:'p_om',t:L("Bạn bị cảm sốt"),who:L("Bạn"),w:.7,at:'p',cond:()=>S.energy<70,
   txt:L("Thời tiết thất thường, sáng dậy sốt hầm hập. Quán thì đang mùa đông khách."),ch:[
   {t:L("Nghỉ hai ngày, giao quán cho người phụ"),note:L("hồi sức, bán ít hơn"),req:()=>S.staff>0||L("Không có người phụ"),fx:()=>{ S.energy+=24; S.cash-=4e5; return L("Người phụ lo quán tạm ổn. Bạn ngủ một giấc dài."); }},
   {t:L("Đóng cửa hai ngày"),note:L("hồi sức, mất tiền"),fx:()=>{ S.sick=Math.max(S.sick,2); S.energy+=28; return L("Hai ngày cửa đóng. Khách quen nhắn tin hỏi thăm."); }},
   {t:L("Uống thuốc rồi gắng bán"),note:L("có tiền, kiệt sức"),fx:()=>{ S.energy-=14; S.cash+=3e5; S.clean-=6; return L("Bán được, nhưng pha ẩu, quên rửa ly mấy lần."); }}]},
  {id:'p_ghiso',t:L("Văn phòng xin ghi sổ"),who:L("Chị kế toán toà nhà bên"),w:.5,at:'p',open:1,
   txt:L("\"Phòng chị sáng nào cũng đặt 12 ly. Quán ghi sổ, nửa tháng công ty chuyển khoản một lần nha em, có đối chiếu đàng hoàng.\""),ch:[
   {t:L("Đồng ý ghi sổ"),note:L("giữ khách sỉ, chờ tiền"),fx:()=>{ S.lent.push({who:L("Văn phòng toà bên"),amt:12*12*S.price,due:S.day+15,p:.92,ghi:1}); S.cash-=12*12*EQ().cogs; addBoost(1.05,3,L("Khách văn phòng")); return L("Mỗi sáng 12 ly giao lên tầng 5. Sổ ghi nợ dày dần."); }},
   {t:L("Chỉ nhận chuyển khoản từng ngày"),fx:()=>{ if(R()<.5){ S.fans+=4; return L("Chị kế toán đồng ý, mỗi sáng chuyển khoản luôn."); } return L("Chị kế toán ngại thủ tục, chuyển sang đặt quán khác."); }}]},
  // ---- ở đâu cũng có thể gặp ----
  {id:'g_vi',t:L("Khách để quên ví"),who:L("Bạn"),w:.6,open:1,
   txt:L("Dọn bàn thấy một cái ví dày cộm: căn cước, thẻ ngân hàng và gần 4 triệu tiền mặt. Không ai quay lại tìm."),ch:[
   {t:L("Gọi theo số trong ví, trả tận tay"),note:L("uy tín"),fx:()=>{ S.rep+=.05; S.fans+=4; if(R()<.5){ S.cash+=5e5; return L("Chủ ví cảm ơn rối rít, gửi lại 500 nghìn \"uống nước\". Từ đó ngày nào cũng ghé."); } return L("Chủ ví cảm ơn, đăng bài khen quán thật thà lên nhóm khu phố."); }},
   {t:L("Mang lên công an nhờ trả lại"),note:L("đúng thủ tục"),fx:()=>{ S.rep+=.03; return L("Vài hôm sau công an báo đã trả ví cho chủ. Họ gửi lời cảm ơn quán."); }},
   {t:L("Cất trong quầy, chờ chủ quay lại"),note:L("hên xui"),fx:()=>{ if(R()<.6){ S.rep+=.02; return L("Chiều hôm sau chủ ví hớt hải quay lại, mừng muốn khóc."); } return L("Cả tuần không ai tìm. Bạn đành mang lên công an."); }}]},
  {id:'g_nham',t:L("Chuyển khoản nhầm"),who:L("Số lạ"),w:.6,once:1,cond:()=>!lv('nham'),
   txt:L("Tài khoản quán bỗng nhận 5 triệu từ người lạ. Ngay sau đó có người gọi: \"Em chuyển nhầm, anh/chị chuyển lại giùm vào số tài khoản này nha, gấp lắm!\" — số tài khoản khác hẳn."),ch:[
   {t:L("Ra ngân hàng làm thủ tục hoàn trả"),note:L("mất buổi sáng, an toàn"),fx:()=>{ S.energy-=3; return L("Nhân viên ngân hàng: \"May đó! Chuyển lại vào số khác là dính bẫy — tiền đó có khi là tiền vay app đứng tên mình.\"{0}",lesson('nham',L("tiền chuyển nhầm thì hoàn trả qua ngân hàng, không chuyển sang số lạ."))); }},
   {t:L("Chuyển lại 5 triệu vào số họ đưa"),fx:()=>{ seed(2,'nham_no'); return L("Người kia cảm ơn rối rít rồi tắt máy. Mọi chuyện có vẻ xong…"); }},
   {t:L("Kệ, cứ giữ đó"),note:L("không đúng luật"),fx:()=>{ S.cash+=5e6; seed(2,'nham_cs'); return L("Năm triệu nằm im trong tài khoản. Bạn hơi chột dạ."); }}]},
  {id:'g_lac',t:L("Em bé đi lạc"),who:L("Bạn"),w:.5,open:1,
   txt:L("Một bé gái chừng 5 tuổi đứng khóc trước quán, nói không nhớ đường về nhà. Quán thì đang đông."),ch:[
   {t:L("Dỗ bé, báo công an và đăng nhóm khu phố"),note:L("mất chút thời gian"),fx:()=>{ S.energy-=3; S.rep+=.05; S.fans+=5; return L("Nửa tiếng sau mẹ bé chạy tới, ôm con khóc. Cả khu nhắc tên quán."); }},
   {t:L("Cho bé ly sữa, ngồi chờ ở quán"),note:L("tốn ít"),fx:()=>{ S.cash-=2e4; S.rep+=.03; return L("Bé uống sữa, vẽ nguệch ngoạc lên tờ thực đơn. Chiều ba bé tìm tới."); }},
   {t:L("Chỉ đường tạm rồi quay vào bán"),fx:()=>{ S.rep-=.03; return L("Bé đi một đoạn lại đứng khóc. Người đi đường nhìn vào quán lắc đầu."); }}]},
  {id:'g_lu',t:L("Quyên góp cho vùng lũ"),who:()=>S.city?L("Tổ dân phố"):L("Hội Phụ nữ xã"),w:.8,cond:()=>seasonNow()===2,
   txt:L("Miền Trung lũ lớn. Nhà nhà góp chút ít gửi về bà con vùng lũ."),ch:[
   {t:L("Góp 1 triệu"),note:L("gia đình, uy tín"),fx:()=>{ S.cash-=1e6; S.rep+=.04; S.fam+=4; return L("Thùng hàng cứu trợ ghi tên quán lên đường trong đêm."); }},
   {t:L("Trích 2.000đ mỗi ly trong một tuần"),note:L("khách cùng góp, thêm khách"),fx:()=>{ S.cash-=4e5; S.fans+=8; S.rep+=.05; return L("Tấm bảng \"Mỗi ly 2.000đ cho miền Trung\" khiến nhiều người ghé ủng hộ."); }},
   {t:L("Tháng này kẹt quá, gửi lời hỏi thăm"),fx:()=>{ S.rep-=.01; return L("Bạn tự nhủ tháng sau sẽ góp."); }}]},
  {id:'g_ly',t:L("Ly thuỷ tinh bể liên tục"),who:L("Bạn"),w:.5,open:1,
   txt:L("Tháng này bể hơn chục cái ly. Mua ly mới thì tốn, xài ly nhựa thì rẻ nhưng nhìn \"cùi\"."),ch:[
   {t:L("Mua ly thuỷ tinh cường lực"),cost:()=>1.2e6*LK(),note:L("tốn, khách thích"),fx:()=>{ S.rep+=.03; S.clean+=4; return L("Ly dày, nặng tay, bưng ra trông sang hẳn."); }},
   {t:L("Chuyển sang ly nhựa dùng một lần"),note:L("giá vốn tăng, kém sang"),fx:()=>{ S.cogsMul*=1.02; S.rep-=.03; S.clean-=4; return L("Ly nhựa tiện, nhưng thùng rác đầy nhanh, khách quen nhìn hơi tiếc."); }},
   {t:L("Mua ly sứ cũ ngoài chợ đồ cũ"),note:L("rẻ, hên xui"),chance:()=>[[L("Cơ bản"),.6]],fx:ok=>{ S.cash-=3e5; if(ok){ S.fans+=3; return L("Mỗi cái một kiểu, khách khen \"vintage\" dễ thương."); } S.clean-=5; return L("Vài cái mẻ miệng, có khách bị cứa môi. Bạn phải bỏ bớt."); }}]},
  {id:'g_mon',t:L("Khách gợi ý món mới"),who:()=>S.city?L("Bạn sinh viên"):'Linh',w:.5,
   txt:L("\"Quán làm thử sữa chua cà phê đi! Chua chua ngọt ngọt, bỏ đá, mùa này bán chạy lắm.\""),ch:[
   {t:L("Thử làm, bán thử một tuần"),cost:3e5,note:L("nếu ngon, khách chịu giá cao hơn"),chance:()=>[[L("Cơ bản"),.45],[L("Bài học"),lv('menu')*.12],[L("Máy pha"),(EQ().q-1)*.06]],fx:ok=>{ if(ok){ S.refBonus=(S.refBonus||0)+1000; S.fans+=6; return L("Sữa chua cà phê thành món \"hot\" của quán."); } return L("Sữa chua tách nước khi gặp cà phê nóng. Phải đổ bỏ cả mẻ.{0}",lesson('menu',L("món mới phải thử nhiều lần trước khi bán."))); }},
   {t:L("Ghi vào sổ, để dịp khác"),fx:()=>L("Bạn ghi công thức vào trang cuối sổ.")}]},
  {id:'g_phep',t:L("Người phụ xin nghỉ đột xuất"),who:L("Người phụ quán"),w:.6,cond:()=>S.staff>0,
   txt:L("\"Ba em ở quê nhập viện, em xin nghỉ một tuần về chăm. Em biết quán đang đông…\""),ch:[
   {t:L("Cho nghỉ, ứng thêm 1 triệu"),note:L("tốn, người phụ gắn bó"),fx:()=>{ S.cash-=1e6; S.energy-=8; S.rep+=.03; seed(2,'phep_ve'); return L("Bạn gánh việc một tuần, mệt nhoài."); }},
   {t:L("Cho nghỉ, trừ lương những ngày nghỉ"),note:L("mệt, sòng phẳng"),fx:()=>{ S.energy-=8; return L("Người phụ cảm ơn rồi vội ra bến xe."); }},
   {t:L("Không cho, quán cần người"),fx:()=>{ if(R()<.6){ S.staff=Math.max(0,S.staff-1); return L("Người phụ xin nghỉ hẳn luôn."); } S.rep-=.02; return L("Người phụ ở lại, nhưng mắt đỏ hoe cả tuần."); }}]},
];
