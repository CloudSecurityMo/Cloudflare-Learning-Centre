# Cloudflare Architecture Lab

An independent, interactive lab for **Cloudflare architecture, security, and troubleshooting** — DNS,
proxying, WAF, TLS, Zero Trust, and everything in between — built around one question: **what happens to a
request from the browser all the way to the origin, and where does each Cloudflare capability sit in that
flow, and why?**

This is not a documentation mirror. It's a lab: a request decision engine you can manipulate field-by-field,
an origin inspector, an origin-protection lab, a WAF rule builder with Dashboard/Terraform/API views, an
architecture designer with a review mode, evidence-driven troubleshooting, and quizzes — all backed by
structured, versionable content rather than hardcoded prose, and cross-referenced against official Cloudflare
documentation rather than model prior knowledge or third-party guides.

## Running it

```bash
npm install
npm run dev
```

Open http://localhost:3000. Progress, notes, and quiz scores persist to `localStorage` — there's no backend
and no auth.

```bash
npm run build   # production build (statically prerenders every route)
npm run lint    # ESLint (flat config, Next.js + React Compiler rules)
```

## Architecture

- **Next.js 16 (App Router) + React 19 + TypeScript**, Tailwind CSS v4, shadcn/ui (Radix base, Nova preset).
- **React Flow** for the interactive architecture diagrams (Deployment Models).
- **Framer Motion** for the Request Decision Engine's stage-by-stage reveal.
- **Zustand + `persist`** for local progress tracking (completed topics, quiz attempts, lab/scenario
  completion, personal notes and open questions) — see `src/lib/progress.ts`. Uses `skipHydration` + an
  explicit `<ProgressHydrator>` in the root layout so a returning visitor's saved progress never causes an
  SSR hydration mismatch.
- **next-themes** for dark/light mode (dark is the default, matching the "engineering tool" aesthetic).

### Directory structure

```
src/
  app/                      Routes (App Router). Thin — pages compose content + components.
    learn/[slug]/           Generic renderer for every Learn module (data-driven)
    architecture/           Deployment Models, Security Layers, AWS/Azure/K8s, Reference Architectures
    labs/                   Request Decision Engine, WAF Rule Builder, TLS/DNS/Bot labs, Origin Inspector,
                             Origin Protection Lab, Product Decision Engine, Troubleshooting Academy,
                             Architecture Designer (Design + Review modes)
    reference/              Glossary, Knowledge Cards, HTTP status codes, CF error codes, DNS records
    scenarios/               Scenario Library
    progress/               Progress Tracker (every module/lab/scenario, one page)
  components/
    ui/                     shadcn/ui primitives
    layout/                 Sidebar nav + app shell
    diagrams/                ArchitectureFlow (React Flow wrapper), NodeDetailSheet, AsciiDiagram
    learn/                  TopicPage renderer, Quiz ("Test Yourself"), NotesPanel, MentalModelCard,
                             SourceVerification badge, LearningLevelBar (Understand/Apply/Architect)
    labs/                   One component per interactive lab
    home/                   Hero architecture + dashboard stats
  content/                  All educational content as typed data — see below
  lib/                      Simulation engines (request decision engine, TLS lab, WAF rule builder,
                             architecture designer, origin inspector, origin protection), nav config,
                             progress store
```

### Content system

Every Learn topic is a `TopicContent` object (`src/content/types.ts`): objectives, concept sections
(with optional ASCII diagrams), examples, common mistakes, troubleshooting cases (now with a
hypothesis-selection step and, where relevant, trade-off choices), a quiz, related topics, Mental Model
references, three-level (`applyLabHref`/`architectHref`) links, and `officialSources` — typed
`LearningSource[]` entries (title, url, sourceType) rendered as a "Content verified against official
Cloudflare documentation" badge with a last-verified date. All 16 Learn modules carry this metadata.

Topics live in `src/content/learn/*.ts` and are registered in `src/content/learn/index.ts` — the `[slug]`
route and every related-topic link resolve against that registry automatically.

**To add a new Learn module:**
1. Create `src/content/learn/my-topic.ts` exporting a `TopicContent` object, including `officialSources`
   pointing at real developers.cloudflare.com pages you've actually checked, and a `lastVerified` date.
2. Add it to the `LEARN_TOPICS` array in `src/content/learn/index.ts`.
3. Add a nav entry in `src/lib/nav.ts` pointing at `/learn/my-topic`.

No component changes needed — `TopicPage` renders any `TopicContent` generically.

The same pattern applies to `src/content/scenarios/`, `src/content/reference/` (glossary, knowledge cards,
codes), `src/content/architecture/deployment-models.ts` (diagram node/edge data), `src/content/nodes.ts`
(the shared "click a component → deep explanation" registry), `src/content/mental-models.ts` (the DNS vs
Proxy / CDN vs WAF / WAF vs DDoS / Bot vs Rate Limit / Tunnel vs VPN / Access vs Gateway / Origin vs Public
CA cert comparisons), `src/content/product-decisions.ts` (Product Decision Engine scenarios), and
`src/content/architecture-reviews.ts` (Architecture Review Mode scenarios).

