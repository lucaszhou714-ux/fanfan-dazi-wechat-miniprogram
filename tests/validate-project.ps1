$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$required = @(
  'project.config.json','miniprogram/app.json','miniprogram/app.js',
  'miniprogram/pages/home/home.js','miniprogram/pages/plan/plan.js',
  'miniprogram/pages/draw/draw.js','miniprogram/pages/logs/logs.js',
  'miniprogram/pages/couple/couple.js','miniprogram/pages/profile/profile.js',
  'cloudfunctions/login/index.js','cloudfunctions/sync/index.js','docs/DEPLOYMENT.md'
)
foreach ($file in $required) { if (-not (Test-Path (Join-Path $root $file))) { throw "Missing: $file" } }
$app = [System.IO.File]::ReadAllText((Join-Path $root 'miniprogram/app.json'), [System.Text.Encoding]::UTF8) | ConvertFrom-Json
if ($app.pages.Count -ne 6) { throw "Expected 6 pages" }
$dishes = (Select-String -Path (Join-Path $root 'miniprogram/utils/dishes.js') -Pattern "\['" -AllMatches).Matches.Count
if ($dishes -lt 40) { throw "Expected at least 40 dishes" }
Write-Output "PASS: required files, app config, and dish seed validated."
