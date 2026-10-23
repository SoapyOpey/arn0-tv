# Packages src/ into dist/hjem-launcher.wgt on Windows, where Git Bash has no `zip`.
# Same contents as build.sh; the archive is written with the tar.exe that ships with Windows.
$ErrorActionPreference = 'Stop'
Set-Location (Join-Path $PSScriptRoot '..')

if (-not (Test-Path 'src/icon.png')) { node scripts/make-icon.mjs }
if (-not (Test-Path 'src/js/config.local.js')) {
    Set-Content 'src/js/config.local.js' '/* No local overrides. See config.local.example.js. */'
}
node scripts/build-marks.mjs

New-Item -ItemType Directory -Force 'dist' | Out-Null
if (Test-Path 'dist/hjem-launcher.wgt') { Remove-Item 'dist/hjem-launcher.wgt' }

$tar = Join-Path $env:SystemRoot 'System32\tar.exe'
Push-Location 'src'
try {
    # Same entry order as build.sh.
    $entries = Get-ChildItem -Name | Where-Object { $_ -notlike '.*' } | Sort-Object { $_.ToLowerInvariant() }
    & $tar --format zip -cf '../dist/hjem-launcher.wgt' --exclude='*.DS_Store' --exclude='img/marks' @entries
} finally {
    Pop-Location
}

"Built dist/hjem-launcher.wgt"
& $tar -tf 'dist/hjem-launcher.wgt' | Measure-Object | ForEach-Object { "$($_.Count) entries" }
