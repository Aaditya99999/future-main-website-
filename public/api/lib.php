<?php
/*
 * Future Edge blog backend — shared helpers.
 *
 * Data lives in api/data/*.php files. Each file starts with "<?php exit; ?>"
 * so that even if the server ignores .htaccess, requesting the file over the
 * web returns nothing instead of the stored JSON.
 */

declare(strict_types=1);

const DATA_DIR = __DIR__ . '/data';
const DATA_GUARD = "<?php exit; ?>\n";
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 900;
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

// ---------------------------------------------------------------------------
// Storage
// ---------------------------------------------------------------------------

function data_path(string $name): string
{
    return DATA_DIR . '/' . $name . '.php';
}

function read_data(string $name, array $default): array
{
    $path = data_path($name);
    if (!is_file($path)) {
        return $default;
    }
    $raw = (string) file_get_contents($path);
    if (strncmp($raw, DATA_GUARD, strlen(DATA_GUARD)) === 0) {
        $raw = substr($raw, strlen(DATA_GUARD));
    }
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : $default;
}

/**
 * Read-modify-write a data file under an exclusive lock so two admins
 * saving at the same moment cannot overwrite each other.
 */
function update_data(string $name, array $default, callable $change): array
{
    if (!is_dir(DATA_DIR) && !mkdir(DATA_DIR, 0750, true) && !is_dir(DATA_DIR)) {
        fail(500, 'Could not create the data folder. Check folder permissions on the server.');
    }
    $handle = fopen(data_path($name), 'c+');
    if ($handle === false) {
        fail(500, 'Could not open the data file. Check folder permissions on the server.');
    }
    flock($handle, LOCK_EX);
    $raw = stream_get_contents($handle);
    if (strncmp((string) $raw, DATA_GUARD, strlen(DATA_GUARD)) === 0) {
        $raw = substr($raw, strlen(DATA_GUARD));
    }
    $current = json_decode((string) $raw, true);
    $current = is_array($current) ? $current : $default;

    $updated = $change($current);

    ftruncate($handle, 0);
    rewind($handle);
    fwrite($handle, DATA_GUARD . json_encode($updated, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
    fflush($handle);
    flock($handle, LOCK_UN);
    fclose($handle);
    return $updated;
}

function blog_default(): array
{
    return ['pending' => [], 'approved' => [], 'deletedDefaultIds' => [], 'editedDefaults' => (object) []];
}

// ---------------------------------------------------------------------------
// HTTP helpers
// ---------------------------------------------------------------------------

function respond(array $body, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Content-Type-Options: nosniff');
    echo json_encode($body, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function fail(int $status, string $message): void
{
    respond(['ok' => false, 'error' => $message], $status);
}

function json_input(): array
{
    $data = json_decode((string) file_get_contents('php://input'), true);
    return is_array($data) ? $data : [];
}

/** State-changing requests must come from our own pages (blocks CSRF). */
function require_same_origin_post(): void
{
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
        fail(405, 'Use POST for this action.');
    }
    if (($_SERVER['HTTP_X_REQUESTED_WITH'] ?? '') !== 'FutureEdge') {
        fail(403, 'Request rejected.');
    }
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origin !== '') {
        $port = parse_url($origin, PHP_URL_PORT);
        $originHost = parse_url($origin, PHP_URL_HOST) . ($port ? ":{$port}" : '');
        if ($originHost !== ($_SERVER['HTTP_HOST'] ?? '')) {
            fail(403, 'Request rejected.');
        }
    }
}

// ---------------------------------------------------------------------------
// Sessions & auth
// ---------------------------------------------------------------------------

function start_session(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }
    $secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
    session_name('fe_admin');
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => $secure,
        'httponly' => true,
        'samesite' => 'Strict',
    ]);
    session_start();
}

function users(): array
{
    return read_data('users', []);
}

function is_configured(): bool
{
    return count(users()) > 0;
}

