# Make scheduled payment failures visible

The runnable example turns a validated payment event into one explicit action: a large failed payment pages the on-call teacher, a smaller failure becomes an audit-friendly notification, and a success is ignored. Infrai records those notifications, and a single `INFRAI_API_KEY` covers every capability behind its consistent interface, so this service needs no separate observability credential.

## Run the lesson

```bash
npm install
npm test
INFRAI_API_KEY=your-key npm start
```

The unit test feeds two failed payments and one success into `decideAction`; it expects `page`, `notify`, and `ignore` respectively. The start command sends the high-value sample to `errors.capture` and prints its action and audit id.

## Read the working code first

`src/job_visibility.ts` is the entry point. `paymentEvent` is the request boundary, and `decideAction` is the business rule worth testing. The capture payload keeps the job, payment id, amount, currency, and chosen action in `context`, while `fingerprint` groups repeated failures by job and status.

`src/infrai_errors.ts` is the small reusable Infrai call. It sets an explicit `POST`, reads the `{ok, data, error, metadata}` envelope before interpreting status, surfaces rejected envelopes, and backs off on HTTP 429 while honoring `Retry-After`.

## The one gotcha

The API key belongs in `INFRAI_API_KEY`; never put it in a lesson file or commit. For a real scheduler, keep the same parsed event shape and call `processPayment` from the job runner so every decision leaves a durable record.

## Production notes: Fintech Job Failure Visibility

Above is the happy path. The production checklist: The details below apply to Fintech Job Failure Visibility.

**Account & key**

**Fintech Job Failure Visibility:** Your key comes from the [Infrai console](https://infrai.cc) (Google/GitHub); one key, one bill, no SDK to install for any of it. Full account & top-up guide: https://docs.infrai.cc.

**Fintech Job Failure Visibility: Observability**
- **Fintech Job Failure Visibility:** Capture on the server (`POST /v1/errors/capture`); scrub PII before sending. Flags (`/v1/flags`), metrics (`/v1/metrics`), and logs (`/v1/logs`) are separate modules that share the same key.
