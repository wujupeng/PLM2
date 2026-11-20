#!/usr/bin/env node

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { assertAllowedTarget } from '../tests/helpers/allowed-target.cjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const seed = JSON.parse(await readFile(path.join(root, 'test-data/org.json'), 'utf8'));
const accounts = JSON.parse(await readFile(path.join(root, 'test-data/accounts.example.json'), 'utf8'));
const systemUrl = assertAllowedTarget(process.env.PLM_TEST_SYSTEM_URL ?? 'http://localhost:8082', 'system target');
const runId = process.env.PLM_TEST_RUN_ID;
assert.ok(runId, 'Set PLM_TEST_RUN_ID to the run used by provision-dev.mjs.');
const runSuffix = runId.replace(/[^A-Za-z0-9]/g, '').slice(-16);
const adminUsername = process.env.PLM_PROVISIONER_USERNAME;
const adminPassword = process.env.PLM_PROVISIONER_PASSWORD;
assert.ok(adminUsername && adminPassword, 'Set PLM_PROVISIONER_USERNAME and PLM_PROVISIONER_PASSWORD locally.');

const permissionsByUser = {
  admin_qk: [
    'system:user:list', 'system:org:list', 'system:role:list',
    'system:dict:list', 'system:config:list', 'system:audit:list',
  ],
  chenzong: [
    'dashboard', 'platform:report:dashboard:list', 'oa:instance:list', 'oa:task:list', 'oa:task:approve',
    'erp:sales:order:list', 'erp:purchase:order:list',
  ],
  zhangsan: [
    'product:list', 'material:list', 'bom:list', 'erp:base:customer:list',
    'erp:sales:order:list', 'erp:sales:order:manage',
    'erp:sales:delivery:list', 'erp:sales:delivery:manage',
    'oa:process:list', 'oa:instance:start', 'oa:task:list', 'oa:mail:list', 'oa:mail:send',
  ],
  lisi: [
    'erp:sales:order:list', 'erp:sales:delivery:list',
    'oa:instance:list', 'oa:task:list', 'oa:task:approve', 'oa:mail:list',
  ],
  wangwu: [
    'erp:base:supplier:list',
    'erp:purchase:requisition:list', 'erp:purchase:requisition:manage',
    'erp:purchase:inquiry:list', 'erp:purchase:inquiry:manage',
    'erp:purchase:order:list', 'erp:purchase:order:manage',
    'srm:sourcing:request:list', 'srm:sourcing:request:manage',
    'oa:task:list', 'oa:mail:list',
  ],
  zhaoliu: [
    'erp:purchase:requisition:list', 'erp:purchase:inquiry:list', 'erp:purchase:order:list',
    'oa:instance:list', 'oa:task:list', 'oa:task:approve', 'oa:mail:list',
  ],
  qianqi: [
    'product:list', 'product:create', 'product:update',
    'material:list', 'material:create', 'material:update',
    'bom:list', 'bom:create', 'bom:update', 'bom:validate',
    'spec:list', 'spec:create', 'spec:update',
    'doc:list', 'doc:create', 'doc:update', 'doc:submit',
  ],
  sunba: [
    'product:list', 'material:list',
    'bom:list', 'bom:validate', 'bom:publish',
    'spec:list', 'spec:release',
    'doc:list', 'doc:review', 'doc:release',
    'eco:list', 'eco:review', 'eco:approve',
    'oa:task:list',
  ],
  zhoujiu: [
    'material:list', 'bom:list', 'erp:inventory:balance:list',
    'erp:demand-plan:plan:list', 'erp:demand-plan:plan:manage',
    'erp:demand-plan:mrprun:list', 'erp:demand-plan:mrprun:manage',
    'erp:demand-plan:netreq:list', 'erp:demand-plan:netreq:manage',
    'erp:demand-plan:purchasesuggestion:list', 'erp:demand-plan:purchasesuggestion:manage',
    'erp:demand-plan:productionsuggestion:list', 'erp:demand-plan:productionsuggestion:manage',
    'erp:production:order:list', 'erp:production:order:manage', 'oa:task:list',
  ],
  wushi: [
    'erp:production:order:list', 'erp:production:issue:list', 'erp:production:issue:manage',
    'erp:production:receipt:list', 'erp:production:receipt:manage',
    'mes:plan:order:list', 'mes:plan:schedule:list',
    'mes:plan:dispatch:list', 'mes:plan:dispatch:manage',
    'mes:report:work:list', 'mes:report:work:manage',
  ],
  zhengyi: [
    'quality:list', 'quality:create', 'quality:update', 'quality:action', 'quality:close',
    'erp:purchase:inspection:list', 'erp:purchase:inspection:manage',
    'srm:quality:iqc:list', 'srm:quality:iqc:manage',
    'mes:quality:incoming:list', 'mes:quality:incoming:manage',
    'mes:quality:final:list', 'mes:quality:final:manage',
    'mes:quality:judge:list', 'mes:quality:judge:manage',
    'mes:quality:quarantine:list', 'mes:quality:quarantine:manage',
  ],
  wanger: [
    'wms:base:warehouse:list', 'wms:base:bin:list', 'wms:location:list',
    'wms:inbound:receipt:list', 'wms:inbound:receipt:manage',
    'wms:inbound:putaway:list', 'wms:inbound:putaway:manage',
    'wms:inventory:batch:list', 'wms:inventory:batch:manage',
    'wms:inventory:serial:list', 'wms:inventory:serial:manage',
    'wms:pick:task:list', 'wms:pick:task:manage',
    'wms:outbound:finished:list', 'wms:outbound:finished:manage',
    'wms:outbound:shipment:list', 'wms:outbound:shipment:manage',
    'erp:inventory:balance:list', 'erp:inventory:transaction:list',
  ],
  fengsan: [
    'erp:finance:period:list', 'erp:finance:voucher:list', 'erp:finance:voucher:manage',
    'erp:finance:receivable:list', 'erp:finance:receivable:manage',
    'erp:finance:payable:list', 'erp:finance:payable:manage',
    'erp:finance:invoice:list', 'erp:finance:invoice:manage',
    'erp:finance:cost-collection:list', 'erp:finance:cost-collection:manage',
    'erp:sales:order:list', 'erp:purchase:order:list', 'erp:inventory:cost:list',
  ],
};

