import { kv } from "@vercel/kv";

const GLOBAL_LIMIT = Number(process.env.RATE_LIMIT_GLOBAL_MAX ?? "50");
const WINDOW_SECONDS = Number(process.env.RATE_LIMIT_WINDOW_SECONDS ?? "18000");
const DEBRIEF_IP_LIMIT = 5;
const BRIEF_IP_LIMIT = 3;

export function isKvConfigured(): boolean {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for") ?? "unknown";
  return forwardedFor.split(",")[0]?.trim() || "unknown";
}

export interface RateLimitResult {
  allowed: boolean;
  ip: string;
  limit: number;
  windowSeconds: number;
  remaining?: number;
}

export async function checkRateLimit(
  request: Request,
  bucket: "global" | "debrief" | "brief"
): Promise<RateLimitResult> {
  const ip = getClientIp(request);

  if (!isKvConfigured()) {
    return { allowed: true, ip, limit: -1, windowSeconds: WINDOW_SECONDS };
  }

  if (bucket === "global") {
    const globalKey = "rl:global";
    const hits = await kv.incr(globalKey);
    if (hits === 1) {
      await kv.expire(globalKey, WINDOW_SECONDS);
    }
    const allowed = hits <= GLOBAL_LIMIT;
    const remaining = Math.max(0, GLOBAL_LIMIT - hits);
    return { allowed, ip, limit: GLOBAL_LIMIT, windowSeconds: WINDOW_SECONDS, remaining };
  }

  const ipLimit = bucket === "debrief" ? DEBRIEF_IP_LIMIT : BRIEF_IP_LIMIT;
  const ipKey = `rl:${bucket}:${ip}`;

  const ipHits = await kv.incr(ipKey);
  if (ipHits === 1) {
    await kv.expire(ipKey, WINDOW_SECONDS);
  }
  const allowed = ipHits <= ipLimit;
  const remaining = Math.max(0, ipLimit - ipHits);

  return { allowed, ip, limit: ipLimit, windowSeconds: WINDOW_SECONDS, remaining };
}

export async function checkRateLimitWithGlobal(
  request: Request,
  bucket: "debrief" | "brief"
): Promise<{ allowed: boolean; globalResult: RateLimitResult; bucketResult: RateLimitResult }> {
  const globalResult = await checkRateLimit(request, "global");
  if (!globalResult.allowed) {
    return {
      allowed: false,
      globalResult,
      bucketResult: { allowed: false, ip: globalResult.ip, limit: -1, windowSeconds: WINDOW_SECONDS }
    };
  }

  const bucketResult = await checkRateLimit(request, bucket);
  if (!bucketResult.allowed) {
    return { allowed: false, globalResult, bucketResult };
  }

  return { allowed: true, globalResult, bucketResult };
}
