/* ==========================================================================
   Future Edge — shared site script (loaded on every page)
   Icons, mobile navigation, hero sequence, counters, timeline, accordions,
   testimonial slider, card tilt and scroll reveals.

   Plain (non-module) script so it also works when a page is opened straight
   from disk or served without the Vite build. Vite copies it to dist as-is.
*/
(function () {
'use strict';

// -- Icon data ------------------------------------------------------------------
// Icon path data from Lucide v1.57.0 (https://lucide.dev), ISC License.
// To add an icon: copy its node array from lucide.dev into ICONS.
const ICONS = {
  "alert-circle": [["circle",{"cx":"12","cy":"12","r":"10"}],["line",{"x1":"12","x2":"12","y1":"8","y2":"12"}],["line",{"x1":"12","x2":"12.01","y1":"16","y2":"16"}]],
  "award": [["path",{"d":"m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"}],["circle",{"cx":"12","cy":"8","r":"6"}]],
  "bar-chart": [["path",{"d":"M5 21v-6"}],["path",{"d":"M12 21V9"}],["path",{"d":"M19 21V3"}]],
  "bar-chart-3": [["path",{"d":"M3 3v16a2 2 0 0 0 2 2h16"}],["path",{"d":"M18 17V9"}],["path",{"d":"M13 17V5"}],["path",{"d":"M8 17v-3"}]],
  "bot": [["path",{"d":"M12 8V4H8"}],["rect",{"width":"16","height":"12","x":"4","y":"8","rx":"2"}],["path",{"d":"M2 14h2"}],["path",{"d":"M20 14h2"}],["path",{"d":"M15 13v2"}],["path",{"d":"M9 13v2"}]],
  "brain": [["path",{"d":"M12 18V5"}],["path",{"d":"M15 13a4.17 4.17 0 0 1-3-4 4.17 4.17 0 0 1-3 4"}],["path",{"d":"M17.598 6.5A3 3 0 1 0 12 5a3 3 0 1 0-5.598 1.5"}],["path",{"d":"M17.997 5.125a4 4 0 0 1 2.526 5.77"}],["path",{"d":"M18 18a4 4 0 0 0 2-7.464"}],["path",{"d":"M19.967 17.483A4 4 0 1 1 12 18a4 4 0 1 1-7.967-.517"}],["path",{"d":"M6 18a4 4 0 0 1-2-7.464"}],["path",{"d":"M6.003 5.125a4 4 0 0 0-2.526 5.77"}]],
  "briefcase": [["path",{"d":"M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"}],["rect",{"width":"20","height":"14","x":"2","y":"6","rx":"2"}]],
  "check": [["path",{"d":"M20 6 9 17l-5-5"}]],
  "check-circle": [["path",{"d":"M21.801 10A10 10 0 1 1 17 3.335"}],["path",{"d":"m9 11 3 3L22 4"}]],
  "check-circle-2": [["circle",{"cx":"12","cy":"12","r":"10"}],["path",{"d":"m16 9-5.5 5.5L8 12"}]],
  "chevron-down": [["path",{"d":"m6 9 6 6 6-6"}]],
  "clock": [["circle",{"cx":"12","cy":"12","r":"10"}],["path",{"d":"M12 6v6l4 2"}]],
  "cpu": [["path",{"d":"M12 20v2"}],["path",{"d":"M12 2v2"}],["path",{"d":"M17 20v2"}],["path",{"d":"M17 2v2"}],["path",{"d":"M2 12h2"}],["path",{"d":"M2 17h2"}],["path",{"d":"M2 7h2"}],["path",{"d":"M20 12h2"}],["path",{"d":"M20 17h2"}],["path",{"d":"M20 7h2"}],["path",{"d":"M7 20v2"}],["path",{"d":"M7 2v2"}],["rect",{"x":"4","y":"4","width":"16","height":"16","rx":"2"}],["rect",{"x":"8","y":"8","width":"8","height":"8","rx":"1"}]],
  "edit-2": [["path",{"d":"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"}]],
  "edit-3": [["path",{"d":"M13 21h8"}],["path",{"d":"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"}]],
  "eye": [["path",{"d":"M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"}],["circle",{"cx":"12","cy":"12","r":"3"}]],
  "file-search": [["path",{"d":"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"}],["path",{"d":"M14 2v5a1 1 0 0 0 1 1h5"}],["circle",{"cx":"11.5","cy":"14.5","r":"2.5"}],["path",{"d":"M13.3 16.3 15 18"}]],
  "globe": [["circle",{"cx":"12","cy":"12","r":"10"}],["path",{"d":"M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"}],["path",{"d":"M2 12h20"}]],
  "graduation-cap": [["path",{"d":"M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"}],["path",{"d":"M22 10v6"}],["path",{"d":"M6 12.5V16a6 3 0 0 0 12 0v-3.5"}]],
  "handshake": [["path",{"d":"m11 17 2 2a1 1 0 1 0 3-3"}],["path",{"d":"m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"}],["path",{"d":"m21 3 1 11h-2"}],["path",{"d":"M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3"}],["path",{"d":"M3 4h8"}]],
  "image": [["rect",{"width":"18","height":"18","x":"3","y":"3","rx":"2","ry":"2"}],["circle",{"cx":"9","cy":"9","r":"2"}],["path",{"d":"m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"}]],
  "inbox": [["polyline",{"points":"22 12 16 12 14 15 10 15 8 12 2 12"}],["path",{"d":"M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"}]],
  "layers": [["path",{"d":"M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"}],["path",{"d":"M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"}],["path",{"d":"M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"}]],
  "link": [["path",{"d":"M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"}],["path",{"d":"M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"}]],
  "mail": [["path",{"d":"m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"}],["rect",{"x":"2","y":"4","width":"20","height":"16","rx":"2"}]],
  "map-pin": [["path",{"d":"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"}],["circle",{"cx":"12","cy":"10","r":"3"}]],
  "message-square": [["path",{"d":"M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z"}]],
  "monitor": [["rect",{"width":"20","height":"14","x":"2","y":"3","rx":"2"}],["line",{"x1":"8","x2":"16","y1":"21","y2":"21"}],["line",{"x1":"12","x2":"12","y1":"17","y2":"21"}]],
  "palette": [["path",{"d":"M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z"}],["circle",{"cx":"13.5","cy":"6.5","r":".5","fill":"currentColor"}],["circle",{"cx":"17.5","cy":"10.5","r":".5","fill":"currentColor"}],["circle",{"cx":"6.5","cy":"12.5","r":".5","fill":"currentColor"}],["circle",{"cx":"8.5","cy":"7.5","r":".5","fill":"currentColor"}]],
  "pen-tool": [["path",{"d":"m18 13-.654-4.736a4 4 0 00-2.756-3.266l-9.163-2.9a2 2 0 00-2.017.493l-.82.819a2 2 0 00-.492 2.017l2.9 9.163a4 4 0 003.266 2.756L13 18"}],["path",{"d":"M18.648 12.352a1.205 1.205 0 011.704 0l1.296 1.296a1.205 1.205 0 010 1.704l-6.296 6.296a1.205 1.205 0 01-1.704 0l-1.296-1.296a1.205 1.205 0 010-1.704z"}],["path",{"d":"m3 3 6.586 6.586"}],["circle",{"cx":"11","cy":"11","r":"2"}]],
  "rocket": [["path",{"d":"M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"}],["path",{"d":"M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09"}],["path",{"d":"M9 12a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.4 22.4 0 0 1-4 2z"}],["path",{"d":"M9 12H4s.55-3.03 2-4c1.62-1.08 5 .05 5 .05"}]],
  "rotate-ccw": [["path",{"d":"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"}],["path",{"d":"M3 3v5h5"}]],
  "search": [["path",{"d":"m21 21-4.34-4.34"}],["circle",{"cx":"11","cy":"11","r":"8"}]],
  "send": [["path",{"d":"M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"}],["path",{"d":"m21.854 2.147-10.94 10.939"}]],
  "share-2": [["circle",{"cx":"18","cy":"5","r":"3"}],["circle",{"cx":"6","cy":"12","r":"3"}],["circle",{"cx":"18","cy":"19","r":"3"}],["line",{"x1":"8.59","x2":"15.42","y1":"13.51","y2":"17.49"}],["line",{"x1":"15.41","x2":"8.59","y1":"6.51","y2":"10.49"}]],
  "shield-alert": [["path",{"d":"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"}],["path",{"d":"M12 8v4"}],["path",{"d":"M12 16h.01"}]],
  "shield-check": [["path",{"d":"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"}],["path",{"d":"m9 12 2 2 4-4"}]],
  "shopping-cart": [["path",{"d":"m2.05 2.05 1.099-.028a1 1 0 0 1 1.008.815l2.69 14.347A1 1 0 0 0 7.83 18H18"}],["path",{"d":"M4.563 5h16.435a1 1 0 0 1 .981 1.204l-1.026 6.226A2 2 0 0 1 18.962 14H6.25"}],["circle",{"cx":"18","cy":"20","r":"2"}],["circle",{"cx":"8","cy":"20","r":"2"}]],
  "smartphone": [["rect",{"width":"14","height":"20","x":"5","y":"2","rx":"2","ry":"2"}],["path",{"d":"M12 18h.01"}]],
  "sparkles": [["path",{"d":"M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"}],["path",{"d":"M20 2v4"}],["path",{"d":"M22 4h-4"}],["circle",{"cx":"4","cy":"20","r":"2"}]],
  "star": [["path",{"d":"M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"}]],
  "target": [["circle",{"cx":"12","cy":"12","r":"10"}],["circle",{"cx":"12","cy":"12","r":"6"}],["circle",{"cx":"12","cy":"12","r":"2"}]],
  "trash-2": [["path",{"d":"M10 11v6"}],["path",{"d":"M14 11v6"}],["path",{"d":"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"}],["path",{"d":"M3 6h18"}],["path",{"d":"M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"}]],
  "trending-up": [["path",{"d":"M16 7h6v6"}],["path",{"d":"m22 7-8.5 8.5-5-5L2 17"}]],
  "user-check": [["path",{"d":"m16 11 2 2 4-4"}],["path",{"d":"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"}],["circle",{"cx":"9","cy":"7","r":"4"}]],
  "users": [["path",{"d":"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"}],["path",{"d":"M16 3.128a4 4 0 0 1 0 7.744"}],["path",{"d":"M22 21v-2a4 4 0 0 0-3-3.87"}],["circle",{"cx":"9","cy":"7","r":"4"}]],
  "video": [["path",{"d":"m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"}],["rect",{"x":"2","y":"6","width":"14","height":"12","rx":"2"}]],
  "x": [["path",{"d":"M18 6 6 18"}],["path",{"d":"m6 6 12 12"}]],
  "zap": [["path",{"d":"M15.914 4a1.5 1.5 0 00-2.474-1.561l-9 9A1.5 1.5 0 005.5 14h4.002a.5.5 0 01.471.666L8.086 20a1.5 1.5 0 002.475 1.56l9-9A1.5 1.5 0 0018.5 10h-3.997a.5.5 0 01-.472-.667z"}]],
};

const SVG_NS = 'http://www.w3.org/2000/svg';
const DEFAULT_ATTRS = {
  xmlns: SVG_NS, width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none',
  stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round'
};

function buildSvg(name, node, sourceAttrs) {
  const svg = document.createElementNS(SVG_NS, 'svg');
  const hasLabel = Object.keys(sourceAttrs).some(a => a === 'aria-label' || a === 'aria-labelledby' || a === 'title' || a === 'role');
  const attrs = { ...DEFAULT_ATTRS, 'data-lucide': name, ...(hasLabel ? {} : { 'aria-hidden': 'true' }), ...sourceAttrs };
  attrs.class = ['lucide', `lucide-${name}`, ...(sourceAttrs.class || '').split(' ')].filter(Boolean).join(' ');
  Object.entries(attrs).forEach(([k, v]) => svg.setAttribute(k, v));
  node.forEach(([tag, childAttrs]) => {
    const child = document.createElementNS(SVG_NS, tag);
    Object.entries(childAttrs).forEach(([k, v]) => child.setAttribute(k, v));
    svg.appendChild(child);
  });
  return svg;
}

/** Replace every <i data-lucide="name"> placeholder under root with its SVG icon. */
function createIcons(root = document) {
  root.querySelectorAll('[data-lucide]:not(svg)').forEach(el => {
    const name = el.getAttribute('data-lucide');
    const node = ICONS[name];
    if (!node) { console.warn(`Unknown icon "${name}" — add it to src/icons.js`); return; }
    const attrs = {};
    [...el.attributes].forEach(a => { attrs[a.name] = a.value; });
    el.replaceWith(buildSvg(name, node, attrs));
  });
}

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(pointer: fine)');
const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));

