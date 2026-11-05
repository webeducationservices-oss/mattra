#!/usr/bin/env python3
"""Publish scheduled blog posts whose date has arrived.

Run daily by .github/workflows/publish-scheduled-posts.yml (and by hand with
`python3 _scheduled/publish_scheduled.py --date YYYY-MM-DD --dry-run`).

A scheduled post lives in _scheduled/<slug>.html and carries:

  <meta name="publish-date" content="YYYY-MM-DD">        when it goes live (Eastern date)
  <meta name="robots" content="noindex" data-scheduled>   keeps the myaieditor sitemap
                                                          cron from listing the draft
  __PUBLISH_DATE_ISO__ / __PUBLISH_DATE_LONG__            filled in with the real date

_scheduled/ is in .vercelignore, so drafts are never served.

Publishing a post:
  1. moves it to <slug>.html at the repo root and strips the scheduling bits
  2. adds its card to blog.html (newest first) and bumps the topic counts
  3. adds its URL to sitemap.xml
  4. activates every link that was waiting for it, sitewide:
       <!--SCHED:slug-->anchor text<!--/SCHED-->      plain text until the post is live,
                                                      then <a href="/slug/">anchor text</a>
       <!--SCHED-BLOCK:slug ...html... /SCHED-BLOCK-->  hidden until the post is live
     These markers are how the cluster links to posts that do not exist yet
     without ever pointing at a 404.
"""
import argparse, datetime, glob, html, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCHED = os.path.join(ROOT, "_scheduled")
SITE = "https://www.mattrainc.com"


def eastern_today():
    try:
        from zoneinfo import ZoneInfo
        return datetime.datetime.now(ZoneInfo("America/New_York")).date()
    except Exception:
        return datetime.datetime.utcnow().date()


def read(p):
    with open(p, encoding="utf-8") as f:
        return f.read()


def write(p, s, dry):
    if not dry:
        with open(p, "w", encoding="utf-8") as f:
            f.write(s)


def one(pattern, s, what, flags=re.S):
    m = re.search(pattern, s, flags)
    if not m:
        raise SystemExit(f"::error::could not find {what}")
    return m.group(1).strip()


def card_html(slug, title, cat, alt, short_date):
    cat_e = html.escape(html.unescape(cat), quote=True)
    return (
        f'      <a class="post-card" href="/{slug}/" data-cat="{cat_e}">\n'
        f'        <div class="post-card-thumb">\n'
        f'          <img src="/Images/blog/{slug}.webp"\n'
        f'               alt="{alt}" loading="lazy" width="1200" height="675" />\n'
        f'        </div>\n'
        f'        <div class="post-card-body">\n'
        f'          <div class="post-card-cat">{cat_e}</div>\n'
        f'          <div class="post-card-title">{title}</div>\n'
        f'          <div class="post-card-meta">{short_date}</div>\n'
        f'        </div>\n'
        f'      </a>\n\n'
    )


def bump_count(blog, data_filter, label):
    """Increment a sidebar topic count, adding the topic if it is missing."""
    li = re.compile(r'(<li><a href="#" data-filter="' + re.escape(data_filter) +
                    r'"[^>]*>[^<]*</a>\s*<span class="category-count">)(\d+)(</span></li>)')
    if li.search(blog):
        return li.sub(lambda m: m.group(1) + str(int(m.group(2)) + 1) + m.group(3), blog, count=1)
    new = (f'          <li><a href="#" data-filter="{data_filter}">{label}</a> '
           f'<span class="category-count">1</span></li>\n')
    return re.sub(r'(<ul class="category-list" id="blogCategories">.*?)(\s*</ul>)',
                  lambda m: m.group(1) + "\n" + new.rstrip("\n") + m.group(2), blog, count=1, flags=re.S)


def activate(slug, dry):
    """Turn every marker waiting on <slug> into a live link, sitewide."""
    inline = re.compile(r"<!--SCHED:" + re.escape(slug) + r"-->(.*?)<!--/SCHED-->", re.S)
    block = re.compile(r"<!--SCHED-BLOCK:" + re.escape(slug) + r"\s(.*?)\s/SCHED-BLOCK-->", re.S)
    touched = []
    files = glob.glob(os.path.join(ROOT, "**", "*.html"), recursive=True)
    for p in files:
        if "/node_modules/" in p or "/.git/" in p:
            continue
        s = read(p)
        n = inline.sub(lambda m: f'<a href="/{slug}/">{m.group(1)}</a>', s)
        n = block.sub(lambda m: m.group(1), n)
        if n != s:
            write(p, n, dry)
            touched.append(os.path.relpath(p, ROOT))
    return touched


