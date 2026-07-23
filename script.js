/* ==========================================================================
   Jennelyn Portea — Portfolio Interactions
   Vanilla JS only. Organized by feature for easy customization.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initLoader();
  initParticles();
  initNav();
  initThemeToggle();
  initScrollProgress();
  initTypingEffect();
  initScrollReveal();
  initSkillBars();
  initCounters();
  initFloatCardRing();
  initBackToTop();
  initContactForm();
  initFooterYear();
  initActiveNavLink();
});

/* --------------------------------------------------------------------------
   1. Loading screen — hides once the page has fully loaded
   -------------------------------------------------------------------------- */
function initLoader() {
  const loader = document.getElementById('loader');
  if (!loader) return;

  const hide = () => {
    loader.classList.add('is-hidden');
    document.body.style.overflow = '';
  };

  document.body.style.overflow = 'hidden';

  // Give the loader a minimum visible time so it doesn't just flash.
  const minTime = new Promise((resolve) => setTimeout(resolve, 900));
  const pageLoaded = new Promise((resolve) => {
    if (document.readyState === 'complete') resolve();
    else window.addEventListener('load', resolve, { once: true });
  });

  Promise.all([minTime, pageLoaded]).then(hide);
}

/* --------------------------------------------------------------------------
   2. Floating particles — lightweight, randomly generated
   -------------------------------------------------------------------------- */
function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;

  const count = window.innerWidth < 700 ? 14 : 28;
  const frag = document.createDocumentFragment();

  for (let i = 0; i < count; i++) {
    const p = document.createElement('span');
    p.className = 'particle';
    const size = Math.random() * 2 + 2;
    p.style.width = `${size}px`;
    p.style.height = `${size}px`;
    p.style.left = `${Math.random() * 100}%`;
    p.style.bottom = `${Math.random() * -20}%`;
    p.style.animationDuration = `${Math.random() * 14 + 12}s`;
    p.style.animationDelay = `${Math.random() * 10}s`;
    frag.appendChild(p);
  }
  container.appendChild(frag);
}

/* --------------------------------------------------------------------------
   3. Navigation — sticky background on scroll, mobile menu toggle
   -------------------------------------------------------------------------- */
function initNav() {
  const nav = document.getElementById('nav');
  const burger = document.getElementById('navBurger');
  const links = document.getElementById('navLinks');
  if (!nav) return;

  const onScroll = () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 40);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  if (burger && links) {
    burger.addEventListener('click', () => {
      const isOpen = links.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(isOpen));
      burger.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    });

    links.querySelectorAll('.nav__link').forEach((link) => {
      link.addEventListener('click', () => {
        links.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }
}

/* Highlight the nav link matching the section currently in view */
function initActiveNavLink() {
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.nav__link');
  if (!sections.length || !navLinks.length) return;

  const map = new Map();
  navLinks.forEach((link) => map.set(link.getAttribute('href').slice(1), link));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const link = map.get(entry.target.id);
        if (!link) return;
        if (entry.isIntersecting) {
          navLinks.forEach((l) => l.classList.remove('active-link'));
          link.classList.add('active-link');
        }
      });
    },
    { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
  );

  sections.forEach((section) => observer.observe(section));
}

/* --------------------------------------------------------------------------
   4. Dark mode toggle — persists choice in memory for the session
   -------------------------------------------------------------------------- */
function initThemeToggle() {
  const toggle = document.getElementById('themeToggle');
  if (!toggle) return;

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  let theme = prefersDark ? 'dark' : 'light';
  applyTheme(theme);

  toggle.addEventListener('click', () => {
    theme = theme === 'dark' ? 'light' : 'dark';
    applyTheme(theme);
  });

  function applyTheme(mode) {
    if (mode === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      toggle.setAttribute('aria-pressed', 'true');
    } else {
      document.documentElement.removeAttribute('data-theme');
      toggle.setAttribute('aria-pressed', 'false');
    }
  }
}

/* --------------------------------------------------------------------------
   5. Scroll progress bar
   -------------------------------------------------------------------------- */
function initScrollProgress() {
  const bar = document.getElementById('progressBar');
  if (!bar) return;

  const update = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = `${pct}%`;
  };

  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
}

/* --------------------------------------------------------------------------
   6. Hero typing animation — cycles through role titles
   -------------------------------------------------------------------------- */
