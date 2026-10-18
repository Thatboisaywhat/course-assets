 
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js';
import { getAuth, signInAnonymously, onAuthStateChanged, EmailAuthProvider, linkWithCredential, signInWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js';
import { getDatabase, ref, get, set, update, remove, push, onValue, onChildAdded, onChildChanged,
         onChildRemoved, onDisconnect, serverTimestamp, query, orderByValue, limitToLast } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js';
import * as F from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js';

const CFG = {
  apiKey: 'AIzaSyCw5BF4DIVkTLDOqiiI1xWpngoU04vPiM8',
  authDomain: 'studydesk-resources-2026.firebaseapp.com',
  databaseURL: 'https://studydesk-resources-2026-default-rtdb.firebaseio.com',
  projectId: 'studydesk-resources-2026',
  appId: '1:47277316008:web:bbe7a2a1afe738a107ef9d'
};
 
const APP_VERSION = 50;
const MAX_PEOPLE = 12;
const BIG_PEOPLE = 25;
const capOf = (m) => (m && m.big ? BIG_PEOPLE : MAX_PEOPLE);
const ROOM_RE = /^[a-z0-9]{4,40}$/;
const ICE = [{ urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'] }];

const fb = initializeApp(CFG);
const auth = getAuth(fb);
const db = getDatabase(fb);
const fsdb = F.getFirestore(fb);

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (_) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) {} }
};

 
let unlocked = false;
document.documentElement.classList.add('cloaked');
(function () {
  let n = 0, ready = false;
  const open = () => {
    if (unlocked) return;
    unlocked = true;
    if ($('cloak').classList.contains('fading')) setTimeout(() => $('cloak').classList.add('gone'), 1000);
    else $('cloak').classList.add('gone');
    document.documentElement.classList.remove('cloaked');
    document.documentElement.classList.add('open');
    document.title = 'EchoMeet';
    const ic = document.createElement('link');
    ic.rel = 'icon';
    ic.href = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='16' fill='%234f46e5'/%3E%3Crect x='12' y='20' width='28' height='24' rx='6' fill='white'/%3E%3Cpath d='M42 28l10-6v20l-10-6z' fill='white'/%3E%3C/svg%3E";
    document.head.appendChild(ic);
    if (uid) route();
  };
  setTimeout(() => { if (!unlocked) { $('cloak').classList.add('fading'); open(); } }, 5000);
  addEventListener('keydown', (e) => {
    if (unlocked) return;
    if (e.key && e.key.indexOf('Arrow') === 0) { n++; if (n >= 4) { ready = true; $('cloak-hint').style.display = 'block'; } }
    else if (e.key === 'Enter' && ready) open();
  });
  $('cloak').addEventListener('touchstart', () => { if (++n >= 4) open(); }, { passive: true });
})();

 
const P = (d) => '<svg viewBox="0 0 24 24">' + d + '</svg>';
const IC = {
  mic: P('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>'),
  micOff: P('<path d="M3 3l18 18M9 9v2a3 3 0 0 0 5 2.2M15 10V6a3 3 0 0 0-5.7-1.3M5 11a7 7 0 0 0 11.5 5.4M19 11a7 7 0 0 1-.6 2.8M12 18v3"/>'),
  cam: P('<rect x="3" y="6" width="13" height="12" rx="3"/><path d="M16 10.5l5-3v9l-5-3z"/>'),
  camOff: P('<path d="M3 3l18 18M16 16v0a3 3 0 0 1-3 2H6a3 3 0 0 1-3-3V9a3 3 0 0 1 2-2.8M9 6h4a3 3 0 0 1 3 3v1.5l5-3v9"/>'),
  more: P('<circle cx="12" cy="5" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="12" cy="19" r="1.3"/>'),
  shield: P('<path d="M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z"/>'),
  kick: P('<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M17 8l5 5M22 8l-5 5"/>'),
  screen: P('<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>'),
  ban: P('<circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/>'),
  chat: P('<path d="M20 12a8 8 0 0 1-11.6 7.1L4 20l1-4.2A8 8 0 1 1 20 12z"/>'),
  copy: P('<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>'),
  flag: P('<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>'),
  lock: P('<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>')
};

 
let uid = null, room = null;
const me = { name: store.get('em-name', ''), mic: store.get('em-mic', true), cam: store.get('em-cam', true), screen: false, hand: false, sub: '' };
let subs = {};
const local = { audio: null, video: null, screen: null };
let meta = null, mods = {}, members = {}, isMod = false, joined = false, joinTime = 0, pendingSubJoin = null;
const peers = new Map();
const unsubs = [];
let preUnsubs = [];

function rid() {
  const a = 'abcdefghijklmnopqrstuvwxyz', b = crypto.getRandomValues(new Uint8Array(15));
  return Array.from(b, (x) => a[x % 26]).join('');
}
function roomFromPath() {
  const p = decodeURIComponent(location.pathname).replace(/^\/+|\/+$/g, '').toLowerCase();
  return ROOM_RE.test(p) ? p : null;
}
function colorFor(id) {
  let h = 0; for (const c of String(id)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return 'hsl(' + (h % 360) + ' 55% 45%)';
}
const initial = (n) => (String(n || '?').trim()[0] || '?').toUpperCase();
const R = (p) => ref(db, 'rooms/' + room + (p ? '/' + p : ''));
const linkFor = (id) => location.origin + '/' + id;

function show(name) {
  document.querySelectorAll('.scr').forEach((s) => s.classList.toggle('on', s.id === 'scr-' + name));
}
function toast(text, action, ms) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = '<span>' + esc(text) + '</span>';
  if (action) {
    const b = document.createElement('button');
    b.className = 'btn primary small'; b.textContent = action.label;
    b.onclick = () => { action.fn(); t.remove(); };
    t.appendChild(b);
  }
  $('toasts').appendChild(t);
  setTimeout(() => t.remove(), ms || 4000);
}
 
const sfxAt = {};
function sfx(kind) {
  if (Date.now() - (sfxAt[kind] || 0) < 1200) return;
  sfxAt[kind] = Date.now();
  try {
    const ac = beep.ac || (beep.ac = new AudioContext());
    if (ac.state === 'suspended') ac.resume().catch(() => {});
    const now = ac.currentTime;
    const out = ac.createGain(); out.gain.value = 0.9; out.connect(ac.destination);
    const bell = (f, t, dur, vol) => {
      [[1, 1], [2.01, 0.35], [3.02, 0.15]].forEach(([m, a]) => {
        const o = ac.createOscillator(), g = ac.createGain();
        o.type = 'sine'; o.frequency.value = f * m;
        g.gain.setValueAtTime(0.0001, now + t);
        g.gain.exponentialRampToValueAtTime(vol * a, now + t + 0.012);
        g.gain.exponentialRampToValueAtTime(0.0001, now + t + dur);
        o.connect(g).connect(out); o.start(now + t); o.stop(now + t + dur + 0.05);
      });
    };
    if (kind === 'join') {
      bell(659.25, 0, 1.1, 0.16);
      bell(523.25, 0.32, 1.4, 0.16);
    } else if (kind === 'leave') {
      bell(392, 0, 0.5, 0.09);
      bell(293.66, 0.18, 0.7, 0.09);
    } else if (kind === 'knock') {
      const len = Math.floor(ac.sampleRate * 0.09), buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 4);
      [0, 0.17, 0.34].forEach((t, i) => {
        const src = ac.createBufferSource(), lp = ac.createBiquadFilter(), g = ac.createGain();
        src.buffer = buf; lp.type = 'lowpass'; lp.frequency.value = 900; lp.Q.value = 4;
        const body = ac.createOscillator(), bg = ac.createGain();
        body.frequency.setValueAtTime(190, now + t); body.frequency.exponentialRampToValueAtTime(110, now + t + 0.08);
        bg.gain.setValueAtTime(0.0001, now + t); bg.gain.exponentialRampToValueAtTime(0.35, now + t + 0.004);
        bg.gain.exponentialRampToValueAtTime(0.0001, now + t + 0.12);
        g.gain.value = i === 2 ? 0.55 : 0.45;
        src.connect(lp).connect(g).connect(out); src.start(now + t);
        body.connect(bg).connect(out); body.start(now + t); body.stop(now + t + 0.15);
      });
    }
  } catch (_) {}
}
 
const rxAt = {};
let rxBus = null;
function reactSfx(e) {
  if (Date.now() - (rxAt[e] || 0) < 250) return;
  rxAt[e] = Date.now();
  try {
    const ac = beep.ac || (beep.ac = new AudioContext());
    if (ac.state === 'suspended') ac.resume().catch(() => {});
    if (!rxBus) {
      const master = ac.createGain(), comp = ac.createDynamicsCompressor(), wet = ac.createGain(), rev = ac.createConvolver();
      const len = Math.floor(ac.sampleRate * 1.2), ir = ac.createBuffer(2, len, ac.sampleRate);
      for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2); }
      rev.buffer = ir; wet.gain.value = 0.22; master.gain.value = 0.5;
      comp.threshold.value = -14; comp.ratio.value = 6; comp.attack.value = 0.003; comp.release.value = 0.2;
      master.connect(comp); master.connect(rev).connect(wet).connect(comp); comp.connect(ac.destination);
      rxBus = master;
    }
    const now = ac.currentTime + 0.01, out = rxBus;
    const env = (g, t, a, peak, d) => { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); };
    const tone = (type, f, t, a, peak, d, f2) => {
      const o = ac.createOscillator(), g = ac.createGain(); o.type = type;
      o.frequency.setValueAtTime(f, now + t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, now + t + a + d);
      env(g, now + t, a, peak, d); o.connect(g).connect(out); o.start(now + t); o.stop(now + t + a + d + 0.05);
    };
    const bell = (f, t, peak, d) => [[1, 1], [2.76, 0.3], [5.4, 0.12]].forEach(([m, k]) => tone('sine', f * m, t, 0.004, peak * k, d / (m > 1 ? m * 0.7 : 1)));
    const noise = (t, dur, type, freq, q, peak, a) => {
      const n = Math.floor(ac.sampleRate * dur), b = ac.createBuffer(1, n, ac.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
      s.buffer = b; f.type = type; f.frequency.value = freq; f.Q.value = q;
      env(g, now + t, a || 0.002, peak, dur); s.connect(f).connect(g).connect(out); s.start(now + t);
      return f;
    };
    switch (e) {
      case '👍':
        tone('sine', 420, 0, 0.004, 0.5, 0.12, 900); tone('triangle', 1250, 0.02, 0.003, 0.12, 0.08); break;
      case '❤️':
        bell(783.99, 0, 0.32, 0.9); bell(1046.5, 0.11, 0.26, 1.1); break;
      case '😂':
        [0, 0.09, 0.18, 0.27, 0.36].forEach((t, i) => tone('triangle', 620 + (i % 2) * 140, t, 0.006, 0.22 - i * 0.03, 0.07, 520 + (i % 2) * 120)); break;
      case '😮':
        tone('sine', 330, 0, 0.05, 0.28, 0.35, 760); noise(0, 0.4, 'bandpass', 1200, 2, 0.12, 0.08); break;
      case '👏':
        [0, 0.12, 0.21, 0.33].forEach((t, i) => { noise(t, 0.06, 'bandpass', 1500 + i * 150, 1.4, 0.55, 0.001); noise(t, 0.02, 'highpass', 4000, 0.7, 0.25, 0.001); }); break;
      case '🎉':
        noise(0, 0.08, 'lowpass', 1800, 1, 0.6, 0.001); tone('sine', 180, 0, 0.002, 0.4, 0.09, 60);
        [0.06, 0.11, 0.15, 0.2, 0.26, 0.31].forEach((t, i) => bell(1800 + ((i * 431) % 900), t, 0.08, 0.35)); break;
      case '🔥':
        noise(0, 0.55, 'bandpass', 700, 0.8, 0.28, 0.12).frequency.exponentialRampToValueAtTime(2600, now + 0.5);
        [0.05, 0.14, 0.2, 0.31, 0.38].forEach((t) => noise(t, 0.012, 'highpass', 3000, 0.7, 0.35, 0.001)); break;
      case '😢':
        tone('sine', 523.25, 0, 0.03, 0.22, 0.45, 392); tone('sine', 392, 0.28, 0.03, 0.18, 0.6, 311.13); break;
    }
  } catch (_) {}
}
function beep() {
  try {
    const ac = beep.ac || (beep.ac = new AudioContext());
    const o = ac.createOscillator(), g = ac.createGain();
    o.frequency.value = 880; o.type = 'sine';
    g.gain.setValueAtTime(0.0001, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.12, ac.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.35);
    o.connect(g).connect(ac.destination); o.start(); o.stop(ac.currentTime + 0.4);
  } catch (_) {}
}

function chime() {
  try {
    const ac = beep.ac || (beep.ac = new AudioContext());
    [[784, 0], [1175, 0.13]].forEach(([f, t0]) => {
      const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime + t0;
      o.type = 'triangle'; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.16, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
      o.connect(g).connect(ac.destination); o.start(t); o.stop(t + 0.55);
    });
  } catch (_) {}
}
 
const COOL = { hand: 5000, chat: 1500, muteAll: 4000, react: 700, afk: 1500,
  mic: 700, cam: 1500, screen: 3000, ns: 2000, copy: 1000, room: 5000, invite: 2000,
  modAct: 1500, kick: 3000, owner: 1200, music: 2000, file: 800, poll: 5000, bg: 800, game: 2000, dm: 600 };
const lastAt = {};
function cooldown(k) {
  const left = (lastAt[k] || 0) + COOL[k] - Date.now();
  if (left > 0) { toast('Slow down — wait ' + Math.ceil(left / 1000) + 's'); return false; }
  lastAt[k] = Date.now();
  return true;
}
const handChimeAt = {};
const localMuted = new Set();
const userVol = store.get('em-uvol', {});
const volOf = (id) => (userVol[id] == null ? 100 : userVol[id]) / 100;
function volRow(id) {
  const row = document.createElement('div');
  row.className = 'vol-row';
  const v = Math.round(volOf(id) * 100);
  row.innerHTML = '<span class="vi">' + (v ? '<i class="fa-solid fa-volume-high"></i>' : '<i class="fa-solid fa-volume-xmark"></i>') + '</span><input type="range" min="0" max="100" step="1" value="' + v + '" aria-label="Volume for you"><b>' + v + '%</b>';
  const inp = row.querySelector('input');
  const paint = () => { inp.style.setProperty('--p', inp.value + '%'); row.querySelector('b').textContent = inp.value + '%'; row.querySelector('.vi').innerHTML = +inp.value ? '<i class="fa-solid fa-volume-high"></i>' : '<i class="fa-solid fa-volume-xmark"></i>'; };
  inp.oninput = () => {
    userVol[id] = +inp.value; store.set('em-uvol', userVol);
    const t = tiles.get(id); if (t) t.video.volume = volOf(id);
    paint();
  };
  paint();
  return row;
}

 
const menuEl = $('menu');
function openMenu(anchor, items) {
  if (!items.length) return;
  menuEl.innerHTML = '';
  items.forEach((it) => {
    if (it.el) { menuEl.appendChild(it.el); return; }
    const b = document.createElement('button');
    if (it.bad) b.className = 'bad';
    b.innerHTML = (it.icon || '') + '<span>' + esc(it.label) + '</span>';
    b.onclick = () => { closeMenu(); it.fn(); };
    menuEl.appendChild(b);
  });
  menuEl.classList.add('on');
  placeMenu(anchor);
}
function placeMenu(anchor) {
  const r = anchor.getBoundingClientRect(), w = menuEl.offsetWidth, h = menuEl.offsetHeight;
  menuEl.style.left = Math.max(8, Math.min(innerWidth - w - 8, r.right - w)) + 'px';
  menuEl.style.top = (r.bottom + 6 + h > innerHeight ? Math.max(8, Math.min(innerHeight - h - 8, r.top - h - 6)) : r.bottom + 6) + 'px';
}
function closeMenu() { menuEl.classList.remove('on'); }
document.addEventListener('mousedown', (e) => { if (!menuEl.contains(e.target)) closeMenu(); }, true);

 
onAuthStateChanged(auth, (u) => {
  if (u) { if (!uid) { uid = u.uid; watchOwners(); watchBadges(); watchVersion(); watchProfile(uid); watchBans(); startSocial(); if (unlocked) route(); } return; }
  signInAnonymously(auth).catch((e) => {
    console.error(e);
    show('end');
    $('end-h').textContent = 'Couldn’t connect';
    $('end-p').textContent = 'The meeting service didn’t answer. Check the internet and reload. (' + (e.code || e.message) + ')';
    $('btn-rejoin').textContent = 'Reload'; $('btn-rejoin').onclick = () => location.reload();
  });
});
addEventListener('popstate', () => { if (!joined) route(); });

function go(path) {
  if (joined && path !== location.pathname) { toast('You’re still in a call. Leave it first'); if (window.__setMini) window.__setMini(false); return; }
  history.pushState(null, '', path); route();
}
function route() {
  stopPreListeners();
  stopPublic();
  room = roomFromPath();
  if (blocked) { stopMedia(); endScreen('blocked'); return; }
  const path = location.pathname.replace(/\/+$/, '');
  if (!room && path === '') { stopMedia(); show('home'); watchPublic(); return; }
  if (!room) { notFound(false); return; }
  prejoin();
}
function notFound(meeting) {
  stopMedia();
  show('404');
  $('nf-h').textContent = meeting ? 'This meeting doesn’t exist' : 'This page doesn’t exist';
  $('nf-p').textContent = meeting ? 'The link might be wrong, or the meeting was never started. Check the code and try again.'
                                  : 'Meeting links look like ' + location.host + '/abcdefghijklmno';
}
$('nf-home').onclick = () => go('/');
$('nf-new').onclick = () => $('btn-new').click();

 
let owners = {};
const isOwner = (id) => owners[id] === true;
async function sha256(t) {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t));
  return Array.from(new Uint8Array(b), (x) => x.toString(16).padStart(2, '0')).join('');
}
function paintOwnerLink() {
  const b = $('btn-owner');
  b.innerHTML = isOwner(uid) ? '<i class="fa-solid fa-crown"></i> Logged in as owner · log out' : 'Owner login';
  b.classList.toggle('is-owner', isOwner(uid));
  watchOwnerPanel(isOwner(uid));
}

 
let opUnsubs = [], opOn = false, opShowEmpty = false, opReports = 0;
$('op-head').onclick = () => $('opanel').classList.toggle('open');
async function refreshAll(id) {
  if (!cooldown('owner')) return;
  try {
    const ms = (await get(ref(db, 'rooms/' + id + '/members'))).val() || {};
    const ids = Object.keys(ms).filter((m) => m !== uid);
    await Promise.all(ids.map((m) => push(ref(db, 'rooms/' + id + '/cmd/' + m), { type: 'reload', by: uid })));
    toast('Refreshing ' + ids.length + ' page' + (ids.length === 1 ? '' : 's') + ' in ' + id + ' — only people on v25+ can be refreshed');
  } catch (e) { toast('Couldn’t refresh: ' + (e.code || e.message)); }
}
async function kickAll(id, x) {
  if (!cooldown('kick')) return;
  const n = x ? x.n : 0;
  if (!n || !confirm('Kick all ' + n + ' people out of ' + id + '?')) return;
  try {
    const ms = (await get(ref(db, 'rooms/' + id + '/members'))).val() || {};
    const ids = Object.keys(ms).filter((m) => m !== uid);
    await Promise.all(ids.map((m) => push(ref(db, 'rooms/' + id + '/cmd/' + m), { type: 'kick', by: uid })));
    const u = {};
    ids.forEach((m) => { u['rooms/' + id + '/members/' + m] = null; });
    await update(ref(db), u);
    toast('Kicked ' + ids.length + (ids.length === 1 ? ' person' : ' people') + ' from ' + id);
  } catch (e) { toast('Couldn’t kick: ' + (e.code || e.message)); }
}
 
function openOwnerFloat() {
  if (!isOwner(uid)) return;
  $('of-slot').appendChild($('opanel'));
  $('opanel').classList.add('open');
  $('owner-float').classList.add('on');
}
function closeOwnerFloat() {
  $('owner-float').classList.remove('on');
  const home = document.querySelector('.home'), link = $('btn-owner');
  if ($('opanel').parentElement !== home) home.insertBefore($('opanel'), link);
}
$('c-owner').onclick = () => ($('owner-float').classList.contains('on') ? closeOwnerFloat() : openOwnerFloat());
$('of-x').onclick = closeOwnerFloat;
$('owner-float').onclick = (e) => { if (e.target === $('owner-float')) closeOwnerFloat(); };
function watchOwnerPanel(on) {
  $('c-owner').style.display = on ? '' : 'none';
  if (on === opOn) return;
  opOn = on;
  opUnsubs.splice(0).forEach((f) => f());
  $('opanel').classList.toggle('on', on);
  if (!on) return;
  const info = {}, per = {};
  const paint = () => {
    const all = Object.keys(info).filter((id) => info[id].meta)
      .sort((a, b) => (info[b].n - info[a].n) || ((info[b].meta.createdAt || 0) - (info[a].meta.createdAt || 0)));
    const live = all.filter((id) => info[id].n > 0).length;
    const ids = opShowEmpty ? all : all.filter((id) => info[id].n > 0);
    $('op-n').textContent = live + ' live' + (opReports ? ' · 🚩 ' + opReports : '');
    $('op-empty').textContent = opShowEmpty ? 'Live only' : 'Show empty (' + (all.length - live) + ')';
    $('op-empty').onclick = () => { opShowEmpty = !opShowEmpty; paint(); };
    all.forEach((id) => {
      const x = info[id];
      if (!x.n && x.membersLoaded && Date.now() - (x.meta.createdAt || 0) > 15 * 60000 && !x.sweeping) {
        x.sweeping = true; deleteRoom(id);
      }
    });
    $('op-list').innerHTML = ids.map((id) => {
      const x = info[id], m = x.meta;
      return '<div class="op-row' + (x.n ? ' live' : '') + '"><div class="op-t"><b>' + esc(id) + '</b><em>' +
        (x.n ? x.n + ' · ' + esc(x.names.join(', ')) : 'empty · ' + new Date(m.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })) +
        '</em></div><div class="op-flags">' + (x.n ? '<span class="op-flag live">LIVE</span>' : '') +
        (m.locked ? '<span class="op-flag lock">LOCKED</span>' : '') + (m.waiting ? '<span class="op-flag wait">WAITING ROOM</span>' : '') +
        '</div><div class="op-btns">' +
        '<button class="btn ghost small" data-op="lock" data-id="' + esc(id) + '">' + (m.locked ? 'Unlock' : 'Lock') + '</button>' +
        '<button class="btn ghost small" data-op="wait" data-id="' + esc(id) + '" title="Waiting room">' + (m.waiting ? 'Wait off' : 'Wait on') + '</button>' +
        '<button class="btn ghost small" data-op="chats" data-id="' + esc(id) + '">Messages</button>' +
        (x.n ? '<button class="btn ghost small" data-op="reload" data-id="' + esc(id) + '" title="Reload everyone onto the newest version (they rejoin by themselves)">Refresh all</button>' : '') +
        (x.n ? '<button class="btn ghost small op-kick" data-op="kick" data-id="' + esc(id) + '" title="Remove everyone from this meeting">Kick all</button>' : '') +
        '<button class="btn primary small" data-op="join" data-id="' + esc(id) + '">Join</button></div>' +
        (function() {
          if (!x.n || !x.subs) return '</div>';
          const activeSubs = Object.entries(x.subs).filter(([k]) => Object.values(x.members || {}).some((mb) => mb.sub === k));
          if (!activeSubs.length) return '</div>';
          return '<div class="op-subs">' + activeSubs.map(([k, s]) => {
            const inSub = Object.values(x.members || {}).filter((mb) => mb.sub === k);
            return '<div class="op-sub"><span class="op-sub-t"><i class="fa-solid fa-lock"></i> ' + esc(s.name) + ' · ' + inSub.length + (inSub.length ? ' · ' + esc(inSub.slice(0, 3).map((mb) => mb.name).join(', ')) : '') + '</span>' +
              '<button class="btn ghost small" data-op="joinsub" data-id="' + esc(id) + '" data-sub="' + esc(k) + '">Join</button>' +
              '<button class="btn ghost small" data-op="listensub" data-id="' + esc(id) + '" data-sub="' + esc(k) + '">Listen</button></div>';
          }).join('') + '</div></div>';
        })();
    }).join('') || '<p class="rooms-note">' + (opShowEmpty ? 'No meetings.' : 'No live meetings right now.') + '</p>';
    $('op-list').querySelectorAll('[data-op]').forEach((b) => {
      b.onclick = () => {
        const id = b.dataset.id, m = info[id] && info[id].meta;
        if (b.dataset.op === 'join') { if (joined) { if (id === room) { closeOwnerFloat(); return; } leave('left'); } closeOwnerFloat(); go('/' + id); return; }
        if (b.dataset.op === 'joinsub' || b.dataset.op === 'listensub') {
          const ghost = b.dataset.op === 'listensub';
          const k = b.dataset.sub;
          if (joined && id === room) {
            closeOwnerFloat();
            (async () => {
              try { await set(R('subs/' + k + '/allow/' + uid), true); } catch (_) {}
              if (!subs[k]) { toast('That private room is gone'); return; }
              if (ghost) {
                if (me.mic) await setMic(false);
                if (me.cam) await setCam(false);
                if (await moveTo(k, { ghost: true, mic: false, cam: false })) toast('👻 Listening silently in 🔒 ' + subs[k].name + ' — you don\'t appear to anyone', null, 6000);
              } else if (members[uid] && members[uid].ghost) {
                if (await moveTo(k, { ghost: false })) toast('You joined 🔒 ' + subs[k].name);
              } else await joinSub(k);
            })();
            return;
          }
          try { sessionStorage.setItem('em-subjoin', JSON.stringify({ room: id, sub: k, ghost })); } catch (_) {}
          try { sessionStorage.setItem('em-autojoin', '1'); } catch (_) {}
          if (joined) leave('left');
          closeOwnerFloat(); go('/' + id); return;
        }
        if (b.dataset.op === 'chats') { openChats(id); return; }
        if (b.dataset.op === 'kick') { kickAll(id, info[id]); return; }
        if (b.dataset.op === 'reload') { refreshAll(id); return; }
        if (!m) return;
        if (!cooldown('owner')) return;
        const patch = b.dataset.op === 'lock' ? { locked: !m.locked } : { waiting: !m.waiting };
        update(ref(db, 'rooms/' + id + '/meta'), patch).then(
          () => toast(b.dataset.op === 'lock' ? (m.locked ? 'Unlocked ' : 'Locked ') + id : 'Waiting room ' + (m.waiting ? 'off' : 'on') + ' for ' + id),
          (e) => toast('Couldn’t change it: ' + e.code));
      };
    });
  };
  opUnsubs.push(onValue(query(ref(db, 'roomIndex'), orderByValue(), limitToLast(40)), (s) => {
    const ids = Object.keys(s.val() || {});
    Object.keys(per).forEach((id) => { if (!ids.includes(id)) { per[id](); delete per[id]; delete info[id]; } });
    ids.forEach((id) => {
      if (per[id]) return;
      info[id] = { n: 0, names: [], meta: null };
      const u1 = onValue(ref(db, 'rooms/' + id + '/meta'), (m) => { info[id].meta = m.val(); paint(); }, () => {});
      const u2 = onValue(ref(db, 'rooms/' + id + '/members'), (m) => {
        const v = m.val() || {};
        info[id].n = Object.keys(v).length;
        info[id].names = Object.values(v).map((x) => x.name);
        info[id].members = v;
        info[id].membersLoaded = true;
        paint();
      }, () => {});
      const u3 = onValue(ref(db, 'rooms/' + id + '/subs'), (m) => {
        info[id].subs = m.val() || {};
        paint();
      }, () => {});
      per[id] = () => { u1(); u2(); u3(); };
    });
    paint();
  }, () => {}));
  opUnsubs.push(() => Object.values(per).forEach((f) => f()));
  opUnsubs.push(onValue(ref(db, 'reports'), (s) => {
    const v = s.val() || {}, ids = Object.keys(v).sort((a, b) => (v[b].at || 0) - (v[a].at || 0));
    opReports = ids.length;
    $('op-n').textContent = $('op-n').textContent.replace(/ · 🚩 \d+$/, '') + (opReports ? ' · 🚩 ' + opReports : '');
    $('op-reports').innerHTML = ids.length ? '<div class="sec-h"><i class="fa-solid fa-flag"></i> Reports (' + ids.length + ')</div>' + ids.map((k) => {
      const r = v[k];
      return '<div class="op-rep"><div class="rp-h"><b>' + esc(r.fromName) + '</b>' + (r.private ? ' (private message)' : '') +
        ' · reported by ' + esc(r.byName) + ' · ' + new Date(r.at).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) +
        ' · ' + esc(r.room) + '</div><div class="rp-t"></div><div class="op-btns">' +
        '<button class="btn ghost small" data-rp-x="' + esc(k) + '">Dismiss</button>' +
        '<button class="btn ghost small" data-rp-chats="' + esc(r.room) + '">Messages</button>' +
        '<button class="btn primary small" data-rp-join="' + esc(r.room) + '">Join</button></div></div>';
    }).join('') : '';
    $('op-reports').querySelectorAll('.rp-t').forEach((el, i) => { el.textContent = v[ids[i]].text; });
    $('op-reports').querySelectorAll('[data-rp-x]').forEach((b) => { b.onclick = () => remove(ref(db, 'reports/' + b.dataset.rpX)); });
    $('op-reports').querySelectorAll('[data-rp-chats]').forEach((b) => { b.onclick = () => openChats(b.dataset.rpChats); });
    $('op-reports').querySelectorAll('[data-rp-join]').forEach((b) => { b.onclick = () => go('/' + b.dataset.rpJoin); });
  }, () => {}));
  opUnsubs.push(F.onSnapshot(F.query(F.collection(fsdb, 'suggestions'), F.orderBy('at', 'desc'), F.limit(100)), (qs) => {
    const docs = qs.docs;
    $('op-sugg').innerHTML = docs.length ? '<div class="sec-h"><i class="fa-solid fa-lightbulb"></i> Suggestions (' + docs.length + ')</div>' + docs.map((d) => {
      const r = d.data();
      return '<div class="op-rep"><div class="rp-h"><b>' + esc(r.name || 'Guest') + '</b> · ' +
        new Date(r.at).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) +
        '</div><div class="rp-t"></div><div class="op-btns"><button class="btn ghost small" data-sg-x="' + esc(d.id) + '">Dismiss</button></div></div>';
    }).join('') : '';
    $('op-sugg').querySelectorAll('.rp-t').forEach((el, i) => { el.textContent = docs[i].data().text; });
    $('op-sugg').querySelectorAll('[data-sg-x]').forEach((b) => { b.onclick = () => F.deleteDoc(F.doc(fsdb, 'suggestions', b.dataset.sgX)).catch(() => {}); });
  }, () => {}));
}
 
let cvUnsubs = [];
function closeChats() { cvUnsubs.splice(0).forEach((f) => f()); $('chats-modal').classList.remove('on'); }
function openChats(id) {
  closeChats();
  $('cv-title').textContent = 'Messages · ' + id;
  $('cv-list').innerHTML = '<p class="rooms-note">Loading…</p>';
  $('chats-modal').classList.add('on');
  let pubV = {}, dmV = {}, first = true;
  const paint = () => {
    const list = $('cv-list');
    const nearBottom = list.scrollHeight - list.scrollTop - list.clientHeight < 80;
    const rows = [];
    Object.values(pubV).forEach((m) => rows.push(Object.assign({ pm: false }, m)));
    const seen = {};
    Object.values(dmV).forEach((box) => Object.entries(box || {}).forEach(([k, m]) => {
      if (seen[k]) return; seen[k] = 1; rows.push(Object.assign({ pm: true }, m));
    }));
    rows.sort((a, b) => (a.at || 0) - (b.at || 0));
    const names = {};
    rows.forEach((m) => { names[m.uid] = m.name; });
    list.innerHTML = rows.length ? rows.map((m, i) =>
      '<div class="cv-row' + (m.pm ? ' pm' : '') + '"><div class="cv-h"><b>' + esc(m.name) + '</b>' +
      (m.pm ? ' → <b>' + esc(names[m.to] || 'someone') + '</b> · private' : ' · everyone') + ' · ' +
      new Date(m.at || 0).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) +
      '</div><p data-i="' + i + '"></p></div>').join('') : '<p class="rooms-note">No messages in this meeting yet.</p>';
    list.querySelectorAll('p[data-i]').forEach((el) => { el.textContent = rows[+el.dataset.i].text; });
    if (first || nearBottom) list.scrollTop = list.scrollHeight;
    first = false;
  };
  const err = (e) => { $('cv-list').innerHTML = '<p class="rooms-note">Couldn’t load: ' + esc(e.code || e.message) + '</p>'; };
  cvUnsubs.push(onValue(ref(db, 'rooms/' + id + '/chat'), (s) => { pubV = s.val() || {}; paint(); }, err));
  cvUnsubs.push(onValue(ref(db, 'rooms/' + id + '/dm'), (s) => { dmV = s.val() || {}; paint(); }, err));
}
$('cv-x').onclick = closeChats;
$('chats-modal').onclick = (e) => { if (e.target === $('chats-modal')) closeChats(); };

$('btn-owner').onclick = async () => {
  if (isOwner(uid)) {
    await update(ref(db), { ['owners/' + uid]: null, ['ownerClaims/' + uid]: null }).catch(() => {});
    F.deleteDoc(F.doc(fsdb, 'ownerClaims', uid)).catch(() => {});
    toast('Logged out as owner');
    return;
  }
  $('owner-err').textContent = ''; $('in-owner').value = '';
  $('owner-modal').classList.add('on');
  setTimeout(() => $('in-owner').focus(), 50);
};
$('owner-cancel').onclick = () => $('owner-modal').classList.remove('on');
$('form-owner').onsubmit = async (e) => {
  e.preventDefault();
  const pw = $('in-owner').value;
  if (!pw) return;
  $('in-owner').value = '';
  try {
    const k = await sha256(pw);
    await update(ref(db), { ['ownerClaims/' + uid]: { k }, ['owners/' + uid]: true });
    F.setDoc(F.doc(fsdb, 'ownerClaims', uid), { k }).catch(() => {});
    $('owner-modal').classList.remove('on');
    toast('👑 Logged in as owner');
  } catch (_) {
    $('owner-err').textContent = 'Wrong password.';
  }
};
function watchVersion() {
  let told = false;
  onValue(ref(db, 'appVersion'), (s) => {
    const v = Number(s.val()) || 0;
    if (v <= APP_VERSION) return;
    if (told) return;
    told = true;
    if (joined) { toast('EchoMeet was updated', { label: 'Update', fn: () => location.reload() }, 600000); return; }
    let left = 60;
    const bar = document.createElement('div');
    bar.className = 'upd-bar';
    document.body.appendChild(bar);
    const tick = () => {
      if (joined) { bar.remove(); clearInterval(iv); toast('EchoMeet was updated', { label: 'Update', fn: () => location.reload() }, 600000); return; }
      bar.innerHTML = '<i class="fa-solid fa-rotate"></i> EchoMeet is updating in <b>' + left + 's</b> <button class="btn primary small">Update now</button>';
      bar.querySelector('button').onclick = () => location.reload();
      if (left-- <= 0) location.reload();
    };
    const iv = setInterval(tick, 1000); tick();
  }, () => {});
}
 
