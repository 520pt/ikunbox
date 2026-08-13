$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
Set-Location $PSScriptRoot
powershell -NoProfile -ExecutionPolicy Bypass -File .\update-tvbox-json.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File .\push-json.ps1 "update merged tvbox jsm"
Write-Host "OK: 已同步并推送合并源"
Write-Host "导入地址: https://raw.githubusercontent.com/520pt/lufeitv-tvbox/master/jsm.json"
