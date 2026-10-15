$files = Get-ChildItem -Path '.' -Filter '*.html'
foreach ($f in $files) {
    $content = Get-Content -Raw -Path $f.FullName
    $content = $content -replace 'Your brand is more than a logo\?it''s', 'Your brand is more than a logo&mdash;it''s'
    $content = $content -replace '<div class="svc3d-icon">\?\?</div>\s*<h3 class="svc3d-title">Social Media Marketing &amp; Management</h3>', '<div class="svc3d-icon"><i data-lucide="share-2"></i></div>
              <h3 class="svc3d-title">Social Media Marketing &amp; Management</h3>'
    $content = $content -replace '<div class="svc3d-icon">\?\?</div>\s*<h3 class="svc3d-title">Branding &amp; Creative Design</h3>', '<div class="svc3d-icon"><i data-lucide="pen-tool"></i></div>
              <h3 class="svc3d-title">Branding &amp; Creative Design</h3>'
    $content = $content -replace '<div class="svc3d-icon">\?\?</div>\s*<h3 class="svc3d-title">Content Creation &amp; Video Production</h3>', '<div class="svc3d-icon"><i data-lucide="video"></i></div>
              <h3 class="svc3d-title">Content Creation &amp; Video Production</h3>'
    $content = $content -replace '<button class="mobile-nav-close" id="mobileNavClose" aria-label="Close menu">\?</button>', '<button class="mobile-nav-close" id="mobileNavClose" aria-label="Close menu"><i data-lucide="x"></i></button>'
    $content = $content -replace '<span>\? Strategy-First Approach</span>', '<span><i data-lucide="check-circle-2" style="color:var(--color-accent-yellow); margin-right:4px;"></i> Strategy-First Approach</span>'
    $content = $content -replace '<span>\? MBA Qualified Mentors</span>', '<span><i data-lucide="check-circle-2" style="color:var(--color-accent-yellow); margin-right:4px;"></i> MBA Qualified Mentors</span>'
    $content = $content -replace '<span>\? Transparent ROI Reporting</span>', '<span><i data-lucide="check-circle-2" style="color:var(--color-accent-yellow); margin-right:4px;"></i> Transparent ROI Reporting</span>'
    $content = $content -replace '<div class="stars">\?\?\?\?\?</div>', '<div class="stars"><i data-lucide="star" style="fill: currentColor; width:16px; height:16px;"></i><i data-lucide="star" style="fill: currentColor; width:16px; height:16px;"></i><i data-lucide="star" style="fill: currentColor; width:16px; height:16px;"></i><i data-lucide="star" style="fill: currentColor; width:16px; height:16px;"></i><i data-lucide="star" style="fill: currentColor; width:16px; height:16px;"></i></div>'
    
    Set-Content -Path $f.FullName -Value $content -Encoding UTF8
}
