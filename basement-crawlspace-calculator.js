/* =============================================================
   Mattra Inc. — Basement & Crawl Space Cost Estimator
   Self-contained reusable component
   Embed: <div class="basement-calculator"></div>
          <script src="/basement-crawlspace-calculator.js"></script>
   ============================================================= */

(function () {
  if (!document.getElementById('bc-calc-css')) {
    const style = document.createElement('style');
    style.id = 'bc-calc-css';
    style.textContent = `
      .bc-card{background:var(--white,#fff);border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,.08);overflow:hidden;font-family:var(--font-body,'Montserrat',sans-serif)}
      .bc-header{background:linear-gradient(135deg,var(--green-dark,#1d4a2a),var(--green-primary,#316b43));padding:28px 32px;color:#fff}
      .bc-header h3{font-family:var(--font-heading,'DM Serif Display',serif);font-size:1.35rem;margin:0 0 6px;color:#fff}
      .bc-header p{font-size:.88rem;opacity:.85;margin:0;line-height:1.5}
      .bc-body{padding:28px 32px 32px}
      .bc-progress{display:flex;gap:6px;margin-bottom:28px}
      .bc-progress span{flex:1;height:4px;border-radius:4px;background:var(--cream,#f5f1eb);transition:background .3s}
      .bc-progress span.done{background:var(--green-primary,#316b43)}
      .bc-step{display:none}.bc-step.active{display:block}
      .bc-step-title{font-weight:700;font-size:1.05rem;margin-bottom:6px;color:var(--text-dark,#1a1a1a)}
      .bc-step-sub{font-size:.88rem;color:var(--brown-text,#706460);margin-bottom:20px;line-height:1.5}
      .bc-options{display:flex;flex-direction:column;gap:10px;margin-bottom:24px}
      .bc-opt{display:flex;align-items:center;gap:12px;padding:14px 16px;border:2px solid rgba(0,0,0,.08);border-radius:10px;cursor:pointer;transition:border-color .2s,background .2s;font-size:.92rem;color:var(--text-dark,#1a1a1a);line-height:1.4}
      .bc-opt:hover{border-color:var(--green-primary,#316b43);background:rgba(49,107,67,.04)}
      .bc-opt.selected{border-color:var(--green-primary,#316b43);background:rgba(49,107,67,.08)}
      .bc-opt .bc-radio{width:20px;height:20px;border-radius:50%;border:2px solid #ccc;flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:border-color .2s}
      .bc-opt.selected .bc-radio{border-color:var(--green-primary,#316b43)}
      .bc-opt.selected .bc-radio::after{content:'';width:10px;height:10px;border-radius:50%;background:var(--green-primary,#316b43)}
      .bc-label{display:block}.bc-label strong{display:block;margin-bottom:2px}.bc-label small{font-size:.8rem;color:var(--brown-text,#706460)}
      .bc-input-group{margin-bottom:20px}
      .bc-input-group label{display:block;font-size:.85rem;font-weight:600;margin-bottom:6px;color:var(--text-dark,#1a1a1a)}
      .bc-input-group input,.bc-input-group select{width:100%;padding:12px 14px;border:2px solid rgba(0,0,0,.1);border-radius:8px;font-size:.95rem;font-family:inherit;transition:border-color .2s;box-sizing:border-box}
      .bc-input-group input:focus,.bc-input-group select:focus{outline:none;border-color:var(--green-primary,#316b43)}
      .bc-checks{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:24px}
      .bc-check{padding:10px 16px;border:2px solid rgba(0,0,0,.08);border-radius:8px;cursor:pointer;font-size:.88rem;transition:all .2s;color:var(--text-dark,#1a1a1a)}
      .bc-check:hover{border-color:var(--green-primary,#316b43)}
      .bc-check.selected{border-color:var(--green-primary,#316b43);background:rgba(49,107,67,.08);font-weight:600}
      .bc-nav{display:flex;gap:12px;margin-top:24px}
      .bc-btn{flex:1;padding:14px 20px;border:none;border-radius:10px;font-size:.95rem;font-weight:600;cursor:pointer;font-family:inherit;transition:background .2s,transform .1s}
      .bc-btn:active{transform:scale(.98)}
      .bc-btn-next{background:var(--green-primary,#316b43);color:#fff}
      .bc-btn-next:hover{background:var(--green-dark,#1d4a2a)}
      .bc-btn-next:disabled{opacity:.5;cursor:not-allowed}
      .bc-btn-back{background:var(--cream,#f5f1eb);color:var(--text-dark,#1a1a1a)}
      .bc-btn-back:hover{background:#e8e4dd}
      .bc-results{text-align:center}
      .bc-results-badge{display:inline-block;background:var(--green-primary,#316b43);color:#fff;padding:8px 20px;border-radius:20px;font-size:.8rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;margin-bottom:20px}
      .bc-results h3{font-family:var(--font-heading,'DM Serif Display',serif);font-size:1.3rem;margin-bottom:24px;color:var(--text-dark,#1a1a1a)}
      .bc-results-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px;text-align:center}
      .bc-result-box{padding:20px;border-radius:12px;background:var(--cream,#f5f1eb)}
      .bc-result-box.highlight{background:linear-gradient(135deg,var(--green-dark,#1d4a2a),var(--green-primary,#316b43));color:#fff}
      .bc-result-label{font-size:.75rem;text-transform:uppercase;letter-spacing:.06em;opacity:.7;margin-bottom:6px}
      .bc-result-value{font-size:1.8rem;font-weight:700;font-family:var(--font-heading,'DM Serif Display',serif)}
      .bc-result-box.highlight .bc-result-value{color:var(--gold-accent,#e7bb3a)}
      .bc-result-note{font-size:.82rem;opacity:.7;margin-top:4px}
      .bc-breakdown{text-align:left;margin:24px 0;padding:20px;background:var(--cream,#f5f1eb);border-radius:12px}
      .bc-breakdown h4{font-size:.9rem;font-weight:700;margin-bottom:12px;color:var(--text-dark,#1a1a1a)}
      .bc-breakdown-row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(0,0,0,.06);font-size:.88rem;color:var(--brown-text,#706460)}
      .bc-breakdown-row:last-child{border:none;font-weight:700;color:var(--text-dark,#1a1a1a)}
      .bc-disclaimer{font-size:.78rem;color:var(--brown-text,#706460);line-height:1.5;margin:20px 0;text-align:left}
      .bc-cta-group{display:flex;flex-direction:column;gap:10px;margin-top:20px}
      .bc-cta-primary{display:block;padding:14px 24px;background:var(--gold-accent,#e7bb3a);color:var(--text-dark,#1a1a1a);text-align:center;border-radius:10px;font-weight:700;font-size:.95rem;text-decoration:none;transition:background .2s}
      .bc-cta-primary:hover{background:#d4a82e}
      .bc-cta-secondary{display:block;padding:12px 24px;background:var(--cream,#f5f1eb);color:var(--green-primary,#316b43);text-align:center;border-radius:10px;font-weight:600;font-size:.9rem;text-decoration:none;transition:background .2s}
      .bc-cta-secondary:hover{background:#e8e4dd}
      .bc-cta-phone{display:block;text-align:center;margin-top:12px;font-size:.9rem;color:var(--brown-text,#706460)}
      .bc-cta-phone a{color:var(--green-primary,#316b43);font-weight:600;text-decoration:none}
      .bc-info-tip{font-size:.8rem;color:var(--brown-text,#706460);background:var(--cream,#f5f1eb);padding:12px 16px;border-radius:8px;margin-bottom:20px;line-height:1.5}
      .bc-info-tip strong{color:var(--text-dark,#1a1a1a)}
      @media(max-width:640px){.bc-body{padding:20px}.bc-header{padding:20px}.bc-results-grid{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
  }

  /* ── Pricing Data ──────────────────────────────────────────── */
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

  const REBATE_TIERS = {
    low:      { label: 'Low Income (HEAP/SNAP/TANF)', pct: 0.80, max: 8000 },
    moderate: { label: 'Moderate Income', pct: 0.60, max: 6000 },
    any:      { label: 'Any Income / Not Sure', pct: 0.40, max: 4000 }
  };

  /* ── Component ───────────────────────────────────────────── */
  document.querySelectorAll('.basement-calculator').forEach(root => {
    let step = 0;
    const data = {
      projectType: null,
      qty: null,
      comboParts: [],     // multi-select for combo
      comboQty: {},       // { comboRim: 140, comboWall: 800, ... }
      incomeTier: null
    };

    function render() {
      root.innerHTML = `
        <div class="bc-card">
          <div class="bc-header">
            <h3>Basement &amp; Crawl Space Cost Estimator</h3>
            <p>Estimate your basement insulation or crawl space encapsulation cost</p>
          </div>
          <div class="bc-body">
            <div class="bc-progress">
              ${[0,1,2,3].map(i => `<span class="${i <= step ? 'done' : ''}"></span>`).join('')}
            </div>
            ${renderStep()}
          </div>
        </div>
      `;
      bind();
    }

    function renderStep() {
      switch(step) {
        case 0: return stepProjectType();
        case 1: return stepMeasurements();
        case 2: return stepIncome();
        case 3: return stepResults();
        default: return '';
      }
    }

    /* ── Step 1: Project Type ───────────────────────────────── */
    function stepProjectType() {
      return `
        <div class="bc-step active">
          <div class="bc-step-title">What type of project are you planning?</div>
          <div class="bc-step-sub">Select the option that best matches your situation. Not sure? Pick "Combination" and we'll break it down.</div>
          <div class="bc-options">
            ${Object.entries(PROJECT_TYPES).map(([k, v]) =>
              `<div class="bc-opt ${data.projectType===k?'selected':''}" data-val="${k}">
                <span class="bc-radio"></span>
                <span class="bc-label">
                  <strong>${v.label}</strong>
                  <small>${v.desc}</small>
                </span>
              </div>`
            ).join('')}
          </div>
          <div class="bc-nav">
            <button class="bc-btn bc-btn-next" ${!data.projectType?'disabled':''} data-action="next">Continue &rarr;</button>
          </div>
        </div>
      `;
    }

    /* ── Step 2: Measurements ───────────────────────────────── */
    function stepMeasurements() {
      if (data.projectType === 'combo') {
        return stepComboMeasurements();
      }
      const pt = PROJECT_TYPES[data.projectType];
      return `
        <div class="bc-step active">
          <div class="bc-step-title">How large is the area?</div>
          <div class="bc-step-sub">Enter approximate measurements for your ${pt.label.toLowerCase()} project. We'll confirm exact numbers during your free assessment.</div>
          <div class="bc-input-group">
            <label for="bc-qty">${pt.label} — ${pt.unit}</label>
            <input type="number" id="bc-qty" class="bc-qty-input" value="${data.qty || ''}" placeholder="e.g. ${pt.defaultQty}" min="10" max="10000">
          </div>
          ${data.projectType === 'rimJoist' ? `
          <div class="bc-info-tip">
            <strong>Measuring tip:</strong> Measure the perimeter of your foundation in linear feet. A 30×40 ft home has ~140 linear feet of rim joist.
          </div>` : ''}
          ${data.projectType === 'basementWall' ? `
          <div class="bc-info-tip">
            <strong>Measuring tip:</strong> Multiply the perimeter of your basement (in feet) by the wall height (typically 7–8 ft). A 30×40 ft basement with 8 ft walls = ~1,120 sq ft of wall area.
          </div>` : ''}
          ${data.projectType === 'crawlEncap' ? `
          <div class="bc-info-tip">
            <strong>Measuring tip:</strong> Measure the length × width of the crawl space floor area. This is typically the same footprint as the section of your home above the crawl space.
          </div>` : ''}
          <div class="bc-nav">
            <button class="bc-btn bc-btn-back" data-action="back">&larr; Back</button>
            <button class="bc-btn bc-btn-next" ${!data.qty || parseFloat(data.qty) < 10 ? 'disabled' : ''} data-action="next">Continue &rarr;</button>
          </div>
        </div>
      `;
    }

    function stepComboMeasurements() {
      return `
        <div class="bc-step active">
          <div class="bc-step-title">Which areas are included in your project?</div>
          <div class="bc-step-sub">Select all that apply, then enter measurements for each.</div>
          <div class="bc-options" style="margin-bottom:20px">
            ${Object.entries(COMBO_PARTS).map(([k, v]) =>
              `<div class="bc-opt ${data.comboParts.includes(k)?'selected':''}" data-val="${k}" data-type="combo">
                <span class="bc-radio" style="border-radius:4px"></span>
                <span class="bc-label">
                  <strong>${v.label}</strong>
                  <small>${v.unit} — default: ${v.defaultQty.toLocaleString()}</small>
                </span>
              </div>`
            ).join('')}
          </div>
          ${data.comboParts.map(partKey => {
            const part = COMBO_PARTS[partKey];
            const val = data.comboQty[partKey] || '';
            return `
              <div class="bc-input-group">
                <label for="bc-combo-${partKey}">${part.label} — ${part.unit}</label>
                <input type="number" id="bc-combo-${partKey}" data-part="${partKey}" class="bc-combo-input" value="${val}" placeholder="e.g. ${part.defaultQty}" min="10" max="10000">
              </div>
            `;
          }).join('')}
          ${data.comboParts.length > 0 ? `
          <div class="bc-info-tip">
            <strong>Rim joist tip:</strong> Perimeter of your foundation in linear feet. <strong>Wall area tip:</strong> Perimeter × wall height. <strong>Crawl space:</strong> Length × width of floor area.
          </div>` : ''}
          <div class="bc-nav">
            <button class="bc-btn bc-btn-back" data-action="back">&larr; Back</button>
            <button class="bc-btn bc-btn-next" ${!comboReady()?'disabled':''} data-action="next">Continue &rarr;</button>
          </div>
        </div>
      `;
    }

    function comboReady() {
      return data.comboParts.length > 0 && data.comboParts.every(k => data.comboQty[k] && parseFloat(data.comboQty[k]) >= 10);
    }

    /* ── Step 3: Income Tier ────────────────────────────────── */
    function stepIncome() {
      return `
        <div class="bc-step active">
          <div class="bc-step-title">What is your household income level?</div>
          <div class="bc-step-sub">This determines your Efficiency Maine rebate percentage. All information stays private.</div>
          <div class="bc-options">
            ${Object.entries(REBATE_TIERS).map(([k, v]) =>
              `<div class="bc-opt ${data.incomeTier===k?'selected':''}" data-val="${k}">
                <span class="bc-radio"></span>
                <span class="bc-label">
                  <strong>${v.label}</strong>
                  <small>Up to ${Math.round(v.pct * 100)}% back, max $${v.max.toLocaleString()}</small>
                </span>
              </div>`
            ).join('')}
          </div>
          <div class="bc-nav">
            <button class="bc-btn bc-btn-back" data-action="back">&larr; Back</button>
            <button class="bc-btn bc-btn-next" ${!data.incomeTier?'disabled':''} data-action="next">See My Estimate &rarr;</button>
          </div>
        </div>
      `;
    }

    /* ── Step 4: Results ────────────────────────────────────── */
    function stepResults() {
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

      return `
        <div class="bc-step active">
          <div class="bc-results">
            <div class="bc-results-badge">Your Estimate</div>
            <h3>Basement &amp; Crawl Space Project Estimate</h3>
            <div class="bc-results-grid">
              <div class="bc-result-box">
                <div class="bc-result-label">Estimated Project Cost</div>
                <div class="bc-result-value">$${totalMin.toLocaleString()} &ndash; $${totalMax.toLocaleString()}</div>
              </div>
              <div class="bc-result-box highlight">
                <div class="bc-result-label">Estimated Rebate</div>
                <div class="bc-result-value">$${rebate.toLocaleString()}</div>
                <div class="bc-result-note">${Math.round(tier.pct * 100)}% &mdash; ${tier.label}</div>
              </div>
            </div>
            <div class="bc-results-grid">
              <div class="bc-result-box" style="grid-column:1/-1;">
                <div class="bc-result-label">Estimated Out-of-Pocket</div>
                <div class="bc-result-value" style="color:var(--green-primary,#316b43);">$${oopMin.toLocaleString()} &ndash; $${oopMax.toLocaleString()}</div>
                <div class="bc-result-note">After Efficiency Maine rebate</div>
              </div>
            </div>
            <div class="bc-breakdown">
              <h4>Project Details</h4>
              ${lineItems.map(li => `
                <div class="bc-breakdown-row"><span>${li.label}</span><span>${li.qty.toLocaleString()} ${li.unit}</span></div>
                <div class="bc-breakdown-row"><span>&nbsp;&nbsp;Cost range</span><span>$${li.min.toLocaleString()} &ndash; $${li.max.toLocaleString()}</span></div>
              `).join('')}
              <div class="bc-breakdown-row"><span>Income Tier</span><span>${tier.label}</span></div>
              <div class="bc-breakdown-row"><span>Total Estimated Cost</span><span>$${totalMin.toLocaleString()} &ndash; $${totalMax.toLocaleString()}</span></div>
            </div>
            <div class="bc-disclaimer">
              <strong>Note:</strong> This is a planning estimate based on typical Maine pricing for basement insulation and crawl space encapsulation. Actual costs depend on site access, existing conditions, moisture levels, and project complexity. Crawl space encapsulation pricing includes vapor barrier, sealed vents, wall insulation, and basic moisture management. A free in-home assessment provides an exact quote with confirmed rebate eligibility.
            </div>
            <div class="bc-cta-group">
              <a href="/contact.html" class="bc-cta-primary">Schedule Your Free Assessment &rarr;</a>
              <a href="/rebate-calculator.html" class="bc-cta-secondary">Try the Full Rebate Calculator</a>
              <div class="bc-cta-phone">Or call <a href="tel:+12077776020">(207) 777-6020</a></div>
            </div>
            <div class="bc-nav" style="margin-top:20px;">
              <button class="bc-btn bc-btn-back" data-action="restart">Start Over</button>
            </div>
          </div>
        </div>
      `;
    }

    /* ── Event Binding ────────────────────────────────────── */
    function bind() {
      // Single-select project type (step 0)
      if (step === 0) {
        root.querySelectorAll('.bc-opt').forEach(opt => {
          opt.addEventListener('click', () => {
            data.projectType = opt.dataset.val;
            // Reset measurements when project type changes
            data.qty = null;
            data.comboParts = [];
            data.comboQty = {};
            render();
          });
        });
      }

      // Combo multi-select (step 1 combo)
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

      // Single qty input (step 1 non-combo)
      const qtyInput = root.querySelector('.bc-qty-input');
      if (qtyInput) {
        qtyInput.addEventListener('input', () => {
          data.qty = qtyInput.value;
          const btn = root.querySelector('[data-action="next"]');
          if (btn) btn.disabled = !data.qty || parseFloat(data.qty) < 10;
        });
        if (step === 1) qtyInput.focus();
      }

      // Combo qty inputs
      root.querySelectorAll('.bc-combo-input').forEach(input => {
        input.addEventListener('input', () => {
          data.comboQty[input.dataset.part] = input.value;
          const btn = root.querySelector('[data-action="next"]');
          if (btn) btn.disabled = !comboReady();
        });
      });

      // Income tier (step 2)
      if (step === 2) {
        root.querySelectorAll('.bc-opt').forEach(opt => {
          opt.addEventListener('click', () => {
            data.incomeTier = opt.dataset.val;
            render();
          });
        });
      }

      // Navigation
      root.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', () => {
          const action = btn.dataset.action;
          if (action === 'next' && canAdvance()) { step++; render(); }
          else if (action === 'back') { step--; render(); }
          else if (action === 'restart') {
            step = 0;
            data.projectType = null;
            data.qty = null;
            data.comboParts = [];
            data.comboQty = {};
            data.incomeTier = null;
            render();
          }
        });
      });
    }

    function canAdvance() {
      switch(step) {
        case 0: return !!data.projectType;
        case 1:
          if (data.projectType === 'combo') return comboReady();
          return data.qty && parseFloat(data.qty) >= 10;
        case 2: return !!data.incomeTier;
        default: return false;
      }
    }

    render();
  });
})();
