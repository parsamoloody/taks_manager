# Task Manager

A modern task management application designed to help individuals and teams organize their work efficiently. this task manager provides an intuitive Kanban board experience with workspaces, boards, lists, and tasks, making it easy to plan, track, and collaborate on projects.

Built with a modern full-stack architecture using NestJS, Next.js (Pages Router), Prisma, and PostgreSQL, the project emphasizes clean architecture, scalability, and maintainability. It serves as both a practical productivity tool and a reference implementation for building modular, production-ready web applications.

## Monorepo Overview

This project is built using Turborepo and pnpm workspaces. The repository contains multiple applications and shared packages that can be developed together in a single workspace.

---

## APPS
#### Backend
- [document](https://github.com/parsamoloody/taks_manager/tree/main/apps/backend#backend-api-documentation)
- path: apps/backend
#### Web
- [document](https://github.com/parsamoloody/taks_manager/blob/main/apps/web/README.md)
- path: apps/web
## Quick Start

Prereqs: Node.js 22+, pnpm, PostgreSQL.

Clone and install:

```bash
git clone https://github.com/parsamoloody/taks_manager.git
cd taks_manager
pnpm install
```

Build the shared package (required before running apps):

```bash
pnpm --filter @repo/shared add -D typescript
pnpm turbo build --filter=@repo/shared
```

Run apps (all):

```bash
pnpm turbo run dev
```

Run only the backend or frontend:

```bash
pnpm turbo run dev --filter=backend
pnpm turbo run dev --filter=web
```

---

## Using the shared package

Purpose: share lightweight TypeScript types, enums, and helpers (no NestJS runtime code).

Edit `packages/shared/src`, export from `packages/shared/src/index.ts`, then build:

```bash
pnpm --filter @repo/shared add -D typescript
pnpm turbo build --filter=@repo/shared
```

you have two way to add shared package (manually or commandline)

commandline: (recommended):
```bash
pnpm add @repo/shared --filter web --workspace
```
manually: Add a workspace dependency in an app's `package.json`:

```json
"dependencies": {
  "@repo/shared": "workspace:*"
}
```

At repo root run:

```bash
pnpm install
pnpm --filter @repo/shared add -D typescript
pnpm turbo build --filter=@repo/shared
```

Import in app code:

```ts
import type { AuthDto } from '@repo/shared';
```

---

## Web application

The frontend lives in `apps/web` and uses Next.js 16 with the Pages Router.
From the repository root:

```bash
pnpm --filter web dev
```

See [apps/web/README.md](apps/web/README.md) for its architecture, environment,
caching model, and production commands.

---

## Environment

Place env files per app, e.g. [apps/backend/.env](apps/backend/.env).
Example `apps/backend/.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/task_manager"
JWT_SECRET="some_secret"
JWT_TTL="3600s"
PORT="4000"
```

---

## Commands reference

Install deps:

```bash
pnpm install
```

Build shared package:

```bash
pnpm --filter @repo/shared add -D typescript
pnpm turbo build --filter=@repo/shared
```

Run all apps as dev:

```bash
pnpm turbo run dev
```

Run only backend:

```bash
pnpm turbo run dev --filter=backend
```
---
### Project diagram
![image](https://raw.githubusercontent.com/parsamoloody/taks_manager/refs/heads/main/packages/public/assets/imgs/task_manager_diagram_n_.svg)
---
You can see this digram in dark mode!
