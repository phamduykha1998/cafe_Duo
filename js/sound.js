// Âm thanh tổng hợp bằng WebAudio và rung
/* ================= ÂM THANH & RUNG ================= */
// tổng hợp bằng WebAudio, không cần file âm thanh; trình duyệt chỉ cho phát sau lần chạm đầu tiên
const SKEY='cafe-len-pho-sound';
let AC=null, MUTE=false; const sfxLast={};
try{ MUTE=localStorage.getItem(SKEY)==='off'; }catch(e){}
function audio(){ if(MUTE) return null; if(!AC){ const C=window.AudioContext||window.webkitAudioContext; if(!C) return null; AC=new C(); } if(AC.state==='suspended') AC.resume(); return AC; }
addEventListener('pointerdown',()=>audio(),{capture:true});
function tone(f,t0,dur,{type='square',vol=.08,to=null,att=.005}={}){
  const a=AC, o=a.createOscillator(), gn=a.createGain(), t=a.currentTime+t0;
  o.type=type; o.frequency.setValueAtTime(f,t); if(to) o.frequency.exponentialRampToValueAtTime(to,t+dur);
  gn.gain.setValueAtTime(0,t); gn.gain.linearRampToValueAtTime(vol,t+att); gn.gain.exponentialRampToValueAtTime(.0001,t+dur);
  o.connect(gn).connect(a.destination); o.start(t); o.stop(t+dur+.02); }
function noise(t0,dur,vol,hp){ const a=AC, n=Math.max(1,a.sampleRate*dur|0), b=a.createBuffer(1,n,a.sampleRate), d=b.getChannelData(0); for(let i=0;i<n;i++) d[i]=(Math.random()*2-1)*(1-i/n);
  const s=a.createBufferSource(), f=a.createBiquadFilter(), gn=a.createGain(); s.buffer=b; f.type='highpass'; f.frequency.value=hp; gn.gain.value=vol; s.connect(f).connect(gn).connect(a.destination); s.start(a.currentTime+t0); }
const SFX={
  click:()=>tone(660,0,.05,{vol:.035}),
  coin:()=>{ tone(988,0,.07,{type:'triangle',vol:.06}); tone(1319,.06,.15,{type:'triangle',vol:.06}); },
  cash:()=>[523,659,784,1047].forEach((f,i)=>tone(f,i*.07,.18,{type:'triangle',vol:.07})),
  fanfare:()=>[523,659,784,1047,784,1047].forEach((f,i)=>tone(f,i*.11,i===5?.6:.16,{vol:.06})),
  bad:()=>{ tone(220,0,.18,{type:'sawtooth',vol:.045,to:150}); tone(165,.16,.3,{type:'sawtooth',vol:.045,to:110}); },
  twist:()=>{ tone(196,0,.13,{vol:.06}); tone(185,.15,.13,{vol:.06}); tone(147,.32,.5,{type:'sawtooth',vol:.06,to:104}); },
  card:()=>{ noise(0,.08,.05,2500); tone(880,.03,.08,{type:'triangle',vol:.035}); },
  pop:()=>{ noise(0,.07,.07,1200); tone(420,0,.09,{type:'triangle',vol:.05,to:900}); },
  heart:()=>[784,988,1175].forEach((f,i)=>tone(f,i*.08,.22,{type:'sine',vol:.07})),
  ok:k=>{ const m=1+Math.min(k||0,12)*.045; tone(1047*m,0,.06,{type:'triangle',vol:.07}); tone(1568*m,.05,.13,{type:'triangle',vol:.06}); },
  wrong:()=>tone(150,0,.24,{vol:.055,to:90}),
  tick:()=>tone(1250,0,.035,{vol:.03}),
  pour:()=>noise(0,.05,.025,3500),
  bubble:()=>tone(rnd(260,480),0,.07,{type:'sine',vol:.035,to:rnd(600,900)}),
  bell:()=>[1319,1047].forEach((f,i)=>tone(f,i*.2,.55,{type:'sine',vol:.08})),
  chirp:()=>{ const f=rnd(2600,3600); tone(f,0,.05,{type:'sine',vol:.014,to:f*1.3}); tone(f*1.08,.08,.05,{type:'sine',vol:.012,to:f*1.4}); }
};
function sfx(k,gap,arg){ if(!AC&&navigator.userActivation&&!navigator.userActivation.hasBeenActive) return; const a=audio(); if(!a) return; const now=performance.now(); if(gap&&now-(sfxLast[k]||0)<gap) return; sfxLast[k]=now; try{ SFX[k](arg); }catch(e){} }
function buzz(p){ if(navigator.userActivation&&!navigator.userActivation.hasBeenActive) return; if(!MUTE&&navigator.vibrate) try{ navigator.vibrate(p); }catch(e){} }
function setMute(m){ MUTE=m; try{ localStorage.setItem(SKEY,m?'off':'on'); }catch(e){} if(m&&AC) AC.suspend(); const b=$('sndBtn'); b.textContent=m?'🔇':'🔊'; b.title=m?L("Bật âm thanh & rung"):L("Tắt âm thanh & rung"); }
$('sndBtn').onclick=()=>{ setMute(!MUTE); if(!MUTE) sfx('coin'); }; setMute(MUTE);
document.addEventListener('click',e=>{ if(e.target.closest('button')&&(!e.target.closest('.rpanel')||e.target.closest('#rEnd'))) sfx('click',40); },true);
