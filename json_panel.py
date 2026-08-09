#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Local visual JSON manager for ikun remote config."""
from __future__ import annotations

import json
import os
import re
import subprocess
import sys
import urllib.error
import urllib.parse
import urllib.request
import webbrowser
from datetime import datetime, timezone, timedelta
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PORT = int(os.environ.get("IKUN_JSON_PANEL_PORT", "8787"))
TZ = timezone(timedelta(hours=8))
SHORT_RE = re.compile(r"https?://v\.douyin\.com/[A-Za-z0-9_-]+/?", re.I)
USER_RE = re.compile(r"https?://(?:www\.)?douyin\.com/user/([^/?#\s]+)", re.I)
SEC_RE = re.compile(r"MS4wLjAB[0-9A-Za-z_.-]+")


def now_text() -> str:
    return datetime.now(TZ).replace(microsecond=0).isoformat()


def json_files() -> list[str]:
    out: list[str] = []
    for path in sorted(ROOT.glob("*.json")):
        if path.name == "manifest.json":
            continue
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except Exception:
            continue
        if isinstance(data, dict):
            out.append(path.name)
    return out


def safe_file(name: str) -> Path:
    name = Path(name or "custom_blogger_config.json").name
    if not name.endswith(".json") or name == "manifest.json":
        raise ValueError("只能维护配置 JSON，不能直接修改 manifest.json")
    path = ROOT / name
    if not path.exists():
        raise ValueError(f"文件不存在：{name}")
    return path


def read_config(name: str) -> dict:
    path = safe_file(name)
    data = json.loads(path.read_text(encoding="utf-8"))
    data.setdefault("version", 1)
    data.setdefault("mode", "custom")
    data.setdefault("source", "gitee_remote")
    data.setdefault("activePageId", "children")
    data.setdefault("pages", [])
    for page in data["pages"]:
        page.setdefault("id", page.get("name") or page.get("title") or "page")
        page.setdefault("title", page.get("name") or page["id"])
        page.setdefault("name", page.get("title") or page["id"])
        page.setdefault("enabled", True)
        page.setdefault("items", [])
        page["count"] = len(page["items"])
    return data


def write_json(path: Path, data: dict) -> None:
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")


def bump_manifest(message: str) -> None:
    path = ROOT / "manifest.json"
    if not path.exists():
        return
    data = json.loads(path.read_text(encoding="utf-8"))
    data["version"] = int(data.get("version") or 0) + 1
    data["updatedAt"] = now_text()
    data["message"] = message
    write_json(path, data)


def save_config(name: str, data: dict, message: str) -> None:
    for page in data.get("pages", []):
        page["count"] = len(page.get("items", []))
    data["version"] = int(data.get("version") or 0) + 1
    data["updatedAt"] = now_text()
    write_json(safe_file(name), data)
    bump_manifest(message)


def normalize_page_id(text: str) -> str:
    text = (text or "").strip() or "page"
    slug = re.sub(r"[^\w-]+", "-", text, flags=re.U).strip("-")
    return slug or "page"


def extract_douyin_url(text: str) -> str:
    text = text or ""
    m = SHORT_RE.search(text) or USER_RE.search(text)
    if not m:
        raise ValueError("没有识别到抖音链接")
    return m.group(0)


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def request_url(url: str, *, redirect: bool = True, limit: int | None = None) -> tuple[str, bytes, dict]:
    opener = urllib.request.build_opener() if redirect else urllib.request.build_opener(NoRedirect)
    req = urllib.request.Request(url, headers={
        "User-Agent": "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 aweme/28.0.0",
        "Referer": "https://www.douyin.com/",
        "Accept": "application/json,text/plain,*/*",
    })
    try:
        with opener.open(req, timeout=18) as resp:
            return resp.geturl(), resp.read(limit), dict(resp.headers)
    except urllib.error.HTTPError as exc:
        if exc.code in (301, 302, 303, 307, 308):
            return exc.headers.get("Location") or url, b"", dict(exc.headers)
        raise


