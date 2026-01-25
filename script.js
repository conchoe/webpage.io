/**
 * Portfolio site enhancements
 * Keeps the same dark, minimal theme and tone.
 */
(function () {
  'use strict';

  var isInitializing = true;

  // Force scroll to top on load — overrides hash (#projects) and scroll restoration
  window.scrollTo(0, 0);
  function forceScrollTop() {
    window.scrollTo(0, 0);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      forceScrollTop();
      isInitializing = false;
      setTimeout(function() { document.documentElement.classList.add('loaded'); }, 100);
    });
  } else {
    forceScrollTop();
    isInitializing = false;
    document.documentElement.classList.add('loaded');
  }
  window.addEventListener('load', function() {
    forceScrollTop();
    requestAnimationFrame(forceScrollTop);
  });

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
  // 4a. SURVIVE112 IFRAME LAZY-LOAD — Load embed only when in view. Prevents the
  //     embed from focusing/scroll-stealing on initial page load or refresh.
  // =============================================================================
  function initSurvive112LazyLoad() {
    var container = document.querySelector('[data-embed-container]');
    var iframe = container && container.querySelector('iframe[data-src]');
    if (!container || !iframe) return;
    var src = iframe.getAttribute('data-src');
    if (!src) return;

    var obs = new IntersectionObserver(
      function (entries) {
        for (var i = 0; i < entries.length; i++) {
          if (entries[i].isIntersecting) {
            iframe.src = src;
            obs.disconnect();
            return;
          }
        }
      },
      { rootMargin: '100px', threshold: 0 }
    );
    obs.observe(container);
  }

  // =============================================================================
  // 4. ACTIVE SECTION IN NAV — Highlight nav link; order always Home, About,
  //    Projects, Contact. Section id -> data-section: about->about, projects->projects,
  //    skills->projects, contact->contact; at top of index -> home.
  // =============================================================================
  function initActiveNav() {
    var navLinks = document.querySelectorAll('nav a[data-section]');
    if (!navLinks.length) return;

    // On about.html: "About" is active.
    if (document.body && document.body.classList.contains('page-about')) {
      navLinks.forEach(function (a) {
        a.classList.toggle('active', a.getAttribute('data-section') === 'about');
      });
      return;
    }

    // On index: home, about, projects, contact.
    var sectionIdToNav = { about: 'about', projects: 'projects', skills: 'projects', contact: 'contact' };
    var aboutEl = document.getElementById('about');
    var sections = ['about', 'projects', 'skills', 'contact']
      .map(function (id) { return document.getElementById(id); })
      .filter(Boolean);

    function updateActive() {
      if (isInitializing) return; // Skip during initialization

      var topThreshold = 200;
      var activeSection = 'home';

      if (aboutEl) {
        var aboutTop = aboutEl.getBoundingClientRect().top;
        if (aboutTop <= topThreshold) {
          var sectionId = null;
          for (var i = sections.length - 1; i >= 0; i--) {
            if (sections[i].getBoundingClientRect().top <= topThreshold) {
              sectionId = sections[i].id;
              break;
            }
          }
          if (sectionId) activeSection = sectionIdToNav[sectionId] || activeSection;
        }
      }

      navLinks.forEach(function (a) {
        a.classList.toggle('active', a.getAttribute('data-section') === activeSection);
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
  // Menu toggle for mobile — RUN FIRST
  // -----------------------------------------------------------------------------
  var menuToggle = document.getElementById('menu-toggle');
  var navMenu = document.getElementById('nav-menu');

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', function() {
      menuToggle.classList.toggle('active');
      navMenu.classList.toggle('active');
      menuToggle.setAttribute('aria-expanded', menuToggle.classList.contains('active'));
    });

    // Close menu when a link is clicked
    navMenu.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', function() {
        menuToggle.classList.remove('active');
        navMenu.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // -----------------------------------------------------------------------------
  // Init: run when DOM is ready
  // -----------------------------------------------------------------------------
  function init() {
    initFooterYear();
    initParticles();
    initBackgroundMusic();
    initSurvive112LazyLoad();
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
