/**
 * Enquiry API and page stamping.
 *
 * The site itself is static — Cloudflare serves dist/. With run_worker_first
 * every request passes through here: /api/* is handled below, everything else
 * is handed to the asset server, and HTML is stamped with away mode on the way
 * out.
 *
 * Flow: a visitor sends name, mobile, suburb, and optionally the street
 * address and a message. It is
 * saved first, then the operator gets a high-priority push alert and an email.
 * The admin page lists enquiries as New, Contacted and Booked.
 *
 * The speed of the reply is what wins the job: on the Melbourne site every
 * quote answered inside 30 minutes was accepted and every slower one was lost.
 */

import { site } from '../site.config.mjs';

const MAX = { address: 200, suburb: 60, name: 100, phone: 40, message: 1000, page: 120 };

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });

/** Trim, cap length, and reject anything that isn't a usable string. */
function clean(value, max) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
}

/** 32 hex chars of real randomness, for enquiry ids. */
function newToken() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Length-independent comparison so the admin password can't be probed by timing. */
function secretsMatch(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function isAdmin(request, env) {
  const header = request.headers.get('authorization') || '';
  // Both sides are trimmed: a secret set by piping a value in picks up a
  // trailing newline, which an exact comparison would reject forever with no
  // way to see why.
  const supplied = (header.startsWith('Bearer ') ? header.slice(7) : '').trim();
  const expected = (env.ADMIN_PASSWORD || '').trim();
  return Boolean(expected) && secretsMatch(supplied, expected);
}

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );

/** A wall-clock time in Perth, whatever zone the Worker or the reader is in.
 *  WA has no daylight saving, so this is always UTC+8 — but it is formatted by
 *  zone name rather than by adding eight hours, so it stays right regardless. */
function perthTime(ms) {
  return (
    new Intl.DateTimeFormat('en-AU', {
      timeZone: site.timeZone,
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(new Date(ms)) + ' Perth time'
  );
}

/** Alerts are best-effort: a failing mail provider must never lose a customer's
 *  enquiry, so send errors are swallowed after the row is safely written. */
async function sendAlert(env, subject, lines) {
  if (!env.RESEND_API_KEY || !env.ALERT_EMAIL_TO) return;
  const html = lines.map((l) => `<p style="margin:0 0 8px">${escapeHtml(l)}</p>`).join('');
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${env.RESEND_API_KEY}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        from: env.ALERT_EMAIL_FROM || 'onboarding@resend.dev',
        to: env.ALERT_EMAIL_TO,
        subject,
        html,
      }),
    });
  } catch (err) {
    console.error('alert email failed', err);
  }
}

