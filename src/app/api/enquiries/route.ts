import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { enquirySchema, zodError } from "@/lib/validation";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const parsed = enquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: zodError(parsed.error) }, { status: 400 });
  }

  const d = parsed.data;
  const created = await prisma.enquiry.create({
    data: {
      kind: d.kind === "partner" ? "PARTNER" : "SPONSOR",
      org: d.org,
      orgType: d.orgType || null,
      contact: d.contact || null,
      phone: d.phone,
      email: d.email || null,
      does: d.does || null,
      why: d.why || null,
      bring: d.bring || null,
      want: d.want || null,
      outcome: d.outcome || null,
      area: d.area || null,
      support: d.support || null,
      report: d.report || null
    }
  });

  return NextResponse.json({ ok: true, id: created.id }, { status: 201 });
}
