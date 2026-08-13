# lufeitv

ikun 远程 JSON 配置仓库。

## 单文件 exe 工具

本地维护直接运行仓库根目录的：

```text
ikun-json-manager.exe
```

如果需要重新生成 exe，运行：

```powershell
powershell -ExecutionPolicy Bypass -File .\build-exe.ps1
```

工具可以：

- 粘贴抖音分享文本，自动解析成可用的 `douyin.com/user/<sec_user_id>` 主页地址和真实昵称。
- 添加、编辑、删除博主。
- 添加、改名、删除自定义页面。
- 新建和切换多个配置 JSON。
- 点击“上传到 Gitee”自动校验 JSON、提交并推送。

示例粘贴内容：

```text
3- 长按复制此条消息，打开抖音搜索，查看TA的更多作品。 https://v.douyin.com/mP0qc7wScAs/ 5@7.com :4pm
```

## 备用网页面板

```powershell
powershell -ExecutionPolicy Bypass -File .\start-json-panel.ps1
```

## 手动修改方法

1. 修改 `custom_blogger_config.json` 里的页面和博主。
2. 每次想让 App 自动更新，把 `manifest.json` 的 `version` 加 1。
3. 运行：

```powershell
powershell -ExecutionPolicy Bypass -File .\push-json.ps1 "update json config"
```

App 会读取：

- `manifest.json`：判断是否有新版本
- `custom_blogger_config.json`：实际自定义界面配置

远程地址：

- `https://gitee.com/txnas/lufeitv/raw/master/manifest.json`
- `https://gitee.com/txnas/lufeitv/raw/master/custom_blogger_config.json`


## TVBox 合并源：上游 jsm + 小满抖音

现在仓库会生成一个合并后的 TVBox 配置：

```text
https://raw.githubusercontent.com/520pt/lufeitv-tvbox/master/jsm.json
```

这个 `jsm.json` 会自动拉取并合并上游：

```text
https://v6.gh-proxy.org/https://raw.githubusercontent.com/qist/tvbox/master/jsm.json
```

同时在 `sites` 第一项加入我们自己的：

```text
小满｜抖音[Cookie]
```

### 手动更新合并源

每次想同步上游最新配置，运行：

```powershell
powershell -ExecutionPolicy Bypass -File .\update-tvbox-json.ps1
```

然后推送：

```powershell
powershell -ExecutionPolicy Bypass -File .\push-json.ps1 "update tvbox merged jsm"
```

### 抖音 Cookie 登录

抖音源默认读取壳软件本地 Cookie 文件：

```text
http://127.0.0.1:9978/file/TVBox/douyin_cookie.txt
```

把电脑浏览器登录 `https://www.douyin.com/` 后复制到的 Cookie 粘贴进壳软件本地 `TVBox/douyin_cookie.txt`，不要带 `Cookie:` 前缀，也不要上传真实 Cookie。

### 为什么脚本要改上游相对路径

上游配置里很多资源是 `./js/xxx.js`、`./lib/drpy2.min.js`。如果直接复制到我们自己的仓库，这些相对路径会指向我们仓库而失效。`update_tvbox_config.py` 会自动把上游相对路径改成上游绝对地址，再加入我们自己的抖音源。


备用说明：Gitee raw 对合并后的 TVBox 大配置会返回 451，TVBox 合并源请使用 GitHub Raw 地址。
