# taks manager
A modern task management application designed to help individuals and teams organize their work efficiently. this task manager provides an intuitive Kanban board experience with workspaces, boards, lists, and tasks, making it easy to plan, track, and collaborate on projects.

Built with a modern full-stack architecture using NestJS, ReactJs, Prisma, and PostgreSQL, the project emphasizes clean architecture, scalability, and maintainability. It serves as both a practical productivity tool and a reference implementation for building modular, production-ready web applications.

# Monorepo Overview

This project is built using **Turborepo** and **pnpm workspaces**. The repository contains multiple applications and shared packages that can be developed together in a single workspace.

---

# Shared Package

The shared package contains code that can be reused by both the backend and frontend.

Typical contents include:

* DTO interfaces
* TypeScript types
* Enums
* Interfaces
* Constants
* Utility functions that do not depend on a specific framework

## Importing Shared Types

You can import shared types directly from the shared package in both the backend and frontend.

Backend:

```ts
import type { AuthDto } from '@repo/shared';
```

Frontend:

```ts
import type { AuthDto } from '@repo/shared';
```

The backend uses these shared interfaces as contracts, while NestJS DTO classes remain inside the backend application to provide runtime validation with `class-validator`.

Example:

```ts
// packages/shared/src/dto/auth.dto.ts

export interface AuthDto {
  email: string;
  password: string;
}
```

```ts
// apps/backend/src/auth/dto/auth.dto.ts

import type { AuthDto as SharedAuthDto } from '@repo/shared';

export class AuthDto implements SharedAuthDto {
  @IsEmail()
  email: string;

  @MinLength(8)
  password: string;
}
```

This approach provides:

* A single shared TypeScript contract.
* Runtime validation only where it is required (backend).
* No unnecessary frontend dependencies on NestJS or `class-validator`.

---

# Getting Started

## Prerequisites

* Node.js 22+
* pnpm
* PostgreSQL

Install pnpm if it is not already installed:

```bash
npm install -g pnpm
```

---

# Installation

Clone the repository:

```bash
git clone https://github.com/parsamoloody/taks_manager.git
cd taks_manager
```

Install all dependencies:

```bash
pnpm install
```

---

# Environment Variables

Create the required environment files.

Backend:

```text
apps/backend/.env
```

Example:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/task_manager"
JWT_SECRET="your-secret"
```

---

# Running the Development Server

Before run apps, build the packages first

```bash
pnpm turbo build --filter=@repo/shared
```
Start all applications:

```bash
pnpm turbo run dev
```

Run only the backend:

```bash
pnpm turbo run dev --filter=backend
```

Run only the frontend:

```bash
pnpm turbo run dev --filter=web
```

---

# Build (not built yet)

Build every application and package:

```bash
pnpm turbo run build
```

Build only the backend:

```bash
pnpm turbo run build --filter=backend
```

---

# Lint

Run linting for the entire workspace:

```bash
pnpm turbo run lint
```

---

# Tests

Run tests across the workspace:

```bash
pnpm turbo run test
```

Backend only:

```bash
pnpm turbo run test --filter=backend
```

---

# Adding a New Shared Type

1. Create the file.

```text
packages/shared/src/dto/create-board.dto.ts
```

2. Export it from the appropriate `index.ts`.

```ts
export * from './create-board.dto';
```

3. Import it from any application.

```ts
import type { CreateBoardDto } from '@repo/shared';
```

---

# Development Workflow

1. Create or modify shared types in `packages/shared`.
2. Implement backend validation using NestJS DTO classes.
3. Reuse shared interfaces in both backend and frontend.
4. Start the applications with Turborepo using `pnpm turbo run dev`.
5. Develop features independently while keeping shared contracts synchronized.

## Backend

The backend is built with NestJS using a modular architecture and Prisma ORM with PostgreSQL for data persistence. It exposes a RESTful API for all CRUD operations, while the architecture is designed to support real-time collaboration features in the future.

### Tech Stack
- Framework: NestJS
- Language: TypeScript
- Database: PostgreSQL
- ORM: Prisma
- Authentication: JWT (Access & Refresh Tokens)
- Validation: class-validator & class-transformer
- API Style: REST
- Architecture: Modular Monolith
- Package Manager: pnpm
- Monorepo: Turborepo