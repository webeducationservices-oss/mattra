/* =============================================================
   Green Bank payment planner
   -------------------------------------------------------------
   Mounts into <div id="gb-planner"> on /efficiency-maine-green-bank/.

   Money rules (source: Efficiency Maine Home Energy Loans page and the
   Insulation Rebates brochure, October 2026):
     - The rebate comes from rebate-rules.js, the SAME engine the calculators
       use, so this page cannot disagree with them.
     - A loan cannot exceed net project cost (cost minus anticipated rebate).
     - Standard loans: 1-yr 0% ($500 origination fee), 5-yr 5.99%, 10-yr 7.99%,
       up to $25,000.
     - Income-based loan: 10-yr 5.99%, up to $7,500, needs verified income.
     - Interest is simple interest on an Actual/360 basis. With level monthly
       payments that works out to an effective monthly rate of APR/12 * 365/360,
       which is what payment() uses. Textbook amortization is a hair lower.

   This tool never makes a credit decision and never talks to the lender.
   It estimates, captures the visitor's contact details for Mattra, and then
   sends them to Efficiency Maine's own application.
   ============================================================= */
(function () {
  'use strict';

  var ROOT = document.getElementById('gb-planner');
  if (!ROOT || typeof MattraRebates === 'undefined') return;

  var ENDPOINT = 'https://myaieditor.com/api/form-notify';
  var RC_SITE_KEY = '6Lck8aQsAAAAALMA-T6nwfkSf7bv4K-mOhkszeKh';
  var PHONE = '(207) 777-6020';
  var LOAD_TS = Date.now();

  /* Efficiency Maine destinations. Register is the right first stop for someone
     who has never applied; login is for a returning applicant. */
  var URL_REGISTER = 'https://greenbank.efficiencymaine.com/auth/register/2120gscw2';
  var URL_LOGIN    = 'https://greenbank.efficiencymaine.com/auth/login/2120gscw2';
  var URL_VERIFY   = 'https://www.efficiencymaine.com/income-based-eligibility-verification/';

  /* ---------- the loans ---------- */
  var OPTIONS = [
    { id: '1y',  name: '1-year, 0% APR',            apr: 0,      years: 1,  max: 25000, fee: 500, income: false },
    { id: '5y',  name: '5-year, 5.99% APR',         apr: 0.0599, years: 5,  max: 25000, fee: 0,   income: false },
    { id: '10y', name: '10-year, 7.99% APR',        apr: 0.0799, years: 10, max: 25000, fee: 0,   income: false },
    { id: 'inc', name: 'Income-based, 10-year, 5.99% APR', apr: 0.0599, years: 10, max: 7500, fee: 0, income: true }
  ];

  /* Level monthly payment on a simple-interest, Actual/360 loan. */
  function payment(principal, apr, years) {
    var n = years * 12;
    if (principal <= 0) return 0;
    if (apr === 0) return principal / n;
    var r = (apr / 12) * (365 / 360);
    return principal * r / (1 - Math.pow(1 + r, -n));
  }

  function money(n, dec) {
    return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: dec || 0, maximumFractionDigits: dec || 0 });
  }

  /* ---------- state ---------- */
  var S = { cost: 5000, tier: 'any', areas: 1, band: 'large', air: false, upfront: 0, picked: '' };

  function rebateFor() {
    var types = ['attic', 'wall', 'basement'].slice(0, S.areas);
    var r = MattraRebates.compute({
      tier: S.tier,
      projectCost: S.cost,
      zones: types.map(function (t) { return { type: t, band: S.band }; }),
      airSealing: S.air ? ['attic'] : []
    });
    return r;
  }

  function figures() {
    var rb = rebateFor();
    var rebate = rb.rebate;                        /* already limited to the cost */
    var net = Math.max(0, S.cost - rebate);
    var up = Math.min(S.upfront, net);
    var loan = net - up;
    return { rb: rb, rebate: rebate, net: net, upfront: up, loan: loan };
  }

  function offered() {
    return OPTIONS.filter(function (o) { return S.tier === 'any' ? !o.income : true; });
  }

  /* ---------- styles ---------- */
  var CSS = '' +
  '#gb-planner{--gb-green:var(--green-primary,#316b43);--gb-dark:var(--green-dark,#1f4d2e);--gb-gold:var(--gold-accent,#e7bb3a);color:var(--text-body,#444)}' +
  '.gbp-wrap{margin:34px 0}' +
  '.gbp-head{background:linear-gradient(135deg,var(--gb-dark),var(--gb-green));color:#fff;border-radius:18px 18px 0 0;padding:28px 30px}' +
  '.gbp-head h3{color:#fff;margin:0 0 6px;font-size:1.45rem}' +
  '.gbp-head p{margin:0;color:rgba(255,255,255,.88);font-size:.98rem;line-height:1.55}' +
  '.gbp-body{background:#fff;border:1px solid var(--border-light,#e5e7eb);border-top:0;border-radius:0 0 18px 18px;padding:28px 30px;box-shadow:0 8px 28px rgba(0,0,0,.06)}' +
  '.gbp-grid{display:grid;grid-template-columns:1fr 1fr;gap:26px 34px}' +
  '.gbp-field label,.gbp-label{display:block;font-weight:700;color:var(--text-dark,#222);margin-bottom:8px;font-size:.92rem}' +
  '.gbp-sub{font-weight:400;color:var(--text-light,#777);font-size:.82rem;margin-top:4px}' +
  '.gbp-money{font-family:"DM Serif Display",serif;font-size:2rem;color:var(--gb-green);line-height:1}' +
  '.gbp-range{width:100%;accent-color:var(--gb-green);height:6px;margin:10px 0 2px}' +
  '.gbp-seg{display:flex;gap:6px;flex-wrap:wrap}' +
  '.gbp-seg button{flex:1 1 auto;border:2px solid var(--border-light,#d9dde2);background:#fff;border-radius:10px;padding:10px 12px;font:inherit;font-weight:600;color:var(--text-dark,#222);cursor:pointer;transition:all .18s}' +
  '.gbp-seg button:hover{border-color:var(--gb-green)}' +
  '.gbp-seg button[aria-pressed="true"]{background:var(--gb-green);border-color:var(--gb-green);color:#fff;box-shadow:0 4px 12px rgba(49,107,67,.25)}' +
  '.gbp-check{display:flex;gap:8px;align-items:center;font-weight:400;margin-top:10px;cursor:pointer}' +
  '.gbp-check input{width:auto}' +
  '.gbp-split{margin:28px 0 8px}' +
  '.gbp-bar{display:flex;height:46px;border-radius:12px;overflow:hidden;background:#eef0f2}' +
  '.gbp-bar>div{display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:.85rem;white-space:nowrap;overflow:hidden;transition:width .45s cubic-bezier(.2,.8,.2,1)}' +
  '.gbp-seg-rebate{background:var(--gb-green)}.gbp-seg-loan{background:#c99a14}.gbp-seg-up{background:#7b8794}' +
  '.gbp-legend{display:flex;gap:18px;flex-wrap:wrap;margin-top:10px;font-size:.88rem}' +
  '.gbp-legend i{display:inline-block;width:11px;height:11px;border-radius:3px;margin-right:6px;vertical-align:-1px}' +
  '.gbp-note{background:#fdf7e3;border-left:4px solid var(--gb-gold);border-radius:8px;padding:14px 18px;margin:18px 0;font-size:.92rem;color:var(--text-dark,#222)}' +
  '.gbp-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px;margin:18px 0}' +
  '.gbp-card{position:relative;text-align:left;border:2px solid var(--border-light,#d9dde2);border-radius:14px;padding:18px 16px;background:#fff;cursor:pointer;font:inherit;transition:all .2s}' +
  '.gbp-card:hover{transform:translateY(-3px);box-shadow:0 10px 24px rgba(0,0,0,.09)}' +
  '.gbp-card[aria-pressed="true"]{border-color:var(--gb-green);box-shadow:0 0 0 3px rgba(49,107,67,.18)}' +
  '.gbp-card.off{opacity:.55;cursor:not-allowed}.gbp-card.off:hover{transform:none;box-shadow:none}' +
  '.gbp-badge{position:absolute;top:-11px;left:14px;background:var(--gb-gold);color:#2c2c2c;font-size:.68rem;font-weight:800;letter-spacing:.05em;text-transform:uppercase;padding:3px 10px;border-radius:99px}' +
  '.gbp-card .nm{font-size:.82rem;font-weight:700;color:var(--text-light,#6b7280);text-transform:uppercase;letter-spacing:.04em;margin-bottom:8px}' +
  '.gbp-card .pay{font-family:"DM Serif Display",serif;font-size:2.3rem;line-height:1;color:var(--gb-green)}' +
  '.gbp-card .pay small{font-family:inherit;font-size:.95rem;color:var(--text-body,#555)}' +
  '.gbp-card ul{list-style:none;margin:12px 0 0;padding:0;font-size:.86rem;line-height:1.7;color:var(--text-body,#555)}' +
  '.gbp-form{margin-top:30px;border-top:2px dashed var(--border-light,#e0e3e7);padding-top:26px}' +
  '.gbp-form h4{margin:0 0 4px;font-size:1.2rem;color:var(--text-dark,#222)}' +
  '.gbp-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px}' +
  '.gbp-form input[type=text],.gbp-form input[type=email],.gbp-form input[type=tel]{width:100%;padding:12px 14px;border:2px solid var(--border-light,#d9dde2);border-radius:10px;font:inherit;box-sizing:border-box}' +
  '.gbp-form input:focus{outline:none;border-color:var(--gb-green)}' +
  '.gbp-err{display:none;background:#f9e6e6;color:#8a2a2a;border-radius:8px;padding:10px 14px;margin-top:12px;font-size:.9rem}.gbp-err.on{display:block}' +
  '.gbp-btn{display:inline-block;margin-top:16px;background:var(--gb-green);color:#fff;border:0;border-radius:10px;padding:15px 30px;font:inherit;font-weight:700;font-size:1.02rem;cursor:pointer;transition:all .18s}' +
  '.gbp-btn:hover{background:var(--gb-dark);transform:translateY(-1px)}.gbp-btn:disabled{opacity:.6;cursor:wait;transform:none}' +
  '.gbp-btn.ghost{background:#fff;color:var(--gb-green);border:2px solid var(--gb-green)}' +
  '.gbp-consent{font-size:.8rem;line-height:1.55;color:var(--text-light,#6b7280);margin-top:12px}' +
  '.gbp-sms{display:flex;gap:9px;align-items:flex-start;font-size:.8rem;line-height:1.5;color:var(--text-body,#555);margin-top:12px}.gbp-sms input{width:auto;margin-top:3px}' +
  '.gbp-done{text-align:center;padding:12px 4px}' +
  '.gbp-done h4{font-size:1.5rem;margin:0 0 8px}' +
  '.gbp-steps{text-align:left;max-width:520px;margin:18px auto;padding-left:22px;line-height:1.7}' +
  '.gbp-fine{margin-top:26px;border:1px solid var(--border-light,#e0e3e7);background:var(--off-white,#f8f9fa);border-radius:12px;padding:20px 22px;font-size:.8rem;line-height:1.65;color:var(--text-body,#555)}' +
  '.gbp-fine h4{margin:0 0 10px;font-size:.95rem;color:var(--text-dark,#222)}' +
  '.gbp-fine ol{margin:0;padding-left:20px}.gbp-fine li{margin-bottom:7px}' +
  '@media(max-width:700px){.gbp-grid,.gbp-row{grid-template-columns:1fr}.gbp-head,.gbp-body{padding:22px 18px}}' +
  '@media(prefers-reduced-motion:reduce){.gbp-bar>div,.gbp-card,.gbp-btn{transition:none}}';

  var st = document.createElement('style');
  st.textContent = CSS;
  document.head.appendChild(st);

  /* ---------- markup ---------- */
  ROOT.innerHTML =
    '<div class="gbp-wrap">' +
      '<div class="gbp-head"><h3>Build your own payment</h3>' +
      '<p>Move the sliders to match your project. The rebate comes from the same rules as our rebate calculator, and the loan covers what is left.</p></div>' +
      '<div class="gbp-body">' +
        '<div class="gbp-grid">' +
          '<div class="gbp-field"><label for="gbp-cost">Total project cost</label>' +
            '<div class="gbp-money" id="gbp-cost-out"></div>' +
            '<input class="gbp-range" id="gbp-cost" type="range" min="1000" max="30000" step="250" value="5000" aria-describedby="gbp-cost-help">' +
            '<div class="gbp-sub" id="gbp-cost-help">What Mattra quotes you for the work.</div></div>' +
          '<div class="gbp-field"><span class="gbp-label" id="gbp-tier-l">Household income</span>' +
            '<div class="gbp-seg" role="group" aria-labelledby="gbp-tier-l" id="gbp-tier">' +
              '<button type="button" data-v="any" aria-pressed="true">Any income</button>' +
              '<button type="button" data-v="moderate" aria-pressed="false">Moderate</button>' +
              '<button type="button" data-v="low" aria-pressed="false">Low</button></div>' +
            '<div class="gbp-sub">Moderate and low income need Efficiency Maine verification first.</div></div>' +
          '<div class="gbp-field"><span class="gbp-label" id="gbp-areas-l">Areas you insulate</span>' +
            '<div class="gbp-seg" role="group" aria-labelledby="gbp-areas-l" id="gbp-areas">' +
              '<button type="button" data-v="1" aria-pressed="true">Attic</button>' +
              '<button type="button" data-v="2" aria-pressed="false">Attic + walls</button>' +
              '<button type="button" data-v="3" aria-pressed="false">Attic, walls + basement</button></div>' +
            '<label class="gbp-check"><input type="checkbox" id="gbp-air"> Add attic air sealing (its own rebate)</label>' +
            '<label class="gbp-check"><input type="checkbox" id="gbp-small"> Smaller areas (250 to 499 sq ft each)</label></div>' +
          '<div class="gbp-field"><label for="gbp-up">Money you would pay up front</label>' +
            '<div class="gbp-money" id="gbp-up-out"></div>' +
            '<input class="gbp-range" id="gbp-up" type="range" min="0" max="0" step="50" value="0">' +
            '<div class="gbp-sub">Leave at $0 to finance everything the rebate does not cover.</div></div>' +
        '</div>' +
        '<div class="gbp-split" aria-live="polite">' +
          '<div class="gbp-bar" id="gbp-bar" role="img" aria-label="How the project cost splits"></div>' +
          '<div class="gbp-legend" id="gbp-legend"></div></div>' +
        '<div id="gbp-msg"></div>' +
        '<div class="gbp-cards" id="gbp-cards" aria-live="polite"></div>' +
        '<div id="gbp-formwrap"></div>' +
      '</div>' +
    '</div>';

  var $ = function (id) { return document.getElementById(id); };

  /* ---------- render ---------- */
  var animTimers = {};
  function countTo(el, to, dec) {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var from = parseFloat(el.getAttribute('data-v')) || 0;
    el.setAttribute('data-v', to);
    if (reduce || from === to) { el.textContent = money(to, dec); return; }
    clearInterval(animTimers[el.id || el.className]);
    var t0 = Date.now(), dur = 380;
    animTimers[el.id || el.className] = setInterval(function () {
      var p = Math.min(1, (Date.now() - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = money(from + (to - from) * e, dec);
      if (p === 1) clearInterval(animTimers[el.id || el.className]);
    }, 16);
  }

  function render() {
    var f = figures();

    $('gbp-cost-out').textContent = money(S.cost);
    var up = $('gbp-up');
    up.max = String(Math.max(0, Math.floor(f.net / 50) * 50));
    if (S.upfront > Number(up.max)) { S.upfront = Number(up.max); up.value = S.upfront; f = figures(); }
    $('gbp-up-out').textContent = money(f.upfront);
    up.disabled = f.net <= 0;

    /* the split bar */
    var pct = function (n) { return S.cost > 0 ? Math.max(0, (n / S.cost) * 100) : 0; };
    var seg = function (cls, n, label) {
      return n > 0 ? '<div class="' + cls + '" style="width:' + pct(n) + '%">' + (pct(n) > 14 ? label : '') + '</div>' : '';
    };
    $('gbp-bar').innerHTML = seg('gbp-seg-rebate', f.rebate, money(f.rebate)) + seg('gbp-seg-loan', f.loan, money(f.loan)) + seg('gbp-seg-up', f.upfront, money(f.upfront));
    $('gbp-bar').setAttribute('aria-label', 'Rebate ' + money(f.rebate) + ', loan ' + money(f.loan) + ', paid up front ' + money(f.upfront));
    $('gbp-legend').innerHTML =
      '<span><i style="background:#316b43"></i>Efficiency Maine rebate (estimated) ' + money(f.rebate) + '</span>' +
      '<span><i style="background:#c99a14"></i>Green Bank loan ' + money(f.loan) + '</span>' +
      (f.upfront > 0 ? '<span><i style="background:#7b8794"></i>Paid up front ' + money(f.upfront) + '</span>' : '');

    /* explanatory note */
    var msg = '';
    if (f.rb.capped) msg += 'Your rebate is capped at the ' + money(f.rb.cap) + ' lifetime limit. ';
    if (f.rb.limitedByCost) msg += 'The rebate cannot be more than the cost of the work, so it is limited to the project cost. ';
    if (S.tier !== 'any') msg += 'Moderate and low income rebates are paid only after Efficiency Maine verifies your household. Low-income rebates are paid to the contractor, so they show up as a discount on your bill. ';
    $('gbp-msg').innerHTML = msg ? '<div class="gbp-note">' + msg + '</div>' : '';

    /* loan cards */
    var list = offered(), cards = '';
    if (f.loan <= 0) {
      cards = '<div class="gbp-note" style="grid-column:1/-1"><strong>No loan needed.</strong> At these numbers the estimated rebate and your up-front payment cover the whole project.</div>';
    } else {
      var rows = list.map(function (o) {
        var ok = f.loan <= o.max;
        var pay = payment(f.loan, o.apr, o.years);
        var total = pay * o.years * 12;
        /* "cost" counts the origination fee, so a 0% loan with a $500 fee is not
           labelled cheapest when a 5-year loan costs less overall. */
        return { o: o, ok: ok, pay: pay, interest: Math.max(0, total - f.loan), total: total, cost: total + o.fee };
      });
      var live = rows.filter(function (r) { return r.ok; });
      var lowPay = live.length ? Math.min.apply(null, live.map(function (r) { return r.pay; })) : null;
      var lowCost = live.length ? Math.min.apply(null, live.map(function (r) { return r.cost; })) : null;
      if (!S.picked || !live.some(function (r) { return r.o.id === S.picked; })) {
        /* Default to the loan that matches the examples above: the income-based loan for
           verified households, the 5-year loan for everyone else. */
        var pref = S.tier === 'any' ? '5y' : 'inc';
        var hit = live.filter(function (r) { return r.o.id === pref; })[0];
        S.picked = live.length ? (hit ? hit.o.id : live.filter(function (r) { return r.pay === lowPay; })[0].o.id) : '';
      }
      cards = rows.map(function (r) {
        var badges = '';
        if (r.ok && r.pay === lowPay) badges = '<span class="gbp-badge">Lowest payment</span>';
        else if (r.ok && r.cost === lowCost && live.length > 1) badges = '<span class="gbp-badge">Lowest total cost</span>';
        var body = r.ok
          ? '<div class="pay" data-pay="' + r.pay + '">' + money(r.pay) + '<small> / month</small></div><ul>' +
            '<li>' + (r.o.years * 12) + ' payments, ' + (r.o.apr ? (r.o.apr * 100).toFixed(2) + '% APR' : '0% APR') + '</li>' +
            '<li>Interest about ' + money(r.interest) + '</li>' +
            '<li>Repaid about ' + money(r.total) + (r.o.fee ? ' + ' + money(r.o.fee) + ' fee' : '') + '</li>' +
            (r.cost === lowCost && live.length > 1 && r.pay === lowPay ? '<li><strong>Also the lowest total cost</strong></li>' : '') +
            (r.o.income ? '<li>Needs income verification</li>' : '') + '</ul>'
          : '<div class="pay" style="font-size:1.1rem;color:#8a2a2a">Over the ' + money(r.o.max) + ' limit</div><ul><li>' + (r.o.income ? 'Income-based loans stop at $7,500.' : 'Standard loans stop at $25,000.') + ' Pay part up front or choose another loan.</li></ul>';
        return '<button type="button" class="gbp-card' + (r.ok ? '' : ' off') + '" data-id="' + r.o.id + '" aria-pressed="' + (r.o.id === S.picked) + '"' + (r.ok ? '' : ' disabled') + '>' + badges + '<div class="nm">' + r.o.name + '</div>' + body + '</button>';
      }).join('');
    }
    $('gbp-cards').innerHTML = cards;
    $('gbp-cards').querySelectorAll('.gbp-card:not(.off)').forEach(function (b) {
      b.addEventListener('click', function () { S.picked = b.getAttribute('data-id'); render(); });
    });
  }

  /* ---------- controls ---------- */
  $('gbp-cost').addEventListener('input', function (e) { S.cost = Number(e.target.value); render(); });
  $('gbp-up').addEventListener('input', function (e) { S.upfront = Number(e.target.value); render(); });
  function seg(id, key, num) {
    $(id).querySelectorAll('button').forEach(function (b) {
      b.addEventListener('click', function () {
        S[key] = num ? Number(b.getAttribute('data-v')) : b.getAttribute('data-v');
        $(id).querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        S.picked = ''; render();
      });
    });
  }
  seg('gbp-tier', 'tier', false);
  seg('gbp-areas', 'areas', true);
  $('gbp-air').addEventListener('change', function (e) { S.air = e.target.checked; render(); });
  $('gbp-small').addEventListener('change', function (e) { S.band = e.target.checked ? 'small' : 'large'; render(); });

  /* ---------- reCAPTCHA (never fatal) ---------- */
  var rcLoaded = false;
  function loadRc() {
    if (rcLoaded) return; rcLoaded = true;
    if (document.querySelector('script[src*="recaptcha"]')) return;
    var s = document.createElement('script');
    s.src = 'https://www.google.com/recaptcha/api.js?render=' + RC_SITE_KEY;
    s.async = true; document.head.appendChild(s);
  }
  ['pointerdown', 'keydown', 'touchstart'].forEach(function (e) {
    document.addEventListener(e, loadRc, { once: true, passive: true });
  });
  function rcToken(action) {
    try {
      if (typeof grecaptcha === 'undefined' || typeof grecaptcha.execute !== 'function') return Promise.resolve('');
      var settled = false;
      return Promise.race([
        Promise.resolve(grecaptcha.execute(RC_SITE_KEY, { action: action })).then(
          function (t) { settled = true; return t; },
          function (e) { settled = true; console.warn('reCAPTCHA failed:', e); return ''; }),
        new Promise(function (r) { setTimeout(function () { if (!settled) console.warn('reCAPTCHA timed out'); r(''); }, 8000); })
      ]).catch(function () { return ''; });
    } catch (e) { return Promise.resolve(''); }
  }

  /* ---------- contact capture ---------- */
  $('gbp-formwrap').innerHTML =
    '<div class="gbp-form" id="gbp-form">' +
      '<h4>Ready to get started?</h4>' +
      '<p class="gbp-sub" style="font-size:.92rem">Send us your numbers and we will build the project with you. Then we will take you to Efficiency Maine to start your Green Bank application.</p>' +
      '<div class="gbp-row"><div><label for="gbp-first" class="gbp-label">First name *</label><input type="text" id="gbp-first" autocomplete="given-name" required></div>' +
      '<div><label for="gbp-last" class="gbp-label">Last name</label><input type="text" id="gbp-last" autocomplete="family-name"></div></div>' +
      '<div class="gbp-row"><div><label for="gbp-email" class="gbp-label">Email *</label><input type="email" id="gbp-email" autocomplete="email" required></div>' +
      '<div><label for="gbp-phone" class="gbp-label">Phone *</label><input type="tel" id="gbp-phone" autocomplete="tel" inputmode="tel" required></div></div>' +
      '<div class="gbp-row"><div><label for="gbp-zip" class="gbp-label">ZIP code or town *</label><input type="text" id="gbp-zip" placeholder="e.g. 04240 or Lewiston" autocomplete="postal-code" required></div><div></div></div>' +
      '<label class="gbp-sms"><input type="checkbox" id="gbp-sms"><span>I agree to receive text messages from Mattra Inc., including appointment updates, service info, and promotional offers. Msg frequency varies. Msg &amp; data rates may apply. Reply STOP to cancel, HELP for help. <a href="/privacy/" target="_blank" rel="noopener">Privacy Policy</a> &amp; <a href="/terms/" target="_blank" rel="noopener">Terms</a>. Optional, and not a condition of any purchase.</span></label>' +
      '<p class="gbp-consent">By selecting Get Started you agree that Mattra Inc. may contact you by phone or email about your request. Your details go to Mattra, not to Efficiency Maine or the Green Bank. After you submit, we will take you to Efficiency Maine&rsquo;s website, an external site with its own terms and privacy policy, where you create an account and apply yourself. Mattra does not submit your application for you.</p>' +
      '<div class="gbp-err" id="gbp-err" role="alert"></div>' +
      '<button type="button" class="gbp-btn" id="gbp-go">Get Started</button>' +
    '</div>';

  function showErr(t) { var e = $('gbp-err'); e.textContent = t; e.className = 'gbp-err on'; }
  function clearErr() { $('gbp-err').className = 'gbp-err'; }

  var sending = false, forwardTimer = null;

  $('gbp-go').addEventListener('click', async function () {
    if (sending) return;
    var first = $('gbp-first').value.trim(), last = $('gbp-last').value.trim(),
        email = $('gbp-email').value.trim(), phone = $('gbp-phone').value.trim(),
        zip = $('gbp-zip').value.trim();
    if (!first) { showErr('Please add your first name.'); $('gbp-first').focus(); return; }
    if (!email || email.indexOf('@') < 1 || email.indexOf('.') < 0) { showErr('Please check the email address, we could not read that one.'); $('gbp-email').focus(); return; }
    if (phone.replace(/\D/g, '').length < 10) { showErr('Please add a phone number so we can reach you.'); $('gbp-phone').focus(); return; }
    if (!zip) { showErr('Please add your ZIP code or town so we know we serve your area.'); $('gbp-zip').focus(); return; }
    clearErr();
    sending = true;
    var btn = this; btn.disabled = true; btn.textContent = 'Sending...';

    if (typeof grecaptcha === 'undefined') {
      loadRc();
      for (var w = 0; w < 12 && typeof grecaptcha === 'undefined'; w++) await new Promise(function (r) { setTimeout(r, 250); });
    }

    var f = figures();
    var picked = OPTIONS.filter(function (o) { return o.id === S.picked; })[0];
    var summary = offered().map(function (o) {
      return f.loan > 0 && f.loan <= o.max ? o.name + ': ' + money(payment(f.loan, o.apr, o.years)) + '/mo' : null;
    }).filter(Boolean).join(' | ');
    var tierLabel = { any: 'Any income', moderate: 'Moderate income', low: 'Low income' }[S.tier];

    /* form-notify keeps strings only in raw_data, so every value is a string. */
    var payload = {
      site_slug: 'mattra',
      form_type: 'financing-calculator',
      first_name: first, last_name: last, email: email, phone: phone, zip: zip,
      financing_interest: 'Yes, tell me more',
      loan_project_cost: String(S.cost),
      loan_income_tier: tierLabel,
      loan_areas: ['Attic', 'Attic + walls', 'Attic, walls + basement'][S.areas - 1] + (S.air ? ' + attic air sealing' : '') + (S.band === 'small' ? ' (smaller areas)' : ''),
      loan_rebate_estimate: String(f.rebate),
      loan_upfront: String(f.upfront),
      loan_amount: String(f.loan),
      loan_option_selected: picked && f.loan > 0 ? picked.name + ': about ' + money(payment(f.loan, picked.apr, picked.years)) + '/mo' : 'No loan needed',
      loan_options_shown: summary || 'None',
      loan_next_step: S.tier === 'any' ? 'Green Bank account and application' : 'Income verification, then Green Bank application',
      _honey: '',
      _ts: LOAD_TS
    };
    if ($('gbp-sms').checked) payload.sms_consent = 'true';
    try { Object.assign(payload, getSourceAttribution()); } catch (e) { console.warn('source-attr:', e); }
    payload.recaptcha_token = await rcToken('green_bank_planner');

    var accepted = false;
    try {
      var res = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      var j = await res.json().catch(function () { return {}; });
      accepted = res.ok && j.accepted !== false;
    } catch (e) { console.error('submit error:', e); }

    /* Never show success unless the server took the lead. */
    if (!accepted) {
      showErr('That did not go through. Please call us at ' + PHONE + ' and we will take the details over the phone.');
      sending = false; btn.disabled = false; btn.textContent = 'Get Started';
      return;
    }

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: 'form_submission', form_type: 'financing-calculator', form_location: window.location.pathname });
    showDone(first);
  });

  function showDone(first) {
    var income = S.tier !== 'any';
    var primary = income ? URL_VERIFY : URL_REGISTER;
    var primaryLabel = income ? 'Verify your income with Efficiency Maine' : 'Create your Green Bank account';
    var seconds = 10;
    var steps = income
      ? '<ol class="gbp-steps"><li><strong>Verify your income.</strong> The income-based loan and the higher rebate both need Efficiency Maine&rsquo;s approval first, and it must be within the last year when you apply.</li>' +
        '<li><strong>Then <a href="' + URL_REGISTER + '" target="_blank" rel="noopener">create your Green Bank account</a></strong> (or <a href="' + URL_LOGIN + '" target="_blank" rel="noopener">log in</a>) and apply.</li>' +
        '<li><strong>We will call you</strong> to scope the project, so the loan matches the real work.</li></ol>'
      : '<ol class="gbp-steps"><li><strong>Create your Green Bank account</strong> and start the application. If you already have one, <a href="' + URL_LOGIN + '" target="_blank" rel="noopener">log in</a>.</li>' +
        '<li><strong>We will call you</strong> to scope the project, so the loan matches the real work.</li>' +
        '<li>The loan has to be approved <strong>before</strong> the work starts. It cannot be used for a finished job.</li></ol>';
    $('gbp-formwrap').innerHTML =
      '<div class="gbp-form gbp-done" role="status">' +
        '<h4>Thanks, ' + first.replace(/[<>&"]/g, '') + '. We have your request.</h4>' +
        '<p>Here is what happens next:</p>' + steps +
        '<p id="gbp-count" class="gbp-sub" style="font-size:.9rem">Taking you to Efficiency Maine in <strong id="gbp-sec">' + seconds + '</strong> seconds.</p>' +
        '<a class="gbp-btn" id="gbp-now" href="' + primary + '">' + primaryLabel + ' &rarr;</a> ' +
        '<button type="button" class="gbp-btn ghost" id="gbp-stay">Stay on this page</button>' +
        '<p class="gbp-consent">This takes you to an external website that Mattra does not control. Mattra is not the lender and does not submit your application. Applying does not obligate you to Mattra, and a loan is not approved until Efficiency Maine says so.</p>' +
      '</div>';
    var el = $('gbp-formwrap'); if (el.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    forwardTimer = setInterval(function () {
      seconds -= 1;
      var s = $('gbp-sec'); if (s) s.textContent = String(Math.max(seconds, 0));
      if (seconds <= 0) { clearInterval(forwardTimer); window.location.href = primary; }
    }, 1000);
    $('gbp-stay').addEventListener('click', function () {
      clearInterval(forwardTimer);
      var c = $('gbp-count'); if (c) c.textContent = 'You can continue to Efficiency Maine whenever you are ready.';
    });
  }

  render();

  /* expose the pure functions so the worked examples on the page can be checked */
  window.MattraGreenBank = { payment: payment, OPTIONS: OPTIONS };
})();
