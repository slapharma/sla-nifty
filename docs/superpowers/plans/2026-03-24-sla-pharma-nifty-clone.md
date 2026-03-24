# SLA Pharma Nifty Clone (SLAPM) Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-stack project management tool (Nifty clone) for SLA Pharma supporting 13 users with Kanban, List, Gantt views, Google Drive integration, and real-time collaboration.

**Architecture:** Monorepo with `apps/api` (Express.js + TypeScript + Prisma) and `apps/web` (React 18 + Vite + TypeScript + Shadcn/ui). PostgreSQL as the primary database, Redis for sessions and job queues, Socket.io for real-time events. Google OAuth2 for authentication, Google Drive MCP for file storage.

**Tech Stack:** React 18, TypeScript, Vite, Shadcn/ui, Tailwind CSS, Zustand, TanStack Query, React Beautiful DnD, Recharts, Express.js, Prisma ORM, PostgreSQL, Redis, Bull, Passport.js, Socket.io, Jest, Supertest, Docker

---

## Scope Note

This plan covers 8 independent subsystems delivered as sequential phases. Each phase produces working, testable, deployable software. Phases can be handed off as separate subagent tasks once the prior phase is complete.

---

## File Structure

```
slapm/
├── apps/
│   ├── api/                          # Express backend
│   │   ├── src/
│   │   │   ├── index.ts              # Server entry point
│   │   │   ├── app.ts                # Express app factory
│   │   │   ├── config/
│   │   │   │   ├── env.ts            # Typed env vars (zod)
│   │   │   │   └── prisma.ts         # Prisma client singleton
│   │   │   ├── middleware/
│   │   │   │   ├── auth.ts           # JWT + session auth middleware
│   │   │   │   ├── rbac.ts           # Role-based access control
│   │   │   │   └── errorHandler.ts   # Global error handler
│   │   │   ├── routes/
│   │   │   │   ├── auth.routes.ts
│   │   │   │   ├── users.routes.ts
│   │   │   │   ├── projects.routes.ts
│   │   │   │   ├── tasks.routes.ts
│   │   │   │   ├── milestones.routes.ts
│   │   │   │   ├── comments.routes.ts
│   │   │   │   ├── drive.routes.ts
│   │   │   │   └── export.routes.ts
│   │   │   ├── controllers/          # One per route file
│   │   │   ├── services/             # Business logic
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── task.service.ts
│   │   │   │   ├── project.service.ts
│   │   │   │   ├── milestone.service.ts
│   │   │   │   ├── drive.service.ts
│   │   │   │   ├── notification.service.ts
│   │   │   │   └── export.service.ts
│   │   │   ├── jobs/
│   │   │   │   ├── queue.ts          # Bull queue setup
│   │   │   │   └── deadline.job.ts   # Deadline alert processor
│   │   │   └── sockets/
│   │   │       └── taskEvents.ts     # Socket.io event handlers
│   │   ├── prisma/
│   │   │   ├── schema.prisma         # Single source of truth
│   │   │   └── seed.ts               # Dev data seed
│   │   ├── tests/
│   │   │   ├── auth.test.ts
│   │   │   ├── tasks.test.ts
│   │   │   ├── projects.test.ts
│   │   │   └── drive.test.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── web/                          # React frontend
│       ├── src/
│       │   ├── main.tsx
│       │   ├── App.tsx
│       │   ├── lib/
│       │   │   ├── api.ts            # Axios instance
│       │   │   └── queryClient.ts    # TanStack Query client
│       │   ├── store/
│       │   │   └── useAppStore.ts    # Zustand global store
│       │   ├── hooks/
│       │   │   ├── useTasks.ts
│       │   │   ├── useProjects.ts
│       │   │   └── useSocket.ts
│       │   ├── components/
│       │   │   ├── ui/               # Shadcn/ui primitives
│       │   │   ├── layout/
│       │   │   │   ├── Sidebar.tsx
│       │   │   │   ├── Header.tsx
│       │   │   │   └── AppShell.tsx
│       │   │   ├── kanban/
│       │   │   │   ├── KanbanBoard.tsx
│       │   │   │   ├── KanbanColumn.tsx
│       │   │   │   └── KanbanCard.tsx
│       │   │   ├── tasks/
│       │   │   │   ├── TaskList.tsx
│       │   │   │   ├── TaskRow.tsx
│       │   │   │   ├── TaskDetail.tsx
│       │   │   │   └── TaskForm.tsx
│       │   │   ├── milestones/
│       │   │   │   ├── MilestoneList.tsx
│       │   │   │   └── MilestoneForm.tsx
│       │   │   ├── gantt/
│       │   │   │   └── GanttChart.tsx
│       │   │   ├── dashboard/
│       │   │   │   ├── Dashboard.tsx
│       │   │   │   └── KpiCard.tsx
│       │   │   └── drive/
│       │   │       └── DriveUpload.tsx
│       │   ├── pages/
│       │   │   ├── LoginPage.tsx
│       │   │   ├── DashboardPage.tsx
│       │   │   ├── ProjectPage.tsx
│       │   │   └── SettingsPage.tsx
│       │   └── types/
│       │       └── index.ts          # Shared TS types (mirroring Prisma models)
│       ├── package.json
│       └── tsconfig.json
├── docker-compose.yml
├── docker-compose.test.yml
├── .env.example
└── package.json                      # Workspace root
```

---

## Chunk 1: Monorepo Setup & Database Schema

### Task 1: Initialize Monorepo

**Files:**
- Create: `slapm/package.json`
- Create: `slapm/apps/api/package.json`
- Create: `slapm/apps/web/package.json`
- Create: `slapm/docker-compose.yml`
- Create: `slapm/.env.example`

- [ ] **Step 1: Create root workspace**

```bash
mkdir slapm && cd slapm
cat > package.json << 'EOF'
{
  "name": "slapm",
  "private": true,
  "workspaces": ["apps/*"],
  "scripts": {
    "dev": "concurrently \"npm run dev -w apps/api\" \"npm run dev -w apps/web\"",
    "test": "npm run test -w apps/api"
  },
  "devDependencies": {
    "concurrently": "^8.2.0"
  }
}
EOF
npm install
```

- [ ] **Step 2: Create docker-compose.yml**

```yaml
# docker-compose.yml
version: '3.9'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: slapm
      POSTGRES_USER: slapm
      POSTGRES_PASSWORD: slapm_dev
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  pgdata:
```

- [ ] **Step 3: Create .env.example**

```bash
cat > .env.example << 'EOF'
# Database
DATABASE_URL="postgresql://slapm:slapm_dev@localhost:5432/slapm"

# Auth
JWT_SECRET=change_me_in_production
SESSION_SECRET=change_me_in_production

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback

# Google Drive
GOOGLE_DRIVE_FOLDER_ROOT=SLAPM

# Redis
REDIS_URL=redis://localhost:6379

# SendGrid (optional)
SENDGRID_API_KEY=

# App
API_PORT=3001
WEB_PORT=5173
NODE_ENV=development
EOF
cp .env.example .env
```

- [ ] **Step 4: Start infrastructure**

```bash
docker-compose up -d
# Expected: postgres and redis containers running
docker-compose ps
```

- [ ] **Step 5: Commit**

```bash
git init && git add .
git commit -m "chore: monorepo scaffold with docker-compose"
```

---

### Task 2: Backend Project Setup

**Files:**
- Create: `apps/api/package.json`
- Create: `apps/api/tsconfig.json`
- Create: `apps/api/src/config/env.ts`
- Create: `apps/api/src/config/prisma.ts`
- Create: `apps/api/src/app.ts`
- Create: `apps/api/src/index.ts`

- [ ] **Step 1: Initialize API package**

```bash
cd apps/api
npm init -y
npm install express cors helmet morgan dotenv zod passport passport-google-oauth20 \
  passport-jwt jsonwebtoken bcryptjs @prisma/client bull ioredis socket.io \
  @sendgrid/mail googleapis pdfkit csv-stringify
npm install -D typescript ts-node-dev @types/express @types/node @types/cors \
  @types/morgan @types/passport @types/passport-google-oauth20 @types/passport-jwt \
  @types/jsonwebtoken @types/bcryptjs @types/bull prisma jest ts-jest supertest \
  @types/supertest @types/pdfkit
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

- [ ] **Step 3: Create `src/config/env.ts`**

```typescript
import { z } from 'zod';
import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

