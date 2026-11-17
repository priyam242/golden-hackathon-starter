<#
.SYNOPSIS
    Golden Hackathon Starter — 1-Command Autonomous Project Generator
.DESCRIPTION
    Bootstraps a fresh, production-ready hackathon monorepo in under 10 seconds.
    Modes:
      - "clean"  : Core Spine (Auth, RBAC, AI Chat/OCR, Files, WebSockets) + Clean S01 Sprint Template.
      - "spendx" : Core Spine + Complete SpendX FinTech Suite (Receipt OCR, Approvals, Currencies, Budgets).
      - "saas"   : Core Spine + Full Brightloop Recurring Billing & Subscription Suite.
.EXAMPLE
    .\scripts\new-hackathon.ps1 -Name "MediFlow" -Mode "clean"
    .\scripts\new-hackathon.ps1 -Name "SpendPro" -Mode "spendx"
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $true, Position = 0)]
    [string]$Name,

    [Parameter(Mandatory = $false)]
    [ValidateSet("clean", "spendx", "saas")]
    [string]$Mode = "clean",

    [Parameter(Mandatory = $false)]
    [string]$Destination = ""
)

$ErrorActionPreference = "Stop"
$sw = [System.Diagnostics.Stopwatch]::StartNew()

$RootStarterDir = Split-Path -Parent $PSScriptRoot
if (-not $Destination) {
    $Destination = Join-Path "D:\" $Name
}

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host " GOLDEN HACKATHON GENERATOR: Bootstrapping '$Name'" -ForegroundColor Green
Write-Host " Mode: $Mode | Target: $Destination" -ForegroundColor DarkCyan
Write-Host "=================================================================" -ForegroundColor Cyan

# 1. Clean or create destination
if (Test-Path $Destination) {
    Write-Warning "Target directory '$Destination' already exists. Cleaning up..."
    Remove-Item -Recurse -Force $Destination
}
New-Item -ItemType Directory -Path $Destination -Force | Out-Null

# 2. Copy Core Backend
Write-Host " [1/5] Scaffolding Modular Backend (FastAPI + Async SQLAlchemy)..." -ForegroundColor White
$backendDest = Join-Path $Destination "backend"
New-Item -ItemType Directory -Path "$backendDest\core" -Force | Out-Null
New-Item -ItemType Directory -Path "$backendDest\uploads" -Force | Out-Null

Copy-Item -Path "$RootStarterDir\backend\core\*" -Destination "$backendDest\core" -Recurse -Force
Copy-Item -Path "$RootStarterDir\backend\main.py" -Destination "$backendDest\main.py" -Force
Copy-Item -Path "$RootStarterDir\backend\requirements.txt" -Destination "$backendDest\requirements.txt" -Force
Copy-Item -Path "$RootStarterDir\backend\pytest.ini" -Destination "$backendDest\pytest.ini" -Force
Copy-Item -Path "$RootStarterDir\backend\test_golden_suite.py" -Destination "$backendDest\test_golden_suite.py" -Force

# Modules selection based on Mode
New-Item -ItemType Directory -Path "$backendDest\modules\s01_core" -Force | Out-Null
Copy-Item -Path "$RootStarterDir\backend\modules\s01_core\*" -Destination "$backendDest\modules\s01_core" -Recurse -Force

if ($Mode -eq "spendx") {
    New-Item -ItemType Directory -Path "$backendDest\modules\spendx_suite" -Force | Out-Null
    Copy-Item -Path "$RootStarterDir\backend\modules\spendx_suite\*" -Destination "$backendDest\modules\spendx_suite" -Recurse -Force
}

if ($Mode -eq "saas") {
    New-Item -ItemType Directory -Path "$backendDest\modules\billing_subscriptions" -Force | Out-Null
    Copy-Item -Path "$RootStarterDir\backend\modules\billing_subscriptions\*" -Destination "$backendDest\modules\billing_subscriptions" -Recurse -Force
}

# 3. Copy Frontend
Write-Host " [2/5] Scaffolding Modular Frontend (React 18 + Vite + Bell MT)..." -ForegroundColor White
$frontendDest = Join-Path $Destination "frontend"
New-Item -ItemType Directory -Path $frontendDest -Force | Out-Null

