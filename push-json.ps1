param(
    [string]$Message = "update json config"
)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot
Get-ChildItem -LiteralPath $PSScriptRoot -Filter *.json | ForEach-Object {
    python -m json.tool $_.FullName > $null
}
git add .gitignore .gitattributes README.md push-json.ps1 start-json-panel.ps1 build-exe.ps1 update-tvbox-json.ps1 sync-tvbox-json.ps1 update_tvbox_config.py json_panel.py package.json package-lock.json electron js TVBox *.json
if (-not (git diff --cached --quiet)) {
    git commit -m $Message
}
git push -u origin master
