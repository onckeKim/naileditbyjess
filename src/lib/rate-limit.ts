import "server-only";
import type { NextRequest } from "next/server";

type Bucket = { count: number; resetAt: number };

// Best-effort, single-instance in-memory limiter. On serverless platforms
// that spin up multiple isolated instances (or recycle instances between
// invocations), this state isn't shared, so it under-protects rather than
// over-blocks — acceptable for basic abuse deterrence, but a real
// production deployment under heavy traffic should move this to a shared
// store (e.g. Upstash Redis) instead.
const buckets = new Map<string, Bucket>();

// Periodically drop expired buckets so this map can't grow unbounded.
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt < now) buckets.delete(key);
  }
}, 5 * 60 * 1000).unref?.();

export function clientIp(req: NextRequest) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

/** Returns { allowed, retryAfterSeconds } for a fixed-window limit of `max` requests per `windowMs` under `key`. */
export function rateLimit(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (bucket.count >= max) {
    return { allowed: false, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  bucket.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}
