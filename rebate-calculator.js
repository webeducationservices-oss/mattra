/* =============================================================
   Mattra Inc. — Efficiency Maine Rebate Calculator
   Self-contained reusable component
   Embed: <div class="rebate-calculator"></div>
          <script src="/rebate-calculator.js"></script>
   ============================================================= */

(function () {
  /* ── Capture load time for bot detection ── */
  const loadTs = String(Date.now());

  /* ── Load reCAPTCHA v3 automatically ── */
  const RC_SITE_KEY = '6Lck8aQsAAAAALMA-T6nwfkSf7bv4K-mOhkszeKh';
  if (!document.querySelector('script[src*="recaptcha"]')) {
    const s = document.createElement('script');
    s.src = 'https://www.google.com/recaptcha/api.js?render=' + RC_SITE_KEY;
    s.async = true;
    document.head.appendChild(s);
  }

  /* ── CSS ──────────────────────────────────────────────────── */
  if (!document.getElementById('rebate-calc-css')) {
    const style = document.createElement('style');
    style.id = 'rebate-calc-css';
    style.textContent = `
      .rc-card{background:var(--white,#fff);border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,.08);overflow:hidden;font-family:var(--font-body,'Montserrat',sans-serif)}
      .rc-header{background:linear-gradient(135deg,var(--green-dark,#1d4a2a),var(--green-primary,#316b43));padding:28px 32px;color:#fff}
      .rc-header h3{font-family:var(--font-heading,'DM Serif Display',serif);font-size:1.35rem;margin:0 0 6px;color:#fff}
      .rc-header p{font-size:.88rem;opacity:.85;margin:0;line-height:1.5}
      .rc-body{padding:28px 32px 32px}
      .rc-progress{display:flex;gap:6px;margin-bottom:28px}
      .rc-progress span{flex:1;height:4px;border-radius:4px;background:var(--cream,#f5f1eb);transition:background .3s}
      .rc-progress span.done{background:var(--green-primary,#316b43)}
      .rc-step{display:none}
      .rc-step.active{display:block}
      .rc-step-title{font-weight:700;font-size:1.05rem;margin-bottom:6px;color:var(--text-dark,#1a1a1a)}
      .rc-step-sub{font-size:.88rem;color:var(--brown-text,#706460);margin-bottom:20px;line-height:1.5}
      .rc-options{display:flex;flex-direction:column;gap:10px;margin-bottom:24px}
      .rc-opt{display:flex;align-items:center;gap:12px;padding:14px 16px;border:2px solid rgba(0,0,0,.08);border-radius:10px;cursor:pointer;transition:border-color .2s,background .2s;font-size:.92rem;color:var(--text-dark,#1a1a1a);line-height:1.4}
      .rc-opt:hover{border-color:var(--green-primary,#316b43);background:rgba(49,107,67,.04)}
      .rc-opt.selected{border-color:var(--green-primary,#316b43);background:rgba(49,107,67,.08)}
      .rc-opt .rc-radio{width:20px;height:20px;border-radius:50%;border:2px solid #ccc;flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:border-color .2s}
      .rc-opt.selected .rc-radio{border-color:var(--green-primary,#316b43)}
      .rc-opt.selected .rc-radio::after{content:'';width:10px;height:10px;border-radius:50%;background:var(--green-primary,#316b43)}
      .rc-label{display:block}
      .rc-label strong{display:block;margin-bottom:2px}
      .rc-label small{font-size:.8rem;color:var(--brown-text,#706460)}
      .rc-input-group{margin-bottom:20px}
      .rc-input-group label{display:block;font-size:.85rem;font-weight:600;margin-bottom:6px;color:var(--text-dark,#1a1a1a)}
      .rc-input-group input,.rc-input-group select{width:100%;padding:12px 14px;border:2px solid rgba(0,0,0,.1);border-radius:8px;font-size:.95rem;font-family:inherit;transition:border-color .2s;box-sizing:border-box}
      .rc-input-group input:focus,.rc-input-group select:focus{outline:none;border-color:var(--green-primary,#316b43)}
      .rc-input-row{display:grid;grid-template-columns:1fr 1fr;gap:16px}
      .rc-checks{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:24px}
      .rc-check{padding:10px 16px;border:2px solid rgba(0,0,0,.08);border-radius:8px;cursor:pointer;font-size:.88rem;transition:all .2s;color:var(--text-dark,#1a1a1a)}
      .rc-check:hover{border-color:var(--green-primary,#316b43)}
      .rc-check.selected{border-color:var(--green-primary,#316b43);background:rgba(49,107,67,.08);font-weight:600}
      .rc-nav{display:flex;gap:12px;margin-top:24px}
      .rc-btn{flex:1;padding:14px 20px;border:none;border-radius:10px;font-size:.95rem;font-weight:600;cursor:pointer;font-family:inherit;transition:background .2s,transform .1s}
      .rc-btn:active{transform:scale(.98)}
      .rc-btn-next{background:var(--green-primary,#316b43);color:#fff}
      .rc-btn-next:hover{background:var(--green-dark,#1d4a2a)}
      .rc-btn-next:disabled{opacity:.5;cursor:not-allowed}
      .rc-btn-back{background:var(--cream,#f5f1eb);color:var(--text-dark,#1a1a1a)}
      .rc-btn-back:hover{background:#e8e4dd}

      /* Results */
      .rc-results{text-align:center}
      .rc-results-badge{display:inline-block;background:var(--green-primary,#316b43);color:#fff;padding:8px 20px;border-radius:20px;font-size:.8rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;margin-bottom:20px}
      .rc-results h3{font-family:var(--font-heading,'DM Serif Display',serif);font-size:1.3rem;margin-bottom:24px;color:var(--text-dark,#1a1a1a)}
      .rc-results-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px;text-align:center}
      .rc-result-box{padding:20px;border-radius:12px;background:var(--cream,#f5f1eb)}
      .rc-result-box.highlight{background:linear-gradient(135deg,var(--green-dark,#1d4a2a),var(--green-primary,#316b43));color:#fff}
      .rc-result-label{font-size:.75rem;text-transform:uppercase;letter-spacing:.06em;opacity:.7;margin-bottom:6px}
      .rc-result-value{font-size:1.8rem;font-weight:700;font-family:var(--font-heading,'DM Serif Display',serif)}
      .rc-result-box.highlight .rc-result-value{color:var(--gold-accent,#e7bb3a)}
      .rc-result-note{font-size:.82rem;opacity:.7;margin-top:4px}
      .rc-breakdown{text-align:left;margin:24px 0;padding:20px;background:var(--cream,#f5f1eb);border-radius:12px}
      .rc-breakdown h4{font-size:.9rem;font-weight:700;margin-bottom:12px;color:var(--text-dark,#1a1a1a)}
      .rc-breakdown-row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(0,0,0,.06);font-size:.88rem;color:var(--brown-text,#706460)}
      .rc-breakdown-row:last-child{border:none;font-weight:700;color:var(--text-dark,#1a1a1a)}
      .rc-disclaimer{font-size:.78rem;color:var(--brown-text,#706460);line-height:1.5;margin:20px 0;text-align:left}
      .rc-cta-group{display:flex;flex-direction:column;gap:10px;margin-top:20px}
      .rc-cta-primary{display:block;padding:14px 24px;background:var(--gold-accent,#e7bb3a);color:var(--text-dark,#1a1a1a);text-align:center;border-radius:10px;font-weight:700;font-size:.95rem;text-decoration:none;transition:background .2s}
      .rc-cta-primary:hover{background:#d4a82e}
      .rc-cta-secondary{display:block;padding:12px 24px;background:var(--cream,#f5f1eb);color:var(--green-primary,#316b43);text-align:center;border-radius:10px;font-weight:600;font-size:.9rem;text-decoration:none;transition:background .2s}
      .rc-cta-secondary:hover{background:#e8e4dd}
      .rc-cta-phone{display:block;text-align:center;margin-top:12px;font-size:.9rem;color:var(--brown-text,#706460)}
      .rc-cta-phone a{color:var(--green-primary,#316b43);font-weight:600;text-decoration:none}

      @media(max-width:640px){
        .rc-body{padding:20px}
        .rc-header{padding:20px}
        .rc-input-row{grid-template-columns:1fr}
        .rc-results-grid{grid-template-columns:1fr}
      }
    `;
    document.head.appendChild(style);
  }

  /* ── Data ─────────────────────────────────────────────────── */
  const TIERS = {
    low:      { label: 'Low Income (HEAP/SNAP)', pct: 0.80, max: 8000 },
    moderate: { label: 'Moderate Income', pct: 0.60, max: 6000 },
    any:      { label: 'Any Income', pct: 0.40, max: 4000 }
  };

  const PROJECTS = {
    attic:     { label: 'Attic Insulation', min: 2000, max: 6000 },
    walls:     { label: 'Wall Insulation', min: 3000, max: 8000 },
    basement:  { label: 'Basement / Crawl Space', min: 2500, max: 7000 },
    airSeal:   { label: 'Air Sealing', min: 800, max: 3000 },
    rimJoist:  { label: 'Rim Joist / Sill Plate', min: 1000, max: 3500 },
    spray:     { label: 'Spray Foam Insulation', min: 4000, max: 12000 }
  };

  const HOME_SIZES = {
    small:  { label: 'Under 1,200 sq ft', factor: 0.7 },
    medium: { label: '1,200 – 2,000 sq ft', factor: 1.0 },
    large:  { label: '2,000 – 3,000 sq ft', factor: 1.3 },
    xlarge: { label: 'Over 3,000 sq ft', factor: 1.6 }
  };

  /* ── Component ───────────────────────────────────────────── */
  document.querySelectorAll('.rebate-calculator').forEach(root => {
    let step = 0;
    let tier = null;
    let selectedProjects = [];
    let homeSize = null;
    let contact = { first_name: '', email: '', phone: '' };
    let submitted = false;

    function render() {
      root.innerHTML = `
        <div class="rc-card">
          <div class="rc-header">
            <h3>Efficiency Maine Rebate Calculator</h3>
            <p>Estimate your insulation rebate in under 2 minutes</p>
          </div>
          <div class="rc-body">
            <div class="rc-progress">
              ${[0,1,2,3,4].map(i => `<span class="${i <= step ? 'done' : ''}"></span>`).join('')}
            </div>
            ${renderStep()}
          </div>
        </div>
      `;
      bindEvents();
    }

    function renderStep() {
      if (step === 0) return stepIncome();
      if (step === 1) return stepProjects();
      if (step === 2) return stepHomeSize();
      if (step === 3) return stepContact();
      if (step === 4) return stepResults();
      return '';
    }

    function stepIncome() {
      return `
        <div class="rc-step active">
          <div class="rc-step-title">What is your household income level?</div>
          <div class="rc-step-sub">This determines your rebate percentage. All information stays private.</div>
          <div class="rc-options">
            <div class="rc-opt ${tier==='low'?'selected':''}" data-val="low">
              <span class="rc-radio"></span>
              <span class="rc-label">
                <strong>Low Income</strong>
                <small>Participating in HEAP, SNAP, TANF, or income-based MaineCare — up to 80% back, max $8,000</small>
              </span>
            </div>
            <div class="rc-opt ${tier==='moderate'?'selected':''}" data-val="moderate">
              <span class="rc-radio"></span>
              <span class="rc-label">
                <strong>Moderate Income</strong>
                <small>AGI up to $70K (single) or $100K (married filing jointly) — up to 60% back, max $6,000</small>
              </span>
            </div>
            <div class="rc-opt ${tier==='any'?'selected':''}" data-val="any">
              <span class="rc-radio"></span>
              <span class="rc-label">
                <strong>Any Income / Not Sure</strong>
                <small>No income restrictions — up to 40% back, max $4,000</small>
              </span>
            </div>
          </div>
          <div class="rc-nav">
            <button class="rc-btn rc-btn-next" ${!tier?'disabled':''} data-action="next">Continue &rarr;</button>
          </div>
        </div>
      `;
    }

    function stepProjects() {
      return `
        <div class="rc-step active">
          <div class="rc-step-title">What work are you considering?</div>
          <div class="rc-step-sub">Select all that apply. We will estimate total project cost and rebate.</div>
          <div class="rc-checks">
            ${Object.entries(PROJECTS).map(([k, v]) =>
              `<div class="rc-check ${selectedProjects.includes(k)?'selected':''}" data-val="${k}">${v.label}</div>`
            ).join('')}
          </div>
          <div class="rc-nav">
            <button class="rc-btn rc-btn-back" data-action="back">&larr; Back</button>
            <button class="rc-btn rc-btn-next" ${selectedProjects.length===0?'disabled':''} data-action="next">Continue &rarr;</button>
          </div>
        </div>
      `;
    }

    function stepHomeSize() {
      return `
        <div class="rc-step active">
          <div class="rc-step-title">How large is your home?</div>
          <div class="rc-step-sub">This helps us scale the cost estimate to your situation.</div>
          <div class="rc-options">
            ${Object.entries(HOME_SIZES).map(([k, v]) =>
              `<div class="rc-opt ${homeSize===k?'selected':''}" data-val="${k}">
                <span class="rc-radio"></span>
                <span class="rc-label"><strong>${v.label}</strong></span>
              </div>`
            ).join('')}
          </div>
          <div class="rc-nav">
            <button class="rc-btn rc-btn-back" data-action="back">&larr; Back</button>
            <button class="rc-btn rc-btn-next" ${!homeSize?'disabled':''} data-action="next">Continue &rarr;</button>
          </div>
        </div>
      `;
    }

    function stepContact() {
      return `
        <div class="rc-step active">
          <div class="rc-step-title">Where should we send your estimate?</div>
          <div class="rc-step-sub">We will email your personalized rebate estimate so you have it for reference. No spam, no obligation.</div>
          <div class="rc-input-group">
            <label for="rc-name">First Name *</label>
            <input type="text" id="rc-name" value="${contact.first_name}" placeholder="Your first name" required>
          </div>
          <div class="rc-input-group">
            <label for="rc-email">Email *</label>
            <input type="email" id="rc-email" value="${contact.email}" placeholder="you@example.com" required>
          </div>
          <div class="rc-input-group">
            <label for="rc-phone">Phone <small style="font-weight:400;color:var(--brown-text,#706460)">(optional)</small></label>
            <input type="tel" id="rc-phone" inputmode="tel" value="${contact.phone}" placeholder="(207) 555-0000">
          </div>
          <input type="text" name="_honey" style="display:none;" tabindex="-1" autocomplete="off" />
          <div class="rc-nav">
            <button class="rc-btn rc-btn-back" data-action="back">&larr; Back</button>
            <button class="rc-btn rc-btn-next" data-action="submit">See My Estimate &rarr;</button>
          </div>
        </div>
      `;
    }

    function calcResults() {
      const t = TIERS[tier];
      const sf = HOME_SIZES[homeSize].factor;
      let totalMin = 0, totalMax = 0;
      const lines = [];
      selectedProjects.forEach(k => {
        const p = PROJECTS[k];
        const lo = Math.round(p.min * sf);
        const hi = Math.round(p.max * sf);
        totalMin += lo;
        totalMax += hi;
        lines.push({ label: p.label, range: '$' + lo.toLocaleString() + ' \u2013 $' + hi.toLocaleString() });
      });
      const midCost = Math.round((totalMin + totalMax) / 2);
      const rawRebate = Math.round(midCost * t.pct);
      const rebate = Math.min(rawRebate, t.max);
      const outOfPocket = midCost - rebate;
      return { t, totalMin, totalMax, midCost, rawRebate, rebate, outOfPocket, lines };
    }

    async function submitResults() {
      if (submitted) return;
      const r = calcResults();
      const projectNames = selectedProjects.map(k => PROJECTS[k].label).join(', ');

      // Get reCAPTCHA token
      let rcToken = '';
      if (typeof grecaptcha !== 'undefined' && typeof grecaptcha.execute === 'function') {
        try { rcToken = await grecaptcha.execute(RC_SITE_KEY, { action: 'rebate_calculator' }); }
        catch (e) { console.warn('reCAPTCHA failed:', e); }
      }

      const honey = wrapper.querySelector('input[name="_honey"]');
      const data = {
        site_slug: 'mattra',
        form_type: 'rebate-calculator',
        _ts: loadTs,
        _honey: honey ? honey.value : '',
        recaptcha_token: rcToken,
        first_name: contact.first_name,
        email: contact.email,
        phone: contact.phone || '',
        income_tier: r.t.label,
        rebate_percentage: Math.round(r.t.pct * 100) + '%',
        projects: projectNames,
        home_size: HOME_SIZES[homeSize].label,
        estimated_cost: '$' + r.midCost.toLocaleString(),
        cost_range: '$' + r.totalMin.toLocaleString() + ' \u2013 $' + r.totalMax.toLocaleString(),
        estimated_rebate: '$' + r.rebate.toLocaleString(),
        out_of_pocket: '$' + r.outOfPocket.toLocaleString(),
        savings_pct: Math.round((r.rebate / r.midCost) * 100) + '%',
        send_visitor_copy: true,
        visitor_email_subject: 'Your Efficiency Maine Rebate Estimate \u2014 Mattra Inc.'
      };
      try {
        await fetch('https://myaieditor.com/api/form-notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      } catch (err) {
        console.error('Rebate calculator submit error:', err);
      }
      submitted = true;
    }

    function stepResults() {
      const { t, totalMin, totalMax, midCost, rawRebate, rebate, outOfPocket, lines } = calcResults();

      if (!submitted) { submitResults(); }

      return `
        <div class="rc-step active">
          <div class="rc-results">
            <div class="rc-results-badge">Your Rebate Estimate</div>
            <p style="font-size:.85rem;color:var(--green-primary,#316b43);margin-bottom:16px">Sent to ${contact.email}</p>
            <h3>Based on ${t.label.split('(')[0].trim()} Tier</h3>
            <div class="rc-results-grid">
              <div class="rc-result-box">
                <div class="rc-result-label">Estimated Project Cost</div>
                <div class="rc-result-value">$${midCost.toLocaleString()}</div>
                <div class="rc-result-note">Range: $${totalMin.toLocaleString()} – $${totalMax.toLocaleString()}</div>
              </div>
              <div class="rc-result-box highlight">
                <div class="rc-result-label">Estimated Rebate</div>
                <div class="rc-result-value">$${rebate.toLocaleString()}</div>
                <div class="rc-result-note">${Math.round(t.pct * 100)}% back${rawRebate > t.max ? ' (capped at $' + t.max.toLocaleString() + ')' : ''}</div>
              </div>
            </div>
            <div class="rc-results-grid">
              <div class="rc-result-box">
                <div class="rc-result-label">Estimated Out-of-Pocket</div>
                <div class="rc-result-value">$${outOfPocket.toLocaleString()}</div>
              </div>
              <div class="rc-result-box">
                <div class="rc-result-label">Savings</div>
                <div class="rc-result-value">${Math.round((rebate / midCost) * 100)}%</div>
              </div>
            </div>
            <div class="rc-breakdown">
              <h4>Project Breakdown</h4>
              ${lines.map(l => `<div class="rc-breakdown-row"><span>${l.label}</span><span>${l.range}</span></div>`).join('')}
              <div class="rc-breakdown-row"><span>Estimated Rebate (${Math.round(t.pct * 100)}%)</span><span style="color:var(--green-primary,#316b43)">-$${rebate.toLocaleString()}</span></div>
              <div class="rc-breakdown-row"><span>Estimated Out-of-Pocket</span><span>$${outOfPocket.toLocaleString()}</span></div>
            </div>
            <p class="rc-disclaimer">These estimates are based on typical project costs and current Efficiency Maine rebate tiers. Actual costs and rebates depend on your home&rsquo;s conditions, project scope, and eligibility verification. Rebates are per building (lifetime limit). Mattra is a Registered Efficiency Maine Vendor and handles all rebate paperwork on your behalf.</p>
            <div class="rc-cta-group">
              <a href="/diagnostic" class="rc-cta-primary">Get a Free Written Estimate</a>
              <a href="/financing-rebates" class="rc-cta-secondary">Explore Financing Options</a>
              <p class="rc-cta-phone">Or call <a href="tel:+12077776020">(207) 777-6020</a> to talk to someone today</p>
            </div>
            <div class="rc-nav" style="margin-top:20px">
              <button class="rc-btn rc-btn-back" data-action="restart">&larr; Recalculate</button>
            </div>
          </div>
        </div>
      `;
    }

    function bindEvents() {
      /* Income tier selection */
      root.querySelectorAll('.rc-options .rc-opt').forEach(el => {
        el.addEventListener('click', () => {
          if (step === 0) { tier = el.dataset.val; render(); }
          if (step === 2) { homeSize = el.dataset.val; render(); }
        });
      });

      /* Project multi-select */
      root.querySelectorAll('.rc-check').forEach(el => {
        el.addEventListener('click', () => {
          const v = el.dataset.val;
          if (selectedProjects.includes(v)) {
            selectedProjects = selectedProjects.filter(x => x !== v);
          } else {
            selectedProjects.push(v);
          }
          render();
        });
      });

      /* Contact form inputs */
      const nameInput = root.querySelector('#rc-name');
      const emailInput = root.querySelector('#rc-email');
      const phoneInput = root.querySelector('#rc-phone');
      if (nameInput) {
        nameInput.addEventListener('input', () => { contact.first_name = nameInput.value; });
        emailInput.addEventListener('input', () => { contact.email = emailInput.value; });
        phoneInput.addEventListener('input', () => { contact.phone = phoneInput.value; });
      }

      /* Navigation */
      root.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', () => {
          const action = btn.dataset.action;
          if (action === 'submit') {
            /* Validate contact fields */
            const name = root.querySelector('#rc-name');
            const email = root.querySelector('#rc-email');
            if (name) contact.first_name = name.value.trim();
            if (email) contact.email = email.value.trim();
            const phone = root.querySelector('#rc-phone');
            if (phone) contact.phone = phone.value.trim();
            if (!contact.first_name || !contact.email) {
              if (name && !contact.first_name) name.style.borderColor = '#e74c3c';
              if (email && !contact.email) email.style.borderColor = '#e74c3c';
              return;
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
              if (email) email.style.borderColor = '#e74c3c';
              return;
            }
            btn.disabled = true;
            btn.textContent = 'Processing...';
            step++;
            render();
            return;
          }
          if (action === 'next' && !btn.disabled) { step++; render(); }
          if (action === 'back') { step--; render(); }
          if (action === 'restart') { step = 0; tier = null; selectedProjects = []; homeSize = null; contact = { first_name: '', email: '', phone: '' }; submitted = false; render(); }
        });
      });
    }

    render();
  });
})();
