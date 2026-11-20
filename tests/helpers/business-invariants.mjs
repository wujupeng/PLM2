import assert from 'node:assert/strict';

export function assertInventoryConservation({
  opening,
  receipts = 0,
  returns = 0,
  transfersIn = 0,
  issues = 0,
  supplierReturns = 0,
  transfersOut = 0,
  approvedAdjustments = 0,
  closing,
  context,
}) {
  const quantities = {
    opening,
    receipts,
    returns,
    transfersIn,
    issues,
    supplierReturns,
    transfersOut,
    approvedAdjustments,
    closing,
  };
  for (const [name, value] of Object.entries(quantities)) {
    assert.ok(Number.isFinite(value), `${context}: ${name} must be finite`);
  }
  const expected =
    opening + receipts + returns + transfersIn - issues - supplierReturns - transfersOut + approvedAdjustments;
  assert.equal(closing, expected, `${context}: expected closing quantity ${expected}, got ${closing}`);
}

export function assertAuditedStateTransition(event, expected) {
  assert.equal(event.previousState, expected.previousState);
  assert.equal(event.action, expected.action);
  assert.equal(event.currentState, expected.currentState);
  assert.equal(event.actor, expected.actor);
  assert.ok(Number.isFinite(Date.parse(event.occurredAt)), 'transition timestamp must be valid');
  assert.ok(event.businessDocumentId, 'transition must reference its business document');
  assert.ok(event.auditRecordId, 'transition must reference its audit record');
}
