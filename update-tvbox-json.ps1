$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
Set-Location $PSScriptRoot
python .\update_tvbox_config.py
python -m json.tool .\jsm.json > $null
node --check ".\js\xiaoman-douyin.js"
Write-Host "OK: 已更新合并源 $PSScriptRoot\jsm.json"
Write-Host "导入地址: https://gitee.com/txnas/lufeitv/raw/master/jsm.json"
