import json
import pathlib
import re
import shutil
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parent
SOURCE_JS = pathlib.Path(r'F:\newwork\myDV-artifacts\ikun\tmp\tvbox-douyin\js\小满抖音.js')
UPSTREAM_URL = 'https://v6.gh-proxy.org/https://raw.githubusercontent.com/qist/tvbox/master/jsm.json'
UPSTREAM_BASE = 'https://v6.gh-proxy.org/https://raw.githubusercontent.com/qist/tvbox/master/'
OWN_BASE = 'https://v6.gh-proxy.org/https://raw.githubusercontent.com/520pt/ikunbox/main/'
VERSION = '202608132355'
OUT_JSON = ROOT / 'jsm.json'
OWN_JS = ROOT / 'js' / f'xiaoman-douyin-{VERSION}.js'
COOKIE_TEMPLATE = ROOT / 'TVBox' / 'douyin_cookie.txt'
CUSTOM_CONFIG = ROOT / 'custom_blogger_config.json'
ABOGUS_SOURCE = pathlib.Path(r'F:\newwork\myDV-artifacts\ikun\app\src\main\assets\abogus_dy.js')
ABOGUS_JS = ROOT / 'js' / 'abogus_dy.js'

OWN_SITE = {
    'key': 'xiaoman_douyin',
    'name': '小满｜抖音[Cookie/博主]',
    'type': 3,
    'api': UPSTREAM_BASE + 'lib/drpy2.min.js',
    'ext': OWN_BASE + f'js/xiaoman-douyin-{VERSION}.js',
    'searchable': 1,
    'quickSearch': 1,
    'filterable': 0,
    'changeable': 1,
    'style': {'type': 'rect', 'ratio': 1.597},
    'header': {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36'}
}

CUSTOM_JS_HELPERS = """
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
            vod_content: '打开后显示该博主作品。' + (it.note ? ('\\n' + it.note) : '')
        });
    }
    return out.length ? out : [{vod_id:'custom_empty', vod_name:'自定义页面没有可用博主', vod_pic:'', vod_remarks:'请检查配置'}];
}

function parseSecUserId(url) {
    var m = String(url || '').match(/\\/user\\/([^?/#]+)/);
    return m ? decodeURIComponent(m[1]) : '';
}

function safePlayName(s) {
    return String(s || '作品').replace(/[\\r\\n\\t$#]/g, ' ').trim() || '作品';
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
"""


def fetch_json(url: str) -> dict:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode('utf-8-sig'))


def absolutize_upstream_paths(value):
    if isinstance(value, dict):
        return {k: absolutize_upstream_paths(v) for k, v in value.items()}
    if isinstance(value, list):
        return [absolutize_upstream_paths(v) for v in value]
    if isinstance(value, str) and value.startswith('./'):
        return UPSTREAM_BASE + value[2:]
    return value


def load_custom_pages() -> list:
    if not CUSTOM_CONFIG.exists():
        return []
    data = json.loads(CUSTOM_CONFIG.read_text(encoding='utf-8-sig'))
    pages = []
    for page in data.get('pages') or []:
        if page.get('enabled') is False:
            continue
        items = []
        for item in page.get('items') or []:
            if item.get('enabled') is False or item.get('valid') is False:
                continue
            url = item.get('url') or ''
            sec = item.get('sec_user_id') or ''
            if not sec and '/user/' in url:
                sec = url.split('/user/', 1)[1].split('?', 1)[0].split('#', 1)[0].split('/', 1)[0]
            if sec:
                items.append({'name': item.get('name') or '抖音博主', 'sec_user_id': sec, 'url': url, 'note': item.get('note') or ''})
        if items:
            pages.append({'id': str(page.get('id') or 'custom'), 'title': page.get('title') or page.get('name') or '自定义', 'items': items})
    return pages


