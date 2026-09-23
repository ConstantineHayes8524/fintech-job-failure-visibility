import assert from "node:assert/strict";
import { decideAction, paymentEvent } from "./job_visibility.js";

const highRisk = paymentEvent.parse({ job: "settle", paymentId: "p1", amountCents: 100000, currency: "USD", status: "failed" });
assert.equal(decideAction(highRisk), "page");
const routine = paymentEvent.parse({ job: "settle", paymentId: "p2", amountCents: 900, currency: "USD", status: "failed" });
assert.equal(decideAction(routine), "notify");
assert.equal(decideAction({ ...routine, status: "succeeded" }), "ignore");
console.log("job decision test passed");
