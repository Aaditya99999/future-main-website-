<?php
/*
 * One-time setup: creates the admin and editor accounts.
 * Works only while no accounts exist. To start over, delete
 * api/data/users.php in Hostinger's File Manager and open this page again.
 */

declare(strict_types=1);
require __DIR__ . '/lib.php';

start_session();
if (empty($_SESSION['setup_token'])) {
    $_SESSION['setup_token'] = bin2hex(random_bytes(16));
}

$errors = [];
$done = false;

if (!is_configured() && ($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
    if (!hash_equals($_SESSION['setup_token'], (string) ($_POST['token'] ?? ''))) {
        $errors[] = 'The form expired. Please try again.';
    }
    $adminName = clean_text($_POST['admin_name'] ?? '', 80);
    $adminUser = clean_text($_POST['admin_user'] ?? '', 40);
    $adminPass = (string) ($_POST['admin_pass'] ?? '');
    $editorUser = clean_text($_POST['editor_user'] ?? '', 40);
    $editorPass = (string) ($_POST['editor_pass'] ?? '');

    if ($adminName === '' || $adminUser === '') {
        $errors[] = 'Enter the admin name and username.';
    }
    if (strlen($adminPass) < 10) {
        $errors[] = 'The admin password must be at least 10 characters.';
    }
    if ($adminPass !== (string) ($_POST['admin_pass2'] ?? '')) {
        $errors[] = 'The two admin passwords do not match.';
    }
    if ($editorUser !== '') {
        if (strlen($editorPass) < 10) {
            $errors[] = 'The editor password must be at least 10 characters.';
        }
        if ($editorUser === $adminUser) {
            $errors[] = 'The editor needs a different username from the admin.';
        }
    }

    if (!$errors) {
        $accounts = [['username' => $adminUser, 'name' => $adminName, 'role' => 'admin', 'hash' => password_hash($adminPass, PASSWORD_DEFAULT)]];
        if ($editorUser !== '') {
            $accounts[] = ['username' => $editorUser, 'name' => $editorUser, 'role' => 'editor', 'hash' => password_hash($editorPass, PASSWORD_DEFAULT)];
        }
        update_data('users', [], function (array $existing) use ($accounts): array {
            // Guard against a second, simultaneous setup request.
            return $existing ?: $accounts;
        });
        $done = true;
    }
}

$configured = is_configured();
$h = fn ($v) => htmlspecialchars((string) $v, ENT_QUOTES, 'UTF-8');
header('X-Robots-Tag: noindex, nofollow');
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="robots" content="noindex, nofollow" />
  <title>Blog Admin Setup | Future Edge</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #FAF7F2; color: #1E293B; margin: 0; padding: 32px 16px; }
    main { max-width: 520px; margin: 0 auto; background: #fff; border-radius: 16px; padding: 32px; box-shadow: 0 12px 24px rgba(0,0,0,.06); }
    h1 { color: #1A325D; font-size: 1.5rem; margin-top: 0; }
    fieldset { border: 1px solid #E5E7EB; border-radius: 12px; padding: 16px 18px; margin: 18px 0; }
    legend { font-weight: 700; color: #1A325D; padding: 0 6px; }
    label { display: block; font-weight: 600; font-size: .9rem; margin: 12px 0 4px; }
    input { width: 100%; box-sizing: border-box; padding: 11px 12px; border: 1px solid #CBD5E1; border-radius: 8px; font-size: 16px; }
    button { width: 100%; margin-top: 8px; padding: 14px; border: 2px solid #1A325D; border-radius: 999px; background: #FFC907; color: #1A325D; font-weight: 700; font-size: 1rem; cursor: pointer; }
    .note { font-size: .88rem; color: #475569; }
    .error { background: #FEE2E2; color: #991B1B; padding: 12px 14px; border-radius: 8px; margin-bottom: 8px; }
    .ok { background: #DCFCE7; color: #166534; padding: 14px; border-radius: 8px; }
    a { color: #1A325D; font-weight: 700; }
  </style>
</head>
<body>
<main>
  <h1>Blog admin setup</h1>
  <?php if ($done): ?>
    <p class="ok">Accounts created. This setup page is now switched off.</p>
    <p>Log in at <a href="../admin1.html">admin1.html</a> (approve and manage posts) or <a href="../blogeditor.html">blogeditor.html</a> (write posts).</p>
  <?php elseif ($configured): ?>
    <p class="ok">Setup is already complete, so this page is switched off.</p>
    <p class="note">Forgot a password? In Hostinger's File Manager, delete <code>api/data/users.php</code>, then open this page again to create new accounts. Blog posts are not affected.</p>
  <?php else: ?>
    <p class="note">Create the accounts for the blog. Passwords are stored only as secure hashes. Do this right after uploading the site: the first person to submit this form becomes the admin.</p>
    <?php foreach ($errors as $error): ?><div class="error"><?= $h($error) ?></div><?php endforeach; ?>
    <form method="post" autocomplete="off">
      <input type="hidden" name="token" value="<?= $h($_SESSION['setup_token']) ?>" />
      <fieldset>
        <legend>Admin (approves, edits, deletes posts)</legend>
        <label for="admin_name">Display name</label>
        <input id="admin_name" name="admin_name" required value="<?= $h($_POST['admin_name'] ?? 'Vivek Singh Bhadauriya') ?>" />
        <label for="admin_user">Username</label>
        <input id="admin_user" name="admin_user" required value="<?= $h($_POST['admin_user'] ?? '') ?>" />
        <label for="admin_pass">Password (10+ characters)</label>
        <input id="admin_pass" name="admin_pass" type="password" minlength="10" required autocomplete="new-password" />
        <label for="admin_pass2">Repeat password</label>
        <input id="admin_pass2" name="admin_pass2" type="password" minlength="10" required autocomplete="new-password" />
      </fieldset>
      <fieldset>
        <legend>Editor (writes posts for approval) — optional</legend>
        <label for="editor_user">Username</label>
        <input id="editor_user" name="editor_user" value="<?= $h($_POST['editor_user'] ?? '') ?>" />
        <label for="editor_pass">Password (10+ characters)</label>
        <input id="editor_pass" name="editor_pass" type="password" autocomplete="new-password" />
      </fieldset>
      <button type="submit">Create accounts</button>
    </form>
  <?php endif; ?>
</main>
</body>
</html>
