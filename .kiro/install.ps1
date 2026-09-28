# install.ps1 — Windows-native installer for ECC Kiro.
# Installs Everything Claude Code workflows into a Kiro project.
#
# Usage:
#   .\install.ps1              # Install to current directory
#   .\install.ps1 \path\to\dir # Install to specific directory
#   .\install.ps1 ~            # Install globally to ~/.kiro/

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# Get the directory where this script lives
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$sourceKiro = $scriptDir

# Target directory: first argument or current directory
$targetInput = if ($args.Count -gt 0) { $args[0] } else { "." }

# Expand ~ to user profile directory
$target = $targetInput
if ($target -eq "~") {
    $target = $env:USERPROFILE
} elseif ($target.StartsWith("~/") -or $target.StartsWith("~\")) {
    $target = Join-Path -Path $env:USERPROFILE -ChildPath $target.Substring(2)
}

# Resolve to absolute path
if ([System.IO.Path]::IsPathRooted($target)) {
    $target = [System.IO.Path]::GetFullPath($target)
} else {
    $target = [System.IO.Path]::GetFullPath((Join-Path -Path (Get-Location) -ChildPath $target))
}

Write-Host "ECC Kiro Installer"
Write-Host "=================="
Write-Host ""
Write-Host "Source:  $sourceKiro"
Write-Host "Target:  $(Join-Path -Path $target -ChildPath '.kiro')"
Write-Host ""

# Subdirectories to create
$subdirs = @("agents", "skills", "steering", "hooks", "scripts", "settings")
foreach ($dir in $subdirs) {
    $path = Join-Path -Path $target -ChildPath ".kiro/$dir"
    if (-not (Test-Path -Path $path)) {
        New-Item -ItemType Directory -Force -Path $path | Out-Null
    }
}

$agentsCount = 0
$skillsCount = 0
$steeringCount = 0
$hooksCount = 0
$scriptsCount = 0
$settingsCount = 0

# Copy agents
$sourceAgentsDir = Join-Path -Path $sourceKiro -ChildPath "agents"
if (Test-Path -Path $sourceAgentsDir) {
    $files = Get-ChildItem -Path $sourceAgentsDir -File | Where-Object { $_.Name.EndsWith(".json") -or $_.Name.EndsWith(".md") }
    foreach ($file in $files) {
        $destFile = Join-Path -Path $target -ChildPath ".kiro/agents/$($file.Name)"
        if (-not (Test-Path -Path $destFile)) {
            Copy-Item -Path $file.FullName -Destination $destFile -Force -ErrorAction SilentlyContinue
            $agentsCount++
        }
    }
}

# Copy skills
$sourceSkillsDir = Join-Path -Path $sourceKiro -ChildPath "skills"
if (Test-Path -Path $sourceSkillsDir) {
    $dirs = Get-ChildItem -Path $sourceSkillsDir -Directory
    foreach ($dir in $dirs) {
        $skillName = $dir.Name
        $destSkillDir = Join-Path -Path $target -ChildPath ".kiro/skills/$skillName"
        if (-not (Test-Path -Path $destSkillDir)) {
            New-Item -ItemType Directory -Force -Path $destSkillDir | Out-Null
            Copy-Item -Path "$($dir.FullName)\*" -Destination $destSkillDir -Force -ErrorAction SilentlyContinue
            $skillsCount++
        }
    }
}

# Copy steering
$sourceSteeringDir = Join-Path -Path $sourceKiro -ChildPath "steering"
if (Test-Path -Path $sourceSteeringDir) {
    $files = Get-ChildItem -Path $sourceSteeringDir -File | Where-Object { $_.Name.EndsWith(".md") }
    foreach ($file in $files) {
        $destFile = Join-Path -Path $target -ChildPath ".kiro/steering/$($file.Name)"
        if (-not (Test-Path -Path $destFile)) {
            Copy-Item -Path $file.FullName -Destination $destFile -Force -ErrorAction SilentlyContinue
            $steeringCount++
        }
    }
}

# Copy hooks
$sourceHooksDir = Join-Path -Path $sourceKiro -ChildPath "hooks"
if (Test-Path -Path $sourceHooksDir) {
    $files = Get-ChildItem -Path $sourceHooksDir -File | Where-Object { $_.Name.EndsWith(".kiro.hook") -or $_.Name.EndsWith(".md") }
    foreach ($file in $files) {
        $destFile = Join-Path -Path $target -ChildPath ".kiro/hooks/$($file.Name)"
        if (-not (Test-Path -Path $destFile)) {
            Copy-Item -Path $file.FullName -Destination $destFile -Force -ErrorAction SilentlyContinue
            $hooksCount++
        }
    }
}

# Copy scripts
$sourceScriptsDir = Join-Path -Path $sourceKiro -ChildPath "scripts"
if (Test-Path -Path $sourceScriptsDir) {
    $files = Get-ChildItem -Path $sourceScriptsDir -File | Where-Object { $_.Name.EndsWith(".sh") -or $_.Name.EndsWith(".ps1") -or $_.Name.EndsWith(".bat") }
    foreach ($file in $files) {
        $destFile = Join-Path -Path $target -ChildPath ".kiro/scripts/$($file.Name)"
        if (-not (Test-Path -Path $destFile)) {
            Copy-Item -Path $file.FullName -Destination $destFile -Force -ErrorAction SilentlyContinue
            $scriptsCount++
        }
    }
}

# Copy settings
$sourceSettingsDir = Join-Path -Path $sourceKiro -ChildPath "settings"
if (Test-Path -Path $sourceSettingsDir) {
    $files = Get-ChildItem -Path $sourceSettingsDir -File
    foreach ($file in $files) {
        $destFile = Join-Path -Path $target -ChildPath ".kiro/settings/$($file.Name)"
        if (-not (Test-Path -Path $destFile)) {
            Copy-Item -Path $file.FullName -Destination $destFile -Force -ErrorAction SilentlyContinue
            $settingsCount++
        }
    }
}

Write-Host "Installation complete!"
Write-Host ""
Write-Host "Components installed:"
Write-Host "  Agents:    $agentsCount"
Write-Host "  Skills:    $skillsCount"
Write-Host "  Steering:  $steeringCount"
Write-Host "  Hooks:     $hooksCount"
Write-Host "  Scripts:   $scriptsCount"
Write-Host "  Settings:  $settingsCount"
Write-Host ""
Write-Host "Next steps:"
Write-Host "  1. Open your project in Kiro"
Write-Host "  2. Agents: Automatic in IDE, /agent swap in CLI"
Write-Host "  3. Skills: Available via / menu in chat"
Write-Host "  4. Steering files with 'auto' inclusion load automatically"
Write-Host "  5. Toggle hooks in the Agent Hooks panel"
Write-Host "  6. Copy desired MCP servers from .kiro/settings/mcp.json.example to .kiro/settings/mcp.json"
