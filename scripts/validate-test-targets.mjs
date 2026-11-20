#!/usr/bin/env node

import { assertAllowedTarget, assertConfiguredTestTargets } from '../tests/helpers/allowed-target.cjs';

assertConfiguredTestTargets();
for (const port of [3000, 8080, 8082]) {
  assertAllowedTarget(`http://127.0.0.1:${port}`, `loopback service port ${port}`);
}

console.log('All configured test targets match test-data/allowed-hosts.json.');
