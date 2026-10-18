 
(function (global) {
'use strict';

var ICO_RECON = '<svg viewBox="0 0 24 24"><path d="M5 12.5a10 10 0 0 1 14 0"/><path d="M8.5 16a5 5 0 0 1 7 0"/><path d="M2 9a14.5 14.5 0 0 1 20 0"/><circle cx="12" cy="19.5" r="1.1"/></svg>';

var CHROME = '' +
  '<div class="eb-tabs" id="eb-tabs">' +
    '<div class="eb-newtab" id="eb-newtab" title="New tab">+</div>' +
  '</div>' +
  '<div class="eb-nav">' +
    '<button class="eb-btn" id="eb-back" disabled title="Back">' +
      '<svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg></button>' +
    '<button class="eb-btn" id="eb-fwd" disabled title="Forward">' +
      '<svg viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg></button>' +
    '<button class="eb-btn" id="eb-reload" title="Reload">' +
      '<svg viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-2.6-6.4"/><path d="M21 3v6h-6"/></svg></button>' +
    '<button class="eb-btn" id="eb-home" title="Home">' +
      '<svg viewBox="0 0 24 24"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/></svg></button>' +
    '<div class="eb-omni" id="eb-omni">' +
      '<div class="eb-omni-state" id="eb-state"></div>' +
      '<input id="eb-url" type="text" spellcheck="false" autocomplete="off" placeholder="Search, or type a web address">' +
      '<div class="eb-omni-badge" id="eb-badge">echo</div>' +
    '</div>' +
    '<button class="eb-btn eb-recon" id="eb-recon" title="Reconnect (switches to the fastest server)">' +
      ICO_RECON + '<i class="eb-recon-dot"></i></button>' +
    '<div class="eb-util">' +
      '<button class="eb-btn eb-hide-sm" id="eb-star" title="Add to home">' +
        '<svg viewBox="0 0 24 24"><path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z"/></svg></button>' +
      '<button class="eb-btn eb-hide-sm" id="eb-full" title="Fullscreen">' +
        '<svg viewBox="0 0 24 24"><path d="M4 9V4h5"/><path d="M20 15v5h-5"/><path d="M20 9V4h-5"/><path d="M4 15v5h5"/></svg></button>' +
      '<button class="eb-btn" id="eb-gear" title="Settings">' +
        '<svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg></button>' +
    '</div>' +
  '</div>' +
  '<div class="eb-progress"><span id="eb-bar"></span></div>' +
   
  '<div class="eb-stage" id="eb-stage"></div>' +
  '<div class="eb-toast" id="eb-toast"></div>';

var mounted = false;

 
var nav = null, queued = null;

window.EchoBrowser = {
    open: function (url) {
        mount();
        if (nav) nav(url);
        else queued = url;
    },
    isMounted: function () { return mounted; }
};

function mount() {
    if (mounted) return;
    var host = document.getElementById('view-browser');
    if (!host) return;
    mounted = true;
    host.innerHTML = '<div class="eb-root" id="eb">' + CHROME + '</div>';

     
    var boot = global.loadProxyStack ? global.loadProxyStack() : Promise.resolve();
    boot.then(start, function (err) {
         
        if (global.console) console.warn('[EchoBrowser] proxy stack failed:', err);
        start();
    });
}

 
function watch() {
    var host = document.getElementById('view-browser');
    if (!host) return;
    var visible = function () { return host.offsetParent !== null; };
    if (visible()) { mount(); return; }
    var mo = new MutationObserver(function () {
        if (visible()) { mo.disconnect(); mount(); }
    });
    mo.observe(host, { attributes: true, attributeFilter: ['class', 'style'] });
    if (host.parentNode) {
        mo.observe(host.parentNode, { attributes: true, subtree: true,
                                      attributeFilter: ['class', 'style'] });
    }
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watch);
else watch();

function start() {
    'use strict';

     
    var ENGINES = [
      { id:'ddg',       name:'DuckDuckGo', host:'duckduckgo.com',    color:'#de5833',
        q:'https://duckduckgo.com/?q=',                 sug:'https://duckduckgo.com/ac/?type=list&q=' },
      { id:'brave',     name:'Brave',      host:'search.brave.com',  color:'#fb542b',
        q:'https://search.brave.com/search?q=',         sug:'https://search.brave.com/api/suggest?q=' },
      { id:'google',    name:'Google',     host:'www.google.com',    color:'#4285f4',
        q:'https://www.google.com/search?q=',           sug:'https://suggestqueries.google.com/complete/search?client=firefox&q=' },
      { id:'bing',      name:'Bing',       host:'www.bing.com',      color:'#0c8484',
        q:'https://www.bing.com/search?q=',             sug:'https://api.bing.com/osjson.aspx?query=' },
      { id:'startpage', name:'Startpage',  host:'www.startpage.com', color:'#6573ff',
        q:'https://www.startpage.com/sp/search?query=', sug:null },    
      { id:'ecosia',    name:'Ecosia',     host:'www.ecosia.org',    color:'#36acb8',
        q:'https://www.ecosia.org/search?q=',           sug:'https://ac.ecosia.org/autocomplete?type=list&q=' },
      { id:'yahoo',     name:'Yahoo',      host:'search.yahoo.com',  color:'#6001d2',
        q:'https://search.yahoo.com/search?p=',         sug:'https://search.yahoo.com/sugg/os?output=fxjson&command=' }
    ];

     
    var KEY = { engine:'eb.v1.engine', sug:'eb.v1.suggest', tabs:'eb.v1.tabs',
                hist:'eb.v1.history', tiles:'eb.v1.tiles' };
    function load(k, dflt){
      try { var v = localStorage.getItem(k); return v == null ? dflt : JSON.parse(v); }
      catch (_) { return dflt; }
    }
    function save(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) {} }
    var timers = {};
    function saveSoon(k, fn){
      clearTimeout(timers[k]);
      timers[k] = setTimeout(function(){ save(k, fn()); }, 400);
    }

    var engineId = load(KEY.engine, 'ddg');
    var suggestOn = load(KEY.sug, true) !== false;
    function engine(id){
      id = id || engineId;
      for (var i = 0; i < ENGINES.length; i++) if (ENGINES[i].id === id) return ENGINES[i];
      return ENGINES[0];
    }

     
    function encodeUrl(url){ return window.EchoProxy ? window.EchoProxy.encode(url) : url; }
    function decodeUrl(url){ return window.EchoProxy ? window.EchoProxy.decode(url) : url; }

     
    function bootTransport(){ return window.EchoProxy ? window.EchoProxy.boot() : Promise.resolve(false); }

    var I = {
      film:  '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M8 5v14M16 5v14M3 10h18M3 14h18"/>',
      tv:    '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M8 3l4 3 4-3"/>',
      music: '<path d="M9 18V6l10-2v12"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="16" r="2"/>',
      play:  '<rect x="3" y="6" width="18" height="12" rx="3"/><path d="M10.5 9.8 15 12l-4.5 2.2z"/>',
      note:  '<path d="M12 4v10.5"/><circle cx="9" cy="16" r="2.6"/><path d="M12 4c1.6 1.4 3 2 5 2.2"/>',
      twitch:'<path d="M4 4h16v10l-4 4h-4l-3 3v-3H4z"/><path d="M11 8v4M16 8v4"/>',
      spark: '<path d="M12 3l2.2 5.6L20 10.8l-5.8 2.2L12 19l-2.2-5.9L4 10.8l5.8-2.2z"/>',
      chat:  '<path d="M20 12a7 7 0 0 1-9.9 6.4L4 20l1.6-5.1A7 7 0 1 1 20 12z"/>',
      search:'<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.4-3.4"/>',
      clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
      globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 2.5 15 0 18M12 3c-2.5 2.6-2.5 15 0 18"/>',
      plus:  '<path d="M12 5v14M5 12h14"/>',
      pen:   '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
      x:     '<path d="M6 6l12 12M18 6 6 18"/>',
      lock:  '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
      check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
      blank: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 8h18"/><path d="M14 12h4v4"/><path d="M18 12l-6 6"/>',
      trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
      home:  '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/>',
      tabs:  '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M7 7V4h10v3"/>',
      copy:  '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
      code:  '<path d="M8 7l-5 5 5 5M16 7l5 5-5 5"/>'
    };
    function svg(k){ return '<svg viewBox="0 0 24 24">' + I[k] + '</svg>'; }

     
    var DEFAULT_TILES = [
      { label:'Movies',   url:'https://www.cineby.app',     icon:'film'  },
      { label:'TV',       url:'https://www.cineby.app/tv',  icon:'tv'    },
      { label:'Anime',    url:'https://hianime.to',         icon:'spark' },
      { label:'YouTube',  url:'https://www.youtube.com',    icon:'play'  },
      { label:'TikTok',   url:'https://www.tiktok.com',     icon:'note'  },
      { label:'Twitch',   url:'https://www.twitch.tv',      icon:'twitch'},
      { label:'Instants', url:'https://www.myinstants.com', icon:'music' },
      { label:'Discord',  url:'https://discord.com/app',    icon:'chat'  }
    ];
    function cloneTiles(a){ return a.map(function(x){ return { label:x.label, url:x.url, icon:x.icon }; }); }
    var tiles = load(KEY.tiles, null);
    if (!Array.isArray(tiles)) tiles = cloneTiles(DEFAULT_TILES);
    function saveTiles(){ save(KEY.tiles, tiles); }

     
    var HIST_MAX = 400;
    var history = load(KEY.hist, []);
    if (!Array.isArray(history)) history = [];
    function record(url, title){
      if (!url || !/^https?:/i.test(url)) return;
      var now = Date.now();
      if (history[0] && history[0].u === url) {
        if (title) history[0].t = title;
        history[0].at = now;
      } else {
        var old = null;
        for (var i = 0; i < history.length; i++) if (history[i].u === url) { old = history.splice(i, 1)[0]; break; }
        history.unshift({ u:url, t:title || (old && old.t) || '', at:now });
        if (history.length > HIST_MAX) history.length = HIST_MAX;
      }
      saveSoon(KEY.hist, function(){ return history; });
    }

     

    var rootEl  = document.getElementById('eb');
    var tabsEl  = document.getElementById('eb-tabs');
    var stageEl = document.getElementById('eb-stage');
    var omniEl  = document.getElementById('eb-omni');
    var urlEl   = document.getElementById('eb-url');
    var stateEl = document.getElementById('eb-state');
    var badgeEl = document.getElementById('eb-badge');
    var barEl   = document.getElementById('eb-bar');
    var newBtn  = document.getElementById('eb-newtab');
    var backBtn = document.getElementById('eb-back');
    var fwdBtn  = document.getElementById('eb-fwd');
    var reconBtn= document.getElementById('eb-recon');
    var starBtn = document.getElementById('eb-star');
    var toastEl = document.getElementById('eb-toast');

    var tabs = [], activeId = null, seq = 0;

    function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]; }); }

    function looksLikeUrl(s){
      return /^https?:\/\//i.test(s) || /^[^\s]+\.[a-z]{2,}(:\d+)?([\/?#].*)?$/i.test(s) ||
             /^localhost(:\d+)?([\/?#].*)?$/i.test(s);
    }
    function searchUrl(q, engId){ return engine(engId).q + encodeURIComponent(q); }
    function normalize(raw, engId){
      var s = String(raw || '').trim();
      if (!s) return '';
      if (/^https?:\/\//i.test(s)) return s;
       
      if (looksLikeUrl(s)) return 'https://' + s;
      return searchUrl(s, engId);
    }

    function hostOf(u){ try { return new URL(u).hostname.replace(/^www\./,''); } catch(e){ return u; } }
    function faviconFor(url){
      try { return 'https://www.google.com/s2/favicons?domain=' + new URL(url).hostname + '&sz=64'; }
      catch(e){ return ''; }
    }
     
    function badge(label, url, color, cls){
      var ch = String(label || hostOf(url) || '?').trim().charAt(0).toUpperCase();
      return '<span class="' + (cls || 'eb-fav') + '" style="--c:' + esc(color || '#4b4b6e') + '"><b>' + esc(ch) + '</b>' +
             (url ? '<img alt="" src="' + esc(faviconFor(url)) + '" onerror="this.remove()">' : '') + '</span>';
    }
    function engIco(e){ return badge(e.name, 'https://' + e.host, e.color, 'eb-eng'); }
     
    function queryOf(url){
      for (var i = 0; i < ENGINES.length; i++) {
        var q = ENGINES[i].q;
        if (url.indexOf(q) === 0) {
          try { return decodeURIComponent(url.slice(q.length).split('&')[0].replace(/\+/g, ' ')); } catch (_) {}
        }
      }
      return '';
    }

    function toast(msg){
      toastEl.textContent = msg;
      toastEl.classList.add('is-on');
      clearTimeout(toastEl._t);
      toastEl._t = setTimeout(function(){ toastEl.classList.remove('is-on'); }, 2600);
    }

     
    var US = null;
    (function(){
      var s = document.createElement('script');
      s.src = '/web/echo-us.js?v=20261008a';
      s.onload = function(){
        if (!window.EchoUS) return;
        window.EchoUS.attach({
          root: rootEl, toast: toast, svg: svg, esc: esc,
          openTab: function(u, bg){ makeTab(u, { background: !!bg }); }
        });
        window.EchoUS.ready.then(function(){ US = window.EchoUS; });
      };
      document.head.appendChild(s);
    })();

     
    var conn = { state:'wait', text:'Checking connection…' };
    function readConn(ok){
      var st = window.EchoProxy && window.EchoProxy.status ? window.EchoProxy.status() : {};
      if (ok) {
        conn.state = 'ok';
        conn.text = 'Connected' + (st.ms != null ? ' · ' + st.ms + ' ms' : '');
      } else {
        conn.state = 'bad';
         
        conn.text = 'Not connected' + (st.stage && st.stage !== 'ok' ? ' (' + st.stage + ')' : '');
      }
      paintConn();
    }
    function paintConn(){
      reconBtn.setAttribute('data-state', conn.state);
      Array.prototype.forEach.call(rootEl.querySelectorAll('[data-conn]'), function(el){
        var dot = el.querySelector('.eb-dot'), txt = el.querySelector('.eb-conn-t');
        if (dot) dot.className = 'eb-dot is-' + conn.state;
        if (txt) txt.textContent = conn.text + (conn.state === 'bad' && el.classList.contains('eb-status') ? ' · tap to reconnect' : '');
        el.classList.toggle('is-bad', conn.state === 'bad');
      });
    }
    var reconnecting = false;
    function reconnect(reloadPage){
      if (reconnecting) return;
      reconnecting = true;
      conn.state = 'wait'; conn.text = 'Finding the fastest server…';
      paintConn();
      reconBtn.classList.add('is-spinning');
      var p = window.EchoProxy && window.EchoProxy.reconnect ? window.EchoProxy.reconnect() : bootTransport();
      p.then(function(ok){
        reconnecting = false;
        reconBtn.classList.remove('is-spinning');
        readConn(ok);
        toast(ok ? 'Reconnected · ' + conn.text.replace(/^Connected · /, '') : 'Could not reach any server. Check the Wi-Fi and try again.');
        if (ok && reloadPage) {
          var t = byId(activeId);
          if (t && !t.home) loadTab(t);
        }
      });
    }
    reconBtn.onclick = function(){ reconnect(true); };

     
    function makeTab(url, opts){
      opts = opts || {};
      var id = 'eb' + (++seq);
      var t = { id:id, url:'', title:'New Tab', home:true, hist:[], pos:-1, sleeping:false, seq:0 };

      var page = document.createElement('div');
      page.className = 'eb-page';
      stageEl.appendChild(page);
      t.page = page;

      var el = document.createElement('div');
      el.className = 'eb-tab';
      el.innerHTML = '<span class="eb-tab-fav"></span>' +
                     '<span class="eb-tab-title"></span>' +
                     '<span class="eb-tab-x" title="Close">&times;</span>';
      el.onclick = function(e){
        if (e.target.classList.contains('eb-tab-x')) { closeTab(id); return; }
        select(id);
      };
      el.onauxclick = function(e){ if (e.button === 1) { e.preventDefault(); closeTab(id); } };
      tabsEl.insertBefore(el, newBtn);
      t.el = el;
      tabs.push(t);

      if (url && opts.sleep) {
         
        t.home = false; t.url = url; t.title = opts.title || hostOf(url);
        t.hist = [url]; t.pos = 0; t.sleeping = true;
      } else if (!url) {
        showHome(t);
      }
      paintTab(t);
      if (!opts.background) select(id);
      if (url && !opts.sleep) navigate(id, url);
      saveTabs();
      return t;
    }

    function paintTab(t){
      t.el.querySelector('.eb-tab-title').textContent = t.title;
      t.el.title = t.title;
      var fav = t.el.querySelector('.eb-tab-fav');
      var favKey = t.home ? '~' : hostOf(t.url);
      if (fav._k !== favKey) {
        fav._k = favKey;
        fav.innerHTML = t.home ? '<span>~</span>' : badge(t.title, t.url, null, 'eb-fav');
      }
      t.el.classList.toggle('is-active', t.id === activeId);
      t.el.classList.toggle('is-sleeping', !!t.sleeping);
    }

    function byId(id){ for (var i=0;i<tabs.length;i++) if (tabs[i].id===id) return tabs[i]; return null; }

    function select(id){
      activeId = id;
      tabs.forEach(function(t){
        t.el.classList.toggle('is-active', t.id === id);
        t.page.classList.toggle('is-active', t.id === id);
      });
      var t = byId(id);
      if (!t) return;
      if (t.sleeping) { t.sleeping = false; paintTab(t); loadTab(t); }
      if (document.activeElement !== urlEl) urlEl.value = t.home ? '' : t.url;
      setState(t); updateNav(); saveTabs();
       
      var L = t.el.offsetLeft, R = L + t.el.offsetWidth;
      if (L < tabsEl.scrollLeft) tabsEl.scrollLeft = L - 8;
      else if (R > tabsEl.scrollLeft + tabsEl.clientWidth) tabsEl.scrollLeft = R - tabsEl.clientWidth + 40;
    }

    function closeTab(id){
      var i = -1;
      for (var k=0;k<tabs.length;k++) if (tabs[k].id===id) { i=k; break; }
      if (i < 0) return;
      tabs[i].el.remove(); tabs[i].page.remove();
      tabs.splice(i,1);
      if (!tabs.length) { makeTab(null); return; }
      if (activeId === id) select(tabs[Math.max(0,i-1)].id);
      saveTabs();
    }

    function saveTabs(){
      saveSoon(KEY.tabs, function(){
        var active = 0;
        var list = tabs.map(function(t, i){
          if (t.id === activeId) active = i;
          return { u: t.home ? '' : t.url, t: t.home ? '' : t.title };
        });
        return { tabs:list, active:active };
      });
    }

    function setState(t){
      stateEl.innerHTML = '';
      if (t.home){
        stateEl.innerHTML = svg('search'); stateEl.classList.remove('is-secure');
        badgeEl.textContent = 'echo';
      } else {
        var secure = /^https:/i.test(t.url);
        stateEl.innerHTML = secure ? svg('lock') : svg('search');
        stateEl.classList.toggle('is-secure', secure);
        badgeEl.textContent = 'proxied';
      }
      var on = !t.home && tileIndex(t.url) >= 0;
      starBtn.classList.toggle('is-on', on);
      starBtn.title = on ? 'Remove from home' : 'Add to home';
    }

    function updateNav(){
      var t = byId(activeId);
      backBtn.disabled = !t || (t.home ? !t.hist.length : t.pos <= 0);
      fwdBtn.disabled  = !t || t.home || t.pos >= t.hist.length - 1;
    }

    function progress(on){
      barEl.style.opacity = on ? '1' : '0';
      barEl.style.width   = on ? '72%' : '100%';
      if (!on) setTimeout(function(){ barEl.style.width = '0'; }, 320);
       
      var rb = document.getElementById('eb-reload');
      if (rb) rb.classList.toggle('is-spinning', !!on);
    }

     
    function navigate(id, raw, opts){
      opts = opts || {};
      var t = byId(id); if (!t) return;
      var url = normalize(raw, opts.engine);
      if (!url) return;
       
      if (US && US.isUserJs(url)) { US.offerInstall(url); return; }
      if (opts.push !== false) {
        t.hist = t.hist.slice(0, t.pos + 1);
        if (t.hist[t.hist.length - 1] !== url) t.hist.push(url);
        t.pos = t.hist.length - 1;
      }
      t.url = url; t.home = false; t.sleeping = false;
      t.title = queryOf(url) || hostOf(url);
       
      if (t.id === activeId) urlEl.value = url;
      paintTab(t); setState(t); updateNav(); saveTabs();
      record(url, queryOf(url) ? queryOf(url) + ' - ' + engineNameFor(url) : '');
      loadTab(t);
    }
    function engineNameFor(url){
      for (var i = 0; i < ENGINES.length; i++) if (url.indexOf(ENGINES[i].q) === 0) return ENGINES[i].name;
      return 'Search';
    }

    function loadTab(t){
      var mySeq = ++t.seq;
      progress(true);
      t.page.innerHTML = '<div class="eb-wait"><span class="eb-dot is-wait"></span>Connecting…</div>';
       
      bootTransport().then(function(ok){
        if (mySeq !== t.seq || t.home) return;
        if (!ok) readConn(false);
        mountFrame(t, mySeq);
      });
    }

    function mountFrame(t, mySeq){
      var url = t.url;
      t.page.innerHTML =
        '<iframe src="' + esc(encodeUrl(url)) + '" ' +
        'allow="fullscreen; autoplay; clipboard-read; clipboard-write" ' +
        'sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-presentation allow-downloads"></iframe>' +
        errorHTML();

      var fr  = t.page.querySelector('iframe');
      var err = t.page.querySelector('.eb-error');
      t.frame = fr; t.settled = false;

       
      var settled = false, checks = 0;
      var done = function(){ if (mySeq === t.seq) { t.settled = true; progress(false); } };
       
      fr.onload = function(){ settled = true; done(); if (US) US.inject(fr); };
      var poll = setInterval(function(){
        checks++;
        if (mySeq !== t.seq) { clearInterval(poll); return; }
        var alive = false;
        try {
          var d = fr.contentDocument;
          alive = !!(d && d.body && d.body.childElementCount > 0);
        } catch (_) { alive = true; }
        if (settled || alive) { clearInterval(poll); done(); return; }
        if (checks >= 12) { clearInterval(poll); done(); err.classList.add('is-on'); }
      }, 1000);

      err.querySelector('.eb-retry').onclick = function(){ loadTab(t); };
      err.querySelector('.eb-err-recon').onclick = function(){ reconnect(true); };
    }

    function errorHTML(){
      return '<div class="eb-error"><div>' +
        '<h3>This page would not load</h3>' +
        '<p>The server might be slow right now, or this site blocks proxies. ' +
        'Try again, or reconnect to switch to the fastest server.</p>' +
        '<div class="eb-err-btns"><button class="eb-retry">Try again</button>' +
        '<button class="eb-retry eb-err-recon">' + ICO_RECON + 'Reconnect</button></div></div></div>';
    }

     
    function follow(){
      if (document.hidden) return;
      tabs.forEach(function(t){
        if (t.home || t.sleeping || !t.frame) return;
         
        if (US) US.inject(t.frame);
        var href, title;
        try {
          href  = t.frame.contentWindow.location.href;
          title = t.frame.contentDocument && t.frame.contentDocument.title;
        } catch (_) { return; }
        if (!href || href === 'about:blank') return;
        var u = decodeUrl(href);
        if (!/^https?:/i.test(u)) return;
         
        if (US && US.isUserJs(u) && t.usOffered !== u) { t.usOffered = u; US.offerInstall(u); }
        var changed = false;
        if (u !== t.url) {
           
          if (!t.settled && t.pos >= 0) t.hist[t.pos] = u;
          else if (t.hist[t.pos + 1] === u) t.pos++;
          else if (t.pos > 0 && t.hist[t.pos - 1] === u) t.pos--;
          else { t.hist = t.hist.slice(0, t.pos + 1); t.hist.push(u); t.pos = t.hist.length - 1; }
          t.url = u; changed = true;
          if (!title) t.title = hostOf(u);
        }
        if (title && title !== t.title) { t.title = title; changed = true; }
        if (!changed) return;
        record(t.url, t.title);
        paintTab(t);
        if (t.id === activeId) {
          if (document.activeElement !== urlEl) urlEl.value = t.url;
          setState(t); updateNav();
        }
        saveTabs();
      });
    }
    setInterval(follow, 1000);

     
    var sugCache = {};
    function parseSug(txt){
      var d; try { d = JSON.parse(txt); } catch (_) { return []; }
      var out = [];
      if (Array.isArray(d)) {
        if (Array.isArray(d[1])) out = d[1];
        else out = d.map(function(x){ return x && (x.phrase || x.q || x); });
      } else if (d && Array.isArray(d.suggestions)) {
        out = d.suggestions.map(function(x){ return typeof x === 'string' ? x : x && (x.phrase || x.text || x.value); });
      }
      return out.filter(function(x){ return typeof x === 'string' && x; }).slice(0, 7);
    }
    function remoteSug(q){
      var e = engine();
      var src = e.sug ? e : ENGINES[0];
      var key = src.id + '|' + q.toLowerCase();
      if (sugCache[key]) return Promise.resolve(sugCache[key]);
       
      var st = window.EchoProxy && window.EchoProxy.status ? window.EchoProxy.status() : {};
      if (st.stage !== 'ok' || !window.EchoProxy.fetch) return Promise.resolve([]);
      return new Promise(function(resolve){
        var t = setTimeout(function(){ resolve([]); }, 4000);
        window.EchoProxy.fetch(src.sug + encodeURIComponent(q))
          .then(function(r){ return r.text(); })
          .then(function(txt){ clearTimeout(t); var l = parseSug(txt); sugCache[key] = l; resolve(l); },
                function(){ clearTimeout(t); resolve([]); });
      });
    }
    function localSug(q){
      var ql = q.toLowerCase(), out = [], seen = {};
      var push = function(u, title, kind){
        if (seen[u] || out.length >= 4) return;
        if (u.toLowerCase().indexOf(ql) < 0 && String(title || '').toLowerCase().indexOf(ql) < 0) return;
        seen[u] = 1; out.push({ kind:kind, url:u, text:title || hostOf(u) });
      };
      tiles.forEach(function(x){ push(x.url, x.label, 'tile'); });
      for (var i = 0; i < history.length && out.length < 4; i++) {
        if (queryOf(history[i].u)) continue;           
        push(history[i].u, history[i].t, 'hist');
      }
      return out;
    }
    function pastSearches(q){
      var ql = q.toLowerCase(), out = [], seen = {};
      for (var i = 0; i < history.length && out.length < 3; i++) {
        var s = queryOf(history[i].u);
        if (s && s.toLowerCase().indexOf(ql) === 0 && s.toLowerCase() !== ql && !seen[s.toLowerCase()]) {
          seen[s.toLowerCase()] = 1; out.push(s);
        }
      }
      return out;
    }

    function attachSuggest(input, anchor, go){
      var box = document.createElement('div');
      box.className = 'eb-sug';
      anchor.appendChild(box);
      var rows = [], sel = -1, typed = '', reqSeq = 0, deb = null;

      function close(){ box.classList.remove('is-on'); sel = -1; }
      function render(){
        if (!rows.length) { close(); return; }
        var html = rows.map(function(r, i){
          var ico = r.kind === 'search' ? '<span class="eb-sug-ico">' + svg(r.past ? 'clock' : 'search') + '</span>'
                  : r.kind === 'go'     ? '<span class="eb-sug-ico">' + svg('globe') + '</span>'
                  : badge(r.text, r.url, null, 'eb-fav eb-sug-fav');
          var main = r.kind === 'go' ? esc(r.url)
                   : r.kind === 'search' ? boldTail(r.text, typed)
                   : esc(r.text);
          var side = r.kind === 'hist' || r.kind === 'tile' ? '<span class="eb-sug-side">' + esc(hostOf(r.url)) + '</span>'
                   : r.kind === 'search' && i === 0 ? '<span class="eb-sug-side">' + esc(engine().name) + '</span>' : '';
          return '<div class="eb-sug-row' + (i === sel ? ' is-sel' : '') + '" data-i="' + i + '">' + ico +
                 '<span class="eb-sug-main">' + main + '</span>' + side + '</div>';
        }).join('');
         
        html += '<div class="eb-sug-eng"><span>Search with</span>' + ENGINES.map(function(e){
          return '<button type="button" class="eb-sug-e' + (e.id === engineId ? ' is-cur' : '') + '" data-e="' + e.id + '" title="Search with ' + esc(e.name) + '">' + engIco(e) + '</button>';
        }).join('') + '</div>';
        box.innerHTML = html;
        box.classList.add('is-on');
      }
      function boldTail(s, q){
        if (q && s.toLowerCase().indexOf(q.toLowerCase()) === 0)
          return esc(s.slice(0, q.length)) + '<b>' + esc(s.slice(q.length)) + '</b>';
        return esc(s);
      }
      function build(q, remote){
        var out = [];
        if (looksLikeUrl(q)) out.push({ kind:'go', url:normalize(q) });
        out.push({ kind:'search', text:q });
        pastSearches(q).forEach(function(s){ out.push({ kind:'search', text:s, past:true }); });
        var seen = {}; out.forEach(function(r){ if (r.kind === 'search') seen[r.text.toLowerCase()] = 1; });
        (remote || []).forEach(function(s){
          if (!seen[s.toLowerCase()] && out.length < 9) { seen[s.toLowerCase()] = 1; out.push({ kind:'search', text:s }); }
        });
        localSug(q).forEach(function(r){ out.push(r); });
        return out;
      }
      function refresh(){
        typed = input.value;
        var q = typed.trim();
        sel = -1;
        if (!q) { rows = []; close(); return; }
        rows = build(q, null);
        render();
        if (!suggestOn || /^https?:\/\//i.test(q)) return;
        var mine = ++reqSeq;
        clearTimeout(deb);
        deb = setTimeout(function(){
          remoteSug(q).then(function(list){
            if (mine !== reqSeq || input.value.trim() !== q || !list.length) return;
            rows = build(q, list); render();
          });
        }, 110);
      }
      function pick(r, engId){
        close();
        if (r.kind === 'search') go(r.text, engId);
        else go(r.url, engId);
      }
      function move(d){
        if (!rows.length) return;
        sel += d;
        if (sel < -1) sel = rows.length - 1;
        if (sel >= rows.length) sel = -1;
        var r = rows[sel];
        input.value = sel < 0 ? typed : (r.kind === 'search' ? r.text : r.url);
        render();
      }

      input.addEventListener('input', refresh);
      input.addEventListener('keydown', function(e){
        if (e.key === 'ArrowDown') { e.preventDefault(); if (!box.classList.contains('is-on')) refresh(); else move(1); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
        else if (e.key === 'Escape') {
          if (box.classList.contains('is-on')) { e.preventDefault(); input.value = typed; close(); }
          else input.blur();
        }
        else if (e.key === 'Enter') {
          e.preventDefault();
          if (sel >= 0 && rows[sel]) pick(rows[sel]);
          else if (input.value.trim()) { close(); go(input.value.trim()); }
        }
      });
      input.addEventListener('blur', function(){ setTimeout(close, 120); });
       
      box.addEventListener('mousedown', function(e){
        e.preventDefault();
        var eb = e.target.closest('.eb-sug-e');
        if (eb) {
          var q = input.value.trim();
          if (sel >= 0 && rows[sel] && rows[sel].kind !== 'search') q = rows[sel].url;
          if (q) { close(); go(q, eb.getAttribute('data-e')); }
          return;
        }
        var row = e.target.closest('.eb-sug-row');
        if (row) pick(rows[+row.getAttribute('data-i')]);
      });
      return { close:close };
    }

     
    function homeHTML(){
      var e = engine();
      return '<div class="eb-home"><div class="eb-home-inner">' +
        '<div class="eb-word">EchoBrowser</div>' +
        '<div class="eb-sub">private &middot; inside EchoSpace</div>' +
        '<div class="eb-search">' +
          '<button type="button" class="eb-eng-btn" title="Search engine">' + engIco(e) +
            '<svg class="eb-caret" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5"/></svg></button>' +
          '<input type="text" spellcheck="false" autocomplete="off" placeholder="Search with ' + esc(e.name) + ' or type a URL">' +
        '</div>' +
        '<div class="eb-quick"></div>' +
        '<div class="eb-quick-foot"><button type="button" class="eb-link eb-edit-tiles">' + svg('pen') + '<span>Edit tiles</span></button></div>' +
        '<div class="eb-status" data-conn><span class="eb-dot is-wait"></span>' +
          '<span class="eb-conn-t">Checking connection&hellip;</span></div>' +
      '</div></div>';
    }

    function showHome(t){
      t.home = true; t.url = ''; t.title = 'New Tab'; t.frame = null; t.seq++;
      t.page.innerHTML = homeHTML();
      wireHome(t.page, t.id);
    }

    function wireHome(page, id){
      var input = page.querySelector('.eb-search input');
      attachSuggest(input, page.querySelector('.eb-search'), function(raw, engId, oneOff){
        navigate(id, raw, { engine:engId });
      });
      page.querySelector('.eb-eng-btn').onclick = function(e){ e.stopPropagation(); openEngineMenu(this); };

      paintTiles(page);
      page.querySelector('.eb-edit-tiles').onclick = function(){
        var q = page.querySelector('.eb-quick');
        var on = !q.classList.contains('is-editing');
        q.classList.toggle('is-editing', on);
        this.querySelector('span').textContent = on ? 'Done' : 'Edit tiles';
        if (!on) closeAddForm(page);
      };

       
      var pill = page.querySelector('.eb-status');
      pill.onclick = function(){ if (conn.state === 'bad') reconnect(false); };
      paintConn();
      bootTransport().then(function(ok){ if (!reconnecting) readConn(ok); });
    }

    function tileIndex(url){
      var n = String(url || '').replace(/\/+$/, '');
      for (var i = 0; i < tiles.length; i++) if (tiles[i].url.replace(/\/+$/, '') === n) return i;
      return -1;
    }
    function tileHTML(x, i){
      var ico = x.icon && I[x.icon] ? '<span class="eb-q-ico">' + svg(x.icon) + '</span>'
                                    : '<span class="eb-q-ico">' + badge(x.label, x.url, null, 'eb-fav eb-q-fav') + '</span>';
      return '<div class="eb-q" data-i="' + i + '" title="' + esc(x.url) + '" role="button" tabindex="0">' + ico +
             '<span class="eb-q-l">' + esc(x.label) + '</span>' +
             '<button type="button" class="eb-q-x" title="Remove">' + svg('x') + '</button></div>';
    }
    function paintTiles(page){
      var q = page.querySelector('.eb-quick');
      if (!q) return;
      q.innerHTML = tiles.map(tileHTML).join('') +
        '<div class="eb-q eb-q-add" role="button" tabindex="0" title="Add a site"><span class="eb-q-ico">' + svg('plus') + '</span><span class="eb-q-l">Add</span></div>';
      var id = null;
      for (var k = 0; k < tabs.length; k++) if (tabs[k].page === page) id = tabs[k].id;
      Array.prototype.forEach.call(q.querySelectorAll('.eb-q'), function(el){
        el.onclick = function(e){
          if (el.classList.contains('eb-q-add')) { openAddForm(page); return; }
          var i = +el.getAttribute('data-i');
          if (e.target.closest('.eb-q-x')) {
            e.stopPropagation();
            var gone = tiles.splice(i, 1)[0];
            saveTiles(); repaintAllTiles();
            toast('Removed ' + gone.label);
            return;
          }
          if (q.classList.contains('is-editing')) return;
          navigate(id || activeId, tiles[i].url);
        };
        el.onkeydown = function(e){ if (e.key === 'Enter') el.onclick(e); };
      });
    }
    function repaintAllTiles(){
      tabs.forEach(function(t){ if (t.home) paintTiles(t.page); });
      var t = byId(activeId); if (t) setState(t);
    }
    function closeAddForm(page){ var f = page.querySelector('.eb-add'); if (f) f.remove(); }
    function openAddForm(page){
      if (page.querySelector('.eb-add')) { page.querySelector('.eb-add input').focus(); return; }
      var f = document.createElement('form');
      f.className = 'eb-add';
      f.innerHTML = '<input class="eb-add-url" type="text" spellcheck="false" autocomplete="off" placeholder="Site address, like coolmathgames.com">' +
                    '<input class="eb-add-name" type="text" spellcheck="false" autocomplete="off" maxlength="18" placeholder="Name (optional)">' +
                    '<div class="eb-add-btns"><button type="button" class="eb-add-cancel">Cancel</button><button type="submit" class="eb-add-ok">Add</button></div>';
      page.querySelector('.eb-quick-foot').before(f);
      var u = f.querySelector('.eb-add-url'), n = f.querySelector('.eb-add-name');
      u.focus();
      f.querySelector('.eb-add-cancel').onclick = function(){ f.remove(); };
      f.onsubmit = function(e){
        e.preventDefault();
        var raw = u.value.trim();
        if (!looksLikeUrl(raw)) { u.classList.remove('is-bad'); void u.offsetWidth; u.classList.add('is-bad'); u.focus(); return; }
        addTile(normalize(raw), n.value.trim());
        f.remove();
      };
    }
    function addTile(url, label){
      if (tileIndex(url) >= 0) { toast('Already on your home page'); return; }
      var name = label || hostOf(url).split('.')[0];
      name = name.charAt(0).toUpperCase() + name.slice(1);
      tiles.push({ label:name.slice(0, 18), url:url });
      saveTiles(); repaintAllTiles();
      toast('Added ' + name + ' to home');
    }

     
    var pop = null;
    function closePop(){ if (pop) { pop.remove(); pop = null; } }
    function openPop(anchor, html, cls){
      closePop();
      pop = document.createElement('div');
      pop.className = 'eb-pop ' + (cls || '');
      pop.innerHTML = html;
      rootEl.appendChild(pop);
      var r = anchor.getBoundingClientRect(), R = rootEl.getBoundingClientRect();
      var w = pop.offsetWidth;
      var left = Math.min(Math.max(8, r.left - R.left), R.width - w - 8);
      if (cls && cls.indexOf('is-right') >= 0) left = Math.max(8, r.right - R.left - w);
      pop.style.left = left + 'px';
      pop.style.top = (r.bottom - R.top + 6) + 'px';
      pop.style.maxHeight = Math.max(160, R.height - (r.bottom - R.top) - 16) + 'px';
      return pop;
    }
    document.addEventListener('mousedown', function(e){
      if (pop && !pop.contains(e.target) && !e.target.closest('#eb-gear,.eb-eng-btn')) closePop();
    }, true);
    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape') { closePop(); closeHistory(); if (US) US.close(); }
    });

    function setEngine(id){
      engineId = engine(id).id;
      save(KEY.engine, engineId);
      sugCache = {};
      var e = engine();
      urlEl.placeholder = 'Search ' + e.name + ' or type a URL';
      tabs.forEach(function(t){
        if (!t.home) return;
        var b = t.page.querySelector('.eb-eng-btn');
        if (b) b.innerHTML = engIco(e) + '<svg class="eb-caret" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5"/></svg>';
        var inp = t.page.querySelector('.eb-search input');
        if (inp) inp.placeholder = 'Search with ' + e.name + ' or type a URL';
      });
    }
    function engineRows(){
      return ENGINES.map(function(e){
        return '<button type="button" class="eb-pop-row' + (e.id === engineId ? ' is-cur' : '') + '" data-e="' + e.id + '">' +
               engIco(e) + '<span>' + esc(e.name) + (e.id === 'ddg' ? ' <em>default</em>' : '') + '</span>' +
               '<i class="eb-tick">' + svg('check') + '</i></button>';
      }).join('');
    }
    function wireEngineRows(p, after){
      Array.prototype.forEach.call(p.querySelectorAll('[data-e]'), function(b){
        b.onclick = function(){
          setEngine(b.getAttribute('data-e'));
          toast('Searching with ' + engine().name);
          after ? after() : closePop();
        };
      });
    }
    function openEngineMenu(anchor){
      if (pop && pop.classList.contains('eb-pop-eng')) { closePop(); return; }
      var p = openPop(anchor, '<div class="eb-pop-h">Search engine</div>' + engineRows(), 'eb-pop-eng');
      wireEngineRows(p);
    }

    function openSettings(){
      var gear = document.getElementById('eb-gear');
      if (pop && pop.classList.contains('eb-pop-set')) { closePop(); return; }
      var t = byId(activeId), onPage = t && !t.home;
      var us = (US && onPage && t.frame) ? US.pageInfo(t.frame) : { count:0, menu:[] };
      var p = openPop(gear,
        '<div class="eb-pop-h">Connection</div>' +
        '<div class="eb-conn" data-conn><span class="eb-dot"></span><span class="eb-conn-t"></span>' +
          '<button type="button" class="eb-mini" data-act="recon">' + ICO_RECON + 'Reconnect</button></div>' +
        '<div class="eb-pop-h">Search engine</div>' + engineRows() +
        '<label class="eb-pop-row eb-toggle"><span>Search suggestions</span>' +
          '<input type="checkbox"' + (suggestOn ? ' checked' : '') + '><i></i></label>' +
        '<div class="eb-pop-h">This page</div>' +
        '<button type="button" class="eb-pop-row" data-act="blank"' + (onPage ? '' : ' disabled') + '>' + '<span class="eb-pop-ico">' + svg('blank') + '</span><span>Open in about:blank</span></button>' +
        '<button type="button" class="eb-pop-row" data-act="copy"' + (onPage ? '' : ' disabled') + '>' + '<span class="eb-pop-ico">' + svg('copy') + '</span><span>Copy link</span></button>' +
        us.menu.map(function(c){
          return '<button type="button" class="eb-pop-row" data-cmd="' + c.id + '"><span class="eb-pop-ico">' + svg('code') + '</span>' +
                 '<span>' + esc(c.caption) + ' <em>' + esc(c.script) + '</em></span></button>';
        }).join('') +
        '<div class="eb-pop-h">Your stuff</div>' +
        '<button type="button" class="eb-pop-row" data-act="us"><span class="eb-pop-ico">' + svg('code') + '</span><span>Userscripts' +
          (us.count ? ' <em>' + us.count + ' on this page</em>' : '') + '</span></button>' +
        '<button type="button" class="eb-pop-row" data-act="hist"><span class="eb-pop-ico">' + svg('clock') + '</span><span>History</span></button>' +
        '<button type="button" class="eb-pop-row" data-act="clearhist"><span class="eb-pop-ico">' + svg('trash') + '</span><span>Clear history</span></button>' +
        '<button type="button" class="eb-pop-row" data-act="resettiles"><span class="eb-pop-ico">' + svg('home') + '</span><span>Reset home tiles</span></button>' +
        '<button type="button" class="eb-pop-row" data-act="closeall"><span class="eb-pop-ico">' + svg('tabs') + '</span><span>Close all tabs</span></button>',
        'eb-pop-set is-right');
      paintConn();
      wireEngineRows(p, function(){
        Array.prototype.forEach.call(p.querySelectorAll('[data-e]'), function(b){
          b.classList.toggle('is-cur', b.getAttribute('data-e') === engineId);
        });
      });
      Array.prototype.forEach.call(p.querySelectorAll('[data-cmd]'), function(b){
        b.onclick = function(){ closePop(); if (US && t && t.frame) US.runMenu(t.frame, +b.getAttribute('data-cmd')); };
      });
      p.querySelector('.eb-toggle input').onchange = function(){
        suggestOn = this.checked; save(KEY.sug, suggestOn);
      };
      Array.prototype.forEach.call(p.querySelectorAll('[data-act]'), function(b){
        b.onclick = function(){
          var act = b.getAttribute('data-act'), t = byId(activeId);
          if (act === 'recon') { reconnect(true); return; }
          closePop();
          if (act === 'blank' && t && !t.home) openBlank(t);
          else if (act === 'copy' && t && !t.home) copyText(t.url);
          else if (act === 'hist') openHistory();
          else if (act === 'us') { if (US) US.openManager(); else toast('Userscripts are still loading'); }
          else if (act === 'clearhist') {
            if (!history.length) { toast('History is already empty'); return; }
            if (!confirm('Clear all browsing history on this device?')) return;
            history = []; save(KEY.hist, history); toast('History cleared');
          }
          else if (act === 'resettiles') {
            if (!confirm('Put the home tiles back to the defaults?')) return;
            tiles = cloneTiles(DEFAULT_TILES); saveTiles(); repaintAllTiles(); toast('Home tiles reset');
          }
          else if (act === 'closeall') {
            tabs.slice().forEach(function(x){ x.el.remove(); x.page.remove(); });
            tabs = []; makeTab(null); toast('Closed all tabs');
          }
        };
      });
    }
    document.getElementById('eb-gear').onclick = function(e){ e.stopPropagation(); openSettings(); };

    function copyText(s){
      var ok = function(){ toast('Link copied'); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(s).then(ok, function(){ fallback(); });
      else fallback();
      function fallback(){
        var ta = document.createElement('textarea'); ta.value = s; document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); ok(); } catch (_) { toast('Could not copy'); }
        ta.remove();
      }
    }

     
    function openBlank(t){
      var w = window.open('about:blank', '_blank');
      if (!w) { toast('Pop-up blocked. Allow pop-ups for this site.'); return; }
      var d = w.document;
      d.open();
      d.write('<!doctype html><html><head><title>' + esc(t.title || hostOf(t.url)) + '</title>' +
        '<style>html,body{margin:0;height:100%;overflow:hidden;background:#000}iframe{border:0;width:100%;height:100%;display:block}</style>' +
        '</head><body><iframe allow="fullscreen; autoplay; clipboard-read; clipboard-write" src="' +
        esc(location.origin + encodeUrl(t.url)) + '"></iframe></body></html>');
      d.close();
    }

     
    var histEl = null;
    function closeHistory(){ if (histEl) { histEl.remove(); histEl = null; } }
    function dayLabel(ts){
      var d = new Date(ts), now = new Date();
      var start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      if (ts >= start) return 'Today';
      if (ts >= start - 864e5) return 'Yesterday';
      return d.toLocaleDateString(undefined, { weekday:'long', month:'short', day:'numeric' });
    }
    function openHistory(){
      closeHistory();
      histEl = document.createElement('div');
      histEl.className = 'eb-sheet';
      histEl.innerHTML = '<div class="eb-sheet-card">' +
        '<div class="eb-sheet-top"><h3>History</h3>' +
          '<button type="button" class="eb-mini" data-act="clear">' + svg('trash') + 'Clear all</button>' +
          '<button type="button" class="eb-btn" data-act="close" title="Close">' + svg('x') + '</button></div>' +
        '<div class="eb-sheet-search">' + svg('search') + '<input type="text" spellcheck="false" autocomplete="off" placeholder="Search history"></div>' +
        '<div class="eb-sheet-list"></div></div>';
      rootEl.appendChild(histEl);
      var list = histEl.querySelector('.eb-sheet-list'), inp = histEl.querySelector('input');
      function paint(){
        var q = inp.value.trim().toLowerCase(), html = '', lastDay = '', n = 0;
        history.forEach(function(h, i){
          if (q && h.u.toLowerCase().indexOf(q) < 0 && String(h.t).toLowerCase().indexOf(q) < 0) return;
          if (n++ > 300) return;
          var day = dayLabel(h.at);
          if (day !== lastDay) { html += '<div class="eb-sheet-day">' + esc(day) + '</div>'; lastDay = day; }
          var tm = new Date(h.at).toLocaleTimeString(undefined, { hour:'numeric', minute:'2-digit' });
          html += '<div class="eb-hrow" data-i="' + i + '">' + badge(h.t || hostOf(h.u), h.u, null, 'eb-fav') +
            '<span class="eb-hrow-main"><span class="eb-hrow-t">' + esc(h.t || hostOf(h.u)) + '</span>' +
            '<span class="eb-hrow-u">' + esc(hostOf(h.u)) + '</span></span>' +
            '<span class="eb-hrow-time">' + esc(tm) + '</span>' +
            '<button type="button" class="eb-hrow-x" title="Remove">' + svg('x') + '</button></div>';
        });
        list.innerHTML = html || '<div class="eb-sheet-empty">' + (q ? 'Nothing matches that.' : 'No history yet. Sites you visit show up here.') + '</div>';
      }
      paint();
      inp.oninput = paint;
      inp.focus();
      histEl.onclick = function(e){
        if (e.target === histEl) { closeHistory(); return; }
        var act = e.target.closest('[data-act]');
        if (act) {
          if (act.getAttribute('data-act') === 'close') closeHistory();
          else if (history.length && confirm('Clear all browsing history on this device?')) {
            history = []; save(KEY.hist, history); paint(); toast('History cleared');
          }
          return;
        }
        var row = e.target.closest('.eb-hrow');
        if (!row) return;
        var i = +row.getAttribute('data-i');
        if (e.target.closest('.eb-hrow-x')) {
          history.splice(i, 1); save(KEY.hist, history); paint(); return;
        }
        var u = history[i].u;
        closeHistory();
        navigate(activeId, u);
      };
    }

     
    attachSuggest(urlEl, omniEl, function(raw, engId){ navigate(activeId, raw, { engine:engId }); urlEl.blur(); });
    urlEl.addEventListener('focus', function(){ urlEl.select(); });
    urlEl.addEventListener('blur', function(){
      var t = byId(activeId);
      if (t) setTimeout(function(){ if (document.activeElement !== urlEl) urlEl.value = t.home ? '' : t.url; }, 150);
    });
    urlEl.placeholder = 'Search ' + engine().name + ' or type a URL';

    newBtn.onclick = function(){ makeTab(null); };

    backBtn.onclick = function(){
      var t = byId(activeId); if (!t) return;
      if (t.home) { if (t.hist.length) goIdx(t, t.pos); return; }
      if (t.pos > 0) goIdx(t, t.pos - 1);
    };
    fwdBtn.onclick = function(){
      var t = byId(activeId); if (!t || t.home) return;
      if (t.pos < t.hist.length - 1) goIdx(t, t.pos + 1);
    };
    function goIdx(t, i){ t.pos = i; navigate(t.id, t.hist[i], { push:false }); }

    document.getElementById('eb-reload').onclick = function(){
      var t = byId(activeId); if (t && !t.home) loadTab(t);
    };
    document.getElementById('eb-home').onclick = function(){
      var t = byId(activeId); if (!t) return;
      showHome(t);
      progress(false);
      paintTab(t); urlEl.value = ''; setState(t); updateNav(); saveTabs();
    };
    document.getElementById('eb-full').onclick = function(){
      if (document.fullscreenElement) document.exitFullscreen();
      else if (rootEl.requestFullscreen) rootEl.requestFullscreen();
    };
     
    starBtn.onclick = function(){
      var t = byId(activeId);
      if (!t || t.home) { toast('Open a site first, then star it to add it to home'); return; }
      var i = tileIndex(t.url);
      if (i >= 0) { tiles.splice(i, 1); saveTiles(); repaintAllTiles(); toast('Removed from home'); return; }
      var label = (t.title && t.title.length <= 18 && !/^https?:/.test(t.title)) ? t.title : '';
      addTile(t.url, label);
      starBtn.classList.remove('is-saved'); void starBtn.offsetWidth; starBtn.classList.add('is-saved');
    };

     
    var saved = load(KEY.tabs, null);
    if (saved && Array.isArray(saved.tabs) && saved.tabs.length) {
      var list = saved.tabs.slice(0, 15), act = Math.min(Math.max(0, saved.active | 0), list.length - 1);
      list.forEach(function(s, i){
        makeTab(s.u || null, { sleep:true, title:s.t, background:true });
      });
      select(tabs[act].id);
    } else {
      makeTab(null);
    }

     
    bootTransport().then(function(ok){ if (!reconnecting) readConn(ok); });

    nav = function (url) {
      var t = byId(activeId);
      if (t && t.home) navigate(t.id, url);
      else makeTab(url);
    };
    if (queued) { var q = queued; queued = null; nav(q); }
}

})(window);
