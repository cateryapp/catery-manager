# Workflows

## Event Lifecycle

1. **Draft**: Event is created. Requirements are rough.
2. **Planning**: Phases are added. Products are selected. Budget is estimated.
3. **Confirmed**: Quote approved (Decision Recorded). Staff is assigned.
4. **Execution**: Event takes place. Realtime updates.
5. **Done**: Billing and post-event analysis.
6. **Cancelled**: Terminal state if aborted.

## Decision History
All critical changes to the event (status change, budget approval) are recorded as `Decisions` (or inferred audit trail) to provide accountability.

## Interaction Tracking
Emails and calls related to an event are linked via:
- Contextual logging in the frontend.
- Future integrations with email providers (e.g. tracking visible on backend).
