/* =============================================================
   Mattra Inc. — Spray Foam Project Estimator
   Self-contained reusable component
   Embed: <div class="spray-foam-calculator"></div>
          <script src="/spray-foam-calculator.js"></script>
   ============================================================= */

(function () {
  const SF_LOAD_TS = Date.now();
  let sfSubmitted = false;
  const SF_RC_KEY = '6Lck8aQsAAAAALMA-T6nwfkSf7bv4K-mOhkszeKh';
  if (!document.querySelector('script[src*="recaptcha"]')) {
    const s = document.createElement('script');
    s.src = 'https://www.google.com/recaptcha/api.js?render=' + SF_RC_KEY;
    s.async = true;
    document.head.appendChild(s);
  }

  if (!document.getElementById('sf-calc-css')) {
    const style = document.createElement('style');
    style.id = 'sf-calc-css';
    style.textContent = `
      .sf-card{background:var(--white,#fff);border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,.08);overflow:hidden;font-family:var(--font-body,'Montserrat',sans-serif)}
      .sf-header{background:linear-gradient(135deg,var(--green-dark,#1d4a2a),var(--green-primary,#316b43));padding:28px 32px;color:#fff}
      .sf-header h3{font-family:var(--font-heading,'DM Serif Display',serif);font-size:1.35rem;margin:0 0 6px;color:#fff}
      .sf-header p{font-size:.88rem;opacity:.85;margin:0;line-height:1.5}
      .sf-body{padding:28px 32px 32px}
      .sf-progress{display:flex;gap:6px;margin-bottom:28px}
      .sf-progress span{flex:1;height:4px;border-radius:4px;background:var(--cream,#f5f1eb);transition:background .3s}
      .sf-progress span.done{background:var(--green-primary,#316b43)}
      .sf-step{display:none}.sf-step.active{display:block}
      .sf-step-title{font-weight:700;font-size:1.05rem;margin-bottom:6px;color:var(--text-dark,#1a1a1a)}
      .sf-step-sub{font-size:.88rem;color:var(--brown-text,#706460);margin-bottom:20px;line-height:1.5}
      .sf-options{display:flex;flex-direction:column;gap:10px;margin-bottom:24px}
      .sf-opt{display:flex;align-items:center;gap:12px;padding:14px 16px;border:2px solid rgba(0,0,0,.08);border-radius:10px;cursor:pointer;transition:border-color .2s,background .2s;font-size:.92rem;color:var(--text-dark,#1a1a1a);line-height:1.4}
      .sf-opt:hover{border-color:var(--green-primary,#316b43);background:rgba(49,107,67,.04)}
      .sf-opt.selected{border-color:var(--green-primary,#316b43);background:rgba(49,107,67,.08)}
      .sf-opt .sf-radio{width:20px;height:20px;border-radius:50%;border:2px solid #ccc;flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:border-color .2s}
      .sf-opt.selected .sf-radio{border-color:var(--green-primary,#316b43)}
      .sf-opt.selected .sf-radio::after{content:'';width:10px;height:10px;border-radius:50%;background:var(--green-primary,#316b43)}
      .sf-label{display:block}.sf-label strong{display:block;margin-bottom:2px}.sf-label small{font-size:.8rem;color:var(--brown-text,#706460)}
      .sf-input-group{margin-bottom:20px}
      .sf-input-group label{display:block;font-size:.85rem;font-weight:600;margin-bottom:6px;color:var(--text-dark,#1a1a1a)}
      .sf-input-group input,.sf-input-group select{width:100%;padding:12px 14px;border:2px solid rgba(0,0,0,.1);border-radius:8px;font-size:.95rem;font-family:inherit;transition:border-color .2s;box-sizing:border-box}
      .sf-input-group input:focus,.sf-input-group select:focus{outline:none;border-color:var(--green-primary,#316b43)}
      .sf-checks{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:24px}
      .sf-check{padding:10px 16px;border:2px solid rgba(0,0,0,.08);border-radius:8px;cursor:pointer;font-size:.88rem;transition:all .2s;color:var(--text-dark,#1a1a1a)}
      .sf-check:hover{border-color:var(--green-primary,#316b43)}
      .sf-check.selected{border-color:var(--green-primary,#316b43);background:rgba(49,107,67,.08);font-weight:600}
      .sf-nav{display:flex;gap:12px;margin-top:24px}
      .sf-btn{flex:1;padding:14px 20px;border:none;border-radius:10px;font-size:.95rem;font-weight:600;cursor:pointer;font-family:inherit;transition:background .2s,transform .1s}
      .sf-btn:active{transform:scale(.98)}
      .sf-btn-next{background:var(--green-primary,#316b43);color:#fff}
      .sf-btn-next:hover{background:var(--green-dark,#1d4a2a)}
      .sf-btn-next:disabled{opacity:.5;cursor:not-allowed}
      .sf-btn-back{background:var(--cream,#f5f1eb);color:var(--text-dark,#1a1a1a)}
      .sf-btn-back:hover{background:#e8e4dd}
      .sf-results{text-align:center}
      .sf-results-badge{display:inline-block;background:var(--green-primary,#316b43);color:#fff;padding:8px 20px;border-radius:20px;font-size:.8rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;margin-bottom:20px}
      .sf-results h3{font-family:var(--font-heading,'DM Serif Display',serif);font-size:1.3rem;margin-bottom:24px;color:var(--text-dark,#1a1a1a)}
      .sf-results-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px;text-align:center}
      .sf-result-box{padding:20px;border-radius:12px;background:var(--cream,#f5f1eb)}
      .sf-result-box.highlight{background:linear-gradient(135deg,var(--green-dark,#1d4a2a),var(--green-primary,#316b43));color:#fff}
      .sf-result-label{font-size:.75rem;text-transform:uppercase;letter-spacing:.06em;opacity:.7;margin-bottom:6px}
      .sf-result-value{font-size:1.8rem;font-weight:700;font-family:var(--font-heading,'DM Serif Display',serif)}
      .sf-result-box.highlight .sf-result-value{color:var(--gold-accent,#e7bb3a)}
      .sf-result-note{font-size:.82rem;opacity:.7;margin-top:4px}
      .sf-breakdown{text-align:left;margin:24px 0;padding:20px;background:var(--cream,#f5f1eb);border-radius:12px}
      .sf-breakdown h4{font-size:.9rem;font-weight:700;margin-bottom:12px;color:var(--text-dark,#1a1a1a)}
      .sf-breakdown-row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(0,0,0,.06);font-size:.88rem;color:var(--brown-text,#706460)}
      .sf-breakdown-row:last-child{border:none;font-weight:700;color:var(--text-dark,#1a1a1a)}
      .sf-disclaimer{font-size:.78rem;color:var(--brown-text,#706460);line-height:1.5;margin:20px 0;text-align:left}
      .sf-cta-group{display:flex;flex-direction:column;gap:10px;margin-top:20px}
      .sf-cta-primary{display:block;padding:14px 24px;background:var(--gold-accent,#e7bb3a);color:var(--text-dark,#1a1a1a);text-align:center;border-radius:10px;font-weight:700;font-size:.95rem;text-decoration:none;transition:background .2s}
      .sf-cta-primary:hover{background:#d4a82e}
      .sf-cta-secondary{display:block;padding:12px 24px;background:var(--cream,#f5f1eb);color:var(--green-primary,#316b43);text-align:center;border-radius:10px;font-weight:600;font-size:.9rem;text-decoration:none;transition:background .2s}
      .sf-cta-secondary:hover{background:#e8e4dd}
      .sf-cta-phone{display:block;text-align:center;margin-top:12px;font-size:.9rem;color:var(--brown-text,#706460)}
      .sf-cta-phone a{color:var(--green-primary,#316b43);font-weight:600;text-decoration:none}
      .sf-info-tip{font-size:.8rem;color:var(--brown-text,#706460);background:var(--cream,#f5f1eb);padding:12px 16px;border-radius:8px;margin-bottom:20px;line-height:1.5}
      .sf-info-tip strong{color:var(--text-dark,#1a1a1a)}
      @media(max-width:640px){.sf-body{padding:20px}.sf-header{padding:20px}.sf-results-grid{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
  }

  /* ── Pricing Data ──────────────────────────────────────────── */
  const AREAS = {
    rimJoist:     { label: 'Rim Joist / Sill Plate', desc: 'Most common spray foam application. Seals the gap between foundation and framing.', sqftLabel: 'Linear feet of rim joist', defaultSqft: 150, rebateEligible: true },
    basementWall: { label: 'Basement Walls', desc: 'Full basement wall insulation from sill to floor. Stops moisture and heat loss.', sqftLabel: 'Wall area (sq ft)', defaultSqft: 800, rebateEligible: true },
    atticRoof:    { label: 'Unvented Attic (Roof Deck)', desc: 'Spray directly to roof sheathing to create a conditioned attic. Ideal for finished attics or HVAC in attic.', sqftLabel: 'Roof deck area (sq ft)', defaultSqft: 1200, rebateEligible: true },
    wallCavity:   { label: 'Wall Cavities', desc: 'Fill existing wall cavities with foam. Best for gut renovations or new construction.', sqftLabel: 'Wall area (sq ft)', defaultSqft: 1000, rebateEligible: true }
  };

  const FOAM_TYPES = {
    openCell: {
      label: 'Open Cell Foam',
      desc: 'Lower cost, excellent air sealing. R-3.7 per inch. Good for interior walls and attic roof decks.',
      costPerSqFt: { min: 1.25, max: 2.00 },
      rPerInch: 3.7,
      typicalInches: { rimJoist: 3, basementWall: 3, atticRoof: 6, wallCavity: 3.5 }
    },
    closedCell: {
      label: 'Closed Cell Foam (Genyk Elite 2.0)',
      desc: 'Higher R-value, vapor barrier, structural strength. R-7.0 per inch. Best for rim joists, basements, and moisture-prone areas.',
      costPerSqFt: { min: 2.50, max: 4.00 },
      rPerInch: 7.0,
      typicalInches: { rimJoist: 2, basementWall: 2, atticRoof: 3, wallCavity: 2 }
    }
  };

  const REBATE_TIERS = {
    low:      { label: 'Low Income (HEAP/SNAP/TANF)', pct: 0.80, max: 8000 },
    moderate: { label: 'Moderate Income', pct: 0.60, max: 6000 },
    any:      { label: 'Any Income / Not Sure', pct: 0.40, max: 4000 }
  };

  /* ── Component ───────────────────────────────────────────── */
  document.querySelectorAll('.spray-foam-calculator').forEach(root => {
    let step = 0;
    const data = {
      areas: [],      // multi-select
      foamType: null,
      sqftValues: {},  // { rimJoist: 150, basementWall: 800, ... }
      incomeTier: null
    };

    function render() {
      root.innerHTML = `
        <div class="sf-card">
          <div class="sf-header">
            <h3>Spray Foam Project Estimator</h3>
            <p>Estimate your spray foam insulation cost in under 2 minutes</p>
          </div>
          <div class="sf-body">
            <div class="sf-progress">
              ${[0,1,2,3,4].map(i => `<span class="${i <= step ? 'done' : ''}"></span>`).join('')}
            </div>
            ${renderStep()}
          </div>
        </div>
      `;
      bind();
    }

    function renderStep() {
      switch(step) {
        case 0: return stepAreas();
        case 1: return stepFoamType();
        case 2: return stepSqft();
        case 3: return stepIncome();
        case 4: return stepResults();
        default: return '';
      }
    }

    /* ── Step 1: Application Areas ────────────────────────── */
    function stepAreas() {
      return `
        <div class="sf-step active">
          <div class="sf-step-title">Where do you need spray foam?</div>
          <div class="sf-step-sub">Select all that apply. We'll estimate each area separately.</div>
          <div class="sf-options">
            ${Object.entries(AREAS).map(([k, v]) =>
              `<div class="sf-opt ${data.areas.includes(k)?'selected':''}" data-val="${k}" data-type="area">
                <span class="sf-radio" style="border-radius:4px"></span>
                <span class="sf-label">
                  <strong>${v.label}</strong>
                  <small>${v.desc}</small>
                </span>
              </div>`
            ).join('')}
          </div>
          <div class="sf-nav">
            <button class="sf-btn sf-btn-next" ${data.areas.length===0?'disabled':''} data-action="next">Continue &rarr;</button>
          </div>
        </div>
      `;
    }

    /* ── Step 2: Foam Type ────────────────────────────────── */
    function stepFoamType() {
      return `
        <div class="sf-step active">
          <div class="sf-step-title">Which type of spray foam?</div>
          <div class="sf-step-sub">We'll recommend the best option during your free assessment, but this helps with the estimate.</div>
          <div class="sf-options">
            ${Object.entries(FOAM_TYPES).map(([k, v]) =>
              `<div class="sf-opt ${data.foamType===k?'selected':''}" data-val="${k}">
                <span class="sf-radio"></span>
                <span class="sf-label">
                  <strong>${v.label}</strong>
                  <small>${v.desc}</small>
                </span>
              </div>`
            ).join('')}
          </div>
          <div class="sf-nav">
            <button class="sf-btn sf-btn-back" data-action="back">&larr; Back</button>
            <button class="sf-btn sf-btn-next" ${!data.foamType?'disabled':''} data-action="next">Continue &rarr;</button>
          </div>
        </div>
      `;
    }

    /* ── Step 3: Square Footage per Area ──────────────────── */
    function stepSqft() {
      return `
        <div class="sf-step active">
          <div class="sf-step-title">How large is each area?</div>
          <div class="sf-step-sub">Enter approximate measurements. Don't worry about being exact — we'll confirm during your free assessment.</div>
          ${data.areas.map(areaKey => {
            const area = AREAS[areaKey];
            const val = data.sqftValues[areaKey] || '';
            return `
              <div class="sf-input-group">
                <label for="sf-sqft-${areaKey}">${area.label} — ${area.sqftLabel}</label>
                <input type="number" id="sf-sqft-${areaKey}" data-area="${areaKey}" class="sf-sqft-input" value="${val}" placeholder="e.g. ${area.defaultSqft}" min="10" max="10000">
              </div>
            `;
          }).join('')}
          <div class="sf-info-tip">
            <strong>Rim joist tip:</strong> Measure the perimeter of your foundation in linear feet. A 30×40 ft home = ~140 linear feet of rim joist.
          </div>
          <div class="sf-nav">
            <button class="sf-btn sf-btn-back" data-action="back">&larr; Back</button>
            <button class="sf-btn sf-btn-next" ${!allSqftFilled()?'disabled':''} data-action="next">Continue &rarr;</button>
          </div>
        </div>
      `;
    }

    function allSqftFilled() {
      return data.areas.every(k => data.sqftValues[k] && parseFloat(data.sqftValues[k]) >= 10);
    }

    /* ── Step 4: Income Tier ──────────────────────────────── */
    function stepIncome() {
      return `
        <div class="sf-step active">
          <div class="sf-step-title">What is your household income level?</div>
          <div class="sf-step-sub">This determines your Efficiency Maine rebate percentage. All information stays private.</div>
          <div class="sf-options">
            ${Object.entries(REBATE_TIERS).map(([k, v]) =>
              `<div class="sf-opt ${data.incomeTier===k?'selected':''}" data-val="${k}">
                <span class="sf-radio"></span>
                <span class="sf-label">
                  <strong>${v.label}</strong>
                  <small>Up to ${Math.round(v.pct * 100)}% back, max $${v.max.toLocaleString()}</small>
                </span>
              </div>`
            ).join('')}
          </div>
          <div class="sf-nav">
            <button class="sf-btn sf-btn-back" data-action="back">&larr; Back</button>
            <button class="sf-btn sf-btn-next" ${!data.incomeTier?'disabled':''} data-action="next">See My Estimate &rarr;</button>
          </div>
        </div>
      `;
    }

    /* ── Step 5: Results ──────────────────────────────────── */
    function stepResults() {
      const foam = FOAM_TYPES[data.foamType];
      const tier = REBATE_TIERS[data.incomeTier];
      let totalMin = 0, totalMax = 0;
      const lineItems = [];

      data.areas.forEach(areaKey => {
        const sqft = parseFloat(data.sqftValues[areaKey]) || AREAS[areaKey].defaultSqft;
        const inches = foam.typicalInches[areaKey];
        const areaMin = Math.round(sqft * foam.costPerSqFt.min / 50) * 50;
        const areaMax = Math.round(sqft * foam.costPerSqFt.max / 50) * 50;
        totalMin += areaMin;
        totalMax += areaMax;
        lineItems.push({
          label: AREAS[areaKey].label,
          sqft, inches,
          rValue: Math.round(inches * foam.rPerInch),
          min: areaMin, max: areaMax
        });
      });

      const totalMid = Math.round((totalMin + totalMax) / 2);
      const rebateRaw = Math.round(totalMid * tier.pct);
      const rebate = Math.min(rebateRaw, tier.max);
      const oopMin = Math.max(totalMin - rebate, 0);
      const oopMax = Math.max(totalMax - rebate, 0);

      // Log estimate to form-notify
      if (!sfSubmitted) {
        sfSubmitted = true;
        (async () => {
          let rcToken = '';
          if (typeof grecaptcha !== 'undefined' && typeof grecaptcha.execute === 'function') {
            try { rcToken = await grecaptcha.execute(SF_RC_KEY, { action: 'spray_foam_estimator' }); }
            catch (e) { console.warn('reCAPTCHA failed:', e); }
          }
          const sfPayload = {
            site_slug: 'mattra',
            form_type: 'spray-foam-estimator',
            _ts: SF_LOAD_TS,
            _honey: '',
            recaptcha_token: rcToken,
            foam_type: foam.label,
            areas: lineItems.map(li => li.label).join(', '),
            income_tier: tier.label,
            estimated_cost: '$' + totalMin.toLocaleString() + ' – $' + totalMax.toLocaleString(),
            estimated_rebate: '$' + rebate.toLocaleString(),
            out_of_pocket: '$' + oopMin.toLocaleString() + ' – $' + oopMax.toLocaleString(),
            message: 'Estimate completed'
          };
          try { Object.assign(sfPayload, getSourceAttribution()); } catch (e) { console.warn('source-attr error:', e); }
          fetch('https://myaieditor.com/api/form-notify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sfPayload)
          }).catch(err => console.error('Spray foam calc submit error:', err));
        })();

        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: 'form_submission',
          form_type: 'spray-foam-estimator',
          form_location: window.location.pathname
        });
      }

      return `
        <div class="sf-step active">
          <div class="sf-results">
            <div class="sf-results-badge">Your Estimate</div>
            <h3>Spray Foam Project Estimate</h3>
            <div class="sf-results-grid">
              <div class="sf-result-box">
                <div class="sf-result-label">Estimated Project Cost</div>
                <div class="sf-result-value">$${totalMin.toLocaleString()} – $${totalMax.toLocaleString()}</div>
              </div>
              <div class="sf-result-box highlight">
                <div class="sf-result-label">Estimated Rebate</div>
                <div class="sf-result-value">$${rebate.toLocaleString()}</div>
                <div class="sf-result-note">${Math.round(tier.pct * 100)}% — ${tier.label}</div>
              </div>
            </div>
            <div class="sf-results-grid">
              <div class="sf-result-box" style="grid-column:1/-1;">
                <div class="sf-result-label">Estimated Out-of-Pocket</div>
                <div class="sf-result-value" style="color:var(--green-primary,#316b43);">$${oopMin.toLocaleString()} – $${oopMax.toLocaleString()}</div>
                <div class="sf-result-note">After Efficiency Maine rebate</div>
              </div>
            </div>
            <div class="sf-breakdown">
              <h4>Project Details</h4>
              ${lineItems.map(li => `
                <div class="sf-breakdown-row"><span>${li.label}</span><span>${li.sqft.toLocaleString()} ${data.areas.includes('rimJoist') && li.label.includes('Rim') ? 'ln ft' : 'sq ft'}</span></div>
                <div class="sf-breakdown-row"><span>&nbsp;&nbsp;Thickness / R-value</span><span>${li.inches}" → R-${li.rValue}</span></div>
                <div class="sf-breakdown-row"><span>&nbsp;&nbsp;Cost range</span><span>$${li.min.toLocaleString()} – $${li.max.toLocaleString()}</span></div>
              `).join('')}
              <div class="sf-breakdown-row"><span>Foam Type</span><span>${foam.label}</span></div>
              <div class="sf-breakdown-row"><span>Income Tier</span><span>${tier.label}</span></div>
              <div class="sf-breakdown-row"><span>Total Estimated Cost</span><span>$${totalMin.toLocaleString()} – $${totalMax.toLocaleString()}</span></div>
            </div>
            <div class="sf-disclaimer">
              <strong>Note:</strong> This is a planning estimate based on typical Maine spray foam pricing. Actual costs depend on site access, surface preparation, existing conditions, and project complexity. A free in-home assessment provides an exact quote with confirmed rebate eligibility.
            </div>
            <div class="sf-cta-group">
              <a href="/contact.html" class="sf-cta-primary">Schedule Your Free Assessment &rarr;</a>
              <a href="/rebate-calculator.html" class="sf-cta-secondary">Try the Full Rebate Calculator</a>
              <div class="sf-cta-phone">Or call <a href="tel:+12077776020">(207) 777-6020</a></div>
            </div>
            <div class="sf-nav" style="margin-top:20px;">
              <button class="sf-btn sf-btn-back" data-action="restart">Start Over</button>
            </div>
          </div>
        </div>
      `;
    }

    /* ── Event Binding ────────────────────────────────────── */
    function bind() {
      // Multi-select areas (step 0)
      root.querySelectorAll('[data-type="area"]').forEach(opt => {
        opt.addEventListener('click', () => {
          const val = opt.dataset.val;
          const idx = data.areas.indexOf(val);
          if (idx > -1) data.areas.splice(idx, 1);
          else data.areas.push(val);
          render();
        });
      });

      // Single-select options
      root.querySelectorAll('.sf-opt:not([data-type="area"])').forEach(opt => {
        opt.addEventListener('click', () => {
          const val = opt.dataset.val;
          if (step === 1) data.foamType = val;
          if (step === 3) data.incomeTier = val;
          render();
        });
      });

      // Sqft inputs
      root.querySelectorAll('.sf-sqft-input').forEach(input => {
        input.addEventListener('input', () => {
          data.sqftValues[input.dataset.area] = input.value;
          const btn = root.querySelector('[data-action="next"]');
          if (btn) btn.disabled = !allSqftFilled();
        });
      });
      // Focus first empty input
      const firstEmpty = root.querySelector('.sf-sqft-input:not([value])') || root.querySelector('.sf-sqft-input');
      if (firstEmpty && step === 2) firstEmpty.focus();

      // Navigation
      root.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', () => {
          const action = btn.dataset.action;
          if (action === 'next' && canAdvance()) { step++; render(); }
          else if (action === 'back') { step--; render(); }
          else if (action === 'restart') {
            step = 0;
            data.areas = [];
            data.foamType = null;
            data.sqftValues = {};
            data.incomeTier = null;
            render();
          }
        });
      });
    }

    function canAdvance() {
      switch(step) {
        case 0: return data.areas.length > 0;
        case 1: return !!data.foamType;
        case 2: return allSqftFilled();
        case 3: return !!data.incomeTier;
        default: return false;
      }
    }

    render();
  });
})();
