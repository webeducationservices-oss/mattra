// Password gate for the private research dossier at /research.
//
// Pattern lifted from Entertainment Pros' /proposal gate, which was debugged the
// hard way. Keep these three properties or it breaks in non-obvious ways:
//
// 1. NEVER return 4xx. myaieditor probes pages server-side and treats any status
//    >= 400 as "Preview can't load here". The lock screen is a normal 200 page
//    with Cache-Control: no-store; it leaks nothing, so the status does no work.
// 2. Two cookies. The editor frames this site cross-site from myaieditor.com and
//    SameSite=Lax cookies are not sent there, so we also set a
//    SameSite=None; Partitioned cookie. Either one passes.
// 3. Gate the public host only. Preview *.vercel.app hosts stay open so the
//    editor can load them; they are unguessable and the page is noindex.
//
// DELIBERATE DIVERGENCE FROM THE PROPOSAL GATE: that one fails OPEN when the env
// var is missing, so a config slip cannot lock a client out of something they were
// sent. This page is internal competitive research with no audience waiting on it,
// so the failure modes are reversed and it fails CLOSED. A missing env var shows
// the lock screen with no way in rather than publishing the dossier.

export const config = { matcher: ['/research', '/research/', '/research/:path*'] }

const GATED_HOSTS = new Set(['www.mattrainc.com', 'mattrainc.com'])

const COOKIE = 'mattra_research'
const COOKIE_IFRAME = 'mattra_research_e'
const MAX_AGE = 2592000 // 30 days

function lockScreen({ wrong = false, unconfigured = false } = {}) {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow,noarchive">
<title>Private Research | Mattra Inc.</title>
<link rel="icon" href="/favicon.ico" sizes="any">
<style>
*{box-sizing:border-box}
body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;
  background:#1e3a28;padding:24px;
  font-family:'Montserrat',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif}
.card{background:#fff;border-radius:4px;padding:42px 36px;max-width:410px;width:100%;
  text-align:center;box-shadow:0 12px 44px rgba(0,0,0,.35)}
.rule{height:4px;border-radius:2px;margin:0 0 24px;
  background:linear-gradient(90deg,#2a5838 0%,#316b43 55%,#e7bb3a 100%)}
h1{font-size:1.16rem;margin:0 0 7px;color:#16221a;font-weight:700;letter-spacing:.2px}
p{font-size:.9rem;color:#5d6b62;margin:0 0 22px;line-height:1.6}
input{width:100%;padding:13px 15px;border:2px solid #e2e8f0;border-radius:3px;font-size:1rem;
  margin-bottom:12px;outline:none;font-family:inherit}
input:focus{border-color:#316b43}
button{width:100%;padding:13px;background:#316b43;color:#fff;border:0;border-radius:3px;
  font-size:.95rem;font-weight:700;cursor:pointer;letter-spacing:.3px;font-family:inherit}
button:hover{background:#2a5838}
.err{background:#f9e6e6;color:#a33232;font-size:.85rem;padding:9px 12px;border-radius:3px;
  margin-bottom:14px}
.foot{margin-top:22px;font-size:.76rem;color:#9aab9f;letter-spacing:.03em}
</style></head><body>
<div class="card">
  <div class="rule"></div>
  <h1>Private research</h1>
  <p>${unconfigured
      ? 'This page is not available right now.'
      : 'This dossier is internal. Enter the access code to continue.'}</p>
  ${wrong ? '<div class="err">That code did not match. Please try again.</div>' : ''}
  ${unconfigured ? '' : `<form method="GET">
    <input type="password" name="key" placeholder="Access code" autofocus
           autocomplete="current-password" aria-label="Access code">
    <button type="submit">View dossier</button>
  </form>`}
  <div class="foot">MATTRA INC. &middot; INTERNAL</div>
</div></body></html>`
}

function gate(opts) {
  return new Response(lockScreen(opts), {
    status: 200, // 200 on purpose - see note 1
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow, noarchive',
    },
  })
}

export default function middleware(request) {
  const url = new URL(request.url)
  const host = (request.headers.get('host') || '').toLowerCase()

  // Preview hosts stay open so the editor iframe can load them.
  if (!GATED_HOSTS.has(host)) return

  const password = process.env.RESEARCH_PASSWORD
  if (!password) return gate({ unconfigured: true }) // fail CLOSED

  const token = encodeURIComponent(password)
  const cookies = request.headers.get('cookie') || ''
  const has = (name) => cookies.split(';').some((c) => c.trim() === `${name}=${token}`)
  if (has(COOKIE) || has(COOKIE_IFRAME)) return

  const key = url.searchParams.get('key')
  if (key !== null) {
    if (key.trim().toLowerCase() === password.toLowerCase()) {
      const headers = new Headers({ Location: url.pathname })
      headers.append('Set-Cookie',
        `${COOKIE}=${token}; Path=/research; Max-Age=${MAX_AGE}; Secure; HttpOnly; SameSite=Lax`)
      headers.append('Set-Cookie',
        `${COOKIE_IFRAME}=${token}; Path=/; Max-Age=${MAX_AGE}; Secure; HttpOnly; SameSite=None; Partitioned`)
      return new Response(null, { status: 302, headers })
    }
    return gate({ wrong: true })
  }
  return gate()
}
