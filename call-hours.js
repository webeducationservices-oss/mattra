/* After-hours call prompt for mattrainc.com (ported from Millennium, 2026-11-12).
 *
 * During office hours every tel: link works exactly as before. Outside them, a
 * tap on a tel: link opens a short dialog instead: the office is closed, here is
 * when it opens, and three choices - request a call back (name, phone, email,
 * message), book a free consultation online, or call anyway and leave a message.
 *
 * Why the click is caught on WINDOW in the capture phase: GTM-K4ZZ5RK fires the
 * GA4 Call_Click event and the "Lead - Phone Call (Website)" Ads tag from a
 * gtm.linkClick trigger on tel: links, which would count a closed-office tap as
 * a call that never happened. Stopping the event before it reaches GTM's
 * document listener keeps it out. "Call anyway" is a genuine tel: link click,
 * so GTM counts it exactly once.
 *
 * Works with call-tracking.js: ad visitors see a Google forwarding number, and
 * this reads the tapped link's href at click time, so "Call anyway" dials the
 * same forwarding number and the call still counts for the ad.
 *
 * A call back request is a real lead: it posts to form-notify as
 * callback-request and pushes form_submission, which fires the Ads lead form
 * conversion, then thanks the visitor inside the dialog.
 *
 * Hours are Eastern wall-clock time, read with Intl so the visitor's own time
 * zone never matters. Anything that goes wrong here (no Intl, a thrown error)
 * leaves the phone link alone: this must never stop someone from calling.
 *
 * Testing: add ?callhours=closed or ?callhours=open to any page URL.
 */
