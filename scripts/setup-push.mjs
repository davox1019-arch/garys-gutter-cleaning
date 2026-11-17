#!/usr/bin/env node
/**
 * Sets up web push alerts.
 *
 *   npm run setup:push
 *
 * Generates a VAPID keypair for THIS site (never reuse another site's) and
 * stores it in Cloudflare. The private key is piped straight into wrangler and
 * is never printed or written to disk.
 */

import { spawnSync } from 'node:child_process';
import { webcrypto } from 'node:crypto';
import { site } from '../site.config.mjs';

const DB_NAME = 'garys-gutter-cleaning-perth-quotes';

const say = (m) => console.log(m);
const die = (m) => { console.error(`\n✗ ${m}\n`); process.exit(1); };

const b64url = (buf) =>
  Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

function putSecret(name, value) {
  const res = spawnSync('npx', ['wrangler', 'secret', 'put', name], {
    input: value,
    stdio: ['pipe', 'inherit', 'inherit'],
    shell: true,
  });
  if (res.status !== 0) die(`Could not set ${name}.`);
}

say('\n── Push alert setup ──────────────────────────────────\n');

say('1/3  Generating a signing key…');
const pair = await webcrypto.subtle.generateKey(
  { name: 'ECDSA', namedCurve: 'P-256' },
  true,
  ['sign', 'verify']
);
// The browser needs the public key as raw bytes; the Worker signs with the JWK.
const publicKey = b64url(await webcrypto.subtle.exportKey('raw', pair.publicKey));
const privateJwk = JSON.stringify(await webcrypto.subtle.exportKey('jwk', pair.privateKey));
say('     ✓ Key generated.\n');

say('2/3  Storing it in Cloudflare…');
putSecret('VAPID_PUBLIC_KEY', publicKey);
putSecret('VAPID_PRIVATE_JWK', privateJwk);
say('     ✓ Stored (the private key was never displayed or saved locally).\n');

say('3/3  Making sure the subscriptions table exists…');
const res = spawnSync(
  'npx',
  ['wrangler', 'd1', 'execute', DB_NAME, '--remote', '--file', 'worker/schema.sql', '-y'],
  { stdio: 'inherit', shell: true }
);
if (res.status !== 0) die('Could not create the table. Check the error above.');
say('     ✓ Table ready.\n');

say(`── Done ──────────────────────────────────────────────

On your phone, open:

  ${site.url}/quote-admin/

log in, tap "Turn on phone alerts", and allow notifications when Chrome asks.
Then tap "Send a test alert" and check the phone buzzes with the screen off.
`);
