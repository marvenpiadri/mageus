# Mageus authentication and API standard

## Decision

Mageus and Dollareus should converge on Better Auth for user authentication and Fastify 5 for the API runtime. They remain separate products with separate domain models and deployment lifecycles.

This document records the target architecture; it does not claim the migration is complete.

## Target architecture

- Better Auth owns user sign-in, sign-up, sign-out, session cookies, session lookup, password verification, and OAuth flows.
- Browser sessions use secure, HttpOnly cookies. Angular must not read, decode, or persist bearer session tokens in localStorage.
- Angular API requests include credentials where required. Server CORS must allow only configured origins and credentials.
- Fastify 5 owns HTTP routing, lifecycle hooks, rate limiting, security headers, request IDs, and API error formatting.
- Zod validates request parameters, query strings, and bodies at API boundaries.
- PostgreSQL is the persistent store. Schema changes are explicit migrations; no fake in-memory database fallback.
- API contracts use stable, versioned paths for new endpoints. Existing routes are migrated deliberately to avoid breaking the current UI.
- Socket.IO authentication must validate the server-side session; it must not trust a client-provided user ID or a JWT decoded in the browser.

## Migration order

1. Inventory every token/JWT use, login/signup endpoint, user identity lookup, route guard, WebSocket handshake, and API authorization check.
2. Introduce Better Auth on the API with a PostgreSQL adapter and a migration plan for existing users and sessions.
3. Add a session endpoint and validate sessions server-side; preserve existing user IDs and usernames.
4. Migrate Angular login, signup, logout, session restoration, guards, and credentialed HTTP requests.
5. Replace JWT-dependent identity reads with the server-provided session user. Never treat client-side route guards as authorization.
6. Migrate Socket.IO handshake authentication and protect user-specific events.
7. Retire legacy JWT endpoints and dependencies only after all consumers are migrated.
8. Verify production Angular build, API typecheck/build, sign-in/out/session expiry, CORS/cookie behavior, protected operations, and WebSocket authorization.

## API conventions

- Return a consistent JSON error envelope containing a stable error code, safe message, and request ID.
- Validate all untrusted input at the boundary.
- Authenticate and authorize on the server for every private operation.
- Keep authentication separate from application authorization (ownership, roles, magazine membership, shop permissions).
- Avoid leaking password, cookie, session, OAuth, or credential material in logs.
- Keep Mageus publishing, article blocks, moods, magazines, profiles, and shop domain logic in Mageus. Dollareus owns its business-management domain.

## Rollout and compatibility

Do not remove legacy authentication or change production database schemas until the backend deployment location, current schema, existing account data, and rollback path are confirmed. Use additive migrations and a controlled cutover. Never invalidate all existing sessions unexpectedly without an explicit rollout decision.
