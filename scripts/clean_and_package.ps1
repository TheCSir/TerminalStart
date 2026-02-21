$projectRoot = Split-Path -Parent $PSScriptRoot
$assets = Join-Path $projectRoot "extension\assets"

Get-ChildItem $assets | ForEach-Object {
    $name = $_.Name
    $ext = $_.Extension
    if ($ext -eq ".js" -or $ext -eq ".css") { return }

    # First, delete explicitly unwanted variants
    if ($name -match "Italic" -or $name -match "Light" -or $name -match "Mini" -or $name -match "Modern" -or $name -match "SEGGCHAN" -or $name -match "cyrillic" -or $name -match "greek" -or $name -match "vietnamese") {
        Write-Host "Deleting unwanted variant: $name"
        Remove-Item $_.FullName -Force
        return
    }

    # Then, keep only the standard weights/types
    if ($name -notmatch "Regular" -and $name -notmatch "Bold" -and $name -notmatch "Weather" -and $name -notmatch "normal") {
        Write-Host "Deleting non-standard file: $name"
        Remove-Item $_.FullName -Force
    }
}

Write-Host "Running Python Packagers..."
python (Join-Path $PSScriptRoot "package_addon.py")
python (Join-Path $PSScriptRoot "package_source.py")

Write-Host "Renaming Artifacts..."
$addonZip = Join-Path $projectRoot "terminal-start-v1.0.0.zip"
$sourceZip = Join-Path $projectRoot "terminal-start-source-v1.0.0.zip"
$addonClean = Join-Path $projectRoot "terminal-start-CLEAN-v1.0.0.zip"
$sourceClean = Join-Path $projectRoot "terminal-start-source-CLEAN-v1.0.0.zip"

if (Test-Path $addonZip) {
    Move-Item $addonZip $addonClean -Force
}
if (Test-Path $sourceZip) {
    Move-Item $sourceZip $sourceClean -Force
}
Write-Host "Done."
