import "dotenv/config";
import { PrismaClient, type Prisma } from "@prisma/client";
import { APPLICATION_FEE, programmeFor } from "../src/lib/catalog";
import { blobEnabled, storeReceipt } from "../src/lib/uploads";

const prisma = new PrismaClient({
  datasources: {
    db: { url: process.env.DIRECT_URL || process.env.DATABASE_URL }
  }
});

const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64"
);

function daysAgo(n: number) {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

type SeedApp = {
  ref: string;
  days: number;
  status: "PENDING" | "VERIFIED" | "REJECTED";
  notes?: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  gender: string;
  state: string;
  occupation?: string;
  education?: string;
  heardAbout: string;
  route: string;
  track?: string | null;
  siwes?: string | null;
  level?: string | null;
  age?: string | null;
  dob?: string | null;
  school?: string | null;
  cls?: string | null;
  interests?: string | null;
  guardianName?: string | null;
  guardianRel?: string | null;
  guardianPhone?: string | null;
  guardianEmail?: string | null;
  emergency?: string | null;
  consent?: boolean | null;
  appFee: { status: "PENDING" | "VERIFIED" | "REJECTED"; receipt?: boolean; notes?: string };
  progFee?: { status: "PENDING" | "VERIFIED" | "REJECTED"; receipt?: boolean; notes?: string };
};

const apps: SeedApp[] = [
  {
    ref: "HMZ-2026-DEMO1",
    days: 1,
    status: "PENDING",
    name: "Aisha Bello",
    email: "aisha.bello@example.com",
    phone: "08031234567",
    location: "Wuse",
    gender: "Female",
    state: "FCT — Abuja",
    occupation: "Student",
    education: "Bachelor's",
    heardAbout: "Instagram",
    route: "ceo",
    track: "data",
    level: "needs",
    age: "21–25",
    appFee: { status: "PENDING", receipt: true }
  },
  {
    ref: "HMZ-2026-DEMO2",
    days: 3,
    status: "VERIFIED",
    notes: "Application fee matched the account.",
    name: "Chinedu Okafor",
    email: "chinedu.okafor@example.com",
    phone: "08045551234",
    location: "Ikeja",
    gender: "Male",
    state: "Lagos",
    occupation: "Employed",
    education: "HND",
    heardAbout: "A friend or family",
    route: "ceo",
    track: "automation",
    level: "ready",
    age: "26–30",
    appFee: { status: "VERIFIED", receipt: true },
    progFee: { status: "PENDING", receipt: true }
  },
  {
    ref: "HMZ-2026-DEMO3",
    days: 5,
    status: "REJECTED",
    notes: "Receipt does not match the transfer.",
    name: "Fatima Suleiman",
    email: "fatima.suleiman@example.com",
    phone: "08123456789",
    location: "Kano Municipal",
    gender: "Female",
    state: "Kano",
    occupation: "Self-employed",
    education: "ND",
    heardAbout: "WhatsApp",
    route: "ceo",
    track: "brand",
    level: "needs",
    age: "21–25",
    appFee: { status: "REJECTED", receipt: true, notes: "Name on the receipt is different." }
  },
  {
    ref: "HMZ-2026-JR001",
    days: 2,
    status: "PENDING",
    name: "David Adeyemi",
    email: "guardian.adeyemi@example.com",
    phone: "08067140001",
    location: "Ibadan",
    gender: "Male",
    state: "Oyo",
    heardAbout: "School or campus",
    route: "junior",
    track: "software",
    dob: "2012-04-18",
    school: "St. Anne's Secondary School",
    cls: "JSS 3",
    interests: "Software",
    guardianName: "Bola Adeyemi",
    guardianRel: "Mother",
    guardianPhone: "08067140001",
    guardianEmail: "guardian.adeyemi@example.com",
    emergency: "08035551212",
    consent: true,
    appFee: { status: "PENDING", receipt: true }
  },
  {
    ref: "HMZ-2026-SIW01",
    days: 6,
    status: "VERIFIED",
    name: "Ngozi Eze",
    email: "ngozi.eze@example.com",
    phone: "09011223344",
    location: "Enugu",
    gender: "Female",
    state: "Enugu",
    occupation: "Student",
    education: "ND",
    heardAbout: "School or campus",
    route: "siwes",
    siwes: "3",
    level: "ready",
    age: "17–20",
    appFee: { status: "VERIFIED", receipt: true },
    progFee: { status: "VERIFIED", receipt: true }
  },
  {
    ref: "HMZ-2026-FND01",
    days: 8,
    status: "PENDING",
    name: "Ibrahim Musa",
    email: "ibrahim.musa@example.com",
    phone: "07089887766",
    location: "Kaduna",
    gender: "Male",
    state: "Kaduna",
    occupation: "Founder / business owner",
    education: "Bachelor's",
    heardAbout: "An event",
    route: "founder",
    level: "ready",
    age: "31–35",
    appFee: { status: "PENDING" }
  },
  {
    ref: "HMZ-2026-ECO01",
    days: 10,
    status: "VERIFIED",
    notes: "Proven revenue confirmed off-record.",
    name: "Zainab Abdullahi",
    email: "zainab.abdullahi@example.com",
    phone: "08160004444",
    location: "Port Harcourt",
    gender: "Female",
    state: "Rivers",
    occupation: "Founder / business owner",
    education: "Master's",
    heardAbout: "The website",
    route: "ecosystem",
    level: "ready",
    age: "36 and above",
    appFee: { status: "VERIFIED", receipt: true },
    progFee: { status: "PENDING" }
  }
];

const enquiries: Prisma.EnquiryCreateInput[] = [
  {
    kind: "PARTNER",
    org: "Garki Secondary School",
    orgType: "School",
    contact: "Mrs. Halima Yusuf",
    phone: "08022223333",
    email: "halima.yusuf@example.com",
    does: "Government secondary school in Abuja looking for a structured digital skills programme.",
    why: "Our SS2 and SS3 students need a practical route into technology, not another theory club.",
    bring: "Classroom space after 2pm and a teacher coordinator.",
    want: "A Junior Innovator cohort hosted on campus next term.",
    outcome: "A repeatable after-school programme with evidence we can show parents.",
    createdAt: daysAgo(4)
  },
  {
    kind: "SPONSOR",
    org: "Northstar Foundation",
    orgType: "Foundation",
    contact: "Tunde Bakare",
    phone: "08077778888",
    email: "tunde.bakare@example.com",
    area: "Scholarships",
    support: "Fund application and programme fees for ten Innovator → CEO applicants from Kano and Kaduna.",
    report: "A termly list of names, tracks, and whether they completed the month.",
    createdAt: daysAgo(7)
  }
];

async function receiptFor(ref: string, label: string) {
  const remoteDb = /neon\.tech|pooler/i.test(process.env.DATABASE_URL || "");
  if (remoteDb && !blobEnabled()) {
    console.warn(`Skipping receipt file for ${ref} (set BLOB_READ_WRITE_TOKEN to upload to Blob).`);
    return null;
  }
  return storeReceipt(ref, PNG, "image/png", label);
}

async function main() {
  await prisma.enquiry.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.application.deleteMany();

  for (const row of apps) {
    const programme = programmeFor(row.route, row.track, row.siwes);
    const submittedAt = daysAgo(row.days);
    const created = await prisma.application.create({
      data: {
        ref: row.ref,
        status: row.status,
        notes: row.notes ?? null,
        name: row.name,
        email: row.email,
        phone: row.phone,
        location: row.location,
        gender: row.gender,
        state: row.state,
        occupation: row.occupation ?? null,
        education: row.education ?? null,
        heardAbout: row.heardAbout,
        route: row.route,
        track: row.track ?? null,
        siwes: row.siwes ?? null,
        level: row.level ?? null,
        age: row.age ?? null,
        programmeLabel: programme.label,
        programmeFee: programme.amount,
        dob: row.dob ?? null,
        school: row.school ?? null,
        cls: row.cls ?? null,
        interests: row.interests ?? null,
        guardianName: row.guardianName ?? null,
        guardianRel: row.guardianRel ?? null,
        guardianPhone: row.guardianPhone ?? null,
        guardianEmail: row.guardianEmail ?? null,
        emergency: row.emergency ?? null,
        consent: row.consent ?? null,
        submittedAt,
        createdAt: submittedAt,
        verifiedAt: row.status === "VERIFIED" ? daysAgo(Math.max(0, row.days - 1)) : null
      }
    });

    const appSaved = row.appFee.receipt ? await receiptFor(row.ref, "application-fee.png") : null;
    await prisma.payment.create({
      data: {
        applicationId: created.id,
        type: "APPLICATION_FEE",
        amount: APPLICATION_FEE,
        status: row.appFee.status,
        notes: row.appFee.notes ?? null,
        receiptPath: appSaved?.rel ?? null,
        receiptName: appSaved?.original ?? null,
        receiptMime: appSaved?.mime ?? null,
        createdAt: submittedAt
      }
    });

    if (row.progFee && programme.amount) {
      const progSaved = row.progFee.receipt ? await receiptFor(row.ref, "programme-fee.png") : null;
      await prisma.payment.create({
        data: {
          applicationId: created.id,
          type: "PROGRAMME_FEE",
          amount: programme.amount,
          status: row.progFee.status,
          notes: row.progFee.notes ?? null,
          receiptPath: progSaved?.rel ?? null,
          receiptName: progSaved?.original ?? null,
          receiptMime: progSaved?.mime ?? null,
          createdAt: daysAgo(Math.max(0, row.days - 1))
        }
      });
    }
  }

  for (const enquiry of enquiries) {
    await prisma.enquiry.create({ data: enquiry });
  }

  console.log(`Seeded ${apps.length} applications and ${enquiries.length} enquiries.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
