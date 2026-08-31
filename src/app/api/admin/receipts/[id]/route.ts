import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { readReceipt } from "@/lib/uploads";
import { getAdminSession } from "@/lib/auth";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
  }
  const { id } = await params;
  const payment = await prisma.payment.findUnique({ where: { id } });
  if (!payment?.receiptPath) {
    return NextResponse.json({ error: "No receipt on this payment." }, { status: 404 });
  }
  try {
    const buf = await readReceipt(payment.receiptPath);
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": payment.receiptMime || "application/octet-stream",
        "Content-Disposition": `inline; filename="${encodeURIComponent(payment.receiptName || "receipt")}"`,
        "Cache-Control": "private, max-age=3600"
      }
    });
  } catch {
    return NextResponse.json({ error: "The file is missing." }, { status: 404 });
  }
}
