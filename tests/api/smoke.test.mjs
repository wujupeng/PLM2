import assert from 'node:assert/strict';
import { test } from 'node:test';

const runId = process.env.PLM_TEST_RUN_ID ?? 'manual';
const systemUrl = localServiceUrl('PLM_TEST_SYSTEM_URL', 'http://127.0.0.1:8082');
const gatewayUrl = localServiceUrl('PLM_TEST_GATEWAY_URL', 'http://127.0.0.1:8080');
const frontendUrl = localServiceUrl('PLM_TEST_FRONTEND_URL', 'http://127.0.0.1:3000');

function localServiceUrl(variable, fallback) {
  const url = new URL(process.env[variable] ?? fallback);
  assert.ok(
    ['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname),
    `${variable} must target a local development service`,
  );
  return url;
}

async function get(url) {
  return fetch(url, { signal: AbortSignal.timeout(5000) });
}

test(`system service health is UP (${runId})`, async () => {
  const response = await get(new URL('/actuator/health', systemUrl));
  assert.equal(response.status, 200);
  const health = await response.json();
  assert.equal(health.status, 'UP');
  assert.equal(health.components?.db?.status, 'UP');
});

test(`gateway health is UP (${runId})`, async () => {
  const response = await get(new URL('/actuator/health', gatewayUrl));
  assert.equal(response.status, 200);
  const health = await response.json();
  assert.equal(health.status, 'UP');
});

test(`frontend serves the Chinese application shell (${runId})`, async () => {
  const response = await get(frontendUrl);
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type') ?? '', /text\/html/i);
  const html = await response.text();
  assert.match(html, /<html lang="zh-CN">/);
  assert.match(html, /<div id="root"><\/div>/);
});

test(`anonymous API access is rejected (${runId})`, async () => {
  const response = await get(new URL('/api/auth/me', gatewayUrl));
  assert.equal(response.status, 401);
});

test(`empty login input returns validation errors in Chinese (${runId})`, async () => {
  const response = await fetch(new URL('/api/auth/login', gatewayUrl), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: '{}',
    signal: AbortSignal.timeout(5000),
  });
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.code, 400);
  assert.match(result.message, /用户名/);
  assert.match(result.message, /密码/);
});