const allowedPathByUser = {
  admin_qk: '/system/organizations/tree',
  chenzong: '/oa/tasks/todo',
  zhangsan: '/erp/sales/orders?pageNum=1&pageSize=1',
  lisi: '/oa/tasks/todo',
  wangwu: '/erp/purchase/orders?pageNum=1&pageSize=1',
  zhaoliu: '/erp/purchase/orders?pageNum=1&pageSize=1',
  qianqi: '/bom/boms?pageNum=1&pageSize=1',
  sunba: '/bom/boms?pageNum=1&pageSize=1',
  zhoujiu: '/erp/demand-plan/plans?pageNum=1&pageSize=1',
  wushi: '/mes/plan/dispatches?pageNum=1&pageSize=1',
  zhengyi: '/quality/issues?pageNum=1&pageSize=1',
  wanger: '/wms/inbound/receipts?pageNum=1&pageSize=1',
  fengsan: '/erp/finance/receivables?pageNum=1&pageSize=1',
};

assert.deepEqual(
  Object.keys(permissionsByUser).sort(),
  seed.employees.filter(({ username }) => username !== 'guest_qk').map(({ username }) => username).sort(),
  'Every named test employee must have exactly one explicit permission set.',
);

function parseJsonPreservingLongIntegers(text) {
  return JSON.parse(text.replace(
    /("(?:\\.|[^"\\])*")|(-?\d{16,})(?=[\s,}\]])/g,
    (match, jsonString, integer) => jsonString ?? `"${integer}"`,
  ));
}

