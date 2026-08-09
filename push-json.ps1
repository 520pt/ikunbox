param(
    [string]$Message = "update json config"
)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot
Get-ChildItem -LiteralPath $PSScriptRoot -Filter *.json | ForEach-Object {
    python -m json.tool $_.FullName > $null
}
git add .gitignore .gitattributes README.md push-json.ps1 start-json-panel.ps1 build-exe.ps1 json_panel.py package.json package-lock.json electron *.json
if (-not (git diff --cached --quiet)) {
    git commit -m $Message
}
git push -u origin master
