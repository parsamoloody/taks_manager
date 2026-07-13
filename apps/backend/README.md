# Backend API Documentation

This backend powers the Task Manager application. It is built with NestJS, Prisma, PostgreSQL, and JWT-based authentication.

## Tech stack

- NestJS - application framework for building scalable APIs
- TypeScript - main language for the server code
- Prisma ORM - database access and migrations
- PostgreSQL - primary database
- JWT + Passport - authentication and authorization
- Swagger - interactive API documentation

## Project structure

- src/main.ts - application entry point
- src/app.module.ts - root module that wires all feature modules
- src/modules/auth - authentication endpoints
- src/modules/workspace - workspace and workspace member management
- src/modules/board - board CRUD operations
- src/modules/board_member - board member management
- src/modules/task - tasks management
- src/common - shared configuration, guards, decorators, Prisma service

## How it works

1. The app starts from the NestJS bootstrap file and loads the root module.
2. Configuration is loaded from environment variables through the config module.
3. Prisma connects to PostgreSQL using the database URL from the environment.
4. Feature modules expose REST endpoints for auth, workspaces, boards, and members.
5. Protected routes use a JWT guard, so requests must include a valid bearer token.
6. Swagger documentation is available at the docs endpoint for testing the API interactively.

## Setup your database
Follow these steps to create a PostgreSQL user, database, and configure Prisma.

#### 1. Login to PostgreSQL

Open your terminal and connect as the PostgreSQL superuser:

```bash
sudo -u postgres psql
```

Or, if you're using Windows:

```bash
psql -U postgres
```

---

#### 2. Create a New Database User

Replace `myuser` and `mypassword` with your own values.

```sql
CREATE USER myuser WITH PASSWORD 'mypassword';
```

---

#### 3. Create a Database

Replace `mydatabase` with your preferred database name.

```sql
CREATE DATABASE mydatabase;
```

---

#### 4. Grant Ownership of the Database

```sql
ALTER DATABASE mydatabase OWNER TO myuser;
```

---

#### 5. Grant All Privileges

Grant all privileges on the database to the user.

```sql
GRANT ALL PRIVILEGES ON DATABASE mydatabase TO myuser;
```

If you already have tables or schemas, also run:

```sql
GRANT ALL ON SCHEMA public TO myuser;
```

(Optional) Make the user the default owner of future objects:

```sql
ALTER SCHEMA public OWNER TO myuser;
```

---

#### 6. Verify the Database

List all databases:

```sql
\l
```

List all users:

```sql
\du
```

Exit PostgreSQL:

```sql
\q
```
## Environment variables

Create a .env file in the backend app folder with values similar to:

```env
PORT=8000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/task_manager
JWT_SECRET=your_super_secret_key
JWT_TTL=1h
FRONT_BASE_URL="http://localhost:5173"
```

## Running the backend

From the repository root:

```bash
pnpm --filter backend install
pnpm --filter backend db:migrate
pnpm --filter backend db:generate
pnpm --filter backend dev
```

Or from the backend folder:

```bash
cd apps/backend
pnpm install
pnpm db:migrate
pnpm db:generate
pnpm dev
```

The server will run on:

- http://localhost:8000

Swagger UI is available at:

- http://localhost:8000/docs

## API access

Most endpoints require authentication. After signing in, copy the returned JWT token and send it in the Authorization header:

```http
Authorization: Bearer <your_token>
```

## Example: create a workspace

### 1. Sign up

```bash
curl -X POST http://localhost:8000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "strongPassword123"
  }'
```

### 2. Sign in

```bash
curl -X POST http://localhost:8000/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "strongPassword123"
  }'
```

The response will contain a JWT token.

### 3. Create a workspace

```bash
curl -X POST http://localhost:8000/workspace \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_token>" \
  -d '{
    "name": "Product Team",
    "logo": "https://example.com/logo.png"
  }'
```

## Notes

- The Swagger UI is the easiest way to explore the API and test protected routes.
- If you are running the app locally, make sure PostgreSQL is available and the DATABASE_URL points to a valid database.
