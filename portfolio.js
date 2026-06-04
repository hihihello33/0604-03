/* ============================================================
   임정은 · 포트폴리오 — interactions
   절제된 모션 / 모션감소 대응 / 가벼운 CSS 토글 위주
   ============================================================ */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- HERO entrance ---------- */
  function startHero() {
    var hero = document.querySelector('.hero');
    if (hero) hero.classList.add('reveal-on');
    runCountUps();
  }

  /* ---------- count-up (timer-based: survives background/hidden iframes) ---------- */
  function runCountUps() {
    var els = document.querySelectorAll('[data-count]');
    els.forEach(function (el) {
      var target = parseFloat(el.getAttribute('data-count'));
      if (reduce) { el.textContent = formatNum(target, el); return; }
      var dur = 900, startT = Date.now();
      var timer = setInterval(function () {
        var p = Math.min((Date.now() - startT) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = formatNum(Math.round(target * eased), el);
        if (p >= 1) clearInterval(timer);
      }, 32);
    });
  }
  function formatNum(n, el) {
    var pad = el.getAttribute('data-pad');
    var s = String(n);
    if (pad) while (s.length < parseInt(pad, 10)) s = '0' + s;
    return s;
  }

  /* ---------- NAV: scrolled state + active section ---------- */
  var nav = document.querySelector('.nav');
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-links a[data-target]'));
  var sections = navLinks.map(function (a) {
    return document.getElementById(a.getAttribute('data-target'));
  });

  function onScroll() {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 40);
    // active section
    var pos = window.scrollY + window.innerHeight * 0.35;
    var current = -1;
    for (var i = 0; i < sections.length; i++) {
      if (sections[i] && sections[i].offsetTop <= pos) current = i;
    }
    navLinks.forEach(function (a, i) { a.classList.toggle('active', i === current); });
    updateTimeline();
  }

  /* ---------- timeline fill on scroll ---------- */
  var tlTrack = document.querySelector('.timeline');
  var tlFill = document.querySelector('.line-fill');
  var tlItems = Array.prototype.slice.call(document.querySelectorAll('.tl-item'));
  function updateTimeline() {
    if (!tlTrack || !tlFill) return;
    var rect = tlTrack.getBoundingClientRect();
    var vh = window.innerHeight;
    var trigger = vh * 0.55;
    var progress = (trigger - rect.top) / rect.height;
    progress = Math.max(0, Math.min(1, progress));
    tlFill.style.height = (progress * 100) + '%';
    var fillPx = rect.top + rect.height * progress;
    tlItems.forEach(function (it) {
      var d = it.querySelector('.dot');
      var dotMid = d ? d.getBoundingClientRect().top + 8 : it.getBoundingClientRect().top;
      if (dotMid <= fillPx + 4) it.classList.add('in');
    });
  }

  /* ---------- IntersectionObserver reveals ---------- */
  function setupReveals() {
    if (reduce) {
      document.querySelectorAll('.r-up, .stagger').forEach(function (e) { e.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.r-up, .stagger').forEach(function (e) { io.observe(e); });
  }

  /* ---------- contact: copy email ---------- */
  function setupContact() {
    var toast = document.getElementById('toast');
    function showToast(msg) {
      if (!toast) return;
      toast.querySelector('.toast-msg').textContent = msg;
      toast.classList.add('show');
      clearTimeout(showToast._t);
      showToast._t = setTimeout(function () { toast.classList.remove('show'); }, 2000);
    }
    document.querySelectorAll('[data-copy]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        var val = btn.getAttribute('data-copy');
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(val).then(function () {
            showToast('이메일이 복사되었습니다 · ' + val);
          }).catch(function () { showToast('복사: ' + val); });
        } else {
          showToast('복사: ' + val);
        }
      });
    });
  }

  /* ---------- mobile menu ---------- */
  function setupBurger() {
    var burger = document.querySelector('.nav-burger');
    var links = document.querySelector('.nav-links');
    if (!burger || !links) return;
    burger.addEventListener('click', function () {
      var open = links.style.display === 'flex';
      links.style.display = open ? '' : 'flex';
      if (!open) {
        links.style.position = 'absolute';
        links.style.top = '72px';
        links.style.left = '0';
        links.style.right = '0';
        links.style.flexDirection = 'column';
        links.style.background = 'rgba(255,255,255,.97)';
        links.style.padding = '20px 22px';
        links.style.borderBottom = '1px solid var(--border)';
        links.style.gap = '18px';
        links.querySelectorAll('a').forEach(function (a) { a.style.color = 'var(--ink)'; });
      }
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        if (window.innerWidth <= 900) { links.style.display = ''; }
      });
    });
  }

  /* ---------- init ---------- */
  function init() {
    setupReveals();
    setupContact();
    setupBurger();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    onScroll();
    // kick hero via timer (not rAF) so it fires even if the iframe is backgrounded
    setTimeout(startHero, 60);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();