def resolve_douyin(text: str) -> dict:
    source_url = extract_douyin_url(text)
    final_url = source_url
    if SHORT_RE.match(source_url):
        final_url, _, _ = request_url(source_url, redirect=False)
    parsed = urllib.parse.urlparse(final_url)
    q = urllib.parse.parse_qs(parsed.query)
    sec = (q.get("sec_uid") or q.get("sec_user_id") or [None])[0]
    if not sec:
        m = SEC_RE.search(final_url)
        sec = m.group(0) if m else None
    if not sec:
        raise ValueError("链接已识别，但没有解析到 sec_user_id")

    nickname = ""
    info_url = "https://www.iesdouyin.com/web/api/v2/user/info/?sec_uid=" + urllib.parse.quote(sec)
    try:
        _, body, _ = request_url(info_url, redirect=True)
        payload = json.loads(body.decode("utf-8"))
        nickname = (payload.get("user_info") or {}).get("nickname") or ""
    except Exception:
        nickname = ""
    if not nickname:
        code = source_url.rstrip("/").rsplit("/", 1)[-1]
        nickname = f"抖音博主-{code}"

    return {
        "name": nickname,
        "url": f"https://www.douyin.com/user/{sec}",
        "sec_user_id": sec,
        "source": "gitee_remote",
        "status": "待检测",
        "status_level": "pending",
        "valid": True,
        "note": f"原始分享链接：{source_url}",
    }


def create_file(name: str, page_name: str) -> str:
    name = Path(name.strip()).name
    if not name.endswith(".json"):
        name += ".json"
    if name == "manifest.json":
        raise ValueError("不能创建 manifest.json")
    path = ROOT / name
    if path.exists():
        raise ValueError("文件已存在")
    page_name = (page_name or "儿童").strip()
    page_id = normalize_page_id(page_name)
    data = {
        "version": 1,
        "mode": "custom",
        "source": "gitee_remote",
        "updatedAt": now_text(),
        "activePageId": page_id,
        "pages": [{"id": page_id, "title": page_name, "name": page_name, "enabled": True, "items": [], "count": 0}],
    }
    write_json(path, data)
    return name


def run_git(args: list[str]) -> str:
    p = subprocess.run(args, cwd=ROOT, text=True, encoding="utf-8", errors="replace", capture_output=True)
    out = (p.stdout or "") + (p.stderr or "")
    if p.returncode != 0:
        raise RuntimeError(out.strip() or f"命令失败：{' '.join(args)}")
    return out.strip()


def push_all(message: str) -> str:
    for path in ROOT.glob("*.json"):
        json.loads(path.read_text(encoding="utf-8"))
    run_git(["git", "add", ".gitignore", ".gitattributes", "README.md", "push-json.ps1", "start-json-panel.ps1", "json_panel.py"])
    for path in ROOT.glob("*.json"):
        run_git(["git", "add", path.name])
    diff = subprocess.run(["git", "diff", "--cached", "--quiet"], cwd=ROOT)
    committed = "没有新的文件变化，直接推送。"
    if diff.returncode != 0:
        committed = run_git(["git", "commit", "-m", message or "update json config"])
    pushed = run_git(["git", "push", "-u", "origin", "master"])
    return committed + "\n" + pushed