const b64url = (buf) =>
  btoa(String.fromCharCode.apply(null, new Uint8Array(buf)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

let signingKey = null;
function vapidKey(env) {
  if (!signingKey) {
    signingKey = crypto.subtle.importKey(
      'jwk',
      JSON.parse(env.VAPID_PRIVATE_JWK),
      { name: 'ECDSA', namedCurve: 'P-256' },
      false,
      ['sign']
    );
  }
  return signingKey;
}

/** VAPID proves to the push service that the send came from this site. */
async function vapidHeader(env, endpoint) {
  const enc = new TextEncoder();
  const header = b64url(enc.encode(JSON.stringify({ typ: 'JWT', alg: 'ES256' })));
  const claims = b64url(
    enc.encode(
      JSON.stringify({
        aud: new URL(endpoint).origin,
        exp: Math.floor(Date.now() / 1000) + 12 * 3600,
        sub: 'mailto:' + (env.ALERT_EMAIL_TO || 'noreply@' + new URL(site.url).hostname),
      })
    )
  );
  const sig = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    await vapidKey(env),
    enc.encode(header + '.' + claims)
  );
  return `vapid t=${header}.${claims}.${b64url(sig)}, k=${env.VAPID_PUBLIC_KEY}`;
}

/**
 * Pushes carry no payload. That avoids the message-encryption dance entirely,
 * and keeps customer addresses off the lock screen — the notification says a
 * enquiry arrived, the admin page says whose.
 */
async function sendPush(env) {
  if (!env.VAPID_PRIVATE_JWK || !env.VAPID_PUBLIC_KEY) return;
  let rows = [];
  try {
    const r = await env.DB.prepare('SELECT endpoint FROM push_subs').all();
    rows = r.results || [];
  } catch (err) {
    console.error('push: could not read subscriptions', err);
    return;
  }

  for (const row of rows) {
    // One retry, because a transient failure here means the operator simply
    // never hears about a quote — and a quote answered late is a quote lost.
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await fetch(row.endpoint, {
          method: 'POST',
          headers: {
            Authorization: await vapidHeader(env, row.endpoint),
            // Without this the push goes at normal priority, which Android
            // batches until the phone next wakes — so alerts only appear when
            // Chrome is opened. High priority wakes the device immediately.
            Urgency: 'high',
            // Keep it queued for four hours rather than minutes, so being out
            // of range doesn't silently drop the alert.
            TTL: '14400',
          },
        });

        // The device has uninstalled or the subscription expired — stop trying.
        if (res.status === 404 || res.status === 410) {
          await env.DB.prepare('DELETE FROM push_subs WHERE endpoint = ?').bind(row.endpoint).run();
          break;
        }
        if (res.ok) break;

        console.error('push rejected', res.status, (await res.text()).slice(0, 200));
        if (res.status < 500) break; // client error — retrying won't help
      } catch (err) {
        console.error('push failed', err);
      }
    }
  }
}

const AWAY_DEFAULT = { on: false, returnText: 'next week' };

// Read per request, so cache briefly: a few seconds of staleness after the
// switch is flipped is far cheaper than a database hit on every page view.
let settingsCache = { at: 0, value: null };

async function getAway(env) {
  if (settingsCache.value && Date.now() - settingsCache.at < 20000) {
    return settingsCache.value;
  }
  let value = AWAY_DEFAULT;
  try {
    const row = await env.DB.prepare("SELECT value FROM settings WHERE key = 'away'").first();
    if (row && row.value) {
      const parsed = JSON.parse(row.value);
      value = {
        on: !!parsed.on,
        returnText: String(parsed.returnText || AWAY_DEFAULT.returnText).slice(0, 60),
      };
    }
  } catch (err) {
    // A settings read must never take the site down; fall back to open for
    // business, which is the safer wrong answer of the two.
    console.error('settings read failed', err);
  }
  settingsCache = { at: Date.now(), value: value };
  return value;
}

/**
 * Marks the page as being in away mode before it reaches the browser, so the
 * CSS shows the away notice on first paint. Doing it client-side would flash
 * the normal page up and then change it.
 *
 * It only ever sets an attribute and fills in the return date. It never
 * rewrites, renames or hides anything by script — the admin page's own login
 * form and away switch are untouched, so away mode can always be turned off.
 * Enquiries keep coming in while away; the forms just say when replies resume,
 * and the call and text buttons are hidden.
 */
function stampAway(res, away) {
  return new HTMLRewriter()
    .on('html', {
      element(el) {
        el.setAttribute('data-away', 'on');
      },
    })
    .on('[data-away-return]', {
      element(el) {
        el.setInnerContent(away.returnText);
      },
    })
    .transform(res);
}

/**
 * The asset server's ETag describes the static file, not what we did to it.
 * Left alone, a browser that saw a page stamped "away" revalidates, gets a
 * 304 because the file has not changed, and keeps showing the away notice
 * after the operator is back, and hides the call and text buttons for no reason.
 *
 * So the away state is folded into the ETag: revalidation still works while
 * nothing changes, and a flip of the switch makes every cached copy stale.
 */
const etagTag = (away) => (away.on ? '-away1' : '-away0');