function initTypingEffect() {
  const el = document.getElementById('typing');
  if (!el) return;

  const roles = [
    'Virtual Assistant',
    'Appointment Setter',
    'Customer Support Specialist',
    'Lead Generation Expert',
  ];

  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  const TYPE_SPEED = 65;
  const DELETE_SPEED = 35;
  const PAUSE_AFTER_TYPE = 1600;
  const PAUSE_AFTER_DELETE = 400;

  function tick() {
    const currentRole = roles[roleIndex];

    if (!isDeleting) {
      charIndex++;
      el.textContent = currentRole.slice(0, charIndex);

      if (charIndex === currentRole.length) {
        isDeleting = true;
        setTimeout(tick, PAUSE_AFTER_TYPE);
        return;
      }
      setTimeout(tick, TYPE_SPEED);
    } else {
      charIndex--;
      el.textContent = currentRole.slice(0, charIndex);

      if (charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        setTimeout(tick, PAUSE_AFTER_DELETE);
        return;
      }
      setTimeout(tick, DELETE_SPEED);
    }
  }

  tick();
}

/* --------------------------------------------------------------------------
   7. Scroll reveal animations via IntersectionObserver
   -------------------------------------------------------------------------- */
function initScrollReveal() {
  const items = document.querySelectorAll('[data-reveal]');
  if (!items.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = entry.target.dataset.revealDelay || 0;
          setTimeout(() => entry.target.classList.add('is-visible'), Number(delay));
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
  );

  items.forEach((item) => observer.observe(item));
}

/* --------------------------------------------------------------------------
   8. Animated skill progress bars
   -------------------------------------------------------------------------- */
function initSkillBars() {
  const bars = document.querySelectorAll('[data-skill]');
  if (!bars.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const value = Number(el.dataset.value) || 0;
        const fill = el.querySelector('.skill-bar__fill');
        const pctLabel = el.querySelector('.skill-bar__pct');

        requestAnimationFrame(() => {
          if (fill) fill.style.width = `${value}%`;
        });
        animateNumber(0, value, 1200, (val) => {
          if (pctLabel) pctLabel.textContent = `${Math.round(val)}%`;
        });

        observer.unobserve(el);
      });
    },
    { threshold: 0.4 }
  );

  bars.forEach((bar) => observer.observe(bar));
}

/* --------------------------------------------------------------------------
   9. Animated counters (Why Choose Me + hero satisfaction ring)
   -------------------------------------------------------------------------- */
function initCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  if (!counters.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const end = Number(el.dataset.counterEnd) || 0;
        const suffix = el.dataset.counterSuffix || '';

        animateNumber(0, end, 1500, (val) => {
          el.textContent = `${Math.round(val)}${suffix}`;
        });

        observer.unobserve(el);
      });
    },
    { threshold: 0.6 }
  );

  counters.forEach((c) => observer.observe(c));
}

/* Shared easing-based number animator */
function animateNumber(start, end, duration, onUpdate) {
  const startTime = performance.now();

  function frame(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
    const value = start + (end - start) * eased;
    onUpdate(value);
    if (progress < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

/* --------------------------------------------------------------------------
   10. Fills the satisfaction ring in the floating hero card
   -------------------------------------------------------------------------- */
function initFloatCardRing() {
  const ring = document.querySelector('.ring-fg');
  const card = document.querySelector('.float-card--rate');
  if (!ring || !card) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        ring.style.strokeDashoffset = '2'; // ~98%
        observer.unobserve(card);
      });
    },
    { threshold: 0.5 }
  );

  observer.observe(card);
}

/* --------------------------------------------------------------------------
   11. Back-to-top button
   -------------------------------------------------------------------------- */
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  window.addEventListener(
    'scroll',
    () => btn.classList.toggle('is-visible', window.scrollY > 600),
    { passive: true }
  );

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* --------------------------------------------------------------------------
   12. Contact form — client-side validation + simulated submit
   -------------------------------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const response = await fetch(form.action, {
      method: "POST",
      body: new FormData(form),
      headers: {
        Accept: "application/json",
      },
    });

    if (response.ok) {
      alert("🌸 Thank you! Your message has been sent!");
      form.reset();
    } else {
      alert("Something went wrong. Please try again.");
    }
  });
}
   

    if (!isValid) return;

    // Simulate a successful submission (no backend wired up).
    const submitBtn = form.querySelector('button[type="submit"]');
    const btnText = submitBtn.querySelector('.btn__text');
    const originalText = btnText.textContent;

    submitBtn.disabled = true;
    btnText.textContent = 'Sending...';

    setTimeout(() => {
      btnText.textContent = originalText;
      submitBtn.disabled = false;
      form.reset();
      if (successMsg) {
        successMsg.classList.add('is-visible');
        setTimeout(() => successMsg.classList.remove('is-visible'), 5000);
      }
    }, 900);
  });

  // Clear an individual field's error state as the user types
  Object.keys(validators).forEach((field) => {
    const input = form.elements[field];
    if (!input) return;
    input.addEventListener('input', () => {
      input.classList.remove('has-error');
      const errorEl = form.querySelector(`[data-error-for="${field}"]`);
      if (errorEl) errorEl.textContent = '';
    });
  });
}

/* --------------------------------------------------------------------------
   13. Footer year
   -------------------------------------------------------------------------- */
function initFooterYear() {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}