// -- Icons --------------------------------------------------------------------
// Page scripts that render HTML later call window.refreshIcons().
function refreshIcons() {
  createIcons();
}
window.refreshIcons = refreshIcons;

// -- Mobile navigation ----------------------------------------------------------
function initMobileNav() {
  const toggle = document.getElementById('menuToggle');
  const drawer = document.getElementById('mobileNavDrawer');
  const overlay = document.getElementById('mobileNavOverlay');
  const closeBtn = document.getElementById('mobileNavClose');
  if (!toggle || !drawer) return;

  toggle.setAttribute('aria-controls', 'mobileNavDrawer');
  toggle.setAttribute('aria-expanded', 'false');
  drawer.inert = true;

  const open = () => {
    drawer.inert = false;
    drawer.classList.add('open');
    overlay?.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    (closeBtn || drawer.querySelector('a'))?.focus();
  };

  const close = (returnFocus = true) => {
    if (!drawer.classList.contains('open')) return;
    drawer.classList.remove('open');
    overlay?.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    drawer.inert = true;
    if (returnFocus) toggle.focus();
  };

  toggle.addEventListener('click', open);
  closeBtn?.addEventListener('click', () => close());
  overlay?.addEventListener('click', () => close());
  drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', () => close(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  window.matchMedia('(min-width: 1024px)').addEventListener('change', e => { if (e.matches) close(false); });

  // Kept for any inline onclick="closeMobileNav()" left in markup.
  window.closeMobileNav = () => close(false);
}

