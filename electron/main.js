const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const { execFile } = require('child_process');

const SHORT_RE = /https?:\/\/v\.douyin\.com\/[A-Za-z0-9_-]+\/?/i;
const USER_RE = /https?:\/\/(?:www\.)?douyin\.com\/user\/([^/?#\s]+)/i;
const SEC_RE = /MS4wLjAB[0-9A-Za-z_.-]+/;
let repoRoot = findDefaultRepo();

function findDefaultRepo() {
  const candidates = [
    process.cwd(),
    app.isPackaged ? path.dirname(process.execPath) : null,
    path.resolve(__dirname, '..'),
    'F:\\newwork\\myDV-artifacts\\ikun-json-config',
  ].filter(Boolean);
  for (const dir of candidates) {
    if (isRepo(dir)) return dir;
  }
  return candidates[0];
}

function isRepo(dir) {
  try {
    return fs.existsSync(path.join(dir, 'manifest.json')) && fs.existsSync(path.join(dir, '.git'));
  } catch {
    return false;
  }
}

function ensureRepo() {
  if (!isRepo(repoRoot)) throw new Error(`当前目录不是配置仓库：${repoRoot}`);
}

function nowText() {
  const d = new Date(Date.now() + 8 * 3600 * 1000);
  return d.toISOString().replace('Z', '+08:00');
}

function safeFile(name) {
  const file = path.basename(name || 'custom_blogger_config.json');
  if (!file.endsWith('.json') || file === 'manifest.json') throw new Error('只能维护配置 JSON，不能直接修改 manifest.json');
  const full = path.join(repoRoot, file);
  if (!fs.existsSync(full)) throw new Error(`文件不存在：${file}`);
  return full;
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function listJsonFiles() {
  ensureRepo();
  return fs.readdirSync(repoRoot)
    .filter((name) => name.endsWith('.json') && name !== 'manifest.json')
    .filter((name) => {
      try { return typeof readJson(path.join(repoRoot, name)) === 'object'; } catch { return false; }
    })
    .sort();
}

function normalizeConfig(data) {
  data.version ??= 1;
  data.mode ??= 'custom';
  data.source ??= 'gitee_remote';
  data.activePageId ??= 'children';
  data.pages ??= [];
  for (const page of data.pages) {
    page.id ??= page.name || page.title || 'page';
    page.title ??= page.name || page.id;
    page.name ??= page.title || page.id;
    page.enabled ??= true;
    page.items ??= [];
    page.count = page.items.length;
  }
  return data;
}

function loadConfig(fileName) {
  return normalizeConfig(readJson(safeFile(fileName)));
}

function bumpManifest(message) {
  const file = path.join(repoRoot, 'manifest.json');
  if (!fs.existsSync(file)) return;
  const data = readJson(file);
  data.version = Number(data.version || 0) + 1;
  data.updatedAt = nowText();
  data.message = message;
  writeJson(file, data);
}

function saveConfig(fileName, data, message) {
  for (const page of data.pages || []) page.count = (page.items || []).length;
  data.version = Number(data.version || 0) + 1;
  data.updatedAt = nowText();
  writeJson(safeFile(fileName), data);
  bumpManifest(message);
  return data;
}

function slug(text) {
  return (text || 'page').trim().replace(/[^\p{L}\p{N}_-]+/gu, '-').replace(/^-+|-+$/g, '') || 'page';
}

function extractDouyinUrl(text) {
  const m = String(text || '').match(SHORT_RE) || String(text || '').match(USER_RE);
  if (!m) throw new Error('没有识别到抖音链接');
  return m[0];
}

function request(url, { follow = true, depth = 0 } = {}) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https:') ? https : http;
    const req = lib.request(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 aweme/28.0.0',
        'Referer': 'https://www.douyin.com/',
        'Accept': 'application/json,text/plain,*/*',
      },
    }, (res) => {
      const location = res.headers.location ? new URL(res.headers.location, url).toString() : '';
      if ([301, 302, 303, 307, 308].includes(res.statusCode) && location) {
        res.resume();
        if (!follow) return resolve({ url: location, body: '', headers: res.headers });
        if (depth > 6) return reject(new Error('重定向次数过多'));
        return resolve(request(location, { follow, depth: depth + 1 }));
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve({ url, body: Buffer.concat(chunks).toString('utf8'), headers: res.headers }));
    });
    req.setTimeout(18000, () => req.destroy(new Error('请求超时')));
    req.on('error', reject);
    req.end();
  });
}

