const { readFileSync } = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const config = JSON.parse(readFileSync(path.resolve(root, 'test-data/allowed-hosts.json'), 'utf8'));

function assertAllowedTarget(value, name = 'test target') {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${name} must be a valid URL.`);
  }
  if (
    url.protocol !== 'http:' ||
    !config.allowedLoopbackHosts.includes(url.hostname) ||
    url.username ||
    url.password ||
    !config.allowedOrigins.includes(url.origin)
  ) {
    throw new Error(`${name} is not an allowed test origin: ${url.origin}`);
  }
  return url;
}

function assertConfiguredTestTargets(defaultHost = '127.0.0.1') {
  const targets = {
    frontend: process.env.PLM_TEST_FRONTEND_URL ?? `http://${defaultHost}:3000`,
    gateway: process.env.PLM_TEST_GATEWAY_URL ?? `http://${defaultHost}:8080`,
    system: process.env.PLM_TEST_SYSTEM_URL ?? `http://${defaultHost}:8082`,
  };
  for (const [name, url] of Object.entries(targets)) {
    targets[name] = assertAllowedTarget(url, `${name} target`);
  }
  return targets;
}

module.exports = { assertAllowedTarget, assertConfiguredTestTargets };