// -- Hero sequence (home page) --------------------------------------------------
function initHero() {
  const hero = document.querySelector('.hero-sequence');
  if (!hero) return;

  const messages = [...hero.querySelectorAll('.hero-message')];
  const widgets = [...hero.querySelectorAll('.hero-widget')];
  const bar = hero.querySelector('.progress-indicator');
  const desktop = window.matchMedia('(min-width: 1024px)');
  let current = -1;
  let rotateTimer = null;
  let pausedUntil = 0;

  const showMessage = (index) => {
    if (index === current) return;
    current = index;
    messages.forEach((m, i) => {
      const active = i === index;
      m.classList.toggle('active', active);
      m.inert = !active;
      m.setAttribute('aria-hidden', String(!active));
    });
  };

  // Desktop: pinned scroll-driven sequence.
  const onScroll = () => {
    const rect = hero.getBoundingClientRect();
    const distance = rect.height - window.innerHeight;
    const progress = distance > 0 ? clamp(-rect.top / distance) : 0;
    let index = 0;
    messages.forEach((m, i) => { if (progress >= parseFloat(m.dataset.start || 0)) index = i; });
    showMessage(index);
    widgets.forEach(w => {
      const s = parseFloat(w.dataset.start || 0);
      const e = parseFloat(w.dataset.end || 1);
      w.classList.toggle('active', progress >= s && progress <= e);
    });
    if (bar) bar.style.width = `${progress * 100}%`;
    hero.style.setProperty('--hero-progress', progress.toFixed(3));
  };

  let ticking = false;
  const scrollHandler = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { ticking = false; onScroll(); });
  };

  // Mobile / tablet / reduced motion: a normal-height hero whose headline rotates.
  const startRotation = () => {
    stopRotation();
    if (reducedMotion.matches || messages.length < 2) return;
    rotateTimer = setInterval(() => {
      if (Date.now() < pausedUntil || document.hidden) return;
      showMessage((current + 1) % messages.length);
    }, 5000);
  };
  const stopRotation = () => { if (rotateTimer) clearInterval(rotateTimer); rotateTimer = null; };
  const pause = () => { pausedUntil = Date.now() + 10000; };
  hero.addEventListener('touchstart', pause, { passive: true });
  hero.addEventListener('focusin', pause);
  hero.addEventListener('mouseenter', pause);

  const applyMode = () => {
    const pinned = desktop.matches && !reducedMotion.matches;
    hero.classList.toggle('hero-static', !pinned);
    window.removeEventListener('scroll', scrollHandler);
    if (pinned) {
      stopRotation();
      window.addEventListener('scroll', scrollHandler, { passive: true });
      current = -1;
      onScroll();
    } else {
      widgets.forEach(w => w.classList.remove('active'));
      current = -1;
      showMessage(0);
      startRotation();
    }
  };

  desktop.addEventListener('change', applyMode);
  reducedMotion.addEventListener('change', applyMode);
  applyMode();

  initHeroCanvas(hero);
}

