# Hamzury

Next.js site with a PostgreSQL backend for applications, payment receipts, and partnership / sponsorship enquiries.

## What it does

- Public site: the existing Hamzury journey, now saving form data to Postgres
- Applicants upload a transfer receipt (JPG, PNG, WEBP or PDF) instead of relying only on WhatsApp
- Staff desk at `/admin` to review applications, view receipts, and verify or reject payments

## Setup

PostgreSQL 16 is expected on `localhost:5432`. A `hamzury` database should exist.

```bash
cp .env.example .env
# DATABASE_URL=postgresql://YOUR_USER@localhost:5432/hamzury?schema=public
# ADMIN_PASSWORD=...
# ADMIN_SECRET=...   # long random string

npm install
npx prisma migrate dev --name init
npm run dev
```

- Site: http://localhost:3000
- Staff desk: http://localhost:3000/admin/login

Receipt files are stored in `uploads/receipts/` (not public). Staff view them through authenticated routes.

If you prefer Docker for Postgres:

```bash
docker compose up -d
# then set DATABASE_URL=postgresql://hamzury:hamzury@localhost:5432/hamzury?schema=public
```
