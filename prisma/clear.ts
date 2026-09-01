import "dotenv/config";
import { rm } from "fs/promises";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { del, list } from "@vercel/blob";
import { blobAuth, blobEnabled, removeReceipt, UPLOAD_ROOT } from "../src/lib/uploads";

const prisma = new PrismaClient({
  datasources: {
    db: { url: process.env.DIRECT_URL || process.env.DATABASE_URL }
  }
});

const SEED_REFS = [
  "HMZ-2026-DEMO1",
  "HMZ-2026-DEMO2",
  "HMZ-2026-DEMO3",
  "HMZ-2026-JR001",
  "HMZ-2026-SIW01",
  "HMZ-2026-FND01",
  "HMZ-2026-ECO01"
];

const SEED_ENQUIRY_EMAILS = ["halima.yusuf@example.com", "tunde.bakare@example.com"];

const args = new Set(process.argv.slice(2));
const confirmed = args.has("--yes") || args.has("-y");
const seedOnly = args.has("--seed");

async function deleteBlobPrefix(prefix: string) {
  if (!blobEnabled()) return 0;
  let deleted = 0;
  let cursor: string | undefined;
  do {
    const page = await list({ prefix, cursor, limit: 250, ...blobAuth() });
    if (page.blobs.length) {
      await del(page.blobs.map((b) => b.url), blobAuth());
      deleted += page.blobs.length;
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return deleted;
}

async function main() {
  const appWhere = seedOnly
    ? {
        OR: [{ ref: { in: SEED_REFS } }, { email: { endsWith: "@example.com" } }]
      }
    : {};
  const enquiryWhere = seedOnly
    ? {
        OR: [
          { email: { in: SEED_ENQUIRY_EMAILS } },
          { email: { endsWith: "@example.com" } }
        ]
      }
    : {};

  const [applications, enquiries] = await Promise.all([
    prisma.application.findMany({
      where: appWhere,
      include: { payments: true }
    }),
    prisma.enquiry.findMany({ where: enquiryWhere })
  ]);

  const payments = applications.flatMap((a) => a.payments);
  const receiptPaths = payments.map((p) => p.receiptPath).filter((p): p is string => Boolean(p));

  console.log(seedOnly ? "Seed / demo records:" : "All records:");
  console.log(`  ${applications.length} applications`);
  console.log(`  ${payments.length} payments`);
  console.log(`  ${enquiries.length} enquiries`);
  console.log(`  ${receiptPaths.length} receipt files on record`);

  if (!applications.length && !enquiries.length) {
    console.log("Nothing to delete.");
    return;
  }

  if (!confirmed) {
    console.log("");
    console.log("Re-run with --yes to delete.");
    if (!seedOnly) console.log("Add --seed to remove only the seeded demo rows.");
    process.exitCode = 1;
    return;
  }

  for (const rel of receiptPaths) {
    await removeReceipt(rel);
  }

  let blobs = 0;
  if (seedOnly) {
    for (const ref of [...new Set(applications.map((a) => a.ref))]) {
      blobs += await deleteBlobPrefix(`receipts/${ref}/`);
    }
  } else {
    blobs = await deleteBlobPrefix("receipts/");
    await rm(UPLOAD_ROOT, { recursive: true, force: true });
  }

  for (const app of applications) {
    const dir = path.join(UPLOAD_ROOT, app.ref.replace(/[^A-Z0-9-]/gi, ""));
    await rm(dir, { recursive: true, force: true }).catch(() => undefined);
  }

  const enquiryIds = enquiries.map((e) => e.id);
  const appIds = applications.map((a) => a.id);

  if (enquiryIds.length) {
    await prisma.enquiry.deleteMany({ where: { id: { in: enquiryIds } } });
  }
  if (appIds.length) {
    await prisma.application.deleteMany({ where: { id: { in: appIds } } });
  }

  console.log(
    `Deleted. ${blobs ? `${blobs} extra Blob object(s) under receipts/ also removed.` : "Receipt files cleaned up."}`
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
