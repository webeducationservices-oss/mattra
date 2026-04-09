/* =============================================================
   Mattra Inc. — Universal Components
   Injects: topbar, header, footer
   Auto-detects subdirectory depth for correct relative paths
   ============================================================= */

(function () {
  const b = '/';

  /* ── Active nav helper ──────────────────────────────────── */
  const path = window.location.pathname;
  function nav(slug, label, href) {
    let active = false;
    if (slug === 'home')    active = path === '/' || path.endsWith('index.html') || path.endsWith('/mattra/');
    else                    active = path.includes(slug);
    return `<a href="${b}${href}" class="${active ? 'active' : ''}">${label}</a>`;
  }

  /* ── Topbar ─────────────────────────────────────────────── */
  const TOPBAR = `
<div class="topbar">
  <div class="container">
    <span>Serving All of Maine &nbsp;&middot;&nbsp; Lewiston &middot; Portland &middot; Augusta &middot; Bangor</span>
    <div class="topbar-right">
      <a href="tel:+12077776020">(207) 777-6020</a>
      <a href="${b}contact.html" class="topbar-cta">Free Consultation</a>
    </div>
  </div>
</div>`;

  /* ── Mega-menu active helpers ──────────────────────────── */
  const serviceSlugs = ['mold','insulation','construction','consulting','services','ventilation','roofing','siding','demolition','waterproofing','rot-repair','water-damage','air-sealing','spray-foam','blown-in','crawl-space','energy-audit','blower-door','rodent','dehumidification','general-contracting','insulation-removal'];
  const resourceSlugs = ['financing','rebates','resources','calculator','for-realtors','blog','glossary','mold-library'];
  function megaActive(slugs) { return slugs.some(s => path.includes(s)); }

  const chevron = `<svg class="nav-chevron" width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 3.5L5 6 7.5 3.5"/></svg>`;

  /* ── Header ─────────────────────────────────────────────── */
  const HEADER = `
<header class="site-header">
  <div class="header-inner">
    <a href="${b}index.html" class="logo" aria-label="Mattra Inc. home">
      <img src="${b}Images/MATTRA-LOGO-4ab44f66-1920w.webp" alt="Mattra Inc. Logo">
    </a>
    <nav class="main-nav" id="main-nav" aria-label="Main navigation">
      ${nav('home', 'Home', 'index.html')}

      <!-- Services Mega Dropdown -->
      <div class="nav-dropdown${megaActive(serviceSlugs) ? ' active' : ''}">
        <button class="nav-dropdown-trigger" aria-expanded="false">Services ${chevron}</button>
        <div class="mega-panel mega-4col">
          <div class="mega-col">
            <h5 class="mega-heading">Mold</h5>
            <a href="${b}mold.html">Mold Overview</a>
            <a href="${b}mold/inspection-testing.html">Inspection &amp; Testing</a>
            <a href="${b}mold/removal-remediation.html">Removal &amp; Remediation</a>
            <a href="${b}mold/real-estate-transactions.html">Real Estate Transactions</a>
          </div>
          <div class="mega-col">
            <h5 class="mega-heading">Insulation</h5>
            <a href="${b}insulation.html">Insulation Overview</a>
            <a href="${b}insulation/spray-foam.html">Spray Foam</a>
            <a href="${b}insulation/blown-in.html">Blown-In</a>
            <a href="${b}insulation/attic.html">Attic</a>
            <a href="${b}insulation/basement.html">Basement</a>
            <a href="${b}insulation/air-sealing.html">Air Sealing</a>
            <a href="${b}insulation/wall.html">Wall</a>
            <a href="${b}insulation/crawl-space.html">Crawl Space</a>
          </div>
          <div class="mega-col">
            <h5 class="mega-heading">Construction</h5>
            <a href="${b}construction.html">Construction Overview</a>
            <a href="${b}construction/rot-repair.html">Rot Repair</a>
            <a href="${b}construction/demolition.html">Demolition</a>
            <a href="${b}construction/water-damage.html">Water Damage Repair</a>
            <a href="${b}construction/basement-waterproofing.html">Basement Waterproofing</a>
            <a href="${b}construction/roofing.html">Roofing</a>
            <a href="${b}construction/siding.html">Siding</a>
            <a href="${b}construction/repair-rebuild.html">Repair &amp; Rebuild</a>
          </div>
          <div class="mega-col">
            <h5 class="mega-heading">Consulting &amp; Other</h5>
            <a href="${b}consulting.html">Consulting Overview</a>
            <a href="${b}other-services/energy-audit.html">Energy Audit</a>
            <a href="${b}other-services/blower-door-testing.html">Blower Door Testing</a>
            <a href="${b}other-services/general-contracting.html">General Contracting</a>
            <a href="${b}construction/ventilation.html">Ventilation</a>
            <a href="${b}services.html">All Services</a>
            <div class="mega-cta-card">
              <strong>Not sure where to start?</strong>
              <p>Book a free consultation and we'll assess your home.</p>
              <a href="${b}contact.html" class="mega-cta-btn">Free Consultation</a>
            </div>
          </div>
        </div>
      </div>

      <!-- Resources Mega Dropdown -->
      <div class="nav-dropdown${megaActive(resourceSlugs) ? ' active' : ''}">
        <button class="nav-dropdown-trigger" aria-expanded="false">Resources ${chevron}</button>
        <div class="mega-panel mega-2col">
          <div class="mega-col">
            <h5 class="mega-heading">Financing &amp; Rebates</h5>
            <a href="${b}financing-rebates.html">Financing &amp; Rebates</a>
            <a href="${b}resources.html#calculators">Rebate Calculator</a>
            <a href="${b}for-realtors.html">For Realtors</a>
          </div>
          <div class="mega-col">
            <h5 class="mega-heading">Learn</h5>
            <a href="${b}resources.html">Resources Hub</a>
            <a href="${b}blog.html">Blog</a>
            <a href="${b}mold-library.html">Mold Glossary</a>
            <a href="${b}service-areas.html">Service Areas</a>
          </div>
        </div>
      </div>

      ${nav('about', 'About', 'about.html')}
      ${nav('contact', 'Contact', 'contact.html')}
    </nav>
    <a href="${b}contact.html" class="header-cta">Get Started</a>
    <button class="mobile-toggle" id="mobile-toggle" aria-label="Toggle menu" aria-expanded="false">
      <span></span><span></span><span></span>
    </button>
  </div>
</header>`;

  /* ── Footer ─────────────────────────────────────────────── */
  const FOOTER = `
<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <a href="${b}index.html" class="logo" aria-label="Mattra Inc. home">
          <img src="${b}Images/MATTRA-LOGO-NEW.webp" alt="Mattra Inc. Logo" style="height:48px;width:auto;filter:brightness(0) invert(1);">
        </a>
        <p>Maine&rsquo;s whole-home experts. 30 years of mold remediation, insulation, and construction services backed by building science.</p>
        <div class="footer-social">
          <a href="https://www.facebook.com/mattrainc" target="_blank" rel="noopener" aria-label="Facebook">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
          </a>
          <a href="https://www.google.com/maps/place/Mattra+Inc" target="_blank" rel="noopener" aria-label="Google">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a7 7 0 0 1 0 14 7 7 0 0 1 0-14"/><path d="M12 8v4l2 2"/></svg>
          </a>
        </div>
      </div>
      <div class="footer-col">
        <h4>Services</h4>
        <a href="${b}mold.html">Mold Remediation</a>
        <a href="${b}insulation.html">Insulation</a>
        <a href="${b}construction.html">Construction</a>
        <a href="${b}consulting.html">Consulting</a>
        <a href="${b}services.html">Other Services</a>
      </div>
      <div class="footer-col">
        <h4>Resources</h4>
        <a href="${b}financing-rebates.html">Financing &amp; Rebates</a>
        <a href="${b}rebate-calculator.html">Rebate Calculator</a>
        <a href="${b}for-realtors.html">For Realtors</a>
        <a href="${b}blog.html">Blog</a>
        <a href="${b}resources.html">Resources</a>
      </div>
      <div class="footer-col">
        <h4>Contact</h4>
        <a href="tel:+12077776020">(207) 777-6020</a>
        <a href="${b}contact.html">Contact Form</a>
        <a href="${b}about.html">About Us</a>
        <a href="${b}service-areas.html">Service Areas</a>
        <a href="${b}privacy.html">Privacy Policy</a>
      </div>
    </div>
    <div class="footer-bottom">
      <span>&copy; ${new Date().getFullYear()} Mattra Inc. All rights reserved.</span>
      <span>
        <a href="${b}privacy.html">Privacy Policy</a> &nbsp;&middot;&nbsp;
        <a href="${b}terms.html">Terms of Service</a>
      </span>
    </div>
  </div>
</footer>`;

  /* ── Inject ─────────────────────────────────────────────── */
  const topbarSlot  = document.getElementById('topbar');
  const headerSlot  = document.getElementById('header');
  const footerSlot  = document.getElementById('footer');
  if (topbarSlot)  topbarSlot.outerHTML = TOPBAR;
  if (headerSlot)  headerSlot.outerHTML = HEADER;
  if (footerSlot)  footerSlot.outerHTML = FOOTER;

  /* ── Favicon ─────────────────────────────────────────────── */
  if (!document.querySelector('link[rel="icon"]')) {
    const fav = document.createElement('link');
    fav.rel = 'icon'; fav.href = b + 'favicon.ico'; fav.type = 'image/x-icon';
    document.head.appendChild(fav);
  }

  /* ── Mobile Menu Toggle ─────────────────────────────────── */
  const toggle = document.getElementById('mobile-toggle');
  const nav2   = document.getElementById('main-nav');
  if (toggle && nav2) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('open');
      nav2.classList.toggle('open');
      toggle.setAttribute('aria-expanded', nav2.classList.contains('open'));
      // Close all mega panels when menu closes
      if (!nav2.classList.contains('open')) {
        nav2.querySelectorAll('.nav-dropdown.open').forEach(d => d.classList.remove('open'));
        nav2.querySelectorAll('.nav-dropdown-trigger').forEach(t => t.setAttribute('aria-expanded', 'false'));
      }
    });
  }

  /* ── Mega Menu: mobile accordion + desktop hover ──────── */
  document.querySelectorAll('.nav-dropdown-trigger').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const dropdown = trigger.closest('.nav-dropdown');
      const isOpen = dropdown.classList.contains('open');
      // Close siblings
      dropdown.parentElement.querySelectorAll('.nav-dropdown.open').forEach(d => {
        if (d !== dropdown) { d.classList.remove('open'); d.querySelector('.nav-dropdown-trigger').setAttribute('aria-expanded', 'false'); }
      });
      dropdown.classList.toggle('open', !isOpen);
      trigger.setAttribute('aria-expanded', !isOpen);
    });
  });

  // Close mega menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-dropdown') && !e.target.closest('.mobile-toggle')) {
      document.querySelectorAll('.nav-dropdown.open').forEach(d => {
        d.classList.remove('open');
        d.querySelector('.nav-dropdown-trigger').setAttribute('aria-expanded', 'false');
      });
    }
  });

  /* ── Slider ─────────────────────────────────────────────── */
  document.querySelectorAll('.slider-container').forEach(container => {
    const track = container.querySelector('.slider-track');
    const dots  = container.querySelectorAll('.slider-dot');
    if (!track || !dots.length) return;
    let current = 0;
    const count = dots.length;

    function goTo(i) {
      current = i;
      track.style.transform = `translateX(-${i * 100}%)`;
      dots.forEach((d, j) => d.classList.toggle('active', j === i));
    }

    dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));

    // Auto-advance every 6s
    let timer = setInterval(() => goTo((current + 1) % count), 6000);
    container.addEventListener('mouseenter', () => clearInterval(timer));
    container.addEventListener('mouseleave', () => {
      timer = setInterval(() => goTo((current + 1) % count), 6000);
    });
  });
})();