function current_user(): ?array
{
    start_session();
    $user = $_SESSION['user'] ?? null;
    return is_array($user) ? $user : null;
}

/** @param string[] $roles */
function require_role(array $roles): array
{
    $user = current_user();
    if ($user === null) {
        fail(401, 'Please log in.');
    }
    if (!in_array($user['role'], $roles, true)) {
        fail(403, 'Your account cannot do that.');
    }
    return $user;
}

function client_ip(): string
{
    return (string) ($_SERVER['REMOTE_ADDR'] ?? 'unknown');
}

function login_locked_for(): int
{
    $attempts = read_data('attempts', []);
    $entry = $attempts[client_ip()] ?? null;
    if (!$entry || ($entry['until'] ?? 0) <= time()) {
        return 0;
    }
    return (int) $entry['until'] - time();
}

function record_login_attempt(bool $success): void
{
    update_data('attempts', [], function (array $attempts) use ($success): array {
        $ip = client_ip();
        // Drop stale entries so the file does not grow forever.
        foreach ($attempts as $key => $entry) {
            if (($entry['last'] ?? 0) < time() - 86400) {
                unset($attempts[$key]);
            }
        }
        if ($success) {
            unset($attempts[$ip]);
            return $attempts;
        }
        $entry = $attempts[$ip] ?? ['count' => 0, 'until' => 0];
        $entry['count'] = ($entry['until'] ?? 0) > 0 && $entry['until'] <= time() ? 1 : $entry['count'] + 1;
        $entry['until'] = $entry['count'] >= MAX_LOGIN_ATTEMPTS ? time() + LOCKOUT_SECONDS : 0;
        $entry['last'] = time();
        $attempts[$ip] = $entry;
        return $attempts;
    });
}

// ---------------------------------------------------------------------------
// Input cleaning
// ---------------------------------------------------------------------------

function clean_text($value, int $max): string
{
    $text = trim(strip_tags((string) $value));
    $text = preg_replace('/\s+/u', ' ', $text) ?? '';
    return mb_substr($text, 0, $max);
}

function clean_url($value, bool $allowDataImage = false): string
{
    $url = trim((string) $value);
    if ($url === '') {
        return '';
    }
    if ($allowDataImage && preg_match('#^data:image/(png|jpe?g|webp|gif);base64,[A-Za-z0-9+/=\s]+$#', $url)) {
        if (strlen($url) > MAX_IMAGE_BYTES * 4 / 3 + 100) {
            fail(413, 'The cover image is too large. Please use an image under 2 MB.');
        }
        return $url;
    }
    if (preg_match('#^https?://[^\s"\'<>]+$#i', $url)) {
        return $url;
    }
    return '';
}

/**
 * Allow-list HTML sanitizer for article bodies: keeps formatting tags,
 * drops scripts, event handlers and javascript: links.
 */
