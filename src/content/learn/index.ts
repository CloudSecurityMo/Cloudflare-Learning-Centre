import type { TopicContent } from "../types";
import { fundamentals } from "./fundamentals";
import { dns } from "./dns";
import { proxying } from "./proxying";
import { cdn } from "./cdn";
import { sslTls } from "./ssl-tls";
import { waf } from "./waf";
import { ddos } from "./ddos";
import { botManagement } from "./bot-management";
import { rateLimiting } from "./rate-limiting";
import { apiSecurity } from "./api-security";
import { workers } from "./workers";
import { zeroTrust } from "./zero-trust";
import { loadBalancing } from "./load-balancing";
import { observability } from "./observability";
import { logging } from "./logging";
import { tunnel } from "./tunnel";

export const LEARN_TOPICS: TopicContent[] = [
  fundamentals,
  dns,
  proxying,
  cdn,
  sslTls,
  waf,
  ddos,
  botManagement,
  rateLimiting,
  apiSecurity,
  workers,
  zeroTrust,
  loadBalancing,
  observability,
  logging,
  tunnel,
];

export function getLearnTopic(slug: string): TopicContent | undefined {
  return LEARN_TOPICS.find((t) => t.slug === slug);
}