(function () {
  'use strict';
  if (window.__mattraCallHours) return;
  window.__mattraCallHours = true;

  var TZ = 'America/New_York';
  // Minutes after midnight, Eastern. 0 = Sunday. Matches the Business Profile,
  // the openingHours schema (Mo-Fr 08:00-17:00) and the contact page.
  var HOURS = { 0: null, 1: [480, 1020], 2: [480, 1020], 3: [480, 1020], 4: [480, 1020], 5: [480, 1020], 6: null };
  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var HOURS_TEXT = 'Monday to Friday, 8:00 AM to 5:00 PM (Eastern)';
  var ENDPOINT = 'https://myaieditor.com/api/form-notify';
  var SITE_KEY = '6Lck8aQsAAAAALMA-T6nwfkSf7bv4K-mOhkszeKh';
  var MAIN_TEL = 'tel:+12077776020';
  var EMAIL = 'info@mattrainc.com';

  function easternNow(date) {
    var parts = new Intl.DateTimeFormat('en-US', {
      timeZone: TZ, weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
    }).formatToParts(date || new Date());
    var o = {};
    for (var i = 0; i < parts.length; i++) o[parts[i].type] = parts[i].value;
    var wd = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday);
    var h = parseInt(o.hour, 10) % 24;
    return { day: wd, minutes: h * 60 + parseInt(o.minute, 10) };
  }

  function fmt(min) {
    var h = Math.floor(min / 60), m = min % 60, ap = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return h + ':' + (m < 10 ? '0' : '') + m + ' ' + ap;
  }

  function status(date) {
    var now = easternNow(date);
    if (now.day < 0 || isNaN(now.minutes)) return { open: true };
    var today = HOURS[now.day];
    var open = !!(today && now.minutes >= today[0] && now.minutes < today[1]);
    var next = '';
    for (var d = 0; d < 8 && !open; d++) {
      var wd = (now.day + d) % 7, hrs = HOURS[wd];
      if (!hrs) continue;
      if (d === 0 && now.minutes >= hrs[0]) continue;
      next = (d === 0 ? 'today' : d === 1 ? 'tomorrow' : DAYS[wd]) + ' at ' + fmt(hrs[0]);
      break;
    }
    return { open: open, next: next };
  }

  function forced() {
    var m = /[?&]callhours=(open|closed)\b/.exec(location.search);
    return m ? m[1] : '';
  }

  function isClosed() {
    try {
      var f = forced();
      if (f) return f === 'closed';
      return !status().open;
    } catch (e) {
      return false;
    }
  }

  function track(action) {
    try {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: 'after_hours_call_prompt', ahc_action: action, ahc_page: location.pathname });
    } catch (e) {}
  }

  var ICON = {
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>',
    calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    message: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>'
  };

  var CSS = '' +
    '.mch{position:fixed;inset:0;z-index:10000;display:none;align-items:center;justify-content:center;padding:16px;background:rgba(30,58,40,.6)}' +
    '.mch.is-open{display:flex}' +
    '.mch-card{position:relative;width:100%;max-width:460px;max-height:calc(100vh - 32px);max-height:calc(100dvh - 32px);overflow-y:auto;background:#fff;border-radius:22px;box-shadow:0 24px 60px rgba(30,58,40,.28);padding:32px 26px 24px;font-family:"Montserrat","Montserrat Fallback",Arial,sans-serif;color:var(--text-body,#4a4a4a)}' +
    '.mch-close{position:absolute;top:12px;right:12px;width:36px;height:36px;display:flex;align-items:center;justify-content:center;background:none;border:0;border-radius:50%;color:var(--text-light,#6b6b6b);cursor:pointer;padding:0}' +
    '.mch-close:hover{background:var(--light-gray,#f3f6f7);color:var(--text-dark,#2c2c2c)}' +
    '.mch-close svg{width:20px;height:20px}' +
    '.mch-badge{width:48px;height:48px;border-radius:50%;background:#e6efe8;color:var(--green-dark,#1e3a28);display:flex;align-items:center;justify-content:center;margin:0 auto 14px}' +
    '.mch-badge svg{width:24px;height:24px}' +
    '.mch-eyebrow{text-align:center;font-size:.74rem;font-weight:600;letter-spacing:.15em;text-transform:uppercase;color:var(--green-dark,#1e3a28);margin:0 0 8px}' +
    '.mch h2{text-align:center;font-family:"DM Serif Display","DM Serif Fallback",Georgia,serif;font-size:1.55rem;line-height:1.2;color:var(--green-dark,#1e3a28);margin:0 0 10px;font-weight:400}' +
    '.mch-intro{text-align:center;font-size:.95rem;line-height:1.6;margin:0 0 20px}' +
    '.mch-intro strong{color:var(--text-dark,#2c2c2c);font-weight:600}' +
    '.mch-opts{display:flex;flex-direction:column;gap:10px;margin:0;padding:0;list-style:none}' +
    '.mch-opt{display:flex;align-items:center;gap:14px;width:100%;min-height:64px;padding:12px 16px;background:#fff;border:1.5px solid rgba(30,58,40,.16);border-radius:14px;text-align:left;text-decoration:none;font:inherit;color:inherit;cursor:pointer;transition:border-color .15s,background .15s}' +
    '.mch-opt:hover{border-color:var(--green-primary,#316b43);background:var(--light-gray,#f3f6f7)}' +
    '.mch-opt-ic{flex:0 0 40px;width:40px;height:40px;border-radius:12px;background:#e6efe8;color:var(--green-dark,#1e3a28);display:flex;align-items:center;justify-content:center}' +
    '.mch-opt-ic svg{width:20px;height:20px}' +
    '.mch-opt-t{display:block;font-size:.98rem;font-weight:600;color:var(--text-dark,#2c2c2c);line-height:1.3}' +
    '.mch-opt-s{display:block;font-size:.85rem;line-height:1.4;margin-top:2px;color:var(--text-body,#4a4a4a)}' +
    '.mch-opt.is-primary{background:var(--green-primary,#316b43);border-color:var(--green-primary,#316b43)}' +
    '.mch-opt.is-primary:hover{background:var(--green-dark,#1e3a28);border-color:var(--green-dark,#1e3a28)}' +
    '.mch-opt.is-primary .mch-opt-t,.mch-opt.is-primary .mch-opt-s{color:#fff}' +
    '.mch-opt.is-primary .mch-opt-ic{background:rgba(255,255,255,.18);color:#fff}' +
    '.mch-back{display:inline-flex;align-items:center;gap:4px;background:none;border:0;padding:4px 6px 4px 0;margin:-8px 0 10px;font:inherit;font-size:.88rem;font-weight:600;color:var(--green-dark,#1e3a28);cursor:pointer}' +
    '.mch-back svg{width:18px;height:18px}' +
    '.mch-f{display:flex;flex-direction:column;gap:12px}' +
    '.mch-f label{display:block;font-size:.86rem;font-weight:600;color:var(--text-dark,#2c2c2c);margin:0 0 5px}' +
    '.mch-f label .mch-opt-l{font-weight:400;color:var(--text-light,#6b6b6b);margin-left:4px}' +
    '.mch-f input,.mch-f textarea{display:block;width:100%;box-sizing:border-box;padding:12px 14px;border:1.5px solid rgba(30,58,40,.18);border-radius:12px;font:inherit;font-size:1rem;color:var(--text-dark,#2c2c2c);background:#fff;outline:none;-webkit-appearance:none;appearance:none}' +
    '.mch-f textarea{min-height:84px;resize:vertical;line-height:1.5}' +
    '.mch-f input:focus,.mch-f textarea:focus{border-color:var(--green-primary,#316b43);box-shadow:0 0 0 3px rgba(49,107,67,.25)}' +
    '.mch-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}' +
    '.mch-honey{position:absolute!important;left:-9999px!important;width:1px;height:1px;overflow:hidden}' +
    '.mch-submit{margin-top:4px;width:100%;min-height:52px;border:0;border-radius:14px;background:var(--green-primary,#316b43);color:#fff;font:inherit;font-size:1rem;font-weight:600;cursor:pointer}' +
    '.mch-submit:hover{background:var(--green-dark,#1e3a28)}' +
    '.mch-submit[disabled]{opacity:.7;cursor:default}' +
    '.mch-err{display:none;margin:2px 0 0;padding:11px 13px;border-radius:10px;background:#fdeceb;border:1px solid #e3b4b1;color:#8a1f1f;font-size:.88rem;line-height:1.5}' +
    '.mch-note{text-align:center;font-size:.8rem;color:var(--text-light,#6b6b6b);margin:2px 0 0}' +
    '.mch-close:focus-visible,.mch-opt:focus-visible,.mch-back:focus-visible,.mch-submit:focus-visible{outline:3px solid rgba(49,107,67,.45);outline-offset:2px}' +
    '@media(max-width:420px){.mch-card{padding:28px 18px 20px}.mch-row{grid-template-columns:1fr}.mch h2{font-size:1.3rem}}' +
    'html.mch-lock{overflow:hidden}';

  var root, card, lastFocus, telHref = MAIN_TEL, when = '';

  // The tapped link's number: Google's forwarding number for ad visitors.
  function phoneText(href) {
    var d = String(href || '').replace(/\D/g, '');
    if (d.length === 11 && d.charAt(0) === '1') d = d.slice(1);
    if (d.length !== 10) return '(207) 777-6020';
    return '(' + d.slice(0, 3) + ') ' + d.slice(3, 6) + '-' + d.slice(6);
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }

  function build() {
    if (root) return;
    var st = document.createElement('style');
    st.textContent = CSS;
    document.head.appendChild(st);
    root = document.createElement('div');
    root.className = 'mch';
    root.innerHTML = '<div class="mch-card" role="dialog" aria-modal="true" aria-labelledby="mch-title"></div>';
    card = root.firstChild;
    document.body.appendChild(root);
    root.addEventListener('click', function (e) { if (e.target === root) { track('dismiss'); close(); } });
    document.addEventListener('keydown', onKey, true);
  }

  function closeBtn() {
    return '<button type="button" class="mch-close" data-mch="close" aria-label="Close">' + ICON.x + '</button>';
  }

  function renderMenu() {
    card.innerHTML = closeBtn() +
      '<div class="mch-badge">' + ICON.clock + '</div>' +
      '<p class="mch-eyebrow">After hours</p>' +
      '<h2 id="mch-title">Our office is closed right now</h2>' +
      '<p class="mch-intro">We are open ' + HOURS_TEXT + '.' + (when ? ' We open again <strong>' + esc(when) + '</strong>.' : '') + '</p>' +
      '<ul class="mch-opts">' +
        '<li><button type="button" class="mch-opt is-primary" data-mch="callback"><span class="mch-opt-ic">' + ICON.message + '</span><span><span class="mch-opt-t">Request a call back</span><span class="mch-opt-s">Leave your number and we will call you when we open.</span></span></button></li>' +
        '<li><a class="mch-opt" href="/contact/" data-mch="estimate"><span class="mch-opt-ic">' + ICON.calendar + '</span><span><span class="mch-opt-t">Book a free consultation</span><span class="mch-opt-s">Tell us about your project online in a few minutes.</span></span></a></li>' +
        '<li><a class="mch-opt" href="' + esc(telHref) + '" data-mch="call" data-mch-skip="1"><span class="mch-opt-ic">' + ICON.phone + '</span><span><span class="mch-opt-t">Call anyway and leave a message</span><span class="mch-opt-s">' + esc(phoneText(telHref)) + '. We return messages when the office opens.</span></span></a></li>' +
      '</ul>';
    focusFirst();
  }

  function renderForm() {
    card.innerHTML = closeBtn() +
      '<button type="button" class="mch-back" data-mch="back">' + ICON.back + 'Back</button>' +
      '<h2 id="mch-title">Request a call back</h2>' +
      '<p class="mch-intro">Leave your details and someone from our team will call you' + (when ? ' ' + esc(when) : ' when the office opens') + ' or as soon after as we can.</p>' +
      '<form class="mch-f" novalidate>' +
        '<div class="mch-honey" aria-hidden="true"><label>Leave this empty<input type="text" name="_honey" tabindex="-1" autocomplete="off"></label></div>' +
        '<div><label for="mch-name">Name</label><input id="mch-name" name="name" type="text" autocomplete="name" required></div>' +
        '<div class="mch-row">' +
          '<div><label for="mch-phone">Phone</label><input id="mch-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" required></div>' +
          '<div><label for="mch-email">Email</label><input id="mch-email" name="email" type="email" autocomplete="email" required></div>' +
        '</div>' +
        '<div><label for="mch-msg">Message <span class="mch-opt-l">(optional)</span></label><textarea id="mch-msg" name="message" placeholder="What can we help you with?"></textarea></div>' +
        '<p class="mch-err" role="alert"></p>' +
        '<button type="submit" class="mch-submit">Request my call back</button>' +
        '<p class="mch-note">We only use this to get back to you.</p>' +
      '</form>';
    loadRecaptcha();
    card.querySelector('form').addEventListener('submit', onSubmit);
    var n = card.querySelector('#mch-name');
    try { n.focus(); } catch (e) {}
  }

  // Mattra's forms confirm in place; /thank-you would fire the GA4 thank-you event twice.
  function renderDone(first) {
    card.innerHTML = closeBtn() +
      '<div class="mch-badge">' + ICON.check + '</div>' +
      '<p class="mch-eyebrow">Request received</p>' +
      '<h2 id="mch-title">Thanks' + (first ? ', ' + esc(first) : '') + '. We will call you back.</h2>' +
      '<p class="mch-intro">Someone from our team will call you' + (when ? ' <strong>' + esc(when) + '</strong>' : ' when the office opens') + ' or as soon after as we can. We also sent a copy to your email.</p>' +
      '<button type="button" class="mch-submit" data-mch="close">Done</button>';
    var b = card.querySelector('.mch-submit');
    try { b.focus(); } catch (e) {}
  }

  function focusables() {
    return [].slice.call(card.querySelectorAll('a[href],button:not([disabled]),input:not([tabindex="-1"]),textarea')).filter(function (el) {
      return el.offsetParent !== null;
    });
  }

  function focusFirst() {
    var f = card.querySelector('.mch-opt');
    try { (f || card).focus(); } catch (e) {}
  }

  function onKey(e) {
    if (!root || !root.classList.contains('is-open')) return;
    if (e.key === 'Escape') { e.preventDefault(); track('dismiss'); close(); return; }
    if (e.key !== 'Tab') return;
    var f = focusables();
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function open(href) {
    build();
    telHref = href || telHref;
    try { when = forced() === 'closed' ? (status().next || 'Monday at 8:00 AM') : status().next; } catch (e) { when = ''; }
    lastFocus = document.activeElement;
    renderMenu();
    root.classList.add('is-open');
    document.documentElement.classList.add('mch-lock');
    focusFirst();
    track('shown');
  }

  function close() {
    if (!root) return;
    root.classList.remove('is-open');
    document.documentElement.classList.remove('mch-lock');
    try { if (lastFocus && lastFocus.focus) lastFocus.focus(); } catch (e) {}
  }

  var recaptchaRequested = false;
  function loadRecaptcha() {
    if (recaptchaRequested || (window.grecaptcha && window.grecaptcha.execute)) return;
    recaptchaRequested = true;
    var s = document.createElement('script');
    s.src = 'https://www.google.com/recaptcha/api.js?render=' + SITE_KEY;
    s.async = true;
    document.head.appendChild(s);
  }

  // Never fatal: no token means form-notify files the lead under Spam, where it
  // can still be rescued, rather than losing it.
  function mintToken() {
    return new Promise(function (resolve) {
      var done = false;
      function finish(t) { if (!done) { done = true; resolve(t || ''); } }
      setTimeout(function () { finish(''); }, 8000);
      (function wait(tries) {
        if (window.grecaptcha && window.grecaptcha.ready && window.grecaptcha.execute) {
          try {
            window.grecaptcha.ready(function () {
              try { window.grecaptcha.execute(SITE_KEY, { action: 'form_submit' }).then(finish, function () { finish(''); }); }
              catch (e) { finish(''); }
            });
          } catch (e) { finish(''); }
        } else if (tries < 40) {
          setTimeout(function () { wait(tries + 1); }, 150);
        } else {
          finish('');
        }
      })(0);
    });
  }

  function onSubmit(e) {
    e.preventDefault();
    var form = e.currentTarget, err = form.querySelector('.mch-err'), btn = form.querySelector('.mch-submit');
    err.style.display = 'none';
    var name = form.name.value.trim(), phone = form.phone.value.trim(), email = form.email.value.trim();
    var bad = '';
    if (!name) bad = 'Please add your name.';
    else if (phone.replace(/\D/g, '').length < 10) bad = 'Please add a phone number we can call, including the area code.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) bad = 'Please add a valid email address.';
    if (bad) { err.textContent = bad; err.style.display = 'block'; return; }

    var sp = name.split(/\s+/);
    var payload = {
      site_slug: 'mattra',
      form_type: 'callback-request',
      send_visitor_copy: 'true',
      visitor_email_subject: 'We will call you back',
      first_name: sp.shift(),
      last_name: sp.join(' '),
      phone: phone,
      email: email,
      message: form.message.value.trim(),
      _honey: form._honey.value,
      source_page: location.pathname,
      requested_after_hours: 'true',
      office_reopens: when,
      submitted_at: new Date().toISOString()
    };
    try { if (typeof window.getSourceAttribution === 'function') Object.assign(payload, window.getSourceAttribution()); } catch (x) {}

    var label = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Sending...';
    mintToken().then(function (tok) {
      if (tok) payload.recaptcha_token = tok;
      return fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) {
        // Never a fake thank-you: only a 2xx that was not rejected counts.
        if (!r.ok || j.accepted === false) throw new Error('not_accepted');
        track('callback_sent');
        try { window.dataLayer.push({ event: 'form_submission', form_type: 'callback-request', form_location: location.pathname }); } catch (x) {}
        renderDone(payload.first_name);
      });
    }).catch(function () {
      btn.disabled = false;
      btn.textContent = label;
      err.textContent = 'We could not send that just now. Please call ' + phoneText(telHref) + ' and leave a message, or email ' + EMAIL + ', and we will get back to you.';
      err.style.display = 'block';
    });
  }

  // Delegated clicks inside the dialog.
  document.addEventListener('click', function (e) {
    if (!root || !root.contains(e.target)) return;
    var t = e.target.closest('[data-mch]');
    if (!t) return;
    var a = t.getAttribute('data-mch');
    if (a === 'close') { track('dismiss'); close(); }
    else if (a === 'back') { renderMenu(); }
    else if (a === 'callback') { track('callback_open'); renderForm(); }
    else if (a === 'estimate') { track('estimate'); }
    else if (a === 'call') { track('call_anyway'); setTimeout(close, 0); }
  });

  // The interceptor. Capture phase on window runs before GTM's listener.
  window.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button > 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target && e.target.closest ? e.target.closest('a[href^="tel:"]') : null;
    if (!a || a.hasAttribute('data-mch-skip') || a.hasAttribute('data-no-hours')) return;
    if (!isClosed()) return;
    e.preventDefault();
    e.stopPropagation();
    if (e.stopImmediatePropagation) e.stopImmediatePropagation();
    try { open(a.getAttribute('href')); }
    catch (x) { location.href = a.getAttribute('href'); }
  }, true);

  window.MattraCallHours = { status: status, isClosed: isClosed, open: open };
})();
