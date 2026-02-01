# Observability

## Strategy
We employ a multi-layered observability strategy to ensure uptime and rapid debugging.

## Error Monitoring (Sentry)
- **Scope**: Frontend (React) and Backend (Next.js Server).
- **Mechanism**: Auto-capture of unhandled exceptions.
- **Context**: Enriched with User ID and Commit SHA.

## Logging
- **Structured Logging**: JSON formatted logs in production.
- **Audit Logs**: Critical business actions are stored in the database.

## request Tracing
- **Correlation**: `x-request-id` header propagated through services.
- **Performance**: Vercel Analytics / Speed Speed Insights.
