 
(function (global) {
'use strict';

 
var PROBE_IMG   = 'https://img.youtube.com/vi/dQw4w9WgXcQ/default.jpg';
var PROBE_MS    = 5000;
var STORE_KEY   = 'echo_yt_blocked';

var state = {
    blocked: null,
    probing: null
};

 
try {
    var hint = localStorage.getItem(STORE_KEY);
    if (hint === '1') state.blocked = true;
} catch (_) {}

 
function probe() {
    if (state.probing) return state.probing;

    state.probing = new Promise(function (resolve) {
        var done = false;
        var finish = function (blocked) {
            if (done) return;
            done = true;
            state.blocked = blocked;
            try { localStorage.setItem(STORE_KEY, blocked ? '1' : '0'); } catch (_) {}
             
            if (blocked && global.loadProxyStack) {
                global.loadProxyStack()
                    .then(function () { return global.EchoProxy.boot(); })
                    .catch(function () {});
            }
            resolve(blocked);
        };

        var timer = setTimeout(function () { finish(true); }, PROBE_MS);
        var img = new Image();
        img.onload  = function () {
            clearTimeout(timer);
            finish(!(img.naturalWidth > 0));
        };
        img.onerror = function () { clearTimeout(timer); finish(true); };
        img.src = PROBE_IMG + '?_=' + Date.now();
    });

    return state.probing;
}

 
function url(direct) {
    if (state.blocked !== true) return direct;
     
    if (!ready()) { ensureStack(); return direct; }
    try { return global.EchoProxy.encode(direct); } catch (_) { return direct; }
}

function ready() {
    if (!global.EchoProxy || !global.__uv$config || !global.EchoProxy.status) return false;
    var st = global.EchoProxy.status();
    return st.stage === 'ok' && !!st.controlled;
}

 
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', probe);
} else {
    probe();
}

 
var YT_HOSTS = /^https?:\/\/(img\.youtube\.com|i\.ytimg\.com|www\.youtube\.com|www\.youtube-nocookie\.com)\//;

document.addEventListener('error', function (e) {
    var el = e.target;
    if (!el || el.tagName !== 'IMG') return;
    if (el.__ytRetried) return;
    var src = el.currentSrc || el.src || '';
    if (!YT_HOSTS.test(src)) return;

    el.__ytRetried = 1;
    state.blocked = true;
    try { localStorage.setItem(STORE_KEY, '1'); } catch (_) {}

    ensureStack().then(function (ok) {
        if (!ok) return;
        try { el.src = global.EchoProxy.encode(src); } catch (_) {}
    });
}, true);

 
function loadApiScript(src, onReady) {
    var direct = document.createElement('script');
    direct.src = src;
    direct.onerror = function () {
        state.blocked = true;
        try { localStorage.setItem(STORE_KEY, '1'); } catch (_) {}
        ensureStack().then(function (ok) {
            if (!ok || !global.EchoProxy) { if (onReady) onReady(false); return; }
            var viaProxy = document.createElement('script');
            viaProxy.src = global.EchoProxy.encode(src);
            viaProxy.onerror = function () {
                if (global.console) console.warn('[ECHO_YT] IFrame API unavailable direct and proxied');
                if (onReady) onReady(false);
            };
            viaProxy.onload = function () { if (onReady) onReady(true); };
            document.head.appendChild(viaProxy);
        });
    };
    direct.onload = function () { if (onReady) onReady(true); };
    document.head.appendChild(direct);
}

 
function ensureStack() {
    if (global.EchoProxy) return global.EchoProxy.boot().then(function (ok) { return !!ok; });
    if (!global.loadProxyStack) return Promise.resolve(false);
    return global.loadProxyStack()
        .then(function () { return global.EchoProxy.boot(); })
        .then(function (ok) { return !!ok; })
        .catch(function () { return false; });
}

 
if (global.__ytApiFailed) {
    state.blocked = true;
    try { localStorage.setItem(STORE_KEY, '1'); } catch (_) {}
    (function (src) {
        ensureStack().then(function (ok) {
            if (!ok || !global.EchoProxy) return;
            var el = document.createElement('script');
            el.src = global.EchoProxy.encode(src);
            document.head.appendChild(el);
        });
    })(global.__ytApiFailed);
}

global.ECHO_YT = {
    url:       url,
    probe:     probe,
    script:    loadApiScript,
    ensure:    ensureStack,
    ready:     ready,
    isBlocked: function () { return state.blocked; },
     
    force: function (v) {
        state.blocked = v;
        if (v === null) { state.probing = null; return probe(); }
         
        if (v === true) return ensureStack().then(function () { return v; });
        return Promise.resolve(v);
    }
};

})(window);
