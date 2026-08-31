import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { applicationSchema, zodError } from "@/lib/validation";
import { uniqueRef, isRef } from "@/lib/refs";
import { APPLICATION_FEE, programmeFor } from "@/lib/catalog";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const ref = (url.searchParams.get("ref") || "").trim().toUpperCase();
  if (!isRef(ref)) {
    return NextResponse.json({ error: "That does not look like a reference.", status: "NOT_FOUND" }, { status: 400 });
  }

  const app = await prisma.application.findUnique({
    where: { ref },
    include: { payments: { orderBy: { createdAt: "asc" } } }
  });

  if (!app) {
    return NextResponse.json({ status: "NOT_FOUND", ref }, { status: 404 });
  }

  return NextResponse.json({
    ref: app.ref,
    status: app.status,
    name: app.name,
    route: app.route,
    track: app.track,
    siwes: app.siwes,
    level: app.level,
    programmeLabel: app.programmeLabel,
    programmeFee: app.programmeFee,
    payments: app.payments.map((p) => ({
      id: p.id,
      type: p.type,
      amount: p.amount,
      status: p.status,
      hasReceipt: Boolean(p.receiptPath),
      createdAt: p.createdAt
    }))
  });
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const parsed = applicationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: zodError(parsed.error) }, { status: 400 });
  }

  const data = parsed.data;
  const programme = programmeFor(data.route, data.track, data.siwes);

  const fields = {
    name: data.name,
    email: data.email,
    phone: data.phone,
    location: data.location,
    gender: data.gender || null,
    state: data.state || null,
    occupation: data.occupation || null,
    education: data.education || null,
    heardAbout: data.heardAbout || null,
    route: data.route,
    track: data.track || null,
    siwes: data.siwes || null,
    level: data.level || null,
    age: data.age || null,
    guess: data.guess || null,
    programmeLabel: programme.label,
    programmeFee: programme.amount,
    dob: data.dob || null,
    school: data.school || null,
    cls: data.cls || null,
    interests: data.interests || null,
    guardianName: data.guardianName || null,
    guardianRel: data.guardianRel || null,
    guardianPhone: data.guardianPhone || null,
    guardianEmail: data.guardianEmail || null,
    emergency: data.emergency || null,
    consent: data.consent ?? null
  };

  if (data.ref) {
    const existing = await prisma.application.findUnique({ where: { ref: data.ref.toUpperCase() } });
    if (existing && existing.status === "PENDING") {
      const updated = await prisma.application.update({
        where: { id: existing.id },
        data: fields
      });
      return NextResponse.json({ ref: updated.ref, id: updated.id, status: updated.status });
    }
  }

  const ref = await uniqueRef();
  const created = await prisma.application.create({
    data: {
      ref,
      ...fields,
      payments: {
        create: {
          type: "APPLICATION_FEE",
          amount: APPLICATION_FEE,
          status: "PENDING"
        }
      }
    }
  });

  return NextResponse.json({ ref: created.ref, id: created.id, status: created.status }, { status: 201 });
}
