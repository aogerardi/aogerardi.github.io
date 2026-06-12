// --- Enable scroll animations only once JS is confirmed running ---
// This applies the hidden starting state for .fade-in elements. If this script
// fails to load or run, the CSS leaves content visible by default, so the page
// content can never be permanently hidden.
document.documentElement.classList.add('js-anim');

// --- Page loader ---
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  if (loader) {
    loader.classList.add('hidden');
    setTimeout(() => loader.remove(), 500);
  }
});

// --- Theme toggle ---
const themeToggle = document.getElementById('themeToggle');

const ICONS = {
  dark:  '☀',   // currently dark → click to go light
  light: '☾',   // currently light → click to go dark
};

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  if (themeToggle) themeToggle.textContent = ICONS[theme];
}

// Load saved preference, default to light
applyTheme(localStorage.getItem('theme') || 'light');

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    applyTheme(current === 'light' ? 'dark' : 'light');
  });
}

const navbar = document.getElementById('navbar');
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelectorAll('.nav-links a');
const sections = document.querySelectorAll('main section[id]');

// --- Navbar scroll state ---
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
  updateActiveLink();
}, { passive: true });

// --- Mobile hamburger toggle ---
navToggle.addEventListener('click', () => {
  navbar.classList.toggle('nav-open');
});

navLinks.forEach(link => {
  link.addEventListener('click', () => navbar.classList.remove('nav-open'));
});

// --- Active nav link highlight ---
function updateActiveLink() {
  let current = '';
  sections.forEach(section => {
    if (window.scrollY >= section.offsetTop - 120) {
      current = section.getAttribute('id');
    }
  });
  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
  });
}
updateActiveLink();

// --- Fade-in reveal: IntersectionObserver with a scroll-based fallback ---
// The fallback guarantees content is never left stuck at opacity:0 if the
// observer fails to fire (restored scroll position, fast scroll, reduced-motion,
// or environments where IntersectionObserver doesn't trigger).
const faders = document.querySelectorAll('.fade-in');

function revealInView() {
  const vh = window.innerHeight || document.documentElement.clientHeight;
  faders.forEach(el => {
    if (el.classList.contains('visible')) return;
    const r = el.getBoundingClientRect();
    if (r.top < vh * 0.92 && r.bottom > 0) el.classList.add('visible');
  });
}

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  faders.forEach(el => observer.observe(el));
} else {
  // No IntersectionObserver support: reveal everything immediately.
  faders.forEach(el => el.classList.add('visible'));
}

// Safety net: reveal on scroll, load, and resize regardless of the observer.
window.addEventListener('scroll', revealInView, { passive: true });
window.addEventListener('resize', revealInView, { passive: true });
window.addEventListener('load', revealInView);
revealInView();

// --- Reduced motion: pause SVG (SMIL) animations like the horizon strip ---
// CSS handles keyframe animations; SMIL doesn't respond to media queries,
// so it has to be paused from script.
const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

function syncMotion() {
  document.querySelectorAll('svg').forEach(svg => {
    if (typeof svg.pauseAnimations !== 'function') return;
    if (motionQuery.matches) {
      svg.pauseAnimations();
    } else {
      svg.unpauseAnimations();
    }
  });
}

syncMotion();
motionQuery.addEventListener('change', syncMotion);
