(() => {
const $ = (s) => document.querySelector(s), app = $('#app');
const esc = (v = '') => String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const I = { play: '<svg viewBox="0 0 24 24"><path d="M8 5l11 7-11 7z" fill="currentColor"/></svg>', cam: '<svg viewBox="0 0 24 24"><rect x="3" y="6" width="13" height="12" rx="3"/><path d="M16 10l5-3v10l-5-3"/></svg>', doc: '<svg viewBox="0 0 24 24"><path d="M6 3h8l5 5v13H6zM14 3v5h5"/></svg>', chev: '<svg class="chev" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>', ok: '<svg viewBox="0 0 24 24"><path d="M5 13l4 4 10-10"/></svg>' };
const params = new URLSearchParams(location.search), id = params.get('id') || 'english-special';
let batch, subs = [], player = null, cur = null;
const seen = () => { try { return JSON.parse(localStorage.getItem('cx-watched') || '{}'); } catch { return {}; } };
const mark = (k) => { const s = seen(); s[k] = 1; try { localStorage.setItem('cx-watched', JSON.stringify(s)); } catch {} };
const route = () => { const [v = 'lectures', a, b] = location.hash.slice(1).split('/'); return { v, a: a === undefined ? null : +a, b: b === undefined ? null : +b }; };
const go = (h) => { location.hash = h; };

async function init() {
  try {
    const [bl, d] = await Promise.all([fetch('batches.json').then((r) => r.json()), fetch('data/english-special.json').then((r) => r.json())]);
    batch = (bl.batches || []).find((b) => b._id === id);
    subs = d.subjects || [];
  } catch (e) {}
  if (!batch) { location.replace('index.html'); return; }
  document.title = batch.name + ' – CODEX STUDYS';
  $('#barTitle').textContent = batch.name;
  $('#back').onclick = () => { const r = route(); if (r.v === 'play') history.back(); else if (r.a !== null) history.back(); else if (history.length > 1 && document.referrer) history.back(); else location.href = 'index.html'; };
  addEventListener('hashchange', render); render();
}

function render() {
  const r = route();
  if (r.v !== 'play' && !$('#playerLayer').hidden) closePlayer();
  if (r.v === 'play') { openLecture(r.a, r.b); return; }
  const lec = subs.reduce((n, s) => n + s.lectures.length, 0), nts = subs.reduce((n, s) => n + s.notes.length, 0);
  const tabs = ['lectures', 'notes', 'about'];
  let h = `<section class="hero"><img src="${esc(batch.previewImage)}" alt="${esc(batch.name)}"><div><h2>${esc(batch.name)}</h2><p>${esc(batch.byName)}</p><span class="pill on">Recorded</span><span class="pill">SSC CGL</span></div></section>
  <nav class="tabs">${tabs.map((t) => `<button class="tab${r.v === t ? ' on' : ''}" data-t="${t}">${t[0].toUpperCase() + t.slice(1)}</button>`).join('')}</nav>`;
  if (r.v === 'about') {
    h += `<div class="about"><b>${esc(batch.name)}</b><br>${esc(batch.byName)}. Complete English course by Neetu Ma'am — Grammar, Vocabulary, Fill in the Blanks, Cloze Test, Sentence Arrangement, practice sessions and chapter-wise PYQs, with PDF notes for every topic.<div class="stats"><div><b>${subs.length}</b><span>Subjects</span></div><div><b>${lec}</b><span>Lectures</span></div><div><b>${nts}</b><span>Notes</span></div></div></div>`;
  } else if (r.a === null || !subs[r.a]) {
    const key = r.v === 'notes' ? 'notes' : 'lectures';
    h += subs.map((s, i) => `<button class="row" data-s="${i}"><span class="ico">${key === 'notes' ? I.doc : I.cam}</span><span class="t"><b>${esc(s.name)}</b><small>${s[key].length} ${key}</small></span>${I.chev}</button>`).join('');
  } else {
    const s = subs[r.a], isN = r.v === 'notes', list = isN ? s.notes : s.lectures, w = seen();
    h += `<input class="search" id="q" type="search" placeholder="Search in ${esc(s.name)}…" autocomplete="off"><div id="items"></div>`;
    app.innerHTML = h; bind(r);
    const draw = (q = '') => {
      const rows = list.map((x, i) => [x, i]).filter(([x]) => x[0].toLowerCase().includes(q));
      $('#items').innerHTML = rows.length ? rows.map(([x, i]) => isN
        ? `<a class="row" href="${esc(x[1])}" target="_blank" rel="noopener"><span class="ico pdf">${I.doc}</span><span class="t"><b class="c">${esc(x[0])}</b><small>PDF · Tap to open</small></span>${I.chev}</a>`
        : `<button class="row" data-p="${i}"><span class="ico${w[r.a + '-' + i] ? ' done' : ''}">${w[r.a + '-' + i] ? I.ok : I.play}</span><span class="t"><b class="c">${esc(x[0])}</b><small>Lecture ${i + 1}</small></span>${I.chev}</button>`).join('') : '<div class="empty">Nothing found</div>';
      document.querySelectorAll('[data-p]').forEach((b) => b.onclick = () => go(`play/${r.a}/${b.dataset.p}`));
    };
    draw(); $('#q').oninput = (e) => draw(e.target.value.trim().toLowerCase());
    $('#barTitle').textContent = s.name; return;
  }
  $('#barTitle').textContent = batch.name;
  app.innerHTML = h; bind(r);
}

function bind(r) {
  document.querySelectorAll('.tab').forEach((b) => b.onclick = () => { if (b.dataset.t !== r.v) { history.replaceState(null, '', '#' + b.dataset.t); render(); } });
  document.querySelectorAll('[data-s]').forEach((b) => b.onclick = () => go(`${r.v}/${b.dataset.s}`));
}

function lectureData(si, li) {
  const s = subs[si], l = s.lectures[li], mk = (i) => ({ id: si + '-' + i, title: s.lectures[i][0], si, li: i });
  return { id: si + '-' + li, title: l[0], videoUrl: l[1], quality: {}, chapters: [], attachments: s.notes.slice(0, 40).map((n) => ({ title: n[0], url: n[1] })), downloadUrl: l[1],
    course: { title: s.name, subjects: [] }, lectures: s.lectures.map((_, i) => mk(i)), previousLecture: li > 0 ? mk(li - 1) : null, nextLecture: li < s.lectures.length - 1 ? mk(li + 1) : null };
}

function openLecture(si, li) {
  if (!subs[si] || !subs[si].lectures[li]) { history.replaceState(null, '', '#lectures'); render(); return; }
  const layer = $('#playerLayer'), d = lectureData(si, li);
  layer.hidden = false; document.body.style.overflow = 'hidden'; mark(d.id);
  $('#pTitle').textContent = d.title; $('#pSub').textContent = subs[si].name + ' · ' + (li + 1) + '/' + subs[si].lectures.length;
  $('#pList').innerHTML = subs[si].lectures.map((x, i) => `<button class="row" data-n="${i}"><span class="ico${i === li ? ' done' : ''}">${i === li ? I.play : i + 1}</span><span class="t"><b class="c">${esc(x[0])}</b></span></button>`).join('');
  document.querySelectorAll('[data-n]').forEach((b) => b.onclick = () => history.replaceState(null, '', `#play/${si}/${b.dataset.n}`) || openLecture(si, +b.dataset.n));
  const nav = (n) => { history.replaceState(null, '', `#play/${n.si}/${n.li}`); openLecture(n.si, n.li); };
  if (player && cur) { player.load(d); } else {
    player = new LecturePlayer($('#playerRoot'), d, { onBack: () => history.back(), onNavigate: nav, onSelectLecture: nav });
  }
  cur = d.id; layer.scrollTop = 0;
}

function closePlayer() {
  $('#playerLayer').hidden = true; document.body.style.overflow = '';
  try { player && player.destroy(); } catch (e) {}
  player = null; cur = null; $('#playerRoot').innerHTML = '';
  render();
}
init();
})();
