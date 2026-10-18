 
(function (global) {
'use strict';

var CATALOG = [
  { id: 'gold',            type: 'ring',   name: 'Gold',            rarity: 'Legendary', price: 2000, desc: 'A polished gold band with a shine that runs around it.' },
  { id: 'fire',            type: 'ring',   name: 'Fire',            rarity: 'Legendary', price: 1800, desc: 'Flames rise off the edge of your avatar.' },
  { id: 'galaxy',          type: 'ring',   name: 'Galaxy',          rarity: 'Epic',      price: 1200, desc: 'Purple space swirls around you and pulls stars in.' },
  { id: 'northern-lights', type: 'ring',   name: 'Northern Lights', rarity: 'Epic',      price: 1000, desc: 'Green and violet light waving around the edge.' },
  { id: 'neon',            type: 'ring',   name: 'Neon',            rarity: 'Rare',      price: 700,  desc: 'Neon lines with pulses running along them.' },
  { id: 'ice',             type: 'ring',   name: 'Ice',             rarity: 'Rare',      price: 600,  desc: 'A frozen edge with snowflakes drifting off.' },
  { id: 'cherry-blossom',  type: 'ring',   name: 'Cherry Blossom',  rarity: 'Rare',      price: 600,  desc: 'Pink petals circle around, then fall away.' },
  { id: 'sonar',           type: 'ring',   name: 'Sonar',           rarity: 'Uncommon',  price: 350,  desc: 'Rings ripple out from you like a sonar ping.' },
  { id: 'rgb',             type: 'nameFx', name: 'RGB',             rarity: 'Epic',      price: 800,  desc: 'Rainbow colours scroll through your name.' },
  { id: 'glitch',          type: 'nameFx', name: 'Glitch',          rarity: 'Rare',      price: 500,  desc: 'Your name flickers like a bad signal.' },
  { id: 'lava',            type: 'nameFx', name: 'Lava',            rarity: 'Rare',      price: 500,  desc: 'Glowing orange, like molten rock.' },
  { id: 'night-sky',       type: 'banner', name: 'Night Sky',       rarity: 'Epic',      price: 900,  desc: 'Twinkling stars and slow purple clouds.' },
  { id: 'retro',           type: 'banner', name: 'Retro',           rarity: 'Rare',      price: 650,  desc: 'A neon sunset over a moving grid.' },
  { id: "tag-star", type: 'tag', name: "Star", text: "STAR", bg: "#7dd3fc", rarity: "Rare", price: 500, desc: "Shining bright." },
  { id: "tag-cool", type: 'tag', name: "Cool", text: "COOL", bg: "#67e8f9", rarity: "Rare", price: 600, desc: "Effortlessly." },
  { id: "tag-tuff", type: 'tag', name: "Tuff", text: "TUFF", bg: "#ef4444", fg: "#fff", rarity: "Epic", price: 800, desc: "Certified tuff." },
  { id: "tag-special", type: 'tag', name: "Special", text: "SPECIAL", bg: "#c084fc", rarity: "Epic", price: 800, desc: "One of a kind." },
  { id: "tag-yummy", type: 'tag', name: "Yummy", text: "YUMMY", bg: "#f9a8d4", rarity: "Uncommon", price: 300, desc: "Delicious." },
  { id: "tag-aura", type: 'tag', name: "Aura", text: "AURA", bg: "#a78bfa", rarity: "Epic", price: 700, desc: "+1000 aura." },
  { id: "tag-larp", type: 'tag', name: "Larp", text: "LARP", bg: "#86efac", rarity: "Rare", price: 600, desc: "None of it was real." },
  { id: "tag-name", type: 'tag', name: "Name", text: "NAME", bg: "#f1f5f9", rarity: "Uncommon", price: 300, desc: "It just says NAME." },
  { id: "tag-snek", type: 'tag', name: "Snek", text: "SNEK", bg: "#16a34a", fg: "#fff", rarity: "Rare", price: 600, desc: "Boop noodle." },
  { id: "tag-tsundere", type: 'tag', name: "Tsundere", text: "TSUNDERE", bg: "#fb7185", rarity: "Rare", price: 500, desc: "It's not like I like you or anything..." },
  { id: "tag-beans", type: 'tag', name: "Beans", text: "BEANS", bg: "#d97706", fg: "#fff", rarity: "Uncommon", price: 300, desc: "Delicious." },
  { id: "tag-angel", type: 'tag', name: "Angel", text: "ANGEL", bg: "#ffffff", rarity: "Rare", price: 500, desc: "I've done nothing wrong." },
  { id: "tag-evil", type: 'tag', name: "Evil", text: "EVIL", bg: "#be123c", fg: "#fff", rarity: "Epic", price: 740, desc: "Muahahaha." },
  { id: "tag-turtle", type: 'tag', name: "Turtle", text: "TURTLE", bg: "#4ade80", rarity: "Rare", price: 500, desc: "I like turtles." },
  { id: "tag-failing", type: 'tag', name: "Failing", text: "FAILING", bg: "#dc2626", fg: "#fff", rarity: "Uncommon", price: 400, desc: "Grades are not looking good." },
  { id: "tag-goat", type: 'tag', name: "Goat", text: "GOAT", bg: "#fbbf24", rarity: "Legendary", price: 900, desc: "Greatest of all time." },
  { id: "tag-npc", type: 'tag', name: "Npc", text: "NPC", bg: "#9ca3af", rarity: "Uncommon", price: 400, desc: "Just here for the background." },
  { id: "tag-menace", type: 'tag', name: "Menace", text: "MENACE", bg: "#7f1d1d", fg: "#fff", rarity: "Epic", price: 700, desc: "Menace to society." }
];
var RARITY = {
  Legendary: '#fbbf24',
  Epic: '#c084fc',
  Rare: '#38bdf8',
  Uncommon: '#34d399'
};

 
var CSS =
  '.es-fx-rgb{background:linear-gradient(90deg,#67e8f9,#a78bfa,#f472b6,#fbbf24,#67e8f9);background-size:300% 100%;' +
    '-webkit-background-clip:text;background-clip:text;color:transparent!important;-webkit-text-fill-color:transparent;animation:esFxRgb 5s linear infinite}' +
  '@keyframes esFxRgb{to{background-position:300% 0}}' +
  '.es-fx-glitch{position:relative;display:inline-block;color:#f5f5ff!important;animation:esFxJit 2.4s steps(1) infinite}' +
  '.es-fx-glitch::before,.es-fx-glitch::after{content:attr(data-es-text);position:absolute;left:0;top:0;width:100%;height:100%;mix-blend-mode:screen;pointer-events:none;overflow:hidden}' +
  '.es-fx-glitch::before{color:#22d3ee;animation:esFxG1 1.8s steps(2) infinite}' +
  '.es-fx-glitch::after{color:#f472b6;animation:esFxG2 1.6s steps(2) infinite}' +
  '@keyframes esFxG1{0%{clip-path:inset(0 0 60% 0);transform:translate(-2px,-1px)}25%{clip-path:inset(20% 0 40% 0);transform:translate(2px,1px)}50%{clip-path:inset(60% 0 5% 0);transform:translate(-3px,0)}75%{clip-path:inset(10% 0 75% 0);transform:translate(1px,-1px)}100%{clip-path:inset(0 0 60% 0);transform:translate(-2px,0)}}' +
  '@keyframes esFxG2{0%{clip-path:inset(55% 0 0 0);transform:translate(2px,1px)}33%{clip-path:inset(30% 0 35% 0);transform:translate(-2px,0)}66%{clip-path:inset(70% 0 10% 0);transform:translate(3px,-1px)}100%{clip-path:inset(55% 0 0 0);transform:translate(2px,1px)}}' +
  '@keyframes esFxJit{0%,92%,100%{transform:none}94%{transform:translate(1px,-1px) skewX(-6deg)}96%{transform:translate(-1px,1px)}}' +
  '.es-fx-lava{background:linear-gradient(0deg,#7f1d1d 0%,#dc2626 25%,#f97316 50%,#fde68a 75%,#fff7ed 100%);background-size:100% 220%;' +
    '-webkit-background-clip:text;background-clip:text;color:transparent!important;-webkit-text-fill-color:transparent;' +
    'animation:esFxLava 2.6s ease-in-out infinite alternate;filter:drop-shadow(0 0 8px rgba(249,115,22,.45))}' +
  '@keyframes esFxLava{from{background-position:0 0}to{background-position:0 100%}}' +
  '.es-tag{display:inline-flex;align-items:center;margin-left:6px;padding:1px 6px;border-radius:5px;font:800 9.5px/1.5 Inter,system-ui,sans-serif;letter-spacing:.04em;white-space:nowrap;vertical-align:middle;flex-shrink:0}' +
  '';
function injectCss() {
  if (document.getElementById('echo-cosmetics-css')) return;
  var st = document.createElement('style');
  st.id = 'echo-cosmetics-css';
  st.textContent = CSS;
  (document.head || document.documentElement).appendChild(st);
}
injectCss();

var FX_CLASSES = ['es-fx-rgb', 'es-fx-glitch', 'es-fx-lava'];
function applyName(el, id, text) {
  if (!el) return;
  FX_CLASSES.forEach(function (c) { el.classList.remove(c); });
  if (id && byId(id) && byId(id).type === 'nameFx') {
    el.classList.add('es-fx-' + id);
    el.setAttribute('data-es-text', text != null ? text : el.textContent);
  } else {
    el.removeAttribute('data-es-text');
  }
}

function byId(id) {
  for (var i = 0; i < CATALOG.length; i++) if (CATALOG[i].id === id) return CATALOG[i];
  return null;
}

 
var TAU = Math.PI * 2;
function rnd(a, b) { return a + Math.random() * (b - a); }
function hsla(h, s, l, a) { return 'hsla(' + h.toFixed(1) + ',' + s + '%,' + l + '%,' + Math.max(0, a).toFixed(3) + ')'; }
function conic(g, a, cx, cy, cols, fallback) {
  if (!g.createConicGradient) return fallback;
  var c = g.createConicGradient(a, cx, cy);
  cols.forEach(function (col, i) { c.addColorStop(i / (cols.length - 1), col); });
  return c;
}
function halo(g, cx, cy, r0, r1, stops) {
  var gr = g.createRadialGradient(cx, cy, r0, cx, cy, r1);
  stops.forEach(function (s) { gr.addColorStop(s[0], s[1]); });
  g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, r1, 0, TAU); g.fill();
}
function star(g, x, y, r, col) {
  if (r <= 0.2) return;
  g.fillStyle = col; g.beginPath();
  g.moveTo(x, y - r); g.lineTo(x + r * 0.16, y - r * 0.16); g.lineTo(x + r, y); g.lineTo(x + r * 0.16, y + r * 0.16);
  g.lineTo(x, y + r); g.lineTo(x - r * 0.16, y + r * 0.16); g.lineTo(x - r, y); g.lineTo(x - r * 0.16, y - r * 0.16);
  g.closePath(); g.fill();
}
function flake(g, x, y, r, rot, col) {
  g.save(); g.translate(x, y); g.rotate(rot); g.strokeStyle = col; g.lineWidth = Math.max(0.6, r * 0.14); g.lineCap = 'round';
  for (var i = 0; i < 6; i++) {
    g.rotate(TAU / 6); g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -r);
    g.moveTo(0, -r * 0.55); g.lineTo(r * 0.28, -r * 0.8); g.moveTo(0, -r * 0.55); g.lineTo(-r * 0.28, -r * 0.8); g.stroke();
  }
  g.restore();
}
function petal(g, x, y, r, rot, al) {
  g.save(); g.translate(x, y); g.rotate(rot); g.globalAlpha = Math.max(0, Math.min(1, al));
  var gr = g.createLinearGradient(0, -r, 0, r); gr.addColorStop(0, '#fdf2f8'); gr.addColorStop(1, '#f472b6');
  g.fillStyle = gr; g.beginPath(); g.moveTo(0, -r); g.quadraticCurveTo(r * 0.95, -r * 0.15, 0, r); g.quadraticCurveTo(-r * 0.95, -r * 0.15, 0, -r); g.fill();
  g.strokeStyle = 'rgba(219,39,119,0.35)'; g.lineWidth = 0.5; g.beginPath(); g.moveTo(0, -r * 0.7); g.lineTo(0, r * 0.8); g.stroke();
  g.restore();
}
function blossom(g, x, y, r, rot) {
  g.save(); g.translate(x, y); g.rotate(rot);
  for (var i = 0; i < 5; i++) { g.rotate(TAU / 5); g.fillStyle = i % 2 ? '#fbcfe8' : '#f9a8d4'; g.beginPath(); g.ellipse(0, -r * 0.55, r * 0.4, r * 0.58, 0, 0, TAU); g.fill(); }
  g.fillStyle = '#fde68a'; g.beginPath(); g.arc(0, 0, r * 0.24, 0, TAU); g.fill();
  g.restore();
}
function drawAvatar(g, cx, cy, R, img) {
  g.save();
  g.beginPath(); g.arc(cx, cy, R, 0, TAU); g.closePath();
  g.fillStyle = '#1e1b4b'; g.fill(); g.clip();
  if (img && img.complete && img.naturalWidth) {
    var s = Math.max((2 * R) / img.naturalWidth, (2 * R) / img.naturalHeight);
    var w = img.naturalWidth * s, h = img.naturalHeight * s;
    try { g.drawImage(img, cx - w / 2, cy - h / 2, w, h); } catch (e) {}
  } else {
    g.fillStyle = 'rgba(199,210,254,0.6)';
    g.beginPath(); g.arc(cx, cy - R * 0.16, R * 0.34, 0, TAU); g.fill();
    g.beginPath(); g.ellipse(cx, cy + R * 0.82, R * 0.68, R * 0.54, 0, 0, TAU); g.fill();
  }
  g.restore();
}

 
var FX = {
  'gold': {
    back: function (g, cx, cy, R) {
      var s = R / 56;
      halo(g, cx, cy, R * 0.95, R + 24 * s, [[0, 'rgba(251,191,36,0.28)'], [0.55, 'rgba(245,158,11,0.08)'], [1, 'rgba(245,158,11,0)']]);
    },
    front: function (g, cx, cy, R, t, dt, sm) {
      var s = R / 56, rb = R + 3.2 * s, bw = Math.max(2.2, 6 * s);
      g.beginPath(); g.arc(cx, cy, rb, 0, TAU);
      g.strokeStyle = conic(g, t * 0.45, cx, cy, ['#78350f', '#fde68a', '#b45309', '#fff7cc', '#a16207', '#fcd34d', '#92400e', '#fef3c7', '#78350f'], '#d4a017');
      g.lineWidth = bw;
      if (!sm) { g.shadowColor = 'rgba(251,191,36,0.55)'; g.shadowBlur = 10 * s; }
      g.stroke(); g.shadowBlur = 0;
      g.lineWidth = Math.max(0.5, 0.8 * s);
      g.beginPath(); g.arc(cx, cy, rb - bw / 2, 0, TAU); g.strokeStyle = 'rgba(69,26,3,0.75)'; g.stroke();
      g.beginPath(); g.arc(cx, cy, rb + bw / 2, 0, TAU); g.strokeStyle = 'rgba(254,243,199,0.55)'; g.stroke();
      g.globalCompositeOperation = 'lighter';
      if (g.createConicGradient) {
        var sp = g.createConicGradient(t * 1.3, cx, cy);
        sp.addColorStop(0, 'rgba(255,255,255,0)'); sp.addColorStop(0.9, 'rgba(255,255,255,0)');
        sp.addColorStop(0.975, 'rgba(255,255,255,0.85)'); sp.addColorStop(1, 'rgba(255,255,255,0)');
        g.beginPath(); g.arc(cx, cy, rb, 0, TAU); g.strokeStyle = sp; g.lineWidth = bw * 0.7; g.stroke();
      }
      if (!sm) {
        for (var i = 0; i < 4; i++) {
          var ph = (t * 0.55 + i * 0.53) % 2.2;
          if (ph < 0.35) {
            var k = Math.sin(ph / 0.35 * Math.PI), a = i * 1.9 + Math.floor(t * 0.25 + i * 0.4) * 2.4;
            star(g, cx + Math.cos(a) * (rb + bw * 0.3), cy + Math.sin(a) * (rb + bw * 0.3), 9 * s * k, 'rgba(255,251,235,' + (0.95 * k).toFixed(2) + ')');
          }
        }
      }
    }
  },
  'fire': {
    back: function (g, cx, cy, R) {
      var s = R / 56;
      halo(g, cx, cy, R * 0.95, R + 32 * s, [[0, 'rgba(251,146,60,0.5)'], [0.4, 'rgba(239,68,68,0.2)'], [1, 'rgba(239,68,68,0)']]);
    },
    front: function (g, cx, cy, R, t, dt, sm, o) {
      var s = R / 56;
      o.acc += (sm ? 36 : 150) * dt;
      while (o.acc >= 1) { o.acc--; o.p.push({ a: Math.random() * TAU, r: R + rnd(0, 2) * s, vr: rnd(14, 34) * s, va: rnd(-0.6, 0.6), age: 0, life: rnd(0.5, 1.1), sz: rnd(2.2, 4.4) * s }); }
      if (o.p.length > 400) o.p.splice(0, o.p.length - 400);
      g.globalCompositeOperation = 'lighter';
      for (var i = o.p.length - 1; i >= 0; i--) {
        var p = o.p[i]; p.age += dt;
        if (p.age >= p.life) { o.p.splice(i, 1); continue; }
        var k = p.age / p.life;
        p.r += p.vr * dt * (1 - k * 0.5); p.a += p.va * dt + Math.sin(t * 3 + p.r * 0.2) * 0.004;
        var x = cx + Math.cos(p.a) * p.r, y = cy + Math.sin(p.a) * p.r;
        var rad = p.sz * (1 - k * 0.6) * 2.2;
        var gr = g.createRadialGradient(x, y, 0, x, y, rad);
        gr.addColorStop(0, hsla(55 - 50 * k, 100, 95 - 45 * k, (1 - k) * 0.85)); gr.addColorStop(1, hsla(20, 100, 40, 0));
        g.fillStyle = gr; g.beginPath(); g.arc(x, y, rad, 0, TAU); g.fill();
      }
      if (!sm) { g.shadowColor = 'rgba(251,146,60,0.95)'; g.shadowBlur = 16 * s; }
      g.beginPath(); g.arc(cx, cy, R + 1.5 * s, 0, TAU);
      g.strokeStyle = conic(g, -t * 0.8, cx, cy, ['#fde68a', '#fb923c', '#ef4444', '#fb923c', '#fde047', '#f97316', '#fde68a'], '#fb923c');
      g.lineWidth = Math.max(1.5, 3.2 * s); g.stroke();
    }
  },
  'galaxy': {
    back: function (g, cx, cy, R) {
      var s = R / 56;
      halo(g, cx, cy, R * 0.9, R + 30 * s, [[0, 'rgba(88,28,135,0.95)'], [0.35, 'rgba(76,29,149,0.45)'], [1, 'rgba(30,27,75,0)']]);
    },
    front: function (g, cx, cy, R, t, dt, sm, o) {
      var s = R / 56, K = sm ? 3 : 6, i, j;
      g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';
      for (var k = 0; k < K; k++) {
        var a0 = k / K * TAU + t * 0.9;
        g.beginPath();
        for (j = 0; j <= 40; j++) {
          var u = j / 40, a = a0 + u * 1.9;
          var r = R + 2 * s + (4 + 11 * Math.sin(u * Math.PI)) * s * (0.6 + 0.4 * Math.sin(t * 1.7 + k * 2.1)) + Math.sin(a * 5 + t * 3) * 1.5 * s;
          var x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
          if (j) g.lineTo(x, y); else g.moveTo(x, y);
        }
        g.strokeStyle = k % 2 ? 'rgba(192,132,252,0.6)' : 'rgba(236,72,153,0.42)';
        g.lineWidth = (k % 2 ? 1.6 : 2.6) * s;
        if (!sm) { g.shadowColor = 'rgba(168,85,247,0.95)'; g.shadowBlur = 9 * s; }
        g.stroke();
      }
      g.shadowBlur = 0;
      if (!sm) {
        o.acc += 60 * dt;
        while (o.acc >= 1) { o.acc--; o.p.push({ a: Math.random() * TAU, r: R + rnd(18, 30) * s }); }
        for (i = o.p.length - 1; i >= 0; i--) {
          var p = o.p[i];
          p.a += dt * 1.3 * (R + 30 * s) / p.r; p.r -= dt * 16 * s;
          if (p.r < R + 1 * s) { o.p.splice(i, 1); continue; }
          var al = Math.min(1, (R + 30 * s - p.r) / (10 * s)) * 0.9;
          g.fillStyle = 'rgba(233,213,255,' + al.toFixed(2) + ')';
          g.beginPath(); g.arc(cx + Math.cos(p.a) * p.r, cy + Math.sin(p.a) * p.r, 1.1 * s, 0, TAU); g.fill();
        }
      }
      g.beginPath(); g.arc(cx, cy, R + 1 * s, 0, TAU);
      g.strokeStyle = 'rgba(216,180,254,0.95)'; g.lineWidth = Math.max(1, 1.5 * s);
      if (!sm) { g.shadowColor = 'rgba(192,132,252,1)'; g.shadowBlur = 12 * s; }
      g.stroke();
    }
  },
  'northern-lights': {
    front: function (g, cx, cy, R, t, dt, sm) {
      var s = R / 56, N = sm ? 72 : 160;
      g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';
      for (var k = 0; k < 3; k++) {
        for (var i = 0; i < N; i++) {
          var a0 = i / N * TAU, a1 = (i + 1.3) / N * TAU, m = (a0 + a1) / 2;
          var r = R + 6 * s + (4 * Math.sin(m * 3 + t * 0.8 + k * 2.1) + 2.5 * Math.sin(m * 5 - t * 1.2 + k)) * s;
          var w = (2.4 + 1.8 * Math.sin(m * 2 - t * 1.1 + k * 1.7)) * s;
          var hue = 150 + 70 * Math.sin(m * 2 + t * 0.45 + k * 1.9);
          var al = 0.34 + 0.26 * Math.sin(m * 4 + t * 1.3 + k);
          g.beginPath(); g.arc(cx, cy, r, a0, a1);
          g.strokeStyle = hsla(hue, 90, 62, Math.max(0.05, al)); g.lineWidth = Math.max(0.8, w); g.stroke();
          if (!sm && i % 3 === 0) {
            var cl = (3 + 7 * Math.abs(Math.sin(m * 7 + t * 1.8 + k))) * s;
            g.beginPath(); g.moveTo(cx + Math.cos(m) * r, cy + Math.sin(m) * r); g.lineTo(cx + Math.cos(m) * (r + cl), cy + Math.sin(m) * (r + cl));
            g.strokeStyle = hsla(hue + 20, 90, 72, 0.13); g.lineWidth = 1.3 * s; g.stroke();
          }
        }
      }
    }
  },
  'neon': {
    front: function (g, cx, cy, R, t, dt, sm, o) {
      var s = R / 56, i, j;
      if (!o.tr) { o.tr = []; for (i = 0; i < 14; i++) o.tr.push({ a: i / 14 * TAU + ((i * 37) % 10) / 40, len: 0.12 + ((i * 53) % 10) / 40, dir: i % 2 ? 1 : -1, lvl: i % 3 === 0 ? 14 : 10 }); }
      var ri = R + 3 * s;
      g.lineCap = 'round'; g.lineJoin = 'round';
      g.beginPath(); g.arc(cx, cy, ri, 0, TAU); g.strokeStyle = 'rgba(34,211,238,0.35)'; g.lineWidth = Math.max(1, 1.4 * s); g.stroke();
      g.globalCompositeOperation = 'lighter';
      var n = sm ? 7 : 14;
      for (i = 0; i < n; i++) {
        var q = o.tr[sm ? i * 2 : i], ro = R + q.lvl * s, col = i % 2 ? '240,171,252' : '34,211,238';
        g.beginPath(); g.moveTo(cx + Math.cos(q.a) * ri, cy + Math.sin(q.a) * ri); g.lineTo(cx + Math.cos(q.a) * ro, cy + Math.sin(q.a) * ro);
        g.arc(cx, cy, ro, q.a, q.a + q.dir * q.len, q.dir < 0);
        g.strokeStyle = 'rgba(' + col + ',0.5)'; g.lineWidth = Math.max(0.8, 1.1 * s);
        if (!sm) { g.shadowColor = 'rgba(' + col + ',0.9)'; g.shadowBlur = 6 * s; }
        g.stroke();
        var ea = q.a + q.dir * q.len, bl = 0.35 + 0.65 * Math.max(0, Math.sin(t * 3.2 + i * 1.7));
        g.beginPath(); g.arc(cx + Math.cos(ea) * ro, cy + Math.sin(ea) * ro, 1.9 * s, 0, TAU); g.fillStyle = 'rgba(' + col + ',' + bl.toFixed(2) + ')'; g.fill();
        var u = ((t * 0.9 + i * 0.37) % 1.6) / 1.6;
        if (u < 1 && !sm) {
          var rl = ro - ri, al = q.len * ro, d = u * (rl + al), x, y;
          if (d < rl) { x = cx + Math.cos(q.a) * (ri + d); y = cy + Math.sin(q.a) * (ri + d); }
          else { var aa = q.a + q.dir * ((d - rl) / ro); x = cx + Math.cos(aa) * ro; y = cy + Math.sin(aa) * ro; }
          g.shadowBlur = 0;
          var gr = g.createRadialGradient(x, y, 0, x, y, 4.5 * s);
          gr.addColorStop(0, 'rgba(255,255,255,0.95)'); gr.addColorStop(0.4, 'rgba(' + col + ',0.8)'); gr.addColorStop(1, 'rgba(' + col + ',0)');
          g.fillStyle = gr; g.beginPath(); g.arc(x, y, 4.5 * s, 0, TAU); g.fill();
        }
      }
      g.shadowBlur = 0;
      for (var k = 0; k < 2; k++) {
        var a = t * (k ? -1.4 : 1.1) + k * Math.PI, c2 = k ? '240,171,252' : '34,211,238';
        for (j = 0; j < 12; j++) {
          var ab = a - (k ? -1 : 1) * j * 0.035;
          g.beginPath(); g.arc(cx + Math.cos(ab) * ri, cy + Math.sin(ab) * ri, Math.max(0.4, (2.3 - j * 0.16) * s * (sm ? 0.9 : 1)), 0, TAU);
          g.fillStyle = 'rgba(' + c2 + ',' + (0.9 * (1 - j / 12)).toFixed(2) + ')'; g.fill();
        }
      }
    }
  },
  'ice': {
    back: function (g, cx, cy, R) {
      var s = R / 56;
      halo(g, cx, cy, R * 0.95, R + 26 * s, [[0, 'rgba(186,230,253,0.35)'], [0.5, 'rgba(125,211,252,0.12)'], [1, 'rgba(125,211,252,0)']]);
    },
    front: function (g, cx, cy, R, t, dt, sm, o) {
      var s = R / 56, i, M = sm ? 36 : 72;
      g.beginPath();
      for (i = 0; i <= M; i++) {
        var a = i / M * TAU, r = R + 2 * s + (i % 2 ? 2.8 : 0.6) * s * (0.7 + 0.3 * Math.sin(i * 1.7));
        var x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
        if (i) g.lineTo(x, y); else g.moveTo(x, y);
      }
      g.closePath();
      g.strokeStyle = 'rgba(224,242,254,0.9)'; g.lineWidth = Math.max(0.8, 1.1 * s);
      if (!sm) { g.shadowColor = 'rgba(125,211,252,0.95)'; g.shadowBlur = 9 * s; }
      g.stroke(); g.shadowBlur = 0;
      g.globalCompositeOperation = 'lighter';
      var N = sm ? 4 : 7;
      for (i = 0; i < N; i++) {
        var fa = i / N * TAU - t * 0.25, fr = R + (sm ? 7 : 12) * s + Math.sin(t + i) * 2 * s;
        flake(g, cx + Math.cos(fa) * fr, cy + Math.sin(fa) * fr, (sm ? 3.6 : 5.6) * s, t * 0.6 + i, 'rgba(224,242,254,0.95)');
      }
      if (!sm) {
        o.acc += 32 * dt;
        while (o.acc >= 1) { o.acc--; var na = Math.random() * TAU; o.p.push({ x: cx + Math.cos(na) * (R + 4 * s), y: cy + Math.sin(na) * (R + 4 * s), vx: Math.cos(na) * rnd(4, 10) * s, vy: rnd(6, 14) * s, age: 0, life: rnd(1.2, 2.2), r: rnd(0.6, 1.5) * s }); }
        for (i = o.p.length - 1; i >= 0; i--) {
          var p = o.p[i]; p.age += dt;
          if (p.age > p.life) { o.p.splice(i, 1); continue; }
          p.x += p.vx * dt + Math.sin(t * 2 + i) * 0.08 * s; p.y += p.vy * dt;
          g.fillStyle = 'rgba(240,249,255,' + ((1 - p.age / p.life) * 0.85).toFixed(2) + ')';
          g.beginPath(); g.arc(p.x, p.y, p.r, 0, TAU); g.fill();
        }
        for (i = 0; i < 5; i++) {
          var ph = (t * 0.7 + i * 0.47) % 2;
          if (ph < 0.3) {
            var k = Math.sin(ph / 0.3 * Math.PI), ga = i * 1.37 + Math.floor(t * 0.35 + i) * 2.1;
            star(g, cx + Math.cos(ga) * (R + 3 * s), cy + Math.sin(ga) * (R + 3 * s), 7 * s * k, 'rgba(255,255,255,' + (0.9 * k).toFixed(2) + ')');
          }
        }
      }
    }
  },
  'cherry-blossom': {
    back: function (g, cx, cy, R) {
      var s = R / 56;
      halo(g, cx, cy, R * 0.95, R + 22 * s, [[0, 'rgba(249,168,212,0.28)'], [1, 'rgba(249,168,212,0)']]);
    },
    front: function (g, cx, cy, R, t, dt, sm, o) {
      var s = R / 56, i;
      var fresh = function () { return { a: Math.random() * TAU, r: R + rnd(5, 14) * s, va: rnd(0.25, 0.55), vr: 0, rot: Math.random() * TAU, vrot: rnd(-2, 2), age: 0, drift: rnd(3, 9), sz: rnd(2.8, 4.2) * s, al: 1 }; };
      if (!o.init) { o.init = 1; for (i = 0; i < (sm ? 5 : 14); i++) { var q = fresh(); q.age = rnd(0, 3); o.p.push(q); } }
      g.beginPath(); g.arc(cx, cy, R + 2 * s, 0, TAU); g.strokeStyle = 'rgba(251,207,232,0.85)'; g.lineWidth = Math.max(1, 1.7 * s); g.stroke();
      for (i = 0; i < 3; i++) {
        var a = i / 3 * TAU - 0.6 + Math.sin(t * 0.4) * 0.05;
        blossom(g, cx + Math.cos(a) * (R + 2 * s), cy + Math.sin(a) * (R + 2 * s), (sm ? 3.4 : 6) * s, t * 0.2 + i);
      }
      for (i = 0; i < o.p.length; i++) {
        var p = o.p[i]; p.age += dt; p.a += p.va * dt; p.rot += p.vrot * dt;
        var fall = 0;
        if (p.age > p.drift) { p.vr += dt * 10 * s; p.r += p.vr * dt; p.al -= dt * 0.7; fall = (p.age - p.drift) * 6 * s; if (p.al <= 0) { o.p[i] = fresh(); continue; } }
        petal(g, cx + Math.cos(p.a) * p.r, cy + Math.sin(p.a) * p.r + fall, p.sz * (sm ? 0.85 : 1), p.rot, p.al);
      }
    }
  },
  'sonar': {
    front: function (g, cx, cy, R, t, dt, sm) {
      var s = R / 56;
      g.globalCompositeOperation = 'lighter';
      for (var k = 0; k < 3; k++) {
        var p = ((t / 2.1) + k / 3) % 1, r = R + 3 * s + p * (sm ? 12 : 26) * s, al = 1 - p;
        g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.strokeStyle = 'rgba(34,211,238,' + (al * 0.6).toFixed(3) + ')'; g.lineWidth = (2.4 - 1.8 * p) * Math.max(s, 0.6); g.stroke();
        if (!sm) { g.beginPath(); g.arc(cx + 0.9 * s, cy, r + 1.3 * s, 0, TAU); g.strokeStyle = 'rgba(244,114,182,' + (al * 0.28).toFixed(3) + ')'; g.lineWidth = (1.6 - 1.2 * p) * s; g.stroke(); }
      }
      if (g.createConicGradient) {
        var sw = g.createConicGradient(t * 1.4, cx, cy);
        sw.addColorStop(0, 'rgba(103,232,249,0)'); sw.addColorStop(0.82, 'rgba(103,232,249,0)'); sw.addColorStop(1, 'rgba(103,232,249,0.6)');
        g.beginPath(); g.arc(cx, cy, R + 7 * s, 0, TAU); g.moveTo(cx + R + 1 * s, cy); g.arc(cx, cy, R + 1 * s, 0, TAU, true);
        g.fillStyle = sw; g.fill('evenodd');
      }
      g.beginPath(); g.arc(cx, cy, R + 2 * s, 0, TAU); g.strokeStyle = '#67e8f9'; g.lineWidth = Math.max(1, 1.9 * s);
      if (!sm) { g.shadowColor = 'rgba(34,211,238,0.95)'; g.shadowBlur = 11 * s; }
      g.stroke();
    }
  }
};

 
var BN = {
  'night-sky': function (g, w, h, t, o) {
    if (!o.stars) {
      o.stars = [];
      for (var i = 0; i < 170; i++) o.stars.push({ x: Math.random(), y: Math.random(), r: rnd(0.3, 1.3), sp: rnd(0.6, 2.4), ph: Math.random() * TAU, z: rnd(0.2, 1) });
    }
    var bg = g.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, '#05030f'); bg.addColorStop(1, '#0b0620');
    g.fillStyle = bg; g.fillRect(0, 0, w, h);
    g.globalCompositeOperation = 'lighter';
    var clouds = [['168,85,247', 0.18, 0.55, 0.9], ['34,211,238', 0.62, 0.35, 0.8], ['244,114,182', 0.82, 0.7, 0.7], ['99,102,241', 0.38, 0.25, 0.85]];
    clouds.forEach(function (c, i) {
      var x = w * (c[1] + 0.06 * Math.sin(t * 0.07 + i * 1.7)), y = h * (c[2] + 0.12 * Math.cos(t * 0.05 + i));
      var r = h * c[3] * (1 + 0.08 * Math.sin(t * 0.3 + i));
      var gr = g.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, 'rgba(' + c[0] + ',0.34)'); gr.addColorStop(0.5, 'rgba(' + c[0] + ',0.10)'); gr.addColorStop(1, 'rgba(' + c[0] + ',0)');
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
    });
    o.stars.forEach(function (st) {
      var x = ((st.x - t * 0.004 * st.z) % 1 + 1) % 1 * w, y = st.y * h;
      var a = 0.25 + 0.75 * Math.pow(Math.sin(t * st.sp + st.ph) * 0.5 + 0.5, 2);
      g.fillStyle = 'rgba(255,255,255,' + a.toFixed(2) + ')';
      g.beginPath(); g.arc(x, y, st.r, 0, TAU); g.fill();
      if (st.r > 1.1 && a > 0.8) star(g, x, y, st.r * 4 * a, 'rgba(255,255,255,' + (0.5 * a).toFixed(2) + ')');
    });
  },
  'retro': function (g, w, h, t, o) {
    var hy = h * 0.6, i;
    var sky = g.createLinearGradient(0, 0, 0, hy);
    sky.addColorStop(0, '#0c0420'); sky.addColorStop(0.7, '#3b0a57'); sky.addColorStop(1, '#7e1d6b');
    g.fillStyle = sky; g.fillRect(0, 0, w, hy);
    if (!o.st) { o.st = []; for (i = 0; i < 60; i++) o.st.push({ x: Math.random() * w, y: Math.random() * hy * 0.7, ph: Math.random() * TAU }); }
    o.st.forEach(function (s2) { g.fillStyle = 'rgba(255,255,255,' + (0.3 + 0.4 * Math.pow(Math.sin(t * 1.5 + s2.ph), 2)).toFixed(2) + ')'; g.fillRect(s2.x, s2.y, 1.2, 1.2); });
    var sx = w * 0.5, sr = h * 0.42, sy = hy + sr * 0.18;
    g.save();
    g.beginPath(); g.rect(0, 0, w, hy); g.clip();
    var sun = g.createLinearGradient(0, sy - sr, 0, sy + sr);
    sun.addColorStop(0, '#fde047'); sun.addColorStop(0.55, '#fb7185'); sun.addColorStop(1, '#c026d3');
    g.shadowColor = 'rgba(251,113,133,0.8)'; g.shadowBlur = 40;
    g.fillStyle = sun; g.beginPath(); g.arc(sx, sy, sr, 0, TAU); g.fill(); g.shadowBlur = 0;
    for (i = 0; i < 7; i++) {
      var f = ((i / 7) + t * 0.05) % 1, y = sy - sr * 0.05 + f * sr;
      g.fillStyle = '#3b0a57'; g.fillRect(sx - sr, y, sr * 2, 1 + f * 7);
    }
    g.restore();
    var gd = g.createLinearGradient(0, hy, 0, h);
    gd.addColorStop(0, '#1a0633'); gd.addColorStop(1, '#05020d');
    g.fillStyle = gd; g.fillRect(0, hy, w, h - hy);
    g.strokeStyle = 'rgba(236,72,153,0.85)'; g.lineWidth = 1.1; g.shadowColor = 'rgba(236,72,153,0.9)'; g.shadowBlur = 8;
    for (i = -16; i <= 16; i++) { g.beginPath(); g.moveTo(sx + i * 6, hy); g.lineTo(sx + i * w * 0.14, h); g.stroke(); }
    for (i = 0; i < 10; i++) {
      var z = ((i / 10) + t * 0.12) % 1, yy = hy + (h - hy) * z * z;
      g.globalAlpha = Math.min(1, z * 2.5);
      g.beginPath(); g.moveTo(0, yy); g.lineTo(w, yy); g.stroke();
    }
    g.globalAlpha = 1;
    g.strokeStyle = 'rgba(103,232,249,0.95)'; g.shadowColor = 'rgba(103,232,249,1)'; g.shadowBlur = 12; g.lineWidth = 1.6;
    g.beginPath(); g.moveTo(0, hy); g.lineTo(w, hy); g.stroke();
    g.shadowBlur = 0;
  }
};


 
function tagEl(id) {
  var it = byId(id);
  if (!it || it.type !== 'tag') return null;
  var el = document.createElement('span');
  el.className = 'es-tag';
  el.textContent = it.text;
  el.style.background = it.bg;
  el.style.color = it.fg || '#0b0b14';
  if (it.glow) el.style.boxShadow = '0 0 10px ' + it.bg;
  el.title = it.name + ' tag';
  return el;
}
function applyTag(nameEl, id) {
  if (!nameEl || !nameEl.parentNode) return;
  var next = nameEl.nextElementSibling;
  if (next && next.classList.contains('es-tag')) next.remove();
  var el = id ? tagEl(id) : null;
  if (el) nameEl.parentNode.insertBefore(el, nameEl.nextSibling);
}

 
var mounts = [];
var reduced = false;
var DPR = Math.min(global.devicePixelRatio || 1, 2);
var raf = 0, last = 0;

