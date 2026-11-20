#!/usr/bin/env node

import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { appendFile, chmod, open, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertAllowedTarget } from '../tests/helpers/allowed-target.cjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const envFile = resolve(root, '.env.local');
const accountsFile = resolve(root, 'test-data/accounts.example.json');
const systemUrl = assertAllowedTarget(
  process.env.PLM_TEST_SYSTEM_URL ?? 'http://localhost:8082',
  'system target',
);
const initialPassword = process.env.PLM_BOOTSTRAP_INITIAL_PASSWORD;
let existingEnv = '';
let envExists = true;

try {
  existingEnv = await readFile(envFile, 'utf8');
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
  envExists = false;
}

assert.equal(
  process.env.PLM_TEST_BOOTSTRAP_CONFIRM,
  'isolated-dev-h2',
  'Set PLM_TEST_BOOTSTRAP_CONFIRM=isolated-dev-h2 only for the isolated local H2 test instance.',
);
assert.ok(initialPassword, 'Set the known initial local administrator password for this one-time rotation.');
assert.equal(systemUrl.hostname, 'localhost');
assert.equal(systemUrl.port, '8082');

const healthResponse = await fetch(new URL('/actuator/health', systemUrl), {
  signal: AbortSignal.timeout(5000),
});
assert.equal(healthResponse.status, 200, 'System health must be available before bootstrap.');
const health = await healthResponse.json();
assert.equal(health.status, 'UP');
assert.equal(health.components?.db?.details?.database, 'H2', 'Refusing to bootstrap outside dev H2.');

const accounts = JSON.parse(await readFile(accountsFile, 'utf8')).accounts;
const randomPassword = () => randomBytes(32).toString('hex');
const existingValues = new Map(
  existingEnv.split(/\r?\n/).filter(Boolean).map((line) => {
    const separator = line.indexOf('=');
    return [line.slice(0, separator), line.slice(separator + 1)];
  }),
);
const managedNames = [
  'PLM_PROVISIONER_USERNAME',
  'PLM_PROVISIONER_PASSWORD',
  'PLM_TEST_DEFAULT_PASSWORD',
  'PLM_TEST_USE_SYSTEM_DIRECT',
  'PLM_TEST_SYSTEM_URL',
  ...accounts.map(({ passwordEnv }) => passwordEnv),
];
assert.ok(
  managedNames.every((name) => !existingValues.has(name)),
  'Local test credentials are already initialized; refusing to overwrite them.',
);
const provisionerPassword = randomPassword();
const jwtSecret = existingValues.get('PLM_JWT_SECRET')
  ?? process.env.PLM_JWT_SECRET
  ?? randomPassword() + randomPassword();
assert.ok(Buffer.byteLength(jwtSecret, 'utf8') >= 32, 'PLM_JWT_SECRET must contain at least 32 UTF-8 bytes.');
const credentials = [
  ['PLM_PROVISIONER_USERNAME', 'admin'],
  ['PLM_PROVISIONER_PASSWORD', provisionerPassword],
  ['PLM_TEST_DEFAULT_PASSWORD', provisionerPassword],
  ['PLM_JWT_SECRET', jwtSecret],
  ['PLM_TEST_USE_SYSTEM_DIRECT', 'true'],
  ['PLM_TEST_SYSTEM_URL', systemUrl.origin],
  ...accounts.map(({ username, passwordEnv }) => [passwordEnv, randomPassword()]),
];
const envContents = `${credentials.map(([name, value]) => `${name}=${value}`).join('\n')}\n`;

async function request(endpoint, { method = 'GET', token, body } = {}) {
  const response = await fetch(new URL(endpoint, systemUrl), {
    method,
    redirect: 'manual',
    headers: {
      ...(body === undefined ? {} : { 'content-type': 'application/json' }),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(10000),
  });
  const payload = await response.json();
  assert.equal(response.status, 200, `${method} ${endpoint} returned HTTP ${response.status}.`);
  assert.equal(payload.code, 200, `${method} ${endpoint} returned an API error.`);
  return payload.data;
}

const username = credentials[0][1];
const current = await request('/auth/login', {
  method: 'POST',
  body: { username, password: initialPassword },
});
assert.ok(current?.accessToken && current?.userInfo?.userId, 'Initial administrator login failed.');

if (envExists) {
  await appendFile(envFile, `\n${envContents}`, { mode: 0o600 });
} else {
  let handle;
  try {
    handle = await open(envFile, 'wx', 0o600);
    await handle.writeFile(envContents, 'utf8');
    await handle.sync();
  } finally {
    await handle?.close();
  }
}
await chmod(envFile, 0o600);

const newPassword = credentials.find(([name]) => name === 'PLM_TEST_DEFAULT_PASSWORD')[1];
await request(`/system/users/${current.userInfo.userId}/password`, {
  method: 'PUT',
  token: current.accessToken,
  body: { password: newPassword },
});

const verified = await request('/auth/login', {
  method: 'POST',
  body: { username, password: newPassword },
});
assert.ok(verified?.accessToken, 'Rotated administrator credentials did not authenticate.');

console.log(`Isolated H2 administrator rotated and verified. Local credentials saved to ${envFile}.`);
