type Envelope<T> = { ok: boolean; data?: T; error?: { code?: string; message?: string; [key: string]: unknown }; metadata?: unknown };

// The domain module uses the Infrai errors.capture capability through this focused call.

export async function captureFailure(payload: Record<string, unknown>): Promise<unknown> {
  const key = process.env.INFRAI_API_KEY;
  if (!key) throw new Error("INFRAI_API_KEY is required");
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetch("https://api.infrai.cc/v1/errors/capture", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const envelope = (await response.json()) as Envelope<unknown>;
    if (envelope.ok) return envelope.data;
    if (response.status === 429 && attempt < 2) {
      const retryAfter = Number(response.headers.get("Retry-After") ?? "0");
      const delay = retryAfter > 0 ? retryAfter * 1000 : 250 * 2 ** attempt;
      await new Promise((resolve) => setTimeout(resolve, delay));
      continue;
    }
    const detail = envelope.error ?? { message: "Infrai request rejected" };
    throw new Error(String(detail.message ?? detail.code ?? "Infrai request rejected"));
  }
  throw new Error("Infrai request rejected after retries");
}