let badges = {};
const badgesOf = (id) => Object.entries(badges[id] || {}).sort((a, b) => a[0].localeCompare(b[0]));
function watchBadges() {
  F.onSnapshot(F.collection(fsdb, 'badges'), (qs) => {
    badges = {}; qs.forEach((d) => { badges[d.id] = d.data().items || {}; });
    if (joined) { Object.keys(members).forEach(paintTile); renderPeople(); }
    if (badgeFor) paintBadgeModal();
  }, () => {});
}
const BD_COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#ef4444', '#a855f7', '#64748b'];
let badgeFor = null, badgeColor = BD_COLORS[0];
function openBadgeModal(id) {
  badgeFor = id;
  $('bd-title').textContent = 'Badges · ' + ((members[id] && members[id].name) || 'this person');
  $('bd-t').value = '';
  paintBadgeModal();
  $('badge-modal').classList.add('on');
  setTimeout(() => $('bd-t').focus(), 50);
}
function paintBadgeModal() {
  const list = badgesOf(badgeFor);
  $('bd-list').innerHTML = list.length ? list.map(([k, b]) =>
    '<div class="bd-row"><span class="pbadge" style="--bc:' + esc(b.c) + '">' + esc(b.e) + ' ' + esc(b.t) + '</span>' +
    '<button type="button" class="link" data-bd-x="' + esc(k) + '">Remove</button></div>').join('')
    : '<p class="rooms-note" style="margin:0 0 6px">No badges yet.</p>';
  $('bd-list').querySelectorAll('[data-bd-x]').forEach((b) => {
    b.onclick = () => F.updateDoc(F.doc(fsdb, 'badges', badgeFor), { ['items.' + b.dataset.bdX]: F.deleteField() }).catch((e) => toast('Couldn’t remove: ' + e.code));
  });
  $('bd-colors').innerHTML = BD_COLORS.map((c) => '<button type="button" style="--c:' + c + '" data-c="' + c + '"' + (c === badgeColor ? ' class="on"' : '') + '></button>').join('');
  $('bd-colors').querySelectorAll('[data-c]').forEach((b) => { b.onclick = () => { badgeColor = b.dataset.c; paintBadgeModal(); }; });
}
$('form-badge').onsubmit = (e) => {
  e.preventDefault();
  const t = $('bd-t').value.trim().slice(0, 24), em = ($('bd-e').value.trim() || '⭐').slice(0, 8);
  if (!t || !badgeFor || !cooldown('modAct')) return;
  F.setDoc(F.doc(fsdb, 'badges', badgeFor), { items: { ['b' + Date.now().toString(36)]: { t, e: em, c: badgeColor } } }, { merge: true })
    .then(() => { $('bd-t').value = ''; toast('Badge given'); }, (er) => toast('Couldn’t give badge: ' + er.code));
};
$('bd-x').onclick = () => { $('badge-modal').classList.remove('on'); badgeFor = null; };
$('badge-modal').onclick = (e) => { if (e.target === $('badge-modal')) { $('badge-modal').classList.remove('on'); badgeFor = null; } };

