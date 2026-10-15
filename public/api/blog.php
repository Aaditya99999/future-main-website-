<?php
/*
 * Future Edge blog API.
 *
 *   GET  blog.php?action=list         public: approved posts + changes to built-in posts
 *   GET  blog.php?action=me           who is logged in (and whether setup is done)
 *   GET  blog.php?action=submissions  editor/admin: pending + approved posts
 *   POST blog.php?action=login        {username, password, portal: "editor"|"admin"}
 *   POST blog.php?action=logout
 *   POST blog.php?action=submit       editor/admin: new post, waits for approval
 *   POST blog.php?action=approve      admin: {id}
 *   POST blog.php?action=decline      admin: {id}
 *   POST blog.php?action=update       admin: {id, post, approve?, isDefault?}
 *   POST blog.php?action=delete       admin: {id, isDefault}
 *   POST blog.php?action=delete_all   admin
 *   POST blog.php?action=restore_defaults  admin
 */

declare(strict_types=1);
require __DIR__ . '/lib.php';

$action = (string) ($_GET['action'] ?? '');

switch ($action) {
    case 'list':
        $blog = read_data('blog', blog_default());
        respond([
            'ok' => true,
            'approved' => $blog['approved'] ?? [],
            'deletedDefaultIds' => $blog['deletedDefaultIds'] ?? [],
            'editedDefaults' => (object) ($blog['editedDefaults'] ?? []),
        ]);

    case 'me':
        respond(['ok' => true, 'configured' => is_configured(), 'user' => current_user()]);

    case 'submissions':
        require_role(['editor', 'admin']);
        $blog = read_data('blog', blog_default());
        respond(['ok' => true, 'pending' => $blog['pending'] ?? [], 'approved' => $blog['approved'] ?? [],
            'deletedDefaultIds' => $blog['deletedDefaultIds'] ?? [], 'editedDefaults' => (object) ($blog['editedDefaults'] ?? [])]);

    case 'login':
        require_same_origin_post();
        if (!is_configured()) {
            fail(503, 'Admin accounts have not been set up yet. Open api/setup.php first.');
        }
        $wait = login_locked_for();
        if ($wait > 0) {
            fail(429, 'Too many failed attempts. Try again in ' . ceil($wait / 60) . ' minutes.');
        }
        $in = json_input();
        $username = trim((string) ($in['username'] ?? ''));
        $password = (string) ($in['password'] ?? '');
        $portal = ($in['portal'] ?? '') === 'admin' ? 'admin' : 'editor';

        $account = null;
        foreach (users() as $user) {
            if (hash_equals((string) $user['username'], $username)) {
                $account = $user;
            }
        }
        // Always run password_verify so timing does not reveal valid usernames.
        $valid = password_verify($password, $account['hash'] ?? password_hash('not-a-real-account', PASSWORD_DEFAULT));
        $allowed = $account && ($portal === 'editor' || $account['role'] === 'admin');
        record_login_attempt($valid && $allowed);
        if (!$valid || !$allowed) {
            fail(401, 'Invalid username or password.');
        }
        start_session();
        session_regenerate_id(true);
        $_SESSION['user'] = ['username' => $account['username'], 'role' => $account['role'], 'name' => $account['name'] ?? $account['username']];
        respond(['ok' => true, 'user' => $_SESSION['user']]);

    case 'logout':
        require_same_origin_post();
        start_session();
        $_SESSION = [];
        session_destroy();
        respond(['ok' => true]);

    case 'submit':
        require_same_origin_post();
        require_role(['editor', 'admin']);
        $post = clean_post(json_input());
        $post['id'] = 'post-' . bin2hex(random_bytes(6));
        $post['date'] = date('M d, Y');
        $post['status'] = 'pending';
        $post['bgGradient'] = 'linear-gradient(135deg, #0F2042 0%, #1A325D 100%)';
        update_data('blog', blog_default(), function (array $blog) use ($post): array {
            array_unshift($blog['pending'], $post);
            return $blog;
        });
        respond(['ok' => true, 'post' => $post]);

    case 'approve':
        require_same_origin_post();
        require_role(['admin']);
        $id = (string) (json_input()['id'] ?? '');
        $found = false;
        update_data('blog', blog_default(), function (array $blog) use ($id, &$found): array {
            foreach ($blog['pending'] as $i => $post) {
                if ($post['id'] === $id) {
                    $post['status'] = 'approved';
                    array_unshift($blog['approved'], $post);
                    array_splice($blog['pending'], $i, 1);
                    $found = true;
                    break;
                }
            }
            return $blog;
        });
        $found ? respond(['ok' => true]) : fail(404, 'That submission no longer exists.');

    case 'decline':
        require_same_origin_post();
        require_role(['admin']);
        $id = (string) (json_input()['id'] ?? '');
        update_data('blog', blog_default(), function (array $blog) use ($id): array {
            $blog['pending'] = array_values(array_filter($blog['pending'], fn ($p) => $p['id'] !== $id));
            return $blog;
        });
        respond(['ok' => true]);

    case 'update':
        require_same_origin_post();
        require_role(['admin']);
        $in = json_input();
        $id = (string) ($in['id'] ?? '');
        $fields = is_array($in['post'] ?? null) ? $in['post'] : [];
        $approve = !empty($in['approve']);

        if (!empty($in['isDefault'])) {
            // Built-in article: store the full edited copy as an override.
            $base = is_array($in['original'] ?? null) ? $in['original'] : [];
            $post = clean_post($fields, $base);
            $post['id'] = $id;
            $post['date'] = clean_text($base['date'] ?? date('M d, Y'), 30);
            $post['bgGradient'] = clean_text($base['bgGradient'] ?? '', 120);
            update_data('blog', blog_default(), function (array $blog) use ($id, $post): array {
                $edited = (array) ($blog['editedDefaults'] ?? []);
                $edited[$id] = $post;
                $blog['editedDefaults'] = $edited;
                return $blog;
            });
            respond(['ok' => true]);
        }

        $found = false;
        update_data('blog', blog_default(), function (array $blog) use ($id, $fields, $approve, &$found): array {
            foreach (['pending', 'approved'] as $list) {
                foreach ($blog[$list] as $i => $existing) {
                    if ($existing['id'] !== $id) {
                        continue;
                    }
                    $post = clean_post($fields, $existing);
                    $found = true;
                    if ($list === 'pending' && $approve) {
                        $post['status'] = 'approved';
                        array_splice($blog['pending'], $i, 1);
                        array_unshift($blog['approved'], $post);
                    } else {
                        $blog[$list][$i] = $post;
                    }
                    return $blog;
                }
            }
            return $blog;
        });
        $found ? respond(['ok' => true]) : fail(404, 'That article no longer exists.');

    case 'delete':
        require_same_origin_post();
        require_role(['admin']);
        $in = json_input();
        $id = (string) ($in['id'] ?? '');
        $isDefault = !empty($in['isDefault']);
        update_data('blog', blog_default(), function (array $blog) use ($id, $isDefault): array {
            if ($isDefault) {
                if (!in_array($id, $blog['deletedDefaultIds'], true)) {
                    $blog['deletedDefaultIds'][] = $id;
                }
            } else {
                $blog['approved'] = array_values(array_filter($blog['approved'], fn ($p) => $p['id'] !== $id));
            }
            return $blog;
        });
        respond(['ok' => true]);

    case 'delete_all':
        require_same_origin_post();
        require_role(['admin']);
        $ids = json_input()['defaultIds'] ?? [];
        $ids = array_values(array_filter(is_array($ids) ? $ids : [], 'is_string'));
        update_data('blog', blog_default(), function (array $blog) use ($ids): array {
            $blog['approved'] = [];
            $blog['deletedDefaultIds'] = $ids;
            return $blog;
        });
        respond(['ok' => true]);

    case 'restore_defaults':
        require_same_origin_post();
        require_role(['admin']);
        update_data('blog', blog_default(), function (array $blog): array {
            $blog['deletedDefaultIds'] = [];
            $blog['editedDefaults'] = (object) [];
            return $blog;
        });
        respond(['ok' => true]);

    default:
        fail(400, 'Unknown action.');
}
