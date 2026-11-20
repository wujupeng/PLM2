import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const seed = JSON.parse(await readFile(path.join(root, 'test-data/org.json'), 'utf8'));
const accounts = JSON.parse(await readFile(path.join(root, 'test-data/accounts.example.json'), 'utf8'));
const gatewayUrl = new URL(process.env.PLM_TEST_GATEWAY_URL ?? 'http://127.0.0.1:8080');
const systemUrl = new URL(process.env.PLM_TEST_SYSTEM_URL ?? 'http://127.0.0.1:8082');
const runId = process.env.PLM_TEST_RUN_ID ?? `PLM2-${new Date().toISOString().replace(/\D/g, '').slice(0, 12)}-${randomUUID().slice(0, 8)}`;
const runSuffix = runId.replace(/[^A-Za-z0-9]/g, '').slice(-16);
const adminUsername = process.env.PLM_PROVISIONER_USERNAME;
const adminPassword = process.env.PLM_PROVISIONER_PASSWORD;
const testPassword = process.env.PLM_TEST_DEFAULT_PASSWORD;

for (const [name, url] of [['gateway', gatewayUrl], ['system', systemUrl]]) {
  assert.ok(['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname), `${name} target must be local`);
}
assert.ok(adminUsername && adminPassword, 'Set PLM_PROVISIONER_USERNAME and PLM_PROVISIONER_PASSWORD locally.');
assert.ok(testPassword, 'Set PLM_TEST_DEFAULT_PASSWORD locally; never commit its value.');
assert.equal(seed.departments.length, 11, 'Expected exactly 11 departments.');
assert.equal(seed.employees.length, 14, 'Expected 13 named accounts plus guest_qk.');
assert.equal(accounts.accounts.length, 14, 'Credential template must cover every employee.');

const accountPasswordValues = new Map(
  accounts.accounts.map((account) => [
    account.username,
    process.env[account.passwordEnv] ?? testPassword,
  ]),
);
assert.ok([...accountPasswordValues.values()].every(Boolean), 'Every test account needs a local password value.');

const healthResponse = await fetch(new URL('/actuator/health', systemUrl), {
  signal: AbortSignal.timeout(5000),
});
assert.equal(healthResponse.status, 200, 'System service health must be available before provisioning.');
const health = await healthResponse.json();
assert.equal(health.status, 'UP');
assert.equal(health.components?.db?.details?.database, 'H2', 'Refusing to provision outside dev H2.');

async function request(base, endpoint, { method = 'GET', token, body } = {}) {
  const response = await fetch(new URL(endpoint, base), {
    method,
    headers: {
      ...(body === undefined ? {} : { 'content-type': 'application/json' }),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(10000),
  });
  const payload = await response.json();
  assert.equal(response.status, 200, `${method} ${endpoint} HTTP ${response.status}: ${payload.message ?? ''}`);
  assert.equal(payload.code, 200, `${method} ${endpoint}: ${payload.message ?? 'API failure'}`);
  return payload.data;
}

const login = await request(gatewayUrl, '/api/auth/login', {
  method: 'POST',
  body: { username: adminUsername, password: adminPassword },
});
assert.ok(login?.accessToken, 'Provisioning account did not receive an access token.');
const token = login.accessToken;

const companyId = await request(gatewayUrl, '/api/system/organizations', {
  method: 'POST',
  token,
  body: {
    orgCode: `${runSuffix}-QK-ROOT`,
    orgName: seed.company.name,
    parentId: 0,
    orgType: 'company',
    sortNo: 0,
    status: 1,
  },
});
assert.ok(companyId, 'Company organization was not created.');

const orgIds = new Map();
for (const department of seed.departments) {
  const parentId = department.parent === null ? companyId : orgIds.get(department.parent);
  assert.ok(parentId, `Missing parent department ${department.parent ?? seed.company.name}.`);
  const orgId = await request(gatewayUrl, '/api/system/organizations', {
    method: 'POST',
    token,
    body: {
      orgCode: `${runSuffix}-${department.code}`,
      orgName: department.name,
      parentId,
      orgType: 'department',
      sortNo: 0,
      status: 1,
    },
  });
  assert.ok(orgId, `Department ${department.name} was not created.`);
  orgIds.set(department.code, orgId);
  orgIds.set(department.name, orgId);
}

const organizationTree = await request(gatewayUrl, '/api/system/organizations/tree', { token });
const flatten = (nodes) => nodes.flatMap((node) => [node, ...flatten(node.children ?? [])]);
const organizations = flatten(organizationTree);
const companyNode = organizations.find((node) => node.orgCode === `${runSuffix}-QK-ROOT`);
assert.ok(companyNode, 'Created company was not returned by the organization tree.');
const departmentNodes = flatten(companyNode.children ?? []);
assert.equal(departmentNodes.length, 11, 'Organization tree must contain all 11 test departments.');
for (const department of seed.departments) {
  assert.ok(departmentNodes.some((node) => node.orgName === department.name), `Missing department ${department.name}.`);
}

const roleIds = new Map();
for (const employee of seed.employees) {
  if (roleIds.has(employee.role)) continue;
  const roleId = await request(gatewayUrl, '/api/system/roles', {
    method: 'POST',
    token,
    body: {
      roleCode: `${runSuffix}-${roleIds.size + 1}`,
      roleName: employee.role,
      dataScope: 'org',
      status: 1,
      remark: `Automated dev test role ${runId}`,
    },
  });
  assert.ok(roleId, `Role ${employee.role} was not created.`);
  roleIds.set(employee.role, roleId);
}

const provisioned = [];
for (const employee of seed.employees) {
  const account = accounts.accounts.find(({ username }) => username === employee.username);
  assert.ok(account, `Missing credential configuration for ${employee.username}.`);
  const username = `${employee.username}_${runSuffix}`;
  const userId = await request(gatewayUrl, '/api/system/users', {
    method: 'POST',
    token,
    body: {
      username,
      displayName: employee.name,
      password: accountPasswordValues.get(employee.username),
      orgId: orgIds.get(employee.department),
      status: 1,
      roleIds: [roleIds.get(employee.role)],
      remark: `${employee.title}; automated run ${runId}`,
    },
  });
  assert.ok(userId, `User ${username} was not created.`);
  provisioned.push({ ...employee, username, userId });
}

for (const account of provisioned) {
  const password = accountPasswordValues.get(account.username.replace(new RegExp(`_${runSuffix}$`), ''));
  const result = await request(gatewayUrl, '/api/auth/login', {
    method: 'POST',
    body: { username: account.username, password },
  });
  assert.ok(result?.accessToken, `Login failed for ${account.username}.`);
  assert.equal(result.userInfo?.username, account.username, `Login identity mismatch for ${account.username}.`);
}

console.log(JSON.stringify({ runId, companyId, departmentCount: orgIds.size / 2, accountCount: provisioned.length }, null, 2));