async function resolveDouyin(text) {
  const sourceUrl = extractDouyinUrl(text);
  let finalUrl = sourceUrl;
  if (SHORT_RE.test(sourceUrl)) {
    finalUrl = (await request(sourceUrl, { follow: false })).url;
  }
  const u = new URL(finalUrl);
  let sec = u.searchParams.get('sec_uid') || u.searchParams.get('sec_user_id') || (finalUrl.match(SEC_RE) || [])[0];
  if (!sec) throw new Error('链接已识别，但没有解析到 sec_user_id');

  let nickname = '';
  try {
    const infoUrl = `https://www.iesdouyin.com/web/api/v2/user/info/?sec_uid=${encodeURIComponent(sec)}`;
    const payload = JSON.parse((await request(infoUrl)).body);
    nickname = payload.user_info?.nickname || '';
  } catch {
    nickname = '';
  }
  if (!nickname) nickname = `抖音博主-${sourceUrl.replace(/\/$/, '').split('/').pop()}`;
  return {
    name: nickname,
    url: `https://www.douyin.com/user/${sec}`,
    sec_user_id: sec,
    source: 'gitee_remote',
    status: '待检测',
    status_level: 'pending',
    valid: true,
    note: `原始分享链接：${sourceUrl}`,
  };
}

function createFile(name, pageName) {
  let file = path.basename(String(name || '').trim());
  if (!file.endsWith('.json')) file += '.json';
  if (file === 'manifest.json') throw new Error('不能创建 manifest.json');
  const full = path.join(repoRoot, file);
  if (fs.existsSync(full)) throw new Error('文件已存在');
  const title = String(pageName || '儿童').trim();
  const pageId = slug(title);
  writeJson(full, {
    version: 1,
    mode: 'custom',
    source: 'gitee_remote',
    updatedAt: nowText(),
    activePageId: pageId,
    pages: [{ id: pageId, title, name: title, enabled: true, items: [], count: 0 }],
  });
  return file;
}

function git(args) {
  return new Promise((resolve, reject) => {
    execFile('git', args, { cwd: repoRoot, encoding: 'utf8', windowsHide: true }, (err, stdout, stderr) => {
      const out = `${stdout || ''}${stderr || ''}`.trim();
      if (err) reject(new Error(out || err.message));
      else resolve(out);
    });
  });
}

async function hasCachedDiff() {
  return new Promise((resolve) => {
    execFile('git', ['diff', '--cached', '--quiet'], { cwd: repoRoot, windowsHide: true }, (err) => resolve(Boolean(err)));
  });
}

async function pushAll(message) {
  ensureRepo();
  for (const file of fs.readdirSync(repoRoot).filter((x) => x.endsWith('.json'))) readJson(path.join(repoRoot, file));
  const files = ['.gitignore', '.gitattributes', 'README.md', 'push-json.ps1', 'start-json-panel.ps1', 'json_panel.py', 'package.json', 'package-lock.json', 'electron'];
  for (const file of fs.readdirSync(repoRoot).filter((x) => x.endsWith('.json'))) files.push(file);
  await git(['add', ...files.filter((f) => fs.existsSync(path.join(repoRoot, f)))]);
  let committed = '没有新的文件变化，直接推送。';
  if (await hasCachedDiff()) committed = await git(['commit', '-m', message || 'update json config']);
  const pushed = await git(['push', '-u', 'origin', 'master']);
  return `${committed}\n${pushed}`;
}

