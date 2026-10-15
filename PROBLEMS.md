# Website Audit: Problems Found

Audit of every file in the repository (10 HTML pages, `style.css`, the build and deploy config, 3 helper scripts, 4 images).

**How it was checked:** I read every file by hand. I also ran `vite build` and `html-validate` on all pages, checked every local link and `#anchor` target, and compared the CSS variables each file uses with the ones `style.css` defines.

> **Status (UI/UX pass):** fixed: #1, #2, #6, #9, #10, #11, the mobile/desktop layout issues, the footer/nav link items in #16–#18, the accessibility items, the image-weight and unpinned-Lucide items, and the missing/undefined CSS variables. The academy and partnership forms now send the enquiry via WhatsApp, and the newsletter via email (#7: still no backend). **Still open:** #3 (admin passwords in client code), #4/#5 (localStorage-only blog CMS), the SEO metadata items (#12–#15), and the content/claims items. Those need decisions or a backend.

Severity: 🔴 Critical (site broken, or a security hole) · 🟠 High (a major feature is broken or leads are lost) · 🟡 Medium (SEO, accessibility, correctness) · ⚪ Low (cleanup)

---

## 🔴 Critical

### 1. `src/main.js` does not exist, but 7 pages load it
`index.html`, `about.html`, `services.html`, `faq.html`, `partnership.html`, `privacy-policy.html` and `blog.html` all include `<script type="module" src="/src/main.js">`. The repo has no `src/` folder, so the browser gets a 404. Everything that script was meant to do is missing:
- **Icons:** Lucide icons never render on 6 pages. `lucide.createIcons()` is only called on `academy`, `blog`, `blogeditor` and `admin1`, so every `<i data-lucide>` (ticker checkmarks, pillar icons, service icons, stars, the mobile-menu close "X" and others) shows as blank space.
- **Homepage hero (`index.html`):** the section is `400vh` tall and holds an empty `<canvas id="heroCanvas">`. Users scroll through about 4 screens of blank canvas. Only the first of the 5 hero messages is ever shown, and the 4 floating hero widgets never appear. The CSS hides them unless JS adds `.active`.
- **Stats counters (`index.html:256+`):** they stay at **"0+"**, **"0%"** and so on, so the page says "0+ Businesses Served".
- **FAQ page:** only the first answer is visible. The other 5 questions do nothing when clicked, because `.faq-answer` is `display:none` until JS adds `.active`.
- **About page testimonials (`about.html:178`):** only the first testimonial shows, and the slider dots do nothing.
- **Unused import:** the `three` import map is loaded on 7 pages for nothing.

### 2. The production build fails, so the site cannot be deployed
`npm run build` fails twice:
1. `vite.config.js:21` lists `blog/admin1.html` as an entry. That file does not exist (`Could not resolve entry module "blog/admin1.html"`).
2. After removing that entry, it fails again on `Rollup failed to resolve import "/src/main.js"`.

`vercel.json:3-4` also rewrites `/blog/admin1` to the same missing file.

### 3. Admin usernames and passwords are hard-coded in public JavaScript
- `blogeditor.html:297-298`: editor username and password, in plain text.
- `admin1.html:234-235`: "super admin" username and password, in plain text.

Anyone can open View Source, read them, and log in. The "authentication" is only a check in the browser plus `sessionStorage.setItem('..._auth','true')`. Running that one line in the console skips the login entirely. **Both passwords are now public in the git history and must be treated as compromised.** Change them anywhere else they are used.

### 4. The blog "CMS" only works inside one browser
Every write in `blogeditor.html` and `admin1.html` (submit, approve, edit, delete, "Delete ALL") goes to that browser's `localStorage`. `blog.html` reads from the visitor's own `localStorage`. As a result:
- An article written by the editor can only be seen by the admin if both use the **same browser on the same computer**.
- An approved article is visible **only in the admin's own browser**. Real visitors never see it.
- "Delete ALL Live Blogs" and the delete/edit actions on built-in articles change only the admin's view. The public site does not change.
- Clearing browser data erases every submitted article.

The blog publishing workflow needs a real backend (a headless CMS, Supabase/Firebase, Markdown files in the repo, or similar). `localStorage` cannot do this job.