function watchOwners() {
  onValue(ref(db, 'owners'), (s) => {
    owners = s.val() || {};
    paintOwnerLink();
    if (joined) { Object.keys(members).forEach(paintTile); renderPeople(); ownerAutoMod(); }
  }, () => {});
}
function ownerAutoMod() {
  if (joined && isOwner(uid) && !isMod) set(R('mods/' + uid), true).catch(() => {});
}

 
$('btn-new').onclick = () => {
  const id = rid();
  sessionStorage.setItem('em-new', id);
  go('/' + id);
};
$('form-join').onsubmit = async (e) => {
  e.preventDefault();
  let v = $('in-code').value.trim().toLowerCase();
  v = v.replace(/[?#].*$/, '').split('/').filter(Boolean).pop() || '';
  v = v.replace(/[^a-z0-9]/g, '');
  $('home-err').textContent = '';
  if (!ROOM_RE.test(v)) { $('home-err').textContent = 'That doesn’t look like a meeting code.'; return; }
  try {
    const s = await get(ref(db, 'rooms/' + v + '/meta'));
    if (!s.exists()) { $('home-err').textContent = 'No meeting found with that code.'; return; }
  } catch (_) {}
  go('/' + v);
};

 
let pubUnsubs = [];
function stopPublic() { pubUnsubs.splice(0).forEach((f) => f()); }
function watchPublic() {
  stopPublic();
  const info = {}, roomUnsubs = {};
  let listing = {};
  const paint = () => {
    const ids = Object.keys(listing).filter((id) => info[id] && info[id].n > 0 && info[id].n < capOf(info[id]) && !info[id].locked)
      .sort((a, b) => info[b].n - info[a].n).slice(0, 30);
    $('pub').classList.add('on');
    $('pub-n').textContent = ids.length ? String(ids.length) : '';
    const ppl = ids.reduce((a, id) => a + info[id].n, 0);
    $('home-stat').innerHTML = '<i class="live-dot"></i>' + (ppl ? '<b>' + ppl + '</b> ' + (ppl === 1 ? 'person' : 'people') + ' in ' + ids.length + ' public meeting' + (ids.length === 1 ? '' : 's') + ' right now'
      : 'Quiet right now. Start one and people can find it');
    $('pub-random').style.display = ids.length ? '' : 'none';
    $('pub-random').onclick = () => { const open = ids.filter((id) => !info[id].waiting); const pool = open.length ? open : ids; go('/' + pool[Math.floor(Math.random() * pool.length)]); };
    if (!ids.length) { $('pub-list').innerHTML = '<p class="pub-empty">No public meetings right now. Start one — new meetings show up here automatically.</p>'; return; }
    $('pub-list').innerHTML = ids.map((id) => {
      const c = info[id];
      return '<button class="pub-card" data-room="' + esc(id) + '"><div class="pc-t"><b>' + esc(listing[id].title) + '</b><em>' +
        c.n + ' / ' + capOf(c) + ' in the call' + (c.big ? ' · 25 beta' : '') + (c.waiting ? ' · asks to join' : '') + '</em></div><div class="faces">' +
        c.names.slice(0, 3).map((n, i) => '<span class="avatar" style="--c:' + colorFor(id + i) + '">' + esc(initial(n)) + '</span>').join('') +
        (c.ownerHere ? '<span class="crown" title="The site owner is here"><i class="fa-solid fa-crown"></i></span>' : '') +
        '</div></button>';
    }).join('');
    $('pub-list').querySelectorAll('.pub-card').forEach((b) => { b.onclick = () => go('/' + b.dataset.room); });
  };
  pubUnsubs.push(onValue(ref(db, 'public'), (s) => {
    listing = s.val() || {};
    Object.keys(roomUnsubs).forEach((id) => { if (!listing[id]) { roomUnsubs[id](); delete roomUnsubs[id]; delete info[id]; } });
    Object.keys(listing).slice(0, 60).forEach((id) => {
      if (roomUnsubs[id] || !ROOM_RE.test(id)) return;
      info[id] = { n: 0, names: [] };
      const u1 = onValue(ref(db, 'rooms/' + id + '/members'), (m) => {
        const v = m.val() || {};
        info[id].n = Object.keys(v).length;
        info[id].names = Object.values(v).map((x) => x.name);
        info[id].ownerHere = Object.keys(v).some(isOwner);
        paint();
      }, () => {});
      const u2 = onValue(ref(db, 'rooms/' + id + '/meta'), (m) => {
        const v = m.val() || {};
        info[id].waiting = !!v.waiting; info[id].locked = !!v.locked; info[id].big = !!v.big;
        paint();
      }, () => {});
      roomUnsubs[id] = () => { u1(); u2(); };
    });
    paint();
  }, () => {}));
  pubUnsubs.push(() => Object.values(roomUnsubs).forEach((f) => f()));
}

 
async function getMedia(kind) {
  const c = kind === 'audio'
    ? { audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } }
    : { video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' } };
  try {
    const s = await navigator.mediaDevices.getUserMedia(c);
    return kind === 'audio' ? s.getAudioTracks()[0] : s.getVideoTracks()[0];
  } catch (e) { console.warn('[meet] no ' + kind + ':', e.name); return null; }
}
async function startMedia() {
  if (!local.audio && !local.micRaw) { local.micRaw = await getMedia('audio'); local.audio = local.micRaw; if (local.micRaw) await applyNS(); }
  if (me.cam && !local.camRaw) { local.camRaw = await getMedia('video'); local.video = local.camRaw ? await processedCam(local.camRaw) : null; }
  if (!local.audio) me.mic = false;
  if (!local.video) me.cam = false;
  if (local.audio) local.audio.enabled = me.mic;
}
function stopMedia() {
  teardownNS();
  stopBgPipe();
  ['audio', 'video', 'camRaw', 'screen', 'micRaw'].forEach((k) => { if (local[k]) { local[k].stop(); local[k] = null; } });
}

 
const NS_CDN = 'https://cdn.jsdelivr.net/npm/@sapphi-red/web-noise-suppressor@0.4.1/dist/';
const ns = { on: store.get('em-ns', false), chain: null, basic: false, model: '', ctx: null };
function teardownNS() {
  if (!ns.chain) return;
  try { ns.chain.node && ns.chain.node.destroy && ns.chain.node.destroy(); } catch (_) {}
  try { ns.chain.out.stop(); } catch (_) {}
  ns.chain.ctx.close().catch(() => {});
  ns.chain = null;
}
 
async function buildNS(raw) {
  const ctx = new AudioContext({ sampleRate: 48000 });
  ns.ctx = ctx;
  const src = ctx.createMediaStreamSource(new MediaStream([raw]));
  const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 90;
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -24; comp.ratio.value = 3; comp.attack.value = 0.005; comp.release.value = 0.2;
  const dest = ctx.createMediaStreamDestination();
  let node = null, gate = null, model = 'basic';
  try {
    const mod = await import(NS_CDN + 'index.js');
    try {
      await ctx.audioWorklet.addModule(NS_CDN + 'gtcrn/workletProcessor.js');
      const wasm = await mod.loadGtcrn({ url: NS_CDN + 'gtcrn.wasm' });
      node = new mod.GtcrnWorkletNode(ctx, { maxChannels: 1, wasmBinary: wasm });
      model = 'GTCRN';
    } catch (e) {
      console.warn('[meet] GTCRN unavailable, trying RNNoise:', e);
      await ctx.audioWorklet.addModule(NS_CDN + 'rnnoise/workletProcessor.js');
      const wasm = await mod.loadRnnoise({ url: NS_CDN + 'rnnoise.wasm', simdUrl: NS_CDN + 'rnnoise_simd.wasm' });
      node = new mod.RnnoiseWorkletNode(ctx, { maxChannels: 1, wasmBinary: wasm });
      model = 'RNNoise';
    }
    try {
      await ctx.audioWorklet.addModule(NS_CDN + 'noiseGate/workletProcessor.js');
      gate = new mod.NoiseGateWorkletNode(ctx, { openThreshold: -48, closeThreshold: -58, holdMs: 700, maxChannels: 1 });
    } catch (_) { gate = null; }
    let chain = src.connect(hp).connect(node);
    if (gate) chain = chain.connect(gate);
    chain.connect(comp).connect(dest);
  } catch (e) {
    console.warn('[meet] AI filters unavailable, using the basic filter:', e);
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 7000;
    src.connect(hp).connect(lp).connect(comp).connect(dest);
  }
  ns.basic = model === 'basic'; ns.model = model;
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return { ctx, node, out: dest.stream.getAudioTracks()[0] };
}
 
['pointerdown', 'keydown', 'touchstart'].forEach((ev) => addEventListener(ev, () => {
  if (ns.ctx && ns.ctx.state === 'suspended') ns.ctx.resume().catch(() => {});
  if (hear.ctx && hear.ctx.state === 'suspended') hear.ctx.resume().catch(() => {});
}, true));
async function applyNS() {
  const raw = local.micRaw;
  if (!raw) return;
  teardownNS();
  let out = raw;
  if (ns.on) {
    try { ns.chain = await buildNS(raw); out = ns.chain.out; }
    catch (e) { console.warn('[meet] noise filter failed:', e); ns.chain = null; }
  }
  out.enabled = me.mic;
  local.audio = out;
  if (hear.el) hear.el.srcObject = new MediaStream([sendAudio()]);
  if (shareMix) rebuildMix();
  eachPeerSender('audio', sendAudio());
  if (joined) { dropMeter(uid); meterFor(uid, new MediaStream([out])); }
}
async function toggleNS() {
  ns.on = !ns.on;
  store.set('em-ns', ns.on);
  paintControls();
  if (!local.micRaw) { toast(ns.on ? 'Voices only will be on when your mic is' : 'Voices only off'); return; }
  await applyNS();
  toast(!ns.on ? 'Voices only off' : ns.basic ? 'Voices only on (basic filter — the AI filter couldn’t load on this network)'
       : 'Voices only on — AI noise filter (' + ns.model + ') + noise gate', null, 5000);
}
 
const hear = { ctx: null, el: null };
function stopHear() {
  if (hear.el) { hear.el.pause(); hear.el.srcObject = null; hear.el = null; }
  $('pre-hear').classList.remove('on');
}
$('pre-hear').onclick = () => {
  if (hear.el) { stopHear(); return; }
  const tr = sendAudio();
  if (!tr) { toast('Your mic isn’t on'); return; }
  hear.el = new Audio(); hear.el.srcObject = new MediaStream([tr]); hear.el.play().catch(() => {});
  $('pre-hear').classList.add('on');
  toast('🎧 Playing your mic back to you — use headphones. Toggle Voices only to compare.', null, 6000);
};
$('pre-ns').onclick = $('c-ns').onclick = () => { if (cooldown('ns')) toggleNS(); };
const videoTrack = () => (held ? null : (local.screen || (me.cam ? local.video : null)));
 
const subOf = (id) => (id === uid ? me.sub : ((members[id] && members[id].sub) || ''));
const sameRoom = (id) => id === uid || subOf(id) === me.sub;
function eachPeerSender(kind, track) {
  peers.forEach((p) => {
    const t = kind === 'audio' ? p.ta : p.tv;
    if (t) t.sender.replaceTrack(sameRoom(p.id) ? track : null).catch(() => {});
  });
}

async function setMic(on) {
  if (on && !local.micRaw) {
    local.micRaw = await getMedia('audio');
    if (!local.micRaw) { toast('Microphone is blocked. Allow it in the browser’s address bar.'); on = false; }
    else { local.audio = local.micRaw; me.mic = true; await applyNS(); }
  }
  me.mic = !!on;
  if (local.audio) local.audio.enabled = me.mic;
  store.set('em-mic', me.mic);
  paintControls();
  if (joined) { update(R('members/' + uid), { mic: me.mic }); paintSelfTile(); }
}
async function setCam(on) {
  if (on) {
    if (!local.camRaw) { local.camRaw = await getMedia('video'); local.video = local.camRaw ? await processedCam(local.camRaw) : null; }
    if (!local.video) { toast('Camera is blocked. Allow it in the browser’s address bar.'); on = false; }
  } else if (local.camRaw || local.video) { stopBgPipe(); if (local.camRaw) local.camRaw.stop(); if (local.video) local.video.stop(); local.camRaw = null; local.video = null; }
  me.cam = !!on;
  store.set('em-cam', me.cam);
  if (!local.screen) eachPeerSender('video', videoTrack());
  paintControls();
  paintPreview();
  if (joined) { update(R('members/' + uid), { cam: me.cam }); paintSelfTile(); }
}
 
 
let shareMix = null;
const extra = { screen: null, music: null, musicVol: store.get('em-musicvol', 0.6), musicGain: null };
const sendAudio = () => (shareMix && shareMix.out) || local.audio;
function rebuildMix() {
  if (shareMix) { try { shareMix.out.stop(); } catch (_) {} shareMix.ctx.close().catch(() => {}); shareMix = null; }
  extra.musicGain = null; extra.screenGain = null;
  if (!extra.screen && !extra.music) return;
  const ctx = new AudioContext();
  const dest = ctx.createMediaStreamDestination();
  if (local.audio) ctx.createMediaStreamSource(new MediaStream([local.audio])).connect(dest);
  if (extra.screen) {
    const sg = ctx.createGain(); sg.gain.value = duckOn ? 0.1 : 1;
    ctx.createMediaStreamSource(new MediaStream([extra.screen])).connect(sg).connect(dest);
    extra.screenGain = sg;
  }
  if (extra.music) {
    const g = ctx.createGain(); g.gain.value = extra.musicVol * (duckOn ? 0.1 : 1);
    ctx.createMediaStreamSource(new MediaStream([extra.music])).connect(g).connect(dest);
    extra.musicGain = g;
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  shareMix = { ctx, out: dest.stream.getAudioTracks()[0] };
}
let duckOn = false;
function duckShare(on) {
  if (on === duckOn) return;
  duckOn = on;
  if (!shareMix) return;
  const k = on ? 0.1 : 1, t0 = shareMix.ctx.currentTime, tc = on ? 0.05 : 0.4;
  if (extra.musicGain) extra.musicGain.gain.setTargetAtTime(extra.musicVol * k, t0, tc);
  if (extra.screenGain) extra.screenGain.gain.setTargetAtTime(k, t0, tc);
  if (typeof bgmVolApply === 'function') bgmVolApply();
}
function buildShareMix(screenTrack) { extra.screen = screenTrack; rebuildMix(); }
function dropShareMix(keepTrack) {
  if (extra.screen && !keepTrack) { try { extra.screen.stop(); } catch (_) {} }
  extra.screen = null; rebuildMix();
}

 
async function startMusic() {
  let s;
  try {
    s = await navigator.mediaDevices.getDisplayMedia({
      video: true, audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      systemAudio: 'exclude', selfBrowserSurface: 'exclude', preferCurrentTab: false, surfaceSwitching: 'include'
    });
  } catch (e) { if (e.name !== 'NotAllowedError') toast('Couldn’t start music.'); return; }
  s.getVideoTracks().forEach((t) => t.stop());
  const a = s.getAudioTracks()[0];
  if (!a) { toast('No sound was shared — pick a Chrome TAB and keep “Also share tab audio” on.', null, 7000); return; }
  a.onended = stopMusic;
  extra.music = a;
  rebuildMix(); eachPeerSender('audio', sendAudio());
  paintMusic();
  if (joined) update(R('members/' + uid), { music: true }).catch(() => {});
  toast('🎵 Music is playing into your mic', null, 4000);
}
function stopMusic() {
  if (!extra.music) return;
  try { extra.music.onended = null; extra.music.stop(); } catch (_) {}
  extra.music = null;
  rebuildMix(); eachPeerSender('audio', sendAudio());
  paintMusic();
  if (joined) update(R('members/' + uid), { music: false }).catch(() => {});
}
function paintMusic() {
  $('c-music').classList.toggle('on', !!extra.music);
  $('music-bar').classList.toggle('on', !!extra.music);
  $('music-vol').value = Math.round(extra.musicVol * 100);
}
$('c-music').onclick = () => { if (!cooldown('music')) return; extra.music ? stopMusic() : startMusic(); };
$('music-stop').onclick = stopMusic;
$('music-vol').oninput = (e) => {
  extra.musicVol = Math.max(0, Math.min(1, e.target.value / 100));
  store.set('em-musicvol', extra.musicVol);
  if (extra.musicGain) extra.musicGain.gain.value = extra.musicVol * (duckOn ? 0.1 : 1);
};
async function toggleScreen() {
  if (local.screen) { stopScreen(); return; }
  let s;
  try {
    s = await navigator.mediaDevices.getDisplayMedia({
      video: { frameRate: 15 },
      audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      systemAudio: 'exclude', selfBrowserSurface: 'exclude', surfaceSwitching: 'include'
    });
  }
  catch (e) { if (e.name !== 'NotAllowedError') toast('Couldn’t start presenting.'); return; }
  const tabAudio = s.getAudioTracks()[0];
  if (tabAudio) { buildShareMix(tabAudio); eachPeerSender('audio', sendAudio()); }
  local.screen = s.getVideoTracks()[0];
  local.screen.contentHint = 'detail';
  local.screen.onended = stopScreen;
  me.screen = true;
  eachPeerSender('video', local.screen);
  peers.forEach((p) => applyQuality(p));
  update(R('members/' + uid), { screen: true });
  paintControls(); paintSelfTile();
  toast(tabAudio ? 'You’re presenting with sound' : 'You’re presenting (no sound — share a Chrome tab with “Also share tab audio” on to include it)', null, 6000);
}
function stopScreen() {
  if (!local.screen) return;
  local.screen.onended = null; local.screen.stop(); local.screen = null;
  me.screen = false;
  if (shareMix) { dropShareMix(false); eachPeerSender('audio', sendAudio()); }
  eachPeerSender('video', videoTrack());
  peers.forEach((p) => applyQuality(p));
  if (joined) update(R('members/' + uid), { screen: false });
  paintControls(); paintSelfTile();
}

function paintControls() {
  const mic = [$('pre-mic'), $('c-mic')], cam = [$('pre-cam'), $('c-cam')];
  mic.forEach((b) => { b.innerHTML = me.mic ? IC.mic : IC.micOff; b.classList.toggle('off', !me.mic); });
  cam.forEach((b) => { b.innerHTML = me.cam ? IC.cam : IC.camOff; b.classList.toggle('off', !me.cam); });
  $('c-screen').classList.toggle('on', !!local.screen);
  [$('pre-ns'), $('c-ns')].forEach((b) => { b.classList.toggle('on', ns.on); b.setAttribute('aria-pressed', ns.on); });
  $('c-hand').classList.toggle('on', me.hand);
  $('c-afk').classList.toggle('on', !!me.afk);
}
$('pre-mic').onclick = $('c-mic').onclick = () => { if (cooldown('mic')) setMic(!me.mic); };
$('pre-cam').onclick = $('c-cam').onclick = () => { if (cooldown('cam')) setCam(!me.cam); };
$('c-screen').onclick = () => { if (cooldown('screen')) toggleScreen(); };
 
function setAfk(on, auto) {
  me.afk = !!on;
  me.afkAuto = !!(on && auto);
  update(R('members/' + uid), { afk: me.afk }).catch(() => {});
  paintControls(); paintSelfTile();
}
$('c-afk').onclick = () => {
  if (!cooldown('afk')) return;
  setAfk(!me.afk, false);
  toast(me.afk ? '💤 You’re marked AFK' : 'Welcome back');
};
 
const AFK_AFTER = 5 * 60 * 1000;
let lastSpoke = Date.now();
setInterval(() => {
  if (!joined || me.afk) return;
  if (Date.now() - Math.max(lastSpoke, joinTime) > AFK_AFTER) {
    setAfk(true, true);
    toast('💤 No talking for 5 minutes — you’re marked AFK. Talk or click 🌙 to come back.', null, 8000);
  }
}, 10000);
function heardMe() {
  lastSpoke = Date.now();
  if (joined && me.afk && me.afkAuto) { setAfk(false); toast('Welcome back'); }
}
$('c-hand').onclick = () => {
  if (!me.hand && !cooldown('hand')) return;
  me.hand = !me.hand;
  update(R('members/' + uid), { hand: me.hand });
  paintControls(); paintSelfTile();
};
addEventListener('keydown', (e) => {
  if (!(e.ctrlKey || e.metaKey) || !joined) return;
  if (e.key === 'd') { e.preventDefault(); if (cooldown('mic')) setMic(!me.mic); }
  if (e.key === 'e') { e.preventDefault(); if (cooldown('cam')) setCam(!me.cam); }
});

 
function paintPreview() {
  const v = $('pre-video');
  v.srcObject = local.video ? new MediaStream([local.video]) : null;
  $('pre-off').classList.toggle('on', !local.video);
  $('pre-off-t').textContent = local.video ? '' : (me.cam ? 'Camera unavailable' : 'Camera is off');
  const a = $('pre-avatar');
  paintAvatar(a, uid, me.name || 'You');
}
function stopPreListeners() { preUnsubs.forEach((f) => f()); preUnsubs = []; }

async function prejoin() {
  if (sessionStorage.getItem('em-new') !== room) {
    try {
      const m = await get(R('meta'));
      if (!m.exists()) { notFound(true); return; }
    } catch (_) {}
  }
  const autoGo = sessionStorage.getItem('em-autojoin') === '1';
  if (autoGo && !me.name) { me.name = 'Owner'; store.set('em-name', me.name); }
  if (autoGo) { meta = null; mods = {}; }
  show(autoGo ? 'boot' : 'pre');
  $('pre-err').textContent = '';
  if (isAccount() && profiles[uid] && profiles[uid].name) me.name = profiles[uid].name;
  $('in-name').value = me.name;
  paintAcct();
  if (sessionStorage.getItem('em-private')) { sessionStorage.removeItem('em-private'); $('sw-pre-pub').checked = false; }
  $('pre-link-t').textContent = linkFor(room).replace(/^https?:\/\//, '');
  $('btn-join').disabled = true;
  $('btn-join').textContent = 'Join now';
  await startMedia();
  paintControls(); paintPreview();
  let rj = null;
  try { rj = JSON.parse(sessionStorage.getItem('em-rejoin') || 'null'); sessionStorage.removeItem('em-rejoin'); } catch (_) {}
  if (rj && rj.room === room && Date.now() - rj.at < 60000 && me.name) setTimeout(() => $('btn-join').click(), 1200);
  if (autoGo && me.name) {
    sessionStorage.removeItem('em-autojoin');
    if (!rj) (async () => { for (let i = 0; i < 40 && !meta; i++) await new Promise((r) => setTimeout(r, 100)); $('btn-join').click(); })();
  }

  let others = {};
  let mine = { allowed: null, banned: false };
  const paintJoin = () => {
    const n = Object.keys(others).filter((k) => k !== uid).length;
    const names = Object.values(others).filter((m, i) => Object.keys(others)[i] !== uid).map((m) => m.name);
    $('pre-who').textContent = !meta ? (sessionStorage.getItem('em-new') === room ? 'You’re starting this meeting.' : 'Nobody has started this meeting yet.')
      : n === 0 ? 'No one else is here yet.'
      : n === 1 ? names[0] + ' is in this meeting.'
      : names[0] + ' and ' + (n - 1) + ' other' + (n > 2 ? 's are' : ' is') + ' in this meeting.';
    const modHere = !!mods[uid] || isOwner(uid) || (meta && meta.owner === uid);
    const b = $('btn-join');
    b.disabled = false;
    $('pre-pub').style.display = meta ? 'none' : '';
    if (mine.banned) { b.disabled = true; b.textContent = 'You’re banned from this meeting'; }
    else if (n >= capOf(meta)) { b.disabled = true; b.textContent = 'Meeting is full (' + capOf(meta) + ')'; }
    else if (!meta) b.textContent = 'Start meeting';
    else if (modHere || mine.allowed === true) b.textContent = 'Join now';
    else if (meta.locked) { b.disabled = true; b.textContent = 'Meeting is locked'; }
    else if (meta.waiting) b.textContent = 'Ask to join';
    else b.textContent = 'Join now';
  };
  preUnsubs.push(onValue(R('meta'), (s) => { meta = s.val(); paintJoin(); }, () => {}));
  preUnsubs.push(onValue(R('mods'), (s) => { mods = s.val() || {}; paintJoin(); }, () => {}));
  preUnsubs.push(onValue(R('members'), (s) => { others = s.val() || {}; paintJoin(); }, () => {}));
  preUnsubs.push(onValue(R('allowed/' + uid), (s) => { mine.allowed = s.val(); paintJoin(); }, () => {}));
  preUnsubs.push(onValue(R('banned/' + uid), (s) => { mine.banned = !!s.val(); paintJoin(); }, () => {}));
}
$('in-name').oninput = () => { me.name = $('in-name').value.trim(); paintPreview(); };
$('pre-copy').onclick = () => { if (cooldown('copy')) copyLink(); };
function copyLink() {
  const l = linkFor(room);
  (navigator.clipboard ? navigator.clipboard.writeText(l) : Promise.reject()).then(
    () => toast('Meeting link copied'), () => toast(l, null, 8000));
}

$('btn-join').onclick = async () => {
  stopHear();
  me.name = $('in-name').value.trim().slice(0, 40);
  if (!me.name) { $('pre-err').textContent = 'Enter your name so people know who you are.'; $('in-name').focus(); return; }
  store.set('em-name', me.name);
  $('btn-join').disabled = true;
  try {
    if (!meta) {
      await update(R(), {
        meta: { owner: uid, createdAt: Date.now(), waiting: false, locked: false },
        ['mods/' + uid]: true
      });
      sessionStorage.removeItem('em-new');
      set(ref(db, 'roomIndex/' + room), Date.now()).catch(() => {});
      if ($('sw-pre-pub').checked) set(ref(db, 'public/' + room), { title: (me.name + '’s meeting').slice(0, 60), at: Date.now() }).catch(() => {});
    } else if ((meta.owner === uid || isOwner(uid)) && !mods[uid]) {
      await set(R('mods/' + uid), true);
    }
    const m = (await get(R('meta'))).val();
    const mod = (await get(R('mods/' + uid))).val() === true;
    const allowed = (await get(R('allowed/' + uid))).val() === true;
    stopPreListeners();
    if (mod || allowed || (!m.waiting && !m.locked)) await enter();
    else if (m.locked) { show('pre'); $('pre-err').textContent = 'This meeting is locked.'; $('btn-join').disabled = false; prejoin(); }
    else knock();
  } catch (e) {
    console.error(e);
    show('pre');
    $('pre-err').textContent = 'Couldn’t join: ' + (e.code || e.message);
    $('btn-join').disabled = false;
  }
};

 
let waitUnsubs = [];
function stopWait() { waitUnsubs.forEach((f) => f()); waitUnsubs = []; }
async function knock() {
  show('wait');
  $('wait-h').textContent = 'Asking to join…';
  $('wait-p').textContent = 'You’ll join as soon as a mod lets you in.';
  paintAvatar($('wait-avatar'), uid, me.name);
  await set(R('lobby/' + uid), { name: me.name, at: Date.now() });
  onDisconnect(R('lobby/' + uid)).remove();
  let entered = false, hadEntry = false;
  const admitted = async () => { if (entered) return; entered = true; stopWait(); await enter(); };
  waitUnsubs.push(onValue(R('allowed/' + uid), (s) => { if (s.val() === true) admitted(); }, () => {}));
  waitUnsubs.push(onValue(R('lobby/' + uid), async (s) => {
    if (s.exists()) { hadEntry = true; return; }
    if (!hadEntry || entered) return;
    const ok = (await get(R('allowed/' + uid)).catch(() => null))?.val() === true;
    if (ok) { admitted(); return; }
    stopWait();
    show('end');
    $('end-h').textContent = 'You weren’t let in';
    $('end-p').textContent = 'A mod declined your request to join.';
    $('btn-rejoin').style.display = '';
    $('btn-rejoin').textContent = 'Ask again';
    $('btn-rejoin').onclick = () => prejoin();
  }, () => {}));
  waitUnsubs.push(onValue(R('banned/' + uid), (s) => { if (s.val()) { stopWait(); endScreen('banned'); } }, () => {}));
}
$('btn-wait-cancel').onclick = async () => {
  stopWait();
  await remove(R('lobby/' + uid)).catch(() => {});
  prejoin();
};

 
async function enter() {
  const cur = (await get(R('members'))).val() || {};
  if (!cur[uid] && Object.keys(cur).length >= capOf((await get(R('meta'))).val())) { endScreen('full'); return; }
  await remove(R('sig/' + uid)).catch(() => {});
  joinTime = Date.now();
  me.sub = '';
  me.afk = false; me.afkAuto = false; lastSpoke = Date.now();
  try {
    const raw = sessionStorage.getItem('em-subjoin');
    if (raw) { const intent = JSON.parse(raw); if (intent && intent.room === room) { pendingSubJoin = intent; sessionStorage.removeItem('em-subjoin'); } }
  } catch (_) {}
  const ghostJoin = !!(pendingSubJoin && pendingSubJoin.ghost);
  if (ghostJoin) { me.mic = false; me.cam = false; if (local.audio) local.audio.enabled = false; paintControls(); }
  const memberRow = { name: me.name, at: joinTime, mic: me.mic, cam: me.cam, screen: false, hand: false, sub: '', afk: false };
  const fp = await fpReady; if (fp) memberRow.fp = fp;
  if (ghostJoin) memberRow.ghost = true;
  await set(R('members/' + uid), memberRow);
  onDisconnect(R('members/' + uid)).remove();
  remove(R('lobby/' + uid)).catch(() => {});
  joined = true;
  members = {};
  setTimeout(afterJoin, 800);
  $('grid').innerHTML = '';
  $('chat-list').innerHTML = '<p class="chat-empty">Messages are seen by everyone in the meeting. Private messages can also be reviewed by the site owner for safety.</p>';
  $('room-code').textContent = room;
  show('call');
  addTile(uid);
  paintControls(); paintSelfTile(); layout();

  unsubs.push(onChildAdded(R('members'), (s) => memberAdded(s.key, s.val())));
  unsubs.push(onChildChanged(R('members'), (s) => memberChanged(s.key, s.val())));
  unsubs.push(onChildRemoved(R('members'), (s) => memberRemoved(s.key)));
  unsubs.push(onValue(R('mods'), (s) => modsChanged(s.val() || {})));
  unsubs.push(onValue(R('modsOnline'), (s) => { modsOnline = s.val() || {}; checkAutoMod(); }, () => {}));
  unsubs.push(onValue(R('meta'), (s) => { const prevSpk = (meta && meta.speaker) || null; meta = s.val() || meta; paintModBox(); speakerChanged(prevSpk); }));
  unsubs.push(onValue(ref(db, 'public/' + room), (s) => { pubEntry = s.val(); paintModBox(); }));
  unsubs.push(onChildAdded(R('sig/' + uid), onSignal));
  unsubs.push(onChildAdded(R('chat'), (s) => chatAdded(s.val())));
  unsubs.push(onChildAdded(R('polls'), (s) => pollAdded(s.key, s.val()), () => {}));
  unsubs.push(onValue(R('game'), (s) => gameChanged(s.val()), () => {}));
  unsubs.push(onValue(R('bgm'), (s) => bgmChanged(s.val()), () => {}));
  unsubs.push(onValue(R('gvotes'), (s) => { gvotes = s.val() || {}; if (game) paintGame(true); }, () => {}));
  unsubs.push(onChildChanged(R('polls'), (s) => pollChanged(s.key, s.val()), () => {}));
  unsubs.push(onChildAdded(R('dm/' + uid), (s) => chatAdded(s.val(), true)));
  unsubs.push(onValue(R('subs'), (s) => {
    subs = s.val() || {};
    if (me.sub && !subs[me.sub]) { goMain(true); return; }
    renderRooms(); paintSubBar();
    if (pendingSubJoin && pendingSubJoin.room === room && !me.sub) {
      const p = pendingSubJoin; pendingSubJoin = null;
      (async () => {
        try { await set(R('subs/' + p.sub + '/allow/' + uid), true); } catch (_) {}
        if (subs[p.sub]) { await joinSub(p.sub); if (p.ghost) toast('👻 Listening silently in 🔒 ' + subs[p.sub].name + ' — you won\'t appear to others', null, 6000); }
        else toast('That private room is gone');
      })();
    }
  }, () => {}));
  unsubs.push(onChildAdded(R('subinv/' + uid), (s) => {
    const v = s.val(); remove(s.ref).catch(() => {});
    if (!v || v.at < joinTime - 1000 || v.sub === me.sub) return;
    const from = (members[v.from] && members[v.from].name) || 'Someone';
    chime();
    toast(from + ' invited you to 🔒 ' + v.name, { label: 'Join', fn: () => joinSub(v.sub) }, 15000);
  }));
  unsubs.push(onChildAdded(R('rx'), (s) => { const v = s.val(); if (v && v.at > joinTime - 1000) floatReact(v); }));
  unsubs.push(onChildAdded(R('cmd/' + uid), (s) => { const c = s.val(); remove(s.ref); onCommand(c); }));
  startMeters();
  startQuality();
  if (isMod) markModOnline(true);
  ownerAutoMod();
}

function memberAdded(id, m) {
  members[id] = m;
  watchProfile(id);
  if (id !== uid) {
    ensurePeer(id);
    if (!m.ghost) {
      addTile(id);
      if (m.at > joinTime - 1500) { toast(m.name + ' joined'); if (sameRoom(id)) sfx('join'); }
    }
    refreshRooms();
  }
  paintTile(id); renderPeople(); layout();
}
function memberChanged(id, m) {
  const prev = members[id] || {};
  members[id] = m;
  if (m.ghost && !prev.ghost && id !== uid) {
    const t = tiles.get(id); if (t) { t.el.remove(); tiles.delete(id); }
    refreshRooms(); renderPeople(); layout(); return;
  }
  if (!m.ghost && prev.ghost && id !== uid) {
    ensurePeer(id); addTile(id); toast(m.name + ' joined');
    refreshRooms(); renderPeople(); layout(); return;
  }
  if ((prev.sub || '') !== (m.sub || '') && id !== uid) refreshRooms();
  if (id !== uid && m.screen && !prev.screen && sameRoom(id) && (!pinned || autoPinned)) setPin(id, false);
  if (id !== uid && !m.screen && prev.screen && autoPinned && pinned === id) setPin(null);
  if (id !== uid && m.hand && !prev.hand) {
    toast('✋ ' + m.name + ' raised their hand');
    if (Date.now() - (handChimeAt[id] || 0) > 10000) { handChimeAt[id] = Date.now(); chime(); }
  }
  paintTile(id); renderPeople();
}
async function memberRemoved(id) {
  const m = members[id];
  delete members[id];
  checkAutoMod();
  if (id === uid) {
    if (!joined) return;
    await new Promise((r) => setTimeout(r, 700));
    const banned = (await get(R('banned/' + uid)).catch(() => null))?.val();
    leave(banned ? 'banned' : endedFlag ? 'ended' : kickedFlag ? 'removed' : 'dropped');
    return;
  }
  closePeer(id);
  if (meta && meta.speaker === id && isMod) update(R('meta'), { speaker: null }).catch(() => {});
  const t = tiles.get(id); if (t) { t.el.remove(); tiles.delete(id); }
  if (m && !m.ghost) { toast(m.name + ' left'); sfx('leave'); }
  renderPeople(); layout();
}

function modsChanged(v) {
  const was = isMod;
  mods = v;
  isMod = mods[uid] === true;
  if (isMod && !was && joined && joinTime && Date.now() - joinTime > 2000) toast('You’re now a mod of this meeting');
  if (isMod !== was) { watchLobby(isMod); watchBanned(isMod); markModOnline(isMod); }
  Object.keys(members).forEach(paintTile);
  paintModBox(); renderPeople();
}

 
let modsOnline = {}, autoModTimer = null;
function markModOnline(on) {
  if (!joined) return;
  const r = R('modsOnline/' + uid);
  if (on) { set(r, true).catch(() => {}); onDisconnect(r).remove(); }
  else { onDisconnect(r).cancel(); remove(r).catch(() => {}); }
}
function checkAutoMod() {
  clearTimeout(autoModTimer);
  if (!joined || isMod || Object.keys(modsOnline).length) return;
  const order = Object.keys(members).sort((a, b) => (members[a].at || 0) - (members[b].at || 0));
  const place = order.indexOf(uid);
  if (place < 0) return;
  autoModTimer = setTimeout(async () => {
    if (!joined || isMod || Object.keys(modsOnline).length) return;
    try {
      await update(R(), { ['mods/' + uid]: true, ['modsOnline/' + uid]: true });
      chime();
      toast('No mod was left in the meeting, so you’re now a mod');
    } catch (_) {   }
  }, 4000 + place * 3000);
}

let kickedFlag = false, endedFlag = false;
function onCommand(c) {
  if (!c) return;
  if (c.type === 'kick') { kickedFlag = true; return; }
  if (c.type === 'end') { endedFlag = true; return; }
  const by = (members[c.by] && members[c.by].name) || 'A mod';
  if (c.type === 'mute' && me.mic) { setMic(false); toast(by + ' muted your mic'); }
  if (c.type === 'reload') {
    try { sessionStorage.setItem('em-rejoin', JSON.stringify({ room, at: Date.now() })); } catch (_) {}
    toast(by + ' refreshed your page — back in a second');
    setTimeout(() => { leave('left', true); location.reload(); }, 900);
    return;
  }
  if (c.type === 'stopscreen' && local.screen) { stopScreen(); toast(by + ' stopped your screen share'); }
  if (c.type === 'stopmusic' && extra.music) { stopMusic(); toast(by + ' stopped your music'); }
  if (c.type === 'cam' && me.cam) { setCam(false); toast(by + ' turned off your camera'); }
  if (c.type === 'askmic' && !me.mic) { chime(); toast(by + ' is asking you to unmute', { label: 'Unmute', fn: () => setMic(true) }, 15000); }
  if (c.type === 'askcam' && !me.cam) { chime(); toast(by + ' is asking you to turn on your camera', { label: 'Turn on', fn: () => setCam(true) }, 15000); }
}

 
function send(to, obj) {
  return push(R('sig/' + to), { from: uid, d: JSON.stringify(obj) }).catch((e) => console.warn('[meet] signal', e.code));
}
function ensurePeer(id) {
  let p = peers.get(id);
  if (p) return p;
  const initiator = uid < id;
  const pc = new RTCPeerConnection({ iceServers: ICE });
  p = { id, pc, polite: !initiator, initiator, makingOffer: false, ignoreOffer: false,
        stream: new MediaStream(), ta: null, tv: null, chain: Promise.resolve(), dcTimer: null };
  peers.set(id, p);
  if (initiator) setupDC(p, pc.createDataChannel('files'));
  pc.ondatachannel = (e) => { if (e.channel.label === 'files') setupDC(p, e.channel); };
  if (initiator) {
    const ok = sameRoom(id);
    p.ta = pc.addTransceiver((ok && sendAudio()) || 'audio', { direction: 'sendrecv' });
    p.tv = pc.addTransceiver((ok && videoTrack()) || 'video', { direction: 'sendrecv' });
  }
  pc.ontrack = (e) => {
    if (!p.stream.getTracks().includes(e.track)) p.stream.addTrack(e.track);
    const t = tiles.get(id);
    if (t && t.video.srcObject !== p.stream) t.video.srcObject = p.stream;
    meterFor(id, p.stream);
  };
  pc.onicecandidate = (e) => { if (e.candidate) send(id, { t: 'ice', c: e.candidate.toJSON() }); };
  pc.onnegotiationneeded = async () => {
    try {
      p.makingOffer = true;
      await pc.setLocalDescription();
      send(id, { t: 'sdp', d: pc.localDescription.toJSON() });
    } catch (e) { console.warn('[meet] offer', e); }
    finally { p.makingOffer = false; }
  };
  pc.onconnectionstatechange = () => {
    const s = pc.connectionState;
    paintTile(id);
    clearTimeout(p.dcTimer);
    if (s === 'failed' && p.initiator) pc.restartIce();
    if (s === 'disconnected' && p.initiator) p.dcTimer = setTimeout(() => { if (pc.connectionState === 'disconnected') pc.restartIce(); }, 5000);
  };
  return p;
}
function attachLocal(p) {
  p.pc.getTransceivers().forEach((t) => {
    const kind = t.receiver.track && t.receiver.track.kind;
    const ok = sameRoom(p.id);
    if (kind === 'audio') { p.ta = t; t.sender.replaceTrack(ok ? sendAudio() : null).catch(() => {}); t.direction = 'sendrecv'; }
    if (kind === 'video') { p.tv = t; t.sender.replaceTrack(ok ? videoTrack() : null).catch(() => {}); t.direction = 'sendrecv'; }
  });
}
function onSignal(snap) {
  const m = snap.val();
  remove(snap.ref).catch(() => {});
  if (!m || !m.from || m.from === uid) return;
  let d; try { d = JSON.parse(m.d); } catch (_) { return; }
  const p = ensurePeer(m.from);
  p.chain = p.chain.then(() => handleSignal(p, d)).catch((e) => console.warn('[meet] signal', e));
}
async function handleSignal(p, d) {
  const pc = p.pc;
  if (d.t === 'sdp') {
    const desc = d.d;
    const collision = desc.type === 'offer' && (p.makingOffer || pc.signalingState !== 'stable');
    p.ignoreOffer = !p.polite && collision;
    if (p.ignoreOffer) return;
    await pc.setRemoteDescription(desc);
    if (desc.type === 'offer') {
      attachLocal(p);
      await pc.setLocalDescription();
      send(p.id, { t: 'sdp', d: pc.localDescription.toJSON() });
    }
  } else if (d.t === 'ice') {
    try { await pc.addIceCandidate(d.c); } catch (e) { if (!p.ignoreOffer) console.warn('[meet] ice', e); }
  }
}
 
const Q_LEVELS = [
  { scale: 1, br: 1, fps: 30 },
  { scale: 1.5, br: 0.6, fps: 24 },
  { scale: 2, br: 0.35, fps: 20 },
  { scale: 3, br: 0.18, fps: 15 }
];
function baseBitrate() { return Math.max(250e3, Math.min(1500e3, 3000e3 / Math.max(1, peers.size))); }
async function applyQuality(p) {
  const sender = p.tv && p.tv.sender;
  if (!sender) return;
  try {
    const params = sender.getParameters();
    if (!params.encodings || !params.encodings.length) return;
    const L = Q_LEVELS[p.q || 0], screen = !!local.screen, e = params.encodings[0];
    e.maxBitrate = Math.round(baseBitrate() * L.br * (screen ? 1.5 : 1));
    e.scaleResolutionDownBy = screen ? 1 : L.scale;
    e.maxFramerate = screen ? (p.q >= 2 ? 5 : 15) : L.fps;
    params.degradationPreference = screen ? 'maintain-resolution' : 'balanced';
    await sender.setParameters(params);
    p.appliedFor = peers.size + (screen ? 's' : '');
  } catch (err) {   }
}
let qTimer = null, warnedWeak = false;
function startQuality() {
  clearInterval(qTimer);
  qTimer = setInterval(async () => {
    for (const p of peers.values()) {
      if (p.pc.connectionState !== 'connected' || !p.tv) continue;
      let out = null, rin = null, pair = null, inb = null;
      try {
        (await p.pc.getStats()).forEach((r) => {
          if (r.type === 'outbound-rtp' && r.kind === 'video') out = r;
          else if (r.type === 'remote-inbound-rtp' && r.kind === 'video') rin = r;
          else if (r.type === 'inbound-rtp' && r.kind === 'video') inb = r;
          else if (r.type === 'candidate-pair' && r.nominated && r.state === 'succeeded') pair = r;
        });
      } catch (_) { continue; }
      const lim = out && out.qualityLimitationReason;
      const lost = rin && typeof rin.fractionLost === 'number' ? rin.fractionLost : 0;
      const rtt = (rin && rin.roundTripTime) || (pair && pair.currentRoundTripTime) || 0;
      const sending = !!(out && out.bytesSent);
      const bad = sending && ((lim === 'bandwidth' || lim === 'cpu') || lost > 0.08 || rtt > 0.6);
      const was = p.q || 0;
      if (bad) { p.q = Math.min(Q_LEVELS.length - 1, was + 1); p.good = 0; }
      else { p.good = (p.good || 0) + 1; if (p.good >= 5 && was > 0) { p.q = was - 1; p.good = 0; } }
      const key = peers.size + (local.screen ? 's' : '');
      if (p.q !== was || p.appliedFor !== key) await applyQuality(p);
      if (p.q >= 2 && !warnedWeak) { warnedWeak = true; toast('Your connection is struggling, so your video quality was lowered'); }
      const m = members[p.id];
      const fps = inb && typeof inb.framesPerSecond === 'number' ? inb.framesPerSecond : null;
      const weak = !!(m && (m.cam || m.screen) && fps !== null && fps < 5);
      if (weak !== !!p.weak) { p.weak = weak; paintTile(p.id); }
    }
  }, 3000);
}

function closePeer(id) {
  const p = peers.get(id);
  if (!p) return;
  clearTimeout(p.dcTimer);
  try { p.pc.close(); } catch (_) {}
  peers.delete(id);
  dropMeter(id);
}

 
const tiles = new Map();
function addTile(id) {
  if (tiles.has(id)) return tiles.get(id);
  const el = document.createElement('div');
  el.className = 'tile' + (id === uid ? ' me' : '');
  el.innerHTML = '<video autoplay playsinline></video><div class="ph"><div class="avatar"></div></div><div class="oncall-card"><i class="fa-solid fa-phone-volume"></i><b>On an EchoCall</b><em>back soon</em></div><div class="afk-badge"><i class="fa-solid fa-moon"></i> AFK</div>' +
    '<div class="tags"></div><div class="nm"><i class="mic-off">' + IC.micOff + '</i><span></span></div>' +
    '<button class="more" title="Options">' + IC.more + '</button><span class="pin-ic">Enlarged · click to shrink</span>';
  const video = el.querySelector('video');
  el.onclick = (e) => { if (!e.target.closest('.more')) setPin(pinned === id ? null : id, true); };
  if (id === uid) video.muted = true;
  else if (typeof meDeaf !== 'undefined' && meDeaf) video.muted = true;
  el.querySelector('.more').onclick = (e) => { e.stopPropagation(); personMenu(e.currentTarget, id); };
  $('grid').appendChild(el);
  const t = { el, video };
  tiles.set(id, t);
  if (id !== uid) { const p = peers.get(id); if (p) video.srcObject = p.stream; }
  return t;
}
function paintSelfTile() {
  const t = tiles.get(uid); if (!t) return;
  const tr = videoTrack();
  const want = tr ? new MediaStream([tr]) : null;
  if (!tr) t.video.srcObject = null;
  else if (!t.video.srcObject || t.video.srcObject.getVideoTracks()[0] !== tr) t.video.srcObject = want;
  members[uid] = Object.assign({}, members[uid] || {}, { name: me.name, mic: me.mic, cam: me.cam, screen: !!local.screen, hand: me.hand, afk: !!me.afk });
  paintTile(uid);
}
function paintTile(id) {
  const t = tiles.get(id), m = members[id];
  if (!t || !m) return;
  const self = id === uid;
  const camOn = self ? !!videoTrack() : (m.cam || m.screen);
  t.el.classList.toggle('nocam', !camOn);
  t.el.classList.toggle('muted', !m.mic);
  t.el.classList.toggle('afk', !!m.afk);
  t.el.classList.toggle('oncall', !!m.oncall);
  t.el.classList.toggle('screen', !!m.screen);
  paintAvatar(t.el.querySelector('.avatar'), id, m.name);
  t.el.classList.toggle('speaker', !!(meta && meta.speaker === id));
  t.el.querySelector('.nm span').textContent = (self ? m.name + ' (You)' : m.name) + (m.screen ? ' · presenting' : '');
  const p = peers.get(id);
  const conn = !self && p && p.pc.connectionState !== 'connected' ? (p.pc.connectionState === 'failed' ? 'Connection failed' : 'Connecting…') : '';
  t.el.querySelector('.tags').innerHTML =
    (meta && meta.speaker === id ? '<span class="tag spk"><i class="fa-solid fa-microphone"></i> Speaker</span>' : '') +
    (m.deaf && !m.oncall ? '<span class="tag deaf"><i class="fa-solid fa-ear-deaf"></i> Deafened</span>' : '') +
    (m.hand ? '<span class="tag hand"><i class="fa-solid fa-hand"></i> Hand raised</span>' : '') +
    (isOwner(id) ? '<span class="tag owner"><i class="fa-solid fa-crown"></i> Site Owner</span>' : '') +
    (meta && meta.owner === id ? '<span class="tag mod">Host</span>' : mods[id] ? '<span class="tag mod">Mod</span>' : '') +
    badgesOf(id).slice(0, 3).map(([, b]) => '<span class="tag rank" style="--bc:' + esc(b.c) + '">' + esc(b.e) + ' ' + esc(b.t) + '</span>').join('') +
    (conn ? '<span class="tag conn">' + conn + '</span>' : '') +
    (!conn && p && p.weak ? '<span class="tag weak">Weak connection</span>' : '');
  t.el.querySelector('.more').style.display = self ? 'none' : '';
}
 
let pinned = null, autoPinned = false;
function setPin(id, manual) {
  pinned = id;
  autoPinned = !!id && !manual;
  layout();
}
function place(id, x, y, w, h) {
  const t = tiles.get(id); if (!t) return;
  const st = t.el.style;
  st.left = Math.round(x) + 'px'; st.top = Math.round(y) + 'px';
  st.width = Math.round(w) + 'px'; st.height = Math.round(h) + 'px';
  t.el.classList.toggle('big', id === pinned && tiles.size > 1);
  t.el.classList.toggle('small', h < 96);
}
function layout() {
  const g = $('grid'), W = g.clientWidth, H = g.clientHeight, gap = 10;
  const ids = [...tiles.keys()].filter((id) => sameRoom(id) && !(members[id] && members[id].ghost));
  if (pinned && (!tiles.has(pinned) || !sameRoom(pinned))) { pinned = null; autoPinned = false; }
  if (!W || !H || !ids.length) return;
  if (pinned && ids.length > 1) {
    const others = ids.filter((i) => i !== pinned), k = others.length;
    if (W >= 700) {
      const sh = Math.max(36, Math.min(84, (H - gap * (k - 1)) / k)), sw = sh * 16 / 9;
      const bigW = W - sw - gap;
      place(pinned, 0, 0, bigW, H);
      const y0 = Math.max(0, (H - (k * sh + (k - 1) * gap)) / 2);
      others.forEach((id, i) => place(id, bigW + gap, y0 + i * (sh + gap), sw, sh));
    } else {
      const sw = Math.max(56, Math.min(104, (W - gap * (k - 1)) / k)), sh = sw * 9 / 16;
      const bigH = H - sh - gap;
      place(pinned, 0, 0, W, bigH);
      const x0 = Math.max(0, (W - (k * sw + (k - 1) * gap)) / 2);
      others.forEach((id, i) => place(id, x0 + i * (sw + gap), bigH + gap, sw, sh));
    }
    return;
  }
  const n = ids.length;
  const ar = W < 600 && H > W * 1.1 ? 3 / 4 : 16 / 9;
  let best = { w: 0, cols: 1 };
  for (let cols = 1; cols <= n; cols++) {
    const rows = Math.ceil(n / cols);
    const w = Math.min((W - gap * (cols - 1)) / cols, ((H - gap * (rows - 1)) / rows) * ar);
    if (w > best.w) best = { w, cols };
  }
  const w = best.w, h = w / ar, cols = best.cols, rows = Math.ceil(n / cols);
  const y0 = (H - (rows * h + (rows - 1) * gap)) / 2;
  ids.forEach((id, i) => {
    const r = Math.floor(i / cols), inRow = r === rows - 1 ? n - r * cols : cols;
    const x0 = (W - (inRow * w + (inRow - 1) * gap)) / 2;
    place(id, x0 + (i % cols) * (w + gap), y0 + r * (h + gap), w, h);
  });
}
addEventListener('keydown', (e) => { if (e.key === 'Escape' && pinned && joined) setPin(null); });
addEventListener('resize', layout);
new ResizeObserver(layout).observe($('grid'));

 
let actx = null;
const meters = new Map();
function startMeters() {
  try { actx = actx || new AudioContext(); actx.resume(); } catch (_) { actx = null; }
  if (local.audio) meterFor(uid, new MediaStream([local.audio]));
  clearInterval(startMeters.t);
  startMeters.t = setInterval(() => {
    meters.forEach((m, id) => {
      const t = tiles.get(id); if (!t) return;
      m.an.getByteTimeDomainData(m.buf);
      let s = 0; for (let i = 0; i < m.buf.length; i++) { const v = (m.buf[i] - 128) / 128; s += v * v; }
      const loud = Math.sqrt(s / m.buf.length) > 0.035 && (members[id] ? members[id].mic : true);
      if (loud && id === uid) heardMe();
      m.hold = loud ? 4 : Math.max(0, m.hold - 1);
      t.el.classList.toggle('speaking', m.hold > 0);
      const lv = loud ? Math.min(1, Math.sqrt(s / m.buf.length) * 9) : 0;
      m.lv = (m.lv || 0) * 0.55 + lv * 0.45;
      t.el.style.setProperty('--lvl', m.lv.toFixed(2));
    });
    const spk = meta && meta.speaker, sm = spk && meters.get(spk);
    const spkTalking = !!(sm && sm.hold > 0 && members[spk] && members[spk].mic);
    tiles.forEach((t, id) => {
      if (id === uid) return;
      const target = volOf(id) * (spkTalking && id !== spk ? 0.1 : 1), v = t.video.volume;
      t.video.volume = Math.abs(target - v) < 0.02 ? target : v + (target - v) * (target < v ? 0.6 : 0.3);
    });
    let talk = spkTalking;
    if (!talk && meta && meta.duck) meters.forEach((m, id) => {
      if (m.hold > 0 && (id === uid ? me.mic : (members[id] && members[id].mic && !members[id].music))) talk = true;
    });
    duckShare(talk);
    if (typeof bgmAdapt === 'function') bgmAdapt();
  }, 120);
}
function meterFor(id, stream) {
  if (!actx || !stream.getAudioTracks().length || meters.has(id)) return;
  try {
    const src = actx.createMediaStreamSource(stream), an = actx.createAnalyser();
    an.fftSize = 512; src.connect(an);
    meters.set(id, { src, an, buf: new Uint8Array(an.fftSize), hold: 0 });
  } catch (_) {}
}
function dropMeter(id) { const m = meters.get(id); if (m) { try { m.src.disconnect(); } catch (_) {} meters.delete(id); } }

 
function personMenu(anchor, id) {
  const m = members[id];
  if (!m) return;
  const self = id === uid, host = meta && meta.owner === id, prof = profiles[id];
  if (self && !isOwner(uid)) return;
  const card = document.createElement('div');
  card.className = 'pm-card';
  const roles = [isOwner(id) ? '<i class="fa-solid fa-crown"></i> Site Owner' : '', host ? 'Host' : mods[id] ? 'Mod' : '', meta && meta.speaker === id ? '<i class="fa-solid fa-microphone"></i> Speaker' : ''].filter(Boolean).join(' · ');
  card.innerHTML = '<div class="pm-head">' + avatarHTML(id, m.name) + '<div class="pm-who"><b></b><em>' + (prof ? '@' + esc(prof.uname) : 'Guest') + (roles ? ' · ' + roles : '') + '</em>' +
    '<div class="pm-badges">' + badgesOf(id).map(([, x]) => '<span class="pbadge" style="--bc:' + esc(x.c) + '">' + esc(x.e) + ' ' + esc(x.t) + '</span>').join('') + '</div></div></div>';
  card.querySelector('.pm-who b').textContent = m.name;
  if (prof) { card.querySelector('.pm-head').classList.add('link-ish'); card.querySelector('.pm-head').onclick = () => { closeMenu(); openProfile(id); }; }
  const quick = document.createElement('div');
  quick.className = 'pm-quick';
  const qb = (icon, label, fn, on) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'pm-q' + (on ? ' on' : '');
    b.innerHTML = '<span>' + icon + '</span><em>' + esc(label) + '</em>';
    b.onclick = () => { closeMenu(); fn(); };
    quick.appendChild(b);
  };
  if (!self) {
    if (prof && friendSet.has(id)) qb('<i class="fa-solid fa-comment"></i>', 'Message', () => openDM(id));
    else qb('<i class="fa-solid fa-user-secret"></i>', 'Whisper', () => { $('chat-to').value = id; paintChatTo(); openPanel('chat', true); });
    if (prof && isAccount()) {
      const st = friendState(id);
      qb(st === 'friends' ? '<i class="fa-solid fa-user-check"></i>' : st === 'out' ? '<i class="fa-solid fa-hourglass-half"></i>' : '<i class="fa-solid fa-user-plus"></i>', st === 'friends' ? 'Friends' : st === 'out' ? 'Requested' : st === 'in' ? 'Accept' : 'Add friend',
        () => (st === 'none' || st === 'in' ? addFriendUid(id) : openProfile(id)), st === 'friends');
    }
    const lm = localMuted.has(id);
    qb(lm ? '<i class="fa-solid fa-volume-high"></i>' : '<i class="fa-solid fa-volume-xmark"></i>', lm ? 'Unmute' : 'Mute for me', () => setLocalMute(id, !lm), lm);
    card.appendChild(quick);
    card.appendChild(volRow(id));
  }
  const section = (title, list) => {
    if (!list.length) return;
    const d = document.createElement('details');
    d.className = 'pm-sec';
    d.innerHTML = '<summary>' + title + '<i>' + list.length + '</i></summary>';
    const box = document.createElement('div'); box.className = 'pm-items';
    list.forEach((it) => {
      const b = document.createElement('button');
      b.type = 'button'; if (it.bad) b.className = 'bad';
      b.innerHTML = (it.icon || '') + '<span>' + esc(it.label) + '</span>';
      b.onclick = () => { closeMenu(); it.fn(); };
      box.appendChild(b);
    });
    d.appendChild(box);
    d.ontoggle = () => placeMenu(anchor);
    card.appendChild(d);
  };
  if (isMod && !self) {
    const mod = [];
    mod.push(meta && meta.speaker === id
      ? { icon: IC.mic, label: 'Remove speaker', fn: () => cooldown('modAct') && update(R('meta'), { speaker: null }) }
      : { icon: IC.mic, label: 'Make speaker', fn: () => cooldown('modAct') && update(R('meta'), { speaker: id }) });
    if (m.mic) mod.push({ icon: IC.micOff, label: 'Mute their mic', fn: () => cooldown('modAct') && push(R('cmd/' + id), { type: 'mute', by: uid }) });
    else mod.push({ icon: IC.mic, label: 'Ask to unmute', fn: () => cooldown('modAct') && push(R('cmd/' + id), { type: 'askmic', by: uid }).then(() => toast('Asked ' + m.name + ' to unmute')) });
    if (m.cam) mod.push({ icon: IC.camOff, label: 'Turn off their camera', fn: () => cooldown('modAct') && push(R('cmd/' + id), { type: 'cam', by: uid }) });
    else mod.push({ icon: IC.cam, label: 'Ask to turn on camera', fn: () => cooldown('modAct') && push(R('cmd/' + id), { type: 'askcam', by: uid }).then(() => toast('Asked ' + m.name + ' to turn on their camera')) });
    if (m.screen) mod.push({ icon: IC.screen, label: 'Stop their screen share', fn: () => cooldown('modAct') && push(R('cmd/' + id), { type: 'stopscreen', by: uid }).then(() => toast('Stopped ' + m.name + '’s screen share')) });
    if (m.music) mod.push({ icon: IC.micOff, label: 'Stop their music', fn: () => cooldown('modAct') && push(R('cmd/' + id), { type: 'stopmusic', by: uid }).then(() => toast('Stopped ' + m.name + '’s music')) });
    if (!mods[id]) mod.push({ icon: IC.shield, label: 'Make mod', fn: () => cooldown('modAct') && set(R('mods/' + id), true).then(() => toast(m.name + ' is now a mod')) });
    else if (!host) mod.push({ icon: IC.shield, label: 'Remove mod', fn: () => cooldown('modAct') && update(R(), { ['mods/' + id]: null, ['modsOnline/' + id]: null }).then(() => toast(m.name + ' is no longer a mod')) });
    mod.push({ icon: IC.screen, label: 'Refresh their page', fn: () => cooldown('modAct') && push(R('cmd/' + id), { type: 'reload', by: uid }).then(() => toast('Refreshing ' + m.name + '’s page — they’ll rejoin by themselves')) });
    if (!host) mod.push({ icon: IC.kick, label: 'Remove from meeting', bad: true, fn: () => kick(id, false) });
    if (!host) mod.push({ icon: IC.ban, label: 'Ban from meeting', bad: true, fn: () => kick(id, true) });
    section('<i class="fa-solid fa-shield-halved"></i> Moderate', mod);
  }
  if (isOwner(uid)) {
    const own = [{ icon: IC.shield, label: 'Badges…', fn: () => openBadgeModal(id) }];
    if (!self && !isOwner(id)) {
      if (prof) own.push({ icon: IC.ban, label: 'Ban account (@' + prof.uname + ')', bad: true, fn: () => ownerBan('acct', id) });
      if (m.fp) own.push({ icon: IC.ban, label: 'Ban device', bad: true, fn: () => ownerBan('dev', id) });
    }
    section('<i class="fa-solid fa-crown"></i> Owner', own);
  }
  openMenu(anchor, [{ el: card }]);
}
function setLocalMute(id, on) {
  if (on) localMuted.add(id); else localMuted.delete(id);
  const t = tiles.get(id);
  if (t) { t.video.muted = on || !sameRoom(id); t.el.classList.toggle('lmute', on); }
  toast((members[id] ? members[id].name : 'They') + (on ? ' is muted for you only' : ' is unmuted for you'));
}
 
async function kick(id, ban) {
  if (!cooldown('kick')) return;
  const n = (members[id] && members[id].name) || 'them';
  if (!confirm(ban ? 'Ban ' + n + '? They’re removed and can’t rejoin this meeting.'
                   : 'Remove ' + n + ' from the meeting? They can ask to join again.')) return;
  try {
    await push(R('cmd/' + id), { type: 'kick', by: uid });
    const u = { ['members/' + id]: null, ['allowed/' + id]: null, ['lobby/' + id]: null, ['mods/' + id]: null, ['modsOnline/' + id]: null };
    if (ban) u['banned/' + id] = { name: n.slice(0, 40), at: Date.now() };
    await update(R(), u);
    toast(n + (ban ? ' was banned' : ' was removed'));
  } catch (e) { toast('Couldn’t remove: ' + (e.code || e.message)); }
}
$('btn-mute-all').onclick = () => {
  if (!isMod || !cooldown('muteAll')) return;
  const ids = Object.keys(members).filter((id) => id !== uid && members[id].mic);
  if (!ids.length) { toast('Everyone is already muted'); return; }
  ids.forEach((id) => push(R('cmd/' + id), { type: 'mute', by: uid }));
  toast('Muted ' + ids.length + (ids.length === 1 ? ' person' : ' people'));
};
let bannedUnsub = null;
function watchBanned(on) {
  if (bannedUnsub) { bannedUnsub(); bannedUnsub = null; }
  $('banned-wrap').style.display = 'none';
  if (!on) return;
  bannedUnsub = onValue(R('banned'), (s) => {
    const v = s.val() || {}, ids = Object.keys(v);
    $('banned-wrap').style.display = ids.length ? '' : 'none';
    $('banned-list').innerHTML = ids.map((id) => {
      const nm = (v[id] && v[id].name) || 'Someone';
      return '<div class="person banned"><div class="avatar" style="--c:#44445a">' + esc(initial(nm)) + '</div>' +
        '<div class="pn"><b>' + esc(nm) + '</b><em>Banned</em></div><button class="btn ghost small" data-unban="' + esc(id) + '">Unban</button></div>';
    }).join('');
    $('banned-list').querySelectorAll('[data-unban]').forEach((b) => {
      b.onclick = () => remove(R('banned/' + b.dataset.unban)).then(() => toast('Unbanned'), (e) => toast('Couldn’t unban: ' + e.code));
    });
  }, () => {});
}
function renderPeople() {
  const ids = Object.keys(members).filter((id) => !members[id].ghost).sort((a, b) => (a === uid ? -1 : b === uid ? 1 : (members[a].at || 0) - (members[b].at || 0)));
  $('people-n').textContent = ids.length;
  $('people-list').innerHTML = ids.map((id) => {
    const m = members[id];
    return '<div class="person">' + avatarHTML(id, m.name) +
      '<div class="pn"><b>' + esc(m.name) + (id === uid ? ' (You)' : '') + '</b><em>' +
        [badgesOf(id).map(([, b]) => '<span class="pbadge" style="--bc:' + esc(b.c) + '">' + esc(b.e) + ' ' + esc(b.t) + '</span>').join(''),
         meta && meta.speaker === id ? '<i class="fa-solid fa-microphone"></i> Speaker' : '', profiles[id] ? '@' + esc(profiles[id].uname) : '', isOwner(id) ? '<i class="fa-solid fa-crown"></i> Site Owner' : '', meta && meta.owner === id ? 'Host' : mods[id] ? 'Mod' : '', m.afk ? '💤 AFK' : '', m.hand ? '✋ Hand raised' : '', m.screen ? 'Presenting' : '', m.music ? '🎵 Music' : '',
         m.sub && subs[m.sub] ? '<i class="fa-solid fa-lock"></i> ' + esc(subs[m.sub].name) : ''].filter(Boolean).join(' · ') +
      '</em></div><div class="ic">' + (m.mic ? '' : '<span class="red">' + IC.micOff + '</span>') + (m.cam ? '' : IC.camOff) + '</div>' +
      (id !== uid || isOwner(uid) ? '<button class="opts" data-id="' + esc(id) + '">' + IC.more + '</button>' : '') + '</div>';
  }).join('');
  $('people-list').querySelectorAll('.opts').forEach((b) => { b.onclick = () => personMenu(b, b.getAttribute('data-id')); });
  const sel = $('chat-to'), cur = sel.value;
  sel.innerHTML = '<option value="">Everyone</option>' + ids.filter((id) => id !== uid)
    .map((id) => '<option value="' + esc(id) + '">' + esc(members[id].name) + ' (private)</option>').join('');
  sel.value = members[cur] && cur !== uid ? cur : '';
  paintChatTo();
}
let pubEntry = null;
function paintModBox() {
  $('mod-box').style.display = isMod ? '' : 'none';
  $('sw-public').checked = !!pubEntry;
  const pt = $('in-pub-title');
  pt.style.display = pubEntry ? '' : 'none';
  if (pubEntry && document.activeElement !== pt) pt.value = pubEntry.title;
  $('sw-waiting').checked = !!(meta && meta.waiting);
  $('sw-lock').checked = !!(meta && meta.locked);
  $('sw-big').checked = !!(meta && meta.big);
  $('sw-duck').checked = !!(meta && meta.duck);
  const spk = meta && meta.speaker;
  $('spk-row').innerHTML = spk
    ? '<span><i class="fa-solid fa-microphone"></i> Speaker: <b>' + esc(members[spk] ? members[spk].name : 'someone') + '</b></span><button class="link" type="button" id="spk-stop">Stop</button>'
    : (members[uid] ? '<span><i class="fa-solid fa-microphone"></i> Speaker view: off</span><button class="link" type="button" id="spk-me">Make me speaker</button>' : '');
  if ($('spk-stop')) $('spk-stop').onclick = () => update(R('meta'), { speaker: null });
  if ($('spk-me')) $('spk-me').onclick = () => update(R('meta'), { speaker: uid });
}
$('sw-duck').onchange = (e) => update(R('meta'), { duck: e.target.checked }).then(
  () => toast(e.target.checked ? 'Music and screen audio will dip while people talk' : 'Music and screen audio stay at full volume'), () => paintModBox());
$('sw-big').onchange = (e) => {
  const on = e.target.checked;
  if (!on && Object.keys(members).length > MAX_PEOPLE) { toast('Too many people here to go back to ' + MAX_PEOPLE); paintModBox(); return; }
  update(R('meta'), { big: on }).then(
    () => toast(on ? 'Beta: up to ' + BIG_PEOPLE + ' people — it may get laggy' : 'Back to up to ' + MAX_PEOPLE + ' people'), () => paintModBox());
};
$('sw-waiting').onchange = (e) => update(R('meta'), { waiting: e.target.checked }).then(
  () => toast(e.target.checked ? 'Waiting room on — new people have to ask' : 'Waiting room off'), () => paintModBox());
$('sw-lock').onchange = (e) => update(R('meta'), { locked: e.target.checked }).then(
  () => toast(e.target.checked ? 'Meeting locked' : 'Meeting unlocked'), () => paintModBox());

$('sw-public').onchange = (e) => {
  const on = e.target.checked;
  const w = on ? set(ref(db, 'public/' + room), { title: (me.name + '\u2019s meeting').slice(0, 60), at: Date.now() })
               : remove(ref(db, 'public/' + room));
  w.then(() => toast(on ? 'Meeting is public \u2014 it\u2019s listed on the home page' : 'Meeting is no longer public'), () => paintModBox());
};
$('in-pub-title').onchange = (e) => {
  const v = e.target.value.trim().slice(0, 60);
  if (v) update(ref(db, 'public/' + room), { title: v, at: Date.now() }).then(() => toast('Listing renamed'), () => {});
};

let lobbyUnsub = null, lobby = {};
function watchLobby(on) {
  if (lobbyUnsub) { lobbyUnsub(); lobbyUnsub = null; }
  lobby = {}; paintLobby();
  if (!on) return;
  let first = true;
  lobbyUnsub = onValue(R('lobby'), (s) => {
    const next = s.val() || {};
    Object.keys(next).forEach((id) => {
      if (!lobby[id] && !first) {
        sfx('knock');
        toast(next[id].name + ' wants to join', { label: 'Admit', fn: () => admit(id, true) }, 10000);
      }
    });
    lobby = next; first = false; paintLobby();
  }, () => {});
}
function admit(id, yes) {
  return update(R(), { ['allowed/' + id]: !!yes, ['lobby/' + id]: null }).catch((e) => toast('Couldn’t update: ' + e.code));
}
function paintLobby() {
  const ids = Object.keys(lobby);
  $('lobby-wrap').style.display = ids.length ? '' : 'none';
  $('knock-badge').textContent = ids.length;
  $('knock-badge').classList.toggle('on', ids.length > 0);
  $('lobby-list').innerHTML = ids.map((id) =>
    '<div class="knock">' + avatarHTML(id, lobby[id].name) +
    '<span class="pn">' + esc(lobby[id].name) + '</span>' +
    '<button class="btn ghost small" data-deny="' + esc(id) + '">Deny</button>' +
    '<button class="btn primary small" data-admit="' + esc(id) + '">Admit</button></div>').join('');
  $('lobby-list').querySelectorAll('[data-admit]').forEach((b) => { b.onclick = () => admit(b.dataset.admit, true); });
  $('lobby-list').querySelectorAll('[data-deny]').forEach((b) => { b.onclick = () => admit(b.dataset.deny, false); });
}
$('btn-admit-all').onclick = () => Object.keys(lobby).forEach((id) => admit(id, true));

 
let panelTab = null, unread = 0;
function openPanel(tab, keep) {
  if (panelTab === tab) { if (!keep) closePanel(); return; }
  panelTab = tab;
  $('panel').classList.add('on');
  document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('on', t.dataset.tab === tab));
  $('tab-people').classList.toggle('on', tab === 'people');
  $('tab-chat').classList.toggle('on', tab === 'chat');
  $('tab-rooms').classList.toggle('on', tab === 'rooms');
  if (tab === 'rooms') renderRooms();
  $('c-people').classList.toggle('on', tab === 'people');
  $('c-chat').classList.toggle('on', tab === 'chat');
  if (tab === 'chat') { unread = 0; paintUnread(); setTimeout(() => $('in-chat').focus(), 50); }
  setTimeout(layout, 30);
}
function closePanel() {
  panelTab = null;
  $('panel').classList.remove('on');
  $('c-people').classList.remove('on'); $('c-chat').classList.remove('on');
  setTimeout(layout, 30);
}
document.querySelectorAll('.tab').forEach((t) => { t.onclick = () => openPanel(t.dataset.tab); });
$('panel-x').onclick = closePanel;
$('c-people').onclick = () => openPanel('people');
$('c-chat').onclick = () => openPanel('chat');
$('c-copy').onclick = () => { if (cooldown('copy')) copyLink(); };

 
(function () {
  const home = $('scr-home');
  let raf = 0, x = 0.5, y = 0.3;
  home.addEventListener('pointermove', (e) => {
    x = e.clientX / innerWidth; y = e.clientY / innerHeight;
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      home.style.setProperty('--mx', x.toFixed(3)); home.style.setProperty('--my', y.toFixed(3));
    });
    const card = e.target.closest('.pub-card,#btn-new,.join-box,.home-stat');
    home.querySelectorAll('.tilt').forEach((c) => { if (c !== card) { c.classList.remove('tilt'); c.style.removeProperty('--rx'); c.style.removeProperty('--ry'); } });
    if (card) {
      const r = card.getBoundingClientRect();
      card.classList.add('tilt');
      card.style.setProperty('--rx', (((e.clientY - r.top) / r.height - 0.5) * -10).toFixed(2) + 'deg');
      card.style.setProperty('--ry', (((e.clientX - r.left) / r.width - 0.5) * 12).toFixed(2) + 'deg');
      card.style.setProperty('--gx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
      card.style.setProperty('--gy', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
    }
  }, { passive: true });
  home.addEventListener('pointerleave', () => home.querySelectorAll('.tilt').forEach((c) => c.classList.remove('tilt')));
})();

 
const UNAME_RE = /^[a-z0-9_]{3,20}$/;
const emailOf = (u) => u + '@u.echomeet.app';
const profiles = {};
const profSubs = {};
const isAccount = () => !!(auth.currentUser && !auth.currentUser.isAnonymous);
function watchProfile(id) {
  if (!id || profSubs[id]) return;
  profSubs[id] = F.onSnapshot(F.doc(fsdb, 'profiles', id), (s) => {
    const v = s.exists() ? s.data() : null;
    if (v) profiles[id] = v; else delete profiles[id];
    if (id === uid && !v && isAccount()) {
      const u = (auth.currentUser.email || '').split('@')[0];
      if (UNAME_RE.test(u)) F.setDoc(F.doc(fsdb, 'profiles', uid), { name: me.name || u, uname: u, at: Date.now() }).catch(() => {});
    }
    if (joined && members[id]) { paintTile(id); renderPeople(); }
    if (id === uid) { paintAcct(); paintPreview && $('scr-pre').classList.contains('on') && paintPreview(); }
  }, () => {});
}
function paintAvatar(el, id, name, pfpOverride) {
  const p = pfpOverride !== undefined ? pfpOverride : (profiles[id] && profiles[id].pfp);
  const img = !!(p && p.k === 'img'), emo = !!(p && p.k === 'emoji');
  el.classList.toggle('img', img); el.classList.toggle('emo', emo);
  el.style.backgroundImage = img ? 'url("' + p.d + '")' : '';
  el.style.setProperty('--c', emo ? p.c : colorFor(id));
  el.textContent = img ? '' : emo ? p.e : initial(name);
}
function avatarHTML(id, name) {
  const p = profiles[id] && profiles[id].pfp;
  if (p && p.k === 'img') return '<div class="avatar img" style="background-image:url(&quot;' + esc(p.d) + '&quot;)"></div>';
  if (p && p.k === 'emoji') return '<div class="avatar emo" style="--c:' + esc(p.c) + '">' + esc(p.e) + '</div>';
  return '<div class="avatar" style="--c:' + colorFor(id) + '">' + esc(initial(name)) + '</div>';
}
function paintAcct() {
  const acc = isAccount(), p = profiles[uid];
  paintAvatar($('ha-av'), uid, acc && p ? p.name : '?');
  $('ha-av').style.display = acc ? '' : 'none';
  $('ha-t').textContent = acc ? (p ? p.name : '…') : 'Log in';
  $('home-acct').classList.toggle('in', acc);
  $('pre-acct').textContent = acc ? 'Signed in as @' + (p ? p.uname : '…') + ' · edit profile' : 'Log in or sign up to save your name and picture';
}
let acMode = 'in', pfpDraft = null, crop = null;
function setAcMode(m) {
  acMode = m;
  document.querySelectorAll('.ac-tabs .tab').forEach((t) => t.classList.toggle('on', t.dataset.m === m));
  $('ac-pass2').style.display = m === 'up' ? '' : 'none';
  $('ac-go').textContent = m === 'up' ? 'Create account' : 'Log in';
  $('ac-pass').autocomplete = m === 'up' ? 'new-password' : 'current-password';
  $('ac-err').textContent = '';
}
document.querySelectorAll('.ac-tabs .tab').forEach((t) => { t.onclick = () => setAcMode(t.dataset.m); });
function openAcct() {
  const acc = isAccount();
  $('ac-auth').style.display = acc ? 'none' : '';
  $('ac-prof').style.display = acc ? '' : 'none';
  $('ac-title').textContent = acc ? 'Your profile' : 'Account';
  $('ac-err').textContent = ''; $('ac-perr').textContent = '';
  if (acc) {
    const p = profiles[uid] || {};
    $('ac-dname').value = p.name || me.name || '';
    $('ac-uname').textContent = '@' + (p.uname || '');
    pfpDraft = p.pfp || null; crop = null;
    $('ac-crop').classList.remove('on'); $('ac-emo').classList.remove('on');
    paintDraft();
  } else setAcMode('in');
  $('acct-modal').classList.add('on');
  setTimeout(() => (acc ? $('ac-dname') : $('ac-user')).focus(), 50);
}
const closeAcct = () => $('acct-modal').classList.remove('on');
$('home-acct').onclick = openAcct; $('pre-acct').onclick = openAcct; $('ac-x').onclick = closeAcct;
$('acct-modal').addEventListener('mousedown', (e) => { if (e.target.id === 'acct-modal') closeAcct(); });
$('form-acct').onsubmit = async (e) => {
  e.preventDefault();
  const err = (t) => { $('ac-err').textContent = t; };
  if (joined) return err('Leave the call first, then log in.');
  const u = $('ac-user').value.trim().toLowerCase(), pw = $('ac-pass').value;
  if (!UNAME_RE.test(u)) return err('Usernames are 3–20 letters, numbers or _');
  if (pw.length < 6) return err('Passwords need at least 6 characters');
  if (acMode === 'up' && pw !== $('ac-pass2').value) return err('The passwords don’t match');
  $('ac-go').disabled = true; err('');
  try {
    if (acMode === 'up') {
      await linkWithCredential(auth.currentUser, EmailAuthProvider.credential(emailOf(u), pw));
      await auth.currentUser.getIdToken(true);
      await F.setDoc(F.doc(fsdb, 'profiles', uid), { name: (me.name || u).slice(0, 40), uname: u, at: Date.now() });
    } else {
      await signInWithEmailAndPassword(auth, emailOf(u), pw);
    }
    location.reload();
  } catch (ex) {
    const c = ex.code || '';
    err(/email-already-in-use|credential-already-in-use/.test(c) ? 'That username is taken'
      : /invalid-credential|wrong-password|user-not-found|invalid-email/.test(c) ? 'Wrong username or password'
      : /too-many-requests/.test(c) ? 'Too many tries. Wait a minute and try again'
      : /operation-not-allowed/.test(c) ? 'Accounts aren’t switched on yet'
      : 'Something went wrong (' + c + ')');
    $('ac-go').disabled = false;
  }
};
$('ac-out').onclick = async () => {
  if (joined) { $('ac-perr').textContent = 'Leave the call first, then log out.'; return; }
  await signOut(auth).catch(() => {});
  location.reload();
};
 
const PFP_EMOJI = ['😀', '😎', '🤠', '🥶', '😈', '👻', '💀', '🤖', '👽', '🐱', '🐶', '🦊', '🐸', '🐼', '🦄', '🐙', '🔥', '⚡', '🌙', '⭐', '🍕', '🎮', '🎧', '🏀'];
const PFP_COLS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#06b6d4', '#334155'];
function paintDraft() {
  const name = $('ac-dname').value.trim() || '?';
  paintAvatar($('ac-av'), uid, name, pfpDraft);
  $('ac-name').textContent = name;
  $('ac-emos').querySelectorAll('button').forEach((b) => b.classList.toggle('on', !!(pfpDraft && pfpDraft.k === 'emoji' && pfpDraft.e === b.dataset.e)));
  $('ac-cols').querySelectorAll('button').forEach((b) => b.classList.toggle('on', !!(pfpDraft && pfpDraft.k === 'emoji' && pfpDraft.c === b.dataset.c)));
}
$('ac-dname').oninput = paintDraft;
$('ac-emos').innerHTML = PFP_EMOJI.map((e) => '<button type="button" data-e="' + e + '">' + e + '</button>').join('');
$('ac-cols').innerHTML = PFP_COLS.map((c) => '<button type="button" data-c="' + c + '" style="--c:' + c + '" aria-label="Colour"></button>').join('');
$('ac-emos').onclick = (e) => { const b = e.target.closest('[data-e]'); if (!b) return; pfpDraft = { k: 'emoji', e: b.dataset.e, c: (pfpDraft && pfpDraft.c) || PFP_COLS[0] }; paintDraft(); };
$('ac-cols').onclick = (e) => { const b = e.target.closest('[data-c]'); if (!b) return; pfpDraft = { k: 'emoji', e: (pfpDraft && pfpDraft.e) || PFP_EMOJI[0], c: b.dataset.c }; paintDraft(); };
$('ac-emo-b').onclick = () => { $('ac-emo').classList.add('on'); $('ac-crop').classList.remove('on'); crop = null; if (!pfpDraft || pfpDraft.k !== 'emoji') pfpDraft = { k: 'emoji', e: PFP_EMOJI[0], c: PFP_COLS[0] }; paintDraft(); };
$('ac-letter').onclick = () => { $('ac-emo').classList.remove('on'); $('ac-crop').classList.remove('on'); crop = null; pfpDraft = null; paintDraft(); };
$('ac-up').onclick = () => $('ac-file').click();
$('ac-file').onchange = () => {
  const f = $('ac-file').files[0]; $('ac-file').value = '';
  if (!f) return;
  const img = new Image();
  img.onload = () => { crop = { img, z: 1, dx: 0, dy: 0 }; $('ac-zoom').value = 1; $('ac-crop').classList.add('on'); $('ac-emo').classList.remove('on'); drawCrop(); };
  img.onerror = () => { $('ac-perr').textContent = 'That file isn’t a picture we can open'; };
  img.src = URL.createObjectURL(f);
};
function cropBox() {
  const S = 240, { img } = crop, s = (S / Math.min(img.width, img.height)) * crop.z, w = img.width * s, h = img.height * s;
  const mx = (w - S) / 2, my = (h - S) / 2;
  crop.dx = Math.max(-mx, Math.min(mx, crop.dx)); crop.dy = Math.max(-my, Math.min(my, crop.dy));
  return { x: (S - w) / 2 + crop.dx, y: (S - h) / 2 + crop.dy, w, h };
}
function drawCrop() {
  if (!crop) return;
  const c = $('ac-canvas'), g = c.getContext('2d'), b = cropBox();
  g.clearRect(0, 0, 240, 240); g.drawImage(crop.img, b.x, b.y, b.w, b.h);
  const out = document.createElement('canvas'); out.width = out.height = 160;
  out.getContext('2d').drawImage(c, 0, 0, 160, 160);
  pfpDraft = { k: 'img', d: out.toDataURL('image/jpeg', 0.85) };
  paintDraft();
}
$('ac-zoom').oninput = () => { if (crop) { crop.z = +$('ac-zoom').value; drawCrop(); } };
(() => {
  const c = $('ac-canvas'); let drag = null;
  c.addEventListener('pointerdown', (e) => { if (!crop) return; drag = { x: e.clientX, y: e.clientY, dx: crop.dx, dy: crop.dy }; c.setPointerCapture(e.pointerId); });
  c.addEventListener('pointermove', (e) => { if (!drag) return; crop.dx = drag.dx + (e.clientX - drag.x); crop.dy = drag.dy + (e.clientY - drag.y); drawCrop(); });
  c.addEventListener('pointerup', () => { drag = null; });
  c.addEventListener('wheel', (e) => { if (!crop) return; e.preventDefault(); crop.z = Math.max(1, Math.min(4, crop.z - e.deltaY * 0.002)); $('ac-zoom').value = crop.z; drawCrop(); }, { passive: false });
})();
$('ac-save').onclick = async () => {
  const name = $('ac-dname').value.trim().slice(0, 40);
  if (!name) { $('ac-perr').textContent = 'Pick a display name'; return; }
  $('ac-save').disabled = true;
  try {
    await F.setDoc(F.doc(fsdb, 'profiles', uid), { name, pfp: pfpDraft || F.deleteField(), at: Date.now() }, { merge: true });
    me.name = name; store.set('em-name', name);
    if ($('in-name')) $('in-name').value = name;
    if (joined) update(R('members/' + uid), { name }).catch(() => {});
    toast('Profile saved'); closeAcct();
  } catch (_) { $('ac-perr').textContent = 'Couldn’t save. Try a smaller picture.'; }
  $('ac-save').disabled = false;
};

 
const fpReady = (async () => {
  try {
    const c = document.createElement('canvas'); c.width = 240; c.height = 60;
    const g = c.getContext('2d');
    g.textBaseline = 'top'; g.font = '16px Arial'; g.fillStyle = '#f60'; g.fillRect(100, 1, 62, 20);
    g.fillStyle = '#069'; g.fillText('EchoMeet ✓ 😃 fp', 2, 15); g.fillStyle = 'rgba(102,204,0,.7)'; g.fillText('EchoMeet ✓ 😃 fp', 4, 17);
    let gl = '';
    try { const w = document.createElement('canvas').getContext('webgl'), d = w && w.getExtension('WEBGL_debug_renderer_info'); if (d) gl = w.getParameter(d.UNMASKED_RENDERER_WEBGL) + '|' + w.getParameter(d.UNMASKED_VENDOR_WEBGL); } catch (_) {}
    const parts = [c.toDataURL(), gl, Intl.DateTimeFormat().resolvedOptions().timeZone, navigator.hardwareConcurrency, navigator.deviceMemory,
      navigator.platform, (navigator.languages || []).join(','), navigator.maxTouchPoints, screen.colorDepth].join('##');
    const h = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(parts));
    return [...new Uint8Array(h)].slice(0, 16).map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch (_) { return ''; }
})();
let blocked = false;
async function watchBans() {
  const hit = (s) => {
    if (!s.exists() || blocked || isOwner(uid)) return;
    blocked = true;
    if (joined) leave('blocked'); else { stopMedia(); endScreen('blocked'); }
  };
  const fsHit = (s) => hit({ exists: () => s.exists() });
  F.onSnapshot(F.doc(fsdb, 'accountBans', uid), fsHit, () => {});
  const fp = await fpReady;
  if (fp) F.onSnapshot(F.doc(fsdb, 'deviceBans', fp), fsHit, () => {});
}
async function ownerBan(kind, id) {
  const m = members[id]; if (!m) return;
  const what = kind === 'acct' ? 'the account @' + profiles[id].uname : 'this device';
  if (!confirm('Ban ' + what + ' (' + m.name + ') from all of EchoMeet?')) return;
  try {
    const rec = { name: m.name, uname: (profiles[id] && profiles[id].uname) || '', at: Date.now() };
    await F.setDoc(F.doc(fsdb, kind === 'acct' ? 'accountBans' : 'deviceBans', kind === 'acct' ? id : m.fp), rec);
    if (kind === 'acct') await set(ref(db, 'accountBans/' + id), rec);
    await push(R('cmd/' + id), { type: 'kick', by: uid }).catch(() => {});
    await remove(R('members/' + id)).catch(() => {});
    toast((kind === 'acct' ? 'Account' : 'Device') + ' banned: ' + m.name);
  } catch (_) { toast('Couldn’t ban. Owner login needed'); }
}
async function openBans() {
  $('bans-modal').classList.add('on');
  $('bans-list').innerHTML = '<p class="rooms-note">Loading…</p>';
  const [a, d] = await Promise.all([F.getDocs(F.collection(fsdb, 'accountBans')).catch(() => null), F.getDocs(F.collection(fsdb, 'deviceBans')).catch(() => null)]);
  const rows = [];
  if (a) a.forEach((x) => { const v = x.data(); rows.push({ path: 'accountBans/' + x.id, kind: 'Account', who: (v.uname ? '@' + v.uname + ' · ' : '') + (v.name || x.id), at: v.at }); });
  if (d) d.forEach((x) => { const v = x.data(); rows.push({ path: 'deviceBans/' + x.id, kind: 'Device', who: (v.name || '?') + ' · ' + x.id.slice(0, 8), at: v.at }); });
  rows.sort((x, y) => (y.at || 0) - (x.at || 0));
  $('bans-list').innerHTML = rows.length ? rows.map((r) => '<div class="cv-row ban-row"><div><div class="cv-h"><b>' + r.kind + '</b> · ' + new Date(r.at || 0).toLocaleString() + '</div><p>' + esc(r.who) + '</p></div>' +
    '<button class="btn ghost small" data-p="' + esc(r.path) + '">Unban</button></div>').join('') : '<p class="rooms-note">Nobody is banned.</p>';
  $('bans-list').querySelectorAll('[data-p]').forEach((b) => { b.onclick = () => {
    const [col, key] = b.dataset.p.split('/');
    Promise.all([F.deleteDoc(F.doc(fsdb, col, key)), col === 'accountBans' ? remove(ref(db, 'accountBans/' + key)) : null])
      .then(() => { toast('Unbanned'); openBans(); }, () => toast('Couldn’t unban'));
  }; });
}
$('op-bans').onclick = openBans;
$('bans-x').onclick = () => $('bans-modal').classList.remove('on');

 
function speakerChanged(prev) {
  const spk = (meta && meta.speaker) || null;
  if (spk === prev) return;
  if (prev && members[prev]) paintTile(prev);
  if (spk) {
    if (members[spk]) paintTile(spk);
    if (spk !== uid && sameRoom(spk) && (!pinned || autoPinned)) setPin(spk, false);
    toast(spk === uid ? '🎤 You’re the speaker. Everyone hears you over the room' : '🎤 ' + (members[spk] ? members[spk].name : 'Someone') + ' is now the speaker');
  } else if (prev && autoPinned && pinned === prev) setPin(null);
  renderPeople();
}

 
const pairOf = (a, b) => (a < b ? a + '_' + b : b + '_' + a);
const friendSet = new Set(), inReq = new Map(), outReq = new Set();
const presence = {}, presSubs = {}, lastSeen = {};
let dmDocs = {}, dmSeen = store.get('em-dmseen', {}), dmOpen = null, dmUnsub = null, frTab = 'friends';
const SI = {
  chat: '<svg viewBox="0 0 24 24"><path d="M20 12a8 8 0 0 1-11.6 7.1L4 20l1-4.2A8 8 0 1 1 20 12z"/></svg>',
  call: '<svg viewBox="0 0 24 24"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg>',
  join: '<svg viewBox="0 0 24 24"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/></svg>',
  check: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7"/></svg>',
  x: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>'
};
const friendState = (id) => (friendSet.has(id) ? 'friends' : outReq.has(id) ? 'out' : inReq.has(id) ? 'in' : 'none');
const nameOf = (id) => (profiles[id] && profiles[id].name) || '…';
function startSocial() {
  if (!isAccount()) return;
  ['home-friends', 'c-friends'].forEach((b) => { $(b).style.display = ''; });
  F.onSnapshot(F.query(F.collection(fsdb, 'friendships'), F.where('users', 'array-contains', uid)), (qs) => {
    friendSet.clear();
    qs.forEach((d) => { const o = d.data().users.find((u) => u !== uid); if (o) { friendSet.add(o); watchProfile(o); watchPresence(o); } });
    paintFriends();
  }, (e) => console.warn('[meet] friends', e.code));
  F.onSnapshot(F.query(F.collection(fsdb, 'friendReqs'), F.where('to', '==', uid)), (qs) => {
    const before = new Set(inReq.keys());
    inReq.clear();
    qs.forEach((d) => { const v = d.data(); inReq.set(v.from, v); watchProfile(v.from); });
    inReq.forEach((v, k) => { if (!before.has(k) && Date.now() - (v.at || 0) < 60000) { chime(); toast('👋 ' + nameOf(k) + ' sent you a friend request', { label: 'View', fn: () => openFriends('requests') }, 8000); notify('Friend request', nameOf(k) + ' wants to be friends', 'fr-' + k, () => openFriends('requests')); } });
    paintFriends();
  }, () => {});
  F.onSnapshot(F.query(F.collection(fsdb, 'friendReqs'), F.where('from', '==', uid)), (qs) => {
    outReq.clear(); qs.forEach((d) => outReq.add(d.data().to)); paintFriends();
  }, () => {});
  F.onSnapshot(F.query(F.collection(fsdb, 'dms'), F.where('users', 'array-contains', uid)), (qs) => {
    qs.forEach((d) => {
      const v = d.data(), prev = dmDocs[d.id];
      dmDocs[d.id] = v;
      const other = v.users.find((u) => u !== uid); if (other) watchProfile(other);
      if (prev && v.lastAt > prev.lastAt && v.lastBy !== uid && dmOpen !== d.id) {
        beep();
        toast('💬 ' + nameOf(v.lastBy) + ': ' + String(v.last || '').slice(0, 70), { label: 'Open', fn: () => openDM(v.lastBy) }, 7000);
        notify(nameOf(v.lastBy), String(v.last || ''), 'dm-' + d.id, () => openDM(v.lastBy));
      }
    });
    paintFriends();
  }, () => {});
  onDisconnect(ref(db, 'presence/' + uid)).remove();
  presenceTick(); setInterval(presenceTick, 10000);
  startGroups();
  onChildAdded(ref(db, 'ring/' + uid), (s) => incomingCall(s.key, s.val()));
  onChildRemoved(ref(db, 'ring/' + uid), (s) => { if (ringing && ringing.from === s.key) stopRinging(); });
}
let lastPres = '';
function presenceTick() {
  if (!isAccount()) return;
  const v = { at: Date.now(), on: true };
  if (ec) v.call = true;
  if (joined && room && !(meta && meta.locked)) {
    v.room = room;
    v.title = (pubEntry && pubEntry.title) || 'a meeting';
    v.n = Object.keys(members).filter((k) => !members[k].ghost).length;
  }
  const key = JSON.stringify([v.room, v.title, v.n, v.call]);
  if (key === lastPres && Date.now() - (presenceTick.at || 0) < 60000) return;
  lastPres = key; presenceTick.at = Date.now();
  set(ref(db, 'presence/' + uid), v).catch(() => {});
  onDisconnect(ref(db, 'presence/' + uid)).remove();
  set(ref(db, 'lastSeen/' + uid), serverTimestamp()).catch(() => {});
  onDisconnect(ref(db, 'lastSeen/' + uid)).set(serverTimestamp());
}
function watchPresence(id) {
  if (presSubs[id]) return;
  presSubs[id] = onValue(ref(db, 'presence/' + id), (s) => { presence[id] = s.val(); paintFriends(); if (dmOpen === pairOf(uid, id)) paintDMHead(id); }, () => {});
  onValue(ref(db, 'lastSeen/' + id), (s) => { lastSeen[id] = s.val(); if (!presence[id]) { paintFriends(); if (dmOpen === pairOf(uid, id)) paintDMHead(id); } }, () => {});
}
function seenText(t) {
  if (!t) return 'Offline';
  const s = (Date.now() - t) / 1000, d = new Date(t), today = new Date();
  if (s < 60) return 'Last seen just now';
  if (s < 3600) return 'Last seen ' + Math.floor(s / 60) + 'm ago';
  if (d.toDateString() === today.toDateString()) return 'Last seen ' + Math.floor(s / 3600) + 'h ago';
  if (d.toDateString() === new Date(today - 86400000).toDateString()) return 'Last seen yesterday';
  if (s < 7 * 86400) return 'Last seen ' + d.toLocaleDateString([], { weekday: 'long' });
  return 'Last seen ' + d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}
setInterval(() => paintFriends(), 60000);
const presText = (id) => {
  const p = presence[id];
  if (!p) return { on: false, t: seenText(lastSeen[id]) };
  if (p.call) return { on: true, inCall: true, t: 'On an EchoCall' + (p.room ? ' · in ' + p.title : ''), room: p.room };
  if (p.room) return { on: true, inCall: true, t: 'In ' + p.title + (p.n ? ' · ' + p.n + ' here' : ''), room: p.room };
  return { on: true, t: 'Online' };
};
const unreadPair = (pair) => { const d = dmDocs[pair]; return !!(d && d.lastBy && d.lastBy !== uid && d.lastAt > (dmSeen[pair] || 0)); };
const unreadFor = (other) => unreadPair(pairOf(uid, other));
const ago = (t) => { const s = (Date.now() - t) / 1000; return s < 60 ? 'now' : s < 3600 ? Math.floor(s / 60) + 'm' : s < 86400 ? Math.floor(s / 3600) + 'h' : Math.floor(s / 86400) + 'd'; };
function avStatus(id, name) {
  const st = presText(id);
  return '<div class="fr-av' + (st.on ? ' on' : '') + (st.inCall ? ' incall' : '') + '">' + avatarHTML(id, name) + '</div>';
}
function paintFriends() {
  const unreadChats = Object.keys(dmDocs).filter(unreadPair).length + Object.keys(groups).filter(groupUnread).length, n = inReq.size + unreadChats;
  ['fr-badge', 'fr-badge2'].forEach((b) => { $(b).textContent = n; $(b).classList.toggle('on', n > 0); });
  $('frt-req-n').textContent = inReq.size || ''; $('frt-chat-n').textContent = unreadChats || '';
  if (!$('friends').classList.contains('on')) return;
  const me_ = profiles[uid] || {};
  $('fr-me').innerHTML = avatarHTML(uid, me_.name || '?') + '<div><b>' + esc(me_.name || '') + '</b><em>@' + esc(me_.uname || '') + '</em></div>';
  const list = [...friendSet].sort((a, b) => (presText(b).on - presText(a).on) || nameOf(a).localeCompare(nameOf(b)));
  const online = list.filter((id) => presText(id).on).length;
  $('fr-n').textContent = list.length ? online + ' of ' + list.length + ' online' : '';
  $('fr-list').innerHTML = list.length ? list.map((id) => {
    const st = presText(id);
    return '<div class="fr-row" data-prof="' + esc(id) + '">' + avStatus(id, nameOf(id)) +
      '<div class="fr-t"><b>' + esc(nameOf(id)) + '</b><em class="' + (st.inCall ? 'incall' : st.on ? 'online' : '') + '">' + esc(st.t) + '</em></div>' +
      '<div class="fr-acts">' + (st.room && st.room !== room ? '<button class="fr-ic join" data-join="' + esc(st.room) + '" title="Join their meeting">' + SI.join + '</button>' : '') +
      '<button class="fr-ic" data-dm="' + esc(id) + '" title="Message">' + SI.chat + (unreadFor(id) ? '<i class="fr-dot"></i>' : '') + '</button>' +
      '<button class="fr-ic" data-call="' + esc(id) + '" title="Call">' + SI.call + '</button></div></div>';
  }).join('') : '<div class="fr-empty"><span><i class="fa-solid fa-user-group"></i></span><b>No friends yet</b><p>Add someone by their username above, or tap ⋮ on anyone with an account in a call.</p></div>';
  $('fr-chats').innerHTML = chatRowsHTML();
  $('fr-reqs').innerHTML = (inReq.size ? '<div class="sec-h">Wants to be friends</div>' + [...inReq.keys()].map((id) =>
    '<div class="fr-row">' + avatarHTML(id, nameOf(id)) + '<div class="fr-t"><b>' + esc(nameOf(id)) + '</b><em>@' + esc(profiles[id] ? profiles[id].uname : '') + '</em></div>' +
    '<div class="fr-acts"><button class="fr-ic ok" data-acc="' + esc(id) + '" title="Accept">' + SI.check + '</button><button class="fr-ic" data-dec="' + esc(id) + '" title="Decline">' + SI.x + '</button></div></div>').join('') : '') +
    (outReq.size ? '<div class="sec-h">Sent</div>' + [...outReq].map((id) => { watchProfile(id); return '<div class="fr-row">' + avatarHTML(id, nameOf(id)) + '<div class="fr-t"><b>' + esc(nameOf(id)) + '</b><em>Waiting for them to accept</em></div>' +
      '<div class="fr-acts"><button class="fr-ic" data-unsend="' + esc(id) + '" title="Cancel request">' + SI.x + '</button></div></div>'; }).join('') : '') ||
    '<div class="fr-empty"><span><i class="fa-solid fa-inbox"></i></span><b>No requests</b><p>When someone adds you, it shows up here.</p></div>';
  const P = $('friends');
  P.querySelectorAll('[data-acc]').forEach((b) => { b.onclick = (e) => { e.stopPropagation(); acceptFriend(b.dataset.acc); }; });
  P.querySelectorAll('[data-dec]').forEach((b) => { b.onclick = (e) => { e.stopPropagation(); F.deleteDoc(F.doc(fsdb, 'friendReqs', b.dataset.dec + '_' + uid)).catch(() => {}); }; });
  P.querySelectorAll('[data-unsend]').forEach((b) => { b.onclick = (e) => { e.stopPropagation(); F.deleteDoc(F.doc(fsdb, 'friendReqs', uid + '_' + b.dataset.unsend)).catch(() => {}); }; });
  P.querySelectorAll('[data-join]').forEach((b) => { b.onclick = (e) => { e.stopPropagation(); if (joined) { toast('Leave this call first'); return; } closeFriends(); go('/' + b.dataset.join); }; });
  P.querySelectorAll('[data-dm]').forEach((b) => { b.onclick = (e) => { e.stopPropagation(); openDM(b.dataset.dm); }; });
  P.querySelectorAll('[data-call]').forEach((b) => { b.onclick = (e) => { e.stopPropagation(); callFriend(b.dataset.call); }; });
  P.querySelectorAll('[data-prof]').forEach((r) => { r.onclick = () => openProfile(r.dataset.prof); });
  bindChatRows();
}
function showFrTab(t) {
  frTab = t;
  document.querySelectorAll('.fr-tabs .tab').forEach((b) => b.classList.toggle('on', b.dataset.t === t));
  ['friends', 'chats', 'requests'].forEach((k) => $('frp-' + k).classList.toggle('on', k === t));
}
document.querySelectorAll('.fr-tabs .tab').forEach((b) => { b.onclick = () => showFrTab(b.dataset.t); });
function openFriends(tab) {
  if (!isAccount()) { openAcct(); return; }
  closeDM(); closeGroup();
  $('friends').classList.add('on'); $('fr-home').classList.add('on'); $('fr-dm').classList.remove('on');
  $('fr-err').textContent = '';
  showFrTab(typeof tab === 'string' ? tab : (inReq.size && frTab === 'friends' ? frTab : frTab));
  paintFriends();
}
function closeFriends() { $('friends').classList.remove('on'); closeDM(); closeGroup(); }
$('home-friends').onclick = $('c-friends').onclick = () => ($('friends').classList.contains('on') ? closeFriends() : openFriends());
$('fr-x').onclick = closeFriends;
$('friends').addEventListener('mousedown', (e) => { if (e.target.id === 'friends') closeFriends(); });
addEventListener('keydown', (e) => { if (e.key === 'Escape' && $('friends').classList.contains('on') && !$('viewer').classList.contains('on')) closeFriends(); });
async function addFriendUid(other) {
  if (!isAccount()) { openAcct(); return; }
  if (other === uid || friendSet.has(other)) return;
  if (inReq.has(other)) { acceptFriend(other); return; }
  try {
    await F.setDoc(F.doc(fsdb, 'friendReqs', uid + '_' + other), { from: uid, to: other, at: Date.now() });
    toast('Friend request sent to ' + nameOf(other));
  } catch (e) { toast('Couldn’t send the request (' + e.code + ')'); }
}
async function acceptFriend(other) {
  const users = [uid, other].sort();
  try {
    await F.setDoc(F.doc(fsdb, 'friendships', pairOf(uid, other)), { users, at: Date.now() });
    F.deleteDoc(F.doc(fsdb, 'friendReqs', other + '_' + uid)).catch(() => {});
    F.deleteDoc(F.doc(fsdb, 'friendReqs', uid + '_' + other)).catch(() => {});
    toast('🎉 You and ' + nameOf(other) + ' are friends now');
  } catch (e) { toast('Couldn’t accept (' + e.code + ')'); }
}
$('form-fr').onsubmit = async (e) => {
  e.preventDefault();
  const u = $('in-fr').value.trim().toLowerCase().replace(/^@/, '');
  $('fr-err').textContent = '';
  if (!UNAME_RE.test(u)) { $('fr-err').textContent = 'Type their username (3–20 letters, numbers or _)'; return; }
  try {
    const qs = await F.getDocs(F.query(F.collection(fsdb, 'profiles'), F.where('uname', '==', u), F.limit(1)));
    if (qs.empty) { $('fr-err').textContent = 'Nobody has that username'; return; }
    const other = qs.docs[0].id;
    if (other === uid) { $('fr-err').textContent = 'That’s you 🙂'; return; }
    if (friendSet.has(other)) { $('fr-err').textContent = 'You’re already friends'; return; }
    profiles[other] = qs.docs[0].data();
    await addFriendUid(other);
    $('in-fr').value = '';
  } catch (er) { $('fr-err').textContent = 'Couldn’t look that up (' + er.code + ')'; }
};
 
function openProfile(id) {
  watchProfile(id);
  const p = profiles[id] || {}, st = friendSet.has(id) ? presText(id) : null, fs = friendState(id);
  $('pf-av').outerHTML = avatarHTML(id, p.name || '?').replace('class="avatar', 'id="pf-av" class="avatar big');
  $('pf-name').textContent = p.name || 'Someone';
  $('pf-uname').textContent = p.uname ? '@' + p.uname : 'Guest';
  $('pf-badges').innerHTML = badgesOf(id).map(([, b]) => '<span class="pbadge" style="--bc:' + esc(b.c) + '">' + esc(b.e) + ' ' + esc(b.t) + '</span>').join('');
  $('pf-status').innerHTML = st ? '<i class="pf-dot' + (st.on ? ' on' : '') + '"></i>' + esc(st.t) : '';
  const acts = [];
  if (id !== uid && fs === 'friends') {
    acts.push('<button class="btn primary" data-a="dm"><i class="fa-solid fa-comment"></i> Message</button><button class="btn ghost" data-a="call"><i class="fa-solid fa-phone"></i> Call</button>');
    if (st && st.room && st.room !== room) acts.push('<button class="btn ghost" data-a="join">Join their meeting</button>');
    acts.push('<button class="btn ghost small pf-rm" data-a="rm">Remove friend</button>');
  } else if (id !== uid && p.uname) {
    acts.push(fs === 'out' ? '<button class="btn ghost" disabled>Request sent</button>' : '<button class="btn primary" data-a="add">' + (fs === 'in' ? 'Accept friend request' : '<i class="fa-solid fa-user-plus"></i> Add friend') + '</button>');
  }
  $('pf-acts').innerHTML = acts.join('');
  $('pf-acts').querySelectorAll('[data-a]').forEach((b) => {
    b.onclick = () => {
      const a = b.dataset.a; $('prof-modal').classList.remove('on');
      if (a === 'dm') openDM(id);
      else if (a === 'call') callFriend(id);
      else if (a === 'join') { if (joined) toast('Leave this call first'); else { closeFriends(); go('/' + st.room); } }
      else if (a === 'add') addFriendUid(id);
      else if (a === 'rm' && confirm('Remove ' + (p.name || 'this friend') + '?')) F.deleteDoc(F.doc(fsdb, 'friendships', pairOf(uid, id))).then(() => toast('Removed'), () => toast('Couldn’t remove'));
    };
  });
  $('prof-modal').classList.add('on');
}
$('pf-x').onclick = () => $('prof-modal').classList.remove('on');
$('prof-modal').addEventListener('mousedown', (e) => { if (e.target.id === 'prof-modal') $('prof-modal').classList.remove('on'); });
 
function paintDMHead(other) {
  const st = presText(other);
  $('dm-who').innerHTML = avStatus(other, nameOf(other)) + '<div><b>' + esc(nameOf(other)) + '</b><em class="' + (st.inCall ? 'incall' : st.on ? 'online' : '') + '">' + esc(st.t) + '</em></div>';
  $('dm-who').onclick = () => openProfile(other);
}
function openDM(other) {
  if (!isAccount()) { openAcct(); return; }
  if (!friendSet.has(other)) { toast('Add them as a friend first, then you can chat'); openProfile(other); return; }
  closeGroup();
  $('friends').classList.add('on');
  $('fr-home').classList.remove('on'); $('fr-dm').classList.add('on');
  paintDMHead(other);
  $('dm-call').onclick = () => callFriend(other);
  const pair = pairOf(uid, other);
  dmOpen = pair;
  if (dmUnsub) dmUnsub();
  $('dm-list').innerHTML = '<p class="rooms-note">Loading…</p>';
  dmUnsub = F.onSnapshot(F.query(F.collection(fsdb, 'dms', pair, 'msgs'), F.orderBy('at'), F.limitToLast(200)), (qs) => {
    const L = $('dm-list');
    const atBottom = L.scrollHeight - L.scrollTop - L.clientHeight < 80;
    L.innerHTML = qs.empty ? '<div class="fr-empty"><span><i class="fa-solid fa-hand"></i></span><b>Say hi to ' + esc(nameOf(other)) + '</b><p>Messages are saved, so you can pick up later.</p></div>' : '';
    let lastDay = '', lastFrom = '', lastAt = 0;
    qs.forEach((d) => {
      const v = d.data(), dt = new Date(v.at), day = dt.toDateString();
      if (day !== lastDay) {
        const sep = document.createElement('div'); sep.className = 'dm-day';
        const today = new Date().toDateString(), yest = new Date(Date.now() - 864e5).toDateString();
        sep.textContent = day === today ? 'Today' : day === yest ? 'Yesterday' : dt.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
        L.appendChild(sep); lastDay = day; lastFrom = '';
      }
      const grouped = v.from === lastFrom && v.at - lastAt < 120000;
      const el = document.createElement('div');
      el.className = 'dm-m' + (v.from === uid ? ' me' : '') + (grouped ? ' grp' : '');
      if (v.img) { const im = document.createElement('img'); im.src = v.img; im.className = 'dm-img'; im.onclick = () => openViewer({ url: v.img, name: 'picture.jpg', type: 'image/jpeg' }); el.appendChild(im); }
      if (v.text) { const t = document.createElement('p'); t.textContent = v.text; el.appendChild(t); }
      const tm = document.createElement('span'); tm.textContent = dt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }); el.appendChild(tm);
      L.appendChild(el);
      lastFrom = v.from; lastAt = v.at;
    });
    if (atBottom || qs.docChanges().some((c) => c.doc.data().from === uid)) L.scrollTop = L.scrollHeight;
    dmSeen[pair] = Date.now(); store.set('em-dmseen', dmSeen); paintFriends();
  }, (e) => { $('dm-list').innerHTML = '<p class="rooms-note">Couldn’t load messages (' + esc(e.code) + ')</p>'; });
  setTimeout(() => $('in-dm').focus(), 50);
}
function closeDM() { if (dmUnsub) { dmUnsub(); dmUnsub = null; } dmOpen = null; }
$('dm-back').onclick = () => { closeDM(); $('fr-dm').classList.remove('on'); $('fr-home').classList.add('on'); paintFriends(); };
async function sendDM(other, text, img) {
  const pair = pairOf(uid, other), users = [uid, other].sort();
  const msg = { from: uid, at: Date.now() };
  if (text) msg.text = text.slice(0, 2000);
  if (img) msg.img = img;
  await F.setDoc(F.doc(fsdb, 'dms', pair), { users, last: text ? text.slice(0, 120) : '📷 Picture', lastAt: msg.at, lastBy: uid }, { merge: true });
  await F.addDoc(F.collection(fsdb, 'dms', pair, 'msgs'), msg);
}
const dmOther = () => dmOpen && dmOpen.split('_').find((u) => u !== uid);
$('form-dm').onsubmit = (e) => {
  e.preventDefault();
  const t = $('in-dm').value.trim(), o = dmOther();
  if (!t || !o || !cooldown('dm')) return;
  $('in-dm').value = '';
  sendDM(o, t).catch((er) => toast('Message not sent (' + er.code + ')'));
};
$('dm-img').onclick = () => $('dm-file').click();
$('dm-file').onchange = async () => {
  const f = $('dm-file').files[0], o = dmOther(); $('dm-file').value = '';
  if (!f || !o) return;
  try { const d = await shrinkImage(f, 1280, 0.8); if (d.length > 700000) throw new Error('big'); await sendDM(o, '', d); }
  catch (_) { toast('That picture couldn’t be sent'); }
};
function shrinkImage(file, max, q) {
  return new Promise((res, rej) => {
    const im = new Image();
    im.onload = () => {
      const k = Math.min(1, max / Math.max(im.width, im.height)), c = document.createElement('canvas');
      c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
      c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
      res(c.toDataURL('image/jpeg', q));
    };
    im.onerror = rej; im.src = URL.createObjectURL(file);
  });
}
 
