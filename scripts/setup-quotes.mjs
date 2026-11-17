#!/usr/bin/env node
/**
 * One-shot setup for the quote system.
 *
 *   npm run setup:quotes
 *
 * Logs you into Cloudflare if needed, creates this site's own D1 database,
 * writes its id into wrangler.jsonc, applies the schema, and sets the secrets.
 *
 * Secrets are piped straight into `wrangler secret put` from your machine —
 * they are never printed to the terminal and never written anywhere except the
 * gitignored file noted at the end.
 */

import { spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { readFileSync, writeFileSync, copyFileSync, existsSync } from 'node:fs';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { site } from '../site.config.mjs';

const DB_NAME = 'garys-gutter-cleaning-perth-quotes';
const CONFIG = 'wrangler.jsonc';
const SCHEMA = 'worker/schema.sql';
const PW_FILE = '.admin-password.txt';

const say = (m) => console.log(m);
const die = (m) => { console.error(`\n✗ ${m}\n`); process.exit(1); };

/** Run wrangler with the terminal attached, so its prompts work normally. */
function wrangler(args, { capture = false } = {}) {
  const res = spawnSync('npx', ['wrangler', ...args], {
    stdio: capture ? ['inherit', 'pipe', 'inherit'] : 'inherit',
    shell: true,
    encoding: 'utf8',
  });
  return { code: res.status, out: capture ? res.stdout || '' : '' };
}

say('\n── Quote system setup ────────────────────────────────\n');

// 1. Cloudflare login -------------------------------------------------------
say('1/5  Checking your Cloudflare login…');
const who = wrangler(['whoami'], { capture: true });
if (who.code !== 0 || !/@|Account ID/i.test(who.out)) {
  say('     Not logged in — opening Cloudflare in your browser.');
  if (wrangler(['login']).code !== 0) die('Cloudflare login failed. Run `npx wrangler login` and try again.');
}
say('     ✓ Logged in.\n');

// 2. Database ---------------------------------------------------------------
say('2/5  Creating the database…');
let list = wrangler(['d1', 'list', '--json'], { capture: true }).out;
let dbs = [];
try { dbs = JSON.parse(list.slice(list.indexOf('['))); } catch { dbs = []; }

if (!dbs.find((d) => d.name === DB_NAME)) {
  if (wrangler(['d1', 'create', DB_NAME]).code !== 0) die(`Could not create the database "${DB_NAME}".`);
  list = wrangler(['d1', 'list', '--json'], { capture: true }).out;
  try { dbs = JSON.parse(list.slice(list.indexOf('['))); } catch { dbs = []; }
} else {
  say('     (already exists — reusing it)');
}

const db = dbs.find((d) => d.name === DB_NAME);
if (!db?.uuid) die(`Created the database but could not read its id. Run \`npx wrangler d1 list\` and paste the id into ${CONFIG} by hand.`);
say(`     ✓ Database ready.\n`);

// 3. Point wrangler.jsonc at it ---------------------------------------------
say('3/5  Writing the database id into wrangler.jsonc…');
const original = readFileSync(CONFIG, 'utf8');
copyFileSync(CONFIG, `${CONFIG}.backup`);            // never edit config without a way back
const patched = original.replace(/"database_id":\s*"[^"]*"/, `"database_id": "${db.uuid}"`);
if (patched === original && !original.includes(db.uuid)) {
  die(`Could not find the database_id line in ${CONFIG}. Set it to "${db.uuid}" by hand.`);
}
writeFileSync(CONFIG, patched);
say(`     ✓ Written (previous file kept as ${CONFIG}.backup).\n`);

// 4. Schema -----------------------------------------------------------------
say('4/5  Creating the tables…');
if (!existsSync(SCHEMA)) die(`Missing ${SCHEMA}.`);
if (wrangler(['d1', 'execute', DB_NAME, '--remote', '--file', SCHEMA, '-y']).code !== 0) {
  die('Could not apply the schema. Check the error above.');
}
say('     ✓ Tables created.\n');

// 5. Secrets ----------------------------------------------------------------
say('5/5  Setting the secrets…\n');
const rl = createInterface({ input: stdin, output: stdout });

/** Pipe a value into `wrangler secret put` without it ever being echoed. */
function putSecret(name, value) {
  const res = spawnSync('npx', ['wrangler', 'secret', 'put', name], {
    input: value,
    stdio: ['pipe', 'inherit', 'inherit'],
    shell: true,
  });
  if (res.status !== 0) die(`Could not set ${name}. If the Worker hasn't been deployed yet, run \`npm run deploy\` first, then re-run this.`);
}

// A generated password beats one you'd have to think up, and you never type it.
const adminPassword = randomBytes(12).toString('base64url');
putSecret('ADMIN_PASSWORD', adminPassword);
writeFileSync(PW_FILE, `Quote admin password (${new Date().toISOString().slice(0, 10)})\n${adminPassword}\n`);
say('     ✓ Admin password generated and set.');

const email = (await rl.question('\n     Email address alerts should go to: ')).trim();
if (!email.includes('@')) die('That does not look like an email address.');
putSecret('ALERT_EMAIL_TO', email);
say('     ✓ Alert address set.');

say('\n     Get an API key from https://resend.com/api-keys (free account).');
const key = (await rl.question('     Paste your Resend API key: ')).trim();
if (!key.startsWith('re_')) die('Resend keys start with "re_". Nothing was saved — re-run when you have it.');
putSecret('RESEND_API_KEY', key);
say('     ✓ Resend key set.');

say('\n     Address autocomplete needs a Google Maps Platform key with "Places API (New)" enabled.');
say('     Use a NEW key for this site — do not share one with any other site.');
const places = (await rl.question('     Paste the Places API key (or press Enter to skip for now): ')).trim();
if (places) {
  putSecret('GOOGLE_PLACES_API_KEY', places);
  say('     ✓ Places key set.');
} else {
  say('     – Skipped. The address field still works as a plain text box.');
}

await rl.close();

say(`
── Done ──────────────────────────────────────────────

Your admin password is in  ${PW_FILE}  (gitignored).
Keep it somewhere safe, then delete that file.

Next: run  npm run setup:push  for phone alerts, then  npm run deploy.
Your admin page will be at:

  ${site.url}/quote-admin/
`);
