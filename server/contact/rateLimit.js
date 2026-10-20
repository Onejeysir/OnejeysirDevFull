// Limitation de fréquence par IP.
// - Si UPSTASH_REDIS_REST_URL et UPSTASH_REDIS_REST_TOKEN sont définis : compteur partagé (fiable en serverless).
// - Sinon : mémoire de l'instance (protection de base, réinitialisée à chaque démarrage à froid).
const memory = new Map();

export async function rateLimit(key, { limit = 5, windowSec = 600, env = process.env, fetchImpl = globalThis.fetch } = {}) {
  const url = env.UPSTASH_REDIS_REST_URL;
  const token = env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    try {
      const res = await fetchImpl(`${url.replace(/\/$/, "")}/multi-exec`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify([["INCR", `contact:${key}`], ["EXPIRE", `contact:${key}`, String(windowSec), "NX"]]),
      });
      const data = await res.json();
      const count = Number(data?.[0]?.result ?? 0);
      return { ok: count <= limit, remaining: Math.max(0, limit - count) };
    } catch {
      // en cas de panne du stockage, on bascule sur la mémoire locale
    }
  }
  const now = Date.now();
  const entry = memory.get(key);
  if (!entry || entry.reset < now) {
    memory.set(key, { count: 1, reset: now + windowSec * 1000 });
    return { ok: true, remaining: limit - 1 };
  }
  entry.count += 1;
  if (memory.size > 5000) for (const [k, v] of memory) if (v.reset < now) memory.delete(k);
  return { ok: entry.count <= limit, remaining: Math.max(0, limit - entry.count) };
}

export const _resetMemory = () => memory.clear();
