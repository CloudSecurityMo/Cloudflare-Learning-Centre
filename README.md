# Cloudflare Architecture Lab

An interactive learning platform for understanding Cloudflare — DNS, proxying, WAF, TLS, Zero Trust, and
everything in between — built around one question: **what happens to a request from the browser all the
way to the origin, and where does each Cloudflare capability sit in that flow?**

This is not a documentation mirror. It's an architecture lab: click-through diagrams, a request lifecycle
simulator, a WAF rule builder, an architecture decision simulator, troubleshooting scenarios, and quizzes —
all backed by structured, versionable content rather than hardcoded prose.

## Running it

```bash
npm install
npm run dev
```

Open http://localhost:3000. Progress, notes, and quiz scores persist to `localStorage` — there's no backend
and no auth in this MVP.

```bash
npm run build   # production build (statically prerenders every route)
npm run lint    # ESLint (flat config, Next.js + React Compiler rules)
```

## Architecture

- **Next.js 16 (App Router) + React 19 + TypeScript**, Tailwind CSS v4, shadcn/ui (Radix base, Nova preset).
- **React Flow** for the interactive architecture diagrams (Deployment Models).
- **Framer Motion** for the Request Lifecycle Simulator's stage-by-stage reveal.
- **Zustand + `persist`** for local progress tracking (completed topics, quiz attempts, lab/scenario
  completion, personal notes and open questions) — see `src/lib/progress.ts`.
- **next-themes** for dark/light mode (dark is the default, matching the "engineering tool" aesthetic).

### Directory structure

```
src/
  app/                      Routes (App Router). Thin — pages compose content + components.
    learn/[slug]/           Generic renderer for every Learn module (data-driven)
    architecture/           Deployment Models, Security Layers, AWS/Azure/K8s, Reference Architectures
    labs/                   Request Simulator, WAF Rule Builder, TLS/DNS/Bot labs, Troubleshooting,
                             Architecture Designer
    reference/              Glossary, Knowledge Cards, HTTP status codes, CF error codes, DNS records
    scenarios/               Scenario Library
  components/
    ui/                     shadcn/ui primitives
    layout/                 Sidebar nav + app shell
    diagrams/                ArchitectureFlow (React Flow wrapper), NodeDetailSheet, AsciiDiagram
    learn/                  TopicPage renderer, Quiz, NotesPanel (personal knowledge base)
    labs/                   One component per interactive lab
    home/                   Hero architecture + dashboard stats
  content/                  All educational content as typed data — see below
  lib/                      Simulation engines (request lifecycle, TLS lab, WAF rule builder,
                             architecture designer), nav config, progress store
```

### Content system

Every Learn topic is a `TopicContent` object (`src/content/types.ts`): objectives, concept sections
(with optional ASCII diagrams), examples, common mistakes, troubleshooting cases, a quiz, related topics,
and official documentation links. Topics live in `src/content/learn/*.ts` and are registered in
`src/content/learn/index.ts` — the `[slug]` route and every related-topic link resolve against that
registry automatically.

**To add a new Learn module:**
1. Create `src/content/learn/my-topic.ts` exporting a `TopicContent` object.
2. Add it to the `LEARN_TOPICS` array in `src/content/learn/index.ts`.
3. Add a nav entry in `src/lib/nav.ts` pointing at `/learn/my-topic`.

No component changes needed — `TopicPage` renders any `TopicContent` generically.

The same pattern applies to `src/content/scenarios/`, `src/content/reference/` (glossary, knowledge cards,
codes), `src/content/architecture/deployment-models.ts` (diagram node/edge data), and
`src/content/nodes.ts` (the shared "click a component → deep explanation" registry used by both the
homepage hero and the Deployment Models diagrams).

### Simulation engines

- `src/lib/simulate-request.ts` — rule-based engine behind the Request Lifecycle Simulator. Inspects the
  request for SQLi/XSS patterns, bot/rate-limit toggles, and cacheability, then produces a stage-by-stage
  outcome (WAF block, Bot challenge, rate limit, cache HIT/MISS, final status).
- `src/lib/tls-lab.ts` — SSL/TLS mode × origin certificate state → outcome (including how 525/526 errors
  actually occur).
- `src/lib/waf-rule-builder.ts` — condition/operator/value → Cloudflare-style rules-language expression.
- `src/lib/architecture-designer.ts` — tag-based scoring: each configuration choice grants capability tags;
  each requirement needs a set of tags; score = overlap.

## Technical accuracy notes

Content is written to be genuinely useful to an experienced cloud/security engineer, not just directionally
correct. Where behavior is plan-, config-, or version-dependent, that's called out in the text. The WAF Rule
Builder and other simulators are explicitly labeled as educational approximations of Cloudflare's actual
rules language — each links to current Cloudflare documentation rather than presenting itself as a
configuration tool.

## What's implemented (MVP) vs. planned

**Done:** Dashboard, full navigation, 16 Learn modules, Deployment Models (6 interactive diagrams),
Request Lifecycle Simulator, WAF Academy + Rule Builder, Security Layers comparison, DNS/TLS/Bot labs,
Troubleshooting Academy (10 incidents), Architecture Designer, Scenario Library (12 scenarios), Glossary,
Knowledge Cards, HTTP/Cloudflare error code references, quizzes on every module, personal notes/open
questions per topic, local progress tracking.

**Marked "soon" in navigation** (stubbed with a pointer to the closest existing content): Network Flows,
Hybrid Cloud, On-Prem + Cloudflare, Origin Protection Lab, Rate Limiting Lab. These are natural Phase 4
extensions once the MVP is validated — same content system, no architectural changes needed.

## Recommended next steps

1. Fill in the five "soon" pages using the existing `TopicContent` / lab-component patterns.
2. Add a lightweight scoring rubric to the Troubleshooting Academy (currently self-check, not scored).
3. Consider an export/import for the localStorage progress store (JSON download) before treating notes as
   durable.
4. If this becomes a public platform: swap `localStorage` progress for a real backend, add auth, and
   consider server-rendering quiz state for shareable progress links.