function unwrapEtag(value) {
  const m = /^(W\/)?"(.*)"$/.exec(value || '');
  return m ? { weak: m[1] || '', body: m[2] } : null;
}

/** Turn the browser's If-None-Match back into the asset server's own ETag,
 *  or drop it if it was issued under the other away state. */
function assetRequest(request, away) {
  const inm = request.headers.get('if-none-match');
  if (!inm) return request;
  const headers = new Headers(request.headers);
  const e = unwrapEtag(inm.trim());
  const tag = etagTag(away);
  if (e && e.body.endsWith(tag)) {
    headers.set('if-none-match', `${e.weak}"${e.body.slice(0, -tag.length)}"`);
  } else {
    headers.delete('if-none-match');
  }
  headers.delete('if-modified-since');
  return new Request(request, { headers });
}

function tagResponse(res, away) {
  const etag = res.headers.get('etag');
  const e = unwrapEtag(etag);
  if (!e) return res;
  const out = new Response(res.body, res);
  out.headers.set('etag', `${e.weak}"${e.body}${etagTag(away)}"`);
  out.headers.delete('last-modified');
  return out;
}

/** The admin page lists customer details: keep it out of every index, even if
 *  a meta tag is ever dropped from the template by mistake. */
function withNoindex(res) {
  const out = new Response(res.body, res);
  out.headers.set('x-robots-tag', 'noindex, nofollow');
  return out;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // http → https and www → bare domain, so Google only ever sees one copy
    // of each page. Local dev is left alone: `wrangler dev` reports the live
    // domain as the request host, so it is flagged by LOCAL_DEV in .dev.vars.
    const local = env.LOCAL_DEV === '1' || url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    if (!local && (url.protocol === 'http:' || url.hostname.startsWith('www.'))) {
      url.protocol = 'https:';
      if (url.hostname.startsWith('www.')) url.hostname = url.hostname.slice(4);
      return Response.redirect(url.toString(), 301);
    }

    const path = url.pathname.replace(/\/+$/, '') || '/';

    // Anything that isn't an API call is a static page.
    if (!path.startsWith('/api/')) {
      // Every request reaches the Worker, so bail out of anything that
      // obviously isn't a page before doing any work.
      if (/\.[a-z0-9]{2,5}$/i.test(path) && !/\.html?$/i.test(path)) {
        return env.ASSETS.fetch(request);
      }
      // Anything else is (or redirects to) a page. Read the switch first so a
      // conditional request can be checked against the current state.
      const away = env.DB ? await getAway(env) : AWAY_DEFAULT;
      let res = await env.ASSETS.fetch(assetRequest(request, away));
      const type = res.headers.get('content-type') || '';
      const isHtml = type.includes('text/html');
      if (!isHtml && res.status !== 304) return res;
      res = tagResponse(res, away);
      if (path === '/quote-admin') res = withNoindex(res);
      return away.on && isHtml ? stampAway(res, away) : res;
    }
    if (!env.DB) return json({ error: 'Database not configured' }, 500);

    try {
      // ---- new enquiry -----------------------------------------------------
      if (path === '/api/enquiry' && request.method === 'POST') {
        const body = await request.json().catch(() => ({}));

        // Honeypot: a real person never fills a hidden field.
        if (clean(body.company, 50)) return json({ ok: true });

        const name = clean(body.name, MAX.name);
        const phone = clean(body.phone, MAX.phone);
        const suburb = clean(body.suburb, MAX.suburb);
        const address = clean(body.address, MAX.address);
        const message = clean(body.message, MAX.message);
        const page = clean(body.page, MAX.page);
        if (!name) return json({ error: 'Please enter your name.' }, 400);
        if (phone.replace(/\D/g, '').length < 8) {
          return json({ error: 'Please enter a valid mobile number.' }, 400);
        }
        if (suburb.length < 2) return json({ error: 'Please enter your suburb.' }, 400);

        const ip = request.headers.get('cf-connecting-ip') || '';
        const now = Date.now();

        // Someone who hears nothing straight away often sends it again. Fold a
        // repeat from the same number for the same suburb into the open
        // enquiry instead of creating a duplicate and a second alert.
        const digits = phone.replace(/\D/g, '');
        const existing = await env.DB.prepare(
          "SELECT id, message, address FROM enquiries WHERE status = 'new' AND LOWER(IFNULL(suburb,'')) = LOWER(?)" +
            " AND REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '+', '') LIKE ?" +
            ' AND created_at > ? ORDER BY created_at DESC LIMIT 1'
        )
          .bind(suburb, '%' + digits.slice(-8), now - 24 * 3600 * 1000)
          .first();
        if (existing && existing.id) {
          const merged =
            message && message !== existing.message
              ? [existing.message, message].filter(Boolean).join('\n— ').slice(0, MAX.message)
              : existing.message;
          // A repeat that adds the street address the first one left out.
          const addr = existing.address || address || null;
          await env.DB.prepare('UPDATE enquiries SET message = ?, address = ?, updated_at = ? WHERE id = ?')
            .bind(merged, addr, now, existing.id)
            .run();
          return json({ ok: true, existing: true });
        }

        // Cheap abuse brake: a new enquiry sends alerts, so cap new ones per
        // IP. Checked after the repeat merge above, so a customer re-sending
        // their own enquiry (no new row, no new alert) is never blocked.
        const recent = await env.DB.prepare(
          'SELECT COUNT(*) AS n FROM enquiries WHERE ip = ? AND created_at > ?'
        )
          .bind(ip, now - 10 * 60 * 1000)
          .first();
        if (recent && recent.n >= 5) {
          return json({ error: 'Too many enquiries from this connection — please try again shortly.' }, 429);
        }

        const id = newToken();
        await env.DB.prepare(
          `INSERT INTO enquiries (id, name, phone, suburb, address, message, page, status, ip, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, 'new', ?, ?)`
        )
          .bind(id, name, phone, suburb, address || null, message, page, ip, now)
          .run();

        ctx.waitUntil(
          Promise.all([
            sendPush(env),
            sendAlert(env, `New enquiry — ${name}, ${suburb}`, [
              `Name: ${name}`,
              `Mobile: ${phone}`,
              `Suburb: ${suburb}`,
              `Address: ${address || '(not given — text to ask)'}`,
              message ? `Message: ${message}` : 'No message.',
              page ? `Sent from: ${page}` : '',
              `Received: ${perthTime(now)}`,
              `Open the enquiries page: ${url.origin}/quote-admin/`,
            ].filter(Boolean)),
          ])
        );

        return json({ ok: true });
      }

      // ---- push: the browser needs the public key to subscribe -------------
      if (path === '/api/push/key' && request.method === 'GET') {
        return json({ key: env.VAPID_PUBLIC_KEY || '' });
      }

      // ---- push: fire a test alert ----------------------------------------
      if (path === '/api/admin/push/test' && request.method === 'POST') {
        if (!isAdmin(request, env)) return json({ error: 'Unauthorised' }, 401);
        const subs = await env.DB.prepare('SELECT COUNT(*) AS n FROM push_subs').first();
        if (!subs || !subs.n) return json({ error: 'No device is registered for alerts yet.' }, 400);
        ctx.waitUntil(sendPush(env));
        return json({ ok: true, devices: subs.n });
      }

      // ---- push: register or remove this device ---------------------------
      if (path === '/api/admin/push' && (request.method === 'POST' || request.method === 'DELETE')) {
        if (!isAdmin(request, env)) return json({ error: 'Unauthorised' }, 401);
        const body = await request.json().catch(() => ({}));
        const endpoint = clean(body.endpoint, 500);
        if (!/^https:\/\//.test(endpoint)) return json({ error: 'Invalid subscription' }, 400);

        if (request.method === 'DELETE') {
          await env.DB.prepare('DELETE FROM push_subs WHERE endpoint = ?').bind(endpoint).run();
          return json({ ok: true, subscribed: false });
        }

        await env.DB.prepare(
          `INSERT INTO push_subs (endpoint, label, created_at) VALUES (?, ?, ?)
           ON CONFLICT(endpoint) DO NOTHING`
        )
          .bind(endpoint, clean(body.label, 60), Date.now())
          .run();
        return json({ ok: true, subscribed: true });
      }

      // ---- address autocomplete -------------------------------------------
      // Proxied rather than called from the browser so the API key stays server
      // side. Suggestions are a convenience only: every failure path returns an
      // empty list, and the field still accepts anything typed by hand.
      //
      // Places Autocomplete (New) fails with the same opaque INVALID_ARGUMENT
      // for three different mistakes, so: no X-Goog-FieldMask header (it
      // rejects it), the session token must be a real UUID, and a circle bias
      // caps at 50,000 m.
      if (path === '/api/address' && request.method === 'GET') {
        if (!env.GOOGLE_PLACES_API_KEY) return json({ suggestions: [] });

        const q = clean(url.searchParams.get('q'), 120);
        if (q.length < 4) return json({ suggestions: [] });

        try {
          const res = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
            method: 'POST',
            headers: {
              'content-type': 'application/json',
              'X-Goog-Api-Key': env.GOOGLE_PLACES_API_KEY,
            },
            body: JSON.stringify({
              input: q,
              includedRegionCodes: ['au'],
              // Perth's metro runs about 150 km north to south — Two Rocks to
              // Mandurah — so a 50 km circle (the maximum) would leave the
              // ends out. A rectangle has no such cap: this one covers Two
              // Rocks to Mandurah and the coast to east of Mundaring.
              locationBias: {
                rectangle: {
                  low: { latitude: -32.65, longitude: 115.55 },
                  high: { latitude: -31.45, longitude: 116.45 },
                },
              },
              // One session token covers a whole burst of keystrokes, so Google
              // bills per lookup rather than per character. Must be UUID-shaped.
              ...(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
                clean(url.searchParams.get('s'), 64)
              )
                ? { sessionToken: clean(url.searchParams.get('s'), 64) }
                : {}),
            }),
          });

          if (!res.ok) {
            let status = '';
            try {
              const body = await res.json();
              status = ((body && body.error && body.error.status) || '') +
                (body && body.error && body.error.message ? ': ' + body.error.message : '');
            } catch (e) {
              status = '';
            }
            console.error('places autocomplete failed', res.status, status);
            return json({ suggestions: [], upstream: res.status, upstreamStatus: status });
          }

          const data = await res.json();
          const suggestions = (data.suggestions || [])
            .map((s2) => s2 && s2.placePrediction && s2.placePrediction.text && s2.placePrediction.text.text)
            .filter(Boolean)
            .map((t) => t.replace(/,\s*Australia$/i, ''))
            .slice(0, 5);

          return json({ suggestions });
        } catch (err) {
          console.error('places autocomplete error', err);
          return json({ suggestions: [] });
        }
      }

      // ---- admin: list enquiries ------------------------------------------
      if (path === '/api/admin/enquiries' && request.method === 'GET') {
        if (!isAdmin(request, env)) return json({ error: 'Unauthorised' }, 401);
        const status = clean(url.searchParams.get('status'), 20);
        const term = clean(url.searchParams.get('q'), 80).toLowerCase();
        const byStatus = status === 'new' || status === 'contacted' || status === 'booked';

        const where = [];
        const binds = [];
        if (byStatus) {
          where.push('status = ?');
          binds.push(status);
        }
        if (term) {
          // Searched together: the operator thinks in "that Kalamunda one" or
          // half a surname, not in fields.
          where.push(
            "(LOWER(name) LIKE ? OR LOWER(IFNULL(suburb,'')) LIKE ? OR LOWER(IFNULL(address,'')) LIKE ?" +
              " OR LOWER(IFNULL(message,'')) LIKE ? OR phone LIKE ?)"
          );
          const like = '%' + term + '%';
          binds.push(like, like, like, like, like);
        }

        const sql =
          'SELECT id, name, phone, suburb, address, message, page, status, created_at, contacted_at FROM enquiries' +
          (where.length ? ' WHERE ' + where.join(' AND ') : '') +
          " ORDER BY CASE status WHEN 'new' THEN 0 WHEN 'contacted' THEN 1 ELSE 2 END," +
          ' created_at DESC LIMIT 200';

        const { results } = await env.DB.prepare(sql).bind(...binds).all();

        // Counts ignore the active filter so the tabs always show real totals.
        const counted = await env.DB.prepare(
          'SELECT status, COUNT(*) AS n FROM enquiries GROUP BY status'
        ).all();
        const counts = { new: 0, contacted: 0, booked: 0 };
        for (const row of counted.results || []) {
          if (row.status in counts) counts[row.status] = row.n;
        }

        return json({ enquiries: results || [], counts: counts });
      }

      // ---- admin: change an enquiry's status ------------------------------
      if (path === '/api/admin/enquiry' && request.method === 'POST') {
        if (!isAdmin(request, env)) return json({ error: 'Unauthorised' }, 401);
        const body = await request.json().catch(() => ({}));
        const id = clean(body.id, 64);
        const status = clean(body.status, 20);
        if (!id || !['new', 'contacted', 'booked'].includes(status)) {
          return json({ error: 'Enquiry and a valid status are required' }, 400);
        }
        const now = Date.now();
        // contacted_at keeps the FIRST time it left "new", so reply speed is
        // measured from the first answer, not a later change.
        const res = await env.DB.prepare(
          `UPDATE enquiries
              SET status = ?, updated_at = ?,
                  contacted_at = CASE WHEN ? != 'new' THEN COALESCE(contacted_at, ?) ELSE contacted_at END
            WHERE id = ?`
        )
          .bind(status, now, status, now, id)
          .run();
        if (!res.meta || res.meta.changes === 0) return json({ error: 'Enquiry not found' }, 404);
        return json({ ok: true });
      }

      // ---- admin: delete an enquiry ---------------------------------------
      if (path === '/api/admin/enquiry' && request.method === 'DELETE') {
        if (!isAdmin(request, env)) return json({ error: 'Unauthorised' }, 401);
        const body = await request.json().catch(() => ({}));
        const id = clean(body.id, 64);
        if (!id) return json({ error: 'Enquiry reference required' }, 400);
        const res = await env.DB.prepare('DELETE FROM enquiries WHERE id = ?').bind(id).run();
        if (!res.meta || res.meta.changes === 0) return json({ error: 'Enquiry not found' }, 404);
        return json({ ok: true, deleted: true });
      }

      // ---- admin: away mode -----------------------------------------------
      if (path === '/api/admin/settings' && request.method === 'GET') {
        if (!isAdmin(request, env)) return json({ error: 'Unauthorised' }, 401);
        return json({ away: await getAway(env) });
      }

      if (path === '/api/admin/settings' && request.method === 'POST') {
        if (!isAdmin(request, env)) return json({ error: 'Unauthorised' }, 401);
        const body = await request.json().catch(() => ({}));
        const on = !!body.on;
        const returnText = clean(body.returnText, 60) || AWAY_DEFAULT.returnText;

        await env.DB.prepare(
          `INSERT INTO settings (key, value, updated_at) VALUES ('away', ?, ?)
           ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
        )
          .bind(JSON.stringify({ on: on, returnText: returnText }), Date.now())
          .run();

        // Don't make the operator wait out the cache to see their own change.
        settingsCache = { at: 0, value: null };
        return json({ ok: true, away: { on: on, returnText: returnText } });
      }

      return json({ error: 'Not found' }, 404);
    } catch (err) {
      console.error('api error', err);
      return json({ error: 'Something went wrong. Please try again in a moment.' }, 500);
    }
  },
};
