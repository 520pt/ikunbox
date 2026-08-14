// 小满TV - 抖音 TVBox/DRPY 源
// 使用方法：进入 TVBox 的“配置｜中心” → “抖音配置” → “设置抖音Cookie”，像 B站一样粘贴 Cookie。
// 说明：抖音接口经常变动；完整推荐/关注/精选依赖有效 Cookie 和 TVBox 壳的 JS 网络能力。

var rule = {
    title: '小满抖音',
    host: 'https://www.douyin.com',
    homeUrl: '/',
    searchable: 2,
    quickSearch: 1,
    filterable: 0,
    timeout: 20000,
    play_parse: false,
    class_name: '登录状态&儿童&推荐&关注&精选&影视&综艺&二次元&游戏&音乐&体育&美食&旅行&萌宠&亲子&直播',
    class_url: 'login&custompagechildren&recommend&follow&featured&film&entertainment&acg&game&music&sport&food&travel&pet&child&live',
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',
        'Referer': 'https://www.douyin.com/',
        'Origin': 'https://www.douyin.com',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
    },
    // ext 可传：{"cookie":"http://127.0.0.1:9978/file/TVBox/douyin_cookie.txt"}
    ext: {
        cookie: 'http://127.0.0.1:9978/file/TVBox/douyin_cookie.txt'
    },

    推荐: $js.toString(() => {
        VODS = rule.__douyinList ? rule.__douyinList('recommend', 1, '') : [{vod_id:'debug_info',vod_name:'抖音方法初始化失败',vod_pic:'',vod_remarks:'请重载配置',vod_content:'推荐函数不可用'}];
    }),

    一级: $js.toString(() => {
        var cate = MY_CATE || 'recommend';
        var page = MY_PAGE || 1;
        try {
            print('xiaoman 一级 cate=' + cate + ' page=' + page);
            var fn = rule.__douyinList;
            VODS = fn ? fn(cate, page, '') : [{vod_id:'debug_info', vod_name:'分类加载失败', vod_pic:'', vod_remarks:String(cate), vod_content:'抖音方法初始化失败，请重载配置'}];
            print('xiaoman 一级 count=' + (VODS && VODS.length ? VODS.length : 0));
        } catch (e) {
            print('xiaoman 一级 error=' + (e && e.message ? e.message : e));
            VODS = [{vod_id:'debug_info', vod_name:'分类加载失败', vod_pic:'', vod_remarks:String(cate), vod_content:String(e && e.message ? e.message : e)}];
        }
    }),

    二级: $js.toString(() => {
        var id = input || '';
        var item = rule.__detailByAwemeId ? rule.__detailByAwemeId(id) : {vod_id:id,vod_name:'抖音方法初始化失败',vod_play_from:'说明',vod_play_url:'请重载配置$https://www.douyin.com/'};
        VOD = item;
    }),

    搜索: $js.toString(() => {
        VODS = rule.__douyinList ? rule.__douyinList('search', MY_PAGE || 1, KEY || '') : [];
    }),

    lazy: $js.toString(() => {
        var url = input || '';
        input = {
            parse: 0,
            jx: 0,
            url: url,
            header: JSON.stringify(rule.__mediaHeaders ? rule.__mediaHeaders(url) : {'User-Agent':UA,'Referer':'https://www.douyin.com/'})
        };
    })
};

var UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36';
var FEATURED = {
    featured: ['', '/jingxuan'],
    film: ['300203', '/jingxuan/film'],
    entertainment: ['300204', '/jingxuan/entertainment'],
    acg: ['300205', '/jingxuan/acg'],
    game: ['300206', '/jingxuan/game'],
    music: ['300207', '/jingxuan/music'],
    sport: ['300208', '/jingxuan/sport'],
    food: ['300209', '/jingxuan/food'],
    travel: ['300210', '/jingxuan/travel'],
    pet: ['300211', '/jingxuan/pet'],
    child: ['300212', '/jingxuan/child']
};

