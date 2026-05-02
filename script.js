const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.site-nav');

if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Cerrar menu' : 'Abrir menu');
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Abrir menu');
    });
  });
}

const revealItems = document.querySelectorAll('.reveal');

revealItems.forEach((item, index) => {
  item.style.animationDelay = `${Math.min(index * 70, 420)}ms`;
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    });
  },
  {
    threshold: 0.15,
  }
);

revealItems.forEach((item) => revealObserver.observe(item));

const yearEl = document.getElementById('year');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

const contactForm = document.querySelector('.contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    alert('Gracias por tu consulta. Te responderemos pronto.');
    contactForm.reset();
  });
}

const ADMIN_TOKEN = 'tintoreta-admin-2026';
const COUNTER_NAMESPACE = 'tintoreta-madrid';

function getCurrentPageKey() {
  const path = window.location.pathname.toLowerCase();
  if (path.endsWith('/servicios.html') || path.endsWith('servicios.html')) {
    return 'servicios-visits';
  }

  return 'home-visits';
}

function isAdminMode() {
  const params = new URLSearchParams(window.location.search);
  return params.get('admin') === ADMIN_TOKEN;
}

async function incrementCounter(key) {
  const response = await fetch(`https://api.countapi.xyz/hit/${COUNTER_NAMESPACE}/${key}`);
  if (!response.ok) {
    throw new Error('No se pudo actualizar el contador');
  }

  const data = await response.json();
  return Number(data.value || 0);
}

async function setupVisitCounter() {
  const adminPanel = document.getElementById('admin-analytics');
  const isAdmin = isAdminMode();

  try {
    const [totalVisits, pageVisits] = await Promise.all([
      incrementCounter('site-total-visits'),
      incrementCounter(getCurrentPageKey()),
    ]);

    if (isAdmin && adminPanel) {
      const totalEl = document.getElementById('admin-total-visits');
      const pageEl = document.getElementById('admin-page-visits');
      const lastUpdateEl = document.getElementById('admin-last-update');

      if (totalEl) {
        totalEl.textContent = totalVisits.toLocaleString('es-ES');
      }

      if (pageEl) {
        pageEl.textContent = pageVisits.toLocaleString('es-ES');
      }

      if (lastUpdateEl) {
        lastUpdateEl.textContent = new Date().toLocaleString('es-ES');
      }

      adminPanel.hidden = false;
    }
  } catch {
    if (isAdmin && adminPanel) {
      adminPanel.hidden = false;
      const lastUpdateEl = document.getElementById('admin-last-update');
      if (lastUpdateEl) {
        lastUpdateEl.textContent = 'No disponible (error de conexion)';
      }
    }
  }
}

setupVisitCounter();
