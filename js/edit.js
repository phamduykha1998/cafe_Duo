// Chế độ thiết kế vườn (kéo thả, mua, dỡ đồ)
/* ---- chế độ thiết kế vườn ---- */
function gridOverlay(){
  for(let r=0;r<GR;r++) for(let c=0;c<GC;c++){ if(blockedCell(c,r)) continue; const occ=itemAt(c,r);
    g.fillStyle=occ?'rgba(255,255,255,.10)':'rgba(255,255,255,.18)'; g.fillRect(cellX(c)+1,cellY(r)+1,CS-2,CS-2); }
}
function ghost(){
  if(!edit.hover) return; const [c,r]=edit.hover;
  if(edit.drag){ const d=edit.drag;
    if(d.cart){ const cc=clamp(c-d.dc,0,GC-7), ok=cartFits(cc); g.fillStyle=ok?'rgba(90,154,79,.35)':'rgba(217,71,59,.35)'; g.fillRect(cellX(cc),cellY(0),7*CS,4*CS);
      const sv=S.cart; S.cart=cc; g.globalAlpha=.8; cartBack(); cartFront(); awning(); g.globalAlpha=1; S.cart=sv; return; }
    const it=catOf(d.o.id), pc=c-d.dc, pr=r-d.dr, ok=fits(d.o.id,pc,pr,d.o);
    g.fillStyle=ok?'rgba(90,154,79,.35)':'rgba(217,71,59,.35)'; g.fillRect(cellX(pc),cellY(pr),it.w*CS,it.h*CS);
    g.globalAlpha=.85; drawItem({id:d.o.id,c:pc,r:pr,d:d.o.d},true); g.globalAlpha=1; return; }
  if(edit.sel==='del'){ const o=itemAt(c,r); if(o){ const it=catOf(o.id); g.fillStyle='rgba(217,71,59,.45)'; g.fillRect(cellX(o.c),cellY(o.r),it.w*CS,it.h*CS); } return; }
  if(!edit.sel){ const o=itemAt(c,r); if(o){ const it=catOf(o.id); g.strokeStyle='rgba(255,255,255,.9)'; g.lineWidth=1; g.strokeRect(cellX(o.c)+.5,cellY(o.r)+.5,it.w*CS-1,it.h*CS-1); }
    else if(c>=cartC()&&c<=cartC()+6&&r>=0&&r<=3){ g.strokeStyle='rgba(255,255,255,.9)'; g.strokeRect(cellX(cartC())+.5,cellY(0)+.5,7*CS-1,4*CS-1); } return; }
  const it=catOf(edit.sel), pc=c-Math.floor(it.w/2), pr=r-(it.h-1), ok=fits(edit.sel,pc,pr)&&S.cash>=it.cost;
  g.fillStyle=ok?'rgba(90,154,79,.35)':'rgba(217,71,59,.35)'; g.fillRect(cellX(pc),cellY(pr),it.w*CS,it.h*CS);
  g.globalAlpha=.75; drawItem({id:edit.sel,c:pc,r:pr,d:curDay()},true); g.globalAlpha=1;
}
function worldOf(ev){ const rc=cv.getBoundingClientRect(); return [(ev.clientX-rc.left)/rc.width*VW-OX,(ev.clientY-rc.top)/rc.height*H]; }
function cellOf(wx,wy){ return [Math.floor((wx-G0X)/CS),Math.floor((wy-G0Y)/CS)]; }
function hitVil(wx,wy){ let best=null,bd=1e9; ents.forEach(e=>{ if(!e.vil) return; const sit=e.st==='sit'||e.st==='idle'||e.st==='wait', top=e.y-(sit?26:31)-(COARSE?4:0);
  if(Math.abs(wx-e.x)<(COARSE?12:8)&&wy>top&&wy<e.y+(COARSE?6:3)){ const d=Math.abs(wx-e.x)+Math.abs(wy-(e.y-14)); if(d<bd){bd=d;best=e;} } }); return best; }
function hitWeed(wx,wy){ let best=null,bd=1e9; weedsOf().forEach(w=>{ const [x,y]=weedPos(w), d=Math.hypot(wx-x,(wy-(y-4))*1.2); if(d<(COARSE?13:9)&&d<bd){bd=d;best=w;} }); return best; }
// cầm dọc: vuốt ngang để dời khung nhìn; chạm nhẹ (không vuốt) vẫn là bấm
cv.addEventListener('pointermove',ev=>{
  if(pan&&ev.pointerId===pan.id){ const dx=ev.clientX-pan.x; if(Math.abs(dx)>7) pan.moved=true;
    if(pan.moved){ camX=pan.cam-dx/(cv.clientWidth/VW); place(); return; } }
  const [wx,wy]=worldOf(ev);
  if(edit){ edit.hover=cellOf(wx,wy); return; }
  hoverE=S?hitVil(wx,wy):null; hoverW=S&&!hoverE?hitWeed(wx,wy):null; cv.style.cursor=hoverE||hoverW?'pointer':''; });
