$htmlPath = "\\wsl$\Ubuntu\home\hiden\accessroute\presentation\slides.html"
$outputPath = "$env:USERPROFILE\Downloads\AccessRoute_プレゼン.pdf"

Add-Type -AssemblyName System.Drawing

# Use Edge/Chrome in headless mode to print each slide as image
$edgePath = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if (-not (Test-Path $edgePath)) {
    $edgePath = "C:\Program Files\Microsoft\Edge\Application\msedge.exe"
}
if (-not (Test-Path $edgePath)) {
    $edgePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
}

$tempDir = Join-Path $env:TEMP "accessroute_pdf"
if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force }
New-Item -ItemType Directory -Path $tempDir | Out-Null

# Generate 6 individual HTML files, one per slide
$htmlContent = Get-Content -Path $htmlPath -Raw -Encoding UTF8

for ($i = 1; $i -le 6; $i++) {
    $modified = $htmlContent
    # Make only slide $i active
    for ($j = 1; $j -le 6; $j++) {
        if ($j -eq $i) {
            $modified = $modified -replace "slide slide-$j`"", "slide slide-$j active`""
            $modified = $modified -replace "slide slide-$j active active", "slide slide-$j active"
        } else {
            $modified = $modified -replace "slide slide-$j active", "slide slide-$j"
        }
    }
    # Hide nav elements
    $modified = $modified -replace '<div class="nav">', '<div class="nav" style="display:none">'
    $modified = $modified -replace '<div class="timer"', '<div class="timer" style="display:none"'
    $modified = $modified -replace '<div class="slide-counter">', '<div class="slide-counter" style="display:none">'

    $slideFile = Join-Path $tempDir "slide_$i.html"
    [System.IO.File]::WriteAllText($slideFile, $modified, [System.Text.Encoding]::UTF8)

    # Use Edge headless to screenshot
    $screenshotFile = Join-Path $tempDir "slide_$i.png"
    $userDataDir = Join-Path $tempDir "profile_$i"

    Start-Process -FilePath $edgePath -ArgumentList @(
        "--headless=new",
        "--disable-gpu",
        "--screenshot=$screenshotFile",
        "--window-size=1920,1080",
        "--hide-scrollbars",
        "--user-data-dir=$userDataDir",
        "file:///$slideFile"
    ) -Wait -NoNewWindow
}

# Combine PNGs into PDF using .NET
Add-Type -AssemblyName System.Drawing

$doc = New-Object System.Collections.ArrayList
for ($i = 1; $i -le 6; $i++) {
    $pngPath = Join-Path $tempDir "slide_$i.png"
    if (Test-Path $pngPath) {
        [void]$doc.Add($pngPath)
    }
}

if ($doc.Count -gt 0) {
    # Use PDFsharp alternative: just create a simple HTML with images and print to PDF
    $combinedHtml = @"
<!DOCTYPE html>
<html><head>
<style>
@page { size: 1920px 1080px; margin: 0; }
@media print { body { margin: 0; } .page { page-break-after: always; } .page:last-child { page-break-after: auto; } }
body { margin: 0; padding: 0; }
img { width: 100%; height: auto; display: block; }
.page { width: 1920px; height: 1080px; overflow: hidden; }
</style>
</head><body>
"@
    for ($i = 1; $i -le $doc.Count; $i++) {
        $pngPath = $doc[$i - 1] -replace '\\', '/'
        $combinedHtml += "<div class='page'><img src='file:///$pngPath'></div>`n"
    }
    $combinedHtml += "</body></html>"

    $combinedFile = Join-Path $tempDir "combined.html"
    [System.IO.File]::WriteAllText($combinedFile, $combinedHtml, [System.Text.Encoding]::UTF8)

    $userDataDir2 = Join-Path $tempDir "profile_final"
    Start-Process -FilePath $edgePath -ArgumentList @(
        "--headless=new",
        "--disable-gpu",
        "--print-to-pdf=$outputPath",
        "--print-to-pdf-no-header",
        "--no-margins",
        "--user-data-dir=$userDataDir2",
        "file:///$combinedFile"
    ) -Wait -NoNewWindow

    Write-Host "PDF saved: $outputPath"
} else {
    Write-Host "Error: No screenshots generated"
}

# Cleanup
Start-Sleep -Seconds 2
Remove-Item $tempDir -Recurse -Force -ErrorAction SilentlyContinue