const envSchema = z.object({
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string(),
  SESSION_SECRET: z.string(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z.string().default('http://localhost:3001/api/auth/google/callback'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  API_PORT: z.string().default('3001'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export const env = envSchema.parse(process.env);
```

- [ ] **Step 4: Create `src/config/prisma.ts`**

```typescript
import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;
```

- [ ] **Step 5: Create `src/app.ts`**

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

export function createApp() {
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
  app.use(morgan('dev'));
  app.use(express.json());
  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  return app;
}
```

- [ ] **Step 6: Write health check test**

```typescript
// tests/app.test.ts
import request from 'supertest';
import { createApp } from '../src/app';

const app = createApp();

describe('GET /health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
```

- [ ] **Step 7: Run test to verify it passes**

```bash
npx jest tests/app.test.ts --no-coverage
# Expected: PASS
```

- [ ] **Step 8: Commit**

```bash
git add apps/api
git commit -m "feat: api project scaffold with express + typescript"
```

---

### Task 3: Prisma Database Schema

**Files:**
- Create: `apps/api/prisma/schema.prisma`
- Create: `apps/api/prisma/seed.ts`

- [ ] **Step 1: Initialize Prisma**

```bash
cd apps/api
npx prisma init --datasource-provider postgresql
```

- [ ] **Step 2: Write the full schema**

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  ADMIN
  MEMBER
  VIEWER
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  IN_REVIEW
  DONE
}

enum TaskPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum MilestoneStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  OVERDUE
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String
  avatarUrl     String?
  googleId      String?   @unique
  role          Role      @default(MEMBER)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  projectMembers ProjectMember[]
  assignedTasks  Task[]          @relation("TaskAssignee")
  createdTasks   Task[]          @relation("TaskCreator")
  comments       Comment[]
  activityLogs   ActivityLog[]
}

model Project {
  id            String    @id @default(cuid())
  name          String
  description   String?
  driveFolder   String?   // Google Drive folder ID
  color         String    @default("#3B82F6")
  archived      Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  members       ProjectMember[]
  tasks         Task[]
  milestones    Milestone[]
}

model ProjectMember {
  id        String   @id @default(cuid())
  role      Role     @default(MEMBER)
  userId    String
  projectId String
  joinedAt  DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  project   Project  @relation(fields: [projectId], references: [projectId], onDelete: Cascade)

  @@unique([userId, projectId])
}

model Task {
  id            String       @id @default(cuid())
  title         String
  description   String?
  status        TaskStatus   @default(TODO)
  priority      TaskPriority @default(MEDIUM)
  position      Float        @default(0)  // For kanban ordering
  dueDate       DateTime?
  completedAt   DateTime?
  projectId     String
  assigneeId    String?
  creatorId     String
  milestoneId   String?
  parentId      String?      // For subtasks
  driveFiles    Json?        // Array of {fileId, name, url}
  tags          String[]
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  project       Project      @relation(fields: [projectId], references: [id], onDelete: Cascade)
  assignee      User?        @relation("TaskAssignee", fields: [assigneeId], references: [id])
  creator       User         @relation("TaskCreator", fields: [creatorId], references: [id])
  milestone     Milestone?   @relation(fields: [milestoneId], references: [id])
  parent        Task?        @relation("Subtasks", fields: [parentId], references: [id])
  subtasks      Task[]       @relation("Subtasks")
  comments      Comment[]
  activityLogs  ActivityLog[]
}

model Milestone {
  id          String          @id @default(cuid())
  title       String
  description String?
  dueDate     DateTime
  status      MilestoneStatus @default(PENDING)
  projectId   String
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt

  project     Project         @relation(fields: [projectId], references: [id], onDelete: Cascade)
  tasks       Task[]
}

model Comment {
  id        String    @id @default(cuid())
  body      String
  taskId    String
  authorId  String
  parentId  String?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  task      Task      @relation(fields: [taskId], references: [id], onDelete: Cascade)
  author    User      @relation(fields: [authorId], references: [id])
  parent    Comment?  @relation("Replies", fields: [parentId], references: [id])
  replies   Comment[] @relation("Replies")
}

model ActivityLog {
  id        String   @id @default(cuid())
  action    String   // e.g. "task.created", "task.status_changed"
  meta      Json?    // { from, to, field, ... }
  taskId    String?
  userId    String
  createdAt DateTime @default(now())

  task      Task?    @relation(fields: [taskId], references: [id], onDelete: SetNull)
  user      User     @relation(fields: [userId], references: [id])
}
```

- [ ] **Step 3: Run migration**

```bash
npx prisma migrate dev --name init
# Expected: Migration created and applied
```

- [ ] **Step 4: Generate Prisma client**

```bash
npx prisma generate
# Expected: Generated Prisma Client
```

- [ ] **Step 5: Create seed.ts**

```typescript
// prisma/seed.ts
import { PrismaClient, Role, TaskStatus, TaskPriority } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: 'admin@slapharma.com' },
    update: {},
    create: {
      email: 'admin@slapharma.com',
      name: 'SLA Admin',
      role: Role.ADMIN,
    },
  });

  const project = await prisma.project.create({
    data: {
      name: 'Drug Trial Q1',
      description: 'Phase 2 clinical trial management',
      members: { create: { userId: admin.id, role: Role.ADMIN } },
    },
  });

  await prisma.task.createMany({
    data: [
      { title: 'Setup patient database', status: TaskStatus.DONE, priority: TaskPriority.HIGH, projectId: project.id, creatorId: admin.id, position: 1 },
      { title: 'Prepare IRB documentation', status: TaskStatus.IN_PROGRESS, priority: TaskPriority.URGENT, projectId: project.id, creatorId: admin.id, position: 2 },
      { title: 'Recruit trial participants', status: TaskStatus.TODO, priority: TaskPriority.MEDIUM, projectId: project.id, creatorId: admin.id, position: 3 },
    ],
  });

  console.log('Seed complete');
}

main().catch(console.error).finally(() => prisma.$disconnect());
```

- [ ] **Step 6: Run seed**

```bash
npx ts-node prisma/seed.ts
# Expected: "Seed complete"
```

- [ ] **Step 7: Commit**

```bash
git add apps/api/prisma
git commit -m "feat: prisma schema with users, projects, tasks, milestones, comments"
```

---

## Chunk 2: Authentication & Authorization

### Task 4: Google OAuth2 + JWT Auth

**Files:**
- Create: `apps/api/src/middleware/auth.ts`
- Create: `apps/api/src/middleware/rbac.ts`
- Create: `apps/api/src/services/auth.service.ts`
- Create: `apps/api/src/routes/auth.routes.ts`
- Create: `apps/api/tests/auth.test.ts`

- [ ] **Step 1: Write auth service tests first**

```typescript
// tests/auth.test.ts
import { generateToken, verifyToken } from '../src/services/auth.service';

describe('Auth Service', () => {
  const payload = { userId: 'cuid123', email: 'test@test.com', role: 'MEMBER' };

  it('generates a valid JWT', () => {
    const token = generateToken(payload);
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);
  });

  it('verifies a valid token and returns payload', () => {
    const token = generateToken(payload);
    const decoded = verifyToken(token);
    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.email).toBe(payload.email);
  });

  it('throws on invalid token', () => {
    expect(() => verifyToken('invalid.token.here')).toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx jest tests/auth.test.ts
# Expected: FAIL - "generateToken is not a function"
```

- [ ] **Step 3: Create `src/services/auth.service.ts`**

```typescript
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx jest tests/auth.test.ts
# Expected: PASS (3 tests)
```

- [ ] **Step 5: Create `src/middleware/auth.ts`**

```typescript
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/auth.service';

export interface AuthRequest extends Request {
  user?: { userId: string; email: string; role: string };
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing token' });
  }
  try {
    req.user = verifyToken(header.slice(7));
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}
```

- [ ] **Step 6: Create `src/middleware/rbac.ts`**

```typescript
import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}
```

- [ ] **Step 7: Create `src/routes/auth.routes.ts`**

```typescript
import { Router } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { prisma } from '../config/prisma';
import { generateToken } from '../services/auth.service';
import { env } from '../config/env';

const router = Router();

// Configure Google strategy only if credentials are set
if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: env.GOOGLE_CALLBACK_URL,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0].value ?? '';
        const user = await prisma.user.upsert({
          where: { googleId: profile.id },
          update: { name: profile.displayName, avatarUrl: profile.photos?.[0].value },
          create: {
            googleId: profile.id,
            email,
            name: profile.displayName,
            avatarUrl: profile.photos?.[0].value,
          },
        });
        done(null, user);
      } catch (err) {
        done(err as Error);
      }
    }
  ));
}

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    const user = req.user as any;
    const token = generateToken({ userId: user.id, email: user.email, role: user.role });
    res.redirect(`${process.env.WEB_URL ?? 'http://localhost:5173'}/auth/callback?token=${token}`);
  }
);

// Dev/test login (disabled in production)
router.post('/dev-login', async (req, res) => {
  if (env.NODE_ENV === 'production') return res.status(404).send();
  const { email } = req.body as { email: string };
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(404).json({ error: 'User not found' });
  const token = generateToken({ userId: user.id, email: user.email, role: user.role });
  res.json({ token, user });
});