var ABOGUS_SHIM = "(function(){var g=typeof globalThis!=='undefined'?globalThis:this;g.window=g;g.self=g;g.top=g;g.parent=g;g.frames=g;g.navigator={userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',appVersion:'5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',platform:'Win32',vendor:'Google Inc.',language:'zh-CN',languages:['zh-CN','zh','en'],cookieEnabled:true,onLine:true,hardwareConcurrency:8,maxTouchPoints:0,deviceMemory:8,plugins:{length:0},mimeTypes:{length:0},connection:{effectiveType:'4g',downlink:10,rtt:50},webdriver:false,vendorSubs:{ink:Date.now()}};var _cookie='';g.document={body:{clientWidth:1920,clientHeight:1040},documentElement:{clientWidth:1920,clientHeight:1040},title:'',domain:'douyin.com',referrer:'',readyState:'complete',hidden:false,visibilityState:'visible',location:{href:'https://www.douyin.com/',protocol:'https:',host:'www.douyin.com',hostname:'www.douyin.com',pathname:'/',origin:'https://www.douyin.com'},createElement:function(tag){return {tagName:String(tag).toUpperCase(),style:{},classList:{add:function(){},remove:function(){},contains:function(){return false}},setAttribute:function(){},getAttribute:function(){return null},appendChild:function(){},removeChild:function(){},addEventListener:function(){},removeEventListener:function(){},getBoundingClientRect:function(){return {top:0,left:0,bottom:0,right:0,width:0,height:0}},offsetWidth:0,offsetHeight:0}},createTextNode:function(text){return {nodeValue:text,textContent:text,data:text}},getElementById:function(){return null},getElementsByTagName:function(){return []},getElementsByClassName:function(){return []},querySelector:function(){return null},querySelectorAll:function(){return []},addEventListener:function(){},removeEventListener:function(){},createEvent:function(){return {initEvent:function(){},preventDefault:function(){},stopPropagation:function(){}}}};Object.defineProperty(g.document,'cookie',{get:function(){return _cookie},set:function(v){var p=String(v).split(';')[0];var eq=p.indexOf('=');if(eq>0){var k=p.substring(0,eq).trim();var cs=_cookie.split('; ').filter(function(c){return c&&c.indexOf(k+'=')!==0});cs.push(p.trim());_cookie=cs.join('; ')}}});g.location=g.document.location;g.screen={width:1920,height:1080,availWidth:1920,availHeight:1040,availLeft:0,availTop:0,colorDepth:24,pixelDepth:24,orientation:{angle:0,type:'landscape-primary'}};g.innerWidth=1920;g.innerHeight=1040;g.outerWidth=1920;g.outerHeight=1080;g.screenX=0;g.screenY=0;g.pageXOffset=0;g.pageYOffset=0;g.scrollX=0;g.scrollY=0;g.devicePixelRatio=1;g.XMLHttpRequest=function(){this.readyState=0;this.status=0;this.statusText='';this.responseText='';this.responseURL='';this.withCredentials=false;this.__headers={}};g.XMLHttpRequest.prototype.open=function(){};g.XMLHttpRequest.prototype.send=function(){};g.XMLHttpRequest.prototype.abort=function(){};g.XMLHttpRequest.prototype.setRequestHeader=function(n,v){this.__headers[n]=v};g.XMLHttpRequest.prototype.getResponseHeader=function(){return null};g.XMLHttpRequest.prototype.getAllResponseHeaders=function(){return ''};g.XMLHttpRequest.prototype.addEventListener=function(){};g.XMLHttpRequest.prototype.removeEventListener=function(){};g.fetch=function(){return Promise.resolve({ok:true,status:200,json:function(){return Promise.resolve({})},text:function(){return Promise.resolve('')}})};var _timerId=0;g.setTimeout=function(fn){var id=++_timerId;if(typeof fn==='function'){try{fn()}catch(e){}}return id};g.setInterval=function(){return ++_timerId};g.clearTimeout=function(){};g.clearInterval=function(){};g.requestAnimationFrame=function(){return ++_timerId};g.cancelAnimationFrame=function(){};var _storage={};g.localStorage={getItem:function(k){return _storage[k]||null},setItem:function(k,v){_storage[k]=String(v)},removeItem:function(k){delete _storage[k]},clear:function(){_storage={}},get length(){return Object.keys(_storage).length},key:function(i){return Object.keys(_storage)[i]||null}};g.sessionStorage=g.localStorage;g.crypto={getRandomValues:function(arr){for(var i=0;i<arr.length;i++)arr[i]=Math.floor(Math.random()*256);return arr},subtle:{digest:function(){return Promise.resolve(new ArrayBuffer(32))}}};var _perfStart=Date.now();g.performance={now:function(){return Date.now()-_perfStart},timing:{navigationStart:_perfStart,fetchStart:_perfStart,domainLookupStart:_perfStart,domainLookupEnd:_perfStart,connectStart:_perfStart,connectEnd:_perfStart,requestStart:_perfStart,responseStart:_perfStart,responseEnd:_perfStart,domLoading:_perfStart,domInteractive:_perfStart,domContentLoadedEventStart:_perfStart,domContentLoadedEventEnd:_perfStart,domComplete:_perfStart,loadEventStart:_perfStart,loadEventEnd:_perfStart},getEntries:function(){return []},getEntriesByType:function(){return []},getEntriesByName:function(){return []},mark:function(){},measure:function(){}};var _b64='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';g.btoa=function(s){var r='';for(var i=0;i<s.length;i+=3){var n=s.charCodeAt(i)<<16|(s.charCodeAt(i+1)||0)<<8|(s.charCodeAt(i+2)||0);for(var j=0;j<4;j++){if(i*8+j*6<=s.length*8)r+=_b64.charAt((n>>>6*(3-j))&63);else r+='='}}return r};g.atob=function(s){var b64='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';s=String(s).replace(/\\s/g,'');var r='';for(var i=0;i<s.length;i+=4){var n=0,cnt=0;for(var j=0;j<4;j++){if(i+j<s.length&&s.charAt(i+j)!=='='){n=(n<<6)|b64.indexOf(s.charAt(i+j));cnt++}else n<<=6}var bytes=cnt-1;for(var j=2;j>2-bytes;j--)r+=String.fromCharCode((n>>>(j*8))&255)}return r};g.history={pushState:function(){},replaceState:function(){},go:function(){},back:function(){},forward:function(){},length:0};g.alert=function(){};g.confirm=function(){return true};g.prompt=function(){return ''};g.open=function(){return null};g.close=function(){};g.focus=function(){};g.blur=function(){};g.print=function(){};g.getComputedStyle=function(){return new Proxy({},{get:function(){return ''}})};g.matchMedia=function(){return {matches:false,addListener:function(){},removeListener:function(){},addEventListener:function(){},removeEventListener:function(){}}};g.Image=function(){return {}};g.MutationObserver=function(){return {observe:function(){},disconnect:function(){},takeRecords:function(){return []}}};g.IntersectionObserver=function(){return {observe:function(){},disconnect:function(){}}};g.ResizeObserver=function(){return {observe:function(){},disconnect:function(){}}};g.Worker=function(){return {postMessage:function(){},terminate:function(){}}};g.Event=function(type){this.type=type};g.CustomEvent=function(type,opts){this.type=type;this.detail=opts?opts.detail:null};g.MessageChannel=function(){this.port1={postMessage:function(){},addEventListener:function(){}};this.port2={postMessage:function(){},addEventListener:function(){}}};g.addEventListener=function(){};g.removeEventListener=function(){};g.dispatchEvent=function(){return true};g.onwheelx={_Ax:'0X21'};if(typeof g.console==='undefined')g.console={log:function(){},warn:function(){},error:function(){},info:function(){},debug:function(){}};})();";


