$files = Get-ChildItem -Filter *.html
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $content = $content -replace 'class="nav-link active"', 'class="nav-link"'
    Set-Content -Path $file.FullName -Value $content -Encoding UTF8
}
Write-Host "Removed hardcoded active classes."
