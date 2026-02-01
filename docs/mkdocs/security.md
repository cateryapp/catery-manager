# Security

## Authentication
Catery uses Supabase Auth.
- **Mechanism**: JWT (JSON Web Tokens).
- **Flow**: Exchange credentials for Access/Refresh tokens. Access token used in `Authorization: Bearer` header.

## Authorization & Multi-Tenancy
Data isolation is enforced at the database layer using PostgreSQL Row Level Security (RLS).

### Workspace Boundaries
Every table has a `workspace_id` column (or relation to it).
RLS Policies ensure:
`auth.uid() IN (SELECT user_id FROM workspace_members WHERE position_id = current_workspace)`

### Role Model
- **Owner**: Full access.
- **Admin**: Can manage settings and staff.
- **Member**: Can manage events.
- **Viewer**: Read-only.

## Data Protection
- **Encryption**: TLS in transit. PostgreSQL encryption at rest (provider managed).
- **Backup**: Continuous point-in-time recovery.
