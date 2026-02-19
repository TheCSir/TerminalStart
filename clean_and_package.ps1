$assets = "extension\assets"
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
python package_addon.py
python package_source.py

Write-Host "Renaming Artifacts..."
if (Test-Path "terminal-start-v1.0.0.zip") {
    Move-Item "terminal-start-v1.0.0.zip" "terminal-start-CLEAN-v1.0.0.zip" -Force
}
if (Test-Path "terminal-start-source-v1.0.0.zip") {
    Move-Item "terminal-start-source-v1.0.0.zip" "terminal-start-source-CLEAN-v1.0.0.zip" -Force
}
Write-Host "Done."
