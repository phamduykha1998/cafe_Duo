// Sổ tay cà phê Việt
/* ================= SỔ TAY CÀ PHÊ: kiến thức về cà phê Việt để người chơi đọc ================= */
const CB_TABS=[['mon',L("☕ Món")],['hat',L("🫘 Hạt")],['vung',L("🗺️ Vùng trồng")],['pha',L("🫖 Cách pha")]];
const cupOf=(id,o)=>cupSVG(Object.assign({},drinkOf(id)||{},o||{}));
const COFFEE_BOOK={
  mon:[
    [cupOf('den'),L("Cà phê đen"),L("Cả nước · gu truyền thống"),L("Pha phin với hạt <b>Robusta</b> rang đậm, nhỏ giọt 4–5 phút. Người Hà Nội gọi gọn là \"đen\", trong Nam hay gọi \"cà phê đá\".")],
    [cupOf('sua'),L("Cà phê sữa đá"),L("Biểu tượng của cà phê Việt"),L("Sữa đặc dưới đáy ly, phin nhỏ giọt lên trên, khuấy đều rồi thêm đá. Sữa đặc được dùng từ thời Pháp vì sữa tươi hiếm và khó giữ ở xứ nóng.")],
    [cupOf('nong'),L("Nâu (cà phê sữa)"),L("Hà Nội"),L("\"Nâu\" là cách người Hà Nội gọi cà phê sữa: có nâu nóng, nâu đá. Gọi \"một nâu đá\" là quán hiểu ngay.")],
    [cupOf('bx'),L("Bạc xỉu"),L("Sài Gòn · gốc tiếng Quảng Đông"),L("Từ chữ \"bạc tẩy xỉu phé\" của người Hoa: ly sữa trắng với chút cà phê. Nhiều sữa, ít cà phê, hợp người mới tập uống.")],
    [cupOf('trung'),L("Cà phê trứng"),L("Hà Nội · từ năm 1946"),L("Ông Nguyễn Văn Giảng nghĩ ra lúc sữa khan hiếm: lòng đỏ trứng đánh bông với đường và sữa đặc, phủ lên cà phê. Ly hay được đặt trong bát nước nóng cho kem không nguội.")],
    [cupOf('muoi'),L("Cà phê muối"),L("Huế"),L("Lớp kem sữa mằn mặn chút muối phủ trên cà phê đậm. Vị mặn nhẹ làm dịu cái đắng, hậu ngọt rõ hơn.")],
    [cupOf('dua'),L("Cà phê cốt dừa"),L("Phổ biến từ Hà Nội"),L("Cốt dừa và sữa đặc xay với đá thành lớp sánh mịn như kem, rót cà phê đen lên trên. Béo, mát, thơm mùi dừa.")],
    [cupOf('den',{hot:1,ice:0}),L("Cà phê vợt"),L("Sài Gòn xưa"),L("Bột cà phê cho vào túi vải (\"vợt\"), chế nước sôi rồi ủ trong ấm. Quán Cheo Leo ở Sài Gòn bán kiểu này từ năm 1938.")],
    [cupOf('bx',{c:'#f2ece0',ice:1,milk:0}),L("Cà phê sữa chua"),L("Hà Nội"),L("Sữa chua đánh với đá, rưới cà phê đen lên. Chua nhẹ, mát lạnh, hợp ngày hè.")],
    [cupOf('den',{c:'#4a2c18'}),L('Cold brew'),L("Kiểu mới"),L("Ngâm cà phê trong nước lạnh 12–24 giờ. Ít đắng, ít chua, thơm trái cây — rất hợp hạt Arabica.")]],
  hat:[
    [beanSVG(BEANS[0]),L("Robusta (cà phê vối)"),L("Phần lớn sản lượng cả nước"),L("Việt Nam là nước xuất khẩu Robusta lớn nhất thế giới. Hạt nhỏ, nhiều cafein (khoảng gấp đôi Arabica), vị đắng đậm, hậu vị mạnh. Hợp pha phin, cà phê sữa.")],
    [beanSVG(BEANS[1]),L("Arabica (cà phê chè)"),L("Vùng cao trên 1.000m"),L("Hạt dài, rãnh cong. Vị chua thanh, thơm hoa quả, ít đắng, ít cafein. Trồng nhiều ở Cầu Đất, Sơn La, Khe Sanh.")],
    [beanSVG(BEANS[2]),'Culi',L("Hạt tròn hiếm"),L("Bình thường mỗi quả có hai hạt úp vào nhau; quả culi chỉ có một hạt tròn. Chỉ chiếm vài phần trăm, vị đậm, được ưa để pha phin.")],
    [beanSVG(BEANS[3]),'Moka',L("Arabica quý của Đà Lạt"),L("Giống Arabica lâu đời người Pháp đưa lên Cầu Đất. Cây yếu, năng suất thấp nên hiếm và đắt; hương thơm nồng, chua nhẹ quyến rũ.")],
    [beanSVG({c:'#b07a3a'}),L("Cà phê mít (Excelsa)"),L("Cây cao, chịu hạn"),L("Lá to như lá mít nên dân gọi \"cà phê mít\". Vị chua, mùi trái cây, thường dùng để phối trộn tạo hương.")],
    ['<span class="cbi">🔥</span>',L("Rang mộc & rang bơ"),L("Cách rang"),L("<b>Rang mộc</b>: chỉ rang hạt, giữ vị nguyên bản. <b>Rang bơ</b>: rang cùng bơ (có nơi thêm chút đường, rượu) cho màu đậm, mùi thơm béo đặc trưng của cà phê phin Việt.")]],
  vung:[
    ['<span class="cbi">🌄</span>',L("Buôn Ma Thuột (Đắk Lắk)"),L("\"Thủ phủ cà phê\""),L("Đất đỏ bazan, nắng gió Tây Nguyên, nổi tiếng Robusta. Có Lễ hội Cà phê Buôn Ma Thuột và Bảo tàng Thế giới Cà phê.")],
    ['<span class="cbi">🌫️</span>',L("Cầu Đất – Đà Lạt"),L('Arabica & Moka'),L("Cao khoảng 1.500m, sương mù quanh năm. Người Pháp trồng cà phê ở đây từ đầu thế kỷ 20.")],
    ['<span class="cbi">⛰️</span>',L("Bảo Lộc – Di Linh (Lâm Đồng)"),L("Robusta vùng cao"),L("Lâm Đồng là một trong những tỉnh trồng nhiều cà phê nhất, bên cạnh chè và dâu tằm.")],
    ['<span class="cbi">🌳</span>',L("Gia Lai · Kon Tum · Đắk Nông"),L("Vành đai Tây Nguyên"),L("Cùng Đắk Lắk và Lâm Đồng làm nên vùng cà phê lớn nhất, cho phần lớn sản lượng cả nước.")],
    ['<span class="cbi">❄️</span>',L("Sơn La"),L("Arabica miền Bắc"),L("Vùng trồng Arabica lớn của miền Bắc: đồi cao, mùa đông lạnh cho hạt chua thanh.")],
    ['<span class="cbi">🏔️</span>',L("Khe Sanh (Quảng Trị)"),L("Arabica trên đất bazan"),L("Cà phê Khe Sanh có từ thời Pháp, vị đậm đà, thơm nồng.")]],
  pha:[
    ['<span class="cbi">☕</span>',L('Pha phin'),L("4–5 phút"),L("<b>18–25g</b> bột, nước <b>90–96°C</b>. Rót chút nước cho bột nở 30 giây, rồi rót đầy, đậy nắp. Giọt quá nhanh là xay thô; quá chậm là xay mịn hoặc nén chặt.")],
    ['<span class="cbi">🥛</span>',L("Sữa đá chuẩn quán"),L("Tỉ lệ"),L("Khoảng 2–3 muỗng sữa đặc cho một phin 25g. Khuấy tan rồi mới cho đá để vị đều.")],
    ['<span class="cbi">⚙️</span>',L("Pha máy (espresso)"),L("25–30 giây"),L("Nén bột vừa tay, nước nóng áp suất khoảng 9 bar chảy qua trong 25–30 giây, ra lớp crema vàng nâu.")],
    ['<span class="cbi">🧊</span>',L('Cold brew'),L("12–24 giờ"),L("Khoảng 1 phần bột : 8–10 phần nước, ngâm lạnh rồi lọc kỹ. Giữ tủ lạnh, dùng trong vài ngày.")],
    ['<span class="cbi">🫙</span>',L("Bảo quản"),L("Giữ hương"),L("Bột cà phê mau mất mùi: đựng hũ kín, tránh nắng và ẩm. Mua hạt rang, xay đủ dùng là thơm nhất.")],
    ['<span class="cbi">💧</span>',L("Nước pha"),L("Đừng xem nhẹ"),L("Nước chiếm gần hết ly cà phê. Nước phèn, nước nặng mùi clo làm hỏng vị — nên lọc trước khi pha.")]]};
let cbTab='mon';
function coffeeBook(){
  return `<div class="cbtabs">${CB_TABS.map(([k,n])=>`<button class="cbtab ${k===cbTab?'on':''}" data-cb="${k}">${n}</button>`).join('')}</div>
    <p class="cbnote">${L("Kiến thức cà phê Việt — đọc để chơi mini-game giỏi hơn (canh gram, nhiệt độ, chọn hạt).")}</p>
    <div class="cbgrid">${COFFEE_BOOK[cbTab].map(([ico,n,tg,p])=>`<div class="cbc">${ico}<h3>${n}</h3><span class="tg">${tg}</span><p>${p}</p></div>`).join('')}</div>`;
}
