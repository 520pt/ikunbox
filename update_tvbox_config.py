import json
import pathlib
import re
import shutil
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parent
SOURCE_JS = pathlib.Path(r'F:\newwork\myDV-artifacts\ikun\tmp\tvbox-douyin\js\小满抖音.js')
UPSTREAM_URL = 'https://v6.gh-proxy.org/https://raw.githubusercontent.com/qist/tvbox/master/jsm.json'
UPSTREAM_BASE = 'https://v6.gh-proxy.org/https://raw.githubusercontent.com/qist/tvbox/master/'
OWN_BASE = 'https://raw.githubusercontent.com/520pt/ikunbox/main/'
OUT_JSON = ROOT / 'jsm.json'
OWN_JS = ROOT / 'js' / 'xiaoman-douyin.js'
COOKIE_TEMPLATE = ROOT / 'TVBox' / 'douyin_cookie.txt'
CUSTOM_CONFIG = ROOT / 'custom_blogger_config.json'

OWN_SITE = {
    'key': 'xiaoman_douyin',
    'name': '小满｜抖音[Cookie/博主]',
    'type': 3,
    'api': UPSTREAM_BASE + 'lib/drpy2.min.js',
    'ext': OWN_BASE + 'js/xiaoman-douyin.js',
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
    js = js.replace("    一级: $js.toString(() => {\n        var cate = MY_CATE || 'recommend';\n        var page = MY_PAGE || 1;\n        VODS = douyinList(cate, page, '');\n    }),", "    一级: $js.toString(() => {\n        var cate = MY_CATE || 'recommend';\n        var page = MY_PAGE || 1;\n        try {\n            print('xiaoman 一级 cate=' + cate + ' page=' + page);\n            VODS = douyinList(cate, page, '');\n            print('xiaoman 一级 count=' + (VODS && VODS.length ? VODS.length : 0));\n        } catch (e) {\n            print('xiaoman 一级 error=' + (e && e.message ? e.message : e));\n            VODS = [debugVod('分类加载失败', String(cate), String(e && e.message ? e.message : e))];\n        }\n    }),")
    custom_var = 'var CUSTOM_PAGES = ' + json.dumps(pages, ensure_ascii=False, separators=(',', ':')) + ';\n'
    js = re.sub(r'var CUSTOM_PAGES = .*?;\n', '', js)
    js = js.replace('};\n\nfunction getExtObj()', '};\n\n' + custom_var + '\nfunction getExtObj()')
    js = js.replace('function loginStatusVod() {', CUSTOM_JS_HELPERS + '\nfunction loginStatusVod() {')
    js = js.replace("if (cate === 'login') return [loginStatusVod()];\n    if (!hasLoginCookie()", "if (cate === 'login') return [loginStatusVod()];\n    if (isCustomPage(cate)) return customPageList(cate);\n    if (!hasLoginCookie()")
    js = js.replace("if (id === 'login_required' || id === 'featured_empty' || id === 'cookie_ok') {", "if (id === 'login_required' || id === 'featured_empty' || id === 'cookie_ok' || id === 'custom_empty') {")
    js = js.replace("if (String(id).indexOf('live$') === 0) {", "if (String(id).indexOf('author@@') === 0) {\n        var a = String(id).split('@@');\n        return authorWorksDetail(a[1] || '', decodeURIComponent(a[2] || '抖音博主'));\n    }\n    if (String(id).indexOf('live$') === 0) {")
    return js


def write_support_files():
    OWN_JS.parent.mkdir(parents=True, exist_ok=True)
    COOKIE_TEMPLATE.parent.mkdir(parents=True, exist_ok=True)
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
    merged['sites'] = [OWN_SITE] + [s for s in sites if s.get('key') != OWN_SITE['key']]
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