function size(m) {
  var w = m.w, h = m.h;
  if (m.c.width !== Math.round(w * DPR) || m.c.height !== Math.round(h * DPR)) {
    m.c.width = Math.round(w * DPR); m.c.height = Math.round(h * DPR);
  }
  m.c.style.width = w + 'px'; m.c.style.height = h + 'px';
}
function visible(c) {
  if (!c.isConnected || c.offsetParent === null) return false;
  var r = c.getBoundingClientRect();
  return r.bottom > 0 && r.right > 0 && r.top < innerHeight && r.left < innerWidth;
}
function drawOne(m, t, dt) {
  var g = m.c.getContext('2d');
  if (!g) return;
  g.setTransform(DPR, 0, 0, DPR, 0, 0);
  g.clearRect(0, 0, m.w, m.h);
  g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; g.shadowBlur = 0;
  if (!m.id) return;
  var o = m.st[m.id] || (m.st[m.id] = { p: [], acc: 0 });
  if (m.kind === 'banner') {
    if (BN[m.id]) { g.save(); BN[m.id](g, m.w, m.h, t, o); g.restore(); }
    return;
  }
  var f = FX[m.id]; if (!f) return;
  var cx = m.w / 2, cy = m.h / 2;
  if (f.back) { g.save(); f.back(g, cx, cy, m.R, t, dt, m.small, o); g.restore(); }
  if (m.img !== undefined) drawAvatar(g, cx, cy, m.R, m.img);
  g.save(); f.front(g, cx, cy, m.R, t, dt, m.small, o); g.restore();
}
function tick(now) {
  raf = 0;
  var t = now / 1000, dt = Math.min(0.05, Math.max(0, (now - (last || now)) / 1000));
  last = now;
  var any = false;
  for (var i = mounts.length - 1; i >= 0; i--) {
    var m = mounts[i];
    if (m.dead) { mounts.splice(i, 1); continue; }
    if (!m.c.isConnected) {
      if (!m.detachedSince) m.detachedSince = now;
      else if (now - m.detachedSince > 10000) mounts.splice(i, 1);
      continue;
    }
    m.detachedSince = 0;
    if (!m.id) continue;
    any = true;
    if (!visible(m.c)) continue;
    if (reduced && m.drawn) continue;
    drawOne(m, reduced ? 1000 : t, dt);
    m.drawn = true;
  }
  if (any && !reduced) raf = requestAnimationFrame(tick);
  else if (reduced) setTimeout(function () { if (!raf) raf = requestAnimationFrame(tick); }, 1000);
}
function kick() { if (!raf) raf = requestAnimationFrame(tick); }

 
function mountRing(canvas, opts) {
  opts = opts || {};
  var R = opts.R || 56, pad = opts.pad != null ? opts.pad : Math.max(14, R * 0.8);
  var m = { c: canvas, kind: 'ring', id: opts.id || '', R: R, small: !!opts.small, st: {}, w: 2 * (R + pad), h: 2 * (R + pad) };
  if ('img' in opts) m.img = opts.img || null;
  size(m);
  mounts.push(m);
  kick();
  return {
    set: function (id) { if (m.id !== id) { m.id = id || ''; m.drawn = false; if (!m.id) drawOne(m, 0, 0); kick(); } },
    setImg: function (img) { m.img = img; m.drawn = false; kick(); },
    destroy: function () { m.dead = true; },
    size: m.w
  };
}
function mountBanner(canvas, id, w, h) {
  var m = { c: canvas, kind: 'banner', id: id || '', st: {}, w: w, h: h };
  size(m);
  mounts.push(m);
  kick();
  return {
    set: function (nid) { if (m.id !== nid) { m.id = nid || ''; m.drawn = false; if (!m.id) drawOne(m, 0, 0); kick(); } },
    resize: function (nw, nh) { m.w = nw; m.h = nh; size(m); m.drawn = false; kick(); },
    destroy: function () { m.dead = true; }
  };
}

document.addEventListener('visibilitychange', function () { if (!document.hidden) { last = 0; kick(); } });
addEventListener('scroll', kick, true);
addEventListener('resize', kick);

global.EchoCosmetics = {
  CATALOG: CATALOG,
  RARITY: RARITY,
  byId: byId,
  ofType: function (type) { return CATALOG.filter(function (x) { return x.type === type; }); },
  mountRing: mountRing,
  mountBanner: mountBanner,
  applyName: applyName,
  applyTag: applyTag,
  tagEl: tagEl,
  kick: kick
};

})(window);
