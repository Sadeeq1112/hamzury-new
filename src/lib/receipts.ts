import type { PaymentType } from "@prisma/client";
import { prisma } from "./db";
import { removeReceipt } from "./uploads";

export async function upsertReceipt(opts: {
  applicationId: string;
  type: PaymentType;
  amount: number;
  receiptPath: string;
  receiptName: string;
  receiptMime: string;
  existing?: { id: string; receiptPath: string | null } | null;
}) {
  if (opts.existing) {
    if (opts.existing.receiptPath && opts.existing.receiptPath !== opts.receiptPath) {
      await removeReceipt(opts.existing.receiptPath);
    }
    return prisma.payment.update({
      where: { id: opts.existing.id },
      data: {
        amount: opts.amount,
        status: "PENDING",
        receiptPath: opts.receiptPath,
        receiptName: opts.receiptName,
        receiptMime: opts.receiptMime
      }
    });
  }

  return prisma.payment.create({
    data: {
      applicationId: opts.applicationId,
      type: opts.type,
      amount: opts.amount,
      status: "PENDING",
      receiptPath: opts.receiptPath,
      receiptName: opts.receiptName,
      receiptMime: opts.receiptMime
    }
  });
}
