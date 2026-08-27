/* =============================================================
   Mattra Inc. — Efficiency Maine rebate rules (single source of truth)

   Every calculator on the site must get its rebate numbers from here.
   Before this existed the same tier table was copy-pasted into five
   files and they drifted.

   TWO PROGRAMS LIVE HERE AND IT SWITCHES ITSELF:

     • OLD  — a percentage of project cost, capped by income tier.
              Applies to work COMPLETED before October 1, 2026.
     • NEW  — a flat amount for each area (zone) insulated, plus a
              separate air-sealing rebate. Applies to work COMPLETED
              on or after October 1, 2026.

   The site flips to NEW on SWITCH_DATE, ahead of the program itself,
   because a lead entering the pipeline now cannot get a job finished
   before Oct 1, so they will be paid under the new rules.

   Moved to Aug 27, 2026 when the copy was promoted early. SWITCH_DATE
   must never lag the copy: if the pages quote the new program while
   this still says Sept 1, every calculator contradicts the page it
   sits on.

   Override the date in any call (`opts.now`) to test either program.
   ============================================================= */

(function (root) {
  'use strict';

  /* When the site starts quoting the new program. */
  var SWITCH_DATE = new Date('2026-08-27T00:00:00-04:00');

  /* ── OLD program: percentage of project cost, capped ─────── */
  var OLD_TIERS = {
    low:      { label: 'Low Income (HEAP/SNAP/TANF)', pct: 0.80, max: 8000 },
    moderate: { label: 'Moderate Income',             pct: 0.60, max: 6000 },
    any:      { label: 'Any Income / Not Sure',       pct: 0.40, max: 4000 }
  };

  /* ── NEW program: flat dollars per area ──────────────────── */
  var NEW_INSULATION = {
    /* attic / wall / basement all pay the same schedule */
    standard: {
      small: { low: 2000, moderate: 1500, any: 1000 },  /* 250–499 sq ft */
      large: { low: 4000, moderate: 3000, any: 2000 }   /* 500+ sq ft    */
    },
    /* a mobile home underbelly replaces the basement zone and pays more */
    underbelly: {
      small: { low: 0, moderate: 0, any: 0 },           /* 500+ sq ft only */
      large: { low: 5000, moderate: 4000, any: 3000 }
    }
  };

  var NEW_AIR_SEALING = {
    attic:    { low: 300, moderate: 225, any: 150 },
    basement: { low: 200, moderate: 150, any: 100 },   /* or underbelly */
    living:   { low: 100, moderate: 75,  any: 50  }
  };

  /* Lifetime totals, per building */
  var NEW_CAPS = { standard: 8600, mobile: 5600 };

  var NEW_TIER_LABELS = {
    low:      'Low Income (HEAP/SNAP/TANF/MaineCare)',
    moderate: 'Moderate Income',
    any:      'Any Income / Not Sure'
  };

  var ZONE_LABELS = {
    attic: 'Attic', wall: 'Wall', basement: 'Basement', underbelly: 'Mobile Home Underbelly'
  };

  /* ── Helpers ─────────────────────────────────────────────── */

  /* Which program applies right now (or at a date you pass in).

     QA affordance: setting `window.MattraRebatesTestDate` to a date string
     makes every calculator on the page answer as if it were that date, so
     the September behaviour can be previewed before September. It does
     nothing unless someone deliberately sets it. */
  function isNewProgram(now) {
    if (now instanceof Date) return now >= SWITCH_DATE;
    if (root.MattraRebatesTestDate) {
      var t = new Date(root.MattraRebatesTestDate);
      if (!isNaN(t)) return t >= SWITCH_DATE;
    }
    return new Date() >= SWITCH_DATE;
  }

  /* The one question that drives the new math: how big is this area?
     Returns 'large' (500+), 'small' (250–499), or 'none' (under 250 —
     which earns NO rebate, the case a simple over/under-500 question
     would silently get wrong). */
  function bandFor(sqft) {
    var n = parseFloat(sqft);
    if (!isFinite(n) || n < 250) return 'none';
    return n >= 500 ? 'large' : 'small';
  }

  function bandLabel(band) {
    return band === 'large' ? '500+ sq ft'
         : band === 'small' ? '250–499 sq ft'
         : 'under 250 sq ft — below the rebate minimum';
  }

  function tierLabels(now) {
    if (!isNewProgram(now)) {
      return { low: OLD_TIERS.low.label, moderate: OLD_TIERS.moderate.label, any: OLD_TIERS.any.label };
    }
    return { low: NEW_TIER_LABELS.low, moderate: NEW_TIER_LABELS.moderate, any: NEW_TIER_LABELS.any };
  }

  /* Short per-tier blurb for the income step of any calculator. */
  function tierBlurb(tier, now) {
    if (!isNewProgram(now)) {
      var t = OLD_TIERS[tier];
      return 'Up to ' + Math.round(t.pct * 100) + '% back, max $' + t.max.toLocaleString();
    }
    var s = NEW_INSULATION.standard.small[tier];
    var l = NEW_INSULATION.standard.large[tier];
    return '$' + s.toLocaleString() + '–$' + l.toLocaleString() + ' per area insulated';
  }

  /* ── The math ────────────────────────────────────────────── */

  /*  compute({
        tier:        'low' | 'moderate' | 'any',
        projectCost: number,                       // used by the OLD program only
        zones:       [ { type:'attic'|'wall'|'basement'|'underbelly',
                         sqft: number }            // or: band:'large'|'small'
                     ],
        airSealing:  ['attic','basement','living'],// optional
        isMobileHome:boolean,                      // sets the $5,600 cap
        now:         Date                          // optional, for testing
      })
      →  { program, rebate, breakdown[], cap, capped, tierLabel, note }
  */
  function compute(opts) {
    opts = opts || {};
    var tier = OLD_TIERS[opts.tier] ? opts.tier : 'any';
    var now  = opts.now;

    if (!isNewProgram(now)) return computeOld(tier, opts);
    return computeNew(tier, opts);
  }

  function computeOld(tier, opts) {
    var t = OLD_TIERS[tier];
    var cost = Math.max(0, parseFloat(opts.projectCost) || 0);
    var raw = Math.round(cost * t.pct);
    var rebate = Math.min(raw, t.max);
    return {
      program: 'old',
      rebate: rebate,
      capped: raw > t.max,
      cap: t.max,
      tierLabel: t.label,
      breakdown: [{
        label: Math.round(t.pct * 100) + '% of project cost',
        amount: rebate
      }],
      note: 'Applies to work completed before October 1, 2026.'
    };
  }

  function computeNew(tier, opts) {
    var zones = Array.isArray(opts.zones) ? opts.zones : [];
    var seen = {};
    var breakdown = [];
    var total = 0;

    zones.forEach(function (z) {
      if (!z || !z.type) return;
      var type = z.type === 'crawlspace' ? 'basement' : z.type;
      if (opts.isMobileHome && type === 'basement') type = 'underbelly';
      /* one insulation rebate per zone, per building — never pay twice */
      if (seen[type]) return;

      var band = z.band || bandFor(z.sqft);
      if (band === 'none') {
        breakdown.push({ label: ZONE_LABELS[type] + ' — under 250 sq ft, no rebate', amount: 0 });
        seen[type] = true;
        return;
      }
      var table = (type === 'underbelly' ? NEW_INSULATION.underbelly : NEW_INSULATION.standard);
      var amt = (table[band] || {})[tier] || 0;
      seen[type] = true;
      total += amt;
      breakdown.push({
        label: ZONE_LABELS[type] + ' insulation (' + bandLabel(band) + ')',
        amount: amt
      });
    });

    /* air sealing — its own rebate, one per area */
    var air = Array.isArray(opts.airSealing) ? opts.airSealing : [];
    var seenAir = {};
    air.forEach(function (a) {
      var key = (a === 'underbelly') ? 'basement' : a;
      if (!NEW_AIR_SEALING[key] || seenAir[key]) return;
      seenAir[key] = true;
      var amt = NEW_AIR_SEALING[key][tier] || 0;
      total += amt;
      breakdown.push({
        label: (key === 'living' ? 'Living space' : ZONE_LABELS[key === 'basement' && opts.isMobileHome ? 'underbelly' : key]) + ' air sealing',
        amount: amt
      });
    });

    var cap = opts.isMobileHome ? NEW_CAPS.mobile : NEW_CAPS.standard;
    var capped = total > cap;
    var rebate = Math.min(total, cap);

    /* A rebate never exceeds what the job actually costs. Without this a
       small job can show a rebate larger than the price and imply the
       homeowner gets paid to do the work. */
    var cost = parseFloat(opts.projectCost);
    var limitedByCost = false;
    if (isFinite(cost) && cost > 0 && rebate > cost) {
      rebate = Math.round(cost);
      limitedByCost = true;
    }

    return {
      program: 'new',
      rebate: rebate,
      capped: capped,
      limitedByCost: limitedByCost,
      cap: cap,
      tierLabel: NEW_TIER_LABELS[tier],
      breakdown: breakdown,
      note: 'Applies to work completed on or after October 1, 2026.' +
            (capped ? ' Capped at the $' + cap.toLocaleString() + ' lifetime maximum.' : '') +
            (limitedByCost ? ' Limited to the cost of the work.' : '')
    };
  }

  root.MattraRebates = {
    SWITCH_DATE: SWITCH_DATE,
    isNewProgram: isNewProgram,
    bandFor: bandFor,
    bandLabel: bandLabel,
    tierLabels: tierLabels,
    tierBlurb: tierBlurb,
    compute: compute,
    OLD_TIERS: OLD_TIERS,
    NEW_INSULATION: NEW_INSULATION,
    NEW_AIR_SEALING: NEW_AIR_SEALING,
    NEW_CAPS: NEW_CAPS,
    ZONE_LABELS: ZONE_LABELS
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = root.MattraRebates;

})(typeof window !== 'undefined' ? window : globalThis);