// Lightweight 2D "growth network" behind the hero copy.
function initHeroCanvas(hero) {
  const canvas = hero.querySelector('#heroCanvas');
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext('2d');
  let width = 0, height = 0, dpr = 1, nodes = [], running = false, visible = true, rafId = 0;
  const pointer = { x: -9999, y: -9999 };

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width; height = rect.height;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round(clamp((width * height) / 22000, 18, 70));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 2.2 + 1.2,
      gold: Math.random() > 0.35
    }));
  };

  const draw = () => {
    ctx.clearRect(0, 0, width, height);
    const progress = parseFloat(hero.style.getPropertyValue('--hero-progress')) || 0;
    const linkDist = Math.min(150, width / 7);

    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < linkDist) {
          ctx.strokeStyle = `rgba(26, 50, 93, ${0.13 * (1 - d / linkDist)})`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
      const dp = Math.hypot(a.x - pointer.x, a.y - pointer.y);
      if (dp < 180) {
        ctx.strokeStyle = `rgba(255, 165, 0, ${0.35 * (1 - dp / 180)})`;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(pointer.x, pointer.y); ctx.stroke();
      }
    }

    nodes.forEach(n => {
      ctx.fillStyle = n.gold ? 'rgba(255, 180, 0, 0.75)' : 'rgba(26, 50, 93, 0.45)';
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fill();
    });

    // Rising growth line that extends as the visitor scrolls through the hero.
    if (width >= 1024) {
      const pts = 9, left = width * 0.52, right = width * 0.95, base = height * 0.86, top = height * 0.2;
      const reach = 0.25 + progress * 0.75;
      ctx.strokeStyle = 'rgba(255, 165, 0, 0.55)';
      ctx.lineWidth = 3;
      ctx.lineJoin = 'round';
      ctx.beginPath();
      for (let i = 0; i < pts; i++) {
        const t = i / (pts - 1);
        if (t > reach) break;
        const x = left + (right - left) * t;
        const y = base - (base - top) * Math.pow(t, 1.6) + (i % 2 ? 12 : -6) * (1 - t);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  };

  const step = () => {
    nodes.forEach(n => {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > width) n.vx *= -1;
      if (n.y < 0 || n.y > height) n.vy *= -1;
    });
    draw();
    rafId = requestAnimationFrame(step);
  };

  const start = () => {
    if (running || !visible || document.hidden || reducedMotion.matches) return;
    running = true;
    rafId = requestAnimationFrame(step);
  };
  const stop = () => { running = false; cancelAnimationFrame(rafId); };

  resize();
  draw();
  start();

  window.addEventListener('resize', () => { resize(); draw(); });
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  reducedMotion.addEventListener('change', () => { stop(); draw(); start(); });
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    visible ? start() : stop();
  }).observe(canvas);

  if (finePointer.matches) {
    hero.addEventListener('mousemove', e => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left; pointer.y = e.clientY - rect.top;
    });
    hero.addEventListener('mouseleave', () => { pointer.x = pointer.y = -9999; });
  }
}