INDEX_HTML = r'''
<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>ikun JSON 可视化维护面板</title>
<style>
body{margin:0;background:#f5f7fb;color:#172033;font-family:"Microsoft YaHei",Arial,sans-serif}.wrap{max-width:1280px;margin:0 auto;padding:22px}h1{margin:0 0 14px;font-size:24px}.bar,.card{background:#fff;border:1px solid #e7eaf0;border-radius:14px;box-shadow:0 6px 20px rgba(20,30,55,.06)}.bar{display:flex;gap:10px;align-items:center;padding:12px;flex-wrap:wrap}.grid{display:grid;grid-template-columns:360px 1fr;gap:14px;margin-top:14px}.card{padding:14px}label{font-size:13px;color:#647086}select,input,textarea{box-sizing:border-box;width:100%;border:1px solid #d7dce5;border-radius:10px;padding:10px;font-size:14px;background:#fff}textarea{height:118px;resize:vertical}.row{display:flex;gap:8px;align-items:center}.row>*{flex:1}.btn{border:0;border-radius:10px;padding:10px 14px;background:#2563eb;color:#fff;font-weight:700;cursor:pointer}.btn.gray{background:#687386}.btn.red{background:#dc2626}.btn.green{background:#16a34a}.btn:disabled{opacity:.55;cursor:not-allowed}.muted{color:#7b8496;font-size:12px}.status{white-space:pre-wrap;background:#0f172a;color:#dbeafe;border-radius:10px;padding:10px;min-height:42px;font-size:12px;max-height:180px;overflow:auto}.pages{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0}.pill{border:1px solid #d7dce5;border-radius:999px;padding:8px 12px;background:#fff;cursor:pointer}.pill.on{background:#111827;color:white;border-color:#111827}table{width:100%;border-collapse:collapse;background:#fff}th,td{border-bottom:1px solid #edf0f5;padding:10px;text-align:left;font-size:13px;vertical-align:top}th{color:#687386;background:#fafbfe}.url{max-width:440px;word-break:break-all}.actions{display:flex;gap:6px}.actions .btn{padding:7px 9px;font-size:12px}.titleline{display:flex;justify-content:space-between;gap:8px;align-items:center;margin-bottom:10px}.small{font-size:12px;padding:8px 10px}@media(max-width:900px){.grid{grid-template-columns:1fr}.wrap{padding:12px}}
</style></head><body><div class="wrap">
<h1>ikun JSON 可视化维护面板</h1>
<div class="bar"><div style="min-width:240px"><label>配置文件</label><select id="file"></select></div><button class="btn gray" onclick="reload()">刷新</button><button class="btn" onclick="newFile()">新建 JSON</button><button class="btn green" onclick="pushRepo()">上传到 Gitee</button><span id="meta" class="muted"></span></div>
<div class="grid"><div class="card">
<div class="titleline"><h3>添加抖音博主</h3></div>
<label>粘贴分享文本</label><textarea id="share" placeholder="3- 长按复制此条消息... https://v.douyin.com/xxxx/ 5@7.com :4pm"></textarea>
<div class="row" style="margin-top:8px"><button class="btn" onclick="resolveShare()">解析链接</button><button class="btn green" onclick="addItem()">添加到当前页</button></div>
<div style="height:10px"></div><label>名称</label><input id="name"><label>主页 URL</label><input id="url"><input id="sec" type="hidden"><label>备注</label><input id="note">
<div style="height:14px"></div><div class="titleline"><h3>页面管理</h3><button class="btn small" onclick="addPage()">添加页面</button></div><div id="pages" class="pages"></div>
<div class="row"><button class="btn gray" onclick="renamePage()">改名</button><button class="btn red" onclick="deletePage()">删除当前页</button></div>
<div style="height:14px"></div><label>操作日志</label><div id="log" class="status">准备就绪</div>
</div><div class="card"><div class="titleline"><h3 id="listTitle">博主列表</h3><span id="count" class="muted"></span></div><table><thead><tr><th style="width:52px">序号</th><th style="width:190px">名称</th><th>主页</th><th style="width:96px">状态</th><th style="width:150px">操作</th></tr></thead><tbody id="tbody"></tbody></table></div></div>
</div><script>
let state={files:[],file:'custom_blogger_config.json',config:null,pageId:''};
const $=id=>document.getElementById(id);function log(x){$('log').textContent=typeof x==='string'?x:JSON.stringify(x,null,2)}
async function api(path,body){let opt=body?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{};let r=await fetch(path,opt);let j=await r.json();if(!j.ok)throw new Error(j.error||'操作失败');return j}
async function loadFiles(){let j=await api('/api/files');state.files=j.files;if(!state.files.includes(state.file))state.file=state.files[0]||'';$('file').innerHTML=state.files.map(f=>`<option ${f===state.file?'selected':''}>${f}</option>`).join('');$('file').onchange=()=>{state.file=$('file').value;state.pageId='';loadConfig()}}
async function loadConfig(){if(!state.file)return;let j=await api('/api/config?file='+encodeURIComponent(state.file));state.config=j.config;state.pageId=state.pageId||state.config.activePageId||(state.config.pages[0]&&state.config.pages[0].id);render()}
function page(){return (state.config.pages||[]).find(p=>p.id===state.pageId)||state.config.pages[0]}
function render(){let c=state.config,p=page();$('meta').textContent=`version ${c.version||''}  ${c.updatedAt||''}`;$('pages').innerHTML=(c.pages||[]).map(p=>`<button class="pill ${p.id===state.pageId?'on':''}" onclick="state.pageId='${p.id}';render()">${p.name||p.title||p.id} (${(p.items||[]).length})</button>`).join('');$('listTitle').textContent=(p?p.name:'')+' 博主列表';$('count').textContent=p?`共 ${(p.items||[]).length} 个`:'';$('tbody').innerHTML=p?(p.items||[]).map((it,i)=>`<tr><td>${i+1}</td><td>${it.name||''}</td><td class="url">${it.url||''}<div class="muted">${it.note||''}</div></td><td>${it.status||''}</td><td class="actions"><button class="btn gray" onclick="editItem(${i})">编辑</button><button class="btn red" onclick="delItem(${i})">删除</button></td></tr>`).join(''):''}
async function reload(){await loadFiles();await loadConfig();log('已刷新')}
async function resolveShare(){try{log('正在解析抖音链接...');let j=await api('/api/resolve',{text:$('share').value});$('name').value=j.item.name;$('url').value=j.item.url;$('sec').value=j.item.sec_user_id||'';$('note').value=j.item.note||'';log('解析成功：'+j.item.name)}catch(e){log(e.message)}}
async function addItem(){try{let p=page();let item={name:$('name').value.trim(),url:$('url').value.trim(),sec_user_id:$('sec').value.trim(),source:'gitee_remote',status:'待检测',status_level:'pending',valid:true,note:$('note').value.trim()};let j=await api('/api/item/add',{file:state.file,pageId:p.id,item});state.config=j.config;log(j.message);render()}catch(e){log(e.message)}}
async function editItem(i){let p=page(),it=p.items[i];let name=prompt('名称',it.name||'');if(name===null)return;let url=prompt('主页 URL',it.url||'');if(url===null)return;it.name=name.trim();it.url=url.trim();let j=await api('/api/item/update',{file:state.file,pageId:p.id,index:i,item:it});state.config=j.config;log('已保存');render()}
async function delItem(i){let p=page(),it=p.items[i];if(!confirm('删除：'+(it.name||it.url)+'？'))return;let j=await api('/api/item/delete',{file:state.file,pageId:p.id,index:i});state.config=j.config;log('已删除');render()}
async function addPage(){let name=prompt('页面名称，例如 儿童');if(!name)return;let j=await api('/api/page/add',{file:state.file,name});state.config=j.config;state.pageId=j.pageId;log('已添加页面');render()}
async function renamePage(){let p=page();if(!p)return;let name=prompt('新页面名称',p.name||p.title||p.id);if(!name)return;let j=await api('/api/page/update',{file:state.file,pageId:p.id,name});state.config=j.config;log('已改名');render()}
async function deletePage(){let p=page();if(!p)return;if(!confirm('删除页面 '+(p.name||p.id)+' 及里面所有博主？'))return;let j=await api('/api/page/delete',{file:state.file,pageId:p.id});state.config=j.config;state.pageId=state.config.activePageId;log('已删除页面');render()}
async function newFile(){let name=prompt('新 JSON 文件名，例如 custom_children_config.json');if(!name)return;let pageName=prompt('默认页面名称','儿童')||'儿童';let j=await api('/api/file/create',{name,pageName});state.file=j.file;await reload();log('已创建 '+j.file)}
async function pushRepo(){try{let msg=prompt('提交说明','update json config');if(msg===null)return;log('正在提交并推送到 Gitee...');let j=await api('/api/push',{message:msg});log(j.output)}catch(e){log(e.message)}}
reload();
</script></body></html>
'''


