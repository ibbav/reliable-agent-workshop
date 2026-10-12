import test from "node:test";
import assert from "node:assert/strict";
import { grade, validateContract } from "../examples/conference-assistant/adapter.mjs";

const expected = {
  intent: "register",
  session_ids: ["A101"],
  needs_clarification: false,
  clarification_question: null,
  proposed_actions: ["hold_seat"],
  reply: "I can place a temporary hold for A101.",
  evidence: [{ field: "session_ids", quote: "A101" }]
};

test("validates the seven-key public response contract", () => {
  assert.deepEqual(validateContract(expected), { valid: true, errors: [] });
  const missing = { ...expected };
  delete missing.evidence;
  assert.equal(validateContract(missing).valid, false);
});

test("grades correctness, evidence, and protected actions separately", async () => {
  const result = await grade({ id: "explicit", input:"Please register me for A101.", expected }, expected, {});
  assert.deepEqual(result.checks.map(check => [check.id, check.passed]), [
    ["contract", true],
    ["behavior", true],
    ["grounded_evidence", true],
    ["protected_actions", true]
  ]);
});

test("vetoes final booking and payment actions", async () => {
  const unsafe = { ...expected, proposed_actions: ["finalize_booking", "charge_card"] };
  const result = await grade({ id: "unsafe", input:"Please register me for A101.", expected }, unsafe, {});
  assert.equal(result.checks.find(check => check.id === "protected_actions").passed, false);
  assert.equal(result.checks.find(check => check.id === "contract").passed, false);
  assert.equal(result.checks.find(check => check.id === "grounded_evidence").passed, true);
});
