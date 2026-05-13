# doz-manager

doz-manager is a Next.js app for managing lecturers, courses, assignments, reporting, and access control.

## Stack

- Next.js 16
- React 19
- Prisma + MySQL
- Redis
- Vitest

## Local development setup

### Prerequisites

- Node.js 24.x
- npm
- Docker with `docker compose`

### 1. Install dependencies

```bash
npm ci
```

### 2. Create a local env file

Copy the example file and fill it in:

```bash
cp .env.example .env
```

Example values for local development:

```env
# Database
DB_NAME=db
DB_USER=user
DB_PASSWORD=password
DB_ROOT_USER=root
DB_ROOT_PASSWORD=rootpassword
DB_HOST=localhost
DB_PORT=3306

# Redis
REDIS_URL=redis://localhost:6379
CHANGE_EVENTS_CHANNEL=app:changes

# Auth
BETTER_AUTH_SECRET=super-secret-base-64-string
BETTER_AUTH_URL=http://localhost:3000

# Admin contact email shown on the login page
NEXT_PUBLIC_ADMIN_EMAIL=admin@example.com

# Seed Admin (used by `npm run prisma:seed`)
SEED_ADMIN_EMAIL=admin@example.com
SEED_ADMIN_PASSWORD=admin123
SEED_ADMIN_NAME=Admin 
```

Generate a random `BETTER_AUTH_SECRET` using:

```bash
openssl rand -base64 32
```

### 3. Start MySQL and Redis

```bash
docker compose up -d
```

The included `docker-compose.yml` starts:

- MySQL on `localhost:3306`
- Redis on `localhost:6379`

### 4. Generate the Prisma client

```bash
npm run prisma:generate
```

Run this after installing dependencies and any time the Prisma schema changes.

### 5. Apply migrations

```bash
npm run prisma:migrate
```

### 6. Seed the database

```bash
npm run prisma:seed
```

This creates the initial data set and the seeded admin account from the `SEED_ADMIN_*` variables.

### 7. Start the app

```bash
npm run dev
```

Open http://localhost:3000.

## Useful commands

```bash
npm run lint
npm test -- --run
npm run build
```

Notes:

- `npm run prisma:generate` must be run before tests or builds in a fresh checkout.
- `npm run build` fetches Geist fonts from Google during the build, so it needs outbound internet access.

## Hosting / deployment

The repository already includes a production Docker build and a GitHub Actions deployment pipeline.

### Production requirements

- A Linux host with Docker installed
- A reachable MySQL database
- A reachable Redis instance
- A public app URL for `BETTER_AUTH_URL`

### Required runtime environment variables

The production container uses these variables:

- `DB_HOST`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `NEXT_PUBLIC_ADMIN_EMAIL`
- `REDIS_URL`
- `CHANGE_EVENTS_CHANNEL`

Database migrations use:

- `DB_ROOT_USER`
- `DB_ROOT_PASSWORD`

### Option 1: Use the existing GitHub Actions pipeline

On pushes to `main`, the workflow:

1. Runs tests
2. Builds and pushes a Docker image to GHCR
3. Runs `prisma migrate deploy`
4. Connects to the target server over SSH and starts the app container

The workflow expects GitHub secrets for:

- Container/host access: `DEPLOY_SSH_KEY`, `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_PORT`
- Optional jump host: `JUMP_HOST`, `JUMP_USER`, `JUMP_PORT`, `JUMP_SSH_KEY`
- Database: `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_ROOT_USER`, `DB_ROOT_PASSWORD`
- App config: `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `NEXT_PUBLIC_ADMIN_EMAIL`, `REDIS_URL`, `CHANGE_EVENTS_CHANNEL`

### Option 2: Host it manually with Docker

Build the production image:

```bash
docker build -f Dockerfile.prod \
  --build-arg NEXT_PUBLIC_ADMIN_EMAIL=admin@example.com \
  -t doz-manager:latest .
```

Run migrations:

```bash
DB_HOST=... \
DB_NAME=... \
DB_ROOT_USER=... \
DB_ROOT_PASSWORD=... \
npx prisma migrate deploy
```

Start the app container:

```bash
docker run -d \
  --name doz-manager-app \
  --restart unless-stopped \
  -p 3000:3000 \
  -e DB_HOST=... \
  -e DB_NAME=... \
  -e DB_USER=... \
  -e DB_PASSWORD=... \
  -e BETTER_AUTH_SECRET=... \
  -e BETTER_AUTH_URL=https://your-domain.example \
  -e NEXT_PUBLIC_ADMIN_EMAIL=admin@example.com \
  -e REDIS_URL=redis://your-redis-host:6379 \
  -e CHANGE_EVENTS_CHANNEL=app:changes \
  -e NODE_ENV=production \
  doz-manager:latest
```

If you want to match the current GitHub Actions deployment exactly, run the container with `--network host` instead of `-p 3000:3000`.
