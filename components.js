/* =============================================================
   Mattra Inc. — Universal Components
   Injects: topbar, header, footer
   Auto-detects subdirectory depth for correct relative paths
   ============================================================= */

/* ── Traffic-source attribution (global) ───────────────────────
   Captures first-touch source so form leads carry Analytics Source /
   Source Data 1 & 2 / First Referrer / First URL into the notification
   email + Google Sheet. First non-direct result is cached in
   sessionStorage so internal navigation (which strips ?utm_…) doesn't
   wash it out. Spread its return into each form payload (LAST).
   See FORMS-SOURCE-ATTRIBUTION.md. =========================== */
function getSourceAttribution() {
  var KEY = 'wes_first_touch_source';
  var p = new URLSearchParams(window.location.search);
  var hasFresh = p.has('utm_source') || p.has('gclid') || p.has('fbclid') || p.has('msclkid');
  if (!hasFresh) {
    try {
      var cached = JSON.parse(sessionStorage.getItem(KEY) || 'null');
      if (cached) return cached;
    } catch (e) {}
  }
  var utm_source = (p.get('utm_source') || '').toLowerCase();
  var utm_medium = (p.get('utm_medium') || '').toLowerCase();
  var utm_campaign = p.get('utm_campaign') || '';
  var utm_term = p.get('utm_term') || '';
  var gclid = p.get('gclid'), fbclid = p.get('fbclid'), msclkid = p.get('msclkid');
  var ref = document.referrer || '';
  var refHost = ''; try { refHost = ref ? new URL(ref).hostname : ''; } catch (e) {}
  var offSite = ref && refHost && refHost !== window.location.hostname;
  var src = 'DIRECT_TRAFFIC', d1 = '', d2 = '';

  if (gclid)        { src = 'PAID_SEARCH'; d1 = 'google'; d2 = utm_term || utm_campaign || gclid; }
  else if (msclkid) { src = 'PAID_SEARCH'; d1 = 'bing';   d2 = utm_term || utm_campaign || msclkid; }
  else if (fbclid)  { src = 'PAID_SOCIAL'; d1 = utm_source || 'facebook'; d2 = utm_campaign || fbclid; }
  else if (utm_source) {
    if (utm_medium === 'email' || utm_source === 'hs_email') { src = 'EMAIL_MARKETING'; d1 = utm_source; d2 = utm_campaign; }
    else if (utm_medium === 'cpc' || utm_medium === 'ppc' || utm_medium === 'paid') {
      src = /google|bing|yahoo/.test(utm_source) ? 'PAID_SEARCH' : 'PAID_SOCIAL';
      d1 = utm_source; d2 = utm_term || utm_campaign;
    }
    else if (utm_medium === 'social' || utm_medium === 'social_media') { src = 'SOCIAL_MEDIA'; d1 = utm_source; d2 = utm_campaign; }
    else if (utm_medium === 'referral') { src = 'REFERRALS'; d1 = utm_source; d2 = utm_campaign; }
    else { src = 'OTHER_CAMPAIGNS'; d1 = utm_source; d2 = utm_campaign; }
  } else if (offSite) {
    if (/^(www\.)?(google|bing|duckduckgo|yahoo|ecosia)\.[a-z.]+$/i.test(refHost)) { src = 'ORGANIC_SEARCH'; d1 = refHost.replace(/^www\./,'').split('.')[0]; }
    else if (/^(www\.)?(facebook|instagram|twitter|x|linkedin|tiktok|pinterest|reddit|youtube|t)\.com$/i.test(refHost)) { src = 'SOCIAL_MEDIA'; d1 = refHost.replace(/^www\./,'').split('.')[0]; }
    else { src = 'REFERRALS'; d1 = refHost; }
  }

  var result = {
    analytics_source: src,
    analytics_source_data_1: d1,
    analytics_source_data_2: d2,
    first_referrer: ref,
    first_url: window.location.href
  };
  try { sessionStorage.setItem(KEY, JSON.stringify(result)); } catch (e) {}
  return result;
}