// -- Animated stat counters -----------------------------------------------------
function initCounters() {
  const counters = document.querySelectorAll('.counter[data-count]');
  if (!counters.length) return;
  const format = n => n.toLocaleString('en-IN');

  const run = el => {
    const target = parseInt(el.dataset.count, 10) || 0;
    if (reducedMotion.matches) { el.textContent = format(target); return; }
    const duration = 1600;
    const start = performance.now();
    const tick = now => {
      const t = clamp((now - start) / duration);
      el.textContent = format(Math.round(target * (1 - Math.pow(1 - t, 3))));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { run(entry.target); io.unobserve(entry.target); }
    });
  }, { threshold: 0.4 });
  counters.forEach(c => io.observe(c));
}

// -- Process timeline -------------------------------------------------------------
function initTimeline() {
  const container = document.querySelector('.timeline-container');
  if (!container) return;
  const items = [...container.querySelectorAll('.timeline-item')];
  const track = container.querySelector('.timeline-track');

  // Revealing a step also reveals the steps above it (e.g. after an anchor jump).
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const upTo = items.indexOf(entry.target);
      items.slice(0, upTo + 1).forEach(i => { i.classList.add('active'); io.unobserve(i); });
    });
  }, { threshold: 0.25, rootMargin: '0px 0px -10% 0px' });
  items.forEach(i => io.observe(i));

  if (track) {
    const update = () => {
      const rect = container.getBoundingClientRect();
      const fill = clamp((window.innerHeight * 0.65 - rect.top) / rect.height);
      track.style.setProperty('--scroll-fill', `${(fill * 100).toFixed(1)}%`);
    };
    window.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
    update();
  }
}