function loadABogusSigner() {
    if (typeof getABogus === 'function') return true;
    var urls = [
        'https://raw.githubusercontent.com/520pt/ikunbox/main/js/abogus_dy.js',
        'https://v6.gh-proxy.org/https://raw.githubusercontent.com/520pt/ikunbox/main/js/abogus_dy.js'
    ];
    for (var i = 0; i < urls.length; i++) {
        try {
            var code = request(urls[i], {headers:{'User-Agent':UA,'Accept':'application/javascript,*/*'}});
            if (code && code.length > 1000) {
                (0, eval)(ABOGUS_SHIM + '\n' + code);
                if (typeof initABogus === 'function') initABogus();
                if (typeof getABogus === 'function') return true;
            }
        } catch (e) { print('abogus load failed:' + (e && e.message ? e.message : e)); }
    }
    return false;
}

function abSign(path, q, body) {
    try {
        if (!loadABogusSigner()) return '';
        var query = encodeQuery(q);
        var raw = getABogus(query, body || '', path);
        var obj = JSON.parse(raw);
        return obj && obj.ok ? obj.value : '';
    } catch (e) {
        print('abogus sign failed:' + (e && e.message ? e.message : e));
        return '';
    }
}

function signedUrl(base, path, q, body) {
    var sig = abSign(path, q, body || '');
    if (sig) q.a_bogus = sig;
    return buildUrl(base, q);
}

function encodeQuery(q) {
    var arr = [];
    Object.keys(q).forEach(function(k){ if (q[k] !== undefined && q[k] !== null) arr.push(encodeURIComponent(k) + '=' + encodeURIComponent(String(q[k]))); });
    return arr.join('&');
}


function getExtObj() {
    try {
        if (typeof rule.ext === 'object') return rule.ext;
        if (typeof rule.ext === 'string' && rule.ext.trim().startsWith('{')) return JSON.parse(rule.ext);
    } catch (e) {}
    return {};
}

function readSavedCookie() {
    try { if (typeof local !== 'undefined' && local && local.get) return normalizeCookie(local.get('xiaoman_douyin', 'cookie') || ''); } catch (e) {}
    return '';
}
function saveCookie(c) {
    c = normalizeCookie(c);
    if (!c) return false;
    try { if (typeof local !== 'undefined' && local && local.set) { local.set('xiaoman_douyin', 'cookie', c); return true; } } catch (e) {}
    return false;
}
function clearSavedCookie() {
    try { if (typeof local !== 'undefined' && local && local.delete) local.delete('xiaoman_douyin', 'cookie'); } catch (e) {}
}
function cookieScore(c) {
    c = normalizeCookie(c);
    if (!c) return 0;
    var score = 1;
    if (/sessionid=|sessionid_ss=|sid_tt=|uid_tt=|passport_csrf_token=/.test(c)) score += 50;
    if (/ttwid=/.test(c)) score += 15;
    if (/s_v_web_id=/.test(c)) score += 15;
    if (/UIFID=/.test(c)) score += 15;
    if (/msToken=/.test(c)) score += 5;
    if (/dy_swidth=/.test(c) && /dy_sheight=/.test(c)) score += 3;
    if (/device_web_cpu_core=/.test(c) || /device_web_memory_size=/.test(c)) score += 2;
    return score;
}
function bestCookie(list) {
    var best = '';
    var bestScore = 0;
    for (var i = 0; i < list.length; i++) {
        var c = normalizeCookie(list[i]);
        var score = cookieScore(c);
        if (score > bestScore || (score === bestScore && c.length > best.length)) {
            best = c;
            bestScore = score;
        }
    }
    return best;
}
function readCookie() {
    var ext = getExtObj();
    var c = ext.cookie || ext.douyin_cookie || '';
    var candidates = [];
    var saved = readSavedCookie();
    if (saved) candidates.push(saved);
    if (/^https?:\/\//.test(c)) {
        var urls = [c];
        if (c.indexOf('127.0.0.1:9979') >= 0) urls.push(c.replace('127.0.0.1:9979', '127.0.0.1:9978'));
        if (c.indexOf('127.0.0.1:9978') >= 0) urls.push(c.replace('127.0.0.1:9978', '127.0.0.1:9979'));
        for (var i = 0; i < urls.length; i++) {
            var got = tryReadCookieUrl(urls[i]);
            if (got) candidates.push(got);
        }
    } else {
        var got2 = normalizeCookie(c);
        if (got2) candidates.push(got2);
    }
    return bestCookie(candidates);
}

