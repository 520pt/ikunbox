# ikun-json-config

ikun 远程 JSON 配置仓库。

## 修改方法

1. 修改 `custom_blogger_config.json` 里的页面和博主。
2. 每次想让 App 自动更新，把 `manifest.json` 的 `version` 加 1。
3. 提交并推送到 Gitee。

App 会读取：

- `manifest.json`：判断是否有新版本
- `custom_blogger_config.json`：实际自定义界面配置
