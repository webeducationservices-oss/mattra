# Efficiency Maine Rebate Change — Staged Site Changes (Go Live Sept 1, 2026)

**Internal working document. Not published to the website.**
Owner: Justin Babcock / Web Education Services · Client: Mattra Inc. · Created 2026-08-06

---

## Why Sept 1 for an Oct 1 program change

Efficiency Maine's new insulation rebate structure applies to **work completed on or
after October 1, 2026**. A homeowner who first contacts Mattra in September cannot
realistically get an assessment, a quote, a scheduled crew, and a finished job before
Oct 1 — so **every lead entering the pipeline in September will be paid under the new
rules.** Showing them the old percentage math through September would quote numbers
they can never receive.

So the site flips to the new rules on **Sept 1**, one month ahead of the program, while
a clearly-labeled note preserves the old figures for the in-flight jobs that will
genuinely finish in September under the old program.

---

## Rollout in two phases

| Phase | Date | State | What |
|---|---|---|---|
| **1 — Notice** | **LIVE now (2026-08-06)** | on `main`, in production | Heads-up notice bar on rebate pages + the public explainer page |
| **2 — Rewrite** | **Sept 1, 2026** | staged on branch `rebates-oct-2026` | New rules become the primary copy sitewide |

**Staging site for client review:** https://mattra-rebates-preview.vercel.app
(auto-`noindex`ed by Vercel; rebuilds on every push to the branch)

---

## What is already LIVE (Phase 1, shipped 2026-08-06)

1. **New page** `/efficiency-maine-rebate-changes-2026` — old-vs-new comparison, the
   full new rebate + air-sealing tables, zone definitions, income tiers with the new AGI
   thresholds, lifetime caps, and which rules apply based on **completion date**.
   Carries FAQPage + BreadcrumbList schema. Added to `sitemap.xml`.
2. **Notice bar** injected by `components.js` on rebate-related pages, linking to that
   page. Implemented once in the shared component rather than editing 30+ files.
   **It auto-expires on 2026-10-01** (`REBATE_NOTICE_UNTIL`) and is suppressed on the
   changes page itself.

---

## What is STAGED for Sept 1 (branch `rebates-oct-2026`)

### The program change being reflected

| | Through Sept 30, 2026 | From Oct 1, 2026 |
|---|---|---|
| Basis | % of project cost | **Flat amount per area (zone)** |
| Any income | 40%, max $4,000 | **$1,000** (250–499 sq ft) / **$2,000** (500+) per area |
| Moderate | 60%, max $6,000 | **$1,500 / $3,000** per area |
| Low | 80%, max $8,000 | **$2,000 / $4,000** per area |
| Mobile home underbelly | (no separate tier) | **$3,000 / $4,000 / $5,000** (500+ sq ft) |
| Air sealing | bundled/vague; a fictitious "$500" on one page | **Its own rebate** — attic $150–$300, basement/underbelly $100–$200, living space $50–$100 |
| Lifetime cap | effectively the tier cap | **$8,600 per home; $5,600 per mobile home**, one insulation + one air-sealing rebate per area |
| Moderate income test | "Area Median Income" (wrong) | **AGI ≤ $70,000 individual / ≤ $100,000 joint** |

### Files changed on the branch

**Core rebate pages** — note `financing-rebates.html`, `rebates.html`, `financing.html`
and `income-based-eligibility-verification.html` are **byte-identical duplicates** of one
page (all canonical to `/financing-rebates`). Edited once, mirrored to all four.
- Hero eyebrow, H1, subtitle, worked example, tier cards, eligibility copy, calculator
  promo, meta + OG + Service schema, and **both** copies of every FAQ answer (JSON-LD
  *and* the visible accordion — they duplicate each other and would otherwise disagree).
- Worked example re-derived: a $10,000 attic + air-sealing job (large attic zone) now
  shows $2,150 / $3,225 / $4,300 back and $7,850 / $6,775 / $5,700 remaining, with
  monthly figures rescaled at the same rate the page already used.
- **Added a labeled "Already have a project underway?" note** preserving the old
  percentages for work completed before Oct 1, per the accuracy decision.

