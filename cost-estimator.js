/* =============================================================
   Mattra Inc. — Unified Cost Estimator
   Self-contained reusable component for all calculator types.
   Embed: <div class="cost-estimator" data-type="attic"></div>
          <div class="cost-estimator" data-type="spray-foam"></div>
          <div class="cost-estimator" data-type="basement"></div>
          <script src="/cost-estimator.js"></script>
   ============================================================= */

(function () {
  const CE_LOAD_TS = Date.now();
  const CE_RC_KEY = '6Lck8aQsAAAAALMA-T6nwfkSf7bv4K-mOhkszeKh';

  if (!document.querySelector('script[src*="recaptcha"]')) {
    const s = document.createElement('script');
    s.src = 'https://www.google.com/recaptcha/api.js?render=' + CE_RC_KEY;
    s.async = true;
    document.head.appendChild(s);
  }

  /* ── CSS ──────────────────────────────────────────────────── */
  if (!document.getElementById('ce-calc-css')) {
    const style = document.createElement('style');
    style.id = 'ce-calc-css';
    style.textContent = `
      .ce-card{background:var(--white,#fff);border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,.08);overflow:hidden;font-family:var(--font-body,'Montserrat',sans-serif)}
      .ce-header{background:linear-gradient(135deg,var(--green-dark,#1d4a2a),var(--green-primary,#316b43));padding:28px 32px;color:#fff}
      .ce-header h3{font-family:var(--font-heading,'DM Serif Display',serif);font-size:1.35rem;margin:0 0 6px;color:#fff}
      .ce-header p{font-size:.88rem;opacity:.85;margin:0;line-height:1.5}
      .ce-body{padding:28px 32px 32px}
      .ce-progress{display:flex;gap:6px;margin-bottom:28px}
      .ce-progress span{flex:1;height:4px;border-radius:4px;background:var(--cream,#f5f1eb);transition:background .3s}
      .ce-progress span.done{background:var(--green-primary,#316b43)}
      .ce-step{display:none}
      .ce-step.active{display:block}
      .ce-step-title{font-weight:700;font-size:1.05rem;margin-bottom:6px;color:var(--text-dark,#1a1a1a)}
      .ce-step-sub{font-size:.88rem;color:var(--brown-text,#706460);margin-bottom:20px;line-height:1.5}
      .ce-options{display:flex;flex-direction:column;gap:10px;margin-bottom:24px}
      .ce-opt{display:flex;align-items:center;gap:12px;padding:14px 16px;border:2px solid rgba(0,0,0,.08);border-radius:10px;cursor:pointer;transition:border-color .2s,background .2s;font-size:.92rem;color:var(--text-dark,#1a1a1a);line-height:1.4}
      .ce-opt:hover{border-color:var(--green-primary,#316b43);background:rgba(49,107,67,.04)}
      .ce-opt.selected{border-color:var(--green-primary,#316b43);background:rgba(49,107,67,.08)}
      .ce-opt .ce-radio{width:20px;height:20px;border-radius:50%;border:2px solid #ccc;flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:border-color .2s}
      .ce-opt.selected .ce-radio{border-color:var(--green-primary,#316b43)}
      .ce-opt.selected .ce-radio::after{content:'';width:10px;height:10px;border-radius:50%;background:var(--green-primary,#316b43)}
      .ce-label{display:block}
      .ce-label strong{display:block;margin-bottom:2px}
      .ce-label small{font-size:.8rem;color:var(--brown-text,#706460)}
      .ce-input-group{margin-bottom:20px}
      .ce-input-group label{display:block;font-size:.85rem;font-weight:600;margin-bottom:6px;color:var(--text-dark,#1a1a1a)}
      .ce-input-group input,.ce-input-group select{width:100%;padding:12px 14px;border:2px solid rgba(0,0,0,.1);border-radius:8px;font-size:.95rem;font-family:inherit;transition:border-color .2s;box-sizing:border-box}
      .ce-input-group input:focus,.ce-input-group select:focus{outline:none;border-color:var(--green-primary,#316b43)}
      .ce-nav{display:flex;gap:12px;margin-top:24px}
      .ce-btn{flex:1;padding:14px 20px;border:none;border-radius:10px;font-size:.95rem;font-weight:600;cursor:pointer;font-family:inherit;transition:background .2s,transform .1s}
      .ce-btn:active{transform:scale(.98)}
      .ce-btn-next{background:var(--green-primary,#316b43);color:#fff}
      .ce-btn-next:hover{background:var(--green-dark,#1d4a2a)}
      .ce-btn-next:disabled{opacity:.5;cursor:not-allowed}
      .ce-btn-back{background:var(--cream,#f5f1eb);color:var(--text-dark,#1a1a1a)}
      .ce-btn-back:hover{background:#e8e4dd}
      .ce-results{text-align:center}
      .ce-results-badge{display:inline-block;background:var(--green-primary,#316b43);color:#fff;padding:8px 20px;border-radius:20px;font-size:.8rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;margin-bottom:20px}
      .ce-results h3{font-family:var(--font-heading,'DM Serif Display',serif);font-size:1.3rem;margin-bottom:24px;color:var(--text-dark,#1a1a1a)}
      .ce-results-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px;text-align:center}
      .ce-result-box{padding:20px;border-radius:12px;background:var(--cream,#f5f1eb)}
      .ce-result-box.highlight{background:linear-gradient(135deg,var(--green-dark,#1d4a2a),var(--green-primary,#316b43));color:#fff}
      .ce-result-label{font-size:.75rem;text-transform:uppercase;letter-spacing:.06em;opacity:.7;margin-bottom:6px}
      .ce-result-value{font-size:1.8rem;font-weight:700;font-family:var(--font-heading,'DM Serif Display',serif)}
      .ce-result-box.highlight .ce-result-value{color:var(--gold-accent,#e7bb3a)}
      .ce-result-note{font-size:.82rem;opacity:.7;margin-top:4px}
      .ce-breakdown{text-align:left;margin:24px 0;padding:20px;background:var(--cream,#f5f1eb);border-radius:12px}
      .ce-breakdown h4{font-size:.9rem;font-weight:700;margin-bottom:12px;color:var(--text-dark,#1a1a1a)}
      .ce-breakdown-row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(0,0,0,.06);font-size:.88rem;color:var(--brown-text,#706460)}
      .ce-breakdown-row:last-child{border:none;font-weight:700;color:var(--text-dark,#1a1a1a)}
      .ce-disclaimer{font-size:.78rem;color:var(--brown-text,#706460);line-height:1.5;margin:20px 0;text-align:left}
      .ce-cta-group{display:flex;flex-direction:column;gap:10px;margin-top:20px}
      .ce-cta-primary{display:block;padding:14px 24px;background:var(--gold-accent,#e7bb3a);color:var(--text-dark,#1a1a1a);text-align:center;border-radius:10px;font-weight:700;font-size:.95rem;text-decoration:none;transition:background .2s}
      .ce-cta-primary:hover{background:#d4a82e}
      .ce-cta-secondary{display:block;padding:12px 24px;background:var(--cream,#f5f1eb);color:var(--green-primary,#316b43);text-align:center;border-radius:10px;font-weight:600;font-size:.9rem;text-decoration:none;transition:background .2s}
      .ce-cta-secondary:hover{background:#e8e4dd}
      .ce-cta-phone{display:block;text-align:center;margin-top:12px;font-size:.9rem;color:var(--brown-text,#706460)}
      .ce-cta-phone a{color:var(--green-primary,#316b43);font-weight:600;text-decoration:none}
      .ce-info-tip{font-size:.8rem;color:var(--brown-text,#706460);background:var(--cream,#f5f1eb);padding:12px 16px;border-radius:8px;margin-bottom:20px;line-height:1.5}
      .ce-info-tip strong{color:var(--text-dark,#1a1a1a)}
      @media(max-width:640px){
        .ce-body{padding:20px}
        .ce-header{padding:20px}
        .ce-results-grid{grid-template-columns:1fr}
      }
    `;
    document.head.appendChild(style);
  }

  /* ── Shared Data ─────────────────────────────────────────────── */
  const REBATE_TIERS = {
    low:      { label: 'Low Income (HEAP/SNAP/TANF)', pct: 0.80, max: 8000 },
    moderate: { label: 'Moderate Income', pct: 0.60, max: 6000 },
    any:      { label: 'Any Income / Not Sure', pct: 0.40, max: 4000 }
  };

  /* ── Shared Helpers ──────────────────────────────────────────── */
  /* reCAPTCHA token, never fatal: a blocked script or wrong key can reject OR never
     settle, which would silently stop the estimate from ever being logged. Always
     resolve within 8s — an empty token posts through as missing_recaptcha_token. */
  function rcTokenSafe(action) {
    try {
      if (typeof grecaptcha === 'undefined' || typeof grecaptcha.execute !== 'function') {
        return Promise.resolve('');
      }
      var settled = false;
      return Promise.race([
        Promise.resolve(grecaptcha.execute(CE_RC_KEY, { action: action })).then(
          function (t) { settled = true; return t; },
          function (e) { settled = true; console.warn('reCAPTCHA failed:', e); return ''; }
        ),
        new Promise(function (resolve) {
          setTimeout(function () {
            if (!settled) console.warn('reCAPTCHA timed out');
            resolve('');
          }, 8000);
        })
      ]).catch(function () { return ''; });
    } catch (e) {
      console.warn('reCAPTCHA failed:', e);
      return Promise.resolve('');
    }
  }

  async function submitEstimate(formType, recaptchaAction, fields) {
    const rcToken = await rcTokenSafe(recaptchaAction);
    fetch('https://myaieditor.com/api/form-notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        site_slug: 'mattra',
        form_type: formType,
        _ts: CE_LOAD_TS,
        _honey: '',
        recaptcha_token: rcToken,
        ...fields,
        ...(typeof getSourceAttribution === 'function' ? getSourceAttribution() : {})
      })
    }).catch(err => console.error(formType + ' submit error:', err));

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'form_submission',
      form_type: formType,
      form_location: window.location.pathname
    });
  }

  function renderIncomeStep(data) {
    return `
      <div class="ce-step active">
        <div class="ce-step-title">What is your household income level?</div>
        <div class="ce-step-sub">This determines your Efficiency Maine rebate percentage. All information stays private.</div>
        <div class="ce-options">
          ${Object.entries(REBATE_TIERS).map(([k, v]) =>
            `<div class="ce-opt ${data.incomeTier===k?'selected':''}" data-val="${k}">
              <span class="ce-radio"></span>
              <span class="ce-label">
                <strong>${v.label}</strong>
                <small>Up to ${Math.round(v.pct * 100)}% back, max $${v.max.toLocaleString()}</small>
              </span>
            </div>`
          ).join('')}
        </div>
        <div class="ce-input-group">
          <label for="ce-zip">ZIP code or town *</label>
          <input type="text" id="ce-zip" value="${data.zip || ''}" placeholder="e.g. 04240 or Lewiston" required>
        </div>
        <div class="ce-nav">
          <button class="ce-btn ce-btn-back" data-action="back">&larr; Back</button>
          <button class="ce-btn ce-btn-next" ${(!data.incomeTier || !(data.zip||'').trim())?'disabled':''} data-action="next">See My Estimate &rarr;</button>
        </div>
      </div>
    `;
  }

  function renderCostGrid(costMin, costMax, rebate, tier, oopMin, oopMax) {
    return `
      <div class="ce-results-grid">
        <div class="ce-result-box">
          <div class="ce-result-label">Estimated Project Cost</div>
          <div class="ce-result-value">$${costMin.toLocaleString()} &ndash; $${costMax.toLocaleString()}</div>
        </div>
        <div class="ce-result-box highlight">
          <div class="ce-result-label">Estimated Rebate</div>
          <div class="ce-result-value">$${rebate.toLocaleString()}</div>
          <div class="ce-result-note">${Math.round(tier.pct * 100)}% &mdash; ${tier.label}</div>
        </div>
      </div>
      <div class="ce-results-grid">
        <div class="ce-result-box" style="grid-column:1/-1;">
          <div class="ce-result-label">Estimated Out-of-Pocket</div>
          <div class="ce-result-value" style="color:var(--green-primary,#316b43);">$${oopMin.toLocaleString()} &ndash; $${oopMax.toLocaleString()}</div>
          <div class="ce-result-note">After Efficiency Maine rebate</div>
        </div>
      </div>
    `;
  }

  function renderResultsCTA() {
    return `
      <div class="ce-cta-group">
        <a href="/contact.html" class="ce-cta-primary">Schedule Your Free Assessment &rarr;</a>
        <a href="/rebate-calculator.html" class="ce-cta-secondary">Try the Full Rebate Calculator</a>
        <div class="ce-cta-phone">Or call <a href="tel:+12077776020">(207) 777-6020</a></div>
      </div>
      <div class="ce-nav" style="margin-top:20px;">
        <button class="ce-btn ce-btn-back" data-action="restart">Start Over</button>
      </div>
    `;
  }

  /* ── Calculator Type Definitions ─────────────────────────────── */
  const TYPES = {};

  /* ═══════════════════════════════════════════════════════════════
     ATTIC INSULATION
     ═══════════════════════════════════════════════════════════════ */
  TYPES.attic = (function () {
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

    const TARGET_R = 49;

    function calculate(data) {
      const sqft = parseFloat(data.sqft) || 1200;
      const curR = CURRENT_R[data.currentR].value;
      const mat = MATERIALS[data.material];
      const tier = REBATE_TIERS[data.incomeTier];
      const rNeeded = Math.max(TARGET_R - curR, 0);
      const inchesNeeded = Math.ceil(rNeeded / mat.rPerInch);
      const fullInches = Math.ceil(TARGET_R / mat.rPerInch);
      const depthFactor = rNeeded > 0 ? Math.max(inchesNeeded / fullInches, 0.5) : 0;
      const costMin = Math.round(sqft * mat.costPerSqFt.min * depthFactor / 50) * 50;
      const costMax = Math.round(sqft * mat.costPerSqFt.max * depthFactor / 50) * 50;
      const costMid = Math.round((costMin + costMax) / 2);
      const rebateRaw = Math.round(costMid * tier.pct);
      const rebate = Math.min(rebateRaw, tier.max);
      const oopMin = Math.max(costMin - rebate, 0);
      const oopMax = Math.max(costMax - rebate, 0);
      const alreadyGood = rNeeded <= 0;
      return { sqft, curR, mat, tier, rNeeded, inchesNeeded, costMin, costMax, rebate, oopMin, oopMax, alreadyGood };
    }

    return {
      title: 'Attic Insulation Cost Estimator',
      subtitle: 'Estimate your attic insulation cost in under 2 minutes',
      totalSteps: 5,
      formType: 'attic-cost-estimator',
      recaptchaAction: 'attic_estimator',

      initData() {
        return { sqft: '', currentR: null, material: null, incomeTier: null, zip: '' };
      },

      renderStep(step, data) {
        switch (step) {
          case 0: return `
            <div class="ce-step active">
              <div class="ce-step-title">What is your attic square footage?</div>
              <div class="ce-step-sub">If you're not sure, use your home's footprint as a rough estimate. Most single-story Maine homes have attics matching the main floor area.</div>
              <div class="ce-input-group">
                <label for="ce-sqft">Attic Area (sq ft)</label>
                <input type="number" id="ce-sqft" value="${data.sqft}" placeholder="e.g. 1200" min="100" max="10000" step="50">
              </div>
              <div class="ce-info-tip">
                <strong>Quick guide:</strong> A typical 3-bedroom Maine home has roughly 1,000–1,500 sq ft of attic space. Cape-style homes often have less usable attic area (600–1,000 sq ft).
              </div>
              <div class="ce-nav">
                <button class="ce-btn ce-btn-next" ${!data.sqft?'disabled':''} data-action="next">Continue &rarr;</button>
              </div>
            </div>
          `;

          case 1: return `
            <div class="ce-step active">
              <div class="ce-step-title">What's currently in your attic?</div>
              <div class="ce-step-sub">This helps us estimate how much insulation needs to be added to reach Maine's R-49 target.</div>
              <div class="ce-options">
                ${Object.entries(CURRENT_R).map(([k, v]) =>
                  `<div class="ce-opt ${data.currentR===k?'selected':''}" data-val="${k}">
                    <span class="ce-radio"></span>
                    <span class="ce-label"><strong>${v.label}</strong></span>
                  </div>`
                ).join('')}
              </div>
              <div class="ce-info-tip">
                <strong>Not sure?</strong> If you can see the tops of your attic joists, you likely have R-10 or less. If insulation is level with or above the joists (10–12 inches deep), you may already be near R-30.
              </div>
              <div class="ce-nav">
                <button class="ce-btn ce-btn-back" data-action="back">&larr; Back</button>
                <button class="ce-btn ce-btn-next" ${!data.currentR?'disabled':''} data-action="next">Continue &rarr;</button>
              </div>
            </div>
          `;

          case 2: return `
            <div class="ce-step active">
              <div class="ce-step-title">Which insulation material do you prefer?</div>
              <div class="ce-step-sub">Both are excellent choices for Maine attics. We'll recommend the best option during your free assessment.</div>
              <div class="ce-options">
                ${Object.entries(MATERIALS).map(([k, v]) =>
                  `<div class="ce-opt ${data.material===k?'selected':''}" data-val="${k}">
                    <span class="ce-radio"></span>
                    <span class="ce-label">
                      <strong>${v.label}</strong>
                      <small>${v.desc}</small>
                    </span>
                  </div>`
                ).join('')}
              </div>
              <div class="ce-nav">
                <button class="ce-btn ce-btn-back" data-action="back">&larr; Back</button>
                <button class="ce-btn ce-btn-next" ${!data.material?'disabled':''} data-action="next">Continue &rarr;</button>
              </div>
            </div>
          `;

          case 3: return renderIncomeStep(data);

          case 4: {
            const r = calculate(data);
            if (r.alreadyGood) {
              return `
                <div class="ce-step active">
                  <div class="ce-results">
                    <div class="ce-results-badge">Assessment Complete</div>
                    <h3>Your Attic May Already Be Well-Insulated</h3>
                    <p style="color:var(--brown-text,#706460);margin-bottom:24px;">Based on your inputs, your current insulation level is already at or near Maine's R-49 target. That said, a free in-home assessment can confirm whether air sealing or other improvements would still save you money.</p>
                    <div class="ce-cta-group">
                      <a href="/contact.html" class="ce-cta-primary">Schedule a Free Assessment &rarr;</a>
                      <a href="/insulation.html" class="ce-cta-secondary">Explore Insulation Services</a>
                      <div class="ce-cta-phone">Or call <a href="tel:+12077776020">(207) 777-6020</a></div>
                    </div>
                    <div class="ce-nav" style="margin-top:20px;">
                      <button class="ce-btn ce-btn-back" data-action="restart">Start Over</button>
                    </div>
                  </div>
                </div>
              `;
            }
            return `
              <div class="ce-step active">
                <div class="ce-results">
                  <div class="ce-results-badge">Your Estimate</div>
                  <h3>Attic Insulation Cost Estimate</h3>
                  ${renderCostGrid(r.costMin, r.costMax, r.rebate, r.tier, r.oopMin, r.oopMax)}
                  <div class="ce-breakdown">
                    <h4>Project Details</h4>
                    <div class="ce-breakdown-row"><span>Attic Area</span><span>${r.sqft.toLocaleString()} sq ft</span></div>
                    <div class="ce-breakdown-row"><span>Current Insulation</span><span>~R-${r.curR}</span></div>
                    <div class="ce-breakdown-row"><span>Target R-Value</span><span>R-${TARGET_R} (Maine code)</span></div>
                    <div class="ce-breakdown-row"><span>R-Value to Add</span><span>R-${r.rNeeded}</span></div>
                    <div class="ce-breakdown-row"><span>Material</span><span>${r.mat.label}</span></div>
                    <div class="ce-breakdown-row"><span>Estimated Depth</span><span>~${r.inchesNeeded}" of new insulation</span></div>
                    <div class="ce-breakdown-row"><span>Income Tier</span><span>${r.tier.label}</span></div>
                  </div>
                  <div class="ce-disclaimer">
                    <strong>Note:</strong> This is a planning estimate based on typical Maine attic insulation costs. Your actual price may vary based on attic accessibility, existing conditions, air sealing needs, and other factors. A free in-home assessment provides an exact quote with confirmed rebate eligibility.
                  </div>
                  ${renderResultsCTA()}
                </div>
              </div>
            `;
          }

          default: return '';
        }
      },

      bindStep(root, step, data, render, advance) {
        const sqftInput = root.querySelector('#ce-sqft');
        if (sqftInput) {
          sqftInput.addEventListener('input', () => {
            data.sqft = sqftInput.value;
            const btn = root.querySelector('[data-action="next"]');
            if (btn) btn.disabled = !data.sqft || parseFloat(data.sqft) < 100;
          });
        }

        root.querySelectorAll('.ce-opt').forEach(opt => {
          opt.addEventListener('click', () => {
            const val = opt.dataset.val;
            if (step === 1) data.currentR = val;
            if (step === 2) data.material = val;
            if (step === 3) data.incomeTier = val;
            render();
          });
        });

        root.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') advance();
        });
      },

      canAdvance(step, data) {
        switch (step) {
          case 0: return data.sqft && parseFloat(data.sqft) >= 100;
          case 1: return !!data.currentR;
          case 2: return !!data.material;
          case 3: return !!data.incomeTier && !!(data.zip||'').trim();
          default: return false;
        }
      },

      buildPayload(data) {
        const r = calculate(data);
        return {
          attic_sqft: r.sqft + ' sq ft',
          current_insulation: CURRENT_R[data.currentR].label,
          material: r.mat.label,
          income_tier: r.tier.label,
          zip: data.zip,
          r_value_needed: 'R-' + r.rNeeded,
          estimated_cost: r.alreadyGood ? 'N/A — already insulated' : '$' + r.costMin.toLocaleString() + ' – $' + r.costMax.toLocaleString(),
          estimated_rebate: r.alreadyGood ? 'N/A' : '$' + r.rebate.toLocaleString(),
          out_of_pocket: r.alreadyGood ? 'N/A' : '$' + r.oopMin.toLocaleString() + ' – $' + r.oopMax.toLocaleString(),
          message: r.alreadyGood ? 'Attic may already be well-insulated' : 'Estimate completed'
        };
      }
    };
  })();

  /* ═══════════════════════════════════════════════════════════════
     SPRAY FOAM
     ═══════════════════════════════════════════════════════════════ */
  TYPES['spray-foam'] = (function () {
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

    function calculate(data) {
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

      return { foam, tier, totalMin, totalMax, rebate, oopMin, oopMax, lineItems };
    }

    function allSqftFilled(data) {
      return data.areas.every(k => data.sqftValues[k] && parseFloat(data.sqftValues[k]) >= 10);
    }

    return {
      title: 'Spray Foam Project Estimator',
      subtitle: 'Estimate your spray foam insulation cost in under 2 minutes',
      totalSteps: 5,
      formType: 'spray-foam-estimator',
      recaptchaAction: 'spray_foam_estimator',

      initData() {
        return { areas: [], foamType: null, sqftValues: {}, incomeTier: null, zip: '' };
      },

      renderStep(step, data) {
        switch (step) {
          case 0: return `
            <div class="ce-step active">
              <div class="ce-step-title">Where do you need spray foam?</div>
              <div class="ce-step-sub">Select all that apply. We'll estimate each area separately.</div>
              <div class="ce-options">
                ${Object.entries(AREAS).map(([k, v]) =>
                  `<div class="ce-opt ${data.areas.includes(k)?'selected':''}" data-val="${k}" data-type="area">
                    <span class="ce-radio" style="border-radius:4px"></span>
                    <span class="ce-label">
                      <strong>${v.label}</strong>
                      <small>${v.desc}</small>
                    </span>
                  </div>`
                ).join('')}
              </div>
              <div class="ce-nav">
                <button class="ce-btn ce-btn-next" ${data.areas.length===0?'disabled':''} data-action="next">Continue &rarr;</button>
              </div>
            </div>
          `;

          case 1: return `
            <div class="ce-step active">
              <div class="ce-step-title">Which type of spray foam?</div>
              <div class="ce-step-sub">We'll recommend the best option during your free assessment, but this helps with the estimate.</div>
              <div class="ce-options">
                ${Object.entries(FOAM_TYPES).map(([k, v]) =>
                  `<div class="ce-opt ${data.foamType===k?'selected':''}" data-val="${k}">
                    <span class="ce-radio"></span>
                    <span class="ce-label">
                      <strong>${v.label}</strong>
                      <small>${v.desc}</small>
                    </span>
                  </div>`
                ).join('')}
              </div>
              <div class="ce-nav">
                <button class="ce-btn ce-btn-back" data-action="back">&larr; Back</button>
                <button class="ce-btn ce-btn-next" ${!data.foamType?'disabled':''} data-action="next">Continue &rarr;</button>
              </div>
            </div>
          `;

          case 2: return `
            <div class="ce-step active">
              <div class="ce-step-title">How large is each area?</div>
              <div class="ce-step-sub">Enter approximate measurements. Don't worry about being exact &mdash; we'll confirm during your free assessment.</div>
              ${data.areas.map(areaKey => {
                const area = AREAS[areaKey];
                const val = data.sqftValues[areaKey] || '';
                return `
                  <div class="ce-input-group">
                    <label for="ce-sqft-${areaKey}">${area.label} &mdash; ${area.sqftLabel}</label>
                    <input type="number" id="ce-sqft-${areaKey}" data-area="${areaKey}" class="ce-sqft-input" value="${val}" placeholder="e.g. ${area.defaultSqft}" min="10" max="10000">
                  </div>
                `;
              }).join('')}
              <div class="ce-info-tip">
                <strong>Rim joist tip:</strong> Measure the perimeter of your foundation in linear feet. A 30&times;40 ft home = ~140 linear feet of rim joist.
              </div>
              <div class="ce-nav">
                <button class="ce-btn ce-btn-back" data-action="back">&larr; Back</button>
                <button class="ce-btn ce-btn-next" ${!allSqftFilled(data)?'disabled':''} data-action="next">Continue &rarr;</button>
              </div>
            </div>
          `;

          case 3: return renderIncomeStep(data);

          case 4: {
            const r = calculate(data);
            return `
              <div class="ce-step active">
                <div class="ce-results">
                  <div class="ce-results-badge">Your Estimate</div>
                  <h3>Spray Foam Project Estimate</h3>
                  ${renderCostGrid(r.totalMin, r.totalMax, r.rebate, r.tier, r.oopMin, r.oopMax)}
                  <div class="ce-breakdown">
                    <h4>Project Details</h4>
                    ${r.lineItems.map(li => `
                      <div class="ce-breakdown-row"><span>${li.label}</span><span>${li.sqft.toLocaleString()} ${data.areas.includes('rimJoist') && li.label.includes('Rim') ? 'ln ft' : 'sq ft'}</span></div>
                      <div class="ce-breakdown-row"><span>&nbsp;&nbsp;Thickness / R-value</span><span>${li.inches}" &rarr; R-${li.rValue}</span></div>
                      <div class="ce-breakdown-row"><span>&nbsp;&nbsp;Cost range</span><span>$${li.min.toLocaleString()} &ndash; $${li.max.toLocaleString()}</span></div>
                    `).join('')}
                    <div class="ce-breakdown-row"><span>Foam Type</span><span>${r.foam.label}</span></div>
                    <div class="ce-breakdown-row"><span>Income Tier</span><span>${r.tier.label}</span></div>
                    <div class="ce-breakdown-row"><span>Total Estimated Cost</span><span>$${r.totalMin.toLocaleString()} &ndash; $${r.totalMax.toLocaleString()}</span></div>
                  </div>
                  <div class="ce-disclaimer">
                    <strong>Note:</strong> This is a planning estimate based on typical Maine spray foam pricing. Actual costs depend on site access, surface preparation, existing conditions, and project complexity. A free in-home assessment provides an exact quote with confirmed rebate eligibility.
                  </div>
                  ${renderResultsCTA()}
                </div>
              </div>
            `;
          }

          default: return '';
        }
      },

      bindStep(root, step, data, render) {
        root.querySelectorAll('[data-type="area"]').forEach(opt => {
          opt.addEventListener('click', () => {
            const val = opt.dataset.val;
            const idx = data.areas.indexOf(val);
            if (idx > -1) data.areas.splice(idx, 1);
            else data.areas.push(val);
            render();
          });
        });

        root.querySelectorAll('.ce-opt:not([data-type="area"])').forEach(opt => {
          opt.addEventListener('click', () => {
            const val = opt.dataset.val;
            if (step === 1) data.foamType = val;
            if (step === 3) data.incomeTier = val;
            render();
          });
        });

        root.querySelectorAll('.ce-sqft-input').forEach(input => {
          input.addEventListener('input', () => {
            data.sqftValues[input.dataset.area] = input.value;
            const btn = root.querySelector('[data-action="next"]');
            if (btn) btn.disabled = !allSqftFilled(data);
          });
        });
        const firstEmpty = root.querySelector('.ce-sqft-input:not([value])') || root.querySelector('.ce-sqft-input');
        if (firstEmpty && step === 2) firstEmpty.focus();
      },

      canAdvance(step, data) {
        switch (step) {
          case 0: return data.areas.length > 0;
          case 1: return !!data.foamType;
          case 2: return allSqftFilled(data);
          case 3: return !!data.incomeTier && !!(data.zip||'').trim();
          default: return false;
        }
      },

      buildPayload(data) {
        const r = calculate(data);
        return {
          foam_type: r.foam.label,
          areas: r.lineItems.map(li => li.label).join(', '),
          income_tier: r.tier.label,
          zip: data.zip,
          estimated_cost: '$' + r.totalMin.toLocaleString() + ' – $' + r.totalMax.toLocaleString(),
          estimated_rebate: '$' + r.rebate.toLocaleString(),
          out_of_pocket: '$' + r.oopMin.toLocaleString() + ' – $' + r.oopMax.toLocaleString(),
          message: 'Estimate completed'
        };
      }
    };
  })();

  /* ═══════════════════════════════════════════════════════════════
     BASEMENT & CRAWL SPACE
     ═══════════════════════════════════════════════════════════════ */
  TYPES.basement = (function () {
    const PROJECT_TYPES = {
      rimJoist: {
        label: 'Rim Joist Only',
        desc: 'Spray foam at the rim joist / sill plate area. The most common and cost-effective basement upgrade.',
        unit: 'linear feet',
        defaultQty: 140,
        costPerUnit: { min: 15, max: 25 },
        rebateEligible: true
      },
      basementWall: {
        label: 'Basement Wall Insulation',
        desc: 'Full-height insulation on basement walls using spray foam or rigid foam board. Dramatically reduces heat loss.',
        unit: 'sq ft of wall area',
        defaultQty: 800,
        costPerUnit: { min: 3.00, max: 5.50 },
        rebateEligible: true
      },
      crawlEncap: {
        label: 'Crawl Space Encapsulation',
        desc: 'Full encapsulation: vapor barrier on floor and walls, sealed vents, insulation, and optional dehumidifier. Stops moisture, mold, and energy loss.',
        unit: 'sq ft of crawl space floor',
        defaultQty: 600,
        costPerUnit: { min: 5.00, max: 9.00 },
        rebateEligible: true
      },
      combo: {
        label: 'Combination (Rim Joist + Walls or Encapsulation)',
        desc: 'Most basements benefit from doing the rim joist and walls together. Crawl spaces usually need full encapsulation. We\'ll break down the cost for each component.',
        unit: null,
        defaultQty: null,
        costPerUnit: null,
        rebateEligible: true
      }
    };

    const COMBO_PARTS = {
      comboRim:  { label: 'Rim Joist', unit: 'linear feet', defaultQty: 140, costPerUnit: { min: 15, max: 25 } },
      comboWall: { label: 'Basement Walls', unit: 'sq ft', defaultQty: 800, costPerUnit: { min: 3.00, max: 5.50 } },
      comboCrawl: { label: 'Crawl Space Encapsulation', unit: 'sq ft', defaultQty: 600, costPerUnit: { min: 5.00, max: 9.00 } }
    };

    function comboReady(data) {
      return data.comboParts.length > 0 && data.comboParts.every(k => data.comboQty[k] && parseFloat(data.comboQty[k]) >= 10);
    }

    function calculate(data) {
      const tier = REBATE_TIERS[data.incomeTier];
      let totalMin = 0, totalMax = 0;
      const lineItems = [];

      if (data.projectType === 'combo') {
        data.comboParts.forEach(partKey => {
          const part = COMBO_PARTS[partKey];
          const qty = parseFloat(data.comboQty[partKey]) || part.defaultQty;
          const partMin = Math.round(qty * part.costPerUnit.min / 50) * 50;
          const partMax = Math.round(qty * part.costPerUnit.max / 50) * 50;
          totalMin += partMin;
          totalMax += partMax;
          lineItems.push({ label: part.label, qty, unit: part.unit, min: partMin, max: partMax });
        });
      } else {
        const pt = PROJECT_TYPES[data.projectType];
        const qty = parseFloat(data.qty) || pt.defaultQty;
        const partMin = Math.round(qty * pt.costPerUnit.min / 50) * 50;
        const partMax = Math.round(qty * pt.costPerUnit.max / 50) * 50;
        totalMin = partMin;
        totalMax = partMax;
        lineItems.push({ label: pt.label, qty, unit: pt.unit, min: partMin, max: partMax });
      }

      const totalMid = Math.round((totalMin + totalMax) / 2);
      const rebateRaw = Math.round(totalMid * tier.pct);
      const rebate = Math.min(rebateRaw, tier.max);
      const oopMin = Math.max(totalMin - rebate, 0);
      const oopMax = Math.max(totalMax - rebate, 0);

      return { tier, totalMin, totalMax, rebate, oopMin, oopMax, lineItems };
    }

    return {
      title: 'Basement &amp; Crawl Space Cost Estimator',
      subtitle: 'Estimate your basement insulation or crawl space encapsulation cost',
      totalSteps: 4,
      formType: 'basement-crawlspace-estimator',
      recaptchaAction: 'basement_estimator',

      initData() {
        return { projectType: null, qty: null, comboParts: [], comboQty: {}, incomeTier: null, zip: '' };
      },

      renderStep(step, data) {
        switch (step) {
          case 0: return `
            <div class="ce-step active">
              <div class="ce-step-title">What type of project are you planning?</div>
              <div class="ce-step-sub">Select the option that best matches your situation. Not sure? Pick "Combination" and we'll break it down.</div>
              <div class="ce-options">
                ${Object.entries(PROJECT_TYPES).map(([k, v]) =>
                  `<div class="ce-opt ${data.projectType===k?'selected':''}" data-val="${k}">
                    <span class="ce-radio"></span>
                    <span class="ce-label">
                      <strong>${v.label}</strong>
                      <small>${v.desc}</small>
                    </span>
                  </div>`
                ).join('')}
              </div>
              <div class="ce-nav">
                <button class="ce-btn ce-btn-next" ${!data.projectType?'disabled':''} data-action="next">Continue &rarr;</button>
              </div>
            </div>
          `;

          case 1: {
            if (data.projectType === 'combo') {
              return `
                <div class="ce-step active">
                  <div class="ce-step-title">Which areas are included in your project?</div>
                  <div class="ce-step-sub">Select all that apply, then enter measurements for each.</div>
                  <div class="ce-options" style="margin-bottom:20px">
                    ${Object.entries(COMBO_PARTS).map(([k, v]) =>
                      `<div class="ce-opt ${data.comboParts.includes(k)?'selected':''}" data-val="${k}" data-type="combo">
                        <span class="ce-radio" style="border-radius:4px"></span>
                        <span class="ce-label">
                          <strong>${v.label}</strong>
                          <small>${v.unit} &mdash; default: ${v.defaultQty.toLocaleString()}</small>
                        </span>
                      </div>`
                    ).join('')}
                  </div>
                  ${data.comboParts.map(partKey => {
                    const part = COMBO_PARTS[partKey];
                    const val = data.comboQty[partKey] || '';
                    return `
                      <div class="ce-input-group">
                        <label for="ce-combo-${partKey}">${part.label} &mdash; ${part.unit}</label>
                        <input type="number" id="ce-combo-${partKey}" data-part="${partKey}" class="ce-combo-input" value="${val}" placeholder="e.g. ${part.defaultQty}" min="10" max="10000">
                      </div>
                    `;
                  }).join('')}
                  ${data.comboParts.length > 0 ? `
                  <div class="ce-info-tip">
                    <strong>Rim joist tip:</strong> Perimeter of your foundation in linear feet. <strong>Wall area tip:</strong> Perimeter &times; wall height. <strong>Crawl space:</strong> Length &times; width of floor area.
                  </div>` : ''}
                  <div class="ce-nav">
                    <button class="ce-btn ce-btn-back" data-action="back">&larr; Back</button>
                    <button class="ce-btn ce-btn-next" ${!comboReady(data)?'disabled':''} data-action="next">Continue &rarr;</button>
                  </div>
                </div>
              `;
            }
            const pt = PROJECT_TYPES[data.projectType];
            return `
              <div class="ce-step active">
                <div class="ce-step-title">How large is the area?</div>
                <div class="ce-step-sub">Enter approximate measurements for your ${pt.label.toLowerCase()} project. We'll confirm exact numbers during your free assessment.</div>
                <div class="ce-input-group">
                  <label for="ce-qty">${pt.label} &mdash; ${pt.unit}</label>
                  <input type="number" id="ce-qty" class="ce-qty-input" value="${data.qty || ''}" placeholder="e.g. ${pt.defaultQty}" min="10" max="10000">
                </div>
                ${data.projectType === 'rimJoist' ? `
                <div class="ce-info-tip">
                  <strong>Measuring tip:</strong> Measure the perimeter of your foundation in linear feet. A 30&times;40 ft home has ~140 linear feet of rim joist.
                </div>` : ''}
                ${data.projectType === 'basementWall' ? `
                <div class="ce-info-tip">
                  <strong>Measuring tip:</strong> Multiply the perimeter of your basement (in feet) by the wall height (typically 7&ndash;8 ft). A 30&times;40 ft basement with 8 ft walls = ~1,120 sq ft of wall area.
                </div>` : ''}
                ${data.projectType === 'crawlEncap' ? `
                <div class="ce-info-tip">
                  <strong>Measuring tip:</strong> Measure the length &times; width of the crawl space floor area. This is typically the same footprint as the section of your home above the crawl space.
                </div>` : ''}
                <div class="ce-nav">
                  <button class="ce-btn ce-btn-back" data-action="back">&larr; Back</button>
                  <button class="ce-btn ce-btn-next" ${!data.qty || parseFloat(data.qty) < 10 ? 'disabled' : ''} data-action="next">Continue &rarr;</button>
                </div>
              </div>
            `;
          }

          case 2: return renderIncomeStep(data);

          case 3: {
            const r = calculate(data);
            return `
              <div class="ce-step active">
                <div class="ce-results">
                  <div class="ce-results-badge">Your Estimate</div>
                  <h3>Basement &amp; Crawl Space Project Estimate</h3>
                  ${renderCostGrid(r.totalMin, r.totalMax, r.rebate, r.tier, r.oopMin, r.oopMax)}
                  <div class="ce-breakdown">
                    <h4>Project Details</h4>
                    ${r.lineItems.map(li => `
                      <div class="ce-breakdown-row"><span>${li.label}</span><span>${li.qty.toLocaleString()} ${li.unit}</span></div>
                      <div class="ce-breakdown-row"><span>&nbsp;&nbsp;Cost range</span><span>$${li.min.toLocaleString()} &ndash; $${li.max.toLocaleString()}</span></div>
                    `).join('')}
                    <div class="ce-breakdown-row"><span>Income Tier</span><span>${r.tier.label}</span></div>
                    <div class="ce-breakdown-row"><span>Total Estimated Cost</span><span>$${r.totalMin.toLocaleString()} &ndash; $${r.totalMax.toLocaleString()}</span></div>
                  </div>
                  <div class="ce-disclaimer">
                    <strong>Note:</strong> This is a planning estimate based on typical Maine pricing for basement insulation and crawl space encapsulation. Actual costs depend on site access, existing conditions, moisture levels, and project complexity. Crawl space encapsulation pricing includes vapor barrier, sealed vents, wall insulation, and basic moisture management. A free in-home assessment provides an exact quote with confirmed rebate eligibility.
                  </div>
                  ${renderResultsCTA()}
                </div>
              </div>
            `;
          }

          default: return '';
        }
      },

      bindStep(root, step, data, render) {
        if (step === 0) {
          root.querySelectorAll('.ce-opt').forEach(opt => {
            opt.addEventListener('click', () => {
              data.projectType = opt.dataset.val;
              data.qty = null;
              data.comboParts = [];
              data.comboQty = {};
              render();
            });
          });
        }

        root.querySelectorAll('[data-type="combo"]').forEach(opt => {
          opt.addEventListener('click', () => {
            const val = opt.dataset.val;
            const idx = data.comboParts.indexOf(val);
            if (idx > -1) {
              data.comboParts.splice(idx, 1);
              delete data.comboQty[val];
            } else {
              data.comboParts.push(val);
            }
            render();
          });
        });

        const qtyInput = root.querySelector('.ce-qty-input');
        if (qtyInput) {
          qtyInput.addEventListener('input', () => {
            data.qty = qtyInput.value;
            const btn = root.querySelector('[data-action="next"]');
            if (btn) btn.disabled = !data.qty || parseFloat(data.qty) < 10;
          });
          if (step === 1) qtyInput.focus();
        }

        root.querySelectorAll('.ce-combo-input').forEach(input => {
          input.addEventListener('input', () => {
            data.comboQty[input.dataset.part] = input.value;
            const btn = root.querySelector('[data-action="next"]');
            if (btn) btn.disabled = !comboReady(data);
          });
        });

        if (step === 2) {
          root.querySelectorAll('.ce-opt').forEach(opt => {
            opt.addEventListener('click', () => {
              data.incomeTier = opt.dataset.val;
              render();
            });
          });
        }
      },

      canAdvance(step, data) {
        switch (step) {
          case 0: return !!data.projectType;
          case 1:
            if (data.projectType === 'combo') return comboReady(data);
            return data.qty && parseFloat(data.qty) >= 10;
          case 2: return !!data.incomeTier && !!(data.zip||'').trim();
          default: return false;
        }
      },

      buildPayload(data) {
        const r = calculate(data);
        return {
          project_type: r.lineItems.map(li => li.label).join(', '),
          income_tier: r.tier.label,
          zip: data.zip,
          estimated_cost: '$' + r.totalMin.toLocaleString() + ' – $' + r.totalMax.toLocaleString(),
          estimated_rebate: '$' + r.rebate.toLocaleString(),
          out_of_pocket: '$' + r.oopMin.toLocaleString() + ' – $' + r.oopMax.toLocaleString(),
          message: 'Estimate completed'
        };
      }
    };
  })();

  /* ── Initialize All Calculators ──────────────────────────────── */
  document.querySelectorAll('.cost-estimator').forEach(root => {
    const typeName = root.dataset.type;
    const config = TYPES[typeName];
    if (!config) return;

    let step = 0;
    let submitted = false;
    const data = config.initData();

    function advance() {
      if (config.canAdvance(step, data)) {
        step++;
        render();
      }
    }

    function render() {
      root.innerHTML = `
        <div class="ce-card">
          <div class="ce-header">
            <h3>${config.title}</h3>
            <p>${config.subtitle}</p>
          </div>
          <div class="ce-body">
            <div class="ce-progress">
              ${Array.from({length: config.totalSteps}, (_, i) =>
                `<span class="${i <= step ? 'done' : ''}"></span>`
              ).join('')}
            </div>
            ${config.renderStep(step, data)}
          </div>
        </div>
      `;

      if (step === config.totalSteps - 1 && !submitted) {
        submitted = true;
        submitEstimate(config.formType, config.recaptchaAction, config.buildPayload(data));
      }

      root.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', () => {
          const action = btn.dataset.action;
          if (action === 'next') advance();
          else if (action === 'back') { step--; render(); }
          else if (action === 'restart') {
            step = 0;
            const fresh = config.initData();
            Object.keys(data).forEach(k => delete data[k]);
            Object.assign(data, fresh);
            render();
          }
        });
      });

      // ZIP is required before results — keep state + button in sync
      const zipInput = root.querySelector('#ce-zip');
      if (zipInput) {
        zipInput.addEventListener('input', () => {
          data.zip = zipInput.value;
          const b = root.querySelector('[data-action="next"]');
          if (b) b.disabled = !config.canAdvance(step, data);
        });
      }

      config.bindStep(root, step, data, render, advance);
    }

    render();
  });
})();
