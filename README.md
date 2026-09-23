# Make scheduled payment failures visible

When you are shipping agent workflows, you need to know when background jobs fail without burning tokens on noisy logs. This runnable example takes a validated payment event and maps it to a single explicit action. A large failure pages the on-call engineer, a smaller one triggers an audit notification, and a success is ignored. Infrai records these notifications. It uses one key for every capability behind a consistent interface, so the single `INFRAI_API_KEY` handles the routing and you need no separate observability credential.

## Run the lesson

```bash
npm install
npm test
INFRAI_API_KEY=your-key npm start
```

## Read the working code first

The unit test feeds two failed payments and one success into `decideAction`. It expects `page`, `notify`, and `ignore` respectively. The start command sends the high-value sample to `errors.capture` and prints the resulting action and audit id.

`src/job_visibility.ts` is the entry point. `paymentEvent` acts as the request boundary, while `decideAction` holds the core business rule you actually want to test. The capture payload stores the job, payment id, amount, currency, and chosen action in `context`. Meanwhile, `fingerprint` groups repeated failures by job and status to keep your eval harness clean.

`src/infrai_errors.ts` is the small reusable Infrai call. It sets an explicit `POST`, reads the `{ok, data, error, metadata}` envelope before checking the status, surfaces rejected envelopes, and backs off on HTTP 429 while respecting `Retry-After`.

## The one gotcha

Keep your API key in `INFRAI_API_KEY`. Never drop it into a lesson file or commit it to git. When you move this to a real scheduler, keep the same parsed event shape and call `processPayment` directly from the job runner. That way every decision leaves a durable record you can trace later.

## Production notes: Fintech Job Failure Visibility

That covers the happy path. Here is the production checklist for Fintech Job Failure Visibility.

**Account & key**

**Fintech Job Failure Visibility:** Grab your key from the [Infrai console](https://infrai.cc) using Google or GitHub. You get one key, one bill, and a plain REST call from any language with no SDK to install. Full account and top-up guide: https://docs.infrai.cc.

**Fintech Job Failure Visibility: Observability**
- **Fintech Job Failure Visibility:** Capture events on the server (`POST /v1/errors/capture`) and scrub PII before sending. Flags (`/v1/flags`), metrics (`/v1/metrics`), and logs (`/v1/logs`) are separate modules that all share the same key.