(function () {
  const b = '/';

  /* Capture first-touch source on EVERY page load so it's cached before
     the visitor navigates to a clean internal URL and reaches a form. */
  try { getSourceAttribution(); } catch (e) {}

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
  const serviceSlugs = ['mold','insulation','construction','consulting','services','ventilation','roofing','siding','demolition','waterproofing','rot-repair','water-damage','air-sealing','spray-foam','blown-in','crawl-space','energy-audit','blower-door','rodent','dehumidification','general-contracting','insulation-removal','efficiency-maine'];
  const resourceSlugs = ['financing','rebates','resources','calculator','for-realtors','blog','glossary','mold-library'];
  function megaActive(slugs) { return slugs.some(s => path.includes(s)); }

  const chevron = `<svg class="nav-chevron" width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 3.5L5 6 7.5 3.5"/></svg>`;

  /* ── Header ─────────────────────────────────────────────── */
  const HEADER = `
<header class="site-header">
  <div class="header-inner">
    <a href="${b}index.html" class="logo" aria-label="Mattra Inc. home">
      <img src="${b}Images/MATTRA-LOGO-4ab44f66-1920w.webp" alt="Mattra Inc. Logo" width="167" height="52">
    </a>
    <nav class="main-nav" id="main-nav" aria-label="Main navigation">
      <div class="mobile-menu-top">
        <a href="${b}index.html" class="mobile-menu-logo" aria-label="Mattra Inc. home">
          <img src="${b}Images/MATTRA-LOGO-4ab44f66-1920w.webp" alt="Mattra Inc." width="167" height="52">
        </a>
        <button type="button" class="mobile-menu-close" id="mobile-menu-close" aria-label="Close menu">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <a href="tel:+12077776020" class="mobile-menu-phone">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        (207) 777-6020
      </a>
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
            <a href="${b}efficiency-maine.html">Efficiency Maine Rebates</a>
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
            <a href="${b}rebate-calculator.html">Rebate Calculator</a>
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
      <a href="${b}contact.html" class="mobile-menu-cta">Free Consultation</a>
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
          <img src="${b}Images/MATTRA-LOGO-FOOTER.webp" alt="Mattra Inc. Logo" width="154" height="48">
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

  /* ── Efficiency Maine rebate-change notice (Oct 1, 2026) ──────
     Shown on rebate-related pages only, until the program change
     takes effect. Remove this block (and REBATE_NOTICE_PAGES) once
     the new rules are the site-wide default. ────────────────── */
  const REBATE_NOTICE_UNTIL = new Date('2026-10-01T00:00:00-04:00');
  const REBATE_NOTICE_PAGES = [
    'financing', 'rebate', 'efficiency-maine', 'insulation', 'air-sealing',
    'calculators', 'resources', 'mobile-home', 'income-based'
  ];
  (function rebateNotice() {
    if (new Date() >= REBATE_NOTICE_UNTIL) return;
    const p = window.location.pathname.toLowerCase();
    // Never show it on the changes page itself
    if (p.indexOf('efficiency-maine-rebate-changes') !== -1) return;
    const isHome = p === '/' || p === '/index.html' || p.endsWith('/index.html');
    const match = isHome || REBATE_NOTICE_PAGES.some(k => p.indexOf(k) !== -1);
    if (!match) return;

    if (!document.getElementById('rebate-notice-css')) {
      const st = document.createElement('style');
      st.id = 'rebate-notice-css';
      st.textContent = `
        .rebate-notice{background:#fdf7e3;border-bottom:1px solid #ecdca6;padding:14px 0}
        .rebate-notice .rn-inner{max-width:1200px;margin:0 auto;padding:0 24px;display:flex;align-items:center;gap:14px;flex-wrap:wrap}
        .rebate-notice .rn-tag{background:var(--gold-accent,#e7bb3a);color:var(--text-dark,#2c2c2c);font-size:.68rem;font-weight:700;letter-spacing:.07em;text-transform:uppercase;padding:4px 10px;border-radius:100px;white-space:nowrap}
        .rebate-notice p{margin:0;font-size:.92rem;color:var(--text-dark,#2c2c2c);line-height:1.5;flex:1;min-width:240px}
        .rebate-notice a.rn-link{color:var(--green-primary,#316b43);font-weight:700;text-decoration:underline;white-space:nowrap}
        @media(max-width:600px){.rebate-notice{padding:12px 0}.rebate-notice p{font-size:.86rem}}
      `;
      document.head.appendChild(st);
    }

    const bar = document.createElement('div');
    bar.className = 'rebate-notice';
    bar.innerHTML = `
      <div class="rn-inner">
        <span class="rn-tag">Heads up</span>
        <p>Efficiency Maine insulation rebates change on <strong>October&nbsp;1, 2026</strong> &mdash; moving from a percentage of project cost to a set amount for each area of your home. Rebate amounts shown on this page apply to projects completed before then.</p>
        <a class="rn-link" href="${b}efficiency-maine-rebate-changes-2026">See what's changing &rarr;</a>
      </div>`;

    const main = document.querySelector('main');
    if (main) { main.insertBefore(bar, main.firstChild); return; }
    const hdr = document.querySelector('header.site-header, .site-header');
    if (hdr && hdr.parentNode) { hdr.parentNode.insertBefore(bar, hdr.nextSibling); return; }
    document.body.insertBefore(bar, document.body.firstChild);
  })();

  /* ── Favicon ─────────────────────────────────────────────── */
  if (!document.querySelector('link[rel="icon"]')) {
    const fav = document.createElement('link');
    fav.rel = 'icon'; fav.href = b + 'favicon.ico'; fav.type = 'image/x-icon';
    document.head.appendChild(fav);
  }

  /* ── Mobile Menu Toggle ─────────────────────────────────── */
  const toggle   = document.getElementById('mobile-toggle');
  const nav2     = document.getElementById('main-nav');
  const closeBtn = document.getElementById('mobile-menu-close');

  // Inject backdrop
  let backdrop = document.querySelector('.mobile-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.className = 'mobile-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.appendChild(backdrop);
  }

  function openMobileMenu() {
    if (!nav2) return;
    nav2.classList.add('open');
    backdrop.classList.add('open');
    toggle && toggle.classList.add('open');
    toggle && toggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
  }

  function closeMobileMenu() {
    if (!nav2) return;
    nav2.classList.remove('open');
    backdrop.classList.remove('open');
    toggle && toggle.classList.remove('open');
    toggle && toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
    // Collapse any open mega panels
    nav2.querySelectorAll('.nav-dropdown.open').forEach(d => d.classList.remove('open'));
    nav2.querySelectorAll('.nav-dropdown-trigger').forEach(t => t.setAttribute('aria-expanded', 'false'));
  }

  if (toggle && nav2) {
    toggle.addEventListener('click', () => {
      if (nav2.classList.contains('open')) closeMobileMenu();
      else openMobileMenu();
    });
  }
  if (closeBtn)  closeBtn.addEventListener('click', closeMobileMenu);
  if (backdrop)  backdrop.addEventListener('click', closeMobileMenu);

  // Escape key closes the menu
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav2 && nav2.classList.contains('open')) closeMobileMenu();
  });

  // Tapping a leaf nav link closes the menu
  if (nav2) {
    nav2.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', (e) => {
        // Ignore the mobile logo tap so it navigates home cleanly
        if (link.classList.contains('mobile-menu-logo')) return;
        if (nav2.classList.contains('open')) closeMobileMenu();
      });
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
