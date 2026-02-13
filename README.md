# QA Automation Engineer – Assignment

Solution covering:

1. **UI Automation** – E2E tests for [Automation Exercise](https://www.automationexercise.com/) using Playwright, TypeScript, and the Page Object Model (POM)
2. **Database** – PostgreSQL CRUD operations (reference: [pgexercises.com](https://pgexercises.com/))
3. **API** – gRPC CRUD operations against [grpcb.in](https://grpcb.in/)

---

## UI Automation – E2E Flow

End-to-end tests for [Automation Exercise](https://www.automationexercise.com/) using **Playwright** and **TypeScript** with the **Page Object Model (POM)** design pattern.

## Scope

- **Navigate** the site (Home → Products)
- **Search** for a product
- **Add to cart**
- **Checkout simulation** (view cart, proceed to checkout, optional payment flow)

## Project structure

```
├── db/                    # PostgreSQL CRUD (see Database Task below)
│   ├── config.ts
│   ├── connection.ts
│   ├── crud.ts
│   └── index.ts
├── grpc/                  # gRPC CRUD for grpcb.in (see API Task below)
│   ├── config.ts          # Endpoint (GRPC_TARGET, GRPC_USE_TLS)
│   ├── client.ts          # Proto load and client
│   ├── crud.ts            # Create, Read, Update, Delete
│   └── index.ts
├── proto/                 # Minimal protos for ABitOfEverythingService
│   ├── a_bit_of_everything.proto
│   ├── sub2.proto
│   └── google/protobuf/empty.proto
├── pages/
│   ├── BasePage.ts      # Base page with common nav and URL helpers
│   ├── HomePage.ts      # Home page
│   ├── ProductsPage.ts  # Products list, search, add to cart
│   ├── CartPage.ts      # View cart, proceed to checkout
│   └── CheckoutPage.ts  # Place order, payment (simulation)
├── tests/
│   ├── e2e-flow.spec.ts   # E2E UI test
│   ├── db-crud.spec.ts    # DB CRUD tests
│   └── grpc-crud.spec.ts  # gRPC CRUD tests
├── playwright.config.ts
├── tsconfig.json
└── package.json
```

## Prerequisites

- **Node.js** 18+
- **npm** or **yarn**

## Setup

```bash
npm install
npm run setup            # or: npx playwright install chromium
```

If E2E tests fail with "Executable doesn't exist", run `npx playwright install` from your terminal.

## Run tests

```bash
# Headless (default). Uses 2 retries; the site can be slow.
npm test

# Headed browser
npm run test:headed

# UI mode
npm run test:ui
```

If browsers are installed in a custom path (e.g. `./playwright-browsers`), run with:
`PLAYWRIGHT_BROWSERS_PATH=./playwright-browsers npm test`

## View report

```bash
npm run report
```

---

## Database Task – PostgreSQL

PostgreSQL CRUD is implemented in the `db/` folder. Reference site: [pgexercises.com](https://pgexercises.com/).

### Connection string

Format: `postgresql://postgres:mypassword@localhost:5432/mydatabase`

- Set `DATABASE_URL` in your environment, or copy `.env.example` to `.env` and edit.
- Default (if unset): `postgresql://postgres:mypassword@localhost:5432/mydatabase`

### Setup

1. Ensure PostgreSQL is running (e.g. localhost:5432).
2. Create the database and user if needed:
   ```bash
   createdb mydatabase
   # If needed: psql -c "ALTER USER postgres PASSWORD 'mypassword';"
   ```
3. Optional: `cp .env.example .env` and set `DATABASE_URL`.

### CRUD API (`db/crud.ts`)

| Operation | Function   | Description                    |
|----------|------------|--------------------------------|
| Create   | `create()` | Insert row; returns created row with `id` |
| Read     | `read(id)` | Get one row by id              |
| Read all | `readAll()`| Get all rows                   |
| Update   | `update(id, updates)` | Update name/description |
| Delete   | `remove(id)` | Delete row by id             |

Table: `demo_items` (`id`, `name`, `description`, `created_at`). Call `initTable()` once to create it.

### Run DB tests

```bash
npm run test:db
# or
npx playwright test tests/db-crud.spec.ts
```

Without PostgreSQL, tests use SQLite. Or run with SQLite explicitly:
```bash
npm run test:db:sqlite
```

### Example usage in code

```ts
import { initTable, create, read, update, remove, closePool } from './db';

await initTable();
const row = await create({ name: 'Item', description: 'Description' });
const one = await read(row.id!);
await update(row.id!, { name: 'Updated' });
await remove(row.id!);
await closePool();
```

---

## API Task – gRPC

gRPC CRUD is implemented against [grpcb.in](https://grpcb.in/) (gRPC request/response test service).

### Endpoint

- **Without TLS:** `grpcb.in:9000` (default)
- **With TLS:** `grpcb.in:9001` (set `GRPC_USE_TLS=1`)

Override target with `GRPC_TARGET` (e.g. `localhost:50051`).

### Structure

| File / folder | Purpose |
|---------------|--------|
| `grpc/config.ts` | Endpoint and TLS options |
| `grpc/client.ts` | Load proto, create client, promisified CRUD methods |
| `grpc/crud.ts` | High-level Create, Read, Update, Delete; shared client |
| `proto/` | Minimal protos for `ABitOfEverythingService` (Create, Lookup, Update, Delete) |

### CRUD API (`grpc/crud.ts`)

| Operation | Function | Description |
|-----------|----------|-------------|
| Create | `create(item)` | Create resource; returns `{ uuid, string_value }` |
| Read | `read(uuid)` | Lookup by uuid; returns item or `null` |
| Update | `update(uuid, updates)` | Update `string_value` by uuid |
| Delete | `remove(uuid)` | Delete by uuid |

Call `closeCrudClient()` when done (e.g. in `afterAll`).

### Run gRPC tests

```bash
npm run test:grpc
# or
npx playwright test tests/grpc-crud.spec.ts
```

If grpcb.in is unreachable, tests are skipped.

### Example usage in code

```ts
import { create, read, update, remove, closeCrudClient } from './grpc';

const item = await create({ string_value: 'hello' });
const found = await read(item.uuid);
await update(item.uuid, { string_value: 'updated' });
await remove(item.uuid);
closeCrudClient();
```

---

## Design

- **Page Object Model**: Each page (Home, Products, Cart, Checkout) has a class in `pages/` with locators and actions. `BasePage` holds shared navigation and URL logic.
- **Single E2E flow**: One spec covers navigate → search → add to cart → checkout; the test adapts if the site shows “Register/Login” before checkout or allows placing an order with test payment data.