router.get('/me', async (req, res) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' });
  try {
    const { verifyToken } = await import('../services/auth.service');
    const payload = verifyToken(header.slice(7));
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    res.json(user);
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
```

- [ ] **Step 8: Wire routes into app.ts**

```typescript
// apps/api/src/app.ts — add to createApp():
import authRoutes from './routes/auth.routes';
import passport from 'passport';
// ...inside createApp():
app.use(passport.initialize());
app.use('/api/auth', authRoutes);
```

- [ ] **Step 9: Test dev-login endpoint**

```bash
# Start the server
npm run dev &
curl -X POST http://localhost:3001/api/auth/dev-login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@slapharma.com"}'
# Expected: {"token":"eyJ...","user":{...}}
```

- [ ] **Step 10: Commit**

```bash
git add apps/api/src/middleware apps/api/src/services/auth.service.ts apps/api/src/routes/auth.routes.ts
git commit -m "feat: Google OAuth2 + JWT authentication with RBAC middleware"
```

---

## Chunk 3: Core REST API (Projects & Tasks)

### Task 5: Projects CRUD API

**Files:**
- Create: `apps/api/src/services/project.service.ts`
- Create: `apps/api/src/routes/projects.routes.ts`
- Create: `apps/api/tests/projects.test.ts`

- [ ] **Step 1: Write failing project service tests**

```typescript
// tests/projects.test.ts
import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/config/prisma';
import { generateToken } from '../src/services/auth.service';

const app = createApp();
let token: string;
let userId: string;

beforeAll(async () => {
  const user = await prisma.user.create({
    data: { email: 'proj-test@test.com', name: 'Test User', role: 'ADMIN' },
  });
  userId = user.id;
  token = generateToken({ userId: user.id, email: user.email, role: user.role });
});

afterAll(async () => {
  await prisma.project.deleteMany({ where: { name: { startsWith: 'Test Project' } } });
  await prisma.user.delete({ where: { id: userId } });
  await prisma.$disconnect();
});

describe('Projects API', () => {
  let projectId: string;

  it('POST /api/projects - creates a project', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test Project Alpha', description: 'Integration test project' });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Test Project Alpha');
    projectId = res.body.id;
  });

  it('GET /api/projects - lists user projects', async () => {
    const res = await request(app)
      .get('/api/projects')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/projects/:id - returns project by id', async () => {
    const res = await request(app)
      .get(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(projectId);
  });

  it('PATCH /api/projects/:id - updates project', async () => {
    const res = await request(app)
      .patch(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test Project Alpha Updated' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Test Project Alpha Updated');
  });

  it('DELETE /api/projects/:id - soft archives project', async () => {
    const res = await request(app)
      .delete(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npx jest tests/projects.test.ts
# Expected: FAIL - 404 on /api/projects
```

- [ ] **Step 3: Create `src/services/project.service.ts`**

```typescript
import { prisma } from '../config/prisma';

export async function createProject(userId: string, data: { name: string; description?: string }) {
  return prisma.project.create({
    data: {
      ...data,
      members: { create: { userId, role: 'ADMIN' } },
    },
    include: { members: true },
  });
}

export async function getUserProjects(userId: string) {
  return prisma.project.findMany({
    where: { archived: false, members: { some: { userId } } },
    include: { members: { include: { user: true } }, _count: { select: { tasks: true } } },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function getProjectById(projectId: string, userId: string) {
  return prisma.project.findFirst({
    where: { id: projectId, members: { some: { userId } } },
    include: { members: { include: { user: true } }, milestones: true },
  });
}

export async function updateProject(projectId: string, data: Partial<{ name: string; description: string; color: string }>) {
  return prisma.project.update({ where: { id: projectId }, data });
}

export async function archiveProject(projectId: string) {
  return prisma.project.update({ where: { id: projectId }, data: { archived: true } });
}
```

- [ ] **Step 4: Create `src/routes/projects.routes.ts`**

```typescript
import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import * as projectService from '../services/project.service';

const router = Router();
router.use(requireAuth);

router.post('/', async (req: AuthRequest, res) => {
  const project = await projectService.createProject(req.user!.userId, req.body);
  res.status(201).json(project);
});

router.get('/', async (req: AuthRequest, res) => {
  const projects = await projectService.getUserProjects(req.user!.userId);
  res.json(projects);
});

router.get('/:id', async (req: AuthRequest, res) => {
  const project = await projectService.getProjectById(req.params.id, req.user!.userId);
  if (!project) return res.status(404).json({ error: 'Not found' });
  res.json(project);
});

router.patch('/:id', async (req: AuthRequest, res) => {
  const project = await projectService.updateProject(req.params.id, req.body);
  res.json(project);
});

router.delete('/:id', async (req: AuthRequest, res) => {
  await projectService.archiveProject(req.params.id);
  res.json({ success: true });
});

export default router;
```

- [ ] **Step 5: Register route in app.ts**

```typescript
import projectRoutes from './routes/projects.routes';
// inside createApp():
app.use('/api/projects', projectRoutes);
```

- [ ] **Step 6: Run tests to verify they pass**

```bash
npx jest tests/projects.test.ts
# Expected: PASS (5 tests)
```

- [ ] **Step 7: Commit**

```bash
git add apps/api/src/services/project.service.ts apps/api/src/routes/projects.routes.ts
git commit -m "feat: projects CRUD API with auth guard"
```

---

### Task 6: Tasks CRUD API + Kanban Position

**Files:**
- Create: `apps/api/src/services/task.service.ts`
- Create: `apps/api/src/routes/tasks.routes.ts`
- Create: `apps/api/tests/tasks.test.ts`

- [ ] **Step 1: Write task service tests**

```typescript
// tests/tasks.test.ts
import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/config/prisma';
import { generateToken } from '../src/services/auth.service';

const app = createApp();
let token: string;
let userId: string;
let projectId: string;

beforeAll(async () => {
  const user = await prisma.user.create({
    data: { email: 'task-test@test.com', name: 'Task Tester', role: 'ADMIN' },
  });
  userId = user.id;
  token = generateToken({ userId: user.id, email: user.email, role: user.role });
  const project = await prisma.project.create({
    data: { name: 'Task Test Project', members: { create: { userId, role: 'ADMIN' } } },
  });
  projectId = project.id;
});

afterAll(async () => {
  await prisma.task.deleteMany({ where: { projectId } });
  await prisma.project.delete({ where: { id: projectId } });
  await prisma.user.delete({ where: { id: userId } });
  await prisma.$disconnect();
});

describe('Tasks API', () => {
  let taskId: string;

  it('POST /api/tasks - creates a task', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Write test plan', projectId, priority: 'HIGH' });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Write test plan');
    taskId = res.body.id;
  });

  it('GET /api/tasks?projectId=... - lists tasks for project', async () => {
    const res = await request(app)
      .get(`/api/tasks?projectId=${projectId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('PATCH /api/tasks/:id/status - updates task status', async () => {
    const res = await request(app)
      .patch(`/api/tasks/${taskId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'IN_PROGRESS' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('IN_PROGRESS');
  });

  it('PATCH /api/tasks/:id/position - reorders task in kanban', async () => {
    const res = await request(app)
      .patch(`/api/tasks/${taskId}/position`)
      .set('Authorization', `Bearer ${token}`)
      .send({ position: 100.5, status: 'IN_REVIEW' });
    expect(res.status).toBe(200);
    expect(res.body.position).toBe(100.5);
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npx jest tests/tasks.test.ts
# Expected: FAIL
```

- [ ] **Step 3: Create `src/services/task.service.ts`**

```typescript
import { prisma } from '../config/prisma';
import { TaskStatus, TaskPriority } from '@prisma/client';

interface CreateTaskInput {
  title: string;
  description?: string;
  projectId: string;
  priority?: TaskPriority;
  assigneeId?: string;
  dueDate?: string;
  milestoneId?: string;
  parentId?: string;
  tags?: string[];
}

export async function createTask(creatorId: string, data: CreateTaskInput) {
  const lastTask = await prisma.task.findFirst({
    where: { projectId: data.projectId, status: 'TODO' },
    orderBy: { position: 'desc' },
  });
  const position = (lastTask?.position ?? 0) + 1000;

  return prisma.task.create({
    data: { ...data, creatorId, position, dueDate: data.dueDate ? new Date(data.dueDate) : undefined },
    include: { assignee: true, creator: true, milestone: true },
  });
}

export async function getProjectTasks(projectId: string) {
  return prisma.task.findMany({
    where: { projectId, parentId: null },
    include: { assignee: true, creator: true, milestone: true, subtasks: true, _count: { select: { comments: true } } },
    orderBy: [{ status: 'asc' }, { position: 'asc' }],
  });
}

export async function updateTaskStatus(taskId: string, status: TaskStatus) {
  return prisma.task.update({
    where: { id: taskId },
    data: { status, completedAt: status === 'DONE' ? new Date() : null },
  });
}

export async function updateTaskPosition(taskId: string, position: number, status: TaskStatus) {
  return prisma.task.update({ where: { id: taskId }, data: { position, status } });
}

export async function updateTask(taskId: string, data: Partial<CreateTaskInput & { status: TaskStatus }>) {
  return prisma.task.update({ where: { id: taskId }, data });
}

export async function deleteTask(taskId: string) {
  return prisma.task.delete({ where: { id: taskId } });
}
```

- [ ] **Step 4: Create `src/routes/tasks.routes.ts`**

```typescript
import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import * as taskService from '../services/task.service';

const router = Router();
router.use(requireAuth);

router.post('/', async (req: AuthRequest, res) => {
  const task = await taskService.createTask(req.user!.userId, req.body);
  res.status(201).json(task);
});

router.get('/', async (req: AuthRequest, res) => {
  const { projectId } = req.query as { projectId: string };
  if (!projectId) return res.status(400).json({ error: 'projectId required' });
  const tasks = await taskService.getProjectTasks(projectId);
  res.json(tasks);
});

router.patch('/:id', async (req: AuthRequest, res) => {
  const task = await taskService.updateTask(req.params.id, req.body);
  res.json(task);
});

router.patch('/:id/status', async (req: AuthRequest, res) => {
  const task = await taskService.updateTaskStatus(req.params.id, req.body.status);
  res.json(task);
});

router.patch('/:id/position', async (req: AuthRequest, res) => {
  const { position, status } = req.body;
  const task = await taskService.updateTaskPosition(req.params.id, position, status);
  res.json(task);
});

router.delete('/:id', async (req: AuthRequest, res) => {
  await taskService.deleteTask(req.params.id);
  res.json({ success: true });
});

export default router;
```

- [ ] **Step 5: Register in app.ts**

```typescript
import taskRoutes from './routes/tasks.routes';
app.use('/api/tasks', taskRoutes);
```

- [ ] **Step 6: Run tests to verify pass**

```bash
npx jest tests/tasks.test.ts
# Expected: PASS (4 tests)
```

- [ ] **Step 7: Add global error handler to app.ts**

```typescript
// At end of createApp(), after routes:
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});
```

- [ ] **Step 8: Commit**

```bash
git add apps/api/src/services/task.service.ts apps/api/src/routes/tasks.routes.ts
git commit -m "feat: tasks CRUD with kanban position + status endpoints"
```

---

## Chunk 4: Frontend Foundation

### Task 7: Vite + React + Tailwind + Shadcn Setup

**Files:**
- Create: `apps/web/` (Vite scaffold)
- Create: `apps/web/src/lib/api.ts`
- Create: `apps/web/src/lib/queryClient.ts`
- Create: `apps/web/src/store/useAppStore.ts`
- Create: `apps/web/src/types/index.ts`

- [ ] **Step 1: Scaffold React app**

```bash
cd apps/web
npm create vite@latest . -- --template react-ts
npm install
npm install @tanstack/react-query axios zustand react-router-dom socket.io-client
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

- [ ] **Step 2: Install Shadcn/ui**

```bash
npx shadcn-ui@latest init
# Select: TypeScript, Default style, Slate base color, CSS variables
npx shadcn-ui@latest add button card input label badge avatar dialog
npx shadcn-ui@latest add dropdown-menu sheet sidebar scroll-area separator
npx shadcn-ui@latest add toast sonner progress
```

- [ ] **Step 3: Create `src/types/index.ts`**

```typescript
export type Role = 'ADMIN' | 'MEMBER' | 'VIEWER';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type MilestoneStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: Role;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  archived: boolean;
  members: ProjectMember[];
  _count?: { tasks: number };
}

export interface ProjectMember {
  userId: string;
  role: Role;
  user: User;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  position: number;
  dueDate?: string;
  projectId: string;
  assignee?: User;
  creator: User;
  milestoneId?: string;
  parentId?: string;
  subtasks?: Task[];
  tags: string[];
  _count?: { comments: number };
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  id: string;
  title: string;
  dueDate: string;
  status: MilestoneStatus;
  projectId: string;
}

export interface Comment {
  id: string;
  body: string;
  taskId: string;
  author: User;
  parentId?: string;
  replies?: Comment[];
  createdAt: string;
}
```

- [ ] **Step 4: Create `src/lib/api.ts`**

```typescript
import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);
```

- [ ] **Step 5: Create `src/lib/queryClient.ts`**

```typescript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,     // 1 minute
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

- [ ] **Step 6: Create `src/store/useAppStore.ts`**

```typescript
import { create } from 'zustand';
import { User, Project } from '../types';

interface AppState {
  currentUser: User | null;
  currentProject: Project | null;
  sidebarOpen: boolean;
  setCurrentUser: (user: User | null) => void;
  setCurrentProject: (project: Project | null) => void;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentUser: null,
  currentProject: null,
  sidebarOpen: true,
  setCurrentUser: (user) => set({ currentUser: user }),
  setCurrentProject: (project) => set({ currentProject: project }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
```

- [ ] **Step 7: Commit**

```bash
git add apps/web
git commit -m "feat: react vite setup with shadcn/ui, zustand, tanstack query"
```

---

### Task 8: App Shell, Routing & Auth Pages

**Files:**
- Create: `apps/web/src/components/layout/AppShell.tsx`
- Create: `apps/web/src/components/layout/Sidebar.tsx`
- Create: `apps/web/src/components/layout/Header.tsx`
- Create: `apps/web/src/pages/LoginPage.tsx`
- Create: `apps/web/src/hooks/useAuth.ts`
- Create: `apps/web/src/App.tsx`

- [ ] **Step 1: Create `src/hooks/useAuth.ts`**

```typescript
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAppStore } from '../store/useAppStore';
import { User } from '../types';

export function useAuth() {
  const { setCurrentUser } = useAppStore();

  const { data: user, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await api.get<User>('/auth/me');
      setCurrentUser(res.data);
      return res.data;
    },
    enabled: !!localStorage.getItem('token'),
    retry: false,
  });

  return { user, isLoading };
}
```

- [ ] **Step 2: Create `src/pages/LoginPage.tsx`**

```typescript
export function LoginPage() {
  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api'}/auth/google`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-md text-center">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">SLAPM</h1>
        <p className="text-slate-500 mb-8">SLA Pharma Project Management</p>
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <img src="/google.svg" alt="Google" className="w-5 h-5" />
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create `src/components/layout/Sidebar.tsx`**

```typescript
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Project } from '../../types';
import { LayoutDashboard, FolderKanban, List, Milestone, Settings } from 'lucide-react';

export function Sidebar() {
  const { projectId } = useParams();

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => (await api.get<Project[]>('/projects')).data,
  });

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 min-h-screen flex flex-col">
      <div className="p-4 text-xl font-bold border-b border-slate-700">SLAPM</div>
      <nav className="flex-1 p-4 space-y-1">
        <Link to="/" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-slate-800 text-sm">
          <LayoutDashboard size={16} /> Dashboard
        </Link>
        <div className="pt-4 pb-1 text-xs text-slate-400 uppercase tracking-wider px-3">Projects</div>
        {projects.map((p) => (
          <Link
            key={p.id}
            to={`/projects/${p.id}`}
            className={`flex items-center gap-2 px-3 py-2 rounded-md hover:bg-slate-800 text-sm ${p.id === projectId ? 'bg-slate-800' : ''}`}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            {p.name}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-700">
        <Link to="/settings" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-slate-800 text-sm">
          <Settings size={16} /> Settings
        </Link>
      </div>
    </aside>
  );
}
```

- [ ] **Step 4: Create `src/components/layout/AppShell.tsx`**

```typescript
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function AppShell() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
}
```

- [ ] **Step 5: Create `src/App.tsx`**

```typescript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { AppShell } from './components/layout/AppShell';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectPage } from './pages/ProjectPage';

function AuthCallback() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  if (token) localStorage.setItem('token', token);
  return <Navigate to="/" replace />;
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  if (!localStorage.getItem('token')) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/" element={<RequireAuth><AppShell /></RequireAuth>}>
            <Route index element={<DashboardPage />} />
            <Route path="projects/:projectId/*" element={<ProjectPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add apps/web/src
git commit -m "feat: app shell with sidebar, routing, auth pages"
```

---

## Chunk 5: Kanban & List Views

### Task 9: Kanban Board with Drag-and-Drop

**Files:**
- Create: `apps/web/src/hooks/useTasks.ts`
- Create: `apps/web/src/components/kanban/KanbanBoard.tsx`
- Create: `apps/web/src/components/kanban/KanbanColumn.tsx`
- Create: `apps/web/src/components/kanban/KanbanCard.tsx`

- [ ] **Step 1: Install DnD library**

```bash
cd apps/web
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

- [ ] **Step 2: Create `src/hooks/useTasks.ts`**

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Task, TaskStatus } from '../types';

export function useTasks(projectId: string) {
  return useQuery({
    queryKey: ['tasks', projectId],
    queryFn: async () => (await api.get<Task[]>(`/tasks?projectId=${projectId}`)).data,
    enabled: !!projectId,
  });
}

export function useUpdateTaskStatus(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: TaskStatus }) =>
      api.patch(`/tasks/${taskId}/status`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks', projectId] }),
  });
}

export function useUpdateTaskPosition(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, position, status }: { taskId: string; position: number; status: TaskStatus }) =>
      api.patch(`/tasks/${taskId}/position`, { position, status }),
    onMutate: async ({ taskId, position, status }) => {
      // Optimistic update
      await qc.cancelQueries({ queryKey: ['tasks', projectId] });
      const prev = qc.getQueryData<Task[]>(['tasks', projectId]);
      qc.setQueryData<Task[]>(['tasks', projectId], (old) =>
        old?.map((t) => t.id === taskId ? { ...t, position, status } : t) ?? []
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(['tasks', projectId], ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['tasks', projectId] }),
  });
}

export function useCreateTask(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Task> & { title: string }) =>
      api.post<Task>('/tasks', { ...data, projectId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks', projectId] }),
  });
}
```

- [ ] **Step 3: Create `src/components/kanban/KanbanCard.tsx`**

```typescript
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '../../../types';
import { Badge } from '../../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import { CalendarDays, MessageSquare, Paperclip } from 'lucide-react';

const priorityColors: Record<string, string> = {
  LOW: 'bg-green-100 text-green-700',
  MEDIUM: 'bg-blue-100 text-blue-700',
  HIGH: 'bg-orange-100 text-orange-700',
  URGENT: 'bg-red-100 text-red-700',
};

interface Props {
  task: Task;
  onClick: (task: Task) => void;
}

export function KanbanCard({ task, onClick }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      {...attributes}
      {...listeners}
      onClick={() => onClick(task)}
      className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-medium text-slate-700 line-clamp-2">{task.title}</p>
        <Badge className={`text-xs shrink-0 ${priorityColors[task.priority]}`}>{task.priority}</Badge>
      </div>
      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {task.tags.map((tag) => (
            <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{tag}</span>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2 text-slate-400">
          {task.dueDate && (
            <span className="flex items-center gap-1 text-xs">
              <CalendarDays size={12} />
              {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}
          {(task._count?.comments ?? 0) > 0 && (
            <span className="flex items-center gap-1 text-xs">
              <MessageSquare size={12} /> {task._count?.comments}
            </span>
          )}
        </div>
        {task.assignee && (
          <Avatar className="h-6 w-6">
            <AvatarImage src={task.assignee.avatarUrl} />
            <AvatarFallback className="text-xs">{task.assignee.name[0]}</AvatarFallback>
          </Avatar>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create `src/components/kanban/KanbanColumn.tsx`**

```typescript
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Task, TaskStatus } from '../../../types';
import { KanbanCard } from './KanbanCard';
import { Plus } from 'lucide-react';

const statusLabels: Record<TaskStatus, string> = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  IN_REVIEW: 'In Review',
  DONE: 'Done',
};

const statusColors: Record<TaskStatus, string> = {
  TODO: 'bg-slate-100',
  IN_PROGRESS: 'bg-blue-50',
  IN_REVIEW: 'bg-yellow-50',
  DONE: 'bg-green-50',
};

interface Props {
  status: TaskStatus;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddTask: (status: TaskStatus) => void;
}

export function KanbanColumn({ status, tasks, onTaskClick, onAddTask }: Props) {
  const { setNodeRef } = useDroppable({ id: status });

  return (
    <div className={`flex flex-col w-72 shrink-0 rounded-xl p-3 ${statusColors[status]}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm text-slate-700">{statusLabels[status]}</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 bg-white rounded-full px-2 py-0.5">{tasks.length}</span>
          <button onClick={() => onAddTask(status)} className="text-slate-400 hover:text-slate-600">
            <Plus size={16} />
          </button>
        </div>
      </div>
      <div ref={setNodeRef} className="flex flex-col gap-2 min-h-[100px]">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <KanbanCard key={task.id} task={task} onClick={onTaskClick} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create `src/components/kanban/KanbanBoard.tsx`**

```typescript
import { useState, useCallback } from 'react';
import { DndContext, DragEndEvent, DragOverEvent, PointerSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Task, TaskStatus } from '../../../types';
import { KanbanColumn } from './KanbanColumn';
import { useTasks, useUpdateTaskPosition } from '../../hooks/useTasks';

const STATUSES: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];

interface Props {
  projectId: string;
  onTaskClick: (task: Task) => void;
  onAddTask: (status: TaskStatus) => void;
}

export function KanbanBoard({ projectId, onTaskClick, onAddTask }: Props) {
  const { data: tasks = [] } = useTasks(projectId);
  const updatePosition = useUpdateTaskPosition(projectId);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const getColumnTasks = (status: TaskStatus) =>
    tasks.filter((t) => t.status === status).sort((a, b) => a.position - b.position);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeTask = tasks.find((t) => t.id === active.id);
    if (!activeTask) return;

    const overStatus = STATUSES.includes(over.id as TaskStatus)
      ? (over.id as TaskStatus)
      : tasks.find((t) => t.id === over.id)?.status ?? activeTask.status;

    const columnTasks = getColumnTasks(overStatus).filter((t) => t.id !== activeTask.id);
    const overIndex = columnTasks.findIndex((t) => t.id === over.id);

    let newPosition: number;
    if (overIndex === -1 || columnTasks.length === 0) {
      newPosition = (columnTasks[columnTasks.length - 1]?.position ?? 0) + 1000;
    } else if (overIndex === 0) {
      newPosition = (columnTasks[0].position / 2);
    } else {
      newPosition = (columnTasks[overIndex - 1].position + columnTasks[overIndex].position) / 2;
    }

    updatePosition.mutate({ taskId: activeTask.id, position: newPosition, status: overStatus });
  }, [tasks, updatePosition]);

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 p-6 overflow-x-auto min-h-full">
        {STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={getColumnTasks(status)}
            onTaskClick={onTaskClick}
            onAddTask={onAddTask}
          />
        ))}
      </div>
    </DndContext>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/components/kanban apps/web/src/hooks/useTasks.ts
git commit -m "feat: kanban board with dnd-kit drag and drop"
```

---

### Task 10: Task List View & Task Detail Panel

**Files:**
- Create: `apps/web/src/components/tasks/TaskList.tsx`
- Create: `apps/web/src/components/tasks/TaskRow.tsx`
- Create: `apps/web/src/components/tasks/TaskDetail.tsx`
- Create: `apps/web/src/components/tasks/TaskForm.tsx`
- Create: `apps/web/src/pages/ProjectPage.tsx`

- [ ] **Step 1: Create `src/components/tasks/TaskRow.tsx`**

```typescript
import { Task } from '../../../types';
import { Badge } from '../../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';

const statusColors = {
  TODO: 'bg-slate-100 text-slate-600',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  IN_REVIEW: 'bg-yellow-100 text-yellow-700',
  DONE: 'bg-green-100 text-green-700',
};

interface Props {
  task: Task;
  onClick: (task: Task) => void;
}

export function TaskRow({ task, onClick }: Props) {
  return (
    <tr
      onClick={() => onClick(task)}
      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
    >
      <td className="py-3 px-4">
        <span className="text-sm text-slate-700">{task.title}</span>
      </td>
      <td className="py-3 px-4">
        <Badge className={`text-xs ${statusColors[task.status]}`}>{task.status.replace('_', ' ')}</Badge>
      </td>
      <td className="py-3 px-4">
        <Badge variant="outline" className="text-xs">{task.priority}</Badge>
      </td>
      <td className="py-3 px-4">
        {task.assignee ? (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={task.assignee.avatarUrl} />
              <AvatarFallback className="text-xs">{task.assignee.name[0]}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-slate-600">{task.assignee.name}</span>
          </div>
        ) : <span className="text-slate-400 text-sm">—</span>}
      </td>
      <td className="py-3 px-4 text-sm text-slate-500">
        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
      </td>
    </tr>
  );
}
```

- [ ] **Step 2: Create `src/components/tasks/TaskList.tsx`**

```typescript
import { useState } from 'react';
import { Task, TaskStatus, TaskPriority } from '../../../types';
import { TaskRow } from './TaskRow';
import { Input } from '../../ui/input';
import { Search } from 'lucide-react';

interface Props {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export function TaskList({ tasks, onTaskClick }: Props) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'ALL'>('ALL');

  const filtered = tasks.filter((t) => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-6">
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as TaskStatus | 'ALL')}
          className="border border-gray-200 rounded-md px-3 py-2 text-sm"
        >
          <option value="ALL">All statuses</option>
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="IN_REVIEW">In Review</option>
          <option value="DONE">Done</option>
        </select>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Task</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Priority</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Assignee</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Due Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((task) => <TaskRow key={task.id} task={task} onClick={onTaskClick} />)}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="py-8 text-center text-slate-400">No tasks found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create `src/pages/ProjectPage.tsx`**

```typescript
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { KanbanBoard } from '../components/kanban/KanbanBoard';
import { TaskList } from '../components/tasks/TaskList';
import { useTasks } from '../hooks/useTasks';
import { Task, TaskStatus } from '../types';
import { LayoutGrid, List } from 'lucide-react';

type ViewMode = 'kanban' | 'list';

export function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const { data: tasks = [] } = useTasks(projectId ?? '');

  if (!projectId) return null;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-6 py-3 border-b border-gray-200 bg-white">
        <button
          onClick={() => setViewMode('kanban')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm ${viewMode === 'kanban' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-gray-100'}`}
        >
          <LayoutGrid size={16} /> Kanban
        </button>
        <button
          onClick={() => setViewMode('list')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm ${viewMode === 'list' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-gray-100'}`}
        >
          <List size={16} /> List
        </button>
      </div>
      {viewMode === 'kanban' ? (
        <KanbanBoard projectId={projectId} onTaskClick={setSelectedTask} onAddTask={() => {}} />
      ) : (
        <TaskList tasks={tasks} onTaskClick={setSelectedTask} />
      )}
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/components/tasks apps/web/src/pages/ProjectPage.tsx
git commit -m "feat: task list view with search/filter + project page with view switcher"
```

---

## Chunk 6: Milestones, Comments & Real-time

### Task 11: Milestones API & UI

**Files:**
- Create: `apps/api/src/services/milestone.service.ts`
- Create: `apps/api/src/routes/milestones.routes.ts`
- Create: `apps/web/src/components/milestones/MilestoneList.tsx`

- [ ] **Step 1: Write milestone service**

```typescript
// apps/api/src/services/milestone.service.ts
import { prisma } from '../config/prisma';
import { MilestoneStatus } from '@prisma/client';

export async function createMilestone(data: {
  title: string;
  projectId: string;
  dueDate: string;
  description?: string;
}) {
  return prisma.milestone.create({ data: { ...data, dueDate: new Date(data.dueDate) } });
}

export async function getProjectMilestones(projectId: string) {
  return prisma.milestone.findMany({
    where: { projectId },
    include: { _count: { select: { tasks: true } }, tasks: { select: { id: true, status: true } } },
    orderBy: { dueDate: 'asc' },
  });
}

export async function updateMilestoneStatus(milestoneId: string, status: MilestoneStatus) {
  return prisma.milestone.update({ where: { id: milestoneId }, data: { status } });
}

// Cron-safe: marks overdue milestones automatically
export async function syncOverdueMilestones() {
  return prisma.milestone.updateMany({
    where: { dueDate: { lt: new Date() }, status: { in: ['PENDING', 'IN_PROGRESS'] } },
    data: { status: 'OVERDUE' },
  });
}
```

- [ ] **Step 2: Create milestone route and register in app.ts**

```typescript
// apps/api/src/routes/milestones.routes.ts
import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import * as milestoneService from '../services/milestone.service';

const router = Router();
router.use(requireAuth);

router.post('/', async (req: AuthRequest, res) => {
  const milestone = await milestoneService.createMilestone(req.body);
  res.status(201).json(milestone);
});

router.get('/', async (req: AuthRequest, res) => {
  const { projectId } = req.query as { projectId: string };
  const milestones = await milestoneService.getProjectMilestones(projectId);
  res.json(milestones);
});

router.patch('/:id/status', async (req: AuthRequest, res) => {
  const milestone = await milestoneService.updateMilestoneStatus(req.params.id, req.body.status);
  res.json(milestone);
});

export default router;
```

- [ ] **Step 3: Create milestone UI component**

```typescript
// apps/web/src/components/milestones/MilestoneList.tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Milestone } from '../../../types';
import { Badge } from '../ui/badge';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

const statusIcons = {
  PENDING: <Clock size={16} className="text-slate-400" />,
  IN_PROGRESS: <Clock size={16} className="text-blue-500" />,
  COMPLETED: <CheckCircle size={16} className="text-green-500" />,
  OVERDUE: <AlertCircle size={16} className="text-red-500" />,
};

export function MilestoneList({ projectId }: { projectId: string }) {
  const { data: milestones = [] } = useQuery({
    queryKey: ['milestones', projectId],
    queryFn: async () => (await api.get<Milestone[]>(`/milestones?projectId=${projectId}`)).data,
  });

  return (
    <div className="p-6 space-y-3">
      <h2 className="font-semibold text-slate-800">Milestones</h2>
      {milestones.map((m) => (
        <div key={m.id} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {statusIcons[m.status]}
            <div>
              <p className="font-medium text-sm text-slate-700">{m.title}</p>
              <p className="text-xs text-slate-400">Due {new Date(m.dueDate).toLocaleDateString()}</p>
            </div>
          </div>
          <Badge variant="outline">{m.status}</Badge>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add apps/api/src/services/milestone.service.ts apps/api/src/routes/milestones.routes.ts
git add apps/web/src/components/milestones
git commit -m "feat: milestones CRUD with overdue auto-detection"
```

---

### Task 12: Comments API + Socket.io Real-time

**Files:**
- Create: `apps/api/src/routes/comments.routes.ts`
- Create: `apps/api/src/sockets/taskEvents.ts`
- Create: `apps/api/src/index.ts` (update with Socket.io)
- Create: `apps/web/src/hooks/useSocket.ts`

- [ ] **Step 1: Create comments route**

```typescript
// apps/api/src/routes/comments.routes.ts
import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { prisma } from '../config/prisma';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  const { taskId } = req.query as { taskId: string };
  const comments = await prisma.comment.findMany({
    where: { taskId, parentId: null },
    include: { author: true, replies: { include: { author: true } } },
    orderBy: { createdAt: 'asc' },
  });
  res.json(comments);
});

router.post('/', async (req: AuthRequest, res) => {
  const { taskId, body, parentId } = req.body;
  const comment = await prisma.comment.create({
    data: { taskId, body, parentId, authorId: req.user!.userId },
    include: { author: true },
  });
  // Emit via socket (injected via app)
  const io = (req.app as any).get('io');
  if (io) io.to(`task:${taskId}`).emit('comment:new', comment);
  res.status(201).json(comment);
});

export default router;
```

- [ ] **Step 2: Create `src/sockets/taskEvents.ts`**

```typescript
import { Server } from 'socket.io';
import { verifyToken } from '../services/auth.service';

export function setupSocketIO(io: Server) {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    try {
      const user = verifyToken(token);
      (socket as any).user = user;
      next();
    } catch {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    socket.on('task:join', (taskId: string) => socket.join(`task:${taskId}`));
    socket.on('task:leave', (taskId: string) => socket.leave(`task:${taskId}`));
    socket.on('project:join', (projectId: string) => socket.join(`project:${projectId}`));
  });
}
```

- [ ] **Step 3: Update `src/index.ts` to attach Socket.io**

```typescript
import http from 'http';
import { Server } from 'socket.io';
import { createApp } from './app';
import { setupSocketIO } from './sockets/taskEvents';
import { env } from './config/env';

const app = createApp();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: 'http://localhost:5173', credentials: true } });

setupSocketIO(io);
app.set('io', io);

server.listen(Number(env.API_PORT), () => {
  console.log(`API running on port ${env.API_PORT}`);
});
```

- [ ] **Step 4: Create `src/hooks/useSocket.ts` in frontend**

```typescript
import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function useSocket() {
  if (!socket) {
    socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') ?? 'http://localhost:3001', {
      auth: { token: localStorage.getItem('token') },
    });
  }
  return socket;
}

export function useTaskSocket(taskId: string, onComment: (comment: unknown) => void) {
  const s = useSocket();
  useEffect(() => {
    s.emit('task:join', taskId);
    s.on('comment:new', onComment);
    return () => {
      s.emit('task:leave', taskId);
      s.off('comment:new', onComment);
    };
  }, [taskId]);
}
```

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/routes/comments.routes.ts apps/api/src/sockets apps/api/src/index.ts
git add apps/web/src/hooks/useSocket.ts
git commit -m "feat: comments API with socket.io real-time events"
```

---

## Chunk 7: Google Drive Integration

### Task 13: Google Drive OAuth + File Upload

**Files:**
- Create: `apps/api/src/services/drive.service.ts`
- Create: `apps/api/src/routes/drive.routes.ts`
- Create: `apps/web/src/components/drive/DriveUpload.tsx`
- Create: `apps/api/tests/drive.test.ts`

- [ ] **Step 1: Write drive service (mocked for unit tests)**

```typescript
// apps/api/src/services/drive.service.ts
import { google } from 'googleapis';
import { env } from '../config/env';

export function getDriveClient(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.drive({ version: 'v3', auth });
}

export async function createProjectFolder(accessToken: string, projectName: string): Promise<string> {
  const drive = getDriveClient(accessToken);
  const res = await drive.files.create({
    requestBody: {
      name: `SLAPM - ${projectName}`,
      mimeType: 'application/vnd.google-apps.folder',
    },
    fields: 'id',
  });
  return res.data.id ?? '';
}

export async function uploadFile(
  accessToken: string,
  folderId: string,
  fileName: string,
  mimeType: string,
  buffer: Buffer
): Promise<{ fileId: string; name: string; webViewLink: string }> {
  const drive = getDriveClient(accessToken);
  const { Readable } = await import('stream');
  const stream = Readable.from(buffer);

  const res = await drive.files.create({
    requestBody: { name: fileName, parents: [folderId] },
    media: { mimeType, body: stream },
    fields: 'id, name, webViewLink',
  });

  return {
    fileId: res.data.id ?? '',
    name: res.data.name ?? fileName,
    webViewLink: res.data.webViewLink ?? '',
  };
}

export async function listFolderFiles(accessToken: string, folderId: string) {
  const drive = getDriveClient(accessToken);
  const res = await drive.files.list({
    q: `'${folderId}' in parents and trashed = false`,
    fields: 'files(id, name, mimeType, webViewLink, size, modifiedTime)',
  });
  return res.data.files ?? [];
}
```

- [ ] **Step 2: Create drive routes with multer upload**

```bash
npm install multer @types/multer
```

```typescript
// apps/api/src/routes/drive.routes.ts
import { Router } from 'express';
import multer from 'multer';
import { requireAuth, AuthRequest } from '../middleware/auth';
import * as driveService from '../services/drive.service';
import { prisma } from '../config/prisma';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

router.use(requireAuth);

// Attach Google Drive to project (store folder ID)
router.post('/projects/:projectId/connect', async (req: AuthRequest, res) => {
  const { accessToken } = req.body;
  const project = await prisma.project.findUnique({ where: { id: req.params.projectId } });
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const folderId = await driveService.createProjectFolder(accessToken, project.name);
  await prisma.project.update({ where: { id: req.params.projectId }, data: { driveFolder: folderId } });
  res.json({ folderId });
});

// Upload file to task
router.post('/tasks/:taskId/upload', upload.single('file'), async (req: AuthRequest, res) => {
  const { accessToken } = req.body;
  const task = await prisma.task.findUnique({
    where: { id: req.params.taskId },
    include: { project: true },
  });
  if (!task?.project.driveFolder) return res.status(400).json({ error: 'Project not connected to Drive' });
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const fileInfo = await driveService.uploadFile(
    accessToken,
    task.project.driveFolder,
    req.file.originalname,
    req.file.mimetype,
    req.file.buffer
  );

  const existing = (task.driveFiles as any[]) ?? [];
  await prisma.task.update({
    where: { id: req.params.taskId },
    data: { driveFiles: [...existing, fileInfo] },
  });

  res.json(fileInfo);
});

export default router;
```

- [ ] **Step 3: Create DriveUpload component**

```typescript
// apps/web/src/components/drive/DriveUpload.tsx
import { useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Paperclip, Upload } from 'lucide-react';

interface Props {
  taskId: string;
  projectId: string;
}

export function DriveUpload({ taskId, projectId }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();

  const upload = useMutation({
    mutationFn: async (file: File) => {
      // Access token stored after Google login
      const accessToken = localStorage.getItem('google_access_token') ?? '';
      const form = new FormData();
      form.append('file', file);
      form.append('accessToken', accessToken);
      return api.post(`/drive/tasks/${taskId}/upload`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks', projectId] }),
  });

  return (
    <div>
      <input ref={fileRef} type="file" className="hidden" onChange={(e) => {
        const f = e.target.files?.[0];
        if (f) upload.mutate(f);
      }} />
      <button
        onClick={() => fileRef.current?.click()}
        disabled={upload.isPending}
        className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-md border border-gray-200 hover:bg-gray-50"
      >
        <Paperclip size={14} />
        {upload.isPending ? 'Uploading...' : 'Attach file'}
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Register drive routes in app.ts**

```typescript
import driveRoutes from './routes/drive.routes';
app.use('/api/drive', driveRoutes);
```

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/services/drive.service.ts apps/api/src/routes/drive.routes.ts
git add apps/web/src/components/drive
git commit -m "feat: Google Drive integration with folder creation and file upload"
```

---

## Chunk 8: Advanced Features & Export

### Task 14: Gantt Chart View

**Files:**
- Create: `apps/web/src/components/gantt/GanttChart.tsx`

- [ ] **Step 1: Install Recharts**

```bash
cd apps/web && npm install recharts
```

- [ ] **Step 2: Create GanttChart component**

```typescript
// apps/web/src/components/gantt/GanttChart.tsx
import { useMemo } from 'react';
import { Task } from '../../../types';

interface GanttRow {
  id: string;
  title: string;
  start: Date;
  end: Date;
  status: string;
  color: string;
}

const statusColors = {
  TODO: '#94a3b8',
  IN_PROGRESS: '#3b82f6',
  IN_REVIEW: '#f59e0b',
  DONE: '#22c55e',
};

interface Props {
  tasks: Task[];
  startDate?: Date;
  endDate?: Date;
}

export function GanttChart({ tasks, startDate, endDate }: Props) {
  const now = new Date();
  const chartStart = startDate ?? new Date(now.getFullYear(), now.getMonth(), 1);
  const chartEnd = endDate ?? new Date(now.getFullYear(), now.getMonth() + 3, 0);
  const totalDays = Math.ceil((chartEnd.getTime() - chartStart.getTime()) / 86400000);

  const rows = useMemo<GanttRow[]>(() =>
    tasks
      .filter((t) => t.dueDate)
      .map((t) => ({
        id: t.id,
        title: t.title,
        start: new Date(t.createdAt),
        end: new Date(t.dueDate!),
        status: t.status,
        color: statusColors[t.status],
      })),
    [tasks]
  );

  const dayOffset = (d: Date) => Math.max(0, Math.ceil((d.getTime() - chartStart.getTime()) / 86400000));
  const dayWidth = (start: Date, end: Date) => Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000));

  // Build header months
  const months: { label: string; days: number }[] = [];
  let cursor = new Date(chartStart);
  while (cursor < chartEnd) {
    const monthEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
    const daysInRange = Math.min(
      Math.ceil((monthEnd.getTime() - cursor.getTime()) / 86400000) + 1,
      totalDays - dayOffset(cursor)
    );
    months.push({ label: cursor.toLocaleString('default', { month: 'short', year: 'numeric' }), days: daysInRange });
    cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
  }

  const DAY_PX = 20;

  return (
    <div className="p-6 overflow-x-auto">
      <div style={{ minWidth: totalDays * DAY_PX + 200 }}>
        {/* Header */}
        <div className="flex border-b border-gray-200 mb-1">
          <div className="w-48 shrink-0" />
          <div className="flex">
            {months.map((m, i) => (
              <div key={i} style={{ width: m.days * DAY_PX }}
                className="text-xs text-slate-500 font-medium px-1 py-1 border-r border-gray-100">
                {m.label}
              </div>
            ))}
          </div>
        </div>
        {/* Rows */}
        {rows.map((row) => (
          <div key={row.id} className="flex items-center h-10 border-b border-gray-50 hover:bg-gray-50">
            <div className="w-48 shrink-0 text-sm text-slate-600 truncate pr-4">{row.title}</div>
            <div className="relative flex-1 h-6">
              <div
                style={{
                  left: dayOffset(row.start) * DAY_PX,
                  width: dayWidth(row.start, row.end) * DAY_PX,
                  backgroundColor: row.color,
                }}
                className="absolute top-0 h-full rounded-full opacity-80 flex items-center px-2"
              >
                <span className="text-white text-xs truncate">{row.title}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Add Gantt tab to ProjectPage**

```typescript
// In ProjectPage.tsx, add to viewMode type: 'kanban' | 'list' | 'gantt'
// Add button: <GanttChart tasks={tasks} />
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/components/gantt
git commit -m "feat: gantt chart view with timeline visualization"
```

---

### Task 15: Dashboard & KPI Widgets

**Files:**
- Create: `apps/web/src/components/dashboard/Dashboard.tsx`
- Create: `apps/web/src/components/dashboard/KpiCard.tsx`
- Create: `apps/web/src/pages/DashboardPage.tsx`

- [ ] **Step 1: Create KpiCard**

```typescript
// apps/web/src/components/dashboard/KpiCard.tsx
interface Props {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
}

export function KpiCard({ title, value, subtitle, color = '#3b82f6' }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-sm text-slate-500 mb-1">{title}</p>
      <p className="text-3xl font-bold" style={{ color }}>{value}</p>
      {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
    </div>
  );
}
```

- [ ] **Step 2: Create Dashboard with Recharts**

```typescript
// apps/web/src/components/dashboard/Dashboard.tsx
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { KpiCard } from './KpiCard';
import { Project, Task } from '../../../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export function Dashboard() {
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => (await api.get<Project[]>('/projects')).data,
  });

  // Aggregate stats from project task counts
  const totalTasks = projects.reduce((sum, p) => sum + (p._count?.tasks ?? 0), 0);
  const activeProjects = projects.filter((p) => !p.archived).length;

  const statusData = [
    { name: 'To Do', value: 0, color: '#94a3b8' },
    { name: 'In Progress', value: 0, color: '#3b82f6' },
    { name: 'In Review', value: 0, color: '#f59e0b' },
    { name: 'Done', value: 0, color: '#22c55e' },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard title="Active Projects" value={activeProjects} color="#3b82f6" />
        <KpiCard title="Total Tasks" value={totalTasks} color="#8b5cf6" />
        <KpiCard title="Team Members" value={13} subtitle="8 employees + 5 consultants" color="#10b981" />
        <KpiCard title="Completion Rate" value="—" subtitle="Select a project" color="#f59e0b" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-slate-700 mb-4">Projects Overview</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={projects.map((p) => ({ name: p.name.slice(0, 15), tasks: p._count?.tasks ?? 0 }))}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="tasks" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-slate-700 mb-4">Task Status Distribution</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create DashboardPage**

```typescript
// apps/web/src/pages/DashboardPage.tsx
import { Dashboard } from '../components/dashboard/Dashboard';
export function DashboardPage() { return <Dashboard />; }
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/components/dashboard apps/web/src/pages/DashboardPage.tsx
git commit -m "feat: dashboard with KPI cards and recharts visualizations"
```

---

### Task 16: CSV/PDF Export

**Files:**
- Create: `apps/api/src/services/export.service.ts`
- Create: `apps/api/src/routes/export.routes.ts`

- [ ] **Step 1: Create export service**

```typescript
// apps/api/src/services/export.service.ts
import { prisma } from '../config/prisma';
import { stringify } from 'csv-stringify/sync';
import PDFDocument from 'pdfkit';

export async function exportTasksCSV(projectId: string): Promise<string> {
  const tasks = await prisma.task.findMany({
    where: { projectId },
    include: { assignee: true, milestone: true },
    orderBy: { status: 'asc' },
  });

  return stringify(tasks.map((t) => ({
    ID: t.id,
    Title: t.title,
    Status: t.status,
    Priority: t.priority,
    Assignee: t.assignee?.name ?? '',
    'Due Date': t.dueDate?.toISOString().split('T')[0] ?? '',
    Milestone: t.milestone?.title ?? '',
    'Created At': t.createdAt.toISOString().split('T')[0],
  })), { header: true });
}

export function generateTasksPDF(
  projectName: string,
  tasks: Array<{ title: string; status: string; priority: string; assignee?: { name: string } | null; dueDate?: Date | null }>
): Buffer {
  const doc = new PDFDocument({ margin: 50 });
  const chunks: Buffer[] = [];
  doc.on('data', (chunk) => chunks.push(chunk));

  doc.fontSize(20).fillColor('#1e293b').text(`${projectName} - Task Report`, { align: 'center' });
  doc.moveDown();
  doc.fontSize(10).fillColor('#64748b').text(`Generated: ${new Date().toLocaleDateString()}`);
  doc.moveDown(2);

  tasks.forEach((task, i) => {
    doc.fontSize(11).fillColor('#1e293b').text(`${i + 1}. ${task.title}`);
    doc.fontSize(9).fillColor('#64748b')
      .text(`   Status: ${task.status}  |  Priority: ${task.priority}  |  Assignee: ${task.assignee?.name ?? 'Unassigned'}  |  Due: ${task.dueDate?.toLocaleDateString() ?? 'None'}`);
    doc.moveDown(0.5);
  });

  doc.end();
  return Buffer.concat(chunks);
}
```

- [ ] **Step 2: Create export routes**

```typescript
// apps/api/src/routes/export.routes.ts
import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { prisma } from '../config/prisma';
import * as exportService from '../services/export.service';

const router = Router();
router.use(requireAuth);

router.get('/projects/:projectId/tasks.csv', async (req: AuthRequest, res) => {
  const csv = await exportService.exportTasksCSV(req.params.projectId);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="tasks-${req.params.projectId}.csv"`);
  res.send(csv);
});

router.get('/projects/:projectId/tasks.pdf', async (req: AuthRequest, res) => {
  const project = await prisma.project.findUnique({ where: { id: req.params.projectId } });
  const tasks = await prisma.task.findMany({
    where: { projectId: req.params.projectId },
    include: { assignee: true },
    orderBy: { status: 'asc' },
  });
  const pdf = exportService.generateTasksPDF(project?.name ?? 'Project', tasks);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="tasks-${req.params.projectId}.pdf"`);
  res.send(pdf);
});

export default router;
```

- [ ] **Step 3: Register export routes in app.ts**

```typescript
import exportRoutes from './routes/export.routes';
app.use('/api/export', exportRoutes);
```

- [ ] **Step 4: Commit**

```bash
git add apps/api/src/services/export.service.ts apps/api/src/routes/export.routes.ts
git commit -m "feat: CSV and PDF export for project tasks"
```

---

## Chunk 9: Testing, Security & Deployment

### Task 17: Test Suite Completion

**Files:**
- Create: `apps/api/jest.config.ts`
- Create: `apps/api/tests/milestones.test.ts`

- [ ] **Step 1: Configure Jest**

```typescript
// apps/api/jest.config.ts
import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
  setupFilesAfterFramework: [],
  globalSetup: undefined,
  coverageThreshold: { global: { lines: 70, functions: 70 } },
};
export default config;
```

- [ ] **Step 2: Run full test suite**

```bash
cd apps/api
npx jest --coverage
# Expected: 70%+ coverage on services and routes
```

- [ ] **Step 3: Fix any failing tests**

Review failures one by one. Common issues:
- Missing `await prisma.$disconnect()` in afterAll hooks
- Leftover test data not cleaned up (add `beforeEach` cleanup)
- Port conflicts (set `TEST_PORT=3002` in test env)

- [ ] **Step 4: Commit**

```bash
git add apps/api/jest.config.ts apps/api/tests
git commit -m "test: complete API test suite with 70%+ coverage"
```

---

### Task 18: Security Hardening

**Files:**
- Modify: `apps/api/src/app.ts` (rate limiting)
- Modify: `apps/api/src/routes/tasks.routes.ts` (input validation)

- [ ] **Step 1: Add rate limiting**

```bash
cd apps/api && npm install express-rate-limit
```

```typescript
// In app.ts
import rateLimit from 'express-rate-limit';
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, standardHeaders: true });
app.use('/api', limiter);
```

- [ ] **Step 2: Add input validation with Zod**

```typescript
// apps/api/src/middleware/validate.ts
import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.flatten() });
    }
    req.body = result.data;
    next();
  };
}
```

- [ ] **Step 3: Add project membership check to task routes**

Ensure users can only read/write tasks in projects they are members of. Add to `task.service.ts`:

```typescript
export async function assertProjectMember(userId: string, projectId: string) {
  const member = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId, projectId } },
  });
  if (!member) throw new Error('Forbidden');
}
```

- [ ] **Step 4: Commit**

```bash
git add apps/api/src/middleware/validate.ts apps/api/src/app.ts
git commit -m "feat: rate limiting, zod validation, project membership checks"
```

---

### Task 19: Docker & Deployment

**Files:**
- Create: `apps/api/Dockerfile`
- Create: `apps/web/Dockerfile`
- Create: `docker-compose.prod.yml`

- [ ] **Step 1: Create API Dockerfile**

```dockerfile
# apps/api/Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
EXPOSE 3001
CMD ["node", "dist/index.js"]
```

- [ ] **Step 2: Create web Dockerfile**

```dockerfile
# apps/web/Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

- [ ] **Step 3: Create production docker-compose**

```yaml
# docker-compose.prod.yml
version: '3.9'
services:
  api:
    build: ./apps/api
    environment:
      DATABASE_URL: ${DATABASE_URL}
      JWT_SECRET: ${JWT_SECRET}
      REDIS_URL: redis://redis:6379
    depends_on: [postgres, redis]
    ports: ["3001:3001"]

  web:
    build:
      context: ./apps/web
      args:
        VITE_API_URL: ${VITE_API_URL}
    ports: ["80:80"]
    depends_on: [api]

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: slapm
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes: [pgdata:/var/lib/postgresql/data]

  redis:
    image: redis:7-alpine

volumes:
  pgdata:
```

- [ ] **Step 4: Build and test production containers**

```bash
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
# Verify API: curl http://localhost:3001/health
# Verify Web: open http://localhost
```

- [ ] **Step 5: Add deploy script to package.json**

```json
{
  "scripts": {
    "deploy:railway": "railway up",
    "deploy:fly": "fly deploy"
  }
}
```

- [ ] **Step 6: Final commit**

```bash
git add apps/api/Dockerfile apps/web/Dockerfile docker-compose.prod.yml
git commit -m "chore: production Docker build for API and web"
```

---

## Summary

| Phase | Tasks | Deliverable |
|-------|-------|-------------|
| Chunk 1 | 1–3 | Monorepo, PostgreSQL schema, Docker infra |
| Chunk 2 | 4 | Google OAuth2, JWT auth, RBAC middleware |
| Chunk 3 | 5–6 | Projects + Tasks REST API (fully tested) |
| Chunk 4 | 7–8 | React app shell with routing + auth pages |
| Chunk 5 | 9–10 | Kanban (dnd-kit) + List view with filters |
| Chunk 6 | 11–12 | Milestones, Comments, Socket.io real-time |
| Chunk 7 | 13 | Google Drive folder + file upload |
| Chunk 8 | 14–16 | Gantt chart, Dashboard KPIs, CSV/PDF export |
| Chunk 9 | 17–19 | Tests (70%+ coverage), security, Docker deploy |

**Estimated effort:** 200 hours (8–12 weeks with Claude Code scaffolding)
**Target users:** 13 (8 SLA employees + 5 consultants)
