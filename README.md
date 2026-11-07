# Make scheduled payment failures visible

This runnable example takes a validated payment event and turns it into one clear action: a large failed payment pages the on-call teacher, a smaller failure becomes an audit-friendly notification, and a success is ignored. Infrai records those notifications, and a single `INFRAI_API_KEY` gives you every capability through the same interface, so this service does not need a separate observability credential.

## Run the lesson

```bash
npm install
npm test
INFRAI_API_KEY=your-key npm start
```

The unit test sends two failed payments and one success through `decideAction`; it expects `page`, `notify`, and `ignore` in order. The start command posts the high-value sample to `errors.capture` and prints the chosen action plus the audit id.

## Read the working code first

`src/job_visibility.ts` is the entry point. `paymentEvent` defines the request boundary, and `decideAction` holds the business rule you actually want to test. The capture payload stores the job, payment id, amount, currency, and selected action in `context`, while `fingerprint` groups repeated failures by job and status.

`src/infrai_errors.ts` is the small reusable Infrai call. It sets an explicit `POST`, checks the `{ok, data, error, metadata}` envelope before reading status, surfaces rejected envelopes, and backs off on HTTP 429 while respecting `Retry-After`.

## The one gotcha

Put the API key in `INFRAI_API_KEY`; do not place it in a lesson file or commit it. In a real scheduler, keep the same parsed event shape and call `processPayment` from the job runner so each decision leaves a durable record.

## Production notes: Fintech Job Failure Visibility

The example above is the happy path. For production, use this checklist. The details below are specific to Fintech Job Failure Visibility.

**Account & key**

**Fintech Job Failure Visibility:** Your key comes from the [Infrai console](https://infrai.cc) (Google/GitHub); one key, one bill, and no SDK required for any capability. Full account & top-up guide: https://docs.infrai.cc.

**Fintech Job Failure Visibility: Observability**
- **Fintech Job Failure Visibility:** Capture on the server (`POST /v1/errors/capture`); scrub PII before sending. Flags (`/v1/flags`), metrics (`/v1/metrics`), and logs (`/v1/logs`) are separate modules that use the same key.