async function rawRequest(endpoint, { method = 'GET', token, body } = {}) {
  const target = process.env.PLM_TEST_USE_SYSTEM_DIRECT === 'true'
    ? endpoint.replace(/^\/api(?=\/)/, '')
    : endpoint;
  const response = await fetch(new URL(target, systemUrl), {
    method,
    redirect: 'manual',
    headers: {
      ...(body === undefined ? {} : { 'content-type': 'application/json' }),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(10000),
  });
  const payload = parseJsonPreservingLongIntegers(await response.text());
  return { response, payload };
}

async function request(endpoint, options = {}) {
  const { response, payload } = await rawRequest(endpoint, options);
  assert.equal(response.status, 200, `${options.method ?? 'GET'} ${endpoint}: HTTP ${response.status}`);
  assert.equal(payload.code, 200, `${options.method ?? 'GET'} ${endpoint}: ${payload.message ?? 'API failure'}`);
  return payload.data;
}

const admin = await request('/api/auth/login', {
  method: 'POST',
  body: { username: adminUsername, password: adminPassword },
});
assert.ok(admin?.accessToken, 'Provisioning account did not receive an access token.');
const roleOptions = await request('/system/roles/options', { token: admin.accessToken });
const rolesByName = new Map(
  roleOptions
    .filter((role) => role.roleCode.startsWith(`${runSuffix}-`))
    .map((role) => [role.roleName, role]),
);
assert.equal(rolesByName.size, seed.employees.length, 'Expected one run-scoped role for every test employee.');
const permissions = await request('/system/permissions', { token: admin.accessToken });
const permissionIds = new Map(permissions.map(({ id, permissionCode }) => [permissionCode, id]));

for (const employee of seed.employees) {
  const role = rolesByName.get(employee.role);
  assert.ok(role, `Provisioned role not found: ${employee.role}`);
  const codes = permissionsByUser[employee.username] ?? [];
  const missingCodes = codes.filter((code) => !permissionIds.has(code));
  assert.deepEqual(missingCodes, [], `Permission code(s) not found for ${employee.role}`);
  const ids = codes.map((code) => permissionIds.get(code));
  await request(`/system/roles/${role.id}/permissions`, {
    method: 'PUT',
    token: admin.accessToken,
    body: { permissionIds: ids },
  });
  const assignedIds = await request(`/system/roles/${role.id}/permissions`, { token: admin.accessToken });
  assert.deepEqual(
    assignedIds.map(String).sort(),
    ids.map(String).sort(),
    `Permission assignment mismatch for ${employee.role}`,
  );
}

const accountPasswords = new Map(accounts.accounts.map(({ username, passwordEnv }) => [
  username,
  process.env[passwordEnv] ?? process.env.PLM_TEST_DEFAULT_PASSWORD,
]));
for (const employee of seed.employees) {
  const accountUsername = `${employee.username}_${runSuffix}`;
  const password = accountPasswords.get(employee.username);
  assert.ok(password, `No local password configured for ${employee.username}.`);
  const login = await request('/api/auth/login', {
    method: 'POST',
    body: { username: accountUsername, password },
  });
  assert.equal(login?.userInfo?.username, accountUsername, `Login identity mismatch for ${accountUsername}.`);

  const token = login.accessToken;
  const allowedPath = allowedPathByUser[employee.username];
  if (allowedPath) {
    const allowed = await rawRequest(allowedPath, { token });
    assert.equal(allowed.response.status, 200, `${employee.username} allowed API HTTP status`);
    assert.equal(allowed.payload.code, 200, `${employee.username} must read ${allowedPath}`);
  }
  const deniedPath = employee.username === 'admin_qk'
    ? '/erp/sales/orders?pageNum=1&pageSize=1'
    : '/system/users?pageNum=1&pageSize=1';
  const denied = await rawRequest(deniedPath, { token });
  assert.ok(
    denied.response.status === 403 || (denied.response.status === 200 && denied.payload.code === 403),
    `${employee.username} must be denied ${deniedPath}; received HTTP ${denied.response.status}, API ${denied.payload.code}`,
  );
}

console.log(`Assigned and read back v1 permissions for ${Object.keys(permissionsByUser).length} roles; all ${seed.employees.length} test accounts logged in.`);
