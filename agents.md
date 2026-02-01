# agents.md — Catery Engineering Constitution

## 1) North Star
Catery is a multi-tenant SaaS for event/catering operations.
Primary goals:
- multi-tenant isolation by workspace
- reliability and correctness over cleverness
- fast UX: API p95 latency target 300ms for common endpoints
- auditability: decision history and interactions are first-class

## 2) Architecture boundaries
- Frontend: Next.js UI only (no business logic that belongs to backend)
- API: synchronous HTTP endpoints (Vercel Functions / route handlers)
- Workers: background jobs (imports, exports, heavy processing, retries)
- Integrations: email, whatsapp, transcription, webhooks
- Data: Postgres with strict tenant isolation (RLS or equivalent)

Rule: never put worker-style logic in request/response endpoints.

## 3) Multi-tenant rules
- Every request must resolve workspaceId (from auth token or explicit header/path).
- Every DB query MUST be tenant-scoped.
- No cross-workspace reads/writes.
- All events/messages include workspaceId + correlationId.

## 4) Conventions
- Logging: structured JSON logs with correlationId and workspaceId.
- Errors: use a standard error envelope { code, message, details, correlationId }.
- Idempotency: webhook deliveries and retries must be idempotent by key.

## 5) Definition of Done
A change is DONE only if:
- tests pass
- lint/typecheck pass
- OpenAPI/AsyncAPI updated if API/events changed
- docs updated if behaviour changed
- migrations are included when schema changes

## 6) Agent roles
### Planner
Outputs: a short plan + task slices + impacted files + risks.

### Implementer
Outputs: code changes + tests + minimal docs updates required by DoD.

### Reviewer
Outputs: review notes + risk assessment + required fixes.

### Docs agent
Outputs: OpenAPI/AsyncAPI + MkDocs updates, no code changes unless necessary.

### QA agent
Outputs: test scenarios + edge cases + regression checklist.

## 7) Orchestration workflow
1) Planner produces slices (small, shippable).
2) Implementer executes slice 1 with tests.
3) Reviewer reviews and requests fixes.
4) Docs agent updates OpenAPI/AsyncAPI/MkDocs.
5) QA agent proposes regression checks.
6) Final gate: CI must pass.

## 8) Commands
- pnpm lint
- pnpm test
- pnpm typecheck
- pnpm docs:build
- pnpm spec:validate

## 9) Non-negotiables
- Do not invent endpoints or behaviours not present in code.
- Prefer boring, explicit implementations.
- Never bypass tenant isolation to “fix a bug quickly”.