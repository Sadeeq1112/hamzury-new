import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { saveReceipt, removeReceipt } from "@/lib/uploads";
import { APPLICATION_FEE } from "@/lib/catalog";
import type { PaymentType } from "@prisma/client";

export async function POST(req: Request, { params }: { params: Promise<{ ref: string }> }) {
  const { ref: raw } = await params;
  const ref = raw.trim().toUpperCase();
  const app = await prisma.application.findUnique({
    where: { ref },
    include: { payments: true }
  });
  if (!app) return NextResponse.json({ error: "We do not have that reference." }, { status: 404 });

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Upload the receipt as a file." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Choose a receipt to upload." }, { status: 400 });
  }

  const type = String(form.get("type") || "APPLICATION_FEE") as PaymentType;
  if (type !== "APPLICATION_FEE" && type !== "PROGRAMME_FEE") {
    return NextResponse.json({ error: "Unknown payment type." }, { status: 400 });
  }

  if (type === "PROGRAMME_FEE") {
    const appFee = app.payments.find((p) => p.type === "APPLICATION_FEE");
    if (!appFee?.receiptPath) {
      return NextResponse.json(
        { error: "Upload your application-fee receipt first." },
        { status: 400 }
      );
    }
  }

  let saved;
  try {
    saved = await saveReceipt(ref, file);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not store that file.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const amount =
    type === "APPLICATION_FEE" ? APPLICATION_FEE : app.programmeFee ?? 0;

  const existing = app.payments.find((p) => p.type === type);
  if (existing) {
    await removeReceipt(existing.receiptPath);
    const updated = await prisma.payment.update({
      where: { id: existing.id },
      data: {
        amount,
        status: "PENDING",
        receiptPath: saved.rel,
        receiptName: saved.original,
        receiptMime: saved.mime
      }
    });
    return NextResponse.json({ ok: true, paymentId: updated.id, type: updated.type });
  }

  const created = await prisma.payment.create({
    data: {
      applicationId: app.id,
      type,
      amount,
      status: "PENDING",
      receiptPath: saved.rel,
      receiptName: saved.original,
      receiptMime: saved.mime
    }
  });

  return NextResponse.json({ ok: true, paymentId: created.id, type: created.type }, { status: 201 });
}
