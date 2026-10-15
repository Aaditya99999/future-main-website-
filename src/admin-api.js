/* Small client for the blog API (api/blog.php), shared by blogeditor.html and admin1.html. */
(function () {
  'use strict';

  const endpoint = 'api/blog.php';

  async function call(action, { method = 'GET', body } = {}) {
    let res;
    try {
      res = await fetch(`${endpoint}?action=${encodeURIComponent(action)}`, {
        method,
        credentials: 'same-origin',
        headers: method === 'POST'
          ? { 'Content-Type': 'application/json', 'X-Requested-With': 'FutureEdge' }
          : { Accept: 'application/json' },
        body: method === 'POST' ? JSON.stringify(body || {}) : undefined
      });
    } catch (e) {
      throw new Error('Cannot reach the server. The admin portal only works on the live (PHP) website.');
    }
    let data = null;
    try { data = await res.json(); } catch (e) { /* non-JSON, e.g. no PHP */ }
    if (!data) throw new Error('The blog server is not available here. Upload the site to Hostinger to use the admin portal.');
    if (!res.ok || !data.ok) {
      const err = new Error(data.error || 'Something went wrong. Please try again.');
      err.status = res.status;
      throw err;
    }
    return data;
  }

  // Escape text before it is put into HTML.
  function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  }

  window.FEApi = {
    get: action => call(action),
    post: (action, body) => call(action, { method: 'POST', body }),
    esc
  };
})();