function clean_html($html): string
{
    $html = (string) $html;
    if (trim($html) === '') {
        return '';
    }
    $allowed = [
        'p' => [], 'br' => [], 'h2' => [], 'h3' => [], 'h4' => [], 'ul' => [], 'ol' => [], 'li' => [],
        'strong' => [], 'b' => [], 'em' => [], 'i' => [], 'u' => [], 'blockquote' => [], 'code' => [],
        'pre' => [], 'hr' => [], 'span' => [], 'div' => [], 'table' => [], 'thead' => [], 'tbody' => [],
        'tr' => [], 'th' => [], 'td' => [], 'a' => ['href', 'title', 'target'], 'img' => ['src', 'alt'],
    ];
    $dropWithContent = ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'textarea', 'select', 'svg', 'math', 'link', 'meta'];

    $doc = new DOMDocument();
    libxml_use_internal_errors(true);
    $doc->loadHTML('<?xml encoding="utf-8"?><div id="root">' . $html . '</div>', LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
    libxml_clear_errors();
    $root = $doc->getElementById('root');
    if ($root === null) {
        return htmlspecialchars(strip_tags($html), ENT_QUOTES, 'UTF-8');
    }

    $walk = function (DOMNode $node) use (&$walk, $allowed, $dropWithContent): void {
        foreach (iterator_to_array($node->childNodes) as $child) {
            if ($child instanceof DOMComment) {
                $node->removeChild($child);
                continue;
            }
            if (!$child instanceof DOMElement) {
                continue;
            }
            $tag = strtolower($child->tagName);
            if (in_array($tag, $dropWithContent, true)) {
                $node->removeChild($child);
                continue;
            }
            $walk($child);
            if (!array_key_exists($tag, $allowed)) {
                // Unknown tag: keep its text/children, drop the tag itself.
                while ($child->firstChild) {
                    $node->insertBefore($child->firstChild, $child);
                }
                $node->removeChild($child);
                continue;
            }
            foreach (iterator_to_array($child->attributes) as $attr) {
                $name = strtolower($attr->name);
                $value = trim($attr->value);
                $keep = in_array($name, $allowed[$tag], true) || $name === 'class'
                    || ($name === 'style' && !preg_match('/url\s*\(|expression|javascript:|@import/i', $value));
                if ($keep && in_array($name, ['href', 'src'], true)) {
                    $ok = $name === 'href'
                        ? preg_match('#^(https?://|mailto:|tel:|/|\#|[a-z0-9._-]+\.html)#i', $value)
                        : preg_match('#^(https?://|/|data:image/(png|jpe?g|webp|gif);base64,)#i', $value);
                    $keep = (bool) $ok;
                }
                if (!$keep) {
                    $child->removeAttribute($attr->name);
                }
            }
            if ($tag === 'a' && $child->getAttribute('target') === '_blank') {
                $child->setAttribute('rel', 'noopener noreferrer');
            }
        }
    };
    $walk($root);

    $out = '';
    foreach ($root->childNodes as $child) {
        $out .= $doc->saveHTML($child);
    }
    return $out;
}

/** Build a clean article record from submitted fields. */
function clean_post(array $in, array $base = []): array
{
    $post = $base;
    $post['title'] = clean_text($in['title'] ?? ($base['title'] ?? ''), 200);
    $post['category'] = clean_text($in['category'] ?? ($base['category'] ?? ''), 60);
    $post['readTime'] = clean_text($in['readTime'] ?? ($base['readTime'] ?? '5 min read'), 30);
    $post['author'] = clean_text($in['author'] ?? ($base['author'] ?? ''), 80);
    $post['authorRole'] = clean_text($in['authorRole'] ?? ($base['authorRole'] ?? ''), 80);
    $post['excerpt'] = clean_text($in['excerpt'] ?? ($base['excerpt'] ?? ''), 600);
    $post['content'] = clean_html($in['content'] ?? ($base['content'] ?? ''));
    $post['coverImage'] = clean_url($in['coverImage'] ?? ($base['coverImage'] ?? ''), true);
    $post['videoUrl'] = clean_url($in['videoUrl'] ?? ($base['videoUrl'] ?? ''));

    $takeaways = $in['takeaways'] ?? ($base['takeaways'] ?? []);
    $takeaways = is_array($takeaways) ? $takeaways : [];
    $post['takeaways'] = array_values(array_filter(array_map(fn ($t) => clean_text($t, 300), array_slice($takeaways, 0, 10))));

    $words = preg_split('/\s+/', trim($post['author'])) ?: [];
    $post['avatar'] = mb_strtoupper(mb_substr(implode('', array_map(fn ($w) => mb_substr($w, 0, 1), $words)), 0, 2)) ?: 'FE';

    foreach (['title', 'category', 'author', 'excerpt', 'content'] as $required) {
        if ($post[$required] === '') {
            fail(422, "Please fill in the {$required} field.");
        }
    }
    return $post;
}