### 5. Stored XSS once real storage is added (self-XSS today)
User-entered fields go into `innerHTML` with no escaping:
- `blog.html:605+` (title, excerpt, category, author, `coverImage` placed inside `style="...url('...')"`)
- `blog.html:702` (`alt="${article.title}"`, `src="${article.coverImage}"`)
- `blog.html:723` (the article `content` is inserted as raw HTML)
- The video URL goes into `<iframe src>` unchecked, so a `javascript:` URL would run
- `admin1.html:330+` and `blogeditor.html:506+` list rendering

Today the data only comes from your own `localStorage`. As soon as articles are stored in a shared backend (see #4), anyone who can submit an article can run scripts in every reader's browser.

---

## 🟠 High

### 6. No navigation on mobile or tablet for 4 pages
Below 1024px, `style.css` hides `.primary-nav` and `.header-actions` and shows the hamburger instead.
- `blog.html` has the drawer markup but no JS to open it.
- `academy.html` and `blogeditor.html` have a hamburger but no drawer and no JS.
- `admin1.html` has no hamburger at all.

On phones these pages have **no working menu**.

### 7. All lead-capture forms are fake, so enquiries are lost
- **Academy demo-class form** (`academy.html`, `#academyEnrollForm`): it shows "Demo Spot Reserved! Our career counselor will call you within 2 hours", then resets. **Nothing is sent anywhere.**
- **Partnership application form** (`partnership.html:145`): `action="#" method="POST"` posts to a static page. Vercel returns an error or reloads, and the data is lost.
- **Blog newsletter form:** it shows "Success! You're subscribed" and stores nothing.
- The **"#contact"** CTAs across the site (for example "Get Free SEO Audit" and "Request Website Proposal") lead to a banner with only a phone link and a mailto link. There is no form.

### 8. The admin edit form wipes built-in articles
`admin1.html` keeps a **stripped-down copy** of the 6 default articles: no `excerpt`, `content`, `takeaways`, `readTime`, `avatar` or `bgGradient`. When an admin edits a default article:
- The excerpt and content fields open **empty**. Both are `required`, so the admin has to retype the whole article from scratch.
- The saved copy has no `avatar` or `bgGradient`. On `blog.html` that card then shows **"undefined"** in the author avatar and has no background.

### 9. Mojibake (broken characters) on `partnership.html`
These are visible to users:
- Line 38, the announcement bar: `We Don't Just Market Businesses â€” We Build…`
- Line 269, the mobile menu close button: `âœ•`

The script comments are also corrupted (`â”€â”€`). This is a UTF-8 file that was read as Windows-1252 and saved again. `fix_symbols.ps1` uses `Get-Content` without `-Encoding UTF8`, which does exactly that in Windows PowerShell 5.1.

### 10. Broken HTML structure
Found by `html-validate`:
- `<main>` is **never closed** in `index.html:116`, `about.html:106`, `faq.html:106` and `services.html:106`. The footer, floating buttons and mobile drawer all end up inside `<main>`.
- `services.html:407`: stray extra `</section>`.
- `privacy-policy.html:137`: `</main>` closes before the CTA banner, so the banner sits between `</main>` and `<footer>`.

### 11. Partnership modal particle effect never shows and wastes CPU
`partnership.html:374+`: the canvas is sized from `offsetWidth/Height` when the page loads. The modal is hidden then, so the size is 0×0 and the particles never appear. The size only updates on window resize. The `requestAnimationFrame` loop still runs **forever**, even with the modal closed, which drains battery on mobile.

---

## 🟡 Medium: SEO

### 12. Six pages share the same canonical URL, and that URL does not exist
`index`, `about`, `services`, `faq`, `partnership` and `privacy-policy` all declare
`<link rel="canonical" href="https://futureedgedigitalmarketing.com/digital-marketing-services-uttar-pradesh">`.
That tells Google all six pages are duplicates of one URL, which itself 404s. Google may then drop the About, Services, FAQ, Partnership and Privacy pages from search.

### 13. Duplicate titles and meta descriptions
`about`, `services`, `faq`, `partnership` and `privacy-policy` copy the homepage `<title>`, meta description, og:title, og:description and `og:url`.

### 14. Missing `<h1>` on 5 public pages
`about`, `services`, `faq`, `partnership` and `privacy-policy` have no `<h1>`. `blog.html` has two (the second one is inside the modal).

### 15. Other SEO gaps
- `og:image` is relative (`/hero_team.png`). Facebook, LinkedIn and WhatsApp need an absolute URL.
- There is no `robots.txt`, `sitemap.xml` or favicon (`<link rel="icon">`) anywhere. There is also no LocalBusiness / Organization structured data (JSON-LD). For an agency that sells SEO, this hurts its credibility.
- Canonical and `og:url` formats are inconsistent: `/academy` vs `/academy.html`, `/blog.html`, and so on. `cleanUrls: true` serves the extensionless form, so `.html` canonicals point at redirecting URLs.
- Blog articles open in a modal and have no URL of their own. They cannot be indexed or linked to. "Copy Link" and the WhatsApp/LinkedIn share buttons share the blog listing page, not the article.
- The admin pages (`admin1.html`, `blogeditor.html`) have no `<meta name="robots" content="noindex">`, and `academy.html:472` links to the "Blog Editor Portal" from the public footer.
- The `<meta name="keywords">` tag is ignored by Google. It does no harm, but it does no good either.

---

## 🟡 Medium: Broken links and navigation

### 16. Dead links in the footer
On `index`, `about`, `services`, `faq`, `partnership` and `privacy-policy`:
- "Privacy Policy" links to `#privacy-policy`, which is not on those pages. It should link to `privacy-policy.html`.
- "Terms & Conditions", "Refund Policy", "Disclaimer & Cookies" and "Sitemap" all go to `href="#"`. None of these pages exist.

### 17. Other broken or wrong links
- `partnership.html`: "Contact Us" and the mobile-menu "Contact" / "Get Free Proposal" go to `#contact`, which is not on that page.
- The logo links to `href="#"` on `index`, `about`, `services`, `faq`, `partnership` and `privacy-policy`. It should go to `index.html`.
- The "View Our Portfolio" button on the homepage goes to `about.html#portfolio`, which is the testimonials section. There is no portfolio.
- `blog.html:149`: the featured card is hard-coded to `openArticleModal('post-1')`. If the admin deletes post-1, the click does nothing. If the admin edits it, the featured card still shows the old title and text.

### 18. The navigation is different on every page
- Most pages have 9 items plus a mega-menu.
- `academy.html` has 7 items and no mega-menu, Founder or Industries.
- `blogeditor.html` and `admin1.html` have 5 items, labeled "Blog Page".

Only some pages mark the current page with the `active` class. `remove_active.ps1` was written to strip it.

---

## 🟡 Medium: Accessibility

- Modals (blog reader, admin edit, partnership form) cannot be closed with **Escape**, do not trap focus, and do not return focus when closed.
- The admin and blog modals keep `aria-hidden="true"` on a container that has focusable inputs and buttons (`html-validate: hidden-focusable`). The admin modal never switches it to `false`.
- The FAQ and academy accordion buttons have no `aria-expanded` or `aria-controls`.
- Blog cards are clickable `<div>`s (`card.onclick`), so keyboard users cannot reach them.
- `about.html` (hero image) and `partnership.html` (hero image) have `<img>` tags without `width`/`height`, which causes layout shift.
- Undefined CSS variable `--color-accent-yellow` is used 15 times in inline styles (from `fix_symbols.ps1`). The checkmark icons fall back to inheriting their color.

---

## 🟡 Medium: Content and trust problems
These are not code bugs, but visitors and Google will notice them, and some are legal risks.

- **The founder's name differs between pages.** It is "Vivek Singh Bhadauriya" on `about.html`, but "Vivek Sharma" on `academy`, `blog`, `blogeditor` and `admin1`.
- **Stats contradict each other:**
  - Students trained: **500+** (academy) vs **1,000+** (home, about, services). The academy mentor bio also says "500+".
  - "98%" is the **Placement Rate** on academy but the **Client Satisfaction Rate** on home.
- **Claims that need proof or should be removed:**
  - "ISO 9001:2015 Certified"
  - "Guaranteed Internship" and "100% Placement" (an Indian consumer-protection risk for education ads)
  - "Uttar Pradesh's #1 Agency & Academy"
  - "4.9★ Google Review Rating", "15+ Global Certifications"
  - "patient enquiries increased by over 200%"
- **Blog authors may not be real staff.** The default posts are bylined to staff who may not exist: Priya Verma, Amit Patel, Neha Gupta, Rohan Singh. Confirm they are real team members.
- **Outdated dates and names.** Blog post dates (Jul–Aug 2026) and "ChatGPT 4" in the curriculum will look stale.
- **`services.html:358`:** Service 11 (AI & Marketing Automation) is the only card missing its "Best for" line and CTA button.
- **The privacy policy is thin and inaccurate:**
  - It mentions Google Analytics and Meta tracking, which the site does not load.
  - It has no data retention, user rights, grievance officer, or India DPDP Act 2023 sections.
  - It does not disclose the `localStorage` use.
  - It has no cookie-consent mechanism.

---

## ⚪ Low: Performance

- `hero_team.png` (790 KB) and `partnership_ai_hero.png` (785 KB) are **actually JPEG files with a `.png` extension**, at 1024×1024. They should be compressed to WebP/AVIF at the size they are displayed.
- `vivekprofile.jpg` is 1856×2272 (198 KB) but is shown as a small card.
- `logo.png` is 82 KB for a 36px icon.
- No image uses `loading="lazy"`.
- `https://unpkg.com/lucide@latest` is **unpinned** on every page and has no SRI. A future major release could break every icon overnight. Pin a version, for example `lucide@0.x.y`.
- Google Fonts loads Plus Jakarta Sans weight 300, which nothing uses.
- `style.css` is 91 KB and 4,392 lines with heavy duplication:
  - `.svc3d-card` is redefined 9 times, `.blog-card` 6 times, and `.nav-link`, `.float-btn`, `.svc3d-cta` and `.module-visual-card` 4 times each.
  - There are 20+ overlapping media-query blocks with different breakpoints (`767/768`, `992`, `1023/1024`).
- Undefined CSS variables silently break styles: `--primary-gold`, `--primary-blue` and `--transition-medium` are used in `style.css` but never defined, so those borders, backgrounds, gradients and transitions do nothing.

---

## ⚪ Low: Code and repo hygiene

- `replace_emojis.js` uses `require()`, but `package.json` sets `"type": "module"`, so the script crashes (`ReferenceError: require is not defined`). It also injects the unpinned `lucide@latest`.
- `fix_symbols.ps1` and `remove_active.ps1` are one-off Windows scripts that rewrite every HTML file. They are committed to the repo root, and `fix_symbols.ps1` likely caused the mojibake in #9.
- The repo has no `.gitignore` (so `node_modules/` and `dist/` could get committed), no `package-lock.json` (so builds are not reproducible), and no `README`.
- `three` is a dependency in `package.json` but nothing uses it.
- `vite.config.js` has `sourcemap: true` for production, which publishes source maps.
- `vercel.json`: the explicit rewrites are redundant with `cleanUrls: true`. Two of them point at the missing `blog/admin1.html`.
- About 300 lines of header, footer, mobile drawer and inline JS are copy-pasted into every page and have already drifted apart (see #6 and #18). They should be shared partials or a shared script.
- `blogeditor.html:523`: `deleteCustomPost()` is dead code and uses the wrong storage key.
- `admin1.html`: editing a "legacy" (`future_edge_custom_blogs`) article does nothing silently. The save handler only looks in pending and approved.
- `admin1.html`: when logged out, `lucide.createIcons()` is never called, so the login-screen icons are blank.
- `blog.html:758`: `navigator.clipboard.writeText` has no error handling and always shows "copied", even on HTTP or when permission is denied.
- The "Read time" field is free text, and the article search covers only title, excerpt and category, not the content.

---

## Suggested fix order
1. **Rotate both admin passwords now.** Then take `blogeditor.html` and `admin1.html` offline, or put them behind real server-side auth.
2. **Recreate `src/main.js`**, or remove its references and move the needed logic (icons, FAQ, slider, counters, hero) into a shared script. Remove the `blog/admin1.html` entry. Confirm `npm run build` passes.
3. **Add a shared mobile-nav script to every page**, and close the `<main>` tags.
4. **Connect the forms to a real endpoint** (Formspree, Web3Forms, a Google Apps Script, or a Supabase/Vercel function) so leads are not lost.
5. **Fix the canonicals, titles, h1s, footer links and `og:image`.** Add a favicon, `robots.txt` and `sitemap.xml`.
6. **Decide on a real blog backend**, and escape all rendered fields.
7. **Clean up the content** (founder name, stats, claims), then the image, CSS and hygiene items.
