export interface RateLimitConfig {
  thresholdRequests: number;
  periodSeconds: number;
  legitimateBurst: number; // requests a real user's flaky retry/SPA burst sends in the period
  attackRate: number; // requests/period an attacker's script sends
}

export interface RateLimitResult {
  legitimateBlocked: boolean;
  attackBlocked: boolean;
  verdict: "balanced" | "too-strict" | "too-loose" | "both-wrong";
  headline: string;
  explanation: string;
}

export function evaluateRateLimit(cfg: RateLimitConfig): RateLimitResult {
  const legitimateBlocked = cfg.legitimateBurst > cfg.thresholdRequests;
  const attackBlocked = cfg.attackRate > cfg.thresholdRequests;

  if (!legitimateBlocked && attackBlocked) {
    return {
      legitimateBlocked,
      attackBlocked,
      verdict: "balanced",
      headline: "Well-tuned",
      explanation: `At ${cfg.thresholdRequests} requests per ${cfg.periodSeconds}s, the legitimate burst (${cfg.legitimateBurst}) stays under the threshold while the attack traffic (${cfg.attackRate}) is stopped. This is the goal: catch the abuse, leave real users alone.`,
    };
  }

  if (legitimateBlocked && attackBlocked) {
    return {
      legitimateBlocked,
      attackBlocked,
      verdict: "too-strict",
      headline: "Too strict — real users get caught too",
      explanation: `The threshold (${cfg.thresholdRequests}/${cfg.periodSeconds}s) is low enough that a normal retry burst (${cfg.legitimateBurst} requests) also trips it. The attack is stopped, but so are legitimate users on flaky connections or SPA double-submits. Raise the threshold, or key by something more precise than a shared IP.`,
    };
  }

  if (!legitimateBlocked && !attackBlocked) {
    return {
      legitimateBlocked,
      attackBlocked,
      verdict: "too-loose",
      headline: "Too loose — the attack gets through",
      explanation: `The threshold (${cfg.thresholdRequests}/${cfg.periodSeconds}s) is high enough that both the legitimate burst and the attack traffic (${cfg.attackRate}/${cfg.periodSeconds}s) stay under it. Real users are unaffected, but this rule isn't actually stopping the abuse it was meant to catch. Lower the threshold, or add a second, tighter rule.`,
    };
  }

  // legitimateBlocked && !attackBlocked: the worst combination. This happens
  // when the attacker deliberately keeps their rate low and slow — below the
  // threshold — while a normal user's retry burst is, ironically, higher.
  return {
    legitimateBlocked,
    attackBlocked,
    verdict: "both-wrong",
    headline: "Worst case — blocks real users AND misses the attack",
    explanation: `A low-and-slow attacker sending ${cfg.attackRate} requests per ${cfg.periodSeconds}s stays under the ${cfg.thresholdRequests}-request threshold entirely, while a legitimate burst of ${cfg.legitimateBurst} trips it. Volume-based rate limiting alone can't fix this — it needs pairing with Bot Management (to catch the attacker by behavior/identity, not volume) and a key more precise than raw IP (to stop penalizing shared-IP legitimate users).`,
  };
}