def replace_line(text: str, prefix: str, new_line: str) -> str:
    out = []
    done = False
    for line in text.splitlines():
        if not done and line.startswith(prefix):
            out.append(new_line)
            done = True
        else:
            out.append(line)
    return '\n'.join(out) + '\n'


def inject_custom_pages(js: str, pages: list) -> str:
    class_names = ['登录状态'] + [p['title'] for p in pages] + ['推荐','关注','精选','影视','综艺','二次元','游戏','音乐','体育','美食','旅行','萌宠','亲子','直播']
    class_urls = ['login'] + ['custompage' + re.sub(r'[^A-Za-z0-9]', '', p['id']) for p in pages] + ['recommend','follow','featured','film','entertainment','acg','game','music','sport','food','travel','pet','child','live']
    js = replace_line(js, '    class_name:', "    class_name: '" + '&'.join(class_names).replace("'", "") + "',")
    js = replace_line(js, '    class_url:', "    class_url: '" + '&'.join(class_urls).replace("'", "") + "',")

    js = js.replace("cookie: 'http://127.0.0.1:9978/file/TVBox/douyin_cookie.txt'", "cookie: 'http://127.0.0.1:9979/file/TVBox/douyin_cookie.txt'")
    old_cookie = """if (/^https?:\/\//.test(c)) {
        try { return normalizeCookie(request(c)); } catch (e) { return ''; }
    }"""
    new_cookie = """if (/^https?:\/\//.test(c)) {
        var urls = [c];
        if (c.indexOf('127.0.0.1:9979') >= 0) urls.push(c.replace('127.0.0.1:9979', '127.0.0.1:9978'));
        if (c.indexOf('127.0.0.1:9978') >= 0) urls.push(c.replace('127.0.0.1:9978', '127.0.0.1:9979'));
        for (var i = 0; i < urls.length; i++) {
            try {
                var got = normalizeCookie(request(urls[i], {buffer: 1, headers: {'User-Agent': UA, 'Accept': 'text/plain,*/*'}}));
                if (got) return got;
            } catch (e) {}
            try { var got2 = normalizeCookie(request(urls[i])); if (got2) return got2; } catch (e2) {}
        }
        return '';
    }"""
    js = js.replace(old_cookie, new_cookie)
    js = js.replace("已从 TVBox/douyin_cookie.txt 检测到抖音 Cookie。", "已从 /sdcard/TVBox/douyin_cookie.txt 检测到抖音 Cookie。")
    js = js.replace("在电脑浏览器登录 douyin.com，复制 Cookie 到 TVBox/douyin_cookie.txt 后重载配置。", "配置方法：在电脑浏览器登录 douyin.com，复制 Request Headers 里的 Cookie 值，放到电视/模拟器 /sdcard/TVBox/douyin_cookie.txt，只保留一行，不带 Cookie: 前缀，然后重启 TVBox 或重载配置。")

    old_normalize = """function normalizeCookie(raw) {
    raw = String(raw || '').replace(/^\\uFEFF/, '').trim();
    if (!raw) return '';
    var lines = raw.split(/\\r?\\n/).map(function(s){ return s.trim(); }).filter(function(s){ return s && s.charAt(0) !== '#'; });
    raw = lines.join('; ').replace(/^Cookie\\s*:\\s*/i, '').trim();
    return raw;
}"""
    new_normalize = """function normalizeCookie(raw) {
    raw = decodeMaybeBytes(raw);
    raw = String(raw || '').replace(/^\\uFEFF/, '').trim();
    if (!raw) return '';
    var lines = raw.split(/\\r?\\n/).map(function(s){ return s.trim(); }).filter(function(s){ return s && s.charAt(0) !== '#'; });
    raw = lines.join('; ').replace(/^Cookie\\s*:\\s*/i, '').trim();
    return raw;
}

function decodeMaybeBytes(raw) {
    if (raw == null) return '';
    if (Object.prototype.toString.call(raw) === '[object Array]') {
        var s = '';
        for (var i = 0; i < raw.length; i++) s += String.fromCharCode(Number(raw[i]) || 0);
        return s;
    }
    var text = String(raw);
    if (/^\\s*\\d{1,3}(\\s*,\\s*\\d{1,3})+\\s*$/.test(text)) {
        return text.split(/\\s*,\\s*/).map(function(n){ return String.fromCharCode(Number(n) || 0); }).join('');
    }
    if (/^(\\d{1,3}\\s*){10,}$/.test(text.trim())) {
        return text.trim().split(/\\s+/).map(function(n){ return String.fromCharCode(Number(n) || 0); }).join('');
    }
    return text;
}"""
    js = js.replace(old_normalize, new_normalize)

    if 'function abSign(' not in js:
        sign_helpers = """
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
                (0, eval)(ABOGUS_SHIM + '\\n' + code);
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
"""
        shim = r"""var ABOGUS_SHIM = "(function(){var g=typeof globalThis!=='undefined'?globalThis:this;g.window=g;g.self=g;g.top=g;g.parent=g;g.frames=g;g.navigator={userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',appVersion:'5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',platform:'Win32',vendor:'Google Inc.',language:'zh-CN',languages:['zh-CN','zh','en'],cookieEnabled:true,onLine:true,hardwareConcurrency:8,maxTouchPoints:0,deviceMemory:8,plugins:{length:0},mimeTypes:{length:0},connection:{effectiveType:'4g',downlink:10,rtt:50},webdriver:false,vendorSubs:{ink:Date.now()}};var _cookie='';g.document={body:{clientWidth:1920,clientHeight:1040},documentElement:{clientWidth:1920,clientHeight:1040},title:'',domain:'douyin.com',referrer:'',readyState:'complete',hidden:false,visibilityState:'visible',location:{href:'https://www.douyin.com/',protocol:'https:',host:'www.douyin.com',hostname:'www.douyin.com',pathname:'/',origin:'https://www.douyin.com'},createElement:function(tag){return {tagName:String(tag).toUpperCase(),style:{},classList:{add:function(){},remove:function(){},contains:function(){return false}},setAttribute:function(){},getAttribute:function(){return null},appendChild:function(){},removeChild:function(){},addEventListener:function(){},removeEventListener:function(){},getBoundingClientRect:function(){return {top:0,left:0,bottom:0,right:0,width:0,height:0}},offsetWidth:0,offsetHeight:0}},createTextNode:function(text){return {nodeValue:text,textContent:text,data:text}},getElementById:function(){return null},getElementsByTagName:function(){return []},getElementsByClassName:function(){return []},querySelector:function(){return null},querySelectorAll:function(){return []},addEventListener:function(){},removeEventListener:function(){},createEvent:function(){return {initEvent:function(){},preventDefault:function(){},stopPropagation:function(){}}}};Object.defineProperty(g.document,'cookie',{get:function(){return _cookie},set:function(v){var p=String(v).split(';')[0];var eq=p.indexOf('=');if(eq>0){var k=p.substring(0,eq).trim();var cs=_cookie.split('; ').filter(function(c){return c&&c.indexOf(k+'=')!==0});cs.push(p.trim());_cookie=cs.join('; ')}}});g.location=g.document.location;g.screen={width:1920,height:1080,availWidth:1920,availHeight:1040,availLeft:0,availTop:0,colorDepth:24,pixelDepth:24,orientation:{angle:0,type:'landscape-primary'}};g.innerWidth=1920;g.innerHeight=1040;g.outerWidth=1920;g.outerHeight=1080;g.screenX=0;g.screenY=0;g.pageXOffset=0;g.pageYOffset=0;g.scrollX=0;g.scrollY=0;g.devicePixelRatio=1;g.XMLHttpRequest=function(){this.readyState=0;this.status=0;this.statusText='';this.responseText='';this.responseURL='';this.withCredentials=false;this.__headers={}};g.XMLHttpRequest.prototype.open=function(){};g.XMLHttpRequest.prototype.send=function(){};g.XMLHttpRequest.prototype.abort=function(){};g.XMLHttpRequest.prototype.setRequestHeader=function(n,v){this.__headers[n]=v};g.XMLHttpRequest.prototype.getResponseHeader=function(){return null};g.XMLHttpRequest.prototype.getAllResponseHeaders=function(){return ''};g.XMLHttpRequest.prototype.addEventListener=function(){};g.XMLHttpRequest.prototype.removeEventListener=function(){};g.fetch=function(){return Promise.resolve({ok:true,status:200,json:function(){return Promise.resolve({})},text:function(){return Promise.resolve('')}})};var _timerId=0;g.setTimeout=function(fn){var id=++_timerId;if(typeof fn==='function'){try{fn()}catch(e){}}return id};g.setInterval=function(){return ++_timerId};g.clearTimeout=function(){};g.clearInterval=function(){};g.requestAnimationFrame=function(){return ++_timerId};g.cancelAnimationFrame=function(){};var _storage={};g.localStorage={getItem:function(k){return _storage[k]||null},setItem:function(k,v){_storage[k]=String(v)},removeItem:function(k){delete _storage[k]},clear:function(){_storage={}},get length(){return Object.keys(_storage).length},key:function(i){return Object.keys(_storage)[i]||null}};g.sessionStorage=g.localStorage;g.crypto={getRandomValues:function(arr){for(var i=0;i<arr.length;i++)arr[i]=Math.floor(Math.random()*256);return arr},subtle:{digest:function(){return Promise.resolve(new ArrayBuffer(32))}}};var _perfStart=Date.now();g.performance={now:function(){return Date.now()-_perfStart},timing:{navigationStart:_perfStart,fetchStart:_perfStart,domainLookupStart:_perfStart,domainLookupEnd:_perfStart,connectStart:_perfStart,connectEnd:_perfStart,requestStart:_perfStart,responseStart:_perfStart,responseEnd:_perfStart,domLoading:_perfStart,domInteractive:_perfStart,domContentLoadedEventStart:_perfStart,domContentLoadedEventEnd:_perfStart,domComplete:_perfStart,loadEventStart:_perfStart,loadEventEnd:_perfStart},getEntries:function(){return []},getEntriesByType:function(){return []},getEntriesByName:function(){return []},mark:function(){},measure:function(){}};var _b64='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';g.btoa=function(s){var r='';for(var i=0;i<s.length;i+=3){var n=s.charCodeAt(i)<<16|(s.charCodeAt(i+1)||0)<<8|(s.charCodeAt(i+2)||0);for(var j=0;j<4;j++){if(i*8+j*6<=s.length*8)r+=_b64.charAt((n>>>6*(3-j))&63);else r+='='}}return r};g.atob=function(s){var b64='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';s=String(s).replace(/\\s/g,'');var r='';for(var i=0;i<s.length;i+=4){var n=0,cnt=0;for(var j=0;j<4;j++){if(i+j<s.length&&s.charAt(i+j)!=='='){n=(n<<6)|b64.indexOf(s.charAt(i+j));cnt++}else n<<=6}var bytes=cnt-1;for(var j=2;j>2-bytes;j--)r+=String.fromCharCode((n>>>(j*8))&255)}return r};g.history={pushState:function(){},replaceState:function(){},go:function(){},back:function(){},forward:function(){},length:0};g.alert=function(){};g.confirm=function(){return true};g.prompt=function(){return ''};g.open=function(){return null};g.close=function(){};g.focus=function(){};g.blur=function(){};g.print=function(){};g.getComputedStyle=function(){return new Proxy({},{get:function(){return ''}})};g.matchMedia=function(){return {matches:false,addListener:function(){},removeListener:function(){},addEventListener:function(){},removeEventListener:function(){}}};g.Image=function(){return {}};g.MutationObserver=function(){return {observe:function(){},disconnect:function(){},takeRecords:function(){return []}}};g.IntersectionObserver=function(){return {observe:function(){},disconnect:function(){}}};g.ResizeObserver=function(){return {observe:function(){},disconnect:function(){}}};g.Worker=function(){return {postMessage:function(){},terminate:function(){}}};g.Event=function(type){this.type=type};g.CustomEvent=function(type,opts){this.type=type;this.detail=opts?opts.detail:null};g.MessageChannel=function(){this.port1={postMessage:function(){},addEventListener:function(){}};this.port2={postMessage:function(){},addEventListener:function(){}}};g.addEventListener=function(){};g.removeEventListener=function(){};g.dispatchEvent=function(){return true};g.onwheelx={_Ax:'0X21'};if(typeof g.console==='undefined')g.console={log:function(){},warn:function(){},error:function(){},info:function(){},debug:function(){}};})();";
"""
        js = js.replace('function getExtObj() {', shim + '\n' + sign_helpers + '\nfunction getExtObj() {')

    js = js.replace("VODS = douyinList('recommend', 1, '');", "VODS = rule.__douyinList ? rule.__douyinList('recommend', 1, '') : [{vod_id:'debug_info',vod_name:'抖音方法初始化失败',vod_pic:'',vod_remarks:'请重载配置',vod_content:'推荐函数不可用'}];")
    js = js.replace("var item = detailByAwemeId(id);", "var item = rule.__detailByAwemeId ? rule.__detailByAwemeId(id) : {vod_id:id,vod_name:'抖音方法初始化失败',vod_play_from:'说明',vod_play_url:'请重载配置$https://www.douyin.com/'};")
    js = js.replace("VODS = douyinList('search', MY_PAGE || 1, KEY || '');", "VODS = rule.__douyinList ? rule.__douyinList('search', MY_PAGE || 1, KEY || '') : [];")
    js = js.replace("header: JSON.stringify(mediaHeaders(url))", "header: JSON.stringify(rule.__mediaHeaders ? rule.__mediaHeaders(url) : {'User-Agent':UA,'Referer':'https://www.douyin.com/'})")

    original_yiji = """    一级: $js.toString(() => {
        var cate = MY_CATE || 'recommend';
        var page = MY_PAGE || 1;
        VODS = douyinList(cate, page, '');
    }),"""
    patched_yiji = """    一级: $js.toString(() => {
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
    }),"""
    js = js.replace(original_yiji, patched_yiji)

    custom_var = 'var CUSTOM_PAGES = ' + json.dumps(pages, ensure_ascii=False, separators=(',', ':')) + ';\n'
    js = re.sub(r'var CUSTOM_PAGES = .*?;\n', '', js)
    js = js.replace('};\n\nfunction getExtObj()', '};\n\n' + custom_var + '\nfunction getExtObj()')
    js = js.replace('function loginStatusVod() {', CUSTOM_JS_HELPERS + '\nfunction loginStatusVod() {')
    js = js.replace('function buildUrl(base, q) {', "\nfunction postJson(url, referer, body) {\n    try {\n        var html = request(url, {method:'POST', body: body || '', headers: dyHeaders(referer || 'https://www.douyin.com/')});\n        if (!html || html.length < 2) return {};\n        return JSON.parse(html);\n    } catch (e) {\n        print('抖音POST失败: ' + e.message + ' url=' + url);\n        return {};\n    }\n}\n" + '\nfunction buildUrl(base, q) {')
    js = js.replace("var url = buildUrl('https://www.douyin.com/aweme/v1/web/tab/feed/', q);", "var url = signedUrl('https://www.douyin.com/aweme/v1/web/tab/feed/', '/aweme/v1/web/tab/feed/', q, '');")
    js = js.replace("var url = buildUrl('https://www.douyin.com/aweme/v2/web/module/feed/', q);", "var url = signedUrl('https://www.douyin.com/aweme/v2/web/module/feed/', '/aweme/v2/web/module/feed/', q, '');")

    featured_new = """function featuredList(cate, page) {
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
    q.awemePcRecRawData = '{\\"is_xigua_user\\":0,\\"danmaku_switch_status\\":0,\\"is_client\\":false}';
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
}"""
    js = re.sub(r'function featuredList\(cate, page\) \{.*?\n\}', featured_new, js, flags=re.S)

    js = js.replace("if (cate === 'login') return [loginStatusVod()];\n    if (!hasLoginCookie()", "if (cate === 'login') return [loginStatusVod()];\n    if (isCustomPage(cate)) return customPageList(cate);\n    if (!hasLoginCookie()")
    js = js.replace("if (id === 'login_required' || id === 'featured_empty' || id === 'cookie_ok') {", "if (id === 'login_required' || id === 'featured_empty' || id === 'cookie_ok' || id === 'custom_empty' || id === 'debug_info') {")
    js = js.replace("if (String(id).indexOf('live$') === 0) {", "if (String(id).indexOf('author@@') === 0) {\n        var a = String(id).split('@@');\n        return authorWorksDetail(a[1] || '', decodeURIComponent(a[2] || '抖音博主'));\n    }\n    if (String(id).indexOf('live$') === 0) {")
    export_code = "\ntry {\n    rule.__douyinList = douyinList;\n    rule.__detailByAwemeId = detailByAwemeId;\n    rule.__mediaHeaders = mediaHeaders;\n    rule.__readCookie = readCookie;\n} catch (e) { print('xiaoman attach failed:' + (e && e.message ? e.message : e)); }\n"
    js = js.rstrip() + export_code + '\n'
    return js


