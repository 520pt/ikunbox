import json
import pathlib
import shutil
import urllib.request

ROOT = pathlib.Path(r'F:\newwork\myDV-artifacts\ikun-json-config')
SOURCE_JS = pathlib.Path(r'F:\newwork\myDV-artifacts\ikun\tmp\tvbox-douyin\js\小满抖音.js')
UPSTREAM_URL = 'https://v6.gh-proxy.org/https://raw.githubusercontent.com/qist/tvbox/master/jsm.json'
UPSTREAM_BASE = 'https://v6.gh-proxy.org/https://raw.githubusercontent.com/qist/tvbox/master/'
OWN_BASE = 'https://raw.githubusercontent.com/520pt/lufeitv-tvbox/master/'
OUT_JSON = ROOT / 'jsm.json'
OWN_JS = ROOT / 'js' / 'xiaoman-douyin.js'
COOKIE_TEMPLATE = ROOT / 'TVBox' / 'douyin_cookie.txt'

OWN_SITE = {
    'key': 'xiaoman_douyin',
    'name': '小满｜抖音[Cookie]',
    'type': 3,
    'api': UPSTREAM_BASE + 'lib/drpy2.min.js',
    'ext': OWN_BASE + 'js/xiaoman-douyin.js',
    'searchable': 1,
    'quickSearch': 1,
    'filterable': 0,
    'changeable': 1,
    'style': {'type': 'rect', 'ratio': 1.597},
    'header': {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36'
    }
}


def fetch_json(url: str) -> dict:
    req = urllib.request.Request(url, headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    })
    with urllib.request.urlopen(req, timeout=30) as resp:
        raw = resp.read()
    return json.loads(raw.decode('utf-8-sig'))


def absolutize_upstream_paths(value):
    if isinstance(value, dict):
        return {k: absolutize_upstream_paths(v) for k, v in value.items()}
    if isinstance(value, list):
        return [absolutize_upstream_paths(v) for v in value]
    if isinstance(value, str) and value.startswith('./'):
        return UPSTREAM_BASE + value[2:]
    return value


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


def write_support_files():
    OWN_JS.parent.mkdir(parents=True, exist_ok=True)
    COOKIE_TEMPLATE.parent.mkdir(parents=True, exist_ok=True)
    if SOURCE_JS.exists():
        shutil.copyfile(SOURCE_JS, OWN_JS)
    elif not OWN_JS.exists():
        raise FileNotFoundError(f'找不到小满抖音脚本: {SOURCE_JS}')
    if not COOKIE_TEMPLATE.exists():
        COOKIE_TEMPLATE.write_text(
            '# 把抖音 Cookie 粘贴到下一行，只保留一行 Cookie 值，不要写 Cookie: 前缀。\n'
            '# 示例格式：sessionid=xxx; sid_tt=xxx; passport_csrf_token=xxx; ...\n'
            '# 不要把真实 Cookie 上传、分享或打包到公开源里。\n\n',
            encoding='utf-8'
        )


def main():
    upstream = fetch_json(UPSTREAM_URL)
    if not isinstance(upstream.get('sites'), list):
        raise ValueError('上游 JSON 不包含 sites 数组，停止生成，避免输出坏配置。')
    merged = merge_config(upstream)
    write_support_files()
    OUT_JSON.write_text(json.dumps(merged, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'已生成: {OUT_JSON}')
    print(f'上游站点: {len(upstream.get("sites", []))}')
    print(f'合并后站点: {len(merged.get("sites", []))}')
    print(f'小满抖音 JS: {OWN_JS}')


if __name__ == '__main__':
    main()