**`efficiency-maine.html`** — `$8,000` removed from the `<title>` and `<h1>` (highest SEO
exposure on the site). The **fictitious flat "$500 air sealing rebate / $8,500 total"**
— which does not exist in either program — replaced with the real tiered amounts.

**`insulation.html`, `efficiency-maine-rebates.html`, `rebate-calculator.html`,
`resources.html`, `thank-you.html`** — tier tables, FAQ (schema + visible), meta/OG.

**`air-sealing.html` + `insulation/air-sealing.html`** (also byte-identical duplicates) —
these stated the **opposite of the new rule**: that air sealing only qualifies "when
combined with insulation." Under the new program air sealing is **standalone-rebatable**.
This was in the FAQ schema too, so Google could serve the wrong answer.

**Liability-grade claims removed:**
- `how-much-does-it-cost-to-insulate-a-mobile-home.html` — "all mobile homeowners are
  **guaranteed** a minimum of a 40% rebate, with many qualifying for 80% to **100%**",
  the "save 40-100%" CTA, and the **wrong $8,000 cap** (a mobile home's cap is $5,600).
  This page also never mentioned the underbelly rebate, which is now the single most
  valuable line item available to that exact audience (up to $5,000).
- `september-in-maine-…` — "You are **entitled to at least $4,000** in rebates." An
  entitlement claim with a dollar floor, on a page that resurfaces seasonally in exactly
  the Sept–Oct window when it is most wrong.
- `save-big-on-insulation-in-maine-get-100-rebates.html` — "100% Rebates" appeared in the
  title, meta, H1, body and CTA. Rewritten, plus **every internal link elsewhere on the
  site that repeated the "100% Rebates" label**.
- Four more posts with "40–80%" / "up to 100%" claims: `5-summer-preparation-tips`,
  `spring-maintenance-…`, `top-3-home-insulations-…`, `the-future-of-home-sealing-…`,
  `choosing-the-right-contractor`, `efficiency-maine-what-home-improvements-…`,
  `learn-how-proper-insulation-…`, `act-fast-maine-rebates-…`,
  `before-you-pay-for-mold-remediation-in-maine`.

**`llms.txt`** — updated so AI assistants stop quoting "$8,000".

**Verification:** a sitewide scan confirms **zero old-program rebate claims remain** on
the branch. The NEIF/Green Bank financing line "up to 100% of project financed" is a
*separate program* and was deliberately left untouched.

---

## ⚠️ Remaining work before the Sept 1 merge

### 1. The rebate calculators — ✅ DONE (2026-08-06)

**`rebate-rules.js`** is now the single source of truth, holding *both* programs and
switching itself on **Sept 1**. It ships safely today because it quotes today's numbers
now and flips on its own — no dependency on the branch merge.

It models what the old code could not: three size bands (**an area under 250 sq ft earns
nothing**), air sealing as its own rebate, one-rebate-per-area, mobile-home underbelly
substitution, the $8,600 / $5,600 caps, and a clamp so a rebate never exceeds the cost
of the work.

- **`cost-estimator.js`** (attic, spray-foam, basement) derives the band from square
  footage it already collects — no new question needed.
- **`rebate-calculator.js`** collected no square footage, so it gained the required
  question *"How much area are you insulating?"* (500+ / 250–499 / Under 250), asked once
  per implied insulation zone, plus a mobile-home toggle. The step only appears under the
  new program, so the flow stays short until it needs to be longer.
- **Consolidated:** `attic-insulation-calculator.js`, `spray-foam-calculator.js` and
  `basement-crawlspace-calculator.js` are retired (they were byte-level clones of blocks
  inside `cost-estimator.js`); their four pages now mount `.cost-estimator` with the right
  `data-type`. **Rebate percentages and caps that lived in five files now live in one.**
- **Verified in-browser**, identical inputs (low income, attic + walls + air sealing,
  500+ each): August → **$8,000** (80% of $11,400, capped, labeled as capped);
  September → **$8,300** (attic $4,000 + wall $4,000 + attic air sealing $300).
- **QA affordance:** `window.MattraRebatesTestDate = '2026-09-15'` in the console previews
  September behaviour on any page today.

**⚠️ Judgment call still open for Mattra:** rim joist is measured in *linear* feet, so it
cannot be banded against a sq-ft threshold. It is currently mapped to **basement air
sealing ($100–$200)** rather than the Basement insulation zone ($1,000–$4,000). If
Efficiency Maine treats rim-joist foam as basement insulation in practice, change the
mapping — it is worth real money on those jobs.

### 2. The infographic

`/Images/blog/rebate-tiers-infographic.webp` on
`before-you-pay-for-mold-remediation-in-maine.html` is **baked artwork showing the old
percentage tiers**. The alt text is fixed; the image itself must be regenerated or
removed. This is the only fix that is not a copy edit.

### 3. Blog post + Ads (agreed scope, not yet done)
- A post announcing the change (targets "efficiency maine rebate changes 2026").
- **Google Ads:** the `Insulation – Efficiency Maine` campaign is live and its copy and
  landing pages reference the current program. Ad copy must be updated for Oct 1 or the
  ads will promise the wrong rebate. (`mold-search-ad` is unaffected.)

---

## Sept 1 is automated — nothing to remember

Two scheduled GitHub Actions handle the flip. They live on `main` (GitHub only
schedules from the default branch) and run on GitHub's infrastructure, so they fire
whether or not anyone is at a laptop.

| Workflow | Fires | Does |
|---|---|---|
| `rebate-flip-reminder.yml` | **Aug 27, 9am ET** | Opens a checklist issue for the two things automation can't do (calculator rebuild, infographic) |
| `rebate-flip-promote.yml` | **Sept 1, 5am ET** | Rebases the branch onto current `main`, re-runs the stale-figure guard, merges, pushes |

The promote workflow commits as `webeducationservices@gmail.com` so Vercel doesn't
reject the deploy with `COMMIT_AUTHOR_REQUIRED`. **On failure it opens an "ACTION
NEEDED" issue** with the manual fix — the realistic failure is a rebase conflict caused
by a client MyAIEditor edit during August. On success it opens a short follow-up
checklist. It can also be run by hand from the Actions tab, including a **dry-run**
option.

**Verified 2026-08-06:** a dry run completed successfully — rebase clean, guard passed,
merge correctly skipped, `main` and production untouched.

To go live early, run **Promote Efficiency Maine rebate copy** from the Actions tab.

---

## Manual fallback checklist (only if the automation fails)

1. `git checkout rebates-oct-2026 && git fetch && git rebase origin/main`
   — **required**: the client edits pages through MyAIEditor, which commits straight to
   `main`, so rebase absorbs anything they changed during August.
2. Re-run the stale-figure scan; confirm still zero.
3. Confirm the calculator rebuild and infographic are done (see above).
4. Merge to `main`, push, verify production.
5. Revert the Vercel **ignore-build** command to its original value (it was widened to
   let this branch build a preview):
   ```
   if [ "$VERCEL_GIT_COMMIT_REF" = "main" ]; then exit 1; fi; if echo "$VERCEL_GIT_COMMIT_MESSAGE" | grep -q "Preview ready"; then exit 1; fi; exit 0;
   ```
6. Leave the Phase-1 notice bar in place — it **self-expires on Oct 1**. After Oct 1,
   delete the `rebateNotice()` block and `REBATE_NOTICE_PAGES` from `components.js`, and
   drop the "Already have a project underway?" note from the rebate pages.

---

## Positioning used in the copy

Two pillars, per the agreed angle:

1. **Multi-zone is the win.** Because every area earns its own rebate, a whole-home job
   (attic + wall + basement) collects three separate rebates instead of one capped
   percentage. At the top end the new program pays **more** than the old one — $8,600 vs
   $8,000 (low), $8,600 vs $6,000 (moderate), $6,300 vs $4,000 (any income). This also
   matches Mattra's existing "one connected system, one team" brand.
2. **It is simpler.** Flat amounts mean a homeowner knows their exact rebate **before**
   work starts — no percentage math, no waiting on a quote.

**Honest caveat kept in mind while writing:** the new program pays *less* on an expensive
single-zone job (a $10,000 attic used to earn 40%/$4,000; now it's a flat $2,000). The
copy therefore leads with multi-zone rather than claiming the new program is better in
every case.
