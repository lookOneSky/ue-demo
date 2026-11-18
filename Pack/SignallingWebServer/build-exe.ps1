param(
    [string]$OutputName = "SignallingWebServer.exe",
    [string]$Target = "node18-win-x64",
    [switch]$Clean,
    [switch]$KeepPkgConfig
)

$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$AppFile = Join-Path $Root "app.cjs"
$DistDir = Join-Path $Root "dist"
$TempPkgConfig = Join-Path $Root "pkg.package.json"
$ExePath = Join-Path $DistDir $OutputName

if (!(Test-Path $AppFile)) {
    throw "找不到入口文件: $AppFile"
}

foreach ($command in @("node", "npm", "npx")) {
    if (!(Get-Command $command -ErrorAction SilentlyContinue)) {
        throw "找不到 $command，请先安装 Node.js。"
    }
}

if ($Clean -and (Test-Path $DistDir)) {
    Remove-Item -LiteralPath $DistDir -Recurse -Force
}

New-Item -ItemType Directory -Path $DistDir -Force | Out-Null

Push-Location $Root
try {
    $assets = New-Object System.Collections.Generic.List[string]

    foreach ($file in @("config.json", "users.json")) {
        if (Test-Path (Join-Path $Root $file)) {
            $assets.Add($file)
        }
    }

    foreach ($dir in @("Public", "custom_html", "scripts", "images", "certificates")) {
        if (Test-Path (Join-Path $Root $dir)) {
            $assets.Add("$dir/**/*")
        }
    }

    $pkgConfig = [ordered]@{
        pkg = [ordered]@{
            assets = $assets
        }
    }

    $pkgConfig | ConvertTo-Json -Depth 8 | Set-Content -Path $TempPkgConfig -Encoding UTF8

    Write-Host "正在打包 $AppFile -> $ExePath"
    Write-Host "目标平台: $Target"
    Write-Host "资源文件: $($assets.Count) 项"

    & npx --yes pkg@5.8.1 $AppFile --config $TempPkgConfig --targets $Target --output $ExePath --compress GZip

    if ($LASTEXITCODE -ne 0) {
        throw "pkg 打包失败，退出码: $LASTEXITCODE"
    }

    foreach ($file in @("config.json", "users.json")) {
        $source = Join-Path $Root $file
        if (Test-Path $source) {
            Copy-Item -LiteralPath $source -Destination (Join-Path $DistDir $file) -Force
        }
    }

    $startBat = @"
@echo off
cd /d "%~dp0"
"%~dp0$OutputName" --configFile "%~dp0config.json" %*
pause
"@
    Set-Content -Path (Join-Path $DistDir "start-exe.bat") -Value $startBat -Encoding ASCII

    Write-Host ""
    Write-Host "打包完成: $ExePath"
    Write-Host "启动脚本: $(Join-Path $DistDir "start-exe.bat")"
}
finally {
    Pop-Location

    if (!$KeepPkgConfig -and (Test-Path $TempPkgConfig)) {
        Remove-Item -LiteralPath $TempPkgConfig -Force
    }
}