def write_support_files():
    OWN_JS.parent.mkdir(parents=True, exist_ok=True)
    COOKIE_TEMPLATE.parent.mkdir(parents=True, exist_ok=True)
    if ABOGUS_SOURCE.exists():
        shutil.copyfile(ABOGUS_SOURCE, ABOGUS_JS)
    if SOURCE_JS.exists():
        shutil.copyfile(SOURCE_JS, OWN_JS)
    elif not OWN_JS.exists():
        raise FileNotFoundError(f'找不到小满抖音脚本: {SOURCE_JS}')
    js = OWN_JS.read_text(encoding='utf-8-sig')
    OWN_JS.write_text(inject_custom_pages(js, load_custom_pages()), encoding='utf-8')
    if not COOKIE_TEMPLATE.exists():
        COOKIE_TEMPLATE.write_text('# 把抖音 Cookie 粘贴到下一行，只保留一行 Cookie 值，不要写 Cookie: 前缀。\n', encoding='utf-8')


def merge_config(upstream: dict) -> dict:
    merged = absolutize_upstream_paths(upstream)
    sites = merged.get('sites') or []
    def keep_site(s):
        if s.get('key') == OWN_SITE['key']:
            return False
        name = str(s.get('name') or '')
        api = str(s.get('api') or '')
        key = str(s.get('key') or '')
        # 避免 TVBox 保留旧选中源“配置中心”，导致导入后不进入小满抖音。
        if key == '配置中心' or api == 'csp_Config' or name == '配置｜中心':
            return False
        return True
    merged['sites'] = [OWN_SITE] + [s for s in sites if keep_site(s)]
    flags = merged.get('flags') or []
    for flag in ['抖音', 'douyin']:
        if flag not in flags:
            flags.append(flag)
    merged['flags'] = flags
    return merged


def main():
    upstream = fetch_json(UPSTREAM_URL)
    if not isinstance(upstream.get('sites'), list):
        raise ValueError('上游 JSON 不包含 sites 数组，停止生成。')
    write_support_files()
    merged = merge_config(upstream)
    OUT_JSON.write_text(json.dumps(merged, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'已生成: {OUT_JSON}')
    print(f'上游站点: {len(upstream.get("sites", []))}')
    print(f'合并后站点: {len(merged.get("sites", []))}')
    print(f'小满抖音 JS: {OWN_JS}')


if __name__ == '__main__':
    main()
