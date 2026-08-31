import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { trackUpdateSchema, zodError } from "@/lib/validation";
import { programmeFor } from "@/lib/catalog";

export async function POST(req: Request, { params }: { params: Promise<{ ref: string }> }) {
  const { ref: raw } = await params;
  const ref = raw.trim().toUpperCase();
  const app = await prisma.application.findUnique({ where: { ref } });
  if (!app) return NextResponse.json({ error: "We do not have that reference." }, { status: 404 });
  if (app.status !== "VERIFIED") {
    return NextResponse.json({ error: "This application is not confirmed yet." }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const parsed = trackUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: zodError(parsed.error) }, { status: 400 });
  }

  const programme = programmeFor(app.route, parsed.data.track, parsed.data.siwes ?? app.siwes);
  const updated = await prisma.application.update({
    where: { id: app.id },
    data: {
      track: parsed.data.track,
      siwes: parsed.data.siwes ?? app.siwes,
      programmeLabel: programme.label,
      programmeFee: programme.amount
    }
  });

  return NextResponse.json({
    ref: updated.ref,
    track: updated.track,
    programmeLabel: updated.programmeLabel,
    programmeFee: updated.programmeFee
  });
}
