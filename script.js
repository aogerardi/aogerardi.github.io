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
    reinitParticles();
  });
}

const navbar = document.getElementById('navbar');
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelectorAll('.nav-links a');
const sections = document.querySelectorAll('main section[id]');

const canvas = document.getElementById('particles');

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

// --- Particle canvas ---
let reinitParticles = () => {};

(function initParticles() {
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let animId;

  const DARK_COLORS  = ['#c4914a', '#d4a86a', '#f0ead8'];
  const LIGHT_COLORS = ['#b85c38', '#c4724a', '#7a6a58'];
  const COUNT = 55;

  function getColors() {
    return document.documentElement.getAttribute('data-theme') === 'light'
      ? LIGHT_COLORS : DARK_COLORS;
  }

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  function createParticle() {
    const colors = getColors();
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.8 + 0.4,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: Math.random() * 0.5 + 0.2,
    };
  }

  function init() {
    resize();
    particles = Array.from({ length: COUNT }, createParticle);
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw connecting lines between nearby particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 90) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(196, 145, 74, ${0.12 * (1 - dist / 90)})`;
          ctx.lineWidth = 0.6;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    // Draw particles
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();
      ctx.globalAlpha = 1;

      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
    });

    animId = requestAnimationFrame(draw);
  }

  // Pause animation when not visible (performance)
  const visibilityObserver = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      if (!animId) draw();
    } else {
      cancelAnimationFrame(animId);
      animId = null;
    }
  });

  visibilityObserver.observe(canvas);

  window.addEventListener('resize', () => {
    cancelAnimationFrame(animId);
    animId = null;
    init();
    draw();
  }, { passive: true });

  reinitParticles = () => {
    cancelAnimationFrame(animId);
    animId = null;
    init();
    draw();
  };

  init();
  draw();
})();
