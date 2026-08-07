param(
    [string]$Message = "update json config"
)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot
python -m json.tool manifest.json > $null
python -m json.tool custom_blogger_config.json > $null
git add README.md manifest.json custom_blogger_config.json .gitattributes push-json.ps1
if (-not (git diff --cached --quiet)) {
    git commit -m $Message
}
git push -u origin master
