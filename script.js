const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.site-nav');
const siteHeader = document.querySelector('.site-header');

function getAnchorOffset() {
  const headerHeight = siteHeader ? siteHeader.getBoundingClientRect().height : 74;
  return Math.ceil(headerHeight + 10);
}

function getAnchorOffsetByHash(hash) {
  const baseOffset = getAnchorOffset();
  if (hash === '#ritual') {
    return baseOffset + 18;
  }

  return baseOffset;
}

function getVisualAnchorTarget(target) {
  if (!target) {
    return target;
  }

  if (!target.matches('section')) {
    return target;
  }

  const innerTarget = target.querySelector('.section-head, .packs-head, .ritual-copy, .contact-info, h2');
  return innerTarget || target;
}

function getDocumentTop(element) {
  if (!element) {
    return 0;
  }

  let top = 0;
  let current = element;

  while (current) {
    top += current.offsetTop || 0;
    current = current.offsetParent;
  }

  return top;
}

function scrollToAnchor(hash) {
  if (!hash || hash === '#') {
    return;
  }

  const target = document.querySelector(hash);
  const visualTarget = getVisualAnchorTarget(target);

  if (!visualTarget) {
    return;
  }

  const top = getDocumentTop(visualTarget) - getAnchorOffsetByHash(hash);
  window.scrollTo({
    top: Math.max(0, top),
    behavior: 'smooth',
  });
}

if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Cerrar menu' : 'Abrir menu');
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', (event) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        event.preventDefault();
        scrollToAnchor(href);
        history.replaceState(null, '', href);
      }

      nav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Abrir menu');
    });
  });
}

window.addEventListener('load', () => {
  if (window.location.hash) {
    scrollToAnchor(window.location.hash);
  }
});

function getMadridWeekdayAndTime() {
  const formatter = new Intl.DateTimeFormat('es-ES', {
    timeZone: 'Europe/Madrid',
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });

  const parts = formatter.formatToParts(new Date());
  const weekday = parts.find((part) => part.type === 'weekday')?.value?.toLowerCase() || '';
  const hour = Number(parts.find((part) => part.type === 'hour')?.value || 0);
  const minute = Number(parts.find((part) => part.type === 'minute')?.value || 0);

  return { weekday, hour, minute };
}

function updateOpenStatus() {
  const statusBadge = document.querySelector('.card-status');
  const statusText = document.querySelector('.status-text');
  const hoursGrid = document.querySelector('.hours-grid');
  const openItem = document.querySelector('.hour-item-open');
  const closeItem = document.querySelector('.hour-item-close');
  const openLabel = openItem?.querySelector('.label');
  const openTime = openItem?.querySelector('.time');
  const closeLabel = closeItem?.querySelector('.label');
  const closeTime = closeItem?.querySelector('.time');

  if (!statusBadge || !statusText) {
    return;
  }

  const { weekday, hour, minute } = getMadridWeekdayAndTime();
  const openDays = new Set(['lunes', 'martes', 'miercoles', 'miércoles', 'jueves', 'viernes', 'sabado', 'sábado']);
  const openMinutes = 10 * 60;
  const closeMinutes = 20 * 60;
  const currentMinutes = hour * 60 + minute;
  const isOpenToday = openDays.has(weekday);
  const isOpenNow = isOpenToday && currentMinutes >= openMinutes && currentMinutes < closeMinutes;

  statusBadge.classList.toggle('open', isOpenNow);
  statusBadge.classList.toggle('closed', !isOpenNow);

  if (isOpenNow) {
    statusText.textContent = 'Abierto ahora';
  } else {
    statusText.textContent = isOpenToday ? 'Cerrado ahora' : 'Cerrado hoy';
  }

  if (!hoursGrid || !openItem || !closeItem || !openLabel || !openTime || !closeLabel || !closeTime) {
    return;
  }

  if (isOpenToday) {
    hoursGrid.classList.remove('closed-day');
    openItem.classList.remove('closed-day');
    closeItem.hidden = false;
    openLabel.textContent = 'Apertura';
    openTime.textContent = '10:00';
    closeLabel.textContent = 'Cierre';
    closeTime.textContent = '20:00';
    return;
  }

  hoursGrid.classList.add('closed-day');
  openItem.classList.add('closed-day');
  closeItem.hidden = true;
  openLabel.textContent = 'Domingo';
  openTime.textContent = 'Cerrado';
}

updateOpenStatus();
setInterval(updateOpenStatus, 60 * 1000);

const revealItems = document.querySelectorAll('.reveal');

revealItems.forEach((item, index) => {
  item.style.animationDelay = `${Math.min(index * 35, 180)}ms`;
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
    threshold: 0.08,
    rootMargin: '0px 0px 10% 0px',
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
