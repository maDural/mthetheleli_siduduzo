/* =========================================
   MOBILE NAVIGATION
========================================= */
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav-links');

function setMenu(open) {
  nav.classList.toggle('open', open);
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
}

menuButton.addEventListener('click', () => setMenu(!nav.classList.contains('open')));

document.querySelectorAll('.nav-links a').forEach(link =>
  link.addEventListener('click', () => setMenu(false))
);

/* Tap outside the menu to close it */
document.addEventListener('click', event => {
  if (nav.classList.contains('open') &&
      !nav.contains(event.target) &&
      !menuButton.contains(event.target)) {
    setMenu(false);
  }
});

/* Reset the menu when the screen grows (e.g. phone rotated or tablet resized) */
const wideScreen = window.matchMedia('(min-width: 901px)');
const onWideChange = event => { if (event.matches) setMenu(false); };
if (wideScreen.addEventListener) wideScreen.addEventListener('change', onWideChange);
else if (wideScreen.addListener) wideScreen.addListener(onWideChange);


/* =========================================
   CURRENT YEAR
========================================= */
document.getElementById('year').textContent = new Date().getFullYear();


/* =========================================
   SCROLL REVEAL ANIMATIONS
========================================= */
const revealItems = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

  revealItems.forEach(el => revealObserver.observe(el));
} else {
  revealItems.forEach(el => el.classList.add('visible'));
}


/* =========================================
   ACTIVE NAV LINK ON SCROLL
========================================= */
const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
const trackedSections = [...navLinks]
  .map(link => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(link => {
        const active = link.getAttribute('href') === '#' + entry.target.id;
        link.classList.toggle('active', active);
        if (active) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  trackedSections.forEach(section => sectionObserver.observe(section));
}


/* =========================================
   CERTIFICATE VIEWER
========================================= */
const certificateModal = document.getElementById('certificateModal');
const certificateFrame = document.getElementById('certificateFrame');
const certificateImageWrap = document.getElementById('certificateImageWrap');
const certificateImage = document.getElementById('certificateImage');
const certificateTitle = document.getElementById('certificateModalTitle');
const originalCertificateLink = document.getElementById('openOriginalCertificate');
const certificateCloseButton = document.querySelector('.certificate-close');

/* Phones and tablets cannot show PDFs inside an iframe reliably
   (Android shows a blank box, iOS shows only page 1), so PDFs open
   in the device's own PDF viewer in a new tab instead. */
const touchDevice = window.matchMedia('(pointer: coarse)');

let previousFocusedElement = null;

function openInNewTab(file) {
  const link = document.createElement('a');
  link.href = file;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function openCertificate(file, title) {
  const isImage = /\.(png|jpe?g|webp|gif)$/i.test(file);

  if (!isImage && touchDevice.matches) {
    openInNewTab(file);
    return;
  }

  previousFocusedElement = document.activeElement;
  certificateTitle.textContent = title || 'Certificate Preview';

  if (isImage) {
    certificateFrame.hidden = true;
    certificateFrame.src = 'about:blank';
    certificateImage.src = file;
    certificateImage.alt = title ? title + ' certificate' : 'Certificate preview';
    certificateImageWrap.hidden = false;
  } else {
    certificateImageWrap.hidden = true;
    certificateImage.src = '';
    certificateFrame.hidden = false;
    certificateFrame.src = file;
    certificateFrame.title = title ? title + ' certificate preview' : 'Certificate preview';
  }

  originalCertificateLink.href = file;
  certificateModal.classList.add('active');
  certificateModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  certificateCloseButton.focus();
}

function closeCertificate() {
  if (!certificateModal.classList.contains('active')) return;

  certificateModal.classList.remove('active');
  certificateModal.setAttribute('aria-hidden', 'true');
  certificateFrame.src = 'about:blank';
  certificateImage.src = '';
  originalCertificateLink.href = '#';
  document.body.style.overflow = '';

  if (previousFocusedElement) previousFocusedElement.focus();
}

/* Open from certificate cards (touch, mouse and keyboard) */
document.querySelectorAll('.certificate-card').forEach(card => {
  card.addEventListener('click', () =>
    openCertificate(card.dataset.cert, card.dataset.title)
  );

  card.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      card.click();
    }
  });
});

/* Close button and tap outside the preview */
certificateCloseButton.addEventListener('click', closeCertificate);

certificateModal.addEventListener('click', event => {
  if (event.target === certificateModal) closeCertificate();
});

/* ESC to close, Tab kept inside the dialog */
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    if (certificateModal.classList.contains('active')) closeCertificate();
    else if (nav.classList.contains('open')) setMenu(false);
    return;
  }

  if (event.key === 'Tab' && certificateModal.classList.contains('active')) {
    const focusable = [originalCertificateLink, certificateCloseButton];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    } else if (!focusable.includes(document.activeElement)) {
      event.preventDefault();
      first.focus();
    }
  }
});