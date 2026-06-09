/* =============================================================
   Mattra Inc. — Attic Insulation Cost Estimator
   Self-contained reusable component
   Embed: <div class="attic-calculator"></div>
          <script src="/attic-insulation-calculator.js"></script>
   ============================================================= */

(function () {
  const AC_LOAD_TS = Date.now();
  let acSubmitted = false;
  const AC_RC_KEY = '6Lck8aQsAAAAALMA-T6nwfkSf7bv4K-mOhkszeKh';
  if (!document.querySelector('script[src*="recaptcha"]')) {
    const s = document.createElement('script');
    s.src = 'https://www.google.com/recaptcha/api.js?render=' + AC_RC_KEY;
    s.async = true;
    document.head.appendChild(s);
  }

  /* ── CSS ──────────────────────────────────────────────────── */
  if (!document.getElementById('attic-calc-css')) {
    const style = document.createElement('style');
    style.id = 'attic-calc-css';
    style.textContent = `
      .ac-card{background:var(--white,#fff);border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,.08);overflow:hidden;font-family:var(--font-body,'Montserrat',sans-serif)}
      .ac-header{background:linear-gradient(135deg,var(--green-dark,#1d4a2a),var(--green-primary,#316b43));padding:28px 32px;color:#fff}
      .ac-header h3{font-family:var(--font-heading,'DM Serif Display',serif);font-size:1.35rem;margin:0 0 6px;color:#fff}
      .ac-header p{font-size:.88rem;opacity:.85;margin:0;line-height:1.5}
      .ac-body{padding:28px 32px 32px}
      .ac-progress{display:flex;gap:6px;margin-bottom:28px}
      .ac-progress span{flex:1;height:4px;border-radius:4px;background:var(--cream,#f5f1eb);transition:background .3s}
      .ac-progress span.done{background:var(--green-primary,#316b43)}
      .ac-step{display:none}
      .ac-step.active{display:block}
      .ac-step-title{font-weight:700;font-size:1.05rem;margin-bottom:6px;color:var(--text-dark,#1a1a1a)}
      .ac-step-sub{font-size:.88rem;color:var(--brown-text,#706460);margin-bottom:20px;line-height:1.5}
      .ac-options{display:flex;flex-direction:column;gap:10px;margin-bottom:24px}
      .ac-opt{display:flex;align-items:center;gap:12px;padding:14px 16px;border:2px solid rgba(0,0,0,.08);border-radius:10px;cursor:pointer;transition:border-color .2s,background .2s;font-size:.92rem;color:var(--text-dark,#1a1a1a);line-height:1.4}
      .ac-opt:hover{border-color:var(--green-primary,#316b43);background:rgba(49,107,67,.04)}
      .ac-opt.selected{border-color:var(--green-primary,#316b43);background:rgba(49,107,67,.08)}
      .ac-opt .ac-radio{width:20px;height:20px;border-radius:50%;border:2px solid #ccc;flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:border-color .2s}
      .ac-opt.selected .ac-radio{border-color:var(--green-primary,#316b43)}
      .ac-opt.selected .ac-radio::after{content:'';width:10px;height:10px;border-radius:50%;background:var(--green-primary,#316b43)}
      .ac-label{display:block}
      .ac-label strong{display:block;margin-bottom:2px}
      .ac-label small{font-size:.8rem;color:var(--brown-text,#706460)}
      .ac-input-group{margin-bottom:20px}
      .ac-input-group label{display:block;font-size:.85rem;font-weight:600;margin-bottom:6px;color:var(--text-dark,#1a1a1a)}
      .ac-input-group input,.ac-input-group select{width:100%;padding:12px 14px;border:2px solid rgba(0,0,0,.1);border-radius:8px;font-size:.95rem;font-family:inherit;transition:border-color .2s;box-sizing:border-box}
      .ac-input-group input:focus,.ac-input-group select:focus{outline:none;border-color:var(--green-primary,#316b43)}
      .ac-input-row{display:grid;grid-template-columns:1fr 1fr;gap:16px}
      .ac-range-display{text-align:center;font-size:.85rem;color:var(--green-primary,#316b43);font-weight:600;margin-top:4px}
      .ac-input-group input[type="range"]{padding:0;border:none;height:6px;-webkit-appearance:none;background:var(--cream,#f5f1eb);border-radius:3px}
      .ac-input-group input[type="range"]::-webkit-slider-thumb{-webkit-appearance:none;width:20px;height:20px;border-radius:50%;background:var(--green-primary,#316b43);cursor:pointer}
      .ac-nav{display:flex;gap:12px;margin-top:24px}
      .ac-btn{flex:1;padding:14px 20px;border:none;border-radius:10px;font-size:.95rem;font-weight:600;cursor:pointer;font-family:inherit;transition:background .2s,transform .1s}
      .ac-btn:active{transform:scale(.98)}
      .ac-btn-next{background:var(--green-primary,#316b43);color:#fff}
      .ac-btn-next:hover{background:var(--green-dark,#1d4a2a)}
      .ac-btn-next:disabled{opacity:.5;cursor:not-allowed}
      .ac-btn-back{background:var(--cream,#f5f1eb);color:var(--text-dark,#1a1a1a)}
      .ac-btn-back:hover{background:#e8e4dd}

      /* Results */
      .ac-results{text-align:center}
      .ac-results-badge{display:inline-block;background:var(--green-primary,#316b43);color:#fff;padding:8px 20px;border-radius:20px;font-size:.8rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;margin-bottom:20px}
      .ac-results h3{font-family:var(--font-heading,'DM Serif Display',serif);font-size:1.3rem;margin-bottom:24px;color:var(--text-dark,#1a1a1a)}
      .ac-results-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px;text-align:center}
      .ac-result-box{padding:20px;border-radius:12px;background:var(--cream,#f5f1eb)}
      .ac-result-box.highlight{background:linear-gradient(135deg,var(--green-dark,#1d4a2a),var(--green-primary,#316b43));color:#fff}
      .ac-result-label{font-size:.75rem;text-transform:uppercase;letter-spacing:.06em;opacity:.7;margin-bottom:6px}
      .ac-result-value{font-size:1.8rem;font-weight:700;font-family:var(--font-heading,'DM Serif Display',serif)}
      .ac-result-box.highlight .ac-result-value{color:var(--gold-accent,#e7bb3a)}
      .ac-result-note{font-size:.82rem;opacity:.7;margin-top:4px}
      .ac-breakdown{text-align:left;margin:24px 0;padding:20px;background:var(--cream,#f5f1eb);border-radius:12px}
      .ac-breakdown h4{font-size:.9rem;font-weight:700;margin-bottom:12px;color:var(--text-dark,#1a1a1a)}
      .ac-breakdown-row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(0,0,0,.06);font-size:.88rem;color:var(--brown-text,#706460)}
      .ac-breakdown-row:last-child{border:none;font-weight:700;color:var(--text-dark,#1a1a1a)}
      .ac-disclaimer{font-size:.78rem;color:var(--brown-text,#706460);line-height:1.5;margin:20px 0;text-align:left}
      .ac-cta-group{display:flex;flex-direction:column;gap:10px;margin-top:20px}
      .ac-cta-primary{display:block;padding:14px 24px;background:var(--gold-accent,#e7bb3a);color:var(--text-dark,#1a1a1a);text-align:center;border-radius:10px;font-weight:700;font-size:.95rem;text-decoration:none;transition:background .2s}
      .ac-cta-primary:hover{background:#d4a82e}
      .ac-cta-secondary{display:block;padding:12px 24px;background:var(--cream,#f5f1eb);color:var(--green-primary,#316b43);text-align:center;border-radius:10px;font-weight:600;font-size:.9rem;text-decoration:none;transition:background .2s}
      .ac-cta-secondary:hover{background:#e8e4dd}
      .ac-cta-phone{display:block;text-align:center;margin-top:12px;font-size:.9rem;color:var(--brown-text,#706460)}
      .ac-cta-phone a{color:var(--green-primary,#316b43);font-weight:600;text-decoration:none}
      .ac-info-tip{font-size:.8rem;color:var(--brown-text,#706460);background:var(--cream,#f5f1eb);padding:12px 16px;border-radius:8px;margin-bottom:20px;line-height:1.5}
      .ac-info-tip strong{color:var(--text-dark,#1a1a1a)}

      @media(max-width:640px){
        .ac-body{padding:20px}
        .ac-header{padding:20px}
        .ac-input-row{grid-template-columns:1fr}
        .ac-results-grid{grid-template-columns:1fr}
      }
    `;
    document.head.appendChild(style);
  }

  /* ── Pricing Data (Maine-specific) ─────────────────────────── */
  const MATERIALS = {
    cellulose: {
      label: 'Blown-In Cellulose',
      desc: 'Most popular for Maine attics. Cost-effective, eco-friendly, excellent air sealing.',
      costPerSqFt: { min: 1.50, max: 2.50 },
      rPerInch: 3.7
    },
    fiberglass: {
      label: 'Blown-In Fiberglass',
      desc: 'Lightweight, non-settling. Good for homes where weight is a concern.',
      costPerSqFt: { min: 1.75, max: 3.00 },
      rPerInch: 2.7
    }
  };

  const CURRENT_R = {
    none:  { label: 'No insulation / bare joists', value: 0 },
    low:   { label: 'Thin layer (R-5 to R-10)', value: 7 },
    mid:   { label: 'Moderate (R-11 to R-19)', value: 15 },
    fair:  { label: 'Decent but below code (R-20 to R-30)', value: 25 },
    unsure:{ label: 'Not sure', value: 10 }
  };

  const TARGET_R = 49; // Maine energy code minimum

  const REBATE_TIERS = {
    low:      { label: 'Low Income (HEAP/SNAP/TANF)', pct: 0.80, max: 8000 },
    moderate: { label: 'Moderate Income', pct: 0.60, max: 6000 },
    any:      { label: 'Any Income / Not Sure', pct: 0.40, max: 4000 }
  };

  /* ── Component ───────────────────────────────────────────── */
  document.querySelectorAll('.attic-calculator').forEach(root => {
    let step = 0;
    const data = {
      sqft: '',
      currentR: null,
      material: null,
      incomeTier: null
    };

    function render() {
      root.innerHTML = `
        <div class="ac-card">
          <div class="ac-header">
            <h3>Attic Insulation Cost Estimator</h3>
            <p>Estimate your attic insulation cost in under 2 minutes</p>
          </div>
          <div class="ac-body">
            <div class="ac-progress">
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
        case 0: return stepSqft();
        case 1: return stepCurrentR();
        case 2: return stepMaterial();
        case 3: return stepIncome();
        case 4: return stepResults();
        default: return '';
      }
    }

    /* ── Step 1: Square Footage ───────────────────────────── */
    function stepSqft() {
      return `
        <div class="ac-step active">
          <div class="ac-step-title">What is your attic square footage?</div>
          <div class="ac-step-sub">If you're not sure, use your home's footprint as a rough estimate. Most single-story Maine homes have attics matching the main floor area.</div>
          <div class="ac-input-group">
            <label for="ac-sqft">Attic Area (sq ft)</label>
            <input type="number" id="ac-sqft" value="${data.sqft}" placeholder="e.g. 1200" min="100" max="10000" step="50">
          </div>
          <div class="ac-info-tip">
            <strong>Quick guide:</strong> A typical 3-bedroom Maine home has roughly 1,000–1,500 sq ft of attic space. Cape-style homes often have less usable attic area (600–1,000 sq ft).
          </div>
          <div class="ac-nav">
            <button class="ac-btn ac-btn-next" ${!data.sqft?'disabled':''} data-action="next">Continue &rarr;</button>
          </div>
        </div>
      `;
    }

    /* ── Step 2: Current R-Value ──────────────────────────── */
    function stepCurrentR() {
      return `
        <div class="ac-step active">
          <div class="ac-step-title">What's currently in your attic?</div>
          <div class="ac-step-sub">This helps us estimate how much insulation needs to be added to reach Maine's R-49 target.</div>
          <div class="ac-options">
            ${Object.entries(CURRENT_R).map(([k, v]) =>
              `<div class="ac-opt ${data.currentR===k?'selected':''}" data-val="${k}">
                <span class="ac-radio"></span>
                <span class="ac-label"><strong>${v.label}</strong></span>
              </div>`
            ).join('')}
          </div>
          <div class="ac-info-tip">
            <strong>Not sure?</strong> If you can see the tops of your attic joists, you likely have R-10 or less. If insulation is level with or above the joists (10–12 inches deep), you may already be near R-30.
          </div>
          <div class="ac-nav">
            <button class="ac-btn ac-btn-back" data-action="back">&larr; Back</button>
            <button class="ac-btn ac-btn-next" ${!data.currentR?'disabled':''} data-action="next">Continue &rarr;</button>
          </div>
        </div>
      `;
    }

    /* ── Step 3: Material ─────────────────────────────────── */
    function stepMaterial() {
      return `
        <div class="ac-step active">
          <div class="ac-step-title">Which insulation material do you prefer?</div>
          <div class="ac-step-sub">Both are excellent choices for Maine attics. We'll recommend the best option during your free assessment.</div>
          <div class="ac-options">
            ${Object.entries(MATERIALS).map(([k, v]) =>
              `<div class="ac-opt ${data.material===k?'selected':''}" data-val="${k}">
                <span class="ac-radio"></span>
                <span class="ac-label">
                  <strong>${v.label}</strong>
                  <small>${v.desc}</small>
                </span>
              </div>`
            ).join('')}
          </div>
          <div class="ac-nav">
            <button class="ac-btn ac-btn-back" data-action="back">&larr; Back</button>
            <button class="ac-btn ac-btn-next" ${!data.material?'disabled':''} data-action="next">Continue &rarr;</button>
          </div>
        </div>
      `;
    }

    /* ── Step 4: Income Tier ──────────────────────────────── */
    function stepIncome() {
      return `
        <div class="ac-step active">
          <div class="ac-step-title">What is your household income level?</div>
          <div class="ac-step-sub">This determines your Efficiency Maine rebate percentage. All information stays private.</div>
          <div class="ac-options">
            ${Object.entries(REBATE_TIERS).map(([k, v]) =>
              `<div class="ac-opt ${data.incomeTier===k?'selected':''}" data-val="${k}">
                <span class="ac-radio"></span>
                <span class="ac-label">
                  <strong>${v.label}</strong>
                  <small>Up to ${Math.round(v.pct * 100)}% back, max $${v.max.toLocaleString()}</small>
                </span>
              </div>`
            ).join('')}
          </div>
          <div class="ac-nav">
            <button class="ac-btn ac-btn-back" data-action="back">&larr; Back</button>
            <button class="ac-btn ac-btn-next" ${!data.incomeTier?'disabled':''} data-action="next">See My Estimate &rarr;</button>
          </div>
        </div>
      `;
    }

    /* ── Step 5: Results ──────────────────────────────────── */
    function stepResults() {
      const sqft = parseFloat(data.sqft) || 1200;
      const curR = CURRENT_R[data.currentR].value;
      const mat = MATERIALS[data.material];
      const tier = REBATE_TIERS[data.incomeTier];

      // Calculate R-value needed
      const rNeeded = Math.max(TARGET_R - curR, 0);
      const inchesNeeded = Math.ceil(rNeeded / mat.rPerInch);

      // Cost calculation — scaled by depth needed vs full install
      // Base cost is for a full R-49 install (~13" cellulose or ~18" fiberglass)
      const fullInches = Math.ceil(TARGET_R / mat.rPerInch);
      const depthFactor = rNeeded > 0 ? Math.max(inchesNeeded / fullInches, 0.5) : 0;

      const costMin = Math.round(sqft * mat.costPerSqFt.min * depthFactor / 50) * 50;
      const costMax = Math.round(sqft * mat.costPerSqFt.max * depthFactor / 50) * 50;
      const costMid = Math.round((costMin + costMax) / 2);

      // Rebate
      const rebateRaw = Math.round(costMid * tier.pct);
      const rebate = Math.min(rebateRaw, tier.max);

      // Out of pocket
      const oopMin = Math.max(costMin - rebate, 0);
      const oopMax = Math.max(costMax - rebate, 0);

      const alreadyGood = rNeeded <= 0;

      // Log estimate to form-notify (no contact info — anonymous estimate)
      if (!acSubmitted) {
        acSubmitted = true;
        (async () => {
          let rcToken = '';
          if (typeof grecaptcha !== 'undefined' && typeof grecaptcha.execute === 'function') {
            try { rcToken = await grecaptcha.execute(AC_RC_KEY, { action: 'attic_estimator' }); }
            catch (e) { console.warn('reCAPTCHA failed:', e); }
          }
          const acPayload = {
            site_slug: 'mattra',
            form_type: 'attic-cost-estimator',
            _ts: AC_LOAD_TS,
            _honey: '',
            recaptcha_token: rcToken,
            attic_sqft: sqft + ' sq ft',
            current_insulation: CURRENT_R[data.currentR].label,
            material: mat.label,
            income_tier: tier.label,
            r_value_needed: 'R-' + rNeeded,
            estimated_cost: alreadyGood ? 'N/A — already insulated' : '$' + costMin.toLocaleString() + ' – $' + costMax.toLocaleString(),
            estimated_rebate: alreadyGood ? 'N/A' : '$' + rebate.toLocaleString(),
            out_of_pocket: alreadyGood ? 'N/A' : '$' + oopMin.toLocaleString() + ' – $' + oopMax.toLocaleString(),
            message: alreadyGood ? 'Attic may already be well-insulated' : 'Estimate completed'
          };
          try { Object.assign(acPayload, getSourceAttribution()); } catch (e) { console.warn('source-attr error:', e); }
          fetch('https://myaieditor.com/api/form-notify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(acPayload)
          }).catch(err => console.error('Attic calc submit error:', err));
        })();

        // Fire GTM event
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: 'form_submission',
          form_type: 'attic-cost-estimator',
          form_location: window.location.pathname
        });
      }

      if (alreadyGood) {
        return `
          <div class="ac-step active">
            <div class="ac-results">
              <div class="ac-results-badge">Assessment Complete</div>
              <h3>Your Attic May Already Be Well-Insulated</h3>
              <p style="color:var(--brown-text,#706460);margin-bottom:24px;">Based on your inputs, your current insulation level is already at or near Maine's R-49 target. That said, a free in-home assessment can confirm whether air sealing or other improvements would still save you money.</p>
              <div class="ac-cta-group">
                <a href="/contact.html" class="ac-cta-primary">Schedule a Free Assessment &rarr;</a>
                <a href="/insulation.html" class="ac-cta-secondary">Explore Insulation Services</a>
                <div class="ac-cta-phone">Or call <a href="tel:+12077776020">(207) 777-6020</a></div>
              </div>
              <div class="ac-nav" style="margin-top:20px;">
                <button class="ac-btn ac-btn-back" data-action="restart">Start Over</button>
              </div>
            </div>
          </div>
        `;
      }

      return `
        <div class="ac-step active">
          <div class="ac-results">
            <div class="ac-results-badge">Your Estimate</div>
            <h3>Attic Insulation Cost Estimate</h3>
            <div class="ac-results-grid">
              <div class="ac-result-box">
                <div class="ac-result-label">Estimated Project Cost</div>
                <div class="ac-result-value">$${costMin.toLocaleString()} – $${costMax.toLocaleString()}</div>
              </div>
              <div class="ac-result-box highlight">
                <div class="ac-result-label">Estimated Rebate</div>
                <div class="ac-result-value">$${rebate.toLocaleString()}</div>
                <div class="ac-result-note">${Math.round(tier.pct * 100)}% — ${tier.label}</div>
              </div>
            </div>
            <div class="ac-results-grid">
              <div class="ac-result-box" style="grid-column:1/-1;">
                <div class="ac-result-label">Estimated Out-of-Pocket</div>
                <div class="ac-result-value" style="color:var(--green-primary,#316b43);">$${oopMin.toLocaleString()} – $${oopMax.toLocaleString()}</div>
                <div class="ac-result-note">After Efficiency Maine rebate</div>
              </div>
            </div>
            <div class="ac-breakdown">
              <h4>Project Details</h4>
              <div class="ac-breakdown-row"><span>Attic Area</span><span>${sqft.toLocaleString()} sq ft</span></div>
              <div class="ac-breakdown-row"><span>Current Insulation</span><span>~R-${curR}</span></div>
              <div class="ac-breakdown-row"><span>Target R-Value</span><span>R-${TARGET_R} (Maine code)</span></div>
              <div class="ac-breakdown-row"><span>R-Value to Add</span><span>R-${rNeeded}</span></div>
              <div class="ac-breakdown-row"><span>Material</span><span>${mat.label}</span></div>
              <div class="ac-breakdown-row"><span>Estimated Depth</span><span>~${inchesNeeded}" of new insulation</span></div>
              <div class="ac-breakdown-row"><span>Income Tier</span><span>${tier.label}</span></div>
            </div>
            <div class="ac-disclaimer">
              <strong>Note:</strong> This is a planning estimate based on typical Maine attic insulation costs. Your actual price may vary based on attic accessibility, existing conditions, air sealing needs, and other factors. A free in-home assessment provides an exact quote with confirmed rebate eligibility.
            </div>
            <div class="ac-cta-group">
              <a href="/contact.html" class="ac-cta-primary">Schedule Your Free Assessment &rarr;</a>
              <a href="/rebate-calculator.html" class="ac-cta-secondary">Try the Full Rebate Calculator</a>
              <div class="ac-cta-phone">Or call <a href="tel:+12077776020">(207) 777-6020</a></div>
            </div>
            <div class="ac-nav" style="margin-top:20px;">
              <button class="ac-btn ac-btn-back" data-action="restart">Start Over</button>
            </div>
          </div>
        </div>
      `;
    }

    /* ── Event Binding ────────────────────────────────────── */
    function bind() {
      // Option selectors (radio-style)
      root.querySelectorAll('.ac-opt').forEach(opt => {
        opt.addEventListener('click', () => {
          const val = opt.dataset.val;
          if (step === 1) data.currentR = val;
          if (step === 2) data.material = val;
          if (step === 3) data.incomeTier = val;
          render();
        });
      });

      // Sqft input
      const sqftInput = root.querySelector('#ac-sqft');
      if (sqftInput) {
        sqftInput.addEventListener('input', () => {
          data.sqft = sqftInput.value;
          const btn = root.querySelector('[data-action="next"]');
          if (btn) btn.disabled = !data.sqft || parseFloat(data.sqft) < 100;
        });
      }

      // Navigation
      root.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', () => {
          const action = btn.dataset.action;
          if (action === 'next' && canAdvance()) {
            step++;
            render();
          } else if (action === 'back') {
            step--;
            render();
          } else if (action === 'restart') {
            step = 0;
            data.sqft = '';
            data.currentR = null;
            data.material = null;
            data.incomeTier = null;
            render();
          }
        });
      });

      // Enter key to advance
      root.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && canAdvance()) {
          step++;
          render();
        }
      });
    }

    function canAdvance() {
      switch(step) {
        case 0: return data.sqft && parseFloat(data.sqft) >= 100;
        case 1: return !!data.currentR;
        case 2: return !!data.material;
        case 3: return !!data.incomeTier;
        default: return false;
      }
    }

    render();
  });
})();