const fa = (n) => '<i class="fa-solid fa-' + n + '"></i>';
let ec = null;
function ecTitleFor(kind, ids, title) { return title || (kind === 'group' ? 'Group call' : nameOf(ids.find((u) => u !== uid) || uid)); }
async function ecMedia() {
  const a = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } }).then((s) => s.getAudioTracks()[0]).catch(() => null);
  return a;
}
 
async function ecStart(targets, kind, gid, title) {
  if (!isAccount()) { openAcct(); return; }
  if (ec) { toast('You’re already in an EchoCall'); ecShow(); return; }
  const id = push(ref(db, 'ecall')).key, inv = { [uid]: true };
  targets.forEach((t) => { inv[t] = true; });
  try {
    await set(ref(db, 'ecall/' + id), { by: uid, kind, gid: gid || '', title: title || '', at: Date.now(), inv });
  } catch (e) { toast('Couldn’t start the call (' + e.code + ')'); return; }
  if (joined) meetingHold(true);
  await ecJoin(id, { kind, gid, title, targets, outgoing: true });
  targets.forEach((t) => {
    const r = ref(db, 'ring/' + t + '/' + uid);
    set(r, { call: id, name: (profiles[uid] && profiles[uid].name) || me.name || 'Someone', at: Date.now(), title: kind === 'group' ? (title || 'Group call') : '' })
      .then(() => onDisconnect(r).remove()).catch(() => {});
    ec.ringRefs.push(r);
    ec.unsubs.push(onValue(r, (s) => {
      const v = s.val();
      if (v && v.ans === 'no' && ec) {
        if (kind === 'dm') { toast(nameOf(t) + ' declined'); ecHangup(); }
        else toast(nameOf(t) + ' declined');
      }
    }, () => {}));
  });
  ec.ringTimer = setTimeout(() => { if (ec && Object.keys(ec.members).length <= 1) { toast('No answer'); ecHangup(); } }, 40000);
}
function callFriend(other) {
  if (!friendSet.has(other)) { toast('You can only call friends'); return; }
  closeFriends(); $('prof-modal').classList.remove('on');
  ecStart([other], 'dm', '', '');
}
function callGroup(gid) {
  const g = groups[gid]; if (!g) return;
  closeFriends();
  ecStart(g.members.filter((u) => u !== uid), 'group', gid, g.name);
}
async function ecJoin(id, o) {
  const audio = await ecMedia();
  if (!audio) toast('Microphone is blocked. You can still listen');
  ec = { id, kind: o.kind, gid: o.gid, title: o.title, members: {}, peers: new Map(), unsubs: [], ringRefs: [], audio, video: null, screen: null,
    mic: !!audio, cam: false, deaf: false, start: 0, outgoing: !!o.outgoing, targets: o.targets || [] };
  const mref = ref(db, 'ecall/' + id + '/members/' + uid);
  await set(mref, { name: (profiles[uid] && profiles[uid].name) || me.name || 'Someone', at: Date.now(), mic: ec.mic, cam: false });
  onDisconnect(mref).remove();
  if (o.kind === 'dm') onDisconnect(ref(db, 'ecall/' + id)).remove();
  ec.unsubs.push(onChildAdded(ref(db, 'ecall/' + id + '/members'), (s) => ecMemberAdded(s.key, s.val())));
  ec.unsubs.push(onChildChanged(ref(db, 'ecall/' + id + '/members'), (s) => { ec.members[s.key] = s.val(); ecPaint(); }));
  ec.unsubs.push(onChildRemoved(ref(db, 'ecall/' + id + '/members'), (s) => ecMemberRemoved(s.key)));
  ec.unsubs.push(onChildAdded(ref(db, 'ecall/' + id + '/sig/' + uid), ecOnSignal));
  presenceTick();
  ecShow();
}
function ecMemberAdded(id, m) {
  if (!ec) return;
  ec.members[id] = m;
  watchProfile(id);
  if (id !== uid) {
    ecPeer(id);
    if (!ec.start) { ec.start = Date.now(); clearTimeout(ec.ringTimer); ec.ringRefs.forEach((r) => remove(r).catch(() => {})); }
    else if (ec.kind === 'group') sfx('join');
  }
  ecPaint();
}
function ecMemberRemoved(id) {
  if (!ec) return;
  delete ec.members[id];
  const p = ec.peers.get(id); if (p) { try { p.pc.close(); } catch (_) {} ec.peers.delete(id); }
  if (id === uid) { ecCleanup('ended'); return; }
  sfx('leave');
  if (ec.start && Object.keys(ec.members).filter((k) => k !== uid).length === 0) { toast('Call ended'); ecHangup(); return; }
  ecPaint();
}
const ecSendV = () => (ec && (ec.screen || (ec.cam ? ec.video : null))) || null;
function ecPeer(id) {
  let p = ec.peers.get(id);
  if (p) return p;
  const initiator = uid < id, pc = new RTCPeerConnection({ iceServers: ICE });
  p = { id, pc, polite: !initiator, makingOffer: false, ignoreOffer: false, stream: new MediaStream(), ta: null, tv: null, chain: Promise.resolve() };
  ec.peers.set(id, p);
  if (initiator) {
    p.ta = pc.addTransceiver(ec.audio || 'audio', { direction: 'sendrecv' });
    p.tv = pc.addTransceiver(ecSendV() || 'video', { direction: 'sendrecv' });
  }
  pc.ontrack = (e) => { if (!p.stream.getTracks().includes(e.track)) p.stream.addTrack(e.track); ecPaint(); };
  pc.onicecandidate = (e) => { if (e.candidate) ecSend(id, { t: 'ice', c: e.candidate.toJSON() }); };
  pc.onnegotiationneeded = async () => {
    try { p.makingOffer = true; await pc.setLocalDescription(); ecSend(id, { t: 'sdp', d: pc.localDescription.toJSON() }); }
    catch (_) {} finally { p.makingOffer = false; }
  };
  pc.onconnectionstatechange = () => { if (pc.connectionState === 'failed' && initiator) pc.restartIce(); ecPaint(); };
  return p;
}
function ecSend(to, obj) { if (ec) push(ref(db, 'ecall/' + ec.id + '/sig/' + to), { from: uid, d: JSON.stringify(obj) }).catch(() => {}); }
function ecOnSignal(s) {
  const m = s.val(); remove(s.ref).catch(() => {});
  if (!ec || !m || m.from === uid) return;
  let d; try { d = JSON.parse(m.d); } catch (_) { return; }
  const p = ecPeer(m.from);
  p.chain = p.chain.then(async () => {
    const pc = p.pc;
    if (d.t === 'sdp') {
      const collision = d.d.type === 'offer' && (p.makingOffer || pc.signalingState !== 'stable');
      p.ignoreOffer = !p.polite && collision;
      if (p.ignoreOffer) return;
      await pc.setRemoteDescription(d.d);
      if (d.d.type === 'offer') {
        pc.getTransceivers().forEach((t) => {
          const k = t.receiver.track && t.receiver.track.kind;
          if (k === 'audio') { p.ta = t; t.sender.replaceTrack(ec.audio).catch(() => {}); t.direction = 'sendrecv'; }
          if (k === 'video') { p.tv = t; t.sender.replaceTrack(ecSendV()).catch(() => {}); t.direction = 'sendrecv'; }
        });
        await pc.setLocalDescription();
        ecSend(p.id, { t: 'sdp', d: pc.localDescription.toJSON() });
      }
    } else if (d.t === 'ice') { try { await pc.addIceCandidate(d.c); } catch (_) {} }
  }).catch(() => {});
}
function ecPushVideo() { if (ec) ec.peers.forEach((p) => { if (p.tv) p.tv.sender.replaceTrack(ecSendV()).catch(() => {}); }); }
async function ecToggleMic() {
  if (!ec) return;
  if (!ec.audio) { ec.audio = await ecMedia(); if (!ec.audio) { toast('Microphone is blocked'); return; } ec.peers.forEach((p) => p.ta && p.ta.sender.replaceTrack(ec.audio).catch(() => {})); ec.mic = true; }
  else ec.mic = !ec.mic;
  ec.audio.enabled = ec.mic;
  if (ec.mic && ec.deaf) ecToggleDeaf();
  update(ref(db, 'ecall/' + ec.id + '/members/' + uid), { mic: ec.mic }).catch(() => {});
  ecPaint();
}
async function ecToggleCam() {
  if (!ec) return;
  if (!ec.cam) {
    const v = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 720 } } }).then((s) => s.getVideoTracks()[0]).catch(() => null);
    if (!v) { toast('Camera is blocked'); return; }
    ec.video = v; ec.cam = true;
  } else { if (ec.video) ec.video.stop(); ec.video = null; ec.cam = false; }
  ecPushVideo();
  update(ref(db, 'ecall/' + ec.id + '/members/' + uid), { cam: ec.cam }).catch(() => {});
  ecPaint();
}
async function ecToggleScreen() {
  if (!ec) return;
  if (ec.screen) { ec.screen.stop(); ec.screen = null; }
  else {
    const s = await navigator.mediaDevices.getDisplayMedia({ video: true }).then((x) => x.getVideoTracks()[0]).catch(() => null);
    if (!s) return;
    ec.screen = s; s.onended = () => { if (ec && ec.screen === s) { ec.screen = null; ecPushVideo(); ecPaint(); } };
  }
  ecPushVideo();
  update(ref(db, 'ecall/' + ec.id + '/members/' + uid), { cam: !!(ec.cam || ec.screen) }).catch(() => {});
  ecPaint();
}
function ecToggleDeaf() {
  if (!ec) return;
  ec.deaf = !ec.deaf;
  if (ec.deaf && ec.mic && ec.audio) { ec.mic = false; ec.audio.enabled = false; ec.deafMuted = true; }
  else if (!ec.deaf && ec.deafMuted && ec.audio) { ec.mic = true; ec.audio.enabled = true; ec.deafMuted = false; }
  update(ref(db, 'ecall/' + ec.id + '/members/' + uid), { mic: ec.mic, deaf: ec.deaf }).catch(() => {});
  ecPaint();
}
function ecHangup() {
  if (!ec) return;
  const id = ec.id;
  ec.ringRefs.forEach((r) => remove(r).catch(() => {}));
  remove(ref(db, 'ecall/' + id + '/members/' + uid)).catch(() => {});
  ecCleanup('left');
  setTimeout(() => remove(ref(db, 'ecall/' + id)).catch(() => {}), 400);
}
function ecCleanup() {
  if (!ec) return;
  clearTimeout(ec.ringTimer); clearInterval(ec.tick);
  ec.unsubs.forEach((f) => { try { f(); } catch (_) {} });
  ec.peers.forEach((p) => { try { p.pc.close(); } catch (_) {} });
  [ec.audio, ec.video, ec.screen].forEach((t) => { try { t && t.stop(); } catch (_) {} });
  ec = null;
  $('ecall').classList.remove('on', 'max');
  $('ec-stage').innerHTML = '';
  meetingHold(false);
  presenceTick();
}
 
