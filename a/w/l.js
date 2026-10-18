 
(function (global) {
'use strict';

 
var V = '20260926a';

var FILES = [
    '/uv/uv.bundle.js?v=' + V,
    '/uv/uv.config.js?v=' + V,
    '/baremux/index.js?v=' + V,
    '/uv/echo-proxy.js?v=' + V
];

var pending = null;

function one(src) {
    return new Promise(function (resolve, reject) {
        var el = document.createElement('script');
        el.src = src;
        el.async = false;
        el.onload = function () { resolve(); };
        el.onerror = function () { reject(new Error('failed to load ' + src)); };
        document.head.appendChild(el);
    });
}

 
function loadProxyStack() {
    if (pending) return pending;
    pending = FILES.reduce(function (chain, src) {
        return chain.then(function () { return one(src); });
    }, Promise.resolve()).catch(function (err) {
        pending = null;
        throw err;
    });
    return pending;
}


 
var deadHosts = {};
var nativeFetch = global.fetch.bind(global);

function hostOf(u) { try { return new URL(u, location.href).host; } catch (_) { return ''; } }

function timed(promise, ms, what) {
    return new Promise(function (resolve, reject) {
        var t = setTimeout(function () { reject(new Error(what + ' timeout')); }, ms);
        promise.then(function (v) { clearTimeout(t); resolve(v); },
                     function (e) { clearTimeout(t); reject(e); });
    });
}

function echoTunnelFetch(url, init, ms) {
    return timed(loadProxyStack(), 20000, 'proxy load')
        .then(function () { return timed(global.EchoProxy.fetch(url, init), ms || 25000, 'tunnel'); });
}

function echoFetch(url, init, opts) {
    opts = opts || {};
    var diag = [];
    var host = hostOf(url);
    var why = function (e) { return (e && (e.name === 'TimeoutError' ? 'timeout' : (e.message || e.name))) || 'failed'; };

    var viaTunnel = function () {
        return echoTunnelFetch(url, init, opts.tunnelMs).catch(function (e) {
            diag.push('tunnel: ' + why(e));
            var err = new Error('direct and tunnel both failed for ' + host);
            err.diag = diag;
            throw err;
        });
    };

    if (deadHosts[host] && !opts.forceDirect) {
        diag.push('direct: skipped (failed earlier)');
        return viaTunnel();
    }
    var sig = (global.AbortSignal && AbortSignal.timeout) ? AbortSignal.timeout(opts.directMs || 6000) : undefined;
    if (sig && init && init.signal && AbortSignal.any) sig = AbortSignal.any([init.signal, sig]);
    else if (init && init.signal) sig = init.signal;
    return nativeFetch(url, Object.assign({}, init || {}, { signal: sig })).catch(function (e) {
        if (init && init.signal && init.signal.aborted) throw e;
        deadHosts[host] = 1;
        diag.push('direct: ' + why(e));
        return viaTunnel();
    });
}

global.echoFetch = echoFetch;

 
var SHIM_HOSTS = {
    'www.googleapis.com':               { directMs: 8000,   path: /^\/youtube\// },
    'lrclib.net':                       { directMs: 8000 },
    'lyrist.vercel.app':                { directMs: 8000 },
    'generativelanguage.googleapis.com':{ directMs: 120000, tunnelMs: 120000 }
};

global.fetch = function (input, init) {
    try {
        var u = typeof input === 'string' ? input : (input && input.url);
        if (u && /^https:\/\//.test(u)) {
            var parsed = new URL(u);
            var rule = SHIM_HOSTS[parsed.host];
            if (rule && typeof input === 'string' && (!rule.path || rule.path.test(parsed.pathname))) {
                return echoFetch(input, init, rule);
            }
        }
    } catch (_) {}
    return nativeFetch(input, init);
};
global.echoTunnelFetch = echoTunnelFetch;

global.loadProxyStack = loadProxyStack;
global.isProxyStackLoaded = function () { return !!global.EchoProxy; };

})(window);
