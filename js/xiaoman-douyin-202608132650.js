// 小满TV - 抖音 TVBox/DRPY 源
// 使用方法：把抖音网页 Cookie 填到 ext.cookie 指向的 douyin_cookie.txt，或直接把 cookie 写进配置 ext.cookie。
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
        cookie: 'http://127.0.0.1:9979/file/TVBox/douyin_cookie.txt'
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

var CUSTOM_PAGES = [{"id":"children","title":"儿童","items":[{"name":"橙长故事","sec_user_id":"MS4wLjABAAAAvTx9f5c2UCXorqy0hJWSi_XJEu3FxaX1neENmX2TnFwQwVuHWsk8HuM1Jvvj5c1c","url":"https://www.douyin.com/user/MS4wLjABAAAAvTx9f5c2UCXorqy0hJWSi_XJEu3FxaX1neENmX2TnFwQwVuHWsk8HuM1Jvvj5c1c","note":""},{"name":"阿禾","sec_user_id":"MS4wLjABAAAAbFwYsV4aI13HsZTUv5ZbniP5jBIz9naISmOYvJ-If3U","url":"https://www.douyin.com/user/MS4wLjABAAAAbFwYsV4aI13HsZTUv5ZbniP5jBIz9naISmOYvJ-If3U","note":""},{"name":"果宝是个小胖子","sec_user_id":"MS4wLjABAAAAa7BSQQSRKhXAfYSaCdkVq_kyir0MFzWSxQpNyiWd_CPy8rvSyfemPb04Oi32clfc","url":"https://www.douyin.com/user/MS4wLjABAAAAa7BSQQSRKhXAfYSaCdkVq_kyir0MFzWSxQpNyiWd_CPy8rvSyfemPb04Oi32clfc","note":"原始分享链接：https://v.douyin.com/QpKiIXMRwkI/"},{"name":"萍萍的旧时光（收徒）","sec_user_id":"MS4wLjABAAAAZFg31NGlc-UdgaCjlR2gNUf3KBIoUeUXj5yed-mB-dUmvZkRuwxHCiDRntC-zgWG","url":"https://www.douyin.com/user/MS4wLjABAAAAZFg31NGlc-UdgaCjlR2gNUf3KBIoUeUXj5yed-mB-dUmvZkRuwxHCiDRntC-zgWG","note":"原始分享链接：https://v.douyin.com/D8G7BphovrU/"},{"name":"小宇和然然","sec_user_id":"MS4wLjABAAAAMqwsthYJMj4KugZpFoaomBfgR8xGenCBmfdLC4Tc3BRFgidvnHt0EqHdQGYpiicO","url":"https://www.douyin.com/user/MS4wLjABAAAAMqwsthYJMj4KugZpFoaomBfgR8xGenCBmfdLC4Tc3BRFgidvnHt0EqHdQGYpiicO","note":"原始分享链接：https://v.douyin.com/zxM-ALvQmSs/"},{"name":"@丹丹的旧时光之旅","sec_user_id":"MS4wLjABAAAA0Jxg0tRzCH_1HlSB76ESJoRgWOxx01r_APOA51ITqBjPvgIPvUdcpCdx0yjXGLIg","url":"https://www.douyin.com/user/MS4wLjABAAAA0Jxg0tRzCH_1HlSB76ESJoRgWOxx01r_APOA51ITqBjPvgIPvUdcpCdx0yjXGLIg","note":"原始分享链接：https://v.douyin.com/ogJlUtBGpFw/"},{"name":"小田（农村治愈系）","sec_user_id":"MS4wLjABAAAAE882mW2KjwrGteaXC9in3XqxG0-oHFWSrqFhaGFPd08","url":"https://www.douyin.com/user/MS4wLjABAAAAE882mW2KjwrGteaXC9in3XqxG0-oHFWSrqFhaGFPd08","note":"原始分享链接：https://v.douyin.com/H055oBgFt0M/"},{"name":"芳芳的旧时光","sec_user_id":"MS4wLjABAAAA9ygxkXJK68AmxO-QGBKYR80mL9BrfzX-zFFuOORCHYyTnyJRhpUHbLFfOER-5Izz","url":"https://www.douyin.com/user/MS4wLjABAAAA9ygxkXJK68AmxO-QGBKYR80mL9BrfzX-zFFuOORCHYyTnyJRhpUHbLFfOER-5Izz","note":"原始分享链接：https://v.douyin.com/yYYEdH26ogM/"},{"name":"金小满（收徒）","sec_user_id":"MS4wLjABAAAAWapUtHrQRNvIl-5j5_yBzb3QiQSGlFolTKD1c_JpIzKD5j-fNME0BnQmzoZeossE","url":"https://www.douyin.com/user/MS4wLjABAAAAWapUtHrQRNvIl-5j5_yBzb3QiQSGlFolTKD1c_JpIzKD5j-fNME0BnQmzoZeossE","note":"原始分享链接：https://v.douyin.com/crfD2f7VSY8/"},{"name":"瑾瑜的白日梦","sec_user_id":"MS4wLjABAAAAArqBKelw-QeNpWinA5GxfC_W52gH3q5N7uAHdNjmGzI","url":"https://www.douyin.com/user/MS4wLjABAAAAArqBKelw-QeNpWinA5GxfC_W52gH3q5N7uAHdNjmGzI","note":"原始分享链接：https://v.douyin.com/OlrciiEoE2o/"}]}];

