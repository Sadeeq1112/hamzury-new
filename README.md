# Hamzury

Next.js site with a PostgreSQL backend for applications, payment receipts, and partnership / sponsorship enquiries.

## What it does

- Public site: the existing Hamzury journey, now saving form data to Postgres
- Applicants upload a transfer receipt (JPG, PNG, WEBP or PDF) instead of relying only on WhatsApp
- Staff desk at `/admin` to review applications, view receipts, and verify or reject payments

## Local setup

PostgreSQL 16 on `localhost:5432`, or Docker:

```bash
docker compose up -d
cp .env.example .env
# DATABASE_URL and DIRECT_URL can be the same locally:
# postgresql://hamzury:hamzury@localhost:5432/hamzury?schema=public
# ADMIN_PASSWORD=...
# ADMIN_SECRET=...   # openssl rand -base64 32

npm install
npx prisma migrate dev
npm run db:seed
npm run dev
# npm run db:clear -- --yes          # wipe applications, payments, enquiries
# npm run db:clear -- --seed --yes   # seeded demo rows only
```

- Site: http://localhost:3000
- Staff desk: http://localhost:3000/admin/login

Locally, receipt files are stored in `uploads/receipts/` (not public). Staff view them through authenticated routes.

## Production on Vercel (Neon + Blob)

Vercel’s filesystem is ephemeral, so receipts must live in **Vercel Blob**. The database is **Neon**.

### 1. Neon

1. Create a Neon project (region close to your Vercel region).
2. Copy **two** connection strings from Neon → Connection details:
   - **Pooled** (hostname contains `-pooler`) → `DATABASE_URL`
   - **Direct** (no `-pooler`) → `DIRECT_URL`
3. Append `?sslmode=require` if it is not already there.

If you add Neon through the Vercel marketplace, it creates `DATABASE_URL` and `DATABASE_URL_UNPOOLED`. Copy `DATABASE_URL_UNPOOLED` into `DIRECT_URL`. Prisma migrations need the direct URL; the app uses the pooled one.

Use a **separate Neon branch** (or a second database) for Preview deployments so `prisma migrate deploy` on a pull request cannot change production.

### 2. Vercel Blob (private)

Receipts are private: they are never a public URL. Staff still view them at `/api/admin/receipts/:id` after login.

1. In the Vercel project: **Storage → Create Database → Blob**.
2. Set access to **Private**.
3. Connect the store to this project. Vercel sets `BLOB_READ_WRITE_TOKEN` (and OIDC) on the deployment.

On Vercel the site uploads receipts straight to Blob from the browser (avoids the 4.5 MB function body limit). Locally it still posts the file to the API and writes to disk.

### 3. Environment variables

Set these on the Vercel project for Production (and Preview, with a preview database):

| Name | Value |
| --- | --- |
| `DATABASE_URL` | Neon **pooled** connection string |
| `DIRECT_URL` | Neon **direct** connection string |
| `ADMIN_PASSWORD` | Staff desk password |
| `ADMIN_SECRET` | Long random string (`openssl rand -base64 32`) |
| `BLOB_READ_WRITE_TOKEN` | Set automatically when the Blob store is connected. Required for browser uploads (OIDC is not enough). Pull locally with `npx vercel env pull .env.local` |
| `BLOB_ACCESS` | `private` or `public` — must match the Blob store. Default `private` |

### 4. Deploy

```bash
npx vercel
```

Or connect the GitHub repo in the Vercel dashboard. The `vercel-build` script runs `prisma migrate deploy` then `next build`.

After the first production deploy, seed the Neon database once (optional):

```bash
DATABASE_URL="postgresql://..." DIRECT_URL="postgresql://..." npm run db:seed
```

If `BLOB_READ_WRITE_TOKEN` is in that shell environment, the seed uploads placeholder receipts to Blob. Otherwise it writes them next to the project (useless on Neon — skip token-less seeding against production).

To remove that data (and any other applications / enquiries):

```bash
DATABASE_URL="postgresql://..." DIRECT_URL="postgresql://..." BLOB_READ_WRITE_TOKEN="…" npm run db:clear -- --yes
# or only the seeded demo rows:
npm run db:clear -- --seed --yes
```

### 5. Check

- Public site loads
- Apply, upload a receipt, confirm the row appears at `/admin`
- Open the receipt from the desk (it is streamed from Blob, not a public link)
- Log out; `/api/admin/receipts/:id` returns 401
