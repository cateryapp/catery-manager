# Domain Model

## Core Entities

### Workspace
The root bounday for isolation.
- **Relationships**: Has Many Events, Staff, Products.

### Event
A temporal gathering managed by the workspace.
- **Key Fields**: `start_at`, `end_at`, `location`, `status`.
- **Relationships**: belongs to Workspace. Has many Phases.

### Phase
A distinct period within an event (e.g., "Cocktail Hour", "Dinner").
- **Responsibilities**: organizing timeline.
- **Composition**: Contains Event Phase Items (Products).

### Product
An item or service in the catalog.
- **Types**: `single` (atomic), `bundle` (collection), `service` (labor).
- **Costing**: Composed of Resources (Ingredients, Labor).

### Staff & Assignments
- **Staff**: A pool of employable people.
- **Assignments**: Linking a Staff member to an Event for a specific role and time.

### Decision
A record of a key choice made during the event planning process (e.g. quote acceptance).

## Invariants
1. **Workspace Isolation**: An entity MUST belong to exactly one workspace and cannot be accessed by members of another.
2. **Phase Continuity**: Phases within an event are ordered via `sort_order`.
3. **Bundle Integrity**: A bundle item represents a strict subset of choices from a Group.