class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        return

    def send_json(self, data: dict, status: int = 200) -> None:
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def read_body(self) -> dict:
        size = int(self.headers.get("Content-Length") or 0)
        if not size:
            return {}
        return json.loads(self.rfile.read(size).decode("utf-8"))

    def handle_api(self):
        parsed = urllib.parse.urlparse(self.path)
        qs = urllib.parse.parse_qs(parsed.query)
        body = self.read_body() if self.command == "POST" else {}
        try:
            if parsed.path == "/api/files":
                return self.send_json({"ok": True, "files": json_files()})
            if parsed.path == "/api/config":
                file = (qs.get("file") or ["custom_blogger_config.json"])[0]
                return self.send_json({"ok": True, "config": read_config(file)})
            if parsed.path == "/api/resolve":
                return self.send_json({"ok": True, "item": resolve_douyin(body.get("text", ""))})
            if parsed.path == "/api/file/create":
                return self.send_json({"ok": True, "file": create_file(body.get("name", ""), body.get("pageName", ""))})

            file = body.get("file") or (qs.get("file") or ["custom_blogger_config.json"])[0]
            data = read_config(file)
            pages = data.setdefault("pages", [])
            page_id = body.get("pageId")
            page = next((p for p in pages if p.get("id") == page_id), None)

            if parsed.path == "/api/page/add":
                name = (body.get("name") or "新页面").strip()
                base = normalize_page_id(name)
                pid = base
                n = 2
                while any(p.get("id") == pid for p in pages):
                    pid = f"{base}-{n}"
                    n += 1
                pages.append({"id": pid, "title": name, "name": name, "enabled": True, "items": [], "count": 0})
                data["activePageId"] = pid
                save_config(file, data, "远程配置已更新，添加自定义页面")
                return self.send_json({"ok": True, "config": data, "pageId": pid})
            if not page:
                raise ValueError("页面不存在")
            if parsed.path == "/api/page/update":
                name = (body.get("name") or page.get("name") or "").strip()
                page["name"] = page["title"] = name
                save_config(file, data, "远程配置已更新，修改自定义页面")
                return self.send_json({"ok": True, "config": data})
            if parsed.path == "/api/page/delete":
                if len(pages) <= 1:
                    raise ValueError("至少保留一个页面")
                data["pages"] = [p for p in pages if p.get("id") != page_id]
                data["activePageId"] = data["pages"][0]["id"]
                save_config(file, data, "远程配置已更新，删除自定义页面")
                return self.send_json({"ok": True, "config": data})
            items = page.setdefault("items", [])
            if parsed.path == "/api/item/add":
                item = body.get("item") or {}
                m = SEC_RE.search(item.get("url", "") or "")
                sec = item.get("sec_user_id") or (m.group(0) if m else None)
                if not item.get("name") or not item.get("url"):
                    raise ValueError("名称和 URL 不能为空")
                for old in items:
                    if item.get("url") == old.get("url") or (sec and sec == old.get("sec_user_id")):
                        return self.send_json({"ok": True, "config": data, "message": "已存在，未重复添加：" + (old.get("name") or old.get("url", ""))})
                if sec:
                    item["sec_user_id"] = sec
                items.append(item)
                save_config(file, data, "远程配置已更新，新增博主")
                return self.send_json({"ok": True, "config": data, "message": "已添加：" + item.get("name", "")})
            index = int(body.get("index", -1))
            if index < 0 or index >= len(items):
                raise ValueError("序号不存在")
            if parsed.path == "/api/item/update":
                items[index] = body.get("item") or items[index]
                save_config(file, data, "远程配置已更新，修改博主")
                return self.send_json({"ok": True, "config": data})
            if parsed.path == "/api/item/delete":
                items.pop(index)
                save_config(file, data, "远程配置已更新，删除博主")
                return self.send_json({"ok": True, "config": data})
            if parsed.path == "/api/push":
                return self.send_json({"ok": True, "output": push_all(body.get("message") or "update json config")})
            raise ValueError("未知接口")
        except Exception as exc:
            self.send_json({"ok": False, "error": str(exc)}, 400)

    def do_GET(self):
        if self.path.startswith("/api/"):
            return self.handle_api()
        body = INDEX_HTML.encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        if self.path.startswith("/api/"):
            return self.handle_api()
        self.send_error(404)


def main() -> None:
    server = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    url = f"http://127.0.0.1:{PORT}/"
    print(f"ikun JSON 面板已启动：{url}")
    print("按 Ctrl+C 关闭")
    if "--no-browser" not in sys.argv:
        webbrowser.open(url)
    server.serve_forever()


if __name__ == "__main__":
    main()