def publish(path, day, dry):
    slug = os.path.basename(path)[:-5]
    s = read(path)
    iso = day.isoformat()
    long_date = day.strftime("%B ") + str(day.day) + day.strftime(", %Y")
    short_date = day.strftime("%b ") + str(day.day) + day.strftime(", %Y")

    s = re.sub(r'\s*<meta name="publish-date" content="[^"]*"\s*/?>', "", s)
    s = re.sub(r'\s*<meta name="robots" content="noindex"[^>]*data-scheduled[^>]*>', "", s)
    s = s.replace("__PUBLISH_DATE_ISO__", iso).replace("__PUBLISH_DATE_LONG__", long_date)
    for bad in ("__PUBLISH_DATE", "data-scheduled"):
        if bad in s:
            raise SystemExit(f"::error::{slug}: '{bad}' left in the post after publishing")
    if 'name="robots" content="noindex' in s:
        raise SystemExit(f"::error::{slug}: still noindex after publishing")

    title = html.unescape(re.sub(r"<[^>]+>", "", one(r"<h1>(.*?)</h1>", s, f"{slug} h1")))
    title = html.escape(title, quote=False)
    cat = one(r'<div class="blog-post-cat">(.*?)</div>', s, f"{slug} category")
    alt = one(r'<section class="blog-post-hero">\s*<img[^>]*alt="([^"]*)"', s, f"{slug} hero alt")

    dest = os.path.join(ROOT, slug + ".html")
    if os.path.exists(dest):
        raise SystemExit(f"::error::{slug}.html already exists at the root")
    if not os.path.exists(os.path.join(ROOT, "Images", "blog", slug + ".webp")):
        raise SystemExit(f"::error::missing Images/blog/{slug}.webp")
    write(dest, s, dry)
    if not dry:
        os.remove(path)

    # blog index: card + counts
    bp = os.path.join(ROOT, "blog.html")
    blog = read(bp)
    if f'href="/{slug}/"' not in blog:
        anchor = "<!-- Post cards (newest first) -->\n"
        if anchor not in blog:
            raise SystemExit("::error::blog.html is missing the '<!-- Post cards (newest first) -->' anchor")
        blog = blog.replace(anchor, anchor + card_html(slug, title, cat, alt, short_date), 1)
        blog = bump_count(blog, "all", "All Articles")
        cat_attr = html.escape(html.unescape(cat), quote=True)
        blog = bump_count(blog, cat_attr, cat_attr)
        write(bp, blog, dry)

    # sitemap
    sp = os.path.join(ROOT, "sitemap.xml")
    sm = read(sp)
    loc = f"{SITE}/{slug}/"
    if loc not in sm:
        entry = (f"  <url>\n    <loc>{loc}</loc>\n    <lastmod>{iso}</lastmod>\n"
                 f"    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n")
        sm = sm.replace("</urlset>", entry + "</urlset>", 1)
        write(sp, sm, dry)

    touched = activate(slug, dry)
    print(f"published {slug} ({iso}); links activated in {len(touched)} file(s): {', '.join(sorted(touched)) or 'none'}")
    return slug


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--date", help="treat this Eastern date as today (YYYY-MM-DD)")
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()
    day = datetime.date.fromisoformat(a.date) if a.date else eastern_today()

    due = []
    for p in sorted(glob.glob(os.path.join(SCHED, "*.html"))):
        m = re.search(r'<meta name="publish-date" content="(\d{4}-\d{2}-\d{2})"', read(p))
        if not m:
            print(f"::warning::{os.path.basename(p)} has no publish-date, skipped")
            continue
        when = datetime.date.fromisoformat(m.group(1))
        if when <= day:
            due.append((when, p))
        else:
            print(f"waiting: {os.path.basename(p)} on {when}")
    if not due:
        print(f"nothing due on {day}")
        return
    for when, p in sorted(due):
        publish(p, day, a.dry_run)
    if a.dry_run:
        print("dry run: no files changed")


if __name__ == "__main__":
    main()