// -- Accordions (FAQ page + academy FAQ) -----------------------------------------
function initAccordions() {
  const groups = [
    { item: '.faq-item', header: '.faq-question', body: '.faq-answer' },
    { item: '.faq-acc-item', header: '.faq-acc-header', body: '.faq-acc-body' }
  ];
  let uid = 0;

  groups.forEach(({ item, header, body }) => {
    const items = [...document.querySelectorAll(item)];
    items.forEach(el => {
      const btn = el.querySelector(header);
      const panel = el.querySelector(body);
      if (!btn || !panel) return;
      const id = `acc-panel-${++uid}`;
      panel.id = id;
      panel.setAttribute('role', 'region');
      btn.setAttribute('type', 'button');
      btn.setAttribute('aria-controls', id);
      btn.setAttribute('aria-expanded', String(el.classList.contains('active')));

      btn.addEventListener('click', () => {
        const wasOpen = el.classList.contains('active');
        items.forEach(other => {
          other.classList.remove('active');
          other.querySelector(header)?.setAttribute('aria-expanded', 'false');
        });
        if (!wasOpen) {
          el.classList.add('active');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  });
}

// -- Testimonial slider (about page) ----------------------------------------------
function initTestimonials() {
  const slider = document.getElementById('testimonialSlider');
  if (!slider) return;
  const slides = [...slider.querySelectorAll('.testimonial-card')];
  const dots = [...document.querySelectorAll('#sliderDots .s-dot')];
  if (slides.length < 2) return;
  let index = Math.max(0, slides.findIndex(s => s.classList.contains('active')));
  let timer = null;

  const go = i => {
    index = (i + slides.length) % slides.length;
    slides.forEach((s, k) => {
      s.classList.toggle('active', k === index);
      s.setAttribute('aria-hidden', String(k !== index));
    });
    dots.forEach((d, k) => {
      d.classList.toggle('active', k === index);
      d.setAttribute('aria-current', k === index ? 'true' : 'false');
    });
  };

  dots.forEach((d, k) => {
    d.setAttribute('role', 'button');
    d.setAttribute('tabindex', '0');
    d.setAttribute('aria-label', `Show testimonial ${k + 1}`);
    d.addEventListener('click', () => { go(k); restart(); });
    d.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(k); restart(); }
    });
  });

  // Swipe on touch screens.
  let startX = null;
  slider.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  slider.addEventListener('touchend', e => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) { go(index + (dx < 0 ? 1 : -1)); restart(); }
    startX = null;
  });

  const restart = () => {
    clearInterval(timer);
    if (!reducedMotion.matches) timer = setInterval(() => go(index + 1), 6000);
  };
  slider.addEventListener('mouseenter', () => clearInterval(timer));
  slider.addEventListener('mouseleave', restart);

  go(index);
  restart();
}

// -- 3D tilt (desktop pointer only) + scroll reveal for service cards ------------
function initCards() {
  if (finePointer.matches && !reducedMotion.matches) {
    document.querySelectorAll('[data-tilt]').forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const dx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
        const dy = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
        card.style.transform = `perspective(1000px) rotateX(${-dy * 6}deg) rotateY(${dx * 6}deg) translateZ(6px)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  }

  const cards = document.querySelectorAll('.svc3d-card');
  if (!cards.length) return;
  if (reducedMotion.matches) { cards.forEach(c => c.classList.add('is-visible')); return; }
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  cards.forEach(c => io.observe(c));
}

// -- Footer year -------------------------------------------------------------------
function initYear() {
  document.querySelectorAll('#currentYear').forEach(el => { el.textContent = new Date().getFullYear(); });
}

refreshIcons();
initMobileNav();
initHero();
initCounters();
initTimeline();
initAccordions();
initTestimonials();
initCards();
initYear();
})();
