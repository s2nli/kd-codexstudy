(()=>{
const IC={back:'<path d="M15 5l-7 7 7 7"/>',play:'<path d="M8 5l11 7-11 7z"/>',pause:'<path d="M8 5v14M16 5v14"/>',prev:'<path d="M6 5v14M18 5l-9 7 9 7z"/>',next:'<path d="M18 5v14M6 5l9 7-9 7z"/>',vol:'<path d="M4 9v6h4l5 4V5L8 9zM17 9a4 4 0 010 6"/>',mute:'<path d="M4 9v6h4l5 4V5L8 9zM17 9l4 6M21 9l-4 6"/>',gear:'<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/>',dl:'<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>',fs:'<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',pip:'<rect x="3" y="5" width="18" height="14" rx="2"/><rect x="12" y="11" width="7" height="5" rx="1"/>',more:'<circle cx="12" cy="5" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="12" cy="19" r="1.2"/>',lock:'<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>',unlock:'<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 017-1.5"/>',tl:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',att:'<path d="M20 11l-8 8a5 5 0 01-7-7l8-8a3.5 3.5 0 015 5l-8 8a2 2 0 01-3-3l7-7"/>',list:'<path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/>',side:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M15 4v16"/>',x:'<path d="M6 6l12 12M18 6L6 18"/>',vid:'<rect x="5" y="5" width="14" height="14" rx="2"/><path d="M10 9.5l4.5 2.5-4.5 2.5z"/><path d="M2 6v12M22 6v12"/>',cmp:'<path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/>',chev:'<path d="M9 5l7 7-7 7"/>',b10:'<path d="M4 4v5h5"/><path d="M4.5 9A8 8 0 1112 20"/><text x="12" y="15.5" font-size="7" font-weight="700" fill="currentColor" stroke="none" text-anchor="middle">10</text>',f10:'<path d="M20 4v5h-5"/><path d="M19.5 9A8 8 0 1012 20"/><text x="12" y="15.5" font-size="7" font-weight="700" fill="currentColor" stroke="none" text-anchor="middle">10</text>',spark:'<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',aud:'<path d="M4 15v-3a8 8 0 0116 0v3"/><rect x="3" y="14" width="4" height="6" rx="1.5"/><rect x="17" y="14" width="4" height="6" rx="1.5"/>'};
const ic=n=>`<svg viewBox="0 0 24 24" fill="${n==='play'?'currentColor':'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${IC[n]}</svg>`;
const fmt=t=>{if(!isFinite(t))return'0:00';t=Math.max(0,t|0);const h=t/3600|0,m=(t%3600)/60|0,s=t%60;return(h?h+':'+String(m).padStart(2,'0'):m)+':'+String(s).padStart(2,'0')};
const sec=v=>typeof v==='number'?v:String(v).split(':').reduce((a,b)=>a*60+ +b,0);
const ls={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch{return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch{}}};
const SPEEDS=Array.from({length:56},(_,i)=>(i+5)/10),QORDER=['auto','360p','480p','720p','1080p'];
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let current=null;

class LecturePlayer{
constructor(root,d,o={}){this.r=root;this.o=o;this.speed=(x=>{x=Math.round(x*10)/10;return SPEEDS.includes(x)?x:1})(+ls.get('lp:speed',1));this.vol=ls.get('lp:vol',1);this.qSel=ls.get('lp:q','auto');this.locked=false;this.menu=null;this.lv=[];this.sub=null;this.sl='0';this.audio=false;this.build();this.setBri(ls.get('lp:bri',1));this.bind();this.load(d)}
static last(){return ls.get('lp:last',null)}
build(){const r=this.r;r.classList.add('lp');r.tabIndex=0;
r.innerHTML=`<video playsinline webkit-playsinline preload="metadata"></video><div class="lp-tap"></div>
<div class="lp-fx l">−10s</div><div class="lp-fx r">+10s</div><div class="lp-spin"></div><div class="lp-aud"><p>Audio Mode</p><small>Audio only. Tap to show controls.</small></div><div class="lp-hud"></div>
<div class="lp-err"><p>This lecture couldn't be played.</p><button data-a="retry">Try again</button></div>
<div class="lp-top"><button data-a="back" aria-label="Back">${ic('back')}</button><h2 class="lp-title"></h2><div class="lp-net"><i></i><i></i><i></i><i></i><span></span></div><button data-a="dl" aria-label="Download">${ic('dl')}</button><button data-a="more" aria-label="More">${ic('more')}</button></div>
<div class="lp-side"><button data-a="lock" aria-label="Lock controls">${ic('unlock')}</button><button data-a="side" aria-label="Toggle sidebar" hidden>${ic('side')}</button></div>
<div class="lp-bot"><div class="lp-prog"><div class="lp-times"><span class="lp-l"><span class="lp-cur">0:00</span><button class="lp-badge" data-a="tl" aria-label="Timeline" hidden>ƒx</button></span><span class="lp-dur">0:00</span></div><div class="lp-bar"><div class="lp-track"><div class="lp-buf"></div><div class="lp-fill"></div></div><div class="lp-thumb"></div><div class="lp-tip">0:00</div></div></div>
<div class="lp-ctl"><button data-a="play" aria-label="Play">${ic('play')}</button><button data-a="back10" aria-label="Back 10 seconds">${ic('b10')}</button><button data-a="fwd10" aria-label="Forward 10 seconds">${ic('f10')}</button><button data-a="prev" aria-label="Previous lecture">${ic('prev')}</button>
<span class="lp-vwrap" style="display:flex;align-items:center"><button data-a="mute" aria-label="Mute">${ic('vol')}</button><input class="lp-vol" type="range" min="0" max="1" step=".05" aria-label="Volume"></span><span class="lp-sp"></span>
<button class="ai" data-a="ai"><i>${ic('spark')}</i>Ask AI</button><button data-a="lec" aria-label="Lecture list">${ic('list')}</button><button data-a="tl" aria-label="Timeline">${ic('vid')}</button><button data-a="aud" aria-label="Audio mode">${ic('aud')}</button><button data-a="set" aria-label="Settings">${ic('gear')}</button><button data-a="pip" aria-label="Picture in picture">${ic('pip')}</button><button data-a="fs" aria-label="Fullscreen">${ic('fs')}</button></div></div>
<div class="lp-menu" data-m="set"></div><div class="lp-menu more" data-m="more"></div><div class="lp-panel"></div><div class="lp-toast"></div>`;
const q=s=>r.querySelector(s);this.q=q;this.v=q('video');this.title=q('.lp-title');this.cur=q('.lp-cur');this.dur=q('.lp-dur');this.fill=q('.lp-fill');this.buf=q('.lp-buf');this.thumb=q('.lp-thumb');this.tip=q('.lp-tip');this.bar=q('.lp-bar');this.vsl=q('.lp-vol');this.panel=q('.lp-panel');this.toastEl=q('.lp-toast');this.m={set:q('[data-m=set]'),more:q('[data-m=more]')};
if(this.o.onToggleSidebar)q('[data-a=side]').hidden=false}
bind(){const r=this.r,v=this.v;
r.addEventListener('click',e=>{const b=e.target.closest('button,a,[data-t]');if(!b||b.disabled)return;const D=b.dataset;
if(D.s!==undefined){this.sub=D.s||null;return this.renderSet()}
if(D.o!==undefined){const s=this.sub,o=D.o;if(s==='sp')this.setSpeed(+o);else if(s==='q')this.setQ(o);else if(s==='aud')this.setAudio(o==='1');else if(s==='sl')this.setSleep(o);return this.renderSet()}
if(D.t!=null){v.currentTime=+D.t;return this.show()}if(D.lec!=null){this.closeAll();return this.o.onSelectLecture?.(this.flat[+D.lec])}
({back:()=>this.o.onBack?this.o.onBack():history.back(),more:()=>this.openMenu('more'),set:()=>{this.openMenu('set')},lock:()=>this.setLock(!this.locked),side:()=>this.o.onToggleSidebar?.(),retry:()=>this.retry(),play:()=>this.toggle(),back10:()=>this.skip(-10,'l'),fwd10:()=>this.skip(10,'r'),aud:()=>this.setAudio(!this.audio),ai:()=>this.o.onAskAI?this.o.onAskAI(this.d):this.toast('Ask AI isn\'t connected yet'),prev:()=>this.nav('previousLecture'),next:()=>this.nav('nextLecture'),mute:()=>{v.muted=!v.muted;this.icons()},dl:()=>this.download(),pip:()=>this.pip(),fs:()=>this.fs(),tl:()=>this.openPanel('tl'),att:()=>this.openPanel('att'),lec:()=>this.openPanel('lec'),close:()=>this.closeAll(),lockset:()=>{this.closeAll();this.setLock(true)}})[D.a]?.();this.show()});
r.addEventListener('pointermove',e=>{if(e.pointerType==='mouse')this.show()});
r.addEventListener('pointerdown',()=>current=this);r.addEventListener('focus',()=>current=this);
this.vsl.addEventListener('input',()=>{v.volume=+this.vsl.value;v.muted=false;ls.set('lp:vol',v.volume)});
/* tap layer */
const tap=this.q('.lp-tap');let last={t:0,s:''},timer,g=null;
tap.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'||this.locked)return;const rc=r.getBoundingClientRect(),x=(e.clientX-rc.left)/rc.width,z=x<.4?'l':x>.6?'r':'m';g={y:e.clientY,x:e.clientX,z,on:false,h:rc.height,base:z==='l'?(v.muted?0:v.volume):this.bri}});
tap.addEventListener('pointermove',e=>{if(!g||g.z==='m')return;const dy=g.y-e.clientY;if(!g.on){if(Math.abs(dy)<12||Math.abs(dy)<Math.abs(e.clientX-g.x))return;g.on=true;clearTimeout(timer);try{tap.setPointerCapture(e.pointerId)}catch{}}
const val=Math.min(1,Math.max(0,g.base+dy/(g.h*.8)));
if(g.z==='l'){v.muted=val===0;v.volume=val;ls.set('lp:vol',val);this.hud(val?'🔊 '+Math.round(val*100)+'%':'🔇 Muted','l')}else{this.setBri(val);this.hud('☀ '+Math.round(val*100)+'%','r')}});
tap.addEventListener('pointercancel',()=>{g=null});
tap.addEventListener('pointerup',e=>{const w=g;g=null;if(w&&w.on)return;if(this.menu){this.closeAll();return}
if(e.pointerType==='mouse'){if(!this.locked)this.toggle();return this.show()}
const rc=r.getBoundingClientRect(),x=(e.clientX-rc.left)/rc.width,side=x<.35?'l':x>.65?'r':'m',now=Date.now();
if(now-last.t<300&&side===last.s&&side!=='m'&&!this.locked){clearTimeout(timer);this.skip(side==='l'?-10:10,side);last.t=0;return}
last={t:now,s:side};clearTimeout(timer);timer=setTimeout(()=>this.tapToggle(),290)});
tap.addEventListener('dblclick',e=>{if(!this.locked&&e.pointerType!=='touch')this.fs()});
/* seek bar */
const pos=e=>{const b=this.bar.getBoundingClientRect();return Math.min(1,Math.max(0,(e.clientX-b.left)/b.width))};
this.bar.addEventListener('pointerdown',e=>{if(!v.duration)return;this.bar.setPointerCapture(e.pointerId);this.drag=pos(e);r.classList.add('drag');this.drawDrag();clearTimeout(this.hideT)});
this.bar.addEventListener('pointermove',e=>{const p=pos(e);this.tip.style.left=p*100+'%';this.tip.textContent=fmt(p*(v.duration||0));if(this.drag!=null){this.drag=p;this.drawDrag()}});
const end=()=>{if(this.drag==null)return;v.currentTime=this.drag*v.duration;this.drag=null;r.classList.remove('drag');this.show()};
this.bar.addEventListener('pointerup',end);this.bar.addEventListener('pointercancel',end);
/* video events */
v.addEventListener('play',()=>{this.icons();this.show()});v.addEventListener('pause',()=>{this.icons();this.show()});
v.addEventListener('waiting',()=>this.busy(1));v.addEventListener('stalled',()=>this.busy(1));
['playing','canplay','seeked'].forEach(n=>v.addEventListener(n,()=>this.busy(0)));
v.addEventListener('timeupdate',()=>{this.draw();const n=Date.now();if(n-(this.sv||0)>2000){this.sv=n;this.save()}});
v.addEventListener('progress',()=>this.draw());v.addEventListener('durationchange',()=>this.draw());
v.addEventListener('volumechange',()=>this.icons());v.addEventListener('ratechange',()=>this.labels());
v.addEventListener('loadedmetadata',()=>this.ready());
v.addEventListener('error',()=>{if(!this.hls)this.err()});
v.addEventListener('ended',()=>{this.show();ls.set('lp:pos:'+this.id,0);if(this.sl==='end')return this.sleepEnd();const n=this.d.nextLecture;if(n)this.toast('Up next: '+(n.title||'next lecture'),[['Play',()=>this.nav('nextLecture')]],8000)});
document.addEventListener('fullscreenchange',()=>{this.icons();this.show()});
addEventListener('resize',()=>this.show());addEventListener('orientationchange',()=>setTimeout(()=>this.show(),250));
document.addEventListener('keydown',e=>this.key(e));
document.addEventListener('pointerdown',e=>{if(current===this&&!r.contains(e.target))current=null});
addEventListener('pagehide',()=>this.save());
this.netT=setInterval(()=>this.net(),2000)}
key(e){if(current!==this||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)&&e.target.type!=='range')return;const v=this.v,k=e.key;let h=true;
if(k===' '||k==='k'){if(e.target.tagName==='BUTTON'&&k===' ')return;this.toggle()}
else if(k==='ArrowLeft')this.skip(-10,'l');else if(k==='ArrowRight')this.skip(10,'r');
else if(k==='ArrowUp'){v.volume=Math.min(1,v.volume+.1);v.muted=false;ls.set('lp:vol',v.volume)}else if(k==='ArrowDown'){v.volume=Math.max(0,v.volume-.1);ls.set('lp:vol',v.volume)}
else if(k==='m'||k==='M')v.muted=!v.muted;else if(k==='f'||k==='F')this.fs();else if(k==='p'||k==='P')this.pip();
else if(k==='>'||k==='.'){const i=SPEEDS.indexOf(this.speed);this.setSpeed(SPEEDS[Math.min(SPEEDS.length-1,i+1)])}
else if(k==='<'||k===','){const i=SPEEDS.indexOf(this.speed);this.setSpeed(SPEEDS[Math.max(0,i-1)])}
else if(k==='Escape'&&this.menu)this.closeAll();else h=false;
if(h){e.preventDefault();this.show()}}
/* loading */
load(d){this.save();this.d=Object.assign({quality:{},attachments:[],chapters:[],lectures:[],previousLecture:null,nextLecture:null,downloadUrl:null},d);d=this.d;this.id=d.id||d.videoUrl;this.r.classList.remove('failed');this.closeAll();this.lv=[];this.retried=0;
this.title.textContent=d.title||'';this.v.poster=d.poster||'';this.dur.textContent=typeof d.duration==='string'?d.duration:'0:00';
this.qs=QORDER.filter(k=>k==='auto'||d.quality[k]);this.hasMap=this.qs.length>1;this.cq=this.qs.includes(this.qSel)?this.qSel:'auto';
this.q('[data-a=prev]').disabled=!d.previousLecture;this.q('.lp-badge').hidden=!d.chapters.length;
this.v.volume=this.vol;this.vsl.value=this.vol;
this.saved=ls.get('lp:pos:'+this.id,0);this.offer=true;
this.setSrc(this.urlFor(this.cq),0,false);this.v.playbackRate=this.speed;this.labels();this.icons();this.draw();this.show()}
urlFor(k){return this.d.quality[k]||this.d.videoUrl}
setSrc(url,t,play){const v=this.v;this.hls?.destroy();this.hls=null;this.pend={t,play};this.busy(1);this.r.classList.remove('failed');
if(/\.m3u8(\?|$)/i.test(url)&&!v.canPlayType('application/vnd.apple.mpegurl')){
if(window.Hls&&Hls.isSupported()){const h=this.hls=new Hls({maxBufferLength:30,startLevel:-1});h.loadSource(url);h.attachMedia(v);
h.on(Hls.Events.MANIFEST_PARSED,()=>{this.lv=[...new Set(h.levels.map(l=>l.height).filter(Boolean))].sort((a,b)=>a-b);this.applyQ()});
h.on(Hls.Events.ERROR,(_,x)=>{if(!x.fatal)return;if(x.type===Hls.ErrorTypes.NETWORK_ERROR&&!this.retried){this.retried=1;h.startLoad()}else if(x.type===Hls.ErrorTypes.MEDIA_ERROR&&this.retried<2){this.retried=2;h.recoverMediaError()}else this.err()})}
else return this.err('This browser can\'t play HLS streams.')}
else{v.src=url;v.load()}}
ready(){const v=this.v,p=this.pend||{};if(p.t)v.currentTime=p.t;if(p.play)v.play().catch(()=>{});this.pend=null;this.draw();
if(this.offer){this.offer=false;const s=this.saved;if(s>10&&s<v.duration-15)this.toast('Continue from '+fmt(s),[['Start over',()=>{v.currentTime=0},1],['Continue',()=>{v.currentTime=s;v.play().catch(()=>{})}]],9000)}}
retry(){const v=this.v,t=v.currentTime||this.saved||0;this.retried=0;this.setSrc(this.urlFor(this.cq),t,true)}
err(m){this.busy(0);this.r.classList.add('failed');if(m)this.q('.lp-err p').textContent=m}
busy(b){this.r.classList.toggle('busy',!!b)}
/* actions */
toggle(){this.v.paused?this.v.play().catch(()=>{}):this.v.pause()}
skip(s,side){const v=this.v;v.currentTime=Math.max(0,Math.min(v.duration||1e9,v.currentTime+s));const f=this.q('.lp-fx.'+(side==='l'?'l':'r'));f.classList.remove('go');void f.offsetWidth;f.classList.add('go');this.show()}
setSpeed(s){this.speed=s;this.v.playbackRate=s;ls.set('lp:speed',s);this.labels()}
qualityOpts(){if(this.hls&&this.lv.length>1)return['auto',...this.lv.map(h=>h+'p')];if(this.hasMap)return this.qs;return['auto']}
setQ(k){this.cq=k;this.qSel=k;ls.set('lp:q',k);if(this.hls&&this.lv.length>1){this.hls.currentLevel=k==='auto'?-1:this.hls.levels.findIndex(l=>l.height===parseInt(k))}else{const t=this.v.currentTime,p=!this.v.paused;this.setSrc(this.urlFor(k),t,p)}this.labels()}
nav(k){const n=this.d[k];if(n)this.o.onNavigate?this.o.onNavigate(n,k):this.toast('Open: '+(n.title||'lecture'))}
download(){const u=this.d.downloadUrl;if(this.o.onDownload)return this.o.onDownload(this.d);if(!u)return this.toast('Download unavailable for this lecture.');const a=document.createElement('a');a.href=u;a.download='';a.rel='noopener';document.body.appendChild(a);a.click();a.remove()}
async pip(){const v=this.v;try{if(document.pictureInPictureElement)await document.exitPictureInPicture();else if(document.pictureInPictureEnabled&&!v.disablePictureInPicture)await v.requestPictureInPicture();else this.toast('Picture-in-picture isn\'t supported here')}catch{this.toast('Picture-in-picture isn\'t available')}}
async fs(){const r=this.r,v=this.v;try{if(document.fullscreenElement){await document.exitFullscreen();screen.orientation?.unlock?.()}
else if(r.requestFullscreen){await r.requestFullscreen();if(/Mobi|Android/i.test(navigator.userAgent))screen.orientation?.lock?.('landscape').catch(()=>{})}
else if(v.webkitEnterFullscreen)v.webkitEnterFullscreen();else if(r.webkitRequestFullscreen)r.webkitRequestFullscreen()}catch{}}
setLock(l){this.locked=l;this.r.classList.toggle('locked',l);this.q('[data-a=lock]').innerHTML=ic(l?'lock':'unlock');if(l)this.closeAll();this.show()}
/* UI state */
show(){const r=this.r;r.classList.remove('idle');clearTimeout(this.hideT);if(!this.v.paused&&!this.menu&&this.drag==null)this.hideT=setTimeout(()=>{if(!this.v.paused&&!this.menu)r.classList.add('idle')},3000)}
tapToggle(){if(this.r.classList.contains('idle')){this.show()}else if(!this.v.paused){this.r.classList.add('idle');clearTimeout(this.hideT)}else this.show()}
icons(){const v=this.v;this.q('[data-a=play]').innerHTML=ic(v.paused?'play':'pause');this.q('[data-a=mute]').innerHTML=ic(v.muted||!v.volume?'mute':'vol');this.q('[data-a=fs]').innerHTML=ic(document.fullscreenElement?'cmp':'fs');this.vsl.value=v.muted?0:v.volume;this.vol=v.volume}
labels(){if(this.menu==='set')this.renderSet()}
draw(){const v=this.v,d=v.duration||0;if(this.drag==null){const p=d?v.currentTime/d:0;this.fill.style.width=p*100+'%';this.thumb.style.left=p*100+'%';this.cur.textContent=fmt(v.currentTime)}
if(d)this.dur.textContent=fmt(d);let e=0;for(let i=0;i<v.buffered.length;i++)if(v.buffered.start(i)<=v.currentTime+.5)e=Math.max(e,v.buffered.end(i));this.buf.style.width=d?e/d*100+'%':0;if(this.panel.dataset.k==='tl'&&this.panel.classList.contains('open'))this.hiChap();this.segs()}
segs(){const d=this.v.duration,c=this.d.chapters;if(!d||!c.length)return;const k=this.id+d;if(this.sk===k)return;this.sk=k;const tr=this.q('.lp-track');tr.querySelectorAll('.lp-seg').forEach(x=>x.remove());c.forEach(ch=>{const t=sec(ch.time??ch.start);if(t>0&&t<d){const e=document.createElement('div');e.className='lp-seg';e.style.left=t/d*100+'%';tr.appendChild(e)}})}
drawDrag(){const p=this.drag,d=this.v.duration;this.fill.style.width=p*100+'%';this.thumb.style.left=p*100+'%';this.cur.textContent=fmt(p*d);this.tip.style.left=p*100+'%';this.tip.textContent=fmt(p*d)}
net(){const v=this.v,c=navigator.connection;let n=4,l='';if(!navigator.onLine){n=0;l='Offline'}else{let a=0;for(let i=0;i<v.buffered.length;i++)if(v.buffered.start(i)<=v.currentTime&&v.buffered.end(i)>=v.currentTime)a=v.buffered.end(i)-v.currentTime;n=this.r.classList.contains('busy')?1:a<4?2:a<15?3:4;if(c?.effectiveType)l=c.effectiveType.replace('slow-','').toUpperCase()}
this.q('.lp-net').querySelectorAll('i').forEach((el,i)=>el.classList.toggle('on',i<n));this.q('.lp-net span').textContent=l}
save(){const v=this.v;if(!this.id||!v.duration||this.pend)return;const t=v.currentTime>v.duration-10?0:v.currentTime;ls.set('lp:pos:'+this.id,Math.floor(t));ls.set('lp:last',{id:this.id,title:this.d.title,t:Math.floor(t),at:Date.now()})}
toast(msg,btns=[],ms=2600){const t=this.toastEl;t.innerHTML=`<span>${esc(msg)}</span>`;btns.forEach(([l,fn,g])=>{const b=document.createElement('button');b.textContent=l;if(g)b.className='ghost';b.onclick=()=>{t.classList.remove('open');fn()};t.appendChild(b)});t.classList.add('open');clearTimeout(this.toT);this.toT=setTimeout(()=>t.classList.remove('open'),ms)}
hud(t,side){const h=this.q('.lp-hud');h.textContent=t;h.className='lp-hud open '+side;clearTimeout(this.hT);this.hT=setTimeout(()=>h.classList.remove('open'),900)}
setBri(b){this.bri=b;this.v.style.filter=b<1?`brightness(${Math.max(.1,b)})`:'';ls.set('lp:bri',b)}
applyQ(){if(!this.hls||this.lv.length<2)return;const k=this.qSel,i=this.hls.levels.findIndex(l=>k!=='auto'&&l.height===parseInt(k));this.hls.currentLevel=i;this.cq=i<0?'auto':k;this.labels()}
setAudio(b){this.audio=b;this.q('[data-a=aud]').classList.toggle('on',b);this.r.classList.toggle('audio',b);if(b&&document.pictureInPictureElement)document.exitPictureInPicture().catch(()=>{});this.labels()}
setSleep(o){clearTimeout(this.slT);this.sl=o;if(o!=='0'&&o!=='end')this.slT=setTimeout(()=>this.sleepEnd(),o*60000)}
sleepEnd(){this.v.pause();this.sl='0';clearTimeout(this.slT);this.toast('Sleep Timer ended',[],4000)}
sleepLabel(){return this.sl==='0'?'Off':this.sl==='end'?'End of lecture':this.sl+' min'}
/* menus & panels */
openMenu(k){const was=this.menu===k;this.closeAll();if(was)return;this.menu=k;if(k==='set'){this.sub=null;this.renderSet()}else this.renderMore();this.m[k].classList.add('open');this.show()}
closeAll(){this.menu=null;Object.values(this.m).forEach(m=>m.classList.remove('open'));this.panel.classList.remove('open')}
renderSet(){const m=this.m.set,s=this.sub;
if(!s){const row=(k,l,v)=>`<button class="lp-row" data-s="${k}"><span>${l}</span><em>${v}</em>${ic('chev')}</button>`;
m.innerHTML=row('sp','Speed',this.speed===1?'Normal':this.speed+'x')+row('q','Quality',this.cq==='auto'?'Auto':this.cq)+row('aud','Audio Mode',this.audio?'On':'Off')+row('sl','Sleep Timer',this.sleepLabel());return}
const T={sp:'Speed',q:'Quality',aud:'Audio Mode',sl:'Sleep Timer'};
const O={sp:SPEEDS.map(x=>[x,x+'x',x===this.speed]),q:this.qualityOpts().map(k=>[k,k==='auto'?'Auto':k,k===this.cq]),aud:[['0','Off',!this.audio],['1','On',this.audio]],sl:[['0','Off'],['15','15 minutes'],['30','30 minutes'],['45','45 minutes'],['60','60 minutes'],['end','End of lecture']].map(o=>[...o,o[0]===this.sl])};
const st=m.querySelector('.lp-opt')?m.scrollTop:null;
m.innerHTML=`<button class="lp-row back" data-s="">${ic('back')}<span>${T[s]}</span></button>${O[s].map(o=>`<button class="lp-opt ${o[2]?'on':''}" data-o="${o[0]}"><span>${o[1]}</span><i class="rd"></i></button>`).join('')}`;
if(st!=null)m.scrollTop=st;else{const on=m.querySelector('.lp-opt.on');m.scrollTop=on?on.offsetTop-m.clientHeight/2+27:0}}
renderMore(){const d=this.d,dl=d.downloadUrl||this.o.onDownload;this.m.more.innerHTML=`<button class="lp-row" data-a="tl">${ic('tl')}Timeline</button><button class="lp-row" data-a="att">${ic('att')}Attachments</button><button class="lp-row" data-a="lec">${ic('list')}More lectures</button><button class="lp-row" data-a="dl">${ic('dl')}Download</button>`}
openPanel(k){const d=this.d,P=this.panel;let h='',t='';
if(k==='tl'){t='Timeline';h=d.chapters.length?d.chapters.map((c,i)=>`<button class="lp-item" data-t="${sec(c.time??c.start)}" data-i="${i}"><b>${fmt(sec(c.time??c.start))}</b><span>${esc(c.title)}</span></button>`).join(''):'<div class="lp-empty">No timeline for this lecture.</div>'}
if(k==='att'){t='Attachments';h=d.attachments.length?d.attachments.map(a=>`<a class="lp-item" href="${esc(a.url)}" target="_blank" rel="noopener">${ic('att')}<span>${esc(a.title||a.name||'Attachment')}${a.size?`<small>${esc(a.size)}</small>`:''}</span></a>`).join(''):'<div class="lp-empty">No attachments for this lecture.</div>'}
if(k==='lec'){t=d.course?.title||'Lectures';this.flat=[];const it=l=>{this.flat.push(l);return `<button class="lp-item ${l.id===this.id?'on':''}" data-lec="${this.flat.length-1}"><span>${esc(l.title)}${l.duration?`<small>${esc(l.duration)}</small>`:''}</span></button>`};
const pn=`<div style="display:flex;gap:6px"><button class="lp-item" data-a="prev" ${d.previousLecture?'':'disabled'}>Previous</button><button class="lp-item" data-a="next" ${d.nextLecture?'':'disabled'}>Next</button></div>`;
const body=d.course?.subjects?.length?d.course.subjects.map(s=>`<div class="lp-sub">${esc(s.title)}</div>`+(s.chapters||[]).map(c=>`<div class="lp-ch">${esc(c.title)}</div>`+(c.lectures||[]).map(it).join('')).join('')).join(''):d.lectures.length?d.lectures.map(it).join(''):'<div class="lp-empty">No other lectures in this course.</div>';h=pn+body}
P.dataset.k=k;P.innerHTML=`<div class="lp-ph"><span>${t}</span><button data-a="close" aria-label="Close">${ic('x')}</button></div><div class="lp-pb">${h}</div>`;
Object.values(this.m).forEach(m=>m.classList.remove('open'));this.menu='panel';P.classList.add('open');if(k==='tl')this.hiChap()}
hiChap(){const t=this.v.currentTime;let a=-1;this.d.chapters.forEach((c,i)=>{if(sec(c.time??c.start)<=t)a=i});this.panel.querySelectorAll('[data-i]').forEach(b=>b.classList.toggle('on',+b.dataset.i===a))}
destroy(){clearInterval(this.netT);this.save();this.hls?.destroy();this.r.innerHTML=''}
}
window.LecturePlayer=LecturePlayer;

})();