function ecShow() {
  const w = $('ecall');
  w.classList.add('on');
  const pos = store.get('em-ecpos', null);
  if (pos && !w.classList.contains('max')) { w.style.left = Math.max(8, Math.min(innerWidth - w.offsetWidth - 8, pos.x)) + 'px'; w.style.top = Math.max(8, Math.min(innerHeight - w.offsetHeight - 8, pos.y)) + 'px'; w.style.right = 'auto'; }
  clearInterval(ec.tick);
  ec.tick = setInterval(() => { if (ec && ec.start) $('ec-time').textContent = fmtDur(Date.now() - ec.start); }, 1000);
  ecPaint();
}
function ecPaint() {
  if (!ec) return;
  const others = Object.keys(ec.members).filter((k) => k !== uid);
  const waiting = !ec.start;
  const title = ec.kind === 'group' ? (ec.title || 'Group call') : nameOf(others[0] || ec.targets[0] || uid);
  $('ec-title').textContent = title;
  if (waiting) $('ec-time').textContent = ec.outgoing ? 'Ringing…' : 'Connecting…';
  $('ec-ring').classList.toggle('on', waiting);
  if (waiting) {
    const t = ec.kind === 'group' ? null : (others[0] || ec.targets[0]);
    $('ec-ring-av').innerHTML = t ? avatarHTML(t, nameOf(t)) : '<div class="avatar ec-gav" style="--c:' + esc((groups[ec.gid] && groups[ec.gid].color) || '#6366f1') + '">' + fa((groups[ec.gid] && groups[ec.gid].icon) || 'users') + '</div>';
    $('ec-ring-t').textContent = ec.outgoing ? 'Calling ' + title + '…' : 'Joining…';
  }
  const stage = $('ec-stage');
  const want = ec.kind === 'dm' ? others.slice(0, 1) : others;
  stage.className = 'ec-stage' + (ec.kind === 'group' ? ' grid n' + Math.min(want.length, 9) : ' one');
  const keep = new Set([...want, uid]);
  stage.querySelectorAll('.ec-tile').forEach((t) => { if (!keep.has(t.dataset.id)) t.remove(); });
  [...want, uid].forEach((id) => {
    let t = stage.querySelector('.ec-tile[data-id="' + id + '"]');
    if (!t) {
      t = document.createElement('div'); t.className = 'ec-tile'; t.dataset.id = id;
      t.innerHTML = '<video autoplay playsinline></video><div class="ec-ph"></div><div class="ec-nm"></div>';
      stage.appendChild(t);
    }
    const m = ec.members[id] || {}, self = id === uid, v = t.querySelector('video');
    t.classList.toggle('self', self);
    const stream = self ? (ecSendV() ? new MediaStream([ecSendV()]) : null) : (ec.peers.get(id) || {}).stream;
    if (v.srcObject !== stream && !(self && v.srcObject && stream && v.srcObject.getVideoTracks()[0] === stream.getVideoTracks()[0])) v.srcObject = stream || null;
    v.muted = self || ec.deaf;
    const camOn = self ? !!ecSendV() : !!m.cam;
    t.classList.toggle('nocam', !camOn);
    t.querySelector('.ec-ph').innerHTML = avatarHTML(id, m.name || nameOf(id));
    t.querySelector('.ec-nm').innerHTML = (m.mic === false ? fa('microphone-slash') + ' ' : '') + (m.deaf ? fa('ear-deaf') + ' ' : '') + esc(self ? 'You' : (m.name || nameOf(id)));
    const p = ec.peers.get(id);
    t.classList.toggle('connecting', !self && !!p && p.pc.connectionState !== 'connected');
  });
  const setBtn = (bid, on, iOn, iOff) => { const b = $(bid); b.classList.toggle('off', !on); b.innerHTML = fa(on ? iOn : iOff); };
  setBtn('ec-mic', ec.mic, 'microphone', 'microphone-slash');
  setBtn('ec-cam', ec.cam, 'video', 'video-slash');
  $('ec-deaf').classList.toggle('off', ec.deaf); $('ec-deaf').innerHTML = fa(ec.deaf ? 'ear-deaf' : 'headphones');
  $('ec-screen').classList.toggle('on', !!ec.screen);
}
$('ec-mic').onclick = ecToggleMic; $('ec-cam').onclick = ecToggleCam; $('ec-deaf').onclick = ecToggleDeaf; $('ec-screen').onclick = ecToggleScreen; $('ec-hang').onclick = ecHangup;
$('ec-max').onclick = () => { const w = $('ecall'); w.classList.toggle('max'); $('ec-max').innerHTML = fa(w.classList.contains('max') ? 'compress' : 'expand'); };
(() => {
  const w = $('ecall'), h = $('ec-head');
  h.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button') || w.classList.contains('max')) return;
    const r = w.getBoundingClientRect(), ox = e.clientX - r.left, oy = e.clientY - r.top;
    w.classList.add('drag');
    const mv = (ev) => { w.style.right = 'auto'; w.style.left = Math.max(4, Math.min(innerWidth - r.width - 4, ev.clientX - ox)) + 'px'; w.style.top = Math.max(4, Math.min(innerHeight - r.height - 4, ev.clientY - oy)) + 'px'; };
    const up = () => { w.classList.remove('drag'); removeEventListener('pointermove', mv); removeEventListener('pointerup', up); store.set('em-ecpos', { x: parseInt(w.style.left), y: parseInt(w.style.top) }); };
    addEventListener('pointermove', mv); addEventListener('pointerup', up);
  });
  $('ec-resize').addEventListener('pointerdown', (e) => {
    e.preventDefault();
    const r = w.getBoundingClientRect(), sx = e.clientX, sy = e.clientY;
    const mv = (ev) => { w.style.width = Math.max(260, Math.min(innerWidth - 16, r.width + ev.clientX - sx)) + 'px'; w.style.height = Math.max(220, Math.min(innerHeight - 16, r.height + ev.clientY - sy)) + 'px'; };
    const up = () => { removeEventListener('pointermove', mv); removeEventListener('pointerup', up); };
    addEventListener('pointermove', mv); addEventListener('pointerup', up);
  });
})();
 
let ringing = null;
function incomingCall(from, v) {
  if (!v || !v.call || v.ans || Date.now() - (v.at || 0) > 45000) return;
  if (!friendSet.has(from) && !(v.title && Object.values(groups).some((g) => g.members.includes(from)))) { remove(ref(db, 'ring/' + uid + '/' + from)).catch(() => {}); return; }
  if (ec && ec.id === v.call) return;
  watchProfile(from);
  stopRinging();
  const p = profiles[from] || {};
  $('ring-av').outerHTML = avatarHTML(from, p.name || v.name).replace('class="avatar', 'id="ring-av" class="avatar big');
  $('ring-name').textContent = v.title ? (p.name || v.name) + ' · ' + v.title : (p.name || v.name);
  $('ring-sub').textContent = (v.title ? 'Group EchoCall' : 'EchoCall') + (joined ? ' · you’ll be put on hold in the meeting' : '');
  $('ring').classList.add('on');
  const tone = () => { [0, 0.18].forEach((d, i) => setTimeout(() => { try { const ac = beep.ac || (beep.ac = new AudioContext()); const o = ac.createOscillator(), g = ac.createGain(); o.frequency.value = i ? 660 : 880; g.gain.setValueAtTime(0.0001, ac.currentTime); g.gain.exponentialRampToValueAtTime(0.12, ac.currentTime + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.35); o.connect(g).connect(ac.destination); o.start(); o.stop(ac.currentTime + 0.4); } catch (_) {} }, d * 1000)); };
  tone();
  const n = notify((p.name || v.name) + ' is calling', v.title ? 'Group EchoCall · ' + v.title : 'EchoCall', 'ring-' + from, () => {}, true);
  ringing = { from, call: v.call, title: v.title, n, iv: setInterval(tone, 2200), t: setTimeout(stopRinging, 40000) };
}
function stopRinging() { if (!ringing) return; clearInterval(ringing.iv); clearTimeout(ringing.t); try { ringing.n && ringing.n.close(); } catch (_) {} ringing = null; $('ring').classList.remove('on'); }
$('ring-yes').onclick = async () => {
  if (!ringing) return;
  const { from, call, title } = ringing; stopRinging();
  remove(ref(db, 'ring/' + uid + '/' + from)).catch(() => {});
  if (ec) ecHangup();
  closeFriends();
  if (joined) meetingHold(true);
  const s = await get(ref(db, 'ecall/' + call)).catch(() => null);
  const v = s && s.val();
  if (!v) { toast('That call already ended'); meetingHold(false); return; }
  ecJoin(call, { kind: v.kind, gid: v.gid, title: v.title || title });
};
$('ring-no').onclick = () => {
  if (!ringing) return;
  const from = ringing.from; stopRinging();
  update(ref(db, 'ring/' + uid + '/' + from), { ans: 'no' }).catch(() => {});
};
function afterJoin() { presenceTick(); if (ec) meetingHold(true); }

 
let meDeaf = false, deafMic = false, held = null;
function setDeaf(on, quiet) {
  if (on === meDeaf) return;
  meDeaf = on;
  if (on) { deafMic = me.mic; if (me.mic) setMic(false); }
  else if (deafMic && !held) setMic(true);
  tiles.forEach((t, id) => { if (id !== uid) t.video.muted = meDeaf || localMuted.has(id) || !sameRoom(id); });
  if (joined) update(R('members/' + uid), { deaf: meDeaf }).catch(() => {});
  $('c-deaf').classList.toggle('off', meDeaf);
  $('c-deaf').innerHTML = fa(meDeaf ? 'ear-deaf' : 'headphones');
  if (!quiet) toast(meDeaf ? 'Deafened: you can’t hear anyone and your mic is off' : 'Undeafened');
}
$('c-deaf').onclick = () => { if (held) { toast('You’re on an EchoCall. Hang up to come back'); return; } if (cooldown('mic')) setDeaf(!meDeaf); };
function meetingHold(on) {
  if (on && !held && joined) {
    held = { mic: me.mic, deaf: meDeaf };
    setDeaf(true, true);
    eachPeerSender('video', null);
    update(R('members/' + uid), { oncall: true }).catch(() => {});
    paintSelfTile();
    toast('You’re on hold in this meeting while you’re on the EchoCall');
  } else if (!on && held) {
    const h = held; held = null;
    if (joined) {
      update(R('members/' + uid), { oncall: false }).catch(() => {});
      setDeaf(h.deaf, true);
      if (h.mic && !me.mic) setMic(true);
      eachPeerSender('video', videoTrack());
      paintSelfTile();
      toast('Back in the meeting');
    }
  }
}

 
const groups = {};
let groupOpen = null, groupUnsub = null;
const G_ICONS = ['users', 'gamepad', 'book', 'music', 'star', 'heart', 'bolt', 'fire', 'basketball', 'code', 'pizza-slice', 'ghost'];
const G_COLS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#06b6d4', '#334155'];
function groupAv(g) { return '<div class="avatar gav" style="--c:' + esc(g.color || '#6366f1') + '">' + fa(G_ICONS.includes(g.icon) ? g.icon : 'users') + '</div>'; }
function startGroups() {
  if (!isAccount()) return;
  F.onSnapshot(F.query(F.collection(fsdb, 'groups'), F.where('members', 'array-contains', uid)), (qs) => {
    qs.docChanges().forEach((c) => {
      const v = c.doc.data(), prev = groups[c.doc.id];
      if (c.type === 'removed') { delete groups[c.doc.id]; return; }
      groups[c.doc.id] = v;
      v.members.forEach(watchProfile);
      if (prev && v.lastAt > prev.lastAt && v.lastBy !== uid && groupOpen !== c.doc.id) {
        beep();
        toast(v.name + ' · ' + nameOf(v.lastBy) + ': ' + String(v.last || '').slice(0, 60), { label: 'Open', fn: () => openGroup(c.doc.id) }, 7000);
        notify(v.name, nameOf(v.lastBy) + ': ' + String(v.last || '').slice(0, 120), 'g-' + c.doc.id, () => openGroup(c.doc.id));
      }
    });
    if (groupOpen && groups[groupOpen]) paintGroupHead(groupOpen);
    if (groupOpen && !groups[groupOpen]) { closeGroup(); openFriends('chats'); }
    paintFriends();
  }, (e) => console.warn('[meet] groups', e.code));
}
const gSeen = store.get('em-gseen', {});
const groupUnread = (gid) => { const g = groups[gid]; return !!(g && g.lastBy && g.lastBy !== uid && g.lastAt > (gSeen[gid] || 0)); };
function chatRowsHTML() {
  const rows = [];
  Object.entries(dmDocs).filter(([, v]) => v.lastAt).forEach(([pair, v]) => rows.push({ at: v.lastAt, html: (() => {
    const o = v.users.find((u) => u !== uid), un = unreadPair(pair);
    return '<div class="fr-row chat' + (un ? ' unread' : '') + '" data-dm="' + esc(o) + '">' + avStatus(o, nameOf(o)) +
      '<div class="fr-t"><b>' + esc(nameOf(o)) + '<span class="fr-time">' + ago(v.lastAt) + '</span></b><em>' + (v.lastBy === uid ? 'You: ' : '') + esc(v.last || '') + '</em></div>' + (un ? '<i class="fr-dot big"></i>' : '') + '</div>';
  })() }));
  Object.entries(groups).forEach(([gid, g]) => rows.push({ at: g.lastAt || g.at || 0, html: '<div class="fr-row chat' + (groupUnread(gid) ? ' unread' : '') + '" data-group="' + esc(gid) + '">' + groupAv(g) +
    '<div class="fr-t"><b>' + esc(g.name) + '<span class="fr-time">' + ago(g.lastAt || g.at || Date.now()) + '</span></b><em>' + (g.lastBy ? (g.lastBy === uid ? 'You' : esc(nameOf(g.lastBy))) + ': ' : '') + esc(g.last || g.members.length + ' members') + '</em></div>' + (groupUnread(gid) ? '<i class="fr-dot big"></i>' : '') + '</div>' }));
  rows.sort((a, b) => b.at - a.at);
  return '<button class="fr-newg" type="button" id="fr-newg">' + fa('users') + ' New group</button>' +
    (rows.length ? rows.map((r) => r.html).join('') : '<div class="fr-empty"><span>' + fa('comments') + '</span><b>No chats yet</b><p>Message a friend or start a group. Chats are saved, so they’re still here next time.</p></div>');
}
function bindChatRows() {
  const P = $('friends');
  P.querySelectorAll('[data-group]').forEach((r) => { r.onclick = () => openGroup(r.dataset.group); });
  const ng = $('fr-newg'); if (ng) ng.onclick = openNewGroup;
  const nb = $('fr-notif'); if (nb) nb.style.display = 'Notification' in window && Notification.permission === 'default' ? '' : 'none';
}
 
