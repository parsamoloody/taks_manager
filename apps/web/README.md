# Tsk Manager Web

The frontend is a Next.js 16 application using the Pages Router, TypeScript,
React 19, and Tailwind CSS 4.

## Development

From the repository root:

```bash
pnpm install
pnpm dev
```

The web application runs at `http://localhost:3000`. The Nest API is expected
at `http://localhost:4000` by default.

To run only the frontend:

```bash
pnpm --filter web dev
```

## Environment

Copy `.env.example` to `.env` and configure:

```env
API_URL=http://localhost:4000
SESSION_SECRET=replace-with-a-long-random-secret
API_TIMEOUT_MS=10000
NEXT_PUBLIC_TASK_REMINDER_DAYS=1
```

`API_URL` is server-only. Browser requests use same-origin Next API routes, so
backend access tokens never need to be exposed to client-side code.

Keep `NEXT_PUBLIC_TASK_REMINDER_DAYS` aligned with the backend
`TASK_REMINDER_LEAD_DAYS` value so task urgency styling matches email delivery.

## Architecture

```text
src/
├── components/          # Shared UI and feature components
├── lib/                 # Framework-independent helpers
├── modules/mutations/   # Client mutation and route revalidation layer
├── pages/               # Pages Router pages and API routes
├── server/
│   ├── api/             # Server-only Nest API client
│   ├── auth/            # Signed HTTP-only session and SSR guards
│   ├── http/            # API handler, origin, and form helpers
│   └── mutations/       # Workspace, board, task, and profile use cases
├── styles/
└── types/
```

The landing page uses lightweight server-side session detection so its calls to
action always match the signed-in state. It and all authenticated pages use
private, no-store responses because their HTML can be user-specific. Error
pages remain statically generated. Server-rendered pages import the backend
client directly instead of making an extra request through their own API routes.

Mutations go through small same-origin API handlers. They validate the request
origin, read the signed HTTP-only session, call the relevant use-case module,
and then revalidate the active page.

## Performance features

- Automatic route-level code splitting through the Pages Router
- Session-aware SSR without a client-side authentication flash
- `next/image` with fixed dimensions for avatars and local image optimization
- Dynamic imports for board settings and task/workspace dialogs
- Parallel server data fetching for independent requests
- One aggregated board-detail request for lists, labels, members, and ordered tasks
- Partial task-status updates without a preliminary task read
- Memoized board columns/cards and `content-visibility` for long task lists
- Bounded member stacks so overview cards do not render every avatar
- Route revalidation that preserves the user's board scroll position
- Turbopack development and production compilation
- Standalone production output for small deployment artifacts
- AVIF/WebP image formats, compression, and immutable fallback-image caching

Authenticated HTML and API responses are deliberately not shared-cacheable.
Caching private board data at a CDN would risk serving one user's data to
another.

## Validation and production

```bash
pnpm --filter web typecheck
pnpm --filter web lint
pnpm --filter web build
pnpm --filter web start
```

The production server listens on port 3000 by default.
