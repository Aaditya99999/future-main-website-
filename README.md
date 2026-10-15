# Future Edge Digital Marketing — website

Static marketing site (HTML + CSS + plain JavaScript) with a small PHP backend for the blog admin.

## Project layout

| Path | What it is |
| --- | --- |
| `*.html` | The pages. `admin1.html` (approve/manage posts) and `blogeditor.html` (write posts) are the blog portals. |
| `style.css` | All styles. The last section, "UI / UX FIX LAYER", overrides older rules. |
| `src/main.js` | Shared script: icons, mobile menu, home hero, counters, timeline, FAQ, testimonials. |
| `src/default-posts.js` | The built-in blog articles. |
| `src/admin-api.js` | Helper used by the two blog portals to talk to the API. |
| `public/api/` | PHP blog backend (`blog.php`, `setup.php`). Posts are stored in `api/data/` on the server. |
| `public/` | Files copied into the build unchanged: `.htaccess`, `robots.txt`, `sitemap.xml`, icons, social image. |

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000 (no PHP: blog shows built-in articles, portals can't log in)
```

To test the blog portals locally with PHP:

```bash
npm run build
php -S localhost:8000 -t dist
```

## Deploy to Hostinger

1. `npm run build`, then zip the **contents** of `dist/` (not the folder itself).
2. In hPanel → File Manager → `public_html`, upload the zip and extract it there.
3. Open `https://your-domain/api/setup.php` **immediately** and create the admin (and optional editor) account.
   The page switches itself off once accounts exist.
4. Log in at `/admin1.html` (admin) or `/blogeditor.html` (editor).

Forgot a password? Delete `public_html/api/data/users.php` in File Manager and open `api/setup.php` again.
Blog posts are kept in `api/data/blog.php` — include that file when backing up.

## Forms

The demo-class and partnership forms open WhatsApp with the visitor's details filled in; the newsletter form opens
an email to the business inbox. Nothing is stored on the server.
