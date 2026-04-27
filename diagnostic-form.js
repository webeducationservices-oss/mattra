/* =============================================================
   Mattra Inc. — Diagnostic Form Component
   Usage: <div id="diagnostic-form"></div>
          <script src="diagnostic-form.js"></script>

   Supports two modes:
   - Embedded (default): compact card, no hero
   - Standalone: add data-mode="standalone" to the placeholder
   ============================================================= */

(function () {

  /* ── Load reCAPTCHA v3 automatically ── */
  const RC_SITE_KEY = '6Lck8aQsAAAAAlMA-T6nwfkSf7bv4K-mOhkszeKh';
  if (!document.querySelector('script[src*="recaptcha"]')) {
    const s = document.createElement('script');
    s.src = 'https://www.google.com/recaptcha/api.js?render=' + RC_SITE_KEY;
    s.async = true;
    document.head.appendChild(s);
  }

  /* ── Form HTML ── */
  const FORM_HTML = `
    <div class="diag-card">
      <div class="diag-progress" id="diag-progress">
        <div class="diag-progress-dot active"></div>
        <div class="diag-progress-dot"></div>
        <div class="diag-progress-dot"></div>
        <div class="diag-progress-dot"></div>
      </div>

      <!-- STEP 1 -->
      <div class="diag-step active" data-step="1">
        <h3 class="diag-title">What best describes your situation?</h3>
        <p class="diag-subtitle">Pick whatever feels closest — you can always add details later.</p>
        <div class="diag-options" data-field="concern">
          <button class="diag-opt" data-value="mold">
            <span class="diag-opt-icon">&#x1F4A7;</span>
            <span class="diag-opt-text">Mold or moisture<span class="diag-opt-desc">Visible mold, musty smell, dampness</span></span>
          </button>
          <button class="diag-opt" data-value="energy">
            <span class="diag-opt-icon">&#x2744;&#xFE0F;</span>
            <span class="diag-opt-text">High energy bills / cold rooms<span class="diag-opt-desc">Drafts, ice dams, uneven temps</span></span>
          </button>
          <button class="diag-opt" data-value="water">
            <span class="diag-opt-icon">&#x1F6B0;</span>
            <span class="diag-opt-text">Water damage<span class="diag-opt-desc">Leaks, flooding, staining</span></span>
          </button>
          <button class="diag-opt" data-value="realestate">
            <span class="diag-opt-icon">&#x1F3E0;</span>
            <span class="diag-opt-text">Buying or selling<span class="diag-opt-desc">Inspection findings, transaction support</span></span>
          </button>
          <button class="diag-opt" data-value="repairs">
            <span class="diag-opt-icon">&#x1F527;</span>
            <span class="diag-opt-text">Repairs or renovation<span class="diag-opt-desc">Rot, roofing, siding, structure</span></span>
          </button>
          <button class="diag-opt" data-value="specific">
            <span class="diag-opt-icon">&#x1F50D;</span>
            <span class="diag-opt-text">Specific service<span class="diag-opt-desc">Insulation, energy audit, etc.</span></span>
          </button>
          <button class="diag-opt diag-opt-full" data-value="notsure">
            <span class="diag-opt-icon">&#x1F914;</span>
            <span class="diag-opt-text">Not sure — need guidance<span class="diag-opt-desc">That\u2019s fine. We\u2019ll figure it out together.</span></span>
          </button>
        </div>
        <div class="diag-nav">
          <span></span>
          <button class="diag-btn-next" disabled>Continue &rarr;</button>
        </div>
      </div>

      <!-- STEP 2 (dynamic) -->
      <div class="diag-step" data-step="2">
        <div id="diag-step2"></div>
        <div class="diag-nav">
          <button class="diag-btn-back">&larr; Back</button>
          <button class="diag-btn-next" disabled>Continue &rarr;</button>
        </div>
      </div>

      <!-- STEP 3 -->
      <div class="diag-step" data-step="3">
        <h3 class="diag-title">Tell us about your home</h3>
        <p class="diag-subtitle">Just your best guess is fine.</p>
        <div class="diag-form-row">
          <div class="diag-field">
            <label for="diag-home-type">Type of home</label>
            <select id="diag-home-type">
              <option value="">Select...</option>
              <option>Single family</option>
              <option>Multi-family / duplex</option>
              <option>Condo / townhouse</option>
              <option>Mobile / manufactured</option>
              <option>Commercial</option>
            </select>
          </div>
          <div class="diag-field">
            <label for="diag-home-age">Approximate age</label>
            <select id="diag-home-age">
              <option value="">Select...</option>
              <option>Less than 10 years</option>
              <option>10–30 years</option>
              <option>30–60 years</option>
              <option>60+ years</option>
              <option>Not sure</option>
            </select>
          </div>
        </div>
        <div class="diag-field">
          <label for="diag-zip">ZIP code or town</label>
          <input type="text" id="diag-zip" placeholder="e.g. 04240 or Lewiston" />
          <span class="diag-hint">We serve all of Maine.</span>
        </div>
        <div class="diag-field">
          <label>How soon do you need help?</label>
          <div class="diag-urgency" data-field="urgency">
            <button class="diag-urg" data-value="urgent">ASAP</button>
            <button class="diag-urg" data-value="soon">Next few weeks</button>
            <button class="diag-urg" data-value="planning">Just planning</button>
            <button class="diag-urg" data-value="flexible">Flexible</button>
          </div>
        </div>
        <div class="diag-nav">
          <button class="diag-btn-back">&larr; Back</button>
          <button class="diag-btn-next">Continue &rarr;</button>
        </div>
      </div>

      <!-- STEP 4 -->
      <div class="diag-step" data-step="4">
        <h3 class="diag-title">How can we reach you?</h3>
        <p class="diag-subtitle">We\u2019ll get back within one business day — usually sooner.</p>
        <div class="diag-form-row">
          <div class="diag-field">
            <label for="diag-first">First name *</label>
            <input type="text" id="diag-first" required placeholder="First name" />
          </div>
          <div class="diag-field">
            <label for="diag-last">Last name *</label>
            <input type="text" id="diag-last" required placeholder="Last name" />
          </div>
        </div>
        <div class="diag-field">
          <label for="diag-email">Email *</label>
          <input type="email" id="diag-email" required placeholder="you@example.com" />
        </div>
        <div class="diag-field">
          <label for="diag-phone">Phone</label>
          <input type="tel" id="diag-phone" placeholder="(207) 555-0123" />
          <span class="diag-hint">Optional, but helpful if it\u2019s urgent.</span>
        </div>
        <div class="diag-field diag-sms-consent" id="diag-sms-group" style="display:none">
          <label class="diag-checkbox">
            <input type="checkbox" id="diag-sms-consent" />
            <span>I agree to receive text messages from Mattra Inc., including appointment updates, service info, and promotional offers. Msg frequency varies. Msg & data rates may apply. Reply STOP to cancel, HELP for help. <a href="/privacy" target="_blank">Privacy Policy</a> & <a href="/terms" target="_blank">Terms</a></span>
          </label>
        </div>
        <div class="diag-field">
          <label for="diag-notes">Anything else?</label>
          <textarea id="diag-notes" placeholder="No worries if not \u2014 we\u2019ll cover everything when we talk."></textarea>
        </div>
        <div class="diag-nav">
          <button class="diag-btn-back">&larr; Back</button>
          <button class="diag-btn-submit">Send My Info &rarr;</button>
        </div>
        <p class="diag-privacy">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          No spam, ever. Your info stays between us.
        </p>
      </div>

      <!-- STEP 5: Confirmation -->
      <div class="diag-step" data-step="5">
        <div class="diag-confirm">
          <div class="diag-confirm-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--green-primary)" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h3 class="diag-title" style="color:var(--green-primary)">You\u2019re All Set</h3>
          <p>We\u2019ll be in touch within <strong>one business day</strong>.</p>
          <p style="font-size:0.85rem">If it\u2019s urgent, call <a href="tel:+12077776020" style="font-weight:600">(207) 777-6020</a>.</p>
          <dl class="diag-summary" id="diag-summary"></dl>
        </div>
      </div>
    </div>
  `;

  /* ── CSS ── */
  const FORM_CSS = `
    .diag-card{background:var(--white);border-radius:var(--radius-lg);box-shadow:var(--shadow-md);padding:32px 32px 24px;position:relative}
    .diag-progress{display:flex;justify-content:center;gap:8px;margin-bottom:24px}
    .diag-progress-dot{width:9px;height:9px;border-radius:50%;background:var(--border-light);transition:all .3s}
    .diag-progress-dot.active{background:var(--green-primary);transform:scale(1.2)}
    .diag-progress-dot.done{background:var(--green-secondary)}
    .diag-step{display:none;animation:diagFade .3s ease}
    .diag-step.active{display:block}
    @keyframes diagFade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
    .diag-title{font-family:'Montserrat',sans-serif;font-size:1.2rem;font-weight:700;text-align:center;margin-bottom:6px;color:var(--text-dark)}
    .diag-subtitle{text-align:center;color:var(--text-light);font-size:0.85rem;margin-bottom:20px;line-height:1.5}
    .diag-options{display:grid;grid-template-columns:1fr 1fr;gap:8px}
    .diag-opt{display:flex;align-items:center;gap:10px;padding:12px 14px;border:2px solid var(--border-light);border-radius:var(--radius);cursor:pointer;background:var(--white);text-align:left;font-family:'Montserrat',sans-serif;font-size:.82rem;font-weight:500;color:var(--text-dark);line-height:1.35;transition:all .2s}
    .diag-opt:hover{border-color:var(--green-primary);background:rgba(49,107,67,.03)}
    .diag-opt.selected{border-color:var(--green-primary);background:rgba(49,107,67,.06);box-shadow:0 0 0 1px var(--green-primary)}
    .diag-opt-icon{font-size:1.2rem;flex-shrink:0;width:28px;text-align:center}
    .diag-opt-text{flex:1}
    .diag-opt-desc{display:block;font-size:.72rem;font-weight:400;color:var(--text-light);margin-top:1px}
    .diag-opt-full{grid-column:1/-1}
    .diag-opt.multi .diag-check{width:16px;height:16px;border:2px solid var(--border-light);border-radius:3px;flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:all .2s}
    .diag-opt.multi.selected .diag-check{background:var(--green-primary);border-color:var(--green-primary)}
    .diag-opt.multi.selected .diag-check::after{content:'\\2713';color:#fff;font-size:.65rem;font-weight:700}
    .diag-nav{display:flex;justify-content:space-between;align-items:center;margin-top:20px;padding-top:16px;border-top:1px solid var(--border-light)}
    .diag-btn-next,.diag-btn-submit{padding:10px 24px;border-radius:var(--radius-full);font-family:'Montserrat',sans-serif;font-size:.85rem;font-weight:600;border:none;cursor:pointer;transition:all .2s}
    .diag-btn-next{background:var(--green-primary);color:#fff}
    .diag-btn-next:hover{background:var(--green-forest)}
    .diag-btn-next:disabled{opacity:.4;cursor:not-allowed}
    .diag-btn-submit{background:var(--gold-accent);color:var(--text-dark)}
    .diag-btn-submit:hover{background:var(--gold-dark);color:#fff}
    .diag-btn-back{background:none;border:none;font-family:'Montserrat',sans-serif;font-size:.85rem;font-weight:500;color:var(--text-light);cursor:pointer;padding:10px 16px;border-radius:var(--radius);transition:all .2s}
    .diag-btn-back:hover{color:var(--text-dark);background:var(--light-gray)}
    .diag-form-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
    .diag-field{margin-bottom:12px}
    .diag-field label{display:block;font-size:.75rem;font-weight:600;color:var(--text-dark);margin-bottom:4px}
    .diag-field input,.diag-field select,.diag-field textarea{width:100%;padding:10px 12px;border:2px solid var(--border-light);border-radius:var(--radius);font-family:'Montserrat',sans-serif;font-size:.85rem;color:var(--text-dark);transition:border-color .2s;background:var(--white)}
    .diag-field input:focus,.diag-field select:focus,.diag-field textarea:focus{outline:none;border-color:var(--green-primary)}
    .diag-field textarea{resize:vertical;min-height:64px}
    .diag-hint{font-size:.7rem;color:var(--text-light);margin-top:2px;display:block}
    .diag-urgency{display:flex;gap:6px}
    .diag-urg{flex:1;padding:9px 6px;border:2px solid var(--border-light);border-radius:var(--radius);background:var(--white);cursor:pointer;text-align:center;font-family:'Montserrat',sans-serif;font-size:.75rem;font-weight:500;color:var(--text-dark);transition:all .2s}
    .diag-urg:hover{border-color:var(--green-primary)}
    .diag-urg.selected{border-color:var(--green-primary);background:rgba(49,107,67,.06);box-shadow:0 0 0 1px var(--green-primary)}
    .diag-privacy{text-align:center;margin-top:14px;font-size:.72rem;color:var(--text-light);display:flex;justify-content:center;align-items:center;gap:5px}
    .diag-confirm{text-align:center;padding:16px 0}
    .diag-confirm-icon{width:56px;height:56px;border-radius:50%;background:rgba(49,107,67,.1);display:flex;align-items:center;justify-content:center;margin:0 auto 14px}
    .diag-summary{background:var(--light-gray);border-radius:var(--radius);padding:16px 20px;margin-top:16px;text-align:left}
    .diag-summary dt{font-size:.68rem;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:var(--text-light);margin-top:10px}
    .diag-summary dt:first-child{margin-top:0}
    .diag-summary dd{font-size:.85rem;color:var(--text-dark);margin:2px 0 0}
    .diag-sms-consent{margin-top:-4px;margin-bottom:12px}
    label.diag-checkbox{display:flex;gap:8px;align-items:flex-start;cursor:pointer;font-size:.72rem;font-weight:400;line-height:1.5;color:var(--text-light)}
    .diag-checkbox input[type="checkbox"]{width:auto;margin-top:3px;flex-shrink:0;accent-color:var(--green-primary)}
    .diag-checkbox a{color:var(--green-primary);text-decoration:underline}
    @media(max-width:640px){
      .diag-card{padding:24px 16px 20px}
      .diag-options{grid-template-columns:1fr}
      .diag-form-row{grid-template-columns:1fr}
      .diag-urgency{flex-wrap:wrap}
      .diag-urg{min-width:calc(50% - 3px)}
    }
  `;

  /* ── Step 2 Templates ── */
  const TEMPLATES = {
    mold: {
      title: 'Tell us more about the mold or moisture',
      subtitle: 'Check all that apply.',
      questions: [
        { label: 'Where are you noticing it?', field: 'mold_where', multi: true, options: [
          { v:'basement', i:'&#x1F3DA;', l:'Basement' }, { v:'bathroom', i:'&#x1F6BF;', l:'Bathroom' },
          { v:'attic', i:'&#x2302;', l:'Attic' }, { v:'crawlspace', i:'&#x1F573;', l:'Crawl space' },
          { v:'walls', i:'&#x1F9F1;', l:'Walls / ceiling' }, { v:'notsure', i:'&#x2753;', l:'Not sure' }
        ]},
        { label: 'How long have you noticed it?', field: 'mold_duration', options: [
          { v:'just', l:'Just noticed' }, { v:'weeks', l:'A few weeks' },
          { v:'months', l:'A few months' }, { v:'long', l:'It\u2019s been a while' }
        ]}
      ]
    },
    energy: {
      title: 'What are you experiencing?',
      subtitle: 'Check all that apply.',
      questions: [
        { label: 'What\u2019s happening?', field: 'energy_symptoms', multi: true, options: [
          { v:'cold', i:'&#x2744;', l:'Cold rooms' }, { v:'bills', i:'&#x1F4B0;', l:'High heating bills' },
          { v:'drafts', i:'&#x1F32C;', l:'Drafts / air leaks' }, { v:'icedams', i:'&#x1F9CA;', l:'Ice dams' },
          { v:'uneven', i:'&#x1F321;', l:'Uneven temps' }, { v:'other', i:'&#x2026;', l:'Something else' }
        ]},
        { label: 'Interested in Efficiency Maine rebates?', field: 'energy_rebates', options: [
          { v:'yes', l:'Yes, tell me more' }, { v:'already', l:'Already started' }, { v:'notsure', l:'Not sure what that is' }
        ]}
      ]
    },
    water: {
      title: 'Tell us about the water issue',
      subtitle: 'This helps us understand urgency.',
      questions: [
        { label: 'How urgent?', field: 'water_urgency', options: [
          { v:'active', i:'&#x1F6A8;', l:'Active leak / flooding' }, { v:'recent', i:'&#x26A0;', l:'Recent damage' },
          { v:'past', i:'&#x1F4C5;', l:'Past damage, still visible' }, { v:'prevent', i:'&#x1F6E1;', l:'Preventative' }
        ]},
        { label: 'Where\u2019s the issue?', field: 'water_where', multi: true, options: [
          { v:'basement', l:'Basement' }, { v:'roof', l:'Roof' }, { v:'walls', l:'Walls' },
          { v:'foundation', l:'Foundation' }, { v:'multiple', l:'Multiple areas' }
        ]}
      ]
    },
    realestate: {
      title: 'Real estate situation',
      subtitle: 'We work with buyers, sellers, and agents every day.',
      questions: [
        { label: 'Your role?', field: 're_role', options: [
          { v:'buyer', i:'&#x1F3E0;', l:'Buying' }, { v:'seller', i:'&#x1F4B5;', l:'Selling' }, { v:'agent', i:'&#x1F4BC;', l:'I\u2019m an agent' }
        ]},
        { label: 'Timeline?', field: 're_timeline', options: [
          { v:'urgent', l:'Closing soon \u2014 urgent' }, { v:'month', l:'Within a month' }, { v:'exploring', l:'Just exploring' }
        ]},
        { label: 'What concerns came up?', field: 're_concerns', multi: true, options: [
          { v:'mold', l:'Mold in inspection' }, { v:'insulation', l:'Insulation concerns' },
          { v:'structural', l:'Structural issues' }, { v:'general', l:'General condition' }, { v:'peace', l:'Peace of mind' }
        ]}
      ]
    },
    repairs: {
      title: 'What kind of work?',
      subtitle: 'Check all that apply — many are connected.',
      questions: [
        { label: 'Select all that apply', field: 'repair_type', multi: true, options: [
          { v:'rot', i:'&#x1FAB5;', l:'Rot repair' }, { v:'roofing', i:'&#x1F3E0;', l:'Roofing' },
          { v:'siding', i:'&#x1F9F1;', l:'Siding' }, { v:'waterproof', i:'&#x1F4A7;', l:'Waterproofing' },
          { v:'general', i:'&#x1F527;', l:'General contracting' }, { v:'demolition', i:'&#x1F3D7;', l:'Demolition' },
          { v:'other', i:'&#x2026;', l:'Something else' }
        ]}
      ]
    },
    specific: {
      title: 'Which service?',
      subtitle: 'Pick the closest. We can adjust.',
      questions: [
        { label: 'Select a service', field: 'specific_service', options: [
          { v:'spray-foam', l:'Spray foam insulation' }, { v:'blown-in', l:'Blown-in insulation' },
          { v:'attic', l:'Attic insulation' }, { v:'air-sealing', l:'Air sealing' },
          { v:'energy-audit', l:'Energy audit' }, { v:'blower-door', l:'Blower door testing' },
          { v:'mold-inspect', l:'Mold inspection' }, { v:'mold-removal', l:'Mold remediation' },
          { v:'dehumidification', l:'Dehumidification' }, { v:'rodent', l:'Rodent cleanup' },
          { v:'insulation-removal', l:'Insulation removal' }, { v:'other', l:'Other' }
        ]}
      ]
    },
    notsure: {
      title: 'No problem at all.',
      subtitle: 'Just tell us what you\u2019ve been noticing.',
      questions: [
        { label: 'Describe what\u2019s going on', field: 'notsure_desc', type: 'textarea',
          placeholder: 'e.g. "My basement smells musty in summer" or "Our heating bill doubled" \u2014 anything helps.' }
      ]
    }
  };

  const CONCERN_LABELS = {
    mold: 'Mold / moisture', energy: 'High energy bills / cold rooms', water: 'Water damage',
    realestate: 'Buying or selling', repairs: 'Repairs / renovation',
    specific: 'Specific service', notsure: 'Not sure \u2014 needs guidance'
  };

  /* ── Init ── */
  function init(container) {
    // Inject CSS once
    if (!document.getElementById('diag-form-css')) {
      const style = document.createElement('style');
      style.id = 'diag-form-css';
      style.textContent = FORM_CSS;
      document.head.appendChild(style);
    }

    container.innerHTML = FORM_HTML;

    const state = { step: 1, concern: '', followUp: {} };
    const loadTs = String(Date.now()); // Capture at page load for bot detection
    const card = container.querySelector('.diag-card');
    const steps = card.querySelectorAll('.diag-step');
    const dots = card.querySelectorAll('.diag-progress-dot');
    const totalSteps = 4;

    /* ── Render Step 2 ── */
    function renderStep2(concern) {
      const tmpl = TEMPLATES[concern];
      if (!tmpl) return;
      const el = card.querySelector('#diag-step2');
      let html = `<h3 class="diag-title">${tmpl.title}</h3><p class="diag-subtitle">${tmpl.subtitle}</p>`;

      tmpl.questions.forEach(q => {
        if (q.type === 'textarea') {
          html += `<div class="diag-field"><label>${q.label}</label>
            <textarea data-field="${q.field}" placeholder="${q.placeholder || ''}"></textarea></div>`;
        } else {
          const cols = q.options.length <= 3 ? ' style="grid-template-columns:1fr"' : '';
          html += `<div class="diag-field"><label>${q.label}</label>
            <div class="diag-options"${cols} data-field="${q.field}" ${q.multi ? 'data-multi="true"' : ''}>`;
          q.options.forEach(o => {
            const icon = o.i ? `<span class="diag-opt-icon">${o.i}</span>` : '';
            const chk = q.multi ? '<span class="diag-check"></span>' : '';
            html += `<button class="diag-opt${q.multi ? ' multi' : ''}" data-value="${o.v}">${icon}${chk}<span class="diag-opt-text">${o.l}</span></button>`;
          });
          html += '</div></div>';
        }
      });

      el.innerHTML = html;
      bindClicks(el);
    }

    /* ── Click bindings ── */
    function bindClicks(scope) {
      scope.querySelectorAll('.diag-options').forEach(grid => {
        const multi = grid.dataset.multi === 'true';
        grid.querySelectorAll('.diag-opt').forEach(btn => {
          btn.addEventListener('click', () => {
            if (multi) { btn.classList.toggle('selected'); }
            else { grid.querySelectorAll('.diag-opt').forEach(b => b.classList.remove('selected')); btn.classList.add('selected'); }
            checkNext();
          });
        });
      });
    }

    // Bind step 1 clicks
    bindClicks(card.querySelector('[data-step="1"]'));

    // Bind urgency
    card.querySelectorAll('.diag-urgency').forEach(row => {
      row.querySelectorAll('.diag-urg').forEach(btn => {
        btn.addEventListener('click', () => {
          row.querySelectorAll('.diag-urg').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
        });
      });
    });

    // Textarea input for step 2
    card.querySelector('#diag-step2').addEventListener('input', e => {
      if (e.target.tagName === 'TEXTAREA') checkNext();
    });

    /* ── Next button state ── */
    function checkNext() {
      const active = card.querySelector('.diag-step.active');
      const btn = active.querySelector('.diag-btn-next');
      if (!btn) return;
      const n = parseInt(active.dataset.step);
      if (n === 1) btn.disabled = !active.querySelector('.diag-opt.selected');
      else if (n === 2) {
        let has = false;
        active.querySelectorAll('.diag-options').forEach(g => { if (g.querySelector('.diag-opt.selected')) has = true; });
        active.querySelectorAll('textarea').forEach(t => { if (t.value.trim()) has = true; });
        btn.disabled = !has;
      }
    }

    /* ── Navigation ── */
    function goTo(n) {
      state.step = n;
      steps.forEach(s => s.classList.remove('active'));
      card.querySelector(`[data-step="${n}"]`).classList.add('active');
      dots.forEach((d, i) => {
        d.classList.remove('active', 'done');
        if (i < n - 1) d.classList.add('done');
        if (i === n - 1 && n <= totalSteps) d.classList.add('active');
        if (n === 5) d.classList.add('done');
      });
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    card.querySelectorAll('.diag-btn-next').forEach(btn => {
      btn.addEventListener('click', () => {
        const active = card.querySelector('.diag-step.active');
        const n = parseInt(active.dataset.step);
        if (n === 1) {
          const sel = active.querySelector('.diag-opt.selected');
          if (!sel) return;
          state.concern = sel.dataset.value;
          renderStep2(state.concern);
          goTo(2); checkNext();
        } else if (n === 2) { collectStep2(); goTo(3); }
        else if (n === 3) { goTo(4); }
      });
    });

    card.querySelectorAll('.diag-btn-back').forEach(btn => {
      btn.addEventListener('click', () => {
        const n = parseInt(card.querySelector('.diag-step.active').dataset.step);
        if (n > 1) goTo(n - 1);
      });
    });

    // Show/hide SMS consent when phone is entered
    const phoneInput = card.querySelector('#diag-phone');
    const smsGroup = card.querySelector('#diag-sms-group');
    phoneInput.addEventListener('input', () => {
      const hasPhone = phoneInput.value.replace(/\D/g, '').length >= 7;
      smsGroup.style.display = hasPhone ? 'block' : 'none';
      if (!hasPhone) card.querySelector('#diag-sms-consent').checked = false;
    });

    card.querySelector('.diag-btn-submit').addEventListener('click', async () => {
      const first = card.querySelector('#diag-first').value.trim();
      const last  = card.querySelector('#diag-last').value.trim();
      const email = card.querySelector('#diag-email').value.trim();
      if (!first || !email) { alert('Please enter at least your first name and email.'); return; }
      const phone = phoneInput.value.replace(/\D/g, '');
      const smsCheck = card.querySelector('#diag-sms-consent');
      if (phone.length >= 7 && !smsCheck.checked) { alert('Please agree to receive text messages, or remove your phone number.'); return; }
      const notes = card.querySelector('#diag-notes').value.trim();
      const zip   = card.querySelector('#diag-zip').value.trim();
      const urg   = card.querySelector('.diag-urg.selected');

      // Build the payload
      const payload = {
        site_slug: 'mattra',
        form_type: 'diagnostic',
        first_name: first,
        last_name: last,
        email: email,
        concern: CONCERN_LABELS[state.concern] || state.concern,
        _ts: loadTs,
      };
      if (phone) payload.phone = phone;
      if (zip)   payload.zip = zip;
      if (urg)   payload.timeline = urg.textContent.trim();
      if (notes) payload.message = notes;
      if (smsCheck && smsCheck.checked) payload.sms_consent = 'true';

      // Include follow-up answers
      for (const [k, v] of Object.entries(state.followUp)) {
        if (v && (typeof v === 'string' ? v.length : v.length)) {
          payload[k] = Array.isArray(v) ? v.join(', ') : v;
        }
      }

      // Get reCAPTCHA token if available
      if (typeof grecaptcha !== 'undefined' && typeof grecaptcha.execute === 'function') {
        try {
          const rcToken = await grecaptcha.execute(RC_SITE_KEY, { action: 'diagnostic_form' });
          payload.recaptcha_token = rcToken;
        } catch (e) { console.warn('reCAPTCHA failed:', e); }
      }

      // Submit to form-notify
      try {
        await fetch('https://myaieditor.com/api/form-notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch (e) { console.error('Form submit error:', e); }

      // Show confirmation regardless (don't block UX on network)
      showConfirm();
      goTo(5);
    });

    function collectStep2() {
      const el = card.querySelector('#diag-step2');
      el.querySelectorAll('.diag-options').forEach(g => {
        state.followUp[g.dataset.field] = Array.from(g.querySelectorAll('.diag-opt.selected'))
          .map(s => s.querySelector('.diag-opt-text').textContent.trim());
      });
      el.querySelectorAll('textarea').forEach(t => { state.followUp[t.dataset.field] = t.value.trim(); });
    }

    function showConfirm() {
      const dl = card.querySelector('#diag-summary');
      let h = `<dt>Concern</dt><dd>${CONCERN_LABELS[state.concern] || state.concern}</dd>`;
      for (const [k, v] of Object.entries(state.followUp)) {
        if (v && (typeof v === 'string' ? v.length : v.length)) {
          h += `<dt>${k.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase())}</dt><dd>${Array.isArray(v) ? v.join(', ') : v}</dd>`;
        }
      }
      const zip = card.querySelector('#diag-zip').value.trim();
      const urg = card.querySelector('.diag-urg.selected');
      if (zip) h += `<dt>Location</dt><dd>${zip}</dd>`;
      if (urg) h += `<dt>Timeline</dt><dd>${urg.textContent.trim()}</dd>`;
      const first = card.querySelector('#diag-first').value.trim();
      const last = card.querySelector('#diag-last').value.trim();
      const email = card.querySelector('#diag-email').value.trim();
      const phone = card.querySelector('#diag-phone').value.trim();
      const notes = card.querySelector('#diag-notes').value.trim();
      h += `<dt>Contact</dt><dd>${first} ${last}<br>${email}${phone ? '<br>' + phone : ''}</dd>`;
      if (notes) h += `<dt>Notes</dt><dd>${notes}</dd>`;
      dl.innerHTML = h;
    }
  }

  /* ── Auto-init all placeholders ── */
  document.querySelectorAll('[id="diagnostic-form"], .diagnostic-form').forEach(el => init(el));

})();