function paintGroupHead(gid) {
  const g = groups[gid]; if (!g) return;
  const online = g.members.filter((u) => u !== uid && presence[u]).length;
  $('dm-who').innerHTML = groupAv(g) + '<div><b>' + esc(g.name) + '</b><em>' + g.members.length + ' members' + (online ? ' · ' + online + ' online' : '') + '</em></div>';
  $('dm-who').onclick = () => openGroupInfo(gid);
}
function openGroup(gid) {
  if (!groups[gid]) return;
  closeDM(); closeGroup();
  $('friends').classList.add('on'); $('fr-home').classList.remove('on'); $('fr-dm').classList.add('on');
  groupOpen = gid;
  groups[gid].members.forEach(watchPresence);
  paintGroupHead(gid);
  $('dm-call').onclick = () => callGroup(gid);
  $('dm-list').innerHTML = '<p class="rooms-note">Loading…</p>';
  groupUnsub = F.onSnapshot(F.query(F.collection(fsdb, 'groups', gid, 'msgs'), F.orderBy('at'), F.limitToLast(200)), (qs) => {
    const L = $('dm-list'), atBottom = L.scrollHeight - L.scrollTop - L.clientHeight < 80;
    L.innerHTML = qs.empty ? '<div class="fr-empty"><span>' + fa('users') + '</span><b>' + esc(groups[gid] ? groups[gid].name : '') + '</b><p>Say something to the group.</p></div>' : '';
    let lastDay = '', lastFrom = '', lastAt = 0;
    qs.forEach((d) => {
      const v = d.data(), dt = new Date(v.at), day = dt.toDateString();
      if (day !== lastDay) { const sep = document.createElement('div'); sep.className = 'dm-day'; sep.textContent = day === new Date().toDateString() ? 'Today' : dt.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }); L.appendChild(sep); lastDay = day; lastFrom = ''; }
      const grouped = v.from === lastFrom && v.at - lastAt < 120000;
      const el = document.createElement('div');
      el.className = 'dm-m' + (v.from === uid ? ' me' : '') + (grouped ? ' grp' : '');
      if (!grouped && v.from !== uid) { const n = document.createElement('b'); n.className = 'dm-from'; n.textContent = nameOf(v.from); el.appendChild(n); }
      if (v.img) { const im = document.createElement('img'); im.src = v.img; im.className = 'dm-img'; im.onclick = () => openViewer({ url: v.img, name: 'picture.jpg', type: 'image/jpeg' }); el.appendChild(im); }
      if (v.text) { const t = document.createElement('p'); t.textContent = v.text; el.appendChild(t); }
      const tm = document.createElement('span'); tm.textContent = dt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }); el.appendChild(tm);
      L.appendChild(el); lastFrom = v.from; lastAt = v.at;
    });
    if (atBottom || qs.docChanges().some((c) => c.doc.data().from === uid)) L.scrollTop = L.scrollHeight;
    gSeen[gid] = Date.now(); store.set('em-gseen', gSeen); paintFriends();
  }, (e) => { $('dm-list').innerHTML = '<p class="rooms-note">Couldn’t load (' + esc(e.code) + ')</p>'; });
  setTimeout(() => $('in-dm').focus(), 50);
}
function closeGroup() { if (groupUnsub) { groupUnsub(); groupUnsub = null; } groupOpen = null; }
async function sendGroup(gid, text, img) {
  const msg = { from: uid, at: Date.now() };
  if (text) msg.text = text.slice(0, 2000);
  if (img) msg.img = img;
  await F.addDoc(F.collection(fsdb, 'groups', gid, 'msgs'), msg);
  F.updateDoc(F.doc(fsdb, 'groups', gid), { last: text ? text.slice(0, 120) : '📷 Picture', lastAt: msg.at, lastBy: uid }).catch(() => {});
}
$('form-dm').onsubmit = (e) => {
  e.preventDefault();
  const t = $('in-dm').value.trim();
  if (!t || !cooldown('dm')) return;
  if (groupOpen) { $('in-dm').value = ''; sendGroup(groupOpen, t).catch((er) => toast('Message not sent (' + er.code + ')')); return; }
  const o = dmOther(); if (!o) return;
  $('in-dm').value = '';
  sendDM(o, t).catch((er) => toast('Message not sent (' + er.code + ')'));
};
$('dm-file').onchange = async () => {
  const f = $('dm-file').files[0]; $('dm-file').value = '';
  if (!f) return;
  try {
    const d = await shrinkImage(f, 1280, 0.8); if (d.length > 700000) throw 0;
    if (groupOpen) await sendGroup(groupOpen, '', d); else if (dmOther()) await sendDM(dmOther(), '', d);
  } catch (_) { toast('That picture couldn’t be sent'); }
};
$('in-dm').addEventListener('paste', async (e) => {
  if (!groupOpen) return;
  const f = [...(e.clipboardData && e.clipboardData.files || [])].find((x) => /^image\//.test(x.type));
  if (!f) return;
  e.preventDefault();
  try { const d = await shrinkImage(f, 1280, 0.8); if (d.length > 700000) throw 0; await sendGroup(groupOpen, '', d); } catch (_) { toast('That picture couldn’t be sent'); }
});
$('dm-back').addEventListener('click', () => closeGroup());
 
let ngIcon = 'users', ngColor = G_COLS[0], ngEdit = null;
function openNewGroup(edit) {
  ngEdit = typeof edit === 'string' ? edit : null;
  const g = ngEdit && groups[ngEdit];
  ngIcon = g ? g.icon : 'users'; ngColor = g ? g.color : G_COLS[0];
  $('ng-title').textContent = g ? 'Edit group' : 'New group';
  $('ng-name').value = g ? g.name : '';
  $('ng-err').textContent = '';
  $('ng-go').textContent = g ? 'Save' : 'Create group';
  const inGroup = new Set(g ? g.members : []);
  const fr = [...friendSet].sort((a, b) => nameOf(a).localeCompare(nameOf(b)));
  $('ng-people').innerHTML = fr.length ? fr.map((id) => '<label class="ng-p">' + avatarHTML(id, nameOf(id)) + '<span>' + esc(nameOf(id)) + '</span><input type="checkbox" value="' + esc(id) + '"' + (inGroup.has(id) ? ' checked' : '') + '><i></i></label>').join('') : '<p class="rooms-note">Add some friends first.</p>';
  paintNg();
  $('group-modal').classList.add('on');
  setTimeout(() => $('ng-name').focus(), 50);
}
function paintNg() {
  $('ng-icons').innerHTML = G_ICONS.map((i) => '<button type="button" data-i="' + i + '"' + (i === ngIcon ? ' class="on"' : '') + ' style="--c:' + ngColor + '">' + fa(i) + '</button>').join('');
  $('ng-cols').innerHTML = G_COLS.map((c) => '<button type="button" data-c="' + c + '" style="--c:' + c + '"' + (c === ngColor ? ' class="on"' : '') + '></button>').join('');
  $('ng-icons').querySelectorAll('[data-i]').forEach((b) => { b.onclick = () => { ngIcon = b.dataset.i; paintNg(); }; });
  $('ng-cols').querySelectorAll('[data-c]').forEach((b) => { b.onclick = () => { ngColor = b.dataset.c; paintNg(); }; });
}
$('ng-x').onclick = () => $('group-modal').classList.remove('on');
$('form-ng').onsubmit = async (e) => {
  e.preventDefault();
  const name = $('ng-name').value.trim().slice(0, 40);
  const picked = [...$('ng-people').querySelectorAll('input:checked')].map((i) => i.value);
  if (!name) { $('ng-err').textContent = 'Give the group a name'; return; }
  if (!ngEdit && !picked.length) { $('ng-err').textContent = 'Pick at least one friend'; return; }
  if (picked.length > 11) { $('ng-err').textContent = 'Groups can have up to 12 people'; return; }
  try {
    if (ngEdit) {
      const g = groups[ngEdit];
      const keep = g.members.filter((u) => u === uid || !friendSet.has(u) || picked.includes(u));
      const members = [...new Set([...keep, ...picked])];
      await F.updateDoc(F.doc(fsdb, 'groups', ngEdit), { name, icon: ngIcon, color: ngColor, members });
    } else {
      const d = await F.addDoc(F.collection(fsdb, 'groups'), { name, icon: ngIcon, color: ngColor, owner: uid, members: [uid, ...picked], at: Date.now(), lastAt: Date.now(), last: 'Group created', lastBy: uid });
      $('group-modal').classList.remove('on');
      setTimeout(() => openGroup(d.id), 400);
      return;
    }
    $('group-modal').classList.remove('on');
  } catch (er) { $('ng-err').textContent = 'Couldn’t save (' + er.code + ')'; }
};
function openGroupInfo(gid) {
  const g = groups[gid]; if (!g) return;
  const acts = [{ icon: IC.shield, label: 'Edit group', fn: () => openNewGroup(gid) }];
  acts.push({ icon: IC.kick, label: 'Leave group', bad: true, fn: () => { if (confirm('Leave ' + g.name + '?')) F.updateDoc(F.doc(fsdb, 'groups', gid), { members: g.members.filter((u) => u !== uid) }).then(() => { closeGroup(); openFriends('chats'); }, () => toast('Couldn’t leave')); } });
  const card = document.createElement('div');
  card.className = 'pm-card';
  card.innerHTML = '<div class="pm-head">' + groupAv(g) + '<div class="pm-who"><b></b><em>' + g.members.length + ' members</em></div></div><div class="gi-list">' +
    g.members.map((u) => '<div class="gi-m">' + avatarHTML(u, nameOf(u)) + '<span>' + esc(u === uid ? 'You' : nameOf(u)) + (u === g.owner ? ' · owner' : '') + '</span></div>').join('') + '</div>';
  card.querySelector('.pm-who b').textContent = g.name;
  openMenu($('dm-who'), [{ el: card }, ...acts]);
}

 
function notify(title, body, tag, onclick, sticky) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return null;
  if (document.hasFocus() && !sticky) return null;
  try {
    const n = new Notification(title, { body, tag, renotify: true, requireInteraction: !!sticky, icon: document.querySelector('link[rel=icon]') ? document.querySelector('link[rel=icon]').href : undefined });
    n.onclick = () => { try { focus(); } catch (_) {} n.close(); if (onclick) onclick(); };
    return n;
  } catch (_) { return null; }
}
$('fr-notif-go').onclick = async () => {
  try { const r = await Notification.requestPermission(); toast(r === 'granted' ? 'Notifications on' : 'Notifications are blocked. You can allow them in the address bar'); } catch (_) {}
  $('fr-notif').style.display = 'none';
};
$('fr-notif-x').onclick = () => { $('fr-notif').style.display = 'none'; };

 
let bgm = null, bgmAudio = null, bgmCur = null, bgmVol = store.get('em-bgmvol', 0.5), bgmMuted = store.get('em-bgmmute', false), srvOff = 0;
const bgmAsked = {}, bgmTries = {};
function bgmGiveUp(tr) {
  $('bgm-sub').textContent = 'Song unavailable';
  if (!bgmDriver() || bgmGiveUp.at === tr.id) return;
  bgmGiveUp.at = tr.id;
  toast('Nobody in the meeting has “' + tr.n + '” any more, so it was taken off the list');
  bgmRemove(bgm.idx || 0);
  if (bgm && bgm.queue && bgm.queue.length > 1) setTimeout(() => bgmSet({ playing: true, pos: 0, at: srvNow() }), 300);
}
onValue(ref(db, '.info/serverTimeOffset'), (s) => { srvOff = s.val() || 0; });
const srvNow = () => Date.now() + srvOff;
const canBgm = () => isMod || isOwner(uid);
const bgmTrack = () => (bgm && bgm.queue && bgm.queue[bgm.idx || 0]) || null;
const bgmExpected = () => (bgm ? (bgm.pos || 0) + (bgm.playing ? Math.max(0, srvNow() - (bgm.at || 0)) / 1000 : 0) : 0);
const fmtT = (s) => { s = Math.max(0, Math.floor(s || 0)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
function bgmChanged(v) { bgm = v; bgmApply(); paintBgm(); }
function bgmGot(id) { if (bgm && bgmTrack() && bgmTrack().id === id) { bgmApply(); paintBgm(); } }
 
const BGM_BASE = 0.45, BGM_TARGET = 0.07;
let bgmG = null, bgmDuck = 1;
function bgmGraph() {
  if (bgmG || !bgmAudio) return;
  try {
    const ctx = new AudioContext(), src = ctx.createMediaElementSource(bgmAudio), an = ctx.createAnalyser(), g = ctx.createGain();
    an.fftSize = 1024; src.connect(an); an.connect(g).connect(ctx.destination);
    bgmG = { ctx, g, an, buf: new Float32Array(1024), avg: BGM_TARGET };
    bgmAudio.volume = 1;
  } catch (_) { bgmG = null; }
}
function bgmTarget() {
  if (bgmMuted || (typeof meDeaf !== 'undefined' && meDeaf)) return 0;
  const norm = bgmG ? Math.max(0.2, Math.min(2.5, BGM_TARGET / Math.max(0.005, bgmG.avg))) : 1;
  return bgmVol * BGM_BASE * norm * bgmDuck;
}
function bgmVolApply() {
  if (!bgmAudio) return;
  bgmGraph();
  const v = bgmTarget();
  if (bgmG) {
    if (bgmG.ctx.state === 'suspended') bgmG.ctx.resume().catch(() => {});
    bgmG.g.gain.setTargetAtTime(v, bgmG.ctx.currentTime, bgmDuck < 1 ? 0.08 : 0.5);
    bgmAudio.muted = false;
  } else { bgmAudio.volume = Math.max(0, Math.min(1, v)); bgmAudio.muted = v === 0; }
}
function bgmAdapt() {
  if (!bgmAudio || bgmAudio.paused) return;
  if (bgmG) {
    bgmG.an.getFloatTimeDomainData(bgmG.buf);
    let s = 0; for (let i = 0; i < bgmG.buf.length; i += 4) s += bgmG.buf[i] * bgmG.buf[i];
    const rms = Math.sqrt(s / (bgmG.buf.length / 4));
    if (rms > 0.004) bgmG.avg = bgmG.avg * 0.985 + rms * 0.015;
  }
  let talking = false, loud = 0;
  meters.forEach((m, id) => { const on = id === uid ? me.mic : (members[id] && members[id].mic); if (on && m.hold > 0) { talking = true; loud = Math.max(loud, m.lv || 0); } });
  bgmDuck = talking ? Math.max(0.12, 0.35 - loud * 0.25) : 1;
  bgmVolApply();
}
function bgmApply() {
  const tr = bgmTrack();
  if (!joined || !tr) { if (bgmAudio) bgmAudio.pause(); bgmCur = bgmCur && !tr ? null : bgmCur; return; }
  const blob = gotFiles.get(tr.id);
  if (!blob) {
    if (!bgmAsked[tr.id]) {
      const cands = [tr.by, ...Object.keys(members).filter((x) => x !== tr.by)].filter((x) => x !== uid && members[x] && !members[x].ghost);
      bgmTries[tr.id] = (bgmTries[tr.id] || 0) + 1;
      if (cands.length) requestFile({ id: tr.id, n: tr.n, s: tr.s, t: tr.t }, cands[(bgmTries[tr.id] - 1) % cands.length]);
      bgmAsked[tr.id] = Date.now();
      if (bgmTries[tr.id] > Math.max(3, cands.length * 2)) bgmGiveUp(tr);
    }
    if (bgmAudio) bgmAudio.pause();
    return;
  }
  if (!bgmAudio) { bgmAudio = new Audio(); bgmAudio.preload = 'auto'; bgmAudio.onended = bgmEnded; }
  if (bgmCur !== tr.id) { if (bgmAudio.src) URL.revokeObjectURL(bgmAudio.src); bgmAudio.src = URL.createObjectURL(blob); bgmCur = tr.id; }
  bgmAudio.loop = false;
  bgmVolApply();
  const seek = () => { const want = bgmExpected(); if (Math.abs(bgmAudio.currentTime - want) > 0.35) { try { bgmAudio.currentTime = Math.min(want, (bgmAudio.duration || want + 1) - 0.05); } catch (_) {} } };
  if (bgmAudio.readyState >= 1) seek(); else bgmAudio.onloadedmetadata = seek;
  if (bgm.playing) bgmAudio.play().catch(() => toast('Tap anywhere to hear the background music', null, 3000));
  else bgmAudio.pause();
}
setInterval(() => {
  const pend = joined && bgmTrack();
  if (pend && !gotFiles.has(pend.id) && Date.now() - (bgmAsked[pend.id] || 0) > 3000) { bgmAsked[pend.id] = 0; bgmApply(); }
  if (!joined || !bgm || !bgm.playing || !bgmAudio || bgmCur !== (bgmTrack() || {}).id) return;
  const want = bgmExpected();
  if (bgmAudio.duration && want < bgmAudio.duration - 0.5 && Math.abs(bgmAudio.currentTime - want) > 0.35) { try { bgmAudio.currentTime = want; } catch (_) {} }
  if (bgmAudio.paused) bgmAudio.play().catch(() => {});
  bgmVolApply();
  paintBgmTime();
}, 1000);
addEventListener('pointerdown', () => { if (joined && bgm && bgm.playing && bgmAudio && bgmAudio.paused) bgmAudio.play().catch(() => {}); });
function bgmDriver() {
  if (!bgm || !canBgm()) return false;
  if (bgm.by === uid) return true;
  if (members[bgm.by] && (mods[bgm.by] || isOwner(bgm.by))) return false;
  const ms = Object.keys(members).filter((id) => mods[id] || isOwner(id)).sort();
  return ms[0] === uid;
}
function bgmEnded() {
  if (!bgmDriver()) return;
  const q = bgm.queue || [], i = bgm.idx || 0;
  if (bgm.loop === 'one') bgmSet({ pos: 0, at: srvNow(), playing: true });
  else if (i + 1 < q.length) bgmSet({ idx: i + 1, pos: 0, at: srvNow(), playing: true });
  else if (bgm.loop === 'all' && q.length) bgmSet({ idx: 0, pos: 0, at: srvNow(), playing: true });
  else bgmSet({ playing: false, pos: 0, at: srvNow() });
}
function bgmSet(o) {
  if (!canBgm()) return;
  update(R('bgm'), Object.assign({ by: uid }, o)).catch((e) => toast('Music: ' + (e.code || 'error')));
}
const bgmPlay = (idx) => bgmSet({ idx: idx == null ? (bgm && bgm.idx) || 0 : idx, playing: true, pos: idx == null ? bgmExpected() : 0, at: srvNow() });
const bgmPause = () => bgmSet({ playing: false, pos: bgmExpected(), at: srvNow() });
const bgmStop = () => bgmSet({ playing: false, pos: 0, at: srvNow() });
const bgmSkip = (d) => { const q = (bgm && bgm.queue) || []; if (!q.length) return; bgmSet({ idx: ((bgm.idx || 0) + d + q.length) % q.length, pos: 0, at: srvNow(), playing: true }); };
const bgmLoop = () => bgmSet({ loop: !bgm || !bgm.loop ? 'all' : bgm.loop === 'all' ? 'one' : false });
async function bgmAdd(files) {
  if (!canBgm()) return;
  const add = [];
  for (const f of files) {
    if (!/^audio\//.test(f.type) && !/\.(mp3|wav|ogg|m4a|aac|flac|webm)$/i.test(f.name)) { toast(f.name + ' isn’t an audio file'); continue; }
    if (f.size > 40 * 1048576) { toast(f.name + ' is over 40 MB'); continue; }
    const id = 'bgm' + push(R('bgm')).key;
    myFiles.set(id, f); gotFiles.set(id, f);
    const dur = await new Promise((r) => { const a = new Audio(); a.preload = 'metadata'; a.onloadedmetadata = () => r(Math.round(a.duration) || 0); a.onerror = () => r(0); a.src = URL.createObjectURL(f); });
    add.push({ id, n: String(f.name).replace(/\.[a-z0-9]+$/i, '').slice(0, 100), s: f.size, t: String(f.type || 'audio/mpeg').slice(0, 60), by: uid, dur });
  }
  if (!add.length) return;
  const old = (bgm && bgm.queue) || [], q = old.concat(add).slice(0, 30);
  if (!bgm || !bgm.playing) bgmSet({ queue: q, idx: Math.min(old.length, q.length - 1), playing: true, pos: 0, at: srvNow(), loop: (bgm && bgm.loop) || false });
  else bgmSet({ queue: q });
  toast(add.length === 1 ? 'Added ' + add[0].n : 'Added ' + add.length + ' songs');
}
function bgmRemove(i) {
  const q = ((bgm && bgm.queue) || []).slice(); q.splice(i, 1);
  const cur = bgm.idx || 0;
  if (!q.length) { set(R('bgm'), null).catch(() => {}); return; }
  if (i < cur) bgmSet({ queue: q, idx: cur - 1 });
  else if (i === cur) bgmSet({ queue: q, idx: Math.min(cur, q.length - 1), pos: 0, at: srvNow() });
  else bgmSet({ queue: q });
}
 
function paintBgmTime() {
  const t = $('bgm-time'); if (!t) return;
  const tr = bgmTrack();
  t.textContent = tr ? fmtT(tr.dur ? Math.min(bgmExpected(), tr.dur) : bgmExpected()) + (tr.dur ? ' / ' + fmtT(tr.dur) : '') : '';
}
function paintBgm() {
  const tr = bgmTrack(), pill = $('bgm-pill');
  pill.classList.toggle('on', !!(joined && tr));
  if (!tr) { if ($('bgm-modal').classList.contains('on')) paintBgmModal(); return; }
  const have = gotFiles.has(tr.id);
  $('bgm-name').textContent = tr.n;
  $('bgm-name').title = tr.n;
  $('bgm-state').innerHTML = !have ? '<i class="fa-solid fa-spinner fa-spin"></i>' : bgm.playing ? '<i class="fa-solid fa-music"></i>' : '<i class="fa-solid fa-pause"></i>';
  $('bgm-sub').textContent = !have ? (bgmTries[tr.id] > 3 ? 'Song unavailable' : 'Getting the song…') : bgm.playing ? 'Background music' : 'Paused';
  $('bgm-vol').value = Math.round(bgmVol * 100);
  $('bgm-vol').style.setProperty('--p', Math.round(bgmVol * 100) + '%');
  $('bgm-mute').innerHTML = '<i class="fa-solid fa-' + (bgmMuted ? 'volume-xmark' : 'volume-high') + '"></i>';
  $('bgm-ctl').style.display = canBgm() ? '' : 'none';
  $('bgm-pp').innerHTML = '<i class="fa-solid fa-' + (bgm.playing ? 'pause' : 'play') + '"></i>';
  paintBgmTime();
  if ($('bgm-modal').classList.contains('on')) paintBgmModal();
}
$('bgm-vol').oninput = () => { bgmVol = $('bgm-vol').value / 100; store.set('em-bgmvol', bgmVol); if (bgmMuted && bgmVol > 0) { bgmMuted = false; store.set('em-bgmmute', false); } bgmVolApply(); paintBgm(); };
$('bgm-mute').onclick = () => { bgmMuted = !bgmMuted; store.set('em-bgmmute', bgmMuted); bgmVolApply(); paintBgm(); };
$('bgm-pp').onclick = () => (bgm && bgm.playing ? bgmPause() : bgmPlay());
$('bgm-next').onclick = () => bgmSkip(1);
$('bgm-open').onclick = () => openBgmModal();
function openBgmModal() { if (!canBgm()) return; paintBgmModal(); $('bgm-modal').classList.add('on'); }
function paintBgmModal() {
  const q = (bgm && bgm.queue) || [], cur = bgm ? bgm.idx || 0 : -1;
  $('bm-list').innerHTML = q.length ? q.map((t, i) => '<div class="bm-row' + (i === cur ? ' cur' : '') + '"><button type="button" class="bm-play" data-play="' + i + '" title="Play this">' +
    (i === cur && bgm.playing ? '<i class="fa-solid fa-volume-high"></i>' : '<span>' + (i + 1) + '</span>') + '</button><div class="bm-t"><b></b><em>' + (t.dur ? fmtT(t.dur) : '') + (t.by !== uid && !members[t.by] ? ' · sender left' : '') + '</em></div>' +
    '<button type="button" class="icon-x" data-rm="' + i + '" title="Remove"><i class="fa-solid fa-xmark"></i></button></div>').join('')
    : '<div class="fr-empty"><span><i class="fa-solid fa-music"></i></span><b>No songs yet</b><p>Add audio files from your computer. They play for everyone in the meeting.</p></div>';
  $('bm-list').querySelectorAll('.bm-t b').forEach((b, i) => { b.textContent = q[i].n; b.title = q[i].n; });
  $('bm-list').querySelectorAll('[data-play]').forEach((b) => { b.onclick = () => bgmPlay(+b.dataset.play); });
  $('bm-list').querySelectorAll('[data-rm]').forEach((b) => { b.onclick = () => bgmRemove(+b.dataset.rm); });
  $('bm-pp').innerHTML = '<i class="fa-solid fa-' + (bgm && bgm.playing ? 'pause' : 'play') + '"></i>';
  const lp = bgm && bgm.loop;
  $('bm-loop').classList.toggle('on', !!lp);
  $('bm-loop').innerHTML = '<i class="fa-solid fa-repeat"></i>' + (lp === 'one' ? '<small>1</small>' : '');
  $('bm-loop').title = lp === 'one' ? 'Repeating this song' : lp === 'all' ? 'Repeating the queue' : 'Repeat off';
}
$('bm-x').onclick = () => $('bgm-modal').classList.remove('on');
$('bgm-modal').addEventListener('mousedown', (e) => { if (e.target.id === 'bgm-modal') $('bgm-modal').classList.remove('on'); });
$('bm-add').onclick = () => $('bm-file').click();
$('bm-file').onchange = () => { bgmAdd([...$('bm-file').files]); $('bm-file').value = ''; };
$('bm-pp').onclick = () => (bgm && bgm.playing ? bgmPause() : bgmPlay());
$('bm-stop').onclick = bgmStop;
$('bm-prev').onclick = () => bgmSkip(-1);
$('bm-next').onclick = () => bgmSkip(1);
$('bm-loop').onclick = bgmLoop;
$('btn-bgm').onclick = openBgmModal;

 
const G_TRUTH = ['What’s the most embarrassing thing you’ve done in class?', 'Who in this call would survive a zombie apocalypse the longest?', 'What’s a song you secretly love?', 'What’s the weirdest food combo you actually like?', 'What’s your most used emoji?', 'What’s the last thing you searched online?', 'Have you ever pretended to be sick to skip something?', 'What’s your biggest pet peeve?', 'What’s a talent nobody here knows you have?', 'What’s the longest you’ve gone without showering?', 'Who was your first celebrity crush?', 'What’s the worst gift you’ve ever gotten?', 'What’s something you’re weirdly scared of?', 'What’s the dumbest way you’ve hurt yourself?', 'If you could swap lives with someone here for a day, who?', 'What’s your most embarrassing nickname?', 'What’s a lie you told that got way out of hand?', 'What app do you spend the most time on?', 'What’s the most childish thing you still do?', 'What’s your guilty-pleasure show?', 'Have you ever laughed at the worst possible moment?', 'What’s the cringiest thing in your camera roll?', 'What would you do with a million dollars tomorrow?', 'What’s one thing you’d change about yourself?', 'What’s the most trouble you’ve ever been in?'];
const G_DARE = ['Talk in an accent for the next 2 rounds', 'Do your best impression of someone in this call', 'Sing the chorus of the last song you listened to', 'Show the last photo in your camera roll (if it’s okay!)', 'Do 10 jumping jacks on camera', 'Speak only in questions until your next turn', 'Make the funniest face you can for 10 seconds', 'Let the group pick your next profile picture emoji', 'Say the alphabet backwards as fast as you can', 'Act out a movie scene. Others guess it', 'Talk like a pirate until the next round', 'Do your best robot dance', 'Tell a joke. If nobody laughs, tell another', 'Balance something on your head for 30 seconds', 'Narrate what the person to your left is doing like a nature documentary', 'Do your best evil laugh', 'Name 10 animals in 15 seconds', 'Hold a plank for 20 seconds', 'Draw a cat with your eyes closed and show it', 'Compliment every person in the call', 'Speak in rhymes for your next 3 sentences', 'Show us the view out your nearest window', 'Do your best runway walk', 'Make up a 4-line rap about this call', 'Pretend to be a news reporter for 30 seconds'];
const G_WYR = [['Be able to fly', 'Be invisible'], ['Never use your phone again', 'Never watch TV again'], ['Always be 10 minutes late', 'Always be 20 minutes early'], ['Have unlimited pizza', 'Have unlimited tacos'], ['Live in the ocean', 'Live on the moon'], ['Talk to animals', 'Speak every language'], ['Be super strong', 'Be super fast'], ['Only whisper', 'Only shout'], ['Have no homework ever', 'Have no tests ever'], ['Be famous', 'Be rich and unknown'], ['Live without music', 'Live without movies'], ['Have a pet dragon', 'Have a pet unicorn'], ['Time travel to the past', 'Time travel to the future'], ['Never feel cold', 'Never feel hot'], ['Read minds', 'See the future'], ['Eat only sweet food', 'Eat only salty food'], ['Be a wizard', 'Be a superhero'], ['Have a rewind button', 'Have a pause button for life'], ['Explore space', 'Explore the deep ocean'], ['Have free Wi-Fi everywhere', 'Have free food everywhere']];
const G_NHIE = ['Never have I ever fallen asleep in class', 'Never have I ever broken a bone', 'Never have I ever sent a text to the wrong person', 'Never have I ever stayed up all night', 'Never have I ever cried at a movie', 'Never have I ever forgotten someone’s name right after meeting them', 'Never have I ever tripped in public', 'Never have I ever lied about my age', 'Never have I ever eaten something off the floor', 'Never have I ever been on a plane', 'Never have I ever laughed so hard I cried', 'Never have I ever gotten lost', 'Never have I ever pretended to know a song', 'Never have I ever cheated in a board game', 'Never have I ever walked into a glass door', 'Never have I ever binge-watched a whole season in one day', 'Never have I ever had a nickname I hated', 'Never have I ever dyed my hair', 'Never have I ever lost my phone in my hand', 'Never have I ever talked to myself out loud'];
const G_HOT = ['Pineapple belongs on pizza', 'Cereal is a soup', 'Summer is better than winter', 'Cats are better than dogs', 'Homework should be banned', 'Hot dogs are sandwiches', 'Morning people are happier', 'Movies are better than books', 'Water is wet', 'Mint chocolate chip is the best ice cream', 'School should start at 10am', 'Video games count as a sport', 'The book is always better than the movie', 'Ketchup on eggs is fine', 'Phones should be banned at dinner'];
const GAMES = [['tod', '<i class="fa-solid fa-masks-theater"></i>', 'Truth or Dare'], ['wyr', '<i class="fa-solid fa-scale-balanced"></i>', 'Would You Rather'], ['nhie', '<i class="fa-solid fa-hand"></i>', 'Never Have I Ever'], ['hot', '<i class="fa-solid fa-pepper-hot"></i>', 'Hot Takes'], ['spin', '<i class="fa-solid fa-circle-notch"></i>', 'Spin the Wheel'], ['coin', '<i class="fa-solid fa-coins"></i>', 'Coin Flip'], ['dice', '<i class="fa-solid fa-dice"></i>', 'Dice']];
const pick = (a, not) => { let i; do { i = Math.floor(Math.random() * a.length); } while (a.length > 1 && i === not); return i; };
const inCallIds = () => Object.keys(members).filter((id) => !members[id].ghost && sameRoom(id));
let game = null, gvotes = {}, gameShownAt = 0;
function gameState(k, prev) {
  const base = { k, by: uid, name: me.name, at: Date.now() };
  const ids = inCallIds();
  if (k === 'tod') return Object.assign(base, { target: ids[pick(ids, ids.indexOf(prev && prev.target))] || uid, step: 'choose' });
  if (k === 'wyr') return Object.assign(base, { i: pick(G_WYR, prev && prev.k === 'wyr' ? prev.i : -1) });
  if (k === 'nhie') return Object.assign(base, { i: pick(G_NHIE, prev && prev.k === 'nhie' ? prev.i : -1) });
  if (k === 'hot') return Object.assign(base, { i: pick(G_HOT, prev && prev.k === 'hot' ? prev.i : -1) });
  if (k === 'spin') return Object.assign(base, { target: ids[pick(ids)] || uid, names: ids.slice(0, 12).map((id) => members[id].name.slice(0, 16)) });
  if (k === 'coin') return Object.assign(base, { r: Math.random() < 0.5 ? 'Heads' : 'Tails' });
  if (k === 'dice') return Object.assign(base, { r: [1 + Math.floor(Math.random() * 6), 1 + Math.floor(Math.random() * 6)] });
  return base;
}
function startGame(k, next) {
  if (!joined || (!next && !cooldown('game'))) return;
  $('game-pop').classList.remove('on');
  const prev = game;
  update(R(), { game: gameState(k, prev), gvotes: null }).catch((e) => toast('Couldn’t start the game (' + e.code + ')'));
}
function gameChanged(v) {
  const was = game;
  game = v;
  if (!v) { $('game').classList.remove('on'); return; }
  if (!was || was.at !== v.at) {
    if (v.by !== uid && (!was || was.k !== v.k)) toast('🎮 ' + v.name + ' started ' + (GAMES.find((g) => g[0] === v.k) || [, , 'a game'])[2]);
    gameShownAt = Date.now();
    sfxGame(v.k);
  }
  paintGame(was && was.at === v.at);
}
 
const ANIM = { spin: 3.1, coin: 1.3, dice: 0.9 };
let gameTimer = 0;
function paintGame() {
  const v = game; if (!v) return;
  clearTimeout(gameTimer);
  const meta_ = GAMES.find((g) => g[0] === v.k) || ['', '<i class="fa-solid fa-gamepad"></i>', 'Game'];
  const box = $('game'); box.classList.add('on');
  const el = (Date.now() - gameShownAt) / 1000, age = (Date.now() - (v.at || Date.now())) / 1000;
  const drive = v.by === uid || isMod || !members[v.by];
  const nameIn = (id) => (id === uid ? 'You' : (members[id] ? members[id].name : 'Someone'));
  const realName = (id) => (members[id] ? members[id].name : '?');
  const ids = inCallIds(), votes = Object.entries(gvotes);
  const waiting = ids.filter((id) => gvotes[id] == null);
  let body = '', ready = true, waitTxt = '', skip = false;
  const delay = (d) => 'animation-delay:' + (d - el).toFixed(2) + 's';
  if (v.k === 'tod') {
    const mine = v.target === uid;
    body = '<div class="gm-who">' + avatarHTML(v.target, realName(v.target)) + '<b>' + esc(nameIn(v.target)) + (mine ? ', you’re up!' : '’s turn') + '</b></div>';
    if (v.step === 'choose') {
      body += mine ? '<div class="gm-row"><button class="gm-big" data-g="truth"><i class="fa-solid fa-comment-dots"></i> Truth</button><button class="gm-big dare" data-g="dare"><i class="fa-solid fa-fire"></i> Dare</button></div>' : '<p class="gm-wait">Waiting for ' + esc(realName(v.target)) + ' to pick Truth or Dare…</p>';
      ready = false; waitTxt = realName(v.target) + ' is choosing';
    } else {
      body += '<div class="gm-card ' + v.step + '"><em>' + (v.step === 'truth' ? '<i class="fa-solid fa-comment-dots"></i> Truth' : '<i class="fa-solid fa-fire"></i> Dare') + (v.done ? ' · done ✓' : '') + '</em><p></p></div>';
      if (mine && !v.done) body += '<div class="gm-row"><button class="btn ghost small" data-g="swap">Different one</button><button class="btn primary small" data-g="done">Done ✓</button></div>';
      if (!v.done) { ready = false; waitTxt = 'Waiting for ' + realName(v.target) + ' to finish'; }
    }
    if (!ready && age > 45) skip = true;
  } else if (v.k === 'wyr' || v.k === 'hot' || v.k === 'nhie') {
    if (v.k === 'wyr') {
      const pair = G_WYR[v.i], c = [0, 0]; votes.forEach(([, x]) => { if (c[x] != null) c[x]++; });
      const tot = c[0] + c[1], show = !waiting.length;
      body = '<p class="gm-q">Would you rather…</p><div class="gm-row">' + pair.map((o, i) => '<button class="gm-opt' + (gvotes[uid] === i ? ' mine' : '') + '" data-v="' + i + '"><i style="height:' + (show && tot ? Math.round(c[i] / tot * 100) : 0) + '%"></i><span></span><em>' + (show ? (tot ? Math.round(c[i] / tot * 100) + '% · ' + c[i] : '') : gvotes[uid] === i ? 'Your pick' : 'Tap to pick') + '</em></button>').join('<b class="gm-or">or</b>') + '</div>';
    } else if (v.k === 'hot') {
      const c = [0, 0]; votes.forEach(([, x]) => { if (c[x] != null) c[x]++; }); const tot = c[0] + c[1], show = !waiting.length;
      body = '<div class="gm-card hot"><em><i class="fa-solid fa-pepper-hot"></i> Hot take</em><p></p></div><div class="gm-row">' + [['<i class="fa-solid fa-thumbs-up"></i> Agree', 0], ['<i class="fa-solid fa-thumbs-down"></i> Disagree', 1]].map(([l, i]) =>
        '<button class="gm-opt' + (gvotes[uid] === i ? ' mine' : '') + '" data-v="' + i + '"><i style="height:' + (show && tot ? Math.round(c[i] / tot * 100) : 0) + '%"></i><span>' + l + '</span><em>' + (show && tot ? Math.round(c[i] / tot * 100) + '%' : gvotes[uid] === i ? 'Your pick' : '') + '</em></button>').join('') + '</div>';
    } else {
      const have = votes.filter(([, x]) => x === 1).map(([id]) => nameIn(id));
      body = '<div class="gm-card"><p></p></div><div class="gm-row"><button class="gm-big' + (gvotes[uid] === 1 ? ' on' : '') + '" data-v="1"><i class="fa-solid fa-hand"></i> I have</button><button class="gm-big ghost' + (gvotes[uid] === 0 ? ' on' : '') + '" data-v="0"><i class="fa-solid fa-ban"></i> Never</button></div>' +
        (!waiting.length ? '<p class="gm-wait">' + (have.length ? '<i class="fa-solid fa-hand"></i> ' + esc(have.join(', ')) : 'Nobody has!') + '</p>' : '');
    }
    if (waiting.length) {
      ready = false;
      waitTxt = 'Waiting for ' + waiting.length + ': ' + waiting.slice(0, 3).map((id) => nameIn(id)).join(', ') + (waiting.length > 3 ? '…' : '');
      if (age > 30) skip = true; else gameTimer = setTimeout(paintGame, (30 - age) * 1000 + 100);
    } else waitTxt = 'Everyone answered ✓';
  } else if (v.k === 'spin') {
    const names = v.names && v.names.length ? v.names : [realName(v.target)], ti = Math.max(0, names.indexOf(realName(v.target).slice(0, 16)));
    const seg = 360 / names.length, cols = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#8b5cf6', '#f43f5e', '#84cc16'];
    const grad = names.map((_, i) => cols[i % cols.length] + ' ' + (i * seg) + 'deg ' + ((i + 1) * seg) + 'deg').join(',');
    const rot = 360 * 5 + (360 - (ti * seg + seg / 2));
    body = '<div class="gm-wheel-wrap"><i class="gm-pointer"></i><div class="gm-wheel" style="background:conic-gradient(' + grad + ');--rot:' + rot + 'deg;' + delay(0) + '">' +
      names.map((n, i) => '<span style="transform:rotate(' + (i * seg + seg / 2) + 'deg) translateY(-62px)">' + esc(n) + '</span>').join('') + '</div></div>' +
      '<p class="gm-result" style="' + delay(ANIM.spin) + '"><i class="fa-solid fa-bullseye"></i> ' + esc(nameIn(v.target)) + '!</p>';
  } else if (v.k === 'coin') {
    body = '<div class="gm-coin ' + v.r.toLowerCase() + '" style="' + delay(0) + '"><b>H</b><b>T</b></div><p class="gm-result" style="' + delay(ANIM.coin) + '">' + v.r + '!</p>';
  } else if (v.k === 'dice') {
    const pips = (n) => '<div class="gm-die d' + n + '" style="' + delay(0) + '">' + '<i></i>'.repeat(n) + '</div>';
    body = '<div class="gm-row">' + pips(v.r[0]) + pips(v.r[1]) + '</div><p class="gm-result" style="' + delay(ANIM.dice) + '">' + (v.r[0] + v.r[1]) + (v.r[0] === v.r[1] ? ' · Doubles!' : '') + '</p>';
  }
  if (ANIM[v.k] && el < ANIM[v.k]) { ready = false; waitTxt = ''; gameTimer = setTimeout(paintGame, (ANIM[v.k] - el) * 1000 + 80); }
  const label = v.k === 'coin' ? 'Flip again' : v.k === 'dice' ? 'Roll again' : v.k === 'spin' ? 'Spin again' : 'Next round';
  const foot = drive
    ? (ready ? '<button class="btn primary small" type="button" data-g="next">' + label + '</button>'
      : skip ? '<button class="btn ghost small" type="button" data-g="next">Skip waiting</button>'
      : '<button class="btn primary small" type="button" disabled>' + label + '</button>')
    : '<em class="gm-wait">' + (ready ? esc(v.name) + ' goes next' : '') + '</em>';
  box.innerHTML = '<div class="gm-h"><span>' + meta_[1] + ' ' + meta_[2] + '</span>' + (drive ? '<button class="icon-x" type="button" data-g="end" title="End game">' + SI.x + '</button>' : '') + '</div>' +
    '<div class="gm-b">' + body + '</div>' + (waitTxt ? '<div class="gm-status' + (ready ? ' ok' : '') + '">' + esc(waitTxt) + '</div>' : '') +
    '<div class="gm-f"><span>Started by ' + esc(v.by === uid ? 'you' : v.name) + '</span>' + foot + '</div>';
  const p = box.querySelector('.gm-card p');
  if (p) p.textContent = v.k === 'tod' ? (v.step === 'truth' ? G_TRUTH[v.i] : G_DARE[v.i]) : v.k === 'nhie' ? G_NHIE[v.i] : v.k === 'hot' ? G_HOT[v.i] : '';
  if (v.k === 'wyr') box.querySelectorAll('.gm-opt span').forEach((s, i) => { s.textContent = G_WYR[v.i][i]; });
  box.querySelectorAll('[data-v]').forEach((b) => { b.onclick = () => set(R('gvotes/' + uid), +b.dataset.v).catch(() => {}); });
  box.querySelectorAll('[data-g]').forEach((b) => { b.onclick = () => {
    const a = b.dataset.g;
    if (a === 'end') { remove(R('game')).catch(() => {}); remove(R('gvotes')).catch(() => {}); }
    else if (a === 'next') startGame(v.k, true);
    else if (a === 'truth' || a === 'dare') update(R('game'), { step: a, i: pick(a === 'truth' ? G_TRUTH : G_DARE), done: false });
    else if (a === 'swap') update(R('game'), { i: pick(v.step === 'truth' ? G_TRUTH : G_DARE, v.i) });
    else if (a === 'done') update(R('game'), { done: true });
  }; });
}
function sfxGame(k) {
  try {
    const ac = beep.ac || (beep.ac = new AudioContext()), t0 = ac.currentTime;
    const note = (f, t, d, v, type) => { const o = ac.createOscillator(), g = ac.createGain(); o.type = type || 'triangle'; o.frequency.value = f; g.gain.setValueAtTime(0.0001, t0 + t); g.gain.exponentialRampToValueAtTime(v, t0 + t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t0 + t + d); o.connect(g).connect(ac.destination); o.start(t0 + t); o.stop(t0 + t + d + 0.05); };
    if (k === 'spin') for (let i = 0; i < 26; i++) note(900, Math.pow(i / 26, 1.8) * 3, 0.03, 0.05, 'square');
    else if (k === 'coin') { note(1500, 0, 0.5, 0.08, 'sine'); note(2250, 0.02, 0.4, 0.05, 'sine'); }
    else if (k === 'dice') for (let i = 0; i < 6; i++) note(300 + Math.random() * 300, i * 0.12, 0.05, 0.08, 'square');
    else { note(523, 0, 0.18, 0.08); note(659, 0.09, 0.18, 0.08); note(784, 0.18, 0.3, 0.08); }
  } catch (_) {}
}
$('c-game').onclick = (e) => {
  e.stopPropagation();
  const p = $('game-pop');
  if (p.classList.contains('on')) { p.classList.remove('on'); return; }
  p.innerHTML = '<b>Play a game</b><div class="bg-grid">' + GAMES.map(([k, e2, l]) => '<button type="button" data-k="' + k + '"><span>' + e2 + '</span><em>' + l + '</em></button>').join('') + '</div>';
  p.querySelectorAll('[data-k]').forEach((b) => { b.onclick = () => startGame(b.dataset.k); });
  p.classList.add('on');
  const r = $('c-game').getBoundingClientRect(), w = p.offsetWidth, h = p.offsetHeight;
  p.style.left = Math.max(8, Math.min(innerWidth - w - 8, r.left + r.width / 2 - w / 2)) + 'px';
  p.style.top = (r.top - h - 10) + 'px';
};
addEventListener('pointerdown', (e) => { if (!e.target.closest('#game-pop,#c-game')) $('game-pop').classList.remove('on'); });

 
const myFiles = new Map();
const gotFiles = new Map();
const fileCards = new Map();
const fmtSize = (n) => (n < 1024 ? n + ' B' : n < 1048576 ? (n / 1024).toFixed(0) + ' KB' : (n / 1048576).toFixed(1).replace(/\.0$/, '') + ' MB');
const FILE_ICON = (t, n) => (/^image\//.test(t) ? '<i class="fa-solid fa-file-image"></i>' : /pdf/.test(t) ? '<i class="fa-solid fa-file-pdf"></i>' : /^video\//.test(t) ? '<i class="fa-solid fa-file-video"></i>' : /^audio\//.test(t) ? '<i class="fa-solid fa-file-audio"></i>' : isTextFile(t, n) ? '<i class="fa-solid fa-file-code"></i>' : /zip|rar|7z/.test(t + n) ? '<i class="fa-solid fa-file-zipper"></i>' : '<i class="fa-solid fa-file"></i>');
const CODE_EXT = /\.(txt|md|json|js|mjs|ts|tsx|jsx|py|java|c|h|cpp|cs|go|rs|rb|php|html|css|scss|xml|yml|yaml|sh|bat|ps1|lua|sql|csv|log|ini|toml)$/i;
const isTextFile = (t, n) => /^text\//.test(t) || /json|javascript|xml/.test(t) || CODE_EXT.test(n || '');
function setupDC(p, ch) {
  ch.binaryType = 'arraybuffer';
  ch.bufferedAmountLowThreshold = 256 * 1024;
  p.dc = ch; p.outQ = p.outQ || []; p.inX = null;
  ch.onmessage = (e) => {
    if (typeof e.data === 'string') {
      let m; try { m = JSON.parse(e.data); } catch (_) { return; }
      if (m.t === 'get') { if (myFiles.has(m.id) || gotFiles.has(m.id)) { p.outQ.push(m.id); pumpFiles(p); } else ch.send(JSON.stringify({ t: 'none', id: m.id })); }
      else if (m.t === 'start') p.inX = { id: m.id, size: m.size, type: m.type, parts: [], got: 0 };
      else if (m.t === 'end' && p.inX && p.inX.id === m.id) {
        const blob = new Blob(p.inX.parts, { type: p.inX.type || 'application/octet-stream' });
        p.inX = null; gotFiles.set(m.id, blob); paintFileCard(m.id); bgmGot(m.id);
      } else if (m.t === 'none') paintFileCard(m.id, 'gone');
    } else if (p.inX) {
      p.inX.parts.push(e.data); p.inX.got += e.data.byteLength;
      paintFileCard(p.inX.id, p.inX.got / Math.max(1, p.inX.size));
    }
  };
}
async function pumpFiles(p) {
  if (p.pumping) return;
  p.pumping = true;
  try {
    while (p.outQ.length && p.dc && p.dc.readyState === 'open') {
      const id = p.outQ.shift(), f = myFiles.get(id) || gotFiles.get(id);
      if (!f) continue;
      p.dc.send(JSON.stringify({ t: 'start', id, size: f.size, type: f.type || '' }));
      const buf = await f.arrayBuffer(), CH = 16 * 1024;
      for (let o = 0; o < buf.byteLength; o += CH) {
        if (p.dc.readyState !== 'open') return;
        if (p.dc.bufferedAmount > 1024 * 1024) await new Promise((r) => { p.dc.onbufferedamountlow = () => { p.dc.onbufferedamountlow = null; r(); }; });
        p.dc.send(buf.slice(o, o + CH));
      }
      p.dc.send(JSON.stringify({ t: 'end', id }));
    }
  } finally { p.pumping = false; }
}
function requestFile(meta, from) {
  if (gotFiles.has(meta.id)) return;
  get(R('files/' + meta.id)).then((s) => {
    const v = s.val();
    if (v && v.d) { fetch(v.d).then((r) => r.blob()).then((b) => { gotFiles.set(meta.id, b); paintFileCard(meta.id); }); return; }
    const p = peers.get(from);
    if (!p || !p.dc || p.dc.readyState !== 'open') { paintFileCard(meta.id, 'gone'); return; }
    paintFileCard(meta.id, 0);
    p.dc.send(JSON.stringify({ t: 'get', id: meta.id }));
  }, () => {});
}
async function shareFile(f) {
  if (!joined || !f) return;
  if (!cooldown('file')) return;
  const id = push(R('chat')).key;
  myFiles.set(id, f); gotFiles.set(id, f);
  const meta = { id, n: String(f.name || 'pasted-file').slice(0, 120), s: f.size, t: String(f.type || '').slice(0, 80) };
  try {
    if (/^image\//.test(f.type) && f.size <= 1000000) {
      const d = await new Promise((r) => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(f); });
      await set(R('files/' + id), { d, by: uid }).catch(() => {});
    }
    await set(R('chat/' + id), { uid, name: me.name, text: '📎 ' + meta.n, at: Date.now(), file: meta });
  } catch (e) { toast('File not sent (' + (e.code || e.message) + ')'); }
}
function fileCard(c) {
  const m = c.file, el = document.createElement('div');
  el.className = 'fcard';
  el.dataset.fid = m.id;
  el.innerHTML = '<div class="fc-thumb">' + FILE_ICON(m.t, m.n) + '</div><div class="fc-t"><b></b><em>' + fmtSize(m.s) + '</em><i class="fc-bar"><span></span></i></div><button class="btn ghost small fc-btn" type="button"></button>';
  el.querySelector('b').textContent = m.n;
  el._meta = m; el._from = c.uid;
  if (!fileCards.has(m.id)) fileCards.set(m.id, []);
  fileCards.get(m.id).push(el);
  el.querySelector('.fc-btn').onclick = () => { if (gotFiles.has(m.id)) openViewer({ blob: gotFiles.get(m.id), name: m.n, type: m.t }); else requestFile(m, c.uid); };
  el.querySelector('.fc-thumb').onclick = el.querySelector('.fc-btn').onclick;
  setTimeout(() => {
    paintFileCard(m.id);
    if (!gotFiles.has(m.id) && c.uid !== uid && m.s <= 15 * 1048576) requestFile(m, c.uid);
  }, 0);
  return el;
}
function paintFileCard(id, state) {
  (fileCards.get(id) || []).forEach((el) => {
    const m = el._meta, b = gotFiles.get(id), btn = el.querySelector('.fc-btn'), bar = el.querySelector('.fc-bar');
    bar.style.display = typeof state === 'number' ? '' : 'none';
    if (typeof state === 'number') { bar.firstChild.style.width = Math.round(state * 100) + '%'; btn.textContent = Math.round(state * 100) + '%'; return; }
    if (b) {
      btn.textContent = 'Open';
      if (/^image\//.test(m.t) && !el.querySelector('.fc-img')) {
        const im = document.createElement('img'); im.className = 'fc-img'; im.src = URL.createObjectURL(b); im.alt = '';
        im.onclick = () => openViewer({ blob: b, name: m.n, type: m.t });
        el.classList.add('has-img'); el.prepend(im);
      }
    } else btn.textContent = state === 'gone' ? 'Unavailable' : 'Download';
    btn.disabled = state === 'gone' && !b;
  });
}
 
$('chat-attach').onclick = () => $('chat-file').click();
$('chat-file').onchange = () => { [...$('chat-file').files].slice(0, 5).forEach(shareFile); $('chat-file').value = ''; };
$('in-chat').addEventListener('paste', (e) => {
  const fs_ = [...(e.clipboardData && e.clipboardData.files || [])];
  if (!fs_.length) return;
  e.preventDefault();
  fs_.slice(0, 5).forEach((f) => shareFile(f.name && f.name !== 'image.png' ? f : new File([f], 'pasted-' + new Date().toTimeString().slice(0, 8).replace(/:/g, '') + '.' + ((f.type.split('/')[1] || 'png').replace('jpeg', 'jpg')), { type: f.type })));
});
$('in-dm').addEventListener('paste', async (e) => {
  const f = [...(e.clipboardData && e.clipboardData.files || [])].find((x) => /^image\//.test(x.type));
  if (!f) return;
  e.preventDefault();
  const o = dmOther(); if (!o) return;
  try { const d = await shrinkImage(f, 1280, 0.8); if (d.length > 700000) throw 0; await sendDM(o, '', d); } catch (_) { toast('That picture couldn’t be sent'); }
});
['tab-chat'].forEach((id) => {
  const z = $(id);
  z.addEventListener('dragover', (e) => { if (e.dataTransfer && [...e.dataTransfer.types].includes('Files')) { e.preventDefault(); z.classList.add('drop'); } });
  z.addEventListener('dragleave', (e) => { if (!z.contains(e.relatedTarget)) z.classList.remove('drop'); });
  z.addEventListener('drop', (e) => { z.classList.remove('drop'); if (!e.dataTransfer.files.length) return; e.preventDefault(); [...e.dataTransfer.files].slice(0, 5).forEach(shareFile); });
});

 
const loadScript = (src) => new Promise((res, rej) => { if (document.querySelector('script[src="' + src + '"]')) return res(); const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
const loadCss = (href) => { if (!document.querySelector('link[href="' + href + '"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = href; document.head.appendChild(l); } };
let viewUrl = null;
async function openViewer({ blob, url, name, type }) {
  if (viewUrl) URL.revokeObjectURL(viewUrl);
  const src = url || (viewUrl = URL.createObjectURL(blob));
  type = type || (blob && blob.type) || '';
  $('vw-name').textContent = name || 'File';
  $('vw-dl').onclick = () => { const a = document.createElement('a'); a.href = src; a.download = name || 'file'; a.click(); };
  const body = $('vw-body'); body.innerHTML = ''; body.className = 'vw-body';
  $('vw-zoom').style.display = 'none';
  $('viewer').classList.add('on');
  if (/^image\//.test(type)) {
    body.classList.add('img');
    const im = document.createElement('img'); im.src = src; im.draggable = false; body.appendChild(im);
    let z = 1, x = 0, y = 0, drag = null;
    const apply = () => { im.style.transform = 'translate(' + x + 'px,' + y + 'px) scale(' + z + ')'; $('vw-zl').textContent = Math.round(z * 100) + '%'; };
    const zoom = (k) => { z = Math.max(0.2, Math.min(8, z * k)); if (z <= 1.001) { x = 0; y = 0; } apply(); };
    body.onwheel = (e) => { e.preventDefault(); zoom(e.deltaY < 0 ? 1.15 : 1 / 1.15); };
    body.onpointerdown = (e) => { drag = { sx: e.clientX - x, sy: e.clientY - y }; body.setPointerCapture(e.pointerId); };
    body.onpointermove = (e) => { if (drag && z > 1) { x = e.clientX - drag.sx; y = e.clientY - drag.sy; apply(); } };
    body.onpointerup = () => { drag = null; };
    body.ondblclick = () => { if (z > 1) { z = 1; x = y = 0; } else z = 2.5; apply(); };
    $('vw-zoom').style.display = ''; $('vw-in').onclick = () => zoom(1.25); $('vw-out').onclick = () => zoom(0.8); apply();
  } else if (/pdf/.test(type) || /\.pdf$/i.test(name)) {
    body.classList.add('pdf'); body.innerHTML = '<p class="rooms-note">Opening PDF…</p>';
    try {
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      const pdf = await pdfjsLib.getDocument({ data: await (blob || await (await fetch(src)).blob()).arrayBuffer() }).promise;
      let scale = 1.3;
      const render = async () => {
        body.innerHTML = '';
        for (let i = 1; i <= Math.min(pdf.numPages, 200); i++) {
          const pg = await pdf.getPage(i), vp = pg.getViewport({ scale: scale * devicePixelRatio }), cv = document.createElement('canvas');
          cv.width = vp.width; cv.height = vp.height; cv.style.width = vp.width / devicePixelRatio + 'px';
          body.appendChild(cv);
          await pg.render({ canvasContext: cv.getContext('2d'), viewport: vp }).promise;
        }
      };
      $('vw-zoom').style.display = ''; $('vw-zl').textContent = pdf.numPages + (pdf.numPages === 1 ? ' page' : ' pages');
      $('vw-in').onclick = () => { scale = Math.min(4, scale * 1.25); render(); };
      $('vw-out').onclick = () => { scale = Math.max(0.5, scale / 1.25); render(); };
      await render();
    } catch (_) { body.innerHTML = '<p class="rooms-note">Couldn’t open this PDF. Use Download.</p>'; }
  } else if (/^video\//.test(type)) {
    body.classList.add('media'); const v = document.createElement('video'); v.src = src; v.controls = true; v.autoplay = true; body.appendChild(v);
  } else if (/^audio\//.test(type)) {
    body.classList.add('media'); body.innerHTML = '<div class="vw-big"><i class="fa-solid fa-music"></i></div>'; const a = document.createElement('audio'); a.src = src; a.controls = true; a.autoplay = true; body.appendChild(a);
  } else if (isTextFile(type, name)) {
    body.classList.add('code'); body.innerHTML = '<p class="rooms-note">Loading…</p>';
    try {
      const b = blob || await (await fetch(src)).blob();
      if (b.size > 3 * 1048576) throw 0;
      const text = await b.text();
      loadCss('https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css');
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js');
      const ext = (name.match(/\.([a-z0-9]+)$/i) || [])[1];
      let html;
      try { html = ext && hljs.getLanguage(ext) ? hljs.highlight(text, { language: ext }).value : (text.length < 200000 ? hljs.highlightAuto(text).value : esc(text)); } catch (_) { html = esc(text); }
      body.innerHTML = '<pre class="hljs"><code>' + html.split('\n').map((l) => '<span class="ln">' + (l || ' ') + '</span>').join('\n') + '</code></pre>';
    } catch (_) { body.innerHTML = '<p class="rooms-note">Too big to preview. Use Download.</p>'; }
  } else {
    body.innerHTML = '<div class="vw-big">' + FILE_ICON(type, name) + '</div><p class="rooms-note">No preview for this kind of file. Use Download.</p>';
  }
}
const closeViewer = () => { $('viewer').classList.remove('on'); $('vw-body').innerHTML = ''; };
$('vw-x').onclick = closeViewer;
$('viewer').addEventListener('mousedown', (e) => { if (e.target.id === 'viewer') closeViewer(); });
addEventListener('keydown', (e) => { if (e.key === 'Escape' && $('viewer').classList.contains('on')) closeViewer(); });

 
const pollCards = new Map(), pollVotes = {};
function pollAdded(id, v) {
  if (!v || pollCards.has(id)) return;
  const el = document.createElement('div');
  el.className = 'poll';
  pollCards.set(id, { el, v });
  const list = $('chat-list'); const empty = list.querySelector('.chat-empty'); if (empty) empty.remove();
  list.appendChild(el); list.scrollTop = list.scrollHeight;
  unsubs.push(onValue(R('pvotes/' + id), (s) => { pollVotes[id] = s.val() || {}; paintPoll(id); }, () => {}));
  paintPoll(id);
  if (v.by !== uid && v.at > joinTime - 1000) { chime(); toast('📊 ' + v.name + ' started a poll: ' + v.q.slice(0, 60), { label: 'Vote', fn: () => openPanel('chat', true) }, 8000); }
}
function paintPoll(id) {
  const c = pollCards.get(id); if (!c) return;
  const v = c.v, votes = pollVotes[id] || {}, counts = v.o.map(() => 0);
  Object.values(votes).forEach((i) => { if (counts[i] != null) counts[i]++; });
  const total = counts.reduce((a, b) => a + b, 0), mine = votes[uid];
  const canEnd = !v.closed && (v.by === uid || isMod);
  c.el.innerHTML = '<div class="poll-h"><span><i class="fa-solid fa-square-poll-vertical"></i> Poll · ' + esc(v.by === uid ? 'You' : v.name) + (v.closed ? ' · ended' : '') + '</span>' + (canEnd ? '<button class="link" type="button" data-end>End poll</button>' : '') + '</div>' +
    '<b class="poll-q"></b>' + v.o.map((o, i) => {
      const pct = total ? Math.round(counts[i] / total * 100) : 0;
      return '<button type="button" class="poll-o' + (mine === i ? ' mine' : '') + '" data-i="' + i + '"' + (v.closed ? ' disabled' : '') + '><i style="width:' + pct + '%"></i><span></span><em>' + pct + '% · ' + counts[i] + '</em></button>';
    }).join('') + '<div class="poll-f">' + total + ' vote' + (total === 1 ? '' : 's') + (mine != null && !v.closed ? ' · tap another to change' : '') + ' · anonymous</div>';
  c.el.querySelector('.poll-q').textContent = v.q;
  c.el.querySelectorAll('.poll-o span').forEach((s, i) => { s.textContent = v.o[i]; });
  c.el.querySelectorAll('.poll-o').forEach((b) => { b.onclick = () => set(R('pvotes/' + id + '/' + uid), +b.dataset.i).catch(() => toast('Vote not counted')); });
  const e = c.el.querySelector('[data-end]'); if (e) e.onclick = () => update(R('polls/' + id), { closed: true });
}
function pollChanged(id, v) { const c = pollCards.get(id); if (c) { c.v = v; paintPoll(id); } }
$('chat-poll').onclick = () => {
  $('pl-q').value = ''; $('pl-opts').innerHTML = ''; addPollOpt(); addPollOpt(); $('pl-err').textContent = '';
  $('poll-modal').classList.add('on'); setTimeout(() => $('pl-q').focus(), 50);
};
function addPollOpt() {
  if ($('pl-opts').children.length >= 6) return;
  const i = document.createElement('input'); i.className = 'field small'; i.maxLength = 80; i.placeholder = 'Option ' + ($('pl-opts').children.length + 1);
  $('pl-opts').appendChild(i);
  $('pl-add').style.display = $('pl-opts').children.length >= 6 ? 'none' : '';
}
$('pl-add').onclick = () => { addPollOpt(); $('pl-opts').lastChild.focus(); };
$('pl-x').onclick = () => $('poll-modal').classList.remove('on');
$('form-poll').onsubmit = (e) => {
  e.preventDefault();
  const q = $('pl-q').value.trim().slice(0, 200), o = [...$('pl-opts').children].map((i) => i.value.trim()).filter(Boolean);
  if (!q) { $('pl-err').textContent = 'Ask a question'; return; }
  if (o.length < 2) { $('pl-err').textContent = 'Add at least 2 options'; return; }
  if (!cooldown('poll')) return;
  push(R('polls'), { q, o, by: uid, name: me.name, at: Date.now() }).then(() => $('poll-modal').classList.remove('on'), (er) => { $('pl-err').textContent = 'Couldn’t start the poll (' + er.code + ')'; });
};

 
const BG_PHOTOS = { cafe: 'Cafe', library: 'Library', city: 'Night city', space: 'Space' };
const bgImgs = {};
function bgPhoto(k) {
  if (!bgImgs[k]) { const im = new Image(); im.src = '/bg/' + k + '.jpg'; bgImgs[k] = im.decode().then(() => im, () => null); }
  return bgImgs[k];
}
const bg = { mode: ((m) => (['none', 'blur', 'blur2', 'custom'].includes(m) || m in { cafe: 1, library: 1, city: 1, space: 1 } ? m : 'none'))(store.get('em-bg', 'none')), img: null, seg: null, loading: null, run: null, canvas: null, out: null };
try { const u = localStorage.getItem('em-bgimg'); if (u) { bg.img = new Image(); bg.img.src = u; } } catch (_) {}
async function loadSegmenter() {
  if (bg.seg) return bg.seg;
  if (!bg.loading) bg.loading = (async () => {
    const V = await import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs');
    const files = await V.FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm');
    bg.seg = await V.ImageSegmenter.createFromOptions(files, {
      baseOptions: { modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite', delegate: 'GPU' },
      runningMode: 'VIDEO', outputConfidenceMasks: true, outputCategoryMask: false
    });
    return bg.seg;
  })();
  return bg.loading;
}
function stopBgPipe() {
  if (bg.run) { bg.run.stop = true; bg.run = null; }
  if (bg.out) { try { bg.out.stop(); } catch (_) {} bg.out = null; }
}
 
async function processedCam(raw) {
  stopBgPipe();
  if (!raw || bg.mode === 'none' || (bg.mode === 'custom' && !bg.img)) return raw;
  try { await loadSegmenter(); } catch (_) { toast('Background effects couldn’t load on this device'); return raw; }
  const W = 640, H = 360;
  const v = document.createElement('video'); v.muted = true; v.playsInline = true; v.srcObject = new MediaStream([raw]); await v.play().catch(() => {});
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d');
  const mask = document.createElement('canvas'); mask.width = W; mask.height = H; const mg = mask.getContext('2d');
  const person = document.createElement('canvas'); person.width = W; person.height = H; const pg = person.getContext('2d');
  const scene = document.createElement('canvas'); scene.width = W; scene.height = H; const sg = scene.getContext('2d');
  const photo = BG_PHOTOS[bg.mode] ? await bgPhoto(bg.mode) : null;
  if (photo) { const k = Math.max(W / photo.width, H / photo.height); sg.drawImage(photo, (W - photo.width * k) / 2, (H - photo.height * k) / 2, photo.width * k, photo.height * k); }
  if (bg.mode === 'custom' && bg.img) { const k = Math.max(W / bg.img.width, H / bg.img.height); sg.drawImage(bg.img, (W - bg.img.width * k) / 2, (H - bg.img.height * k) / 2, bg.img.width * k, bg.img.height * k); }
  const out = c.captureStream(24).getVideoTracks()[0];
  const run = { stop: false };
  bg.run = run; bg.out = out;
  let maskData = null, slow = 0, last = performance.now();
  const frame = () => {
    if (run.stop || raw.readyState === 'ended') return;
    if (v.readyState >= 2) {
      const vw = v.videoWidth, vh = v.videoHeight, k = Math.max(W / vw, H / vh), dw = vw * k, dh = vh * k, dx = (W - dw) / 2, dy = (H - dh) / 2;
      pg.drawImage(v, dx, dy, dw, dh);
      try {
        const res = bg.seg.segmentForVideo(person, performance.now());
        const cm = res.confidenceMasks && res.confidenceMasks[0];
        if (cm) {
          const f = cm.getAsFloat32Array();
          if (!maskData || maskData.width !== cm.width) maskData = new ImageData(cm.width, cm.height);
          const d = maskData.data;
          for (let i = 0, j = 3; i < f.length; i++, j += 4) d[j] = f[i] > 0.75 ? 255 : f[i] < 0.35 ? 0 : (f[i] - 0.35) * 637;
          if (mask.width !== cm.width) { mask.width = cm.width; mask.height = cm.height; }
          mg.putImageData(maskData, 0, 0);
          cm.close && cm.close();
        }
        res.close && res.close();
      } catch (_) {}
      if (bg.mode === 'blur' || bg.mode === 'blur2') { g.filter = 'blur(' + (bg.mode === 'blur' ? 8 : 18) + 'px)'; g.drawImage(person, 0, 0); g.filter = 'none'; }
      else g.drawImage(scene, 0, 0);
      pg.globalCompositeOperation = 'destination-in';
      pg.filter = 'blur(2px)'; pg.drawImage(mask, 0, 0, W, H); pg.filter = 'none';
      pg.globalCompositeOperation = 'source-over';
      g.drawImage(person, 0, 0);
      const now = performance.now();
      if (now - last > 120) slow++; else slow = Math.max(0, slow - 1);
      last = now;
      if (slow === 40) toast('Background effects are slow on this device. Try “None” if your video lags.', null, 6000);
    }
    if (v.requestVideoFrameCallback) v.requestVideoFrameCallback(frame); else setTimeout(frame, 40);
  };
  frame();
  out.addEventListener('ended', () => { run.stop = true; });
  return out;
}
async function applyBg() {
  if (!local.camRaw) return;
  const next = await processedCam(local.camRaw);
  local.video = next;
  if (!local.screen) eachPeerSender('video', videoTrack());
  paintPreview();
  if (joined) paintSelfTile();
}
const BG_OPTS = [['none', '<i class="fa-solid fa-ban"></i>', 'None'], ['blur', '<i class="fa-solid fa-droplet"></i>', 'Blur'], ['blur2', '<i class="fa-solid fa-smog"></i>', 'Strong blur']]
  .concat(Object.entries(BG_PHOTOS).map(([k, l]) => [k, '', l]))
  .concat([['custom', '<i class="fa-solid fa-image"></i>', 'Your picture']]);
function paintBgPop() {
  $('bg-pop').innerHTML = '<b>Background</b><div class="bg-grid">' + BG_OPTS.map(([k, e, l]) => '<button type="button" data-bg="' + k + '" class="' + (bg.mode === k ? 'on' : '') + (BG_PHOTOS[k] ? ' ph' : '') + '"' + (BG_PHOTOS[k] ? ' style="background-image:url(/bg/' + k + '.jpg)"' : '') + '><span>' + e + '</span><em>' + l + '</em></button>').join('') + '</div>' +
    '<button type="button" class="btn ghost small" id="bg-up">Upload a picture…</button><input type="file" id="bg-file" accept="image/*" hidden>';
  $('bg-pop').querySelectorAll('[data-bg]').forEach((b) => { b.onclick = () => {
    if (!cooldown('bg')) return;
    if (b.dataset.bg === 'custom' && !bg.img) { $('bg-file').click(); return; }
    bg.mode = b.dataset.bg; store.set('em-bg', bg.mode); paintBgPop(); paintBgBtns();
    if (!me.cam) toast('Turn your camera on to see the effect');
    applyBg();
  }; });
  $('bg-up').onclick = () => $('bg-file').click();
  $('bg-file').onchange = async () => {
    const f = $('bg-file').files[0]; if (!f) return;
    const d = await shrinkImage(f, 960, 0.82).catch(() => null); if (!d) return;
    try { localStorage.setItem('em-bgimg', d); } catch (_) {}
    bg.img = new Image(); bg.img.onload = () => { bg.mode = 'custom'; store.set('em-bg', 'custom'); paintBgPop(); paintBgBtns(); applyBg(); }; bg.img.src = d;
  };
}
function paintBgBtns() { ['pre-bg', 'c-bg'].forEach((id) => $(id).classList.toggle('on', bg.mode !== 'none')); }
['pre-bg', 'c-bg'].forEach((id) => {
  $(id).onclick = (e) => {
    e.stopPropagation();
    const p = $('bg-pop');
    if (p.classList.contains('on')) { p.classList.remove('on'); return; }
    paintBgPop(); p.classList.add('on');
    const r = $(id).getBoundingClientRect(), w = p.offsetWidth, h = p.offsetHeight;
    p.style.left = Math.max(8, Math.min(innerWidth - w - 8, r.left + r.width / 2 - w / 2)) + 'px';
    p.style.top = (r.top > h + 16 ? r.top - h - 10 : r.bottom + 10) + 'px';
  };
});
addEventListener('pointerdown', (e) => { if (!e.target.closest('#bg-pop,#pre-bg,#c-bg')) $('bg-pop').classList.remove('on'); });
paintBgBtns();

 
(function buildFloatUI() {
  const call = document.querySelector('.call');
  const top = document.createElement('div');
  top.className = 'ctop'; top.id = 'ctop';
  top.innerHTML = '<span class="ct-live"></span><b id="ct-title">Meeting</b><span class="ct-sep"></span>' +
    '<span class="ct-dur" id="ct-dur">0:00</span><span class="ct-sep"></span><span class="ct-n" id="ct-n"><i class="fa-solid fa-user-group"></i> 1</span>' +
    '<button class="ct-btn" id="ct-copy" type="button" title="Copy meeting link"><svg viewBox="0 0 24 24"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg></button>' +
    '<button class="ct-btn" id="ct-mini" type="button" title="Pop out into a mini window"><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="3"/><rect x="11" y="11" width="8" height="6" rx="1.5" fill="currentColor" stroke="none"/></svg></button>';
  call.prepend(top);
  $('ct-copy').onclick = () => $('c-copy').click();
  $('c-copy').style.display = 'none';
  setInterval(() => {
    if (!joined) return;
    $('ct-dur').textContent = $('dur').textContent;
    const n = Object.keys(members).filter((k) => !members[k].ghost).length;
    if ($('ct-n').dataset.n !== String(n)) { $('ct-n').dataset.n = n; $('ct-n').innerHTML = '<i class="fa-solid fa-user-group"></i> ' + n; }
    const t = (pubEntry && pubEntry.title) || (meta && meta.speaker ? 'Speaker view' : 'Private meeting');
    if ($('ct-title').dataset.t !== t) { $('ct-title').dataset.t = t; $('ct-title').textContent = t; }
  }, 1000);
  const miniPos = store.get('em-minipos', null);
  function setMini(on) {
    document.documentElement.classList.toggle('mini', on);
    const s = $('scr-call');
    if (on) {
      closePanel && $('panel').classList.contains('on') && closePanel();
      $('scr-home').classList.add('on'); watchPublic();
      const p = miniPos || { x: innerWidth - 380, y: 16 };
      s.style.left = Math.max(8, Math.min(innerWidth - 368, p.x)) + 'px'; s.style.top = Math.max(8, Math.min(innerHeight - 260, p.y)) + 'px';
    } else {
      $('scr-home').classList.remove('on'); stopPublic();
      s.style.left = s.style.top = '';
    }
    setTimeout(layout, 60);
  }
  $('ct-mini').onclick = () => setMini(!document.documentElement.classList.contains('mini'));
  top.addEventListener('pointerdown', (e) => {
    if (!document.documentElement.classList.contains('mini') || e.target.closest('button')) return;
    const s = $('scr-call'), r = s.getBoundingClientRect(), ox = e.clientX - r.left, oy = e.clientY - r.top;
    const mv = (ev) => { s.style.left = Math.max(4, Math.min(innerWidth - r.width - 4, ev.clientX - ox)) + 'px'; s.style.top = Math.max(4, Math.min(innerHeight - r.height - 4, ev.clientY - oy)) + 'px'; };
    const up = () => { removeEventListener('pointermove', mv); removeEventListener('pointerup', up); store.set('em-minipos', { x: parseInt(s.style.left), y: parseInt(s.style.top) }); };
    addEventListener('pointermove', mv); addEventListener('pointerup', up);
  });
  window.__setMini = setMini;
})();

 
function customSelect(sel) {
  if (sel.dataset.cs) return;
  sel.dataset.cs = '1';
  const wrap = document.createElement('div'), btn = document.createElement('button'), list = document.createElement('div');
  wrap.className = 'cs'; btn.type = 'button'; btn.className = 'cs-btn'; list.className = 'cs-list';
  sel.after(wrap); wrap.append(sel, btn, list);
  const paint = () => {
    const o = sel.options[sel.selectedIndex];
    btn.innerHTML = '<span>' + esc(o ? o.text : '') + '</span><svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>';
  };
  const d = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value');
  Object.defineProperty(sel, 'value', { get() { return d.get.call(sel); }, set(v) { d.set.call(sel, v); paint(); } });
  new MutationObserver(paint).observe(sel, { childList: true, subtree: true });
  const close = () => wrap.classList.remove('open');
  btn.onclick = (e) => {
    e.stopPropagation();
    if (wrap.classList.contains('open')) { close(); return; }
    document.querySelectorAll('.cs.open').forEach((w) => w.classList.remove('open'));
    list.innerHTML = [...sel.options].map((o, i) => '<button type="button" data-i="' + i + '"' + (i === sel.selectedIndex ? ' class="on"' : '') + '>' + esc(o.text) + '</button>').join('');
    list.querySelectorAll('button').forEach((b) => { b.onclick = (ev) => {
      ev.stopPropagation();
      sel.selectedIndex = +b.dataset.i; paint(); close();
      sel.dispatchEvent(new Event('change', { bubbles: true }));
    }; });
    wrap.classList.add('open');
    const r = btn.getBoundingClientRect();
    const edge = Math.min(innerHeight, (wrap.closest('.panel,.modal-card') || document.body).getBoundingClientRect().bottom);
    wrap.classList.toggle('up', r.bottom + Math.min(260, list.scrollHeight) + 12 > edge);
  };
  paint();
}
document.querySelectorAll('select').forEach(customSelect);
addEventListener('pointerdown', (e) => { if (!e.target.closest('.cs')) document.querySelectorAll('.cs.open').forEach((w) => w.classList.remove('open')); });

 
const THEMES = [['#6366f1', '#818cf8'], ['#8b5cf6', '#c4b5fd'], ['#ec4899', '#f9a8d4'], ['#f43f5e', '#fda4af'], ['#f59e0b', '#fcd34d'], ['#10b981', '#6ee7b7'], ['#06b6d4', '#67e8f9'], ['#3b82f6', '#93c5fd']];
const theme = store.get('em-theme', { acc: 0, light: false });
function lighter(hex) {
  const n = parseInt(hex.slice(1), 16), m = (c) => Math.round(c + (255 - c) * 0.45);
  return '#' + [n >> 16, (n >> 8) & 255, n & 255].map((c) => m(c).toString(16).padStart(2, '0')).join('');
}
function applyTheme() {
  const custom = theme.acc === 'c' && /^#[0-9a-f]{6}$/i.test(theme.hex || '');
  const t = custom ? [theme.hex, lighter(theme.hex)] : THEMES[theme.acc] || THEMES[0], s = document.documentElement.style;
  s.setProperty('--acc', t[0]); s.setProperty('--acc2', t[1]);
  document.documentElement.classList.toggle('light', !!theme.light);
  document.querySelectorAll('.th-sw').forEach((b, i) => b.classList.toggle('on', i === theme.acc));
  const cw = document.querySelector('.th-custom');
  if (cw) { cw.classList.toggle('on', custom); cw.style.setProperty('--c', custom ? theme.hex : 'transparent'); cw.querySelector('input').value = custom ? theme.hex : t[0]; }
  document.querySelectorAll('.th-mode').forEach((b) => { b.innerHTML = theme.light ? '<i class="fa-solid fa-moon"></i> Dark mode' : '<i class="fa-solid fa-sun"></i> Light mode'; });
}
function themePop(anchor) {
  const p = $('theme-pop'), r = anchor.getBoundingClientRect();
  if (p.classList.contains('on')) { p.classList.remove('on'); return; }
  p.classList.add('on');
  const w = p.offsetWidth, h = p.offsetHeight;
  p.style.left = Math.max(8, Math.min(innerWidth - w - 8, r.right - w)) + 'px';
  p.style.top = (r.top > h + 16 ? r.top - h - 10 : r.bottom + 10) + 'px';
}
$('theme-pop').innerHTML = '<b>Accent</b><div class="th-row">' + THEMES.map((t, i) => '<button class="th-sw" data-i="' + i + '" style="--c:' + t[0] + '" aria-label="Accent color"></button>').join('') +
  '</div><label class="th-custom" title="Pick any color"><input type="color" aria-label="Custom accent color"><span><i class="fa-solid fa-eye-dropper"></i> Custom color</span></label><button class="btn ghost small th-mode"></button>';
$('theme-pop').querySelectorAll('.th-sw').forEach((b) => { b.onclick = () => { theme.acc = +b.dataset.i; store.set('em-theme', theme); applyTheme(); }; });
$('theme-pop').querySelector('.th-custom input').oninput = (e) => { theme.acc = 'c'; theme.hex = e.target.value; store.set('em-theme', theme); applyTheme(); };
$('theme-pop').querySelector('.th-mode').onclick = () => { theme.light = !theme.light; store.set('em-theme', theme); applyTheme(); };
['home-theme', 'c-theme'].forEach((id) => { $(id).onclick = (e) => { e.stopPropagation(); themePop($(id)); }; });
addEventListener('pointerdown', (e) => { if (!e.target.closest('#theme-pop,#home-theme,#c-theme')) $('theme-pop').classList.remove('on'); });
applyTheme();

 
$('btn-trailer').onclick = () => {
  const v = $('tr-video');
  v.src = '/trailer-v1.mp4';
  $('trailer-modal').classList.add('on');
  v.play().catch(() => {});
};
const closeTrailer = () => { const v = $('tr-video'); v.pause(); v.removeAttribute('src'); v.load(); $('trailer-modal').classList.remove('on'); };
$('tr-x').onclick = closeTrailer;
$('trailer-modal').onclick = (e) => { if (e.target.id === 'trailer-modal') closeTrailer(); };
$('btn-suggest').onclick = () => { $('sg-err').textContent = ''; $('sugg-modal').classList.add('on'); setTimeout(() => $('sg-text').focus(), 50); };
$('sg-x').onclick = () => $('sugg-modal').classList.remove('on');
$('form-sugg').onsubmit = async (e) => {
  e.preventDefault();
  const text = $('sg-text').value.trim();
  if (text.length < 3) { $('sg-err').textContent = 'Write a little more first.'; return; }
  const last = store.get('em-sugg-at', 0);
  if (Date.now() - last < 60000) { $('sg-err').textContent = 'Thanks! Give it a minute before sending another.'; return; }
  if (!uid) { $('sg-err').textContent = 'Still connecting. Try again in a second.'; return; }
  $('sg-go').disabled = true;
  try {
    const name = (isAccount() && profiles[uid] && profiles[uid].name) || me.name || 'Guest';
    await F.addDoc(F.collection(fsdb, 'suggestions'), { uid, name: name.slice(0, 40), text, at: Date.now() });
    store.set('em-sugg-at', Date.now());
    $('sg-text').value = '';
    $('sugg-modal').classList.remove('on');
    toast('Suggestion sent. Thank you!');
  } catch (_) { $('sg-err').textContent = 'Couldn’t send that. Try again in a bit.'; }
  $('sg-go').disabled = false;
};

 
let idleT = 0;
function wake() {
  document.documentElement.classList.remove('idle');
  clearTimeout(idleT);
  idleT = setTimeout(() => {
    if (joined && !$('panel').classList.contains('on') && matchMedia('(hover:hover)').matches && !document.querySelector('.menu.on,.react-pop.on,.modal.on,.theme-pop.on'))
      document.documentElement.classList.add('idle');
  }, 4000);
}
['pointermove', 'pointerdown', 'keydown'].forEach((ev) => addEventListener(ev, wake, { passive: true }));
function paintUnread() {
  $('chat-badge').textContent = unread;
  $('chat-badge').classList.toggle('on', unread > 0);
  $('chat-dot').classList.toggle('on', unread > 0 && panelTab !== 'chat');
}
function paintChatTo() {
  const v = $('chat-to').value;
  $('chat-to').parentElement.classList.toggle('pm', !!v);
  $('in-chat').placeholder = v && members[v] ? 'Private message to ' + members[v].name + ' (site owner can review)' : 'Send a message to everyone';
}
$('chat-to').onchange = paintChatTo;
 
let lastReport = 0;
async function reportMessage(c, pm) {
  if (Date.now() - lastReport < 10000) { toast('Wait a few seconds before reporting again'); return; }
  if (!confirm('Report this message from ' + c.name + ' to the site owner?')) return;
  lastReport = Date.now();
  try {
    await push(ref(db, 'reports'), {
      room, by: uid, byName: me.name, from: c.uid, fromName: String(c.name || '').slice(0, 40),
      text: String(c.text || '').slice(0, 1000), private: !!pm, at: Date.now()
    });
    toast('Reported — the site owner will see it');
  } catch (e) { toast('Couldn’t report: ' + (e.code || e.message)); }
}
function chatAdded(c, pm) {
  if (!c) return;
  const list = $('chat-list');
  const empty = list.querySelector('.chat-empty'); if (empty) empty.remove();
  const el = document.createElement('div');
  el.className = 'cm' + (c.uid === uid ? ' me' : '') + (pm ? ' pm' : '');
  const time = new Date(c.at || Date.now()).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const toName = pm ? (c.to === uid ? 'you' : ((members[c.to] && members[c.to].name) || c.toName || 'them')) : '';
  el.innerHTML = '<div class="cm-h"><b>' + esc(c.uid === uid ? 'You' : c.name) + (pm ? ' → ' + esc(toName) : '') + '</b><span>' + time + '</span>' +
    (pm ? '<span class="pm-tag">Private</span>' : '') + '</div><p></p>';
  el.querySelector('p').textContent = c.text;
  if (c.file && c.file.id) { el.querySelector('p').remove(); el.appendChild(fileCard(c)); }
  const cp = document.createElement('button');
  cp.type = 'button'; cp.className = 'cm-copy'; cp.title = 'Copy message';
  cp.innerHTML = IC.copy;
  cp.onclick = () => (navigator.clipboard ? navigator.clipboard.writeText(c.text) : Promise.reject())
    .then(() => toast('Message copied'), () => toast('Couldn’t copy'));
  el.appendChild(cp);
  if (c.uid !== uid) {
    const rb = document.createElement('button');
    rb.type = 'button'; rb.className = 'cm-report'; rb.title = 'Report this message to the site owner';
    rb.innerHTML = IC.flag;
    rb.onclick = () => reportMessage(c, pm);
    el.appendChild(rb);
  }
  const atBottom = list.scrollHeight - list.scrollTop - list.clientHeight < 60;
  list.appendChild(el);
  if (atBottom || c.uid === uid) list.scrollTop = list.scrollHeight;
  if (c.uid !== uid && (c.at || 0) > joinTime - 1000 && panelTab !== 'chat') {
    unread++; paintUnread();
    toast((pm ? '🔒 ' + c.name + ' (private): ' : c.name + ': ') + c.text.slice(0, 80));
  }
}
$('form-chat').onsubmit = (e) => {
  e.preventDefault();
  const text = $('in-chat').value.trim();
  if (!text || !cooldown('chat')) return;
  $('in-chat').value = '';
  const to = $('chat-to').value;
  if (to && members[to]) {
    const msg = { uid, name: me.name, to, text: text.slice(0, 1000), at: Date.now() };
    const key = push(R('dm/' + uid)).key;
    update(R(), { ['dm/' + to + '/' + key]: msg, ['dm/' + uid + '/' + key]: msg })
      .catch((er) => toast('Private message not sent: ' + er.code));
    return;
  }
  push(R('chat'), { uid, name: me.name, text: text.slice(0, 1000), at: Date.now() }).catch((er) => toast('Message not sent: ' + er.code));
};

 
 
function fmtDur(ms) {
  const t = Math.max(0, Math.floor(ms / 1000)), h = Math.floor(t / 3600), m = Math.floor(t / 60) % 60, sec = t % 60;
  return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(sec).padStart(2, '0');
}
setInterval(() => {
  $('clock').textContent = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  if (!joined) return;
  let start = joinTime;
  Object.values(members).forEach((m) => { if (m && m.at && m.at < start) start = m.at; });
  $('dur').textContent = fmtDur(Date.now() - start);
}, 1000);

 
function refreshRooms() {
  peers.forEach((p) => {
    const ok = sameRoom(p.id);
    if (p.ta) p.ta.sender.replaceTrack(ok ? sendAudio() : null).catch(() => {});
    if (p.tv) p.tv.sender.replaceTrack(ok ? videoTrack() : null).catch(() => {});
  });
  tiles.forEach((t, id) => {
    const ok = sameRoom(id);
    t.el.style.display = ok && !(members[id] && members[id].ghost) ? '' : 'none';
    if (id !== uid) { t.video.muted = !ok || localMuted.has(id) || meDeaf; t.video.volume = volOf(id); }
  });
  layout(); paintSubBar(); renderRooms(); renderPeople();
}
async function moveTo(sub, extra) {
  const old = me.sub;
  try { await update(R('members/' + uid), Object.assign({ sub }, extra || {})); }
  catch (e) { toast('Couldn’t switch rooms: ' + (e.code || e.message)); return false; }
  me.sub = sub;
  if (members[uid]) Object.assign(members[uid], { sub }, extra || {});
  refreshRooms();
  if (old && old !== sub && !Object.keys(members).some((id) => id !== uid && subOf(id) === old)) remove(R('subs/' + old)).catch(() => {});
  return true;
}
async function createSub(name) {
  if (!cooldown('room')) return;
  const k = rid().slice(0, 12);
  try {
    await update(R(), {
      ['subs/' + k]: { name: name.slice(0, 40), by: uid, at: Date.now(), allow: { [uid]: true } },
      ['members/' + uid + '/sub']: k
    });
  } catch (e) { toast('Couldn’t create the room: ' + (e.code || e.message)); return; }
  const old = me.sub;
  me.sub = k; if (members[uid]) members[uid].sub = k;
  subs[k] = { name, by: uid, at: Date.now(), allow: { [uid]: true } };
  refreshRooms();
  if (old && !Object.keys(members).some((id) => id !== uid && subOf(id) === old)) remove(R('subs/' + old)).catch(() => {});
  toast('You’re in 🔒 ' + name + ' — invite people to talk privately');
}
async function joinSub(k) {
  if (!subs[k]) { toast('That room is gone'); return; }
  if (await moveTo(k)) toast('You joined 🔒 ' + subs[k].name);
}
async function goMain(gone) {
  if (!me.sub && !gone) return;
  if (gone) { me.sub = ''; update(R('members/' + uid), { sub: '' }).catch(() => {}); refreshRooms(); toast('That private room closed — you’re back in the main room'); return; }
  if (await moveTo('')) toast('Back in the main room');
}
function inviteMenu(anchor) {
  const ids = Object.keys(members).filter((id) => id !== uid && subOf(id) !== me.sub);
  if (!ids.length) { toast('Everyone is already here'); return; }
  openMenu(anchor, ids.map((id) => ({
    icon: IC.chat, label: 'Invite ' + members[id].name,
    fn: async () => {
      if (!cooldown('invite')) return;
      try {
        await set(R('subs/' + me.sub + '/allow/' + id), true);
        await push(R('subinv/' + id), { from: uid, sub: me.sub, name: subs[me.sub].name, at: Date.now() });
        toast('Invited ' + members[id].name);
      } catch (e) { toast('Couldn’t invite: ' + (e.code || e.message)); }
    }
  })));
}
function paintSubBar() {
  const bar = $('sub-bar');
  if (!me.sub || !subs[me.sub]) { bar.classList.remove('on'); bar.innerHTML = ''; setTimeout(layout, 0); return; }
  const n = Object.keys(members).filter((id) => subOf(id) === me.sub && !members[id].ghost).length;
  const lis = !!(members[uid] && members[uid].ghost);
  bar.innerHTML = '<span class="sb-t"><i class="fa-solid fa-lock"></i> <b>' + esc(subs[me.sub].name) + '</b> · ' + (lis ? '<i class="fa-solid fa-ghost"></i> listening silently · ' : 'private room · ') + n + ' here</span>' +
    (lis ? '' : '<button class="btn ghost small" id="sb-invite">Invite</button>') + '<button class="btn primary small" id="sb-main">' + (lis ? 'Stop listening' : 'Back to main room') + '</button>';
  bar.classList.add('on');
  if ($('sb-invite')) $('sb-invite').onclick = (e) => inviteMenu(e.currentTarget);
  $('sb-main').onclick = () => { if (lis) { leave('left', true); setTimeout(() => go('/'), 0); } else goMain(false); };
  setTimeout(layout, 0);
}
function renderRooms() {
  const list = $('rooms-list'); if (!list) return;
  const inRoom = (k) => Object.keys(members).filter((id) => subOf(id) === k);
  const visibleInRoom = (k) => inRoom(k).filter((id) => !members[id].ghost);
  const main = visibleInRoom('');
  let h = '<div class="room-row' + (!me.sub ? ' here' : '') + '"><div class="rr-t"><b>Main room</b><em>' +
    main.length + ' here' + (main.length ? ' · ' + esc(main.slice(0, 4).map((id) => members[id].name).join(', ')) : '') + '</em></div>' +
    (me.sub ? '<button class="btn primary small" data-main="1">Go back</button>' : '<span class="tagx">You’re here</span>') + '</div>';
  Object.keys(subs).forEach((k) => {
    const who = visibleInRoom(k), sub = subs[k];
    if (!who.length && k !== me.sub) return;
    const can = !!(sub.allow && sub.allow[uid]);
    h += '<div class="room-row' + (me.sub === k ? ' here' : '') + '"><div class="rr-t"><b><i class="fa-solid fa-lock"></i> ' + esc(sub.name) + '</b><em>' + who.length + ' here' +
      (who.length ? ' · ' + esc(who.slice(0, 4).map((id) => members[id].name).join(', ')) : '') + '</em></div>' +
      (me.sub === k ? '<span class="tagx">You’re here</span>' : can ? '<button class="btn primary small" data-join="' + esc(k) + '">Join</button>' : '<span class="tagx">Invite only</span>') + '</div>';
  });
  list.innerHTML = h;
  list.querySelectorAll('[data-join]').forEach((b) => { b.onclick = () => joinSub(b.dataset.join); });
  list.querySelectorAll('[data-main]').forEach((b) => { b.onclick = () => goMain(false); });
}
$('form-room').onsubmit = (e) => {
  e.preventDefault();
  const n = $('in-room').value.trim();
  if (!n) { $('in-room').focus(); return; }
  $('in-room').value = '';
  createSub(n);
};

 
 
const REACTS = ['👍', '❤️', '😂', '😮', '👏', '🎉', '🔥', '😢'];
const reactPop = $('react-pop');
reactPop.innerHTML = REACTS.map((e) => '<button type="button" data-e="' + e + '">' + e + '</button>').join('');
$('c-react').onclick = (ev) => {
  ev.stopPropagation();
  if (reactPop.classList.toggle('on')) {
    const r = $('c-react').getBoundingClientRect();
    reactPop.style.left = Math.max(8, Math.min(innerWidth - reactPop.offsetWidth - 8, r.left + r.width / 2 - reactPop.offsetWidth / 2)) + 'px';
    reactPop.style.top = (r.top - reactPop.offsetHeight - 10) + 'px';
  }
};
reactPop.onclick = (ev) => {
  const b = ev.target.closest('[data-e]');
  if (!b || !joined || !cooldown('react')) return;
  push(R('rx'), { uid, e: b.dataset.e, at: Date.now() })
    .then((rf) => setTimeout(() => remove(rf).catch(() => {}), 6000), () => {});
};
document.addEventListener('mousedown', (e) => {
  if (!reactPop.contains(e.target) && !e.target.closest('#c-react')) reactPop.classList.remove('on');
}, true);
function floatReact(v) {
  if (REACTS.indexOf(v.e) < 0 || !sameRoom(v.uid)) return;
  const t = tiles.get(v.uid);
  const box = t ? t.el.getBoundingClientRect() : { left: 40, width: 120, bottom: innerHeight - 90 };
  const el = document.createElement('div');
  el.className = 'float';
  el.style.left = (box.left + box.width * (0.25 + Math.random() * 0.5)) + 'px';
  el.style.top = (Math.min(box.bottom, innerHeight - 90) - 70) + 'px';
  el.innerHTML = '<span class="fe">' + v.e + '</span><span class="fn">' + esc(v.uid === uid ? 'You' : (members[v.uid] ? members[v.uid].name : '')) + '</span>';
  $('floats').appendChild(el);
  setTimeout(() => el.remove(), 3300);
  reactSfx(v.e);
}

 
$('c-leave').onclick = () => {
  const others = Object.keys(members).filter((id) => id !== uid);
  if (!isMod || !others.length) { leave('left'); return; }
  const otherMods = others.filter((id) => mods[id]);
  const cands = others.filter((id) => !mods[id]);
  $('leave-to').innerHTML = (cands.length ? cands : others)
    .map((id) => '<option value="' + esc(id) + '">' + esc(members[id].name) + '</option>').join('');
  $('lv-random').style.display = cands.length ? '' : 'none';
  $('leave-to').parentElement.style.display = cands.length ? '' : 'none';
  $('lv-just-em').textContent = otherMods.length
    ? (otherMods.length === 1 ? members[otherMods[0]].name + ' is' : otherMods.length + ' others are') + ' still a mod'
    : 'Whoever has been here longest becomes a mod automatically';
  $('leave-modal').classList.add('on');
};
function closeLeave() { $('leave-modal').classList.remove('on'); }
$('lv-cancel').onclick = closeLeave;
$('leave-modal').onclick = (e) => { if (e.target === $('leave-modal')) closeLeave(); };
async function handOff(id) {
  if (!id || !members[id]) { toast('They already left'); return; }
  try { await set(R('mods/' + id), true); } catch (e) { toast('Couldn’t hand off mod: ' + e.code); return; }
  const n = members[id].name;
  closeLeave(); leave('left');
  toast(n + ' is now a mod');
}
$('lv-pass').onclick = () => handOff($('leave-to').value);
$('lv-random').onclick = () => {
  const cands = Object.keys(members).filter((id) => id !== uid && !mods[id]);
  handOff(cands[Math.floor(Math.random() * cands.length)]);
};
$('lv-just').onclick = () => { closeLeave(); leave('left'); };
$('lv-end').onclick = async () => {
  if (!confirm('End the meeting for everyone?')) return;
  const others = Object.keys(members).filter((id) => id !== uid);
  try {
    await Promise.all(others.map((id) => push(R('cmd/' + id), { type: 'end', by: uid })));
    const u = { ['public/' + room]: null };
    others.forEach((id) => { u['rooms/' + room + '/members/' + id] = null; });
    Object.keys(lobby).forEach((id) => { u['rooms/' + room + '/lobby/' + id] = null; });
    await update(ref(db), u);
  } catch (e) { toast('Couldn’t end the meeting: ' + (e.code || e.message)); return; }
  const id = room;
  closeLeave();
  leave('left', true);
  deleteRoom(id);
  $('end-h').textContent = 'You ended the meeting';
  $('end-p').textContent = 'It’s been deleted — chat, private messages and all.';
  $('btn-rejoin').style.display = 'none';
}
function teardown() {
  pollCards.clear(); fileCards.clear();
  held = null; if (meDeaf) { meDeaf = false; $('c-deaf').classList.remove('off'); $('c-deaf').innerHTML = '<i class="fa-solid fa-headphones"></i>'; }
  if (document.documentElement.classList.contains('mini') && window.__setMini) window.__setMini(false);
  game = null; gvotes = {}; $('game').classList.remove('on');
  bgm = null; if (bgmAudio) { bgmAudio.pause(); } bgmCur = null; $('bgm-pill').classList.remove('on'); $('bgm-modal').classList.remove('on');
  joined = false;
  pendingSubJoin = null;
  closeOwnerFloat();
  unsubs.splice(0).forEach((f) => { try { f(); } catch (_) {} });
  watchLobby(false);
  watchBanned(false);
  kickedFlag = false; endedFlag = false; localMuted.clear();
  me.sub = ''; subs = {}; $('sub-bar').classList.remove('on');
  clearTimeout(autoModTimer); modsOnline = {};
  stopMusic();
  $('react-pop').classList.remove('on'); $('leave-modal').classList.remove('on');
  clearInterval(startMeters.t);
  clearInterval(qTimer); warnedWeak = false; pinned = null; autoPinned = false;
  meters.forEach((_, id) => dropMeter(id));
  peers.forEach((_, id) => closePeer(id));
  tiles.clear(); $('grid').innerHTML = '';
  closePanel(); unread = 0; paintUnread();
  me.hand = false;
  if (local.screen) stopScreen();
}
 
function deleteRoom(id) {
  return update(ref(db), { ['rooms/' + id]: null, ['roomIndex/' + id]: null, ['public/' + id]: null })
    .catch((e) => console.warn('[meet] delete room', id, e.code || e));
}
function leave(why, ending) {
  const was = joined;
  const id = room;
  const lastOne = was && why === 'left' && !Object.keys(members).some((m) => m !== uid);
  if (was && isMod) markModOnline(false);
  teardown();
  if (was) {
    onDisconnect(R('members/' + uid)).cancel();
    remove(R('members/' + uid)).then(() => { if (lastOne && !ending) deleteRoom(id); }, () => {});
  }
  stopMedia();
  endScreen(why);
  if (lastOne && !ending) {
    $('end-h').textContent = 'Meeting ended';
    $('end-p').textContent = 'You were the last one here, so the meeting was deleted.';
    $('btn-rejoin').style.display = 'none';
  }
}
function endScreen(why) {
  show('end');
  const H = {
    left: ['You left the meeting', ''],
    removed: ['You were removed', 'A mod removed you from this meeting. You can ask to join again.'],
    banned: ['You were banned', 'A mod banned you from this meeting.'],
    dropped: ['You got disconnected', 'Your connection to the meeting dropped.'],
    ended: ['The meeting ended', 'A mod ended this meeting for everyone.'],
    blocked: ['You’re blocked from EchoMeet', 'The site owner blocked this account or device.'],
    full: ['This meeting is full', 'This meeting can have up to ' + capOf(meta) + ' people.']
  }[why] || ['Meeting ended', ''];
  $('end-h').textContent = H[0]; $('end-p').textContent = H[1];
  $('btn-rejoin').textContent = 'Rejoin';
  $('btn-rejoin').style.display = why === 'banned' || why === 'ended' || why === 'blocked' ? 'none' : '';
  $('btn-rejoin').onclick = () => prejoin();
}
$('btn-home').onclick = () => { stopMedia(); get(ref(db, 'appVersion')).then((v) => { if ((Number(v.val()) || 0) > APP_VERSION) location.reload(); else go('/'); }, () => go('/')); };
addEventListener('pagehide', () => { if (joined) remove(R('members/' + uid)); });
