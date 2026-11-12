# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

Record your plan here before editing code.

- Presentation tier decision: Keep React components responsible for rendering and view state, with requests through the shared API client using relative `/api` paths by default. Preserve React Router and Bootstrap, and provide accessible loading, empty, success, and error states for each capability. Keep Vite on port `5173`.
- Logic tier decision: Keep Express routes responsible for request validation, response shapes, and HTTP status codes, with business rules in services. Run the API on port `8000`, return deliberate 4xx responses for invalid input or missing resources, and do not add authentication in this exercise.
- Data tier decision: Use Mongoose schemas to enforce required fields and preserve user/team references and the default empty team members array. Keep MongoDB on port `27017` and retain the passing, idempotent seed behavior without deleting unrelated records. Implement model validation first, then API behavior, then presentation, checking each tier's contracts before proceeding.
- Activity tracking approach: Validate `userId`, `teamId`, `type`, and positive numeric `minutes` before creating a record. Check ID format and user/team existence before database writes so invalid references return 4xx rather than cast-error 500s. Compute positive points from minutes in the service, set `occurredAt` on creation, and return the persisted activity in create/list responses.
- Team management approach: Validate the submitted name, mascot, and member IDs, return `400` for a missing name, and persist the supplied fields with an empty members array by default. Return the stored name, mascot, and member IDs in create/list responses.
- Current API increment: Implement only team creation and listing, the first failing API contract; preserve the passing activity implementation and defer leaderboard and workout suggestions.
- Leaderboard approach: Aggregate activity points by team, resolve team names, sort totals highest first, and assign sequential 1-based ranks. Return entries containing `teamName`, `totalPoints`, and `rank`; keep score calculation out of React components.
- Workout suggestions approach: Look up the user by email and return `404` when no user matches. Use recent activities and the user's fitness goal to prioritize matching workout focuses, and include a reason grounded in that user's goal or activity pattern. Request suggestions for a specific user through the shared frontend API client.
- Frontend implementation: Each capability renders its API list through `CapabilityCard`, which uses the shared `getJson` client and provides loading status text, an empty message, and an error alert. Workout suggestions use the URL-encoded seeded email `mona@example.com`; no authentication or user selection is introduced.

## Test plan

Record the commands you run and what each failure means.

- Data-tier command: `npm run test:data --prefix octofit-tracker/backend`
- API command: `npm run test:api --prefix octofit-tracker/backend`
- Frontend command: `npm test --prefix octofit-tracker/frontend`
- Backend build command: `npm run build --prefix octofit-tracker/backend`
- Frontend build command: `npm run build --prefix octofit-tracker/frontend`
- Initial API run: `npm run test:api --prefix octofit-tracker/backend` passed activity tracking. Team creation failed first because the placeholder returned `501` instead of `400` for a missing name; leaderboard and workout suggestions also remain incomplete.
- Team increment verification: `npm run test:api --prefix octofit-tracker/backend -- -t 'creates and lists valid activities|creates teams and exposes members|validates team fields'` passed all three selected tests, including malformed team input and default empty members. `npm run build --prefix octofit-tracker/backend` passed.
- Next contract: `npm run test:api --prefix octofit-tracker/backend -- -t 'orders leaderboard entries by total points'`. The initial run returned an empty leaderboard instead of ranked team totals.
- Frontend verification: `cd octofit-tracker/frontend && npm test -- tests/app.contract.test.tsx && npm run build` passed all 15 presentation contract tests, TypeScript checking, and the Vite production build. Before implementation, all 15 tests failed against placeholder cards.
