import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { after, test } from 'node:test';
import { assertAllowedTarget } from '../helpers/allowed-target.cjs';

const runId = process.env.PLM_TEST_RUN_ID ?? 'manual';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const evidenceDir = process.env.PLM_TEST_EVIDENCE_DIR ?? join(root, 'reports/evidence', runId);
const systemUrl = assertAllowedTarget(process.env.PLM_TEST_SYSTEM_URL ?? 'http://localhost:8082', 'system target');
const gatewayUrl = assertAllowedTarget(process.env.PLM_TEST_GATEWAY_URL ?? 'http://localhost:8080', 'gateway target');
const frontendUrl = assertAllowedTarget(process.env.PLM_TEST_FRONTEND_URL ?? 'http://localhost:3000', 'frontend target');
const evidence = [];

function recordEvidence(name, method, url, response, body, requestBody = undefined) {
  const serializedBody = body === undefined ? undefined : JSON.stringify(body);
  const safeBody = serializedBody === undefined
    ? undefined
    : JSON.parse(process.env.HOME ? serializedBody.replaceAll(process.env.HOME, '$HOME') : serializedBody);
  evidence.push({
    name,
    request: {
      method,
      url: `${url.origin}${url.pathname}`,
      ...(requestBody === undefined ? {} : { body: requestBody }),
    },
    response: {
      status: response.status,
      contentType: response.headers.get('content-type'),
      ...(typeof safeBody === 'string'
        ? {
            bodyBytes: Buffer.byteLength(safeBody),
            bodySha256: createHash('sha256').update(safeBody).digest('hex'),
          }
        : { body: safeBody }),
    },
  });
}

after(() => {
  mkdirSync(evidenceDir, { recursive: true });
  writeFileSync(join(evidenceDir, 'api-smoke.json'), `${JSON.stringify({ runId, evidence }, null, 2)}\n`);
});

async function get(url) {
  return fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(5000) });
}

test(`system service health is UP (${runId})`, async () => {
  const url = new URL('/actuator/health', systemUrl);
  const response = await get(url);
  const health = await response.json();
  recordEvidence('system-health', 'GET', url, response, health);
  assert.equal(response.status, 200);
  assert.equal(health.status, 'UP');
});

test(`gateway health is UP (${runId})`, async () => {
  const url = new URL('/actuator/health', gatewayUrl);
  const response = await get(url);
  const health = await response.json();
  recordEvidence('gateway-health', 'GET', url, response, health);
  assert.equal(response.status, 200);
  assert.equal(health.status, 'UP');
});

test(`frontend serves the Chinese application shell (${runId})`, async () => {
  const response = await get(frontendUrl);
  const html = await response.text();
  recordEvidence('frontend-root', 'GET', frontendUrl, response, html);
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type') ?? '', /text\/html/i);
  assert.match(html, /<html lang="zh-CN">/);
  assert.match(html, /<div id="root"><\/div>/);
});

test(`anonymous API access is rejected (${runId})`, async () => {
  const url = new URL('/api/auth/me', gatewayUrl);
  const response = await get(url);
  recordEvidence('anonymous-current-user', 'GET', url, response, await response.text());
  assert.equal(response.status, 401);
});

test(`anonymous system user enumeration is rejected (${runId})`, async () => {
  const url = new URL('/api/system/users', gatewayUrl);
  const response = await get(url);
  recordEvidence('anonymous-user-list', 'GET', url, response, await response.text());
  assert.equal(response.status, 401);
});

test(`provisioning administrator can access a protected API through Gateway (${runId})`, async () => {
  const username = process.env.PLM_PROVISIONER_USERNAME;
  const password = process.env.PLM_PROVISIONER_PASSWORD;
  assert.ok(username && password, 'Load local provisioner credentials before running the API smoke tests.');

  const loginUrl = new URL('/api/auth/login', gatewayUrl);
  const loginResponse = await fetch(loginUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username, password }),
    redirect: 'manual',
    signal: AbortSignal.timeout(5000),
  });
  const login = await loginResponse.json();
  recordEvidence('gateway-provisioner-login', 'POST', loginUrl, loginResponse, {
    code: login.code,
    message: login.message,
    userInfo: login.data?.userInfo,
  });
  assert.equal(loginResponse.status, 200);
  assert.equal(login.code, 200);
  assert.ok(login.data?.accessToken);

  const protectedUrl = new URL('/api/system/organizations/tree', gatewayUrl);
  const protectedResponse = await fetch(protectedUrl, {
    headers: { authorization: `Bearer ${login.data.accessToken}` },
    redirect: 'manual',
    signal: AbortSignal.timeout(5000),
  });
  const protectedResult = await protectedResponse.json();
  recordEvidence('gateway-protected-organization-tree', 'GET', protectedUrl, protectedResponse, protectedResult);
  assert.equal(protectedResponse.status, 200);
  assert.equal(protectedResult.code, 200);
});

test(`anonymous actuator and diagnostic endpoints are rejected (${runId})`, async () => {
  const paths = ['/actuator/env', '/doc.html', '/h2-console', '/v3/api-docs'];
  for (const pathname of paths) {
    const url = new URL(pathname, systemUrl);
    const response = await get(url);
    recordEvidence(`anonymous-${pathname.replaceAll('/', '-')}`, 'GET', url, response, await response.text());
    assert.ok(
      [401, 403, 404].includes(response.status),
      `Anonymous access to ${pathname} must be denied or the endpoint must be disabled; received HTTP ${response.status}.`,
    );
  }
});

test(`empty login input returns validation errors in Chinese (${runId})`, async () => {
  const url = new URL('/api/auth/login', gatewayUrl);
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: '{}',
    redirect: 'manual',
    signal: AbortSignal.timeout(5000),
  });
  const result = await response.json();
  recordEvidence('empty-login', 'POST', url, response, result, {});
  assert.equal(response.status, 200);
  assert.equal(result.code, 400);
  assert.match(result.message, /用户名/);
  assert.match(result.message, /密码/);
});

test(`unknown test identity receives a generic login rejection (${runId})`, async () => {
  const url = new URL('/api/auth/login', gatewayUrl);
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      username: `plm2-invalid-${runId}`,
      password: 'invalid-test-only',
    }),
    redirect: 'manual',
    signal: AbortSignal.timeout(5000),
  });
  const result = await response.json();
  recordEvidence('unknown-user-login', 'POST', url, response, result, {
    username: '<random-invalid-test-user>',
    password: '[REDACTED]',
  });
  assert.equal(response.status, 200);
  assert.equal(result.code, 401);
  assert.equal(result.message, '用户名或密码错误');
});
