/* =============================================================
   Maine Insulation Savings Check (stand-alone ad landing page)
   Mounts into <div id="sc-app"> on /energy-savings-check/.

   Flow: housing -> size -> name -> address + phone + owner -> benefits
         -> income -> project -> heating cost -> results -> email.
   The lead is saved the moment the address/phone step is continued
   (form_type savings-check-partial), so abandoned visitors still reach
   the team. The email step saves the full record (savings-check-complete).

   Money rules match green-bank-planner.js: rebate from rebate-rules.js,
   Actual/360 simple-interest payments, the same four Green Bank loans.
   The estimate is ALWAYS a single $5,000 example project. Real prices
   are set at an on-site estimate, and the page says so.
   ============================================================= */
(function () {
  'use strict';
  var ROOT = document.getElementById('sc-app');
  if (!ROOT || typeof MattraRebates === 'undefined') return;

  var ENDPOINT = 'https://myaieditor.com/api/form-notify';
  var RC_SITE_KEY = '6Lck8aQsAAAAALMA-T6nwfkSf7bv4K-mOhkszeKh';
  var PHONE = '(207) 777-6020';
  var LOAD_TS = Date.now();
  var URL_REGISTER = 'https://greenbank.efficiencymaine.com/auth/register/2120gscw2';
  var URL_VERIFY = 'https://www.efficiencymaine.com/income-based-eligibility-verification/';
  var PROJECT_COST = 5000;
  var SAVE_LOW = 0.20, SAVE_HIGH = 0.30;

  var LOANS = [
    { id: '5y',  name: '5-year loan, 5.99% APR',  apr: 0.0599, years: 5,  income: false },
    { id: '10y', name: '10-year loan, 7.99% APR', apr: 0.0799, years: 10, income: false },
    { id: 'inc', name: 'Income-based 10-year loan, 5.99% APR', apr: 0.0599, years: 10, income: true }
  ];
  function payment(p, apr, years) {
    var n = years * 12, r = (apr / 12) * (365 / 360);
    return p <= 0 ? 0 : p * r / (1 - Math.pow(1 + r, -n));
  }
  function money(n, d) {
    return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 });
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ---------- state ---------- */
  var D = { housing: '', size: '', first: '', last: '', address: '', town: '', zip: '', phone: '', owner: '',
            benefits: '', filing: '', agi: '', area: '', heat: '', fuel: '', email: '', loanId: '', sms: false };
  var step = 0, sending = false, partialSent = false;

  var HOUSING = { single: 'Single-family home', mobile: 'Mobile or manufactured home', multi: 'Multi-unit building (2 to 4 units)' };
  var SIZES = [
    { v: 'u800',  t: 'Under 800 sq ft' }, { v: '800',  t: '800 to 1,499 sq ft' },
    { v: '1500',  t: '1,500 to 2,499 sq ft' }, { v: '2500', t: '2,500 sq ft or more' }
  ];
  var HEATS = [
    { v: 90,  t: 'Under $125' }, { v: 175, t: '$125 to $225' }, { v: 275, t: '$225 to $325' },
    { v: 390, t: '$325 to $450' }, { v: 525, t: 'More than $450' }
  ];
  var FUELS = ['Heating oil', 'Propane', 'Electric or heat pump', 'Natural gas', 'Wood or pellets', 'Other'];

  /* ---------- tier + figures ---------- */
  function tier() {
    if (D.benefits === 'yes') return 'low';
    if (D.agi === 'under') return 'moderate';
    return 'any';
  }
  var TIER_NAME = { any: 'Any income', moderate: 'Moderate income', low: 'Low income' };

  function figures() {
    var t = tier(), mobile = D.housing === 'mobile';
    var area = D.area === 'basement' ? 'basement' : 'attic';
    var band = (D.size === 'u800' && !mobile) ? 'small' : 'large';
    var rb = MattraRebates.compute({
      tier: t, projectCost: PROJECT_COST, isMobileHome: mobile,
      zones: [{ type: area, band: band }]
    });
    var rebate = rb.rebate, loan = Math.max(0, PROJECT_COST - rebate);
    var loans = LOANS.filter(function (l) { return t === 'any' ? !l.income : l.income || l.id === '5y'; })
      .map(function (l) { return { l: l, pay: payment(loan, l.apr, l.years) }; });
    loans.sort(function (a, b) { return a.pay - b.pay; });
    var pick = loans.filter(function (x) { return x.l.id === D.loanId; })[0] || loans[0];
    var heat = Number(D.heat) || 0;
    return { tier: t, rebate: rebate, loan: loan, loans: loans, pick: pick,
             saveLow: Math.round(heat * SAVE_LOW), saveHigh: Math.round(heat * SAVE_HIGH) };
  }

  /* ---------- styles ---------- */
  var css = document.createElement('style');
  css.textContent =
  '#sc-app{--g:var(--green-primary,#316b43);--gd:var(--green-dark,#1e3a28);--au:var(--gold-accent,#e7bb3a);font-family:inherit;color:var(--text-body,#4a4a4a)}' +
  '.sc-card{background:#fff;border-radius:18px;box-shadow:0 14px 44px rgba(0,0,0,.14);padding:28px 26px 30px}' +
  '.sc-bar{height:7px;background:#e8ecee;border-radius:99px;overflow:hidden;margin-bottom:6px}.sc-bar i{display:block;height:100%;background:linear-gradient(90deg,var(--g),var(--au));transition:width .35s}' +
  '.sc-count{font-size:.78rem;color:var(--text-light,#6b6b6b);margin-bottom:18px}' +
  '.sc-card h2{font-size:1.45rem;line-height:1.25;color:var(--text-dark,#2c2c2c);margin:0 0 6px}' +
  '.sc-help{margin:0 0 18px;font-size:.95rem;line-height:1.55;color:var(--text-light,#6b6b6b)}' +
  '.sc-opts{display:grid;gap:10px}.sc-opts.two{grid-template-columns:1fr 1fr}' +
  '.sc-opt{display:block;width:100%;text-align:left;border:2px solid var(--border-light,#d9dde2);background:#fff;border-radius:12px;padding:15px 16px;font:inherit;font-weight:600;color:var(--text-dark,#2c2c2c);cursor:pointer;transition:all .15s}' +
  '.sc-opt:hover{border-color:var(--g);transform:translateY(-1px)}.sc-opt small{display:block;font-weight:400;color:var(--text-light,#6b6b6b);margin-top:3px}' +
  '.sc-opt[aria-pressed=true]{border-color:var(--g);background:#f0f7f2;box-shadow:0 0 0 3px rgba(49,107,67,.15)}' +
  '.sc-f{margin-top:12px}.sc-f label{display:block;font-weight:700;font-size:.88rem;color:var(--text-dark,#2c2c2c);margin-bottom:6px}' +
  '.sc-f input[type=text],.sc-f input[type=tel],.sc-f input[type=email]{width:100%;box-sizing:border-box;padding:13px 14px;border:2px solid var(--border-light,#d9dde2);border-radius:10px;font:inherit}' +
  '.sc-f input:focus{outline:none;border-color:var(--g)}.sc-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}' +
  '.sc-nav{display:flex;gap:12px;align-items:center;margin-top:22px}' +
  '.sc-btn{background:var(--g);color:#fff;border:0;border-radius:12px;padding:15px 30px;font:inherit;font-weight:700;font-size:1.02rem;cursor:pointer;text-decoration:none;display:inline-block;text-align:center}' +
  '.sc-btn:hover{background:var(--gd)}.sc-btn:disabled{opacity:.55;cursor:wait}.sc-btn.go{background:var(--au);color:#2c2c2c}.sc-btn.go:hover{background:var(--gold-dark,#c9a020)}' +
  '.sc-back{background:none;border:0;color:var(--text-light,#6b6b6b);font:inherit;cursor:pointer;text-decoration:underline;padding:6px}' +
  '.sc-err{display:none;background:#f9e6e6;color:#8a2a2a;border-radius:8px;padding:10px 14px;margin-top:14px;font-size:.9rem}.sc-err.on{display:block}' +
  '.sc-fine{font-size:.78rem;line-height:1.55;color:var(--text-light,#6b6b6b);margin-top:14px}' +
  '.sc-big{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:16px 0}' +
  '.sc-stat{border-radius:14px;padding:16px;background:#f0f7f2;text-align:center}.sc-stat.gold{background:#fdf7e3}' +
  '.sc-stat .n{font-family:"DM Serif Display","DM Serif Fallback",serif;font-size:1.9rem;line-height:1.1;color:var(--g)}.sc-stat.gold .n{color:#8a6a00}' +
  '.sc-stat .l{font-size:.8rem;margin-top:4px;color:var(--text-body,#4a4a4a)}' +
  '.sc-net{background:linear-gradient(135deg,var(--gd),var(--g));color:#fff;border-radius:14px;padding:20px;text-align:center;margin:14px 0}' +
  '.sc-net .n{font-family:"DM Serif Display","DM Serif Fallback",serif;font-size:2.2rem;color:var(--au);line-height:1.1}.sc-net p{margin:6px 0 0;color:rgba(255,255,255,.92);font-size:.95rem;line-height:1.5}' +
  '.sc-call{background:#fdf7e3;border-left:4px solid var(--au);border-radius:8px;padding:13px 16px;margin:14px 0;font-size:.92rem;color:var(--text-dark,#2c2c2c);line-height:1.55}' +
  '.sc-loans{display:grid;gap:10px;margin:12px 0}' +
  '@media(max-width:560px){.sc-card{padding:22px 16px 24px}.sc-opts.two,.sc-row,.sc-big{grid-template-columns:1fr}}';
  document.head.appendChild(css);

  /* ---------- helpers ---------- */
  var STEPS = ['housing', 'size', 'name', 'contact', 'benefits', 'income', 'project', 'heat', 'results'];
  function opt(label, key, val, sub, cur) {
    return '<button type="button" class="sc-opt" data-k="' + key + '" data-v="' + esc(val) + '" aria-pressed="' + (cur === val) + '">' + label + (sub ? '<small>' + sub + '</small>' : '') + '</button>';
  }
  function frame(inner, showBack) {
    var pct = Math.round((step / (STEPS.length - 1)) * 100);
    ROOT.innerHTML = '<div class="sc-card" role="group" aria-label="Savings check">' +
      '<div class="sc-bar"><i style="width:' + Math.max(pct, 6) + '%"></i></div>' +
      '<div class="sc-count">Step ' + (step + 1) + ' of ' + STEPS.length + '</div>' + inner +
      '<div class="sc-err" id="sc-err" role="alert"></div>' +
      (showBack && step > 0 ? '<div class="sc-nav"><button type="button" class="sc-back" id="sc-back">Back</button></div>' : '') + '</div>';
    var b = document.getElementById('sc-back');
    if (b) b.addEventListener('click', function () { step -= (STEPS[step] === 'project' && D.benefits === 'yes') ? 2 : 1; render(); });
    window.scrollTo({ top: Math.max(0, ROOT.getBoundingClientRect().top + window.pageYOffset - 70), behavior: 'smooth' });
  }
  function err(t) { var e = document.getElementById('sc-err'); e.textContent = t; e.className = 'sc-err on'; }
  function pickOne(key, advance) {
    ROOT.querySelectorAll('.sc-opt[data-k="' + key + '"]').forEach(function (b) {
      b.addEventListener('click', function () {
        D[key] = b.getAttribute('data-v');
        ROOT.querySelectorAll('.sc-opt[data-k="' + key + '"]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        if (advance !== false) setTimeout(function () { step += 1; render(); }, 180);
      });
    });
  }
  function track(name, extra) {
    window.dataLayer = window.dataLayer || [];
    var o = { event: name, form_location: location.pathname }; for (var k in (extra || {})) o[k] = extra[k];
    window.dataLayer.push(o);
  }

  /* ---------- submission ---------- */
  var rcLoaded = false;
  function loadRc() {
    if (rcLoaded) return; rcLoaded = true;
    if (document.querySelector('script[src*="recaptcha"]')) return;
    var s = document.createElement('script'); s.src = 'https://www.google.com/recaptcha/api.js?render=' + RC_SITE_KEY; s.async = true; document.head.appendChild(s);
  }
  ['pointerdown', 'keydown', 'touchstart'].forEach(function (e) { document.addEventListener(e, loadRc, { once: true, passive: true }); });
  function rcToken(action) {
    try {
      if (typeof grecaptcha === 'undefined' || typeof grecaptcha.execute !== 'function') return Promise.resolve('');
      var done = false;
      return Promise.race([
        Promise.resolve(grecaptcha.execute(RC_SITE_KEY, { action: action })).then(function (t) { done = true; return t; }, function () { done = true; return ''; }),
        new Promise(function (r) { setTimeout(function () { r(''); }, 8000); })
      ]).catch(function () { return ''; });
    } catch (e) { return Promise.resolve(''); }
  }
  function attribution() {
    var p = new URLSearchParams(location.search), o = {};
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'gclid', 'gbraid', 'wbraid'].forEach(function (k) { if (p.get(k)) o[k] = p.get(k); });
    var src = 'DIRECT_TRAFFIC';
    if (p.get('gclid') || p.get('gbraid') || p.get('wbraid')) src = 'PAID_SEARCH';
    else if ((p.get('utm_medium') || '').toLowerCase() === 'cpc') src = 'PAID_SEARCH';
    else if (document.referrer) src = 'REFERRALS';
    o.analytics_source = src; o.analytics_source_data_1 = p.get('utm_source') || ''; o.analytics_source_data_2 = p.get('utm_term') || p.get('utm_campaign') || '';
    o.first_referrer = document.referrer || ''; o.first_url = location.href;
    return o;
  }
  function body(formType, f) {
    var p = {
      site_slug: 'mattra', form_type: formType,
      first_name: D.first, last_name: D.last, phone: D.phone, address: D.address, city: D.town, state: 'ME', zip: D.zip,
      lead_page: 'energy-savings-check', homeowner: D.owner === 'own' ? 'Owns the home' : 'Rents (not eligible)',
      housing_type: HOUSING[D.housing] || '', home_size: (SIZES.filter(function (s) { return s.v === D.size; })[0] || {}).t || '',
      financing_interest: 'Yes, tell me more', _honey: '', _ts: LOAD_TS
    };
    if (D.owner === 'own') {
      p.receives_benefits = D.benefits === 'yes' ? 'Yes (SNAP, HEAP, TANF or MaineCare)' : 'No';
      if (D.filing) p.filing_status = D.filing === 'joint' ? 'Married filing jointly' : 'Single or other';
      if (D.agi) p.agi_range = { under: 'Under the Efficiency Maine limit', over: 'Over the limit', unsure: 'Not sure' }[D.agi];
      if (D.benefits) p.estimated_income_tier = TIER_NAME[tier()];
      if (D.area) p.project_area = D.area;
    }
    if (D.email) p.email = D.email;
    if (f) {
      p.example_project_cost = String(PROJECT_COST); p.rebate_estimate = String(f.rebate); p.loan_estimate = String(f.loan);
      p.loan_option = f.pick ? f.pick.l.name + ': about ' + money(f.pick.pay) + '/mo' : '';
      p.monthly_heating_cost = String(D.heat || ''); p.heating_fuel = D.fuel || '';
      p.savings_estimate_monthly = money(f.saveLow) + ' to ' + money(f.saveHigh);
      p.next_step = f.tier === 'any' ? 'Green Bank account and application' : 'Income verification, then Green Bank application';
    }
    if (D.sms) p.sms_consent = 'true';
    try { Object.assign(p, attribution()); } catch (e) {}
    return p;
  }
  async function post(formType, f, action) {
    if (typeof grecaptcha === 'undefined') {
      loadRc();
      for (var w = 0; w < 12 && typeof grecaptcha === 'undefined'; w++) await new Promise(function (r) { setTimeout(r, 250); });
    }
    var payload = body(formType, f);
    payload.recaptcha_token = await rcToken(action);
    try {
      var res = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      var j = await res.json().catch(function () { return {}; });
      return res.ok && j.accepted !== false;
    } catch (e) { console.error('submit error:', e); return false; }
  }

  /* ---------- steps ---------- */
  var VIEWS = {
    housing: function () {
      frame('<h2>What kind of home do you have?</h2><p class="sc-help">Maine has different opportunities for different homes, so we start here.</p><div class="sc-opts">' +
        opt('Single-family home', 'housing', 'single', '', D.housing) + opt('Mobile or manufactured home', 'housing', 'mobile', '', D.housing) +
        opt('Multi-unit building', 'housing', 'multi', '2 to 4 units', D.housing) + '</div>');
      pickOne('housing');
    },
    size: function () {
      frame('<h2>About how big is your home?</h2><p class="sc-help">Living space is fine. A rough guess works.</p><div class="sc-opts two">' +
        SIZES.map(function (s) { return opt(s.t, 'size', s.v, '', D.size); }).join('') + '</div>', true);
      pickOne('size');
    },
    name: function () {
      frame('<h2>What should we call you?</h2><p class="sc-help">So your results are addressed to the right person.</p>' +
        '<div class="sc-row"><div class="sc-f"><label for="sc-first">First name *</label><input type="text" id="sc-first" autocomplete="given-name" value="' + esc(D.first) + '"></div>' +
        '<div class="sc-f"><label for="sc-last">Last name</label><input type="text" id="sc-last" autocomplete="family-name" value="' + esc(D.last) + '"></div></div>' +
        '<div class="sc-nav"><button class="sc-btn" id="sc-next" type="button">Continue</button></div>', true);
      document.getElementById('sc-next').addEventListener('click', function () {
        var f = document.getElementById('sc-first').value.trim();
        if (!f) return err('Please add your first name.');
        D.first = f; D.last = document.getElementById('sc-last').value.trim(); step += 1; render();
      });
    },
    contact: function () {
      frame('<h2>Where is the home, ' + esc(D.first) + '?</h2><p class="sc-help">We use this to confirm your area and to call you about your free estimate. We do not share it or sell it.</p>' +
        '<div class="sc-f"><label for="sc-addr">Home street address *</label><input type="text" id="sc-addr" autocomplete="address-line1" value="' + esc(D.address) + '"></div>' +
        '<div class="sc-row"><div class="sc-f"><label for="sc-town">Town *</label><input type="text" id="sc-town" autocomplete="address-level2" value="' + esc(D.town) + '"></div>' +
        '<div class="sc-f"><label for="sc-zip">ZIP code *</label><input type="text" id="sc-zip" inputmode="numeric" maxlength="5" autocomplete="postal-code" value="' + esc(D.zip) + '"></div></div>' +
        '<div class="sc-f"><label for="sc-phone">Best phone number *</label><input type="tel" id="sc-phone" inputmode="tel" autocomplete="tel" value="' + esc(D.phone) + '"></div>' +
        '<div class="sc-f"><label>Do you own this home? *</label><div class="sc-opts two">' + opt('I own it', 'owner', 'own', '', D.owner) + opt('I rent it', 'owner', 'rent', '', D.owner) + '</div></div>' +
        '<label class="sc-fine" style="display:flex;gap:9px;align-items:flex-start"><input type="checkbox" id="sc-sms" style="margin-top:3px"' + (D.sms ? ' checked' : '') + '><span>I agree to receive text messages from Mattra Inc. about my request, appointment updates, and offers. Msg frequency varies. Msg &amp; data rates may apply. Reply STOP to cancel, HELP for help. Optional, and not a condition of any purchase. <a href="/privacy/" target="_blank" rel="noopener">Privacy</a> &amp; <a href="/terms/" target="_blank" rel="noopener">Terms</a>.</span></label>' +
        '<p class="sc-fine">By continuing you agree that Mattra Inc. may contact you by phone or email about your request.</p>' +
        '<div class="sc-nav"><button class="sc-btn" id="sc-next" type="button">Continue</button></div>', true);
      pickOne('owner', false);
      document.getElementById('sc-next').addEventListener('click', async function () {
        var a = document.getElementById('sc-addr').value.trim(), t = document.getElementById('sc-town').value.trim(),
            z = document.getElementById('sc-zip').value.trim(), p = document.getElementById('sc-phone').value.trim();
        if (!a) return err('Please add the street address of the home.');
        if (!t) return err('Please add the town.');
        if (!/^\d{5}$/.test(z)) return err('Please enter a 5-digit ZIP code.');
        if (p.replace(/\D/g, '').length < 10) return err('Please add a phone number with area code so we can reach you.');
        if (!D.owner) return err('Please tell us whether you own or rent the home.');
        D.address = a; D.town = t; D.zip = z; D.phone = p; D.sms = document.getElementById('sc-sms').checked;
        var btn = this; btn.disabled = true; btn.textContent = 'Saving...';
        /* Save the lead now. If it fails we still let them continue; the final
           step saves everything again and shows the call-us message if that fails too. */
        partialSent = await post('savings-check-partial', null, 'savings_check_partial');
        track('lead_partial', { form_type: 'savings-check-partial', accepted: partialSent });
        btn.disabled = false; btn.textContent = 'Continue';
        if (D.owner === 'rent') { step = -1; return render(); }
        var outOfState = !/^0(39|4[0-9])/.test(z);
        if (outOfState) { step = -2; return render(); }
        step += 1; render();
      });
    },
    benefits: function () {
      frame('<h2>Does anyone in your household get one of these?</h2><p class="sc-help">SNAP, HEAP (home energy assistance), TANF, or MaineCare. These can qualify you for the highest rebates and an income-based loan.</p><div class="sc-opts">' +
        opt('Yes, at least one of them', 'benefits', 'yes', '', D.benefits) + opt('No, none of these', 'benefits', 'no', '', D.benefits) + opt('Not sure', 'benefits', 'no', 'We will check at the estimate', '') + '</div>', true);
      pickOne('benefits', false);
      ROOT.querySelectorAll('.sc-opt[data-k="benefits"]').forEach(function (b) {
        b.addEventListener('click', function () { setTimeout(function () { step = D.benefits === 'yes' ? step + 2 : step + 1; render(); }, 180); });
      });
    },
    income: function () {
      frame('<h2>A quick tax question</h2><p class="sc-help">Efficiency Maine pays higher rebates when household income is at or below $70,000 (single filers) or $100,000 (joint filers) of adjusted gross income. The AGI is on line 11 of your Form 1040. A rough answer is fine.</p>' +
        '<div class="sc-f"><label>How do you file?</label><div class="sc-opts two">' + opt('Single or other', 'filing', 'single', '', D.filing) + opt('Married, filing jointly', 'filing', 'joint', '', D.filing) + '</div></div>' +
        '<div class="sc-f"><label id="sc-agi-l">Is your household AGI below ' + (D.filing === 'joint' ? '$100,000' : D.filing === 'single' ? '$70,000' : 'the limit for your filing status') + '?</label><div class="sc-opts">' +
        opt('Yes, at or below', 'agi', 'under', '', D.agi) + opt('No, above', 'agi', 'over', '', D.agi) + opt('Not sure', 'agi', 'unsure', '', D.agi) + '</div></div>' +
        '<div class="sc-nav"><button class="sc-btn" id="sc-next" type="button">Continue</button></div>', true);
      pickOne('filing', false); pickOne('agi', false);
      ROOT.querySelectorAll('.sc-opt[data-k="filing"]').forEach(function (b) { b.addEventListener('click', function () { var l = document.getElementById('sc-agi-l'); if (l) l.textContent = 'Is your household AGI below ' + (D.filing === 'joint' ? '$100,000' : '$70,000') + '?'; }); });
      document.getElementById('sc-next').addEventListener('click', function () {
        if (!D.filing || !D.agi) return err('Please answer both questions. "Not sure" is fine.');
        step += 1; render();
      });
    },
    project: function () {
      var mobile = D.housing === 'mobile';
      frame('<h2>Where would you start?</h2><p class="sc-help">Most homes begin with one area. A typical attic or ' + (mobile ? 'underbelly' : 'basement') + ' project runs about $5,000, so that is what we will estimate.</p><div class="sc-opts">' +
        opt('Attic', 'area', 'attic', 'Usually about $5,000', D.area) + opt(mobile ? 'Underbelly (under the home)' : 'Basement or crawl space', 'area', 'basement', 'Usually about $5,000', D.area) +
        opt('Not sure yet', 'area', 'attic', 'We will use the attic example', '') + '</div>' +
        '<p class="sc-fine">This is an example only. Your real price is set at an on-site estimate, and we will call you to schedule it.</p>', true);
      pickOne('area');
    },
    heat: function () {
      frame('<h2>What do you spend on heat each month?</h2><p class="sc-help">Think of a yearly average, not just the winter peak. This lets us show your savings next to your payment.</p>' +
        '<div class="sc-opts two">' + HEATS.map(function (h) { return opt(h.t, 'heat', String(h.v), '', String(D.heat)); }).join('') + '</div>' +
        '<div class="sc-f"><label>Main heat source</label><div class="sc-opts two">' + FUELS.map(function (f) { return opt(f, 'fuel', f, '', D.fuel); }).join('') + '</div></div>' +
        '<div class="sc-nav"><button class="sc-btn" id="sc-next" type="button">Show my results</button></div>', true);
      pickOne('heat', false); pickOne('fuel', false);
      document.getElementById('sc-next').addEventListener('click', function () {
        if (!D.heat || !D.fuel) return err('Please pick a monthly amount and your main heat source.');
        step += 1; render();
      });
    },
    results: function () {
      var f = figures(), pick = f.pick;
      var netLow = f.saveLow - Math.round(pick.pay), netHigh = f.saveHigh - Math.round(pick.pay);
      var thin = netLow < 0;
      var inc = f.tier !== 'any';
      track('lead_results_view', { form_type: 'savings-check', tier: f.tier });
      var loanCards = f.loans.map(function (x) {
        return '<button type="button" class="sc-opt" data-k="loanId" data-v="' + x.l.id + '" aria-pressed="' + (x.l.id === pick.l.id) + '">' + esc(x.l.name) + '<small>About ' + money(x.pay) + ' a month' + (x === f.loans[0] ? ' (lowest payment)' : '') + '</small></button>';
      }).join('');
      frame('<h2>' + esc(D.first) + ', here is your estimate</h2><p class="sc-help">Based on a $5,000 ' + (D.area === 'basement' ? (D.housing === 'mobile' ? 'underbelly' : 'basement') : 'attic') + ' project. Estimates only.</p>' +
        '<div class="sc-big"><div class="sc-stat"><div class="n">' + money(f.rebate) + '</div><div class="l">Estimated Efficiency Maine rebate' + (inc ? ' (' + TIER_NAME[f.tier].toLowerCase() + ', needs verification)' : '') + '</div></div>' +
        '<div class="sc-stat gold"><div class="n">' + money(pick.pay) + '</div><div class="l">Estimated monthly loan payment on ' + money(f.loan) + '</div></div></div>' +
        '<div class="sc-loans">' + loanCards + '</div>' +
        '<div class="sc-big"><div class="sc-stat"><div class="n">' + money(f.saveLow) + ' to ' + money(f.saveHigh) + '</div><div class="l">Estimated heating savings per month*</div></div>' +
        '<div class="sc-stat gold"><div class="n">' + money(pick.pay) + '</div><div class="l">Loan payment per month</div></div></div>' +
        '<div class="sc-net"><div class="n">' + (thin ? 'About ' + money(Math.abs(netLow)) + ' a month difference at the low end' : 'About ' + money(netLow) + ' to ' + money(netHigh) + ' a month ahead*') + '</div>' +
        '<p>' + (thin ? 'At the low end your savings come close to the payment. A longer term brings the payment down, and we will go over the best fit with you.' : 'That is your estimated savings minus your loan payment. In this example the rebate and the loan add up to the full project cost. We confirm exactly how the rebate is applied at your estimate.') + '</p></div>' +
        '<div class="sc-call"><strong>Next step: a free on-site estimate.</strong> These numbers use a $5,000 example. We will call you to schedule your estimate and give you a real price before you commit to anything.</div>' +
        '<div class="sc-f"><label for="sc-email">Where should we send these results and your application link? *</label><input type="email" id="sc-email" autocomplete="email" value="' + esc(D.email) + '"></div>' +
        '<div class="sc-nav"><button class="sc-btn go" id="sc-send" type="button">Email me my results and start my application</button></div>' +
        '<p class="sc-fine">*Savings assume a 20% to 30% reduction in heating cost and are estimates, not guarantees. ENERGY STAR reports a 15% average. Mattra is not the lender. See the important information below this page.</p>', true);
      pickOne('loanId', false);
      ROOT.querySelectorAll('.sc-opt[data-k="loanId"]').forEach(function (b) { b.addEventListener('click', function () { var m = document.getElementById('sc-email'); D.email = m ? m.value : D.email; render(); }); });
      document.getElementById('sc-send').addEventListener('click', async function () {
        if (sending) return;
        var e = document.getElementById('sc-email').value.trim();
        if (e.indexOf('@') < 1 || e.indexOf('.', e.indexOf('@')) < 0) return err('Please check the email address, we could not read that one.');
        D.email = e; sending = true;
        var btn = this; btn.disabled = true; btn.textContent = 'Sending...';
        var ok = await post('savings-check-complete', figures(), 'savings_check_complete');
        sending = false;
        if (!ok) { btn.disabled = false; btn.textContent = 'Email me my results and start my application'; return err('That did not go through. Please call us at ' + PHONE + ' and we will take the details by phone.'); }
        track('form_submission', { form_type: 'savings-check-complete' });
        step = 99; render();
      });
    },
    done: function () {
      var f = figures(), inc = f.tier !== 'any';
      var primary = inc ? URL_VERIFY : URL_REGISTER;
      ROOT.innerHTML = '<div class="sc-card" role="status"><h2>You are all set, ' + esc(D.first) + '.</h2>' +
        '<p class="sc-help">Your results are on their way to ' + esc(D.email) + '. Here is what happens next:</p>' +
        '<ol style="padding-left:20px;line-height:1.7;margin:0 0 14px">' +
        (inc ? '<li><strong>Verify your income</strong> with Efficiency Maine. The higher rebate and the income-based loan both need it.</li><li><strong>Then create your Green Bank account</strong> and start the loan application.</li>'
             : '<li><strong>Create your Green Bank account</strong> and start the loan application. It takes a few minutes.</li>') +
        '<li><strong>We will call you from ' + PHONE + '</strong> to schedule your free estimate.</li>' +
        '<li>The loan must be approved <strong>before</strong> work starts.</li></ol>' +
        '<a class="sc-btn go" href="' + primary + '" target="_blank" rel="noopener">' + (inc ? 'Verify my income with Efficiency Maine' : 'Start my Green Bank application') + '</a>' +
        '<p class="sc-fine">This opens Efficiency Maine&rsquo;s website, which Mattra does not control. Mattra is not the lender and does not submit your application. Applying does not obligate you to Mattra, and nothing is approved until Efficiency Maine says so. Questions? Call ' + PHONE + '.</p></div>';
      window.scrollTo({ top: Math.max(0, ROOT.getBoundingClientRect().top + window.pageYOffset - 70), behavior: 'smooth' });
    },
    renter: function () {
      ROOT.innerHTML = '<div class="sc-card" role="status"><h2>Thanks, ' + esc(D.first) + '.</h2>' +
        '<p class="sc-help">Efficiency Maine&rsquo;s insulation rebates and Green Bank loans are for homeowners, so we cannot run an estimate for a rental. If you are the owner of the building or this changes, call us at <a href="tel:+12077776020">' + PHONE + '</a>. We have saved your details so a team member can follow up if there is another way to help.</p></div>';
    },
    outside: function () {
      ROOT.innerHTML = '<div class="sc-card" role="status"><h2>Thanks, ' + esc(D.first) + '.</h2>' +
        '<p class="sc-help">These rebates and loans are for homes in Maine, and that ZIP code looks like it is outside our area. If it is a Maine home, call us at <a href="tel:+12077776020">' + PHONE + '</a> and we will sort it out. We have saved your details.</p></div>';
    }
  };

  function render() {
    if (step === -1) return VIEWS.renter();
    if (step === -2) return VIEWS.outside();
    if (step === 99) return VIEWS.done();
    VIEWS[STEPS[step]]();
  }
  render();
})();
