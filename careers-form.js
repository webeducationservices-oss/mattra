/* =============================================================
   Careers application (one card at a time)
   Mounts into <div id="careers-app"> on /careers/.

   Posts multipart FormData (answers + optional resume) to the admin
   portal's /api/careers/apply, NOT form-notify: an applicant must never get
   the website-lead GHL tag or land in the sales email. That route stores
   the resume privately, saves the application for the Applicants page,
   tags the GHL contact job-applicant, and emails DC, Matt and John.
   ============================================================= */
(function () {
  'use strict';
  var ROOT = document.getElementById('careers-app');
  if (!ROOT) return;

  var ENDPOINT = 'https://admin.mattrainc.com/api/careers/apply';
  var RC_SITE_KEY = '6Lck8aQsAAAAALMA-T6nwfkSf7bv4K-mOhkszeKh';
  var PHONE = '(207) 777-6020';
  var LOAD_TS = Date.now();
  var MAX_BYTES = 4 * 1024 * 1024;

  var POSITIONS = ['Crew lead / team lead', 'Insulation installer', 'Abatement / mold remediation', 'Construction', 'Admin / office'];
  var TRADES = ['Insulation', 'Air sealing / weatherization', 'Mold remediation / abatement', 'Carpentry / framing', 'Drywall / finish work',
                'Roofing', 'Siding', 'Demolition', 'Water damage / restoration', 'Waterproofing', 'Office / admin'];
  var NONE = 'None yet, I\'m new to the trades';
  var YEARS = ['Less than 1 year', '1 to 2 years', '3 to 5 years', '6 to 10 years', 'More than 10 years'];
  var PAY = [
    { v: 'New to the industry, $18 to $22/hr', t: 'New to the industry', s: '$18 to $22 an hour' },
    { v: 'Developing laborer, $20 to $24/hr', t: 'Developing laborer', s: '$20 to $24 an hour' },
    { v: 'Skilled, $25 to $40/hr', t: 'Skilled', s: '$25 to $40 an hour' },
    { v: 'Crew lead / team lead, $28 to $50/hr', t: 'Crew lead / team lead', s: '$28 to $50 an hour' }
  ];
  var STARTS = ['Right away', 'Within 2 weeks', 'Within a month', 'In 1 to 3 months', 'Just exploring for now'];
  var HEARD = ['Indeed or a job board', 'Facebook or Instagram', 'Google search', 'A friend or someone who works here', 'Saw a Mattra truck or job site', 'Other'];

  var D = { first: '', last: '', phone: '', email: '', positions: [], trades: [], years: {}, license: '', pay: '', employed: '',
            start: '', town: '', age18: '', authorized: '', heard: '', about: '', file: null };
  var step = 0, sending = false, rendered = false;

  /* ---------- styles ---------- */
  var css = document.createElement('style');
  css.textContent =
  '#careers-app{--g:var(--green-primary,#316b43);--gd:var(--green-dark,#1e3a28);--au:var(--gold-accent,#e7bb3a)}' +
  '.cf-card{background:#fff;border-radius:18px;box-shadow:0 12px 36px rgba(0,0,0,.10);padding:28px 26px 26px;text-align:left}' +
  '.cf-bar{height:7px;background:#e8ecee;border-radius:99px;overflow:hidden;margin-bottom:8px}.cf-bar i{display:block;height:100%;background:linear-gradient(90deg,var(--g),var(--au));transition:width .35s}' +
  '.cf-count{font-size:.82rem;font-weight:600;color:var(--g);margin-bottom:14px}' +
  '.cf-card h3{font-size:1.4rem;line-height:1.25;color:var(--text-dark,#2c2c2c);margin:0 0 6px}' +
  '.cf-help{margin:0 0 16px;font-size:.95rem;line-height:1.55;color:var(--text-light,#6b6b6b)}' +
  '.cf-opts{display:grid;gap:10px}.cf-opts.two{grid-template-columns:1fr 1fr}' +
  '.cf-opt{display:flex;gap:10px;align-items:flex-start;width:100%;text-align:left;border:2px solid var(--border-light,#d9dde2);background:#fff;border-radius:12px;padding:14px 16px;font:inherit;font-weight:600;color:var(--text-dark,#2c2c2c);cursor:pointer;transition:all .15s}' +
  '.cf-opt:hover{border-color:var(--g)}.cf-opt small{display:block;font-weight:400;color:var(--text-light,#6b6b6b);margin-top:2px}' +
  '.cf-opt[aria-pressed=true]{border-color:var(--g);background:#f0f7f2;box-shadow:0 0 0 3px rgba(49,107,67,.14)}' +
  '.cf-box{flex:0 0 20px;height:20px;border:2px solid #b8c0c8;border-radius:5px;margin-top:1px;display:flex;align-items:center;justify-content:center}' +
  '.cf-opt[aria-pressed=true] .cf-box{background:var(--g);border-color:var(--g)}.cf-opt[aria-pressed=true] .cf-box:after{content:"";width:5px;height:10px;border:solid #fff;border-width:0 2px 2px 0;transform:rotate(45deg) translate(-1px,-1px)}' +
  '.cf-f{margin-top:12px}.cf-f label{display:block;font-weight:700;font-size:.88rem;color:var(--text-dark,#2c2c2c);margin-bottom:6px}' +
  '.cf-f input[type=text],.cf-f input[type=tel],.cf-f input[type=email],.cf-f select,.cf-f textarea{width:100%;box-sizing:border-box;padding:13px 14px;border:2px solid var(--border-light,#d9dde2);border-radius:10px;font:inherit;background:#fff}' +
  '.cf-f textarea{min-height:120px;resize:vertical}.cf-f input:focus,.cf-f select:focus,.cf-f textarea:focus{outline:none;border-color:var(--g)}' +
  '.cf-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}' +
  '.cf-yrs{display:grid;gap:12px}.cf-yrs .cf-f{margin:0}' +
  '.cf-nav{display:flex;gap:12px;align-items:center;margin-top:22px;flex-wrap:wrap}' +
  '.cf-btn{background:var(--g);color:#fff;border:0;border-radius:12px;padding:15px 30px;font:inherit;font-weight:700;font-size:1.02rem;cursor:pointer}' +
  '.cf-btn:hover{background:var(--gd)}.cf-btn:disabled{opacity:.55;cursor:wait}.cf-btn.go{background:var(--au);color:#2c2c2c}' +
  '.cf-back{background:none;border:0;color:var(--text-light,#6b6b6b);font:inherit;cursor:pointer;text-decoration:underline;padding:6px}' +
  '.cf-err{display:none;background:#f9e6e6;color:#8a2a2a;border-radius:8px;padding:10px 14px;margin-top:14px;font-size:.9rem}.cf-err.on{display:block}' +
  '.cf-file{border:2px dashed var(--border-light,#cfd5db);border-radius:12px;padding:16px;text-align:center;font-size:.92rem;color:var(--text-body,#4a4a4a)}' +
  '.cf-file input{display:block;margin:8px auto 0;max-width:100%}' +
  '.cf-fine{font-size:.78rem;line-height:1.55;color:var(--text-light,#6b6b6b);margin-top:12px}' +
  '@media(max-width:560px){.cf-card{padding:22px 16px 20px}.cf-opts.two,.cf-row{grid-template-columns:1fr}.cf-card h3{font-size:1.22rem}}';
  document.head.appendChild(css);

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function key(t) { return t.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, ''); }
  function hasTrades() { return D.trades.length && D.trades.indexOf(NONE) < 0; }

  var STEPS = ['name', 'contact', 'positions', 'trades', 'years', 'license', 'pay', 'employed', 'start', 'basics', 'about'];
  function skipped(name) { return name === 'years' && !hasTrades(); }
  function next() { do { step += 1; } while (step < STEPS.length - 1 && skipped(STEPS[step])); render(); }
  function back() { do { step -= 1; } while (step > 0 && skipped(STEPS[step])); render(); }

  function frame(inner, nextLabel) {
    var pct = Math.round((step / (STEPS.length - 1)) * 100);
    ROOT.innerHTML = '<div class="cf-card" role="group" aria-label="Job application">' +
      '<div class="cf-bar"><i style="width:' + Math.max(pct, 5) + '%"></i></div>' +
      '<div class="cf-count">' + (step === 0 ? 'Takes about 3 minutes' : step >= STEPS.length - 2 ? 'Almost done' : '&nbsp;') + '</div>' + inner +
      '<div class="cf-err" id="cf-err" role="alert"></div>' +
      '<div class="cf-nav">' + (nextLabel ? '<button type="button" class="cf-btn' + (step === STEPS.length - 1 ? ' go' : '') + '" id="cf-next">' + nextLabel + '</button>' : '') +
      (step > 0 ? '<button type="button" class="cf-back" id="cf-back">Back</button>' : '') + '</div></div>';
    var b = document.getElementById('cf-back'); if (b) b.addEventListener('click', back);
    if (rendered) {
      var top = ROOT.getBoundingClientRect().top;
      if (top < 0 || top > window.innerHeight * 0.4) window.scrollTo({ top: Math.max(0, top + window.pageYOffset - 90), behavior: 'smooth' });
      var f = ROOT.querySelector('input[type=text],input[type=tel]'); if (f) setTimeout(function () { try { f.focus({ preventScroll: true }); } catch (e) {} }, 60);
    }
    rendered = true;
  }
  function err(t) { var e = document.getElementById('cf-err'); e.textContent = t; e.className = 'cf-err on'; }
  function onNext(fn) { document.getElementById('cf-next').addEventListener('click', fn); }

  /* single choice: pressing an option stores it; auto-advance when asked */
  function single(k, opts, advance) {
    return '<div class="cf-opts' + (opts.length > 3 && opts.every(function (o) { return (o.t || o).length < 22; }) ? ' two' : '') + '">' +
      opts.map(function (o) {
        var v = o.v || o, t = o.t || o;
        return '<button type="button" class="cf-opt" data-k="' + k + '" data-v="' + esc(v) + '" aria-pressed="' + (D[k] === v) + '"><span>' + esc(t) + (o.s ? '<small>' + esc(o.s) + '</small>' : '') + '</span></button>';
      }).join('') + '</div>';
  }
  function bindSingle(k, advance) {
    ROOT.querySelectorAll('.cf-opt[data-k="' + k + '"]').forEach(function (b) {
      b.addEventListener('click', function () {
        D[k] = b.getAttribute('data-v');
        ROOT.querySelectorAll('.cf-opt[data-k="' + k + '"]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        if (advance) setTimeout(next, 180);
      });
    });
  }
  /* multi choice with checkboxes */
  function multi(k, opts) {
    return '<div class="cf-opts">' + opts.map(function (t) {
      return '<button type="button" class="cf-opt" data-m="' + k + '" data-v="' + esc(t) + '" aria-pressed="' + (D[k].indexOf(t) >= 0) + '"><span class="cf-box"></span><span>' + esc(t) + '</span></button>';
    }).join('') + '</div>';
  }
  function bindMulti(k, exclusive) {
    ROOT.querySelectorAll('.cf-opt[data-m="' + k + '"]').forEach(function (b) {
      b.addEventListener('click', function () {
        var v = b.getAttribute('data-v'), i = D[k].indexOf(v);
        if (i >= 0) D[k].splice(i, 1);
        else if (v === exclusive) D[k] = [v];
        else { D[k].push(v); var x = D[k].indexOf(exclusive); if (x >= 0) D[k].splice(x, 1); }
        ROOT.querySelectorAll('.cf-opt[data-m="' + k + '"]').forEach(function (o) { o.setAttribute('aria-pressed', D[k].indexOf(o.getAttribute('data-v')) >= 0 ? 'true' : 'false'); });
      });
    });
  }

  var VIEWS = {
    name: function () {
      frame('<h3>Let\'s start with your name</h3><p class="cf-help">Thanks for your interest in joining the Mattra team.</p>' +
        '<div class="cf-row"><div class="cf-f"><label for="cf-first">First name *</label><input type="text" id="cf-first" autocomplete="given-name" value="' + esc(D.first) + '"></div>' +
        '<div class="cf-f"><label for="cf-last">Last name *</label><input type="text" id="cf-last" autocomplete="family-name" value="' + esc(D.last) + '"></div></div>', 'Continue');
      onNext(function () {
        D.first = document.getElementById('cf-first').value.trim(); D.last = document.getElementById('cf-last').value.trim();
        if (!D.first || !D.last) return err('Please add your first and last name.');
        next();
      });
    },
    contact: function () {
      frame('<h3>How can we reach you, ' + esc(D.first) + '?</h3><p class="cf-help">We\'ll call or text you about next steps.</p>' +
        '<div class="cf-f"><label for="cf-phone">Phone *</label><input type="tel" id="cf-phone" inputmode="tel" autocomplete="tel" value="' + esc(D.phone) + '"></div>' +
        '<div class="cf-f"><label for="cf-email">Email (optional)</label><input type="email" id="cf-email" autocomplete="email" value="' + esc(D.email) + '"></div>', 'Continue');
      onNext(function () {
        D.phone = document.getElementById('cf-phone').value.trim(); D.email = document.getElementById('cf-email').value.trim();
        if (D.phone.replace(/\D/g, '').length < 10) return err('Please add a phone number with area code.');
        if (D.email && !/^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/.test(D.email)) return err('Please check the email address, or leave it blank.');
        next();
      });
    },
    positions: function () {
      frame('<h3>Which positions interest you?</h3><p class="cf-help">Check all that apply.</p>' + multi('positions', POSITIONS), 'Continue');
      bindMulti('positions');
      onNext(function () { if (!D.positions.length) return err('Please pick at least one position.'); next(); });
    },
    trades: function () {
      frame('<h3>What trade experience do you have?</h3><p class="cf-help">Check everything you\'ve done, paid or not. New to the trades? That\'s great too.</p>' + multi('trades', TRADES.concat([NONE])), 'Continue');
      bindMulti('trades', NONE);
      onNext(function () {
        if (!D.trades.length) return err('Please check at least one, or "None yet".');
        Object.keys(D.years).forEach(function (t) { if (D.trades.indexOf(t) < 0) delete D.years[t]; });
        next();
      });
    },
    years: function () {
      var list = D.trades.filter(function (t) { return t !== NONE; });
      frame('<h3>How many years in each?</h3><p class="cf-help">A rough count is fine.</p><div class="cf-yrs">' +
        list.map(function (t, i) {
          return '<div class="cf-f"><label for="cf-y' + i + '">' + esc(t) + '</label><select id="cf-y' + i + '" data-t="' + esc(t) + '"><option value="">Choose</option>' +
            YEARS.map(function (y) { return '<option' + (D.years[t] === y ? ' selected' : '') + '>' + y + '</option>'; }).join('') + '</select></div>';
        }).join('') + '</div>', 'Continue');
      onNext(function () {
        var missing = false;
        ROOT.querySelectorAll('select[data-t]').forEach(function (s) { if (!s.value) missing = true; else D.years[s.getAttribute('data-t')] = s.value; });
        if (missing) return err('Please choose years for each trade.');
        next();
      });
    },
    license: function () {
      frame('<h3>Do you have a valid driver\'s license?</h3><p class="cf-help">Our crews travel to homes across Maine.</p>' + single('license', ['Yes', 'No']));
      bindSingle('license', true);
    },
    pay: function () {
      frame('<h3>What pay range are you looking for?</h3><p class="cf-help">Pick the level that fits you best right now.</p>' + single('pay', PAY));
      bindSingle('pay', true);
    },
    employed: function () {
      frame('<h3>Are you currently employed?</h3>' + single('employed', ['Yes, full time', 'Yes, part time', 'No']));
      bindSingle('employed', true);
    },
    start: function () {
      frame('<h3>When could you start?</h3>' + single('start', STARTS));
      bindSingle('start', true);
    },
    basics: function () {
      frame('<h3>A few quick basics</h3>' +
        '<div class="cf-f"><label for="cf-town">What town do you live in? *</label><input type="text" id="cf-town" autocomplete="address-level2" value="' + esc(D.town) + '"></div>' +
        '<div class="cf-f"><label>Are you 18 or older? *</label>' + single('age18', ['Yes', 'No']) + '</div>' +
        '<div class="cf-f"><label>Are you legally authorized to work in the U.S.? *</label>' + single('authorized', ['Yes', 'No']) + '</div>' +
        '<div class="cf-f"><label for="cf-heard">How did you hear about us?</label><select id="cf-heard"><option value="">Choose</option>' +
          HEARD.map(function (h) { return '<option' + (D.heard === h ? ' selected' : '') + '>' + h + '</option>'; }).join('') + '</select></div>', 'Continue');
      bindSingle('age18'); bindSingle('authorized');
      onNext(function () {
        D.town = document.getElementById('cf-town').value.trim(); D.heard = document.getElementById('cf-heard').value;
        if (!D.town) return err('Please add the town you live in.');
        if (!D.age18 || !D.authorized) return err('Please answer both yes or no questions.');
        next();
      });
    },
    about: function () {
      frame('<h3>Anything else we should know about you?</h3><p class="cf-help">Your goals, the kinds of jobs you like, what you do in your free time. Whatever helps us get to know you.</p>' +
        '<div class="cf-f"><label for="cf-about">About you (optional)</label><textarea id="cf-about" maxlength="3000">' + esc(D.about) + '</textarea></div>' +
        '<div class="cf-f"><div class="cf-file"><strong>Resume (optional)</strong><br>PDF, Word or text file, up to 4 MB.<input type="file" id="cf-file" accept=".pdf,.doc,.docx,.txt,.rtf,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"></div></div>' +
        '<input type="text" id="cf-honey" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px">' +
        '<p class="cf-fine">By submitting, you agree that Mattra Inc. may contact you by phone, text or email about your application.</p>', 'Submit Application');
      onNext(submit);
    }
  };

  /* ---------- reCAPTCHA (never fatal) ---------- */
  var rcLoaded = false;
  function loadRc() {
    if (rcLoaded) return; rcLoaded = true;
    if (document.querySelector('script[src*="recaptcha/api.js"]')) return;
    var s = document.createElement('script'); s.src = 'https://www.google.com/recaptcha/api.js?render=' + RC_SITE_KEY; s.async = true; document.head.appendChild(s);
  }
  ['pointerdown', 'keydown', 'touchstart'].forEach(function (e) { ROOT.addEventListener(e, loadRc, { once: true, passive: true }); });
  function rcToken() {
    try {
      if (typeof grecaptcha === 'undefined' || typeof grecaptcha.execute !== 'function') return Promise.resolve('');
      return Promise.race([
        new Promise(function (res) { grecaptcha.ready(function () { grecaptcha.execute(RC_SITE_KEY, { action: 'job_application' }).then(res, function () { res(''); }); }); }),
        new Promise(function (r) { setTimeout(function () { r(''); }, 8000); })
      ]);
    } catch (e) { return Promise.resolve(''); }
  }

  async function submit() {
    if (sending) return;
    D.about = document.getElementById('cf-about').value.trim();
    var fileEl = document.getElementById('cf-file');
    D.file = fileEl && fileEl.files && fileEl.files[0] ? fileEl.files[0] : null;
    if (D.file && D.file.size > MAX_BYTES) return err('That file is larger than 4 MB. Please choose a smaller file, or remove it.');
    sending = true;
    var btn = document.getElementById('cf-next'); btn.disabled = true; btn.textContent = 'Sending...';
    loadRc();
    for (var w = 0; w < 12 && typeof grecaptcha === 'undefined'; w++) await new Promise(function (r) { setTimeout(r, 250); });

    var fd = new FormData();
    fd.append('first_name', D.first); fd.append('last_name', D.last); fd.append('phone', D.phone);
    if (D.email) fd.append('email', D.email);
    fd.append('positions', D.positions.join(', '));
    fd.append('trades', D.trades.join(', '));
    Object.keys(D.years).forEach(function (t) { fd.append('years_' + key(t), D.years[t]); });
    fd.append('drivers_license', D.license); fd.append('pay_range', D.pay); fd.append('currently_employed', D.employed);
    fd.append('start_date', D.start); fd.append('town', D.town); fd.append('age_18', D.age18); fd.append('work_authorized', D.authorized);
    if (D.heard) fd.append('heard_about', D.heard);
    if (D.about) fd.append('about', D.about);
    try { var a = getSourceAttribution(); Object.keys(a).forEach(function (k) { if (a[k]) fd.append(k, String(a[k])); }); } catch (e) {}
    fd.append('_honey', (document.getElementById('cf-honey') || {}).value || '');
    fd.append('_ts', String(LOAD_TS));
    fd.append('recaptcha_token', await rcToken());
    if (D.file) fd.append('resume', D.file, D.file.name);

    var ok = false, msg = '';
    try {
      var res = await fetch(ENDPOINT, { method: 'POST', body: fd });
      var j = await res.json().catch(function () { return {}; });
      ok = res.ok && j.accepted === true; msg = j.error || '';
    } catch (e) { console.error('application submit error:', e); }
    sending = false;
    if (!ok) {
      btn.disabled = false; btn.textContent = 'Submit Application';
      return err(msg || ('That did not go through. Please try again, or call us at ' + PHONE + '.'));
    }
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: 'job_application', positions: D.positions.join(', ') });
    ROOT.innerHTML = '<div class="cf-card" role="status"><h3>Thank you, ' + esc(D.first) + '!</h3>' +
      '<p class="cf-help">We have your application. Someone from our team will reach out by phone' + (D.email ? ' or email' : '') + ' after we review it.</p>' +
      '<p class="cf-help" style="margin:0">Questions in the meantime? Call <a href="tel:+12077776020">' + PHONE + '</a>.</p></div>';
    var top = ROOT.getBoundingClientRect().top; if (top < 0) window.scrollTo({ top: top + window.pageYOffset - 90, behavior: 'smooth' });
  }

  function render() { VIEWS[STEPS[step]](); }
  render();
})();
