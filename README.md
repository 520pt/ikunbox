# lufeitv

ikun 远程 JSON 配置仓库。

## 可视化维护面板

双击或运行：

```powershell
powershell -ExecutionPolicy Bypass -File .\start-json-panel.ps1
```

打开后可以：

- 粘贴抖音分享文本，自动解析成可用的 `douyin.com/user/<sec_user_id>` 主页地址和真实昵称。
- 添加、编辑、删除博主。
- 添加、改名、删除自定义页面。
- 新建和切换多个配置 JSON。
- 点击“上传到 Gitee”自动校验 JSON、提交并推送。

示例粘贴内容：

```text
3- 长按复制此条消息，打开抖音搜索，查看TA的更多作品。 https://v.douyin.com/mP0qc7wScAs/ 5@7.com :4pm
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