### Simulation engines

- `src/lib/simulate-request.ts` — the **Request Decision Engine**. Takes method, hostname, protocol, path,
  query, body, country, source IP, User-Agent, a numeric bot score (1-99), and a request rate, and produces
  an 11-stage outcome (Browser → DNS → Edge → TLS → DDoS → Rate Limiting → WAF → Bot Management → Cache →
  Origin → Response) with per-stage evidence and "relevant logs" fields. Stage order mirrors Cloudflare's
  documented security phase order (Custom Rules → Rate Limiting → Managed Rules → Bot Fight Mode — Rate
  Limiting runs *before* Managed Rules, which surprises most people); the page explicitly labels this a
  "Conceptual request-processing model," not a guarantee of exact behavior for every plan/config.
- `src/lib/tls-lab.ts` — SSL/TLS mode × origin certificate state → outcome (including how 525/526 errors
  actually occur).
- `src/lib/waf-rule-builder.ts` — condition/operator/value → Cloudflare-style rules-language expression,
  plus illustrative Terraform (`cloudflare_ruleset`) and Rulesets API (`curl`) representations of the same
  rule, each explicitly labeled illustrative with a link to verify current syntax.
- `src/lib/architecture-designer.ts` — tag-based scoring across 9 categories (DNS, TLS, WAF, origin, cache,
  rate limiting, bot, API protection, logging/SIEM): each configuration choice grants capability tags; each
  requirement needs a set of tags; score = overlap. Includes an "Architect's Challenge" capstone requirement.
- `src/lib/origin-inspector.ts` — computes the headers an origin receives and whether its access log records
  the real visitor IP or Cloudflare's edge IP, based on whether the origin trusts forwarded headers.
- `src/lib/origin-protection.ts` — evaluates whether an origin is bypassable given DNS-leak, firewall,
  Authenticated Origin Pulls, and Tunnel toggles.

## Technical accuracy notes

Content is written to be genuinely useful to an experienced cloud/security engineer, not just directionally
correct, and is checked against **official developers.cloudflare.com documentation** — never third-party
tutorials, forums, or model prior knowledge — before being marked verified. Where Cloudflare's actual
behavior surprised the initial draft (e.g. Rate Limiting running before Managed Rules in the phase order, or
"Allow" not being a real current WAF Custom Rules action), the content and the interactive labs were
corrected to match the documented behavior, not the other way around. Where behavior is plan-, config-, or
version-dependent, that's called out in the text. Simulators are explicitly labeled as educational
approximations — each links to current Cloudflare documentation rather than presenting itself as a
configuration tool.

## What's implemented

**Learn:** 16 modules, each with objectives, concepts, examples, common mistakes, Mental Model comparisons,
a "Test Yourself" quiz, a personal notes panel, related topics, and a verified official-sources badge.

**Labs:** DNS Lab, WAF Rule Builder (Dashboard/Terraform/API tri-view), TLS Lab, Origin Inspector, Origin
Protection Lab, Bot Detection Lab, Request Decision Engine, Product Decision Engine ("Which Cloudflare
Capability Do I Need?"), Troubleshooting Academy (11 incidents, evidence → hypothesis → diagnosis →
remediation, with trade-off choices on the WAF false-positive incidents), Architecture Designer (Design Mode
+ Review Mode + an Architect's Challenge capstone).

**Reference:** Glossary, Knowledge Cards, HTTP status codes, Cloudflare 5xx error codes, DNS records.

**Other:** Deployment Models (6 interactive React Flow diagrams), Security Layers comparison, Scenario
Library (11 scenarios), Progress Tracker (every module/lab/scenario in one checklist), Mental Models system
(7 reusable comparisons embedded across relevant modules), local progress tracking.

**Marked "soon" in navigation** (stubbed with a pointer to the closest existing content): Network Flows,
Hybrid Cloud, On-Prem + Cloudflare, Rate Limiting Lab.

## Recommended next steps

1. Fill in the remaining "soon" pages using the existing `TopicContent` / lab-component patterns.
2. Add a lightweight scoring rubric to the Troubleshooting Academy beyond the hypothesis-feedback step.
3. Consider an export/import for the localStorage progress store (JSON download) before treating notes as
   durable.
4. Periodically re-verify `officialSources`/`lastVerified` dates against current Cloudflare docs — the
   source-policy point of this project is that content should never silently drift from what Cloudflare
   actually documents.
5. If this becomes a public platform: swap `localStorage` progress for a real backend, add auth, and
   consider server-rendering quiz state for shareable progress links.
