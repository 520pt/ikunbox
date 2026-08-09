$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot
if (-not (Test-Path -LiteralPath "node_modules")) {
    npm install
}
npm run build:exe
$exe = Get-ChildItem -LiteralPath "$PSScriptRoot\dist" -Filter "ikun-json-manager.exe" -File | Select-Object -First 1
if (-not $exe) { throw "没有找到打包后的 exe" }
Copy-Item -LiteralPath $exe.FullName -Destination "$PSScriptRoot\ikun-json-manager.exe" -Force
Write-Host "已生成：$PSScriptRoot\ikun-json-manager.exe"
