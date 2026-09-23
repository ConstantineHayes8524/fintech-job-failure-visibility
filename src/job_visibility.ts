import { z } from "zod";
import { captureFailure } from "./infrai_errors.js";

export const paymentEvent = z.object({
  job: z.string().min(1),
  paymentId: z.string().min(1),
  amountCents: z.number().int().nonnegative(),
  currency: z.string().length(3),
  status: z.enum(["succeeded", "failed"]),
  reason: z.string().optional()
});
export type PaymentEvent = z.infer<typeof paymentEvent>;

export function decideAction(event: PaymentEvent): "page" | "notify" | "ignore" {
  if (event.status === "succeeded") return "ignore";
  return event.amountCents >= 100_000 ? "page" : "notify";
}

export async function processPayment(raw: unknown): Promise<{ action: string; auditId: string }> {
  const event = paymentEvent.parse(raw);
  const action = decideAction(event);
  if (action !== "ignore") {
    const result = await captureFailure({
      title: `${event.job} payment failed`,
      message: event.reason ?? "Payment provider rejected the event",
      level: action === "page" ? "error" : "warning",
      fingerprint: [event.job, event.status],
      exception: JSON.stringify(event),
      context: { paymentId: event.paymentId, amountCents: event.amountCents, currency: event.currency, action }
    });
    return { action, auditId: String((result as { event_id?: string } | undefined)?.event_id ?? event.paymentId) };
  }
  return { action, auditId: event.paymentId };
}

if (process.argv[1]?.endsWith("job_visibility.ts")) {
  const sample = { job: "settle-card-payments", paymentId: "pay_2048", amountCents: 125000, currency: "USD", status: "failed", reason: "issuer_declined" };
  processPayment(sample).then((outcome) => console.log(JSON.stringify(outcome))).catch((error) => { console.error(error.message); process.exitCode = 1; });
}
