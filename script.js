/**
 * Portfolio site enhancements
 * Keeps the same dark, minimal theme and tone.
 */
(function () {
  'use strict';

  // =============================================================================
  // 1. FOOTER YEAR — Dynamic year via new Date().getFullYear()
  // =============================================================================
  function initFooterYear() {
    var el = document.getElementById('footer-year');
    if (el) el.textContent = new Date().getFullYear();
  }

  // =============================================================================
  // 2. LOADING OVERLAY — "Initializing..." only on first open; skipped on later
  //    page changes in the same session (sessionStorage: portfolio-loaded)
  // =============================================================================
  function initLoadingOverlay(onComplete) {
    var overlay = document.getElementById('loading-overlay');
    var duration = 1500;
    var alreadyShown = sessionStorage.getItem('portfolio-loaded');

    if (!overlay) {
      if (typeof onComplete === 'function') onComplete();
      return;
    }

    if (alreadyShown) {
      overlay.remove();
      if (typeof onComplete === 'function') onComplete();
      return;
    }

    setTimeout(function () {
      sessionStorage.setItem('portfolio-loaded', '1');
      overlay.classList.add('loading-overlay--fade-out');
      setTimeout(function () {
        overlay.remove();
        if (typeof onComplete === 'function') onComplete();
      }, 400);
    }, duration);
  }

  // =============================================================================
  // 3. BACKGROUND MUSIC — Play/pause control; requires audio/ambient.mp3
  // =============================================================================
  function initBackgroundMusic() {
    var audio = document.getElementById('bg-music');
    var toggle = document.getElementById('audio-toggle');

    if (!audio || !toggle) return;

    audio.addEventListener('error', function () {
      toggle.style.display = 'none';
    });

    toggle.addEventListener('click', function () {
      if (audio.paused) {
        audio.play().catch(function () { toggle.style.display = 'none'; });
        toggle.classList.add('audio-control--playing');
        toggle.setAttribute('aria-label', 'Pause background music');
      } else {
        audio.pause();
        toggle.classList.remove('audio-control--playing');
        toggle.setAttribute('aria-label', 'Play background music');
      }
    });
  }

  // =============================================================================
  // 4. ACTIVE SECTION IN NAV — Highlight nav link for section in view
  // =============================================================================
  function initActiveNav() {
    var navLinks = document.querySelectorAll('nav a[data-section]');
    if (!navLinks.length) return;

    // On about.html, only the "About" link has a matching concept; set it active.
    if (document.querySelector('body').classList.contains('page-about')) {
      navLinks.forEach(function (a) {
        a.classList.toggle('active', a.getAttribute('data-section') === 'about');
      });
      return;
    }

    var sectionIds = ['about', 'projects', 'skills', 'contact'];
    var sections = sectionIds
      .map(function (id) { return document.getElementById(id); })
      .filter(Boolean);

    function updateActive() {
      var topThreshold = 200;
      var activeId = null;

      for (var i = sections.length - 1; i >= 0; i--) {
        var rect = sections[i].getBoundingClientRect();
        if (rect.top <= topThreshold) {
          activeId = sections[i].id;
          break;
        }
      }
      if (!activeId && sections.length) activeId = sections[0].id;

      navLinks.forEach(function (a) {
        a.classList.toggle('active', a.getAttribute('data-section') === activeId);
      });
    }

    updateActive();
    window.addEventListener('scroll', updateActive, { passive: true });
  }

  // =============================================================================
  // 5. TYPEWRITER FOR TAGLINE — Types out the header tagline with cursor
  // =============================================================================
  function initTypewriter() {
    var el = document.getElementById('tagline');
    if (!el) return;

    var fullText = el.textContent.trim();
    el.textContent = '';

    var i = 0;
    var delay = 40;
    var cursor = document.createElement('span');
    cursor.className = 'typewriter-cursor';
    cursor.setAttribute('aria-hidden', 'true');
    cursor.textContent = '|';

    function tick() {
      if (i <= fullText.length) {
        el.textContent = fullText.slice(0, i);
        el.appendChild(cursor);
        i++;
        setTimeout(tick, delay);
      } else {
        cursor.remove();
        el.textContent = fullText;
      }
    }

    tick();
  }

  // =============================================================================
  // 6. PARTICLE / MATRIX BACKGROUND — Subtle floating particles, theme-matched
  // =============================================================================
  function initParticles() {
    var canvas = document.createElement('canvas');
    canvas.id = 'particle-canvas';
    canvas.setAttribute('aria-hidden', 'true');

    var ctx = canvas.getContext('2d');
    var particles = [];
    var particleCount = 55;
    var animationId;

    function resize() {
      var w = window.innerWidth;
      var h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
      if (particles.length === 0) initParticleArray(w, h);
      else {
        particles.forEach(function (p) {
          if (p.x > w) p.x = w;
          if (p.y > h) p.y = h;
        });
      }
    }

    function initParticleArray(w, h) {
      for (var i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          r: 1 + Math.random() * 1.5,
          opacity: 0.08 + Math.random() * 0.12
        });
      }
    }

    function animate() {
      var w = canvas.width;
      var h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      particles.forEach(function (p) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        p.x = Math.max(0, Math.min(w, p.x));
        p.y = Math.max(0, Math.min(h, p.y));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(192, 192, 192, ' + p.opacity + ')';
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    }

    if (document.body.firstChild) {
      document.body.insertBefore(canvas, document.body.firstChild);
    } else {
      document.body.appendChild(canvas);
    }

    resize();
    initParticleArray(canvas.width, canvas.height);
    animate();

    window.addEventListener('resize', function () {
      resize();
    });
  }

  // -----------------------------------------------------------------------------
  // Page-specific: data-page="about" on about.html for active-nav
  // -----------------------------------------------------------------------------
  if (document.body && document.body.getAttribute('data-page') === 'about') {
    document.body.classList.add('page-about');
  }

  // -----------------------------------------------------------------------------
  // Init: run when DOM is ready
  // -----------------------------------------------------------------------------
  function init() {
    initFooterYear();
    initParticles();
    initBackgroundMusic();
    initActiveNav();

    initLoadingOverlay(function () {
      initTypewriter();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
