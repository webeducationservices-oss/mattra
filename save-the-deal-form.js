/* =============================================================
   Mattra Inc. — Real Estate "Save The Deal" Priority Form
   Usage: <div class="save-deal-form"></div>
         <script src="/save-the-deal-form.js"></script>

   A high-urgency multi-step form for real estate agents who need
   fast support when mold, inspection, or repair issues threaten
   a transaction.
   ============================================================= */

(function () {

  /* ── Capture load time for bot detection ── */
  const loadTs = String(Date.now());

  /* ── Load reCAPTCHA v3 automatically ── */
  const RC_SITE_KEY = '6Lck8aQsAAAAAlMA-T6nwfkSf7bv4K-mOhkszeKh';
  if (!document.querySelector('script[src*="recaptcha"]')) {
    const s = document.createElement('script');
    s.src = 'https://www.google.com/recaptcha/api.js?render=' + RC_SITE_KEY;
    s.async = true;
    document.head.appendChild(s);
  }

  /* ── Inject CSS ── */
  const style = document.createElement('style');
  style.textContent = `
    /* ===== SAVE THE DEAL FORM ===== */
    .std-card {
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 2px 16px rgba(0,0,0,.08);
      padding: 36px 32px;
      max-width: 520px;
      margin: 0 auto;
      font-family: 'Montserrat', sans-serif;
    }
    .std-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #fef3cd;
      color: #856404;
      font-size: .75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .05em;
      padding: 5px 12px;
      border-radius: 20px;
      margin-bottom: 16px;
    }
    .std-badge svg { flex-shrink: 0; }
    .std-title {
      font-family: 'DM Serif Display', serif;
      font-size: 1.35rem;
      color: #1e3a28;
      margin: 0 0 8px;
      line-height: 1.3;
    }
    .std-subtitle {
      font-size: .9rem;
      color: #6b7b71;
      margin: 0 0 24px;
      line-height: 1.5;
    }

    /* Progress */
    .std-progress {
      display: flex;
      gap: 6px;
      margin-bottom: 24px;
    }
    .std-progress-bar {
      flex: 1;
      height: 4px;
      border-radius: 2px;
      background: #e8ece9;
      transition: background .3s;
    }
    .std-progress-bar.filled {
      background: #316b43;
    }

    /* Steps */
    .std-step { display: none; }
    .std-step.active { display: block; }

    /* Option buttons */
    .std-options {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .std-opt {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 14px 16px;
      border: 2px solid #e0e6e2;
      border-radius: 10px;
      background: #fff;
      cursor: pointer;
      transition: border-color .2s, background .2s;
      text-align: left;
      font-family: inherit;
      font-size: .92rem;
      color: #1e3a28;
      line-height: 1.4;
    }
    .std-opt:hover {
      border-color: #316b43;
      background: #f4f8f5;
    }
    .std-opt.selected {
      border-color: #316b43;
      background: #eef5f0;
    }
    .std-opt-icon {
      font-size: 1.3rem;
      flex-shrink: 0;
      width: 32px;
      text-align: center;
    }
    .std-opt-label {
      font-weight: 600;
    }
    .std-opt-desc {
      display: block;
      font-size: .8rem;
      font-weight: 400;
      color: #6b7b71;
      margin-top: 2px;
    }

    /* Form fields */
    .std-field {
      margin-bottom: 16px;
    }
    .std-field label {
      display: block;
      font-size: .85rem;
      font-weight: 600;
      color: #1e3a28;
      margin-bottom: 6px;
    }
    .std-field input,
    .std-field select,
    .std-field textarea {
      width: 100%;
      padding: 12px 14px;
      border: 2px solid #e0e6e2;
      border-radius: 8px;
      font-family: inherit;
      font-size: .92rem;
      color: #1e3a28;
      background: #fff;
      transition: border-color .2s;
      box-sizing: border-box;
    }
    .std-field input:focus,
    .std-field select:focus,
    .std-field textarea:focus {
      outline: none;
      border-color: #316b43;
    }
    .std-field textarea {
      resize: vertical;
      min-height: 90px;
    }
    .std-field-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    @media (max-width: 480px) {
      .std-field-row { grid-template-columns: 1fr; }
    }
    .std-field .std-hint {
      font-size: .78rem;
      color: #8a9a90;
      margin-top: 4px;
    }

    /* Urgency selector */
    .std-urgency {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 8px;
    }
    .std-urgency-btn {
      padding: 10px 8px;
      border: 2px solid #e0e6e2;
      border-radius: 8px;
      background: #fff;
      cursor: pointer;
      text-align: center;
      font-family: inherit;
      font-size: .82rem;
      font-weight: 600;
      color: #1e3a28;
      transition: border-color .2s, background .2s;
    }
    .std-urgency-btn:hover { border-color: #316b43; }
    .std-urgency-btn.selected { border-color: #316b43; background: #eef5f0; }
    .std-urgency-btn .std-urg-icon { font-size: 1.2rem; display: block; margin-bottom: 4px; }

    /* Navigation */
    .std-nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 24px;
    }
    .std-btn-back {
      background: none;
      border: none;
      color: #6b7b71;
      font-family: inherit;
      font-size: .9rem;
      cursor: pointer;
      padding: 8px 0;
    }
    .std-btn-back:hover { color: #316b43; }
    .std-btn-next {
      padding: 12px 28px;
      background: #316b43;
      color: #fff;
      border: none;
      border-radius: 8px;
      font-family: inherit;
      font-size: .95rem;
      font-weight: 600;
      cursor: pointer;
      transition: background .2s, opacity .2s;
    }
    .std-btn-next:hover { background: #275536; }
    .std-btn-next:disabled { opacity: .45; cursor: not-allowed; }
    .std-btn-submit {
      width: 100%;
      padding: 14px 28px;
      background: #c8922a;
      color: #fff;
      border: none;
      border-radius: 8px;
      font-family: inherit;
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
      transition: background .2s;
      margin-top: 20px;
    }
    .std-btn-submit:hover { background: #b07f22; }
    .std-btn-submit:disabled { opacity: .5; cursor: not-allowed; }

    /* Trust line */
    .std-trust {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 16px;
      font-size: .78rem;
      color: #8a9a90;
    }
    .std-trust svg { flex-shrink: 0; }

    /* Success state */
    .std-success {
      text-align: center;
      padding: 24px 0;
    }
    .std-success-icon {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: #eef5f0;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
    }
    .std-success h3 {
      font-family: 'DM Serif Display', serif;
      font-size: 1.3rem;
      color: #1e3a28;
      margin: 0 0 12px;
    }
    .std-success p {
      font-size: .9rem;
      color: #6b7b71;
      line-height: 1.6;
      margin: 0 0 8px;
    }
    .std-success-highlight {
      background: #f4f8f5;
      border-radius: 8px;
      padding: 16px;
      margin: 16px 0;
      font-size: .85rem;
      color: #1e3a28;
      line-height: 1.6;
    }
    .std-success-highlight strong { color: #316b43; }

    /* SMS Compliance */
    .std-sms-consent {
      font-size: .72rem;
      color: #8a9a90;
      line-height: 1.5;
      margin-top: 12px;
    }
    .std-sms-consent a { color: #316b43; }
  `;
  document.head.appendChild(style);

  /* ── Form Data ── */
  const formData = {
    issue_types: [],
    urgency: '',
    agent_name: '',
    agent_phone: '',
    agent_email: '',
    brokerage: '',
    property_address: '',
    closing_date: '',
    details: '',
    preferred_contact: 'phone'
  };

  /* ── HTML ── */
  const containers = document.querySelectorAll('.save-deal-form');
  if (!containers.length) return;

  containers.forEach(container => {
    container.innerHTML = `
    <div class="std-card">
      <div class="std-badge">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
        Priority Response
      </div>
      <div class="std-progress">
        <div class="std-progress-bar filled"></div>
        <div class="std-progress-bar"></div>
        <div class="std-progress-bar"></div>
        <div class="std-progress-bar"></div>
      </div>

      <!-- STEP 1: What's happening? -->
      <div class="std-step active" data-step="1">
        <h3 class="std-title">What's threatening the deal?</h3>
        <p class="std-subtitle">Select all that apply. We've handled hundreds of these situations and can move fast.</p>
        <div class="std-options" data-field="issue_type">
          <button class="std-opt" data-value="mold_inspection">
            <span class="std-opt-icon">&#x1F50D;</span>
            <span><span class="std-opt-label">Mold found during inspection</span>
            <span class="std-opt-desc">Buyer's inspection flagged mold &mdash; need fast clarity</span></span>
          </button>
          <button class="std-opt" data-value="mold_visible">
            <span class="std-opt-icon">&#x26A0;&#xFE0F;</span>
            <span><span class="std-opt-label">Visible mold or musty odor</span>
            <span class="std-opt-desc">Seller or buyer noticed mold before or during showing</span></span>
          </button>
          <button class="std-opt" data-value="estimate_needed">
            <span class="std-opt-icon">&#x1F4B0;</span>
            <span><span class="std-opt-label">Need a fast remediation estimate</span>
            <span class="std-opt-desc">Numbers needed before contingency deadline</span></span>
          </button>
          <button class="std-opt" data-value="repair_issue">
            <span class="std-opt-icon">&#x1F527;</span>
            <span><span class="std-opt-label">Repair or structural concern</span>
            <span class="std-opt-desc">Inspection findings affecting negotiations</span></span>
          </button>
          <button class="std-opt" data-value="testing_needed">
            <span class="std-opt-icon">&#x1F9EA;</span>
            <span><span class="std-opt-label">Testing or clearance needed</span>
            <span class="std-opt-desc">Air quality testing, post-remediation clearance</span></span>
          </button>
          <button class="std-opt" data-value="other">
            <span class="std-opt-icon">&#x1F4AC;</span>
            <span><span class="std-opt-label">Other transaction issue</span>
            <span class="std-opt-desc">Something else is putting the deal at risk</span></span>
          </button>
        </div>
        <div class="std-nav">
          <span></span>
          <button class="std-btn-next" disabled>Continue &rarr;</button>
        </div>
      </div>

      <!-- STEP 2: How urgent? -->
      <div class="std-step" data-step="2">
        <h3 class="std-title">How urgent is the timeline?</h3>
        <p class="std-subtitle">We prioritize based on your closing timeline. Every situation gets a fast response.</p>
        <div class="std-urgency" data-field="urgency">
          <button class="std-urgency-btn" data-value="critical">
            <span class="std-urg-icon">&#x1F6A8;</span>
            Closing in<br><strong>1&ndash;3 days</strong>
          </button>
          <button class="std-urgency-btn" data-value="urgent">
            <span class="std-urg-icon">&#x23F1;&#xFE0F;</span>
            Closing in<br><strong>1&ndash;2 weeks</strong>
          </button>
          <button class="std-urgency-btn" data-value="planning">
            <span class="std-urg-icon">&#x1F4C5;</span>
            Closing in<br><strong>2+ weeks</strong>
          </button>
        </div>
        <div class="std-nav">
          <button class="std-btn-back">&larr; Back</button>
          <button class="std-btn-next" disabled>Continue &rarr;</button>
        </div>
      </div>

      <!-- STEP 3: Property & Details -->
      <div class="std-step" data-step="3">
        <h3 class="std-title">Tell us about the property</h3>
        <p class="std-subtitle">The more we know upfront, the faster we can respond with next steps.</p>
        <div class="std-field">
          <label for="std-address">Property address</label>
          <input type="text" id="std-address" placeholder="123 Main St, Portland, ME" />
        </div>
        <div class="std-field">
          <label for="std-closing">Closing date (if known)</label>
          <input type="date" id="std-closing" />
        </div>
        <div class="std-field">
          <label for="std-details">What's going on? Give us the quick version.</label>
          <textarea id="std-details" placeholder="E.g., Buyer's inspection found mold in the basement. Seller needs remediation estimate before Wednesday contingency deadline..."></textarea>
          <p class="std-hint">Include what was found, where, and any deadlines we should know about.</p>
        </div>
        <div class="std-nav">
          <button class="std-btn-back">&larr; Back</button>
          <button class="std-btn-next">Continue &rarr;</button>
        </div>
      </div>

      <!-- STEP 4: Your Info -->
      <div class="std-step" data-step="4">
        <h3 class="std-title">Your contact info</h3>
        <p class="std-subtitle">We'll reach out within hours &mdash; often within minutes for critical timelines.</p>
        <div class="std-field-row">
          <div class="std-field">
            <label for="std-name">Your name *</label>
            <input type="text" id="std-name" placeholder="Jane Smith" required />
          </div>
          <div class="std-field">
            <label for="std-brokerage">Brokerage</label>
            <input type="text" id="std-brokerage" placeholder="ABC Realty" />
          </div>
        </div>
        <div class="std-field-row">
          <div class="std-field">
            <label for="std-phone">Phone *</label>
            <input type="tel" id="std-phone" placeholder="(207) 555-0123" required />
          </div>
          <div class="std-field">
            <label for="std-email">Email</label>
            <input type="email" id="std-email" placeholder="jane@abcrealty.com" />
          </div>
        </div>
        <div class="std-field">
          <label>Preferred contact method</label>
          <div class="std-field-row" style="margin-top:6px;">
            <label style="display:flex;align-items:center;gap:8px;font-weight:400;cursor:pointer;">
              <input type="radio" name="std-contact-pref" value="phone" checked style="width:auto;padding:0;" /> Phone call
            </label>
            <label style="display:flex;align-items:center;gap:8px;font-weight:400;cursor:pointer;">
              <input type="radio" name="std-contact-pref" value="text" style="width:auto;padding:0;" /> Text message
            </label>
          </div>
        </div>
        <input type="text" name="_honey" style="display:none;" tabindex="-1" autocomplete="off" />
        <button class="std-btn-submit" id="std-submit">Send Priority Request &rarr;</button>
        <div class="std-trust">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          We respond to priority requests within hours &mdash; often faster for critical timelines.
        </div>
        <p class="std-sms-consent">
          By submitting, you agree to receive communication from Mattra Inc. regarding your inquiry.
          Message frequency varies. Msg &amp; data rates may apply. Reply STOP to opt out, HELP for help.
          <a href="/privacy-policy.html">Privacy Policy</a> &middot; <a href="/terms.html">Terms</a>
        </p>
        <div class="std-nav">
          <button class="std-btn-back">&larr; Back</button>
          <span></span>
        </div>
      </div>

      <!-- SUCCESS -->
      <div class="std-step" data-step="success">
        <div class="std-success">
          <div class="std-success-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#316b43" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h3>We're on it.</h3>
          <p>Your priority request has been received. Our team is reviewing the details now.</p>
          <div class="std-success-highlight">
            <strong>What happens next:</strong><br>
            A Mattra team member will reach out by your preferred method &mdash; usually within hours. For critical timelines, we often respond within minutes.<br><br>
            If you need to reach us immediately:<br>
            <strong><a href="tel:+12077776020" style="color:#316b43;">(207) 777-6020</a></strong>
          </div>
          <p style="font-style:italic;font-size:.85rem;">We've helped hundreds of agents navigate deal-threatening situations. We'll get you sorted out.</p>
        </div>
      </div>
    </div>
    `;

    /* ── Logic ── */
    const card = container.querySelector('.std-card');
    const steps = card.querySelectorAll('.std-step');
    const bars = card.querySelectorAll('.std-progress-bar');
    let current = 1;

    function showStep(n) {
      steps.forEach(s => s.classList.remove('active'));
      const target = n === 'success' ? card.querySelector('[data-step="success"]') : card.querySelector('[data-step="' + n + '"]');
      if (target) target.classList.add('active');
      // Update progress
      const stepNum = n === 'success' ? 5 : n;
      bars.forEach((b, i) => b.classList.toggle('filled', i < stepNum));
      current = n;
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Option selection (step 1 — multi-select)
    card.querySelectorAll('.std-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.classList.toggle('selected');
        const val = btn.dataset.value;
        const idx = formData.issue_types.indexOf(val);
        if (idx > -1) { formData.issue_types.splice(idx, 1); }
        else { formData.issue_types.push(val); }
        const nav = btn.closest('.std-step').querySelector('.std-btn-next');
        if (nav) nav.disabled = formData.issue_types.length === 0;
      });
    });

    card.querySelectorAll('.std-urgency-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        card.querySelectorAll('.std-urgency-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        formData.urgency = btn.dataset.value;
        const nav = btn.closest('.std-step').querySelector('.std-btn-next');
        if (nav) nav.disabled = false;
      });
    });

    // Navigation
    card.querySelectorAll('.std-btn-next').forEach(btn => {
      btn.addEventListener('click', () => {
        if (current === 3) {
          // Collect step 3 data
          formData.property_address = card.querySelector('#std-address').value;
          formData.closing_date = card.querySelector('#std-closing').value;
          formData.details = card.querySelector('#std-details').value;
        }
        showStep(current + 1);
      });
    });

    card.querySelectorAll('.std-btn-back').forEach(btn => {
      btn.addEventListener('click', () => {
        if (current > 1) showStep(current - 1);
      });
    });

    // Submit
    const submitBtn = card.querySelector('#std-submit');
    submitBtn.addEventListener('click', async () => {
      // Collect step 4 data
      formData.agent_name = card.querySelector('#std-name').value.trim();
      formData.agent_phone = card.querySelector('#std-phone').value.trim();
      formData.agent_email = card.querySelector('#std-email').value.trim();
      formData.brokerage = card.querySelector('#std-brokerage').value.trim();
      formData.preferred_contact = card.querySelector('input[name="std-contact-pref"]:checked').value;
      const honey = card.querySelector('input[name="_honey"]').value;

      // Validation
      if (!formData.agent_name || !formData.agent_phone) {
        alert('Please provide your name and phone number.');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';

      const urgencyLabels = {
        critical: 'CRITICAL — Closing in 1-3 days',
        urgent: 'Urgent — Closing in 1-2 weeks',
        planning: 'Planning — Closing in 2+ weeks'
      };
      const issueLabels = {
        mold_inspection: 'Mold found during inspection',
        mold_visible: 'Visible mold or musty odor',
        estimate_needed: 'Need fast remediation estimate',
        repair_issue: 'Repair or structural concern',
        testing_needed: 'Testing or clearance needed',
        other: 'Other transaction issue'
      };

      // Get reCAPTCHA token
      let rcToken = '';
      if (typeof grecaptcha !== 'undefined' && typeof grecaptcha.execute === 'function') {
        try { rcToken = await grecaptcha.execute(RC_SITE_KEY, { action: 'save_the_deal' }); }
        catch (e) { console.warn('reCAPTCHA failed:', e); }
      }

      try {
        const res = await fetch('https://myaieditor.com/api/form-notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            site_slug: 'mattra',
            form_type: 'save-the-deal',
            _honey: honey,
            _ts: loadTs,
            recaptcha_token: rcToken,
            agent_name: formData.agent_name,
            agent_phone: formData.agent_phone,
            agent_email: formData.agent_email,
            brokerage: formData.brokerage,
            preferred_contact: formData.preferred_contact,
            issue_type: formData.issue_types.map(v => issueLabels[v] || v).join(', '),
            urgency: urgencyLabels[formData.urgency] || formData.urgency,
            property_address: formData.property_address,
            closing_date: formData.closing_date,
            details: formData.details
          })
        });
        showStep('success');
      } catch (err) {
        showStep('success');
      }
    });
  });

})();
