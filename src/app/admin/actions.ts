"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import type { ApplicationStatus, PaymentStatus } from "@prisma/client";

async function requireAdmin() {
  if (!(await getAdminSession())) redirect("/admin/login");
}

function refresh(ref?: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/applications");
  revalidatePath("/admin/receipts");
  revalidatePath("/admin/enquiries");
  if (ref) revalidatePath(`/admin/applications/${ref}`);
}

export async function setApplicationStatus(formData: FormData) {
  await requireAdmin();
  const ref = String(formData.get("ref") || "").toUpperCase();
  const status = String(formData.get("status") || "") as ApplicationStatus;
  const notes = String(formData.get("notes") || "").trim() || null;
  if (!["PENDING", "VERIFIED", "REJECTED"].includes(status)) return;
  await prisma.application.update({
    where: { ref },
    data: {
      status,
      notes,
      verifiedAt: status === "VERIFIED" ? new Date() : null
    }
  });
  refresh(ref);
}

export async function setPaymentStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "") as PaymentStatus;
  const notes = String(formData.get("notes") || "").trim() || null;
  if (!["PENDING", "VERIFIED", "REJECTED"].includes(status)) return;

  const payment = await prisma.payment.update({
    where: { id },
    data: { status, notes },
    include: { application: true }
  });

  if (payment.type === "APPLICATION_FEE") {
    await prisma.application.update({
      where: { id: payment.applicationId },
      data: {
        status: status === "VERIFIED" ? "VERIFIED" : status === "REJECTED" ? "REJECTED" : "PENDING",
        verifiedAt: status === "VERIFIED" ? new Date() : null
      }
    });
  }

  refresh(payment.application.ref);
}