cv.addEventListener('pointerleave',()=>{ if(edit&&!edit.drag) edit.hover=null; hoverE=null; hoverW=null; });
cv.addEventListener('pointerdown',ev=>{
  if(sev&&!edit&&S&&sevHit(...worldOf(ev))){ sevTap=true; return; }
  if(TALL&&cv.clientWidth>viewW+1){ pan={id:ev.pointerId,x:ev.clientX,cam:camX,moved:false}; cv.setPointerCapture(ev.pointerId); }
  if(!edit||!S) return; const [c,r]=cellOf(...worldOf(ev)); edit.hover=[c,r];
  if(edit.sel) return;
  const o=itemAt(c,r);
  if(o){ pan=null; edit.drag={o,dc:c-o.c,dr:r-o.r}; cv.setPointerCapture(ev.pointerId); ev.preventDefault(); return; }
  const cc=cartC(); if(c>=cc&&c<=cc+6&&r>=0&&r<=3){ pan=null; edit.drag={cart:true,dc:c-cc}; cv.setPointerCapture(ev.pointerId); ev.preventDefault(); }
});
cv.addEventListener('pointercancel',()=>{ pan=null; if(edit) edit.drag=null; });
cv.addEventListener('pointerup',ev=>{
  if(sevTap){ sevTap=false; pan=null; return; }
  const panned=pan&&pan.moved; pan=null; if(panned) return;
  if(!S) return; const [wx,wy]=worldOf(ev);
  if(!edit){ if(!$('veil').hidden) return; const v=hitVil(wx,wy); if(v){ talk(v.vil); return; } const w=hitWeed(wx,wy); if(w) pullWeed(w); return; }
  const [c,r]=cellOf(wx,wy); edit.hover=[c,r];
  if(edit.drag){ const d=edit.drag; edit.drag=null;
    if(d.cart){ const cc=clamp(c-d.dc,0,GC-7); if(cc!==S.cart&&cartFits(cc)){ S.cart=cc; S.weeds=S.weeds.filter(w=>!blockedCell(w.c,w.r)); save(); toast(L("Đã dời xe cafe"),'good'); idle(); } else if(cc!==S.cart) toast(L("Chỗ này vướng đồ, chưa dời được"),'bad'); return; }
    const pc=c-d.dc, pr=r-d.dr; if(pc===d.o.c&&pr===d.o.r) return;
    if(fits(d.o.id,pc,pr,d.o)){ d.o.c=pc; d.o.r=pr; clearWeedsUnder(d.o); save(); toast(L("Đã dời {0}",catOf(d.o.id).n),'good'); idle(); } else toast(L("Chỗ này không đặt được"),'bad'); return; }
  if(edit.sel==='del'){ const o=itemAt(c,r); if(!o) return; const it=catOf(o.id); S.layout=S.layout.filter(x=>x!==o); S.cash+=it.cost*.5; save(); hudSlow(); toast(L("Dỡ {0} · hoàn {1}",it.n,vnd(it.cost*.5))); idle(); updCat(); return; }
  if(!edit.sel) return;
  const it=catOf(edit.sel), pc=c-Math.floor(it.w/2), pr=r-(it.h-1);
  if(S.cash<it.cost){ toast(L("Không đủ tiền mặt"),'bad'); return; }
  if(!fits(edit.sel,pc,pr)){ toast(L("Chỗ này không đặt được"),'bad'); return; }
  const no={id:edit.sel,c:pc,r:pr}; if(edit.sel==='herb') no.d=S.day; S.layout.push(no); clearWeedsUnder(no); S.cash-=it.cost; addLog(S.day,L("Mua {0} ({1})",it.n,vnd(it.cost))); save(); hudSlow();
  sfx('pop'); toast(L("Đặt {0} · −{1}",it.n,vnd(it.cost)),'good'); idle(); updCat();
});
function thumb(id){
  const c=document.createElement('canvas'), it=catOf(id); c.width=72; c.height=72; const old=g; g=c.getContext('2d'); g.imageSmoothingEnabled=false;
  if(it.tree){ const im=treeImg(it.tree,0,it.tree==='mai'?4:seasonNow()), [tw,th]=TSZ[it.tree], s=Math.min(68/tw,68/th); g.drawImage(im,(72-tw*s)/2,72-th*s,tw*s,th*s); g=old; return c.toDataURL(); }
  const o={id,c:0,r:0,d:-9}, s=Math.min(2,60/(it.w*CS)), ox=(72-it.w*CS*s)/2-G0X*s, oy=68-(G0Y+it.h*CS)*s; g.setTransform(s,0,0,s,ox,oy); THUMB=true; drawItem(o,true); THUMB=false; g=old; return c.toDataURL();
}
const THUMBS={}; function thumbs(){ CAT.forEach(c=>{ if(!THUMBS[c.id]) THUMBS[c.id]=thumb(c.id); }); }
