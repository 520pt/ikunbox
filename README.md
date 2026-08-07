# ikun-json-config

ikun 远程 JSON 配置仓库。

## 修改方法

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

- `https://gitee.com/txnas/ikun-json-config/raw/master/manifest.json`
- `https://gitee.com/txnas/ikun-json-config/raw/master/custom_blogger_config.json`
