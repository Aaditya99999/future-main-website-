/* ==========================================================================
   Future Edge — shared site script (loaded on every page)
   Icons, mobile navigation, hero sequence, counters, timeline, accordions,
   testimonial slider, card tilt and scroll reveals.
   ========================================================================== */

import {
  createIcons,
  AlertCircle, Award, BarChart, BarChart3, Bot, Brain, Briefcase, Check, CheckCircle,
  CheckCircle2, ChevronDown, Clock, Cpu, Edit2, Edit3, Eye, FileSearch, Globe,
  GraduationCap, Handshake, Image, Inbox, Layers, Link, Mail, MapPin, MessageSquare,
  Monitor, Palette, PenTool, Rocket, RotateCcw, Search, Send, Share2, ShieldAlert,
  ShieldCheck, ShoppingCart, Smartphone, Sparkles, Star, Target, Trash2, TrendingUp,
  UserCheck, Users, Video, X, Zap
} from 'lucide';

const icons = {
  AlertCircle, Award, BarChart, BarChart3, Bot, Brain, Briefcase, Check, CheckCircle,
  CheckCircle2, ChevronDown, Clock, Cpu, Edit2, Edit3, Eye, FileSearch, Globe,
  GraduationCap, Handshake, Image, Inbox, Layers, Link, Mail, MapPin, MessageSquare,
  Monitor, Palette, PenTool, Rocket, RotateCcw, Search, Send, Share2, ShieldAlert,
  ShieldCheck, ShoppingCart, Smartphone, Sparkles, Star, Target, Trash2, TrendingUp,
  UserCheck, Users, Video, X, Zap
};

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(pointer: fine)');
const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));

// -- Icons --------------------------------------------------------------------
// Page scripts that render HTML later call window.refreshIcons().
function refreshIcons() {
  createIcons({ icons, attrs: { 'aria-hidden': 'true' } });
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