function tryReadCookieUrl(url) {
    var opts = [
        {buffer: 2, headers: {'User-Agent': UA, 'Accept': 'text/plain,*/*'}},
        {buffer: 1, headers: {'User-Agent': UA, 'Accept': 'text/plain,*/*'}},
        {headers: {'User-Agent': UA, 'Accept': 'text/plain,*/*'}}
    ];
    for (var i = 0; i < opts.length; i++) {
        try {
            var raw = request(url, opts[i]);
            var got = normalizeCookie(raw);
            cookieDiag(url, opts[i].buffer || 0, raw, got);
            if (got) return got;
        } catch (e) { print('xiaoman cookie read failed url=' + url + ' buffer=' + (opts[i].buffer || 0) + ' err=' + (e && e.message ? e.message : e)); }
    }
    return '';
}
function normalizeCookie(raw) {
    raw = decodeMaybeBytes(raw);
    raw = String(raw || '').replace(/^\uFEFF/, '').trim();
    if (!raw) return '';
    var b64 = tryBase64Decode(raw);
    if (b64 && /sessionid=|sessionid_ss=|sid_tt=|uid_tt=|passport_csrf_token=|ttwid=|s_v_web_id=|UIFID=/.test(b64)) raw = b64;
    if (/^\{/.test(raw)) {
        try { var obj = JSON.parse(raw); if (obj.cookie) raw = obj.cookie; else if (obj.Cookie) raw = obj.Cookie; else if (obj.content) raw = obj.content; } catch (e) {}
    }
    var lines = raw.split(/\r?\n/).map(function(s){ return s.trim(); }).filter(function(s){ return s && s.charAt(0) !== '#'; });
    raw = lines.join('; ').replace(/^Cookie\s*:\s*/i, '').trim();
    raw = raw.replace(/^['"]|['"]$/g, '').replace(/\s*;\s*/g, '; ').trim();
    if (!/[A-Za-z0-9_\-]+=/.test(raw)) return '';
    return raw;
}
function decodeMaybeBytes(raw) {
    if (raw == null) return '';
    if (typeof raw === 'object') {
        if (typeof raw.length === 'number') {
            var s = '';
            for (var i = 0; i < raw.length; i++) { var n = Number(raw[i]); if (n < 0) n += 256; s += String.fromCharCode(n || 0); }
            return s;
        }
        try { var j = JSON.stringify(raw); if (j && j !== '{}') return decodeMaybeBytes(j); } catch (e) {}
        try { var ts = String(raw); if (ts && ts !== '[object Object]') return ts; } catch (e2) {}
        return '';
    }
    var text = String(raw);
    if (/^\s*\[\s*-?\d{1,3}(\s*,\s*-?\d{1,3})+\s*\]\s*$/.test(text)) { try { return decodeMaybeBytes(JSON.parse(text)); } catch (e) {} }
    if (/^\s*-?\d{1,3}(\s*,\s*-?\d{1,3})+\s*$/.test(text)) return text.split(/\s*,\s*/).map(function(n){ var b = Number(n) || 0; if (b < 0) b += 256; return String.fromCharCode(b); }).join('');
    if (/^(-?\d{1,3}\s*){10,}$/.test(text.trim())) return text.trim().split(/\s+/).map(function(n){ var b = Number(n) || 0; if (b < 0) b += 256; return String.fromCharCode(b); }).join('');
    return text;
}
function tryBase64Decode(text) {
    text = String(text || '').trim();
    if (!/^[A-Za-z0-9+/=\r\n]+$/.test(text) || text.length < 12 || text.indexOf('=') < 0) return '';
    try { return atob(text.replace(/\s+/g, '')); } catch (e) {}
    try { return base64Decode(text); } catch (e2) {}
    return '';
}
function cookieDiag(url, buffer, raw, got) {
    try {
        var rawType = Object.prototype.toString.call(raw);
        var rawLen = raw && typeof raw.length === 'number' ? raw.length : String(raw || '').length;
        print('xiaoman cookie url=' + url + ' buffer=' + buffer + ' rawType=' + rawType + ' rawLen=' + rawLen + ' gotLen=' + (got ? got.length : 0) + ' hasSession=' + (/sessionid=|sessionid_ss=|sid_tt=/.test(got)) + ' hasFp=' + (/s_v_web_id=|UIFID=|ttwid=/.test(got)));
    } catch (e) {}
}
function hasLoginCookie() {
    var c = readCookie();
    return /sessionid=|sessionid_ss=|sid_tt=|uid_tt=|passport_csrf_token=/.test(c);
}
function cookieStatus() {
    var c = readCookie();
    return {
        raw: c,
        hasSession: /sessionid=|sessionid_ss=|sid_tt=|uid_tt=|passport_csrf_token=/.test(c),
        hasTtwid: /ttwid=/.test(c),
        hasVerifyFp: /s_v_web_id=/.test(c),
        hasUifid: /UIFID=/.test(c),
        hasMsToken: /msToken=/.test(c)
    };
}
function hasFullCookie() {
    var s = cookieStatus();
    return s.hasSession && s.hasTtwid && s.hasVerifyFp && s.hasUifid;
}
function cookieMissingText(st) {
    var miss = [];
    if (!st.hasSession) miss.push('sessionid/sessionid_ss');
    if (!st.hasTtwid) miss.push('ttwid');
    if (!st.hasVerifyFp) miss.push('s_v_web_id');
    if (!st.hasUifid) miss.push('UIFID');
    if (!st.hasMsToken) miss.push('msToken');
    return miss.join('、');
}


function cookieMap() {
    var c = readCookie();
    var m = {};
    String(c || '').split(';').forEach(function(part){
        var idx = part.indexOf('=');
        if (idx > 0) {
            var k = part.substring(0, idx).trim();
            var v = part.substring(idx + 1).trim();
            if (k) m[k] = v;
        }
    });
    return m;
}
function randomToken(len) {
    var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var out = '';
    for (var i = 0; i < len; i++) out += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    return out;
}
function addCookieDynamicParams(q, includeMsToken) {
    var c = cookieMap();
    if (includeMsToken) q.msToken = c.msToken || randomToken(126);
    q.screen_width = c.dy_swidth || q.screen_width || '1920';
    q.screen_height = c.dy_sheight || q.screen_height || '1080';
    q.cpu_core_num = c.device_web_cpu_core || '20';
    q.device_memory = c.device_web_memory_size || '32';
    if (c.s_v_web_id) { q.verifyFp = c.s_v_web_id; q.fp = c.s_v_web_id; }
    if (c.UIFID) q.uifid = c.UIFID;
    if (c.user_unique_id) q.webid = c.user_unique_id;
    if (c.UIFID && !q['x-secsdk-web-signature']) {
        q.timestamp = String(Math.floor(Date.now() / 1000));
    }
    return q;
}
function recommendRawData(refreshIndex, recentAwemeIds) {
    if (!recentAwemeIds || Number(refreshIndex || 1) <= 1) return '{"is_client":false,"ff_danmaku_status":1,"danmaku_switch_status":0,"is_dash_user":1,"related_recommend":1,"is_xigua_user":0}';
    return '{"videoPrefer":{"fsn":[],"like":[],"halfMin":[' + recentAwemeIds + '],"min":[' + recentAwemeIds + '],"dislike":[]},"is_client":false,"ff_danmaku_status":0,"danmaku_switch_status":1,"is_dash_user":1,"is_auto_play":0,"is_full_screen":0,"is_full_webscreen":0,"is_mute":0,"is_speed":1,"is_visible":1,"related_recommend":1,"is_xigua_user":0}';
}

function dyHeaders(referer) {
    var h = {
        'User-Agent': UA,
        'Referer': referer || 'https://www.douyin.com/',
        'Origin': referer && referer.indexOf('live.douyin.com') >= 0 ? 'https://live.douyin.com' : 'https://www.douyin.com',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
    };
    var c = readCookie();
    if (c) h.Cookie = c;
    return h;
}

function mediaHeaders(url) {
    var h = {'User-Agent': UA, 'Referer': 'https://www.douyin.com/', 'Origin': 'https://www.douyin.com'};
    var c = readCookie();
    if (c) h.Cookie = c;
    return h;
}

function commonQuery() {
    var q = {
        device_platform: 'webapp',
        aid: '6383',
        channel: 'channel_pc_web',
        pc_client_type: '1',
        version_code: '190500',
        version_name: '19.5.0',
        cookie_enabled: 'true',
        screen_width: '1920',
        screen_height: '1080',
        browser_language: 'zh-CN',
        browser_platform: 'Win32',
        browser_name: 'Chrome',
        browser_version: '147.0.0.0',
        browser_online: 'true',
        engine_name: 'Blink',
        engine_version: '147.0.0.0',
        os_name: 'Windows',
        os_version: '10',
        webcast_sdk_version: '1.0.14-beta.0',
        update_version_code: '170400',
        count: '18'
    };
    return addCookieDynamicParams(q, true);
}

function getJson(url, referer) {
    try {
        var html = request(url, {headers: dyHeaders(referer || 'https://www.douyin.com/')});
        if (!html || html.length < 2) return {};
        return JSON.parse(html);
    } catch (e) {
        print('抖音请求失败: ' + e.message + ' url=' + url);
        return {};
    }
}


function postJson(url, referer, body) {
    try {
        var html = request(url, {method:'POST', body: body || '', headers: dyHeaders(referer || 'https://www.douyin.com/')});
        if (!html || html.length < 2) return {};
        return JSON.parse(html);
    } catch (e) {
        print('抖音POST失败: ' + e.message + ' url=' + url);
        return {};
    }
}


function postJson(url, referer, body) {
    try {
        var html = request(url, {method:'POST', body: body || '', headers: dyHeaders(referer || 'https://www.douyin.com/')});
        if (!html || html.length < 2) return {};
        return JSON.parse(html);
    } catch (e) {
        print('抖音POST失败: ' + e.message + ' url=' + url);
        return {};
    }
}

function buildUrl(base, q) {
    var arr = [];
    Object.keys(q).forEach(function(k){ if (q[k] !== undefined && q[k] !== null) arr.push(encodeURIComponent(k) + '=' + encodeURIComponent(String(q[k]))); });
    return base + (base.indexOf('?') >= 0 ? '&' : '?') + arr.join('&');
}

function douyinList(cate, page, wd) {
    var pg = Number(page || 1);
    if (cate === 'login') return (pg > 1) ? [] : [loginStatusVod()];
    if (isCustomPage(cate)) return (pg > 1) ? [] : customPageList(cate);
    if (cate === 'search') return searchList(wd, page);
    if (!hasFullCookie()) return (pg > 1) ? [] : [loginHintVod()];
    if (cate === 'follow') return followList(page);
    if (cate === 'live') return liveList(page);
    if (FEATURED[cate]) return featuredList(cate, page);
    return recommendList(page);
}


function isCustomPage(cate) {
    var s = String(cate || '');
    return s.indexOf('custompage') === 0 || s.indexOf('custom_page_') === 0;
}

function debugVod(title, remark, content) {
    return {vod_id:'debug_info', vod_name:title || '调试信息', vod_pic:'', vod_remarks:remark || '', vod_content:content || ''};
}

function customPageList(cate) {
    var id = String(cate || '').replace(/^custompage/, '').replace(/^custom_page_/, '');
    var pages = CUSTOM_PAGES || [];
    for (var i = 0; i < pages.length; i++) {
        if (String(pages[i].id) === id) return customBloggerCards(pages[i]);
    }
    return [{vod_id:'custom_empty', vod_name:'自定义页面为空', vod_pic:'', vod_remarks:'请检查配置'}];
}

function customBloggerCards(page) {
    var out = [];
    var items = page.items || [];
    for (var i = 0; i < items.length; i++) {
        var it = items[i] || {};
        var sec = it.sec_user_id || parseSecUserId(it.url || '');
        if (!sec) continue;
        var name = it.name || ('博主' + (i + 1));
        out.push({
            vod_id: 'author@@' + sec + '@@' + encodeURIComponent(name),
            vod_name: name,
            vod_pic: 'https://lf1-cdn-tos.bytegoofy.com/goofy/ies/douyin_web/public/favicon.ico',
            vod_remarks: page.title || '自定义博主',
            vod_content: '打开后显示该博主作品。' + (it.note ? ('\n' + it.note) : '')
        });
    }
    return out.length ? out : [{vod_id:'custom_empty', vod_name:'自定义页面没有可用博主', vod_pic:'', vod_remarks:'请检查配置'}];
}

function parseSecUserId(url) {
    var m = String(url || '').match(/\/user\/([^?/#]+)/);
    return m ? decodeURIComponent(m[1]) : '';
}

function safePlayName(s) {
    return String(s || '作品').replace(/[\r\n\t$#]/g, ' ').trim() || '作品';
}

function authorWorksDetail(secUserId, name) {
    if (!hasFullCookie()) {
        var st = cookieStatus();
        return {vod_id:'author@@' + secUserId + '@@' + encodeURIComponent(name), vod_name:name, vod_pic:'https://lf1-cdn-tos.bytegoofy.com/goofy/ies/douyin_web/public/favicon.ico', vod_remarks:'Cookie 不完整', vod_content:'请先配置完整抖音 Cookie。当前缺少：' + (cookieMissingText(st) || '无'), vod_play_from:'', vod_play_url:''};
    }
    var q = commonQuery();
    q.sec_user_id = secUserId;
    q.max_cursor = '0';
    q.count = '30';
    q.locate_query = 'false';
    q.show_live_replay_strategy = '1';
    q.publish_video_strategy_type = '2';
        var url = signedUrl('https://www.douyin.com/aweme/v1/web/aweme/post/', '/aweme/v1/web/aweme/post/', q, '');
        var json = getJson(url, 'https://www.douyin.com/user/' + secUserId);
    var list = parseAwemeList(json);
    var play = [];
    for (var i = 0; i < list.length; i++) {
        var v = list[i];
        if (v.play_url) play.push(safePlayName(v.vod_name || ('作品' + (i + 1))) + '$' + v.play_url);
    }
    return {
        vod_id: 'author@@' + secUserId + '@@' + encodeURIComponent(name),
        vod_name: name,
        vod_pic: list.length ? list[0].vod_pic : 'https://lf1-cdn-tos.bytegoofy.com/goofy/ies/douyin_web/public/favicon.ico',
        vod_remarks: list.length ? ('作品 ' + list.length) : '需要有效 Cookie',
        vod_content: list.length ? '选择下方作品播放。' : '没有读取到作品，请确认抖音 Cookie 有效后重试。',
        vod_play_from: '抖音作品',
        vod_play_url: play.length ? play.join('#') : ('请先填写 Cookie$https://www.douyin.com/user/' + secUserId)
    };
}


function isCustomPage(cate) {
    var s = String(cate || '');
    return s.indexOf('custompage') === 0 || s.indexOf('custom_page_') === 0;
}

function debugVod(title, remark, content) {
    return {vod_id:'debug_info', vod_name:title || '调试信息', vod_pic:'', vod_remarks:remark || '', vod_content:content || ''};
}

function customPageList(cate) {
    var id = String(cate || '').replace(/^custompage/, '').replace(/^custom_page_/, '');
    var pages = CUSTOM_PAGES || [];
    for (var i = 0; i < pages.length; i++) {
        if (String(pages[i].id) === id) return customBloggerCards(pages[i]);
    }
    return [{vod_id:'custom_empty', vod_name:'自定义页面为空', vod_pic:'', vod_remarks:'请检查配置'}];
}

function customBloggerCards(page) {
    var out = [];
    var items = page.items || [];
    for (var i = 0; i < items.length; i++) {
        var it = items[i] || {};
        var sec = it.sec_user_id || parseSecUserId(it.url || '');
        if (!sec) continue;
        var name = it.name || ('博主' + (i + 1));
        out.push({
            vod_id: 'author@@' + sec + '@@' + encodeURIComponent(name),
            vod_name: name,
            vod_pic: 'https://lf1-cdn-tos.bytegoofy.com/goofy/ies/douyin_web/public/favicon.ico',
            vod_remarks: page.title || '自定义博主',
            vod_content: '打开后显示该博主作品。' + (it.note ? ('\n' + it.note) : '')
        });
    }
    return out.length ? out : [{vod_id:'custom_empty', vod_name:'自定义页面没有可用博主', vod_pic:'', vod_remarks:'请检查配置'}];
}

function parseSecUserId(url) {
    var m = String(url || '').match(/\/user\/([^?/#]+)/);
    return m ? decodeURIComponent(m[1]) : '';
}

function safePlayName(s) {
    return String(s || '作品').replace(/[\r\n\t$#]/g, ' ').trim() || '作品';
}

function authorWorksDetail(secUserId, name) {
    var q = commonQuery();
    q.sec_user_id = secUserId;
    q.max_cursor = '0';
    q.count = '30';
        var url = signedUrl('https://www.douyin.com/aweme/v1/web/aweme/post/', '/aweme/v1/web/aweme/post/', q, '');
        var json = getJson(url, 'https://www.douyin.com/user/' + secUserId);
    var list = parseAwemeList(json);
    var play = [];
    for (var i = 0; i < list.length; i++) {
        var v = list[i];
        if (v.play_url) play.push(safePlayName(v.vod_name || ('作品' + (i + 1))) + '$' + v.play_url);
    }
    return {
        vod_id: 'author@@' + secUserId + '@@' + encodeURIComponent(name),
        vod_name: name,
        vod_pic: list.length ? list[0].vod_pic : 'https://lf1-cdn-tos.bytegoofy.com/goofy/ies/douyin_web/public/favicon.ico',
        vod_remarks: list.length ? ('作品 ' + list.length) : '需要有效 Cookie',
        vod_content: list.length ? '选择下方作品播放。' : '没有读取到作品，请确认抖音 Cookie 有效后重试。',
        vod_play_from: '抖音作品',
        vod_play_url: play.length ? play.join('#') : ('请先填写 Cookie$https://www.douyin.com/user/' + secUserId)
    };
}

function loginStatusVod() {
    var st = cookieStatus();
    var full = st.hasSession && st.hasTtwid && st.hasVerifyFp && st.hasUifid;
    var any = !!st.raw;
    var missing = cookieMissingText(st);
    return {
        vod_id: full ? 'cookie_ok' : 'login_required',
        vod_name: full ? '抖音 Cookie 已完整配置' : (any ? '抖音 Cookie 不完整' : '先配置抖音 Cookie'),
        vod_pic: 'https://lf1-cdn-tos.bytegoofy.com/goofy/ies/douyin_web/public/favicon.ico',
        vod_remarks: full ? '推荐/精选/博主可用' : (any ? ('缺少：' + missing) : '配置中心设置 Cookie'),
        vod_content: full ? '已检测到完整抖音 Cookie。可使用推荐、精选、儿童博主作品等功能。' : '配置方法：进入“配置｜中心” → “抖音配置” → “设置抖音Cookie”，像 B站配置一样粘贴完整 Cookie；也可把 Cookie 写入 /sdcard/TVBox/douyin_cookie.txt，只保留一行，不带 Cookie: 前缀，然后重载配置。Cookie 建议至少包含 sessionid/sessionid_ss、s_v_web_id、UIFID、ttwid，最好也带 msToken。当前缺少：' + (missing || '无')
    };
}
function loginHintVod() {
    return {
        vod_id: 'login_required',
        vod_name: '需要先登录抖音 Cookie',
        vod_pic: 'https://lf1-cdn-tos.bytegoofy.com/goofy/ies/douyin_web/public/favicon.ico',
        vod_remarks: '把 Cookie 填到 douyin_cookie.txt',
        vod_content: '配置方法：进入“配置｜中心” → “抖音配置” → “设置抖音Cookie”，像 B站配置一样粘贴完整 Cookie；也可把 Cookie 写入 /sdcard/TVBox/douyin_cookie.txt，只保留一行，不带 Cookie: 前缀，然后重载配置。Cookie 建议包含 sessionid/sessionid_ss、s_v_web_id、UIFID、ttwid、msToken。'
    };
}

function recommendList(page) {
    var q = commonQuery();
    var p = page || 1;
    q.filterGids = '';
    q.need_filter_settings = '0';
    q.count = '18';
    q.refresh_index = String(p);
    q.video_type_select = '1';
    q.aweme_pc_rec_raw_data = recommendRawData(p, '');
    q.pull_type = '2';
    q.min_window = '0';
    q.free_right = '0';
    q.view_count = '0';
    q.is_client = 'false';
    q.danmaku_switch_status = '0';
    q.is_dash_user = '1';
    q.xigua_user = '0';
    q.webcast_sdk_version = '170400';
    q.webcast_version_code = '170400';
    var url = signedUrl('https://www.douyin.com/aweme/v1/web/tab/feed/', '/aweme/v1/web/tab/feed/', q, '');
    var json = getJson(url, 'https://www.douyin.com/?recommend=1');
    var list = parseAwemeList(json);
    if (list.length) return list;
    return [{vod_id:'debug_info', vod_name:'推荐没有加载到视频', vod_pic:'', vod_remarks:'请确认 Cookie 有效', vod_content:'推荐需要有效抖音 Cookie 和指纹 Cookie。建议 Cookie 包含 sessionid/sessionid_ss、s_v_web_id、UIFID、ttwid、msToken。'}];
}

function followList(page) {
    var q = commonQuery();
    q.cursor = String(((page || 1) - 1) * 18);
    q.count = '18';
    var url = buildUrl('https://www.douyin.com/aweme/v1/web/follow/feed/', q);
    var json = getJson(url, 'https://www.douyin.com/follow');
    return parseAwemeList(json);
}

function featuredList(cate, page) {
    var item = FEATURED[cate] || FEATURED.featured;
    var tagId = item[0];
    var path = item[1];
    var q = commonQuery();
    q.module_id = '3003101';
    q.count = '18';
    q.filterGids = '';
    q.presented_ids = '';
    q.refresh_index = String(page || 1);
    q.refer_id = '';
    q.refer_type = '10';
    q.pull_type = '2';
    q.awemePcRecRawData = '{\"is_xigua_user\":0,\"danmaku_switch_status\":0,\"is_client\":false}';
    q['Seo-Flag'] = '0';
    q.install_time = String(Math.floor(Date.now() / 1000) - 86400);
    q.tag_id = tagId;
    q.use_lite_type = '0';
    q.pre_log_id = '';
    q.pre_item_ids = '';
    q.pre_room_ids = '';
    q.xigua_user = '0';
    q.support_h265 = '1';
    q.support_dash = '1';
    q.active_id = '';
    q.is_active_tab = 'false';
    var url = signedUrl('https://www.douyin.com/aweme/v2/web/module/feed/', '/aweme/v2/web/module/feed/', q, '');
    var json = postJson(url, 'https://www.douyin.com' + path, '');
    var list = parseAwemeList(json);
    if (list.length) return list;
    return [{vod_id:'featured_empty', vod_name:'精选分类需要有效 Cookie/签名环境', vod_pic:'', vod_remarks:'请填 Cookie 后重试'}];
}

function searchList(wd, page) {
    var kw = String(wd || '').trim();
    if (!kw) return [];
    if (/^(清除|删除).*cookie$/i.test(kw) || /^clear\s*cookie$/i.test(kw)) {
        clearSavedCookie();
        return [{vod_id:'login_required', vod_name:'抖音 Cookie 已清除', vod_pic:'https://lf1-cdn-tos.bytegoofy.com/goofy/ies/douyin_web/public/favicon.ico', vod_remarks:'请重新配置 Cookie', vod_content:'已清除通过搜索保存的 Cookie；如果 /sdcard/TVBox/douyin_cookie.txt 里还有 Cookie，请手动删除或覆盖。'}];
    }
    if (/^(Cookie\s*[:=])|sessionid=|sessionid_ss=|sid_tt=|passport_csrf_token=|ttwid=|s_v_web_id=|UIFID=/i.test(kw)) {
        var ck = normalizeCookie(kw);
        var ok = saveCookie(ck);
        return [{vod_id: ok ? 'cookie_ok' : 'login_required', vod_name: ok ? '抖音 Cookie 已保存' : '抖音 Cookie 保存失败', vod_pic:'https://lf1-cdn-tos.bytegoofy.com/goofy/ies/douyin_web/public/favicon.ico', vod_remarks: ok ? '返回登录状态查看' : '当前 TVBox 不支持本地保存', vod_content: ok ? 'Cookie 已保存到 TVBox 本地存储。重新进入登录状态，显示“已登录”后即可使用推荐、精选、儿童博主作品。' : '也可以把 Cookie 写入 /sdcard/TVBox/douyin_cookie.txt 后重载配置。'}];
    }
    var q = commonQuery();
    q.keyword = kw;
    q.search_channel = 'aweme_video_web';
    q.offset = String(((page || 1) - 1) * 18);
    q.count = '18';
    var url = signedUrl('https://www.douyin.com/aweme/v1/web/search/item/', '/aweme/v1/web/search/item/', q, '');
    var json = getJson(url, 'https://www.douyin.com/search/' + encodeURIComponent(kw));
    return parseAwemeList(json);
}



function liveList(page) {
    var q = {
        aid: '6383',
        app_name: 'douyin_web',
        live_id: '1',
        device_platform: 'web',
        language: 'zh-CN',
        count: '18',
        offset: String(((page || 1) - 1) * 18)
    };
    var url = buildUrl('https://live.douyin.com/webcast/feed/', q);
    var json = getJson(url, 'https://live.douyin.com/');
    return parseLiveList(json);
}

function detailByAwemeId(id) {
    if (id === 'login_required' || id === 'featured_empty' || id === 'cookie_ok' || id === 'custom_empty' || id === 'debug_info') {
        var ok = id === 'cookie_ok';
        return {vod_id:id, vod_name: ok ? '抖音 Cookie 已完整配置' : '抖音 Cookie 配置说明', vod_play_from:'', vod_play_url:''};
    }
    if (String(id).indexOf('author@@') === 0) {
        var a = String(id).split('@@');
        return authorWorksDetail(a[1] || '', decodeURIComponent(a[2] || '抖音博主'));
    }
    if (String(id).indexOf('author@@') === 0) {
        var a = String(id).split('@@');
        return authorWorksDetail(a[1] || '', decodeURIComponent(a[2] || '抖音博主'));
    }
    if (String(id).indexOf('live$') === 0) {
        var p = String(id).split('$');
        return {vod_id:id, vod_name:p[1] || '抖音直播', vod_pic:p[3] || '', vod_play_from:'抖音直播', vod_play_url:(p[1] || '直播') + '$' + (p[2] || '')};
    }
    var q = commonQuery();
    q.aweme_id = id;
    var json = getJson(buildUrl('https://www.douyin.com/aweme/v1/web/aweme/detail/', q), 'https://www.douyin.com/video/' + id);
    var arr = parseAwemeList(json);
    var v = arr.length ? arr[0] : {vod_id:id, vod_name:'抖音视频 ' + id, vod_pic:'', vod_remarks:''};
    v.vod_play_from = '抖音';
    v.vod_play_url = (v.vod_name || id).replace(/\$/g, ' ') + '$' + (v.play_url || 'https://www.douyin.com/video/' + id);
    return v;
}

function parseAwemeList(json) {
    var out = [];
    walk(json, function(o){
        var aweme = o.aweme_id ? o : (o.aweme_info && o.aweme_info.aweme_id ? o.aweme_info : null);
        if (!aweme || !aweme.aweme_id) return;
        var video = aweme.video || {};
        var play = findPlayUrl(video);
        var cover = firstUrl(video.cover) || firstUrl(video.origin_cover) || firstUrl(video.dynamic_cover);
        var author = aweme.author || {};
        var title = aweme.desc || aweme.preview_title || aweme.aweme_id;
        if (!play) return;
        out.push({
            vod_id: String(aweme.aweme_id),
            vod_name: title,
            vod_pic: cover || '',
            vod_remarks: author.nickname || compact(((aweme.statistics||{}).digg_count)||0) + '赞',
            vod_content: title,
            play_url: play
        });
    });
    var seen = {};
    return out.filter(function(v){ if (seen[v.vod_id]) return false; seen[v.vod_id]=1; return true; });
}

function parseLiveList(json) {
    var out = [];
    walk(json, function(o){
        var room = o.room || (o.owner && o.stream_url ? o : null);
        if (!room || !room.stream_url) return;
        var stream = room.stream_url || {};
        var url = findLiveUrl(stream);
        if (!url) return;
        var owner = room.owner || {};
        var title = room.title || owner.nickname || '抖音直播';
        var cover = firstUrl(room.cover) || firstUrl(room.room_cover) || firstUrl(owner.avatar_thumb);
        out.push({vod_id:'live$'+title+'$'+url+'$'+cover, vod_name:title, vod_pic:cover||'', vod_remarks:compact(room.user_count||0)+'人', vod_content:title});
    });
    return out;
}

function findPlayUrl(video) {
    var candidates = [];
    if (video.bit_rate && video.bit_rate.forEach) video.bit_rate.forEach(function(b){ addUrls(candidates, b.play_addr || b.play_addr_265); });
    addUrls(candidates, video.play_addr);
    addUrls(candidates, video.download_addr);
    candidates = candidates.map(function(u){ return String(u).replace('playwm', 'play'); }).filter(Boolean);
    candidates.sort(function(a,b){ return rankPlay(b)-rankPlay(a); });
    return candidates[0] || '';
}

function findLiveUrl(stream) {
    var flv = stream.flv_pull_url || {};
    var hls = stream.hls_pull_url_map || {};
    return flv.FULL_HD1 || flv.HD1 || flv.SD1 || flv.SD2 || hls.FULL_HD1 || hls.HD1 || hls.SD1 || '';
}

function addUrls(out, addr) {
    if (!addr) return;
    if (addr.url_list && addr.url_list.forEach) addr.url_list.forEach(function(u){ if (u) out.push(u); });
    if (addr.uri && /^https?:/.test(addr.uri)) out.push(addr.uri);
}

function firstUrl(addr) {
    if (!addr) return '';
    if (addr.url_list && addr.url_list.length) return addr.url_list[0];
    if (addr.uri && /^https?:/.test(addr.uri)) return addr.uri;
    return '';
}

function rankPlay(u) {
    u = String(u || '');
    if (u.indexOf('douyinvod.com') >= 0) return 100;
    if (u.indexOf('/aweme/v1/play') >= 0) return 20;
    return 1;
}

function walk(x, fn) {
    if (!x) return;
    if (Array.isArray(x)) { x.forEach(function(i){ walk(i, fn); }); return; }
    if (typeof x === 'object') {
        fn(x);
        Object.keys(x).forEach(function(k){ var v=x[k]; if (v && typeof v === 'object') walk(v, fn); });
    }
}

function compact(n) {
    n = Number(n || 0);
    if (n >= 10000) return (n / 10000).toFixed(1) + '万';
    return String(n || '');
}
try {
    rule.__douyinList = douyinList;
    rule.__detailByAwemeId = detailByAwemeId;
    rule.__mediaHeaders = mediaHeaders;
    rule.__readCookie = readCookie;
} catch (e) { print('xiaoman attach failed:' + (e && e.message ? e.message : e)); }
try {
    rule.__douyinList = douyinList;
    rule.__detailByAwemeId = detailByAwemeId;
    rule.__mediaHeaders = mediaHeaders;
    rule.__readCookie = readCookie;
} catch (e) { print('xiaoman attach failed:' + (e && e.message ? e.message : e)); }