function getExtObj() {
    try {
        if (typeof rule.ext === 'object') return rule.ext;
        if (typeof rule.ext === 'string' && rule.ext.trim().startsWith('{')) return JSON.parse(rule.ext);
    } catch (e) {}
    return {};
}

function readCookie() {
    var ext = getExtObj();
    var c = ext.cookie || ext.douyin_cookie || '';
    if (!c) return '';
    if (/^https?:\/\//.test(c)) {
        var urls = [c];
        if (c.indexOf('127.0.0.1:9979') >= 0) urls.push(c.replace('127.0.0.1:9979', '127.0.0.1:9978'));
        if (c.indexOf('127.0.0.1:9978') >= 0) urls.push(c.replace('127.0.0.1:9978', '127.0.0.1:9979'));
        for (var i = 0; i < urls.length; i++) {
            try { var got = normalizeCookie(request(urls[i])); if (got) return got; } catch (e) {}
        }
        return '';
    }
    return normalizeCookie(c);
}

function normalizeCookie(raw) {
    raw = decodeMaybeBytes(raw);
    raw = String(raw || '').replace(/^\uFEFF/, '').trim();
    if (!raw) return '';
    var lines = raw.split(/\r?\n/).map(function(s){ return s.trim(); }).filter(function(s){ return s && s.charAt(0) !== '#'; });
    raw = lines.join('; ').replace(/^Cookie\s*:\s*/i, '').trim();
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
    if (/^\s*\d{1,3}(\s*,\s*\d{1,3})+\s*$/.test(text)) {
        return text.split(/\s*,\s*/).map(function(n){ return String.fromCharCode(Number(n) || 0); }).join('');
    }
    if (/^(\d{1,3}\s*){10,}$/.test(text.trim())) {
        return text.trim().split(/\s+/).map(function(n){ return String.fromCharCode(Number(n) || 0); }).join('');
    }
    return text;
}

