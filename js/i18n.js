/* ================= NGÔN NGỮ: vi (gốc) · en · ja =================
   Chữ trong game viết bằng tiếng Việt, bọc trong L('…'). Bản dịch nằm ở lang/en.js và lang/ja.js:
     DICT.en["câu tiếng Việt"] = "English"
   {0} {1}… là chỗ chèn số liệu: L("Bán {0} ly", 52). Câu chưa có bản dịch thì hiện tiếng Việt.
   Thêm câu mới: viết tiếng Việt trong L('…') rồi thêm một dòng vào lang/en.js và lang/ja.js.

   Đổi ngôn ngữ không tải lại trang:
   - Trong lúc nạp các file js, L trả về câu gốc tiếng Việt. Cuối cùng i18nInit ghi nhớ chỗ nào trong các bảng
     dữ liệu (tình huống, dân làng, giấy tờ…) và trong HTML đang chứa câu gốc nào, rồi dịch sang ngôn ngữ đang chọn.
   - setLang dịch lại đúng những chỗ đó, rồi báo sự kiện 'langchange' để giao diện vẽ lại (xem js/main.js). */
const LKEY='cafe-len-pho-lang', LANGS=[['vi','Tiếng Việt'],['en','English'],['ja','日本語']];
const DICT={}; // lang/*.js điền vào
// lần đầu mở game: theo ngôn ngữ máy; ai đã có bản lưu từ trước khi có đa ngôn ngữ thì giữ tiếng Việt
let LANG=(()=>{ let l=null; try{ l=localStorage.getItem(LKEY); if(!l&&localStorage.getItem('cafe-len-pho-v1')) l='vi'; }catch(e){}
  if(!l){ const n=(navigator.language||'vi').toLowerCase(); l=n.startsWith('vi')?'vi':n.startsWith('ja')?'ja':'en'; }
  return LANGS.some(x=>x[0]===l)?l:'vi'; })();
let LOCALE='vi-VN', i18nReady=false;
function L(s,...a){ let t=s; if(i18nReady&&LANG!=='vi'){ const d=DICT[LANG]; if(d&&d[s]) t=d[s]; } return a.length?t.replace(/\{(\d+)\}/g,(m,i)=>a[i]):t; }

const isKey=s=>typeof s==='string'&&Object.values(DICT).some(d=>d[s]);
const i18nSlots=[]; // [đối tượng, tên thuộc tính, câu gốc] trong bảng dữ liệu
const i18nDom=[];   // [nút chữ hoặc phần tử, tên thuộc tính (null = chữ), câu gốc] trong HTML có sẵn
function i18nInit(tables){
  const seen=new Set();
  const walk=o=>{ if(!o||typeof o!=='object'||seen.has(o)) return; seen.add(o);
    for(const k of Object.keys(o)){ const v=o[k]; if(isKey(v)) i18nSlots.push([o,k,v]); else if(v&&typeof v==='object') walk(v); } };
  tables.forEach(walk);
  const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT); let n;
  while((n=w.nextNode())){ const t=n.nodeValue.trim(); if(isKey(t)) i18nDom.push([n,null,t]); }
  document.querySelectorAll('[title],[aria-label]').forEach(e=>['title','aria-label'].forEach(a=>{ const v=e.getAttribute(a); if(isKey(v)) i18nDom.push([e,a,v]); }));
  i18nReady=true; setLang(LANG,true);
}
// phông Pixelify Sans và Be Vietnam Pro không có chữ Nhật: chỉ tải thêm DotGothic16 + Noto Sans JP khi cần
let jaFont=false;
function setLang(l,first){
  LANG=l; LOCALE={vi:'vi-VN',en:'en-US',ja:'ja-JP'}[l]; document.documentElement.lang=l;
  try{ localStorage.setItem(LKEY,l); }catch(e){}
  const root=document.documentElement.style;
  if(l==='ja'){ if(!jaFont){ jaFont=true; const k=document.createElement('link'); k.rel='stylesheet'; k.href='https://fonts.googleapis.com/css2?family=DotGothic16&family=Noto+Sans+JP:wght@500;700;900&display=swap'; document.head.appendChild(k); }
    root.setProperty('--ui','"Be Vietnam Pro","Noto Sans JP",system-ui,sans-serif'); root.setProperty('--px','"Pixelify Sans","DotGothic16","Noto Sans JP",monospace'); }
  else { root.removeProperty('--ui'); root.removeProperty('--px'); }
  i18nSlots.forEach(([o,k,vi])=>{ o[k]=L(vi); });
  i18nDom.forEach(([e,a,vi])=>{ if(a) e.setAttribute(a,L(vi)); else e.nodeValue=e.nodeValue.replace(e.nodeValue.trim(),L(vi)); });
  if(!first) document.dispatchEvent(new Event('langchange'));
}