function pageById(data, pageId) {
  const page = (data.pages || []).find((p) => p.id === pageId);
  if (!page) throw new Error('页面不存在');
  page.items ??= [];
  return page;
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 980,
    minHeight: 680,
    title: 'ikun JSON 维护工具',
    icon: path.join(__dirname, 'assets', 'icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  win.removeMenu();
  win.loadFile(path.join(__dirname, 'renderer.html'));
}

ipcMain.handle('repo:get', () => ({ repoRoot, ok: isRepo(repoRoot) }));
ipcMain.handle('repo:choose', async () => {
  const res = await dialog.showOpenDialog({ title: '选择 Gitee JSON 仓库目录', properties: ['openDirectory'] });
  if (res.canceled || !res.filePaths[0]) return { repoRoot, ok: isRepo(repoRoot) };
  if (!isRepo(res.filePaths[0])) throw new Error('选择的目录不是配置仓库，需要包含 .git 和 manifest.json');
  repoRoot = res.filePaths[0];
  return { repoRoot, ok: true };
});
ipcMain.handle('files:list', () => listJsonFiles());
ipcMain.handle('config:load', (_e, file) => loadConfig(file));
ipcMain.handle('douyin:resolve', (_e, text) => resolveDouyin(text));
ipcMain.handle('file:create', (_e, { name, pageName }) => createFile(name, pageName));
ipcMain.handle('page:add', (_e, { file, name }) => {
  const data = loadConfig(file);
  const title = String(name || '新页面').trim();
  const base = slug(title);
  let id = base;
  let n = 2;
  while ((data.pages || []).some((p) => p.id === id)) id = `${base}-${n++}`;
  data.pages.push({ id, title, name: title, enabled: true, items: [], count: 0 });
  data.activePageId = id;
  return { config: saveConfig(file, data, '远程配置已更新，添加自定义页面'), pageId: id };
});
ipcMain.handle('page:update', (_e, { file, pageId, name }) => {
  const data = loadConfig(file);
  const page = pageById(data, pageId);
  page.name = page.title = String(name || page.name || '').trim();
  return saveConfig(file, data, '远程配置已更新，修改自定义页面');
});
ipcMain.handle('page:delete', (_e, { file, pageId }) => {
  const data = loadConfig(file);
  if ((data.pages || []).length <= 1) throw new Error('至少保留一个页面');
  data.pages = data.pages.filter((p) => p.id !== pageId);
  data.activePageId = data.pages[0].id;
  return saveConfig(file, data, '远程配置已更新，删除自定义页面');
});
ipcMain.handle('item:add', (_e, { file, pageId, item }) => {
  const data = loadConfig(file);
  const page = pageById(data, pageId);
  const sec = item.sec_user_id || (item.url?.match(SEC_RE) || [])[0] || '';
  if (!item.name || !item.url) throw new Error('名称和 URL 不能为空');
  const old = page.items.find((x) => x.url === item.url || (sec && x.sec_user_id === sec));
  if (old) return { config: data, message: `已存在，未重复添加：${old.name || old.url}` };
  if (sec) item.sec_user_id = sec;
  page.items.push(item);
  return { config: saveConfig(file, data, '远程配置已更新，新增博主'), message: `已添加：${item.name}` };
});
ipcMain.handle('item:update', (_e, { file, pageId, index, item }) => {
  const data = loadConfig(file);
  const page = pageById(data, pageId);
  if (index < 0 || index >= page.items.length) throw new Error('序号不存在');
  page.items[index] = item;
  return saveConfig(file, data, '远程配置已更新，修改博主');
});
ipcMain.handle('item:delete', (_e, { file, pageId, index }) => {
  const data = loadConfig(file);
  const page = pageById(data, pageId);
  if (index < 0 || index >= page.items.length) throw new Error('序号不存在');
  page.items.splice(index, 1);
  return saveConfig(file, data, '远程配置已更新，删除博主');
});
ipcMain.handle('git:push', (_e, message) => pushAll(message));

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