function hasLoginCookie() {
    var c = readCookie();
    return /sessionid=|sid_tt=|uid_tt=|passport_csrf_token=/.test(c);
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
    return {
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

function buildUrl(base, q) {
    var arr = [];
    Object.keys(q).forEach(function(k){ if (q[k] !== undefined && q[k] !== null) arr.push(encodeURIComponent(k) + '=' + encodeURIComponent(String(q[k]))); });
    return base + (base.indexOf('?') >= 0 ? '&' : '?') + arr.join('&');
}

function douyinList(cate, page, wd) {
    if (cate === 'login') return [loginStatusVod()];
    if (isCustomPage(cate)) return customPageList(cate);
    if (!hasLoginCookie() && cate !== 'recommend' && cate !== 'featured' && cate !== 'film') {
        return [loginHintVod()];
    }
    if (cate === 'search') return searchList(wd, page);
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
    var q = commonQuery();
    q.sec_user_id = secUserId;
    q.max_cursor = '0';
    q.count = '30';
    var url = buildUrl('https://www.douyin.com/aweme/v1/web/aweme/post/', q);
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
    var ok = hasLoginCookie();
    return {
        vod_id: ok ? 'cookie_ok' : 'login_required',
        vod_name: ok ? '抖音 Cookie 已登录' : '需要先登录抖音 Cookie',
        vod_pic: 'https://lf1-cdn-tos.bytegoofy.com/goofy/ies/douyin_web/public/favicon.ico',
        vod_remarks: ok ? '可使用完整抖音功能' : '未检测到有效 Cookie',
        vod_content: ok ? '已从 /sdcard/TVBox/douyin_cookie.txt 检测到抖音 Cookie。' : '配置方法：在电脑浏览器登录 douyin.com，复制 Request Headers 里的 Cookie 值，放到电视/模拟器 /sdcard/TVBox/douyin_cookie.txt，只保留一行，不带 Cookie: 前缀，然后重启 TVBox 或重载配置。'
    };
}
function loginHintVod() {
    return {
        vod_id: 'login_required',
        vod_name: '需要先登录抖音 Cookie',
        vod_pic: 'https://lf1-cdn-tos.bytegoofy.com/goofy/ies/douyin_web/public/favicon.ico',
        vod_remarks: '把 Cookie 填到 douyin_cookie.txt',
        vod_content: '配置方法：在电脑浏览器登录 douyin.com，复制 Request Headers 里的 Cookie 值，放到电视/模拟器 /sdcard/TVBox/douyin_cookie.txt，只保留一行，不带 Cookie: 前缀，然后重启 TVBox 或重载配置。'
    };
}

function recommendList(page) {
    var q = commonQuery();
    q.refresh_index = String(page || 1);
    q.count = '18';
    var url = buildUrl('https://www.douyin.com/aweme/v1/web/tab/feed/', q);
    var json = getJson(url, 'https://www.douyin.com/?recommend=1');
    return parseAwemeList(json);
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
    q.module_id = tagId;
    q.tag_id = tagId;
    q.page = String(page || 1);
    q.count = '18';
    var url = buildUrl('https://www.douyin.com/aweme/v2/web/module/feed/', q);
    var json = getJson(url, 'https://www.douyin.com' + path);
    var list = parseAwemeList(json);
    if (list.length) return list;
    // 兜底：无签名壳无法打开 v2 module 时，至少返回页面提示，避免空白。
    return [{vod_id:'featured_empty', vod_name:'精选分类需要有效 Cookie/签名环境', vod_pic:'', vod_remarks:'请填 Cookie 后重试'}];
}

function searchList(wd, page) {
    if (!wd) return [];
    var q = commonQuery();
    q.keyword = wd;
    q.search_channel = 'aweme_video_web';
    q.offset = String(((page || 1) - 1) * 18);
    q.count = '18';
    var url = buildUrl('https://www.douyin.com/aweme/v1/web/search/item/', q);
    var json = getJson(url, 'https://www.douyin.com/search/' + encodeURIComponent(wd));
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
        return {vod_id:id, vod_name: ok ? '抖音 Cookie 已登录' : '抖音 Cookie 登录说明', vod_play_from:'说明', vod_play_url:(ok ? '已登录，可返回分类使用$' : '请先填写 Cookie$') + 'https://www.douyin.com/'};
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