$frontendItems = @("src", "index.html", "vite.config.js", "tailwind.config.js", "postcss.config.js", "package.json")
foreach ($item in $frontendItems) {
    $srcPath = Join-Path "$RootStarterDir\frontend" $item
    if (Test-Path $srcPath) {
        Copy-Item -Path $srcPath -Destination "$frontendDest\$item" -Recurse -Force
    }
}

# 4. Copy Shared Resources
Write-Host " [3/5] Linking Shared Tokens, Mock API & Playwright Assets..." -ForegroundColor White
$sharedDest = Join-Path $Destination "shared"
Copy-Item -Path "$RootStarterDir\shared" -Destination $sharedDest -Recurse -Force

# Copy Scripts
$scriptsDest = Join-Path $Destination "scripts"
New-Item -ItemType Directory -Path $scriptsDest -Force | Out-Null
Copy-Item -Path "$RootStarterDir\scripts\lint-theme.mjs" -Destination "$scriptsDest\lint-theme.mjs" -Force

# 5. Apply Dynamic Branding
Write-Host " [4/5] Applying Dynamic Branding & Storage Isolation for '$Name'..." -ForegroundColor White

# Update backend/core/config.py
$cfgFile = "$backendDest\core\config.py"
if (Test-Path $cfgFile) {
    $c = Get-Content $cfgFile -Raw
    $c = $c.Replace('APP_NAME: str = os.getenv("APP_NAME", "GoldenHackathon")', "APP_NAME: str = os.getenv(`"APP_NAME`", `"$Name`")")
    $c = $c.Replace('ENABLE_BILLING_MODULE: bool = os.getenv("ENABLE_BILLING_MODULE", "true")', "ENABLE_BILLING_MODULE: bool = $(if ($Mode -eq 'saas') { '$true' } else { '$false' })")
    $c = $c.Replace('ENABLE_SPENDX_MODULE: bool = os.getenv("ENABLE_SPENDX_MODULE", "true")', "ENABLE_SPENDX_MODULE: bool = $(if ($Mode -eq 'spendx') { '$true' } else { '$false' })")
    Set-Content -Path $cfgFile -Value $c
}

# Update frontend/index.html title
$htmlFile = "$frontendDest\index.html"
if (Test-Path $htmlFile) {
    $h = Get-Content $htmlFile -Raw
    $h = $h -replace '<title>.*</title>', "<title>$Name — Hackathon Starter</title>"
    Set-Content -Path $htmlFile -Value $h
}

# Update local storage keys in client.js
$clientFile = "$sharedDest\api-client\client.js"
if (Test-Path $clientFile) {
    $prefix = $Name.ToLower().Replace(" ", "_")
    $cl = Get-Content $clientFile -Raw
    $cl = $cl.Replace("const ACCESS_KEY = 'app_access_token';", "const ACCESS_KEY = '${prefix}_access_token';")
    $cl = $cl.Replace("const REFRESH_KEY = 'app_refresh_token';", "const REFRESH_KEY = '${prefix}_refresh_token';")
    $cl = $cl.Replace("const USER_KEY = 'app_user';", "const USER_KEY = '${prefix}_user';")
    Set-Content -Path $clientFile -Value $cl
}

# 6. Generate Hackathon-Specific AGENTS.md
Write-Host " [5/5] Generating Pre-Configured AGENTS.md for Antigravity Agents..." -ForegroundColor White
$templatePath = Join-Path $PSScriptRoot "AGENTS.template.md"
if (Test-Path $templatePath) {
    $template = Get-Content $templatePath -Raw
    $rendered = $template.Replace("{{NAME}}", $Name).Replace("{{MODE}}", $Mode)
    $agentsPath = Join-Path $Destination "AGENTS.md"
    Set-Content -Path $agentsPath -Value $rendered -Encoding UTF8
}

$sw.Stop()
$elapsedSeconds = [math]::Round($sw.Elapsed.TotalSeconds, 2)

Write-Host "=================================================================" -ForegroundColor Green
Write-Host " Project '$Name' generated in $elapsedSeconds seconds!" -ForegroundColor Green
Write-Host " Location: $Destination" -ForegroundColor White
Write-Host " Mode    : $Mode" -ForegroundColor White
Write-Host "=================================================================" -ForegroundColor Green
